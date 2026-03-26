import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

// GET /api/visitor?museum=slug&artwork=inv_number&lang=de
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const museumSlug = searchParams.get('museum')
  const artworkId = searchParams.get('artwork')
  const lang = searchParams.get('lang') || 'de'

  if (!museumSlug || !artworkId) {
    return NextResponse.json({ error: 'museum and artwork required' }, { status: 400 })
  }

  try {
    // Try to find artwork by inventory_number or id
    const { data: artwork, error } = await supabaseAdmin
      .from('ag_artworks')
      .select('*')
      .or(`inventory_number.eq.${artworkId},id.eq.${artworkId}`)
      .single()

    if (error || !artwork) throw new Error('Not found')

    // Get localized text
    const getText = (field: Record<string, string> | string | null) => {
      if (!field) return null
      if (typeof field === 'string') return field
      return field[lang] || field['de'] || field['en'] || Object.values(field)[0] || null
    }

    // Extract image_url from ai_base_knowledge if not directly available
    let imageUrl = artwork.image_url || null
    if (!imageUrl && artwork.ai_base_knowledge) {
      try {
        const aiKnowledge = typeof artwork.ai_base_knowledge === 'string'
          ? JSON.parse(artwork.ai_base_knowledge)
          : artwork.ai_base_knowledge
        imageUrl = aiKnowledge?.primary_image || aiKnowledge?.image_url || null
      } catch {}
    }

    // Extract localized title
    const titleText = getText(artwork.title as any)

    return NextResponse.json({
      artwork: {
        id: artwork.id,
        inventory_number: artwork.inventory_number,
        title: titleText,
        artist_name: artwork.artist_name,
        year_created: artwork.year_created,
        medium: artwork.medium,
        dimensions: artwork.dimensions,
        location: artwork.position_description || artwork.location,
        image_url: imageUrl,
        audio_url: artwork.audio_url,
        category: artwork.category,
        is_highlight: artwork.is_highlight,
        description_brief: getText(artwork.description_brief),
        description_standard: getText(artwork.description_standard),
        description_detailed: getText(artwork.description_detailed),
        description_children: getText(artwork.description_children),
        description_youth: getText(artwork.description_youth),
        fun_facts: (() => {
          const ff = artwork.fun_facts
          if (!ff) return []
          if (Array.isArray(ff)) return ff
          if (typeof ff === 'object') return ff[lang] || ff['de'] || []
          return []
        })(),
        tags: artwork.tags || [],
      }
    })
  } catch {
    // Return demo artwork for testing
    return NextResponse.json({
      artwork: getDemoArtwork(artworkId, lang),
      demo: true,
    })
  }
}

// POST /api/visitor — Track visit event
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { event, artwork_id, museum_slug, duration_seconds, lang } = body

    // Try to log to analytics (fire and forget)
    void supabaseAdmin.from('ag_visitor_events').insert({
      event_type: event,
      artwork_id,
      museum_slug,
      duration_seconds,
      language: lang,
      created_at: new Date().toISOString(),
    })

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ success: true }) // Never fail tracking
  }
}

function getDemoArtwork(id: string, lang: string) {
  const texts: Record<string, Record<string, string>> = {
    de: {
      description_brief: 'Eine romantische Landschaft voller Symbolik und Tiefe.',
      description_standard: 'Johann Friedrich Overbeck, Mitgruender der Nazarener-Bewegung, schuf mit diesem Werk eine tiefgreifende Reflexion ueber Natur und Spiritualitaet. Die monumentalen Eichen stehen als Symbol fuer Bestaendigkeit und Kraft.',
      description_detailed: 'Overbeck (1789-1869) verbrachte den Grossteil seines Lebens in Rom, wo er mit anderen deutschen Kuenstlern die Nazarener-Bruederschaft gruendete. Diese Bewegung strebte nach einer Erneuerung der Kunst durch Rueckbesinnung auf mittelalterliche und fruehrenaissance Vorbilder.\n\nDie Landschaft zeigt Overbecks Meisterschaft in der Verbindung von Naturdarstellung und spiritueller Symbolik. Die Eichen, die fast den Bildrand sprengen, vermitteln ein Gefuehl von Ewigkeit und Transzendenz.',
      description_children: 'Schau mal, wie riesig diese Baeume sind! Der Maler hat sie so gemalt, als ob sie fast den Himmel beruehren wuerden. Kannst du die kleinen Figuren am Fuss der Baeume sehen?',
      description_youth: 'Overbeck war ein Rebell seiner Zeit. Er verliess die Kunstakademie und zog mit Freunden nach Rom, wo sie in einem alten Kloster lebten und arbeiteten. Ziemlich cool fuer das 19. Jahrhundert!',
    },
    en: {
      description_brief: 'A romantic landscape full of symbolism and depth.',
      description_standard: 'Johann Friedrich Overbeck, co-founder of the Nazarene movement, created with this work a profound reflection on nature and spirituality.',
      description_detailed: 'Overbeck (1789-1869) spent most of his life in Rome, where he founded the Nazarene Brotherhood with other German artists.',
      description_children: 'Look at how huge these trees are! The painter made them look like they almost touch the sky.',
      description_youth: 'Overbeck was a rebel of his time. He left the art academy and moved to Rome with friends.',
    }
  }
  const t = texts[lang] || texts['de']
  return {
    id,
    inventory_number: id,
    title: 'Landschaft mit Eichen',
    artist_name: 'Johann Friedrich Overbeck',
    year_created: '1820',
    medium: 'Oel auf Leinwand',
    dimensions: '120 x 95 cm',
    location: 'Saal 3, Vitrine 2',
    image_url: null,
    audio_url: null,
    category: 'painting',
    is_highlight: true,
    description_brief: t.description_brief,
    description_standard: t.description_standard,
    description_detailed: t.description_detailed,
    description_children: t.description_children,
    description_youth: t.description_youth,
    fun_facts: lang === 'en'
      ? ['Overbeck lived in Rome for 60 years', 'The Nazarenes slept in the monastery of San Isidoro']
      : ['Overbeck lebte 60 Jahre in Rom', 'Die Nazarener schliefen im Kloster San Isidoro', 'Das Werk wurde erst nach seinem Tod versteigert'],
    tags: ['Romantik', 'Landschaft', 'Nazarener', 'Oel'],
  }
}
