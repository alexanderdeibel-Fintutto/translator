// api/stt.ts — STT-Proxy für fintutto.world
// ============================================================
// DSGVO-Konformität: Audiodaten gehen NIE direkt vom Browser an externe Provider.
// Alle STT-Anfragen laufen über diesen serverseitigen Proxy.
//
// Provider-Reihenfolge:
//   1. Azure Cognitive Services Speech (West Europe / EU) — bevorzugt für DSGVO
//   2. Google Cloud STT — Fallback (bereits als GOOGLE_API_KEY vorhanden)
//
// Request:  POST /api/stt
//   Body: { audio: string (base64 LINEAR16 PCM), lang: string, sampleRate: number, context?: string }
// Response: { transcript: string, provider: string, confidence?: number, durationMs?: number }
//
// IMPORTANT: Kein Logging von audio-Inhalten. Nur Metadaten (lang, durationMs, provider) loggen.
// IMPORTANT: Keine Persistenz — Audiodaten werden nach der Transkription sofort verworfen.
// IMPORTANT: Azure-Keys: AZURE_STT_KEY_1 (primär) und AZURE_STT_KEY_2 (Failover-Key)
//            Region: westeurope (Amsterdam) — NICHT ändern ohne DSGVO-Prüfung.
//
// Vercel Environment Variables erforderlich:
//   AZURE_STT_KEY_1  — Schlüssel 1 (primär)
//   AZURE_STT_KEY_2  — Schlüssel 2 (Failover, falls Key 1 Rate-Limit erreicht)
//   AZURE_STT_REGION — westeurope (Standard, falls nicht gesetzt)
//   GOOGLE_API_KEY   — bereits vorhanden (für Fallback)

export const config = { runtime: 'edge' }

interface STTRequest {
  audio: string        // Base64-kodiertes LINEAR16 PCM
  lang: string         // BCP-47 Sprachcode (z.B. 'de-DE', 'tr-TR', 'ar-SA')
  sampleRate: number   // Abtastrate in Hz (typisch: 16000)
  context?: string     // 'medical' | 'legal' | 'general' | 'business' | 'travel'
}

interface STTResponse {
  transcript: string
  provider: 'azure' | 'google' | 'error'
  confidence?: number
  durationMs?: number
}

// Azure Cognitive Services Speech REST API v1
// Region: westeurope = Amsterdam/Dublin (EU, DSGVO-konform mit AVV)
const AZURE_STT_BASE = 'https://{region}.stt.speech.microsoft.com/speech/recognition/conversation/cognitiveservices/v1'
const GOOGLE_STT_URL = 'https://speech.googleapis.com/v1/speech:recognize'

// Maximale Audio-Größe: ~60s × 16000 Hz × 2 Bytes × 4/3 (base64) ≈ 2.5 MB
const MAX_AUDIO_BASE64_LENGTH = 3_000_000

// Kontext-spezifische Phrase-Hints für bessere Erkennungsgenauigkeit
const CONTEXT_PHRASES: Record<string, string[]> = {
  medical: [
    'Diagnose', 'Symptom', 'Medikament', 'Rezept', 'Blutdruck', 'Allergie',
    'Überweisung', 'Befund', 'Anamnese', 'Therapie', 'Dosierung', 'Nebenwirkung',
    'Krankenversicherung', 'Notaufnahme', 'Intensivstation', 'Röntgen', 'MRT',
  ],
  legal: [
    'Bescheid', 'Antrag', 'Widerspruch', 'Vollmacht', 'Aufenthaltserlaubnis',
    'Asylantrag', 'Niederlassungserlaubnis', 'Sozialleistung', 'Kindergeld',
    'Einbürgerung', 'Personalausweis', 'Reisepass', 'Meldeadresse',
  ],
  business: [
    'Vertrag', 'Rechnung', 'Angebot', 'Bestellung', 'Lieferung', 'Zahlung',
    'Mehrwertsteuer', 'Geschäftsführer', 'Gesellschaft', 'Haftung',
  ],
  travel: [
    'Ticket', 'Buchung', 'Stornierung', 'Gepäck', 'Check-in', 'Boarding',
    'Verspätung', 'Anschluss', 'Hotel', 'Reservierung',
  ],
}

export default async function handler(req: Request): Promise<Response> {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders(req) })
  }
  if (req.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405, req)
  }

  // Origin-Validierung: Nur eigene Domains
  const origin = req.headers.get('origin') || ''
  if (origin && !isAllowedOrigin(origin)) {
    return json({ error: 'Forbidden' }, 403, req)
  }

  let body: STTRequest
  try {
    body = await req.json()
  } catch {
    return json({ error: 'Invalid JSON body' }, 400, req)
  }

  const { audio, lang, sampleRate, context } = body

  // Eingabe-Validierung
  if (!audio || !lang || !sampleRate) {
    return json({ error: 'Missing required fields: audio, lang, sampleRate' }, 400, req)
  }
  if (audio.length > MAX_AUDIO_BASE64_LENGTH) {
    return json({ error: 'Audio too large (max ~60 seconds)' }, 413, req)
  }
  if (!/^[a-z]{2,3}(-[A-Z]{2,4})?$/.test(lang)) {
    return json({ error: 'Invalid language code format' }, 400, req)
  }
  if (sampleRate < 8000 || sampleRate > 48000) {
    return json({ error: 'Invalid sampleRate (8000–48000 Hz)' }, 400, req)
  }

  const startTime = Date.now()
  const region = (process.env.AZURE_STT_REGION || 'westeurope').trim()

  // ── Provider 1: Azure Cognitive Services (EU, West Europe) ──────────────
  // Zwei Keys für Failover: Key 1 primär, Key 2 wenn Key 1 Rate-Limit (429) erreicht
  const azureKey1 = process.env.AZURE_STT_KEY_1?.trim()
  const azureKey2 = process.env.AZURE_STT_KEY_2?.trim()

  if (azureKey1 || azureKey2) {
    for (const azureKey of [azureKey1, azureKey2].filter(Boolean) as string[]) {
      try {
        const transcript = await transcribeAzure(audio, lang, sampleRate, azureKey, region, context)
        return json({
          transcript,
          provider: 'azure',
          durationMs: Date.now() - startTime,
        } satisfies STTResponse, 200, req)
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err)
        // 429 = Rate limit → try next key; andere Fehler → direkt zu Google
        if (!msg.includes('429')) {
          console.error('[STT-Proxy] Azure error (non-rate-limit):', msg)
          break
        }
        console.warn('[STT-Proxy] Azure key rate-limited, trying next key...')
      }
    }
  }

  // ── Provider 2: Google Cloud STT (Fallback) ──────────────────────────────
  const googleKey = process.env.GOOGLE_API_KEY?.trim()
  if (googleKey) {
    try {
      const transcript = await transcribeGoogle(audio, lang, sampleRate, googleKey, context)
      return json({
        transcript,
        provider: 'google',
        durationMs: Date.now() - startTime,
      } satisfies STTResponse, 200, req)
    } catch (err) {
      console.error('[STT-Proxy] Google STT error:', err instanceof Error ? err.message : String(err))
    }
  }

  return json({ error: 'All STT providers failed or not configured', provider: 'error' }, 503, req)
}

// ── Azure Cognitive Services Speech REST API ─────────────────────────────────
async function transcribeAzure(
  audioBase64: string,
  lang: string,
  sampleRate: number,
  apiKey: string,
  region: string,
  context?: string,
): Promise<string> {
  // Base64 → Uint8Array (raw PCM LINEAR16 bytes)
  const binaryStr = atob(audioBase64)
  const bytes = new Uint8Array(binaryStr.length)
  for (let i = 0; i < binaryStr.length; i++) bytes[i] = binaryStr.charCodeAt(i)

  const url = new URL(AZURE_STT_BASE.replace('{region}', region))
  url.searchParams.set('language', lang)
  url.searchParams.set('format', 'detailed')

  // Kontext-Phrase-Hints für verbesserte Domänen-Erkennung
  const phrases = context && CONTEXT_PHRASES[context]
  if (phrases?.length) {
    url.searchParams.set('phrases', phrases.join(','))
  }

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 12_000)

  try {
    const res = await fetch(url.toString(), {
      method: 'POST',
      headers: {
        'Ocp-Apim-Subscription-Key': apiKey,
        // Azure erwartet raw PCM als audio/wav mit PCM-Codec-Header
        'Content-Type': `audio/wav; codecs=audio/pcm; samplerate=${sampleRate}`,
        'Accept': 'application/json',
      },
      body: bytes,
      signal: controller.signal,
    })

    if (!res.ok) {
      const errText = await res.text().catch(() => res.statusText)
      throw new Error(`Azure STT ${res.status}: ${errText}`)
    }

    const data = await res.json()
    // Azure "detailed" Format: NBest[0].Display hat Interpunktion
    return data.NBest?.[0]?.Display || data.DisplayText || ''
  } finally {
    clearTimeout(timeout)
  }
}

// ── Google Cloud Speech-to-Text v1 ───────────────────────────────────────────
async function transcribeGoogle(
  audioBase64: string,
  lang: string,
  sampleRate: number,
  apiKey: string,
  context?: string,
): Promise<string> {
  const speechContexts = context && CONTEXT_PHRASES[context]
    ? [{ phrases: CONTEXT_PHRASES[context], boost: 15 }]
    : []

  // Google bietet ein spezialisiertes Modell für medizinische Gespräche
  const model = context === 'medical' ? 'medical_conversation' : 'latest_long'

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 12_000)

  try {
    const res = await fetch(`${GOOGLE_STT_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        config: {
          encoding: 'LINEAR16',
          sampleRateHertz: sampleRate,
          languageCode: lang,
          enableAutomaticPunctuation: true,
          model,
          speechContexts,
        },
        audio: { content: audioBase64 },
      }),
      signal: controller.signal,
    })

    if (!res.ok) {
      const errText = await res.text().catch(() => res.statusText)
      throw new Error(`Google STT ${res.status}: ${errText}`)
    }

    const data = await res.json()
    return (data.results as Array<{ alternatives?: Array<{ transcript?: string }> }> || [])
      .map(r => r.alternatives?.[0]?.transcript || '')
      .join(' ')
      .trim()
  } finally {
    clearTimeout(timeout)
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function isAllowedOrigin(origin: string): boolean {
  const allowed = [
    'https://fintutto.world',
    'https://www.fintutto.world',
    'https://guidetranslator.com',
    'https://www.guidetranslator.com',
    'https://amt.fintutto.world',
    'https://med.fintutto.world',
    'https://event.fintutto.world',
    'https://art.fintutto.world',
    'https://city.fintutto.world',
  ]
  if (allowed.includes(origin)) return true
  // Vercel Preview URLs und localhost für Entwicklung
  if (/^https:\/\/[a-z0-9-]+-[a-z0-9]+-[a-z0-9]+\.vercel\.app$/.test(origin)) return true
  if (/^https?:\/\/localhost(:\d+)?$/.test(origin)) return true
  return false
}

function json(data: unknown, status = 200, req?: Request): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders(req),
    },
  })
}

function corsHeaders(req?: Request): Record<string, string> {
  const origin = req?.headers.get('origin') || '*'
  return {
    'Access-Control-Allow-Origin': isAllowedOrigin(origin) ? origin : 'https://fintutto.world',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
  }
}
