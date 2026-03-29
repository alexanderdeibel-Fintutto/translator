/**
 * Assistant Components — KI-gestützte Gesprächsassistenz
 *
 * Alle Komponenten die über die reine Übersetzung hinausgehen:
 * - SmartReplyBar: KI-Antwortvorschläge nach jeder Gäste-Nachricht
 * - PersonalPhrasebook: Nutzereigene Phrasen mit Supabase-Persistenz
 * - ConversationSummary: Automatische Gesprächszusammenfassung
 */

export { default as SmartReplyBar } from './SmartReplyBar'
export { default as PersonalPhrasebook, SavePhraseButton } from './PersonalPhrasebook'
export type { UserPhrase } from './PersonalPhrasebook'
export { default as ConversationSummary } from './ConversationSummary'
