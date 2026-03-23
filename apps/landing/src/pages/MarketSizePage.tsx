/**
 * Market Size Page
 *
 * TAM / SAM / SOM visualization.
 * Global translation market analysis.
 */

import {
  Globe2, TrendingUp, Target, Compass
} from 'lucide-react'
import { Card } from '@/components/ui/card'

const MARKET_TIERS = [
  {
    label: 'TAM',
    name: 'Total Addressable Market',
    value: '65 Mrd USD',
    desc: 'Globaler Uebersetzungsmarkt (2025), davon 8 Mrd maschinelle Uebersetzung. 15% CAGR bis 2030.',
    color: 'from-sky-600 to-sky-400',
    size: 'w-64 h-64 sm:w-80 sm:h-80',
  },
  {
    label: 'SAM',
    name: 'Serviceable Addressable Market',
    value: '4,4 Mrd USD',
    desc: 'Tourismus-Uebersetzung + Event-Interpretation + Behoerden-Kommunikation + Museum-Audioguides.',
    color: 'from-blue-600 to-blue-400',
    size: 'w-48 h-48 sm:w-56 sm:h-56',
  },
  {
    label: 'SOM',
    name: 'Serviceable Obtainable Market',
    value: '44 Mio USD',
    desc: '1% des SAM in 3 Jahren — DACH-Fokus, dann Europa, dann Global.',
    color: 'from-violet-600 to-violet-400',
    size: 'w-32 h-32 sm:w-40 sm:h-40',
  },
]

const SEGMENTS = [
  { name: 'Tourismus-Uebersetzung', value: '2,1 Mrd USD', share: '48%' },
  { name: 'Event-Interpretation', value: '890 Mio USD', share: '20%' },
  { name: 'Behoerden-Kommunikation', value: '650 Mio USD', share: '15%' },
  { name: 'Museum-Audioguides', value: '420 Mio USD', share: '10%' },
  { name: 'Medizin-Kommunikation', value: '340 Mio USD', share: '7%' },
]

export default function MarketSizePage() {
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
            Marktanalyse
          </span>
          <h1 className="text-3xl sm:text-5xl font-bold leading-tight text-white drop-shadow-lg">
            Ein Markt mit<br />
            <span className="text-sky-300">65 Milliarden USD.</span>
          </h1>
          <p className="text-lg text-white/80 max-w-2xl mx-auto drop-shadow">
            Der globale Uebersetzungsmarkt waechst mit 15% pro Jahr.
            Maschinelle Uebersetzung ist der am schnellsten wachsende Sektor.
          </p>
        </div>
      </div>

      {/* TAM / SAM / SOM Circles */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-center drop-shadow-lg">TAM / SAM / SOM</h2>
        <div className="flex justify-center">
          <div className="relative flex items-center justify-center w-80 h-80 sm:w-96 sm:h-96">
            {/* TAM */}
            <div className="absolute w-full h-full rounded-full bg-gradient-to-br from-sky-600/20 to-sky-400/10 border border-sky-500/30 flex items-start justify-center pt-6">
              <div className="text-center">
                <span className="text-xs font-bold text-sky-300">TAM</span>
                <p className="text-lg sm:text-xl font-bold">65 Mrd USD</p>
              </div>
            </div>
            {/* SAM */}
            <div className="absolute w-56 h-56 sm:w-64 sm:h-64 rounded-full bg-gradient-to-br from-blue-600/25 to-blue-400/15 border border-blue-500/40 flex items-start justify-center pt-5">
              <div className="text-center mt-2">
                <span className="text-xs font-bold text-blue-300">SAM</span>
                <p className="text-base sm:text-lg font-bold">4,4 Mrd USD</p>
              </div>
            </div>
            {/* SOM */}
            <div className="absolute w-32 h-32 sm:w-36 sm:h-36 rounded-full bg-gradient-to-br from-violet-600/30 to-violet-400/20 border border-violet-500/50 flex items-center justify-center">
              <div className="text-center">
                <span className="text-xs font-bold text-violet-300">SOM</span>
                <p className="text-sm sm:text-base font-bold">44 Mio USD</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Details */}
      <div className="space-y-6">
        {MARKET_TIERS.map((tier, i) => (
          <Card key={i} className="p-5 space-y-2 bg-black/30 backdrop-blur-sm border-white/10">
            <div className="flex items-center gap-3">
              <span className={`px-2.5 py-1 text-xs font-bold rounded bg-gradient-to-r ${tier.color} text-white`}>
                {tier.label}
              </span>
              <span className="font-semibold text-lg">{tier.value}</span>
            </div>
            <h3 className="text-sm text-white/60">{tier.name}</h3>
            <p className="text-sm text-white/70">{tier.desc}</p>
          </Card>
        ))}
      </div>

      {/* SAM Breakdown */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-center drop-shadow-lg">SAM-Aufschluesselung</h2>
        <div className="space-y-3 max-w-lg mx-auto">
          {SEGMENTS.map((seg, i) => (
            <div key={i} className="flex items-center gap-4">
              <div className="flex-1">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-white/80">{seg.name}</span>
                  <span className="text-sky-300 font-medium">{seg.value}</span>
                </div>
                <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-sky-500 to-sky-400 rounded-full"
                    style={{ width: seg.share }}
                  />
                </div>
              </div>
              <span className="text-xs text-white/50 w-8 text-right">{seg.share}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Key Numbers */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { icon: Globe2, value: '1,2 Mrd', label: 'Internationale Reisende/Jahr' },
          { icon: TrendingUp, value: '15%', label: 'CAGR bis 2030' },
          { icon: Target, value: '68%', label: 'Sprechen Landessprache nicht' },
          { icon: Compass, value: '30.000+', label: 'Internationale Konferenzen/Jahr' },
        ].map((stat, i) => {
          const Icon = stat.icon
          return (
            <Card key={i} className="p-4 text-center space-y-2 bg-black/30 backdrop-blur-sm border-white/10">
              <Icon className="w-5 h-5 text-sky-300 mx-auto" />
              <div className="text-xl font-bold">{stat.value}</div>
              <p className="text-[10px] text-white/50">{stat.label}</p>
            </Card>
          )
        })}
      </div>

      {/* Growth Path */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-center drop-shadow-lg">Wachstumspfad</h2>
        <div className="max-w-md mx-auto space-y-3">
          {[
            { year: 'Jahr 1', focus: 'DACH-Fokus', desc: 'Deutschland, Oesterreich, Schweiz. Tourismus + Behoerden.' },
            { year: 'Jahr 2', focus: 'Europa', desc: 'EU-Expansion. Events + Medizin + Bildung.' },
            { year: 'Jahr 3', focus: 'Global', desc: 'Weltweiter Rollout. API-Partner. Enterprise.' },
          ].map((step, i) => (
            <Card key={i} className="p-4 flex items-start gap-4 bg-black/30 backdrop-blur-sm border-white/10">
              <div className="w-10 h-10 rounded-lg bg-sky-600 flex items-center justify-center shrink-0 font-bold text-white text-sm">
                {i + 1}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">{step.year}</h3>
                  <span className="text-xs text-sky-300">{step.focus}</span>
                </div>
                <p className="text-xs text-white/70">{step.desc}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
