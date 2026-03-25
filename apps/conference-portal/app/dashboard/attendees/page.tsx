'use client'
import Link from 'next/link'
export default function AttendeesPage() {
  return (
    <>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">👥 Teilnehmer</h1>
          <p className="text-gray-500 mt-1">Alle Kongressteilnehmer verwalten</p>
        </div>
        <button className="px-4 py-2 rounded-lg bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 transition">+ Teilnehmer importieren</button>
      </div>
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-12 text-center">
        <div className="text-5xl mb-4">👥</div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">Noch keine Teilnehmer</h2>
        <p className="text-slate-600 mb-4">Importieren Sie Ihre Teilnehmerliste (CSV/Excel) oder senden Sie Einladungen direkt aus dem Portal.</p>
        <Link href="/dashboard/invite-campaigns" className="inline-block px-6 py-3 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 transition">Einladungen senden →</Link>
      </div>
    </>
  )
}
