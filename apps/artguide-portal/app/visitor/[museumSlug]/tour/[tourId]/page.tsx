'use client'
import { useState, useEffect } from 'react'
import { useParams, useSearchParams } from 'next/navigation'

type TourStop = {
  id: string
  order_index: number
  artwork_id: string
  location_hint: string | null
  artwork: {
    id: string
    inventory_number: string
    title: string
    artist_name: string
    year_created: string
    image_url: string | null
    location: string | null
  }
}

type Tour = {
  id: string
  title: string
  description: string
  audience_type: string
  estimated_duration_min: number
  language: string
  stop_count: number
  ag_tour_stops: TourStop[]
}

export default function TourPlayerPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const museumSlug = params.museumSlug as string
  const tourId = params.tourId as string
  const lang = searchParams.get('lang') || 'de'

  const [tour, setTour] = useState<Tour | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeStop, setActiveStop] = useState<number | null>(null)
  const [completedStops, setCompletedStops] = useState<Set<number>>(new Set())

  useEffect(() => {
    fetch(`/api/tours/${tourId}?lang=${lang}`)
      .then(r => r.json())
      .then(d => setTour(d.tour || null))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [tourId, lang])

  const stops = tour?.ag_tour_stops?.sort((a, b) => a.order_index - b.order_index) || []
  const progress = completedStops.size / (stops.length || 1)

  const buildArtworkUrl = (stop: TourStop, stepIndex: number) => {
    const artworkId = stop.artwork?.inventory_number || stop.artwork_id
    const nextStop = stops[stepIndex + 1]
    const prevStop = stops[stepIndex - 1]
    const nextId = nextStop?.artwork?.inventory_number || nextStop?.artwork_id
    const prevId = prevStop?.artwork?.inventory_number || prevStop?.artwork_id
    let url = `/visitor/${museumSlug}/${artworkId}?tour=${tourId}&step=${stepIndex}&total=${stops.length}&lang=${lang}`
    if (nextId) url += `&next=${nextId}`
    if (prevId) url += `&prev=${prevId}`
    return url
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="w-12 h-12 border-2 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white/60 text-sm">Lade Führung...</p>
        </div>
      </div>
    )
  }

  if (!tour) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-6">
        <div className="text-center text-white">
          <div className="text-5xl mb-4">🗺</div>
          <h2 className="text-xl font-bold mb-2">Führung nicht gefunden</h2>
          <a href={`/visitor/${museumSlug}`} className="text-indigo-400 text-sm">← Zurück zur Übersicht</a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <div className="bg-gradient-to-b from-indigo-950 to-gray-950 px-4 pt-6 pb-5">
        <a href={`/visitor/${museumSlug}`} className="text-indigo-300 text-sm hover:text-white transition mb-4 block">
          ← Zurück zur Übersicht
        </a>
        <div className="flex items-start gap-3 mb-4">
          <div className="w-12 h-12 bg-indigo-500/20 border border-indigo-500/30 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0">
            🗺
          </div>
          <div>
            <h1 className="text-xl font-bold text-white leading-tight">{tour.title}</h1>
            <div className="flex items-center gap-3 mt-1 text-white/50 text-xs flex-wrap">
              <span>👥 {tour.audience_type}</span>
              <span>⏱ ca. {tour.estimated_duration_min} Min.</span>
              <span>🖼 {stops.length} Exponate</span>
            </div>
          </div>
        </div>

        {/* Progress */}
        <div className="bg-white/5 rounded-2xl p-3 border border-white/10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-white/60 font-medium">Fortschritt</span>
            <span className="text-xs text-indigo-300 font-bold">{completedStops.size} / {stops.length} besucht</span>
          </div>
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500"
              style={{ width: `${progress * 100}%` }} />
          </div>
          {completedStops.size === stops.length && stops.length > 0 && (
            <p className="text-center text-green-400 text-xs font-bold mt-2">🎉 Führung abgeschlossen!</p>
          )}
        </div>
      </div>

      {/* Tour Description */}
      {tour.description && (
        <div className="px-4 py-3">
          <p className="text-white/60 text-sm leading-relaxed">{tour.description}</p>
        </div>
      )}

      {/* Stops List */}
      <div className="px-4 pb-8 space-y-3">
        <p className="text-xs text-white/40 font-medium uppercase tracking-wide mb-3">Stationen</p>
        {stops.map((stop, i) => {
          const isCompleted = completedStops.has(i)
          const isActive = activeStop === i
          const artworkUrl = buildArtworkUrl(stop, i)

          return (
            <div key={stop.id}>
              {/* Connector Line */}
              {i > 0 && (
                <div className="flex justify-center my-1">
                  <div className={`w-0.5 h-4 rounded-full ${isCompleted ? 'bg-indigo-500' : 'bg-white/10'}`} />
                </div>
              )}

              <div
                className={`rounded-2xl border transition overflow-hidden ${
                  isCompleted
                    ? 'border-green-500/30 bg-green-500/5'
                    : isActive
                    ? 'border-indigo-400/50 bg-indigo-500/10'
                    : 'border-white/10 bg-white/5'
                }`}>
                <button
                  onClick={() => setActiveStop(isActive ? null : i)}
                  className="w-full flex items-center gap-3 p-3 text-left">
                  {/* Step Number / Status */}
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                    isCompleted
                      ? 'bg-green-500 text-white'
                      : isActive
                      ? 'bg-indigo-500 text-white'
                      : 'bg-white/10 text-white/50'
                  }`}>
                    {isCompleted ? '✓' : i + 1}
                  </div>

                  {/* Artwork Info */}
                  <div className="flex-1 min-w-0">
                    <p className={`font-semibold text-sm truncate ${isCompleted ? 'text-white/60' : 'text-white'}`}>
                      {stop.artwork?.title || 'Unbekanntes Werk'}
                    </p>
                    <p className="text-white/40 text-xs truncate">{stop.artwork?.artist_name}</p>
                  </div>

                  {/* Thumbnail */}
                  {stop.artwork?.image_url ? (
                    <img src={stop.artwork.image_url} alt={stop.artwork.title}
                      className="w-12 h-12 rounded-xl object-cover flex-shrink-0" />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-white/20 flex-shrink-0">
                      🖼
                    </div>
                  )}

                  <span className="text-white/30 text-xs">{isActive ? '▲' : '▼'}</span>
                </button>

                {/* Expanded Stop Details */}
                {isActive && (
                  <div className="px-4 pb-4 border-t border-white/10 pt-3">
                    {stop.artwork?.location && (
                      <div className="flex items-center gap-2 mb-2 text-white/50 text-xs">
                        <span>📍</span> {stop.artwork.location}
                      </div>
                    )}
                    {stop.location_hint && (
                      <div className="flex items-center gap-2 mb-3 bg-amber-500/10 border border-amber-500/20 rounded-xl px-3 py-2 text-amber-300 text-xs">
                        <span>🧭</span> {stop.location_hint}
                      </div>
                    )}
                    {stop.artwork?.year_created && (
                      <p className="text-white/40 text-xs mb-3">{stop.artwork.year_created}</p>
                    )}
                    <div className="flex gap-2">
                      <a
                        href={artworkUrl}
                        onClick={() => setCompletedStops(prev => new Set([...prev, i]))}
                        className="flex-1 py-2.5 rounded-xl bg-indigo-500 text-white text-sm font-semibold text-center hover:bg-indigo-400 transition">
                        Exponat ansehen →
                      </a>
                      {!isCompleted && (
                        <button
                          onClick={() => setCompletedStops(prev => new Set([...prev, i]))}
                          className="px-3 py-2.5 rounded-xl bg-white/10 text-white/60 text-xs hover:bg-white/15 transition"
                          title="Als besucht markieren">
                          ✓
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Start Button (if not started) */}
      {completedStops.size === 0 && stops.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-gray-950/95 backdrop-blur-sm border-t border-white/10 px-4 py-3">
          <a
            href={buildArtworkUrl(stops[0], 0)}
            onClick={() => setCompletedStops(new Set([0]))}
            className="block w-full py-4 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold text-center text-sm hover:from-indigo-400 hover:to-purple-500 transition shadow-lg">
            🚀 Führung starten — {stops[0]?.artwork?.title}
          </a>
        </div>
      )}
    </div>
  )
}
