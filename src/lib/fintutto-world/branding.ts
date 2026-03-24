// Fintutto World — Multi-Tenant Branding
// Loads custom branding (colors, logo, fonts) per museum/city/region
// Applies CSS custom properties to the document root

import { supabase } from '../supabase'

export interface BrandingConfig {
  entityId: string
  entityType: 'museum' | 'city' | 'region' | 'cruise' | 'event'
  // Colors
  primaryColor: string       // Main accent color
  primaryForeground: string  // Text on primary
  backgroundColor: string    // Page background
  foregroundColor: string    // Main text color
  mutedColor: string         // Muted background
  accentColor: string        // Secondary accent
  // Identity
  logoUrl: string | null
  logoWidth: number          // px
  faviconUrl: string | null
  appName: string
  // Typography
  fontFamily: string | null  // Google Font name
  fontHeading: string | null // Heading font (optional)
  // Layout
  borderRadius: number       // px, for cards/buttons
  // PWA
  themeColor: string
}

const DEFAULT_BRANDING: BrandingConfig = {
  entityId: '',
  entityType: 'museum',
  primaryColor: '221 83% 53%',       // hsl blue
  primaryForeground: '0 0% 100%',
  backgroundColor: '0 0% 100%',
  foregroundColor: '222 84% 5%',
  mutedColor: '210 40% 96%',
  accentColor: '210 40% 96%',
  logoUrl: null,
  logoWidth: 120,
  faviconUrl: null,
  appName: 'Fintutto',
  fontFamily: null,
  fontHeading: null,
  borderRadius: 8,
  themeColor: '#0369a1',
}

const BRANDING_CACHE_KEY = 'fw_branding_config'

/** Load branding config for an entity (museum, city, etc.) */
export async function loadBranding(entityType: string, entityId: string): Promise<BrandingConfig> {
  // Try cache first
  const cached = getCachedBranding(entityId)
  if (cached) {
    applyBranding(cached)
    return cached
  }

  try {
    // For museums, check ag_museums.custom_branding
    if (entityType === 'museum') {
      const { data } = await supabase
        .from('ag_museums')
        .select('name, custom_branding')
        .eq('id', entityId)
        .single()

      if (data?.custom_branding) {
        const config = parseBrandingData(data.custom_branding as Record<string, unknown>, entityId, entityType, data.name)
        cacheBranding(config)
        applyBranding(config)
        return config
      }
    }

    // For other entities, check fw_content_items parent metadata
    // (future: dedicated branding table)
  } catch {
    // offline
  }

  return DEFAULT_BRANDING
}

/** Apply branding config to the document via CSS custom properties */
export function applyBranding(config: BrandingConfig): void {
  const root = document.documentElement

  root.style.setProperty('--primary', config.primaryColor)
  root.style.setProperty('--primary-foreground', config.primaryForeground)
  root.style.setProperty('--background', config.backgroundColor)
  root.style.setProperty('--foreground', config.foregroundColor)
  root.style.setProperty('--muted', config.mutedColor)
  root.style.setProperty('--accent', config.accentColor)
  root.style.setProperty('--radius', `${config.borderRadius}px`)

  // Load custom font if specified
  if (config.fontFamily && !document.querySelector(`link[data-font="${config.fontFamily}"]`)) {
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(config.fontFamily)}:wght@400;500;600;700&display=swap`
    link.setAttribute('data-font', config.fontFamily)
    document.head.appendChild(link)
    root.style.setProperty('--font-sans', `"${config.fontFamily}", system-ui, sans-serif`)
  }

  if (config.fontHeading) {
    if (!document.querySelector(`link[data-font="${config.fontHeading}"]`)) {
      const link = document.createElement('link')
      link.rel = 'stylesheet'
      link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(config.fontHeading)}:wght@600;700;800&display=swap`
      link.setAttribute('data-font', config.fontHeading)
      document.head.appendChild(link)
    }
  }

  // Update meta theme-color
  const metaTheme = document.querySelector('meta[name="theme-color"]')
  if (metaTheme) {
    metaTheme.setAttribute('content', config.themeColor)
  }

  // Update page title
  if (config.appName) {
    document.title = config.appName
  }

  // Update favicon
  if (config.faviconUrl) {
    const favicon = document.querySelector('link[rel="icon"]') as HTMLLinkElement
    if (favicon) favicon.href = config.faviconUrl
  }
}

/** Reset branding to defaults */
export function resetBranding(): void {
  const root = document.documentElement
  root.style.removeProperty('--primary')
  root.style.removeProperty('--primary-foreground')
  root.style.removeProperty('--background')
  root.style.removeProperty('--foreground')
  root.style.removeProperty('--muted')
  root.style.removeProperty('--accent')
  root.style.removeProperty('--radius')
  root.style.removeProperty('--font-sans')
  document.title = 'Fintutto Translator'
}

// ── Helpers ──────────────────────────────────────────────────────────────

function parseBrandingData(
  raw: Record<string, unknown>,
  entityId: string,
  entityType: string,
  entityName: string,
): BrandingConfig {
  return {
    entityId,
    entityType: entityType as BrandingConfig['entityType'],
    primaryColor: (raw.primary_color as string) || DEFAULT_BRANDING.primaryColor,
    primaryForeground: (raw.primary_foreground as string) || DEFAULT_BRANDING.primaryForeground,
    backgroundColor: (raw.background_color as string) || DEFAULT_BRANDING.backgroundColor,
    foregroundColor: (raw.foreground_color as string) || DEFAULT_BRANDING.foregroundColor,
    mutedColor: (raw.muted_color as string) || DEFAULT_BRANDING.mutedColor,
    accentColor: (raw.accent_color as string) || DEFAULT_BRANDING.accentColor,
    logoUrl: (raw.logo_url as string) || null,
    logoWidth: (raw.logo_width as number) || 120,
    faviconUrl: (raw.favicon_url as string) || null,
    appName: (raw.app_name as string) || entityName || 'Fintutto',
    fontFamily: (raw.font_family as string) || null,
    fontHeading: (raw.font_heading as string) || null,
    borderRadius: (raw.border_radius as number) ?? 8,
    themeColor: (raw.theme_color as string) || '#0369a1',
  }
}

function cacheBranding(config: BrandingConfig): void {
  try {
    localStorage.setItem(`${BRANDING_CACHE_KEY}_${config.entityId}`, JSON.stringify(config))
  } catch { /* */ }
}

function getCachedBranding(entityId: string): BrandingConfig | null {
  try {
    const raw = localStorage.getItem(`${BRANDING_CACHE_KEY}_${entityId}`)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}
