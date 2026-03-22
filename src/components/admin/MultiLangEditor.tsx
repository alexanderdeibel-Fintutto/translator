// Fintutto World — Inline Multi-Language Editor
// Side-by-side multilingual text editing with live preview
// Supports all 8 content depth layers with per-language tabs

import { useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip'
import {
  Globe, Sparkles, Loader2, Eye, EyeOff, Copy, Check,
  HelpCircle, Languages, ChevronDown, ChevronUp,
} from 'lucide-react'
import { supabase } from '@/lib/supabase'

// ── Field Configuration ─────────────────────────────────────────────

export interface ContentField {
  key: string
  label: string
  hint: string
  rows: number
  audience?: string  // who this is for
}

export const CONTENT_FIELDS: ContentField[] = [
  { key: 'content_brief', label: 'Kurzbeschreibung', hint: '1-2 Saetze. Wird als Vorschau in Listen und Karten gezeigt.', rows: 2, audience: 'Alle Besucher' },
  { key: 'content_standard', label: 'Standardbeschreibung', hint: '4-6 Saetze. Haupttext fuer die meisten Besucher.', rows: 4, audience: 'Alle Besucher' },
  { key: 'content_detailed', label: 'Detailliert', hint: '8-15 Saetze. Fuer Besucher die mehr erfahren moechten.', rows: 6, audience: 'Interessierte' },
  { key: 'content_children', label: 'Kinderbeschreibung', hint: 'Einfache Sprache fuer 6-12 Jahre. Kurze Saetze, lebendige Bilder.', rows: 4, audience: '6-12 Jahre' },
  { key: 'content_youth', label: 'Jugendbeschreibung', hint: 'Fuer 13-17 Jahre. Cool, aber respektvoll. Bezuege zur Lebenswelt.', rows: 4, audience: '13-17 Jahre' },
  { key: 'content_fun_facts', label: 'Fun Facts', hint: 'Ueberraschende, unterhaltsame Fakten. Jeder Fakt eine eigene Zeile.', rows: 4, audience: 'Alle' },
  { key: 'content_historical', label: 'Historischer Kontext', hint: 'Zeitgeschichtlicher Hintergrund. Was passierte zur Entstehungszeit?', rows: 5, audience: 'Geschichtsinteressierte' },
  { key: 'content_technique', label: 'Technik-Details', hint: 'Materialien, Arbeitsweise, kuenstlerische Technik.', rows: 4, audience: 'Fachpublikum' },
]

export const LANGUAGES = [
  { code: 'de', label: 'Deutsch', flag: 'DE' },
  { code: 'en', label: 'English', flag: 'EN' },
  { code: 'fr', label: 'Francais', flag: 'FR' },
  { code: 'it', label: 'Italiano', flag: 'IT' },
  { code: 'es', label: 'Espanol', flag: 'ES' },
  { code: 'nl', label: 'Nederlands', flag: 'NL' },
  { code: 'pl', label: 'Polski', flag: 'PL' },
  { code: 'cs', label: 'Cesky', flag: 'CS' },
  { code: 'zh', label: 'Zhongwen', flag: 'ZH' },
  { code: 'ja', label: 'Nihongo', flag: 'JA' },
  { code: 'ko', label: 'Hangugeo', flag: 'KO' },
  { code: 'ar', label: 'Arabiya', flag: 'AR' },
]

interface MultiLangEditorProps {
  /** Content item ID (fw_content_items or ag_artworks) */
  itemId: string
  /** Table to update */
  table: 'fw_content_items' | 'ag_artworks'
  /** Current multilingual content for all fields */
  content: Record<string, Record<string, string>>
  /** Active languages (subset of LANGUAGES) */
  activeLanguages?: string[]
  /** Callback when content changes */
  onChange: (fieldKey: string, lang: string, value: string) => void
  /** Callback to save */
  onSave?: () => void
  /** Whether save is in progress */
  saving?: boolean
  /** Which field is currently being AI-generated */
  generatingField?: string | null
  /** Trigger AI generation for a field */
  onGenerate?: (fieldKey: string, lang: string) => void
  /** Whether the item has been modified */
  isDirty?: boolean
}

export default function MultiLangEditor({
  itemId,
  table,
  content,
  activeLanguages = ['de', 'en'],
  onChange,
  onSave,
  saving = false,
  generatingField = null,
  onGenerate,
  isDirty = false,
}: MultiLangEditorProps) {
  const [activeLang, setActiveLang] = useState(activeLanguages[0] || 'de')
  const [previewMode, setPreviewMode] = useState(false)
  const [expandedFields, setExpandedFields] = useState<Set<string>>(new Set(['content_brief', 'content_standard']))
  const [copiedField, setCopiedField] = useState<string | null>(null)

  const toggleField = useCallback((key: string) => {
    setExpandedFields(prev => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }, [])

  // Count filled languages per field
  function countFilledLangs(fieldKey: string): number {
    const fieldContent = content[fieldKey] || {}
    return Object.values(fieldContent).filter(v => v && v.trim().length > 0).length
  }

  // Copy text from one language to another
  function copyToLang(fieldKey: string, fromLang: string, toLang: string) {
    const text = content[fieldKey]?.[fromLang]
    if (text) {
      onChange(fieldKey, toLang, text)
      setCopiedField(`${fieldKey}-${toLang}`)
      setTimeout(() => setCopiedField(null), 1500)
    }
  }

  // Completeness for current language
  function getCompletenessForLang(lang: string): { filled: number; total: number; percent: number } {
    const total = CONTENT_FIELDS.length
    let filled = 0
    for (const field of CONTENT_FIELDS) {
      const text = content[field.key]?.[lang]
      if (text && text.trim().length > 5) filled++
    }
    return { filled, total, percent: Math.round((filled / total) * 100) }
  }

  const completeness = getCompletenessForLang(activeLang)

  return (
    <TooltipProvider>
      <div className="space-y-4">
        {/* Language Tabs + Actions */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-muted-foreground" />
            <div className="flex gap-1">
              {activeLanguages.map(lang => {
                const langInfo = LANGUAGES.find(l => l.code === lang)
                const comp = getCompletenessForLang(lang)
                return (
                  <button
                    key={lang}
                    onClick={() => setActiveLang(lang)}
                    className={`relative px-3 py-1.5 rounded-md text-xs font-medium transition ${
                      activeLang === lang
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}
                  >
                    {langInfo?.flag || lang.toUpperCase()}
                    {/* Completeness dot */}
                    <span
                      className={`absolute -top-1 -right-1 w-2 h-2 rounded-full ${
                        comp.percent === 100 ? 'bg-green-500' :
                        comp.percent > 0 ? 'bg-amber-500' : 'bg-red-400'
                      }`}
                    />
                  </button>
                )
              })}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Completeness badge */}
            <Badge variant={completeness.percent === 100 ? 'default' : 'outline'} className="text-xs">
              {completeness.filled}/{completeness.total} Felder
            </Badge>

            {/* Preview toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setPreviewMode(!previewMode)}
            >
              {previewMode ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              <span className="ml-1 text-xs">{previewMode ? 'Bearbeiten' : 'Vorschau'}</span>
            </Button>

            {/* Save */}
            {onSave && (
              <Button size="sm" onClick={onSave} disabled={saving || !isDirty}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                <span className="ml-1">{isDirty ? 'Speichern' : 'Gespeichert'}</span>
              </Button>
            )}
          </div>
        </div>

        {/* Completeness Bar */}
        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              completeness.percent === 100 ? 'bg-green-500' :
              completeness.percent >= 50 ? 'bg-amber-500' : 'bg-red-400'
            }`}
            style={{ width: `${completeness.percent}%` }}
          />
        </div>

        {/* Content Fields */}
        <div className="space-y-3">
          {CONTENT_FIELDS.map(field => {
            const isExpanded = expandedFields.has(field.key)
            const text = content[field.key]?.[activeLang] || ''
            const filledLangs = countFilledLangs(field.key)
            const isGenerating = generatingField === field.key
            const isEmpty = !text || text.trim().length === 0

            return (
              <Card key={field.key} className={`overflow-hidden transition-all ${isEmpty ? 'border-dashed border-amber-300/50' : ''}`}>
                {/* Field Header */}
                <button
                  onClick={() => toggleField(field.key)}
                  className="w-full flex items-center justify-between p-3 hover:bg-muted/30 transition"
                >
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${isEmpty ? 'bg-red-400' : 'bg-green-500'}`} />
                    <span className="font-medium text-sm">{field.label}</span>
                    {field.audience && (
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                        {field.audience}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-[10px]">
                      <Languages className="h-3 w-3 mr-1" />
                      {filledLangs}/{activeLanguages.length}
                    </Badge>
                    {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </div>
                </button>

                {/* Field Content */}
                {isExpanded && (
                  <div className="px-3 pb-3 space-y-2">
                    {/* Hint */}
                    <div className="flex items-start gap-1.5 text-xs text-muted-foreground bg-muted/30 rounded-md p-2">
                      <HelpCircle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                      <span>{field.hint}</span>
                    </div>

                    {previewMode ? (
                      /* Preview Mode */
                      <div className="prose prose-sm max-w-none p-3 bg-muted/20 rounded-md min-h-[60px]">
                        {text || <span className="text-muted-foreground italic">Kein Inhalt vorhanden.</span>}
                      </div>
                    ) : (
                      /* Edit Mode */
                      <div className="space-y-2">
                        <textarea
                          value={text}
                          onChange={e => onChange(field.key, activeLang, e.target.value)}
                          rows={field.rows}
                          placeholder={`${field.label} auf ${LANGUAGES.find(l => l.code === activeLang)?.label || activeLang} eingeben...`}
                          className="w-full px-3 py-2 rounded-md border border-input bg-transparent text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none resize-y"
                          dir={activeLang === 'ar' ? 'rtl' : 'ltr'}
                        />

                        {/* Actions Row */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            {/* AI Generate */}
                            {onGenerate && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onGenerate(field.key, activeLang)}
                                disabled={isGenerating}
                                className="text-xs h-7"
                              >
                                {isGenerating ? (
                                  <Loader2 className="h-3 w-3 animate-spin mr-1" />
                                ) : (
                                  <Sparkles className="h-3 w-3 mr-1" />
                                )}
                                {isGenerating ? 'Generiere...' : 'KI generieren'}
                              </Button>
                            )}

                            {/* Copy from DE (if editing non-DE language) */}
                            {activeLang !== 'de' && content[field.key]?.de && (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => copyToLang(field.key, 'de', activeLang)}
                                    className="text-xs h-7"
                                  >
                                    {copiedField === `${field.key}-${activeLang}` ? (
                                      <Check className="h-3 w-3 mr-1 text-green-500" />
                                    ) : (
                                      <Copy className="h-3 w-3 mr-1" />
                                    )}
                                    DE kopieren
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Deutschen Text als Vorlage uebernehmen</TooltipContent>
                              </Tooltip>
                            )}
                          </div>

                          {/* Character count */}
                          <span className="text-[10px] text-muted-foreground">
                            {text.length} Zeichen
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Other languages mini-preview */}
                    {!previewMode && activeLanguages.length > 1 && (
                      <div className="flex gap-1 flex-wrap">
                        {activeLanguages.filter(l => l !== activeLang).map(lang => {
                          const langText = content[field.key]?.[lang]
                          const hasText = langText && langText.trim().length > 0
                          return (
                            <button
                              key={lang}
                              onClick={() => setActiveLang(lang)}
                              className={`text-[10px] px-1.5 py-0.5 rounded transition ${
                                hasText
                                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                  : 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
                              }`}
                            >
                              {lang.toUpperCase()}: {hasText ? `${langText!.slice(0, 30)}...` : 'fehlt'}
                            </button>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )}
              </Card>
            )
          })}
        </div>

        {/* Expand/Collapse All */}
        <div className="flex justify-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              if (expandedFields.size === CONTENT_FIELDS.length) {
                setExpandedFields(new Set())
              } else {
                setExpandedFields(new Set(CONTENT_FIELDS.map(f => f.key)))
              }
            }}
            className="text-xs"
          >
            {expandedFields.size === CONTENT_FIELDS.length ? 'Alle zuklappen' : 'Alle aufklappen'}
          </Button>
        </div>
      </div>
    </TooltipProvider>
  )
}
