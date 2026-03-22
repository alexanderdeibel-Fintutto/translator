// Pricing Page Component — Displays all tiers in a 4-tab layout (Privat, Guide, Business, Cruise)
// Importable in both the translator app and the sales site.

import { useState } from 'react'
import { Link } from 'react-router-dom'
import { TIERS, SEGMENTS, getTiersBySegment, formatPrice, type TierId, type Segment } from '@/lib/tiers'
import { Check, X, ArrowRight } from 'lucide-react'

interface PricingPageProps {
  currentTierId?: TierId
  onSelectTier?: (tierId: TierId) => void
  showInternalMargins?: boolean // Only for admin view
  billingCycle?: 'monthly' | 'yearly'
}

export function PricingPage({ currentTierId = 'free', onSelectTier, showInternalMargins, billingCycle = 'monthly' }: PricingPageProps) {
  const [activeSegment, setActiveSegment] = useState<Segment>('personal')

  const tiers = getTiersBySegment(activeSegment)

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8">
      {/* Segment tabs */}
      <div className="flex justify-center gap-2 mb-8">
        {SEGMENTS.map((seg) => (
          <button
            key={seg.id}
            onClick={() => setActiveSegment(seg.id)}
            className={`px-6 py-3 rounded-lg font-medium transition-all ${
              activeSegment === seg.id
                ? 'bg-primary text-primary-foreground shadow-lg'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            {seg.label}
          </button>
        ))}
      </div>

      {/* Segment sales link */}
      {(['guide', 'event', 'cruise'] as Segment[]).includes(activeSegment) && (
        <div className="text-center mb-6">
          <Link
            to={`/sales/${activeSegment}`}
            className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
          >
            Mehr erfahren &amp; ROI berechnen
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      )}

      {/* Tier cards */}
      <div className={`grid gap-6 ${
        tiers.length === 2 ? 'grid-cols-1 md:grid-cols-2 max-w-3xl mx-auto' :
        tiers.length === 3 ? 'grid-cols-1 md:grid-cols-3' :
        'grid-cols-1 md:grid-cols-2'
      }`}>
        {tiers.map((tier) => {
          const isCurrent = tier.id === currentTierId
          const isPopular = !!tier.badge

          return (
            <div
              key={tier.id}
              className={`relative rounded-xl border-2 p-6 flex flex-col ${
                isPopular ? 'border-primary shadow-xl' : 'border-border'
              } ${isCurrent ? 'ring-2 ring-primary/50' : ''}`}
            >
              {tier.badge && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full">
                  {tier.badge}
                </span>
              )}

              <h3 className="text-xl font-bold">{tier.displayName}</h3>
              <p className="text-sm text-muted-foreground mt-1">{tier.description}</p>

              {/* Price */}
              <div className="mt-4 mb-6">
                {billingCycle === 'yearly' && tier.pricing.yearlyEur > 0 ? (
                  <>
                    <span className="text-3xl font-bold">{formatPrice(Math.round(tier.pricing.yearlyEur / 12 * 100) / 100)}</span>
                    <span className="text-muted-foreground text-sm">/Monat</span>
                    <div className="text-xs text-muted-foreground mt-1">
                      {formatPrice(tier.pricing.yearlyEur)}/Jahr — 2 Monate gratis
                    </div>
                    {tier.pricing.monthlyEur > 0 && (
                      <div className="text-xs text-muted-foreground/50 line-through mt-0.5">
                        statt {formatPrice(tier.pricing.monthlyEur)}/Monat
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <span className="text-3xl font-bold">{formatPrice(tier.pricing.monthlyEur)}</span>
                    {tier.pricing.monthlyEur > 0 && (
                      <span className="text-muted-foreground text-sm">/Monat</span>
                    )}
                    {tier.pricing.yearlyEur > 0 && (
                      <div className="text-xs text-green-600 dark:text-green-400 mt-1">
                        {formatPrice(tier.pricing.yearlyEur)}/Jahr spart 17%
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Key limits */}
              <div className="space-y-2 mb-6 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Max. Hörer</span>
                  <span className="font-medium">
                    {tier.limits.maxListeners === 0 ? 'Unbegrenzt' : tier.limits.maxListeners}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Sprachen</span>
                  <span className="font-medium">
                    {tier.limits.maxLanguages === 0 ? 'Alle 130+' : tier.limits.maxLanguages}
                    {tier.pricing.additionalLanguageEur > 0 && (
                      <span className="text-xs text-muted-foreground ml-1">
                        (+{formatPrice(tier.pricing.additionalLanguageEur)}/Spr.)
                      </span>
                    )}
                  </span>
                </div>
                {tier.limits.sessionMinutesPerMonth > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Session-Min. inkl.</span>
                    <span className="font-medium">
                      {tier.limits.sessionMinutesPerMonth.toLocaleString('de-DE')}
                    </span>
                  </div>
                )}
                {tier.pricing.overagePerMinuteEur > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Overage</span>
                    <span className="font-medium">
                      {formatPrice(tier.pricing.overagePerMinuteEur)}/Min.
                    </span>
                  </div>
                )}
              </div>

              {/* Feature list */}
              <div className="space-y-1.5 text-sm flex-1">
                <FeatureRow label="Live-Broadcasting" enabled={tier.features.broadcasting} />
                <FeatureRow label="Offline-Modus" enabled={tier.features.offlineMode} />
                <FeatureRow label="QR-Code Einladung" enabled={tier.features.qrCode} />
                <FeatureRow label="Custom Glossare" enabled={tier.features.customGlossaries} />
                <FeatureRow label="Pre-Translation" enabled={tier.features.preTranslation} />
                <FeatureRow label="White-Label" enabled={tier.features.whiteLabel} />
                <FeatureRow label="API-Zugang" enabled={tier.features.apiAccess !== 'none'} />

                <div className="flex items-center gap-2 pt-1">
                  <span className="text-muted-foreground">TTS-Qualität:</span>
                  <span className="font-medium capitalize">{tier.features.ttsQuality}</span>
                </div>
              </div>

              {/* Internal margin info (admin only) */}
              {showInternalMargins && (
                <div className="mt-4 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded text-xs">
                  <div>Support: {tier.supportLevel}</div>
                  {tier.sla && <div>SLA: {tier.sla}</div>}
                </div>
              )}

              {/* CTA Button */}
              <button
                onClick={() => onSelectTier?.(tier.id)}
                disabled={isCurrent}
                className={`mt-6 w-full py-3 rounded-lg font-medium transition-all ${
                  isCurrent
                    ? 'bg-muted text-muted-foreground cursor-not-allowed'
                    : isPopular
                      ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                      : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                }`}
              >
                {isCurrent ? 'Aktueller Plan' :
                 tier.pricing.monthlyEur === 0 ? 'Kostenlos starten' :
                 tier.pricing.monthlyEur >= 199 ? 'Kontakt aufnehmen' :
                 'Jetzt starten'}
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function FeatureRow({ label, enabled }: { label: string; enabled: boolean }) {
  return (
    <div className="flex items-center gap-2">
      {enabled ? (
        <Check className="w-4 h-4 text-green-500 shrink-0" />
      ) : (
        <X className="w-4 h-4 text-muted-foreground/30 shrink-0" />
      )}
      <span className={enabled ? '' : 'text-muted-foreground/50'}>{label}</span>
    </div>
  )
}
