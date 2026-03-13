// Billing warning banners — shown on AccountPage and optionally app-wide.
// Alerts users about payment failures, trial ending, and account suspension.

import { AlertTriangle, Ban, Clock, CreditCard, ExternalLink } from 'lucide-react'
import { openCustomerPortal } from '@/lib/stripe'
import { toast } from 'sonner'

interface BillingAlertsProps {
  subscriptionStatus: string | null
  isSuspended: boolean
  billingPeriodEnd: string | null
}

export default function BillingAlerts({ subscriptionStatus, isSuspended, billingPeriodEnd }: BillingAlertsProps) {
  async function handleUpdatePayment() {
    try {
      await openCustomerPortal()
    } catch {
      toast.error('Kundenportal konnte nicht geoeffnet werden')
    }
  }

  // Account suspended — highest priority
  if (isSuspended) {
    return (
      <div className="rounded-xl border-2 border-destructive bg-destructive/10 p-4 flex items-start gap-3">
        <Ban className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
        <div className="flex-1">
          <div className="font-semibold text-destructive text-sm">Konto gesperrt</div>
          <div className="text-xs text-muted-foreground mt-1">
            Dein Konto wurde aufgrund ausstehender Zahlungen gesperrt.
            Bitte aktualisiere deine Zahlungsmethode, um den Zugang wiederherzustellen.
          </div>
          <button
            onClick={handleUpdatePayment}
            className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-destructive hover:underline"
          >
            <CreditCard className="w-3.5 h-3.5" /> Zahlungsmethode aktualisieren
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>
      </div>
    )
  }

  // Payment failed — past_due
  if (subscriptionStatus === 'past_due') {
    return (
      <div className="rounded-xl border border-amber-400 dark:border-amber-600 bg-amber-50 dark:bg-amber-950/20 p-4 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
        <div className="flex-1">
          <div className="font-semibold text-amber-700 dark:text-amber-300 text-sm">Zahlung fehlgeschlagen</div>
          <div className="text-xs text-muted-foreground mt-1">
            Deine letzte Zahlung konnte nicht verarbeitet werden. Bitte aktualisiere deine
            Zahlungsmethode innerhalb von 7 Tagen, um eine Sperrung zu vermeiden.
          </div>
          <button
            onClick={handleUpdatePayment}
            className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-amber-700 dark:text-amber-300 hover:underline"
          >
            <CreditCard className="w-3.5 h-3.5" /> Zahlungsmethode aktualisieren
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>
      </div>
    )
  }

  // Trial ending soon
  if (subscriptionStatus === 'trial_ending') {
    const endDate = billingPeriodEnd ? new Date(billingPeriodEnd).toLocaleDateString('de-DE') : null
    return (
      <div className="rounded-xl border border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-950/20 p-4 flex items-start gap-3">
        <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
        <div className="flex-1">
          <div className="font-semibold text-blue-700 dark:text-blue-300 text-sm">Testphase endet bald</div>
          <div className="text-xs text-muted-foreground mt-1">
            Deine Testphase endet {endDate ? `am ${endDate}` : 'in Kuerze'}.
            Danach wird dein Abo automatisch verlaengert.
          </div>
        </div>
      </div>
    )
  }

  return null
}
