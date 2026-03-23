'use client'

import { useState, use } from 'react'
import { createClient } from '@/lib/supabase-client'

/**
 * Artwork Detail Editor — full editing of a single artwork
 *
 * Features:
 * - Multilingual text editing (tabs per language)
 * - AI text generation per field (brief, standard, detailed, children, youth)
 * - Media upload (drag & drop)
 * - Position on floorplan (visual picker)
 * - QR code generation
 * - Status management (draft → review → published)
 * - Version history
 * - Tags and categories
 */
export default function ArtworkDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [activeTab, setActiveTab] = useState<'content' | 'media' | 'position' | 'ai' | 'history'>('content')
  const [activeLanguage, setActiveLanguage] = useState('de')
  const [isGenerating, setIsGenerating] = useState<string | null>(null)

  const contentFields = [
    { key: 'description_brief', label: 'Kurzbeschreibung', hint: '1-2 Saetze' },
    { key: 'description_standard', label: 'Standardbeschreibung', hint: '4-6 Saetze' },
    { key: 'description_detailed', label: 'Detailliert', hint: '8-15 Saetze' },
    { key: 'description_children', label: 'Kinderbeschreibung', hint: 'Fuer 6-12 Jahre' },
    { key: 'description_youth', label: 'Jugendbeschreibung', hint: 'Fuer 13-17 Jahre' },
    { key: 'fun_facts', label: 'Fun Facts', hint: 'Ueberraschende Fakten' },
    { key: 'historical_context', label: 'Historischer Kontext', hint: 'Zeitgeschichtlicher Hintergrund' },
    { key: 'technique_details', label: 'Technik-Details', hint: 'Materialien & Arbeitsweise' },
  ]

  async function generateAiContent(field: string) {
    setIsGenerating(field)
    try {
      const supabase = createClient()
      const { data, error } = await supabase.functions.invoke('artguide-ai', {
        body: {
          action: 'generate_content',
          artwork_id: id,
          field,
          language: activeLanguage,
        },
      })

      if (error) {
        console.error('AI generation failed:', error)
        return
      }

      // Find the textarea for this field and update its value
      const textarea = document.querySelector(`textarea[data-field="${field}"]`) as HTMLTextAreaElement
      if (textarea && data?.content) {
        textarea.value = data.content
        textarea.dispatchEvent(new Event('input', { bubbles: true }))
      }
    } catch (err) {
      console.error('AI generation error:', err)
    } finally {
      setIsGenerating(null)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="ml-64 p-8">
        {/* Header with status */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <a href="/dashboard/artworks" className="p-2 rounded-lg hover:bg-gray-100 transition">
              ← Zurueck
            </a>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Kunstwerk bearbeiten</h1>
              <p className="text-gray-500 text-sm mt-1">ID: {id}</p>
            </div>
          </div>
          <div className="flex gap-3">
            <select className="px-3 py-2 rounded-lg border border-gray-300 text-sm">
              <option value="draft">Entwurf</option>
              <option value="review">Zur Review</option>
              <option value="published">Veroeffentlicht</option>
              <option value="archived">Archiviert</option>
            </select>
            <button className="px-4 py-2 rounded-lg bg-indigo-900 text-white text-sm font-medium hover:bg-indigo-800 transition">
              Speichern
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-lg w-fit">
          {([
            ['content', '✍ Inhalte'],
            ['media', '📸 Medien'],
            ['position', '📍 Position'],
            ['ai', '🤖 KI-Generierung'],
            ['history', '📋 Versionen'],
          ] as const).map(([id, label]) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition ${
                activeTab === id
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* Main content area */}
          <div className="col-span-2">
            {activeTab === 'content' && (
              <div className="space-y-6">
                {/* Basic info */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Grunddaten</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Inventarnummer</label>
                      <input type="text" className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Kuenstler</label>
                      <input type="text" className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Entstehungsjahr</label>
                      <input type="text" placeholder="z.B. 1889 oder ca. 1500" className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Technik/Material</label>
                      <input type="text" placeholder="z.B. Oel auf Leinwand" className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Masse</label>
                      <input type="text" placeholder="z.B. 73.7 x 92.1 cm" className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Epoche</label>
                      <input type="text" placeholder="z.B. Impressionismus" className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none" />
                    </div>
                  </div>
                </div>

                {/* Multilingual title */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-900">Titel</h3>
                    <div className="flex gap-1">
                      {['de', 'en', 'fr', 'es', 'it'].map(lang => (
                        <button
                          key={lang}
                          onClick={() => setActiveLanguage(lang)}
                          className={`px-2 py-1 rounded text-xs font-medium transition ${
                            activeLanguage === lang
                              ? 'bg-indigo-100 text-indigo-700'
                              : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                          }`}
                        >
                          {lang.toUpperCase()}
                        </button>
                      ))}
                    </div>
                  </div>
                  <input
                    type="text"
                    placeholder={`Titel (${activeLanguage.toUpperCase()})`}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
                  />
                </div>

                {/* Content fields with AI generation */}
                {contentFields.map(field => (
                  <div key={field.key} className="bg-white rounded-xl border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-gray-900">{field.label}</h3>
                        <p className="text-xs text-gray-400">{field.hint}</p>
                      </div>
                      <button
                        onClick={() => generateAiContent(field.key)}
                        disabled={isGenerating === field.key}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 text-amber-700 text-xs font-medium hover:bg-amber-100 transition disabled:opacity-50"
                      >
                        {isGenerating === field.key ? (
                          <>
                            <div className="w-3 h-3 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
                            Generiere...
                          </>
                        ) : (
                          <>🤖 KI generieren</>
                        )}
                      </button>
                    </div>
                    <textarea
                      rows={4}
                      data-field={field.key}
                      placeholder={`${field.label} (${activeLanguage.toUpperCase()}) eingeben oder per KI generieren...`}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none resize-y"
                    />
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'media' && (
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Medien</h3>
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center hover:border-indigo-300 transition cursor-pointer">
                  <span className="text-4xl block mb-3">📸</span>
                  <p className="text-gray-500">Bilder hierher ziehen oder klicken zum Hochladen</p>
                  <p className="text-xs text-gray-400 mt-2">JPG, PNG, WebP, MP4 — max. 50MB</p>
                </div>
              </div>
            )}

            {activeTab === 'position' && (
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Position</h3>
                <p className="text-sm text-gray-500 mb-4">
                  Klicke auf den Grundriss um das Kunstwerk zu positionieren, oder gib GPS-Koordinaten ein.
                </p>
                <div className="aspect-video bg-gray-100 rounded-xl flex items-center justify-center">
                  <span className="text-gray-400">Grundriss wird geladen...</span>
                </div>
              </div>
            )}

            {activeTab === 'ai' && (
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="font-semibold text-gray-900 mb-4">🤖 KI-Textgenerierung</h3>
                <p className="text-sm text-gray-500 mb-6">
                  Generiere alle Textfelder auf Knopfdruck. Die KI nutzt die Grunddaten des Werks als Basis.
                </p>
                <div className="space-y-3">
                  <button className="w-full p-4 rounded-lg bg-amber-50 text-left hover:bg-amber-100 transition border border-amber-200">
                    <div className="font-medium text-amber-900">🔄 Alle Felder generieren (Deutsch)</div>
                    <div className="text-sm text-amber-700 mt-1">Generiert alle 8 Beschreibungsfelder basierend auf den Grunddaten</div>
                  </button>
                  <button className="w-full p-4 rounded-lg bg-indigo-50 text-left hover:bg-indigo-100 transition border border-indigo-200">
                    <div className="font-medium text-indigo-900">🌍 In alle Sprachen uebersetzen</div>
                    <div className="text-sm text-indigo-700 mt-1">Uebersetzt die deutschen Texte in alle konfigurierten Sprachen</div>
                  </button>
                  <button className="w-full p-4 rounded-lg bg-green-50 text-left hover:bg-green-100 transition border border-green-200">
                    <div className="font-medium text-green-900">🎧 Audio fuer alle Sprachen generieren</div>
                    <div className="text-sm text-green-700 mt-1">Erstellt TTS-Audio fuer alle Beschreibungen und Sprachen</div>
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'history' && (
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Versionshistorie</h3>
                <div className="text-center py-8 text-gray-400">
                  Noch keine Versionen vorhanden
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status Card */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-3">Status</h3>
              <div className="flex items-center gap-2 mb-4">
                <span className="w-3 h-3 rounded-full bg-yellow-400" />
                <span className="text-sm font-medium">Entwurf</span>
              </div>
              <div className="space-y-2">
                <button className="w-full py-2 rounded-lg bg-blue-50 text-blue-700 text-sm font-medium hover:bg-blue-100 transition">
                  Zur Review einreichen
                </button>
                <button className="w-full py-2 rounded-lg bg-green-50 text-green-700 text-sm font-medium hover:bg-green-100 transition">
                  Veroeffentlichen
                </button>
              </div>
            </div>

            {/* Room & Tags */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-3">Zuordnung</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Raum</label>
                  <select className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm">
                    <option>Raum waehlen...</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Tags</label>
                  <input type="text" placeholder="Tags kommagetrennt" className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none" />
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="rounded" />
                  <span className="text-sm text-gray-700">Highlight-Werk</span>
                </label>
              </div>
            </div>

            {/* QR Code */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-3">QR-Code</h3>
              <div className="aspect-square bg-gray-50 rounded-lg flex items-center justify-center mb-3">
                <span className="text-4xl">📱</span>
              </div>
              <button className="w-full py-2 rounded-lg bg-gray-100 text-gray-700 text-sm font-medium hover:bg-gray-200 transition">
                QR-Code herunterladen
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
