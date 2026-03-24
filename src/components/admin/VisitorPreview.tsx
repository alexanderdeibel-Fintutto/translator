// Fintutto World — Visitor Preview
// Zeigt Content so an wie der Endbenutzer (Besucher) ihn sehen wuerde
// Unterstuetzt verschiedene Sprachen, Zielgruppen und Geraetegroessen

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Eye, Smartphone, Tablet, Monitor, Search, Loader2,
  Globe, MapPin, Star, Volume2, ChevronLeft, ChevronRight,
  Image as ImageIcon, Navigation, Clock, ExternalLink,
} from 'lucide-react'
import { supabase } from '@/lib/supabase'

// ── Types ───────────────────────────────────────────────────────────

interface PreviewItem {
  id: string
  name: Record<string, string>
  slug: string
  content_type: string
  domain: string
  status: string
  cover_image_url: string | null
  content_brief: Record<string, string>
  content_standard: Record<string, string>
  content_detailed: Record<string, string>
  content_children: Record<string, string>
  content_youth: Record<string, string>
  content_fun_facts: Record<string, string>
  content_historical: Record<string, string>
  content_technique: Record<string, string>
  lat: number | null
  lng: number | null
  address: Record<string, string>
  tags: string[]
  rating_avg: number
  review_count: number
  is_highlight: boolean
  parent_name: string | null
}

type DeviceMode = 'mobile' | 'tablet' | 'desktop'
type AudienceMode = 'standard' | 'children' | 'youth' | 'detailed'

const LANGUAGES = [
  { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'fr', label: 'Francais', flag: '🇫🇷' },
  { code: 'it', label: 'Italiano', flag: '🇮🇹' },
  { code: 'es', label: 'Espanol', flag: '🇪🇸' },
  { code: 'ar', label: 'Arabic', flag: '🇸🇦' },
  { code: 'zh', label: 'Chinese', flag: '🇨🇳' },
  { code: 'ja', label: 'Japanese', flag: '🇯🇵' },
]

const DEVICE_CONFIG: Record<DeviceMode, { width: string; icon: typeof Monitor; label: string }> = {
  mobile: { width: 'max-w-[375px]', icon: Smartphone, label: 'Mobil' },
  tablet: { width: 'max-w-[768px]', icon: Tablet, label: 'Tablet' },
  desktop: { width: 'max-w-[1024px]', icon: Monitor, label: 'Desktop' },
}

const AUDIENCE_CONFIG: Record<AudienceMode, { label: string; contentKey: string }> = {
  standard: { label: 'Standard', contentKey: 'content_standard' },
  children: { label: 'Kinder (6-12)', contentKey: 'content_children' },
  youth: { label: 'Jugendliche (13-17)', contentKey: 'content_youth' },
  detailed: { label: 'Detailliert', contentKey: 'content_detailed' },
}

// ── Component ───────────────────────────────────────────────────────

export default function VisitorPreview() {
  const [items, setItems] = useState<PreviewItem[]>([])
  const [selectedItem, setSelectedItem] = useState<PreviewItem | null>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [lang, setLang] = useState('de')
  const [device, setDevice] = useState<DeviceMode>('mobile')
  const [audience, setAudience] = useState<AudienceMode>('standard')

  useEffect(() => { loadItems() }, [])

  async function loadItems() {
    setLoading(true)
    const { data } = await supabase
      .from('fw_content_items')
      .select('id, name, slug, content_type, domain, status, cover_image_url, content_brief, content_standard, content_detailed, content_children, content_youth, content_fun_facts, content_historical, content_technique, lat, lng, address, tags, rating_avg, review_count, is_highlight, parent_name')
      .in('status', ['published', 'review'])
      .order('sort_order', { ascending: true })
      .limit(100)

    const loaded = (data || []) as PreviewItem[]
    setItems(loaded)
    if (loaded.length > 0 && !selectedItem) {
      setSelectedItem(loaded[0])
    }
    setLoading(false)
  }

  // ── Text getters ──────────────────────────────────────────────────

  function getText(item: PreviewItem, field: string): string {
    const content = item[field as keyof PreviewItem] as Record<string, string> | null
    return content?.[lang] || content?.de || ''
  }

  function getMainContent(item: PreviewItem): string {
    const config = AUDIENCE_CONFIG[audience]
    const text = getText(item, config.contentKey)
    if (text) return text
    // Fallback to standard
    return getText(item, 'content_standard') || getText(item, 'content_brief') || ''
  }

  function getName(item: PreviewItem): string {
    return item.name?.[lang] || item.name?.de || item.slug || '—'
  }

  // ── Filter ──────────────────────────────────────────────────────

  const filteredItems = search
    ? items.filter(i => {
        const name = (i.name?.de || i.slug).toLowerCase()
        return name.includes(search.toLowerCase())
      })
    : items

  const isRtl = lang === 'ar'
  const deviceConfig = DEVICE_CONFIG[device]

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Eye className="h-6 w-6" />
          Besucher-Vorschau
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Vorschau wie Besucher den Inhalt auf verschiedenen Geraeten sehen.
        </p>
      </div>

      {/* Controls bar */}
      <div className="flex flex-wrap gap-3 items-end p-3 bg-muted/30 rounded-lg border">
        {/* Language */}
        <div className="space-y-1">
          <label className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Sprache</label>
          <Select value={lang} onValueChange={setLang}>
            <SelectTrigger className="w-36 h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {LANGUAGES.map(l => (
                <SelectItem key={l.code} value={l.code}>{l.flag} {l.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Audience */}
        <div className="space-y-1">
          <label className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Zielgruppe</label>
          <Select value={audience} onValueChange={v => setAudience(v as AudienceMode)}>
            <SelectTrigger className="w-40 h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(AUDIENCE_CONFIG).map(([key, cfg]) => (
                <SelectItem key={key} value={key}>{cfg.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Device */}
        <div className="space-y-1">
          <label className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Geraet</label>
          <div className="flex gap-1">
            {(Object.entries(DEVICE_CONFIG) as [DeviceMode, typeof DEVICE_CONFIG.mobile][]).map(([key, cfg]) => (
              <Button
                key={key}
                variant={device === key ? 'default' : 'outline'}
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => setDevice(key)}
                title={cfg.label}
              >
                <cfg.icon className="h-3.5 w-3.5" />
              </Button>
            ))}
          </div>
        </div>

        {/* Search */}
        <div className="flex-1 space-y-1 min-w-[150px]">
          <label className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Inhalt</label>
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Suchen..."
              className="pl-7 h-8 text-xs"
            />
          </div>
        </div>
      </div>

      {/* Main area: item picker + preview */}
      <div className="grid md:grid-cols-[280px_1fr] gap-4">
        {/* Item list (left sidebar) */}
        <div className="space-y-1 max-h-[600px] overflow-y-auto border rounded-lg p-2">
          {filteredItems.map(item => (
            <button
              key={item.id}
              className={`w-full text-left p-2 rounded-lg text-sm transition flex items-center gap-2 ${
                selectedItem?.id === item.id
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-muted'
              }`}
              onClick={() => setSelectedItem(item)}
            >
              {item.cover_image_url ? (
                <img src={item.cover_image_url} alt="" className="w-8 h-8 rounded object-cover flex-shrink-0" />
              ) : (
                <div className="w-8 h-8 rounded bg-muted flex items-center justify-center flex-shrink-0">
                  <Globe className="h-4 w-4" />
                </div>
              )}
              <div className="min-w-0">
                <p className="font-medium text-xs truncate">{getName(item)}</p>
                <p className={`text-[10px] ${selectedItem?.id === item.id ? 'opacity-70' : 'text-muted-foreground'}`}>
                  {item.content_type}
                </p>
              </div>
              {item.is_highlight && <Star className="h-3 w-3 text-amber-500 flex-shrink-0" />}
            </button>
          ))}
          {filteredItems.length === 0 && (
            <p className="text-xs text-muted-foreground text-center py-4">Keine Eintraege gefunden.</p>
          )}
        </div>

        {/* Preview frame */}
        <div className="flex justify-center">
          {selectedItem ? (
            <div className={`w-full ${deviceConfig.width} border rounded-xl shadow-lg overflow-hidden bg-background`}>
              {/* Device frame header */}
              <div className="bg-muted/50 px-3 py-2 border-b flex items-center gap-2 text-xs text-muted-foreground">
                <deviceConfig.icon className="h-3.5 w-3.5" />
                <span>{deviceConfig.label} — {LANGUAGES.find(l => l.code === lang)?.label}</span>
                <span className="ml-auto">{AUDIENCE_CONFIG[audience].label}</span>
              </div>

              {/* Content preview */}
              <div className={`${isRtl ? 'rtl text-right' : ''}`}>
                {/* Hero image */}
                {selectedItem.cover_image_url ? (
                  <div className="relative">
                    <img
                      src={selectedItem.cover_image_url}
                      alt=""
                      className="w-full h-48 object-cover"
                    />
                    {selectedItem.is_highlight && (
                      <Badge className="absolute top-3 left-3 bg-amber-500 text-white text-[10px]">
                        <Star className="h-3 w-3 mr-0.5 fill-current" /> Highlight
                      </Badge>
                    )}
                  </div>
                ) : (
                  <div className="w-full h-32 bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
                    <ImageIcon className="h-10 w-10 text-muted-foreground/30" />
                  </div>
                )}

                {/* Content body */}
                <div className="p-4 space-y-4">
                  {/* Title + meta */}
                  <div>
                    <h1 className={`${device === 'mobile' ? 'text-xl' : 'text-2xl'} font-bold`}>
                      {getName(selectedItem)}
                    </h1>
                    <div className="flex items-center gap-2 mt-1.5 text-xs text-muted-foreground flex-wrap">
                      <span className="capitalize">{selectedItem.content_type}</span>
                      {selectedItem.parent_name && (
                        <>
                          <span>•</span>
                          <span className="flex items-center gap-0.5">
                            <Navigation className="h-3 w-3" /> {selectedItem.parent_name}
                          </span>
                        </>
                      )}
                      {selectedItem.rating_avg > 0 && (
                        <>
                          <span>•</span>
                          <span className="flex items-center gap-0.5 text-amber-600">
                            <Star className="h-3 w-3 fill-current" /> {selectedItem.rating_avg.toFixed(1)}
                            <span className="text-muted-foreground">({selectedItem.review_count})</span>
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Brief */}
                  {getText(selectedItem, 'content_brief') && (
                    <p className="text-sm font-medium text-muted-foreground italic">
                      {getText(selectedItem, 'content_brief')}
                    </p>
                  )}

                  {/* Main content */}
                  {getMainContent(selectedItem) && (
                    <div className="text-sm leading-relaxed whitespace-pre-line">
                      {getMainContent(selectedItem)}
                    </div>
                  )}

                  {/* Fun facts */}
                  {getText(selectedItem, 'content_fun_facts') && (
                    <Card className="p-3 bg-amber-50 border-amber-200">
                      <h3 className="text-xs font-semibold text-amber-800 mb-1">Fun Facts</h3>
                      <p className="text-xs text-amber-900 whitespace-pre-line">
                        {getText(selectedItem, 'content_fun_facts')}
                      </p>
                    </Card>
                  )}

                  {/* Historical context */}
                  {getText(selectedItem, 'content_historical') && (
                    <div>
                      <h3 className="text-xs font-semibold mb-1 flex items-center gap-1">
                        <Clock className="h-3 w-3" /> Historischer Kontext
                      </h3>
                      <p className="text-xs text-muted-foreground whitespace-pre-line">
                        {getText(selectedItem, 'content_historical')}
                      </p>
                    </div>
                  )}

                  {/* Technique */}
                  {getText(selectedItem, 'content_technique') && (
                    <div>
                      <h3 className="text-xs font-semibold mb-1">Technik & Material</h3>
                      <p className="text-xs text-muted-foreground whitespace-pre-line">
                        {getText(selectedItem, 'content_technique')}
                      </p>
                    </div>
                  )}

                  {/* Location */}
                  {(selectedItem.lat && selectedItem.lng) && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t">
                      <MapPin className="h-3.5 w-3.5" />
                      <span>{selectedItem.lat.toFixed(5)}, {selectedItem.lng.toFixed(5)}</span>
                      {selectedItem.address?.street && <span>— {selectedItem.address.street}</span>}
                    </div>
                  )}

                  {/* Tags */}
                  {selectedItem.tags?.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-2">
                      {selectedItem.tags.map(tag => (
                        <Badge key={tag} variant="secondary" className="text-[10px]">{tag}</Badge>
                      ))}
                    </div>
                  )}

                  {/* Missing content warning (admin-only) */}
                  {!getMainContent(selectedItem) && (
                    <Card className="p-3 bg-red-50 border-red-200 text-xs text-red-700">
                      Kein Inhalt fuer Sprache "{lang}" und Zielgruppe "{AUDIENCE_CONFIG[audience].label}" vorhanden.
                      Wechsle die Sprache oder fuege Inhalte hinzu.
                    </Card>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <Card className="p-12 text-center w-full">
              <Eye className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Waehle einen Eintrag aus der Liste.</p>
            </Card>
          )}
        </div>
      </div>

      {/* Navigation between items */}
      {selectedItem && (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline" size="sm"
            onClick={() => {
              const idx = filteredItems.findIndex(i => i.id === selectedItem.id)
              if (idx > 0) setSelectedItem(filteredItems[idx - 1])
            }}
            disabled={filteredItems.findIndex(i => i.id === selectedItem.id) <= 0}
          >
            <ChevronLeft className="h-3.5 w-3.5 mr-1" /> Vorheriger
          </Button>
          <span className="text-xs text-muted-foreground self-center">
            {filteredItems.findIndex(i => i.id === selectedItem.id) + 1} / {filteredItems.length}
          </span>
          <Button
            variant="outline" size="sm"
            onClick={() => {
              const idx = filteredItems.findIndex(i => i.id === selectedItem.id)
              if (idx < filteredItems.length - 1) setSelectedItem(filteredItems[idx + 1])
            }}
            disabled={filteredItems.findIndex(i => i.id === selectedItem.id) >= filteredItems.length - 1}
          >
            Naechster <ChevronRight className="h-3.5 w-3.5 ml-1" />
          </Button>
        </div>
      )}
    </div>
  )
}
