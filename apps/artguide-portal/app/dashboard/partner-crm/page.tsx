'use client'

import { useState } from 'react'

const pipelineStages = [
  { id: 'new', label: 'Neu', color: 'bg-gray-100 text-gray-700' },
  { id: 'contacted', label: 'Kontaktiert', color: 'bg-blue-100 text-blue-700' },
  { id: 'interested', label: 'Interessiert', color: 'bg-yellow-100 text-yellow-700' },
  { id: 'negotiating', label: 'Verhandlung', color: 'bg-orange-100 text-orange-700' },
  { id: 'onboarded', label: 'Onboarded', color: 'bg-green-100 text-green-700' },
  { id: 'declined', label: 'Abgelehnt', color: 'bg-red-100 text-red-700' },
]

export default function PartnerCrmPage() {
  const [search, setSearch] = useState('')
  const [view, setView] = useState<'pipeline' | 'list'>('pipeline')

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Partner-CRM</h1>
          <p className="text-gray-500 mt-1">Gewerbetreibende akquirieren und managen — wie im Sales Tool</p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 text-sm font-medium hover:bg-gray-200 transition">
            CSV Import (Masse)
          </button>
          <button className="px-4 py-2 rounded-lg bg-amber-500 text-white text-sm font-medium hover:bg-amber-400 transition">
            Massen-Einladung
          </button>
          <button className="px-4 py-2 rounded-lg bg-indigo-900 text-white text-sm font-medium hover:bg-indigo-800 transition">
            + Lead hinzufuegen
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-6 gap-4 mb-6">
        {pipelineStages.map(stage => (
          <div key={stage.id} className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="text-xl font-bold text-gray-900">0</div>
            <div className="text-xs text-gray-500 mt-1">{stage.label}</div>
          </div>
        ))}
      </div>

      {/* View Toggle + Search */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
        <div className="flex items-center gap-4">
          <div className="flex border border-gray-300 rounded-lg overflow-hidden">
            <button
              onClick={() => setView('pipeline')}
              className={`px-4 py-2 text-sm font-medium ${view === 'pipeline' ? 'bg-indigo-100 text-indigo-700' : 'bg-white text-gray-500'}`}
            >
              Pipeline
            </button>
            <button
              onClick={() => setView('list')}
              className={`px-4 py-2 text-sm font-medium ${view === 'list' ? 'bg-indigo-100 text-indigo-700' : 'bg-white text-gray-500'}`}
            >
              Liste
            </button>
          </div>
          <input
            type="search"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Firmenname, E-Mail, Kontaktperson suchen..."
            className="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-sm"
          />
          <select className="px-3 py-2 rounded-lg border border-gray-300 text-sm">
            <option value="">Alle Typen</option>
            <option value="restaurant">Restaurant</option>
            <option value="hotel">Hotel</option>
            <option value="shop">Shop</option>
            <option value="service">Dienstleister</option>
          </select>
          <select className="px-3 py-2 rounded-lg border border-gray-300 text-sm">
            <option value="">Alle Vertriebler</option>
          </select>
        </div>
      </div>

      {view === 'pipeline' ? (
        /* Pipeline (Kanban) View */
        <div className="grid grid-cols-6 gap-4">
          {pipelineStages.map(stage => (
            <div key={stage.id} className="bg-gray-50 rounded-xl p-3 min-h-[400px]">
              <div className={`inline-block px-3 py-1 rounded-full text-xs font-medium mb-3 ${stage.color}`}>
                {stage.label} (0)
              </div>
              <div className="text-center py-12 text-gray-300 text-sm">
                Keine Leads
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* List View */
        <div className="bg-white rounded-xl border border-gray-200">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 text-left text-sm text-gray-500">
                <th className="p-4 font-medium">Firma</th>
                <th className="p-4 font-medium">Typ</th>
                <th className="p-4 font-medium">Kontakt</th>
                <th className="p-4 font-medium">E-Mail</th>
                <th className="p-4 font-medium">Phase</th>
                <th className="p-4 font-medium">Vertriebler</th>
                <th className="p-4 font-medium">Letzter Kontakt</th>
                <th className="p-4 font-medium">Aktionen</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={8} className="p-12 text-center text-gray-400">
                  <span className="text-4xl block mb-3">📇</span>
                  <p className="text-lg font-medium text-gray-600">Noch keine Partner-Leads</p>
                  <p className="text-sm text-gray-400 mt-2 max-w-lg mx-auto">
                    Importiere Gewerbetreibende per CSV oder fuege sie manuell hinzu.
                    Nutze die Massen-Einladung, um hunderte Betriebe gleichzeitig einzuladen.
                  </p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}
