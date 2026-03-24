/**
 * PainScale — Visual pain assessment tool (Wong-Baker style)
 *
 * Universal emoji-based pain scale (0-10) that works across language barriers.
 * Patient taps a face to indicate pain level — no words needed.
 */

import { useState } from 'react'
import { Card } from '@/components/ui/card'

interface PainLevel {
  value: number
  emoji: string
  label: string
  color: string
}

const PAIN_LEVELS: PainLevel[] = [
  { value: 0,  emoji: '😊', label: 'Kein Schmerz', color: 'bg-green-100 border-green-400 dark:bg-green-950/30' },
  { value: 2,  emoji: '🙂', label: 'Leicht', color: 'bg-lime-100 border-lime-400 dark:bg-lime-950/30' },
  { value: 4,  emoji: '😐', label: 'Maessig', color: 'bg-yellow-100 border-yellow-400 dark:bg-yellow-950/30' },
  { value: 6,  emoji: '😟', label: 'Stark', color: 'bg-orange-100 border-orange-400 dark:bg-orange-950/30' },
  { value: 8,  emoji: '😣', label: 'Sehr stark', color: 'bg-red-100 border-red-400 dark:bg-red-950/30' },
  { value: 10, emoji: '😭', label: 'Unertraeglich', color: 'bg-red-200 border-red-600 dark:bg-red-950/50' },
]

interface PainScaleProps {
  /** Called when patient selects a pain level */
  onSelect: (value: number, label: string) => void
  /** Currently selected value */
  selected?: number | null
  /** Compact mode for inline display */
  compact?: boolean
  className?: string
}

export default function PainScale({
  onSelect,
  selected = null,
  compact = false,
  className = '',
}: PainScaleProps) {
  return (
    <Card className={`p-4 space-y-3 ${className}`}>
      <div className="text-center space-y-1">
        <h3 className="text-sm font-semibold">Schmerzskala</h3>
        <p className="text-xs text-muted-foreground">
          Zeigen Sie auf das Gesicht, das Ihren Schmerz beschreibt
        </p>
      </div>

      <div className={`grid ${compact ? 'grid-cols-6 gap-1' : 'grid-cols-3 gap-2'}`}>
        {PAIN_LEVELS.map((level) => {
          const isSelected = selected === level.value
          return (
            <button
              key={level.value}
              onClick={() => onSelect(level.value, level.label)}
              className={`flex flex-col items-center gap-1 p-2 rounded-lg border-2 transition-all ${
                isSelected
                  ? `${level.color} border-2 scale-105 shadow-md`
                  : 'border-transparent hover:bg-accent'
              }`}
              aria-label={`Schmerz ${level.value}: ${level.label}`}
            >
              <span className={compact ? 'text-2xl' : 'text-4xl'}>{level.emoji}</span>
              <span className="text-xs font-bold">{level.value}</span>
              {!compact && (
                <span className="text-[10px] text-muted-foreground leading-tight text-center">
                  {level.label}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {selected !== null && (
        <div className="text-center py-2 bg-muted/50 rounded-lg">
          <span className="text-lg font-bold">
            {PAIN_LEVELS.find((l) => l.value === selected)?.emoji}{' '}
            Schmerzstufe: {selected}/10
          </span>
          <p className="text-xs text-muted-foreground">
            {PAIN_LEVELS.find((l) => l.value === selected)?.label}
          </p>
        </div>
      )}
    </Card>
  )
}
