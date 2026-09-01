'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine,
} from 'recharts'
import { Loader2, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { REGIONS, BUSINESSES } from '@/lib/data'
import { simulateScenario } from '@/lib/api'
import type { SimulationResult, YearProjection } from '@/types'

interface Props {
  initialRegion?: string
  initialBusiness?: string
}

function generateLocalSimulation(
  regionId: string,
  businessId: string,
  budget: number,
  popGrowth: number,
  incomeGrowth: number,
  newCompetitors: number
): SimulationResult {
  const region = REGIONS.find((r) => r.id === regionId)
  const business = BUSINESSES.find((b) => b.id === businessId)

  const baseScore = Math.round(
    ((10 - (region?.competition_density ?? 6)) * 10 * 0.25) +
    (Math.min(100, ((region?.avg_income ?? 5000) / (business?.ideal_income ?? 5000)) * 65) * 0.20) +
    ((region?.consumption_trend ?? 7) * 10 * 0.15) +
    ((region?.urban_flow ?? 7) * 10 * 0.10) +
    (Math.min(100, (budget / Math.max(business?.min_investment ?? 100000, 1)) * 65) * 0.10) +
    (60 * 0.20)
  )

  const projections: YearProjection[] = []
  for (let i = 1; i <= 5; i++) {
    const factor = i / 5
    const popBonus = popGrowth * factor * 0.3
    const incomeBonus = incomeGrowth * factor * 0.25
    const competitorPenalty = newCompetitors * factor * 1.5
    const projected = Math.max(5, Math.min(99, baseScore + popBonus + incomeBonus - competitorPenalty))
    projections.push({ year: 2024 + i, score: Math.round(projected * 10) / 10, label: String(2024 + i) })
  }

  const projectedScore = projections[4].score
  const delta = Math.round((projectedScore - baseScore) * 10) / 10

  let explanation = ''
  if (delta > 10) explanation = `Cenário otimista: o score deve subir ${delta.toFixed(1)} pontos em 5 anos.`
  else if (delta > 0) explanation = `Cenário levemente positivo: melhora gradual de ${delta.toFixed(1)} pontos.`
  else if (delta > -10) explanation = `Cenário estável com leve retração de ${Math.abs(delta).toFixed(1)} pontos.`
  else explanation = `Cenário de alerta: queda de ${Math.abs(delta).toFixed(1)} pontos. Reavalie a estratégia.`

  const keyFactors: string[] = []
  if (popGrowth > 10) keyFactors.push(`Crescimento populacional +${popGrowth.toFixed(0)}% amplia o público`)
  if (incomeGrowth > 15) keyFactors.push(`Aumento de renda +${incomeGrowth.toFixed(0)}% eleva o poder de compra`)
  if (newCompetitors > 5) keyFactors.push(`${newCompetitors} novos concorrentes pressionam as margens`)
  if (keyFactors.length === 0) keyFactors.push('Parâmetros moderados resultam em estabilidade')

  return { original_score: baseScore, projected_score: projectedScore, delta, projections, explanation, key_factors: keyFactors }
}

interface SliderRowProps {
  label: string
  value: number
  min: number
  max: number
  step: number
  format: (v: number) => string
  onChange: (v: number) => void
}

function SliderRow({ label, value, min, max, step, format, onChange }: SliderRowProps) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <label className="text-sm font-medium text-slate-300">{label}</label>
        <span className="text-sm font-bold text-accent">{format(value)}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full"
        aria-label={label}
      />
      <div className="flex justify-between text-xs text-slate-600">
        <span>{format(min)}</span>
        <span>{format(max)}</span>
      </div>
    </div>
  )
}

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-surface-card border border-slate-700 rounded-lg px-3 py-2 text-xs">
        <p className="text-slate-400">{label}</p>
        <p className="font-bold text-accent">{payload[0].value.toFixed(1)} pts</p>
      </div>
    )
  }
  return null
}

export default function ScenarioSimulation({ initialRegion = '', initialBusiness = '' }: Props) {
  const [region, setRegion] = useState(initialRegion || 'pinheiros')
  const [business, setBusiness] = useState(initialBusiness || 'cafeteria')
  const [budget, setBudget] = useState(150000)
  const [popGrowth, setPopGrowth] = useState(10)
  const [incomeGrowth, setIncomeGrowth] = useState(15)
  const [newCompetitors, setNewCompetitors] = useState(3)
  const [result, setResult] = useState<SimulationResult | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSimulate = async () => {
    setLoading(true)
    try {
      const res = await simulateScenario({ region, business_type: business, budget, population_growth: popGrowth, income_growth: incomeGrowth, new_competitors: newCompetitors })
      setResult(res)
    } catch {
      const res = generateLocalSimulation(region, business, budget, popGrowth, incomeGrowth, newCompetitors)
      setResult(res)
    } finally {
      setLoading(false)
    }
  }

  const deltaColor = !result ? '' : result.delta > 5 ? 'text-accent' : result.delta < -5 ? 'text-red-400' : 'text-warning'
  const DeltaIcon = !result ? Minus : result.delta > 5 ? TrendingUp : result.delta < -5 ? TrendingDown : Minus

  const chartData = result
    ? [
        { label: '2024', score: result.original_score },
        ...result.projections,
      ]
    : []

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <h1 className="text-2xl font-bold text-white mb-1">📊 Simulação de Cenários Futuros</h1>
        <p className="text-slate-400 text-sm">
          Ajuste os parâmetros e projete o score de oportunidade para os próximos 5 anos.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Controls */}
        <div className="space-y-4">
          {/* Region & Business selectors */}
          <div className="bg-surface-card rounded-2xl p-4 border border-slate-700 space-y-3">
            <h3 className="text-sm font-semibold text-slate-300">Configuração Base</h3>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Região</label>
              <select
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                className="w-full bg-surface border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-accent"
              >
                {REGIONS.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Tipo de Negócio</label>
              <select
                value={business}
                onChange={(e) => setBusiness(e.target.value)}
                className="w-full bg-surface border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-accent"
              >
                {BUSINESSES.map((b) => <option key={b.id} value={b.id}>{b.icon} {b.name}</option>)}
              </select>
            </div>
            <SliderRow label="💰 Orçamento (R$)" value={budget} min={20000} max={1000000} step={10000}
              format={(v) => `R$ ${v.toLocaleString('pt-BR')}`} onChange={setBudget} />
          </div>

          {/* Scenario sliders */}
          <div className="bg-surface-card rounded-2xl p-4 border border-slate-700 space-y-5">
            <h3 className="text-sm font-semibold text-slate-300">Variáveis do Cenário</h3>
            <SliderRow label="📈 Crescimento Populacional (%)" value={popGrowth} min={-20} max={50} step={1}
              format={(v) => `${v > 0 ? '+' : ''}${v}%`} onChange={setPopGrowth} />
            <SliderRow label="💵 Aumento de Renda Média (%)" value={incomeGrowth} min={-30} max={80} step={1}
              format={(v) => `${v > 0 ? '+' : ''}${v}%`} onChange={setIncomeGrowth} />
            <SliderRow label="🏪 Novos Concorrentes" value={newCompetitors} min={0} max={20} step={1}
              format={(v) => `${v} novos`} onChange={setNewCompetitors} />
          </div>

          <button
            onClick={handleSimulate}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 bg-accent hover:bg-accent-600 disabled:opacity-50 text-surface font-semibold rounded-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-lg"
          >
            {loading ? <><Loader2 size={16} className="animate-spin" /> Calculando...</> : '🔮 Recalcular Oportunidades'}
          </button>
        </div>

        {/* Results */}
        <div className="space-y-4">
          {result ? (
            <>
              {/* Score comparison */}
              <div className="bg-surface-card rounded-2xl p-4 border border-slate-700">
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Comparativo de Score</h3>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Score Atual</p>
                    <p className="text-2xl font-bold text-white">{result.original_score.toFixed(0)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Variação</p>
                    <p className={`text-2xl font-bold flex items-center justify-center gap-1 ${deltaColor}`}>
                      <DeltaIcon size={18} />
                      {result.delta > 0 ? '+' : ''}{result.delta.toFixed(1)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Projetado (5a)</p>
                    <p className="text-2xl font-bold text-accent">{result.projected_score.toFixed(0)}</p>
                  </div>
                </div>
              </div>

              {/* Chart */}
              <div className="bg-surface-card rounded-2xl p-4 border border-slate-700">
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Evolução do Score (5 anos)</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="label" tick={{ fill: '#64748b', fontSize: 11 }} />
                    <YAxis domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 11 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <ReferenceLine y={70} stroke="#00d4aa" strokeDasharray="4 4" strokeOpacity={0.4} />
                    <ReferenceLine y={40} stroke="#f59e0b" strokeDasharray="4 4" strokeOpacity={0.4} />
                    <Line type="monotone" dataKey="score" stroke="#00d4aa" strokeWidth={2.5}
                      dot={{ fill: '#00d4aa', r: 4 }} activeDot={{ r: 6, fill: '#00d4aa' }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Explanation */}
              <div className="bg-surface-card rounded-2xl p-4 border border-slate-700 space-y-3">
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Análise do Cenário</h3>
                <p className="text-sm text-slate-300">{result.explanation}</p>
                <div className="space-y-1.5">
                  {result.key_factors.map((factor, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <span className="text-accent text-xs mt-0.5">•</span>
                      <p className="text-xs text-slate-400">{factor}</p>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-64 bg-surface-card rounded-2xl border border-slate-700 border-dashed">
              <div className="text-center text-slate-500 space-y-2">
                <p className="text-4xl">📊</p>
                <p className="text-sm">Configure os parâmetros e clique em<br />&quot;Recalcular Oportunidades&quot;</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
