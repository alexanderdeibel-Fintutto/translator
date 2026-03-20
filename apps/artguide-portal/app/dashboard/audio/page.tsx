'use client'

/**
 * Audio & Voice Management Page
 *
 * Features:
 * - Voice preset configuration
 * - TTS voice testing (preview voices)
 * - Custom museum voice presets
 * - Audio file management (pre-recorded audio)
 * - Voice settings per language
 * - Batch audio generation
 */
export default function AudioPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <main className="ml-64 p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Audio & Stimmen</h1>
            <p className="text-gray-500 mt-1">KI-Stimmen konfigurieren und Audio-Guide verwalten</p>
          </div>
        </div>

        {/* Voice Presets */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <h3 className="font-semibold text-gray-900 mb-4">🎙 Stimm-Presets</h3>
          <p className="text-sm text-gray-500 mb-4">
            Besucher koennen aus diesen Presets waehlen. Du kannst auch eigene erstellen.
          </p>

          <div className="grid grid-cols-3 gap-4">
            {[
              { name: 'Museumsfuehrerin', icon: '🎙', gender: 'Weiblich', age: 'Mittel', tone: 'Warm & professionell' },
              { name: 'Kunstprofessor', icon: '🎓', gender: 'Maennlich', age: 'Reif', tone: 'Akademisch & warm' },
              { name: 'Entdeckerfreund', icon: '🔍', gender: 'Neutral', age: 'Jung', tone: 'Begeistert & freundlich' },
              { name: 'Audio-Begleiterin', icon: '🎧', gender: 'Weiblich', age: 'Jung', tone: 'Locker & nahbar' },
              { name: 'Geschichtenerzaehler', icon: '📖', gender: 'Maennlich', age: 'Mittel', tone: 'Fesselnd & bildhaft' },
              { name: 'Kindererklaerer', icon: '🧸', gender: 'Neutral', age: 'Kind', tone: 'Spielerisch & klar' },
            ].map(preset => (
              <div key={preset.name} className="p-4 rounded-lg border border-gray-200 hover:border-indigo-300 transition cursor-pointer">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">{preset.icon}</span>
                  <span className="font-medium text-sm">{preset.name}</span>
                </div>
                <div className="text-xs text-gray-500 space-y-1">
                  <div>Geschlecht: {preset.gender}</div>
                  <div>Alter: {preset.age}</div>
                  <div>Ton: {preset.tone}</div>
                </div>
                <button className="mt-3 w-full py-1.5 rounded bg-indigo-50 text-indigo-700 text-xs font-medium hover:bg-indigo-100 transition">
                  ▶ Testen
                </button>
              </div>
            ))}
          </div>

          <button className="mt-4 px-4 py-2 rounded-lg border-2 border-dashed border-gray-300 text-gray-400 hover:border-indigo-300 hover:text-indigo-500 transition text-sm w-full">
            + Eigenes Preset erstellen
          </button>
        </div>

        {/* Batch Generation */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">🔊 Batch Audio-Generierung</h3>
          <p className="text-sm text-gray-500 mb-4">
            Generiere Audio fuer alle Kunstwerke auf Knopfdruck. Waehle Sprache und Stimme.
          </p>
          <div className="flex gap-3">
            <select className="px-3 py-2 rounded-lg border border-gray-300 text-sm">
              <option>Deutsch</option>
              <option>English</option>
              <option>Francais</option>
            </select>
            <select className="px-3 py-2 rounded-lg border border-gray-300 text-sm">
              <option>Museumsfuehrerin</option>
              <option>Kunstprofessor</option>
              <option>Entdeckerfreund</option>
            </select>
            <button className="px-4 py-2 rounded-lg bg-indigo-900 text-white text-sm font-medium hover:bg-indigo-800 transition">
              Audio fuer alle Werke generieren
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}
