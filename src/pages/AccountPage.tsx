import { useNavigate, useSearchParams } from 'react-router-dom'
import { useUser } from '@/context/UserContext'
import { formatPrice, isInternalTier } from '@/lib/tiers'
import { getRemainingSessionMinutes, getOverageCost } from '@/lib/usage-tracker'
import { openCustomerPortal } from '@/lib/stripe'
import { Button } from '@/components/ui/button'
import { User, CreditCard, BarChart3, LogOut, Crown, ArrowRight, CheckCircle2, Settings, Shield } from 'lucide-react'
import { toast } from 'sonner'
import OrganizationSettings from '@/components/settings/OrganizationSettings'

export default function AccountPage() {
  const { user, tier, tierId, usage, isAuthenticated, isSalesAgent, signOut } = useUser()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const checkoutStatus = searchParams.get('checkout')

  if (!isAuthenticated) {
    navigate('/auth?redirect=/account', { replace: true })
    return null
  }

  const remaining = getRemainingSessionMinutes(tierId)
  const overage = getOverageCost(tierId)
  const usagePercent = tier.limits.sessionMinutesPerMonth > 0
    ? Math.min(100, Math.round((usage.sessionMinutesUsed / tier.limits.sessionMinutesPerMonth) * 100))
    : 0

  async function handleSignOut() {
    await signOut()
    navigate('/', { replace: true })
  }

  async function handleManageSubscription() {
    try {
      await openCustomerPortal()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Fehler beim Öffnen des Kundenportals')
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      <h1 className="text-2xl font-bold">Mein Konto</h1>

      {/* Checkout success banner */}
      {checkoutStatus === 'success' && (
        <div className="rounded-xl border border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-950/20 p-4 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 shrink-0" />
          <div>
            <div className="font-medium text-sm">Upgrade erfolgreich!</div>
            <div className="text-xs text-muted-foreground">Dein Plan wurde aktiviert. Viel Spaß mit den neuen Features!</div>
          </div>
        </div>
      )}

      {/* Profile */}
      <div className="rounded-xl border border-border p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="w-5 h-5 text-primary" />
          </div>
          <div>
            <div className="font-medium">{user?.displayName || user?.email}</div>
            {user?.email && <div className="text-sm text-muted-foreground">{user.email}</div>}
          </div>
        </div>
      </div>

      {/* Current plan */}
      <div className="rounded-xl border border-border p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Crown className="w-5 h-5 text-primary" />
            <h2 className="font-semibold">Aktueller Plan</h2>
          </div>
          <span className="text-sm font-medium px-3 py-1 rounded-full bg-primary/10 text-primary">
            {tier.displayName}
          </span>
        </div>

        <div className="text-sm text-muted-foreground mb-4">{tier.description}</div>

        {isInternalTier(tierId) && (
          <div className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mb-3">
            Internes Konto — alle Features freigeschaltet, keine Kosten
          </div>
        )}

        {tier.pricing.monthlyEur > 0 && (
          <div className="flex items-center gap-2 text-sm mb-3">
            <CreditCard className="w-4 h-4 text-muted-foreground" />
            <span>{formatPrice(tier.pricing.monthlyEur)}/Monat</span>
          </div>
        )}

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/pricing')}
            className="gap-2"
          >
            Plan ändern <ArrowRight className="w-4 h-4" />
          </Button>
          {tier.pricing.monthlyEur > 0 && user?.stripeCustomerId && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleManageSubscription}
              className="gap-2"
            >
              <Settings className="w-4 h-4" /> Abo verwalten
            </Button>
          )}
        </div>
      </div>

      {/* Usage */}
      <div className="rounded-xl border border-border p-5">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="w-5 h-5 text-primary" />
          <h2 className="font-semibold">Verbrauch diesen Monat</h2>
        </div>

        <div className="space-y-3 text-sm">
          {tier.limits.sessionMinutesPerMonth > 0 && (
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-muted-foreground">Session-Minuten</span>
                <span className="font-medium">
                  {usage.sessionMinutesUsed} / {tier.limits.sessionMinutesPerMonth.toLocaleString('de-DE')}
                </span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    usagePercent > 90 ? 'bg-destructive' :
                    usagePercent > 70 ? 'bg-amber-500' : 'bg-primary'
                  }`}
                  style={{ width: `${usagePercent}%` }}
                />
              </div>
              {remaining !== Infinity && remaining >= 0 && (
                <div className="text-xs text-muted-foreground mt-1">
                  {remaining} Minuten verbleibend
                </div>
              )}
            </div>
          )}

          <div className="flex justify-between">
            <span className="text-muted-foreground">Übersetzungen</span>
            <span className="font-medium">{usage.translationsCount.toLocaleString('de-DE')}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-muted-foreground">Zeichen übersetzt</span>
            <span className="font-medium">{usage.translationCharsUsed.toLocaleString('de-DE')}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-muted-foreground">Max. Hörer gleichzeitig</span>
            <span className="font-medium">{usage.peakListeners}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-muted-foreground">Sprachen genutzt</span>
            <span className="font-medium">{usage.languagesUsed.length}</span>
          </div>

          {overage > 0 && (
            <div className="flex justify-between pt-2 border-t border-border">
              <span className="text-destructive font-medium">Overage-Kosten</span>
              <span className="text-destructive font-medium">{formatPrice(overage)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Admin access */}
      {isSalesAgent && (
        <div className="rounded-xl border border-primary/30 bg-primary/5 p-5">
          <div className="flex items-center gap-2 mb-3">
            <Shield className="w-5 h-5 text-primary" />
            <h2 className="font-semibold">Administration</h2>
          </div>
          <p className="text-sm text-muted-foreground mb-3">
            Du hast Admin-Zugang. Verwalte Benutzer, Leads und Sessions.
          </p>
          <Button
            variant="default"
            size="sm"
            onClick={() => navigate('/admin')}
            className="gap-2"
          >
            <Shield className="w-4 h-4" /> Admin CRM öffnen <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Organization */}
      {user?.organizationId && <OrganizationSettings />}

      {/* Sign out */}
      <Button variant="outline" onClick={handleSignOut} className="gap-2 text-destructive hover:text-destructive">
        <LogOut className="w-4 h-4" /> Abmelden
      </Button>
    </div>
  )
}
