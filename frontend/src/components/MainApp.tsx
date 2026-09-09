'use client'

import { useEffect, useState } from 'react'
import { MotionConfig, motion } from 'framer-motion'
import AppHeader from './app-shell/AppHeader'
import MapAnalysis from './MapAnalysis'
import ScenarioSimulation from './ScenarioSimulation'
import InvestorMode from './Gamification'
import { gentleFade, uiSpring } from '@/lib/motion'
import { useReducedMotion } from '@/lib/useReducedMotion'
import type { ActiveTab, AnalysisResult } from '@/types'

export default function MainApp() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('map')
  const [visited, setVisited] = useState<ActiveTab[]>(['map'])
  const [selectedRegion, setSelectedRegion] = useState('')
  const [selectedBusiness, setSelectedBusiness] = useState('')
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null)
  const reducedMotion = useReducedMotion()

  const navigate = (tab: ActiveTab, focusContent = false) => {
    setVisited(previous => previous.includes(tab) ? previous : [...previous, tab])
    setActiveTab(tab)
    if (focusContent) requestAnimationFrame(() => document.getElementById('conteudo')?.focus({ preventScroll: true }))
  }

  useEffect(() => { window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior }) }, [activeTab])

  const locationLabel = analysisResult?.location.municipality?.name || selectedRegion.split(',')[0] || 'Brasil'

  return <MotionConfig reducedMotion={reducedMotion ? 'always' : 'never'} transition={reducedMotion ? gentleFade : uiSpring}>
    <div className="app-shell">
      <a href="#conteudo" className="skip-link">Pular para o conteúdo</a>
      <AppHeader activeTab={activeTab} onNavigate={navigate} locationLabel={locationLabel} hasAnalysis={Boolean(analysisResult)} />
      <main id="conteudo" className="app-main" tabIndex={-1}>
        <div className="view-stack">
          {visited.includes('map') && <motion.div hidden={activeTab !== 'map'} initial={false} animate={{ opacity: activeTab === 'map' ? 1 : 0 }} transition={gentleFade}>
            <MapAnalysis active={activeTab === 'map'} selectedRegion={selectedRegion} setSelectedRegion={setSelectedRegion} selectedBusiness={selectedBusiness} setSelectedBusiness={setSelectedBusiness} analysisResult={analysisResult} setAnalysisResult={setAnalysisResult} onGoToInvestor={() => navigate('gamification', true)} />
          </motion.div>}
          {visited.includes('simulation') && <motion.div hidden={activeTab !== 'simulation'} initial={false} animate={{ opacity: activeTab === 'simulation' ? 1 : 0 }} transition={gentleFade}>
            <ScenarioSimulation analysisResult={analysisResult} businessType={selectedBusiness} onGoToMap={() => navigate('map', true)} />
          </motion.div>}
          {visited.includes('gamification') && <motion.div hidden={activeTab !== 'gamification'} initial={false} animate={{ opacity: activeTab === 'gamification' ? 1 : 0 }} transition={gentleFade}>
            <InvestorMode analysisResult={analysisResult} businessType={selectedBusiness} onGoToMap={() => navigate('map', true)} />
          </motion.div>}
        </div>
      </main>
      <footer className="app-footer"><span>Radar de Oportunidades</span><span>Projeto educacional · fatos com fonte · cálculos identificados</span></footer>
    </div>
  </MotionConfig>
}
