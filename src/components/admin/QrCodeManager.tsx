// Fintutto World — QR Code Generator & Manager
// Generate QR codes per museum (overview) and per artwork/POS

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  QrCode, Download, Printer, Copy, Check, Loader2,
  Landmark, Eye, RefreshCw,
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import type { Artwork, Museum } from '@/lib/artguide/types'
import { useSearchParams } from 'react-router-dom'

// Simple QR code generator using a public API for rendering
function qrCodeUrl(data: string, size = 200): string {
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(data)}&format=svg`
}

interface QrItem {
  id: string
  label: string
  sublabel: string
  url: string
  qrUrl: string
  type: 'museum' | 'artwork'
}

export default function QrCodeManager() {
  const [searchParams] = useSearchParams()
  const [museums, setMuseums] = useState<Museum[]>([])
  const [museumId, setMuseumId] = useState(searchParams.get('museum') || '')
  const [artworks, setArtworks] = useState<Artwork[]>([])
  const [items, setItems] = useState<QrItem[]>([])
  const [loading, setLoading] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())
  const printRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    supabase
      .from('ag_museums')
      .select('*')
      .eq('is_active', true)
      .order('name')
      .then(({ data }) => {
        if (data) {
          setMuseums(data as Museum[])
          if (!museumId && data.length === 1) setMuseumId(data[0].id)
        }
      })
  }, [])

  useEffect(() => {
    if (museumId) loadArtworks()
  }, [museumId])

  async function loadArtworks() {
    setLoading(true)
    const museum = museums.find(m => m.id === museumId)

    const { data } = await supabase
      .from('ag_artworks')
      .select('*')
      .eq('museum_id', museumId)
      .order('sort_order')

    const artworkList = (data || []) as Artwork[]
    setArtworks(artworkList)

    const baseUrl = window.location.origin
    const qrItems: QrItem[] = []

    // Museum overview QR
    if (museum) {
      const museumUrl = `${baseUrl}/museum/${museum.slug}`
      qrItems.push({
        id: `museum-${museum.id}`,
        label: museum.name,
        sublabel: 'Museum-Uebersicht',
        url: museumUrl,
        qrUrl: qrCodeUrl(museumUrl, 300),
        type: 'museum',
      })
    }

    // Per-artwork QR codes
    for (const artwork of artworkList) {
      const artworkUrl = `${baseUrl}/museum/${museum?.slug || museumId}/artwork/${artwork.id}`
      const titleDe = (artwork.title as Record<string, string>)?.de || artwork.artist_name || `Exponat ${artwork.sort_order}`
      qrItems.push({
        id: artwork.id,
        label: titleDe,
        sublabel: artwork.artist_name || '',
        url: artworkUrl,
        qrUrl: qrCodeUrl(artworkUrl, 200),
        type: 'artwork',
      })
    }

    setItems(qrItems)
    setLoading(false)
  }

  function toggleItem(id: string) {
    const next = new Set(selectedItems)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setSelectedItems(next)
  }

  function selectAll() {
    if (selectedItems.size === items.length) {
      setSelectedItems(new Set())
    } else {
      setSelectedItems(new Set(items.map(i => i.id)))
    }
  }

  async function copyUrl(url: string, id: string) {
    await navigator.clipboard.writeText(url)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  function handlePrint() {
    const itemsToPrint = items.filter(i => selectedItems.size === 0 || selectedItems.has(i.id))
    const printWindow = window.open('', '_blank')
    if (!printWindow) return

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>QR-Codes — ${museums.find(m => m.id === museumId)?.name || 'Museum'}</title>
        <style>
          body { font-family: system-ui, sans-serif; margin: 0; padding: 20px; }
          .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
          .item { text-align: center; page-break-inside: avoid; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; }
          .item img { width: 150px; height: 150px; }
          .item h3 { font-size: 14px; margin: 8px 0 2px; }
          .item p { font-size: 11px; color: #6b7280; margin: 0; }
          .museum-item img { width: 200px; height: 200px; }
          .museum-item { grid-column: span 3; }
          @media print { .no-print { display: none; } }
        </style>
      </head>
      <body>
        <h1 style="font-size: 18px; margin-bottom: 16px;">${museums.find(m => m.id === museumId)?.name || 'Museum'} — QR-Codes</h1>
        <div class="grid">
          ${itemsToPrint.map(item => `
            <div class="item ${item.type === 'museum' ? 'museum-item' : ''}">
              <img src="${item.qrUrl}" alt="QR Code" />
              <h3>${item.label}</h3>
              <p>${item.sublabel}</p>
            </div>
          `).join('')}
        </div>
        <script>window.print()</script>
      </body>
      </html>
    `)
    printWindow.document.close()
  }

  async function handleDownloadAll() {
    const itemsToDownload = items.filter(i => selectedItems.size === 0 || selectedItems.has(i.id))
    for (const item of itemsToDownload) {
      const response = await fetch(item.qrUrl)
      const blob = await response.blob()
      const a = document.createElement('a')
      a.href = URL.createObjectURL(blob)
      a.download = `qr-${item.label.replace(/[^a-zA-Z0-9]/g, '-')}.svg`
      a.click()
      URL.revokeObjectURL(a.href)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <QrCode className="h-6 w-6" />
            QR-Code Manager
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Generiere und drucke QR-Codes fuer dein Museum und alle Exponate.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handlePrint} disabled={items.length === 0}>
            <Printer className="h-4 w-4 mr-2" /> Drucken
          </Button>
          <Button variant="outline" onClick={handleDownloadAll} disabled={items.length === 0}>
            <Download className="h-4 w-4 mr-2" /> SVG Download
          </Button>
        </div>
      </div>

      {/* Museum selector */}
      <div className="flex gap-3 items-end">
        <div className="flex-1 space-y-2">
          <Label>Museum</Label>
          <Select value={museumId} onValueChange={setMuseumId}>
            <SelectTrigger>
              <SelectValue placeholder="Museum auswaehlen..." />
            </SelectTrigger>
            <SelectContent>
              {museums.map(m => (
                <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {museumId && (
          <Button variant="outline" onClick={loadArtworks}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        )}
      </div>

      {loading ? (
        <div className="text-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mx-auto" />
          <p className="text-sm text-muted-foreground mt-2">Generiere QR-Codes...</p>
        </div>
      ) : items.length === 0 ? (
        <Card className="p-12 text-center">
          <QrCode className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-semibold text-lg mb-2">Keine QR-Codes</h3>
          <p className="text-sm text-muted-foreground">
            Waehle ein Museum aus und importiere Exponate, um QR-Codes zu generieren.
          </p>
        </Card>
      ) : (
        <>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={selectAll}>
              {selectedItems.size === items.length ? 'Alle abwaehlen' : 'Alle auswaehlen'}
            </Button>
            <span className="text-sm text-muted-foreground">
              {selectedItems.size > 0 ? `${selectedItems.size} ausgewaehlt` : `${items.length} QR-Codes`}
            </span>
          </div>

          <div ref={printRef} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map(item => (
              <Card
                key={item.id}
                className={`p-4 text-center cursor-pointer transition-all ${
                  selectedItems.has(item.id) ? 'ring-2 ring-primary' : ''
                } ${item.type === 'museum' ? 'sm:col-span-2 lg:col-span-3' : ''}`}
                onClick={() => toggleItem(item.id)}
              >
                <img
                  src={item.qrUrl}
                  alt={`QR: ${item.label}`}
                  className={`mx-auto ${item.type === 'museum' ? 'w-48 h-48' : 'w-32 h-32'}`}
                />
                <h3 className="font-semibold text-sm mt-3 truncate">{item.label}</h3>
                {item.sublabel && (
                  <p className="text-xs text-muted-foreground">{item.sublabel}</p>
                )}
                <div className="flex items-center justify-center gap-2 mt-2">
                  <Badge variant="outline" className="text-xs">
                    {item.type === 'museum' ? 'Museum' : 'Exponat'}
                  </Badge>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-6 w-6"
                    onClick={e => { e.stopPropagation(); copyUrl(item.url, item.id) }}
                  >
                    {copiedId === item.id
                      ? <Check className="h-3 w-3 text-emerald-500" />
                      : <Copy className="h-3 w-3" />}
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-6 w-6"
                    onClick={e => { e.stopPropagation(); window.open(item.url, '_blank') }}
                  >
                    <Eye className="h-3 w-3" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
