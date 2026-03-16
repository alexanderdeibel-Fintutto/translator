/**
 * Central monitoring initialization
 *
 * Initializes all monitoring services in the correct order:
 * 1. Admin Reporter (event batching to custom API)
 * 2. Analytics (GA4)
 * 3. Sentry (error tracking)
 * 4. Web Vitals (performance metrics)
 *
 * All services are defensive — they silently disable themselves
 * if their respective environment variables are not set.
 */

import { initAdminReporter } from './admin-reporter'
import { initAnalytics } from './analytics'
import { initSentry } from './sentry'
import { initWebVitals } from './web-vitals'

let initialized = false

export function initMonitoring() {
  if (initialized) return
  initialized = true

  // Admin reporter first (other services forward events to it)
  initAdminReporter()

  // GA4
  initAnalytics()

  // Sentry error tracking
  initSentry()

  // Web Vitals (reports to GA4 + admin)
  initWebVitals()
}
