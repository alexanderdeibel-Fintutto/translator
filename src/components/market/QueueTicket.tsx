/**
 * Queue Ticket Display — Authority Market
 *
 * Shows a large ticket/queue number on the visitor's screen.
 * The clerk enters the number, and it appears on the visitor's
 * device along with the translation session.
 *
 * This helps visitors know when it's their turn, even without
 * understanding spoken German announcements.
 */

import { useState } from 'react'
import { Hash, X, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

interface QueueTicketProps {
  /** Called when clerk sends a ticket number to listeners */
  onSendTicket: (number: string) => void
}

/** Clerk-side: Enter and send ticket number */
export function QueueTicketInput({ onSendTicket }: QueueTicketProps) {
  const [ticketNumber, setTicketNumber] = useState('')
  const [sent, setSent] = useState(false)

  const handleSend = () => {
    if (!ticketNumber.trim()) return
    onSendTicket(ticketNumber.trim())
    setSent(true)
    setTimeout(() => setSent(false), 3000)
  }

  return (
    <div className="flex items-center gap-2">
      <div className="relative flex-1">
        <Hash className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          value={ticketNumber}
          onChange={(e) => setTicketNumber(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Wartenummer"
          className="w-full pl-8 pr-3 py-2 border rounded-lg bg-background text-foreground text-sm"
          maxLength={10}
        />
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={handleSend}
        disabled={!ticketNumber.trim()}
        className="gap-1"
      >
        <Send className="h-3 w-3" />
        {sent ? 'Gesendet!' : 'Senden'}
      </Button>
    </div>
  )
}

interface QueueTicketDisplayProps {
  /** Current ticket number (null if none) */
  ticketNumber: string | null
  /** Called to dismiss the display */
  onDismiss: () => void
}

/** Visitor-side: Large ticket number display */
export function QueueTicketDisplay({ ticketNumber, onDismiss }: QueueTicketDisplayProps) {
  if (!ticketNumber) return null

  return (
    <Card className="p-4 bg-teal-50 dark:bg-teal-900/20 border-teal-200 dark:border-teal-800">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-teal-100 dark:bg-teal-900/40 flex items-center justify-center">
            <Hash className="h-6 w-6 text-teal-700 dark:text-teal-400" />
          </div>
          <div>
            <p className="text-xs text-teal-700 dark:text-teal-400 font-medium uppercase tracking-wider">
              Ihre Nummer / Your number
            </p>
            <p className="text-3xl font-bold font-mono tracking-widest text-teal-900 dark:text-teal-100">
              {ticketNumber}
            </p>
          </div>
        </div>
        <button
          onClick={onDismiss}
          className="p-1 rounded hover:bg-teal-100 dark:hover:bg-teal-800"
        >
          <X className="h-4 w-4 text-teal-600" />
        </button>
      </div>
    </Card>
  )
}
