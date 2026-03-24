/**
 * Back Channel — Listener Response Panel
 *
 * Allows listeners to send simple pre-defined responses back to the speaker.
 * Uses the same broadcast channel, just with a 'backchannel' event type.
 *
 * Responses are intentionally simple (emoji + short label) to work
 * across language barriers and for users with low literacy.
 */

import { useState } from 'react'
import { MessageCircle, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

export interface BackChannelResponse {
  id: string
  emoji: string
  label: string
  /** Optional translated label for the listener's language */
  localLabel?: string
}

/** Default quick responses available to all listeners */
export const DEFAULT_RESPONSES: BackChannelResponse[] = [
  { id: 'yes', emoji: '\u{1F44D}', label: 'Ja / Yes' },
  { id: 'no', emoji: '\u{1F44E}', label: 'Nein / No' },
  { id: 'repeat', emoji: '\u{1F501}', label: 'Nochmal / Repeat' },
  { id: 'slower', emoji: '\u{1F422}', label: 'Langsamer / Slower' },
  { id: 'question', emoji: '\u{2753}', label: 'Frage / Question' },
  { id: 'ok', emoji: '\u{2705}', label: 'Verstanden / Understood' },
]

interface BackChannelProps {
  /** Called when user selects a response */
  onSend: (response: BackChannelResponse) => void
  /** Custom responses (defaults to DEFAULT_RESPONSES) */
  responses?: BackChannelResponse[]
  /** Disable after sending (cooldown in ms, default 3000) */
  cooldownMs?: number
}

export default function BackChannel({
  onSend,
  responses = DEFAULT_RESPONSES,
  cooldownMs = 3000,
}: BackChannelProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [lastSent, setLastSent] = useState<string | null>(null)
  const [cooldown, setCooldown] = useState(false)

  const handleSend = (response: BackChannelResponse) => {
    if (cooldown) return
    onSend(response)
    setLastSent(response.id)
    setCooldown(true)
    setTimeout(() => {
      setCooldown(false)
      setLastSent(null)
    }, cooldownMs)
  }

  if (!isOpen) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="gap-1.5"
      >
        <MessageCircle className="h-3.5 w-3.5" />
        Antworten
      </Button>
    )
  }

  return (
    <div className="bg-muted/50 rounded-lg p-3 space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Schnellantwort
        </span>
        <button
          onClick={() => setIsOpen(false)}
          className="p-1 rounded hover:bg-muted"
        >
          <X className="h-3.5 w-3.5 text-muted-foreground" />
        </button>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {responses.map((r) => (
          <button
            key={r.id}
            onClick={() => handleSend(r)}
            disabled={cooldown}
            className={`flex flex-col items-center gap-1 p-2 rounded-lg border transition-colors ${
              lastSent === r.id
                ? 'bg-green-100 border-green-300 dark:bg-green-900/30 dark:border-green-700'
                : cooldown
                  ? 'opacity-50 cursor-not-allowed border-border'
                  : 'hover:bg-accent border-border'
            }`}
          >
            <span className="text-2xl" role="img" aria-label={r.label}>
              {r.emoji}
            </span>
            <span className="text-[10px] text-muted-foreground leading-tight text-center">
              {r.localLabel || r.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}
