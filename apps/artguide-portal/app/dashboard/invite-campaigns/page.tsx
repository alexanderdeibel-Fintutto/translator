'use client'

import { useState } from 'react'

export default function InviteCampaignsPage() {
  const [activeTab, setActiveTab] = useState('all')

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Einladungskampagnen</h1>
          <p className="text-gray-500 mt-1">Gewerbetreibende massenhaft einladen und Conversion tracken</p>
        </div>
        <button className="px-4 py-2 rounded-lg bg-indigo-900 text-white text-sm font-medium hover:bg-indigo-800 transition">
          + Neue Kampagne
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-5 gap-4 mb-6">
        {[
          { label: 'Kampagnen', value: '0' },
          { label: 'Gesendet', value: '0' },
          { label: 'Geoeffnet', value: '0%' },
          { label: 'Geklickt', value: '0%' },
          { label: 'Konvertiert', value: '0' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="text-xl font-bold text-gray-900">{s.value}</div>
            <div className="text-xs text-gray-500 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {[['all', 'Alle'], ['draft', 'Entwurf'], ['scheduled', 'Geplant'], ['sending', 'Wird gesendet'], ['completed', 'Abgeschlossen']].map(([id, label]) => (
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

      {/* Campaigns List */}
      <div className="bg-white rounded-xl border border-gray-200">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 text-left text-sm text-gray-500">
              <th className="p-4 font-medium">Kampagne</th>
              <th className="p-4 font-medium">Kanal</th>
              <th className="p-4 font-medium">Empfaenger</th>
              <th className="p-4 font-medium">Gesendet</th>
              <th className="p-4 font-medium">Geoeffnet</th>
              <th className="p-4 font-medium">Geklickt</th>
              <th className="p-4 font-medium">Konvertiert</th>
              <th className="p-4 font-medium">Status</th>
              <th className="p-4 font-medium">Aktionen</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={9} className="p-12 text-center text-gray-400">
                <span className="text-4xl block mb-3">📨</span>
                <p className="text-lg font-medium text-gray-600">Noch keine Kampagnen</p>
                <p className="text-sm text-gray-400 mt-2 max-w-lg mx-auto">
                  Erstelle eine Einladungskampagne, um hunderte Gewerbetreibende per E-Mail,
                  SMS oder WhatsApp einzuladen.
                </p>
                <button className="mt-4 px-4 py-2 rounded-lg bg-indigo-900 text-white text-sm font-medium">
                  + Erste Kampagne erstellen
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* How it works */}
      <div className="mt-6 bg-amber-50 rounded-xl p-6 border border-amber-200">
        <h3 className="font-semibold text-amber-900 mb-3">So funktioniert die Massen-Einladung</h3>
        <div className="grid grid-cols-4 gap-4">
          {[
            { step: '1', title: 'Leads importieren', desc: 'CSV mit Firmendaten hochladen oder manuell erfassen' },
            { step: '2', title: 'Kampagne erstellen', desc: 'E-Mail-Template, Betreff und Kanal waehlen' },
            { step: '3', title: 'Einladung senden', desc: 'Alle Leads auf einmal oder zeitversetzt einladen' },
            { step: '4', title: 'Conversion tracken', desc: 'Oeffnungen, Klicks und Onboardings nachverfolgen' },
          ].map(s => (
            <div key={s.step}>
              <div className="w-8 h-8 rounded-full bg-amber-200 text-amber-800 font-bold text-sm flex items-center justify-center mb-2">
                {s.step}
              </div>
              <h4 className="font-medium text-amber-900 text-sm">{s.title}</h4>
              <p className="text-xs text-amber-700 mt-1">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
