// Context modes for domain-specific translations
// Each context adds a glossary hint that improves translation accuracy

export type TranslationContext = 'general' | 'travel' | 'medical' | 'legal' | 'business' | 'casual'

export interface ContextMode {
  id: TranslationContext
  icon: string // emoji
  i18nKey: string
}

export const CONTEXT_MODES: ContextMode[] = [
  { id: 'general', icon: '🌐', i18nKey: 'context.general' },
  { id: 'travel', icon: '✈️', i18nKey: 'context.travel' },
  { id: 'medical', icon: '🏥', i18nKey: 'context.medical' },
  { id: 'legal', icon: '⚖️', i18nKey: 'context.legal' },
  { id: 'business', icon: '💼', i18nKey: 'context.business' },
  { id: 'casual', icon: '💬', i18nKey: 'context.casual' },
]

// Context-specific glossary terms that help disambiguate translations
// These are prepended to the translation query as hints
const CONTEXT_GLOSSARIES: Record<TranslationContext, Record<string, Record<string, string>>> = {
  general: {},
  travel: {
    de: {
      'Anschluss': 'Connecting flight/transfer',
      'Fahrkarte': 'Ticket (travel)',
      'Gepäck': 'Luggage/baggage',
      'Ausgang': 'Exit (airport/station)',
      'Verspätung': 'Delay (travel)',
    },
    en: {
      'terminal': 'Airport terminal',
      'gate': 'Boarding gate',
      'check-in': 'Check-in at hotel/airport',
    },
  },
  medical: {
    de: {
      'Rezept': 'Prescription (medical)',
      'Aufnahme': 'Hospital admission',
      'Befund': 'Medical findings',
      'Sprechstunde': 'Consultation hours',
      'Überweisung': 'Medical referral',
    },
    en: {
      'prescription': 'Medical prescription',
      'admission': 'Hospital admission',
      'discharge': 'Hospital discharge',
    },
  },
  legal: {
    de: {
      'Bescheid': 'Official notice/decision',
      'Antrag': 'Application (legal/official)',
      'Einspruch': 'Objection/appeal',
      'Vollmacht': 'Power of attorney',
      'Frist': 'Deadline (legal)',
      'Aufenthalt': 'Residence (legal)',
    },
    en: {
      'appeal': 'Legal appeal',
      'hearing': 'Court hearing',
      'application': 'Legal/official application',
    },
  },
  business: {
    de: {
      'Anlage': 'Attachment/enclosure',
      'Umsatz': 'Revenue/turnover',
      'Gewinn': 'Profit',
      'Rechnung': 'Invoice/bill',
      'Vertrag': 'Contract',
    },
    en: {
      'engagement': 'Business engagement',
      'turnover': 'Business turnover/revenue',
      'margin': 'Profit margin',
    },
  },
  casual: {
    de: {
      'geil': 'awesome/cool (colloquial)',
      'krass': 'intense/crazy (slang)',
      'Bock': 'desire/motivation (colloquial)',
    },
    en: {
      'cool': 'cool (informal)',
      'chill': 'relax (informal)',
    },
  },
}

/**
 * Get context-specific disambiguation hints for a text
 * Returns terms found in the text that have context-specific meanings
 */
export function getContextHints(text: string, sourceLang: string, context: TranslationContext): string[] {
  if (context === 'general') return []

  const glossary = CONTEXT_GLOSSARIES[context]?.[sourceLang]
  if (!glossary) return []

  const hints: string[] = []
  const lowerText = text.toLowerCase()

  for (const [term, meaning] of Object.entries(glossary)) {
    if (lowerText.includes(term.toLowerCase())) {
      hints.push(`${term}: ${meaning}`)
    }
  }

  return hints
}

/**
 * Get a context label to display contextual indicators
 */
export function getContextMode(id: TranslationContext): ContextMode | undefined {
  return CONTEXT_MODES.find(m => m.id === id)
}
