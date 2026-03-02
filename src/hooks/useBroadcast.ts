import { useState, useCallback, useRef, useEffect } from 'react'
import type { BroadcastTransport, BroadcastHandlers } from '@/lib/transport/types'
import { SupabaseBroadcastTransport } from '@/lib/transport/supabase-transport'
import type { TranslationChunk, SessionInfo, StatusMessage } from '@/lib/session'

type TranslationHandler = (chunk: TranslationChunk) => void
type SessionInfoHandler = (info: SessionInfo) => void
type StatusHandler = (status: StatusMessage) => void

export function useBroadcast(externalTransport?: BroadcastTransport) {
  const [isConnected, setIsConnected] = useState(false)
  const transportRef = useRef<BroadcastTransport | null>(null)
  const cleanupRef = useRef<(() => void) | null>(null)

  // Use external transport or create default Supabase transport
  const getTransport = useCallback((): BroadcastTransport => {
    if (externalTransport) return externalTransport
    if (!transportRef.current) {
      transportRef.current = new SupabaseBroadcastTransport()
    }
    return transportRef.current
  }, [externalTransport])

  // Clean up connection listener on unmount
  useEffect(() => {
    return () => {
      cleanupRef.current?.()
    }
  }, [])

  const subscribe = useCallback((
    code: string,
    onTranslation?: TranslationHandler,
    onSessionInfo?: SessionInfoHandler,
    onStatus?: StatusHandler,
  ) => {
    // Clean up previous
    cleanupRef.current?.()

    const transport = getTransport()

    // Listen for connection changes
    cleanupRef.current = transport.onConnectionChange((connected) => {
      setIsConnected(connected)
    })

    const handlers: BroadcastHandlers = {
      onTranslation,
      onSessionInfo,
      onStatus,
    }

    transport.subscribe(code, handlers)
  }, [getTransport])

  const broadcast = useCallback((event: string, payload: Record<string, unknown>) => {
    const transport = externalTransport || transportRef.current
    transport?.broadcast(event, payload)
  }, [externalTransport])

  const unsubscribe = useCallback(() => {
    cleanupRef.current?.()
    cleanupRef.current = null

    const transport = externalTransport || transportRef.current
    transport?.unsubscribe()

    if (!externalTransport) {
      transportRef.current = null
    }
    setIsConnected(false)
  }, [externalTransport])

  return {
    isConnected,
    subscribe,
    broadcast,
    unsubscribe,
    /** The active transport type ('supabase' or 'local-ws') */
    transportType: (externalTransport || transportRef.current)?.type ?? 'supabase',
  }
}
