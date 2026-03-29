/**
 * TeamPhrasebook — Team-Phrasen (Admin-verwaltete Phrasen)
 *
 * Admins legen Phrasen an die für alle Mitarbeiter des Teams sichtbar sind.
 * Mitarbeiter können Team-Phrasen nutzen aber nicht löschen.
 *
 * Anwendungsfälle:
 * - Hotel: Standard-Begrüßung, Zimmer-Infos, Frühstückszeiten
 * - Krankenhaus: Aufnahme-Formular-Phrasen, Datenschutz-Hinweis
 * - Behörde: Standardformulierungen, Öffnungszeiten, Gebühren
 *
 * Datenbank: team_phrases Tabelle (Migration 030)
 * RLS: Alle Mitarbeiter des Teams können lesen, nur Admins können schreiben
 */

import { useState, useEffect } from 'react'
import { Users, Lock, ChevronDown, ChevronUp, Search } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { supabase } from '@/lib/supabase'
import { useUser } from '@/context/UserContext'

export interface TeamPhrase {
  id: string
  team_id: string
  text: string
  category: string
  emoji?: string
  use_count: number
  created_by: string
  created_at: string
}

// Lokaler Cache
const LOCAL_KEY = 'fintutto_team_phrases'

function loadLocalTeamPhrases(): TeamPhrase[] {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_KEY) || '[]')
  } catch { return [] }
}

interface TeamPhrasebookProps {
  onSpeak: (text: string) => void
  /** Team-ID (aus Nutzer-Profil) */
  teamId?: string
}

export default function TeamPhrasebook({ onSpeak, teamId }: TeamPhrasebookProps) {
  const { user } = useUser()
  const [phrases, setPhrases] = useState<TeamPhrase[]>([])
  const [expanded, setExpanded] = useState(false)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!teamId && !user) return
    loadPhrases()
  }, [teamId, user])

  async function loadPhrases() {
    // Erst lokal laden
    const local = loadLocalTeamPhrases()
    if (local.length > 0) setPhrases(local)

    setLoading(true)
    try {
      const tid = teamId || user?.user_metadata?.team_id
      if (!tid) return

      const { data, error } = await supabase
        .from('team_phrases')
        .select('*')
        .eq('team_id', tid)
        .order('use_count', { ascending: false })

      if (error) throw error
      if (data) {
        setPhrases(data)
        localStorage.setItem(LOCAL_KEY, JSON.stringify(data))
      }
    } catch {
      // Offline: lokale Daten verwenden
    } finally {
      setLoading(false)
    }
  }

  const handleSpeak = async (phrase: TeamPhrase) => {
    onSpeak(phrase.text)
    // Nutzungszähler erhöhen (best-effort)
    try {
      await supabase
        .from('team_phrases')
        .update({ use_count: phrase.use_count + 1 })
        .eq('id', phrase.id)
    } catch {}
  }

  const filteredPhrases = phrases.filter(p =>
    search === '' ||
    p.text.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  )

  // Gruppieren nach Kategorie
  const grouped = filteredPhrases.reduce<Record<string, TeamPhrase[]>>((acc, p) => {
    if (!acc[p.category]) acc[p.category] = []
    acc[p.category].push(p)
    return acc
  }, {})

  if (phrases.length === 0 && !loading) return null

  return (
    <Card className="overflow-hidden">
      <button
        onClick={() => setExpanded(v => !v)}
        className="w-full flex items-center justify-between p-3 hover:bg-accent transition-colors"
      >
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium text-sm">Team-Phrasen</span>
          <span className="text-xs text-muted-foreground bg-muted rounded-full px-2 py-0.5">
            {phrases.length}
          </span>
          <Lock className="h-3 w-3 text-muted-foreground" title="Nur Admins können bearbeiten" />
        </div>
        {expanded ? (
          <ChevronUp className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        )}
      </button>

      {expanded && (
        <div className="px-3 pb-3 space-y-3">
          {/* Suche */}
          {phrases.length > 8 && (
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Phrase suchen..."
                className="w-full pl-8 pr-3 py-1.5 text-sm rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>
          )}

          {/* Phrasen nach Kategorie */}
          {Object.entries(grouped).map(([category, categoryPhrases]) => (
            <div key={category} className="space-y-1.5">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {category}
              </p>
              <div className="space-y-1">
                {categoryPhrases.map(phrase => (
                  <button
                    key={phrase.id}
                    onClick={() => handleSpeak(phrase)}
                    className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-accent text-left text-sm transition-colors"
                  >
                    <span className="text-base shrink-0">{phrase.emoji || '💬'}</span>
                    <span className="flex-1">{phrase.text}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}

          {filteredPhrases.length === 0 && search && (
            <p className="text-xs text-muted-foreground text-center py-2">
              Keine Phrasen für "{search}" gefunden.
            </p>
          )}
        </div>
      )}
    </Card>
  )
}
