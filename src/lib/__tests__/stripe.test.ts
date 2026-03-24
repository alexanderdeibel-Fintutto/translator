// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock supabase
const mockInvoke = vi.fn()
const mockGetSession = vi.fn()
vi.mock('../supabase', () => ({
  supabase: {
    functions: { invoke: (...args: any[]) => mockInvoke(...args) },
    auth: { getSession: () => mockGetSession() },
  },
}))

// Mock tiers
vi.mock('../tiers', () => ({
  TIERS: {
    free: {
      id: 'free',
      displayName: 'Kostenlos',
      pricing: {
        monthlyEur: 0,
        stripePriceIdMonthly: undefined,
        stripePriceIdYearly: undefined,
        overagePerMinuteEur: 0,
      },
    },
    guide_basic: {
      id: 'guide_basic',
      displayName: 'Guide Basic',
      pricing: {
        monthlyEur: 29,
        stripePriceIdMonthly: 'price_monthly_guide',
        stripePriceIdYearly: 'price_yearly_guide',
        overagePerMinuteEur: 0.15,
      },
    },
    internal_admin: {
      id: 'internal_admin',
      displayName: 'Admin',
      pricing: {
        monthlyEur: 0,
        stripePriceIdMonthly: undefined,
        stripePriceIdYearly: undefined,
        overagePerMinuteEur: 0,
      },
    },
  },
  isInternalTier: (tierId: string) => tierId.startsWith('internal_'),
}))

beforeEach(() => {
  vi.clearAllMocks()
  vi.unstubAllEnvs()
})

describe('stripe', () => {
  describe('isStripeConfigured()', () => {
    it('returns true when VITE_STRIPE_PUBLISHABLE_KEY is set', async () => {
      vi.stubEnv('VITE_STRIPE_PUBLISHABLE_KEY', 'pk_test_abc123')
      // Re-import to pick up env change
      const { isStripeConfigured } = await import('../stripe')
      expect(isStripeConfigured()).toBe(true)
    })

    it('returns false when key is missing', async () => {
      vi.stubEnv('VITE_STRIPE_PUBLISHABLE_KEY', '')
      const { isStripeConfigured } = await import('../stripe')
      expect(isStripeConfigured()).toBe(false)
    })
  })

  describe('redirectToCheckout()', () => {
    it('calls stripe-checkout edge function with tier and billing params', async () => {
      vi.stubEnv('VITE_STRIPE_PUBLISHABLE_KEY', 'pk_test_abc123')
      mockGetSession.mockResolvedValue({
        data: { session: { user: { id: 'user-1' } } },
      })
      mockInvoke.mockResolvedValue({
        data: { url: 'https://checkout.stripe.com/session-123' },
        error: null,
      })

      // Mock window.location.href assignment
      const locationSpy = vi.spyOn(window, 'location', 'get').mockReturnValue({
        ...window.location,
        origin: 'https://app.example.com',
        href: '',
      } as Location)

      const { redirectToCheckout } = await import('../stripe')

      await redirectToCheckout({
        tierId: 'guide_basic',
        billingCycle: 'monthly',
      })

      expect(mockInvoke).toHaveBeenCalledWith('stripe-checkout', {
        body: expect.objectContaining({
          priceId: 'price_monthly_guide',
          tierId: 'guide_basic',
          billingCycle: 'monthly',
        }),
      })

      locationSpy.mockRestore()
    })

    it('uses yearly price ID for yearly billing', async () => {
      vi.stubEnv('VITE_STRIPE_PUBLISHABLE_KEY', 'pk_test_abc123')
      mockGetSession.mockResolvedValue({
        data: { session: { user: { id: 'user-1' } } },
      })
      mockInvoke.mockResolvedValue({
        data: { url: 'https://checkout.stripe.com/session-456' },
        error: null,
      })

      const { redirectToCheckout } = await import('../stripe')

      await redirectToCheckout({
        tierId: 'guide_basic',
        billingCycle: 'yearly',
      })

      expect(mockInvoke).toHaveBeenCalledWith('stripe-checkout', {
        body: expect.objectContaining({
          priceId: 'price_yearly_guide',
        }),
      })
    })

    it('skips checkout for internal tiers', async () => {
      vi.stubEnv('VITE_STRIPE_PUBLISHABLE_KEY', 'pk_test_abc123')
      const { redirectToCheckout } = await import('../stripe')

      await redirectToCheckout({
        tierId: 'internal_admin',
        billingCycle: 'monthly',
      })

      expect(mockInvoke).not.toHaveBeenCalled()
    })

    it('throws when not authenticated', async () => {
      vi.stubEnv('VITE_STRIPE_PUBLISHABLE_KEY', 'pk_test_abc123')
      mockGetSession.mockResolvedValue({
        data: { session: null },
      })

      const { redirectToCheckout } = await import('../stripe')

      await expect(
        redirectToCheckout({ tierId: 'guide_basic', billingCycle: 'monthly' })
      ).rejects.toThrow('Not authenticated')
    })

    it('throws on edge function error', async () => {
      vi.stubEnv('VITE_STRIPE_PUBLISHABLE_KEY', 'pk_test_abc123')
      mockGetSession.mockResolvedValue({
        data: { session: { user: { id: 'user-1' } } },
      })
      mockInvoke.mockResolvedValue({
        data: null,
        error: { message: 'Something went wrong' },
      })

      const { redirectToCheckout } = await import('../stripe')

      await expect(
        redirectToCheckout({ tierId: 'guide_basic', billingCycle: 'monthly' })
      ).rejects.toThrow('Checkout error')
    })
  })

  describe('openCustomerPortal()', () => {
    it('calls stripe-portal edge function', async () => {
      mockInvoke.mockResolvedValue({
        data: { url: 'https://billing.stripe.com/portal-123' },
        error: null,
      })

      const { openCustomerPortal } = await import('../stripe')
      await openCustomerPortal()

      expect(mockInvoke).toHaveBeenCalledWith('stripe-portal', {
        body: expect.objectContaining({
          returnUrl: expect.stringContaining('/account'),
        }),
      })
    })

    it('throws on portal error', async () => {
      mockInvoke.mockResolvedValue({
        data: null,
        error: { message: 'Portal unavailable' },
      })

      const { openCustomerPortal } = await import('../stripe')

      await expect(openCustomerPortal()).rejects.toThrow('Portal error')
    })
  })
})
