'use client'

import { useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import { Crosshair, Info, MapPin, PanelRightOpen } from 'lucide-react'
import { analyzeOpportunity, getApiError } from '@/lib/api'
import { parseBudgetInput } from '@/lib/formatters'
import type { AddressSuggestion, AnalysisResult } from '@/types'
import OpportunityQuery from './analysis/OpportunityQuery'
import AnalysisInsights from './analysis/AnalysisInsights'
import Button from './shared/Button'

const MapComponent = dynamic(() => import('./MapComponent'), { ssr: false })

interface Props {
  active: boolean
  selectedRegion: string
  setSelectedRegion: (value: string) => void
  selectedBusiness: string
  setSelectedBusiness: (value: string) => void
  analysisResult: AnalysisResult | null
  setAnalysisResult: (value: AnalysisResult | null) => void
  onGoToInvestor: () => void
}

export default function MapAnalysis({ active, selectedRegion, setSelectedRegion, selectedBusiness, setSelectedBusiness, analysisResult, setAnalysisResult, onGoToInvestor }: Props) {
  const [address, setAddress] = useState(selectedRegion)
  const [selectedLocation, setSelectedLocation] = useState<AddressSuggestion | null>(null)
  const [budget, setBudget] = useState('')
  const [analyzing, setAnalyzing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [insightsOpen, setInsightsOpen] = useState(true)
  const analysisVersion = useRef(0)

  const invalidateAnalysis = () => {
    analysisVersion.current += 1
    setAnalyzing(false)
    setAnalysisResult(null)
  }
  const changeAddress = (value: string) => { setAddress(value); setSelectedLocation(null); invalidateAnalysis() }
  const chooseLocation = (location: AddressSuggestion) => {
    setSelectedLocation(location)
    setAddress(location.display_name)
    setSelectedRegion(location.display_name)
    invalidateAnalysis()
  }
  const changeBusiness = (value: string) => { setSelectedBusiness(value); invalidateAnalysis() }
  const changeBudget = (value: string) => { setBudget(value); invalidateAnalysis() }

  const handleAnalyze = async () => {
    if (!selectedLocation) { setError('Busque e selecione uma localização verificada antes de analisar.'); return }
    if (!selectedBusiness) { setError('Selecione um tipo de negócio.'); return }
    const version = ++analysisVersion.current
    setAnalyzing(true)
    setError(null)
    setAnalysisResult(null)
    try {
      const result = await analyzeOpportunity({
        address: selectedLocation.display_name,
        business_type: selectedBusiness,
        lat: selectedLocation.lat,
        lng: selectedLocation.lng,
        budget: parseBudgetInput(budget),
        municipality_ibge_code: selectedLocation.municipality?.ibge_code,
        municipality_name: selectedLocation.municipality?.name,
        municipality_state: selectedLocation.municipality?.state || undefined,
      })
      if (version === analysisVersion.current) { setAnalysisResult(result); setInsightsOpen(true) }
    } catch (reason) {
      if (version === analysisVersion.current) setError(getApiError(reason, 'Não foi possível consultar as fontes públicas. Nenhum valor fictício foi exibido.'))
    } finally {
      if (version === analysisVersion.current) setAnalyzing(false)
    }
  }

  return <div className="territory-page">
    <div className="territory-heading"><div><span className="section-kicker">Inteligência territorial</span><h1>Explore oportunidades.</h1><p>Configure a hipótese, leia o território e avance com evidências.</p></div>
      {analysisResult && <Button variant="secondary" size="compact" className="insights-toggle" aria-expanded={insightsOpen} aria-controls="analysis-insights" onClick={() => setInsightsOpen(value => !value)}><PanelRightOpen size={17} aria-hidden="true" />{insightsOpen ? 'Ocultar evidências' : 'Ver evidências'}</Button>}
    </div>
    <div className="atlas-workspace" data-has-result={Boolean(analysisResult)}>
      <OpportunityQuery active={active} address={address} selectedLocation={selectedLocation} selectedBusiness={selectedBusiness} budget={budget} analyzing={analyzing} error={error} onAddressChange={changeAddress} onLocationSelect={chooseLocation} onBusinessChange={changeBusiness} onBudgetChange={changeBudget} onAnalyze={() => void handleAnalyze()} onError={setError} />
      <section className="atlas-map map-stage" aria-label="Mapa com dados observados">
        <div className="map-canvas"><MapComponent analysisResult={analysisResult} /></div>
        <div className="territory-label"><MapPin size={18} aria-hidden="true" /><span>{analysisResult?.location.municipality?.name || 'Brasil'}<small>{analysisResult ? 'Território consultado' : 'Visão do território'}</small></span></div>
        <div className="map-legend" aria-label="Legenda do mapa"><span><i className="business-key" />Estabelecimentos OSM</span><span><i className="location-key" />Ponto analisado</span><span><Crosshair size={14} aria-hidden="true" />Raio de 1,5 km</span></div>
        <div className="map-context"><Info size={17} aria-hidden="true" /><p>{analysisResult ? 'Ausência de marcador não comprova ausência de estabelecimento.' : 'O mapa organiza os sinais públicos; valide decisões importantes em campo.'}</p></div>
      </section>
      {analysisResult ? <div id="analysis-insights" hidden={!insightsOpen}><AnalysisInsights result={analysisResult} onClear={() => { invalidateAnalysis(); setError(null) }} onGoToInvestor={onGoToInvestor} /></div> : <aside className="analysis-guide" aria-label="Guia de evidências"><span className="section-kicker">Como ler o Radar</span><h2>Da busca à decisão</h2><ol><li><strong>1</strong><span>Escolha um endereço verificado.</span></li><li><strong>2</strong><span>Consulte sinais territoriais com fonte.</span></li><li><strong>3</strong><span>Compare cenários antes de decidir.</span></li></ol><p>Dados ausentes permanecem identificados — nunca são substituídos por estimativas silenciosas.</p></aside>}
    </div>
  </div>
}
