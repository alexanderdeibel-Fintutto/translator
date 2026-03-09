import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { resolve } from 'path'

const ROOT = resolve(__dirname, '../../..')

describe('Monitoring initialization in main.tsx', () => {
  const source = readFileSync(resolve(ROOT, 'src/main.tsx'), 'utf-8')

  it('calls initSentry()', () => {
    expect(source).toContain("import { initSentry")
    expect(source).toContain('initSentry()')
  })

  it('calls initAnalytics()', () => {
    expect(source).toContain("import { initAnalytics")
    expect(source).toContain('initAnalytics()')
  })

  it('calls initWebVitals()', () => {
    expect(source).toContain("import { initWebVitals")
    expect(source).toContain('initWebVitals()')
  })

  it('calls initAdminReporter()', () => {
    expect(source).toContain("import { initAdminReporter")
    expect(source).toContain('initAdminReporter()')
  })

  it('has global error listener', () => {
    expect(source).toContain("window.addEventListener('error'")
  })

  it('has unhandledrejection listener', () => {
    expect(source).toContain("window.addEventListener('unhandledrejection'")
  })

  it('reports global errors to Sentry and analytics', () => {
    expect(source).toContain('captureError(')
    expect(source).toContain('trackError(')
  })
})

describe('ErrorBoundary reporting', () => {
  const source = readFileSync(resolve(ROOT, 'src/components/ErrorBoundary.tsx'), 'utf-8')

  it('imports captureError and trackError', () => {
    expect(source).toContain("import { captureError }")
    expect(source).toContain("import { trackError }")
  })

  it('calls captureError in componentDidCatch', () => {
    const catchBlock = source.slice(source.indexOf('componentDidCatch'))
    expect(catchBlock).toContain('captureError(error')
  })

  it('calls trackError in componentDidCatch', () => {
    const catchBlock = source.slice(source.indexOf('componentDidCatch'))
    expect(catchBlock).toContain('trackError(')
  })
})
