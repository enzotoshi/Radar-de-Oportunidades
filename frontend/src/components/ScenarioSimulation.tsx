'use client'

import { useEffect, useRef, useState } from 'react'
import { Minus, TrendingDown, TrendingUp } from 'lucide-react'
import { getApiError, simulateScenario } from '@/lib/api'
import { formatCollectedAt } from '@/lib/formatters'
import type { AnalysisResult, SimulationResult } from '@/types'
import AnalysisRequired from './AnalysisRequired'
import DetailsSheet from './DetailsSheet'
import ScenarioControls from './simulation/ScenarioControls'
import ProjectionChart from './simulation/ProjectionChart'

interface Props { analysisResult: AnalysisResult | null; businessType: string; onGoToMap: () => void }

export default function ScenarioSimulation({ analysisResult, businessType, onGoToMap }: Props) {
  const [populationGrowth, setPopulationGrowth] = useState(0)
  const [incomeGrowth, setIncomeGrowth] = useState(0)
  const [newCompetitors, setNewCompetitors] = useState(0)
  const [result, setResult] = useState<SimulationResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const requestVersion = useRef(0)

  useEffect(() => { requestVersion.current += 1; setLoading(false); setResult(null); setError(null) }, [analysisResult, businessType])

  const simulate = async () => {
    if (!analysisResult || !businessType) return
    const version = ++requestVersion.current
    setLoading(true); setError(null); setResult(null)
    try {
      const response = await simulateScenario({ address: analysisResult.location.address, business_type: businessType, lat: analysisResult.location.lat, lng: analysisResult.location.lng, population_growth: populationGrowth, income_growth: incomeGrowth, new_competitors: newCompetitors })
      if (version === requestVersion.current) setResult(response)
    } catch (reason) {
      if (version === requestVersion.current) setError(getApiError(reason, 'Não foi possível calcular a projeção porque os dados-base estão indisponíveis.'))
    } finally { if (version === requestVersion.current) setLoading(false) }
  }

  const DeltaIcon = !result ? Minus : result.delta > 0 ? TrendingUp : result.delta < 0 ? TrendingDown : Minus

  return <div className="domain-page simulation-page">
    <header className="domain-heading"><span className="section-kicker">Simulação explícita</span><h1>Laboratório de cenários</h1><p>Parta da consulta real e teste hipóteses sem confundi-las com previsões.</p></header>
    {!analysisResult ? <AnalysisRequired areaLabel="Laboratório de cenários" title="Faça primeiro uma análise real." description="A simulação precisa de uma localização geocodificada e de dados observados; não existe cenário local fictício de reserva." onGoToMap={onGoToMap} /> :
      <div className="scenario-lab">
        <div className="scenario-context"><div><span className="section-kicker">Território selecionado</span><strong>{analysisResult.location.municipality?.name || 'Território consultado'}</strong><p>{analysisResult.location.address}</p></div><div><span>Índice observado</span><strong>{analysisResult.opportunity_score.toFixed(1)}<small>/100</small></strong><p>Coleta: {formatCollectedAt(analysisResult.collected_at)}</p></div></div>
        <ScenarioControls populationGrowth={populationGrowth} incomeGrowth={incomeGrowth} newCompetitors={newCompetitors} onPopulationGrowth={setPopulationGrowth} onIncomeGrowth={setIncomeGrowth} onNewCompetitors={setNewCompetitors} loading={loading} error={error} onSimulate={() => void simulate()} />
        <main className="scenario-stage">
          {result ? <>
            <section className="projection-summary" aria-label="Resumo da projeção"><span className="status-badge status-badge--warning">Projeção · não é previsão</span><div className="projection-numbers"><div><span>Observado</span><strong>{result.original_score.toFixed(1)}</strong></div><div className="projected-number"><span>Projeção em 5 anos</span><strong>{result.projected_score.toFixed(1)}</strong></div><div><span>Variação projetada</span><strong><DeltaIcon size={18} aria-hidden="true" />{result.delta > 0 ? '+' : ''}{result.delta.toFixed(1)}</strong></div></div></section>
            <ProjectionChart result={result} currentYear={new Date().getFullYear()} />
            <section className="projection-reading"><h3>Premissas e metodologia</h3><p>{result.explanation}</p><ul>{result.key_factors.map(factor => <li key={factor}>{factor}</li>)}</ul><DetailsSheet title="Premissas completas e metodologia"><p>{result.methodology}</p><dl className="assumption-list">{Object.entries(result.assumptions).map(([name, value]) => <div key={name}><dt>{name}</dt><dd>{value}</dd></div>)}</dl></DetailsSheet><small>Dados-base coletados em {formatCollectedAt(result.source_analysis_at)}</small></section>
          </> : <div className="scenario-awaiting"><span className="section-kicker">Projeção do sistema</span><h2>Defina suas hipóteses.</h2><p>Nenhum resultado será fabricado se as fontes reais estiverem indisponíveis.</p><div className="baseline-reading"><span>Índice observado</span><strong>{analysisResult.opportunity_score.toFixed(1)}<small>/100</small></strong><span>Projeção ainda não calculada</span></div></div>}
        </main>
      </div>}
  </div>
}
