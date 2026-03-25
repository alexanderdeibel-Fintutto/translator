import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { openai, getTextModelForTier, buildEnrichmentPrompt } from '@/lib/openai'

type RouteContext = { params: Promise<{ id: string }> }

// GET /api/artworks/[id]
export async function GET(
  _req: NextRequest,
  { params }: RouteContext
) {
  const { id } = await params
  try {
    const { data, error } = await supabaseAdmin
      .from('ag_artworks')
      .select('*')
      .eq('id', id)
      .single()
    if (error) throw error
    return NextResponse.json({ artwork: data })
  } catch {
    return NextResponse.json({ artwork: getDemoArtwork(id) })
  }
}

// PATCH /api/artworks/[id]
export async function PATCH(
  request: NextRequest,
  { params }: RouteContext
) {
  const { id } = await params
  try {
    const body = await request.json()
    const { enrich, ...fields } = body

    if (enrich) {
      const tier = 'artguide_starter'
      const model = getTextModelForTier(tier)
      const prompt = buildEnrichmentPrompt({
        title: fields.title || '',
        artist_name: fields.artist_name || '',
        year_created: fields.year_created || '',
        medium: fields.medium || '',
        dimensions: fields.dimensions || '',
        description_raw: fields.description_raw || fields.description_brief?.de || '',
        location: fields.location || '',
        provenance: fields.provenance || '',
      })
      const completion = await openai.chat.completions.create({
        model,
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
        temperature: 0.7,
      })
      const enriched = JSON.parse(completion.choices[0].message.content || '{}')
      Object.assign(fields, {
        description_brief: { de: enriched.description_brief, ...(fields.description_brief || {}) },
        description_standard: { de: enriched.description_standard, ...(fields.description_standard || {}) },
        description_detailed: { de: enriched.description_detailed, ...(fields.description_detailed || {}) },
        description_children: { de: enriched.description_children, ...(fields.description_children || {}) },
        description_youth: { de: enriched.description_youth, ...(fields.description_youth || {}) },
        fun_facts: { de: enriched.fun_facts, ...(fields.fun_facts || {}) },
        historical_context: { de: enriched.historical_context, ...(fields.historical_context || {}) },
        technique_description: { de: enriched.technique_description, ...(fields.technique_description || {}) },
        tags: enriched.suggested_tags || fields.tags || [],
        category: enriched.category || fields.category || 'other',
        ai_enriched: true,
        ai_enriched_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      try {
        await supabaseAdmin.from('ag_artworks').update(fields).eq('id', id)
      } catch { /* DB not connected */ }
      return NextResponse.json({ success: true, artwork: { id, ...fields }, enriched: true })
    }

    fields.updated_at = new Date().toISOString()
    const { data, error } = await supabaseAdmin
      .from('ag_artworks')
      .update(fields)
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return NextResponse.json({ success: true, artwork: data })
  } catch {
    return NextResponse.json({ success: true, artwork: { id }, demo: true })
  }
}

// DELETE /api/artworks/[id]
export async function DELETE(
  _req: NextRequest,
  { params }: RouteContext
) {
  const { id } = await params
  try {
    const { error } = await supabaseAdmin
      .from('ag_artworks')
      .delete()
      .eq('id', id)
    if (error) throw error
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ success: true, demo: true })
  }
}

function getDemoArtwork(id: string) {
  return {
    id,
    inventory_number: 'INV-2024-001',
    title: 'Landschaft mit Eichen',
    artist_name: 'Johann Friedrich Overbeck',
    year_created: '1820',
    medium: 'Oel auf Leinwand',
    dimensions: '120 x 95 cm',
    status: 'draft',
    is_highlight: false,
    description_brief: { de: 'Eine romantische Landschaft voller Symbolik.' },
    description_standard: { de: 'Overbeck, Mitgruender der Nazarener-Bewegung, schuf mit diesem Werk eine tiefgreifende Reflexion ueber Natur und Spiritualitaet.' },
    description_children: { de: 'Schau mal, wie gross diese Baeume sind! Der Maler hat sie so gemalt, als ob sie fast den Himmel beruehren.' },
    description_youth: { de: 'Overbeck war ein Rebell seiner Zeit – er verliess die Akademie und gruendete mit Freunden eine Kuenstlerkommune in Rom.' },
    fun_facts: { de: ['Overbeck lebte 60 Jahre in Rom', 'Die Nazarener schliefen im Kloster San Isidoro'] },
    category: 'painting',
    tags: ['Romantik', 'Landschaft', 'Nazarener'],
    image_url: null,
    audio_url: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
}
