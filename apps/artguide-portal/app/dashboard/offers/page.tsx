'use client'

import { useState } from 'react'

export default function OffersPage() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Angebote</h1>
          <p className="text-gray-500 mt-1">Alle buchbaren Angebote von Partnern</p>
        </div>
        <button className="px-4 py-2 rounded-lg bg-indigo-900 text-white text-sm font-medium hover:bg-indigo-800 transition">
          + Neues Angebot
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Aktive Angebote', value: '0' },
          { label: 'Buchungen (Monat)', value: '0' },
          { label: 'Umsatz (Monat)', value: '0 EUR' },
          { label: 'Durchschn. Bewertung', value: '—' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="text-xl font-bold text-gray-900">{s.value}</div>
            <div className="text-xs text-gray-500 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-4">
        {[['all', 'Alle'], ['active', 'Aktiv'], ['draft', 'Entwurf'], ['expired', 'Abgelaufen']].map(([id, label]) => (
          <button
            key={id}
            onClick={() => setStatusFilter(id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              statusFilter === id
                ? 'bg-indigo-100 text-indigo-700'
                : 'bg-white text-gray-500 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
        <div className="flex items-center gap-4">
          <input
            type="search"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Angebot oder Partner suchen..."
            className="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-sm"
          />
          <select className="px-3 py-2 rounded-lg border border-gray-300 text-sm">
            <option value="">Alle Typen</option>
            <option value="deal">Deal</option>
            <option value="package">Paket</option>
            <option value="experience">Erlebnis</option>
            <option value="ticket">Ticket</option>
            <option value="voucher">Gutschein</option>
          </select>
        </div>
      </div>

      {/* Offers Table */}
      <div className="bg-white rounded-xl border border-gray-200">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 text-left text-sm text-gray-500">
              <th className="p-4 font-medium">Bild</th>
              <th className="p-4 font-medium">Titel</th>
              <th className="p-4 font-medium">Partner</th>
              <th className="p-4 font-medium">Typ</th>
              <th className="p-4 font-medium">Preis</th>
              <th className="p-4 font-medium">Buchungen</th>
              <th className="p-4 font-medium">Status</th>
              <th className="p-4 font-medium">Aktionen</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={8} className="p-12 text-center text-gray-400">
                <span className="text-4xl block mb-3">🎁</span>
                <p className="text-lg font-medium text-gray-600">Noch keine Angebote</p>
                <p className="text-sm text-gray-400 mt-2">
                  Partner koennen eigene Angebote erstellen, die ueber die App buchbar sind.
                </p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </>
  )
}
