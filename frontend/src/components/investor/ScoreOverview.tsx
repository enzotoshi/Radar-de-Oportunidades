'use client'

import { type CSSProperties } from 'react'
import { motion } from 'framer-motion'
import { ShieldCheck } from 'lucide-react'
import type { GameResult } from '@/types'

export default function ScoreOverview({ result, reducedMotion }: { result: GameResult; reducedMotion: boolean }) {
  const progress = Math.max(0, Math.min(100, result.total_score / 10))
  return <section className="score-overview" aria-label="Pontuação geral">
    <span className="section-kicker"><ShieldCheck size={15} aria-hidden="true" />Pontuação educacional</span>
    <div className="score-gauge" style={{ '--score-progress': `${progress * 3.6}deg` } as CSSProperties} role="img" aria-label={`${result.total_score} de 1000 pontos`}>
      {!reducedMotion && <motion.span className="radar-sweep" initial={{ opacity: 0, rotate: -40 }} animate={{ opacity: [0, .65, 0], rotate: 320 }} transition={{ duration: .8 }} aria-hidden="true" />}
      <div><strong>{result.total_score}</strong><span>de 1000</span></div>
    </div>
    <h2>{result.classification}</h2>
    <p>Pontuação educacional; não representa retorno, risco financeiro ou probabilidade de sucesso.</p>
  </section>
}
