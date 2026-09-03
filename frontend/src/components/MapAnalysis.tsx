'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { motion } from 'framer-motion'
import {
  ArrowUpRight,
  Briefcase,
  Crosshair,
  Database,
  Info,
  Loader2,
  MapPin,
  Radar,
  ScanLine,
  Search,
  SlidersHorizontal,
} from 'lucide-react'
import VoiceInput from './VoiceInput'
import {
  analyzeOpportunity,
  getApiError,
  getBusinesses,
  searchAddress,
} from '@/lib/api'
import type {
  AddressSuggestion,
  AnalysisResult,
  Business,
  MetricDetail,
} from '@/types'

const MapComponent = dynamic(() => import('./MapComponent'), { ssr: false })

interface Props {
  selectedRegion: string
  setSelectedRegion: (value: string) => void
  selectedBusiness: string
  setSelectedBusiness: (value: string) => void
  analysisResult: AnalysisResult | null
  setAnalysisResult: (value: AnalysisResult | null) => void
  onGoToInvestor: () => void
}

function formatMetric(metric: MetricDetail): string {
  if (metric.value === null || metric.value === undefined || metric.value === '') {
    return 'Dado indisponível'
  }
  if (metric.unit === 'BRL' && typeof metric.value === 'number') {
    return metric.value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      maximumFractionDigits: 0,
    })
  }
  if (typeof metric.value === 'number') {
    const formatted = metric.value.toLocaleString('pt-BR', {
      maximumFractionDigits: 2,
    })
    return metric.unit ? formatted + ' ' + metric.unit : formatted
  }
  return metric.unit ? metric.value + ' ' + metric.unit : metric.value
}

const kindLabels: Record<MetricDetail['kind'], string> = {
  real: 'Dado observado',
  estimated: 'Estimativa',
  calculated: 'Cálculo do sistema',
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
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [customAddress, setCustomAddress] = useState(selectedRegion)
  const [selectedLocation, setSelectedLocation] =
    useState<AddressSuggestion | null>(null)
  const [locations, setLocations] = useState<AddressSuggestion[]>([])
  const [budget, setBudget] = useState<number>(100000)
  const [loadingBusinesses, setLoadingBusinesses] = useState(true)
  const [searchingAddress, setSearchingAddress] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getBusinesses()
      .then(setBusinesses)
      .catch((reason) =>
        setError(getApiError(reason, 'Não foi possível carregar os tipos de negócio.')),
      )
      .finally(() => setLoadingBusinesses(false))
  }, [])

  const handleAddressChange = (value: string) => {
    setCustomAddress(value)
    setSelectedLocation(null)
    setLocations([])
    setAnalysisResult(null)
  }

  const handleLocationSearch = async () => {
    if (customAddress.trim().length < 3) {
      setError('Digite ao menos três caracteres para buscar uma localização.')
      return
    }
    setSearchingAddress(true)
    setError(null)
    setSelectedLocation(null)
    setLocations([])
    try {
      const results = await searchAddress(customAddress)
      setLocations(results)
      if (results.length === 0) {
        setError('Nenhuma localização foi encontrada. Tente incluir cidade e estado.')
      }
    } catch (reason) {
      setError(getApiError(reason, 'A geocodificação está indisponível. Tente novamente.'))
    } finally {
      setSearchingAddress(false)
    }
  }

  const chooseLocation = (location: AddressSuggestion) => {
    setSelectedLocation(location)
    setCustomAddress(location.display_name)
    setSelectedRegion(location.display_name)
    setLocations([])
    setAnalysisResult(null)
  }

  const handleAnalyze = async () => {
    if (!selectedLocation) {
      setError('Busque e selecione uma localização verificada antes de analisar.')
      return
    }
    if (!selectedBusiness) {
      setError('Selecione um tipo de negócio.')
      return
    }
    setAnalyzing(true)
    setError(null)
    setAnalysisResult(null)
    try {
      const result = await analyzeOpportunity({
        address: selectedLocation.display_name,
        business_type: selectedBusiness,
        lat: selectedLocation.lat,
        lng: selectedLocation.lng,
        budget,
      })
      setAnalysisResult(result)
    } catch (reason) {
      setError(
        getApiError(
          reason,
          'Não foi possível consultar as fontes públicas. Nenhum valor fictício foi exibido.',
        ),
      )
    } finally {
      setAnalyzing(false)
    }
  }

  const handleVoiceResult = (
    _transcript: string,
    entities: Record<string, string | null>,
  ) => {
    if (entities.location) handleAddressChange(entities.location)
    if (entities.business_type) setSelectedBusiness(entities.business_type)
    if (entities.budget) setBudget(Number(entities.budget))
  }

  return (
    <div className="page-container">
      <section className="discovery-hero" aria-labelledby="discovery-title">
        <div className="hero-copy">
          <span className="eyebrow">
            <span className="status-dot" /> DADOS PÚBLICOS PARA EMPREENDER
          </span>
          <h1 id="discovery-title">
            O próximo grande negócio <br />
            começa com uma <em>boa descoberta.</em>
          </h1>
          <p>
            Consulte registros públicos, entenda as limitações e complemente a
            análise com pesquisa de campo.
          </p>
          <div className="hero-tags">
            <span><MapPin size={14} /> Localização verificada</span>
            <span><Database size={14} /> Fonte e referência</span>
            <span><Briefcase size={14} /> Métrica transparente</span>
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
          <span className="radar-caption">DADOS REAIS · MÉTRICAS IDENTIFICADAS</span>
        </div>
      </section>

      <div className="section-heading">
        <div>
          <span className="eyebrow">SEU RADAR, COM RASTREABILIDADE</span>
          <h2>Analise uma localização</h2>
        </div>
        <span className="subtle-badge">
          <Crosshair size={14} /> Raio de 1,5 km
        </span>
      </div>

      <div className="explore-grid">
        <div className="analysis-sidebar">
          <div className="panel analysis-form space-y-5">
            <div className="panel-heading">
              <span className="icon-tile"><SlidersHorizontal size={19} /></span>
              <div>
                <h3>Configure sua análise</h3>
                <p>Busque, selecione e consulte as fontes.</p>
              </div>
            </div>

            <div>
              <label htmlFor="analysis-address" className="field-label">
                <span className="step-number">01</span> Localização
              </label>
              <div className="flex gap-2">
                <input
                  id="analysis-address"
                  type="text"
                  value={customAddress}
                  onChange={(event) => handleAddressChange(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') handleLocationSearch()
                  }}
                  placeholder="Rua, número, cidade e estado"
                  className="field-control"
                  autoComplete="off"
                />
                <button
                  type="button"
                  className="secondary-button"
                  onClick={handleLocationSearch}
                  disabled={searchingAddress}
                >
                  {searchingAddress ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
                  Buscar
                </button>
              </div>
              <p className="field-help">
                Busca explícita via Nominatim. Selecione um resultado antes de analisar.
              </p>
              {locations.length > 0 && (
                <div className="address-suggestions" aria-label="Resultados de localização">
                  {locations.map((location) => (
                    <button
                      key={location.place_id + location.lat + location.lng}
                      type="button"
                      onClick={() => chooseLocation(location)}
                      className="suggestion-item"
                    >
                      <MapPin className="text-accent flex-shrink-0 mt-0.5" size={16} />
                      <span className="text-left">
                        <span className="block text-sm text-white">{location.display_name}</span>
                        <span className="block text-xs text-slate-400">
                          {location.municipality
                            ? 'Código IBGE ' + location.municipality.ibge_code
                            : 'Código IBGE indisponível'}
                        </span>
                      </span>
                    </button>
                  ))}
                </div>
              )}
              {selectedLocation && (
                <p className="text-xs text-accent mt-2">
                  Localização selecionada
                  {selectedLocation.municipality
                    ? ' · ' + selectedLocation.municipality.name + ' · IBGE ' + selectedLocation.municipality.ibge_code
                    : ' · município não identificado pelo IBGE'}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="analysis-business" className="field-label">
                <span className="step-number">02</span> Tipo de negócio
              </label>
              <select
                id="analysis-business"
                value={selectedBusiness}
                onChange={(event) => {
                  setSelectedBusiness(event.target.value)
                  setAnalysisResult(null)
                }}
                disabled={loadingBusinesses || businesses.length === 0}
                className="w-full bg-surface border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white"
              >
                <option value="">
                  {loadingBusinesses ? 'Carregando catálogo...' : 'Selecione um negócio...'}
                </option>
                {businesses.map((business) => (
                  <option key={business.id} value={business.id}>
                    {business.icon} {business.name}
                  </option>
                ))}
              </select>
              <p className="field-help">Catálogo de filtros; não é uma estatística de mercado.</p>
            </div>

            <div>
              <label htmlFor="analysis-budget" className="field-label">
                <span className="step-number">03</span> Orçamento informado por você
              </label>
              <input
                id="analysis-budget"
                type="number"
                min={1}
                value={budget}
                onChange={(event) => setBudget(Number(event.target.value))}
                className="field-control"
              />
              <p className="field-help">
                Este valor não altera o índice: não há benchmark financeiro verificável no projeto.
              </p>
            </div>

            {error && <p role="alert" className="error-message">{error}</p>}

            <button
              type="button"
              onClick={handleAnalyze}
              disabled={analyzing || !selectedLocation || !selectedBusiness}
              className="primary-button w-full"
            >
              {analyzing ? (
                <><Loader2 size={16} className="animate-spin" /> Consultando fontes...</>
              ) : (
                <><ScanLine size={16} /> Analisar dados reais</>
              )}
            </button>
          </div>

          <VoiceInput onResult={handleVoiceResult} />

          {analysisResult && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="panel result-panel space-y-4"
            >
              <div className="flex items-start justify-between gap-4 pb-3 border-b border-slate-700">
                <div>
                  <p className="text-xs text-slate-400">{analysisResult.score_label}</p>
                  <p className="text-4xl font-bold text-accent">
                    {analysisResult.opportunity_score.toFixed(1)}
                    <span className="text-sm text-slate-400">/100</span>
                  </p>
                  <p className="text-xs text-slate-400 mt-1">{analysisResult.classification}</p>
                </div>
                <button
                  type="button"
                  className="text-xs text-slate-400 hover:text-white"
                  onClick={() => setAnalysisResult(null)}
                >
                  Limpar
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {Object.entries(analysisResult.metrics).map(([key, metric]) => (
                  <div key={key} className="p-3 bg-slate-800/50 rounded-lg border border-slate-700">
                    <p className="text-xs text-slate-400">{metric.label}</p>
                    <p className="text-sm font-semibold text-white mt-1">{formatMetric(metric)}</p>
                    <p className="text-[11px] text-accent mt-1">{kindLabels[metric.kind]}</p>
                    <p className="text-[11px] text-slate-500 mt-1">{metric.source}</p>
                    {metric.reference && (
                      <p className="text-[11px] text-slate-500">Referência: {metric.reference}</p>
                    )}
                  </div>
                ))}
              </div>

              <div className="p-3 bg-slate-800/50 rounded-lg">
                <p className="text-xs font-semibold text-accent mb-1">Como interpretar</p>
                <p className="text-sm text-slate-300">{analysisResult.explanation}</p>
                <p className="text-sm text-white mt-2">{analysisResult.recommendation}</p>
              </div>

              <div className="p-3 border border-slate-700 rounded-lg">
                <p className="text-xs font-semibold text-accent mb-1">Metodologia própria</p>
                <p className="text-xs text-slate-300">{analysisResult.methodology.formula}</p>
                <p className="text-[11px] text-slate-500 mt-1">
                  Não é indicador oficial nem probabilidade de sucesso.
                </p>
              </div>

              <div className="space-y-1">
                {analysisResult.sources.map((source) => (
                  <a
                    key={source.name}
                    href={source.url}
                    target="_blank"
                    rel="noreferrer"
                    className="block text-xs text-slate-400 hover:text-accent"
                  >
                    {source.name} · {source.status}
                    {source.reference ? ' · ref. ' + source.reference : ''}
                    {source.license ? ' · ' + source.license : ''}
                  </a>
                ))}
              </div>

              {analysisResult.warnings.map((warning) => (
                <p key={warning} className="text-xs text-warning">⚠ {warning}</p>
              ))}
              <p className="text-[11px] text-slate-500">
                Coleta: {new Date(analysisResult.collected_at).toLocaleString('pt-BR')}
              </p>

              <button type="button" onClick={onGoToInvestor} className="secondary-button w-full">
                Usar esta análise no modo investidor <ArrowUpRight size={16} />
              </button>
            </motion.div>
          )}
        </div>

        <div className="map-column">
          <section className="map-panel panel" aria-label="Mapa com dados observados">
            <div className="map-toolbar">
              <div>
                <span className="icon-tile"><MapPin size={18} /></span>
                <div>
                  <h3>Mapa da consulta</h3>
                  <p>Azul: estabelecimentos OSM · verde: ponto analisado.</p>
                </div>
              </div>
              <span className="subtle-badge">OpenStreetMap</span>
            </div>
            <div className="map-canvas">
              <MapComponent analysisResult={analysisResult} />
            </div>
            <div className="map-caption">
              <Info size={14} />
              <span>Ausência de marcador não comprova ausência de estabelecimento.</span>
            </div>
          </section>

          <div className="discovery-notes">
            <div>
              <span className="icon-tile"><Database size={20} /></span>
              <h3>Fato, estimativa e cálculo</h3>
              <p>Cada cartão identifica sua natureza, fonte e período de referência.</p>
            </div>
            <div>
              <span className="icon-tile"><Briefcase size={20} /></span>
              <h3>Decisão responsável</h3>
              <p>Use o radar como triagem e confirme custos e demanda antes de investir.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
