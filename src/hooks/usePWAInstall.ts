// usePWAInstall — PWA-Installationslogik für fintutto.world
// - Chrome/Edge/Samsung: beforeinstallprompt (nativer Dialog)
// - iOS Safari: isIOSDevice=true → Banner zeigt manuelle Anleitung
// - Dismiss: 7 Tage in localStorage (nicht nur Session) für Behörden-Tablets
import { useState, useEffect, useCallback } from 'react'

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

const DISMISS_KEY = 'pwa-install-dismissed-at'
const DISMISS_TTL_MS = 7 * 24 * 60 * 60 * 1000 // 7 Tage

function isDismissedRecently(): boolean {
  try {
    const ts = localStorage.getItem(DISMISS_KEY)
    if (!ts) return false
    return Date.now() - parseInt(ts, 10) < DISMISS_TTL_MS
  } catch { return false }
}

function isIOSBrowser(): boolean {
  return (
    typeof navigator !== 'undefined' &&
    /iPad|iPhone|iPod/.test(navigator.userAgent) &&
    !(window as unknown as Record<string, unknown>).MSStream
  )
}

function isStandalone(): boolean {
  return (
    typeof window !== 'undefined' &&
    (window.matchMedia('(display-mode: standalone)').matches ||
      (navigator as unknown as Record<string, unknown>).standalone === true)
  )
}

export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isInstalled, setIsInstalled] = useState(false)
  const [dismissed, setDismissed] = useState(isDismissedRecently)

  const isIOSDevice = isIOSBrowser()
  // iOS: show manual guide if not already installed and not dismissed
  const showIOSGuide = isIOSDevice && !isStandalone() && !dismissed

  useEffect(() => {
    if (isStandalone()) {
      setIsInstalled(true)
      return
    }
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
    }
    window.addEventListener('beforeinstallprompt', handler)
    const installedHandler = () => {
      setDeferredPrompt(null)
      setIsInstalled(true)
    }
    window.addEventListener('appinstalled', installedHandler)
    return () => {
      window.removeEventListener('beforeinstallprompt', handler)
      window.removeEventListener('appinstalled', installedHandler)
    }
  }, [])

  const canInstall = (!!deferredPrompt || showIOSGuide) && !isInstalled && !dismissed

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
    setDismissed(true)
    try { localStorage.setItem(DISMISS_KEY, String(Date.now())) } catch { /* ignore */ }
  }, [])

  return {
    canInstall,
    isInstalled,
    isIOSDevice: showIOSGuide, // true = zeige iOS-Anleitung statt nativen Dialog
    install,
    dismiss,
  }
}
