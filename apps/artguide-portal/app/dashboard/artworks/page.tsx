'use client'

import { useState } from 'react'

export default function ArtworksPage() {
  const [view, setView] = useState<'list' | 'grid'>('list')
  const [search, setSearch] = useState('')

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Kunstwerke</h1>
          <p className="text-gray-500 mt-1">Verwalte alle Werke deiner Sammlung</p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 text-sm font-medium hover:bg-gray-200 transition">
            Import (CSV)
          </button>
          <button className="px-4 py-2 rounded-lg bg-indigo-900 text-white text-sm font-medium hover:bg-indigo-800 transition">
            + Neues Kunstwerk
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
        <div className="flex items-center gap-4">
          <input
            type="search"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Titel, Kuenstler, Inventarnummer suchen..."
            className="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-sm"
          />
          <select className="px-3 py-2 rounded-lg border border-gray-300 text-sm">
            <option value="">Alle Raeume</option>
          </select>
          <select className="px-3 py-2 rounded-lg border border-gray-300 text-sm">
            <option value="">Alle Status</option>
            <option value="draft">Entwurf</option>
            <option value="review">In Review</option>
            <option value="published">Veroeffentlicht</option>
            <option value="archived">Archiviert</option>
          </select>
          <div className="flex border border-gray-300 rounded-lg overflow-hidden">
            <button
              onClick={() => setView('list')}
              className={`px-3 py-2 text-sm ${view === 'list' ? 'bg-indigo-100 text-indigo-700' : 'bg-white text-gray-500'}`}
            >
              Liste
            </button>
            <button
              onClick={() => setView('grid')}
              className={`px-3 py-2 text-sm ${view === 'grid' ? 'bg-indigo-100 text-indigo-700' : 'bg-white text-gray-500'}`}
            >
              Grid
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200">
        {view === 'list' ? (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 text-left text-sm text-gray-500">
                <th className="p-4 font-medium">Bild</th>
                <th className="p-4 font-medium">Titel</th>
                <th className="p-4 font-medium">Kuenstler</th>
                <th className="p-4 font-medium">Raum</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium">Aktionen</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={6} className="p-12 text-center text-gray-400">
                  Noch keine Kunstwerke angelegt.
                  <br />
                  <button className="mt-2 text-indigo-600 font-medium hover:underline">
                    Erstes Kunstwerk hinzufuegen
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        ) : (
          <div className="p-6 text-center text-gray-400">
            Grid-Ansicht wird geladen...
          </div>
        )}
      </div>
    </>
  )
}
