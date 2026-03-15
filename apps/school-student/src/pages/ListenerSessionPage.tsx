/**
 * Listener Session Page (School Student variant)
 *
 * Displays the live translation stream in listener-only mode.
 * Identical to the base listener session page.
 */

import { useEffect, useState, useMemo, lazy, Suspense } from 'react'
import { useParams, useLocation, useSearchParams } from 'react-router-dom'
import { Loader2, Wifi, Cloud, Bluetooth } from 'lucide-react'
import { useLiveSession } from '@/hooks/useLiveSession'
import { useTierId } from '@/context/UserContext'
import { useI18n } from '@/context/I18nContext'
import LanguageChips from '@/components/live/LanguageChips'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import type { ConnectionConfig } from '@/lib/transport/types'

const ListenerView = lazy(() => import('@/components/live/ListenerView'))

export default function ListenerSessionPage() {
  const { code } = useParams<{ code: string }>()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const { t } = useI18n()
  const tierId = useTierId()
  const session = useLiveSession(tierId)

  const state = location.state as { listenerLang?: string } | null
  const [listenerLang, setListenerLang] = useState(state?.listenerLang || 'en')

  // Detect connection mode from URL params
  const wsParam = searchParams.get('ws')
  const bleParam = searchParams.get('ble')

  const connectionConfig = useMemo((): ConnectionConfig | undefined => {
    if (bleParam) return { mode: 'ble' }
    if (wsParam) return { mode: 'local', localServerUrl: wsParam }
    return { mode: 'cloud' }
  }, [wsParam, bleParam])

  // Auto-join if language was pre-selected
  useEffect(() => {
    if (code && state?.listenerLang && !session.role) {
      session.joinSession(code, state.listenerLang, connectionConfig)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code])

  // Already listening — show listener view
  if (session.role === 'listener') {
    return (
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      }>
        <ListenerView session={session} />
      </Suspense>
    )
  }

  // Not yet joined — show language selection
  if (code) {
    const handleJoin = () => {
      session.joinSession(code, listenerLang, connectionConfig)
    }

    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="w-full max-w-sm space-y-6">
          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">Unterricht beitreten</p>
            <p className="text-2xl font-mono font-bold tracking-widest">{code}</p>
          </div>

          {/* Connection mode indicator */}
          {bleParam ? (
            <div className="flex items-center justify-center gap-2 text-xs text-blue-600">
              <Bluetooth className="h-3.5 w-3.5" />
              <span>Bluetooth</span>
            </div>
          ) : wsParam ? (
            <div className="flex items-center justify-center gap-2 text-xs text-emerald-600">
              <Wifi className="h-3.5 w-3.5" />
              <span>{t('liveSession.localNetwork') || 'Lokales Netzwerk'}</span>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <Cloud className="h-3.5 w-3.5" />
              <span>Cloud</span>
            </div>
          )}

          <Card className="p-6 space-y-4">
            <p className="font-medium">Waehle deine Sprache</p>
            <LanguageChips selected={listenerLang} onSelect={setListenerLang} />
            <Button onClick={handleJoin} className="w-full bg-blue-600 hover:bg-blue-700" size="lg">
              Mitmachen
            </Button>
          </Card>
        </div>
      </div>
    )
  }

  return null
}
