import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { fetchLeads, updateLead } from '@/lib/admin-api'
import { PIPELINE_STAGES, type Lead, type PipelineStage } from '@/lib/admin-types'

export default function PipelineBoard() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [draggedLeadId, setDraggedLeadId] = useState<string | null>(null)
  const [dropTargetStage, setDropTargetStage] = useState<string | null>(null)

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

  function onDragStart(e: React.DragEvent, leadId: string) {
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', leadId)
    setDraggedLeadId(leadId)
  }

  function onDragEnd() {
    setDraggedLeadId(null)
    setDropTargetStage(null)
  }

  function onDragOver(e: React.DragEvent, stageId: string) {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDropTargetStage(stageId)
  }

  function onDragLeave(e: React.DragEvent, stageId: string) {
    // Only clear if leaving the column itself, not a child
    const related = e.relatedTarget as HTMLElement | null
    const currentTarget = e.currentTarget as HTMLElement
    if (!related || !currentTarget.contains(related)) {
      if (dropTargetStage === stageId) setDropTargetStage(null)
    }
  }

  function onDrop(e: React.DragEvent, stageId: string) {
    e.preventDefault()
    const leadId = e.dataTransfer.getData('text/plain')
    setDropTargetStage(null)
    setDraggedLeadId(null)
    if (leadId) {
      const lead = leads.find(l => l.id === leadId)
      if (lead && lead.pipeline_stage !== stageId) {
        handleStageChange(leadId, stageId as PipelineStage)
      }
    }
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
          const isDropTarget = dropTargetStage === stage.id
          return (
            <div
              key={stage.id}
              className={cn(
                'min-w-[220px] flex-shrink-0 rounded-lg p-2 transition-colors',
                isDropTarget && 'bg-accent/40 ring-2 ring-primary/30',
              )}
              onDragOver={e => onDragOver(e, stage.id)}
              onDragLeave={e => onDragLeave(e, stage.id)}
              onDrop={e => onDrop(e, stage.id)}
            >
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
                    draggable="true"
                    onDragStart={e => onDragStart(e, lead.id)}
                    onDragEnd={onDragEnd}
                    className={cn(
                      'block rounded-lg border border-border p-3 bg-card hover:bg-accent/50 transition-colors cursor-grab active:cursor-grabbing',
                      draggedLeadId === lead.id && 'opacity-40',
                    )}
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
                  </Link>
                ))}
                {stageLeads.length === 0 && (
                  <div className={cn(
                    'text-xs text-muted-foreground text-center py-4 rounded-lg border border-dashed border-border',
                    isDropTarget && 'border-primary/50 bg-primary/5',
                  )}>
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
