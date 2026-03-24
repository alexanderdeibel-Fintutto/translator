'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase-client'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirectTo') || '/dashboard'

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const supabase = createClient()

      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/dashboard` },
        })
        if (error) throw error
        setError(null)
        // Show confirmation message
        alert('Registrierung erfolgreich! Bitte prüfe deine E-Mails und bestätige deinen Account.')
        setMode('login')
        setLoading(false)
        return
      }

      router.push(redirectTo)
      router.refresh()
    } catch (err: any) {
      if (err.message?.includes('Invalid login credentials')) {
        setError('E-Mail oder Passwort falsch.')
      } else if (err.message?.includes('Email not confirmed')) {
        setError('Bitte bestätige zuerst deine E-Mail-Adresse.')
      } else {
        setError(err.message || 'Fehler beim Einloggen.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-950 to-indigo-900">
      <div className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="text-4xl mb-3">🏛</div>
          <h1 className="text-2xl font-bold text-white">Fintutto Guide Portal</h1>
          <p className="text-white/60 mt-2">Museum, City & Region Guide CMS</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 shadow-xl space-y-4">
          <h2 className="text-lg font-semibold text-gray-800 text-center">
            {mode === 'login' ? 'Einloggen' : 'Registrieren'}
          </h2>

          {error && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">E-Mail</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="email@beispiel.de"
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition"
              required
              autoComplete="email"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Passwort</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition"
              required
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              minLength={mode === 'register' ? 6 : undefined}
            />
            {mode === 'register' && (
              <p className="text-xs text-gray-400 mt-1">Mindestens 6 Zeichen</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg bg-indigo-900 text-white font-medium hover:bg-indigo-800 disabled:opacity-50 transition"
          >
            {loading
              ? (mode === 'login' ? 'Wird eingeloggt...' : 'Wird registriert...')
              : (mode === 'login' ? 'Einloggen' : 'Registrieren')}
          </button>

          <div className="text-center text-sm text-gray-500 pt-1">
            {mode === 'login' ? (
              <>
                Noch keinen Zugang?{' '}
                <button
                  type="button"
                  onClick={() => { setMode('register'); setError(null) }}
                  className="text-indigo-600 hover:underline font-medium"
                >
                  Jetzt registrieren
                </button>
              </>
            ) : (
              <>
                Bereits registriert?{' '}
                <button
                  type="button"
                  onClick={() => { setMode('login'); setError(null) }}
                  className="text-indigo-600 hover:underline font-medium"
                >
                  Einloggen
                </button>
              </>
            )}
          </div>
        </form>

        <p className="text-center text-white/30 text-xs mt-8">
          powered by Fintutto
        </p>
      </div>
    </div>
  )
}
