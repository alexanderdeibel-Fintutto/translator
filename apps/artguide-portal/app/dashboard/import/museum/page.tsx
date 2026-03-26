'use client'
import { useState, useRef, useCallback } from 'react'
import Papa from 'papaparse'

type MappedData = Record<string, string>
type ImportItem = {
  id: string
  row_index: number
  source_data: MappedData
  mapped_data: MappedData
  status: 'pending' | 'enriching' | 'enriched' | 'error'
  enriched?: Record<string, unknown>
  error?: string
}
type ImportJob = {
  id: string
  filename: string
  total_rows: number
  column_mapping: Record<string, string | null>
  items: ImportItem[]
}

const DEMO_CSV = `Inventarnummer,Titel,Kuenstler,Jahr,Technik,Masse,Beschreibung,Raum
INV-001,Sonnenuntergang ueber dem Meer,Caspar David Friedrich,1823,Oel auf Leinwand,72 x 102 cm,Romantische Meereslandschaft mit dramatischem Abendhimmel,Saal 3
INV-002,Portraet einer Lesenden,Marie Ellenrieder,1831,Oel auf Holz,45 x 38 cm,Intimes Portraet einer jungen Frau beim Lesen,Saal 1
INV-003,Stillleben mit Blumen,Jan van Huysum,1720,Oel auf Holz,80 x 60 cm,Praechtiges Blumenstillleben im hollaendischen Stil,Saal 2
INV-004,Abstrakte Komposition,Wassily Kandinsky,1912,Aquarell auf Papier,50 x 65 cm,Fruehes abstraktes Werk mit leuchtenden Farben,Saal 4
INV-005,Bronzefigur Athena,Unbekannt,200 v. Chr.,Bronze,H: 45 cm,Kleine Votivfigur der Goettin Athena,Saal 5`

export default function ImportMuseumPage() {
  const [step, setStep] = useState<'upload' | 'mapping' | 'enriching' | 'review'>('upload')
  const [job, setJob] = useState<ImportJob | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [enrichProgress, setEnrichProgress] = useState(0)
  const [dragOver, setDragOver] = useState(false)
  const [expandedItem, setExpandedItem] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const processFile = useCallback(async (file: File | null, useDemoData = false) => {
    setIsLoading(true)
    try {
      let csvText = ''
      let filename = 'demo-import.csv'
      if (useDemoData) { csvText = DEMO_CSV }
      else if (file) { csvText = await file.text(); filename = file.name }
      else return

      const parsed = Papa.parse<Record<string, string>>(csvText, { header: true, skipEmptyLines: true })
      if (parsed.errors.length > 0 && parsed.data.length === 0) { alert('CSV konnte nicht gelesen werden'); return }

      const response = await fetch('/api/import/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rows: parsed.data, filename, museumId: 'demo-museum' }),
      })
      const result = await response.json()
      if (!result.success) { alert('Fehler: ' + result.error); return }
      setJob(result.job)
      setStep('mapping')
    } catch (err) { alert('Fehler: ' + String(err)) }
    finally { setIsLoading(false) }
  }, [])

  const startEnrichment = async () => {
    if (!job) return
    setStep('enriching')
    setEnrichProgress(0)
    const updatedItems = [...job.items]
    for (let i = 0; i < Math.min(updatedItems.length, 10); i++) {
      updatedItems[i] = { ...updatedItems[i], status: 'enriching' }
      setJob(prev => prev ? { ...prev, items: [...updatedItems] } : prev)
      try {
        const response = await fetch('/api/import/enrich', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ mappedData: updatedItems[i].mapped_data, tier: 'artguide_starter' }),
        })
        const result = await response.json()
        updatedItems[i] = result.success
          ? { ...updatedItems[i], status: 'enriched', enriched: result.enriched }
          : { ...updatedItems[i], status: 'error', error: result.error }
      } catch (err) { updatedItems[i] = { ...updatedItems[i], status: 'error', error: String(err) } }
      setEnrichProgress(Math.round(((i + 1) / Math.min(updatedItems.length, 10)) * 100))
      setJob(prev => prev ? { ...prev, items: [...updatedItems] } : prev)
    }
    setStep('review')
  }

  const statusIcon = (status: ImportItem['status']) => {
    if (status === 'pending') return <span className="text-gray-400 text-lg">⏳</span>
    if (status === 'enriching') return <span className="text-blue-500 text-lg animate-spin inline-block">⚙️</span>
    if (status === 'enriched') return <span className="text-green-500 text-lg">✅</span>
    return <span className="text-red-500 text-lg">❌</span>
  }

  const stepLabels = [
    { id: 'upload', label: '1. Datei hochladen' },
    { id: 'mapping', label: '2. Felder pruefen' },
    { id: 'enriching', label: '3. KI-Anreicherung' },
    { id: 'review', label: '4. Review & Import' },
  ]
  const stepOrder = ['upload', 'mapping', 'enriching', 'review']
  const currentIdx = stepOrder.indexOf(step)

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
            <a href="/dashboard/import" className="hover:text-indigo-600">Import-Zentrale</a>
            <span>›</span>
            <span className="text-gray-900 font-medium">Museum Import</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Museum Import</h1>
          <p className="text-gray-500 mt-1">CSV hochladen → KI reichert automatisch an → Fertige Exponate</p>
        </div>
      </div>

      {/* Steps */}
      <div className="flex items-center gap-2 mb-8 flex-wrap">
        {stepLabels.map((s, i) => (
          <div key={s.id} className="flex items-center gap-2">
            <div className={`px-4 py-2 rounded-full text-sm font-medium transition ${
              step === s.id ? 'bg-indigo-900 text-white' :
              currentIdx > i ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'
            }`}>
              {currentIdx > i ? '✓ ' : ''}{s.label}
            </div>
            {i < stepLabels.length - 1 && <span className="text-gray-300">→</span>}
          </div>
        ))}
      </div>

      {/* STEP 1: Upload */}
      {step === 'upload' && (
        <div className="max-w-2xl">
          <div
            className={`border-2 border-dashed rounded-2xl p-12 text-center transition cursor-pointer ${
              dragOver ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 hover:border-indigo-400 hover:bg-gray-50'
            }`}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) processFile(f) }}
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="text-5xl mb-4">📂</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">CSV oder Excel-Datei hier ablegen</h3>
            <p className="text-gray-500 text-sm mb-6">Beliebige Spaltenbezeichnungen – KI erkennt automatisch was was ist</p>
            <input ref={fileInputRef} type="file" accept=".csv,.xlsx,.xls" className="hidden" onChange={(e) => processFile(e.target.files?.[0] || null)} />
            <button className="px-6 py-3 rounded-xl bg-indigo-900 text-white font-medium hover:bg-indigo-800 transition" onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click() }}>
              Datei auswaehlen
            </button>
          </div>
          <div className="mt-6 bg-amber-50 rounded-xl border border-amber-200 p-5">
            <div className="flex items-start gap-3">
              <span className="text-2xl">🧪</span>
              <div className="flex-1">
                <h4 className="font-semibold text-amber-900 mb-1">Demo-Daten ausprobieren</h4>
                <p className="text-sm text-amber-700 mb-3">5 Beispiel-Kunstwerke – erlebe den kompletten Import-Prozess mit echter KI-Anreicherung.</p>
                <button onClick={() => processFile(null, true)} disabled={isLoading}
                  className="px-4 py-2 rounded-lg bg-amber-500 text-white text-sm font-medium hover:bg-amber-400 transition disabled:opacity-50">
                  {isLoading ? '⏳ Wird verarbeitet...' : '▶ Demo starten'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STEP 2: Mapping */}
      {step === 'mapping' && job && (
        <div>
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-2xl">🤖</span>
              <div>
                <h3 className="font-semibold text-gray-900">KI-Feldmapping abgeschlossen</h3>
                <p className="text-sm text-gray-500">{job.filename} — {job.total_rows} Zeilen erkannt</p>
              </div>
              <span className="ml-auto px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm font-medium">✓ Automatisch gemappt</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(job.column_mapping).map(([field, col]) => (
                <div key={field} className={`flex items-center gap-3 p-3 rounded-lg border ${col ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'}`}>
                  <span className={`w-2 h-2 rounded-full flex-shrink-0 ${col ? 'bg-green-500' : 'bg-gray-300'}`} />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-gray-500">{field}</div>
                    <div className={`text-sm font-medium truncate ${col ? 'text-gray-900' : 'text-gray-400'}`}>{col || '— nicht gefunden'}</div>
                  </div>
                  {col && job.items[0] && (
                    <span className="text-xs text-green-600 flex-shrink-0 max-w-24 truncate">{job.items[0].source_data[col]?.slice(0, 20)}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
            <h3 className="font-semibold text-gray-900 mb-4">Vorschau (erste 3 Zeilen)</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b border-gray-200">
                  {Object.values(job.column_mapping).filter(Boolean).map(col => (
                    <th key={col} className="text-left py-2 px-3 text-xs font-semibold text-gray-500 uppercase">{col}</th>
                  ))}
                </tr></thead>
                <tbody>
                  {job.items.slice(0, 3).map(item => (
                    <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                      {Object.values(job.column_mapping).filter(Boolean).map(col => (
                        <td key={col} className="py-2 px-3 text-gray-700 max-w-xs truncate">{item.source_data[col!] || '—'}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setStep('upload')} className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50 transition">← Zurueck</button>
            <button onClick={startEnrichment} className="px-6 py-3 rounded-xl bg-indigo-900 text-white font-bold hover:bg-indigo-800 transition flex items-center gap-2">
              <span>🤖</span> KI-Anreicherung starten ({job.total_rows} Exponate)
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Enriching */}
      {step === 'enriching' && job && (
        <div className="max-w-2xl">
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
            <div className="text-5xl mb-4 animate-pulse">🤖</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">KI reichert Exponate an...</h3>
            <p className="text-gray-500 mb-6">GPT-4.1 generiert zielgruppengerechte Texte, Fun Facts und Kategorien</p>
            <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
              <div className="bg-indigo-600 h-3 rounded-full transition-all duration-500" style={{ width: `${enrichProgress}%` }} />
            </div>
            <div className="text-sm text-gray-500 mb-8">{enrichProgress}% — {Math.round(enrichProgress / 100 * Math.min(job.items.length, 10))} von {Math.min(job.items.length, 10)} verarbeitet</div>
            <div className="space-y-2 text-left">
              {job.items.slice(0, Math.min(job.items.length, 10)).map(item => (
                <div key={item.id} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                  {statusIcon(item.status)}
                  <span className="text-sm text-gray-700 flex-1">{item.mapped_data.title || `Exponat ${item.row_index + 1}`}</span>
                  {item.status === 'enriched' && <span className="text-xs text-green-600">Texte generiert ✓</span>}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* STEP 4: Review */}
      {step === 'review' && job && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🎉</span>
              <div>
                <h3 className="font-semibold text-gray-900">Anreicherung abgeschlossen!</h3>
                <p className="text-sm text-gray-500">{job.items.filter(i => i.status === 'enriched').length} von {Math.min(job.items.length, 10)} Exponaten erfolgreich angereichert</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button className="px-4 py-2 rounded-lg bg-green-100 text-green-700 text-sm font-medium hover:bg-green-200 transition">✓ Alle genehmigen</button>
              <button className="px-6 py-3 rounded-xl bg-indigo-900 text-white font-bold hover:bg-indigo-800 transition">
                📥 {job.items.filter(i => i.status === 'enriched').length} Exponate importieren
              </button>
            </div>
          </div>
          <div className="space-y-3">
            {job.items.slice(0, 10).map(item => (
              <div key={item.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="flex items-center gap-4 p-4 cursor-pointer hover:bg-gray-50 transition" onClick={() => setExpandedItem(expandedItem === item.id ? null : item.id)}>
                  {statusIcon(item.status)}
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 truncate">
                      {item.enriched ? String(item.enriched.title_de || item.mapped_data.title || 'Unbekannt') : (item.mapped_data.title || `Zeile ${item.row_index + 1}`)}
                    </div>
                    <div className="text-sm text-gray-500 truncate">{item.mapped_data.artist_name || '—'} · {item.mapped_data.year_created || '—'}</div>
                  </div>
                  {item.enriched && (
                    <span className="px-2 py-1 rounded-full bg-indigo-100 text-indigo-700 text-xs font-medium flex-shrink-0">{String(item.enriched.category || 'painting')}</span>
                  )}
                  <span className="text-gray-400 text-sm">{expandedItem === item.id ? '▲' : '▼'}</span>
                </div>
                {expandedItem === item.id && item.enriched && (
                  <div className="border-t border-gray-100 p-4 bg-gray-50">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Generierte Texte</h4>
                        <div className="space-y-3">
                          {[
                            { key: 'description_brief', label: 'Kurzbeschreibung', color: 'text-indigo-600' },
                            { key: 'description_standard', label: 'Standard (Besucher)', color: 'text-indigo-600' },
                            { key: 'description_children', label: 'Kinder (6-12)', color: 'text-green-600' },
                          ].map(({ key, label, color }) => item.enriched?.[key] ? (
                            <div key={key}>
                              <div className={`text-xs font-medium ${color} mb-1`}>{label}</div>
                              <p className="text-sm text-gray-700 bg-white p-2 rounded border border-gray-200">{String(item.enriched[key])}</p>
                            </div>
                          ) : null)}
                        </div>
                      </div>
                      <div>
                        <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Fun Facts & Tags</h4>
                        {Array.isArray(item.enriched.fun_facts) && (
                          <div className="mb-3 space-y-2">
                            {(item.enriched.fun_facts as string[]).map((fact, i) => (
                              <div key={i} className="flex items-start gap-2">
                                <span className="text-amber-500 flex-shrink-0">💡</span>
                                <p className="text-sm text-gray-700">{fact}</p>
                              </div>
                            ))}
                          </div>
                        )}
                        {Array.isArray(item.enriched.suggested_tags) && (
                          <div className="flex flex-wrap gap-1 mb-4">
                            {(item.enriched.suggested_tags as string[]).map(tag => (
                              <span key={tag} className="px-2 py-0.5 rounded-full bg-gray-200 text-gray-700 text-xs">{tag}</span>
                            ))}
                          </div>
                        )}
                        <div className="flex gap-2 mt-4">
                          <button className="flex-1 px-3 py-2 rounded-lg bg-green-100 text-green-700 text-sm font-medium hover:bg-green-200 transition">✓ Genehmigen</button>
                          <button className="px-3 py-2 rounded-lg bg-purple-100 text-purple-700 text-sm font-medium hover:bg-purple-200 transition">🔄 Neu</button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  )
}
