// Phrase pack definitions and loader
// Pre-defined phrases for common scenarios
// Category and pack name/description use i18n keys (phrases.cat.*, phrases.pack.*)
// Phrase texts are German source text (intentional — they get translated to the target language)

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
    name: 'phrases.pack.common.name',
    description: 'phrases.pack.common.desc',
    icon: '🌍',
    phrases: [
      // Greetings
      { text: 'Hallo, wie geht es Ihnen?', category: 'phrases.cat.greeting' },
      { text: 'Guten Tag!', category: 'phrases.cat.greeting' },
      { text: 'Guten Morgen!', category: 'phrases.cat.greeting' },
      { text: 'Auf Wiedersehen!', category: 'phrases.cat.greeting' },
      { text: 'Vielen Dank!', category: 'phrases.cat.greeting' },
      { text: 'Bitte', category: 'phrases.cat.greeting' },
      { text: 'Entschuldigung', category: 'phrases.cat.greeting' },
      { text: 'Ja / Nein', category: 'phrases.cat.greeting' },
      { text: 'Sprechen Sie Englisch?', category: 'phrases.cat.greeting' },
      { text: 'Ich verstehe nicht.', category: 'phrases.cat.greeting' },

      // Navigation
      { text: 'Wo ist die nächste U-Bahn-Station?', category: 'phrases.cat.navigation' },
      { text: 'Wie komme ich zum Hafen?', category: 'phrases.cat.navigation' },
      { text: 'Können Sie mir den Weg zeigen?', category: 'phrases.cat.navigation' },
      { text: 'Ist es weit zu Fuß?', category: 'phrases.cat.navigation' },
      { text: 'Wo ist die nächste Bushaltestelle?', category: 'phrases.cat.navigation' },
      { text: 'Ich suche ein Taxi.', category: 'phrases.cat.navigation' },
      { text: 'Links / Rechts / Geradeaus', category: 'phrases.cat.navigation' },

      // Essen & Trinken
      { text: 'Ich hätte gerne die Speisekarte.', category: 'phrases.cat.food' },
      { text: 'Was empfehlen Sie?', category: 'phrases.cat.food' },
      { text: 'Die Rechnung, bitte.', category: 'phrases.cat.food' },
      { text: 'Ich bin allergisch gegen...', category: 'phrases.cat.food' },
      { text: 'Ein Wasser, bitte.', category: 'phrases.cat.food' },
      { text: 'Gibt es vegetarische Gerichte?', category: 'phrases.cat.food' },
      { text: 'Das war sehr lecker!', category: 'phrases.cat.food' },
      { text: 'Ist Trinkgeld inbegriffen?', category: 'phrases.cat.food' },

      // Shopping
      { text: 'Was kostet das?', category: 'phrases.cat.shopping' },
      { text: 'Haben Sie das in einer anderen Größe?', category: 'phrases.cat.shopping' },
      { text: 'Kann ich mit Karte bezahlen?', category: 'phrases.cat.shopping' },
      { text: 'Wo ist der nächste Geldautomat?', category: 'phrases.cat.shopping' },
      { text: 'Kann ich das anprobieren?', category: 'phrases.cat.shopping' },
      { text: 'Das ist zu teuer.', category: 'phrases.cat.shopping' },

      // Notfälle
      { text: 'Ich brauche Hilfe!', category: 'phrases.cat.emergency' },
      { text: 'Rufen Sie bitte einen Krankenwagen!', category: 'phrases.cat.emergency' },
      { text: 'Wo ist das nächste Krankenhaus?', category: 'phrases.cat.emergency' },
      { text: 'Wo ist die nächste Apotheke?', category: 'phrases.cat.emergency' },
      { text: 'Ich habe meinen Pass verloren.', category: 'phrases.cat.emergency' },
      { text: 'Wo ist die Polizei?', category: 'phrases.cat.emergency' },
      { text: 'Ich brauche einen Arzt.', category: 'phrases.cat.emergency' },
    ],
  },
  {
    id: 'mediterranean',
    name: 'phrases.pack.mediterranean.name',
    description: 'phrases.pack.mediterranean.desc',
    icon: '🚢',
    phrases: [
      // Hafen & Transport
      { text: 'Wann legt das Schiff wieder ab?', category: 'phrases.cat.port' },
      { text: 'Wo ist das Kreuzfahrt-Terminal?', category: 'phrases.cat.port' },
      { text: 'Gibt es einen Shuttle zum Stadtzentrum?', category: 'phrases.cat.port' },
      { text: 'Wie viel kostet ein Taxi in die Altstadt?', category: 'phrases.cat.port' },
      { text: 'Ich muss bis 17 Uhr zurück am Schiff sein.', category: 'phrases.cat.port' },
      { text: 'Können Sie mich zum Hafen zurückbringen?', category: 'phrases.cat.port' },

      // Sehenswürdigkeiten
      { text: 'Wo kann ich Tickets kaufen?', category: 'phrases.cat.sightseeing' },
      { text: 'Gibt es eine Führung auf Deutsch?', category: 'phrases.cat.sightseeing' },
      { text: 'Wie lange dauert die Tour?', category: 'phrases.cat.sightseeing' },
      { text: 'Ist das Museum heute geöffnet?', category: 'phrases.cat.sightseeing' },
      { text: 'Was ist die berühmteste Sehenswürdigkeit hier?', category: 'phrases.cat.sightseeing' },
      { text: 'Darf man hier fotografieren?', category: 'phrases.cat.sightseeing' },
      { text: 'Gibt es einen Audioguide?', category: 'phrases.cat.sightseeing' },

      // Lokales Essen
      { text: 'Was ist die lokale Spezialität?', category: 'phrases.cat.localFood' },
      { text: 'Gibt es ein gutes Restaurant in der Nähe?', category: 'phrases.cat.localFood' },
      { text: 'Ich möchte lokalen Wein probieren.', category: 'phrases.cat.localFood' },
      { text: 'Ist dieses Restaurant typisch für die Region?', category: 'phrases.cat.localFood' },
      { text: 'Ein Espresso, bitte.', category: 'phrases.cat.localFood' },
      { text: 'Können Sie etwas Typisches empfehlen?', category: 'phrases.cat.localFood' },

      // Strand & Meer
      { text: 'Wo ist der nächste Strand?', category: 'phrases.cat.beach' },
      { text: 'Kann man hier Liegen und Sonnenschirme mieten?', category: 'phrases.cat.beach' },
      { text: 'Ist das Wasser hier sicher zum Schwimmen?', category: 'phrases.cat.beach' },
      { text: 'Wo kann ich Schnorchelausrüstung leihen?', category: 'phrases.cat.beach' },

      // Praktisches
      { text: 'Gibt es hier kostenloses WLAN?', category: 'phrases.cat.practical' },
      { text: 'Wo kann ich eine SIM-Karte kaufen?', category: 'phrases.cat.practical' },
      { text: 'Können Sie mir ein Foto machen?', category: 'phrases.cat.practical' },
      { text: 'Wo ist die nächste Toilette?', category: 'phrases.cat.practical' },
      { text: 'Wie spät ist es?', category: 'phrases.cat.practical' },
      { text: 'Wo kann ich Souvenirs kaufen?', category: 'phrases.cat.practical' },
    ],
  },
  {
    id: 'nordic',
    name: 'phrases.pack.nordic.name',
    description: 'phrases.pack.nordic.desc',
    icon: '🏔️',
    phrases: [
      { text: 'Wo kann ich die Fjorde am besten sehen?', category: 'phrases.cat.sightseeing' },
      { text: 'Gibt es eine Wanderung zum Aussichtspunkt?', category: 'phrases.cat.sightseeing' },
      { text: 'Wann geht die Sonne heute unter?', category: 'phrases.cat.sightseeing' },
      { text: 'Kann man hier Nordlichter sehen?', category: 'phrases.cat.sightseeing' },
      { text: 'Wo kann ich frischen Fisch kaufen?', category: 'phrases.cat.localFood' },
      { text: 'Ich möchte Lachs probieren.', category: 'phrases.cat.localFood' },
      { text: 'Brauche ich eine warme Jacke?', category: 'phrases.cat.practical' },
      { text: 'Wie ist das Wetter morgen?', category: 'phrases.cat.practical' },
      { text: 'Gibt es Bootstouren zu den Inseln?', category: 'phrases.cat.excursions' },
      { text: 'Wo startet die Walbeobachtungstour?', category: 'phrases.cat.excursions' },
      { text: 'Kann ich hier angeln?', category: 'phrases.cat.excursions' },
      { text: 'Gibt es Rabatte für Kreuzfahrt-Passagiere?', category: 'phrases.cat.shopping' },
    ],
  },
  // --- Migrant Phrasebook ---
  {
    id: 'migrant',
    name: 'phrases.pack.migrant.name',
    description: 'phrases.pack.migrant.desc',
    icon: '🏢',
    phrases: [
      // Behörde (10 phrases)
      { text: 'Ich möchte einen Termin vereinbaren.', category: 'phrases.cat.authority' },
      { text: 'Ich brauche einen Dolmetscher.', category: 'phrases.cat.authority' },
      { text: 'Wo muss ich mich anmelden?', category: 'phrases.cat.authority' },
      { text: 'Ich habe einen Termin beim Ausländeramt.', category: 'phrases.cat.authority' },
      { text: 'Welche Unterlagen brauche ich?', category: 'phrases.cat.authority' },
      { text: 'Meine Aufenthaltserlaubnis läuft ab.', category: 'phrases.cat.authority' },
      { text: 'Wo bekomme ich eine Arbeitserlaubnis?', category: 'phrases.cat.authority' },
      { text: 'Ich möchte Kindergeld beantragen.', category: 'phrases.cat.authority' },
      { text: 'Wo ist das Jobcenter?', category: 'phrases.cat.authority' },
      { text: 'Ich brauche eine Bescheinigung.', category: 'phrases.cat.authority' },

      // Arzt (10 phrases)
      { text: 'Ich brauche einen Arzttermin.', category: 'phrases.cat.doctor' },
      { text: 'Ich habe Schmerzen hier.', category: 'phrases.cat.doctor' },
      { text: 'Ich brauche ein Rezept.', category: 'phrases.cat.doctor' },
      { text: 'Haben Sie meine Krankenversicherungskarte?', category: 'phrases.cat.doctor' },
      { text: 'Ich bin schwanger.', category: 'phrases.cat.doctor' },
      { text: 'Mein Kind hat Fieber.', category: 'phrases.cat.doctor' },
      { text: 'Ich nehme diese Medikamente.', category: 'phrases.cat.doctor' },
      { text: 'Wo ist die nächste Notaufnahme?', category: 'phrases.cat.doctor' },
      { text: 'Ich habe eine Allergie gegen...', category: 'phrases.cat.doctor' },
      { text: 'Ich brauche einen Zahnarzt.', category: 'phrases.cat.doctor' },

      // Wohnung (9 phrases)
      { text: 'Ich suche eine Wohnung.', category: 'phrases.cat.housing' },
      { text: 'Wie hoch ist die Miete?', category: 'phrases.cat.housing' },
      { text: 'Sind Nebenkosten inklusive?', category: 'phrases.cat.housing' },
      { text: 'Wann kann ich einziehen?', category: 'phrases.cat.housing' },
      { text: 'Die Heizung funktioniert nicht.', category: 'phrases.cat.housing' },
      { text: 'Wo melde ich den Strom an?', category: 'phrases.cat.housing' },
      { text: 'Ich brauche einen Mietvertrag.', category: 'phrases.cat.housing' },
      { text: 'Wo kann ich den Müll entsorgen?', category: 'phrases.cat.housing' },
      { text: 'Wann ist Ruhezeit?', category: 'phrases.cat.housing' },

      // Arbeit (9 phrases)
      { text: 'Ich suche Arbeit.', category: 'phrases.cat.work' },
      { text: 'Ich habe Erfahrung als...', category: 'phrases.cat.work' },
      { text: 'Wann beginnt die Arbeit?', category: 'phrases.cat.work' },
      { text: 'Wie viel verdiene ich pro Stunde?', category: 'phrases.cat.work' },
      { text: 'Wo muss ich unterschreiben?', category: 'phrases.cat.work' },
      { text: 'Ich brauche einen Arbeitsvertrag.', category: 'phrases.cat.work' },
      { text: 'Wann bekomme ich mein Gehalt?', category: 'phrases.cat.work' },
      { text: 'Ich bin krank und kann heute nicht arbeiten.', category: 'phrases.cat.work' },
      { text: 'Wo ist die Berufsberatung?', category: 'phrases.cat.work' },

      // Schule (8 phrases)
      { text: 'Ich möchte mein Kind in der Schule anmelden.', category: 'phrases.cat.school' },
      { text: 'Wann beginnt der Unterricht?', category: 'phrases.cat.school' },
      { text: 'Mein Kind braucht Nachhilfe.', category: 'phrases.cat.school' },
      { text: 'Gibt es einen Deutschkurs für Anfänger?', category: 'phrases.cat.school' },
      { text: 'Wo ist die nächste Volkshochschule?', category: 'phrases.cat.school' },
      { text: 'Ich möchte einen Integrationskurs besuchen.', category: 'phrases.cat.school' },
      { text: 'Wann ist der Elternabend?', category: 'phrases.cat.school' },
      { text: 'Mein Kind ist krank und kann nicht zur Schule kommen.', category: 'phrases.cat.school' },

      // Polizei (7 phrases)
      { text: 'Ich möchte eine Anzeige erstatten.', category: 'phrases.cat.police' },
      { text: 'Mir wurde etwas gestohlen.', category: 'phrases.cat.police' },
      { text: 'Ich brauche einen Anwalt.', category: 'phrases.cat.police' },
      { text: 'Ich habe nichts Falsches getan.', category: 'phrases.cat.police' },
      { text: 'Können Sie mir bitte helfen?', category: 'phrases.cat.police' },
      { text: 'Ich fühle mich bedroht.', category: 'phrases.cat.police' },
      { text: 'Wo ist die nächste Polizeistation?', category: 'phrases.cat.police' },

      // Alltag (9 phrases)
      { text: 'Wo ist der nächste Supermarkt?', category: 'phrases.cat.daily' },
      { text: 'Wie komme ich zum Bahnhof?', category: 'phrases.cat.daily' },
      { text: 'Ich verstehe das Formular nicht.', category: 'phrases.cat.daily' },
      { text: 'Können Sie das bitte wiederholen?', category: 'phrases.cat.daily' },
      { text: 'Können Sie bitte langsamer sprechen?', category: 'phrases.cat.daily' },
      { text: 'Wo gibt es kostenloses WLAN?', category: 'phrases.cat.daily' },
      { text: 'Ich möchte ein Bankkonto eröffnen.', category: 'phrases.cat.daily' },
      { text: 'Wo kann ich eine Fahrkarte kaufen?', category: 'phrases.cat.daily' },
      { text: 'Ich brauche eine SIM-Karte.', category: 'phrases.cat.daily' },
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
 * Get migrant-specific phrase pack.
 */
export function getMigrantPhrases(): PhrasePack | undefined {
  return PHRASE_PACKS.find(p => p.id === 'migrant')
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
