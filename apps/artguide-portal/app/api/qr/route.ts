import { NextRequest, NextResponse } from 'next/server'
import QRCode from 'qrcode'

// GET /api/qr?artwork_id=...&museum_id=...&format=svg|png
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const artworkId = searchParams.get('artwork_id') || 'demo'
  const museumId = searchParams.get('museum_id') || 'demo'
  const format = searchParams.get('format') || 'svg'

  const url = `https://app.fintutto.com/art/${museumId}/poi/${artworkId}`

  try {
    if (format === 'png') {
      const buffer = await QRCode.toBuffer(url, {
        width: 300,
        margin: 2,
        color: { dark: '#1e1b4b', light: '#ffffff' },
      })
      return new NextResponse(new Uint8Array(buffer), {
        headers: { 'Content-Type': 'image/png' },
      })
    } else {
      const svg = await QRCode.toString(url, {
        type: 'svg',
        width: 200,
        margin: 2,
        color: { dark: '#1e1b4b', light: '#ffffff' },
      })
      return new NextResponse(svg, {
        headers: { 'Content-Type': 'image/svg+xml' },
      })
    }
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}

// POST /api/qr — batch QR generation for PDF export
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { artworks, museumId } = body

    const qrCodes = await Promise.all(
      artworks.map(async (artwork: { id: string; title: string; artist_name: string }) => {
        const url = `https://app.fintutto.com/art/${museumId}/poi/${artwork.id}`
        const dataUrl = await QRCode.toDataURL(url, {
          width: 200,
          margin: 1,
          color: { dark: '#1e1b4b', light: '#ffffff' },
        })
        return {
          id: artwork.id,
          title: artwork.title,
          artist: artwork.artist_name,
          qr_data_url: dataUrl,
          visitor_url: url,
        }
      })
    )

    return NextResponse.json({ success: true, qr_codes: qrCodes })
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
