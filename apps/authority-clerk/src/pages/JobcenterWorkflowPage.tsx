/**
 * Jobcenter Workflow Page — Authority Clerk
 *
 * Guided workflows for Jobcenter / Bundesagentur für Arbeit procedures.
 * Covers Bürgergeld, Arbeitsvermittlung, Qualifizierung.
 * Broadcasting-optimized for group information sessions.
 */

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Circle,
  FileText,
  MessageSquare,
  Users,
  Briefcase,
  GraduationCap,
  Euro,
  ChevronDown,
  ChevronUp,
  Radio,
  Shield,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import OfflineModeIndicator from '@/components/market/OfflineModeIndicator'

// ── Jobcenter-specific quick phrases ─────────────────────────

export const JOBCENTER_PHRASES = [
  // Bürgergeld
  { id: 'j1', text: 'Haben Sie bereits Bürgergeld beantragt?', category: 'Bürgergeld' },
  { id: 'j2', text: 'Ihr Bürgergeld beträgt monatlich ... Euro.', category: 'Bürgergeld' },
  { id: 'j3', text: 'Sie müssen jeden Monat Ihre Kontoauszüge einreichen.', category: 'Bürgergeld' },
  { id: 'j4', text: 'Haben Sie Änderungen in Ihrer Lebenssituation?', category: 'Bürgergeld' },
  { id: 'j5', text: 'Bitte melden Sie Änderungen sofort — sonst müssen Sie Geld zurückzahlen.', category: 'Bürgergeld' },
  // Arbeit
  { id: 'j6', text: 'Suchen Sie aktiv nach Arbeit?', category: 'Arbeitsvermittlung' },
  { id: 'j7', text: 'Welche Berufsausbildung haben Sie?', category: 'Arbeitsvermittlung' },
  { id: 'j8', text: 'Haben Sie schon in Deutschland gearbeitet?', category: 'Arbeitsvermittlung' },
  { id: 'j9', text: 'Ich habe eine Stellenanzeige für Sie.', category: 'Arbeitsvermittlung' },
  { id: 'j10', text: 'Sie müssen sich auf diese Stelle bewerben.', category: 'Arbeitsvermittlung' },
  // Qualifizierung
  { id: 'j11', text: 'Wir empfehlen einen Deutschkurs für Sie.', category: 'Qualifizierung' },
  { id: 'j12', text: 'Es gibt eine Umschulung, die für Sie geeignet wäre.', category: 'Qualifizierung' },
  { id: 'j13', text: 'Die Kosten für den Kurs übernimmt das Jobcenter.', category: 'Qualifizierung' },
  // Termine
  { id: 'j14', text: 'Ihr nächster Termin ist am ...', category: 'Termine' },
  { id: 'j15', text: 'Sie müssen jeden Monat hier erscheinen.', category: 'Termine' },
  { id: 'j16', text: 'Wenn Sie den Termin nicht wahrnehmen, wird Ihr Geld gekürzt.', category: 'Termine' },
  { id: 'j17', text: 'Bitte melden Sie sich ab, wenn Sie den Termin nicht einhalten können.', category: 'Termine' },
]

// ── Workflow definitions ──────────────────────────────────────

const JOBCENTER_WORKFLOWS = [
  {
    id: 'buergergeld-erstantrag',
    title: 'Bürgergeld Erstantrag',
    icon: '💶',
    description: 'Erstmalige Beantragung von Bürgergeld nach SGB II',
    steps: [
      {
        id: 'step-1',
        title: 'Antragsberechtigung prüfen',
        description: 'Erwerbsfähigkeit, Hilfebedürftigkeit und gewöhnlicher Aufenthalt prüfen.',
        requiredDocs: ['Personalausweis oder Reisepass', 'Aufenthaltstitel (bei ausländischen Staatsangehörigen)', 'Meldebestätigung'],
        keyPhrases: [
          'Können Sie grundsätzlich arbeiten — mindestens 3 Stunden täglich?',
          'Haben Sie Ersparnisse oder Vermögen über 15.000 Euro?',
          'Sind Sie in Deutschland gemeldet?',
        ],
        legalBasis: '§ 7 SGB II — Leistungsberechtigte',
        warning: 'Ausländer ohne dauerhaftes Aufenthaltsrecht können ggf. nur Leistungen nach AsylbLG erhalten.',
      },
      {
        id: 'step-2',
        title: 'Einkommensverhältnisse erfassen',
        description: 'Alle Einkommensquellen und Vermögenswerte erfassen.',
        requiredDocs: ['Kontoauszüge (letzte 3 Monate)', 'Gehaltsabrechnungen / Rentenbescheide', 'Ggf. Unterhaltsnachweise', 'Ggf. Kindergeldbescheid'],
        keyPhrases: [
          'Haben Sie ein Einkommen? Zum Beispiel aus Arbeit, Rente oder Unterhalt?',
          'Haben Sie Ersparnisse auf dem Konto?',
          'Haben Sie ein Auto? Welchen Wert hat es?',
        ],
        legalBasis: '§ 11 SGB II — Zu berücksichtigendes Einkommen',
      },
      {
        id: 'step-3',
        title: 'Wohnkosten erfassen',
        description: 'Kosten der Unterkunft und Heizung prüfen und Angemessenheit prüfen.',
        requiredDocs: ['Aktueller Mietvertrag', 'Letzte Nebenkostenabrechnung', 'Ggf. Heizkostenabrechnung'],
        keyPhrases: [
          'Wie hoch ist Ihre monatliche Miete?',
          'Sind Nebenkosten darin enthalten?',
          'Wer wohnt noch in der Wohnung?',
        ],
        legalBasis: '§ 22 SGB II — Kosten der Unterkunft und Heizung',
        warning: 'Unangemessen hohe Mieten werden nur für 6 Monate übernommen. Danach Pflicht zur Kostensenkung.',
      },
      {
        id: 'step-4',
        title: 'Eingliederungsvereinbarung',
        description: 'Gemeinsame Vereinbarung über Schritte zur Arbeitsaufnahme treffen.',
        requiredDocs: ['Lebenslauf (falls vorhanden)', 'Zeugnisse und Qualifikationsnachweise'],
        keyPhrases: [
          'Wir vereinbaren jetzt gemeinsam, was Sie tun müssen, um Arbeit zu finden.',
          'Sie verpflichten sich, sich auf mindestens ... Stellen pro Monat zu bewerben.',
          'Das Jobcenter unterstützt Sie mit ... .',
          'Bitte unterschreiben Sie hier.',
        ],
        legalBasis: '§ 15 SGB II — Potenzialanalyse und Kooperationsplan',
      },
    ],
  },
  {
    id: 'arbeitsvermittlung',
    title: 'Arbeitsvermittlung',
    icon: '💼',
    description: 'Beratung und Vermittlung in Arbeit',
    steps: [
      {
        id: 'step-1',
        title: 'Berufsbiografie erfassen',
        description: 'Bisherige Berufserfahrung, Ausbildungen und Qualifikationen erfassen.',
        requiredDocs: ['Lebenslauf', 'Zeugnisse und Zertifikate', 'Ggf. ausländische Berufsabschlüsse'],
        keyPhrases: [
          'Was haben Sie in Ihrem Heimatland gearbeitet?',
          'Haben Sie eine Berufsausbildung oder ein Studium abgeschlossen?',
          'Haben Sie Ihre Zeugnisse dabei?',
          'Möchten Sie Ihren ausländischen Abschluss anerkennen lassen?',
        ],
        legalBasis: '§ 35 SGB III — Arbeitsvermittlung',
      },
      {
        id: 'step-2',
        title: 'Stellenangebote besprechen',
        description: 'Passende Stellenangebote vorstellen und Bewerbungsunterlagen besprechen.',
        requiredDocs: ['Aktueller Lebenslauf auf Deutsch', 'Anschreiben-Vorlage'],
        keyPhrases: [
          'Ich habe eine passende Stelle für Sie gefunden.',
          'Die Stelle ist als ... bei der Firma ... in ... .',
          'Das Gehalt beträgt ca. ... Euro brutto.',
          'Können Sie dort arbeiten?',
          'Sie müssen sich bis zum ... bewerben.',
        ],
        legalBasis: '§ 38 SGB III — Pflichten bei Arbeitsuche',
        warning: 'Ablehnung zumutbarer Stellen kann zu Leistungsminderung führen (§ 31 SGB II).',
      },
    ],
  },
  {
    id: 'gruppeninfo',
    title: 'Gruppeninformation (Broadcasting)',
    icon: '📡',
    description: 'Informationsveranstaltung für mehrere Teilnehmer gleichzeitig',
    steps: [
      {
        id: 'step-1',
        title: 'Session starten',
        description: 'Live-Übersetzungs-Session für alle Teilnehmer starten. QR-Code anzeigen.',
        requiredDocs: [],
        keyPhrases: [
          'Willkommen zur Informationsveranstaltung.',
          'Bitte scannen Sie den QR-Code mit Ihrem Smartphone.',
          'Wählen Sie Ihre Sprache aus.',
          'Sie sehen dann die Übersetzung auf Ihrem Gerät.',
        ],
        legalBasis: '',
      },
      {
        id: 'step-2',
        title: 'Bürgergeld-Grundlagen erklären',
        description: 'Grundlegende Informationen zu Bürgergeld, Pflichten und Rechten.',
        requiredDocs: ['Informationsblatt (mehrsprachig)'],
        keyPhrases: [
          'Bürgergeld ist eine staatliche Unterstützung für Menschen, die keine Arbeit haben.',
          'Sie erhalten monatlich Geld für Ihren Lebensunterhalt.',
          'Im Gegenzug müssen Sie aktiv nach Arbeit suchen.',
          'Wenn Sie Arbeit finden, bekommen Sie mehr Geld als Bürgergeld.',
        ],
        legalBasis: '§ 1 SGB II — Aufgabe und Ziel',
      },
      {
        id: 'step-3',
        title: 'Pflichten erklären',
        description: 'Mitwirkungspflichten und Konsequenzen bei Nichterfüllung erklären.',
        requiredDocs: [],
        keyPhrases: [
          'Sie müssen zu allen Terminen erscheinen.',
          'Sie müssen sich aktiv um Arbeit bemühen.',
          'Sie müssen alle Änderungen sofort melden.',
          'Wenn Sie diese Pflichten nicht erfüllen, wird Ihr Geld gekürzt.',
        ],
        legalBasis: '§ 31 SGB II — Pflichtverletzungen',
        warning: 'Sanktionen müssen klar und verständlich erklärt werden. Bei Sprachbarrieren: Schriftliche Übersetzung aushändigen.',
      },
    ],
  },
]

// ── Component ─────────────────────────────────────────────────

export default function JobcenterWorkflowPage() {
  const navigate = useNavigate()
  const [selectedWorkflow, setSelectedWorkflow] = useState<string | null>(null)
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set())
  const [expandedStep, setExpandedStep] = useState<string | null>(null)

  const workflow = JOBCENTER_WORKFLOWS.find((w) => w.id === selectedWorkflow)

  const toggleStep = (stepId: string) => {
    setCompletedSteps((prev) => {
      const next = new Set(prev)
      if (next.has(stepId)) next.delete(stepId)
      else next.add(stepId)
      return next
    })
  }

  const handleSpeakPhrase = (phrase: string) => {
    navigate('/translator', { state: { prefill: phrase } })
  }

  const handleStartBroadcast = () => {
    navigate('/live')
  }

  if (!selectedWorkflow) {
    return (
      <div className="max-w-lg mx-auto py-8 px-4 space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold">Jobcenter-Workflows</h1>
            <p className="text-sm text-muted-foreground">
              SGB II / SGB III Verfahren mit Übersetzungsunterstützung
            </p>
          </div>
        </div>

        <OfflineModeIndicator compact />

        {/* Broadcasting shortcut */}
        <Card
          className="p-4 cursor-pointer border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-900/10 hover:bg-blue-100/50 transition-colors"
          onClick={handleStartBroadcast}
        >
          <div className="flex items-center gap-3">
            <Radio className="h-6 w-6 text-blue-600" />
            <div className="flex-1">
              <p className="font-semibold">Gruppeninfo starten</p>
              <p className="text-xs text-muted-foreground">
                Live-Übersetzung für mehrere Teilnehmer gleichzeitig
              </p>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
          </div>
        </Card>

        <div className="space-y-3">
          {JOBCENTER_WORKFLOWS.map((wf) => (
            <Card
              key={wf.id}
              className="p-4 cursor-pointer hover:bg-accent transition-colors"
              onClick={() => setSelectedWorkflow(wf.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{wf.icon}</span>
                  <div>
                    <p className="font-semibold">{wf.title}</p>
                    <p className="text-xs text-muted-foreground">{wf.description}</p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </Card>
          ))}
        </div>

        <Card className="p-4 bg-amber-50/50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-800">
          <div className="flex items-start gap-2">
            <Shield className="h-4 w-4 mt-0.5 text-amber-600 shrink-0" />
            <p className="text-xs text-muted-foreground">
              Alle Verfahrenshinweise basieren auf SGB II und SGB III. Rechtliche Änderungen
              werden regelmäßig aktualisiert. Stand: 2025.
            </p>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto py-8 px-4 space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => setSelectedWorkflow(null)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-xl font-bold">{workflow?.title}</h1>
          <p className="text-sm text-muted-foreground">
            {completedSteps.size} / {workflow?.steps.length} Schritte
          </p>
        </div>
      </div>

      <div className="w-full bg-muted rounded-full h-2">
        <div
          className="bg-blue-600 h-2 rounded-full transition-all"
          style={{
            width: `${workflow ? (completedSteps.size / workflow.steps.length) * 100 : 0}%`,
          }}
        />
      </div>

      <div className="space-y-3">
        {workflow?.steps.map((step, index) => {
          const isCompleted = completedSteps.has(step.id)
          const isExpanded = expandedStep === step.id

          return (
            <Card
              key={step.id}
              className={`overflow-hidden transition-colors ${
                isCompleted ? 'border-blue-200 dark:border-blue-800 bg-blue-50/30 dark:bg-blue-900/10' : ''
              }`}
            >
              <div
                className="p-4 cursor-pointer"
                onClick={() => setExpandedStep(isExpanded ? null : step.id)}
              >
                <div className="flex items-start gap-3">
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleStep(step.id) }}
                    className="mt-0.5 shrink-0"
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="h-5 w-5 text-blue-600" />
                    ) : (
                      <Circle className="h-5 w-5 text-muted-foreground" />
                    )}
                  </button>
                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-bold text-muted-foreground">Schritt {index + 1}</span>
                    <p className="font-semibold mt-0.5">{step.title}</p>
                    <p className="text-sm text-muted-foreground mt-1">{step.description}</p>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
                  )}
                </div>
              </div>

              {isExpanded && (
                <div className="px-4 pb-4 space-y-4 border-t">
                  {step.requiredDocs.length > 0 && (
                    <div className="mt-3">
                      <div className="flex items-center gap-1.5 mb-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          Unterlagen
                        </p>
                      </div>
                      <div className="space-y-1">
                        {step.requiredDocs.map((doc) => (
                          <div key={doc} className="flex items-start gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 shrink-0" />
                            <p className="text-sm">{doc}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <div className="flex items-center gap-1.5 mb-2">
                      <MessageSquare className="h-4 w-4 text-muted-foreground" />
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Schlüsselsätze
                      </p>
                    </div>
                    <div className="space-y-2">
                      {step.keyPhrases.map((phrase) => (
                        <div
                          key={phrase}
                          className="flex items-start gap-2 bg-muted/50 rounded-lg p-2.5 cursor-pointer hover:bg-muted transition-colors"
                          onClick={() => handleSpeakPhrase(phrase)}
                        >
                          <MessageSquare className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-0.5" />
                          <p className="text-sm">{phrase}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {step.warning && (
                    <div className="flex items-start gap-2 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
                      <Shield className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                      <p className="text-xs text-amber-800 dark:text-amber-400">{step.warning}</p>
                    </div>
                  )}

                  {step.legalBasis && (
                    <p className="text-xs text-muted-foreground">
                      <strong>Rechtsgrundlage:</strong> {step.legalBasis}
                    </p>
                  )}

                  <Button
                    variant={isCompleted ? 'outline' : 'default'}
                    size="sm"
                    className={`w-full ${!isCompleted ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
                    onClick={() => toggleStep(step.id)}
                  >
                    {isCompleted ? 'Als offen markieren' : 'Schritt abgeschlossen'}
                  </Button>
                </div>
              )}
            </Card>
          )
        })}
      </div>
    </div>
  )
}
