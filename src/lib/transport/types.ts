// Transport abstraction layer
// Allows switching between Supabase (cloud) and local WebSocket (offline) transport

import type { TranslationChunk, SessionInfo, StatusMessage, PresenceState } from '@/lib/session'

// --- Connection mode ---

export type ConnectionMode = 'cloud' | 'local' | 'hotspot' | 'ble' | 'auto'

export interface ConnectionConfig {
  mode: ConnectionMode
  /** Local WebSocket server URL, e.g. ws://192.168.8.1:8765 */
  localServerUrl?: string
  /** BLE device ID of the speaker's GATT server (listener side only) */
  bleDeviceId?: string
  /** Session code for BLE speaker mode (needed to start GATT server) */
  bleSessionCode?: string
  /** Source language for BLE speaker mode */
  bleSourceLanguage?: string
}

/** State returned when a hotspot + relay is started */
export interface HotspotInfo {
  ssid: string
  password: string
  serverUrl: string
  gatewayIp: string
  port: number
  /** iOS: user must manually enable Personal Hotspot */
  manualHotspotRequired?: boolean
}

// --- Broadcast transport ---

// --- Q&A: Visitor questions to host ---

export interface QuestionMessage {
  /** Unique ID so host can reference it when broadcasting */
  questionId: string
  /** Original text in visitor's language */
  text: string
  /** BCP-47 language code of the sender (e.g. 'ar', 'tr') */
  senderLang: string
  /** Display name of the sender device (e.g. 'Patient 3') */
  senderName: string
  timestamp: number
}

/** Host broadcasts an approved question to all listeners */
export interface BroadcastQuestionMessage {
  questionId: string
  /** Text translated into the broadcast language (host's source lang) */
  text: string
  senderLang: string
  senderName: string
  timestamp: number
}

export interface BackChannelMessage {
  responseId: string
  emoji: string
  label: string
  senderLang: string
  timestamp: number
}

export interface ListenerAnnounce {
  targetLanguage: string
  deviceName: string
  /** Timestamp so speaker can expire stale entries */
  ts: number
}

export interface BroadcastHandlers {
  onTranslation?: (chunk: TranslationChunk) => void
  onSessionInfo?: (info: SessionInfo) => void
  onStatus?: (status: StatusMessage) => void
  onBackChannel?: (msg: BackChannelMessage) => void
  onListenerAnnounce?: (data: ListenerAnnounce) => void
  /** Visitor → Host: incoming question (host-side only) */
  onQuestion?: (msg: QuestionMessage) => void
  /** Host → All: approved question broadcast (listener-side) */
  onBroadcastQuestion?: (msg: BroadcastQuestionMessage) => void
}

export interface BroadcastTransport {
  readonly type: 'supabase' | 'local-ws' | 'ble'
  readonly isConnected: boolean

  subscribe(code: string, handlers: BroadcastHandlers): void
  broadcast(event: string, payload: Record<string, unknown>): void
  unsubscribe(): void

  onConnectionChange(callback: (connected: boolean) => void): () => void
}

// --- Presence transport ---

export interface PresenceTransport {
  readonly type: 'supabase' | 'local-ws' | 'ble'

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
