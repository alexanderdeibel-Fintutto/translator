import { NextRequest, NextResponse } from 'next/server'
import { openai, buildTourPrompt } from '@/lib/openai'

export const dynamic = 'force-dynamic'

// POST /api/tours/generate
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { artworks, audience, language, tier } = body

    if (!artworks || artworks.length === 0) {
      return NextResponse.json({ error: 'Keine Kunstwerke angegeben' }, { status: 400 })
    }

    const model = tier === 'artguide_pro' || tier === 'artguide_enterprise'
      ? 'gpt-4.1-mini'
      : 'gpt-4.1-nano'

    const prompt = buildTourPrompt(artworks, audience || 'Allgemeines Publikum', language || 'Deutsch')

    const response = await openai.chat.completions.create({
      model,
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
      max_tokens: 1000,
      temperature: 0.8,
    })

    const tourData = JSON.parse(response.choices[0].message.content || '{}')

    // Map selected indices back to actual artworks
    const selectedArtworks = (tourData.selected_artwork_indices || [])
      .filter((i: number) => i < artworks.length)
      .map((i: number) => artworks[i])

    return NextResponse.json({
      success: true,
      tour: {
        ...tourData,
        artworks: selectedArtworks,
        audience,
        language,
        status: 'draft',
        created_at: new Date().toISOString(),
      },
      model_used: model,
    })
  } catch (error) {
    console.error('Tour generation error:', error)
    return NextResponse.json(
      { error: 'Fuehrungs-Generierung fehlgeschlagen', details: String(error) },
      { status: 500 }
    )
  }
}
