import { useState, useRef, useCallback } from 'react'
import { getBestSTTEngine, createGoogleCloudSTTEngine, type STTEngine, type STTResult } from '@/lib/stt'

export function useSpeechRecognition() {
  const [isListening, setIsListening] = useState(false)
  const [interimTranscript, setInterimTranscript] = useState('')
  const [error, setError] = useState<string | null>(null)
  const engineRef = useRef<STTEngine | null>(null)

  // Lazily create engine on first use
  const getEngine = useCallback(() => {
    if (!engineRef.current) {
      engineRef.current = getBestSTTEngine()
    }
    return engineRef.current
  }, [])

  // Delegate to the selected engine (covers Web Speech, Google Cloud STT, native bridge)
  const isSupported = getEngine().isSupported

  const stopListening = useCallback(() => {
    getEngine().stop()
    setIsListening(false)
  }, [getEngine])

  const startListening = useCallback(async (
    lang: string,
    onFinalResult: (text: string) => void,
    onInterimResult?: (text: string) => void,
  ) => {
    const engine = getEngine()

    if (!engine.isSupported) {
      setError('Spracheingabe wird von diesem Browser nicht unterstützt')
      return
    }

    setError(null)
    setInterimTranscript('')

    const resultHandler = (result: STTResult) => {
      if (result.isFinal) {
        setInterimTranscript('')
        onFinalResult(result.text)
      } else {
        setInterimTranscript(result.text)
        onInterimResult?.(result.text)
      }
    }

    const errorHandler = (errorMsg: string) => {
      // Auto-fallback: if Web Speech fails with service-not-allowed, switch to Google Cloud STT
      if (errorMsg.includes('service-not-allowed') && engineRef.current?.provider === 'web-speech') {
        const fallback = createGoogleCloudSTTEngine()
        if (fallback.isSupported) {
          engineRef.current = fallback
          // Retry with Google Cloud STT engine
          fallback.start(lang, resultHandler, (fallbackError: string) => {
            setError(fallbackError)
            setIsListening(false)
          }).then(() => {
            setIsListening(true)
          })
          return
        }
      }
      setError(errorMsg)
      setIsListening(false)
    }

    await engine.start(lang, resultHandler, errorHandler)

    setIsListening(true)
  }, [getEngine])

  return {
    isListening,
    interimTranscript,
    isSupported,
    error,
    startListening,
    stopListening,
    provider: getEngine().provider,
  }
}
