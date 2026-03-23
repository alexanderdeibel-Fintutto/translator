/**
 * Roadmap Page
 *
 * From Q1/2026 to 2027 and beyond.
 */

import { Link } from 'react-router-dom'
import {
  Check, Clock, ChevronRight, Rocket,
  Users, Globe2, Building, Zap
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

const QUARTERS = [
  {
    period: 'Q1/2026',
    status: 'done',
    title: 'Foundation',
    color: 'bg-green-600',
    items: [
      '50 Repositories, 1.700+ Commits',
      'GuideTranslator: 16 App-Varianten',
      '45 Sprachen, 4-Tier-Architektur',
      'Art Guide: Visitor App + Portal/CMS',
      'UG-Gruendung (Maerz 2026)',
    ],
  },
  {
    period: 'Q2/2026',
    status: 'current',
    title: 'Launch & Traction',
    color: 'bg-sky-600',
    items: [
      'Stripe-Aktivierung → Erste zahlende Kunden',
      'Product Hunt + Hacker News Launch',
      '3 Foerderantraege eingereicht',
      'Pilotprojekte: Stadtfuehrer, Museum-Kooperation',
      'Landing Page mit allen Unterseiten',
    ],
  },
  {
    period: 'Q3/2026',
    status: 'planned',
    title: 'Expansion',
    color: 'bg-blue-600',
    items: [
      'City Guide als eigenstaendiges Produkt',
      'Erste Enterprise-Kunden (Behoerden, Kliniken)',
      'Team-Aufbau: 1-2 Entwickler',
      'iOS App Store Launch',
      'Erweiterte Analytics & Dashboards',
    ],
  },
  {
    period: 'Q4/2026',
    status: 'planned',
    title: 'Scale',
    color: 'bg-violet-600',
    items: [
      'Region Guide Launch',
      'White-Label-System fuer Museen und Staedte',
      '100+ zahlende Kunden',
      'Seed-Runde vorbereiten',
      'API-Partner-Programm (Beta)',
    ],
  },
  {
    period: '2027',
    status: 'future',
    title: 'Growth',
    color: 'bg-purple-600',
    items: [
      'Europaeische Expansion',
      'API-Partner-Programm (Public)',
      'Social Guide (Dating, Networking)',
      'Seed-Finanzierung',
      'Team: 5-10 Personen',
    ],
  },
]

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    done: 'bg-green-500/20 text-green-300',
    current: 'bg-sky-500/20 text-sky-300',
    planned: 'bg-white/10 text-white/60',
    future: 'bg-white/5 text-white/40',
  }
  const labels: Record<string, string> = {
    done: 'Abgeschlossen',
    current: 'Aktuell',
    planned: 'Geplant',
    future: 'Vision',
  }
  return (
    <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-full ${styles[status]}`}>
      {labels[status]}
    </span>
  )
}

export default function RoadmapPage() {
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
            Roadmap
          </span>
          <h1 className="text-3xl sm:text-5xl font-bold leading-tight text-white drop-shadow-lg">
            Von heute bis zur<br />
            <span className="text-sky-300">Marktfuehrerschaft.</span>
          </h1>
          <p className="text-lg text-white/80 max-w-2xl mx-auto drop-shadow">
            Der Weg vom MVP zum Oekosystem — Quartal fuer Quartal.
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { icon: Check, value: '50+', label: 'Repos deployed' },
          { icon: Rocket, value: '1.700+', label: 'Commits' },
          { icon: Users, value: '25+', label: 'Live Apps' },
          { icon: Clock, value: '41', label: 'Tage bis hier' },
        ].map((stat, i) => {
          const Icon = stat.icon
          return (
            <div key={i} className="text-center p-4 rounded-lg bg-black/30 backdrop-blur-sm">
              <Icon className="w-4 h-4 text-sky-300 mx-auto mb-1" />
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="text-xs text-white/60">{stat.label}</div>
            </div>
          )
        })}
      </div>

      {/* Timeline */}
      <div className="space-y-6">
        {QUARTERS.map((q, i) => (
          <Card key={i} className={`p-5 space-y-3 bg-black/30 backdrop-blur-sm border-white/10 ${q.status === 'current' ? 'ring-1 ring-sky-400' : ''}`}>
            <div className="flex items-center gap-3 flex-wrap">
              <div className={`w-10 h-10 rounded-lg ${q.color} flex items-center justify-center shrink-0`}>
                <span className="text-white font-bold text-xs">{q.period.slice(0, 2)}</span>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-bold">{q.period}</h3>
                  <span className="text-white/40">—</span>
                  <span className="text-sm text-white/70">{q.title}</span>
                </div>
              </div>
              <StatusBadge status={q.status} />
            </div>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 ml-13">
              {q.items.map((item, j) => (
                <li key={j} className="flex items-start gap-2 text-sm">
                  {q.status === 'done' ? (
                    <Check className="w-3.5 h-3.5 text-green-400 mt-0.5 shrink-0" />
                  ) : (
                    <div className="w-3.5 h-3.5 rounded-full border border-white/30 mt-0.5 shrink-0" />
                  )}
                  <span className="text-white/70">{item}</span>
                </li>
              ))}
            </ul>
          </Card>
        ))}
      </div>

      {/* CTA */}
      <div className="text-center space-y-4 py-4">
        <p className="text-white/70">Willst du Teil der Reise sein?</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/investors">
            <Button size="lg" className="gap-2 w-full sm:w-auto">
              Investor Relations <ChevronRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link to="/contact">
            <Button size="lg" variant="outline" className="gap-2 w-full sm:w-auto border-white/30 text-white hover:bg-white/10">
              Kontakt <ChevronRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
