// Supabase Edge Function: Fintutto World Content API
// REST API for content providers to ingest POIs into the Fintutto World platform
// Handles: CRUD for content items, CSV bulk import, translation queuing
// Deploy with: supabase functions deploy fintutto-world-content-api

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// ============================================================================
// Types
// ============================================================================

interface ContentItem {
  name: Record<string, string>       // multilingual JSONB, e.g. { "de": "Schloss", "en": "Castle" }
  content_type: string
  domain: string
  parent_type: string
  parent_id: string
  lat?: number
  lng?: number
  description?: Record<string, string>
  short_description?: Record<string, string>
  // Content layers
  content_brief?: Record<string, string>
  content_standard?: Record<string, string>
  content_detailed?: Record<string, string>
  content_children?: Record<string, string>
  content_youth?: Record<string, string>
  content_fun_facts?: Record<string, string>
  content_historical?: Record<string, string>
  content_technique?: Record<string, string>
  // Additional fields
  domain_data?: Record<string, unknown>
  tags?: string[]
  cover_image_url?: string
  opening_hours?: Record<string, unknown>
  contact?: Record<string, unknown>
  is_free?: boolean
  admission_price?: Record<string, unknown>
}

interface ContentApiRequest {
  action: 'create_content' | 'update_content' | 'delete_content' | 'list_content' | 'import_csv' | 'get_translations'
  // create_content
  items?: ContentItem[]
  auto_translate?: boolean
  target_languages?: string[]
  // update_content
  content_id?: string
  updates?: Partial<ContentItem>
  // delete_content (uses content_id)
  // list_content
  parent_type?: string
  parent_id?: string
  page?: number
  per_page?: number
  status?: string
  content_type?: string
  // import_csv
  csv_data?: string
  // get_translations (uses content_id)
}

// ============================================================================
// Helper Functions
// ============================================================================

function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')   // strip diacritics
    .replace(/[^\w\s-]/g, '')          // remove non-word chars
    .replace(/[\s_]+/g, '-')           // spaces/underscores to hyphens
    .replace(/-+/g, '-')              // collapse multiple hyphens
    .replace(/^-+|-+$/g, '')          // trim leading/trailing hyphens
    || 'untitled'
}

function validateContentItem(item: any): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  if (!item.name || typeof item.name !== 'object' || Object.keys(item.name).length === 0) {
    errors.push('name is required and must be a non-empty multilingual object (e.g. { "de": "Name" })')
  }
  if (!item.content_type || typeof item.content_type !== 'string') {
    errors.push('content_type is required (e.g. artwork, landmark, restaurant)')
  }
  if (!item.domain || typeof item.domain !== 'string') {
    errors.push('domain is required (e.g. artguide, cityguide, regionguide)')
  }
  if (!item.parent_type || typeof item.parent_type !== 'string') {
    errors.push('parent_type is required (e.g. museum, city, region)')
  }
  if (!item.parent_id || typeof item.parent_id !== 'string') {
    errors.push('parent_id is required (UUID of the parent entity)')
  }
  if (item.lat !== undefined && (typeof item.lat !== 'number' || item.lat < -90 || item.lat > 90)) {
    errors.push('lat must be a number between -90 and 90')
  }
  if (item.lng !== undefined && (typeof item.lng !== 'number' || item.lng < -180 || item.lng > 180)) {
    errors.push('lng must be a number between -180 and 180')
  }

  return { valid: errors.length === 0, errors }
}

async function checkOwnership(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  parentType: string,
  parentId: string,
): Promise<boolean> {
  // Check based on parent type — mirrors the RLS policies in 020_unified_content_model.sql
  if (parentType === 'museum') {
    const { data } = await supabase
      .from('ag_museum_users')
      .select('id')
      .eq('museum_id', parentId)
      .eq('user_id', userId)
      .eq('is_active', true)
      .maybeSingle()
    if (data) return true
  }

  if (parentType === 'city') {
    const { data } = await supabase
      .from('cg_staff')
      .select('id')
      .eq('city_id', parentId)
      .eq('user_id', userId)
      .in('role', ['admin', 'editor'])
      .maybeSingle()
    if (data) return true
  }

  if (parentType === 'region') {
    const { data } = await supabase
      .from('cg_staff')
      .select('id')
      .eq('region_id', parentId)
      .eq('user_id', userId)
      .in('role', ['admin', 'editor'])
      .maybeSingle()
    if (data) return true
  }

  // System admin can manage anything
  const { data: profile } = await supabase
    .from('gt_users')
    .select('role')
    .eq('id', userId)
    .maybeSingle()

  if (profile?.role === 'admin') return true

  return false
}

// ============================================================================
// Response Helpers
// ============================================================================

function jsonResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

function errorResponse(error: string, status = 400) {
  return jsonResponse({ error }, status)
}

// ============================================================================
// CSV Parser
// ============================================================================

function parseCSV(csvData: string): Record<string, string>[] {
  const lines = csvData.trim().split('\n')
  if (lines.length < 2) return []

  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''))
  const rows: Record<string, string>[] = []

  for (let i = 1; i < lines.length; i++) {
    const values: string[] = []
    let current = ''
    let inQuotes = false

    for (const char of lines[i]) {
      if (char === '"') {
        inQuotes = !inQuotes
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim())
        current = ''
      } else {
        current += char
      }
    }
    values.push(current.trim())

    if (values.length === headers.length) {
      const row: Record<string, string> = {}
      headers.forEach((h, idx) => {
        row[h] = values[idx]
      })
      rows.push(row)
    }
  }

  return rows
}

function csvRowToContentItem(row: Record<string, string>, parentType: string, parentId: string): Partial<ContentItem> {
  // Map CSV columns to ContentItem fields
  // Supports both flat names (name_de, name_en) and single "name" column
  const name: Record<string, string> = {}
  const description: Record<string, string> = {}
  const shortDescription: Record<string, string> = {}
  const contentBrief: Record<string, string> = {}
  const contentStandard: Record<string, string> = {}

  for (const [key, value] of Object.entries(row)) {
    if (!value) continue
    const lk = key.toLowerCase()

    // Multilingual fields: name_de, name_en, description_de, etc.
    const langMatch = lk.match(/^(.+)_([a-z]{2})$/)
    if (langMatch) {
      const [, field, lang] = langMatch
      if (field === 'name') name[lang] = value
      else if (field === 'description') description[lang] = value
      else if (field === 'short_description') shortDescription[lang] = value
      else if (field === 'content_brief') contentBrief[lang] = value
      else if (field === 'content_standard') contentStandard[lang] = value
    }
  }

  // Fallback: single "name" column -> use as "de"
  if (Object.keys(name).length === 0 && row['name']) {
    name['de'] = row['name']
  }

  const item: Partial<ContentItem> = {
    name,
    content_type: row['content_type'] || row['type'] || 'other',
    domain: row['domain'] || 'cityguide',
    parent_type: parentType,
    parent_id: parentId,
  }

  if (Object.keys(description).length > 0) item.description = description
  if (Object.keys(shortDescription).length > 0) item.short_description = shortDescription
  if (Object.keys(contentBrief).length > 0) item.content_brief = contentBrief
  if (Object.keys(contentStandard).length > 0) item.content_standard = contentStandard

  if (row['lat']) item.lat = parseFloat(row['lat'])
  if (row['lng'] || row['lon']) item.lng = parseFloat(row['lng'] || row['lon'])
  if (row['cover_image_url']) item.cover_image_url = row['cover_image_url']
  if (row['tags']) item.tags = row['tags'].split(';').map(t => t.trim()).filter(Boolean)
  if (row['is_free'] !== undefined) item.is_free = row['is_free'] === 'true' || row['is_free'] === '1'

  return item
}

// ============================================================================
// Action Handlers
// ============================================================================

async function handleCreateContent(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  body: ContentApiRequest,
) {
  const { items, auto_translate, target_languages } = body

  if (!items || !Array.isArray(items) || items.length === 0) {
    return errorResponse('items array is required and must not be empty')
  }

  if (items.length > 500) {
    return errorResponse('Maximum 500 items per request')
  }

  // Validate all items first
  const validationErrors: { index: number; errors: string[] }[] = []
  for (let i = 0; i < items.length; i++) {
    const result = validateContentItem(items[i])
    if (!result.valid) {
      validationErrors.push({ index: i, errors: result.errors })
    }
  }

  if (validationErrors.length > 0) {
    return errorResponse(`Validation failed for ${validationErrors.length} item(s): ${JSON.stringify(validationErrors)}`)
  }

  // Check ownership for each unique parent
  const parentKeys = new Set(items.map(i => `${i.parent_type}:${i.parent_id}`))
  for (const key of parentKeys) {
    const [pType, pId] = key.split(':')
    const hasAccess = await checkOwnership(supabase, userId, pType, pId)
    if (!hasAccess) {
      return errorResponse(`No permission to create content under ${pType}/${pId}`, 403)
    }
  }

  // Build insert rows
  const rows = items.map(item => {
    // Get the first available name for slug generation
    const nameValues = Object.values(item.name)
    const slugBase = nameValues[0] || 'untitled'
    const slug = slugify(slugBase) + '-' + crypto.randomUUID().slice(0, 8)

    return {
      name: item.name,
      slug,
      content_type: item.content_type,
      domain: item.domain,
      parent_type: item.parent_type,
      parent_id: item.parent_id,
      lat: item.lat ?? null,
      lng: item.lng ?? null,
      description: item.description ?? {},
      short_description: item.short_description ?? {},
      content_brief: item.content_brief ?? {},
      content_standard: item.content_standard ?? {},
      content_detailed: item.content_detailed ?? {},
      content_children: item.content_children ?? {},
      content_youth: item.content_youth ?? {},
      content_fun_facts: item.content_fun_facts ?? {},
      content_historical: item.content_historical ?? {},
      content_technique: item.content_technique ?? {},
      domain_data: item.domain_data ?? {},
      tags: item.tags ?? [],
      cover_image_url: item.cover_image_url ?? null,
      opening_hours: item.opening_hours ?? {},
      contact: item.contact ?? {},
      is_free: item.is_free ?? true,
      admission_price: item.admission_price ?? {},
      status: 'draft',
      created_by: userId,
    }
  })

  const { data, error } = await supabase
    .from('fw_content_items')
    .insert(rows)
    .select('id, name, slug, content_type, status')

  if (error) {
    console.error('Insert error:', error)
    return errorResponse(`Failed to create content: ${error.message}`, 500)
  }

  // Queue translations if requested
  let translationsQueued = 0
  if (auto_translate && target_languages && target_languages.length > 0 && data) {
    for (const item of data) {
      const { data: queueResult } = await supabase.rpc('fw_queue_translations', {
        p_content_id: item.id,
        p_target_languages: target_languages,
        p_priority: 5,
      })
      if (typeof queueResult === 'number') {
        translationsQueued += queueResult
      }
    }
  }

  return jsonResponse({
    created: data?.length ?? 0,
    items: data ?? [],
    translations_queued: translationsQueued,
  }, 201)
}

async function handleUpdateContent(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  body: ContentApiRequest,
) {
  const { content_id, updates } = body

  if (!content_id) {
    return errorResponse('content_id is required')
  }
  if (!updates || typeof updates !== 'object' || Object.keys(updates).length === 0) {
    return errorResponse('updates object is required and must not be empty')
  }

  // Fetch current item to check ownership
  const { data: existing, error: fetchError } = await supabase
    .from('fw_content_items')
    .select('id, parent_type, parent_id')
    .eq('id', content_id)
    .maybeSingle()

  if (fetchError || !existing) {
    return errorResponse('Content item not found', 404)
  }

  const hasAccess = await checkOwnership(supabase, userId, existing.parent_type, existing.parent_id)
  if (!hasAccess) {
    return errorResponse('No permission to update this content item', 403)
  }

  // Build update object — only allow safe fields
  const allowedFields = [
    'name', 'description', 'short_description',
    'content_brief', 'content_standard', 'content_detailed',
    'content_children', 'content_youth', 'content_fun_facts',
    'content_historical', 'content_technique',
    'content_type', 'domain', 'lat', 'lng',
    'domain_data', 'tags', 'cover_image_url',
    'opening_hours', 'contact', 'is_free', 'admission_price',
    'status', 'is_featured', 'is_highlight', 'sort_order',
  ]

  const updateData: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(updates)) {
    if (allowedFields.includes(key)) {
      updateData[key] = value
    }
  }

  // Regenerate slug if name changed
  if (updateData.name && typeof updateData.name === 'object') {
    const nameValues = Object.values(updateData.name as Record<string, string>)
    if (nameValues.length > 0) {
      updateData.slug = slugify(nameValues[0]) + '-' + crypto.randomUUID().slice(0, 8)
    }
  }

  if (Object.keys(updateData).length === 0) {
    return errorResponse('No valid fields to update')
  }

  const { data, error } = await supabase
    .from('fw_content_items')
    .update(updateData)
    .eq('id', content_id)
    .select('id, name, slug, content_type, status, updated_at')
    .single()

  if (error) {
    console.error('Update error:', error)
    return errorResponse(`Failed to update content: ${error.message}`, 500)
  }

  return jsonResponse({ updated: data })
}

async function handleDeleteContent(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  body: ContentApiRequest,
) {
  const { content_id } = body

  if (!content_id) {
    return errorResponse('content_id is required')
  }

  // Fetch current item to check ownership
  const { data: existing, error: fetchError } = await supabase
    .from('fw_content_items')
    .select('id, parent_type, parent_id')
    .eq('id', content_id)
    .maybeSingle()

  if (fetchError || !existing) {
    return errorResponse('Content item not found', 404)
  }

  const hasAccess = await checkOwnership(supabase, userId, existing.parent_type, existing.parent_id)
  if (!hasAccess) {
    return errorResponse('No permission to delete this content item', 403)
  }

  // Soft delete: set status to 'archived'
  const { error } = await supabase
    .from('fw_content_items')
    .update({ status: 'archived' })
    .eq('id', content_id)

  if (error) {
    console.error('Delete error:', error)
    return errorResponse(`Failed to archive content: ${error.message}`, 500)
  }

  return jsonResponse({ deleted: true, content_id })
}

async function handleListContent(
  supabase: ReturnType<typeof createClient>,
  _userId: string,
  body: ContentApiRequest,
) {
  const {
    parent_type,
    parent_id,
    page = 1,
    per_page = 20,
    status,
    content_type,
  } = body

  if (!parent_type || !parent_id) {
    return errorResponse('parent_type and parent_id are required')
  }

  const limit = Math.min(Math.max(per_page, 1), 100)
  const offset = (Math.max(page, 1) - 1) * limit

  let query = supabase
    .from('fw_content_items')
    .select('*', { count: 'exact' })
    .eq('parent_type', parent_type)
    .eq('parent_id', parent_id)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (status) {
    query = query.eq('status', status)
  } else {
    // Exclude archived by default
    query = query.neq('status', 'archived')
  }

  if (content_type) {
    query = query.eq('content_type', content_type)
  }

  const { data, error, count } = await query

  if (error) {
    console.error('List error:', error)
    return errorResponse(`Failed to list content: ${error.message}`, 500)
  }

  return jsonResponse({
    items: data ?? [],
    total: count ?? 0,
    page,
    per_page: limit,
    total_pages: Math.ceil((count ?? 0) / limit),
  })
}

async function handleImportCSV(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  body: ContentApiRequest,
) {
  const { parent_type, parent_id, csv_data, auto_translate, target_languages } = body

  if (!parent_type || !parent_id) {
    return errorResponse('parent_type and parent_id are required')
  }
  if (!csv_data || typeof csv_data !== 'string') {
    return errorResponse('csv_data is required (string with CSV content)')
  }

  // Check ownership
  const hasAccess = await checkOwnership(supabase, userId, parent_type, parent_id)
  if (!hasAccess) {
    return errorResponse(`No permission to import content under ${parent_type}/${parent_id}`, 403)
  }

  // Parse CSV
  const rows = parseCSV(csv_data)
  if (rows.length === 0) {
    return errorResponse('CSV contains no data rows')
  }

  // Create import record
  const { data: importRecord, error: importError } = await supabase
    .from('fw_content_imports')
    .insert({
      parent_type,
      parent_id,
      source: 'csv',
      status: 'processing',
      total_items: rows.length,
      auto_translate: auto_translate ?? false,
      target_languages: target_languages ?? ['de', 'en'],
      created_by: userId,
      started_at: new Date().toISOString(),
    })
    .select('id')
    .single()

  if (importError || !importRecord) {
    console.error('Import record creation failed:', importError)
    return errorResponse('Failed to create import record', 500)
  }

  // Process rows
  let importedCount = 0
  let skippedCount = 0
  let failedCount = 0
  const errorLog: { row: number; error: string }[] = []
  const createdIds: string[] = []

  for (let i = 0; i < rows.length; i++) {
    const item = csvRowToContentItem(rows[i], parent_type, parent_id)

    // Validate minimum fields
    if (!item.name || Object.keys(item.name).length === 0) {
      skippedCount++
      errorLog.push({ row: i + 2, error: 'Missing name' })
      continue
    }

    const nameValues = Object.values(item.name)
    const slug = slugify(nameValues[0]) + '-' + crypto.randomUUID().slice(0, 8)

    const insertRow = {
      name: item.name,
      slug,
      content_type: item.content_type || 'other',
      domain: item.domain || 'cityguide',
      parent_type,
      parent_id,
      lat: item.lat ?? null,
      lng: item.lng ?? null,
      description: item.description ?? {},
      short_description: item.short_description ?? {},
      content_brief: item.content_brief ?? {},
      content_standard: item.content_standard ?? {},
      cover_image_url: item.cover_image_url ?? null,
      tags: item.tags ?? [],
      is_free: item.is_free ?? true,
      status: 'draft',
      created_by: userId,
    }

    const { data: inserted, error: insertErr } = await supabase
      .from('fw_content_items')
      .insert(insertRow)
      .select('id')
      .single()

    if (insertErr) {
      failedCount++
      errorLog.push({ row: i + 2, error: insertErr.message })
    } else if (inserted) {
      importedCount++
      createdIds.push(inserted.id)
    }
  }

  // Queue translations if requested
  let translationsQueued = 0
  if (auto_translate && target_languages && target_languages.length > 0) {
    for (const id of createdIds) {
      const { data: queueResult } = await supabase.rpc('fw_queue_translations', {
        p_content_id: id,
        p_target_languages: target_languages,
        p_priority: 7,
      })
      if (typeof queueResult === 'number') {
        translationsQueued += queueResult
      }
    }
  }

  // Update import record
  await supabase
    .from('fw_content_imports')
    .update({
      status: failedCount === rows.length ? 'failed' : (failedCount > 0 ? 'partial' : 'completed'),
      imported_items: importedCount,
      skipped_items: skippedCount,
      failed_items: failedCount,
      error_log: errorLog,
      translation_status: translationsQueued > 0 ? 'in_progress' : 'pending',
      completed_at: new Date().toISOString(),
    })
    .eq('id', importRecord.id)

  return jsonResponse({
    import_id: importRecord.id,
    total_rows: rows.length,
    imported: importedCount,
    skipped: skippedCount,
    failed: failedCount,
    translations_queued: translationsQueued,
    errors: errorLog.length > 0 ? errorLog : undefined,
  }, 201)
}

async function handleGetTranslations(
  supabase: ReturnType<typeof createClient>,
  _userId: string,
  body: ContentApiRequest,
) {
  const { content_id } = body

  if (!content_id) {
    return errorResponse('content_id is required')
  }

  const { data, error } = await supabase
    .from('fw_content_translations')
    .select('*')
    .eq('content_id', content_id)
    .order('field_name')
    .order('target_language')

  if (error) {
    console.error('Translations fetch error:', error)
    return errorResponse(`Failed to fetch translations: ${error.message}`, 500)
  }

  // Also get pending queue items
  const { data: queued } = await supabase
    .from('fw_translation_queue')
    .select('field_name, target_language, status, priority, attempts, queued_at')
    .eq('content_id', content_id)
    .in('status', ['queued', 'processing'])

  return jsonResponse({
    content_id,
    translations: data ?? [],
    pending: queued ?? [],
  })
}

// ============================================================================
// Main Handler
// ============================================================================

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Only accept POST
    if (req.method !== 'POST') {
      return errorResponse('Method not allowed. Use POST with an action field.', 405)
    }

    // Auth: validate Bearer token via Supabase
    const authHeader = req.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return errorResponse('Missing or invalid Authorization header. Use Bearer <token>.', 401)
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    )

    // Validate the user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return errorResponse('Invalid or expired token', 401)
    }

    // Check if user has an appropriate role/subscription
    const { data: profile } = await supabase
      .from('gt_users')
      .select('role, tier_id')
      .eq('id', user.id)
      .maybeSingle()

    if (!profile) {
      return errorResponse('User profile not found', 403)
    }

    // Only allow users with content management roles or paid tier
    const allowedRoles = ['admin', 'editor', 'content_manager', 'user']
    if (!allowedRoles.includes(profile.role)) {
      return errorResponse('Insufficient permissions. Content API requires an appropriate role.', 403)
    }

    // Parse request body
    const body: ContentApiRequest = await req.json()

    if (!body.action) {
      return errorResponse('action field is required')
    }

    // Route to handler
    switch (body.action) {
      case 'create_content':
        return await handleCreateContent(supabase, user.id, body)
      case 'update_content':
        return await handleUpdateContent(supabase, user.id, body)
      case 'delete_content':
        return await handleDeleteContent(supabase, user.id, body)
      case 'list_content':
        return await handleListContent(supabase, user.id, body)
      case 'import_csv':
        return await handleImportCSV(supabase, user.id, body)
      case 'get_translations':
        return await handleGetTranslations(supabase, user.id, body)
      default:
        return errorResponse(`Unknown action: ${body.action}`)
    }
  } catch (err) {
    console.error('Content API error:', err)
    return errorResponse('Internal server error', 500)
  }
})
