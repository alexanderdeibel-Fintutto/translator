import React, { useState, useRef, useCallback, useEffect } from 'react'
import type { Floor, Room, Artwork, PositioningConfig } from '@/lib/artguide/types'
import type { PositionResult } from '@/lib/artguide/indoor-positioning'
import { positionManager } from '@/lib/artguide/indoor-positioning'

interface FloorplanViewerProps {
  floor: Floor
  rooms: Room[]
  artworks: Artwork[]
  selectedArtworkId?: string | null
  onArtworkClick?: (artworkId: string) => void
  showPosition?: boolean
  interactive?: boolean
  className?: string
}

/**
 * Interactive floorplan viewer for indoor museum navigation.
 * Shows rooms, artwork positions, and the visitor's current location.
 * Supports pinch-to-zoom and pan on mobile.
 */
export function FloorplanViewer({
  floor,
  rooms,
  artworks,
  selectedArtworkId,
  onArtworkClick,
  showPosition = true,
  interactive = true,
  className = '',
}: FloorplanViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [position, setPosition] = useState<PositionResult | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })

  // Subscribe to position updates
  useEffect(() => {
    if (!showPosition) return
    return positionManager.subscribe(setPosition)
  }, [showPosition])

  // Filter artworks on this floor
  const floorArtworks = artworks.filter(a => {
    if (!a.position_on_floorplan) return false
    const room = rooms.find(r => r.id === a.room_id)
    return room?.floor_id === floor.id
  })

  // Touch/mouse handlers for pan
  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (!interactive) return
    setIsDragging(true)
    setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y })
  }, [interactive, offset])

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging) return
    setOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    })
  }, [isDragging, dragStart])

  const handlePointerUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  // Wheel zoom
  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (!interactive) return
    e.preventDefault()
    const delta = e.deltaY > 0 ? 0.9 : 1.1
    setScale(prev => Math.min(3, Math.max(0.5, prev * delta)))
  }, [interactive])

  if (!floor.floorplan_url) {
    return (
      <div className={`flex items-center justify-center p-8 bg-white/5 rounded-xl ${className}`}>
        <div className="text-center text-white/40">
          <span className="text-4xl block mb-2">📐</span>
          <p>Kein Grundriss verfuegbar</p>
        </div>
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden rounded-xl bg-gray-900 touch-none ${className}`}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      onWheel={handleWheel}
    >
      {/* Floorplan image */}
      <div
        style={{
          transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
          transformOrigin: 'center center',
          transition: isDragging ? 'none' : 'transform 0.2s ease-out',
        }}
        className="relative"
      >
        <img
          src={floor.floorplan_url}
          alt={`Grundriss ${Object.values(floor.name)[0] || ''}`}
          className="max-w-full"
          draggable={false}
        />

        {/* Room overlays */}
        {rooms.filter(r => r.floor_id === floor.id && r.floorplan_polygon).map(room => (
          <div
            key={room.id}
            className="absolute border border-white/20 rounded bg-white/5 hover:bg-white/10 transition"
            style={{
              left: `${room.floorplan_x ?? 0}%`,
              top: `${room.floorplan_y ?? 0}%`,
            }}
          >
            <span className="text-[10px] text-white/40 px-1">
              {Object.values(room.name)[0] || ''}
            </span>
          </div>
        ))}

        {/* Artwork markers */}
        {floorArtworks.map(artwork => {
          const pos = artwork.position_on_floorplan
          if (!pos) return null

          const isSelected = artwork.id === selectedArtworkId
          const isHighlight = artwork.is_highlight

          return (
            <button
              key={artwork.id}
              onClick={() => onArtworkClick?.(artwork.id)}
              className={`absolute transform -translate-x-1/2 -translate-y-1/2 rounded-full transition-all ${
                isSelected
                  ? 'w-6 h-6 bg-amber-400 ring-4 ring-amber-400/30 z-20'
                  : isHighlight
                    ? 'w-4 h-4 bg-amber-400 hover:w-5 hover:h-5 z-10'
                    : 'w-3 h-3 bg-white/60 hover:bg-white hover:w-4 hover:h-4 z-5'
              }`}
              style={{
                left: `${pos.x}%`,
                top: `${pos.y}%`,
              }}
              title={Object.values(artwork.title)[0] || ''}
            >
              {isSelected && (
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-indigo-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                  {Object.values(artwork.title)[0] || ''}
                </div>
              )}
            </button>
          )
        })}

        {/* Visitor position indicator */}
        {position && position.method === 'ble' && position.floorplanX != null && (
          <div
            className="absolute w-5 h-5 -translate-x-1/2 -translate-y-1/2 z-30"
            style={{
              left: `${position.floorplanX}%`,
              top: `${position.floorplanY}%`,
            }}
          >
            <div className="w-full h-full rounded-full bg-blue-500 border-2 border-white animate-pulse" />
            <div className="absolute inset-0 rounded-full bg-blue-500/30 animate-ping" />
          </div>
        )}
      </div>

      {/* Zoom controls */}
      {interactive && (
        <div className="absolute bottom-3 right-3 flex flex-col gap-1 z-40">
          <button
            onClick={() => setScale(prev => Math.min(3, prev * 1.2))}
            className="w-8 h-8 rounded-lg bg-black/60 text-white flex items-center justify-center hover:bg-black/80 text-lg"
          >
            +
          </button>
          <button
            onClick={() => setScale(prev => Math.max(0.5, prev * 0.8))}
            className="w-8 h-8 rounded-lg bg-black/60 text-white flex items-center justify-center hover:bg-black/80 text-lg"
          >
            −
          </button>
          <button
            onClick={() => { setScale(1); setOffset({ x: 0, y: 0 }) }}
            className="w-8 h-8 rounded-lg bg-black/60 text-white flex items-center justify-center hover:bg-black/80 text-xs"
          >
            ↺
          </button>
        </div>
      )}

      {/* Floor label */}
      <div className="absolute top-3 left-3 px-3 py-1.5 rounded-lg bg-black/60 text-white text-sm z-40">
        {Object.values(floor.name)[0] || `Etage ${floor.floor_number}`}
      </div>
    </div>
  )
}

export default FloorplanViewer
