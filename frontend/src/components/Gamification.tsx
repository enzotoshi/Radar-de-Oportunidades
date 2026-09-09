'use client'

import { useEffect, useRef, useState, type CSSProperties } from 'react'
import dynamic from 'next/dynamic'
import { motion } from 'framer-motion'
import { useReducedMotion } from '@/lib/useReducedMotion'
import {
  Briefcase,
  Database,
  Loader2,
  RotateCcw,
  ShieldCheck,
  Target,
} from 'lucide-react'
import { calculateGameScore, getApiError } from '@/lib/api'
import type { AnalysisResult, GameResult } from '@/types'
import AnalysisRequired from './AnalysisRequired'
import DetailsSheet from './DetailsSheet'

const MapComponent = dynamic(() => import('./MapComponent'), { ssr: false })

interface Props {
  analysisResult: AnalysisResult | null
  businessType: string
  onGoToMap: () => void
}

type Phase = 'intro' | 'result'

const CONFETTI_COLORS = ['#00d4aa', '#f59e0b', '#8b5cf6', '#3b82f6']

function Confetti() {
  const pieces = Array.from({ length: 24 }, (_, index) => ({
    color: CONFETTI_COLORS[index % CONFETTI_COLORS.length],
    left: (index * 37) % 100,
    delay: (index % 8) * 0.08,
    duration: 2 + (index % 4) * 0.25,
  }))
  return (
    <>
      {pieces.map((piece, index) => (
        <div
          key={index}
          className="confetti-piece fixed top-0 w-2 h-3 rounded-sm pointer-events-none z-50"
          style={{
            backgroundColor: piece.color,
            left: piece.left + '%',
            animationDelay: piece.delay + 's',
            animationDuration: piece.duration + 's',
          }}
        />
      ))}
    </>
  )
}
function ScoreBar({
  label,
  value,
  max,
  color,
}: {
  label: string
  value: number
  max: number
  color: string
}) {
  const reducedMotion = useReducedMotion()
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-slate-400">{label}</span>
        <span className="font-bold text-white">{value} pts</span>
      </div>
      <div className="score-track" role="meter" aria-label={label} aria-valuenow={value} aria-valuemin={0} aria-valuemax={max}>
        <motion.div
          className="score-fill"
          style={{ backgroundColor: color }}
          initial={reducedMotion ? false : { scaleX: 0 }}
          animate={{ scaleX: value / max }}
        />
      </div>
    </div>
  )
}

export default function Gamification({
  analysisResult,
  businessType,
  onGoToMap,
}: Props) {
  const reducedMotion = useReducedMotion()
  const [phase, setPhase] = useState<Phase>('intro')
  const [gameResult, setGameResult] = useState<GameResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showConfetti, setShowConfetti] = useState(false)
  const confettiShown = useRef(false)
  const requestVersion = useRef(0)

  useEffect(() => {
    requestVersion.current += 1
    setLoading(false)
    setShowConfetti(false)
    setPhase('intro')
    setGameResult(null)
    setError(null)
    confettiShown.current = false
  }, [analysisResult])

  useEffect(() => {
    if (
      phase === 'result' &&
      gameResult &&
      gameResult.total_score >= 700 &&
      !confettiShown.current
    ) {
      confettiShown.current = true
      setShowConfetti(true)
      const timer = setTimeout(() => setShowConfetti(false), 3500)
      return () => clearTimeout(timer)
    }
  }, [phase, gameResult])

  const handleEvaluate = async () => {
    if (!analysisResult || !businessType) return
    const version = ++requestVersion.current
    setLoading(true)
    setError(null)
    try {
      const response = await calculateGameScore(
        analysisResult.location,
        businessType,
      )
      if (version !== requestVersion.current) return
      setGameResult(response)
      setPhase('result')
    } catch (reason) {
      if (version !== requestVersion.current) return
      setError(
        getApiError(
          reason,
          'Não foi possível pontuar porque os dados observados estão indisponíveis.',
        ),
      )
    } finally {
      if (version === requestVersion.current) setLoading(false)
    }
  }

  if (!analysisResult) {
    return (
      <div className="page-container investor-page">
        <div className="page-heading">
          <span className="eyebrow"><Briefcase size={15} /> MODO INVESTIDOR EDUCACIONAL</span>
          <h1>Leia os sinais. Questione os limites.</h1>
        </div>
        <AnalysisRequired title="O desafio começa com dados reais." description="Faça uma análise no mapa. O modo investidor não cria bairros, rendas, custos ou tendências de reserva." onGoToMap={onGoToMap} />
      </div>
    )
  }

  return (
    <div className="page-container investor-page">
      <div className="page-heading"><span className="eyebrow"><Briefcase size={15} />MODO INVESTIDOR EDUCACIONAL</span><h1>Leia os sinais. Questione os limites.</h1><p>A pontuação usa os componentes da consulta real selecionada. Ela não representa retorno ou chance de sucesso.</p></div>
      {showConfetti && !reducedMotion && <Confetti />}
        {phase === 'intro' && (
          <motion.div
            key="intro"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            className="investor-intro"
          >
            <div className="investor-territory">
              <div className="investor-map"><MapComponent analysisResult={analysisResult} /></div>
              <div className="territory-caption"><span className="eyebrow">ANÁLISE SELECIONADA</span><h2>{analysisResult.location.municipality?.name || 'Território consultado'}</h2><p>{analysisResult.location.address}</p></div>
              <div className="investor-pillars">
                <span><Target size={20} /> Concorrência mapeada</span>
                <span><ShieldCheck size={20} /> Infraestrutura mapeada</span>
                <span><Database size={20} /> Mobilidade mapeada</span>
              </div>
            </div>

            <div className="investor-capital">
              <span className="icon-tile large"><Briefcase size={28} /></span>
              <div>
                <h2 className="text-xl font-bold text-white">Análise selecionada</h2>
                <p className="text-slate-400 text-sm mt-2">{analysisResult.location.address}</p>
                {analysisResult.location.municipality && (
                  <p className="text-xs text-slate-500 mt-1">
                    {analysisResult.location.municipality.name} · IBGE {analysisResult.location.municipality.ibge_code}
                  </p>
                )}
              </div>
              <div className="score-summary">
                <p className="text-xs text-slate-400">Índice-base da metodologia própria</p>
                <p className="text-4xl font-black text-accent">
                  {analysisResult.opportunity_score.toFixed(1)}
                  <span className="text-base text-slate-400">/100</span>
                </p>
              </div>
              {error && <p role="alert" className="error-message">{error}</p>}
              <button
                type="button"
                onClick={handleEvaluate}
                disabled={loading}
                className="primary-button w-full"
              >
                {loading ? (
                  <><Loader2 size={16} className="animate-spin" /> Consultando...</>
                ) : (
                  <><Target size={17} /> Calcular pontuação educacional</>
                )}
              </button>
            </div>
          </motion.div>
        )}

        {phase === 'result' && gameResult && (
          <motion.div
            key="result"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            className="investor-result"
          >
            <div className="investor-result-title">
              <Target size={28} className="text-accent mx-auto mb-3" aria-hidden="true" />
              <h2>{gameResult.classification}</h2>
              <p className="text-slate-400 text-sm mt-1">
                Pontuação própria, educacional e derivada de dados OSM
              </p>
            </div>

            <div className="investor-score-layout">
            <div className="score-summary score-overview" role="status">
              <span className="eyebrow">PONTUAÇÃO EDUCACIONAL</span>
              <div className="score-dial" style={{ '--score-angle': `${gameResult.total_score / 1000 * 360}deg` } as CSSProperties}><div><strong>{gameResult.total_score}</strong><span>de 1000 pontos</span></div></div>
              <p className="field-help">Metodologia própria · não é indicador oficial</p>
            </div>

            <div className="score-evidence">
            <div className="score-components">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Componentes calculados
              </h3>
              <ScoreBar label="Concorrência mapeada" value={gameResult.competition_component} max={400} color="#087b55" />
              <ScoreBar label="Infraestrutura mapeada" value={gameResult.infrastructure_component} max={300} color="#b88025" />
              <ScoreBar label="Mobilidade mapeada" value={gameResult.mobility_component} max={300} color="#3978b6" />
            </div>

            <div className="score-feedback">
              <p className="text-sm text-slate-300">{gameResult.feedback}</p>
              <DetailsSheet title="Metodologia da pontuação"><p>{gameResult.methodology}</p></DetailsSheet>
              <p className="text-xs text-slate-500">
                Dados coletados em {new Date(gameResult.source_analysis_at).toLocaleString('pt-BR')}
              </p>
            </div>

            <div className="score-tips">
              {gameResult.tips.map((tip) => (
                <p key={tip} className="text-xs text-slate-400">→ {tip}</p>
              ))}
            </div>
            </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setPhase('intro')
                setGameResult(null)
                confettiShown.current = false
              }}
              className="secondary-button w-full"
            >
              <RotateCcw size={17} /> Reavaliar os mesmos dados
            </button>
          </motion.div>
        )}
    </div>
  )
}
