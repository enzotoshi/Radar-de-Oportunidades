'use client'

import { useEffect, useRef } from 'react'

interface Props {
  center?: [number, number]
  zoom?: number
  markers?: Array<{
    position: [number, number]
    title: string
    color?: string
  }>
}

export default function OpenStreetMap({ 
  center = [-23.5505, -46.6333], // São Paulo
  zoom = 12,
  markers = []
}: Props) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const markersRef = useRef<any[]>([])

  useEffect(() => {
    if (typeof window === 'undefined' || !mapRef.current) return

    // Carregar Leaflet dinamicamente
    const loadLeaflet = async () => {
      // @ts-ignore
      if (!window.L) {
        const script = document.createElement('script')
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
        script.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo='
        script.crossOrigin = ''
        
        await new Promise((resolve) => {
          script.onload = resolve
          document.head.appendChild(script)
        })
      }

      // @ts-ignore
      const L = window.L

      if (!mapInstanceRef.current && mapRef.current) {
        // Criar o mapa
        const map = L.map(mapRef.current).setView(center, zoom)

        // Adicionar tiles do OpenStreetMap (GRÁTIS!)
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
          maxZoom: 19,
        }).addTo(map)

        mapInstanceRef.current = map
      }

      // Atualizar centro e zoom
      if (mapInstanceRef.current) {
        mapInstanceRef.current.setView(center, zoom)
      }

      // Limpar markers antigos
      markersRef.current.forEach(marker => marker.remove())
      markersRef.current = []

      // Adicionar novos markers
      if (mapInstanceRef.current && markers.length > 0) {
        markers.forEach(({ position, title, color = 'blue' }) => {
          const markerIcon = L.divIcon({
            className: 'custom-marker',
            html: `<div style="background-color: ${color}; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.3);"></div>`,
            iconSize: [24, 24],
            iconAnchor: [12, 12],
          })

          const marker = L.marker(position, { icon: markerIcon })
            .addTo(mapInstanceRef.current)
            .bindPopup(title)
          
          markersRef.current.push(marker)
        })
      }
    }

    loadLeaflet()

    return () => {
      // Cleanup ao desmontar
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [center, zoom, markers])

  return (
    <div className="relative w-full h-full">
      <div 
        ref={mapRef} 
        className="w-full h-full rounded-xl overflow-hidden"
        style={{ minHeight: '400px' }}
      />
      <div className="absolute bottom-4 left-4 bg-black/80 text-white text-xs px-3 py-2 rounded-lg backdrop-blur-sm z-[1000]">
        🗺️ OpenStreetMap - 100% Gratuito
      </div>
    </div>
  )
}
