'use client'

import Image from 'next/image'
import { ArrowRight, Database } from 'lucide-react'
import radarLogo from '../../public/logo-radar.png'
import Button from './shared/Button'
import StatusBadge from './shared/StatusBadge'

interface Props { areaLabel: string; title: string; description: string; onGoToMap: () => void }

export default function AnalysisRequired({ areaLabel, title, description, onGoToMap }: Props) {
  return <section className="analysis-required" aria-label={`${areaLabel} sem análise`}>
    <div className="required-visual"><div className="required-radar"><Image src={radarLogo} alt="" width={148} height={148} /></div><span>Brasil · fontes públicas</span></div>
    <div className="required-action"><span className="section-kicker"><Database size={16} aria-hidden="true" />Ponto de partida</span><h2>{title}</h2><p>{description}</p><Button type="button" onClick={onGoToMap}>Ir para o mapa <ArrowRight size={18} aria-hidden="true" /></Button><StatusBadge>Nenhuma análise selecionada</StatusBadge></div>
  </section>
}
