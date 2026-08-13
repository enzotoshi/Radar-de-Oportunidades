'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import MapAnalysis from './MapAnalysis'
import ScenarioSimulation from './ScenarioSimulation'
import Gamification from './Gamification'
import type { ActiveTab, AnalysisResult } from '@/types'

const tabs: { id: ActiveTab; label: string; icon: string }[] = [
  { id: 'map', label: 'Análise de Mapa', icon: '🗺️' },
  { id: 'simulation', label: 'Simulação de Cenários', icon: '📊' },
  { id: 'gamification', label: 'Modo Investidor', icon: '🎮' },
]

export default function MainApp() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('map')
  const [selectedRegion, setSelectedRegion] = useState<string>('')
  const [selectedBusiness, setSelectedBusiness] = useState<string>('')
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null)

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      {/* ── Header / Navbar ── */}
      <header className="bg-surface-card border-b border-slate-700 sticky top-0 z-50 backdrop-blur-sm bg-opacity-95">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 py-3">
            {/* Logo */}
            <div className="flex items-center gap-3 mr-auto">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent to-primary-400 flex items-center justify-center text-xl shadow-lg">
                🎯
              </div>
              <div>
                <h1 className="font-bold text-lg text-white leading-tight">
                  Radar de Oportunidades
                </h1>
                <p className="text-xs text-slate-400 leading-none">Smart Cities · São Paulo</p>
              </div>
            </div>

            {/* Nav tabs */}
            <nav className="flex gap-1 bg-surface rounded-xl p-1 w-full sm:w-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'bg-accent text-surface shadow-md'
                      : 'text-slate-400 hover:text-white hover:bg-surface-elevated'
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>
      </header>

      {/* ── Main Content ── */}
      <main className="flex-1">
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
              <Gamification />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* ── Footer ── */}
      <footer className="border-t border-slate-800 py-3 px-6">
        <p className="text-center text-xs text-slate-600">
          Radar de Oportunidades Inteligente · Feira Científica Smart Cities 2024 · Dados simulados para fins educacionais
        </p>
      </footer>
    </div>
  )
}
