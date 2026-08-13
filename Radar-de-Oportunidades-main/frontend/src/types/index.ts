export interface AgeDistribution {
  young: number
  adult: number
  senior: number
}

export interface Region {
  id: string
  name: string
  lat: number
  lng: number
  population_density: number
  avg_income: number
  age_distribution: AgeDistribution
  competition_density: number
  urban_flow: number
  consumption_trend: number
  description: string
  highlights: string[]
}

export interface Business {
  id: string
  name: string
  icon: string
  sector: string
  min_investment: number
  ideal_income: number
  ideal_age: 'young' | 'adult' | 'mixed'
  competition_sensitivity: number
  description: string
}

export interface MetricDetail {
  value: number
  label: string
  description: string
}

export interface SimilarRegion {
  name: string
  score: number
  similarity: number
}

export interface AnalysisResult {
  opportunity_score: number
  metrics: Record<string, MetricDetail>
  explanation: string
  similar_regions: SimilarRegion[]
  recommendation: string
  risk_level: 'low' | 'medium' | 'high'
  estimated_roi: string
}

export interface YearProjection {
  year: number
  score: number
  label: string
}

export interface ScenarioParams {
  region: string
  business_type: string
  budget: number
  population_growth: number
  income_growth: number
  new_competitors: number
}

export interface SimulationResult {
  original_score: number
  projected_score: number
  delta: number
  projections: YearProjection[]
  explanation: string
  key_factors: string[]
}

export interface GameResult {
  total_score: number
  success_potential: number
  risk_management: number
  market_timing: number
  classification: string
  feedback: string
  tips: string[]
}

export type ActiveTab = 'map' | 'simulation' | 'gamification'

// ── AI Hotspot Finder Types ──

export interface Competition {
  total_competitors: number
  density_per_km2: number
  average_rating: number
  total_reviews: number
  currently_open: number
  competition_level: string
  top_competitors?: {
    name: string
    rating: number
    reviews: number
    address: string
  }[]
}

export interface Infrastructure {
  total_facilities: number
  by_type: Record<string, { label: string; count: number }>
  infrastructure_score: number
}

export interface Mobility {
  total_transport_options: number
  by_type: Record<string, { label: string; count: number }>
  mobility_score: number
}

export interface Attractiveness {
  overall_score: number
  competition_score: number
  infrastructure_score: number
  mobility_score: number
  classification: string
}

export interface Hotspot {
  name: string
  lat: number
  lng: number
  opportunity_score: number
  competition: Competition
  infrastructure: Infrastructure
  mobility: Mobility
  attractiveness: Attractiveness
  data_source: string
}

export interface HotspotAnalysis extends Hotspot {
  recommendations: string[]
}

export interface HotspotsResponse {
  city: string
  business_type: string
  total_found: number
  hotspots: Hotspot[]
}
