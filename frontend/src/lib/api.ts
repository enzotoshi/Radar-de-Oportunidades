import axios from 'axios'
import type {
  AddressSuggestion,
  AnalysisResult,
  Business,
  GameResult,
  Location,
  ScenarioParams,
  SimulationResult,
} from '@/types'

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 60_000,
  headers: { 'Content-Type': 'application/json' },
})

export function getApiError(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error)) {
    const detail = error.response?.data?.detail
    if (typeof detail === 'string' && detail.trim()) return detail
    if (error.code === 'ECONNABORTED') return 'A fonte demorou demais para responder. Tente novamente.'
    if (!error.response) return 'Não foi possível conectar ao backend.'
  }
  return error instanceof Error && error.message ? error.message : fallback
}

export async function searchAddress(query: string): Promise<AddressSuggestion[]> {
  if (query.trim().length < 3) return []
  const { data } = await api.get<{ results: AddressSuggestion[] }>('/api/geocode', {
    params: { q: query.trim() },
    timeout: 20_000,
  })
  return data.results
}

export async function getBusinesses(): Promise<Business[]> {
  const { data } = await api.get<{ businesses: Business[] }>('/api/businesses')
  return data.businesses
}

export async function analyzeOpportunity(input: {
  address: string
  business_type: string
  lat: number
  lng: number
  budget?: number
}): Promise<AnalysisResult> {
  const { data } = await api.post<AnalysisResult>('/api/analyze-with-ai', input)
  return data
}

export async function transcribeVoice(audioBase64: string): Promise<{
  transcript: string
  entities: Record<string, string | null>
  confidence: number
}> {
  const { data } = await api.post('/api/voice', {
    audio_base64: audioBase64,
    language: 'pt-BR',
  })
  return data
}

export async function simulateScenario(params: ScenarioParams): Promise<SimulationResult> {
  const { data } = await api.post<SimulationResult>('/api/simulate', params)
  return data
}

export async function calculateGameScore(
  location: Location,
  businessType: string,
): Promise<GameResult> {
  const { data } = await api.post<GameResult>('/api/gamification/score', {
    address: location.address,
    business_type: businessType,
    lat: location.lat,
    lng: location.lng,
  })
  return data
}

export default api
