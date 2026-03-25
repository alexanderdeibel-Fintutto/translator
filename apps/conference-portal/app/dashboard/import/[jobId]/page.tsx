'use client'

import { useState, use } from 'react'
import Link from 'next/link'
import { useImportJob, importActions } from '@/lib/hooks'
import type { ImportItem } from '@/lib/types'

const statusConfig: Record<string, { color: string; label: string; icon: string }> = {
  uploaded:  { color: 'bg-gray-100 text-gray-700',   label: 'Hochgeladen',   icon: '📁' },
  analyzing: { color: 'bg-blue-100 text-blue-700',   label: 'KI analysiert', icon: '🔍' },
  mapping:   { color: 'bg-purple-100 text-purple-700', label: 'Feld-Zuordnung', icon: '🔗' },
  enriching: { color: 'bg-yellow-100 text-yellow-700', label: 'KI anreichert', icon: '🤖' },
  review:    { color: 'bg-orange-100 text-orange-700', label: 'Zur Prüfung',  icon: '👁' },
  importing: { color: 'bg-cyan-100 text-cyan-700',   label: 'Importiert...',  icon: '📥' },
  completed: { color: 'bg-green-100 text-green-700', label: 'Abgeschlossen', icon: '✅' },
  failed:    { color: 'bg-red-100 text-red-700',     label: 'Fehlgeschlagen', icon: '❌' },
}

const categoryIcons: Record<string, string> = {
  attractions: '🏛', restaurants: '🍽', hotels: '🏨', shops: '🛍',
  culture: '🎭', nature: '🌿', sport: '⚽', nightlife: '🌙', other: '📌',
  paintings: '🖼', sculptures: '🗿', photography: '📷', prints: '🖨',
}

function getItemName(item: ImportItem): string {
  const src = item.source_data as any
  const enr = item.enriched_data as any
  const mapped = item.mapped_data as any
  // Try enriched name first (multilang), then source, then mapped
  if (enr?.name) {
    return typeof enr.name === 'object' ? (enr.name.de || enr.name.en || Object.values(enr.name)[0] || '') : enr.name
  }
  return src?.name || mapped?.title || mapped?.name || `#${item.row_number}`
}

function getItemAddress(item: ImportItem): string {
  const src = item.source_data as any
  return src?.address || src?.location || ''
}

function getItemCategory(item: ImportItem): string {
  const enr = item.enriched_data as any
  return enr?.category || (item.source_data as any)?.category || 'other'
}

function getDescriptionBrief(item: ImportItem, lang = 'de'): string {
  const enr = item.enriched_data as any
  if (!enr?.description_brief) return ''
  if (typeof enr.description_brief === 'object') {
    return enr.description_brief[lang] || enr.description_brief.de || enr.description_brief.en || ''
  }
  return enr.description_brief
}

function getDescriptionStandard(item: ImportItem, lang = 'de'): string {
  const enr = item.enriched_data as any
  if (!enr?.description_standard) return ''
  if (typeof enr.description_standard === 'object') {
    return enr.description_standard[lang] || enr.description_standard.de || enr.description_standard.en || ''
  }
  return enr.description_standard
}

export default function ImportJobDetailPage({ params }: { params: Promise<{ jobId: string }> }) {
  const { jobId } = use(params)
  const { job, items, loading, error, reload, updateItemStatus } = useImportJob(jobId)
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [expandedItem, setExpandedItem] = useState<string | null>(null)
  const [filterStatus, setFilterStatus] = useState<string>('')
  const [searchQuery, setSearchQuery] = useState('')
  const [isImporting, setIsImporting] = useState(false)
  const [importResult, setImportResult] = useState<{ imported: number; errors: number } | null>(null)
  const [actionMsg, setActionMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  function showMsg(type: 'success' | 'error', text: string) {
    setActionMsg({ type, text })
    setTimeout(() => setActionMsg(null), 4000)
  }

  async function handleApprove(itemId: string) {
    try {
      await updateItemStatus(itemId, 'approved')
    } catch (e: any) {
      showMsg('error', e.message)
    }
  }

  async function handleReject(itemId: string) {
    try {
      await updateItemStatus(itemId, 'rejected')
    } catch (e: any) {
      showMsg('error', e.message)
    }
  }

  async function handleBulkApprove() {
    try {
      await Promise.all(selectedItems.map(id => updateItemStatus(id, 'approved')))
      setSelectedItems([])
      showMsg('success', `${selectedItems.length} Einträge genehmigt.`)
    } catch (e: any) {
      showMsg('error', e.message)
    }
  }

  async function handleBulkReject() {
    try {
      await Promise.all(selectedItems.map(id => updateItemStatus(id, 'rejected')))
      setSelectedItems([])
      showMsg('success', `${selectedItems.length} Einträge abgelehnt.`)
    } catch (e: any) {
      showMsg('error', e.message)
    }
  }

  async function handleFinalImport() {
    if (!job) return
    setIsImporting(true)
    try {
      const result = await importActions.finalizeImport(job.id)
      setImportResult(result)
    } catch (e: any) {
      showMsg('error', e.message)
    } finally {
      setIsImporting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-4xl mb-4 animate-spin">⚙️</div>
          <p className="text-gray-500">Import-Job wird geladen...</p>
        </div>
      </div>
    )
  }

  if (error || !job) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6">
        <h2 className="font-bold text-red-800 mb-2">Import-Job nicht gefunden</h2>
        <p className="text-red-600 text-sm mb-4">{error || 'Der angeforderte Job existiert nicht.'}</p>
        <Link href="/dashboard/import" className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium">
          ← Zurück zur Übersicht
        </Link>
      </div>
    )
  }

  const statusInfo = statusConfig[job.status] || statusConfig.uploaded
  const modeLabel = job.import_mode === 'city' ? 'Stadt / City Guide' :
                    job.import_mode === 'museum' ? 'Museum / Galerie' :
                    job.import_mode === 'fair' ? 'Messe / Fair' :
                    job.import_mode === 'conference' ? 'Konferenz' : job.import_mode
  const modeIcon = job.import_mode === 'city' ? '🏙' :
                   job.import_mode === 'museum' ? '🏛' :
                   job.import_mode === 'fair' ? '🎪' : '📋'

  const enrichConfig = job.enrichment_config as any || {}
  const cityName = enrichConfig.city_name || ''
  const jobTitle = cityName
    ? `${cityName} – City Guide`
    : (job.source_files as any)?.[0]?.name || `Job ${job.id.substring(0, 8)}`

  const itemsTotal = job.items_total || 0
  const itemsApproved = job.items_approved || 0
  const itemsRejected = job.items_rejected || 0
  const itemsEnriched = job.items_enriched || 0
  const progressPercent = itemsTotal > 0 ? Math.round(((itemsApproved + itemsRejected) / itemsTotal) * 100) : 0

  const filteredItems = items.filter(item => {
    if (filterStatus && item.status !== filterStatus) return false
    if (searchQuery) {
      const name = getItemName(item).toLowerCase()
      if (!name.includes(searchQuery.toLowerCase())) return false
    }
    return true
  })

  // Import complete view
  if (importResult) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-8 text-center">
        <div className="text-5xl mb-4">🎉</div>
        <h2 className="text-2xl font-bold text-green-800 mb-2">Import abgeschlossen!</h2>
        <p className="text-green-700 mb-6">
          <strong>{importResult.imported}</strong> Einträge importiert
          {importResult.errors > 0 ? `, ${importResult.errors} Fehler` : ''}
        </p>
        <div className="flex gap-3 justify-center">
          {job.import_mode === 'city' ? (
            <Link href="/dashboard/pois" className="px-6 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition">
              POIs verwalten →
            </Link>
          ) : (
            <Link href="/dashboard/artworks" className="px-6 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition">
              Kunstwerke anzeigen →
            </Link>
          )}
          <Link href="/dashboard/import" className="px-6 py-2 bg-white border border-green-300 text-green-700 rounded-lg font-medium hover:bg-green-50 transition">
            Zurück zur Übersicht
          </Link>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/dashboard/import" className="p-2 rounded-lg hover:bg-gray-100 transition text-gray-500">
          ← Zurück
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-2xl">{modeIcon}</span>
            <h1 className="text-2xl font-bold text-gray-900">{jobTitle}</h1>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusInfo.color}`}>
              {statusInfo.icon} {statusInfo.label}
            </span>
          </div>
          <p className="text-gray-500 text-sm mt-1">
            {modeLabel} · Erstellt am {new Date(job.created_at).toLocaleDateString('de-DE')}
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={reload} className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 text-sm font-medium hover:bg-gray-200 transition">
            🔄 Aktualisieren
          </button>
        </div>
      </div>

      {/* Action message */}
      {actionMsg && (
        <div className={`mb-4 px-4 py-3 rounded-lg text-sm font-medium ${
          actionMsg.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {actionMsg.type === 'success' ? '✓ ' : '✗ '}{actionMsg.text}
        </div>
      )}

      {/* Processing banner */}
      {(job.status === 'analyzing' || job.status === 'enriching') && (
        <div className="mb-6 bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center gap-3">
          <div className="text-2xl animate-spin">⚙️</div>
          <div>
            <p className="font-medium text-blue-800">
              {job.status === 'analyzing' ? '🔍 KI analysiert Daten...' : '🤖 KI generiert Inhalte...'}
            </p>
            <p className="text-blue-600 text-sm">
              {itemsEnriched > 0 ? `${itemsEnriched} / ${itemsTotal} verarbeitet` : 'Wird gestartet...'}
            </p>
          </div>
          <button onClick={reload} className="ml-auto px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg text-sm hover:bg-blue-200 transition">
            Aktualisieren
          </button>
        </div>
      )}

      {/* Progress Overview */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Fortschritt</h2>
          <span className="text-sm text-gray-500">{progressPercent}% geprüft</span>
        </div>
        <div className="h-4 bg-gray-100 rounded-full overflow-hidden mb-4 flex">
          <div className="bg-green-500 h-full transition-all" style={{ width: `${itemsTotal > 0 ? (itemsApproved / itemsTotal) * 100 : 0}%` }} title={`${itemsApproved} genehmigt`} />
          <div className="bg-red-400 h-full transition-all" style={{ width: `${itemsTotal > 0 ? (itemsRejected / itemsTotal) * 100 : 0}%` }} title={`${itemsRejected} abgelehnt`} />
          <div className="bg-orange-300 h-full transition-all" style={{ width: `${itemsTotal > 0 ? ((itemsTotal - itemsApproved - itemsRejected) / itemsTotal) * 100 : 0}%` }} title="Ausstehend" />
        </div>
        <div className="grid grid-cols-6 gap-3">
          {[
            { label: 'Gesamt', value: itemsTotal, color: 'text-gray-900' },
            { label: 'Analysiert', value: job.items_analyzed || 0, color: 'text-blue-700' },
            { label: 'Angereichert', value: itemsEnriched, color: 'text-purple-700' },
            { label: 'Genehmigt', value: itemsApproved, color: 'text-green-700' },
            { label: 'Abgelehnt', value: itemsRejected, color: 'text-red-700' },
            { label: 'Ausstehend', value: Math.max(0, itemsTotal - itemsApproved - itemsRejected), color: 'text-orange-700' },
          ].map(stat => (
            <div key={stat.label} className="text-center p-3 bg-gray-50 rounded-lg">
              <div className={`text-xl font-bold ${stat.color}`}>{stat.value.toLocaleString()}</div>
              <div className="text-xs text-gray-500">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Filters & Bulk Actions */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
        <div className="flex items-center gap-4 flex-wrap">
          <input
            type="search"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Suchen..."
            className="flex-1 min-w-48 px-4 py-2 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-sm"
          />
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="px-3 py-2 rounded-lg border border-gray-300 text-sm"
          >
            <option value="">Alle Status ({items.length})</option>
            <option value="pending">Ausstehend ({items.filter(i => i.status === 'pending').length})</option>
            <option value="enriched">Angereichert ({items.filter(i => i.status === 'enriched').length})</option>
            <option value="approved">Genehmigt ({items.filter(i => i.status === 'approved').length})</option>
            <option value="rejected">Abgelehnt ({items.filter(i => i.status === 'rejected').length})</option>
            <option value="error">Fehler ({items.filter(i => i.status === 'error').length})</option>
          </select>
          {selectedItems.length > 0 && (
            <div className="flex gap-2">
              <button onClick={handleBulkApprove} className="px-3 py-2 rounded-lg bg-green-100 text-green-700 text-sm font-medium hover:bg-green-200 transition">
                ✓ {selectedItems.length} genehmigen
              </button>
              <button onClick={handleBulkReject} className="px-3 py-2 rounded-lg bg-red-100 text-red-700 text-sm font-medium hover:bg-red-200 transition">
                ✗ {selectedItems.length} ablehnen
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Empty state */}
      {filteredItems.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-400">
          {items.length === 0 ? (
            <>
              <div className="text-4xl mb-3">📭</div>
              <p className="font-medium">Noch keine Einträge vorhanden.</p>
              <p className="text-sm mt-1">Der Import-Job wird gerade verarbeitet. Klicke auf "Aktualisieren".</p>
            </>
          ) : (
            <>
              <div className="text-4xl mb-3">🔍</div>
              <p className="font-medium">Keine Einträge für diesen Filter.</p>
            </>
          )}
        </div>
      )}

      {/* Items List */}
      <div className="space-y-2">
        {filteredItems.map(item => {
          const isExpanded = expandedItem === item.id
          const category = getItemCategory(item)
          const catIcon = categoryIcons[category] || '📌'
          const name = getItemName(item)
          const address = getItemAddress(item)
          const briefDe = getDescriptionBrief(item, 'de')
          const briefEn = getDescriptionBrief(item, 'en')
          const standardDe = getDescriptionStandard(item, 'de')
          const enr = item.enriched_data as any || {}
          const qualityScore = enr.quality_score ?? null
          const qualityIssues: string[] = enr.quality_issues || []
          const lat = (item.source_data as any)?.lat
          const lng = (item.source_data as any)?.lng
          const rating = enr.rating
          const reviewsCount = enr.reviews_count

          return (
            <div key={item.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div
                className="flex items-center gap-4 p-4 cursor-pointer hover:bg-gray-50 transition"
                onClick={() => setExpandedItem(isExpanded ? null : item.id)}
              >
                <input
                  type="checkbox"
                  checked={selectedItems.includes(item.id)}
                  onClick={e => e.stopPropagation()}
                  onChange={e => {
                    if (e.target.checked) setSelectedItems(prev => [...prev, item.id])
                    else setSelectedItems(prev => prev.filter(id => id !== item.id))
                  }}
                  className="w-4 h-4 text-indigo-600 rounded border-gray-300"
                />
                <span className="text-gray-400 text-xs w-8">#{item.row_number}</span>
                <span className="text-lg">{catIcon}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 truncate">{name}</div>
                  {address && <div className="text-xs text-gray-400 truncate">{address}</div>}
                </div>
                {qualityScore !== null && (
                  <div className="flex items-center gap-2">
                    <div className="w-16 bg-gray-200 rounded-full h-1.5">
                      <div
                        className={`h-1.5 rounded-full ${qualityScore >= 0.85 ? 'bg-green-500' : qualityScore >= 0.6 ? 'bg-yellow-500' : 'bg-red-500'}`}
                        style={{ width: `${qualityScore * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-500 w-8">{Math.round(qualityScore * 100)}%</span>
                  </div>
                )}
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                  item.status === 'approved' ? 'bg-green-100 text-green-700' :
                  item.status === 'rejected' ? 'bg-red-100 text-red-700' :
                  item.status === 'enriched' ? 'bg-blue-100 text-blue-700' :
                  item.status === 'error' ? 'bg-red-100 text-red-600' :
                  'bg-orange-100 text-orange-700'
                }`}>
                  {item.status === 'approved' ? '✓ Genehmigt' :
                   item.status === 'rejected' ? '✗ Abgelehnt' :
                   item.status === 'enriched' ? '🤖 Angereichert' :
                   item.status === 'error' ? '❌ Fehler' : '⏳ Ausstehend'}
                </span>
                <span className={`text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}>▼</span>
              </div>

              {isExpanded && (
                <div className="border-t border-gray-200 p-4 bg-gray-50">
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-3">KI-generierter Content</h4>
                      {briefDe ? (
                        <div className="space-y-3">
                          <div>
                            <div className="text-xs font-medium text-indigo-600 mb-1">🇩🇪 Kurzbeschreibung (DE)</div>
                            <div className="text-sm text-gray-700 bg-white p-3 rounded-lg border border-gray-200">{briefDe}</div>
                          </div>
                          {briefEn && (
                            <div>
                              <div className="text-xs font-medium text-indigo-600 mb-1">🇬🇧 Brief Description (EN)</div>
                              <div className="text-sm text-gray-700 bg-white p-3 rounded-lg border border-gray-200">{briefEn}</div>
                            </div>
                          )}
                          {standardDe && (
                            <div>
                              <div className="text-xs font-medium text-indigo-600 mb-1">🇩🇪 Ausführlich (DE)</div>
                              <div className="text-sm text-gray-700 bg-white p-3 rounded-lg border border-gray-200">{standardDe}</div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-sm text-gray-400 italic p-3 bg-white rounded-lg border border-gray-200">
                          Noch kein KI-Content generiert.
                        </div>
                      )}
                    </div>

                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-3">Metadaten</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between p-2 bg-white rounded-lg border border-gray-200">
                          <span className="text-gray-500">Kategorie</span>
                          <span className="font-medium">{catIcon} {category}</span>
                        </div>
                        {lat && lng && (
                          <div className="flex justify-between p-2 bg-white rounded-lg border border-gray-200">
                            <span className="text-gray-500">Koordinaten</span>
                            <span className="font-mono text-xs">{lat}, {lng}</span>
                          </div>
                        )}
                        {rating && (
                          <div className="flex justify-between p-2 bg-white rounded-lg border border-gray-200">
                            <span className="text-gray-500">Bewertung</span>
                            <span className="font-medium text-yellow-600">★ {rating} {reviewsCount ? `(${reviewsCount.toLocaleString()})` : ''}</span>
                          </div>
                        )}
                        <div className="flex justify-between p-2 bg-white rounded-lg border border-gray-200">
                          <span className="text-gray-500">Zeile</span>
                          <span className="font-mono text-xs">#{item.row_number}</span>
                        </div>
                      </div>

                      {qualityIssues.length > 0 && (
                        <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                          <div className="text-xs font-semibold text-orange-700 mb-1">⚠ Qualitätsprobleme</div>
                          <ul className="text-xs text-orange-600 space-y-1">
                            {qualityIssues.map((issue: string, i: number) => (
                              <li key={i}>• {issue}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      <div className="flex gap-2 mt-4">
                        <button
                          onClick={() => handleApprove(item.id)}
                          disabled={item.status === 'approved'}
                          className="flex-1 px-3 py-2 rounded-lg bg-green-100 text-green-700 text-sm font-medium hover:bg-green-200 transition disabled:opacity-40"
                        >
                          ✓ Genehmigen
                        </button>
                        <button
                          onClick={() => handleReject(item.id)}
                          disabled={item.status === 'rejected'}
                          className="flex-1 px-3 py-2 rounded-lg bg-red-100 text-red-700 text-sm font-medium hover:bg-red-200 transition disabled:opacity-40"
                        >
                          ✗ Ablehnen
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Bottom Action Bar */}
      {(job.status === 'review' || itemsApproved > 0) && (
        <div className="fixed bottom-0 left-64 right-0 bg-white border-t border-gray-200 p-4 flex items-center justify-between z-40">
          <div className="text-sm text-gray-500">
            {itemsApproved.toLocaleString()} von {itemsTotal.toLocaleString()} genehmigt
          </div>
          <div className="flex gap-3">
            <button
              onClick={async () => {
                const pending = items.filter(i => i.status !== 'approved' && i.status !== 'rejected')
                await Promise.all(pending.map(i => updateItemStatus(i.id, 'approved')))
                showMsg('success', `${pending.length} ausstehende Einträge genehmigt.`)
              }}
              className="px-4 py-2 rounded-lg bg-green-100 text-green-700 text-sm font-medium hover:bg-green-200 transition"
            >
              ✓ Alle ausstehenden genehmigen
            </button>
            <button
              onClick={handleFinalImport}
              disabled={isImporting || itemsApproved === 0}
              className="px-6 py-3 rounded-lg bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition disabled:opacity-50"
            >
              {isImporting ? '⏳ Importiert...' : `📥 ${itemsApproved.toLocaleString()} Einträge importieren`}
            </button>
          </div>
        </div>
      )}

      <div className="h-20" />
    </>
  )
}
