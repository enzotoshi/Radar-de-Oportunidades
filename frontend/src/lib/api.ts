import axios from 'axios'
import type {
  AnalysisResult,
  SimulationResult,
  GameResult,
  Region,
  Business,
  ScenarioParams,
} from '@/types'

const BASE_URL = 'http://localhost:8000'

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
})

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

export async function getBusinesses(): Promise<Business[]> {
  const { data } = await api.get<{ businesses: Business[] }>('/api/businesses')
  return data.businesses
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
