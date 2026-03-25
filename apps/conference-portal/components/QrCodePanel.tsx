'use client'
import { useState } from 'react'

interface QrCodePanelProps {
  sessionId: string
  sessionTitle: string
  conferenceSlug: string
}

export function QrCodePanel({ sessionId, sessionTitle, conferenceSlug }: QrCodePanelProps) {
  const [copied, setCopied] = useState(false)
  const publicUrl = `https://conference-listener.fintutto.world/${conferenceSlug}/${sessionId}`

  const copyLink = () => {
    navigator.clipboard.writeText(publicUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="bg-slate-800 rounded-xl p-6 space-y-4">
      <h3 className="text-white font-semibold">QR-Code für Session</h3>
      <p className="text-slate-400 text-sm">{sessionTitle}</p>
      <div className="bg-white rounded-lg p-4 flex items-center justify-center">
        <p className="text-slate-600 text-xs text-center">QR-Code wird generiert…</p>
      </div>
      <div className="flex gap-2">
        <input
          readOnly
          value={publicUrl}
          className="flex-1 bg-slate-700 text-slate-300 text-xs rounded-lg px-3 py-2 border border-slate-600"
        />
        <button
          onClick={copyLink}
          className="bg-cyan-600 hover:bg-cyan-500 text-white text-xs rounded-lg px-3 py-2 transition-colors"
        >
          {copied ? 'Kopiert!' : 'Kopieren'}
        </button>
      </div>
    </div>
  )
}
