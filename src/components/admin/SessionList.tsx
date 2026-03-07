import { useEffect, useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Search, Calendar, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import { fetchEventSessions } from '@/lib/session-management-api'
import {
  EVENT_SESSION_TYPES,
  EVENT_SESSION_STATUSES,
  type EventSession,
} from '@/lib/admin-types'
import SessionForm from './SessionForm'

export default function SessionList() {
  const [sessions, setSessions] = useState<EventSession[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState('__all__')
  const [filterStatus, setFilterStatus] = useState('__all__')
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    fetchEventSessions()
      .then(setSessions)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const filtered = useMemo(() => {
    return sessions.filter(s => {
      if (filterType !== '__all__' && s.type !== filterType) return false
      if (filterStatus !== '__all__' && s.status !== filterStatus) return false
      if (search) {
        const q = search.toLowerCase()
        if (
          !s.title.toLowerCase().includes(q) &&
          !(s.description?.toLowerCase().includes(q)) &&
          !(s.venue?.toLowerCase().includes(q))
        ) return false
      }
      return true
    })
  }, [sessions, search, filterType, filterStatus])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h2 className="text-lg font-semibold">Event-Sessions</h2>
        <Button size="sm" onClick={() => setShowForm(true)} className="gap-1.5">
          <Plus className="h-4 w-4" /> Neue Session
        </Button>
      </div>

      <div className="flex gap-2 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Suche nach Titel, Beschreibung, Ort..."
            className="pl-8"
          />
        </div>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Typ" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">Alle Typen</SelectItem>
            {EVENT_SESSION_TYPES.map(t => (
              <SelectItem key={t.id} value={t.id}>{t.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">Alle Status</SelectItem>
            {EVENT_SESSION_STATUSES.map(s => (
              <SelectItem key={s.id} value={s.id}>{s.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="text-sm text-muted-foreground py-8 text-center">Lade Sessions...</div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Titel</TableHead>
              <TableHead>Typ</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Datum</TableHead>
              <TableHead>Ort</TableHead>
              <TableHead>Sprachen</TableHead>
              <TableHead>Code</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map(session => {
              const status = EVENT_SESSION_STATUSES.find(s => s.id === session.status)
              const type = EVENT_SESSION_TYPES.find(t => t.id === session.type)
              return (
                <TableRow key={session.id}>
                  <TableCell>
                    <Link to={`/admin/sessions/${session.id}`} className="font-medium hover:underline">
                      {session.title}
                    </Link>
                    {session.description && (
                      <div className="text-xs text-muted-foreground truncate max-w-[250px]">
                        {session.description}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="text-xs">{type?.label ?? session.type}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      <div className={cn('w-2 h-2 rounded-full', status?.color ?? 'bg-gray-400')} />
                      <span className="text-sm">{status?.label ?? session.status}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {session.scheduled_start ? (
                      <div className="flex items-center gap-1 text-sm">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        {new Date(session.scheduled_start).toLocaleDateString('de-DE', {
                          day: '2-digit', month: '2-digit', year: 'numeric'
                        })}
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {session.venue ? (
                      <div className="flex items-center gap-1 text-sm">
                        <MapPin className="h-3 w-3 text-muted-foreground" />
                        <span className="truncate max-w-[120px]">{session.venue}</span>
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1 flex-wrap">
                      {session.target_languages.slice(0, 3).map(lang => (
                        <Badge key={lang} variant="outline" className="text-[10px] px-1.5 py-0">
                          {lang.toUpperCase()}
                        </Badge>
                      ))}
                      {session.target_languages.length > 3 && (
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                          +{session.target_languages.length - 3}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {session.session_code && (
                      <code className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded">
                        {session.session_code}
                      </code>
                    )}
                  </TableCell>
                </TableRow>
              )
            })}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                  Keine Sessions gefunden
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      )}

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Neue Session erstellen</DialogTitle>
          </DialogHeader>
          <SessionForm
            onSaved={session => {
              setSessions(prev => [session, ...prev])
              setShowForm(false)
            }}
            onCancel={() => setShowForm(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
