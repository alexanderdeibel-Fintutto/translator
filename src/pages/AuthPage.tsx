import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useUser } from '@/context/UserContext'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Loader2, Mail, Lock, Eye, EyeOff, Languages } from 'lucide-react'

export default function AuthPage() {
  const [mode, setMode] = useState<'login' | 'signup' | 'reset'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const { signIn, signUp, isAuthenticated } = useUser()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const redirect = searchParams.get('redirect') || '/'

  // Already logged in — redirect
  if (isAuthenticated) {
    navigate(redirect, { replace: true })
    return null
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
        await signIn(email, password)
        navigate(redirect, { replace: true })
      } else {
        await signUp(email, password)
        setSuccess('Bestätigungs-E-Mail gesendet! Bitte prüfe dein Postfach.')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten.')
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
      </div>
    </div>
  )
}
