import axios from 'axios'
import type {
  AnalysisResult,
  SimulationResult,
  GameResult,
  Region,
  Business,
  ScenarioParams,
} from '@/types'

// Em produção, usa a URL do backend deployado no Render
// Em desenvolvimento local, usa localhost
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 60000, // 60 segundos para AI Hotspots que demora mais
  headers: { 'Content-Type': 'application/json' },
})

const NOMINATIM_URL =
  process.env.NEXT_PUBLIC_NOMINATIM_URL || 'https://nominatim.openstreetmap.org'

export interface AddressSuggestion {
  place_id: string
  display_name: string
  lat: string
  lon: string
  name?: string
}

export async function searchAddress(query: string): Promise<AddressSuggestion[]> {
  if (query.trim().length < 3) return []
  const { data } = await axios.get<AddressSuggestion[]>(`${NOMINATIM_URL}/search`, {
    params: {
      q: `${query}, Brasil`,
      format: 'json',
      addressdetails: 1,
      limit: 5,
      countrycodes: 'br',
    },
    headers: { 'Accept-Language': 'pt-BR,pt' },
    timeout: 10000,
  })
  return data
}

export async function analyzeOpportunity(
  region: string,
  businessType: string,
  budget: number
): Promise<AnalysisResult> {
  const { data } = await api.post<AnalysisResult>('/api/analyze', {
    region,
    business_type: businessType,
    budget,
  })
  return data
}

export async function transcribeVoice(audioBase64: string): Promise<{
  transcript: string
  entities: Record<string, string | null>
  confidence: number
}> {
  const { data } = await api.post('/api/voice', { audio_base64: audioBase64 })
  return data
}

export async function simulateScenario(params: ScenarioParams): Promise<SimulationResult> {
  const { data } = await api.post<SimulationResult>('/api/simulate', params)
  return data
}

export async function getRegions(): Promise<Region[]> {
  const { data } = await api.get<{ regions: Region[] }>('/api/regions')
  return data.regions
}

export async function getBusinesses(): Promise<Array<Business | string>> {
  const { data } = await api.get<
    { businesses: Business[] } | Array<Business | string>
  >('/api/businesses')
  return Array.isArray(data) ? data : data.businesses
}

export async function calculateGameScore(
  region: string,
  businessType: string,
  budgetUsed: number,
  totalBudget: number
): Promise<GameResult> {
  const { data } = await api.post<GameResult>('/api/gamification/score', {
    region,
    business_type: businessType,
    budget_used: budgetUsed,
    total_budget: totalBudget,
  })
  return data
}

// ── AI Hotspot Finder APIs ──

export async function findHotspots(
  city: string = 'São Paulo',
  businessType: string = 'cafeteria',
  numHotspots: number = 10
): Promise<import('@/types').HotspotsResponse> {
  const { data } = await api.post(`/api/hotspots/find`, null, {
    params: {
      city,
      business_type: businessType,
      num_hotspots: numHotspots,
    },
  })
  return data
}

export async function analyzeCustomLocation(
  lat: number,
  lng: number,
  businessType: string = 'cafeteria',
  locationName?: string
): Promise<import('@/types').HotspotAnalysis> {
  const { data } = await api.post('/api/hotspots/analyze-location', null, {
    params: {
      lat,
      lng,
      business_type: businessType,
      location_name: locationName,
    },
  })
  return data
}

// ── Análise com IA (ChatGPT) ──

export interface AIAnalysisResult {
  opportunity_score: number
  competition: {
    total_competitors: number
    competition_level: string
    average_rating: number
    market_gap: string
  }
  demographics: {
    target_audience: string
    income_level: string
    population_density: string
    age_profile: string
  }
  infrastructure: {
    infrastructure_score: number
    accessibility: string
    nearby_facilities: string
    foot_traffic: string
  }
  mobility: {
    mobility_score: number
    public_transport: string
    parking: string
    walkability: string
  }
  swot: {
    strengths: string[]
    weaknesses: string[]
    opportunities: string[]
    threats: string[]
  }
  financial_projection: {
    estimated_monthly_revenue: number
    estimated_monthly_costs: number
    breakeven_months: number
    roi_expectation: string
  }
  recommendations: {
    viability: string
    key_insights: string[]
    action_items: string[]
    risks: string[]
  }
  summary: string
  data_source: string
  location: {
    lat: number
    lng: number
    address: string
  }
  business_type: string
  budget: number
}

export async function analyzeWithAI(
  address: string,
  businessType: string,
  lat: number,
  lng: number,
  budget: number = 100000
): Promise<AIAnalysisResult> {
  const { data } = await api.post<AIAnalysisResult>('/api/analyze-with-ai', {
    address,
    business_type: businessType,
    lat,
    lng,
    budget,
  })
  return data
}
