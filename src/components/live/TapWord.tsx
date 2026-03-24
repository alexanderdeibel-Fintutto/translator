/**
 * Tap Word — Interactive Word Explanation
 *
 * Renders translated text as individually tappable words.
 * When a user taps a word, it shows a tooltip with:
 * - The original word (back-translated to source language)
 * - A simple explanation
 *
 * Uses the existing translateText API for back-translation.
 */

import { useState, useRef, useEffect } from 'react'
import { Loader2 } from 'lucide-react'
import { translateText } from '@/lib/translate'

interface TapWordProps {
  /** The translated text to render */
  text: string
  /** Source language of the original (speaker's language) */
  sourceLang: string
  /** Target language (listener's language — the text is in this language) */
  targetLang: string
  /** CSS class for the text container */
  className?: string
}

interface WordTooltip {
  word: string
  index: number
  backTranslation: string | null
  loading: boolean
  x: number
  y: number
}

export default function TapWord({
  text,
  sourceLang,
  targetLang,
  className = '',
}: TapWordProps) {
  const [tooltip, setTooltip] = useState<WordTooltip | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Close tooltip on outside click
  useEffect(() => {
    if (!tooltip) return
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setTooltip(null)
      }
    }
    document.addEventListener('click', handleClick)
    return () => document.removeEventListener('click', handleClick)
  }, [tooltip])

  // Close tooltip after 5 seconds
  useEffect(() => {
    if (!tooltip) return
    const timer = setTimeout(() => setTooltip(null), 5000)
    return () => clearTimeout(timer)
  }, [tooltip])

  const handleWordTap = async (word: string, index: number, e: React.MouseEvent) => {
    e.stopPropagation()

    // Strip punctuation for translation
    const cleanWord = word.replace(/[.,!?;:'"()[\]{}\u060C\u061B\u061F]/g, '').trim()
    if (!cleanWord) return

    const rect = (e.target as HTMLElement).getBoundingClientRect()

    setTooltip({
      word: cleanWord,
      index,
      backTranslation: null,
      loading: true,
      x: rect.left + rect.width / 2,
      y: rect.top,
    })

    try {
      // Back-translate the single word to the source language
      const result = await translateText(cleanWord, targetLang, sourceLang)
      setTooltip((prev) =>
        prev && prev.index === index
          ? { ...prev, backTranslation: result.translatedText, loading: false }
          : prev
      )
    } catch {
      setTooltip((prev) =>
        prev && prev.index === index
          ? { ...prev, backTranslation: '—', loading: false }
          : prev
      )
    }
  }

  const words = text.split(/(\s+)/)

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Rendered words */}
      <p className="text-2xl md:text-3xl font-medium leading-relaxed break-words">
        {words.map((segment, i) => {
          // Whitespace segments
          if (/^\s+$/.test(segment)) return segment

          return (
            <span
              key={i}
              onClick={(e) => handleWordTap(segment, i, e)}
              className={`cursor-pointer rounded px-0.5 transition-colors hover:bg-blue-100 dark:hover:bg-blue-900/30 ${
                tooltip?.index === i ? 'bg-blue-200 dark:bg-blue-800/40' : ''
              }`}
              role="button"
              tabIndex={0}
              aria-label={segment}
            >
              {segment}
            </span>
          )
        })}
      </p>

      {/* Tooltip */}
      {tooltip && (
        <div
          className="fixed z-50 transform -translate-x-1/2 -translate-y-full pointer-events-none"
          style={{ left: tooltip.x, top: tooltip.y - 8 }}
        >
          <div className="bg-popover border shadow-lg rounded-lg px-3 py-2 text-sm pointer-events-auto min-w-[100px] text-center">
            {tooltip.loading ? (
              <Loader2 className="h-4 w-4 animate-spin mx-auto" />
            ) : (
              <div className="space-y-0.5">
                <p className="font-medium">{tooltip.backTranslation}</p>
                <p className="text-xs text-muted-foreground">{tooltip.word}</p>
              </div>
            )}
            {/* Arrow */}
            <div className="absolute left-1/2 -translate-x-1/2 top-full w-2 h-2 bg-popover border-b border-r transform rotate-45 -mt-1" />
          </div>
        </div>
      )}
    </div>
  )
}
