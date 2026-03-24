/**
 * Medical Staff Home Page
 *
 * Main screen for doctors, nurses, pharmacists.
 * Primary: Standalone bidirektional auf einem Gerät (kein Internet nötig).
 * Sekundär: Anamnese-Workflow, Notfall-Phrasen, Live-Session.
 */

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Heart, MessageSquare, ArrowRight, Stethoscope, Settings, Shield,
  Zap, ClipboardList, AlertTriangle, QrCode, FileText
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import PainScale from '@/components/market/PainScale'
import PrivacyBanner from '@/components/market/PrivacyBanner'
import { useUser } from '@/context/UserContext'

export default function MedicalStaffHomePage() {
  const navigate = useNavigate()
  const { user } = useUser()
  const [painLevel, setPainLevel] = useState<number | null>(null)

  return (
    <div className="max-w-lg mx-auto py-6 px-4 space-y-5">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-red-100 dark:bg-red-900/30">
          <Heart className="h-7 w-7 text-red-600 dark:text-red-400" />
        </div>
        <h1 className="text-2xl font-bold">Medical Translator</h1>
        <p className="text-sm text-muted-foreground">
          {user?.email || 'Offline · DSGVO-konform · Kein Internet nötig'}
        </p>
      </div>

      {/* Privacy Banner */}
      <PrivacyBanner />

      {/* PRIMARY: Standalone Bidirektional */}
      <Card className="p-5 space-y-3 border-red-300 bg-red-50 dark:bg-red-950/20 dark:border-red-800">
        <div className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-red-600" />
          <h2 className="font-semibold text-red-800 dark:text-red-300">Bidirektionale Übersetzung</h2>
          <span className="ml-auto text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-medium">Primär</span>
        </div>
        <p className="text-sm text-red-700 dark:text-red-400">
          Arzt ↔ Patient auf <strong>einem Gerät</strong> — kein Internet, kein zweites Gerät nötig.
          Gerät einfach umdrehen für den Patienten.
        </p>
        <Button
          onClick={() => navigate('/standalone')}
          className="w-full bg-red-600 hover:bg-red-700"
          size="lg"
        >
          <Zap className="mr-2 h-4 w-4" />
          Jetzt starten
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </Card>

      {/* SECONDARY: Anamnese + Notfall */}
      <div className="grid grid-cols-2 gap-3">
        <Card
          className="p-4 cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-950/20 transition-colors border-blue-200"
          onClick={() => navigate('/anamnesis')}
        >
          <div className="space-y-2">
            <ClipboardList className="h-5 w-5 text-blue-600" />
            <p className="text-sm font-semibold">Anamnese</p>
            <p className="text-xs text-muted-foreground">Geführter Fragebogen mit Übersetzung</p>
          </div>
        </Card>

        <Card
          className="p-4 cursor-pointer hover:bg-orange-50 dark:hover:bg-orange-950/20 transition-colors border-orange-200"
          onClick={() => navigate('/emergency')}
        >
          <div className="space-y-2">
            <AlertTriangle className="h-5 w-5 text-orange-600" />
            <p className="text-sm font-semibold">Notfall-Phrasen</p>
            <p className="text-xs text-muted-foreground">Schnellzugriff Notaufnahme</p>
          </div>
        </Card>
      </div>

      {/* Pain Scale */}
      <PainScale
        onSelect={(value) => setPainLevel(value)}
        selected={painLevel}
      />

      {/* Tertiary Actions */}
      <div className="grid grid-cols-3 gap-2">
        <Card
          className="p-3 cursor-pointer hover:bg-accent transition-colors text-center"
          onClick={() => navigate('/conversation')}
        >
          <MessageSquare className="h-4 w-4 text-muted-foreground mx-auto mb-1" />
          <p className="text-xs font-medium">Live-Session</p>
        </Card>

        <Card
          className="p-3 cursor-pointer hover:bg-accent transition-colors text-center"
          onClick={() => navigate('/live')}
        >
          <QrCode className="h-4 w-4 text-muted-foreground mx-auto mb-1" />
          <p className="text-xs font-medium">QR-Code</p>
        </Card>

        <Card
          className="p-3 cursor-pointer hover:bg-accent transition-colors text-center"
          onClick={() => navigate('/history')}
        >
          <FileText className="h-4 w-4 text-muted-foreground mx-auto mb-1" />
          <p className="text-xs font-medium">Verlauf</p>
        </Card>
      </div>

      {/* Settings */}
      <Card
        className="p-4 cursor-pointer hover:bg-accent transition-colors flex items-center gap-3"
        onClick={() => navigate('/settings')}
      >
        <Settings className="h-4 w-4 text-muted-foreground" />
        <div>
          <p className="text-sm font-medium">Einstellungen</p>
          <p className="text-xs text-muted-foreground">Sprache, Profil, Datenschutz</p>
        </div>
        <ArrowRight className="h-4 w-4 text-muted-foreground ml-auto" />
      </Card>

      {/* Medical disclaimer */}
      <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-800">
        <Shield className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
        <p className="text-xs text-amber-800 dark:text-amber-300">
          <strong>Hinweis:</strong> Maschinelle Übersetzung ersetzt keinen professionellen medizinischen Dolmetscher. Bei kritischen Diagnosen oder Eingriffen ziehen Sie bitte einen zertifizierten Dolmetscher hinzu.
        </p>
      </div>
    </div>
  )
}
