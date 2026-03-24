/**
 * QR Poster Page — AmtTranslator (Sachbearbeiter)
 *
 * Generates a printable QR code poster for the counter/desk.
 * Visitors scan the QR code to join the translation session
 * without needing to type a session code manually.
 *
 * Design: Behörden-Professionell — Teal/Slate, DM Sans
 */

import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Printer,
  Download,
  QrCode,
  RefreshCw,
  Globe,
  Shield,
  Smartphone,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { QRCodeSVG } from 'qrcode.react'

// Generate a random session code
function generateSessionCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = 'AT-'
  for (let i = 0; i < 4; i++) {
    code += chars[Math.floor(Math.random() * chars.length)]
  }
  return code
}

const VISITOR_APP_URL = 'https://tl-authority-visitor.fintutto.cloud'

const LANGUAGES = [
  { code: 'ar', label: 'العربية', flag: '🇸🇦' },
  { code: 'tr', label: 'Türkçe', flag: '🇹🇷' },
  { code: 'uk', label: 'Українська', flag: '🇺🇦' },
  { code: 'ru', label: 'Русский', flag: '🇷🇺' },
  { code: 'fa', label: 'فارسی', flag: '🇮🇷' },
  { code: 'ps', label: 'پښتو', flag: '🇦🇫' },
  { code: 'so', label: 'Soomaali', flag: '🇸🇴' },
  { code: 'ti', label: 'ትግርኛ', flag: '🇪🇷' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'ro', label: 'Română', flag: '🇷🇴' },
]

export default function QRPosterPage() {
  const navigate = useNavigate()
  const [sessionCode, setSessionCode] = useState(generateSessionCode)
  const [officeName, setOfficeName] = useState('')
  const [posterStyle, setPosterStyle] = useState<'standard' | 'compact' | 'multilang'>(
    'standard'
  )
  const posterRef = useRef<HTMLDivElement>(null)

  const sessionUrl = `${VISITOR_APP_URL}/${sessionCode}`

  const handlePrint = () => {
    window.print()
  }

  const handleNewCode = () => {
    setSessionCode(generateSessionCode())
  }

  const handleStartSession = () => {
    navigate(`/live/${sessionCode}`, { state: { role: 'speaker' } })
  }

  return (
    <div className="max-w-2xl mx-auto py-8 px-4 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-1" />
          Zurück
        </Button>
        <div>
          <h1 className="text-xl font-bold">QR-Code Poster</h1>
          <p className="text-sm text-muted-foreground">
            Druckbares Poster für Ihren Schalter
          </p>
        </div>
      </div>

      {/* Controls */}
      <Card className="p-4 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium mb-1 block">Behördenname (optional)</label>
            <input
              type="text"
              value={officeName}
              onChange={(e) => setOfficeName(e.target.value)}
              placeholder="z.B. Ausländerbehörde Rostock"
              className="w-full px-3 py-2 rounded-lg border bg-background text-sm"
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Poster-Stil</label>
            <select
              value={posterStyle}
              onChange={(e) => setPosterStyle(e.target.value as typeof posterStyle)}
              className="w-full px-3 py-2 rounded-lg border bg-background text-sm"
            >
              <option value="standard">Standard (A4)</option>
              <option value="compact">Kompakt (Tischaufsteller)</option>
              <option value="multilang">Mehrsprachig (mit Flaggen)</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex-1 px-3 py-2 rounded-lg border bg-muted font-mono text-sm font-bold tracking-widest text-center">
            {sessionCode}
          </div>
          <Button variant="outline" size="sm" onClick={handleNewCode}>
            <RefreshCw className="h-4 w-4 mr-1" />
            Neuer Code
          </Button>
          <Button
            size="sm"
            className="bg-teal-700 hover:bg-teal-800"
            onClick={handleStartSession}
          >
            Session starten
          </Button>
        </div>
      </Card>

      {/* Poster Preview */}
      <div className="print:shadow-none">
        <div
          ref={posterRef}
          id="qr-poster"
          className={`bg-white text-black rounded-2xl border-2 border-dashed border-gray-300 print:border-none overflow-hidden ${
            posterStyle === 'compact' ? 'max-w-sm mx-auto' : ''
          }`}
        >
          {posterStyle === 'standard' && (
            <StandardPoster
              code={sessionCode}
              url={sessionUrl}
              officeName={officeName}
            />
          )}
          {posterStyle === 'compact' && (
            <CompactPoster
              code={sessionCode}
              url={sessionUrl}
              officeName={officeName}
            />
          )}
          {posterStyle === 'multilang' && (
            <MultilingualPoster
              code={sessionCode}
              url={sessionUrl}
              officeName={officeName}
            />
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 print:hidden">
        <Button onClick={handlePrint} className="flex-1 bg-teal-700 hover:bg-teal-800">
          <Printer className="h-4 w-4 mr-2" />
          Drucken
        </Button>
        <Button
          variant="outline"
          onClick={() => {
            const svg = document.querySelector('#qr-poster svg') as SVGElement
            if (!svg) return
            const svgData = new XMLSerializer().serializeToString(svg)
            const blob = new Blob([svgData], { type: 'image/svg+xml' })
            const link = document.createElement('a')
            link.href = URL.createObjectURL(blob)
            link.download = `qr-poster-${sessionCode}.svg`
            link.click()
          }}
        >
          <Download className="h-4 w-4 mr-2" />
          SVG speichern
        </Button>
      </div>

      {/* Info */}
      <div className="grid grid-cols-3 gap-3 text-center text-sm text-muted-foreground print:hidden">
        <div className="flex flex-col items-center gap-1">
          <Smartphone className="h-5 w-5" />
          <span>Besucher scannt QR-Code mit Smartphone</span>
        </div>
        <div className="flex flex-col items-center gap-1">
          <Globe className="h-5 w-5" />
          <span>Wählt Sprache in der App</span>
        </div>
        <div className="flex flex-col items-center gap-1">
          <Shield className="h-5 w-5" />
          <span>Übersetzung läuft — 100% offline</span>
        </div>
      </div>
    </div>
  )
}

// ─── Poster Variants ──────────────────────────────────────────────────────────

function StandardPoster({
  code,
  url,
  officeName,
}: {
  code: string
  url: string
  officeName: string
}) {
  return (
    <div className="p-10 space-y-6 text-center">
      {/* Header */}
      <div className="space-y-1">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-teal-100 mb-2">
          <QrCode className="h-6 w-6 text-teal-700" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Übersetzungshilfe</h2>
        <p className="text-gray-500 text-sm">
          {officeName || 'Ausländerbehörde / Behördengespräch'}
        </p>
      </div>

      {/* QR Code */}
      <div className="flex justify-center">
        <div className="p-4 bg-white rounded-2xl shadow-sm border">
          <QRCodeSVG value={url} size={200} level="H" includeMargin={false} />
        </div>
      </div>

      {/* Session Code */}
      <div className="space-y-1">
        <p className="text-sm text-gray-500">Oder Code eingeben:</p>
        <div className="inline-block px-6 py-2 rounded-xl bg-teal-50 border border-teal-200">
          <span className="text-3xl font-mono font-bold tracking-widest text-teal-800">
            {code}
          </span>
        </div>
      </div>

      {/* Instructions */}
      <div className="grid grid-cols-3 gap-4 text-xs text-gray-600 pt-2">
        <div className="space-y-1">
          <div className="text-2xl">📱</div>
          <p>QR-Code scannen oder amttranslator.de öffnen</p>
        </div>
        <div className="space-y-1">
          <div className="text-2xl">🌍</div>
          <p>Ihre Sprache auswählen</p>
        </div>
        <div className="space-y-1">
          <div className="text-2xl">🔒</div>
          <p>Gespräch läuft — sicher & vertraulich</p>
        </div>
      </div>

      {/* Languages */}
      <div className="pt-2 border-t border-gray-100">
        <p className="text-xs text-gray-400 mb-2">Verfügbare Sprachen</p>
        <div className="flex flex-wrap justify-center gap-1">
          {['🇸🇦', '🇹🇷', '🇺🇦', '🇷🇺', '🇮🇷', '🇦🇫', '🇸🇴', '🇪🇷', '🇫🇷', '🇷🇴', '🇵🇱', '🇻🇳'].map(
            (flag, i) => (
              <span key={i} className="text-xl">
                {flag}
              </span>
            )
          )}
          <span className="text-xs text-gray-400 self-center ml-1">+30 weitere</span>
        </div>
      </div>

      {/* Privacy note */}
      <p className="text-xs text-gray-400 pt-2">
        🔒 Alle Daten bleiben auf diesem Gerät. Keine Cloud. Keine Weitergabe.
      </p>
    </div>
  )
}

function CompactPoster({
  code,
  url,
  officeName,
}: {
  code: string
  url: string
  officeName: string
}) {
  return (
    <div className="p-6 space-y-4 text-center">
      <h2 className="text-lg font-bold text-gray-900">
        {officeName || 'Übersetzungshilfe'}
      </h2>
      <div className="flex justify-center">
        <QRCodeSVG value={url} size={150} level="H" />
      </div>
      <div className="font-mono text-2xl font-bold tracking-widest text-teal-800 bg-teal-50 rounded-lg py-2">
        {code}
      </div>
      <p className="text-xs text-gray-500">
        QR-Code scannen oder Code unter amttranslator.de eingeben
      </p>
    </div>
  )
}

function MultilingualPoster({
  code,
  url,
  officeName,
}: {
  code: string
  url: string
  officeName: string
}) {
  const instructions = [
    { lang: 'de', text: 'QR-Code scannen und Sprache wählen', flag: '🇩🇪' },
    { lang: 'ar', text: 'امسح رمز QR واختر لغتك', flag: '🇸🇦', rtl: true },
    { lang: 'tr', text: 'QR kodu tarayın ve dilinizi seçin', flag: '🇹🇷' },
    { lang: 'uk', text: 'Скануйте QR-код і оберіть мову', flag: '🇺🇦' },
    { lang: 'fa', text: 'کد QR را اسکن کنید و زبان خود را انتخاب کنید', flag: '🇮🇷', rtl: true },
    { lang: 'so', text: 'Scan-garee koodhka QR oo dooro luqaddaada', flag: '🇸🇴' },
  ]

  return (
    <div className="p-8 space-y-6">
      <div className="text-center space-y-1">
        <h2 className="text-xl font-bold text-gray-900">
          {officeName || 'Übersetzungshilfe / Translation Help'}
        </h2>
      </div>

      <div className="flex gap-6 items-center">
        <div className="flex-shrink-0">
          <QRCodeSVG value={url} size={160} level="H" />
        </div>
        <div className="space-y-2 flex-1">
          {instructions.map((instr) => (
            <div
              key={instr.lang}
              className={`flex items-center gap-2 text-sm ${instr.rtl ? 'flex-row-reverse text-right' : ''}`}
            >
              <span className="text-lg flex-shrink-0">{instr.flag}</span>
              <span className="text-gray-700">{instr.text}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="text-center">
        <div className="inline-block px-6 py-2 rounded-xl bg-teal-50 border border-teal-200">
          <span className="text-3xl font-mono font-bold tracking-widest text-teal-800">
            {code}
          </span>
        </div>
      </div>

      <p className="text-xs text-center text-gray-400">
        🔒 Keine Datenspeicherung · No data stored · لا يتم تخزين البيانات
      </p>
    </div>
  )
}
