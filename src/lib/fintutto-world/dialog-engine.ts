// Fintutto World — AI Dialog Engine
// Conversational AI that works across all domains
// Adapts to visitor profile: age, knowledge, interests, language, time, location
//
// KEY CAPABILITIES:
// 1. Reactive: User asks a question about a POI → AI answers personalized
// 2. Proactive: AI suggests nearby POIs, restaurants, highlights based on profile
// 3. Guided: Onboarding dialog to learn visitor preferences
// 4. Contextual: Knows where the visitor is, what they've seen, how much time they have

import { supabase } from '../supabase'
import type {
  UniversalPersonalizationContext,
  DialogMessage,
  AiDialog,
  ContextType,
  UniversalPoi,
  MultilingualText,
  DialogMode,
} from './types'

// ============================================================================
// System Prompt Builder
// ============================================================================

/** Build the system prompt for the universal AI dialog */
export function buildUniversalSystemPrompt(
  context: UniversalPersonalizationContext,
  dialogContext: {
    contextType: ContextType
    contextName?: string
    parentName?: string
    dialogMode: DialogMode
    visitDurationSoFar?: number
    remainingTime?: number
    itemsViewed?: number
    previousTopics?: string[]
  },
): string {
  const parts: string[] = []

  // Core identity
  parts.push('Du bist der persoenliche Fintutto Guide — ein KI-Assistent, der Besuchern ' +
    'ein vollstaendig personalisiertes Erlebnis bietet.')
  parts.push('Du weisst alles ueber Sehenswuerdigkeiten, Museen, Staedte, Regionen, ' +
    'Restaurants, Hotels und lokale Geheimtipps.')
  parts.push('Du sprichst die Sprache des Besuchers und passt dich an sein Profil an.')

  // Context
  if (dialogContext.contextName) {
    const typeLabels: Record<string, string> = {
      museum: 'Museum',
      city: 'Stadt',
      region: 'Region',
      cruise: 'Kreuzfahrtschiff',
      event: 'Event',
      nature: 'Naturgebiet',
      general: 'allgemeiner Kontext',
    }
    const typeLabel = typeLabels[dialogContext.contextType] || dialogContext.contextType
    parts.push(`\nAktueller Kontext: ${typeLabel} "${dialogContext.contextName}"`)
    if (dialogContext.parentName) {
      parts.push(`Uebergeordnet: ${dialogContext.parentName}`)
    }
  }

  // Dialog mode
  switch (dialogContext.dialogMode) {
    case 'proactive':
      parts.push('\nMODUS: PROAKTIV — Du startest das Gespraech und machst Vorschlaege.')
      parts.push('Stelle Fragen um den Besucher besser kennenzulernen.')
      parts.push('Schlage POIs, Restaurants, Aktivitaeten basierend auf dem Profil vor.')
      break
    case 'guided':
      parts.push('\nMODUS: ONBOARDING — Lerne den Besucher kennen.')
      parts.push('Frage nach: Wie viel Zeit? Was interessiert? Allein oder Gruppe? Budget?')
      parts.push('Erstelle dann einen personalisierten Plan.')
      break
    case 'reactive':
      parts.push('\nMODUS: REAKTIV — Beantworte Fragen des Besuchers.')
      if (context.proactiveSuggestions) {
        parts.push('Du darfst am Ende gelegentlich einen kurzen Hinweis auf Naheliegendes geben.')
      }
      break
  }

  // Tone adaptation
  const toneInstructions: Record<string, string> = {
    formal: 'Sprich formell und respektvoll. Verwende "Sie".',
    warm: 'Sprich warmherzig und einladend. Verwende "Sie", aber nahbar.',
    casual: 'Sprich locker und freundlich. Verwende "Du".',
    enthusiastic: 'Sprich begeistert und mitreissend! Zeige echte Faszination.',
    academic: 'Sprich fachlich praezise mit Fachterminologie.',
  }
  parts.push(`\nTon: ${toneInstructions[context.aiTone] || toneInstructions.warm}`)

  if (context.preferredSalutation) {
    parts.push(`Anrede: "${context.preferredSalutation}"`)
  }

  // Age adaptation
  const ageInstructions: Record<string, string> = {
    child: 'Der Besucher ist ein Kind (6-12). Einfache Woerter, kurze Saetze, mach es spannend wie eine Schatzsuche! Stelle Fragen: "Was glaubst du, warum...?"',
    youth: 'Der Besucher ist ein Jugendlicher (13-17). Sei cool, nicht belehrend. Verbinde mit ihrer Lebenswelt. Nutze ueberraschende Fakten.',
    young_adult: 'Der Besucher ist ein junger Erwachsener.',
    adult: '',
    senior: 'Sprich respektvoll und mit Wertschaetzung fuer Lebenserfahrung.',
  }
  if (ageInstructions[context.ageGroup]) {
    parts.push(`\nAltersgruppe: ${ageInstructions[context.ageGroup]}`)
  }

  // Knowledge level
  const knowledgeInstructions: Record<string, string> = {
    beginner: 'Wenig Vorwissen. Erklaere Fachbegriffe einfach. Keine Fachsprache.',
    casual: 'Allgemeines Kulturwissen, aber kein Experte.',
    enthusiast: 'Kunstinteressiert, kennt die Grundlagen. Kann Tiefe vertragen.',
    expert: 'Kunstkenner. Gehe in die Tiefe, nutze Fachsprache.',
    professional: 'Vom Fach. Diskutiere auf Profi-Niveau.',
  }
  parts.push(`Wissensstand: ${knowledgeInstructions[context.knowledgeLevel] || knowledgeInstructions.casual}`)

  // Detail level
  const detailInstructions: Record<string, string> = {
    minimal: 'SEHR kurz: maximal 2-3 Saetze.',
    standard: 'Ausgewogen: 4-6 Saetze.',
    detailed: 'Detailliert: Kontext, Technik, Bedeutung. 8-12 Saetze.',
    exhaustive: 'Umfassend mit allen verfuegbaren Details.',
  }
  parts.push(`Detail: ${detailInstructions[context.aiDetailLevel] || detailInstructions.standard}`)

  // Content preferences
  if (context.includeAnecdotes) parts.push('Baue Anekdoten und Geschichten ein.')
  if (context.includeComparisons) parts.push('Vergleiche mit anderen bekannten Werken/Orten.')
  if (context.includeTechnique) parts.push('Gehe auf Technik und Details ein.')

  // Question frequency
  const qFreq: Record<string, string> = {
    never: 'Stelle KEINE Gegenfragen.',
    rare: 'Stelle nur selten eine Frage.',
    moderate: 'Stelle gelegentlich eine Frage um das Gespraech interaktiv zu halten.',
    frequent: 'Stelle aktiv Fragen und mache das Gespraech interaktiv.',
  }
  parts.push(qFreq[context.questionFrequency] || qFreq.moderate)

  // Lifestyle context
  if (context.dietaryPreferences.length > 0) {
    parts.push(`\nErnaehrung: ${context.dietaryPreferences.join(', ')}. Bei Restaurant-Empfehlungen beruecksichtigen!`)
  }
  if (context.budgetLevel !== 'medium') {
    const budgetMap: Record<string, string> = {
      budget: 'Budget-bewusst. Guenstige Optionen bevorzugen.',
      premium: 'Gehoben. Qualitaet vor Preis.',
      luxury: 'Luxus. Nur die besten Empfehlungen.',
    }
    parts.push(`Budget: ${budgetMap[context.budgetLevel] || ''}`)
  }
  if (context.mobilityLevel !== 'full') {
    const mobilityMap: Record<string, string> = {
      limited: 'Eingeschraenkte Mobilitaet. Kurze Wege bevorzugen.',
      wheelchair: 'Rollstuhl. Nur barrierefreie Wege und Orte empfehlen.',
      stroller: 'Kinderwagen. Barrierefreie und kinderfreundliche Orte.',
    }
    parts.push(`Mobilitaet: ${mobilityMap[context.mobilityLevel] || ''}`)
  }
  if (context.travelWithChildren) {
    parts.push('Reist mit Kindern. Kinderfreundliche Aktivitaeten und Orte bevorzugen.')
  }
  if (context.travelMode === 'day_trip') {
    parts.push('Tagesausflug — Zeit ist knapp, Highlights priorisieren.')
  } else if (context.travelMode === 'long_stay') {
    parts.push('Laengerer Aufenthalt — kann auch weniger bekannte Orte entdecken.')
  }

  // Accessibility
  if (context.accessibilityNeeds.includes('visual_impairment')) {
    parts.push('\nWICHTIG: Beschreibe visuell ausfuehrlich (Audiodeskription). Farben, Formen, Komposition.')
  }
  if (context.accessibilityNeeds.includes('hearing_impairment')) {
    parts.push('Hoerbeeintraechtigung: Textbasierte Kommunikation bevorzugen.')
  }

  // Time context
  if (dialogContext.remainingTime !== undefined && dialogContext.remainingTime > 0) {
    parts.push(`\nVerbleibende Zeit: ca. ${dialogContext.remainingTime} Minuten. Empfehlungen darauf abstimmen.`)
  }
  if (dialogContext.itemsViewed !== undefined && dialogContext.itemsViewed > 0) {
    parts.push(`Bisher gesehen: ${dialogContext.itemsViewed} Objekte/POIs.`)
  }

  // Interests for recommendations
  if (context.interests.length > 0) {
    parts.push(`\nInteressen: ${context.interests.join(', ')}`)
  }

  // Language
  const languageNames: Record<string, string> = {
    de: 'Deutsch', en: 'English', fr: 'Francais', es: 'Espanol',
    it: 'Italiano', pt: 'Portugues', nl: 'Nederlands', pl: 'Polski',
    tr: 'Tuerkce', ru: 'Russkij', uk: 'Ukrainska', ar: 'Arabisch',
    zh: 'Zhongwen', ja: 'Nihongo', ko: 'Hangugeo',
  }
  const langName = languageNames[context.language.split('-')[0]] || context.language
  parts.push(`\nAntworte auf: ${langName}`)

  // Anti-hallucination
  parts.push('\nWICHTIG: Verwende bereitgestellte Fakten als Grundlage. Ergaenze mit gesichertem Wissen, aber erfinde KEINE spezifischen Details.')

  return parts.join('\n')
}

// ============================================================================
// POI Context Builder
// ============================================================================

/** Build user prompt with POI data for contextualized answers */
export function buildPoiContextPrompt(
  poi: UniversalPoi,
  language: string,
  question?: string,
): string {
  const parts: string[] = []
  const langPrefix = language.split('-')[0]

  const getText = (text: MultilingualText | undefined): string => {
    if (!text) return ''
    return text[langPrefix] || text['en'] || text['de'] || Object.values(text)[0] || ''
  }

  parts.push(`=== POI-DATEN (${poi.poiType}) ===`)
  parts.push(`Name: ${getText(poi.name)}`)

  const desc = getText(poi.description)
  if (desc) parts.push(`Beschreibung: ${desc}`)

  // Content layers
  if (poi.contentLayers) {
    const standard = getText(poi.contentLayers.standard)
    if (standard) parts.push(`\nStandard-Beschreibung:\n${standard}`)

    const detailed = getText(poi.contentLayers.detailed)
    if (detailed) parts.push(`\nDetaillierte Beschreibung:\n${detailed}`)

    const history = getText(poi.contentLayers.historicalContext)
    if (history) parts.push(`\nHistorischer Kontext:\n${history}`)

    const funFacts = getText(poi.contentLayers.funFacts)
    if (funFacts) parts.push(`\nInteressante Fakten:\n${funFacts}`)
  }

  if (poi.aiBaseKnowledge) {
    parts.push(`\nZusaetzliche Fakten:\n${JSON.stringify(poi.aiBaseKnowledge)}`)
  }

  if (poi.tags.length > 0) {
    parts.push(`Tags: ${poi.tags.join(', ')}`)
  }

  parts.push('=== ENDE POI-DATEN ===')

  if (question) {
    parts.push(`\nFrage des Besuchers: ${question}`)
  } else {
    parts.push('\nBitte erklaere diesen Ort/dieses Objekt entsprechend meines Profils.')
  }

  return parts.join('\n')
}

// ============================================================================
// Onboarding Dialog Prompts
// ============================================================================

/** Build the onboarding system prompt (guided mode) */
export function buildOnboardingPrompt(language: string, contextType: ContextType, contextName?: string): string {
  const langPrefix = language.split('-')[0]

  const prompts: Record<string, string> = {
    de: `Du bist der Fintutto Guide und begruesst einen neuen Besucher${contextName ? ` in ${contextName}` : ''}.

Deine Aufgabe: Lerne den Besucher in einem kurzen, freundlichen Gespraech kennen.

Frage nacheinander (NICHT alles auf einmal!):
1. Begruessung und Frage nach dem Namen / wie angesprochen werden moechte
2. Wie viel Zeit haben Sie heute?
3. Was interessiert Sie besonders? (Kunst, Geschichte, Natur, Essen, Shopping...)
4. Waren Sie schon einmal hier oder ist es Ihr erster Besuch?
5. Sind Sie alleine oder in einer Gruppe? Mit Kindern?
6. Gibt es besondere Beduerfnisse? (Barrierefreiheit, Ernaehrung...)

Nach 3-4 Fragen: Fasse zusammen und schlage einen personalisierten Plan vor.

Sei warmherzig, nicht wie ein Fragebogen. Reagiere auf die Antworten!
Antworte auf Deutsch.`,

    en: `You are the Fintutto Guide welcoming a new visitor${contextName ? ` to ${contextName}` : ''}.

Your task: Get to know the visitor in a short, friendly conversation.

Ask one at a time (NOT all at once!):
1. Greeting and ask how they'd like to be addressed
2. How much time do you have today?
3. What interests you most? (Art, history, nature, food, shopping...)
4. Have you been here before or is this your first visit?
5. Are you alone or in a group? With children?
6. Any special needs? (Accessibility, dietary preferences...)

After 3-4 questions: Summarize and suggest a personalized plan.

Be warm and conversational, not like a questionnaire. React to their answers!
Respond in English.`,
  }

  return prompts[langPrefix] || prompts.en || prompts.de
}

// ============================================================================
// Dialog Persistence (Supabase)
// ============================================================================

/** Create a new dialog session */
export async function createDialog(
  visitorId: string,
  contextType: ContextType,
  contextId: string | null,
  contextName: string | null,
  parentType: ContextType | null,
  parentId: string | null,
  personalization: UniversalPersonalizationContext,
  dialogMode: DialogMode = 'reactive',
): Promise<string | null> {
  const { data, error } = await supabase
    .from('fw_ai_dialogs')
    .insert({
      visitor_id: visitorId,
      context_type: contextType,
      context_id: contextId,
      context_name: contextName,
      parent_type: parentType,
      parent_id: parentId,
      messages: [],
      total_messages: 0,
      personalization_snapshot: personalization,
      status: 'active',
      dialog_mode: dialogMode,
    })
    .select('id')
    .single()

  if (error) {
    console.warn('[Dialog] Failed to create:', error.message)
    return null
  }
  return data?.id ?? null
}

/** Add a message to an existing dialog */
export async function addDialogMessage(
  dialogId: string,
  message: DialogMessage,
): Promise<void> {
  // Fetch current messages
  const { data: dialog } = await supabase
    .from('fw_ai_dialogs')
    .select('messages, total_messages')
    .eq('id', dialogId)
    .single()

  if (!dialog) return

  const messages = [...(dialog.messages as DialogMessage[]), message]

  await supabase
    .from('fw_ai_dialogs')
    .update({
      messages,
      total_messages: messages.length,
      last_message_at: new Date().toISOString(),
    })
    .eq('id', dialogId)
}

/** Get the active dialog for a visitor in a given context */
export async function getActiveDialog(
  visitorId: string,
  contextType?: ContextType,
  contextId?: string,
): Promise<AiDialog | null> {
  let query = supabase
    .from('fw_ai_dialogs')
    .select('*')
    .eq('visitor_id', visitorId)
    .eq('status', 'active')

  if (contextType) query = query.eq('context_type', contextType)
  if (contextId) query = query.eq('context_id', contextId)

  const { data } = await query.order('last_message_at', { ascending: false }).limit(1).single()

  if (!data) return null

  return {
    id: data.id,
    visitorId: data.visitor_id,
    contextType: data.context_type,
    contextId: data.context_id,
    contextName: data.context_name,
    parentType: data.parent_type,
    parentId: data.parent_id,
    messages: data.messages as DialogMessage[],
    totalMessages: data.total_messages,
    personalizationSnapshot: data.personalization_snapshot as UniversalPersonalizationContext,
    status: data.status,
    dialogMode: data.dialog_mode,
    startedAt: data.started_at,
    lastMessageAt: data.last_message_at,
  }
}

/** Complete/archive a dialog */
export async function completeDialog(dialogId: string): Promise<void> {
  await supabase
    .from('fw_ai_dialogs')
    .update({ status: 'completed' })
    .eq('id', dialogId)
}

// ============================================================================
// Recommendation Builder
// ============================================================================

/** Build a prompt for AI-generated recommendations based on profile + context */
export function buildRecommendationPrompt(
  context: UniversalPersonalizationContext,
  options: {
    contextType: ContextType
    contextName: string
    availablePois: Array<{ id: string; name: string; type: string; tags: string[]; distance?: number }>
    alreadyViewed: string[]
    remainingTimeMinutes?: number
  },
): { system: string; user: string } {
  const system = [
    'Du bist ein Empfehlungs-Assistent fuer Fintutto World.',
    'Basierend auf dem Besucherprofil und den verfuegbaren POIs schlage 3-5 passende Empfehlungen vor.',
    `Antworte im JSON-Format auf ${context.language === 'de' ? 'Deutsch' : 'der Sprache des Besuchers'}.`,
    'Format: [{ "poi_id": "...", "reason": "Warum passt das zum Besucher...", "priority": 1-5 }]',
  ].join('\n')

  const user = [
    '=== BESUCHER-PROFIL ===',
    `Interessen: ${context.interests.join(', ') || 'keine angegeben'}`,
    `Wissensstand: ${context.knowledgeLevel}`,
    `Altersgruppe: ${context.ageGroup}`,
    `Budget: ${context.budgetLevel}`,
    `Mobilitaet: ${context.mobilityLevel}`,
    `Gruppengroesse: ${context.groupSize}`,
    context.travelWithChildren ? 'Reist mit Kindern' : '',
    context.dietaryPreferences.length > 0 ? `Ernaehrung: ${context.dietaryPreferences.join(', ')}` : '',
    '',
    `=== KONTEXT: ${options.contextName} (${options.contextType}) ===`,
    options.remainingTimeMinutes ? `Verbleibende Zeit: ${options.remainingTimeMinutes} Minuten` : '',
    `Bereits gesehen: ${options.alreadyViewed.length} POIs`,
    '',
    '=== VERFUEGBARE POIS ===',
    JSON.stringify(
      options.availablePois
        .filter(p => !options.alreadyViewed.includes(p.id))
        .slice(0, 30),
      null,
      2,
    ),
  ].filter(Boolean).join('\n')

  return { system, user }
}
