'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase-client'
import { useMuseum } from '@/lib/hooks'
import type { Artwork, Tour, Lang } from '@/lib/types'

const AUDIENCES = [
  { id: 'general', label: 'Allgemeines Publikum', icon: '👥' },
  { id: 'children', label: 'Kinder (6–12)', icon: '🧒' },
  { id: 'youth', label: 'Jugendliche (13–17)', icon: '🧑' },
  { id: 'expert', label: 'Kunstkenner', icon: '🎓' },
  { id: 'family', label: 'Familien', icon: '👨‍👩‍👧' },
  { id: 'senior', label: 'Senioren (60+)', icon: '👴' },
  { id: 'accessibility', label: 'Barrierefrei', icon: '♿' },
]
const LANGUAGES: { code: Lang; label: string; flag: string }[] = [
  { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'it', label: 'Italiano', flag: '🇮🇹' },
  { code: 'es', label: 'Español', flag: '🇪🇸' },
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

type TourWithStops = Tour & {
  ag_tour_stops?: { id: string; artwork_id: string; stop_number: number; ag_artworks?: Artwork }[]
  artworksInTour?: Artwork[]
}

export default function ToursPage() {
  const { museum } = useMuseum()
  const supabase = createClient()
  const [view, setView] = useState<'list' | 'create' | 'detail'>('list')
  const [tours, setTours] = useState<TourWithStops[]>([])
  const [artworks, setArtworks] = useState<Artwork[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [selectedAudience, setSelectedAudience] = useState('general')
  const [selectedLanguage, setSelectedLanguage] = useState<Lang>('de')
  const [isGenerating, setIsGenerating] = useState(false)
  const [activeTour, setActiveTour] = useState<TourWithStops | null>(null)
  const [dragItem, setDragItem] = useState<number | null>(null)
  const [dragOver, setDragOver] = useState<number | null>(null)
  const [newTourTitle, setNewTourTitle] = useState('')
  const [publishingId, setPublishingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    if (museum?.id) { loadTours(); loadArtworks() }
  }, [museum?.id])

  async function loadTours() {
    setLoading(true)
    const { data } = await supabase
      .from('ag_tours')
      .select('*, ag_tour_stops(id, artwork_id, stop_number, ag_artworks(*))')
      .eq('museum_id', museum!.id)
      .order('created_at', { ascending: false })
    if (data) {
      setTours(data.map((tour: any) => ({
        ...tour,
        artworksInTour: (tour.ag_tour_stops || [])
          .sort((a: any, b: any) => a.stop_number - b.stop_number)
          .map((s: any) => s.ag_artworks).filter(Boolean),
      })))
    }
    setLoading(false)
  }

  async function loadArtworks() {
    const { data } = await supabase
      .from('ag_artworks')
      .select('id, title, artist_name, year_created, medium, status, description_standard, is_highlight')
      .eq('museum_id', museum!.id)
      .order('sort_order')
    if (data) setArtworks(data as Artwork[])
  }

  const generateTour = async () => {
    if (artworks.length === 0) { alert('Keine Exponate vorhanden.'); return }
    setIsGenerating(true)
    try {
      const audience = AUDIENCES.find(a => a.id === selectedAudience)?.label || 'Allgemeines Publikum'
      const language = LANGUAGES.find(l => l.code === selectedLanguage)?.label || 'Deutsch'
      const res = await fetch('/api/tours/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          artworks: artworks.map(a => ({ id: a.id, title: t(a.title, selectedLanguage), artist: a.artist_name, description: t(a.description_standard, selectedLanguage) })),
          audience, language, tier: museum?.tier_id || 'artguide_starter',
        }),
      })
      const data = await res.json()
      if (!data.success) { alert('Fehler: ' + data.error); return }
      const selectedArtworks = (data.tour.artworks || []).map((a: any) => artworks.find(aw => aw.id === a.id) || a).filter(Boolean)
      setActiveTour({
        id: 'new-' + Date.now(), museum_id: museum!.id,
        title: { [selectedLanguage]: data.tour.title || 'KI-Führung' } as any,
        description: { [selectedLanguage]: data.tour.description || '' } as any,
        tour_type: 'ai_generated', target_audience: selectedAudience as any,
        difficulty_level: 'standard', estimated_duration_minutes: data.tour.duration_minutes || 45,
        status: 'draft', tags: [], created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
        artworksInTour: selectedArtworks,
      } as any)
      setView('detail')
    } catch (err) { alert('Fehler: ' + err) }
    finally { setIsGenerating(false) }
  }

  const saveTour = async () => {
    if (!activeTour || !museum) return
    setSaving(true)
    try {
      const isNew = String(activeTour.id).startsWith('new-')
      let tourId = activeTour.id
      if (isNew) {
        const { data: created, error } = await supabase.from('ag_tours').insert({
          museum_id: museum.id, title: activeTour.title, description: activeTour.description,
          tour_type: activeTour.tour_type || 'curated', target_audience: activeTour.target_audience,
          difficulty_level: activeTour.difficulty_level || 'standard',
          estimated_duration_minutes: activeTour.estimated_duration_minutes, status: 'draft', tags: [],
        }).select().single()
        if (error) throw error
        tourId = created.id
      } else {
        await supabase.from('ag_tours').update({
          title: activeTour.title, description: activeTour.description,
          estimated_duration_minutes: activeTour.estimated_duration_minutes,
          target_audience: activeTour.target_audience, updated_at: new Date().toISOString(),
        }).eq('id', tourId)
      }
      await supabase.from('ag_tour_stops').delete().eq('tour_id', tourId)
      if (activeTour.artworksInTour && activeTour.artworksInTour.length > 0) {
        await supabase.from('ag_tour_stops').insert(
          activeTour.artworksInTour.map((aw, idx) => ({ tour_id: tourId, artwork_id: aw.id, stop_number: idx + 1 }))
        )
      }
      await loadTours(); setView('list'); setActiveTour(null)
    } catch (err: any) { alert('Fehler: ' + err.message) }
    finally { setSaving(false) }
  }

  const publishTour = async (tourId: string) => {
    setPublishingId(tourId)
    await supabase.from('ag_tours').update({ status: 'published', published_at: new Date().toISOString() }).eq('id', tourId)
    await loadTours(); setPublishingId(null)
  }

  const deleteTour = async (tourId: string) => {
    if (!confirm('Führung wirklich löschen?')) return
    setDeletingId(tourId)
    await supabase.from('ag_tours').delete().eq('id', tourId)
    await loadTours(); setDeletingId(null)
  }

  const handleDragStart = (idx: number) => setDragItem(idx)
  const handleDragEnter = (idx: number) => setDragOver(idx)
  const handleDragEnd = () => {
    if (dragItem === null || dragOver === null || !activeTour) { setDragItem(null); setDragOver(null); return }
    const items = [...(activeTour.artworksInTour || [])]
    const [moved] = items.splice(dragItem, 1); items.splice(dragOver, 0, moved)
    setActiveTour({ ...activeTour, artworksInTour: items }); setDragItem(null); setDragOver(null)
  }

  // LIST VIEW
  if (view === 'list') return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Führungen</h1>
          <p className="text-gray-500 mt-1">Personalisierte Führungen für verschiedene Zielgruppen</p>
        </div>
        <button onClick={() => setView('create')} className="px-4 py-2 rounded-lg bg-indigo-900 text-white text-sm font-medium hover:bg-indigo-800 transition">+ Neue Führung</button>
      </div>
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Gesamt', value: tours.length, icon: '🗺', color: 'bg-indigo-50 text-indigo-700' },
          { label: 'Veröffentlicht', value: tours.filter(t => t.status === 'published').length, icon: '✅', color: 'bg-green-50 text-green-700' },
          { label: 'Entwürfe', value: tours.filter(t => t.status === 'draft').length, icon: '📝', color: 'bg-amber-50 text-amber-700' },
          { label: 'Ø Stationen', value: tours.length > 0 ? Math.round(tours.reduce((s, t) => s + (t.artworksInTour?.length || 0), 0) / tours.length) : 0, icon: '🎯', color: 'bg-purple-50 text-purple-700' },
        ].map(stat => (
          <div key={stat.label} className={`rounded-xl p-4 ${stat.color}`}>
            <div className="text-2xl mb-1">{stat.icon}</div>
            <div className="text-2xl font-bold">{stat.value}</div>
            <div className="text-sm opacity-70">{stat.label}</div>
          </div>
        ))}
      </div>
      {loading ? (
        <div className="flex items-center justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" /></div>
      ) : tours.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-16 text-center">
          <div className="text-6xl mb-4">🗺</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Noch keine Führungen</h3>
          <p className="text-gray-500 mb-6">Erstelle deine erste Führung manuell oder lass die KI eine für dich generieren.</p>
          <button onClick={() => setView('create')} className="px-6 py-3 rounded-lg bg-indigo-900 text-white font-medium hover:bg-indigo-800 transition">Erste Führung erstellen</button>
        </div>
      ) : (
        <div className="space-y-3">
          {tours.map(tour => (
            <div key={tour.id} className="bg-white rounded-xl border border-gray-200 p-5 hover:border-indigo-300 transition">
              <div className="flex items-start gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-gray-900">{t(tour.title)}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${tour.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                      {tour.status === 'published' ? '✅ Veröffentlicht' : '📝 Entwurf'}
                    </span>
                    {tour.tour_type === 'ai_generated' && <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 font-medium">✨ KI</span>}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>{AUDIENCES.find(a => a.id === tour.target_audience)?.icon} {AUDIENCES.find(a => a.id === tour.target_audience)?.label || tour.target_audience}</span>
                    <span>⏱ {tour.estimated_duration_minutes} Min.</span>
                    <span>🎯 {tour.artworksInTour?.length || 0} Stationen</span>
                  </div>
                  {t(tour.description) && <p className="text-sm text-gray-600 mt-2 line-clamp-2">{t(tour.description)}</p>}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Link href={`/dashboard/tours/${tour.id}`} className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm text-gray-700 hover:bg-gray-50 transition">Bearbeiten →</Link>
                  {tour.status === 'draft' && (
                    <button onClick={() => publishTour(tour.id)} disabled={publishingId === tour.id} className="px-3 py-1.5 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-700 transition disabled:opacity-50">
                      {publishingId === tour.id ? '...' : '▶ Freigeben'}
                    </button>
                  )}
                  <button onClick={() => deleteTour(tour.id)} disabled={deletingId === tour.id} className="px-3 py-1.5 rounded-lg border border-red-200 text-red-600 text-sm hover:bg-red-50 transition disabled:opacity-50">
                    {deletingId === tour.id ? '...' : '🗑'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )

  // CREATE VIEW
  if (view === 'create') return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => setView('list')} className="p-2 rounded-lg hover:bg-gray-100 transition text-gray-500">←</button>
        <div><h1 className="text-2xl font-bold text-gray-900">Neue Führung erstellen</h1></div>
      </div>
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-indigo-900 to-purple-900 rounded-2xl p-6 text-white">
          <div className="text-3xl mb-3">✨</div>
          <h2 className="text-xl font-bold mb-2">KI-Führung generieren</h2>
          <p className="text-white/70 text-sm mb-5">Die KI analysiert deine {artworks.length} Exponate und erstellt automatisch eine thematisch kohärente Führung.</p>
          <div className="space-y-3 mb-5">
            <div>
              <label className="text-xs text-white/60 block mb-1.5">Zielgruppe</label>
              <div className="grid grid-cols-2 gap-2">
                {AUDIENCES.map(a => (
                  <button key={a.id} onClick={() => setSelectedAudience(a.id)} className={`flex items-center gap-2 p-2.5 rounded-lg text-sm transition ${selectedAudience === a.id ? 'bg-white text-indigo-900 font-semibold' : 'bg-white/10 hover:bg-white/20'}`}>
                    <span>{a.icon}</span><span className="truncate">{a.label}</span>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs text-white/60 block mb-1.5">Sprache</label>
              <div className="flex gap-2 flex-wrap">
                {LANGUAGES.map(l => (
                  <button key={l.code} onClick={() => setSelectedLanguage(l.code)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition ${selectedLanguage === l.code ? 'bg-white text-indigo-900 font-semibold' : 'bg-white/10 hover:bg-white/20'}`}>
                    {l.flag} {l.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <button onClick={generateTour} disabled={isGenerating || artworks.length === 0} className="w-full py-3 rounded-xl bg-amber-400 text-indigo-900 font-bold hover:bg-amber-300 transition disabled:opacity-50 flex items-center justify-center gap-2">
            {isGenerating ? '⚙️ KI generiert...' : '✨ Führung generieren'}
          </button>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <div className="text-3xl mb-3">✍️</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Manuelle Führung</h2>
          <p className="text-gray-500 text-sm mb-5">Wähle selbst die Exponate aus und bestimme die Reihenfolge.</p>
          <div className="space-y-3 mb-5">
            <div>
              <label className="text-xs text-gray-500 block mb-1">Titel der Führung</label>
              <input value={newTourTitle} onChange={e => setNewTourTitle(e.target.value)} placeholder="z.B. Impressionismus-Highlights" className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:border-indigo-500 outline-none" />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Zielgruppe</label>
              <select value={selectedAudience} onChange={e => setSelectedAudience(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:border-indigo-500 outline-none">
                {AUDIENCES.map(a => <option key={a.id} value={a.id}>{a.icon} {a.label}</option>)}
              </select>
            </div>
          </div>
          <button onClick={() => {
            if (!newTourTitle.trim()) { alert('Bitte einen Titel eingeben'); return }
            setActiveTour({ id: 'new-' + Date.now(), museum_id: museum!.id, title: { de: newTourTitle } as any, description: { de: '' } as any, tour_type: 'curated', target_audience: selectedAudience as any, difficulty_level: 'standard', estimated_duration_minutes: 45, status: 'draft', tags: [], created_at: new Date().toISOString(), updated_at: new Date().toISOString(), artworksInTour: [] } as any)
            setView('detail')
          }} disabled={!newTourTitle.trim()} className="w-full py-3 rounded-xl bg-indigo-900 text-white font-bold hover:bg-indigo-800 transition disabled:opacity-50">
            Führung anlegen
          </button>
        </div>
      </div>
    </div>
  )

  // DETAIL VIEW
  if (view === 'detail' && activeTour) return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => { setView('list'); setActiveTour(null) }} className="p-2 rounded-lg hover:bg-gray-100 transition text-gray-500">←</button>
        <div className="flex-1">
          <input value={t(activeTour.title)} onChange={e => setActiveTour({ ...activeTour, title: { ...activeTour.title as any, de: e.target.value } })} className="text-2xl font-bold text-gray-900 bg-transparent border-b-2 border-transparent hover:border-gray-200 focus:border-indigo-500 outline-none w-full" />
          <p className="text-gray-500 text-sm mt-0.5">{AUDIENCES.find(a => a.id === activeTour.target_audience)?.icon} {AUDIENCES.find(a => a.id === activeTour.target_audience)?.label} · ⏱ {activeTour.estimated_duration_minutes} Min. · {activeTour.artworksInTour?.length || 0} Stationen</p>
        </div>
        <button onClick={saveTour} disabled={saving} className="px-5 py-2 rounded-lg bg-indigo-900 text-white font-medium hover:bg-indigo-800 transition disabled:opacity-50">
          {saving ? '⚙️ Speichern...' : '💾 Speichern'}
        </button>
      </div>
      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-lg">🎯</span>
              <h3 className="font-semibold text-gray-900">Stationen</h3>
              <span className="ml-auto text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">Reihenfolge per Drag & Drop ändern</span>
            </div>
            {(activeTour.artworksInTour || []).length === 0 ? (
              <div className="text-center py-10 text-gray-400"><div className="text-4xl mb-2">🖼</div><p className="text-sm">Noch keine Stationen. Füge Exponate rechts hinzu.</p></div>
            ) : (
              <div className="space-y-2">
                {(activeTour.artworksInTour || []).map((artwork, idx) => (
                  <div key={artwork.id} draggable onDragStart={() => handleDragStart(idx)} onDragEnter={() => handleDragEnter(idx)} onDragEnd={handleDragEnd} onDragOver={e => e.preventDefault()}
                    className={`flex items-center gap-3 p-3 rounded-xl border-2 transition cursor-grab active:cursor-grabbing select-none ${dragOver === idx ? 'border-indigo-400 bg-indigo-50' : 'border-gray-200 bg-gray-50 hover:border-gray-300'}`}>
                    <span className="text-gray-300 text-lg select-none">⠿</span>
                    <span className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center justify-center flex-shrink-0">{idx + 1}</span>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 text-sm truncate">{t(artwork.title)}</div>
                      <div className="text-xs text-gray-500">{artwork.artist_name}{artwork.year_created ? ` · ${artwork.year_created}` : ''}</div>
                    </div>
                    <button onClick={() => setActiveTour({ ...activeTour, artworksInTour: (activeTour.artworksInTour || []).filter((_, i) => i !== idx) })} className="p-1 rounded-lg hover:bg-red-100 text-gray-400 hover:text-red-500 transition">✕</button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-900 mb-3">📝 Beschreibung</h3>
            <textarea value={t(activeTour.description)} onChange={e => setActiveTour({ ...activeTour, description: { ...activeTour.description as any, de: e.target.value } })} placeholder="Kurze Beschreibung für Besucher..." className="w-full p-3 rounded-lg border border-gray-200 text-sm resize-none focus:border-indigo-500 outline-none" rows={3} />
          </div>
        </div>
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-900 mb-3">⚙️ Details</h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-500 block mb-1">Zielgruppe</label>
                <select value={activeTour.target_audience as string} onChange={e => setActiveTour({ ...activeTour, target_audience: e.target.value as any })} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:border-indigo-500 outline-none">
                  {AUDIENCES.map(a => <option key={a.id} value={a.id}>{a.icon} {a.label}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">Dauer (Minuten)</label>
                <input type="number" value={activeTour.estimated_duration_minutes} onChange={e => setActiveTour({ ...activeTour, estimated_duration_minutes: parseInt(e.target.value) || 45 })} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:border-indigo-500 outline-none" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-900 mb-3">🖼 Exponate hinzufügen</h3>
            <div className="space-y-1 max-h-80 overflow-y-auto">
              {artworks.filter(a => !(activeTour.artworksInTour || []).find(ta => ta.id === a.id)).map(artwork => (
                <button key={artwork.id} onClick={() => setActiveTour({ ...activeTour, artworksInTour: [...(activeTour.artworksInTour || []), artwork] })} className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-indigo-50 text-left transition group">
                  <span className="text-sm">🎨</span>
                  <div className="flex-1 min-w-0"><div className="text-sm text-gray-700 truncate font-medium">{t(artwork.title)}</div><div className="text-xs text-gray-400 truncate">{artwork.artist_name}</div></div>
                  <span className="text-indigo-500 opacity-0 group-hover:opacity-100 transition text-xs">+ add</span>
                </button>
              ))}
              {artworks.filter(a => !(activeTour.artworksInTour || []).find(ta => ta.id === a.id)).length === 0 && (
                <p className="text-xs text-gray-400 text-center py-4">Alle Exponate sind bereits in der Führung</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  return null
}
