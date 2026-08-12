'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import { GoogleMap, useLoadScript, Circle, InfoWindow, Marker } from '@react-google-maps/api'
import type { Region, AnalysisResult, Hotspot } from '@/types'

const libraries: ('places' | 'geometry')[] = ['places', 'geometry']

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
}

const mapContainerStyle = {
  width: '100%',
  height: '100%',
  borderRadius: '12px',
}

const center = {
  lat: -23.55,
  lng: -46.63,
}

const mapOptions: google.maps.MapOptions = {
  disableDefaultUI: false,
  zoomControl: true,
  mapTypeControl: false,
  streetViewControl: false,
  fullscreenControl: true,
  styles: [
    {
      featureType: 'all',
      elementType: 'geometry',
      stylers: [{ color: '#1e293b' }],
    },
    {
      featureType: 'all',
      elementType: 'labels.text.fill',
      stylers: [{ color: '#cbd5e1' }],
    },
    {
      featureType: 'all',
      elementType: 'labels.text.stroke',
      stylers: [{ color: '#0f172a' }],
    },
    {
      featureType: 'water',
      elementType: 'geometry',
      stylers: [{ color: '#0f172a' }],
    },
    {
      featureType: 'road',
      elementType: 'geometry',
      stylers: [{ color: '#334155' }],
    },
    {
      featureType: 'road.highway',
      elementType: 'geometry',
      stylers: [{ color: '#475569' }],
    },
    {
      featureType: 'poi',
      elementType: 'geometry',
      stylers: [{ color: '#1e293b' }],
    },
  ],
}

export default function MapComponent({
  regions,
  selectedRegion,
  onRegionSelect,
  analysisResult,
  hotspots = [],
}: MapComponentProps) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''
  
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: apiKey,
    libraries,
  })

  const [map, setMap] = useState<google.maps.Map | null>(null)
  const [activeMarker, setActiveMarker] = useState<string | null>(null)
  const [activeHotspot, setActiveHotspot] = useState<Hotspot | null>(null)

  const onLoad = useCallback((map: google.maps.Map) => {
    setMap(map)
  }, [])

  const onUnmount = useCallback(() => {
    setMap(null)
  }, [])

  // Fly to selected region
  useEffect(() => {
    if (map && selectedRegion) {
      const region = regions.find((r) => r.id === selectedRegion)
      if (region) {
        map.panTo({ lat: region.lat, lng: region.lng })
        map.setZoom(14)
        setActiveMarker(selectedRegion)
      }
    }
  }, [map, selectedRegion, regions])

  const circleOptions = useMemo(() => {
    return regions.map((region) => {
      const score =
        analysisResult && selectedRegion === region.id
          ? analysisResult.opportunity_score
          : getRegionScore(region, null)

      const isSelected = region.id === selectedRegion
      const color = scoreToColor(score)

      return {
        region,
        score,
        isSelected,
        options: {
          center: { lat: region.lat, lng: region.lng },
          radius: isSelected ? 800 : 500,
          strokeColor: isSelected ? '#ffffff' : color,
          strokeOpacity: 1,
          strokeWeight: isSelected ? 3 : 2,
          fillColor: color,
          fillOpacity: isSelected ? 0.7 : 0.5,
          clickable: true,
        },
      }
    })
  }, [regions, selectedRegion, analysisResult])

  if (loadError) {
    return (
      <div className="flex items-center justify-center h-full bg-slate-800 rounded-xl">
        <div className="text-center p-8">
          <p className="text-red-400 mb-2">Erro ao carregar Google Maps</p>
          <p className="text-slate-400 text-sm">
            Verifique se a API key está configurada corretamente
          </p>
          <p className="text-slate-500 text-xs mt-2">
            Configure NEXT_PUBLIC_GOOGLE_MAPS_API_KEY no arquivo .env.local
          </p>
        </div>
      </div>
    )
  }

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-full bg-slate-800 rounded-xl">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto"></div>
          <p className="text-slate-400 mt-4">Carregando mapa...</p>
        </div>
      </div>
    )
  }

  if (!apiKey || apiKey === 'your_google_maps_key_here') {
    return (
      <div className="flex items-center justify-center h-full bg-slate-800 rounded-xl">
        <div className="text-center p-8">
          <p className="text-yellow-400 mb-2">⚠️ Google Maps não configurado</p>
          <p className="text-slate-400 text-sm mb-4">
            Configure sua API key do Google Maps para usar o mapa interativo
          </p>
          <div className="bg-slate-900 p-4 rounded-lg text-left text-xs text-slate-300 font-mono">
            <p className="mb-2">1. Obtenha uma API key em:</p>
            <p className="text-cyan-400 mb-3">console.cloud.google.com/google/maps-apis</p>
            <p className="mb-2">2. Crie o arquivo .env.local com:</p>
            <p className="text-green-400">NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=sua_key_aqui</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <GoogleMap
      mapContainerStyle={mapContainerStyle}
      center={center}
      zoom={11}
      onLoad={onLoad}
      onUnmount={onUnmount}
      options={mapOptions}
    >
      {circleOptions.map(({ region, score, isSelected, options }) => (
        <Circle
          key={region.id}
          center={options.center}
          radius={options.radius}
          options={{
            strokeColor: options.strokeColor,
            strokeOpacity: options.strokeOpacity,
            strokeWeight: options.strokeWeight,
            fillColor: options.fillColor,
            fillOpacity: options.fillOpacity,
            clickable: options.clickable,
          }}
          onClick={() => {
            onRegionSelect(region.id)
            setActiveMarker(region.id)
          }}
        />
      ))}

      {activeMarker && (
        <InfoWindow
          position={{
            lat: regions.find((r) => r.id === activeMarker)?.lat || 0,
            lng: regions.find((r) => r.id === activeMarker)?.lng || 0,
          }}
          onCloseClick={() => setActiveMarker(null)}
        >
          <div className="p-2" style={{ minWidth: 180 }}>
            {(() => {
              const region = regions.find((r) => r.id === activeMarker)
              if (!region) return null

              const score =
                analysisResult && selectedRegion === region.id
                  ? analysisResult.opportunity_score
                  : getRegionScore(region, null)

              const color = scoreToColor(score)

              return (
                <>
                  <h3 className="font-bold text-base text-slate-900 mb-2">
                    {region.name}
                  </h3>
                  <div className="mb-2">
                    <span
                      className="inline-block px-3 py-1 rounded-md font-bold text-sm text-white"
                      style={{ backgroundColor: color }}
                    >
                      Score: {score.toFixed(0)}
                    </span>
                  </div>
                  <div className="text-xs text-slate-600 space-y-1">
                    <div>💰 Renda média: R$ {region.avg_income.toLocaleString('pt-BR')}</div>
                    <div>🚶 Fluxo urbano: {region.urban_flow}/10</div>
                    <div>📈 Tendência: {region.consumption_trend}/10</div>
                  </div>
                  <p className="text-xs text-slate-500 mt-2 italic">
                    {region.description}
                  </p>
                </>
              )
            })()}
          </div>
        </InfoWindow>
      )}

      {/* AI Hotspot Markers */}
      {hotspots.map((hotspot, index) => {
        const score = hotspot.opportunity_score
        const color = scoreToColor(score)
        
        // Create custom icon with score
        const icon = {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 12,
          fillColor: color,
          fillOpacity: 0.9,
          strokeColor: '#ffffff',
          strokeWeight: 3,
        }

        return (
          <Marker
            key={`hotspot-${index}`}
            position={{ lat: hotspot.lat, lng: hotspot.lng }}
            icon={icon}
            onClick={() => setActiveHotspot(hotspot)}
            label={{
              text: `${score.toFixed(0)}`,
              color: '#ffffff',
              fontSize: '11px',
              fontWeight: 'bold',
            }}
          />
        )
      })}

      {/* Hotspot InfoWindow */}
      {activeHotspot && (
        <InfoWindow
          position={{ lat: activeHotspot.lat, lng: activeHotspot.lng }}
          onCloseClick={() => setActiveHotspot(null)}
        >
          <div className="p-2" style={{ minWidth: 220 }}>
            <div className="flex items-start justify-between gap-2 mb-2">
              <h3 className="font-bold text-base text-slate-900">
                ⭐ {activeHotspot.name}
              </h3>
              <span
                className="px-2 py-1 rounded-md font-bold text-xs text-white"
                style={{ backgroundColor: scoreToColor(activeHotspot.opportunity_score) }}
              >
                {activeHotspot.opportunity_score.toFixed(0)}
              </span>
            </div>

            <div className="text-xs text-slate-600 space-y-1.5 mb-2">
              <div className="font-semibold text-slate-700">🏪 Concorrência:</div>
              <div className="pl-4">
                • {activeHotspot.competition.total_competitors} concorrentes
                <br />• Nível: {activeHotspot.competition.competition_level}
                <br />• Rating: {activeHotspot.competition.average_rating.toFixed(1)}⭐
              </div>

              <div className="font-semibold text-slate-700 mt-2">🏗️ Infraestrutura:</div>
              <div className="pl-4">
                • Score: {activeHotspot.infrastructure.infrastructure_score.toFixed(0)}/100
                <br />• Facilidades: {activeHotspot.infrastructure.total_facilities}
              </div>

              <div className="font-semibold text-slate-700 mt-2">🚌 Mobilidade:</div>
              <div className="pl-4">
                • Score: {activeHotspot.mobility.mobility_score.toFixed(0)}/100
                <br />• Transporte: {activeHotspot.mobility.total_transport_options} opções
              </div>
            </div>

            {activeHotspot.data_source && (
              <div className="text-xs text-slate-500 border-t border-slate-200 pt-2 mt-2">
                {activeHotspot.data_source.includes('Real') ? (
                  <span className="flex items-center gap-1">
                    <span className="inline-block w-2 h-2 rounded-full bg-green-500"></span>
                    Dados Reais (Google Maps)
                  </span>
                ) : (
                  <span className="flex items-center gap-1">
                    <span className="inline-block w-2 h-2 rounded-full bg-yellow-500"></span>
                    Dados Simulados
                  </span>
                )}
              </div>
            )}
          </div>
        </InfoWindow>
      )}
    </GoogleMap>
  )
}
