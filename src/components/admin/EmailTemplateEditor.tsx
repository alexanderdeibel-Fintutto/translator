// Fintutto World — Email Template Editor
// Verwaltung von CRM-E-Mail-Vorlagen mit Variablen und Vorschau

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Mail, Plus, Trash2, Save, Loader2, Eye, Pencil, Copy,
  X, Variable, ArrowLeft,
} from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface EmailTemplate {
  id: string
  name: string
  subject: string
  body: string
  created_at: string
  updated_at: string
}

const AVAILABLE_VARIABLES = [
  { key: '{name}', label: 'Name des Empfaengers' },
  { key: '{company}', label: 'Firmenname' },
  { key: '{invite_link}', label: 'Einladungs-Link' },
  { key: '{email}', label: 'E-Mail-Adresse' },
  { key: '{date}', label: 'Aktuelles Datum' },
  { key: '{museum_name}', label: 'Museum-Name' },
  { key: '{sender_name}', label: 'Absender-Name' },
]

export default function EmailTemplateEditor() {
  const [templates, setTemplates] = useState<EmailTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showPreview, setShowPreview] = useState(false)

  // Form state
  const [formName, setFormName] = useState('')
  const [formSubject, setFormSubject] = useState('')
  const [formBody, setFormBody] = useState('')

  useEffect(() => {
    loadTemplates()
  }, [])

  async function loadTemplates() {
    setLoading(true)

    const { data, error } = await supabase
      .from('fw_crm_email_templates')
      .select('*')
      .order('created_at', { ascending: false })

    if (!error && data) {
      setTemplates(data as EmailTemplate[])
    } else {
      setTemplates([])
    }

    setLoading(false)
  }

  function resetForm() {
    setEditingId(null)
    setFormName('')
    setFormSubject('')
    setFormBody('')
    setShowPreview(false)
  }

  function startEdit(template: EmailTemplate) {
    setEditingId(template.id)
    setFormName(template.name)
    setFormSubject(template.subject)
    setFormBody(template.body)
    setShowPreview(false)
  }

  function startCreate() {
    resetForm()
    setEditingId('new')
  }

  function insertVariable(variable: string) {
    // Insert at cursor position or append to body
    setFormBody(prev => prev + variable)
  }

  function renderPreview(text: string): string {
    return text
      .replace(/\{name\}/g, 'Max Mustermann')
      .replace(/\{company\}/g, 'Muster GmbH')
      .replace(/\{invite_link\}/g, 'https://fintutto.world/invite/abc123')
      .replace(/\{email\}/g, 'max@example.com')
      .replace(/\{date\}/g, new Date().toLocaleDateString('de-AT'))
      .replace(/\{museum_name\}/g, 'Kunsthalle Wien')
      .replace(/\{sender_name\}/g, 'Fintutto Team')
  }

  async function saveTemplate() {
    if (!formName.trim() || !formSubject.trim()) return
    setSaving(true)

    if (editingId === 'new') {
      const { error } = await supabase.from('fw_crm_email_templates').insert({
        name: formName.trim(),
        subject: formSubject.trim(),
        body: formBody.trim(),
      })

      if (!error) {
        await loadTemplates()
        resetForm()
      } else {
        // Local fallback
        const newTemplate: EmailTemplate = {
          id: `tpl-${Date.now()}`,
          name: formName.trim(),
          subject: formSubject.trim(),
          body: formBody.trim(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
        setTemplates(prev => [newTemplate, ...prev])
        resetForm()
      }
    } else if (editingId) {
      const { error } = await supabase
        .from('fw_crm_email_templates')
        .update({
          name: formName.trim(),
          subject: formSubject.trim(),
          body: formBody.trim(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', editingId)

      if (!error) {
        await loadTemplates()
      } else {
        setTemplates(prev => prev.map(t =>
          t.id === editingId
            ? { ...t, name: formName.trim(), subject: formSubject.trim(), body: formBody.trim(), updated_at: new Date().toISOString() }
            : t
        ))
      }
      resetForm()
    }

    setSaving(false)
  }

  async function deleteTemplate(id: string) {
    setTemplates(prev => prev.filter(t => t.id !== id))
    await supabase.from('fw_crm_email_templates').delete().eq('id', id)
    if (editingId === id) resetForm()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Mail className="h-6 w-6" />
            E-Mail-Vorlagen
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            CRM-E-Mail-Templates erstellen, bearbeiten und verwalten.
          </p>
        </div>
        {!editingId && (
          <Button onClick={startCreate}>
            <Plus className="h-4 w-4 mr-2" /> Neue Vorlage
          </Button>
        )}
      </div>

      {/* Editor */}
      {editingId && (
        <Card className="p-4 border-primary space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold flex items-center gap-2">
              <Pencil className="h-4 w-4" />
              {editingId === 'new' ? 'Neue Vorlage erstellen' : 'Vorlage bearbeiten'}
            </h3>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={resetForm}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Vorlagenname *</Label>
              <Input
                placeholder="z.B. Willkommens-E-Mail"
                value={formName}
                onChange={e => setFormName(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Betreff *</Label>
              <Input
                placeholder="z.B. Willkommen bei Fintutto World, {name}!"
                value={formSubject}
                onChange={e => setFormSubject(e.target.value)}
              />
            </div>
          </div>

          {/* Variable helper */}
          <div className="space-y-1.5">
            <Label className="flex items-center gap-1">
              <Variable className="h-3.5 w-3.5" />
              Verfuegbare Variablen
            </Label>
            <div className="flex flex-wrap gap-1.5">
              {AVAILABLE_VARIABLES.map(v => (
                <Button
                  key={v.key}
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => insertVariable(v.key)}
                  title={v.label}
                >
                  <Copy className="h-3 w-3 mr-1" />
                  {v.key}
                </Button>
              ))}
            </div>
          </div>

          {/* Body */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label>Inhalt</Label>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs"
                onClick={() => setShowPreview(!showPreview)}
              >
                <Eye className="h-3 w-3 mr-1" />
                {showPreview ? 'Editor' : 'Vorschau'}
              </Button>
            </div>
            {showPreview ? (
              <Card className="p-4 bg-muted/30 min-h-[200px]">
                <p className="text-xs text-muted-foreground mb-2">Vorschau mit Beispieldaten:</p>
                <div className="border-b pb-2 mb-3">
                  <p className="text-sm font-medium">Betreff: {renderPreview(formSubject)}</p>
                </div>
                <div className="text-sm whitespace-pre-wrap">{renderPreview(formBody)}</div>
              </Card>
            ) : (
              <textarea
                className="w-full min-h-[200px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                placeholder="Hallo {name},&#10;&#10;vielen Dank fuer Ihr Interesse an Fintutto World...&#10;&#10;Mit freundlichen Gruessen,&#10;{sender_name}"
                value={formBody}
                onChange={e => setFormBody(e.target.value)}
              />
            )}
          </div>

          {/* Save / Cancel */}
          <div className="flex gap-2 pt-2 border-t">
            <Button onClick={saveTemplate} disabled={saving || !formName.trim() || !formSubject.trim()}>
              {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
              Speichern
            </Button>
            <Button variant="outline" onClick={resetForm}>
              <ArrowLeft className="h-4 w-4 mr-2" /> Abbrechen
            </Button>
          </div>
        </Card>
      )}

      {/* Template list */}
      <div className="space-y-3">
        {templates.map(template => (
          <Card key={template.id} className={`p-4 ${editingId === template.id ? 'border-primary' : ''}`}>
            <div className="flex items-start gap-3">
              <Mail className="h-4 w-4 mt-1 text-muted-foreground flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-sm">{template.name}</h3>
                  <Badge variant="outline" className="text-[10px]">Template</Badge>
                </div>
                <p className="text-xs text-muted-foreground truncate">
                  Betreff: {template.subject}
                </p>
                {template.body && (
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                    {template.body.slice(0, 120)}{template.body.length > 120 ? '...' : ''}
                  </p>
                )}
                <p className="text-[10px] text-muted-foreground mt-2">
                  Erstellt: {new Date(template.created_at).toLocaleDateString('de-AT')}
                  {template.updated_at && template.updated_at !== template.created_at && (
                    <> — Aktualisiert: {new Date(template.updated_at).toLocaleDateString('de-AT')}</>
                  )}
                </p>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7"
                  onClick={() => startEdit(template)}
                  title="Bearbeiten"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7 text-destructive"
                  onClick={() => deleteTemplate(template.id)}
                  title="Loeschen"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {templates.length === 0 && !editingId && (
        <Card className="p-12 text-center">
          <Mail className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <h3 className="font-semibold mb-1">Keine E-Mail-Vorlagen</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Erstelle Vorlagen fuer wiederkehrende E-Mails an Kontakte und Partner.
          </p>
          <Button onClick={startCreate}>
            <Plus className="h-4 w-4 mr-2" /> Erste Vorlage erstellen
          </Button>
        </Card>
      )}
    </div>
  )
}
