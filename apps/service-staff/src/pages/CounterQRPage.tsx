/**
 * Counter QR Code Page
 *
 * Displays a QR code that guests can scan to join the translation session.
 * The QR code links to service-guest.fintutto.world/[SESSION_CODE]
 */

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { QRCodeSVG } from 'qrcode.react'
import { ArrowLeft, RefreshCw, Download, Share2, Smartphone } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { supabase } from '@/lib/supabase'
import { useUser } from '@/context/UserContext'

function generateCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

export default function CounterQRPage() {
  const navigate = useNavigate()
  const { user } = useUser()
  const [sessionCode, setSessionCode] = useState(() => generateCode())
  const [guestUrl, setGuestUrl] = useState('')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    // Gäste-URL: service-guest App mit Session-Code
    const baseUrl = import.meta.env.VITE_GUEST_URL || 'https://service-guest.fintutto.world'
    setGuestUrl(`${baseUrl}/${sessionCode}`)
  }, [sessionCode])

  const handleRefresh = () => {
    setSessionCode(generateCode())
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(guestUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback
    }
  }

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: 'Service Translator',
        text: 'Scannen Sie diesen Code für die Übersetzung',
        url: guestUrl,
      })
    } else {
      handleCopy()
    }
  }

  const handleStartSession = () => {
    navigate(`/live/${sessionCode}`, { state: { role: 'speaker' } })
  }

  return (
    <div className="max-w-sm mx-auto py-8 px-4 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-lg font-bold">QR-Code für Gäste</h1>
          <p className="text-xs text-muted-foreground">Gast scannt → sofort verbunden</p>
        </div>
      </div>

      {/* QR Code */}
      <Card className="p-8 flex flex-col items-center gap-6">
        <div className="bg-white p-4 rounded-xl shadow-sm">
          <QRCodeSVG
            value={guestUrl}
            size={220}
            level="M"
            includeMargin={false}
            fgColor="#1e1b4b"
          />
        </div>

        {/* Session Code */}
        <div className="text-center space-y-1">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Session-Code</p>
          <p className="text-3xl font-mono font-bold tracking-widest text-violet-700">
            {sessionCode}
          </p>
        </div>

        {/* Instruction */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 rounded-lg px-4 py-2">
          <Smartphone className="h-4 w-4 shrink-0" />
          <span>Gast scannt mit Kamera-App oder Browser</span>
        </div>
      </Card>

      {/* Actions */}
      <div className="grid grid-cols-2 gap-3">
        <Button variant="outline" onClick={handleRefresh} className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Neuer Code
        </Button>
        <Button variant="outline" onClick={handleShare} className="gap-2">
          <Share2 className="h-4 w-4" />
          {copied ? 'Kopiert!' : 'Teilen'}
        </Button>
      </div>

      {/* Start Session Button */}
      <Button
        onClick={handleStartSession}
        className="w-full bg-violet-700 hover:bg-violet-800"
        size="lg"
      >
        Live-Session mit diesem Code starten
      </Button>

      <p className="text-xs text-muted-foreground text-center">
        Der Code ist 2 Stunden gültig. Danach einfach einen neuen generieren.
      </p>
    </div>
  )
}
