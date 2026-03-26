import { NextRequest, NextResponse } from 'next/server'
import { openai, buildEnrichmentPrompt } from '@/lib/openai'

export const dynamic = 'force-dynamic'

// POST /api/import/enrich
// Enriches a single artwork's raw data with AI-generated content
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { mappedData, tier } = body

    if (!mappedData) {
      return NextResponse.json({ error: 'Keine Daten' }, { status: 400 })
    }

    const model = tier === 'artguide_pro' || tier === 'artguide_enterprise'
      ? 'gpt-4.1-mini'
      : 'gpt-4.1-nano'

    const prompt = buildEnrichmentPrompt(mappedData)

    const response = await openai.chat.completions.create({
      model,
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
      max_tokens: 1500,
      temperature: 0.7,
    })

    const enriched = JSON.parse(response.choices[0].message.content || '{}')

    return NextResponse.json({
      success: true,
      enriched,
      model_used: model,
      tokens_used: response.usage?.total_tokens || 0,
    })
  } catch (error) {
    console.error('Enrichment error:', error)
    return NextResponse.json(
      { error: 'Anreicherung fehlgeschlagen', details: String(error) },
      { status: 500 }
    )
  }
}
