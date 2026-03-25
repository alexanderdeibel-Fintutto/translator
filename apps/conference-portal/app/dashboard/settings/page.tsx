'use client'
import { useState } from 'react'
import { useOrganization } from '@/lib/hooks'

export default function SettingsPage() {
  const { organization, loading: orgLoading, reload } = useOrganization()
  const [saved, setSaved] = useState(false)

  if (orgLoading) return <div className="p-8 text-slate-400">Laden…</div>

  return (
    <div className="p-8 max-w-2xl">
      <h1 className="text-2xl font-bold text-white mb-6">Einstellungen</h1>
      <div className="bg-slate-800 rounded-xl p-6 space-y-4">
        <div>
          <label className="block text-sm text-slate-400 mb-1">Organisation</label>
          <p className="text-white font-medium">{organization?.name ?? '—'}</p>
        </div>
        <div>
          <label className="block text-sm text-slate-400 mb-1">Plan</label>
          <p className="text-white font-medium capitalize">{organization?.plan ?? 'basic'}</p>
        </div>
        <div>
          <label className="block text-sm text-slate-400 mb-1">Sprachen</label>
          <p className="text-white font-medium">{organization?.languages?.join(', ') ?? 'Deutsch, Englisch'}</p>
        </div>
        {saved && <p className="text-green-400 text-sm">Gespeichert ✓</p>}
      </div>
    </div>
  )
}
