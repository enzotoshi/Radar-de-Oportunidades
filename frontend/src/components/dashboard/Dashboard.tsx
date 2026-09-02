'use client';

import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import Sidebar from './Sidebar';
import StatsCards from './StatsCards';
import OpportunityMap from './OpportunityMap';
import OpportunityRanking from './OpportunityRanking';
import AnalysisJustification from './AnalysisJustification';
import DemographicProfile from './DemographicProfile';
import CategoryPerformanceChart from './CategoryPerformanceChart';
import type { FilterState } from '@/types/dashboard';
import {
  statsCards,
  opportunityRankings,
  businessMarkers,
  demographicData,
  categoryPerformanceData,
  analysisJustification,
} from '@/data/mockDashboard';

export default function Dashboard() {
  const [filters, setFilters] = useState<FilterState>({
    location: 'São Paulo - SP',
    businessType: 'Todos os tipos',
    budgetMin: 10,
    budgetMax: 2000,
    incomeRange: 'Todas as faixas',
  });
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const handleAnalyze = () => {
    console.log('Analisando com filtros:', filters);
    // Aqui você conectará com a API no futuro
    alert('Análise iniciada! (Dados mockados)');
    setIsMobileSidebarOpen(false);
  };

  const handleSimulate = () => {
    console.log('Simulando investimento com filtros:', filters);
    // Aqui você conectará com a funcionalidade de simulação
    alert('Simulação de investimento iniciada! (Dados mockados)');
    setIsMobileSidebarOpen(false);
  };

  const handleViewAllOpportunities = () => {
    console.log('Ver todas as oportunidades');
    // Navegação para página de oportunidades ou modal
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar desktop - oculta em mobile */}
      <div className="hidden lg:block">
        <Sidebar
          filters={filters}
          onFiltersChange={setFilters}
          onAnalyze={handleAnalyze}
          onSimulate={handleSimulate}
        />
      </div>

      {/* Sidebar mobile - overlay */}
      {isMobileSidebarOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setIsMobileSidebarOpen(false)}
          ></div>

          {/* Sidebar mobile */}
          <div className="fixed inset-y-0 left-0 z-50 lg:hidden transform transition-transform duration-300">
            <Sidebar
              filters={filters}
              onFiltersChange={setFilters}
              onAnalyze={handleAnalyze}
              onSimulate={handleSimulate}
            />
          </div>
        </>
      )}

      {/* Área principal com scroll */}
      <main className="flex-1 overflow-y-auto">
        {/* Botão mobile menu - visível apenas em telas pequenas */}
        <div className="lg:hidden sticky top-0 z-30 bg-white border-b border-border px-4 py-3 flex items-center justify-between">
          <h1 className="text-lg font-semibold text-text-primary">
            Radar de Oportunidades
          </h1>
          <button
            onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
            className="p-2 rounded-lg hover:bg-background transition-colors"
          >
            {isMobileSidebarOpen ? (
              <X className="w-6 h-6 text-text-primary" />
            ) : (
              <Menu className="w-6 h-6 text-text-primary" />
            )}
          </button>
        </div>

        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          {/* Cards de indicadores superiores */}
          <StatsCards cards={statsCards} />

          {/* Layout principal: Mapa + Ranking */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            {/* Mapa (70%) */}
            <div className="lg:col-span-2">
              <div className="h-[400px] sm:h-[500px] lg:h-[550px]">
                <OpportunityMap markers={businessMarkers} />
              </div>
            </div>

            {/* Ranking (30%) */}
            <div className="lg:col-span-1">
              <OpportunityRanking
                rankings={opportunityRankings}
                onViewAll={handleViewAllOpportunities}
              />
            </div>
          </div>

          {/* Justificativa da análise */}
          <AnalysisJustification data={analysisJustification} />

          {/* Perfil demográfico e Gráfico de desempenho */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {/* Perfil demográfico */}
            <DemographicProfile data={demographicData} />

            {/* Gráfico de desempenho */}
            <CategoryPerformanceChart categories={categoryPerformanceData} />
          </div>
        </div>
      </main>
    </div>
  );
}
