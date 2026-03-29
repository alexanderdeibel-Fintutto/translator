import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import OpenAI from 'openai'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export async function POST(request: NextRequest) {
  try {
    const { item_id, museum_id } = await request.json()
    if (!item_id || !museum_id) {
      return NextResponse.json({ success: false, error: 'item_id und museum_id erforderlich' }, { status: 400 })
    }

    // Load item
    const { data: item, error } = await supabaseAdmin
      .from('ag_content_hub')
      .select('*')
      .eq('id', item_id)
      .eq('museum_id', museum_id)
      .single()
    if (error || !item) {
      return NextResponse.json({ success: false, error: 'Item nicht gefunden' }, { status: 404 })
    }

    // Mark as processing
    await supabaseAdmin.from('ag_content_hub').update({ status: 'processing' }).eq('id', item_id)

    // Generate AI summary
    const prompt = `Du bist ein Kurator-Assistent für Museen. Analysiere den folgenden Inhalt und erstelle:
1. Eine kurze Zusammenfassung (max. 2 Sätze)
2. Empfehle, ob daraus ein Exponat, eine Führung, ein POI oder ein Partner-Eintrag werden sollte

Inhalt-Typ: ${item.type}
Titel: ${item.title}
Inhalt: ${item.content || '(kein Text)'}

Antworte auf Deutsch, prägnant und professionell.`

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 200,
    })

    const summary = completion.choices[0]?.message?.content || 'KI-Analyse abgeschlossen.'

    // Update item
    await supabaseAdmin.from('ag_content_hub').update({
      status: 'ready',
      ai_summary: summary,
      updated_at: new Date().toISOString(),
    }).eq('id', item_id)

    return NextResponse.json({ success: true, summary })
  } catch (err: any) {
    console.error('Content Hub Process Error:', err)
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
