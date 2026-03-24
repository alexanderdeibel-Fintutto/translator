/**
 * Team Sharing — All Speaker Apps
 *
 * Allows sharing a session code with team members via
 * copy, native share, or QR code display.
 * Useful for handing off sessions between shifts or colleagues.
 */

import { useState } from 'react'
import { Users, Copy, Check, Share2, QrCode } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

interface TeamSharingProps {
  /** Session code */
  sessionCode: string
  /** Full session URL */
  sessionUrl: string
  /** App variant name for context */
  appName?: string
}

export default function TeamSharing({
  sessionCode,
  sessionUrl,
  appName = 'Translator',
}: TeamSharingProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const [showQR, setShowQR] = useState(false)

  const speakerUrl = `${window.location.origin}/live/${sessionCode}`

  const handleCopy = async () => {
    const text = `${appName} Session: ${sessionCode}\nSprecher-Link: ${speakerUrl}\nZuhoerer-Link: ${sessionUrl}`
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: `${appName} — Session ${sessionCode}`,
        text: `Session-Code: ${sessionCode}`,
        url: speakerUrl,
      })
    } else {
      handleCopy()
    }
  }

  if (!isOpen) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="gap-1.5"
      >
        <Users className="h-3.5 w-3.5" />
        Team
      </Button>
    )
  }

  return (
    <Card className="p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Session teilen</span>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="text-xs text-muted-foreground hover:text-foreground"
        >
          Schliessen
        </button>
      </div>

      {/* Session code display */}
      <div className="text-center py-2">
        <p className="text-xs text-muted-foreground">Session-Code</p>
        <p className="text-2xl font-bold font-mono tracking-widest">{sessionCode}</p>
      </div>

      {/* QR toggle */}
      {showQR && (
        <div className="flex justify-center py-2">
          <div className="bg-white p-3 rounded-lg">
            <QRCodeSVG value={speakerUrl} size={140} level="M" />
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleCopy}
          className="flex-1 gap-1 text-xs"
        >
          {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
          {copied ? 'Kopiert' : 'Kopieren'}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleShare}
          className="flex-1 gap-1 text-xs"
        >
          <Share2 className="h-3 w-3" />
          Teilen
        </Button>
        <Button
          variant={showQR ? 'default' : 'outline'}
          size="sm"
          onClick={() => setShowQR(!showQR)}
          className="gap-1 text-xs"
        >
          <QrCode className="h-3 w-3" />
        </Button>
      </div>
    </Card>
  )
}
