// Invoice History — Shows past invoices with status, amounts, and PDF download.
// Fetches from gt_invoices table via RPC or direct query.

import { useEffect, useState } from 'react'
import { FileText, Download, ExternalLink, RefreshCw } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface Invoice {
  id: string
  status: string
  currency: string
  amount_due: number
  amount_paid: number
  invoice_pdf: string | null
  hosted_invoice_url: string | null
  period_start: string | null
  period_end: string | null
  created_at: string
  paid_at: string | null
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  paid: { label: 'Bezahlt', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
  open: { label: 'Offen', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
  draft: { label: 'Entwurf', color: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400' },
  void: { label: 'Storniert', color: 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-500' },
  uncollectible: { label: 'Uneinbringlich', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
}

function formatAmount(cents: number, currency: string): string {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(cents / 100)
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

export default function InvoiceHistory() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  async function loadInvoices() {
    setLoading(true)
    setError(null)
    try {
      // Try RPC first, fallback to direct query
      const { data: rpcData, error: rpcError } = await supabase.rpc('get_my_invoices')
      if (!rpcError && rpcData) {
        setInvoices(rpcData)
      } else {
        // Fallback: direct query (RLS should allow own invoices)
        const { data, error: queryError } = await supabase
          .from('gt_invoices')
          .select('id, status, currency, amount_due, amount_paid, invoice_pdf, hosted_invoice_url, period_start, period_end, created_at, paid_at')
          .order('created_at', { ascending: false })
          .limit(50)
        if (queryError) throw queryError
        setInvoices(data ?? [])
      }
    } catch (err) {
      setError('Rechnungen konnten nicht geladen werden')
      console.error('Invoice fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadInvoices()
  }, [])

  if (loading) {
    return (
      <div className="rounded-xl border border-border p-5">
        <div className="flex items-center gap-2 mb-4">
          <FileText className="w-5 h-5 text-primary" />
          <h2 className="font-semibold">Rechnungen</h2>
        </div>
        <div className="text-sm text-muted-foreground py-4 text-center">Lade Rechnungen...</div>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-border p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary" />
          <h2 className="font-semibold">Rechnungen</h2>
        </div>
        <button onClick={loadInvoices} className="text-muted-foreground hover:text-foreground">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {error && (
        <div className="text-sm text-destructive mb-3">{error}</div>
      )}

      {invoices.length === 0 ? (
        <div className="text-sm text-muted-foreground py-4 text-center">
          Noch keine Rechnungen vorhanden.
        </div>
      ) : (
        <div className="space-y-2">
          {invoices.map(inv => {
            const statusConf = STATUS_LABELS[inv.status] ?? STATUS_LABELS.draft
            return (
              <div
                key={inv.id}
                className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-muted/50 transition-colors text-sm"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusConf.color}`}>
                    {statusConf.label}
                  </span>
                  <div className="min-w-0">
                    <div className="font-medium truncate">
                      {formatAmount(inv.amount_due, inv.currency)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {formatDate(inv.created_at)}
                      {inv.period_start && inv.period_end && (
                        <span> — Zeitraum {formatDate(inv.period_start)} bis {formatDate(inv.period_end)}</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {inv.invoice_pdf && (
                    <a
                      href={inv.invoice_pdf}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground"
                      title="PDF herunterladen"
                    >
                      <Download className="w-4 h-4" />
                    </a>
                  )}
                  {inv.hosted_invoice_url && (
                    <a
                      href={inv.hosted_invoice_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground"
                      title="Online ansehen"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
