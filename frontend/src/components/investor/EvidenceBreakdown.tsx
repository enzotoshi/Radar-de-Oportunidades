'use client'

import { Bus, Database, Store } from 'lucide-react'
import type { GameResult } from '@/types'
import { formatCollectedAt } from '@/lib/formatters'
import DetailsSheet from '../DetailsSheet'

const rows = [
  { key: 'competition_component' as const, label: 'Concorrência mapeada', max: 400, icon: Store, tone: 'action' },
  { key: 'infrastructure_component' as const, label: 'Infraestrutura mapeada', max: 300, icon: Database, tone: 'warning' },
  { key: 'mobility_component' as const, label: 'Mobilidade mapeada', max: 300, icon: Bus, tone: 'data' },
]

export default function EvidenceBreakdown({ result }: { result: GameResult }) {
  return <section className="evidence-breakdown" aria-label="Composição da pontuação">
    <header><span className="section-kicker">Evidências ponderadas</span><h2>O que compõe o resultado</h2></header>
    <div className="evidence-meters">{rows.map(({ key, label, max, icon: Icon, tone }) => {
      const value = result[key]
      return <div className="evidence-meter" key={key}><div><span><Icon size={17} aria-hidden="true" />{label}</span><strong>{value}<small>/{max}</small></strong></div><div className="evidence-track" role="meter" aria-label={label} aria-valuenow={value} aria-valuemin={0} aria-valuemax={max}><span className={`evidence-fill evidence-fill--${tone}`} style={{ transform: `scaleX(${value / max})` }} /></div></div>
    })}</div>
    <div className="evidence-feedback"><h3>Leitura responsável</h3><p>{result.feedback}</p>{result.tips.length > 0 && <ul>{result.tips.map(tip => <li key={tip}>{tip}</li>)}</ul>}</div>
    <DetailsSheet title="Metodologia da pontuação"><p>{result.methodology}</p><p>Os componentes são derivados da análise territorial selecionada e mantêm as limitações das fontes originais.</p></DetailsSheet>
    <small>Dados-base coletados em {formatCollectedAt(result.source_analysis_at)}</small>
  </section>
}
