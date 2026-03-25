'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useSearchParams } from 'next/navigation'

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
type ChatMessage = { role: 'user' | 'assistant'; content: string; ts: number }

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
  { id: 'detailed', label: 'Vertieft', icon: '🔬', desc: 'Experte' },
  { id: 'children', label: 'Kinder', icon: '🧸', desc: '6-12 J.' },
  { id: 'youth', label: 'Jugend', icon: '🎮', desc: '13-17 J.' },
]

const SUGGESTED_QUESTIONS: Record<string, string[]> = {
  de: ['Was macht dieses Werk besonders?', 'Wer war der Künstler?', 'Welche Technik wurde verwendet?', 'Was soll das Bild ausdrücken?', 'Gibt es eine interessante Geschichte dazu?'],
  en: ['What makes this work special?', 'Who was the artist?', 'What technique was used?', 'What does the artwork express?', 'Is there an interesting story behind it?'],
  fr: ['Qu\'est-ce qui rend cette œuvre spéciale?', 'Qui était l\'artiste?', 'Quelle technique a été utilisée?'],
  es: ['¿Qué hace especial esta obra?', '¿Quién fue el artista?', '¿Qué técnica se utilizó?'],
  it: ['Cosa rende speciale quest\'opera?', 'Chi era l\'artista?', 'Quale tecnica è stata utilizzata?'],
}

export default function VisitorArtworkPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const museumSlug = params.museumSlug as string
  const artworkId = params.artworkId as string

  // Tour context from URL params
  const tourId = searchParams.get('tour')
  const tourStep = parseInt(searchParams.get('step') || '0')
  const tourTotal = parseInt(searchParams.get('total') || '0')
  const nextArtworkId = searchParams.get('next')
  const prevArtworkId = searchParams.get('prev')

  const [artwork, setArtwork] = useState<Artwork | null>(null)
  const [loading, setLoading] = useState(true)
  const [lang, setLang] = useState('de')
  const [mode, setMode] = useState<AudienceMode>('standard')
  const [showFacts, setShowFacts] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [audioProgress, setAudioProgress] = useState(0)
  const [audioDuration, setAudioDuration] = useState(0)
  const [showLangPicker, setShowLangPicker] = useState(false)

  // Buddy Chat State
  const [showBuddy, setShowBuddy] = useState(false)
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [chatInput, setChatInput] = useState('')
  const [chatLoading, setChatLoading] = useState(false)
  const [buddyGreeted, setBuddyGreeted] = useState(false)

  const audioRef = useRef<HTMLAudioElement | null>(null)
  const startTimeRef = useRef<number>(Date.now())
  const chatEndRef = useRef<HTMLDivElement | null>(null)

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

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatMessages])

  // Buddy greeting when opened
  const openBuddy = useCallback(() => {
    setShowBuddy(true)
    if (!buddyGreeted && artwork) {
      const greetings: Record<string, string> = {
        de: `Hallo! Ich bin Buddy, dein persönlicher Kunstführer. 👋\n\nIch freue mich, dir **"${artwork.title}"** von ${artwork.artist_name} näherzubringen. Was möchtest du wissen?`,
        en: `Hi there! I'm Buddy, your personal art guide. 👋\n\nI'm excited to tell you more about **"${artwork.title}"** by ${artwork.artist_name}. What would you like to know?`,
        fr: `Bonjour! Je suis Buddy, votre guide artistique personnel. 👋\n\nJe suis ravi de vous présenter **"${artwork.title}"** de ${artwork.artist_name}. Que souhaitez-vous savoir?`,
        es: `¡Hola! Soy Buddy, tu guía de arte personal. 👋\n\nEstoy emocionado de contarte más sobre **"${artwork.title}"** de ${artwork.artist_name}. ¿Qué te gustaría saber?`,
        it: `Ciao! Sono Buddy, la tua guida artistica personale. 👋\n\nSono felice di presentarti **"${artwork.title}"** di ${artwork.artist_name}. Cosa vorresti sapere?`,
      }
      setChatMessages([{
        role: 'assistant',
        content: greetings[lang] || greetings.de,
        ts: Date.now(),
      }])
      setBuddyGreeted(true)
    }
  }, [artwork, buddyGreeted, lang])

  const sendMessage = async (text?: string) => {
    const msg = text || chatInput.trim()
    if (!msg || !artwork) return
    setChatInput('')
    const userMsg: ChatMessage = { role: 'user', content: msg, ts: Date.now() }
    setChatMessages(prev => [...prev, userMsg])
    setChatLoading(true)
    try {
      const res = await fetch('/api/visitor/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: msg,
          artwork,
          lang,
          mode,
          history: chatMessages.slice(-6).map(m => ({ role: m.role, content: m.content })),
        }),
      })
      const data = await res.json()
      setChatMessages(prev => [...prev, { role: 'assistant', content: data.reply, ts: Date.now() }])
    } catch {
      setChatMessages(prev => [...prev, { role: 'assistant', content: '😔 Entschuldigung, ich konnte gerade keine Antwort generieren. Bitte versuche es erneut.', ts: Date.now() }])
    } finally {
      setChatLoading(false)
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
  const suggestedQs = SUGGESTED_QUESTIONS[lang] || SUGGESTED_QUESTIONS.de

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-gray-950/90 backdrop-blur-sm border-b border-white/10 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <a href={`/visitor/${museumSlug}`} className="text-white/50 hover:text-white transition text-sm">← Zurück</a>
        </div>
        <div className="flex items-center gap-2">
          {/* Language Picker */}
          <div className="relative">
            <button onClick={() => setShowLangPicker(!showLangPicker)}
              className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white/10 text-xs font-medium hover:bg-white/20 transition">
              {LANGUAGES.find(l => l.code === lang)?.flag} {lang.toUpperCase()} ▾
            </button>
            {showLangPicker && (
              <div className="absolute right-0 top-full mt-1 bg-gray-800 rounded-xl border border-white/10 overflow-hidden shadow-xl z-50 min-w-[100px]">
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

      {/* Tour Progress Bar */}
      {tourId && tourTotal > 0 && (
        <div className="bg-indigo-900/50 border-b border-indigo-700/30 px-4 py-2">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-indigo-300 font-medium">🗺 Führung — Exponat {tourStep + 1} von {tourTotal}</span>
            <span className="text-xs text-indigo-400">{Math.round(((tourStep + 1) / tourTotal) * 100)}%</span>
          </div>
          <div className="h-1 bg-indigo-900 rounded-full overflow-hidden">
            <div className="h-full bg-indigo-400 rounded-full transition-all"
              style={{ width: `${((tourStep + 1) / tourTotal) * 100}%` }} />
          </div>
        </div>
      )}

      {/* Artwork Image */}
      <div className="relative aspect-[4/3] bg-gray-900 overflow-hidden">
        {artwork.image_url ? (
          <img src={artwork.image_url} alt={artwork.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-950 to-gray-900">
            <div className="text-center text-white/20">
              <div className="text-7xl mb-2">🖼</div>
              <p className="text-sm">Kein Bild verfügbar</p>
            </div>
          </div>
        )}
        {artwork.is_highlight && (
          <div className="absolute top-3 left-3 px-2 py-1 bg-amber-500 text-amber-950 text-xs font-bold rounded-full">
            ⭐ Highlight
          </div>
        )}
        {/* Buddy Floating Button */}
        <button onClick={openBuddy}
          className="absolute bottom-3 right-3 w-12 h-12 bg-indigo-500 hover:bg-indigo-400 rounded-full shadow-lg flex items-center justify-center text-xl transition active:scale-95">
          🤖
        </button>
      </div>

      {/* Main Content */}
      <div className="px-4 pt-5 pb-32">
        {/* Title Block */}
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-white leading-tight">{artwork.title}</h1>
          <p className="text-indigo-300 font-medium mt-1">{artwork.artist_name}</p>
          <div className="flex items-center gap-3 mt-2 text-white/50 text-sm flex-wrap">
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
                  <span>🎙 Audio-Guide</span>
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
            <div>
              <p className="text-sm font-medium text-white/60">Audio-Guide</p>
              <p className="text-xs">Wird vom Museum vorbereitet</p>
            </div>
          </div>
        )}

        {/* Audience Mode Selector */}
        <div className="mb-4">
          <p className="text-xs text-white/40 mb-2 font-medium uppercase tracking-wide">Ansicht wählen</p>
          <div className="flex gap-2 overflow-x-auto pb-1">
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
            Kein Text für diese Ansicht verfügbar
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

        {/* Buddy CTA (if not open) */}
        {!showBuddy && (
          <button onClick={openBuddy}
            className="w-full mb-4 py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold text-sm hover:from-indigo-500 hover:to-purple-500 transition flex items-center justify-center gap-2 shadow-lg">
            <span className="text-xl">🤖</span>
            <div className="text-left">
              <p className="font-bold">Buddy fragen</p>
              <p className="text-white/70 text-xs font-normal">KI-Kunstführer — stell jede Frage</p>
            </div>
          </button>
        )}

        {/* Tags */}
        {artwork.tags && artwork.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {artwork.tags.map(tag => (
              <span key={tag} className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs text-white/50">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Tour Navigation Footer */}
      {tourId && tourTotal > 0 ? (
        <div className="fixed bottom-0 left-0 right-0 bg-gray-950/95 backdrop-blur-sm border-t border-white/10 px-4 py-3 flex gap-3">
          {prevArtworkId ? (
            <a href={`/visitor/${museumSlug}/${prevArtworkId}?tour=${tourId}&step=${tourStep - 1}&total=${tourTotal}${nextArtworkId ? `&next=${artworkId}` : ''}&prev=${prevArtworkId}`}
              className="flex-1 py-3 rounded-xl bg-white/10 text-white/70 text-sm font-medium hover:bg-white/15 transition flex items-center justify-center gap-1">
              ← Vorheriges
            </a>
          ) : (
            <a href={`/visitor/${museumSlug}`}
              className="flex-1 py-3 rounded-xl bg-white/10 text-white/60 text-sm font-medium hover:bg-white/15 transition flex items-center justify-center gap-1">
              🏛 Übersicht
            </a>
          )}
          {nextArtworkId ? (
            <a href={`/visitor/${museumSlug}/${nextArtworkId}?tour=${tourId}&step=${tourStep + 1}&total=${tourTotal}&prev=${artworkId}`}
              className="flex-[2] py-3 rounded-xl bg-indigo-500 text-white text-sm font-semibold hover:bg-indigo-400 transition flex items-center justify-center gap-2">
              Weiter → <span className="text-indigo-200 text-xs">({tourStep + 2}/{tourTotal})</span>
            </a>
          ) : (
            <a href={`/visitor/${museumSlug}?tour_complete=1`}
              className="flex-[2] py-3 rounded-xl bg-green-500 text-white text-sm font-semibold hover:bg-green-400 transition flex items-center justify-center gap-2">
              ✅ Führung abgeschlossen!
            </a>
          )}
        </div>
      ) : (
        <div className="fixed bottom-0 left-0 right-0 bg-gray-950/95 backdrop-blur-sm border-t border-white/10 px-4 py-3 flex gap-3">
          <a href={`/visitor/${museumSlug}`}
            className="flex-1 py-3 rounded-xl bg-white/10 text-white/60 text-sm font-medium hover:bg-white/15 transition flex items-center justify-center gap-2">
            ← Zurück
          </a>
          <a href={`/visitor/${museumSlug}`}
            className="flex-1 py-3 rounded-xl bg-indigo-500 text-white text-sm font-medium hover:bg-indigo-400 transition flex items-center justify-center gap-2">
            🗺 Führung starten
          </a>
        </div>
      )}

      {/* Buddy Chat Overlay */}
      {showBuddy && (
        <div className="fixed inset-0 z-50 flex flex-col bg-gray-950">
          {/* Chat Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-gray-900 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-lg">🤖</div>
              <div>
                <p className="font-bold text-white text-sm">Buddy</p>
                <p className="text-xs text-indigo-300">KI-Kunstführer · {artwork.title}</p>
              </div>
            </div>
            <button onClick={() => setShowBuddy(false)}
              className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/60 hover:bg-white/20 transition">
              ✕
            </button>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
            {chatMessages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'assistant' && (
                  <div className="w-7 h-7 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-sm mr-2 flex-shrink-0 mt-0.5">🤖</div>
                )}
                <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-indigo-500 text-white rounded-br-sm'
                    : 'bg-white/10 text-white/90 rounded-bl-sm'
                }`}>
                  {msg.content.split('\n').map((line, j) => (
                    <span key={j}>
                      {line.split(/\*\*(.*?)\*\*/g).map((part, k) =>
                        k % 2 === 1 ? <strong key={k}>{part}</strong> : part
                      )}
                      {j < msg.content.split('\n').length - 1 && <br />}
                    </span>
                  ))}
                </div>
              </div>
            ))}
            {chatLoading && (
              <div className="flex justify-start">
                <div className="w-7 h-7 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-sm mr-2 flex-shrink-0">🤖</div>
                <div className="bg-white/10 rounded-2xl rounded-bl-sm px-4 py-3">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Suggested Questions */}
          {chatMessages.length <= 1 && (
            <div className="px-4 pb-2">
              <p className="text-xs text-white/30 mb-2">Vorschläge:</p>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {suggestedQs.slice(0, 4).map((q, i) => (
                  <button key={i} onClick={() => sendMessage(q)}
                    className="flex-shrink-0 px-3 py-2 bg-white/10 border border-white/10 rounded-xl text-xs text-white/70 hover:bg-white/15 transition whitespace-nowrap">
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Chat Input */}
          <div className="px-4 pb-6 pt-2 bg-gray-900 border-t border-white/10">
            <div className="flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                placeholder="Frag Buddy etwas..."
                className="flex-1 bg-white/10 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-indigo-400"
                disabled={chatLoading}
              />
              <button onClick={() => sendMessage()} disabled={!chatInput.trim() || chatLoading}
                className="w-12 h-12 bg-indigo-500 hover:bg-indigo-400 disabled:opacity-40 rounded-xl flex items-center justify-center text-lg transition">
                ➤
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
