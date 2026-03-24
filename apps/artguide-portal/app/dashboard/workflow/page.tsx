'use client'

/**
 * Workflow Management Page — Editorial pipeline
 *
 * Shows:
 * - Kanban board (Draft → Review → Published → Archived)
 * - Pending reviews with approval/rejection
 * - Assignment to team members
 * - Review comments
 * - Bulk actions (approve all, etc.)
 */
export default function WorkflowPage() {
  const columns = [
    { id: 'draft', label: 'Entwurf', color: 'bg-gray-400', icon: '📝' },
    { id: 'review', label: 'In Review', color: 'bg-yellow-400', icon: '👀' },
    { id: 'published', label: 'Veroeffentlicht', color: 'bg-green-400', icon: '✅' },
    { id: 'archived', label: 'Archiviert', color: 'bg-red-400', icon: '📦' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="ml-64 p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Workflow</h1>
            <p className="text-gray-500 mt-1">Redaktionelle Pipeline — Entwurf bis Veroeffentlichung</p>
          </div>
          <div className="flex gap-3">
            <button className="px-4 py-2 rounded-lg bg-green-50 text-green-700 text-sm font-medium hover:bg-green-100 transition">
              ✅ Alle genehmigen
            </button>
          </div>
        </div>

        {/* Kanban Board */}
        <div className="grid grid-cols-4 gap-4 min-h-[600px]">
          {columns.map(col => (
            <div key={col.id} className="bg-gray-100 rounded-xl p-3">
              {/* Column header */}
              <div className="flex items-center gap-2 mb-4 px-2">
                <span className={`w-3 h-3 rounded-full ${col.color}`} />
                <span className="font-semibold text-sm text-gray-700">{col.label}</span>
                <span className="ml-auto text-xs text-gray-400 bg-white px-2 py-0.5 rounded-full">0</span>
              </div>

              {/* Cards placeholder */}
              <div className="space-y-2">
                <div className="bg-white rounded-lg p-3 border border-gray-200 text-center text-gray-400 text-sm py-12">
                  {col.icon}
                  <p className="mt-2">Keine Eintraege</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Recent Activity */}
        <div className="mt-8 bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">🕐 Letzte Workflow-Aktionen</h3>
          <div className="text-center py-8 text-gray-400">
            Noch keine Workflow-Aktionen
          </div>
        </div>
      </main>
    </div>
  )
}
