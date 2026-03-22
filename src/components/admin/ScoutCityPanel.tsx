// Fintutto World — Scout City Panel
// AI-powered POI generator: Enter a city/region → AI generates POIs → Review → Save
// Exposes the content-enrich 'scout_city' action as a curator-friendly UI

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  MapPin, Sparkles, Loader2, Check, X, Save, ChevronDown, ChevronUp,
  Globe, Star, Building2, TreePine, Utensils, ShoppingBag, Landmark,
  Mountain, Church, Eye,
} from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface ScoutedPoi {
  name: string
  type: string
  description: string
  short_description: string
  lat: number
  lng: number
  tags: string[]
  rating: number
  selected: boolean
  saving: boolean
  saved: boolean
}

const CATEGORY_ICONS: Record<string, typeof MapPin> = {
  landmark: Landmark,
  museum: Building2,
  church: Church,
  restaurant: Utensils,
  shop: ShoppingBag,
  park: TreePine,
  viewpoint: Mountain,
  monument: Landmark,
}

const DOMAINS = [
  { id: 'cityguide', label: 'Stadt' },
  { id: 'regionguide', label: 'Region' },
  { id: 'natureguide', label: 'Natur' },
  { id: 'eventguide', label: 'Event' },
]

const LANGUAGES = [
  { code: 'de', label: 'Deutsch' },
  { code: 'en', label: 'English' },
  { code: 'fr', label: 'Francais' },
  { code: 'it', label: 'Italiano' },
  { code: 'es', label: 'Espanol' },
]

export default function ScoutCityPanel() {
  const [cityName, setCityName] = useState('')
  const [country, setCountry] = useState('Deutschland')
  const [domain, setDomain] = useState('cityguide')
  const [languages, setLanguages] = useState(['de', 'en'])
  const [maxPois, setMaxPois] = useState(30)
  const [scouting, setScouting] = useState(false)
  const [pois, setPois] = useState<ScoutedPoi[]>([])
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null)
  const [savingAll, setSavingAll] = useState(false)
  const [savedCount, setSavedCount] = useState(0)
  const [error, setError] = useState<string | null>(null)

  async function handleScout() {
    if (!cityName.trim()) return
    setScouting(true)
    setError(null)
    setPois([])
    setSavedCount(0)

    try {
      const { data, error: fnError } = await supabase.functions.invoke('content-enrich', {
        body: {
          action: 'scout_city',
          city_name: cityName.trim(),
          country: country.trim(),
          languages,
          max_pois: maxPois,
        },
      })

      if (fnError) throw fnError

      const scoutedPois = (data?.pois || data?.items || []).map((p: Record<string, unknown>) => ({
        name: (p.name as Record<string, string>)?.de || (p.name as string) || '',
        type: (p.content_type as string) || (p.type as string) || 'landmark',
        description: (p.description as Record<string, string>)?.de || (p.description as string) || '',
        short_description: (p.short_description as Record<string, string>)?.de || '',
        lat: (p.lat as number) || 0,
        lng: (p.lng as number) || 0,
        tags: (p.tags as string[]) || [],
        rating: (p.rating as number) || 0,
        selected: true,
        saving: false,
        saved: false,
      }))

      setPois(scoutedPois)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Scout fehlgeschlagen')
    } finally {
      setScouting(false)
    }
  }

  function togglePoi(idx: number) {
    setPois(prev => prev.map((p, i) => i === idx ? { ...p, selected: !p.selected } : p))
  }

  function selectAll(selected: boolean) {
    setPois(prev => prev.map(p => ({ ...p, selected })))
  }

  async function savePoi(poi: ScoutedPoi, idx: number) {
    setPois(prev => prev.map((p, i) => i === idx ? { ...p, saving: true } : p))

    try {
      const parentType = domain === 'cityguide' ? 'city' : domain === 'regionguide' ? 'region' : 'event'

      const { error } = await supabase.from('fw_content_items').insert({
        content_type: poi.type,
        domain,
        parent_type: parentType,
        parent_name: cityName,
        name: { de: poi.name },
        slug: poi.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        description: { de: poi.description },
        short_description: { de: poi.short_description },
        lat: poi.lat,
        lng: poi.lng,
        tags: poi.tags,
        rating_avg: poi.rating,
        status: 'draft',
        is_highlight: poi.rating >= 4.5,
      })

      if (error) throw error

      setPois(prev => prev.map((p, i) => i === idx ? { ...p, saving: false, saved: true } : p))
      setSavedCount(prev => prev + 1)
    } catch {
      setPois(prev => prev.map((p, i) => i === idx ? { ...p, saving: false } : p))
    }
  }

  async function saveAllSelected() {
    setSavingAll(true)
    const selected = pois.filter((p, i) => p.selected && !p.saved)
    for (let i = 0; i < pois.length; i++) {
      if (pois[i].selected && !pois[i].saved) {
        await savePoi(pois[i], i)
      }
    }
    setSavingAll(false)
  }

  const selectedCount = pois.filter(p => p.selected && !p.saved).length
  const totalSaved = pois.filter(p => p.saved).length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Sparkles className="h-6 w-6" />
          City Scout — KI-Inhaltsgenerator
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Gib eine Stadt oder Region ein — die KI generiert automatisch Sehenswuerdigkeiten,
          Restaurants, Museen und mehr. Du pruefst und uebernimmst per Klick.
        </p>
      </div>

      {/* Input Form */}
      <Card className="p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1">
            <Label>Stadt / Region *</Label>
            <Input
              value={cityName}
              onChange={e => setCityName(e.target.value)}
              placeholder="z.B. Wien, Salzburg, Lago di Garda..."
              onKeyDown={e => e.key === 'Enter' && handleScout()}
            />
          </div>
          <div className="space-y-1">
            <Label>Land</Label>
            <Input
              value={country}
              onChange={e => setCountry(e.target.value)}
              placeholder="z.B. Deutschland, Oesterreich..."
            />
          </div>
          <div className="space-y-1">
            <Label>Bereich</Label>
            <Select value={domain} onValueChange={setDomain}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DOMAINS.map(d => (
                  <SelectItem key={d.id} value={d.id}>{d.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1">
            <Label>Sprachen</Label>
            <div className="flex gap-1 flex-wrap">
              {LANGUAGES.map(lang => {
                const isActive = languages.includes(lang.code)
                return (
                  <button
                    key={lang.code}
                    onClick={() => {
                      if (isActive && languages.length > 1) {
                        setLanguages(languages.filter(l => l !== lang.code))
                      } else if (!isActive) {
                        setLanguages([...languages, lang.code])
                      }
                    }}
                    className={`px-2 py-1 rounded text-xs font-medium transition ${
                      isActive ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {lang.code.toUpperCase()}
                  </button>
                )
              })}
            </div>
          </div>
          <div className="space-y-1">
            <Label>Max. Anzahl POIs</Label>
            <Select value={String(maxPois)} onValueChange={v => setMaxPois(Number(v))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10 POIs</SelectItem>
                <SelectItem value="20">20 POIs</SelectItem>
                <SelectItem value="30">30 POIs</SelectItem>
                <SelectItem value="50">50 POIs</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-end">
            <Button onClick={handleScout} disabled={scouting || !cityName.trim()} className="w-full">
              {scouting ? (
                <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Scoute {cityName}...</>
              ) : (
                <><Sparkles className="h-4 w-4 mr-2" /> Scout starten</>
              )}
            </Button>
          </div>
        </div>
      </Card>

      {/* Error */}
      {error && (
        <Card className="p-4 border-red-300 bg-red-50 text-red-700 text-sm">
          Fehler: {error}
        </Card>
      )}

      {/* Results */}
      {pois.length > 0 && (
        <>
          {/* Actions Bar */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium">{pois.length} POIs gefunden</span>
              {totalSaved > 0 && (
                <Badge variant="default" className="bg-green-600">{totalSaved} gespeichert</Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => selectAll(true)}>
                Alle waehlen
              </Button>
              <Button variant="ghost" size="sm" onClick={() => selectAll(false)}>
                Keine waehlen
              </Button>
              <Button
                onClick={saveAllSelected}
                disabled={savingAll || selectedCount === 0}
              >
                {savingAll ? (
                  <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Speichere...</>
                ) : (
                  <><Save className="h-4 w-4 mr-2" /> {selectedCount} uebernehmen</>
                )}
              </Button>
            </div>
          </div>

          {/* POI List */}
          <div className="space-y-2">
            {pois.map((poi, idx) => {
              const isExpanded = expandedIdx === idx
              const CategoryIcon = CATEGORY_ICONS[poi.type] || MapPin

              return (
                <Card key={idx} className={`overflow-hidden transition ${poi.saved ? 'opacity-60' : ''}`}>
                  <div className="flex items-center gap-3 p-3">
                    {/* Checkbox */}
                    <button
                      onClick={() => togglePoi(idx)}
                      disabled={poi.saved}
                      className={`w-5 h-5 rounded border-2 shrink-0 flex items-center justify-center transition ${
                        poi.selected
                          ? poi.saved ? 'bg-green-500 border-green-500' : 'bg-primary border-primary'
                          : 'border-muted-foreground/30'
                      }`}
                    >
                      {(poi.selected || poi.saved) && <Check className="h-3 w-3 text-white" />}
                    </button>

                    {/* Icon + Name */}
                    <CategoryIcon className="h-4 w-4 text-muted-foreground shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">{poi.name}</div>
                      <div className="text-xs text-muted-foreground truncate">{poi.short_description || poi.description?.slice(0, 80)}</div>
                    </div>

                    {/* Tags */}
                    <div className="hidden md:flex gap-1">
                      {poi.tags.slice(0, 3).map(t => (
                        <Badge key={t} variant="secondary" className="text-[10px]">{t}</Badge>
                      ))}
                    </div>

                    {/* Rating */}
                    {poi.rating > 0 && (
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
                        <span className="text-xs font-mono">{poi.rating.toFixed(1)}</span>
                      </div>
                    )}

                    {/* Status */}
                    {poi.saved ? (
                      <Badge variant="default" className="bg-green-600 text-[10px]">Gespeichert</Badge>
                    ) : poi.saving ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Button variant="ghost" size="sm" onClick={() => savePoi(poi, idx)} className="text-xs h-7">
                        <Save className="h-3 w-3 mr-1" /> Speichern
                      </Button>
                    )}

                    {/* Expand */}
                    <button onClick={() => setExpandedIdx(isExpanded ? null : idx)}>
                      {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </button>
                  </div>

                  {/* Expanded Detail */}
                  {isExpanded && (
                    <div className="px-3 pb-3 pt-1 border-t space-y-2">
                      <div className="text-sm">{poi.description}</div>
                      {poi.lat !== 0 && (
                        <div className="text-xs text-muted-foreground flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {poi.lat.toFixed(5)}, {poi.lng.toFixed(5)}
                        </div>
                      )}
                      {poi.tags.length > 0 && (
                        <div className="flex gap-1 flex-wrap">
                          {poi.tags.map(t => (
                            <Badge key={t} variant="outline" className="text-[10px]">{t}</Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </Card>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
