/**
 * Team Page
 *
 * Founder story — from zero to ecosystem in 41 days.
 */

import { Link } from 'react-router-dom'
import {
  ArrowRight, ChevronRight, Code, Zap,
  GitBranch, Rocket, Clock, Globe2
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

const TIMELINE = [
  { day: 'Tag 1', title: 'Erstes Repository', desc: 'JavaScript. Copy-Paste. Die Idee entsteht.' },
  { day: 'Tag 5', title: 'Migration zu TypeScript', desc: '12 Apps an einem Tag. Architektur-Grundlagen.' },
  { day: 'Tag 10', title: 'Konsolidierung', desc: 'Architektur-Plan. Monorepo. Vite Build-Pipeline.' },
  { day: 'Tag 20', title: 'Deep Tech', desc: 'BLE-Protokolle. WebAssembly. WASM-ML-Modelle. Offline-Engine.' },
  { day: 'Tag 30', title: 'Art Guide', desc: 'KI-Audioguide-System mit CMS und White-Label.' },
  { day: 'Tag 41', title: 'Oekosystem', desc: '50 Repos. 25+ deployed Domains. Patentfaehige Technologie.' },
]

export default function TeamPage() {
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
            Team
          </span>
          <h1 className="text-3xl sm:text-5xl font-bold leading-tight text-white drop-shadow-lg">
            Ein Gruender. Null Erfahrung.<br />
            <span className="text-sky-300">41 Tage. 50 Repositories.</span>
          </h1>
        </div>
      </div>

      {/* Founder */}
      <div className="space-y-6">
        <Card className="p-6 sm:p-8 space-y-4 bg-black/30 backdrop-blur-sm border-white/10">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-xl bg-sky-600 flex items-center justify-center shrink-0 text-2xl font-bold">
              AD
            </div>
            <div>
              <h2 className="text-xl font-bold">Alexander Deibel</h2>
              <p className="text-sm text-sky-300">Gruender & CEO — fintutto UG (haftungsbeschraenkt)</p>
            </div>
          </div>
          <p className="text-white/70 leading-relaxed">
            Von der Idee zum Oekosystem in 41 Tagen. Ohne technische Ausbildung.
            Mit KI-Tools (Claude, Lovable, GPT-Engineer) und dem Willen,
            ein Problem zu loesen, das Milliarden Menschen betrifft.
          </p>
        </Card>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { icon: GitBranch, value: '50+', label: 'Repositories' },
          { icon: Code, value: '1.719+', label: 'Commits' },
          { icon: Globe2, value: '25+', label: 'Deployed Apps' },
          { icon: Clock, value: '41', label: 'Tage' },
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

      {/* Learning Curve */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-center drop-shadow-lg">Die Lernkurve</h2>
        <div className="space-y-3 max-w-lg mx-auto">
          {TIMELINE.map((step, i) => (
            <Card key={i} className="p-4 flex items-start gap-4 bg-black/30 backdrop-blur-sm border-white/10">
              <div className="w-10 h-10 rounded-lg bg-sky-600 flex items-center justify-center shrink-0">
                <span className="text-white font-bold text-[10px]">{step.day}</span>
              </div>
              <div>
                <h3 className="font-semibold">{step.title}</h3>
                <p className="text-xs text-white/70">{step.desc}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Quote */}
      <div className="max-w-2xl mx-auto p-6 bg-sky-500/10 border border-sky-500/20 rounded-xl text-center">
        <p className="text-lg italic text-white/90 leading-relaxed">
          "Die meisten Startups planen ein Jahr, bevor sie eine App launchen.
          Wir haben in 41 Tagen 25 gelauncht."
        </p>
        <p className="text-sm text-white/50 mt-3">— Alexander Deibel, Gruender</p>
      </div>

      {/* KI Tools */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-center drop-shadow-lg">Gebaut mit KI</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { name: 'Claude (Anthropic)', role: 'Architektur, Code-Review, komplexe Features' },
            { name: 'Lovable', role: 'Rapid Prototyping, UI-Generierung' },
            { name: 'GPT-Engineer', role: 'Initiale App-Scaffolds, Iteration' },
          ].map((tool, i) => (
            <Card key={i} className="p-5 space-y-2 text-center bg-black/30 backdrop-blur-sm border-white/10">
              <Zap className="w-5 h-5 text-sky-300 mx-auto" />
              <h3 className="font-semibold text-sm">{tool.name}</h3>
              <p className="text-xs text-white/70">{tool.role}</p>
            </Card>
          ))}
        </div>
      </div>

      {/* Hiring */}
      <div className="space-y-4 text-center">
        <h2 className="text-2xl font-bold drop-shadow-lg">Wir suchen Verstaerkung</h2>
        <p className="text-white/70 max-w-xl mx-auto">
          Fuer Q3/2026 planen wir 1-2 Entwickler einzustellen.
          React, TypeScript, Supabase — wenn dich das reizt, melde dich.
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          {['React/TypeScript', 'Supabase/Postgres', 'Mobile (Capacitor)', 'KI/ML', 'DevOps'].map((skill, i) => (
            <span key={i} className="px-3 py-1 rounded-full bg-black/30 text-xs text-white/60">
              {skill}
            </span>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="text-center space-y-4 py-4">
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/investors">
            <Button size="lg" className="gap-2 w-full sm:w-auto">
              Investor Relations <ChevronRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link to="/contact">
            <Button size="lg" variant="outline" className="gap-2 w-full sm:w-auto border-white/30 text-white hover:bg-white/10">
              Kontakt aufnehmen <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
