'use client'
import { useState } from 'react'
import Link from 'next/link'

export default function ImportCityPage() {
  const [city, setCity] = useState('')
  const [loading, setLoading] = useState(false)

  const handleImport = async () => {
    if (!city.trim()) return
    setLoading(true)
    setTimeout(() => setLoading(false), 2000)
  }

  return (
    <div className="p-8 max-w-xl">
      <div className="mb-4">
        <Link href="/dashboard/import" className="text-slate-400 hover:text-white text-sm">← Zurück zum Import</Link>
      </div>
      <h1 className="text-2xl font-bold text-white mb-6">Stadt-Import</h1>
      <div className="bg-slate-800 rounded-xl p-6 space-y-4">
        <div>
          <label className="block text-sm text-slate-400 mb-1">Stadtname</label>
          <input
            type="text"
            value={city}
            onChange={e => setCity(e.target.value)}
            placeholder="z.B. Berlin"
            className="w-full bg-slate-700 text-white rounded-lg px-4 py-2 border border-slate-600 focus:outline-none focus:border-cyan-500"
          />
        </div>
        <button
          onClick={handleImport}
          disabled={loading || !city.trim()}
          className="w-full bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white rounded-lg px-4 py-2 font-medium transition-colors"
        >
          {loading ? 'Importiere…' : 'Import starten'}
        </button>
      </div>
    </div>
  )
}
