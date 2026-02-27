export type {
  ConnectionMode,
  ConnectionConfig,
  BroadcastTransport,
  BroadcastHandlers,
  PresenceTransport,
  ClientMessage,
  ServerMessage,
  HotspotInfo,
} from './types'

export { SupabaseBroadcastTransport, SupabasePresenceTransport } from './supabase-transport'
export { LocalBroadcastTransport, LocalPresenceTransport } from './local-ws-transport'
export {
  createTransports,
  autoSelectTransport,
  startHotspotTransport,
  stopHotspotTransport,
  startBleTransport,
  stopBleTransport,
  createBleListenerTransports,
  probeLocalServer,
  discoverLocalServer,
  getSessionUrlWithTransport,
  parseSessionUrl,
} from './connection-manager'
export { encrypt, decrypt, isE2ESupported, clearKeyCache } from './crypto'
