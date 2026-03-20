'use client'

import { useState } from 'react'

export default function BookingsPage() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Buchungen</h1>
          <p className="text-gray-500 mt-1">Alle Buchungen durch Besucher</p>
        </div>
        <button className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 text-sm font-medium hover:bg-gray-200 transition">
          Export (CSV)
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-5 gap-4 mb-6">
        {[
          { label: 'Heute', value: '0' },
          { label: 'Diese Woche', value: '0' },
          { label: 'Diesen Monat', value: '0' },
          { label: 'Bestaetigt', value: '0' },
          { label: 'Ausstehend', value: '0' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="text-xl font-bold text-gray-900">{s.value}</div>
            <div className="text-xs text-gray-500 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Status Tabs */}
      <div className="flex gap-2 mb-4">
        {[['all', 'Alle'], ['pending', 'Ausstehend'], ['confirmed', 'Bestaetigt'], ['completed', 'Abgeschlossen'], ['cancelled', 'Storniert']].map(([id, label]) => (
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

      {/* Search */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
        <div className="flex items-center gap-4">
          <input
            type="search"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buchungsnummer, Gast oder Partner suchen..."
            className="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-sm"
          />
          <input
            type="date"
            className="px-3 py-2 rounded-lg border border-gray-300 text-sm"
          />
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-white rounded-xl border border-gray-200">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 text-left text-sm text-gray-500">
              <th className="p-4 font-medium">Buchungs-Nr.</th>
              <th className="p-4 font-medium">Gast</th>
              <th className="p-4 font-medium">Angebot</th>
              <th className="p-4 font-medium">Partner</th>
              <th className="p-4 font-medium">Datum</th>
              <th className="p-4 font-medium">Personen</th>
              <th className="p-4 font-medium">Betrag</th>
              <th className="p-4 font-medium">Status</th>
              <th className="p-4 font-medium">Aktionen</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={9} className="p-12 text-center text-gray-400">
                <span className="text-4xl block mb-3">📅</span>
                <p className="text-lg font-medium text-gray-600">Noch keine Buchungen</p>
                <p className="text-sm text-gray-400 mt-2">
                  Buchungen erscheinen hier, sobald Besucher Angebote ueber die App buchen.
                </p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </>
  )
}
