import { useEffect, useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import { fetchLeads, bulkUpdateStage } from '@/lib/admin-api'
import { PIPELINE_STAGES, SEGMENT_TAG_PRESETS, type Lead, type PipelineStage } from '@/lib/admin-types'
import { SEGMENTS } from '@/lib/tiers'
import LeadForm from './LeadForm'
import BulkActions from './BulkActions'

export default function LeadList() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterSegment, setFilterSegment] = useState('__all__')
  const [filterStage, setFilterStage] = useState('__all__')
  const [showForm, setShowForm] = useState(false)
  const [selected, setSelected] = useState<Set<string>>(new Set())

  useEffect(() => {
    fetchLeads()
      .then(setLeads)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const filtered = useMemo(() => {
    return leads.filter(l => {
      if (filterSegment !== '__all__' && l.segment !== filterSegment) return false
      if (filterStage !== '__all__' && l.pipeline_stage !== filterStage) return false
      if (search) {
        const q = search.toLowerCase()
        if (!l.name.toLowerCase().includes(q) && !l.email.toLowerCase().includes(q) && !(l.company?.toLowerCase().includes(q))) return false
      }
      return true
    })
  }, [leads, search, filterSegment, filterStage])

  function toggleSelect(id: string) {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function toggleAll() {
    if (selected.size === filtered.length) {
      setSelected(new Set())
    } else {
      setSelected(new Set(filtered.map(l => l.id)))
    }
  }

  async function handleBulkStage(stage: PipelineStage) {
    const ids = Array.from(selected)
    await bulkUpdateStage(ids, stage)
    setLeads(prev => prev.map(l => ids.includes(l.id) ? { ...l, pipeline_stage: stage } : l))
    setSelected(new Set())
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h2 className="text-lg font-semibold">Kontakte</h2>
        <Button size="sm" onClick={() => setShowForm(true)} className="gap-1.5">
          <Plus className="h-4 w-4" /> Neuer Lead
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Suche nach Name, E-Mail, Firma..."
            className="pl-8"
          />
        </div>
        <Select value={filterSegment} onValueChange={setFilterSegment}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Segment" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">Alle Segmente</SelectItem>
            {SEGMENTS.map(s => <SelectItem key={s.id} value={s.id}>{s.label}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filterStage} onValueChange={setFilterStage}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Pipeline-Stufe" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">Alle Stufen</SelectItem>
            {PIPELINE_STAGES.map(s => <SelectItem key={s.id} value={s.id}>{s.label}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {selected.size > 0 && <BulkActions count={selected.size} onStageChange={handleBulkStage} />}

      {loading ? (
        <div className="text-sm text-muted-foreground py-8 text-center">Lade Kontakte...</div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-8">
                <input type="checkbox" checked={selected.size === filtered.length && filtered.length > 0} onChange={toggleAll} />
              </TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Firma</TableHead>
              <TableHead>Segment</TableHead>
              <TableHead>Pipeline</TableHead>
              <TableHead>Tags</TableHead>
              <TableHead>Quelle</TableHead>
              <TableHead className="text-right">Erstellt</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map(lead => {
              const stage = PIPELINE_STAGES.find(s => s.id === lead.pipeline_stage)
              return (
                <TableRow key={lead.id}>
                  <TableCell>
                    <input type="checkbox" checked={selected.has(lead.id)} onChange={() => toggleSelect(lead.id)} />
                  </TableCell>
                  <TableCell>
                    <Link to={`/admin/leads/${lead.id}`} className="font-medium hover:underline">
                      {lead.name}
                    </Link>
                    <div className="text-xs text-muted-foreground">{lead.email}</div>
                  </TableCell>
                  <TableCell className="text-sm">{lead.company ?? '-'}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="text-xs">{lead.segment}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      <div className={cn('w-2 h-2 rounded-full', stage?.color ?? 'bg-gray-400')} />
                      <span className="text-sm">{stage?.label ?? lead.pipeline_stage}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1 flex-wrap">
                      {lead.tags.slice(0, 3).map(t => (
                        <Badge key={t} variant="outline" className="text-[10px] px-1.5 py-0">{t}</Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    {lead.source && (
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0">{lead.source}</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right text-xs text-muted-foreground">
                    {new Date(lead.created_at).toLocaleDateString('de-DE')}
                  </TableCell>
                </TableRow>
              )
            })}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                  Keine Leads gefunden
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      )}

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Neuen Lead erstellen</DialogTitle>
          </DialogHeader>
          <LeadForm
            onSaved={lead => {
              setLeads(prev => [lead, ...prev])
              setShowForm(false)
            }}
            onCancel={() => setShowForm(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
