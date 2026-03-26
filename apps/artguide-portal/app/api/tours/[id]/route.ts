import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const { searchParams } = new URL(request.url)
  const lang = searchParams.get('lang') || 'de'

  try {
    // Try to load tour from Supabase
    const { data: tour, error } = await supabaseAdmin
      .from('ag_tours')
      .select('*, ag_tour_stops(*, ag_artworks(*))')
      .eq('id', id)
      .single()

    if (error || !tour) throw new Error('Not found')

    return NextResponse.json({ tour, lang })
  } catch {
    // Return demo tour for testing
    return NextResponse.json({
      tour: getDemoTour(id, lang),
      demo: true,
    })
  }
}

function getDemoTour(id: string, lang: string) {
  const stops = [
    {
      id: 'stop-1',
      order_index: 0,
      artwork_id: 'INV-2024-001',
      location_hint: lang === 'en' ? 'Hall 1, left entrance' : 'Saal 1, linker Eingang',
      artwork: {
        id: 'INV-2024-001',
        inventory_number: 'INV-2024-001',
        title: 'Landschaft mit Eichen',
        artist_name: 'Johann Friedrich Overbeck',
        year_created: '1820',
        image_url: null,
        location: lang === 'en' ? 'Hall 1, Showcase 2' : 'Saal 1, Vitrine 2',
      },
    },
    {
      id: 'stop-2',
      order_index: 1,
      artwork_id: 'INV-2024-002',
      location_hint: lang === 'en' ? 'Hall 2, center' : 'Saal 2, Mitte',
      artwork: {
        id: 'INV-2024-002',
        inventory_number: 'INV-2024-002',
        title: 'Bildnis eines jungen Mannes',
        artist_name: 'Peter von Cornelius',
        year_created: '1815',
        image_url: null,
        location: lang === 'en' ? 'Hall 2, North Wall' : 'Saal 2, Nordwand',
      },
    },
    {
      id: 'stop-3',
      order_index: 2,
      artwork_id: 'INV-2024-003',
      location_hint: lang === 'en' ? 'Hall 3, right side' : 'Saal 3, rechte Seite',
      artwork: {
        id: 'INV-2024-003',
        inventory_number: 'INV-2024-003',
        title: 'Die Heilige Familie',
        artist_name: 'Friedrich Overbeck',
        year_created: '1825',
        image_url: null,
        location: lang === 'en' ? 'Hall 3, Main Wall' : 'Saal 3, Hauptwand',
      },
    },
    {
      id: 'stop-4',
      order_index: 3,
      artwork_id: 'INV-2024-004',
      location_hint: lang === 'en' ? 'Hall 4, entrance' : 'Saal 4, Eingang',
      artwork: {
        id: 'INV-2024-004',
        inventory_number: 'INV-2024-004',
        title: 'Römische Campagna',
        artist_name: 'Carl Rottmann',
        year_created: '1830',
        image_url: null,
        location: lang === 'en' ? 'Hall 4, East Wall' : 'Saal 4, Ostwand',
      },
    },
  ]

  const titles: Record<string, Record<string, string>> = {
    de: {
      title: 'Nazarener — Kunst zwischen Glaube und Romantik',
      description: 'Entdecken Sie die wichtigsten Werke der Nazarener-Bewegung in dieser kuratierten Führung durch unsere Sammlung.',
      audience: 'Erwachsene',
      duration_min: '45',
    },
    en: {
      title: 'Nazarenes — Art Between Faith and Romanticism',
      description: 'Discover the key works of the Nazarene movement in this curated tour through our collection.',
      audience: 'Adults',
      duration_min: '45',
    },
  }

  const t = titles[lang] || titles.de

  return {
    id,
    title: t.title,
    description: t.description,
    audience_type: t.audience,
    estimated_duration_min: parseInt(t.duration_min),
    language: lang,
    stop_count: stops.length,
    ag_tour_stops: stops,
  }
}
