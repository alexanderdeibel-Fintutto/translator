'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'

export default function PartnerLeadDetailPage() {
  const { id } = useParams()
  const [note, setNote] = useState('')

  return (
    <>
      <a href="/dashboard/partner-crm" className="text-sm text-indigo-600 hover:underline mb-4 inline-block">
        Zurueck zum CRM
      </a>

      {/* Lead Header */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Lead #{(id as string)?.slice(0, 8)}</h1>
            <p className="text-gray-500 mt-1">Wird geladen...</p>
          </div>
          <div className="flex gap-2">
            <select className="px-3 py-2 rounded-lg border border-gray-300 text-sm">
              <option value="new">Neu</option>
              <option value="contacted">Kontaktiert</option>
              <option value="interested">Interessiert</option>
              <option value="negotiating">Verhandlung</option>
              <option value="onboarded">Onboarded</option>
              <option value="declined">Abgelehnt</option>
            </select>
            <button className="px-4 py-2 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-500 transition">
              Als Partner konvertieren
            </button>
            <button className="px-4 py-2 rounded-lg bg-amber-500 text-white text-sm font-medium hover:bg-amber-400 transition">
              Einladung senden
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Contact Info */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Kontaktdaten</h3>
          <div className="space-y-3 text-sm">
            {[
              ['Firma', '—'],
              ['Kontaktperson', '—'],
              ['E-Mail', '—'],
              ['Telefon', '—'],
              ['Adresse', '—'],
              ['Website', '—'],
              ['Typ', '—'],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between">
                <span className="text-gray-500">{label}</span>
                <span className="font-medium text-gray-900">{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Invite Status */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Einladungsstatus</h3>
          <div className="space-y-3 text-sm">
            {[
              ['Status', 'Nicht gesendet'],
              ['Gesendet am', '—'],
              ['Geoeffnet am', '—'],
              ['Link geklickt', '—'],
              ['Akzeptiert', '—'],
              ['Methode', '—'],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between">
                <span className="text-gray-500">{label}</span>
                <span className="font-medium text-gray-900">{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Assignment */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Zuweisung</h3>
          <div className="space-y-3 text-sm">
            {[
              ['Vertriebler', '—'],
              ['Quelle', '—'],
              ['Erstellt am', '—'],
              ['Letzter Kontakt', '—'],
              ['Naechster Follow-up', '—'],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between">
                <span className="text-gray-500">{label}</span>
                <span className="font-medium text-gray-900">{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Notes / Activity */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 col-span-3">
          <h3 className="font-semibold text-gray-900 mb-4">Notizen & Aktivitaet</h3>

          {/* Add Note */}
          <div className="flex gap-3 mb-6">
            <input
              type="text"
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="Notiz hinzufuegen..."
              className="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-sm"
            />
            <select className="px-3 py-2 rounded-lg border border-gray-300 text-sm">
              <option value="note">Notiz</option>
              <option value="call">Anruf</option>
              <option value="email">E-Mail</option>
              <option value="meeting">Meeting</option>
            </select>
            <button className="px-4 py-2 rounded-lg bg-indigo-900 text-white text-sm font-medium hover:bg-indigo-800 transition">
              Speichern
            </button>
          </div>

          <div className="text-center py-8 text-gray-400">
            Noch keine Notizen oder Aktivitaeten
          </div>
        </div>
      </div>
    </>
  )
}
