// Fintutto World — Field Tooltip / Help Text System
// Kontextbezogene Hilfe-Texte fuer alle Formularfelder im Admin-Bereich
// Zeigt Erklaerungen, Best Practices und Beispiele per Hover/Klick

import { useState } from 'react'
import {
  Tooltip, TooltipContent, TooltipTrigger, TooltipProvider,
} from '@/components/ui/tooltip'
import { HelpCircle } from 'lucide-react'

// ── Help Text Registry ──────────────────────────────────────────────

export interface FieldHelpEntry {
  label: string
  description: string
  example?: string
  bestPractice?: string
}

export const FIELD_HELP: Record<string, FieldHelpEntry> = {
  // Content Fields (MultiLangEditor)
  content_brief: {
    label: 'Kurzbeschreibung',
    description: 'Wird in Listenansichten und Kartenvorschauen angezeigt. Sollte neugierig machen.',
    example: 'Das Goldene Dachl ist das Wahrzeichen Innsbrucks und stammt aus dem 15. Jahrhundert.',
    bestPractice: '1-2 Saetze, max. 160 Zeichen. Wie ein Social-Media-Teaser.',
  },
  content_standard: {
    label: 'Standardbeschreibung',
    description: 'Haupttext fuer die Detailseite. Wird den meisten Besuchern angezeigt.',
    example: 'Das Goldene Dachl wurde 1500 von Kaiser Maximilian I. errichtet...',
    bestPractice: '4-6 Saetze. Allgemeinverstaendlich, informativ, lebendig.',
  },
  content_detailed: {
    label: 'Detaillierte Beschreibung',
    description: 'Ausfuehrlicher Text fuer besonders interessierte Besucher.',
    bestPractice: '8-15 Saetze. Hintergrundinformationen, Kontext, Zusammenhaenge.',
  },
  content_children: {
    label: 'Kinderbeschreibung',
    description: 'Text fuer Kinder zwischen 6 und 12 Jahren.',
    example: 'Stell dir vor, du bist ein Kaiser und willst ein ganz besonderes Dach bauen...',
    bestPractice: 'Kurze Saetze, einfache Woerter, lebendige Bilder. Du-Ansprache.',
  },
  content_youth: {
    label: 'Jugendbeschreibung',
    description: 'Text fuer Jugendliche zwischen 13 und 17 Jahren.',
    bestPractice: 'Cool aber respektvoll. Bezuege zur Lebenswelt der Zielgruppe.',
  },
  content_fun_facts: {
    label: 'Fun Facts',
    description: 'Ueberraschende, unterhaltsame Fakten ueber das Objekt.',
    example: 'Das Dach besteht aus 2.657 vergoldeten Kupferschindeln.',
    bestPractice: 'Jeder Fakt eine eigene Zeile. Kurz, knackig, staunensausloeend.',
  },
  content_historical: {
    label: 'Historischer Kontext',
    description: 'Zeitgeschichtlicher Hintergrund. Was passierte zur Entstehungszeit?',
    bestPractice: 'Epoche einordnen, wichtige Ereignisse nennen, Zusammenhaenge herstellen.',
  },
  content_technique: {
    label: 'Technik-Details',
    description: 'Materialien, Arbeitsweise, kuenstlerische Technik.',
    bestPractice: 'Fachbegriffe erklaeren. Fuer Kunstinteressierte und Fachpublikum.',
  },

  // General Content Fields
  name: {
    label: 'Name / Titel',
    description: 'Offizieller Name des Eintrags. Wird als Ueberschrift angezeigt.',
    bestPractice: 'Korrekter, vollstaendiger Name. Keine Abkuerzungen.',
  },
  slug: {
    label: 'URL-Slug',
    description: 'Wird in der Web-Adresse verwendet. Automatisch generiert aus dem Namen.',
    example: 'goldenes-dachl',
    bestPractice: 'Kleinbuchstaben, Bindestriche statt Leerzeichen, keine Umlaute.',
  },
  tags: {
    label: 'Tags / Schlagwoerter',
    description: 'Helfen Besuchern, verwandte Inhalte zu finden.',
    example: 'Renaissance, Maximilian I., Wahrzeichen, Architektur',
    bestPractice: 'Kommagetrennt. 3-8 Tags pro Eintrag. Allgemein + spezifisch mischen.',
  },
  status: {
    label: 'Status',
    description: 'Steuert die Sichtbarkeit: Entwurf (nur intern), Review (zur Pruefung), Live (oeffentlich), Archiviert (versteckt).',
    bestPractice: 'Neue Eintraege starten als Entwurf. Erst nach Pruefung auf Live setzen.',
  },

  // Museum / POI Fields
  lat: {
    label: 'Breitengrad (Latitude)',
    description: 'GPS-Koordinate Nord-Sued. Wird fuer die Kartenanzeige benoetigt.',
    example: '47.26866',
    bestPractice: 'Dezimalformat mit mind. 5 Nachkommastellen fuer Genauigkeit.',
  },
  lng: {
    label: 'Laengengrad (Longitude)',
    description: 'GPS-Koordinate Ost-West. Wird fuer die Kartenanzeige benoetigt.',
    example: '11.39354',
    bestPractice: 'Dezimalformat mit mind. 5 Nachkommastellen fuer Genauigkeit.',
  },
  domain: {
    label: 'Bereich',
    description: 'Ordnet den Eintrag einem Themenbereich zu: Stadt, Region, Natur oder Event.',
    bestPractice: 'Pro Eintrag genau einen Bereich waehlen.',
  },
  content_type: {
    label: 'Inhaltstyp',
    description: 'Art des Eintrags: Sehenswuerdigkeit, Museum, Restaurant, Park usw.',
    bestPractice: 'Moeglichst spezifisch waehlen fuer bessere Filterung.',
  },
  rating_avg: {
    label: 'Durchschnittsbewertung',
    description: 'Durchschnittliche Bewertung durch Besucher (1-5 Sterne).',
    bestPractice: 'Wird automatisch berechnet. Manuell nur fuer Importdaten setzen.',
  },
  is_highlight: {
    label: 'Highlight',
    description: 'Markiert den Eintrag als besonders sehenswert. Wird prominent angezeigt.',
    bestPractice: 'Sparsam einsetzen — max. 10-15% der Eintraege als Highlight.',
  },

  // Import Fields
  import_file: {
    label: 'Import-Datei',
    description: 'CSV, TSV oder JSON-Datei mit den zu importierenden Daten.',
    bestPractice: 'CSV mit Semikolon-Trennung und UTF-8 Kodierung fuer beste Kompatibilitaet.',
  },
  field_mapping: {
    label: 'Feld-Zuordnung',
    description: 'Ordnet Spalten der Import-Datei den Zielfeldern in der Datenbank zu.',
    bestPractice: 'Spaltenkoepfe in der Datei sollten den Feldnamen aehneln fuer automatische Erkennung.',
  },

  // Audio / TTS Fields
  audio_voice: {
    label: 'Sprechstimme',
    description: 'Google Neural2 Stimme fuer die automatische Audiogenerierung.',
    bestPractice: 'Pro Sprache eine passende Stimme waehlen. Vorhoeren empfohlen.',
  },
  audio_speed: {
    label: 'Sprechgeschwindigkeit',
    description: 'Tempo der generierten Audioausgabe (0.5 = langsam, 1.0 = normal, 2.0 = schnell).',
    bestPractice: 'Fuer Museen 0.9-1.0 empfohlen. Kindertexte etwas langsamer (0.85).',
  },
}

// ── FieldTooltip Component ──────────────────────────────────────────

interface FieldTooltipProps {
  /** Key matching FIELD_HELP registry */
  fieldKey: string
  /** Override label (optional) */
  label?: string
  /** Inline or icon-only mode */
  mode?: 'icon' | 'inline'
  /** Custom class */
  className?: string
}

export default function FieldTooltip({
  fieldKey,
  label,
  mode = 'icon',
  className = '',
}: FieldTooltipProps) {
  const help = FIELD_HELP[fieldKey]
  if (!help) return null

  const content = (
    <div className="max-w-xs space-y-1.5 text-xs">
      <div className="font-semibold">{label || help.label}</div>
      <div className="text-muted-foreground">{help.description}</div>
      {help.example && (
        <div>
          <span className="font-medium">Beispiel: </span>
          <span className="italic text-muted-foreground">{help.example}</span>
        </div>
      )}
      {help.bestPractice && (
        <div>
          <span className="font-medium">Tipp: </span>
          <span className="text-muted-foreground">{help.bestPractice}</span>
        </div>
      )}
    </div>
  )

  if (mode === 'inline') {
    return (
      <div className={`text-xs text-muted-foreground bg-muted/30 rounded-md p-2 ${className}`}>
        <div className="font-medium mb-0.5">{label || help.label}</div>
        <div>{help.description}</div>
        {help.bestPractice && (
          <div className="mt-1 text-[10px]">Tipp: {help.bestPractice}</div>
        )}
      </div>
    )
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            className={`inline-flex items-center justify-center text-muted-foreground hover:text-foreground transition ${className}`}
            aria-label={`Hilfe: ${label || help.label}`}
          >
            <HelpCircle className="h-3.5 w-3.5" />
          </button>
        </TooltipTrigger>
        <TooltipContent side="top" align="start" className="p-3">
          {content}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

// ── useFieldHelp Hook ───────────────────────────────────────────────

export function useFieldHelp(fieldKey: string): FieldHelpEntry | null {
  return FIELD_HELP[fieldKey] || null
}
