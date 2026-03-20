'use client'

import { useState } from 'react'

export default function CityToursPage() {
  const [activeTab, setActiveTab] = useState('all')

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Stadt-Touren</h1>
          <p className="text-gray-500 mt-1">Kuratierte und KI-generierte Stadtfuehrungen</p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 rounded-lg bg-amber-500 text-white text-sm font-medium hover:bg-amber-400 transition">
            KI-Tour generieren
          </button>
          <button className="px-4 py-2 rounded-lg bg-indigo-900 text-white text-sm font-medium hover:bg-indigo-800 transition">
            + Neue Tour
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {[
          ['all', 'Alle'],
          ['curated', 'Kuratiert'],
          ['ai_generated', 'KI-generiert'],
          ['thematic', 'Thematisch'],
          ['partner_sponsored', 'Partner-gesponsert'],
        ].map(([id, label]) => (
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

      {/* Tour Cards (empty state) */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
        <div className="py-12">
          <span className="text-5xl block mb-4">🗺</span>
          <p className="text-lg font-medium text-gray-600">Noch keine Stadt-Touren</p>
          <p className="text-sm text-gray-400 mt-2 max-w-md mx-auto">
            Erstelle Stadtfuehrungen mit POIs, Partner-Stopps und Audio-Guides.
            Touren koennen zu Fuss, per Rad oder mit den Oeffis geplant werden.
          </p>
          <div className="flex gap-3 justify-center mt-6">
            <button className="px-4 py-2 rounded-lg bg-indigo-900 text-white text-sm font-medium">
              + Manuell erstellen
            </button>
            <button className="px-4 py-2 rounded-lg bg-amber-500 text-white text-sm font-medium">
              KI-Tour vorschlagen lassen
            </button>
          </div>
        </div>
      </div>

      {/* Tour Features Info */}
      <div className="mt-6 grid grid-cols-4 gap-4">
        {[
          { icon: '🚶', title: 'Zu Fuss', desc: 'Walking Tours durch die Altstadt' },
          { icon: '🚲', title: 'Per Rad', desc: 'Fahrradtouren mit GPS-Navigation' },
          { icon: '🚌', title: 'Oeffis', desc: 'Bus & Bahn Touren mit Haltestellen' },
          { icon: '🤖', title: 'KI-generiert', desc: 'Personalisierte Tour basierend auf Interessen' },
        ].map(f => (
          <div key={f.title} className="bg-white rounded-xl border border-gray-200 p-4 text-center">
            <span className="text-3xl">{f.icon}</span>
            <h4 className="font-medium text-gray-900 mt-2 text-sm">{f.title}</h4>
            <p className="text-xs text-gray-500 mt-1">{f.desc}</p>
          </div>
        ))}
      </div>
    </>
  )
}
