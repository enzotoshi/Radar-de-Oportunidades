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

let businessesPromise: Promise<Business[]> | null = null

interface NominatimReverseResult {
  place_id?: string | number
  lat?: string
  lon?: string
  boundingbox?: string[]
  address?: Record<string, unknown>
}

function distanceToReturnedStreet(lat: number, lng: number, result: NominatimReverseResult) {
  try {
    let closestLat: number
    let closestLng: number
    if (result.boundingbox?.length === 4) {
      const [south, north, west, east] = result.boundingbox.map(Number)
      closestLat = Math.min(Math.max(lat, south), north)
      closestLng = Math.min(Math.max(lng, west), east)
    } else {
      closestLat = Number(result.lat)
      closestLng = Number(result.lon)
    }
    if (!Number.isFinite(closestLat) || !Number.isFinite(closestLng)) return Infinity
    return Math.hypot(
      (lat - closestLat) * 111_320,
      (lng - closestLng) * 111_320 * Math.cos(lat * Math.PI / 180),
    )
  } catch {
    return Infinity
  }
}

function mapNominatimStreet(lat: number, lng: number, result: NominatimReverseResult): AddressSuggestion | null {
  const address = result.address || {}
  if (String(address.country_code || '').toLowerCase() !== 'br') return null
  const street = ['road', 'pedestrian', 'footway', 'path', 'cycleway']
    .map(key => address[key])
    .find((value): value is string => typeof value === 'string' && value.trim().length > 0)
  if (!street || distanceToReturnedStreet(lat, lng, result) > 250) return null

  const city = ['municipality', 'city', 'town', 'village']
    .map(key => address[key])
    .find((value): value is string => typeof value === 'string' && value.trim().length > 0)
  const state = String(address['ISO3166-2-lvl4'] || '').split('-').pop()
  let display_name = [street, city].filter(Boolean).join(', ')
  if (state) display_name += ` - ${state}`

  return {
    place_id: String(result.place_id || `coordinates-${lat.toFixed(6)}-${lng.toFixed(6)}`),
    display_name,
    lat,
    lng,
    municipality: null,
    source: 'Nominatim/OpenStreetMap',
  }
}

function reverseGeocodeWithJsonp(lat: number, lng: number, signal?: AbortSignal): Promise<AddressSuggestion | null> {
  if (typeof document === 'undefined') return Promise.resolve(null)

  return new Promise((resolve, reject) => {
    const callback = `radarNominatim${Date.now()}${Math.random().toString(36).slice(2)}`
    const script = document.createElement('script')
    let timeout: number | undefined
    let onAbort = () => {}
    const url = new URL('https://nominatim.openstreetmap.org/reverse')
    url.search = new URLSearchParams({
      lat: String(lat), lon: String(lng), format: 'jsonv2', addressdetails: '1', zoom: '17', layer: 'address', json_callback: callback,
    }).toString()
    const cleanup = () => {
      if (timeout !== undefined) window.clearTimeout(timeout)
      script.remove()
      delete (window as Window & Record<string, unknown>)[callback]
      signal?.removeEventListener('abort', onAbort)
    }
    const finish = (error?: Error, result?: AddressSuggestion | null) => {
      cleanup()
      if (error) reject(error)
      else resolve(result || null)
    }
    onAbort = () => finish(new DOMException('Consulta cancelada.', 'AbortError'))

    ;(window as Window & Record<string, unknown>)[callback] = (result: NominatimReverseResult) => finish(undefined, mapNominatimStreet(lat, lng, result))
    script.onerror = () => finish(new Error('Não foi possível consultar a rua selecionada.'))
    timeout = window.setTimeout(() => finish(new Error('A consulta de rua demorou demais para responder.')), 15_000)
    signal?.addEventListener('abort', onAbort, { once: true })
    if (signal?.aborted) { onAbort(); return }
    script.src = url.toString()
    document.head.appendChild(script)
  })
}

export function getApiError(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error)) {
    const detail = error.response?.data?.detail
    if (typeof detail === 'string' && detail.trim()) return detail
    if (error.code === 'ECONNABORTED') return 'A fonte demorou demais para responder. Tente novamente.'
    if (!error.response) return 'Não foi possível conectar ao backend.'
  }
  return error instanceof Error && error.message ? error.message : fallback
}

export async function searchAddress(query: string, signal?: AbortSignal, autocomplete = false): Promise<AddressSuggestion[]> {
  if (query.trim().length < 3) return []
  const { data } = await api.get<{ results: AddressSuggestion[] }>('/api/geocode', {
    params: { q: query.trim(), autocomplete },
    timeout: 20_000,
    signal,
  })
  return data.results
}

export async function reverseGeocode(lat: number, lng: number, signal?: AbortSignal): Promise<AddressSuggestion | null> {
  try {
    const { data } = await api.get<{ result: AddressSuggestion }>('/api/reverse-geocode', {
      params: { lat, lng },
      timeout: 20_000,
      signal,
    })
    return data.result
  } catch (error) {
    if (signal?.aborted) throw error
    try { return await reverseGeocodeWithJsonp(lat, lng, signal) } catch { /* Preserve the backend error when both sources fail. */ }
    if (axios.isAxiosError(error) && error.response?.status === 404) return null
    throw error
  }
}

export async function getBusinesses(): Promise<Business[]> {
  if (!businessesPromise) {
    businessesPromise = api.get<{ businesses: Business[] }>('/api/businesses')
      .then(({ data }) => data.businesses)
      .catch(error => {
        businessesPromise = null
        throw error
      })
  }
  return businessesPromise
}

export async function analyzeOpportunity(input: {
  address: string
  business_type: string
  lat: number
  lng: number
  budget?: number
  municipality_ibge_code?: string
  municipality_name?: string
  municipality_state?: string
}): Promise<AnalysisResult> {
  const { data } = await api.post<AnalysisResult>('/api/analyze-with-ai', input)
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
