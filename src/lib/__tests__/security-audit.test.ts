import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { resolve } from 'path'

// Resolve paths relative to project root
const ROOT = resolve(__dirname, '../../..')

function readSrc(relPath: string): string {
  return readFileSync(resolve(ROOT, relPath), 'utf-8')
}

describe('isSecureContext guard on getUserMedia', () => {
  it('stt.ts has isSecureContext check for every getUserMedia call', () => {
    const source = readSrc('src/lib/stt.ts')

    const getUserMediaCalls = source.match(/getUserMedia/g) || []
    const secureContextChecks = source.match(/isSecureContext/g) || []

    // stt.ts has 2 getUserMedia calls (Web Speech + Google Cloud STT)
    expect(getUserMediaCalls.length).toBeGreaterThanOrEqual(2)
    expect(secureContextChecks.length).toBeGreaterThanOrEqual(2)
  })

  it('stt-engine.ts Whisper provider has isSecureContext check', () => {
    const source = readSrc('src/lib/offline/stt-engine.ts')
    expect(source).toContain('isSecureContext')
    expect(source).toContain('getUserMedia')
  })

  it('isSecureContext check appears before getUserMedia in every start() method', () => {
    for (const path of ['src/lib/stt.ts', 'src/lib/offline/stt-engine.ts']) {
      const source = readSrc(path)

      // Split by start() method boundaries
      const startBlocks = source.split(/async start\(/)
      for (let i = 1; i < startBlocks.length; i++) {
        const block = startBlocks[i]
        // Only check blocks that actually call getUserMedia (not just reference it for isSupported)
        if (!block.includes('await navigator.mediaDevices.getUserMedia')) continue

        const secureIdx = block.indexOf('isSecureContext')
        const mediaIdx = block.indexOf('await navigator.mediaDevices.getUserMedia')
        expect(secureIdx).toBeGreaterThanOrEqual(0)
        expect(secureIdx).toBeLessThan(mediaIdx)
      }
    }
  })
})

describe('hardcoded secrets removal', () => {
  it('supabase.ts has no hardcoded URL or key', () => {
    const source = readSrc('src/lib/supabase.ts')

    expect(source).not.toContain('aaefocdqgdgexkcrjhks.supabase.co')
    expect(source).not.toMatch(/eyJhbGci/)
    expect(source).toContain('VITE_SUPABASE_URL')
    expect(source).toContain('VITE_SUPABASE_ANON_KEY')
  })

  it('api-key.ts has no hardcoded Google API key', () => {
    const source = readSrc('src/lib/api-key.ts')

    expect(source).not.toMatch(/AIzaSy/)
    expect(source).not.toContain('DEFAULT_API_KEY')
  })

  it('UserContext.tsx has no hardcoded Supabase fallback', () => {
    const source = readSrc('src/context/UserContext.tsx')

    expect(source).not.toContain('aaefocdqgdgexkcrjhks')
    expect(source).not.toMatch(/eyJhbGci/)
    expect(source).toContain('import.meta.env.VITE_SUPABASE_URL')
    expect(source).toContain('import.meta.env.VITE_SUPABASE_ANON_KEY')
  })
})

describe('CSP hardening', () => {
  it('vercel.json does not use unsafe-eval', () => {
    const source = readSrc('vercel.json')
    expect(source).not.toContain('unsafe-eval')
    expect(source).toContain('unsafe-inline') // still needed for now
  })
})

describe('setTier access control', () => {
  it('UserContext.tsx restricts setTier to admin/dev only', () => {
    const source = readSrc('src/context/UserContext.tsx')

    expect(source).toMatch(/import\.meta\.env\.DEV/)
    expect(source).toMatch(/user\?\.role\s*===\s*'admin'/)

    const setTierBlock = source.slice(
      source.indexOf('const setTier'),
      source.indexOf('const refreshUsage')
    )
    expect(setTierBlock).toContain('import.meta.env.DEV')
    expect(setTierBlock).toContain("user?.role === 'admin'")
  })
})

describe('CORS — no wildcard in public endpoints', () => {
  it('api/translate.ts has no wildcard CORS', () => {
    const source = readSrc('api/translate.ts')
    expect(source).not.toMatch(/Allow-Origin.*\*/)
    expect(source).toContain('ALLOWED_ORIGINS')
    expect(source).toContain('isAllowedOrigin')
  })

  it('api/tts.ts has no wildcard CORS', () => {
    const source = readSrc('api/tts.ts')
    expect(source).not.toMatch(/Allow-Origin.*\*/)
    expect(source).toContain('ALLOWED_ORIGINS')
  })

  it('api/contact.ts has no wildcard CORS', () => {
    const source = readSrc('api/contact.ts')
    expect(source).not.toMatch(/Allow-Origin.*\*/)
    expect(source).toContain('ALLOWED_ORIGINS')
  })

  it('Supabase edge functions have no wildcard CORS', () => {
    for (const fn of ['stripe-checkout', 'stripe-portal', 'admin-create-user', 'send-email']) {
      const source = readSrc(`supabase/functions/${fn}/index.ts`)
      expect(source).not.toMatch(/'Access-Control-Allow-Origin':\s*'\*'/)
      expect(source).toContain('ALLOWED_ORIGINS')
    }
  })
})
