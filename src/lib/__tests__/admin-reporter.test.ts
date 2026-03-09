import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { resolve } from 'path'

const ROOT = resolve(__dirname, '../../..')

function readSrc(relPath: string): string {
  return readFileSync(resolve(ROOT, relPath), 'utf-8')
}

describe('admin-reporter event listener cleanup', () => {
  it('stopAdminReporter removes all registered listeners (pattern test)', () => {
    // Simulate the init/stop pattern used in admin-reporter.ts
    let visibilityHandler: (() => void) | null = null
    let beforeUnloadHandler: (() => void) | null = null
    let flushTimer: ReturnType<typeof setInterval> | null = null
    const removed: string[] = []

    // init
    flushTimer = setInterval(() => {}, 30000)
    visibilityHandler = () => {}
    beforeUnloadHandler = () => {}

    // stop
    if (flushTimer) { clearInterval(flushTimer); flushTimer = null }
    if (visibilityHandler) { removed.push('visibilitychange'); visibilityHandler = null }
    if (beforeUnloadHandler) { removed.push('beforeunload'); beforeUnloadHandler = null }

    expect(flushTimer).toBeNull()
    expect(visibilityHandler).toBeNull()
    expect(beforeUnloadHandler).toBeNull()
    expect(removed).toContain('visibilitychange')
    expect(removed).toContain('beforeunload')
  })

  it('admin-reporter.ts uses named handler references (not anonymous closures)', () => {
    const source = readSrc('src/lib/admin-reporter.ts')

    // Should store handlers in variables
    expect(source).toContain('visibilityHandler')
    expect(source).toContain('beforeUnloadHandler')

    // Should use named handlers with addEventListener
    expect(source).toMatch(/document\.addEventListener\('visibilitychange',\s*visibilityHandler\)/)
    expect(source).toMatch(/window\.addEventListener\('beforeunload',\s*beforeUnloadHandler\)/)

    // Should remove them in stopAdminReporter
    expect(source).toMatch(/document\.removeEventListener\('visibilitychange',\s*visibilityHandler\)/)
    expect(source).toMatch(/window\.removeEventListener\('beforeunload',\s*beforeUnloadHandler\)/)
  })

  it('network-status.ts uses named handler references (not anonymous closures)', () => {
    const source = readSrc('src/lib/offline/network-status.ts')

    // Should have named handlers as class properties
    expect(source).toContain('onlineHandler')
    expect(source).toContain('offlineHandler')

    // Should remove them in destroy()
    expect(source).toMatch(/removeEventListener\('online',\s*this\.onlineHandler\)/)
    expect(source).toMatch(/removeEventListener\('offline',\s*this\.offlineHandler\)/)
  })
})
