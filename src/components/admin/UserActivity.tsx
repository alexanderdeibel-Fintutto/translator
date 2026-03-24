import { useEffect, useState } from 'react'
import { Activity, Clock, Languages, Users, TrendingUp } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { fetchUserActivity } from '@/lib/admin-api'
import type { UserActivity as UserActivityData } from '@/lib/admin-types'

const ROLE_LABELS: Record<string, string> = {
  admin: 'Admin',
  sales_agent: 'Vertrieb',
  session_manager: 'Session Mgr',
  tester: 'Tester',
  user: 'Benutzer',
}

const ROLE_COLORS: Record<string, string> = {
  admin: 'bg-red-500',
  sales_agent: 'bg-amber-500',
  session_manager: 'bg-blue-500',
  tester: 'bg-violet-500',
  user: 'bg-slate-400',
}

function formatMinutes(minutes: number): string {
  if (minutes < 1) return '< 1 Min'
  if (minutes < 60) return `${Math.round(minutes)} Min`
  const hours = Math.floor(minutes / 60)
  const rest = Math.round(minutes % 60)
  return rest > 0 ? `${hours}h ${rest}m` : `${hours}h`
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function UserActivityView() {
  const [data, setData] = useState<UserActivityData[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('__all__')

  useEffect(() => {
    fetchUserActivity()
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const filtered = data.filter(u => {
    if (roleFilter !== '__all__' && u.role !== roleFilter) return false
    if (search) {
      const q = search.toLowerCase()
      if (
        !(u.email ?? '').toLowerCase().includes(q) &&
        !(u.display_name ?? '').toLowerCase().includes(q)
      ) return false
    }
    return true
  })

  // Summary stats
  const totalUsers = data.length
  const activeUsers = data.filter(u => u.total_sessions > 0).length
  const totalMinutes = data.reduce((sum, u) => sum + u.total_duration_minutes, 0)
  const totalTranslations = data.reduce((sum, u) => sum + u.total_translations, 0)

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Benutzer-Aktivitaet</h2>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="p-3 space-y-1">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Users className="h-3.5 w-3.5" /> Benutzer gesamt
          </div>
          <div className="text-2xl font-bold">{totalUsers}</div>
        </Card>
        <Card className="p-3 space-y-1">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Activity className="h-3.5 w-3.5" /> Aktive Benutzer
          </div>
          <div className="text-2xl font-bold">{activeUsers}</div>
        </Card>
        <Card className="p-3 space-y-1">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="h-3.5 w-3.5" /> Gesamtzeit
          </div>
          <div className="text-2xl font-bold">{formatMinutes(totalMinutes)}</div>
        </Card>
        <Card className="p-3 space-y-1">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Languages className="h-3.5 w-3.5" /> Uebersetzungen
          </div>
          <div className="text-2xl font-bold">{totalTranslations.toLocaleString('de-DE')}</div>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        <Input
          placeholder="Suche nach Name oder E-Mail..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="max-w-xs h-8 text-sm"
        />
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-[160px] h-8 text-sm">
            <SelectValue placeholder="Rolle" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">Alle Rollen</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="sales_agent">Vertrieb</SelectItem>
            <SelectItem value="tester">Tester</SelectItem>
            <SelectItem value="session_manager">Session Mgr</SelectItem>
            <SelectItem value="user">Benutzer</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="text-sm text-muted-foreground py-8 text-center">Lade Aktivitaetsdaten...</div>
      ) : (
        <div className="border rounded-lg overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Benutzer</TableHead>
                <TableHead>Rolle</TableHead>
                <TableHead className="text-right">Sessions</TableHead>
                <TableHead className="text-right">Gesamtzeit</TableHead>
                <TableHead className="text-right">Uebersetzungen</TableHead>
                <TableHead className="text-right">Monat: Min</TableHead>
                <TableHead className="text-right">Monat: Uebers.</TableHead>
                <TableHead className="text-right">Leads</TableHead>
                <TableHead className="text-right">Letzte Aktivitaet</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(u => (
                <TableRow key={u.user_id}>
                  <TableCell>
                    <div className="font-medium">{u.display_name ?? '-'}</div>
                    <div className="text-xs text-muted-foreground">{u.email}</div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      <div className={`w-2 h-2 rounded-full ${ROLE_COLORS[u.role] ?? 'bg-gray-400'}`} />
                      <span className="text-sm">{ROLE_LABELS[u.role] ?? u.role}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right tabular-nums">{u.total_sessions}</TableCell>
                  <TableCell className="text-right tabular-nums">{formatMinutes(u.total_duration_minutes)}</TableCell>
                  <TableCell className="text-right tabular-nums">{u.total_translations.toLocaleString('de-DE')}</TableCell>
                  <TableCell className="text-right tabular-nums">{formatMinutes(u.current_month_minutes)}</TableCell>
                  <TableCell className="text-right tabular-nums">{u.current_month_translations}</TableCell>
                  <TableCell className="text-right tabular-nums">
                    {u.lead_count > 0 ? (
                      <Badge variant="secondary" className="text-xs">{u.lead_count}</Badge>
                    ) : '-'}
                  </TableCell>
                  <TableCell className="text-right text-xs text-muted-foreground">
                    {formatDate(u.last_session_at)}
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} className="text-center text-muted-foreground py-8">
                    Keine Benutzer gefunden
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
