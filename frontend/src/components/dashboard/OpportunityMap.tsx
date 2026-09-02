'use client';

import { useState, useCallback } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';
import { MapIcon, Satellite, Plus, Minus, Navigation, Settings } from 'lucide-react';
import type { BusinessMarker } from '@/types/dashboard';

interface OpportunityMapProps {
  markers: BusinessMarker[];
  center?: { lat: number; lng: number };
  zoom?: number;
}

const containerStyle = {
  width: '100%',
  height: '100%',
  minHeight: '500px',
};

const defaultCenter = {
  lat: -23.5505,
  lng: -46.6333,
};

const mapStyles = [
  {
    featureType: 'poi',
    elementType: 'labels',
    stylers: [{ visibility: 'off' }],
  },
];

export default function OpportunityMap({
  markers,
  center = defaultCenter,
  zoom = 12,
}: OpportunityMapProps) {
  const [mapType, setMapType] = useState<'roadmap' | 'satellite'>('roadmap');
  const [selectedMarker, setSelectedMarker] = useState<BusinessMarker | null>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
  });

  const onLoad = useCallback((map: google.maps.Map) => {
    setMap(map);
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  const handleZoomIn = () => {
    if (map) {
      const currentZoom = map.getZoom() || zoom;
      map.setZoom(currentZoom + 1);
    }
  };

  const handleZoomOut = () => {
    if (map) {
      const currentZoom = map.getZoom() || zoom;
      map.setZoom(currentZoom - 1);
    }
  };

  const handleRecenter = () => {
    if (map) {
      map.panTo(center);
      map.setZoom(zoom);
    }
  };

  const getScoreColor = (potential: number) => {
    if (potential >= 80) return '#16A34A'; // Verde
    if (potential >= 60) return '#F59E0B'; // Amarelo/Laranja
    if (potential >= 40) return '#F97316'; // Laranja
    return '#EF4444'; // Vermelho
  };

  if (!isLoaded) {
    return (
      <div className="w-full h-full min-h-[500px] bg-background rounded-card flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-sm text-text-secondary">Carregando mapa...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full bg-white rounded-card border border-border overflow-hidden shadow-card">
      {/* Controles de tipo de mapa (superior esquerdo) */}
      <div className="absolute top-4 left-4 z-10 flex gap-2">
        <button
          onClick={() => setMapType('roadmap')}
          className={`px-4 py-2 text-sm font-medium rounded-lg shadow-md transition-all ${
            mapType === 'roadmap'
              ? 'bg-white text-primary border-2 border-primary'
              : 'bg-white text-text-secondary hover:bg-background border border-border'
          }`}
        >
          <MapIcon className="w-4 h-4 inline mr-1" />
          Mapa
        </button>
        <button
          onClick={() => setMapType('satellite')}
          className={`px-4 py-2 text-sm font-medium rounded-lg shadow-md transition-all ${
            mapType === 'satellite'
              ? 'bg-white text-primary border-2 border-primary'
              : 'bg-white text-text-secondary hover:bg-background border border-border'
          }`}
        >
          <Satellite className="w-4 h-4 inline mr-1" />
          Satélite
        </button>
      </div>

      {/* Controles de zoom e navegação (superior direito) */}
      <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
        <button
          onClick={handleZoomIn}
          className="w-10 h-10 bg-white rounded-lg shadow-md hover:bg-background transition-all flex items-center justify-center text-text-secondary hover:text-text-primary border border-border"
          title="Aumentar zoom"
        >
          <Plus className="w-5 h-5" />
        </button>
        <button
          onClick={handleZoomOut}
          className="w-10 h-10 bg-white rounded-lg shadow-md hover:bg-background transition-all flex items-center justify-center text-text-secondary hover:text-text-primary border border-border"
          title="Diminuir zoom"
        >
          <Minus className="w-5 h-5" />
        </button>
        <button
          onClick={handleRecenter}
          className="w-10 h-10 bg-white rounded-lg shadow-md hover:bg-background transition-all flex items-center justify-center text-text-secondary hover:text-text-primary border border-border"
          title="Centralizar"
        >
          <Navigation className="w-5 h-5" />
        </button>
        <button
          className="w-10 h-10 bg-white rounded-lg shadow-md hover:bg-background transition-all flex items-center justify-center text-text-secondary hover:text-text-primary border border-border"
          title="Configurações"
        >
          <Settings className="w-5 h-5" />
        </button>
      </div>

      {/* Legenda do heatmap (inferior esquerdo) */}
      <div className="absolute bottom-4 left-4 z-10 bg-white rounded-lg shadow-md p-3 border border-border">
        <p className="text-xs font-semibold text-text-primary mb-2">
          Potencial de oportunidade
        </p>
        <div className="flex items-center gap-2">
          <span className="text-xs text-text-secondary">Baixo</span>
          <div
            className="w-32 h-2 rounded-full"
            style={{
              background: 'linear-gradient(to right, #EF4444, #F97316, #F59E0B, #16A34A)',
            }}
          ></div>
          <span className="text-xs text-text-secondary">Alto</span>
        </div>
      </div>

      {/* Mapa do Google */}
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={zoom}
        onLoad={onLoad}
        onUnmount={onUnmount}
        mapTypeId={mapType}
        options={{
          styles: mapStyles,
          disableDefaultUI: true,
          zoomControl: false,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
        }}
      >
        {/* Marcadores */}
        {markers.map((marker) => (
          <Marker
            key={marker.id}
            position={{ lat: marker.lat, lng: marker.lng }}
            onClick={() => setSelectedMarker(marker)}
            icon={{
              path: google.maps.SymbolPath.CIRCLE,
              fillColor: getScoreColor(marker.potential),
              fillOpacity: 0.9,
              strokeColor: '#FFFFFF',
              strokeWeight: 2,
              scale: 12,
            }}
          />
        ))}

        {/* Info Window ao clicar no marcador */}
        {selectedMarker && (
          <InfoWindow
            position={{ lat: selectedMarker.lat, lng: selectedMarker.lng }}
            onCloseClick={() => setSelectedMarker(null)}
          >
            <div className="p-3 min-w-[200px]">
              <h3 className="font-semibold text-text-primary mb-1">
                {selectedMarker.category}
              </h3>
              <p className="text-sm text-text-secondary mb-2">
                {selectedMarker.name}
              </p>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-text-secondary">Concorrência:</span>
                  <span className="font-medium text-text-primary">
                    {selectedMarker.competition}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Potencial:</span>
                  <span
                    className="font-bold"
                    style={{ color: getScoreColor(selectedMarker.potential) }}
                  >
                    {selectedMarker.potential}%
                  </span>
                </div>
              </div>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
    </div>
  );
}
