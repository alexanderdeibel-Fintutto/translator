// Supabase Edge Function: Content Extract Service
// Parses and extracts structured data from various source formats (CSV, Excel, PDF, URL)
// Uses Claude API for intelligent field detection and data extraction
// Deploy with: supabase functions deploy content-extract
// Required secrets: ANTHROPIC_API_KEY

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY')!
const CLAUDE_MODEL = 'claude-sonnet-4-6'
const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ExtractRequest {
  action: 'analyze_file' | 'analyze_url' | 'analyze_text' | 'suggest_mapping' | 'parse_pdf'
  job_id: string
  // For file analysis
  file_content?: string // base64 or text content
  file_type?: string // csv, xlsx, json, pdf
  file_name?: string
  // For URL crawling
  url?: string
  // For text analysis
  text?: string
  // For mapping suggestions
  detected_columns?: string[]
  target_type?: string // artworks, pois, partners, sessions, exhibitors
  import_mode?: string // museum, city, conference, fair
  // Sample data for AI analysis
  sample_rows?: string[][]
}

interface ExtractResponse {
  success: boolean
  action: string
  job_id: string
  data?: {
    detected_type?: string
    detected_columns?: string[]
    sample_rows?: string[][]
    items_count?: number
    confidence?: number
    suggested_mapping?: Record<string, string>
    items?: Record<string, unknown>[]
    quality_report?: {
      completeness: number
      issues: string[]
      suggestions: string[]
    }
  }
  error?: string
}

// Parse CSV text into rows and columns
function parseCSV(text: string, delimiter = ','): { headers: string[]; rows: string[][] } {
  const lines = text.trim().split('\n')
  if (lines.length === 0) return { headers: [], rows: [] }

  // Auto-detect delimiter
  const firstLine = lines[0]
  if (firstLine.includes('\t')) delimiter = '\t'
  else if (firstLine.includes(';')) delimiter = ';'

  const headers = lines[0].split(delimiter).map(h => h.trim().replace(/^["']|["']$/g, ''))
  const rows = lines.slice(1).map(line =>
    line.split(delimiter).map(cell => cell.trim().replace(/^["']|["']$/g, ''))
  )

  return { headers, rows }
}

// Call Claude API for intelligent analysis
async function callClaude(systemPrompt: string, userPrompt: string): Promise<string> {
  const response = await fetch(CLAUDE_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: CLAUDE_MODEL,
      max_tokens: 4096,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    }),
  })

  const result = await response.json()
  return result.content?.[0]?.text || ''
}

// Analyze uploaded file content and detect structure
async function analyzeFile(
  fileContent: string,
  fileType: string,
  fileName: string,
  targetType: string,
  importMode: string
): Promise<ExtractResponse['data']> {
  if (fileType === 'csv' || fileType === 'tsv' || fileType === 'txt') {
    const { headers, rows } = parseCSV(fileContent)
    const sampleRows = rows.slice(0, 5)

    // Use Claude to understand the data
    const analysis = await callClaude(
      `You are a data analysis expert. Analyze CSV/tabular data and determine what type of content it contains.
       Respond ONLY with valid JSON, no markdown.`,
      `Analyze this data file "${fileName}" with target import type "${targetType}" for "${importMode}" mode.

Headers: ${JSON.stringify(headers)}
Sample rows (first 5): ${JSON.stringify(sampleRows)}
Total rows: ${rows.length}

Respond with JSON:
{
  "detected_type": "artwork_list|poi_list|partner_list|session_list|exhibitor_list|speaker_list|unknown",
  "confidence": 0.0-1.0,
  "column_analysis": { "column_name": { "likely_field": "target_field_name", "data_type": "text|number|date|url|email|phone|gps", "sample": "example" } },
  "quality_issues": ["issue1", "issue2"],
  "suggestions": ["suggestion1"]
}`
    )

    let parsed: Record<string, unknown> = {}
    try {
      parsed = JSON.parse(analysis)
    } catch {
      parsed = { detected_type: 'unknown', confidence: 0.5 }
    }

    return {
      detected_type: parsed.detected_type as string || 'unknown',
      detected_columns: headers,
      sample_rows: sampleRows,
      items_count: rows.length,
      confidence: parsed.confidence as number || 0.5,
      quality_report: {
        completeness: Math.min(1, headers.length / 6),
        issues: (parsed.quality_issues as string[]) || [],
        suggestions: (parsed.suggestions as string[]) || [],
      },
    }
  }

  // For JSON files
  if (fileType === 'json') {
    try {
      const data = JSON.parse(fileContent)
      const items = Array.isArray(data) ? data : data.items || data.data || data.results || [data]
      const sampleItems = items.slice(0, 5)
      const columns = Object.keys(sampleItems[0] || {})

      return {
        detected_type: targetType + '_list',
        detected_columns: columns,
        sample_rows: sampleItems.map((item: Record<string, unknown>) => columns.map(c => String(item[c] || ''))),
        items_count: items.length,
        confidence: 0.85,
      }
    } catch {
      return { detected_type: 'unknown', confidence: 0, items_count: 0 }
    }
  }

  return { detected_type: 'unknown', confidence: 0, items_count: 0 }
}

// Suggest field mapping using AI
async function suggestMapping(
  columns: string[],
  sampleRows: string[][],
  targetType: string,
  importMode: string
): Promise<Record<string, string>> {
  const targetFieldsByType: Record<string, string[]> = {
    artworks: ['inventory_number', 'title', 'artist_name', 'year_created', 'medium', 'dimensions', 'style', 'epoch', 'room', 'origin', 'description', 'image_url'],
    pois: ['name', 'address', 'lat', 'lng', 'category', 'description', 'website', 'phone', 'email', 'opening_hours', 'rating', 'image_url', 'admission_price'],
    partners: ['business_name', 'business_type', 'address', 'lat', 'lng', 'contact_name', 'email', 'phone', 'website', 'description'],
    sessions: ['title', 'speaker', 'room', 'date', 'start_time', 'end_time', 'track', 'description', 'level'],
    exhibitors: ['company_name', 'booth_number', 'hall', 'category', 'products', 'website', 'contact_name', 'email', 'phone', 'description'],
    speakers: ['name', 'title', 'organization', 'bio', 'photo_url', 'email', 'website', 'social_links'],
  }

  const targetFields = targetFieldsByType[targetType] || []

  const response = await callClaude(
    `You are a data mapping expert. Map source columns to target fields.
     Respond ONLY with valid JSON mapping object.`,
    `Map these source columns to target fields for "${targetType}" (${importMode} mode).

Source columns: ${JSON.stringify(columns)}
Sample data: ${JSON.stringify(sampleRows.slice(0, 3))}

Available target fields: ${JSON.stringify(targetFields)}

Respond with JSON mapping {"source_column": "target_field"} for each column that has a match.
Use empty string "" for columns that should be ignored.`
  )

  try {
    return JSON.parse(response)
  } catch {
    // Fallback: try simple name matching
    const mapping: Record<string, string> = {}
    for (const col of columns) {
      const normalized = col.toLowerCase().replace(/[^a-z]/g, '')
      const match = targetFields.find(f =>
        f.toLowerCase().replace(/_/g, '') === normalized ||
        normalized.includes(f.replace(/_/g, ''))
      )
      mapping[col] = match || ''
    }
    return mapping
  }
}

// Analyze a URL and extract content
async function analyzeUrl(url: string, targetType: string, importMode: string): Promise<ExtractResponse['data']> {
  try {
    const response = await fetch(url, {
      headers: { 'User-Agent': 'Fintutto-ContentBot/1.0' },
    })
    const html = await response.text()

    // Use Claude to extract structured data from HTML
    // Truncate HTML to avoid token limits
    const truncatedHtml = html.substring(0, 15000)

    const extraction = await callClaude(
      `You are a web content extraction expert. Extract structured data from HTML content.
       Focus on content relevant to "${targetType}" for a "${importMode}" guide.
       Respond ONLY with valid JSON.`,
      `Extract structured content from this webpage for "${targetType}" (${importMode} mode).
       URL: ${url}

HTML (truncated):
${truncatedHtml}

Respond with JSON:
{
  "page_title": "...",
  "detected_type": "...",
  "items_count": number,
  "items": [{"name": "...", "description": "...", ...}],
  "confidence": 0.0-1.0
}`
    )

    try {
      const parsed = JSON.parse(extraction)
      return {
        detected_type: parsed.detected_type || targetType + '_list',
        items_count: parsed.items_count || parsed.items?.length || 0,
        items: parsed.items || [],
        confidence: parsed.confidence || 0.6,
      }
    } catch {
      return { detected_type: 'unknown', confidence: 0, items_count: 0 }
    }
  } catch (error) {
    return {
      detected_type: 'error',
      confidence: 0,
      items_count: 0,
      quality_report: {
        completeness: 0,
        issues: [`URL nicht erreichbar: ${error}`],
        suggestions: ['Pruefe die URL und versuche es erneut'],
      },
    }
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Verify auth
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return new Response(
        JSON.stringify({ success: false, error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const body: ExtractRequest = await req.json()
    const { action, job_id } = body

    let result: ExtractResponse

    switch (action) {
      case 'analyze_file': {
        const data = await analyzeFile(
          body.file_content || '',
          body.file_type || 'csv',
          body.file_name || 'unknown',
          body.target_type || 'pois',
          body.import_mode || 'city'
        )

        // Update job with analysis results
        await supabase
          .from('ag_import_jobs')
          .update({
            status: 'mapping',
            ai_analysis: data,
            items_total: data?.items_count || 0,
            items_analyzed: data?.items_count || 0,
            analyzed_at: new Date().toISOString(),
          })
          .eq('id', job_id)

        result = { success: true, action, job_id, data }
        break
      }

      case 'analyze_url': {
        const data = await analyzeUrl(
          body.url || '',
          body.target_type || 'pois',
          body.import_mode || 'city'
        )

        await supabase
          .from('ag_import_jobs')
          .update({
            status: 'mapping',
            ai_analysis: data,
            items_total: data?.items_count || 0,
            items_analyzed: data?.items_count || 0,
            analyzed_at: new Date().toISOString(),
          })
          .eq('id', job_id)

        // If items were extracted, create import_items
        if (data?.items && data.items.length > 0) {
          const items = data.items.map((item, i) => ({
            job_id,
            row_number: i + 1,
            source_data: item,
            status: 'analyzed',
          }))
          await supabase.from('ag_import_items').insert(items)
        }

        result = { success: true, action, job_id, data }
        break
      }

      case 'analyze_text': {
        // Treat pasted text as CSV
        const data = await analyzeFile(
          body.text || '',
          'csv',
          'pasted_text.csv',
          body.target_type || 'artworks',
          body.import_mode || 'museum'
        )

        await supabase
          .from('ag_import_jobs')
          .update({
            status: 'mapping',
            ai_analysis: data,
            items_total: data?.items_count || 0,
            items_analyzed: data?.items_count || 0,
            analyzed_at: new Date().toISOString(),
          })
          .eq('id', job_id)

        result = { success: true, action, job_id, data }
        break
      }

      case 'suggest_mapping': {
        const mapping = await suggestMapping(
          body.detected_columns || [],
          body.sample_rows || [],
          body.target_type || 'artworks',
          body.import_mode || 'museum'
        )

        // Save mapping to job
        await supabase
          .from('ag_import_jobs')
          .update({ field_mapping: mapping })
          .eq('id', job_id)

        result = { success: true, action, job_id, data: { suggested_mapping: mapping } }
        break
      }

      case 'parse_pdf': {
        // PDF parsing: extract text content using Claude's vision
        // In production, use a PDF library or service to extract text first
        const extraction = await callClaude(
          `You are a document extraction expert. Extract structured data from document content.
           The content is from a PDF document. Extract all items (artworks, sessions, exhibitors, etc.) into a structured format.
           Respond ONLY with valid JSON.`,
          `Extract structured data from this ${body.import_mode || 'museum'} document.
Target type: ${body.target_type || 'artworks'}
File: ${body.file_name || 'document.pdf'}

Document text content (may be OCR):
${(body.file_content || '').substring(0, 20000)}

Respond with JSON:
{
  "items": [{"field1": "value1", ...}],
  "detected_columns": ["field1", "field2", ...],
  "items_count": number,
  "confidence": 0.0-1.0,
  "extraction_notes": "any issues or notes"
}`
        )

        let data: ExtractResponse['data']
        try {
          const parsed = JSON.parse(extraction)
          data = {
            detected_type: (body.target_type || 'artworks') + '_list',
            detected_columns: parsed.detected_columns || [],
            items_count: parsed.items_count || parsed.items?.length || 0,
            items: parsed.items || [],
            confidence: parsed.confidence || 0.6,
          }
        } catch {
          data = { detected_type: 'unknown', confidence: 0, items_count: 0 }
        }

        // Update job and create items
        await supabase
          .from('ag_import_jobs')
          .update({
            status: 'mapping',
            ai_analysis: data,
            items_total: data?.items_count || 0,
            items_analyzed: data?.items_count || 0,
            analyzed_at: new Date().toISOString(),
          })
          .eq('id', job_id)

        if (data?.items && data.items.length > 0) {
          const items = (data.items as Record<string, unknown>[]).map((item, i) => ({
            job_id,
            row_number: i + 1,
            source_data: item,
            status: 'analyzed',
          }))
          await supabase.from('ag_import_items').insert(items)
        }

        result = { success: true, action, job_id, data }
        break
      }

      default:
        result = { success: false, action: action || 'unknown', job_id, error: `Unknown action: ${action}` }
    }

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: String(error) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
