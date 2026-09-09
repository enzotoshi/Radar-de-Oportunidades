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
  const abortRef = useRef<AbortController | null>(null)
  const resultsRef = useRef<AddressSuggestion[]>([])
  const resultsQueryRef = useRef('')
  const id = useId()
  const listId = `${id}-results`
  const helpId = `${id}-help`
  const statusId = `${id}-status`

  useEffect(() => {
    const dismiss = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setResults([])
    }
    document.addEventListener('pointerdown', dismiss)
    return () => {
      document.removeEventListener('pointerdown', dismiss)
      abortRef.current?.abort()
    }
  }, [])

  const updateResults = (next: AddressSuggestion[], query = '') => {
    resultsRef.current = next
    resultsQueryRef.current = query
    setResults(next)
  }

  const choose = (location: AddressSuggestion) => {
    updateResults([])
    setActiveOption(-1)
    onSelect(location)
    requestAnimationFrame(() => inputRef.current?.focus())
  }

  const search = async (query: string, selectFirst = false) => {
    const cleaned = query.trim()
    if (cleaned.length < 3) {
      onError('Digite ao menos três caracteres para buscar uma localização.')
      return
    }
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller
    const request = ++version.current
    setLoading(true)
    updateResults([])
    setActiveOption(-1)
    onError(null)
    try {
      const next = await searchAddress(cleaned, controller.signal, !selectFirst)
      if (request !== version.current) return
      if (selectFirst && next[0]) choose(next[0])
      else updateResults(next, cleaned)
      if (!next.length) onError('Nenhuma localização foi encontrada. Inclua cidade e estado.')
    } catch (reason) {
      const canceled = (reason as { code?: string })?.code === 'ERR_CANCELED'
      if (!canceled && request === version.current) onError(getApiError(reason, 'A geocodificação está indisponível. Tente novamente.'))
    } finally {
      if (request === version.current) setLoading(false)
    }
  }

  useEffect(() => {
    const cleaned = value.trim()
    if (selected?.display_name === value || cleaned.length < 3) return
    const timer = window.setTimeout(() => void search(cleaned), 350)
    return () => window.clearTimeout(timer)
    // Search intentionally follows the input value; callback props do not restart the debounce.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, selected?.display_name])

  const confirmSearch = () => {
    const cleaned = value.trim()
    if (resultsQueryRef.current === cleaned && resultsRef.current[0]) {
      choose(resultsRef.current[0])
      return
    }
    void search(cleaned, true)
  }

  return <div className="address-combobox" ref={rootRef}>
    <label htmlFor={`${id}-input`} className="field-label">Localização</label>
    <div className="address-control">
      <input
        ref={inputRef}
        id={`${id}-input`}
        className="field-control"
        value={value}
        onChange={event => {
          version.current += 1
          abortRef.current?.abort()
          setLoading(false)
          updateResults([])
          setActiveOption(-1)
          onValueChange(event.target.value)
        }}
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
            else if (!loading) confirmSearch()
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
      <IconButton type="button" label="Buscar endereço e usar a primeira sugestão" onClick={confirmSearch}>
        {loading ? <Loader2 className="button__spinner" size={18} aria-hidden="true" /> : <Search size={18} aria-hidden="true" />}
      </IconButton>
    </div>
    <p id={helpId} className="field-help">Sugestões via Photon/OSM; confirmação via Nominatim.</p>
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
