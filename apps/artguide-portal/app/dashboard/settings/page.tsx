'use client'

import { useState } from 'react'

const tabs = ['Allgemein', 'Branding', 'Sprachen', 'White-Label', 'API']

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('Allgemein')

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Einstellungen</h1>
        <p className="text-gray-500 mt-1">Konfiguriere deine Plattform</p>
      </div>

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

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        {activeTab === 'Allgemein' && (
          <div className="space-y-6 max-w-2xl">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input type="text" className="w-full px-4 py-2 rounded-lg border border-gray-300 text-sm" placeholder="Mein City Guide" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Beschreibung</label>
              <textarea rows={3} className="w-full px-4 py-2 rounded-lg border border-gray-300 text-sm" placeholder="Beschreibung deiner Stadt/Region..." />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">E-Mail</label>
              <input type="email" className="w-full px-4 py-2 rounded-lg border border-gray-300 text-sm" placeholder="info@meine-stadt.de" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
              <input type="url" className="w-full px-4 py-2 rounded-lg border border-gray-300 text-sm" placeholder="https://www.meine-stadt.de" />
            </div>
            <button className="px-6 py-2 rounded-lg bg-indigo-900 text-white text-sm font-medium hover:bg-indigo-800 transition">
              Speichern
            </button>
          </div>
        )}

        {activeTab === 'Branding' && (
          <div className="space-y-6 max-w-2xl">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Primaerfarbe</label>
              <div className="flex gap-3">
                <input type="color" defaultValue="#1e1b4b" className="h-10 w-16 rounded border border-gray-300" />
                <input type="text" defaultValue="#1e1b4b" className="px-4 py-2 rounded-lg border border-gray-300 text-sm" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Akzentfarbe</label>
              <div className="flex gap-3">
                <input type="color" defaultValue="#c4a35a" className="h-10 w-16 rounded border border-gray-300" />
                <input type="text" defaultValue="#c4a35a" className="px-4 py-2 rounded-lg border border-gray-300 text-sm" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Logo</label>
              <div className="w-full py-6 rounded-lg border-2 border-dashed border-gray-300 text-center text-gray-400 text-sm">
                Logo hier ablegen oder klicken zum Hochladen
              </div>
            </div>
            <button className="px-6 py-2 rounded-lg bg-indigo-900 text-white text-sm font-medium hover:bg-indigo-800 transition">
              Branding speichern
            </button>
          </div>
        )}

        {activeTab === 'Sprachen' && (
          <div className="space-y-4 max-w-2xl">
            <p className="text-sm text-gray-500 mb-4">
              Waehle die Sprachen, in denen deine App verfuegbar sein soll. Alle Inhalte werden in allen aktiven Sprachen angezeigt.
            </p>
            {[
              ['de', 'Deutsch', true],
              ['en', 'English', true],
              ['fr', 'Francais', false],
              ['it', 'Italiano', false],
              ['es', 'Espanol', false],
              ['nl', 'Nederlands', false],
              ['pl', 'Polski', false],
              ['cs', 'Cestina', false],
              ['zh', 'Zhongwen', false],
              ['ja', 'Nihongo', false],
              ['ko', 'Hangugeo', false],
              ['ar', 'Al-Arabiya', false],
            ].map(([code, name, active]) => (
              <label key={code as string} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50">
                <input type="checkbox" defaultChecked={active as boolean} className="rounded" />
                <span className="text-sm font-medium text-gray-700">{name as string}</span>
                <span className="text-xs text-gray-400">({code as string})</span>
              </label>
            ))}
          </div>
        )}

        {activeTab === 'White-Label' && (
          <div className="space-y-6 max-w-2xl">
            <div className="bg-amber-50 rounded-lg p-4 border border-amber-200 mb-6">
              <p className="text-sm text-amber-800">
                White-Label erlaubt dir, die App unter deinem eigenen Branding zu veroeffentlichen.
                Jede Stadt/Region bekommt ihre eigene App mit eigenem Namen, Logo und Farben.
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">App-Name</label>
              <input type="text" className="w-full px-4 py-2 rounded-lg border border-gray-300 text-sm" placeholder="Mein City Guide" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bundle-ID (iOS/Android)</label>
              <input type="text" className="w-full px-4 py-2 rounded-lg border border-gray-300 text-sm" placeholder="com.meine-stadt.guide" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">App-Icon</label>
              <div className="w-24 h-24 rounded-2xl border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 text-sm">
                1024x1024
              </div>
            </div>
            <button className="px-6 py-2 rounded-lg bg-indigo-900 text-white text-sm font-medium hover:bg-indigo-800 transition">
              White-Label speichern
            </button>
          </div>
        )}

        {activeTab === 'API' && (
          <div className="space-y-4 max-w-2xl">
            <p className="text-sm text-gray-500">
              API-Zugangsschluessel fuer die Integration mit externen Systemen.
            </p>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">API Key</label>
              <div className="flex gap-2">
                <input type="text" readOnly value="Noch kein API Key generiert" className="flex-1 px-4 py-2 rounded-lg border border-gray-300 text-sm bg-gray-50" />
                <button className="px-4 py-2 rounded-lg bg-indigo-900 text-white text-sm font-medium">
                  Generieren
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
