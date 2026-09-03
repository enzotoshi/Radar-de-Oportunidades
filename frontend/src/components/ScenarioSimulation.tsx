'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import {
  ArrowLeft,
  LineChart as ChartIcon,
  Info,
  Loader2,
  Minus,
  SlidersHorizontal,
  Sparkles,
  TrendingDown,
  TrendingUp,
} from 'lucide-react'
import { getApiError, simulateScenario } from '@/lib/api'
import type { AnalysisResult, SimulationResult } from '@/types'

interface Props {
  analysisResult: AnalysisResult | null
  businessType: string
  onGoToMap: () => void
}

interface SliderRowProps {
  label: string
  value: number
  min: number
  max: number
  step: number
  format: (value: number) => string
  onChange: (value: number) => void
}

function SliderRow({
  label,
  value,
  min,
  max,
  step,
  format,
  onChange,
}: SliderRowProps) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center gap-3">
        <label className="text-sm font-medium text-slate-300">{label}</label>
        <span className="text-sm font-bold text-accent">{format(value)}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="w-full"
        aria-label={label}
      />
      <div className="flex justify-between text-xs text-slate-500">
        <span>{format(min)}</span>
        <span>{format(max)}</span>
      </div>
    </div>
  )
}

export default function ScenarioSimulation({
  analysisResult,
  businessType,
  onGoToMap,
}: Props) {
  const [populationGrowth, setPopulationGrowth] = useState(0)
  const [incomeGrowth, setIncomeGrowth] = useState(0)
  const [newCompetitors, setNewCompetitors] = useState(0)
  const [result, setResult] = useState<SimulationResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSimulate = async () => {
    if (!analysisResult || !businessType) return
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const response = await simulateScenario({
        address: analysisResult.location.address,
        business_type: businessType,
        lat: analysisResult.location.lat,
        lng: analysisResult.location.lng,
        population_growth: populationGrowth,
        income_growth: incomeGrowth,
        new_competitors: newCompetitors,
      })
      setResult(response)
    } catch (reason) {
      setError(
        getApiError(
          reason,
          'Não foi possível calcular a projeção porque os dados-base estão indisponíveis.',
        ),
      )
    } finally {
      setLoading(false)
    }
  }

  const currentYear = new Date().getFullYear()
  const chartData = result
    ? [{ year: currentYear, label: String(currentYear), score: result.original_score }, ...result.projections]
    : []
  const DeltaIcon = !result
    ? Minus
    : result.delta > 0
      ? TrendingUp
      : result.delta < 0
        ? TrendingDown
        : Minus

  return (
    <div className="page-container simulation-page space-y-6">
      <motion.div
        className="page-heading"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <span className="eyebrow"><ChartIcon size={15} /> SIMULAÇÃO EXPLÍCITA</span>
        <h1>Teste hipóteses.<br /><em>Sem confundir projeção com fato.</em></h1>
        <p>
          O ponto de partida vem da última consulta real. As mudanças abaixo são
          hipóteses suas e não previsões econômicas.
        </p>
      </motion.div>

      {!analysisResult ? (
        <div className="panel simulation-empty">
          <span className="icon-tile large"><Info size={28} /></span>
          <h2>Faça primeiro uma análise real.</h2>
          <p>
            A simulação precisa de uma localização geocodificada e de dados
            observados; não existe cenário local fictício de reserva.
          </p>
          <button type="button" onClick={onGoToMap} className="primary-button">
            <ArrowLeft size={16} /> Ir para o mapa
          </button>
        </div>
      ) : (
        <div className="simulation-grid">
          <div className="space-y-4">
            <div className="panel space-y-3">
              <div className="panel-heading">
                <span className="icon-tile"><SlidersHorizontal size={18} /></span>
                <div>
                  <h3>Ponto de partida observado</h3>
                  <p>{analysisResult.location.address}</p>
                </div>
              </div>
              <p className="text-sm text-slate-300">
                Índice atual: <strong>{analysisResult.opportunity_score.toFixed(1)}/100</strong>
              </p>
              <p className="text-xs text-slate-500">
                Coleta real: {new Date(analysisResult.collected_at).toLocaleString('pt-BR')}
              </p>
            </div>

            <div className="panel space-y-5">
              <h3 className="text-sm font-semibold text-slate-300">Hipóteses para cinco anos</h3>
              <SliderRow
                label="Variação populacional hipotética"
                value={populationGrowth}
                min={-20}
                max={50}
                step={1}
                format={(value) => (value > 0 ? '+' : '') + value + '%'}
                onChange={setPopulationGrowth}
              />
              <SliderRow
                label="Variação de renda hipotética"
                value={incomeGrowth}
                min={-30}
                max={80}
                step={1}
                format={(value) => (value > 0 ? '+' : '') + value + '%'}
                onChange={setIncomeGrowth}
              />
              <SliderRow
                label="Novos concorrentes hipotéticos"
                value={newCompetitors}
                min={0}
                max={20}
                step={1}
                format={(value) => value + ' novos'}
                onChange={setNewCompetitors}
              />
            </div>

            {error && <p role="alert" className="error-message">{error}</p>}
            <button
              type="button"
              onClick={handleSimulate}
              disabled={loading}
              className="primary-button w-full"
            >
              {loading ? (
                <><Loader2 size={16} className="animate-spin" /> Calculando projeção...</>
              ) : (
                <><Sparkles size={17} /> Gerar projeção do sistema</>
              )}
            </button>
          </div>

          <div className="space-y-4">
            {result ? (
              <>
                <div className="panel">
                  <p className="text-xs font-semibold text-warning uppercase tracking-wider mb-3">
                    Projeção · não é previsão
                  </p>
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div>
                      <p className="text-xs text-slate-500">Observado</p>
                      <p className="text-2xl font-bold text-white">{result.original_score.toFixed(1)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Variação projetada</p>
                      <p className="text-2xl font-bold text-warning flex justify-center items-center gap-1">
                        <DeltaIcon size={18} />
                        {result.delta > 0 ? '+' : ''}{result.delta.toFixed(1)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Projeção em 5 anos</p>
                      <p className="text-2xl font-bold text-accent">{result.projected_score.toFixed(1)}</p>
                    </div>
                  </div>
                </div>

                <div className="panel">
                  <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                    Trajetória calculada do índice
                  </h3>
                  <ResponsiveContainer width="100%" height={280}>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#263541" />
                      <XAxis dataKey="label" tick={{ fill: '#a0afbd', fontSize: 11 }} />
                      <YAxis domain={[0, 100]} tick={{ fill: '#a0afbd', fontSize: 11 }} />
                      <Tooltip />
                      <ReferenceLine y={70} stroke="#73e2b4" strokeDasharray="4 4" strokeOpacity={0.4} />
                      <Line type="monotone" dataKey="score" stroke="#73e2b4" strokeWidth={2.5} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                <div className="panel space-y-3">
                  <h3 className="text-xs font-semibold text-warning uppercase tracking-wider">
                    Premissas e metodologia
                  </h3>
                  <p className="text-sm text-slate-300">{result.explanation}</p>
                  {result.key_factors.map((factor) => (
                    <p key={factor} className="text-xs text-slate-400">• {factor}</p>
                  ))}
                  <p className="text-xs text-slate-500">{result.methodology}</p>
                  <p className="text-xs text-slate-500">
                    Dados-base coletados em {new Date(result.source_analysis_at).toLocaleString('pt-BR')}
                  </p>
                </div>
              </>
            ) : (
              <div className="simulation-empty panel">
                <span className="icon-tile large"><ChartIcon size={30} /></span>
                <span className="eyebrow">PROJEÇÃO DO SISTEMA</span>
                <h2>Defina suas hipóteses.</h2>
                <p>Nenhum resultado será fabricado se as fontes reais estiverem indisponíveis.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
