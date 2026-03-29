'use client'

import { useState, use, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase-client'
import { useMuseum } from '@/lib/hooks'
import { QrCodePanel } from '@/components/QrCodePanel'
import type { Artwork, Museum } from '@/lib/types'

const LANGUAGES = ['de', 'en', 'fr', 'es', 'it', 'zh', 'ja', 'ar']
const CONTENT_FIELDS = [
  { key: 'description_brief', label: 'Kurzbeschreibung', hint: '1-2 Sätze' },
  { key: 'description_standard', label: 'Standardbeschreibung', hint: '4-6 Sätze' },
  { key: 'description_detailed', label: 'Detailliert', hint: '8-15 Sätze' },
  { key: 'description_children', label: 'Kinderbeschreibung', hint: 'Für 6-12 Jahre' },
  { key: 'description_youth', label: 'Jugendbeschreibung', hint: 'Für 13-17 Jahre' },
  { key: 'fun_facts', label: 'Fun Facts', hint: 'Überraschende Fakten' },
  { key: 'historical_context', label: 'Historischer Kontext', hint: 'Zeitgeschichtlicher Hintergrund' },
  { key: 'technique_details', label: 'Technik-Details', hint: 'Materialien & Arbeitsweise' },
]

// Helper: extract localized text from MultiLang object
function t(value: unknown, lang = 'de'): string {
  if (!value) return ''
  if (typeof value === 'string') return value
  if (typeof value === 'object') {
    const obj = value as Record<string, string>
    return obj[lang] || obj['de'] || obj['en'] || Object.values(obj)[0] || ''
  }
  return String(value)
}

const STATUS_CONFIG = {
  draft: { label: 'Entwurf', color: 'bg-gray-100 text-gray-600', dot: 'bg-gray-400' },
  review: { label: 'In Review', color: 'bg-yellow-100 text-yellow-700', dot: 'bg-yellow-400' },
  published: { label: 'Veröffentlicht', color: 'bg-green-100 text-green-700', dot: 'bg-green-400' },
  archived: { label: 'Archiviert', color: 'bg-red-100 text-red-600', dot: 'bg-red-400' },
}

export default function ArtworkDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { museum } = useMuseum()
  const supabase = createClient()

  const [artwork, setArtwork] = useState<Artwork | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [activeTab, setActiveTab] = useState<'content' | 'media' | 'qr' | 'ai' | 'history'>('content')
  const [activeLanguage, setActiveLanguage] = useState('de')
  const [isGenerating, setIsGenerating] = useState<string | null>(null)
  const [isGeneratingAll, setIsGeneratingAll] = useState(false)
  const [isTtsGenerating, setIsTtsGenerating] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadDragOver, setUploadDragOver] = useState(false)
  const [history, setHistory] = useState<Array<{id: string, field: string, lang: string, old_value: string, new_value: string, created_at: string, user_email?: string}>>([]) 
  const [historyLoading, setHistoryLoading] = useState(false)

  // Form state
  const [form, setForm] = useState<Partial<Artwork>>({})
  const [translations, setTranslations] = useState<Record<string, Record<string, string>>>({})

  // Load artwork
  useEffect(() => {
    async function load() {
      setLoading(true)
      const { data, error } = await supabase
        .from('ag_artworks')
        .select('*')
        .eq('id', id)
        .single()
      if (error) { setError(error.message); setLoading(false); return }
      setArtwork(data)
      setForm(data)

      // Extract translations from JSONB fields in ag_artworks
      // Each content field is stored as {"de": "...", "en": "...", ...}
      const contentFields = ['description_brief', 'description_standard', 'description_detailed', 'description_children', 'description_youth', 'fun_facts', 'historical_context', 'technique_details']
      const map: Record<string, Record<string, string>> = {}
      for (const field of contentFields) {
        const fieldData = data[field] as Record<string, string> | null
        if (fieldData && typeof fieldData === 'object') {
          for (const [lang, text] of Object.entries(fieldData)) {
            if (!map[lang]) map[lang] = {}
            map[lang][field] = text
          }
        }
      }
      setTranslations(map)
      setLoading(false)
    }
    load()
  }, [id])

  // Save artwork
  async function handleSave() {
    setSaving(true)
    const { error } = await supabase
      .from('ag_artworks')
      .update({
        title: form.title,
        artist_name: form.artist_name,
        year_created: form.year_created,
        medium: form.medium,
        dimensions: form.dimensions,
        epoch: form.epoch,
        room: form.room,
        inventory_number: form.inventory_number,
        status: form.status,
        is_highlight: form.is_highlight,
        tags: form.tags,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
    if (error) { setError(error.message) }
    else { setSaved(true); setTimeout(() => setSaved(false), 2000) }
    setSaving(false)
  }

  // Save translation field directly into ag_artworks JSONB field
  async function saveTranslationField(lang: string, field: string, value: string) {
    // Update local state immediately
    setTranslations(prev => ({
      ...prev,
      [lang]: { ...(prev[lang] || {}), [field]: value }
    }))
    // Merge into existing JSONB field: {lang: value}
    const currentFieldData = (artwork as any)?.[field] as Record<string, string> || {}
    const updatedFieldData = { ...currentFieldData, [lang]: value }
    await supabase.from('ag_artworks').update({
      [field]: updatedFieldData,
      updated_at: new Date().toISOString(),
    }).eq('id', id)
  }

  // AI generate single field
  async function generateAiContent(field: string) {
    setIsGenerating(field)
    try {
      const { data, error } = await supabase.functions.invoke('artguide-ai', {
        body: { action: 'generate_content', artwork_id: id, target_field: field, language: activeLanguage },
      })
      if (!error && (data?.text || data?.content)) {
        await saveTranslationField(activeLanguage, field, data.text || data.content)
      } else if (error) {
        console.error('AI generate error:', error)
      }
    } catch (err) { console.error(err) }
    finally { setIsGenerating(null) }
  }

  // AI generate all fields
  async function generateAllFields() {
    setIsGeneratingAll(true)
    try {
      const { data, error } = await supabase.functions.invoke('artguide-ai', {
        body: { action: 'generate_all', artwork_id: id, language: activeLanguage },
      })
      // Edge function returns { generated: {...} } or { translations: {...} }
      const fields = data?.generated || data?.translations
      if (!error && fields) {
        for (const [field, value] of Object.entries(fields)) {
          if (typeof value === 'string' && value.length > 0) {
            await saveTranslationField(activeLanguage, field, value)
          }
        }
      } else if (error) {
        console.error('AI generate all error:', error)
      }
    } catch (err) { console.error(err) }
    finally { setIsGeneratingAll(false) }
  }

  // TTS generate
  async function generateTts() {
    setIsTtsGenerating(true)
    try {
      const { data, error } = await supabase.functions.invoke('artguide-tts', {
        body: { action: 'generate_single', artwork_id: id, language: activeLanguage, field: 'description_standard' },
      })
      if (error) console.error('TTS error:', error)
      else if (data?.audio_url) {
        // Reload artwork to show updated audio_url
        const { data: updated } = await supabase.from('ag_artworks').select('audio_url').eq('id', id).single()
        if (updated) setArtwork(prev => prev ? { ...prev, audio_url: updated.audio_url } : prev)
      }
    } catch (err) { console.error(err) }
    finally { setIsTtsGenerating(false) }
  }

  // Image upload to Supabase Storage
  async function handleImageUpload(file: File) {
    if (!file || !artwork) return
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    if (!allowed.includes(file.type)) { alert('Nur JPG, PNG, WebP oder GIF erlaubt.'); return }
    if (file.size > 50 * 1024 * 1024) { alert('Maximale Dateigröße: 50 MB'); return }
    setIsUploading(true)
    setUploadProgress(10)
    try {
      const ext = file.name.split('.').pop() || 'jpg'
      const path = `artworks/${id}/main.${ext}`
      setUploadProgress(30)
      const { error: uploadErr } = await supabase.storage
        .from('artguide-media')
        .upload(path, file, { upsert: true, contentType: file.type })
      if (uploadErr) throw uploadErr
      setUploadProgress(70)
      const { data: urlData } = supabase.storage.from('artguide-media').getPublicUrl(path)
      const publicUrl = urlData.publicUrl
      const { error: updateErr } = await supabase
        .from('ag_artworks')
        .update({ image_url: publicUrl, updated_at: new Date().toISOString() })
        .eq('id', id)
      if (updateErr) throw updateErr
      setArtwork(prev => prev ? { ...prev, image_url: publicUrl } as any : prev)
      setUploadProgress(100)
      setTimeout(() => { setIsUploading(false); setUploadProgress(0) }, 800)
    } catch (err: any) {
      alert('Upload fehlgeschlagen: ' + err.message)
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  // Load history
  async function loadHistory() {
    setHistoryLoading(true)
    const { data } = await supabase
      .from('ag_artwork_history')
      .select('*')
      .eq('artwork_id', id)
      .order('created_at', { ascending: false })
      .limit(50)
    setHistory(data || [])
    setHistoryLoading(false)
  }

  // Restore a history version
  async function restoreVersion(entry: {field: string, lang: string, old_value: string}) {
    if (!confirm(`Wert für "${entry.field}" (${entry.lang.toUpperCase()}) auf früheren Stand zurücksetzen?`)) return
    await saveTranslationField(entry.lang, entry.field, entry.old_value)
    await loadHistory()
  }

  // Status change
  async function changeStatus(newStatus: string) {
    setForm(prev => ({ ...prev, status: newStatus as any }))
    await supabase.from('ag_artworks').update({ status: newStatus }).eq('id', id)
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <div className="text-4xl mb-4 animate-spin">⏳</div>
        <p className="text-gray-400">Kunstwerk wird geladen...</p>
      </div>
    </div>
  )

  if (error || !artwork) return (
    <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-red-700">
      <p className="font-semibold">Fehler beim Laden</p>
      <p className="text-sm mt-1">{error || 'Kunstwerk nicht gefunden'}</p>
      <Link href="/dashboard/artworks" className="text-sm underline mt-2 inline-block">← Zurück zur Liste</Link>
    </div>
  )

  const statusCfg = STATUS_CONFIG[(form.status as keyof typeof STATUS_CONFIG) || 'draft']

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/artworks" className="p-2 rounded-lg hover:bg-gray-100 transition text-gray-500">
            ← Zurück
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{t(artwork.title, activeLanguage)}</h1>
            <p className="text-gray-500 text-sm mt-0.5">{artwork.artist_name || 'Unbekannter Künstler'} {artwork.year_created ? `· ${artwork.year_created}` : ''}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className={`px-3 py-1.5 rounded-full text-sm font-medium flex items-center gap-1.5 ${statusCfg.color}`}>
            <span className={`w-2 h-2 rounded-full ${statusCfg.dot}`} />
            {statusCfg.label}
          </span>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 rounded-lg bg-indigo-900 text-white text-sm font-medium hover:bg-indigo-800 transition disabled:opacity-50 flex items-center gap-2"
          >
            {saving ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : null}
            {saved ? '✓ Gespeichert' : saving ? 'Speichert...' : 'Speichern'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-lg w-fit">
        {([
          ['content', '✍ Inhalte'],
          ['media', '📸 Medien'],
          ['qr', '📱 QR-Code'],
          ['ai', '🤖 KI-Generierung'],
          ['history', '📋 Versionen'],
        ] as const).map(([tabId, label]) => (
          <button
            key={tabId}
            onClick={() => setActiveTab(tabId)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition ${activeTab === tabId ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Main content */}
        <div className="col-span-2">
          {activeTab === 'content' && (
            <div className="space-y-6">
              {/* Basic info */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Grunddaten</h3>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { key: 'inventory_number', label: 'Inventarnummer', placeholder: 'z.B. INV-2024-001' },
                    { key: 'artist_name', label: 'Künstler', placeholder: 'Name des Künstlers' },
                    { key: 'year_created', label: 'Entstehungsjahr', placeholder: 'z.B. 1889 oder ca. 1500' },
                    { key: 'medium', label: 'Technik/Material', placeholder: 'z.B. Öl auf Leinwand' },
                    { key: 'dimensions', label: 'Maße', placeholder: 'z.B. 73.7 × 92.1 cm' },
                    { key: 'epoch', label: 'Epoche', placeholder: 'z.B. Impressionismus' },
                    { key: 'room', label: 'Raum', placeholder: 'z.B. Saal 12' },
                  ].map(f => (
                    <div key={f.key}>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{f.label}</label>
                      <input
                        type="text"
                        value={(form as any)[f.key] || ''}
                        onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                        placeholder={f.placeholder}
                        className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:border-indigo-500 outline-none"
                      />
                    </div>
                  ))}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Titel ({activeLanguage.toUpperCase()})</label>
                    <input
                      type="text"
                      value={t(form.title, activeLanguage)}
                      onChange={e => setForm(prev => ({
                        ...prev,
                        title: { ...(typeof prev.title === 'object' ? prev.title : {}), [activeLanguage]: e.target.value }
                      }))}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:border-indigo-500 outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Language selector */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500 font-medium">Sprache:</span>
                {LANGUAGES.map(lang => (
                  <button
                    key={lang}
                    onClick={() => setActiveLanguage(lang)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition ${activeLanguage === lang ? 'bg-indigo-100 text-indigo-700 border border-indigo-300' : 'bg-white text-gray-500 border border-gray-300 hover:bg-gray-50'}`}
                  >
                    {lang.toUpperCase()}
                  </button>
                ))}
              </div>

              {/* Content fields */}
              {CONTENT_FIELDS.map(field => {
                const value = translations[activeLanguage]?.[field.key] || ''
                return (
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
                          <><span className="w-3 h-3 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />Generiere...</>
                        ) : <>🤖 KI generieren</>}
                      </button>
                    </div>
                    <textarea
                      rows={4}
                      value={value}
                      onChange={e => saveTranslationField(activeLanguage, field.key, e.target.value)}
                      placeholder={`${field.label} (${activeLanguage.toUpperCase()}) eingeben oder per KI generieren...`}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:border-indigo-500 outline-none resize-y"
                    />
                  </div>
                )
              })}
            </div>
          )}

          {activeTab === 'media' && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">📸 Medien</h3>
              {(artwork as any).image_url && (
                <div className="mb-6 relative group">
                  <img
                    src={(artwork as any).image_url}
                    alt={t(artwork.title, activeLanguage)}
                    className="max-h-64 w-full rounded-xl border border-gray-200 object-contain bg-gray-50"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 rounded-xl transition flex items-center justify-center">
                    <button
                      onClick={() => {
                        const input = document.createElement('input')
                        input.type = 'file'
                        input.accept = 'image/*'
                        input.onchange = (e) => {
                          const file = (e.target as HTMLInputElement).files?.[0]
                          if (file) handleImageUpload(file)
                        }
                        input.click()
                      }}
                      className="opacity-0 group-hover:opacity-100 px-4 py-2 bg-white rounded-lg text-sm font-medium shadow-lg transition"
                    >
                      Bild ersetzen
                    </button>
                  </div>
                </div>
              )}
              {isUploading && (
                <div className="mb-4">
                  <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                    <span>Wird hochgeladen...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div
                      className="bg-indigo-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}
              <div
                onDragOver={(e) => { e.preventDefault(); setUploadDragOver(true) }}
                onDragLeave={() => setUploadDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault()
                  setUploadDragOver(false)
                  const file = e.dataTransfer.files[0]
                  if (file) handleImageUpload(file)
                }}
                onClick={() => {
                  const input = document.createElement('input')
                  input.type = 'file'
                  input.accept = 'image/*'
                  input.onchange = (e) => {
                    const file = (e.target as HTMLInputElement).files?.[0]
                    if (file) handleImageUpload(file)
                  }
                  input.click()
                }}
                className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition ${
                  uploadDragOver
                    ? 'border-indigo-400 bg-indigo-50'
                    : 'border-gray-300 hover:border-indigo-300 hover:bg-gray-50'
                }`}
              >
                <span className="text-4xl block mb-3">{uploadDragOver ? '📥' : '📸'}</span>
                <p className="text-gray-600 font-medium">
                  {uploadDragOver ? 'Loslassen zum Hochladen' : 'Bild hierher ziehen oder klicken'}
                </p>
                <p className="text-xs text-gray-400 mt-2">JPG, PNG, WebP — max. 50 MB</p>
              </div>
            </div>
          )}

          {activeTab === 'qr' && museum && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">QR-Code</h3>
              <QrCodePanel artwork={artwork} museum={museum} />
            </div>
          )}

          {activeTab === 'ai' && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">🤖 KI-Textgenerierung</h3>
              <p className="text-sm text-gray-500 mb-6">Generiere alle Textfelder auf Knopfdruck. Die KI nutzt die Grunddaten des Werks als Basis.</p>
              <div className="space-y-3">
                <button
                  onClick={generateAllFields}
                  disabled={isGeneratingAll}
                  className="w-full p-4 rounded-lg bg-amber-50 text-left hover:bg-amber-100 transition border border-amber-200 disabled:opacity-50"
                >
                  <div className="font-medium text-amber-900 flex items-center gap-2">
                    {isGeneratingAll ? <span className="w-4 h-4 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" /> : '🔄'}
                    Alle Felder generieren ({activeLanguage.toUpperCase()})
                  </div>
                  <div className="text-sm text-amber-700 mt-1">Generiert alle 8 Beschreibungsfelder basierend auf den Grunddaten</div>
                </button>
                <button className="w-full p-4 rounded-lg bg-indigo-50 text-left hover:bg-indigo-100 transition border border-indigo-200">
                  <div className="font-medium text-indigo-900">🌍 In alle Sprachen übersetzen</div>
                  <div className="text-sm text-indigo-700 mt-1">Übersetzt die deutschen Texte in alle konfigurierten Sprachen</div>
                </button>
                <button
                  onClick={generateTts}
                  disabled={isTtsGenerating}
                  className="w-full p-4 rounded-lg bg-green-50 text-left hover:bg-green-100 transition border border-green-200 disabled:opacity-50"
                >
                  <div className="font-medium text-green-900 flex items-center gap-2">
                    {isTtsGenerating ? <span className="w-4 h-4 border-2 border-green-500 border-t-transparent rounded-full animate-spin" /> : '🎧'}
                    Audio für alle Sprachen generieren
                  </div>
                  <div className="text-sm text-green-700 mt-1">Erstellt TTS-Audio für alle Beschreibungen und Sprachen</div>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">📋 Änderungshistorie</h3>
                <button
                  onClick={loadHistory}
                  disabled={historyLoading}
                  className="px-3 py-1.5 rounded-lg bg-gray-100 text-gray-600 text-xs font-medium hover:bg-gray-200 transition"
                >
                  {historyLoading ? 'Lädt...' : '↻ Aktualisieren'}
                </button>
              </div>
              {history.length === 0 && !historyLoading && (
                <div className="text-center py-10">
                  <div className="text-4xl mb-3">📋</div>
                  <p className="text-gray-500 text-sm">Noch keine Änderungen aufgezeichnet</p>
                  <p className="text-xs text-gray-400 mt-1">Jede Textbearbeitung wird hier gespeichert</p>
                  <button onClick={loadHistory} className="mt-3 text-xs text-indigo-600 hover:underline">
                    Historie laden
                  </button>
                </div>
              )}
              {historyLoading && (
                <div className="text-center py-8">
                  <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
                </div>
              )}
              {history.length > 0 && (
                <div className="space-y-3">
                  {history.map((entry) => (
                    <div key={entry.id} className="border border-gray-100 rounded-xl p-4 hover:border-gray-200 transition">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 text-xs rounded-full font-medium">
                              {entry.field}
                            </span>
                            <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                              {entry.lang?.toUpperCase()}
                            </span>
                            <span className="text-xs text-gray-400">
                              {new Date(entry.created_at).toLocaleString('de-DE', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <p className="text-xs text-red-500 font-medium mb-1">Vorher</p>
                              <p className="text-xs text-gray-500 bg-red-50 rounded-lg p-2 line-clamp-3">
                                {entry.old_value || <em className="text-gray-300">leer</em>}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-green-600 font-medium mb-1">Nachher</p>
                              <p className="text-xs text-gray-700 bg-green-50 rounded-lg p-2 line-clamp-3">
                                {entry.new_value || <em className="text-gray-300">leer</em>}
                              </p>
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => restoreVersion(entry)}
                          className="flex-shrink-0 px-3 py-1.5 rounded-lg bg-amber-50 text-amber-700 text-xs font-medium hover:bg-amber-100 transition"
                        >
                          Wiederherstellen
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-3">Status</h3>
            <div className="flex items-center gap-2 mb-4">
              <span className={`w-3 h-3 rounded-full ${statusCfg.dot}`} />
              <span className="text-sm font-medium">{statusCfg.label}</span>
            </div>
            <div className="space-y-2">
              {form.status !== 'review' && form.status !== 'published' && (
                <button onClick={() => changeStatus('review')} className="w-full py-2 rounded-lg bg-blue-50 text-blue-700 text-sm font-medium hover:bg-blue-100 transition">
                  Zur Review einreichen
                </button>
              )}
              {form.status !== 'published' && (
                <button onClick={() => changeStatus('published')} className="w-full py-2 rounded-lg bg-green-50 text-green-700 text-sm font-medium hover:bg-green-100 transition">
                  Veröffentlichen
                </button>
              )}
              {form.status === 'published' && (
                <button onClick={() => changeStatus('draft')} className="w-full py-2 rounded-lg bg-gray-50 text-gray-600 text-sm font-medium hover:bg-gray-100 transition">
                  Zurück zu Entwurf
                </button>
              )}
            </div>
          </div>

          {/* Room & Tags */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-3">Zuordnung</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Tags</label>
                <input
                  type="text"
                  value={Array.isArray(form.tags) ? form.tags.join(', ') : (form.tags || '')}
                  onChange={e => setForm(prev => ({ ...prev, tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean) }))}
                  placeholder="Tags kommagetrennt"
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:border-indigo-500 outline-none"
                />
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.is_highlight || false}
                  onChange={e => setForm(prev => ({ ...prev, is_highlight: e.target.checked }))}
                  className="rounded"
                />
                <span className="text-sm text-gray-700">Highlight-Werk</span>
              </label>
            </div>
          </div>

          {/* Quick QR */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-3">QR-Code</h3>
            {museum && artwork.inventory_number ? (
              <>
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(`https://artguide.fintutto.world/${museum.slug}/${artwork.inventory_number}`)}&format=png&margin=5&color=1e1b4b`}
                  alt="QR Code"
                  className="w-full rounded-lg border border-gray-200 mb-3"
                />
                <button onClick={() => setActiveTab('qr')} className="w-full py-2 rounded-lg bg-gray-100 text-gray-700 text-sm font-medium hover:bg-gray-200 transition">
                  QR-Code verwalten →
                </button>
              </>
            ) : (
              <div className="text-center py-4 text-gray-400 text-sm">
                {!artwork.inventory_number ? 'Inventarnummer für QR-Code erforderlich' : 'Museum wird geladen...'}
              </div>
            )}
          </div>

          {/* Metadata */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-xs text-gray-400">ID: <span className="font-mono">{artwork.id.slice(0, 8)}...</span></p>
            {artwork.created_at && <p className="text-xs text-gray-400 mt-1">Erstellt: {new Date(artwork.created_at).toLocaleDateString('de-DE')}</p>}
            {artwork.updated_at && <p className="text-xs text-gray-400 mt-1">Geändert: {new Date(artwork.updated_at).toLocaleDateString('de-DE')}</p>}
          </div>
        </div>
      </div>
    </>
  )
}
