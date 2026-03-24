'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'

type WizardStep = 'upload' | 'analyze' | 'mapping' | 'enrich' | 'review'

const steps: { key: WizardStep; label: string; icon: string }[] = [
  { key: 'upload', label: 'Hochladen', icon: '📁' },
  { key: 'analyze', label: 'KI-Analyse', icon: '🔍' },
  { key: 'mapping', label: 'Feld-Zuordnung', icon: '🔗' },
  { key: 'enrich', label: 'KI-Anreicherung', icon: '🤖' },
  { key: 'review', label: 'Pruefen & Import', icon: '✅' },
]

const supportedFormats = [
  { ext: 'CSV', icon: '📊', desc: 'Komma/Semikolon-getrennt' },
  { ext: 'XLSX', icon: '📗', desc: 'Excel Arbeitsmappe' },
  { ext: 'PDF', icon: '📕', desc: 'Katalog-PDF mit Werksliste' },
  { ext: 'ZIP', icon: '📦', desc: 'Foto-Ordner mit EXIF-Daten' },
  { ext: 'JSON', icon: '📋', desc: 'Strukturierte Daten' },
  { ext: 'URL', icon: '🌐', desc: 'Website-URL zum Crawlen' },
]

const targetFields = [
  { key: 'inventory_number', label: 'Inventarnummer', required: true },
  { key: 'title', label: 'Titel', required: true },
  { key: 'artist_name', label: 'Kuenstler', required: false },
  { key: 'year_created', label: 'Entstehungsjahr', required: false },
  { key: 'medium', label: 'Technik/Material', required: false },
  { key: 'dimensions', label: 'Masse', required: false },
  { key: 'style', label: 'Stil', required: false },
  { key: 'epoch', label: 'Epoche', required: false },
  { key: 'room', label: 'Raum/Standort', required: false },
  { key: 'origin', label: 'Herkunft', required: false },
  { key: 'description', label: 'Beschreibung (falls vorhanden)', required: false },
  { key: 'image_url', label: 'Bild-URL', required: false },
]

const enrichmentOptions = [
  { key: 'description_brief', label: 'Kurzbeschreibung', desc: '1-2 Saetze', default: true },
  { key: 'description_standard', label: 'Standardbeschreibung', desc: '4-6 Saetze', default: true },
  { key: 'description_detailed', label: 'Detailbeschreibung', desc: '8-15 Saetze', default: true },
  { key: 'description_children', label: 'Kinderbeschreibung', desc: 'Fuer 6-12 Jahre', default: true },
  { key: 'description_youth', label: 'Jugendbeschreibung', desc: 'Fuer 13-17 Jahre', default: true },
  { key: 'fun_facts', label: 'Fun Facts', desc: 'Ueberraschende Fakten', default: true },
  { key: 'historical_context', label: 'Historischer Kontext', desc: 'Zeitgeschichte', default: true },
  { key: 'technique_details', label: 'Technik-Details', desc: 'Materialien & Arbeitsweise', default: false },
]

const languages = [
  { code: 'de', label: 'Deutsch', flag: '🇩🇪', default: true },
  { code: 'en', label: 'English', flag: '🇬🇧', default: true },
  { code: 'fr', label: 'Francais', flag: '🇫🇷', default: false },
  { code: 'it', label: 'Italiano', flag: '🇮🇹', default: false },
  { code: 'es', label: 'Espanol', flag: '🇪🇸', default: false },
  { code: 'nl', label: 'Nederlands', flag: '🇳🇱', default: false },
  { code: 'pl', label: 'Polski', flag: '🇵🇱', default: false },
  { code: 'cs', label: 'Cesky', flag: '🇨🇿', default: false },
  { code: 'zh', label: '中文', flag: '🇨🇳', default: false },
  { code: 'ja', label: '日本語', flag: '🇯🇵', default: false },
  { code: 'ko', label: '한국어', flag: '🇰🇷', default: false },
  { code: 'ar', label: 'العربية', flag: '🇸🇦', default: false },
]

// Mock data for demonstration
const mockDetectedColumns = ['Inv.Nr.', 'Titel', 'Kuenstler', 'Datierung', 'Technik', 'Masse (cm)', 'Raum', 'Stil/Epoche']
const mockSampleRows = [
  ['GK-2024-001', 'Sonnenaufgang am See', 'Maria Huber', '1923', 'Oel auf Leinwand', '120 x 85', 'Saal A', 'Impressionismus'],
  ['GK-2024-002', 'Abstrakte Komposition Nr. 7', 'Franz Berger', '1958', 'Acryl auf Holz', '90 x 60', 'Saal B', 'Abstrakte Kunst'],
  ['GK-2024-003', 'Portraet einer jungen Frau', 'Elisabeth Stern', '1887', 'Oel auf Leinwand', '65 x 50', 'Saal A', 'Realismus'],
]

const mockAiMapping = {
  'Inv.Nr.': 'inventory_number',
  'Titel': 'title',
  'Kuenstler': 'artist_name',
  'Datierung': 'year_created',
  'Technik': 'medium',
  'Masse (cm)': 'dimensions',
  'Raum': 'room',
  'Stil/Epoche': 'style',
}

export default function MuseumImportPage() {
  const [currentStep, setCurrentStep] = useState<WizardStep>('upload')
  const [uploadMode, setUploadMode] = useState<'file' | 'url' | 'paste'>('file')
  const [isDragging, setIsDragging] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<{ name: string; size: string; type: string }[]>([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [fieldMapping, setFieldMapping] = useState<Record<string, string>>(mockAiMapping)
  const [selectedEnrichments, setSelectedEnrichments] = useState<string[]>(
    enrichmentOptions.filter(o => o.default).map(o => o.key)
  )
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(
    languages.filter(l => l.default).map(l => l.code)
  )
  const [generateAudio, setGenerateAudio] = useState(false)
  const [isEnriching, setIsEnriching] = useState(false)
  const [enrichProgress, setEnrichProgress] = useState(0)

  const stepIndex = steps.findIndex(s => s.key === currentStep)

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setIsDragging(false)
    const files = Array.from(e.dataTransfer.files)
    setUploadedFiles(files.map(f => ({
      name: f.name,
      size: (f.size / 1024).toFixed(1) + ' KB',
      type: f.name.split('.').pop()?.toUpperCase() || 'Unbekannt',
    })))
  }

  function simulateFileSelect() {
    setUploadedFiles([
      { name: 'Werksliste_Museum_2024.xlsx', size: '247.3 KB', type: 'XLSX' },
    ])
  }

  async function startAnalysis() {
    setIsAnalyzing(true)
    setCurrentStep('analyze')
    // Simulate AI analysis
    await new Promise(r => setTimeout(r, 2500))
    setIsAnalyzing(false)
    setCurrentStep('mapping')
  }

  async function startEnrichment() {
    setCurrentStep('enrich')
    setIsEnriching(true)
    for (let i = 0; i <= 100; i += 2) {
      setEnrichProgress(i)
      await new Promise(r => setTimeout(r, 80))
    }
    setIsEnriching(false)
    setCurrentStep('review')
  }

  return (
    <>
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/dashboard/import" className="p-2 rounded-lg hover:bg-gray-100 transition text-gray-500">
          ← Zurueck
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">🏛 Museum Import</h1>
          <p className="text-gray-500 text-sm mt-1">Kunstwerke aus Werkslisten, Katalogen und Fotos importieren</p>
        </div>
      </div>

      {/* Step Indicator */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
        <div className="flex items-center justify-between">
          {steps.map((step, i) => (
            <div key={step.key} className="flex items-center flex-1">
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  i < stepIndex ? 'bg-green-100 text-green-700' :
                  i === stepIndex ? 'bg-indigo-600 text-white' :
                  'bg-gray-100 text-gray-400'
                }`}>
                  {i < stepIndex ? '✓' : step.icon}
                </div>
                <span className={`text-sm font-medium ${
                  i === stepIndex ? 'text-indigo-700' : i < stepIndex ? 'text-green-700' : 'text-gray-400'
                }`}>
                  {step.label}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div className={`flex-1 h-0.5 mx-4 ${i < stepIndex ? 'bg-green-300' : 'bg-gray-200'}`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">

        {/* ── STEP 1: Upload ── */}
        {currentStep === 'upload' && (
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-4">Quelldaten hochladen</h2>

            {/* Upload Mode Tabs */}
            <div className="flex gap-2 mb-6">
              {[
                { key: 'file' as const, label: 'Datei hochladen', icon: '📁' },
                { key: 'url' as const, label: 'URL crawlen', icon: '🌐' },
                { key: 'paste' as const, label: 'Text einfuegen', icon: '📋' },
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setUploadMode(tab.key)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                    uploadMode === tab.key
                      ? 'bg-indigo-100 text-indigo-700 border border-indigo-200'
                      : 'bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  {tab.icon} {tab.label}
                </button>
              ))}
            </div>

            {uploadMode === 'file' && (
              <>
                {/* Drop Zone */}
                <div
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  onClick={simulateFileSelect}
                  className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition ${
                    isDragging
                      ? 'border-indigo-400 bg-indigo-50'
                      : 'border-gray-300 hover:border-indigo-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="text-4xl mb-3">📁</div>
                  <p className="text-lg font-medium text-gray-700">
                    Dateien hier ablegen oder <span className="text-indigo-600 underline">klicken zum Auswaehlen</span>
                  </p>
                  <div className="flex justify-center gap-4 mt-4">
                    {supportedFormats.slice(0, 5).map(f => (
                      <span key={f.ext} className="text-xs text-gray-400">
                        {f.icon} {f.ext}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Uploaded Files */}
                {uploadedFiles.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {uploadedFiles.map((file, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center gap-3">
                          <span className="text-lg">📗</span>
                          <div>
                            <div className="text-sm font-medium text-gray-900">{file.name}</div>
                            <div className="text-xs text-gray-500">{file.size} · {file.type}</div>
                          </div>
                        </div>
                        <span className="text-green-600 text-sm font-medium">✓ Bereit</span>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {uploadMode === 'url' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Museum/Katalog Website-URL</label>
                  <input
                    type="url"
                    placeholder="https://museum.example.com/sammlung"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-sm"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Die KI durchsucht die Seite und extrahiert automatisch Werksdaten.
                  </p>
                </div>
              </div>
            )}

            {uploadMode === 'paste' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Werksliste einfuegen</label>
                <textarea
                  rows={10}
                  placeholder={"Inv.Nr.\tTitel\tKuenstler\tJahr\nGK-001\tSonnenaufgang am See\tMaria Huber\t1923\n..."}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-sm font-mono"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Tab-getrennt, komma-getrennt oder einfach freier Text — die KI erkennt das Format automatisch.
                </p>
              </div>
            )}

            {/* Action Button */}
            <div className="flex justify-end mt-6">
              <button
                onClick={startAnalysis}
                disabled={uploadedFiles.length === 0 && uploadMode === 'file'}
                className="px-6 py-3 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                🔍 KI-Analyse starten →
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 2: AI Analysis (shown briefly) ── */}
        {currentStep === 'analyze' && isAnalyzing && (
          <div className="text-center py-12">
            <div className="text-5xl mb-4 animate-bounce">🔍</div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">KI analysiert Ihre Daten...</h2>
            <p className="text-gray-500 mb-6">Format wird erkannt, Spalten werden identifiziert, Datenqualitaet wird geprueft</p>
            <div className="w-64 mx-auto bg-gray-200 rounded-full h-2">
              <div className="bg-indigo-600 h-2 rounded-full animate-pulse" style={{ width: '60%' }} />
            </div>
          </div>
        )}

        {/* ── STEP 3: Field Mapping ── */}
        {currentStep === 'mapping' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Feld-Zuordnung</h2>
                <p className="text-sm text-gray-500">
                  Die KI hat <strong>347 Werke</strong> in 8 Spalten erkannt. Pruefe die Zuordnung:
                </p>
              </div>
              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                94% Konfidenz
              </span>
            </div>

            {/* Sample Data Preview */}
            <div className="overflow-x-auto mb-6">
              <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
                <thead>
                  <tr className="bg-gray-50">
                    {mockDetectedColumns.map(col => (
                      <th key={col} className="p-2 text-left font-medium text-gray-600 border-b border-gray-200">
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {mockSampleRows.map((row, i) => (
                    <tr key={i} className="border-b border-gray-100">
                      {row.map((cell, j) => (
                        <td key={j} className="p-2 text-gray-700">{cell}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mapping Editor */}
            <div className="space-y-3 mb-6">
              <div className="grid grid-cols-3 gap-3 text-xs font-semibold text-gray-400 uppercase px-1">
                <div>Quell-Spalte</div>
                <div className="text-center">→</div>
                <div>Ziel-Feld</div>
              </div>
              {mockDetectedColumns.map((col) => (
                <div key={col} className="grid grid-cols-3 gap-3 items-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-sm font-medium text-gray-700">
                    <span className="px-2 py-0.5 bg-white rounded border border-gray-200">{col}</span>
                  </div>
                  <div className="text-center text-gray-400">→</div>
                  <select
                    value={fieldMapping[col] || ''}
                    onChange={(e) => setFieldMapping({ ...fieldMapping, [col]: e.target.value })}
                    className="px-3 py-2 rounded-lg border border-gray-300 text-sm bg-white focus:border-indigo-500 outline-none"
                  >
                    <option value="">-- Ignorieren --</option>
                    {targetFields.map(f => (
                      <option key={f.key} value={f.key}>
                        {f.label} {f.required ? '*' : ''}
                      </option>
                    ))}
                  </select>
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
                className="px-6 py-3 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition"
              >
                🤖 Weiter zur KI-Anreicherung →
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 4: AI Enrichment Config ── */}
        {currentStep === 'enrich' && !isEnriching && (
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-1">KI-Anreicherung konfigurieren</h2>
            <p className="text-sm text-gray-500 mb-6">
              Waehle welche Inhalte die KI fuer alle 347 Werke generieren soll.
            </p>

            <div className="grid grid-cols-2 gap-6">
              {/* Left: Content Types */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Beschreibungstypen</h3>
                <div className="space-y-2">
                  {enrichmentOptions.map(opt => (
                    <label key={opt.key} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 hover:bg-indigo-50 transition cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedEnrichments.includes(opt.key)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedEnrichments([...selectedEnrichments, opt.key])
                          } else {
                            setSelectedEnrichments(selectedEnrichments.filter(k => k !== opt.key))
                          }
                        }}
                        className="w-4 h-4 text-indigo-600 rounded border-gray-300"
                      />
                      <div>
                        <div className="text-sm font-medium text-gray-700">{opt.label}</div>
                        <div className="text-xs text-gray-400">{opt.desc}</div>
                      </div>
                    </label>
                  ))}
                </div>

                {/* Audio */}
                <div className="mt-4">
                  <label className="flex items-center gap-3 p-3 rounded-lg bg-amber-50 border border-amber-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={generateAudio}
                      onChange={(e) => setGenerateAudio(e.target.checked)}
                      className="w-4 h-4 text-amber-600 rounded border-gray-300"
                    />
                    <div>
                      <div className="text-sm font-medium text-amber-800">🎙 Audio-Guide generieren</div>
                      <div className="text-xs text-amber-600">TTS fuer alle ausgewaehlten Sprachen</div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Right: Languages */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Sprachen</h3>
                <div className="grid grid-cols-2 gap-2">
                  {languages.map(lang => (
                    <label key={lang.code} className="flex items-center gap-2 p-2 rounded-lg bg-gray-50 hover:bg-indigo-50 transition cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedLanguages.includes(lang.code)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedLanguages([...selectedLanguages, lang.code])
                          } else {
                            setSelectedLanguages(selectedLanguages.filter(c => c !== lang.code))
                          }
                        }}
                        className="w-4 h-4 text-indigo-600 rounded border-gray-300"
                      />
                      <span className="text-sm">{lang.flag} {lang.label}</span>
                    </label>
                  ))}
                </div>

                {/* Cost Estimate */}
                <div className="mt-6 p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
                  <h4 className="text-sm font-semibold text-indigo-800 mb-2">Geschaetzer Aufwand</h4>
                  <div className="space-y-1 text-sm text-indigo-700">
                    <div className="flex justify-between">
                      <span>Werke</span>
                      <span className="font-medium">347</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Beschreibungen</span>
                      <span className="font-medium">{selectedEnrichments.length} Typen</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Sprachen</span>
                      <span className="font-medium">{selectedLanguages.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Audio-Tracks</span>
                      <span className="font-medium">{generateAudio ? 347 * selectedLanguages.length : 0}</span>
                    </div>
                    <div className="border-t border-indigo-300 mt-2 pt-2 flex justify-between font-bold">
                      <span>KI-Generierungen total</span>
                      <span>{347 * selectedEnrichments.length * selectedLanguages.length}</span>
                    </div>
                  </div>
                  <p className="text-xs text-indigo-500 mt-2">
                    Geschaetzte Dauer: ~{Math.ceil((347 * selectedEnrichments.length * selectedLanguages.length) / 500)} Minuten
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-between mt-6">
              <button
                onClick={() => setCurrentStep('mapping')}
                className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 text-sm font-medium hover:bg-gray-200 transition"
              >
                ← Zurueck
              </button>
              <button
                onClick={startEnrichment}
                className="px-6 py-3 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition"
              >
                🤖 KI-Anreicherung starten ({347 * selectedEnrichments.length * selectedLanguages.length} Generierungen) →
              </button>
            </div>
          </div>
        )}

        {/* Enrichment Progress */}
        {currentStep === 'enrich' && isEnriching && (
          <div className="text-center py-8">
            <div className="text-5xl mb-4">🤖</div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">KI generiert Inhalte...</h2>
            <p className="text-gray-500 mb-6">
              {Math.floor(enrichProgress * 3.47)} von 347 Werken verarbeitet
            </p>
            <div className="w-96 mx-auto bg-gray-200 rounded-full h-3 mb-4">
              <div
                className="bg-indigo-600 h-3 rounded-full transition-all duration-200"
                style={{ width: `${enrichProgress}%` }}
              />
            </div>
            <div className="text-sm text-gray-400">
              {enrichProgress < 30 && 'Beschreibungen werden generiert...'}
              {enrichProgress >= 30 && enrichProgress < 60 && 'Uebersetzungen werden erstellt...'}
              {enrichProgress >= 60 && enrichProgress < 90 && 'Kategorien und Tags werden zugewiesen...'}
              {enrichProgress >= 90 && 'Qualitaetspruefung laeuft...'}
            </div>

            {/* Live Preview */}
            {enrichProgress > 10 && (
              <div className="mt-8 text-left max-w-2xl mx-auto bg-gray-50 rounded-xl border border-gray-200 p-4">
                <div className="text-xs font-semibold text-gray-400 uppercase mb-2">Live-Vorschau: GK-2024-001</div>
                <div className="text-sm font-medium text-gray-900 mb-1">Sonnenaufgang am See — Maria Huber, 1923</div>
                <div className="text-sm text-gray-600">
                  <span className="font-medium text-indigo-600">Kurzbeschreibung (DE):</span> Ein stimmungsvolles impressionistisches
                  Gemaelde, das die fluechtige Schoenheit eines Sonnenaufgangs ueber einem stillen See einfaengt.
                </div>
                {enrichProgress > 40 && (
                  <div className="text-sm text-gray-600 mt-2">
                    <span className="font-medium text-indigo-600">Brief (EN):</span> An atmospheric impressionist painting capturing
                    the fleeting beauty of a sunrise over a tranquil lake.
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── STEP 5: Review & Import ── */}
        {currentStep === 'review' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Pruefen & Importieren</h2>
                <p className="text-sm text-gray-500">
                  347 Werke mit KI-generierten Inhalten bereit zum Import
                </p>
              </div>
              <div className="flex gap-2">
                <button className="px-4 py-2 rounded-lg bg-green-100 text-green-700 text-sm font-medium hover:bg-green-200 transition">
                  ✓ Alle genehmigen
                </button>
                <button className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 text-sm font-medium hover:bg-gray-200 transition">
                  Export Preview (CSV)
                </button>
              </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-4 gap-3 mb-6">
              {[
                { label: 'Werke gesamt', value: '347', color: 'bg-blue-50 text-blue-700' },
                { label: 'KI-Qualitaet Hoch', value: '312', color: 'bg-green-50 text-green-700' },
                { label: 'Pruefung noetig', value: '28', color: 'bg-orange-50 text-orange-700' },
                { label: 'Probleme', value: '7', color: 'bg-red-50 text-red-700' },
              ].map(card => (
                <div key={card.label} className={`p-3 rounded-lg ${card.color}`}>
                  <div className="text-xl font-bold">{card.value}</div>
                  <div className="text-xs">{card.label}</div>
                </div>
              ))}
            </div>

            {/* Review Table */}
            <div className="overflow-x-auto border border-gray-200 rounded-lg">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="p-3 text-left font-medium text-gray-600 w-8">
                      <input type="checkbox" defaultChecked className="w-4 h-4 text-indigo-600 rounded" />
                    </th>
                    <th className="p-3 text-left font-medium text-gray-600">Inv.Nr.</th>
                    <th className="p-3 text-left font-medium text-gray-600">Titel</th>
                    <th className="p-3 text-left font-medium text-gray-600">Kuenstler</th>
                    <th className="p-3 text-left font-medium text-gray-600">KI-Qualitaet</th>
                    <th className="p-3 text-left font-medium text-gray-600">Sprachen</th>
                    <th className="p-3 text-left font-medium text-gray-600">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { inv: 'GK-2024-001', title: 'Sonnenaufgang am See', artist: 'Maria Huber', quality: 0.96, langs: 2, status: 'approved' },
                    { inv: 'GK-2024-002', title: 'Abstrakte Komposition Nr. 7', artist: 'Franz Berger', quality: 0.91, langs: 2, status: 'approved' },
                    { inv: 'GK-2024-003', title: 'Portraet einer jungen Frau', artist: 'Elisabeth Stern', quality: 0.88, langs: 2, status: 'approved' },
                    { inv: 'GK-2024-004', title: 'Landschaft mit Fluss', artist: 'Karl Wagner', quality: 0.72, langs: 2, status: 'review_needed' },
                    { inv: 'GK-2024-005', title: 'Stillleben mit Aepfeln', artist: 'Unbekannt', quality: 0.65, langs: 1, status: 'review_needed' },
                  ].map(item => (
                    <tr key={item.inv} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="p-3">
                        <input type="checkbox" defaultChecked className="w-4 h-4 text-indigo-600 rounded" />
                      </td>
                      <td className="p-3 font-mono text-xs text-gray-500">{item.inv}</td>
                      <td className="p-3 font-medium text-gray-900">{item.title}</td>
                      <td className="p-3 text-gray-600">{item.artist}</td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-gray-200 rounded-full h-1.5">
                            <div
                              className={`h-1.5 rounded-full ${
                                item.quality >= 0.85 ? 'bg-green-500' :
                                item.quality >= 0.7 ? 'bg-yellow-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${item.quality * 100}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-500">{Math.round(item.quality * 100)}%</span>
                        </div>
                      </td>
                      <td className="p-3">
                        <span className="text-xs text-gray-500">{item.langs}/2</span>
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          item.status === 'approved'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-orange-100 text-orange-700'
                        }`}>
                          {item.status === 'approved' ? '✓ Genehmigt' : '⚠ Pruefung'}
                        </span>
                      </td>
                    </tr>
                  ))}
                  <tr>
                    <td colSpan={7} className="p-3 text-center text-gray-400 text-sm">
                      ... und 342 weitere Eintraege
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="flex justify-between mt-6">
              <button
                onClick={() => { setCurrentStep('enrich'); setIsEnriching(false) }}
                className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 text-sm font-medium hover:bg-gray-200 transition"
              >
                ← Zurueck
              </button>
              <button className="px-8 py-3 rounded-lg bg-green-600 text-white font-bold hover:bg-green-700 transition text-lg">
                ✅ 340 Werke importieren
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
