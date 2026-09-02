'use client';

import { useState, useEffect, useRef } from 'react';
import { MapIcon, Satellite, Plus, Minus, Navigation, Settings } from 'lucide-react';
import type { BusinessMarker } from '@/types/dashboard';

interface OpportunityMapProps {
  markers: BusinessMarker[];
  center?: { lat: number; lng: number };
  zoom?: number;
  onLocationSelect?: (location: { lat: number; lng: number; address: string }) => void;
}

const defaultCenter = {
  lat: -23.5505,
  lng: -46.6333,
};

export default function OpportunityMap({
  markers,
  center = defaultCenter,
  zoom = 12,
  onLocationSelect,
}: OpportunityMapProps) {
  const [mapType, setMapType] = useState<'roadmap' | 'satellite'>('roadmap');
  const [selectedMarker, setSelectedMarker] = useState<BusinessMarker | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const circleRef = useRef<any>(null);

  // Carregar Leaflet apenas uma vez
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const loadLeaflet = async () => {
      // Carregar CSS do Leaflet
      if (!document.getElementById('leaflet-css')) {
        const link = document.createElement('link');
        link.id = 'leaflet-css';
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
        link.crossOrigin = '';
        document.head.appendChild(link);
      }

      // Carregar script do Leaflet
      // @ts-ignore
      if (!window.L) {
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        script.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=';
        script.crossOrigin = '';

        await new Promise((resolve) => {
          script.onload = resolve;
          document.head.appendChild(script);
        });
      }

      setIsLoaded(true);
    };

    loadLeaflet();
  }, []);

  // Criar mapa apenas uma vez
  useEffect(() => {
    if (!isLoaded || !mapRef.current || mapInstanceRef.current) return;

    // @ts-ignore
    const L = window.L;

    // Criar o mapa
    const map = L.map(mapRef.current).setView([center.lat, center.lng], zoom);

    // Adicionar tiles (roadmap ou satellite)
    const roadmapLayer = L.tileLayer(
      'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }
    );

    const satelliteLayer = L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      {
        attribution: '© Esri',
        maxZoom: 19,
      }
    );

    // Adicionar camada inicial
    if (mapType === 'satellite') {
      satelliteLayer.addTo(map);
    } else {
      roadmapLayer.addTo(map);
    }

    // Armazenar camadas para troca
    (map as any)._roadmapLayer = roadmapLayer;
    (map as any)._satelliteLayer = satelliteLayer;

    // Adicionar evento de clique no mapa
    map.on('click', async (e: any) => {
      const { lat, lng } = e.latlng;
      
      // Atualizar localização selecionada
      setSelectedLocation({ lat, lng });
      
      // Remover círculo anterior se existir
      if (circleRef.current) {
        circleRef.current.remove();
      }
      
      // Criar círculo visual na área selecionada
      const circle = L.circle([lat, lng], {
        color: '#3B82F6',
        fillColor: '#3B82F6',
        fillOpacity: 0.2,
        radius: 500, // Raio de 500 metros
        weight: 3,
      }).addTo(map);
      
      circleRef.current = circle;
      
      // Buscar endereço usando reverse geocoding (Nominatim)
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
        );
        const data = await response.json();
        
        const address = data.display_name || `Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`;
        
        // Notificar componente pai
        if (onLocationSelect) {
          onLocationSelect({ lat, lng, address });
        }
        
        // Adicionar popup informativo
        circle.bindPopup(`
          <div style="padding: 8px; min-width: 250px;">
            <h3 style="font-weight: 600; color: #0F172A; margin-bottom: 8px; font-size: 14px;">
              📍 Local Selecionado
            </h3>
            <p style="font-size: 12px; color: #64748B; margin-bottom: 8px;">
              ${address}
            </p>
            <div style="font-size: 11px; padding: 8px; background: #EFF6FF; border-radius: 6px;">
              <p style="color: #1E40AF; margin: 0;">
                💡 Área de análise: raio de 500m
              </p>
            </div>
          </div>
        `).openPopup();
        
      } catch (error) {
        console.error('Erro ao buscar endereço:', error);
        
        if (onLocationSelect) {
          onLocationSelect({ 
            lat, 
            lng, 
            address: `Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}` 
          });
        }
      }
    });

    mapInstanceRef.current = map;

    return () => {
      if (circleRef.current) {
        circleRef.current.remove();
      }
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [isLoaded]);

  // Atualizar marcadores quando mudarem
  useEffect(() => {
    if (!mapInstanceRef.current || !isLoaded) return;

    // @ts-ignore
    const L = window.L;

    // Limpar markers antigos
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    // Adicionar novos markers
    if (markers.length > 0) {
      markers.forEach((markerData) => {
        const color = getScoreColor(markerData.potential);

        const markerIcon = L.divIcon({
          className: 'custom-marker',
          html: `<div style="background-color: ${color}; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.3);"></div>`,
          iconSize: [24, 24],
          iconAnchor: [12, 12],
        });

        const marker = L.marker([markerData.lat, markerData.lng], { icon: markerIcon }).addTo(
          mapInstanceRef.current
        );

        // Adicionar popup ao clicar
        const popupContent = `
          <div style="padding: 8px; min-width: 200px;">
            <h3 style="font-weight: 600; color: #0F172A; margin-bottom: 4px; font-size: 14px;">
              ${markerData.category}
            </h3>
            <p style="font-size: 12px; color: #64748B; margin-bottom: 8px;">
              ${markerData.name}
            </p>
            <div style="font-size: 11px;">
              <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                <span style="color: #64748B;">Concorrência:</span>
                <span style="font-weight: 500; color: #0F172A;">${markerData.competition}</span>
              </div>
              <div style="display: flex; justify-content: space-between;">
                <span style="color: #64748B;">Potencial:</span>
                <span style="font-weight: 700; color: ${color};">${markerData.potential}%</span>
              </div>
            </div>
          </div>
        `;

        marker.bindPopup(popupContent);
        marker.on('click', () => setSelectedMarker(markerData));

        markersRef.current.push(marker);
      });
    }
  }, [markers, isLoaded]);

  // Atualizar centro e zoom do mapa quando mudarem (sincronização com autocomplete)
  useEffect(() => {
    if (mapInstanceRef.current && isLoaded) {
      mapInstanceRef.current.setView([center.lat, center.lng], zoom);
    }
  }, [center.lat, center.lng, zoom, isLoaded]);

  const getScoreColor = (potential: number) => {
    if (potential >= 80) return '#16A34A'; // Verde
    if (potential >= 60) return '#F59E0B'; // Amarelo/Laranja
    if (potential >= 40) return '#F97316'; // Laranja
    return '#EF4444'; // Vermelho
  };

  const handleZoomIn = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.zoomIn();
    }
  };

  const handleZoomOut = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.zoomOut();
    }
  };

  const handleRecenter = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([center.lat, center.lng], zoom);
    }
  };

  const handleMapTypeChange = (type: 'roadmap' | 'satellite') => {
    setMapType(type);
    if (mapInstanceRef.current) {
      const map = mapInstanceRef.current;

      // Remover camada atual
      if ((map as any)._roadmapLayer) {
        map.removeLayer((map as any)._roadmapLayer);
      }
      if ((map as any)._satelliteLayer) {
        map.removeLayer((map as any)._satelliteLayer);
      }

      // Adicionar nova camada
      if (type === 'satellite') {
        (map as any)._satelliteLayer.addTo(map);
      } else {
        (map as any)._roadmapLayer.addTo(map);
      }
    }
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
      <div className="absolute top-4 left-4 z-[1000] flex gap-2">
        <button
          onClick={() => handleMapTypeChange('roadmap')}
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
          onClick={() => handleMapTypeChange('satellite')}
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
      <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-2">
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
      <div className="absolute bottom-4 left-4 z-[1000] bg-white rounded-lg shadow-md p-3 border border-border">
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

      {/* Badge OpenStreetMap */}
      <div className="absolute bottom-4 right-4 z-[1000] bg-black/80 text-white text-xs px-3 py-2 rounded-lg backdrop-blur-sm">
        🗺️ OpenStreetMap - 100% Gratuito
      </div>

      {/* Container do Mapa */}
      <div ref={mapRef} className="w-full h-full min-h-[500px]" />
    </div>
  );
}
