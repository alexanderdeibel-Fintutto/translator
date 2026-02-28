import { useEffect, useState, useMemo } from 'react'
import { useParams, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { useLiveSession } from '@/hooks/useLiveSession'
import SpeakerView from '@/components/live/SpeakerView'
import ListenerView from '@/components/live/ListenerView'
import LanguageChips from '@/components/live/LanguageChips'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Wifi, Cloud, Bluetooth } from 'lucide-react'
import type { ConnectionConfig, ConnectionMode } from '@/lib/transport/types'

export default function LiveSessionPage() {
  const { code } = useParams<{ code: string }>()
  const [searchParams] = useSearchParams()
  const location = useLocation()
  const navigate = useNavigate()
  const session = useLiveSession()
  const [listenerLang, setListenerLang] = useState('en')

  const state = location.state as {
    role?: string
    sourceLang?: string
    connectionMode?: ConnectionMode
    localServerUrl?: string
    /** BLE device ID when joining via BLE discovery */
    bleDeviceId?: string
  } | null

  // Detect local mode from URL query parameter (?ws=...)
  const wsParam = searchParams.get('ws')
  const bleParam = searchParams.get('ble')

  // Build connection config from state or URL params
  const connectionConfig = useMemo((): ConnectionConfig | undefined => {
    // BLE mode: speaker or listener
    if (state?.connectionMode === 'ble') {
      return { mode: 'ble' }
    }
    // BLE listener joining via discovery (has bleDeviceId in state)
    if (state?.bleDeviceId) {
      return { mode: 'ble', bleDeviceId: state.bleDeviceId }
    }
    // BLE from URL param
    if (bleParam) {
      return { mode: 'ble' }
    }
    // Speaker: use state from navigation
    if (state?.connectionMode === 'local' && state?.localServerUrl) {
      return { mode: 'local', localServerUrl: state.localServerUrl }
    }
    // Listener: detect from URL ?ws= parameter
    if (wsParam) {
      return { mode: 'local', localServerUrl: wsParam }
    }
    // Default: cloud
    if (state?.connectionMode === 'cloud') {
      return { mode: 'cloud' }
    }
    return undefined
  }, [state, wsParam, bleParam])

  // Speaker: create session
  useEffect(() => {
    if (code === 'new' && state?.role === 'speaker' && !session.role) {
      const doCreate = async () => {
        const newCode = await session.createSession(
          state.sourceLang || 'de',
          connectionConfig,
        )
        if (newCode) {
          navigate(`/live/${newCode}`, { replace: true, state: { role: 'speaker' } })
        }
      }
      doCreate()
    }
  }, [code, state, session, navigate, connectionConfig])

  // Already in a session — show the right view
  if (session.role === 'speaker') {
    return <SpeakerView session={session} />
  }

  if (session.role === 'listener') {
    return <ListenerView session={session} />
  }

  // Not yet joined — show language selection for listener
  if (code && code !== 'new') {
    const handleJoin = () => {
      session.joinSession(code, listenerLang, connectionConfig)
    }

    return (
      <div className="max-w-lg mx-auto space-y-6">
        <div className="text-center space-y-2">
          <p className="text-sm text-muted-foreground">Session beitreten</p>
          <p className="text-2xl font-mono font-bold tracking-widest">{code}</p>
        </div>

        {/* Show connection mode badge */}
        {state?.bleDeviceId || bleParam ? (
          <div className="flex items-center justify-center gap-2 text-xs text-blue-600 dark:text-blue-400">
            <Bluetooth className="h-3.5 w-3.5" />
            <span>BLE Direkt (Offline)</span>
          </div>
        ) : wsParam ? (
          <div className="flex items-center justify-center gap-2 text-xs text-emerald-600 dark:text-emerald-400">
            <Wifi className="h-3.5 w-3.5" />
            <span>Lokales Netzwerk (Offline-Modus)</span>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <Cloud className="h-3.5 w-3.5" />
            <span>Cloud-Verbindung</span>
          </div>
        )}

        <Card className="p-6 space-y-4">
          <p className="font-medium">In welcher Sprache möchtest du hören?</p>
          <LanguageChips selected={listenerLang} onSelect={setListenerLang} />
          <Button onClick={handleJoin} className="w-full" size="lg">
            Beitreten
          </Button>
        </Card>
      </div>
    )
  }

  // Fallback
  return null
}
