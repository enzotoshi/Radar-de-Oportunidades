'use client'

import { useEffect, useId, useRef, useState, type CSSProperties } from 'react'
import { motion } from 'framer-motion'
import {
  CartesianGrid,
  Area,
  AreaChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import {
  LineChart as ChartIcon,
  Loader2,
  Minus,
  SlidersHorizontal,
  Sparkles,
  TrendingDown,
  TrendingUp,
} from 'lucide-react'
import { getApiError, simulateScenario } from '@/lib/api'
import type { AnalysisResult, SimulationResult } from '@/types'
import AnalysisRequired from './AnalysisRequired'
import DetailsSheet from './DetailsSheet'

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
  const id = useId()
  return (
    <div className="slider-row">
      <div className="flex justify-between items-center gap-3">
        <label htmlFor={id} className="text-sm font-medium text-slate-300">{label}</label>
        <output htmlFor={id} className="text-sm font-bold text-accent">{format(value)}</output>
      </div>
      <input
        id={id}
        style={{ '--range-fill': `${((value - min) / (max - min)) * 100}%` } as CSSProperties}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="w-full"
        aria-label={label}
        aria-valuetext={format(value)}
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
  const requestVersion = useRef(0)

  useEffect(() => {
    requestVersion.current += 1
    setLoading(false)
    setResult(null)
    setError(null)
  }, [analysisResult, businessType])

  const handleSimulate = async () => {
    if (!analysisResult || !businessType) return
    const version = ++requestVersion.current
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
      if (version === requestVersion.current) setResult(response)
    } catch (reason) {
      if (version !== requestVersion.current) return
      setError(
        getApiError(
          reason,
          'Não foi possível calcular a projeção porque os dados-base estão indisponíveis.',
        ),
      )
    } finally {
      if (version === requestVersion.current) setLoading(false)
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
    <div className="page-container simulation-page">
      <motion.div
        className="page-heading"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <span className="eyebrow"><ChartIcon size={15} /> SIMULAÇÃO EXPLÍCITA</span>
        <h1>Simule cenários.</h1>
        <p>
          O ponto de partida vem da última consulta real. As mudanças abaixo são
          hipóteses suas e não previsões econômicas.
        </p>
      </motion.div>

      {!analysisResult ? (
        <AnalysisRequired title="Faça primeiro uma análise real." description="A simulação precisa de uma localização geocodificada e de dados observados; não existe cenário local fictício de reserva." onGoToMap={onGoToMap} />
      ) : (
        <div className="simulation-grid">
          <aside className="scenario-inspector">
            <div className="scenario-location">
              <div className="panel-heading">
                <span className="icon-tile"><SlidersHorizontal size={18} /></span>
                <div>
                  <h3>Território selecionado</h3>
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

            <div className="hypothesis-controls">
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
          </aside>

          <section className="scenario-stage" aria-label="Projeção do cenário">
            {result ? (
              <>
                <div className="projection-summary">
                  <p className="text-xs font-semibold text-warning uppercase tracking-wider mb-3">
                    Projeção · não é previsão
                  </p>
                  <div className="projection-numbers">
                    <div className="observed-number">
                      <p className="text-xs text-slate-500">Observado</p>
                      <p className="text-2xl font-bold text-white">{result.original_score.toFixed(1)}</p>
                    </div>
                    <div className="delta-number">
                      <p className="text-xs text-slate-500">Variação projetada</p>
                      <p className="text-2xl font-bold text-warning flex justify-center items-center gap-1">
                        <DeltaIcon size={18} />
                        {result.delta > 0 ? '+' : ''}{result.delta.toFixed(1)}
                      </p>
                    </div>
                    <div className="projected-number">
                      <p className="text-xs text-slate-500">Projeção em 5 anos</p>
                      <p className="text-2xl font-bold text-accent">{result.projected_score.toFixed(1)}</p>
                    </div>
                  </div>
                </div>

                <div className="projection-chart">
                  <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                    Trajetória calculada do índice
                  </h3>
                  <ResponsiveContainer width="100%" height={340}>
                    <AreaChart data={chartData} accessibilityLayer margin={{ top: 20, right: 14, left: -18, bottom: 8 }}>
                      <CartesianGrid strokeDasharray="3 5" stroke="#d7ded9" vertical={false} />
                      <XAxis dataKey="label" tick={{ fill: '#58675e', fontSize: 12 }} axisLine={false} tickLine={false} tickMargin={14} />
                      <YAxis domain={[0, 100]} tick={{ fill: '#58675e', fontSize: 12 }} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={{ background: '#fff', border: '1px solid #d7ded9', borderRadius: 8, color: '#192c23' }} labelStyle={{ color: '#192c23' }} formatter={(value: number) => [value.toLocaleString('pt-BR'), 'Índice']} />
                      <ReferenceLine y={70} stroke="#087b55" strokeDasharray="4 4" strokeOpacity={0.4} />
                      <Area type="monotone" dataKey="score" stroke="#087b55" fill="#d8eee2" strokeWidth={3} isAnimationActive={false} dot={{ r: 4, fill: '#fff', strokeWidth: 2 }} activeDot={{ r: 6 }} />
                    </AreaChart>
                  </ResponsiveContainer>
                  <details className="chart-values">
                    <summary>Valores da projeção</summary>
                    <table>
                      <caption className="sr-only">Índice observado e projeções por ano</caption>
                      <thead><tr><th scope="col">Ano</th><th scope="col">Índice</th></tr></thead>
                      <tbody>{chartData.map((point) => <tr key={point.year}><th scope="row">{point.label}</th><td>{point.score.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}</td></tr>)}</tbody>
                    </table>
                  </details>
                </div>

                <div className="projection-reading">
                  <h3 className="text-xs font-semibold text-warning uppercase tracking-wider">
                    Premissas e metodologia
                  </h3>
                  <p className="text-sm text-slate-300">{result.explanation}</p>
                  {result.key_factors.map((factor) => (
                    <p key={factor} className="text-xs text-slate-400">• {factor}</p>
                  ))}
                  <DetailsSheet title="Premissas completas e metodologia"><p>{result.methodology}</p><dl className="assumption-list">{Object.entries(result.assumptions).map(([name, value]) => <div key={name}><dt>{name}</dt><dd>{value}</dd></div>)}</dl></DetailsSheet>
                  <p className="text-xs text-slate-500">
                    Dados-base coletados em {new Date(result.source_analysis_at).toLocaleString('pt-BR')}
                  </p>
                </div>
              </>
            ) : (
              <div className="scenario-awaiting">
                <span className="icon-tile large"><ChartIcon size={30} /></span>
                <span className="eyebrow">PROJEÇÃO DO SISTEMA</span>
                <h2>Defina suas hipóteses.</h2>
                <p>Nenhum resultado será fabricado se as fontes reais estiverem indisponíveis.</p>
                <div className="baseline-reading"><span>Índice observado</span><strong>{analysisResult.opportunity_score.toFixed(1)}<small>/100</small></strong><span>Projeção ainda não calculada</span></div>
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  )
}
