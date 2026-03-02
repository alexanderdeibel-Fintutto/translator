// UpgradePrompt — Soft paywall shown when a user hits a tier limit.
// Appears inline (not a modal) to avoid interruption. Shows what they hit,
// what the next tier offers, and a clear CTA.

import { Link } from 'react-router-dom'
import { ArrowRight, Crown, Zap, Users, Globe2, Mic } from 'lucide-react'
import { getUpgradeTier, formatPrice, type TierId } from '@/lib/tiers'

export type LimitType = 'listeners' | 'languages' | 'session_minutes' | 'daily_translations' | 'feature_locked'

interface UpgradePromptProps {
  tierId: TierId
  limitType: LimitType
  featureName?: string
  className?: string
}

const LIMIT_CONFIG: Record<LimitType, { icon: typeof Crown; title: string; description: (tierName: string) => string }> = {
  listeners: {
    icon: Users,
    title: 'Hörer-Limit erreicht',
    description: (name) => `Dein ${name}-Plan ist ausgelastet. Upgrade für mehr gleichzeitige Hörer.`,
  },
  languages: {
    icon: Globe2,
    title: 'Sprach-Limit erreicht',
    description: (name) => `Dein ${name}-Plan unterstützt nur eine begrenzte Anzahl Sprachen. Upgrade für mehr.`,
  },
  session_minutes: {
    icon: Mic,
    title: 'Session-Minuten aufgebraucht',
    description: (name) => `Deine inkludierten Minuten im ${name}-Plan sind verbraucht.`,
  },
  daily_translations: {
    icon: Zap,
    title: 'Tageslimit erreicht',
    description: (name) => `Du hast das Übersetzungslimit deines ${name}-Plans für heute erreicht.`,
  },
  feature_locked: {
    icon: Crown,
    title: 'Premium-Feature',
    description: () => `Dieses Feature ist in deinem aktuellen Plan nicht enthalten.`,
  },
}

export function UpgradePrompt({ tierId, limitType, featureName, className = '' }: UpgradePromptProps) {
  const upgradeTier = getUpgradeTier(tierId)
  if (!upgradeTier) return null

  const config = LIMIT_CONFIG[limitType]
  const Icon = config.icon
  const title = featureName ? `${featureName} — ${config.title}` : config.title

  return (
    <div className={`rounded-xl border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/20 p-4 ${className}`}>
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-lg bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center shrink-0">
          <Icon className="w-5 h-5 text-amber-600 dark:text-amber-400" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-sm">{title}</h4>
          <p className="text-xs text-muted-foreground mt-0.5">
            {config.description(upgradeTier.displayName)}
          </p>
          <div className="flex items-center gap-3 mt-3">
            <Link
              to="/pricing"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors"
            >
              <Crown className="w-3.5 h-3.5" />
              {upgradeTier.displayName} ab {formatPrice(upgradeTier.pricing.monthlyEur)}/Mo
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
