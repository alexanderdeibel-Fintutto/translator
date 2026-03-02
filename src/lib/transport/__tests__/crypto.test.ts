import { describe, it, expect, afterEach } from 'vitest'
import { encrypt, decrypt, isE2ESupported, clearKeyCache } from '../crypto'

afterEach(() => {
  clearKeyCache()
})

describe('E2E crypto', () => {
  it('isE2ESupported returns true in Node/browser with crypto', () => {
    expect(isE2ESupported()).toBe(true)
  })

  it('encrypts and decrypts a simple message', async () => {
    const message = 'Hallo Welt!'
    const sessionCode = 'ABC-123'

    const encrypted = await encrypt(message, sessionCode)
    expect(encrypted).not.toBe(message)
    expect(typeof encrypted).toBe('string')

    const decrypted = await decrypt(encrypted, sessionCode)
    expect(decrypted).toBe(message)
  })

  it('encrypts and decrypts unicode text', async () => {
    const message = 'Übersetzung: 你好世界 🌍'
    const sessionCode = 'XYZ-789'

    const encrypted = await encrypt(message, sessionCode)
    const decrypted = await decrypt(encrypted, sessionCode)
    expect(decrypted).toBe(message)
  })

  it('encrypts and decrypts JSON payloads', async () => {
    const payload = JSON.stringify({
      event: 'translation',
      text: 'Hello World',
      lang: 'en',
      timestamp: Date.now(),
    })
    const sessionCode = 'TEST-001'

    const encrypted = await encrypt(payload, sessionCode)
    const decrypted = await decrypt(encrypted, sessionCode)
    expect(JSON.parse(decrypted)).toEqual(JSON.parse(payload))
  })

  it('produces different ciphertext for same plaintext (random IV)', async () => {
    const message = 'Same message'
    const sessionCode = 'ABC-123'

    const enc1 = await encrypt(message, sessionCode)
    const enc2 = await encrypt(message, sessionCode)

    // Should produce different ciphertext due to random IV
    expect(enc1).not.toBe(enc2)

    // But both should decrypt to the same plaintext
    expect(await decrypt(enc1, sessionCode)).toBe(message)
    expect(await decrypt(enc2, sessionCode)).toBe(message)
  })

  it('fails to decrypt with wrong session code', async () => {
    const message = 'Secret translation'
    const encrypted = await encrypt(message, 'CORRECT-CODE')

    await expect(decrypt(encrypted, 'WRONG-CODE')).rejects.toThrow()
  })

  it('fails to decrypt tampered ciphertext', async () => {
    const encrypted = await encrypt('Original message', 'ABC-123')

    // Tamper with the ciphertext (flip a character)
    const tampered = encrypted.slice(0, -2) + 'XX'

    await expect(decrypt(tampered, 'ABC-123')).rejects.toThrow()
  })

  it('handles empty string', async () => {
    const encrypted = await encrypt('', 'ABC-123')
    const decrypted = await decrypt(encrypted, 'ABC-123')
    expect(decrypted).toBe('')
  })

  it('handles large payloads', async () => {
    const largeText = 'x'.repeat(10_000)
    const sessionCode = 'LARGE-001'

    const encrypted = await encrypt(largeText, sessionCode)
    const decrypted = await decrypt(encrypted, sessionCode)
    expect(decrypted).toBe(largeText)
    expect(decrypted.length).toBe(10_000)
  })
})
