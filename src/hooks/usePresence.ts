import { useState, useCallback, useRef, useMemo, useEffect } from 'react'
import type { PresenceTransport } from '@/lib/transport/types'
import { SupabasePresenceTransport } from '@/lib/transport/supabase-transport'
import type { PresenceState } from '@/lib/session'

export function usePresence(externalTransport?: PresenceTransport) {
  const [listeners, setListeners] = useState<PresenceState[]>([])
  const transportRef = useRef<PresenceTransport | null>(null)
  const cleanupRef = useRef<(() => void) | null>(null)
  // Track the transport that was actually joined — always use this for
  // updatePresence() and leave() to avoid the transport-switching bug.
  const joinedTransportRef = useRef<PresenceTransport | null>(null)

  // Use external transport or create default Supabase transport
  const getTransport = useCallback((): PresenceTransport => {
    if (externalTransport) return externalTransport
    if (!transportRef.current) {
      transportRef.current = new SupabasePresenceTransport()
    }
    return transportRef.current
  }, [externalTransport])

  // Clean up sync listener on unmount
  useEffect(() => {
    return () => {
      cleanupRef.current?.()
    }
  }, [])

  const join = useCallback((code: string, presenceData: PresenceState) => {
    // Clean up previous
    cleanupRef.current?.()

    const transport = getTransport()
    joinedTransportRef.current = transport

    // Listen for presence sync
    cleanupRef.current = transport.onSync((allListeners) => {
      setListeners(allListeners)
    })

    transport.join(code, presenceData)
  }, [getTransport])

  const updatePresence = useCallback((data: Partial<PresenceState>) => {
    // Always use the transport that was actually joined to a channel
    const transport = joinedTransportRef.current || externalTransport || transportRef.current
    transport?.updatePresence(data)
  }, [externalTransport])

  const leave = useCallback(() => {
    cleanupRef.current?.()
    cleanupRef.current = null

    // Leave on the transport that was actually joined
    const transport = joinedTransportRef.current || externalTransport || transportRef.current
    transport?.leave()

    joinedTransportRef.current = null
    if (!externalTransport) {
      transportRef.current = null
    }
    setListeners([])
  }, [externalTransport])

  const listenerCount = listeners.length

  const listenersByLanguage = useMemo(() => {
    const map: Record<string, number> = {}
    for (const l of listeners) {
      map[l.targetLanguage] = (map[l.targetLanguage] || 0) + 1
    }
    return map
  }, [listeners])

  return {
    listeners,
    listenerCount,
    listenersByLanguage,
    join,
    updatePresence,
    leave,
  }
}
