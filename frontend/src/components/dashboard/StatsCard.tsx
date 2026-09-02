'use client';

import { Users, DollarSign, TrendingUp, Zap, Info } from 'lucide-react';
import type { StatsCardData } from '@/types/dashboard';

interface StatsCardProps {
  data: StatsCardData;
}

const iconMap = {
  users: Users,
  'dollar-sign': DollarSign,
  'trending-up': TrendingUp,
  zap: Zap,
};

const iconColorMap: Record<string, string> = {
  'bg-blue-500': 'bg-blue-500',
  'bg-green-500': 'bg-green-500',
  'bg-purple-500': 'bg-purple-500',
  'bg-orange-500': 'bg-orange-500',
};

export default function StatsCard({ data }: StatsCardProps) {
  const Icon = iconMap[data.icon as keyof typeof iconMap] || Users;
  const iconColorClass = iconColorMap[data.iconColor] || 'bg-blue-500';

  const changeColor =
    data.changeType === 'positive'
      ? 'text-success-600'
      : data.changeType === 'negative'
      ? 'text-danger-600'
      : 'text-text-secondary';

  return (
    <div className="bg-white rounded-card border border-border p-5 shadow-card hover:shadow-card-hover transition-all duration-200">
      {/* Header com título e ícone de info */}
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-sm font-medium text-text-secondary">{data.title}</h3>
        <button className="text-text-tertiary hover:text-text-secondary transition-colors">
          <Info className="w-4 h-4" />
        </button>
      </div>

      {/* Valor principal e ícone */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-2xl font-bold text-text-primary mb-1">
            {data.value}
          </p>
          <p className={`text-xs font-medium ${changeColor}`}>
            {data.change}
          </p>
        </div>

        {/* Ícone circular */}
        <div className={`w-12 h-12 rounded-full ${iconColorClass} flex items-center justify-center`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );
}
