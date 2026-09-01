# 🗺️ Feature: Análise de Mapa

## Visão Geral

Permite ao usuário buscar qualquer endereço no Brasil e analisar a oportunidade de negócio em um raio de 1 km.

## Funcionalidades

- ✅ Busca de endereços usando Nominatim (OpenStreetMap) - **GRATUITO**
- ✅ Geocoding automático (conversão endereço → coordenadas)
- ✅ Análise de concorrência em raio de 1 km
- ✅ Cálculo de score de infraestrutura
- ✅ Cálculo de score de mobilidade
- ✅ Visualização de resultados no card
- ✅ Mapa interativo com Google Maps

## Arquivo Principal

`src/components/MapAnalysis.tsx`

## Props

```typescript
interface Props {
  selectedRegion: string           // Região selecionada (deprecated, não usado mais)
  setSelectedRegion: (v: string) => void
  selectedBusiness: string         // ID do tipo de negócio selecionado
  setSelectedBusiness: (v: string) => void
  analysisResult: AnalysisResult | null  // Resultado da análise
  setAnalysisResult: (v: AnalysisResult | null) => void
  onGoToInvestor: () => void      // Callback para ir ao modo investidor
}
```

## Estado Interno

```typescript
const [customAddress, setCustomAddress] = useState('')  // Endereço digitado
const [searchingAddress, setSearchingAddress] = useState(false)  // Loading
const [customLocationResult, setCustomLocationResult] = useState<any>(null)  // Resultado
const [budget, setBudget] = useState<number>(100000)  // Orçamento do usuário
const [error, setError] = useState<string | null>(null)  // Mensagens de erro
```

## Fluxo de Funcionamento

```
1. Usuário digita endereço
   ↓
2. Usuário seleciona tipo de negócio
   ↓
3. Usuário clica em "Analisar Local"
   ↓
4. Sistema faz geocoding (Nominatim)
   ↓
5. Sistema envia coordenadas para backend
   ↓
6. Backend analisa área de 1 km (Google Maps API)
   ↓
7. Sistema exibe resultado no card
```

## APIs Utilizadas

### Frontend
- **Nominatim (OpenStreetMap)**: Geocoding gratuito
  - Endpoint: `https://nominatim.openstreetmap.org/search`
  - Sem necessidade de API key

### Backend  
- **Google Maps Places API**: Busca de concorrentes
- **Google Maps Geocoding API**: Dados de localização

## Como Modificar

### Adicionar novo campo no formulário

```typescript
// No formulário (linha ~170)
<div>
  <label>💼 Novo Campo</label>
  <input
    value={novoValor}
    onChange={(e) => setNovoValor(e.target.value)}
    className="w-full bg-surface border border-slate-700 rounded-xl..."
  />
</div>
```

### Adicionar novo dado no resultado

```typescript
// No card de resultado (linha ~280)
<div className="flex items-center justify-between text-xs">
  <span className="text-slate-400">🆕 Novo Dado</span>
  <span className="text-white font-semibold">
    {customLocationResult.novoDado}
  </span>
</div>
```

### Mudar o raio de análise

Atualmente: **1 km**

Para mudar, edite o backend:
```python
# backend/ai_hotspot_finder.py (linha ~50)
radius = 1000  # metros (mude para 2000 = 2km)
```

## Componentes Relacionados

- `MapComponent.tsx` - Mapa interativo Google Maps
- `VoiceInput.tsx` - Entrada por voz
- `OpportunityScore.tsx` - Card de score (não usado nesta versão)

## APIs do Backend

### Endpoint Principal

```typescript
POST /api/hotspots/analyze-location

Body: {
  lat: number,
  lng: number,
  business_type: string,
  location_name: string (opcional)
}

Response: {
  name: string,
  lat: number,
  lng: number,
  opportunity_score: number,
  competition: {
    total_competitors: number,
    competition_level: string,
    average_rating: number
  },
  infrastructure: {
    infrastructure_score: number,
    total_facilities: number
  },
  mobility: {
    mobility_score: number,
    total_transport_options: number
  },
  data_source: string
}
```

## Troubleshooting

### Endereço não encontrado
**Causa:** Endereço incompleto ou não existe

**Solução:** Pedir para usuário incluir cidade e estado
```
❌ "Av. Paulista"
✅ "Av. Paulista, São Paulo, SP"
```

### Análise demora muito
**Causa:** Google Maps API fazendo muitas requisições

**Solução:** Aumentar timeout no `api.ts`:
```typescript
// src/lib/api.ts (linha 13)
timeout: 60000,  // 60 segundos
```

### Erro "REQUEST_DENIED" do Google Maps
**Causa:** API key não configurada ou sem billing

**Solução:** 
1. Verificar se `GOOGLE_MAPS_API_KEY` está no `backend/.env`
2. Habilitar billing no Google Cloud Console

## Melhorias Futuras

- [ ] Autocomplete de endereços (requer Places API paga)
- [ ] Histórico de buscas
- [ ] Salvar locais favoritos
- [ ] Comparar múltiplos locais
- [ ] Exportar relatório em PDF
- [ ] Visualizar área de 1 km no mapa

## Desenvolvedor Responsável

**Nome:** [SEU NOME]  
**Contato:** [SEU EMAIL/DISCORD]  
**Última atualização:** Agosto 2026
