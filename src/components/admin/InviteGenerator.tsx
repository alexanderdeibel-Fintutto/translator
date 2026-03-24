import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Copy, Check, Link as LinkIcon } from 'lucide-react'
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

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <LinkIcon className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium">Einladungslink</span>
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
  )
}
