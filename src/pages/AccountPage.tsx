import { useNavigate } from 'react-router-dom'
import { useUser } from '@/context/UserContext'
import { TIERS, formatPrice, type TierId } from '@/lib/tiers'
import { getRemainingSessionMinutes, getOverageCost } from '@/lib/usage-tracker'
import { Button } from '@/components/ui/button'
import { User, CreditCard, BarChart3, LogOut, Crown, ArrowRight } from 'lucide-react'

export default function AccountPage() {
  const { user, tier, tierId, usage, isAuthenticated, signOut } = useUser()
  const navigate = useNavigate()

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

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      <h1 className="text-2xl font-bold">Mein Konto</h1>

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

        {tier.pricing.monthlyEur > 0 && (
          <div className="flex items-center gap-2 text-sm mb-3">
            <CreditCard className="w-4 h-4 text-muted-foreground" />
            <span>{formatPrice(tier.pricing.monthlyEur)}/Monat</span>
          </div>
        )}

        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/pricing')}
          className="gap-2"
        >
          Plan ändern <ArrowRight className="w-4 h-4" />
        </Button>
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

      {/* Sign out */}
      <Button variant="outline" onClick={handleSignOut} className="gap-2 text-destructive hover:text-destructive">
        <LogOut className="w-4 h-4" /> Abmelden
      </Button>
    </div>
  )
}
