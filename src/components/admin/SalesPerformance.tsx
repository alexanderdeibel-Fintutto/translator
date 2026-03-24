import { useEffect, useState } from 'react'
import { TrendingUp, Users, DollarSign, Target, Calculator, RefreshCw } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { fetchSalesPerformance, calculateCommissions } from '@/lib/admin-api'
import type { SalesPerformance as SalesPerformanceData } from '@/lib/admin-types'

function formatEur(amount: number): string {
  if (amount === 0) return '0 EUR'
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
  }).format(amount)
}

export default function SalesPerformanceView() {
  const [data, setData] = useState<SalesPerformanceData[]>([])
  const [loading, setLoading] = useState(true)
  const [calculating, setCalculating] = useState(false)

  const loadData = () => {
    setLoading(true)
    fetchSalesPerformance()
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(() => { loadData() }, [])

  const handleCalculate = async () => {
    setCalculating(true)
    try {
      const count = await calculateCommissions()
      if (count > 0) loadData()
    } catch (err) {
      console.error('Commission calculation failed:', err)
    } finally {
      setCalculating(false)
    }
  }

  // Aggregates
  const totalMrr = data.reduce((s, d) => s + d.total_mrr_eur, 0)
  const totalEarned = data.reduce((s, d) => s + d.total_commissions_earned_eur, 0)
  const totalLeads = data.reduce((s, d) => s + d.leads_created, 0)
  const totalConverted = data.reduce((s, d) => s + d.leads_converted, 0)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Vertriebsleistung</h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={loadData} disabled={loading}>
            <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
            Aktualisieren
          </Button>
          <Button variant="default" size="sm" onClick={handleCalculate} disabled={calculating}>
            <Calculator className={`h-3.5 w-3.5 mr-1.5 ${calculating ? 'animate-spin' : ''}`} />
            Provisionen berechnen
          </Button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="p-3 space-y-1">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Users className="h-3.5 w-3.5" /> Leads gesamt
          </div>
          <div className="text-2xl font-bold">{totalLeads}</div>
        </Card>
        <Card className="p-3 space-y-1">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Target className="h-3.5 w-3.5" /> Konvertiert
          </div>
          <div className="text-2xl font-bold">
            {totalConverted}
            {totalLeads > 0 && (
              <span className="text-sm font-normal text-muted-foreground ml-1">
                ({Math.round(totalConverted / totalLeads * 100)}%)
              </span>
            )}
          </div>
        </Card>
        <Card className="p-3 space-y-1">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <TrendingUp className="h-3.5 w-3.5" /> Gesamt-MRR
          </div>
          <div className="text-2xl font-bold">{formatEur(totalMrr)}</div>
        </Card>
        <Card className="p-3 space-y-1">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <DollarSign className="h-3.5 w-3.5" /> Provisionen verdient
          </div>
          <div className="text-2xl font-bold">{formatEur(totalEarned)}</div>
        </Card>
      </div>

      {/* Agent table */}
      {loading ? (
        <div className="text-sm text-muted-foreground py-8 text-center">Lade Vertriebsdaten...</div>
      ) : (
        <div className="border rounded-lg overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Vertriebler</TableHead>
                <TableHead className="text-right">Leads</TableHead>
                <TableHead className="text-right">Konvertiert</TableHead>
                <TableHead className="text-right">Quote</TableHead>
                <TableHead className="text-right">Aktive Kunden</TableHead>
                <TableHead className="text-right">MRR</TableHead>
                <TableHead className="text-right">Prov. verdient</TableHead>
                <TableHead className="text-right">Prov. ausgezahlt</TableHead>
                <TableHead className="text-right">Prov. Monat</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map(d => (
                <TableRow key={d.sales_agent_id}>
                  <TableCell>
                    <div className="font-medium">{d.agent_name ?? '-'}</div>
                    <div className="text-xs text-muted-foreground">{d.agent_email}</div>
                  </TableCell>
                  <TableCell className="text-right tabular-nums">{d.leads_created}</TableCell>
                  <TableCell className="text-right tabular-nums">{d.leads_converted}</TableCell>
                  <TableCell className="text-right tabular-nums">
                    {d.conversion_rate > 0 ? (
                      <Badge variant="secondary" className="text-xs">{d.conversion_rate}%</Badge>
                    ) : '-'}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">{d.active_customers}</TableCell>
                  <TableCell className="text-right tabular-nums">{formatEur(d.total_mrr_eur)}</TableCell>
                  <TableCell className="text-right tabular-nums font-medium">{formatEur(d.total_commissions_earned_eur)}</TableCell>
                  <TableCell className="text-right tabular-nums">{formatEur(d.total_commissions_paid_eur)}</TableCell>
                  <TableCell className="text-right tabular-nums">
                    {d.current_month_commission_eur > 0 ? (
                      <Badge className="text-xs bg-emerald-500">{formatEur(d.current_month_commission_eur)}</Badge>
                    ) : '-'}
                  </TableCell>
                </TableRow>
              ))}
              {data.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} className="text-center text-muted-foreground py-8">
                    Keine Vertriebsdaten vorhanden
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
