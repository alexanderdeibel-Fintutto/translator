import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { useUser } from '@/context/UserContext'
import { PricingPage } from '@/components/pricing/PricingPage'
import { redirectToCheckout, isStripeConfigured } from '@/lib/stripe'
import { TIERS, type TierId } from '@/lib/tiers'

export default function PricingPageRoute() {
  const { tierId, isAuthenticated, setTier } = useUser()
  const navigate = useNavigate()
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly')

  async function handleSelectTier(selectedTierId: TierId) {
    if (!isAuthenticated) {
      navigate('/auth?redirect=/pricing')
      return
    }

    if (selectedTierId === 'free' || selectedTierId === tierId) {
      return
    }

    // When Stripe is not configured, activate tier directly for testing
    if (!isStripeConfigured()) {
      const tier = TIERS[selectedTierId]
      setTier(selectedTierId)
      toast.success(`${tier?.displayName ?? selectedTierId} wurde aktiviert (Testmodus — Stripe noch nicht verbunden)`)
      return
    }

    try {
      await redirectToCheckout({ tierId: selectedTierId, billingCycle })
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Fehler beim Checkout'
      toast.error(msg)
    }
  }

  return (
    <div className="py-6">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold">Preise & Pakete</h1>
        <p className="text-muted-foreground mt-2">
          Von kostenlos bis Enterprise — finde den Plan, der zu dir passt.
        </p>
      </div>

      {/* Test mode banner */}
      {!isStripeConfigured() && (
        <div className="max-w-2xl mx-auto mb-6 rounded-lg border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/20 px-4 py-3 text-sm text-amber-800 dark:text-amber-200">
          <strong>Testmodus:</strong> Stripe ist noch nicht verbunden. Du kannst Pläne zum Testen direkt aktivieren — es wird nichts berechnet.
        </div>
      )}

      {/* Billing cycle toggle */}
      <div className="flex justify-center mb-8">
        <div className="inline-flex items-center gap-1 p-1 rounded-lg bg-muted">
          <button
            onClick={() => setBillingCycle('monthly')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              billingCycle === 'monthly'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Monatlich
          </button>
          <button
            onClick={() => setBillingCycle('yearly')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              billingCycle === 'yearly'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Jährlich
            <span className="ml-1.5 text-xs text-green-600 dark:text-green-400 font-bold">-17%</span>
          </button>
        </div>
      </div>

      <PricingPage
        currentTierId={tierId}
        onSelectTier={handleSelectTier}
        billingCycle={billingCycle}
      />
    </div>
  )
}
