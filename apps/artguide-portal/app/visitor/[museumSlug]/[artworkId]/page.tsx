'use client'
import { useState, useEffect, useRef } from 'react'
import { useParams } from 'next/navigation'

type AudienceMode = 'standard' | 'children' | 'youth' | 'brief' | 'detailed'
type Artwork = {
  id: string
  title: string
  artist_name: string
  year_created: string
  medium: string
  dimensions: string
  location: string
  image_url: string | null
  audio_url: string | null
  category: string
  is_highlight: boolean
  description_brief: string | null
  description_standard: string | null
  description_detailed: string | null
  description_children: string | null
  description_youth: string | null
  fun_facts: string[]
  tags: string[]
}

const LANGUAGES = [
  { code: 'de', label: 'DE', flag: '🇩🇪' },
  { code: 'en', label: 'EN', flag: '🇬🇧' },
  { code: 'fr', label: 'FR', flag: '🇫🇷' },
  { code: 'es', label: 'ES', flag: '🇪🇸' },
  { code: 'it', label: 'IT', flag: '🇮🇹' },
]

const AUDIENCE_MODES: { id: AudienceMode; label: string; icon: string; desc: string }[] = [
  { id: 'brief', label: 'Kurz', icon: '⚡', desc: '1 Satz' },
  { id: 'standard', label: 'Standard', icon: '📖', desc: 'Volltext' },
  { id: 'detailed', label: 'Vertieft', icon: '🔬', desc: 'Expertenwissen' },
  { id: 'children', label: 'Kinder', icon: '🧸', desc: '6-12 Jahre' },
  { id: 'youth', label: 'Jugend', icon: '🎮', desc: '13-17 Jahre' },
]

export default function VisitorArtworkPage() {
  const params = useParams()
  const museumSlug = params.museumSlug as string
  const artworkId = params.artworkId as string

  const [artwork, setArtwork] = useState<Artwork | null>(null)
  const [loading, setLoading] = useState(true)
  const [lang, setLang] = useState('de')
  const [mode, setMode] = useState<AudienceMode>('standard')
  const [showFacts, setShowFacts] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [audioProgress, setAudioProgress] = useState(0)
  const [audioDuration, setAudioDuration] = useState(0)
  const [showLangPicker, setShowLangPicker] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const startTimeRef = useRef<number>(Date.now())

  useEffect(() => {
    setLoading(true)
    fetch(`/api/visitor?museum=${museumSlug}&artwork=${artworkId}&lang=${lang}`)
      .then(r => r.json())
      .then(d => setArtwork(d.artwork || null))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [museumSlug, artworkId, lang])

  // Track visit on unmount
  useEffect(() => {
    return () => {
      const duration = Math.round((Date.now() - startTimeRef.current) / 1000)
      fetch('/api/visitor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event: 'artwork_view', artwork_id: artworkId, museum_slug: museumSlug, duration_seconds: duration, lang }),
      }).catch(() => {})
    }
  }, [artworkId, museumSlug, lang])

  const getDescription = () => {
    if (!artwork) return ''
    switch (mode) {
      case 'brief': return artwork.description_brief || artwork.description_standard || ''
      case 'children': return artwork.description_children || artwork.description_standard || ''
      case 'youth': return artwork.description_youth || artwork.description_standard || ''
      case 'detailed': return artwork.description_detailed || artwork.description_standard || ''
      default: return artwork.description_standard || ''
    }
  }

  const toggleAudio = () => {
    if (!audioRef.current) return
    if (isPlaying) {
      audioRef.current.pause()
    } else {
      audioRef.current.play()
      fetch('/api/visitor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event: 'audio_play', artwork_id: artworkId, museum_slug: museumSlug, lang }),
      }).catch(() => {})
    }
    setIsPlaying(!isPlaying)
  }

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60)
    const sec = Math.floor(s % 60)
    return `${m}:${sec.toString().padStart(2, '0')}`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="w-12 h-12 border-2 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white/60 text-sm">Lade Exponat...</p>
        </div>
      </div>
    )
  }

  if (!artwork) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-6">
        <div className="text-center text-white">
          <div className="text-5xl mb-4">🔍</div>
          <h2 className="text-xl font-bold mb-2">Exponat nicht gefunden</h2>
          <p className="text-white/60 text-sm">Bitte scannen Sie den QR-Code erneut.</p>
        </div>
      </div>
    )
  }

  const description = getDescription()

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-gray-950/90 backdrop-blur-sm border-b border-white/10 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-indigo-500 rounded-md flex items-center justify-center text-xs font-bold">A</div>
          <span className="text-sm font-medium text-white/80">Art Guide</span>
        </div>
        <div className="flex items-center gap-2">
          {/* Language Picker */}
          <div className="relative">
            <button onClick={() => setShowLangPicker(!showLangPicker)}
              className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white/10 text-xs font-medium hover:bg-white/20 transition">
              {LANGUAGES.find(l => l.code === lang)?.flag} {lang.toUpperCase()}
            </button>
            {showLangPicker && (
              <div className="absolute right-0 top-full mt-1 bg-gray-800 rounded-xl border border-white/10 overflow-hidden shadow-xl z-50">
                {LANGUAGES.map(l => (
                  <button key={l.code} onClick={() => { setLang(l.code); setShowLangPicker(false) }}
                    className={`flex items-center gap-2 w-full px-4 py-2.5 text-sm hover:bg-white/10 transition ${lang === l.code ? 'bg-white/10 text-indigo-400' : 'text-white/80'}`}>
                    <span>{l.flag}</span> {l.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Artwork Image */}
      <div className="relative aspect-[4/3] bg-gray-900 overflow-hidden">
        {artwork.image_url ? (
          <img src={artwork.image_url} alt={artwork.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-950 to-gray-900">
            <div className="text-center text-white/30">
              <div className="text-6xl mb-2">🖼</div>
              <p className="text-sm">Kein Bild verfuegbar</p>
            </div>
          </div>
        )}
        {artwork.is_highlight && (
          <div className="absolute top-3 left-3 px-2 py-1 bg-amber-500 text-amber-950 text-xs font-bold rounded-full">
            ⭐ Highlight
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="px-4 pt-5 pb-24">
        {/* Title Block */}
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-white leading-tight">{artwork.title}</h1>
          <p className="text-indigo-300 font-medium mt-1">{artwork.artist_name}</p>
          <div className="flex items-center gap-3 mt-2 text-white/50 text-sm">
            {artwork.year_created && <span>{artwork.year_created}</span>}
            {artwork.medium && <span>· {artwork.medium}</span>}
            {artwork.dimensions && <span>· {artwork.dimensions}</span>}
          </div>
          {artwork.location && (
            <div className="flex items-center gap-1 mt-2 text-white/40 text-xs">
              <span>📍</span> {artwork.location}
            </div>
          )}
        </div>

        {/* Audio Player */}
        {artwork.audio_url ? (
          <div className="bg-white/5 rounded-2xl p-4 mb-5 border border-white/10">
            <audio
              ref={audioRef}
              src={artwork.audio_url}
              onTimeUpdate={e => setAudioProgress((e.target as HTMLAudioElement).currentTime)}
              onLoadedMetadata={e => setAudioDuration((e.target as HTMLAudioElement).duration)}
              onEnded={() => setIsPlaying(false)}
            />
            <div className="flex items-center gap-4">
              <button onClick={toggleAudio}
                className="w-12 h-12 rounded-full bg-indigo-500 hover:bg-indigo-400 flex items-center justify-center text-xl transition flex-shrink-0">
                {isPlaying ? '⏸' : '▶'}
              </button>
              <div className="flex-1">
                <div className="flex justify-between text-xs text-white/40 mb-1.5">
                  <span>Audio-Guide</span>
                  <span>{formatTime(audioProgress)} / {formatTime(audioDuration)}</span>
                </div>
                <div className="h-1.5 bg-white/10 rounded-full overflow-hidden cursor-pointer"
                  onClick={e => {
                    if (!audioRef.current || !audioDuration) return
                    const rect = (e.target as HTMLElement).getBoundingClientRect()
                    const pct = (e.clientX - rect.left) / rect.width
                    audioRef.current.currentTime = pct * audioDuration
                  }}>
                  <div className="h-full bg-indigo-400 rounded-full transition-all"
                    style={{ width: audioDuration > 0 ? `${(audioProgress / audioDuration) * 100}%` : '0%' }} />
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white/5 rounded-2xl p-4 mb-5 border border-white/10 flex items-center gap-3 text-white/40">
            <span className="text-2xl">🎙</span>
            <span className="text-sm">Audio-Guide wird vorbereitet...</span>
          </div>
        )}

        {/* Audience Mode Selector */}
        <div className="mb-4">
          <p className="text-xs text-white/40 mb-2 font-medium uppercase tracking-wide">Fuer wen moechtest du lesen?</p>
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {AUDIENCE_MODES.map(m => (
              <button key={m.id} onClick={() => setMode(m.id)}
                className={`flex-shrink-0 flex flex-col items-center px-3 py-2 rounded-xl text-xs transition border ${
                  mode === m.id
                    ? 'bg-indigo-500 border-indigo-400 text-white'
                    : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
                }`}>
                <span className="text-base mb-0.5">{m.icon}</span>
                <span className="font-medium">{m.label}</span>
                <span className="text-white/40 text-[10px]">{m.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Description */}
        {description ? (
          <div className="bg-white/5 rounded-2xl p-4 mb-4 border border-white/10">
            <p className="text-white/85 leading-relaxed text-[15px] whitespace-pre-line">{description}</p>
          </div>
        ) : (
          <div className="bg-white/5 rounded-2xl p-4 mb-4 border border-white/10 text-white/30 text-sm text-center">
            Kein Text fuer diese Ansicht verfuegbar
          </div>
        )}

        {/* Fun Facts */}
        {artwork.fun_facts && artwork.fun_facts.length > 0 && (
          <div className="mb-4">
            <button onClick={() => setShowFacts(!showFacts)}
              className="w-full flex items-center justify-between px-4 py-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-amber-300 text-sm font-medium hover:bg-amber-500/20 transition">
              <span>💡 {artwork.fun_facts.length} Wissenswertes</span>
              <span className="text-white/40">{showFacts ? '▲' : '▼'}</span>
            </button>
            {showFacts && (
              <div className="mt-2 space-y-2">
                {artwork.fun_facts.map((fact, i) => (
                  <div key={i} className="flex gap-3 bg-amber-500/5 border border-amber-500/10 rounded-xl px-4 py-3">
                    <span className="text-amber-400 font-bold text-sm flex-shrink-0">{i + 1}.</span>
                    <p className="text-white/75 text-sm leading-relaxed">{fact}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tags */}
        {artwork.tags && artwork.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {artwork.tags.map(tag => (
              <span key={tag} className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs text-white/50">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-gray-950/95 backdrop-blur-sm border-t border-white/10 px-4 py-3 flex gap-3">
        <button className="flex-1 py-3 rounded-xl bg-white/10 text-white/60 text-sm font-medium hover:bg-white/15 transition flex items-center justify-center gap-2">
          ← Zurueck
        </button>
        <button className="flex-1 py-3 rounded-xl bg-indigo-500 text-white text-sm font-medium hover:bg-indigo-400 transition flex items-center justify-center gap-2">
          Fuehrung starten 🗺
        </button>
      </div>
    </div>
  )
}
