// Encrypted broadcast transport decorator.
// Wraps any BroadcastTransport and transparently encrypts outgoing broadcasts
// and decrypts incoming broadcasts using the session code as shared secret.

import { encrypt, decrypt, isE2ESupported, clearKeyCache } from './crypto'
import type { BroadcastTransport, BroadcastHandlers } from './types'

/**
 * Wraps a BroadcastTransport with AES-256-GCM encryption.
 *
 * - broadcast(): encrypts payload JSON before sending
 * - subscribe(): decrypts incoming payloads before passing to handlers
 * - Falls back to plaintext if Web Crypto API is unavailable
 *
 * The session code (passed to subscribe/broadcast) is used to derive the key.
 */
export class EncryptedBroadcastTransport implements BroadcastTransport {
  get type() { return this.inner.type }
  get isConnected() { return this.inner.isConnected }

  private sessionCode: string | null = null

  constructor(private inner: BroadcastTransport) {}

  onConnectionChange(callback: (connected: boolean) => void): () => void {
    return this.inner.onConnectionChange(callback)
  }

  subscribe(code: string, handlers: BroadcastHandlers): void {
    this.sessionCode = code

    if (!isE2ESupported()) {
      // No crypto available — pass through unencrypted
      this.inner.subscribe(code, handlers)
      return
    }

    // Wrap handlers to decrypt incoming payloads
    const wrappedHandlers: BroadcastHandlers = {}

    if (handlers.onTranslation) {
      const original = handlers.onTranslation
      wrappedHandlers.onTranslation = (chunk) => {
        this.decryptPayload(chunk).then(original).catch(() => {
          // Decryption failed — try plaintext fallback (sender might not encrypt)
          original(chunk)
        })
      }
    }

    if (handlers.onSessionInfo) {
      const original = handlers.onSessionInfo
      wrappedHandlers.onSessionInfo = (info) => {
        this.decryptPayload(info).then(original).catch(() => {
          original(info)
        })
      }
    }

    if (handlers.onStatus) {
      const original = handlers.onStatus
      wrappedHandlers.onStatus = (status) => {
        this.decryptPayload(status).then(original).catch(() => {
          original(status)
        })
      }
    }

    this.inner.subscribe(code, wrappedHandlers)
  }

  broadcast(event: string, payload: Record<string, unknown>): void {
    if (!isE2ESupported() || !this.sessionCode) {
      this.inner.broadcast(event, payload)
      return
    }

    // Encrypt and send with { _encrypted: ciphertext } envelope
    encrypt(JSON.stringify(payload), this.sessionCode)
      .then((ciphertext) => {
        this.inner.broadcast(event, { _encrypted: ciphertext })
      })
      .catch(() => {
        // Encryption failed — send plaintext as fallback
        this.inner.broadcast(event, payload)
      })
  }

  unsubscribe(): void {
    this.inner.unsubscribe()
    clearKeyCache()
    this.sessionCode = null
  }

  /**
   * If payload contains { _encrypted: string }, decrypt it.
   * Otherwise return the original payload (plaintext compatibility).
   */
  private async decryptPayload<T>(payload: T): Promise<T> {
    const obj = payload as Record<string, unknown>
    if (typeof obj._encrypted !== 'string' || !this.sessionCode) {
      return payload
    }

    const plaintext = await decrypt(obj._encrypted, this.sessionCode)
    return JSON.parse(plaintext) as T
  }
}
