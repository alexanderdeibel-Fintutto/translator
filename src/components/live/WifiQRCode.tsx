import { QRCodeSVG } from 'qrcode.react'
import { Wifi, Smartphone } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { generateWifiQRString } from '@/lib/hotspot-utils'
import { useI18n } from '@/context/I18nContext'

interface WifiQRCodeProps {
  ssid: string
  password: string
  /** Step number to show (1 = WiFi QR, 2 = app instructions) */
  step?: 1 | 2
}

/**
 * WiFi QR code component.
 * When scanned by iOS (11+) or Android (10+), the device automatically
 * shows a "Join network?" prompt — no manual WiFi settings needed.
 */
export default function WifiQRCode({ ssid, password, step = 1 }: WifiQRCodeProps) {
  const { t } = useI18n()
  const wifiString = generateWifiQRString(ssid, password)

  return (
    <Card className="p-5 bg-sky-50/50 dark:bg-sky-950/20 border-sky-200 dark:border-sky-800">
      <div className="flex flex-col items-center gap-3">
        {/* Step indicator */}
        <div className="flex items-center gap-2 text-sky-700 dark:text-sky-400">
          <Wifi className="h-4 w-4" aria-hidden="true" />
          <span className="text-sm font-medium">
            {t('live.wifiStep').replace('{step}', String(step))}
          </span>
        </div>

        {/* QR Code */}
        <div className="bg-white p-3 rounded-xl shadow-sm">
          <QRCodeSVG value={wifiString} size={160} level="M" />
        </div>

        {/* Network info */}
        <div className="text-center space-y-1">
          <p className="text-xs text-muted-foreground">{t('live.network')}</p>
          <p className="font-mono font-bold text-sm">{ssid}</p>
        </div>

        {/* Instructions */}
        <div className="text-center space-y-2 max-w-[260px]">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Smartphone className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <span>{t('live.wifiScanInstruction')}</span>
          </div>
          <p className="text-[10px] text-muted-foreground/60">
            {t('live.wifiAutoConnect')}
          </p>
        </div>
      </div>
    </Card>
  )
}
