'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence, MotionConfig } from 'framer-motion'
import {
  Radar,
  Map,
  LineChart,
  Briefcase,
  MapPin,
  ArrowUpRight,
} from 'lucide-react'
import { MapAnalysis } from '@/features/map-analysis'
import { ScenarioSimulation } from '@/features/scenario-simulation'
import { InvestorMode } from '@/features/investor-mode'
import type { ActiveTab, AnalysisResult } from '@/types'

const tabs = [
  { id: 'map' as const, label: 'Explorar mapa', icon: Map },
  { id: 'simulation' as const, label: 'Simular cenários', icon: LineChart },
  { id: 'gamification' as const, label: 'Modo investidor', icon: Briefcase },
]

export default function MainApp() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('map')
  const [selectedRegion, setSelectedRegion] = useState<string>('')
  const [selectedBusiness, setSelectedBusiness] = useState<string>('')
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(
    null
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
              aria-label="Radar de Oportunidades — início"
            >
              <span className="brand-symbol">
                <Radar size={26} strokeWidth={1.6} />
              </span>
              <span className="brand-name">
                radar<span>de oportunidades</span>
              </span>
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
              <MapPin size={14} /> São Paulo & região
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
                  initialRegion={selectedRegion}
                  initialBusiness={selectedBusiness}
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
                <InvestorMode />
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        <footer className="app-footer">
          <span className="flex items-center gap-2">
            <Radar size={16} /> Radar de Oportunidades
          </span>
          <span>
            Projeto educacional · Smart Cities · Dados e projeções sujeitos a
            estimativas
          </span>
          <span className="footer-signature">
            Encontre seu próximo passo <ArrowUpRight size={14} />
          </span>
        </footer>
      </div>
    </MotionConfig>
  )
}
