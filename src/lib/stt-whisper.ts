// OpenAI Whisper STT integration stub
// Uses Whisper API for high-accuracy speech-to-text

export interface WhisperConfig {
  language?: string
  model?: 'whisper-1' | 'whisper-large-v3'
  responseFormat?: 'json' | 'text' | 'srt' | 'vtt'
  temperature?: number
}

export async function transcribeWithWhisper(
  audioBlob: Blob,
  config: WhisperConfig = {},
): Promise<{ text: string; language: string; duration: number }> {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY
  if (!apiKey) {
    throw new Error('VITE_OPENAI_API_KEY not configured. Whisper STT requires an OpenAI API key.')
  }

  const formData = new FormData()
  formData.append('file', audioBlob, 'audio.webm')
  formData.append('model', config.model || 'whisper-1')
  if (config.language) formData.append('language', config.language)
  formData.append('response_format', config.responseFormat || 'json')
  if (config.temperature !== undefined) formData.append('temperature', String(config.temperature))

  const res = await fetch('https://api.openai.com/v1/audio/transcriptions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}` },
    body: formData,
  })

  if (!res.ok) {
    throw new Error(`Whisper API error: ${res.status} ${res.statusText}`)
  }

  const data = await res.json()
  return {
    text: data.text || '',
    language: data.language || config.language || 'unknown',
    duration: data.duration || 0,
  }
}

export function isWhisperConfigured(): boolean {
  return !!import.meta.env.VITE_OPENAI_API_KEY
}

// Cost estimation: ~$0.006/minute
export function estimateWhisperCost(durationSeconds: number): number {
  return (durationSeconds / 60) * 0.006
}
