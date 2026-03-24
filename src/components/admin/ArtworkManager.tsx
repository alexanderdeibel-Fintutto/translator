// Fintutto World — Artwork Management
// Full CRUD for artworks with workflow status, media upload, and AI content generation

import { useState, useEffect, useRef } from 'react'
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
  Image, Plus, Search, Loader2, Sparkles, Trash2, Send, Eye, EyeOff,
  Edit3, X, Upload, Star, ChevronDown, ChevronUp, FileText, Save,
} from 'lucide-react'
import {
  getArtworks, createArtwork, updateArtwork, deleteArtwork,
  changeArtworkStatus, uploadArtworkMedia, getArtworkMedia,
} from '@/lib/artguide/museum-api'
import type { Artwork, ArtworkStatus, ArtworkMedia, MultilingualText } from '@/lib/artguide/types'
import { supabase } from '@/lib/supabase'

const STATUS_LABELS: Record<ArtworkStatus, { label: string; variant: 'default' | 'secondary' | 'outline' | 'destructive' }> = {
  draft: { label: 'Entwurf', variant: 'secondary' },
  review: { label: 'Review', variant: 'outline' },
  published: { label: 'Live', variant: 'default' },
  archived: { label: 'Archiviert', variant: 'destructive' },
}

export default function ArtworkManager() {
  const [searchParams] = useSearchParams()
  const [museums, setMuseums] = useState<{ id: string; name: string }[]>([])
  const [museumId, setMuseumId] = useState(searchParams.get('museum') || '')
  const [artworks, setArtworks] = useState<Artwork[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<ArtworkStatus | 'all'>('all')

  // Edit/create state
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showCreate, setShowCreate] = useState(false)
  const [saving, setSaving] = useState(false)
  const [generating, setGenerating] = useState<string | null>(null)

  // Form fields
  const [formTitle, setFormTitle] = useState('')
  const [formArtist, setFormArtist] = useState('')
  const [formYear, setFormYear] = useState('')
  const [formMedium, setFormMedium] = useState('')
  const [formStyle, setFormStyle] = useState('')
  const [formEpoch, setFormEpoch] = useState('')
  const [formInventory, setFormInventory] = useState('')
  const [formDescription, setFormDescription] = useState('')
  const [formTags, setFormTags] = useState('')
  const [formIsHighlight, setFormIsHighlight] = useState(false)

  // Media
  const [mediaItems, setMediaItems] = useState<ArtworkMedia[]>([])
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  // Expanded artwork for detail view
  const [expandedId, setExpandedId] = useState<string | null>(null)

  useEffect(() => {
    supabase
      .from('ag_museums')
      .select('id, name')
      .eq('is_active', true)
      .order('name')
      .then(({ data }) => {
        if (data) {
          setMuseums(data)
          if (!museumId && data.length === 1) setMuseumId(data[0].id)
        }
      })
  }, [])

  useEffect(() => {
    if (museumId) loadArtworks()
  }, [museumId, statusFilter])

  async function loadArtworks() {
    setLoading(true)
    const result = await getArtworks(museumId, {
      status: statusFilter === 'all' ? undefined : statusFilter,
      search: search || undefined,
      limit: 100,
    })
    setArtworks(result.artworks)
    setTotal(result.total)
    setLoading(false)
  }

  function resetForm() {
    setFormTitle('')
    setFormArtist('')
    setFormYear('')
    setFormMedium('')
    setFormStyle('')
    setFormEpoch('')
    setFormInventory('')
    setFormDescription('')
    setFormTags('')
    setFormIsHighlight(false)
    setMediaItems([])
  }

  function fillForm(artwork: Artwork) {
    setFormTitle((artwork.title as Record<string, string>)?.de || '')
    setFormArtist(artwork.artist_name || '')
    setFormYear(artwork.year_created || '')
    setFormMedium(artwork.medium || '')
    setFormStyle(artwork.style || '')
    setFormEpoch(artwork.epoch || '')
    setFormInventory(artwork.inventory_number || '')
    setFormDescription((artwork.description_standard as Record<string, string>)?.de || '')
    setFormTags(artwork.tags?.join(', ') || '')
    setFormIsHighlight(artwork.is_highlight)
  }

  async function handleCreate() {
    if (!formTitle || !museumId) return
    setSaving(true)
    const artwork = await createArtwork({
      museum_id: museumId,
      title: { de: formTitle } as MultilingualText,
      artist_name: formArtist || null,
      year_created: formYear || null,
      medium: formMedium || null,
      style: formStyle || null,
      epoch: formEpoch || null,
      inventory_number: formInventory || null,
      description_standard: formDescription ? { de: formDescription } as MultilingualText : {} as MultilingualText,
      tags: formTags ? formTags.split(',').map(t => t.trim()) : [],
      is_highlight: formIsHighlight,
      status: 'draft',
    })
    if (artwork) {
      setShowCreate(false)
      resetForm()
      loadArtworks()
    }
    setSaving(false)
  }

  async function handleUpdate() {
    if (!editingId || !formTitle) return
    setSaving(true)
    await updateArtwork(editingId, {
      title: { de: formTitle } as MultilingualText,
      artist_name: formArtist || null,
      year_created: formYear || null,
      medium: formMedium || null,
      style: formStyle || null,
      epoch: formEpoch || null,
      inventory_number: formInventory || null,
      description_standard: formDescription ? { de: formDescription } as MultilingualText : {} as MultilingualText,
      tags: formTags ? formTags.split(',').map(t => t.trim()) : [],
      is_highlight: formIsHighlight,
    })
    setEditingId(null)
    resetForm()
    loadArtworks()
    setSaving(false)
  }

  async function handleDelete(id: string) {
    if (!confirm('Exponat wirklich loeschen?')) return
    await deleteArtwork(id)
    loadArtworks()
  }

  async function handleStatusChange(id: string, newStatus: ArtworkStatus) {
    await changeArtworkStatus(id, newStatus)
    loadArtworks()
  }

  async function handleMediaUpload(artworkId: string, files: FileList) {
    setUploading(true)
    for (const file of Array.from(files)) {
      await uploadArtworkMedia(artworkId, file, { isPrimary: mediaItems.length === 0 })
    }
    const media = await getArtworkMedia(artworkId)
    setMediaItems(media)
    setUploading(false)
  }

  async function handleAiGenerate(artworkId: string) {
    setGenerating(artworkId)
    try {
      const { data, error } = await supabase.functions.invoke('artguide-ai', {
        body: {
          action: 'enrich_artwork',
          artwork_id: artworkId,
          museum_id: museumId,
          target_languages: ['de', 'en'],
        },
      })
      if (!error && data) {
        loadArtworks()
      }
    } catch {
      // silently fail
    }
    setGenerating(null)
  }

  async function handleExpand(artwork: Artwork) {
    if (expandedId === artwork.id) {
      setExpandedId(null)
      return
    }
    setExpandedId(artwork.id)
    const media = await getArtworkMedia(artwork.id)
    setMediaItems(media)
  }

  function startEdit(artwork: Artwork) {
    setEditingId(artwork.id)
    setShowCreate(false)
    fillForm(artwork)
  }

  const filteredArtworks = search
    ? artworks.filter(a =>
        (a.title as Record<string, string>)?.de?.toLowerCase().includes(search.toLowerCase()) ||
        a.artist_name?.toLowerCase().includes(search.toLowerCase()) ||
        a.inventory_number?.toLowerCase().includes(search.toLowerCase()),
      )
    : artworks

  const formCard = (
    <Card className="p-6 space-y-4 border-primary">
      <h3 className="font-semibold">{editingId ? 'Exponat bearbeiten' : 'Neues Exponat'}</h3>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label>Titel *</Label>
          <Input value={formTitle} onChange={e => setFormTitle(e.target.value)} placeholder="Titel des Exponats" />
        </div>
        <div className="space-y-1.5">
          <Label>Kuenstler</Label>
          <Input value={formArtist} onChange={e => setFormArtist(e.target.value)} placeholder="Name des Kuenstlers" />
        </div>
        <div className="space-y-1.5">
          <Label>Jahr</Label>
          <Input value={formYear} onChange={e => setFormYear(e.target.value)} placeholder="z.B. 1889" />
        </div>
        <div className="space-y-1.5">
          <Label>Medium / Technik</Label>
          <Input value={formMedium} onChange={e => setFormMedium(e.target.value)} placeholder="z.B. Oel auf Leinwand" />
        </div>
        <div className="space-y-1.5">
          <Label>Stil</Label>
          <Input value={formStyle} onChange={e => setFormStyle(e.target.value)} placeholder="z.B. Impressionismus" />
        </div>
        <div className="space-y-1.5">
          <Label>Epoche</Label>
          <Input value={formEpoch} onChange={e => setFormEpoch(e.target.value)} placeholder="z.B. 19. Jahrhundert" />
        </div>
        <div className="space-y-1.5">
          <Label>Inventarnummer</Label>
          <Input value={formInventory} onChange={e => setFormInventory(e.target.value)} placeholder="INV-001" />
        </div>
        <div className="space-y-1.5">
          <Label>Tags (kommagetrennt)</Label>
          <Input value={formTags} onChange={e => setFormTags(e.target.value)} placeholder="malerei, landschaft" />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label>Beschreibung (DE)</Label>
        <textarea
          className="w-full min-h-[100px] px-3 py-2 border rounded-lg text-sm bg-background resize-y"
          value={formDescription}
          onChange={e => setFormDescription(e.target.value)}
          placeholder="Beschreibung des Exponats..."
        />
      </div>
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="highlight"
          checked={formIsHighlight}
          onChange={e => setFormIsHighlight(e.target.checked)}
          className="rounded"
        />
        <Label htmlFor="highlight" className="cursor-pointer flex items-center gap-1">
          <Star className="h-3.5 w-3.5" /> Als Highlight markieren
        </Label>
      </div>
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={() => { setShowCreate(false); setEditingId(null); resetForm() }}>
          Abbrechen
        </Button>
        <Button onClick={editingId ? handleUpdate : handleCreate} disabled={saving || !formTitle}>
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
            <Image className="h-6 w-6" />
            Exponate
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {total} Exponat{total !== 1 ? 'e' : ''} verwalten — Status, Medien, KI-Inhalte.
          </p>
        </div>
        <Button onClick={() => { setShowCreate(true); setEditingId(null); resetForm() }} disabled={!museumId}>
          <Plus className="h-4 w-4 mr-2" /> Neues Exponat
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 items-end">
        {museums.length > 1 && (
          <div className="space-y-1.5">
            <Label>Museum</Label>
            <Select value={museumId} onValueChange={setMuseumId}>
              <SelectTrigger className="w-56">
                <SelectValue placeholder="Museum auswaehlen..." />
              </SelectTrigger>
              <SelectContent>
                {museums.map(m => (
                  <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
        <div className="space-y-1.5">
          <Label>Status</Label>
          <Select value={statusFilter} onValueChange={v => setStatusFilter(v as ArtworkStatus | 'all')}>
            <SelectTrigger className="w-40">
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
        <div className="flex-1 space-y-1.5">
          <Label>Suche</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={e => setSearch(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && loadArtworks()}
              placeholder="Titel, Kuenstler, Inventarnummer..."
              className="pl-9"
            />
          </div>
        </div>
      </div>

      {/* Create/Edit form */}
      {(showCreate || editingId) && formCard}

      {/* Artwork list */}
      {loading ? (
        <div className="text-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mx-auto" />
        </div>
      ) : filteredArtworks.length === 0 ? (
        <Card className="p-12 text-center">
          <Image className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-semibold text-lg mb-2">Keine Exponate</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Importiere Inhalte oder erstelle Exponate manuell.
          </p>
        </Card>
      ) : (
        <div className="space-y-2">
          {filteredArtworks.map(artwork => {
            const titleDe = (artwork.title as Record<string, string>)?.de || 'Ohne Titel'
            const isExpanded = expandedId === artwork.id
            const statusInfo = STATUS_LABELS[artwork.status]

            return (
              <Card key={artwork.id} className="overflow-hidden">
                <div className="p-4 flex items-start gap-3">
                  {/* Thumbnail placeholder */}
                  <div className="w-14 h-14 bg-muted rounded flex items-center justify-center flex-shrink-0">
                    {artwork.is_highlight
                      ? <Star className="h-5 w-5 text-amber-500" />
                      : <Image className="h-5 w-5 text-muted-foreground/40" />}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0 cursor-pointer" onClick={() => handleExpand(artwork)}>
                    <div className="flex items-center gap-2 mb-0.5">
                      <h3 className="font-semibold text-sm truncate">{titleDe}</h3>
                      <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                      {artwork.is_highlight && <Badge variant="outline" className="text-amber-600">Highlight</Badge>}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      {[artwork.artist_name, artwork.year_created, artwork.medium].filter(Boolean).join(' · ') || 'Keine Details'}
                    </p>
                    {artwork.inventory_number && (
                      <p className="text-xs text-muted-foreground font-mono mt-0.5">{artwork.inventory_number}</p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => startEdit(artwork)} title="Bearbeiten">
                      <Edit3 className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8"
                      onClick={() => handleAiGenerate(artwork.id)}
                      disabled={generating === artwork.id}
                      title="KI-Inhalte generieren"
                    >
                      {generating === artwork.id
                        ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        : <Sparkles className="h-3.5 w-3.5" />}
                    </Button>
                    {artwork.status === 'draft' && (
                      <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => handleStatusChange(artwork.id, 'published')} title="Veroeffentlichen">
                        <Send className="h-3.5 w-3.5" />
                      </Button>
                    )}
                    {artwork.status === 'published' && (
                      <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => handleStatusChange(artwork.id, 'draft')} title="Zurueckziehen">
                        <EyeOff className="h-3.5 w-3.5" />
                      </Button>
                    )}
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => handleDelete(artwork.id)} title="Loeschen">
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => handleExpand(artwork)}>
                      {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                    </Button>
                  </div>
                </div>

                {/* Expanded detail */}
                {isExpanded && (
                  <div className="border-t px-4 py-3 bg-muted/30 space-y-3">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                      <div>
                        <span className="text-muted-foreground">Stil:</span>{' '}
                        <span className="font-medium">{artwork.style || '—'}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Epoche:</span>{' '}
                        <span className="font-medium">{artwork.epoch || '—'}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Masse:</span>{' '}
                        <span className="font-medium">{artwork.dimensions || '—'}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">KI generiert:</span>{' '}
                        <span className="font-medium">{artwork.ai_generated_at ? 'Ja' : 'Nein'}</span>
                      </div>
                    </div>

                    {/* Description preview */}
                    {(artwork.description_standard as Record<string, string>)?.de && (
                      <div>
                        <Label className="text-xs">Beschreibung (DE)</Label>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-3">
                          {(artwork.description_standard as Record<string, string>).de}
                        </p>
                      </div>
                    )}

                    {/* Content depth indicators */}
                    <div>
                      <Label className="text-xs">Inhaltsebenen</Label>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {[
                          { key: 'description_brief', label: 'Kurz' },
                          { key: 'description_standard', label: 'Standard' },
                          { key: 'description_detailed', label: 'Detailliert' },
                          { key: 'description_children', label: 'Kinder' },
                          { key: 'description_youth', label: 'Jugend' },
                          { key: 'fun_facts', label: 'Fun Facts' },
                          { key: 'historical_context', label: 'Geschichte' },
                          { key: 'technique_details', label: 'Technik' },
                        ].map(layer => {
                          const content = (artwork[layer.key as keyof Artwork] as Record<string, string>)?.de
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

                    {/* Tags */}
                    {artwork.tags?.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {artwork.tags.map(tag => (
                          <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                        ))}
                      </div>
                    )}

                    {/* Media section */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Label className="text-xs">Medien ({mediaItems.length})</Label>
                        <div>
                          <input
                            ref={fileRef}
                            type="file"
                            className="hidden"
                            accept="image/*,video/*,audio/*"
                            multiple
                            onChange={e => e.target.files && handleMediaUpload(artwork.id, e.target.files)}
                          />
                          <Button size="sm" variant="outline" onClick={() => fileRef.current?.click()} disabled={uploading}>
                            {uploading ? <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" /> : <Upload className="h-3.5 w-3.5 mr-1" />}
                            Hochladen
                          </Button>
                        </div>
                      </div>
                      {mediaItems.length > 0 ? (
                        <div className="flex gap-2 overflow-x-auto pb-1">
                          {mediaItems.map(m => (
                            <div key={m.id} className="w-20 h-20 bg-muted rounded flex-shrink-0 overflow-hidden relative">
                              {m.media_type === 'image' ? (
                                <img src={m.url} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <FileText className="h-6 w-6 text-muted-foreground" />
                                </div>
                              )}
                              {m.is_primary && (
                                <Badge className="absolute top-0.5 left-0.5 text-[8px] px-1 py-0">Haupt</Badge>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-muted-foreground">Noch keine Medien hochgeladen.</p>
                      )}
                    </div>

                    {/* Quick actions */}
                    <div className="flex gap-2 pt-1">
                      <Button size="sm" variant="outline" onClick={() => handleAiGenerate(artwork.id)} disabled={generating === artwork.id}>
                        {generating === artwork.id
                          ? <><Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" /> Generiere...</>
                          : <><Sparkles className="h-3.5 w-3.5 mr-1" /> KI-Inhalte generieren</>}
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => startEdit(artwork)}>
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
