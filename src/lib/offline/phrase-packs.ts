// Phrase pack definitions and loader
// Pre-defined phrases for common scenarios

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
    description: 'Grundlegende S\u00e4tze f\u00fcr jede Reise',
    icon: '\uD83C\uDF0D',
    phrases: [
      // Greetings
      { text: 'Hallo, wie geht es Ihnen?', category: 'Begr\u00fc\u00dfung' },
      { text: 'Guten Tag!', category: 'Begr\u00fc\u00dfung' },
      { text: 'Guten Morgen!', category: 'Begr\u00fc\u00dfung' },
      { text: 'Auf Wiedersehen!', category: 'Begr\u00fc\u00dfung' },
      { text: 'Vielen Dank!', category: 'Begr\u00fc\u00dfung' },
      { text: 'Bitte', category: 'Begr\u00fc\u00dfung' },
      { text: 'Entschuldigung', category: 'Begr\u00fc\u00dfung' },
      { text: 'Ja / Nein', category: 'Begr\u00fc\u00dfung' },
      { text: 'Sprechen Sie Englisch?', category: 'Begr\u00fc\u00dfung' },
      { text: 'Ich verstehe nicht.', category: 'Begr\u00fc\u00dfung' },

      // Navigation
      { text: 'Wo ist die n\u00e4chste U-Bahn-Station?', category: 'Navigation' },
      { text: 'Wie komme ich zum Hafen?', category: 'Navigation' },
      { text: 'K\u00f6nnen Sie mir den Weg zeigen?', category: 'Navigation' },
      { text: 'Ist es weit zu Fu\u00df?', category: 'Navigation' },
      { text: 'Wo ist die n\u00e4chste Bushaltestelle?', category: 'Navigation' },
      { text: 'Ich suche ein Taxi.', category: 'Navigation' },
      { text: 'Links / Rechts / Geradeaus', category: 'Navigation' },

      // Essen & Trinken
      { text: 'Ich h\u00e4tte gerne die Speisekarte.', category: 'Essen' },
      { text: 'Was empfehlen Sie?', category: 'Essen' },
      { text: 'Die Rechnung, bitte.', category: 'Essen' },
      { text: 'Ich bin allergisch gegen...', category: 'Essen' },
      { text: 'Ein Wasser, bitte.', category: 'Essen' },
      { text: 'Gibt es vegetarische Gerichte?', category: 'Essen' },
      { text: 'Das war sehr lecker!', category: 'Essen' },
      { text: 'Ist Trinkgeld inbegriffen?', category: 'Essen' },

      // Shopping
      { text: 'Was kostet das?', category: 'Shopping' },
      { text: 'Haben Sie das in einer anderen Gr\u00f6\u00dfe?', category: 'Shopping' },
      { text: 'Kann ich mit Karte bezahlen?', category: 'Shopping' },
      { text: 'Wo ist der n\u00e4chste Geldautomat?', category: 'Shopping' },
      { text: 'Kann ich das anprobieren?', category: 'Shopping' },
      { text: 'Das ist zu teuer.', category: 'Shopping' },

      // Notf\u00e4lle
      { text: 'Ich brauche Hilfe!', category: 'Notfall' },
      { text: 'Rufen Sie bitte einen Krankenwagen!', category: 'Notfall' },
      { text: 'Wo ist das n\u00e4chste Krankenhaus?', category: 'Notfall' },
      { text: 'Wo ist die n\u00e4chste Apotheke?', category: 'Notfall' },
      { text: 'Ich habe meinen Pass verloren.', category: 'Notfall' },
      { text: 'Wo ist die Polizei?', category: 'Notfall' },
      { text: 'Ich brauche einen Arzt.', category: 'Notfall' },
    ],
  },
  {
    id: 'mediterranean',
    name: 'Mittelmeer-Kreuzfahrt',
    description: 'S\u00e4tze f\u00fcr Mittelmeer-H\u00e4fen: Italien, Griechenland, Spanien, Frankreich',
    icon: '\uD83D\uDEA2',
    phrases: [
      // Hafen & Transport
      { text: 'Wann legt das Schiff wieder ab?', category: 'Hafen' },
      { text: 'Wo ist das Kreuzfahrt-Terminal?', category: 'Hafen' },
      { text: 'Gibt es einen Shuttle zum Stadtzentrum?', category: 'Hafen' },
      { text: 'Wie viel kostet ein Taxi in die Altstadt?', category: 'Hafen' },
      { text: 'Ich muss bis 17 Uhr zur\u00fcck am Schiff sein.', category: 'Hafen' },
      { text: 'K\u00f6nnen Sie mich zum Hafen zur\u00fcckbringen?', category: 'Hafen' },

      // Sehensw\u00fcrdigkeiten
      { text: 'Wo kann ich Tickets kaufen?', category: 'Sightseeing' },
      { text: 'Gibt es eine F\u00fchrung auf Deutsch?', category: 'Sightseeing' },
      { text: 'Wie lange dauert die Tour?', category: 'Sightseeing' },
      { text: 'Ist das Museum heute ge\u00f6ffnet?', category: 'Sightseeing' },
      { text: 'Was ist die ber\u00fchmteste Sehensw\u00fcrdigkeit hier?', category: 'Sightseeing' },
      { text: 'Darf man hier fotografieren?', category: 'Sightseeing' },
      { text: 'Gibt es einen Audioguide?', category: 'Sightseeing' },

      // Lokales Essen
      { text: 'Was ist die lokale Spezialit\u00e4t?', category: 'Lokales Essen' },
      { text: 'Gibt es ein gutes Restaurant in der N\u00e4he?', category: 'Lokales Essen' },
      { text: 'Ich m\u00f6chte lokalen Wein probieren.', category: 'Lokales Essen' },
      { text: 'Ist dieses Restaurant typisch f\u00fcr die Region?', category: 'Lokales Essen' },
      { text: 'Ein Espresso, bitte.', category: 'Lokales Essen' },
      { text: 'K\u00f6nnen Sie etwas Typisches empfehlen?', category: 'Lokales Essen' },

      // Strand & Meer
      { text: 'Wo ist der n\u00e4chste Strand?', category: 'Strand' },
      { text: 'Kann man hier Liegen und Sonnenschirme mieten?', category: 'Strand' },
      { text: 'Ist das Wasser hier sicher zum Schwimmen?', category: 'Strand' },
      { text: 'Wo kann ich Schnorchelausr\u00fcstung leihen?', category: 'Strand' },

      // Praktisches
      { text: 'Gibt es hier kostenloses WLAN?', category: 'Praktisch' },
      { text: 'Wo kann ich eine SIM-Karte kaufen?', category: 'Praktisch' },
      { text: 'K\u00f6nnen Sie mir ein Foto machen?', category: 'Praktisch' },
      { text: 'Wo ist die n\u00e4chste Toilette?', category: 'Praktisch' },
      { text: 'Wie sp\u00e4t ist es?', category: 'Praktisch' },
      { text: 'Wo kann ich Souvenirs kaufen?', category: 'Praktisch' },
    ],
  },
  {
    id: 'nordic',
    name: 'Nordland-Kreuzfahrt',
    description: 'S\u00e4tze f\u00fcr Skandinavien und Nordland-H\u00e4fen',
    icon: '\uD83C\uDFD4\uFE0F',
    phrases: [
      { text: 'Wo kann ich die Fjorde am besten sehen?', category: 'Sightseeing' },
      { text: 'Gibt es eine Wanderung zum Aussichtspunkt?', category: 'Sightseeing' },
      { text: 'Wann geht die Sonne heute unter?', category: 'Sightseeing' },
      { text: 'Kann man hier Nordlichter sehen?', category: 'Sightseeing' },
      { text: 'Wo kann ich frischen Fisch kaufen?', category: 'Lokales Essen' },
      { text: 'Ich m\u00f6chte Lachs probieren.', category: 'Lokales Essen' },
      { text: 'Brauche ich eine warme Jacke?', category: 'Praktisch' },
      { text: 'Wie ist das Wetter morgen?', category: 'Praktisch' },
      { text: 'Gibt es Bootstouren zu den Inseln?', category: 'Ausfl\u00fcge' },
      { text: 'Wo startet die Walbeobachtungstour?', category: 'Ausfl\u00fcge' },
      { text: 'Kann ich hier angeln?', category: 'Ausfl\u00fcge' },
      { text: 'Gibt es Rabatte f\u00fcr Kreuzfahrt-Passagiere?', category: 'Shopping' },
    ],
  },
  // --- NEW: Migrant Phrasebook ---
  {
    id: 'migrant',
    name: 'Beh\u00f6rden & Alltag',
    description: 'Wichtige S\u00e4tze f\u00fcr Beh\u00f6rden, Arzt, Wohnung, Arbeit, Schule, Polizei und Alltag',
    icon: '\uD83C\uDFE2',
    phrases: [
      // Beh\u00f6rde (10 phrases)
      { text: 'Ich m\u00f6chte einen Termin vereinbaren.', category: 'Beh\u00f6rde' },
      { text: 'Ich brauche einen Dolmetscher.', category: 'Beh\u00f6rde' },
      { text: 'Wo muss ich mich anmelden?', category: 'Beh\u00f6rde' },
      { text: 'Ich habe einen Termin beim Ausländeramt.', category: 'Beh\u00f6rde' },
      { text: 'Welche Unterlagen brauche ich?', category: 'Beh\u00f6rde' },
      { text: 'Meine Aufenthaltserlaubnis l\u00e4uft ab.', category: 'Beh\u00f6rde' },
      { text: 'Wo bekomme ich eine Arbeitserlaubnis?', category: 'Beh\u00f6rde' },
      { text: 'Ich m\u00f6chte Kindergeld beantragen.', category: 'Beh\u00f6rde' },
      { text: 'Wo ist das Jobcenter?', category: 'Beh\u00f6rde' },
      { text: 'Ich brauche eine Bescheinigung.', category: 'Beh\u00f6rde' },

      // Arzt (10 phrases)
      { text: 'Ich brauche einen Arzttermin.', category: 'Arzt' },
      { text: 'Ich habe Schmerzen hier.', category: 'Arzt' },
      { text: 'Ich brauche ein Rezept.', category: 'Arzt' },
      { text: 'Haben Sie meine Krankenversicherungskarte?', category: 'Arzt' },
      { text: 'Ich bin schwanger.', category: 'Arzt' },
      { text: 'Mein Kind hat Fieber.', category: 'Arzt' },
      { text: 'Ich nehme diese Medikamente.', category: 'Arzt' },
      { text: 'Wo ist die n\u00e4chste Notaufnahme?', category: 'Arzt' },
      { text: 'Ich habe eine Allergie gegen...', category: 'Arzt' },
      { text: 'Ich brauche einen Zahnarzt.', category: 'Arzt' },

      // Wohnung (9 phrases)
      { text: 'Ich suche eine Wohnung.', category: 'Wohnung' },
      { text: 'Wie hoch ist die Miete?', category: 'Wohnung' },
      { text: 'Sind Nebenkosten inklusive?', category: 'Wohnung' },
      { text: 'Wann kann ich einziehen?', category: 'Wohnung' },
      { text: 'Die Heizung funktioniert nicht.', category: 'Wohnung' },
      { text: 'Wo melde ich den Strom an?', category: 'Wohnung' },
      { text: 'Ich brauche einen Mietvertrag.', category: 'Wohnung' },
      { text: 'Wo kann ich den M\u00fcll entsorgen?', category: 'Wohnung' },
      { text: 'Wann ist Ruhezeit?', category: 'Wohnung' },

      // Arbeit (9 phrases)
      { text: 'Ich suche Arbeit.', category: 'Arbeit' },
      { text: 'Ich habe Erfahrung als...', category: 'Arbeit' },
      { text: 'Wann beginnt die Arbeit?', category: 'Arbeit' },
      { text: 'Wie viel verdiene ich pro Stunde?', category: 'Arbeit' },
      { text: 'Wo muss ich unterschreiben?', category: 'Arbeit' },
      { text: 'Ich brauche einen Arbeitsvertrag.', category: 'Arbeit' },
      { text: 'Wann bekomme ich mein Gehalt?', category: 'Arbeit' },
      { text: 'Ich bin krank und kann heute nicht arbeiten.', category: 'Arbeit' },
      { text: 'Wo ist die Berufsberatung?', category: 'Arbeit' },

      // Schule (8 phrases)
      { text: 'Ich m\u00f6chte mein Kind in der Schule anmelden.', category: 'Schule' },
      { text: 'Wann beginnt der Unterricht?', category: 'Schule' },
      { text: 'Mein Kind braucht Nachhilfe.', category: 'Schule' },
      { text: 'Gibt es einen Deutschkurs f\u00fcr Anf\u00e4nger?', category: 'Schule' },
      { text: 'Wo ist die n\u00e4chste Volkshochschule?', category: 'Schule' },
      { text: 'Ich m\u00f6chte einen Integrationskurs besuchen.', category: 'Schule' },
      { text: 'Wann ist der Elternabend?', category: 'Schule' },
      { text: 'Mein Kind ist krank und kann nicht zur Schule kommen.', category: 'Schule' },

      // Polizei (7 phrases)
      { text: 'Ich m\u00f6chte eine Anzeige erstatten.', category: 'Polizei' },
      { text: 'Mir wurde etwas gestohlen.', category: 'Polizei' },
      { text: 'Ich brauche einen Anwalt.', category: 'Polizei' },
      { text: 'Ich habe nichts Falsches getan.', category: 'Polizei' },
      { text: 'K\u00f6nnen Sie mir bitte helfen?', category: 'Polizei' },
      { text: 'Ich f\u00fchle mich bedroht.', category: 'Polizei' },
      { text: 'Wo ist die n\u00e4chste Polizeistation?', category: 'Polizei' },

      // Alltag (9 phrases)
      { text: 'Wo ist der n\u00e4chste Supermarkt?', category: 'Alltag' },
      { text: 'Wie komme ich zum Bahnhof?', category: 'Alltag' },
      { text: 'Ich verstehe das Formular nicht.', category: 'Alltag' },
      { text: 'K\u00f6nnen Sie das bitte wiederholen?', category: 'Alltag' },
      { text: 'K\u00f6nnen Sie bitte langsamer sprechen?', category: 'Alltag' },
      { text: 'Wo gibt es kostenloses WLAN?', category: 'Alltag' },
      { text: 'Ich m\u00f6chte ein Bankkonto er\u00f6ffnen.', category: 'Alltag' },
      { text: 'Wo kann ich eine Fahrkarte kaufen?', category: 'Alltag' },
      { text: 'Ich brauche eine SIM-Karte.', category: 'Alltag' },
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
