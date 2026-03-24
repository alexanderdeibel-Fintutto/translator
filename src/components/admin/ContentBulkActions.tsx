// Fintutto World — Content Bulk Actions
// Multi-Select + Status aendern, Tags zuweisen, Uebersetzen, Loeschen, AI-Enrichment

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  CheckSquare, Loader2, Send, Trash2, Globe, Sparkles, Tag,
  ChevronDown, Eye, EyeOff, Archive,
} from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface ContentBulkActionsProps {
  /** Selected item IDs */
  selectedIds: string[]
  /** Table to operate on */
  table: 'fw_content_items' | 'ag_artworks'
  /** Callback when action completes */
  onComplete: () => void
  /** Clear selection */
  onClearSelection: () => void
}

type BulkAction = 'status' | 'tags' | 'translate' | 'enrich' | 'delete'

export default function ContentBulkActions({
  selectedIds,
  table,
  onComplete,
  onClearSelection,
}: ContentBulkActionsProps) {
  const [activeAction, setActiveAction] = useState<BulkAction | null>(null)
  const [processing, setProcessing] = useState(false)
  const [newStatus, setNewStatus] = useState('published')
  const [newTags, setNewTags] = useState('')
  const [targetLangs, setTargetLangs] = useState<string[]>(['en'])
  const [result, setResult] = useState<{ success: number; failed: number } | null>(null)

  if (selectedIds.length === 0) return null

  async function executeAction() {
    setProcessing(true)
    setResult(null)
    let success = 0
    let failed = 0

    try {
      switch (activeAction) {
        case 'status': {
          const { error } = await supabase
            .from(table)
            .update({ status: newStatus, updated_at: new Date().toISOString() })
            .in('id', selectedIds)
          if (error) failed = selectedIds.length
          else success = selectedIds.length
          break
        }

        case 'tags': {
          const tagsArray = newTags.split(/[,;]/).map(t => t.trim()).filter(Boolean)
          if (tagsArray.length === 0) break

          for (const id of selectedIds) {
            try {
              const { data: current } = await supabase.from(table).select('tags').eq('id', id).single()
              const existingTags = (current?.tags as string[]) || []
              const merged = [...new Set([...existingTags, ...tagsArray])]
              await supabase.from(table).update({ tags: merged }).eq('id', id)
              success++
            } catch {
              failed++
            }
          }
          break
        }

        case 'translate': {
          // Queue translation via content-enrich
          try {
            await supabase.functions.invoke('content-enrich', {
              body: {
                action: 'translate',
                item_ids: selectedIds,
                target_languages: targetLangs,
                table,
              },
            })
            success = selectedIds.length
          } catch {
            failed = selectedIds.length
          }
          break
        }

        case 'enrich': {
          // Queue AI enrichment
          try {
            await supabase.functions.invoke('content-enrich', {
              body: {
                action: 'enrich_batch',
                item_ids: selectedIds,
                table,
                config: { description_levels: ['brief', 'standard', 'detailed', 'children'] },
              },
            })
            success = selectedIds.length
          } catch {
            failed = selectedIds.length
          }
          break
        }

        case 'delete': {
          const { error } = await supabase
            .from(table)
            .update({ status: 'archived', updated_at: new Date().toISOString() })
            .in('id', selectedIds)
          if (error) failed = selectedIds.length
          else success = selectedIds.length
          break
        }
      }
    } finally {
      setResult({ success, failed })
      setProcessing(false)
      if (success > 0) onComplete()
    }
  }

  const AVAILABLE_LANGS = [
    { code: 'en', label: 'EN' }, { code: 'fr', label: 'FR' },
    { code: 'it', label: 'IT' }, { code: 'es', label: 'ES' },
    { code: 'nl', label: 'NL' }, { code: 'pl', label: 'PL' },
    { code: 'zh', label: 'ZH' }, { code: 'ja', label: 'JA' },
  ]

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/5 border border-primary/20">
      <Badge variant="secondary" className="shrink-0">
        <CheckSquare className="h-3 w-3 mr-1" />
        {selectedIds.length} ausgewaehlt
      </Badge>

      {/* Action Buttons */}
      <div className="flex items-center gap-1.5 flex-wrap flex-1">
        <Button
          variant={activeAction === 'status' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setActiveAction(activeAction === 'status' ? null : 'status')}
          className="text-xs h-7"
        >
          <Eye className="h-3 w-3 mr-1" /> Status
        </Button>
        <Button
          variant={activeAction === 'tags' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setActiveAction(activeAction === 'tags' ? null : 'tags')}
          className="text-xs h-7"
        >
          <Tag className="h-3 w-3 mr-1" /> Tags
        </Button>
        <Button
          variant={activeAction === 'translate' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setActiveAction(activeAction === 'translate' ? null : 'translate')}
          className="text-xs h-7"
        >
          <Globe className="h-3 w-3 mr-1" /> Uebersetzen
        </Button>
        <Button
          variant={activeAction === 'enrich' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setActiveAction(activeAction === 'enrich' ? null : 'enrich')}
          className="text-xs h-7"
        >
          <Sparkles className="h-3 w-3 mr-1" /> KI-Texte
        </Button>
        <Button
          variant={activeAction === 'delete' ? 'destructive' : 'outline'}
          size="sm"
          onClick={() => setActiveAction(activeAction === 'delete' ? null : 'delete')}
          className="text-xs h-7"
        >
          <Archive className="h-3 w-3 mr-1" /> Archivieren
        </Button>
      </div>

      {/* Action Parameters */}
      {activeAction === 'status' && (
        <Select value={newStatus} onValueChange={setNewStatus}>
          <SelectTrigger className="w-32 h-7 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="draft">Entwurf</SelectItem>
            <SelectItem value="review">Review</SelectItem>
            <SelectItem value="published">Live</SelectItem>
            <SelectItem value="archived">Archiviert</SelectItem>
          </SelectContent>
        </Select>
      )}

      {activeAction === 'tags' && (
        <Input
          value={newTags}
          onChange={e => setNewTags(e.target.value)}
          placeholder="Tags (kommagetrennt)"
          className="w-48 h-7 text-xs"
        />
      )}

      {activeAction === 'translate' && (
        <div className="flex gap-1">
          {AVAILABLE_LANGS.map(lang => (
            <button
              key={lang.code}
              onClick={() => {
                setTargetLangs(prev =>
                  prev.includes(lang.code)
                    ? prev.filter(l => l !== lang.code)
                    : [...prev, lang.code]
                )
              }}
              className={`px-1.5 py-0.5 rounded text-[10px] font-medium transition ${
                targetLangs.includes(lang.code)
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              {lang.label}
            </button>
          ))}
        </div>
      )}

      {/* Execute */}
      {activeAction && (
        <Button
          size="sm"
          onClick={executeAction}
          disabled={processing}
          className="text-xs h-7"
        >
          {processing ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Ausfuehren'}
        </Button>
      )}

      {/* Result */}
      {result && (
        <span className="text-xs">
          {result.success > 0 && <span className="text-green-600">{result.success} ok</span>}
          {result.failed > 0 && <span className="text-red-500 ml-1">{result.failed} fehlgeschlagen</span>}
        </span>
      )}

      {/* Clear */}
      <Button variant="ghost" size="sm" onClick={onClearSelection} className="text-xs h-7 shrink-0">
        Auswahl aufheben
      </Button>
    </div>
  )
}
