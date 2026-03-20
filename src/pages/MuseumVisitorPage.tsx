// Museum Visitor Landing — QR scan leads here
// Shows museum info, tour selection, map, and AI chat entry point

import { useParams, useSearchParams, Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Headphones, MessageCircle, Map, Route, QrCode, Clock,
  Users, Globe, ChevronRight, Loader2, Landmark, Star,
  Volume2, Sparkles, Eye,
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import type { Museum, Tour, Artwork, TargetAudience } from '@/lib/artguide/types'

const AUDIENCE_LABELS: Record<TargetAudience, string> = {
  general: 'Alle',
  children: 'Kinder',
  youth: 'Jugendliche',
  expert: 'Experten',
  accessibility: 'Barrierefrei',
}

export default function MuseumVisitorPage() {
  const { slug, artworkId } = useParams<{ slug: string; artworkId?: string }>()
  const [searchParams] = useSearchParams()
  const [museum, setMuseum] = useState<Museum | null>(null)
  const [tours, setTours] = useState<Tour[]>([])
  const [highlights, setHighlights] = useState<Artwork[]>([])
  const [loading, setLoading] = useState(true)
  const [activeView, setActiveView] = useState<'overview' | 'tours' | 'chat' | 'map'>('overview')
  const [chatInput, setChatInput] = useState('')
  const [chatMessages, setChatMessages] = useState<{ role: 'user' | 'ai'; text: string }[]>([])
  const [chatLoading, setChatLoading] = useState(false)

  useEffect(() => {
    if (slug) loadMuseum()
  }, [slug])

  async function loadMuseum() {
    setLoading(true)

    const { data: museumData } = await supabase
      .from('ag_museums')
      .select('*')
      .eq('slug', slug)
      .eq('is_active', true)
      .single()

    if (museumData) {
      setMuseum(museumData as Museum)

      // Load published tours
      const { data: tourData } = await supabase
        .from('ag_tours')
        .select('*')
        .eq('museum_id', museumData.id)
        .eq('status', 'published')
        .order('is_featured', { ascending: false })

      if (tourData) setTours(tourData as Tour[])

      // Load highlight artworks
      const { data: artworkData } = await supabase
        .from('ag_artworks')
        .select('*')
        .eq('museum_id', museumData.id)
        .eq('status', 'published')
        .eq('is_highlight', true)
        .order('sort_order')
        .limit(6)

      if (artworkData) setHighlights(artworkData as Artwork[])
    }

    setLoading(false)
  }

  async function handleChat() {
    if (!chatInput.trim() || !museum) return
    const userMsg = chatInput.trim()
    setChatInput('')
    setChatMessages(prev => [...prev, { role: 'user', text: userMsg }])
    setChatLoading(true)

    try {
      const { data, error } = await supabase.functions.invoke('fintutto-world-ai', {
        body: {
          action: 'dialog',
          context: 'museum',
          museum_id: museum.id,
          museum_name: museum.name,
          message: userMsg,
          history: chatMessages.slice(-6),
          language: museum.default_language || 'de',
        },
      })

      if (error) throw error
      setChatMessages(prev => [...prev, { role: 'ai', text: data?.reply || 'Entschuldigung, ich konnte keine Antwort generieren.' }])
    } catch {
      setChatMessages(prev => [...prev, { role: 'ai', text: 'Es gab einen Fehler. Bitte versuchen Sie es erneut.' }])
    } finally {
      setChatLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!museum) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <Landmark className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h2 className="text-lg font-semibold mb-2">Museum nicht gefunden</h2>
        <p className="text-sm text-muted-foreground">
          Dieses Museum ist nicht verfuegbar oder der Link ist ungueltig.
        </p>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto pb-20">
      {/* Museum Header */}
      <div className="relative">
        {museum.cover_image_url ? (
          <img src={museum.cover_image_url} alt={museum.name} className="w-full h-48 object-cover" />
        ) : (
          <div className="w-full h-48 bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
            <Landmark className="h-16 w-16 text-primary/30" />
          </div>
        )}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-background to-transparent p-4 pt-12">
          <h1 className="text-2xl font-bold">{museum.name}</h1>
          {museum.address?.city && (
            <p className="text-sm text-muted-foreground">{museum.address.city}</p>
          )}
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-4 gap-2 p-4">
        {[
          { icon: Headphones, label: 'Audio', view: 'tours' as const },
          { icon: MessageCircle, label: 'KI-Chat', view: 'chat' as const },
          { icon: Map, label: 'Karte', view: 'map' as const },
          { icon: Route, label: 'Touren', view: 'tours' as const },
        ].map(action => (
          <Button
            key={action.label}
            variant={activeView === action.view ? 'default' : 'outline'}
            className="flex-col h-auto py-3 gap-1"
            onClick={() => setActiveView(action.view)}
          >
            <action.icon className="h-5 w-5" />
            <span className="text-xs">{action.label}</span>
          </Button>
        ))}
      </div>

      {/* Content area */}
      <div className="px-4 space-y-6">
        {/* Overview */}
        {activeView === 'overview' && (
          <>
            {/* Museum description */}
            <div>
              <p className="text-sm text-muted-foreground">
                {(museum.description as Record<string, string>)?.de || 'Willkommen in unserem Museum.'}
              </p>
              <div className="flex gap-3 mt-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Globe className="h-3 w-3" />
                  {museum.supported_languages?.length || 1} Sprachen
                </span>
                <span className="flex items-center gap-1">
                  <QrCode className="h-3 w-3" />
                  {museum.positioning_mode}
                </span>
              </div>
            </div>

            {/* Highlights */}
            {highlights.length > 0 && (
              <div>
                <h2 className="font-semibold mb-3 flex items-center gap-2">
                  <Star className="h-4 w-4" /> Highlights
                </h2>
                <div className="grid grid-cols-2 gap-3">
                  {highlights.map(artwork => (
                    <Card key={artwork.id} className="p-3 cursor-pointer hover:bg-accent/50 transition-colors">
                      <div className="w-full h-24 bg-muted rounded mb-2 flex items-center justify-center">
                        <Landmark className="h-8 w-8 text-muted-foreground/30" />
                      </div>
                      <h3 className="font-medium text-sm truncate">
                        {(artwork.title as Record<string, string>)?.de || 'Unbekannt'}
                      </h3>
                      {artwork.artist_name && (
                        <p className="text-xs text-muted-foreground truncate">{artwork.artist_name}</p>
                      )}
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Featured tours */}
            {tours.length > 0 && (
              <div>
                <h2 className="font-semibold mb-3 flex items-center gap-2">
                  <Route className="h-4 w-4" /> Fuehrungen
                </h2>
                <div className="space-y-2">
                  {tours.slice(0, 3).map(tour => (
                    <Card
                      key={tour.id}
                      className="p-3 flex items-center gap-3 cursor-pointer hover:bg-accent/50 transition-colors"
                      onClick={() => setActiveView('tours')}
                    >
                      <div className="w-10 h-10 rounded bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Route className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-sm truncate">
                          {(tour.title as Record<string, string>)?.de || 'Fuehrung'}
                        </h3>
                        <div className="flex gap-2 text-xs text-muted-foreground">
                          <span className="flex items-center gap-0.5">
                            <Clock className="h-3 w-3" />
                            {tour.estimated_duration_minutes} Min.
                          </span>
                          <span className="flex items-center gap-0.5">
                            <Users className="h-3 w-3" />
                            {AUDIENCE_LABELS[tour.target_audience] ?? tour.target_audience}
                          </span>
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* Tours view */}
        {activeView === 'tours' && (
          <div>
            <h2 className="font-semibold mb-4 flex items-center gap-2">
              <Route className="h-5 w-5" /> Alle Fuehrungen
            </h2>
            {tours.length === 0 ? (
              <p className="text-sm text-muted-foreground">Noch keine Fuehrungen verfuegbar.</p>
            ) : (
              <div className="space-y-3">
                {tours.map(tour => (
                  <Card key={tour.id} className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold">
                        {(tour.title as Record<string, string>)?.de || 'Fuehrung'}
                      </h3>
                      <Badge variant="outline">
                        {AUDIENCE_LABELS[tour.target_audience] ?? tour.target_audience}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      {(tour.description as Record<string, string>)?.de || ''}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" /> {tour.estimated_duration_minutes} Min.
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye className="h-3 w-3" /> {tour.stops?.length ?? '?'} Stationen
                        </span>
                      </div>
                      <Button size="sm">
                        <Headphones className="h-4 w-4 mr-1" /> Starten
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Chat view */}
        {activeView === 'chat' && (
          <div>
            <h2 className="font-semibold mb-4 flex items-center gap-2">
              <MessageCircle className="h-5 w-5" /> KI-Museumsguide
            </h2>
            <Card className="p-4">
              <div className="min-h-[300px] max-h-[400px] overflow-y-auto space-y-3 mb-4">
                {chatMessages.length === 0 && (
                  <div className="text-center py-8">
                    <Sparkles className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">
                      Fragen Sie mich alles ueber {museum.name}!
                    </p>
                    <div className="flex flex-wrap gap-2 justify-center mt-3">
                      {['Was gibt es hier zu sehen?', 'Welche Tour empfiehlst du?', 'Erzaehl mir vom bekanntesten Exponat'].map(q => (
                        <Button
                          key={q}
                          size="sm"
                          variant="outline"
                          className="text-xs"
                          onClick={() => { setChatInput(q); }}
                        >
                          {q}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
                {chatMessages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] p-3 rounded-lg text-sm ${
                      msg.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}>
                      {msg.text}
                    </div>
                  </div>
                ))}
                {chatLoading && (
                  <div className="flex justify-start">
                    <div className="bg-muted p-3 rounded-lg">
                      <Loader2 className="h-4 w-4 animate-spin" />
                    </div>
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleChat()}
                  placeholder="Ihre Frage..."
                  className="flex-1 px-3 py-2 border rounded-lg text-sm bg-background"
                />
                <Button onClick={handleChat} disabled={chatLoading || !chatInput.trim()}>
                  <MessageCircle className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          </div>
        )}

        {/* Map view */}
        {activeView === 'map' && (
          <div>
            <h2 className="font-semibold mb-4 flex items-center gap-2">
              <Map className="h-5 w-5" /> Museumsplan
            </h2>
            <Card className="p-8 text-center">
              <Map className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">
                Interaktiver Museumsplan wird geladen...
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Mapbox-Integration fuer Indoor-Navigation kommt in Kuerze.
              </p>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}

