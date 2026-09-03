'use client'

import { useState, useEffect, useRef } from 'react'
import dynamic from 'next/dynamic'
import { motion } from 'framer-motion'
import {
  Search,
  Loader2,
  MapPin,
  Radar,
  ArrowUpRight,
  ScanLine,
  SlidersHorizontal,
  Info,
  Crosshair,
  Briefcase,
} from 'lucide-react'
import VoiceInput from './VoiceInput'
import {
  analyzeWithAI,
  getBusinesses,
  getRegions,
  searchAddress,
  type AIAnalysisResult,
} from '@/lib/api'
import { BUSINESSES } from '@/lib/data'
import type { AnalysisResult, Business, Region } from '@/types'

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
  onGoToInvestor,
}: Props) {
  const [businesses, setBusinesses] = useState<Business[]>(BUSINESSES)
  const [regions, setRegions] = useState<Region[]>([])
  const [budget, setBudget] = useState<number>(100000)
  const [error, setError] = useState<string | null>(null)

  const [customAddress, setCustomAddress] = useState('')
  const [searchingAddress, setSearchingAddress] = useState(false)
  const [customLocationResult, setCustomLocationResult] =
    useState<AIAnalysisResult | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [suggestions, setSuggestions] = useState<
    Array<{
      place_id: string
      description: string
      structured_formatting: { main_text: string; secondary_text: string }
      geometry: { location: { lat: number; lng: number } }
    }>
  >([])
  const [showSuggestions, setShowSuggestions] = useState(false)

  // Handle address input change with autocomplete
  const handleAddressChange = async (value: string) => {
    setCustomAddress(value)

    if (!value.trim() || value.length < 3) {
      setSuggestions([])
      setShowSuggestions(false)
      return
    }

    try {
      const data = await searchAddress(value)

      if (data && data.length > 0) {
        // Converter formato Nominatim para o formato esperado
        const formattedSuggestions = data.map((item: any) => ({
          place_id: item.place_id.toString(),
          description: item.display_name,
          structured_formatting: {
            main_text: item.name || item.display_name.split(',')[0],
            secondary_text: item.display_name
              .split(',')
              .slice(1)
              .join(',')
              .trim(),
          },
          geometry: {
            location: {
              lat: parseFloat(item.lat),
              lng: parseFloat(item.lon),
            },
          },
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
  const handleSuggestionClick = (description: string) => {
    setCustomAddress(description)
    setShowSuggestions(false)
  }

  useEffect(() => {
    Promise.allSettled([getBusinesses(), getRegions()]).then(
      ([businessResult, regionResult]) => {
        if (businessResult.status === 'fulfilled') {
          const normalized = businessResult.value
            .map((business) => {
              if (typeof business !== 'string') return business
              const key = business.toLocaleLowerCase('pt-BR')
              return BUSINESSES.find(
                (candidate) =>
                  candidate.id.toLocaleLowerCase('pt-BR') === key ||
                  candidate.name.toLocaleLowerCase('pt-BR') === key
              )
            })
            .filter((business): business is Business => Boolean(business))
          if (normalized.length) setBusinesses(normalized)
        }
        if (regionResult.status === 'fulfilled') {
          setRegions(regionResult.value)
        }
      }
    )
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
    if (searchingAddress) return
    setShowSuggestions(false)
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
      const data = await searchAddress(customAddress)

      if (!data || data.length === 0) {
        throw new Error(
          'Endereço não encontrado. Tente ser mais específico (inclua cidade e estado).'
        )
      }

      const lat = parseFloat(data[0].lat)
      const lng = parseFloat(data[0].lon)
      const locationName = data[0].display_name

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
      setError(
        err.message ||
          'Não foi possível encontrar o endereço. Digite o endereço completo com cidade e estado.'
      )
    } finally {
      setSearchingAddress(false)
    }
  }

  const selectedBusinessData = businesses.find((b) => b.id === selectedBusiness)

  return (
    <div className="page-container">
      <section className="discovery-hero" aria-labelledby="discovery-title">
        <div className="hero-copy">
          <span className="eyebrow">
            <span className="status-dot" /> INTELIGÊNCIA PARA EMPREENDER
          </span>
          <h1 id="discovery-title">
            O próximo grande negócio <br />
            começa com uma <em>boa descoberta.</em>
          </h1>
          <p>
            Explore localizações, entenda o mercado e encontre espaço para a sua
            ideia crescer.
          </p>
          <div className="hero-tags">
            <span>
              <MapPin size={14} /> Explore a região
            </span>
            <span>
              <ScanLine size={14} /> Descubra o potencial
            </span>
            <span>
              <Briefcase size={14} /> Decida com contexto
            </span>
          </div>
        </div>
        <div className="radar-art" aria-hidden="true">
          <div className="radar-orbit orbit-outer" />
          <div className="radar-orbit orbit-middle" />
          <div className="radar-orbit orbit-inner" />
          <div className="radar-axis axis-x" />
          <div className="radar-axis axis-y" />
          <div className="radar-sweep" />
          <Radar className="radar-center" size={28} />
          <span className="radar-point point-one" />
          <span className="radar-point point-two" />
          <span className="radar-coordinate">23°33′ S · 46°38′ O</span>
          <span className="radar-caption">
            NOVAS PERSPECTIVAS, NOVAS POSSIBILIDADES
          </span>
        </div>
      </section>
      <div className="section-heading">
        <div>
          <span className="eyebrow">SEU RADAR, SEU PRÓXIMO PASSO</span>
          <h2>Explore uma oportunidade</h2>
        </div>
        <span className="subtle-badge">
          <Crosshair size={14} /> Análise em um raio de 1 km
        </span>
      </div>
      <div className="explore-grid">
        <div className="analysis-sidebar">
          <div className="panel analysis-form space-y-5">
            <div className="panel-heading">
              <span className="icon-tile">
                <SlidersHorizontal size={19} />
              </span>
              <div>
                <h3>Configure sua análise</h3>
                <p>Da localização à oportunidade.</p>
              </div>
            </div>
            <div>
              <label htmlFor="analysis-address" className="field-label">
                <span className="step-number">01</span> Onde você quer
                empreender?
              </label>
              <div className="relative">
                <input
                  id="analysis-address"
                  ref={inputRef}
                  type="text"
                  value={customAddress}
                  aria-describedby={
                    error ? 'analysis-error address-help' : 'address-help'
                  }
                  aria-invalid={Boolean(error)}
                  onChange={(e) => handleAddressChange(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSearchAddress()
                    if (e.key === 'Escape') setShowSuggestions(false)
                  }}
                  onFocus={() => customAddress && setShowSuggestions(true)}
                  onBlur={() =>
                    setTimeout(() => setShowSuggestions(false), 200)
                  }
                  placeholder="Rua, número, cidade e estado"
                  className="field-control pr-10"
                  autoComplete="off"
                />
                <MapPin
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
                  size={16}
                />
                {showSuggestions && suggestions.length > 0 && (
                  <div
                    className="address-suggestions"
                    aria-label="Sugestões de endereços"
                  >
                    {suggestions.map((suggestion) => (
                      <button
                        key={suggestion.place_id}
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() =>
                          handleSuggestionClick(suggestion.description)
                        }
                        className="suggestion-item"
                      >
                        <MapPin
                          className="text-accent flex-shrink-0 mt-0.5"
                          size={16}
                        />
                        <span className="min-w-0">
                          <span className="block text-sm text-white">
                            {suggestion.structured_formatting.main_text}
                          </span>
                          <span className="block text-xs text-slate-400">
                            {suggestion.structured_formatting.secondary_text}
                          </span>
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <p id="address-help" className="field-help">
                Ex.: Avenida Paulista, 1000, São Paulo, SP.
              </p>
            </div>
            <div>
              <label htmlFor="analysis-business" className="field-label">
                <span className="step-number">02</span> Qual é a sua ideia?
              </label>
              <select
                id="analysis-business"
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
                  Investimento mínimo: R${' '}
                  {selectedBusinessData.min_investment.toLocaleString('pt-BR')}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="analysis-budget" className="field-label">
                <span className="step-number">03</span> Quanto pretende
                investir?
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  id="analysis-budget"
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
              <p id="analysis-error" role="alert" className="error-message">
                {error}
              </p>
            )}

            <button
              onClick={handleSearchAddress}
              disabled={
                searchingAddress || !customAddress.trim() || !selectedBusiness
              }
              className="primary-button w-full"
            >
              {searchingAddress ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Analisando localização...
                </>
              ) : (
                <>
                  <Search size={16} />
                  Encontrar oportunidades
                </>
              )}
            </button>
          </div>

          <VoiceInput onResult={handleVoiceResult} />
          {searchingAddress && (
            <p className="field-help flex items-center gap-2" role="status">
              <Loader2 size={14} className="animate-spin" /> Consultando o
              mercado. Isso pode levar alguns instantes.
            </p>
          )}
          {customLocationResult && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="panel result-panel space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-700">
                <h3 className="font-semibold text-white text-sm flex items-center gap-2">
                  <MapPin size={16} className="text-accent" />
                  Análise Completa com IA
                </h3>
                <button
                  onClick={() => setCustomLocationResult(null)}
                  className="text-slate-400 hover:text-white text-xs px-3 py-2"
                >
                  Limpar
                </button>
              </div>

              <div className="space-y-4">
                {/* Score Principal */}
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-accent/20 to-accent/5 border border-accent/30 rounded-xl">
                  <div>
                    <p className="text-xs text-slate-400">
                      Score de Oportunidade
                    </p>
                    <p className="text-sm text-slate-300 mt-1">
                      {customLocationResult.recommendations?.viability || 'N/A'}
                    </p>
                  </div>
                  <span className="text-4xl font-bold text-accent">
                    {customLocationResult.opportunity_score}
                  </span>
                </div>

                {/* Resumo */}
                {customLocationResult.summary && (
                  <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700">
                    <p className="text-xs text-slate-400 mb-1">📝 Resumo</p>
                    <p className="text-sm text-white leading-relaxed">
                      {customLocationResult.summary}
                    </p>
                  </div>
                )}

                {/* Concorrência */}
                {customLocationResult.competition && (
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-accent">
                      🏪 Concorrência
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="p-2 bg-slate-800/50 rounded">
                        <p className="text-xs text-slate-400">Total</p>
                        <p className="text-sm font-semibold text-white">
                          {customLocationResult.competition.total_competitors}
                        </p>
                      </div>
                      <div className="p-2 bg-slate-800/50 rounded">
                        <p className="text-xs text-slate-400">Nível</p>
                        <p className="text-sm font-semibold text-white">
                          {customLocationResult.competition.competition_level}
                        </p>
                      </div>
                    </div>
                    {customLocationResult.competition.market_gap && (
                      <p className="text-xs text-slate-300 italic">
                        💡 {customLocationResult.competition.market_gap}
                      </p>
                    )}
                  </div>
                )}

                {/* Demografia */}
                {customLocationResult.demographics && (
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-accent">
                      👥 Demografia
                    </p>
                    <div className="space-y-1">
                      <p className="text-xs text-slate-300">
                        <span className="text-slate-400">Público-alvo:</span>{' '}
                        {customLocationResult.demographics.target_audience}
                      </p>
                      <div className="grid grid-cols-3 gap-2">
                        <div className="p-2 bg-slate-800/50 rounded text-center">
                          <p className="text-xs text-slate-400">Renda</p>
                          <p className="text-xs font-semibold text-white">
                            {customLocationResult.demographics.income_level}
                          </p>
                        </div>
                        <div className="p-2 bg-slate-800/50 rounded text-center">
                          <p className="text-xs text-slate-400">Densidade</p>
                          <p className="text-xs font-semibold text-white">
                            {
                              customLocationResult.demographics
                                .population_density
                            }
                          </p>
                        </div>
                        <div className="p-2 bg-slate-800/50 rounded text-center">
                          <p className="text-xs text-slate-400">Idade</p>
                          <p
                            className="text-xs font-semibold text-white truncate"
                            title={
                              customLocationResult.demographics.age_profile
                            }
                          >
                            {
                              customLocationResult.demographics.age_profile?.split(
                                ' '
                              )[0]
                            }
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Scores */}
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-accent">
                    📊 Indicadores
                  </p>
                  <div className="space-y-2">
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-400">
                          🏗️ Infraestrutura
                        </span>
                        <span className="text-white font-semibold">
                          {customLocationResult.infrastructure
                            ?.infrastructure_score || 0}
                          /100
                        </span>
                      </div>
                      <div className="w-full bg-slate-700 rounded-full h-2">
                        <div
                          className="bg-accent h-2 rounded-full transition-all"
                          style={{
                            width: `${customLocationResult.infrastructure?.infrastructure_score || 0}%`,
                          }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-400">🚌 Mobilidade</span>
                        <span className="text-white font-semibold">
                          {customLocationResult.mobility?.mobility_score || 0}
                          /100
                        </span>
                      </div>
                      <div className="w-full bg-slate-700 rounded-full h-2">
                        <div
                          className="bg-accent h-2 rounded-full transition-all"
                          style={{
                            width: `${customLocationResult.mobility?.mobility_score || 0}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* SWOT */}
                {customLocationResult.swot && (
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-accent">
                      ⚖️ Análise SWOT
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="p-2 bg-green-900/20 border border-green-700/30 rounded">
                        <p className="text-xs font-semibold text-green-400 mb-1">
                          ✓ Forças
                        </p>
                        <ul className="text-xs text-slate-300 space-y-0.5">
                          {customLocationResult.swot.strengths
                            ?.slice(0, 2)
                            .map((s, i) => (
                              <li key={i}>• {s}</li>
                            ))}
                        </ul>
                      </div>
                      <div className="p-2 bg-blue-900/20 border border-blue-700/30 rounded">
                        <p className="text-xs font-semibold text-blue-400 mb-1">
                          ⭐ Oportunidades
                        </p>
                        <ul className="text-xs text-slate-300 space-y-0.5">
                          {customLocationResult.swot.opportunities
                            ?.slice(0, 2)
                            .map((o, i) => (
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
                    <p className="text-xs font-semibold text-accent">
                      💡 Insights Principais
                    </p>
                    <ul className="text-xs text-slate-300 space-y-1">
                      {customLocationResult.recommendations.key_insights.map(
                        (insight, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="text-accent">•</span>
                            <span>{insight}</span>
                          </li>
                        )
                      )}
                    </ul>
                  </div>
                )}

                {/* Fonte dos Dados */}
                {customLocationResult.data_source && (
                  <div className="text-xs text-slate-500 border-t border-slate-700 pt-2">
                    <span className="flex items-center gap-1">
                      {customLocationResult.data_source.includes('IA') ||
                      customLocationResult.data_source.includes('ChatGPT') ? (
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

        <div className="map-column">
          <section
            className="map-panel panel"
            aria-label="Mapa de oportunidades"
          >
            <div className="map-toolbar">
              <div>
                <span className="icon-tile">
                  <MapPin size={18} />
                </span>
                <div>
                  <h3>Seu território de possibilidades</h3>
                  <p>Explore o mapa e encontre o seu lugar.</p>
                </div>
              </div>
              <span className="subtle-badge">Mapa interativo</span>
            </div>
            <div className="map-canvas">
              <MapComponent
                regions={regions}
                selectedRegion={selectedRegion}
                onRegionSelect={setSelectedRegion}
                analysisResult={analysisResult}
                hotspots={[]}
                focusLocation={customLocationResult?.location}
              />
            </div>
            <div className="map-caption">
              <Info size={14} />
              <span>
                Arraste para explorar e use + / − para aproximar. A análise
                aparece após a busca.
              </span>
            </div>
          </section>
          <div className="discovery-notes">
            <div>
              <span className="icon-tile">
                <ScanLine size={20} />
              </span>
              <h3>Veja além do endereço</h3>
              <p>
                Concorrência, perfil do público e mobilidade reunidos para
                apoiar sua decisão.
              </p>
            </div>
            <div>
              <span className="icon-tile">
                <Briefcase size={20} />
              </span>
              <h3>Coloque sua visão à prova</h3>
              <p>Experimente decisões de negócio com um orçamento virtual.</p>
              <button className="text-link" onClick={onGoToInvestor}>
                Explorar modo investidor <ArrowUpRight size={15} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
