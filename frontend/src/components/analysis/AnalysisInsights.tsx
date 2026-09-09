import { AlertTriangle, ArrowRight, Lightbulb, X } from 'lucide-react'
import type { AnalysisResult } from '@/types'
import Button from '../shared/Button'
import IconButton from '../shared/IconButton'
import InlineAlert from '../shared/InlineAlert'
import MetricSignal from './MetricSignal'
import ProvenanceDialog from './ProvenanceDialog'

const componentKeys = new Set(['competitors', 'competition_density', 'infrastructure', 'mobility'])

export default function AnalysisInsights({ result, onClear, onGoToInvestor }: { result: AnalysisResult; onClear: () => void; onGoToInvestor: () => void }) {
  const entries = Object.entries(result.metrics)
  const signals = entries.filter(([key]) => componentKeys.has(key.toLowerCase()))
  const context = entries.filter(([key]) => !componentKeys.has(key.toLowerCase()))
  const primary = signals.length ? signals : entries.slice(0, Math.min(4, entries.length))
  const secondary = signals.length ? context : entries.slice(Math.min(4, entries.length))

  return <aside className="analysis-insights result-panel" aria-label="Evidências da oportunidade">
    <header className="insights-header"><div><span className="section-kicker">Leitura do território</span><div className="score-lockup"><strong>{result.opportunity_score.toFixed(1)}</strong><span>/100</span></div></div><IconButton label="Limpar resultado da análise" onClick={onClear}><X size={18} aria-hidden="true" /></IconButton></header>
    <p className="insights-classification">{result.classification}</p><p className="insights-score-label">{result.score_label}</p>
    <InlineAlert tone="info"><Lightbulb size={18} aria-hidden="true" /><strong>Próximo passo recomendado</strong><p>{result.recommendation}</p></InlineAlert>
    <section className="insight-group" aria-labelledby="signals-title"><h3 id="signals-title">Sinais que formam o índice</h3><div className="metric-signal-list">{primary.map(([key, metric]) => <MetricSignal key={key} metricKey={key} metric={metric} emphasis="primary" />)}</div></section>
    {secondary.length > 0 && <section className="insight-group" aria-labelledby="context-title"><h3 id="context-title">Contexto do território</h3><div className="metric-signal-list">{secondary.map(([key, metric]) => <MetricSignal key={key} metricKey={key} metric={metric} />)}</div></section>}
    <section className="insight-reading"><h3>Como interpretar</h3><p>{result.explanation}</p></section>
    {result.warnings.length > 0 && <div className="insight-warnings">{result.warnings.map(warning => <p key={warning}><AlertTriangle size={16} aria-hidden="true" />{warning}</p>)}</div>}
    <ProvenanceDialog result={result} />
    <Button type="button" onClick={onGoToInvestor}>Levar ao modo investidor <ArrowRight size={17} aria-hidden="true" /></Button>
  </aside>
}
