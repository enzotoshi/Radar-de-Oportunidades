'use client';

import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import Sidebar from './Sidebar';
import OpportunityMap from './OpportunityMap';
import type { FilterState } from '@/types/dashboard';
import {
  businessMarkers,
} from '@/data/mockDashboard';
import { analyzeOpportunity } from '@/services/api';

export default function Dashboard() {
  const [filters, setFilters] = useState<FilterState>({
    location: '', // Começa vazio para usuário digitar
    businessType: 'Todos os tipos',
    budgetMin: 10,
    budgetMax: 2000,
    incomeRange: 'Todas as faixas',
  });
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  
  // Estado para coordenadas do mapa (sincronizado com autocomplete)
  const [mapCenter, setMapCenter] = useState({ lat: -23.5505, lng: -46.6333 }); // São Paulo padrão
  const [mapZoom, setMapZoom] = useState(12);
  const [selectedCoordinates, setSelectedCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  
  // Estado para análise real
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  
  // Estado para simulação
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationResult, setSimulationResult] = useState<any>(null);

  const handleFiltersChange = (newFilters: FilterState, coordinates?: { lat: number; lng: number }) => {
    setFilters(newFilters);
    
    // Se coordenadas foram passadas (do autocomplete), atualiza o mapa
    if (coordinates) {
      setSelectedCoordinates(coordinates);
      setMapCenter(coordinates);
      setMapZoom(14); // Zoom mais próximo quando seleciona endereço específico
    } else if (newFilters.location !== filters.location) {
      // Texto digitado ainda não corresponde necessariamente ao ponto do mapa.
      setSelectedCoordinates(null);
    }
  };

  const handleLocationSelect = (location: { lat: number; lng: number; address: string }) => {
    // Atualiza o centro do mapa
    setMapCenter({ lat: location.lat, lng: location.lng });
    setMapZoom(15); // Zoom mais próximo
    
    // Atualiza os filtros E as coordenadas
    const newFilters = {
      ...filters,
      location: location.address
    };
    
    // Usa handleFiltersChange para sincronizar tudo
    handleFiltersChange(newFilters, { lat: location.lat, lng: location.lng });
    
    console.log('Local selecionado:', location);
  };

  const handleAnalyze = async () => {
    // Validações
    if (!filters.location || filters.location.trim() === '') {
      alert('⚠️ Digite uma localização primeiro!');
      return;
    }

    if (filters.businessType === 'Todos os tipos') {
      alert('⚠️ Selecione um tipo de negócio específico!');
      return;
    }

    if (!selectedCoordinates) {
      alert('⚠️ Selecione um endereço da lista ou clique no mapa para confirmar as coordenadas reais.');
      return;
    }

    setIsAnalyzing(true);
    setIsMobileSidebarOpen(false);

    try {
      // Chama API real do backend com coordenadas
      const result = await analyzeOpportunity({
        region: filters.location,
        business_type: filters.businessType,
        budget: filters.budgetMin * 1000, // Converte para valor real (ex: 50 mil = 50000)
        lat: selectedCoordinates.lat,
        lng: selectedCoordinates.lng,
      });

      setAnalysisResult(result);
      console.log('Resultado da análise:', result);
    } catch (error: any) {
      console.error('Erro ao analisar:', error);
      
      if (error.message?.includes('Network Error') || error.code === 'ERR_NETWORK') {
        alert('❌ Backend não está rodando!\n\nInicie o backend:\ncd backend\npython -m uvicorn main:app --reload --port 8000');
      } else {
        alert(`❌ Erro ao analisar: ${error.response?.data?.detail || error.message}`);
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSimulate = async () => {
    // Validações
    if (!filters.location || filters.location.trim() === '') {
      alert('⚠️ Digite uma localização primeiro!');
      return;
    }

    if (filters.businessType === 'Todos os tipos') {
      alert('⚠️ Selecione um tipo de negócio específico!');
      return;
    }

    setIsSimulating(true);
    setIsMobileSidebarOpen(false);

    try {
      // Chama API de simulação do backend
      const response = await fetch('http://localhost:8000/api/simulate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          region: filters.location,
          business_type: filters.businessType,
          budget: filters.budgetMin * 1000,
          population_growth: 15, // Pode adicionar sliders no futuro
          income_growth: 20,
          new_competitors: 3,
        }),
      });

      if (!response.ok) {
        throw new Error('Erro ao simular');
      }

      const result = await response.json();
      setSimulationResult(result);
      console.log('Resultado da simulação:', result);
    } catch (error: any) {
      console.error('Erro ao simular:', error);
      
      if (error.message?.includes('Failed to fetch')) {
        alert('❌ Backend não está rodando!\n\nInicie o backend:\ncd backend\npython -m uvicorn main:app --reload --port 8000');
      } else {
        alert(`❌ Erro ao simular: ${error.message}`);
      }
    } finally {
      setIsSimulating(false);
    }
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
          onFiltersChange={handleFiltersChange}
          onAnalyze={handleAnalyze}
          onSimulate={handleSimulate}
          isAnalyzing={isAnalyzing}
          isSimulating={isSimulating}
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
              onFiltersChange={handleFiltersChange}
              onAnalyze={handleAnalyze}
              onSimulate={handleSimulate}
              isAnalyzing={isAnalyzing}
              isSimulating={isSimulating}
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
          {/* Mensagem inicial - antes da análise */}
          {!analysisResult && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
              <h2 className="text-xl font-semibold text-blue-900 mb-2">
                👋 Bem-vindo ao Radar de Oportunidades
              </h2>
              <p className="text-blue-700 mb-4">
                Digite uma localização e selecione um tipo de negócio para começar a análise
              </p>
              <p className="text-sm text-blue-600">
                💡 Use o menu lateral para configurar sua busca e clique em "Analisar"
              </p>
            </div>
          )}

          {/* Mapa - sempre visível no topo */}
          <div className="grid grid-cols-1 gap-4 sm:gap-6">
            <div className="w-full">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
                <p className="text-sm text-blue-800">
                  💡 <strong>Dica:</strong> Clique em qualquer lugar no mapa para selecionar um local para análise
                </p>
              </div>
              <div className="h-[400px] sm:h-[500px] lg:h-[550px]">
                <OpportunityMap 
                  markers={analysisResult?.business_markers || businessMarkers} 
                  center={mapCenter}
                  zoom={mapZoom}
                  onLocationSelect={handleLocationSelect}
                />
              </div>
            </div>
          </div>

          {/* Resultados da análise - EMBAIXO DO MAPA */}
          {analysisResult && (
            <>
              {/* Header do resultado */}
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-6 text-white shadow-lg">
                <h2 className="text-2xl font-bold mb-2">
                  ✅ Análise Completa!
                </h2>
                <p className="text-blue-100">
                  Resultados para {filters.businessType} em {filters.location}
                </p>
                {analysisResult.sources && (
                  <div className="flex flex-wrap gap-2 mt-4">
                    {analysisResult.sources.map((source: any) => (
                      <a
                        key={source.name}
                        href={source.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs px-3 py-1 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                      >
                        {source.status === 'ok' ? '✓' : '⚠'} {source.name}
                      </a>
                    ))}
                  </div>
                )}
              </div>

              {/* Score Principal */}
              <div className="bg-white rounded-lg border-2 border-blue-500 p-6 shadow-lg">
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">Score de Oportunidade</h3>
                  <div className="text-6xl font-bold text-blue-600 mb-2">
                    {(analysisResult.opportunity_score || 0).toFixed(1)}
                  </div>
                  <p className="text-gray-500">de 100 pontos</p>
                  
                  <div className="flex justify-center gap-3 mt-4">
                    <span className={`px-4 py-2 rounded-full text-sm font-medium ${
                      analysisResult.risk_level === 'low' ? 'bg-green-100 text-green-700' :
                      analysisResult.risk_level === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      🛡️ Risco: {analysisResult.risk_level || 'N/A'}
                    </span>
                    {analysisResult.estimated_roi && (
                      <span className="px-4 py-2 rounded-full text-sm font-medium bg-purple-100 text-purple-700">
                        💰 ROI: {analysisResult.estimated_roi}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Cards de métricas */}
              {analysisResult.metrics && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">📊 Métricas Detalhadas</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {Object.entries(analysisResult.metrics).map(([key, metric]: [string, any]) => (
                      <div key={key} className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow">
                        <h4 className="text-sm font-medium text-gray-600 mb-1">
                          {metric.label}
                        </h4>
                        <p className="text-2xl font-bold text-gray-900">
                          {metric.value}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {metric.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Explicação da análise */}
              {analysisResult.explanation && (
                <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    💡 Análise Detalhada
                  </h3>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                    {analysisResult.explanation}
                  </p>
                </div>
              )}

              {/* Recomendação */}
              {analysisResult.recommendation && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-yellow-900 mb-2 flex items-center gap-2">
                    💼 Recomendação
                  </h3>
                  <p className="text-yellow-800">
                    {analysisResult.recommendation}
                  </p>
                </div>
              )}

              {/* Regiões similares */}
              {analysisResult.similar_regions && analysisResult.similar_regions.length > 0 && (
                <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">
                    📍 Regiões Similares
                  </h3>
                  <div className="space-y-2">
                    {analysisResult.similar_regions.map((region: any, idx: number) => (
                      <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 rounded hover:bg-gray-100 transition-colors">
                        <span className="font-medium text-gray-800">{region.name}</span>
                        <div className="flex gap-3">
                          <span className="text-sm text-gray-600">Score: {typeof region.score === 'number' ? region.score.toFixed(1) : region.score}</span>
                          <span className="text-sm text-gray-600">Similaridade: {typeof region.similarity === 'number' ? region.similarity.toFixed(1) : region.similarity}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {/* Resultados da Simulação - EMBAIXO DA ANÁLISE */}
          {simulationResult && (
            <>
              {/* Header da simulação */}
              <div className="bg-gradient-to-r from-green-500 to-teal-600 rounded-lg p-6 text-white shadow-lg">
                <h2 className="text-2xl font-bold mb-2">
                  🔮 Simulação de Cenário Futuro
                </h2>
                <p className="text-green-100">
                  Projeção para {filters.businessType} em {filters.location}
                </p>
              </div>

              {/* Comparação de Scores */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Score Original */}
                <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                  <h4 className="text-sm font-medium text-gray-600 mb-2">Score Atual</h4>
                  <div className="text-4xl font-bold text-gray-800">
                    {simulationResult.original_score.toFixed(1)}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Situação presente</p>
                </div>

                {/* Delta */}
                <div className={`bg-white rounded-lg border-2 p-6 shadow-sm ${
                  simulationResult.delta > 0 ? 'border-green-500' : 
                  simulationResult.delta < 0 ? 'border-red-500' : 'border-gray-300'
                }`}>
                  <h4 className="text-sm font-medium text-gray-600 mb-2">Variação</h4>
                  <div className={`text-4xl font-bold ${
                    simulationResult.delta > 0 ? 'text-green-600' : 
                    simulationResult.delta < 0 ? 'text-red-600' : 'text-gray-600'
                  }`}>
                    {simulationResult.delta > 0 ? '+' : ''}{simulationResult.delta.toFixed(1)}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Pontos de diferença</p>
                </div>

                {/* Score Projetado */}
                <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                  <h4 className="text-sm font-medium text-gray-600 mb-2">Score Projetado</h4>
                  <div className="text-4xl font-bold text-blue-600">
                    {simulationResult.projected_score.toFixed(1)}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Em 5 anos</p>
                </div>
              </div>

              {/* Explicação da simulação */}
              {simulationResult.explanation && (
                <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">
                    📈 Análise da Projeção
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    {simulationResult.explanation}
                  </p>
                </div>
              )}

              {/* Fatores-chave */}
              {simulationResult.key_factors && simulationResult.key_factors.length > 0 && (
                <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">
                    🎯 Fatores-Chave
                  </h3>
                  <ul className="space-y-2">
                    {simulationResult.key_factors.map((factor: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-2 text-gray-700">
                        <span className="text-blue-500 mt-1">•</span>
                        <span>{factor}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Projeções por ano */}
              {simulationResult.projections && simulationResult.projections.length > 0 && (
                <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">
                    📅 Projeção Anual
                  </h3>
                  <div className="space-y-2">
                    {simulationResult.projections.map((proj: any, idx: number) => (
                      <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                        <span className="font-medium text-gray-800">Ano {proj.year}</span>
                        <span className="text-lg font-bold text-blue-600">{proj.score.toFixed(1)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
