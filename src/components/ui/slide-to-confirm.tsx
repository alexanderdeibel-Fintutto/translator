import { useRef, useState, useCallback, useEffect } from 'react'
import { cn } from '@/lib/utils'

interface SlideToConfirmProps {
  /** Text shown on the slider track */
  label: string
  /** Called when the user slides all the way to the right */
  onConfirm: () => void
  /** Optional CSS class for the outer wrapper */
  className?: string
}

/**
 * A swipe-to-confirm slider that prevents accidental taps.
 * The user must drag the thumb from left to right across the full track.
 */
export function SlideToConfirm({ label, onConfirm, className }: SlideToConfirmProps) {
  const trackRef = useRef<HTMLDivElement>(null)
  const [dragging, setDragging] = useState(false)
  const [progress, setProgress] = useState(0) // 0..1
  const [confirmed, setConfirmed] = useState(false)

  const THUMB_SIZE = 48 // px — keep in sync with the w-12/h-12 classes

  const getProgress = useCallback((clientX: number) => {
    const track = trackRef.current
    if (!track) return 0
    const rect = track.getBoundingClientRect()
    const maxTravel = rect.width - THUMB_SIZE
    const raw = (clientX - rect.left - THUMB_SIZE / 2) / maxTravel
    return Math.min(1, Math.max(0, raw))
  }, [])

  // --- pointer handlers ---
  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (confirmed) return
    e.preventDefault()
    ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
    setDragging(true)
    setProgress(getProgress(e.clientX))
  }, [confirmed, getProgress])

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragging) return
    setProgress(getProgress(e.clientX))
  }, [dragging, getProgress])

  const handlePointerUp = useCallback(() => {
    if (!dragging) return
    setDragging(false)
    if (progress > 0.9) {
      setProgress(1)
      setConfirmed(true)
      onConfirm()
    } else {
      setProgress(0) // snap back
    }
  }, [dragging, progress, onConfirm])

  // Reset when the component remounts (dialog re-opened)
  useEffect(() => {
    setProgress(0)
    setConfirmed(false)
  }, [])

  const thumbOffset = `calc(${progress * 100}% - ${progress * THUMB_SIZE}px)`

  return (
    <div
      ref={trackRef}
      className={cn(
        'relative h-14 select-none rounded-full bg-destructive/15 overflow-hidden touch-none',
        className,
      )}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      {/* Progress fill */}
      <div
        className="absolute inset-y-0 left-0 bg-destructive/25 transition-none rounded-full"
        style={{ width: `${progress * 100}%` }}
      />

      {/* Label (centered, fades as the user slides) */}
      <span
        className="absolute inset-0 flex items-center justify-center text-sm font-medium text-destructive pointer-events-none transition-opacity"
        style={{ opacity: Math.max(0, 1 - progress * 2.5) }}
      >
        {label}
      </span>

      {/* Thumb */}
      <div
        className={cn(
          'absolute top-1 h-12 w-12 rounded-full flex items-center justify-center shadow-md transition-colors',
          confirmed
            ? 'bg-destructive text-destructive-foreground'
            : 'bg-destructive text-destructive-foreground',
        )}
        style={{
          left: thumbOffset,
          marginLeft: 4,
          transition: dragging ? 'none' : 'left 0.25s ease',
        }}
      >
        {confirmed ? (
          <CheckIcon className="h-5 w-5" />
        ) : (
          <ChevronRightIcon className="h-5 w-5" />
        )}
      </div>
    </div>
  )
}

// Inline tiny icons to avoid extra lucide imports
function ChevronRightIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M9 6l6 6-6 6" />
    </svg>
  )
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M5 12l5 5L20 7" />
    </svg>
  )
}
