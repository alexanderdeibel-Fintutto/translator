import { describe, it, expect, vi, beforeEach } from 'vitest'
import { readFileSync } from 'fs'
import { resolve } from 'path'

const ROOT = resolve(__dirname, '../../..')

describe('NetworkStatusManager cleanup', () => {
  it('destroy() removes online/offline event listeners', () => {
    const source = readFileSync(resolve(ROOT, 'src/lib/offline/network-status.ts'), 'utf-8')

    // destroy() must call removeEventListener for both events
    expect(source).toContain("removeEventListener('online'")
    expect(source).toContain("removeEventListener('offline'")
  })

  it('destroy() clears the heartbeat interval', () => {
    const source = readFileSync(resolve(ROOT, 'src/lib/offline/network-status.ts'), 'utf-8')

    // destroy() method must call clearInterval
    const destroyBlock = source.slice(source.indexOf('destroy()'))
    expect(destroyBlock).toContain('clearInterval')
  })

  it('uses bound handler properties (not inline arrow functions in constructor)', () => {
    const source = readFileSync(resolve(ROOT, 'src/lib/offline/network-status.ts'), 'utf-8')

    // Handlers should be class properties, not anonymous arrow functions
    expect(source).toMatch(/private onlineHandler\s*=/)
    expect(source).toMatch(/private offlineHandler\s*=/)

    // Constructor should use the named handlers
    expect(source).toMatch(/addEventListener\('online',\s*this\.onlineHandler\)/)
    expect(source).toMatch(/addEventListener\('offline',\s*this\.offlineHandler\)/)
  })
})
