import OpenAI from 'openai'

// Uses the OPENAI_API_KEY environment variable automatically
export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// ── Tier → Model Mapping ──────────────────────────────────────────────────────
export function getTextModelForTier(tier: string): string {
  switch (tier) {
    case 'artguide_enterprise_plus': return 'gpt-4.1'
    case 'artguide_enterprise':      return 'gpt-4.1-mini'
    case 'artguide_pro':             return 'gpt-4.1-mini'
    case 'artguide_starter':         return 'gpt-4.1-nano'
    case 'artguide_free':            return 'gpt-4.1-nano'
    default:                         return 'gpt-4.1-nano'
  }
}

// ── KI-Anreicherungs-Prompt ───────────────────────────────────────────────────
export function buildEnrichmentPrompt(rawData: Record<string, string>): string {
  return `Du bist ein erfahrener Museumskurator und Kunsthistoriker. Erstelle aus den folgenden Rohdaten eines Kunstwerks zielgruppengerechte Beschreibungstexte auf Deutsch.

WICHTIGE REGELN:
- Erfinde KEINE historischen Fakten, Jahreszahlen oder Kuenstlernamen, die nicht in den Rohdaten stehen
- Wenn Informationen fehlen, formuliere allgemein und einladend
- Texte sollen emotional ansprechen und Neugier wecken
- Verwende keine deutschen Sonderzeichen (ae statt ae, oe statt oe, ue statt ue, ss statt ss)

ROHDATEN:
${JSON.stringify(rawData, null, 2)}

Antworte NUR mit einem JSON-Objekt in diesem Format:
{
  "title_de": "Offizieller Titel auf Deutsch",
  "description_brief": "1-2 Saetze, sehr kurz, fuer schnelle Orientierung",
  "description_standard": "1 Absatz (4-6 Saetze), fuer den typischen Besucher",
  "description_detailed": "2-3 Absaetze, fuer kunstinteressierte Besucher",
  "description_children": "2-3 Saetze, fuer Kinder (6-12 Jahre), spielerisch und einfach",
  "description_youth": "2-3 Saetze, fuer Jugendliche (13-17 Jahre), modern und direkt",
  "fun_facts": ["Interessanter Fakt 1", "Interessanter Fakt 2", "Interessanter Fakt 3"],
  "historical_context": "1 Absatz ueber den historischen Kontext",
  "technique_description": "1-2 Saetze ueber die verwendete Technik/das Material",
  "suggested_tags": ["tag1", "tag2", "tag3"],
  "category": "painting|sculpture|installation|photography|drawing|print|textile|ceramic|other"
}`
}

// ── Fuehrungs-Generierungs-Prompt ─────────────────────────────────────────────
export function buildTourPrompt(
  artworks: Array<{ id: string; title: string; artist: string; description: string }>,
  audience: string,
  language: string
): string {
  return `Du bist ein erfahrener Museumspaedagoge. Erstelle eine strukturierte Fuehrung fuer die folgende Zielgruppe.

ZIELGRUPPE: ${audience}
SPRACHE: ${language}

VERFUEGBARE KUNSTWERKE:
${artworks.map((a, i) => `${i + 1}. "${a.title}" von ${a.artist} — ${a.description.slice(0, 100)}...`).join('\n')}

Erstelle eine Fuehrung mit 5-8 Werken. Antworte NUR mit einem JSON-Objekt:
{
  "title": "Titel der Fuehrung",
  "description": "Kurze Beschreibung (2-3 Saetze)",
  "duration_minutes": 45,
  "selected_artwork_indices": [0, 2, 4, 1, 3],
  "intro_text": "Begruessungstext fuer die Fuehrung",
  "outro_text": "Abschlusstext fuer die Fuehrung",
  "thematic_thread": "Was verbindet diese Werke inhaltlich?"
}`
}
