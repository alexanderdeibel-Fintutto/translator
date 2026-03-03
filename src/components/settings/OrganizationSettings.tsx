import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Users, UserPlus, Trash2, Building } from 'lucide-react'
import { useUser, type UserProfile } from '@/context/UserContext'
import {
  fetchOrganization,
  fetchOrgMembers,
  fetchOrgInvites,
  inviteMember,
  removeMember,
  type Organization,
  type OrgInvite,
} from '@/lib/organization-api'

export default function OrganizationSettings() {
  const { user } = useUser()
  const [org, setOrg] = useState<Organization | null>(null)
  const [members, setMembers] = useState<UserProfile[]>([])
  const [invites, setInvites] = useState<OrgInvite[]>([])
  const [loading, setLoading] = useState(true)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviting, setInviting] = useState(false)

  useEffect(() => {
    if (!user?.organizationId) return
    Promise.all([
      fetchOrganization(user.organizationId),
      fetchOrgMembers(user.organizationId),
      fetchOrgInvites(user.organizationId),
    ])
      .then(([o, m, i]) => {
        setOrg(o)
        setMembers(m)
        setInvites(i)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [user?.organizationId])

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault()
    if (!inviteEmail || !user?.organizationId || !user?.id) return
    setInviting(true)
    try {
      await inviteMember(user.organizationId, inviteEmail, user.id)
      const updated = await fetchOrgInvites(user.organizationId)
      setInvites(updated)
      setInviteEmail('')
    } catch (err) {
      console.error('Invite failed:', err)
    } finally {
      setInviting(false)
    }
  }

  async function handleRemove(memberId: string) {
    await removeMember(memberId)
    setMembers(prev => prev.filter(m => m.id !== memberId))
  }

  if (!user?.organizationId) return null
  if (loading) return <div className="text-sm text-muted-foreground">Lade Organisation...</div>

  const isOwner = org?.owner_id === user.id

  return (
    <Card className="p-5 space-y-4">
      <div className="flex items-center gap-2">
        <Building className="h-5 w-5 text-primary" />
        <h2 className="font-semibold">Organisation</h2>
      </div>

      {org && (
        <div className="text-sm space-y-1">
          <div className="font-medium">{org.name}</div>
          <div className="text-muted-foreground">
            {members.length} / {org.max_seats} Plaetze belegt
          </div>
        </div>
      )}

      <Separator />

      {/* Members */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Mitglieder</span>
        </div>
        <div className="space-y-1.5">
          {members.map(m => (
            <div key={m.id} className="flex items-center justify-between py-1.5">
              <div className="text-sm">
                <span className="font-medium">{m.displayName ?? m.email}</span>
                {m.id === org?.owner_id && (
                  <Badge variant="secondary" className="ml-2 text-[10px]">Owner</Badge>
                )}
              </div>
              {isOwner && m.id !== user.id && (
                <Button size="icon" variant="ghost" onClick={() => handleRemove(m.id)}>
                  <Trash2 className="h-3.5 w-3.5 text-destructive" />
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Pending invites */}
      {invites.filter(i => i.status === 'pending').length > 0 && (
        <div className="space-y-1.5">
          <span className="text-xs font-medium text-muted-foreground">Ausstehende Einladungen</span>
          {invites.filter(i => i.status === 'pending').map(inv => (
            <div key={inv.id} className="flex items-center gap-2 text-sm">
              <Badge variant="outline" className="text-xs">Ausstehend</Badge>
              <span>{inv.email}</span>
            </div>
          ))}
        </div>
      )}

      {/* Invite form */}
      {isOwner && org && members.length < org.max_seats && (
        <>
          <Separator />
          <form onSubmit={handleInvite} className="flex gap-2">
            <div className="flex-1 space-y-1.5">
              <Label htmlFor="invite-email">Mitglied einladen</Label>
              <Input
                id="invite-email"
                type="email"
                value={inviteEmail}
                onChange={e => setInviteEmail(e.target.value)}
                placeholder="email@beispiel.de"
              />
            </div>
            <Button type="submit" size="sm" className="self-end gap-1.5" disabled={inviting || !inviteEmail}>
              <UserPlus className="h-3.5 w-3.5" />
              {inviting ? '...' : 'Einladen'}
            </Button>
          </form>
        </>
      )}
    </Card>
  )
}
