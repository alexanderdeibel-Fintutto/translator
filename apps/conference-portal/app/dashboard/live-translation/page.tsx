'use client'
import { useState } from 'react'
import Link from 'next/link'
export default function LiveTranslationPage() {
  const [sessionName, setSessionName] = useState('')
  const [started, setStarted] = useState(false)
  return (
    <>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">🔊 Live-Übersetzung</h1>
        <p className="text-gray-500 mt-1">Echtzeit-Übersetzung für Ihre laufende Session starten</p>
      </div>
      {!started ? (
        <div className="max-w-lg">
          <div className="bg-white rounded-xl p-8 border border-gray-200 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Session-Name</label>
              <input value={sessionName} onChange={e => setSessionName(e.target.value)} placeholder="z.B. Keynote: Zukunft der KI" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ausgangssprache</label>
              <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-500">
                <option>Deutsch</option><option>Englisch</option><option>Französisch</option><option>Spanisch</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Zielsprachen (Teilnehmer können wählen)</label>
              <div className="grid grid-cols-3 gap-2">
                {['Englisch','Spanisch','Französisch','Chinesisch','Arabisch','Russisch'].map(lang => (
                  <label key={lang} className="flex items-center gap-1.5 text-sm cursor-pointer">
                    <input type="checkbox" defaultChecked={lang === 'Englisch'} className="rounded" />
                    {lang}
                  </label>
                ))}
              </div>
            </div>
            <button onClick={() => setStarted(true)} disabled={!sessionName} className="w-full py-3 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 transition disabled:opacity-50">🔊 Session starten</button>
          </div>
        </div>
      ) : (
        <div className="max-w-lg">
          <div className="bg-green-50 border border-green-200 rounded-xl p-8 text-center space-y-4">
            <div className="text-5xl">🔊</div>
            <h2 className="text-xl font-bold text-green-900">Session läuft: {sessionName}</h2>
            <p className="text-green-700 text-sm">Teilen Sie den QR-Code mit Ihren Teilnehmern. Sie können sofort in ihrer Sprache mitlesen.</p>
            <div className="bg-white rounded-lg p-6 border border-green-200">
              <div className="w-32 h-32 bg-gray-100 rounded-lg mx-auto flex items-center justify-center text-gray-400 text-sm">QR-Code</div>
              <p className="text-xs text-gray-500 mt-2">conference.fintutto.world/join/demo</p>
            </div>
            <button onClick={() => setStarted(false)} className="px-6 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200 transition">Session beenden</button>
          </div>
        </div>
      )}
    </>
  )
}
