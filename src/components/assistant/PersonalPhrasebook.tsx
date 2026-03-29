/**
 * PersonalPhrasebook — Persönliches Phrasenbuch
 *
 * Jeder Mitarbeiter kann eigene Phrasen anlegen, die er häufig braucht.
 * Phrasen werden in Supabase gespeichert (user_phrases Tabelle).
 * Häufig genutzte Phrasen erscheinen automatisch ganz oben.
 *
 * Features:
 * - Eigene Phrasen anlegen (Text + Kategorie + Emoji)
 * - Aus dem Gespräch heraus speichern (⭐ Merken)
 * - Sortierung nach Nutzungshäufigkeit
 * - Ein Klick → Satz wird ins Gespräch eingesetzt
 * - Offline-fähig: Phrasen werden lokal gecacht
 *
 * Einbindung: In ConversationPage als aufklappbares Panel
 */

import { useState, useEffect, useCallback } from 'react'
import { BookOpen, Plus, Star, Trash2, ChevronDown, ChevronUp, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { supabase } from '@/lib/supabase'
import { useUser } from '@/context/UserContext'

export interface UserPhrase {
  id: string
  text: string
  category: string
  emoji?: string
  use_count: number
  created_at: string
}

// Lokaler Cache für Offline-Betrieb
const LOCAL_KEY = 'fintutto_personal_phrases'

function loadLocalPhrases(): UserPhrase[] {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_KEY) || '[]')
  } catch {
    return []
  }
}

function saveLocalPhrases(phrases: UserPhrase[]) {
  try {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(phrases))
  } catch {}
}

// Standard-Phrasen für neue Nutzer (nach Kontext)
const DEFAULT_PHRASES: Omit<UserPhrase, 'id' | 'created_at'>[] = [
  { text: 'Einen Moment bitte.', category: 'Allgemein', emoji: '⏱️', use_count: 0 },
  { text: 'Ich verstehe Sie leider nicht.', category: 'Allgemein', emoji: '🤔', use_count: 0 },
  { text: 'Bitte sprechen Sie langsamer.', category: 'Allgemein', emoji: '🐢', use_count: 0 },
  { text: 'Haben Sie noch Fragen?', category: 'Abschluss', emoji: '✅', use_count: 0 },
  { text: 'Auf Wiedersehen!', category: 'Abschluss', emoji: '👋', use_count: 0 },
]

interface PersonalPhrasebookProps {
  /** Callback wenn eine Phrase ausgewählt wird */
  onSpeak: (text: string) => void
  /** Ob eine Phrase aus dem Gespräch gespeichert werden soll */
  phraseToSave?: string
  onPhraseSaved?: () => void
}

export default function PersonalPhrasebook({
  onSpeak,
  phraseToSave,
  onPhraseSaved,
}: PersonalPhrasebookProps) {
  const { user } = useUser()
  const [phrases, setPhrases] = useState<UserPhrase[]>([])
  const [expanded, setExpanded] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newText, setNewText] = useState('')
  const [newCategory, setNewCategory] = useState('Allgemein')
  const [newEmoji, setNewEmoji] = useState('💬')
  const [saving, setSaving] = useState(false)
  const [justSaved, setJustSaved] = useState<string | null>(null)

  // Phrasen laden
  useEffect(() => {
    loadPhrases()
  }, [user])

  // Phrase aus Gespräch speichern
  useEffect(() => {
    if (phraseToSave) {
      setNewText(phraseToSave)
      setShowAddForm(true)
      setExpanded(true)
    }
  }, [phraseToSave])

  async function loadPhrases() {
    // Erst lokal laden (sofort verfügbar)
    const local = loadLocalPhrases()
    if (local.length > 0) setPhrases(local)

    if (!user) {
      // Kein Login: Standard-Phrasen anzeigen
      if (local.length === 0) {
        const defaults = DEFAULT_PHRASES.map((p, i) => ({
          ...p,
          id: `default_${i}`,
          created_at: new Date().toISOString(),
        }))
        setPhrases(defaults)
        saveLocalPhrases(defaults)
      }
      return
    }

    try {
      const { data, error } = await supabase
        .from('user_phrases')
        .select('*')
        .eq('user_id', user.id)
        .order('use_count', { ascending: false })
        .order('created_at', { ascending: false })

      if (error) throw error

      if (data && data.length > 0) {
        setPhrases(data)
        saveLocalPhrases(data)
      } else if (local.length === 0) {
        // Neue Nutzer: Standard-Phrasen anlegen
        await seedDefaultPhrases()
      }
    } catch {
      // Offline: lokale Daten verwenden
    }
  }

  async function seedDefaultPhrases() {
    if (!user) return
    try {
      const toInsert = DEFAULT_PHRASES.map(p => ({
        user_id: user.id,
        text: p.text,
        category: p.category,
        emoji: p.emoji,
        use_count: 0,
      }))
      const { data } = await supabase
        .from('user_phrases')
        .insert(toInsert)
        .select()

      if (data) {
        setPhrases(data)
        saveLocalPhrases(data)
      }
    } catch {}
  }

  const handleSpeak = useCallback(async (phrase: UserPhrase) => {
    onSpeak(phrase.text)

    // Nutzungszähler erhöhen
    const updated = phrases.map(p =>
      p.id === phrase.id ? { ...p, use_count: p.use_count + 1 } : p
    ).sort((a, b) => b.use_count - a.use_count)

    setPhrases(updated)
    saveLocalPhrases(updated)

    if (user && !phrase.id.startsWith('default_')) {
      try {
        await supabase
          .from('user_phrases')
          .update({ use_count: phrase.use_count + 1 })
          .eq('id', phrase.id)
      } catch {}
    }
  }, [phrases, onSpeak, user])

  const handleSave = useCallback(async () => {
    if (!newText.trim()) return
    setSaving(true)

    const newPhrase: UserPhrase = {
      id: `local_${Date.now()}`,
      text: newText.trim(),
      category: newCategory,
      emoji: newEmoji,
      use_count: 0,
      created_at: new Date().toISOString(),
    }

    try {
      if (user) {
        const { data, error } = await supabase
          .from('user_phrases')
          .insert({
            user_id: user.id,
            text: newPhrase.text,
            category: newPhrase.category,
            emoji: newPhrase.emoji,
            use_count: 0,
          })
          .select()
          .single()

        if (!error && data) {
          newPhrase.id = data.id
        }
      }

      const updated = [newPhrase, ...phrases]
      setPhrases(updated)
      saveLocalPhrases(updated)

      setJustSaved(newPhrase.id)
      setTimeout(() => setJustSaved(null), 2000)

      setNewText('')
      setShowAddForm(false)
      onPhraseSaved?.()
    } catch {
      // Lokal speichern auch ohne Server
      const updated = [newPhrase, ...phrases]
      setPhrases(updated)
      saveLocalPhrases(updated)
    } finally {
      setSaving(false)
    }
  }, [newText, newCategory, newEmoji, phrases, user, onPhraseSaved])

  const handleDelete = useCallback(async (id: string) => {
    const updated = phrases.filter(p => p.id !== id)
    setPhrases(updated)
    saveLocalPhrases(updated)

    if (user && !id.startsWith('default_') && !id.startsWith('local_')) {
      try {
        await supabase.from('user_phrases').delete().eq('id', id)
      } catch {}
    }
  }, [phrases, user])

  // Phrasen nach Kategorie gruppieren
  const grouped = phrases.reduce<Record<string, UserPhrase[]>>((acc, p) => {
    if (!acc[p.category]) acc[p.category] = []
    acc[p.category].push(p)
    return acc
  }, {})

  const CATEGORY_EMOJIS = ['💬', '✅', '⏱️', '🤔', '📋', '🏥', '🏛️', '🏨', '✈️', '🛒', '🚨', '👋']

  return (
    <Card className="overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setExpanded(v => !v)}
        className="w-full flex items-center justify-between p-3 hover:bg-accent transition-colors"
      >
        <div className="flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium text-sm">Meine Phrasen</span>
          <span className="text-xs text-muted-foreground bg-muted rounded-full px-2 py-0.5">
            {phrases.length}
          </span>
        </div>
        {expanded ? (
          <ChevronUp className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        )}
      </button>

      {expanded && (
        <div className="px-3 pb-3 space-y-3">
          {/* Neue Phrase hinzufügen */}
          {showAddForm ? (
            <div className="space-y-2 p-3 rounded-lg bg-muted/50 border">
              <div className="flex gap-2">
                {/* Emoji-Auswahl */}
                <div className="flex flex-wrap gap-1 w-full">
                  {CATEGORY_EMOJIS.map(e => (
                    <button
                      key={e}
                      onClick={() => setNewEmoji(e)}
                      className={`text-lg p-1 rounded transition-colors ${newEmoji === e ? 'bg-primary/20 ring-1 ring-primary' : 'hover:bg-muted'}`}
                    >
                      {e}
                    </button>
                  ))}
                </div>
              </div>

              <textarea
                value={newText}
                onChange={e => setNewText(e.target.value)}
                placeholder="Satz eingeben..."
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm resize-none h-16 focus:outline-none focus:ring-2 focus:ring-violet-500"
                autoFocus
              />

              <input
                value={newCategory}
                onChange={e => setNewCategory(e.target.value)}
                placeholder="Kategorie (z.B. Begrüßung)"
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
              />

              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex-1"
                  onClick={() => { setShowAddForm(false); setNewText(''); onPhraseSaved?.() }}
                >
                  Abbrechen
                </Button>
                <Button
                  size="sm"
                  className="flex-1 bg-violet-700 hover:bg-violet-800"
                  onClick={handleSave}
                  disabled={!newText.trim() || saving}
                >
                  {saving ? 'Speichern...' : 'Speichern'}
                </Button>
              </div>
            </div>
          ) : (
            <Button
              variant="outline"
              size="sm"
              className="w-full gap-1.5 border-dashed"
              onClick={() => setShowAddForm(true)}
            >
              <Plus className="h-3.5 w-3.5" />
              Phrase hinzufügen
            </Button>
          )}

          {/* Phrasen-Liste nach Kategorie */}
          {Object.entries(grouped).map(([category, categoryPhrases]) => (
            <div key={category} className="space-y-1.5">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {category}
              </p>
              <div className="space-y-1">
                {categoryPhrases.map(phrase => (
                  <div
                    key={phrase.id}
                    className={`flex items-center gap-2 group rounded-lg px-2 py-1.5 hover:bg-accent transition-colors ${
                      justSaved === phrase.id ? 'bg-green-50 dark:bg-green-950/30' : ''
                    }`}
                  >
                    <span className="text-base shrink-0">{phrase.emoji || '💬'}</span>
                    <button
                      onClick={() => handleSpeak(phrase)}
                      className="flex-1 text-left text-sm hover:text-primary transition-colors"
                    >
                      {phrase.text}
                    </button>
                    {justSaved === phrase.id && (
                      <Check className="h-3.5 w-3.5 text-green-600 shrink-0" />
                    )}
                    {phrase.use_count > 0 && (
                      <span className="text-xs text-muted-foreground shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                        {phrase.use_count}×
                      </span>
                    )}
                    <button
                      onClick={() => handleDelete(phrase.id)}
                      className="p-1 rounded opacity-0 group-hover:opacity-100 hover:text-destructive transition-all"
                      aria-label="Phrase löschen"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {phrases.length === 0 && !showAddForm && (
            <p className="text-xs text-muted-foreground text-center py-3">
              Noch keine Phrasen. Fügen Sie Ihre häufigsten Sätze hinzu.
            </p>
          )}
        </div>
      )}
    </Card>
  )
}

// ── Hook: Phrase aus Gespräch merken ────────────────────────────────────────

/**
 * Fügt einem Nachrichten-Element einen "Merken"-Button hinzu.
 * Wird in ConversationPage bei jeder eigenen Nachricht angezeigt.
 */
interface SavePhraseButtonProps {
  text: string
  onSave: (text: string) => void
}

export function SavePhraseButton({ text, onSave }: SavePhraseButtonProps) {
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    onSave(text)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <button
      onClick={handleSave}
      className={`inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded transition-colors ${
        saved
          ? 'text-yellow-600 bg-yellow-50 dark:bg-yellow-950/30'
          : 'text-muted-foreground hover:text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-950/30'
      }`}
      title="Satz ins Phrasenbuch speichern"
    >
      <Star className={`h-2.5 w-2.5 ${saved ? 'fill-yellow-500' : ''}`} />
      {saved ? 'Gespeichert' : 'Merken'}
    </button>
  )
}
