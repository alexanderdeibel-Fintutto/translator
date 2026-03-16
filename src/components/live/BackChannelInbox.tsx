/**
 * Back Channel Inbox — Speaker Side
 *
 * Shows incoming quick-responses from listeners as a small
 * notification badge. Speakers see aggregated emoji counts.
 */

import { useState, useEffect, useRef } from 'react'
import { MessageCircle, X } from 'lucide-react'
import type { BackChannelResponse } from './BackChannel'

export interface IncomingResponse {
  response: BackChannelResponse
  senderLang: string
  timestamp: number
}

interface BackChannelInboxProps {
  /** Incoming responses (managed by parent via broadcast) */
  responses: IncomingResponse[]
  /** Called to clear responses */
  onClear: () => void
}

export default function BackChannelInbox({
  responses,
  onClear,
}: BackChannelInboxProps) {
  const [isOpen, setIsOpen] = useState(false)
  const prevCountRef = useRef(0)

  // Auto-open briefly when new response arrives
  useEffect(() => {
    if (responses.length > prevCountRef.current && responses.length > 0) {
      setIsOpen(true)
    }
    prevCountRef.current = responses.length
  }, [responses.length])

  // Auto-close after 8 seconds if open
  useEffect(() => {
    if (!isOpen) return
    const timer = setTimeout(() => setIsOpen(false), 8000)
    return () => clearTimeout(timer)
  }, [isOpen, responses.length])

  // Aggregate by response type
  const aggregated = responses.reduce<Record<string, { emoji: string; count: number }>>((acc, r) => {
    const key = r.response.id
    if (!acc[key]) {
      acc[key] = { emoji: r.response.emoji, count: 0 }
    }
    acc[key].count++
    return acc
  }, {})

  const totalCount = responses.length

  if (totalCount === 0) return null

  return (
    <div className="relative">
      {/* Badge button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg hover:bg-muted transition-colors"
      >
        <MessageCircle className="h-5 w-5 text-muted-foreground" />
        <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] rounded-full bg-orange-500 text-white text-[10px] font-bold flex items-center justify-center px-1">
          {totalCount}
        </span>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-64 bg-popover border rounded-lg shadow-lg p-3 z-50 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Rueckmeldungen
            </span>
            <div className="flex gap-1">
              <button
                onClick={onClear}
                className="text-xs text-muted-foreground hover:text-foreground px-1"
              >
                Loeschen
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-0.5 rounded hover:bg-muted"
              >
                <X className="h-3.5 w-3.5 text-muted-foreground" />
              </button>
            </div>
          </div>

          {/* Aggregated view */}
          <div className="flex flex-wrap gap-2">
            {Object.entries(aggregated).map(([id, { emoji, count }]) => (
              <div
                key={id}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-muted text-sm"
              >
                <span>{emoji}</span>
                <span className="font-medium">{count}</span>
              </div>
            ))}
          </div>

          {/* Recent entries */}
          <div className="max-h-32 overflow-y-auto space-y-1">
            {responses.slice(-5).reverse().map((r, i) => (
              <div key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>{r.response.emoji}</span>
                <span>{r.response.label}</span>
                <span className="ml-auto opacity-60">{r.senderLang}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
