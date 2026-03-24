'use client'

import { useState } from 'react'
import Link from 'next/link'

type FairStep = 'upload' | 'parse' | 'review' | 'enrich' | 'done'

const mockExhibitors = [
  { id: 1, company: 'TechVision GmbH', booth: 'A-101', hall: 'Halle 1', category: 'Software', products: 'KI-Loesungen, Chatbots', website: 'techvision.de', status: 'approved' },
  { id: 2, company: 'DataFlow AG', booth: 'A-205', hall: 'Halle 1', category: 'Cloud', products: 'Cloud-Infrastruktur, DevOps', website: 'dataflow.com', status: 'approved' },
  { id: 3, company: 'GreenEnergy Solutions', booth: 'B-112', hall: 'Halle 2', category: 'Energie', products: 'Solar, Windkraft, Speicher', website: 'greenenergy.at', status: 'approved' },
  { id: 4, company: 'SmartFactory Inc.', booth: 'B-301', hall: 'Halle 2', category: 'Industrie 4.0', products: 'IoT-Sensoren, Robotik', website: 'smartfactory.io', status: 'review_needed' },
  { id: 5, company: 'HealthTech Pro', booth: 'C-005', hall: 'Halle 3', category: 'Medizin', products: 'Telemedizin, Diagnostik-KI', website: 'healthtech.pro', status: 'approved' },
  { id: 6, company: 'EduLearn Platform', booth: 'C-110', hall: 'Halle 3', category: 'Bildung', products: 'E-Learning, LMS', website: 'edulearn.eu', status: 'approved' },
]

const hallStats = [
  { name: 'Halle 1', exhibitors: 87, category: 'IT & Software', color: 'bg-blue-50 text-blue-700' },
  { name: 'Halle 2', exhibitors: 63, category: 'Industrie & Energie', color: 'bg-emerald-50 text-emerald-700' },
  { name: 'Halle 3', exhibitors: 45, category: 'Health & Education', color: 'bg-purple-50 text-purple-700' },
]

export default function FairImportPage() {
  const [currentStep, setCurrentStep] = useState<FairStep>('upload')
  const [uploadMode, setUploadMode] = useState<'excel' | 'pdf' | 'url'>('excel')
  const [isParsing, setIsParsing] = useState(false)
  const [parseProgress, setParseProgress] = useState(0)
  const [hasUploaded, setHasUploaded] = useState(false)
  const [fairName, setFairName] = useState('')
  const [fairLocation, setFairLocation] = useState('')

  const steps: { key: FairStep; label: string }[] = [
    { key: 'upload', label: 'Daten hochladen' },
    { key: 'parse', label: 'KI-Erkennung' },
    { key: 'review', label: 'Aussteller pruefen' },
    { key: 'enrich', label: 'Anreichern' },
    { key: 'done', label: 'Fertig' },
  ]
  const stepIndex = steps.findIndex(s => s.key === currentStep)

  async function startParsing() {
    setCurrentStep('parse')
    setIsParsing(true)
    for (let i = 0; i <= 100; i += 2) {
      setParseProgress(i)
      await new Promise(r => setTimeout(r, 50))
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
          <h1 className="text-2xl font-bold text-gray-900">🎪 Messe / Ausstellung Import</h1>
          <p className="text-gray-500 text-sm mt-1">Ausstellerverzeichnisse und Hallenplaene in einen interaktiven Guide verwandeln</p>
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
                  i === stepIndex ? 'bg-rose-500 text-white' : 'bg-gray-100 text-gray-400'
                }`}>
                  {i < stepIndex ? '✓' : i + 1}
                </div>
                <span className={`text-sm ${i === stepIndex ? 'font-semibold text-rose-700' : 'text-gray-400'}`}>{step.label}</span>
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
            <h2 className="text-lg font-bold text-gray-900 mb-4">Messe-Daten hochladen</h2>

            <div className="grid grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Messe-Name</label>
                <input
                  type="text"
                  value={fairName}
                  onChange={(e) => setFairName(e.target.value)}
                  placeholder="z.B. TechExpo 2026"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 outline-none text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Messegelaende / Standort</label>
                <input
                  type="text"
                  value={fairLocation}
                  onChange={(e) => setFairLocation(e.target.value)}
                  placeholder="z.B. Messe Wien"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-rose-500 outline-none text-sm"
                />
              </div>
            </div>

            <div className="flex gap-2 mb-4">
              {[
                { key: 'excel' as const, label: 'Ausstellerliste (Excel)', icon: '📗' },
                { key: 'pdf' as const, label: 'Messekatalog (PDF)', icon: '📕' },
                { key: 'url' as const, label: 'Messe-Website', icon: '🌐' },
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setUploadMode(tab.key)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                    uploadMode === tab.key ? 'bg-rose-100 text-rose-700 border border-rose-200' : 'bg-gray-50 text-gray-600 border border-gray-200'
                  }`}
                >
                  {tab.icon} {tab.label}
                </button>
              ))}
            </div>

            <div
              onClick={() => setHasUploaded(true)}
              className="border-2 border-dashed border-gray-300 hover:border-rose-400 hover:bg-rose-50 rounded-xl p-12 text-center cursor-pointer transition"
            >
              <div className="text-4xl mb-3">{uploadMode === 'excel' ? '📗' : uploadMode === 'pdf' ? '📕' : '🌐'}</div>
              <p className="text-lg font-medium text-gray-700">
                {uploadMode === 'url'
                  ? 'Messe-URL eingeben'
                  : `${uploadMode === 'excel' ? 'Ausstellerliste' : 'Messekatalog'} hier ablegen`}
              </p>
              <p className="text-sm text-gray-400 mt-1">
                KI erkennt automatisch Aussteller, Standnummern, Hallen und Produktkategorien
              </p>
            </div>

            {/* Hall Plan Upload */}
            <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Optional: Hallenplaene hochladen</h3>
              <p className="text-xs text-gray-400 mb-3">JPG/PNG-Bilder der Hallenplaene — werden digitalisiert fuer interaktive Navigation</p>
              <button className="px-4 py-2 rounded-lg bg-white border border-gray-300 text-sm text-gray-600 hover:bg-gray-50 transition">
                📐 Hallenplaene auswaehlen
              </button>
            </div>

            {hasUploaded && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
                <span className="text-green-600">✓</span>
                <span className="text-sm font-medium text-gray-900">TechExpo_2026_Aussteller.xlsx</span>
                <span className="text-xs text-gray-400 ml-auto">195 Aussteller erkannt</span>
              </div>
            )}

            <div className="flex justify-end mt-6">
              <button
                onClick={startParsing}
                disabled={!hasUploaded}
                className="px-6 py-3 rounded-lg bg-rose-500 text-white font-medium hover:bg-rose-600 transition disabled:opacity-50"
              >
                🔍 KI-Erkennung starten →
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 2: Parsing ── */}
        {currentStep === 'parse' && isParsing && (
          <div className="text-center py-10">
            <div className="text-5xl mb-4 animate-pulse">🎪</div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Ausstellerdaten werden analysiert...</h2>
            <div className="w-96 mx-auto bg-gray-200 rounded-full h-3 mb-4">
              <div className="bg-rose-500 h-3 rounded-full transition-all" style={{ width: `${parseProgress}%` }} />
            </div>
            <div className="text-sm text-gray-500">
              {parseProgress < 25 && 'Datei wird geparst...'}
              {parseProgress >= 25 && parseProgress < 50 && 'Aussteller und Standnummern werden erkannt...'}
              {parseProgress >= 50 && parseProgress < 75 && 'Hallen und Bereiche werden zugeordnet...'}
              {parseProgress >= 75 && 'Produktkategorien werden klassifiziert...'}
            </div>
          </div>
        )}

        {/* ── STEP 3: Review ── */}
        {currentStep === 'review' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Aussteller pruefen</h2>
                <p className="text-sm text-gray-500">
                  <strong>195 Aussteller</strong> in 3 Hallen erkannt
                </p>
              </div>
              <button className="px-3 py-2 rounded-lg bg-green-100 text-green-700 text-sm font-medium hover:bg-green-200 transition">
                ✓ Alle genehmigen
              </button>
            </div>

            {/* Hall Overview */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              {hallStats.map(hall => (
                <div key={hall.name} className={`p-4 rounded-lg ${hall.color}`}>
                  <div className="font-bold">{hall.name}</div>
                  <div className="text-sm">{hall.exhibitors} Aussteller</div>
                  <div className="text-xs opacity-70">{hall.category}</div>
                </div>
              ))}
            </div>

            {/* Exhibitor Table */}
            <div className="overflow-x-auto border border-gray-200 rounded-lg mb-6">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="p-3 text-left font-medium text-gray-600 w-8">
                      <input type="checkbox" defaultChecked className="w-4 h-4 text-rose-600 rounded" />
                    </th>
                    <th className="p-3 text-left font-medium text-gray-600">Firma</th>
                    <th className="p-3 text-left font-medium text-gray-600">Stand</th>
                    <th className="p-3 text-left font-medium text-gray-600">Halle</th>
                    <th className="p-3 text-left font-medium text-gray-600">Branche</th>
                    <th className="p-3 text-left font-medium text-gray-600">Produkte</th>
                    <th className="p-3 text-left font-medium text-gray-600">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {mockExhibitors.map(ex => (
                    <tr key={ex.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="p-3"><input type="checkbox" defaultChecked className="w-4 h-4 text-rose-600 rounded" /></td>
                      <td className="p-3 font-medium text-gray-900">{ex.company}</td>
                      <td className="p-3 font-mono text-xs text-gray-500">{ex.booth}</td>
                      <td className="p-3 text-gray-600">{ex.hall}</td>
                      <td className="p-3"><span className="px-2 py-0.5 bg-gray-100 rounded-full text-xs">{ex.category}</span></td>
                      <td className="p-3 text-gray-600 text-xs">{ex.products}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          ex.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                        }`}>
                          {ex.status === 'approved' ? '✓' : '⚠'}
                        </span>
                      </td>
                    </tr>
                  ))}
                  <tr>
                    <td colSpan={7} className="p-3 text-center text-gray-400 text-sm">... und 189 weitere Aussteller</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="flex justify-between">
              <button onClick={() => setCurrentStep('upload')} className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 text-sm font-medium hover:bg-gray-200 transition">← Zurueck</button>
              <button onClick={() => setCurrentStep('enrich')} className="px-6 py-3 rounded-lg bg-rose-500 text-white font-medium hover:bg-rose-600 transition">
                🤖 Aussteller anreichern →
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 4: Enrich ── */}
        {currentStep === 'enrich' && (
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-4">KI-Anreicherung fuer Messe-Guide</h2>
            <div className="grid grid-cols-2 gap-6 mb-6">
              <div className="space-y-2">
                {[
                  { label: 'Firmenbeschreibungen generieren', desc: 'Aus Website & Produktinfos', checked: true },
                  { label: 'Produktkategorien klassifizieren', desc: 'Automatische Tag-Zuordnung', checked: true },
                  { label: 'Besucher-Routing erstellen', desc: 'Optimierte Wege durch die Hallen', checked: true },
                  { label: 'Hallenplan digitalisieren', desc: 'Bild → interaktive Karte', checked: true },
                  { label: 'Aussteller als Partner anlegen', desc: 'Automatisch im Partner-CRM', checked: false },
                  { label: 'QR-Codes fuer Staende generieren', desc: 'Fuer Scan-to-Info Feature', checked: true },
                ].map(opt => (
                  <label key={opt.label} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 hover:bg-rose-50 transition cursor-pointer">
                    <input type="checkbox" defaultChecked={opt.checked} className="w-4 h-4 text-rose-600 rounded border-gray-300" />
                    <div>
                      <div className="text-sm font-medium text-gray-700">{opt.label}</div>
                      <div className="text-xs text-gray-400">{opt.desc}</div>
                    </div>
                  </label>
                ))}
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Sprachen</h3>
                <div className="grid grid-cols-2 gap-2 mb-6">
                  {[
                    { code: 'de', flag: '🇩🇪', label: 'Deutsch', on: true },
                    { code: 'en', flag: '🇬🇧', label: 'English', on: true },
                    { code: 'fr', flag: '🇫🇷', label: 'Francais', on: false },
                    { code: 'zh', flag: '🇨🇳', label: '中文', on: false },
                  ].map(lang => (
                    <label key={lang.code} className="flex items-center gap-2 p-2 rounded-lg bg-gray-50 cursor-pointer">
                      <input type="checkbox" defaultChecked={lang.on} className="w-4 h-4 text-rose-600 rounded" />
                      <span className="text-sm">{lang.flag} {lang.label}</span>
                    </label>
                  ))}
                </div>
                <div className="p-4 bg-rose-50 border border-rose-200 rounded-lg">
                  <h4 className="text-sm font-semibold text-rose-800 mb-2">Zusammenfassung</h4>
                  <div className="space-y-1 text-sm text-rose-700">
                    <div className="flex justify-between"><span>Aussteller</span><span className="font-medium">195</span></div>
                    <div className="flex justify-between"><span>Hallen</span><span className="font-medium">3</span></div>
                    <div className="flex justify-between"><span>Sprachen</span><span className="font-medium">2</span></div>
                    <div className="flex justify-between"><span>QR-Codes</span><span className="font-medium">195</span></div>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-between">
              <button onClick={() => setCurrentStep('review')} className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 text-sm font-medium hover:bg-gray-200 transition">← Zurueck</button>
              <button onClick={() => setCurrentStep('done')} className="px-6 py-3 rounded-lg bg-rose-500 text-white font-medium hover:bg-rose-600 transition">
                🤖 Messe-Guide erstellen →
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 5: Done ── */}
        {currentStep === 'done' && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Messe-Guide erstellt!</h2>
            <p className="text-gray-500 mb-8">{fairName || 'TechExpo 2026'} — {fairLocation || 'Messe Wien'}</p>
            <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto mb-8">
              {[
                { label: 'Aussteller', value: '195', icon: '🏢' },
                { label: 'Hallen', value: '3', icon: '🏗' },
                { label: 'QR-Codes', value: '195', icon: '📱' },
              ].map(s => (
                <div key={s.label} className="p-4 bg-rose-50 rounded-xl">
                  <div className="text-2xl mb-1">{s.icon}</div>
                  <div className="text-xl font-bold text-rose-800">{s.value}</div>
                  <div className="text-xs text-rose-600">{s.label}</div>
                </div>
              ))}
            </div>
            <div className="flex gap-3 justify-center">
              <Link href="/dashboard/pois" className="px-6 py-3 rounded-lg bg-rose-500 text-white font-medium hover:bg-rose-600 transition">
                Aussteller verwalten →
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
