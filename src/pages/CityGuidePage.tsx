// City Guide — Visitor-Facing Page
// Public page for city visitors: POI list, categories, map, AI chat, tours
// URL: /city/:slug

import { useParams, useSearchParams, Link } from 'react-router-dom'
import { useState, useEffect, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  MapPin, Search, Loader2, Star, ChevronRight, Globe, Filter,
  Landmark, TreePine, Building2, Utensils, Hotel, ShoppingBag,
  Church, Mountain, Eye, Route, MessageCircle, Sparkles, X,
  Navigation, Clock, Heart, Share2, Volume2,
} from 'lucide-react'
import { supabase } from '@/lib/supabase'

// POI category config with icons
const CATEGORIES = [
  { id: 'all', label: 'Alle', icon: MapPin },
  { id: 'landmark', label: 'Sehenswuerdigkeiten', icon: Landmark },
  { id: 'museum', label: 'Museen', icon: Building2 },
  { id: 'church', label: 'Kirchen', icon: Church },
  { id: 'restaurant', label: 'Restaurants', icon: Utensils },
  { id: 'hotel', label: 'Hotels', icon: Hotel },
  { id: 'shop', label: 'Shopping', icon: ShoppingBag },
  { id: 'park', label: 'Parks & Natur', icon: TreePine },
  { id: 'viewpoint', label: 'Aussichtspunkte', icon: Mountain },
  { id: 'monument', label: 'Denkmaeler', icon: Landmark },
]

interface CityInfo {
  id: string
  name: string
  description: string | null
  coverImageUrl: string | null
  poiCount: number
  languages: string[]
}

interface CityPoi {
  id: string
  content_type: string
  name: Record<string, string>
  short_description: Record<string, string>
  description: Record<string, string>
  content_brief: Record<string, string>
  content_standard: Record<string, string>
  cover_image_url: string | null
  lat: number | null
  lng: number | null
  tags: string[]
  is_featured: boolean
  is_highlight: boolean
  rating_avg: number
  review_count: number
  view_count: number
  domain_data: Record<string, unknown>
  opening_hours: Record<string, unknown>
  contact: Record<string, string>
  ai_narration: Record<string, string>
}

export default function CityGuidePage() {
  const { slug } = useParams<{ slug: string }>()
  const [searchParams] = useSearchParams()
  const lang = searchParams.get('lang') || 'de'

  const [city, setCity] = useState<CityInfo | null>(null)
  const [pois, setPois] = useState<CityPoi[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')
  const [selectedPoi, setSelectedPoi] = useState<CityPoi | null>(null)
  const [favorites, setFavorites] = useState<Set<string>>(new Set())
  const [chatOpen, setChatOpen] = useState(false)
  const [chatInput, setChatInput] = useState('')
  const [chatMessages, setChatMessages] = useState<{ role: 'user' | 'ai'; text: string }[]>([])
  const [chatLoading, setChatLoading] = useState(false)

  useEffect(() => {
    if (slug) loadCity()
    // Load favorites from localStorage
    try {
      const saved = localStorage.getItem(`fw_favorites_${slug}`)
      if (saved) setFavorites(new Set(JSON.parse(saved)))
    } catch { /* */ }
  }, [slug])

  async function loadCity() {
    setLoading(true)

    // Get city info from a content item with parent_type='city' or from parent references
    const { data: cityPois, count } = await supabase
      .from('fw_content_items')
      .select('*', { count: 'exact' })
      .eq('domain', 'cityguide')
      .eq('status', 'published')
      .ilike('parent_name', `%${slug?.replace(/-/g, ' ')}%`)
      .order('is_highlight', { ascending: false })
      .order('is_featured', { ascending: false })
      .order('sort_order')
      .limit(200)

    if (cityPois && cityPois.length > 0) {
      const first = cityPois[0]
      // Collect available languages from name fields
      const langSet = new Set<string>()
      for (const poi of cityPois) {
        if (poi.name) Object.keys(poi.name).forEach(l => langSet.add(l))
      }

      setCity({
        id: first.parent_id,
        name: first.parent_name || slug || '',
        description: null,
        coverImageUrl: first.cover_image_url,
        poiCount: count || cityPois.length,
        languages: Array.from(langSet),
      })
      setPois(cityPois as CityPoi[])
    }

    setLoading(false)
  }

  // Filter POIs
  const filteredPois = useMemo(() => {
    let result = pois
    if (category !== 'all') {
      result = result.filter(p => p.content_type === category)
    }
    if (search) {
      const q = search.toLowerCase()
      result = result.filter(p => {
        const name = p.name?.[lang] || p.name?.de || ''
        const desc = p.short_description?.[lang] || p.short_description?.de || ''
        return name.toLowerCase().includes(q) || desc.toLowerCase().includes(q) ||
          p.tags?.some(t => t.toLowerCase().includes(q))
      })
    }
    return result
  }, [pois, category, search, lang])

  const highlights = useMemo(() => pois.filter(p => p.is_highlight), [pois])

  function toggleFavorite(id: string) {
    setFavorites(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      try { localStorage.setItem(`fw_favorites_${slug}`, JSON.stringify([...next])) } catch { /* */ }
      return next
    })
  }

  function getText(field: Record<string, string> | null | undefined): string {
    if (!field) return ''
    return field[lang] || field.de || field.en || Object.values(field)[0] || ''
  }

  async function handleChat() {
    if (!chatInput.trim() || !city) return
    const userMsg = chatInput.trim()
    setChatInput('')
    setChatMessages(prev => [...prev, { role: 'user', text: userMsg }])
    setChatLoading(true)

    try {
      const { data } = await supabase.functions.invoke('fintutto-world-ai', {
        body: {
          action: 'dialog',
          context_type: 'city',
          context_id: city.id,
          context_name: city.name,
          language: lang,
          message: userMsg,
          history: chatMessages.slice(-10),
        },
      })
      setChatMessages(prev => [...prev, { role: 'ai', text: data?.response || 'Entschuldigung, ich konnte keine Antwort generieren.' }])
    } catch {
      setChatMessages(prev => [...prev, { role: 'ai', text: 'Verbindungsfehler. Bitte versuche es erneut.' }])
    }
    setChatLoading(false)
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mb-3" />
        <p className="text-sm text-muted-foreground">Lade Stadtfuehrer...</p>
      </div>
    )
  }

  if (!city) {
    return (
      <div className="text-center py-20">
        <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h2 className="text-xl font-bold mb-2">Stadt nicht gefunden</h2>
        <p className="text-muted-foreground">Kein Stadtfuehrer fuer "{slug}" verfuegbar.</p>
      </div>
    )
  }

  // POI detail view
  if (selectedPoi) {
    const name = getText(selectedPoi.name)
    const desc = getText(selectedPoi.content_standard) || getText(selectedPoi.description)
    const brief = getText(selectedPoi.content_brief) || getText(selectedPoi.short_description)
    const narration = getText(selectedPoi.ai_narration)

    return (
      <div className="max-w-2xl mx-auto space-y-4">
        <Button variant="ghost" size="sm" onClick={() => setSelectedPoi(null)} className="mb-2">
          <ChevronRight className="h-4 w-4 mr-1 rotate-180" /> Zurueck
        </Button>

        {selectedPoi.cover_image_url && (
          <img src={selectedPoi.cover_image_url} alt={name} className="w-full h-56 object-cover rounded-xl" />
        )}

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold">{name}</h1>
            <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
              <Badge variant="secondary">{CATEGORIES.find(c => c.id === selectedPoi.content_type)?.label || selectedPoi.content_type}</Badge>
              {selectedPoi.rating_avg > 0 && (
                <span className="flex items-center gap-0.5"><Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" /> {selectedPoi.rating_avg}</span>
              )}
              {selectedPoi.view_count > 0 && (
                <span className="flex items-center gap-0.5"><Eye className="h-3.5 w-3.5" /> {selectedPoi.view_count}</span>
              )}
            </div>
          </div>
          <div className="flex gap-1.5">
            <Button size="icon" variant="outline" onClick={() => toggleFavorite(selectedPoi.id)}>
              <Heart className={`h-4 w-4 ${favorites.has(selectedPoi.id) ? 'fill-red-500 text-red-500' : ''}`} />
            </Button>
            <Button size="icon" variant="outline" onClick={() => {
              if (navigator.share) navigator.share({ title: name, url: window.location.href })
            }}>
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {brief && <p className="text-muted-foreground">{brief}</p>}

        {desc && (
          <Card className="p-4">
            <p className="text-sm leading-relaxed whitespace-pre-line">{desc}</p>
          </Card>
        )}

        {narration && (
          <Card className="p-4 bg-primary/5 border-primary/20">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">KI-Erzaehlung</span>
              <Button size="sm" variant="ghost" className="ml-auto h-7">
                <Volume2 className="h-3.5 w-3.5 mr-1" /> Vorlesen
              </Button>
            </div>
            <p className="text-sm leading-relaxed">{narration}</p>
          </Card>
        )}

        {selectedPoi.lat && selectedPoi.lng && (
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm flex items-center gap-1.5">
                <Navigation className="h-4 w-4" /> GPS: {selectedPoi.lat.toFixed(5)}, {selectedPoi.lng.toFixed(5)}
              </span>
              <Button size="sm" variant="outline" asChild>
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${selectedPoi.lat},${selectedPoi.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MapPin className="h-3.5 w-3.5 mr-1" /> Navigation
                </a>
              </Button>
            </div>
          </Card>
        )}

        {selectedPoi.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {selectedPoi.tags.map(tag => (
              <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
            ))}
          </div>
        )}
      </div>
    )
  }

  // Main city guide view
  return (
    <div className="space-y-5">
      {/* City header */}
      <div className="relative">
        {city.coverImageUrl && (
          <img src={city.coverImageUrl} alt={city.name} className="w-full h-40 object-cover rounded-xl mb-3" />
        )}
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <MapPin className="h-6 w-6 text-primary" />
            {city.name}
          </h1>
          <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
            <span>{city.poiCount} Orte</span>
            {city.languages.length > 0 && (
              <span className="flex items-center gap-1">
                <Globe className="h-3.5 w-3.5" /> {city.languages.join(', ')}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Highlights */}
      {highlights.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-2 flex items-center gap-1.5">
            <Star className="h-5 w-5 text-amber-500" /> Highlights
          </h2>
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1">
            {highlights.slice(0, 8).map(poi => (
              <Card
                key={poi.id}
                className="min-w-[200px] max-w-[200px] flex-shrink-0 cursor-pointer hover:shadow-md transition-shadow overflow-hidden"
                onClick={() => setSelectedPoi(poi)}
              >
                {poi.cover_image_url && (
                  <img src={poi.cover_image_url} alt={getText(poi.name)} className="w-full h-24 object-cover" />
                )}
                <div className="p-2.5">
                  <h3 className="font-medium text-sm truncate">{getText(poi.name)}</h3>
                  <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                    {getText(poi.short_description) || getText(poi.content_brief)}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Search + filters */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Suche nach Orten, Restaurants, Museen..."
            className="pl-10"
          />
          {search && (
            <Button size="icon" variant="ghost" className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7" onClick={() => setSearch('')}>
              <X className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>

        <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-1 px-1">
          {CATEGORIES.map(cat => {
            const Icon = cat.icon
            const isActive = category === cat.id
            return (
              <Button
                key={cat.id}
                size="sm"
                variant={isActive ? 'default' : 'outline'}
                className="flex-shrink-0 h-8 text-xs"
                onClick={() => setCategory(cat.id)}
              >
                <Icon className="h-3.5 w-3.5 mr-1" />
                {cat.label}
              </Button>
            )
          })}
        </div>
      </div>

      {/* POI list */}
      <div className="space-y-2">
        <p className="text-xs text-muted-foreground">{filteredPois.length} Ergebnisse</p>
        {filteredPois.length === 0 ? (
          <Card className="p-8 text-center">
            <Search className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Keine Ergebnisse gefunden.</p>
          </Card>
        ) : (
          filteredPois.map(poi => {
            const name = getText(poi.name)
            const brief = getText(poi.short_description) || getText(poi.content_brief)
            const catConfig = CATEGORIES.find(c => c.id === poi.content_type)
            const CatIcon = catConfig?.icon || MapPin

            return (
              <Card
                key={poi.id}
                className="p-3 flex gap-3 cursor-pointer hover:shadow-sm transition-shadow"
                onClick={() => setSelectedPoi(poi)}
              >
                {poi.cover_image_url ? (
                  <img src={poi.cover_image_url} alt={name} className="w-16 h-16 rounded-lg object-cover flex-shrink-0" />
                ) : (
                  <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                    <CatIcon className="h-6 w-6 text-muted-foreground" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-medium text-sm truncate">{name}</h3>
                    {poi.is_highlight && <Star className="h-3 w-3 text-amber-500 fill-amber-500 flex-shrink-0" />}
                  </div>
                  {brief && <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{brief}</p>}
                  <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                    <Badge variant="outline" className="text-[10px] h-4">{catConfig?.label || poi.content_type}</Badge>
                    {poi.rating_avg > 0 && (
                      <span className="flex items-center gap-0.5">
                        <Star className="h-2.5 w-2.5 text-amber-500 fill-amber-500" /> {poi.rating_avg}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex flex-col items-center gap-1 flex-shrink-0">
                  <Button size="icon" variant="ghost" className="h-7 w-7" onClick={e => { e.stopPropagation(); toggleFavorite(poi.id) }}>
                    <Heart className={`h-3.5 w-3.5 ${favorites.has(poi.id) ? 'fill-red-500 text-red-500' : ''}`} />
                  </Button>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </Card>
            )
          })
        )}
      </div>

      {/* Floating AI chat button */}
      <div className="fixed bottom-20 right-4 z-50">
        <Button
          size="lg"
          className="rounded-full shadow-lg h-14 w-14 p-0"
          onClick={() => setChatOpen(!chatOpen)}
        >
          {chatOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
        </Button>
      </div>

      {/* Chat overlay */}
      {chatOpen && (
        <div className="fixed bottom-36 right-4 z-50 w-80 max-h-[400px] bg-background border rounded-xl shadow-xl flex flex-col">
          <div className="p-3 border-b flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="font-medium text-sm">Stadt-Assistent</span>
            <Badge variant="secondary" className="text-[10px] ml-auto">KI</Badge>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-2 max-h-[250px]">
            {chatMessages.length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-4">
                Frag mich alles ueber {city.name}! Tipps, Restaurants, Geschichte...
              </p>
            )}
            {chatMessages.map((msg, i) => (
              <div key={i} className={`text-sm p-2 rounded-lg max-w-[90%] ${
                msg.role === 'user'
                  ? 'bg-primary text-primary-foreground ml-auto'
                  : 'bg-muted'
              }`}>
                {msg.text}
              </div>
            ))}
            {chatLoading && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Loader2 className="h-3 w-3 animate-spin" /> Denke nach...
              </div>
            )}
          </div>

          <div className="p-2 border-t flex gap-1.5">
            <Input
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleChat()}
              placeholder="Frage stellen..."
              className="h-8 text-sm"
            />
            <Button size="sm" className="h-8" onClick={handleChat} disabled={chatLoading || !chatInput.trim()}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
