/**
 * TeamPhrasesAdminPage — Admin-Panel für Team-Phrasen
 * Route: /:slug/team-phrases
 *
 * Admins können hier:
 * - Team-Phrasen anlegen, bearbeiten, löschen
 * - Phrasen in Kategorien organisieren
 * - CSV-Import aus bestehenden Handbüchern
 * - Vorschau wie Mitarbeiter die Phrasen sehen
 *
 * Zugang: Nur für Admins (role = 'admin' in user_metadata)
 */

import { useState, useEffect, useRef } from 'react'
import { Plus, Trash2, Edit2, Check, X, Upload, Download, Search, GripVertical, Tag } from 'lucide-react'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'
import { useUser } from '@/context/UserContext'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

interface TeamPhrase {
  id: string
  team_id: string
  text: string
  category: string
  emoji: string
  use_count: number
  created_at: string
}

const DEFAULT_CATEGORIES = [
  'Begrüßung', 'Verabschiedung', 'Hotel-Info', 'Service',
  'Orientierung', 'Notfall', 'Allgemein'
]

const EMOJI_SUGGESTIONS: Record<string, string> = {
  'Begrüßung': '👋', 'Verabschiedung': '🙏', 'Hotel-Info': '🏨',
  'Service': '🔧', 'Orientierung': '🗺️', 'Notfall': '🚨', 'Allgemein': '💬',
  'Medizin': '🏥', 'Behörde': '🏛️', 'Reise': '✈️', 'Essen': '🍽️',
  'Zimmer': '🛏️', 'Zahlung': '💳', 'Transport': '🚗',
}

export default function TeamPhrasesAdminPage() {
  const { user } = useUser()
  const [phrases, setPhrases] = useState<TeamPhrase[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterCategory, setFilterCategory] = useState<string>('Alle')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editText, setEditText] = useState('')
  const [editCategory, setEditCategory] = useState('')
  const [editEmoji, setEditEmoji] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [newText, setNewText] = useState('')
  const [newCategory, setNewCategory] = useState('Allgemein')
  const [newEmoji, setNewEmoji] = useState('💬')
  const [showCsvImport, setShowCsvImport] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Team-ID aus URL oder User-Profil
  const teamId = user?.user_metadata?.team_id || 'hotel-demo'

  useEffect(() => {
    loadPhrases()
  }, [teamId])

  async function loadPhrases() {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('team_phrases')
        .select('*')
        .eq('team_id', teamId)
        .order('category', { ascending: true })
        .order('use_count', { ascending: false })
      if (error) throw error
      setPhrases(data || [])
    } catch (e: any) {
      toast.error('Phrasen konnten nicht geladen werden: ' + e.message)
    } finally {
      setLoading(false)
    }
  }

  async function addPhrase() {
    if (!newText.trim()) return
    try {
      const { error } = await supabase.from('team_phrases').insert({
        team_id: teamId,
        text: newText.trim(),
        category: newCategory,
        emoji: newEmoji || EMOJI_SUGGESTIONS[newCategory] || '💬',
        created_by: user?.id,
      })
      if (error) throw error
      toast.success('Phrase hinzugefügt')
      setNewText('')
      setNewEmoji(EMOJI_SUGGESTIONS[newCategory] || '💬')
      setShowAddForm(false)
      loadPhrases()
    } catch (e: any) {
      toast.error('Fehler: ' + e.message)
    }
  }

  async function saveEdit(id: string) {
    try {
      const { error } = await supabase
        .from('team_phrases')
        .update({ text: editText.trim(), category: editCategory, emoji: editEmoji })
        .eq('id', id)
      if (error) throw error
      toast.success('Gespeichert')
      setEditingId(null)
      loadPhrases()
    } catch (e: any) {
      toast.error('Fehler: ' + e.message)
    }
  }

  async function deletePhrase(id: string) {
    if (!confirm('Phrase wirklich löschen?')) return
    try {
      const { error } = await supabase.from('team_phrases').delete().eq('id', id)
      if (error) throw error
      toast.success('Gelöscht')
      setPhrases(prev => prev.filter(p => p.id !== id))
    } catch (e: any) {
      toast.error('Fehler: ' + e.message)
    }
  }

  function startEdit(phrase: TeamPhrase) {
    setEditingId(phrase.id)
    setEditText(phrase.text)
    setEditCategory(phrase.category)
    setEditEmoji(phrase.emoji || '💬')
  }

  // CSV-Export
  function exportCsv() {
    const header = 'Kategorie,Emoji,Text\n'
    const rows = phrases.map(p =>
      `"${p.category}","${p.emoji || ''}","${p.text.replace(/"/g, '""')}"`
    ).join('\n')
    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `team-phrasen-${teamId}-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  // CSV-Import
  async function importCsv(file: File) {
    const text = await file.text()
    const lines = text.split('\n').filter(l => l.trim())
    const header = lines[0].toLowerCase()
    const hasHeader = header.includes('kategorie') || header.includes('text') || header.includes('category')
    const dataLines = hasHeader ? lines.slice(1) : lines

    const toInsert: Omit<TeamPhrase, 'id' | 'use_count' | 'created_at'>[] = []
    let errors = 0

    for (const line of dataLines) {
      // CSV-Parsing (einfach, ohne externe Lib)
      const cols = line.match(/(".*?"|[^,]+)(?=\s*,|\s*$)/g)?.map(c =>
        c.replace(/^"|"$/g, '').replace(/""/g, '"').trim()
      ) || []

      if (cols.length === 0) continue

      if (cols.length === 1) {
        // Nur Text
        toInsert.push({ team_id: teamId, text: cols[0], category: 'Allgemein', emoji: '💬' })
      } else if (cols.length === 2) {
        // Kategorie + Text
        toInsert.push({ team_id: teamId, text: cols[1], category: cols[0], emoji: EMOJI_SUGGESTIONS[cols[0]] || '💬' })
      } else if (cols.length >= 3) {
        // Kategorie + Emoji + Text
        toInsert.push({ team_id: teamId, text: cols[2], category: cols[0], emoji: cols[1] || '💬' })
      } else {
        errors++
      }
    }

    if (toInsert.length === 0) {
      toast.error('Keine gültigen Phrasen in der CSV-Datei gefunden.')
      return
    }

    try {
      const { error } = await supabase.from('team_phrases').insert(
        toInsert.map(p => ({ ...p, created_by: user?.id }))
      )
      if (error) throw error
      toast.success(`${toInsert.length} Phrasen importiert${errors > 0 ? ` (${errors} Fehler übersprungen)` : ''}`)
      setShowCsvImport(false)
      loadPhrases()
    } catch (e: any) {
      toast.error('Import-Fehler: ' + e.message)
    }
  }

  // Gefilterte Phrasen
  const categories = ['Alle', ...Array.from(new Set(phrases.map(p => p.category))).sort()]
  const filtered = phrases.filter(p => {
    const matchSearch = search === '' ||
      p.text.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase())
    const matchCat = filterCategory === 'Alle' || p.category === filterCategory
    return matchSearch && matchCat
  })

  // Gruppiert nach Kategorie
  const grouped = filtered.reduce<Record<string, TeamPhrase[]>>((acc, p) => {
    if (!acc[p.category]) acc[p.category] = []
    acc[p.category].push(p)
    return acc
  }, {})

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-6">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Team-Phrasen</h1>
            <p className="text-slate-400 text-sm mt-1">
              Phrasen die alle Mitarbeiter im Gespräch nutzen können · {phrases.length} gesamt
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={exportCsv} className="gap-1.5">
              <Download className="h-4 w-4" />
              Export
            </Button>
            <Button variant="outline" size="sm" onClick={() => setShowCsvImport(v => !v)} className="gap-1.5">
              <Upload className="h-4 w-4" />
              CSV-Import
            </Button>
            <Button size="sm" onClick={() => setShowAddForm(v => !v)} className="gap-1.5 bg-emerald-600 hover:bg-emerald-700">
              <Plus className="h-4 w-4" />
              Neue Phrase
            </Button>
          </div>
        </div>

        {/* CSV-Import-Panel */}
        {showCsvImport && (
          <Card className="p-4 bg-slate-900 border-slate-700 space-y-3">
            <h3 className="font-semibold text-sm">CSV-Import</h3>
            <p className="text-xs text-slate-400">
              Unterstützte Formate (eine Zeile pro Phrase):
            </p>
            <div className="font-mono text-xs bg-slate-800 rounded p-3 space-y-1">
              <div className="text-slate-300">Text</div>
              <div className="text-slate-300">Kategorie,Text</div>
              <div className="text-slate-300">Kategorie,Emoji,Text</div>
            </div>
            <p className="text-xs text-slate-400">
              Erste Zeile kann eine Kopfzeile sein (wird automatisch erkannt).
              Texte mit Kommas in Anführungszeichen einschließen.
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="gap-1.5"
              >
                <Upload className="h-4 w-4" />
                CSV-Datei wählen
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.txt"
                className="hidden"
                onChange={e => { if (e.target.files?.[0]) importCsv(e.target.files[0]) }}
              />
              <Button variant="ghost" size="sm" onClick={() => setShowCsvImport(false)}>
                Abbrechen
              </Button>
            </div>
          </Card>
        )}

        {/* Neue Phrase hinzufügen */}
        {showAddForm && (
          <Card className="p-4 bg-slate-900 border-slate-700 space-y-3">
            <h3 className="font-semibold text-sm">Neue Phrase</h3>
            <div className="flex gap-2">
              <input
                value={newEmoji}
                onChange={e => setNewEmoji(e.target.value)}
                placeholder="😊"
                className="w-14 px-2 py-2 text-center text-lg rounded-lg border border-slate-600 bg-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <select
                value={newCategory}
                onChange={e => {
                  setNewCategory(e.target.value)
                  setNewEmoji(EMOJI_SUGGESTIONS[e.target.value] || '💬')
                }}
                className="px-3 py-2 rounded-lg border border-slate-600 bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {[...DEFAULT_CATEGORIES, ...categories.filter(c => c !== 'Alle' && !DEFAULT_CATEGORIES.includes(c))].map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <textarea
              value={newText}
              onChange={e => setNewText(e.target.value)}
              placeholder="Phrasentext eingeben..."
              rows={2}
              className="w-full px-3 py-2 rounded-lg border border-slate-600 bg-slate-800 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500"
              onKeyDown={e => { if (e.key === 'Enter' && e.ctrlKey) addPhrase() }}
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={addPhrase} disabled={!newText.trim()} className="gap-1.5 bg-emerald-600 hover:bg-emerald-700">
                <Plus className="h-4 w-4" />
                Hinzufügen
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setShowAddForm(false)}>
                Abbrechen
              </Button>
            </div>
          </Card>
        )}

        {/* Filter & Suche */}
        <div className="flex gap-2 flex-wrap">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Phrasen suchen..."
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-700 bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div className="flex gap-1 flex-wrap">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  filterCategory === cat
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Phrasen-Liste gruppiert nach Kategorie */}
        {loading ? (
          <div className="text-center py-12 text-slate-400">Laden...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            {search ? `Keine Phrasen für "${search}" gefunden.` : 'Noch keine Phrasen. Jetzt hinzufügen!'}
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(grouped).map(([category, catPhrases]) => (
              <div key={category}>
                <div className="flex items-center gap-2 mb-2">
                  <Tag className="h-3.5 w-3.5 text-slate-400" />
                  <h3 className="text-sm font-semibold text-slate-300">{category}</h3>
                  <span className="text-xs text-slate-500">({catPhrases.length})</span>
                </div>
                <div className="space-y-1">
                  {catPhrases.map(phrase => (
                    <Card
                      key={phrase.id}
                      className="bg-slate-900 border-slate-700 overflow-hidden"
                    >
                      {editingId === phrase.id ? (
                        // Bearbeitungs-Modus
                        <div className="p-3 space-y-2">
                          <div className="flex gap-2">
                            <input
                              value={editEmoji}
                              onChange={e => setEditEmoji(e.target.value)}
                              className="w-12 px-2 py-1.5 text-center text-lg rounded-lg border border-slate-600 bg-slate-800 focus:outline-none"
                            />
                            <select
                              value={editCategory}
                              onChange={e => setEditCategory(e.target.value)}
                              className="px-2 py-1.5 rounded-lg border border-slate-600 bg-slate-800 text-sm focus:outline-none"
                            >
                              {[...DEFAULT_CATEGORIES, ...categories.filter(c => c !== 'Alle' && !DEFAULT_CATEGORIES.includes(c))].map(c => (
                                <option key={c} value={c}>{c}</option>
                              ))}
                            </select>
                          </div>
                          <textarea
                            value={editText}
                            onChange={e => setEditText(e.target.value)}
                            rows={2}
                            className="w-full px-3 py-2 rounded-lg border border-slate-600 bg-slate-800 text-sm resize-none focus:outline-none"
                            autoFocus
                          />
                          <div className="flex gap-2">
                            <Button size="sm" onClick={() => saveEdit(phrase.id)} className="gap-1 bg-emerald-600 hover:bg-emerald-700">
                              <Check className="h-3.5 w-3.5" />
                              Speichern
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => setEditingId(null)}>
                              <X className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>
                      ) : (
                        // Anzeige-Modus
                        <div className="flex items-center gap-3 px-3 py-2.5 group">
                          <GripVertical className="h-4 w-4 text-slate-600 shrink-0 cursor-grab" />
                          <span className="text-lg shrink-0">{phrase.emoji || '💬'}</span>
                          <span className="flex-1 text-sm text-slate-200">{phrase.text}</span>
                          {phrase.use_count > 0 && (
                            <span className="text-xs text-slate-500 shrink-0">{phrase.use_count}×</span>
                          )}
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => startEdit(phrase)}
                              className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => deletePhrase(phrase.id)}
                              className="p-1.5 rounded-lg hover:bg-red-900/50 text-slate-400 hover:text-red-400 transition-colors"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      )}
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
