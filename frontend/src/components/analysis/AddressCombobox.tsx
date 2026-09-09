'use client'

import { useEffect, useId, useRef, useState } from 'react'
import { Check, Loader2, MapPin, Search } from 'lucide-react'
import { getApiError, searchAddress } from '@/lib/api'
import type { AddressSuggestion } from '@/types'
import IconButton from '../shared/IconButton'

interface AddressComboboxProps {
  value: string
  selected: AddressSuggestion | null
  onValueChange: (value: string) => void
  onSelect: (location: AddressSuggestion) => void
  onError: (message: string | null) => void
}

export default function AddressCombobox({ value, selected, onValueChange, onSelect, onError }: AddressComboboxProps) {
  const [results, setResults] = useState<AddressSuggestion[]>([])
  const [loading, setLoading] = useState(false)
  const [activeOption, setActiveOption] = useState(-1)
  const rootRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const version = useRef(0)
  const id = useId()
  const listId = `${id}-results`
  const helpId = `${id}-help`
  const statusId = `${id}-status`

  useEffect(() => {
    const dismiss = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setResults([])
    }
    document.addEventListener('pointerdown', dismiss)
    return () => document.removeEventListener('pointerdown', dismiss)
  }, [])

  const search = async () => {
    if (value.trim().length < 3) {
      onError('Digite ao menos três caracteres para buscar uma localização.')
      return
    }
    const request = ++version.current
    setLoading(true)
    setResults([])
    setActiveOption(-1)
    onError(null)
    try {
      const next = await searchAddress(value)
      if (request !== version.current) return
      setResults(next)
      if (!next.length) onError('Nenhuma localização foi encontrada. Inclua cidade e estado.')
    } catch (reason) {
      if (request === version.current) onError(getApiError(reason, 'A geocodificação está indisponível. Tente novamente.'))
    } finally {
      if (request === version.current) setLoading(false)
    }
  }

  const choose = (location: AddressSuggestion) => {
    setResults([])
    setActiveOption(-1)
    onSelect(location)
    requestAnimationFrame(() => inputRef.current?.focus())
  }

  return <div className="address-combobox" ref={rootRef}>
    <label htmlFor={`${id}-input`} className="field-label">Localização</label>
    <div className="address-control">
      <input
        ref={inputRef}
        id={`${id}-input`}
        className="field-control"
        value={value}
        onChange={event => { version.current += 1; setResults([]); onValueChange(event.target.value) }}
        onKeyDown={event => {
          if (event.key === 'Escape') { setResults([]); setActiveOption(-1) }
          if ((event.key === 'ArrowDown' || event.key === 'ArrowUp') && results.length) {
            event.preventDefault()
            const next = event.key === 'ArrowDown' ? (activeOption + 1) % results.length : (activeOption <= 0 ? results.length - 1 : activeOption - 1)
            setActiveOption(next)
            document.getElementById(`${id}-option-${next}`)?.scrollIntoView({ block: 'nearest' })
          }
          if (event.key === 'Enter') {
            event.preventDefault()
            if (activeOption >= 0 && results[activeOption]) choose(results[activeOption])
            else if (!loading) void search()
          }
        }}
        role="combobox"
        aria-expanded={results.length > 0}
        aria-controls={listId}
        aria-activedescendant={activeOption >= 0 ? `${id}-option-${activeOption}` : undefined}
        aria-autocomplete="list"
        aria-describedby={`${helpId} ${statusId}`}
        aria-invalid={!selected && value.trim().length > 0 ? undefined : false}
        placeholder="Rua, número, cidade e estado"
        autoComplete="off"
      />
      <IconButton type="button" label="Buscar endereço" onClick={() => void search()} disabled={loading}>
        {loading ? <Loader2 className="button__spinner" size={18} aria-hidden="true" /> : <Search size={18} aria-hidden="true" />}
      </IconButton>
    </div>
    <p id={helpId} className="field-help">Busca via Nominatim. Selecione um resultado verificado.</p>
    <p id={statusId} className="sr-only" aria-live="polite">{loading ? 'Buscando endereços' : results.length ? `${results.length} resultados encontrados` : ''}</p>
    {results.length > 0 && <div id={listId} role="listbox" className="address-suggestions" aria-label="Resultados de localização">
      {results.map((location, index) => <button
        id={`${id}-option-${index}`}
        key={`${location.place_id}-${location.lat}-${location.lng}`}
        type="button"
        role="option"
        aria-selected={activeOption === index}
        className="suggestion-item"
        onMouseEnter={() => setActiveOption(index)}
        onClick={() => choose(location)}
      ><MapPin size={17} aria-hidden="true" /><span>{location.display_name}<small>{location.municipality ? `${location.municipality.name} · IBGE ${location.municipality.ibge_code}` : 'Município não identificado pelo IBGE'}</small></span></button>)}
    </div>}
    {selected && <p className="selection-confirmed"><Check size={15} aria-hidden="true" /><span>Local verificado{selected.municipality ? ` · ${selected.municipality.name}` : ''}</span></p>}
  </div>
}
