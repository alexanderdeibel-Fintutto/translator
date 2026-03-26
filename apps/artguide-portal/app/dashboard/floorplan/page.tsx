'use client'

import { useState, useRef, useEffect, useCallback } from 'react'

interface POIPin {
  id: string
  x: number // percent
  y: number // percent
  label: string
  artwork_id?: string
  room?: string
  status: 'published' | 'draft' | 'review'
  color?: string
}

interface Floor {
  id: string
  name: string
  level: number
  image_url?: string
  pois: POIPin[]
}

const DEMO_FLOORS: Floor[] = [
  {
    id: 'floor-eg',
    name: 'Erdgeschoss',
    level: 0,
    pois: [
      { id: 'p1', x: 25, y: 35, label: 'Eingang & Empfang', status: 'published', color: '#6366f1' },
      { id: 'p2', x: 45, y: 30, label: 'Saal 1 — Impressionismus', status: 'published', color: '#10b981' },
      { id: 'p3', x: 65, y: 45, label: 'Saal 2 — Moderne', status: 'published', color: '#10b981' },
      { id: 'p4', x: 30, y: 65, label: 'Skulpturengarten', status: 'draft', color: '#f59e0b' },
      { id: 'p5', x: 70, y: 70, label: 'Museumscafé', status: 'published', color: '#6366f1' },
    ],
  },
  {
    id: 'floor-og1',
    name: '1. Obergeschoss',
    level: 1,
    pois: [
      { id: 'p6', x: 35, y: 40, label: 'Saal 3 — Barock', status: 'published', color: '#10b981' },
      { id: 'p7', x: 60, y: 35, label: 'Saal 4 — Renaissance', status: 'review', color: '#f59e0b' },
      { id: 'p8', x: 50, y: 65, label: 'Bibliothek', status: 'draft', color: '#6366f1' },
    ],
  },
]

const STATUS_COLORS = {
  published: '#10b981',
  review: '#f59e0b',
  draft: '#6b7280',
}

export default function FloorplanPage() {
  const [floors, setFloors] = useState<Floor[]>(DEMO_FLOORS)
  const [activeFloor, setActiveFloor] = useState(0)
  const [selectedPOI, setSelectedPOI] = useState<POIPin | null>(null)
  const [isPlacing, setIsPlacing] = useState(false)
  const [isDragging, setIsDragging] = useState<string | null>(null)
  const [showUploadHint, setShowUploadHint] = useState(false)
  const [zoom, setZoom] = useState(1)
  const mapRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const floor = floors[activeFloor]

  const handleMapClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!isPlacing || !mapRef.current) return
    const rect = mapRef.current.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100

    const newPOI: POIPin = {
      id: `poi-${Date.now()}`,
      x: Math.round(x * 10) / 10,
      y: Math.round(y * 10) / 10,
      label: 'Neues Exponat',
      status: 'draft',
      color: '#6366f1',
    }

    setFloors(prev => prev.map((f, i) =>
      i === activeFloor ? { ...f, pois: [...f.pois, newPOI] } : f
    ))
    setSelectedPOI(newPOI)
    setIsPlacing(false)
  }, [isPlacing, activeFloor])

  const handlePOIDragStart = (e: React.MouseEvent, poiId: string) => {
    e.stopPropagation()
    setIsDragging(poiId)
  }

  const handleMapMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging || !mapRef.current) return
    const rect = mapRef.current.getBoundingClientRect()
    const x = Math.max(2, Math.min(98, ((e.clientX - rect.left) / rect.width) * 100))
    const y = Math.max(2, Math.min(98, ((e.clientY - rect.top) / rect.height) * 100))

    setFloors(prev => prev.map((f, i) =>
      i === activeFloor ? {
        ...f,
        pois: f.pois.map(p => p.id === isDragging ? { ...p, x: Math.round(x * 10) / 10, y: Math.round(y * 10) / 10 } : p)
      } : f
    ))
  }, [isDragging, activeFloor])

  const handleMouseUp = useCallback(() => {
    setIsDragging(null)
  }, [])

  const updatePOI = (updates: Partial<POIPin>) => {
    if (!selectedPOI) return
    const updated = { ...selectedPOI, ...updates }
    setSelectedPOI(updated)
    setFloors(prev => prev.map((f, i) =>
      i === activeFloor ? {
        ...f,
        pois: f.pois.map(p => p.id === updated.id ? updated : p)
      } : f
    ))
  }

  const deletePOI = (id: string) => {
    setFloors(prev => prev.map((f, i) =>
      i === activeFloor ? { ...f, pois: f.pois.filter(p => p.id !== id) } : f
    ))
    setSelectedPOI(null)
  }

  const addFloor = () => {
    const newFloor: Floor = {
      id: `floor-${Date.now()}`,
      name: `${floors.length}. Obergeschoss`,
      level: floors.length,
      pois: [],
    }
    setFloors(prev => [...prev, newFloor])
    setActiveFloor(floors.length)
  }

  return (
    <div className="flex h-screen bg-gray-950 text-white overflow-hidden">
      {/* Left Sidebar — Floor List */}
      <div className="w-56 bg-gray-900 border-r border-gray-800 flex flex-col">
        <div className="p-4 border-b border-gray-800">
          <h2 className="font-bold text-sm text-gray-200">🏛 Grundriss-Editor</h2>
          <p className="text-xs text-gray-500 mt-0.5">POIs auf Karte platzieren</p>
        </div>

        {/* Floor Tabs */}
        <div className="flex-1 overflow-y-auto p-2">
          <p className="text-xs text-gray-500 px-2 mb-2 font-medium uppercase tracking-wider">Etagen</p>
          {floors.map((f, i) => (
            <button
              key={f.id}
              onClick={() => { setActiveFloor(i); setSelectedPOI(null) }}
              className={`w-full text-left px-3 py-2.5 rounded-lg mb-1 text-sm transition-colors ${
                activeFloor === i
                  ? 'bg-indigo-600 text-white'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <div className="font-medium">{f.name}</div>
              <div className="text-xs opacity-70">{f.pois.length} POIs</div>
            </button>
          ))}
          <button
            onClick={addFloor}
            className="w-full text-left px-3 py-2 rounded-lg text-xs text-gray-500 hover:text-gray-300 hover:bg-gray-800 transition-colors border border-dashed border-gray-700 mt-1"
          >
            + Etage hinzufügen
          </button>
        </div>

        {/* POI List */}
        <div className="border-t border-gray-800 p-2 max-h-64 overflow-y-auto">
          <p className="text-xs text-gray-500 px-2 mb-2 font-medium uppercase tracking-wider">POIs auf dieser Etage</p>
          {floor.pois.map(poi => (
            <button
              key={poi.id}
              onClick={() => setSelectedPOI(poi)}
              className={`w-full text-left px-3 py-2 rounded-lg mb-0.5 text-xs transition-colors ${
                selectedPOI?.id === poi.id ? 'bg-indigo-900/50 border border-indigo-700' : 'hover:bg-gray-800'
              }`}
            >
              <div className="flex items-center gap-2">
                <span
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: STATUS_COLORS[poi.status] }}
                />
                <span className="truncate text-gray-300">{poi.label}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Map Area */}
      <div className="flex-1 flex flex-col">
        {/* Toolbar */}
        <div className="bg-gray-900 border-b border-gray-800 px-4 py-2 flex items-center gap-3">
          <span className="text-sm font-medium text-gray-300">{floor.name}</span>
          <div className="flex-1" />

          {/* Zoom */}
          <div className="flex items-center gap-1 bg-gray-800 rounded-lg px-2 py-1">
            <button onClick={() => setZoom(z => Math.max(0.5, z - 0.1))} className="text-gray-400 hover:text-white w-5 text-center">−</button>
            <span className="text-xs text-gray-400 w-10 text-center">{Math.round(zoom * 100)}%</span>
            <button onClick={() => setZoom(z => Math.min(3, z + 0.1))} className="text-gray-400 hover:text-white w-5 text-center">+</button>
          </div>

          {/* Upload Grundriss */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded-lg text-xs text-gray-300 transition-colors"
          >
            📁 Grundriss hochladen
          </button>
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={() => setShowUploadHint(true)} />

          {/* Place POI */}
          <button
            onClick={() => setIsPlacing(!isPlacing)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              isPlacing
                ? 'bg-indigo-600 text-white ring-2 ring-indigo-400'
                : 'bg-indigo-600/20 text-indigo-400 hover:bg-indigo-600/30'
            }`}
          >
            {isPlacing ? '🎯 Klicke auf die Karte...' : '+ POI platzieren'}
          </button>
        </div>

        {/* Map Canvas */}
        <div className="flex-1 overflow-hidden relative bg-gray-950 flex items-center justify-center">
          <div
            ref={mapRef}
            className={`relative bg-gray-900 border border-gray-700 rounded-xl overflow-hidden select-none ${
              isPlacing ? 'cursor-crosshair' : isDragging ? 'cursor-grabbing' : 'cursor-default'
            }`}
            style={{
              width: `${Math.min(90, 70 * zoom)}%`,
              aspectRatio: '4/3',
              transform: `scale(${zoom > 1 ? 1 : zoom})`,
            }}
            onClick={handleMapClick}
            onMouseMove={handleMapMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            {/* Grid Background */}
            {!floor.image_url && (
              <div className="absolute inset-0"
                style={{
                  backgroundImage: 'linear-gradient(rgba(99,102,241,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.05) 1px, transparent 1px)',
                  backgroundSize: '5% 5%',
                }}
              >
                {/* Demo floor plan outline */}
                <svg className="absolute inset-0 w-full h-full opacity-20" viewBox="0 0 100 75">
                  {/* Outer walls */}
                  <rect x="10" y="10" width="80" height="55" fill="none" stroke="#6366f1" strokeWidth="0.5" />
                  {/* Rooms */}
                  <rect x="10" y="10" width="35" height="25" fill="none" stroke="#6366f1" strokeWidth="0.3" />
                  <rect x="45" y="10" width="45" height="25" fill="none" stroke="#6366f1" strokeWidth="0.3" />
                  <rect x="10" y="35" width="25" height="30" fill="none" stroke="#6366f1" strokeWidth="0.3" />
                  <rect x="35" y="35" width="55" height="30" fill="none" stroke="#6366f1" strokeWidth="0.3" />
                  {/* Doors */}
                  <line x1="25" y1="65" x2="35" y2="65" stroke="#6366f1" strokeWidth="0.5" strokeDasharray="1,0.5" />
                  <line x1="55" y1="10" x2="65" y2="10" stroke="#6366f1" strokeWidth="0.5" strokeDasharray="1,0.5" />
                  {/* Labels */}
                  <text x="27" y="23" fontSize="3" fill="#6366f1" textAnchor="middle">Eingang</text>
                  <text x="67" y="23" fontSize="3" fill="#6366f1" textAnchor="middle">Saal 1</text>
                  <text x="22" y="51" fontSize="3" fill="#6366f1" textAnchor="middle">Garten</text>
                  <text x="62" y="51" fontSize="3" fill="#6366f1" textAnchor="middle">Saal 2</text>
                </svg>
              </div>
            )}

            {/* POI Pins */}
            {floor.pois.map(poi => (
              <div
                key={poi.id}
                className="absolute group"
                style={{ left: `${poi.x}%`, top: `${poi.y}%`, transform: 'translate(-50%, -100%)' }}
                onMouseDown={(e) => handlePOIDragStart(e, poi.id)}
                onClick={(e) => { e.stopPropagation(); setSelectedPOI(poi) }}
              >
                {/* Pin */}
                <div
                  className={`relative cursor-grab active:cursor-grabbing transition-transform ${
                    selectedPOI?.id === poi.id ? 'scale-125' : 'hover:scale-110'
                  }`}
                >
                  <div
                    className="w-7 h-7 rounded-full border-2 border-white shadow-lg flex items-center justify-center text-xs font-bold"
                    style={{ backgroundColor: STATUS_COLORS[poi.status] }}
                  >
                    📍
                  </div>
                  {/* Dot at bottom */}
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full w-0.5 h-2 bg-white/50" />
                </div>

                {/* Tooltip */}
                <div className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-gray-900 border border-gray-700 rounded-lg px-2 py-1 text-xs whitespace-nowrap shadow-xl pointer-events-none transition-opacity ${
                  selectedPOI?.id === poi.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                }`}>
                  {poi.label}
                </div>
              </div>
            ))}

            {/* Placing hint */}
            {isPlacing && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="bg-indigo-600/80 text-white text-sm px-4 py-2 rounded-full backdrop-blur-sm">
                  🎯 Klicke um einen POI zu platzieren
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right Sidebar — POI Editor */}
      <div className="w-72 bg-gray-900 border-l border-gray-800 flex flex-col">
        {selectedPOI ? (
          <>
            <div className="p-4 border-b border-gray-800 flex items-center justify-between">
              <h3 className="font-semibold text-sm">POI bearbeiten</h3>
              <button onClick={() => setSelectedPOI(null)} className="text-gray-500 hover:text-white text-lg leading-none">×</button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Label */}
              <div>
                <label className="text-xs text-gray-400 block mb-1">Bezeichnung</label>
                <input
                  type="text"
                  value={selectedPOI.label}
                  onChange={e => updatePOI({ label: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Status */}
              <div>
                <label className="text-xs text-gray-400 block mb-1">Status</label>
                <select
                  value={selectedPOI.status}
                  onChange={e => updatePOI({ status: e.target.value as POIPin['status'] })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500"
                >
                  <option value="published">✅ Veröffentlicht</option>
                  <option value="review">⏳ In Review</option>
                  <option value="draft">📝 Entwurf</option>
                </select>
              </div>

              {/* Room */}
              <div>
                <label className="text-xs text-gray-400 block mb-1">Raum / Bereich</label>
                <input
                  type="text"
                  value={selectedPOI.room || ''}
                  onChange={e => updatePOI({ room: e.target.value })}
                  placeholder="z.B. Saal 1, Erdgeschoss"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Position */}
              <div className="bg-gray-800/50 rounded-lg p-3">
                <p className="text-xs text-gray-500 mb-2">Position auf Karte</p>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs text-gray-500">X (%)</label>
                    <input
                      type="number"
                      value={Math.round(selectedPOI.x * 10) / 10}
                      onChange={e => updatePOI({ x: parseFloat(e.target.value) })}
                      className="w-full bg-gray-700 rounded px-2 py-1 text-xs mt-0.5"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">Y (%)</label>
                    <input
                      type="number"
                      value={Math.round(selectedPOI.y * 10) / 10}
                      onChange={e => updatePOI({ y: parseFloat(e.target.value) })}
                      className="w-full bg-gray-700 rounded px-2 py-1 text-xs mt-0.5"
                    />
                  </div>
                </div>
              </div>

              {/* Color */}
              <div>
                <label className="text-xs text-gray-400 block mb-2">Pin-Farbe</label>
                <div className="flex gap-2">
                  {['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#ec4899'].map(color => (
                    <button
                      key={color}
                      onClick={() => updatePOI({ color })}
                      className={`w-7 h-7 rounded-full border-2 transition-transform hover:scale-110 ${
                        selectedPOI.color === color ? 'border-white scale-110' : 'border-transparent'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="pt-2 space-y-2">
                <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-sm py-2 rounded-lg transition-colors">
                  💾 Speichern
                </button>
                <button
                  onClick={() => deletePOI(selectedPOI.id)}
                  className="w-full bg-red-900/30 hover:bg-red-900/50 text-red-400 text-sm py-2 rounded-lg transition-colors"
                >
                  🗑 POI löschen
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
            <div className="text-5xl mb-4">🗺</div>
            <h3 className="font-semibold text-gray-300 mb-2">Grundriss-Editor</h3>
            <p className="text-xs text-gray-500 mb-6">Platziere POIs auf dem Grundriss und verknüpfe sie mit Exponaten</p>
            <div className="space-y-2 text-left w-full">
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <span className="w-2 h-2 rounded-full bg-green-500" />
                Veröffentlicht ({floor.pois.filter(p => p.status === 'published').length})
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <span className="w-2 h-2 rounded-full bg-yellow-500" />
                In Review ({floor.pois.filter(p => p.status === 'review').length})
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <span className="w-2 h-2 rounded-full bg-gray-500" />
                Entwurf ({floor.pois.filter(p => p.status === 'draft').length})
              </div>
            </div>
            <button
              onClick={() => setIsPlacing(true)}
              className="mt-6 w-full bg-indigo-600 hover:bg-indigo-700 text-white text-sm py-2.5 rounded-xl transition-colors"
            >
              + POI platzieren
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
