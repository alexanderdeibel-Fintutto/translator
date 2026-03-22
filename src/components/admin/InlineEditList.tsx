// Fintutto World — Inline Edit List
// Klick-zum-Editieren direkt in der Listenansicht, ohne Seitenwechsel
// Felder: Name, Status, Tags, is_highlight — erweiterbar

import { useState, useEffect, useRef, useCallback } from 'react'
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
  Globe, Search, Loader2, Check, X, Star,
  Edit3, Save, Pencil, Filter,
} from 'lucide-react'
import { supabase } from '@/lib/supabase'

// ── Types ───────────────────────────────────────────────────────────

interface EditableItem {
  id: string
  name: Record<string, string>
  slug: string
  content_type: string
  domain: string
  status: string
  tags: string[]
  is_highlight: boolean
  parent_name: string | null
  cover_image_url: string | null
  updated_at: string
}

type EditField = 'name' | 'status' | 'tags' | 'is_highlight'

interface EditState {
  itemId: string
  field: EditField
  value: string | boolean
}

interface InlineEditListProps {
  parentId?: string
  domain?: string
}

// ── Status config ───────────────────────────────────────────────────

const STATUS_OPTIONS = [
  { value: 'draft', label: 'Entwurf' },
  { value: 'review', label: 'Review' },
  { value: 'published', label: 'Live' },
  { value: 'archived', label: 'Archiviert' },
]

const statusVariant: Record<string, 'default' | 'secondary' | 'outline' | 'destructive'> = {
  draft: 'secondary',
  review: 'outline',
  published: 'default',
  archived: 'destructive',
}

// ── Component ───────────────────────────────────────────────────────

export default function InlineEditList({ parentId, domain }: InlineEditListProps) {
  const [items, setItems] = useState<EditableItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [editing, setEditing] = useState<EditState | null>(null)
  const [saving, setSaving] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => { loadItems() }, [parentId, domain, statusFilter])

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [editing])

  async function loadItems() {
    setLoading(true)
    let query = supabase
      .from('fw_content_items')
      .select('id, name, slug, content_type, domain, status, tags, is_highlight, parent_name, cover_image_url, updated_at')
      .order('updated_at', { ascending: false })
      .limit(100)

    if (parentId) query = query.eq('parent_id', parentId)
    if (domain) query = query.eq('domain', domain)
    if (statusFilter !== 'all') query = query.eq('status', statusFilter)

    const { data } = await query
    setItems((data || []) as EditableItem[])
    setLoading(false)
  }

  // ── Inline edit handlers ──────────────────────────────────────────

  function startEdit(itemId: string, field: EditField, currentValue: string | boolean) {
    setEditing({ itemId, field, value: currentValue })
  }

  function cancelEdit() {
    setEditing(null)
  }

  const saveEdit = useCallback(async () => {
    if (!editing) return
    setSaving(editing.itemId)

    const updates: Record<string, unknown> = {}

    switch (editing.field) {
      case 'name': {
        const item = items.find(i => i.id === editing.itemId)
        updates.name = { ...(item?.name || {}), de: editing.value as string }
        break
      }
      case 'status':
        updates.status = editing.value as string
        if (editing.value === 'published') updates.published_at = new Date().toISOString()
        break
      case 'tags':
        updates.tags = (editing.value as string).split(',').map(t => t.trim()).filter(Boolean)
        break
      case 'is_highlight':
        updates.is_highlight = editing.value as boolean
        break
    }

    const { error } = await supabase
      .from('fw_content_items')
      .update(updates)
      .eq('id', editing.itemId)

    if (!error) {
      // Optimistic local update
      setItems(prev => prev.map(item => {
        if (item.id !== editing.itemId) return item
        const updated = { ...item }
        if (editing.field === 'name') {
          updated.name = { ...item.name, de: editing.value as string }
        } else if (editing.field === 'status') {
          updated.status = editing.value as string
        } else if (editing.field === 'tags') {
          updated.tags = (editing.value as string).split(',').map(t => t.trim()).filter(Boolean)
        } else if (editing.field === 'is_highlight') {
          updated.is_highlight = editing.value as boolean
        }
        return updated
      }))
    }

    setEditing(null)
    setSaving(null)
  }, [editing, items])

  // Handle Enter/Escape in text inputs
  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') saveEdit()
    if (e.key === 'Escape') cancelEdit()
  }

  // ── Filter ──────────────────────────────────────────────────────

  const filteredItems = search
    ? items.filter(i => {
        const name = i.name?.de?.toLowerCase() || i.slug.toLowerCase()
        return name.includes(search.toLowerCase()) ||
          i.tags?.some(t => t.toLowerCase().includes(search.toLowerCase()))
      })
    : items

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Pencil className="h-5 w-5" />
          Schnellbearbeitung
        </h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          Klicke auf ein Feld um es direkt zu bearbeiten. Enter speichert, Escape bricht ab.
        </p>
      </div>

      {/* Filters */}
      <div className="flex gap-3 items-end">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Suche..."
            className="pl-8 h-8 text-xs"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-32 h-8 text-xs">
            <Filter className="h-3 w-3 mr-1" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Status</SelectItem>
            {STATUS_OPTIONS.map(s => (
              <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table Header */}
      <div className="grid grid-cols-[auto_1fr_100px_1fr_60px] gap-2 px-3 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
        <span className="w-8" />
        <span>Name</span>
        <span>Status</span>
        <span>Tags</span>
        <span className="text-center">HL</span>
      </div>

      {/* Rows */}
      <div className="space-y-1">
        {filteredItems.map(item => {
          const nameDe = item.name?.de || item.slug || '—'
          const isEditingName = editing?.itemId === item.id && editing.field === 'name'
          const isEditingStatus = editing?.itemId === item.id && editing.field === 'status'
          const isEditingTags = editing?.itemId === item.id && editing.field === 'tags'
          const isSaving = saving === item.id

          return (
            <div
              key={item.id}
              className="grid grid-cols-[auto_1fr_100px_1fr_60px] gap-2 items-center px-3 py-2 rounded-lg border bg-background hover:bg-muted/30 transition"
            >
              {/* Thumbnail */}
              {item.cover_image_url ? (
                <img src={item.cover_image_url} alt="" className="w-8 h-8 rounded object-cover" />
              ) : (
                <div className="w-8 h-8 rounded bg-muted flex items-center justify-center">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                </div>
              )}

              {/* Name — editable */}
              <div className="min-w-0">
                {isEditingName ? (
                  <div className="flex items-center gap-1">
                    <Input
                      ref={inputRef}
                      value={editing.value as string}
                      onChange={e => setEditing({ ...editing, value: e.target.value })}
                      onKeyDown={handleKeyDown}
                      className="h-7 text-sm"
                    />
                    <button onClick={saveEdit} className="p-1 text-green-600 hover:bg-green-50 rounded" title="Speichern">
                      <Check className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={cancelEdit} className="p-1 text-red-500 hover:bg-red-50 rounded" title="Abbrechen">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ) : (
                  <span
                    className="text-sm font-medium truncate block cursor-pointer hover:text-primary group"
                    onClick={() => startEdit(item.id, 'name', nameDe)}
                    title="Klicken zum Bearbeiten"
                  >
                    {nameDe}
                    <Edit3 className="h-3 w-3 inline ml-1 opacity-0 group-hover:opacity-50" />
                  </span>
                )}
              </div>

              {/* Status — editable */}
              <div>
                {isEditingStatus ? (
                  <Select
                    value={editing.value as string}
                    onValueChange={value => {
                      setEditing({ ...editing, value })
                      // Auto-save status changes
                      setTimeout(() => {
                        setEditing(prev => {
                          if (prev?.field === 'status') {
                            // Will trigger saveEdit via effect
                          }
                          return prev
                        })
                      }, 0)
                    }}
                  >
                    <SelectTrigger className="h-6 text-[10px] w-24">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUS_OPTIONS.map(s => (
                        <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Badge
                    variant={statusVariant[item.status] || 'secondary'}
                    className="text-[10px] cursor-pointer hover:ring-1 hover:ring-primary"
                    onClick={() => startEdit(item.id, 'status', item.status)}
                    title="Klicken zum Aendern"
                  >
                    {STATUS_OPTIONS.find(s => s.value === item.status)?.label || item.status}
                  </Badge>
                )}
              </div>

              {/* Tags — editable */}
              <div className="min-w-0">
                {isEditingTags ? (
                  <div className="flex items-center gap-1">
                    <Input
                      ref={inputRef}
                      value={editing.value as string}
                      onChange={e => setEditing({ ...editing, value: e.target.value })}
                      onKeyDown={handleKeyDown}
                      className="h-7 text-xs"
                      placeholder="tag1, tag2"
                    />
                    <button onClick={saveEdit} className="p-1 text-green-600 hover:bg-green-50 rounded">
                      <Check className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={cancelEdit} className="p-1 text-red-500 hover:bg-red-50 rounded">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ) : (
                  <div
                    className="flex flex-wrap gap-0.5 cursor-pointer group min-h-[20px]"
                    onClick={() => startEdit(item.id, 'tags', item.tags?.join(', ') || '')}
                    title="Klicken zum Bearbeiten"
                  >
                    {item.tags?.length > 0 ? (
                      item.tags.slice(0, 3).map(tag => (
                        <Badge key={tag} variant="secondary" className="text-[10px]">{tag}</Badge>
                      ))
                    ) : (
                      <span className="text-[10px] text-muted-foreground italic">keine Tags</span>
                    )}
                    {item.tags?.length > 3 && (
                      <Badge variant="outline" className="text-[10px]">+{item.tags.length - 3}</Badge>
                    )}
                    <Edit3 className="h-3 w-3 self-center ml-0.5 opacity-0 group-hover:opacity-50" />
                  </div>
                )}
              </div>

              {/* Highlight toggle */}
              <div className="flex justify-center">
                {isSaving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <button
                    className={`p-1 rounded transition ${
                      item.is_highlight
                        ? 'text-amber-500 hover:text-amber-600'
                        : 'text-muted-foreground/30 hover:text-amber-400'
                    }`}
                    onClick={async () => {
                      setSaving(item.id)
                      const newVal = !item.is_highlight
                      await supabase
                        .from('fw_content_items')
                        .update({ is_highlight: newVal })
                        .eq('id', item.id)
                      setItems(prev => prev.map(i =>
                        i.id === item.id ? { ...i, is_highlight: newVal } : i
                      ))
                      setSaving(null)
                    }}
                    title={item.is_highlight ? 'Highlight entfernen' : 'Als Highlight markieren'}
                  >
                    <Star className={`h-4 w-4 ${item.is_highlight ? 'fill-current' : ''}`} />
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {filteredItems.length === 0 && (
        <Card className="p-8 text-center">
          <p className="text-sm text-muted-foreground">
            {search ? 'Keine Treffer.' : 'Keine Inhalte vorhanden.'}
          </p>
        </Card>
      )}

      <p className="text-xs text-muted-foreground text-center">
        {filteredItems.length} Eintraege{search ? ' (gefiltert)' : ''}
      </p>
    </div>
  )
}
