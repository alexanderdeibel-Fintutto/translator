import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// ---------------------------------------------------------------------------
// Translation provider implementations
// Cascade: DeepL (best quality, cheapest) → Azure → Google → MyMemory (free)
// ---------------------------------------------------------------------------

// DeepL: Best quality for European languages, ~EUR 5.49/1M chars (vs Azure EUR 10)
// Supports: DE, EN, FR, ES, IT, PT, NL, PL, RU, JA, ZH, KO + 20 more
async function translateWithDeepL(
  text: string,
  sourceLang: string,
  targetLang: string,
  apiKey: string,
): Promise<{ translatedText: string; provider: string; cost: number }> {
  // DeepL uses uppercase language codes, with special handling for EN/PT variants
  const mapLang = (lang: string, isTarget: boolean): string => {
    const upper = lang.toUpperCase()
    if (isTarget && upper === 'EN') return 'EN-US'
    if (isTarget && upper === 'PT') return 'PT-PT'
    return upper
  }

  const url = apiKey.endsWith(':fx')
    ? 'https://api-free.deepl.com/v2/translate'
    : 'https://api.deepl.com/v2/translate'

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `DeepL-Auth-Key ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text: [text],
      source_lang: mapLang(sourceLang, false),
      target_lang: mapLang(targetLang, true),
    }),
  })

  if (!res.ok) {
    const errorBody = await res.text()
    throw new Error(`DeepL API error ${res.status}: ${errorBody}`)
  }

  const data = await res.json()
  const translatedText = data?.translations?.[0]?.text
  if (!translatedText) {
    throw new Error('DeepL returned no translation')
  }

  // DeepL Pro: ~$5.49 per 1M characters (EUR ~5.49)
  // DeepL Free: 500K chars/month free, then blocked
  const charCount = text.length
  const cost = apiKey.endsWith(':fx') ? 0 : (charCount / 1_000_000) * 5.49

  return { translatedText, provider: 'deepl', cost }
}

// Languages supported by DeepL (used to decide cascade)
const DEEPL_LANGUAGES = new Set([
  'bg', 'cs', 'da', 'de', 'el', 'en', 'es', 'et', 'fi', 'fr', 'hu',
  'id', 'it', 'ja', 'ko', 'lt', 'lv', 'nb', 'nl', 'pl', 'pt', 'ro',
  'ru', 'sk', 'sl', 'sv', 'tr', 'uk', 'zh', 'ar',
])

function isDeepLSupported(sourceLang: string, targetLang: string): boolean {
  return DEEPL_LANGUAGES.has(sourceLang.split('-')[0].toLowerCase()) &&
    DEEPL_LANGUAGES.has(targetLang.split('-')[0].toLowerCase())
}

async function translateWithAzure(
  text: string,
  sourceLang: string,
  targetLang: string,
  apiKey: string,
  region: string,
): Promise<{ translatedText: string; provider: string; cost: number }> {
  const url = `https://api.cognitive.microsofttranslator.com/translate?api-version=3.0&from=${sourceLang}&to=${targetLang}`
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Ocp-Apim-Subscription-Key': apiKey,
      'Ocp-Apim-Subscription-Region': region,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify([{ Text: text }]),
  })

  if (!res.ok) {
    const errorBody = await res.text()
    throw new Error(`Azure Translate API error ${res.status}: ${errorBody}`)
  }

  const data = await res.json()
  const translatedText = data[0]?.translations?.[0]?.text
  if (!translatedText) {
    throw new Error('Azure Translate returned no translation')
  }

  // Azure charges ~$10 per 1M characters
  const charCount = text.length
  const cost = (charCount / 1_000_000) * 10

  return { translatedText, provider: 'azure', cost }
}

async function translateWithGoogle(
  text: string,
  sourceLang: string,
  targetLang: string,
  apiKey: string,
): Promise<{ translatedText: string; provider: string; cost: number }> {
  const url = `https://translation.googleapis.com/language/translate/v2?key=${apiKey}`
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ q: text, source: sourceLang, target: targetLang, format: 'text' }),
  })

  if (!res.ok) {
    const errorBody = await res.text()
    throw new Error(`Google Translate API error ${res.status}: ${errorBody}`)
  }

  const data = await res.json()
  const translatedText = data?.data?.translations?.[0]?.translatedText
  if (!translatedText) {
    throw new Error('Google Translate returned no translation')
  }

  // Google charges ~$20 per 1M characters
  const charCount = text.length
  const cost = (charCount / 1_000_000) * 20

  return { translatedText, provider: 'google', cost }
}

async function translateWithMyMemory(
  text: string,
  sourceLang: string,
  targetLang: string,
): Promise<{ translatedText: string; provider: string; cost: number }> {
  const encoded = encodeURIComponent(text)
  const langpair = `${sourceLang}|${targetLang}`
  const url = `https://api.mymemory.translated.net/get?q=${encoded}&langpair=${langpair}`

  const res = await fetch(url, { method: 'GET' })

  if (!res.ok) {
    const errorBody = await res.text()
    throw new Error(`MyMemory API error ${res.status}: ${errorBody}`)
  }

  const data = await res.json()
  if (data.responseStatus !== 200) {
    throw new Error(`MyMemory API returned status ${data.responseStatus}`)
  }

  const translatedText = data?.responseData?.translatedText
  if (!translatedText) {
    throw new Error('MyMemory returned no translation')
  }

  // MyMemory free tier – no cost
  return { translatedText, provider: 'mymemory', cost: 0 }
}

// ---------------------------------------------------------------------------
// Provider cascade: DeepL -> Azure -> Google -> MyMemory
// DeepL is primary for supported languages (~45% cheaper than Azure)
// Azure handles exotic languages DeepL doesn't support
// Google as secondary fallback, MyMemory as free emergency fallback
// ---------------------------------------------------------------------------

async function translateText(
  text: string,
  sourceLang: string,
  targetLang: string,
): Promise<{ translatedText: string; provider: string; cost: number }> {
  const deeplKey = Deno.env.get('DEEPL_API_KEY')
  const azureKey = Deno.env.get('AZURE_TRANSLATE_KEY')
  const azureRegion = Deno.env.get('AZURE_TRANSLATE_REGION')
  const googleKey = Deno.env.get('GOOGLE_TRANSLATE_KEY')

  const errors: string[] = []

  // 1. Try DeepL first (best quality + cheapest for EU languages)
  if (deeplKey && isDeepLSupported(sourceLang, targetLang)) {
    try {
      return await translateWithDeepL(text, sourceLang, targetLang, deeplKey)
    } catch (err) {
      errors.push(`DeepL: ${(err as Error).message}`)
    }
  }

  // 2. Try Azure (supports 130+ languages including exotic ones)
  if (azureKey && azureRegion) {
    try {
      return await translateWithAzure(text, sourceLang, targetLang, azureKey, azureRegion)
    } catch (err) {
      errors.push(`Azure: ${(err as Error).message}`)
    }
  }

  // 3. Try Google
  if (googleKey) {
    try {
      return await translateWithGoogle(text, sourceLang, targetLang, googleKey)
    } catch (err) {
      errors.push(`Google: ${(err as Error).message}`)
    }
  }

  // 4. Try MyMemory (free fallback)
  try {
    return await translateWithMyMemory(text, sourceLang, targetLang)
  } catch (err) {
    errors.push(`MyMemory: ${(err as Error).message}`)
  }

  throw new Error(`All translation providers failed: ${errors.join('; ')}`)
}

// ---------------------------------------------------------------------------
// Supabase client helpers
// ---------------------------------------------------------------------------

function createServiceClient() {
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  return createClient(supabaseUrl, serviceRoleKey)
}

function createUserClient(authHeader: string) {
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!
  return createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
  })
}

// ---------------------------------------------------------------------------
// Action: process_batch
// ---------------------------------------------------------------------------

async function processBatch(batchSize: number) {
  const supabase = createServiceClient()

  // Fetch queued items
  const { data: queueItems, error: fetchError } = await supabase
    .from('fw_translation_queue')
    .select('*')
    .eq('status', 'queued')
    .order('priority', { ascending: true })
    .order('queued_at', { ascending: true })
    .limit(batchSize)

  if (fetchError) {
    throw new Error(`Failed to fetch queue: ${fetchError.message}`)
  }

  if (!queueItems || queueItems.length === 0) {
    return { processed: 0, message: 'No items in queue' }
  }

  const results = { processed: 0, succeeded: 0, failed: 0, errors: [] as string[] }

  for (const item of queueItems) {
    results.processed++

    // Mark as processing
    await supabase
      .from('fw_translation_queue')
      .update({ status: 'processing' })
      .eq('id', item.id)

    try {
      const { translatedText, provider, cost } = await translateText(
        item.source_text,
        item.source_language,
        item.target_language,
      )

      // 1. Insert into fw_content_translations
      const { error: insertError } = await supabase.from('fw_content_translations').insert({
        content_id: item.content_id,
        source_language: item.source_language,
        target_language: item.target_language,
        source_text: item.source_text,
        translated_text: translatedText,
        provider,
        field_name: item.field_name,
      })

      if (insertError) {
        throw new Error(`Insert translation failed: ${insertError.message}`)
      }

      // 2. Update the content item's JSONB field with the translation
      if (item.content_id && item.content_table && item.field_name) {
        const { data: contentRow, error: contentFetchError } = await supabase
          .from(item.content_table)
          .select(item.field_name)
          .eq('id', item.content_id)
          .single()

        if (!contentFetchError && contentRow) {
          const existingField = contentRow[item.field_name]
          const updatedField =
            typeof existingField === 'object' && existingField !== null
              ? { ...existingField, [item.target_language]: translatedText }
              : { [item.target_language]: translatedText }

          await supabase
            .from(item.content_table)
            .update({ [item.field_name]: updatedField })
            .eq('id', item.content_id)
        }
      }

      // 3. Track cost
      if (cost > 0) {
        await supabase.from('fw_translation_costs').insert({
          queue_id: item.id,
          provider,
          characters: item.source_text.length,
          cost,
          source_language: item.source_language,
          target_language: item.target_language,
        })
      }

      // 4. Mark queue item as completed
      await supabase
        .from('fw_translation_queue')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          provider_used: provider,
        })
        .eq('id', item.id)

      results.succeeded++
    } catch (err) {
      const errorMessage = (err as Error).message
      const newAttempts = (item.attempts || 0) + 1
      const maxAttempts = item.max_attempts || 3
      const newStatus = newAttempts >= maxAttempts ? 'failed' : 'queued'

      await supabase
        .from('fw_translation_queue')
        .update({
          status: newStatus,
          attempts: newAttempts,
          last_error: errorMessage,
        })
        .eq('id', item.id)

      results.failed++
      results.errors.push(`Item ${item.id}: ${errorMessage}`)
    }
  }

  return results
}

// ---------------------------------------------------------------------------
// Action: queue_content
// ---------------------------------------------------------------------------

async function queueContent(
  contentId: string,
  targetLanguages: string[],
  authHeader: string,
) {
  const userClient = createUserClient(authHeader)
  const serviceClient = createServiceClient()

  // Verify the user is authenticated
  const {
    data: { user },
    error: authError,
  } = await userClient.auth.getUser()

  if (authError || !user) {
    throw new Error('Unauthorized')
  }

  // Fetch the content item to get source text and metadata
  const { data: content, error: contentError } = await serviceClient
    .from('fw_contents')
    .select('*')
    .eq('id', contentId)
    .single()

  if (contentError || !content) {
    throw new Error(`Content not found: ${contentError?.message || 'unknown'}`)
  }

  const sourceLang = content.source_language || 'en'
  const fieldsToTranslate = content.translatable_fields || ['title', 'description']
  const insertRows: Record<string, unknown>[] = []

  for (const targetLang of targetLanguages) {
    if (targetLang === sourceLang) continue

    for (const field of fieldsToTranslate) {
      const sourceText = content[field]
      if (!sourceText || typeof sourceText !== 'string') continue

      insertRows.push({
        content_id: contentId,
        content_table: 'fw_contents',
        field_name: field,
        source_language: sourceLang,
        target_language: targetLang,
        source_text: sourceText,
        status: 'queued',
        priority: 0,
        attempts: 0,
        max_attempts: 3,
        queued_at: new Date().toISOString(),
        requested_by: user.id,
      })
    }
  }

  if (insertRows.length === 0) {
    return { queued: 0, message: 'No translatable fields found' }
  }

  const { error: insertError } = await serviceClient
    .from('fw_translation_queue')
    .insert(insertRows)

  if (insertError) {
    throw new Error(`Failed to queue translations: ${insertError.message}`)
  }

  return { queued: insertRows.length, content_id: contentId, target_languages: targetLanguages }
}

// ---------------------------------------------------------------------------
// Main handler
// ---------------------------------------------------------------------------

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Validate auth
    const authHeader = req.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Missing or invalid Authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const body = await req.json()
    const { action } = body

    let result: unknown

    switch (action) {
      case 'process_batch': {
        const batchSize = body.batch_size ?? 10
        result = await processBatch(batchSize)
        break
      }

      case 'queue_content': {
        if (!body.content_id || !Array.isArray(body.target_languages)) {
          return new Response(
            JSON.stringify({ error: 'content_id and target_languages[] are required' }),
            {
              status: 400,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            },
          )
        }
        result = await queueContent(body.content_id, body.target_languages, authHeader)
        break
      }

      default:
        return new Response(
          JSON.stringify({ error: `Unknown action: ${action}` }),
          {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          },
        )
    }

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    const message = (err as Error).message || 'Internal server error'
    const status = message === 'Unauthorized' ? 401 : 500
    return new Response(JSON.stringify({ error: message }), {
      status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
