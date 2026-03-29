'use client'

import { APIProvider, Map, AdvancedMarker, Pin, InfoWindow } from '@vis.gl/react-google-maps'
import { useState } from 'react'

export interface MapPOI {
  id: string
  name: string
  lat: number
  lng: number
  category?: string
  status?: 'published' | 'draft' | 'review' | 'archived'
  address?: string
}

interface GoogleMapViewProps {
  pois: MapPOI[]
  center?: { lat: number; lng: number }
  zoom?: number
  onPoiClick?: (poi: MapPOI) => void
  height?: string
}

const STATUS_COLORS: Record<string, string> = {
  published: '#10b981',
  review: '#f59e0b',
  draft: '#6b7280',
  archived: '#ef4444',
}

const CATEGORY_ICONS: Record<string, string> = {
  attractions: '🏛️',
  restaurants: '🍽️',
  museums: '🖼️',
  parks: '🌳',
  shopping: '🛍️',
  hotels: '🏨',
  transport: '🚌',
  default: '📍',
}

export default function GoogleMapView({
  pois,
  center = { lat: 48.2082, lng: 16.3738 }, // Wien default
  zoom = 13,
  onPoiClick,
  height = '400px',
}: GoogleMapViewProps) {
  const [selectedPoi, setSelectedPoi] = useState<MapPOI | null>(null)
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

  if (!apiKey) {
    return (
      <div
        className="flex items-center justify-center bg-gray-100 rounded-xl border border-gray-200"
        style={{ height }}
      >
        <div className="text-center p-6">
          <span className="text-4xl block mb-3">🗺️</span>
          <p className="text-gray-500 font-medium">Google Maps nicht konfiguriert</p>
          <p className="text-gray-400 text-sm mt-1">
            Bitte <code className="bg-gray-200 px-1 rounded">NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</code> setzen
          </p>
        </div>
      </div>
    )
  }

  return (
    <APIProvider apiKey={apiKey}>
      <div style={{ height, borderRadius: '0.75rem', overflow: 'hidden' }}>
        <Map
          defaultCenter={center}
          defaultZoom={zoom}
          mapId="fintutto-artguide-map"
          gestureHandling="greedy"
          disableDefaultUI={false}
          style={{ width: '100%', height: '100%' }}
        >
          {pois.map((poi) => (
            <AdvancedMarker
              key={poi.id}
              position={{ lat: poi.lat, lng: poi.lng }}
              onClick={() => {
                setSelectedPoi(poi)
                onPoiClick?.(poi)
              }}
            >
              <Pin
                background={STATUS_COLORS[poi.status ?? 'draft']}
                borderColor={STATUS_COLORS[poi.status ?? 'draft']}
                glyphColor="#ffffff"
                glyph={CATEGORY_ICONS[poi.category ?? 'default']}
              />
            </AdvancedMarker>
          ))}

          {selectedPoi && (
            <InfoWindow
              position={{ lat: selectedPoi.lat, lng: selectedPoi.lng }}
              onCloseClick={() => setSelectedPoi(null)}
            >
              <div className="p-2 min-w-[160px]">
                <p className="font-semibold text-gray-900 text-sm">{selectedPoi.name}</p>
                {selectedPoi.address && (
                  <p className="text-gray-500 text-xs mt-0.5">{selectedPoi.address}</p>
                )}
                {selectedPoi.status && (
                  <span
                    className="inline-block mt-1 px-2 py-0.5 rounded-full text-xs text-white"
                    style={{ backgroundColor: STATUS_COLORS[selectedPoi.status] }}
                  >
                    {selectedPoi.status}
                  </span>
                )}
              </div>
            </InfoWindow>
          )}
        </Map>
      </div>
    </APIProvider>
  )
}
