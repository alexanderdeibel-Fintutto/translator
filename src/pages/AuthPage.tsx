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
      <div className="flex items-center justify-center min-h-[60vh] px-4">
        <div className="w-full max-w-md text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-amber-100 dark:bg-amber-900/30 mb-4">
            <WifiOff className="w-8 h-8 text-amber-600 dark:text-amber-400" />
          </div>
          <h1 className="text-2xl font-bold">Offline</h1>
          <p className="text-muted-foreground">
            Anmeldung ist ohne Internetverbindung nicht moeglich.
            Bitte stelle eine Verbindung her und versuche es erneut.
          </p>
          <p className="text-sm text-muted-foreground">
            Viele Funktionen wie Uebersetzer, Kamera und Phrasebook
            funktionieren auch offline.
          </p>
          <Button onClick={() => navigate('/')} variant="outline" className="mt-4">
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
        setSuccess('Link zum Zuruecksetzen gesendet! Bitte pruefe dein Postfach.')
      } else if (mode === 'login') {
        // Retry login up to 2 times on network errors (flaky mobile connections)
        let lastError: Error | null = null
        for (let attempt = 0; attempt < 3; attempt++) {
          try {
            await signIn(email, password)
            navigate(redirect, { replace: true })
            return // Success — exit early
          } catch (err) {
            lastError = err instanceof Error ? err : new Error(String(err))
            const msg = lastError.message
            // Only retry on network errors, not auth errors (wrong password etc.)
            if (msg === 'Failed to fetch' || msg.includes('NetworkError') || msg.includes('network') || msg.includes('ECONNREFUSED')) {
              if (attempt < 2) {
                await new Promise(r => setTimeout(r, 1000 * (attempt + 1))) // 1s, 2s
                continue
              }
            }
            throw lastError // Non-network error or final attempt — throw
          }
        }
        if (lastError) throw lastError
      } else {
        await signUp(email, password)
        setSuccess('Bestaetigungs-E-Mail gesendet! Bitte pruefe dein Postfach.')
      }
    } catch (err) {
      // Show user-friendly message for network errors
      const msg = err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten.'
      if (msg === 'Failed to fetch' || msg.includes('NetworkError') || msg.includes('network')) {
        setError('Keine Internetverbindung. Bitte pruefe dein Netzwerk und versuche es erneut.')
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
    <div className="flex items-center justify-center min-h-[60vh] px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl gradient-translator mb-4">
            <Languages className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold">{title}</h1>
          <p className="text-muted-foreground mt-1">{subtitle}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
              {error}
            </div>
          )}
          {success && (
            <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 text-sm">
              {success}
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1.5">
              E-Mail
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                required
                autoComplete="email"
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
          </div>

          {mode !== 'reset' && (
            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-1.5">
                Passwort
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={mode === 'signup' ? 'Min. 8 Zeichen' : 'Passwort'}
                  required
                  minLength={mode === 'signup' ? 8 : undefined}
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {mode === 'login' && (
                <button
                  type="button"
                  onClick={() => switchMode('reset')}
                  className="mt-1.5 text-xs text-muted-foreground hover:text-primary hover:underline"
                >
                  Passwort vergessen?
                </button>
              )}
            </div>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : null}
            {mode === 'login' ? 'Anmelden' : mode === 'signup' ? 'Konto erstellen' : 'Reset-Link senden'}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-muted-foreground">
          {mode === 'login' ? (
            <>
              Noch kein Konto?{' '}
              <button
                onClick={() => switchMode('signup')}
                className="text-primary hover:underline font-medium"
              >
                Registrieren
              </button>
            </>
          ) : (
            <>
              {mode === 'reset' ? 'Passwort eingefallen?' : 'Bereits registriert?'}{' '}
              <button
                onClick={() => switchMode('login')}
                className="text-primary hover:underline font-medium"
              >
                Anmelden
              </button>
            </>
          )}
        </div>

        {/* Build version — helps debug stale PWA cache issues */}
        <p className="mt-8 text-center text-[10px] text-muted-foreground/40 font-mono select-all">
          v{typeof __BUILD_TIME__ !== 'undefined' ? __BUILD_TIME__.slice(0, 16).replace('T', ' ') : '?'}
        </p>
      </div>
    </div>
  )
}
