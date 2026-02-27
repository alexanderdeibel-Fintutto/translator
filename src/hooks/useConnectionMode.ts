import { useState, useCallback, useRef, useEffect } from 'react'
import type { ConnectionConfig, BroadcastTransport, PresenceTransport } from '@/lib/transport/types'
import {
  autoSelectTransport,
  createTransports,
  cleanupLocalConnections,
  type TransportPair,
} from '@/lib/transport/connection-manager'

export interface ConnectionState {
  mode: 'cloud' | 'local'
  serverUrl?: string
  isResolving: boolean
  broadcastTransport: BroadcastTransport | undefined
  presenceTransport: PresenceTransport | undefined
}

/**
 * Hook to manage the connection mode (cloud vs local).
 * Creates and provides the appropriate transport instances.
 */
export function useConnectionMode() {
  const [state, setState] = useState<ConnectionState>({
    mode: 'cloud',
    isResolving: false,
    broadcastTransport: undefined,
    presenceTransport: undefined,
  })

  const transportPairRef = useRef<TransportPair | null>(null)

  // Initialize with a config (called before creating/joining a session)
  const initialize = useCallback(async (config: ConnectionConfig) => {
    setState(prev => ({ ...prev, isResolving: true }))

    try {
      // Clean up previous local connections
      if (transportPairRef.current?.serverUrl) {
        cleanupLocalConnections(transportPairRef.current.serverUrl)
      }

      let pair: TransportPair

      if (config.mode === 'auto') {
        pair = await autoSelectTransport(config)
      } else {
        pair = createTransports(config)
      }

      transportPairRef.current = pair

      setState({
        mode: pair.mode,
        serverUrl: pair.serverUrl,
        isResolving: false,
        broadcastTransport: pair.broadcast,
        presenceTransport: pair.presence,
      })

      return pair
    } catch (err) {
      console.error('[ConnectionMode] Failed to initialize:', err)
      // Fallback to cloud
      const pair = createTransports({ mode: 'cloud' })
      transportPairRef.current = pair

      setState({
        mode: 'cloud',
        isResolving: false,
        broadcastTransport: pair.broadcast,
        presenceTransport: pair.presence,
      })

      return pair
    }
  }, [])

  // Quick switch to cloud mode (no async)
  const switchToCloud = useCallback(() => {
    if (transportPairRef.current?.serverUrl) {
      cleanupLocalConnections(transportPairRef.current.serverUrl)
    }

    const pair = createTransports({ mode: 'cloud' })
    transportPairRef.current = pair

    setState({
      mode: 'cloud',
      isResolving: false,
      broadcastTransport: pair.broadcast,
      presenceTransport: pair.presence,
    })
  }, [])

  // Quick switch to local mode (with known URL)
  const switchToLocal = useCallback((serverUrl: string) => {
    if (transportPairRef.current?.serverUrl) {
      cleanupLocalConnections(transportPairRef.current.serverUrl)
    }

    const pair = createTransports({ mode: 'local', localServerUrl: serverUrl })
    transportPairRef.current = pair

    setState({
      mode: 'local',
      serverUrl,
      isResolving: false,
      broadcastTransport: pair.broadcast,
      presenceTransport: pair.presence,
    })
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (transportPairRef.current?.serverUrl) {
        cleanupLocalConnections(transportPairRef.current.serverUrl)
      }
    }
  }, [])

  return {
    ...state,
    initialize,
    switchToCloud,
    switchToLocal,
  }
}
