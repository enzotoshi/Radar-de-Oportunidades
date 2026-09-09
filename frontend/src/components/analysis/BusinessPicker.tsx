'use client'

import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { Check, ChevronDown, Search } from 'lucide-react'
import type { Business } from '@/types'

const CATEGORY_ORDER = [
  'Alimentação e bebidas',
  'Saúde e bem-estar',
  'Varejo',
  'Serviços',
  'Educação',
  'Negócios e outros',
]

function normalizeSearch(value: string) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim()
}

interface Props {
  businesses: Business[]
  loading: boolean
  value: string
  onChange: (value: string) => void
}

export default function BusinessPicker({ businesses, loading, value, onChange }: Props) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const rootRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)
  const listId = `${useId()}-businesses`
  const selected = businesses.find(business => business.id === value)
  const normalizedQuery = normalizeSearch(query)
  const grouped = useMemo(() => CATEGORY_ORDER.map(category => ({
    category,
    items: businesses.filter(business => business.sector === category && (
      !normalizedQuery || normalizeSearch(`${business.name} ${business.sector}`).includes(normalizedQuery)
    )),
  })).filter(group => group.items.length), [businesses, normalizedQuery])

  useEffect(() => {
    const dismiss = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('pointerdown', dismiss)
    return () => document.removeEventListener('pointerdown', dismiss)
  }, [])

  useEffect(() => {
    if (open) requestAnimationFrame(() => searchRef.current?.focus())
    else setQuery('')
  }, [open])

  return <div className="business-picker" ref={rootRef}>
    <div className="business-picker__heading">
      <h3>Qual tipo de negócio você pretende abrir?</h3>
      <p>Escolha um segmento para analisar os negócios e concorrentes reais da região.</p>
    </div>
    <button
      type="button"
      className="business-picker__trigger field-control"
      aria-expanded={open}
      aria-controls={listId}
      disabled={loading || !businesses.length}
      onClick={() => setOpen(current => !current)}
    >
      <span>{selected ? <><b aria-hidden="true">{selected.icon}</b>{selected.name}</> : loading ? 'Carregando catálogo...' : 'Selecione um negócio'}</span>
      <ChevronDown size={17} aria-hidden="true" />
    </button>
    {open && <div className="business-picker__panel" id={listId}>
      <label className="business-picker__search">
        <Search size={16} aria-hidden="true" />
        <span className="sr-only">Buscar tipo de negócio</span>
        <input
          ref={searchRef}
          type="search"
          value={query}
          placeholder="🔍 Buscar tipo de negócio..."
          onChange={event => setQuery(event.target.value)}
          onKeyDown={event => { if (event.key === 'Escape') setOpen(false) }}
        />
      </label>
      <div className="business-picker__options" role="listbox" aria-label="Tipos de negócio">
        {grouped.map(group => <section key={group.category} className="business-picker__group">
          <h4>{group.category}</h4>
          {group.items.map(business => <button
            key={business.id}
            type="button"
            role="option"
            aria-selected={business.id === value}
            onClick={() => { onChange(business.id); setOpen(false) }}
          >
            <span className="business-picker__icon" aria-hidden="true">{business.icon}</span>
            <span>{business.name}</span>
            {business.id === value && <Check size={16} aria-hidden="true" />}
          </button>)}
        </section>)}
        {!grouped.length && <p className="business-picker__empty">Nenhum tipo de negócio encontrado.</p>}
      </div>
    </div>}
  </div>
}
