'use client'

import { useState } from 'react'

/**
 * Museum CMS Login Page
 * Branded for the Art Guide portal with museum staff authentication.
 */
export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // TODO: Implement Supabase auth
      console.log('Login:', email)
    } catch {
      setError('Login fehlgeschlagen. Bitte pruefen Sie Ihre Zugangsdaten.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-950 to-indigo-900">
      <div className="w-full max-w-md p-8">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-4">🏛</div>
          <h1 className="text-2xl font-bold text-white">Art Guide Portal</h1>
          <p className="text-white/60 mt-2">Museum Content Management System</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="bg-white rounded-2xl p-6 shadow-xl space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-red-50 text-red-700 text-sm">{error}</div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">E-Mail</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="museum@beispiel.de"
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition"
              required
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
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg bg-indigo-900 text-white font-medium hover:bg-indigo-800 disabled:opacity-50 transition"
          >
            {loading ? 'Wird eingeloggt...' : 'Einloggen'}
          </button>

          <p className="text-center text-sm text-gray-500">
            Noch keinen Zugang? Kontaktieren Sie uns.
          </p>
        </form>

        {/* Footer */}
        <p className="text-center text-white/30 text-xs mt-8">
          powered by Fintutto Art Guide
        </p>
      </div>
    </div>
  )
}
