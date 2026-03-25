import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { openai } from '@/lib/openai'

// POST /api/import/upload
// Receives parsed CSV rows, uses AI to map columns, creates import job
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { rows, filename, museumId } = body

    if (!rows || !Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json({ error: 'Keine Zeilen gefunden' }, { status: 400 })
    }

    // Step 1: AI column mapping
    const headers = Object.keys(rows[0])
    const sampleRow = rows[0]

    const mappingPrompt = `Du bist ein Datenanalyst. Mappe die folgenden CSV-Spalten auf das Kunstwerk-Datenbankschema.

CSV-Spalten und Beispielwerte:
${headers.map(h => `"${h}": "${sampleRow[h]}"`).join('\n')}

Ziel-Schema-Felder:
- inventory_number: Inventarnummer/Katalognummer
- title: Titel des Kunstwerks
- artist_name: Name des Kuenstlers/der Kuenstlerin
- year_created: Entstehungsjahr (Zahl oder Text)
- medium: Material/Technik (z.B. "Oel auf Leinwand")
- dimensions: Masse (z.B. "80 x 60 cm")
- description: Beschreibungstext
- location_room: Raum/Standort
- image_url: URL zum Bild
- external_id: Externe ID/Referenz

Antworte NUR mit einem JSON-Objekt, das jedes Ziel-Feld auf den passenden CSV-Spaltennamen mappt (oder null wenn nicht vorhanden):
{
  "inventory_number": "Spaltenname oder null",
  "title": "Spaltenname oder null",
  "artist_name": "Spaltenname oder null",
  "year_created": "Spaltenname oder null",
  "medium": "Spaltenname oder null",
  "dimensions": "Spaltenname oder null",
  "description": "Spaltenname oder null",
  "location_room": "Spaltenname oder null",
  "image_url": "Spaltenname oder null",
  "external_id": "Spaltenname oder null"
}`

    let columnMapping: Record<string, string | null> = {}
    try {
      const mappingResponse = await openai.chat.completions.create({
        model: 'gpt-4.1-nano',
        messages: [{ role: 'user', content: mappingPrompt }],
        response_format: { type: 'json_object' },
        max_tokens: 500,
      })
      columnMapping = JSON.parse(mappingResponse.choices[0].message.content || '{}')
    } catch {
      // Fallback: simple heuristic mapping
      columnMapping = guessColumnMapping(headers)
    }

    // Step 2: Create import job in database
    const jobId = crypto.randomUUID()
    const importedItems = rows.slice(0, 500).map((row: Record<string, string>, index: number) => ({
      id: crypto.randomUUID(),
      job_id: jobId,
      row_index: index,
      source_data: row,
      mapped_data: applyMapping(row, columnMapping),
      status: 'pending',
    }))

    // Store in memory (in production: insert to ag_import_jobs + ag_import_items)
    // For demo: return the job data directly
    const job = {
      id: jobId,
      museum_id: museumId || 'demo-museum',
      filename: filename || 'import.csv',
      total_rows: rows.length,
      processed_rows: 0,
      status: 'pending',
      column_mapping: columnMapping,
      items: importedItems.slice(0, 50), // Return first 50 for preview
      created_at: new Date().toISOString(),
    }

    return NextResponse.json({ success: true, job })
  } catch (error) {
    console.error('Import upload error:', error)
    return NextResponse.json(
      { error: 'Import fehlgeschlagen', details: String(error) },
      { status: 500 }
    )
  }
}

function guessColumnMapping(headers: string[]): Record<string, string | null> {
  const lower = headers.map(h => h.toLowerCase())
  const find = (keywords: string[]) => {
    for (const kw of keywords) {
      const idx = lower.findIndex(h => h.includes(kw))
      if (idx >= 0) return headers[idx]
    }
    return null
  }
  return {
    inventory_number: find(['inventar', 'katalog', 'inv', 'nr', 'number', 'id']),
    title: find(['titel', 'title', 'name', 'bezeichnung']),
    artist_name: find(['kuenstler', 'artist', 'autor', 'author', 'creator']),
    year_created: find(['jahr', 'year', 'datum', 'date', 'entstehung']),
    medium: find(['technik', 'medium', 'material', 'technique']),
    dimensions: find(['masse', 'groesse', 'dimension', 'size', 'format']),
    description: find(['beschreibung', 'description', 'text', 'inhalt']),
    location_room: find(['raum', 'room', 'standort', 'location', 'ort']),
    image_url: find(['bild', 'image', 'foto', 'photo', 'url', 'img']),
    external_id: find(['extern', 'external', 'ref', 'referenz']),
  }
}

function applyMapping(
  row: Record<string, string>,
  mapping: Record<string, string | null>
): Record<string, string> {
  const result: Record<string, string> = {}
  for (const [field, col] of Object.entries(mapping)) {
    if (col && row[col] !== undefined) {
      result[field] = row[col]
    }
  }
  return result
}
