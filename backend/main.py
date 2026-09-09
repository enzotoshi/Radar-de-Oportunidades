"""API do Radar de Oportunidades: somente dados observados ou cálculos identificados."""
from __future__ import annotations

import base64
import math
import os
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

import requests
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware

from models import (
    AnalysisResponse,
    GameScoreRequest,
    GameScoreResponse,
    LocationAnalysisRequest,
    SimulateRequest,
    SimulateResponse,
    VoiceRequest,
    VoiceResponse,
    YearProjection,
)
from public_data_service import (
    PublicDataUnavailable,
    analyze_public_data,
    list_municipalities,
    search_locations,
)
from speech_service import test_speech_connection, transcribe_audio


app = FastAPI(
    title="Radar de Oportunidades Inteligente",
    description="Análises com dados públicos e metodologia própria identificada",
    version="3.0.0",
)

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


# Catálogo de filtros suportados. Estes itens são configuração da aplicação,
# não observações ou alegações sobre o mercado.
BUSINESS_CATALOG = [
    {"id": "cafeteria", "name": "Cafeteria", "icon": "☕", "sector": "Alimentação"},
    {"id": "restaurante", "name": "Restaurante", "icon": "🍽️", "sector": "Alimentação"},
    {"id": "restaurante_fitness", "name": "Restaurante saudável", "icon": "🥗", "sector": "Alimentação"},
    {"id": "academia", "name": "Academia", "icon": "🏋️", "sector": "Saúde e bem-estar"},
    {"id": "coworking", "name": "Coworking", "icon": "💻", "sector": "Serviços"},
    {"id": "brecho", "name": "Brechó", "icon": "♻️", "sector": "Varejo"},
    {"id": "pet_shop", "name": "Pet shop ou veterinária", "icon": "🐾", "sector": "Serviços"},
    {"id": "farmacia", "name": "Farmácia", "icon": "💊", "sector": "Saúde"},
    {"id": "escola_idiomas", "name": "Escola de idiomas", "icon": "📚", "sector": "Educação"},
    {"id": "bar_pub", "name": "Bar ou pub", "icon": "🍺", "sector": "Alimentação"},
    {"id": "loja_eletronicos", "name": "Loja de eletrônicos", "icon": "📱", "sector": "Varejo"},
    {"id": "salao_beleza", "name": "Salão de beleza", "icon": "✂️", "sector": "Serviços"},
    {"id": "delivery_comida", "name": "Delivery de comida", "icon": "🛵", "sector": "Alimentação"},
    {"id": "clinica_estetica", "name": "Clínica estética", "icon": "✨", "sector": "Saúde"},
    {"id": "livraria_cafe", "name": "Livraria e café", "icon": "📖", "sector": "Varejo"},
    {"id": "mercado_organico", "name": "Mercado orgânico", "icon": "🌿", "sector": "Varejo"},
    {"id": "padaria", "name": "Padaria", "icon": "🥖", "sector": "Alimentação"},
    {"id": "mercado", "name": "Mercado", "icon": "🛒", "sector": "Varejo"},
    {"id": "barbearia", "name": "Barbearia", "icon": "💈", "sector": "Serviços"},
    {"id": "loja_roupas", "name": "Loja de roupas", "icon": "👕", "sector": "Varejo"},
]
SUPPORTED_BUSINESSES = {item["id"] for item in BUSINESS_CATALOG}


def _ensure_supported_business(business_type: str) -> None:
    if business_type not in SUPPORTED_BUSINESSES:
        raise HTTPException(
            status_code=422,
            detail="Tipo de negócio não suportado pelo mapeamento OpenStreetMap.",
        )


def _classification(score: float) -> str:
    if score >= 70:
        return "Índice alto na metodologia própria"
    if score >= 45:
        return "Índice intermediário na metodologia própria"
    return "Índice baixo na metodologia própria"


def _recommendation(score: float) -> str:
    if score >= 70:
        return "Há sinais favoráveis nos dados mapeados; valide custos, demanda e concorrência em campo."
    if score >= 45:
        return "Os sinais mapeados são mistos; complemente a análise antes de investir."
    return "Os sinais mapeados exigem cautela; o índice não substitui estudo de viabilidade."


def _build_analysis(request: LocationAnalysisRequest) -> Dict[str, Any]:
    _ensure_supported_business(request.business_type)
    try:
        analysis = analyze_public_data(
            request.lat,
            request.lng,
            request.business_type,
            radius=1500,
        )
    except PublicDataUnavailable as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    except (requests.RequestException, ValueError) as exc:
        raise HTTPException(status_code=503, detail=f"Fonte pública indisponível: {exc}") from exc

    osm = analysis["osm"]
    ibge = analysis["ibge"]
    population = analysis.get("population_area")
    city = ibge.get("city")
    gdp = ibge.get("gdp")
    gdp_value = None
    if gdp:
        gdp_value = gdp["value"]
        if "mil" in str(gdp.get("unit") or "").lower():
            gdp_value *= 1000
    score_parts = analysis["score"]
    score = score_parts["overall"]
    radius_km = analysis["radius_meters"] / 1000
    warnings = [
        "A cobertura do OpenStreetMap varia por local. Ausência no mapa não prova ausência no mundo real.",
        "Este índice é uma metodologia própria e não representa indicador oficial nem probabilidade de sucesso.",
    ]
    if not population:
        warnings.append("Estimativa populacional indisponível nesta consulta.")
    if not gdp:
        warnings.append("PIB municipal indisponível nesta consulta.")

    municipality = (
        {
            "ibge_code": str(city["id"]),
            "name": city["name"],
            "state": city.get("state"),
        }
        if city
        else None
    )

    metrics = {
        "population": {
            "value": population["value"] if population else None,
            "label": "População estimada na área",
            "description": f"Soma de células no raio de {radius_km:.1f} km; não é contagem censitária.",
            "kind": "estimated",
            "source": "WorldPop 100 m (via Esri)",
            "reference": str(population["year"]) if population else None,
            "unit": "pessoas",
        },
        "gdp": {
            "value": gdp_value,
            "label": "PIB municipal",
            "description": "PIB a preços correntes; é municipal e não representa renda do bairro.",
            "kind": "real",
            "source": "IBGE/SIDRA, tabela 5938, variável 37",
            "reference": gdp["year"] if gdp else None,
            "unit": "BRL",
        },
        "competitors": {
            "value": osm["competitor_count"],
            "label": "Estabelecimentos compatíveis no OSM",
            "description": f"Registros mapeados no raio de {radius_km:.1f} km.",
            "kind": "real",
            "source": "OpenStreetMap/Overpass",
            "reference": analysis["collected_at"],
            "unit": "estabelecimentos",
        },
        "competition_density": {
            "value": osm["competitor_density"],
            "label": "Densidade de estabelecimentos",
            "description": "Quantidade mapeada dividida pela área circular consultada.",
            "kind": "calculated",
            "source": "Cálculo do sistema sobre OpenStreetMap",
            "reference": analysis["collected_at"],
            "unit": "estabelecimentos/km²",
        },
        "infrastructure": {
            "value": osm["infrastructure_count"],
            "label": "Equipamentos de infraestrutura",
            "description": "Bancos, hospitais, clínicas, escolas, universidades e mercados públicos mapeados.",
            "kind": "real",
            "source": "OpenStreetMap/Overpass",
            "reference": analysis["collected_at"],
            "unit": "equipamentos",
        },
        "mobility": {
            "value": osm["transport_count"],
            "label": "Pontos de mobilidade",
            "description": "Transporte, estacionamento, táxi e bicicletários mapeados.",
            "kind": "real",
            "source": "OpenStreetMap/Overpass",
            "reference": analysis["collected_at"],
            "unit": "pontos",
        },
    }

    explanation = (
        f"A consulta encontrou {osm['competitor_count']} estabelecimentos compatíveis "
        f"e {osm['infrastructure_count']} equipamentos de infraestrutura em um raio de "
        f"{radius_km:.1f} km. O índice combina somente registros do OpenStreetMap: "
        "45% concorrência, 30% infraestrutura e 25% mobilidade. "
        "PIB e população são exibidos como contexto e não alteram o índice."
    )
    markers = [
        {
            "id": item["id"],
            "name": item["name"],
            "category": request.business_type,
            "lat": item["lat"],
            "lng": item["lng"],
            "address": item.get("address"),
        }
        for item in osm["competitors"]
    ]
    return {
        "opportunity_score": score,
        "score_label": "Índice de oportunidade — metodologia própria",
        "metrics": metrics,
        "explanation": explanation,
        "classification": _classification(score),
        "recommendation": _recommendation(score),
        "location": {
            "address": request.address,
            "lat": request.lat,
            "lng": request.lng,
            "municipality": municipality,
        },
        "business_type": request.business_type,
        "radius_meters": analysis["radius_meters"],
        "business_markers": markers,
        "sources": analysis["sources"],
        "collected_at": analysis["collected_at"],
        "methodology": {
            "formula": "0,45 × concorrência + 0,30 × infraestrutura + 0,25 × mobilidade",
            "competition": "máx(0, 100 − densidade_de_estabelecimentos × 9)",
            "infrastructure": "mín(100, equipamentos_mapeados × 5)",
            "mobility": "mín(100, pontos_de_mobilidade_mapeados × 7)",
            "components": score_parts,
        },
        "warnings": warnings,
    }


@app.get("/")
def health_check() -> Dict[str, Any]:
    return {
        "status": "online",
        "service": "Radar de Oportunidades Inteligente",
        "version": "3.0.0",
        "data_policy": "real-only",
        "sources": {
            "openstreetmap": "consultada sob demanda",
            "ibge": "consultada sob demanda",
            "worldpop": "consultada sob demanda",
            "google_speech": "configured" if test_speech_connection() else "unavailable",
        },
    }


@app.get("/api/geocode")
def geocode(q: str = Query(..., min_length=3, max_length=250)) -> Dict[str, Any]:
    try:
        results = search_locations(q)
        return {
            "results": results,
            "source": "Nominatim/OpenStreetMap",
            "usage": "busca explícita; resultados armazenados em cache",
        }
    except (requests.RequestException, PublicDataUnavailable) as exc:
        raise HTTPException(status_code=503, detail=f"Geocodificação indisponível: {exc}") from exc
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc


@app.get("/api/businesses")
def list_businesses() -> Dict[str, Any]:
    return {
        "businesses": BUSINESS_CATALOG,
        "note": "Catálogo de filtros suportados; não representa estatística de mercado.",
    }


@app.get("/api/regions")
def list_regions(uf: Optional[str] = Query(default=None, min_length=2, max_length=2)) -> Dict[str, Any]:
    try:
        regions = list_municipalities(uf)
        return {
            "regions": regions,
            "total": len(regions),
            "source": "IBGE API de Localidades",
        }
    except requests.RequestException as exc:
        raise HTTPException(status_code=503, detail=f"IBGE indisponível: {exc}") from exc
    except (PublicDataUnavailable, ValueError) as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc


@app.post("/api/analyze", deprecated=True)
def analyze_legacy() -> None:
    raise HTTPException(
        status_code=410,
        detail="Use /api/analyze-with-ai com endereço e coordenadas geocodificadas.",
    )


@app.post("/api/analyze-with-ai", response_model=AnalysisResponse)
def analyze_location(request: LocationAnalysisRequest) -> Dict[str, Any]:
    # O nome histórico da rota foi mantido por compatibilidade. Nenhuma IA é
    # usada como fonte factual.
    return _build_analysis(request)


@app.post("/api/voice", response_model=VoiceResponse)
def process_voice(request: VoiceRequest) -> VoiceResponse:
    try:
        audio_bytes = base64.b64decode(request.audio_base64, validate=True)
    except (ValueError, TypeError) as exc:
        raise HTTPException(status_code=400, detail="Áudio base64 inválido.") from exc
    try:
        result = transcribe_audio(audio_bytes, language_code=request.language)
    except (RuntimeError, ValueError) as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    return VoiceResponse(
        transcript=result["transcript"],
        entities=result["entities"],
        confidence=result["confidence"],
    )


@app.post("/api/simulate", response_model=SimulateResponse)
def simulate(request: SimulateRequest) -> SimulateResponse:
    _ensure_supported_business(request.business_type)
    try:
        observed = analyze_public_data(request.lat, request.lng, request.business_type, radius=1500)
    except (PublicDataUnavailable, requests.RequestException, ValueError) as exc:
        raise HTTPException(status_code=503, detail=f"Dados-base indisponíveis: {exc}") from exc

    base_score = observed["score"]["overall"]
    base_competition = observed["score"]["competition"]
    density = observed["osm"]["competitor_density"]
    area_km2 = math.pi * (observed["radius_meters"] / 1000) ** 2
    current_year = datetime.now(timezone.utc).year
    projections: List[YearProjection] = []

    for offset in range(1, 6):
        factor = offset / 5
        added_density = request.new_competitors * factor / area_km2
        projected_competition = max(0.0, 100.0 - (density + added_density) * 9.0)
        competition_delta = (projected_competition - base_competition) * 0.45
        assumption_adjustment = (
            request.population_growth * factor * 0.10
            + request.income_growth * factor * 0.10
        )
        projected = max(0.0, min(100.0, base_score + competition_delta + assumption_adjustment))
        year = current_year + offset
        projections.append(
            YearProjection(year=year, score=round(projected, 1), label=str(year))
        )

    projected_score = projections[-1].score
    delta = round(projected_score - base_score, 1)
    return SimulateResponse(
        original_score=base_score,
        projected_score=projected_score,
        delta=delta,
        projections=projections,
        explanation=(
            "Projeção de cenário, não previsão. O ponto de partida usa a coleta real; "
            "as variações futuras são hipóteses informadas pelo usuário."
        ),
        key_factors=[
            f"Hipótese de população em 5 anos: {request.population_growth:+.1f}%",
            f"Hipótese de renda em 5 anos: {request.income_growth:+.1f}%",
            f"Hipótese de novos concorrentes em 5 anos: {request.new_competitors}",
        ],
        assumptions={
            "population_growth_percent_5y": request.population_growth,
            "income_growth_percent_5y": request.income_growth,
            "new_competitors_5y": request.new_competitors,
            "classification": "hipóteses do usuário",
        },
        methodology=(
            "score projetado = score observado + 45% da variação do componente de "
            "concorrência + 0,10 ponto por ponto percentual das hipóteses de população "
            "e renda, aplicado progressivamente em cinco anos; limitado a 0–100."
        ),
        source_analysis_at=observed["collected_at"],
    )


@app.post("/api/gamification/score", response_model=GameScoreResponse)
def gamification_score(request: GameScoreRequest) -> GameScoreResponse:
    _ensure_supported_business(request.business_type)
    try:
        observed = analyze_public_data(request.lat, request.lng, request.business_type, radius=1500)
    except (PublicDataUnavailable, requests.RequestException, ValueError) as exc:
        raise HTTPException(status_code=503, detail=f"Dados-base indisponíveis: {exc}") from exc

    parts = observed["score"]
    competition = round(parts["competition"] * 4)
    infrastructure = round(parts["infrastructure"] * 3)
    mobility = round(parts["mobility"] * 3)
    total = competition + infrastructure + mobility
    if total >= 700:
        classification = "Leitura consistente do contexto"
    elif total >= 450:
        classification = "Contexto misto"
    else:
        classification = "Contexto exige investigação"

    return GameScoreResponse(
        total_score=total,
        competition_component=competition,
        infrastructure_component=infrastructure,
        mobility_component=mobility,
        classification=classification,
        feedback=(
            "Pontuação educacional calculada exclusivamente sobre registros mapeados. "
            "Ela não estima retorno financeiro ou chance de sucesso."
        ),
        tips=[
            "Confira estabelecimentos ausentes ou desatualizados em pesquisa de campo.",
            "Valide aluguel, custos, licenças e demanda antes de qualquer decisão.",
            "Compare novas localizações repetindo a mesma metodologia e o mesmo raio.",
        ],
        methodology=(
            "0–400 pontos de concorrência + 0–300 de infraestrutura + "
            "0–300 de mobilidade, derivados dos componentes da análise OSM."
        ),
        source_analysis_at=observed["collected_at"],
    )


@app.post("/api/hotspots/analyze-location", response_model=AnalysisResponse)
def analyze_custom_location(request: LocationAnalysisRequest) -> Dict[str, Any]:
    return _build_analysis(request)


@app.post("/api/hotspots/find", deprecated=True)
def find_hotspots_disabled() -> None:
    raise HTTPException(
        status_code=410,
        detail=(
            "O ranking automático foi desativado porque dependia de coordenadas fixas. "
            "Analise endereços geocodificados em /api/analyze-with-ai."
        ),
    )


@app.get("/api/status")
def api_status() -> Dict[str, Any]:
    return {
        "data_policy": "real-only",
        "sources": {
            "nominatim": {
                "status": "on-demand",
                "cache": "30 dias",
                "limits": "requisições serializadas; no máximo 1 por segundo",
            },
            "openstreetmap_overpass": {"status": "on-demand", "cache": "15 minutos"},
            "ibge": {"status": "on-demand", "cache": "30 dias"},
            "worldpop": {
                "status": "on-demand",
                "cache": "30 dias",
                "reference": os.getenv("WORLDPOP_YEAR", "2020"),
            },
            "google_speech": {
                "status": "configured" if test_speech_connection() else "unavailable",
                "fabricated_data": False,
            },
        },
    }
