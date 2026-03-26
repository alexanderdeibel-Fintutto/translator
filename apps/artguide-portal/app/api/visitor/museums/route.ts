import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const supabaseUrl = process.env.SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ museums: [] })
    }

    const res = await fetch(
      `${supabaseUrl}/rest/v1/ag_museums?select=id,slug,name,description,city,country,logo_url,cover_image_url,primary_language,supported_languages&is_published=eq.true&order=name.asc`,
      {
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
      }
    )

    if (!res.ok) {
      return NextResponse.json({ museums: [] })
    }

    const museums = await res.json()
    return NextResponse.json({ museums: museums || [] })
  } catch {
    return NextResponse.json({ museums: [] })
  }
}
