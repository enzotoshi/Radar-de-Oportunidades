import type { MetricDetail } from '@/types'
import { formatMetric } from '@/lib/formatters'
import DataKindBadge from '../shared/DataKindBadge'

interface MetricSignalProps { metricKey: string; metric: MetricDetail; emphasis?: 'primary' | 'context' }

export default function MetricSignal({ metricKey, metric, emphasis = 'context' }: MetricSignalProps) {
  return <article className={`metric-signal metric-signal--${emphasis}`} data-metric-kind={metric.kind} data-metric-key={metricKey}>
    <div className="metric-signal__heading"><p>{metric.label}</p><DataKindBadge kind={metric.kind} /></div>
    <strong>{formatMetric(metric)}</strong>
    <p className="metric-signal__description">{metric.description}</p>
    <small>{metric.source}{metric.reference ? ` · ${metric.reference}` : ''}</small>
  </article>
}
