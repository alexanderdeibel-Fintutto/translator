// Fintutto World — AI Content & Translation Panel
// Monitor AI generation queue, translation pipeline, and trigger batch operations

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
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
  Sparkles, Globe, Loader2, RefreshCw, Play, Pause,
  CheckCircle2, XCircle, Clock, BarChart3, Zap, Languages,
} from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface QueueStats {
  queued: number
  processing: number
  completed: number
  failed: number
}

interface TranslationCost {
  provider: string
  chars_translated: number
  requests_made: number
  estimated_cost_eur: number
}

interface ImportJob {
  id: string
  parent_name: string | null
  source: string
  status: string
  total_items: number
  imported_items: number
  failed_items: number
  auto_translate: boolean
  translation_status: string
  created_at: string
}

interface QueueItem {
  id: string
  field_name: string
  source_language: string
  target_language: string
  status: string
  attempts: number
  provider_used: string | null
  quality_score: number | null
  processing_time_ms: number | null
  last_error: string | null
  queued_at: string
  content_item?: { name: Record<string, string> }
}

export default function AiContentPanel() {
  const [loading, setLoading] = useState(true)
  const [queueStats, setQueueStats] = useState<QueueStats>({ queued: 0, processing: 0, completed: 0, failed: 0 })
  const [costs, setCosts] = useState<TranslationCost[]>([])
  const [imports, setImports] = useState<ImportJob[]>([])
  const [queueItems, setQueueItems] = useState<QueueItem[]>([])
  const [queueFilter, setQueueFilter] = useState<'all' | 'queued' | 'processing' | 'failed'>('queued')
  const [processing, setProcessing] = useState(false)

  // Content stats
  const [contentStats, setContentStats] = useState({
    total: 0,
    draft: 0,
    published: 0,
    aiGenerated: 0,
    translationPending: 0,
  })

  useEffect(() => { loadAll() }, [])
  useEffect(() => { loadQueue() }, [queueFilter])

  async function loadAll() {
    setLoading(true)
    await Promise.all([
      loadQueueStats(),
      loadCosts(),
      loadImports(),
      loadContentStats(),
      loadQueue(),
    ])
    setLoading(false)
  }

  async function loadQueueStats() {
    const statuses = ['queued', 'processing', 'completed', 'failed'] as const
    const counts = await Promise.all(
      statuses.map(s =>
        supabase
          .from('fw_translation_queue')
          .select('id', { count: 'exact', head: true })
          .eq('status', s)
          .then(r => r.count || 0),
      ),
    )
    setQueueStats({
      queued: counts[0],
      processing: counts[1],
      completed: counts[2],
      failed: counts[3],
    })
  }

  async function loadCosts() {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0]
    const { data } = await supabase
      .from('fw_translation_costs')
      .select('provider, chars_translated, requests_made, estimated_cost_eur')
      .gte('date', thirtyDaysAgo)

    // Aggregate by provider
    const providerMap: Record<string, TranslationCost> = {}
    for (const row of data || []) {
      const key = row.provider
      if (!providerMap[key]) {
        providerMap[key] = { provider: key, chars_translated: 0, requests_made: 0, estimated_cost_eur: 0 }
      }
      providerMap[key].chars_translated += row.chars_translated || 0
      providerMap[key].requests_made += row.requests_made || 0
      providerMap[key].estimated_cost_eur += parseFloat(String(row.estimated_cost_eur)) || 0
    }
    setCosts(Object.values(providerMap).sort((a, b) => b.chars_translated - a.chars_translated))
  }

  async function loadImports() {
    const { data } = await supabase
      .from('fw_content_imports')
      .select('id, parent_name, source, status, total_items, imported_items, failed_items, auto_translate, translation_status, created_at')
      .order('created_at', { ascending: false })
      .limit(20)

    setImports((data || []) as ImportJob[])
  }

  async function loadContentStats() {
    const [totalRes, draftRes, pubRes, aiRes, transPendRes] = await Promise.all([
      supabase.from('fw_content_items').select('id', { count: 'exact', head: true }),
      supabase.from('fw_content_items').select('id', { count: 'exact', head: true }).eq('status', 'draft'),
      supabase.from('fw_content_items').select('id', { count: 'exact', head: true }).eq('status', 'published'),
      supabase.from('fw_content_items').select('id', { count: 'exact', head: true }).not('ai_generated_at', 'is', null),
      supabase.from('fw_content_items').select('id', { count: 'exact', head: true }).eq('ai_auto_translate_status', 'pending'),
    ])

    setContentStats({
      total: totalRes.count || 0,
      draft: draftRes.count || 0,
      published: pubRes.count || 0,
      aiGenerated: aiRes.count || 0,
      translationPending: transPendRes.count || 0,
    })
  }

  async function loadQueue() {
    let query = supabase
      .from('fw_translation_queue')
      .select('id, field_name, source_language, target_language, status, attempts, provider_used, quality_score, processing_time_ms, last_error, queued_at')
      .order('queued_at', { ascending: false })
      .limit(50)

    if (queueFilter !== 'all') query = query.eq('status', queueFilter)

    const { data } = await query
    setQueueItems((data || []) as QueueItem[])
  }

  async function triggerBatchTranslate() {
    setProcessing(true)
    try {
      await supabase.functions.invoke('fintutto-world-translate', {
        body: { action: 'process_queue', batch_size: 50 },
      })
      // Reload after processing
      setTimeout(() => {
        loadQueueStats()
        loadQueue()
        setProcessing(false)
      }, 3000)
    } catch {
      setProcessing(false)
    }
  }

  async function triggerBatchEnrich() {
    setProcessing(true)
    try {
      await supabase.functions.invoke('content-enrich', {
        body: { action: 'enrich_pending', batch_size: 20 },
      })
      setTimeout(() => {
        loadContentStats()
        setProcessing(false)
      }, 5000)
    } catch {
      setProcessing(false)
    }
  }

  async function retryFailed() {
    await supabase
      .from('fw_translation_queue')
      .update({ status: 'queued', attempts: 0, last_error: null })
      .eq('status', 'failed')
    loadQueueStats()
    loadQueue()
  }

  const totalCost = costs.reduce((s, c) => s + c.estimated_cost_eur, 0)
  const totalChars = costs.reduce((s, c) => s + c.chars_translated, 0)

  if (loading) {
    return (
      <div className="text-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mx-auto" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Sparkles className="h-6 w-6" />
            KI & Uebersetzungen
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            KI-Generierung, Uebersetzungs-Pipeline und Kosten-Tracking.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadAll}>
            <RefreshCw className="h-4 w-4 mr-2" /> Aktualisieren
          </Button>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
        <Card className="p-4 text-center">
          <BarChart3 className="h-5 w-5 mx-auto mb-1 text-blue-500" />
          <div className="text-xl font-bold">{contentStats.total}</div>
          <div className="text-xs text-muted-foreground">Content Items</div>
        </Card>
        <Card className="p-4 text-center">
          <Sparkles className="h-5 w-5 mx-auto mb-1 text-violet-500" />
          <div className="text-xl font-bold">{contentStats.aiGenerated}</div>
          <div className="text-xs text-muted-foreground">KI-generiert</div>
        </Card>
        <Card className="p-4 text-center">
          <Languages className="h-5 w-5 mx-auto mb-1 text-cyan-500" />
          <div className="text-xl font-bold">{queueStats.queued + queueStats.processing}</div>
          <div className="text-xs text-muted-foreground">Uebersetzungen offen</div>
        </Card>
        <Card className="p-4 text-center">
          <Globe className="h-5 w-5 mx-auto mb-1 text-emerald-500" />
          <div className="text-xl font-bold">{(totalChars / 1000).toFixed(0)}k</div>
          <div className="text-xs text-muted-foreground">Zeichen (30 Tage)</div>
        </Card>
        <Card className="p-4 text-center">
          <Zap className="h-5 w-5 mx-auto mb-1 text-amber-500" />
          <div className="text-xl font-bold">{totalCost.toFixed(2)}€</div>
          <div className="text-xs text-muted-foreground">Kosten (30 Tage)</div>
        </Card>
      </div>

      {/* Action buttons */}
      <div className="flex gap-3">
        <Button onClick={triggerBatchEnrich} disabled={processing || contentStats.translationPending === 0}>
          {processing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
          KI-Anreicherung starten ({contentStats.translationPending} ausstehend)
        </Button>
        <Button variant="outline" onClick={triggerBatchTranslate} disabled={processing || queueStats.queued === 0}>
          {processing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Play className="h-4 w-4 mr-2" />}
          Uebersetzungs-Queue abarbeiten ({queueStats.queued})
        </Button>
        {queueStats.failed > 0 && (
          <Button variant="outline" onClick={retryFailed}>
            <RefreshCw className="h-4 w-4 mr-2" /> {queueStats.failed} Fehler wiederholen
          </Button>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Translation Queue */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold flex items-center gap-2">
              <Languages className="h-4 w-4" /> Uebersetzungs-Queue
            </h3>
            <Select value={queueFilter} onValueChange={v => setQueueFilter(v as typeof queueFilter)}>
              <SelectTrigger className="w-32 h-7 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle</SelectItem>
                <SelectItem value="queued">Wartend ({queueStats.queued})</SelectItem>
                <SelectItem value="processing">In Arbeit ({queueStats.processing})</SelectItem>
                <SelectItem value="failed">Fehler ({queueStats.failed})</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Queue status summary */}
          <div className="flex gap-3 mb-3 text-xs">
            <span className="flex items-center gap-1"><Clock className="h-3 w-3 text-amber-500" /> {queueStats.queued} wartend</span>
            <span className="flex items-center gap-1"><Loader2 className="h-3 w-3 text-blue-500" /> {queueStats.processing} aktiv</span>
            <span className="flex items-center gap-1"><CheckCircle2 className="h-3 w-3 text-emerald-500" /> {queueStats.completed} fertig</span>
            <span className="flex items-center gap-1"><XCircle className="h-3 w-3 text-destructive" /> {queueStats.failed} fehler</span>
          </div>

          <div className="max-h-[300px] overflow-y-auto space-y-1">
            {queueItems.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">Keine Eintraege.</p>
            ) : (
              queueItems.map(item => (
                <div key={item.id} className="flex items-center gap-2 p-2 bg-muted/50 rounded text-xs">
                  {item.status === 'queued' && <Clock className="h-3 w-3 text-amber-500 flex-shrink-0" />}
                  {item.status === 'processing' && <Loader2 className="h-3 w-3 text-blue-500 animate-spin flex-shrink-0" />}
                  {item.status === 'completed' && <CheckCircle2 className="h-3 w-3 text-emerald-500 flex-shrink-0" />}
                  {item.status === 'failed' && <XCircle className="h-3 w-3 text-destructive flex-shrink-0" />}
                  <span className="flex-1 truncate">{item.field_name}</span>
                  <Badge variant="outline" className="text-[10px]">
                    {item.source_language}→{item.target_language}
                  </Badge>
                  {item.provider_used && (
                    <Badge variant="secondary" className="text-[10px]">{item.provider_used}</Badge>
                  )}
                  {item.quality_score != null && (
                    <span className="text-muted-foreground">{(item.quality_score * 100).toFixed(0)}%</span>
                  )}
                  {item.last_error && (
                    <span className="text-destructive truncate max-w-[120px]" title={item.last_error}>{item.last_error}</span>
                  )}
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Provider costs */}
        <Card className="p-4">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Zap className="h-4 w-4" /> Provider-Kosten (30 Tage)
          </h3>
          {costs.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">Noch keine Kosten erfasst.</p>
          ) : (
            <div className="space-y-3">
              {costs.map(cost => (
                <div key={cost.provider} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium capitalize">{cost.provider}</span>
                    <span className="text-muted-foreground">{cost.estimated_cost_eur.toFixed(2)}€</span>
                  </div>
                  <div className="flex gap-3 text-xs text-muted-foreground">
                    <span>{(cost.chars_translated / 1000).toFixed(0)}k Zeichen</span>
                    <span>{cost.requests_made} Anfragen</span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full"
                      style={{ width: `${totalChars > 0 ? (cost.chars_translated / totalChars) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              ))}
              <div className="pt-2 border-t flex items-center justify-between text-sm font-medium">
                <span>Gesamt</span>
                <span>{totalCost.toFixed(2)}€ · {(totalChars / 1000).toFixed(0)}k Zeichen</span>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Import history */}
      {imports.length > 0 && (
        <Card className="p-4">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <BarChart3 className="h-4 w-4" /> Import-Historie
          </h3>
          <div className="max-h-[250px] overflow-y-auto space-y-1">
            {imports.map(imp => (
              <div key={imp.id} className="flex items-center gap-3 p-2 bg-muted/50 rounded text-xs">
                <Badge variant={imp.status === 'completed' ? 'default' : imp.status === 'failed' ? 'destructive' : 'secondary'} className="text-[10px]">
                  {imp.status}
                </Badge>
                <span className="flex-1 truncate">{imp.parent_name || '—'}</span>
                <span className="text-muted-foreground">{imp.source}</span>
                <span className="text-muted-foreground">
                  {imp.imported_items}/{imp.total_items}
                  {imp.failed_items > 0 && <span className="text-destructive ml-1">({imp.failed_items} fehler)</span>}
                </span>
                {imp.auto_translate && (
                  <Badge variant="outline" className="text-[10px]">
                    <Globe className="h-2.5 w-2.5 mr-0.5" /> {imp.translation_status}
                  </Badge>
                )}
                <span className="text-muted-foreground">{new Date(imp.created_at).toLocaleDateString('de-DE')}</span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}
