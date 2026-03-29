import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import OpenAI from 'openai'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export async function POST(request: NextRequest) {
  try {
    const { item_id, museum_id, target_type } = await request.json()
    if (!item_id || !museum_id) {
      return NextResponse.json({ success: false, error: 'item_id und museum_id erforderlich' }, { status: 400 })
    }

    const { data: item, error } = await supabaseAdmin
      .from('ag_content_hub')
      .select('*')
      .eq('id', item_id)
      .eq('museum_id', museum_id)
      .single()
    if (error || !item) {
      return NextResponse.json({ success: false, error: 'Item nicht gefunden' }, { status: 404 })
    }

    let exportedId: string | null = null

    if (target_type === 'artwork') {
      // Generate artwork content with AI
      const prompt = `Erstelle aus folgenden Informationen einen strukturierten Kunstwerk-Eintrag für ein Museum-CMS.
Gib JSON zurück mit: title (string), artist_name (string oder null), description_standard (string, 2-3 Sätze), description_children (string, kindgerecht), fun_facts (string, 1-2 interessante Fakten)

Quelle: ${item.title}
Inhalt: ${item.content || item.ai_summary || ''}

Nur JSON, kein Markdown.`

      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 500,
        response_format: { type: 'json_object' },
      })

      let artworkData: any = {}
      try {
        artworkData = JSON.parse(completion.choices[0]?.message?.content || '{}')
      } catch {}

      const { data: artwork, error: artErr } = await supabaseAdmin
        .from('ag_artworks')
        .insert({
          museum_id,
          title: { de: artworkData.title || item.title },
          artist_name: artworkData.artist_name || null,
          description_standard: { de: artworkData.description_standard || item.ai_summary || '' },
          description_children: { de: artworkData.description_children || '' },
          fun_facts: { de: artworkData.fun_facts || '' },
          status: 'draft',
          source: 'content_hub',
        })
        .select()
        .single()
      if (artErr) throw artErr
      exportedId = artwork.id
    } else if (target_type === 'tour') {
      const { data: tour, error: tourErr } = await supabaseAdmin
        .from('ag_tours')
        .insert({
          museum_id,
          title: { de: item.title },
          description: { de: item.content || item.ai_summary || '' },
          tour_type: 'curated',
          status: 'draft',
          tags: item.tags || [],
        })
        .select()
        .single()
      if (tourErr) throw tourErr
      exportedId = tour.id
    }

    // Mark as exported
    await supabaseAdmin.from('ag_content_hub').update({
      status: 'exported',
      updated_at: new Date().toISOString(),
    }).eq('id', item_id)

    return NextResponse.json({ success: true, exported_id: exportedId, target_type })
  } catch (err: any) {
    console.error('Content Hub Export Error:', err)
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
