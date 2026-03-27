import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useUser } from '@/context/UserContext'
import { useOffline } from '@/context/OfflineContext'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Loader2, Mail, Lock, Eye, EyeOff, Languages, WifiOff } from 'lucide-react'

export default function AuthPage() {
  const [mode, setMode] = useState<'login' | 'signup' | 'reset'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const { signIn, signUp, isAuthenticated } = useUser()
  const { isOffline } = useOffline()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const redirect = searchParams.get('redirect') || '/'

  // Already logged in — redirect
  if (isAuthenticated) {
    navigate(redirect, { replace: true })
    return null
  }

  // Offline: show helpful message instead of a login form that will fail
  if (isOffline) {
    return (
      <div className="relative flex items-center justify-center min-h-[60vh] px-4">
        <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-0">
          <img src="/fintutto-logo.svg" alt="" className="w-[800px] h-[800px] sm:w-[1000px] sm:h-[1000px] opacity-[0.22]" />
        </div>
        <div className="relative z-10 w-full max-w-md text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-amber-500/20 backdrop-blur-md border border-amber-400/30 mb-4">
            <WifiOff className="w-8 h-8 text-amber-300" />
          </div>
          <h1 className="text-2xl font-bold text-white drop-shadow-lg">Offline</h1>
          <p className="text-white/80">
            Anmeldung ist ohne Internetverbindung nicht möglich.
            Bitte stelle eine Verbindung her und versuche es erneut.
          </p>
          <p className="text-sm text-white/60">
            Viele Funktionen wie Übersetzer, Kamera und Phrasebook
            funktionieren auch offline.
          </p>
          <Button onClick={() => navigate('/')} variant="outline" className="mt-4 border-white/30 text-white hover:bg-white/10">
            Zur Startseite
          </Button>
        </div>
      </div>
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setLoading(true)

    try {
      if (mode === 'reset') {
        const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/auth`,
        })
        if (resetError) throw resetError
        setSuccess('Link zum Zurücksetzen gesendet! Bitte prüfe dein Postfach.')
      } else if (mode === 'login') {
        let lastError: Error | null = null
        for (let attempt = 0; attempt < 3; attempt++) {
          try {
            await signIn(email, password)
            navigate(redirect, { replace: true })
            return
          } catch (err) {
            lastError = err instanceof Error ? err : new Error(String(err))
            const msg = lastError.message
            if (msg === 'Failed to fetch' || msg.includes('NetworkError') || msg.includes('network') || msg.includes('ECONNREFUSED')) {
              if (attempt < 2) {
                await new Promise(r => setTimeout(r, 1000 * (attempt + 1)))
                continue
              }
            }
            throw lastError
          }
        }
        if (lastError) throw lastError
      } else {
        await signUp(email, password)
        setSuccess('Bestätigungs-E-Mail gesendet! Bitte prüfe dein Postfach.')
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten.'
      if (msg === 'Failed to fetch' || msg.includes('NetworkError') || msg.includes('network')) {
        setError('Keine Internetverbindung. Bitte prüfe dein Netzwerk und versuche es erneut.')
      } else {
        setError(msg)
      }
    } finally {
      setLoading(false)
    }
  }

  function switchMode(newMode: 'login' | 'signup' | 'reset') {
    setMode(newMode)
    setError(null)
    setSuccess(null)
  }

  const title = mode === 'login' ? 'Anmelden' : mode === 'signup' ? 'Konto erstellen' : 'Passwort zurücksetzen'
  const subtitle = mode === 'login'
    ? 'Melde dich an, um alle Funktionen zu nutzen.'
    : mode === 'signup'
      ? 'Erstelle ein kostenloses Konto, um loszulegen.'
      : 'Gib deine E-Mail ein, um einen Reset-Link zu erhalten.'

  return (
    <div className="relative flex items-center justify-center min-h-[60vh] px-4">
<div className="relative z-10 w-full max-w-md">
        {/* Glasskarte */}
        <div className="rounded-2xl bg-black/30 backdrop-blur-md border border-white/20 shadow-2xl p-6 sm:p-8">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl gradient-translator mb-4 shadow-lg">
              <Languages className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white drop-shadow">{title}</h1>
            <p className="text-white/70 mt-1 text-sm">{subtitle}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-lg bg-red-500/20 border border-red-400/30 text-red-200 text-sm">
                {error}
              </div>
            )}
            {success && (
              <div className="p-3 rounded-lg bg-green-500/20 border border-green-400/30 text-green-200 text-sm">
                {success}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-white/90 mb-1.5">
                E-Mail
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/50" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                  autoComplete="email"
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-white/20 bg-white/10 text-white placeholder-white/40 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400/50 focus:border-sky-400/50"
                />
              </div>
            </div>

            {mode !== 'reset' && (
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-white/90 mb-1.5">
                  Passwort
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/50" />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={mode === 'signup' ? 'Min. 8 Zeichen' : 'Passwort'}
                    required
                    minLength={mode === 'signup' ? 8 : undefined}
                    autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                    className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-white/20 bg-white/10 text-white placeholder-white/40 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400/50 focus:border-sky-400/50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => switchMode('reset')}
                    className="mt-1.5 text-xs text-white/50 hover:text-sky-300 hover:underline"
                  >
                    Passwort vergessen?
                  </button>
                )}
              </div>
            )}

            <Button type="submit" className="w-full gradient-translator text-white font-semibold shadow-lg" disabled={loading}>
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              {mode === 'login' ? 'Anmelden' : mode === 'signup' ? 'Konto erstellen' : 'Reset-Link senden'}
            </Button>
          </form>

          <div className="mt-5 text-center text-sm text-white/60">
            {mode === 'login' ? (
              <>
                Noch kein Konto?{' '}
                <button
                  onClick={() => switchMode('signup')}
                  className="text-sky-300 hover:underline font-medium"
                >
                  Registrieren
                </button>
              </>
            ) : (
              <>
                {mode === 'reset' ? 'Passwort eingefallen?' : 'Bereits registriert?'}{' '}
                <button
                  onClick={() => switchMode('login')}
                  className="text-sky-300 hover:underline font-medium"
                >
                  Anmelden
                </button>
              </>
            )}
          </div>
        </div>

        {/* Build version — helps debug stale PWA cache issues */}
        <p className="mt-4 text-center text-[10px] text-white/30 font-mono select-all">
          v{typeof __BUILD_TIME__ !== 'undefined' ? __BUILD_TIME__.slice(0, 16).replace('T', ' ') : '?'}
        </p>
      </div>
    </div>
  )
}
