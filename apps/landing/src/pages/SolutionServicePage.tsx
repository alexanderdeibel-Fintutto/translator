/**
 * SolutionServicePage — /solutions/service
 *
 * General service counter solution for retail, public service desks,
 * trade fair booths, pharmacies, banks, government offices, etc.
 * (distinct from Hotel/Hospitality which has its own dedicated solution)
 */
import { Mic, Users, Zap, Globe, CheckCircle, ArrowRight, Building2, ShoppingBag, Landmark, Stethoscope } from 'lucide-react'

const STAFF_URL  = 'https://service-staff.fintutto.world'
const GUEST_URL  = 'https://service-guest.fintutto.world'
const SALES_URL  = 'https://sales.fintutto.world/service'

export default function SolutionServicePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white">
      {/* Hero */}
      <section className="px-4 pt-20 pb-16 text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-sm font-medium mb-6">
          <Building2 className="h-4 w-4" />
          Service Translator
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold mb-4 leading-tight">
          Sprachbarrieren am Schalter
          <span className="block text-blue-400"> sofort überwinden</span>
        </h1>
        <p className="text-lg text-white/70 mb-8">
          Bidirektionale Gesprächsübersetzung für Servicepunkte, Behörden, Einzelhandel,
          Messen und überall dort, wo Mitarbeiter direkt mit Kunden sprechen.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <a
            href={STAFF_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-blue-500 hover:bg-blue-400 font-semibold transition-colors"
          >
            <Mic className="h-4 w-4" />
            Mitarbeiter-App öffnen
          </a>
          <a
            href={GUEST_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 font-semibold transition-colors"
          >
            <Users className="h-4 w-4" />
            Gast-App öffnen
          </a>
        </div>
      </section>

      {/* Einsatzbereiche */}
      <section className="px-4 py-12 max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold text-center mb-8">Wo Service Translator hilft</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            { icon: Landmark,    title: 'Behörden & Ämter',       desc: 'Bürgerservice, Ausländerbehörde, Sozialamt — ohne Dolmetscher.' },
            { icon: ShoppingBag, title: 'Einzelhandel & Messen',  desc: 'Verkaufsgespräche, Produktberatung, Kassenbereich.' },
            { icon: Stethoscope, title: 'Apotheken & Praxen',     desc: 'Schnelle Erstberatung ohne Sprachbarriere.' },
            { icon: Building2,   title: 'Banken & Versicherungen', desc: 'Beratungsgespräche am Schalter oder im Büro.' },
          ].map(item => (
            <div key={item.title} className="flex gap-4 p-4 rounded-xl bg-white/5 border border-white/10">
              <item.icon className="h-6 w-6 text-blue-400 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold mb-1">{item.title}</h3>
                <p className="text-sm text-white/60">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="px-4 py-12 max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold text-center mb-8">Funktionen</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            { icon: Zap,          title: 'Echtzeit-Übersetzung',  desc: 'Sofortige Sprachübersetzung in beide Richtungen.' },
            { icon: Mic,          title: 'Service-Phrasen',       desc: 'Vorgefertigte Sätze für typische Servicegespräche.' },
            { icon: Globe,        title: '50+ Sprachen',          desc: 'Alle gängigen Sprachen inklusive Arabisch, Türkisch, Russisch.' },
            { icon: CheckCircle,  title: 'Kein App-Download',     desc: 'Gäste scannen QR-Code — fertig. Keine Installation nötig.' },
            { icon: Users,        title: 'Bidirektional',         desc: 'Mitarbeiter und Gast sprechen abwechselnd — natürliches Gespräch.' },
            { icon: Building2,    title: 'Multi-Schalter',        desc: 'Beliebig viele Servicepunkte in einer Organisation.' },
          ].map(f => (
            <div key={f.title} className="p-4 rounded-xl bg-white/5 border border-white/10 text-center">
              <f.icon className="h-6 w-6 text-blue-400 mx-auto mb-2" />
              <h3 className="font-semibold text-sm mb-1">{f.title}</h3>
              <p className="text-xs text-white/60">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing CTA */}
      <section className="px-4 py-12 max-w-2xl mx-auto text-center">
        <div className="p-8 rounded-2xl bg-white/5 border border-white/10">
          <h2 className="text-2xl font-bold mb-2">Kosten berechnen</h2>
          <p className="text-white/60 mb-6">
            Wie viele Servicepunkte? Wie viele Gespräche pro Monat?
            Unser ROI-Rechner zeigt euren konkreten Nutzen.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href={SALES_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-blue-500 hover:bg-blue-400 font-semibold transition-colors"
            >
              ROI berechnen
              <ArrowRight className="h-4 w-4" />
            </a>
            <a
              href={STAFF_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 font-semibold transition-colors"
            >
              Demo starten
            </a>
          </div>
          <p className="text-xs text-white/40 mt-4">Ab 29,90 EUR/Monat · 14 Tage kostenlos testen</p>
        </div>
      </section>
    </div>
  )
}
