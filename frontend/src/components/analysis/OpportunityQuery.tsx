'use client'

import { useEffect, useState } from 'react'
import { CircleDollarSign, Database } from 'lucide-react'
import { getApiError, getBusinesses } from '@/lib/api'
import { formatBudgetInput } from '@/lib/formatters'
import type { AddressSuggestion, Business } from '@/types'
import AddressCombobox from './AddressCombobox'
import Button from '../shared/Button'
import InlineAlert from '../shared/InlineAlert'
import BusinessPicker from './BusinessPicker'

interface OpportunityQueryProps {
  address: string
  selectedLocation: AddressSuggestion | null
  selectedBusiness: string
  budget: string
  analyzing: boolean
  analysisStep: number
  resolvingLocation: boolean
  error: string | null
  onAddressChange: (value: string) => void
  onLocationSelect: (value: AddressSuggestion) => void
  onBusinessChange: (value: string) => void
  onBudgetChange: (value: string) => void
  onAnalyze: () => void
  onError: (message: string | null) => void
}

export default function OpportunityQuery(props: OpportunityQueryProps) {
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [loadingBusinesses, setLoadingBusinesses] = useState(true)

  useEffect(() => {
    getBusinesses().then(setBusinesses).catch(reason => props.onError(getApiError(reason, 'Não foi possível carregar os tipos de negócio.'))).finally(() => setLoadingBusinesses(false))
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return <section className="atlas-query" aria-label="Configurar análise" aria-busy={props.analyzing || props.resolvingLocation}>
    <header className="query-header"><span className="section-kicker"><Database size={15} aria-hidden="true" />Nova consulta</span><h2>Onde está a próxima oportunidade?</h2><p>Combine território, categoria e investimento para consultar dados públicos.</p></header>
    <div className="query-fields">
      <AddressCombobox value={props.address} selected={props.selectedLocation} onValueChange={props.onAddressChange} onSelect={props.onLocationSelect} onError={props.onError} />
      <BusinessPicker businesses={businesses} loading={loadingBusinesses} value={props.selectedBusiness} onChange={props.onBusinessChange} />
      <div>
        <label htmlFor="analysis-budget" className="field-label"><CircleDollarSign size={16} aria-hidden="true" />Orçamento informado por você</label>
        <div className="money-control"><span aria-hidden="true">R$</span><input id="analysis-budget" className="field-control" type="text" inputMode="numeric" autoComplete="off" maxLength={15} placeholder="Digite o valor..." value={props.budget} onChange={event => props.onBudgetChange(formatBudgetInput(event.target.value))} /></div>
      </div>
      {props.error && <InlineAlert tone="error" role="alert">{props.error}</InlineAlert>}
    </div>
    <footer className="query-action">
      <Button type="button" busy={props.analyzing || props.resolvingLocation} onClick={props.onAnalyze}>{props.resolvingLocation ? 'Buscando...' : props.analyzing ? 'Analisando fontes...' : 'Analisar dados reais'}</Button>
      {props.analyzing && <div className="analysis-progress" role="status" aria-live="polite">
        <div className="analysis-progress__message"><span className="analysis-progress__spark" aria-hidden="true">✦</span><span>{['Preparando a área de análise', 'Lendo o mapa ao redor do local', 'Cruzando contexto populacional e municipal', 'Calculando os sinais e o índice'][props.analysisStep]}</span></div>
        <div className="analysis-progress__track" aria-hidden="true"><i /></div>
        <div className="analysis-progress__steps" aria-hidden="true">
          {[
            ['Área consultada', 'Raio de 1,5 km no ponto selecionado'],
            ['OpenStreetMap', 'Concorrentes, infraestrutura e mobilidade'],
            ['WorldPop + IBGE', 'População da área e contexto municipal'],
            ['Leitura do Radar', 'Índice, evidências e limitações'],
          ].map(([label, detail], index) => <div key={label} data-state={index < props.analysisStep ? 'done' : index === props.analysisStep ? 'active' : 'pending'}><span>{index < props.analysisStep ? '✓' : '·'}</span><p><strong>{label}</strong><small>{detail}</small></p></div>)}
        </div>
        <p className="analysis-progress__note">As fontes são consultadas em paralelo para manter a análise completa.</p>
      </div>}
    </footer>
  </section>
}
