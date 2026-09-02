'use client';

import { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Map,
  BarChart3,
  FileText,
  TrendingUp,
  Star,
  RotateCcw,
  ChevronDown
} from 'lucide-react';
import type { FilterState } from '@/types/dashboard';
import LocationAutocomplete from './LocationAutocomplete';
import { getAvailableBusinessTypes } from '@/services/api';

interface SidebarProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState, coordinates?: { lat: number; lng: number }) => void;
  onAnalyze: () => void;
  onSimulate: () => void;
  isAnalyzing?: boolean;
  isSimulating?: boolean;
}

const navigationItems = [
  { id: 'overview', label: 'Visão Geral', icon: LayoutDashboard },
  { id: 'map', label: 'Mapa de Oportunidades', icon: Map },
  { id: 'analysis', label: 'Análises', icon: BarChart3 },
  { id: 'reports', label: 'Relatórios', icon: FileText },
  { id: 'simulations', label: 'Simulações', icon: TrendingUp },
  { id: 'favorites', label: 'Favoritos', icon: Star },
];

const incomeRanges = [
  'Todas as faixas',
  'Até R$ 2 mil',
  'R$ 2 mil a R$ 5 mil',
  'R$ 5 mil a R$ 10 mil',
  'Acima de R$ 10 mil',
];

export default function Sidebar({
  filters,
  onFiltersChange,
  onAnalyze,
  onSimulate,
  isAnalyzing = false,
  isSimulating = false,
}: SidebarProps) {
  const [activeNav, setActiveNav] = useState('overview');
  const [businessTypes, setBusinessTypes] = useState<string[]>(['Todos os tipos']);
  const [selectedCoordinates, setSelectedCoordinates] = useState<{lat: number; lng: number} | null>(null);

  // Carregar tipos de negócio do backend
  useEffect(() => {
    async function loadBusinessTypes() {
      try {
        const types = await getAvailableBusinessTypes();
        // Verifica se é um array válido
        if (Array.isArray(types) && types.length > 0) {
          setBusinessTypes(['Todos os tipos', ...types]);
        } else {
          // Fallback se backend não retornar array
          console.warn('Backend não retornou tipos de negócio válidos, usando fallback');
          setBusinessTypes([
            'Todos os tipos',
            'Cafeteria',
            'Restaurante',
            'Academia',
            'Pet Shop',
            'Farmácia',
            'Padaria',
            'Loja de Roupas',
            'Mercado',
          ]);
        }
      } catch (error) {
        console.error('Erro ao carregar tipos de negócio:', error);
        // Fallback em caso de erro
        setBusinessTypes([
          'Todos os tipos',
          'Cafeteria',
          'Restaurante',
          'Academia',
          'Pet Shop',
          'Farmácia',
          'Padaria',
          'Loja de Roupas',
          'Mercado',
        ]);
      }
    }
    loadBusinessTypes();
  }, []);

  const handleClearFilters = () => {
    onFiltersChange({
      location: '', // Começa vazio
      businessType: 'Todos os tipos',
      budgetMin: 10,
      budgetMax: 2000,
      incomeRange: 'Todas as faixas',
    });
    setSelectedCoordinates(null);
  };

  const formatCurrency = (value: number) => {
    if (value >= 1000) {
      return `R$ ${(value / 1000).toFixed(0)} mi`;
    }
    return `R$ ${value} mil`;
  };

  const handleLocationChange = (location: string, coordinates?: {lat: number; lng: number}) => {
    onFiltersChange({ ...filters, location }, coordinates);
    if (coordinates) {
      setSelectedCoordinates(coordinates);
    }
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
          {/* Localização com Autocomplete */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Localização
            </label>
            <LocationAutocomplete
              value={filters.location}
              onChange={handleLocationChange}
              placeholder="Digite um endereço..."
            />
            <p className="mt-1 text-xs text-text-tertiary">
              Ex: Avenida Paulista, São Paulo
            </p>
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
          disabled={isAnalyzing}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 
                   bg-success text-white rounded-lg font-medium text-sm
                   hover:bg-success-700 active:bg-success-800
                   transition-all duration-200 shadow-sm hover:shadow-md
                   disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-success"
        >
          <TrendingUp className={`w-4 h-4 ${isAnalyzing ? 'animate-pulse' : ''}`} />
          {isAnalyzing ? 'Analisando...' : 'Analisar'}
        </button>

        {/* Botão Simular */}
        <button
          onClick={onSimulate}
          disabled={isSimulating}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 
                   bg-white text-success border-2 border-success rounded-lg font-medium text-sm
                   hover:bg-success-50
                   transition-all duration-200
                   disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white"
        >
          <BarChart3 className={`w-4 h-4 ${isSimulating ? 'animate-pulse' : ''}`} />
          {isSimulating ? 'Simulando...' : 'Simular investimento'}
        </button>

        {/* Informação de atualização */}
        <p className="text-xs text-text-tertiary text-center pt-2">
          Dados atualizados recentemente
        </p>
      </div>
    </aside>
  );
}
