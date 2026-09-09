'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import radarLogo from '../../public/logo-radar.png'
import { motion, MotionConfig } from 'framer-motion'
import { useReducedMotion } from '@/lib/useReducedMotion'
import { uiSpring, gentleFade } from '@/lib/motion'
import { Map, LineChart, Briefcase, MapPin, ArrowUpRight } from 'lucide-react'
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
        Radar de Oportunidades Inteligente
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
            <nav className="app-nav" aria-label="Navegação principal">
              {tabs.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => navigate(id)}
                  aria-current={activeTab === id ? 'page' : undefined}
                  className={`nav-item ${activeTab === id ? 'is-active' : ''}`}
                >
                  {activeTab === id && (
                    <motion.span className="nav-indicator" layoutId={reducedMotion ? undefined : 'navigation'} aria-hidden="true" />
                  )}
                  <Icon size={18} aria-hidden="true" />
                  <span>{label}</span>
                </button>
              ))}
            </nav>
            <span className="header-location">
              <MapPin size={14} /> Brasil · fontes públicas
            </span>
          </div>
        </header>
        <main id="conteudo" className="flex-1" tabIndex={-1}>
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
