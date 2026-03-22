// Admin UI translation strings — DE (default) and EN
// Used by the curator dashboard, content management, and all admin components

export interface AdminStrings {
  [key: string]: string
}

export const adminDe: AdminStrings = {
  // Navigation
  'admin.nav.dashboard': 'Dashboard',
  'admin.nav.museums': 'Museen',
  'admin.nav.onboarding': 'Onboarding',
  'admin.nav.artworks': 'Exponate',
  'admin.nav.venues': 'Raeume',
  'admin.nav.tours': 'Fuehrungen',
  'admin.nav.team': 'Team',
  'admin.nav.contentImport': 'Content Import',
  'admin.nav.content': 'Content & POIs',
  'admin.nav.sort': 'Sortierung',
  'admin.nav.quickEdit': 'Schnellbearbeitung',
  'admin.nav.quality': 'Qualitaet',
  'admin.nav.preview': 'Vorschau',
  'admin.nav.ai': 'KI & Uebersetzung',
  'admin.nav.qr': 'QR-Codes',
  'admin.nav.analytics': 'Analysen',
  'admin.nav.workflow': 'Workflow',
  'admin.nav.crm': 'CRM & Sales',

  // Dashboard
  'admin.dashboard.title': 'Curator Dashboard',
  'admin.dashboard.subtitle': 'Ueberblick ueber alle Inhalte, Status und naechste Schritte.',
  'admin.dashboard.total': 'Gesamt',
  'admin.dashboard.live': 'Live',
  'admin.dashboard.drafts': 'Entwuerfe',
  'admin.dashboard.inReview': 'In Review',
  'admin.dashboard.withImage': 'Mit Bild',
  'admin.dashboard.withAudio': 'Mit Audio',
  'admin.dashboard.quality': 'Inhaltsqualitaet',
  'admin.dashboard.qualityHint': 'Anteil der Eintraege mit Kurz- und Standardbeschreibung.',
  'admin.dashboard.views': 'Seitenaufrufe',
  'admin.dashboard.viewsTotal': 'Gesamte Views aller Inhalte.',
  'admin.dashboard.last7days': 'Letzte 7 Tage',
  'admin.dashboard.recentHint': 'Eintraege aktualisiert in den letzten 7 Tagen.',
  'admin.dashboard.quickAccess': 'Schnellzugriff',
  'admin.dashboard.recentChanges': 'Letzte Aenderungen',
  'admin.dashboard.showAll': 'Alle anzeigen',
  'admin.dashboard.needsAttention': 'Braucht Aufmerksamkeit',
  'admin.dashboard.allDone': 'Alles erledigt!',
  'admin.dashboard.statusDistribution': 'Status-Verteilung',

  // Quick Actions
  'admin.action.newContent': 'Neuer Inhalt',
  'admin.action.newContentDesc': 'POI manuell anlegen',
  'admin.action.import': 'Import',
  'admin.action.importDesc': 'CSV/JSON importieren',
  'admin.action.aiEnrich': 'KI anreichern',
  'admin.action.aiEnrichDesc': 'Texte generieren',
  'admin.action.analytics': 'Analysen',
  'admin.action.analyticsDesc': 'Nutzungsstatistiken',

  // Content Manager
  'admin.content.title': 'Content & POIs',
  'admin.content.subtitle': '{count} Inhalte — universelles Content-Management fuer alle Domains.',
  'admin.content.new': 'Neuer Inhalt',
  'admin.content.aiScout': 'KI City-Scout',
  'admin.content.searching': 'KI erkundet...',
  'admin.content.empty': 'Keine Inhalte',
  'admin.content.emptyHint': 'Erstelle POIs manuell, importiere ueber Content Import, oder nutze den KI City-Scout.',
  'admin.content.delete': 'Inhalt wirklich loeschen?',
  'admin.content.save': 'Speichern',
  'admin.content.create': 'Anlegen',
  'admin.content.cancel': 'Abbrechen',
  'admin.content.edit': 'Bearbeiten',
  'admin.content.enrich': 'KI anreichern',
  'admin.content.enriching': 'Generiere...',

  // Status
  'admin.status.draft': 'Entwurf',
  'admin.status.review': 'Review',
  'admin.status.published': 'Live',
  'admin.status.archived': 'Archiviert',

  // Sort
  'admin.sort.title': 'Reihenfolge sortieren',
  'admin.sort.subtitle': 'Ziehe Eintraege per Drag & Drop oder nutze die Pfeiltasten.',
  'admin.sort.reset': 'Zuruecksetzen',
  'admin.sort.save': 'Reihenfolge speichern',
  'admin.sort.saving': 'Speichere...',
  'admin.sort.saved': 'Gespeichert',
  'admin.sort.changed': 'Reihenfolge geaendert — klicke "Reihenfolge speichern" um die Aenderungen zu uebernehmen.',
  'admin.sort.empty': 'Keine Inhalte zum Sortieren vorhanden.',
  'admin.sort.noMatch': 'Keine Treffer fuer diese Suche.',

  // Inline Edit
  'admin.edit.title': 'Schnellbearbeitung',
  'admin.edit.subtitle': 'Klicke auf ein Feld um es direkt zu bearbeiten. Enter speichert, Escape bricht ab.',
  'admin.edit.noTags': 'keine Tags',
  'admin.edit.clickToEdit': 'Klicken zum Bearbeiten',

  // Validation
  'admin.validation.title': 'Content-Qualitaet',
  'admin.validation.missing': 'Fehlt',
  'admin.validation.incomplete': 'Unvollstaendig',
  'admin.validation.ready': 'Bereit',
  'admin.validation.average': 'Durchschnitt',

  // Import
  'admin.import.title': 'Daten importieren',
  'admin.import.upload': 'Datei hochladen',
  'admin.import.preview': 'Vorschau',
  'admin.import.mapping': 'Feldzuordnung',
  'admin.import.review': 'Pruefen',
  'admin.import.importing': 'Importiere...',
  'admin.import.done': 'Fertig',
  'admin.import.duplicates': 'Duplikate erkannt',

  // Workflow
  'admin.workflow.title': 'Workflow-Automatisierung',
  'admin.workflow.subtitle': 'Regeln fuer automatische Status-Wechsel, Benachrichtigungen und KI-Aktionen.',
  'admin.workflow.addRule': 'Regel hinzufuegen',
  'admin.workflow.chooseTemplate': 'Vorlage auswaehlen',
  'admin.workflow.rules': 'Regeln gesamt',
  'admin.workflow.active': 'Aktiv',
  'admin.workflow.inactive': 'Inaktiv',
  'admin.workflow.executions': 'Ausfuehrungen',
  'admin.workflow.runNow': 'Jetzt ausfuehren',
  'admin.workflow.empty': 'Keine Workflow-Regeln',
  'admin.workflow.emptyHint': 'Erstelle Regeln um wiederkehrende Aufgaben zu automatisieren.',
  'admin.workflow.firstRule': 'Erste Regel erstellen',
  'admin.workflow.conditions': 'Bedingung',
  'admin.workflow.conditions_plural': 'Bedingungen',

  // Preview
  'admin.preview.title': 'Besucher-Vorschau',
  'admin.preview.subtitle': 'Vorschau wie Besucher den Inhalt auf verschiedenen Geraeten sehen.',
  'admin.preview.language': 'Sprache',
  'admin.preview.audience': 'Zielgruppe',
  'admin.preview.device': 'Geraet',
  'admin.preview.content': 'Inhalt',
  'admin.preview.mobile': 'Mobil',
  'admin.preview.tablet': 'Tablet',
  'admin.preview.desktop': 'Desktop',
  'admin.preview.standard': 'Standard',
  'admin.preview.children': 'Kinder (6-12)',
  'admin.preview.youth': 'Jugendliche (13-17)',
  'admin.preview.detailed': 'Detailliert',
  'admin.preview.noContent': 'Kein Inhalt fuer Sprache "{lang}" und Zielgruppe "{audience}" vorhanden.',
  'admin.preview.select': 'Waehle einen Eintrag aus der Liste.',
  'admin.preview.prev': 'Vorheriger',
  'admin.preview.next': 'Naechster',

  // Timeline
  'admin.timeline.title': 'Aenderungsverlauf',
  'admin.timeline.refresh': 'Aktualisieren',
  'admin.timeline.empty': 'Noch keine Aenderungen erfasst.',
  'admin.timeline.statusChange': 'Status geaendert',
  'admin.timeline.contentEdit': 'Inhalt bearbeitet',
  'admin.timeline.aiEnrich': 'KI-Anreicherung',
  'admin.timeline.aiTranslate': 'KI-Uebersetzung',
  'admin.timeline.mediaUpload': 'Medien hochgeladen',
  'admin.timeline.audioGenerate': 'Audio generiert',
  'admin.timeline.created': 'Erstellt',
  'admin.timeline.note': 'Notiz',

  // Tooltips / Help
  'admin.help.contentBrief': 'Wird in Listenansichten und Kartenvorschauen angezeigt.',
  'admin.help.contentStandard': 'Haupttext fuer die Detailseite.',
  'admin.help.contentDetailed': 'Ausfuehrlicher Text fuer besonders interessierte Besucher.',
  'admin.help.contentChildren': 'Text fuer Kinder zwischen 6 und 12 Jahren.',
  'admin.help.tags': 'Helfen Besuchern, verwandte Inhalte zu finden.',
  'admin.help.slug': 'Wird in der Web-Adresse verwendet.',

  // Permissions
  'admin.perm.viewer': 'Betrachter',
  'admin.perm.editor': 'Bearbeiter',
  'admin.perm.publisher': 'Redakteur',
  'admin.perm.manager': 'Manager',
  'admin.perm.admin': 'Administrator',
  'admin.perm.noAccess': 'Kein Zugriff',
  'admin.perm.noPermission': 'Du hast keine Berechtigung fuer diese Aktion.',

  // Common
  'admin.common.search': 'Suchen...',
  'admin.common.filter': 'Filtern',
  'admin.common.all': 'Alle',
  'admin.common.loading': 'Wird geladen...',
  'admin.common.noResults': 'Keine Ergebnisse',
  'admin.common.entries': 'Eintraege',
  'admin.common.filtered': '(gefiltert)',
  'admin.common.justNow': 'gerade eben',
  'admin.common.minutesAgo': 'vor {n} Min.',
  'admin.common.hoursAgo': 'vor {n} Std.',
  'admin.common.daysAgo': 'vor {n} Tagen',
  'admin.common.weeksAgo': 'vor {n} Wo.',
  'admin.common.monthsAgo': 'vor {n} Mon.',
}

export const adminEn: AdminStrings = {
  // Navigation
  'admin.nav.dashboard': 'Dashboard',
  'admin.nav.museums': 'Museums',
  'admin.nav.onboarding': 'Onboarding',
  'admin.nav.artworks': 'Artworks',
  'admin.nav.venues': 'Venues',
  'admin.nav.tours': 'Tours',
  'admin.nav.team': 'Team',
  'admin.nav.contentImport': 'Content Import',
  'admin.nav.content': 'Content & POIs',
  'admin.nav.sort': 'Sort Order',
  'admin.nav.quickEdit': 'Quick Edit',
  'admin.nav.quality': 'Quality',
  'admin.nav.preview': 'Preview',
  'admin.nav.ai': 'AI & Translation',
  'admin.nav.qr': 'QR Codes',
  'admin.nav.analytics': 'Analytics',
  'admin.nav.workflow': 'Workflow',
  'admin.nav.crm': 'CRM & Sales',

  // Dashboard
  'admin.dashboard.title': 'Curator Dashboard',
  'admin.dashboard.subtitle': 'Overview of all content, status, and next steps.',
  'admin.dashboard.total': 'Total',
  'admin.dashboard.live': 'Live',
  'admin.dashboard.drafts': 'Drafts',
  'admin.dashboard.inReview': 'In Review',
  'admin.dashboard.withImage': 'With Image',
  'admin.dashboard.withAudio': 'With Audio',
  'admin.dashboard.quality': 'Content Quality',
  'admin.dashboard.qualityHint': 'Percentage of entries with brief and standard descriptions.',
  'admin.dashboard.views': 'Page Views',
  'admin.dashboard.viewsTotal': 'Total views across all content.',
  'admin.dashboard.last7days': 'Last 7 Days',
  'admin.dashboard.recentHint': 'Entries updated in the last 7 days.',
  'admin.dashboard.quickAccess': 'Quick Access',
  'admin.dashboard.recentChanges': 'Recent Changes',
  'admin.dashboard.showAll': 'Show All',
  'admin.dashboard.needsAttention': 'Needs Attention',
  'admin.dashboard.allDone': 'All done!',
  'admin.dashboard.statusDistribution': 'Status Distribution',

  // Quick Actions
  'admin.action.newContent': 'New Content',
  'admin.action.newContentDesc': 'Create POI manually',
  'admin.action.import': 'Import',
  'admin.action.importDesc': 'Import CSV/JSON',
  'admin.action.aiEnrich': 'AI Enrich',
  'admin.action.aiEnrichDesc': 'Generate texts',
  'admin.action.analytics': 'Analytics',
  'admin.action.analyticsDesc': 'Usage statistics',

  // Content Manager
  'admin.content.title': 'Content & POIs',
  'admin.content.subtitle': '{count} items — universal content management for all domains.',
  'admin.content.new': 'New Content',
  'admin.content.aiScout': 'AI City Scout',
  'admin.content.searching': 'AI exploring...',
  'admin.content.empty': 'No Content',
  'admin.content.emptyHint': 'Create POIs manually, import via Content Import, or use the AI City Scout.',
  'admin.content.delete': 'Really delete this content?',
  'admin.content.save': 'Save',
  'admin.content.create': 'Create',
  'admin.content.cancel': 'Cancel',
  'admin.content.edit': 'Edit',
  'admin.content.enrich': 'AI Enrich',
  'admin.content.enriching': 'Generating...',

  // Status
  'admin.status.draft': 'Draft',
  'admin.status.review': 'Review',
  'admin.status.published': 'Live',
  'admin.status.archived': 'Archived',

  // Sort
  'admin.sort.title': 'Sort Order',
  'admin.sort.subtitle': 'Drag entries to reorder or use arrow keys.',
  'admin.sort.reset': 'Reset',
  'admin.sort.save': 'Save Order',
  'admin.sort.saving': 'Saving...',
  'admin.sort.saved': 'Saved',
  'admin.sort.changed': 'Order changed — click "Save Order" to apply.',
  'admin.sort.empty': 'No content to sort.',
  'admin.sort.noMatch': 'No results for this search.',

  // Inline Edit
  'admin.edit.title': 'Quick Edit',
  'admin.edit.subtitle': 'Click a field to edit inline. Enter saves, Escape cancels.',
  'admin.edit.noTags': 'no tags',
  'admin.edit.clickToEdit': 'Click to edit',

  // Validation
  'admin.validation.title': 'Content Quality',
  'admin.validation.missing': 'Missing',
  'admin.validation.incomplete': 'Incomplete',
  'admin.validation.ready': 'Ready',
  'admin.validation.average': 'Average',

  // Import
  'admin.import.title': 'Import Data',
  'admin.import.upload': 'Upload File',
  'admin.import.preview': 'Preview',
  'admin.import.mapping': 'Field Mapping',
  'admin.import.review': 'Review',
  'admin.import.importing': 'Importing...',
  'admin.import.done': 'Done',
  'admin.import.duplicates': 'Duplicates detected',

  // Workflow
  'admin.workflow.title': 'Workflow Automation',
  'admin.workflow.subtitle': 'Rules for automatic status changes, notifications, and AI actions.',
  'admin.workflow.addRule': 'Add Rule',
  'admin.workflow.chooseTemplate': 'Choose Template',
  'admin.workflow.rules': 'Total Rules',
  'admin.workflow.active': 'Active',
  'admin.workflow.inactive': 'Inactive',
  'admin.workflow.executions': 'Executions',
  'admin.workflow.runNow': 'Run Now',
  'admin.workflow.empty': 'No Workflow Rules',
  'admin.workflow.emptyHint': 'Create rules to automate recurring tasks.',
  'admin.workflow.firstRule': 'Create First Rule',
  'admin.workflow.conditions': 'Condition',
  'admin.workflow.conditions_plural': 'Conditions',

  // Preview
  'admin.preview.title': 'Visitor Preview',
  'admin.preview.subtitle': 'Preview how visitors see the content on different devices.',
  'admin.preview.language': 'Language',
  'admin.preview.audience': 'Audience',
  'admin.preview.device': 'Device',
  'admin.preview.content': 'Content',
  'admin.preview.mobile': 'Mobile',
  'admin.preview.tablet': 'Tablet',
  'admin.preview.desktop': 'Desktop',
  'admin.preview.standard': 'Standard',
  'admin.preview.children': 'Children (6-12)',
  'admin.preview.youth': 'Youth (13-17)',
  'admin.preview.detailed': 'Detailed',
  'admin.preview.noContent': 'No content for language "{lang}" and audience "{audience}".',
  'admin.preview.select': 'Select an entry from the list.',
  'admin.preview.prev': 'Previous',
  'admin.preview.next': 'Next',

  // Timeline
  'admin.timeline.title': 'Change History',
  'admin.timeline.refresh': 'Refresh',
  'admin.timeline.empty': 'No changes recorded yet.',
  'admin.timeline.statusChange': 'Status changed',
  'admin.timeline.contentEdit': 'Content edited',
  'admin.timeline.aiEnrich': 'AI enrichment',
  'admin.timeline.aiTranslate': 'AI translation',
  'admin.timeline.mediaUpload': 'Media uploaded',
  'admin.timeline.audioGenerate': 'Audio generated',
  'admin.timeline.created': 'Created',
  'admin.timeline.note': 'Note',

  // Tooltips / Help
  'admin.help.contentBrief': 'Shown in list views and card previews.',
  'admin.help.contentStandard': 'Main text for the detail page.',
  'admin.help.contentDetailed': 'Extended text for highly interested visitors.',
  'admin.help.contentChildren': 'Text for children ages 6-12.',
  'admin.help.tags': 'Help visitors find related content.',
  'admin.help.slug': 'Used in the web address.',

  // Permissions
  'admin.perm.viewer': 'Viewer',
  'admin.perm.editor': 'Editor',
  'admin.perm.publisher': 'Publisher',
  'admin.perm.manager': 'Manager',
  'admin.perm.admin': 'Admin',
  'admin.perm.noAccess': 'No Access',
  'admin.perm.noPermission': 'You do not have permission for this action.',

  // Common
  'admin.common.search': 'Search...',
  'admin.common.filter': 'Filter',
  'admin.common.all': 'All',
  'admin.common.loading': 'Loading...',
  'admin.common.noResults': 'No Results',
  'admin.common.entries': 'entries',
  'admin.common.filtered': '(filtered)',
  'admin.common.justNow': 'just now',
  'admin.common.minutesAgo': '{n} min ago',
  'admin.common.hoursAgo': '{n}h ago',
  'admin.common.daysAgo': '{n}d ago',
  'admin.common.weeksAgo': '{n}w ago',
  'admin.common.monthsAgo': '{n}mo ago',
}

// ── Helper: get admin translations for current language ─────────────

export type AdminLang = 'de' | 'en'

const ADMIN_LOCALES: Record<AdminLang, AdminStrings> = {
  de: adminDe,
  en: adminEn,
}

let currentAdminLang: AdminLang = 'de'

export function setAdminLang(lang: AdminLang): void {
  currentAdminLang = lang
}

export function getAdminLang(): AdminLang {
  return currentAdminLang
}

/**
 * Get a translated admin string.
 * Supports simple interpolation: t('key', { count: 5 }) replaces {count} with 5.
 */
export function ta(key: string, params?: Record<string, string | number>): string {
  let text = ADMIN_LOCALES[currentAdminLang]?.[key] || ADMIN_LOCALES.de[key] || key

  if (params) {
    for (const [k, v] of Object.entries(params)) {
      text = text.replace(`{${k}}`, String(v))
    }
  }

  return text
}
