// Supabase Edge Function: Art Guide AI Service
// Handles personalized artwork explanations and tour generation
// Uses Claude API for text generation
// Deploy with: supabase functions deploy artguide-ai
// Required secrets: ANTHROPIC_API_KEY

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY') || ''
const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY') || ''
const CLAUDE_MODEL = 'claude-sonnet-4-6'
const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages'
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ArtGuideAIRequest {
  action: 'explain' | 'chat' | 'generate_content' | 'generate_all' | 'suggest_tours'
  artwork_id?: string
  museum_id?: string
  visitor_id?: string
  question?: string
  // For content generation
  target_field?: string
  language?: string
  // For chat: previous messages
  messages?: Array<{ role: 'user' | 'assistant'; content: string }>
  // Personalization context (built client-side from visitor profile)
  personalization?: Record<string, unknown>
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

    const body: ArtGuideAIRequest = await req.json()
    const { action } = body

    switch (action) {
      case 'explain':
        return await handleExplain(supabase, body, user?.id)
      case 'chat':
        return await handleChat(supabase, body, user?.id)
      case 'generate_content':
        return await handleGenerateContent(supabase, body, user?.id)
      case 'generate_all':
        return await handleGenerateAll(supabase, body, user?.id)
      case 'suggest_tours':
        return await handleSuggestTours(supabase, body, user?.id)
      default:
        return new Response(
          JSON.stringify({ error: 'Unknown action' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }
  } catch (err) {
    console.error('Art Guide AI error:', err)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

// ============================================================================
// Action Handlers
// ============================================================================

async function handleExplain(
  supabase: ReturnType<typeof createClient>,
  body: ArtGuideAIRequest,
  userId?: string,
) {
  const { artwork_id, personalization, language = 'de' } = body

  if (!artwork_id) {
    return jsonResponse({ error: 'artwork_id required' }, 400)
  }

  // Fetch artwork data (source of truth)
  const { data: artwork, error } = await supabase
    .from('ag_artworks')
    .select('*')
    .eq('id', artwork_id)
    .single()

  if (error || !artwork) {
    return jsonResponse({ error: 'Artwork not found' }, 404)
  }

  // Fetch museum name for context
  const { data: museum } = await supabase
    .from('ag_museums')
    .select('name')
    .eq('id', artwork.museum_id)
    .single()

  const systemPrompt = buildSystemPrompt(personalization, museum?.name || 'Museum')
  const userPrompt = buildArtworkPrompt(artwork, language)

  const response = await callClaude(systemPrompt, userPrompt)

  // Track AI usage
  if (userId) {
    await supabase.from('ag_artwork_views').insert({
      visitor_id: body.visitor_id,
      artwork_id,
      visit_id: null,
      ai_chat_started: true,
      ai_messages_count: 1,
    }).catch(() => {})
  }

  return jsonResponse({ explanation: response, artwork_id })
}

async function handleChat(
  supabase: ReturnType<typeof createClient>,
  body: ArtGuideAIRequest,
  userId?: string,
) {
  const { artwork_id, question, messages = [], personalization, language = 'de' } = body

  if (!artwork_id || !question) {
    return jsonResponse({ error: 'artwork_id and question required' }, 400)
  }

  // Fetch artwork
  const { data: artwork, error } = await supabase
    .from('ag_artworks')
    .select('*')
    .eq('id', artwork_id)
    .single()

  if (error || !artwork) {
    return jsonResponse({ error: 'Artwork not found' }, 404)
  }

  const { data: museum } = await supabase
    .from('ag_museums')
    .select('name')
    .eq('id', artwork.museum_id)
    .single()

  const systemPrompt = buildSystemPrompt(personalization, museum?.name || 'Museum')
  const artworkContext = buildArtworkPrompt(artwork, language)

  // Build conversation with artwork context as first message
  const claudeMessages = [
    { role: 'user' as const, content: artworkContext },
    { role: 'assistant' as const, content: 'Ich habe die Informationen zum Kunstwerk gelesen. Was moechten Sie wissen?' },
    ...messages.map(m => ({ role: m.role, content: m.content })),
    { role: 'user' as const, content: question },
  ]

  const response = await callClaudeMultiTurn(systemPrompt, claudeMessages)

  // Save chat to database
  if (body.visitor_id) {
    const chatMessages = [...messages, { role: 'user', content: question }, { role: 'assistant', content: response }]
    await supabase.from('ag_ai_chats').upsert({
      visitor_id: body.visitor_id,
      artwork_id,
      messages: chatMessages,
      personalization_context: personalization,
      total_messages: chatMessages.length,
      last_message_at: new Date().toISOString(),
    }, { onConflict: 'visitor_id,artwork_id' }).catch(() => {})
  }

  return jsonResponse({ response, artwork_id })
}

async function handleGenerateContent(
  supabase: ReturnType<typeof createClient>,
  body: ArtGuideAIRequest,
  userId?: string,
) {
  const { artwork_id, target_field, language = 'de' } = body

  if (!artwork_id || !target_field) {
    return jsonResponse({ error: 'artwork_id and target_field required' }, 400)
  }

  // Check museum staff permission
  if (!userId) {
    return jsonResponse({ error: 'Authentication required' }, 401)
  }

  const { data: artwork, error } = await supabase
    .from('ag_artworks')
    .select('*')
    .eq('id', artwork_id)
    .single()

  if (error || !artwork) {
    return jsonResponse({ error: 'Artwork not found' }, 404)
  }

  const fieldInstructions: Record<string, string> = {
    description_brief: 'Schreibe eine kurze Beschreibung (1-2 Saetze) fuer einen schnellen Ueberblick.',
    description_standard: 'Schreibe eine Standardbeschreibung (4-6 Saetze) fuer allgemeines Publikum.',
    description_detailed: 'Schreibe eine ausfuehrliche Beschreibung (8-15 Saetze) fuer kunstinteressierte Besucher.',
    description_children: 'Schreibe eine kindgerechte Beschreibung (3-5 Saetze) fuer Kinder von 6-12 Jahren.',
    description_youth: 'Schreibe eine Beschreibung fuer Jugendliche (13-17 Jahre). Cool, nicht belehrend.',
    fun_facts: 'Schreibe 3-5 ueberraschende Fakten ueber dieses Werk oder den Kuenstler.',
    historical_context: 'Erklaere den historischen Kontext des Werks.',
    technique_details: 'Beschreibe die kuenstlerische Technik im Detail.',
  }

  const systemPrompt = [
    'Du bist ein Kunstexperte der Museumstexte verfasst.',
    'Verwende NUR die bereitgestellten Fakten als Grundlage.',
    'Ergaenze mit gesichertem kunsthistorischem Wissen, aber erfinde NICHTS.',
    `Schreibe auf ${getLanguageName(language)}.`,
    'Gib NUR den reinen Text zurueck, keine Ueberschriften oder Formatierung.',
  ].join('\n')

  const userPrompt = [
    buildArtworkPrompt(artwork, language),
    '',
    '=== AUFGABE ===',
    fieldInstructions[target_field] || 'Schreibe eine passende Beschreibung.',
  ].join('\n')

  const generatedText = await callAI(systemPrompt, userPrompt)

  return jsonResponse({ text: generatedText, field: target_field, language })
}

async function handleGenerateAll(
  supabase: ReturnType<typeof createClient>,
  body: ArtGuideAIRequest,
  userId?: string,
) {
  const { artwork_id, language = 'de' } = body
  if (!artwork_id) return jsonResponse({ error: 'artwork_id required' }, 400)
  if (!userId) return jsonResponse({ error: 'Authentication required' }, 401)

  const { data: artwork, error } = await supabase
    .from('ag_artworks').select('*').eq('id', artwork_id).single()
  if (error || !artwork) return jsonResponse({ error: 'Artwork not found' }, 404)

  const { data: museum } = await supabase
    .from('ag_museums').select('name').eq('id', artwork.museum_id).single()

  const systemPrompt = [
    `Du bist ein Kunstexperte der Museumstexte fuer ${museum?.name || 'ein Museum'} verfasst.`,
    'Verwende NUR die bereitgestellten Fakten als Grundlage. Erfinde NICHTS.',
    `Schreibe auf ${getLanguageName(language)}.`,
    'Antworte AUSSCHLIESSLICH mit einem validen JSON-Objekt, ohne Markdown-Codeblock.',
  ].join('\n')

  const userPrompt = [
    buildArtworkPrompt(artwork, language),
    '',
    '=== AUFGABE ===',
    'Generiere alle folgenden Felder als JSON-Objekt:',
    '{',
    '  "description_brief": "1-2 Saetze Kurzuebersicht",',
    '  "description_standard": "4-6 Saetze fuer allgemeines Publikum",',
    '  "description_detailed": "8-15 Saetze fuer Kunstinteressierte",',
    '  "description_children": "3-5 Saetze fuer Kinder 6-12 Jahre",',
    '  "description_youth": "3-5 Saetze fuer Jugendliche 13-17 Jahre",',
    '  "fun_facts": "3-5 ueberraschende Fakten, durch Zeilenumbruch getrennt",',
    '  "historical_context": "3-5 Saetze historischer Kontext",',
    '  "technique_details": "3-5 Saetze zur kuenstlerischen Technik"',
    '}',
  ].join('\n')

  const rawText = await callAI(systemPrompt, userPrompt)
  let generated: Record<string, string> = {}
  try {
    const cleaned = rawText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    generated = JSON.parse(cleaned)
  } catch {
    return jsonResponse({ error: 'AI returned invalid JSON', raw: rawText }, 500)
  }

  // Build update object: each field is a JSONB {lang: text}
  const updates: Record<string, Record<string, string>> = {}
  for (const [field, value] of Object.entries(generated)) {
    const existing = (artwork[field] as Record<string, string>) || {}
    updates[field] = { ...existing, [language]: String(value) }
  }

  const { error: updateError } = await supabase
    .from('ag_artworks')
    .update({ ...updates, status: 'review', updated_at: new Date().toISOString() })
    .eq('id', artwork_id)

  if (updateError) return jsonResponse({ error: 'Failed to save', details: updateError }, 500)

  return jsonResponse({ success: true, generated, language, fields_count: Object.keys(generated).length })
}

async function handleSuggestTours(
  supabase: ReturnType<typeof createClient>,
  body: ArtGuideAIRequest,
  userId?: string,
) {
  const { museum_id, language = 'de' } = body

  if (!museum_id || !userId) {
    return jsonResponse({ error: 'museum_id and authentication required' }, 400)
  }

  // Fetch all published artworks
  const { data: artworks, error } = await supabase
    .from('ag_artworks')
    .select('id, title, artist_name, epoch, style, room_id, tags, is_highlight')
    .eq('museum_id', museum_id)
    .eq('status', 'published')
    .limit(200)

  if (error || !artworks?.length) {
    return jsonResponse({ error: 'No published artworks found' }, 404)
  }

  const systemPrompt = [
    'Du bist ein KI-Assistent fuer Museumskuratoren.',
    'Erstelle 3 Vorschlaege fuer thematische Fuehrungen basierend auf der Sammlung.',
    'Jeder Vorschlag soll einen roten Faden haben.',
    `Antworte im JSON-Format auf ${getLanguageName(language)}.`,
  ].join('\n')

  const userPrompt = [
    '=== SAMMLUNG ===',
    JSON.stringify(artworks.map(a => ({
      id: a.id,
      title: getLocalizedText(a.title, language),
      artist: a.artist_name,
      epoch: a.epoch,
      style: a.style,
      tags: a.tags,
      highlight: a.is_highlight,
    })), null, 2),
    '',
    'Erstelle 3 Tour-Vorschlaege als JSON-Array:',
    '[{ "title": {"de":"...","en":"..."}, "description": {"de":"...","en":"..."}, "theme": "...", "target_audience": "general|children|youth|expert", "estimated_duration_minutes": 60, "reasoning": "...", "stops": [{"artwork_id":"...","reason":"...","narration_hint":"..."}] }]',
  ].join('\n')

  const response = await callClaude(systemPrompt, userPrompt)

  // Try to parse the JSON response
  let suggestions = []
  try {
    const jsonMatch = response.match(/\[[\s\S]*\]/)
    if (jsonMatch) {
      suggestions = JSON.parse(jsonMatch[0])
    }
  } catch {
    // Return raw text if parsing fails
    return jsonResponse({ suggestions: [], raw: response })
  }

  // Save suggestions to database
  for (const suggestion of suggestions) {
    await supabase.from('ag_ai_tour_suggestions').insert({
      museum_id,
      title: suggestion.title || {},
      description: suggestion.description || {},
      target_audience: suggestion.target_audience || 'general',
      estimated_duration_minutes: suggestion.estimated_duration_minutes || 60,
      suggested_stops: suggestion.stops || [],
      theme: suggestion.theme,
      reasoning: suggestion.reasoning,
      requested_by: userId,
    }).catch(() => {})
  }

  return jsonResponse({ suggestions })
}

// ============================================================================
// ============================================================================
// AI Provider Wrapper (OpenAI preferred, Claude fallback)
// ============================================================================

async function callAI(systemPrompt: string, userPrompt: string): Promise<string> {
  if (OPENAI_API_KEY) {
    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${OPENAI_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'gpt-4.1-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    })
    if (!response.ok) {
      const err = await response.text()
      console.error('OpenAI API error:', err)
      throw new Error(`OpenAI API error: ${response.status}`)
    }
    const data = await response.json()
    return data.choices?.[0]?.message?.content || ''
  }
  return callClaude(systemPrompt, userPrompt)
}

// ============================================================================
// Claude API Helpers
// ============================================================================

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
      max_tokens: 2048,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    }),
  })

  if (!response.ok) {
    const err = await response.text()
    console.error('Claude API error:', err)
    throw new Error(`Claude API error: ${response.status}`)
  }

  const data = await response.json()
  return data.content[0]?.text || ''
}

async function callClaudeMultiTurn(
  systemPrompt: string,
  messages: Array<{ role: 'user' | 'assistant'; content: string }>,
): Promise<string> {
  const response = await fetch(CLAUDE_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: CLAUDE_MODEL,
      max_tokens: 1024,
      system: systemPrompt,
      messages,
    }),
  })

  if (!response.ok) {
    const err = await response.text()
    console.error('Claude API error:', err)
    throw new Error(`Claude API error: ${response.status}`)
  }

  const data = await response.json()
  return data.content[0]?.text || ''
}

// ============================================================================
// Prompt Builders
// ============================================================================

function buildSystemPrompt(
  personalization: Record<string, unknown> | undefined,
  museumName: string,
): string {
  const parts: string[] = []
  parts.push(`Du bist ein KI-Kunstfuehrer im ${museumName}.`)
  parts.push('WICHTIG: Verwende die bereitgestellten Museumsinformationen als Grundlage. Ergaenze mit Weltwissen, erfinde aber KEINE Details ueber das spezifische Werk.')

  if (!personalization) return parts.join('\n')

  const p = personalization

  // Tone
  if (p.ai_tone === 'formal') parts.push('Sprich formell mit "Sie".')
  else if (p.ai_tone === 'casual') parts.push('Sprich locker mit "Du".')
  else if (p.ai_tone === 'enthusiastic') parts.push('Sprich begeistert und mitreissend!')
  else if (p.ai_tone === 'academic') parts.push('Sprich fachlich praezise.')
  else parts.push('Sprich warmherzig und einladend mit "Sie".')

  if (p.preferred_salutation) parts.push(`Anrede: "${p.preferred_salutation}".`)

  // Age adaptation
  if (p.age_group === 'child') {
    parts.push('Besucher: Kind (6-12). Einfache Woerter, kurze Saetze, spannend wie Schatzsuche!')
  } else if (p.age_group === 'youth') {
    parts.push('Besucher: Jugendlicher. Cool, nicht belehrend, ueberraschende Fakten.')
  } else if (p.age_group === 'senior') {
    parts.push('Sprich respektvoll mit Wertschaetzung.')
  }

  // Knowledge
  if (p.knowledge_level === 'beginner') parts.push('Wenig Vorwissen. Erklaere Fachbegriffe.')
  else if (p.knowledge_level === 'expert') parts.push('Kunstkenner. Gehe in die Tiefe.')
  else if (p.knowledge_level === 'professional') parts.push('Vom Fach. Profi-Niveau.')

  // Detail level
  if (p.ai_detail_level === 'minimal') parts.push('Maximal 2-3 Saetze.')
  else if (p.ai_detail_level === 'detailed') parts.push('Ausfuehrlich: 8-12 Saetze.')
  else if (p.ai_detail_level === 'exhaustive') parts.push('Umfassend mit allen Details.')
  else parts.push('4-6 Saetze.')

  if (p.include_anecdotes) parts.push('Baue Anekdoten ein.')
  if (p.include_comparisons) parts.push('Vergleiche mit anderen Werken.')
  if (p.include_technique) parts.push('Gehe auf Technik und Materialien ein.')

  // Accessibility
  const needs = p.accessibility_needs as string[] | undefined
  if (needs?.includes('visual_impairment')) {
    parts.push('WICHTIG: Ausfuehrliche Audiodeskription — Farben, Formen, Komposition beschreiben.')
  }

  // Language
  if (p.language) parts.push(`Antworte auf: ${getLanguageName(p.language as string)}`)

  return parts.join('\n')
}

function buildArtworkPrompt(artwork: Record<string, unknown>, language: string): string {
  const parts: string[] = ['=== KUNSTWERK-DATEN ===']
  const title = getLocalizedText(artwork.title as Record<string, string>, language)
  if (title) parts.push(`Titel: ${title}`)
  if (artwork.artist_name) {
    let artist = artwork.artist_name as string
    if (artwork.artist_birth_year) {
      artist += ` (${artwork.artist_birth_year}`
      if (artwork.artist_death_year) artist += `–${artwork.artist_death_year}`
      artist += ')'
    }
    parts.push(`Kuenstler: ${artist}`)
  }
  if (artwork.year_created) parts.push(`Entstehung: ${artwork.year_created}`)
  if (artwork.medium) parts.push(`Technik: ${artwork.medium}`)
  if (artwork.dimensions) parts.push(`Masse: ${artwork.dimensions}`)
  if (artwork.style) parts.push(`Stil: ${artwork.style}`)
  if (artwork.epoch) parts.push(`Epoche: ${artwork.epoch}`)

  const fields = ['description_standard', 'description_detailed', 'historical_context', 'technique_details', 'fun_facts']
  for (const field of fields) {
    const text = getLocalizedText(artwork[field] as Record<string, string>, language)
    if (text) parts.push(`\n${field}: ${text}`)
  }

  if (artwork.ai_base_knowledge) {
    parts.push(`\nZusaetzliche Fakten: ${JSON.stringify(artwork.ai_base_knowledge)}`)
  }

  parts.push('=== ENDE ===')
  return parts.join('\n')
}

// ============================================================================
// Utilities
// ============================================================================

function jsonResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

function getLocalizedText(text: Record<string, string> | undefined | null, lang: string): string {
  if (!text || typeof text !== 'object') return ''
  return text[lang] || text['en'] || text['de'] || Object.values(text)[0] || ''
}

function getLanguageName(code: string): string {
  const names: Record<string, string> = {
    de: 'Deutsch', en: 'English', fr: 'Francais', es: 'Espanol',
    it: 'Italiano', pt: 'Portugues', nl: 'Nederlands', ja: 'Nihongo',
  }
  return names[code?.split('-')[0]] || code
}
