import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Radio, Headphones, Wifi, Cloud, Smartphone, Bluetooth, Signal, Users, Globe, MessageCircleQuestion } from 'lucide-react'
import { Button } from '@/components/ui/button'
import LanguageSelector from '@/components/translator/LanguageSelector'
import SessionCodeInput from '@/components/live/SessionCodeInput'
import { isHotspotSupported, canCreateHotspotProgrammatically } from '@/lib/hotspot-utils'
import { isBleTransportAvailable } from '@/lib/ble-utils'
import { useBleScanner } from '@/hooks/useBleDiscovery'
import { useI18n } from '@/context/I18nContext'
import { useTierId } from '@/context/UserContext'
import { UpgradePrompt } from '@/components/pricing/UpgradePrompt'
import { hasFeature } from '@/lib/tiers'
import type { ConnectionMode } from '@/lib/transport/types'
import OfflineReadinessBanner from '@/components/offline/OfflineReadinessBanner'

export default function LiveLandingPage() {
  const { t } = useI18n()
  const navigate = useNavigate()
  const tierId = useTierId()
  const canLive = hasFeature(tierId, 'liveSession')
  const [sourceLang, setSourceLang] = useState('de')
  const [connectionMode, setConnectionMode] = useState<ConnectionMode>('cloud')
  const [localServerUrl, setLocalServerUrl] = useState('ws://192.168.8.1:8765')

  const hotspotAvailable = isHotspotSupported()
  const bleTransportAvailable = isBleTransportAvailable()
  const bleScanner = useBleScanner()

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

  const rssiToStrength = (rssi: number): number => {
    if (rssi >= -50) return 3
    if (rssi >= -70) return 2
    if (rssi >= -85) return 1
    return 0
  }

  const MODES: { mode: ConnectionMode; icon: typeof Cloud; label: string; available: boolean; color: string }[] = [
    { mode: 'cloud',   icon: Cloud,       label: t('live.btnCloud'),   available: true,                color: 'sky' },
    { mode: 'hotspot', icon: Smartphone,  label: t('live.btnHotspot'), available: hotspotAvailable,    color: 'emerald' },
    { mode: 'ble',     icon: Bluetooth,   label: t('live.btnBle'),     available: bleTransportAvailable, color: 'blue' },
    { mode: 'local',   icon: Wifi,        label: t('live.btnRouter'),  available: true,                color: 'violet' },
  ]

  return (
    <div className="relative max-w-2xl mx-auto space-y-4 py-4 px-4 text-white">

      <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-0">
        <img src="/fintutto-logo.svg" alt="" className="w-[600px] h-[600px] opacity-[0.28]" />
      </div>

      {/* Hero */}
      <div className="relative text-center space-y-2 py-6 overflow-hidden rounded-2xl">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <img src="/fintutto-logo.svg" alt="" className="w-[200px] h-[200px] opacity-90" />
        </div>
        <div className="relative z-10 space-y-2">
          <h1 className="text-2xl font-bold drop-shadow-lg">{t('liveLanding.title')}</h1>
          <p className="text-sm text-white/75 drop-shadow">{t('liveLanding.subtitle')}</p>
          <div className="flex items-center justify-center gap-4 pt-1">
            <span className="flex items-center gap-1 text-[11px] text-white/60">
              <Globe className="h-3 w-3" />45 {t('translator.languages')}
            </span>
            <span className="flex items-center gap-1 text-[11px] text-white/60">
              <Radio className="h-3 w-3" />1→N Broadcast
            </span>
            <span className="flex items-center gap-1 text-[11px] text-white/60">
              <MessageCircleQuestion className="h-3 w-3" />Q&A
            </span>
            <span className="flex items-center gap-1 text-[11px] text-white/60">
              <Users className="h-3 w-3" />bis 500
            </span>
          </div>
        </div>
      </div>

      {/* Speaker card */}
      <div className="p-4 rounded-2xl bg-black/25 backdrop-blur-md border border-white/15 space-y-4">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-sky-500/20 flex items-center justify-center shrink-0">
            <Radio className="h-4 w-4 text-sky-300" />
          </div>
          <div>
            <h2 className="font-semibold text-sm">{t('liveLanding.speaker')}</h2>
            <p className="text-xs text-white/60">{t('liveLanding.createSession')}</p>
          </div>
        </div>

        <LanguageSelector value={sourceLang} onChange={setSourceLang} label={t('liveLanding.iSpeak')} />

        {/* Connection mode */}
        <div className="space-y-2">
          <p className="text-xs font-medium text-white/80">{t('liveLanding.connection')}</p>
          <div className="grid grid-cols-4 gap-1.5">
            {MODES.map(({ mode, icon: Icon, label, available, color }) => (
              <button
                key={mode}
                onClick={() => available && setConnectionMode(mode)}
                disabled={!available}
                className={`flex flex-col items-center gap-1 px-2 py-2 rounded-lg border text-[11px] transition-colors ${
                  !available
                    ? 'border-white/10 text-white/25 cursor-not-allowed'
                    : connectionMode === mode
                      ? `border-${color}-400/60 bg-${color}-500/20 text-${color}-300`
                      : 'border-white/15 text-white/60 hover:bg-white/10'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span className="leading-tight text-center">{label}</span>
              </button>
            ))}
          </div>

          {connectionMode === 'hotspot' && (
            <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-400/25 text-[11px] text-white/70">
              <p className="font-medium text-emerald-300 mb-0.5">{t('liveLanding.hotspotTitle')}</p>
              <p>{canCreateHotspotProgrammatically() ? t('liveLanding.hotspotAutoDesc') : t('liveLanding.hotspotManualDesc')}</p>
            </div>
          )}
          {connectionMode === 'ble' && (
            <div className="p-2.5 rounded-lg bg-blue-500/10 border border-blue-400/25 text-[11px] text-white/70">
              <p className="font-medium text-blue-300 mb-0.5">{t('liveLanding.bleTitle')}</p>
              <p>{t('liveLanding.bleDesc')}</p>
            </div>
          )}
          {connectionMode === 'local' && (
            <div className="space-y-1.5">
              <label className="text-[11px] text-white/60">{t('liveLanding.relayAddress')}</label>
              <input
                type="text"
                value={localServerUrl}
                onChange={(e) => setLocalServerUrl(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg border border-white/20 bg-white/10 text-sm font-mono text-white placeholder:text-white/40 focus:outline-none focus:ring-1 focus:ring-sky-400/60"
                placeholder="ws://192.168.8.1:8765"
              />
              <p className="text-[10px] text-white/40">{t('liveLanding.relayAddressHint')}</p>
            </div>
          )}
        </div>

        {canLive ? (
          <Button onClick={handleCreate} className="w-full">
            {t('liveLanding.startSession')}
          </Button>
        ) : (
          <UpgradePrompt tierId={tierId} limitType="feature_locked" featureName="Live-Modus" />
        )}
        <OfflineReadinessBanner sourceLang={sourceLang} compact />
      </div>

      {/* Listener card */}
      <div className="p-4 rounded-2xl bg-black/25 backdrop-blur-md border border-white/15 space-y-4">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-sky-500/20 flex items-center justify-center shrink-0">
            <Headphones className="h-4 w-4 text-sky-300" />
          </div>
          <div>
            <h2 className="font-semibold text-sm">{t('liveLanding.listener')}</h2>
            <p className="text-xs text-white/60">{t('liveLanding.joinSession')}</p>
          </div>
        </div>

        {/* BLE discovered sessions */}
        {bleScanner.sessions.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-1.5">
              <Bluetooth className="h-3 w-3 text-blue-400" />
              <p className="text-xs font-medium text-blue-400">{t('liveLanding.nearbySession')}</p>
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
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg border border-blue-400/30 bg-blue-500/10 hover:bg-blue-500/20 transition-colors text-left"
                    >
                      <Signal className={`h-4 w-4 shrink-0 ${strength >= 2 ? 'text-emerald-400' : strength >= 1 ? 'text-amber-400' : 'text-red-400'}`} />
                      <span className="font-mono font-bold text-sm flex-1">{session.sessionCode}</span>
                      <span className="text-xs text-sky-300 font-medium">{t('liveLanding.join')}</span>
                    </button>
                  )
                })}
            </div>
          </div>
        )}

        {bleScanner.isScanning && bleScanner.sessions.length === 0 && (
          <div className="flex items-center gap-2 text-xs text-white/40">
            <Bluetooth className="h-3 w-3 animate-pulse" />
            <span>{t('liveLanding.scanning')}</span>
          </div>
        )}

        <SessionCodeInput onJoin={handleJoin} />
      </div>

    </div>
  )
}
