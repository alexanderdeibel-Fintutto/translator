// API base URL for proxy calls (/api/translate, /api/tts).
// On web (Vercel), relative URLs work fine.
// On native (Capacitor Android/iOS), the WebView origin is https://localhost
// which has no API server — must use the production URL instead.

import { Capacitor } from '@capacitor/core'

const PRODUCTION_URL = 'https://translator.fintutto.cloud'

export function getApiBaseUrl(): string {
  if (Capacitor.isNativePlatform()) {
    return PRODUCTION_URL
  }
  return ''
}
