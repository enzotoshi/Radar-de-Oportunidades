'use client'

import { motion } from 'framer-motion'
import type { AnalysisResult } from '@/types'

interface Props {
  result: AnalysisResult
  regionName: string
  businessName: string
  onGoToInvestor?: () => void
}

function ScoreGauge({ score }: { score: number }) {
  const radius = 54
  const circumference = Math.PI * radius // semicircle
  const progress = (score / 100) * circumference
  const color = score >= 70 ? '#00d4aa' : score >= 40 ? '#f59e0b' : '#ef4444'

  return (
    <div className="flex flex-col items-center">
      <svg width="140" height="80" viewBox="0 0 140 80" aria-label={`Score: ${score}`}>
        {/* Background arc */}
        <path
          d={`M 14 70 A ${radius} ${radius} 0 0 1 126 70`}
          fill="none"
          stroke="#334155"
          strokeWidth="10"
          strokeLinecap="round"
        />
        {/* Progress arc */}
        <path
          d={`M 14 70 A ${radius} ${radius} 0 0 1 126 70`}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={`${(progress / circumference) * 170} 170`}
        />
        {/* Score text */}
        <text x="70" y="60" textAnchor="middle" fontSize="28" fontWeight="800" fill={color}>
          {score.toFixed(0)}
        </text>
        <text x="70" y="76" textAnchor="middle" fontSize="11" fill="#64748b">
          / 100
        </text>
      </svg>
    </div>
  )
}

function MetricBar({ label, value, description }: { label: string; value: number; description: string }) {
  const color = value >= 70 ? 'bg-accent' : value >= 40 ? 'bg-warning' : 'bg-red-500'
  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center">
        <span className="text-xs font-medium text-slate-300">{label}</span>
        <span className="text-xs font-bold text-white">{value.toFixed(0)}</span>
      </div>
      <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${color}`}
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>
      <p className="text-xs text-slate-500">{description}</p>
    </div>
  )
}

const riskColors: Record<string, string> = {
  low: 'text-accent bg-accent/10 border-accent/30',
  medium: 'text-warning bg-warning/10 border-warning/30',
  high: 'text-red-400 bg-red-500/10 border-red-500/30',
}
const riskLabels: Record<string, string> = {
  low: 'Baixo Risco',
  medium: 'Risco Médio',
  high: 'Alto Risco',
}

export default function OpportunityScore({ result, regionName, businessName, onGoToInvestor }: Props) {
  const scoreColor =
    result.opportunity_score >= 70
      ? 'text-accent'
      : result.opportunity_score >= 40
        ? 'text-warning'
        : 'text-red-400'

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-4"
    >
      {/* Header card */}
      <div className="bg-surface-card rounded-2xl p-4 border border-slate-700">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="font-bold text-white text-sm">{businessName}</h3>
            <p className="text-xs text-slate-400">{regionName}</p>
          </div>
          <span
            className={`text-xs px-2 py-1 rounded-lg border font-medium ${riskColors[result.risk_level]}`}
          >
            {riskLabels[result.risk_level]}
          </span>
        </div>

        <ScoreGauge score={result.opportunity_score} />

        <p className={`text-center text-xs font-semibold mt-1 ${scoreColor}`}>
          ROI Estimado: {result.estimated_roi}
        </p>
      </div>

      {/* Recommendation */}
      <div className="bg-surface rounded-xl p-3 border border-slate-700">
        <p className="text-sm text-slate-300">{result.recommendation}</p>
      </div>

      {/* Metrics */}
      <div className="bg-surface-card rounded-2xl p-4 border border-slate-700 space-y-3">
        <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Métricas Detalhadas</h4>
        {Object.entries(result.metrics).map(([key, metric]) => (
          <MetricBar
            key={key}
            label={metric.label}
            value={metric.value}
            description={metric.description}
          />
        ))}
      </div>

      {/* Explanation */}
      <div className="bg-surface-card rounded-2xl p-4 border border-slate-700">
        <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Análise de IA</h4>
        <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">
          {result.explanation.replace(/\*\*/g, '')}
        </p>
      </div>

      {/* Similar regions */}
      {result.similar_regions.length > 0 && (
        <div className="bg-surface-card rounded-2xl p-4 border border-slate-700">
          <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
            Regiões Similares
          </h4>
          <div className="space-y-2">
            {result.similar_regions.map((sr) => (
              <div key={sr.name} className="flex items-center justify-between">
                <span className="text-sm text-slate-300">{sr.name}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500">
                    {(sr.similarity * 100).toFixed(0)}% similar
                  </span>
                  <span
                    className={`text-xs font-bold px-2 py-0.5 rounded-md ${
                      sr.score >= 70
                        ? 'bg-accent/20 text-accent'
                        : sr.score >= 40
                          ? 'bg-warning/20 text-warning'
                          : 'bg-red-500/20 text-red-400'
                    }`}
                  >
                    {sr.score.toFixed(0)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CTA */}
      {onGoToInvestor && (
        <button
          onClick={onGoToInvestor}
          className="w-full py-3 bg-accent hover:bg-accent-600 text-surface font-semibold rounded-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-lg"
        >
          🎮 Ver no Modo Investidor
        </button>
      )}
    </motion.div>
  )
}
