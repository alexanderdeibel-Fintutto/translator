/**
 * School Teacher Home Page
 *
 * Main screen for the teacher app. Optimized for classroom use:
 * 1. Quick-activate: Start/resume a classroom session
 * 2. New session: Create a fresh session for today's class
 * 3. Conversation: 1:1 mode for parent-teacher meetings
 * 4. Manage: Session admin
 */

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { GraduationCap, Settings, Plus, Zap, ArrowRight, MessageSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import SessionCodeInput from '@/components/live/SessionCodeInput'
import { useI18n } from '@/context/I18nContext'
import { useUser } from '@/context/UserContext'

export default function SchoolTeacherHomePage() {
  const { t } = useI18n()
  const navigate = useNavigate()
  const { user } = useUser()
  const [activateCode, setActivateCode] = useState('')

  const handleActivate = (code?: string) => {
    const sessionCode = code || activateCode
    if (!sessionCode.trim()) return
    navigate(`/live/${sessionCode.trim().toUpperCase()}`, {
      state: { role: 'speaker' },
    })
  }

  const handleCreateNew = () => {
    navigate('/live')
  }

  const handleConversation = () => {
    navigate('/conversation')
  }

  const handleManage = () => {
    navigate('/admin/sessions')
  }

  return (
    <div className="max-w-lg mx-auto py-8 px-4 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-100 dark:bg-blue-900/30">
          <GraduationCap className="h-7 w-7 text-blue-600 dark:text-blue-400" />
        </div>
        <h1 className="text-2xl font-bold">School Translator</h1>
        <p className="text-sm text-muted-foreground">
          {user?.email || 'Live-Uebersetzung im Klassenzimmer'}
        </p>
      </div>

      {/* Quick Activate — Primary Action */}
      <Card className="p-6 space-y-4 border-blue-200 dark:border-blue-800">
        <div className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-blue-600" />
          <h2 className="font-semibold">Unterricht starten</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Session-Code eingeben und sofort mit der Live-Uebersetzung fuer Ihre Klasse beginnen.
        </p>
        <SessionCodeInput
          onSubmit={(code) => handleActivate(code)}
        />
        <Button
          onClick={() => handleActivate()}
          disabled={!activateCode.trim()}
          className="w-full bg-blue-600 hover:bg-blue-700"
          size="lg"
        >
          Unterricht starten
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </Card>

      {/* Secondary Actions */}
      <div className="grid grid-cols-3 gap-3">
        <Card
          className="p-4 cursor-pointer hover:bg-accent transition-colors"
          onClick={handleCreateNew}
        >
          <div className="space-y-2">
            <Plus className="h-5 w-5 text-muted-foreground" />
            <p className="text-sm font-medium">Neue Session</p>
            <p className="text-xs text-muted-foreground">
              Fuer die naechste Stunde
            </p>
          </div>
        </Card>

        <Card
          className="p-4 cursor-pointer hover:bg-accent transition-colors"
          onClick={handleConversation}
        >
          <div className="space-y-2">
            <MessageSquare className="h-5 w-5 text-muted-foreground" />
            <p className="text-sm font-medium">Elterngespraech</p>
            <p className="text-xs text-muted-foreground">
              1:1 Uebersetzung
            </p>
          </div>
        </Card>

        <Card
          className="p-4 cursor-pointer hover:bg-accent transition-colors"
          onClick={handleManage}
        >
          <div className="space-y-2">
            <Settings className="h-5 w-5 text-muted-foreground" />
            <p className="text-sm font-medium">Verwalten</p>
            <p className="text-xs text-muted-foreground">
              Sessions & Klassen
            </p>
          </div>
        </Card>
      </div>

      {/* Info hint */}
      <p className="text-xs text-muted-foreground text-center max-w-xs mx-auto">
        Ihre Schueler oeffnen die School Translator App und geben den Session-Code ein, um in ihrer Sprache mitzulesen.
      </p>
    </div>
  )
}
