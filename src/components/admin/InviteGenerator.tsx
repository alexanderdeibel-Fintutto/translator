import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Copy, Check, Link as LinkIcon, Tablet, WifiOff } from 'lucide-react'
import { generateInviteToken } from '@/lib/admin-api'

interface InviteGeneratorProps {
  leadId: string
  segment: string
  existingToken: string | null
  onTokenGenerated: (token: string) => void
}

export default function InviteGenerator({ leadId, segment, existingToken, onTokenGenerated }: InviteGeneratorProps) {
  const [token, setToken] = useState(existingToken)
  const [generating, setGenerating] = useState(false)
  const [copied, setCopied] = useState(false)

  const inviteUrl = token
    ? `${window.location.origin}/sales/${segment}?invite=${token}`
    : null

  async function handleGenerate() {
    setGenerating(true)
    try {
      const newToken = await generateInviteToken(leadId)
      setToken(newToken)
      onTokenGenerated(newToken)
    } catch (err) {
      console.error('Generate invite failed:', err)
    } finally {
      setGenerating(false)
    }
  }

  async function handleCopy() {
    if (!inviteUrl) return
    await navigator.clipboard.writeText(inviteUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Behörden-Setup-Link: direkt zur App mit Einrichtungs-Wizard
  const setupUrl = `${window.location.origin}/conversation?setup=authority`
  const [copiedSetup, setCopiedSetup] = useState(false)

  async function handleCopySetup() {
    await navigator.clipboard.writeText(setupUrl)
    setCopiedSetup(true)
    setTimeout(() => setCopiedSetup(false), 2000)
  }

  return (
    <div className="space-y-3">
      {/* Klassischer Einladungslink (Sales-Seite) */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-2">
          <LinkIcon className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Einladungslink (Sales-Seite)</span>
        </div>
        {inviteUrl ? (
          <div className="flex gap-2">
            <Input value={inviteUrl} readOnly className="text-xs" />
            <Button size="icon" variant="outline" onClick={handleCopy}>
              {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
        ) : (
          <Button size="sm" variant="outline" onClick={handleGenerate} disabled={generating}>
            {generating ? 'Generiere...' : 'Einladungslink erstellen'}
          </Button>
        )}
      </div>

      {/* Behörden-Tablet-Setup-Link */}
      {segment === 'authority' && (
        <div className="space-y-1.5 pt-1 border-t border-border">
          <div className="flex items-center gap-2">
            <Tablet className="h-4 w-4 text-blue-500" />
            <span className="text-sm font-medium text-blue-700 dark:text-blue-400">Tablet-Einrichtungslink</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Diesen Link per E-Mail an die Behörde schicken. Beim ersten Öffnen startet automatisch der Einrichtungs-Assistent.
          </p>
          <div className="flex gap-2">
            <Input value={setupUrl} readOnly className="text-xs" />
            <Button size="icon" variant="outline" onClick={handleCopySetup}>
              {copiedSetup ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <WifiOff className="h-3 w-3" />
            Führt durch PWA-Installation, Whisper &amp; Sprachpakete
          </div>
        </div>
      )}
    </div>
  )
}
