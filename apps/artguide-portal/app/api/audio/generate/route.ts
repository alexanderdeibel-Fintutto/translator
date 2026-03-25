import { NextRequest, NextResponse } from 'next/server'
import { openai } from '@/lib/openai'

const VOICE_MAP: Record<string, string> = {
  'nova':    'nova',    // Warm, female — "Museumsfuehrerin"
  'onyx':    'onyx',   // Deep, male — "Kunstprofessor"
  'alloy':   'alloy',  // Neutral — "Entdeckerfreund"
  'echo':    'echo',   // Balanced male
  'fable':   'fable',  // Expressive
  'shimmer': 'shimmer', // Soft female
}

// POST /api/audio/generate
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { text, voice, artworkId, language, tier } = body

    if (!text) {
      return NextResponse.json({ error: 'Kein Text angegeben' }, { status: 400 })
    }

    const selectedVoice = VOICE_MAP[voice] || 'nova'
    const model = tier === 'artguide_enterprise_plus' ? 'tts-1-hd' : 'tts-1'

    // Limit text length based on tier
    const maxChars = tier === 'artguide_free' ? 500 : 2000
    const truncatedText = text.slice(0, maxChars)

    const mp3Response = await openai.audio.speech.create({
      model,
      voice: selectedVoice as 'nova' | 'onyx' | 'alloy' | 'echo' | 'fable' | 'shimmer',
      input: truncatedText,
      response_format: 'mp3',
    })

    const buffer = Buffer.from(await mp3Response.arrayBuffer())
    const base64Audio = buffer.toString('base64')

    return NextResponse.json({
      success: true,
      audio_base64: base64Audio,
      audio_data_url: `data:audio/mp3;base64,${base64Audio}`,
      duration_estimate_seconds: Math.ceil(truncatedText.length / 15),
      model_used: model,
      voice_used: selectedVoice,
      characters_used: truncatedText.length,
    })
  } catch (error) {
    console.error('Audio generation error:', error)
    return NextResponse.json(
      { error: 'Audio-Generierung fehlgeschlagen', details: String(error) },
      { status: 500 }
    )
  }
}
