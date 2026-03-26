import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export const dynamic = 'force-dynamic'

// GET /api/visitor/museums/[slug]/artworks?lang=de
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> | { slug: string } }
) {
  const { searchParams } = new URL(request.url)
  const lang = searchParams.get('lang') || 'de'
  const rawParams = context.params
  const resolvedParams = rawParams instanceof Promise ? await rawParams : rawParams
  const slug = resolvedParams.slug

  try {
    // First find the museum by slug
    const { data: museum, error: museumError } = await supabaseAdmin
      .from('ag_museums')
      .select('id, name, slug')
      .eq('slug', slug)
      .single()

    if (museumError || !museum) {
      return NextResponse.json({ error: 'Museum not found', artworks: [] }, { status: 404 })
    }

    // Get all published artworks for this museum
    const { data: artworks, error } = await supabaseAdmin
      .from('ag_artworks')
      .select('*')
      .eq('museum_id', museum.id)
      .eq('status', 'published')
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: true })

    if (error) throw error

    // Enrich artworks with image_url and localized title
    const enriched = (artworks || []).map((artwork: any) => {
      // Extract image_url from ai_base_knowledge if not directly available
      let imageUrl = artwork.image_url || null
      if (!imageUrl && artwork.ai_base_knowledge) {
        try {
          const aiK = typeof artwork.ai_base_knowledge === 'string'
            ? JSON.parse(artwork.ai_base_knowledge)
            : artwork.ai_base_knowledge
          imageUrl = aiK?.primary_image || aiK?.image_url || null
        } catch {}
      }

      // Localize title
      let title = artwork.title
      if (title && typeof title === 'object') {
        title = title[lang] || title['de'] || title['en'] || Object.values(title)[0] || ''
      }

      return {
        id: artwork.id,
        inventory_number: artwork.inventory_number,
        title,
        artist_name: artwork.artist_name,
        year_created: artwork.year_created,
        medium: artwork.medium,
        category: artwork.category,
        is_highlight: artwork.is_highlight,
        image_url: imageUrl,
        audio_url: artwork.audio_url,
        status: artwork.status,
        tags: artwork.tags || [],
      }
    })

    return NextResponse.json({
      museum: {
        id: museum.id,
        name: museum.name,
        slug: museum.slug,
      },
      artworks: enriched,
      total: enriched.length,
    })
  } catch (err) {
    console.error('Error fetching museum artworks:', err)
    return NextResponse.json({ error: String(err), artworks: [] }, { status: 500 })
  }
}
