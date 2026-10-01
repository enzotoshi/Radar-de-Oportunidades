'use client'

import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Briefcase, RotateCcw, Target } from 'lucide-react'
import { calculateGameScore, generateInvestorReport, getApiError } from '@/lib/api'
import { resultReveal } from '@/lib/motion'
import { useReducedMotion } from '@/lib/useReducedMotion'
import type { AnalysisResult, GameResult, InvestorReport } from '@/types'
import AnalysisRequired from './AnalysisRequired'
import Button from './shared/Button'
import InlineAlert from './shared/InlineAlert'
import ScoreOverview from './investor/ScoreOverview'
import EvidenceBreakdown from './investor/EvidenceBreakdown'

interface Props { analysisResult: AnalysisResult | null; businessType: string; onGoToMap: () => void }

export default function Gamification({ analysisResult, businessType, onGoToMap }: Props) {
  const reducedMotion = useReducedMotion()
  const [phase, setPhase] = useState<'intro' | 'result'>('intro')
  const [gameResult, setGameResult] = useState<GameResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [reportLoading, setReportLoading] = useState(false)
  const [report, setReport] = useState<InvestorReport | null>(null)
  const [reportError, setReportError] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const requestVersion = useRef(0)

  useEffect(() => { requestVersion.current += 1; setLoading(false); setReportLoading(false); setPhase('intro'); setGameResult(null); setReport(null); setError(null); setReportError(null) }, [analysisResult])

  const evaluate = async () => {
    if (!analysisResult || !businessType) return
    const version = ++requestVersion.current
    setLoading(true); setError(null)
    try {
      const response = await calculateGameScore(analysisResult.location, businessType)
      if (version === requestVersion.current) {
        setGameResult(response)
        setPhase('result')
        setReportLoading(true)
        void generateInvestorReport(analysisResult.location, businessType, analysisResult.budget, analysisResult.estimated_required_capital)
          .then(value => { if (version === requestVersion.current) setReport(value) })
          .catch(reason => { if (version === requestVersion.current) setReportError(getApiError(reason, 'O relatório por IA está indisponível agora.')) })
          .finally(() => { if (version === requestVersion.current) setReportLoading(false) })
      }
    } catch (reason) {
      if (version === requestVersion.current) setError(getApiError(reason, 'Não foi possível pontuar porque os dados observados estão indisponíveis.'))
    } finally { if (version === requestVersion.current) setLoading(false) }
  }

  return <div className="domain-page investor-page">
    <header className="domain-heading"><span className="section-kicker"><Briefcase size={15} aria-hidden="true" />Modo investidor educacional</span><h1>Quadro do investidor</h1><p>Transforme a análise selecionada em uma leitura de evidências — sem prometer retorno.</p></header>
    {!analysisResult ? <AnalysisRequired areaLabel="Quadro do investidor" title="O desafio começa com dados reais." description="Faça uma análise no mapa. O modo investidor não cria bairros, rendas, custos ou tendências de reserva." onGoToMap={onGoToMap} /> : phase === 'intro' ?
      <section className="investor-intro">
        <div className="investor-context"><span className="section-kicker">Análise selecionada</span><h2>{analysisResult.location.municipality?.name || 'Território consultado'}</h2><p>{analysisResult.location.address}</p><dl><div><dt>Índice-base</dt><dd>{analysisResult.opportunity_score.toFixed(1)}<small>/100</small></dd></div><div><dt>Categoria</dt><dd>{businessType}</dd></div></dl></div>
        <div className="investor-action"><Target size={32} aria-hidden="true" /><span className="section-kicker">Leitura comparável</span><h2>Calcule a composição educacional</h2><p>Concorrência, infraestrutura e mobilidade recebem pesos explícitos a partir da consulta atual.</p>{error && <InlineAlert tone="error" role="alert">{error}</InlineAlert>}<Button type="button" busy={loading} onClick={() => void evaluate()}>{loading ? 'Consultando...' : 'Calcular pontuação educacional'}</Button></div>
      </section> : gameResult && <motion.div className="investor-result" variants={resultReveal} initial={reducedMotion ? false : 'hidden'} animate="visible">
        <ScoreOverview result={gameResult} reducedMotion={reducedMotion} />
        <EvidenceBreakdown result={gameResult} />
        <section className="investor-ai-report" aria-live="polite"><span className="section-kicker">Relatório por IA</span><h2>Leitura do investimento</h2>{reportLoading ? <p>Gerando relatório com base nas evidências coletadas...</p> : report ? <><p className="investor-ai-report__content">{report.report}</p><small>Gerado por {report.model}; interprete junto às fontes e limitações exibidas.</small></> : <InlineAlert tone="warning">{reportError || 'Relatório por IA indisponível.'}</InlineAlert>}</section>
        <Button variant="secondary" onClick={() => { setPhase('intro'); setGameResult(null) }}><RotateCcw size={17} aria-hidden="true" />Reavaliar os mesmos dados</Button>
      </motion.div>}
  </div>
}
