'use client'

import { useEffect, useRef, useState } from 'react'
import type { Artwork, Museum } from '../lib/types'

interface QrCodePanelProps {
  artwork: Artwork
  museum: Museum
}

export function QrCodePanel({ artwork, museum }: QrCodePanelProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [qrUrl, setQrUrl] = useState('')
  const [qrDataUrl, setQrDataUrl] = useState('')
  const [labelStyle, setLabelStyle] = useState<'minimal' | 'branded' | 'full'>('branded')

  const publicUrl = `https://artguide.fintutto.com/${museum.slug}/${artwork.inventory_number || artwork.id}`

  useEffect(() => {
    setQrUrl(publicUrl)
    generateQr(publicUrl)
  }, [publicUrl])

  async function generateQr(url: string) {
    // Use QR Server API (no npm needed)
    const apiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(url)}&format=png&margin=10&color=1e1b4b&bgcolor=ffffff`
    setQrDataUrl(apiUrl)
  }

  function handleDownloadPng() {
    const link = document.createElement('a')
    link.href = qrDataUrl
    link.download = `qr-${artwork.inventory_number || artwork.id}.png`
    link.click()
  }

  function handleDownloadSvg() {
    const svgUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrUrl)}&format=svg&margin=10&color=1e1b4b&bgcolor=ffffff`
    const link = document.createElement('a')
    link.href = svgUrl
    link.download = `qr-${artwork.inventory_number || artwork.id}.svg`
    link.click()
  }

  function handlePrintPdf() {
    const printWindow = window.open('', '_blank')
    if (!printWindow) return
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>QR-Code — ${artwork.title}</title>
        <style>
          body { font-family: system-ui, sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; margin: 0; background: white; }
          .card { border: 2px solid #e5e7eb; border-radius: 12px; padding: 24px; text-align: center; max-width: 320px; }
          .title { font-size: 16px; font-weight: bold; color: #111827; margin: 12px 0 4px; }
          .artist { font-size: 13px; color: #6b7280; margin-bottom: 4px; }
          .inv { font-size: 11px; color: #9ca3af; font-family: monospace; }
          .museum { font-size: 12px; color: #4f46e5; margin-top: 8px; font-weight: 600; }
          img { width: 200px; height: 200px; }
          @media print { body { margin: 0; } }
        </style>
      </head>
      <body>
        <div class="card">
          ${labelStyle !== 'minimal' ? `<div class="museum">${museum.name}</div>` : ''}
          <img src="${qrDataUrl}" alt="QR Code" />
          ${labelStyle === 'full' ? `
            <div class="title">${artwork.title}</div>
            ${artwork.artist_name ? `<div class="artist">${artwork.artist_name}</div>` : ''}
            ${artwork.inventory_number ? `<div class="inv">Inv. ${artwork.inventory_number}</div>` : ''}
          ` : labelStyle === 'branded' ? `
            <div class="title">${artwork.title}</div>
          ` : ''}
        </div>
        <script>window.onload = () => { window.print(); window.close(); }</script>
      </body>
      </html>
    `)
    printWindow.document.close()
  }

  function handleCopyUrl() {
    navigator.clipboard.writeText(qrUrl)
  }

  return (
    <div className="space-y-6">
      <div className="flex gap-6 items-start flex-wrap">
        {/* QR Preview */}
        <div className="flex-shrink-0">
          <div className="bg-white border-2 border-gray-200 rounded-xl p-4 text-center shadow-sm">
            {labelStyle !== 'minimal' && (
              <p className="text-indigo-700 font-semibold text-sm mb-2">{museum.name}</p>
            )}
            {qrDataUrl ? (
              <img src={qrDataUrl} alt="QR Code" className="w-48 h-48 mx-auto" />
            ) : (
              <div className="w-48 h-48 bg-gray-100 rounded-lg flex items-center justify-center text-gray-300 text-4xl mx-auto">📱</div>
            )}
            {labelStyle === 'full' && (
              <div className="mt-2">
                <p className="font-bold text-gray-900 text-sm">{artwork.title}</p>
                {artwork.artist_name && <p className="text-gray-500 text-xs">{artwork.artist_name}</p>}
                {artwork.inventory_number && <p className="text-gray-400 text-xs font-mono">Inv. {artwork.inventory_number}</p>}
              </div>
            )}
            {labelStyle === 'branded' && (
              <p className="font-medium text-gray-800 text-sm mt-2">{artwork.title}</p>
            )}
          </div>
        </div>

        {/* Settings */}
        <div className="flex-1 min-w-[240px] space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Öffentliche URL</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={qrUrl}
                readOnly
                className="flex-1 px-3 py-2 rounded-lg border border-gray-300 text-sm bg-gray-50 font-mono text-gray-600"
              />
              <button onClick={handleCopyUrl} className="px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-sm transition" title="Kopieren">📋</button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Label-Stil</label>
            <div className="flex gap-2">
              {(['minimal', 'branded', 'full'] as const).map(style => (
                <button
                  key={style}
                  onClick={() => setLabelStyle(style)}
                  className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium border transition ${labelStyle === style ? 'bg-indigo-100 border-indigo-300 text-indigo-700' : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'}`}
                >
                  {style === 'minimal' ? 'Minimal' : style === 'branded' ? 'Branded' : 'Vollständig'}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-2">
            <button onClick={handleDownloadPng} className="px-3 py-2.5 rounded-lg bg-indigo-900 text-white text-sm font-medium hover:bg-indigo-800 transition text-center">
              ⬇ PNG
            </button>
            <button onClick={handleDownloadSvg} className="px-3 py-2.5 rounded-lg bg-indigo-100 text-indigo-700 text-sm font-medium hover:bg-indigo-200 transition text-center">
              ⬇ SVG
            </button>
            <button onClick={handlePrintPdf} className="px-3 py-2.5 rounded-lg bg-gray-100 text-gray-700 text-sm font-medium hover:bg-gray-200 transition text-center">
              🖨 Drucken
            </button>
          </div>
        </div>
      </div>

      {/* Bulk Print Hint */}
      <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4">
        <p className="text-indigo-800 text-sm font-medium mb-1">💡 Massen-Druck</p>
        <p className="text-indigo-600 text-sm">Für alle Kunstwerke auf einmal: <a href="/dashboard/artworks/qr-export" className="underline font-medium">QR-Export-Seite →</a></p>
      </div>
    </div>
  )
}
