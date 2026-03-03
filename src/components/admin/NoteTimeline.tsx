import { Badge } from '@/components/ui/badge'
import { NOTE_TYPES, type LeadNote } from '@/lib/admin-types'
import { MessageSquare, Phone, Mail, Calendar } from 'lucide-react'

const TYPE_ICONS: Record<string, typeof MessageSquare> = {
  note: MessageSquare,
  call: Phone,
  email: Mail,
  meeting: Calendar,
}

interface NoteTimelineProps {
  notes: LeadNote[]
}

export default function NoteTimeline({ notes }: NoteTimelineProps) {
  if (notes.length === 0) {
    return <div className="text-sm text-muted-foreground text-center py-4">Keine Notizen vorhanden</div>
  }

  return (
    <div className="space-y-3">
      {notes.map(note => {
        const Icon = TYPE_ICONS[note.type] ?? MessageSquare
        const typeLabel = NOTE_TYPES.find(t => t.id === note.type)?.label ?? note.type
        return (
          <div key={note.id} className="flex gap-3 text-sm">
            <div className="flex-shrink-0 mt-0.5">
              <Icon className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0">{typeLabel}</Badge>
                <span className="text-xs text-muted-foreground">
                  {new Date(note.created_at).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <p className="text-foreground whitespace-pre-wrap">{note.content}</p>
              {note.follow_up_at && (
                <div className="text-xs text-amber-600 dark:text-amber-400">
                  Follow-up: {new Date(note.follow_up_at).toLocaleDateString('de-DE')}
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
