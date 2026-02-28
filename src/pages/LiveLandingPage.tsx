import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Radio, Headphones, Wifi, Cloud, Smartphone, Bluetooth, Signal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import LanguageSelector from '@/components/translator/LanguageSelector'
import SessionCodeInput from '@/components/live/SessionCodeInput'
import { isHotspotSupported, canCreateHotspotProgrammatically } from '@/lib/hotspot-utils'
import { isBleTransportAvailable } from '@/lib/ble-utils'
import { useBleScanner } from '@/hooks/useBleDiscovery'
import { useI18n } from '@/context/I18nContext'
import type { ConnectionMode } from '@/lib/transport/types'

export default function LiveLandingPage() {
  const { t } = useI18n()
  const navigate = useNavigate()
  const [sourceLang, setSourceLang] = useState('de')
  const [connectionMode, setConnectionMode] = useState<ConnectionMode>('cloud')
  const [localServerUrl, setLocalServerUrl] = useState('ws://192.168.8.1:8765')

  const hotspotAvailable = isHotspotSupported()
  const bleTransportAvailable = isBleTransportAvailable()

  // BLE scanning for nearby sessions (listener auto-discovery)
  const bleScanner = useBleScanner()

  // Auto-start BLE scanning on mount (for native platforms)
  useEffect(() => {
    if (bleScanner.isAvailable && !bleScanner.isScanning) {
      bleScanner.startScan()
    }
    return () => bleScanner.stopScan()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bleScanner.isAvailable])

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

  const handleJoin = (code: string, bleDeviceId?: string) => {
    navigate(`/live/${code}`, {
      state: bleDeviceId ? { bleDeviceId } : undefined,
    })
  }

  // Convert RSSI to signal strength indicator (0-3)
  const rssiToStrength = (rssi: number): number => {
    if (rssi >= -50) return 3  // Excellent
    if (rssi >= -70) return 2  // Good
    if (rssi >= -85) return 1  // Fair
    return 0                    // Weak
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">{t('liveLanding.title')}</h1>
        <p className="text-muted-foreground">
          {t('liveLanding.subtitle')}
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
              <h2 className="font-semibold">{t('liveLanding.speaker')}</h2>
              <p className="text-sm text-muted-foreground">{t('liveLanding.createSession')}</p>
            </div>
          </div>

          <p className="text-sm text-muted-foreground">
            {t('liveLanding.speakerDesc')}
          </p>

          <LanguageSelector value={sourceLang} onChange={setSourceLang} label={t('liveLanding.iSpeak')} />

          {/* Connection mode selection */}
          <div className="space-y-2">
            <p className="text-sm font-medium">{t('liveLanding.connection')}</p>
            <div className="flex gap-2 flex-wrap">
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
                onClick={() => hotspotAvailable && setConnectionMode('hotspot')}
                disabled={!hotspotAvailable}
                title={!hotspotAvailable ? t('liveLanding.mobileOnly') : undefined}
                className={`flex-1 flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-colors ${
                  !hotspotAvailable
                    ? 'border-border text-muted-foreground/40 cursor-not-allowed'
                    : connectionMode === 'hotspot'
                      ? 'border-sky-600 bg-sky-50 text-sky-700 dark:bg-sky-950/30 dark:text-sky-400 dark:border-sky-800'
                      : 'border-border text-muted-foreground hover:bg-accent'
                }`}
              >
                <Smartphone className="h-4 w-4" />
                Hotspot
              </button>
              <button
                onClick={() => bleTransportAvailable && setConnectionMode('ble')}
                disabled={!bleTransportAvailable}
                title={!bleTransportAvailable ? t('liveLanding.mobileOnly') : undefined}
                className={`flex-1 flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-colors ${
                  !bleTransportAvailable
                    ? 'border-border text-muted-foreground/40 cursor-not-allowed'
                    : connectionMode === 'ble'
                      ? 'border-blue-600 bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-800'
                      : 'border-border text-muted-foreground hover:bg-accent'
                }`}
              >
                <Bluetooth className="h-4 w-4" />
                BLE
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
                Router
              </button>
            </div>

            {/* Hotspot mode info */}
            {connectionMode === 'hotspot' && (
              <div className="space-y-1.5 p-3 rounded-lg bg-sky-50/50 dark:bg-sky-950/20 border border-sky-200 dark:border-sky-800">
                <p className="text-xs font-medium text-sky-700 dark:text-sky-400">
                  {t('liveLanding.hotspotTitle')}
                </p>
                <p className="text-[10px] text-muted-foreground">
                  {canCreateHotspotProgrammatically()
                    ? t('liveLanding.hotspotAutoDesc')
                    : t('liveLanding.hotspotManualDesc')}
                </p>
                <p className="text-[10px] text-muted-foreground/60">
                  {t('liveLanding.hotspotLimit')}
                </p>
              </div>
            )}

            {/* BLE direct mode info */}
            {connectionMode === 'ble' && (
              <div className="space-y-1.5 p-3 rounded-lg bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
                <p className="text-xs font-medium text-blue-700 dark:text-blue-400">
                  {t('liveLanding.bleTitle')}
                </p>
                <p className="text-[10px] text-muted-foreground">
                  {t('liveLanding.bleDesc')}
                </p>
                <p className="text-[10px] text-muted-foreground/60">
                  {t('liveLanding.bleLimit')}
                </p>
              </div>
            )}

            {/* Local router mode */}
            {connectionMode === 'local' && (
              <div className="space-y-1.5">
                <label className="text-xs text-muted-foreground">
                  {t('liveLanding.relayAddress')}
                </label>
                <input
                  type="text"
                  value={localServerUrl}
                  onChange={(e) => setLocalServerUrl(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-md border bg-background text-sm font-mono"
                  placeholder="ws://192.168.8.1:8765"
                />
                <p className="text-[10px] text-muted-foreground/60">
                  {t('liveLanding.relayAddressHint')}
                </p>
              </div>
            )}
          </div>

          <Button onClick={handleCreate} className="w-full">
            {t('liveLanding.startSession')}
          </Button>
        </Card>

        {/* Listener */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Headphones className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="font-semibold">{t('liveLanding.listener')}</h2>
              <p className="text-sm text-muted-foreground">{t('liveLanding.joinSession')}</p>
            </div>
          </div>

          <p className="text-sm text-muted-foreground">
            {t('liveLanding.listenerDesc')}
          </p>

          {/* BLE discovered sessions */}
          {bleScanner.sessions.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Bluetooth className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                <p className="text-xs font-medium text-blue-600 dark:text-blue-400">
                  {t('liveLanding.nearbySessions')}
                </p>
              </div>
              <div className="space-y-1.5">
                {bleScanner.sessions
                  .sort((a, b) => b.rssi - a.rssi)
                  .map((session) => {
                    const strength = rssiToStrength(session.rssi)
                    return (
                      <button
                        key={session.sessionCode}
                        onClick={() => handleJoin(session.sessionCode, session.deviceId)}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/20 hover:bg-blue-100 dark:hover:bg-blue-950/40 transition-colors text-left"
                      >
                        <Signal className={`h-4 w-4 shrink-0 ${
                          strength >= 2
                            ? 'text-emerald-500'
                            : strength >= 1
                              ? 'text-amber-500'
                              : 'text-red-400'
                        }`} />
                        <div className="flex-1 min-w-0">
                          <span className="font-mono font-bold text-sm">
                            {session.sessionCode}
                          </span>
                        </div>
                        <span className="text-xs text-primary font-medium">
                          {t('liveLanding.join')}
                        </span>
                      </button>
                    )
                  })}
              </div>
            </div>
          )}

          {/* BLE scanning indicator */}
          {bleScanner.isScanning && bleScanner.sessions.length === 0 && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground/60">
              <Bluetooth className="h-3 w-3 animate-pulse" />
              <span>{t('liveLanding.scanning')}</span>
            </div>
          )}

          <SessionCodeInput onJoin={handleJoin} />
        </Card>
      </div>
    </div>
  )
}
