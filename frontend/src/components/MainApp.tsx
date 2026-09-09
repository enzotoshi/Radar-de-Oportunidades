'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import radarLogo from '../../public/logo-radar.png'
import { motion, MotionConfig } from 'framer-motion'
import { useReducedMotion } from '@/lib/useReducedMotion'
import { uiSpring, gentleFade } from '@/lib/motion'
import { Map, LineChart, Briefcase, MapPin, ArrowUpRight, Database, ArrowRight } from 'lucide-react'
import MapAnalysis from './MapAnalysis'
import ScenarioSimulation from './ScenarioSimulation'
import InvestorMode from './Gamification'
import type { ActiveTab, AnalysisResult } from '@/types'

const tabs = [
  { id: 'map' as const, label: 'Explorar mapa', icon: Map },
  { id: 'simulation' as const, label: 'Simular cenários', icon: LineChart },
  { id: 'gamification' as const, label: 'Modo investidor', icon: Briefcase },
]

function BrandIdentity() {
  return (
    <>
      <Image
        className="brand-logo"
        src={radarLogo}
        alt=""
        width={52}
        height={52}
      />
      <span className="brand-name">
        <strong>Radar</strong><span>de Oportunidades Inteligente</span>
      </span>
    </>
  )
}

export default function MainApp() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('map')
  const [visited, setVisited] = useState<ActiveTab[]>(['map'])
  const reducedMotion = useReducedMotion()
  const navigate = (tab: ActiveTab, focusContent = false) => {
    setVisited((previous) => previous.includes(tab) ? previous : [...previous, tab])
    setActiveTab(tab)
    if (focusContent) requestAnimationFrame(() => document.getElementById('conteudo')?.focus({ preventScroll: true }))
  }
  const [selectedRegion, setSelectedRegion] = useState<string>('')
  const [selectedBusiness, setSelectedBusiness] = useState<string>('')
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(
    null,
  )

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })
  }, [activeTab])

  return (
    <MotionConfig reducedMotion={reducedMotion ? 'always' : 'never'} transition={reducedMotion ? gentleFade : uiSpring}>
      <div className="app-shell">
        <a href="#conteudo" className="skip-link">
          Pular para o conteúdo
        </a>
        <header className="app-header">
          <div className="header-inner">
            <button
              className="brand"
              onClick={() => navigate('map')}
              aria-label="Radar de Oportunidades Inteligente — início"
            >
              <BrandIdentity />
            </button>
            <span className="nav-section-label">ÁREA DE TRABALHO</span>
            <nav className="app-nav" aria-label="Navegação principal">
              {tabs.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  aria-label={label}
                  title={label}
                  onClick={() => navigate(id)}
                  aria-current={activeTab === id ? 'page' : undefined}
                  className={`nav-item ${activeTab === id ? 'is-active' : ''}`}
                >
                  {activeTab === id && (
                    <motion.span className="nav-indicator" layoutId={reducedMotion ? undefined : 'navigation'} aria-hidden="true" />
                  )}
                  <Icon size={18} aria-hidden="true" />
                  <span>{label}</span>
                  <ArrowRight className="nav-arrow" size={15} aria-hidden="true" />
                </button>
              ))}
            </nav>
            <div className="rail-context">
              <span className="eyebrow">TERRITÓRIO EM ANÁLISE</span>
              <MapPin size={21} />
              <p>{analysisResult?.location.municipality?.name || selectedRegion || 'Nenhuma localização selecionada'}</p>
              <span>{analysisResult ? 'Consulta disponível' : 'Aguardando consulta'}</span>
            </div>
            <span className="header-location">
              <Database size={14} /> Brasil · fontes públicas
            </span>
          </div>
        </header>
        <main id="conteudo" className="flex-1" tabIndex={-1}>
          <div className="workspace-bar">
            <span>Radar <span className="breadcrumb-divider">/</span> <strong>{tabs.find(tab => tab.id === activeTab)?.label}</strong></span>
            <span className="workspace-status"><span className="status-dot" /> {analysisResult ? 'Análise disponível' : 'Dados públicos, decisões conscientes'}</span>
          </div>
          <div className="view-stack">
            {visited.includes('map') && (
              <motion.div
                key="map"
                hidden={activeTab !== 'map'}
                initial={false}
                animate={{ opacity: activeTab === 'map' ? 1 : 0 }}
                transition={gentleFade}
                className="h-full"
              >
                <MapAnalysis
                  active={activeTab === 'map'}
                  selectedRegion={selectedRegion}
                  setSelectedRegion={setSelectedRegion}
                  selectedBusiness={selectedBusiness}
                  setSelectedBusiness={setSelectedBusiness}
                  analysisResult={analysisResult}
                  setAnalysisResult={setAnalysisResult}
                  onGoToInvestor={() => navigate('gamification', true)}
                />
              </motion.div>
            )}

            {visited.includes('simulation') && (
              <motion.div
                key="simulation"
                hidden={activeTab !== 'simulation'}
                initial={false}
                animate={{ opacity: activeTab === 'simulation' ? 1 : 0 }}
                transition={gentleFade}
              >
                <ScenarioSimulation
                  analysisResult={analysisResult}
                  businessType={selectedBusiness}
                  onGoToMap={() => navigate('map', true)}
                />
              </motion.div>
            )}

            {visited.includes('gamification') && (
              <motion.div
                key="gamification"
                hidden={activeTab !== 'gamification'}
                initial={false}
                animate={{ opacity: activeTab === 'gamification' ? 1 : 0 }}
                transition={gentleFade}
              >
                <InvestorMode
                  analysisResult={analysisResult}
                  businessType={selectedBusiness}
                  onGoToMap={() => navigate('map', true)}
                />
              </motion.div>
            )}
          </div>
        </main>

        <footer className="app-footer">
          <span
            className="brand brand-footer"
            aria-label="Radar de Oportunidades Inteligente"
          >
            <BrandIdentity />
          </span>
          <span>
            Projeto educacional · fatos com fonte · cálculos e projeções identificados
          </span>
          <span className="footer-signature">
            Encontre seu próximo passo <ArrowUpRight size={14} />
          </span>
        </footer>
      </div>
    </MotionConfig>
  )
}
