// Cruise phrase pack definitions and loader
// Pre-defined phrases for common cruise scenarios

export interface Phrase {
  text: string
  category: string
}

export interface PhrasePack {
  id: string
  name: string
  description: string
  icon: string
  phrases: Phrase[]
}

export const PHRASE_PACKS: PhrasePack[] = [
  {
    id: 'common',
    name: 'Basis-Phrasen',
    description: 'Grundlegende Sätze für jede Reise',
    icon: '🌍',
    phrases: [
      // Greetings
      { text: 'Hallo, wie geht es Ihnen?', category: 'Begrüßung' },
      { text: 'Guten Tag!', category: 'Begrüßung' },
      { text: 'Guten Morgen!', category: 'Begrüßung' },
      { text: 'Auf Wiedersehen!', category: 'Begrüßung' },
      { text: 'Vielen Dank!', category: 'Begrüßung' },
      { text: 'Bitte', category: 'Begrüßung' },
      { text: 'Entschuldigung', category: 'Begrüßung' },
      { text: 'Ja / Nein', category: 'Begrüßung' },
      { text: 'Sprechen Sie Englisch?', category: 'Begrüßung' },
      { text: 'Ich verstehe nicht.', category: 'Begrüßung' },

      // Navigation
      { text: 'Wo ist die nächste U-Bahn-Station?', category: 'Navigation' },
      { text: 'Wie komme ich zum Hafen?', category: 'Navigation' },
      { text: 'Können Sie mir den Weg zeigen?', category: 'Navigation' },
      { text: 'Ist es weit zu Fuß?', category: 'Navigation' },
      { text: 'Wo ist die nächste Bushaltestelle?', category: 'Navigation' },
      { text: 'Ich suche ein Taxi.', category: 'Navigation' },
      { text: 'Links / Rechts / Geradeaus', category: 'Navigation' },

      // Essen & Trinken
      { text: 'Ich hätte gerne die Speisekarte.', category: 'Essen' },
      { text: 'Was empfehlen Sie?', category: 'Essen' },
      { text: 'Die Rechnung, bitte.', category: 'Essen' },
      { text: 'Ich bin allergisch gegen...', category: 'Essen' },
      { text: 'Ein Wasser, bitte.', category: 'Essen' },
      { text: 'Gibt es vegetarische Gerichte?', category: 'Essen' },
      { text: 'Das war sehr lecker!', category: 'Essen' },
      { text: 'Ist Trinkgeld inbegriffen?', category: 'Essen' },

      // Shopping
      { text: 'Was kostet das?', category: 'Shopping' },
      { text: 'Haben Sie das in einer anderen Größe?', category: 'Shopping' },
      { text: 'Kann ich mit Karte bezahlen?', category: 'Shopping' },
      { text: 'Wo ist der nächste Geldautomat?', category: 'Shopping' },
      { text: 'Kann ich das anprobieren?', category: 'Shopping' },
      { text: 'Das ist zu teuer.', category: 'Shopping' },

      // Notfälle
      { text: 'Ich brauche Hilfe!', category: 'Notfall' },
      { text: 'Rufen Sie bitte einen Krankenwagen!', category: 'Notfall' },
      { text: 'Wo ist das nächste Krankenhaus?', category: 'Notfall' },
      { text: 'Wo ist die nächste Apotheke?', category: 'Notfall' },
      { text: 'Ich habe meinen Pass verloren.', category: 'Notfall' },
      { text: 'Wo ist die Polizei?', category: 'Notfall' },
      { text: 'Ich brauche einen Arzt.', category: 'Notfall' },
    ],
  },
  {
    id: 'mediterranean',
    name: 'Mittelmeer-Kreuzfahrt',
    description: 'Sätze für Mittelmeer-Häfen: Italien, Griechenland, Spanien, Frankreich',
    icon: '🚢',
    phrases: [
      // Hafen & Transport
      { text: 'Wann legt das Schiff wieder ab?', category: 'Hafen' },
      { text: 'Wo ist das Kreuzfahrt-Terminal?', category: 'Hafen' },
      { text: 'Gibt es einen Shuttle zum Stadtzentrum?', category: 'Hafen' },
      { text: 'Wie viel kostet ein Taxi in die Altstadt?', category: 'Hafen' },
      { text: 'Ich muss bis 17 Uhr zurück am Schiff sein.', category: 'Hafen' },
      { text: 'Können Sie mich zum Hafen zurückbringen?', category: 'Hafen' },

      // Sehenswürdigkeiten
      { text: 'Wo kann ich Tickets kaufen?', category: 'Sightseeing' },
      { text: 'Gibt es eine Führung auf Deutsch?', category: 'Sightseeing' },
      { text: 'Wie lange dauert die Tour?', category: 'Sightseeing' },
      { text: 'Ist das Museum heute geöffnet?', category: 'Sightseeing' },
      { text: 'Was ist die berühmteste Sehenswürdigkeit hier?', category: 'Sightseeing' },
      { text: 'Darf man hier fotografieren?', category: 'Sightseeing' },
      { text: 'Gibt es einen Audioguide?', category: 'Sightseeing' },

      // Lokales Essen
      { text: 'Was ist die lokale Spezialität?', category: 'Lokales Essen' },
      { text: 'Gibt es ein gutes Restaurant in der Nähe?', category: 'Lokales Essen' },
      { text: 'Ich möchte lokalen Wein probieren.', category: 'Lokales Essen' },
      { text: 'Ist dieses Restaurant typisch für die Region?', category: 'Lokales Essen' },
      { text: 'Ein Espresso, bitte.', category: 'Lokales Essen' },
      { text: 'Können Sie etwas Typisches empfehlen?', category: 'Lokales Essen' },

      // Strand & Meer
      { text: 'Wo ist der nächste Strand?', category: 'Strand' },
      { text: 'Kann man hier Liegen und Sonnenschirme mieten?', category: 'Strand' },
      { text: 'Ist das Wasser hier sicher zum Schwimmen?', category: 'Strand' },
      { text: 'Wo kann ich Schnorchelausrüstung leihen?', category: 'Strand' },

      // Praktisches
      { text: 'Gibt es hier kostenloses WLAN?', category: 'Praktisch' },
      { text: 'Wo kann ich eine SIM-Karte kaufen?', category: 'Praktisch' },
      { text: 'Können Sie mir ein Foto machen?', category: 'Praktisch' },
      { text: 'Wo ist die nächste Toilette?', category: 'Praktisch' },
      { text: 'Wie spät ist es?', category: 'Praktisch' },
      { text: 'Wo kann ich Souvenirs kaufen?', category: 'Praktisch' },
    ],
  },
  {
    id: 'nordic',
    name: 'Nordland-Kreuzfahrt',
    description: 'Sätze für Skandinavien und Nordland-Häfen',
    icon: '🏔️',
    phrases: [
      { text: 'Wo kann ich die Fjorde am besten sehen?', category: 'Sightseeing' },
      { text: 'Gibt es eine Wanderung zum Aussichtspunkt?', category: 'Sightseeing' },
      { text: 'Wann geht die Sonne heute unter?', category: 'Sightseeing' },
      { text: 'Kann man hier Nordlichter sehen?', category: 'Sightseeing' },
      { text: 'Wo kann ich frischen Fisch kaufen?', category: 'Lokales Essen' },
      { text: 'Ich möchte Lachs probieren.', category: 'Lokales Essen' },
      { text: 'Brauche ich eine warme Jacke?', category: 'Praktisch' },
      { text: 'Wie ist das Wetter morgen?', category: 'Praktisch' },
      { text: 'Gibt es Bootstouren zu den Inseln?', category: 'Ausflüge' },
      { text: 'Wo startet die Walbeobachtungstour?', category: 'Ausflüge' },
      { text: 'Kann ich hier angeln?', category: 'Ausflüge' },
      { text: 'Gibt es Rabatte für Kreuzfahrt-Passagiere?', category: 'Shopping' },
    ],
  },
  {
    id: 'migrant',
    name: 'Behörden & Alltag',
    description: 'Wichtige Sätze für Ämter, Arzt, Wohnung, Arbeit und Alltag in Deutschland',
    icon: '🏛️',
    phrases: [
      // Behörde / Amt
      { text: 'Ich habe einen Termin.', category: 'Behörde' },
      { text: 'Wo ist das Ausländeramt?', category: 'Behörde' },
      { text: 'Ich brauche eine Aufenthaltserlaubnis.', category: 'Behörde' },
      { text: 'Können Sie mir das Formular erklären?', category: 'Behörde' },
      { text: 'Welche Dokumente brauche ich?', category: 'Behörde' },
      { text: 'Wo muss ich unterschreiben?', category: 'Behörde' },
      { text: 'Ich brauche einen Dolmetscher.', category: 'Behörde' },
      { text: 'Ich möchte einen Antrag stellen.', category: 'Behörde' },
      { text: 'Wann bekomme ich einen Bescheid?', category: 'Behörde' },
      { text: 'Ich verstehe den Brief nicht. Können Sie ihn mir erklären?', category: 'Behörde' },
      { text: 'Mein Ausweis / Pass', category: 'Behörde' },
      { text: 'Ich habe eine Duldung / Aufenthaltsgestattung.', category: 'Behörde' },

      // Arzt / Gesundheit
      { text: 'Ich habe Schmerzen.', category: 'Arzt' },
      { text: 'Ich brauche einen Arzt.', category: 'Arzt' },
      { text: 'Wo ist die nächste Notaufnahme?', category: 'Arzt' },
      { text: 'Ich bin schwanger.', category: 'Arzt' },
      { text: 'Mein Kind ist krank.', category: 'Arzt' },
      { text: 'Ich brauche ein Rezept.', category: 'Arzt' },
      { text: 'Ich bin allergisch gegen...', category: 'Arzt' },
      { text: 'Ich nehme diese Medikamente.', category: 'Arzt' },
      { text: 'Ich habe Fieber.', category: 'Arzt' },
      { text: 'Ich habe Kopfschmerzen / Bauchschmerzen.', category: 'Arzt' },
      { text: 'Wo ist die nächste Apotheke?', category: 'Arzt' },
      { text: 'Ich habe meine Krankenversicherungskarte.', category: 'Arzt' },
      { text: 'Ich brauche einen Zahnarzt.', category: 'Arzt' },
      { text: 'Ich kann nicht schlafen.', category: 'Arzt' },

      // Wohnung / Unterkunft
      { text: 'Ich suche eine Wohnung.', category: 'Wohnung' },
      { text: 'Wie hoch ist die Miete?', category: 'Wohnung' },
      { text: 'Ab wann ist die Wohnung frei?', category: 'Wohnung' },
      { text: 'Die Heizung funktioniert nicht.', category: 'Wohnung' },
      { text: 'Das Wasser funktioniert nicht.', category: 'Wohnung' },
      { text: 'Ich habe ein Problem in meiner Wohnung.', category: 'Wohnung' },
      { text: 'Wo kann ich den Vermieter erreichen?', category: 'Wohnung' },
      { text: 'Wie funktioniert die Mülltrennung?', category: 'Wohnung' },

      // Arbeit / Jobcenter
      { text: 'Ich suche Arbeit.', category: 'Arbeit' },
      { text: 'Ich habe einen Termin beim Jobcenter.', category: 'Arbeit' },
      { text: 'Wird mein Abschluss in Deutschland anerkannt?', category: 'Arbeit' },
      { text: 'Ich möchte einen Deutschkurs besuchen.', category: 'Arbeit' },
      { text: 'Ich habe eine Arbeitserlaubnis.', category: 'Arbeit' },
      { text: 'Wo kann ich einen Integrationskurs machen?', category: 'Arbeit' },

      // Schule / Kita
      { text: 'Ich möchte mein Kind in der Schule anmelden.', category: 'Schule' },
      { text: 'Wann beginnt der Unterricht?', category: 'Schule' },
      { text: 'Mein Kind braucht Nachhilfe.', category: 'Schule' },
      { text: 'Gibt es einen Elternabend?', category: 'Schule' },
      { text: 'Ich suche einen Kita-Platz.', category: 'Schule' },
      { text: 'Was muss mein Kind mitbringen?', category: 'Schule' },

      // Polizei / Recht
      { text: 'Ich möchte eine Anzeige erstatten.', category: 'Polizei' },
      { text: 'Ich brauche einen Anwalt.', category: 'Polizei' },
      { text: 'Ich habe Angst.', category: 'Polizei' },
      { text: 'Ich wurde bestohlen.', category: 'Polizei' },
      { text: 'Bitte rufen Sie die Polizei.', category: 'Polizei' },

      // Alltag
      { text: 'Wo ist der nächste Supermarkt?', category: 'Alltag' },
      { text: 'Wann fährt der nächste Bus / die nächste Bahn?', category: 'Alltag' },
      { text: 'Können Sie mir helfen?', category: 'Alltag' },
      { text: 'Ich lerne Deutsch.', category: 'Alltag' },
      { text: 'Ich spreche kein Deutsch.', category: 'Alltag' },
      { text: 'Bitte sprechen Sie langsam.', category: 'Alltag' },
      { text: 'Wo ist die nächste Bushaltestelle?', category: 'Alltag' },
      { text: 'Wie viel kostet das?', category: 'Alltag' },
      { text: 'Ich habe mich verlaufen.', category: 'Alltag' },
      { text: 'Können Sie das bitte aufschreiben?', category: 'Alltag' },
    ],
  },
]

/**
 * Get all available phrase packs.
 */
export function getPhrasePacks(): PhrasePack[] {
  return PHRASE_PACKS
}

/**
 * Get a specific phrase pack by ID.
 */
export function getPhrasePack(id: string): PhrasePack | undefined {
  return PHRASE_PACKS.find(p => p.id === id)
}

/**
 * Get all unique categories across all packs.
 */
export function getAllCategories(): string[] {
  const cats = new Set<string>()
  for (const pack of PHRASE_PACKS) {
    for (const phrase of pack.phrases) {
      cats.add(phrase.category)
    }
  }
  return Array.from(cats)
}
