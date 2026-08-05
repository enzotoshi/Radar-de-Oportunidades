'use client'

import { useEffect } from 'react'
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet'
import type { Region, AnalysisResult } from '@/types'
import 'leaflet/dist/leaflet.css'

// Fix Leaflet default icon issue with Next.js
import L from 'leaflet'
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

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

interface FlyToProps {
  region: Region | null
}

function FlyTo({ region }: FlyToProps) {
  const map = useMap()
  useEffect(() => {
    if (region) {
      map.flyTo([region.lat, region.lng], 14, { duration: 1 })
    }
  }, [region, map])
  return null
}

interface MapComponentProps {
  regions: Region[]
  selectedRegion: string
  onRegionSelect: (regionId: string) => void
  analysisResult: AnalysisResult | null
}

export default function MapComponent({
  regions,
  selectedRegion,
  onRegionSelect,
  analysisResult,
}: MapComponentProps) {
  const selectedRegionData = regions.find((r) => r.id === selectedRegion) ?? null

  return (
    <MapContainer
      center={[-23.55, -46.63]}
      zoom={11}
      style={{ height: '100%', width: '100%', borderRadius: '12px' }}
      zoomControl={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <FlyTo region={selectedRegionData} />

      {regions.map((region) => {
        const score =
          analysisResult && selectedRegion === region.id
            ? analysisResult.opportunity_score
            : getRegionScore(region, null)

        const isSelected = region.id === selectedRegion
        const color = scoreToColor(score)

        return (
          <CircleMarker
            key={region.id}
            center={[region.lat, region.lng]}
            radius={isSelected ? 22 : 16}
            pathOptions={{
              color: isSelected ? '#ffffff' : color,
              weight: isSelected ? 3 : 1.5,
              fillColor: color,
              fillOpacity: isSelected ? 0.95 : 0.7,
            }}
            eventHandlers={{
              click: () => onRegionSelect(region.id),
            }}
          >
            <Popup>
              <div style={{ minWidth: 160 }}>
                <strong style={{ fontSize: 14, color: '#f1f5f9' }}>{region.name}</strong>
                <div style={{ marginTop: 6 }}>
                  <span
                    style={{
                      display: 'inline-block',
                      background: color,
                      color: '#0f172a',
                      borderRadius: 6,
                      padding: '2px 10px',
                      fontWeight: 700,
                      fontSize: 13,
                    }}
                  >
                    Score: {score.toFixed(0)}
                  </span>
                </div>
                <div style={{ marginTop: 6, fontSize: 11, color: '#94a3b8' }}>
                  <div>Renda média: R$ {region.avg_income.toLocaleString('pt-BR')}</div>
                  <div>Fluxo urbano: {region.urban_flow}/10</div>
                  <div>Tendência: {region.consumption_trend}/10</div>
                </div>
                <div style={{ marginTop: 6, fontSize: 10, color: '#64748b' }}>
                  {region.description}
                </div>
              </div>
            </Popup>
          </CircleMarker>
        )
      })}
    </MapContainer>
  )
}
