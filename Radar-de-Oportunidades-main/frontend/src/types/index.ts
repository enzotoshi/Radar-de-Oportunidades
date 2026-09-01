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
