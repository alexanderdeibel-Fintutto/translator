import { useEffect, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { fetchContactRequests, updateContactRequestStatus } from '@/lib/admin-api'
import type { ContactRequest } from '@/lib/admin-types'

const STATUS_COLORS: Record<string, string> = {
  new: 'bg-blue-500',
  responded: 'bg-amber-500',
  closed: 'bg-slate-500',
}

export default function ContactRequestList() {
  const [requests, setRequests] = useState<ContactRequest[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchContactRequests()
      .then(setRequests)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  async function handleStatusChange(id: string, status: string) {
    await updateContactRequestStatus(id, status)
    setRequests(prev => prev.map(r => r.id === id ? { ...r, status: status as ContactRequest['status'] } : r))
  }

  if (loading) {
    return <div className="text-sm text-muted-foreground py-8 text-center">Lade Anfragen...</div>
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Kontaktanfragen</h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>E-Mail</TableHead>
            <TableHead>Firma</TableHead>
            <TableHead>Typ</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Datum</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {requests.map(req => (
            <TableRow key={req.id}>
              <TableCell className="font-medium">{req.name}</TableCell>
              <TableCell className="text-sm">{req.email}</TableCell>
              <TableCell className="text-sm">{req.company ?? '-'}</TableCell>
              <TableCell>
                <Badge variant="secondary" className="text-xs">{req.type}</Badge>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1.5">
                  <div className={`w-2 h-2 rounded-full ${STATUS_COLORS[req.status] ?? 'bg-gray-400'}`} />
                  <span className="text-sm">{req.status}</span>
                </div>
              </TableCell>
              <TableCell className="text-xs text-muted-foreground">
                {new Date(req.created_at).toLocaleDateString('de-DE')}
              </TableCell>
              <TableCell>
                <div className="flex gap-1">
                  {req.status === 'new' && (
                    <Button size="sm" variant="outline" onClick={() => handleStatusChange(req.id, 'responded')}>
                      Beantwortet
                    </Button>
                  )}
                  {req.status !== 'closed' && (
                    <Button size="sm" variant="ghost" onClick={() => handleStatusChange(req.id, 'closed')}>
                      Schliessen
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
          {requests.length === 0 && (
            <TableRow>
              <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                Keine Anfragen vorhanden
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
