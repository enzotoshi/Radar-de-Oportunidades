'use client';

import { Users, Calendar, Grid3x3, Wallet } from 'lucide-react';
import type { DemographicData } from '@/types/dashboard';

interface DemographicProfileProps {
  data: DemographicData;
}

export default function DemographicProfile({ data }: DemographicProfileProps) {
  const indicators = [
    {
      label: 'População total',
      value: data.totalPopulation,
      icon: Users,
      color: 'bg-blue-50 text-blue-600',
    },
    {
      label: 'Idade predominante',
      value: data.predominantAge,
      icon: Calendar,
      color: 'bg-green-50 text-green-600',
    },
    {
      label: 'Densidade populacional',
      value: data.populationDensity,
      icon: Grid3x3,
      color: 'bg-purple-50 text-purple-600',
    },
    {
      label: 'Poder de compra',
      value: data.purchasingPower,
      icon: Wallet,
      color: 'bg-orange-50 text-orange-600',
    },
  ];

  return (
    <div className="bg-white rounded-card border border-border p-5 shadow-card">
      {/* Header */}
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-text-primary">
          Perfil demográfico da área
        </h2>
        <p className="text-sm text-text-secondary mt-1">
          Características principais da população local
        </p>
      </div>

      {/* Grid de indicadores */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {indicators.map((indicator, index) => {
          const Icon = indicator.icon;
          
          return (
            <div
              key={index}
              className="flex flex-col items-start p-4 rounded-lg bg-background hover:bg-gray-100 transition-all cursor-default"
            >
              {/* Ícone */}
              <div className={`w-10 h-10 rounded-lg ${indicator.color} flex items-center justify-center mb-3`}>
                <Icon className="w-5 h-5" />
              </div>

              {/* Label */}
              <p className="text-xs text-text-secondary mb-1 leading-tight">
                {indicator.label}
              </p>

              {/* Valor */}
              <p className="text-lg font-bold text-text-primary">
                {indicator.value}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
