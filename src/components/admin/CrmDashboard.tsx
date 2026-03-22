// CRM Sales Dashboard — Lead Management, Pipeline, Campaigns
// Admin page for fw_crm_leads, fw_crm_activities, fw_crm_campaigns

import { useState, useEffect } from 'react'
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
  Users, Plus, Search, Loader2, Trash2, Edit3, Save, Filter,
  Phone, Mail, Globe, DollarSign, Calendar, TrendingUp, Target,
  ChevronDown, ChevronUp, Building2, ArrowRight, CheckCircle2,
  XCircle, Clock, Star, BarChart3, Send, Eye, RefreshCw,
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { CRM_SEGMENTS, scoreLeadPriority } from '@/lib/fintutto-world/crm-segments'
import type { CrmSegmentId, LeadStatus, LeadSource, LeadPriority } from '@/lib/fintutto-world/crm-segments'

const STATUS_PIPELINE: { id: LeadStatus; label: string; color: string }[] = [
  { id: 'new', label: 'Neu', color: 'bg-blue-500' },
  { id: 'contacted', label: 'Kontaktiert', color: 'bg-cyan-500' },
  { id: 'qualified', label: 'Qualifiziert', color: 'bg-teal-500' },
  { id: 'demo_scheduled', label: 'Demo geplant', color: 'bg-indigo-500' },
  { id: 'demo_done', label: 'Demo gehalten', color: 'bg-violet-500' },
  { id: 'proposal_sent', label: 'Angebot', color: 'bg-purple-500' },
  { id: 'negotiation', label: 'Verhandlung', color: 'bg-amber-500' },
  { id: 'closed_won', label: 'Gewonnen', color: 'bg-emerald-500' },
  { id: 'closed_lost', label: 'Verloren', color: 'bg-red-500' },
]

const SOURCES: { id: LeadSource; label: string }[] = [
  { id: 'website', label: 'Website' },
  { id: 'referral', label: 'Empfehlung' },
  { id: 'event', label: 'Event' },
  { id: 'cold_outreach', label: 'Kaltakquise' },
  { id: 'partner', label: 'Partner' },
  { id: 'inbound', label: 'Inbound' },
  { id: 'linkedin', label: 'LinkedIn' },
  { id: 'import', label: 'Import' },
]

interface Lead {
  id: string
  segment_id: CrmSegmentId
  status: LeadStatus
  source: LeadSource | null
  priority: LeadPriority
  score: number
  company_name: string | null
  company_website: string | null
  contact_first_name: string | null
  contact_last_name: string | null
  contact_email: string | null
  contact_phone: string | null
  contact_title: string | null
  city: string | null
  country: string
  estimated_poi_count: number | null
  estimated_languages: number
  estimated_monthly_visitors: number | null
  budget_confirmed: boolean
  decision_timeline: string | null
  target_tier_id: string | null
  proposed_monthly_eur: number | null
  invite_code: string | null
  tags: string[]
  internal_notes: string | null
  last_contacted_at: string | null
  next_followup_at: string | null
  lost_reason: string | null
  created_at: string
  updated_at: string
}

export default function CrmDashboard() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [segmentFilter, setSegmentFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  // Pipeline stats
  const [pipelineStats, setPipelineStats] = useState<Record<string, number>>({})
  const [totalValue, setTotalValue] = useState(0)

  // Create lead form
  const [showCreate, setShowCreate] = useState(false)
  const [saving, setSaving] = useState(false)
  const [formCompany, setFormCompany] = useState('')
  const [formFirstName, setFormFirstName] = useState('')
  const [formLastName, setFormLastName] = useState('')
  const [formEmail, setFormEmail] = useState('')
  const [formPhone, setFormPhone] = useState('')
  const [formSegment, setFormSegment] = useState<CrmSegmentId>('museum_small')
  const [formSource, setFormSource] = useState<LeadSource>('website')
  const [formCity, setFormCity] = useState('')
  const [formCountry, setFormCountry] = useState('DE')
  const [formNotes, setFormNotes] = useState('')

  useEffect(() => { loadLeads(); loadPipelineStats() }, [segmentFilter, statusFilter])

  async function loadLeads() {
    setLoading(true)
    let query = supabase
      .from('fw_crm_leads')
      .select('*', { count: 'exact' })
      .order('score', { ascending: false })
      .order('updated_at', { ascending: false })
      .limit(100)

    if (segmentFilter !== 'all') query = query.eq('segment_id', segmentFilter)
    if (statusFilter !== 'all') query = query.eq('status', statusFilter)
    if (search) {
      query = query.or(`company_name.ilike.%${search}%,contact_email.ilike.%${search}%,contact_last_name.ilike.%${search}%`)
    }

    const { data, count } = await query
    setLeads((data || []) as Lead[])
    setTotal(count || 0)
    setLoading(false)
  }

  async function loadPipelineStats() {
    const stats: Record<string, number> = {}
    let value = 0

    for (const stage of STATUS_PIPELINE) {
      const { count } = await supabase
        .from('fw_crm_leads')
        .select('id', { count: 'exact', head: true })
        .eq('status', stage.id)

      stats[stage.id] = count || 0
    }

    const { data: valueData } = await supabase
      .from('fw_crm_leads')
      .select('proposed_monthly_eur')
      .not('status', 'in', '(closed_lost,churned)')
      .not('proposed_monthly_eur', 'is', null)

    if (valueData) {
      value = valueData.reduce((s, r) => s + (r.proposed_monthly_eur || 0), 0)
    }

    setPipelineStats(stats)
    setTotalValue(value)
  }

  async function handleCreate() {
    if (!formCompany && !formLastName) return
    setSaving(true)

    const score = scoreLeadPriority({
      segmentId: formSegment,
      estimatedMonthlyVisitors: null,
      budgetConfirmed: false,
      decisionTimeline: null,
      source: formSource,
    })

    await supabase.from('fw_crm_leads').insert({
      segment_id: formSegment,
      status: 'new',
      source: formSource,
      priority: score >= 50 ? 'high' : score >= 30 ? 'normal' : 'low',
      score,
      company_name: formCompany || null,
      contact_first_name: formFirstName || null,
      contact_last_name: formLastName || null,
      contact_email: formEmail || null,
      contact_phone: formPhone || null,
      city: formCity || null,
      country: formCountry,
      internal_notes: formNotes || null,
      tags: [],
    })

    setShowCreate(false)
    resetForm()
    loadLeads()
    loadPipelineStats()
    setSaving(false)
  }

  function resetForm() {
    setFormCompany('')
    setFormFirstName('')
    setFormLastName('')
    setFormEmail('')
    setFormPhone('')
    setFormSegment('museum_small')
    setFormSource('website')
    setFormCity('')
    setFormCountry('DE')
    setFormNotes('')
  }

  async function updateStatus(id: string, newStatus: LeadStatus) {
    const updates: Record<string, unknown> = { status: newStatus }
    if (newStatus === 'contacted') updates.last_contacted_at = new Date().toISOString()
    if (newStatus === 'closed_won') updates.converted_at = new Date().toISOString()

    await supabase.from('fw_crm_leads').update(updates).eq('id', id)

    // Log activity
    await supabase.from('fw_crm_activities').insert({
      lead_id: id,
      activity_type: 'status_changed',
      title: `Status geaendert: ${newStatus}`,
      metadata: { new_status: newStatus },
    })

    loadLeads()
    loadPipelineStats()
  }

  async function deleteLead(id: string) {
    if (!confirm('Lead wirklich loeschen?')) return
    await supabase.from('fw_crm_leads').delete().eq('id', id)
    loadLeads()
    loadPipelineStats()
  }

  const activeLeads = Object.entries(pipelineStats)
    .filter(([k]) => !['closed_won', 'closed_lost'].includes(k))
    .reduce((s, [, v]) => s + v, 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Target className="h-6 w-6" />
            CRM & Sales
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {total} Leads — {activeLeads} aktiv — Pipeline-Wert: {totalValue.toLocaleString('de-DE')}€/Monat
          </p>
        </div>
        <Button onClick={() => { setShowCreate(true); resetForm() }}>
          <Plus className="h-4 w-4 mr-2" /> Neuer Lead
        </Button>
      </div>

      {/* Pipeline visualization */}
      <div className="flex gap-1 overflow-x-auto pb-2">
        {STATUS_PIPELINE.map(stage => {
          const count = pipelineStats[stage.id] || 0
          return (
            <Card
              key={stage.id}
              className={`flex-1 min-w-[90px] p-2 text-center cursor-pointer transition-shadow hover:shadow-sm ${statusFilter === stage.id ? 'ring-2 ring-primary' : ''}`}
              onClick={() => setStatusFilter(statusFilter === stage.id ? 'all' : stage.id)}
            >
              <div className={`h-1.5 rounded-full mb-2 ${stage.color}`} />
              <div className="text-lg font-bold">{count}</div>
              <div className="text-[10px] text-muted-foreground truncate">{stage.label}</div>
            </Card>
          )
        })}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-end">
        <div className="space-y-1.5">
          <Label className="text-xs">Segment</Label>
          <Select value={segmentFilter} onValueChange={setSegmentFilter}>
            <SelectTrigger className="w-44 h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle Segmente</SelectItem>
              {Object.values(CRM_SEGMENTS).map(s => (
                <SelectItem key={s.id} value={s.id}>{s.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Status</Label>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-36 h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle</SelectItem>
              {STATUS_PIPELINE.map(s => (
                <SelectItem key={s.id} value={s.id}>{s.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex-1 space-y-1.5">
          <Label className="text-xs">Suche</Label>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              value={search}
              onChange={e => setSearch(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && loadLeads()}
              placeholder="Firma, E-Mail, Name..."
              className="pl-8 h-8 text-xs"
            />
          </div>
        </div>
      </div>

      {/* Create form */}
      {showCreate && (
        <Card className="p-5 space-y-4 border-primary">
          <h3 className="font-semibold">Neuer Lead</h3>
          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
            <div className="space-y-1.5">
              <Label>Firma</Label>
              <Input value={formCompany} onChange={e => setFormCompany(e.target.value)} placeholder="Firmenname" />
            </div>
            <div className="space-y-1.5">
              <Label>Vorname</Label>
              <Input value={formFirstName} onChange={e => setFormFirstName(e.target.value)} placeholder="Vorname" />
            </div>
            <div className="space-y-1.5">
              <Label>Nachname</Label>
              <Input value={formLastName} onChange={e => setFormLastName(e.target.value)} placeholder="Nachname" />
            </div>
            <div className="space-y-1.5">
              <Label>E-Mail</Label>
              <Input value={formEmail} onChange={e => setFormEmail(e.target.value)} placeholder="email@firma.de" type="email" />
            </div>
            <div className="space-y-1.5">
              <Label>Telefon</Label>
              <Input value={formPhone} onChange={e => setFormPhone(e.target.value)} placeholder="+49..." />
            </div>
            <div className="space-y-1.5">
              <Label>Segment</Label>
              <Select value={formSegment} onValueChange={v => setFormSegment(v as CrmSegmentId)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.values(CRM_SEGMENTS).map(s => (
                    <SelectItem key={s.id} value={s.id}>{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Quelle</Label>
              <Select value={formSource} onValueChange={v => setFormSource(v as LeadSource)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {SOURCES.map(s => (
                    <SelectItem key={s.id} value={s.id}>{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Stadt</Label>
              <Input value={formCity} onChange={e => setFormCity(e.target.value)} placeholder="Stadt" />
            </div>
            <div className="space-y-1.5">
              <Label>Land</Label>
              <Input value={formCountry} onChange={e => setFormCountry(e.target.value)} placeholder="DE" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Interne Notizen</Label>
            <textarea
              className="w-full min-h-[60px] px-3 py-2 border rounded-lg text-sm bg-background resize-y"
              value={formNotes}
              onChange={e => setFormNotes(e.target.value)}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowCreate(false)}>Abbrechen</Button>
            <Button onClick={handleCreate} disabled={saving || (!formCompany && !formLastName)}>
              {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
              Anlegen
            </Button>
          </div>
        </Card>
      )}

      {/* Lead list */}
      {loading ? (
        <div className="text-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mx-auto" />
        </div>
      ) : leads.length === 0 ? (
        <Card className="p-12 text-center">
          <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-semibold text-lg mb-2">Keine Leads</h3>
          <p className="text-sm text-muted-foreground">Erstelle den ersten Lead oder importiere ueber die CRM API.</p>
        </Card>
      ) : (
        <div className="space-y-2">
          {leads.map(lead => {
            const segConfig = CRM_SEGMENTS[lead.segment_id]
            const statusConfig = STATUS_PIPELINE.find(s => s.id === lead.status)
            const isExpanded = expandedId === lead.id
            const contactName = [lead.contact_first_name, lead.contact_last_name].filter(Boolean).join(' ')

            return (
              <Card key={lead.id} className="overflow-hidden">
                <div className="p-3 flex items-start gap-3">
                  {/* Score badge */}
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-white text-xs font-bold ${
                    lead.score >= 60 ? 'bg-emerald-500' : lead.score >= 35 ? 'bg-amber-500' : 'bg-gray-400'
                  }`}>
                    {lead.score}
                  </div>

                  <div className="flex-1 min-w-0 cursor-pointer" onClick={() => setExpandedId(isExpanded ? null : lead.id)}>
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <h3 className="font-semibold text-sm truncate">
                        {lead.company_name || contactName || 'Unbenannt'}
                      </h3>
                      <Badge
                        variant="outline"
                        className="text-[10px]"
                        style={{ borderColor: statusConfig?.color.replace('bg-', '') }}
                      >
                        {statusConfig?.label}
                      </Badge>
                      {lead.budget_confirmed && <Badge variant="default" className="text-[10px] bg-emerald-600">Budget</Badge>}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{segConfig?.label || lead.segment_id}</span>
                      {lead.city && <><span className="opacity-50">|</span><span>{lead.city}, {lead.country}</span></>}
                      {contactName && lead.company_name && <><span className="opacity-50">|</span><span>{contactName}</span></>}
                      {lead.proposed_monthly_eur && (
                        <><span className="opacity-50">|</span><span className="font-medium text-emerald-600">{lead.proposed_monthly_eur}€/M</span></>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 flex-shrink-0">
                    {/* Quick status advance */}
                    {lead.status !== 'closed_won' && lead.status !== 'closed_lost' && (
                      <Button size="icon" variant="ghost" className="h-7 w-7" title="Naechster Schritt"
                        onClick={() => {
                          const idx = STATUS_PIPELINE.findIndex(s => s.id === lead.status)
                          if (idx >= 0 && idx < STATUS_PIPELINE.length - 2) {
                            updateStatus(lead.id, STATUS_PIPELINE[idx + 1].id)
                          }
                        }}
                      >
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Button>
                    )}
                    <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => deleteLead(lead.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setExpandedId(isExpanded ? null : lead.id)}>
                      {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                    </Button>
                  </div>
                </div>

                {isExpanded && (
                  <div className="border-t px-4 py-3 bg-muted/30 space-y-3">
                    {/* Contact info */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                      {lead.contact_email && (
                        <div className="flex items-center gap-1.5">
                          <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                          <a href={`mailto:${lead.contact_email}`} className="text-primary hover:underline truncate">{lead.contact_email}</a>
                        </div>
                      )}
                      {lead.contact_phone && (
                        <div className="flex items-center gap-1.5">
                          <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                          <a href={`tel:${lead.contact_phone}`} className="hover:underline">{lead.contact_phone}</a>
                        </div>
                      )}
                      {lead.company_website && (
                        <div className="flex items-center gap-1.5">
                          <Globe className="h-3.5 w-3.5 text-muted-foreground" />
                          <a href={lead.company_website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline truncate">{lead.company_website}</a>
                        </div>
                      )}
                      {lead.contact_title && (
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <Building2 className="h-3.5 w-3.5" /> {lead.contact_title}
                        </div>
                      )}
                    </div>

                    {/* Qualification */}
                    <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                      {lead.estimated_poi_count && <span>~{lead.estimated_poi_count} POIs</span>}
                      <span>{lead.estimated_languages} Sprachen</span>
                      {lead.estimated_monthly_visitors && <span>~{lead.estimated_monthly_visitors.toLocaleString()} Besucher/M</span>}
                      {lead.decision_timeline && <span>Timeline: {lead.decision_timeline}</span>}
                      {lead.source && <span>Quelle: {SOURCES.find(s => s.id === lead.source)?.label}</span>}
                    </div>

                    {/* Segment info */}
                    {segConfig && (
                      <div className="bg-muted p-2 rounded text-xs">
                        <p className="font-medium mb-1">{segConfig.label}: {segConfig.description}</p>
                        <div className="flex flex-wrap gap-1">
                          {segConfig.keyFeatures.map(f => (
                            <Badge key={f} variant="outline" className="text-[10px]">{f}</Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Notes */}
                    {lead.internal_notes && (
                      <div className="text-sm text-muted-foreground bg-muted p-2 rounded italic">
                        {lead.internal_notes}
                      </div>
                    )}

                    {/* Invite code */}
                    {lead.invite_code && (
                      <div className="text-xs">
                        <span className="text-muted-foreground">Invite-Code:</span>{' '}
                        <code className="bg-muted px-1.5 py-0.5 rounded">{lead.invite_code}</code>
                      </div>
                    )}

                    {/* Status buttons */}
                    <div className="flex flex-wrap gap-1.5">
                      {STATUS_PIPELINE.map(stage => (
                        <Button
                          key={stage.id}
                          size="sm"
                          variant={lead.status === stage.id ? 'default' : 'outline'}
                          className="text-[11px] h-7"
                          onClick={() => updateStatus(lead.id, stage.id)}
                          disabled={lead.status === stage.id}
                        >
                          {stage.label}
                        </Button>
                      ))}
                    </div>

                    <div className="flex items-center gap-3 text-xs text-muted-foreground pt-1 border-t">
                      <span>Erstellt: {new Date(lead.created_at).toLocaleDateString('de-DE')}</span>
                      {lead.last_contacted_at && <span>Letzter Kontakt: {new Date(lead.last_contacted_at).toLocaleDateString('de-DE')}</span>}
                      {lead.next_followup_at && <span className="font-medium text-amber-600">Follow-up: {new Date(lead.next_followup_at).toLocaleDateString('de-DE')}</span>}
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
