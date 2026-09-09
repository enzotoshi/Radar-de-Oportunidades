'use client'

import { useEffect, useRef, useState } from 'react'
import { Loader2, MapPin } from 'lucide-react'
import { useReducedMotion } from '@/lib/useReducedMotion'
import type { Map as LeafletMap, Marker } from 'leaflet'

interface Props {
  center?: [number, number]
  zoom?: number
  markers?: Array<{ position: [number, number]; title: string; kind?: 'analysis' | 'business'; icon?: string }>
}

// One shared load also handles React Strict Mode mounting twice in development.
let leafletLoad: Promise<typeof import('leaflet')> | null = null
function loadLeaflet() {
  if (!leafletLoad) {
    leafletLoad = import('leaflet').catch((error) => {
      leafletLoad = null
      throw error
    })
  }
  return leafletLoad
}

export default function OpenStreetMap({
  center = [-23.5505, -46.6333],
  zoom = 12,
  markers = [],
}: Props) {
  const reducedMotion = useReducedMotion()
  const mapRef = useRef<HTMLDivElement>(null)
  const initialViewRef = useRef({ center, zoom })
  const mapInstanceRef = useRef<LeafletMap | null>(null)
  const markersRef = useRef<Marker[]>([])
  const leafletRef = useRef<typeof import('leaflet') | null>(null)
  const [ready, setReady] = useState(false)
  const [error, setError] = useState(false)
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    let disposed = false
    let resizeObserver: ResizeObserver | undefined
    setError(false)
    setReady(false)
    loadLeaflet()
      .then((L) => {
        if (disposed || !mapRef.current) return
        leafletRef.current = L
        const map = L.map(mapRef.current).setView(initialViewRef.current.center, initialViewRef.current.zoom)
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution:
            '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
          maxZoom: 19,
        }).addTo(map)
        mapInstanceRef.current = map
        resizeObserver = new ResizeObserver(() => map.invalidateSize())
        resizeObserver.observe(mapRef.current)
        setReady(true)
      })
      .catch(() => {
        if (!disposed) setError(true)
      })
    return () => {
      disposed = true
      resizeObserver?.disconnect()
      mapInstanceRef.current?.remove()
      mapInstanceRef.current = null
      markersRef.current = []
    }
  }, [attempt])

  useEffect(() => {
    if (ready && mapInstanceRef.current)
      mapInstanceRef.current.setView(center, zoom, { animate: !reducedMotion })
  }, [ready, center, zoom, reducedMotion])

  useEffect(() => {
    const map = mapInstanceRef.current
    const L = leafletRef.current
    if (!ready || !map || !L) return
    markersRef.current.forEach((marker) => marker.remove())
    markersRef.current = markers.map(
      ({ position, title, kind = 'analysis', icon }) => {
        const dot = document.createElement('div')
        dot.className = `map-marker map-marker--${kind}`
        if (kind === 'business') {
          dot.textContent = icon || ''
          dot.setAttribute('aria-hidden', 'true')
        }
        const isBusiness = kind === 'business'
        const markerIcon = L.divIcon({
          className: 'custom-marker',
          html: dot,
          iconSize: isBusiness ? [32, 32] : [24, 24],
          iconAnchor: isBusiness ? [16, 28] : [12, 12],
        })
        const popup = document.createElement('span')
        popup.textContent = title
        return L.marker(position, { icon: markerIcon, title })
          .addTo(map)
          .bindPopup(popup)
      }
    )
  }, [ready, markers])

  return (
    <div className="relative w-full h-full">
      <div
        ref={mapRef}
        className="w-full h-full"
        aria-label="Mapa interativo da região"
      />
      {!ready && (
        <div
          className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-surface-card text-slate-300 p-6 text-center"
          role="status"
        >
          {error ? (
            <>
              <MapPin size={26} className="text-accent" />
              <p className="text-sm">Não foi possível carregar o mapa.</p>
              <p className="text-xs text-slate-400">
                Verifique sua conexão e tente novamente.
              </p>
              <button
                className="secondary-button"
                onClick={() => setAttempt((value) => value + 1)}
              >
                Tentar novamente
              </button>
            </>
          ) : (
            <>
              <Loader2 size={24} className="animate-spin text-accent" />
              <p className="text-sm">
                Carregando mapa...
              </p>
            </>
          )}
        </div>
      )}
    </div>
  )
}
