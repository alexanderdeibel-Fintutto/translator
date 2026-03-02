// E2E encryption for transport layer using AES-GCM via Web Crypto API.
// The session code acts as a shared secret — both speaker and listeners derive
// the same encryption key from it. This prevents eavesdropping on local
// networks (hotspot/router mode) without adding a key exchange step.

const ALGORITHM = 'AES-GCM'
const KEY_LENGTH = 256
const IV_LENGTH = 12 // 96 bits recommended for AES-GCM
const SALT = 'guidetranslator-e2e-v1'

let cachedKey: CryptoKey | null = null
let cachedCode: string | null = null

/**
 * Derive an AES-256-GCM key from a session code using PBKDF2.
 * Cached per session code to avoid re-deriving on every message.
 */
async function getKey(sessionCode: string): Promise<CryptoKey> {
  if (cachedKey && cachedCode === sessionCode) return cachedKey

  const encoder = new TextEncoder()
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(sessionCode),
    'PBKDF2',
    false,
    ['deriveKey'],
  )

  cachedKey = await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: encoder.encode(SALT),
      iterations: 100_000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: ALGORITHM, length: KEY_LENGTH },
    false,
    ['encrypt', 'decrypt'],
  )
  cachedCode = sessionCode
  return cachedKey
}

/**
 * Encrypt a plaintext string using AES-256-GCM.
 * Returns a base64 string containing: IV (12 bytes) + ciphertext + auth tag.
 */
export async function encrypt(plaintext: string, sessionCode: string): Promise<string> {
  const key = await getKey(sessionCode)
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH))
  const encoded = new TextEncoder().encode(plaintext)

  const ciphertext = await crypto.subtle.encrypt(
    { name: ALGORITHM, iv },
    key,
    encoded,
  )

  // Concatenate IV + ciphertext (auth tag is appended by AES-GCM)
  const combined = new Uint8Array(IV_LENGTH + ciphertext.byteLength)
  combined.set(iv, 0)
  combined.set(new Uint8Array(ciphertext), IV_LENGTH)

  return btoa(String.fromCharCode(...combined))
}

/**
 * Decrypt a base64-encoded AES-256-GCM ciphertext.
 * Expects: IV (12 bytes) + ciphertext + auth tag.
 */
export async function decrypt(encoded: string, sessionCode: string): Promise<string> {
  const key = await getKey(sessionCode)
  const combined = Uint8Array.from(atob(encoded), c => c.charCodeAt(0))

  const iv = combined.slice(0, IV_LENGTH)
  const ciphertext = combined.slice(IV_LENGTH)

  const plaintext = await crypto.subtle.decrypt(
    { name: ALGORITHM, iv },
    key,
    ciphertext,
  )

  return new TextDecoder().decode(plaintext)
}

/**
 * Check if Web Crypto API is available for E2E encryption.
 */
export function isE2ESupported(): boolean {
  return typeof crypto !== 'undefined' &&
    typeof crypto.subtle !== 'undefined' &&
    typeof crypto.getRandomValues === 'function'
}

/**
 * Clear the cached key (e.g., when leaving a session).
 */
export function clearKeyCache(): void {
  cachedKey = null
  cachedCode = null
}
