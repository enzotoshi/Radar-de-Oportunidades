// Types para o Dashboard do Radar de Oportunidades

export interface StatsCardData {
  title: string;
  value: string;
  change: string;
  changeType: 'positive' | 'negative' | 'neutral';
  icon: string;
  iconColor: string;
}

export interface OpportunityRanking {
  position: number;
  businessType: string;
  score: number;
  description: string;
  icon: string;
  color: string;
}

export interface BusinessMarker {
  id: string;
  name: string;
  category: string;
  lat: number;
  lng: number;
  competition: string;
  potential: number;
  icon: string;
  color: string;
}

export interface HeatmapPoint {
  lat: number;
  lng: number;
  intensity: number;
}

export interface DemographicData {
  totalPopulation: string;
  predominantAge: string;
  populationDensity: string;
  purchasingPower: string;
}

export interface CategoryPerformance {
  name: string;
  data: number[];
  color: string;
}

export interface AnalysisJustification {
  businessType: string;
  score: number;
  text: string;
  tags: Array<{
    label: string;
    color: string;
  }>;
}

export interface FilterState {
  location: string;
  businessType: string;
  budgetMin: number;
  budgetMax: number;
  incomeRange: string;
}

export type NavigationItem = {
  id: string;
  label: string;
  icon: string;
  active: boolean;
}
