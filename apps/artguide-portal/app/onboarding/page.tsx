'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

type Step = 1 | 2 | 3 | 4 | 5

type MuseumData = {
  name: string
  type: string
  city: string
  country: string
  website: string
  description: string
  languages: string[]
  tier: string
  contact_name: string
  contact_email: string
  has_existing_data: string
  import_method: string
}

const MUSEUM_TYPES = [
  { id: 'art', label: 'Kunstmuseum', icon: '🖼' },
  { id: 'history', label: 'Historisches Museum', icon: '🏛' },
  { id: 'science', label: 'Naturkunde / Wissenschaft', icon: '🔬' },
  { id: 'local', label: 'Heimatmuseum', icon: '🏡' },
  { id: 'exhibition', label: 'Ausstellungsraum', icon: '✨' },
  { id: 'other', label: 'Sonstiges', icon: '🎨' },
]

const LANGUAGES = [
  { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
  { code: 'en', label: 'Englisch', flag: '🇬🇧' },
  { code: 'fr', label: 'Französisch', flag: '🇫🇷' },
  { code: 'es', label: 'Spanisch', flag: '🇪🇸' },
  { code: 'it', label: 'Italienisch', flag: '🇮🇹' },
  { code: 'nl', label: 'Niederländisch', flag: '🇳🇱' },
  { code: 'pl', label: 'Polnisch', flag: '🇵🇱' },
  { code: 'ja', label: 'Japanisch', flag: '🇯🇵' },
  { code: 'zh', label: 'Chinesisch', flag: '🇨🇳' },
]

const TIERS = [
  {
    id: 'free',
    label: 'Free',
    price: '0 €',
    period: 'für immer',
    icon: '🌱',
    color: 'border-gray-600 bg-gray-800/50',
    activeColor: 'border-indigo-400 bg-indigo-900/30',
    features: ['20 Exponate', '2 Sprachen', '1 Führung', 'KI-Anreicherung (Basic)', 'QR-Codes'],
    limit: '20 Exponate',
  },
  {
    id: 'starter',
    label: 'Starter',
    price: '49 €',
    period: 'pro Monat',
    icon: '🚀',
    color: 'border-gray-600 bg-gray-800/50',
    activeColor: 'border-indigo-400 bg-indigo-900/30',
    features: ['200 Exponate', '5 Sprachen', '10 Führungen', 'KI-Anreicherung (Standard)', 'Audio-Generierung', 'Analytics'],
    limit: '200 Exponate',
    badge: 'Empfohlen',
  },
  {
    id: 'pro',
    label: 'Pro',
    price: '149 €',
    period: 'pro Monat',
    icon: '⭐',
    color: 'border-gray-600 bg-gray-800/50',
    activeColor: 'border-amber-400 bg-amber-900/20',
    features: ['Unbegrenzte Exponate', '10 Sprachen', 'Unbegrenzte Führungen', 'KI-Anreicherung (HD)', 'Premium Audio-Stimmen', 'Buddy-Chat KI', 'Besucher-Heatmap'],
    limit: 'Unbegrenzt',
  },
]

const STEPS = [
  { id: 1, label: 'Museum', icon: '🏛' },
  { id: 2, label: 'Sprachen', icon: '🌍' },
  { id: 3, label: 'Daten', icon: '📦' },
  { id: 4, label: 'Paket', icon: '💎' },
  { id: 5, label: 'Los geht\'s', icon: '🚀' },
]

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>(1)
  const [data, setData] = useState<MuseumData>({
    name: '',
    type: '',
    city: '',
    country: 'DE',
    website: '',
    description: '',
    languages: ['de', 'en'],
    tier: 'starter',
    contact_name: '',
    contact_email: '',
    has_existing_data: '',
    import_method: '',
  })
  const [saving, setSaving] = useState(false)

  const update = (field: keyof MuseumData, value: string | string[]) => {
    setData(prev => ({ ...prev, [field]: value }))
  }

  const toggleLanguage = (code: string) => {
    setData(prev => ({
      ...prev,
      languages: prev.languages.includes(code)
        ? prev.languages.filter(l => l !== code)
        : [...prev.languages, code],
    }))
  }

  const canProceed = () => {
    if (step === 1) return data.name.length > 2 && data.type && data.city
    if (step === 2) return data.languages.length >= 1
    if (step === 3) return data.has_existing_data !== ''
    if (step === 4) return data.tier !== ''
    return true
  }

  const handleFinish = async () => {
    setSaving(true)
    // In production: save to Supabase
    await new Promise(r => setTimeout(r, 1500))
    setSaving(false)
    router.push('/dashboard?onboarding=complete')
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      {/* Header */}
      <div className="px-6 pt-8 pb-4">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center text-sm font-bold">A</div>
          <span className="font-semibold text-white/80">Art Guide Setup</span>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center gap-1 mb-2">
          {STEPS.map((s, i) => (
            <div key={s.id} className="flex items-center gap-1 flex-1">
              <div className={`flex flex-col items-center flex-1 ${i < STEPS.length - 1 ? 'relative' : ''}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm transition ${
                  step > s.id ? 'bg-green-500 text-white' :
                  step === s.id ? 'bg-indigo-500 text-white ring-2 ring-indigo-300/30' :
                  'bg-white/10 text-white/30'
                }`}>
                  {step > s.id ? '✓' : s.icon}
                </div>
                <span className={`text-[10px] mt-1 font-medium ${step === s.id ? 'text-indigo-300' : 'text-white/30'}`}>
                  {s.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`h-0.5 flex-1 rounded-full mb-4 transition ${step > s.id ? 'bg-green-500' : 'bg-white/10'}`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="flex-1 px-6 pb-32 overflow-y-auto">

        {/* Step 1: Museum Info */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-2xl font-bold text-white">Dein Museum</h2>
              <p className="text-white/50 text-sm mt-1">Erzähl uns von deiner Einrichtung</p>
            </div>

            <div>
              <label className="text-xs text-white/50 font-medium uppercase tracking-wide block mb-1.5">Name des Museums *</label>
              <input type="text" value={data.name} onChange={e => update('name', e.target.value)}
                placeholder="z.B. Stadtmuseum Heidelberg"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-indigo-400 text-sm" />
            </div>

            <div>
              <label className="text-xs text-white/50 font-medium uppercase tracking-wide block mb-2">Art der Einrichtung *</label>
              <div className="grid grid-cols-2 gap-2">
                {MUSEUM_TYPES.map(t => (
                  <button key={t.id} onClick={() => update('type', t.id)}
                    className={`flex items-center gap-2 px-3 py-3 rounded-xl border text-sm transition ${
                      data.type === t.id
                        ? 'border-indigo-400 bg-indigo-900/30 text-white'
                        : 'border-white/10 bg-white/5 text-white/60 hover:bg-white/10'
                    }`}>
                    <span>{t.icon}</span> {t.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-white/50 font-medium uppercase tracking-wide block mb-1.5">Stadt *</label>
                <input type="text" value={data.city} onChange={e => update('city', e.target.value)}
                  placeholder="Berlin"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-indigo-400 text-sm" />
              </div>
              <div>
                <label className="text-xs text-white/50 font-medium uppercase tracking-wide block mb-1.5">Land</label>
                <select value={data.country} onChange={e => update('country', e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-400 text-sm">
                  <option value="DE">🇩🇪 Deutschland</option>
                  <option value="AT">🇦🇹 Österreich</option>
                  <option value="CH">🇨🇭 Schweiz</option>
                  <option value="OTHER">Sonstiges</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs text-white/50 font-medium uppercase tracking-wide block mb-1.5">Kurzbeschreibung</label>
              <textarea value={data.description} onChange={e => update('description', e.target.value)}
                placeholder="Was macht euer Museum besonders? (optional)"
                rows={3}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-indigo-400 text-sm resize-none" />
            </div>
          </div>
        )}

        {/* Step 2: Languages */}
        {step === 2 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-2xl font-bold text-white">Sprachen</h2>
              <p className="text-white/50 text-sm mt-1">Welche Sprachen sollen eure Besucher nutzen können?</p>
            </div>

            <div className="bg-indigo-900/20 border border-indigo-500/20 rounded-2xl p-4 text-sm text-indigo-300">
              <p className="font-medium mb-1">✨ KI-Übersetzung inklusive</p>
              <p className="text-indigo-400 text-xs">Alle Inhalte werden automatisch in die gewählten Sprachen übersetzt. Ihr pflegt nur Deutsch oder Englisch ein.</p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {LANGUAGES.map(l => (
                <button key={l.code} onClick={() => toggleLanguage(l.code)}
                  className={`flex items-center gap-2 px-3 py-3 rounded-xl border text-sm transition ${
                    data.languages.includes(l.code)
                      ? 'border-indigo-400 bg-indigo-900/30 text-white'
                      : 'border-white/10 bg-white/5 text-white/60 hover:bg-white/10'
                  }`}>
                  <span>{l.flag}</span>
                  <span className="flex-1 text-left">{l.label}</span>
                  {data.languages.includes(l.code) && <span className="text-indigo-400 text-xs">✓</span>}
                </button>
              ))}
            </div>

            <p className="text-white/30 text-xs text-center">
              {data.languages.length} Sprache{data.languages.length !== 1 ? 'n' : ''} ausgewählt
            </p>
          </div>
        )}

        {/* Step 3: Existing Data */}
        {step === 3 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-2xl font-bold text-white">Eure Daten</h2>
              <p className="text-white/50 text-sm mt-1">Wie möchtet ihr eure Exponate einpflegen?</p>
            </div>

            <div>
              <label className="text-xs text-white/50 font-medium uppercase tracking-wide block mb-2">Habt ihr bereits eine Datenbank oder Inventarliste? *</label>
              <div className="space-y-2">
                {[
                  { id: 'yes_csv', label: 'Ja — als Excel/CSV-Datei', icon: '📊', desc: 'Wir importieren und mappen die Felder automatisch per KI' },
                  { id: 'yes_system', label: 'Ja — in einem Museum-System', icon: '🗄', desc: 'z.B. MuseumPlus, Axiell, TMS — wir helfen beim Export' },
                  { id: 'no_manual', label: 'Nein — wir starten von Null', icon: '✏️', desc: 'Ihr pflegt Exponate manuell ein oder nutzt unseren Schnell-Import' },
                  { id: 'no_ai', label: 'Nein — KI soll helfen', icon: '🤖', desc: 'Gebt uns Fotos und Basisdaten — die KI generiert Texte automatisch' },
                ].map(opt => (
                  <button key={opt.id} onClick={() => update('has_existing_data', opt.id)}
                    className={`w-full flex items-start gap-3 px-4 py-3 rounded-xl border text-left transition ${
                      data.has_existing_data === opt.id
                        ? 'border-indigo-400 bg-indigo-900/30 text-white'
                        : 'border-white/10 bg-white/5 text-white/60 hover:bg-white/10'
                    }`}>
                    <span className="text-xl flex-shrink-0 mt-0.5">{opt.icon}</span>
                    <div>
                      <p className="font-medium text-sm">{opt.label}</p>
                      <p className="text-xs text-white/40 mt-0.5">{opt.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {data.has_existing_data === 'yes_csv' && (
              <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-4 text-sm text-green-300">
                <p className="font-medium mb-1">📊 CSV-Import vorbereitet</p>
                <p className="text-green-400 text-xs">Nach dem Setup könnt ihr direkt eure Datei hochladen. Die KI erkennt automatisch welche Spalte welchem Feld entspricht.</p>
              </div>
            )}
          </div>
        )}

        {/* Step 4: Tier Selection */}
        {step === 4 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-2xl font-bold text-white">Euer Paket</h2>
              <p className="text-white/50 text-sm mt-1">Startet kostenlos — upgradet jederzeit</p>
            </div>

            <div className="space-y-3">
              {TIERS.map(tier => (
                <button key={tier.id} onClick={() => update('tier', tier.id)}
                  className={`w-full rounded-2xl border p-4 text-left transition relative ${
                    data.tier === tier.id ? tier.activeColor : tier.color
                  }`}>
                  {tier.badge && (
                    <span className="absolute top-3 right-3 px-2 py-0.5 bg-indigo-500 text-white text-[10px] font-bold rounded-full">
                      {tier.badge}
                    </span>
                  )}
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-2xl">{tier.icon}</span>
                    <div>
                      <p className="font-bold text-white">{tier.label}</p>
                      <p className="text-sm">
                        <span className="text-white font-bold">{tier.price}</span>
                        <span className="text-white/40 text-xs"> / {tier.period}</span>
                      </p>
                    </div>
                    {data.tier === tier.id && (
                      <div className="ml-auto w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center text-xs">✓</div>
                    )}
                  </div>
                  <div className="space-y-1">
                    {tier.features.map((f, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-white/60">
                        <span className="text-green-400">✓</span> {f}
                      </div>
                    ))}
                  </div>
                </button>
              ))}
            </div>

            <p className="text-white/30 text-xs text-center">Keine Kreditkarte erforderlich für Free. Jederzeit kündbar.</p>
          </div>
        )}

        {/* Step 5: Confirmation */}
        {step === 5 && (
          <div className="space-y-5">
            <div className="text-center pt-4">
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="text-2xl font-bold text-white">Alles bereit!</h2>
              <p className="text-white/50 text-sm mt-2">Hier ist eine Zusammenfassung eures Setups</p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-3">
              {[
                { label: 'Museum', value: data.name, icon: '🏛' },
                { label: 'Typ', value: MUSEUM_TYPES.find(t => t.id === data.type)?.label || data.type, icon: '🎨' },
                { label: 'Standort', value: `${data.city}, ${data.country}`, icon: '📍' },
                { label: 'Sprachen', value: data.languages.map(l => LANGUAGES.find(x => x.code === l)?.flag || l).join(' '), icon: '🌍' },
                { label: 'Paket', value: TIERS.find(t => t.id === data.tier)?.label || data.tier, icon: '💎' },
              ].map(row => (
                <div key={row.label} className="flex items-center justify-between">
                  <span className="text-white/40 text-sm flex items-center gap-2">
                    <span>{row.icon}</span> {row.label}
                  </span>
                  <span className="text-white text-sm font-medium">{row.value}</span>
                </div>
              ))}
            </div>

            <div className="bg-indigo-900/20 border border-indigo-500/20 rounded-2xl p-4">
              <p className="text-indigo-300 text-sm font-medium mb-2">🚀 Was passiert als nächstes?</p>
              <div className="space-y-2">
                {[
                  data.has_existing_data === 'yes_csv' ? '📊 CSV-Import-Wizard öffnet sich automatisch' : '✏️ Erstes Exponat manuell anlegen',
                  '✨ KI reichert eure Inhalte automatisch an',
                  '🎙 Audio-Guide wird generiert',
                  '📱 QR-Codes zum Ausdrucken bereit',
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-indigo-400">
                    <span className="text-indigo-500 font-bold">{i + 1}.</span> {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-gray-950/95 backdrop-blur-sm border-t border-white/10 px-6 py-4 flex gap-3">
        {step > 1 && (
          <button onClick={() => setStep(prev => (prev - 1) as Step)}
            className="px-5 py-3 rounded-xl bg-white/10 text-white/70 text-sm font-medium hover:bg-white/15 transition">
            ← Zurück
          </button>
        )}
        {step < 5 ? (
          <button
            onClick={() => setStep(prev => (prev + 1) as Step)}
            disabled={!canProceed()}
            className="flex-1 py-3 rounded-xl bg-indigo-500 text-white text-sm font-bold hover:bg-indigo-400 disabled:opacity-40 disabled:cursor-not-allowed transition">
            Weiter →
          </button>
        ) : (
          <button
            onClick={handleFinish}
            disabled={saving}
            className="flex-1 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-sm font-bold hover:from-indigo-400 hover:to-purple-500 disabled:opacity-50 transition flex items-center justify-center gap-2">
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Wird eingerichtet...
              </>
            ) : (
              '🚀 Museum einrichten!'
            )}
          </button>
        )}
      </div>
    </div>
  )
}
