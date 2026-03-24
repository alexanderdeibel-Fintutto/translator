/**
 * Trust Signal
 *
 * Multilingual privacy assurance for vulnerable users.
 * Explains in multiple languages that the app is safe and private.
 *
 * Used by: ngo-client, authority-visitor
 */

import { ShieldCheck } from 'lucide-react'

const TRUST_MESSAGES: { lang: string; message: string; dir?: 'rtl' }[] = [
  { lang: 'Deutsch', message: 'Diese App speichert nichts. Ihr Gespraech ist privat.' },
  { lang: 'English', message: 'This app stores nothing. Your conversation is private.' },
  { lang: 'العربية', message: 'هذا التطبيق لا يخزن شيئا. محادثتك خاصة.', dir: 'rtl' },
  { lang: 'فارسی', message: 'این برنامه چیزی ذخیره نمی‌کند. مکالمه شما خصوصی است.', dir: 'rtl' },
  { lang: 'Türkçe', message: 'Bu uygulama hiçbir şey kaydetmez. Görüşmeniz gizlidir.' },
  { lang: 'Français', message: 'Cette application ne stocke rien. Votre conversation est privée.' },
  { lang: 'Українська', message: 'Цей додаток нічого не зберігає. Ваша розмова приватна.' },
  { lang: 'Soomaali', message: 'Barnaamijkan waxba ma kaydiyo. Wada hadalkaagu waa qarsoodi.' },
]

interface TrustSignalProps {
  /** Number of languages to show (default: 4) */
  maxLanguages?: number
  /** Compact single-line mode */
  compact?: boolean
}

export default function TrustSignal({ maxLanguages = 4, compact = false }: TrustSignalProps) {
  const messages = TRUST_MESSAGES.slice(0, maxLanguages)

  if (compact) {
    return (
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-green-600" />
        <span>{TRUST_MESSAGES[0].message}</span>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-900/10 p-4 space-y-3">
      <div className="flex items-center gap-2">
        <ShieldCheck className="h-5 w-5 text-green-600 dark:text-green-400" />
        <h3 className="font-semibold text-sm">Sicher & Privat / Safe & Private</h3>
      </div>
      <div className="space-y-2">
        {messages.map((msg, i) => (
          <p
            key={i}
            className="text-xs text-muted-foreground"
            dir={msg.dir || 'ltr'}
          >
            <span className="font-medium text-foreground">{msg.lang}:</span>{' '}
            {msg.message}
          </p>
        ))}
      </div>
    </div>
  )
}
