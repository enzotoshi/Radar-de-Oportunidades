from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any


# ── Request Models ──────────────────────────────────────────────────────────────

class AnalyzeRequest(BaseModel):
    region: str = Field(..., description="Nome da região / bairro")
    business_type: str = Field(..., description="Tipo de negócio")
    budget: float = Field(..., gt=0, description="Orçamento disponível em R$")


class VoiceRequest(BaseModel):
    audio_base64: str = Field(..., description="Áudio codificado em base64")
    language: str = Field(default="pt-BR", description="Idioma do áudio")


class SimulateRequest(BaseModel):
    region: str = Field(..., description="Região alvo")
    business_type: str = Field(..., description="Tipo de negócio")
    budget: float = Field(..., gt=0, description="Orçamento disponível em R$")
    population_growth: float = Field(default=0.0, description="Crescimento populacional (%)")
    income_growth: float = Field(default=0.0, description="Crescimento de renda (%)")
    new_competitors: int = Field(default=0, ge=0, description="Novos concorrentes")


class GameScoreRequest(BaseModel):
    region: str = Field(..., description="Região escolhida pelo jogador")
    business_type: str = Field(..., description="Tipo de negócio escolhido")
    budget_used: float = Field(..., gt=0, description="Orçamento utilizado")
    total_budget: float = Field(..., gt=0, description="Orçamento total disponível")


# ── Response Models ─────────────────────────────────────────────────────────────

class MetricDetail(BaseModel):
    value: float = Field(..., description="Valor da métrica (0-100)")
    label: str = Field(..., description="Rótulo da métrica")
    description: str = Field(..., description="Descrição curta")


class SimilarRegion(BaseModel):
    name: str
    score: float
    similarity: float  # 0-1


class AnalyzeResponse(BaseModel):
    opportunity_score: float = Field(..., description="Score de oportunidade (0-100)")
    metrics: Dict[str, MetricDetail]
    explanation: str = Field(..., description="Explicação gerada por IA em português")
    similar_regions: List[SimilarRegion]
    recommendation: str
    risk_level: str  # low | medium | high
    estimated_roi: str


class VoiceResponse(BaseModel):
    transcript: str
    entities: Dict[str, Optional[str]]
    confidence: float


class YearProjection(BaseModel):
    year: int
    score: float
    label: str


class SimulateResponse(BaseModel):
    original_score: float
    projected_score: float
    delta: float
    projections: List[YearProjection]
    explanation: str
    key_factors: List[str]


class GameScoreResponse(BaseModel):
    total_score: int  # 0-1000
    success_potential: int
    risk_management: int
    market_timing: int
    classification: str
    feedback: str
    tips: List[str]


class RegionData(BaseModel):
    id: str
    name: str
    lat: float
    lng: float
    population_density: float  # hab/km²
    avg_income: float  # R$
    age_distribution: Dict[str, float]  # {"young": %, "adult": %, "senior": %}
    competition_density: float  # 0-10
    urban_flow: float  # 0-10
    consumption_trend: float  # 0-10
    description: str
    highlights: List[str]


class BusinessData(BaseModel):
    id: str
    name: str
    icon: str
    sector: str
    min_investment: float
    base_scores: Dict[str, float]  # region_id -> base_score
    ideal_income: float  # renda mínima ideal do público
    ideal_age: str  # "young" | "adult" | "mixed"
    competition_sensitivity: float  # 0-1
    description: str
