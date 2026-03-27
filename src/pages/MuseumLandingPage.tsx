// Museum Landing Page — Personalized invite landing for museum segments
// Renders segment-specific content from fintutto-world/landing-pages config

import { useParams, useSearchParams, Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Headphones, MessageCircle, Globe, BarChart3, Map, Route,
  QrCode, Palette, Shield, Users, ArrowRight, Check, Star,
  Sparkles, Smartphone, Loader2, Building2, Landmark,
} from 'lucide-react'
import type { CrmSegmentId } from '@/lib/fintutto-world/crm-segments'
import { CRM_SEGMENTS } from '@/lib/fintutto-world/crm-segments'

const ICON_MAP: Record<string, typeof Headphones> = {
  headphones: Headphones,
  'message-circle': MessageCircle,
  globe: Globe,
  'bar-chart': BarChart3,
  map: Map,
  route: Route,
  plug: QrCode,
  palette: Palette,
  shield: Shield,
  users: Users,
  sparkles: Sparkles,
  smartphone: Smartphone,
  building: Building2,
  landmark: Landmark,
}

// Feature definitions per segment (museums + cities + regions)
const SEGMENT_FEATURES: Record<string, { icon: string; title: string; desc: string }[]> = {
  museum_small: [
    { icon: 'headphones', title: 'KI-Audioguide', desc: 'Persoenliche Fuehrungen in ueber 30 Sprachen, automatisch aus Ihren Inhalten generiert.' },
    { icon: 'message-circle', title: 'KI-Chat fuer Besucher', desc: 'Gaeste stellen Fragen und erhalten fundierte Antworten zu jedem Exponat.' },
    { icon: 'globe', title: 'Automatisch mehrsprachig', desc: 'Erreichen Sie internationale Gaeste ohne teure Uebersetzungen.' },
    { icon: 'bar-chart', title: 'Besucheranalysen', desc: 'Verstehen Sie, welche Exponate beliebt sind und wie Gaeste sich bewegen.' },
    { icon: 'smartphone', title: 'Kein App-Download', desc: 'QR-Code scannen und los — laeuft direkt im Browser als PWA.' },
    { icon: 'sparkles', title: 'POS auf Knopfdruck', desc: 'Laden Sie Ihre Dokumente hoch, die KI erstellt automatisch alle Exponate.' },
  ],
  museum_medium: [
    { icon: 'headphones', title: 'Professioneller Audioguide', desc: 'Neurale Stimmen in Premium-Qualitaet mit personalisierter Tiefe.' },
    { icon: 'message-circle', title: 'KI-Wissensdialog', desc: 'Kontextbezogene Gespraeche zu Kunstwerken, Epochen und Kuenstlern.' },
    { icon: 'route', title: 'Smarte Touren', desc: 'KI-generierte Fuehrungen fuer Kinder, Experten und barrierefreie Besucher.' },
    { icon: 'map', title: 'Indoor-Navigation', desc: 'Interaktive Grundrisse mit Positionierung via QR, BLE oder WiFi.' },
    { icon: 'bar-chart', title: 'Tiefe Analysen', desc: 'Heatmaps, Verweildauer, Bewertungen und Sprachverteilung.' },
    { icon: 'users', title: 'Team-Management', desc: 'Redakteure, Fotografen und Kuratoren mit rollbasierten Rechten.' },
  ],
  museum_large: [
    { icon: 'headphones', title: 'Enterprise Audioguide', desc: 'Skalierbar fuer Tausende gleichzeitige Besucher mit personalisierten Touren.' },
    { icon: 'message-circle', title: 'KI-Wissensdialog', desc: 'Tiefgehende Konversationen zu Kunstwerken, Epochen und Techniken.' },
    { icon: 'globe', title: '30+ Sprachen', desc: 'Automatische Uebersetzungen mit kultureller Anpassung fuer jede Zielgruppe.' },
    { icon: 'plug', title: 'API & Integration', desc: 'Nahtlose Anbindung an bestehende Sammlungsmanagementsysteme.' },
    { icon: 'palette', title: 'Custom Branding', desc: 'Vollstaendig anpassbar an Ihre Corporate Identity. White-Label-Option.' },
    { icon: 'shield', title: 'Enterprise Security', desc: 'DSGVO-konform, SSO-Integration, dedizierter Support.' },
  ],
  city_small: [
    { icon: 'map', title: 'Digitaler Stadtfuehrer', desc: 'Alle Sehenswuerdigkeiten, Restaurants und Geheimtipps in einer personalisierten App.' },
    { icon: 'route', title: 'Smarte Stadttouren', desc: 'KI-generierte Rundgaenge basierend auf Interessen, Zeit und Wetter.' },
    { icon: 'globe', title: 'Internationale Gaeste', desc: 'Automatische Spracherkennung und kulturell angepasste Inhalte.' },
    { icon: 'smartphone', title: 'QR-Code am Ort', desc: 'Touristen scannen QR-Codes an Sehenswuerdigkeiten und erhalten sofort Infos.' },
    { icon: 'sparkles', title: 'POIs auf Knopfdruck', desc: 'Laden Sie bestehende Daten hoch — die KI erstellt alle Points of Interest.' },
    { icon: 'bar-chart', title: 'Tourismus-Insights', desc: 'Sehen Sie, welche Orte beliebt sind und wie Gaeste sich durch Ihre Stadt bewegen.' },
  ],
  city_medium: [
    { icon: 'map', title: 'Stadtportal', desc: 'Eine Plattform fuer alle Sehenswuerdigkeiten, Events, Gastronomie und Shopping.' },
    { icon: 'route', title: 'Themen-Routen', desc: 'Kulinarische Touren, Architektur-Walks, Familienausfluege — fuer jede Zielgruppe.' },
    { icon: 'users', title: 'Partner-Netzwerk', desc: 'Lokale Anbieter einbinden — Restaurants, Hotels, Aktivitaeten mit Buchungsoption.' },
    { icon: 'globe', title: 'Mehrsprachig', desc: 'Automatische Uebersetzungen fuer alle Inhalte in 30+ Sprachen.' },
    { icon: 'bar-chart', title: 'Tourismus-Analytics', desc: 'Besucherstroeme, beliebte Routen und Aufenthaltszeiten im Dashboard.' },
    { icon: 'sparkles', title: 'KI-Empfehlungen', desc: 'Personalisierte Vorschlaege basierend auf Interessen, Tageszeit und Wetter.' },
  ],
  city_large: [
    { icon: 'map', title: 'Smart Tourism Platform', desc: 'KI-personalisierte Stadterlebnisse fuer Millionen von Besuchern.' },
    { icon: 'route', title: 'Intelligente Navigation', desc: 'Multimodale Routen mit OEPNV-Integration und Echtzeit-Updates.' },
    { icon: 'users', title: 'Partner-Oekosystem', desc: 'Hunderte lokale Anbieter, Revenue-Sharing, Booking-Integration.' },
    { icon: 'bar-chart', title: 'Enterprise Analytics', desc: 'Besucherverteilung, Heatmaps, Saisontrends, Wirtschaftsimpact-Reports.' },
    { icon: 'palette', title: 'White-Label', desc: 'Vollstaendig unter Ihrer Marke — App-Name, Design, Domain.' },
    { icon: 'shield', title: 'Enterprise Security', desc: 'DSGVO-konform, SSO, API-Zugang, SLA mit dediziertem Support.' },
  ],
  region: [
    { icon: 'map', title: 'Regionales Portal', desc: 'Eine Plattform fuer alle Gemeinden, Museen und Attraktionen Ihrer Region.' },
    { icon: 'users', title: 'Partner-Management', desc: 'Jede Gemeinde verwaltet eigene Inhalte — Sie behalten den Ueberblick.' },
    { icon: 'route', title: 'Uebergreifende Touren', desc: 'Themenrouten quer durch die Region mit intelligenter Navigation.' },
    { icon: 'globe', title: 'Einheitliche Mehrsprachigkeit', desc: 'Konsistente Qualitaet in allen Sprachen fuer die gesamte Region.' },
    { icon: 'bar-chart', title: 'Regionale Analysen', desc: 'Besucherverteilung und Tourismustrends auf regionaler Ebene.' },
    { icon: 'sparkles', title: 'KI-Content-Scout', desc: 'Die KI findet und generiert POIs fuer alle Orte Ihrer Region automatisch.' },
  ],
  event: [
    { icon: 'landmark', title: 'Event-Navigator', desc: 'Programm, Aussteller und Aktivitaeten personalisiert auf einen Blick.' },
    { icon: 'map', title: 'Interaktiver Hallenplan', desc: 'Navigation zum naechsten Vortrag oder Stand — Indoor und Outdoor.' },
    { icon: 'sparkles', title: 'Smart Notifications', desc: 'Erinnerungen an favorisierte Programmpunkte und Networking-Matches.' },
    { icon: 'globe', title: 'Mehrsprachig', desc: 'Internationale Teilnehmer fuehlen sich sofort willkommen — 30+ Sprachen.' },
    { icon: 'headphones', title: 'Live-Uebersetzung', desc: 'Vortraege in Echtzeit uebersetzen mit dem Fintutto Translator.' },
    { icon: 'bar-chart', title: 'Event-Analytics', desc: 'Teilnehmerverhalten, beliebteste Sessions, Networking-Aktivitaet.' },
  ],
}

const HOW_IT_WORKS_MUSEUM = [
  { step: '1', title: 'Inhalte hochladen', desc: 'Laden Sie Ihre bestehenden Dokumente, CSVs oder PDFs hoch — oder verknuepfen Sie Ihre Website.' },
  { step: '2', title: 'KI erstellt POS', desc: 'Unsere KI analysiert Ihre Inhalte und erstellt automatisch alle Exponate mit Beschreibungen in 30+ Sprachen.' },
  { step: '3', title: 'Fuehrungen definieren', desc: 'Erstellen Sie Touren fuer verschiedene Zielgruppen oder lassen Sie die KI Vorschlaege generieren.' },
  { step: '4', title: 'QR-Codes drucken', desc: 'Generieren Sie QR-Codes fuer jedes Exponat und Ihr Museum — drucken und aufstellen.' },
  { step: '5', title: 'Gaeste erleben', desc: 'Besucher scannen den QR-Code und erleben Ihr Museum personalisiert — Audio, Chat, Karte.' },
]

const HOW_IT_WORKS_CITY = [
  { step: '1', title: 'Stadt-Profil anlegen', desc: 'Erstellen Sie Ihr Stadtprofil mit Logo, Sprachen und Branding — in wenigen Minuten.' },
  { step: '2', title: 'POIs importieren', desc: 'Laden Sie bestehende Daten hoch oder lassen Sie die KI Sehenswuerdigkeiten, Restaurants und Tipps generieren.' },
  { step: '3', title: 'Touren erstellen', desc: 'Definieren Sie Stadtrundgaenge fuer verschiedene Zielgruppen — oder die KI macht Vorschlaege.' },
  { step: '4', title: 'Partner einbinden', desc: 'Lokale Anbieter erhalten ihr eigenes Portal und koennen Inhalte und Angebote pflegen.' },
  { step: '5', title: 'QR-Codes verteilen', desc: 'An Sehenswuerdigkeiten, im Hotel, in der Tourist-Info — Gaeste scannen und erleben Ihre Stadt.' },
]

const HOW_IT_WORKS_REGION = [
  { step: '1', title: 'Region konfigurieren', desc: 'Legen Sie Ihre Region an und definieren Sie Sub-Entitaeten (Gemeinden, Museen, Attraktionen).' },
  { step: '2', title: 'Inhalte sammeln', desc: 'Jede Gemeinde pflegt eigene Inhalte — oder die KI generiert einen Grundstock an POIs.' },
  { step: '3', title: 'Uebergreifende Touren', desc: 'Erstellen Sie Themenrouten quer durch die Region — Wein, Kultur, Natur, Familie.' },
  { step: '4', title: 'Partner vernetzen', desc: 'Hotels, Restaurants und Aktivitaetsanbieter werden Teil des Oekosystems.' },
  { step: '5', title: 'Regional vermarkten', desc: 'Ein QR-Code, eine App, eine Plattform fuer die gesamte Region — mehrsprachig und personalisiert.' },
]

const TESTIMONIALS_MUSEUM = [
  { quote: 'Unsere Besucherzahlen sind um 40% gestiegen, seit wir den KI-Audioguide anbieten.', author: 'Maria S.', role: 'Museumsleiterin', company: 'Heimatmuseum Allgaeu' },
  { quote: 'Endlich koennen wir auch internationale Gaeste ansprechen — ohne extra Personal.', author: 'Thomas K.', role: 'Kurator', company: 'Stadtgalerie Freiburg' },
  { quote: 'Die KI-generierten Kinderfuehrungen sind ein Hit bei Familien.', author: 'Dr. Sarah L.', role: 'Paedagogische Leitung', company: 'Landesmuseum' },
]

const TESTIMONIALS_CITY = [
  { quote: 'Die App hat unsere Tourismus-Strategie komplett veraendert. Gaeste bleiben laenger und entdecken mehr.', author: 'Dr. Andrea M.', role: 'Tourismusdirektorin', company: 'Stadtverwaltung' },
  { quote: 'Unsere Partner lieben das System — sie koennen ihre Angebote selbst pflegen und erreichen neue Gaeste.', author: 'Michael R.', role: 'Stadtmarketing', company: 'Tourismus GmbH' },
  { quote: 'Die mehrsprachigen Stadttouren werden von internationalen Gaesten begeistert genutzt.', author: 'Lisa K.', role: 'Tourist-Info Leiterin', company: 'Stadtverwaltung' },
]

const TESTIMONIALS_REGION = [
  { quote: 'Zum ersten Mal haben alle Gemeinden eine einheitliche digitale Praesenz — das war ueberfaellig.', author: 'Dr. Peter W.', role: 'Geschaeftsfuehrer', company: 'Tourismusverband' },
  { quote: 'Die uebergreifenden Themenrouten verbinden unsere Orte und halten Gaeste laenger in der Region.', author: 'Sabine H.', role: 'Regionalleiterin', company: 'Ferienregion' },
  { quote: 'Der KI-Content-Scout hat in einer Woche mehr POIs erstellt als wir in einem Jahr geschafft haetten.', author: 'Frank B.', role: 'Projektleiter Digitalisierung', company: 'Landkreis' },
]

export default function MuseumLandingPage() {
  const { segment } = useParams<{ segment: string }>()
  const [searchParams] = useSearchParams()
  const inviteCode = searchParams.get('invite')
  const companyName = searchParams.get('company')

  const [registering, setRegistering] = useState(false)
  const [registered, setRegistered] = useState(false)
  const [regEmail, setRegEmail] = useState('')
  const [regName, setRegName] = useState('')

  const segmentId = (segment || 'museum_small') as CrmSegmentId
  const segmentConfig = CRM_SEGMENTS[segmentId] ?? CRM_SEGMENTS.museum_small
  const features = SEGMENT_FEATURES[segmentId] ?? SEGMENT_FEATURES.museum_small

  // Headline personalization per segment
  const HEADLINES: Partial<Record<CrmSegmentId, { h: string; s: string }>> = {
    museum_small: { h: 'Ihr Museum, neu erlebt — mit KI', s: 'Persoenliche Audioguides und KI-Gespraeche fuer jeden Besucher. In ueber 30 Sprachen.' },
    museum_medium: { h: 'Digitale Besuchererlebnisse fuer Ihr Museum', s: 'KI-Audioguides, interaktive Touren und Besucheranalysen — alles aus einer Plattform.' },
    museum_large: { h: 'Die Enterprise-Plattform fuer Museen', s: 'Skalierbare KI-Erlebnisse fuer Hunderttausende Besucher. DSGVO-konform und anpassbar.' },
    city_small: { h: 'Ihre Stadt. Digital erlebbar.', s: 'Ein persoenlicher Stadtfuehrer fuer jeden Gast — automatisch, mehrsprachig, intelligent.' },
    city_medium: { h: 'Smart Tourism fuer Ihre Stadt', s: 'KI-personalisierte Stadterlebnisse — von der Sehenswuerdigkeit bis zum Geheimtipp.' },
    city_large: { h: 'Die Smart Tourism Platform', s: 'KI-personalisierte Stadterlebnisse fuer Millionen von Besuchern. Enterprise-ready.' },
    region: { h: 'Eine Plattform fuer Ihre gesamte Region', s: 'Verbinden Sie alle Gemeinden, Museen und Attraktionen in einem intelligenten Tourismusportal.' },
    event: { h: 'Ihr Event. Persoenlich erlebt.', s: 'Intelligente Navigation, personalisierte Empfehlungen und mehrsprachige Gaestefuehrung.' },
  }

  const hl = HEADLINES[segmentId] ?? HEADLINES.museum_small!
  let headline = hl.h
  let subheadline = hl.s

  if (companyName) {
    headline = `${decodeURIComponent(companyName)} — neu erlebt mit KI`
  }

  async function handleRegister() {
    if (!regEmail) return
    setRegistering(true)
    // In production: call Supabase auth + CRM tracking
    await new Promise(r => setTimeout(r, 1500))
    setRegistered(true)
    setRegistering(false)
  }

  return (
    <div className="relative min-h-screen text-white">
{/* Hero */}
      <section className="relative z-10 py-16 md:py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          {inviteCode && (
            <Badge className="mb-4 text-sm bg-sky-500/20 border-sky-400/30 text-sky-200">
              Exklusive Einladung
            </Badge>
          )}
          <h1 className="text-3xl md:text-5xl font-bold mb-4 leading-tight drop-shadow-lg">
            {headline}
          </h1>
          <p className="text-lg md:text-xl text-white/75 mb-8 max-w-2xl mx-auto">
            {subheadline}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button size="lg" className="gradient-translator text-white shadow-lg" asChild>
              <a href="#registrierung">
                Kostenlos testen <ArrowRight className="h-4 w-4 ml-2" />
              </a>
            </Button>
            <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10" asChild>
              <a href="#so-funktionierts">So funktioniert&apos;s</a>
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="relative z-10 py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-12 drop-shadow-lg">
            {segmentId.startsWith('city') ? 'Alles fuer Ihre digitale Stadt' : segmentId === 'region' ? 'Alles fuer Ihre digitale Region' : segmentId === 'event' ? 'Alles fuer Ihr digitales Event' : 'Alles, was Ihr Museum braucht'}
          </h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {features.map((f, i) => {
              const Icon = ICON_MAP[f.icon] ?? Sparkles
              return (
                <div key={i} className="rounded-2xl bg-black/25 backdrop-blur-md border border-white/20 shadow-xl p-5">
                  <Icon className="h-7 w-7 text-sky-300 mb-3" />
                  <h3 className="font-semibold text-base mb-1.5 text-white drop-shadow">{f.title}</h3>
                  <p className="text-sm text-white/75">{f.desc}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="so-funktionierts" className="relative z-10 py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-12 drop-shadow-lg">
            In 5 Schritten {segmentId.startsWith('city') ? 'zur digitalen Stadt' : segmentId === 'region' ? 'zur digitalen Region' : segmentId === 'event' ? 'zum digitalen Event' : 'zum digitalen Museum'}
          </h2>
          <div className="space-y-4">
            {(segmentId.startsWith('city') ? HOW_IT_WORKS_CITY : segmentId === 'region' ? HOW_IT_WORKS_REGION : HOW_IT_WORKS_MUSEUM).map((s, i) => (
              <div key={i} className="flex gap-4 rounded-2xl bg-black/25 backdrop-blur-md border border-white/20 shadow-xl p-4">
                <div className="w-9 h-9 rounded-full gradient-translator text-white flex items-center justify-center font-bold flex-shrink-0 text-sm shadow">
                  {s.step}
                </div>
                <div>
                  <h3 className="font-semibold text-white drop-shadow">{s.title}</h3>
                  <p className="text-sm text-white/75">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="relative z-10 py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-12 drop-shadow-lg">
            Das sagen unsere Partner
          </h2>
          <div className="grid gap-4 md:grid-cols-3">
            {(segmentId.startsWith('city') ? TESTIMONIALS_CITY : segmentId === 'region' ? TESTIMONIALS_REGION : TESTIMONIALS_MUSEUM).map((t, i) => (
              <div key={i} className="rounded-2xl bg-black/25 backdrop-blur-md border border-white/20 shadow-xl p-5">
                <div className="flex gap-0.5 mb-3">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <Star key={j} className="h-4 w-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-sm mb-4 italic text-white/85">&ldquo;{t.quote}&rdquo;</p>
                <div>
                  <p className="font-semibold text-sm text-white drop-shadow">{t.author}</p>
                  <p className="text-xs text-white/60">{t.role}, {t.company}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Registration */}
      <section id="registrierung" className="relative z-10 py-16 px-4">
        <div className="max-w-md mx-auto">
          <div className="rounded-2xl bg-black/30 backdrop-blur-md border border-white/20 shadow-2xl p-6 sm:p-8">
            {registered ? (
              <div className="text-center py-4">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center mx-auto mb-4">
                  <Check className="h-6 w-6 text-emerald-300" />
                </div>
                <h3 className="text-xl font-bold mb-2 text-white drop-shadow">Willkommen!</h3>
                <p className="text-sm text-white/75 mb-4">
                  Wir haben Ihnen eine E-Mail mit Ihren Zugangsdaten gesendet.
                </p>
                <Button className="gradient-translator text-white shadow-lg" asChild>
                  <Link to="/auth">Zum Login <ArrowRight className="h-4 w-4 ml-2" /></Link>
                </Button>
              </div>
            ) : (
              <>
                <h3 className="text-xl font-bold text-center mb-2 text-white drop-shadow">Kostenlos starten</h3>
                <p className="text-sm text-white/70 text-center mb-6">
                  Testen Sie Fintutto World 30 Tage kostenlos — keine Kreditkarte nötig.
                </p>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-white/90">Museum / Organisation</Label>
                    <input
                      value={regName}
                      onChange={e => setRegName(e.target.value)}
                      placeholder="Name Ihres Museums"
                      className="w-full px-3 py-2.5 rounded-lg border border-white/20 bg-white/10 text-white placeholder-white/40 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white/90">E-Mail-Adresse</Label>
                    <input
                      type="email"
                      value={regEmail}
                      onChange={e => setRegEmail(e.target.value)}
                      placeholder="ihre@email.de"
                      className="w-full px-3 py-2.5 rounded-lg border border-white/20 bg-white/10 text-white placeholder-white/40 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400/50"
                    />
                  </div>
                  <Button className="w-full gradient-translator text-white shadow-lg font-semibold" onClick={handleRegister} disabled={registering || !regEmail}>
                    {registering ? (
                      <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Registriere...</>
                    ) : (
                      'Kostenlos registrieren'
                    )}
                  </Button>
                  <p className="text-xs text-white/50 text-center">
                    Mit der Registrierung akzeptieren Sie unsere <Link to="/datenschutz" className="text-sky-300 hover:underline">Datenschutzerklärung</Link>.
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
