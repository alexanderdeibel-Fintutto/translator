'use client'

import { useState } from 'react'

const statusTabs = [
  ['all', 'Alle', null],
  ['active', 'Aktiv', 'bg-green-100 text-green-700'],
  ['pending', 'Ausstehend', 'bg-yellow-100 text-yellow-700'],
  ['invited', 'Eingeladen', 'bg-blue-100 text-blue-700'],
  ['suspended', 'Pausiert', 'bg-red-100 text-red-700'],
]

const businessTypes = [
  ['all', 'Alle Typen'],
  ['restaurant', 'Restaurant'],
  ['hotel', 'Hotel'],
  ['shop', 'Shop'],
  ['cafe', 'Cafe'],
  ['bar', 'Bar'],
  ['wellness', 'Wellness'],
  ['tour_operator', 'Reiseanbieter'],
  ['service', 'Dienstleister'],
  ['other', 'Sonstiges'],
]

export default function PartnersPage() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Partner</h1>
          <p className="text-gray-500 mt-1">Gewerbetreibende, die auf deiner Plattform teilnehmen</p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 text-sm font-medium hover:bg-gray-200 transition">
            CSV Import
          </button>
          <button className="px-4 py-2 rounded-lg bg-amber-500 text-white text-sm font-medium hover:bg-amber-400 transition">
            Massen-Einladung
          </button>
          <button className="px-4 py-2 rounded-lg bg-indigo-900 text-white text-sm font-medium hover:bg-indigo-800 transition">
            + Partner hinzufuegen
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-5 gap-4 mb-6">
        {[
          { label: 'Gesamt', value: '0', color: 'bg-gray-50' },
          { label: 'Aktiv', value: '0', color: 'bg-green-50' },
          { label: 'Ausstehend', value: '0', color: 'bg-yellow-50' },
          { label: 'Eingeladen', value: '0', color: 'bg-blue-50' },
          { label: 'Umsatz (Monat)', value: '0 EUR', color: 'bg-indigo-50' },
        ].map(s => (
          <div key={s.label} className={`${s.color} rounded-xl p-4 border border-gray-200`}>
            <div className="text-xl font-bold text-gray-900">{s.value}</div>
            <div className="text-xs text-gray-500 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Status Tabs */}
      <div className="flex gap-2 mb-4">
        {statusTabs.map(([id, label]) => (
          <button
            key={id as string}
            onClick={() => setStatusFilter(id as string)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              statusFilter === id
                ? 'bg-indigo-100 text-indigo-700'
                : 'bg-white text-gray-500 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            {label as string}
          </button>
        ))}
      </div>

      {/* Search & Filter */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
        <div className="flex items-center gap-4">
          <input
            type="search"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Firmenname, Kontaktperson, E-Mail suchen..."
            className="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-sm"
          />
          <select
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
            className="px-3 py-2 rounded-lg border border-gray-300 text-sm"
          >
            {businessTypes.map(([val, label]) => (
              <option key={val} value={val}>{label}</option>
            ))}
          </select>
          <select className="px-3 py-2 rounded-lg border border-gray-300 text-sm">
            <option value="">Alle Tarife</option>
            <option value="basic">Basic (Gratis)</option>
            <option value="premium">Premium</option>
            <option value="featured">Featured</option>
          </select>
        </div>
      </div>

      {/* Partner Table */}
      <div className="bg-white rounded-xl border border-gray-200">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 text-left text-sm text-gray-500">
              <th className="p-4 font-medium">Logo</th>
              <th className="p-4 font-medium">Firmenname</th>
              <th className="p-4 font-medium">Typ</th>
              <th className="p-4 font-medium">Kontakt</th>
              <th className="p-4 font-medium">Tarif</th>
              <th className="p-4 font-medium">Status</th>
              <th className="p-4 font-medium">Angebote</th>
              <th className="p-4 font-medium">Buchungen</th>
              <th className="p-4 font-medium">Aktionen</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={9} className="p-12 text-center text-gray-400">
                <span className="text-4xl block mb-3">🤝</span>
                <p className="text-lg font-medium text-gray-600">Noch keine Partner</p>
                <p className="text-sm text-gray-400 mt-2 max-w-lg mx-auto">
                  Lade Restaurants, Hotels, Shops und andere Gewerbetreibende ein, auf deiner Plattform teilzunehmen.
                  Sie werden als POIs sichtbar und koennen eigene Angebote erstellen.
                </p>
                <div className="flex gap-3 justify-center mt-6">
                  <button className="px-4 py-2 rounded-lg bg-indigo-900 text-white text-sm font-medium">
                    + Partner manuell anlegen
                  </button>
                  <button className="px-4 py-2 rounded-lg bg-amber-500 text-white text-sm font-medium">
                    Massen-Einladung starten
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Info Box */}
      <div className="mt-6 bg-indigo-50 rounded-xl p-6 border border-indigo-200">
        <h3 className="font-semibold text-indigo-900 mb-2">Unser Partner-Modell</h3>
        <p className="text-sm text-indigo-700">
          Wir verdienen <strong>keine Provision</strong> an Buchungen. Partner zahlen einen festen Beitrag
          oder bewerben die App bei ihren Gaesten. Unsere Vertriebler haben ein eigenes Interesse,
          weil Partner die Plattform aktiv foerdern. So entsteht ein nachhaltiges Oekosystem fuer alle.
        </p>
      </div>
    </>
  )
}
