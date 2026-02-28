import { Download, X } from 'lucide-react'
import { usePWAInstall } from '@/hooks/usePWAInstall'

export default function PWAInstallBanner() {
  const { canInstall, install, dismiss } = usePWAInstall()

  if (!canInstall) return null

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-md animate-in slide-in-from-bottom-4 duration-300">
      <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 shadow-lg">
        <div className="shrink-0 h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <Download className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium">App installieren</p>
          <p className="text-xs text-muted-foreground truncate">
            Offline nutzen, schneller starten
          </p>
        </div>
        <button
          onClick={install}
          className="shrink-0 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          OK
        </button>
        <button
          onClick={dismiss}
          className="shrink-0 p-1 rounded-md hover:bg-muted transition-colors text-muted-foreground"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
