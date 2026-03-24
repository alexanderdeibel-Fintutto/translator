import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { createLead, updateLead } from '@/lib/admin-api'
import { SEGMENTS, type Segment } from '@/lib/tiers'
import type { Lead } from '@/lib/admin-types'
import { useUser } from '@/context/UserContext'

interface LeadFormProps {
  lead?: Lead
  onSaved: (lead: Lead) => void
  onCancel: () => void
}

export default function LeadForm({ lead, onSaved, onCancel }: LeadFormProps) {
  const { user } = useUser()
  const [name, setName] = useState(lead?.name ?? '')
  const [email, setEmail] = useState(lead?.email ?? '')
  const [company, setCompany] = useState(lead?.company ?? '')
  const [phone, setPhone] = useState(lead?.phone ?? '')
  const [segment, setSegment] = useState<Segment>(lead?.segment ?? 'cruise')
  const [fleetSize, setFleetSize] = useState(lead?.fleet_size?.toString() ?? '')
  const [role, setRole] = useState(lead?.role ?? '')
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = {
        name,
        email,
        company: company || null,
        phone: phone || null,
        segment,
        fleet_size: fleetSize ? parseInt(fleetSize, 10) : null,
        role: role || null,
      }
      if (lead) {
        await updateLead(lead.id, payload)
        onSaved({ ...lead, ...payload } as Lead)
      } else {
        const created = await createLead({
          ...payload,
          created_by: user?.id ?? null,
          assigned_to: user?.id ?? null,
        })
        onSaved(created)
      }
    } catch (err) {
      console.error('Save lead failed:', err)
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="lead-name">Name *</Label>
          <Input id="lead-name" value={name} onChange={e => setName(e.target.value)} required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="lead-email">E-Mail *</Label>
          <Input id="lead-email" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="lead-company">Firma</Label>
          <Input id="lead-company" value={company} onChange={e => setCompany(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="lead-phone">Telefon</Label>
          <Input id="lead-phone" type="tel" value={phone} onChange={e => setPhone(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="lead-segment">Segment</Label>
          <Select value={segment} onValueChange={v => setSegment(v as Segment)}>
            <SelectTrigger id="lead-segment">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SEGMENTS.map(s => (
                <SelectItem key={s.id} value={s.id}>{s.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="lead-fleet">Flottengr.</Label>
          <Input id="lead-fleet" type="number" value={fleetSize} onChange={e => setFleetSize(e.target.value)} placeholder="z.B. 5" />
        </div>
        <div className="col-span-2 space-y-1.5">
          <Label htmlFor="lead-role">Rolle (beim Kunden)</Label>
          <Input id="lead-role" value={role} onChange={e => setRole(e.target.value)} placeholder="z.B. Head of Excursions" />
        </div>
      </div>
      <div className="flex gap-2 justify-end">
        <Button type="button" variant="outline" onClick={onCancel}>Abbrechen</Button>
        <Button type="submit" disabled={saving}>{saving ? 'Speichern...' : lead ? 'Aktualisieren' : 'Erstellen'}</Button>
      </div>
    </form>
  )
}
