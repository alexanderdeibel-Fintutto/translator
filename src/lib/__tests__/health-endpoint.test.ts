import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { resolve } from 'path'

const ROOT = resolve(__dirname, '../../..')

describe('Health endpoint', () => {
  const source = readFileSync(resolve(ROOT, 'api/health.ts'), 'utf-8')

  it('exists and exports a handler', () => {
    expect(source).toContain('export default async function handler')
  })

  it('uses edge runtime', () => {
    expect(source).toContain("runtime: 'edge'")
  })

  it('checks translate, tts, and supabase services', () => {
    expect(source).toContain('/api/translate')
    expect(source).toContain('/api/tts')
    expect(source).toContain('supabase')
  })

  it('uses AbortController timeout', () => {
    expect(source).toContain('AbortController')
    expect(source).toContain('controller.abort()')
  })

  it('returns proper HTTP status codes', () => {
    expect(source).toContain('200')
    expect(source).toContain('503')
  })

  it('uses CORS allowlist (no wildcard)', () => {
    expect(source).toContain('isAllowedOrigin')
    expect(source).not.toMatch(/['"]Access-Control-Allow-Origin['"]:\s*['"]\*['"]/)
  })

  it('includes Cache-Control: no-cache', () => {
    expect(source).toContain('no-cache')
  })
})
