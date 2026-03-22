// Fintutto World — Workflow Manager
// Automatische Status-Wechsel, Benachrichtigungen und Content-Regeln
// Kuratoren koennen Regeln definieren die automatisch ausfuehren

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Clock, Zap, Plus, Trash2, Save, Loader2, CheckCircle2,
  Play, Pause, Bell, Send, Sparkles, Languages, ArrowRight,
  Settings2, AlertTriangle, RefreshCw,
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { logTimelineEvent } from './StatusTimeline'

// ── Types ───────────────────────────────────────────────────────────

export interface WorkflowRule {
  id: string
  name: string
  description: string
  trigger: WorkflowTrigger
  conditions: WorkflowCondition[]
  actions: WorkflowAction[]
  is_active: boolean
  created_at: string
  last_executed_at: string | null
  execution_count: number
}

export type TriggerType = 'status_change' | 'content_created' | 'ai_complete' | 'schedule' | 'completeness_reached'

export interface WorkflowTrigger {
  type: TriggerType
  params: Record<string, string>
}

export interface WorkflowCondition {
  field: string
  operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than'
  value: string
}

export type ActionType = 'change_status' | 'send_notification' | 'ai_enrich' | 'ai_translate' | 'add_tag' | 'set_highlight'

export interface WorkflowAction {
  type: ActionType
  params: Record<string, string>
}

// ── Predefined templates ────────────────────────────────────────────

export const WORKFLOW_TEMPLATES: Omit<WorkflowRule, 'id' | 'created_at' | 'last_executed_at' | 'execution_count'>[] = [
  {
    name: 'Auto-Review nach KI-Anreicherung',
    description: 'Setzt den Status automatisch auf "Review" wenn die KI Inhalte generiert hat.',
    trigger: { type: 'ai_complete', params: {} },
    conditions: [{ field: 'status', operator: 'equals', value: 'draft' }],
    actions: [{ type: 'change_status', params: { to: 'review' } }],
    is_active: true,
  },
  {
    name: 'Benachrichtigung bei Veroeffentlichung',
    description: 'Sendet eine Benachrichtigung wenn ein Inhalt live geht.',
    trigger: { type: 'status_change', params: { to: 'published' } },
    conditions: [],
    actions: [{ type: 'send_notification', params: { message: 'Neuer Inhalt veroeffentlicht: {name}' } }],
    is_active: true,
  },
  {
    name: 'Auto-Uebersetzen bei Review',
    description: 'Startet automatische Uebersetzung in EN und FR wenn ein Eintrag in Review geht.',
    trigger: { type: 'status_change', params: { to: 'review' } },
    conditions: [],
    actions: [{ type: 'ai_translate', params: { languages: 'en,fr' } }],
    is_active: false,
  },
  {
    name: 'Highlight bei hoher Bewertung',
    description: 'Markiert Eintraege automatisch als Highlight wenn die Bewertung 4.5+ erreicht.',
    trigger: { type: 'content_created', params: {} },
    conditions: [{ field: 'rating_avg', operator: 'greater_than', value: '4.5' }],
    actions: [{ type: 'set_highlight', params: { value: 'true' } }],
    is_active: true,
  },
  {
    name: 'Auto-Publish bei Vollstaendigkeit',
    description: 'Veroeffentlicht automatisch wenn Texte, Uebersetzungen und Medien vollstaendig sind.',
    trigger: { type: 'completeness_reached', params: { threshold: '80' } },
    conditions: [{ field: 'status', operator: 'equals', value: 'review' }],
    actions: [{ type: 'change_status', params: { to: 'published' } }],
    is_active: false,
  },
]

// ── Display config ──────────────────────────────────────────────────

const TRIGGER_LABELS: Record<TriggerType, { label: string; icon: typeof Clock }> = {
  status_change: { label: 'Status-Wechsel', icon: Send },
  content_created: { label: 'Neuer Eintrag', icon: Plus },
  ai_complete: { label: 'KI fertig', icon: Sparkles },
  schedule: { label: 'Zeitgesteuert', icon: Clock },
  completeness_reached: { label: 'Vollstaendigkeit', icon: CheckCircle2 },
}

const ACTION_LABELS: Record<ActionType, { label: string; icon: typeof Clock; color: string }> = {
  change_status: { label: 'Status aendern', icon: Send, color: 'text-blue-600' },
  send_notification: { label: 'Benachrichtigung', icon: Bell, color: 'text-amber-600' },
  ai_enrich: { label: 'KI anreichern', icon: Sparkles, color: 'text-purple-600' },
  ai_translate: { label: 'Uebersetzen', icon: Languages, color: 'text-indigo-600' },
  add_tag: { label: 'Tag hinzufuegen', icon: Plus, color: 'text-green-600' },
  set_highlight: { label: 'Highlight setzen', icon: CheckCircle2, color: 'text-amber-500' },
}

const STATUS_LABELS: Record<string, string> = {
  draft: 'Entwurf',
  review: 'Review',
  published: 'Live',
  archived: 'Archiviert',
}

// ── Component ───────────────────────────────────────────────────────

export default function WorkflowManager() {
  const [rules, setRules] = useState<WorkflowRule[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showTemplates, setShowTemplates] = useState(false)
  const [executing, setExecuting] = useState<string | null>(null)

  useEffect(() => { loadRules() }, [])

  async function loadRules() {
    setLoading(true)

    const { data, error } = await supabase
      .from('fw_workflow_rules')
      .select('*')
      .order('created_at', { ascending: false })

    if (!error && data) {
      setRules(data as WorkflowRule[])
    } else {
      // Fallback: use templates as demo data if table doesn't exist yet
      setRules(WORKFLOW_TEMPLATES.map((t, i) => ({
        ...t,
        id: `template-${i}`,
        created_at: new Date().toISOString(),
        last_executed_at: null,
        execution_count: 0,
      })))
    }

    setLoading(false)
  }

  async function addFromTemplate(templateIndex: number) {
    const template = WORKFLOW_TEMPLATES[templateIndex]
    const newRule: WorkflowRule = {
      ...template,
      id: `rule-${Date.now()}`,
      created_at: new Date().toISOString(),
      last_executed_at: null,
      execution_count: 0,
    }

    // Try to persist
    const { error } = await supabase.from('fw_workflow_rules').insert({
      name: newRule.name,
      description: newRule.description,
      trigger: newRule.trigger,
      conditions: newRule.conditions,
      actions: newRule.actions,
      is_active: newRule.is_active,
    })

    if (!error) {
      loadRules()
    } else {
      // Local-only
      setRules(prev => [newRule, ...prev])
    }

    setShowTemplates(false)
  }

  async function toggleRule(ruleId: string) {
    const rule = rules.find(r => r.id === ruleId)
    if (!rule) return

    const newActive = !rule.is_active

    // Optimistic update
    setRules(prev => prev.map(r =>
      r.id === ruleId ? { ...r, is_active: newActive } : r
    ))

    await supabase
      .from('fw_workflow_rules')
      .update({ is_active: newActive })
      .eq('id', ruleId)
  }

  async function deleteRule(ruleId: string) {
    setRules(prev => prev.filter(r => r.id !== ruleId))
    await supabase.from('fw_workflow_rules').delete().eq('id', ruleId)
  }

  async function executeRule(rule: WorkflowRule) {
    setExecuting(rule.id)

    try {
      for (const action of rule.actions) {
        await executeAction(action, rule.conditions)
      }

      // Update execution count
      setRules(prev => prev.map(r =>
        r.id === rule.id
          ? { ...r, last_executed_at: new Date().toISOString(), execution_count: r.execution_count + 1 }
          : r
      ))

      await supabase
        .from('fw_workflow_rules')
        .update({
          last_executed_at: new Date().toISOString(),
          execution_count: rule.execution_count + 1,
        })
        .eq('id', rule.id)
    } catch {
      // Silent fail for now
    }

    setExecuting(null)
  }

  // ── Render ────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Zap className="h-6 w-6" />
            Workflow-Automatisierung
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Regeln fuer automatische Status-Wechsel, Benachrichtigungen und KI-Aktionen.
          </p>
        </div>
        <Button onClick={() => setShowTemplates(!showTemplates)}>
          <Plus className="h-4 w-4 mr-2" /> Regel hinzufuegen
        </Button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="p-3 text-center">
          <p className="text-2xl font-bold">{rules.length}</p>
          <p className="text-xs text-muted-foreground">Regeln gesamt</p>
        </Card>
        <Card className="p-3 text-center">
          <p className="text-2xl font-bold text-green-600">{rules.filter(r => r.is_active).length}</p>
          <p className="text-xs text-muted-foreground">Aktiv</p>
        </Card>
        <Card className="p-3 text-center">
          <p className="text-2xl font-bold">{rules.reduce((sum, r) => sum + r.execution_count, 0)}</p>
          <p className="text-xs text-muted-foreground">Ausfuehrungen</p>
        </Card>
      </div>

      {/* Template picker */}
      {showTemplates && (
        <Card className="p-4 border-primary">
          <h3 className="font-semibold mb-3">Vorlage auswaehlen</h3>
          <div className="grid gap-2 md:grid-cols-2">
            {WORKFLOW_TEMPLATES.map((tmpl, idx) => {
              const triggerInfo = TRIGGER_LABELS[tmpl.trigger.type]
              return (
                <Card
                  key={idx}
                  className="p-3 cursor-pointer hover:border-primary transition"
                  onClick={() => addFromTemplate(idx)}
                >
                  <div className="flex items-start gap-2">
                    <triggerInfo.icon className="h-4 w-4 mt-0.5 text-muted-foreground" />
                    <div>
                      <h4 className="text-sm font-medium">{tmpl.name}</h4>
                      <p className="text-xs text-muted-foreground mt-0.5">{tmpl.description}</p>
                      <div className="flex gap-1 mt-2">
                        <Badge variant="outline" className="text-[10px]">{triggerInfo.label}</Badge>
                        {tmpl.actions.map((a, i) => (
                          <Badge key={i} variant="secondary" className="text-[10px]">
                            {ACTION_LABELS[a.type]?.label || a.type}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
          <Button variant="outline" size="sm" className="mt-3" onClick={() => setShowTemplates(false)}>
            Abbrechen
          </Button>
        </Card>
      )}

      {/* Rules list */}
      <div className="space-y-3">
        {rules.map(rule => {
          const triggerInfo = TRIGGER_LABELS[rule.trigger.type] || TRIGGER_LABELS.content_created
          const TriggerIcon = triggerInfo.icon
          const isRunning = executing === rule.id

          return (
            <Card key={rule.id} className={`p-4 ${!rule.is_active ? 'opacity-60' : ''}`}>
              <div className="flex items-start gap-3">
                {/* Status indicator */}
                <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${rule.is_active ? 'bg-green-500' : 'bg-slate-300'}`} />

                <div className="flex-1 min-w-0">
                  {/* Name + description */}
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-sm">{rule.name}</h3>
                    <Badge variant={rule.is_active ? 'default' : 'secondary'} className="text-[10px]">
                      {rule.is_active ? 'Aktiv' : 'Inaktiv'}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">{rule.description}</p>

                  {/* Visual rule flow */}
                  <div className="flex items-center gap-2 flex-wrap text-xs">
                    {/* Trigger */}
                    <Badge variant="outline" className="text-[10px] gap-1">
                      <TriggerIcon className="h-3 w-3" />
                      {triggerInfo.label}
                      {rule.trigger.params.to && ` → ${STATUS_LABELS[rule.trigger.params.to] || rule.trigger.params.to}`}
                    </Badge>

                    {/* Conditions */}
                    {rule.conditions.length > 0 && (
                      <>
                        <ArrowRight className="h-3 w-3 text-muted-foreground" />
                        <Badge variant="outline" className="text-[10px] text-amber-600">
                          {rule.conditions.length} Bedingung{rule.conditions.length > 1 ? 'en' : ''}
                        </Badge>
                      </>
                    )}

                    {/* Actions */}
                    <ArrowRight className="h-3 w-3 text-muted-foreground" />
                    {rule.actions.map((action, i) => {
                      const actionInfo = ACTION_LABELS[action.type]
                      const ActionIcon = actionInfo?.icon || Zap
                      return (
                        <Badge key={i} variant="secondary" className={`text-[10px] gap-1 ${actionInfo?.color || ''}`}>
                          <ActionIcon className="h-3 w-3" />
                          {actionInfo?.label || action.type}
                          {action.params.to && `: ${STATUS_LABELS[action.params.to] || action.params.to}`}
                          {action.params.languages && `: ${action.params.languages}`}
                        </Badge>
                      )
                    })}
                  </div>

                  {/* Stats */}
                  {rule.execution_count > 0 && (
                    <p className="text-[10px] text-muted-foreground mt-2">
                      {rule.execution_count}x ausgefuehrt
                      {rule.last_executed_at && ` — zuletzt ${new Date(rule.last_executed_at).toLocaleDateString('de-AT')}`}
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 flex-shrink-0">
                  <Button
                    size="icon" variant="ghost" className="h-7 w-7"
                    onClick={() => executeRule(rule)}
                    disabled={isRunning}
                    title="Jetzt ausfuehren"
                  >
                    {isRunning ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Play className="h-3.5 w-3.5" />}
                  </Button>
                  <Button
                    size="icon" variant="ghost" className="h-7 w-7"
                    onClick={() => toggleRule(rule.id)}
                    title={rule.is_active ? 'Deaktivieren' : 'Aktivieren'}
                  >
                    {rule.is_active ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5 text-green-600" />}
                  </Button>
                  <Button
                    size="icon" variant="ghost" className="h-7 w-7 text-destructive"
                    onClick={() => deleteRule(rule.id)}
                    title="Loeschen"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      {rules.length === 0 && (
        <Card className="p-12 text-center">
          <Zap className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <h3 className="font-semibold mb-1">Keine Workflow-Regeln</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Erstelle Regeln um wiederkehrende Aufgaben zu automatisieren.
          </p>
          <Button onClick={() => setShowTemplates(true)}>
            <Plus className="h-4 w-4 mr-2" /> Erste Regel erstellen
          </Button>
        </Card>
      )}
    </div>
  )
}

// ── Action executor ─────────────────────────────────────────────────

async function executeAction(action: WorkflowAction, conditions: WorkflowCondition[]): Promise<void> {
  // Build a query for matching items based on conditions
  let query = supabase.from('fw_content_items').select('id, name, status, tags, is_highlight, rating_avg')

  for (const cond of conditions) {
    switch (cond.operator) {
      case 'equals':
        query = query.eq(cond.field, cond.value)
        break
      case 'not_equals':
        query = query.neq(cond.field, cond.value)
        break
      case 'greater_than':
        query = query.gt(cond.field, parseFloat(cond.value))
        break
      case 'less_than':
        query = query.lt(cond.field, parseFloat(cond.value))
        break
    }
  }

  const { data: items } = await query.limit(50)
  if (!items || items.length === 0) return

  for (const item of items) {
    switch (action.type) {
      case 'change_status': {
        const newStatus = action.params.to
        if (newStatus && item.status !== newStatus) {
          const updates: Record<string, unknown> = { status: newStatus }
          if (newStatus === 'published') updates.published_at = new Date().toISOString()
          await supabase.from('fw_content_items').update(updates).eq('id', item.id)
          await logTimelineEvent({
            content_id: item.id,
            event_type: 'status_change',
            from_value: item.status,
            to_value: newStatus,
            actor_type: 'system',
            actor_name: 'Workflow',
          })
        }
        break
      }

      case 'ai_enrich': {
        await supabase.functions.invoke('content-enrich', {
          body: { action: 'enrich_single', content_id: item.id },
        })
        break
      }

      case 'ai_translate': {
        const langs = (action.params.languages || 'en').split(',').map(l => l.trim())
        await supabase.functions.invoke('content-enrich', {
          body: { action: 'translate', content_id: item.id, target_languages: langs },
        })
        break
      }

      case 'add_tag': {
        const newTag = action.params.tag
        if (newTag) {
          const existingTags = (item.tags as string[]) || []
          if (!existingTags.includes(newTag)) {
            await supabase.from('fw_content_items')
              .update({ tags: [...existingTags, newTag] })
              .eq('id', item.id)
          }
        }
        break
      }

      case 'set_highlight': {
        const val = action.params.value === 'true'
        if (item.is_highlight !== val) {
          await supabase.from('fw_content_items').update({ is_highlight: val }).eq('id', item.id)
        }
        break
      }

      case 'send_notification': {
        // Log as timeline event for now
        await logTimelineEvent({
          content_id: item.id,
          event_type: 'note',
          details: action.params.message?.replace('{name}', (item.name as Record<string, string>)?.de || '') || 'Workflow-Benachrichtigung',
          actor_type: 'system',
          actor_name: 'Workflow',
        })
        break
      }
    }
  }
}
