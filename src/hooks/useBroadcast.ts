import { useState, useCallback, useRef, useEffect } from 'react'
import type { BroadcastTransport, BroadcastHandlers } from '@/lib/transport/types'
import { SupabaseBroadcastTransport } from '@/lib/transport/supabase-transport'


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
    handlers: BroadcastHandlers,
  ) => {
    // Clean up previous
    cleanupRef.current?.()

    const transport = getTransport()

    // Listen for connection changes
    cleanupRef.current = transport.onConnectionChange((connected) => {
      setIsConnected(connected)
    })

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

  /** Get diagnostic info from the active transport (for debug panel) */
  const getDiagnostics = useCallback(() => {
    const transport = externalTransport || transportRef.current
    if (transport && 'diagnosticLastMessageAt' in transport) {
      const t = transport as SupabaseBroadcastTransport
      return {
        lastMessageAt: t.diagnosticLastMessageAt,
        receivedCount: t.diagnosticReceivedCount,
        reconnectCount: t.diagnosticReconnectCount,
      }
    }
    return { lastMessageAt: 0, receivedCount: 0, reconnectCount: 0 }
  }, [externalTransport])

  return {
    isConnected,
    subscribe,
    broadcast,
    unsubscribe,
    getDiagnostics,
    /** The active transport type ('supabase' or 'local-ws') */
    transportType: (externalTransport || transportRef.current)?.type ?? 'supabase',
  }
}
