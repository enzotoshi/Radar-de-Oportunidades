'use client'

import { useEffect, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import { AnimatePresence, motion } from 'framer-motion'
import { Check, Crosshair, Database, Info, Loader2, MapPin, PanelRightClose, PanelRightOpen, ScanLine, Search, SlidersHorizontal } from 'lucide-react'
import VoiceInput from './VoiceInput'
import AnalysisReport from './AnalysisReport'
import { analyzeOpportunity, getApiError, getBusinesses, searchAddress } from '@/lib/api'
import type { AddressSuggestion, AnalysisResult, Business } from '@/types'

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
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [customAddress, setCustomAddress] = useState(selectedRegion)
  const [selectedLocation, setSelectedLocation] = useState<AddressSuggestion | null>(null)
  const [locations, setLocations] = useState<AddressSuggestion[]>([])
  const [budget, setBudget] = useState(0)
  const [budgetDisplay, setBudgetDisplay] = useState('')
  const [loadingBusinesses, setLoadingBusinesses] = useState(true)

  // Função para formatar número com separador de milhares
  const formatBudget = (value: string): string => {
    const numbers = value.replace(/\D/g, '')
    if (!numbers) return ''
    return Number(numbers).toLocaleString('pt-BR')
  }

  // Função para remover formatação e obter o valor numérico
  const parseBudget = (value: string): number => {
    const numbers = value.replace(/\D/g, '')
    return numbers ? Number(numbers) : 0
  }

  // Handler para mudanças no campo de orçamento
  const handleBudgetChange = (value: string) => {
    const formatted = formatBudget(value)
    setBudgetDisplay(formatted)
    setBudget(parseBudget(value))
  }
  const [searchingAddress, setSearchingAddress] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [inspectorOpen, setInspectorOpen] = useState(true)
  const [inspectorTab, setInspectorTab] = useState<'query' | 'result'>('query')
  const [activeSuggestion, setActiveSuggestion] = useState(-1)
  const addressRef = useRef<HTMLInputElement>(null)
  const suggestionsRef = useRef<HTMLDivElement>(null)
  const businessDropdownRef = useRef<HTMLDivElement>(null)
  const searchVersion = useRef(0)
  const analysisVersion = useRef(0)
  const debounceTimer = useRef<NodeJS.Timeout | null>(null)
  const [businessSearch, setBusinessSearch] = useState('')
  const [businessDropdownOpen, setBusinessDropdownOpen] = useState(false)

  useEffect(() => { setActiveSuggestion(-1) }, [locations])
  useEffect(() => {
    if (analysisResult) { setInspectorTab('result'); setInspectorOpen(true) }
    else setInspectorTab('query')
  }, [analysisResult])
  useEffect(() => {
    if (!locations.length) return
    const dismiss = (event: PointerEvent) => {
      if (!suggestionsRef.current?.contains(event.target as Node)) setLocations([])
    }
    document.addEventListener('pointerdown', dismiss)
    return () => document.removeEventListener('pointerdown', dismiss)
  }, [locations.length])
  useEffect(() => {
    getBusinesses().then(setBusinesses)
      .catch(reason => setError(getApiError(reason, 'Não foi possível carregar os tipos de negócio.')))
      .finally(() => setLoadingBusinesses(false))
  }, [])

  // Limpa o timer de debounce ao desmontar
  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current)
      }
    }
  }, [])

  // Fechar dropdown de negócios ao clicar fora
  useEffect(() => {
    if (!businessDropdownOpen) return
    const dismiss = (event: PointerEvent) => {
      if (!businessDropdownRef.current?.contains(event.target as Node)) {
        setBusinessDropdownOpen(false)
      }
    }
    document.addEventListener('pointerdown', dismiss)
    return () => document.removeEventListener('pointerdown', dismiss)
  }, [businessDropdownOpen])

  // Filtrar e agrupar negócios por setor
  const filteredBusinesses = businesses.filter(business =>
    businessSearch === '' ||
    business.name.toLowerCase().includes(businessSearch.toLowerCase()) ||
    business.sector.toLowerCase().includes(businessSearch.toLowerCase())
  )

  const businessesBySector: Record<string, Business[]> = {}
  filteredBusinesses.forEach(business => {
    if (!businessesBySector[business.sector]) {
      businessesBySector[business.sector] = []
    }
    businessesBySector[business.sector].push(business)
  })

  const selectedBusinessData = businesses.find(b => b.id === selectedBusiness)

  const invalidateAnalysis = () => {
    analysisVersion.current += 1
    setAnalyzing(false)
    setAnalysisResult(null)
  }

  // Busca automática de sugestões com debounce
  const autoSearchLocations = async (query: string) => {
    if (query.trim().length < 3) {
      setLocations([])
      return
    }
    
    const version = ++searchVersion.current
    setSearchingAddress(true)
    setError(null)
    
    try {
      const results = await searchAddress(query)
      if (version !== searchVersion.current) return
      setLocations(results)
    } catch (reason) {
      if (version === searchVersion.current) {
        setLocations([])
        // Não mostra erro no autocomplete automático, só quando clicar na lupa
      }
    } finally {
      if (version === searchVersion.current) setSearchingAddress(false)
    }
  }

  const handleAddressChange = (value: string) => {
    setCustomAddress(value)
    setSelectedLocation(null)
    invalidateAnalysis()
    
    // Cancela busca anterior se existir
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current)
    }
    
    // Busca automática com debounce de 300ms para melhor responsividade
    if (value.trim().length >= 3) {
      debounceTimer.current = setTimeout(() => {
        autoSearchLocations(value)
      }, 300)
    } else {
      setLocations([])
      setSearchingAddress(false)
    }
  }
  const handleLocationSearch = async () => {
    if (customAddress.trim().length < 3) {
      setError('Digite ao menos três caracteres para buscar uma localização.')
      return
    }

    // Se já existe uma localização selecionada, não faz nada
    if (selectedLocation) {
      return
    }

    // Se já existem sugestões na lista, seleciona automaticamente a primeira
    if (locations.length > 0) {
      chooseLocation(locations[0])
      return
    }

    // Se não há sugestões, faz a busca
    const version = ++searchVersion.current
    setSearchingAddress(true)
    setError(null)
    setLocations([])
    
    try {
      const results = await searchAddress(customAddress)
      if (version !== searchVersion.current) return
      
      if (results.length > 0) {
        // Seleciona automaticamente a primeira sugestão
        chooseLocation(results[0])
      } else {
        setError('Nenhuma localização foi encontrada. Tente incluir cidade e estado.')
      }
    } catch (reason) {
      if (version === searchVersion.current) {
        setError(getApiError(reason, 'A geocodificação está indisponível. Tente novamente.'))
      }
    } finally {
      if (version === searchVersion.current) setSearchingAddress(false)
    }
  }
  const chooseLocation = (location: AddressSuggestion) => {
    setSelectedLocation(location)
    setCustomAddress(location.display_name)
    setSelectedRegion(location.display_name)
    setLocations([])
    invalidateAnalysis()
    addressRef.current?.focus()
  }
  const handleAnalyze = async () => {
    if (!selectedLocation) { setError('Busque e selecione uma localização verificada antes de analisar.'); return }
    if (!selectedBusiness) { setError('Selecione um tipo de negócio.'); return }
    const version = ++analysisVersion.current
    setAnalyzing(true)
    setError(null)
    setAnalysisResult(null)
    try {
      const result = await analyzeOpportunity({ address: selectedLocation.display_name, business_type: selectedBusiness, lat: selectedLocation.lat, lng: selectedLocation.lng, budget })
      if (version === analysisVersion.current) setAnalysisResult(result)
    } catch (reason) {
      if (version === analysisVersion.current) setError(getApiError(reason, 'Não foi possível consultar as fontes públicas. Nenhum valor fictício foi exibido.'))
    } finally {
      if (version === analysisVersion.current) setAnalyzing(false)
    }
  }
  const handleVoiceResult = (_transcript: string, entities: Record<string, string | null>) => {
    if (entities.location) handleAddressChange(entities.location)
    if (entities.business_type) { setSelectedBusiness(entities.business_type); invalidateAnalysis() }
    if (entities.budget) {
      const budgetValue = Number(entities.budget)
      setBudget(budgetValue)
      setBudgetDisplay(budgetValue.toLocaleString('pt-BR'))
    }
  }

  return (
    <div className="territory-page">
      <div className="territory-heading">
        <div><span className="eyebrow">INTELIGÊNCIA TERRITORIAL</span><h1>Explore oportunidades.</h1></div>
        <button type="button" className="secondary-button inspector-toggle" onClick={() => setInspectorOpen(value => !value)} aria-expanded={inspectorOpen} aria-controls="territory-inspector">
          {inspectorOpen ? <PanelRightClose size={18} /> : <PanelRightOpen size={18} />}<span>{inspectorOpen ? 'Recolher painel' : 'Abrir consulta'}</span>
        </button>
      </div>
      <div className="territory-workspace" data-inspector={inspectorOpen}>
        <section className="map-stage" aria-label="Mapa com dados observados">
          <div className="map-canvas"><MapComponent analysisResult={analysisResult} businessIcon={selectedBusinessData?.icon} /></div>
          <div className="territory-label"><MapPin size={18} /><span>{analysisResult?.location.municipality?.name || 'Brasil'}<small>{analysisResult ? 'Território consultado' : 'Visão do território'}</small></span></div>
          <div className="map-legend"><span><i className="business-key" />Estabelecimentos OSM</span><span><i className="location-key" />Ponto analisado</span><span><Crosshair size={14} />Raio de 1,5 km</span></div>
          <div className="map-context"><Info size={17} /><p>{analysisResult ? 'Ausência de marcador não comprova ausência de estabelecimento.' : 'Consulte registros públicos, entenda as limitações e complemente a análise com pesquisa de campo.'}</p></div>
        </section>

        <aside id="territory-inspector" className="territory-inspector" hidden={!inspectorOpen} aria-label="Ferramentas da análise">
          <div className="inspector-tabs">
            <button aria-pressed={inspectorTab === 'query'} onClick={() => setInspectorTab('query')}><SlidersHorizontal size={16} />Consulta{inspectorTab === 'query' && <motion.span layoutId="inspector-tab" className="inspector-tab-line" />}</button>
            <button aria-pressed={inspectorTab === 'result'} disabled={!analysisResult} onClick={() => setInspectorTab('result')}><ScanLine size={16} />Resultado{analysisResult && <span className="result-dot" />}{inspectorTab === 'result' && <motion.span layoutId="inspector-tab" className="inspector-tab-line" />}</button>
          </div>
          <div className="inspector-scroll">
            <div hidden={inspectorTab !== 'query'}>
              <div className="inspector-intro"><span className="eyebrow">NOVA CONSULTA</span><h2>Onde está sua<br />próxima oportunidade?</h2><p>Localização, negócio e dados com fonte.</p></div>
              <div className="analysis-form" aria-busy={analyzing}>
                <div className="address-field" ref={suggestionsRef}>
                  <label htmlFor="analysis-address" className="field-label"><span className="step-number">01</span>Localização</label>
                  <div className="address-control">
                    <input ref={addressRef} id="analysis-address" type="text" value={customAddress} onChange={event => handleAddressChange(event.target.value)}
                      onKeyDown={event => {
                        if (event.key === 'Escape') setLocations([])
                        if ((event.key === 'ArrowDown' || event.key === 'ArrowUp') && locations.length) {
                          event.preventDefault()
                          const next = event.key === 'ArrowDown' ? (activeSuggestion + 1) % locations.length : (activeSuggestion <= 0 ? locations.length - 1 : activeSuggestion - 1)
                          setActiveSuggestion(next)
                          document.getElementById('location-' + next)?.scrollIntoView({ block: 'nearest' })
                        }
                        if (event.key === 'Enter') {
                          event.preventDefault()
                          if (activeSuggestion >= 0 && locations[activeSuggestion]) chooseLocation(locations[activeSuggestion])
                          else if (!searchingAddress) handleLocationSearch()
                        }
                      }}
                      role="combobox" aria-expanded={locations.length > 0} aria-controls={locations.length ? 'location-results' : undefined}
                      aria-activedescendant={activeSuggestion >= 0 ? 'location-' + activeSuggestion : undefined} aria-autocomplete="list" aria-describedby="address-help"
                      placeholder="Rua, número, cidade e estado" className="field-control" autoComplete="off" />
                    <button type="button" className="icon-button" onClick={handleLocationSearch} disabled={searchingAddress} aria-label="Buscar localização" title="Buscar localização">{searchingAddress ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}</button>
                  </div>
                  <p id="address-help" className="field-help">Busca via Nominatim. Selecione um resultado verificado.</p>
                  <AnimatePresence>{locations.length > 0 && <motion.div id="location-results" role="listbox" className="address-suggestions" aria-label="Resultados de localização" initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}>
                    {locations.map((location, index) => <button id={'location-' + index} role="option" aria-selected={activeSuggestion === index} key={location.place_id + location.lat + location.lng} type="button" onClick={() => chooseLocation(location)} className="suggestion-item">
                      <MapPin size={17} /><span>{location.display_name}<small>{location.municipality ? 'Código IBGE ' + location.municipality.ibge_code : 'Código IBGE indisponível'}</small></span>
                    </button>)}
                  </motion.div>}</AnimatePresence>
                  {selectedLocation && <p className="selection-confirmed"><Check size={15} /><span>Localização selecionada{selectedLocation.municipality ? ' · ' + selectedLocation.municipality.name + ' · IBGE ' + selectedLocation.municipality.ibge_code : ' · município não identificado pelo IBGE'}</span></p>}
                </div>
                <div>
                  <label htmlFor="analysis-business" className="field-label"><span className="step-number">02</span>Qual tipo de negócio você pretende abrir?</label>
                  <p className="field-subtitle">Escolha um segmento para analisar os negócios e concorrentes reais da região.</p>
                  <div className="business-selector" ref={businessDropdownRef}>
                    <button
                      type="button"
                      id="analysis-business"
                      className="business-selector-button"
                      onClick={() => setBusinessDropdownOpen(!businessDropdownOpen)}
                      disabled={loadingBusinesses || businesses.length === 0}
                    >
                      {loadingBusinesses ? (
                        <>
                          <Loader2 size={18} className="animate-spin" />
                          <span>Carregando catálogo...</span>
                        </>
                      ) : selectedBusinessData ? (
                        <>
                          <span className="business-icon">{selectedBusinessData.icon}</span>
                          <span>{selectedBusinessData.name}</span>
                        </>
                      ) : (
                        <>
                          <Search size={18} />
                          <span>Selecione um tipo de negócio...</span>
                        </>
                      )}
                      <SlidersHorizontal size={16} className="dropdown-arrow" />
                    </button>
                    
                    <AnimatePresence>
                      {businessDropdownOpen && (
                        <motion.div
                          className="business-dropdown"
                          initial={{ opacity: 0, y: -8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -8 }}
                        >
                          <div className="business-search">
                            <Search size={16} />
                            <input
                              type="text"
                              placeholder="Buscar tipo de negócio..."
                              value={businessSearch}
                              onChange={e => setBusinessSearch(e.target.value)}
                              autoFocus
                            />
                          </div>
                          
                          <div className="business-list">
                            {Object.keys(businessesBySector).length === 0 ? (
                              <div className="no-results">Nenhum negócio encontrado</div>
                            ) : (
                              Object.entries(businessesBySector).map(([sector, sectorBusinesses]) => (
                                <div key={sector} className="business-sector">
                                  <div className="sector-title">{sector}</div>
                                  {sectorBusinesses.map(business => (
                                    <button
                                      key={business.id}
                                      type="button"
                                      className={`business-option ${selectedBusiness === business.id ? 'selected' : ''}`}
                                      onClick={() => {
                                        setSelectedBusiness(business.id)
                                        setBusinessDropdownOpen(false)
                                        setBusinessSearch('')
                                        invalidateAnalysis()
                                      }}
                                    >
                                      <span className="business-icon">{business.icon}</span>
                                      <span>{business.name}</span>
                                      {selectedBusiness === business.id && <Check size={16} />}
                                    </button>
                                  ))}
                                </div>
                              ))
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  <p className="field-help">Catálogo de filtros; não é uma estatística de mercado.</p>
                </div>
                <div>
                  <label htmlFor="analysis-budget" className="field-label"><span className="step-number">03</span>Orçamento informado por você</label>
                  <div className="money-control"><span>R$</span><input id="analysis-budget" type="text" inputMode="numeric" value={budgetDisplay} onChange={event => handleBudgetChange(event.target.value)} placeholder="Digite o valor..." className="field-control" /></div>
                  <p className="field-help">Este valor não altera o índice: não há benchmark financeiro verificável no projeto.</p>
                </div>
                {error && <p role="alert" className="error-message">{error}</p>}
              </div>
              <VoiceInput onResult={handleVoiceResult} active={active && inspectorOpen && inspectorTab === 'query'} />
              <div className="inspector-footnote"><Database size={16} /><p>Fato, estimativa e cálculo identificados. Confirme custos e demanda antes de investir.</p></div>
            </div>
            {analysisResult && <div hidden={inspectorTab !== 'result'}><AnalysisReport result={analysisResult} onClear={invalidateAnalysis} onGoToInvestor={onGoToInvestor} /></div>}
          </div>
          <div className="inspector-action" hidden={inspectorTab !== 'query'}>
            <button type="button" onClick={handleAnalyze} disabled={analyzing || !selectedLocation || !selectedBusiness} className="primary-button w-full">{analyzing ? <><Loader2 size={18} className="animate-spin" />Consultando fontes...</> : <><ScanLine size={18} />Analisar dados reais</>}</button>
          </div>
        </aside>
      </div>
      <div aria-live="polite" role="status" className="sr-only">{analyzing ? 'Consultando fontes públicas.' : analysisResult ? 'Análise concluída. Resultado disponível no painel.' : ''}</div>
    </div>
  )
}
