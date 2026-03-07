/**
 * Enterprise Home Page
 *
 * Main landing screen for the enterprise app.
 * Optimized for the primary use case: quickly activate a pre-configured session.
 *
 * Shows:
 * 1. Quick-activate: Enter existing session code to go live instantly
 * 2. Create new session: Start a fresh live session as speaker
 * 3. Manage sessions: Link to session admin panel
 */

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Radio, Settings, Plus, Zap, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import SessionCodeInput from '@/components/live/SessionCodeInput'
import { useI18n } from '@/context/I18nContext'
import { useUser } from '@/context/UserContext'

export default function EnterpriseHomePage() {
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

  const handleManage = () => {
    navigate('/admin/sessions')
  }

  return (
    <div className="max-w-lg mx-auto py-8 px-4 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-violet-100 dark:bg-violet-900/30">
          <Radio className="h-7 w-7 text-violet-600 dark:text-violet-400" />
        </div>
        <h1 className="text-2xl font-bold">Fintutto Enterprise</h1>
        <p className="text-sm text-muted-foreground">
          {user?.email || t('enterprise.subtitle') || 'Session-Management'}
        </p>
      </div>

      {/* Quick Activate — Primary Action */}
      <Card className="p-6 space-y-4 border-violet-200 dark:border-violet-800">
        <div className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-violet-600" />
          <h2 className="font-semibold">{t('enterprise.quickActivate') || 'Session aktivieren'}</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          {t('enterprise.quickActivateDesc') || 'Gib den Session-Code ein, um sofort als Speaker live zu gehen.'}
        </p>
        <SessionCodeInput
          onSubmit={(code) => handleActivate(code)}
        />
        <Button
          onClick={() => handleActivate()}
          disabled={!activateCode.trim()}
          className="w-full bg-violet-600 hover:bg-violet-700"
          size="lg"
        >
          {t('enterprise.goLive') || 'Live gehen'}
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </Card>

      {/* Secondary Actions */}
      <div className="grid grid-cols-2 gap-3">
        <Card
          className="p-4 cursor-pointer hover:bg-accent transition-colors"
          onClick={handleCreateNew}
        >
          <div className="space-y-2">
            <Plus className="h-5 w-5 text-muted-foreground" />
            <p className="text-sm font-medium">{t('enterprise.newSession') || 'Neue Session'}</p>
            <p className="text-xs text-muted-foreground">
              {t('enterprise.newSessionDesc') || 'Session erstellen und konfigurieren'}
            </p>
          </div>
        </Card>

        <Card
          className="p-4 cursor-pointer hover:bg-accent transition-colors"
          onClick={handleManage}
        >
          <div className="space-y-2">
            <Settings className="h-5 w-5 text-muted-foreground" />
            <p className="text-sm font-medium">{t('enterprise.manageSessions') || 'Verwalten'}</p>
            <p className="text-xs text-muted-foreground">
              {t('enterprise.manageDesc') || 'Sessions, Teilnehmer, Uploads'}
            </p>
          </div>
        </Card>
      </div>
    </div>
  )
}
