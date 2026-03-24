#!/usr/bin/env tsx
/**
 * White-Label Build Pipeline for Fintutto Art Guide
 *
 * Builds a museum-specific branded app variant from the artguide-whitelabel base.
 * Reads museum config from a JSON file or Supabase, applies branding (colors, logo,
 * app name, splash screen), then builds via Vite + Capacitor.
 *
 * Usage:
 *   pnpm tsx scripts/build-whitelabel.ts --museum kunsthalle-berlin
 *   pnpm tsx scripts/build-whitelabel.ts --config ./museums/kunsthalle-berlin.json
 *   pnpm tsx scripts/build-whitelabel.ts --museum kunsthalle-berlin --platform ios
 *   pnpm tsx scripts/build-whitelabel.ts --museum kunsthalle-berlin --platform android
 *   pnpm tsx scripts/build-whitelabel.ts --museum kunsthalle-berlin --platform web
 */

import { execSync } from 'child_process'
import fs from 'fs'
import path from 'path'

// ============================================================================
// Types
// ============================================================================

interface MuseumBranding {
  slug: string
  name: string
  appId: string              // e.g. "com.kunsthalle.berlin.guide"
  appName: string            // e.g. "Kunsthalle Berlin Guide"
  primaryColor: string       // hex
  secondaryColor: string     // hex
  accentColor: string        // hex
  backgroundColor: string    // hex
  textColor: string          // hex
  logoUrl: string            // URL to museum logo
  splashColor: string        // hex for splash screen background
  splashLogoUrl: string      // URL to splash logo (centered)
  iconUrl: string            // URL to app icon (1024x1024)
  statusBarStyle: 'LIGHT' | 'DARK'
  iosScheme: string          // e.g. "kunsthalleberlin"
  poweredByVisible: boolean  // show "powered by Fintutto Art Guide"
  supabaseUrl?: string       // optional override for dedicated Supabase
  supabaseAnonKey?: string
  museumId: string           // UUID of the museum in ag_museums
  // City Guide / Region Guide extensions
  guideType?: 'artguide' | 'cityguide' | 'regionguide'  // default: artguide
  cityId?: string            // UUID of cg_cities (for City Guide)
  regionId?: string          // UUID of cg_regions (for Region Guide)
  defaultRoute?: string      // e.g. "/city/meine-stadt" or "/region/meine-region"
  enablePartners?: boolean   // show partner directory + booking
  enableOffers?: boolean     // show offers marketplace
  enableBookings?: boolean   // enable booking flow
}

interface BuildOptions {
  museum?: string
  config?: string
  platform: 'ios' | 'android' | 'web' | 'all'
  dryRun: boolean
}

// ============================================================================
// CLI Argument Parsing
// ============================================================================

function parseArgs(): BuildOptions {
  const args = process.argv.slice(2)
  const options: BuildOptions = {
    platform: 'all',
    dryRun: false,
  }

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--museum':
        options.museum = args[++i]
        break
      case '--config':
        options.config = args[++i]
        break
      case '--platform':
        options.platform = args[++i] as BuildOptions['platform']
        break
      case '--dry-run':
        options.dryRun = true
        break
    }
  }

  if (!options.museum && !options.config) {
    console.error('Error: Provide --museum <slug> or --config <path>')
    process.exit(1)
  }

  return options
}

// ============================================================================
// Load Museum Config
// ============================================================================

function loadMuseumConfig(options: BuildOptions): MuseumBranding {
  if (options.config) {
    const configPath = path.resolve(options.config)
    if (!fs.existsSync(configPath)) {
      console.error(`Config file not found: ${configPath}`)
      process.exit(1)
    }
    return JSON.parse(fs.readFileSync(configPath, 'utf-8'))
  }

  // Load from museums/ directory by slug
  const museumDir = path.resolve(__dirname, '../museums')
  const configPath = path.join(museumDir, `${options.museum}.json`)

  if (!fs.existsSync(configPath)) {
    console.error(`Museum config not found: ${configPath}`)
    console.error(`Create it at: museums/${options.museum}.json`)
    console.error(`Or use --config <path> to specify a custom location.`)
    process.exit(1)
  }

  return JSON.parse(fs.readFileSync(configPath, 'utf-8'))
}

// ============================================================================
// Generate Environment
// ============================================================================

function generateEnvFile(branding: MuseumBranding, outputDir: string): void {
  const envContent = [
    `VITE_MUSEUM_SLUG=${branding.slug}`,
    `VITE_MUSEUM_ID=${branding.museumId}`,
    `VITE_MUSEUM_NAME=${branding.appName}`,
    `VITE_MUSEUM_BRANDING=${JSON.stringify({
      primary: branding.primaryColor,
      secondary: branding.secondaryColor,
      accent: branding.accentColor,
      background: branding.backgroundColor,
      text: branding.textColor,
      logo: branding.logoUrl,
      poweredBy: branding.poweredByVisible,
    })}`,
    branding.supabaseUrl ? `VITE_SUPABASE_URL=${branding.supabaseUrl}` : '',
    branding.supabaseAnonKey ? `VITE_SUPABASE_ANON_KEY=${branding.supabaseAnonKey}` : '',
    // City/Region Guide config
    `VITE_GUIDE_TYPE=${branding.guideType || 'artguide'}`,
    branding.cityId ? `VITE_CITY_ID=${branding.cityId}` : '',
    branding.regionId ? `VITE_REGION_ID=${branding.regionId}` : '',
    branding.defaultRoute ? `VITE_DEFAULT_ROUTE=${branding.defaultRoute}` : '',
    `VITE_ENABLE_PARTNERS=${branding.enablePartners !== false}`,
    `VITE_ENABLE_OFFERS=${branding.enableOffers !== false}`,
    `VITE_ENABLE_BOOKINGS=${branding.enableBookings !== false}`,
  ].filter(Boolean).join('\n')

  fs.writeFileSync(path.join(outputDir, '.env.production'), envContent)
  console.log('  -> .env.production generated')
}

// ============================================================================
// Generate Capacitor Config
// ============================================================================

function generateCapacitorConfig(branding: MuseumBranding, outputDir: string): void {
  const config = `import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: '${branding.appId}',
  appName: '${branding.appName}',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
  plugins: {
    SplashScreen: {
      launchAutoHide: true,
      launchShowDuration: 2000,
      backgroundColor: '${branding.splashColor}',
      showSpinner: false,
    },
    StatusBar: {
      style: '${branding.statusBarStyle}',
      backgroundColor: '${branding.primaryColor}',
    },
  },
  ios: {
    contentInset: 'automatic',
    preferredContentMode: 'mobile',
    scheme: '${branding.iosScheme}',
  },
  android: {
    backgroundColor: '${branding.backgroundColor}',
    allowMixedContent: false,
    captureInput: true,
  },
}

export default config
`
  fs.writeFileSync(path.join(outputDir, 'capacitor.config.ts'), config)
  console.log('  -> capacitor.config.ts generated')
}

// ============================================================================
// Generate CSS Variables
// ============================================================================

function generateBrandingCss(branding: MuseumBranding, outputDir: string): void {
  const css = `:root {
  --museum-primary: ${branding.primaryColor};
  --museum-secondary: ${branding.secondaryColor};
  --museum-accent: ${branding.accentColor};
  --museum-bg: ${branding.backgroundColor};
  --museum-text: ${branding.textColor};
}
`
  const targetDir = path.join(outputDir, 'src')
  if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true })
  fs.writeFileSync(path.join(targetDir, 'museum-branding.css'), css)
  console.log('  -> museum-branding.css generated')
}

// ============================================================================
// Build
// ============================================================================

function runBuild(branding: MuseumBranding, platform: string, outputDir: string, dryRun: boolean): void {
  const cmd = (c: string) => {
    console.log(`  $ ${c}`)
    if (!dryRun) {
      execSync(c, { cwd: outputDir, stdio: 'inherit' })
    }
  }

  console.log(`\n[Build] Building ${branding.appName} for ${platform}...`)

  // Web build (always needed)
  cmd('pnpm vite build')

  if (platform === 'ios' || platform === 'all') {
    cmd('npx cap sync ios')
    console.log(`  -> iOS project ready at ${outputDir}/ios`)
  }

  if (platform === 'android' || platform === 'all') {
    cmd('npx cap sync android')
    console.log(`  -> Android project ready at ${outputDir}/android`)
  }
}

// ============================================================================
// Main
// ============================================================================

function main(): void {
  console.log('=== Fintutto Art Guide — White-Label Build Pipeline ===\n')

  const options = parseArgs()
  const branding = loadMuseumConfig(options)

  console.log(`Museum:   ${branding.appName}`)
  console.log(`Slug:     ${branding.slug}`)
  console.log(`App ID:   ${branding.appId}`)
  console.log(`Platform: ${options.platform}`)
  if (options.dryRun) console.log(`Mode:     DRY RUN`)

  // Work in the whitelabel app directory
  const whitelabelDir = path.resolve(__dirname, '../apps/artguide-whitelabel')

  console.log('\n[1/4] Generating environment...')
  generateEnvFile(branding, whitelabelDir)

  console.log('[2/4] Generating Capacitor config...')
  generateCapacitorConfig(branding, whitelabelDir)

  console.log('[3/4] Generating branding CSS...')
  generateBrandingCss(branding, whitelabelDir)

  console.log('[4/4] Running build...')
  runBuild(branding, options.platform, whitelabelDir, options.dryRun)

  console.log('\n=== Build complete! ===')

  // Output directory for CI/CD
  const distDir = path.join(whitelabelDir, 'dist')
  console.log(`\nWeb output:  ${distDir}`)
  if (options.platform !== 'web') {
    console.log(`Native dirs: ${whitelabelDir}/ios, ${whitelabelDir}/android`)
    console.log(`\nNext steps:`)
    console.log(`  iOS:     cd ${whitelabelDir} && npx cap open ios`)
    console.log(`  Android: cd ${whitelabelDir} && npx cap open android`)
  }
}

main()
