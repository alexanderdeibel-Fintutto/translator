// Fintutto World — Import Preview Assistant
// Tabellarische Vorschau nach File-Upload: Zeigt extrahierte Daten,
// erlaubt Mapping-Anpassung, Zeilen an/abwaehlen, Duplikat-Markierung

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  Upload, FileText, Loader2, Check, X, AlertTriangle,
  ChevronRight, Download, Eye, Trash2, ArrowRight, Table2,
} from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface ExtractedRow {
  idx: number
  data: Record<string, string>
  selected: boolean
  isDuplicate: boolean
  duplicateOf?: string
  quality: number  // 0-1
}

interface ColumnMapping {
  sourceColumn: string
  targetField: string
  confidence: number
  sampleValues: string[]
}

const TARGET_FIELDS = [
  { id: 'skip', label: '— Ueberspringen —' },
  { id: 'name', label: 'Name / Titel' },
  { id: 'artist', label: 'Kuenstler' },
  { id: 'year', label: 'Entstehungsjahr' },
  { id: 'medium', label: 'Material / Technik' },
  { id: 'style', label: 'Stil / Epoche' },
  { id: 'inventory_number', label: 'Inventarnummer' },
  { id: 'description', label: 'Beschreibung' },
  { id: 'short_description', label: 'Kurzbeschreibung' },
  { id: 'tags', label: 'Tags / Schlagwoerter' },
  { id: 'lat', label: 'Breitengrad' },
  { id: 'lng', label: 'Laengengrad' },
  { id: 'address', label: 'Adresse' },
  { id: 'category', label: 'Kategorie' },
  { id: 'image_url', label: 'Bild-URL' },
  { id: 'website', label: 'Website' },
  { id: 'phone', label: 'Telefon' },
  { id: 'email', label: 'E-Mail' },
]

type ImportStep = 'upload' | 'preview' | 'mapping' | 'review' | 'importing' | 'done'

interface ImportPreviewProps {
  museumId?: string
  museumName?: string
  onComplete?: (count: number) => void
}

export default function ImportPreview({ museumId, museumName, onComplete }: ImportPreviewProps) {
  const [step, setStep] = useState<ImportStep>('upload')
  const [file, setFile] = useState<File | null>(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [rows, setRows] = useState<ExtractedRow[]>([])
  const [columns, setColumns] = useState<string[]>([])
  const [mappings, setMappings] = useState<ColumnMapping[]>([])
  const [importing, setImporting] = useState(false)
  const [importResult, setImportResult] = useState<{ success: number; failed: number } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0]
    if (selected) {
      setFile(selected)
      setError(null)
      analyzeFile(selected)
    }
  }

  async function analyzeFile(f: File) {
    setAnalyzing(true)
    setStep('preview')

    try {
      // Read file content
      const text = await f.text()
      const isJson = f.name.endsWith('.json')
      const isCsv = f.name.endsWith('.csv') || f.name.endsWith('.tsv')

      let parsedRows: Record<string, string>[] = []
      let detectedColumns: string[] = []

      if (isJson) {
        const jsonData = JSON.parse(text)
        const arr = Array.isArray(jsonData) ? jsonData : jsonData.items || jsonData.data || [jsonData]
        parsedRows = arr.map((item: Record<string, unknown>) => {
          const flat: Record<string, string> = {}
          for (const [k, v] of Object.entries(item)) {
            flat[k] = typeof v === 'object' ? JSON.stringify(v) : String(v ?? '')
          }
          return flat
        })
        detectedColumns = parsedRows.length > 0 ? Object.keys(parsedRows[0]) : []
      } else if (isCsv) {
        const lines = text.split('\n').filter(l => l.trim())
        if (lines.length < 2) throw new Error('CSV hat weniger als 2 Zeilen')

        const delimiter = text.includes('\t') ? '\t' : text.includes(';') ? ';' : ','
        detectedColumns = lines[0].split(delimiter).map(c => c.replace(/^"|"$/g, '').trim())

        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(delimiter).map(v => v.replace(/^"|"$/g, '').trim())
          const row: Record<string, string> = {}
          detectedColumns.forEach((col, ci) => { row[col] = values[ci] || '' })
          parsedRows.push(row)
        }
      } else {
        // For other files, use content-extract Edge Function
        const { data, error: fnError } = await supabase.functions.invoke('content-extract', {
          body: {
            action: 'analyze_text',
            text: text.slice(0, 50000), // limit
            filename: f.name,
          },
        })
        if (fnError) throw fnError
        parsedRows = data?.rows || []
        detectedColumns = data?.columns || (parsedRows.length > 0 ? Object.keys(parsedRows[0]) : [])
      }

      setColumns(detectedColumns)

      // Check for duplicates against existing content
      const names = parsedRows.map(r => r.name || r.Name || r.title || r.Title || r.Titel || '').filter(Boolean)
      let existingNames = new Set<string>()
      if (names.length > 0 && museumId) {
        const { data: existing } = await supabase
          .from('ag_artworks')
          .select('title')
          .eq('museum_id', museumId)
        if (existing) {
          existingNames = new Set(existing.map((e: { title: Record<string, string> }) =>
            (e.title?.de || '').toLowerCase()
          ))
        }
      }

      // Build extracted rows with quality scores
      const extractedRows: ExtractedRow[] = parsedRows.map((data, idx) => {
        const nameVal = data.name || data.Name || data.title || data.Title || data.Titel || ''
        const isDuplicate = existingNames.has(nameVal.toLowerCase())
        const filledCount = Object.values(data).filter(v => v && v.trim()).length
        const quality = detectedColumns.length > 0 ? filledCount / detectedColumns.length : 0

        return { idx, data, selected: !isDuplicate, isDuplicate, quality }
      })

      setRows(extractedRows)

      // Auto-suggest mappings
      const autoMappings: ColumnMapping[] = detectedColumns.map(col => {
        const lower = col.toLowerCase()
        let target = 'skip'
        let confidence = 0

        const fieldMap: Record<string, string[]> = {
          name: ['name', 'titel', 'title', 'bezeichnung', 'werk', 'artwork'],
          artist: ['kuenstler', 'artist', 'autor', 'creator', 'urheber'],
          year: ['jahr', 'year', 'date', 'datum', 'entstehung'],
          medium: ['material', 'medium', 'technik', 'technique'],
          style: ['stil', 'style', 'epoche', 'epoch', 'era'],
          inventory_number: ['inventar', 'inventory', 'inv', 'nummer', 'number', 'id'],
          description: ['beschreibung', 'description', 'text', 'inhalt', 'content'],
          short_description: ['kurz', 'short', 'abstract', 'zusammenfassung'],
          tags: ['tags', 'schlagwort', 'keywords', 'kategorie'],
          lat: ['lat', 'latitude', 'breitengrad'],
          lng: ['lng', 'lon', 'longitude', 'laengengrad'],
          address: ['adresse', 'address', 'strasse', 'street', 'ort', 'location'],
          image_url: ['bild', 'image', 'foto', 'photo', 'url', 'abbildung'],
        }

        for (const [field, keywords] of Object.entries(fieldMap)) {
          for (const kw of keywords) {
            if (lower.includes(kw)) {
              target = field
              confidence = lower === kw ? 1 : 0.7
              break
            }
          }
          if (target !== 'skip') break
        }

        return {
          sourceColumn: col,
          targetField: target,
          confidence,
          sampleValues: extractedRows.slice(0, 3).map(r => r.data[col] || '').filter(Boolean),
        }
      })

      setMappings(autoMappings)
      setStep('mapping')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analyse fehlgeschlagen')
      setStep('upload')
    } finally {
      setAnalyzing(false)
    }
  }

  function updateMapping(sourceColumn: string, targetField: string) {
    setMappings(prev => prev.map(m =>
      m.sourceColumn === sourceColumn ? { ...m, targetField, confidence: 1 } : m
    ))
  }

  async function handleImport() {
    setImporting(true)
    setStep('importing')

    const selectedRows = rows.filter(r => r.selected)
    let success = 0
    let failed = 0

    for (const row of selectedRows) {
      try {
        // Build mapped data
        const mapped: Record<string, string> = {}
        for (const m of mappings) {
          if (m.targetField !== 'skip') {
            mapped[m.targetField] = row.data[m.sourceColumn] || ''
          }
        }

        if (museumId) {
          // Import as artwork
          await supabase.from('ag_artworks').insert({
            museum_id: museumId,
            title: { de: mapped.name || '' },
            artist: mapped.artist || null,
            year: mapped.year || null,
            medium: mapped.medium || null,
            style: mapped.style || null,
            inventory_number: mapped.inventory_number || null,
            description_standard: { de: mapped.description || '' },
            description_brief: { de: mapped.short_description || '' },
            tags: mapped.tags ? mapped.tags.split(/[,;]/).map(t => t.trim()).filter(Boolean) : [],
            status: 'draft',
          })
        } else {
          // Import as content item
          await supabase.from('fw_content_items').insert({
            content_type: 'landmark',
            domain: 'cityguide',
            name: { de: mapped.name || '' },
            slug: (mapped.name || '').toLowerCase().replace(/[^a-z0-9]+/g, '-'),
            description: { de: mapped.description || '' },
            short_description: { de: mapped.short_description || '' },
            lat: mapped.lat ? parseFloat(mapped.lat) : null,
            lng: mapped.lng ? parseFloat(mapped.lng) : null,
            tags: mapped.tags ? mapped.tags.split(/[,;]/).map(t => t.trim()).filter(Boolean) : [],
            status: 'draft',
          })
        }
        success++
      } catch {
        failed++
      }
    }

    setImportResult({ success, failed })
    setImporting(false)
    setStep('done')
    onComplete?.(success)
  }

  const selectedCount = rows.filter(r => r.selected).length
  const duplicateCount = rows.filter(r => r.isDuplicate).length
  const mappedFieldCount = mappings.filter(m => m.targetField !== 'skip').length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Upload className="h-6 w-6" />
          Import-Assistent
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Datei hochladen → Vorschau pruefen → Felder zuordnen → Importieren.
          {museumName && <span className="font-medium"> Ziel: {museumName}</span>}
        </p>
      </div>

      {/* Steps indicator */}
      <div className="flex items-center gap-2 text-sm">
        {(['upload', 'mapping', 'review', 'done'] as const).map((s, i) => {
          const labels = { upload: 'Hochladen', mapping: 'Zuordnung', review: 'Pruefen', done: 'Fertig' }
          const isCurrent = step === s || (step === 'preview' && s === 'upload') || (step === 'importing' && s === 'review')
          const isPast = ['upload', 'preview'].includes(step) ? false :
            i < ['upload', 'mapping', 'review', 'done'].indexOf(step === 'importing' ? 'review' : step)

          return (
            <div key={s} className="flex items-center gap-2">
              {i > 0 && <ChevronRight className="h-4 w-4 text-muted-foreground" />}
              <span className={`px-2 py-0.5 rounded ${
                isCurrent ? 'bg-primary text-primary-foreground font-medium' :
                isPast ? 'bg-green-100 text-green-700' : 'text-muted-foreground'
              }`}>
                {labels[s]}
              </span>
            </div>
          )
        })}
      </div>

      {/* Step: Upload */}
      {step === 'upload' && (
        <Card
          className="p-12 text-center border-dashed border-2 hover:border-primary/50 transition cursor-pointer"
          onClick={() => fileRef.current?.click()}
        >
          <input
            ref={fileRef}
            type="file"
            accept=".csv,.tsv,.json,.xlsx,.pdf"
            onChange={handleFileSelect}
            className="hidden"
          />
          <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-semibold text-lg">Datei hochladen</h3>
          <p className="text-sm text-muted-foreground mt-2">
            CSV, TSV, JSON, Excel oder PDF — Drag & Drop oder klicken.
          </p>
          {error && <p className="text-sm text-red-500 mt-3">{error}</p>}
        </Card>
      )}

      {/* Step: Analyzing */}
      {step === 'preview' && analyzing && (
        <Card className="p-12 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <h3 className="font-semibold">Analysiere {file?.name}...</h3>
          <p className="text-sm text-muted-foreground mt-2">Erkennung von Spalten und Datenstruktur</p>
        </Card>
      )}

      {/* Step: Mapping */}
      {step === 'mapping' && (
        <>
          {/* Summary */}
          <div className="flex items-center gap-4 text-sm">
            <Badge variant="secondary">{rows.length} Zeilen erkannt</Badge>
            <Badge variant="secondary">{columns.length} Spalten</Badge>
            {duplicateCount > 0 && (
              <Badge variant="destructive">{duplicateCount} Duplikate</Badge>
            )}
            <Badge variant="outline">{mappedFieldCount} zugeordnet</Badge>
          </div>

          {/* Column Mapping Table */}
          <Card className="overflow-hidden">
            <div className="p-3 border-b bg-muted/30">
              <h3 className="font-semibold text-sm flex items-center gap-2">
                <Table2 className="h-4 w-4" />
                Feld-Zuordnung
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                Jede Spalte aus deiner Datei einem Zielfeld zuordnen. KI-Vorschlaege sind vorausgefuellt.
              </p>
            </div>
            <div className="divide-y">
              {mappings.map(m => (
                <div key={m.sourceColumn} className="flex items-center gap-3 p-3">
                  {/* Source column */}
                  <div className="w-1/3 min-w-0">
                    <div className="font-medium text-sm truncate">{m.sourceColumn}</div>
                    <div className="text-[10px] text-muted-foreground truncate">
                      {m.sampleValues.slice(0, 2).join(' | ') || 'keine Werte'}
                    </div>
                  </div>

                  <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />

                  {/* Target field selector */}
                  <div className="w-1/3">
                    <Select value={m.targetField} onValueChange={v => updateMapping(m.sourceColumn, v)}>
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {TARGET_FIELDS.map(f => (
                          <SelectItem key={f.id} value={f.id}>{f.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Confidence */}
                  <div className="w-16 text-right">
                    {m.confidence >= 0.7 ? (
                      <Badge variant="default" className="text-[10px] bg-green-600">KI</Badge>
                    ) : m.targetField !== 'skip' ? (
                      <Badge variant="outline" className="text-[10px]">Manuell</Badge>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Data Preview (first 5 rows) */}
          <Card className="overflow-hidden">
            <div className="p-3 border-b bg-muted/30">
              <h3 className="font-semibold text-sm flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Vorschau (erste 5 Zeilen)
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-muted/30">
                    <th className="px-2 py-1.5 text-left w-8">#</th>
                    {mappings.filter(m => m.targetField !== 'skip').map(m => (
                      <th key={m.sourceColumn} className="px-2 py-1.5 text-left font-medium">
                        {TARGET_FIELDS.find(f => f.id === m.targetField)?.label || m.targetField}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {rows.slice(0, 5).map(row => (
                    <tr key={row.idx} className={row.isDuplicate ? 'bg-amber-50' : ''}>
                      <td className="px-2 py-1.5 text-muted-foreground">{row.idx + 1}</td>
                      {mappings.filter(m => m.targetField !== 'skip').map(m => (
                        <td key={m.sourceColumn} className="px-2 py-1.5 truncate max-w-[200px]">
                          {row.data[m.sourceColumn] || '—'}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Row Selection */}
          <div className="flex items-center justify-between">
            <div className="text-sm">
              <span className="font-medium">{selectedCount}</span> von {rows.length} Zeilen ausgewaehlt
              {duplicateCount > 0 && (
                <span className="text-amber-600 ml-2">({duplicateCount} Duplikate ausgeschlossen)</span>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => { setStep('upload'); setFile(null); setRows([]) }}>
                Abbrechen
              </Button>
              <Button onClick={() => setStep('review')} disabled={selectedCount === 0}>
                Weiter zur Pruefung <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        </>
      )}

      {/* Step: Review */}
      {step === 'review' && (
        <Card className="p-6 space-y-4">
          <h3 className="font-semibold text-lg">Import bestaetigen</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Datei:</span>
              <span className="ml-2 font-medium">{file?.name}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Zeilen:</span>
              <span className="ml-2 font-medium">{selectedCount} von {rows.length}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Zugeordnete Felder:</span>
              <span className="ml-2 font-medium">{mappedFieldCount}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Ziel:</span>
              <span className="ml-2 font-medium">{museumName || 'Content Items'}</span>
            </div>
          </div>

          {duplicateCount > 0 && (
            <div className="flex items-center gap-2 text-sm text-amber-600 bg-amber-50 p-3 rounded-md">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              {duplicateCount} moegliche Duplikate wurden automatisch abgewaehlt.
            </div>
          )}

          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setStep('mapping')}>Zurueck</Button>
            <Button onClick={handleImport}>
              {selectedCount} Eintraege importieren
            </Button>
          </div>
        </Card>
      )}

      {/* Step: Importing */}
      {step === 'importing' && (
        <Card className="p-12 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <h3 className="font-semibold">Importiere {selectedCount} Eintraege...</h3>
        </Card>
      )}

      {/* Step: Done */}
      {step === 'done' && importResult && (
        <Card className="p-8 text-center space-y-4">
          <Check className="h-12 w-12 text-green-500 mx-auto" />
          <h3 className="font-semibold text-lg">Import abgeschlossen</h3>
          <div className="flex justify-center gap-4">
            <Badge variant="default" className="bg-green-600 text-sm px-3 py-1">
              {importResult.success} erfolgreich
            </Badge>
            {importResult.failed > 0 && (
              <Badge variant="destructive" className="text-sm px-3 py-1">
                {importResult.failed} fehlgeschlagen
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            Alle importierten Eintraege haben den Status "Entwurf" und koennen im Content-Manager bearbeitet werden.
          </p>
          <Button variant="outline" onClick={() => { setStep('upload'); setFile(null); setRows([]); setImportResult(null) }}>
            Weiteren Import starten
          </Button>
        </Card>
      )}
    </div>
  )
}
