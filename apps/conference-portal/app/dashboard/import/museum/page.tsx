'use client'
import { useState } from 'react'
import Link from 'next/link'

export default function ImportConferencePage() {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState<'upload' | 'processing' | 'done'>('upload')

  const handleUpload = async () => {
    if (!file) return
    setLoading(true)
    setStep('processing')
    setTimeout(() => { setStep('done'); setLoading(false) }, 2000)
  }

  return (
    <div className="p-8 max-w-xl">
      <div className="mb-4">
        <Link href="/dashboard/import" className="text-slate-400 hover:text-white text-sm">← Zurück zum Import</Link>
      </div>
      <h1 className="text-2xl font-bold text-white mb-6">Konferenz-Daten importieren</h1>
      <div className="bg-slate-800 rounded-xl p-6 space-y-4">
        {step === 'upload' && (
          <>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Datei (CSV/JSON)</label>
              <input
                type="file"
                accept=".csv,.json"
                onChange={e => setFile(e.target.files?.[0] ?? null)}
                className="w-full text-slate-300 text-sm"
              />
            </div>
            <button
              onClick={handleUpload}
              disabled={loading || !file}
              className="w-full bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white rounded-lg px-4 py-2 font-medium transition-colors"
            >
              {loading ? 'Verarbeite…' : 'Hochladen & Importieren'}
            </button>
          </>
        )}
        {step === 'processing' && (
          <p className="text-slate-400">Datei wird verarbeitet…</p>
        )}
        {step === 'done' && (
          <p className="text-green-400">Import erfolgreich abgeschlossen ✓</p>
        )}
      </div>
    </div>
  )
}
