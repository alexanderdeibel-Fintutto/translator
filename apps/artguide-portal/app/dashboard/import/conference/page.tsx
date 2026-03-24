'use client'

import { useState } from 'react'
import Link from 'next/link'

type ConfStep = 'upload' | 'parse' | 'review' | 'enrich' | 'done'

const mockSessions = [
  { id: 1, title: 'Keynote: Die Zukunft der KI', speaker: 'Dr. Anna Mueller', room: 'Hauptsaal', date: '2026-04-15', time: '09:00-10:00', track: 'Keynote', status: 'approved' },
  { id: 2, title: 'Workshop: LLMs in der Praxis', speaker: 'Prof. Max Schmidt', room: 'Raum A1', date: '2026-04-15', time: '10:30-12:00', track: 'Workshop', status: 'approved' },
  { id: 3, title: 'Panel: Ethik in der KI', speaker: 'Div. Sprecher', room: 'Hauptsaal', date: '2026-04-15', time: '13:00-14:00', track: 'Panel', status: 'approved' },
  { id: 4, title: 'Deep Dive: RAG-Systeme', speaker: 'Lisa Weber', room: 'Raum B2', date: '2026-04-15', time: '14:30-15:30', track: 'Technical', status: 'review_needed' },
  { id: 5, title: 'Networking: Startup Pitch', speaker: 'Verschiedene', room: 'Foyer', date: '2026-04-15', time: '16:00-17:30', track: 'Networking', status: 'approved' },
  { id: 6, title: 'Abendvortrag: KI und Gesellschaft', speaker: 'Dr. Stefan Braun', room: 'Hauptsaal', date: '2026-04-15', time: '18:00-19:00', track: 'Keynote', status: 'approved' },
]

const mockRooms = [
  { name: 'Hauptsaal', capacity: 500, floor: 'EG' },
  { name: 'Raum A1', capacity: 80, floor: '1. OG' },
  { name: 'Raum B2', capacity: 50, floor: '1. OG' },
  { name: 'Foyer', capacity: 200, floor: 'EG' },
]

const trackColors: Record<string, string> = {
  'Keynote': 'bg-purple-100 text-purple-700',
  'Workshop': 'bg-blue-100 text-blue-700',
  'Panel': 'bg-amber-100 text-amber-700',
  'Technical': 'bg-emerald-100 text-emerald-700',
  'Networking': 'bg-pink-100 text-pink-700',
}

export default function ConferenceImportPage() {
  const [currentStep, setCurrentStep] = useState<ConfStep>('upload')
  const [uploadMode, setUploadMode] = useState<'pdf' | 'url' | 'excel'>('pdf')
  const [isParsing, setIsParsing] = useState(false)
  const [parseProgress, setParseProgress] = useState(0)
  const [hasUploaded, setHasUploaded] = useState(false)
  const [confName, setConfName] = useState('')
  const [confDate, setConfDate] = useState('')

  const steps: { key: ConfStep; label: string }[] = [
    { key: 'upload', label: 'Programm hochladen' },
    { key: 'parse', label: 'KI-Erkennung' },
    { key: 'review', label: 'Sessions pruefen' },
    { key: 'enrich', label: 'Anreichern' },
    { key: 'done', label: 'Fertig' },
  ]
  const stepIndex = steps.findIndex(s => s.key === currentStep)

  async function startParsing() {
    setCurrentStep('parse')
    setIsParsing(true)
    for (let i = 0; i <= 100; i += 2) {
      setParseProgress(i)
      await new Promise(r => setTimeout(r, 60))
    }
    setIsParsing(false)
    setCurrentStep('review')
  }

  return (
    <>
      <div className="flex items-center gap-4 mb-6">
        <Link href="/dashboard/import" className="p-2 rounded-lg hover:bg-gray-100 transition text-gray-500">
          ← Zurueck
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">🎤 Kongress / Konferenz Import</h1>
          <p className="text-gray-500 text-sm mt-1">Konferenzprogramm automatisch in einen interaktiven Guide verwandeln</p>
        </div>
      </div>

      {/* Step bar */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
        <div className="flex items-center justify-between">
          {steps.map((step, i) => (
            <div key={step.key} className="flex items-center flex-1">
              <div className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                  i < stepIndex ? 'bg-green-100 text-green-700' :
                  i === stepIndex ? 'bg-amber-500 text-white' : 'bg-gray-100 text-gray-400'
                }`}>
                  {i < stepIndex ? '✓' : i + 1}
                </div>
                <span className={`text-sm ${i === stepIndex ? 'font-semibold text-amber-700' : 'text-gray-400'}`}>{step.label}</span>
              </div>
              {i < steps.length - 1 && <div className={`flex-1 h-0.5 mx-3 ${i < stepIndex ? 'bg-green-300' : 'bg-gray-200'}`} />}
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">

        {/* ── STEP 1: Upload ── */}
        {currentStep === 'upload' && (
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-4">Konferenz-Programm hochladen</h2>

            <div className="grid grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Konferenz-Name</label>
                <input
                  type="text"
                  value={confName}
                  onChange={(e) => setConfName(e.target.value)}
                  placeholder="z.B. AI Summit 2026"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Datum</label>
                <input
                  type="date"
                  value={confDate}
                  onChange={(e) => setConfDate(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-amber-500 outline-none text-sm"
                />
              </div>
            </div>

            <div className="flex gap-2 mb-4">
              {[
                { key: 'pdf' as const, label: 'Programm-PDF', icon: '📕' },
                { key: 'url' as const, label: 'Website-URL', icon: '🌐' },
                { key: 'excel' as const, label: 'Excel/CSV', icon: '📗' },
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setUploadMode(tab.key)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                    uploadMode === tab.key ? 'bg-amber-100 text-amber-700 border border-amber-200' : 'bg-gray-50 text-gray-600 border border-gray-200'
                  }`}
                >
                  {tab.icon} {tab.label}
                </button>
              ))}
            </div>

            {uploadMode === 'pdf' && (
              <div
                onClick={() => setHasUploaded(true)}
                className="border-2 border-dashed border-gray-300 hover:border-amber-400 hover:bg-amber-50 rounded-xl p-12 text-center cursor-pointer transition"
              >
                <div className="text-4xl mb-3">📕</div>
                <p className="text-lg font-medium text-gray-700">
                  Programm-PDF ablegen oder <span className="text-amber-600 underline">auswaehlen</span>
                </p>
                <p className="text-sm text-gray-400 mt-1">Die KI erkennt automatisch Sessions, Speaker, Raeume und Zeitplaene</p>
              </div>
            )}

            {uploadMode === 'url' && (
              <div>
                <input
                  type="url"
                  placeholder="https://conference.example.com/programm"
                  onFocus={() => setHasUploaded(true)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none text-sm"
                />
                <p className="text-xs text-gray-400 mt-1">Die KI crawlt die Programmseite und extrahiert alle Session-Daten.</p>
              </div>
            )}

            {uploadMode === 'excel' && (
              <div
                onClick={() => setHasUploaded(true)}
                className="border-2 border-dashed border-gray-300 hover:border-amber-400 hover:bg-amber-50 rounded-xl p-12 text-center cursor-pointer transition"
              >
                <div className="text-4xl mb-3">📗</div>
                <p className="text-lg font-medium text-gray-700">
                  Session-Liste als Excel/CSV hochladen
                </p>
              </div>
            )}

            {hasUploaded && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
                <span className="text-green-600">✓</span>
                <span className="text-sm font-medium text-gray-900">
                  {uploadMode === 'pdf' ? 'AI_Summit_2026_Programm.pdf' : uploadMode === 'url' ? 'URL bereit' : 'sessions_2026.xlsx'}
                </span>
                <span className="text-xs text-gray-400 ml-auto">Bereit zur Analyse</span>
              </div>
            )}

            <div className="flex justify-end mt-6">
              <button
                onClick={startParsing}
                disabled={!hasUploaded}
                className="px-6 py-3 rounded-lg bg-amber-500 text-white font-medium hover:bg-amber-600 transition disabled:opacity-50"
              >
                🔍 KI-Erkennung starten →
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 2: Parsing ── */}
        {currentStep === 'parse' && isParsing && (
          <div className="text-center py-10">
            <div className="text-5xl mb-4 animate-pulse">🎤</div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Programm wird analysiert...</h2>
            <div className="w-96 mx-auto bg-gray-200 rounded-full h-3 mb-4">
              <div className="bg-amber-500 h-3 rounded-full transition-all" style={{ width: `${parseProgress}%` }} />
            </div>
            <div className="text-sm text-gray-500">
              {parseProgress < 30 && 'PDF wird geparst, Tabellen erkannt...'}
              {parseProgress >= 30 && parseProgress < 60 && 'Sessions, Speaker und Raeume werden extrahiert...'}
              {parseProgress >= 60 && parseProgress < 85 && 'Zeitplan wird rekonstruiert...'}
              {parseProgress >= 85 && 'Speaker-Informationen werden angereichert...'}
            </div>
          </div>
        )}

        {/* ── STEP 3: Review Sessions ── */}
        {currentStep === 'review' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Sessions pruefen</h2>
                <p className="text-sm text-gray-500">
                  <strong>{mockSessions.length} Sessions</strong> in {mockRooms.length} Raeumen erkannt
                </p>
              </div>
              <div className="flex gap-2">
                {Object.entries(trackColors).map(([track, color]) => (
                  <span key={track} className={`px-2 py-1 rounded-full text-xs font-medium ${color}`}>{track}</span>
                ))}
              </div>
            </div>

            {/* Rooms Overview */}
            <div className="grid grid-cols-4 gap-3 mb-4">
              {mockRooms.map(room => (
                <div key={room.name} className="p-3 bg-gray-50 rounded-lg text-center">
                  <div className="text-sm font-medium text-gray-900">{room.name}</div>
                  <div className="text-xs text-gray-400">{room.capacity} Plaetze · {room.floor}</div>
                </div>
              ))}
            </div>

            {/* Timeline View */}
            <div className="space-y-2 mb-6">
              {mockSessions.map(session => (
                <div key={session.id} className="flex items-center gap-4 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition">
                  <div className="w-20 text-center">
                    <div className="text-sm font-bold text-gray-900">{session.time.split('-')[0]}</div>
                    <div className="text-xs text-gray-400">{session.time.split('-')[1]}</div>
                  </div>
                  <div className="w-0.5 h-10 bg-gray-200 rounded" />
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900">{session.title}</div>
                    <div className="text-xs text-gray-500">{session.speaker} · {session.room}</div>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${trackColors[session.track] || 'bg-gray-100 text-gray-600'}`}>
                    {session.track}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    session.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                  }`}>
                    {session.status === 'approved' ? '✓' : '⚠'}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex justify-between">
              <button
                onClick={() => setCurrentStep('upload')}
                className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 text-sm font-medium hover:bg-gray-200 transition"
              >
                ← Zurueck
              </button>
              <button
                onClick={() => setCurrentStep('enrich')}
                className="px-6 py-3 rounded-lg bg-amber-500 text-white font-medium hover:bg-amber-600 transition"
              >
                🤖 Sessions anreichern →
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 4: Enrich ── */}
        {currentStep === 'enrich' && (
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-4">KI-Anreicherung fuer Konferenz-Guide</h2>
            <div className="grid grid-cols-2 gap-6 mb-6">
              <div className="space-y-2">
                {[
                  { label: 'Session-Beschreibungen generieren', desc: 'Kurz- und Langbeschreibung pro Session', checked: true },
                  { label: 'Speaker-Bios anreichern', desc: 'Aus LinkedIn/Web ergaenzen', checked: true },
                  { label: 'Session-Empfehlungen erstellen', desc: 'KI-basierte "Wenn du X magst..."', checked: true },
                  { label: 'Zeitbasierte Navigation', desc: '"Was laeuft gerade?" Feature', checked: true },
                  { label: 'Raumplan-POIs erstellen', desc: 'Raeume als navigierbare Punkte', checked: true },
                  { label: 'Catering-POIs hinzufuegen', desc: 'Essen/Trinken auf dem Gelaende', checked: false },
                ].map(opt => (
                  <label key={opt.label} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 hover:bg-amber-50 transition cursor-pointer">
                    <input type="checkbox" defaultChecked={opt.checked} className="w-4 h-4 text-amber-600 rounded border-gray-300" />
                    <div>
                      <div className="text-sm font-medium text-gray-700">{opt.label}</div>
                      <div className="text-xs text-gray-400">{opt.desc}</div>
                    </div>
                  </label>
                ))}
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Sprachen</h3>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { code: 'de', flag: '🇩🇪', label: 'Deutsch', on: true },
                    { code: 'en', flag: '🇬🇧', label: 'English', on: true },
                    { code: 'fr', flag: '🇫🇷', label: 'Francais', on: false },
                    { code: 'es', flag: '🇪🇸', label: 'Espanol', on: false },
                  ].map(lang => (
                    <label key={lang.code} className="flex items-center gap-2 p-2 rounded-lg bg-gray-50 cursor-pointer">
                      <input type="checkbox" defaultChecked={lang.on} className="w-4 h-4 text-amber-600 rounded" />
                      <span className="text-sm">{lang.flag} {lang.label}</span>
                    </label>
                  ))}
                </div>
                <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <h4 className="text-sm font-semibold text-amber-800 mb-2">Zusammenfassung</h4>
                  <div className="space-y-1 text-sm text-amber-700">
                    <div className="flex justify-between"><span>Sessions</span><span className="font-medium">{mockSessions.length}</span></div>
                    <div className="flex justify-between"><span>Speaker</span><span className="font-medium">{new Set(mockSessions.map(s => s.speaker)).size}</span></div>
                    <div className="flex justify-between"><span>Raeume</span><span className="font-medium">{mockRooms.length}</span></div>
                    <div className="flex justify-between"><span>Sprachen</span><span className="font-medium">2</span></div>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-between">
              <button onClick={() => setCurrentStep('review')} className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 text-sm font-medium hover:bg-gray-200 transition">
                ← Zurueck
              </button>
              <button onClick={() => setCurrentStep('done')} className="px-6 py-3 rounded-lg bg-amber-500 text-white font-medium hover:bg-amber-600 transition">
                🤖 Anreichern & Guide erstellen →
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 5: Done ── */}
        {currentStep === 'done' && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Konferenz-Guide erstellt!</h2>
            <p className="text-gray-500 mb-8">{confName || 'AI Summit 2026'} ist bereit fuer Besucher.</p>
            <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto mb-8">
              {[
                { label: 'Sessions', value: mockSessions.length.toString(), icon: '🎤' },
                { label: 'Speaker', value: new Set(mockSessions.map(s => s.speaker)).size.toString(), icon: '👤' },
                { label: 'Raeume', value: mockRooms.length.toString(), icon: '🏢' },
              ].map(s => (
                <div key={s.label} className="p-4 bg-amber-50 rounded-xl">
                  <div className="text-2xl mb-1">{s.icon}</div>
                  <div className="text-xl font-bold text-amber-800">{s.value}</div>
                  <div className="text-xs text-amber-600">{s.label}</div>
                </div>
              ))}
            </div>
            <div className="flex gap-3 justify-center">
              <Link href="/dashboard/pois" className="px-6 py-3 rounded-lg bg-amber-500 text-white font-medium hover:bg-amber-600 transition">
                Sessions verwalten →
              </Link>
              <Link href="/dashboard/import" className="px-6 py-3 rounded-lg bg-white border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition">
                Zur Import-Zentrale
              </Link>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
