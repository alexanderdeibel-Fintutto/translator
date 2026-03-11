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
  // Track the transport that was actually subscribed — always use this for
  // broadcast() and unsubscribe() to avoid the transport-switching bug where
  // connection.initialize() creates a new transport that replaces
  // externalTransport via state update, but the new transport was never
  // subscribed to a channel.
  const subscribedTransportRef = useRef<BroadcastTransport | null>(null)

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
    subscribedTransportRef.current = transport

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
    // Always use the transport that was actually subscribed to a channel.
    // Falls back to externalTransport/transportRef only if subscribe() hasn't
    // been called yet (e.g. speaker-only broadcast before listeners connect).
    const transport = subscribedTransportRef.current || externalTransport || transportRef.current
    transport?.broadcast(event, payload)
  }, [externalTransport])

  const unsubscribe = useCallback(() => {
    cleanupRef.current?.()
    cleanupRef.current = null

    // Unsubscribe from the transport that was actually subscribed
    const transport = subscribedTransportRef.current || externalTransport || transportRef.current
    transport?.unsubscribe()

    subscribedTransportRef.current = null
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
