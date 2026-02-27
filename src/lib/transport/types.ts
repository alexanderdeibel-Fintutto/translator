// Transport abstraction layer
// Allows switching between Supabase (cloud) and local WebSocket (offline) transport

import type { TranslationChunk, SessionInfo, StatusMessage, PresenceState } from '@/lib/session'

// --- Connection mode ---

export type ConnectionMode = 'cloud' | 'local' | 'auto'

export interface ConnectionConfig {
  mode: ConnectionMode
  /** Local WebSocket server URL, e.g. ws://192.168.8.1:8765 */
  localServerUrl?: string
}

// --- Broadcast transport ---

export interface BroadcastHandlers {
  onTranslation?: (chunk: TranslationChunk) => void
  onSessionInfo?: (info: SessionInfo) => void
  onStatus?: (status: StatusMessage) => void
}

export interface BroadcastTransport {
  readonly type: 'supabase' | 'local-ws'
  readonly isConnected: boolean

  subscribe(code: string, handlers: BroadcastHandlers): void
  broadcast(event: string, payload: Record<string, unknown>): void
  unsubscribe(): void

  onConnectionChange(callback: (connected: boolean) => void): () => void
}

// --- Presence transport ---

export interface PresenceTransport {
  readonly type: 'supabase' | 'local-ws'

  join(code: string, data: PresenceState): void
  updatePresence(data: Partial<PresenceState>): void
  leave(): void

  onSync(callback: (listeners: PresenceState[]) => void): () => void
}

// --- Local WS protocol messages ---

/** Messages sent FROM client TO server */
export type ClientMessage =
  | { type: 'broadcast'; event: string; payload: Record<string, unknown> }
  | { type: 'presence_join'; data: PresenceState; role: 'speaker' | 'listener' }
  | { type: 'presence_update'; data: Partial<PresenceState> }
  | { type: 'presence_leave' }
  | { type: 'join_session'; code: string }

/** Messages sent FROM server TO clients */
export type ServerMessage =
  | { type: 'broadcast'; event: string; payload: Record<string, unknown> }
  | { type: 'presence_sync'; listeners: PresenceState[] }
  | { type: 'session_joined'; code: string; success: boolean }
  | { type: 'error'; message: string }
  | { type: 'welcome'; serverVersion: string; sessionCount: number }
