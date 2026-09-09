import type { MetricDetail } from '@/types'

export function formatMetric(metric: MetricDetail): string {
  if (metric.value === null || metric.value === undefined || metric.value === '') return 'Dado indisponível'
  if (metric.unit === 'BRL' && typeof metric.value === 'number') {
    return metric.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })
  }
  const value = typeof metric.value === 'number'
    ? metric.value.toLocaleString('pt-BR', { maximumFractionDigits: 2 })
    : metric.value
  return metric.unit ? `${value} ${metric.unit}` : String(value)
}

export function formatCollectedAt(value: string): string {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? 'Data indisponível' : date.toLocaleString('pt-BR')
}
