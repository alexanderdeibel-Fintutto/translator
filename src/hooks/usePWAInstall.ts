import { useState, useEffect, useCallback } from 'react'

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isInstalled, setIsInstalled] = useState(false)

  useEffect(() => {
    // Check if already installed as PWA
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true)
      return
    }

    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
    }

    window.addEventListener('beforeinstallprompt', handler)

    // Detect when app is installed
    window.addEventListener('appinstalled', () => {
      setDeferredPrompt(null)
      setIsInstalled(true)
    })

    return () => {
      window.removeEventListener('beforeinstallprompt', handler)
    }
  }, [])

  const canInstall = !!deferredPrompt && !isInstalled

  const install = useCallback(async () => {
    if (!deferredPrompt) return false
    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    setDeferredPrompt(null)
    if (outcome === 'accepted') {
      setIsInstalled(true)
      return true
    }
    return false
  }, [deferredPrompt])

  const dismiss = useCallback(() => {
    setDeferredPrompt(null)
    sessionStorage.setItem('pwa-install-dismissed', 'true')
  }, [])

  const wasDismissed = typeof sessionStorage !== 'undefined' &&
    sessionStorage.getItem('pwa-install-dismissed') === 'true'

  return {
    canInstall: canInstall && !wasDismissed,
    isInstalled,
    install,
    dismiss,
  }
}
