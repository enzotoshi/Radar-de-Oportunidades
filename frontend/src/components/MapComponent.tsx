'use client'

import { useEffect, useMemo, useState } from 'react'
import dynamic from 'next/dynamic'
import type { AnalysisResult } from '@/types'

const OpenStreetMap = dynamic(() => import('./OpenStreetMap'), { ssr: false })

interface MapComponentProps {
  analysisResult: AnalysisResult | null
}

export default function MapComponent({ analysisResult }: MapComponentProps) {
  const [center, setCenter] = useState<[number, number]>([-14.2, -51.9])
  const [zoom, setZoom] = useState(4)

  useEffect(() => {
    if (analysisResult) {
      setCenter([analysisResult.location.lat, analysisResult.location.lng])
      setZoom(15)
    }
  }, [analysisResult])

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
        })),
      ]
    : [], [analysisResult])

  return (
    <div className="w-full h-full">
      <OpenStreetMap center={center} zoom={zoom} markers={markers} />
    </div>
  )
}
