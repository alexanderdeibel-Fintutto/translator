import { Languages, Sun, Moon, Settings, Wifi, WifiOff, Signal, Globe, Menu, X, User, Crown, LogOut, Shield } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useOffline } from '@/context/OfflineContext'
import { useI18n } from '@/context/I18nContext'
import { useUser } from '@/context/UserContext'
import { UI_LANGUAGES, type UILanguage } from '@/lib/i18n'
import { useTheme } from '@/hooks/useTheme'

export default function Header() {
  const location = useLocation()
  const navigate = useNavigate()
  const { networkMode } = useOffline()
  const { t, uiLang, setUILang } = useI18n()
  const { theme, toggle: toggleTheme } = useTheme()
  const { user, isAuthenticated, tier, isSalesAgent, signOut } = useUser()
  const isDark = theme === 'dark' || (theme === 'system' && typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches)
  const [langOpen, setLangOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const langRef = useRef<HTMLDivElement>(null)
  const mobileMenuRef = useRef<HTMLDivElement>(null)
  const userMenuRef = useRef<HTMLDivElement>(null)

  const NAV_ITEMS = [
    { label: t('nav.translator'), path: '/' },
    { label: t('nav.live'), path: '/live' },
    { label: t('nav.conversation'), path: '/conversation' },
    { label: t('nav.camera'), path: '/camera' },
    { label: t('nav.phrasebook'), path: '/phrasebook' },
    { label: t('nav.favorites'), path: '/favorites' },
    { label: t('nav.history'), path: '/history' },
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
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false)
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
    <header
      className="sticky top-0 z-50 w-full"
      style={{
        background: 'rgba(20, 10, 35, 0.75)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(255,255,255,0.12)',
      }}
      role="banner"
    >
      <div className="container flex h-14 items-center gap-4">
        <Link to="/" className="flex items-center gap-2 font-semibold" aria-label={t('header.homeAriaLabel')}>
          <img src="/app-logo.svg" alt="Fintutto" className="h-8 w-8 rounded-lg" />
          <span className="hidden sm:inline text-white drop-shadow">
            guide<span className="gradient-text-translator">translator</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1 ml-4" aria-label={t('nav.mainNavigation')}>
          {NAV_ITEMS.map(item => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
                location.pathname === item.path
                  ? 'bg-white/20 text-white'
                  : 'text-white/75 hover:text-white hover:bg-white/10'
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
            className="text-white hover:bg-white/10"
          >
            {mobileMenuOpen
              ? <X className="h-5 w-5" aria-hidden="true" />
              : <Menu className="h-5 w-5" aria-hidden="true" />}
          </Button>

          {mobileMenuOpen && (
            <div
              className="absolute top-14 left-0 right-0 z-50 animate-in slide-in-from-top-2 duration-200"
              style={{
                background: 'rgba(20, 10, 35, 0.92)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                borderBottom: '1px solid rgba(255,255,255,0.15)',
              }}
            >
              <nav className="container py-3 flex flex-col gap-0.5" aria-label="Mobile Navigation">
                {NAV_ITEMS.map(item => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={cn(
                      'px-4 py-3 rounded-lg text-sm font-medium transition-colors',
                      location.pathname === item.path
                        ? 'bg-white/20 text-white font-semibold'
                        : 'text-white/85 hover:text-white hover:bg-white/10'
                    )}
                  >
                    {item.label}
                  </Link>
                ))}
                <div className="my-1.5 border-t border-white/10" />
                <Link
                  to="/pricing"
                  className={cn(
                    'px-4 py-3 rounded-lg text-sm font-medium transition-colors',
                    location.pathname === '/pricing'
                      ? 'bg-white/20 text-white font-semibold'
                      : 'text-white/85 hover:text-white hover:bg-white/10'
                  )}
                >
                  Preise
                </Link>
                <Link
                  to="/settings"
                  className={cn(
                    'px-4 py-3 rounded-lg text-sm font-medium transition-colors',
                    location.pathname === '/settings'
                      ? 'bg-white/20 text-white font-semibold'
                      : 'text-white/85 hover:text-white hover:bg-white/10'
                  )}
                >
                  {t('nav.settings')}
                </Link>
                <Link
                  to="/offline-setup"
                  className={cn(
                    'px-4 py-3 rounded-lg text-sm font-medium transition-colors flex items-center gap-2',
                    location.pathname === '/offline-setup'
                      ? 'bg-white/20 text-white font-semibold'
                      : 'text-white/85 hover:text-white hover:bg-white/10'
                  )}
                >
                  <WifiOff className="h-4 w-4" />
                  Offline-Einrichtung
                </Link>
                <Link
                  to={isSalesAgent ? '/admin' : '/crm'}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    'px-4 py-3 rounded-lg text-sm font-medium transition-colors flex items-center gap-2',
                    (location.pathname.startsWith('/admin') || location.pathname === '/crm')
                      ? 'bg-white/20 text-white font-semibold'
                      : 'text-sky-300 hover:text-white hover:bg-white/10'
                  )}
                >
                  <Shield className="h-4 w-4" />
                  CRM
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
              networkMode === 'online' ? 'text-emerald-300' :
              networkMode === 'degraded' ? 'text-amber-300' :
              'text-red-300'
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
              className="text-white/80 hover:text-white hover:bg-white/10"
            >
              <Globe className="h-4 w-4" aria-hidden="true" />
            </Button>
            {langOpen && (
              <div
                className="absolute top-full right-0 mt-1 w-48 rounded-lg shadow-2xl z-50 overflow-hidden"
                style={{
                  background: 'rgba(20, 10, 35, 0.95)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255,255,255,0.15)',
                }}
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
                      'flex items-center gap-2.5 px-3 py-2.5 w-full text-left transition-colors text-sm text-white/85 hover:text-white hover:bg-white/10',
                      uiLang === lang.code && 'bg-white/15 font-medium text-white'
                    )}
                  >
                    <span>{lang.flag}</span>
                    <span className="flex-1">{lang.nativeName}</span>
                    {uiLang === lang.code && (
                      <div className="h-2 w-2 rounded-full bg-sky-400" aria-hidden="true" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Offline Setup (desktop only) */}
          <Link to="/offline-setup" className="hidden md:block">
            <Button
              variant="ghost"
              size="icon"
              aria-label="Offline-Einrichtung"
              className={cn(
                'text-white/80 hover:text-white hover:bg-white/10',
                location.pathname === '/offline-setup' && 'bg-white/15 text-white'
              )}
            >
              <WifiOff className="h-4 w-4" aria-hidden="true" />
            </Button>
          </Link>

          {/* Settings (desktop only) */}
          <Link to="/settings" className="hidden md:block">
            <Button
              variant="ghost"
              size="icon"
              aria-label={t('nav.settings')}
              className={cn(
                'text-white/80 hover:text-white hover:bg-white/10',
                location.pathname === '/settings' && 'bg-white/15 text-white'
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
            className="text-white/80 hover:text-white hover:bg-white/10"
          >
            {isDark ? <Sun className="h-4 w-4" aria-hidden="true" /> : <Moon className="h-4 w-4" aria-hidden="true" />}
          </Button>

          {/* CRM Direct Login */}
          <Link to={isSalesAgent ? '/admin' : '/crm'} className="hidden md:block">
            <Button
              variant="ghost"
              size="icon"
              aria-label="CRM"
              className={cn(
                'text-white/80 hover:text-white hover:bg-white/10',
                (location.pathname === '/crm' || location.pathname.startsWith('/admin')) && 'bg-white/15 text-white'
              )}
            >
              <Shield className="h-4 w-4" aria-hidden="true" />
            </Button>
          </Link>

          {/* User menu / Login */}
          {isAuthenticated ? (
            <div className="relative" ref={userMenuRef}>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                aria-expanded={userMenuOpen}
                aria-haspopup="menu"
                aria-label="Benutzermenu"
                className="relative text-white/80 hover:text-white hover:bg-white/10"
              >
                <User className="h-4 w-4" aria-hidden="true" />
                {tier.id !== 'free' && (
                  <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-sky-400 border-2 border-transparent" />
                )}
              </Button>
              {userMenuOpen && (
                <div
                  className="absolute top-full right-0 mt-1 w-56 rounded-lg shadow-2xl z-50 overflow-hidden"
                  style={{
                    background: 'rgba(20, 10, 35, 0.95)',
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255,255,255,0.15)',
                  }}
                >
                  <div className="px-3 py-2.5 border-b border-white/10">
                    <div className="text-sm font-medium truncate text-white">{user?.displayName || user?.email}</div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <Crown className="h-3 w-3 text-sky-400" />
                      <span className="text-xs text-sky-400 font-medium">{tier.displayName}</span>
                    </div>
                  </div>
                  <Link
                    to="/account"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2.5 text-sm text-white/85 hover:text-white hover:bg-white/10 transition-colors"
                  >
                    <User className="h-4 w-4 text-white/50" />
                    Mein Konto
                  </Link>
                  <Link
                    to="/pricing"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2.5 text-sm text-white/85 hover:text-white hover:bg-white/10 transition-colors"
                  >
                    <Crown className="h-4 w-4 text-white/50" />
                    Preise & Pakete
                  </Link>
                  {isSalesAgent && (
                    <Link
                      to="/admin"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2 px-3 py-2.5 text-sm text-white/85 hover:text-white hover:bg-white/10 transition-colors"
                    >
                      <Shield className="h-4 w-4 text-white/50" />
                      Admin CRM
                    </Link>
                  )}
                  <button
                    onClick={async () => {
                      setUserMenuOpen(false)
                      await signOut()
                      navigate('/')
                    }}
                    className="flex items-center gap-2 px-3 py-2.5 text-sm text-red-300 hover:text-red-200 hover:bg-white/10 transition-colors w-full text-left"
                  >
                    <LogOut className="h-4 w-4" />
                    Abmelden
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/auth">
              <Button
                size="sm"
                className="text-xs gap-1.5 gradient-translator text-white shadow-md border-0"
              >
                <User className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Anmelden</span>
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
