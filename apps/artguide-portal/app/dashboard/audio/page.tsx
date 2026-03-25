'use client'
import { useState, useRef, useEffect } from 'react'

type VoicePreset = {
  id: string
  name: string
  icon: string
  gender: string
  age: string
  tone: string
  openai_voice: string
  sample_text: string
}

const VOICE_PRESETS: VoicePreset[] = [
  { id: 'guide_female', name: 'Museumsfuehrerin', icon: '🎙', gender: 'Weiblich', age: 'Mittel', tone: 'Warm & professionell', openai_voice: 'nova', sample_text: 'Willkommen in unserem Museum. Ich begleite Sie heute durch unsere Sammlung und erzaehle Ihnen die Geschichten hinter den Werken.' },
  { id: 'professor', name: 'Kunstprofessor', icon: '🎓', gender: 'Maennlich', age: 'Reif', tone: 'Akademisch & warm', openai_voice: 'onyx', sample_text: 'Dieses Werk zaehlt zu den bedeutendsten Beispielen des Impressionismus. Beachten Sie die charakteristische Pinselfuehrung und den Einsatz von Licht.' },
  { id: 'explorer', name: 'Entdeckerfreund', icon: '🔍', gender: 'Neutral', age: 'Jung', tone: 'Begeistert & freundlich', openai_voice: 'alloy', sample_text: 'Wow, schau mal genau hin! Siehst du, wie der Kuenstler hier mit Farben gespielt hat? Das ist wirklich faszinierend!' },
  { id: 'companion', name: 'Audio-Begleiterin', icon: '🎧', gender: 'Weiblich', age: 'Jung', tone: 'Locker & nahbar', openai_voice: 'shimmer', sample_text: 'Hey, ich bin so froh, dass du hier bist! Lass uns gemeinsam dieses tolle Werk entdecken. Es gibt so viel zu erzaehlen...' },
  { id: 'storyteller', name: 'Geschichtenerzaehler', icon: '📖', gender: 'Maennlich', age: 'Mittel', tone: 'Fesselnd & bildhaft', openai_voice: 'echo', sample_text: 'Es war ein stuermischer Herbstabend, als der Kuenstler zum ersten Mal seinen Pinsel auf die Leinwand setzte. Was folgte, sollte die Kunstwelt fuer immer veraendern.' },
  { id: 'kids', name: 'Kindererklaerer', icon: '🧸', gender: 'Neutral', age: 'Kind', tone: 'Spielerisch & klar', openai_voice: 'fable', sample_text: 'Hallo! Ich bin dein Kunstfreund fuer heute! Weisst du, was ein Kuenstler macht? Er malt Bilder und erzaehlt damit Geschichten, ganz ohne Worte!' },
]

const LANGUAGES = [
  { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'fr', label: 'Francais', flag: '🇫🇷' },
  { code: 'it', label: 'Italiano', flag: '🇮🇹' },
  { code: 'es', label: 'Espanol', flag: '🇪🇸' },
]

export default function AudioPage() {
  const [selectedPreset, setSelectedPreset] = useState<string>('guide_female')
  const [selectedLanguage, setSelectedLanguage] = useState('de')
  const [previewLoading, setPreviewLoading] = useState<string | null>(null)
  const [playingPreset, setPlayingPreset] = useState<string | null>(null)
  const [batchLoading, setBatchLoading] = useState(false)
  const [batchProgress, setBatchProgress] = useState<{ done: number; total: number } | null>(null)
  const [batchDone, setBatchDone] = useState(false)
  const [artworkCount, setArtworkCount] = useState(0)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    fetch('/api/artworks').then(r => r.json()).then(d => setArtworkCount(d.artworks?.length || 0)).catch(() => {})
  }, [])

  const previewVoice = async (preset: VoicePreset) => {
    if (previewLoading) return
    // Stop current audio
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; setPlayingPreset(null) }
    if (playingPreset === preset.id) return

    setPreviewLoading(preset.id)
    try {
      const res = await fetch('/api/audio/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: preset.sample_text, voice: preset.openai_voice, language: selectedLanguage, preview: true }),
      })
      const data = await res.json()
      if (!data.success) { alert('Audio-Fehler: ' + (data.error || 'Unbekannt')); return }
      const audio = new Audio(data.audio_url)
      audioRef.current = audio
      setPlayingPreset(preset.id)
      audio.onended = () => setPlayingPreset(null)
      audio.play()
    } catch (err) { alert('Fehler: ' + err) }
    finally { setPreviewLoading(null) }
  }

  const stopAudio = () => {
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null }
    setPlayingPreset(null)
  }

  const generateBatchAudio = async () => {
    if (artworkCount === 0) { alert('Keine Exponate vorhanden. Bitte zuerst Exponate importieren.'); return }
    setBatchLoading(true)
    setBatchDone(false)
    setBatchProgress({ done: 0, total: artworkCount })
    try {
      const preset = VOICE_PRESETS.find(p => p.id === selectedPreset)!
      // Simulate progress
      const interval = setInterval(() => {
        setBatchProgress(prev => {
          if (!prev) return null
          const next = Math.min(prev.done + 1, prev.total)
          if (next >= prev.total) clearInterval(interval)
          return { ...prev, done: next }
        })
      }, 600)
      const res = await fetch('/api/audio/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ batch: true, voice: preset.openai_voice, language: selectedLanguage }),
      })
      clearInterval(interval)
      const data = await res.json()
      setBatchProgress({ done: artworkCount, total: artworkCount })
      setBatchDone(true)
      if (!data.success) console.warn('Batch warning:', data.error)
    } catch (err) { alert('Batch-Fehler: ' + err) }
    finally { setBatchLoading(false) }
  }

  const activePreset = VOICE_PRESETS.find(p => p.id === selectedPreset)!

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Audio & Stimmen</h1>
          <p className="text-gray-500 mt-1">KI-Stimmen konfigurieren und Audio-Guide verwalten</p>
        </div>
        <div className="flex gap-2">
          {LANGUAGES.map(l => (
            <button key={l.code} onClick={() => setSelectedLanguage(l.code)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition border ${
                selectedLanguage === l.code ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-gray-200 text-gray-500 hover:border-gray-300'
              }`}>
              <span>{l.flag}</span> {l.label}
            </button>
          ))}
        </div>
      </div>

      {/* Voice Presets Grid */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-gray-900">🎙 Stimm-Presets</h3>
            <p className="text-sm text-gray-500 mt-0.5">Waehle die Stimme fuer deinen Audio-Guide. Klicke auf Vorschau zum Testen.</p>
          </div>
          <div className="text-sm text-gray-500">
            Aktiv: <span className="font-medium text-indigo-700">{activePreset.icon} {activePreset.name}</span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {VOICE_PRESETS.map(preset => (
            <div key={preset.id}
              onClick={() => setSelectedPreset(preset.id)}
              className={`p-4 rounded-xl border-2 transition cursor-pointer ${
                selectedPreset === preset.id ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 hover:border-gray-300 bg-white'
              }`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{preset.icon}</span>
                  <div>
                    <div className="font-semibold text-sm text-gray-900">{preset.name}</div>
                    <div className="text-xs text-gray-500">{preset.tone}</div>
                  </div>
                </div>
                {selectedPreset === preset.id && (
                  <span className="w-5 h-5 rounded-full bg-indigo-500 flex items-center justify-center text-white text-xs">✓</span>
                )}
              </div>
              <div className="flex gap-2 text-xs text-gray-500 mb-3">
                <span className="px-2 py-0.5 bg-gray-100 rounded-full">{preset.gender}</span>
                <span className="px-2 py-0.5 bg-gray-100 rounded-full">{preset.age}</span>
              </div>
              <p className="text-xs text-gray-400 italic mb-3 line-clamp-2">&ldquo;{preset.sample_text.slice(0, 60)}...&rdquo;</p>
              <button
                onClick={e => { e.stopPropagation(); playingPreset === preset.id ? stopAudio() : previewVoice(preset) }}
                disabled={previewLoading === preset.id}
                className={`w-full py-1.5 rounded-lg text-xs font-medium transition flex items-center justify-center gap-1.5 ${
                  playingPreset === preset.id
                    ? 'bg-red-100 text-red-600 hover:bg-red-200'
                    : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
                } disabled:opacity-50`}>
                {previewLoading === preset.id ? (
                  <><span className="animate-spin">⚙️</span> Generiere...</>
                ) : playingPreset === preset.id ? (
                  <><span>⏹</span> Stopp</>
                ) : (
                  <><span>▶</span> Vorschau</>
                )}
              </button>
            </div>
          ))}
        </div>

        <button className="mt-4 px-4 py-2 rounded-lg border-2 border-dashed border-gray-300 text-gray-400 hover:border-indigo-300 hover:text-indigo-500 transition text-sm w-full">
          + Eigenes Preset erstellen (Enterprise)
        </button>
      </div>

      {/* Batch Generation */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h3 className="font-semibold text-gray-900 mb-2">🔊 Batch Audio-Generierung</h3>
        <p className="text-sm text-gray-500 mb-4">
          Generiere Audio fuer alle {artworkCount} Exponate auf Knopfdruck mit der gewaehlten Stimme und Sprache.
        </p>

        <div className="flex items-center gap-4 mb-4">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-indigo-50 border border-indigo-200">
            <span>{activePreset.icon}</span>
            <span className="text-sm font-medium text-indigo-700">{activePreset.name}</span>
          </div>
          <span className="text-gray-400">×</span>
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-indigo-50 border border-indigo-200">
            <span>{LANGUAGES.find(l => l.code === selectedLanguage)?.flag}</span>
            <span className="text-sm font-medium text-indigo-700">{LANGUAGES.find(l => l.code === selectedLanguage)?.label}</span>
          </div>
          <span className="text-gray-400">→</span>
          <span className="text-sm text-gray-600">{artworkCount} Exponate</span>
        </div>

        {batchProgress && (
          <div className="mb-4">
            <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
              <span>{batchDone ? '✅ Fertig!' : `⚙️ Generiere... ${batchProgress.done} / ${batchProgress.total}`}</span>
              <span>{Math.round((batchProgress.done / batchProgress.total) * 100)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(batchProgress.done / batchProgress.total) * 100}%` }} />
            </div>
          </div>
        )}

        <button onClick={generateBatchAudio} disabled={batchLoading || artworkCount === 0}
          className="px-6 py-2.5 rounded-xl bg-indigo-900 text-white text-sm font-medium hover:bg-indigo-800 transition disabled:opacity-50 flex items-center gap-2">
          {batchLoading ? <><span className="animate-spin">⚙️</span> Generiere Audio...</> : <><span>🔊</span> Audio fuer alle Werke generieren</>}
        </button>
      </div>

      {/* Info Box */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
        <div className="flex gap-3">
          <span className="text-2xl">💡</span>
          <div>
            <h4 className="font-semibold text-amber-900 mb-1">Wie funktioniert die Audio-Generierung?</h4>
            <p className="text-sm text-amber-800">
              Fintutto nutzt OpenAI TTS (Text-to-Speech) fuer hochwertige, natuerliche Stimmen. Die Texte werden
              aus den Exponat-Beschreibungen generiert und automatisch auf die Zielgruppe angepasst. Im Pro-Tier
              steht TTS-1-HD fuer noch bessere Qualitaet zur Verfuegung. Enterprise-Kunden koennen eigene
              ElevenLabs-Stimmen integrieren.
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
