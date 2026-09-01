'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import type { Region, AnalysisResult, Hotspot } from '@/types'

// Importar OpenStreetMap dinamicamente
const OpenStreetMap = dynamic(() => import('./OpenStreetMap'), { ssr: false })

function scoreToColor(score: number): string {
  if (score >= 70) return '#00d4aa'
  if (score >= 40) return '#f59e0b'
  return '#ef4444'
}

function getRegionScore(region: Region, analysisResult: AnalysisResult | null): number {
  if (!analysisResult) {
    // Default score based on consumption trend
    return Math.round((region.consumption_trend / 10) * 70 + 15)
  }
  return analysisResult.opportunity_score
}

interface MapComponentProps {
  regions: Region[]
  selectedRegion: string
  onRegionSelect: (regionId: string) => void
  analysisResult: AnalysisResult | null
  hotspots?: Hotspot[]
  onMapClick?: (lat: number, lng: number) => void
}

export default function MapComponent({
  regions,
  selectedRegion,
  onRegionSelect,
  analysisResult,
  hotspots = [],
}: MapComponentProps) {
  const [center, setCenter] = useState<[number, number]>([-23.55, -46.63])
  const [zoom, setZoom] = useState(11)
  const [markers, setMarkers] = useState<Array<{ position: [number, number]; title: string; color: string }>>([])

  useEffect(() => {
    const newMarkers = regions.map((region) => {
      const score = analysisResult && selectedRegion === region.id
        ? analysisResult.opportunity_score
        : getRegionScore(region, null)
      
      const color = scoreToColor(score)
      
      return {
        position: [region.lat, region.lng] as [number, number],
        title: `${region.name} - Score: ${score.toFixed(0)}`,
        color: color,
      }
    })

    // Adicionar hotspots
    hotspots.forEach((hotspot) => {
      newMarkers.push({
        position: [hotspot.lat, hotspot.lng] as [number, number],
        title: `⭐ ${hotspot.name} - Score: ${hotspot.opportunity_score.toFixed(0)}`,
        color: scoreToColor(hotspot.opportunity_score),
      })
    })

    setMarkers(newMarkers)
  }, [regions, selectedRegion, analysisResult, hotspots])

  // Atualizar centro quando região for selecionada
  useEffect(() => {
    if (selectedRegion) {
      const region = regions.find((r) => r.id === selectedRegion)
      if (region) {
        setCenter([region.lat, region.lng])
        setZoom(14)
      }
    }
  }, [selectedRegion, regions])

  return (
    <div className="w-full h-full">
      <OpenStreetMap 
        center={center}
        zoom={zoom}
        markers={markers}
      />
    </div>
  )
}
