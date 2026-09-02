import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const NOMINATIM_URL = process.env.NEXT_PUBLIC_NOMINATIM_URL || 'https://nominatim.openstreetmap.org';

// Cliente axios configurado
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ─────────────────────────────────────────────────────────────
// Análise de Oportunidade
// ─────────────────────────────────────────────────────────────

export interface AnalyzeRequest {
  region: string;
  business_type: string;
  budget: number;
  lat?: number;
  lng?: number;
}

export interface AnalyzeResponse {
  region: string;
  business_type: string;
  score: number;
  explanation: string;
  risk_level: string;
  roi: string;
  metrics: {
    population: { value: number; weight: number; description: string };
    income: { value: number; weight: number; description: string };
    competition: { value: number; weight: number; description: string };
    flow: { value: number; weight: number; description: string };
  };
  similar_regions: Array<{
    name: string;
    similarity: number;
  }>;
}

export async function analyzeOpportunity(data: AnalyzeRequest): Promise<AnalyzeResponse> {
  // Se tiver coordenadas, usa análise com IA (aceita qualquer endereço)
  if (data.lat && data.lng) {
    const response = await api.post('/api/analyze-with-ai', {
      address: data.region,
      business_type: data.business_type,
      lat: data.lat,
      lng: data.lng,
      budget: data.budget,
    });
    return response.data;
  }
  
  // Senão, tenta análise clássica (apenas regiões pré-cadastradas)
  const response = await api.post('/api/analyze', data);
  return response.data;
}

// ─────────────────────────────────────────────────────────────
// Geocoding (Nominatim - OpenStreetMap)
// ─────────────────────────────────────────────────────────────

export interface AddressSuggestion {
  display_name: string;
  lat: string;
  lon: string;
  address: {
    city?: string;
    state?: string;
    country?: string;
  };
}

export async function searchAddress(query: string): Promise<AddressSuggestion[]> {
  if (query.length < 3) return [];

  try {
    const response = await axios.get(`${NOMINATIM_URL}/search`, {
      params: {
        q: query + ', Brasil', // Sempre busca no Brasil
        format: 'json',
        addressdetails: 1,
        limit: 5,
      },
      // User-Agent não pode ser definido no navegador (navegadores bloqueiam)
      // O Nominatim aceita requisições sem User-Agent personalizado do navegador
    });

    return response.data;
  } catch (error) {
    console.error('Erro ao buscar endereço:', error);
    return [];
  }
}

// ─────────────────────────────────────────────────────────────
// Regiões e Negócios Disponíveis
// ─────────────────────────────────────────────────────────────

export async function getAvailableRegions(): Promise<string[]> {
  try {
    const response = await api.get('/api/regions');
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar regiões:', error);
    // Fallback
    return [
      'São Paulo - SP',
      'Rio de Janeiro - RJ',
      'Belo Horizonte - MG',
      'Curitiba - PR',
      'Porto Alegre - RS',
    ];
  }
}

export async function getAvailableBusinessTypes(): Promise<string[]> {
  try {
    const response = await api.get('/api/businesses');
    
    // Se retornou array de objetos, extrai apenas os nomes
    if (Array.isArray(response.data)) {
      return response.data.map((item: any) => {
        // Se for objeto com propriedade 'name', extrai o name
        if (typeof item === 'object' && item.name) {
          return item.name;
        }
        // Se for string, retorna direto
        if (typeof item === 'string') {
          return item;
        }
        // Fallback
        return String(item);
      });
    } else if (response.data && typeof response.data === 'object') {
      // Se retornou objeto, tenta extrair array de nomes
      const values = Object.values(response.data);
      return values.map((item: any) => {
        if (typeof item === 'object' && item.name) {
          return item.name;
        }
        return typeof item === 'string' ? item : String(item);
      });
    }
    throw new Error('Formato de resposta inválido');
  } catch (error) {
    console.error('Erro ao buscar tipos de negócio:', error);
    // Fallback com tipos padrão
    return [
      'Cafeteria',
      'Restaurante',
      'Academia',
      'Pet Shop',
      'Farmácia',
      'Padaria',
      'Loja de Roupas',
      'Mercado',
    ];
  }
}

// ─────────────────────────────────────────────────────────────
// Health Check
// ─────────────────────────────────────────────────────────────

export async function checkBackendHealth() {
  try {
    const response = await api.get('/');
    return response.data;
  } catch (error) {
    console.error('Backend offline:', error);
    return null;
  }
}

export default api;
