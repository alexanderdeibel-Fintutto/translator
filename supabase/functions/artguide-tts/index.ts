// Fintutto Art Guide — TTS (Text-to-Speech) Edge Function
// Generates audio files for artworks using OpenAI TTS, Google Cloud TTS, or ElevenLabs
// Stores results in Supabase Storage and updates ag_artworks
//
// Actions:
//   generate_single  — Generate audio for one artwork + language
//   generate_batch   — Generate audio for multiple artworks
//   list_voices      — List available voices per language
//
// Required secrets: OPENAI_API_KEY or GOOGLE_TTS_API_KEY or ELEVENLABS_API_KEY

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY') || ''
const GOOGLE_TTS_KEY = Deno.env.get('GOOGLE_TTS_API_KEY') || ''
const ELEVENLABS_KEY = Deno.env.get('ELEVENLABS_API_KEY') || ''

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Voice presets per language (Google Cloud TTS Neural2 voices)
const GOOGLE_VOICE_PRESETS: Record<string, { male: string; female: string; languageCode: string }> = {
  de: { male: 'de-DE-Neural2-B', female: 'de-DE-Neural2-C', languageCode: 'de-DE' },
  en: { male: 'en-US-Neural2-D', female: 'en-US-Neural2-F', languageCode: 'en-US' },
  fr: { male: 'fr-FR-Neural2-B', female: 'fr-FR-Neural2-C', languageCode: 'fr-FR' },
  it: { male: 'it-IT-Neural2-C', female: 'it-IT-Neural2-A', languageCode: 'it-IT' },
  es: { male: 'es-ES-Neural2-B', female: 'es-ES-Neural2-A', languageCode: 'es-ES' },
  nl: { male: 'nl-NL-Neural2-B', female: 'nl-NL-Neural2-C', languageCode: 'nl-NL' },
  pl: { male: 'pl-PL-Neural2-B', female: 'pl-PL-Neural2-A', languageCode: 'pl-PL' },
  cs: { male: 'cs-CZ-Neural2-D', female: 'cs-CZ-Neural2-A', languageCode: 'cs-CZ' },
  zh: { male: 'cmn-CN-Neural2-B', female: 'cmn-CN-Neural2-A', languageCode: 'cmn-CN' },
  ja: { male: 'ja-JP-Neural2-C', female: 'ja-JP-Neural2-B', languageCode: 'ja-JP' },
  ko: { male: 'ko-KR-Neural2-C', female: 'ko-KR-Neural2-A', languageCode: 'ko-KR' },
  ar: { male: 'ar-XA-Neural2-B', female: 'ar-XA-Neural2-A', languageCode: 'ar-XA' },
}

// OpenAI TTS voices (multilingual, best quality)
const OPENAI_VOICES = {
  female: 'nova',  // warm, clear
  male: 'onyx',   // deep, authoritative
}

interface TtsRequest {
  action: 'generate_single' | 'generate_batch' | 'list_voices'
  artwork_id?: string
  artwork_ids?: string[]
  language?: string
  languages?: string[]
  voice_gender?: 'male' | 'female'
  speaking_rate?: number  // 0.5 - 2.0, default 1.0
  field?: string          // which text field: description_standard, description_brief, etc.
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
    const body: TtsRequest = await req.json()

    switch (body.action) {
      case 'list_voices':
        return jsonResponse({
          providers: {
            openai: OPENAI_API_KEY ? { available: true, voices: OPENAI_VOICES } : { available: false },
            google: GOOGLE_TTS_KEY ? { available: true, voices: GOOGLE_VOICE_PRESETS } : { available: false },
            elevenlabs: ELEVENLABS_KEY ? { available: true } : { available: false },
          },
          active_provider: OPENAI_API_KEY ? 'openai' : GOOGLE_TTS_KEY ? 'google' : ELEVENLABS_KEY ? 'elevenlabs' : 'none',
        })

      case 'generate_single': {
        if (!body.artwork_id || !body.language) {
          return jsonResponse({ error: 'artwork_id and language required' }, 400)
        }
        const result = await generateAudio(supabase, body.artwork_id, body.language, {
          voiceGender: body.voice_gender || 'female',
          speakingRate: body.speaking_rate || 1.0,
          field: body.field || 'description_standard',
        })
        return jsonResponse(result)
      }

      case 'generate_batch': {
        const ids = body.artwork_ids || []
        const langs = body.languages || [body.language || 'de']
        if (ids.length === 0) return jsonResponse({ error: 'artwork_ids required' }, 400)

        const results = []
        for (const id of ids.slice(0, 50)) {  // max 50 per batch
          for (const lang of langs) {
            const result = await generateAudio(supabase, id, lang, {
              voiceGender: body.voice_gender || 'female',
              speakingRate: body.speaking_rate || 1.0,
              field: body.field || 'description_standard',
            })
            results.push(result)
          }
        }
        return jsonResponse({
          total: results.length,
          success: results.filter(r => r.success).length,
          failed: results.filter(r => !r.success).length,
          results,
        })
      }

      default:
        return jsonResponse({ error: `Unknown action: ${body.action}` }, 400)
    }
  } catch (error) {
    return jsonResponse({ error: error.message }, 500)
  }
})

async function generateAudio(
  supabase: ReturnType<typeof createClient>,
  artworkId: string,
  language: string,
  options: { voiceGender: 'male' | 'female'; speakingRate: number; field: string },
): Promise<{ success: boolean; artwork_id: string; language: string; audio_url?: string; error?: string; duration_seconds?: number; provider?: string }> {

  // 1. Fetch artwork text
  const { data: artwork, error: fetchErr } = await supabase
    .from('ag_artworks')
    .select(`${options.field}, description_standard, title, artist_name`)
    .eq('id', artworkId)
    .single()

  if (fetchErr || !artwork) {
    return { success: false, artwork_id: artworkId, language, error: 'Artwork not found' }
  }

  // Get text from the requested field (JSONB {lang: text})
  const fieldData = artwork[options.field] as Record<string, string> | null
  let text = fieldData?.[language]

  // Fallback chain: requested field → description_standard → title
  if (!text) {
    const std = artwork.description_standard as Record<string, string> | null
    text = std?.[language] || std?.['de'] || std?.['en']
  }
  if (!text) {
    const title = artwork.title as Record<string, string> | null
    text = title?.[language] || title?.['de'] || title?.['en']
  }

  if (!text || text.length < 5) {
    return { success: false, artwork_id: artworkId, language, error: 'No text available for this language' }
  }

  // 2. Generate audio
  let audioBuffer: ArrayBuffer
  let provider: string
  const durationEstimate = Math.round((text.length / 5 / 150) * 60)

  if (OPENAI_API_KEY) {
    // OpenAI TTS (best quality, multilingual)
    provider = 'openai'
    const voice = OPENAI_VOICES[options.voiceGender]
    const ttsResponse = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'tts-1',
        input: text.slice(0, 4096),
        voice,
        speed: Math.min(Math.max(options.speakingRate, 0.25), 4.0),
        response_format: 'mp3',
      }),
    })

    if (!ttsResponse.ok) {
      const errText = await ttsResponse.text()
      return { success: false, artwork_id: artworkId, language, error: `OpenAI TTS error: ${errText}` }
    }
    audioBuffer = await ttsResponse.arrayBuffer()

  } else if (GOOGLE_TTS_KEY) {
    // Google Cloud TTS fallback
    provider = 'google'
    const preset = GOOGLE_VOICE_PRESETS[language] || GOOGLE_VOICE_PRESETS.en
    const voiceName = options.voiceGender === 'male' ? preset.male : preset.female

    const ttsResponse = await fetch(
      `https://texttospeech.googleapis.com/v1/text:synthesize?key=${GOOGLE_TTS_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          input: { text: text.slice(0, 5000) },
          voice: { languageCode: preset.languageCode, name: voiceName },
          audioConfig: {
            audioEncoding: 'MP3',
            speakingRate: options.speakingRate,
            pitch: 0,
            effectsProfileId: ['headphone-class-device'],
          },
        }),
      },
    )

    if (!ttsResponse.ok) {
      const errText = await ttsResponse.text()
      return { success: false, artwork_id: artworkId, language, error: `Google TTS error: ${errText}` }
    }

    const ttsData = await ttsResponse.json()
    const audioBase64: string = ttsData.audioContent
    audioBuffer = Uint8Array.from(atob(audioBase64), c => c.charCodeAt(0)).buffer

  } else if (ELEVENLABS_KEY) {
    // ElevenLabs fallback
    provider = 'elevenlabs'
    const voiceId = options.voiceGender === 'female' ? '21m00Tcm4TlvDq8ikWAM' : 'TxGEqnHWrfWFTfGW9XjX'
    const elevenResponse = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'xi-api-key': ELEVENLABS_KEY },
        body: JSON.stringify({
          text: text.slice(0, 5000),
          model_id: 'eleven_multilingual_v2',
          voice_settings: { stability: 0.5, similarity_boost: 0.75, speed: options.speakingRate },
        }),
      },
    )

    if (!elevenResponse.ok) {
      return { success: false, artwork_id: artworkId, language, error: 'ElevenLabs API error' }
    }
    audioBuffer = await elevenResponse.arrayBuffer()

  } else {
    return { success: false, artwork_id: artworkId, language, error: 'No TTS provider configured' }
  }

  // 3. Upload to Supabase Storage
  const audioBytes = new Uint8Array(audioBuffer)
  const filePath = `artworks/${artworkId}/${language}_${options.voiceGender}_${options.field}.mp3`

  const { error: uploadErr } = await supabase.storage
    .from('audio')
    .upload(filePath, audioBytes, {
      contentType: 'audio/mpeg',
      upsert: true,
    })

  if (uploadErr) {
    return { success: false, artwork_id: artworkId, language, error: `Storage upload failed: ${uploadErr.message}` }
  }

  // 4. Get public URL
  const { data: urlData } = supabase.storage.from('audio').getPublicUrl(filePath)
  const audioUrl = urlData.publicUrl

  // 5. Update artwork with audio URL in JSONB field
  const { data: existing } = await supabase
    .from('ag_artworks')
    .select('audio_url, audio_duration_seconds')
    .eq('id', artworkId)
    .single()

  const currentAudioUrls = (existing?.audio_url as Record<string, string>) || {}
  currentAudioUrls[language] = audioUrl

  await supabase.from('ag_artworks').update({
    audio_url: currentAudioUrls,
    audio_duration_seconds: durationEstimate,
    updated_at: new Date().toISOString(),
  }).eq('id', artworkId)

  return {
    success: true,
    artwork_id: artworkId,
    language,
    audio_url: audioUrl,
    duration_seconds: durationEstimate,
    provider,
  }
}

function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}
