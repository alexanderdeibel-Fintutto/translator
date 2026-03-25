'use client'
import Link from 'next/link'
export default function SessionsPage() {
  return (
    <>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">🎤 Sessions & Programm</h1>
          <p className="text-gray-500 mt-1">Alle Konferenzsessions verwalten</p>
        </div>
        <Link href="/dashboard/import/conference" className="px-4 py-2 rounded-lg bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 transition">+ Programm importieren</Link>
      </div>
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-12 text-center">
        <div className="text-5xl mb-4">🎤</div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">Noch keine Sessions</h2>
        <p className="text-slate-600 mb-4">Importieren Sie Ihr Konferenzprogramm (PDF, Excel oder URL), um Sessions automatisch zu erstellen.</p>
        <Link href="/dashboard/import/conference" className="inline-block px-6 py-3 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 transition">Programm importieren →</Link>
      </div>
    </>
  )
}
