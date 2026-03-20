// Fintutto Art Guide — AI Service
// Personalized artwork explanations and tour generation
// Uses Claude API for text generation, grounded in museum's own content

import type {
  Artwork,
  VisitorProfile,
  PersonalizationContext,
  MultilingualText,
  AiTourSuggestion,
  Tour,
} from './types'

// ============================================================================
// AI Explanation Generation
// ============================================================================

/**
 * Build the system prompt for artwork explanations.
 * The AI adapts its tone, depth, and style based on the visitor profile.
 */
export function buildArtworkSystemPrompt(
  context: PersonalizationContext,
  museumName: string,
): string {
  const parts: string[] = []

  parts.push(`Du bist ein KI-Kunstfuehrer im ${museumName}.`)
  parts.push('Du erklaerst Kunstwerke basierend auf den bereitgestellten Fakten des Museums.')
  parts.push('WICHTIG: Verwende NUR die bereitgestellten Informationen als Grundlage. Ergaenze mit allgemeinem Kunstwissen, aber erfinde KEINE Details ueber das spezifische Werk.')

  // Tone adaptation
  switch (context.ai_tone) {
    case 'formal':
      parts.push('Sprich in einem formellen, respektvollen Ton. Verwende "Sie".')
      break
    case 'warm':
      parts.push('Sprich warmherzig und einladend. Verwende "Sie", aber nahbar.')
      break
    case 'casual':
      parts.push('Sprich locker und freundlich. Verwende "Du".')
      break
    case 'enthusiastic':
      parts.push('Sprich begeistert und mitreissend! Zeige echte Faszination fuer die Kunst.')
      break
    case 'academic':
      parts.push('Sprich fachlich praezise mit kunsthistorischer Terminologie.')
      break
  }

  // Salutation
  if (context.preferred_salutation) {
    parts.push(`Verwende "${context.preferred_salutation}" als Anrede.`)
  }

  // Age adaptation
  switch (context.age_group) {
    case 'child':
      parts.push('Der Besucher ist ein Kind (6-12 Jahre).')
      parts.push('Verwende einfache Woerter, kurze Saetze, und mache es spannend wie eine Schatzsuche!')
      parts.push('Stelle Fragen die zum Nachdenken anregen: "Was glaubst du, warum...?"')
      break
    case 'youth':
      parts.push('Der Besucher ist ein Jugendlicher (13-17 Jahre).')
      parts.push('Sei cool, nicht belehrend. Verbinde Kunst mit ihrer Lebenswelt.')
      parts.push('Nutze ueberraschende Fakten um Interesse zu wecken.')
      break
    case 'young_adult':
      parts.push('Der Besucher ist ein junger Erwachsener.')
      break
    case 'senior':
      parts.push('Sprich respektvoll und mit Wertschaetzung fuer Lebenserfahrung.')
      break
  }

  // Knowledge level
  switch (context.knowledge_level) {
    case 'beginner':
      parts.push('Der Besucher hat wenig Vorwissen. Erklaere Fachbegriffe einfach.')
      break
    case 'casual':
      parts.push('Der Besucher hat allgemeines Kulturwissen, ist aber kein Experte.')
      break
    case 'enthusiast':
      parts.push('Der Besucher ist kunstinteressiert und kennt die Grundlagen.')
      break
    case 'expert':
      parts.push('Der Besucher ist Kunstkenner. Gehe in die Tiefe, nutze Fachsprache.')
      break
    case 'professional':
      parts.push('Der Besucher ist vom Fach (Kunsthistoriker/Kuenstler). Diskutiere auf Profi-Niveau.')
      break
  }

  // Detail level
  switch (context.ai_detail_level) {
    case 'minimal':
      parts.push('Halte dich SEHR kurz: maximal 2-3 Saetze.')
      break
    case 'standard':
      parts.push('Gib eine ausgewogene Erklaerung: 4-6 Saetze.')
      break
    case 'detailed':
      parts.push('Gehe ins Detail: Kontext, Technik, Bedeutung. 8-12 Saetze.')
      break
    case 'exhaustive':
      parts.push('Umfassende Erklaerung mit allen verfuegbaren Details.')
      break
  }

  // Content preferences
  if (context.include_anecdotes) {
    parts.push('Baue interessante Anekdoten und Geschichten ein, wenn verfuegbar.')
  }
  if (context.include_comparisons) {
    parts.push('Vergleiche mit anderen bekannten Werken oder Kuenstlern, wenn sinnvoll.')
  }
  if (context.include_technique) {
    parts.push('Gehe auf die kuenstlerische Technik und Materialien ein.')
  }

  // Content style
  switch (context.content_style) {
    case 'narrative':
      parts.push('Erzaehle die Geschichte des Werks als Narrativ.')
      break
    case 'storytelling':
      parts.push('Erzaehle wie ein Geschichtenerzaehler — fesselnd und bildhaft.')
      break
    case 'factual':
      parts.push('Konzentriere dich auf Fakten und Daten, wenig Interpretation.')
      break
    case 'academic':
      parts.push('Strukturiere wissenschaftlich: Einordnung, Analyse, Bedeutung.')
      break
  }

  // Accessibility
  if (context.accessibility_needs.includes('visual_impairment')) {
    parts.push('WICHTIG: Beschreibe das Werk besonders ausfuehrlich visuell (Audiodeskription).')
    parts.push('Beschreibe Farben, Formen, Komposition und raeumliche Anordnung detailliert.')
  }

  // Language
  parts.push(`Antworte auf: ${getLanguageName(context.language)}`)

  return parts.join('\n')
}

/**
 * Build the user prompt with artwork data (museum's content = source of truth)
 */
export function buildArtworkUserPrompt(
  artwork: Artwork,
  language: string,
  question?: string,
): string {
  const parts: string[] = []

  parts.push('=== KUNSTWERK-DATEN (Quelle: Museum) ===')
  parts.push(`Titel: ${getLocalizedText(artwork.title, language)}`)

  if (artwork.artist_name) {
    let artist = artwork.artist_name
    if (artwork.artist_birth_year) {
      artist += ` (${artwork.artist_birth_year}`
      if (artwork.artist_death_year) artist += `–${artwork.artist_death_year}`
      artist += ')'
    }
    parts.push(`Kuenstler: ${artist}`)
  }

  if (artwork.year_created) parts.push(`Entstehung: ${artwork.year_created}`)
  if (artwork.medium) parts.push(`Technik/Material: ${artwork.medium}`)
  if (artwork.dimensions) parts.push(`Masse: ${artwork.dimensions}`)
  if (artwork.style) parts.push(`Stil: ${artwork.style}`)
  if (artwork.epoch) parts.push(`Epoche: ${artwork.epoch}`)
  if (artwork.origin) parts.push(`Herkunft: ${artwork.origin}`)

  // Museum's own descriptions (prioritized as source of truth)
  const desc = getLocalizedText(artwork.description_standard, language)
  if (desc) parts.push(`\nMuseumsbeschreibung:\n${desc}`)

  const detailed = getLocalizedText(artwork.description_detailed, language)
  if (detailed) parts.push(`\nDetaillierte Beschreibung:\n${detailed}`)

  const history = getLocalizedText(artwork.historical_context, language)
  if (history) parts.push(`\nHistorischer Kontext:\n${history}`)

  const technique = getLocalizedText(artwork.technique_details, language)
  if (technique) parts.push(`\nTechnik-Details:\n${technique}`)

  const funFacts = getLocalizedText(artwork.fun_facts, language)
  if (funFacts) parts.push(`\nInteressante Fakten:\n${funFacts}`)

  // AI base knowledge (museum-provided grounding data)
  if (artwork.ai_base_knowledge) {
    parts.push(`\nZusaetzliche Fakten (Museum):\n${JSON.stringify(artwork.ai_base_knowledge)}`)
  }

  parts.push('\n=== ENDE KUNSTWERK-DATEN ===')

  if (question) {
    parts.push(`\nFrage des Besuchers: ${question}`)
  } else {
    parts.push('\nBitte erklaere dieses Kunstwerk entsprechend meines Profils.')
  }

  return parts.join('\n')
}

// ============================================================================
// Tour Generation for CMS
// ============================================================================

/**
 * Build prompt for AI tour suggestions (used by museum staff in CMS)
 */
export function buildTourSuggestionPrompt(
  artworks: Artwork[],
  language: string,
  options: {
    targetAudience?: string
    durationMinutes?: number
    theme?: string
    excludeArtworkIds?: string[]
  } = {},
): { system: string; user: string } {
  const system = [
    'Du bist ein KI-Assistent fuer Museumskuratoren.',
    'Du erstellst Vorschlaege fuer thematische Fuehrungen basierend auf der Sammlung.',
    'Jeder Vorschlag soll einen roten Faden haben, der die Werke verbindet.',
    'Beruecksichtige raeumliche Naehe der Werke fuer einen sinnvollen Rundgang.',
    `Antworte im JSON-Format auf ${getLanguageName(language)}.`,
  ].join('\n')

  const artworkList = artworks
    .filter(a => !options.excludeArtworkIds?.includes(a.id))
    .map(a => ({
      id: a.id,
      title: getLocalizedText(a.title, language),
      artist: a.artist_name,
      epoch: a.epoch,
      style: a.style,
      room: a.room_id,
      tags: a.tags,
      is_highlight: a.is_highlight,
    }))

  const constraints: string[] = []
  if (options.targetAudience) constraints.push(`Zielgruppe: ${options.targetAudience}`)
  if (options.durationMinutes) constraints.push(`Gewuenschte Dauer: ca. ${options.durationMinutes} Minuten`)
  if (options.theme) constraints.push(`Thema/Schwerpunkt: ${options.theme}`)

  const user = [
    '=== SAMMLUNG ===',
    JSON.stringify(artworkList, null, 2),
    '',
    constraints.length > 0 ? `=== ANFORDERUNGEN ===\n${constraints.join('\n')}` : '',
    '',
    'Erstelle 3 verschiedene Tour-Vorschlaege im folgenden JSON-Format:',
    '[{',
    '  "title": { "de": "...", "en": "..." },',
    '  "description": { "de": "...", "en": "..." },',
    '  "theme": "...",',
    '  "target_audience": "general|children|youth|expert",',
    '  "estimated_duration_minutes": 60,',
    '  "reasoning": "Warum diese Tour funktioniert...",',
    '  "stops": [{ "artwork_id": "...", "reason": "...", "narration_hint": "..." }]',
    '}]',
  ].join('\n')

  return { system, user }
}

// ============================================================================
// CMS Content Generation
// ============================================================================

/**
 * Generate age-appropriate descriptions for an artwork.
 * Used by museum staff in CMS to auto-generate content.
 */
export function buildContentGenerationPrompt(
  artwork: Artwork,
  language: string,
  targetField: string,
): { system: string; user: string } {
  const fieldInstructions: Record<string, string> = {
    description_brief: 'Schreibe eine kurze Beschreibung (1-2 Saetze) fuer einen schnellen Ueberblick. Fuer alle Altersgruppen geeignet.',
    description_standard: 'Schreibe eine Standardbeschreibung (4-6 Saetze) fuer allgemeines Publikum. Informativ und zugaenglich.',
    description_detailed: 'Schreibe eine ausfuehrliche Beschreibung (8-15 Saetze) fuer kunstinteressierte Besucher. Gehe auf Kontext, Technik und Bedeutung ein.',
    description_children: 'Schreibe eine kindgerechte Beschreibung (3-5 Saetze) fuer Kinder von 6-12 Jahren. Einfache Sprache, spannende Fragen, Spass-Fakten.',
    description_youth: 'Schreibe eine Beschreibung fuer Jugendliche (13-17 Jahre). Cool, nicht belehrend. Verbinde mit aktueller Popkultur wenn moeglich.',
    fun_facts: 'Schreibe 3-5 ueberraschende/lustige Fakten ueber dieses Werk oder den Kuenstler. Format: Aufzaehlung.',
    historical_context: 'Erklaere den historischen Kontext: Was passierte in der Welt als dieses Werk entstand? Wie beeinflusste die Zeit das Werk?',
    technique_details: 'Beschreibe die kuenstlerische Technik im Detail: Materialien, Arbeitsweise, Besonderheiten der Ausfuehrung.',
  }

  const system = [
    'Du bist ein Kunstexperte der Museumstexte verfasst.',
    'Verwende NUR die bereitgestellten Fakten als Grundlage.',
    'Ergaenze mit gesichertem kunsthistorischem Wissen, aber erfinde NICHTS.',
    `Schreibe auf ${getLanguageName(language)}.`,
  ].join('\n')

  const user = [
    buildArtworkUserPrompt(artwork, language),
    '',
    `=== AUFGABE ===`,
    fieldInstructions[targetField] || 'Schreibe eine passende Beschreibung.',
  ].join('\n')

  return { system, user }
}

// ============================================================================
// Personalization Context Builder
// ============================================================================

/** Create a PersonalizationContext from a VisitorProfile */
export function buildPersonalizationContext(
  visitor: VisitorProfile,
): PersonalizationContext {
  return {
    age_group: visitor.age_group,
    knowledge_level: visitor.knowledge_level,
    preferred_salutation: visitor.preferred_salutation,
    content_style: visitor.preferred_content_style,
    tour_depth: visitor.preferred_tour_depth,
    language: visitor.language,
    ai_tone: visitor.ai_personality_tone,
    ai_detail_level: visitor.ai_detail_level,
    include_anecdotes: visitor.ai_include_anecdotes,
    include_comparisons: visitor.ai_include_comparisons,
    include_technique: visitor.ai_include_technique,
    child_mode: visitor.ai_child_mode,
    accessibility_needs: visitor.accessibility_needs,
    voice_gender: visitor.preferred_voice_gender,
    voice_age: visitor.preferred_voice_age,
    voice_preset: visitor.preferred_voice_preset,
    audio_speed: visitor.audio_speed,
  }
}

// ============================================================================
// Helpers
// ============================================================================

function getLocalizedText(text: MultilingualText | undefined, language: string): string {
  if (!text) return ''
  return text[language] || text['en'] || text['de'] || Object.values(text)[0] || ''
}

function getLanguageName(code: string): string {
  const names: Record<string, string> = {
    de: 'Deutsch', en: 'English', fr: 'Francais', es: 'Espanol',
    it: 'Italiano', pt: 'Portugues', nl: 'Nederlands', pl: 'Polski',
    tr: 'Tuerkce', ru: 'Russkij', uk: 'Ukrainska', ar: 'Arabisch',
    zh: 'Zhongwen', ja: 'Nihongo', ko: 'Hangugeo',
  }
  const prefix = code.split('-')[0]
  return names[prefix] || code
}
