'use client'

import { useState } from 'react'

const poiTypes = [
  ['all', 'Alle POIs'],
  ['attraction', 'Sehenswuerdigkeiten'],
  ['restaurant', 'Restaurants'],
  ['hotel', 'Hotels'],
  ['shop', 'Shops'],
  ['culture', 'Kultur'],
  ['nature', 'Natur'],
  ['sport', 'Sport'],
  ['nightlife', 'Nachtleben'],
]

export default function PoisPage() {
  const [search, setSearch] = useState('')
  const [activeTab, setActiveTab] = useState('all')

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Points of Interest</h1>
          <p className="text-gray-500 mt-1">Alle Sehenswuerdigkeiten, Restaurants und Orte deiner Stadt</p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 text-sm font-medium hover:bg-gray-200 transition">
            Import (CSV)
          </button>
          <button className="px-4 py-2 rounded-lg bg-indigo-900 text-white text-sm font-medium hover:bg-indigo-800 transition">
            + Neuer POI
          </button>
        </div>
      </div>

      {/* Type Tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {poiTypes.map(([id, label]) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              activeTab === id
                ? 'bg-indigo-100 text-indigo-700'
                : 'bg-white text-gray-500 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            {label}
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
            placeholder="Name, Adresse oder Kategorie suchen..."
            className="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-sm"
          />
          <select className="px-3 py-2 rounded-lg border border-gray-300 text-sm">
            <option value="">Alle Status</option>
            <option value="draft">Entwurf</option>
            <option value="review">In Review</option>
            <option value="published">Veroeffentlicht</option>
          </select>
          <select className="px-3 py-2 rounded-lg border border-gray-300 text-sm">
            <option value="">Partner-POIs</option>
            <option value="partner">Nur Partner</option>
            <option value="own">Nur eigene</option>
          </select>
        </div>
      </div>

      {/* POI Table */}
      <div className="bg-white rounded-xl border border-gray-200">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 text-left text-sm text-gray-500">
              <th className="p-4 font-medium">Bild</th>
              <th className="p-4 font-medium">Name</th>
              <th className="p-4 font-medium">Kategorie</th>
              <th className="p-4 font-medium">Partner</th>
              <th className="p-4 font-medium">Status</th>
              <th className="p-4 font-medium">Aufrufe</th>
              <th className="p-4 font-medium">Aktionen</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={7} className="p-12 text-center text-gray-400">
                <span className="text-4xl block mb-3">🏙</span>
                <p className="text-lg font-medium text-gray-600">Noch keine POIs angelegt</p>
                <p className="text-sm text-gray-400 mt-2">
                  Fuege Sehenswuerdigkeiten, Restaurants und andere Orte hinzu, die Touristen entdecken koennen.
                </p>
                <button className="mt-4 px-4 py-2 rounded-lg bg-indigo-900 text-white text-sm font-medium">
                  + Ersten POI anlegen
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </>
  )
}
