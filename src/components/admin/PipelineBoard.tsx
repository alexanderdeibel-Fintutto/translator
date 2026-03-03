import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { fetchLeads, updateLead } from '@/lib/admin-api'
import { PIPELINE_STAGES, type Lead, type PipelineStage } from '@/lib/admin-types'

export default function PipelineBoard() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchLeads()
      .then(setLeads)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  async function handleStageChange(leadId: string, newStage: PipelineStage) {
    await updateLead(leadId, { pipeline_stage: newStage })
    setLeads(prev =>
      prev.map(l => (l.id === leadId ? { ...l, pipeline_stage: newStage } : l)),
    )
  }

  if (loading) {
    return <div className="text-sm text-muted-foreground py-8 text-center">Lade Pipeline...</div>
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Pipeline</h2>
      <div className="flex gap-3 overflow-x-auto pb-4">
        {PIPELINE_STAGES.map(stage => {
          const stageLeads = leads.filter(l => l.pipeline_stage === stage.id)
          return (
            <div key={stage.id} className="min-w-[220px] flex-shrink-0">
              <div className="flex items-center gap-2 mb-2">
                <div className={cn('w-2.5 h-2.5 rounded-full', stage.color)} />
                <span className="text-sm font-medium">{stage.label}</span>
                <span className="text-xs text-muted-foreground">({stageLeads.length})</span>
              </div>
              <div className="space-y-2">
                {stageLeads.map(lead => (
                  <Link
                    key={lead.id}
                    to={`/admin/leads/${lead.id}`}
                    className="block rounded-lg border border-border p-3 bg-card hover:bg-accent/50 transition-colors"
                  >
                    <div className="text-sm font-medium truncate">{lead.name}</div>
                    {lead.company && (
                      <div className="text-xs text-muted-foreground truncate">{lead.company}</div>
                    )}
                    <div className="flex items-center gap-1 mt-1.5 flex-wrap">
                      <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                        {lead.segment}
                      </Badge>
                      {lead.tags.slice(0, 2).map(tag => (
                        <Badge key={tag} variant="outline" className="text-[10px] px-1.5 py-0">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    {/* Stage move dropdown */}
                    <select
                      className="mt-2 w-full text-xs rounded border border-input bg-transparent px-1 py-0.5"
                      value={lead.pipeline_stage}
                      onClick={e => e.preventDefault()}
                      onChange={e => {
                        e.preventDefault()
                        handleStageChange(lead.id, e.target.value as PipelineStage)
                      }}
                    >
                      {PIPELINE_STAGES.map(s => (
                        <option key={s.id} value={s.id}>
                          {s.label}
                        </option>
                      ))}
                    </select>
                  </Link>
                ))}
                {stageLeads.length === 0 && (
                  <div className="text-xs text-muted-foreground text-center py-4 rounded-lg border border-dashed border-border">
                    Keine Leads
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
