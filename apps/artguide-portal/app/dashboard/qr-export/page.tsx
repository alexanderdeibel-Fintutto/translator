'use client'
import { useState, useEffect, useRef } from 'react'

type Artwork = {
  id: string
  title: string
  artist_name: string
  inventory_number: string
  location: string | null
  status: string
  is_highlight: boolean
  category: string
}

type QRStyle = 'minimal' | 'branded' | 'museum' | 'print'
type QRSize = 'small' | 'medium' | 'large'

const QR_STYLES: { id: QRStyle; label: string; desc: string; icon: string }[] = [
  { id: 'minimal', label: 'Minimal', desc: 'Nur QR-Code und Nummer', icon: '⬜' },
  { id: 'branded', label: 'Branded', desc: 'Mit Fintutto-Logo und Titel', icon: '🎨' },
  { id: 'museum', label: 'Museum', desc: 'Mit Museumsname und Exponat-Info', icon: '🏛' },
  { id: 'print', label: 'Druck-Etikett', desc: 'Optimiert für Aufkleber/Schilder', icon: '🖨' },
]

const QR_SIZES: { id: QRSize; label: string; desc: string }[] = [
  { id: 'small', label: 'Klein', desc: '5 × 5 cm' },
  { id: 'medium', label: 'Mittel', desc: '8 × 8 cm' },
  { id: 'large', label: 'Groß', desc: '12 × 12 cm' },
]

export default function QRExportPage() {
  const [artworks, setArtworks] = useState<Artwork[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [style, setStyle] = useState<QRStyle>('branded')
  const [size, setSize] = useState<QRSize>('medium')
  const [museumName, setMuseumName] = useState('Mein Museum')
  const [baseUrl, setBaseUrl] = useState('https://app.fintutto.com/visitor')
  const [generating, setGenerating] = useState(false)
  const [progress, setProgress] = useState(0)
  const [filter, setFilter] = useState<'all' | 'published' | 'highlights'>('published')
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    fetch('/api/artworks?limit=100')
      .then(r => r.json())
      .then(d => setArtworks(d.artworks || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const filtered = artworks.filter(a => {
    if (filter === 'published') return a.status === 'published'
    if (filter === 'highlights') return a.is_highlight
    return true
  })

  const toggleSelect = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id); else next.add(id)
      return next
    })
  }

  const selectAll = () => {
    setSelected(new Set(filtered.map(a => a.id)))
  }

  const selectNone = () => setSelected(new Set())

  const generateQRUrl = (artwork: Artwork) => {
    const id = artwork.inventory_number || artwork.id
    return `${baseUrl}/demo-museum/${id}`
  }

  const generateQRSvg = (url: string, artworkTitle: string, invNumber: string) => {
    // Simple QR code placeholder SVG (in production: use qrcode library)
    const sizeMap = { small: 80, medium: 120, large: 160 }
    const qrSize = sizeMap[size]

    const styleContent = {
      minimal: `
        <rect width="${qrSize + 20}" height="${qrSize + 30}" rx="4" fill="white"/>
        <rect x="10" y="10" width="${qrSize}" height="${qrSize}" rx="4" fill="#1e1b4b"/>
        <text x="${(qrSize + 20) / 2}" y="${qrSize + 25}" text-anchor="middle" font-family="monospace" font-size="8" fill="#666">${invNumber}</text>
      `,
      branded: `
        <rect width="${qrSize + 40}" height="${qrSize + 60}" rx="8" fill="white" stroke="#e5e7eb" stroke-width="1"/>
        <rect x="20" y="20" width="${qrSize}" height="${qrSize}" rx="4" fill="#1e1b4b"/>
        <text x="${(qrSize + 40) / 2}" y="${qrSize + 42}" text-anchor="middle" font-family="sans-serif" font-size="9" font-weight="bold" fill="#111">${artworkTitle.substring(0, 25)}${artworkTitle.length > 25 ? '…' : ''}</text>
        <text x="${(qrSize + 40) / 2}" y="${qrSize + 56}" text-anchor="middle" font-family="sans-serif" font-size="7" fill="#6366f1">Art Guide · Fintutto</text>
      `,
      museum: `
        <rect width="${qrSize + 40}" height="${qrSize + 70}" rx="8" fill="white" stroke="#e5e7eb" stroke-width="1"/>
        <rect x="0" y="0" width="${qrSize + 40}" height="18" rx="8" fill="#1e1b4b"/>
        <rect x="0" y="10" width="${qrSize + 40}" height="8" fill="#1e1b4b"/>
        <text x="${(qrSize + 40) / 2}" y="13" text-anchor="middle" font-family="sans-serif" font-size="8" fill="white">${museumName.substring(0, 30)}</text>
        <rect x="20" y="24" width="${qrSize}" height="${qrSize}" rx="4" fill="#1e1b4b"/>
        <text x="${(qrSize + 40) / 2}" y="${qrSize + 46}" text-anchor="middle" font-family="sans-serif" font-size="9" font-weight="bold" fill="#111">${artworkTitle.substring(0, 25)}${artworkTitle.length > 25 ? '…' : ''}</text>
        <text x="${(qrSize + 40) / 2}" y="${qrSize + 60}" text-anchor="middle" font-family="sans-serif" font-size="7" fill="#888">${invNumber}</text>
        <text x="${(qrSize + 40) / 2}" y="${qrSize + 72}" text-anchor="middle" font-family="sans-serif" font-size="7" fill="#6366f1">🔍 Scan für mehr Infos</text>
      `,
      print: `
        <rect width="${qrSize + 20}" height="${qrSize + 40}" rx="2" fill="white" stroke="#000" stroke-width="1"/>
        <rect x="10" y="10" width="${qrSize}" height="${qrSize}" rx="2" fill="#000"/>
        <text x="${(qrSize + 20) / 2}" y="${qrSize + 26}" text-anchor="middle" font-family="monospace" font-size="8" fill="#000" font-weight="bold">${invNumber}</text>
        <text x="${(qrSize + 20) / 2}" y="${qrSize + 38}" text-anchor="middle" font-family="monospace" font-size="7" fill="#333">${artworkTitle.substring(0, 20)}${artworkTitle.length > 20 ? '…' : ''}</text>
      `,
    }

    const heights = { minimal: qrSize + 40, branded: qrSize + 70, museum: qrSize + 82, print: qrSize + 50 }
    const widths = { minimal: qrSize + 20, branded: qrSize + 40, museum: qrSize + 40, print: qrSize + 20 }

    return `<svg xmlns="http://www.w3.org/2000/svg" width="${widths[style]}" height="${heights[style]}">${styleContent[style]}</svg>`
  }

  const downloadSingleQR = (artwork: Artwork) => {
    const url = generateQRUrl(artwork)
    const svg = generateQRSvg(url, artwork.title, artwork.inventory_number || artwork.id)
    const blob = new Blob([svg], { type: 'image/svg+xml' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `qr-${artwork.inventory_number || artwork.id}.svg`
    a.click()
  }

  const generateBatchPDF = async () => {
    if (selected.size === 0) return
    setGenerating(true)
    setProgress(0)

    const selectedArtworks = artworks.filter(a => selected.has(a.id))

    try {
      // Use jsPDF if available, otherwise create SVG bundle
      const { jsPDF } = await import('jspdf')
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })

      const perRow = 3
      const perPage = 9
      const marginX = 15
      const marginY = 20
      const cellW = 60
      const cellH = 80

      for (let i = 0; i < selectedArtworks.length; i++) {
        const artwork = selectedArtworks[i]
        const pageIndex = Math.floor(i / perPage)
        const posOnPage = i % perPage
        const row = Math.floor(posOnPage / perRow)
        const col = posOnPage % perRow

        if (i > 0 && posOnPage === 0) {
          doc.addPage()
        }

        if (posOnPage === 0) {
          doc.setFontSize(10)
          doc.setTextColor(100)
          doc.text(`${museumName} — QR-Codes (Seite ${pageIndex + 1})`, marginX, 12)
          doc.setDrawColor(200)
          doc.line(marginX, 14, 195, 14)
        }

        const x = marginX + col * cellW
        const y = marginY + row * cellH

        // QR placeholder box
        doc.setFillColor(30, 27, 75)
        doc.roundedRect(x + 5, y, 45, 45, 2, 2, 'F')

        // QR pattern hint
        doc.setFillColor(255, 255, 255)
        doc.rect(x + 8, y + 3, 10, 10, 'F')
        doc.rect(x + 27, y + 3, 10, 10, 'F')
        doc.rect(x + 8, y + 32, 10, 10, 'F')
        doc.setFillColor(30, 27, 75)
        doc.rect(x + 10, y + 5, 6, 6, 'F')
        doc.rect(x + 29, y + 5, 6, 6, 'F')
        doc.rect(x + 10, y + 34, 6, 6, 'F')

        // URL text (tiny)
        doc.setFontSize(5)
        doc.setTextColor(150)
        doc.text(generateQRUrl(artwork).substring(0, 35), x + 5, y + 50)

        // Title
        doc.setFontSize(7)
        doc.setTextColor(30)
        const titleLines = doc.splitTextToSize(artwork.title, cellW - 10)
        doc.text(titleLines.slice(0, 2), x + 5, y + 55)

        // Artist
        doc.setFontSize(6)
        doc.setTextColor(100)
        doc.text(artwork.artist_name || '', x + 5, y + 62)

        // Inventory number
        doc.setFontSize(6)
        doc.setTextColor(150)
        doc.text(artwork.inventory_number || artwork.id, x + 5, y + 68)

        setProgress(Math.round(((i + 1) / selectedArtworks.length) * 100))
      }

      // Footer on last page
      doc.setFontSize(7)
      doc.setTextColor(150)
      doc.text(`Generiert mit Fintutto Art Guide · ${new Date().toLocaleDateString('de-DE')} · ${selectedArtworks.length} QR-Codes`, marginX, 285)

      doc.save(`${museumName.replace(/\s+/g, '-')}-QR-Codes-${new Date().toISOString().split('T')[0]}.pdf`)
    } catch {
      // Fallback: download as SVG bundle
      const svgs = selectedArtworks.map(a => {
        const url = generateQRUrl(a)
        return `<!-- ${a.title} -->\n${generateQRSvg(url, a.title, a.inventory_number || a.id)}`
      }).join('\n\n')
      const blob = new Blob([`<svg xmlns="http://www.w3.org/2000/svg">\n${svgs}\n</svg>`], { type: 'image/svg+xml' })
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = `qr-codes-${Date.now()}.svg`
      link.click()
    }

    setGenerating(false)
    setProgress(0)
  }

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">QR-Code Export</h1>
          <p className="text-gray-500 mt-1">QR-Codes für Exponate generieren und als PDF drucken</p>
        </div>
        <div className="flex gap-3">
          <button onClick={selectAll} className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 text-sm hover:bg-gray-50 transition">
            Alle auswählen ({filtered.length})
          </button>
          <button
            onClick={generateBatchPDF}
            disabled={selected.size === 0 || generating}
            className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 disabled:opacity-40 transition flex items-center gap-2">
            {generating ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                {progress}% ...
              </>
            ) : (
              <>🖨 PDF drucken ({selected.size})</>
            )}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Left: Settings */}
        <div className="col-span-1 space-y-4">
          <div className="bg-white rounded-2xl border border-gray-200 p-4">
            <h3 className="font-semibold text-gray-900 mb-3 text-sm">Einstellungen</h3>

            <div className="mb-4">
              <label className="text-xs text-gray-500 font-medium uppercase tracking-wide block mb-2">Stil</label>
              <div className="space-y-2">
                {QR_STYLES.map(s => (
                  <button key={s.id} onClick={() => setStyle(s.id)}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl border text-sm transition ${
                      style === s.id ? 'border-indigo-400 bg-indigo-50 text-indigo-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}>
                    <span>{s.icon}</span>
                    <div className="text-left">
                      <p className="font-medium text-xs">{s.label}</p>
                      <p className="text-gray-400 text-[10px]">{s.desc}</p>
                    </div>
                    {style === s.id && <span className="ml-auto text-indigo-500 text-xs">✓</span>}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <label className="text-xs text-gray-500 font-medium uppercase tracking-wide block mb-2">Größe</label>
              <div className="flex gap-2">
                {QR_SIZES.map(s => (
                  <button key={s.id} onClick={() => setSize(s.id)}
                    className={`flex-1 py-2 rounded-xl border text-xs transition ${
                      size === s.id ? 'border-indigo-400 bg-indigo-50 text-indigo-700 font-medium' : 'border-gray-200 text-gray-500 hover:bg-gray-50'
                    }`}>
                    <p>{s.label}</p>
                    <p className="text-[10px] text-gray-400">{s.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-3">
              <label className="text-xs text-gray-500 font-medium uppercase tracking-wide block mb-1.5">Museumsname</label>
              <input type="text" value={museumName} onChange={e => setMuseumName(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-indigo-400" />
            </div>

            <div>
              <label className="text-xs text-gray-500 font-medium uppercase tracking-wide block mb-1.5">Basis-URL</label>
              <input type="text" value={baseUrl} onChange={e => setBaseUrl(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-400 font-mono" />
            </div>
          </div>

          {/* Preview */}
          <div className="bg-white rounded-2xl border border-gray-200 p-4">
            <h3 className="font-semibold text-gray-900 mb-3 text-sm">Vorschau</h3>
            <div className="flex justify-center p-4 bg-gray-50 rounded-xl"
              dangerouslySetInnerHTML={{
                __html: generateQRSvg(
                  `${baseUrl}/demo-museum/INV-001`,
                  'Beispiel-Kunstwerk',
                  'INV-001'
                )
              }} />
            <p className="text-center text-xs text-gray-400 mt-2">Beispiel-Vorschau</p>
          </div>
        </div>

        {/* Right: Artwork Selection */}
        <div className="col-span-2">
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            {/* Filter Bar */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100">
              {[
                { id: 'all', label: `Alle (${artworks.length})` },
                { id: 'published', label: `Veröffentlicht (${artworks.filter(a => a.status === 'published').length})` },
                { id: 'highlights', label: `⭐ Highlights (${artworks.filter(a => a.is_highlight).length})` },
              ].map(f => (
                <button key={f.id} onClick={() => setFilter(f.id as typeof filter)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                    filter === f.id ? 'bg-indigo-100 text-indigo-700' : 'text-gray-500 hover:bg-gray-100'
                  }`}>
                  {f.label}
                </button>
              ))}
              <div className="ml-auto flex items-center gap-2">
                <span className="text-xs text-gray-400">{selected.size} ausgewählt</span>
                {selected.size > 0 && (
                  <button onClick={selectNone} className="text-xs text-red-500 hover:text-red-700">Auswahl aufheben</button>
                )}
              </div>
            </div>

            {/* Artwork List */}
            {loading ? (
              <div className="text-center py-12 text-gray-400">
                <div className="text-3xl mb-2">⏳</div>
                <p className="text-sm">Lade Exponate...</p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <div className="text-3xl mb-2">🖼</div>
                <p className="text-sm">Keine Exponate gefunden</p>
                <a href="/dashboard/import/museum" className="text-indigo-600 text-xs mt-1 block">Import starten →</a>
              </div>
            ) : (
              <div className="divide-y divide-gray-50 max-h-[600px] overflow-y-auto">
                {filtered.map(artwork => (
                  <div key={artwork.id}
                    onClick={() => toggleSelect(artwork.id)}
                    className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition ${
                      selected.has(artwork.id) ? 'bg-indigo-50' : 'hover:bg-gray-50'
                    }`}>
                    <input type="checkbox" checked={selected.has(artwork.id)} onChange={() => toggleSelect(artwork.id)}
                      className="rounded accent-indigo-600 flex-shrink-0" onClick={e => e.stopPropagation()} />
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 flex-shrink-0 text-lg">
                      🖼
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{artwork.title}</p>
                      <p className="text-xs text-gray-500 truncate">{artwork.artist_name}</p>
                      <p className="text-xs text-gray-400 font-mono">{artwork.inventory_number || artwork.id}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {artwork.is_highlight && <span className="text-xs">⭐</span>}
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        artwork.status === 'published' ? 'bg-green-100 text-green-700' :
                        artwork.status === 'review' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-gray-100 text-gray-500'
                      }`}>{artwork.status}</span>
                      <button
                        onClick={e => { e.stopPropagation(); downloadSingleQR(artwork) }}
                        className="px-2 py-1 rounded-lg bg-gray-100 text-gray-500 text-xs hover:bg-gray-200 transition"
                        title="Einzeln herunterladen">
                        ↓ SVG
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
