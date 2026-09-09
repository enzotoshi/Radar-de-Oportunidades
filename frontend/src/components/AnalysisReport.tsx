'use client'

import { ArrowUpRight, Database, X, AlertTriangle } from 'lucide-react'
import type { AnalysisResult, MetricDetail } from '@/types'
import DetailsSheet from './DetailsSheet'

function formatMetric(metric: MetricDetail): string {
  if (metric.value === null || metric.value === undefined || metric.value === '') return 'Dado indisponível'
  if (metric.unit === 'BRL' && typeof metric.value === 'number') return metric.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })
  const value = typeof metric.value === 'number' ? metric.value.toLocaleString('pt-BR', { maximumFractionDigits: 2 }) : metric.value
  return metric.unit ? value + ' ' + metric.unit : value
}
const kindLabels: Record<MetricDetail['kind'], string> = { real: 'Dado observado', estimated: 'Estimativa', calculated: 'Cálculo do sistema' }

export default function AnalysisReport({ result, onClear, onGoToInvestor }: { result: AnalysisResult; onClear: () => void; onGoToInvestor: () => void }) {
  return (
    <section className="result-panel" aria-label="Resultado da análise">
      <div className="report-heading"><span className="eyebrow">LEITURA DO TERRITÓRIO</span><button className="icon-button" aria-label="Limpar resultado da análise" title="Limpar resultado da análise" onClick={onClear}><X size={18} /></button></div>
      <div className="report-score"><span>{result.opportunity_score.toFixed(1)}</span><span>/100</span></div>
      <p className="report-classification">{result.classification}</p>
      <p className="field-help">{result.score_label}</p>
      <div className="report-address"><Database size={17} /><span>{result.location.address}</span></div>
      <div className="metrics-grid">
        {Object.entries(result.metrics).map(([key, metric]) => <div key={key} className="metric-item">
          <p>{metric.label}</p><strong>{formatMetric(metric)}</strong><span className={'data-kind kind-' + metric.kind}>{kindLabels[metric.kind]}</span>
          <small>{metric.source}{metric.reference ? ' · ' + metric.reference : ''}</small>
        </div>)}
      </div>
      <div className="report-interpretation"><h3>Como interpretar</h3><p>{result.explanation}</p><p><strong>{result.recommendation}</strong></p></div>
      <DetailsSheet title="Fontes e metodologia">
        <h3>Metodologia própria</h3><p>{result.methodology.formula}</p><p>Não é indicador oficial nem probabilidade de sucesso.</p>
        <div className="source-list">{result.sources.map(source => <a key={source.name} href={source.url} target="_blank" rel="noreferrer"><span><strong>{source.name}</strong><small>{source.status}{source.reference ? ' · ref. ' + source.reference : ''}{source.license ? ' · ' + source.license : ''}</small></span><ArrowUpRight size={18} /></a>)}</div>
        <p>Coleta: {new Date(result.collected_at).toLocaleString('pt-BR')}</p>
      </DetailsSheet>
      <div className="report-warnings">{result.warnings.map(warning => <p key={warning}><AlertTriangle size={16} /><span>{warning}</span></p>)}</div>
      <button type="button" className="primary-button w-full" onClick={onGoToInvestor}>Usar esta análise no modo investidor<ArrowUpRight size={17} /></button>
    </section>
  )
}
