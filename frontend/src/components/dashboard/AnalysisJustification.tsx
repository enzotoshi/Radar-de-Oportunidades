'use client';

import { Coffee, TrendingUp, Sparkles } from 'lucide-react';
import type { AnalysisJustification as AnalysisJustificationType } from '@/types/dashboard';

interface AnalysisJustificationProps {
  data: AnalysisJustificationType;
}

export default function AnalysisJustification({ data }: AnalysisJustificationProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-success-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-orange-600';
  };

  const getScoreBadge = (score: number) => {
    if (score >= 80) return { label: 'Potencial muito alto', color: 'bg-success-100 text-success-700 border-success-200' };
    if (score >= 60) return { label: 'Potencial alto', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' };
    return { label: 'Potencial médio', color: 'bg-orange-100 text-orange-700 border-orange-200' };
  };

  const scoreBadge = getScoreBadge(data.score);
  const scoreColor = getScoreColor(data.score);

  return (
    <div className="bg-white rounded-card border border-border p-6 shadow-card">
      {/* Header */}
      <div className="flex items-start gap-3 mb-4">
        <div className="w-12 h-12 rounded-lg bg-primary-50 flex items-center justify-center flex-shrink-0">
          <Sparkles className="w-6 h-6 text-primary" />
        </div>
        <div className="flex-1">
          <h2 className="text-lg font-semibold text-text-primary mb-1">
            Justificativa da análise
          </h2>
          <p className="text-sm text-text-secondary">
            Análise gerada por IA com base em dados demográficos e de mercado
          </p>
        </div>
      </div>

      {/* Título da oportunidade */}
      <div className="flex items-center gap-3 mb-4 pb-4 border-b border-border">
        <div className="flex items-center gap-2">
          <Coffee className="w-5 h-5 text-text-secondary" />
          <h3 className="font-semibold text-text-primary text-base">
            {data.businessType}
          </h3>
        </div>
        <span className="text-lg font-bold mx-2 text-text-tertiary">—</span>
        <div className="flex items-center gap-2">
          <span className={`text-base font-bold ${scoreColor}`}>
            {data.score}%
          </span>
          <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${scoreBadge.color}`}>
            {scoreBadge.label}
          </span>
        </div>
      </div>

      {/* Texto da justificativa */}
      <div className="mb-5">
        <p className="text-sm text-text-secondary leading-relaxed">
          {data.text}
        </p>
      </div>

      {/* Tags de características */}
      <div className="flex flex-wrap gap-2">
        {data.tags.map((tag, index) => (
          <span
            key={index}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium ${tag.color}`}
          >
            <TrendingUp className="w-3 h-3" />
            {tag.label}
          </span>
        ))}
      </div>
    </div>
  );
}
