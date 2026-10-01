'use client'

import { Area, AreaChart, CartesianGrid, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { SimulationResult } from '@/types'

export default function ProjectionChart({ result, currentYear }: { result: SimulationResult; currentYear: number }) {
  const data = [{ year: currentYear, label: String(currentYear), score: result.original_score, type: 'Observado' }, ...result.projections.map(point => ({ ...point, type: 'Projetado' }))]
  return <section className="projection-chart" aria-label="Trajetória projetada">
    <div className="chart-heading"><div><span className="section-kicker">Trajetória calculada</span><h3>Índice ao longo de cinco anos</h3></div><div className="chart-legend" aria-label="Legenda"><span><i className="chart-key chart-key--observed" />Observado</span><span><i className="chart-key chart-key--projected" />Projetado</span></div></div>
    <div className="chart-canvas"><ResponsiveContainer width="100%" height={320}><AreaChart data={data} accessibilityLayer margin={{ top: 24, right: 16, left: -18, bottom: 8 }}>
      <CartesianGrid strokeDasharray="3 5" stroke="var(--color-border)" vertical={false} />
      <XAxis dataKey="label" tick={{ fill: 'var(--color-ink-muted)', fontSize: 12 }} axisLine={false} tickLine={false} tickMargin={14} />
      <YAxis domain={[0, 100]} tick={{ fill: 'var(--color-ink-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
      <Tooltip contentStyle={{ background: '#fff', border: '1px solid var(--color-border-strong)', borderRadius: 8, color: 'var(--color-ink)' }} formatter={(value: number) => [value.toLocaleString('pt-BR'), 'Índice']} />
      <ReferenceLine y={70} stroke="var(--color-action)" strokeDasharray="4 4" strokeOpacity={.55} label={{ value: 'Faixa 70', fill: 'var(--color-ink-muted)', fontSize: 11 }} />
      <Area type="monotone" dataKey="score" stroke="var(--color-action)" fill="var(--color-action-soft)" strokeWidth={3} isAnimationActive={false} dot={{ r: 4, fill: '#fff', strokeWidth: 2 }} activeDot={{ r: 6 }} />
    </AreaChart></ResponsiveContainer></div>
    <details className="chart-values"><summary>Valores da projeção</summary><table><caption className="sr-only">Índice observado e projeções por ano</caption><thead><tr><th scope="col">Ano</th><th scope="col">Natureza</th><th scope="col">Índice</th></tr></thead><tbody>{data.map(point => <tr key={point.year}><th scope="row">{point.label}</th><td>{point.type}</td><td>{point.score.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}</td></tr>)}</tbody></table></details>
  </section>
}
