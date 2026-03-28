/**
 * CmsLoginPage — Zentraler Einstieg für cms.fintutto.world
 *
 * Anbieter, Redakteure und Institutionen melden sich hier an.
 * Nach Login: Weiterleitung zu /dashboard (Übersicht)
 * oder direkt zu /:slug (wenn nur eine Institution verwaltet wird)
 */
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BookOpen, Globe, Building2, MapPin, Landmark, ArrowRight, Eye, EyeOff } from 'lucide-react'

export default function CmsLoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      // Supabase-Auth über shared UserContext
      const { createClient } = await import('@supabase/supabase-js')
      const supabase = createClient(
        import.meta.env.VITE_SUPABASE_URL,
        import.meta.env.VITE_SUPABASE_ANON_KEY
      )
      const { error: authError } = await supabase.auth.signInWithPassword({ email, password })
      if (authError) throw authError
      navigate('/dashboard')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Anmeldung fehlgeschlagen')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-emerald-950 to-slate-950 flex flex-col items-center justify-center p-4">
      {/* Logo */}
      <div className="flex items-center gap-3 mb-8">
        <div className="p-2 rounded-xl bg-emerald-500/20">
          <BookOpen className="h-7 w-7 text-emerald-400" />
        </div>
        <div>
          <div className="text-xl font-bold text-white">Fintutto CMS</div>
          <div className="text-xs text-white/50">Content Management System</div>
        </div>
      </div>

      {/* Login-Karte */}
      <div className="w-full max-w-sm bg-white/5 border border-white/10 rounded-2xl p-6">
        <h1 className="text-lg font-semibold text-white mb-1">Anmelden</h1>
        <p className="text-sm text-white/50 mb-6">
          Für Anbieter, Institutionen und Redakteure
        </p>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs text-white/60 mb-1.5">E-Mail</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="name@institution.de"
              required
              className="w-full px-3 py-2.5 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/30 text-sm focus:outline-none focus:border-emerald-400 transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs text-white/60 mb-1.5">Passwort</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-3 py-2.5 pr-10 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/30 text-sm focus:outline-none focus:border-emerald-400 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {error && (
            <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-sm transition-colors"
          >
            {loading ? (
              <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                Anmelden
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>
      </div>

      {/* Anbieter-Typen */}
      <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-sm sm:max-w-xl w-full">
        {[
          { icon: Landmark,  label: 'Museen & Galerien' },
          { icon: MapPin,    label: 'Stadtführer & POIs' },
          { icon: Globe,     label: 'Regionen & Städte' },
          { icon: Building2, label: 'Restaurants & Handel' },
        ].map(item => (
          <div key={item.label} className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-white/5 border border-white/10 text-center">
            <item.icon className="h-5 w-5 text-emerald-400" />
            <span className="text-xs text-white/60">{item.label}</span>
          </div>
        ))}
      </div>

      <p className="mt-6 text-xs text-white/30">
        Noch kein Zugang?{' '}
        <a href="https://fintutto.world/contact" className="text-emerald-400 hover:text-emerald-300 transition-colors">
          Zugang anfragen
        </a>
      </p>
    </div>
  )
}
