/**
 * Session Protocol Page — AmtTranslator (Sachbearbeiter)
 *
 * RECHTLICHER HINWEIS:
 * Das Protokoll enthält NUR die Übersetzungen (Zielsprache), NICHT die
 * Originalaussagen des Bürgers. Es dient als Arbeitshilfe für den
 * Sachbearbeiter, nicht als Beweismittel.
 *
 * Rechtsgrundlage für Protokollierung: § 24 VwVfG (Untersuchungsgrundsatz),
 * § 26 VwVfG (Beweismittel), Art. 6 Abs. 1 lit. e DSGVO (öffentliche Aufgabe).
 * Besondere Kategorien (Art. 9 DSGVO): Nur mit ausdrücklicher Einwilligung
 * oder auf Basis von Art. 9 Abs. 2 lit. g DSGVO.
 *
 * Design: Behörden-Professionell — Teal/Slate
 */

import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  ArrowLeft,
  FileText,
  Download,
  Copy,
  Check,
  Printer,
  AlertTriangle,
  Clock,
  Languages,
  Shield,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

interface ProtocolEntry {
  id: string
  timestamp: number
  speaker: 'clerk' | 'visitor'
  originalText: string
  translatedText: string
  sourceLang: string
  targetLang: string
}

const LANG_NAMES: Record<string, string> = {
  de: 'Deutsch',
  ar: 'Arabisch',
  tr: 'Türkisch',
  uk: 'Ukrainisch',
  ru: 'Russisch',
  fa: 'Persisch',
  ps: 'Pashto',
  so: 'Somali',
  ti: 'Tigrinya',
  fr: 'Französisch',
  ro: 'Rumänisch',
  pl: 'Polnisch',
  vi: 'Vietnamesisch',
  ku: 'Kurdisch',
  sr: 'Serbisch',
  bs: 'Bosnisch',
  sq: 'Albanisch',
  ka: 'Georgisch',
  hy: 'Armenisch',
  zh: 'Chinesisch',
  hi: 'Hindi',
  ur: 'Urdu',
  bn: 'Bengalisch',
  am: 'Amharisch',
}

// Demo-Daten für Vorschau (werden in Produktion durch echte Session-Daten ersetzt)
const DEMO_ENTRIES: ProtocolEntry[] = [
  {
    id: '1',
    timestamp: Date.now() - 600000,
    speaker: 'clerk',
    originalText: 'Guten Morgen. Bitte zeigen Sie mir Ihren Reisepass.',
    translatedText: 'صباح الخير. من فضلك أرني جواز سفرك.',
    sourceLang: 'de',
    targetLang: 'ar',
  },
  {
    id: '2',
    timestamp: Date.now() - 540000,
    speaker: 'visitor',
    originalText: 'هذا جواز سفري. أريد تجديد تصريح الإقامة.',
    translatedText: 'Das ist mein Reisepass. Ich möchte meine Aufenthaltserlaubnis verlängern.',
    sourceLang: 'ar',
    targetLang: 'de',
  },
  {
    id: '3',
    timestamp: Date.now() - 480000,
    speaker: 'clerk',
    originalText: 'Wann läuft Ihre aktuelle Aufenthaltserlaubnis ab?',
    translatedText: 'متى تنتهي صلاحية تصريح إقامتك الحالي؟',
    sourceLang: 'de',
    targetLang: 'ar',
  },
  {
    id: '4',
    timestamp: Date.now() - 420000,
    speaker: 'visitor',
    originalText: 'تنتهي في الثلاثين من أبريل.',
    translatedText: 'Sie läuft am 30. April ab.',
    sourceLang: 'ar',
    targetLang: 'de',
  },
]

export default function SessionProtocolPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [entries, setEntries] = useState<ProtocolEntry[]>([])
  const [showLegalInfo, setShowLegalInfo] = useState(true)
  const [copied, setCopied] = useState(false)
  const [sessionMeta, setSessionMeta] = useState({
    date: new Date().toLocaleDateString('de-DE', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }),
    sessionId: `AT-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
    officerName: '',
    caseNumber: '',
    category: 'Aufenthaltserlaubnis',
    notes: '',
    consentGiven: false,
  })

  // Lade Session-Daten aus Location-State oder Demo-Daten
  useEffect(() => {
    const stateEntries = (location.state as { entries?: ProtocolEntry[] })?.entries
    setEntries(stateEntries || DEMO_ENTRIES)
  }, [location.state])

  const clerkEntries = entries.filter((e) => e.speaker === 'clerk')
  const visitorEntries = entries.filter((e) => e.speaker === 'visitor')
  const duration = entries.length > 0
    ? Math.round((entries[entries.length - 1].timestamp - entries[0].timestamp) / 60000)
    : 0

  const generateTextProtocol = (includeOriginal = false): string => {
    const lines = [
      '═══════════════════════════════════════════',
      '   GESPRÄCHSPROTOKOLL — AmtTranslator',
      '═══════════════════════════════════════════',
      '',
      `Datum:          ${sessionMeta.date}`,
      `Session-ID:     ${sessionMeta.sessionId}`,
      sessionMeta.officerName ? `Sachbearbeiter: ${sessionMeta.officerName}` : '',
      sessionMeta.caseNumber ? `Aktenzeichen:   ${sessionMeta.caseNumber}` : '',
      `Kategorie:      ${sessionMeta.category}`,
      `Dauer:          ${duration} Minuten`,
      `Sprachen:       Deutsch ↔ ${LANG_NAMES[entries[0]?.targetLang] || entries[0]?.targetLang || '–'}`,
      '',
      '─── RECHTLICHER HINWEIS ────────────────────',
      'Dieses Protokoll enthält maschinelle Übersetzungen.',
      'Es dient als Arbeitshilfe, nicht als Beweismittel.',
      includeOriginal
        ? 'Einwilligung zur Protokollierung liegt vor (Art. 9 Abs. 2 lit. a DSGVO).'
        : 'Protokoll enthält nur Übersetzungen ins Deutsche.',
      '────────────────────────────────────────────',
      '',
      '─── GESPRÄCHSVERLAUF ───────────────────────',
      '',
    ]

    entries.forEach((entry) => {
      const time = new Date(entry.timestamp).toLocaleTimeString('de-DE', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      })
      const speaker = entry.speaker === 'clerk' ? 'SB' : 'BÜ'
      if (includeOriginal) {
        lines.push(`[${time}] ${speaker}: ${entry.originalText}`)
        lines.push(`         → ${entry.translatedText}`)
      } else {
        // Nur die deutsche Übersetzung (für Bürger-Aussagen) oder Original (für SB-Aussagen)
        if (entry.speaker === 'visitor') {
          lines.push(`[${time}] BÜ (übersetzt): ${entry.translatedText}`)
        } else {
          lines.push(`[${time}] SB: ${entry.originalText}`)
        }
      }
      lines.push('')
    })

    if (sessionMeta.notes) {
      lines.push('─── NOTIZEN ────────────────────────────────')
      lines.push(sessionMeta.notes)
      lines.push('')
    }

    lines.push('─── ABSCHLUSS ──────────────────────────────')
    lines.push(`Protokoll erstellt: ${new Date().toLocaleString('de-DE')}`)
    lines.push('Erstellt mit AmtTranslator (www.amttranslator.de)')
    lines.push('Maschinelle Übersetzung — kein amtliches Dokument')

    return lines.filter((l) => l !== null).join('\n')
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(generateTextProtocol())
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownload = () => {
    const text = generateTextProtocol(sessionMeta.consentGiven)
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `protokoll-${sessionMeta.sessionId}-${new Date().toISOString().split('T')[0]}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handlePrint = () => window.print()

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-1" />
          Zurück
        </Button>
        <div className="flex-1">
          <h1 className="text-xl font-bold">Gesprächsprotokoll</h1>
          <p className="text-sm text-muted-foreground">{sessionMeta.sessionId} · {sessionMeta.date}</p>
        </div>
        <div className="flex gap-2 print:hidden">
          <Button variant="outline" size="sm" onClick={handleCopy}>
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          </Button>
          <Button variant="outline" size="sm" onClick={handlePrint}>
            <Printer className="h-4 w-4" />
          </Button>
          <Button size="sm" className="bg-teal-700 hover:bg-teal-800" onClick={handleDownload}>
            <Download className="h-4 w-4 mr-1" />
            Herunterladen
          </Button>
        </div>
      </div>

      {/* Rechtlicher Hinweis */}
      <Card className="border-orange-200 bg-orange-50 print:hidden">
        <button
          className="w-full p-4 flex items-start gap-3 text-left"
          onClick={() => setShowLegalInfo(!showLegalInfo)}
        >
          <AlertTriangle className="h-5 w-5 text-orange-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold text-orange-900">Rechtlicher Hinweis zur Protokollierung</p>
            {showLegalInfo && (
              <div className="mt-2 text-sm text-orange-800 space-y-2">
                <p>
                  <strong>Darf ich das Gespräch protokollieren?</strong> Ja, mit Einschränkungen.
                  Als Sachbearbeiter dürfen Sie Ihre eigenen Fragen und die deutschen Übersetzungen
                  der Bürger-Aussagen für Ihre Aktennotiz verwenden (§ 24 VwVfG).
                </p>
                <p>
                  <strong>Was ist NICHT erlaubt:</strong> Das vollständige Gesprächsprotokoll
                  (inkl. Originalaussagen in der Fremdsprache) darf nur mit ausdrücklicher
                  Einwilligung des Bürgers gespeichert werden (Art. 9 DSGVO, da ggf. besondere
                  Kategorien betroffen sind).
                </p>
                <p>
                  <strong>Standard-Export:</strong> Enthält nur Ihre Fragen (Deutsch) und die
                  deutschen Übersetzungen der Bürger-Antworten — datenschutzkonform ohne Einwilligung.
                </p>
              </div>
            )}
          </div>
          {showLegalInfo ? (
            <ChevronUp className="h-4 w-4 text-orange-600 shrink-0" />
          ) : (
            <ChevronDown className="h-4 w-4 text-orange-600 shrink-0" />
          )}
        </button>
      </Card>

      {/* Session-Metadaten */}
      <Card className="p-5 space-y-4">
        <h2 className="font-semibold flex items-center gap-2">
          <FileText className="h-4 w-4 text-teal-600" />
          Protokoll-Details
        </h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <label className="text-muted-foreground block mb-1">Sachbearbeiter (optional)</label>
            <input
              type="text"
              value={sessionMeta.officerName}
              onChange={(e) => setSessionMeta((s) => ({ ...s, officerName: e.target.value }))}
              placeholder="Name / Kürzel"
              className="w-full px-3 py-2 rounded-lg border bg-background text-sm"
            />
          </div>
          <div>
            <label className="text-muted-foreground block mb-1">Aktenzeichen (optional)</label>
            <input
              type="text"
              value={sessionMeta.caseNumber}
              onChange={(e) => setSessionMeta((s) => ({ ...s, caseNumber: e.target.value }))}
              placeholder="z.B. 2024-AE-00123"
              className="w-full px-3 py-2 rounded-lg border bg-background text-sm"
            />
          </div>
          <div>
            <label className="text-muted-foreground block mb-1">Kategorie</label>
            <select
              value={sessionMeta.category}
              onChange={(e) => setSessionMeta((s) => ({ ...s, category: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg border bg-background text-sm"
            >
              {[
                'Aufenthaltserlaubnis',
                'Niederlassungserlaubnis',
                'Asylantrag',
                'Familiennachzug',
                'Arbeitserlaubnis',
                'Einbürgerung',
                'Duldung',
                'Passverlängerung',
                'Erstvorsprache',
                'Sonstiges',
              ].map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-3 pt-5">
            <input
              type="checkbox"
              id="consent"
              checked={sessionMeta.consentGiven}
              onChange={(e) => setSessionMeta((s) => ({ ...s, consentGiven: e.target.checked }))}
              className="h-4 w-4 rounded border-gray-300"
            />
            <label htmlFor="consent" className="text-sm">
              Einwilligung des Bürgers liegt vor
              <span className="block text-xs text-muted-foreground">
                (für vollständiges Protokoll inkl. Originalaussagen)
              </span>
            </label>
          </div>
        </div>
        <div>
          <label className="text-muted-foreground block mb-1 text-sm">Notizen</label>
          <textarea
            value={sessionMeta.notes}
            onChange={(e) => setSessionMeta((s) => ({ ...s, notes: e.target.value }))}
            placeholder="Zusätzliche Notizen für die Akte..."
            rows={3}
            className="w-full px-3 py-2 rounded-lg border bg-background text-sm resize-none"
          />
        </div>
      </Card>

      {/* Statistiken */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="p-4 text-center">
          <Languages className="h-5 w-5 text-teal-600 mx-auto mb-1" />
          <p className="text-2xl font-bold">{entries.length}</p>
          <p className="text-xs text-muted-foreground">Übersetzungen</p>
        </Card>
        <Card className="p-4 text-center">
          <Clock className="h-5 w-5 text-blue-600 mx-auto mb-1" />
          <p className="text-2xl font-bold">{duration}</p>
          <p className="text-xs text-muted-foreground">Minuten</p>
        </Card>
        <Card className="p-4 text-center">
          <Shield className="h-5 w-5 text-green-600 mx-auto mb-1" />
          <p className="text-2xl font-bold">100%</p>
          <p className="text-xs text-muted-foreground">Offline verarbeitet</p>
        </Card>
      </div>

      {/* Gesprächsverlauf */}
      <Card className="p-5 space-y-4">
        <h2 className="font-semibold">Gesprächsverlauf</h2>
        <div className="space-y-3">
          {entries.map((entry) => {
            const time = new Date(entry.timestamp).toLocaleTimeString('de-DE', {
              hour: '2-digit',
              minute: '2-digit',
            })
            const isClerk = entry.speaker === 'clerk'
            return (
              <div
                key={entry.id}
                className={`flex gap-3 ${isClerk ? '' : 'flex-row-reverse'}`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                    isClerk
                      ? 'bg-teal-100 text-teal-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}
                >
                  {isClerk ? 'SB' : 'BÜ'}
                </div>
                <div
                  className={`flex-1 rounded-xl p-3 text-sm ${
                    isClerk
                      ? 'bg-teal-50 border border-teal-100'
                      : 'bg-blue-50 border border-blue-100'
                  }`}
                >
                  <p className="font-medium text-xs text-muted-foreground mb-1">
                    {isClerk ? 'Sachbearbeiter' : 'Bürger'} · {time}
                  </p>
                  <p>{isClerk ? entry.originalText : entry.translatedText}</p>
                  {sessionMeta.consentGiven && (
                    <p className="mt-1 text-xs text-muted-foreground italic">
                      Original: {isClerk ? entry.translatedText : entry.originalText}
                    </p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </Card>

      {/* Export-Buttons */}
      <div className="flex gap-3 print:hidden">
        <Button
          className="flex-1 bg-teal-700 hover:bg-teal-800"
          onClick={handleDownload}
        >
          <Download className="h-4 w-4 mr-2" />
          {sessionMeta.consentGiven ? 'Vollständiges Protokoll' : 'Protokoll (DSGVO-konform)'} herunterladen
        </Button>
        <Button variant="outline" onClick={handlePrint}>
          <Printer className="h-4 w-4 mr-2" />
          Drucken
        </Button>
      </div>

      <p className="text-xs text-center text-muted-foreground print:hidden">
        Maschinelle Übersetzung — kein amtliches Dokument · AmtTranslator v1.0
      </p>
    </div>
  )
}
