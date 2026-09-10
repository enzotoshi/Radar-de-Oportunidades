'use client'

import { useEffect, useMemo, useState } from 'react'
import dynamic from 'next/dynamic'
import type { AnalysisResult } from '@/types'

const OpenStreetMap = dynamic(() => import('./OpenStreetMap'), { ssr: false })

interface MapComponentProps {
  analysisResult: AnalysisResult | null
  onMapClick?: (lat: number, lng: number) => void
  selectedLocation?: { lat: number; lng: number } | null
}

export default function MapComponent({ analysisResult, onMapClick, selectedLocation }: MapComponentProps) {
  const [center, setCenter] = useState<[number, number]>([-14.2, -51.9])
  const [zoom, setZoom] = useState(4)
  const selectedLat = selectedLocation?.lat
  const selectedLng = selectedLocation?.lng

  useEffect(() => {
    if (analysisResult) {
      setCenter([analysisResult.location.lat, analysisResult.location.lng])
      setZoom(15)
    }
  }, [analysisResult])

  useEffect(() => {
    if (selectedLat !== undefined && selectedLng !== undefined) {
      setCenter([selectedLat, selectedLng])
      setZoom(15)
    }
  }, [selectedLat, selectedLng])

  const markers = useMemo(() => analysisResult
    ? [
        {
          position: [analysisResult.location.lat, analysisResult.location.lng] as [number, number],
          title: 'Local analisado: ' + analysisResult.location.address,
          kind: 'analysis' as const,
        },
        ...analysisResult.business_markers.map((marker) => ({
          position: [marker.lat, marker.lng] as [number, number],
          title: marker.name + (marker.address ? ' — ' + marker.address : ''),
          kind: 'business' as const,
          icon: marker.icon,
        })),
      ]
    : [], [analysisResult])

  // Extrai o raio real da análise
  const analysisRadius = analysisResult?.radius_meters || 1500

  return (
    <div className="w-full h-full">
      <OpenStreetMap
        center={center}
        zoom={zoom}
        markers={markers}
        onMapClick={onMapClick}
        selectedLocation={selectedLocation}
        analysisRadius={analysisRadius}
      />
    </div>
  )
}
