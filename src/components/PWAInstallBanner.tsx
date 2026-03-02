import { Download, X } from 'lucide-react'
import { usePWAInstall } from '@/hooks/usePWAInstall'
import { useI18n } from '@/context/I18nContext'

export default function PWAInstallBanner() {
  const { t } = useI18n()
  const { canInstall, install, dismiss } = usePWAInstall()

  if (!canInstall) return null

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-md animate-in slide-in-from-bottom-4 duration-300" role="banner">
      <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 shadow-lg">
        <div className="shrink-0 h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <Download className="h-5 w-5 text-primary" aria-hidden="true" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium">{t('pwa.install')}</p>
          <p className="text-xs text-muted-foreground truncate">
            {t('pwa.installDesc')}
          </p>
        </div>
        <button
          onClick={install}
          className="shrink-0 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
          aria-label={t('pwa.install')}
        >
          {t('pwa.ok')}
        </button>
        <button
          onClick={dismiss}
          className="shrink-0 p-1 rounded-md hover:bg-muted transition-colors text-muted-foreground"
          aria-label={t('pwa.dismiss')}
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  )
}
