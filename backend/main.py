"""
Radar de Oportunidades Inteligente - Backend FastAPI
Integrado com OpenAI, IBGE API, Google Cloud Speech-to-Text
"""
import base64
import os
import re
from typing import Dict, Any

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from models import (
    AnalyzeRequest, AnalyzeResponse,
    VoiceRequest, VoiceResponse,
    SimulateRequest, SimulateResponse,
    GameScoreRequest, GameScoreResponse,
    MetricDetail, SimilarRegion, YearProjection,
)
from ml_engine import (
    calculate_opportunity_score,
    find_similar_regions,
    simulate_scenario,
    generate_explanation,
    calculate_game_score,
    get_all_regions,
    get_all_businesses,
    REGIONS_DATA,
    BUSINESSES_DATA,
)

# Importa serviço de IA (Groq - GRATUITO)
from groq_service import (
    generate_ai_explanation,
    generate_simulation_insights,
    test_groq_connection,
)
from ibge_service import (
    get_region_demographics,
    test_ibge_connection,
)
from speech_service import (
    transcribe_audio,
    test_speech_connection,
)

# Importa AI Hotspot Finder
from ai_hotspot_finder import AIHotspotFinder
from public_data_service import analyze_public_data, PublicDataUnavailable

app = FastAPI(
    title="Radar de Oportunidades Inteligente",
    description="API para análise de oportunidades de negócio em Smart Cities",
    version="1.0.0",
)

# CORS: aceita o frontend do GitHub Pages + localhost para desenvolvimento
frontend_url = os.getenv("FRONTEND_URL", "https://enzotoshi.github.io")
allowed_origins = [
    frontend_url,
    "http://localhost:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Health Check ────────────────────────────────────────────────────────────────

@app.get("/")
def health_check():
    """Health check com status das APIs integradas."""
    groq_status = test_groq_connection()
    ibge_status = test_ibge_connection()
    speech_status = test_speech_connection()
    
    return {
        "status": "online",
        "service": "Radar de Oportunidades Inteligente",
        "version": "2.0.0",
        "apis": {
            "groq_ai": "connected" if groq_status else "fallback mode",
            "ibge": "connected" if ibge_status else "fallback mode",
            "google_speech": "connected" if speech_status else "fallback mode",
        },
    }


# ── Análise de Oportunidade ─────────────────────────────────────────────────────

@app.post("/api/analyze", response_model=AnalyzeResponse, deprecated=True)
def analyze_opportunity(req: AnalyzeRequest):
    """Impede análises sem coordenadas, que antes usavam dados cadastrados fictícios."""
    raise HTTPException(
        status_code=422,
        detail="Selecione um endereço ou ponto no mapa e use /api/analyze-with-ai com latitude e longitude.",
    )


def _build_recommendation(score: float, risk: str) -> str:
    if score >= 75:
        return "✅ Fortemente recomendado — alta probabilidade de sucesso nesta combinação."
    elif score >= 60:
        return "👍 Recomendado — boa oportunidade com riscos gerenciáveis."
    elif score >= 45:
        return "⚠️ Análise cuidadosa necessária — oportunidade moderada com riscos relevantes."
    elif score >= 30:
        return "🔶 Não recomendado sem estratégia diferenciada — concorrência ou perfil desfavorável."
    else:
        return "❌ Alto risco — reconsidere a região ou o tipo de negócio."


# ── Transcrição de Voz ──────────────────────────────────────────────────────────

@app.post("/api/voice", response_model=VoiceResponse)
def process_voice(req: VoiceRequest):
    """
    Recebe áudio em base64, transcreve usando Google Cloud Speech-to-Text
    e extrai entidades (negócio, região, orçamento, público).
    """
    try:
        audio_bytes = base64.b64decode(req.audio_base64)
    except Exception:
        raise HTTPException(status_code=400, detail="Áudio base64 inválido.")

    # Transcreve usando Google Cloud Speech-to-Text
    try:
        result = transcribe_audio(audio_bytes, language_code="pt-BR")
        
        return VoiceResponse(
            transcript=result["transcript"],
            entities=result["entities"],
            confidence=result["confidence"],
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Erro ao processar áudio: {str(e)}"
        )


# ── Simulação de Cenários ───────────────────────────────────────────────────────

@app.post("/api/simulate", response_model=SimulateResponse)
def simulate(req: SimulateRequest):
    """
    Simula cenário futuro com parâmetros ajustáveis.
    Usa OpenAI para gerar insights inteligentes quando disponível.
    """
    region_id = req.region.lower().replace(" ", "_")
    business_id = req.business_type.lower().replace(" ", "_")

    if region_id not in REGIONS_DATA:
        raise HTTPException(status_code=404, detail=f"Região '{req.region}' não encontrada.")
    if business_id not in BUSINESSES_DATA:
        raise HTTPException(status_code=404, detail=f"Tipo de negócio '{req.business_type}' não encontrado.")

    result = simulate_scenario(
        region_id, business_id, req.budget,
        req.population_growth, req.income_growth, req.new_competitors,
    )

    delta = result["delta"]
    
    # Tenta gerar explicação com Groq AI
    try:
        explanation = generate_simulation_insights(
            original_score=result["original_score"],
            projected_score=result["projected_score"],
            population_growth=req.population_growth,
            income_growth=req.income_growth,
            new_competitors=req.new_competitors,
        )
    except Exception as e:
        print(f"Erro ao gerar insights com IA: {e}")
        # Fallback para explicação simples
        if delta > 10:
            explanation = f"Cenário otimista: o score deve subir {delta:.1f} pontos em 5 anos."
        elif delta > 0:
            explanation = f"Cenário levemente positivo: melhora de {delta:.1f} pontos."
        elif delta > -10:
            explanation = f"Cenário estável com leve retração de {abs(delta):.1f} pontos."
        else:
            explanation = f"Cenário de alerta: queda de {abs(delta):.1f} pontos projetada."

    key_factors = []
    if req.population_growth > 10:
        key_factors.append(f"Crescimento populacional de +{req.population_growth:.0f}% amplia o público-alvo")
    if req.income_growth > 15:
        key_factors.append(f"Aumento de renda de +{req.income_growth:.0f}% eleva o poder de compra")
    if req.new_competitors > 5:
        key_factors.append(f"{req.new_competitors} novos concorrentes pressionam as margens")
    if not key_factors:
        key_factors.append("Parâmetros moderados resultam em estabilidade do mercado")

    return SimulateResponse(
        original_score=result["original_score"],
        projected_score=result["projected_score"],
        delta=result["delta"],
        projections=[YearProjection(**p) for p in result["projections"]],
        explanation=explanation,
        key_factors=key_factors,
    )


# ── Gamificação ─────────────────────────────────────────────────────────────────

@app.post("/api/gamification/score", response_model=GameScoreResponse)
def gamification_score(req: GameScoreRequest):
    region_id = req.region.lower().replace(" ", "_")
    business_id = req.business_type.lower().replace(" ", "_")

    if region_id not in REGIONS_DATA:
        raise HTTPException(status_code=404, detail=f"Região '{req.region}' não encontrada.")
    if business_id not in BUSINESSES_DATA:
        raise HTTPException(status_code=404, detail=f"Tipo de negócio '{req.business_type}' não encontrado.")

    result = calculate_game_score(region_id, business_id, req.budget_used, req.total_budget)

    return GameScoreResponse(**result)


# ── Dados de Referência ─────────────────────────────────────────────────────────

@app.get("/api/regions")
def list_regions():
    regions = get_all_regions()
    return {"regions": regions, "total": len(regions)}


@app.get("/api/businesses")
def list_businesses():
    businesses = get_all_businesses()
    # Retorna apenas array de nomes (string) para o frontend
    return [b["name"] for b in businesses]


# ── AI Hotspot Finder ───────────────────────────────────────────────────────────

@app.post("/api/hotspots/find")
def find_hotspots(
    city: str = "São Paulo",
    business_type: str = "cafeteria",
    num_hotspots: int = 10
):
    """
    Encontra automaticamente os melhores hotspots para um negócio
    usando análise real do Google Maps API + IA.
    
    Parâmetros:
    - city: Nome da cidade (ex: "São Paulo", "Rio de Janeiro")
    - business_type: Tipo de negócio (ex: "cafeteria", "academia")
    - num_hotspots: Número de hotspots para retornar (padrão: 10)
    """
    try:
        finder = AIHotspotFinder()
        hotspots = finder.find_hotspots(
            city=city,
            business_type=business_type,
            num_hotspots=num_hotspots
        )
        
        return {
            "city": city,
            "business_type": business_type,
            "total_found": len(hotspots),
            "hotspots": hotspots,
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Erro ao buscar hotspots: {str(e)}"
        )


@app.post("/api/hotspots/analyze-location")
def analyze_custom_location(
    lat: float,
    lng: float,
    business_type: str = "cafeteria",
    location_name: str = None
):
    """
    Analisa uma localização customizada (usuário clica no mapa)
    e retorna análise de oportunidade baseada em dados reais.
    
    Parâmetros:
    - lat: Latitude
    - lng: Longitude
    - business_type: Tipo de negócio
    - location_name: Nome opcional da localização
    """
    try:
        finder = AIHotspotFinder()
        analysis = finder.analyze_custom_location(
            lat=lat,
            lng=lng,
            business_type=business_type,
            location_name=location_name
        )
        
        return analysis
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Erro ao analisar localização: {str(e)}"
        )


# ── Status das APIs ──────────────────────────────────────────────────────────────

@app.get("/api/status")
def api_status():
    """
    Retorna o status de conexão de todas as APIs integradas.
    """
    groq_connected = test_groq_connection()
    ibge_connected = test_ibge_connection()
    speech_connected = test_speech_connection()
    
    return {
        "apis": {
            "groq_ai": {
                "status": "connected" if groq_connected else "disconnected",
                "description": "IA gratuita (Llama 3) para explicações inteligentes",
                "fallback": "Explicações baseadas em regras (disponível)",
            },
            "ibge": {
                "status": "connected" if ibge_connected else "disconnected",
                "description": "Dados demográficos reais de municípios brasileiros",
                "fallback": "Dados simulados (disponível)",
            },
            "google_speech": {
                "status": "connected" if speech_connected else "disconnected",
                "description": "Transcreve áudio para texto",
                "fallback": "Transcrição simulada (disponível)",
            },
        },
        "overall_status": "operational" if any([groq_connected, ibge_connected, speech_connected]) else "fallback_mode",
    }


# ── Análise de Localização com IA ──────────────────────────────────────────────

from pydantic import BaseModel

class AIAnalysisRequest(BaseModel):
    address: str
    business_type: str
    lat: float
    lng: float
    budget: float = 100000

@app.post("/api/analyze-with-ai")
def analyze_location_with_ai(request: AIAnalysisRequest):
    """
    Analisa uma localização com dados públicos reais do OSM e IBGE.

    Não há fallback simulado: se a fonte principal estiver indisponível, a API
    responde com erro 503 em vez de fabricar valores.
    """
    return _analyze_location_with_public_data(request)
def _competition_level(density: float) -> str:
    if density < 1:
        return "Baixa"
    if density < 3:
        return "Moderada"
    if density < 6:
        return "Alta"
    return "Muito alta"


def _format_brl(value: float) -> str:
    return f"R$ {value:,.2f}".replace(",", "X").replace(".", ",").replace("X", ".")


def _format_compact_brl(value: float) -> str:
    if value >= 1_000_000_000_000:
        return f"R$ {value / 1_000_000_000_000:.2f} tri".replace(".", ",")
    if value >= 1_000_000_000:
        return f"R$ {value / 1_000_000_000:.2f} bi".replace(".", ",")
    if value >= 1_000_000:
        return f"R$ {value / 1_000_000:.2f} mi".replace(".", ",")
    return _format_brl(value)


def _analyze_location_with_public_data(request: AIAnalysisRequest) -> Dict[str, Any]:
    try:
        analysis = analyze_public_data(
            request.lat, request.lng, request.business_type, radius=1500
        )
        osm = analysis["osm"]
        ibge = analysis["ibge"]
        score = analysis["score"]["overall"]
        population = analysis.get("population_area")
        gdp = ibge.get("gdp")
        city = ibge.get("city")

        population_value = (
            f"{int(population['value']):,}".replace(",", ".")
            if population else "Indisponível"
        )
        # A variável 37 da tabela 5938 é publicada em milhares de reais.
        gdp_value = _format_compact_brl(gdp["value"] * 1000) if gdp else "Indisponível"
        competition_level = _competition_level(osm["competitor_density"])
        risk_level = "low" if score >= 70 else "medium" if score >= 45 else "high"
        place_name = city["name"] if city else request.address

        explanation = (
            f"Foram encontrados {osm['competitor_count']} estabelecimentos compatíveis "
            f"com {request.business_type} em um raio de {analysis['radius_meters'] / 1000:.1f} km "
            f"de {request.address}, resultando em densidade de "
            f"{osm['competitor_density']:.2f} concorrentes/km² ({competition_level.lower()}). "
            f"O OpenStreetMap também registra {osm['infrastructure_count']} equipamentos de "
            f"infraestrutura e {osm['transport_count']} opções ou pontos de mobilidade nesse raio.\n\n"
            f"A população exibida é uma estimativa em grade de 100 m do WorldPop, "
            f"somada somente dentro do mesmo raio de 1,5 km. O índice é calculado "
            f"somente dos registros do OSM: 45% concorrência, 30% infraestrutura e "
            f"25% mobilidade. A cobertura do "
            "OpenStreetMap varia por região; confirme a concorrência em pesquisa de campo."
        )

        markers = [
            {
                "id": item["id"],
                "name": item["name"],
                "category": request.business_type,
                "lat": item["lat"],
                "lng": item["lng"],
                "competition": competition_level,
                "potential": score,
                "icon": "store",
                "color": "blue",
            }
            for item in osm["competitors"]
        ]

        return {
            "opportunity_score": score,
            "metrics": {
                "population": {
                    "value": population_value,
                    "label": "Pessoas na área",
                    "description": f"Estimativa WorldPop {population['year']} · raio de 1,5 km" if population else "WorldPop indisponível nesta consulta",
                },
                "gdp": {
                    "value": gdp_value,
                    "label": "PIB municipal",
                    "description": f"IBGE/SIDRA tabela 5938, {gdp['year']}" if gdp else "IBGE não retornou o dado",
                },
                "competition": {
                    "value": str(osm["competitor_count"]),
                    "label": "Concorrentes no OSM",
                    "description": f"Raio de 1,5 km · {osm['competitor_density']:.2f}/km²",
                },
                "mobility": {
                    "value": str(osm["transport_count"]),
                    "label": "Pontos de mobilidade",
                    "description": "Transporte e estacionamento mapeados no OSM",
                },
            },
            "explanation": explanation,
            "risk_level": risk_level,
            "estimated_roi": "Não calculado sem dados financeiros reais",
            "recommendation": _build_recommendation(score, risk_level),
            "similar_regions": [],
            "location": {"address": request.address, "lat": request.lat, "lng": request.lng},
            "business_markers": markers,
            "sources": analysis["sources"],
            "collected_at": analysis["collected_at"],
            "methodology": analysis["score"],
        }
    except PublicDataUnavailable as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    except Exception as exc:
        print(f"Erro na análise com dados públicos: {exc}")
        raise HTTPException(
            status_code=500, detail=f"Erro na análise com dados públicos: {exc}"
        ) from exc
