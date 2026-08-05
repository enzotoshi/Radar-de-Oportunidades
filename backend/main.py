"""
Radar de Oportunidades Inteligente - Backend FastAPI
"""
import base64
import os
import re

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
    return {
        "status": "online",
        "service": "Radar de Oportunidades Inteligente",
        "version": "1.0.0",
    }


# ── Análise de Oportunidade ─────────────────────────────────────────────────────

@app.post("/api/analyze", response_model=AnalyzeResponse)
def analyze_opportunity(req: AnalyzeRequest):
    """
    Analisa a oportunidade de negócio para uma região e tipo de negócio.
    Retorna score, métricas detalhadas e explicação gerada por IA.
    """
    region_id = req.region.lower().replace(" ", "_")
    business_id = req.business_type.lower().replace(" ", "_")

    if region_id not in REGIONS_DATA:
        raise HTTPException(status_code=404, detail=f"Região '{req.region}' não encontrada.")
    if business_id not in BUSINESSES_DATA:
        raise HTTPException(status_code=404, detail=f"Tipo de negócio '{req.business_type}' não encontrado.")

    result = calculate_opportunity_score(region_id, business_id, req.budget)
    score = result["score"]
    raw_metrics = result["metrics"]

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
    Recebe áudio em base64, simula transcrição e extrai entidades.
    """
    try:
        audio_bytes = base64.b64decode(req.audio_base64)
    except Exception:
        raise HTTPException(status_code=400, detail="Áudio base64 inválido.")

    # Simulação de transcrição (sem API externa)
    transcript = _simulate_transcription(len(audio_bytes))
    entities = _extract_entities(transcript)

    return VoiceResponse(
        transcript=transcript,
        entities=entities,
        confidence=0.87,
    )


def _simulate_transcription(audio_size: int) -> str:
    """Gera transcrição simulada baseada no tamanho do áudio."""
    samples = [
        "Quero abrir uma cafeteria em Pinheiros com orçamento de 100 mil reais",
        "Estou pensando em uma academia em Moema para público adulto",
        "Preciso analisar oportunidade de coworking em Vila Madalena",
        "Quero investir em restaurante fitness nos Jardins com 200 mil",
        "Analisar pet shop em Santana para classe média",
    ]
    idx = audio_size % len(samples)
    return samples[idx]


def _extract_entities(text: str) -> dict:
    """Extrai entidades simples do transcript."""
    text_lower = text.lower()
    entities: dict = {
        "business_type": None,
        "budget": None,
        "location": None,
        "target_audience": None,
    }

    business_keywords = {
        "cafeteria": "cafeteria", "coffee": "cafeteria",
        "academia": "academia", "ginástica": "academia",
        "coworking": "coworking", "restaurante": "restaurante_fitness",
        "pet shop": "pet_shop", "pet": "pet_shop",
        "farmácia": "farmácia", "idiomas": "escola_idiomas",
        "bar": "bar_pub", "eletrônicos": "loja_eletronicos",
        "salão": "salao_beleza", "delivery": "delivery_comida",
        "brechó": "brechó", "clínica": "clinica_estetica",
        "mercado orgânico": "mercado_organico", "livraria": "livraria_cafe",
    }
    for kw, bid in business_keywords.items():
        if kw in text_lower:
            entities["business_type"] = bid
            break

    region_keywords = {
        "pinheiros": "pinheiros", "vila madalena": "vila_madalena",
        "moema": "moema", "jardins": "jardins", "centro": "centro",
        "santo andré": "santo_andre", "campinas": "campinas",
        "itaquera": "itaquera", "liberdade": "liberdade",
        "lapa": "lapa", "santana": "santana", "abc": "abc_paulista",
        "tatuapé": "tatuape", "vila olímpia": "vila_olimpia",
        "consolação": "consolacao",
    }
    for kw, rid in region_keywords.items():
        if kw in text_lower:
            entities["location"] = rid
            break

    budget_match = re.search(r"(\d[\d.]*)\s*(mil|k|reais|r\$)?", text_lower)
    if budget_match:
        val = float(budget_match.group(1).replace(".", ""))
        if "mil" in text_lower or "k" in text_lower:
            val *= 1000
        entities["budget"] = str(val)

    audience_keywords = {
        "jovem": "young", "adulto": "adult", "família": "family",
        "idoso": "senior", "executivo": "executive",
    }
    for kw, aud in audience_keywords.items():
        if kw in text_lower:
            entities["target_audience"] = aud
            break

    return entities


# ── Simulação de Cenários ───────────────────────────────────────────────────────

@app.post("/api/simulate", response_model=SimulateResponse)
def simulate(req: SimulateRequest):
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
