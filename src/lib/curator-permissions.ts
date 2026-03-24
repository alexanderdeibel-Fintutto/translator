// Fintutto World — Curator Permissions System
// Client-side permission checking for the admin UI
// Mirrors the DB-level fw_curator_roles table and fw_check_permission() function

import { supabase } from '@/lib/supabase'

// ── Types ───────────────────────────────────────────────────────────

export type CuratorRole = 'viewer' | 'editor' | 'publisher' | 'manager' | 'admin'

export type Permission =
  | 'view'
  | 'create'
  | 'edit'
  | 'delete'
  | 'publish'
  | 'manage_workflow'
  | 'manage_users'
  | 'import'
  | 'export'
  | 'use_ai'

export interface CuratorRoleRecord {
  id: string
  user_id: string
  museum_id: string | null
  role: CuratorRole
  can_create: boolean
  can_edit: boolean
  can_delete: boolean
  can_publish: boolean
  can_manage_workflow: boolean
  can_manage_users: boolean
  can_import: boolean
  can_export: boolean
  can_use_ai: boolean
  allowed_domains: string[] | null
  allowed_content_types: string[] | null
}

// ── Role → Permission defaults ──────────────────────────────────────

export const ROLE_DEFAULTS: Record<CuratorRole, Record<Permission, boolean>> = {
  viewer: {
    view: true,
    create: false,
    edit: false,
    delete: false,
    publish: false,
    manage_workflow: false,
    manage_users: false,
    import: false,
    export: false,
    use_ai: false,
  },
  editor: {
    view: true,
    create: true,
    edit: true,
    delete: false,
    publish: false,
    manage_workflow: false,
    manage_users: false,
    import: true,
    export: true,
    use_ai: true,
  },
  publisher: {
    view: true,
    create: true,
    edit: true,
    delete: false,
    publish: true,
    manage_workflow: false,
    manage_users: false,
    import: true,
    export: true,
    use_ai: true,
  },
  manager: {
    view: true,
    create: true,
    edit: true,
    delete: true,
    publish: true,
    manage_workflow: true,
    manage_users: false,
    import: true,
    export: true,
    use_ai: true,
  },
  admin: {
    view: true,
    create: true,
    edit: true,
    delete: true,
    publish: true,
    manage_workflow: true,
    manage_users: true,
    import: true,
    export: true,
    use_ai: true,
  },
}

// ── Role hierarchy (higher = more privileges) ───────────────────────

export const ROLE_HIERARCHY: CuratorRole[] = ['viewer', 'editor', 'publisher', 'manager', 'admin']

export function roleLevel(role: CuratorRole): number {
  return ROLE_HIERARCHY.indexOf(role)
}

export function isRoleAtLeast(userRole: CuratorRole, requiredRole: CuratorRole): boolean {
  return roleLevel(userRole) >= roleLevel(requiredRole)
}

// ── Permission checking ─────────────────────────────────────────────

let cachedRole: CuratorRoleRecord | null = null
let cacheMuseumId: string | null = null

/**
 * Load the current user's curator role for a given museum.
 * Caches the result to avoid repeated DB queries.
 */
export async function loadCuratorRole(museumId?: string): Promise<CuratorRoleRecord | null> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  // Check cache
  if (cachedRole && cacheMuseumId === (museumId || null)) {
    return cachedRole
  }

  // Check platform admin first
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('internal_role')
    .eq('id', user.id)
    .single()

  if (profile?.internal_role === 'admin' || profile?.internal_role === 'super_admin') {
    const adminRole: CuratorRoleRecord = {
      id: 'platform-admin',
      user_id: user.id,
      museum_id: null,
      role: 'admin',
      can_create: true,
      can_edit: true,
      can_delete: true,
      can_publish: true,
      can_manage_workflow: true,
      can_manage_users: true,
      can_import: true,
      can_export: true,
      can_use_ai: true,
      allowed_domains: null,
      allowed_content_types: null,
    }
    cachedRole = adminRole
    cacheMuseumId = museumId || null
    return adminRole
  }

  // Load museum-specific role
  let query = supabase
    .from('fw_curator_roles')
    .select('*')
    .eq('user_id', user.id)

  if (museumId) {
    query = query.or(`museum_id.eq.${museumId},museum_id.is.null`)
  }

  const { data } = await query
    .order('museum_id', { ascending: true, nullsFirst: false })
    .limit(1)

  const role = data?.[0] as CuratorRoleRecord | undefined
  cachedRole = role || null
  cacheMuseumId = museumId || null
  return cachedRole
}

/**
 * Check if the current user has a specific permission.
 */
export async function hasPermission(permission: Permission, museumId?: string): Promise<boolean> {
  const role = await loadCuratorRole(museumId)
  if (!role) return false
  return checkPermission(role, permission)
}

/**
 * Synchronous permission check against an already-loaded role.
 */
export function checkPermission(role: CuratorRoleRecord, permission: Permission): boolean {
  if (role.role === 'admin') return true
  if (permission === 'view') return true

  const permMap: Record<Permission, keyof CuratorRoleRecord> = {
    view: 'can_edit', // always true
    create: 'can_create',
    edit: 'can_edit',
    delete: 'can_delete',
    publish: 'can_publish',
    manage_workflow: 'can_manage_workflow',
    manage_users: 'can_manage_users',
    import: 'can_import',
    export: 'can_export',
    use_ai: 'can_use_ai',
  }

  return Boolean(role[permMap[permission]])
}

/**
 * Check if a domain is allowed for this role.
 */
export function isDomainAllowed(role: CuratorRoleRecord, domain: string): boolean {
  if (!role.allowed_domains) return true // null = all allowed
  return role.allowed_domains.includes(domain)
}

/**
 * Check if a content type is allowed for this role.
 */
export function isContentTypeAllowed(role: CuratorRoleRecord, contentType: string): boolean {
  if (!role.allowed_content_types) return true
  return role.allowed_content_types.includes(contentType)
}

/**
 * Clear the cached role (call on logout or museum switch).
 */
export function clearCuratorRoleCache(): void {
  cachedRole = null
  cacheMuseumId = null
}

// ── Role management ─────────────────────────────────────────────────

export async function assignCuratorRole(
  userId: string,
  museumId: string | null,
  role: CuratorRole,
): Promise<{ error: string | null }> {
  const { error } = await supabase.from('fw_curator_roles').upsert({
    user_id: userId,
    museum_id: museumId,
    role,
  }, { onConflict: 'user_id,museum_id' })

  if (error) return { error: error.message }
  return { error: null }
}

export async function removeCuratorRole(
  userId: string,
  museumId: string | null,
): Promise<{ error: string | null }> {
  let query = supabase
    .from('fw_curator_roles')
    .delete()
    .eq('user_id', userId)

  if (museumId) {
    query = query.eq('museum_id', museumId)
  } else {
    query = query.is('museum_id', null)
  }

  const { error } = await query
  if (error) return { error: error.message }
  return { error: null }
}

export async function listCuratorRoles(museumId?: string): Promise<CuratorRoleRecord[]> {
  let query = supabase
    .from('fw_curator_roles')
    .select('*')
    .order('role', { ascending: true })

  if (museumId) {
    query = query.eq('museum_id', museumId)
  }

  const { data } = await query
  return (data || []) as CuratorRoleRecord[]
}

// ── Role display labels ─────────────────────────────────────────────

export const ROLE_LABELS: Record<CuratorRole, { de: string; en: string }> = {
  viewer: { de: 'Betrachter', en: 'Viewer' },
  editor: { de: 'Bearbeiter', en: 'Editor' },
  publisher: { de: 'Redakteur', en: 'Publisher' },
  manager: { de: 'Manager', en: 'Manager' },
  admin: { de: 'Administrator', en: 'Admin' },
}

export const PERMISSION_LABELS: Record<Permission, { de: string; en: string }> = {
  view: { de: 'Anzeigen', en: 'View' },
  create: { de: 'Erstellen', en: 'Create' },
  edit: { de: 'Bearbeiten', en: 'Edit' },
  delete: { de: 'Loeschen', en: 'Delete' },
  publish: { de: 'Veroeffentlichen', en: 'Publish' },
  manage_workflow: { de: 'Workflow verwalten', en: 'Manage Workflow' },
  manage_users: { de: 'Benutzer verwalten', en: 'Manage Users' },
  import: { de: 'Importieren', en: 'Import' },
  export: { de: 'Exportieren', en: 'Export' },
  use_ai: { de: 'KI nutzen', en: 'Use AI' },
}
