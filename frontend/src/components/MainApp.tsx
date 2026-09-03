'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import radarLogo from '../../public/logo-radar.png'
import { motion, AnimatePresence, MotionConfig } from 'framer-motion'
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
  const [selectedRegion, setSelectedRegion] = useState<string>('')
  const [selectedBusiness, setSelectedBusiness] = useState<string>('')
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(
    null,
  )

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })
  }, [activeTab])

  return (
    <MotionConfig reducedMotion="user">
      <div className="app-shell">
        <a href="#conteudo" className="skip-link">
          Pular para o conteúdo
        </a>
        <header className="app-header">
          <div className="header-inner">
            <button
              className="brand"
              onClick={() => setActiveTab('map')}
              aria-label="Radar de Oportunidades Inteligente — início"
            >
              <BrandIdentity />
            </button>
            <nav className="app-nav" aria-label="Navegação principal">
              {tabs.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  aria-current={activeTab === id ? 'page' : undefined}
                  className={`nav-item ${activeTab === id ? 'is-active' : ''}`}
                >
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
          <AnimatePresence mode="wait">
            {activeTab === 'map' && (
              <motion.div
                key="map"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="h-full"
              >
                <MapAnalysis
                  selectedRegion={selectedRegion}
                  setSelectedRegion={setSelectedRegion}
                  selectedBusiness={selectedBusiness}
                  setSelectedBusiness={setSelectedBusiness}
                  analysisResult={analysisResult}
                  setAnalysisResult={setAnalysisResult}
                  onGoToInvestor={() => setActiveTab('gamification')}
                />
              </motion.div>
            )}

            {activeTab === 'simulation' && (
              <motion.div
                key="simulation"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                <ScenarioSimulation
                  analysisResult={analysisResult}
                  businessType={selectedBusiness}
                  onGoToMap={() => setActiveTab('map')}
                />
              </motion.div>
            )}

            {activeTab === 'gamification' && (
              <motion.div
                key="gamification"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                <InvestorMode
                  analysisResult={analysisResult}
                  businessType={selectedBusiness}
                  onGoToMap={() => setActiveTab('map')}
                />
              </motion.div>
            )}
          </AnimatePresence>
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
