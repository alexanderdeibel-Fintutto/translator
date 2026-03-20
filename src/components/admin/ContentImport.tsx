// Fintutto World — Content Import & Document Upload
// Upload documents (PDF, CSV, Excel) and let AI extract & generate POS/Artworks

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Upload, FileText, Globe, Loader2, Check, AlertCircle,
  Sparkles, ArrowRight, Download, Eye,
} from 'lucide-react'
import { supabase } from '@/lib/supabase'

type ImportStep = 'upload' | 'analyzing' | 'review' | 'generating' | 'done'

interface AnalysisResult {
  detected_type: string
  detected_columns: string[]
  sample_rows: Record<string, string>[]
  total_rows: number
  quality_report: {
    completeness: number
    issues: string[]
    suggestions: string[]
  }
}

interface GeneratedItem {
  title: string
  description: string
  artist?: string
  year?: string
  status: 'generated' | 'error'
}

export default function ContentImport() {
  const fileRef = useRef<HTMLInputElement>(null)
  const [step, setStep] = useState<ImportStep>('upload')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Upload state
  const [files, setFiles] = useState<File[]>([])
  const [websiteUrl, setWebsiteUrl] = useState('')
  const [museumId, setMuseumId] = useState('')
  const [museums, setMuseums] = useState<{ id: string; name: string }[]>([])
  const [importMode, setImportMode] = useState<'file' | 'url'>('file')

  // Analysis state
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null)

  // Generation state
  const [generatedItems, setGeneratedItems] = useState<GeneratedItem[]>([])
  const [importedCount, setImportedCount] = useState(0)

  // Load museums on mount
  useState(() => {
    supabase
      .from('ag_museums')
      .select('id, name')
      .eq('is_active', true)
      .order('name')
      .then(({ data }) => {
        if (data) setMuseums(data)
        if (data?.length === 1) setMuseumId(data[0].id)
      })
  })

  async function handleUpload() {
    if (importMode === 'file' && files.length === 0) {
      setError('Bitte waehle mindestens eine Datei aus')
      return
    }
    if (importMode === 'url' && !websiteUrl) {
      setError('Bitte gib eine URL ein')
      return
    }
    setError(null)
    setStep('analyzing')
    setLoading(true)

    try {
      if (importMode === 'file') {
        // Upload file to Supabase storage
        const file = files[0]
        const path = `imports/${Date.now()}_${file.name}`
        const { error: uploadErr } = await supabase.storage
          .from('artguide-media')
          .upload(path, file)

        if (uploadErr) throw uploadErr

        // Call content-extract edge function
        const { data, error: fnErr } = await supabase.functions.invoke('content-extract', {
          body: {
            action: 'analyze_file',
            file_path: path,
            file_name: file.name,
            file_type: file.type,
          },
        })

        if (fnErr) throw fnErr
        setAnalysis(data as AnalysisResult)
      } else {
        // Analyze URL
        const { data, error: fnErr } = await supabase.functions.invoke('content-extract', {
          body: {
            action: 'analyze_url',
            url: websiteUrl,
          },
        })

        if (fnErr) throw fnErr
        setAnalysis(data as AnalysisResult)
      }

      setStep('review')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Analyse fehlgeschlagen')
      setStep('upload')
    } finally {
      setLoading(false)
    }
  }

  async function handleGenerate() {
    if (!museumId) {
      setError('Bitte waehle ein Museum aus')
      return
    }
    setError(null)
    setStep('generating')
    setLoading(true)

    try {
      // Call content-enrich to generate full descriptions
      const { data, error: fnErr } = await supabase.functions.invoke('content-enrich', {
        body: {
          action: 'enrich_batch',
          museum_id: museumId,
          items: analysis?.sample_rows ?? [],
          target_languages: ['de', 'en'],
        },
      })

      if (fnErr) throw fnErr

      const enriched = (data?.items ?? []) as GeneratedItem[]
      setGeneratedItems(enriched)

      // Import into ag_artworks
      let count = 0
      for (const item of enriched) {
        if (item.status === 'generated') {
          const { error: insertErr } = await supabase.from('ag_artworks').insert({
            museum_id: museumId,
            title: { de: item.title },
            artist_name: item.artist || null,
            year_created: item.year || null,
            description_standard: { de: item.description },
            status: 'draft',
            tags: [],
          })
          if (!insertErr) count++
        }
      }

      setImportedCount(count)
      setStep('done')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Generierung fehlgeschlagen')
      setStep('review')
    } finally {
      setLoading(false)
    }
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(e.target.files ?? [])
    setFiles(selected)
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Upload className="h-6 w-6" />
          Content Import
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Lade Dokumente hoch oder verknuepfe Websites — die KI erstellt automatisch alle POS.
        </p>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-2 text-sm">
        {(['upload', 'review', 'done'] as const).map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            {i > 0 && <ArrowRight className="h-3 w-3 text-muted-foreground" />}
            <Badge variant={
              step === s || (step === 'analyzing' && s === 'upload') || (step === 'generating' && s === 'review')
                ? 'default'
                : 'outline'
            }>
              {i + 1}. {s === 'upload' ? 'Hochladen' : s === 'review' ? 'Pruefen' : 'Fertig'}
            </Badge>
          </div>
        ))}
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm flex items-center gap-2">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Museum selector (always visible) */}
      {museums.length > 0 && (
        <div className="space-y-2">
          <Label>Ziel-Museum</Label>
          <Select value={museumId} onValueChange={setMuseumId}>
            <SelectTrigger>
              <SelectValue placeholder="Museum auswaehlen..." />
            </SelectTrigger>
            <SelectContent>
              {museums.map(m => (
                <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Step 1: Upload */}
      {(step === 'upload' || step === 'analyzing') && (
        <Card className="p-6 space-y-4">
          <div className="flex gap-2">
            <Button
              variant={importMode === 'file' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setImportMode('file')}
            >
              <FileText className="h-4 w-4 mr-1" /> Datei hochladen
            </Button>
            <Button
              variant={importMode === 'url' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setImportMode('url')}
            >
              <Globe className="h-4 w-4 mr-1" /> Website verknuepfen
            </Button>
          </div>

          {importMode === 'file' ? (
            <div className="space-y-3">
              <div
                className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
                onClick={() => fileRef.current?.click()}
              >
                <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="font-medium">Dateien hierher ziehen oder klicken</p>
                <p className="text-xs text-muted-foreground mt-1">
                  PDF, CSV, Excel, JSON — max 50 MB
                </p>
                <input
                  ref={fileRef}
                  type="file"
                  className="hidden"
                  accept=".pdf,.csv,.xlsx,.xls,.json,.txt"
                  multiple
                  onChange={handleFileSelect}
                />
              </div>
              {files.length > 0 && (
                <div className="space-y-1">
                  {files.map((f, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm p-2 bg-muted rounded">
                      <FileText className="h-4 w-4" />
                      <span className="truncate">{f.name}</span>
                      <span className="text-xs text-muted-foreground ml-auto">
                        {(f.size / 1024).toFixed(0)} KB
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              <Label>Website-URL</Label>
              <Input
                value={websiteUrl}
                onChange={e => setWebsiteUrl(e.target.value)}
                placeholder="https://www.museum-website.de/sammlung"
              />
              <p className="text-xs text-muted-foreground">
                Die KI analysiert die Seite und extrahiert alle relevanten Inhalte.
              </p>
            </div>
          )}

          <div className="flex justify-end">
            <Button
              onClick={handleUpload}
              disabled={loading || (importMode === 'file' && files.length === 0) || (importMode === 'url' && !websiteUrl)}
            >
              {step === 'analyzing' ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> KI analysiert...</>
              ) : (
                <><Sparkles className="h-4 w-4 mr-2" /> Analysieren</>
              )}
            </Button>
          </div>
        </Card>
      )}

      {/* Step 2: Review Analysis */}
      {(step === 'review' || step === 'generating') && analysis && (
        <Card className="p-6 space-y-4">
          <h3 className="font-semibold flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Analyse-Ergebnis
          </h3>

          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 bg-muted rounded-lg text-center">
              <div className="text-2xl font-bold">{analysis.total_rows}</div>
              <div className="text-xs text-muted-foreground">Eintraege erkannt</div>
            </div>
            <div className="p-3 bg-muted rounded-lg text-center">
              <div className="text-2xl font-bold">{analysis.detected_columns.length}</div>
              <div className="text-xs text-muted-foreground">Felder erkannt</div>
            </div>
            <div className="p-3 bg-muted rounded-lg text-center">
              <div className="text-2xl font-bold">{analysis.quality_report.completeness}%</div>
              <div className="text-xs text-muted-foreground">Vollstaendigkeit</div>
            </div>
          </div>

          <div>
            <Label className="text-xs">Erkannte Felder</Label>
            <div className="flex flex-wrap gap-1 mt-1">
              {analysis.detected_columns.map(col => (
                <Badge key={col} variant="outline" className="text-xs">{col}</Badge>
              ))}
            </div>
          </div>

          {analysis.quality_report.issues.length > 0 && (
            <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 text-sm space-y-1">
              <p className="font-medium text-amber-700 dark:text-amber-400">Hinweise:</p>
              {analysis.quality_report.issues.map((issue, i) => (
                <p key={i} className="text-xs text-amber-600 dark:text-amber-300">• {issue}</p>
              ))}
            </div>
          )}

          {/* Preview table */}
          {analysis.sample_rows.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b">
                    {analysis.detected_columns.slice(0, 5).map(col => (
                      <th key={col} className="px-2 py-1 text-left font-medium">{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {analysis.sample_rows.slice(0, 5).map((row, i) => (
                    <tr key={i} className="border-b last:border-0">
                      {analysis.detected_columns.slice(0, 5).map(col => (
                        <td key={col} className="px-2 py-1 truncate max-w-[200px]">
                          {row[col] ?? '—'}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => { setStep('upload'); setAnalysis(null) }}>
              Zurueck
            </Button>
            <Button onClick={handleGenerate} disabled={loading || !museumId}>
              {step === 'generating' ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> KI generiert POS...</>
              ) : (
                <><Sparkles className="h-4 w-4 mr-2" /> POS auf Knopfdruck erstellen</>
              )}
            </Button>
          </div>
        </Card>
      )}

      {/* Step 3: Done */}
      {step === 'done' && (
        <Card className="p-6 space-y-4">
          <div className="text-center py-4">
            <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center mx-auto mb-3">
              <Check className="h-6 w-6 text-emerald-600" />
            </div>
            <h3 className="font-semibold text-lg">
              {importedCount} POS erfolgreich erstellt!
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Die Exponate wurden als Entwurf angelegt und koennen im Museum-Portal bearbeitet werden.
            </p>
          </div>

          {generatedItems.length > 0 && (
            <div className="max-h-60 overflow-y-auto space-y-1">
              {generatedItems.map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-sm p-2 bg-muted rounded">
                  {item.status === 'generated'
                    ? <Check className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                    : <AlertCircle className="h-4 w-4 text-destructive flex-shrink-0" />}
                  <span className="truncate">{item.title}</span>
                  {item.artist && <span className="text-xs text-muted-foreground ml-auto">{item.artist}</span>}
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => {
              setStep('upload')
              setFiles([])
              setWebsiteUrl('')
              setAnalysis(null)
              setGeneratedItems([])
            }}>
              Weiteren Import starten
            </Button>
            <Button onClick={() => window.location.href = '/admin/tours'}>
              <Route className="h-4 w-4 mr-2" />
              Fuehrungen erstellen
            </Button>
          </div>
        </Card>
      )}
    </div>
  )
}
