/**
 * Asylum Workflow Page — Authority Clerk (Ausländerbehörde)
 *
 * Guided workflow for asylum and residence permit procedures.
 * Provides step-by-step checklists, required documents, and
 * pre-translated phrases for each step of the process.
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
  Shield,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Clipboard,
  Check,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import OfflineModeIndicator from '@/components/market/OfflineModeIndicator'

// ── Workflow definitions ──────────────────────────────────────

interface WorkflowStep {
  id: string
  title: string
  description: string
  requiredDocs: string[]
  keyPhrases: string[]
  legalBasis?: string
  warning?: string
}

const ASYLUM_WORKFLOWS: { id: string; title: string; icon: string; steps: WorkflowStep[] }[] = [
  {
    id: 'aufenthaltstitel-verlaengerung',
    title: 'Aufenthaltstitel verlängern',
    icon: '🪪',
    steps: [
      {
        id: 'step-1',
        title: 'Identität prüfen',
        description: 'Reisepass und bestehenden Aufenthaltstitel prüfen. Ablaufdatum notieren.',
        requiredDocs: ['Gültiger Reisepass oder Reiseausweis', 'Aktueller Aufenthaltstitel', 'Biometrisches Passfoto (aktuell, max. 6 Monate alt)'],
        keyPhrases: [
          'Bitte zeigen Sie mir Ihren Reisepass.',
          'Ihr Aufenthaltstitel läuft am ... ab.',
          'Das Foto muss aktuell sein — nicht älter als 6 Monate.',
        ],
        legalBasis: '§ 81 AufenthG — Antragstellung vor Ablauf',
      },
      {
        id: 'step-2',
        title: 'Lebensunterhalt prüfen',
        description: 'Nachweis der eigenständigen Sicherung des Lebensunterhalts.',
        requiredDocs: ['Aktuelle Gehaltsabrechnungen (letzte 3 Monate)', 'Arbeitsvertrag oder Gewerbeanmeldung', 'Kontoauszüge (letzte 3 Monate)', 'Ggf. Bürgschaftserklärung'],
        keyPhrases: [
          'Können Sie Ihren Lebensunterhalt selbst sichern?',
          'Bitte bringen Sie Ihre Gehaltsabrechnungen der letzten 3 Monate mit.',
          'Haben Sie einen gültigen Arbeitsvertrag?',
        ],
        legalBasis: '§ 5 Abs. 1 Nr. 1 AufenthG — Lebensunterhaltssicherung',
        warning: 'Bei Bezug von Sozialleistungen kann die Verlängerung verweigert werden.',
      },
      {
        id: 'step-3',
        title: 'Wohnsituation prüfen',
        description: 'Ausreichender Wohnraum muss nachgewiesen werden.',
        requiredDocs: ['Aktueller Mietvertrag', 'Ggf. Wohnraumnachweis bei Untermiete', 'Meldebestätigung'],
        keyPhrases: [
          'Bitte zeigen Sie mir Ihren Mietvertrag.',
          'Wie viele Personen wohnen in der Wohnung?',
          'Sind Sie dort angemeldet?',
        ],
        legalBasis: '§ 2 Abs. 4 AufenthG — Ausreichender Wohnraum',
      },
      {
        id: 'step-4',
        title: 'Antrag aufnehmen',
        description: 'Antrag auf Verlängerung formell aufnehmen und Fiktionsbescheinigung ausstellen.',
        requiredDocs: ['Ausgefülltes Antragsformular', 'Alle geprüften Unterlagen', 'Gebührennachweis (§ 45 AufenthV)'],
        keyPhrases: [
          'Ich nehme jetzt Ihren Antrag auf.',
          'Sie erhalten eine Fiktionsbescheinigung — damit dürfen Sie bis zur Entscheidung bleiben.',
          'Die Bearbeitungszeit beträgt ca. 6–8 Wochen.',
          'Bitte bezahlen Sie die Gebühr von ... Euro an der Kasse.',
        ],
        legalBasis: '§ 81 Abs. 3 AufenthG — Fiktionswirkung',
      },
    ],
  },
  {
    id: 'niederlassungserlaubnis',
    title: 'Niederlassungserlaubnis',
    icon: '🏠',
    steps: [
      {
        id: 'step-1',
        title: 'Aufenthaltsdauer prüfen',
        description: 'Mindestens 5 Jahre rechtmäßiger Aufenthalt mit Aufenthaltserlaubnis.',
        requiredDocs: ['Alle bisherigen Aufenthaltstitel', 'Lückenloser Nachweis des Aufenthalts'],
        keyPhrases: [
          'Seit wann leben Sie in Deutschland?',
          'Haben Sie alle Ihre bisherigen Aufenthaltstitel dabei?',
          'Gab es Unterbrechungen Ihres Aufenthalts?',
        ],
        legalBasis: '§ 9 AufenthG — Niederlassungserlaubnis',
      },
      {
        id: 'step-2',
        title: 'Deutschkenntnisse prüfen',
        description: 'Ausreichende Kenntnisse der deutschen Sprache (Niveau B1).',
        requiredDocs: ['Deutschzertifikat (mind. B1)', 'Alternativ: Schulabschluss in Deutschland', 'Alternativ: Studienabschluss in Deutschland'],
        keyPhrases: [
          'Haben Sie ein Deutschzertifikat?',
          'Welches Niveau haben Sie — A1, A2, B1 oder höher?',
          'Haben Sie in Deutschland die Schule besucht?',
        ],
        legalBasis: '§ 9 Abs. 2 Nr. 7 AufenthG — Sprachkenntnisse',
        warning: 'Ausnahmen möglich bei körperlicher/geistiger Behinderung oder Krankheit.',
      },
      {
        id: 'step-3',
        title: 'Grundkenntnisse Rechtsordnung',
        description: 'Grundkenntnisse der Rechts- und Gesellschaftsordnung sowie der Lebensverhältnisse.',
        requiredDocs: ['Integrationskurs-Zertifikat', 'Alternativ: Einbürgerungstest-Nachweis'],
        keyPhrases: [
          'Haben Sie einen Integrationskurs abgeschlossen?',
          'Haben Sie das Zertifikat dabei?',
        ],
        legalBasis: '§ 9 Abs. 2 Nr. 8 AufenthG — Grundkenntnisse',
      },
    ],
  },
  {
    id: 'erstregistrierung',
    title: 'Erstregistrierung Asylbewerber',
    icon: '📋',
    steps: [
      {
        id: 'step-1',
        title: 'Identität feststellen',
        description: 'Alle verfügbaren Identitätsdokumente erfassen.',
        requiredDocs: ['Reisepass (falls vorhanden)', 'Personalausweis (falls vorhanden)', 'Sonstige Identitätsdokumente', 'Ggf. Geburtsurkunde'],
        keyPhrases: [
          'Haben Sie einen Reisepass oder Ausweis?',
          'Woher kommen Sie?',
          'Wann sind Sie in Deutschland angekommen?',
          'Reisen Sie alleine oder mit Familie?',
        ],
        legalBasis: '§ 16 AsylG — Registrierung',
        warning: 'Fehlende Dokumente sind kein Ausschlussgrund. Asylantrag trotzdem aufnehmen.',
      },
      {
        id: 'step-2',
        title: 'Fingerabdrücke und Foto',
        description: 'Erkennungsdienstliche Behandlung nach § 16 AsylG.',
        requiredDocs: ['Keine Dokumente erforderlich'],
        keyPhrases: [
          'Wir müssen jetzt Ihre Fingerabdrücke nehmen.',
          'Das ist gesetzlich vorgeschrieben.',
          'Bitte legen Sie Ihren Finger auf das Gerät.',
          'Jetzt machen wir ein Foto von Ihnen.',
        ],
        legalBasis: '§ 16 Abs. 1 AsylG — Erkennungsdienstliche Behandlung',
      },
      {
        id: 'step-3',
        title: 'Ankunftsnachweis ausstellen',
        description: 'Ankunftsnachweis (AKN) ausstellen und erklären.',
        requiredDocs: ['Ausgefülltes Registrierungsformular'],
        keyPhrases: [
          'Das ist Ihr Ankunftsnachweis.',
          'Bewahren Sie dieses Dokument gut auf.',
          'Damit können Sie Leistungen nach dem AsylbLG beantragen.',
          'Sie werden einer Unterkunft zugewiesen.',
        ],
        legalBasis: '§ 63a AsylG — Ankunftsnachweis',
      },
    ],
  },
]

// ── Component ─────────────────────────────────────────────────

export default function AsylumWorkflowPage() {
  const navigate = useNavigate()
  const [selectedWorkflow, setSelectedWorkflow] = useState<string | null>(null)
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set())
  const [expandedStep, setExpandedStep] = useState<string | null>(null)
  const [copiedPhrase, setCopiedPhrase] = useState<string | null>(null)

  const workflow = ASYLUM_WORKFLOWS.find((w) => w.id === selectedWorkflow)

  const toggleStep = (stepId: string) => {
    setCompletedSteps((prev) => {
      const next = new Set(prev)
      if (next.has(stepId)) next.delete(stepId)
      else next.add(stepId)
      return next
    })
  }

  const handleCopyPhrase = (phrase: string) => {
    navigator.clipboard.writeText(phrase).catch(() => {})
    setCopiedPhrase(phrase)
    setTimeout(() => setCopiedPhrase(null), 2000)
  }

  const handleSpeakPhrase = (phrase: string) => {
    navigate('/translator', { state: { prefill: phrase } })
  }

  if (!selectedWorkflow) {
    return (
      <div className="max-w-lg mx-auto py-8 px-4 space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold">Verfahrens-Workflows</h1>
            <p className="text-sm text-muted-foreground">
              Schritt-für-Schritt-Anleitungen für häufige Verfahren
            </p>
          </div>
        </div>

        <OfflineModeIndicator compact />

        <div className="space-y-3">
          {ASYLUM_WORKFLOWS.map((wf) => (
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
                    <p className="text-xs text-muted-foreground">{wf.steps.length} Schritte</p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </Card>
          ))}
        </div>

        <Card className="p-4 bg-teal-50/50 dark:bg-teal-900/10 border-teal-200 dark:border-teal-800">
          <div className="flex items-start gap-2">
            <Shield className="h-4 w-4 mt-0.5 text-teal-600 shrink-0" />
            <p className="text-xs text-muted-foreground">
              Alle Verfahrenshinweise basieren auf dem aktuellen Aufenthaltsgesetz (AufenthG) und
              Asylgesetz (AsylG). Für rechtliche Beratung wenden Sie sich bitte an einen
              zugelassenen Rechtsanwalt.
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
            {completedSteps.size} / {workflow?.steps.length} Schritte abgeschlossen
          </p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-muted rounded-full h-2">
        <div
          className="bg-teal-600 h-2 rounded-full transition-all"
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
                isCompleted ? 'border-teal-200 dark:border-teal-800 bg-teal-50/30 dark:bg-teal-900/10' : ''
              }`}
            >
              {/* Step header */}
              <div
                className="p-4 cursor-pointer"
                onClick={() => setExpandedStep(isExpanded ? null : step.id)}
              >
                <div className="flex items-start gap-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      toggleStep(step.id)
                    }}
                    className="mt-0.5 shrink-0"
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="h-5 w-5 text-teal-600" />
                    ) : (
                      <Circle className="h-5 w-5 text-muted-foreground" />
                    )}
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-muted-foreground">
                        Schritt {index + 1}
                      </span>
                      {step.legalBasis && (
                        <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-1.5 py-0.5 rounded">
                          {step.legalBasis.split(' — ')[0]}
                        </span>
                      )}
                    </div>
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

              {/* Expanded content */}
              {isExpanded && (
                <div className="px-4 pb-4 space-y-4 border-t">
                  {/* Warning */}
                  {step.warning && (
                    <div className="flex items-start gap-2 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-lg p-3 mt-3">
                      <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                      <p className="text-xs text-amber-800 dark:text-amber-400">{step.warning}</p>
                    </div>
                  )}

                  {/* Required documents */}
                  <div>
                    <div className="flex items-center gap-1.5 mb-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Erforderliche Unterlagen
                      </p>
                    </div>
                    <div className="space-y-1">
                      {step.requiredDocs.map((doc) => (
                        <div key={doc} className="flex items-start gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-teal-600 mt-1.5 shrink-0" />
                          <p className="text-sm">{doc}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Key phrases */}
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
                          className="flex items-start gap-2 bg-muted/50 rounded-lg p-2.5"
                        >
                          <p className="text-sm flex-1">{phrase}</p>
                          <div className="flex gap-1 shrink-0">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => handleCopyPhrase(phrase)}
                              title="Kopieren"
                            >
                              {copiedPhrase === phrase ? (
                                <Check className="h-3 w-3 text-teal-600" />
                              ) : (
                                <Clipboard className="h-3 w-3" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => handleSpeakPhrase(phrase)}
                              title="Übersetzen"
                            >
                              <MessageSquare className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Legal basis */}
                  {step.legalBasis && (
                    <div className="flex items-start gap-2 bg-blue-50/50 dark:bg-blue-900/10 rounded-lg p-2.5">
                      <Shield className="h-3.5 w-3.5 text-blue-600 shrink-0 mt-0.5" />
                      <p className="text-xs text-blue-700 dark:text-blue-400">
                        <strong>Rechtsgrundlage:</strong> {step.legalBasis}
                      </p>
                    </div>
                  )}

                  {/* Mark complete button */}
                  <Button
                    variant={isCompleted ? 'outline' : 'default'}
                    size="sm"
                    className={`w-full ${!isCompleted ? 'bg-teal-700 hover:bg-teal-800' : ''}`}
                    onClick={() => toggleStep(step.id)}
                  >
                    {isCompleted ? (
                      <>
                        <Circle className="h-4 w-4 mr-2" />
                        Als offen markieren
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Schritt abgeschlossen
                      </>
                    )}
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
