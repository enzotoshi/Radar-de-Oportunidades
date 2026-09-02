// Mock data removido - Dashboard agora usa apenas dados reais da API

import type {
  OpportunityRanking,
  BusinessMarker,
  NavigationItem
} from '@/types/dashboard';

// Arrays vazios - dados vêm da API após análise
export const opportunityRankings: OpportunityRanking[] = [];
export const businessMarkers: BusinessMarker[] = [];

export const navigationItems: NavigationItem[] = [
  { id: 'overview', label: 'Visão Geral', icon: 'layout-dashboard', active: true },
  { id: 'map', label: 'Mapa de Oportunidades', icon: 'map', active: false },
  { id: 'analysis', label: 'Análises', icon: 'bar-chart-3', active: false },
  { id: 'reports', label: 'Relatórios', icon: 'file-text', active: false },
  { id: 'simulations', label: 'Simulações', icon: 'trending-up', active: false },
  { id: 'favorites', label: 'Favoritos', icon: 'star', active: false }
];

export const businessTypes = [
  'Todos os tipos',
  'Cafeteria',
  'Academia',
  'Pet shop',
  'Farmácia',
  'Restaurante',
  'Mercado',
  'Barbearia',
  'Loja de roupas'
];

export const incomeRanges = [
  'Todas as faixas',
  'Baixa',
  'Média',
  'Média-alta',
  'Alta'
];

export const monthLabels = ['Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez', 'Jan', 'Fev', 'Mar', 'Abr', 'Mai'];
