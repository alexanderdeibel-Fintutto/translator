import { useState, useEffect, useCallback, useRef } from 'react'
import {
  isBleAvailable,
  startBleScanning,
  startBleAdvertising,
  stopBleAdvertising,
  type DiscoveredSession,
} from '@/lib/ble-discovery'
import { useI18n } from '@/context/I18nContext'

/**
 * Hook for BLE session discovery on the listener side.
 * Scans for nearby GuideTranslator speakers and returns discovered sessions.
 */
export function useBleScanner() {
  const { t } = useI18n()
  const [sessions, setSessions] = useState<DiscoveredSession[]>([])
  const [isScanning, setIsScanning] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const cleanupRef = useRef<(() => void) | null>(null)

  const startScan = useCallback(async () => {
    if (!isBleAvailable() || isScanning) return

    setError(null)
    try {
      const cleanup = await startBleScanning((session) => {
        setSessions(prev => {
          // Update existing or add new
          const existing = prev.findIndex(s => s.sessionCode === session.sessionCode)
          if (existing >= 0) {
            const updated = [...prev]
            updated[existing] = session
            return updated
          }
          return [...prev, session]
        })
      })

      cleanupRef.current = cleanup
      setIsScanning(true)
    } catch (err) {
      console.error('[BLE Scanner] Failed to start:', err)
      setError(err instanceof Error ? err.message : t('error.bleScanFailed'))
    }
  }, [isScanning])

  const stopScan = useCallback(() => {
    cleanupRef.current?.()
    cleanupRef.current = null
    setIsScanning(false)
  }, [])

  // Clean up stale sessions (not seen in 10s)
  useEffect(() => {
    if (!isScanning) return

    const interval = setInterval(() => {
      const cutoff = Date.now() - 10_000
      setSessions(prev => prev.filter(s => s.lastSeen > cutoff))
    }, 5000)

    return () => clearInterval(interval)
  }, [isScanning])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupRef.current?.()
    }
  }, [])

  return {
    sessions,
    isScanning,
    error,
    startScan,
    stopScan,
    isAvailable: isBleAvailable(),
  }
}

/**
 * Hook for BLE advertising on the speaker side.
 * Automatically starts advertising when sessionCode is provided.
 */
export function useBleAdvertiser(sessionCode: string | null) {
  const [isAdvertising, setIsAdvertising] = useState(false)

  useEffect(() => {
    if (!sessionCode || !isBleAvailable()) return

    let cancelled = false

    startBleAdvertising(sessionCode)
      .then(() => {
        if (!cancelled) setIsAdvertising(true)
      })
      .catch(err => {
        console.warn('[BLE Advertiser] Failed to start:', err)
      })

    return () => {
      cancelled = true
      stopBleAdvertising()
      setIsAdvertising(false)
    }
  }, [sessionCode])

  return { isAdvertising }
}
