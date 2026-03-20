// Fintutto World — Universal Content Manager
// CRUD for fw_content_items: works across museums, cities, regions, events
// Unified POI management with domain-specific fields via JSONB

import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
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
  MapPin, Plus, Search, Loader2, Sparkles, Trash2, Send, Eye,
  Edit3, Save, Globe, Star, Filter, ChevronDown, ChevronUp, X,
  Landmark, Building2, Mountain, Ship, Calendar, TreePine,
} from 'lucide-react'
import { supabase } from '@/lib/supabase'

// Content types and their display config
const CONTENT_TYPES: { id: string; label: string; icon: typeof MapPin }[] = [
  { id: 'artwork', label: 'Exponat', icon: Landmark },
  { id: 'landmark', label: 'Sehenswuerdigkeit', icon: Building2 },
  { id: 'restaurant', label: 'Restaurant', icon: MapPin },
  { id: 'hotel', label: 'Hotel', icon: Building2 },
  { id: 'shop', label: 'Geschaeft', icon: MapPin },
  { id: 'museum', label: 'Museum', icon: Landmark },
  { id: 'church', label: 'Kirche', icon: Building2 },
  { id: 'park', label: 'Park', icon: TreePine },
  { id: 'monument', label: 'Denkmal', icon: Landmark },
  { id: 'viewpoint', label: 'Aussichtspunkt', icon: Mountain },
  { id: 'trail', label: 'Wanderweg', icon: Mountain },
  { id: 'event_venue', label: 'Veranstaltungsort', icon: Calendar },
  { id: 'ship_area', label: 'Schiffsbereich', icon: Ship },
  { id: 'other', label: 'Sonstiges', icon: MapPin },
]

const DOMAINS = [
  { id: 'artguide', label: 'Museum / Guide' },
  { id: 'cityguide', label: 'Stadt' },
  { id: 'regionguide', label: 'Region' },
  { id: 'cruiseguide', label: 'Kreuzfahrt' },
  { id: 'eventguide', label: 'Event' },
  { id: 'natureguide', label: 'Natur' },
]

const PARENT_TYPES = [
  { id: 'museum', label: 'Museum' },
  { id: 'city', label: 'Stadt' },
  { id: 'region', label: 'Region' },
  { id: 'cruise', label: 'Kreuzfahrt' },
  { id: 'event', label: 'Event' },
]

const STATUS_CONFIG: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline' | 'destructive' }> = {
  draft: { label: 'Entwurf', variant: 'secondary' },
  review: { label: 'Review', variant: 'outline' },
  published: { label: 'Live', variant: 'default' },
  archived: { label: 'Archiviert', variant: 'destructive' },
}

interface ContentItem {
  id: string
  content_type: string
  domain: string
  parent_type: string
  parent_id: string
  parent_name: string | null
  name: Record<string, string>
  slug: string
  description: Record<string, string>
  short_description: Record<string, string>
  lat: number | null
  lng: number | null
  address: Record<string, string>
  cover_image_url: string | null
  tags: string[]
  status: string
  is_featured: boolean
  is_highlight: boolean
  sort_order: number
  view_count: number
  rating_avg: number
  review_count: number
  domain_data: Record<string, unknown>
  content_brief: Record<string, string>
  content_standard: Record<string, string>
  content_detailed: Record<string, string>
  content_children: Record<string, string>
  content_youth: Record<string, string>
  content_fun_facts: Record<string, string>
  content_historical: Record<string, string>
  content_technique: Record<string, string>
  ai_generated_at: string | null
  ai_auto_translate_status: string
  contact: Record<string, string>
  opening_hours: Record<string, unknown>
  created_at: string
  updated_at: string
}

export default function ContentManager() {
  const [searchParams] = useSearchParams()
  const [items, setItems] = useState<ContentItem[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')

  // Filters
  const [domainFilter, setDomainFilter] = useState(searchParams.get('domain') || 'all')
  const [typeFilter, setTypeFilter] = useState(searchParams.get('type') || 'all')
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || 'all')
  const [parentFilter, setParentFilter] = useState(searchParams.get('parent') || '')

  // Parents (museums, cities, etc.)
  const [parents, setParents] = useState<{ id: string; name: string; type: string }[]>([])

  // Create/edit
  const [showCreate, setShowCreate] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [generating, setGenerating] = useState<string | null>(null)

  // Form
  const [formName, setFormName] = useState('')
  const [formType, setFormType] = useState('landmark')
  const [formDomain, setFormDomain] = useState('cityguide')
  const [formParentType, setFormParentType] = useState('city')
  const [formParentId, setFormParentId] = useState('')
  const [formParentName, setFormParentName] = useState('')
  const [formDescription, setFormDescription] = useState('')
  const [formLat, setFormLat] = useState('')
  const [formLng, setFormLng] = useState('')
  const [formAddress, setFormAddress] = useState('')
  const [formTags, setFormTags] = useState('')
  const [formIsHighlight, setFormIsHighlight] = useState(false)

  useEffect(() => { loadParents() }, [])
  useEffect(() => { loadItems() }, [domainFilter, typeFilter, statusFilter, parentFilter])

  async function loadParents() {
    // Load museums
    const { data: museums } = await supabase
      .from('ag_museums')
      .select('id, name')
      .eq('is_active', true)
      .order('name')

    const parentList: typeof parents = (museums || []).map(m => ({ id: m.id, name: m.name, type: 'museum' }))

    // Try to load cities/regions from fw_content_items parent references
    const { data: parentRefs } = await supabase
      .from('fw_content_items')
      .select('parent_type, parent_id, parent_name')
      .not('parent_type', 'eq', 'museum')
      .limit(100)

    if (parentRefs) {
      const seen = new Set<string>()
      for (const ref of parentRefs) {
        const key = `${ref.parent_type}:${ref.parent_id}`
        if (!seen.has(key) && ref.parent_name) {
          seen.add(key)
          parentList.push({ id: ref.parent_id, name: ref.parent_name, type: ref.parent_type })
        }
      }
    }

    setParents(parentList)
  }

  async function loadItems() {
    setLoading(true)
    let query = supabase
      .from('fw_content_items')
      .select('*', { count: 'exact' })
      .order('updated_at', { ascending: false })
      .limit(100)

    if (domainFilter !== 'all') query = query.eq('domain', domainFilter)
    if (typeFilter !== 'all') query = query.eq('content_type', typeFilter)
    if (statusFilter !== 'all') query = query.eq('status', statusFilter)
    if (parentFilter) query = query.eq('parent_id', parentFilter)
    if (search) {
      query = query.or(`slug.ilike.%${search.toLowerCase()}%,parent_name.ilike.%${search.toLowerCase()}%`)
    }

    const { data, count } = await query
    setItems((data || []) as ContentItem[])
    setTotal(count || 0)
    setLoading(false)
  }

  function resetForm() {
    setFormName('')
    setFormType('landmark')
    setFormDomain('cityguide')
    setFormParentType('city')
    setFormParentId('')
    setFormParentName('')
    setFormDescription('')
    setFormLat('')
    setFormLng('')
    setFormAddress('')
    setFormTags('')
    setFormIsHighlight(false)
  }

  function fillForm(item: ContentItem) {
    setFormName(item.name?.de || '')
    setFormType(item.content_type)
    setFormDomain(item.domain)
    setFormParentType(item.parent_type)
    setFormParentId(item.parent_id)
    setFormParentName(item.parent_name || '')
    setFormDescription(item.description?.de || '')
    setFormLat(item.lat?.toString() || '')
    setFormLng(item.lng?.toString() || '')
    setFormAddress(item.address?.street || '')
    setFormTags(item.tags?.join(', ') || '')
    setFormIsHighlight(item.is_highlight)
  }

  function generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
  }

  async function handleCreate() {
    if (!formName) return
    setSaving(true)

    const parentName = formParentName || parents.find(p => p.id === formParentId)?.name || ''

    const { error } = await supabase.from('fw_content_items').insert({
      content_type: formType,
      domain: formDomain,
      parent_type: formParentType,
      parent_id: formParentId || '00000000-0000-0000-0000-000000000000',
      parent_name: parentName,
      name: { de: formName },
      slug: generateSlug(formName),
      description: formDescription ? { de: formDescription } : {},
      short_description: {},
      lat: formLat ? parseFloat(formLat) : null,
      lng: formLng ? parseFloat(formLng) : null,
      address: formAddress ? { street: formAddress } : {},
      tags: formTags ? formTags.split(',').map(t => t.trim()) : [],
      is_highlight: formIsHighlight,
      status: 'draft',
    })

    if (!error) {
      setShowCreate(false)
      resetForm()
      loadItems()
    }
    setSaving(false)
  }

  async function handleUpdate() {
    if (!editingId || !formName) return
    setSaving(true)

    const parentName = formParentName || parents.find(p => p.id === formParentId)?.name || ''

    await supabase.from('fw_content_items').update({
      content_type: formType,
      domain: formDomain,
      parent_type: formParentType,
      parent_id: formParentId || undefined,
      parent_name: parentName || undefined,
      name: { de: formName },
      description: formDescription ? { de: formDescription } : {},
      lat: formLat ? parseFloat(formLat) : null,
      lng: formLng ? parseFloat(formLng) : null,
      address: formAddress ? { street: formAddress } : {},
      tags: formTags ? formTags.split(',').map(t => t.trim()) : [],
      is_highlight: formIsHighlight,
    }).eq('id', editingId)

    setEditingId(null)
    resetForm()
    loadItems()
    setSaving(false)
  }

  async function handleDelete(id: string) {
    if (!confirm('Inhalt wirklich loeschen?')) return
    await supabase.from('fw_content_items').delete().eq('id', id)
    loadItems()
  }

  async function handleStatusChange(id: string, newStatus: string) {
    const updates: Record<string, unknown> = { status: newStatus }
    if (newStatus === 'published') updates.published_at = new Date().toISOString()
    await supabase.from('fw_content_items').update(updates).eq('id', id)
    loadItems()
  }

  async function handleAiEnrich(id: string) {
    setGenerating(id)
    try {
      const { error } = await supabase.functions.invoke('content-enrich', {
        body: {
          action: 'enrich_single',
          content_id: id,
          target_languages: ['de', 'en'],
        },
      })
      if (!error) loadItems()
    } catch { /* silent */ }
    setGenerating(null)
  }

  async function handleAiScout() {
    if (!formParentId || !formParentName) return
    setGenerating('scout')
    try {
      const { data, error } = await supabase.functions.invoke('content-enrich', {
        body: {
          action: 'city_scout',
          parent_type: formParentType,
          parent_id: formParentId,
          parent_name: formParentName,
          target_languages: ['de', 'en'],
        },
      })
      if (!error) {
        loadItems()
      }
    } catch { /* silent */ }
    setGenerating(null)
  }

  function startEdit(item: ContentItem) {
    setEditingId(item.id)
    setShowCreate(false)
    fillForm(item)
  }

  const typeIcon = (type: string) => {
    const config = CONTENT_TYPES.find(t => t.id === type)
    return config?.icon || MapPin
  }

  const formCard = (
    <Card className="p-6 space-y-4 border-primary">
      <h3 className="font-semibold">{editingId ? 'Inhalt bearbeiten' : 'Neuer Inhalt'}</h3>
      <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
        <div className="space-y-1.5">
          <Label>Name *</Label>
          <Input value={formName} onChange={e => setFormName(e.target.value)} placeholder="Name des POI" />
        </div>
        <div className="space-y-1.5">
          <Label>Typ</Label>
          <Select value={formType} onValueChange={setFormType}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {CONTENT_TYPES.map(t => (
                <SelectItem key={t.id} value={t.id}>{t.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Domain</Label>
          <Select value={formDomain} onValueChange={setFormDomain}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {DOMAINS.map(d => (
                <SelectItem key={d.id} value={d.id}>{d.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Zugehoerigkeit</Label>
          <Select value={formParentType} onValueChange={setFormParentType}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {PARENT_TYPES.map(p => (
                <SelectItem key={p.id} value={p.id}>{p.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Uebergeordnet</Label>
          {parents.filter(p => p.type === formParentType).length > 0 ? (
            <Select value={formParentId} onValueChange={v => {
              setFormParentId(v)
              setFormParentName(parents.find(p => p.id === v)?.name || '')
            }}>
              <SelectTrigger><SelectValue placeholder="Auswaehlen..." /></SelectTrigger>
              <SelectContent>
                {parents.filter(p => p.type === formParentType).map(p => (
                  <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <Input value={formParentName} onChange={e => setFormParentName(e.target.value)} placeholder="Name eingeben..." />
          )}
        </div>
        <div className="space-y-1.5">
          <Label>Tags (kommagetrennt)</Label>
          <Input value={formTags} onChange={e => setFormTags(e.target.value)} placeholder="kultur, sehenswuerdigkeit" />
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="space-y-1.5">
          <Label>Breitengrad</Label>
          <Input value={formLat} onChange={e => setFormLat(e.target.value)} placeholder="48.137154" />
        </div>
        <div className="space-y-1.5">
          <Label>Laengengrad</Label>
          <Input value={formLng} onChange={e => setFormLng(e.target.value)} placeholder="11.576124" />
        </div>
        <div className="space-y-1.5">
          <Label>Adresse</Label>
          <Input value={formAddress} onChange={e => setFormAddress(e.target.value)} placeholder="Strasse, Ort" />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label>Beschreibung (DE)</Label>
        <textarea
          className="w-full min-h-[80px] px-3 py-2 border rounded-lg text-sm bg-background resize-y"
          value={formDescription}
          onChange={e => setFormDescription(e.target.value)}
          placeholder="Beschreibung..."
        />
      </div>
      <div className="flex items-center gap-4">
        <label className="flex items-center gap-1.5 cursor-pointer text-sm">
          <input type="checkbox" checked={formIsHighlight} onChange={e => setFormIsHighlight(e.target.checked)} className="rounded" />
          <Star className="h-3.5 w-3.5" /> Highlight
        </label>
      </div>
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={() => { setShowCreate(false); setEditingId(null); resetForm() }}>
          Abbrechen
        </Button>
        <Button onClick={editingId ? handleUpdate : handleCreate} disabled={saving || !formName}>
          {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
          {editingId ? 'Speichern' : 'Anlegen'}
        </Button>
      </div>
    </Card>
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Globe className="h-6 w-6" />
            Content & POIs
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {total} Inhalte — universelles Content-Management fuer alle Domains.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => { setShowCreate(true); resetForm() }} disabled={generating === 'scout'}>
            {generating === 'scout'
              ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> KI erkundet...</>
              : <><Sparkles className="h-4 w-4 mr-2" /> KI City-Scout</>}
          </Button>
          <Button onClick={() => { setShowCreate(true); setEditingId(null); resetForm() }}>
            <Plus className="h-4 w-4 mr-2" /> Neuer Inhalt
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-end">
        <div className="space-y-1.5">
          <Label className="text-xs">Domain</Label>
          <Select value={domainFilter} onValueChange={setDomainFilter}>
            <SelectTrigger className="w-36 h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle</SelectItem>
              {DOMAINS.map(d => (
                <SelectItem key={d.id} value={d.id}>{d.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Typ</Label>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-44 h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle Typen</SelectItem>
              {CONTENT_TYPES.map(t => (
                <SelectItem key={t.id} value={t.id}>{t.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Status</Label>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-32 h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle</SelectItem>
              <SelectItem value="draft">Entwurf</SelectItem>
              <SelectItem value="review">Review</SelectItem>
              <SelectItem value="published">Live</SelectItem>
              <SelectItem value="archived">Archiviert</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {parents.length > 0 && (
          <div className="space-y-1.5">
            <Label className="text-xs">Zugehoerigkeit</Label>
            <Select value={parentFilter} onValueChange={setParentFilter}>
              <SelectTrigger className="w-48 h-8 text-xs">
                <SelectValue placeholder="Alle" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Alle</SelectItem>
                {parents.map(p => (
                  <SelectItem key={p.id} value={p.id}>{p.name} ({p.type})</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
        <div className="flex-1 space-y-1.5">
          <Label className="text-xs">Suche</Label>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              value={search}
              onChange={e => setSearch(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && loadItems()}
              placeholder="Suchen..."
              className="pl-8 h-8 text-xs"
            />
          </div>
        </div>
      </div>

      {/* Create/Edit form */}
      {(showCreate || editingId) && formCard}

      {/* Item list */}
      {loading ? (
        <div className="text-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mx-auto" />
        </div>
      ) : items.length === 0 ? (
        <Card className="p-12 text-center">
          <Globe className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-semibold text-lg mb-2">Keine Inhalte</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Erstelle POIs manuell, importiere ueber Content Import, oder nutze den KI City-Scout.
          </p>
        </Card>
      ) : (
        <div className="space-y-2">
          {items.map(item => {
            const nameDe = item.name?.de || item.slug || '—'
            const statusInfo = STATUS_CONFIG[item.status] || STATUS_CONFIG.draft
            const isExpanded = expandedId === item.id
            const TypeIcon = typeIcon(item.content_type)
            const typeLabel = CONTENT_TYPES.find(t => t.id === item.content_type)?.label || item.content_type
            const domainLabel = DOMAINS.find(d => d.id === item.domain)?.label || item.domain

            return (
              <Card key={item.id} className="overflow-hidden">
                <div className="p-3 flex items-start gap-3">
                  <div className="w-10 h-10 bg-muted rounded flex items-center justify-center flex-shrink-0">
                    <TypeIcon className="h-5 w-5 text-muted-foreground" />
                  </div>

                  <div className="flex-1 min-w-0 cursor-pointer" onClick={() => setExpandedId(isExpanded ? null : item.id)}>
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <h3 className="font-semibold text-sm truncate">{nameDe}</h3>
                      <Badge variant={statusInfo.variant} className="text-[10px]">{statusInfo.label}</Badge>
                      {item.is_highlight && <Badge variant="outline" className="text-[10px] text-amber-600">Highlight</Badge>}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span>{typeLabel}</span>
                      <span className="opacity-50">|</span>
                      <span>{domainLabel}</span>
                      {item.parent_name && (
                        <>
                          <span className="opacity-50">|</span>
                          <span>{item.parent_name}</span>
                        </>
                      )}
                      {item.lat && item.lng && (
                        <>
                          <span className="opacity-50">|</span>
                          <span className="flex items-center gap-0.5"><MapPin className="h-3 w-3" /> GPS</span>
                        </>
                      )}
                      {item.ai_generated_at && (
                        <>
                          <span className="opacity-50">|</span>
                          <span className="flex items-center gap-0.5"><Sparkles className="h-3 w-3" /> KI</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 flex-shrink-0">
                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => startEdit(item)}>
                      <Edit3 className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      size="icon" variant="ghost" className="h-7 w-7"
                      onClick={() => handleAiEnrich(item.id)}
                      disabled={generating === item.id}
                    >
                      {generating === item.id
                        ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        : <Sparkles className="h-3.5 w-3.5" />}
                    </Button>
                    {item.status === 'draft' && (
                      <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => handleStatusChange(item.id, 'published')}>
                        <Send className="h-3.5 w-3.5" />
                      </Button>
                    )}
                    <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => handleDelete(item.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setExpandedId(isExpanded ? null : item.id)}>
                      {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                    </Button>
                  </div>
                </div>

                {isExpanded && (
                  <div className="border-t px-4 py-3 bg-muted/30 space-y-3">
                    {/* Description */}
                    {item.description?.de && (
                      <div>
                        <Label className="text-xs">Beschreibung (DE)</Label>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-3">{item.description.de}</p>
                      </div>
                    )}

                    {/* Content layers */}
                    <div>
                      <Label className="text-xs">Inhaltsebenen</Label>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {[
                          { key: 'content_brief', label: 'Kurz' },
                          { key: 'content_standard', label: 'Standard' },
                          { key: 'content_detailed', label: 'Detailliert' },
                          { key: 'content_children', label: 'Kinder' },
                          { key: 'content_youth', label: 'Jugend' },
                          { key: 'content_fun_facts', label: 'Fun Facts' },
                          { key: 'content_historical', label: 'Geschichte' },
                          { key: 'content_technique', label: 'Technik' },
                        ].map(layer => {
                          const content = (item[layer.key as keyof ContentItem] as Record<string, string>)?.de
                          return (
                            <Badge
                              key={layer.key}
                              variant={content ? 'default' : 'outline'}
                              className={`text-[10px] ${content ? '' : 'opacity-40'}`}
                            >
                              {layer.label}
                            </Badge>
                          )
                        })}
                      </div>
                    </div>

                    {/* Translation status */}
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span>Uebersetzung: <Badge variant="outline" className="text-[10px]">{item.ai_auto_translate_status}</Badge></span>
                      <span>Views: {item.view_count}</span>
                      {item.rating_avg > 0 && <span>Bewertung: {item.rating_avg}/5 ({item.review_count})</span>}
                    </div>

                    {/* Tags */}
                    {item.tags?.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {item.tags.map(tag => (
                          <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                        ))}
                      </div>
                    )}

                    {/* Domain data */}
                    {item.domain_data && Object.keys(item.domain_data).length > 0 && (
                      <div>
                        <Label className="text-xs">Domain-Daten</Label>
                        <pre className="text-xs text-muted-foreground mt-1 bg-muted p-2 rounded overflow-x-auto">
                          {JSON.stringify(item.domain_data, null, 2)}
                        </pre>
                      </div>
                    )}

                    <div className="flex gap-2 pt-1">
                      <Button size="sm" variant="outline" onClick={() => handleAiEnrich(item.id)} disabled={generating === item.id}>
                        {generating === item.id
                          ? <><Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" /> Generiere...</>
                          : <><Sparkles className="h-3.5 w-3.5 mr-1" /> KI anreichern</>}
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => startEdit(item)}>
                        <Edit3 className="h-3.5 w-3.5 mr-1" /> Bearbeiten
                      </Button>
                    </div>
                  </div>
                )}
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
