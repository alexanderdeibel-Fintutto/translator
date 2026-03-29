'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase-client'
import { useMuseum } from '@/lib/hooks'

type Role = 'admin' | 'editor' | 'researcher' | 'photographer' | 'billing'

const ROLES = [
  { id: 'admin' as Role, label: 'Administrator', icon: '👑', desc: 'Voller Zugriff', color: 'bg-red-50 text-red-700 border-red-200' },
  { id: 'editor' as Role, label: 'Redakteur', icon: '✍️', desc: 'Inhalte freigeben', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  { id: 'researcher' as Role, label: 'Rechercheur', icon: '🔍', desc: 'Inhalte erstellen', color: 'bg-green-50 text-green-700 border-green-200' },
  { id: 'photographer' as Role, label: 'Fotograf', icon: '📸', desc: 'Medien verwalten', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  { id: 'billing' as Role, label: 'Buchhaltung', icon: '📊', desc: 'Abrechnung & Stats', color: 'bg-purple-50 text-purple-700 border-purple-200' },
]

type Member = {
  id: string
  user_id: string
  role: Role
  is_active: boolean
  invited_at: string
  joined_at: string | null
  invite_email?: string
  profiles?: { email: string; full_name: string | null }
}

export default function TeamPage() {
  const { museum } = useMuseum()
  const supabase = createClient()
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [showInvite, setShowInvite] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<Role>('editor')
  const [inviting, setInviting] = useState(false)
  const [inviteSuccess, setInviteSuccess] = useState(false)
  const [removingId, setRemovingId] = useState<string | null>(null)

  useEffect(() => { if (museum?.id) loadMembers() }, [museum?.id])

  async function loadMembers() {
    setLoading(true)
    const { data } = await supabase
      .from('ag_cms_members')
      .select('*, profiles:user_id(email, full_name)')
      .eq('museum_id', museum!.id)
      .order('invited_at', { ascending: false })
    if (data) setMembers(data as Member[])
    setLoading(false)
  }

  const inviteMember = async () => {
    if (!inviteEmail.trim() || !museum) return
    setInviting(true)
    try {
      const { error } = await supabase.from('ag_cms_members').insert({
        museum_id: museum.id,
        invite_email: inviteEmail.trim().toLowerCase(),
        role: inviteRole,
        is_active: false,
        invited_at: new Date().toISOString(),
      })
      if (error) throw error
      setInviteSuccess(true)
      setInviteEmail('')
      await loadMembers()
      setTimeout(() => { setInviteSuccess(false); setShowInvite(false) }, 2000)
    } catch (err: any) { alert('Fehler: ' + err.message) }
    finally { setInviting(false) }
  }

  const removeMember = async (memberId: string) => {
    if (!confirm('Mitglied wirklich entfernen?')) return
    setRemovingId(memberId)
    await supabase.from('ag_cms_members').delete().eq('id', memberId)
    await loadMembers()
    setRemovingId(null)
  }

  const updateRole = async (memberId: string, newRole: Role) => {
    await supabase.from('ag_cms_members').update({ role: newRole }).eq('id', memberId)
    setMembers(prev => prev.map(m => m.id === memberId ? { ...m, role: newRole } : m))
  }

  const roleCounts = ROLES.reduce((acc, r) => {
    acc[r.id] = members.filter(m => m.role === r.id).length
    return acc
  }, {} as Record<Role, number>)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Team</h1>
          <p className="text-gray-500 mt-1">Mitarbeiter und Rollen verwalten</p>
        </div>
        <button onClick={() => setShowInvite(true)} className="px-4 py-2 rounded-lg bg-indigo-900 text-white text-sm font-medium hover:bg-indigo-800 transition">
          + Mitglied einladen
        </button>
      </div>
      <div className="grid grid-cols-5 gap-4 mb-8">
        {ROLES.map(role => (
          <div key={role.id} className={`rounded-xl p-4 border ${role.color}`}>
            <div className="text-2xl mb-2">{role.icon}</div>
            <div className="font-semibold text-sm">{role.label}</div>
            <div className="text-xs mt-1 opacity-70">{role.desc}</div>
            <div className="text-2xl font-bold mt-2">{roleCounts[role.id] || 0}</div>
          </div>
        ))}
      </div>
      {showInvite && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Mitglied einladen</h3>
            {inviteSuccess ? (
              <div className="text-center py-8"><div className="text-5xl mb-3">✅</div><p className="text-green-700 font-medium">Einladung gespeichert!</p></div>
            ) : (
              <>
                <div className="space-y-4 mb-6">
                  <div>
                    <label className="text-sm text-gray-600 block mb-1">E-Mail-Adresse</label>
                    <input type="email" value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} placeholder="mitarbeiter@museum.at" className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:border-indigo-500 outline-none" />
                  </div>
                  <div>
                    <label className="text-sm text-gray-600 block mb-2">Rolle</label>
                    <div className="space-y-2">
                      {ROLES.map(role => (
                        <label key={role.id} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition ${inviteRole === role.id ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 hover:border-gray-300'}`}>
                          <input type="radio" name="role" value={role.id} checked={inviteRole === role.id} onChange={() => setInviteRole(role.id)} className="sr-only" />
                          <span className="text-xl">{role.icon}</span>
                          <div><div className="font-medium text-sm text-gray-900">{role.label}</div><div className="text-xs text-gray-500">{role.desc}</div></div>
                          {inviteRole === role.id && <span className="ml-auto text-indigo-500">✓</span>}
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setShowInvite(false)} className="flex-1 py-2 rounded-lg border border-gray-200 text-gray-700 text-sm hover:bg-gray-50 transition">Abbrechen</button>
                  <button onClick={inviteMember} disabled={inviting || !inviteEmail.trim()} className="flex-1 py-2 rounded-lg bg-indigo-900 text-white text-sm font-medium hover:bg-indigo-800 transition disabled:opacity-50">
                    {inviting ? '⚙️ Einladen...' : '📧 Einladen'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
      <div className="bg-white rounded-xl border border-gray-200">
        {loading ? (
          <div className="flex items-center justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" /></div>
        ) : members.length === 0 ? (
          <div className="p-16 text-center">
            <div className="text-5xl mb-4">👥</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Noch keine Teammitglieder</h3>
            <p className="text-gray-500 mb-6">Lade dein Team ein, um gemeinsam Inhalte zu erstellen.</p>
            <button onClick={() => setShowInvite(true)} className="px-6 py-3 rounded-lg bg-indigo-900 text-white font-medium hover:bg-indigo-800 transition">Erstes Mitglied einladen</button>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 text-left text-sm text-gray-500">
                <th className="p-4 font-medium">Mitglied</th>
                <th className="p-4 font-medium">Rolle</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium">Beigetreten</th>
                <th className="p-4 font-medium">Aktionen</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {members.map(member => {
                const role = ROLES.find(r => r.id === member.role)
                const displayName = member.profiles?.full_name || member.profiles?.email || member.invite_email || 'Unbekannt'
                const initial = displayName[0]?.toUpperCase() || '?'
                return (
                  <tr key={member.id} className="hover:bg-gray-50 transition">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-700 font-bold text-sm flex items-center justify-center">{initial}</div>
                        <div>
                          <div className="font-medium text-gray-900 text-sm">{member.profiles?.full_name || '—'}</div>
                          <div className="text-xs text-gray-500">{member.profiles?.email || member.invite_email || 'Einladung ausstehend'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <select value={member.role} onChange={e => updateRole(member.id, e.target.value as Role)} className={`text-xs px-2 py-1 rounded-full border font-medium ${role?.color || 'bg-gray-100 text-gray-600 border-gray-200'} outline-none cursor-pointer`}>
                        {ROLES.map(r => <option key={r.id} value={r.id}>{r.icon} {r.label}</option>)}
                      </select>
                    </td>
                    <td className="p-4">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${member.is_active ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                        {member.is_active ? '✅ Aktiv' : '⏳ Eingeladen'}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-gray-500">{member.joined_at ? new Date(member.joined_at).toLocaleDateString('de-DE') : '—'}</td>
                    <td className="p-4">
                      <button onClick={() => removeMember(member.id)} disabled={removingId === member.id} className="text-xs px-3 py-1 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition disabled:opacity-50">
                        {removingId === member.id ? '...' : 'Entfernen'}
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
