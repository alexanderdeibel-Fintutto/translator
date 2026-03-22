// Tests for Fintutto World — Partner Portal
import { describe, it, expect, vi, beforeEach } from 'vitest'

// ---------------------------------------------------------------------------
// Mock supabase
// ---------------------------------------------------------------------------
const { mockFrom } = vi.hoisted(() => ({
  mockFrom: vi.fn(),
}))

vi.mock('../../supabase', () => ({
  supabase: {
    from: (...args: unknown[]) => mockFrom(...args),
  },
}))

import { getPartnerDashboard, upsertOffer, getPartnerAnalytics } from '../partner-portal'

beforeEach(() => {
  vi.clearAllMocks()
})

// ---------------------------------------------------------------------------
// Helpers: chainable query builder mock
// ---------------------------------------------------------------------------
function createChain(resolveValue: unknown) {
  const chain: Record<string, unknown> = {}
  chain.select = vi.fn(() => chain)
  chain.eq = vi.fn(() => chain)
  chain.single = vi.fn(() => Promise.resolve(resolveValue))
  chain.order = vi.fn(() => chain)
  chain.limit = vi.fn(() => chain)
  chain.gte = vi.fn(() => chain)
  chain.insert = vi.fn(() => chain)
  chain.update = vi.fn(() => chain)
  // Make the chain itself thenable for Promise.all
  chain.then = (resolve: (v: unknown) => void, reject?: (e: unknown) => void) =>
    Promise.resolve(resolveValue).then(resolve, reject)
  return chain
}

// ---------------------------------------------------------------------------
// getPartnerDashboard
// ---------------------------------------------------------------------------
describe('getPartnerDashboard', () => {
  it('should return dashboard with aggregated data', async () => {
    const partnerChain = createChain({ data: { id: 'p1', name: 'Partner A' } })
    const offersChain = createChain({ data: [{ id: 'o1' }, { id: 'o2' }] })
    const bookingsChain = createChain({
      data: [
        { id: 'b1', total_eur: 100, created_at: '2025-01-01' },
        { id: 'b2', total_eur: 200, created_at: '2025-01-02' },
      ],
    })
    const reviewsChain = createChain({
      data: [{ rating: 4 }, { rating: 5 }, { rating: 3 }],
    })

    let callIdx = 0
    mockFrom.mockImplementation(() => {
      const chains = [partnerChain, offersChain, bookingsChain, reviewsChain]
      return chains[callIdx++]
    })

    const result = await getPartnerDashboard('p1')
    expect(result).not.toBeNull()
    expect(result!.partner).toEqual({ id: 'p1', name: 'Partner A' })
    expect(result!.activeOffers).toBe(2)
    expect(result!.totalBookings).toBe(2)
    expect(result!.totalRevenue).toBe(300)
    expect(result!.reviews.avg).toBe(4)
    expect(result!.reviews.count).toBe(3)
  })

  it('should return null when partner is not found', async () => {
    const partnerChain = createChain({ data: null })
    const emptyChain = createChain({ data: [] })

    let callIdx = 0
    mockFrom.mockImplementation(() => {
      const chains = [partnerChain, emptyChain, emptyChain, emptyChain]
      return chains[callIdx++]
    })

    const result = await getPartnerDashboard('nonexistent')
    expect(result).toBeNull()
  })

  it('should handle empty reviews with avg 0', async () => {
    const partnerChain = createChain({ data: { id: 'p1' } })
    const emptyChain = createChain({ data: [] })

    let callIdx = 0
    mockFrom.mockImplementation(() => {
      const chains = [partnerChain, emptyChain, emptyChain, emptyChain]
      return chains[callIdx++]
    })

    const result = await getPartnerDashboard('p1')
    expect(result).not.toBeNull()
    expect(result!.reviews.avg).toBe(0)
    expect(result!.reviews.count).toBe(0)
  })

  it('should handle null data arrays gracefully', async () => {
    const partnerChain = createChain({ data: { id: 'p1' } })
    const nullChain = createChain({ data: null })

    let callIdx = 0
    mockFrom.mockImplementation(() => {
      const chains = [partnerChain, nullChain, nullChain, nullChain]
      return chains[callIdx++]
    })

    const result = await getPartnerDashboard('p1')
    expect(result).not.toBeNull()
    expect(result!.activeOffers).toBe(0)
    expect(result!.totalBookings).toBe(0)
    expect(result!.totalRevenue).toBe(0)
    expect(result!.recentBookings).toEqual([])
  })
})

// ---------------------------------------------------------------------------
// upsertOffer
// ---------------------------------------------------------------------------
describe('upsertOffer', () => {
  it('should insert a new offer when no id provided', async () => {
    const chain = createChain(undefined) // unused for thenable
    ;(chain.insert as ReturnType<typeof vi.fn>).mockReturnValue({
      select: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({ data: { id: 'new-offer-1' }, error: null }),
      }),
    })
    mockFrom.mockReturnValue(chain)

    const result = await upsertOffer('p1', {
      title: 'New Offer',
      description: 'Desc',
      price_eur: 99,
      valid_from: '2025-01-01',
      valid_until: '2025-12-31',
    })

    expect(result.id).toBe('new-offer-1')
    expect(result.error).toBeNull()
  })

  it('should update an existing offer when id is provided', async () => {
    const chain = createChain(undefined)
    ;(chain.update as ReturnType<typeof vi.fn>).mockReturnValue({
      eq: vi.fn().mockResolvedValue({ error: null }),
    })
    mockFrom.mockReturnValue(chain)

    const result = await upsertOffer('p1', {
      id: 'existing-1',
      title: 'Updated Offer',
      description: 'New desc',
      price_eur: 149,
      valid_from: '2025-01-01',
      valid_until: '2025-12-31',
    })

    expect(result.id).toBe('existing-1')
    expect(result.error).toBeNull()
  })

  it('should return error message on update failure', async () => {
    const chain = createChain(undefined)
    ;(chain.update as ReturnType<typeof vi.fn>).mockReturnValue({
      eq: vi.fn().mockResolvedValue({ error: { message: 'Update failed' } }),
    })
    mockFrom.mockReturnValue(chain)

    const result = await upsertOffer('p1', {
      id: 'existing-1',
      title: 'Fail',
      description: 'Desc',
      price_eur: 10,
      valid_from: '2025-01-01',
      valid_until: '2025-12-31',
    })

    expect(result.error).toBe('Update failed')
  })

  it('should return error message on insert failure', async () => {
    const chain = createChain(undefined)
    ;(chain.insert as ReturnType<typeof vi.fn>).mockReturnValue({
      select: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({ data: null, error: { message: 'Insert failed' } }),
      }),
    })
    mockFrom.mockReturnValue(chain)

    const result = await upsertOffer('p1', {
      title: 'Fail',
      description: 'Desc',
      price_eur: 10,
      valid_from: '2025-01-01',
      valid_until: '2025-12-31',
    })

    expect(result.id).toBeNull()
    expect(result.error).toBe('Insert failed')
  })
})

// ---------------------------------------------------------------------------
// getPartnerAnalytics
// ---------------------------------------------------------------------------
describe('getPartnerAnalytics', () => {
  it('should aggregate bookings by day and offer', async () => {
    const chain = createChain(undefined)
    ;(chain.gte as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: [
        { created_at: '2025-06-01T10:00:00Z', total_eur: 50, offer_id: 'o1' },
        { created_at: '2025-06-01T14:00:00Z', total_eur: 75, offer_id: 'o2' },
        { created_at: '2025-06-02T09:00:00Z', total_eur: 100, offer_id: 'o1' },
      ],
    })
    mockFrom.mockReturnValue(chain)

    const result = await getPartnerAnalytics('p1', 30)
    expect(result.dailyBookings).toHaveLength(2)
    expect(result.dailyBookings[0]).toEqual({ date: '2025-06-01', count: 2, revenue: 125 })
    expect(result.dailyBookings[1]).toEqual({ date: '2025-06-02', count: 1, revenue: 100 })

    // topOffers sorted by bookings desc
    expect(result.topOffers[0]).toEqual({ title: 'o1', bookings: 2 })
    expect(result.topOffers[1]).toEqual({ title: 'o2', bookings: 1 })
  })

  it('should return empty arrays when no bookings exist', async () => {
    const chain = createChain(undefined)
    ;(chain.gte as ReturnType<typeof vi.fn>).mockResolvedValue({ data: null })
    mockFrom.mockReturnValue(chain)

    const result = await getPartnerAnalytics('p1')
    expect(result.dailyBookings).toEqual([])
    expect(result.topOffers).toEqual([])
  })

  it('should sort daily bookings by date ascending', async () => {
    const chain = createChain(undefined)
    ;(chain.gte as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: [
        { created_at: '2025-06-03T10:00:00Z', total_eur: 10, offer_id: 'o1' },
        { created_at: '2025-06-01T10:00:00Z', total_eur: 20, offer_id: 'o1' },
      ],
    })
    mockFrom.mockReturnValue(chain)

    const result = await getPartnerAnalytics('p1')
    expect(result.dailyBookings[0].date).toBe('2025-06-01')
    expect(result.dailyBookings[1].date).toBe('2025-06-03')
  })

  it('should limit topOffers to 10', async () => {
    const bookings = Array.from({ length: 15 }, (_, i) => ({
      created_at: '2025-06-01T10:00:00Z',
      total_eur: 10,
      offer_id: `offer-${i}`,
    }))
    const chain = createChain(undefined)
    ;(chain.gte as ReturnType<typeof vi.fn>).mockResolvedValue({ data: bookings })
    mockFrom.mockReturnValue(chain)

    const result = await getPartnerAnalytics('p1')
    expect(result.topOffers.length).toBeLessThanOrEqual(10)
  })
})
