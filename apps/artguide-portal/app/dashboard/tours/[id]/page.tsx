'use client'
import { useState, use, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase-client'
import { useMuseum } from '@/lib/hooks'
import type { Artwork, Tour, Lang } from '@/lib/types'

const AUDIENCES = [
  { id: 'general', label: 'Allgemeines Publikum', icon: '👥', descField: 'description_standard' },
  { id: 'children', label: 'Kinder (6–12)', icon: '🧒', descField: 'description_children' },
  { id: 'youth', label: 'Jugendliche (13–17)', icon: '🧑', descField: 'description_youth' },
  { id: 'expert', label: 'Kunstkenner', icon: '🎓', descField: 'description_detailed' },
  { id: 'family', label: 'Familien', icon: '👨‍👩‍👧', descField: 'description_standard' },
  { id: 'senior', label: 'Senioren (60+)', icon: '👴', descField: 'description_brief' },
  { id: 'accessibility', label: 'Barrierefrei', icon: '♿', descField: 'description_brief' },
]

const LANGUAGES: { code: Lang; label: string; flag: string }[] = [
  { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'it', label: 'Italiano', flag: '🇮🇹' },
  { code: 'es', label: 'Español', flag: '🇪🇸' },
  { code: 'zh', label: '中文', flag: '🇨🇳' },
  { code: 'ja', label: '日本語', flag: '🇯🇵' },
]

function t(value: unknown, lang: Lang = 'de'): string {
  if (!value) return ''
  if (typeof value === 'string') return value
  if (typeof value === 'object') {
    const obj = value as Record<string, string>
    return obj[lang] || obj['de'] || obj['en'] || Object.values(obj)[0] || ''
  }
  return String(value)
}

type TourStop = {
  id: string
  stop_number: number
  artwork_id: string
  custom_intro?: string
  custom_outro?: string
  duration_seconds?: number
  artwork?: Artwork
}

type TourDetail = Tour & {
  stops: TourStop[]
}

export default function TourDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { museum } = useMuseum()
  const supabase = createClient()

  const [tour, setTour] = useState<TourDetail | null>(null)
  const [allArtworks, setAllArtworks] = useState<Artwork[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [activeTab, setActiveTab] = useState<'stops' | 'settings' | 'preview'>('stops')
  const [activeAudience, setActiveAudience] = useState('general')
  const [activeLanguage, setActiveLanguage] = useState<Lang>('de')
  const [previewStop, setPreviewStop] = useState(0)
  const [dragItem, setDragItem] = useState<number | null>(null)
  const [dragOver, setDragOver] = useState<number | null>(null)
  const [showAddArtwork, setShowAddArtwork] = useState(false)
  const [artworkSearch, setArtworkSearch] = useState('')
  const [isGeneratingIntros, setIsGeneratingIntros] = useState(false)
  const [generatingStopId, setGeneratingStopId] = useState<string | null>(null)
  const [form, setForm] = useState<Partial<Tour>>({})

  useEffect(() => {
    if (museum?.id) { loadTour(); loadArtworks() }
  }, [museum?.id, id])

  async function loadTour() {
    setLoading(true)
    const { data } = await supabase
      .from('ag_tours')
      .select('*, ag_tour_stops(id, stop_number, artwork_id, custom_intro, custom_outro, duration_seconds, ag_artworks(*))')
      .eq('id', id)
      .single()
    if (data) {
      const stops = (data.ag_tour_stops || [])
        .sort((a: any, b: any) => a.stop_number - b.stop_number)
        .map((s: any) => ({ ...s, artwork: s.ag_artworks }))
      setTour({ ...data, stops })
      setForm(data)
    }
    setLoading(false)
  }

  async function loadArtworks() {
    const { data } = await supabase
      .from('ag_artworks')
      .select('id, title, artist_name, year_created, image_url, description_standard, description_children, description_youth, description_detailed, description_brief, status')
      .eq('museum_id', museum!.id)
      .order('sort_order')
    if (data) setAllArtworks(data as Artwork[])
  }

  const saveTour = async () => {
    setSaving(true)
    const { error } = await supabase
      .from('ag_tours')
      .update({
        title: form.title,
        description: form.description,
        target_audience: form.target_audience,
        duration_minutes: form.duration_minutes,
        difficulty_level: form.difficulty_level,
        tags: form.tags,
        status: form.status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
    if (!error) { setSaved(true); setTimeout(() => setSaved(false), 2000) }
    setSaving(false)
  }

  // Drag & Drop reorder
  const handleDragStart = (index: number) => setDragItem(index)
  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    setDragOver(index)
  }
  const handleDrop = async (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault()
    if (dragItem === null || dragItem === dropIndex || !tour) return
    const newStops = [...tour.stops]
    const [moved] = newStops.splice(dragItem, 1)
    newStops.splice(dropIndex, 0, moved)
    const reordered = newStops.map((s, i) => ({ ...s, stop_number: i + 1 }))
    setTour({ ...tour, stops: reordered })
    setDragItem(null)
    setDragOver(null)
    // Persist new order
    await Promise.all(reordered.map(s =>
      supabase.from('ag_tour_stops').update({ stop_number: s.stop_number }).eq('id', s.id)
    ))
  }

  const addArtworkToTour = async (artwork: Artwork) => {
    if (!tour) return
    const stopNumber = tour.stops.length + 1
    const { data: newStop } = await supabase
      .from('ag_tour_stops')
      .insert({ tour_id: id, artwork_id: artwork.id, stop_number: stopNumber })
      .select()
      .single()
    if (newStop) {
      setTour(prev => prev ? { ...prev, stops: [...prev.stops, { ...newStop, artwork }] } : prev)
    }
    setShowAddArtwork(false)
    setArtworkSearch('')
  }

  const removeStop = async (stopId: string) => {
    if (!tour) return
    await supabase.from('ag_tour_stops').delete().eq('id', stopId)
    const remaining = tour.stops.filter(s => s.id !== stopId)
    const reordered = remaining.map((s, i) => ({ ...s, stop_number: i + 1 }))
    setTour({ ...tour, stops: reordered })
    await Promise.all(reordered.map(s =>
      supabase.from('ag_tour_stops').update({ stop_number: s.stop_number }).eq('id', s.id)
    ))
  }

  const generateStopIntro = async (stop: TourStop) => {
    setGeneratingStopId(stop.id)
    try {
      const audience = AUDIENCES.find(a => a.id === activeAudience)?.label || 'Allgemeines Publikum'
      const artworkTitle = t(stop.artwork?.title, activeLanguage)
      const artworkDesc = t((stop.artwork as any)?.[AUDIENCES.find(a => a.id === activeAudience)?.descField || 'description_standard'], activeLanguage)
      const res = await fetch('/api/artguide-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generate_tour_intro',
          artwork_title: artworkTitle,
          artwork_description: artworkDesc,
          audience,
          language: activeLanguage,
          stop_number: stop.stop_number,
          total_stops: tour?.stops.length,
        }),
      })
      const data = await res.json()
      if (data.intro) {
        await supabase.from('ag_tour_stops').update({ custom_intro: data.intro }).eq('id', stop.id)
        setTour(prev => prev ? {
          ...prev,
          stops: prev.stops.map(s => s.id === stop.id ? { ...s, custom_intro: data.intro } : s)
        } : prev)
      }
    } catch {}
    finally { setGeneratingStopId(null) }
  }

  const generateAllIntros = async () => {
    if (!tour) return
    setIsGeneratingIntros(true)
    for (const stop of tour.stops) {
      await generateStopIntro(stop)
    }
    setIsGeneratingIntros(false)
  }

  const publishTour = async () => {
    await supabase.from('ag_tours').update({ status: 'published' }).eq('id', id)
    setForm(prev => ({ ...prev, status: 'published' as any }))
    setTour(prev => prev ? { ...prev, status: 'published' as any } : prev)
  }

  const audienceConf = AUDIENCES.find(a => a.id === activeAudience) || AUDIENCES[0]
  const previewArtwork = tour?.stops[previewStop]?.artwork
  const previewText = previewArtwork
    ? t((previewArtwork as any)[audienceConf.descField], activeLanguage)
    : ''
  const previewIntro = tour?.stops[previewStop]?.custom_intro || ''

  const filteredArtworks = allArtworks.filter(aw => {
    const inTour = tour?.stops.some(s => s.artwork_id === aw.id)
    if (inTour) return false
    if (!artworkSearch) return true
    const title = t(aw.title, 'de').toLowerCase()
    return title.includes(artworkSearch.toLowerCase()) || (aw.artist_name || '').toLowerCase().includes(artworkSearch.toLowerCase())
  })

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600" />
    </div>
  )
  if (!tour) return (
    <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-red-700">
      <p className="font-semibold">Führung nicht gefunden</p>
      <Link href="/dashboard/tours" className="text-sm underline mt-2 inline-block">← Zurück</Link>
    </div>
  )

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/tours" className="p-2 rounded-lg hover:bg-gray-100 transition text-gray-500 text-sm">← Zurück</Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{t(tour.title, activeLanguage)}</h1>
            <p className="text-gray-500 text-sm mt-0.5">{tour.stops.length} Stationen · {tour.duration_minutes || '?'} Min.</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {form.status !== 'published' && (
            <button onClick={publishTour} className="px-4 py-2 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-500 transition">
              🚀 Veröffentlichen
            </button>
          )}
          <button onClick={saveTour} disabled={saving} className="px-4 py-2 rounded-lg bg-indigo-900 text-white text-sm font-medium hover:bg-indigo-800 transition disabled:opacity-50">
            {saved ? '✓ Gespeichert' : saving ? '...' : 'Speichern'}
          </button>
        </div>
      </div>

      {/* Audience & Language Bar */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6 flex items-center gap-4 flex-wrap">
        <div>
          <p className="text-xs text-gray-500 mb-1.5 font-medium">Zielgruppe</p>
          <div className="flex gap-1.5 flex-wrap">
            {AUDIENCES.map(a => (
              <button key={a.id} onClick={() => setActiveAudience(a.id)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${activeAudience === a.id ? 'bg-indigo-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                {a.icon} {a.label}
              </button>
            ))}
          </div>
        </div>
        <div className="ml-auto">
          <p className="text-xs text-gray-500 mb-1.5 font-medium">Sprache</p>
          <div className="flex gap-1.5">
            {LANGUAGES.map(l => (
              <button key={l.code} onClick={() => setActiveLanguage(l.code)} className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition ${activeLanguage === l.code ? 'bg-indigo-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                {l.flag} {l.code.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-lg w-fit">
        {([['stops', '🗺 Stationen'], ['settings', '⚙️ Einstellungen'], ['preview', '👁 Live-Vorschau']] as const).map(([tab, label]) => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-2 rounded-md text-sm font-medium transition ${activeTab === tab ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
            {label}
          </button>
        ))}
      </div>

      {activeTab === 'stops' && (
        <div className="grid grid-cols-3 gap-6">
          {/* Stop List */}
          <div className="col-span-2 space-y-3">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-gray-900">{tour.stops.length} Stationen</h3>
              <div className="flex gap-2">
                <button onClick={generateAllIntros} disabled={isGeneratingIntros || tour.stops.length === 0} className="px-3 py-1.5 rounded-lg bg-purple-100 text-purple-700 text-xs font-medium hover:bg-purple-200 transition disabled:opacity-50">
                  {isGeneratingIntros ? '⚙️ Generiere...' : `✨ Alle Intros für ${audienceConf.icon} ${audienceConf.label}`}
                </button>
                <button onClick={() => setShowAddArtwork(true)} className="px-3 py-1.5 rounded-lg bg-indigo-900 text-white text-xs font-medium hover:bg-indigo-800 transition">
                  + Station hinzufügen
                </button>
              </div>
            </div>

            {tour.stops.length === 0 ? (
              <div className="bg-white rounded-xl border-2 border-dashed border-gray-200 p-12 text-center">
                <div className="text-5xl mb-4">🗺</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Noch keine Stationen</h3>
                <p className="text-gray-500 mb-6">Füge Exponate als Stationen hinzu, um die Führung aufzubauen.</p>
                <button onClick={() => setShowAddArtwork(true)} className="px-6 py-3 rounded-lg bg-indigo-900 text-white font-medium hover:bg-indigo-800 transition">
                  Erste Station hinzufügen
                </button>
              </div>
            ) : (
              tour.stops.map((stop, index) => (
                <div
                  key={stop.id}
                  draggable
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={e => handleDragOver(e, index)}
                  onDrop={e => handleDrop(e, index)}
                  className={`bg-white rounded-xl border-2 transition cursor-grab active:cursor-grabbing ${dragOver === index ? 'border-indigo-400 shadow-lg scale-[1.01]' : 'border-gray-200 hover:border-gray-300'}`}
                >
                  <div className="p-4">
                    <div className="flex items-start gap-4">
                      {/* Drag handle + number */}
                      <div className="flex flex-col items-center gap-1 flex-shrink-0 pt-1">
                        <div className="text-gray-300 text-xs">⠿⠿</div>
                        <div className="w-8 h-8 rounded-full bg-indigo-900 text-white text-sm font-bold flex items-center justify-center">
                          {stop.stop_number}
                        </div>
                      </div>
                      {/* Artwork image */}
                      {stop.artwork?.image_url ? (
                        <img src={stop.artwork.image_url} alt="" className="w-16 h-16 rounded-lg object-cover flex-shrink-0" />
                      ) : (
                        <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center text-2xl flex-shrink-0">🖼</div>
                      )}
                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-900">{t(stop.artwork?.title, activeLanguage)}</h4>
                        <p className="text-xs text-gray-500">{stop.artwork?.artist_name} {stop.artwork?.year_created ? `· ${stop.artwork.year_created}` : ''}</p>
                        {stop.custom_intro ? (
                          <p className="text-sm text-gray-600 mt-2 line-clamp-2 italic">"{stop.custom_intro}"</p>
                        ) : (
                          <p className="text-xs text-gray-400 mt-2">Kein Intro — KI-generiertes Intro hinzufügen</p>
                        )}
                      </div>
                      {/* Actions */}
                      <div className="flex gap-2 flex-shrink-0">
                        <button onClick={() => { setPreviewStop(index); setActiveTab('preview') }} className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition text-sm" title="Vorschau">👁</button>
                        <button onClick={() => generateStopIntro(stop)} disabled={generatingStopId === stop.id} className="p-2 rounded-lg bg-purple-100 text-purple-700 hover:bg-purple-200 transition text-sm disabled:opacity-50" title="KI-Intro generieren">
                          {generatingStopId === stop.id ? '⚙️' : '✨'}
                        </button>
                        <button onClick={() => removeStop(stop.id)} className="p-2 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition text-sm" title="Entfernen">✕</button>
                      </div>
                    </div>
                    {/* Editable intro */}
                    {stop.custom_intro !== undefined && (
                      <div className="mt-3 pl-12">
                        <textarea
                          value={stop.custom_intro || ''}
                          onChange={async e => {
                            const val = e.target.value
                            setTour(prev => prev ? { ...prev, stops: prev.stops.map(s => s.id === stop.id ? { ...s, custom_intro: val } : s) } : prev)
                            await supabase.from('ag_tour_stops').update({ custom_intro: val }).eq('id', stop.id)
                          }}
                          rows={2}
                          placeholder="Intro-Text für diese Station (optional)..."
                          className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:border-indigo-500 outline-none resize-none text-gray-700"
                        />
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Sidebar: Quick Stats */}
          <div className="space-y-4">
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="font-semibold text-gray-900 mb-4">Führungs-Info</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Stationen</span>
                  <span className="font-medium">{tour.stops.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Dauer (geplant)</span>
                  <span className="font-medium">{tour.duration_minutes || '—'} Min.</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Intros generiert</span>
                  <span className="font-medium">{tour.stops.filter(s => s.custom_intro).length}/{tour.stops.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Status</span>
                  <span className={`font-medium ${form.status === 'published' ? 'text-green-600' : 'text-amber-600'}`}>
                    {form.status === 'published' ? '✅ Live' : '⏳ Entwurf'}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-indigo-900 to-purple-900 rounded-xl p-5 text-white">
              <h3 className="font-semibold mb-2">KI-Assistent</h3>
              <p className="text-xs text-white/70 mb-4">Lass die KI alle Intros für die gewählte Zielgruppe generieren.</p>
              <button onClick={generateAllIntros} disabled={isGeneratingIntros || tour.stops.length === 0} className="w-full py-2.5 rounded-lg bg-amber-400 text-indigo-900 font-bold text-sm hover:bg-amber-300 transition disabled:opacity-50">
                {isGeneratingIntros ? '⚙️ Generiere...' : `✨ Alle Intros generieren`}
              </button>
              <p className="text-xs text-white/50 mt-2 text-center">für {audienceConf.icon} {audienceConf.label}</p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="max-w-2xl">
          <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
            <h3 className="font-semibold text-gray-900 mb-2">Führungs-Einstellungen</h3>
            <div>
              <label className="text-sm text-gray-600 block mb-1">Titel</label>
              <input type="text" value={t(form.title, activeLanguage)} onChange={e => setForm(prev => ({ ...prev, title: { ...(typeof prev.title === 'object' ? prev.title as any : {}), [activeLanguage]: e.target.value } }))} className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:border-indigo-500 outline-none" />
            </div>
            <div>
              <label className="text-sm text-gray-600 block mb-1">Beschreibung</label>
              <textarea rows={3} value={t(form.description, activeLanguage)} onChange={e => setForm(prev => ({ ...prev, description: { ...(typeof prev.description === 'object' ? prev.description as any : {}), [activeLanguage]: e.target.value } }))} className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:border-indigo-500 outline-none resize-none" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-600 block mb-1">Dauer (Minuten)</label>
                <input type="number" value={form.duration_minutes || ''} onChange={e => setForm(prev => ({ ...prev, duration_minutes: parseInt(e.target.value) || undefined }))} className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:border-indigo-500 outline-none" />
              </div>
              <div>
                <label className="text-sm text-gray-600 block mb-1">Schwierigkeitsgrad</label>
                <select value={form.difficulty_level || 'easy'} onChange={e => setForm(prev => ({ ...prev, difficulty_level: e.target.value as any }))} className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:border-indigo-500 outline-none">
                  <option value="easy">Einfach</option>
                  <option value="medium">Mittel</option>
                  <option value="expert">Experte</option>
                </select>
              </div>
            </div>
            <div>
              <label className="text-sm text-gray-600 block mb-1">Tags</label>
              <input type="text" value={Array.isArray(form.tags) ? form.tags.join(', ') : ''} onChange={e => setForm(prev => ({ ...prev, tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean) }))} placeholder="z.B. impressionismus, highlights, barock" className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:border-indigo-500 outline-none" />
            </div>
            <button onClick={saveTour} disabled={saving} className="w-full py-3 rounded-lg bg-indigo-900 text-white font-medium hover:bg-indigo-800 transition disabled:opacity-50">
              {saved ? '✓ Gespeichert' : saving ? '...' : 'Einstellungen speichern'}
            </button>
          </div>
        </div>
      )}

      {activeTab === 'preview' && (
        <div className="grid grid-cols-2 gap-6">
          {/* Stop Navigator */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Stationen ({tour.stops.length})</h3>
            <div className="space-y-2">
              {tour.stops.map((stop, index) => (
                <button key={stop.id} onClick={() => setPreviewStop(index)} className={`w-full text-left p-3 rounded-xl border-2 transition ${previewStop === index ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 hover:border-gray-300 bg-white'}`}>
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-full bg-indigo-900 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">{stop.stop_number}</span>
                    <div className="min-w-0">
                      <p className="font-medium text-sm text-gray-900 truncate">{t(stop.artwork?.title, activeLanguage)}</p>
                      <p className="text-xs text-gray-500 truncate">{stop.artwork?.artist_name}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Phone Preview */}
          <div className="flex justify-center">
            <div className="w-72 bg-gray-900 rounded-[2.5rem] p-3 shadow-2xl">
              <div className="bg-white rounded-[2rem] overflow-hidden">
                {/* Phone header */}
                <div className="bg-indigo-900 p-4 text-white">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs opacity-70">← Zurück</span>
                    <span className="text-xs opacity-70">{previewStop + 1}/{tour.stops.length}</span>
                  </div>
                  <div className="text-sm font-bold">{t(tour.title, activeLanguage)}</div>
                  <div className="text-xs opacity-70 mt-0.5">{audienceConf.icon} {audienceConf.label}</div>
                </div>
                {/* Artwork image */}
                {previewArtwork?.image_url ? (
                  <img src={previewArtwork.image_url} alt="" className="w-full h-40 object-cover" />
                ) : (
                  <div className="w-full h-40 bg-gray-100 flex items-center justify-center text-5xl">🖼</div>
                )}
                {/* Content */}
                <div className="p-4">
                  <h3 className="font-bold text-gray-900 text-sm">{t(previewArtwork?.title, activeLanguage)}</h3>
                  <p className="text-xs text-gray-500 mb-3">{previewArtwork?.artist_name}</p>
                  {previewIntro && (
                    <div className="bg-indigo-50 rounded-lg p-3 mb-3">
                      <p className="text-xs text-indigo-800 italic">"{previewIntro}"</p>
                    </div>
                  )}
                  <p className="text-xs text-gray-600 leading-relaxed line-clamp-5">{previewText || 'Keine Beschreibung für diese Zielgruppe vorhanden.'}</p>
                  {/* Audio button */}
                  <button className="mt-4 w-full py-2.5 rounded-xl bg-indigo-900 text-white text-xs font-medium flex items-center justify-center gap-2">
                    🎧 Audio abspielen
                  </button>
                  {/* Navigation */}
                  <div className="flex gap-2 mt-2">
                    <button onClick={() => setPreviewStop(Math.max(0, previewStop - 1))} disabled={previewStop === 0} className="flex-1 py-2 rounded-xl bg-gray-100 text-gray-600 text-xs disabled:opacity-30">← Zurück</button>
                    <button onClick={() => setPreviewStop(Math.min(tour.stops.length - 1, previewStop + 1))} disabled={previewStop === tour.stops.length - 1} className="flex-1 py-2 rounded-xl bg-gray-100 text-gray-600 text-xs disabled:opacity-30">Weiter →</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Artwork Modal */}
      {showAddArtwork && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-2xl max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Exponat hinzufügen</h3>
              <button onClick={() => setShowAddArtwork(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <input type="text" value={artworkSearch} onChange={e => setArtworkSearch(e.target.value)} placeholder="Suche nach Titel oder Künstler..." className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:border-indigo-500 outline-none mb-4" />
            <div className="overflow-y-auto flex-1 space-y-2">
              {filteredArtworks.length === 0 ? (
                <div className="text-center py-8 text-gray-400">Keine Exponate gefunden</div>
              ) : filteredArtworks.map(aw => (
                <button key={aw.id} onClick={() => addArtworkToTour(aw)} className="w-full text-left p-3 rounded-xl border border-gray-200 hover:border-indigo-400 hover:bg-indigo-50 transition flex items-center gap-3">
                  {aw.image_url ? (
                    <img src={aw.image_url} alt="" className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center text-xl flex-shrink-0">🖼</div>
                  )}
                  <div className="min-w-0">
                    <p className="font-medium text-sm text-gray-900 truncate">{t(aw.title, activeLanguage)}</p>
                    <p className="text-xs text-gray-500">{aw.artist_name} {aw.year_created ? `· ${aw.year_created}` : ''}</p>
                  </div>
                  <span className="ml-auto text-indigo-500 text-sm flex-shrink-0">+</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
