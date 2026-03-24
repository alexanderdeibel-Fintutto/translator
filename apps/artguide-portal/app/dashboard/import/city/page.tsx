'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useMuseum, importActions } from '@/lib/hooks'

const poiCategories = [
  { key: 'attractions', icon: '🏛', label: 'Sehenswürdigkeiten', color: 'bg-indigo-100 text-indigo-700' },
  { key: 'restaurants', icon: '🍽', label: 'Restaurants', color: 'bg-orange-100 text-orange-700' },
  { key: 'hotels', icon: '🏨', label: 'Hotels', color: 'bg-blue-100 text-blue-700' },
  { key: 'shops', icon: '🛍', label: 'Shopping', color: 'bg-pink-100 text-pink-700' },
  { key: 'culture', icon: '🎭', label: 'Kultur', color: 'bg-purple-100 text-purple-700' },
  { key: 'nature', icon: '🌿', label: 'Natur', color: 'bg-green-100 text-green-700' },
  { key: 'sport', icon: '⚽', label: 'Sport', color: 'bg-yellow-100 text-yellow-700' },
  { key: 'nightlife', icon: '🌙', label: 'Nachtleben', color: 'bg-violet-100 text-violet-700' },
  { key: 'other', icon: '📌', label: 'Sonstiges', color: 'bg-gray-100 text-gray-700' },
]

const availableLanguages = [
  { code: 'de', flag: '🇩🇪', label: 'Deutsch' },
  { code: 'en', flag: '🇬🇧', label: 'English' },
  { code: 'fr', flag: '🇫🇷', label: 'Français' },
  { code: 'it', flag: '🇮🇹', label: 'Italiano' },
  { code: 'es', flag: '🇪🇸', label: 'Español' },
  { code: 'zh', flag: '🇨🇳', label: '中文' },
  { code: 'ja', flag: '🇯🇵', label: '日本語' },
  { code: 'ko', flag: '🇰🇷', label: '한국어' },
]

const COUNTRY_OPTIONS = [
  { code: 'AT', label: 'Österreich' },
  { code: 'DE', label: 'Deutschland' },
  { code: 'CH', label: 'Schweiz' },
  { code: 'IT', label: 'Italien' },
  { code: 'FR', label: 'Frankreich' },
  { code: 'ES', label: 'Spanien' },
  { code: 'NL', label: 'Niederlande' },
  { code: 'BE', label: 'Belgien' },
  { code: 'CZ', label: 'Tschechien' },
  { code: 'PL', label: 'Polen' },
  { code: 'GB', label: 'Großbritannien' },
  { code: 'US', label: 'USA' },
  { code: 'JP', label: 'Japan' },
  { code: 'CN', label: 'China' },
]

export default function CityImportPage() {
  const router = useRouter()
  const { museum, loading: museumLoading } = useMuseum()

  const [cityName, setCityName] = useState('')
  const [country, setCountry] = useState('AT')
  const [radius, setRadius] = useState(5)
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    poiCategories.map(c => c.key)
  )
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(['de', 'en'])
  const [generateTours, setGenerateTours] = useState(true)
  const [isStarting, setIsStarting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function toggleCategory(key: string) {
    setSelectedCategories(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    )
  }

  function toggleLanguage(code: string) {
    setSelectedLanguages(prev =>
      prev.includes(code)
        ? prev.length > 1 ? prev.filter(l => l !== code) : prev
        : [...prev, code]
    )
  }

  async function handleStartScout() {
    if (!cityName.trim()) {
      setError('Bitte gib einen Stadtnamen ein.')
      return
    }
    if (!museum) {
      setError('Kein Museum gefunden. Bitte richte zuerst ein Museum ein.')
      return
    }
    if (selectedCategories.length === 0) {
      setError('Bitte wähle mindestens eine POI-Kategorie.')
      return
    }

    setIsStarting(true)
    setError(null)

    try {
      const job = await importActions.scoutCity({
        museumId: museum.id,
        cityName: cityName.trim(),
        country,
        radiusKm: radius,
        categories: selectedCategories,
        languages: selectedLanguages,
        generateTours,
      })
      // Redirect to job detail page
      router.push(`/dashboard/import/${job.id}`)
    } catch (e: any) {
      setError(e.message || 'Fehler beim Starten des City Scouts.')
      setIsStarting(false)
    }
  }

  if (museumLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin text-4xl">⚙️</div>
      </div>
    )
  }

  if (!museum) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
        <h2 className="font-bold text-yellow-800 mb-2">Kein Museum gefunden</h2>
        <p className="text-yellow-700 text-sm mb-4">
          Du musst zuerst ein Museum einrichten, bevor du einen City Guide importieren kannst.
        </p>
        <Link href="/dashboard/settings" className="px-4 py-2 bg-yellow-600 text-white rounded-lg text-sm font-medium hover:bg-yellow-700 transition">
          Museum einrichten →
        </Link>
      </div>
    )
  }

  return (
    <>
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/dashboard/import" className="p-2 rounded-lg hover:bg-gray-100 transition text-gray-500">
          ← Zurück
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">🏙 Stadt / City Guide Import</h1>
          <p className="text-gray-500 text-sm mt-1">
            KI recherchiert automatisch POIs, Beschreibungen und Touren für jede beliebige Stadt
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
          <span className="text-red-500">⚠️</span>
          <p className="text-red-700 text-sm flex-1">{error}</p>
          <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600">✕</button>
        </div>
      )}

      {/* How it works banner */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 mb-6">
        <h3 className="text-sm font-semibold text-emerald-800 mb-1">So funktioniert der City Scout</h3>
        <p className="text-sm text-emerald-700">
          Die KI recherchiert die wichtigsten POIs der eingegebenen Stadt, generiert mehrsprachige Beschreibungen
          und erstellt optional Walking-Touren. Der Prozess dauert 1–3 Minuten.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="grid grid-cols-2 gap-8">

          {/* Left column */}
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Stadt / Ort <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={cityName}
                onChange={e => setCityName(e.target.value)}
                placeholder="z.B. Salzburg, München, Florenz..."
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none text-sm"
                onKeyDown={e => e.key === 'Enter' && handleStartScout()}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Land</label>
              <select
                value={country}
                onChange={e => setCountry(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-emerald-500 outline-none text-sm"
              >
                {COUNTRY_OPTIONS.map(c => (
                  <option key={c.code} value={c.code}>{c.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Such-Radius: <strong>{radius} km</strong>
              </label>
              <input
                type="range"
                min={1}
                max={25}
                value={radius}
                onChange={e => setRadius(Number(e.target.value))}
                className="w-full accent-emerald-600"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>1 km (Altstadt)</span>
                <span>25 km (Region)</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sprachen</label>
              <div className="flex flex-wrap gap-2">
                {availableLanguages.map(lang => (
                  <button
                    key={lang.code}
                    onClick={() => toggleLanguage(lang.code)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition border ${
                      selectedLanguages.includes(lang.code)
                        ? 'bg-emerald-100 text-emerald-700 border-emerald-300'
                        : 'bg-gray-50 text-gray-500 border-transparent hover:border-gray-300'
                    }`}
                  >
                    {lang.flag} {lang.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={generateTours}
                  onChange={e => setGenerateTours(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded border-gray-300"
                />
                <div>
                  <div className="text-sm font-medium text-emerald-800">🗺 Walking-Touren generieren</div>
                  <div className="text-xs text-emerald-600">KI erstellt optimierte Routen für verschiedene Interessen</div>
                </div>
              </label>
            </div>
          </div>

          {/* Right column: categories */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                POI-Kategorien ({selectedCategories.length}/{poiCategories.length})
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedCategories(poiCategories.map(c => c.key))}
                  className="text-xs text-emerald-600 hover:underline"
                >
                  Alle
                </button>
                <span className="text-gray-300">|</span>
                <button
                  onClick={() => setSelectedCategories([])}
                  className="text-xs text-gray-400 hover:underline"
                >
                  Keine
                </button>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {poiCategories.map(cat => (
                <button
                  key={cat.key}
                  onClick={() => toggleCategory(cat.key)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition border-2 ${
                    selectedCategories.includes(cat.key)
                      ? cat.color + ' border-current'
                      : 'bg-gray-50 text-gray-400 border-transparent hover:border-gray-200'
                  }`}
                >
                  {cat.icon} {cat.label}
                </button>
              ))}
            </div>

            {/* Estimate */}
            <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Geschätzter Umfang</h4>
              <div className="space-y-1 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>POIs (KI-Schätzung)</span>
                  <span className="font-medium">30–50</span>
                </div>
                <div className="flex justify-between">
                  <span>Sprachen</span>
                  <span className="font-medium">{selectedLanguages.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Kategorien</span>
                  <span className="font-medium">{selectedCategories.length}</span>
                </div>
                {generateTours && (
                  <div className="flex justify-between">
                    <span>Walking-Touren</span>
                    <span className="font-medium">3–5</span>
                  </div>
                )}
                <div className="border-t border-gray-300 mt-2 pt-2 flex justify-between font-semibold text-gray-700">
                  <span>Dauer</span>
                  <span>~1–3 Minuten</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end mt-8">
          <button
            onClick={handleStartScout}
            disabled={!cityName.trim() || isStarting || selectedCategories.length === 0}
            className="px-8 py-3 rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isStarting ? (
              <>
                <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                City Scout wird gestartet...
              </>
            ) : (
              <>🔍 City Scout starten für {cityName || '...'}</>
            )}
          </button>
        </div>
      </div>
    </>
  )
}
