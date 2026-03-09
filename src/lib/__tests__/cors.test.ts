import { describe, it, expect } from 'vitest'

// Test the CORS logic used in Edge Functions (translate, tts, contact)
// This mirrors the isAllowedOrigin function from api/translate.ts etc.

const ALLOWED_ORIGINS = new Set([
  'https://guidetranslator.com',
  'https://www.guidetranslator.com',
  'https://app.guidetranslator.com',
  'https://listener.guidetranslator.com',
])

function isAllowedOrigin(origin: string | null): boolean {
  if (!origin) return true
  if (ALLOWED_ORIGINS.has(origin)) return true
  try {
    const url = new URL(origin)
    return url.hostname === 'localhost' || url.hostname === '127.0.0.1'
  } catch {
    return false
  }
}

function corsHeaders(origin?: string | null): Record<string, string> {
  const allowedOrigin = origin && isAllowedOrigin(origin) ? origin : ''
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Vary': 'Origin',
  }
}

describe('CORS origin allowlist', () => {
  it('allows production origins', () => {
    expect(isAllowedOrigin('https://guidetranslator.com')).toBe(true)
    expect(isAllowedOrigin('https://www.guidetranslator.com')).toBe(true)
    expect(isAllowedOrigin('https://app.guidetranslator.com')).toBe(true)
    expect(isAllowedOrigin('https://listener.guidetranslator.com')).toBe(true)
  })

  it('allows same-origin requests (null origin)', () => {
    expect(isAllowedOrigin(null)).toBe(true)
  })

  it('allows localhost for development', () => {
    expect(isAllowedOrigin('http://localhost:5173')).toBe(true)
    expect(isAllowedOrigin('http://localhost:3000')).toBe(true)
    expect(isAllowedOrigin('http://localhost:4173')).toBe(true)
  })

  it('allows 127.0.0.1 for development', () => {
    expect(isAllowedOrigin('http://127.0.0.1:5173')).toBe(true)
  })

  it('rejects unknown origins', () => {
    expect(isAllowedOrigin('https://evil.com')).toBe(false)
    expect(isAllowedOrigin('https://guidetranslator.com.evil.com')).toBe(false)
    expect(isAllowedOrigin('https://notguidetranslator.com')).toBe(false)
  })

  it('rejects invalid origins', () => {
    expect(isAllowedOrigin('not-a-url')).toBe(false)
    expect(isAllowedOrigin('')).toBe(true) // empty string is falsy, treated like null
  })

  it('does NOT use wildcard *', () => {
    // Regression: previously all CORS headers used Access-Control-Allow-Origin: *
    const headers = corsHeaders('https://evil.com')
    expect(headers['Access-Control-Allow-Origin']).not.toBe('*')
    expect(headers['Access-Control-Allow-Origin']).toBe('')
  })

  it('echoes back the allowed origin', () => {
    const headers = corsHeaders('https://guidetranslator.com')
    expect(headers['Access-Control-Allow-Origin']).toBe('https://guidetranslator.com')
  })

  it('includes Vary: Origin header', () => {
    const headers = corsHeaders('https://guidetranslator.com')
    expect(headers['Vary']).toBe('Origin')
  })
})
