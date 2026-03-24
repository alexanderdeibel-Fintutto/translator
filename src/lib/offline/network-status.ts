// Network status detection with heartbeat
// Distinguishes between online, degraded (slow/unreliable), and offline

export type NetworkMode = 'online' | 'degraded' | 'offline'

type Listener = (mode: NetworkMode) => void

const HEARTBEAT_INTERVAL = 15_000 // 15 seconds
const HEARTBEAT_TIMEOUT = 5_000   // 5 seconds

class NetworkStatusManager {
  private mode: NetworkMode = navigator.onLine ? 'online' : 'offline'
  private listeners = new Set<Listener>()
  private heartbeatTimer: ReturnType<typeof setInterval> | null = null
  private consecutiveFailures = 0
  private onlineHandler = () => this.handleBrowserEvent(true)
  private offlineHandler = () => this.handleBrowserEvent(false)

  constructor() {
    window.addEventListener('online', this.onlineHandler)
    window.addEventListener('offline', this.offlineHandler)

    // Start heartbeat for more reliable detection
    this.startHeartbeat()
  }

  getMode(): NetworkMode {
    return this.mode
  }

  get isOnline(): boolean {
    return this.mode === 'online'
  }

  get isOffline(): boolean {
    return this.mode === 'offline'
  }

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  private setMode(newMode: NetworkMode) {
    if (this.mode === newMode) return
    this.mode = newMode
    console.log(`[Network] Status changed: ${newMode}`)
    this.listeners.forEach(fn => fn(newMode))
  }

  private handleBrowserEvent(isOnline: boolean) {
    if (!isOnline) {
      this.consecutiveFailures = 3 // Skip to offline immediately
      this.setMode('offline')
    } else {
      // Browser says online, but verify with heartbeat
      this.consecutiveFailures = 0
      this.doHeartbeat()
    }
  }

  private startHeartbeat() {
    if (this.heartbeatTimer) return
    this.heartbeatTimer = setInterval(() => this.doHeartbeat(), HEARTBEAT_INTERVAL)
    // Initial check
    this.doHeartbeat()
  }

  private async doHeartbeat() {
    if (!navigator.onLine) {
      this.consecutiveFailures = 3
      this.setMode('offline')
      return
    }

    try {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), HEARTBEAT_TIMEOUT)

      // Lightweight request — just check if we can reach the network
      // Using a common, reliable endpoint
      const start = Date.now()
      await fetch('https://www.gstatic.com/generate_204', {
        mode: 'no-cors',
        cache: 'no-store',
        signal: controller.signal,
      })
      clearTimeout(timeout)

      const latency = Date.now() - start
      this.consecutiveFailures = 0

      if (latency > 3000) {
        this.setMode('degraded')
      } else {
        this.setMode('online')
      }
    } catch {
      this.consecutiveFailures++
      // Trust navigator.onLine when heartbeat fails (may be blocked by CSP)
      // Only go offline after 3+ failures AND navigator.onLine is false
      if (this.consecutiveFailures >= 3 && !navigator.onLine) {
        this.setMode('offline')
      } else if (this.consecutiveFailures >= 2) {
        // Heartbeat failed but browser says online — stay degraded, not offline
        // This prevents CSP-blocked heartbeats from breaking all translations
        this.setMode(navigator.onLine ? 'degraded' : 'offline')
      }
    }
  }

  destroy() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer)
      this.heartbeatTimer = null
    }
    window.removeEventListener('online', this.onlineHandler)
    window.removeEventListener('offline', this.offlineHandler)
    this.listeners.clear()
  }
}

// Singleton
let instance: NetworkStatusManager | null = null

export function getNetworkStatus(): NetworkStatusManager {
  if (!instance) {
    instance = new NetworkStatusManager()
  }
  return instance
}
