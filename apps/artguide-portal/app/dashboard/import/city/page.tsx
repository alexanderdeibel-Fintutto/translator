'use client'

import { useState } from 'react'
import Link from 'next/link'

type CityStep = 'setup' | 'scout' | 'review_pois' | 'enrich' | 'import'

const poiCategories = [
  { key: 'attractions', icon: '🏛', label: 'Sehenswuerdigkeiten', color: 'bg-indigo-100 text-indigo-700' },
  { key: 'restaurants', icon: '🍽', label: 'Restaurants', color: 'bg-orange-100 text-orange-700' },
  { key: 'hotels', icon: '🏨', label: 'Hotels', color: 'bg-blue-100 text-blue-700' },
  { key: 'shops', icon: '🛍', label: 'Shopping', color: 'bg-pink-100 text-pink-700' },
  { key: 'culture', icon: '🎭', label: 'Kultur', color: 'bg-purple-100 text-purple-700' },
  { key: 'nature', icon: '🌿', label: 'Natur', color: 'bg-green-100 text-green-700' },
  { key: 'sport', icon: '⚽', label: 'Sport', color: 'bg-yellow-100 text-yellow-700' },
  { key: 'nightlife', icon: '🌙', label: 'Nachtleben', color: 'bg-violet-100 text-violet-700' },
  { key: 'other', icon: '📌', label: 'Sonstiges', color: 'bg-gray-100 text-gray-700' },
]

const dataSources = [
  { key: 'osm', icon: '🗺', label: 'OpenStreetMap', desc: 'Alle POIs im Stadtgebiet automatisch laden', checked: true },
  { key: 'google', icon: '📍', label: 'Google Places', desc: 'Bewertungen, Fotos, Oeffnungszeiten ergaenzen', checked: true },
  { key: 'wikipedia', icon: '📚', label: 'Wikipedia', desc: 'Detaillierte Beschreibungen fuer Sehenswuerdigkeiten', checked: true },
  { key: 'tripadvisor', icon: '🦉', label: 'TripAdvisor', desc: 'Touristen-Bewertungen und Rankings', checked: false },
]

// Mock POI results after scout
const mockScoutResults = [
  { id: 1, name: 'Stephansdom', category: 'attractions', source: 'osm+wiki', rating: 4.8, reviews: 12453, status: 'approved' },
  { id: 2, name: 'Schloss Schoenbrunn', category: 'attractions', source: 'osm+wiki', rating: 4.7, reviews: 28901, status: 'approved' },
  { id: 3, name: 'Naschmarkt', category: 'shops', source: 'osm+google', rating: 4.5, reviews: 8234, status: 'approved' },
  { id: 4, name: 'Figlmueller', category: 'restaurants', source: 'google', rating: 4.3, reviews: 5678, status: 'approved' },
  { id: 5, name: 'Hotel Sacher', category: 'hotels', source: 'google', rating: 4.6, reviews: 3211, status: 'approved' },
  { id: 6, name: 'Albertina', category: 'culture', source: 'osm+wiki', rating: 4.6, reviews: 9876, status: 'approved' },
  { id: 7, name: 'Prater', category: 'nature', source: 'osm+wiki', rating: 4.4, reviews: 15678, status: 'approved' },
  { id: 8, name: 'Flex Club', category: 'nightlife', source: 'google', rating: 4.1, reviews: 1234, status: 'review_needed' },
  { id: 9, name: 'Donaukanal Uferweg', category: 'nature', source: 'osm', rating: 4.3, reviews: 890, status: 'approved' },
  { id: 10, name: 'MuseumsQuartier', category: 'culture', source: 'osm+wiki', rating: 4.5, reviews: 7654, status: 'approved' },
]

export default function CityImportPage() {
  const [currentStep, setCurrentStep] = useState<CityStep>('setup')
  const [cityName, setCityName] = useState('')
  const [country, setCountry] = useState('AT')
  const [selectedCategories, setSelectedCategories] = useState<string[]>(poiCategories.map(c => c.key))
  const [selectedSources, setSelectedSources] = useState<string[]>(dataSources.filter(s => s.checked).map(s => s.key))
  const [radius, setRadius] = useState(5)
  const [isScouting, setIsScouting] = useState(false)
  const [scoutProgress, setScoutProgress] = useState(0)
  const [selectedPois, setSelectedPois] = useState<number[]>(mockScoutResults.map(p => p.id))
  const [filterCategory, setFilterCategory] = useState<string>('')
  const [generateTours, setGenerateTours] = useState(true)
  const [tourLanguages, setTourLanguages] = useState(['de', 'en'])

  const steps: { key: CityStep; label: string }[] = [
    { key: 'setup', label: 'Stadt konfigurieren' },
    { key: 'scout', label: 'City Scout' },
    { key: 'review_pois', label: 'POIs pruefen' },
    { key: 'enrich', label: 'KI-Anreicherung' },
    { key: 'import', label: 'Importieren' },
  ]

  const stepIndex = steps.findIndex(s => s.key === currentStep)

  async function startCityScout() {
    setCurrentStep('scout')
    setIsScouting(true)
    for (let i = 0; i <= 100; i += 1) {
      setScoutProgress(i)
      await new Promise(r => setTimeout(r, 60))
    }
    setIsScouting(false)
    setCurrentStep('review_pois')
  }

  const filteredPois = filterCategory
    ? mockScoutResults.filter(p => p.category === filterCategory)
    : mockScoutResults

  return (
    <>
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/dashboard/import" className="p-2 rounded-lg hover:bg-gray-100 transition text-gray-500">
          ← Zurueck
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">🏙 Stadt / City Guide Import</h1>
          <p className="text-gray-500 text-sm mt-1">Eine komplette Stadt automatisch aufbereiten — POIs, Beschreibungen, Touren</p>
        </div>
      </div>

      {/* Step Indicator */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
        <div className="flex items-center justify-between">
          {steps.map((step, i) => (
            <div key={step.key} className="flex items-center flex-1">
              <div className={`flex items-center gap-2`}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                  i < stepIndex ? 'bg-green-100 text-green-700' :
                  i === stepIndex ? 'bg-emerald-600 text-white' :
                  'bg-gray-100 text-gray-400'
                }`}>
                  {i < stepIndex ? '✓' : i + 1}
                </div>
                <span className={`text-sm ${i === stepIndex ? 'font-semibold text-emerald-700' : 'text-gray-400'}`}>
                  {step.label}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div className={`flex-1 h-0.5 mx-3 ${i < stepIndex ? 'bg-green-300' : 'bg-gray-200'}`} />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">

        {/* ── STEP 1: City Setup ── */}
        {currentStep === 'setup' && (
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-4">Stadt konfigurieren</h2>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stadt / Ort</label>
                  <input
                    type="text"
                    value={cityName}
                    onChange={(e) => setCityName(e.target.value)}
                    placeholder="z.B. Wien, Salzburg, Graz..."
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Land</label>
                  <select
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-emerald-500 outline-none text-sm"
                  >
                    <option value="AT">Oesterreich</option>
                    <option value="DE">Deutschland</option>
                    <option value="CH">Schweiz</option>
                    <option value="IT">Italien</option>
                    <option value="FR">Frankreich</option>
                    <option value="ES">Spanien</option>
                    <option value="NL">Niederlande</option>
                    <option value="CZ">Tschechien</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Such-Radius: {radius} km
                  </label>
                  <input
                    type="range"
                    min={1}
                    max={25}
                    value={radius}
                    onChange={(e) => setRadius(Number(e.target.value))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>1 km (Altstadt)</span>
                    <span>25 km (Region)</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Datenquellen</label>
                  <div className="space-y-2">
                    {dataSources.map(src => (
                      <label key={src.key} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 hover:bg-emerald-50 transition cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedSources.includes(src.key)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedSources([...selectedSources, src.key])
                            } else {
                              setSelectedSources(selectedSources.filter(s => s !== src.key))
                            }
                          }}
                          className="w-4 h-4 text-emerald-600 rounded border-gray-300"
                        />
                        <span className="text-lg">{src.icon}</span>
                        <div>
                          <div className="text-sm font-medium text-gray-700">{src.label}</div>
                          <div className="text-xs text-gray-400">{src.desc}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* POI Categories */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">POI-Kategorien</label>
              <div className="flex flex-wrap gap-2">
                {poiCategories.map(cat => (
                  <button
                    key={cat.key}
                    onClick={() => {
                      if (selectedCategories.includes(cat.key)) {
                        setSelectedCategories(selectedCategories.filter(c => c !== cat.key))
                      } else {
                        setSelectedCategories([...selectedCategories, cat.key])
                      }
                    }}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                      selectedCategories.includes(cat.key)
                        ? cat.color + ' border-2 border-current'
                        : 'bg-gray-50 text-gray-400 border-2 border-transparent'
                    }`}
                  >
                    {cat.icon} {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Tour Generation */}
            <div className="mt-6 p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={generateTours}
                  onChange={(e) => setGenerateTours(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded border-gray-300"
                />
                <div>
                  <div className="text-sm font-medium text-emerald-800">🗺 Automatisch Walking-Touren generieren</div>
                  <div className="text-xs text-emerald-600">KI erstellt optimierte Routen fuer verschiedene Interessen und Dauer</div>
                </div>
              </label>
            </div>

            <div className="flex justify-end mt-6">
              <button
                onClick={startCityScout}
                disabled={!cityName.trim()}
                className="px-6 py-3 rounded-lg bg-emerald-600 text-white font-medium hover:bg-emerald-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                🔍 City Scout starten →
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 2: City Scout Running ── */}
        {currentStep === 'scout' && isScouting && (
          <div className="text-center py-10">
            <div className="text-5xl mb-4 animate-pulse">🏙</div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">City Scout durchsucht {cityName || 'Wien'}...</h2>
            <div className="w-96 mx-auto bg-gray-200 rounded-full h-3 mb-4">
              <div
                className="bg-emerald-500 h-3 rounded-full transition-all duration-200"
                style={{ width: `${scoutProgress}%` }}
              />
            </div>
            <div className="space-y-2 text-sm text-gray-500">
              {scoutProgress < 25 && <p>🗺 OpenStreetMap-Daten werden geladen...</p>}
              {scoutProgress >= 25 && scoutProgress < 50 && <p>📍 Google Places Informationen werden abgerufen...</p>}
              {scoutProgress >= 50 && scoutProgress < 75 && <p>📚 Wikipedia-Artikel werden extrahiert...</p>}
              {scoutProgress >= 75 && <p>🤖 KI kategorisiert und bewertet POIs...</p>}
            </div>
            {scoutProgress > 20 && (
              <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 rounded-lg text-emerald-700 text-sm">
                <span className="font-bold">{Math.floor(scoutProgress * 12.03)}</span> POIs gefunden
              </div>
            )}
          </div>
        )}

        {/* ── STEP 3: Review POIs ── */}
        {currentStep === 'review_pois' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900">POIs pruefen & auswaehlen</h2>
                <p className="text-sm text-gray-500">
                  <strong>1.203</strong> POIs in {cityName || 'Wien'} gefunden — waehle aus welche importiert werden sollen
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedPois(mockScoutResults.map(p => p.id))}
                  className="px-3 py-2 rounded-lg bg-green-100 text-green-700 text-sm font-medium hover:bg-green-200 transition"
                >
                  ✓ Alle waehlen
                </button>
                <button
                  onClick={() => setSelectedPois([])}
                  className="px-3 py-2 rounded-lg bg-gray-100 text-gray-600 text-sm font-medium hover:bg-gray-200 transition"
                >
                  Keine
                </button>
              </div>
            </div>

            {/* Category Filter */}
            <div className="flex gap-2 mb-4 flex-wrap">
              <button
                onClick={() => setFilterCategory('')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                  !filterCategory ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                }`}
              >
                Alle ({mockScoutResults.length})
              </button>
              {poiCategories.filter(c => mockScoutResults.some(p => p.category === c.key)).map(cat => (
                <button
                  key={cat.key}
                  onClick={() => setFilterCategory(filterCategory === cat.key ? '' : cat.key)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                    filterCategory === cat.key ? cat.color : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                  }`}
                >
                  {cat.icon} {cat.label} ({mockScoutResults.filter(p => p.category === cat.key).length})
                </button>
              ))}
            </div>

            {/* POI Cards */}
            <div className="space-y-2 mb-6">
              {filteredPois.map(poi => {
                const cat = poiCategories.find(c => c.key === poi.category)
                return (
                  <div
                    key={poi.id}
                    className={`flex items-center gap-4 p-3 rounded-lg border transition cursor-pointer ${
                      selectedPois.includes(poi.id)
                        ? 'bg-emerald-50 border-emerald-200'
                        : 'bg-white border-gray-200 opacity-60'
                    }`}
                    onClick={() => {
                      if (selectedPois.includes(poi.id)) {
                        setSelectedPois(selectedPois.filter(id => id !== poi.id))
                      } else {
                        setSelectedPois([...selectedPois, poi.id])
                      }
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={selectedPois.includes(poi.id)}
                      readOnly
                      className="w-4 h-4 text-emerald-600 rounded border-gray-300"
                    />
                    <span className="text-xl">{cat?.icon}</span>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900">{poi.name}</div>
                      <div className="text-xs text-gray-400">Quellen: {poi.source}</div>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${cat?.color}`}>
                      {cat?.label}
                    </span>
                    <div className="text-right">
                      <div className="text-sm font-medium text-yellow-600">★ {poi.rating}</div>
                      <div className="text-xs text-gray-400">{poi.reviews.toLocaleString()} Bewertungen</div>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      poi.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                    }`}>
                      {poi.status === 'approved' ? '✓' : '⚠'}
                    </span>
                  </div>
                )
              })}
              <div className="text-center text-gray-400 text-sm py-2">
                ... und 1.193 weitere POIs
              </div>
            </div>

            <div className="flex justify-between">
              <button
                onClick={() => setCurrentStep('setup')}
                className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 text-sm font-medium hover:bg-gray-200 transition"
              >
                ← Zurueck
              </button>
              <button
                onClick={() => setCurrentStep('enrich')}
                className="px-6 py-3 rounded-lg bg-emerald-600 text-white font-medium hover:bg-emerald-700 transition"
              >
                🤖 {selectedPois.length} POIs anreichern →
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 4: Enrichment Config ── */}
        {currentStep === 'enrich' && (
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-1">KI-Anreicherung fuer {selectedPois.length} POIs</h2>
            <p className="text-sm text-gray-500 mb-6">Die KI generiert Beschreibungen, Uebersetzungen und optionale Audio-Guides.</p>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-700">Was soll generiert werden?</h3>
                {[
                  { key: 'desc_brief', label: 'Kurzbeschreibung', desc: '1-2 Saetze pro POI', checked: true },
                  { key: 'desc_standard', label: 'Ausfuehrliche Beschreibung', desc: 'Detaillierte Infos', checked: true },
                  { key: 'opening_hours', label: 'Oeffnungszeiten normalisieren', desc: 'Aus Google Places', checked: true },
                  { key: 'audio', label: 'Audio-Narration', desc: 'TTS fuer Stadt-Tour', checked: false },
                  { key: 'tours', label: 'Walking-Touren generieren', desc: '3-5 thematische Touren', checked: generateTours },
                  { key: 'partner_candidates', label: 'Partner-Kandidaten markieren', desc: 'Fuer Akquise-Pipeline', checked: true },
                ].map(opt => (
                  <label key={opt.key} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 hover:bg-emerald-50 transition cursor-pointer">
                    <input type="checkbox" defaultChecked={opt.checked} className="w-4 h-4 text-emerald-600 rounded border-gray-300" />
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
                    { code: 'de', flag: '🇩🇪', label: 'Deutsch' },
                    { code: 'en', flag: '🇬🇧', label: 'English' },
                    { code: 'fr', flag: '🇫🇷', label: 'Francais' },
                    { code: 'it', flag: '🇮🇹', label: 'Italiano' },
                    { code: 'es', flag: '🇪🇸', label: 'Espanol' },
                    { code: 'zh', flag: '🇨🇳', label: '中文' },
                    { code: 'ja', flag: '🇯🇵', label: '日本語' },
                    { code: 'ko', flag: '🇰🇷', label: '한국어' },
                  ].map(lang => (
                    <label key={lang.code} className="flex items-center gap-2 p-2 rounded-lg bg-gray-50 hover:bg-emerald-50 transition cursor-pointer">
                      <input
                        type="checkbox"
                        defaultChecked={['de', 'en'].includes(lang.code)}
                        className="w-4 h-4 text-emerald-600 rounded border-gray-300"
                      />
                      <span className="text-sm">{lang.flag} {lang.label}</span>
                    </label>
                  ))}
                </div>

                <div className="mt-6 p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
                  <h4 className="text-sm font-semibold text-emerald-800 mb-2">Geschaetzter Aufwand</h4>
                  <div className="space-y-1 text-sm text-emerald-700">
                    <div className="flex justify-between"><span>POIs</span><span className="font-medium">{selectedPois.length}</span></div>
                    <div className="flex justify-between"><span>Beschreibungen</span><span className="font-medium">2 Typen × 2 Sprachen</span></div>
                    <div className="flex justify-between"><span>Walking-Touren</span><span className="font-medium">5</span></div>
                    <div className="border-t border-emerald-300 mt-2 pt-2 flex justify-between font-bold">
                      <span>KI-Generierungen</span><span>{selectedPois.length * 4 + 5}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-between mt-6">
              <button
                onClick={() => setCurrentStep('review_pois')}
                className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 text-sm font-medium hover:bg-gray-200 transition"
              >
                ← Zurueck
              </button>
              <button
                onClick={() => setCurrentStep('import')}
                className="px-6 py-3 rounded-lg bg-emerald-600 text-white font-medium hover:bg-emerald-700 transition"
              >
                🤖 Anreicherung starten & importieren →
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 5: Import Complete ── */}
        {currentStep === 'import' && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Import abgeschlossen!</h2>
            <p className="text-gray-500 mb-8">
              {cityName || 'Wien'} wurde erfolgreich als City Guide eingerichtet.
            </p>
            <div className="grid grid-cols-4 gap-4 max-w-2xl mx-auto mb-8">
              {[
                { label: 'POIs importiert', value: selectedPois.length.toString(), icon: '📍' },
                { label: 'Beschreibungen', value: (selectedPois.length * 4).toString(), icon: '📝' },
                { label: 'Walking-Touren', value: '5', icon: '🗺' },
                { label: 'Partner-Kandidaten', value: Math.floor(selectedPois.length * 0.3).toString(), icon: '🤝' },
              ].map(stat => (
                <div key={stat.label} className="p-4 bg-emerald-50 rounded-xl">
                  <div className="text-2xl mb-1">{stat.icon}</div>
                  <div className="text-xl font-bold text-emerald-800">{stat.value}</div>
                  <div className="text-xs text-emerald-600">{stat.label}</div>
                </div>
              ))}
            </div>
            <div className="flex gap-3 justify-center">
              <Link href="/dashboard/pois" className="px-6 py-3 rounded-lg bg-emerald-600 text-white font-medium hover:bg-emerald-700 transition">
                POIs verwalten →
              </Link>
              <Link href="/dashboard/city-tours" className="px-6 py-3 rounded-lg bg-white border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition">
                Touren ansehen
              </Link>
              <Link href="/dashboard/partner-crm" className="px-6 py-3 rounded-lg bg-white border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition">
                Partner-CRM
              </Link>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
