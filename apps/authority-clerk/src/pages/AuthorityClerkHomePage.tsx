/**
 * Authority Clerk Home Page — AmtTranslator
 *
 * Main screen for government office clerks.
 * Supports two modes: Ausländerbehörde and Jobcenter.
 * Optimized for desk/counter use with quick-access to all features.
 */

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Building2,
  Settings,
  MessageSquare,
  Zap,
  ArrowRight,
  Languages,
  FileText,
  Briefcase,
  ChevronDown,
  Radio,
  ClipboardList,
  WifiOff,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import SessionCodeInput from '@/components/live/SessionCodeInput'
import QuickPhrases, { AUTHORITY_PHRASES } from '@/components/market/QuickPhrases'
import PrivacyBanner from '@/components/market/PrivacyBanner'
import OfflineModeIndicator from '@/components/market/OfflineModeIndicator'
import { useI18n } from '@/context/I18nContext'
import { useUser } from '@/context/UserContext'

type OfficeMode = 'auslaenderbehoerde' | 'jobcenter' | null

const OFFICE_MODES = [
  {
    id: 'auslaenderbehoerde' as OfficeMode,
    label: 'Ausländerbehörde',
    icon: Building2,
    color: 'teal',
    description: 'Aufenthalt, Asyl, Einbürgerung',
  },
  {
    id: 'jobcenter' as OfficeMode,
    label: 'Jobcenter / BA',
    icon: Briefcase,
    color: 'blue',
    description: 'Bürgergeld, Arbeitsvermittlung',
  },
]

export default function AuthorityClerkHomePage() {
  const { t } = useI18n()
  const navigate = useNavigate()
  const { user } = useUser()
  const [activateCode, setActivateCode] = useState('')
  const [officeMode, setOfficeMode] = useState<OfficeMode>(null)
  const [showModeSelector, setShowModeSelector] = useState(false)

  const currentMode = OFFICE_MODES.find((m) => m.id === officeMode)
  const accentColor = officeMode === 'jobcenter' ? 'blue' : 'teal'

  const handleActivate = (code?: string) => {
    const sessionCode = code || activateCode
    if (!sessionCode.trim()) return
    navigate(`/live/${sessionCode.trim().toUpperCase()}`, {
      state: { role: 'speaker' },
    })
  }

  return (
    <div className="max-w-lg mx-auto py-8 px-4 space-y-5">
      {/* Header */}
      <div className="text-center space-y-2">
        <div
          className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl ${
            officeMode === 'jobcenter'
              ? 'bg-blue-100 dark:bg-blue-900/30'
              : 'bg-teal-100 dark:bg-teal-900/30'
          }`}
        >
          {officeMode === 'jobcenter' ? (
            <Briefcase className="h-7 w-7 text-blue-700 dark:text-blue-400" />
          ) : (
            <Building2 className="h-7 w-7 text-teal-700 dark:text-teal-400" />
          )}
        </div>
        <h1 className="text-2xl font-bold">AmtTranslator</h1>
        <p className="text-sm text-muted-foreground">
          {currentMode ? currentMode.label : 'Verständigung im Bürgerkontakt'}
        </p>
      </div>

      {/* Office Mode Selector */}
      <div>
        <button
          className="w-full flex items-center justify-between px-4 py-3 rounded-xl border bg-card hover:bg-accent transition-colors"
          onClick={() => setShowModeSelector(!showModeSelector)}
        >
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">
              {currentMode ? currentMode.label : 'Behördentyp wählen'}
            </span>
            {!currentMode && (
              <span className="text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded-full">
                Optional
              </span>
            )}
          </div>
          <ChevronDown
            className={`h-4 w-4 text-muted-foreground transition-transform ${showModeSelector ? 'rotate-180' : ''}`}
          />
        </button>

        {showModeSelector && (
          <div className="mt-2 grid grid-cols-2 gap-2">
            {OFFICE_MODES.map((mode) => {
              const Icon = mode.icon
              const isSelected = officeMode === mode.id
              return (
                <button
                  key={mode.id}
                  className={`p-3 rounded-xl border text-left transition-colors ${
                    isSelected
                      ? mode.color === 'blue'
                        ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-teal-400 bg-teal-50 dark:bg-teal-900/20'
                      : 'hover:bg-accent'
                  }`}
                  onClick={() => {
                    setOfficeMode(isSelected ? null : mode.id)
                    setShowModeSelector(false)
                  }}
                >
                  <Icon
                    className={`h-5 w-5 mb-1 ${
                      mode.color === 'blue' ? 'text-blue-600' : 'text-teal-600'
                    }`}
                  />
                  <p className="text-sm font-medium">{mode.label}</p>
                  <p className="text-xs text-muted-foreground">{mode.description}</p>
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* Offline indicator */}
      <OfflineModeIndicator compact />

      {/* Quick Activate — Primary Action */}
      <Card
        className={`p-5 space-y-4 ${
          accentColor === 'blue'
            ? 'border-blue-200 dark:border-blue-800'
            : 'border-teal-200 dark:border-teal-800'
        }`}
      >
        <div className="flex items-center gap-2">
          <Zap
            className={`h-5 w-5 ${
              accentColor === 'blue' ? 'text-blue-700' : 'text-teal-700'
            }`}
          />
          <h2 className="font-semibold">Gespräch starten</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Session-Code eingeben, um die Live-Übersetzung für Ihren Besucher zu starten.
        </p>
        <SessionCodeInput onSubmit={(code) => handleActivate(code)} />
        <Button
          onClick={() => handleActivate()}
          disabled={!activateCode.trim()}
          className={`w-full ${
            accentColor === 'blue'
              ? 'bg-blue-700 hover:bg-blue-800'
              : 'bg-teal-700 hover:bg-teal-800'
          }`}
          size="lg"
        >
          Übersetzung starten
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </Card>

      {/* Secondary Actions */}
      <div className="grid grid-cols-2 gap-3">
        <Card
          className="p-4 cursor-pointer hover:bg-accent transition-colors"
          onClick={() => navigate('/conversation')}
        >
          <MessageSquare className="h-5 w-5 text-muted-foreground mb-2" />
          <p className="text-sm font-medium">Gespräch</p>
          <p className="text-xs text-muted-foreground">1:1 am Schalter</p>
        </Card>

        <Card
          className="p-4 cursor-pointer hover:bg-accent transition-colors"
          onClick={() => navigate('/translator')}
        >
          <Languages className="h-5 w-5 text-muted-foreground mb-2" />
          <p className="text-sm font-medium">Texte</p>
          <p className="text-xs text-muted-foreground">Formulare & Briefe</p>
        </Card>

        <Card
          className="p-4 cursor-pointer hover:bg-accent transition-colors"
          onClick={() => navigate('/form-templates')}
        >
          <FileText className="h-5 w-5 text-muted-foreground mb-2" />
          <p className="text-sm font-medium">Vorlagen</p>
          <p className="text-xs text-muted-foreground">Standardtexte</p>
        </Card>

        {/* Mode-specific workflow button */}
        {officeMode === 'auslaenderbehoerde' && (
          <Card
            className="p-4 cursor-pointer hover:bg-accent transition-colors border-teal-200 dark:border-teal-800"
            onClick={() => navigate('/asylum-workflow')}
          >
            <ClipboardList className="h-5 w-5 text-teal-600 mb-2" />
            <p className="text-sm font-medium">Verfahren</p>
            <p className="text-xs text-muted-foreground">Aufenthalt & Asyl</p>
          </Card>
        )}

        {officeMode === 'jobcenter' && (
          <Card
            className="p-4 cursor-pointer hover:bg-accent transition-colors border-blue-200 dark:border-blue-800"
            onClick={() => navigate('/jobcenter-workflow')}
          >
            <Briefcase className="h-5 w-5 text-blue-600 mb-2" />
            <p className="text-sm font-medium">SGB II/III</p>
            <p className="text-xs text-muted-foreground">Bürgergeld & Arbeit</p>
          </Card>
        )}

        {!officeMode && (
          <Card
            className="p-4 cursor-pointer hover:bg-accent transition-colors"
            onClick={() => navigate('/admin/sessions')}
          >
            <Settings className="h-5 w-5 text-muted-foreground mb-2" />
            <p className="text-sm font-medium">Verwalten</p>
            <p className="text-xs text-muted-foreground">Sessions & Nutzer</p>
          </Card>
        )}
      </div>

      {/* Broadcasting shortcut for Jobcenter */}
      {officeMode === 'jobcenter' && (
        <Card
          className="p-4 cursor-pointer border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-900/10 hover:bg-blue-100/50 transition-colors"
          onClick={() => navigate('/live')}
        >
          <div className="flex items-center gap-3">
            <Radio className="h-5 w-5 text-blue-600" />
            <div>
              <p className="text-sm font-semibold">Gruppeninfo starten</p>
              <p className="text-xs text-muted-foreground">
                Live-Übersetzung für mehrere Teilnehmer
              </p>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground ml-auto" />
          </div>
        </Card>
      )}

      {/* Quick Phrases */}
      <QuickPhrases
        phrases={AUTHORITY_PHRASES}
        onSpeak={(text) => navigate('/translator', { state: { prefill: text } })}
        title="Häufige Sätze"
      />

      {/* Privacy Banner */}
      <PrivacyBanner />

      <p className="text-xs text-muted-foreground text-center max-w-xs mx-auto">
        Ihr Besucher öffnet die AmtTranslator App auf seinem Smartphone und gibt den Session-Code ein.
      </p>
    </div>
  )
}
