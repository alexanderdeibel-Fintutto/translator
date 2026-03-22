// Fintutto World — Staff / Team Management
// Invite museum staff, assign roles, manage team members

import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Users, Plus, Loader2, Mail, Shield, Trash2, UserPlus,
  Check, X, AlertCircle,
} from 'lucide-react'
import {
  getMuseumStaff, inviteStaffMember, updateStaffRole, removeStaffMember,
} from '@/lib/artguide/museum-api'
import type { MuseumUser, MuseumRoleId } from '@/lib/artguide/types'
import { supabase } from '@/lib/supabase'

const ROLES: { id: MuseumRoleId; label: string; desc: string }[] = [
  { id: 'museum_admin', label: 'Administrator', desc: 'Voller Zugriff auf alle Funktionen' },
  { id: 'redakteur', label: 'Redakteur', desc: 'Inhalte erstellen, bearbeiten und veroeffentlichen' },
  { id: 'rechercheur', label: 'Rechercheur', desc: 'Inhalte lesen und vorbereiten' },
  { id: 'fotograf', label: 'Fotograf', desc: 'Medien hochladen und verwalten' },
  { id: 'buchhaltung', label: 'Buchhaltung', desc: 'Zugriff auf Abrechnung und Reports' },
]

export default function StaffManager() {
  const [searchParams] = useSearchParams()
  const [museums, setMuseums] = useState<{ id: string; name: string }[]>([])
  const [museumId, setMuseumId] = useState(searchParams.get('museum') || '')
  const [staff, setStaff] = useState<(MuseumUser & { gt_users?: { email: string; display_name: string | null } })[]>([])
  const [loading, setLoading] = useState(false)

  // Invite form
  const [showInvite, setShowInvite] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<MuseumRoleId>('redakteur')
  const [inviting, setInviting] = useState(false)
  const [inviteError, setInviteError] = useState<string | null>(null)
  const [inviteSuccess, setInviteSuccess] = useState(false)

  // Pending invites
  const [pendingInvites, setPendingInvites] = useState<{ id: string; email: string; role_id: string; created_at: string }[]>([])

  useEffect(() => {
    supabase
      .from('ag_museums')
      .select('id, name')
      .eq('is_active', true)
      .order('name')
      .then(({ data }) => {
        if (data) {
          setMuseums(data)
          if (!museumId && data.length === 1) setMuseumId(data[0].id)
        }
      })
  }, [])

  useEffect(() => {
    if (museumId) loadStaff()
  }, [museumId])

  async function loadStaff() {
    setLoading(true)
    const staffList = await getMuseumStaff(museumId)
    setStaff(staffList as typeof staff)

    // Load pending invites
    const { data: invites } = await supabase
      .from('ag_museum_invites')
      .select('id, email, role_id, created_at')
      .eq('museum_id', museumId)
      .eq('status', 'pending')
      .order('created_at', { ascending: false })

    setPendingInvites(invites || [])
    setLoading(false)
  }

  async function handleInvite() {
    if (!inviteEmail || !museumId) return
    setInviting(true)
    setInviteError(null)
    setInviteSuccess(false)

    const result = await inviteStaffMember(museumId, inviteEmail, inviteRole)

    if (result.success) {
      setInviteSuccess(true)
      setInviteEmail('')
      setTimeout(() => setInviteSuccess(false), 3000)
      loadStaff()
    } else {
      setInviteError(result.error || 'Einladung fehlgeschlagen')
    }

    setInviting(false)
  }

  async function handleRoleChange(museumUserId: string, newRole: MuseumRoleId) {
    await updateStaffRole(museumUserId, newRole)
    loadStaff()
  }

  async function handleRemove(museumUserId: string) {
    if (!confirm('Mitarbeiter wirklich entfernen?')) return
    await removeStaffMember(museumUserId)
    loadStaff()
  }

  async function handleCancelInvite(inviteId: string) {
    await supabase
      .from('ag_museum_invites')
      .update({ status: 'cancelled' })
      .eq('id', inviteId)
    loadStaff()
  }

  const activeStaff = staff.filter(s => s.is_active)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Users className="h-6 w-6" />
            Team-Verwaltung
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {activeStaff.length} aktive Mitarbeiter
            {pendingInvites.length > 0 && `, ${pendingInvites.length} ausstehende Einladungen`}
          </p>
        </div>
        <Button onClick={() => setShowInvite(true)} disabled={!museumId}>
          <UserPlus className="h-4 w-4 mr-2" /> Mitarbeiter einladen
        </Button>
      </div>

      {/* Museum selector */}
      {museums.length > 1 && (
        <Select value={museumId} onValueChange={setMuseumId}>
          <SelectTrigger className="w-64">
            <SelectValue placeholder="Museum auswaehlen..." />
          </SelectTrigger>
          <SelectContent>
            {museums.map(m => (
              <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {/* Invite form */}
      {showInvite && (
        <Card className="p-4 space-y-3 border-primary">
          <h3 className="font-semibold text-sm flex items-center gap-2">
            <UserPlus className="h-4 w-4" /> Neuen Mitarbeiter einladen
          </h3>

          {inviteError && (
            <div className="p-2 rounded bg-destructive/10 text-destructive text-sm flex items-center gap-2">
              <AlertCircle className="h-4 w-4 flex-shrink-0" /> {inviteError}
            </div>
          )}

          {inviteSuccess && (
            <div className="p-2 rounded bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 text-sm flex items-center gap-2">
              <Check className="h-4 w-4" /> Einladung erfolgreich versendet!
            </div>
          )}

          <div className="flex gap-3 items-end">
            <div className="flex-1 space-y-1.5">
              <Label>E-Mail-Adresse</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="email"
                  value={inviteEmail}
                  onChange={e => setInviteEmail(e.target.value)}
                  placeholder="mitarbeiter@museum.de"
                  className="pl-9"
                  onKeyDown={e => e.key === 'Enter' && handleInvite()}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Rolle</Label>
              <Select value={inviteRole} onValueChange={v => setInviteRole(v as MuseumRoleId)}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ROLES.map(r => (
                    <SelectItem key={r.id} value={r.id}>{r.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleInvite} disabled={inviting || !inviteEmail}>
              {inviting ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
            </Button>
            <Button variant="ghost" onClick={() => { setShowInvite(false); setInviteError(null) }}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Role descriptions */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {ROLES.map(r => (
              <div
                key={r.id}
                className={`p-2 rounded text-xs cursor-pointer transition-colors ${
                  inviteRole === r.id ? 'bg-primary/10 border border-primary' : 'bg-muted'
                }`}
                onClick={() => setInviteRole(r.id)}
              >
                <div className="font-medium">{r.label}</div>
                <div className="text-muted-foreground">{r.desc}</div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {loading ? (
        <div className="text-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mx-auto" />
        </div>
      ) : (
        <div className="space-y-4">
          {/* Active members */}
          {activeStaff.length === 0 && pendingInvites.length === 0 ? (
            <Card className="p-12 text-center">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-semibold text-lg mb-2">Noch kein Team</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Lade Mitarbeiter ein, um gemeinsam am Museum zu arbeiten.
              </p>
            </Card>
          ) : (
            <>
              {activeStaff.length > 0 && (
                <div>
                  <h3 className="font-semibold text-sm mb-2">Aktive Mitarbeiter</h3>
                  <div className="space-y-2">
                    {activeStaff.map(member => {
                      const roleInfo = ROLES.find(r => r.id === member.role_id)
                      const email = (member as Record<string, unknown>).gt_users
                        ? ((member as Record<string, unknown>).gt_users as { email: string }).email
                        : null
                      const displayName = member.display_name
                        || ((member as Record<string, unknown>).gt_users as { display_name: string | null } | undefined)?.display_name
                        || email
                        || member.user_id.slice(0, 8)

                      return (
                        <Card key={member.id} className="p-3 flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <span className="text-sm font-semibold text-primary">
                              {displayName.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm truncate">{displayName}</div>
                            {email && <div className="text-xs text-muted-foreground truncate">{email}</div>}
                          </div>
                          <Select
                            value={member.role_id}
                            onValueChange={v => handleRoleChange(member.id, v as MuseumRoleId)}
                          >
                            <SelectTrigger className="w-40 h-8 text-xs">
                              <Shield className="h-3 w-3 mr-1" />
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {ROLES.map(r => (
                                <SelectItem key={r.id} value={r.id}>{r.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => handleRemove(member.id)}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </Card>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Pending invites */}
              {pendingInvites.length > 0 && (
                <div>
                  <h3 className="font-semibold text-sm mb-2">Ausstehende Einladungen</h3>
                  <div className="space-y-2">
                    {pendingInvites.map(invite => {
                      const roleInfo = ROLES.find(r => r.id === invite.role_id)
                      return (
                        <Card key={invite.id} className="p-3 flex items-center gap-3 opacity-70">
                          <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm truncate">{invite.email}</div>
                            <div className="text-xs text-muted-foreground">
                              Eingeladen am {new Date(invite.created_at).toLocaleDateString('de-DE')}
                            </div>
                          </div>
                          <Badge variant="outline">{roleInfo?.label || invite.role_id}</Badge>
                          <Badge variant="secondary">Ausstehend</Badge>
                          <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => handleCancelInvite(invite.id)}>
                            <X className="h-3.5 w-3.5" />
                          </Button>
                        </Card>
                      )
                    })}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}
