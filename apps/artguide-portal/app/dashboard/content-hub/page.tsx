'use client'
import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase-client'
import { useMuseum } from '@/lib/hooks'

type ItemType = 'note' | 'url' | 'file' | 'image' | 'contact' | 'idea'
type ItemStatus = 'inbox' | 'processing' | 'ready' | 'exported'
type TargetType = 'artwork' | 'tour' | 'poi' | 'partner' | 'event'

const TYPE_CONFIG: Record<ItemType, { icon: string; color: string; label: string }> = {
  note: { icon: '📝', color: 'bg-yellow-100 text-yellow-700', label: 'Notiz' },
  url: { icon: '🔗', color: 'bg-blue-100 text-blue-700', label: 'Web-Link' },
  file: { icon: '📄', color: 'bg-purple-100 text-purple-700', label: 'Datei' },
  image: { icon: '🖼', color: 'bg-pink-100 text-pink-700', label: 'Bilder' },
  contact: { icon: '👤', color: 'bg-green-100 text-green-700', label: 'Kontakt' },
  idea: { icon: '💡', color: 'bg-amber-100 text-amber-700', label: 'Idee' },
}
const STATUS_CONFIG: Record<ItemStatus, { color: string; label: string }> = {
  inbox: { color: 'bg-gray-100 text-gray-600', label: 'Eingang' },
  processing: { color: 'bg-blue-100 text-blue-700', label: 'KI verarbeitet' },
  ready: { color: 'bg-green-100 text-green-700', label: 'Bereit' },
  exported: { color: 'bg-indigo-100 text-indigo-700', label: 'Exportiert' },
}
const TARGET_CONFIG: Record<TargetType, { icon: string; label: string }> = {
  artwork: { icon: '🖼', label: 'Exponat' },
  tour: { icon: '🗺', label: 'Führung' },
  poi: { icon: '📍', label: 'POI' },
  partner: { icon: '🤝', label: 'Partner' },
  event: { icon: '🎭', label: 'Event' },
}

type ContentItem = {
  id: string
  museum_id: string
  type: ItemType
  title: string
  content: string
  source: string
  tags: string[]
  status: ItemStatus
  target_type: TargetType
  ai_summary: string | null
  file_url: string | null
  created_at: string
}

export default function ContentHubPage() {
  const { museum } = useMuseum()
  const supabase = createClient()
  const [items, setItems] = useState<ContentItem[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<ItemStatus | 'all'>('all')
  const [typeFilter, setTypeFilter] = useState<ItemType | 'all'>('all')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [addType, setAddType] = useState<ItemType>('note')
  const [addTitle, setAddTitle] = useState('')
  const [addContent, setAddContent] = useState('')
  const [addTags, setAddTags] = useState('')
  const [addTargetType, setAddTargetType] = useState<TargetType>('artwork')
  const [adding, setAdding] = useState(false)
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [exportingId, setExportingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploadFile, setUploadFile] = useState<File | null>(null)

  useEffect(() => { if (museum?.id) loadItems() }, [museum?.id])

  async function loadItems() {
    setLoading(true)
    const { data } = await supabase
      .from('ag_content_hub')
      .select('*')
      .eq('museum_id', museum!.id)
      .order('created_at', { ascending: false })
    if (data) setItems(data as ContentItem[])
    setLoading(false)
  }

  const addItem = async () => {
    if (!addTitle.trim() || !museum) return
    setAdding(true)
    try {
      let fileUrl: string | null = null
      if (uploadFile) {
        const ext = uploadFile.name.split('.').pop()
        const path = `${museum.id}/content-hub/${Date.now()}.${ext}`
        const { data: uploaded } = await supabase.storage.from('museum-assets').upload(path, uploadFile)
        if (uploaded) {
          const { data: { publicUrl } } = supabase.storage.from('museum-assets').getPublicUrl(path)
          fileUrl = publicUrl
        }
      }
      const { error } = await supabase.from('ag_content_hub').insert({
        museum_id: museum.id,
        type: addType,
        title: addTitle.trim(),
        content: addContent.trim(),
        source: addType === 'url' ? 'Web Clipping' : addType === 'file' ? 'Upload' : 'Manuell',
        tags: addTags.split(',').map(t => t.trim()).filter(Boolean),
        status: 'inbox',
        target_type: addTargetType,
        file_url: fileUrl,
      })
      if (error) throw error
      setAddTitle(''); setAddContent(''); setAddTags(''); setUploadFile(null)
      setShowAddModal(false)
      await loadItems()
    } catch (err: any) { alert('Fehler: ' + err.message) }
    finally { setAdding(false) }
  }

  const processWithAI = async (item: ContentItem) => {
    setProcessingId(item.id)
    try {
      const res = await fetch('/api/content-hub/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ item_id: item.id, museum_id: museum!.id }),
      })
      const data = await res.json()
      if (data.success) {
        await supabase.from('ag_content_hub').update({
          status: 'ready',
          ai_summary: data.summary,
        }).eq('id', item.id)
        await loadItems()
      }
    } catch {}
    finally { setProcessingId(null) }
  }

  const exportToArtwork = async (item: ContentItem) => {
    setExportingId(item.id)
    try {
      const res = await fetch('/api/content-hub/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ item_id: item.id, museum_id: museum!.id, target_type: item.target_type }),
      })
      const data = await res.json()
      if (data.success) {
        await supabase.from('ag_content_hub').update({ status: 'exported' }).eq('id', item.id)
        await loadItems()
        alert(`✅ Erfolgreich als ${TARGET_CONFIG[item.target_type]?.label || item.target_type} exportiert!`)
      }
    } catch {}
    finally { setExportingId(null) }
  }

  const deleteItem = async (id: string) => {
    if (!confirm('Eintrag löschen?')) return
    setDeletingId(id)
    await supabase.from('ag_content_hub').delete().eq('id', id)
    await loadItems()
    setDeletingId(null)
  }

  const filtered = items.filter(item => {
    if (filter !== 'all' && item.status !== filter) return false
    if (typeFilter !== 'all' && item.type !== typeFilter) return false
    return true
  })

  const counts = {
    all: items.length,
    inbox: items.filter(i => i.status === 'inbox').length,
    processing: items.filter(i => i.status === 'processing').length,
    ready: items.filter(i => i.status === 'ready').length,
    exported: items.filter(i => i.status === 'exported').length,
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Content Hub</h1>
          <p className="text-gray-500 mt-1">Dein digitales Notizbuch — Ideen, Links, Dateien und Notizen für neue Inhalte</p>
        </div>
        <button onClick={() => setShowAddModal(true)} className="px-4 py-2 rounded-lg bg-indigo-900 text-white text-sm font-medium hover:bg-indigo-800 transition">
          + Inhalt hinzufügen
        </button>
      </div>

      {/* Magic PDF Upload Banner */}
      <div className="bg-gradient-to-r from-purple-900 to-indigo-900 rounded-2xl p-5 mb-6 text-white flex items-center gap-4">
        <div className="text-4xl">✨</div>
        <div className="flex-1">
          <h3 className="font-bold text-lg">Ausstellungskatalog hochladen — KI macht den Rest</h3>
          <p className="text-white/70 text-sm">PDF hochladen → KI erkennt alle Kunstwerke → Texte für alle Zielgruppen werden automatisch generiert</p>
        </div>
        <button onClick={() => { setAddType('file'); setShowAddModal(true) }} className="px-5 py-2.5 rounded-xl bg-amber-400 text-indigo-900 font-bold hover:bg-amber-300 transition flex-shrink-0">
          📄 PDF hochladen
        </button>
      </div>

      {/* Status Tabs */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {(['all', 'inbox', 'processing', 'ready', 'exported'] as const).map(s => (
          <button key={s} onClick={() => setFilter(s)} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${filter === s ? 'bg-indigo-900 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
            {s === 'all' ? `Alle (${counts.all})` : `${STATUS_CONFIG[s]?.label} (${counts[s]})`}
          </button>
        ))}
        <div className="ml-auto flex gap-2">
          {(['all', 'note', 'url', 'file', 'image', 'contact', 'idea'] as const).map(t => (
            <button key={t} onClick={() => setTypeFilter(t)} className={`px-3 py-1.5 rounded-lg text-sm transition ${typeFilter === t ? 'bg-gray-900 text-white' : 'bg-white border border-gray-200 text-gray-500 hover:bg-gray-50'}`}>
              {t === 'all' ? '📋 Alle' : `${TYPE_CONFIG[t as ItemType]?.icon} ${TYPE_CONFIG[t as ItemType]?.label}`}
            </button>
          ))}
        </div>
      </div>

      {/* Items */}
      {loading ? (
        <div className="flex items-center justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" /></div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-16 text-center">
          <div className="text-5xl mb-4">🧠</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Noch keine Inhalte</h3>
          <p className="text-gray-500 mb-6">Füge Notizen, URLs, Dateien oder Ideen hinzu — die KI hilft dir, daraus Inhalte zu machen.</p>
          <button onClick={() => setShowAddModal(true)} className="px-6 py-3 rounded-lg bg-indigo-900 text-white font-medium hover:bg-indigo-800 transition">Ersten Inhalt hinzufügen</button>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(item => {
            const typeConf = TYPE_CONFIG[item.type]
            const statusConf = STATUS_CONFIG[item.status]
            const targetConf = TARGET_CONFIG[item.target_type]
            const isExpanded = expandedId === item.id
            return (
              <div key={item.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="p-4 flex items-start gap-3 cursor-pointer hover:bg-gray-50 transition" onClick={() => setExpandedId(isExpanded ? null : item.id)}>
                  <span className={`text-sm px-2 py-1 rounded-lg font-medium flex-shrink-0 ${typeConf?.color}`}>{typeConf?.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900 text-sm truncate">{item.title}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${statusConf?.color}`}>{statusConf?.label}</span>
                      {targetConf && <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 flex-shrink-0">{targetConf.icon} {targetConf.label}</span>}
                    </div>
                    {item.ai_summary && <p className="text-xs text-gray-500 line-clamp-1">✨ {item.ai_summary}</p>}
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-gray-400">{item.source}</span>
                      {item.tags?.length > 0 && item.tags.map(tag => <span key={tag} className="text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">#{tag}</span>)}
                      <span className="text-xs text-gray-400 ml-auto">{new Date(item.created_at).toLocaleDateString('de-DE')}</span>
                    </div>
                  </div>
                  <span className="text-gray-400 text-sm flex-shrink-0">{isExpanded ? '▲' : '▼'}</span>
                </div>
                {isExpanded && (
                  <div className="border-t border-gray-100 p-4 bg-gray-50">
                    <p className="text-sm text-gray-700 mb-4 whitespace-pre-wrap">{item.content}</p>
                    <div className="flex gap-2 flex-wrap">
                      {item.status === 'inbox' && (
                        <button onClick={() => processWithAI(item)} disabled={processingId === item.id} className="px-4 py-2 rounded-lg bg-purple-100 text-purple-700 text-sm font-medium hover:bg-purple-200 transition disabled:opacity-50">
                          {processingId === item.id ? '⚙️ KI verarbeitet...' : '✨ Mit KI verarbeiten'}
                        </button>
                      )}
                      {item.status === 'ready' && (
                        <button onClick={() => exportToArtwork(item)} disabled={exportingId === item.id} className="px-4 py-2 rounded-lg bg-green-100 text-green-700 text-sm font-medium hover:bg-green-200 transition disabled:opacity-50">
                          {exportingId === item.id ? '⚙️ Exportiere...' : `🚀 Als ${targetConf?.label || 'Inhalt'} exportieren`}
                        </button>
                      )}
                      <button onClick={() => deleteItem(item.id)} disabled={deletingId === item.id} className="px-4 py-2 rounded-lg bg-red-50 text-red-600 text-sm font-medium hover:bg-red-100 transition disabled:opacity-50">
                        {deletingId === item.id ? '...' : '🗑 Löschen'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowAddModal(false)}>
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-xl" onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-gray-900 mb-4">Neuen Inhalt hinzufügen</h2>
            <div className="flex gap-2 mb-4 flex-wrap">
              {(Object.entries(TYPE_CONFIG) as [ItemType, typeof TYPE_CONFIG[ItemType]][]).map(([key, conf]) => (
                <button key={key} onClick={() => setAddType(key)} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition border-2 ${addType === key ? conf.color + ' border-current' : 'bg-gray-50 text-gray-500 border-transparent'}`}>
                  {conf.icon} {conf.label}
                </button>
              ))}
            </div>
            <div className="space-y-3 mb-4">
              <input type="text" value={addTitle} onChange={e => setAddTitle(e.target.value)} placeholder="Titel" className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-indigo-500 outline-none text-sm" />
              {addType === 'file' || addType === 'image' ? (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-indigo-400 hover:bg-indigo-50 transition" onClick={() => fileInputRef.current?.click()}>
                  <input ref={fileInputRef} type="file" className="sr-only" accept={addType === 'image' ? 'image/*' : '.pdf,.doc,.docx,.xlsx,.csv'} onChange={e => setUploadFile(e.target.files?.[0] || null)} />
                  {uploadFile ? (
                    <div><div className="text-2xl mb-2">✅</div><p className="text-sm text-green-700 font-medium">{uploadFile.name}</p></div>
                  ) : (
                    <div><div className="text-3xl mb-2">{addType === 'image' ? '🖼' : '📄'}</div><p className="text-sm text-gray-500">Datei hier ablegen oder klicken</p><p className="text-xs text-gray-400 mt-1">{addType === 'file' ? 'PDF, Word, Excel, CSV' : 'JPG, PNG, WebP'}</p></div>
                  )}
                </div>
              ) : (
                <textarea rows={4} value={addContent} onChange={e => setAddContent(e.target.value)} placeholder={addType === 'url' ? 'https://...' : 'Inhalt, Notizen, Details...'} className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-indigo-500 outline-none text-sm resize-none" />
              )}
              <input type="text" value={addTags} onChange={e => setAddTags(e.target.value)} placeholder="Tags (kommagetrennt)" className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-indigo-500 outline-none text-sm" />
              <div>
                <label className="text-xs text-gray-500 block mb-1">Ziel</label>
                <div className="flex gap-2">
                  {(Object.entries(TARGET_CONFIG) as [TargetType, typeof TARGET_CONFIG[TargetType]][]).map(([key, conf]) => (
                    <button key={key} onClick={() => setAddTargetType(key)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${addTargetType === key ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}>
                      {conf.icon} {conf.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowAddModal(false)} className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 text-sm font-medium hover:bg-gray-200 transition">Abbrechen</button>
              <button onClick={addItem} disabled={adding || !addTitle.trim()} className="px-4 py-2 rounded-lg bg-indigo-900 text-white text-sm font-medium hover:bg-indigo-800 transition disabled:opacity-50">
                {adding ? '⚙️ Speichern...' : '+ Hinzufügen'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
