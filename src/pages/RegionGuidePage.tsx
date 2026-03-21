// Region Guide — Visitor-Facing Page
// Shows region overview with sub-entities (cities, museums, POIs), tours, map
// URL: /region/:slug

import { useParams, useSearchParams, Link } from 'react-router-dom'
import { useState, useEffect, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  MapPin, Search, Loader2, Star, ChevronRight, Globe,
  Mountain, Building2, Landmark, TreePine, Route as RouteIcon,
  MessageCircle, Sparkles, X, Navigation, Heart, Share2,
  Map, Users, Compass, Camera,
} from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface SubEntity {
  parent_id: string
  parent_name: string
  parent_type: string
  count: number
  cover_image_url: string | null
}

interface RegionPoi {
  id: string
  content_type: string
  name: Record<string, string>
  short_description: Record<string, string>
  content_brief: Record<string, string>
  content_standard: Record<string, string>
  cover_image_url: string | null
  lat: number | null
  lng: number | null
  tags: string[]
  is_featured: boolean
  is_highlight: boolean
  rating_avg: number
  parent_name: string | null
  parent_type: string
  parent_id: string
  domain_data: Record<string, unknown>
  ai_narration: Record<string, string>
}

export default function RegionGuidePage() {
  const { slug } = useParams<{ slug: string }>()
  const [searchParams] = useSearchParams()
  const lang = searchParams.get('lang') || 'de'

  const [regionName, setRegionName] = useState('')
  const [regionId, setRegionId] = useState('')
  const [subEntities, setSubEntities] = useState<SubEntity[]>([])
  const [pois, setPois] = useState<RegionPoi[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [activeTab, setActiveTab] = useState<'overview' | 'cities' | 'pois' | 'tours'>('overview')
  const [selectedSubEntity, setSelectedSubEntity] = useState<string | null>(null)
  const [selectedPoi, setSelectedPoi] = useState<RegionPoi | null>(null)
  const [chatOpen, setChatOpen] = useState(false)
  const [chatInput, setChatInput] = useState('')
  const [chatMessages, setChatMessages] = useState<{ role: 'user' | 'ai'; text: string }[]>([])
  const [chatLoading, setChatLoading] = useState(false)

  useEffect(() => { if (slug) loadRegion() }, [slug])

  async function loadRegion() {
    setLoading(true)

    // Load all content items under this region (region → cities → pois)
    const { data: allItems } = await supabase
      .from('fw_content_items')
      .select('*')
      .eq('domain', 'regionguide')
      .eq('status', 'published')
      .ilike('parent_name', `%${slug?.replace(/-/g, ' ')}%`)
      .order('is_highlight', { ascending: false })
      .order('sort_order')
      .limit(500)

    if (allItems && allItems.length > 0) {
      setRegionName(allItems[0].parent_name || slug || '')
      setRegionId(allItems[0].parent_id)
      setPois(allItems as RegionPoi[])

      // Build sub-entity list (group by parent references in domain_data)
      const entityMap = new Map<string, SubEntity>()
      for (const item of allItems) {
        const subParent = (item.domain_data as Record<string, unknown>)?.sub_parent_name as string
        const subParentId = (item.domain_data as Record<string, unknown>)?.sub_parent_id as string
        const subParentType = (item.domain_data as Record<string, unknown>)?.sub_parent_type as string

        if (subParent && subParentId) {
          const existing = entityMap.get(subParentId)
          if (existing) {
            existing.count++
            if (!existing.cover_image_url && item.cover_image_url) {
              existing.cover_image_url = item.cover_image_url
            }
          } else {
            entityMap.set(subParentId, {
              parent_id: subParentId,
              parent_name: subParent,
              parent_type: subParentType || 'city',
              count: 1,
              cover_image_url: item.cover_image_url,
            })
          }
        }
      }
      setSubEntities(Array.from(entityMap.values()).sort((a, b) => b.count - a.count))
    }

    setLoading(false)
  }

  function getText(field: Record<string, string> | null | undefined): string {
    if (!field) return ''
    return field[lang] || field.de || field.en || Object.values(field)[0] || ''
  }

  const filteredPois = useMemo(() => {
    let result = pois
    if (selectedSubEntity) {
      result = result.filter(p =>
        (p.domain_data as Record<string, unknown>)?.sub_parent_id === selectedSubEntity,
      )
    }
    if (search) {
      const q = search.toLowerCase()
      result = result.filter(p => {
        const name = p.name?.[lang] || p.name?.de || ''
        return name.toLowerCase().includes(q) || p.tags?.some(t => t.toLowerCase().includes(q))
      })
    }
    return result
  }, [pois, selectedSubEntity, search, lang])

  const highlights = useMemo(() => pois.filter(p => p.is_highlight).slice(0, 6), [pois])

  const typeStats = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const p of pois) {
      counts[p.content_type] = (counts[p.content_type] || 0) + 1
    }
    return Object.entries(counts).sort((a, b) => b[1] - a[1])
  }, [pois])

  async function handleChat() {
    if (!chatInput.trim()) return
    const userMsg = chatInput.trim()
    setChatInput('')
    setChatMessages(prev => [...prev, { role: 'user', text: userMsg }])
    setChatLoading(true)

    try {
      const { data } = await supabase.functions.invoke('fintutto-world-ai', {
        body: {
          action: 'dialog',
          context_type: 'region',
          context_id: regionId,
          context_name: regionName,
          language: lang,
          message: userMsg,
          history: chatMessages.slice(-10),
        },
      })
      setChatMessages(prev => [...prev, { role: 'ai', text: data?.response || 'Entschuldigung, bitte versuche es erneut.' }])
    } catch {
      setChatMessages(prev => [...prev, { role: 'ai', text: 'Verbindungsfehler.' }])
    }
    setChatLoading(false)
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mb-3" />
        <p className="text-sm text-muted-foreground">Lade Regionsfuehrer...</p>
      </div>
    )
  }

  if (!regionName) {
    return (
      <div className="text-center py-20">
        <Mountain className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h2 className="text-xl font-bold mb-2">Region nicht gefunden</h2>
        <p className="text-muted-foreground">Kein Regionsfuehrer fuer "{slug}" verfuegbar.</p>
      </div>
    )
  }

  // POI detail
  if (selectedPoi) {
    const name = getText(selectedPoi.name)
    const desc = getText(selectedPoi.content_standard) || getText(selectedPoi.short_description)
    const narration = getText(selectedPoi.ai_narration)

    return (
      <div className="max-w-2xl mx-auto space-y-4">
        <Button variant="ghost" size="sm" onClick={() => setSelectedPoi(null)}>
          <ChevronRight className="h-4 w-4 mr-1 rotate-180" /> Zurueck
        </Button>
        {selectedPoi.cover_image_url && (
          <img src={selectedPoi.cover_image_url} alt={name} className="w-full h-48 object-cover rounded-xl" />
        )}
        <h1 className="text-2xl font-bold">{name}</h1>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Badge variant="secondary">{selectedPoi.content_type}</Badge>
          {selectedPoi.parent_name && <span>in {selectedPoi.parent_name}</span>}
          {selectedPoi.rating_avg > 0 && (
            <span className="flex items-center gap-0.5"><Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" /> {selectedPoi.rating_avg}</span>
          )}
        </div>
        {desc && <Card className="p-4"><p className="text-sm leading-relaxed whitespace-pre-line">{desc}</p></Card>}
        {narration && (
          <Card className="p-4 bg-primary/5 border-primary/20">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">KI-Erzaehlung</span>
            </div>
            <p className="text-sm leading-relaxed">{narration}</p>
          </Card>
        )}
        {selectedPoi.lat && selectedPoi.lng && (
          <Button variant="outline" asChild>
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${selectedPoi.lat},${selectedPoi.lng}`}
              target="_blank" rel="noopener noreferrer"
            >
              <Navigation className="h-4 w-4 mr-2" /> Navigation starten
            </a>
          </Button>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {/* Region header */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Mountain className="h-6 w-6 text-primary" />
          {regionName}
        </h1>
        <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
          <span>{pois.length} Orte</span>
          <span>{subEntities.length} Staedte/Gemeinden</span>
          {typeStats.length > 0 && (
            <span>{typeStats.map(([t, c]) => `${c} ${t}`).slice(0, 3).join(', ')}</span>
          )}
        </div>
      </div>

      {/* Tab navigation */}
      <div className="flex gap-1.5 border-b pb-2">
        {[
          { id: 'overview', label: 'Uebersicht', icon: Compass },
          { id: 'cities', label: 'Staedte', icon: Building2 },
          { id: 'pois', label: 'Alle Orte', icon: MapPin },
        ].map(tab => (
          <Button
            key={tab.id}
            size="sm"
            variant={activeTab === tab.id ? 'default' : 'ghost'}
            onClick={() => { setActiveTab(tab.id as typeof activeTab); setSelectedSubEntity(null) }}
            className="text-xs"
          >
            <tab.icon className="h-3.5 w-3.5 mr-1" /> {tab.label}
          </Button>
        ))}
      </div>

      {/* Overview tab */}
      {activeTab === 'overview' && (
        <div className="space-y-5">
          {/* Highlights */}
          {highlights.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold mb-2 flex items-center gap-1.5">
                <Star className="h-5 w-5 text-amber-500" /> Highlights der Region
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {highlights.map(poi => (
                  <Card
                    key={poi.id}
                    className="cursor-pointer hover:shadow-md transition-shadow overflow-hidden"
                    onClick={() => setSelectedPoi(poi)}
                  >
                    {poi.cover_image_url ? (
                      <img src={poi.cover_image_url} alt={getText(poi.name)} className="w-full h-28 object-cover" />
                    ) : (
                      <div className="w-full h-28 bg-muted flex items-center justify-center">
                        <Camera className="h-8 w-8 text-muted-foreground/40" />
                      </div>
                    )}
                    <div className="p-2.5">
                      <h3 className="font-medium text-sm truncate">{getText(poi.name)}</h3>
                      <p className="text-xs text-muted-foreground truncate">{poi.parent_name}</p>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Sub-entities (cities/towns) */}
          {subEntities.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold mb-2 flex items-center gap-1.5">
                <Building2 className="h-5 w-5" /> Staedte & Gemeinden
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {subEntities.map(entity => (
                  <Card
                    key={entity.parent_id}
                    className="p-3 cursor-pointer hover:shadow-sm transition-shadow"
                    onClick={() => { setSelectedSubEntity(entity.parent_id); setActiveTab('pois') }}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                        {entity.parent_type === 'museum' ? <Landmark className="h-5 w-5 text-muted-foreground" /> : <Building2 className="h-5 w-5 text-muted-foreground" />}
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-medium text-sm truncate">{entity.parent_name}</h3>
                        <p className="text-xs text-muted-foreground">{entity.count} Orte</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Type breakdown */}
          {typeStats.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold mb-2">Kategorien</h2>
              <div className="flex flex-wrap gap-2">
                {typeStats.map(([type, count]) => (
                  <Badge key={type} variant="outline" className="text-sm py-1 px-3 cursor-pointer hover:bg-muted"
                    onClick={() => { setActiveTab('pois'); setSearch(type) }}
                  >
                    {type} ({count})
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Cities tab */}
      {activeTab === 'cities' && (
        <div className="space-y-2">
          {subEntities.length === 0 ? (
            <Card className="p-8 text-center">
              <Building2 className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Keine Staedte in dieser Region erfasst.</p>
            </Card>
          ) : (
            subEntities.map(entity => (
              <Card key={entity.parent_id}
                className="p-3 flex items-center gap-3 cursor-pointer hover:shadow-sm"
                onClick={() => { setSelectedSubEntity(entity.parent_id); setActiveTab('pois') }}
              >
                {entity.cover_image_url ? (
                  <img src={entity.cover_image_url} alt={entity.parent_name} className="w-14 h-14 rounded-lg object-cover flex-shrink-0" />
                ) : (
                  <div className="w-14 h-14 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                    <Building2 className="h-6 w-6 text-muted-foreground" />
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="font-medium">{entity.parent_name}</h3>
                  <p className="text-sm text-muted-foreground">{entity.count} Sehenswuerdigkeiten & Orte</p>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </Card>
            ))
          )}
        </div>
      )}

      {/* POIs tab */}
      {activeTab === 'pois' && (
        <div className="space-y-3">
          {selectedSubEntity && (
            <div className="flex items-center gap-2">
              <Badge variant="secondary">
                {subEntities.find(e => e.parent_id === selectedSubEntity)?.parent_name}
              </Badge>
              <Button size="sm" variant="ghost" className="h-6 text-xs" onClick={() => setSelectedSubEntity(null)}>
                <X className="h-3 w-3 mr-0.5" /> Filter entfernen
              </Button>
            </div>
          )}

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Orte suchen..."
              className="pl-10"
            />
          </div>

          <p className="text-xs text-muted-foreground">{filteredPois.length} Ergebnisse</p>

          {filteredPois.map(poi => (
            <Card
              key={poi.id}
              className="p-3 flex gap-3 cursor-pointer hover:shadow-sm"
              onClick={() => setSelectedPoi(poi)}
            >
              {poi.cover_image_url ? (
                <img src={poi.cover_image_url} alt={getText(poi.name)} className="w-14 h-14 rounded-lg object-cover flex-shrink-0" />
              ) : (
                <div className="w-14 h-14 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                  <MapPin className="h-5 w-5 text-muted-foreground" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-sm truncate">{getText(poi.name)}</h3>
                <p className="text-xs text-muted-foreground line-clamp-1">
                  {getText(poi.short_description) || getText(poi.content_brief)}
                </p>
                <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground">
                  <Badge variant="outline" className="text-[10px] h-4">{poi.content_type}</Badge>
                  {poi.parent_name && <span>{poi.parent_name}</span>}
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground self-center" />
            </Card>
          ))}
        </div>
      )}

      {/* Floating AI chat */}
      <div className="fixed bottom-20 right-4 z-50">
        <Button size="lg" className="rounded-full shadow-lg h-14 w-14 p-0" onClick={() => setChatOpen(!chatOpen)}>
          {chatOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
        </Button>
      </div>

      {chatOpen && (
        <div className="fixed bottom-36 right-4 z-50 w-80 max-h-[400px] bg-background border rounded-xl shadow-xl flex flex-col">
          <div className="p-3 border-b flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="font-medium text-sm">Regions-Assistent</span>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2 max-h-[250px]">
            {chatMessages.length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-4">
                Frag mich ueber die Region {regionName}!
              </p>
            )}
            {chatMessages.map((msg, i) => (
              <div key={i} className={`text-sm p-2 rounded-lg max-w-[90%] ${
                msg.role === 'user' ? 'bg-primary text-primary-foreground ml-auto' : 'bg-muted'
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
