// Fintutto Art Guide — TTS (Text-to-Speech) Edge Function
// Generates audio files for artworks/POIs using Google Cloud TTS or ElevenLabs
// Stores results in Supabase Storage and updates content items
//
// Actions:
//   generate_single  — Generate audio for one content item + language
//   generate_batch   — Generate audio for multiple items
//   list_voices       — List available voices per language
//
// Required secrets: GOOGLE_TTS_API_KEY (or ELEVENLABS_API_KEY)

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const GOOGLE_TTS_KEY = Deno.env.get('GOOGLE_TTS_API_KEY') || ''
const ELEVENLABS_KEY = Deno.env.get('ELEVENLABS_API_KEY') || ''

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Voice presets per language (Google Cloud TTS Neural2 voices)
const VOICE_PRESETS: Record<string, { male: string; female: string; languageCode: string }> = {
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

interface TtsRequest {
  action: 'generate_single' | 'generate_batch' | 'list_voices'
  content_id?: string
  content_ids?: string[]
  language?: string
  languages?: string[]
  voice_gender?: 'male' | 'female'
  speaking_rate?: number  // 0.5 - 2.0, default 1.0
  field?: string          // which text field to read: content_standard, content_brief, etc.
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
        return jsonResponse(Object.entries(VOICE_PRESETS).map(([lang, v]) => ({
          language: lang,
          languageCode: v.languageCode,
          maleVoice: v.male,
          femaleVoice: v.female,
        })))

      case 'generate_single': {
        if (!body.content_id || !body.language) {
          return jsonResponse({ error: 'content_id and language required' }, 400)
        }
        const result = await generateAudio(supabase, body.content_id, body.language, {
          voiceGender: body.voice_gender || 'female',
          speakingRate: body.speaking_rate || 1.0,
          field: body.field || 'content_standard',
        })
        return jsonResponse(result)
      }

      case 'generate_batch': {
        const ids = body.content_ids || []
        const langs = body.languages || [body.language || 'de']
        if (ids.length === 0) return jsonResponse({ error: 'content_ids required' }, 400)

        const results = []
        for (const id of ids.slice(0, 50)) {  // max 50 per batch
          for (const lang of langs) {
            const result = await generateAudio(supabase, id, lang, {
              voiceGender: body.voice_gender || 'female',
              speakingRate: body.speaking_rate || 1.0,
              field: body.field || 'content_standard',
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
  contentId: string,
  language: string,
  options: { voiceGender: 'male' | 'female'; speakingRate: number; field: string },
): Promise<{ success: boolean; content_id: string; language: string; audio_url?: string; error?: string; duration_seconds?: number }> {
  // 1. Fetch content text
  const { data: content, error: fetchErr } = await supabase
    .from('fw_content_items')
    .select(`${options.field}, name, description`)
    .eq('id', contentId)
    .single()

  if (fetchErr || !content) {
    return { success: false, content_id: contentId, language, error: 'Content not found' }
  }

  // Get text from the requested field
  const fieldData = content[options.field] as Record<string, string> | null
  let text = fieldData?.[language]

  // Fallback chain: requested field → description → name
  if (!text) {
    const desc = content.description as Record<string, string> | null
    text = desc?.[language]
  }
  if (!text) {
    const name = content.name as Record<string, string> | null
    text = name?.[language]
  }

  if (!text || text.length < 5) {
    return { success: false, content_id: contentId, language, error: 'No text available for this language' }
  }

  // 2. Generate audio via Google Cloud TTS
  const preset = VOICE_PRESETS[language] || VOICE_PRESETS.en
  const voiceName = options.voiceGender === 'male' ? preset.male : preset.female

  let audioBase64: string
  let durationEstimate: number

  if (GOOGLE_TTS_KEY) {
    const ttsResponse = await fetch(
      `https://texttospeech.googleapis.com/v1/text:synthesize?key=${GOOGLE_TTS_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          input: { text: text.slice(0, 5000) }, // Google TTS limit
          voice: {
            languageCode: preset.languageCode,
            name: voiceName,
          },
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
      return { success: false, content_id: contentId, language, error: `TTS API error: ${errText}` }
    }

    const ttsData = await ttsResponse.json()
    audioBase64 = ttsData.audioContent
    // Rough estimate: ~150 words/min, ~5 chars/word
    durationEstimate = Math.round((text.length / 5 / 150) * 60)
  } else if (ELEVENLABS_KEY) {
    // ElevenLabs fallback (multilingual v2 model)
    const elevenResponse = await fetch(
      'https://api.elevenlabs.io/v1/text-to-speech/21m00Tcm4TlvDq8ikWAM', // Rachel voice
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'xi-api-key': ELEVENLABS_KEY,
        },
        body: JSON.stringify({
          text: text.slice(0, 5000),
          model_id: 'eleven_multilingual_v2',
          voice_settings: { stability: 0.5, similarity_boost: 0.75, speed: options.speakingRate },
        }),
      },
    )

    if (!elevenResponse.ok) {
      return { success: false, content_id: contentId, language, error: 'ElevenLabs API error' }
    }

    const audioBuffer = await elevenResponse.arrayBuffer()
    audioBase64 = btoa(String.fromCharCode(...new Uint8Array(audioBuffer)))
    durationEstimate = Math.round((text.length / 5 / 150) * 60)
  } else {
    return { success: false, content_id: contentId, language, error: 'No TTS provider configured (GOOGLE_TTS_API_KEY or ELEVENLABS_API_KEY)' }
  }

  // 3. Upload to Supabase Storage
  const audioBytes = Uint8Array.from(atob(audioBase64), c => c.charCodeAt(0))
  const filePath = `tts/${contentId}/${language}_${options.voiceGender}.mp3`

  const { error: uploadErr } = await supabase.storage
    .from('audio')
    .upload(filePath, audioBytes, {
      contentType: 'audio/mpeg',
      upsert: true,
    })

  if (uploadErr) {
    return { success: false, content_id: contentId, language, error: `Storage upload failed: ${uploadErr.message}` }
  }

  // 4. Get public URL
  const { data: urlData } = supabase.storage.from('audio').getPublicUrl(filePath)
  const audioUrl = urlData.publicUrl

  // 5. Update content item with audio URL
  const { data: existing } = await supabase
    .from('fw_content_items')
    .select('audio_url, audio_duration_seconds')
    .eq('id', contentId)
    .single()

  const currentAudioUrls = (existing?.audio_url as Record<string, string>) || {}
  currentAudioUrls[language] = audioUrl

  await supabase.from('fw_content_items').update({
    audio_url: currentAudioUrls,
    audio_duration_seconds: durationEstimate,
  }).eq('id', contentId)

  return {
    success: true,
    content_id: contentId,
    language,
    audio_url: audioUrl,
    duration_seconds: durationEstimate,
  }
}

function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}
