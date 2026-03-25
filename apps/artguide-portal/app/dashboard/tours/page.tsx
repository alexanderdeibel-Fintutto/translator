'use client'
import { useState, useEffect } from 'react'

type Artwork = {
  id: string
  title: string
  artist_name: string
  year_created: string
  category: string
  description_standard?: Record<string, string>
}

type Tour = {
  id: string
  title: string
  description: string
  duration_minutes: number
  audience: string
  language: string
  artworks: Artwork[]
  intro_text: string
  outro_text: string
  thematic_thread: string
  status: 'draft' | 'published'
  type: 'ai_generated' | 'curated' | 'thematic'
  created_at: string
}

const AUDIENCES = [
  { id: 'general', label: 'Allgemeines Publikum', icon: '👥', desc: 'Fuer alle Besucher' },
  { id: 'children', label: 'Kinder (6-12)', icon: '🧒', desc: 'Spielerisch & einfach' },
  { id: 'youth', label: 'Jugendliche (13-17)', icon: '🧑', desc: 'Modern & direkt' },
  { id: 'expert', label: 'Kunstkenner', icon: '🎓', desc: 'Tiefgehend & fachlich' },
  { id: 'family', label: 'Familien', icon: '👨‍👩‍👧', desc: 'Fuer alle Altersgruppen' },
  { id: 'senior', label: 'Senioren (60+)', icon: '👴', desc: 'Ruhig & ausfuehrlich' },
]

const LANGUAGES = [
  { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'fr', label: 'Francais', flag: '🇫🇷' },
  { code: 'it', label: 'Italiano', flag: '🇮🇹' },
  { code: 'es', label: 'Espanol', flag: '🇪🇸' },
]

const CAT_ICONS: Record<string, string> = {
  painting: '🖼', sculpture: '🗿', installation: '💡', photography: '📷',
  drawing: '✏️', print: '🖨', textile: '🧵', ceramic: '🏺', other: '🎨',
}

export default function ToursPage() {
  const [view, setView] = useState<'list' | 'create' | 'detail'>('list')
  const [tours, setTours] = useState<Tour[]>([])
  const [artworks, setArtworks] = useState<Artwork[]>([])
  const [selectedAudience, setSelectedAudience] = useState('general')
  const [selectedLanguage, setSelectedLanguage] = useState('de')
  const [isGenerating, setIsGenerating] = useState(false)
  const [activeTour, setActiveTour] = useState<Tour | null>(null)
  const [dragItem, setDragItem] = useState<number | null>(null)
  const [dragOver, setDragOver] = useState<number | null>(null)

  useEffect(() => {
    fetch('/api/artworks').then(r => r.json()).then(d => setArtworks(d.artworks || [])).catch(() => {})
  }, [])

  const generateTour = async () => {
    if (artworks.length === 0) { alert('Keine Exponate vorhanden'); return }
    setIsGenerating(true)
    try {
      const audience = AUDIENCES.find(a => a.id === selectedAudience)?.label || 'Allgemeines Publikum'
      const language = LANGUAGES.find(l => l.code === selectedLanguage)?.label || 'Deutsch'
      const res = await fetch('/api/tours/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          artworks: artworks.map(a => ({ id: a.id, title: a.title, artist: a.artist_name, description: a.description_standard?.de || '' })),
          audience, language, tier: 'artguide_starter',
        }),
      })
      const data = await res.json()
      if (!data.success) { alert('Fehler: ' + data.error); return }
      const newTour: Tour = { id: 'tour-' + Date.now(), ...data.tour, status: 'draft', type: 'ai_generated', created_at: new Date().toISOString() }
      setActiveTour(newTour)
      setView('detail')
    } catch (err) { alert('Fehler: ' + err) }
    finally { setIsGenerating(false) }
  }

  const saveTour = () => {
    if (!activeTour) return
    setTours(prev => { const exists = prev.find(t => t.id === activeTour.id); return exists ? prev.map(t => t.id === activeTour.id ? activeTour : t) : [...prev, activeTour] })
    setView('list'); setActiveTour(null)
  }

  const handleDragStart = (idx: number) => setDragItem(idx)
  const handleDragEnter = (idx: number) => setDragOver(idx)
  const handleDragEnd = () => {
    if (dragItem === null || dragOver === null || !activeTour) { setDragItem(null); setDragOver(null); return }
    const items = [...activeTour.artworks]
    const [moved] = items.splice(dragItem, 1)
    items.splice(dragOver, 0, moved)
    setActiveTour({ ...activeTour, artworks: items })
    setDragItem(null); setDragOver(null)
  }

  const removeFromTour = (idx: number) => {
    if (!activeTour) return
    setActiveTour({ ...activeTour, artworks: activeTour.artworks.filter((_, i) => i !== idx) })
  }

  const addToTour = (artwork: Artwork) => {
    if (!activeTour || activeTour.artworks.find(a => a.id === artwork.id)) return
    setActiveTour({ ...activeTour, artworks: [...activeTour.artworks, artwork] })
  }

  if (view === 'list') return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Fuehrungen</h1>
          <p className="text-gray-500 mt-1">{tours.length} Fuehrungen · KI-generiert & kuratiert</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setView('create')} className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50 transition">+ Manuell erstellen</button>
          <button onClick={() => setView('create')} className="px-4 py-2 rounded-lg bg-amber-500 text-white text-sm font-medium hover:bg-amber-400 transition">🤖 KI-Fuehrung generieren</button>
        </div>
      </div>
      {tours.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <div className="text-5xl mb-4">🗺</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Noch keine Fuehrungen</h3>
          <p className="text-gray-500 text-sm mb-6 max-w-md mx-auto">Erstelle deine erste Fuehrung – manuell oder per KI. In weniger als 2 Minuten ist eine vollstaendige, zielgruppengerechte Fuehrung fertig.</p>
          <div className="flex gap-3 justify-center">
            <button onClick={() => setView('create')} className="px-6 py-3 rounded-xl bg-indigo-900 text-white font-medium hover:bg-indigo-800 transition">+ Erste Fuehrung erstellen</button>
            <button onClick={() => setView('create')} className="px-6 py-3 rounded-xl bg-amber-500 text-white font-medium hover:bg-amber-400 transition">🤖 KI generieren lassen</button>
          </div>
          <div className="mt-10 grid grid-cols-3 gap-4 text-left max-w-2xl mx-auto">
            {[
              { icon: '🎯', title: 'Zielgruppengerecht', desc: 'Kinder, Familien, Experten – die KI passt Sprache und Auswahl automatisch an' },
              { icon: '🌍', title: 'Mehrsprachig', desc: 'Automatische Uebersetzung in alle Sprachen dank Translator-Integration' },
              { icon: '🎭', title: 'Dramaturgisch', desc: 'Spannungsbogen, Intro, Uebergaenge – wie eine echte Fuehrung' },
            ].map(f => (
              <div key={f.title} className="p-4 bg-gray-50 rounded-xl">
                <div className="text-2xl mb-2">{f.icon}</div>
                <div className="font-medium text-gray-900 text-sm mb-1">{f.title}</div>
                <div className="text-xs text-gray-500">{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {tours.map(tour => (
            <div key={tour.id} className="bg-white rounded-xl border border-gray-200 p-5 hover:border-indigo-300 transition cursor-pointer"
              onClick={() => { setActiveTour(tour); setView('detail') }}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${tour.type === 'ai_generated' ? 'bg-amber-100 text-amber-700' : 'bg-indigo-100 text-indigo-700'}`}>
                    {tour.type === 'ai_generated' ? '🤖 KI-generiert' : '✋ Kuratiert'}
                  </span>
                  <h3 className="font-semibold text-gray-900 mt-2">{tour.title}</h3>
                  <p className="text-sm text-gray-500 mt-1 line-clamp-2">{tour.description}</p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${tour.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                  {tour.status === 'published' ? '✅ Live' : '📝 Entwurf'}
                </span>
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span>⏱ {tour.duration_minutes} Min.</span>
                <span>🖼 {tour.artworks?.length || 0} Werke</span>
                <span>👥 {tour.audience}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  )

  if (view === 'create') return (
    <>
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => setView('list')} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500">←</button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Neue Fuehrung erstellen</h1>
          <p className="text-gray-500 mt-1">KI generiert eine vollstaendige Fuehrung in Sekunden</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">1. Zielgruppe waehlen</h3>
          <div className="space-y-2">
            {AUDIENCES.map(a => (
              <div key={a.id} onClick={() => setSelectedAudience(a.id)}
                className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition border ${
                  selectedAudience === a.id ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 hover:border-gray-300'
                }`}>
                <span className="text-2xl">{a.icon}</span>
                <div><div className="font-medium text-gray-900 text-sm">{a.label}</div><div className="text-xs text-gray-500">{a.desc}</div></div>
                {selectedAudience === a.id && <span className="ml-auto text-indigo-500">✓</span>}
              </div>
            ))}
          </div>
        </div>
        <div>
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-4">
            <h3 className="font-semibold text-gray-900 mb-4">2. Sprache waehlen</h3>
            <div className="flex flex-wrap gap-2">
              {LANGUAGES.map(l => (
                <button key={l.code} onClick={() => setSelectedLanguage(l.code)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition border ${
                    selectedLanguage === l.code ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}>
                  <span>{l.flag}</span> {l.label}
                </button>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-4">
            <h3 className="font-semibold text-gray-900 mb-2">3. Verfuegbare Exponate</h3>
            <p className="text-sm text-gray-500 mb-3">{artworks.length} Exponate in der Sammlung</p>
            <div className="space-y-1 max-h-48 overflow-y-auto">
              {artworks.slice(0, 8).map(a => (
                <div key={a.id} className="flex items-center gap-2 p-2 rounded-lg bg-gray-50 text-sm">
                  <span>{CAT_ICONS[a.category] || '🎨'}</span>
                  <span className="font-medium text-gray-900 truncate flex-1">{a.title}</span>
                  <span className="text-gray-400 text-xs">{a.artist_name}</span>
                </div>
              ))}
              {artworks.length > 8 && <div className="text-center text-xs text-gray-400 py-2">+{artworks.length - 8} weitere...</div>}
            </div>
          </div>
          <div className="bg-gradient-to-br from-indigo-900 to-purple-900 rounded-xl p-6 text-white">
            <div className="text-3xl mb-3">🤖</div>
            <h3 className="font-bold text-lg mb-2">KI generiert deine Fuehrung</h3>
            <p className="text-indigo-200 text-sm mb-4">
              Zielgruppe: <strong className="text-white">{AUDIENCES.find(a => a.id === selectedAudience)?.label}</strong><br />
              Sprache: <strong className="text-white">{LANGUAGES.find(l => l.code === selectedLanguage)?.label}</strong><br />
              Exponate: <strong className="text-white">{artworks.length} verfuegbar</strong>
            </p>
            <button onClick={generateTour} disabled={isGenerating || artworks.length === 0}
              className="w-full py-3 rounded-xl bg-white text-indigo-900 font-bold hover:bg-indigo-50 transition disabled:opacity-50 flex items-center justify-center gap-2">
              {isGenerating ? <><span className="animate-spin">⚙️</span> Fuehrung wird generiert...</> : <><span>✨</span> Fuehrung jetzt generieren</>}
            </button>
          </div>
        </div>
      </div>
    </>
  )

  if (view === 'detail' && activeTour) return (
    <>
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => setView('list')} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500">←</button>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-gray-900">{activeTour.title}</h1>
            <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-xs font-medium">🤖 KI-generiert</span>
          </div>
          <p className="text-gray-500 mt-1">{activeTour.audience} · {activeTour.language} · {activeTour.duration_minutes} Min.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={saveTour} className="px-4 py-2 rounded-lg bg-indigo-900 text-white text-sm font-medium hover:bg-indigo-800 transition">💾 Speichern</button>
          <button className="px-4 py-2 rounded-lg bg-green-100 text-green-700 text-sm font-medium hover:bg-green-200 transition">✅ Veroeffentlichen</button>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg">👋</span>
              <h3 className="font-semibold text-gray-900">Intro-Text</h3>
              <span className="ml-auto text-xs text-gray-400">Wird am Anfang angezeigt</span>
            </div>
            <textarea value={activeTour.intro_text} onChange={e => setActiveTour({ ...activeTour, intro_text: e.target.value })}
              className="w-full p-3 rounded-lg border border-gray-200 text-sm text-gray-700 resize-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none" rows={3} />
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-lg">🖼</span>
              <h3 className="font-semibold text-gray-900">Exponate ({activeTour.artworks.length})</h3>
              <span className="ml-auto text-xs text-gray-400">Reihenfolge per Drag & Drop aendern</span>
            </div>
            <div className="space-y-2">
              {activeTour.artworks.map((artwork, idx) => (
                <div key={artwork.id} draggable
                  onDragStart={() => handleDragStart(idx)} onDragEnter={() => handleDragEnter(idx)}
                  onDragEnd={handleDragEnd} onDragOver={e => e.preventDefault()}
                  className={`flex items-center gap-3 p-3 rounded-lg border transition cursor-grab active:cursor-grabbing ${
                    dragOver === idx ? 'border-indigo-400 bg-indigo-50' : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                  }`}>
                  <span className="text-gray-400 cursor-grab select-none">⠇</span>
                  <span className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center justify-center flex-shrink-0">{idx + 1}</span>
                  <span className="text-lg">{CAT_ICONS[artwork.category] || '🎨'}</span>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 text-sm truncate">{artwork.title}</div>
                    <div className="text-xs text-gray-500">{artwork.artist_name} · {artwork.year_created}</div>
                  </div>
                  <button onClick={() => removeFromTour(idx)} className="p-1 rounded hover:bg-red-100 text-gray-400 hover:text-red-500 transition flex-shrink-0">✕</button>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg">🎬</span>
              <h3 className="font-semibold text-gray-900">Outro-Text</h3>
            </div>
            <textarea value={activeTour.outro_text} onChange={e => setActiveTour({ ...activeTour, outro_text: e.target.value })}
              className="w-full p-3 rounded-lg border border-gray-200 text-sm text-gray-700 resize-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none" rows={3} />
          </div>
        </div>
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-900 mb-3">Fuehrungs-Details</h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-500 block mb-1">Titel</label>
                <input value={activeTour.title} onChange={e => setActiveTour({ ...activeTour, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:border-indigo-500 outline-none" />
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">Dauer (Minuten)</label>
                <input type="number" value={activeTour.duration_minutes}
                  onChange={e => setActiveTour({ ...activeTour, duration_minutes: parseInt(e.target.value) || 45 })}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:border-indigo-500 outline-none" />
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">Thematischer Faden</label>
                <p className="text-sm text-gray-600 bg-amber-50 p-2 rounded-lg border border-amber-200">{activeTour.thematic_thread}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-900 mb-3">Exponate hinzufuegen</h3>
            <div className="space-y-1 max-h-64 overflow-y-auto">
              {artworks.filter(a => !activeTour.artworks.find(ta => ta.id === a.id)).map(artwork => (
                <div key={artwork.id} className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 cursor-pointer group" onClick={() => addToTour(artwork)}>
                  <span className="text-sm">{CAT_ICONS[artwork.category] || '🎨'}</span>
                  <span className="text-sm text-gray-700 flex-1 truncate">{artwork.title}</span>
                  <span className="text-indigo-500 opacity-0 group-hover:opacity-100 transition text-xs">+ hinzufuegen</span>
                </div>
              ))}
              {artworks.filter(a => !activeTour.artworks.find(ta => ta.id === a.id)).length === 0 && (
                <p className="text-xs text-gray-400 text-center py-4">Alle Exponate sind bereits in der Fuehrung</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )

  return null
}
