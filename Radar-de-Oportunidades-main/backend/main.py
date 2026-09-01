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

# Importa novos serviços de APIs
from openai_service import (
    generate_ai_explanation,
    generate_simulation_insights,
    test_openai_connection,
)
from ibge_service import (
    get_region_demographics,
    test_ibge_connection,
)
from speech_service import (
    transcribe_audio,
    test_speech_connection,
)

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
    openai_status = test_openai_connection()
    ibge_status = test_ibge_connection()
    speech_status = test_speech_connection()
    
    return {
        "status": "online",
        "service": "Radar de Oportunidades Inteligente",
        "version": "2.0.0",
        "apis": {
            "openai": "connected" if openai_status else "fallback mode",
            "ibge": "connected" if ibge_status else "fallback mode",
            "google_speech": "connected" if speech_status else "fallback mode",
        },
    }


# ── Análise de Oportunidade ─────────────────────────────────────────────────────

@app.post("/api/analyze", response_model=AnalyzeResponse)
def analyze_opportunity(req: AnalyzeRequest):
    """
    Analisa a oportunidade de negócio para uma região e tipo de negócio.
    Retorna score, métricas detalhadas e explicação gerada por IA (OpenAI).
    Dados demográficos reais do IBGE quando disponível.
    """
    region_id = req.region.lower().replace(" ", "_")
    business_id = req.business_type.lower().replace(" ", "_")

    if region_id not in REGIONS_DATA:
        raise HTTPException(status_code=404, detail=f"Região '{req.region}' não encontrada.")
    if business_id not in BUSINESSES_DATA:
        raise HTTPException(status_code=404, detail=f"Tipo de negócio '{req.business_type}' não encontrado.")

    # Busca dados demográficos do IBGE
    ibge_demographics = get_region_demographics(region_id)
    
    # Calcula score de oportunidade
    result = calculate_opportunity_score(region_id, business_id, req.budget)
    score = result["score"]
    raw_metrics = result["metrics"]
    region_data = result["region"]
    business_data = result["business"]

    # Atualiza dados da região com informações do IBGE se disponível
    if ibge_demographics.get("population"):
        region_data["ibge_population"] = ibge_demographics["population"]
        region_data["ibge_gdp_per_capita"] = ibge_demographics.get("gdp_per_capita")
        region_data["data_source"] = ibge_demographics["data_source"]

    # Tenta gerar explicação com OpenAI
    try:
        explanation = generate_ai_explanation(
            region=region_data["name"],
            business_type=business_data["name"],
            score=score,
            metrics=raw_metrics,
            region_data=region_data,
            business_data=business_data,
        )
        # Determina risk_level baseado no score
        if score >= 70:
            risk_level = "low"
            roi = "18% a 35% a.a."
        elif score >= 50:
            risk_level = "medium"
            roi = "8% a 18% a.a."
        elif score >= 35:
            risk_level = "medium"
            roi = "0% a 10% a.a."
        else:
            risk_level = "high"
            roi = "negativo no curto prazo"
    except Exception as e:
        print(f"Erro ao gerar explicação com OpenAI: {e}")
        # Fallback para explicação simples
        explanation, risk_level, roi = generate_explanation(region_id, business_id, score, raw_metrics)

    similar = find_similar_regions(region_id, business_id)

    metrics = {
        k: MetricDetail(
            value=v["value"],
            label=v["label"],
            description=v["description"],
        )
        for k, v in raw_metrics.items()
    }

    recommendation = _build_recommendation(score, risk_level)

    return AnalyzeResponse(
        opportunity_score=score,
        metrics=metrics,
        explanation=explanation,
        similar_regions=[
            SimilarRegion(name=s["name"], score=s["score"], similarity=s["similarity"])
            for s in similar
        ],
        recommendation=recommendation,
        risk_level=risk_level,
        estimated_roi=roi,
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
    
    # Tenta gerar explicação com OpenAI
    try:
        explanation = generate_simulation_insights(
            original_score=result["original_score"],
            projected_score=result["projected_score"],
            population_growth=req.population_growth,
            income_growth=req.income_growth,
            new_competitors=req.new_competitors,
        )
    except Exception as e:
        print(f"Erro ao gerar insights com OpenAI: {e}")
        # Fallback para explicação simples
        if delta > 10:
            explanation = f"Cenário otimista: o score deve subir {delta:.1f} pontos em 5 anos devido ao crescimento econômico e demográfico."
        elif delta > 0:
            explanation = f"Cenário levemente positivo: melhora gradual de {delta:.1f} pontos esperada."
        elif delta > -10:
            explanation = f"Cenário estável com leve retração de {abs(delta):.1f} pontos, principalmente pela concorrência."
        else:
            explanation = f"Cenário de alerta: queda de {abs(delta):.1f} pontos projetada. Reavalie a estratégia."

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
    return {"businesses": businesses, "total": len(businesses)}


# ── Status das APIs ──────────────────────────────────────────────────────────────

@app.get("/api/status")
def api_status():
    """
    Retorna o status de conexão de todas as APIs integradas.
    Útil para diagnóstico e configuração.
    """
    openai_connected = test_openai_connection()
    ibge_connected = test_ibge_connection()
    speech_connected = test_speech_connection()
    
    return {
        "apis": {
            "openai": {
                "status": "connected" if openai_connected else "disconnected",
                "description": "Gera explicações inteligentes sobre oportunidades de negócio",
                "fallback": "Explicações baseadas em regras (disponível)",
            },
            "ibge": {
                "status": "connected" if ibge_connected else "disconnected",
                "description": "Fornece dados demográficos reais de municípios brasileiros",
                "fallback": "Dados simulados baseados em estimativas (disponível)",
            },
            "google_speech": {
                "status": "connected" if speech_connected else "disconnected",
                "description": "Transcreve áudio para texto com alta precisão",
                "fallback": "Transcrição simulada (disponível)",
            },
        },
        "overall_status": "operational" if any([openai_connected, ibge_connected, speech_connected]) else "fallback_mode",
    }
