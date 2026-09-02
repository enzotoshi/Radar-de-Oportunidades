'use client';

import { Coffee, Dumbbell, PawPrint, Pill, ArrowRight } from 'lucide-react';
import type { OpportunityRanking as OpportunityRankingType } from '@/types/dashboard';

interface OpportunityRankingProps {
  rankings: OpportunityRankingType[];
  onViewAll?: () => void;
}

const iconMap = {
  coffee: Coffee,
  dumbbell: Dumbbell,
  'paw-print': PawPrint,
  pill: Pill,
};

export default function OpportunityRanking({
  rankings,
  onViewAll,
}: OpportunityRankingProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-success-600 bg-success-50';
    if (score >= 60) return 'text-yellow-600 bg-yellow-50';
    return 'text-orange-600 bg-orange-50';
  };

  const getScoreBadgeColor = (score: number) => {
    if (score >= 80) return 'bg-success-600';
    if (score >= 60) return 'bg-yellow-500';
    return 'bg-orange-500';
  };

  return (
    <div className="bg-white rounded-card border border-border p-5 shadow-card">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-semibold text-text-primary">
          Ranking de Oportunidades
        </h2>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-success-500 animate-pulse"></div>
          <span className="text-xs text-text-tertiary">Atualizado</span>
        </div>
      </div>

      {/* Lista de Rankings */}
      <div className="space-y-4">
        {rankings.map((ranking) => {
          const Icon = iconMap[ranking.icon as keyof typeof iconMap] || Coffee;
          const scoreColorClass = getScoreColor(ranking.score);
          const badgeColorClass = getScoreBadgeColor(ranking.score);

          return (
            <div
              key={ranking.position}
              className="flex items-start gap-3 p-3 rounded-lg hover:bg-background transition-all cursor-pointer group"
            >
              {/* Posição */}
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-background flex items-center justify-center">
                <span className="text-sm font-bold text-primary">
                  {ranking.position}
                </span>
              </div>

              {/* Ícone */}
              <div className={`flex-shrink-0 w-10 h-10 rounded-lg ${scoreColorClass} flex items-center justify-center`}>
                <Icon className="w-5 h-5" />
              </div>

              {/* Conteúdo */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-semibold text-text-primary group-hover:text-primary transition-colors">
                    {ranking.businessType}
                  </h3>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-sm font-bold px-2 py-0.5 rounded ${badgeColorClass} text-white`}
                    >
                      {ranking.score}%
                    </span>
                  </div>
                </div>
                <p className="text-xs text-text-secondary line-clamp-1">
                  {ranking.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer - Ver todas */}
      <button
        onClick={onViewAll}
        className="w-full mt-5 pt-4 border-t border-border flex items-center justify-center gap-2 text-sm font-medium text-primary hover:text-primary-700 transition-colors group"
      >
        <span>Ver todas as oportunidades</span>
        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
      </button>
    </div>
  );
}
