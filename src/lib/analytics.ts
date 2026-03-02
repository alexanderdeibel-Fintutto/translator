// Google Analytics 4 + Custom Event Tracking
// All events are also forwarded to the admin dashboard reporter

import ReactGA from 'react-ga4'
import { reportEvent } from './admin-reporter'

const GA_ID = import.meta.env.VITE_GA_MEASUREMENT_ID as string | undefined

let initialized = false

export function initAnalytics() {
  if (initialized) return
  if (!GA_ID) {
    console.warn('[Analytics] VITE_GA_MEASUREMENT_ID not set — GA4 disabled')
    return
  }
  ReactGA.initialize(GA_ID, {
    gaOptions: { anonymizeIp: true },
  })
  initialized = true
}

// --- Page views ---

export function trackPageView(path: string) {
  if (initialized) {
    ReactGA.send({ hitType: 'pageview', page: path })
  }
  reportEvent('page_view', { path })
}

// --- Translation events ---

export interface TranslationEventData {
  sourceLang: string
  targetLang: string
  mode: 'text' | 'voice' | 'camera' | 'conversation'
  provider: string
  latencyMs: number
  textLength: number
  success: boolean
  error?: string
}

export function trackTranslation(data: TranslationEventData) {
  const params = {
    source_lang: data.sourceLang,
    target_lang: data.targetLang,
    mode: data.mode,
    provider: data.provider,
    latency_ms: Math.round(data.latencyMs),
    text_length: data.textLength,
    success: data.success,
    ...(data.error && { error: data.error }),
  }

  if (initialized) {
    ReactGA.event('translation', params)
  }
  reportEvent('translation', params)
}

// --- Session events (Live / Conversation) ---

export interface SessionEventData {
  action: 'created' | 'joined' | 'ended'
  mode: 'cloud' | 'local' | 'ble'
  sessionCode?: string
  durationMs?: number
  participantCount?: number
}

export function trackSession(data: SessionEventData) {
  const params = {
    action: data.action,
    connection_mode: data.mode,
    ...(data.sessionCode && { session_code: data.sessionCode }),
    ...(data.durationMs && { duration_ms: data.durationMs }),
    ...(data.participantCount && { participant_count: data.participantCount }),
  }

  if (initialized) {
    ReactGA.event('live_session', params)
  }
  reportEvent('live_session', params)
}

// --- Error events ---

export interface ErrorEventData {
  type: 'js_error' | 'api_error' | 'network_error' | 'permission_error'
  message: string
  source?: string
  stack?: string
  statusCode?: number
}

export function trackError(data: ErrorEventData) {
  const params = {
    error_type: data.type,
    error_message: data.message.slice(0, 500),
    ...(data.source && { error_source: data.source }),
    ...(data.statusCode && { status_code: data.statusCode }),
  }

  if (initialized) {
    ReactGA.event('app_error', params)
  }
  reportEvent('app_error', { ...params, stack: data.stack?.slice(0, 2000) })
}

// --- Feature usage ---

export function trackFeatureUsage(feature: string, details?: Record<string, string | number | boolean>) {
  const params = { feature, ...details }

  if (initialized) {
    ReactGA.event('feature_use', params)
  }
  reportEvent('feature_use', params)
}

// --- Performance metrics (forwarded from web-vitals) ---

export function trackPerformance(metric: string, value: number, rating: string) {
  const params = { metric, value: Math.round(value), rating }

  if (initialized) {
    ReactGA.event('web_vital', params)
  }
  reportEvent('web_vital', params)
}
