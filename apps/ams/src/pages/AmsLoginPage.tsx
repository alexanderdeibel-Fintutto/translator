/**
 * AMS Login Page — ams.fintutto.world/login
 *
 * Dedicated login for the Account Management System.
 * Only accessible for: admin, sales_agent, session_manager, tester roles.
 */
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUser } from '@/context/UserContext'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Loader2, Mail, Lock, Eye, EyeOff, ShieldCheck, AlertCircle } from 'lucide-react'

export default function AmsLoginPage() {
  const [email, setEmail]           = useState('')
  const [password, setPassword]     = useState('')
  const [showPw, setShowPw]         = useState(false)
  const [loading, setLoading]       = useState(false)
  const [error, setError]           = useState<string | null>(null)
  const { user, isLoading, isAuthenticated, isSalesAgent, signIn } = useUser()
  const navigate = useNavigate()

  useEffect(() => {
    if (!isLoading && isAuthenticated && isSalesAgent) {
      navigate('/', { replace: true })
    }
  }, [isLoading, isAuthenticated, isSalesAgent, navigate])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (isAuthenticated && !isSalesAgent) {
    return (
      <div className="flex items-center justify-center min-h-screen px-4">
        <Card className="w-full max-w-sm p-8 text-center space-y-4">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
          <h2 className="text-xl font-bold">Kein AMS-Zugang</h2>
          <p className="text-sm text-muted-foreground">
            Dein Konto ({user?.email}) hat keine AMS-Berechtigung.
          </p>
          <Button variant="outline" onClick={() => navigate('https://fintutto.world')}>
            Zurück zu fintutto.world
          </Button>
        </Card>
      </div>
    )
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await signIn(email, password)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Anmeldung fehlgeschlagen')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background px-4">
      <div className="w-full max-w-sm space-y-6">
        {/* Branding */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-2">
            <ShieldCheck className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold">Fintutto AMS</h1>
          <p className="text-sm text-muted-foreground">Account Management System</p>
        </div>

        {/* Login Form */}
        <Card className="p-6">
          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {error}
              </div>
            )}

            <div className="space-y-1">
              <label className="text-sm font-medium">E-Mail</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  className="w-full pl-9 pr-4 py-2 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  placeholder="admin@fintutto.world"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium">Passwort</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="w-full pl-9 pr-10 py-2 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Anmelden
            </Button>
          </form>
        </Card>

        <p className="text-center text-xs text-muted-foreground">
          Nur für autorisierte Fintutto-Mitarbeiter und Partner
        </p>
      </div>
    </div>
  )
}
