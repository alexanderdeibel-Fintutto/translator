// Fintutto World — Content Validation Dashboard
// Ampel-System: Zeigt Vollstaendigkeit aller Inhalte auf einen Blick
// Rot = fehlt, Gelb = unvollstaendig, Gruen = bereit

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  CheckCircle2, AlertTriangle, XCircle, Search, Filter,
  Loader2, BarChart3, Globe, Image, Headphones, FileText,
  ChevronDown, ChevronUp, ArrowUpDown,
} from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface ValidationItem {
  id: string
  name: Record<string, string>
  content_type: string
  status: string
  parent_name: string | null
  cover_image_url: string | null
  // Completeness scores (0-1)
  score_texts: number      // How many content fields filled (DE)
  score_translations: number // How many languages have content
  score_media: number       // Has cover image + gallery
  score_audio: number       // Has audio in any language
  score_overall: number     // Weighted average
  // Details
  missing_fields: string[]
  missing_languages: string[]
  has_cover: boolean
  has_audio: boolean
  lang_count: number
  field_count: number
}

type SortBy = 'score_asc' | 'score_desc' | 'name' | 'type'
type ScoreFilter = 'all' | 'red' | 'yellow' | 'green'

const REQUIRED_LANGS = ['de', 'en']
const CONTENT_FIELD_KEYS = [
  'content_brief', 'content_standard', 'content_detailed',
  'content_children', 'content_youth', 'content_fun_facts',
  'content_historical', 'content_technique',
]
const CONTENT_FIELD_LABELS: Record<string, string> = {
  content_brief: 'Kurzbeschreibung',
  content_standard: 'Standardbeschreibung',
  content_detailed: 'Detailliert',
  content_children: 'Kinderbeschreibung',
  content_youth: 'Jugendbeschreibung',
  content_fun_facts: 'Fun Facts',
  content_historical: 'Historischer Kontext',
  content_technique: 'Technik-Details',
}

function getScoreColor(score: number): string {
  if (score >= 0.8) return 'text-green-600'
  if (score >= 0.4) return 'text-amber-500'
  return 'text-red-500'
}

function getScoreBg(score: number): string {
  if (score >= 0.8) return 'bg-green-500'
  if (score >= 0.4) return 'bg-amber-500'
  return 'bg-red-400'
}

function getScoreIcon(score: number) {
  if (score >= 0.8) return CheckCircle2
  if (score >= 0.4) return AlertTriangle
  return XCircle
}

function getScoreLabel(score: number): string {
  if (score >= 0.8) return 'Bereit'
  if (score >= 0.4) return 'Unvollstaendig'
  return 'Fehlt'
}

export default function ContentValidation() {
  const [items, setItems] = useState<ValidationItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [parentFilter, setParentFilter] = useState('all')
  const [scoreFilter, setScoreFilter] = useState<ScoreFilter>('all')
  const [sortBy, setSortBy] = useState<SortBy>('score_asc')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [parents, setParents] = useState<{ id: string; name: string }[]>([])

  useEffect(() => { loadData() }, [])

  async function loadData() {
    setLoading(true)

    // Load parents
    const { data: museums } = await supabase
      .from('ag_museums')
      .select('id, name')
      .eq('is_active', true)
      .order('name')
    setParents((museums || []).map(m => ({ id: m.id, name: m.name })))

    // Load all content items with their fields
    const { data: rawItems } = await supabase
      .from('fw_content_items')
      .select('id, name, content_type, status, parent_name, cover_image_url, content_brief, content_standard, content_detailed, content_children, content_youth, content_fun_facts, content_historical, content_technique, audio_url, parent_id')
      .order('created_at', { ascending: false })
      .limit(500)

    if (rawItems) {
      const validated = rawItems.map((item: Record<string, unknown>) => analyzeItem(item))
      setItems(validated)
    }

    setLoading(false)
  }

  function analyzeItem(item: Record<string, unknown>): ValidationItem {
    const name = (item.name as Record<string, string>) || {}
    const missingFields: string[] = []
    const missingLanguages: string[] = []

    // Check content fields (DE primary)
    let filledFields = 0
    for (const key of CONTENT_FIELD_KEYS) {
      const fieldData = (item[key] as Record<string, string>) || {}
      if (fieldData.de && fieldData.de.trim().length > 5) {
        filledFields++
      } else {
        missingFields.push(CONTENT_FIELD_LABELS[key] || key)
      }
    }
    const scoreTexts = filledFields / CONTENT_FIELD_KEYS.length

    // Check translations
    let langCount = 0
    for (const lang of REQUIRED_LANGS) {
      const briefText = ((item.content_standard as Record<string, string>) || {})[lang]
      if (briefText && briefText.trim().length > 5) langCount++
      else missingLanguages.push(lang.toUpperCase())
    }
    const scoreTranslations = langCount / REQUIRED_LANGS.length

    // Check media
    const hasCover = !!(item.cover_image_url)
    const scoreMedia = hasCover ? 1 : 0

    // Check audio
    const audioUrl = item.audio_url as Record<string, string> | null
    const hasAudio = audioUrl ? Object.keys(audioUrl).length > 0 : false
    const scoreAudio = hasAudio ? 1 : 0

    // Overall weighted: texts 40%, translations 30%, media 20%, audio 10%
    const scoreOverall = scoreTexts * 0.4 + scoreTranslations * 0.3 + scoreMedia * 0.2 + scoreAudio * 0.1

    return {
      id: item.id as string,
      name,
      content_type: item.content_type as string,
      status: item.status as string,
      parent_name: item.parent_name as string | null,
      cover_image_url: item.cover_image_url as string | null,
      score_texts: scoreTexts,
      score_translations: scoreTranslations,
      score_media: scoreMedia,
      score_audio: scoreAudio,
      score_overall: scoreOverall,
      missing_fields: missingFields,
      missing_languages: missingLanguages,
      has_cover: hasCover,
      has_audio: hasAudio,
      lang_count: langCount,
      field_count: filledFields,
    }
  }

  // Filter and sort
  let filtered = items
  if (search) {
    const q = search.toLowerCase()
    filtered = filtered.filter(i => (i.name.de || i.name.en || '').toLowerCase().includes(q))
  }
  if (parentFilter !== 'all') {
    filtered = filtered.filter(i => i.parent_name === parentFilter)
  }
  if (scoreFilter === 'red') filtered = filtered.filter(i => i.score_overall < 0.4)
  else if (scoreFilter === 'yellow') filtered = filtered.filter(i => i.score_overall >= 0.4 && i.score_overall < 0.8)
  else if (scoreFilter === 'green') filtered = filtered.filter(i => i.score_overall >= 0.8)

  if (sortBy === 'score_asc') filtered.sort((a, b) => a.score_overall - b.score_overall)
  else if (sortBy === 'score_desc') filtered.sort((a, b) => b.score_overall - a.score_overall)
  else if (sortBy === 'name') filtered.sort((a, b) => (a.name.de || '').localeCompare(b.name.de || ''))
  else if (sortBy === 'type') filtered.sort((a, b) => a.content_type.localeCompare(b.content_type))

  // Summary stats
  const totalRed = items.filter(i => i.score_overall < 0.4).length
  const totalYellow = items.filter(i => i.score_overall >= 0.4 && i.score_overall < 0.8).length
  const totalGreen = items.filter(i => i.score_overall >= 0.8).length
  const avgScore = items.length > 0 ? items.reduce((s, i) => s + i.score_overall, 0) / items.length : 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <BarChart3 className="h-6 w-6" />
          Inhalts-Qualitaet
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Vollstaendigkeit aller Inhalte auf einen Blick. Rot = fehlt, Gelb = unvollstaendig, Gruen = bereit.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="p-4 text-center cursor-pointer hover:shadow-md transition" onClick={() => setScoreFilter('red')}>
          <XCircle className="h-6 w-6 mx-auto mb-1 text-red-500" />
          <div className="text-2xl font-bold text-red-600">{totalRed}</div>
          <div className="text-xs text-muted-foreground">Fehlt</div>
        </Card>
        <Card className="p-4 text-center cursor-pointer hover:shadow-md transition" onClick={() => setScoreFilter('yellow')}>
          <AlertTriangle className="h-6 w-6 mx-auto mb-1 text-amber-500" />
          <div className="text-2xl font-bold text-amber-600">{totalYellow}</div>
          <div className="text-xs text-muted-foreground">Unvollstaendig</div>
        </Card>
        <Card className="p-4 text-center cursor-pointer hover:shadow-md transition" onClick={() => setScoreFilter('green')}>
          <CheckCircle2 className="h-6 w-6 mx-auto mb-1 text-green-500" />
          <div className="text-2xl font-bold text-green-600">{totalGreen}</div>
          <div className="text-xs text-muted-foreground">Bereit</div>
        </Card>
        <Card className="p-4 text-center cursor-pointer hover:shadow-md transition" onClick={() => setScoreFilter('all')}>
          <BarChart3 className="h-6 w-6 mx-auto mb-1 text-primary" />
          <div className="text-2xl font-bold">{Math.round(avgScore * 100)}%</div>
          <div className="text-xs text-muted-foreground">Durchschnitt</div>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-3 items-end flex-wrap">
        <div className="flex-1 min-w-[200px] space-y-1">
          <Label className="text-xs">Suche</Label>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Name suchen..."
              className="pl-9"
            />
          </div>
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Organisation</Label>
          <Select value={parentFilter} onValueChange={setParentFilter}>
            <SelectTrigger className="w-44">
              <SelectValue placeholder="Alle" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle</SelectItem>
              {parents.map(p => (
                <SelectItem key={p.id} value={p.name}>{p.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Sortierung</Label>
          <Select value={sortBy} onValueChange={v => setSortBy(v as SortBy)}>
            <SelectTrigger className="w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="score_asc">Schlechteste zuerst</SelectItem>
              <SelectItem value="score_desc">Beste zuerst</SelectItem>
              <SelectItem value="name">Name A-Z</SelectItem>
              <SelectItem value="type">Typ</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {scoreFilter !== 'all' && (
          <Button variant="ghost" size="sm" onClick={() => setScoreFilter('all')}>
            Filter zuruecksetzen
          </Button>
        )}
      </div>

      {/* Items List */}
      {loading ? (
        <div className="text-center py-12">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
        </div>
      ) : filtered.length === 0 ? (
        <Card className="p-12 text-center">
          <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-4" />
          <h3 className="font-semibold text-lg">Keine Ergebnisse</h3>
          <p className="text-sm text-muted-foreground">
            {scoreFilter !== 'all' ? 'Keine Inhalte in dieser Kategorie.' : 'Keine Inhalte gefunden.'}
          </p>
        </Card>
      ) : (
        <div className="space-y-2">
          <div className="text-xs text-muted-foreground">{filtered.length} Inhalte</div>
          {filtered.map(item => {
            const isExpanded = expandedId === item.id
            const Icon = getScoreIcon(item.score_overall)

            return (
              <Card key={item.id} className="overflow-hidden">
                <button
                  onClick={() => setExpandedId(isExpanded ? null : item.id)}
                  className="w-full flex items-center gap-3 p-3 hover:bg-muted/30 transition text-left"
                >
                  {/* Score indicator */}
                  <Icon className={`h-5 w-5 shrink-0 ${getScoreColor(item.score_overall)}`} />

                  {/* Name & Type */}
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">
                      {item.name.de || item.name.en || 'Ohne Name'}
                    </div>
                    <div className="text-xs text-muted-foreground flex gap-2">
                      <span>{item.content_type}</span>
                      {item.parent_name && <span>· {item.parent_name}</span>}
                    </div>
                  </div>

                  {/* Mini scores */}
                  <div className="hidden md:flex items-center gap-3">
                    <div className="flex items-center gap-1" title="Texte">
                      <FileText className={`h-3.5 w-3.5 ${getScoreColor(item.score_texts)}`} />
                      <span className={`text-xs font-mono ${getScoreColor(item.score_texts)}`}>
                        {item.field_count}/8
                      </span>
                    </div>
                    <div className="flex items-center gap-1" title="Sprachen">
                      <Globe className={`h-3.5 w-3.5 ${getScoreColor(item.score_translations)}`} />
                      <span className={`text-xs font-mono ${getScoreColor(item.score_translations)}`}>
                        {item.lang_count}/{REQUIRED_LANGS.length}
                      </span>
                    </div>
                    <div className="flex items-center gap-1" title="Bild">
                      <Image className={`h-3.5 w-3.5 ${item.has_cover ? 'text-green-600' : 'text-red-500'}`} />
                    </div>
                    <div className="flex items-center gap-1" title="Audio">
                      <Headphones className={`h-3.5 w-3.5 ${item.has_audio ? 'text-green-600' : 'text-red-500'}`} />
                    </div>
                  </div>

                  {/* Overall score */}
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${getScoreBg(item.score_overall)}`} style={{ width: `${item.score_overall * 100}%` }} />
                    </div>
                    <span className={`text-xs font-bold w-8 text-right ${getScoreColor(item.score_overall)}`}>
                      {Math.round(item.score_overall * 100)}%
                    </span>
                    {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </div>
                </button>

                {/* Expanded details */}
                {isExpanded && (
                  <div className="px-3 pb-3 border-t">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3">
                      {/* Missing fields */}
                      {item.missing_fields.length > 0 && (
                        <div>
                          <div className="text-xs font-medium text-red-600 mb-1">Fehlende Textfelder</div>
                          <div className="flex flex-wrap gap-1">
                            {item.missing_fields.map(f => (
                              <Badge key={f} variant="destructive" className="text-[10px]">{f}</Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Missing translations */}
                      {item.missing_languages.length > 0 && (
                        <div>
                          <div className="text-xs font-medium text-amber-600 mb-1">Fehlende Uebersetzungen</div>
                          <div className="flex flex-wrap gap-1">
                            {item.missing_languages.map(l => (
                              <Badge key={l} variant="outline" className="text-[10px]">{l}</Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Media status */}
                      <div>
                        <div className="text-xs font-medium mb-1">Medien</div>
                        <div className="flex gap-2 text-xs">
                          <span className={item.has_cover ? 'text-green-600' : 'text-red-500'}>
                            {item.has_cover ? 'Titelbild vorhanden' : 'Titelbild fehlt'}
                          </span>
                          <span className={item.has_audio ? 'text-green-600' : 'text-red-500'}>
                            {item.has_audio ? 'Audio vorhanden' : 'Audio fehlt'}
                          </span>
                        </div>
                      </div>

                      {/* Quick fix suggestion */}
                      <div>
                        <div className="text-xs font-medium mb-1">Naechster Schritt</div>
                        <div className="text-xs text-muted-foreground">
                          {item.score_texts < 0.3
                            ? 'Texte im Editor hinzufuegen oder per KI generieren lassen.'
                            : item.score_translations < 0.5
                            ? 'Uebersetzungen starten — DE ist vorhanden.'
                            : !item.has_cover
                            ? 'Titelbild hochladen.'
                            : !item.has_audio
                            ? 'Audio generieren lassen (TTS).'
                            : 'Alles vollstaendig — zur Veroeffentlichung bereit!'}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
