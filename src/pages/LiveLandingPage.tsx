import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Radio, Headphones, Wifi, Cloud } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import LanguageSelector from '@/components/translator/LanguageSelector'
import SessionCodeInput from '@/components/live/SessionCodeInput'
import type { ConnectionMode } from '@/lib/transport/types'

export default function LiveLandingPage() {
  const navigate = useNavigate()
  const [sourceLang, setSourceLang] = useState('de')
  const [connectionMode, setConnectionMode] = useState<ConnectionMode>('cloud')
  const [localServerUrl, setLocalServerUrl] = useState('ws://192.168.8.1:8765')

  const handleCreate = () => {
    navigate('/live/new', {
      state: {
        role: 'speaker',
        sourceLang,
        connectionMode,
        localServerUrl: connectionMode === 'local' ? localServerUrl : undefined,
      },
    })
  }

  const handleJoin = (code: string) => {
    navigate(`/live/${code}`)
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Live-Übersetzung</h1>
        <p className="text-muted-foreground">
          Ein Speaker spricht — alle Listener hören die Übersetzung in ihrer Sprache.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Speaker */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Radio className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="font-semibold">Speaker</h2>
              <p className="text-sm text-muted-foreground">Session erstellen</p>
            </div>
          </div>

          <p className="text-sm text-muted-foreground">
            Du sprichst und deine Worte werden automatisch in alle Sprachen deiner Listener übersetzt.
          </p>

          <LanguageSelector value={sourceLang} onChange={setSourceLang} label="Ich spreche" />

          {/* Connection mode selection */}
          <div className="space-y-2">
            <p className="text-sm font-medium">Verbindung</p>
            <div className="flex gap-2">
              <button
                onClick={() => setConnectionMode('cloud')}
                className={`flex-1 flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-colors ${
                  connectionMode === 'cloud'
                    ? 'border-primary bg-primary/5 text-primary'
                    : 'border-border text-muted-foreground hover:bg-accent'
                }`}
              >
                <Cloud className="h-4 w-4" />
                Cloud
              </button>
              <button
                onClick={() => setConnectionMode('local')}
                className={`flex-1 flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-colors ${
                  connectionMode === 'local'
                    ? 'border-primary bg-primary/5 text-primary'
                    : 'border-border text-muted-foreground hover:bg-accent'
                }`}
              >
                <Wifi className="h-4 w-4" />
                Lokal (Offline)
              </button>
            </div>

            {connectionMode === 'local' && (
              <div className="space-y-1.5">
                <label className="text-xs text-muted-foreground">
                  Relay-Server Adresse
                </label>
                <input
                  type="text"
                  value={localServerUrl}
                  onChange={(e) => setLocalServerUrl(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-md border bg-background text-sm font-mono"
                  placeholder="ws://192.168.8.1:8765"
                />
                <p className="text-[10px] text-muted-foreground/60">
                  Adresse des Relay-Servers auf dem portablen WiFi-Router
                </p>
              </div>
            )}
          </div>

          <Button onClick={handleCreate} className="w-full">
            Session starten
          </Button>
        </Card>

        {/* Listener */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Headphones className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="font-semibold">Listener</h2>
              <p className="text-sm text-muted-foreground">Session beitreten</p>
            </div>
          </div>

          <p className="text-sm text-muted-foreground">
            Scanne den QR-Code des Speakers oder gib den Session-Code ein.
          </p>

          <SessionCodeInput onJoin={handleJoin} />
        </Card>
      </div>
    </div>
  )
}
