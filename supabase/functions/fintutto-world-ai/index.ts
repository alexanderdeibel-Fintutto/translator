// Supabase Edge Function: Fintutto World AI Dialog Engine
// Universal conversational AI for all domains: Museums, Cities, Regions, Cruises
// Handles: onboarding, POI explanations, recommendations, general Q&A
// Deploy with: supabase functions deploy fintutto-world-ai
// Required secrets: ANTHROPIC_API_KEY

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY')!
const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages'

// Smart Model Routing: Haiku for simple tasks, Sonnet for complex ones
// Saves ~80% on AI costs for standard interactions
const MODEL_SONNET = 'claude-sonnet-4-6'
const MODEL_HAIKU = 'claude-haiku-4-5-20251001'

type ModelTier = 'fast' | 'deep'

function selectModel(action: string, messageCount: number, hasComplexPersonalization: boolean): { model: string; tier: ModelTier } {
  // Always use Sonnet for:
  // - Deep multi-turn dialogs (5+ messages)
  // - Complex personalization (child mode, accessibility, expert knowledge)
  // - Tour narration (creative, high-quality text)
  if (action === 'narrate_tour') return { model: MODEL_SONNET, tier: 'deep' }
  if (action === 'dialog' && messageCount >= 5) return { model: MODEL_SONNET, tier: 'deep' }
  if (hasComplexPersonalization) return { model: MODEL_SONNET, tier: 'deep' }

  // Use Haiku for everything else:
  // - Simple POI explanations (structured input → structured output)
  // - Recommendations (JSON output from list)
  // - Onboarding (short, guided conversation)
  // - Short dialogs (< 5 messages)
  // - Profile extraction (structured extraction)
  return { model: MODEL_HAIKU, tier: 'fast' }
}

function isComplexPersonalization(p: Record<string, unknown> | undefined): boolean {
  if (!p) return false
  return (
    p.age_group === 'child' ||
    p.knowledge_level === 'expert' || p.knowledge_level === 'professional' ||
    p.ai_detail_level === 'exhaustive' ||
    (p.accessibility_needs as string[] | undefined)?.length > 0 ||
    p.child_mode === true
  )
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// ============================================================================
// Request Types
// ============================================================================

interface FwAiRequest {
  action: 'dialog' | 'onboarding' | 'explain_poi' | 'recommend' | 'narrate_tour'
  // Dialog context
  dialog_id?: string
  visitor_id?: string
  context_type?: string        // museum, city, region, cruise, event, nature
  context_id?: string
  context_name?: string
  parent_name?: string
  // Message
  message?: string
  messages?: Array<{ role: 'user' | 'assistant'; content: string }>
  // POI data (for explain_poi)
  poi_data?: Record<string, unknown>
  // Personalization
  personalization?: Record<string, unknown>
  language?: string
  // Recommendation
  available_pois?: Array<{ id: string; name: string; type: string; tags: string[]; distance?: number }>
  already_viewed?: string[]
  remaining_time_minutes?: number
}

// ============================================================================
// Main Handler
// ============================================================================

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    const body: FwAiRequest = await req.json()

    switch (body.action) {
      case 'dialog':
        return await handleDialog(supabase, body)
      case 'onboarding':
        return await handleOnboarding(supabase, body)
      case 'explain_poi':
        return await handleExplainPoi(supabase, body)
      case 'recommend':
        return await handleRecommend(supabase, body)
      case 'narrate_tour':
        return await handleNarrateTour(supabase, body)
      default:
        return jsonResponse({ error: `Unknown action: ${body.action}` }, 400)
    }
  } catch (err) {
    console.error('FW AI error:', err)
    return jsonResponse({ error: 'Internal server error' }, 500)
  }
})

// ============================================================================
// Dialog Handler (multi-turn conversation about any topic)
// ============================================================================

async function handleDialog(
  _supabase: ReturnType<typeof createClient>,
  body: FwAiRequest,
) {
  const {
    message,
    messages = [],
    personalization,
    context_type = 'general',
    context_name,
    parent_name,
    language = 'de',
    remaining_time_minutes,
  } = body

  if (!message) {
    return jsonResponse({ error: 'message required' }, 400)
  }

  const systemPrompt = buildUniversalSystemPrompt(personalization, {
    contextType: context_type,
    contextName: context_name,
    parentName: parent_name,
    dialogMode: personalization?.proactive_suggestions ? 'proactive' : 'reactive',
    remainingTime: remaining_time_minutes,
  }, language)

  const claudeMessages = [
    ...messages.map(m => ({ role: m.role as 'user' | 'assistant', content: m.content })),
    { role: 'user' as const, content: message },
  ]

  const { model, tier } = selectModel('dialog', messages.length, isComplexPersonalization(personalization as Record<string, unknown> | undefined))
  const response = await callClaudeMultiTurn(systemPrompt, claudeMessages, 1024, model)

  return jsonResponse({
    response,
    context_type,
    context_id: body.context_id,
    model_tier: tier,
  })
}

// ============================================================================
// Onboarding Handler (guided conversation to learn about visitor)
// ============================================================================

async function handleOnboarding(
  _supabase: ReturnType<typeof createClient>,
  body: FwAiRequest,
) {
  const {
    message,
    messages = [],
    context_type = 'general',
    context_name,
    language = 'de',
  } = body

  const systemPrompt = buildOnboardingPrompt(language, context_type, context_name)

  const claudeMessages = message
    ? [
        ...messages.map(m => ({ role: m.role as 'user' | 'assistant', content: m.content })),
        { role: 'user' as const, content: message },
      ]
    : [{ role: 'user' as const, content: 'Hallo!' }]

  const { model: onboardingModel } = selectModel('onboarding', messages.length, false)
  const response = await callClaudeMultiTurn(systemPrompt, claudeMessages, 512, onboardingModel)

  // Try to extract structured profile data from the conversation
  let profileUpdates = null
  if (messages.length >= 4) {
    profileUpdates = await extractProfileFromConversation(
      [...messages, { role: 'user', content: message || '' }, { role: 'assistant', content: response }],
      language,
    )
  }

  return jsonResponse({
    response,
    profile_updates: profileUpdates,
  })
}

// ============================================================================
// POI Explanation Handler
// ============================================================================

async function handleExplainPoi(
  supabase: ReturnType<typeof createClient>,
  body: FwAiRequest,
) {
  const {
    poi_data,
    personalization,
    language = 'de',
    message,
    context_name,
  } = body

  if (!poi_data) {
    return jsonResponse({ error: 'poi_data required' }, 400)
  }

  const systemPrompt = buildUniversalSystemPrompt(personalization, {
    contextType: (body.context_type || 'general') as string,
    contextName: context_name,
    dialogMode: 'reactive',
  }, language)

  const poiContext = buildPoiPrompt(poi_data, language)
  const userMessage = message
    ? `${poiContext}\n\nFrage: ${message}`
    : `${poiContext}\n\nBitte erklaere diesen Ort/dieses Objekt entsprechend meines Profils.`

  const { model: poiModel, tier: poiTier } = selectModel('explain_poi', 0, isComplexPersonalization(personalization as Record<string, unknown> | undefined))
  const response = await callClaude(systemPrompt, userMessage, 1024, poiModel)

  // Track interaction
  if (body.visitor_id && poi_data.id) {
    await supabase.from('fw_poi_interactions').insert({
      visitor_id: body.visitor_id,
      poi_type: poi_data.poi_type || 'poi',
      poi_id: poi_data.id,
      poi_name: getLocalizedText(poi_data.name as Record<string, string>, language),
      interaction_type: 'ai_chat',
      language_used: language,
      ai_chat_started: true,
      ai_messages_count: 1,
    }).catch(() => {})
  }

  return jsonResponse({ response, poi_id: poi_data.id })
}

// ============================================================================
// Recommendation Handler
// ============================================================================

async function handleRecommend(
  _supabase: ReturnType<typeof createClient>,
  body: FwAiRequest,
) {
  const {
    personalization,
    available_pois = [],
    already_viewed = [],
    remaining_time_minutes,
    context_type = 'general',
    context_name,
    language = 'de',
  } = body

  if (available_pois.length === 0) {
    return jsonResponse({ recommendations: [] })
  }

  const p = personalization || {}

  const systemPrompt = [
    'Du bist ein Empfehlungs-Assistent fuer Fintutto World.',
    'Empfehle 3-5 POIs die zum Besucher-Profil passen.',
    `Antworte NUR im JSON-Format auf ${getLanguageName(language)}.`,
    'Format: [{ "poi_id": "...", "reason": "...", "priority": 1-5 }]',
  ].join('\n')

  const userPrompt = [
    '=== BESUCHER ===',
    `Interessen: ${(p.interests as string[])?.join(', ') || 'keine'}`,
    `Wissen: ${p.knowledge_level || 'casual'}`,
    `Alter: ${p.age_group || 'adult'}`,
    `Budget: ${p.budget_level || 'medium'}`,
    `Mobilitaet: ${p.mobility_level || 'full'}`,
    p.travel_with_children ? 'Mit Kindern' : '',
    (p.dietary_preferences as string[])?.length ? `Ernaehrung: ${(p.dietary_preferences as string[]).join(', ')}` : '',
    '',
    `=== ${context_name || context_type} ===`,
    remaining_time_minutes ? `Zeit: ${remaining_time_minutes} Min` : '',
    `Bereits gesehen: ${already_viewed.length}`,
    '',
    '=== POIS ===',
    JSON.stringify(
      available_pois
        .filter(p => !already_viewed.includes(p.id))
        .slice(0, 25),
    ),
  ].filter(Boolean).join('\n')

  const response = await callClaude(systemPrompt, userPrompt, 1024, MODEL_HAIKU)

  let recommendations = []
  try {
    const jsonMatch = response.match(/\[[\s\S]*\]/)
    if (jsonMatch) recommendations = JSON.parse(jsonMatch[0])
  } catch {
    return jsonResponse({ recommendations: [], raw: response })
  }

  return jsonResponse({ recommendations })
}

// ============================================================================
// Tour Narration Handler
// ============================================================================

async function handleNarrateTour(
  supabase: ReturnType<typeof createClient>,
  body: FwAiRequest,
) {
  const {
    poi_data,
    personalization,
    language = 'de',
    context_name,
  } = body

  if (!poi_data) {
    return jsonResponse({ error: 'poi_data required (tour stop data)' }, 400)
  }

  const p = personalization || {}

  const systemPrompt = [
    `Du bist der Fintutto Guide und fuehrst den Besucher durch ${context_name || 'eine Tour'}.`,
    'Erklaere den aktuellen Stopp lebendig und persoenlich.',
    p.ai_tone === 'enthusiastic' ? 'Sei begeistert!' : '',
    p.ai_tone === 'academic' ? 'Sei fachlich praezise.' : '',
    p.age_group === 'child' ? 'Spreche kindgerecht (6-12 Jahre). Einfach, spannend!' : '',
    p.age_group === 'youth' ? 'Spreche jugendlich. Cool, nicht belehrend.' : '',
    p.ai_detail_level === 'minimal' ? 'Maximal 3 Saetze.' : '',
    p.ai_detail_level === 'exhaustive' ? 'Umfassend mit allen Details.' : '',
    `Antworte auf ${getLanguageName(language)}.`,
  ].filter(Boolean).join('\n')

  const poiContext = buildPoiPrompt(poi_data, language)

  // Tour narration always uses Sonnet for creative, high-quality text
  const response = await callClaude(
    systemPrompt,
    `${poiContext}\n\nBitte erzaehle zu diesem Stopp der Tour.`,
    768,
    MODEL_SONNET,
  )

  return jsonResponse({ narration: response, poi_id: poi_data.id, model_tier: 'deep' })
}

// ============================================================================
// Profile Extraction from Onboarding
// ============================================================================

async function extractProfileFromConversation(
  messages: Array<{ role: string; content: string }>,
  language: string,
): Promise<Record<string, unknown> | null> {
  const systemPrompt = [
    'Analysiere das Gespraech und extrahiere Besucher-Profildaten.',
    'Antworte NUR im JSON-Format. Gib nur Felder zurueck die klar aus dem Gespraech hervorgehen.',
    'Moegliche Felder: display_name, age_group (child|youth|young_adult|adult|senior),',
    'knowledge_level (beginner|casual|enthusiast|expert), interests (array),',
    'preferred_tour_depth (quick|standard|deep_dive), budget_level (budget|medium|premium|luxury),',
    'travel_party_size (number), travel_with_children (boolean),',
    'dietary_preferences (array), mobility_level (full|limited|wheelchair|stroller),',
    'typical_visit_duration_minutes (number), preferred_salutation (string)',
  ].join('\n')

  const conversationText = messages
    .map(m => `${m.role === 'user' ? 'Besucher' : 'Guide'}: ${m.content}`)
    .join('\n')

  try {
    // Profile extraction is structured → Haiku is sufficient
    const response = await callClaude(systemPrompt, conversationText, 512, MODEL_HAIKU)
    const jsonMatch = response.match(/\{[\s\S]*\}/)
    if (jsonMatch) return JSON.parse(jsonMatch[0])
  } catch {
    // Profile extraction is best-effort
  }
  return null
}

// ============================================================================
// Prompt Builders
// ============================================================================

function buildUniversalSystemPrompt(
  p: Record<string, unknown> | undefined,
  ctx: {
    contextType: string
    contextName?: string
    parentName?: string
    dialogMode: string
    remainingTime?: number
  },
  language: string,
): string {
  const parts: string[] = []

  parts.push('Du bist der Fintutto Guide — ein persoenlicher KI-Assistent.')
  parts.push('Du weisst alles ueber Sehenswuerdigkeiten, Museen, Staedte, Regionen, Restaurants und lokale Tipps.')

  // Context
  if (ctx.contextName) {
    const labels: Record<string, string> = {
      museum: 'Museum', city: 'Stadt', region: 'Region',
      cruise: 'Kreuzfahrtschiff', event: 'Event', nature: 'Naturgebiet',
    }
    parts.push(`\nKontext: ${labels[ctx.contextType] || ctx.contextType} "${ctx.contextName}"`)
    if (ctx.parentName) parts.push(`Uebergeordnet: ${ctx.parentName}`)
  }

  if (!p) {
    parts.push(`\nAntworte auf ${getLanguageName(language)}.`)
    return parts.join('\n')
  }

  // Tone
  const tones: Record<string, string> = {
    formal: 'Formell mit "Sie".',
    warm: 'Warmherzig mit "Sie".',
    casual: 'Locker mit "Du".',
    enthusiastic: 'Begeistert und mitreissend!',
    academic: 'Fachlich praezise.',
  }
  parts.push(`\nTon: ${tones[p.ai_tone as string] || tones.warm}`)
  if (p.preferred_salutation) parts.push(`Anrede: "${p.preferred_salutation}"`)

  // Age
  if (p.age_group === 'child') parts.push('Kind (6-12): Einfach, spannend, Fragen stellen!')
  else if (p.age_group === 'youth') parts.push('Jugendlich: Cool, nicht belehrend.')
  else if (p.age_group === 'senior') parts.push('Respektvoll, Lebenserfahrung wertschaetzen.')

  // Knowledge
  if (p.knowledge_level === 'beginner') parts.push('Wenig Vorwissen. Einfach erklaeren.')
  else if (p.knowledge_level === 'expert' || p.knowledge_level === 'professional') parts.push('Experte. Tiefgang, Fachsprache.')

  // Detail
  if (p.ai_detail_level === 'minimal') parts.push('KURZ: 2-3 Saetze.')
  else if (p.ai_detail_level === 'detailed') parts.push('Ausfuehrlich: 8-12 Saetze.')
  else if (p.ai_detail_level === 'exhaustive') parts.push('Umfassend.')
  else parts.push('4-6 Saetze.')

  if (p.include_anecdotes) parts.push('Anekdoten einbauen.')
  if (p.include_comparisons) parts.push('Vergleiche ziehen.')
  if (p.include_technique) parts.push('Technik erklaeren.')

  // Question frequency
  const qf: Record<string, string> = {
    never: 'Keine Gegenfragen.',
    rare: 'Selten fragen.',
    moderate: 'Gelegentlich fragen.',
    frequent: 'Aktiv fragen, interaktiv sein.',
  }
  if (p.question_frequency) parts.push(qf[p.question_frequency as string] || '')

  // Lifestyle
  if ((p.dietary_preferences as string[])?.length) {
    parts.push(`Ernaehrung: ${(p.dietary_preferences as string[]).join(', ')}. Bei Restaurants beruecksichtigen!`)
  }
  if (p.budget_level && p.budget_level !== 'medium') {
    parts.push(`Budget: ${p.budget_level === 'budget' ? 'Guenstig' : p.budget_level === 'luxury' ? 'Luxus' : 'Gehoben'}.`)
  }
  if (p.mobility_level && p.mobility_level !== 'full') {
    parts.push(`Mobilitaet: ${p.mobility_level === 'wheelchair' ? 'Rollstuhl — nur barrierefrei' : 'Eingeschraenkt'}.`)
  }
  if (p.travel_with_children) parts.push('Mit Kindern — kinderfreundlich!')

  // Accessibility
  const needs = p.accessibility_needs as string[] | undefined
  if (needs?.includes('visual_impairment')) {
    parts.push('AUDIODESKRIPTION: Farben, Formen, Komposition ausfuehrlich beschreiben.')
  }

  // Time
  if (ctx.remainingTime) {
    parts.push(`\nVerbleibende Zeit: ${ctx.remainingTime} Min. Empfehlungen darauf abstimmen.`)
  }

  // Interests
  if ((p.interests as string[])?.length) {
    parts.push(`Interessen: ${(p.interests as string[]).join(', ')}`)
  }

  parts.push(`\nAntworte auf ${getLanguageName(language)}.`)
  parts.push('WICHTIG: Verwende bereitgestellte Fakten als Grundlage. Erfinde KEINE Details.')

  return parts.join('\n')
}

function buildOnboardingPrompt(language: string, contextType: string, contextName?: string): string {
  const langPrefix = language.split('-')[0]

  if (langPrefix === 'de') {
    return `Du bist der Fintutto Guide und begruesst einen neuen Besucher${contextName ? ` in ${contextName}` : ''}.

Lerne den Besucher in einem kurzen, freundlichen Gespraech kennen.
Frage NACHEINANDER (nicht alles auf einmal!):
1. Begruessung + wie moechte er/sie angesprochen werden?
2. Wie viel Zeit haben Sie heute?
3. Was interessiert Sie besonders?
4. Erster Besuch oder waren Sie schon mal hier?
5. Alleine oder in einer Gruppe? Mit Kindern?
6. Besondere Wuensche? (Ernaehrung, Barrierefreiheit...)

Nach 3-4 Antworten: Zusammenfassen und personalisierten Plan vorschlagen.
Sei warmherzig und natuerlich — kein Fragebogen!
Antworte auf Deutsch.`
  }

  return `You are the Fintutto Guide welcoming a new visitor${contextName ? ` to ${contextName}` : ''}.

Get to know the visitor in a short, friendly chat.
Ask ONE AT A TIME (not all at once!):
1. Greeting + how would they like to be addressed?
2. How much time do you have today?
3. What interests you most?
4. First visit or have you been here before?
5. Alone or in a group? With children?
6. Any special needs? (Dietary, accessibility...)

After 3-4 answers: Summarize and suggest a personalized plan.
Be warm and natural — not a questionnaire!
Respond in English.`
}

function buildPoiPrompt(poi: Record<string, unknown>, language: string): string {
  const parts: string[] = []
  parts.push(`=== POI (${poi.poi_type || 'unknown'}) ===`)

  const name = getLocalizedText(poi.name as Record<string, string>, language)
  if (name) parts.push(`Name: ${name}`)

  const desc = getLocalizedText(poi.description as Record<string, string>, language)
  if (desc) parts.push(`Beschreibung: ${desc}`)

  // Content layers
  const layers = poi.content_layers as Record<string, Record<string, string>> | undefined
  if (layers) {
    for (const [key, text] of Object.entries(layers)) {
      const localized = getLocalizedText(text, language)
      if (localized) parts.push(`\n${key}: ${localized}`)
    }
  }

  // Artwork-specific fields
  if (poi.artist_name) parts.push(`Kuenstler: ${poi.artist_name}`)
  if (poi.year_created) parts.push(`Entstehung: ${poi.year_created}`)
  if (poi.epoch) parts.push(`Epoche: ${poi.epoch}`)
  if (poi.medium) parts.push(`Technik: ${poi.medium}`)

  // City/Region POI fields
  if (poi.opening_hours) parts.push(`Oeffnungszeiten: ${JSON.stringify(poi.opening_hours)}`)
  if (poi.admission_price) parts.push(`Eintritt: ${JSON.stringify(poi.admission_price)}`)

  if (poi.ai_base_knowledge) {
    parts.push(`\nZusaetzliche Fakten: ${JSON.stringify(poi.ai_base_knowledge)}`)
  }

  if ((poi.tags as string[])?.length) {
    parts.push(`Tags: ${(poi.tags as string[]).join(', ')}`)
  }

  parts.push('=== ENDE ===')
  return parts.join('\n')
}

// ============================================================================
// Claude API
// ============================================================================

async function callClaude(system: string, user: string, maxTokens = 1024, model = MODEL_HAIKU): Promise<string> {
  const response = await fetch(CLAUDE_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model,
      max_tokens: maxTokens,
      system,
      messages: [{ role: 'user', content: user }],
    }),
  })

  if (!response.ok) {
    const err = await response.text()
    console.error('Claude API error:', response.status, err)
    throw new Error(`Claude API error: ${response.status}`)
  }

  const data = await response.json()
  return data.content?.[0]?.text || ''
}

async function callClaudeMultiTurn(
  system: string,
  messages: Array<{ role: 'user' | 'assistant'; content: string }>,
  maxTokens = 1024,
  model = MODEL_HAIKU,
): Promise<string> {
  const response = await fetch(CLAUDE_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model,
      max_tokens: maxTokens,
      system,
      messages,
    }),
  })

  if (!response.ok) {
    const err = await response.text()
    console.error('Claude API error:', response.status, err)
    throw new Error(`Claude API error: ${response.status}`)
  }

  const data = await response.json()
  return data.content?.[0]?.text || ''
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
  const prefix = lang.split('-')[0]
  return text[prefix] || text['en'] || text['de'] || Object.values(text)[0] || ''
}

function getLanguageName(code: string): string {
  const names: Record<string, string> = {
    de: 'Deutsch', en: 'English', fr: 'Francais', es: 'Espanol',
    it: 'Italiano', pt: 'Portugues', nl: 'Nederlands', pl: 'Polski',
    tr: 'Tuerkce', ru: 'Russkij', uk: 'Ukrainska', ar: 'Arabisch',
    zh: 'Zhongwen', ja: 'Nihongo', ko: 'Hangugeo',
  }
  return names[code?.split('-')[0]] || code
}
