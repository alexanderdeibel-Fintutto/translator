/**
 * Audio Mode Toggle
 *
 * "Analphabeten-Modus" — Switches listener view to audio-only mode.
 * Instead of showing translated text, translations are automatically
 * spoken via TTS with a large visual indicator (speaker animation).
 *
 * Designed for users who cannot read (common in refugee contexts).
 */

import { Volume2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface AudioModeToggleProps {
  enabled: boolean
  onToggle: (enabled: boolean) => void
}

export function AudioModeToggle({ enabled, onToggle }: AudioModeToggleProps) {
  return (
    <Button
      variant={enabled ? 'default' : 'outline'}
      size="sm"
      onClick={() => onToggle(!enabled)}
      className={`gap-1.5 ${enabled ? 'bg-orange-600 hover:bg-orange-700' : ''}`}
      aria-pressed={enabled}
      aria-label="Audio-Modus"
    >
      <Volume2 className="h-3.5 w-3.5" />
      Audio
    </Button>
  )
}

/**
 * Audio Mode Display
 *
 * Replaces the text translation display when audio mode is active.
 * Shows a large animated speaker icon and visual feedback.
 */
interface AudioModeDisplayProps {
  isSpeaking: boolean
  isConnected: boolean
  sessionCode: string
}

export function AudioModeDisplay({
  isSpeaking,
  isConnected,
  sessionCode,
}: AudioModeDisplayProps) {
  return (
    <div className="min-h-[200px] flex flex-col items-center justify-center p-8 space-y-6">
      {/* Large speaker icon with animation */}
      <div
        className={`w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 ${
          isSpeaking
            ? 'bg-orange-100 dark:bg-orange-900/30 scale-110'
            : 'bg-muted scale-100'
        }`}
      >
        <Volume2
          className={`h-12 w-12 transition-colors ${
            isSpeaking
              ? 'text-orange-600 dark:text-orange-400 animate-pulse'
              : 'text-muted-foreground'
          }`}
        />
      </div>

      {/* Sound waves animation when speaking */}
      {isSpeaking && (
        <div className="flex items-center gap-1">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="w-1 bg-orange-500 rounded-full animate-pulse"
              style={{
                height: `${12 + Math.random() * 20}px`,
                animationDelay: `${i * 0.15}s`,
              }}
            />
          ))}
        </div>
      )}

      {/* Status text — minimal, icon-based */}
      <div className="text-center space-y-2">
        {isSpeaking ? (
          <p className="text-lg font-medium text-orange-600 dark:text-orange-400">
            {'\u{1F50A}'} ...
          </p>
        ) : isConnected ? (
          <p className="text-sm text-muted-foreground">
            {'\u{1F3A7}'} {sessionCode}
          </p>
        ) : (
          <p className="text-sm text-muted-foreground">
            {'\u{23F3}'} ...
          </p>
        )}
      </div>
    </div>
  )
}
