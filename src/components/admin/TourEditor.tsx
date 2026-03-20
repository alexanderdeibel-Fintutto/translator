// Fintutto World — Tour Editor
// Create guided tours for different target audiences, assign artworks, and publish

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Route, Plus, Sparkles, Loader2, GripVertical, Trash2,
  Clock, Users, Eye, Send, ChevronDown, ChevronUp,
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import type { Tour, Artwork, TargetAudience, DifficultyLevel, TourType } from '@/lib/artguide/types'

const AUDIENCES: { id: TargetAudience; label: string }[] = [
  { id: 'general', label: 'Allgemein' },
  { id: 'children', label: 'Kinder' },
  { id: 'youth', label: 'Jugendliche' },
  { id: 'expert', label: 'Experten' },
  { id: 'accessibility', label: 'Barrierefrei' },
]

const DIFFICULTIES: { id: DifficultyLevel; label: string; duration: string }[] = [
  { id: 'quick', label: 'Kurz', duration: '15-30 Min.' },
  { id: 'standard', label: 'Standard', duration: '45-60 Min.' },
  { id: 'deep_dive', label: 'Vertieft', duration: '90+ Min.' },
]

interface TourStop {
  artwork_id: string
  artwork_title: string
  stop_number: number
}

export default function TourEditor() {
  const [museums, setMuseums] = useState<{ id: string; name: string }[]>([])
  const [museumId, setMuseumId] = useState('')
  const [tours, setTours] = useState<Tour[]>([])
  const [artworks, setArtworks] = useState<Artwork[]>([])
  const [loading, setLoading] = useState(false)
  const [generating, setGenerating] = useState(false)

  // New tour form
  const [showForm, setShowForm] = useState(false)
  const [title, setTitle] = useState('')
  const [audience, setAudience] = useState<TargetAudience>('general')
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('standard')
  const [tourType, setTourType] = useState<TourType>('curated')
  const [stops, setStops] = useState<TourStop[]>([])
  const [expandedTour, setExpandedTour] = useState<string | null>(null)

  useEffect(() => {
    supabase
      .from('ag_museums')
      .select('id, name')
      .eq('is_active', true)
      .order('name')
      .then(({ data }) => {
        if (data) setMuseums(data)
        if (data?.length === 1) setMuseumId(data[0].id)
      })
  }, [])

  useEffect(() => {
    if (museumId) {
      loadTours()
      loadArtworks()
    }
  }, [museumId])

  async function loadTours() {
    const { data } = await supabase
      .from('ag_tours')
      .select('*, ag_tour_stops(*)')
      .eq('museum_id', museumId)
      .order('created_at', { ascending: false })
    if (data) setTours(data as Tour[])
  }

  async function loadArtworks() {
    const { data } = await supabase
      .from('ag_artworks')
      .select('id, title, artist_name, room_id, sort_order')
      .eq('museum_id', museumId)
      .order('sort_order')
    if (data) setArtworks(data as Artwork[])
  }

  function addStop(artworkId: string) {
    const artwork = artworks.find(a => a.id === artworkId)
    if (!artwork || stops.some(s => s.artwork_id === artworkId)) return
    setStops([...stops, {
      artwork_id: artworkId,
      artwork_title: (artwork.title as Record<string, string>)?.de || artwork.artist_name || 'Unbekannt',
      stop_number: stops.length + 1,
    }])
  }

  function removeStop(index: number) {
    setStops(stops.filter((_, i) => i !== index).map((s, i) => ({ ...s, stop_number: i + 1 })))
  }

  function moveStop(index: number, direction: 'up' | 'down') {
    const newStops = [...stops]
    const swapIdx = direction === 'up' ? index - 1 : index + 1
    if (swapIdx < 0 || swapIdx >= newStops.length) return;
    [newStops[index], newStops[swapIdx]] = [newStops[swapIdx], newStops[index]]
    setStops(newStops.map((s, i) => ({ ...s, stop_number: i + 1 })))
  }

  async function handleCreate() {
    if (!title || !museumId) return
    setLoading(true)

    try {
      const { data: tour, error } = await supabase
        .from('ag_tours')
        .insert({
          museum_id: museumId,
          title: { de: title },
          description: { de: '' },
          tour_type: tourType,
          target_audience: audience,
          estimated_duration_minutes: difficulty === 'quick' ? 20 : difficulty === 'standard' ? 50 : 90,
          difficulty_level: difficulty,
          status: 'draft',
          tags: [],
        })
        .select()
        .single()

      if (error) throw error

      // Add stops
      if (stops.length > 0 && tour) {
        await supabase.from('ag_tour_stops').insert(
          stops.map(s => ({
            tour_id: tour.id,
            artwork_id: s.artwork_id,
            stop_number: s.stop_number,
            transition_text: {},
            custom_narration: {},
            duration_seconds: 120,
          })),
        )
      }

      setShowForm(false)
      setTitle('')
      setStops([])
      loadTours()
    } catch (err) {
      console.error('Tour creation failed:', err)
    } finally {
      setLoading(false)
    }
  }

  async function handleAiGenerate() {
    if (!museumId) return
    setGenerating(true)

    try {
      const { data, error } = await supabase.functions.invoke('artguide-ai', {
        body: {
          action: 'suggest_tours',
          museum_id: museumId,
        },
      })

      if (error) throw error
      // Reload tours to show any newly created suggestions
      loadTours()
    } catch (err) {
      console.error('AI tour generation failed:', err)
    } finally {
      setGenerating(false)
    }
  }

  async function publishTour(tourId: string) {
    await supabase
      .from('ag_tours')
      .update({ status: 'published', published_at: new Date().toISOString() })
      .eq('id', tourId)
    loadTours()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Route className="h-6 w-6" />
            Fuehrungen
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Erstelle Fuehrungen fuer verschiedene Zielgruppen oder lass die KI Vorschlaege machen.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleAiGenerate} disabled={generating || !museumId}>
            {generating
              ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> KI generiert...</>
              : <><Sparkles className="h-4 w-4 mr-2" /> KI-Vorschlaege</>}
          </Button>
          <Button onClick={() => setShowForm(true)} disabled={!museumId}>
            <Plus className="h-4 w-4 mr-2" /> Neue Fuehrung
          </Button>
        </div>
      </div>

      {/* Museum selector */}
      {museums.length > 1 && (
        <Select value={museumId} onValueChange={setMuseumId}>
          <SelectTrigger className="w-64">
            <SelectValue placeholder="Museum auswaehlen..." />
          </SelectTrigger>
          <SelectContent>
            {museums.map(m => (
              <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {/* New tour form */}
      {showForm && (
        <Card className="p-6 space-y-4 border-primary">
          <h3 className="font-semibold">Neue Fuehrung erstellen</h3>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Titel</Label>
              <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="z.B. Highlights-Tour" />
            </div>
            <div className="space-y-2">
              <Label>Zielgruppe</Label>
              <Select value={audience} onValueChange={v => setAudience(v as TargetAudience)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {AUDIENCES.map(a => (
                    <SelectItem key={a.id} value={a.id}>{a.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Tiefe</Label>
              <Select value={difficulty} onValueChange={v => setDifficulty(v as DifficultyLevel)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {DIFFICULTIES.map(d => (
                    <SelectItem key={d.id} value={d.id}>{d.label} ({d.duration})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Typ</Label>
              <Select value={tourType} onValueChange={v => setTourType(v as TourType)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="curated">Kuratiert</SelectItem>
                  <SelectItem value="thematic">Thematisch</SelectItem>
                  <SelectItem value="ai_generated">KI-generiert</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Stop builder */}
          <div className="space-y-2">
            <Label>Stationen ({stops.length})</Label>
            {stops.length > 0 && (
              <div className="space-y-1">
                {stops.map((stop, i) => (
                  <div key={i} className="flex items-center gap-2 p-2 bg-muted rounded text-sm">
                    <GripVertical className="h-4 w-4 text-muted-foreground" />
                    <Badge variant="outline" className="text-xs">{stop.stop_number}</Badge>
                    <span className="flex-1 truncate">{stop.artwork_title}</span>
                    <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => moveStop(i, 'up')} disabled={i === 0}>
                      <ChevronUp className="h-3 w-3" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => moveStop(i, 'down')} disabled={i === stops.length - 1}>
                      <ChevronDown className="h-3 w-3" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-6 w-6 text-destructive" onClick={() => removeStop(i)}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
            <Select onValueChange={addStop}>
              <SelectTrigger>
                <SelectValue placeholder="Exponat hinzufuegen..." />
              </SelectTrigger>
              <SelectContent>
                {artworks
                  .filter(a => !stops.some(s => s.artwork_id === a.id))
                  .map(a => (
                    <SelectItem key={a.id} value={a.id}>
                      {(a.title as Record<string, string>)?.de || a.artist_name || a.id}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => { setShowForm(false); setStops([]) }}>
              Abbrechen
            </Button>
            <Button onClick={handleCreate} disabled={loading || !title}>
              {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />}
              Fuehrung erstellen
            </Button>
          </div>
        </Card>
      )}

      {/* Tour list */}
      {tours.length === 0 ? (
        <Card className="p-12 text-center">
          <Route className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-semibold text-lg mb-2">Noch keine Fuehrungen</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Erstelle manuell oder lass die KI basierend auf deinen Exponaten Vorschlaege generieren.
          </p>
        </Card>
      ) : (
        <div className="grid gap-3">
          {tours.map(tour => (
            <Card key={tour.id} className="p-4">
              <div className="flex items-start justify-between">
                <div
                  className="flex-1 cursor-pointer"
                  onClick={() => setExpandedTour(expandedTour === tour.id ? null : tour.id)}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold">
                      {(tour.title as Record<string, string>)?.de || 'Unbenannt'}
                    </h3>
                    <Badge variant={tour.status === 'published' ? 'default' : 'secondary'}>
                      {tour.status === 'published' ? 'Veroeffentlicht' : tour.status === 'draft' ? 'Entwurf' : tour.status}
                    </Badge>
                    <Badge variant="outline">{tour.tour_type}</Badge>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {AUDIENCES.find(a => a.id === tour.target_audience)?.label ?? tour.target_audience}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {tour.estimated_duration_minutes} Min.
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye className="h-3 w-3" />
                      {tour.stops?.length ?? 0} Stationen
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  {tour.status === 'draft' && (
                    <Button size="sm" onClick={() => publishTour(tour.id)}>
                      <Send className="h-4 w-4 mr-1" /> Freigeben
                    </Button>
                  )}
                </div>
              </div>
              {expandedTour === tour.id && tour.stops && tour.stops.length > 0 && (
                <div className="mt-3 pt-3 border-t space-y-1">
                  {tour.stops
                    .sort((a, b) => a.stop_number - b.stop_number)
                    .map(stop => (
                      <div key={stop.id} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Badge variant="outline" className="text-xs">{stop.stop_number}</Badge>
                        <span>Exponat: {stop.artwork_id.slice(0, 8)}...</span>
                      </div>
                    ))}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
