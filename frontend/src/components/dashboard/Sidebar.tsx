'use client';

import { useState } from 'react';
import {
  LayoutDashboard,
  Map,
  BarChart3,
  FileText,
  TrendingUp,
  Star,
  MapPin,
  RotateCcw,
  ChevronDown
} from 'lucide-react';
import type { FilterState } from '@/types/dashboard';
import { businessTypes, incomeRanges } from '@/data/mockDashboard';

interface SidebarProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  onAnalyze: () => void;
  onSimulate: () => void;
}

const navigationItems = [
  { id: 'overview', label: 'Visão Geral', icon: LayoutDashboard },
  { id: 'map', label: 'Mapa de Oportunidades', icon: Map },
  { id: 'analysis', label: 'Análises', icon: BarChart3 },
  { id: 'reports', label: 'Relatórios', icon: FileText },
  { id: 'simulations', label: 'Simulações', icon: TrendingUp },
  { id: 'favorites', label: 'Favoritos', icon: Star },
];

export default function Sidebar({
  filters,
  onFiltersChange,
  onAnalyze,
  onSimulate,
}: SidebarProps) {
  const [activeNav, setActiveNav] = useState('overview');

  const handleClearFilters = () => {
    onFiltersChange({
      location: 'São Paulo - SP',
      businessType: 'Todos os tipos',
      budgetMin: 10,
      budgetMax: 2000,
      incomeRange: 'Todas as faixas',
    });
  };

  const formatCurrency = (value: number) => {
    if (value >= 1000) {
      return `R$ ${(value / 1000).toFixed(0)} mi`;
    }
    return `R$ ${value} mil`;
  };

  return (
    <aside className="w-[280px] h-screen bg-white border-r border-border flex flex-col sticky top-0 left-0">
      {/* Navegação */}
      <nav className="px-4 py-6 border-b border-border">
        <div className="space-y-1">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeNav === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => setActiveNav(item.id)}
                className={`
                  w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium
                  transition-all duration-200
                  ${
                    isActive
                      ? 'bg-primary text-white shadow-sm'
                      : 'text-text-secondary hover:bg-sidebar-hover hover:text-text-primary'
                  }
                `}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Filtros */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        {/* Header dos Filtros */}
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
            Filtros
          </h3>
          <button
            onClick={handleClearFilters}
            className="flex items-center gap-1 text-xs text-primary hover:text-primary-700 transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            Limpar
          </button>
        </div>

        <div className="space-y-5">
          {/* Localização */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Localização
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary pointer-events-none" />
              <input
                type="text"
                value={filters.location}
                onChange={(e) =>
                  onFiltersChange({ ...filters, location: e.target.value })
                }
                className="w-full pl-10 pr-4 py-2.5 text-sm border border-border rounded-lg 
                         bg-white text-text-primary placeholder:text-text-tertiary
                         focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
                         transition-all"
                placeholder="Digite a localização"
              />
            </div>
          </div>

          {/* Tipo de negócio */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Tipo de negócio
            </label>
            <div className="relative">
              <select
                value={filters.businessType}
                onChange={(e) =>
                  onFiltersChange({ ...filters, businessType: e.target.value })
                }
                className="w-full px-4 py-2.5 text-sm border border-border rounded-lg 
                         bg-white text-text-primary
                         focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
                         transition-all cursor-pointer"
              >
                {businessTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Orçamento */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Orçamento
            </label>
            <div className="space-y-3">
              {/* Slider */}
              <div className="relative pt-1 px-1">
                <input
                  type="range"
                  min="10"
                  max="2000"
                  step="10"
                  value={filters.budgetMin}
                  onChange={(e) =>
                    onFiltersChange({
                      ...filters,
                      budgetMin: parseInt(e.target.value),
                    })
                  }
                  className="w-full"
                />
              </div>
              
              {/* Valores */}
              <div className="flex items-center justify-between text-xs">
                <span className="px-2 py-1 bg-background rounded text-text-secondary font-medium">
                  {formatCurrency(filters.budgetMin)}
                </span>
                <span className="text-text-tertiary">até</span>
                <span className="px-2 py-1 bg-background rounded text-text-secondary font-medium">
                  {formatCurrency(filters.budgetMax)}
                </span>
              </div>
            </div>
          </div>

          {/* Faixa de renda */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Faixa de renda
            </label>
            <div className="relative">
              <select
                value={filters.incomeRange}
                onChange={(e) =>
                  onFiltersChange({ ...filters, incomeRange: e.target.value })
                }
                className="w-full px-4 py-2.5 text-sm border border-border rounded-lg 
                         bg-white text-text-primary
                         focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
                         transition-all cursor-pointer"
              >
                {incomeRanges.map((range) => (
                  <option key={range} value={range}>
                    {range}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Botões de Ação */}
      <div className="px-4 py-6 border-t border-border space-y-3">
        {/* Botão Analisar */}
        <button
          onClick={onAnalyze}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 
                   bg-success text-white rounded-lg font-medium text-sm
                   hover:bg-success-700 active:bg-success-800
                   transition-all duration-200 shadow-sm hover:shadow-md"
        >
          <TrendingUp className="w-4 h-4" />
          Analisar
        </button>

        {/* Botão Simular */}
        <button
          onClick={onSimulate}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 
                   bg-white text-success border-2 border-success rounded-lg font-medium text-sm
                   hover:bg-success-50
                   transition-all duration-200"
        >
          <BarChart3 className="w-4 h-4" />
          Simular investimento
        </button>

        {/* Informação de atualização */}
        <p className="text-xs text-text-tertiary text-center pt-2">
          Dados atualizados recentemente
        </p>
      </div>
    </aside>
  );
}
