// Vercel Edge Function — TTS Proxy
// Keeps Google Cloud TTS API key server-side.
// Returns audio as base64 JSON (same format as Google API).

export const config = { runtime: 'edge' }

const API_URL = 'https://texttospeech.googleapis.com/v1/text:synthesize'
const API_URL_BETA = 'https://texttospeech.googleapis.com/v1beta1/text:synthesize'

interface TtsRequest {
  text: string
  languageCode: string
  voiceName?: string
  useBeta?: boolean
  speakingRate?: number
}

export default async function handler(req: Request) {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders() })
  }

  if (req.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405)
  }

  const apiKey = process.env.GOOGLE_API_KEY
  if (!apiKey) {
    return json({ error: 'TTS API key not configured' }, 503)
  }

  let body: TtsRequest
  try {
    body = await req.json()
  } catch {
    return json({ error: 'Invalid JSON body' }, 400)
  }

  const { text, languageCode, voiceName, useBeta, speakingRate } = body
  if (!text?.trim() || !languageCode) {
    return json({ error: 'Missing required fields: text, languageCode' }, 400)
  }

  const apiUrl = useBeta ? API_URL_BETA : API_URL

  const ttsBody: Record<string, unknown> = {
    input: { text },
    voice: {
      languageCode,
      ...(voiceName ? { name: voiceName } : {}),
    },
    audioConfig: {
      audioEncoding: 'MP3',
      speakingRate: speakingRate ?? 0.95,
      pitch: 0,
    },
  }

  try {
    const res = await fetch(`${apiUrl}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(ttsBody),
    })

    if (!res.ok) {
      const errText = await res.text()
      return json({ error: `Google TTS failed (${res.status}): ${errText}` }, res.status)
    }

    const data = await res.json()
    return json({ audioContent: data.audioContent })
  } catch (err) {
    return json({ error: `TTS proxy error: ${err instanceof Error ? err.message : String(err)}` }, 502)
  }
}

// --- Helpers ---

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders() },
  })
}

function corsHeaders(): Record<string, string> {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  }
}
