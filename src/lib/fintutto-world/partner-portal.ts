// Partner Self-Service Portal API
// Allows business partners to manage their own listings, offers, and analytics

import { supabase } from '@/lib/supabase'

export interface PartnerDashboard {
  partner: Record<string, unknown>
  activeOffers: number
  totalBookings: number
  totalRevenue: number
  recentBookings: Record<string, unknown>[]
  reviews: { avg: number; count: number }
}

/**
 * Get partner dashboard data for the current user.
 */
export async function getPartnerDashboard(partnerId: string): Promise<PartnerDashboard | null> {
  const [partnerRes, offersRes, bookingsRes, reviewsRes] = await Promise.all([
    supabase.from('cg_partners').select('*').eq('id', partnerId).single(),
    supabase.from('cg_offers').select('id').eq('partner_id', partnerId).eq('status', 'active'),
    supabase.from('cg_bookings').select('*').eq('partner_id', partnerId).order('created_at', { ascending: false }).limit(20),
    supabase.from('cg_reviews').select('rating').eq('partner_id', partnerId),
  ])

  if (!partnerRes.data) return null

  const ratings = (reviewsRes.data || []).map((r: { rating: number }) => r.rating)
  const avgRating = ratings.length > 0 ? ratings.reduce((a: number, b: number) => a + b, 0) / ratings.length : 0

  return {
    partner: partnerRes.data,
    activeOffers: offersRes.data?.length || 0,
    totalBookings: bookingsRes.data?.length || 0,
    totalRevenue: (bookingsRes.data || []).reduce((s: number, b: Record<string, number>) => s + (b.total_eur || 0), 0),
    recentBookings: bookingsRes.data || [],
    reviews: { avg: Math.round(avgRating * 10) / 10, count: ratings.length },
  }
}

/**
 * Create or update a partner offer.
 */
export async function upsertOffer(partnerId: string, offer: {
  id?: string
  title: string
  description: string
  price_eur: number
  valid_from: string
  valid_until: string
  max_bookings?: number
}): Promise<{ id: string | null; error: string | null }> {
  const payload = { ...offer, partner_id: partnerId, status: 'active' }

  if (offer.id) {
    const { error } = await supabase.from('cg_offers').update(payload).eq('id', offer.id)
    return { id: offer.id, error: error?.message || null }
  } else {
    const { data, error } = await supabase.from('cg_offers').insert(payload).select('id').single()
    return { id: data?.id || null, error: error?.message || null }
  }
}

/**
 * Get partner analytics (bookings over time, revenue).
 */
export async function getPartnerAnalytics(partnerId: string, days = 30): Promise<{
  dailyBookings: { date: string; count: number; revenue: number }[]
  topOffers: { title: string; bookings: number }[]
}> {
  const dateFrom = new Date(Date.now() - days * 86400000).toISOString()

  const { data: bookings } = await supabase
    .from('cg_bookings')
    .select('created_at, total_eur, offer_id')
    .eq('partner_id', partnerId)
    .gte('created_at', dateFrom)

  // Aggregate by day
  const byDay: Record<string, { count: number; revenue: number }> = {}
  const byOffer: Record<string, number> = {}

  for (const b of bookings || []) {
    const date = (b.created_at as string).split('T')[0]
    if (!byDay[date]) byDay[date] = { count: 0, revenue: 0 }
    byDay[date].count++
    byDay[date].revenue += (b as Record<string, number>).total_eur || 0
    byOffer[b.offer_id as string] = (byOffer[b.offer_id as string] || 0) + 1
  }

  return {
    dailyBookings: Object.entries(byDay)
      .map(([date, d]) => ({ date, ...d }))
      .sort((a, b) => a.date.localeCompare(b.date)),
    topOffers: Object.entries(byOffer)
      .map(([title, bookings]) => ({ title, bookings }))
      .sort((a, b) => b.bookings - a.bookings)
      .slice(0, 10),
  }
}
