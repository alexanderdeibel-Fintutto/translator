// Sentry error tracking integration
// Also forwards errors to admin dashboard reporter

import * as Sentry from '@sentry/react'
import { trackError } from './analytics'

const SENTRY_DSN = import.meta.env.VITE_SENTRY_DSN as string | undefined

let initialized = false

export function initSentry() {
  if (initialized) return
  if (!SENTRY_DSN) {
    console.warn('[Sentry] VITE_SENTRY_DSN not set — Sentry disabled')
    return
  }

  Sentry.init({
    dsn: SENTRY_DSN,
    environment: import.meta.env.MODE,
    release: `translator@${import.meta.env.VITE_APP_VERSION || '0.9.0'}`,
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration({ maskAllText: false, blockAllMedia: false }),
    ],
    // Performance: sample 20% of transactions in production
    tracesSampleRate: import.meta.env.PROD ? 0.2 : 1.0,
    // Session replay: 10% normal, 100% on error
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
    // Don't send PII
    sendDefaultPii: false,
    // Filter noise
    ignoreErrors: [
      'ResizeObserver loop',
      'Non-Error promise rejection',
      'AbortError',
      'NotAllowedError',  // Microphone/camera permission denied
    ],
    beforeSend(event) {
      // Also report to admin dashboard
      trackError({
        type: 'js_error',
        message: event.exception?.values?.[0]?.value || 'Unknown error',
        source: event.exception?.values?.[0]?.type || 'unknown',
        stack: event.exception?.values?.[0]?.stacktrace?.frames
          ?.map(f => `${f.filename}:${f.lineno}:${f.colno} ${f.function || ''}`)
          .join('\n'),
      })
      return event
    },
  })

  initialized = true
}

export function captureError(error: Error, context?: Record<string, unknown>) {
  if (context) {
    Sentry.withScope(scope => {
      scope.setExtras(context)
      Sentry.captureException(error)
    })
  } else {
    Sentry.captureException(error)
  }
}

export function setUser(id: string, traits?: Record<string, string>) {
  Sentry.setUser({ id, ...traits })
}

export function clearUser() {
  Sentry.setUser(null)
}

export { Sentry }
