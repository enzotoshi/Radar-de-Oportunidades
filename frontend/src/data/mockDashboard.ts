// Mock data para o Dashboard - dados simulados para demonstração

import type {
  StatsCardData,
  OpportunityRanking,
  BusinessMarker,
  HeatmapPoint,
  DemographicData,
  CategoryPerformance,
  AnalysisJustification,
  NavigationItem
} from '@/types/dashboard';

export const statsCards: StatsCardData[] = [
  {
    title: 'População',
    value: '1,2 mi',
    change: '+1,8% vs. ano anterior',
    changeType: 'positive',
    icon: 'users',
    iconColor: 'bg-blue-500'
  },
  {
    title: 'Renda média',
    value: 'R$ 4.842',
    change: '+6,2% vs. ano anterior',
    changeType: 'positive',
    icon: 'dollar-sign',
    iconColor: 'bg-green-500'
  },
  {
    title: 'Concorrência',
    value: 'Média',
    change: 'Índice 5,3 / 10',
    changeType: 'neutral',
    icon: 'trending-up',
    iconColor: 'bg-purple-500'
  },
  {
    title: 'Demanda potencial',
    value: 'Alta',
    change: 'Índice 8,7 / 10',
    changeType: 'positive',
    icon: 'zap',
    iconColor: 'bg-orange-500'
  }
];

export const opportunityRankings: OpportunityRanking[] = [
  {
    position: 1,
    businessType: 'Cafeteria',
    score: 89,
    description: 'Alto fluxo de pessoas e baixa concorrência',
    icon: 'coffee',
    color: 'text-green-600'
  },
  {
    position: 2,
    businessType: 'Academia',
    score: 84,
    description: 'População jovem e interesse em saúde',
    icon: 'dumbbell',
    color: 'text-green-600'
  },
  {
    position: 3,
    businessType: 'Pet shop',
    score: 76,
    description: 'Boa presença de público consumidor',
    icon: 'paw-print',
    color: 'text-yellow-600'
  },
  {
    position: 4,
    businessType: 'Farmácia',
    score: 42,
    description: 'Mercado mais competitivo na região',
    icon: 'pill',
    color: 'text-orange-600'
  }
];

export const businessMarkers: BusinessMarker[] = [
  {
    id: '1',
    name: 'Região Central',
    category: 'Cafeteria',
    lat: -23.5505,
    lng: -46.6333,
    competition: 'Baixa',
    potential: 89,
    icon: 'coffee',
    color: '#16A34A'
  },
  {
    id: '2',
    name: 'Zona Norte',
    category: 'Academia',
    lat: -23.5200,
    lng: -46.6200,
    competition: 'Média',
    potential: 84,
    icon: 'dumbbell',
    color: '#2563EB'
  },
  {
    id: '3',
    name: 'Zona Sul',
    category: 'Pet shop',
    lat: -23.5800,
    lng: -46.6500,
    competition: 'Média',
    potential: 76,
    icon: 'paw-print',
    color: '#F97316'
  },
  {
    id: '4',
    name: 'Zona Leste',
    category: 'Farmácia',
    lat: -23.5400,
    lng: -46.6100,
    competition: 'Alta',
    potential: 42,
    icon: 'pill',
    color: '#8B5CF6'
  }
];

export const heatmapData: HeatmapPoint[] = [
  { lat: -23.5505, lng: -46.6333, intensity: 0.9 },
  { lat: -23.5520, lng: -46.6350, intensity: 0.85 },
  { lat: -23.5490, lng: -46.6310, intensity: 0.8 },
  { lat: -23.5200, lng: -46.6200, intensity: 0.75 },
  { lat: -23.5800, lng: -46.6500, intensity: 0.65 },
  { lat: -23.5400, lng: -46.6100, intensity: 0.4 },
];

export const demographicData: DemographicData = {
  totalPopulation: '1,2 mi',
  predominantAge: '25 - 34 anos',
  populationDensity: '8.617 hab/km²',
  purchasingPower: 'Alto'
};

export const categoryPerformanceData: CategoryPerformance[] = [
  {
    name: 'Cafeteria',
    data: [65, 68, 70, 72, 75, 78, 80, 82, 85, 87, 89, 89],
    color: '#16A34A'
  },
  {
    name: 'Academia',
    data: [70, 72, 74, 76, 78, 79, 80, 81, 82, 83, 84, 84],
    color: '#2563EB'
  },
  {
    name: 'Pet shop',
    data: [60, 62, 64, 66, 68, 70, 71, 72, 74, 75, 76, 76],
    color: '#F97316'
  },
  {
    name: 'Farmácia',
    data: [50, 48, 46, 45, 44, 43, 42, 42, 42, 42, 42, 42],
    color: '#8B5CF6'
  },
  {
    name: 'Restaurantes',
    data: [55, 57, 59, 61, 63, 65, 67, 69, 71, 73, 75, 77],
    color: '#EC4899'
  }
];

export const analysisJustification: AnalysisJustification = {
  businessType: 'Cafeteria',
  score: 89,
  text: 'A região apresenta boa concentração de público compatível, fluxo relevante de pessoas e baixa concorrência direta. O poder de compra e o perfil predominante dos moradores também favorecem esse tipo de estabelecimento.',
  tags: [
    { label: 'Alta demanda', color: 'bg-green-100 text-green-700' },
    { label: 'Baixa concorrência', color: 'bg-blue-100 text-blue-700' },
    { label: 'Alto fluxo', color: 'bg-purple-100 text-purple-700' },
    { label: 'Renda favorável', color: 'bg-orange-100 text-orange-700' }
  ]
};

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
