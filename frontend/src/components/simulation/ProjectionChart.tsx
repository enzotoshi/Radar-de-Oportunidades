'use client'

import { Area, AreaChart, CartesianGrid, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { SimulationResult } from '@/types'

export default function ProjectionChart({ result, currentYear }: { result: SimulationResult; currentYear: number }) {
  const data = [{ year: currentYear, label: String(currentYear), score: result.original_score, type: 'Observado' }, ...result.projections.map(point => ({ ...point, type: 'Projetado' }))]
  return <section className="projection-chart" aria-label="Trajetória projetada">
    <div className="chart-heading"><div><span className="section-kicker">Trajetória calculada</span><h3>Índice ao longo de cinco anos</h3></div><div className="chart-legend" aria-label="Legenda"><span><i className="chart-key chart-key--observed" />Observado</span><span><i className="chart-key chart-key--projected" />Projetado</span></div></div>
    <div className="chart-canvas"><ResponsiveContainer width="100%" height={320}><AreaChart data={data} accessibilityLayer margin={{ top: 24, right: 16, left: -18, bottom: 8 }}>
      <CartesianGrid strokeDasharray="3 5" stroke="#cad8d5" vertical={false} />
      <XAxis dataKey="label" tick={{ fill: '#50666a', fontSize: 12 }} axisLine={false} tickLine={false} tickMargin={14} />
      <YAxis domain={[0, 100]} tick={{ fill: '#50666a', fontSize: 12 }} axisLine={false} tickLine={false} />
      <Tooltip contentStyle={{ background: '#fff', border: '1px solid #9fb4b2', borderRadius: 8, color: '#102d32' }} formatter={(value: number) => [value.toLocaleString('pt-BR'), 'Índice']} />
      <ReferenceLine y={70} stroke="#087f78" strokeDasharray="4 4" strokeOpacity={.55} label={{ value: 'Faixa 70', fill: '#50666a', fontSize: 11 }} />
      <Area type="monotone" dataKey="score" stroke="#176b9a" fill="#dcecf5" strokeWidth={3} isAnimationActive={false} dot={{ r: 4, fill: '#fff', strokeWidth: 2 }} activeDot={{ r: 6 }} />
    </AreaChart></ResponsiveContainer></div>
    <details className="chart-values"><summary>Valores da projeção</summary><table><caption className="sr-only">Índice observado e projeções por ano</caption><thead><tr><th scope="col">Ano</th><th scope="col">Natureza</th><th scope="col">Índice</th></tr></thead><tbody>{data.map(point => <tr key={point.year}><th scope="row">{point.label}</th><td>{point.type}</td><td>{point.score.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}</td></tr>)}</tbody></table></details>
  </section>
}
