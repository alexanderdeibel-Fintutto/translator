import React, { useEffect, useRef, useState } from 'react'
import type { Artwork, GpsZone, Venue, Museum } from '@/lib/artguide/types'

interface MapViewProps {
  museum: Museum
  venue: Venue
  artworks: Artwork[]
  zones: GpsZone[]
  selectedArtworkId?: string | null
  onArtworkClick?: (artworkId: string) => void
  userPosition?: { lat: number; lng: number } | null
  className?: string
}

/**
 * Mapbox GL JS map for outdoor venues (nature parks, open-air museums, etc.)
 * Shows artwork positions, GPS zones, and visitor location.
 *
 * Requires VITE_MAPBOX_TOKEN environment variable.
 */
export function MapView({
  museum,
  venue,
  artworks,
  zones,
  selectedArtworkId,
  onArtworkClick,
  userPosition,
  className = '',
}: MapViewProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<unknown>(null)
  const [mapLoaded, setMapLoaded] = useState(false)
  const [mapError, setMapError] = useState<string | null>(null)

  useEffect(() => {
    if (!mapContainerRef.current) return

    const token = import.meta.env.VITE_MAPBOX_TOKEN
    if (!token) {
      setMapError('Mapbox Token nicht konfiguriert')
      return
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- mapbox-gl types loaded dynamically
    let map: any = null

    async function initMap() {
      try {
        // Dynamic import to avoid loading Mapbox if not needed
        // @ts-expect-error — mapbox-gl types are not installed; loaded at runtime
        const mapboxgl = await import('mapbox-gl')
        await import('mapbox-gl/dist/mapbox-gl.css')

        mapboxgl.default.accessToken = token

        map = new mapboxgl.default.Map({
          container: mapContainerRef.current!,
          style: venue.map_style_url || 'mapbox://styles/mapbox/outdoors-v12',
          center: [venue.center_lng || 0, venue.center_lat || 0],
          zoom: 16,
        })

        map.addControl(new mapboxgl.default.NavigationControl(), 'top-right')
        map.addControl(
          new mapboxgl.default.GeolocateControl({
            positionOptions: { enableHighAccuracy: true },
            trackUserLocation: true,
          }),
          'top-right'
        )

        map.on('load', () => {
          setMapLoaded(true)

          // Add artwork markers
          for (const artwork of artworks) {
            if (!artwork.position_gps) continue

            const el = document.createElement('div')
            el.className = artwork.is_highlight
              ? 'ag-marker ag-marker-highlight'
              : 'ag-marker'
            el.style.cssText = `
              width: ${artwork.is_highlight ? '24px' : '16px'};
              height: ${artwork.is_highlight ? '24px' : '16px'};
              border-radius: 50%;
              background: ${artwork.id === selectedArtworkId ? '#fbbf24' : artwork.is_highlight ? '#f59e0b' : '#94a3b8'};
              border: 2px solid white;
              cursor: pointer;
              box-shadow: 0 2px 4px rgba(0,0,0,0.3);
              transition: transform 0.2s;
            `
            el.addEventListener('mouseenter', () => el.style.transform = 'scale(1.3)')
            el.addEventListener('mouseleave', () => el.style.transform = 'scale(1)')
            el.addEventListener('click', () => onArtworkClick?.(artwork.id))

            new mapboxgl.default.Marker({ element: el })
              .setLngLat([artwork.position_gps.lng, artwork.position_gps.lat])
              .setPopup(
                new mapboxgl.default.Popup({ offset: 25 })
                  .setHTML(`
                    <div style="font-family: Inter, sans-serif;">
                      <strong>${getLocalizedText(artwork.title)}</strong>
                      ${artwork.artist_name ? `<br><span style="color: #64748b; font-size: 12px;">${artwork.artist_name}</span>` : ''}
                    </div>
                  `)
              )
              .addTo(map)
          }

          // Add GPS zone polygons
          for (const zone of zones) {
            if (!zone.geometry || zone.geometry.type !== 'Polygon') continue

            map.addSource(`zone-${zone.id}`, {
              type: 'geojson',
              data: {
                type: 'Feature',
                geometry: zone.geometry,
                properties: { name: getLocalizedText(zone.name) },
              },
            })

            map.addLayer({
              id: `zone-fill-${zone.id}`,
              type: 'fill',
              source: `zone-${zone.id}`,
              paint: {
                'fill-color': '#c4a35a',
                'fill-opacity': 0.15,
              },
            })

            map.addLayer({
              id: `zone-border-${zone.id}`,
              type: 'line',
              source: `zone-${zone.id}`,
              paint: {
                'line-color': '#c4a35a',
                'line-width': 2,
                'line-dasharray': [2, 2],
              },
            })
          }
        })

        mapRef.current = map
      } catch (err) {
        console.error('[MapView] Failed to load Mapbox:', err)
        setMapError('Karte konnte nicht geladen werden')
      }
    }

    initMap()

    return () => {
      if (map) map.remove()
    }
  }, [venue.id])

  // Update user position marker
  useEffect(() => {
    if (!mapLoaded || !userPosition || !mapRef.current) return
    // User position is handled by GeolocateControl
  }, [mapLoaded, userPosition])

  if (mapError) {
    return (
      <div className={`flex items-center justify-center p-8 bg-white/5 rounded-xl ${className}`}>
        <div className="text-center text-white/40">
          <span className="text-4xl block mb-2">🗺</span>
          <p>{mapError}</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`relative rounded-xl overflow-hidden ${className}`}>
      <div ref={mapContainerRef} className="w-full h-full min-h-[400px]" />

      {!mapLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
          <div className="text-center text-white/60">
            <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm">Karte wird geladen...</p>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur rounded-lg p-3 text-xs text-white/80 space-y-1.5">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-amber-500 border border-white" />
          <span>Highlight</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-slate-400 border border-white" />
          <span>Kunstwerk</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-1 border border-dashed border-amber-500" />
          <span>Zone</span>
        </div>
      </div>
    </div>
  )
}

function getLocalizedText(text: Record<string, string> | undefined, lang = 'de'): string {
  if (!text) return ''
  return text[lang] || text['en'] || text['de'] || Object.values(text)[0] || ''
}

export default MapView
