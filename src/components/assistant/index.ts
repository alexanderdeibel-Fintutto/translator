/**
 * Assistant Components — KI-gestützte Gesprächsassistenz
 *
 * Alle Komponenten die über die reine Übersetzung hinausgehen:
 *
 * Ebene 1 — Sofort-Hilfe im Gespräch:
 * - SmartReplyBar: KI-Antwortvorschläge nach jeder Gäste-Nachricht
 * - EmergencyMode: Notfall-Phrasen sofort abrufbar (roter Button)
 * - ToneSelector: Tonfall-Anpassung (formell / freundlich / beruhigend / direkt)
 *
 * Ebene 2 — Persönliche Effizienz:
 * - PersonalPhrasebook: Nutzereigene Phrasen mit Supabase-Persistenz
 * - TeamPhrasebook: Admin-verwaltete Team-Phrasen für alle Mitarbeiter
 *
 * Ebene 3 — Nach dem Gespräch:
 * - ConversationSummary: Automatische Gesprächszusammenfassung
 * - HandoverNote: Strukturierte Übergabe-Notiz für Kollegen / CRM
 *
 * Kombiniert:
 * - ConversationAssistantPanel: Alle Ebenen in einem Tab-Panel
 */

export { default as SmartReplyBar } from './SmartReplyBar'
export { default as PersonalPhrasebook, SavePhraseButton } from './PersonalPhrasebook'
export type { UserPhrase } from './PersonalPhrasebook'
export { default as ConversationSummary } from './ConversationSummary'
export { default as ConversationAssistantPanel } from './ConversationAssistantPanel'

// Neue Komponenten (v2)
export { default as ToneSelector } from './ToneSelector'
export type { ToneMode, ToneConfig } from './ToneSelector'
export { TONE_CONFIGS, reformulateTone } from './ToneSelector'

export { default as EmergencyMode } from './EmergencyMode'

export { default as TeamPhrasebook } from './TeamPhrasebook'
export type { TeamPhrase } from './TeamPhrasebook'

export { default as HandoverNote } from './HandoverNote'
export type { ConversationMessage } from './HandoverNote'
