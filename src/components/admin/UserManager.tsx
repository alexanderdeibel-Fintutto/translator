import { useEffect, useState } from 'react'
import { UserPlus, Shield, ShieldCheck, UserCog, TestTube, Users, Crown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { fetchManagedUsers, fetchAllUsers, createManagedUser, updateUserRole } from '@/lib/session-management-api'
import { TIERS, TIER_ORDER, INTERNAL_TIERS, type TierId } from '@/lib/tiers'
import { supabase } from '@/lib/supabase'
import type { ManagedUser, UserRole } from '@/lib/admin-types'

const ROLE_CONFIG: Record<string, { label: string; icon: typeof Shield; color: string; description: string }> = {
  admin: { label: 'Admin', icon: ShieldCheck, color: 'bg-red-500', description: 'Voller Zugriff auf alles' },
  sales_agent: { label: 'Vertrieb', icon: Shield, color: 'bg-amber-500', description: 'CRM + Demo-Features' },
  session_manager: { label: 'Session Mgr', icon: UserCog, color: 'bg-blue-500', description: 'Sessions verwalten' },
  tester: { label: 'Tester', icon: TestTube, color: 'bg-violet-500', description: 'Alle Features zum Testen' },
  user: { label: 'Benutzer', icon: Users, color: 'bg-slate-400', description: 'Normaler Account' },
}

type ViewFilter = 'managed' | 'all'

export default function UserManager() {
  const [users, setUsers] = useState<ManagedUser[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [viewFilter, setViewFilter] = useState<ViewFilter>('managed')
  const [search, setSearch] = useState('')

  function loadUsers(filter: ViewFilter) {
    setLoading(true)
    const fetcher = filter === 'all' ? fetchAllUsers : fetchManagedUsers
    fetcher()
      .then(setUsers)
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadUsers(viewFilter)
  }, [viewFilter])

  async function handleRoleChange(userId: string, newRole: string) {
    try {
      await updateUserRole(userId, newRole)
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole as UserRole } : u))
    } catch (err) {
      console.error('Role update failed:', err)
    }
  }

  async function handleTierChange(userId: string, newTierId: string) {
    try {
      const { error } = await supabase
        .from('gt_users')
        .update({ tier_id: newTierId })
        .eq('id', userId)
      if (error) throw error
    } catch (err) {
      console.error('Tier update failed:', err)
    }
  }

  const filteredUsers = search
    ? users.filter(u =>
        (u.display_name ?? '').toLowerCase().includes(search.toLowerCase()) ||
        (u.email ?? '').toLowerCase().includes(search.toLowerCase())
      )
    : users

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h2 className="text-lg font-semibold">Benutzerverwaltung</h2>
        <Button size="sm" onClick={() => setShowCreateForm(true)} className="gap-1.5">
          <UserPlus className="h-4 w-4" /> Neuen Benutzer anlegen
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="inline-flex items-center gap-1 p-1 rounded-lg bg-muted">
          <button
            onClick={() => setViewFilter('managed')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              viewFilter === 'managed'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Team ({viewFilter === 'managed' ? users.length : '...'})
          </button>
          <button
            onClick={() => setViewFilter('all')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              viewFilter === 'all'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Alle Benutzer
          </button>
        </div>
        <Input
          placeholder="Suche nach Name oder E-Mail..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="max-w-xs h-8 text-sm"
        />
      </div>

      {/* Legend */}
      <div className="flex gap-3 flex-wrap text-xs">
        {Object.entries(ROLE_CONFIG).map(([key, conf]) => (
          <div key={key} className="flex items-center gap-1.5">
            <div className={`w-2 h-2 rounded-full ${conf.color}`} />
            <span className="text-muted-foreground">{conf.label}: {conf.description}</span>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="text-sm text-muted-foreground py-8 text-center">Lade Benutzer...</div>
      ) : (
        <div className="border rounded-lg overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>E-Mail</TableHead>
                <TableHead>Rolle</TableHead>
                <TableHead>Tier</TableHead>
                <TableHead className="text-right">Erstellt am</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map(user => {
                const roleConf = ROLE_CONFIG[user.role]
                return (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.display_name ?? '-'}</TableCell>
                    <TableCell className="text-sm">{user.email ?? '-'}</TableCell>
                    <TableCell>
                      <Select value={user.role} onValueChange={v => handleRoleChange(user.id, v)}>
                        <SelectTrigger className="w-[160px] h-8 text-xs">
                          <SelectValue>
                            <div className="flex items-center gap-2">
                              {roleConf && <div className={`w-2 h-2 rounded-full ${roleConf.color}`} />}
                              {roleConf?.label ?? user.role}
                            </div>
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="user">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-slate-400" />
                              Benutzer
                            </div>
                          </SelectItem>
                          <SelectItem value="tester">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-violet-500" />
                              Tester
                            </div>
                          </SelectItem>
                          <SelectItem value="session_manager">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-blue-500" />
                              Session Manager
                            </div>
                          </SelectItem>
                          <SelectItem value="sales_agent">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-amber-500" />
                              Vertrieb
                            </div>
                          </SelectItem>
                          <SelectItem value="admin">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-red-500" />
                              Admin
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <TierSelector userId={user.id} currentRole={user.role} onTierChange={handleTierChange} />
                    </TableCell>
                    <TableCell className="text-right text-xs text-muted-foreground">
                      {new Date(user.created_at).toLocaleDateString('de-DE')}
                    </TableCell>
                  </TableRow>
                )
              })}
              {filteredUsers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                    {search ? 'Keine Treffer' : 'Noch keine Benutzer'}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}

      <div className="text-xs text-muted-foreground">
        <strong>Hinweis:</strong> Admins, Sales Agents und Tester erhalten automatisch ihren internen
        Tier mit vollen Features beim Login. Normale Benutzer bekommen den hier zugewiesenen Tier.
      </div>

      <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Neuen Benutzer anlegen</DialogTitle>
          </DialogHeader>
          <CreateUserForm
            onCreated={user => {
              setUsers(prev => [user, ...prev])
              setShowCreateForm(false)
            }}
            onCancel={() => setShowCreateForm(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Tier selector per user row
// ---------------------------------------------------------------------------

function TierSelector({
  userId,
  currentRole,
  onTierChange,
}: {
  userId: string
  currentRole: string
  onTierChange: (userId: string, tierId: string) => void
}) {
  const [tierId, setTierId] = useState<string | null>(null)

  // Internal roles get their tier automatically — show badge instead of selector
  if (['admin', 'sales_agent', 'tester'].includes(currentRole)) {
    const autoTier = currentRole === 'admin' ? 'internal_admin'
      : currentRole === 'sales_agent' ? 'internal_sales'
      : 'internal_tester'
    const tier = TIERS[autoTier as TierId]
    return (
      <div className="flex items-center gap-1.5 text-xs">
        <Crown className="h-3 w-3 text-emerald-500" />
        <span className="text-emerald-600 dark:text-emerald-400 font-medium">{tier?.name ?? autoTier}</span>
      </div>
    )
  }

  // For regular users, load their tier from DB on first render
  useEffect(() => {
    supabase
      .from('gt_users')
      .select('tier_id')
      .eq('id', userId)
      .single()
      .then(({ data }) => setTierId(data?.tier_id ?? 'free'))
  }, [userId])

  if (tierId === null) return <span className="text-xs text-muted-foreground">...</span>

  return (
    <Select
      value={tierId}
      onValueChange={v => {
        setTierId(v)
        onTierChange(userId, v)
      }}
    >
      <SelectTrigger className="w-[160px] h-8 text-xs">
        <SelectValue>
          {TIERS[tierId as TierId]?.displayName ?? tierId}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {TIER_ORDER.map(id => (
          <SelectItem key={id} value={id}>
            {TIERS[id].displayName}
            {TIERS[id].pricing.monthlyEur > 0 && (
              <span className="ml-1 text-muted-foreground">
                ({TIERS[id].pricing.monthlyEur} EUR)
              </span>
            )}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

// ---------------------------------------------------------------------------
// Create user form
// ---------------------------------------------------------------------------

function CreateUserForm({
  onCreated,
  onCancel,
}: {
  onCreated: (user: ManagedUser) => void
  onCancel: () => void
}) {
  const [email, setEmail] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<'session_manager' | 'admin' | 'sales_agent' | 'tester'>('tester')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSaving(true)
    try {
      const user = await createManagedUser(email, password, displayName, role)
      onCreated(user)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Benutzer konnte nicht angelegt werden')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-destructive/10 text-destructive text-sm rounded-lg p-3">{error}</div>
      )}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="cu-name">Anzeigename *</Label>
          <Input id="cu-name" value={displayName} onChange={e => setDisplayName(e.target.value)} required
            placeholder="Vor- und Nachname" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="cu-email">E-Mail *</Label>
          <Input id="cu-email" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="cu-password">Passwort *</Label>
          <Input id="cu-password" type="password" value={password} onChange={e => setPassword(e.target.value)}
            required minLength={8} placeholder="Min. 8 Zeichen" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="cu-role">Rolle</Label>
          <Select value={role} onValueChange={v => setRole(v as typeof role)}>
            <SelectTrigger id="cu-role">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="tester">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-violet-500" />
                  Tester — Alle Features gratis
                </div>
              </SelectItem>
              <SelectItem value="session_manager">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500" />
                  Session Manager
                </div>
              </SelectItem>
              <SelectItem value="sales_agent">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-amber-500" />
                  Vertrieb (z.B. Ulrich)
                </div>
              </SelectItem>
              <SelectItem value="admin">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-500" />
                  Admin — Voller Zugriff
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="bg-muted/50 rounded-lg p-3 text-xs text-muted-foreground">
        <strong>Rollen-Info:</strong><br />
        <strong>Tester</strong> = Alle Features freigeschaltet, kein Stripe nötig<br />
        <strong>Vertrieb</strong> = CRM + alle Features für Demos (z.B. Ulrich)<br />
        <strong>Admin</strong> = Voller Zugriff auf alles inkl. Benutzerverwaltung
      </div>

      <div className="flex gap-2 justify-end">
        <Button type="button" variant="outline" onClick={onCancel}>Abbrechen</Button>
        <Button type="submit" disabled={saving}>{saving ? 'Wird angelegt...' : 'Benutzer anlegen'}</Button>
      </div>
    </form>
  )
}
