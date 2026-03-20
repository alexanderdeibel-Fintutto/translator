'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'

const tabs = ['Uebersicht', 'Angebote', 'Buchungen', 'Bewertungen', 'Einstellungen']

export default function PartnerDetailPage() {
  const { id } = useParams()
  const [activeTab, setActiveTab] = useState('Uebersicht')

  return (
    <>
      {/* Back link */}
      <a href="/dashboard/partners" className="text-sm text-indigo-600 hover:underline mb-4 inline-block">
        Zurueck zu Partner
      </a>

      {/* Partner Header */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div className="flex items-start gap-6">
          <div className="w-20 h-20 bg-gray-100 rounded-xl flex items-center justify-center text-3xl">
            🏪
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">Partner #{(id as string)?.slice(0, 8)}</h1>
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                Aktiv
              </span>
            </div>
            <p className="text-gray-500 mt-1">Restaurant / Typ wird geladen...</p>
            <div className="flex gap-4 mt-3 text-sm text-gray-500">
              <span>Adresse wird geladen...</span>
              <span>Telefon wird geladen...</span>
              <span>E-Mail wird geladen...</span>
            </div>
          </div>
          <div className="flex gap-2">
            <button className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 text-sm font-medium hover:bg-gray-200 transition">
              Bearbeiten
            </button>
            <button className="px-4 py-2 rounded-lg bg-indigo-900 text-white text-sm font-medium hover:bg-indigo-800 transition">
              POI erstellen
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              activeTab === tab
                ? 'bg-indigo-100 text-indigo-700'
                : 'bg-white text-gray-500 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Statistiken</h3>
          <div className="space-y-3">
            {[
              ['Aufrufe', '0'],
              ['Buchungen', '0'],
              ['Angebote aktiv', '0'],
              ['Bewertung', '—'],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between">
                <span className="text-sm text-gray-500">{label}</span>
                <span className="text-sm font-medium text-gray-900">{value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Mitgliedschaft</h3>
          <div className="space-y-3">
            {[
              ['Tarif', 'Basic (Gratis)'],
              ['Mitglied seit', '—'],
              ['Naechste Zahlung', '—'],
              ['App-Bewerbung', 'Nicht konfiguriert'],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between">
                <span className="text-sm text-gray-500">{label}</span>
                <span className="text-sm font-medium text-gray-900">{value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 col-span-2">
          <h3 className="font-semibold text-gray-900 mb-4">Letzte Aktivitaet</h3>
          <div className="text-center py-8 text-gray-400">
            Noch keine Aktivitaeten fuer diesen Partner
          </div>
        </div>
      </div>
    </>
  )
}
