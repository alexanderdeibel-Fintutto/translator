import { Languages, Sun, Moon, Settings, Wifi, WifiOff, Signal, Globe, Menu, X } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useOffline } from '@/context/OfflineContext'
import { useI18n } from '@/context/I18nContext'
import { UI_LANGUAGES, type UILanguage } from '@/lib/i18n'
import { useTheme } from '@/hooks/useTheme'

export default function Header() {
  const location = useLocation()
  const { networkMode } = useOffline()
  const { t, uiLang, setUILang } = useI18n()
  const { theme, toggle: toggleTheme } = useTheme()
  const isDark = theme === 'dark' || (theme === 'system' && typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches)
  const [langOpen, setLangOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const langRef = useRef<HTMLDivElement>(null)
  const mobileMenuRef = useRef<HTMLDivElement>(null)

  const NAV_ITEMS = [
    { label: t('nav.translator'), path: '/' },
    { label: t('nav.live'), path: '/live' },
    { label: t('nav.conversation'), path: '/conversation' },
    { label: t('nav.camera'), path: '/camera' },
    { label: t('nav.phrasebook'), path: '/phrasebook' },
    { label: t('nav.info'), path: '/info' },
  ]

  // Close menus on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (langRef.current && !langRef.current.contains(event.target as Node)) {
        setLangOpen(false)
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setMobileMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false)
  }, [location.pathname])

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60" role="banner">
      <div className="container flex h-14 items-center gap-4">
        <Link to="/" className="flex items-center gap-2 font-semibold" aria-label={t('header.homeAriaLabel')}>
          <div className="h-8 w-8 rounded-lg gradient-translator flex items-center justify-center">
            <Languages className="h-4.5 w-4.5 text-white" aria-hidden="true" />
          </div>
          <span className="hidden sm:inline">guide<span className="gradient-text-translator">translator</span></span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1 ml-4" aria-label="Hauptnavigation">
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

        {/* Mobile hamburger */}
        <div className="md:hidden ml-2" ref={mobileMenuRef}>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-expanded={mobileMenuOpen}
            aria-label={mobileMenuOpen ? t('header.menuClose') : t('header.menuOpen')}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>

          {mobileMenuOpen && (
            <div className="absolute top-14 left-0 right-0 bg-background border-b border-border shadow-lg z-50 animate-in slide-in-from-top-2 duration-200">
              <nav className="container py-2 flex flex-col" aria-label="Mobile Navigation">
                {NAV_ITEMS.map(item => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={cn(
                      'px-4 py-2.5 rounded-md text-sm font-medium transition-colors',
                      location.pathname === item.path
                        ? 'bg-accent text-accent-foreground'
                        : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                    )}
                  >
                    {item.label}
                  </Link>
                ))}
                <Link
                  to="/settings"
                  className={cn(
                    'px-4 py-2.5 rounded-md text-sm font-medium transition-colors',
                    location.pathname === '/settings'
                      ? 'bg-accent text-accent-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                  )}
                >
                  {t('nav.settings')}
                </Link>
              </nav>
            </div>
          )}
        </div>

        <div className="ml-auto flex items-center gap-2">
          {/* Network Status Indicator */}
          <div
            className={cn(
              'flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium transition-colors',
              networkMode === 'online' ? 'text-emerald-700 dark:text-emerald-400' :
              networkMode === 'degraded' ? 'text-amber-700 dark:text-amber-400' :
              'text-destructive'
            )}
            role="status"
            aria-label={
              networkMode === 'online' ? t('status.online') :
              networkMode === 'degraded' ? t('status.degraded') :
              t('status.offline')
            }
          >
            {networkMode === 'online' ? <Wifi className="h-3.5 w-3.5" aria-hidden="true" /> :
             networkMode === 'degraded' ? <Signal className="h-3.5 w-3.5" aria-hidden="true" /> :
             <WifiOff className="h-3.5 w-3.5" aria-hidden="true" />}
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
              aria-expanded={langOpen}
              aria-haspopup="listbox"
              aria-label={t('lang.select')}
            >
              <Globe className="h-4 w-4" aria-hidden="true" />
            </Button>
            {langOpen && (
              <div
                className="absolute top-full right-0 mt-1 w-48 bg-popover border border-border rounded-lg shadow-lg z-50 overflow-hidden"
                role="listbox"
                aria-label={t('lang.select')}
                onKeyDown={(e) => { if (e.key === 'Escape') setLangOpen(false) }}
              >
                {UI_LANGUAGES.map(lang => (
                  <button
                    key={lang.code}
                    role="option"
                    aria-selected={uiLang === lang.code}
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
                      <div className="h-2 w-2 rounded-full bg-primary" aria-hidden="true" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Settings (desktop only) */}
          <Link to="/settings" className="hidden md:block">
            <Button
              variant="ghost"
              size="icon"
              aria-label={t('nav.settings')}
              className={cn(
                location.pathname === '/settings' && 'bg-accent'
              )}
            >
              <Settings className="h-4 w-4" aria-hidden="true" />
            </Button>
          </Link>

          {/* Dark mode toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            aria-label={isDark ? t('theme.light') : t('theme.dark')}
          >
            {isDark ? <Sun className="h-4 w-4" aria-hidden="true" /> : <Moon className="h-4 w-4" aria-hidden="true" />}
          </Button>
        </div>
      </div>
    </header>
  )
}
