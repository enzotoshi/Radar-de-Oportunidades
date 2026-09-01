'use client'

import { useState, useEffect, useRef } from 'react'
import dynamic from 'next/dynamic'
import { motion } from 'framer-motion'
import { Search, Loader2, MapPin } from 'lucide-react'
import VoiceInput from './VoiceInput'
import { BUSINESSES } from '@/lib/data'
import type { AnalysisResult, Business } from '@/types'

const MapComponent = dynamic(() => import('./MapComponent'), { ssr: false })

interface Props {
  selectedRegion: string
  setSelectedRegion: (v: string) => void
  selectedBusiness: string
  setSelectedBusiness: (v: string) => void
  analysisResult: AnalysisResult | null
  setAnalysisResult: (v: AnalysisResult | null) => void
  onGoToInvestor: () => void
}

export default function MapAnalysis({
  selectedRegion,
  setSelectedRegion,
  selectedBusiness,
  setSelectedBusiness,
  analysisResult,
  setAnalysisResult,
  onGoToInvestor,
}: Props) {
  const [businesses, setBusinesses] = useState<Business[]>(BUSINESSES)
  const [budget, setBudget] = useState<number>(100000)
  const [error, setError] = useState<string | null>(null)
  
  const [customAddress, setCustomAddress] = useState('')
  const [searchingAddress, setSearchingAddress] = useState(false)
  const [customLocationResult, setCustomLocationResult] = useState<any>(null)
  const [selectedPlace, setSelectedPlace] = useState<google.maps.places.PlaceResult | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [mapsLoaded, setMapsLoaded] = useState(false)
  const [suggestions, setSuggestions] = useState<google.maps.places.AutocompletePrediction[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const autocompleteService = useRef<google.maps.places.AutocompleteService | null>(null)
  const placesService = useRef<google.maps.places.PlacesService | null>(null)

  // Wait for Google Maps to load
  useEffect(() => {
    const checkGoogleMaps = setInterval(() => {
      if (window.google && window.google.maps && window.google.maps.places) {
        setMapsLoaded(true)
        
        // Still using legacy APIs (they will work until at least 2026)
        autocompleteService.current = new window.google.maps.places.AutocompleteService()
        
        // Create a dummy div for PlacesService
        const dummyDiv = document.createElement('div')
        placesService.current = new window.google.maps.places.PlacesService(dummyDiv)
        
        clearInterval(checkGoogleMaps)
      }
    }, 100)

    return () => clearInterval(checkGoogleMaps)
  }, [])

  // Handle address input change with autocomplete
  const handleAddressChange = async (value: string) => {
    setCustomAddress(value)
    
    if (!value.trim() || value.length < 3) {
      setSuggestions([])
      setShowSuggestions(false)
      return
    }

    try {
      // Usar Nominatim para autocomplete (gratuito!)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(value)}&countrycodes=br&limit=5&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'Radar-Oportunidades-App',
            'Accept-Language': 'pt-BR,pt'
          }
        }
      )
      
      const data = await response.json()
      
      if (data && data.length > 0) {
        // Converter formato Nominatim para o formato esperado
        const formattedSuggestions = data.map((item: any) => ({
          place_id: item.place_id.toString(),
          description: item.display_name,
          structured_formatting: {
            main_text: item.name || item.display_name.split(',')[0],
            secondary_text: item.display_name.split(',').slice(1).join(',').trim()
          },
          geometry: {
            location: {
              lat: parseFloat(item.lat),
              lng: parseFloat(item.lon)
            }
          }
        }))
        
        setSuggestions(formattedSuggestions)
        setShowSuggestions(true)
      } else {
        setSuggestions([])
        setShowSuggestions(false)
      }
    } catch (err) {
      console.error('Erro ao buscar sugestões:', err)
      setSuggestions([])
      setShowSuggestions(false)
    }
  }

  // Handle suggestion click
  const handleSuggestionClick = (placeId: string, description: string) => {
    setCustomAddress(description)
    setShowSuggestions(false)
    
    // Buscar coordenadas do local selecionado
    const selectedSuggestion = suggestions.find(s => s.place_id === placeId)
    if (selectedSuggestion && selectedSuggestion.geometry) {
      setSelectedPlace(selectedSuggestion as any)
    }
  }

  useEffect(() => {
    import('@/lib/api').then(({ getBusinesses }) => {
      getBusinesses()
        .then((b) => {
          if (b.length) setBusinesses(b)
        })
        .catch(() => {})
    })
  }, [])

  const handleVoiceResult = (
    _transcript: string,
    entities: Record<string, string | null>
  ) => {
    if (entities.location) setCustomAddress(entities.location)
    if (entities.business_type) setSelectedBusiness(entities.business_type)
    if (entities.budget) setBudget(Number(entities.budget))
  }

  const handleSearchAddress = async () => {
    if (!customAddress.trim()) {
      setError('Digite um endereço para buscar.')
      return
    }
    if (!selectedBusiness) {
      setError('Selecione um tipo de negócio antes de analisar o local.')
      return
    }

    setError(null)
    setSearchingAddress(true)
    setCustomLocationResult(null)

    try {
      // Buscar coordenadas via Nominatim
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(customAddress)}&countrycodes=br&limit=1`,
        {
          headers: {
            'User-Agent': 'Radar-Oportunidades-App'
          }
        }
      )
      
      const data = await response.json()
      
      if (!data || data.length === 0) {
        throw new Error('Endereço não encontrado. Tente ser mais específico (inclua cidade e estado).')
      }

      const lat = parseFloat(data[0].lat)
      const lng = parseFloat(data[0].lon)
      const locationName = data[0].display_name

      // Usar análise com IA (ChatGPT)
      const { analyzeWithAI } = await import('@/lib/api')
      const analysis = await analyzeWithAI(
        locationName,
        selectedBusiness,
        lat,
        lng,
        budget
      )
      
      setCustomLocationResult(analysis)
      
    } catch (err: any) {
      console.error('Erro ao buscar endereço:', err)
      setError(err.message || 'Não foi possível encontrar o endereço. Digite o endereço completo com cidade e estado.')
    } finally {
      setSearchingAddress(false)
    }
  }

  const selectedBusinessData = businesses.find((b) => b.id === selectedBusiness)

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-80px)]">
      <div className="w-full lg:w-[420px] flex-shrink-0 overflow-y-auto p-4 space-y-4 border-r border-slate-800">
        <VoiceInput onResult={handleVoiceResult} />

        <div className="bg-surface-card rounded-2xl p-4 border border-slate-700 space-y-4">
          <h2 className="font-semibold text-white text-sm">Análise de Localização</h2>

          <div>
            <label className="block text-xs text-slate-400 mb-1.5 font-medium">
              📍 Endereço Completo
            </label>
            <div className="relative">
              <input
                ref={inputRef}
                type="text"
                value={customAddress}
                onChange={(e) => handleAddressChange(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearchAddress()}
                onFocus={() => customAddress && setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                placeholder="Ex: Avenida Paulista, 1000, São Paulo, SP"
                className="w-full bg-surface border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-accent transition-colors pr-10"
                autoComplete="off"
              />
              <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
              
              {/* Sugestões de Autocomplete */}
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute z-50 w-full mt-1 bg-surface-card border border-slate-700 rounded-xl shadow-2xl overflow-hidden">
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={suggestion.place_id}
                      onClick={() => handleSuggestionClick(suggestion.place_id, suggestion.description)}
                      className="w-full text-left px-4 py-3 hover:bg-accent/20 transition-colors border-b border-slate-800 last:border-b-0 flex items-start gap-3"
                    >
                      <MapPin className="text-accent flex-shrink-0 mt-0.5" size={16} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white truncate">
                          {suggestion.structured_formatting?.main_text || suggestion.description.split(',')[0]}
                        </p>
                        <p className="text-xs text-slate-400 truncate">
                          {suggestion.structured_formatting?.secondary_text || suggestion.description}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-1.5">
              💡 Digite para ver sugestões automáticas. Exemplo: "Av. Paulista, 1000, São Paulo"
            </p>
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1.5 font-medium">
              💼 Tipo de Negócio
            </label>
            <select
              value={selectedBusiness}
              onChange={(e) => setSelectedBusiness(e.target.value)}
              className="w-full bg-surface border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-accent transition-colors"
            >
              <option value="">Selecione um negócio...</option>
              {businesses.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.icon} {b.name}
                </option>
              ))}
            </select>
            {selectedBusinessData && (
              <p className="text-xs text-slate-500 mt-1 truncate">
                Investimento mínimo: R$ {selectedBusinessData.min_investment.toLocaleString('pt-BR')}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1.5 font-medium">
              💰 Orçamento Disponível
            </label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min={20000}
                max={1000000}
                step={10000}
                value={budget}
                onChange={(e) => setBudget(Number(e.target.value))}
                className="flex-1"
                aria-label="Orçamento disponível"
              />
              <span className="text-sm font-bold text-accent whitespace-nowrap min-w-[96px] text-right">
                R$ {budget.toLocaleString('pt-BR')}
              </span>
            </div>
          </div>

          {error && (
            <p className="text-xs text-red-400 bg-red-500/10 rounded-lg p-2">{error}</p>
          )}

          <button
            onClick={handleSearchAddress}
            disabled={searchingAddress || !customAddress.trim() || !selectedBusiness}
            className="w-full flex items-center justify-center gap-2 py-3 bg-accent hover:bg-accent-600 disabled:opacity-50 disabled:cursor-not-allowed text-surface font-semibold rounded-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-lg"
          >
            {searchingAddress ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Analisando Localização...
              </>
            ) : (
              <>
                <Search size={16} />
                Analisar Local
              </>
            )}
          </button>
        </div>

        {customLocationResult && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-surface-card rounded-2xl p-4 border border-accent/30 space-y-3 max-h-[600px] overflow-y-auto"
          >
            <div className="flex items-center justify-between sticky top-0 bg-surface-card pb-2 border-b border-slate-700">
              <h3 className="font-semibold text-white text-sm flex items-center gap-2">
                <MapPin size={16} className="text-accent" />
                Análise Completa com IA
              </h3>
              <button
                onClick={() => setCustomLocationResult(null)}
                className="text-slate-400 hover:text-white text-xs"
              >
                Limpar
              </button>
            </div>

            <div className="space-y-4">
              {/* Score Principal */}
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-accent/20 to-accent/5 border border-accent/30 rounded-xl">
                <div>
                  <p className="text-xs text-slate-400">Score de Oportunidade</p>
                  <p className="text-sm text-slate-300 mt-1">{customLocationResult.recommendations?.viability || 'N/A'}</p>
                </div>
                <span className="text-4xl font-bold text-accent">
                  {customLocationResult.opportunity_score}
                </span>
              </div>

              {/* Resumo */}
              {customLocationResult.summary && (
                <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700">
                  <p className="text-xs text-slate-400 mb-1">📝 Resumo</p>
                  <p className="text-sm text-white leading-relaxed">{customLocationResult.summary}</p>
                </div>
              )}

              {/* Concorrência */}
              {customLocationResult.competition && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-accent">🏪 Concorrência</p>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2 bg-slate-800/50 rounded">
                      <p className="text-xs text-slate-400">Total</p>
                      <p className="text-sm font-semibold text-white">{customLocationResult.competition.total_competitors}</p>
                    </div>
                    <div className="p-2 bg-slate-800/50 rounded">
                      <p className="text-xs text-slate-400">Nível</p>
                      <p className="text-sm font-semibold text-white">{customLocationResult.competition.competition_level}</p>
                    </div>
                  </div>
                  {customLocationResult.competition.market_gap && (
                    <p className="text-xs text-slate-300 italic">💡 {customLocationResult.competition.market_gap}</p>
                  )}
                </div>
              )}

              {/* Demografia */}
              {customLocationResult.demographics && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-accent">👥 Demografia</p>
                  <div className="space-y-1">
                    <p className="text-xs text-slate-300">
                      <span className="text-slate-400">Público-alvo:</span> {customLocationResult.demographics.target_audience}
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="p-2 bg-slate-800/50 rounded text-center">
                        <p className="text-xs text-slate-400">Renda</p>
                        <p className="text-xs font-semibold text-white">{customLocationResult.demographics.income_level}</p>
                      </div>
                      <div className="p-2 bg-slate-800/50 rounded text-center">
                        <p className="text-xs text-slate-400">Densidade</p>
                        <p className="text-xs font-semibold text-white">{customLocationResult.demographics.population_density}</p>
                      </div>
                      <div className="p-2 bg-slate-800/50 rounded text-center">
                        <p className="text-xs text-slate-400">Idade</p>
                        <p className="text-xs font-semibold text-white truncate" title={customLocationResult.demographics.age_profile}>
                          {customLocationResult.demographics.age_profile.split(' ')[0]}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Scores */}
              <div className="space-y-2">
                <p className="text-xs font-semibold text-accent">📊 Indicadores</p>
                <div className="space-y-2">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-400">🏗️ Infraestrutura</span>
                      <span className="text-white font-semibold">{customLocationResult.infrastructure?.infrastructure_score || 0}/100</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2">
                      <div 
                        className="bg-accent h-2 rounded-full transition-all" 
                        style={{width: `${customLocationResult.infrastructure?.infrastructure_score || 0}%`}}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-400">🚌 Mobilidade</span>
                      <span className="text-white font-semibold">{customLocationResult.mobility?.mobility_score || 0}/100</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2">
                      <div 
                        className="bg-accent h-2 rounded-full transition-all" 
                        style={{width: `${customLocationResult.mobility?.mobility_score || 0}%`}}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* SWOT */}
              {customLocationResult.swot && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-accent">⚖️ Análise SWOT</p>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2 bg-green-900/20 border border-green-700/30 rounded">
                      <p className="text-xs font-semibold text-green-400 mb-1">✓ Forças</p>
                      <ul className="text-xs text-slate-300 space-y-0.5">
                        {customLocationResult.swot.strengths?.slice(0, 2).map((s, i) => (
                          <li key={i}>• {s}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="p-2 bg-blue-900/20 border border-blue-700/30 rounded">
                      <p className="text-xs font-semibold text-blue-400 mb-1">⭐ Oportunidades</p>
                      <ul className="text-xs text-slate-300 space-y-0.5">
                        {customLocationResult.swot.opportunities?.slice(0, 2).map((o, i) => (
                          <li key={i}>• {o}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* Insights Principais */}
              {customLocationResult.recommendations?.key_insights && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-accent">💡 Insights Principais</p>
                  <ul className="text-xs text-slate-300 space-y-1">
                    {customLocationResult.recommendations.key_insights.map((insight, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-accent">•</span>
                        <span>{insight}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Fonte dos Dados */}
              {customLocationResult.data_source && (
                <div className="text-xs text-slate-500 border-t border-slate-700 pt-2">
                  <span className="flex items-center gap-1">
                    {customLocationResult.data_source.includes('IA') || customLocationResult.data_source.includes('ChatGPT') ? (
                      <>
                        <span className="inline-block w-2 h-2 rounded-full bg-purple-500"></span>
                        <span>{customLocationResult.data_source}</span>
                      </>
                    ) : (
                      <>
                        <span className="inline-block w-2 h-2 rounded-full bg-yellow-500"></span>
                        <span>{customLocationResult.data_source}</span>
                      </>
                    )}
                  </span>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>

      <div className="flex-1 p-4 min-h-[400px]">
        <div className="h-full relative">
          <div className="absolute top-3 right-3 z-[1000] bg-surface-card border border-slate-700 rounded-xl p-3 text-xs space-y-1.5 shadow-lg max-w-[240px]">
            <p className="font-semibold text-slate-300 mb-2">💡 Como usar</p>
            <p className="text-slate-400">
              1. Digite um endereço no campo à esquerda
              <br />2. Selecione das sugestões que aparecem
              <br />3. Escolha o tipo de negócio
              <br />4. Clique em "Analisar Local"
            </p>
            <div className="border-t border-slate-700 pt-2 mt-2">
              <p className="text-slate-500">
                A análise cobre <span className="text-accent font-semibold">1 km de raio</span> ao redor do local escolhido
              </p>
            </div>
          </div>

          <MapComponent
            regions={[]}
            selectedRegion={selectedRegion}
            onRegionSelect={setSelectedRegion}
            analysisResult={analysisResult}
            hotspots={[]}
          />
        </div>
      </div>
    </div>
  )
}
