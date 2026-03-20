'use client'

/**
 * Billing Page — Museum subscription management
 *
 * Features:
 * - Current plan overview
 * - Usage metrics (artworks, AI generations, TTS minutes)
 * - Plan upgrade/downgrade
 * - Stripe Customer Portal link
 * - Invoice history
 * - White-label addon management
 */
export default function BillingPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <main className="ml-64 p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Abrechnung</h1>
            <p className="text-gray-500 mt-1">Abo-Verwaltung und Nutzungsuebersicht</p>
          </div>
          <button className="px-4 py-2 rounded-lg bg-indigo-900 text-white text-sm font-medium hover:bg-indigo-800 transition">
            Stripe Kundenportal
          </button>
        </div>

        {/* Current Plan */}
        <div className="bg-gradient-to-r from-indigo-900 to-indigo-700 rounded-2xl p-8 text-white mb-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-indigo-200 text-sm mb-1">Aktueller Plan</p>
              <h2 className="text-3xl font-bold">Starter</h2>
              <p className="text-indigo-200 mt-2">49 EUR/Monat · Naechste Abrechnung: —</p>
            </div>
            <button className="px-6 py-3 rounded-xl bg-amber-400 text-indigo-900 font-semibold hover:bg-amber-300 transition">
              Upgrade auf Professional
            </button>
          </div>
        </div>

        {/* Usage */}
        <div className="grid grid-cols-3 gap-6 mb-8">
          {[
            { label: 'Kunstwerke', used: 0, limit: 50, icon: '🖼' },
            { label: 'KI-Generierungen / Monat', used: 0, limit: 100, icon: '🤖' },
            { label: 'TTS-Minuten / Monat', used: 0, limit: 500, icon: '🎙' },
            { label: 'Sprachen', used: 2, limit: 2, icon: '🌍' },
            { label: 'Teammitglieder', used: 0, limit: 3, icon: '👥' },
            { label: 'Speicherplatz', used: 0, limit: 5, unit: 'GB', icon: '💾' },
          ].map(item => (
            <div key={item.label} className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xl">{item.icon}</span>
                <span className="text-sm font-medium text-gray-700">{item.label}</span>
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-2">
                {item.used} / {item.limit === 0 ? '∞' : item.limit}{item.unit ? ` ${item.unit}` : ''}
              </div>
              <div className="h-2 bg-gray-100 rounded-full">
                <div
                  className={`h-full rounded-full transition-all ${
                    item.limit > 0 && item.used / item.limit > 0.8
                      ? 'bg-red-400'
                      : 'bg-indigo-400'
                  }`}
                  style={{ width: `${item.limit > 0 ? Math.min(100, (item.used / item.limit) * 100) : 0}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Plan Comparison */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
          <h3 className="font-semibold text-gray-900 mb-6">Plaene vergleichen</h3>
          <div className="grid grid-cols-3 gap-6">
            {[
              {
                name: 'Starter', price: '49', features: [
                  '50 Kunstwerke', '2 Sprachen', 'QR-Codes', 'Basis-Audio',
                  '100 KI-Generierungen/Monat', '3 Teammitglieder',
                ],
                current: true,
              },
              {
                name: 'Professional', price: '199', badge: 'Beliebt', features: [
                  '500 Kunstwerke', '10 Sprachen', 'BLE + GPS', 'Chirp 3 HD Stimmen',
                  'KI-Chat + Erklaerungen', 'Unbegrenzte Touren',
                  'Analytics + Heatmaps', 'Redaktions-Workflow', '10 Teammitglieder',
                ],
              },
              {
                name: 'Enterprise', price: '599', features: [
                  'Unbegrenzte Kunstwerke', 'Alle Sprachen', 'White-Label App',
                  'API-Zugang', 'Alle Positionierungsmethoden',
                  'Unbegrenzte KI-Nutzung', 'Dedizierter Support',
                ],
              },
            ].map(plan => (
              <div
                key={plan.name}
                className={`rounded-xl p-6 ${
                  plan.current
                    ? 'border-2 border-indigo-400 bg-indigo-50/50'
                    : plan.badge
                      ? 'border-2 border-amber-400 bg-amber-50/30'
                      : 'border border-gray-200'
                }`}
              >
                {plan.badge && (
                  <span className="inline-block px-2 py-0.5 rounded bg-amber-400 text-amber-900 text-xs font-bold mb-3">
                    {plan.badge}
                  </span>
                )}
                <h4 className="text-lg font-bold text-gray-900">{plan.name}</h4>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {plan.price} <span className="text-sm font-normal text-gray-500">EUR/Monat</span>
                </p>
                <ul className="mt-4 space-y-2">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-center gap-2 text-sm text-gray-600">
                      <span className="text-green-500">✓</span> {f}
                    </li>
                  ))}
                </ul>
                <button
                  className={`w-full mt-6 py-2.5 rounded-lg text-sm font-medium transition ${
                    plan.current
                      ? 'bg-gray-200 text-gray-500 cursor-default'
                      : 'bg-indigo-900 text-white hover:bg-indigo-800'
                  }`}
                  disabled={plan.current}
                >
                  {plan.current ? 'Aktueller Plan' : 'Upgrade'}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Invoices */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Rechnungen</h3>
          <div className="text-center py-8 text-gray-400">
            Noch keine Rechnungen vorhanden
          </div>
        </div>
      </main>
    </div>
  )
}
