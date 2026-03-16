/**
 * Privacy / Data Protection Banner
 *
 * Visible DSGVO-compliance indicator for government offices.
 * Shows that no conversation data is stored and auto-deletes after session.
 *
 * Used by: authority-clerk, authority-visitor
 */

import { Shield, Trash2 } from 'lucide-react'

interface PrivacyBannerProps {
  /** Compact single-line mode */
  compact?: boolean
}

export default function PrivacyBanner({ compact = false }: PrivacyBannerProps) {
  if (compact) {
    return (
      <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 rounded-lg px-3 py-2">
        <Shield className="h-3.5 w-3.5 shrink-0 text-teal-600" />
        <span>DSGVO-konform — keine Speicherung von Gespraechsinhalten</span>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-teal-200 dark:border-teal-800 bg-teal-50/50 dark:bg-teal-900/10 p-4 space-y-3">
      <div className="flex items-center gap-2">
        <Shield className="h-5 w-5 text-teal-700 dark:text-teal-400" />
        <h3 className="font-semibold text-sm">Datenschutz</h3>
      </div>
      <ul className="space-y-2 text-xs text-muted-foreground">
        <li className="flex items-start gap-2">
          <Trash2 className="h-3.5 w-3.5 mt-0.5 shrink-0 text-teal-600" />
          <span>Gespraeche werden <strong>nicht gespeichert</strong> und nach Sitzungsende automatisch geloescht.</span>
        </li>
        <li className="flex items-start gap-2">
          <Shield className="h-3.5 w-3.5 mt-0.5 shrink-0 text-teal-600" />
          <span>Verschluesselte Uebertragung. Keine Weitergabe an Dritte.</span>
        </li>
        <li className="flex items-start gap-2">
          <Shield className="h-3.5 w-3.5 mt-0.5 shrink-0 text-teal-600" />
          <span>DSGVO-konform. Serverstandort Deutschland/EU.</span>
        </li>
      </ul>
    </div>
  )
}
