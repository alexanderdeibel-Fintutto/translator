import { ChevronDown, Search } from 'lucide-react'
import { useState, useRef, useEffect, useCallback } from 'react'
import { LANGUAGES, type Language } from '@/lib/languages'
import { cn } from '@/lib/utils'
import { useI18n } from '@/context/I18nContext'

interface LanguageSelectorProps {
  value: string
  onChange: (code: string) => void
  label: string
}

export default function LanguageSelector({ value, onChange, label }: LanguageSelectorProps) {
  const { t } = useI18n()
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')
  const ref = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  const selected = LANGUAGES.find(l => l.code === value)

  const filtered = LANGUAGES.filter(
    l =>
      l.name.toLowerCase().includes(search.toLowerCase()) ||
      l.nativeName.toLowerCase().includes(search.toLowerCase()) ||
      l.code.toLowerCase().includes(search.toLowerCase())
  )

  const closeDropdown = useCallback(() => {
    setIsOpen(false)
    setSearch('')
    buttonRef.current?.focus()
  }, [])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false)
        setSearch('')
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (isOpen && searchRef.current) {
      searchRef.current.focus()
    }
  }, [isOpen])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault()
      closeDropdown()
    }
  }

  const listboxId = `lang-listbox-${label.replace(/\s+/g, '-').toLowerCase()}`

  return (
    <div className="relative" ref={ref} onKeyDown={handleKeyDown}>
      <label className="text-xs font-medium text-muted-foreground mb-1 block" id={`${listboxId}-label`}>{label}</label>
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-labelledby={`${listboxId}-label`}
        className={cn(
          'flex items-center gap-2 px-3 py-2.5 rounded-lg border border-input bg-background',
          'hover:bg-accent transition-colors w-full min-w-[180px]',
          isOpen && 'ring-2 ring-ring'
        )}
      >
        {selected && (
          <>
            <span className="text-lg">{selected.flag}</span>
            <span className="font-medium text-sm flex-1 text-left">{selected.name}</span>
          </>
        )}
        <ChevronDown className={cn('h-4 w-4 text-muted-foreground transition-transform', isOpen && 'rotate-180')} aria-hidden="true" />
      </button>

      {isOpen && (
        <div
          className="absolute top-full left-0 mt-1 w-full min-w-[240px] bg-popover border border-border rounded-lg shadow-lg z-50 max-h-[320px] overflow-hidden flex flex-col"
          role="listbox"
          id={listboxId}
          aria-labelledby={`${listboxId}-label`}
        >
          <div className="p-2 border-b border-border">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
              <input
                ref={searchRef}
                type="text"
                placeholder={t('translator.searchLang')}
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                aria-label={t('translator.searchLang')}
              />
            </div>
          </div>
          <div className="overflow-y-auto flex-1">
            {filtered.map(lang => (
              <button
                key={lang.code}
                role="option"
                aria-selected={lang.code === value}
                onClick={() => {
                  onChange(lang.code)
                  closeDropdown()
                }}
                className={cn(
                  'flex items-center gap-2.5 px-3 py-2 w-full text-left hover:bg-accent transition-colors',
                  lang.code === value && 'bg-accent'
                )}
              >
                <span className="text-lg">{lang.flag}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium">{lang.name}</div>
                  <div className="text-xs text-muted-foreground">{lang.nativeName}</div>
                </div>
                {lang.code === value && (
                  <div className="h-2 w-2 rounded-full bg-primary" aria-hidden="true" />
                )}
              </button>
            ))}
            {filtered.length === 0 && (
              <div className="px-3 py-4 text-sm text-muted-foreground text-center">
                {t('translator.noLangFound')}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
