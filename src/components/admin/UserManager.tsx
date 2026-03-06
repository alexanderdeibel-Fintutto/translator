import { useEffect, useState } from 'react'
import { UserPlus, Shield, ShieldCheck, UserCog } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { fetchManagedUsers, createManagedUser, updateUserRole } from '@/lib/session-management-api'
import type { ManagedUser, UserRole } from '@/lib/admin-types'

const ROLE_CONFIG: Record<string, { label: string; icon: typeof Shield; color: string }> = {
  admin: { label: 'Admin', icon: ShieldCheck, color: 'bg-red-500' },
  sales_agent: { label: 'Sales Agent', icon: Shield, color: 'bg-amber-500' },
  session_manager: { label: 'Session Manager', icon: UserCog, color: 'bg-blue-500' },
}

export default function UserManager() {
  const [users, setUsers] = useState<ManagedUser[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)

  useEffect(() => {
    fetchManagedUsers()
      .then(setUsers)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  async function handleRoleChange(userId: string, newRole: string) {
    try {
      await updateUserRole(userId, newRole)
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole as UserRole } : u))
    } catch (err) {
      console.error('Role update failed:', err)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h2 className="text-lg font-semibold">Benutzerverwaltung</h2>
        <Button size="sm" onClick={() => setShowCreateForm(true)} className="gap-1.5">
          <UserPlus className="h-4 w-4" /> Neuen Benutzer anlegen
        </Button>
      </div>

      <div className="bg-muted/50 rounded-lg p-3 text-sm text-muted-foreground">
        Hier koennen Sie Benutzer anlegen, die Sessions verwalten und vorbereiten koennen.
        <strong> Session Manager</strong> koennen Sessions anlegen, Teilnehmer verwalten
        und Pre-Translation Dokumente hochladen.
      </div>

      {loading ? (
        <div className="text-sm text-muted-foreground py-8 text-center">Lade Benutzer...</div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>E-Mail</TableHead>
              <TableHead>Rolle</TableHead>
              <TableHead className="text-right">Erstellt am</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map(user => {
              const roleConf = ROLE_CONFIG[user.role]
              return (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.display_name ?? '-'}</TableCell>
                  <TableCell className="text-sm">{user.email ?? '-'}</TableCell>
                  <TableCell>
                    <Select value={user.role} onValueChange={v => handleRoleChange(user.id, v)}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue>
                          <div className="flex items-center gap-2">
                            {roleConf && <div className={`w-2 h-2 rounded-full ${roleConf.color}`} />}
                            {roleConf?.label ?? user.role}
                          </div>
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="session_manager">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-blue-500" />
                            Session Manager
                          </div>
                        </SelectItem>
                        <SelectItem value="sales_agent">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-amber-500" />
                            Sales Agent
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
                  <TableCell className="text-right text-xs text-muted-foreground">
                    {new Date(user.created_at).toLocaleDateString('de-DE')}
                  </TableCell>
                </TableRow>
              )
            })}
            {users.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                  Noch keine verwalteten Benutzer
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      )}

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
  const [role, setRole] = useState<'session_manager' | 'admin' | 'sales_agent'>('session_manager')
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
              <SelectItem value="session_manager">Session Manager</SelectItem>
              <SelectItem value="sales_agent">Sales Agent</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="flex gap-2 justify-end">
        <Button type="button" variant="outline" onClick={onCancel}>Abbrechen</Button>
        <Button type="submit" disabled={saving}>{saving ? 'Wird angelegt...' : 'Benutzer anlegen'}</Button>
      </div>
    </form>
  )
}
