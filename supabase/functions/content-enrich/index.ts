// Supabase Edge Function: Content Enrich Service
// Generates descriptions, translations, categorizations and audio for imported content
// Uses Claude API for intelligent content generation
// Deploy with: supabase functions deploy content-enrich
// Required secrets: ANTHROPIC_API_KEY

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY')!
const CLAUDE_MODEL = 'claude-sonnet-4-6'
const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface EnrichRequest {
  action: 'enrich_batch' | 'enrich_single' | 'translate' | 'categorize' | 'generate_tours' | 'scout_city'
  job_id?: string
  item_ids?: string[]
  entity_type?: string // artwork, poi, partner, session, exhibitor
  entity_id?: string

  // Configuration
  config?: {
    description_levels?: string[] // brief, standard, detailed, children, youth
    languages?: string[] // de, en, fr, it, es, ...
    generate_fun_facts?: boolean
    generate_historical_context?: boolean
    generate_technique_details?: boolean
    generate_audio?: boolean
    auto_categorize?: boolean
    // City scout specific
    city_name?: string
    country?: string
    radius_km?: number
    poi_categories?: string[]
    data_sources?: string[]
  }
}

interface EnrichResult {
  success: boolean
  action: string
  items_processed: number
  items_total: number
  data?: Record<string, unknown>
  error?: string
}

// Supported languages with their names for prompts
const LANGUAGE_NAMES: Record<string, string> = {
  de: 'German', en: 'English', fr: 'French', it: 'Italian', es: 'Spanish',
  nl: 'Dutch', pl: 'Polish', cs: 'Czech', zh: 'Chinese', ja: 'Japanese',
  ko: 'Korean', ar: 'Arabic',
}

// POI category taxonomy
const POI_CATEGORIES = [
  'attractions', 'restaurants', 'hotels', 'shops', 'culture',
  'nature', 'sport', 'nightlife', 'other',
]

async function callClaude(systemPrompt: string, userPrompt: string, maxTokens = 4096): Promise<string> {
  const response = await fetch(CLAUDE_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: CLAUDE_MODEL,
      max_tokens: maxTokens,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    }),
  })

  const result = await response.json()
  return result.content?.[0]?.text || ''
}

// Generate descriptions for a single item
async function generateDescriptions(
  itemData: Record<string, unknown>,
  entityType: string,
  levels: string[],
  languages: string[],
  extraOptions: {
    funFacts?: boolean
    historicalContext?: boolean
    techniqueDetails?: boolean
  } = {}
): Promise<Record<string, Record<string, string>>> {
  const systemPrompt = getSystemPromptForType(entityType)

  // Build a comprehensive prompt for all levels and languages at once
  const fieldsToGenerate = [
    ...levels.map(l => `description_${l}`),
    ...(extraOptions.funFacts ? ['fun_facts'] : []),
    ...(extraOptions.historicalContext ? ['historical_context'] : []),
    ...(extraOptions.techniqueDetails ? ['technique_details'] : []),
  ]

  const langNames = languages.map(l => `${l} (${LANGUAGE_NAMES[l] || l})`).join(', ')

  const prompt = `Generate content for this ${entityType}:

DATA:
${JSON.stringify(itemData, null, 2)}

Generate the following fields in these languages: ${langNames}

Fields to generate:
${fieldsToGenerate.map(f => {
  switch (f) {
    case 'description_brief': return '- description_brief: 1-2 sentences, concise summary'
    case 'description_standard': return '- description_standard: 4-6 sentences, informative overview'
    case 'description_detailed': return '- description_detailed: 8-15 sentences, comprehensive with context'
    case 'description_children': return '- description_children: 3-5 sentences, for ages 6-12, simple vocabulary, engaging'
    case 'description_youth': return '- description_youth: 4-6 sentences, for ages 13-17, relatable, interesting facts'
    case 'fun_facts': return '- fun_facts: 3-5 surprising or unusual facts, each as a short paragraph'
    case 'historical_context': return '- historical_context: Historical background, 4-8 sentences'
    case 'technique_details': return '- technique_details: Materials, methods, artistic technique, 3-6 sentences'
    default: return `- ${f}: Generate appropriate content`
  }
}).join('\n')}

IMPORTANT: Write naturally in each target language (not machine-translated). Each text should feel native.

Respond ONLY with valid JSON:
{
  "field_name": {
    "de": "German text...",
    "en": "English text..."
  }
}`

  const result = await callClaude(systemPrompt, prompt, 8192)

  try {
    return JSON.parse(result)
  } catch {
    // Try to extract JSON from the response
    const jsonMatch = result.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      try { return JSON.parse(jsonMatch[0]) } catch { /* continue */ }
    }
    return {}
  }
}

// System prompts per entity type
function getSystemPromptForType(entityType: string): string {
  switch (entityType) {
    case 'artwork':
      return `You are an expert art historian and museum curator. You write engaging, accurate descriptions of artworks for diverse audiences. Your descriptions are vivid, culturally informed, and educational. You adapt your tone and complexity based on the target audience (children, youth, general, expert). Always be factually accurate. Respond ONLY with valid JSON.`

    case 'poi':
      return `You are an experienced travel writer and city guide expert. You write compelling, informative descriptions of points of interest that make visitors want to explore. Include practical details where relevant (best time to visit, what to expect, local tips). Adapt language to the target audience. Respond ONLY with valid JSON.`

    case 'partner':
      return `You are a business copywriter who creates compelling business descriptions for travel and tourism directories. Focus on what makes each business special, their offerings, and why visitors should choose them. Keep it professional yet inviting. Respond ONLY with valid JSON.`

    case 'session':
      return `You are a conference content expert who creates engaging session descriptions. Highlight what attendees will learn, why it matters, and who should attend. Make technical topics accessible without losing accuracy. Respond ONLY with valid JSON.`

    case 'exhibitor':
      return `You are a trade fair content expert who creates informative exhibitor profiles. Focus on their products, innovations, and what visitors can experience at their booth. Professional and clear. Respond ONLY with valid JSON.`

    default:
      return `You are a professional content writer. Create engaging, accurate descriptions. Respond ONLY with valid JSON.`
  }
}

// Categorize items into POI categories
async function categorizeItems(
  items: Array<{ id: string; data: Record<string, unknown> }>,
  categories: string[]
): Promise<Record<string, string>> {
  const itemDescriptions = items.map(item =>
    `ID: ${item.id} | Name: ${item.data.name || item.data.title || 'Unknown'} | Info: ${JSON.stringify(item.data).substring(0, 200)}`
  ).join('\n')

  const result = await callClaude(
    'You are a categorization expert. Assign each item to the most appropriate category. Respond ONLY with valid JSON.',
    `Categorize these items into one of these categories: ${categories.join(', ')}

Items:
${itemDescriptions}

Respond with JSON: {"item_id": "category", ...}`
  )

  try {
    return JSON.parse(result)
  } catch {
    return {}
  }
}

// Generate walking tours from a set of POIs
async function generateTours(
  pois: Array<{ id: string; name: string; category: string; lat: number; lng: number; description?: string }>,
  cityName: string,
  languages: string[]
): Promise<Record<string, unknown>[]> {
  const poiList = pois.map(p =>
    `- ${p.name} (${p.category}) [${p.lat}, ${p.lng}]${p.description ? ': ' + p.description.substring(0, 100) : ''}`
  ).join('\n')

  const langNames = languages.map(l => `${l} (${LANGUAGE_NAMES[l] || l})`).join(', ')

  const result = await callClaude(
    `You are an expert city tour designer. Create engaging, well-routed walking tours that visitors love. Consider walking distances, thematic coherence, and visitor experience. Respond ONLY with valid JSON.`,
    `Create 3-5 themed walking tours for ${cityName} using these POIs:

${poiList}

Languages: ${langNames}

For each tour, create:
1. A catchy title (in all languages)
2. A compelling description (in all languages)
3. Target audience (general, families, culture_lovers, foodies, adventure)
4. Estimated duration in minutes
5. Difficulty level (easy, moderate, challenging)
6. Ordered list of stop IDs

Respond with JSON:
{
  "tours": [
    {
      "title": {"de": "...", "en": "..."},
      "description": {"de": "...", "en": "..."},
      "target_audience": "...",
      "estimated_duration_minutes": 90,
      "difficulty_level": "easy",
      "stops": ["poi_id_1", "poi_id_2", ...]
    }
  ]
}`,
    8192
  )

  try {
    const parsed = JSON.parse(result)
    return parsed.tours || []
  } catch {
    return []
  }
}

// City Scout: Gather POI data for a city from available knowledge
async function scoutCity(
  cityName: string,
  country: string,
  radiusKm: number,
  categories: string[],
  languages: string[]
): Promise<Record<string, unknown>[]> {
  const langNames = languages.map(l => `${l} (${LANGUAGE_NAMES[l] || l})`).join(', ')

  const result = await callClaude(
    `You are a comprehensive city guide expert with deep knowledge of cities worldwide. You know popular attractions, restaurants, hotels, cultural sites, and hidden gems. Provide accurate GPS coordinates, categorizations, and descriptions. Respond ONLY with valid JSON.`,
    `Create a comprehensive POI list for ${cityName}, ${country} within ${radiusKm}km radius.

Categories to include: ${categories.join(', ')}
Languages for descriptions: ${langNames}

For each POI provide:
- name (multilingual if the place has official translations)
- category (one of: ${POI_CATEGORIES.join(', ')})
- address
- approximate lat/lng coordinates
- description_brief (multilingual, 1-2 sentences)
- description_standard (multilingual, 4-6 sentences)
- rating (estimated 1-5)
- is_must_see (boolean)
- opening_hours (if known, general estimate)
- admission_price (if applicable, in local currency)
- tags (array of descriptive tags)

Aim for 30-50 POIs covering all requested categories, with emphasis on must-see attractions and highly-rated places.

Respond with JSON:
{
  "city": "${cityName}",
  "country": "${country}",
  "pois": [...]
}`,
    16384
  )

  try {
    const parsed = JSON.parse(result)
    return parsed.pois || []
  } catch {
    const jsonMatch = result.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[0])
        return parsed.pois || []
      } catch { /* continue */ }
    }
    return []
  }
}

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
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return new Response(
        JSON.stringify({ success: false, error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const body: EnrichRequest = await req.json()
    const { action, job_id, config = {} } = body

    let result: EnrichResult

    switch (action) {
      case 'enrich_batch': {
        // Get items from job
        const { data: items, error: itemsError } = await supabase
          .from('ag_import_items')
          .select('*')
          .eq('job_id', job_id!)
          .in('status', ['analyzed', 'enriched', 'pending'])
          .order('row_number')
          .limit(50) // Process in batches of 50

        if (itemsError || !items || items.length === 0) {
          result = { success: false, action, items_processed: 0, items_total: 0, error: 'No items to enrich' }
          break
        }

        // Get job info for entity type
        const { data: job } = await supabase
          .from('ag_import_jobs')
          .select('target_type, import_mode, enrichment_config')
          .eq('id', job_id!)
          .single()

        const entityType = job?.target_type?.replace(/s$/, '') || 'poi' // artworks -> artwork
        let processed = 0

        for (const item of items) {
          try {
            // Apply field mapping to get clean data
            const sourceData = item.mapped_data && Object.keys(item.mapped_data).length > 0
              ? item.mapped_data
              : item.source_data

            // Generate descriptions
            const generated = await generateDescriptions(
              sourceData,
              entityType,
              config.description_levels || ['brief', 'standard'],
              config.languages || ['de', 'en'],
              {
                funFacts: config.generate_fun_facts,
                historicalContext: config.generate_historical_context,
                techniqueDetails: config.generate_technique_details,
              }
            )

            // Calculate quality score
            const expectedFields = (config.description_levels?.length || 2) * (config.languages?.length || 2)
            const actualFields = Object.values(generated).reduce(
              (sum, langMap) => sum + Object.keys(langMap).length, 0
            )
            const qualityScore = Math.min(1, actualFields / Math.max(1, expectedFields))

            // Update item
            await supabase
              .from('ag_import_items')
              .update({
                enriched_data: { ...sourceData, ...generated },
                ai_generated: generated,
                status: 'enriched',
                quality_score: qualityScore,
              })
              .eq('id', item.id)

            processed++

            // Update job progress
            await supabase
              .from('ag_import_jobs')
              .update({
                items_enriched: processed,
                status: 'enriching',
              })
              .eq('id', job_id!)
          } catch (err) {
            // Mark item as error
            await supabase
              .from('ag_import_items')
              .update({
                status: 'error',
                quality_issues: [{ type: 'enrichment_error', message: String(err) }],
              })
              .eq('id', item.id)
          }
        }

        // Check if all items are enriched
        const { count: remaining } = await supabase
          .from('ag_import_items')
          .select('id', { count: 'exact', head: true })
          .eq('job_id', job_id!)
          .in('status', ['analyzed', 'pending'])

        if (remaining === 0) {
          await supabase
            .from('ag_import_jobs')
            .update({ status: 'review', enriched_at: new Date().toISOString() })
            .eq('id', job_id!)
        }

        result = { success: true, action, items_processed: processed, items_total: items.length }
        break
      }

      case 'enrich_single': {
        // Enrich a single entity (not part of import, direct from CMS)
        const entityType = body.entity_type || 'poi'
        const entityId = body.entity_id

        // Fetch entity data
        const tableName = entityType === 'artwork' ? 'ag_artworks'
          : entityType === 'poi' ? 'cg_pois'
          : entityType === 'partner' ? 'cg_partners'
          : null

        if (!tableName || !entityId) {
          result = { success: false, action, items_processed: 0, items_total: 0, error: 'Invalid entity' }
          break
        }

        const { data: entity, error: entityError } = await supabase
          .from(tableName)
          .select('*')
          .eq('id', entityId)
          .single()

        if (entityError || !entity) {
          result = { success: false, action, items_processed: 0, items_total: 0, error: 'Entity not found' }
          break
        }

        const generated = await generateDescriptions(
          entity,
          entityType,
          config.description_levels || ['brief', 'standard', 'detailed'],
          config.languages || ['de', 'en'],
          {
            funFacts: config.generate_fun_facts,
            historicalContext: config.generate_historical_context,
            techniqueDetails: config.generate_technique_details,
          }
        )

        // Update entity with generated content
        const updateData: Record<string, unknown> = {}
        for (const [field, translations] of Object.entries(generated)) {
          updateData[field] = translations
        }

        await supabase.from(tableName).update(updateData).eq('id', entityId)

        result = { success: true, action, items_processed: 1, items_total: 1, data: generated }
        break
      }

      case 'translate': {
        // Translate existing content to additional languages
        const items = body.item_ids || []
        const targetLanguages = config.languages || ['en']
        const sourceLanguage = 'de'

        let processed = 0
        for (const itemId of items) {
          const { data: item } = await supabase
            .from('ag_import_items')
            .select('enriched_data, ai_generated')
            .eq('id', itemId)
            .single()

          if (!item?.enriched_data) continue

          // Find fields that need translation
          const fieldsToTranslate: Record<string, string> = {}
          for (const [key, value] of Object.entries(item.enriched_data)) {
            if (typeof value === 'object' && value !== null && (value as Record<string, unknown>)[sourceLanguage]) {
              fieldsToTranslate[key] = (value as Record<string, string>)[sourceLanguage]
            }
          }

          if (Object.keys(fieldsToTranslate).length === 0) continue

          const langNames = targetLanguages.map(l => `${l} (${LANGUAGE_NAMES[l] || l})`).join(', ')

          const translation = await callClaude(
            'You are an expert translator specializing in tourism and cultural content. Translate naturally — never literal/machine-style. Respond ONLY with valid JSON.',
            `Translate these fields from ${LANGUAGE_NAMES[sourceLanguage]} to: ${langNames}

Fields:
${JSON.stringify(fieldsToTranslate, null, 2)}

Respond with JSON: {"field_name": {"lang_code": "translated text", ...}, ...}`
          )

          try {
            const translations = JSON.parse(translation)
            const updatedData = { ...item.enriched_data }
            for (const [field, langMap] of Object.entries(translations)) {
              if (typeof updatedData[field] === 'object' && updatedData[field] !== null) {
                updatedData[field] = { ...(updatedData[field] as Record<string, unknown>), ...(langMap as Record<string, unknown>) }
              }
            }

            await supabase
              .from('ag_import_items')
              .update({ enriched_data: updatedData })
              .eq('id', itemId)

            processed++
          } catch {
            // Skip translation errors
          }
        }

        result = { success: true, action, items_processed: processed, items_total: items.length }
        break
      }

      case 'categorize': {
        const { data: items } = await supabase
          .from('ag_import_items')
          .select('id, source_data, mapped_data')
          .eq('job_id', job_id!)
          .limit(100)

        if (!items || items.length === 0) {
          result = { success: false, action, items_processed: 0, items_total: 0, error: 'No items' }
          break
        }

        const toCategories = items.map(item => ({
          id: item.id,
          data: item.mapped_data || item.source_data,
        }))

        const categorization = await categorizeItems(toCategories, config.poi_categories || POI_CATEGORIES)

        let processed = 0
        for (const [itemId, category] of Object.entries(categorization)) {
          const { error } = await supabase
            .from('ag_import_items')
            .update({
              enriched_data: supabase.rpc ? undefined : undefined, // Use existing enriched_data
              mapped_data: { category },
            })
            .eq('id', itemId)

          if (!error) processed++
        }

        result = { success: true, action, items_processed: processed, items_total: items.length, data: categorization }
        break
      }

      case 'generate_tours': {
        // Get enriched POIs from job
        const { data: items } = await supabase
          .from('ag_import_items')
          .select('id, enriched_data, mapped_data, source_data')
          .eq('job_id', job_id!)
          .in('status', ['enriched', 'approved'])
          .limit(200)

        if (!items || items.length === 0) {
          result = { success: false, action, items_processed: 0, items_total: 0, error: 'No POIs available' }
          break
        }

        const pois = items.map(item => {
          const data = item.enriched_data || item.mapped_data || item.source_data
          return {
            id: item.id,
            name: data.name?.de || data.name || data.title || 'Unknown',
            category: data.category || 'other',
            lat: data.lat || data.latitude || 0,
            lng: data.lng || data.longitude || 0,
            description: data.description_brief?.de || '',
          }
        })

        const cityName = config.city_name || 'City'
        const tours = await generateTours(pois, cityName, config.languages || ['de', 'en'])

        result = {
          success: true,
          action,
          items_processed: tours.length,
          items_total: pois.length,
          data: { tours },
        }
        break
      }

      case 'scout_city': {
        const cityName = config?.city_name || ''
        const country = config?.country || ''
        const radiusKm = config?.radius_km || 5
        const categories = config?.poi_categories || POI_CATEGORIES
        const langs = config?.languages || ['de', 'en']

        if (!cityName) {
          result = { success: false, action, items_processed: 0, items_total: 0, error: 'city_name required' }
          break
        }

        const pois = await scoutCity(cityName, country, radiusKm, categories, langs)

        // Create import items from scouted POIs
        if (job_id && pois.length > 0) {
          const importItems = pois.map((poi, i) => ({
            job_id,
            row_number: i + 1,
            source_data: poi,
            enriched_data: poi,
            status: 'enriched',
            quality_score: 0.8,
          }))

          await supabase.from('ag_import_items').insert(importItems)

          await supabase
            .from('ag_import_jobs')
            .update({
              status: 'review',
              items_total: pois.length,
              items_analyzed: pois.length,
              items_enriched: pois.length,
              analyzed_at: new Date().toISOString(),
              enriched_at: new Date().toISOString(),
            })
            .eq('id', job_id)
        }

        result = {
          success: true,
          action,
          items_processed: pois.length,
          items_total: pois.length,
          data: { city: cityName, country, pois_count: pois.length },
        }
        break
      }

      default:
        result = { success: false, action: action || 'unknown', items_processed: 0, items_total: 0, error: `Unknown action: ${action}` }
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
