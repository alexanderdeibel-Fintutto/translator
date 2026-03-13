// Admin Billing Dashboard — Customer billing overview, suspension, revenue.
// Only visible to admin/sales_agent roles.

import { useEffect, useState, useCallback } from 'react'
import {
  DollarSign, Users, AlertTriangle, Ban, CheckCircle2, Search,
  FileText, ExternalLink, Download, RefreshCw, Lock, Unlock,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { TIERS, type TierId } from '@/lib/tiers'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface BillingCustomer {
  id: string
  email: string | null
  display_name: string | null
  tier_id: string
  subscription_status: string | null
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  billing_period_end: string | null
  is_suspended: boolean
  created_at: string
}

interface AdminInvoice {
  id: string
  user_id: string | null
  stripe_customer_id: string
  status: string
  currency: string
  amount_due: number
  amount_paid: number
  invoice_pdf: string | null
  hosted_invoice_url: string | null
  created_at: string
  // joined
  user_email?: string | null
  user_name?: string | null
}

interface RevenueStats {
  totalCustomers: number
  activeSubscriptions: number
  pastDueCount: number
  suspendedCount: number
  paidThisMonth: number
  openInvoices: number
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatEur(cents: number): string {
  return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(cents / 100)
}

function formatDate(iso: string | null): string {
  if (!iso) return '-'
  return new Date(iso).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

const STATUS_COLORS: Record<string, string> = {
  active: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  past_due: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  canceled: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
  trialing: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  trial_ending: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
}

const STATUS_LABELS: Record<string, string> = {
  active: 'Aktiv',
  past_due: 'Ueberfaellig',
  canceled: 'Gekuendigt',
  trialing: 'Testphase',
  trial_ending: 'Test endet',
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export default function BillingDashboard() {
  const [customers, setCustomers] = useState<BillingCustomer[]>([])
  const [invoices, setInvoices] = useState<AdminInvoice[]>([])
  const [stats, setStats] = useState<RevenueStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [activeTab, setActiveTab] = useState<'customers' | 'invoices'>('customers')
  const [suspendDialog, setSuspendDialog] = useState<{ userId: string; name: string; suspend: boolean } | null>(null)
  const [suspendReason, setSuspendReason] = useState('')

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      // Load customers with billing info
      const { data: customerData } = await supabase
        .from('gt_users')
        .select('id, email, display_name, tier_id, subscription_status, stripe_customer_id, stripe_subscription_id, billing_period_end, is_suspended, created_at')
        .order('created_at', { ascending: false })

      const allCustomers = customerData ?? []
      setCustomers(allCustomers)

      // Load recent invoices
      const { data: invoiceData } = await supabase
        .from('gt_invoices')
        .select('id, user_id, stripe_customer_id, status, currency, amount_due, amount_paid, invoice_pdf, hosted_invoice_url, created_at')
        .order('created_at', { ascending: false })
        .limit(100)

      setInvoices(invoiceData ?? [])

      // Calculate stats
      const paying = allCustomers.filter(c => c.tier_id !== 'free' && !c.tier_id.startsWith('internal_'))
      const paidInvoices = (invoiceData ?? []).filter(i => {
        if (i.status !== 'paid') return false
        const d = new Date(i.created_at)
        const now = new Date()
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
      })
      const paidTotal = paidInvoices.reduce((sum, i) => sum + i.amount_paid, 0)
      const openCount = (invoiceData ?? []).filter(i => i.status === 'open').length

      setStats({
        totalCustomers: paying.length,
        activeSubscriptions: allCustomers.filter(c => c.subscription_status === 'active').length,
        pastDueCount: allCustomers.filter(c => c.subscription_status === 'past_due').length,
        suspendedCount: allCustomers.filter(c => c.is_suspended).length,
        paidThisMonth: paidTotal,
        openInvoices: openCount,
      })
    } catch (err) {
      console.error('Failed to load billing data:', err)
      toast.error('Billing-Daten konnten nicht geladen werden')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  // Suspend / unsuspend user
  async function handleSuspendToggle() {
    if (!suspendDialog) return
    try {
      const update: Record<string, unknown> = {
        is_suspended: suspendDialog.suspend,
      }
      if (suspendDialog.suspend) {
        update.suspension_reason = suspendReason || 'Ausstehende Zahlungen'
      } else {
        update.suspension_reason = null
      }
      const { error } = await supabase
        .from('gt_users')
        .update(update)
        .eq('id', suspendDialog.userId)

      if (error) throw error

      setCustomers(prev => prev.map(c =>
        c.id === suspendDialog.userId
          ? { ...c, is_suspended: suspendDialog.suspend }
          : c
      ))
      toast.success(suspendDialog.suspend ? 'Konto gesperrt' : 'Konto entsperrt')
    } catch (err) {
      toast.error('Aktion fehlgeschlagen')
      console.error(err)
    } finally {
      setSuspendDialog(null)
      setSuspendReason('')
    }
  }

  // Filter customers
  const filteredCustomers = customers.filter(c => {
    if (statusFilter === 'paying') return c.tier_id !== 'free' && !c.tier_id.startsWith('internal_')
    if (statusFilter === 'past_due') return c.subscription_status === 'past_due'
    if (statusFilter === 'suspended') return c.is_suspended
    if (statusFilter === 'free') return c.tier_id === 'free'
    // search
    if (search) {
      const q = search.toLowerCase()
      return (c.display_name ?? '').toLowerCase().includes(q) ||
             (c.email ?? '').toLowerCase().includes(q)
    }
    return true
  }).filter(c => {
    if (!search) return true
    const q = search.toLowerCase()
    return (c.display_name ?? '').toLowerCase().includes(q) ||
           (c.email ?? '').toLowerCase().includes(q)
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Billing & Kunden</h2>
        <Button size="sm" variant="outline" onClick={loadData} className="gap-1.5">
          <RefreshCw className="w-3.5 h-3.5" /> Aktualisieren
        </Button>
      </div>

      {/* KPI Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <KpiCard icon={Users} label="Zahlende Kunden" value={stats.totalCustomers} />
          <KpiCard icon={CheckCircle2} label="Aktive Abos" value={stats.activeSubscriptions} color="text-green-600" />
          <KpiCard icon={AlertTriangle} label="Ueberfaellig" value={stats.pastDueCount} color="text-amber-600" />
          <KpiCard icon={Ban} label="Gesperrt" value={stats.suspendedCount} color="text-red-600" />
          <KpiCard icon={DollarSign} label="Umsatz (Monat)" value={formatEur(stats.paidThisMonth)} />
          <KpiCard icon={FileText} label="Offene Rechnungen" value={stats.openInvoices} color="text-amber-600" />
        </div>
      )}

      {/* Tabs */}
      <div className="inline-flex items-center gap-1 p-1 rounded-lg bg-muted">
        <button
          onClick={() => setActiveTab('customers')}
          className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
            activeTab === 'customers'
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Kunden
        </button>
        <button
          onClick={() => setActiveTab('invoices')}
          className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
            activeTab === 'invoices'
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Rechnungen
        </button>
      </div>

      {/* ── Customers Tab ─────────────────────────────────────────────── */}
      {activeTab === 'customers' && (
        <>
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Kunde suchen..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-9 max-w-xs h-8 text-sm"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[160px] h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle</SelectItem>
                <SelectItem value="paying">Zahlende</SelectItem>
                <SelectItem value="past_due">Ueberfaellig</SelectItem>
                <SelectItem value="suspended">Gesperrt</SelectItem>
                <SelectItem value="free">Free-Tier</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {loading ? (
            <div className="text-sm text-muted-foreground py-8 text-center">Lade Kundendaten...</div>
          ) : (
            <div className="border rounded-lg overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Kunde</TableHead>
                    <TableHead>Tier</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Naechste Zahlung</TableHead>
                    <TableHead className="text-right">Aktionen</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCustomers.map(c => {
                    const tier = TIERS[c.tier_id as TierId]
                    const statusColor = STATUS_COLORS[c.subscription_status ?? ''] ?? 'bg-slate-100 text-slate-600'
                    const statusLabel = STATUS_LABELS[c.subscription_status ?? ''] ?? (c.subscription_status || '-')
                    return (
                      <TableRow key={c.id} className={c.is_suspended ? 'opacity-60' : ''}>
                        <TableCell>
                          <div className="font-medium text-sm">{c.display_name ?? '-'}</div>
                          <div className="text-xs text-muted-foreground">{c.email}</div>
                        </TableCell>
                        <TableCell>
                          <span className="text-xs font-medium">{tier?.displayName ?? c.tier_id}</span>
                          {tier && tier.pricing.monthlyEur > 0 && (
                            <div className="text-xs text-muted-foreground">{tier.pricing.monthlyEur} EUR/Mo</div>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5">
                            {c.is_suspended && (
                              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                                Gesperrt
                              </span>
                            )}
                            {c.subscription_status && !c.is_suspended && (
                              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColor}`}>
                                {statusLabel}
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {formatDate(c.billing_period_end)}
                        </TableCell>
                        <TableCell className="text-right">
                          {c.is_suspended ? (
                            <Button
                              size="sm"
                              variant="outline"
                              className="gap-1 text-xs h-7"
                              onClick={() => setSuspendDialog({ userId: c.id, name: c.display_name ?? c.email ?? c.id, suspend: false })}
                            >
                              <Unlock className="w-3 h-3" /> Entsperren
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="gap-1 text-xs h-7 text-destructive hover:text-destructive"
                              onClick={() => setSuspendDialog({ userId: c.id, name: c.display_name ?? c.email ?? c.id, suspend: true })}
                            >
                              <Lock className="w-3 h-3" /> Sperren
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                  {filteredCustomers.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                        Keine Kunden gefunden
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </>
      )}

      {/* ── Invoices Tab ──────────────────────────────────────────────── */}
      {activeTab === 'invoices' && (
        <>
          {loading ? (
            <div className="text-sm text-muted-foreground py-8 text-center">Lade Rechnungen...</div>
          ) : (
            <div className="border rounded-lg overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Datum</TableHead>
                    <TableHead>Kunde</TableHead>
                    <TableHead>Betrag</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Aktionen</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.map(inv => {
                    // Find customer for this invoice
                    const customer = customers.find(c => c.stripe_customer_id === inv.stripe_customer_id)
                    const invStatusColors: Record<string, string> = {
                      paid: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
                      open: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
                      draft: 'bg-slate-100 text-slate-500',
                      void: 'bg-slate-100 text-slate-500',
                    }
                    const invStatusLabels: Record<string, string> = {
                      paid: 'Bezahlt', open: 'Offen', draft: 'Entwurf', void: 'Storniert',
                      uncollectible: 'Uneinbringlich',
                    }
                    return (
                      <TableRow key={inv.id}>
                        <TableCell className="text-xs">{formatDate(inv.created_at)}</TableCell>
                        <TableCell>
                          <div className="text-sm">{customer?.display_name ?? '-'}</div>
                          <div className="text-xs text-muted-foreground">{customer?.email ?? inv.stripe_customer_id}</div>
                        </TableCell>
                        <TableCell className="font-medium text-sm">
                          {formatEur(inv.amount_due)}
                        </TableCell>
                        <TableCell>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${invStatusColors[inv.status] ?? 'bg-slate-100 text-slate-500'}`}>
                            {invStatusLabels[inv.status] ?? inv.status}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            {inv.invoice_pdf && (
                              <a href={inv.invoice_pdf} target="_blank" rel="noopener noreferrer"
                                className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground" title="PDF">
                                <Download className="w-3.5 h-3.5" />
                              </a>
                            )}
                            {inv.hosted_invoice_url && (
                              <a href={inv.hosted_invoice_url} target="_blank" rel="noopener noreferrer"
                                className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground" title="Online">
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                  {invoices.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                        Noch keine Rechnungen
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </>
      )}

      {/* Suspend Dialog */}
      <Dialog open={!!suspendDialog} onOpenChange={() => setSuspendDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {suspendDialog?.suspend ? 'Konto sperren' : 'Konto entsperren'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm">
              {suspendDialog?.suspend
                ? `Moechtest du das Konto von "${suspendDialog.name}" wirklich sperren? Der Benutzer verliert sofort den Zugang.`
                : `Konto von "${suspendDialog?.name}" entsperren? Der Benutzer erhaelt sofort wieder Zugang.`
              }
            </p>
            {suspendDialog?.suspend && (
              <div className="space-y-1.5">
                <Label>Grund (optional)</Label>
                <Input
                  value={suspendReason}
                  onChange={e => setSuspendReason(e.target.value)}
                  placeholder="z.B. Ausstehende Zahlungen"
                />
              </div>
            )}
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setSuspendDialog(null)}>Abbrechen</Button>
              <Button
                variant={suspendDialog?.suspend ? 'destructive' : 'default'}
                onClick={handleSuspendToggle}
              >
                {suspendDialog?.suspend ? 'Sperren' : 'Entsperren'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ---------------------------------------------------------------------------
// KPI Card
// ---------------------------------------------------------------------------

function KpiCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: typeof Users
  label: string
  value: string | number
  color?: string
}) {
  return (
    <div className="rounded-xl border border-border p-4">
      <div className="flex items-center gap-2 mb-1">
        <Icon className={`w-4 h-4 ${color ?? 'text-muted-foreground'}`} />
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
      <div className={`text-xl font-bold ${color ?? ''}`}>{value}</div>
    </div>
  )
}
