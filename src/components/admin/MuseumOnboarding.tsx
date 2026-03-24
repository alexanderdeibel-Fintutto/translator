// Fintutto World — Museum Onboarding & Invite Flow
// Sales agent creates a new museum lead, generates an invite link with personalized landing page

import { useState } from 'react'
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
  Building2, Send, Copy, Check, ExternalLink, Loader2,
  Landmark, MapPin, Globe, Users, Mail, Phone, ArrowRight,
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useUser } from '@/context/UserContext'
import { CRM_SEGMENTS, type CrmSegmentId } from '@/lib/fintutto-world/crm-segments'

type OnboardingStep = 'info' | 'segment' | 'invite' | 'done'

const MUSEUM_SEGMENTS: { id: CrmSegmentId; label: string; desc: string }[] = [
  { id: 'museum_small', label: 'Kleines Museum', desc: 'Bis 50 Exponate, lokal' },
  { id: 'museum_medium', label: 'Mittleres Museum', desc: '50-200 Exponate, regional' },
  { id: 'museum_large', label: 'Grosses Museum', desc: '200+ Exponate, national/international' },
  { id: 'city_small', label: 'Kleinstadt', desc: 'Tourismusbuero, Stadtverwaltung' },
  { id: 'city_medium', label: 'Mittelstadt', desc: 'Tourismusverband, Stadtmarketing' },
  { id: 'city_large', label: 'Grossstadt', desc: 'Tourismus GmbH, Smart City' },
  { id: 'region', label: 'Region / Verband', desc: 'Tourismusverband, Landkreis' },
  { id: 'event', label: 'Event / Messe', desc: 'Veranstaltung, Ausstellung' },
]

export default function MuseumOnboarding() {
  const { user } = useUser()
  const [step, setStep] = useState<OnboardingStep>('info')
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Form state
  const [companyName, setCompanyName] = useState('')
  const [contactName, setContactName] = useState('')
  const [contactEmail, setContactEmail] = useState('')
  const [contactPhone, setContactPhone] = useState('')
  const [city, setCity] = useState('')
  const [segment, setSegment] = useState<CrmSegmentId>('museum_small')

  // Result state
  const [inviteCode, setInviteCode] = useState('')
  const [inviteUrl, setInviteUrl] = useState('')
  const [leadId, setLeadId] = useState('')

  async function handleCreateLead() {
    if (!companyName || !contactEmail) {
      setError('Name und E-Mail sind Pflichtfelder')
      return
    }
    setError(null)
    setLoading(true)

    try {
      // 1. Create CRM lead via fw_crm_leads
      const { data: lead, error: leadErr } = await supabase
        .from('fw_crm_leads')
        .insert({
          segment_id: segment,
          status: 'new',
          source: 'cold_outreach',
          priority: 'normal',
          company_name: companyName,
          contact_first_name: contactName.split(' ')[0] || contactName,
          contact_last_name: contactName.split(' ').slice(1).join(' ') || null,
          contact_email: contactEmail,
          contact_phone: contactPhone || null,
          city: city || null,
          country: 'DE',
          assigned_to: user?.id || null,
          tags: ['museum-onboarding'],
        })
        .select()
        .single()

      if (leadErr) {
        // Fallback: try gt_leads table (legacy CRM)
        const { data: legacyLead, error: legacyErr } = await supabase
          .from('gt_leads')
          .insert({
            name: contactName || companyName,
            email: contactEmail,
            company: companyName,
            phone: contactPhone || null,
            segment: segment.startsWith('museum') ? 'guide' : 'event',
            pipeline_stage: 'neu',
            tags: ['museum-onboarding', segment],
            assigned_to: user?.id || null,
            created_by: user?.id || null,
          })
          .select()
          .single()

        if (legacyErr) throw legacyErr
        setLeadId(legacyLead.id)
      } else {
        setLeadId(lead.id)
      }

      // 2. Generate invite code
      const code = Array.from(crypto.getRandomValues(new Uint8Array(9)))
        .map(b => b.toString(36).padStart(2, '0'))
        .join('')
        .slice(0, 12)
        .toUpperCase()

      // Try fw_crm_invite_codes first
      const { error: inviteErr } = await supabase
        .from('fw_crm_invite_codes')
        .insert({
          code,
          lead_id: leadId || lead?.id || null,
          segment_id: segment,
          landing_config: {
            company: companyName,
            contact_name: contactName,
            city,
          },
          max_uses: 1,
          is_active: true,
          created_by: user?.id || null,
        })

      if (inviteErr) {
        // If table doesn't exist, still generate the URL
        console.warn('fw_crm_invite_codes not available, using URL-only invite')
      }

      const url = `${window.location.origin}/sales/${segment}?invite=${code}&company=${encodeURIComponent(companyName)}`
      setInviteCode(code)
      setInviteUrl(url)
      setStep('done')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Fehler beim Erstellen')
    } finally {
      setLoading(false)
    }
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(inviteUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const segmentConfig = CRM_SEGMENTS[segment]

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Building2 className="h-6 w-6" />
          Museum einladen
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Erstelle einen personalisierten Einladungslink fuer ein neues Museum.
        </p>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-2 text-sm">
        {(['info', 'segment', 'done'] as const).map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            {i > 0 && <ArrowRight className="h-3 w-3 text-muted-foreground" />}
            <Badge variant={step === s || (s === 'info' && step === 'segment') ? 'default' : 'outline'}>
              {i + 1}. {s === 'info' ? 'Kontaktdaten' : s === 'segment' ? 'Segment' : 'Einladung'}
            </Badge>
          </div>
        ))}
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
          {error}
        </div>
      )}

      {/* Step 1: Contact Info */}
      {(step === 'info' || step === 'segment') && (
        <Card className="p-6 space-y-4">
          <h3 className="font-semibold flex items-center gap-2">
            <Landmark className="h-4 w-4" />
            Museum / Institution
          </h3>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Name des Museums *</Label>
              <Input
                value={companyName}
                onChange={e => setCompanyName(e.target.value)}
                placeholder="z.B. Stadtmuseum Muenchen"
              />
            </div>
            <div className="space-y-2">
              <Label>Stadt</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={city}
                  onChange={e => setCity(e.target.value)}
                  placeholder="z.B. Muenchen"
                  className="pl-9"
                />
              </div>
            </div>
          </div>

          <h3 className="font-semibold flex items-center gap-2 pt-2">
            <Users className="h-4 w-4" />
            Ansprechpartner
          </h3>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                value={contactName}
                onChange={e => setContactName(e.target.value)}
                placeholder="Vor- und Nachname"
              />
            </div>
            <div className="space-y-2">
              <Label>E-Mail *</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="email"
                  value={contactEmail}
                  onChange={e => setContactEmail(e.target.value)}
                  placeholder="museum@example.de"
                  className="pl-9"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Telefon</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={contactPhone}
                  onChange={e => setContactPhone(e.target.value)}
                  placeholder="+49..."
                  className="pl-9"
                />
              </div>
            </div>
          </div>

          <h3 className="font-semibold flex items-center gap-2 pt-2">
            <Globe className="h-4 w-4" />
            Segment
          </h3>

          <Select value={segment} onValueChange={v => setSegment(v as CrmSegmentId)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {MUSEUM_SEGMENTS.map(s => (
                <SelectItem key={s.id} value={s.id}>
                  {s.label} — {s.desc}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {segmentConfig && (
            <div className="p-3 rounded-lg bg-muted text-xs space-y-1">
              <div className="font-medium">{segmentConfig.label}</div>
              <div className="text-muted-foreground">{segmentConfig.description}</div>
              <div className="flex gap-3 mt-1">
                <span>POIs: {segmentConfig.typicalPoiCount[0]}–{segmentConfig.typicalPoiCount[1]}</span>
                <span>Sprachen: {segmentConfig.typicalLanguages[0]}–{segmentConfig.typicalLanguages[1]}</span>
                <span>Empf. Tier: {segmentConfig.recommendedTier}</span>
              </div>
            </div>
          )}

          <div className="flex justify-end pt-2">
            <Button onClick={handleCreateLead} disabled={loading || !companyName || !contactEmail}>
              {loading ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Erstelle...</>
              ) : (
                <><Send className="h-4 w-4 mr-2" /> Einladung erstellen</>
              )}
            </Button>
          </div>
        </Card>
      )}

      {/* Step 3: Done — Show invite link */}
      {step === 'done' && (
        <Card className="p-6 space-y-4">
          <div className="text-center py-4">
            <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center mx-auto mb-3">
              <Check className="h-6 w-6 text-emerald-600" />
            </div>
            <h3 className="font-semibold text-lg">Einladung erstellt!</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Sende diesen Link an <strong>{contactName || companyName}</strong>.
            </p>
          </div>

          <div className="space-y-2">
            <Label>Einladungslink</Label>
            <div className="flex gap-2">
              <Input value={inviteUrl} readOnly className="text-xs font-mono" />
              <Button size="icon" variant="outline" onClick={handleCopy}>
                {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
              </Button>
              <Button size="icon" variant="outline" onClick={() => window.open(inviteUrl, '_blank')}>
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Einladungscode</Label>
            <Input value={inviteCode} readOnly className="font-mono text-center text-lg tracking-widest" />
          </div>

          <div className="p-3 rounded-lg bg-muted text-sm space-y-2">
            <p className="font-medium">Was passiert als naechstes?</p>
            <ol className="list-decimal list-inside space-y-1 text-muted-foreground text-xs">
              <li>Museum klickt den Link und sieht die personalisierte Landing Page</li>
              <li>Dort erfahren sie alles ueber Fintutto World fuer ihren Bereich</li>
              <li>Nach Registrierung erhalten sie Zugang zum Museum-Admin-Portal</li>
              <li>Sie laden ihre Inhalte hoch und die KI erstellt automatisch alle POS</li>
              <li>Fuehrungen werden erstellt, QR-Codes generiert — fertig!</li>
            </ol>
          </div>

          <div className="flex justify-between pt-2">
            <Button variant="outline" onClick={() => {
              setStep('info')
              setCompanyName('')
              setContactName('')
              setContactEmail('')
              setContactPhone('')
              setCity('')
              setInviteCode('')
              setInviteUrl('')
            }}>
              Weiteres Museum einladen
            </Button>
            <Button variant="outline" onClick={() => window.location.href = '/admin/museums'}>
              Zur Museumsliste
            </Button>
          </div>
        </Card>
      )}
    </div>
  )
}
