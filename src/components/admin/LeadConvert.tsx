import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { supabase } from '@/lib/supabase'
import { getTiersBySegment, formatPrice, type TierId, type Segment } from '@/lib/tiers'
import type { Lead } from '@/lib/admin-types'
import { UserPlus } from 'lucide-react'

interface LeadConvertProps {
  lead: Lead
  open: boolean
  onOpenChange: (open: boolean) => void
  onConverted: (userId: string) => void
}

export default function LeadConvert({ lead, open, onOpenChange, onConverted }: LeadConvertProps) {
  const tiers = getTiersBySegment(lead.segment as Segment)
  const [tierId, setTierId] = useState<TierId>(tiers[0]?.id ?? 'free')
  const [converting, setConverting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleConvert() {
    setConverting(true)
    setError(null)
    try {
      const { data, error: fnError } = await supabase.functions.invoke('admin-create-user', {
        body: {
          leadId: lead.id,
          tierId,
          email: lead.email,
          displayName: lead.name,
        },
      })
      if (fnError) throw fnError
      onConverted(data.userId)
      onOpenChange(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler bei der Konvertierung')
    } finally {
      setConverting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Lead zum Kunden konvertieren</DialogTitle>
          <DialogDescription>
            Ein neues Benutzerkonto fuer {lead.name} ({lead.email}) wird erstellt. Der Benutzer erhaelt eine E-Mail mit einem Link zum Setzen des Passworts.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label>Plan auswaehlen</Label>
            <Select value={tierId} onValueChange={v => setTierId(v as TierId)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {tiers.map(t => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.displayName} — {formatPrice(t.pricing.monthlyEur)}/Mo
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {error && <div className="text-sm text-destructive">{error}</div>}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Abbrechen</Button>
          <Button onClick={handleConvert} disabled={converting} className="gap-1.5">
            <UserPlus className="h-4 w-4" />
            {converting ? 'Konvertiere...' : 'Konto erstellen'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
