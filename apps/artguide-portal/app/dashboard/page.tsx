'use client'

/**
 * Museum CMS Dashboard — Overview page
 *
 * Shows:
 * - Today's visitor count
 * - Most viewed artworks
 * - Recent activity
 * - Quick actions (add artwork, create tour, view analytics)
 * - Pending reviews (workflow)
 * - AI suggestions
 */
export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 bottom-0 w-64 bg-indigo-950 text-white p-6 flex flex-col">
        <div className="flex items-center gap-3 mb-8">
          <span className="text-2xl">🏛</span>
          <div>
            <div className="font-bold text-sm">Art Guide</div>
            <div className="text-xs text-white/50">Museum CMS</div>
          </div>
        </div>

        <nav className="space-y-1 flex-1">
          {[
            { icon: '📊', label: 'Dashboard', href: '/dashboard', active: true },
            { icon: '🖼', label: 'Kunstwerke', href: '/dashboard/artworks' },
            { icon: '🗺', label: 'Fuehrungen', href: '/dashboard/tours' },
            { icon: '🏗', label: 'Standort & Raeume', href: '/dashboard/venue' },
            { icon: '📸', label: 'Mediathek', href: '/dashboard/media' },
            { icon: '🎙', label: 'Audio & Stimmen', href: '/dashboard/audio' },
            { icon: '👥', label: 'Team', href: '/dashboard/team' },
            { icon: '📈', label: 'Analytics', href: '/dashboard/analytics' },
            { icon: '📋', label: 'Workflow', href: '/dashboard/workflow' },
            { icon: '💳', label: 'Abrechnung', href: '/dashboard/billing' },
            { icon: '⚙', label: 'Einstellungen', href: '/dashboard/settings' },
          ].map(item => (
            <a
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition ${
                item.active
                  ? 'bg-white/15 text-white font-medium'
                  : 'text-white/60 hover:bg-white/10 hover:text-white'
              }`}
            >
              <span>{item.icon}</span>
              {item.label}
            </a>
          ))}
        </nav>

        <div className="text-xs text-white/30 mt-4">
          powered by Fintutto Art Guide
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-500 mt-1">Uebersicht fuer dein Museum</p>
          </div>
          <div className="flex gap-3">
            <button className="px-4 py-2 rounded-lg bg-indigo-900 text-white text-sm font-medium hover:bg-indigo-800 transition">
              + Kunstwerk hinzufuegen
            </button>
            <button className="px-4 py-2 rounded-lg bg-amber-500 text-white text-sm font-medium hover:bg-amber-400 transition">
              🤖 KI-Fuehrung erstellen
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Besucher heute', value: '—', icon: '👥', change: '' },
            { label: 'Audio-Wiedergaben', value: '—', icon: '🎧', change: '' },
            { label: 'KI-Chats', value: '—', icon: '💬', change: '' },
            { label: 'Ø Besuchsdauer', value: '—', icon: '⏱', change: '' },
          ].map(stat => (
            <div key={stat.label} className="bg-white rounded-xl p-5 border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl">{stat.icon}</span>
                {stat.change && (
                  <span className="text-xs text-green-600 font-medium">{stat.change}</span>
                )}
              </div>
              <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
              <div className="text-sm text-gray-500 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-2 gap-6">
          {/* Pending Reviews */}
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-4">📋 Offene Reviews</h3>
            <div className="text-center py-8 text-gray-400">
              Keine offenen Reviews
            </div>
          </div>

          {/* AI Tour Suggestions */}
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-4">🤖 KI-Vorschlaege</h3>
            <div className="text-center py-8 text-gray-400">
              <button className="px-4 py-2 rounded-lg bg-indigo-50 text-indigo-700 text-sm font-medium hover:bg-indigo-100 transition">
                KI-Fuehrungen generieren lassen
              </button>
            </div>
          </div>

          {/* Top Artworks */}
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-4">🏆 Beliebteste Werke</h3>
            <div className="text-center py-8 text-gray-400">
              Noch keine Besucherdaten
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-4">🕐 Letzte Aktivitaet</h3>
            <div className="text-center py-8 text-gray-400">
              Keine aktuellen Aktivitaeten
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
