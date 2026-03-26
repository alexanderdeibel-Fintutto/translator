import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

// GET /api/artworks?museum_id=...
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const museumId = searchParams.get('museum_id')
  const search = searchParams.get('search') || ''
  const status = searchParams.get('status') || ''
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '20')

  try {
    let query = supabaseAdmin
      .from('ag_artworks')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1)

    if (museumId) query = query.eq('museum_id', museumId)
    if (status) query = query.eq('status', status)
    if (search) query = query.or(`title.ilike.%${search}%,artist_name.ilike.%${search}%`)

    const { data, error, count } = await query

    if (error) {
      // Table might not exist yet — return demo data
      return NextResponse.json({ artworks: getDemoArtworks(), total: 6, demo: true })
    }

    // Enrich artworks with image_url from ai_base_knowledge and localized title
    const lang = searchParams.get('lang') || 'de'
    const enriched = (data || []).map((artwork: any) => {
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
      return { ...artwork, image_url: imageUrl, title }
    })

    return NextResponse.json({ artworks: enriched, total: count || 0 })
  } catch {
    return NextResponse.json({ artworks: getDemoArtworks(), total: 6, demo: true })
  }
}

// POST /api/artworks
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { data, error } = await supabaseAdmin
      .from('ag_artworks')
      .insert(body)
      .select()
      .single()

    if (error) throw error
    return NextResponse.json({ success: true, artwork: data })
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}

function getDemoArtworks() {
  return [
    {
      id: 'demo-1',
      inventory_number: 'INV-2024-001',
      title: 'Landschaft mit Eichen',
      artist_name: 'Johann Friedrich Overbeck',
      year_created: '1820',
      medium: 'Oel auf Leinwand',
      dimensions: '85 x 120 cm',
      status: 'published',
      is_highlight: true,
      description_brief: { de: 'Eine stimmungsvolle Landschaft aus der Romantik.' },
      description_standard: { de: 'Johann Friedrich Overbeck schuf dieses Werk in seiner Roemischen Schaffensphase. Die maechtigen Eichen symbolisieren Staerke und Bestaendigkeit.' },
      description_children: { de: 'Schau mal, wie gross diese Baeume sind! Der Maler hat sie ganz genau beobachtet.' },
      description_youth: { de: 'Overbeck war einer der Nazarener – Kuenstler, die die Malerei der Renaissance neu entdeckten.' },
      fun_facts: { de: ['Overbeck lebte fast sein ganzes Leben in Rom', 'Die Eiche war in der Romantik Symbol der deutschen Seele'] },
      category: 'painting',
      tags: ['Romantik', 'Landschaft', 'Overbeck'],
      image_url: null,
      audio_url: null,
      qr_code_url: null,
      created_at: '2024-01-15T10:00:00Z',
      updated_at: '2024-03-01T14:30:00Z',
    },
    {
      id: 'demo-2',
      inventory_number: 'INV-2024-002',
      title: 'Bildnis einer jungen Frau',
      artist_name: 'Angelika Kauffmann',
      year_created: '1775',
      medium: 'Oel auf Leinwand',
      dimensions: '62 x 48 cm',
      status: 'published',
      is_highlight: true,
      description_brief: { de: 'Portraet einer unbekannten Dame aus dem 18. Jahrhundert.' },
      description_standard: { de: 'Angelika Kauffmann war eine der bedeutendsten Portraetmalerinnen des 18. Jahrhunderts. Dieses Werk zeigt ihre Meisterschaft in der Darstellung von Licht und Ausdruck.' },
      description_children: { de: 'Diese Frau lebte vor ueber 200 Jahren. Wie sie wohl war?' },
      description_youth: { de: 'Angelika Kauffmann war eine der ersten Frauen, die in der Kunstwelt wirklich erfolgreich war.' },
      fun_facts: { de: ['Kauffmann war Gruendungsmitglied der Royal Academy in London', 'Sie malte auch Deckenbilder fuer englische Adelshaeuser'] },
      category: 'painting',
      tags: ['Portrait', 'Klassizismus', 'Kauffmann'],
      image_url: null,
      audio_url: null,
      qr_code_url: null,
      created_at: '2024-01-20T11:00:00Z',
      updated_at: '2024-02-28T09:00:00Z',
    },
    {
      id: 'demo-3',
      inventory_number: 'INV-2024-003',
      title: 'Abstrakte Komposition Nr. 7',
      artist_name: 'Wassily Kandinsky',
      year_created: '1913',
      medium: 'Oel auf Leinwand',
      dimensions: '140 x 200 cm',
      status: 'review',
      is_highlight: false,
      description_brief: { de: 'Ein Hauptwerk des abstrakten Expressionismus.' },
      description_standard: { de: 'Kandinsky gilt als Pionier der abstrakten Kunst. In diesem Werk loest er die Form vollstaendig auf und laesst Farbe und Linie fuer sich sprechen.' },
      description_children: { de: 'Was siehst du in diesem Bild? Es gibt keine richtige Antwort!' },
      description_youth: { de: 'Kandinsky glaubte, Farben haben Klaenge. Blau klingt wie eine Trompete, Gelb wie eine Fanfare.' },
      fun_facts: { de: ['Kandinsky soll Farben gehoert haben – ein Phaenomen namens Synasthesie', 'Er gruendete mit Paul Klee das Bauhaus-Institut'] },
      category: 'painting',
      tags: ['Abstrakt', 'Expressionismus', 'Kandinsky', 'Bauhaus'],
      image_url: null,
      audio_url: null,
      qr_code_url: null,
      created_at: '2024-02-01T09:00:00Z',
      updated_at: '2024-03-10T16:00:00Z',
    },
    {
      id: 'demo-4',
      inventory_number: 'INV-2024-004',
      title: 'Bronzefigur: Schreitender Mann',
      artist_name: 'Auguste Rodin',
      year_created: '1900',
      medium: 'Bronze',
      dimensions: 'H: 85 cm',
      status: 'draft',
      is_highlight: false,
      description_brief: { de: 'Eine kraftvolle Bronzeskulptur des franzoesischen Bildhauers.' },
      description_standard: { de: 'Rodin revolutionierte die Skulptur des 19. Jahrhunderts. Diese Figur zeigt seinen charakteristischen Stil: roh, lebendig, voller innerer Spannung.' },
      description_children: { de: 'Dieser Mann aus Bronze schreitet voran. Wohin er wohl geht?' },
      description_youth: { de: 'Rodin liess Skulpturen unfertig – das war damals ein Skandal. Heute gilt es als Geniestreich.' },
      fun_facts: { de: ['Rodin wurde zweimal von der Ecole des Beaux-Arts abgelehnt', 'Sein "Denker" ist eine der bekanntesten Skulpturen der Welt'] },
      category: 'sculpture',
      tags: ['Skulptur', 'Bronze', 'Rodin', 'Impressionismus'],
      image_url: null,
      audio_url: null,
      qr_code_url: null,
      created_at: '2024-02-10T14:00:00Z',
      updated_at: '2024-02-10T14:00:00Z',
    },
    {
      id: 'demo-5',
      inventory_number: 'INV-2024-005',
      title: 'Stadtansicht Wien',
      artist_name: 'Rudolf von Alt',
      year_created: '1860',
      medium: 'Aquarell auf Papier',
      dimensions: '45 x 65 cm',
      status: 'published',
      is_highlight: false,
      description_brief: { de: 'Wien im 19. Jahrhundert – festgehalten in leuchtenden Aquarellfarben.' },
      description_standard: { de: 'Rudolf von Alt war der bedeutendste oesterreichische Aquarellist seiner Zeit. Diese Ansicht zeigt Wien in seiner Bluetezeit der Gruenderaera.' },
      description_children: { de: 'So sah Wien vor 160 Jahren aus! Erkennst du etwas?' },
      description_youth: { de: 'Alt malte bis ins hohe Alter – sein letztes Aquarell entstand mit 95 Jahren.' },
      fun_facts: { de: ['Rudolf von Alt wurde 96 Jahre alt', 'Er malte ueber 3000 Aquarelle in seinem Leben'] },
      category: 'drawing',
      tags: ['Wien', 'Aquarell', 'Stadtansicht', 'Alt'],
      image_url: null,
      audio_url: null,
      qr_code_url: null,
      created_at: '2024-02-20T10:00:00Z',
      updated_at: '2024-03-05T11:00:00Z',
    },
    {
      id: 'demo-6',
      inventory_number: 'INV-2024-006',
      title: 'Digitale Installation: Datenfluss',
      artist_name: 'Refik Anadol',
      year_created: '2023',
      medium: 'Digitale Installation, LED',
      dimensions: '300 x 500 cm',
      status: 'published',
      is_highlight: true,
      description_brief: { de: 'Eine immersive KI-generierte Datenvisualisierung.' },
      description_standard: { de: 'Refik Anadol ist einer der fuehrenden Kuenstler an der Schnittstelle von Kunst und KI. Diese Installation verarbeitet Millionen von Datenpunkten zu einem lebendigen Kunstwerk.' },
      description_children: { de: 'Dieses Kunstwerk ist lebendig! Ein Computer malt hier in Echtzeit.' },
      description_youth: { de: 'Anadol trainiert KI-Modelle auf Millionen von Bildern und laesst sie dann neue Welten erschaffen.' },
      fun_facts: { de: ['Anadol hat eine Installation im MoMA New York', 'Die KI verarbeitet bis zu 100 Millionen Datenpunkte pro Sekunde'] },
      category: 'installation',
      tags: ['Digital', 'KI', 'Installation', 'Zeitgenoessisch'],
      image_url: null,
      audio_url: null,
      qr_code_url: null,
      created_at: '2024-03-01T08:00:00Z',
      updated_at: '2024-03-20T12:00:00Z',
    },
  ]
}
