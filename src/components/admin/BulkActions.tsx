import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { PIPELINE_STAGES, type PipelineStage } from '@/lib/admin-types'
import { useState } from 'react'

interface BulkActionsProps {
  count: number
  onStageChange: (stage: PipelineStage) => void
}

export default function BulkActions({ count, onStageChange }: BulkActionsProps) {
  const [stage, setStage] = useState('')

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border border-border">
      <span className="text-sm font-medium">{count} ausgewaehlt</span>
      <Select value={stage} onValueChange={setStage}>
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder="Pipeline-Stufe" />
        </SelectTrigger>
        <SelectContent>
          {PIPELINE_STAGES.map(s => (
            <SelectItem key={s.id} value={s.id}>{s.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button
        size="sm"
        disabled={!stage}
        onClick={() => {
          if (stage) onStageChange(stage as PipelineStage)
        }}
      >
        Anwenden
      </Button>
    </div>
  )
}
