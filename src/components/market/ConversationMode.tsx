/**
 * ConversationMode — Bidirectional conversation UI for counter/desk scenarios
 *
 * Two-panel layout where both sides (staff + guest) can speak alternately.
 * Each side has a mic button and sees their own + translated text.
 */

import { useState } from 'react'
import { Mic, MicOff, ArrowLeftRight, Volume2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { getLanguageByCode } from '@/lib/languages'

export interface ConversationTurn {
  id: string
  side: 'staff' | 'guest'
  originalText: string
  translatedText: string
  sourceLang: string
  targetLang: string
  timestamp: number
}

interface ConversationModeProps {
  staffLang: string
  guestLang: string
  turns: ConversationTurn[]
  activeSide: 'staff' | 'guest' | null
  onStartSpeaking: (side: 'staff' | 'guest') => void
  onStopSpeaking: () => void
  onSpeak?: (text: string, lang: string) => void
  className?: string
}

export default function ConversationMode({
  staffLang,
  guestLang,
  turns,
  activeSide,
  onStartSpeaking,
  onStopSpeaking,
  onSpeak,
  className = '',
}: ConversationModeProps) {
  const staffLangData = getLanguageByCode(staffLang)
  const guestLangData = getLanguageByCode(guestLang)

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header with language pair */}
      <div className="flex items-center justify-center gap-3 py-2">
        <span className="text-lg font-medium">
          {staffLangData?.flag} {staffLangData?.name || staffLang}
        </span>
        <ArrowLeftRight className="h-5 w-5 text-muted-foreground" />
        <span className="text-lg font-medium">
          {guestLangData?.flag} {guestLangData?.name || guestLang}
        </span>
      </div>

      {/* Two-panel mic buttons */}
      <div className="grid grid-cols-2 gap-3">
        {/* Staff side */}
        <Card className={`p-4 text-center space-y-3 transition-colors ${
          activeSide === 'staff' ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20' : ''
        }`}>
          <p className="text-sm font-medium text-muted-foreground">Mitarbeiter</p>
          <Button
            size="lg"
            variant={activeSide === 'staff' ? 'destructive' : 'default'}
            className="w-full h-16 text-lg"
            onClick={() => activeSide === 'staff' ? onStopSpeaking() : onStartSpeaking('staff')}
            disabled={activeSide === 'guest'}
          >
            {activeSide === 'staff' ? (
              <><MicOff className="h-6 w-6 mr-2" /> Stopp</>
            ) : (
              <><Mic className="h-6 w-6 mr-2" /> Sprechen</>
            )}
          </Button>
        </Card>

        {/* Guest side */}
        <Card className={`p-4 text-center space-y-3 transition-colors ${
          activeSide === 'guest' ? 'border-green-500 bg-green-50 dark:bg-green-950/20' : ''
        }`}>
          <p className="text-sm font-medium text-muted-foreground">Gast</p>
          <Button
            size="lg"
            variant={activeSide === 'guest' ? 'destructive' : 'default'}
            className="w-full h-16 text-lg"
            onClick={() => activeSide === 'guest' ? onStopSpeaking() : onStartSpeaking('guest')}
            disabled={activeSide === 'staff'}
          >
            {activeSide === 'guest' ? (
              <><MicOff className="h-6 w-6 mr-2" /> Stop</>
            ) : (
              <><Mic className="h-6 w-6 mr-2" /> {guestLangData?.flag} Speak</>
            )}
          </Button>
        </Card>
      </div>

      {/* Conversation history */}
      <div className="space-y-2 max-h-[50vh] overflow-y-auto">
        {turns.length === 0 && (
          <p className="text-center text-sm text-muted-foreground py-8">
            Druecken Sie &quot;Sprechen&quot; um das Gespraech zu starten
          </p>
        )}
        {turns.map((turn) => {
          const isStaff = turn.side === 'staff'
          return (
            <div
              key={turn.id}
              className={`flex flex-col gap-1 p-3 rounded-lg ${
                isStaff
                  ? 'bg-blue-50 dark:bg-blue-950/20 mr-8'
                  : 'bg-green-50 dark:bg-green-950/20 ml-8'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">
                  {isStaff ? 'Mitarbeiter' : 'Gast'}
                </span>
                {onSpeak && (
                  <button
                    onClick={() => onSpeak(turn.translatedText, turn.targetLang)}
                    className="p-1 rounded hover:bg-black/5 dark:hover:bg-white/5"
                    aria-label="Vorlesen"
                  >
                    <Volume2 className="h-3.5 w-3.5 text-muted-foreground" />
                  </button>
                )}
              </div>
              <p className="text-sm">{turn.originalText}</p>
              <p className="text-sm font-medium">{turn.translatedText}</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
