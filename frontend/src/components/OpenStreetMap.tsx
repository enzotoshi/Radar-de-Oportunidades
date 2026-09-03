'use client'

import { useEffect, useRef, useState } from 'react'
import { Loader2, MapPin } from 'lucide-react'

interface Props {
  center?: [number, number]
  zoom?: number
  markers?: Array<{ position: [number, number]; title: string; color?: string }>
}

// One shared load also handles React Strict Mode mounting twice in development.
let leafletLoad: Promise<any> | null = null
function loadLeaflet(): Promise<any> {
  const leafletWindow = window as Window & { L?: any }
  if (leafletWindow.L) return Promise.resolve(leafletWindow.L)
  if (!leafletLoad) {
    leafletLoad = new Promise((resolve, reject) => {
      const script = document.createElement('script')
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
      script.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo='
      script.crossOrigin = ''
      script.onload = () => resolve(leafletWindow.L)
      script.onerror = () => {
        script.remove()
        leafletLoad = null
        reject(new Error('Mapa indisponível'))
      }
      document.head.appendChild(script)
    })
  }
  return leafletLoad
}

export default function OpenStreetMap({
  center = [-23.5505, -46.6333],
  zoom = 12,
  markers = [],
}: Props) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const markersRef = useRef<any[]>([])
  const leafletRef = useRef<any>(null)
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
        const map = L.map(mapRef.current).setView([-23.5505, -46.6333], 12)
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
      mapInstanceRef.current.setView(center, zoom)
  }, [ready, center, zoom])

  useEffect(() => {
    const map = mapInstanceRef.current
    const L = leafletRef.current
    if (!ready || !map || !L) return
    markersRef.current.forEach((marker) => marker.remove())
    markersRef.current = markers.map(
      ({ position, title, color = '#73e2b4' }) => {
        const dot = document.createElement('div')
        Object.assign(dot.style, {
          backgroundColor: color,
          width: '24px',
          height: '24px',
          borderRadius: '50%',
          border: '3px solid white',
          boxShadow: '0 0 0 7px #73e2b430, 0 2px 8px #0003',
        })
        const markerIcon = L.divIcon({
          className: 'custom-marker',
          html: dot,
          iconSize: [24, 24],
          iconAnchor: [12, 12],
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
                Preparando seu território de possibilidades...
              </p>
            </>
          )}
        </div>
      )}
    </div>
  )
}
