'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { motion } from 'framer-motion'
import { Search, Loader2 } from 'lucide-react'
import VoiceInput from './VoiceInput'
import OpportunityScore from './OpportunityScore'
import { REGIONS, BUSINESSES } from '@/lib/data'
import { analyzeOpportunity } from '@/lib/api'
import type { AnalysisResult, Region, Business } from '@/types'

// Leaflet map loaded client-side only
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
  setAnalysisResult,
  onGoToInvestor,
}: Props) {
  const [regions, setRegions] = useState<Region[]>(REGIONS)
  const [businesses, setBusinesses] = useState<Business[]>(BUSINESSES)
  const [budget, setBudget] = useState<number>(100000)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Try to fetch live data from backend
  useEffect(() => {
    import('@/lib/api').then(({ getRegions, getBusinesses }) => {
      Promise.all([getRegions(), getBusinesses()])
        .then(([r, b]) => {
          if (r.length) setRegions(r)
          if (b.length) setBusinesses(b)
        })
        .catch(() => {
          // Silently use static data
        })
    })
  }, [])

  const handleVoiceResult = (
    _transcript: string,
    entities: Record<string, string | null>
  ) => {
    if (entities.location) setSelectedRegion(entities.location)
    if (entities.business_type) setSelectedBusiness(entities.business_type)
    if (entities.budget) setBudget(Number(entities.budget))
  }

  const handleAnalyze = async () => {
    if (!selectedRegion || !selectedBusiness) {
      setError('Selecione uma região e um tipo de negócio antes de analisar.')
      return
    }
    setError(null)
    setLoading(true)
    try {
      const result = await analyzeOpportunity(selectedRegion, selectedBusiness, budget)
      setAnalysisResult(result)
    } catch {
      // Fallback: generate simulated result
      const result = generateFallbackResult(selectedRegion, selectedBusiness, budget)
      setAnalysisResult(result)
    } finally {
      setLoading(false)
    }
  }

  const selectedRegionData = regions.find((r) => r.id === selectedRegion)
  const selectedBusinessData = businesses.find((b) => b.id === selectedBusiness)

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-80px)]">
      {/* ── Left Panel ── */}
      <div className="w-full lg:w-[420px] flex-shrink-0 overflow-y-auto p-4 space-y-4 border-r border-slate-800">
        {/* Voice Input */}
        <VoiceInput onResult={handleVoiceResult} />

        {/* Form */}
        <div className="bg-surface-card rounded-2xl p-4 border border-slate-700 space-y-4">
          <h2 className="font-semibold text-white text-sm">Parâmetros de Análise</h2>

          {/* Region */}
          <div>
            <label className="block text-xs text-slate-400 mb-1.5 font-medium">
              🏙️ Região / Bairro
            </label>
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="w-full bg-surface border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-accent transition-colors"
            >
              <option value="">Selecione uma região...</option>
              {regions.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
            {selectedRegionData && (
              <p className="text-xs text-slate-500 mt-1 truncate">
                {selectedRegionData.description}
              </p>
            )}
          </div>

          {/* Business */}
          <div>
            <label className="block text-xs text-slate-400 mb-1.5 font-medium">
              💼 Tipo de Negócio
            </label>
            <select
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
                Investimento mínimo: R$ {selectedBusinessData.min_investment.toLocaleString('pt-BR')}
              </p>
            )}
          </div>

          {/* Budget */}
          <div>
            <label className="block text-xs text-slate-400 mb-1.5 font-medium">
              💰 Orçamento Disponível
            </label>
            <div className="flex items-center gap-3">
              <input
                type="range"
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

          {/* Error */}
          {error && (
            <p className="text-xs text-red-400 bg-red-500/10 rounded-lg p-2">{error}</p>
          )}

          {/* Analyze button */}
          <button
            onClick={handleAnalyze}
            disabled={loading || !selectedRegion || !selectedBusiness}
            className="w-full flex items-center justify-center gap-2 py-3 bg-accent hover:bg-accent-600 disabled:opacity-50 disabled:cursor-not-allowed text-surface font-semibold rounded-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-lg"
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Analisando...
              </>
            ) : (
              <>
                <Search size={16} />
                Analisar Oportunidade
              </>
            )}
          </button>
        </div>

        {/* Result */}
        {analysisResult && (
          <OpportunityScore
            result={analysisResult}
            regionName={selectedRegionData?.name ?? selectedRegion}
            businessName={selectedBusinessData ? `${selectedBusinessData.icon} ${selectedBusinessData.name}` : selectedBusiness}
            onGoToInvestor={onGoToInvestor}
          />
        )}
      </div>

      {/* ── Map Panel ── */}
      <div className="flex-1 p-4 min-h-[400px]">
        <div className="h-full relative">
          {/* Legend */}
          <div className="absolute top-3 right-3 z-[1000] bg-surface-card border border-slate-700 rounded-xl p-3 text-xs space-y-1.5 shadow-lg">
            <p className="font-semibold text-slate-300 mb-2">Score de Oportunidade</p>
            {[
              { color: '#00d4aa', label: 'Alto (70–100)' },
              { color: '#f59e0b', label: 'Médio (40–69)' },
              { color: '#ef4444', label: 'Baixo (0–39)' },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-2">
                <span
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ background: item.color }}
                />
                <span className="text-slate-400">{item.label}</span>
              </div>
            ))}
          </div>

          <MapComponent
            regions={regions}
            selectedRegion={selectedRegion}
            onRegionSelect={setSelectedRegion}
            analysisResult={analysisResult}
          />
        </div>
      </div>
    </div>
  )
}

// ── Fallback result when backend is offline ──────────────────────────────────

function generateFallbackResult(
  regionId: string,
  businessId: string,
  budget: number
): AnalysisResult {
  const region = REGIONS.find((r) => r.id === regionId)
  const business = BUSINESSES.find((b) => b.id === businessId)

  const budgetRatio = budget / Math.max(business?.min_investment ?? 100000, 1)
  const budgetScore = Math.min(100, budgetRatio * 65)
  const competitionScore = Math.max(0, (10 - (region?.competition_density ?? 6)) * 10)
  const incomeScore = Math.min(100, ((region?.avg_income ?? 5000) / (business?.ideal_income ?? 5000)) * 65)
  const trendScore = (region?.consumption_trend ?? 7) * 10
  const flowScore = (region?.urban_flow ?? 7) * 10
  const demoScore = 60

  const score =
    competitionScore * 0.25 +
    demoScore * 0.20 +
    incomeScore * 0.20 +
    trendScore * 0.15 +
    flowScore * 0.10 +
    budgetScore * 0.10

  const roundedScore = Math.round(score * 10) / 10

  const riskLevel: 'low' | 'medium' | 'high' =
    roundedScore >= 70 ? 'low' : roundedScore >= 40 ? 'medium' : 'high'

  return {
    opportunity_score: roundedScore,
    metrics: {
      competition: { value: Math.round(competitionScore), label: 'Concorrência', description: `Densidade: ${region?.competition_density ?? 6}/10` },
      demographics: { value: Math.round(demoScore), label: 'Perfil Demográfico', description: 'Adequação do público estimada' },
      income: { value: Math.round(incomeScore), label: 'Poder de Compra', description: `Renda média: R$ ${(region?.avg_income ?? 5000).toLocaleString('pt-BR')}` },
      trends: { value: Math.round(trendScore), label: 'Tendências de Consumo', description: `Índice: ${region?.consumption_trend ?? 7}/10` },
      urban_flow: { value: Math.round(flowScore), label: 'Fluxo Urbano', description: `Circulação: ${region?.urban_flow ?? 7}/10` },
      budget: { value: Math.round(budgetScore), label: 'Viabilidade Financeira', description: `Orçamento ${budgetRatio >= 1 ? 'adequado' : 'abaixo do mínimo'}` },
    },
    explanation: `Análise simulada (backend offline) para ${business?.name ?? businessId} em ${region?.name ?? regionId}.\n\nScore: ${roundedScore.toFixed(0)}/100. ${region?.description ?? ''}\n\n${region?.highlights?.join('. ') ?? ''}`,
    similar_regions: [],
    recommendation:
      roundedScore >= 75 ? '✅ Fortemente recomendado.' :
      roundedScore >= 60 ? '👍 Recomendado com precauções.' :
      roundedScore >= 40 ? '⚠️ Análise cuidadosa necessária.' : '❌ Alto risco identificado.',
    risk_level: riskLevel,
    estimated_roi: roundedScore >= 70 ? '18–35% a.a.' : roundedScore >= 50 ? '8–18% a.a.' : '0–8% a.a.',
  }
}
