"""Contratos da API com proveniência e ausência explícita de dados."""
from typing import Dict, List, Literal, Optional, Union

from pydantic import BaseModel, Field


class VoiceRequest(BaseModel):
    audio_base64: str = Field(..., min_length=1, description="Áudio codificado em base64")
    language: str = Field(default="pt-BR", description="Idioma do áudio")


class VoiceResponse(BaseModel):
    transcript: str
    entities: Dict[str, Optional[str]]
    confidence: float = Field(..., ge=0, le=1)


class LocationAnalysisRequest(BaseModel):
    address: str = Field(..., min_length=3)
    business_type: str = Field(..., min_length=2)
    lat: float = Field(..., ge=-90, le=90)
    lng: float = Field(..., ge=-180, le=180)
    budget: Optional[float] = Field(default=None, gt=0)


class SimulateRequest(LocationAnalysisRequest):
    population_growth: float = Field(default=0.0, ge=-100, le=500)
    income_growth: float = Field(default=0.0, ge=-100, le=500)
    new_competitors: int = Field(default=0, ge=0, le=10_000)


class GameScoreRequest(LocationAnalysisRequest):
    pass


class DataSource(BaseModel):
    name: str
    url: str
    status: Literal["ok", "partial", "unavailable"]
    reference: Optional[str] = None
    license: Optional[str] = None


class MetricDetail(BaseModel):
    value: Optional[Union[float, int, str]] = None
    label: str
    description: str
    kind: Literal["real", "estimated", "calculated"]
    source: str
    reference: Optional[str] = None
    unit: Optional[str] = None


class Municipality(BaseModel):
    ibge_code: str
    name: str
    state: Optional[str] = None


class Location(BaseModel):
    address: str
    lat: float
    lng: float
    municipality: Optional[Municipality] = None


class BusinessMarker(BaseModel):
    id: str
    name: str
    category: str
    lat: float
    lng: float
    address: Optional[str] = None


class AnalysisResponse(BaseModel):
    opportunity_score: float = Field(..., ge=0, le=100)
    score_label: str
    metrics: Dict[str, MetricDetail]
    explanation: str
    classification: str
    recommendation: str
    location: Location
    business_type: str
    radius_meters: int
    business_markers: List[BusinessMarker]
    sources: List[DataSource]
    collected_at: str
    methodology: Dict[str, object]
    warnings: List[str] = Field(default_factory=list)


class YearProjection(BaseModel):
    year: int
    score: float = Field(..., ge=0, le=100)
    label: str


class SimulateResponse(BaseModel):
    original_score: float = Field(..., ge=0, le=100)
    projected_score: float = Field(..., ge=0, le=100)
    delta: float
    projections: List[YearProjection]
    explanation: str
    key_factors: List[str]
    assumptions: Dict[str, Union[float, int, str]]
    methodology: str
    source_analysis_at: str

class GameScoreResponse(BaseModel):
    total_score: int = Field(..., ge=0, le=1000)
    competition_component: int = Field(..., ge=0, le=400)
    infrastructure_component: int = Field(..., ge=0, le=300)
    mobility_component: int = Field(..., ge=0, le=300)
    classification: str
    feedback: str
    tips: List[str]
    methodology: str
    source_analysis_at: str
