'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Loader2 } from 'lucide-react'
import { REGIONS, BUSINESSES } from '@/lib/data'
import { calculateGameScore } from '@/lib/api'
import type { GameResult, Region, Business } from '@/types'

const TOTAL_BUDGET = 500000

type Phase = 'intro' | 'playing' | 'result'

const CONFETTI_COLORS = ['#00d4aa', '#f59e0b', '#ef4444', '#8b5cf6', '#3b82f6', '#ec4899']

function ConfettiPiece({ color, left, delay, duration }: { color: string; left: number; delay: number; duration: number }) {
  return (
    <div
      className="confetti-piece fixed top-0 w-2 h-3 rounded-sm pointer-events-none z-50"
      style={{
        backgroundColor: color,
        left: `${left}%`,
        animationDelay: `${delay}s`,
        animationDuration: `${duration}s`,
      }}
    />
  )
}

function Confetti() {
  const pieces = Array.from({ length: 40 }, (_, i) => ({
    color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
    left: Math.random() * 100,
    delay: Math.random() * 0.8,
    duration: 2 + Math.random() * 1.5,
  }))
  return (
    <>
      {pieces.map((p, i) => <ConfettiPiece key={i} {...p} />)}
    </>
  )
}

function ScoreBar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-slate-400">{label}</span>
        <span className="font-bold text-white">{value} pts</span>
      </div>
      <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
          initial={{ width: 0 }}
          animate={{ width: `${(value / max) * 100}%` }}
          transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
        />
      </div>
    </div>
  )
}

export default function Gamification() {
  const [phase, setPhase] = useState<Phase>('intro')
  const [selectedRegion, setSelectedRegion] = useState<Region | null>(null)
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null)
  const [gameResult, setGameResult] = useState<GameResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const confettiShownRef = useRef(false)

  const budgetUsed = selectedBusiness?.min_investment ?? 0
  const budgetRemaining = TOTAL_BUDGET - budgetUsed
  const budgetPct = Math.min(100, (budgetUsed / TOTAL_BUDGET) * 100)

  useEffect(() => {
    if (phase === 'result' && gameResult && !confettiShownRef.current && (gameResult.total_score >= 500)) {
      confettiShownRef.current = true
      setShowConfetti(true)
      const t = setTimeout(() => setShowConfetti(false), 3500)
      return () => clearTimeout(t)
    }
  }, [phase, gameResult])

  const handleInvest = async () => {
    if (!selectedRegion || !selectedBusiness) return
    setLoading(true)
    try {
      const result = await calculateGameScore(
        selectedRegion.id,
        selectedBusiness.id,
        selectedBusiness.min_investment,
        TOTAL_BUDGET
      )
      setGameResult(result)
    } catch {
      // Fallback local calculation
      const baseScore = Math.round(
        ((10 - selectedRegion.competition_density) * 10 * 0.25) +
        (Math.min(100, (selectedRegion.avg_income / selectedBusiness.ideal_income) * 65) * 0.20) +
        (selectedRegion.consumption_trend * 10 * 0.15) +
        (selectedRegion.urban_flow * 10 * 0.10) + 60 * 0.30
      )
      const sp = Math.min(400, baseScore * 4)
      const rm = selectedBusiness.min_investment <= TOTAL_BUDGET * 0.8 ? 300 : 150
      const mt = Math.min(300, selectedRegion.consumption_trend * 30)
      const total = sp + rm + mt
      const cls = total >= 750 ? 'Guru dos Negócios' : total >= 500 ? 'Estrategista' : 'Investidor Novato'
      setGameResult({
        total_score: total,
        success_potential: sp,
        risk_management: rm,
        market_timing: mt,
        classification: cls,
        feedback: total >= 750
          ? 'Escolha brilhante! Visão estratégica excepcional.'
          : total >= 500
            ? 'Boa jogada! Análise sólida com equilíbrio entre risco e retorno.'
            : 'É um começo! Esta escolha apresenta desafios. Estude mais o perfil das regiões.',
        tips: [
          'Analise sempre a relação renda média vs. investimento mínimo',
          'Bairros com tendência > 8 tendem a ter melhor performance',
          'Concorrência acima de 7 requer diferencial claro',
        ],
      })
    } finally {
      setLoading(false)
      setPhase('result')
    }
  }

  const handleReset = () => {
    setPhase('intro')
    setSelectedRegion(null)
    setSelectedBusiness(null)
    setGameResult(null)
    confettiShownRef.current = false
  }

  const classificationEmoji: Record<string, string> = {
    'Guru dos Negócios': '🏆',
    'Estrategista': '🎯',
    'Investidor Novato': '📖',
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      {showConfetti && <Confetti />}

      <AnimatePresence mode="wait">
        {/* ── INTRO ── */}
        {phase === 'intro' && (
          <motion.div
            key="intro"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex items-center justify-center min-h-[60vh]"
          >
            <div className="bg-surface-card rounded-3xl p-8 border border-slate-700 max-w-md w-full text-center space-y-6 shadow-2xl">
              <div className="text-6xl">🎮</div>
              <div>
                <h1 className="text-2xl font-bold text-white mb-2">Modo Investidor</h1>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Você recebeu um capital de investimento. Tome as melhores decisões para maximizar o retorno!
                </p>
              </div>

              <div className="bg-gradient-to-br from-accent/20 to-primary-700/20 rounded-2xl p-5 border border-accent/30">
                <p className="text-xs text-slate-400 mb-1">Seu orçamento</p>
                <p className="text-4xl font-black text-accent">R$ 500.000</p>
                <p className="text-xs text-slate-500 mt-1">Escolha região + negócio estrategicamente</p>
              </div>

              <div className="space-y-2 text-sm text-slate-400 text-left">
                {['Analise o perfil de cada região', 'Escolha o negócio mais compatível', 'Receba pontuação e feedback de especialista'].map((tip, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-accent/20 text-accent text-xs flex items-center justify-center font-bold flex-shrink-0">{i + 1}</span>
                    <span>{tip}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => setPhase('playing')}
                className="w-full py-3.5 bg-accent hover:bg-accent-600 text-surface font-bold rounded-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-lg text-base"
              >
                🚀 Começar
              </button>
            </div>
          </motion.div>
        )}

        {/* ── PLAYING ── */}
        {phase === 'playing' && (
          <motion.div
            key="playing"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-5"
          >
            <div>
              <h1 className="text-xl font-bold text-white mb-1">🎮 Modo Investidor</h1>
              <p className="text-slate-400 text-sm">Escolha onde e o que investir para maximizar o retorno.</p>
            </div>

            {/* Budget bar */}
            <div className="bg-surface-card rounded-2xl p-4 border border-slate-700 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Orçamento disponível</span>
                <span className={`font-bold ${budgetRemaining < 0 ? 'text-red-400' : 'text-accent'}`}>
                  R$ {budgetRemaining.toLocaleString('pt-BR')}
                </span>
              </div>
              <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${budgetPct > 90 ? 'bg-red-500' : budgetPct > 60 ? 'bg-warning' : 'bg-accent'}`}
                  style={{ width: `${budgetPct}%` }}
                />
              </div>
              <p className="text-xs text-slate-500">
                Total: R$ {TOTAL_BUDGET.toLocaleString('pt-BR')} · Comprometido: R$ {budgetUsed.toLocaleString('pt-BR')}
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* Region selection */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-slate-300">🏙️ Escolha a Região</h3>
                <div className="grid grid-cols-1 gap-2 max-h-[380px] overflow-y-auto pr-1">
                  {REGIONS.map((r) => (
                    <button
                      key={r.id}
                      onClick={() => setSelectedRegion(r)}
                      className={`text-left p-3 rounded-xl border transition-all duration-150 ${
                        selectedRegion?.id === r.id
                          ? 'border-accent bg-accent/10 shadow-md'
                          : 'border-slate-700 bg-surface hover:border-slate-500 hover:bg-surface-elevated'
                      }`}
                    >
                      <div className="flex justify-between items-start gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm text-white truncate">{r.name}</p>
                          <p className="text-xs text-slate-500 truncate">{r.highlights[0]}</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-xs text-slate-400">Renda</p>
                          <p className="text-xs font-bold text-accent">R$ {(r.avg_income / 1000).toFixed(0)}k</p>
                        </div>
                      </div>
                      <div className="flex gap-3 mt-2 text-xs text-slate-500">
                        <span>Concorrência: {r.competition_density}/10</span>
                        <span>Tendência: {r.consumption_trend}/10</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Business selection */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-slate-300">💼 Escolha o Negócio</h3>
                <div className="grid grid-cols-1 gap-2 max-h-[380px] overflow-y-auto pr-1">
                  {BUSINESSES.map((b) => (
                    <button
                      key={b.id}
                      onClick={() => setSelectedBusiness(b)}
                      className={`text-left p-3 rounded-xl border transition-all duration-150 ${
                        selectedBusiness?.id === b.id
                          ? 'border-accent bg-accent/10 shadow-md'
                          : 'border-slate-700 bg-surface hover:border-slate-500 hover:bg-surface-elevated'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{b.icon}</span>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm text-white truncate">{b.name}</p>
                          <p className="text-xs text-slate-500">{b.sector}</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-xs text-slate-400">Mín.</p>
                          <p className={`text-xs font-bold ${b.min_investment > TOTAL_BUDGET ? 'text-red-400' : 'text-accent'}`}>
                            R$ {(b.min_investment / 1000).toFixed(0)}k
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={handleInvest}
              disabled={!selectedRegion || !selectedBusiness || loading}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-accent hover:bg-accent-600 disabled:opacity-50 disabled:cursor-not-allowed text-surface font-bold rounded-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-lg"
            >
              {loading ? <><Loader2 size={16} className="animate-spin" /> Avaliando...</> : '💰 Fazer Investimento'}
            </button>
          </motion.div>
        )}

        {/* ── RESULT ── */}
        {phase === 'result' && gameResult && (
          <motion.div
            key="result"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="max-w-lg mx-auto space-y-5"
          >
            <div className="text-center">
              <p className="text-5xl mb-2">{classificationEmoji[gameResult.classification] ?? '🎯'}</p>
              <h1 className="text-2xl font-black text-white">{gameResult.classification}</h1>
              <p className="text-slate-400 text-sm mt-1">
                {selectedRegion?.name} · {selectedBusiness?.icon} {selectedBusiness?.name}
              </p>
            </div>

            {/* Total score */}
            <div className="bg-gradient-to-br from-accent/20 to-primary-700/20 rounded-2xl p-6 border border-accent/30 text-center">
              <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Pontuação Final</p>
              <motion.p
                className="text-6xl font-black text-accent"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              >
                {gameResult.total_score}
              </motion.p>
              <p className="text-slate-400 text-xs mt-1">de 1000 pontos</p>
            </div>

            {/* Breakdown */}
            <div className="bg-surface-card rounded-2xl p-4 border border-slate-700 space-y-3">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Detalhamento</h3>
              <ScoreBar label="🎯 Potencial de Sucesso" value={gameResult.success_potential} max={400} color="#00d4aa" />
              <ScoreBar label="🛡️ Gestão de Risco" value={gameResult.risk_management} max={300} color="#f59e0b" />
              <ScoreBar label="⏱️ Timing de Mercado" value={gameResult.market_timing} max={300} color="#8b5cf6" />
            </div>

            {/* Feedback */}
            <div className="bg-surface-card rounded-2xl p-4 border border-slate-700">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Feedback do Especialista</h3>
              <p className="text-sm text-slate-300 leading-relaxed">{gameResult.feedback}</p>
            </div>

            {/* Tips */}
            {gameResult.tips.length > 0 && (
              <div className="bg-surface-card rounded-2xl p-4 border border-slate-700 space-y-2">
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">💡 Dicas para Melhorar</h3>
                {gameResult.tips.map((tip, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="text-accent text-xs mt-0.5">→</span>
                    <p className="text-xs text-slate-400">{tip}</p>
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={handleReset}
              className="w-full py-3 bg-surface-elevated hover:bg-slate-600 text-white font-semibold rounded-xl border border-slate-600 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
            >
              🔄 Jogar Novamente
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
