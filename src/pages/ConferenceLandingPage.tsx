// ConferenceLandingPage — Mobile-First Sales Page für Konferenzen & Events
// Route: /sales/conference

import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Mic, Globe2, Users, Zap, Shield, Headphones,
  Volume2, Clock, Languages, Radio, ArrowRight, ChevronRight,
  Check, Loader2, Wifi, FileText, QrCode,
  MessageCircleQuestion, Star
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createClient } from '@/lib/supabase-client'

// ─── Content ──────────────────────────────────────────────────────────────────

const STATS = [
  { value: '199 EUR', label: 'ab / Monat' },
  { value: '500',     label: 'Teilnehmer max.' },
  { value: '130+',    label: 'Sprachen (Pro)' },
  { value: '<1s',     label: 'Latenz' },
]

const FEATURES = [
  {
    icon: Radio,
    color: 'text-violet-400', bg: 'bg-violet-500/15',
    title: 'Live-Broadcasting',
    desc: '1 Speaker → bis zu 500 Teilnehmer · jeder liest/hört in seiner Sprache · QR-Code auf den Beamer.',
  },
  {
    icon: MessageCircleQuestion,
    color: 'text-sky-400', bg: 'bg-sky-500/15',
    title: 'Q&A-Moderation',
    desc: 'Teilnehmer stellen Fragen per Smartphone · Host moderiert die Inbox · freigegebene Fragen erscheinen bei allen in ihrer Sprache.',
  },
  {
    icon: Languages,
    color: 'text-emerald-400', bg: 'bg-emerald-500/15',
    title: 'Alle 130+ Sprachen (Pro)',
    desc: 'Basic: 20 Sprachen. Pro: alle 130+ Sprachen inklusive — kein Teilnehmer wird ausgeschlossen.',
  },
  {
    icon: Volume2,
    color: 'text-amber-400', bg: 'bg-amber-500/15',
    title: 'Chirp 3 HD Audio (Pro)',
    desc: 'Höchste Sprachqualität — Teilnehmer hören statt lesen. Ideal für Keynotes und Podiumsdiskussionen.',
  },
  {
    icon: FileText,
    color: 'text-blue-400', bg: 'bg-blue-500/15',
    title: 'Session-Protokoll',
    desc: 'Die gesamte Konferenz als Transkript (TXT/MD) mit Zeitstempeln und allen Übersetzungen.',
  },
  {
    icon: Wifi,
    color: 'text-orange-400', bg: 'bg-orange-500/15',
    title: 'Offline-Edge-Modus',
    desc: 'Lokaler Edge-Server im Kongresszentrum — unabhängig vom Messe-WLAN. Null Latenz, maximale Zuverlässigkeit.',
  },
  {
    icon: Shield,
    color: 'text-rose-400', bg: 'bg-rose-500/15',
    title: 'White-Label (Pro)',
    desc: 'Eigenes Konferenz-Branding · keine Fintutto-Logos · Ihre Domain, Ihre CI-Farben.',
  },
  {
    icon: QrCode,
    color: 'text-indigo-400', bg: 'bg-indigo-500/15',
    title: 'Kein App-Download',
    desc: 'QR-Code scannen → Browser öffnet sich → fertig. Keine IT-Infrastruktur, keine App-Installation.',
  },
]

const STEPS = [
  { step: '1', title: 'Plan buchen',          desc: 'In 5 Minuten einsatzbereit — kein IT-Projekt, keine Hardware.' },
  { step: '2', title: 'QR-Code projizieren',  desc: 'Auf die Leinwand oder in die Konferenz-App einbinden.' },
  { step: '3', title: 'Speaker spricht',      desc: 'Echtzeit-Übersetzung auf allen Geräten. Protokoll wird automatisch erstellt.' },
]

const PRICING = [
  {
    name: 'Conference Basic',
    price: '199 EUR/Mo',
    features: ['100 Teilnehmer · 3 Sessions', '20 Sprachen', '2.000 Min/Mo (~33h)', 'Neural2-TTS', 'Protokoll-Export'],
    cta: 'Basic starten',
    href: '/pricing',
    highlight: false,
  },
  {
    name: 'Conference Pro',
    price: '499 EUR/Mo',
    features: ['500 Teilnehmer · 10 Sessions', 'Alle 130+ Sprachen', '8.000 Min/Mo (~133h)', 'Chirp 3 HD + White-Label', 'Q&A-Moderation · API-Zugang'],
    cta: 'Pro starten',
    href: '/pricing',
    highlight: true,
  },
  {
    name: 'Congress White-Label',
    price: '2.500 EUR/Mo',
    features: ['Eigene Domain & CI', 'Lokaler Offline-Edge-Server', 'Unbegrenzte Teilnehmer', 'Audio-Anlage (XLR/Dante)', 'Dedizierter Support & SLA'],
    cta: 'Angebot anfragen',
    href: '/kontakt?type=demo',
    highlight: false,
  },
]

const USE_CASES = [
  'Wissenschaftliche Konferenzen — Vorträge in 20+ Sprachen',
  'Firmenmeetings — Internationale Teams & Board Meetings',
  'NGO-Konferenzen — Delegierte aus aller Welt',
  'Kirchentage & Synoden — Mehrsprachige Gottesdienste',
  'Politische Veranstaltungen — Bürgerversammlungen',
  'Webinare — Remote-Teilnehmer mit Live-Untertiteln',
]

// ─── Component ────────────────────────────────────────────────────────────────
export default function ConferenceLandingPage() {
  const [regName, setRegName] = useState('')
  const [regEmail, setRegEmail] = useState('')
  const [registering, setRegistering] = useState(false)
  const [registered, setRegistered] = useState(false)
  const [regError, setRegError] = useState<string | null>(null)

  async function handleRegister() {
    if (!regEmail) return
    setRegistering(true)
    setRegError(null)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithOtp({
        email: regEmail,
        options: {
          data: { organization: regName, segment: 'conference', source: 'landing_conference' },
          emailRedirectTo: `${window.location.origin}/auth`,
        },
      })
      if (error) throw error
      setRegistered(true)
    } catch (err: unknown) {
      setRegError(err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten.')
    } finally {
      setRegistering(false)
    }
  }

  return (
    <div className="relative max-w-2xl mx-auto space-y-10 py-6 px-4 text-white">
{/* Hero */}
      <div className="relative text-center space-y-3 py-10 overflow-hidden rounded-2xl">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <img src="/fintutto-logo.svg" alt="" className="w-[280px] h-[280px] opacity-90" />
        </div>
        <div className="relative z-10 space-y-3">
          <span className="inline-block px-3 py-1 text-xs font-semibold rounded-full bg-white/20 text-white">
            90% günstiger als Simultandolmetscher
          </span>
          <h1 className="text-3xl sm:text-4xl font-bold leading-tight drop-shadow-lg">
            Ihre Konferenz spricht jede Sprache.
          </h1>
          <p className="text-base text-white/80 max-w-md mx-auto drop-shadow">
            Echtzeit-Übersetzung + Q&A-Moderation für Kongresse und Events. QR-Code scannen — fertig. Ab 199 EUR/Monat.
          </p>
          <div className="flex flex-col sm:flex-row gap-2 justify-center pt-1">
            <a href="#registrierung">
              <Button size="lg" className="w-full sm:w-auto gap-2">
                Kostenlos testen <ArrowRight className="h-4 w-4" />
              </Button>
            </a>
            <Link to="/live">
              <Button size="lg" variant="outline" className="w-full sm:w-auto border-white/30 text-white hover:bg-white/10">
                Live-Demo starten
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {STATS.map((s, i) => (
          <div key={i} className="text-center p-3 rounded-xl bg-black/25 backdrop-blur-md border border-white/15">
            <div className="text-xl font-bold text-sky-300">{s.value}</div>
            <div className="text-[11px] text-white/65">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Features */}
      <div className="space-y-3">
        <h2 className="text-xl font-bold drop-shadow-lg">Was Fintutto kann</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {FEATURES.map((f, i) => {
            const Icon = f.icon
            return (
              <Card key={i} className="p-4 bg-black/25 backdrop-blur-md border-white/15 space-y-2">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-lg ${f.bg} flex items-center justify-center shrink-0`}>
                    <Icon className={`w-4 h-4 ${f.color}`} />
                  </div>
                  <h3 className="font-semibold text-sm leading-tight">{f.title}</h3>
                </div>
                <p className="text-xs text-white/70 leading-snug">{f.desc}</p>
              </Card>
            )
          })}
        </div>
      </div>

      {/* So funktioniert's */}
      <div className="space-y-3" id="so-funktionierts">
        <h2 className="text-xl font-bold drop-shadow-lg">In 3 Schritten</h2>
        <Card className="p-4 bg-black/25 backdrop-blur-md border-white/15 space-y-3">
          {STEPS.map((s, i) => (
            <div key={i} className="flex items-start gap-3">
              <span className="w-7 h-7 rounded-full bg-sky-500/25 text-sky-300 text-sm font-bold flex items-center justify-center shrink-0">{s.step}</span>
              <div>
                <p className="font-semibold text-sm">{s.title}</p>
                <p className="text-xs text-white/65">{s.desc}</p>
              </div>
            </div>
          ))}
        </Card>
      </div>

      {/* Anwendungsfälle */}
      <div className="space-y-3">
        <h2 className="text-xl font-bold drop-shadow-lg">Für welche Events?</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {USE_CASES.map((uc, i) => (
            <div key={i} className="flex items-start gap-2 p-3 rounded-xl bg-black/20 border border-white/12">
              <Check className="w-3.5 h-3.5 text-sky-300 mt-0.5 shrink-0" />
              <p className="text-xs text-white/80">{uc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Preise */}
      <div className="space-y-3">
        <h2 className="text-xl font-bold drop-shadow-lg">Preise</h2>
        <div className="space-y-3">
          {PRICING.map((p, i) => (
            <Card key={i} className={`p-4 backdrop-blur-md border ${p.highlight ? 'bg-sky-500/20 border-sky-400/40' : 'bg-black/25 border-white/15'}`}>
              <div className="flex items-start justify-between gap-3 mb-2">
                <div>
                  <h3 className="font-bold text-sm">{p.name}</h3>
                  <p className={`text-lg font-bold ${p.highlight ? 'text-sky-300' : 'text-white'}`}>{p.price}</p>
                </div>
                {p.highlight && <span className="text-[10px] bg-sky-400/20 text-sky-300 px-2 py-0.5 rounded-full font-semibold shrink-0">Empfohlen</span>}
              </div>
              <ul className="space-y-1 mb-3">
                {p.features.map((f, j) => (
                  <li key={j} className="flex items-start gap-1.5 text-xs text-white/80">
                    <Check className="w-3 h-3 text-sky-300 mt-0.5 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link to={p.href}>
                <Button size="sm" className={`w-full ${p.highlight ? '' : 'variant-outline border-white/30 bg-white/10 hover:bg-white/20'}`}>
                  {p.cta} <ChevronRight className="h-3 w-3 ml-1" />
                </Button>
              </Link>
            </Card>
          ))}
        </div>
      </div>

      {/* Trust Signals */}
      <div className="grid grid-cols-2 gap-2">
        {['E2E-verschlüsselt (AES-256-GCM)', 'DSGVO-konform', '87 automatisierte Tests', 'Made in Germany'].map((t, i) => (
          <div key={i} className="flex items-center gap-2 p-2.5 rounded-xl bg-black/20 border border-white/12">
            <Star className="w-3 h-3 text-sky-300 shrink-0" />
            <p className="text-[11px] text-white/75">{t}</p>
          </div>
        ))}
      </div>

      {/* Registrierung */}
      <div id="registrierung" className="space-y-3">
        <h2 className="text-xl font-bold drop-shadow-lg">Kostenlos testen</h2>
        <Card className="p-5 bg-black/25 backdrop-blur-md border-white/15">
          {registered ? (
            <div className="text-center space-y-2 py-4">
              <Check className="w-8 h-8 text-green-400 mx-auto" />
              <p className="font-semibold">Magic Link gesendet!</p>
              <p className="text-sm text-white/70">Bitte prüfen Sie Ihr Postfach.</p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="space-y-1">
                <Label className="text-xs text-white/70">Organisation (optional)</Label>
                <Input
                  value={regName}
                  onChange={e => setRegName(e.target.value)}
                  placeholder="Kongresszentrum / Agentur / Firma"
                  className="bg-black/20 border-white/20 text-white placeholder:text-white/40 text-sm"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-white/70">E-Mail-Adresse *</Label>
                <Input
                  type="email"
                  value={regEmail}
                  onChange={e => setRegEmail(e.target.value)}
                  placeholder="ihre@email.de"
                  className="bg-black/20 border-white/20 text-white placeholder:text-white/40 text-sm"
                />
              </div>
              {regError && <p className="text-xs text-red-400">{regError}</p>}
              <Button onClick={handleRegister} disabled={registering || !regEmail} className="w-full gap-2">
                {registering ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
                {registering ? 'Wird gesendet…' : 'Magic Link anfordern'}
              </Button>
              <p className="text-[11px] text-white/50 text-center">Kein Passwort · kein Abo · sofort loslegen</p>
            </div>
          )}
        </Card>
      </div>

      {/* CTA */}
      <div className="grid grid-cols-2 gap-2 py-2">
        <Link to="/features">
          <Button size="default" variant="outline" className="w-full text-sm border-white/30 text-white hover:bg-white/10">
            Alle Features <ChevronRight className="h-3 w-3" />
          </Button>
        </Link>
        <Link to="/compare">
          <Button size="default" variant="outline" className="w-full text-sm border-white/30 text-white hover:bg-white/10">
            Vergleich <ChevronRight className="h-3 w-3" />
          </Button>
        </Link>
      </div>

    </div>
  )
}
