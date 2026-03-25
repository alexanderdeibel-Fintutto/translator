'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useMuseum, useImportJob, importActions } from '@/lib/hooks'
import type { Lang } from '@/lib/types'

type WizardStep = 'upload' | 'analyze' | 'mapping' | 'enrich' | 'review'

const steps: { key: WizardStep; label: string; icon: string }[] = [
  { key: 'upload', label: 'Hochladen', icon: '📁' },
  { key: 'analyze', label: 'KI-Analyse', icon: '🔍' },
  { key: 'mapping', label: 'Feld-Zuordnung', icon: '🔗' },
  { key: 'enrich', label: 'KI-Anreicherung', icon: '🤖' },
  { key: 'review', label: 'Prüfen & Import', icon: '✅' },
]

const targetFields = [
  { key: 'inventory_number', label: 'Inventarnummer', required: true },
  { key: 'title', label: 'Titel', required: true },
  { key: 'artist_name', label: 'Künstler', required: false },
  { key: 'year_created', label: 'Entstehungsjahr', required: false },
  { key: 'medium', label: 'Technik/Material', required: false },
  { key: 'dimensions', label: 'Maße', required: false },
  { key: 'style', label: 'Stil', required: false },
  { key: 'epoch', label: 'Epoche', required: false },
  { key: 'room', label: 'Raum/Standort', required: false },
  { key: 'origin', label: 'Herkunft', required: false },
  { key: 'description', label: 'Beschreibung', required: false },
  { key: 'image_url', label: 'Bild-URL', required: false },
]

const enrichmentOptions = [
  { key: 'description_brief', label: 'Kurzbeschreibung', desc: '1-2 Sätze', default: true },
  { key: 'description_standard', label: 'Standardbeschreibung', desc: '4-6 Sätze', default: true },
  { key: 'description_detailed', label: 'Detailbeschreibung', desc: '8-15 Sätze', default: true },
  { key: 'description_children', label: 'Kinderbeschreibung', desc: 'Für 6-12 Jahre', default: true },
  { key: 'description_youth', label: 'Jugendbeschreibung', desc: 'Für 13-17 Jahre', default: true },
  { key: 'fun_facts', label: 'Fun Facts', desc: 'Überraschende Fakten', default: true },
  { key: 'historical_context', label: 'Historischer Kontext', desc: 'Zeitgeschichte', default: true },
  { key: 'technique_details', label: 'Technik-Details', desc: 'Materialien & Arbeitsweise', default: false },
]

const availableLanguages = [
  { code: 'de' as Lang, label: 'Deutsch', flag: '🇩🇪', default: true },
  { code: 'en' as Lang, label: 'English', flag: '🇬🇧', default: true },
  { code: 'fr' as Lang, label: 'Français', flag: '🇫🇷', default: false },
  { code: 'it' as Lang, label: 'Italiano', flag: '🇮🇹', default: false },
  { code: 'es' as Lang, label: 'Español', flag: '🇪🇸', default: false },
  { code: 'nl' as Lang, label: 'Nederlands', flag: '🇳🇱', default: false },
  { code: 'pl' as Lang, label: 'Polski', flag: '🇵🇱', default: false },
  { code: 'zh' as Lang, label: '中文', flag: '🇨🇳', default: false },
  { code: 'ja' as Lang, label: '日本語', flag: '🇯🇵', default: false },
]

export default function MuseumImportPage() {
  const { museum, loading: museumLoading } = useMuseum()
  const [currentStep, setCurrentStep] = useState<WizardStep>('upload')
  const [isDragging, setIsDragging] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [jobId, setJobId] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [fieldMapping, setFieldMapping] = useState<Record<string, string>>({})
  const [selectedEnrichments, setSelectedEnrichments] = useState<string[]>(
    enrichmentOptions.filter(o => o.default).map(o => o.key)
  )
  const [selectedLanguages, setSelectedLanguages] = useState<Lang[]>(
    availableLanguages.filter(l => l.default).map(l => l.code)
  )
  const [generateAudio, setGenerateAudio] = useState(false)
  const [isEnriching, setIsEnriching] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [importResult, setImportResult] = useState<{ imported: number; errors: number } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { job, items, reload: reloadJob } = useImportJob(jobId)
  const stepIndex = steps.findIndex(s => s.key === currentStep)

  // Auto-advance based on job status
  useEffect(() => {
    if (!job) return
    if (job.status === 'analyzing') setCurrentStep('analyze')
    else if (job.status === 'mapping') {
      setCurrentStep('mapping')
      const suggestions = (job.ai_analysis as any)?.suggestions
      if (suggestions && Object.keys(fieldMapping).length === 0) setFieldMapping(suggestions)
    }
    else if (job.status === 'enriching') { setCurrentStep('enrich'); setIsEnriching(true) }
    else if (job.status === 'review') { setCurrentStep('review'); setIsEnriching(false) }
    else if (job.status === 'completed') setImportResult({ imported: job.items_imported, errors: job.items_rejected })
  }, [job?.status])

  function handleFileSelect(file: File) { setUploadedFile(file) }

  async function handleUploadAndAnalyze() {
    if (!uploadedFile || !museum) return
    setIsUploading(true); setError(null)
    try {
      const newJob = await importActions.uploadAndCreateJob({
        museumId: museum.id, file: uploadedFile, importMode: 'museum', targetType: 'artworks',
      })
      setJobId(newJob.id)
      setCurrentStep('analyze')
      await importActions.triggerAnalysis(newJob.id)
    } catch (e: any) { setError(e.message) }
    finally { setIsUploading(false) }
  }

  async function handleSaveMapping() {
    if (!jobId) return
    try { await importActions.saveMapping(jobId, fieldMapping); setCurrentStep('enrich') }
    catch (e: any) { setError(e.message) }
  }

  async function handleStartEnrichment() {
    if (!jobId) return
    setIsEnriching(true); setError(null)
    try {
      await importActions.triggerEnrichment(jobId, { languages: selectedLanguages, enrichments: selectedEnrichments, generateAudio })
    } catch (e: any) { setError(e.message); setIsEnriching(false) }
  }

  async function handleFinalImport() {
    if (!jobId) return
    setIsImporting(true); setError(null)
    try { const result = await importActions.finalizeImport(jobId); setImportResult(result) }
    catch (e: any) { setError(e.message) }
    finally { setIsImporting(false) }
  }

  if (museumLoading) return <div className="flex items-center justify-center h-64 text-gray-400">Wird geladen...</div>

  if (!museum) return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
      <h2 className="font-bold text-yellow-800 mb-2">Kein Museum gefunden</h2>
      <Link href="/dashboard/settings" className="mt-3 inline-block px-4 py-2 bg-yellow-600 text-white rounded-lg text-sm font-medium">Museum einrichten →</Link>
    </div>
  )

  return (
    <>
      <div className="flex items-center gap-3 mb-6">
        <Link href="/dashboard/import" className="p-2 rounded-lg hover:bg-gray-100 text-gray-500">←</Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">🏛 Museum / Galerie Import</h1>
          <p className="text-gray-500 text-sm mt-1">Kunstwerke aus CSV, Excel oder PDF importieren — KI generiert Beschreibungen</p>
        </div>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
          <span className="text-red-500">⚠️</span>
          <p className="text-red-700 text-sm flex-1">{error}</p>
          <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600">✕</button>
        </div>
      )}

      {importResult ? (
        <div className="bg-green-50 border border-green-200 rounded-xl p-8 text-center">
          <div className="text-5xl mb-4">🎉</div>
          <h2 className="text-2xl font-bold text-green-800 mb-2">Import abgeschlossen!</h2>
          <p className="text-green-700 mb-6"><strong>{importResult.imported}</strong> Kunstwerke importiert{importResult.errors > 0 ? `, ${importResult.errors} Fehler` : ''}</p>
          <div className="flex gap-3 justify-center">
            <Link href="/dashboard/artworks" className="px-6 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition">Kunstwerke anzeigen →</Link>
            <button onClick={() => { setImportResult(null); setJobId(null); setUploadedFile(null); setCurrentStep('upload') }} className="px-6 py-2 bg-white border border-green-300 text-green-700 rounded-lg font-medium hover:bg-green-50 transition">Neuer Import</button>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {/* Stepper */}
          <div className="border-b border-gray-200 p-5">
            <div className="flex items-center gap-1">
              {steps.map((step, idx) => (
                <div key={step.key} className="flex items-center gap-1">
                  <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${idx === stepIndex ? 'bg-indigo-100 text-indigo-700' : idx < stepIndex ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}`}>
                    <span>{idx < stepIndex ? '✓' : step.icon}</span>
                    <span className="hidden sm:inline">{step.label}</span>
                  </div>
                  {idx < steps.length - 1 && <div className={`w-6 h-0.5 ${idx < stepIndex ? 'bg-green-300' : 'bg-gray-200'}`} />}
                </div>
              ))}
            </div>
          </div>

          <div className="p-6">
            {/* STEP 1: UPLOAD */}
            {currentStep === 'upload' && (
              <div>
                <h2 className="text-lg font-bold text-gray-900 mb-4">Datei hochladen</h2>
                <div
                  onDragOver={e => { e.preventDefault(); setIsDragging(true) }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={e => { e.preventDefault(); setIsDragging(false); if (e.dataTransfer.files[0]) handleFileSelect(e.dataTransfer.files[0]) }}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition ${isDragging ? 'border-indigo-400 bg-indigo-50' : 'border-gray-300 hover:border-indigo-300 hover:bg-gray-50'}`}
                >
                  <input ref={fileInputRef} type="file" accept=".csv,.xlsx,.xls,.pdf,.json" className="hidden" onChange={e => { if (e.target.files?.[0]) handleFileSelect(e.target.files[0]) }} />
                  <div className="text-4xl mb-3">📂</div>
                  <p className="text-gray-700 font-medium">Datei hierher ziehen oder klicken</p>
                  <p className="text-gray-400 text-sm mt-1">CSV, Excel, PDF oder JSON</p>
                </div>
                {uploadedFile && (
                  <div className="mt-4 bg-indigo-50 border border-indigo-200 rounded-xl p-4 flex items-center gap-3">
                    <span className="text-2xl">📄</span>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{uploadedFile.name}</p>
                      <p className="text-sm text-gray-500">{(uploadedFile.size / 1024).toFixed(1)} KB</p>
                    </div>
                    <button onClick={e => { e.stopPropagation(); setUploadedFile(null) }} className="text-gray-400 hover:text-gray-600">✕</button>
                  </div>
                )}
                <div className="flex justify-end mt-6">
                  <button onClick={handleUploadAndAnalyze} disabled={!uploadedFile || isUploading} className="px-6 py-2.5 rounded-lg bg-indigo-900 text-white font-medium hover:bg-indigo-800 transition disabled:opacity-50 flex items-center gap-2">
                    {isUploading ? <><svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Wird hochgeladen...</> : 'Hochladen & Analysieren →'}
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: ANALYZE */}
            {currentStep === 'analyze' && (
              <div>
                <h2 className="text-lg font-bold text-gray-900 mb-4">KI-Analyse</h2>
                {job?.status === 'analyzing' || !job ? (
                  <div className="text-center py-12">
                    <div className="text-4xl mb-4">🔍</div>
                    <p className="text-gray-700 font-medium mb-2">KI analysiert deine Datei...</p>
                    <p className="text-gray-400 text-sm">Spalten werden erkannt, Datentypen geprüft</p>
                    <div className="mt-6 flex justify-center"><div className="w-48 bg-gray-200 rounded-full h-2"><div className="bg-indigo-500 h-2 rounded-full animate-pulse" style={{ width: '60%' }} /></div></div>
                    <button onClick={reloadJob} className="mt-4 text-sm text-indigo-600 hover:underline">Aktualisieren</button>
                  </div>
                ) : (
                  <div>
                    <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-4">
                      <p className="font-medium text-green-800">✓ Analyse abgeschlossen</p>
                      <p className="text-green-700 text-sm mt-1">{(job.ai_analysis as any)?.detected_items || 0} Einträge · {((job.ai_analysis as any)?.detected_columns || []).length} Spalten</p>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {((job.ai_analysis as any)?.detected_columns || []).map((col: string) => (
                        <span key={col} className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs">{col}</span>
                      ))}
                    </div>
                    <div className="flex justify-end">
                      <button onClick={() => setCurrentStep('mapping')} className="px-6 py-2.5 rounded-lg bg-indigo-900 text-white font-medium hover:bg-indigo-800 transition">Feld-Zuordnung →</button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* STEP 3: MAPPING */}
            {currentStep === 'mapping' && (
              <div>
                <h2 className="text-lg font-bold text-gray-900 mb-1">Feld-Zuordnung</h2>
                <p className="text-gray-500 text-sm mb-4">KI-Vorschlag — bitte prüfen und korrigieren.</p>
                <div className="space-y-2 mb-6">
                  {((job?.ai_analysis as any)?.detected_columns || Object.keys(fieldMapping)).map((col: string) => (
                    <div key={col} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1"><span className="font-mono text-sm bg-white border border-gray-200 px-2 py-1 rounded">{col}</span></div>
                      <div className="text-gray-400">→</div>
                      <div className="flex-1">
                        <select value={fieldMapping[col] || ''} onChange={e => setFieldMapping(prev => ({ ...prev, [col]: e.target.value }))} className="w-full px-3 py-1.5 rounded-lg border border-gray-300 text-sm focus:border-indigo-500 outline-none">
                          <option value="">— Ignorieren —</option>
                          {targetFields.map(f => <option key={f.key} value={f.key}>{f.label}{f.required ? ' *' : ''}</option>)}
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between">
                  <button onClick={() => setCurrentStep('analyze')} className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 text-sm font-medium hover:bg-gray-200 transition">← Zurück</button>
                  <button onClick={handleSaveMapping} className="px-6 py-2.5 rounded-lg bg-indigo-900 text-white font-medium hover:bg-indigo-800 transition">Mapping speichern →</button>
                </div>
              </div>
            )}

            {/* STEP 4: ENRICH */}
            {currentStep === 'enrich' && (
              <div>
                <h2 className="text-lg font-bold text-gray-900 mb-1">KI-Anreicherung</h2>
                {isEnriching || job?.status === 'enriching' ? (
                  <div className="text-center py-12">
                    <div className="text-4xl mb-4">🤖</div>
                    <p className="text-gray-700 font-medium mb-2">KI generiert Inhalte...</p>
                    <p className="text-gray-400 text-sm">{job?.items_enriched || 0} / {job?.items_total || 0} Werke</p>
                    <div className="mt-6 mx-auto max-w-xs">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-indigo-500 h-2 rounded-full transition-all" style={{ width: `${job?.items_total ? Math.round(((job.items_enriched || 0) / job.items_total) * 100) : 0}%` }} />
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="text-gray-500 text-sm mb-4">Wähle welche Inhalte die KI generieren soll.</p>
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      {enrichmentOptions.map(opt => (
                        <label key={opt.key} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-indigo-50 transition">
                          <input type="checkbox" checked={selectedEnrichments.includes(opt.key)} onChange={e => setSelectedEnrichments(prev => e.target.checked ? [...prev, opt.key] : prev.filter(k => k !== opt.key))} className="mt-0.5 w-4 h-4 text-indigo-600 rounded" />
                          <div><p className="font-medium text-gray-800 text-sm">{opt.label}</p><p className="text-gray-400 text-xs">{opt.desc}</p></div>
                        </label>
                      ))}
                    </div>
                    <div className="mb-4">
                      <h3 className="font-medium text-gray-700 mb-2 text-sm">Sprachen</h3>
                      <div className="flex flex-wrap gap-2">
                        {availableLanguages.map(lang => (
                          <button key={lang.code} onClick={() => setSelectedLanguages(prev => prev.includes(lang.code) ? (prev.length > 1 ? prev.filter(l => l !== lang.code) : prev) : [...prev, lang.code])} className={`px-3 py-1.5 rounded-full text-sm font-medium transition ${selectedLanguages.includes(lang.code) ? 'bg-indigo-100 text-indigo-700 border border-indigo-300' : 'bg-gray-100 text-gray-500 hover:border-gray-300 border border-transparent'}`}>
                            {lang.flag} {lang.label}
                          </button>
                        ))}
                      </div>
                    </div>
                    <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-indigo-50 transition mb-6">
                      <input type="checkbox" checked={generateAudio} onChange={e => setGenerateAudio(e.target.checked)} className="w-4 h-4 text-indigo-600 rounded" />
                      <div><p className="font-medium text-gray-800 text-sm">🎧 Audio-Guides generieren</p><p className="text-gray-400 text-xs">TTS-Audiodateien für alle Sprachen</p></div>
                    </label>
                    <div className="flex justify-between">
                      <button onClick={() => setCurrentStep('mapping')} className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 text-sm font-medium hover:bg-gray-200 transition">← Zurück</button>
                      <button onClick={handleStartEnrichment} className="px-6 py-2.5 rounded-lg bg-indigo-900 text-white font-medium hover:bg-indigo-800 transition">KI-Anreicherung starten →</button>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* STEP 5: REVIEW */}
            {currentStep === 'review' && (
              <div>
                <h2 className="text-lg font-bold text-gray-900 mb-1">Prüfen & Importieren</h2>
                <div className="grid grid-cols-4 gap-3 mb-6">
                  {[
                    { label: 'Gesamt', value: job?.items_total || 0, color: 'bg-gray-100 text-gray-700' },
                    { label: 'Angereichert', value: job?.items_enriched || 0, color: 'bg-blue-100 text-blue-700' },
                    { label: 'Genehmigt', value: job?.items_approved || 0, color: 'bg-green-100 text-green-700' },
                    { label: 'Zur Prüfung', value: items.filter(i => i.status === 'enriched').length, color: 'bg-orange-100 text-orange-700' },
                  ].map(card => (
                    <div key={card.label} className={`rounded-xl p-4 text-center ${card.color}`}>
                      <div className="text-2xl font-bold">{card.value}</div>
                      <div className="text-xs mt-1">{card.label}</div>
                    </div>
                  ))}
                </div>
                <div className="overflow-x-auto border border-gray-200 rounded-lg mb-6">
                  <table className="w-full text-sm">
                    <thead><tr className="bg-gray-50 border-b border-gray-200">
                      <th className="p-3 text-left font-medium text-gray-600">Inv.Nr.</th>
                      <th className="p-3 text-left font-medium text-gray-600">Titel</th>
                      <th className="p-3 text-left font-medium text-gray-600">Künstler</th>
                      <th className="p-3 text-left font-medium text-gray-600">Status</th>
                    </tr></thead>
                    <tbody>
                      {items.slice(0, 20).map(item => {
                        const mapped = item.mapped_data as any
                        return (
                          <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="p-3 font-mono text-xs text-gray-500">{mapped?.inventory_number || '—'}</td>
                            <td className="p-3 font-medium text-gray-900">{mapped?.title || '—'}</td>
                            <td className="p-3 text-gray-600">{mapped?.artist_name || '—'}</td>
                            <td className="p-3">
                              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${item.status === 'approved' ? 'bg-green-100 text-green-700' : item.status === 'enriched' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>
                                {item.status === 'approved' ? '✓ Genehmigt' : item.status === 'enriched' ? '🤖 Angereichert' : item.status}
                              </span>
                            </td>
                          </tr>
                        )
                      })}
                      {items.length > 20 && <tr><td colSpan={4} className="p-3 text-center text-gray-400 text-sm">... und {items.length - 20} weitere</td></tr>}
                    </tbody>
                  </table>
                </div>
                <div className="flex justify-between">
                  <button onClick={() => setCurrentStep('enrich')} className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 text-sm font-medium hover:bg-gray-200 transition">← Zurück</button>
                  <button onClick={handleFinalImport} disabled={isImporting} className="px-8 py-3 rounded-lg bg-green-600 text-white font-bold hover:bg-green-700 transition disabled:opacity-50 flex items-center gap-2">
                    {isImporting ? <><svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Wird importiert...</> : `✅ ${job?.items_approved || items.length} Werke importieren`}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
