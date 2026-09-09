'use client'

import { useEffect, useState } from 'react'
import { Building2, CircleDollarSign, Database } from 'lucide-react'
import { getApiError, getBusinesses } from '@/lib/api'
import type { AddressSuggestion, Business } from '@/types'
import AddressCombobox from './AddressCombobox'
import Button from '../shared/Button'
import InlineAlert from '../shared/InlineAlert'
import VoiceInput from '../VoiceInput'

interface OpportunityQueryProps {
  active: boolean
  address: string
  selectedLocation: AddressSuggestion | null
  selectedBusiness: string
  budget: number
  analyzing: boolean
  error: string | null
  onAddressChange: (value: string) => void
  onLocationSelect: (value: AddressSuggestion) => void
  onBusinessChange: (value: string) => void
  onBudgetChange: (value: number) => void
  onAnalyze: () => void
  onError: (message: string | null) => void
}

export default function OpportunityQuery(props: OpportunityQueryProps) {
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [loadingBusinesses, setLoadingBusinesses] = useState(true)

  useEffect(() => {
    getBusinesses().then(setBusinesses).catch(reason => props.onError(getApiError(reason, 'Não foi possível carregar os tipos de negócio.'))).finally(() => setLoadingBusinesses(false))
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return <section className="atlas-query" aria-label="Configurar análise" aria-busy={props.analyzing}>
    <header className="query-header"><span className="section-kicker"><Database size={15} aria-hidden="true" />Nova consulta</span><h2>Onde está a próxima oportunidade?</h2><p>Combine território, categoria e investimento para consultar dados públicos.</p></header>
    <div className="query-fields">
      <AddressCombobox value={props.address} selected={props.selectedLocation} onValueChange={props.onAddressChange} onSelect={props.onLocationSelect} onError={props.onError} />
      <div>
        <label htmlFor="analysis-business" className="field-label"><Building2 size={16} aria-hidden="true" />Tipo de negócio</label>
        <select id="analysis-business" className="field-control" value={props.selectedBusiness} onChange={event => props.onBusinessChange(event.target.value)} disabled={loadingBusinesses || !businesses.length}>
          <option value="">{loadingBusinesses ? 'Carregando catálogo...' : 'Selecione um negócio'}</option>
          {businesses.map(business => <option key={business.id} value={business.id}>{business.name}</option>)}
        </select>
      </div>
      <div>
        <label htmlFor="analysis-budget" className="field-label"><CircleDollarSign size={16} aria-hidden="true" />Investimento disponível</label>
        <div className="money-control"><span aria-hidden="true">R$</span><input id="analysis-budget" className="field-control" type="number" min="0" step="1000" value={props.budget} onChange={event => props.onBudgetChange(Number(event.target.value))} /></div>
      </div>
      <VoiceInput active={props.active} onResult={(_transcript, entities) => {
        if (entities.location) props.onAddressChange(entities.location)
        if (entities.business_type) props.onBusinessChange(entities.business_type)
        if (entities.budget) props.onBudgetChange(Number(entities.budget))
      }} />
      {props.error && <InlineAlert tone="error" role="alert">{props.error}</InlineAlert>}
    </div>
    <footer className="query-action"><Button type="button" busy={props.analyzing} onClick={props.onAnalyze}>{props.analyzing ? 'Analisando fontes...' : 'Analisar dados reais'}</Button><p>Sem dados fictícios: indisponibilidades são mostradas explicitamente.</p></footer>
  </section>
}
