/**
 * Sales Overview Page — sales.fintutto.world
 *
 * Entry point: Shows all available segments with direct links to
 * segment-specific landing pages with ROI calculators.
 * Mobile-first, concise, fast.
 */
import { Link } from 'react-router-dom'
import {
  GraduationCap, Building2, Heart, Hotel, Ship, Calendar,
  Users, Mic, MapPin, Briefcase, Stethoscope, ArrowRight,
  Calculator, ChevronRight
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

const SEGMENTS = [
  {
    slug: 'authority',
    icon: Building2,
    title: 'Behörden & Ämter',
    desc: 'Sachbearbeiter & Bürger — Dolmetscher-Kosten sparen',
    color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
    badge: 'Beliebt',
  },
  {
    slug: 'medical',
    icon: Stethoscope,
    title: 'Medizin & Pflege',
    desc: 'Arzt, Pflege, Apotheke — sichere Kommunikation',
    color: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
  },
  {
    slug: 'education',
    icon: GraduationCap,
    title: 'Schule & Bildung',
    desc: 'Lehrer & Schüler — Sprachbarrieren überwinden',
    color: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
  },
  {
    slug: 'hospitality',
    icon: Hotel,
    title: 'Hotel & Gastronomie',
    desc: 'Empfang, Service, Rezeption — internationale Gäste',
    color: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400',
  },
  {
    slug: 'cruise',
    icon: Ship,
    title: 'Kreuzfahrt',
    desc: 'Crew & Passagiere — an Bord und im Hafen',
    color: 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-400',
  },
  {
    slug: 'event',
    icon: Calendar,
    title: 'Events & Veranstaltungen',
    desc: 'Stadtfeste, Messen, Führungen — alle verstehen',
    color: 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400',
  },
  {
    slug: 'conference',
    icon: Mic,
    title: 'Konferenzen & Kongresse',
    desc: 'Simultanübersetzung für Fachveranstaltungen',
    color: 'bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400',
  },
  {
    slug: 'ngo',
    icon: Heart,
    title: 'NGO & Soziales',
    desc: 'Helfer & Klienten — Verständigung in der Not',
    color: 'bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-400',
  },
  {
    slug: 'guide',
    icon: MapPin,
    title: 'Stadtführer & Guides',
    desc: 'Touristen begeistern — in jeder Sprache',
    color: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400',
  },
  {
    slug: 'agency',
    icon: Briefcase,
    title: 'Agenturen & Reseller',
    desc: 'Fintutto als White-Label für Ihre Kunden',
    color: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300',
  },
  {
    slug: 'personal',
    icon: Users,
    title: 'Persönlich & Reise',
    desc: 'Für Privatpersonen — kostenlos starten',
    color: 'bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400',
  },
]

export default function SalesOverviewPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-10 space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
            <Calculator className="h-3.5 w-3.5" />
            ROI-Kalkulator & Preise
          </div>
          <h1 className="text-3xl font-bold">Für welche Branche?</h1>
          <p className="text-muted-foreground text-sm max-w-sm mx-auto">
            Wählen Sie Ihren Bereich — wir zeigen Ihnen den konkreten ROI und die passenden Preise.
          </p>
        </div>

        {/* Segment Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {SEGMENTS.map(({ slug, icon: Icon, title, desc, color, badge }) => (
            <Link key={slug} to={`/${slug}`}>
              <Card className="p-4 flex items-start gap-3 hover:shadow-md transition-all hover:border-primary/30 cursor-pointer group">
                <div className={`p-2 rounded-xl shrink-0 ${color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold">{title}</p>
                    {badge && (
                      <span className="text-xs px-1.5 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                        {badge}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{desc}</p>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 group-hover:text-primary transition-colors mt-0.5" />
              </Card>
            </Link>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center space-y-3 pt-4">
          <p className="text-sm text-muted-foreground">Noch Fragen? Wir beraten Sie gerne persönlich.</p>
          <Link to="/contact">
            <Button className="gap-2">
              Kontakt aufnehmen
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        {/* Footer */}
        <div className="flex justify-center gap-4 text-xs text-muted-foreground pt-4 border-t">
          <Link to="/impressum" className="hover:text-foreground">Impressum</Link>
          <Link to="/datenschutz" className="hover:text-foreground">Datenschutz</Link>
          <a href="https://fintutto.world" className="hover:text-foreground">fintutto.world</a>
        </div>
      </div>
    </div>
  )
}
