export interface Business {
  id: string
  name: string
  icon: string
  sector: string
}

export interface Municipality {
  ibge_code: string
  name: string
  state?: string | null
}

export interface Location {
  address: string
  lat: number
  lng: number
  municipality?: Municipality | null
}

export type DataKind = 'real' | 'estimated' | 'calculated'

export interface MetricDetail {
  value: number | string | null
  label: string
  description: string
  kind: DataKind
  source: string
  reference?: string | null
  unit?: string | null
}

export interface DataSource {
  name: string
  url: string
  status: 'ok' | 'partial' | 'unavailable'
  reference?: string | null
  license?: string | null
}

export interface BusinessMarker {
  id: string
  name: string
  category: string
  lat: number
  lng: number
  address?: string | null
  icon: string
}

export interface ScoreMethodology {
  formula: string
  competition: string
  infrastructure: string
  mobility: string
  components: {
    overall: number
    competition: number
    infrastructure: number
    mobility: number
  }
}

export interface AnalysisResult {
  opportunity_score: number
  score_label: string
  metrics: Record<string, MetricDetail>
  explanation: string
  classification: string
  recommendation: string
  location: Location
  business_type: string
  radius_meters: number
  business_markers: BusinessMarker[]
  sources: DataSource[]
  collected_at: string
  methodology: ScoreMethodology
  warnings: string[]
}

export interface YearProjection {
  year: number
  score: number
  label: string
}

export interface ScenarioParams {
  address: string
  business_type: string
  lat: number
  lng: number
  budget?: number
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
  assumptions: Record<string, string | number>
  methodology: string
  source_analysis_at: string
}

export interface GameResult {
  total_score: number
  competition_component: number
  infrastructure_component: number
  mobility_component: number
  classification: string
  feedback: string
  tips: string[]
  methodology: string
  source_analysis_at: string
}

export interface AddressSuggestion {
  place_id: string
  display_name: string
  lat: number
  lng: number
  municipality?: Municipality | null
  source: string
}

export type ActiveTab = 'map' | 'simulation' | 'gamification'
