'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase-client'
import { useMuseum } from '@/lib/hooks'

// Helper to generate a URL-friendly slug
function toSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[äöüß]/g, c => ({ ä: 'ae', ö: 'oe', ü: 'ue', ß: 'ss' }[c] || c))
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 60)
}

const LANG_OPTIONS = [
  { code: 'de', label: 'Deutsch' },
  { code: 'en', label: 'English' },
  { code: 'fr', label: 'Français' },
  { code: 'it', label: 'Italiano' },
  { code: 'es', label: 'Español' },
  { code: 'nl', label: 'Nederlands' },
  { code: 'pl', label: 'Polski' },
  { code: 'cs', label: 'Čeština' },
  { code: 'zh', label: '中文' },
  { code: 'ja', label: '日本語' },
  { code: 'ko', label: '한국어' },
  { code: 'ar', label: 'العربية' },
]

const tabs = ['Allgemein', 'Adresse', 'Branding', 'Sprachen', 'API']

export default function SettingsPage() {
  const { museum, loading: museumLoading, reload } = useMuseum()
  const supabase = createClient()

  const [activeTab, setActiveTab] = useState('Allgemein')
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Form state – Allgemein
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [slugManual, setSlugManual] = useState(false)
  const [description, setDescription] = useState('')
  const [email, setEmail] = useState('')
  const [website, setWebsite] = useState('')
  const [phone, setPhone] = useState('')

  // Form state – Adresse
  const [street, setStreet] = useState('')
  const [city, setCity] = useState('')
  const [zip, setZip] = useState('')
  const [country, setCountry] = useState('DE')

  // Form state – Branding
  const [primaryColor, setPrimaryColor] = useState('#1e1b4b')
  const [accentColor, setAccentColor] = useState('#c4a35a')

  // Form state – Sprachen
  const [defaultLang, setDefaultLang] = useState('de')
  const [supportedLangs, setSupportedLangs] = useState<string[]>(['de', 'en'])

  // Populate form from museum data
  useEffect(() => {
    if (!museum) return
    setName(museum.name || '')
    setSlug(museum.slug || '')
    setSlugManual(true) // existing museum: don't auto-generate slug
    const desc = museum.description as any
    setDescription(typeof desc === 'object' ? (desc[museum.default_language || 'de'] || '') : (desc || ''))
    setEmail(museum.email || '')
    setWebsite(museum.website || '')
    setPhone(museum.phone || '')
    const addr = museum.address as any || {}
    setStreet(addr.street || '')
    setCity(addr.city || '')
    setZip(addr.zip || '')
    setCountry(addr.country || 'DE')
    const brand = museum.branding as any || {}
    setPrimaryColor(brand.primaryColor || '#1e1b4b')
    setAccentColor(brand.accentColor || '#c4a35a')
    setDefaultLang(museum.default_language || 'de')
    setSupportedLangs(museum.supported_languages || ['de', 'en'])
  }, [museum])

  // Auto-generate slug from name (only for new museums)
  useEffect(() => {
    if (!slugManual && name) {
      setSlug(toSlug(name))
    }
  }, [name, slugManual])

  function showMsg(type: 'success' | 'error', text: string) {
    setSaveMsg({ type, text })
    setTimeout(() => setSaveMsg(null), 4000)
  }

  async function handleSave() {
    if (!name.trim()) {
      showMsg('error', 'Bitte gib einen Namen ein.')
      return
    }
    if (!slug.trim()) {
      showMsg('error', 'Bitte gib einen Slug ein.')
      return
    }

    setSaving(true)
    try {
      const address = { street, city, zip, country }
      const branding = { primaryColor, accentColor }

      if (!museum) {
        // CREATE new museum via RPC function
        const { data, error } = await supabase.rpc('create_museum_for_user', {
          p_name: name.trim(),
          p_slug: slug.trim(),
          p_description: description.trim(),
          p_email: email.trim() || null,
          p_website: website.trim() || null,
          p_phone: phone.trim() || null,
          p_address: address,
          p_branding: branding,
          p_default_language: defaultLang,
          p_supported_languages: supportedLangs,
        })
        if (error) throw error
        showMsg('success', 'Museum erfolgreich erstellt! Willkommen 🎉')
        await reload()
      } else {
        // UPDATE existing museum via RPC function
        const { error } = await supabase.rpc('update_museum_settings', {
          p_museum_id: museum.id,
          p_name: name.trim(),
          p_description: description.trim(),
          p_email: email.trim() || null,
          p_website: website.trim() || null,
          p_phone: phone.trim() || null,
          p_address: address,
          p_branding: branding,
          p_default_language: defaultLang,
          p_supported_languages: supportedLangs,
        })
        if (error) throw error
        showMsg('success', 'Einstellungen gespeichert.')
        await reload()
      }
    } catch (e: any) {
      console.error('Save error:', e)
      showMsg('error', e.message || 'Fehler beim Speichern.')
    } finally {
      setSaving(false)
    }
  }

  async function handleSaveBranding() {
    if (!museum) {
      showMsg('error', 'Bitte erstelle zuerst ein Museum im Tab "Allgemein".')
      return
    }
    setSaving(true)
    try {
      const { error } = await supabase.rpc('update_museum_settings', {
        p_museum_id: museum.id,
        p_branding: { primaryColor, accentColor },
      })
      if (error) throw error
      showMsg('success', 'Branding gespeichert.')
      await reload()
    } catch (e: any) {
      showMsg('error', e.message || 'Fehler beim Speichern.')
    } finally {
      setSaving(false)
    }
  }

  async function handleSaveLanguages() {
    if (!museum) {
      showMsg('error', 'Bitte erstelle zuerst ein Museum im Tab "Allgemein".')
      return
    }
    if (supportedLangs.length === 0) {
      showMsg('error', 'Mindestens eine Sprache muss ausgewählt sein.')
      return
    }
    setSaving(true)
    try {
      const { error } = await supabase.rpc('update_museum_settings', {
        p_museum_id: museum.id,
        p_default_language: defaultLang,
        p_supported_languages: supportedLangs,
      })
      if (error) throw error
      showMsg('success', 'Spracheinstellungen gespeichert.')
      await reload()
    } catch (e: any) {
      showMsg('error', e.message || 'Fehler beim Speichern.')
    } finally {
      setSaving(false)
    }
  }

  function toggleLang(code: string) {
    if (code === defaultLang) return // can't remove default language
    setSupportedLangs(prev =>
      prev.includes(code) ? prev.filter(l => l !== code) : [...prev, code]
    )
  }

  if (museumLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin text-4xl">⚙️</div>
      </div>
    )
  }

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Einstellungen</h1>
        <p className="text-gray-500 mt-1">
          {museum ? `Museum: ${museum.name}` : 'Richte dein Museum ein, um loszulegen.'}
        </p>
      </div>

      {/* Save message */}
      {saveMsg && (
        <div className={`mb-4 px-4 py-3 rounded-lg text-sm font-medium ${
          saveMsg.type === 'success'
            ? 'bg-green-50 text-green-800 border border-green-200'
            : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {saveMsg.type === 'success' ? '✓ ' : '✗ '}{saveMsg.text}
        </div>
      )}

      {/* New museum banner */}
      {!museum && (
        <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 mb-6">
          <p className="text-sm text-indigo-800 font-medium">
            Noch kein Museum angelegt. Fülle das Formular unten aus und klicke auf "Museum erstellen".
          </p>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
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

        {/* ── TAB: Allgemein ── */}
        {activeTab === 'Allgemein' && (
          <div className="space-y-5 max-w-2xl">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 outline-none"
                placeholder="Städtisches Museum Beispielstadt"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                URL-Slug <span className="text-red-500">*</span>
                <span className="text-xs text-gray-400 ml-2">artguide.fintutto.com/<strong>{slug || 'dein-museum'}</strong></span>
              </label>
              <input
                type="text"
                value={slug}
                onChange={e => { setSlugManual(true); setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-')) }}
                disabled={!!museum} // slug can't be changed after creation
                className={`w-full px-4 py-2 rounded-lg border border-gray-300 text-sm font-mono focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 outline-none ${museum ? 'bg-gray-50 text-gray-400' : ''}`}
                placeholder="staedtisches-museum"
              />
              {museum && <p className="text-xs text-gray-400 mt-1">Der Slug kann nach der Erstellung nicht mehr geändert werden.</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Beschreibung</label>
              <textarea
                rows={3}
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 outline-none"
                placeholder="Kurze Beschreibung deines Museums..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">E-Mail</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 outline-none"
                  placeholder="info@museum.de"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Telefon</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 outline-none"
                  placeholder="+49 123 456789"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
              <input
                type="url"
                value={website}
                onChange={e => setWebsite(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 outline-none"
                placeholder="https://www.museum.de"
              />
            </div>

            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2.5 rounded-lg bg-indigo-900 text-white text-sm font-medium hover:bg-indigo-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? '⏳ Speichern...' : museum ? '💾 Änderungen speichern' : '🏛 Museum erstellen'}
            </button>
          </div>
        )}

        {/* ── TAB: Adresse ── */}
        {activeTab === 'Adresse' && (
          <div className="space-y-5 max-w-2xl">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Straße & Hausnummer</label>
              <input
                type="text"
                value={street}
                onChange={e => setStreet(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 outline-none"
                placeholder="Musterstraße 1"
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">PLZ</label>
                <input
                  type="text"
                  value={zip}
                  onChange={e => setZip(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 outline-none"
                  placeholder="12345"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Stadt</label>
                <input
                  type="text"
                  value={city}
                  onChange={e => setCity(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 outline-none"
                  placeholder="Musterstadt"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Land</label>
              <select
                value={country}
                onChange={e => setCountry(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 outline-none"
              >
                <option value="DE">Deutschland</option>
                <option value="AT">Österreich</option>
                <option value="CH">Schweiz</option>
                <option value="IT">Italien</option>
                <option value="FR">Frankreich</option>
                <option value="NL">Niederlande</option>
                <option value="BE">Belgien</option>
                <option value="PL">Polen</option>
                <option value="CZ">Tschechien</option>
                <option value="ES">Spanien</option>
                <option value="GB">Großbritannien</option>
                <option value="US">USA</option>
              </select>
            </div>
            <button
              onClick={handleSave}
              disabled={saving || !museum}
              className="px-6 py-2.5 rounded-lg bg-indigo-900 text-white text-sm font-medium hover:bg-indigo-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? '⏳ Speichern...' : '💾 Adresse speichern'}
            </button>
            {!museum && <p className="text-xs text-gray-400">Erstelle zuerst ein Museum im Tab "Allgemein".</p>}
          </div>
        )}

        {/* ── TAB: Branding ── */}
        {activeTab === 'Branding' && (
          <div className="space-y-6 max-w-2xl">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Primärfarbe</label>
              <div className="flex gap-3 items-center">
                <input
                  type="color"
                  value={primaryColor}
                  onChange={e => setPrimaryColor(e.target.value)}
                  className="h-10 w-16 rounded border border-gray-300 cursor-pointer"
                />
                <input
                  type="text"
                  value={primaryColor}
                  onChange={e => setPrimaryColor(e.target.value)}
                  className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-mono w-32 focus:ring-2 focus:ring-indigo-300 outline-none"
                />
                <div className="w-8 h-8 rounded-full border border-gray-200" style={{ backgroundColor: primaryColor }} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Akzentfarbe</label>
              <div className="flex gap-3 items-center">
                <input
                  type="color"
                  value={accentColor}
                  onChange={e => setAccentColor(e.target.value)}
                  className="h-10 w-16 rounded border border-gray-300 cursor-pointer"
                />
                <input
                  type="text"
                  value={accentColor}
                  onChange={e => setAccentColor(e.target.value)}
                  className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-mono w-32 focus:ring-2 focus:ring-indigo-300 outline-none"
                />
                <div className="w-8 h-8 rounded-full border border-gray-200" style={{ backgroundColor: accentColor }} />
              </div>
            </div>
            {/* Preview */}
            <div className="rounded-xl p-4 border border-gray-200 bg-gray-50">
              <p className="text-xs text-gray-400 mb-3">Vorschau</p>
              <div className="flex gap-3">
                <button className="px-4 py-2 rounded-lg text-white text-sm font-medium" style={{ backgroundColor: primaryColor }}>
                  Primär-Button
                </button>
                <button className="px-4 py-2 rounded-lg text-white text-sm font-medium" style={{ backgroundColor: accentColor }}>
                  Akzent-Button
                </button>
              </div>
            </div>
            <button
              onClick={handleSaveBranding}
              disabled={saving || !museum}
              className="px-6 py-2.5 rounded-lg bg-indigo-900 text-white text-sm font-medium hover:bg-indigo-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? '⏳ Speichern...' : '🎨 Branding speichern'}
            </button>
            {!museum && <p className="text-xs text-gray-400">Erstelle zuerst ein Museum im Tab "Allgemein".</p>}
          </div>
        )}

        {/* ── TAB: Sprachen ── */}
        {activeTab === 'Sprachen' && (
          <div className="space-y-4 max-w-2xl">
            <p className="text-sm text-gray-500 mb-2">
              Wähle die Sprachen, in denen deine App verfügbar sein soll. Die Standardsprache wird für neue Inhalte verwendet.
            </p>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Standardsprache</label>
              <select
                value={defaultLang}
                onChange={e => {
                  const lang = e.target.value
                  setDefaultLang(lang)
                  if (!supportedLangs.includes(lang)) {
                    setSupportedLangs(prev => [...prev, lang])
                  }
                }}
                className="px-4 py-2 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-indigo-300 outline-none"
              >
                {LANG_OPTIONS.map(l => (
                  <option key={l.code} value={l.code}>{l.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Unterstützte Sprachen</label>
              <div className="space-y-1">
                {LANG_OPTIONS.map(l => (
                  <label key={l.code} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={supportedLangs.includes(l.code)}
                      onChange={() => toggleLang(l.code)}
                      disabled={l.code === defaultLang}
                      className="rounded"
                    />
                    <span className="text-sm font-medium text-gray-700">{l.label}</span>
                    <span className="text-xs text-gray-400">({l.code})</span>
                    {l.code === defaultLang && (
                      <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">Standard</span>
                    )}
                  </label>
                ))}
              </div>
            </div>
            <button
              onClick={handleSaveLanguages}
              disabled={saving || !museum}
              className="px-6 py-2.5 rounded-lg bg-indigo-900 text-white text-sm font-medium hover:bg-indigo-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? '⏳ Speichern...' : '🌍 Sprachen speichern'}
            </button>
            {!museum && <p className="text-xs text-gray-400">Erstelle zuerst ein Museum im Tab "Allgemein".</p>}
          </div>
        )}

        {/* ── TAB: API ── */}
        {activeTab === 'API' && (
          <div className="space-y-4 max-w-2xl">
            <p className="text-sm text-gray-500">
              API-Zugangsdaten für die Integration mit externen Systemen und der mobilen App.
            </p>
            {museum ? (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Museum-ID</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      readOnly
                      value={museum.id}
                      className="flex-1 px-4 py-2 rounded-lg border border-gray-300 text-sm bg-gray-50 font-mono text-gray-600"
                    />
                    <button
                      onClick={() => navigator.clipboard.writeText(museum.id)}
                      className="px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-sm transition"
                      title="Kopieren"
                    >
                      📋
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Museum-Slug</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      readOnly
                      value={museum.slug}
                      className="flex-1 px-4 py-2 rounded-lg border border-gray-300 text-sm bg-gray-50 font-mono text-gray-600"
                    />
                    <button
                      onClick={() => navigator.clipboard.writeText(museum.slug)}
                      className="px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-sm transition"
                      title="Kopieren"
                    >
                      📋
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Öffentliche URL</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      readOnly
                      value={`https://artguide.fintutto.com/${museum.slug}`}
                      className="flex-1 px-4 py-2 rounded-lg border border-gray-300 text-sm bg-gray-50 font-mono text-gray-600"
                    />
                    <button
                      onClick={() => navigator.clipboard.writeText(`https://artguide.fintutto.com/${museum.slug}`)}
                      className="px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-sm transition"
                      title="Kopieren"
                    >
                      📋
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="bg-gray-50 rounded-lg p-6 text-center text-gray-400 text-sm">
                Erstelle zuerst ein Museum, um API-Zugangsdaten zu erhalten.
              </div>
            )}
          </div>
        )}
      </div>
    </>
  )
}
