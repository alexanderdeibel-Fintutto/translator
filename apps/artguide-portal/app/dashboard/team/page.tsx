'use client'

/**
 * Team Management Page — Museum staff users and roles
 *
 * Roles:
 * - Administrator: Full access
 * - Redakteur: Content creation, editing, publishing
 * - Rechercheur: Content creation, submit for review
 * - Fotograf: Media management only
 * - Buchhaltung: Billing and analytics only
 */
export default function TeamPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <main className="ml-64 p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Team</h1>
            <p className="text-gray-500 mt-1">Nutzer und Rollen verwalten</p>
          </div>
          <button className="px-4 py-2 rounded-lg bg-indigo-900 text-white text-sm font-medium hover:bg-indigo-800 transition">
            + Mitglied einladen
          </button>
        </div>

        {/* Role Overview */}
        <div className="grid grid-cols-5 gap-4 mb-8">
          {[
            { role: 'Administrator', icon: '👑', desc: 'Voller Zugriff', count: 0, color: 'bg-red-50 text-red-700' },
            { role: 'Redakteur', icon: '✍', desc: 'Inhalte freigeben', count: 0, color: 'bg-blue-50 text-blue-700' },
            { role: 'Rechercheur', icon: '🔍', desc: 'Inhalte erstellen', count: 0, color: 'bg-green-50 text-green-700' },
            { role: 'Fotograf', icon: '📸', desc: 'Medien verwalten', count: 0, color: 'bg-amber-50 text-amber-700' },
            { role: 'Buchhaltung', icon: '📊', desc: 'Abrechnung & Stats', count: 0, color: 'bg-purple-50 text-purple-700' },
          ].map(item => (
            <div key={item.role} className={`rounded-xl p-4 ${item.color} border`}>
              <div className="text-2xl mb-2">{item.icon}</div>
              <div className="font-semibold text-sm">{item.role}</div>
              <div className="text-xs mt-1 opacity-70">{item.desc}</div>
              <div className="text-lg font-bold mt-2">{item.count}</div>
            </div>
          ))}
        </div>

        {/* Team Members Table */}
        <div className="bg-white rounded-xl border border-gray-200">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 text-left text-sm text-gray-500">
                <th className="p-4 font-medium">Mitglied</th>
                <th className="p-4 font-medium">Rolle</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium">Letzte Aktivitaet</th>
                <th className="p-4 font-medium">Aktionen</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={5} className="p-12 text-center text-gray-400">
                  Noch keine Teammitglieder. Lade dein Team ein.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </main>
    </div>
  )
}
