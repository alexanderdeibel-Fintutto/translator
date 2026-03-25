'use client'
import { useState } from 'react'

const mockItems = [
  { id: '1', title: 'Eröffnungsrede – Prof. Dr. Müller', type: 'session', status: 'ready', lang: 'DE' },
  { id: '2', title: 'Workshop: KI in der Medizin', type: 'session', status: 'processing', lang: 'EN' },
  { id: '3', title: 'Podiumsdiskussion – Klimawandel', type: 'session', status: 'draft', lang: 'DE' },
]

const statusColors: Record<string, string> = {
  ready: 'text-green-400',
  processing: 'text-yellow-400',
  draft: 'text-slate-400',
}

export default function ContentHubPage() {
  const [filter, setFilter] = useState('all')
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-white mb-6">Content Hub</h1>
      <div className="flex gap-2 mb-6">
        {['all', 'session', 'speaker'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              filter === f ? 'bg-cyan-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            {f === 'all' ? 'Alle' : f === 'session' ? 'Sessions' : 'Speaker'}
          </button>
        ))}
      </div>
      <div className="space-y-3">
        {mockItems.filter(i => filter === 'all' || i.type === filter).map(item => (
          <div key={item.id} className="bg-slate-800 rounded-xl p-4 flex items-center justify-between">
            <div>
              <p className="text-white font-medium">{item.title}</p>
              <p className="text-slate-400 text-xs mt-0.5">{item.type} · {item.lang}</p>
            </div>
            <span className={`text-xs font-medium ${statusColors[item.status]}`}>
              {item.status === 'ready' ? '✓ Bereit' : item.status === 'processing' ? '⟳ Verarbeitung' : '✎ Entwurf'}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
