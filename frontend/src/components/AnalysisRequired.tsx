'use client'

import dynamic from 'next/dynamic'
import { ArrowUpRight, MapPin, Database } from 'lucide-react'

const MapComponent = dynamic(() => import('./MapComponent'), { ssr: false })

export default function AnalysisRequired({ title, description, onGoToMap }: { title: string; description: string; onGoToMap: () => void }) {
  return (
    <div className="analysis-required">
      <div className="required-map" aria-label="Território de referência"><MapComponent analysisResult={null} /><span className="required-map-label"><MapPin size={16} />Brasil</span></div>
      <section className="required-action">
        <span className="eyebrow"><Database size={16} />PONTO DE PARTIDA</span>
        <h2>{title}</h2><p>{description}</p>
        <button type="button" onClick={onGoToMap} className="primary-button">Ir para o mapa<ArrowUpRight size={18} /></button>
        <div className="required-status"><span className="status-dot" />Nenhuma análise selecionada</div>
      </section>
    </div>
  )
}
