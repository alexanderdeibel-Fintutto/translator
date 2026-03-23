/**
 * Contact Page
 *
 * Contact information, demo requests, and links.
 */

import { Link } from 'react-router-dom'
import {
  Mail, MapPin, Globe2, ArrowRight, ChevronRight,
  Building, Users, Palette, Presentation
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

const CONTACT_OPTIONS = [
  {
    icon: Users,
    title: 'Fuer Privatpersonen',
    desc: 'Kostenlos starten — 45 Sprachen, Offline-Modus, kein Account noetig.',
    cta: 'App oeffnen',
    url: 'https://consumer.guidetranslator.com',
    external: true,
  },
  {
    icon: Building,
    title: 'Fuer Unternehmen',
    desc: 'Demo anfragen — Enterprise-Loesungen fuer Hotels, Kliniken, Behoerden, Events.',
    cta: 'Demo anfragen',
    url: 'mailto:enterprise@fintutto.world',
    external: true,
  },
  {
    icon: Palette,
    title: 'Fuer Museen & Staedte',
    desc: 'Art Guide testen — KI-Audioguides, CMS, White-Label.',
    cta: 'Art Guide Portal',
    url: 'https://portal.artguide.fintutto.world',
    external: true,
  },
  {
    icon: Presentation,
    title: 'Fuer Investoren',
    desc: 'Pitch Deck, Zahlen, Roadmap — alles auf einen Blick.',
    cta: 'Investor Relations',
    url: '/investors',
    external: false,
  },
]

export default function ContactPage() {
  return (
    <div className="relative max-w-4xl mx-auto space-y-16 py-8 px-4 text-white">
      <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-0">
        <img src="/fintutto-logo.svg" alt="" className="w-[800px] h-[800px] sm:w-[1000px] sm:h-[1000px] opacity-[0.65]" />
      </div>

      {/* Hero */}
      <div className="relative text-center space-y-4 py-12 sm:py-16 overflow-hidden rounded-2xl">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <img src="/fintutto-logo.svg" alt="" className="w-[400px] h-[400px] sm:w-[550px] sm:h-[550px] opacity-95" />
        </div>
        <div className="relative z-10 space-y-4">
          <span className="inline-block px-3 py-1 text-xs font-semibold rounded-full bg-white/20 text-white">
            Kontakt
          </span>
          <h1 className="text-3xl sm:text-5xl font-bold leading-tight text-white drop-shadow-lg">
            Bereit, die Sprachbarriere<br />
            <span className="text-sky-300">zu durchbrechen?</span>
          </h1>
        </div>
      </div>

      {/* Contact Options */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {CONTACT_OPTIONS.map((opt, i) => {
          const Icon = opt.icon
          const content = (
            <Card className="p-6 space-y-3 bg-black/30 backdrop-blur-sm border-white/10 hover:bg-white/5 transition-colors h-full">
              <Icon className="w-8 h-8 text-sky-300" />
              <h3 className="font-bold text-lg">{opt.title}</h3>
              <p className="text-sm text-white/70">{opt.desc}</p>
              <Button size="sm" className="gap-1">
                {opt.cta} <ArrowRight className="w-3 h-3" />
              </Button>
            </Card>
          )
          return opt.external ? (
            <a key={i} href={opt.url} target="_blank" rel="noopener noreferrer">{content}</a>
          ) : (
            <Link key={i} to={opt.url}>{content}</Link>
          )
        })}
      </div>

      {/* Direct Contact */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-center drop-shadow-lg">Direkter Kontakt</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto">
          <Card className="p-5 text-center space-y-2 bg-black/30 backdrop-blur-sm border-white/10">
            <Mail className="w-6 h-6 text-sky-300 mx-auto" />
            <h3 className="font-semibold text-sm">E-Mail</h3>
            <a href="mailto:info@guidetranslator.com" className="text-xs text-sky-300 hover:underline">
              info@guidetranslator.com
            </a>
          </Card>
          <Card className="p-5 text-center space-y-2 bg-black/30 backdrop-blur-sm border-white/10">
            <MapPin className="w-6 h-6 text-sky-300 mx-auto" />
            <h3 className="font-semibold text-sm">Adresse</h3>
            <p className="text-xs text-white/70">
              Kolonie 2<br />
              18317 Saal<br />
              Deutschland
            </p>
          </Card>
          <Card className="p-5 text-center space-y-2 bg-black/30 backdrop-blur-sm border-white/10">
            <Globe2 className="w-6 h-6 text-sky-300 mx-auto" />
            <h3 className="font-semibold text-sm">Web</h3>
            <p className="text-xs text-white/70">
              fintutto.world<br />
              guidetranslator.com
            </p>
          </Card>
        </div>
      </div>

      {/* Company Info */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold drop-shadow-lg">Unternehmen</h2>
        <Card className="p-6 space-y-3 bg-black/30 backdrop-blur-sm border-white/10 max-w-lg mx-auto text-center">
          <p className="font-semibold">fintutto UG (haftungsbeschraenkt)</p>
          <p className="text-sm text-white/70">
            Geschaeftsfuehrer: Alexander Deibel<br />
            Kolonie 2, 18317 Saal, Deutschland<br />
            Gegruendet: Maerz 2026
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            <Link to="/impressum">
              <Button size="sm" variant="outline" className="gap-1 border-white/30 text-white hover:bg-white/10 text-xs">
                Impressum <ChevronRight className="w-3 h-3" />
              </Button>
            </Link>
            <Link to="/datenschutz">
              <Button size="sm" variant="outline" className="gap-1 border-white/30 text-white hover:bg-white/10 text-xs">
                Datenschutz <ChevronRight className="w-3 h-3" />
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  )
}
