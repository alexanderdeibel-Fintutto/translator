import {
  ArrowRight, Radio, Globe2, QrCode, Headphones,
  Smartphone, Subtitles, ChevronRight, Check
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

const APP_URL = 'https://translator.fintutto.cloud'

export default function AppListenerPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-16 py-8 px-4">
      {/* Hero */}
      <div className="relative text-center space-y-4 py-12 sm:py-16 overflow-hidden rounded-2xl">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <img src="/fintutto-logo.svg" alt="" className="w-[400px] h-[400px] sm:w-[550px] sm:h-[550px] opacity-[0.65]" />
        </div>
        <div className="relative z-10 space-y-4">
          <span className="inline-block px-3 py-1 text-xs font-semibold rounded-full bg-white/20 text-white">
            Fintutto Live
          </span>
          <h1 className="text-3xl sm:text-5xl font-bold leading-tight text-white drop-shadow-lg">
            Live-Uebersetzung empfangen.
          </h1>
          <p className="text-lg sm:text-xl text-white/80 max-w-2xl mx-auto drop-shadow">
            Session-Code eingeben, Sprache waehlen, zuhoeren. So einfach.
            Keine Installation, kein Account — einfach QR-Code scannen und mitlesen.
          </p>
          <a href={APP_URL} target="_blank" rel="noopener noreferrer">
            <Button size="lg" className="gap-2 bg-emerald-600 hover:bg-emerald-700">
              Session beitreten
              <ArrowRight className="h-4 w-4" />
            </Button>
          </a>
        </div>
      </div>

      {/* So funktioniert es */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-center">So funktioniert es</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            { step: '1', icon: QrCode, title: 'Code eingeben oder QR scannen', desc: 'Der Speaker zeigt einen QR-Code. Scannen oder 6-stelligen Code eingeben.' },
            { step: '2', icon: Globe2, title: 'Sprache waehlen', desc: 'Waehle deine Sprache aus 45 verfuegbaren Sprachen.' },
            { step: '3', icon: Headphones, title: 'Live mitlesen & zuhoeren', desc: 'Die Uebersetzung erscheint in Echtzeit. Optional mit Sprachausgabe.' },
          ].map((s, i) => {
            const Icon = s.icon
            return (
              <div key={i} className="text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto text-xl font-bold">
                  {s.step}
                </div>
                <Icon className="w-6 h-6 text-emerald-600 mx-auto" />
                <h3 className="font-semibold">{s.title}</h3>
                <p className="text-sm text-muted-foreground">{s.desc}</p>
              </div>
            )
          })}
        </div>
      </div>

      {/* Features */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-center">Features</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { icon: Smartphone, title: 'Kein Download noetig', desc: 'Laeuft als PWA direkt im Browser — auf jedem Smartphone, Tablet oder Laptop.' },
            { icon: Globe2, title: '45 Sprachen', desc: 'Inkl. Arabisch, Farsi, Dari, Tigrinya und weitere Migrationssprachen.' },
            { icon: Subtitles, title: 'Untertitel-Modus', desc: 'Grossschrift auf schwarzem Hintergrund — perfekt lesbar, auch bei Sonnenlicht.' },
            { icon: Headphones, title: 'Sprachausgabe', desc: 'Zuhoeren statt lesen. HD-Sprachausgabe in natuerlicher Qualitaet.' },
          ].map((feat, i) => {
            const Icon = feat.icon
            return (
              <Card key={i} className="p-5 space-y-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-emerald-600" />
                </div>
                <h3 className="font-semibold">{feat.title}</h3>
                <p className="text-sm text-muted-foreground">{feat.desc}</p>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Einsatz */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-center">Wann brauche ich diese App?</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl mx-auto">
          {[
            'Du bist Gast bei einer Stadtfuehrung und willst in deiner Sprache mitlesen',
            'Du besuchst eine Konferenz und brauchst Untertitel in deiner Sprache',
            'Du bist Passagier auf einem Kreuzfahrtschiff bei einer Exkursion',
            'Du bist bei einer Buergerversammlung und verstehst die Landessprache nicht',
          ].map((uc, i) => (
            <div key={i} className="flex items-start gap-2 p-3 rounded-lg bg-muted/30">
              <Check className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
              <span className="text-sm">{uc}</span>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="text-center space-y-4 py-4">
        <a href={APP_URL} target="_blank" rel="noopener noreferrer">
          <Button size="lg" className="gap-2 bg-emerald-600 hover:bg-emerald-700">
            Session beitreten
            <ArrowRight className="h-4 w-4" />
          </Button>
        </a>
        <p className="text-sm text-muted-foreground">
          Kostenlos. Kein Account noetig.
        </p>
      </div>
    </div>
  )
}
