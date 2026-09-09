'use client'

import { useId, type CSSProperties } from 'react'
import { Sparkles } from 'lucide-react'
import Button from '../shared/Button'
import InlineAlert from '../shared/InlineAlert'

interface Props {
  populationGrowth: number; incomeGrowth: number; newCompetitors: number
  onPopulationGrowth: (value: number) => void; onIncomeGrowth: (value: number) => void; onNewCompetitors: (value: number) => void
  loading: boolean; error: string | null; onSimulate: () => void
}

function Slider({ label, value, min, max, format, onChange }: { label: string; value: number; min: number; max: number; format: (value: number) => string; onChange: (value: number) => void }) {
  const id = useId()
  return <div className="scenario-slider"><div className="scenario-slider__label"><label htmlFor={id}>{label}</label><output htmlFor={id}>{format(value)}</output></div>
    <input id={id} type="range" min={min} max={max} step="1" value={value} onChange={event => onChange(Number(event.target.value))} aria-valuetext={format(value)} style={{ '--range-fill': `${((value - min) / (max - min)) * 100}%` } as CSSProperties} />
    <div className="scenario-slider__limits"><span>{format(min)}</span><span>{format(max)}</span></div>
  </div>
}

export default function ScenarioControls(props: Props) {
  const percentage = (value: number) => `${value > 0 ? '+' : ''}${value}%`
  return <section className="scenario-controls" aria-label="Hipóteses do cenário" aria-busy={props.loading}>
    <header><span className="section-kicker">Hipóteses para cinco anos</span><h2>O que pode mudar?</h2><p>Ajuste premissas explícitas. Elas não são previsões econômicas.</p></header>
    <div className="scenario-control-list">
      <Slider label="Variação populacional hipotética" value={props.populationGrowth} min={-20} max={50} format={percentage} onChange={props.onPopulationGrowth} />
      <Slider label="Variação de renda hipotética" value={props.incomeGrowth} min={-30} max={80} format={percentage} onChange={props.onIncomeGrowth} />
      <Slider label="Novos concorrentes hipotéticos" value={props.newCompetitors} min={0} max={20} format={value => `${value} novos`} onChange={props.onNewCompetitors} />
    </div>
    {props.error && <InlineAlert tone="error" role="alert">{props.error}</InlineAlert>}
    <Button type="button" busy={props.loading} onClick={props.onSimulate}><Sparkles size={17} aria-hidden="true" />{props.loading ? 'Calculando projeção...' : 'Gerar projeção do sistema'}</Button>
  </section>
}
