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
        console.log('Google Maps loaded successfully!')
        setMapsLoaded(true)
        autocompleteService.current = new window.google.maps.places.AutocompleteService()
        console.log('AutocompleteService created:', autocompleteService.current)
        
        // Create a dummy div for PlacesService
        const dummyDiv = document.createElement('div')
        placesService.current = new window.google.maps.places.PlacesService(dummyDiv)
        console.log('PlacesService created:', placesService.current)
        
        clearInterval(checkGoogleMaps)
      }
    }, 100)

    return () => clearInterval(checkGoogleMaps)
  }, [])

  // Handle address input change
  const handleAddressChange = (value: string) => {
    setCustomAddress(value)
    
    if (!value.trim() || !autocompleteService.current) {
      console.log('Clearing suggestions:', !value.trim() ? 'empty input' : 'no service')
      setSuggestions([])
      setShowSuggestions(false)
      return
    }

    console.log('Getting predictions for:', value)

    // Get predictions from Google Places
    autocompleteService.current.getPlacePredictions(
      {
        input: value,
        componentRestrictions: { country: 'br' },
      },
      (predictions, status) => {
        console.log('Autocomplete status:', status)
        console.log('Predictions:', predictions)
        
        if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
          setSuggestions(predictions)
          setShowSuggestions(true)
          console.log('Showing', predictions.length, 'suggestions')
        } else {
          setSuggestions([])
          setShowSuggestions(false)
          console.log('No suggestions - status:', status)
        }
      }
    )
  }

  // Handle suggestion click
  const handleSuggestionClick = (placeId: string, description: string) => {
    setCustomAddress(description)
    setShowSuggestions(false)
    
    // Get place details
    if (placesService.current) {
      placesService.current.getDetails(
        {
          placeId: placeId,
          fields: ['geometry', 'formatted_address', 'name'],
        },
        (place, status) => {
          if (status === window.google.maps.places.PlacesServiceStatus.OK && place) {
            setSelectedPlace(place as any)
          }
        }
      )
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
      // Use Nominatim (OpenStreetMap) for geocoding - FREE!
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

      const { analyzeCustomLocation } = await import('@/lib/api')
      const analysis = await analyzeCustomLocation(lat, lng, selectedBusiness, locationName)
      
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
                onChange={(e) => setCustomAddress(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearchAddress()}
                placeholder="Ex: Avenida Paulista, 1000, São Paulo, SP"
                className="w-full bg-surface border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-accent transition-colors pr-10"
              />
              <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
            </div>
            <p className="text-xs text-slate-500 mt-1.5">
              Digite o endereço completo incluindo cidade e estado. Exemplo: "Av. Paulista, 1000, São Paulo, SP"
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
            className="bg-surface-card rounded-2xl p-4 border border-accent/30 space-y-3"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-white text-sm flex items-center gap-2">
                <MapPin size={16} className="text-accent" />
                Resultado da Análise
              </h3>
              <button
                onClick={() => setCustomLocationResult(null)}
                className="text-slate-400 hover:text-white text-xs"
              >
                Limpar
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <p className="text-xs text-slate-400 mb-1">📍 Local Analisado</p>
                <p className="text-sm text-white">{customLocationResult.name || customAddress}</p>
              </div>

              <div className="flex items-center justify-between p-3 bg-accent/10 border border-accent/30 rounded-xl">
                <span className="text-sm text-slate-300">Score de Oportunidade</span>
                <span className="text-2xl font-bold text-accent">
                  {customLocationResult.opportunity_score.toFixed(0)}
                </span>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">🏪 Concorrentes (1 km)</span>
                  <span className="text-white font-semibold">
                    {customLocationResult.competition.total_competitors}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">📊 Nível de concorrência</span>
                  <span className="text-white font-semibold">
                    {customLocationResult.competition.competition_level}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">⭐ Rating médio</span>
                  <span className="text-white font-semibold">
                    {customLocationResult.competition.average_rating.toFixed(1)} ⭐
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">🏗️ Infraestrutura</span>
                  <span className="text-white font-semibold">
                    {customLocationResult.infrastructure.infrastructure_score.toFixed(0)}/100
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">🚌 Mobilidade</span>
                  <span className="text-white font-semibold">
                    {customLocationResult.mobility.mobility_score.toFixed(0)}/100
                  </span>
                </div>
              </div>

              {customLocationResult.data_source && (
                <div className="text-xs text-slate-500 border-t border-slate-700 pt-2">
                  {customLocationResult.data_source.includes('Real') ? (
                    <span className="flex items-center gap-1">
                      <span className="inline-block w-2 h-2 rounded-full bg-green-500"></span>
                      <span>Análise em tempo real (Google Maps - raio 1 km)</span>
                    </span>
                  ) : (
                    <span className="flex items-center gap-1">
                      <span className="inline-block w-2 h-2 rounded-full bg-yellow-500"></span>
                      <span>Dados Simulados</span>
                    </span>
                  )}
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
