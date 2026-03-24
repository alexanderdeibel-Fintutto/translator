// Fintutto World — Revenue Dashboard
// Zeigt Umsatz-Metriken aus Marketplace, Premium, Buchungen und Provisionen

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DollarSign, TrendingUp, ShoppingCart, CreditCard, Star,
  Loader2, ArrowUpRight, BarChart3, Clock,
} from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface RevenueData {
  total: number
  bySource: { source: string; amount: number; label: string; color: string }[]
  monthly: { month: string; amount: number }[]
  topListings: { id: string; title: string; revenue: number; sales: number }[]
  recentTransactions: { id: string; amount: number; type: string; description: string; created_at: string }[]
}

const SOURCE_CONFIG: Record<string, { label: string; color: string }> = {
  marketplace: { label: 'Marketplace', color: 'text-blue-600' },
  premium: { label: 'Premium Inhalte', color: 'text-purple-600' },
  booking: { label: 'Buchungen', color: 'text-emerald-600' },
  commission: { label: 'Provisionen', color: 'text-amber-600' },
}

export default function RevenueDashboard() {
  const [data, setData] = useState<RevenueData | null>(null)
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d'>('30d')

  useEffect(() => {
    loadData()
  }, [dateRange])

  async function loadData() {
    setLoading(true)

    const now = new Date()
    const days = dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : 90
    const dateFrom = new Date(now.getTime() - days * 86400000).toISOString()

    // Fetch data from multiple tables in parallel
    const [transactionsRes, commissionsRes, premiumRes, listingsRes] = await Promise.all([
      supabase
        .from('fw_transactions')
        .select('id, amount, type, description, created_at')
        .gte('created_at', dateFrom)
        .order('created_at', { ascending: false })
        .limit(200),
      supabase
        .from('fw_commissions')
        .select('id, amount, created_at')
        .gte('created_at', dateFrom),
      supabase
        .from('fw_premium_purchases')
        .select('id, amount, created_at')
        .gte('created_at', dateFrom),
      supabase
        .from('fw_marketplace_listings')
        .select('id, title, price, total_sales, total_revenue')
        .order('total_revenue', { ascending: false })
        .limit(10),
    ])

    const transactions = (transactionsRes.data || []) as { id: string; amount: number; type: string; description: string; created_at: string }[]
    const commissions = (commissionsRes.data || []) as { id: string; amount: number; created_at: string }[]
    const premiums = (premiumRes.data || []) as { id: string; amount: number; created_at: string }[]
    const listings = (listingsRes.data || []) as { id: string; title: string; price: number; total_sales: number; total_revenue: number }[]

    // Calculate revenue by source
    const marketplaceRevenue = transactions
      .filter(t => t.type === 'marketplace' || t.type === 'sale')
      .reduce((sum, t) => sum + (t.amount || 0), 0)
    const bookingRevenue = transactions
      .filter(t => t.type === 'booking')
      .reduce((sum, t) => sum + (t.amount || 0), 0)
    const premiumRevenue = premiums.reduce((sum, p) => sum + (p.amount || 0), 0)
    const commissionRevenue = commissions.reduce((sum, c) => sum + (c.amount || 0), 0)

    const totalRevenue = marketplaceRevenue + bookingRevenue + premiumRevenue + commissionRevenue

    // Monthly breakdown from transactions
    const monthlyMap: Record<string, number> = {}
    for (const t of transactions) {
      const month = t.created_at.slice(0, 7) // YYYY-MM
      monthlyMap[month] = (monthlyMap[month] || 0) + (t.amount || 0)
    }
    for (const p of premiums) {
      const month = p.created_at.slice(0, 7)
      monthlyMap[month] = (monthlyMap[month] || 0) + (p.amount || 0)
    }
    for (const c of commissions) {
      const month = c.created_at.slice(0, 7)
      monthlyMap[month] = (monthlyMap[month] || 0) + (c.amount || 0)
    }

    const monthly = Object.entries(monthlyMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, amount]) => ({ month, amount }))

    setData({
      total: totalRevenue,
      bySource: [
        { source: 'marketplace', amount: marketplaceRevenue, ...SOURCE_CONFIG.marketplace },
        { source: 'premium', amount: premiumRevenue, ...SOURCE_CONFIG.premium },
        { source: 'booking', amount: bookingRevenue, ...SOURCE_CONFIG.booking },
        { source: 'commission', amount: commissionRevenue, ...SOURCE_CONFIG.commission },
      ],
      monthly,
      topListings: listings.map(l => ({
        id: l.id,
        title: l.title || l.id.slice(0, 8),
        revenue: l.total_revenue || 0,
        sales: l.total_sales || 0,
      })),
      recentTransactions: transactions.slice(0, 15),
    })

    setLoading(false)
  }

  function formatCurrency(amount: number) {
    return new Intl.NumberFormat('de-AT', { style: 'currency', currency: 'EUR' }).format(amount)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <DollarSign className="h-6 w-6" />
            Umsatz-Dashboard
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Umsaetze aus Marketplace, Premium-Inhalten, Buchungen und Provisionen.
          </p>
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Zeitraum</Label>
          <Select value={dateRange} onValueChange={v => setDateRange(v as typeof dateRange)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">7 Tage</SelectItem>
              <SelectItem value="30d">30 Tage</SelectItem>
              <SelectItem value="90d">90 Tage</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {data && (
        <>
          {/* Total revenue card */}
          <Card className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 dark:bg-green-900/40 rounded-full">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Gesamtumsatz ({dateRange === '7d' ? '7 Tage' : dateRange === '30d' ? '30 Tage' : '90 Tage'})</p>
                <p className="text-3xl font-bold text-green-700 dark:text-green-400">{formatCurrency(data.total)}</p>
              </div>
            </div>
          </Card>

          {/* Revenue by source */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {data.bySource.map(src => (
              <Card key={src.source} className="p-4">
                <div className={`text-sm font-medium ${src.color}`}>{src.label}</div>
                <div className="text-xl font-bold mt-1">{formatCurrency(src.amount)}</div>
                {data.total > 0 && (
                  <div className="text-xs text-muted-foreground mt-1">
                    {Math.round((src.amount / data.total) * 100)}% Anteil
                  </div>
                )}
              </Card>
            ))}
          </div>

          {/* Monthly revenue chart */}
          {data.monthly.length > 0 && (
            <Card className="p-4">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Monatlicher Umsatz
              </h3>
              <div className="flex items-end gap-1 h-40">
                {data.monthly.map((m, i) => {
                  const maxAmount = Math.max(...data.monthly.map(x => x.amount), 1)
                  const height = (m.amount / maxAmount) * 100
                  return (
                    <div
                      key={i}
                      className="flex-1 bg-green-200 dark:bg-green-800 hover:bg-green-300 dark:hover:bg-green-700 rounded-t transition-colors relative group"
                      style={{ height: `${Math.max(height, 2)}%` }}
                    >
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-[10px] font-mono opacity-0 group-hover:opacity-100 bg-foreground text-background px-1.5 py-0.5 rounded whitespace-nowrap z-10">
                        {formatCurrency(m.amount)}
                      </div>
                      <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[9px] text-muted-foreground whitespace-nowrap">
                        {m.month.slice(5)}
                      </div>
                    </div>
                  )
                })}
              </div>
              <div className="h-5" /> {/* Spacer for bottom labels */}
            </Card>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            {/* Top listings */}
            <Card className="p-4">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Star className="h-4 w-4" />
                Top Listings
              </h3>
              {data.topListings.length > 0 ? (
                <div className="space-y-2">
                  {data.topListings.map((listing, i) => (
                    <div key={listing.id} className="flex items-center gap-2 text-sm">
                      <Badge variant="outline" className="text-xs w-6 text-center">{i + 1}</Badge>
                      <span className="flex-1 truncate">{listing.title}</span>
                      <span className="text-muted-foreground text-xs">{listing.sales} Sales</span>
                      <span className="font-medium">{formatCurrency(listing.revenue)}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Noch keine Listings vorhanden.</p>
              )}
            </Card>

            {/* Recent transactions */}
            <Card className="p-4">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Letzte Transaktionen
              </h3>
              {data.recentTransactions.length > 0 ? (
                <div className="space-y-2 max-h-80 overflow-auto">
                  {data.recentTransactions.map(tx => (
                    <div key={tx.id} className="flex items-center gap-2 text-sm border-b pb-2 last:border-0">
                      <div className="flex-1 min-w-0">
                        <p className="truncate">{tx.description || tx.type}</p>
                        <p className="text-[10px] text-muted-foreground">
                          {new Date(tx.created_at).toLocaleDateString('de-AT')} {new Date(tx.created_at).toLocaleTimeString('de-AT', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      <Badge variant="outline" className="text-[10px]">{tx.type}</Badge>
                      <span className="font-medium text-green-600 whitespace-nowrap">
                        +{formatCurrency(tx.amount)}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Keine Transaktionen im Zeitraum.</p>
              )}
            </Card>
          </div>
        </>
      )}

      {!data && !loading && (
        <Card className="p-12 text-center">
          <DollarSign className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <h3 className="font-semibold mb-1">Keine Umsatzdaten</h3>
          <p className="text-sm text-muted-foreground">
            Es liegen noch keine Transaktionen vor.
          </p>
        </Card>
      )}
    </div>
  )
}
