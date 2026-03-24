// Fintutto World — Sortable Content List (Drag & Drop)
// Ermoeglicht Kuratoren die Reihenfolge von Inhalten per Drag & Drop zu aendern
// Speichert sort_order in fw_content_items

import { useState, useEffect, useCallback, useRef } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  GripVertical, Save, Loader2, Undo2, Globe, Search,
  ArrowUp, ArrowDown, CheckCircle2,
} from 'lucide-react'
import { supabase } from '@/lib/supabase'

// ── Types ───────────────────────────────────────────────────────────

interface SortableItem {
  id: string
  name: Record<string, string>
  slug: string
  content_type: string
  domain: string
  status: string
  sort_order: number
  parent_name: string | null
  cover_image_url: string | null
}

interface SortableContentListProps {
  /** Filter by parent_id (museum, city, etc.) */
  parentId?: string
  /** Filter by domain */
  domain?: string
}

// ── Component ───────────────────────────────────────────────────────

export default function SortableContentList({ parentId, domain }: SortableContentListProps) {
  const [items, setItems] = useState<SortableItem[]>([])
  const [originalOrder, setOriginalOrder] = useState<SortableItem[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [search, setSearch] = useState('')
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)
  const listRef = useRef<HTMLDivElement>(null)

  const hasChanges = JSON.stringify(items.map(i => i.id)) !== JSON.stringify(originalOrder.map(i => i.id))

  useEffect(() => {
    loadItems()
  }, [parentId, domain])

  async function loadItems() {
    setLoading(true)

    let query = supabase
      .from('fw_content_items')
      .select('id, name, slug, content_type, domain, status, sort_order, parent_name, cover_image_url')
      .order('sort_order', { ascending: true })
      .order('updated_at', { ascending: false })
      .limit(200)

    if (parentId) query = query.eq('parent_id', parentId)
    if (domain) query = query.eq('domain', domain)

    const { data } = await query
    const loaded = (data || []) as SortableItem[]
    setItems(loaded)
    setOriginalOrder(loaded)
    setLoading(false)
  }

  // ── Drag & Drop Handlers ────────────────────────────────────────

  const handleDragStart = useCallback((e: React.DragEvent, index: number) => {
    setDragIndex(index)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', index.toString())
    // Add drag ghost opacity
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '0.5'
    }
  }, [])

  const handleDragEnd = useCallback((e: React.DragEvent) => {
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '1'
    }
    setDragIndex(null)
    setDragOverIndex(null)
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent, index: number) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOverIndex(index)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent, dropIndex: number) => {
    e.preventDefault()
    const fromIndex = dragIndex
    if (fromIndex === null || fromIndex === dropIndex) return

    setItems(prev => {
      const next = [...prev]
      const [moved] = next.splice(fromIndex, 1)
      next.splice(dropIndex, 0, moved)
      return next
    })

    setDragIndex(null)
    setDragOverIndex(null)
  }, [dragIndex])

  // ── Arrow key reorder ───────────────────────────────────────────

  const moveItem = useCallback((index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1
    if (newIndex < 0 || newIndex >= items.length) return

    setItems(prev => {
      const next = [...prev]
      const temp = next[index]
      next[index] = next[newIndex]
      next[newIndex] = temp
      return next
    })
  }, [items.length])

  // ── Save order ──────────────────────────────────────────────────

  async function handleSave() {
    setSaving(true)
    setSaved(false)

    const updates = items.map((item, index) => ({
      id: item.id,
      sort_order: index + 1,
    }))

    // Batch update via individual calls (Supabase doesn't support bulk update by array)
    let success = true
    for (const upd of updates) {
      const { error } = await supabase
        .from('fw_content_items')
        .update({ sort_order: upd.sort_order })
        .eq('id', upd.id)
      if (error) {
        success = false
        break
      }
    }

    if (success) {
      setOriginalOrder([...items])
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    }
    setSaving(false)
  }

  function handleReset() {
    setItems([...originalOrder])
  }

  // ── Filter ──────────────────────────────────────────────────────

  const filteredItems = search
    ? items.filter(i => {
        const name = i.name?.de?.toLowerCase() || i.slug.toLowerCase()
        return name.includes(search.toLowerCase())
      })
    : items

  // ── Status config ─────────────────────────────────────────────

  const statusVariant: Record<string, 'default' | 'secondary' | 'outline' | 'destructive'> = {
    draft: 'secondary',
    review: 'outline',
    published: 'default',
    archived: 'destructive',
  }

  const statusLabel: Record<string, string> = {
    draft: 'Entwurf',
    review: 'Review',
    published: 'Live',
    archived: 'Archiviert',
  }

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
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <GripVertical className="h-5 w-5" />
            Reihenfolge sortieren
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Ziehe Eintraege per Drag & Drop oder nutze die Pfeiltasten.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {hasChanges && (
            <Button variant="outline" size="sm" onClick={handleReset}>
              <Undo2 className="h-3.5 w-3.5 mr-1" /> Zuruecksetzen
            </Button>
          )}
          <Button
            size="sm"
            onClick={handleSave}
            disabled={saving || !hasChanges}
          >
            {saving ? (
              <><Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" /> Speichere...</>
            ) : saved ? (
              <><CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Gespeichert</>
            ) : (
              <><Save className="h-3.5 w-3.5 mr-1" /> Reihenfolge speichern</>
            )}
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-xs">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
        <Input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Filtern..."
          className="pl-8 h-8 text-xs"
        />
      </div>

      {/* Change indicator */}
      {hasChanges && (
        <div className="text-xs text-amber-600 bg-amber-50 rounded-lg px-3 py-2">
          Reihenfolge geaendert — klicke &quot;Reihenfolge speichern&quot; um die Aenderungen zu uebernehmen.
        </div>
      )}

      {/* Sortable List */}
      <div ref={listRef} className="space-y-1">
        {filteredItems.map((item, index) => {
          const name = item.name?.de || item.slug || '—'
          const isDragging = dragIndex === index
          const isDragOver = dragOverIndex === index

          return (
            <div
              key={item.id}
              draggable
              onDragStart={e => handleDragStart(e, index)}
              onDragEnd={handleDragEnd}
              onDragOver={e => handleDragOver(e, index)}
              onDrop={e => handleDrop(e, index)}
              className={`
                flex items-center gap-2 p-2.5 rounded-lg border bg-background transition
                ${isDragging ? 'opacity-50 border-dashed' : ''}
                ${isDragOver && !isDragging ? 'border-primary bg-primary/5' : ''}
                cursor-grab active:cursor-grabbing
              `}
            >
              {/* Drag handle */}
              <GripVertical className="h-4 w-4 text-muted-foreground flex-shrink-0" />

              {/* Position number */}
              <span className="w-6 text-center text-xs font-mono text-muted-foreground">
                {index + 1}
              </span>

              {/* Thumbnail */}
              {item.cover_image_url ? (
                <img src={item.cover_image_url} alt="" className="w-8 h-8 rounded object-cover flex-shrink-0" />
              ) : (
                <div className="w-8 h-8 rounded bg-muted flex items-center justify-center flex-shrink-0">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                </div>
              )}

              {/* Name + meta */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{name}</p>
                <p className="text-xs text-muted-foreground">{item.content_type} — {item.parent_name || item.domain}</p>
              </div>

              {/* Status */}
              <Badge variant={statusVariant[item.status] || 'secondary'} className="text-[10px]">
                {statusLabel[item.status] || item.status}
              </Badge>

              {/* Arrow controls */}
              <div className="flex flex-col gap-0.5 flex-shrink-0">
                <button
                  className="p-0.5 rounded hover:bg-muted disabled:opacity-20"
                  onClick={() => moveItem(index, 'up')}
                  disabled={index === 0}
                  title="Nach oben"
                >
                  <ArrowUp className="h-3 w-3" />
                </button>
                <button
                  className="p-0.5 rounded hover:bg-muted disabled:opacity-20"
                  onClick={() => moveItem(index, 'down')}
                  disabled={index === filteredItems.length - 1}
                  title="Nach unten"
                >
                  <ArrowDown className="h-3 w-3" />
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {filteredItems.length === 0 && (
        <Card className="p-8 text-center">
          <p className="text-sm text-muted-foreground">
            {search ? 'Keine Treffer fuer diese Suche.' : 'Keine Inhalte zum Sortieren vorhanden.'}
          </p>
        </Card>
      )}

      {/* Count */}
      <p className="text-xs text-muted-foreground text-center">
        {filteredItems.length} von {items.length} Eintraegen{search ? ' (gefiltert)' : ''}
      </p>
    </div>
  )
}
