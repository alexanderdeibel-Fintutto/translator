import { useNavigate } from 'react-router-dom'
import { useUser } from '@/context/UserContext'
import { PricingPage } from '@/components/pricing/PricingPage'
import type { TierId } from '@/lib/tiers'

export default function PricingPageRoute() {
  const { tierId, isAuthenticated } = useUser()
  const navigate = useNavigate()

  function handleSelectTier(selectedTierId: TierId) {
    if (!isAuthenticated) {
      navigate('/auth?redirect=/pricing')
      return
    }
    // For paid tiers, redirect to Stripe checkout (placeholder)
    // For free tier, just switch
    if (selectedTierId === 'free') {
      return
    }
    // TODO: Stripe checkout integration
    navigate(`/account?upgrade=${selectedTierId}`)
  }

  return (
    <div className="py-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold">Preise & Pakete</h1>
        <p className="text-muted-foreground mt-2">
          Von kostenlos bis Enterprise — finde den Plan, der zu dir passt.
        </p>
      </div>
      <PricingPage
        currentTierId={tierId}
        onSelectTier={handleSelectTier}
      />
    </div>
  )
}
