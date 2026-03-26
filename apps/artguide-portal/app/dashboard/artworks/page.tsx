'use client'
import { useState, useEffect, useCallback } from 'react'

type Artwork = {
  id: string
  inventory_number: string
  title: string
  artist_name: string
  year_created: string
  medium: string
  status: 'draft' | 'review' | 'published' | 'archived'
  is_highlight: boolean
  category: string
  tags: string[]
  image_url: string | null
  audio_url: string | null
  created_at: string
}

const STATUS_CONFIG = {
  draft:     { label: 'Entwurf',        color: 'bg-gray-100 text-gray-600',    dot: 'bg-gray-400' },
  review:    { label: 'In Review',      color: 'bg-yellow-100 text-yellow-700', dot: 'bg-yellow-400' },
  published: { label: 'Veroeffentlicht', color: 'bg-green-100 text-green-700',  dot: 'bg-green-500' },
  archived:  { label: 'Archiviert',     color: 'bg-red-100 text-red-600',      dot: 'bg-red-400' },
}

const CAT_ICONS: Record<string, string> = {
  painting: '🖼', sculpture: '🗿', installation: '💡', photography: '📷',
  drawing: '✏️', print: '🖨', textile: '🧵', ceramic: '🏺', other: '🎨',
}

export default function ArtworksPage() {
  const [artworks, setArtworks] = useState<Artwork[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [qrModal, setQrModal] = useState<{ artwork: Artwork; svgContent: string } | null>(null)
  const [generatingQr, setGeneratingQr] = useState<string | null>(null)
  const [exportingPdf, setExportingPdf] = useState(false)

  const fetchArtworks = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (search) params.set('search', search)
      if (statusFilter) params.set('status', statusFilter)
      const res = await fetch('/api/artworks?' + params.toString())
      const data = await res.json()
      setArtworks(data.artworks || [])
    } catch { setArtworks([]) }
    finally { setLoading(false) }
  }, [search, statusFilter])

  useEffect(() => { fetchArtworks() }, [fetchArtworks])

  const generateQr = async (artwork: Artwork) => {
    setGeneratingQr(artwork.id)
    try {
      const res = await fetch('/api/qr?artwork_id=' + artwork.id + '&museum_id=demo-museum&format=svg')
      const svg = await res.text()
      setQrModal({ artwork, svgContent: svg })
    } catch (err) { alert('QR-Fehler: ' + err) }
    finally { setGeneratingQr(null) }
  }

  const exportQrPdf = async () => {
    if (selectedIds.size === 0) { alert('Bitte zuerst Exponate auswaehlen'); return }
    setExportingPdf(true)
    try {
      const selected = artworks.filter(a => selectedIds.has(a.id))
      const res = await fetch('/api/qr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ artworks: selected, museumId: 'demo-museum' }),
      })
      const data = await res.json()
      if (!data.success) { alert('Fehler'); return }
      const { jsPDF } = await import('jspdf')
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
      doc.setFontSize(14); doc.setFont('helvetica', 'bold')
      doc.text('Fintutto Art Guide — QR-Code Schilder', 105, 10, { align: 'center' })
      data.qr_codes.forEach((qr: { title: string; artist: string; qr_data_url: string }, idx: number) => {
        const col = idx % 2; const row = Math.floor(idx / 2) % 3
        if (idx > 0 && idx % 6 === 0) doc.addPage()
        const x = 10 + col * 95; const y = 15 + row * 90
        doc.setDrawColor(200, 200, 200); doc.setFillColor(255, 255, 255)
        doc.roundedRect(x, y, 90, 85, 3, 3, 'FD')
        doc.addImage(qr.qr_data_url, 'PNG', x + 25, y + 5, 40, 40)
        doc.setFontSize(9); doc.setFont('helvetica', 'bold'); doc.setTextColor(30, 27, 75)
        doc.text((qr.title || '').slice(0, 30), x + 45, y + 52, { align: 'center' })
        doc.setFontSize(8); doc.setFont('helvetica', 'normal'); doc.setTextColor(100, 100, 100)
        doc.text((qr.artist || '').slice(0, 35), x + 45, y + 58, { align: 'center' })
        doc.setFontSize(7); doc.setTextColor(150, 150, 150)
        doc.text('Scannen fuer mehr Informationen', x + 45, y + 68, { align: 'center' })
      })
      doc.save('fintutto-qr-codes.pdf')
    } catch (err) { alert('PDF-Fehler: ' + err) }
    finally { setExportingPdf(false) }
  }

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n })
  }
  const toggleAll = () => {
    setSelectedIds(selectedIds.size === artworks.length ? new Set() : new Set(artworks.map(a => a.id)))
  }

  const counts = {
    all: artworks.length,
    published: artworks.filter(a => a.status === 'published').length,
    review: artworks.filter(a => a.status === 'review').length,
    draft: artworks.filter(a => a.status === 'draft').length,
  }

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Kunstwerke & Exponate</h1>
          <p className="text-gray-500 mt-1">{counts.all} Exponate · {counts.published} veroeffentlicht · {counts.review} in Review</p>
        </div>
        <div className="flex gap-3">
          {selectedIds.size > 0 && (
            <button onClick={exportQrPdf} disabled={exportingPdf}
              className="px-4 py-2 rounded-lg bg-purple-100 text-purple-700 text-sm font-medium hover:bg-purple-200 transition disabled:opacity-50">
              {exportingPdf ? '⏳ PDF...' : `📄 QR-PDF (${selectedIds.size})`}
            </button>
          )}
          <a href="/dashboard/import/museum" className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50 transition">📥 Import</a>
          <button className="px-4 py-2 rounded-lg bg-indigo-900 text-white text-sm font-medium hover:bg-indigo-800 transition">+ Neues Exponat</button>
        </div>
      </div>
      <div className="flex gap-3 mb-6">
        <div className="flex-1 relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
          <input type="text" placeholder="Titel, Kuenstler, Inventarnummer..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-300 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none" />
        </div>
        <div className="flex gap-2">
          {[
            { val: '', label: `Alle (${counts.all})` },
            { val: 'published', label: `✅ (${counts.published})` },
            { val: 'review', label: `👀 (${counts.review})` },
            { val: 'draft', label: `📝 (${counts.draft})` },
          ].map(f => (
            <button key={f.val} onClick={() => setStatusFilter(f.val)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                statusFilter === f.val ? 'bg-indigo-100 text-indigo-700' : 'bg-white text-gray-500 hover:bg-gray-50 border border-gray-200'
              }`}>{f.label}</button>
          ))}
        </div>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="py-3 px-4 text-left">
                <input type="checkbox" checked={selectedIds.size === artworks.length && artworks.length > 0} onChange={toggleAll} className="rounded" />
              </th>
              <th className="py-3 px-4 text-left text-xs font-semibold text-gray-500 uppercase">Exponat</th>
              <th className="py-3 px-4 text-left text-xs font-semibold text-gray-500 uppercase">Kuenstler</th>
              <th className="py-3 px-4 text-left text-xs font-semibold text-gray-500 uppercase">Jahr</th>
              <th className="py-3 px-4 text-left text-xs font-semibold text-gray-500 uppercase">Kategorie</th>
              <th className="py-3 px-4 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
              <th className="py-3 px-4 text-left text-xs font-semibold text-gray-500 uppercase">Aktionen</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-b border-gray-100">
                  {Array.from({ length: 7 }).map((_, j) => (
                    <td key={j} className="py-4 px-4"><div className="h-4 bg-gray-200 rounded animate-pulse" /></td>
                  ))}
                </tr>
              ))
            ) : artworks.length === 0 ? (
              <tr><td colSpan={7} className="py-16 text-center text-gray-400">
                <div className="text-4xl mb-3">🖼</div>
                <p className="font-medium text-gray-600">Noch keine Exponate</p>
                <a href="/dashboard/import/museum" className="inline-block mt-4 px-4 py-2 rounded-lg bg-indigo-900 text-white text-sm font-medium">📥 Import starten</a>
              </td></tr>
            ) : artworks.map(artwork => {
              const st = STATUS_CONFIG[artwork.status] || STATUS_CONFIG.draft
              const catIcon = CAT_ICONS[artwork.category] || '🎨'
              return (
                <tr key={artwork.id} className={`border-b border-gray-100 hover:bg-gray-50 transition ${selectedIds.has(artwork.id) ? 'bg-indigo-50' : ''}`}>
                  <td className="py-3 px-4"><input type="checkbox" checked={selectedIds.has(artwork.id)} onChange={() => toggleSelect(artwork.id)} className="rounded" /></td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-xl flex-shrink-0 overflow-hidden">
                          {artwork.image_url ? (
                            <img src={artwork.image_url} alt={artwork.title} className="w-full h-full object-cover" />
                          ) : catIcon}
                        </div>
                      <div className="min-w-0">
                        <div className="font-medium text-gray-900 truncate max-w-48">
                          {artwork.is_highlight && <span className="text-amber-500 mr-1">⭐</span>}
                          {artwork.title}
                        </div>
                        <div className="text-xs text-gray-400">{artwork.inventory_number}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-700">{artwork.artist_name || '—'}</td>
                  <td className="py-3 px-4 text-sm text-gray-500">{artwork.year_created || '—'}</td>
                  <td className="py-3 px-4 text-sm text-gray-600">{catIcon} {artwork.category}</td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${st.color}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
                      {st.label}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1">
                      <a href={`/dashboard/artworks/${artwork.id}`} className="p-1.5 rounded hover:bg-gray-100 text-gray-500 hover:text-indigo-600 transition" title="Bearbeiten">✏️</a>
                      <button onClick={() => generateQr(artwork)} disabled={generatingQr === artwork.id}
                        className="p-1.5 rounded hover:bg-gray-100 text-gray-500 hover:text-purple-600 transition disabled:opacity-50" title="QR-Code">
                        {generatingQr === artwork.id ? '⏳' : '📱'}
                      </button>
                      <button className="p-1.5 rounded hover:bg-gray-100 text-gray-500 hover:text-green-600 transition" title="Audio">🎙</button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      {qrModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setQrModal(null)}>
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900">QR-Code</h3>
              <button onClick={() => setQrModal(null)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 flex items-center justify-center mb-4"
              dangerouslySetInnerHTML={{ __html: qrModal.svgContent }} />
            <div className="text-center mb-4">
              <div className="font-medium text-gray-900">{qrModal.artwork.title}</div>
              <div className="text-sm text-gray-500">{qrModal.artwork.artist_name}</div>
              <div className="text-xs text-gray-400 mt-1 font-mono">app.fintutto.com/art/demo/poi/{qrModal.artwork.id.slice(0, 8)}...</div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => {
                const blob = new Blob([qrModal.svgContent], { type: 'image/svg+xml' })
                const url = URL.createObjectURL(blob)
                const a = document.createElement('a'); a.href = url
                a.download = `qr-${qrModal.artwork.inventory_number}.svg`; a.click()
              }} className="flex-1 px-3 py-2 rounded-lg bg-gray-100 text-gray-700 text-sm font-medium hover:bg-gray-200 transition">⬇ SVG</button>
              <button onClick={() => { toggleSelect(qrModal.artwork.id); setQrModal(null) }}
                className="flex-1 px-3 py-2 rounded-lg bg-indigo-100 text-indigo-700 text-sm font-medium hover:bg-indigo-200 transition">📄 Zum PDF</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
