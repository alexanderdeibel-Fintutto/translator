import { Languages, Sun, Moon, Settings, Wifi, WifiOff, Signal, Globe } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useOffline } from '@/context/OfflineContext'
import { useI18n } from '@/context/I18nContext'
import { UI_LANGUAGES, type UILanguage } from '@/lib/i18n'

export default function Header() {
  const location = useLocation()
  const { networkMode } = useOffline()
  const { t, uiLang, setUILang } = useI18n()
  const [isDark, setIsDark] = useState(() => {
    if (typeof window === 'undefined') return false
    return document.documentElement.classList.contains('dark')
  })
  const [langOpen, setLangOpen] = useState(false)
  const langRef = useRef<HTMLDivElement>(null)

  const NAV_ITEMS = [
    { label: t('nav.translator'), path: '/' },
    { label: t('nav.live'), path: '/live' },
    { label: t('nav.phrasebook'), path: '/phrasebook' },
    { label: t('nav.info'), path: '/info' },
  ]

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    localStorage.setItem('theme', isDark ? 'dark' : 'light')
  }, [isDark])

  useEffect(() => {
    const saved = localStorage.getItem('theme')
    if (saved === 'dark') setIsDark(true)
    else if (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches) setIsDark(true)
  }, [])

  // Close language picker on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (langRef.current && !langRef.current.contains(event.target as Node)) {
        setLangOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center gap-4">
        <Link to="/" className="flex items-center gap-2 font-semibold">
          <div className="h-8 w-8 rounded-lg gradient-translator flex items-center justify-center">
            <Languages className="h-4.5 w-4.5 text-white" />
          </div>
          <span className="hidden sm:inline">guide<span className="gradient-text-translator">translator</span></span>
        </Link>

        <nav className="flex items-center gap-1 ml-4">
          {NAV_ITEMS.map(item => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
                location.pathname === item.path
                  ? 'bg-accent text-accent-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          {/* Network Status Indicator */}
          <div
            className={cn(
              'flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium transition-colors',
              networkMode === 'online' ? 'text-emerald-700 dark:text-emerald-400' :
              networkMode === 'degraded' ? 'text-amber-700 dark:text-amber-400' :
              'text-destructive'
            )}
            title={
              networkMode === 'online' ? t('status.online') :
              networkMode === 'degraded' ? t('status.degraded') :
              t('status.offline')
            }
          >
            {networkMode === 'online' ? <Wifi className="h-3.5 w-3.5" /> :
             networkMode === 'degraded' ? <Signal className="h-3.5 w-3.5" /> :
             <WifiOff className="h-3.5 w-3.5" />}
            <span className="hidden sm:inline">
              {networkMode === 'online' ? t('status.online') :
               networkMode === 'degraded' ? t('status.degraded') :
               t('status.offline')}
            </span>
          </div>

          {/* UI Language Selector */}
          <div className="relative" ref={langRef}>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setLangOpen(!langOpen)}
              title={t('lang.select')}
            >
              <Globe className="h-4 w-4" />
            </Button>
            {langOpen && (
              <div className="absolute top-full right-0 mt-1 w-48 bg-popover border border-border rounded-lg shadow-lg z-50 overflow-hidden">
                {UI_LANGUAGES.map(lang => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      setUILang(lang.code as UILanguage)
                      setLangOpen(false)
                    }}
                    className={cn(
                      'flex items-center gap-2.5 px-3 py-2 w-full text-left hover:bg-accent transition-colors text-sm',
                      uiLang === lang.code && 'bg-accent font-medium'
                    )}
                  >
                    <span>{lang.flag}</span>
                    <span className="flex-1">{lang.nativeName}</span>
                    {uiLang === lang.code && (
                      <div className="h-2 w-2 rounded-full bg-primary" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Settings */}
          <Link to="/settings">
            <Button
              variant="ghost"
              size="icon"
              title={t('nav.settings')}
              className={cn(
                location.pathname === '/settings' && 'bg-accent'
              )}
            >
              <Settings className="h-4 w-4" />
            </Button>
          </Link>

          {/* Dark mode toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsDark(!isDark)}
            title={isDark ? t('theme.light') : t('theme.dark')}
          >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    </header>
  )
}
