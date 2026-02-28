// ============================================================
// GuideTranslator — Testprotokolle als Google Forms Generator
// ============================================================
// Erstellt automatisch alle 30 Testformulare als Google Forms.
//
// ANLEITUNG:
// 1. Öffne https://script.google.com
// 2. Neues Projekt erstellen
// 3. Gesamten Inhalt dieser Datei einfügen
// 4. Speichern (Ctrl+S)
// 5. Funktion "erstelleAlleFormulare" auswählen und ▶ Run klicken
// 6. Google-Berechtigung erteilen
// 7. Alle 30 Formulare erscheinen in deinem Google Drive
//
// HINWEIS: Google Apps Script hat ein 6-Min-Limit.
// Falls Timeout: nutze "erstelleBatch1" bis "erstelleBatch6" einzeln.
// ============================================================

// --------------- HAUPTFUNKTIONEN ---------------

function erstelleAlleFormulare() {
  var ordner = erstelleOrdner_('GuideTranslator Testprotokolle');
  var alle = getAlleProtokolle_();
  var urls = [];
  for (var i = 0; i < alle.length; i++) {
    var form = erstelleFormular_(alle[i]);
    var file = DriveApp.getFileById(form.getId());
    file.moveTo(ordner);
    urls.push(alle[i].id + ': ' + form.getPublishedUrl());
    Logger.log('✅ ' + alle[i].id + ' erstellt');
  }
  Logger.log('\n=== ALLE FORMULARE ERSTELLT ===');
  Logger.log('Ordner: ' + ordner.getUrl());
  for (var j = 0; j < urls.length; j++) Logger.log(urls[j]);
}

// Falls Timeout: Batches einzeln ausführen
function erstelleBatch1() { erstelleBatch_(0, 5); }   // TP-01 bis TP-05
function erstelleBatch2() { erstelleBatch_(5, 10); }   // TP-06 bis TP-10
function erstelleBatch3() { erstelleBatch_(10, 15); }  // TP-11 bis TP-15
function erstelleBatch4() { erstelleBatch_(15, 20); }  // TP-16 bis TP-20
function erstelleBatch5() { erstelleBatch_(20, 25); }  // TP-21 bis TP-25
function erstelleBatch6() { erstelleBatch_(25, 30); }  // TP-26 bis TP-30

function erstelleBatch_(von, bis) {
  var ordner = erstelleOrdner_('GuideTranslator Testprotokolle');
  var alle = getAlleProtokolle_();
  for (var i = von; i < bis && i < alle.length; i++) {
    var form = erstelleFormular_(alle[i]);
    DriveApp.getFileById(form.getId()).moveTo(ordner);
    Logger.log('✅ ' + alle[i].id + ' erstellt: ' + form.getPublishedUrl());
  }
}

// --------------- FORMULAR-BUILDER ---------------

function erstelleOrdner_(name) {
  var ordner = DriveApp.getFoldersByName(name);
  if (ordner.hasNext()) return ordner.next();
  return DriveApp.createFolder(name);
}

function erstelleFormular_(proto) {
  var form = FormApp.create(proto.id + ': ' + proto.titel);

  // Ausführliche Formularbeschreibung mit App-Kontext
  var intro = '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n' +
    'GuideTranslator — Testprotokoll ' + proto.id + '\n' +
    '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n' +
    'WAS IST GUIDETRANSLATOR?\n' +
    'GuideTranslator ist eine Web-App für Echtzeit-Übersetzung, entwickelt für Reiseleiter, Behördengänge und mehrsprachige Kommunikation. ' +
    'Die App bietet Text- und Spracheingabe, Live-Sessions (ein Sprecher, viele Zuhörer in verschiedenen Sprachen), ' +
    'einen Konversationsmodus (Face-to-Face), Kamera-OCR, ein Phrasebook und funktioniert auch offline.\n\n' +
    'APP-ADRESSE: https://guide-translator.vercel.app\n\n' +
    '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n' +
    'DIESES TESTPROTOKOLL\n' +
    '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n';

  if (proto.beschreibung) {
    intro += proto.beschreibung + '\n\n';
  }

  intro += '⏱ Geschätzte Dauer: ' + proto.dauer + '\n' +
    '✅ Vorbedingungen: ' + proto.vorbedingungen + '\n' +
    '📱 Benötigte Geräte: ' + proto.geraete + '\n\n' +
    '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n' +
    'SO FÜLLST DU DIESES FORMULAR AUS\n' +
    '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n' +
    '1. Lies die Aufgabe in jeder Zeile durch\n' +
    '2. Führe die Aufgabe in der App aus\n' +
    '3. Bewerte das Ergebnis:\n' +
    '   • OK = Funktioniert wie beschrieben\n' +
    '   • TEILWEISE = Funktioniert, aber mit Einschränkungen\n' +
    '   • FEHLER = Funktioniert nicht oder ist kaputt\n' +
    '   • Nicht getestet = Konnte nicht getestet werden (z.B. fehlendes Gerät)\n' +
    '4. Nutze die Bemerkungsfelder für Details zu Problemen\n' +
    '5. Bewerte am Ende jede Kategorie von 1 (schlecht) bis 5 (perfekt)\n\n' +
    'WICHTIG: Bitte sei ehrlich und kritisch! Wir suchen Fehler und Verbesserungsmöglichkeiten. ' +
    'Wenn etwas unklar ist oder nicht funktioniert, schreib es in die Bemerkungen.';

  form.setDescription(intro);
  form.setIsQuiz(false);
  form.setAllowResponseEdits(true);
  form.setProgressBar(true);
  form.setConfirmationMessage(
    'Vielen Dank für dein Feedback! 🙏\n\n' +
    'Deine Antworten wurden gespeichert. ' +
    'Falls du nachträglich etwas ändern möchtest, kannst du den Link "Antwort bearbeiten" verwenden.'
  );

  // Seite 1: Tester-Info
  form.addSectionHeaderItem()
    .setTitle('📋 Tester-Information')
    .setHelpText('Bitte fülle diese Felder aus, damit wir die Ergebnisse zuordnen können. ' +
      'Falls du mehrere Protokolle ausfüllst, trage jedes Mal die gleichen Daten ein.');
  form.addTextItem().setTitle('Tester-Name').setRequired(true);
  form.addDateItem().setTitle('Testdatum').setRequired(true);

  for (var t = 0; t < proto.testerFelder.length; t++) {
    var feld = form.addTextItem().setTitle(proto.testerFelder[t]).setRequired(true);
    // Hilfetexte für häufige Felder
    if (proto.testerFelder[t] === 'Gerät') {
      feld.setHelpText('z.B. "iPhone 14", "Samsung Galaxy S23", "MacBook Pro 2022"');
    } else if (proto.testerFelder[t] === 'Browser + Version') {
      feld.setHelpText('z.B. "Chrome 120", "Safari 17.2" — findest du unter Einstellungen → Über den Browser');
    } else if (proto.testerFelder[t] === 'Betriebssystem') {
      feld.setHelpText('z.B. "Android 14", "iOS 17.3", "Windows 11", "macOS Sonoma"');
    }
  }

  // Seiten mit Aufgaben
  for (var s = 0; s < proto.sektionen.length; s++) {
    var sek = proto.sektionen[s];
    var pageBreak = form.addPageBreakItem().setTitle(sek.titel);

    // Detaillierte Sektionsbeschreibung
    if (sek.beschreibung) {
      pageBreak.setHelpText(sek.beschreibung);
    }

    if (sek.aufgaben.length > 0 && sek.aufgaben.length <= 10) {
      var grid = form.addGridItem();
      grid.setTitle(sek.titel + ' — Bewertung');
      grid.setRows(sek.aufgaben);
      grid.setColumns(['OK', 'TEILWEISE', 'FEHLER', 'Nicht getestet']);
      grid.setHelpText('Bewerte jede Zeile: Lies die Aufgabe → führe sie in der App aus → wähle das Ergebnis.');

      form.addParagraphTextItem()
        .setTitle(sek.titel + ' — Bemerkungen')
        .setHelpText('Beschreibe hier aufgetretene Probleme: Was hast du gemacht? Was ist passiert? Was hättest du erwartet? ' +
          'Gerne auch Screenshot-Links (z.B. Imgur) einfügen.');
    } else if (sek.aufgaben.length > 10) {
      var mitte = Math.ceil(sek.aufgaben.length / 2);
      var grid1 = form.addGridItem();
      grid1.setTitle(sek.titel + ' — Bewertung (Teil 1)');
      grid1.setRows(sek.aufgaben.slice(0, mitte));
      grid1.setColumns(['OK', 'TEILWEISE', 'FEHLER', 'Nicht getestet']);
      grid1.setHelpText('Bewerte jede Zeile: Lies die Aufgabe → führe sie in der App aus → wähle das Ergebnis.');

      var grid2 = form.addGridItem();
      grid2.setTitle(sek.titel + ' — Bewertung (Teil 2)');
      grid2.setRows(sek.aufgaben.slice(mitte));
      grid2.setColumns(['OK', 'TEILWEISE', 'FEHLER', 'Nicht getestet']);

      form.addParagraphTextItem()
        .setTitle(sek.titel + ' — Bemerkungen')
        .setHelpText('Beschreibe hier aufgetretene Probleme: Was hast du gemacht? Was ist passiert? Was hättest du erwartet?');
    }
  }

  // Letzte Seite: Gesamtbewertung
  form.addPageBreakItem()
    .setTitle('⭐ Gesamtbewertung')
    .setHelpText('Fast geschafft! Bewerte nun die einzelnen Bereiche auf einer Skala von 1 bis 5.\n\n' +
      '1 = Nicht nutzbar / kaputt\n' +
      '2 = Funktioniert kaum, viele Probleme\n' +
      '3 = Funktioniert grundsätzlich, aber mit Einschränkungen\n' +
      '4 = Gut, kleinere Verbesserungen möglich\n' +
      '5 = Einwandfrei, nichts zu beanstanden');

  for (var b = 0; b < proto.bewertungen.length; b++) {
    form.addScaleItem()
      .setTitle(proto.bewertungen[b])
      .setBounds(1, 5)
      .setLabels('Nicht nutzbar', 'Einwandfrei')
      .setRequired(true);
  }

  form.addParagraphTextItem()
    .setTitle('Freitextkommentar')
    .setHelpText('Was ist dir besonders aufgefallen (positiv oder negativ)? ' +
      'Hast du Verbesserungsvorschläge? Gab es etwas, das dich verwirrt hat? ' +
      'Jeder Kommentar hilft uns, die App besser zu machen!');

  // Zeitstempel für Auswertung
  form.addTextItem()
    .setTitle('Wie lange hat dieser Test tatsächlich gedauert? (ca. in Minuten)')
    .setHelpText('z.B. "15" oder "etwa 20"');

  return form;
}

// --------------- ALLE 30 PROTOKOLLE ---------------

function getAlleProtokolle_() {
  return [
    tp01_(), tp02_(), tp03_(), tp04_(), tp05_(),
    tp06_(), tp07_(), tp08_(), tp09_(), tp10_(),
    tp11_(), tp12_(), tp13_(), tp14_(), tp15_(),
    tp16_(), tp17_(), tp18_(), tp19_(), tp20_(),
    tp21_(), tp22_(), tp23_(), tp24_(), tp25_(),
    tp26_(), tp27_(), tp28_(), tp29_(), tp30_()
  ];
}

// TP-01
function tp01_() {
  return {
    id: 'TP-01', titel: 'Basis-Übersetzung (Texteingabe)',
    dauer: '12 Min', vorbedingungen: 'App im Browser geöffnet, Internet vorhanden',
    geraete: 'Smartphone oder Desktop',
    beschreibung: 'In diesem Test prüfst du die KERNFUNKTION der App: die Textübersetzung. ' +
      'Du tippst Texte ein und prüfst, ob die Übersetzung korrekt, schnell und zuverlässig erscheint. ' +
      'Du testest verschiedene Sprachen (auch Arabisch, Japanisch, Farsi) und prüfst Komfortfunktionen wie Kopieren und Löschen.\n\n' +
      'Die App öffnet standardmäßig die Übersetzer-Seite. Oben wählst du Quell- und Zielsprache, ' +
      'in der Mitte ist das Eingabefeld, darunter erscheint die Übersetzung.',
    testerFelder: ['Gerät', 'Browser + Version', 'Betriebssystem'],
    sektionen: [
      { titel: 'A — Grundlegende Übersetzung',
        beschreibung: 'Öffne die App und prüfe die Startseite. Tippe dann den Satz "Guten Morgen, wie geht es Ihnen?" ein. ' +
          'Die Übersetzung sollte AUTOMATISCH erscheinen (du musst keinen Button drücken). ' +
          'Achte auf die Geschwindigkeit und ob ein kleines Badge (z.B. "Google" oder "MyMemory") den verwendeten Übersetzungsdienst anzeigt.',
        aufgaben: [
        'Übersetzer-Seite wird standardmäßig angezeigt',
        'Quellsprache voreingestellt auf Deutsch',
        'Zielsprache voreingestellt auf Englisch',
        '"Guten Morgen, wie geht es Ihnen?" → Übersetzung erscheint automatisch',
        'Übersetzung erscheint in < 3 Sekunden',
        'Zeichenanzahl wird unterhalb angezeigt',
        'Provider-Badge sichtbar (z.B. Google, MyMemory)'
      ]},
      { titel: 'B — Sprachauswahl',
        beschreibung: 'Klicke auf die Sprachauswahl-Buttons oben. Es öffnet sich ein Dropdown mit Suchfeld. ' +
          'Teste die Suche (z.B. "Tür" eingeben → Türkisch sollte gefiltert werden). ' +
          'Wechsle verschiedene Sprachen und prüfe, ob die Übersetzung sich automatisch aktualisiert. ' +
          'Der Tausch-Button (↔ zwischen den Sprachen) sollte Quell- und Zielsprache tauschen.',
        aufgaben: [
        'Klick auf Quellsprache → Dropdown öffnet sich',
        'Suchfeld: "Tür" eingeben → Türkisch wird gefiltert',
        'Sprache auf Französisch → Übersetzung aktualisiert',
        'Tausch-Button (↔) tauscht Quell- und Zielsprache',
        'Zielsprache Arabisch → arabische Schrift',
        'Zielsprache Japanisch → japanische Zeichen',
        'Mindestens 40 Sprachen in der Liste'
      ]},
      { titel: 'C — Kopieren & Löschen',
        beschreibung: 'Unter der Übersetzung findest du einen Kopieren-Button (Zwischenablage-Icon). ' +
          'Klicke darauf und füge den Text z.B. in eine Notiz-App ein, um zu prüfen, ob er korrekt kopiert wurde. ' +
          'Der Löschen-Button (X) leert das Eingabefeld.',
        aufgaben: [
        'Kopieren-Button → Text in Zwischenablage',
        'Häkchen-Feedback erscheint nach Kopieren',
        'Löschen-Button → Eingabefeld wird geleert',
        'Übersetzung verschwindet nach dem Löschen'
      ]},
      { titel: 'D — Verschiedene Texte',
        beschreibung: 'Teste verschiedene Texteingaben: kurze Wörter, lange Absätze, Sonderzeichen (€, —, Zahlen), ' +
          'ein leeres Feld und schnelles Tippen. Die App sollte in allen Fällen stabil bleiben.',
        aufgaben: [
        '"Hallo" → sinnvolle Übersetzung',
        'Langer Text (5+ Sätze) → vollständig übersetzt',
        'Sonderzeichen "19,99€ — inkl. MwSt." → korrekt',
        'Leeres Feld → kein Fehler, Übersetzung verschwindet',
        'Schnelles Tippen → Übersetzung springt nicht wild'
      ]},
      { titel: 'E — Migrations-Sprachen',
        beschreibung: 'Teste Sprachen, die für Geflüchtete und Migranten wichtig sind. ' +
          'Wähle als Zielsprache nacheinander Farsi, Ukrainisch, Tigrinya und Kurdisch. ' +
          'Prüfe, ob die Übersetzung in der jeweiligen Schrift (persisch, kyrillisch, äthiopisch) erscheint.',
        aufgaben: [
        'Farsi → persische Schrift',
        'Ukrainisch → kyrillische Übersetzung',
        'Tigrinya → äthiopische Schrift',
        'Kurdisch → Übersetzung erscheint'
      ]}
    ],
    bewertungen: [
      'Übersetzungsgeschwindigkeit',
      'Übersetzungsqualität',
      'Benutzerfreundlichkeit Texteingabe',
      'Sprachauswahl & Suche',
      'Gesamteindruck'
    ]
  };
}

// TP-02
function tp02_() {
  return {
    id: 'TP-02', titel: 'Spracheingabe (Speech-to-Text)',
    dauer: '12 Min', vorbedingungen: 'Mikrofon-Berechtigung, ruhige Umgebung',
    geraete: 'Smartphone oder Desktop mit Mikrofon',
    beschreibung: 'In diesem Test prüfst du die SPRACHEINGABE: Du sprichst in dein Mikrofon und die App erkennt den gesprochenen Text, ' +
      'der dann automatisch übersetzt wird. Das Mikrofon-Symbol findest du neben dem Eingabefeld.\n\n' +
      'WICHTIG: Dein Browser wird nach Mikrofon-Berechtigung fragen — bitte erlaube dies. ' +
      'Teste in einer ruhigen Umgebung für beste Ergebnisse. Während du sprichst, sollte der Text live (in Grau) erscheinen ' +
      'und nach dem Satzende als finaler Text übernommen werden.',
    testerFelder: ['Gerät', 'Browser + Version', 'Betriebssystem'],
    sektionen: [
      { titel: 'A — Mikrofon-Aktivierung',
        beschreibung: 'Klicke auf den Mikrofon-Button neben dem Eingabefeld. Dein Browser fragt nach Berechtigung. ' +
          'Erlaube den Zugriff. Ein roter Indikator zeigt an, dass aufgenommen wird. Erneutes Klicken stoppt die Aufnahme.',
        aufgaben: [
        'Mikrofon-Button ist sichtbar',
        'Klick → Browser fragt nach Berechtigung',
        'Berechtigung erteilen → Aufnahme startet (roter Indikator)',
        'Erneut klicken → Aufnahme stoppt'
      ]},
      { titel: 'B — Erkennung Deutsch',
        beschreibung: 'Stelle Quellsprache auf Deutsch. Starte die Aufnahme und sage deutlich: ' +
          '"Ich möchte einen Kaffee bestellen". Während du sprichst, sollte grauer Interim-Text erscheinen. ' +
          'Nach dem Satzende wird der Text final und die Übersetzung startet automatisch.',
        aufgaben: [
        'Sagen: "Ich möchte einen Kaffee bestellen" → Text erkannt',
        'Interim-Text erscheint während des Sprechens (live)',
        'Text wird als final übernommen',
        'Übersetzung erscheint automatisch',
        'Erkannter Text stimmt inhaltlich'
      ]},
      { titel: 'C — Andere Sprachen',
        beschreibung: 'Wechsle die Quellsprache auf Englisch, Französisch, Spanisch und Türkisch. ' +
          'Sprich jeweils den angegebenen Satz und prüfe, ob er korrekt erkannt wird. ' +
          'Du musst die Sprache nicht perfekt beherrschen — lies den Satz einfach laut vor.',
        aufgaben: [
        'Englisch: "Where is the nearest hospital?" → korrekt',
        'Französisch: "Bonjour, comment allez-vous?" → korrekt',
        'Spanisch: "Buenos días, necesito ayuda" → korrekt',
        'Türkisch: "Merhaba, yardıma ihtiyacım var" → korrekt'
      ]},
      { titel: 'D — Streaming & Satzgrenzen',
        beschreibung: 'Teste Dauersprechen: Sprich mehrere Sätze hintereinander, mach Pausen mitten im Satz, ' +
          'und sprich 20+ Sekunden am Stück. Die App sollte geduldig warten und alles erfassen.',
        aufgaben: [
        'Mehrere Sätze hintereinander → einzeln erkannt',
        'Pause mitten im Satz → System wartet geduldig',
        '20+ Sek. durchsprechen → vollständig erfasst',
        'Leise Umgebung: zuverlässig',
        'Mäßige Hintergrundgeräusche: noch akzeptabel'
      ]},
      { titel: 'E — Fehlerfälle',
        beschreibung: 'Teste absichtlich Fehlersituationen: Verweigere die Mikrofon-Berechtigung (in Browser-Einstellungen), ' +
          'sage 10 Sekunden lang nichts, wechsle die Seite während der Aufnahme, und klicke den Button schnell an/aus.',
        aufgaben: [
        'Berechtigung verweigern → sinnvolle Fehlermeldung',
        '10 Sek. nichts sagen → kein Absturz',
        'Seite wechseln während Aufnahme → stoppt sauber',
        'Mikrofon schnell ein/aus → kein Absturz'
      ]}
    ],
    bewertungen: [
      'Erkennungsgenauigkeit Deutsch',
      'Erkennungsgenauigkeit Fremdsprachen',
      'Reaktionsgeschwindigkeit (Interim-Text)',
      'Umgang mit Fehlern',
      'Gesamteindruck'
    ]
  };
}

// TP-03
function tp03_() {
  return {
    id: 'TP-03', titel: 'Sprachausgabe (Text-to-Speech)',
    dauer: '12 Min', vorbedingungen: 'Lautsprecher/Kopfhörer verfügbar',
    geraete: 'Smartphone oder Desktop',
    beschreibung: 'In diesem Test prüfst du die SPRACHAUSGABE: Die App kann Übersetzungen vorlesen. ' +
      'Du findest Lautsprecher-Icons sowohl beim Quelltext als auch bei der Übersetzung. ' +
      'Es gibt eine "Auto-Speak"-Funktion (liest automatisch vor) und eine "HD Voice"-Option (bessere Stimmqualität).\n\n' +
      'WICHTIG: Stelle sicher, dass dein Gerät nicht stumm geschaltet ist und die Lautstärke hoch genug ist.',
    testerFelder: ['Gerät', 'Browser + Version', 'Betriebssystem'],
    sektionen: [
      { titel: 'A — Manuelle Sprachausgabe',
        beschreibung: 'Übersetze einen Text (z.B. DE→EN). Klicke auf das Lautsprecher-Icon bei der Übersetzung. ' +
          'Die Übersetzung sollte vorgelesen werden. Achte auf Aussprache und ob ein Badge anzeigt, welche TTS-Engine verwendet wird ' +
          '(Cloud = Google Cloud, Browser = eingebaute Stimme). Es gibt auch einen Lautsprecher beim Quelltext.',
        aufgaben: [
        'DE→EN übersetzen, Lautsprecher-Button → Audio spielt',
        'Aussprache ist verständlich und natürlich',
        'TTS-Engine-Badge sichtbar (Cloud oder Browser)',
        'Stop-Button → Audio stoppt sofort',
        'Quelltext-Lautsprecher → Quelltext wird vorgelesen'
      ]},
      { titel: 'B — Auto-Speak',
        beschreibung: 'Suche den "Auto-Speak"-Toggle (Lautsprecher mit Auto-Symbol). Wenn aktiviert, wird jede neue Übersetzung ' +
          'automatisch vorgelesen, ohne dass du den Lautsprecher-Button klicken musst. Teste ein/aus.',
        aufgaben: [
        'Auto-Speak ist standardmäßig aktiviert',
        'Text eingeben → Übersetzung wird automatisch vorgelesen',
        'Deaktivieren → NICHT vorgelesen',
        'Wieder aktivieren → wieder vorgelesen'
      ]},
      { titel: 'C — HD Voice (Chirp 3 HD)',
        beschreibung: 'Suche den HD-Voice-Toggle. Wenn aktiviert, verwendet die App eine hochwertigere Stimme (Chirp 3 HD statt Neural2). ' +
          'Vergleiche den Klang mit aktiviertem und deaktiviertem HD.',
        aufgaben: [
        'HD-Voice-Toggle aktivieren',
        'Stimme klingt hochwertiger als Standard',
        'Deaktivieren → Standard-Stimme (Neural2)'
      ]},
      { titel: 'D — Verschiedene Sprachen',
        beschreibung: 'Wechsle die Zielsprache und lasse verschiedene Sprachen vorlesen. Achte darauf, ob die Aussprache ' +
          'zur jeweiligen Sprache passt (z.B. arabische Betonung, japanische Silben).',
        aufgaben: [
        'Englisch → korrekte Aussprache',
        'Französisch → korrekte Aussprache',
        'Arabisch → korrekte Aussprache',
        'Japanisch → korrekte Aussprache',
        'Türkisch → korrekte Aussprache',
        'Hindi → korrekte Aussprache'
      ]},
      { titel: 'E — Edge Cases',
        beschreibung: 'Teste Extremfälle: Sehr langen Text vorlesen lassen, den Lautsprecher-Button 3x schnell hintereinander klicken ' +
          '(es sollte kein Audio-Durcheinander entstehen), und prüfe was passiert wenn dein Gerät stumm geschaltet ist.',
        aufgaben: [
        '100+ Wörter → spielt vollständig',
        '3x schnell klicken → kein Audiochaos',
        'Neue Übersetzung → alte Ausgabe stoppt',
        'Gerät stumm → kein App-Fehler'
      ]}
    ],
    bewertungen: [
      'Stimmqualität (Standard)',
      'Stimmqualität (HD)',
      'Auto-Speak Zuverlässigkeit',
      'Sprachvielfalt',
      'Gesamteindruck'
    ]
  };
}

// TP-04
function tp04_() {
  return {
    id: 'TP-04', titel: 'Formalität (Sie/Du), Quick Phrases & Verlauf',
    dauer: '12 Min', vorbedingungen: 'App geöffnet, Internet vorhanden',
    geraete: 'Smartphone oder Desktop',
    beschreibung: 'In diesem Test prüfst du drei Komfortfunktionen:\n\n' +
      '1. FORMALITÄT (Sie/Du): Ein Toggle, der zwischen formeller und informeller Anrede umschaltet. ' +
      'Besonders nützlich bei Behördengängen (Sie) vs. Freunden (Du).\n' +
      '2. QUICK PHRASES: Vorgefertigte Sätze für häufige Situationen (Begrüßung, Arzt, Behörde), ' +
      'die mit einem Klick ins Eingabefeld übernommen werden.\n' +
      '3. VERLAUF: Zeigt die letzten Übersetzungen an und erlaubt es, sie wiederherzustellen.',
    testerFelder: ['Gerät', 'Browser + Version', 'Betriebssystem'],
    sektionen: [
      { titel: 'A — Formalität (Sie/Du)',
        beschreibung: 'Suche den Formalitäts-Toggle auf der Übersetzer-Seite (Symbol: Krawatte oder ähnlich). ' +
          'Stelle die Zielsprache auf Deutsch und übersetze "How are you?" — mit "Sie" sollte "Ihnen" erscheinen, ' +
          'mit "Du" sollte "dir" erscheinen. Bei Sprachen ohne Formalitäts-Unterscheidung (z.B. Japanisch) sollte der Toggle verschwinden.',
        aufgaben: [
        'Formalitäts-Toggle finden',
        'Ziel DE, "Sie": "How are you?" → enthält Sie/Ihnen',
        'Toggle "Du" → enthält du/dir',
        'Ziel Französisch, Du → tu/toi statt vous',
        'Ziel Japanisch → Toggle ausgeblendet',
        'Zurück Deutsch → Toggle erscheint wieder'
      ]},
      { titel: 'B — Quick Phrases',
        beschreibung: 'Scrolle auf der Übersetzer-Seite nach unten — dort findest du vorgefertigte Sätze in verschiedenen Kategorien. ' +
          'Klicke auf eine Phrase, sie sollte automatisch ins Eingabefeld übernommen und übersetzt werden.',
        aufgaben: [
        'Quick Phrases Sektion finden',
        'Verschiedene Kategorien vorhanden',
        'Phrase klicken → ins Eingabefeld übernommen',
        'Übersetzung startet automatisch',
        'Verschiedene Kategorien → verschiedene Phrasen'
      ]},
      { titel: 'C — Übersetzungsverlauf',
        beschreibung: 'Führe mindestens 3 verschiedene Übersetzungen durch. Der Verlauf (Uhr-Icon oder unterhalb des Übersetzers) ' +
          'sollte alle bisherigen Übersetzungen zeigen. Klicke auf einen Eintrag, um ihn wiederherzustellen. ' +
          'Teste auch Einzellöschen und "Alles löschen". Nach einem Seitenneuladen (F5) sollte der Verlauf noch da sein.',
        aufgaben: [
        '3+ Übersetzungen durchführen',
        'Verlauf zeigt letzte Übersetzungen',
        'Sprachpaar bei jedem Eintrag',
        'Eintrag klicken → wiederhergestellt',
        'Einzeln löschen → nur dieser weg',
        '"Alles löschen" → komplett leer',
        'Seite neu laden → Verlauf bleibt (localStorage)'
      ]}
    ],
    bewertungen: [
      'Sie/Du Umschaltung',
      'Quick Phrases Nützlichkeit',
      'Verlauf Benutzerfreundlichkeit',
      'Gesamteindruck'
    ]
  };
}

// TP-05
function tp05_() {
  return {
    id: 'TP-05', titel: 'Satz- vs. Absatzmodus',
    dauer: '10 Min', vorbedingungen: 'App geöffnet, Mikrofon verfügbar',
    geraete: 'Smartphone oder Desktop',
    beschreibung: 'Die App hat zwei Übersetzungsmodi:\n\n' +
      '• SATZMODUS (⚡ Zap-Icon): Jeder Satz wird sofort beim Tippen/Sprechen einzeln übersetzt. Ideal für schnelle Kommunikation.\n' +
      '• ABSATZMODUS (≡ AlignLeft-Icon): Text wird gesammelt und erst beim Klick auf "Senden" übersetzt. Ideal für längere Texte.\n\n' +
      'Du findest die Umschaltung als kleine Icons beim Eingabefeld. Teste beide Modi mit Tippen und mit Mikrofon.',
    testerFelder: ['Gerät', 'Browser + Version', 'Betriebssystem'],
    sektionen: [
      { titel: 'A — Satzmodus',
        beschreibung: 'Wähle den Satzmodus (Blitz/Zap-Icon). Tippe "Hallo. Wie geht es?" — jeder Satz sollte SOFORT einzeln übersetzt werden, ' +
          'ohne dass du einen Senden-Button drücken musst. Teste auch mit dem Mikrofon: Nach jedem Satzende sollte die Übersetzung erscheinen.',
        aufgaben: [
        'Satzmodus auswählen (Zap-Icon)',
        'Tooltip: "Jeder Satz wird sofort übersetzt"',
        '"Hallo. Wie geht es?" → jeder Satz sofort einzeln übersetzt',
        'Mikrofon: Satz wird nach Satzende übersetzt'
      ]},
      { titel: 'B — Absatzmodus',
        beschreibung: 'Wechsle zum Absatzmodus (Textzeilen-Icon). Tippe mehrere Sätze ein — sie sollten NICHT automatisch übersetzt werden. ' +
          'Ein "Senden"-Button wird sichtbar. Erst nach Klick auf Senden wird der gesamte Block übersetzt. ' +
          'Teste auch mit dem Mikrofon: Der Text sammelt sich, bis du Senden klickst.',
        aufgaben: [
        'Absatzmodus auswählen (AlignLeft-Icon)',
        'Tooltip: "Text sammeln, dann Senden"',
        'Mehrere Sätze → NICHT automatisch übersetzt',
        'Senden-Button sichtbar',
        'Senden klicken → Block wird übersetzt',
        'Mikrofon: Text sammelt sich bis Senden'
      ]},
      { titel: 'C — Moduswechsel & Tastenkombination',
        beschreibung: 'Wechsle zwischen den Modi hin und her — der eingegebene Text sollte erhalten bleiben. ' +
          'Nach einem Seitenneulade (F5) sollte der gewählte Modus gespeichert sein. ' +
          'Auf Desktop: Teste Ctrl+Enter (sofort übersetzen im Absatzmodus) und Esc (Text löschen).',
        aufgaben: [
        'Satz→Absatz: Text bleibt erhalten',
        'Absatz→Satz: kein Fehler',
        'Seite neu laden → Modus gespeichert',
        'Hinweis "Ctrl+Enter / Esc" sichtbar',
        'Ctrl+Enter → sofortige Übersetzung (Absatzmodus)',
        'Esc → Text gelöscht'
      ]}
    ],
    bewertungen: [
      'Satzmodus Funktionalität',
      'Absatzmodus Funktionalität',
      'Moduswechsel-Erlebnis',
      'Gesamteindruck'
    ]
  };
}

// TP-06
function tp06_() {
  return {
    id: 'TP-06', titel: 'Live Session — Speaker (Cloud)',
    dauer: '15 Min', vorbedingungen: '2 Geräte, Internet, Mikrofon am Speaker',
    geraete: '2 Smartphones oder 1 Smartphone + 1 Desktop',
    beschreibung: 'LIVE SESSION ist die Kernfunktion für Reiseleiter: Ein Sprecher (Speaker) spricht in sein Mikrofon, ' +
      'und beliebig viele Zuhörer (Listener) empfangen die Übersetzung in ihrer gewählten Sprache in Echtzeit.\n\n' +
      'In diesem Test bist du der SPEAKER (Sprecher). Du brauchst 2 Geräte: Eines als Speaker, eines als Listener.\n\n' +
      'SO FUNKTIONIERT ES:\n' +
      '1. Gehe auf "Live" in der Navigation\n' +
      '2. Wähle "Speaker" und dann "Cloud"-Modus\n' +
      '3. Ein Session-Code und QR-Code werden angezeigt\n' +
      '4. Auf dem 2. Gerät: "Live" → "Listener" → Code eingeben oder QR scannen\n' +
      '5. Der Listener wählt seine Zielsprache und tritt bei\n' +
      '6. Du sprichst in dein Mikrofon und der Listener sieht die Übersetzung',
    testerFelder: ['Speaker-Gerät', 'Listener-Gerät', 'Browser (Speaker)', 'Browser (Listener)'],
    sektionen: [
      { titel: 'A — Session erstellen',
        beschreibung: 'Navigiere zu "Live" und wähle "Speaker". Wähle Deutsch als Quellsprache und "Cloud" als Verbindungsmodus. ' +
          'Ein Session-Code (z.B. TR-A3K9) und ein QR-Code sollten angezeigt werden.',
        aufgaben: [
        'Navigation → Live',
        'Speaker/Listener Auswahl sichtbar',
        'Speaker wählen, Quellsprache Deutsch',
        'Cloud-Modus wählen',
        'Session-Code angezeigt (z.B. TR-A3K9)',
        'QR-Code angezeigt',
        'Status zeigt "Cloud"'
      ]},
      { titel: 'B — Listener beitreten',
        beschreibung: 'Nimm das 2. Gerät, öffne die App, gehe auf "Live" → "Listener". ' +
          'Gib den Session-Code ein oder scanne den QR-Code mit der Kamera des 2. Geräts. ' +
          'Wähle Englisch als Zielsprache und tritt bei. Auf dem Speaker-Gerät sollte die Listener-Anzahl auf 1 steigen.',
        aufgaben: [
        '2. Gerät: Live → Listener',
        'Code eingeben oder QR scannen',
        'Zielsprache EN wählen und beitreten',
        'Speaker sieht Listener-Anzahl = 1',
        'Aufschlüsselung nach Sprache (EN:1)'
      ]},
      { titel: 'C — Sprechen & Übersetzen',
        beschreibung: 'Klicke auf dem Speaker-Gerät den Mikrofon-Button. Ein roter Indikator zeigt die Aufnahme an. ' +
          'Sage: "Willkommen an Bord. Heute besuchen wir die Altstadt." ' +
          'Auf dem Speaker siehst du dein Transkript, auf dem Listener die englische Übersetzung. ' +
          'Achte auf die Latenzanzeige (sollte unter 5 Sekunden liegen).',
        aufgaben: [
        'Aufnahme starten (Mikrofon-Button)',
        'Roter Indikator sichtbar',
        'Sagen: "Willkommen an Bord. Heute besuchen wir die Altstadt."',
        'Speaker: Transkript erscheint in Echtzeit',
        'Listener: Übersetzung in der Zielsprache',
        'Latenzanzeige beim Speaker (STT ms, Translate ms)',
        'Gesamtlatenz < 5 Sekunden'
      ]},
      { titel: 'D — Pause & Session beenden',
        beschreibung: 'Klicke auf Pause — die Aufnahme sollte stoppen und Gesprochenes nicht erfasst werden. ' +
          'Klicke auf Fortsetzen — die Aufnahme geht weiter. ' +
          'Klicke auf "Session beenden" — der Listener sollte eine "Session beendet"-Meldung erhalten.',
        aufgaben: [
        'Pause → Aufnahme stoppt, Sprechen nicht erfasst',
        'Fortsetzen → Aufnahme geht weiter',
        'Session beenden klicken',
        'Listener erhält "Session beendet"',
        'Speaker zurück zur Landing-Page'
      ]}
    ],
    bewertungen: [
      'Session-Erstellung',
      'QR-Code / Beitritt',
      'Echtzeit-Übersetzung',
      'Latenz',
      'Session-Beendigung',
      'Gesamteindruck'
    ]
  };
}

// TP-07
function tp07_() {
  return {
    id: 'TP-07', titel: 'Live Session — Listener (Cloud)',
    dauer: '12 Min', vorbedingungen: 'Laufende Speaker-Session, 2. Gerät',
    geraete: '2 Geräte (Speaker + Listener)',
    beschreibung: 'In diesem Test bist du der LISTENER (Zuhörer) einer Live Session. ' +
      'Du trittst einer laufenden Speaker-Session bei und empfängst Übersetzungen in Echtzeit.\n\n' +
      'Du brauchst jemanden (oder ein 2. Gerät), der als Speaker eine Session erstellt hat. ' +
      'Als Listener kannst du die Zielsprache wählen, Übersetzungen vorlesen lassen (Auto-TTS), ' +
      'und einen Fullscreen-Modus nutzen (wie Untertitel auf einem großen Bildschirm).',
    testerFelder: ['Gerät (Listener)', 'Browser + Version', 'Betriebssystem'],
    sektionen: [
      { titel: 'A — Beitreten',
        beschreibung: 'Gehe auf "Live" → "Listener". Gib den Session-Code des Speakers manuell ein ODER scanne den QR-Code. ' +
          'Wähle deine Zielsprache (z.B. Englisch) und tritt bei. Der Status sollte "Verbunden" zeigen.',
        aufgaben: [
        'Live → Listener wählen',
        'Session-Code manuell eingeben → Beitritt',
        'Alternativ: QR-Code scannen → auto Beitritt',
        'Zielsprache wählen',
        'Status "Verbunden"'
      ]},
      { titel: 'B — Übersetzungen empfangen',
        beschreibung: 'Bitte den Speaker, etwas zu sagen. Die Übersetzung sollte in großer, gut lesbarer Schrift erscheinen. ' +
          'Neue Übersetzungen erscheinen oben, ältere können nach unten gescrollt werden. ' +
          'Wenn der Speaker schweigt, sollte "Warte auf Übersetzung..." angezeigt werden.',
        aufgaben: [
        'Speaker spricht → Übersetzung erscheint',
        'Groß und gut lesbar',
        'Neue ersetzen vorherige (aktuelle oben)',
        'Verlauf scrollbar',
        '"Warte auf Übersetzung..." wenn still'
      ]},
      { titel: 'C — Auto-TTS',
        beschreibung: 'Suche den Auto-TTS-Toggle. Wenn aktiviert, wird jede empfangene Übersetzung automatisch vorgelesen — ' +
          'ideal wenn du nur zuhören willst, statt auf den Bildschirm zu schauen. Teste ein/aus.',
        aufgaben: [
        'Auto-TTS Toggle prüfen',
        'Speaker spricht → Listener hört Übersetzung automatisch',
        'Deaktivieren → nicht vorgelesen',
        'Aktivieren → wieder vorgelesen'
      ]},
      { titel: 'D — Sprache wechseln & Fullscreen',
        beschreibung: 'Oben siehst du Sprach-Chips (z.B. EN, FR, AR). Wechsle die Sprache zur Laufzeit — ' +
          'die nächste Übersetzung kommt in der neuen Sprache. ' +
          'Teste den Fullscreen-Toggle: schwarzer Hintergrund mit großem Text wie Untertitel (ideal für Präsentationen). ' +
          'Der "Verlassen"-Button bringt dich zurück zur Landing-Page.',
        aufgaben: [
        'Sprach-Chips sichtbar, EN→FR wechseln → nächste auf Französisch',
        'Fullscreen-Toggle → schwarzer Hintergrund, großer Text',
        '3-5 Untertitel mit Fade-Effekt',
        'Fullscreen verlassen → normale Ansicht',
        'Verlassen-Button → zurück zur Landing'
      ]}
    ],
    bewertungen: [
      'Beitritts-Erlebnis',
      'Echtzeit-Übersetzungsempfang',
      'Auto-TTS Qualität',
      'Fullscreen-Untertitel',
      'Gesamteindruck'
    ]
  };
}

// TP-08
function tp08_() {
  return {
    id: 'TP-08', titel: 'Live Session — Multi-Listener & Multi-Sprache',
    dauer: '15 Min', vorbedingungen: 'Mindestens 3 Geräte mit Internet',
    geraete: '1 Speaker + 2-3 Listener',
    beschreibung: 'Die Live Session unterstützt MEHRERE ZUHÖRER gleichzeitig, die jeweils in einer ANDEREN SPRACHE zuhören können. ' +
      'Z.B. spricht ein Reiseleiter Deutsch, und gleichzeitig hören Touristen auf Englisch, Französisch und Türkisch.\n\n' +
      'Du brauchst mindestens 3 Geräte: 1 Speaker + 2 Listener (3. Listener optional). ' +
      'Jeder Listener wählt eine andere Zielsprache. Teste ob alle gleichzeitig die korrekte Übersetzung erhalten.',
    testerFelder: ['Gerät 1 (Speaker)', 'Gerät 2 (Listener 1)', 'Gerät 3 (Listener 2)', 'Gerät 4 (Listener 3, optional)'],
    sektionen: [
      { titel: 'A — Multi-Listener Setup',
        beschreibung: 'Speaker erstellt eine Cloud-Session auf Deutsch. Listener 1 tritt mit Englisch bei, Listener 2 mit Französisch, ' +
          'Listener 3 (optional) mit Türkisch. Auf dem Speaker-Bildschirm sollte die Listener-Anzahl und die Aufschlüsselung nach Sprache sichtbar sein.',
        aufgaben: [
        'Speaker: Session Cloud, Deutsch',
        'Listener 1: Englisch beitreten',
        'Listener 2: Französisch beitreten',
        'Listener 3 (opt): Türkisch beitreten',
        'Speaker sieht korrekte Listener-Anzahl',
        'Aufschlüsselung nach Sprache (EN:1, FR:1, TR:1)'
      ]},
      { titel: 'B — Parallele Übersetzung',
        beschreibung: 'Der Speaker sagt: "Wir fahren jetzt in den Hafen." Prüfe auf jedem Listener-Gerät, ' +
          'ob die Übersetzung in der RICHTIGEN Sprache ankommt. Alle sollten ungefähr gleichzeitig die Übersetzung erhalten.',
        aufgaben: [
        'Speaker: "Wir fahren jetzt in den Hafen."',
        'Listener 1 (EN): englische Übersetzung',
        'Listener 2 (FR): französische Übersetzung',
        'Listener 3 (TR): türkische Übersetzung',
        'Jeder NUR seine Zielsprache',
        'Alle ungefähr gleichzeitig'
      ]},
      { titel: 'C — Dynamik & Stresstest',
        beschreibung: 'Teste dynamisches Verhalten: Ein Listener verlässt die Session (Anzahl sinkt), ' +
          'tritt dann mit einer NEUEN Sprache bei (z.B. Spanisch statt Französisch). ' +
          'Ein anderer Listener wechselt seine Sprache zur Laufzeit. Dann sprich 5 Sätze schnell hintereinander — alle sollten bei allen ankommen.',
        aufgaben: [
        'L2 verlässt Session → Anzahl aktualisiert',
        'L1 empfängt weiterhin',
        'L2 tritt neu bei (Spanisch) → Speaker aktualisiert',
        'L1 wechselt EN→Arabisch → nächste auf Arabisch',
        '5 Sätze schnell → alle bei allen',
        'Reihenfolge stimmt (FIFO)'
      ]}
    ],
    bewertungen: [
      'Multi-Listener Stabilität',
      'Parallelität der Übersetzungen',
      'Dynamisches Beitreten/Verlassen',
      'Sprachwechsel zur Laufzeit',
      'Gesamteindruck'
    ]
  };
}

// TP-09
function tp09_() {
  return {
    id: 'TP-09', titel: 'Live Session — Lokales WiFi (Router)',
    dauer: '15 Min', vorbedingungen: 'Portabler Router mit Relay-Server, 2 Geräte im gleichen WLAN',
    geraete: 'Router + 2 Smartphones/Laptops',
    beschreibung: 'Die App kann Live Sessions auch OHNE INTERNET über einen lokalen WiFi-Router betreiben. ' +
      'Das ist z.B. auf einem Bus, Boot oder in Gebieten ohne Mobilfunk nützlich.\n\n' +
      'VORAUSSETZUNG: Ein portabler Router (z.B. GL.iNet) auf dem ein Relay-Server läuft (Port 8765). ' +
      'Beide Geräte müssen im gleichen WLAN des Routers sein. Die App findet den Server automatisch (Auto-Discovery).',
    testerFelder: ['Router-Modell', 'Router-IP', 'Speaker-Gerät', 'Listener-Gerät'],
    sektionen: [
      { titel: 'A — Vorbereitung',
        beschreibung: 'Stelle sicher, dass der Relay-Server auf dem Router läuft (Port 8765). ' +
          'Verbinde beide Geräte mit dem Router-WLAN. ' +
          'Prüfe den Health-Check: Öffne im Browser http://<Router-IP>:8765/health — es sollte eine Antwort kommen.',
        aufgaben: [
        'Relay-Server auf Port 8765 läuft',
        'Beide Geräte im Router-WLAN',
        'Health-Check http://<ip>:8765/health antwortet'
      ]},
      { titel: 'B — Lokale Session',
        beschreibung: 'Erstelle eine Speaker-Session und wähle "Lokales WiFi" als Modus. ' +
          'Die App sollte den Server automatisch finden (Auto-Discovery). Ein Session-Code und QR-Code werden angezeigt. ' +
          'Der Status sollte "Lokal" anzeigen (nicht "Cloud").',
        aufgaben: [
        'Speaker → "Lokales WiFi" Modus',
        'Auto-Discovery findet Server',
        'Session erstellt, Code angezeigt',
        'QR enthält ?ws=ws://<ip>:8765',
        'Anzeige "Lokal"'
      ]},
      { titel: 'C — Übersetzung & Offline',
        beschreibung: 'Listener scannt den QR-Code oder öffnet den Link. Die Verbindung läuft über den lokalen WebSocket. ' +
          'Teste Sprechen und Übersetzen. Dann trenne das Internet des Routers — der WebSocket sollte weiterhin funktionieren. ' +
          'Die Übersetzung nutzt dann Offline-Modelle (falls heruntergeladen) oder zeigt eine sinnvolle Fehlermeldung.',
        aufgaben: [
        'Listener: QR scannen oder Link öffnen',
        'Verbindung über lokalen WebSocket',
        'Speaker spricht → Übersetzung kommt',
        'Latenz < 3 Sekunden',
        'Mehrere Sätze korrekt',
        'Router-Internet trennen → WebSocket bleibt',
        'Offline-Modelle oder sinnvolle Fehlermeldung'
      ]}
    ],
    bewertungen: [
      'Auto-Discovery des Routers',
      'Verbindungsstabilität (Lokal)',
      'Latenz im lokalen Netz',
      'Funktionalität ohne Internet',
      'Gesamteindruck'
    ]
  };
}

// TP-10
function tp10_() {
  return {
    id: 'TP-10', titel: 'Live Session — Hotspot-Modus',
    dauer: '15 Min', vorbedingungen: '2 Smartphones, Speaker kann Hotspot erstellen',
    geraete: '2 Smartphones (Speaker: Android empfohlen)',
    beschreibung: 'Die App kann einen HOTSPOT erstellen, sodass Listener sich direkt mit dem Speaker-Gerät verbinden können — ' +
      'komplett ohne vorhandenes WLAN oder Internet. Ideal in der Natur, auf Wanderungen oder in abgelegenen Gebieten.\n\n' +
      'ABLAUF: Der Speaker wählt "Hotspot"-Modus. Die App erstellt automatisch einen WLAN-Hotspot ' +
      '(auf Android automatisch, auf iOS manuell). Ein WiFi-QR-Code wird angezeigt, den der Listener scannt, ' +
      'um sich mit dem Hotspot zu verbinden. Danach scannt der Listener den Session-QR-Code.',
    testerFelder: ['Speaker-Gerät (Hotspot)', 'Listener-Gerät', 'Speaker-OS', 'Listener-OS'],
    sektionen: [
      { titel: 'A — Hotspot erstellen',
        beschreibung: 'Wähle als Speaker den "Hotspot"-Modus. Auf Android sollte automatisch ein WLAN-Hotspot erstellt werden ' +
          'mit einer SSID und einem Passwort. Auf iOS erscheint ein Hinweis, den Hotspot manuell zu aktivieren. ' +
          'Ein WiFi-QR-Code und die SSID+Passwort als Text sollten angezeigt werden.',
        aufgaben: [
        'Speaker → "Hotspot" Modus',
        'Android: Auto-Hotspot mit SSID+Passwort',
        'iOS: Hinweis manueller Hotspot',
        'WiFi-QR-Code angezeigt',
        'SSID+Passwort als Text'
      ]},
      { titel: 'B — Listener verbindet',
        beschreibung: 'Auf dem Listener-Gerät: Scanne zuerst den WiFi-QR-Code (Schritt 1), ' +
          'um dich mit dem Hotspot-WLAN zu verbinden. Alternativ: SSID und Passwort manuell eingeben. ' +
          'Danach scanne den Session-QR-Code (Schritt 2), um der Live Session beizutreten.',
        aufgaben: [
        'WiFi-QR scannen → auto Verbindung',
        'Oder manuell SSID+Passwort eingeben',
        'Im Hotspot-Netzwerk',
        'Session-QR scannen (Schritt 2)',
        'Verbindung über lokalen WebSocket',
        'Speaker sieht Listener'
      ]},
      { titel: 'C — Übersetzung & Stabilität',
        beschreibung: 'Teste die Übersetzung über den Hotspot: Der Speaker spricht, der Listener empfängt die Übersetzung. ' +
          'Da kein Internet vorhanden ist, werden Offline-Modelle verwendet (falls heruntergeladen). ' +
          'Teste 5 Minuten Stabilität, Sperren/Entsperren des Geräts, und sauberes Beenden.',
        aufgaben: [
        'Speaker spricht → Übersetzung kommt',
        'Ohne Internet (Offline-Modelle)',
        'Mehrere Sätze korrekt',
        '5 Min stabil',
        'Gerät sperren/entsperren → hält',
        'Session sauber beenden'
      ]}
    ],
    bewertungen: [
      'Hotspot-Erstellung',
      'WiFi-QR-Verbindung',
      'Übersetzungsqualität',
      'Stabilität',
      'Gesamteindruck'
    ]
  };
}

// TP-11
function tp11_() {
  return {
    id: 'TP-11', titel: 'Live Session — BLE (Bluetooth)',
    dauer: '15 Min', vorbedingungen: '2 Smartphones mit nativer App, Bluetooth an',
    geraete: '2 Smartphones (iOS oder Android, native App)',
    beschreibung: 'Die App unterstützt auch Live Sessions über BLUETOOTH (BLE = Bluetooth Low Energy). ' +
      'Das funktioniert komplett ohne WLAN und ohne Internet — nur Bluetooth reicht!\n\n' +
      'WICHTIG: BLE funktioniert NUR in der nativen App (über Capacitor), NICHT im Browser. ' +
      'Beide Geräte müssen Bluetooth aktiviert haben und die Berechtigung erteilen. ' +
      'Die Reichweite beträgt typischerweise 5-10 Meter.',
    testerFelder: ['Speaker-Gerät', 'Listener-Gerät', 'Speaker-OS + Version', 'Listener-OS + Version'],
    sektionen: [
      { titel: 'A — BLE-Setup',
        beschreibung: 'Aktiviere Bluetooth auf beiden Geräten. Erteile die Bluetooth-Berechtigung in der App. ' +
          'Erstelle als Speaker eine Session und wähle "BLE" als Verbindungsmodus. ' +
          'Die App startet einen GATT-Server und beginnt mit dem Advertising (sichtbar für andere Geräte).',
        aufgaben: [
        'Bluetooth auf beiden Geräten an',
        'Bluetooth-Berechtigung erteilt',
        '"BLE" Modus verfügbar',
        'BLE wählen → Session erstellt',
        'GATT-Server startet',
        'Advertising beginnt'
      ]},
      { titel: 'B — Discovery & Verbindung',
        beschreibung: 'Auf dem Listener-Gerät: Wähle "BLE"-Modus. Der BLE-Scan startet automatisch und zeigt ' +
          'verfügbare Speaker mit Signalstärke (RSSI) an. Tippe auf den Speaker, um die Verbindung herzustellen.',
        aufgaben: [
        'Listener → BLE wählen',
        'BLE-Scan startet automatisch',
        'Speaker in Liste mit RSSI-Signalstärke',
        'Signalstärke 3-stufig sinnvoll',
        'Antippen → Verbindung hergestellt'
      ]},
      { titel: 'C — Übersetzung & Reichweite',
        beschreibung: 'Teste die Übersetzung über BLE. Achte besonders auf lange Texte (100+ Zeichen), ' +
          'die in Fragmente aufgeteilt und wieder zusammengesetzt werden müssen. ' +
          'Teste verschiedene Entfernungen: 1m, 5m, 10+ Meter. Bei Verbindungsabbruch sollte ein automatischer Reconnect stattfinden.',
        aufgaben: [
        'Speaker spricht → via BLE beim Listener',
        'Text korrekt (keine Zeichenfehler)',
        '100+ Zeichen: fragmentiert+reassembliert',
        '1m entfernt: stabil',
        '5m entfernt: stabil',
        '10+m entfernt: noch möglich?',
        'Verbindungsabbruch → Reconnect',
        'Session beenden → BLE-Advertising stoppt'
      ]}
    ],
    bewertungen: [
      'BLE-Discovery Zuverlässigkeit',
      'Verbindungsaufbau-Geschwindigkeit',
      'Übertragungsqualität',
      'Reichweite',
      'Gesamteindruck'
    ]
  };
}

// TP-12
function tp12_() {
  return {
    id: 'TP-12', titel: 'Session-Protokoll Export',
    dauer: '10 Min', vorbedingungen: 'Session mit min. 5 Übersetzungen',
    geraete: '2 Geräte (Speaker + Listener)',
    beschreibung: 'Nach einer Live Session kann der Speaker ein Protokoll herunterladen — eine Zusammenfassung ' +
      'aller gesprochenen Texte und Übersetzungen mit Zeitstempeln. Verfügbar als TXT und Markdown.\n\n' +
      'VORBEREITUNG: Erstelle zuerst eine kurze Live Session mit mindestens 5 gesprochenen Sätzen. ' +
      'Dann suche den "Protokoll herunterladen"-Button auf der Speaker-Seite.',
    testerFelder: ['Gerät (Speaker)', 'Browser + Version'],
    sektionen: [
      { titel: 'A — TXT-Export',
        beschreibung: 'Klicke auf "Protokoll herunterladen" und wähle TXT. Eine Textdatei wird heruntergeladen. ' +
          'Öffne sie und prüfe den Inhalt: Session-Code, Datum, Dauer, Quellsprache, Listener-Anzahl, ' +
          'und eine chronologische Liste aller Übersetzungen mit Zeitstempeln.',
        aufgaben: [
        '"Protokoll herunterladen" Button sichtbar',
        'TXT herunterladen → Datei kommt',
        'Enthält Session-Code',
        'Enthält Datum+Uhrzeit',
        'Enthält Dauer',
        'Enthält Quellsprache',
        'Enthält Listener-Anzahl',
        'Enthält chronologische Liste mit Zeitstempeln',
        'Enthält Quelltext + Übersetzung',
        'Reihenfolge stimmt'
      ]},
      { titel: 'B — Markdown-Export & Edge Cases',
        beschreibung: 'Teste auch den Markdown-Export (.md Datei mit Tabellen und Überschriften). ' +
          'Teste Edge Cases: Export während einer laufenden Session (sollte bisherige Einträge zeigen), ' +
          'nach Session-Ende (sollte vollständig sein), und bei leerer Session (sollte einen Hinweis zeigen).',
        aufgaben: [
        'Markdown herunterladen → .md Datei',
        'Formatierung korrekt (Tabellen, Überschriften)',
        'Während laufender Session → bisherige Einträge',
        'Nach Session-Ende → vollständig',
        'Leere Session → sinnvoller Hinweis'
      ]}
    ],
    bewertungen: [
      'Export-Funktionalität',
      'Vollständigkeit der Daten',
      'Formatierung',
      'Gesamteindruck'
    ]
  };
}

// TP-13
function tp13_() {
  return {
    id: 'TP-13', titel: 'Konversationsmodus (Face-to-Face)',
    dauer: '12 Min', vorbedingungen: 'Mikrofon verfügbar, idealerweise 2 Personen',
    geraete: '1 Smartphone (zwischen 2 Personen)',
    beschreibung: 'Der KONVERSATIONSMODUS ist für Gespräche zwischen zwei Personen, die verschiedene Sprachen sprechen. ' +
      'Das Smartphone liegt zwischen beiden auf dem Tisch. Der Bildschirm ist zweigeteilt: ' +
      'Die obere Hälfte ist 180° gedreht (damit die gegenübersitzende Person es lesen kann), die untere Hälfte ist normal.\n\n' +
      'Jede Person spricht in ihrer Sprache in das Mikrofon. Die Übersetzung erscheint auf der Seite des Gegenübers. ' +
      'Idealerweise testest du mit einer zweiten Person, aber du kannst auch beide Rollen selbst übernehmen.',
    testerFelder: ['Gerät', 'Browser + Version', 'Betriebssystem'],
    sektionen: [
      { titel: 'A — Layout & Sprache',
        beschreibung: 'Navigiere zu "Konversation". Der Bildschirm sollte zweigeteilt sein: oben 180° gedreht, unten normal, ' +
          'mit einer Trennlinie in der Mitte. Stelle Person 1 (oben) auf Deutsch und Person 2 (unten) auf Englisch. ' +
          'Beide Sprachen sollten unabhängig voneinander wählbar sein.',
        aufgaben: [
        'Navigation → Konversation',
        'Obere Hälfte 180° gedreht (für Gegenüber)',
        'Untere Hälfte normal',
        'Trennlinie mit Neustart-Button',
        'Person 1 oben: Deutsch, Person 2 unten: Englisch',
        'Beide unabhängig wählbar',
        'Tausch-Button funktioniert'
      ]},
      { titel: 'B — Bidirektionale Übersetzung',
        beschreibung: 'Person 1 (DE) sagt: "Wo ist das Restaurant?" → Person 2 sieht die englische Übersetzung. ' +
          'Person 2 (EN) sagt: "Around the corner" → Person 1 sieht die deutsche Übersetzung. ' +
          'WICHTIG: Nur eine Person kann gleichzeitig aufnehmen. Auto-Speak kann aktiviert werden, ' +
          'damit die Übersetzung automatisch vorgelesen wird.',
        aufgaben: [
        'P1 DE: "Wo ist das Restaurant?" → P2 sieht EN',
        'P2 EN: "Around the corner" → P1 sieht DE',
        'Nur eine Person gleichzeitig aufnehmen',
        'Auto-Speak für beide Seiten verfügbar',
        'Übersetzung wird vorgelesen wenn aktiviert'
      ]},
      { titel: 'C — Verlauf & Edge Cases',
        beschreibung: 'Nach 3+ Nachrichten sollte ein Verlauf sichtbar sein: eigene Nachrichten blau, empfangene grau. ' +
          'Es werden maximal 6 Nachrichten pro Seite angezeigt. Der Neustart-Button in der Mitte setzt alles zurück. ' +
          'Teste auch Querformat (Landscape).',
        aufgaben: [
        '3+ Nachrichten → Verlauf sichtbar',
        'Eigene blau, Empfangene grau',
        'Zeitstempel bei jeder Nachricht',
        'Max 6 Nachrichten pro Seite',
        'Neustart-Button → Reset',
        'Landscape → Layout passt sich an'
      ]}
    ],
    bewertungen: [
      'Split-Screen-Layout',
      'Bidirektionale Übersetzung',
      'Benutzerfreundlichkeit (2 Personen)',
      'Gesamteindruck'
    ]
  };
}

// TP-14
function tp14_() {
  return {
    id: 'TP-14', titel: 'Kamera-Übersetzer (OCR)',
    dauer: '12 Min', vorbedingungen: 'Google Cloud API Key konfiguriert, gedruckte Texte',
    geraete: 'Smartphone mit Kamera',
    beschreibung: 'Der KAMERA-ÜBERSETZER erkennt Text in Fotos (OCR = Optical Character Recognition) und übersetzt ihn automatisch. ' +
      'Ideal für Schilder, Speisekarten, Formulare, Medikamentenbeipackzettel usw.\n\n' +
      'VORBEREITUNG: Halte gedruckte Texte bereit (Zeitung, Buch, Verpackung, Speisekarte). ' +
      'Achte auf gute Beleuchtung. Die App braucht Kamera-Berechtigung.',
    testerFelder: ['Gerät', 'Browser + Version', 'Betriebssystem'],
    sektionen: [
      { titel: 'A — Foto & OCR',
        beschreibung: 'Navigiere zu "Kamera". Wähle ein Sprachpaar (z.B. DE→EN). Erlaube die Kamera-Berechtigung. ' +
          'Mache ein Foto von einem gedruckten deutschen Text. Die App zeigt eine Bildvorschau, extrahiert den Text (OCR) ' +
          'und zeigt ihn an. Prüfe, ob der erkannte Text mit dem Original übereinstimmt.',
        aufgaben: [
        'Navigation → Kamera',
        'Kamera-Interface sichtbar',
        'Sprachpaar-Auswahl vorhanden',
        'Kamera-Berechtigung angefragt',
        'Foto von deutschem Text aufnehmen',
        'Bildvorschau angezeigt',
        '"Text wird extrahiert..."',
        'Extrahierter Text stimmt mit Original überein'
      ]},
      { titel: 'B — Übersetzung & Galerie',
        beschreibung: 'Nach der Texterkennung sollte die Übersetzung automatisch starten. ' +
          'Teste auch den Kopieren-Button und den Sprechen-Button (TTS). ' +
          'Alternativ zum Fotografieren kannst du auch ein Bild aus der Galerie hochladen — die OCR sollte ebenfalls funktionieren.',
        aufgaben: [
        'Übersetzung startet automatisch nach OCR',
        'Übersetzte Version angezeigt',
        'Kopieren-Button funktioniert',
        'Sprechen-Button funktioniert',
        'Galerie-Upload → OCR+Übersetzung funktioniert'
      ]},
      { titel: 'C — Verschiedene Texte',
        beschreibung: 'Teste verschiedene Textarten: englischer gedruckter Text, Handschrift (schwieriger), ' +
          'schlecht beleuchteter Text, ein Bild ohne Text, und arabischer/hebräischer Text (RTL). ' +
          'Die App sollte bei Problemen sinnvolle Hinweise zeigen (z.B. "Kein Text gefunden").',
        aufgaben: [
        'Englischer Text → DE-Übersetzung korrekt',
        'Gedruckter Text: hohe OCR-Genauigkeit',
        'Handschrift: versucht zu erkennen',
        'Schlechte Beleuchtung: sinnvoller Hinweis',
        'Bild ohne Text: "Kein Text gefunden"',
        'Arabisch/Hebräisch: RTL-Anzeige'
      ]}
    ],
    bewertungen: [
      'OCR-Genauigkeit',
      'Übersetzungsqualität',
      'Benutzerfreundlichkeit',
      'Geschwindigkeit',
      'Gesamteindruck'
    ]
  };
}

// TP-15
function tp15_() {
  return {
    id: 'TP-15', titel: 'Phrasebook (Satzsammlung)',
    dauer: '12 Min', vorbedingungen: 'App geöffnet, Internet',
    geraete: 'Smartphone oder Desktop',
    beschreibung: 'Das PHRASEBOOK ist eine Sammlung vorgefertigter Sätze für typische Situationen: Behördengang, Arztbesuch, Begrüßung usw. ' +
      'Die Sätze können einzeln oder alle auf einmal übersetzt werden, und du kannst sie vorlesen lassen.\n\n' +
      'Besonders nützlich für Helfer, die Geflüchteten bei Behördengängen oder Arztbesuchen assistieren. ' +
      'Die Phrasen werden nach Kategorien gefiltert und in die gewählte Zielsprache übersetzt.',
    testerFelder: ['Gerät', 'Browser + Version', 'Betriebssystem'],
    sektionen: [
      { titel: 'A — Navigation & Filter',
        beschreibung: 'Navigiere zum "Phrasebook". Du siehst eine Zielsprach-Auswahl und Kategorie-Filter ' +
          '(Alle, Behörde, Arzt, etc.). Wähle verschiedene Sprachen und Kategorien — die angezeigte Liste sollte sich filtern. ' +
          'Bei Arabisch/Farsi sollte die Anzeige automatisch auf RTL (rechts-nach-links) umschalten.',
        aufgaben: [
        'Navigation → Phrasebook',
        'Titel+Beschreibung sichtbar',
        'Zielsprach-Auswahl vorhanden',
        'Kategorie-Filter (Alle, Behörde, Arzt, etc.)',
        'Arabisch → arabische Phrasen',
        'Kategorie "Arzt" → nur medizinische',
        '"Alle" → alle Phrasen',
        'Farsi → RTL-Anzeige'
      ]},
      { titel: 'B — Phrasen & Batch',
        beschreibung: 'Klicke auf eine einzelne Phrase — die Übersetzung sollte erscheinen und ein Sprechen-Button verfügbar sein. ' +
          'Teste die "Alle übersetzen"-Funktion: Ein Fortschrittsbalken zeigt den Fortschritt an, ' +
          'bis alle Phrasen der gewählten Kategorie übersetzt sind.',
        aufgaben: [
        'Phrase klicken → Übersetzung angezeigt',
        'Sprechen-Button funktioniert',
        'Kategorie-Tag sichtbar',
        '"Alle übersetzen" → Fortschrittsbalken',
        'Alle übersetzt nach Abschluss',
        'Sprache wechseln → erneuter Batch möglich'
      ]},
      { titel: 'C — Sprachen & Caching',
        beschreibung: 'Teste verschiedene Zielsprachen, besonders solche für Geflüchtete: Arabisch, Ukrainisch, Somali, Paschto. ' +
          'Wenn du die Sprache zurückwechselst, sollten die Übersetzungen sofort aus dem Cache kommen (kein erneutes Warten). ' +
          'Nach einem Seitenneulade (F5) sollten gecachte Übersetzungen noch vorhanden sein.',
        aufgaben: [
        'Arabisch: sinnvoll übersetzt',
        'Ukrainisch: sinnvoll',
        'Somali: sinnvoll',
        'Paschto: sinnvoll',
        'Sprache zurückwechseln → sofort aus Cache',
        'Seite neu laden → Cache noch da'
      ]}
    ],
    bewertungen: [
      'Phrasen-Auswahl & Relevanz',
      'Übersetzungsqualität',
      'Batch-Übersetzung',
      'Kategorie-Filter',
      'Gesamteindruck'
    ]
  };
}

// TP-16
function tp16_() {
  return {
    id: 'TP-16', titel: 'Einstellungen & API-Key',
    dauer: '12 Min', vorbedingungen: 'Google Cloud API Key bereit',
    geraete: 'Smartphone oder Desktop',
    beschreibung: 'In den EINSTELLUNGEN der App findest du: Netzwerk-Status, Speicheranzeige, API-Key-Verwaltung ' +
      'und Cache-Management. Der API-Key ermöglicht die Nutzung von Google Translate (höhere Qualität) statt des kostenlosen MyMemory-Dienstes.\n\n' +
      'Falls du KEINEN API-Key hast: Teste die Einstellungsseite trotzdem — du kannst den API-Key-Bereich überspringen ' +
      'und bei der Aufgabe "Ohne Key: Fallback MyMemory funktioniert" prüfen, ob die App auch ohne Key funktioniert.',
    testerFelder: ['Gerät', 'Browser + Version', 'Betriebssystem'],
    sektionen: [
      { titel: 'A — Netzwerk & Speicher',
        beschreibung: 'Navigiere zu "Einstellungen". Oben siehst du den Netzwerk-Status (Online/Degraded/Offline), ' +
          'darunter Offline-Support-Indikatoren (zeigen ob IndexedDB, Cache, Service Worker und WASM verfügbar sind). ' +
          'Der Speicherbalken zeigt, wie viel Platz die App belegt. Der Button "Dauerhaften Speicher anfordern" verhindert, ' +
          'dass der Browser die Offline-Daten automatisch löscht.',
        aufgaben: [
        'Navigation → Einstellungen',
        'Netzwerk-Status sichtbar (Online/Degraded/Offline)',
        'Offline-Support Indikatoren (IndexedDB, Cache, SW, WASM)',
        'Speicherbalken mit Prozent+Bytes',
        '"Dauerhaften Speicher anfordern" Button'
      ]},
      { titel: 'B — API-Key',
        beschreibung: 'Im API-Key-Bereich findest du ein Passwort-Feld. Gib deinen Google Cloud API Key ein und klicke Speichern. ' +
          'Der Status sollte auf "Aktiv" wechseln. Nach einem Seitenneulade sollte der Key gespeichert sein. ' +
          'Gehe zum Übersetzer — der Provider-Badge sollte jetzt "Google" zeigen. ' +
          'Lösche den Key wieder — der Status sollte auf "Inaktiv" wechseln und der Fallback MyMemory sollte funktionieren.',
        aufgaben: [
        'Passwort-Feld für API-Key',
        'Anzeigen/Verbergen-Toggle',
        'Speichern → Erfolgsmeldung',
        'Status "Aktiv"',
        'Seite neu laden → gespeichert',
        'Übersetzer → Provider "Google"',
        'Key löschen → Status "Inaktiv"',
        'Ohne Key: Fallback MyMemory funktioniert'
      ]},
      { titel: 'C — Cache-Verwaltung',
        beschreibung: 'Im Cache-Bereich siehst du den Übersetzungs-Cache (Anzahl gespeicherter Übersetzungen) ' +
          'und den TTS-Audio-Cache (Anzahl gespeicherter Audio-Clips). "Cache leeren" setzt die Anzahl auf 0. ' +
          'Nach der Leerung sollte die erste Übersetzung etwas länger dauern, weil sie neu abgerufen wird.',
        aufgaben: [
        'Übersetzungs-Cache: Eintragsanzahl sichtbar',
        '"Cache leeren" → Anzahl 0',
        'TTS-Audio-Cache: Clip-Anzahl sichtbar',
        '"Audio-Cache leeren" → Anzahl 0',
        'Nach Leerung: erste Übersetzung dauert länger'
      ]}
    ],
    bewertungen: [
      'Übersichtlichkeit der Einstellungen',
      'API-Key Verwaltung',
      'Cache-Management',
      'Speicheranzeige',
      'Gesamteindruck'
    ]
  };
}

// TP-17
function tp17_() {
  return {
    id: 'TP-17', titel: 'Offline-Sprachpakete & Whisper STT',
    dauer: '15 Min', vorbedingungen: 'Stabile Internetverbindung, min. 200 MB frei',
    geraete: 'Smartphone oder Desktop',
    beschreibung: 'Die App kann OFFLINE übersetzen, indem Sprachpakete (KI-Modelle, je ~35 MB) heruntergeladen werden. ' +
      'Außerdem gibt es ein Whisper-Modell für Offline-Spracherkennung (STT).\n\n' +
      'In diesem Test lädst du Sprachpakete herunter, aktivierst den Flugmodus ' +
      'und prüfst, ob die Übersetzung komplett offline funktioniert. Stelle sicher, dass du mindestens 200 MB freien Speicher hast.',
    testerFelder: ['Gerät', 'Browser + Version', 'Betriebssystem'],
    sektionen: [
      { titel: 'A — Sprachpakete',
        beschreibung: 'In den Einstellungen findest du "Offline-Sprachpakete". Eine Liste verfügbarer Sprachpaare wird angezeigt, ' +
          'nach Quellsprache gruppiert. Lade z.B. DE→EN herunter. Ein Fortschrittsbalken zeigt den Download-Fortschritt. ' +
          'Nach dem Download erscheint der Status "Heruntergeladen" und ein Löschen-Button.',
        aufgaben: [
        'Offline-Sprachpakete Sektion in Einstellungen',
        'Liste verfügbarer Sprachpaare',
        'Nach Quellsprache gruppiert',
        '~35MB pro Paket angezeigt',
        'DE→EN herunterladen, Fortschrittsbalken',
        'Geschwindigkeit akzeptabel',
        'Status "Heruntergeladen"',
        'Löschen-Button erscheint'
      ]},
      { titel: 'B — Whisper & Offline-Test',
        beschreibung: 'Lade auch das Whisper-Modell herunter (für Offline-Spracherkennung). Dann aktiviere den FLUGMODUS. ' +
          'Übersetze DE→EN: "Guten Tag" — es sollte offline übersetzt werden (Provider-Badge zeigt "Offline"). ' +
          'Ein Sprachpaar ohne heruntergeladenes Modell sollte eine Fehlermeldung zeigen. ' +
          'Pivot-Übersetzung: DE→FR geht über EN (DE→EN→FR), wenn nur DE→EN heruntergeladen ist.',
        aufgaben: [
        'Whisper-Modell Sektion finden',
        'Download starten, Fortschritt sichtbar',
        'Status "Bereit"',
        'Flugmodus an',
        'DE→EN: "Guten Tag" → Offline-Übersetzung',
        'Provider "Offline"',
        'Sprachpaar ohne Modell → Fehlermeldung',
        'Pivot DE→FR (via EN): sinnvolles Ergebnis'
      ]},
      { titel: 'C — Löschen',
        beschreibung: 'Lösche ein heruntergeladenes Sprachpaket. Der Status sollte zurückgesetzt werden ' +
          'und der Speicher freigegeben werden.',
        aufgaben: [
        'Paket löschen → Status zurück',
        'Speicher wird freigegeben'
      ]}
    ],
    bewertungen: [
      'Download-Erlebnis',
      'Offline-Übersetzungsqualität',
      'Pivot-Übersetzung',
      'Speicher-Management',
      'Gesamteindruck'
    ]
  };
}

// TP-18
function tp18_() {
  return {
    id: 'TP-18', titel: 'PWA-Installation & Offline-Modus',
    dauer: '15 Min', vorbedingungen: 'App NICHT bereits als PWA installiert',
    geraete: 'Smartphone (Android oder iOS)',
    beschreibung: 'GuideTranslator ist eine PWA (Progressive Web App) — sie kann wie eine "echte" App auf dem Homescreen installiert werden, ' +
      'funktioniert dann ohne Browser-Leiste und auch offline.\n\n' +
      'VORBEREITUNG: Falls die App bereits auf dem Homescreen installiert ist, deinstalliere sie zuerst. ' +
      'Öffne die App im Browser — nach einigen Sekunden sollte ein Installationsbanner erscheinen.',
    testerFelder: ['Gerät', 'Browser + Version', 'Betriebssystem'],
    sektionen: [
      { titel: 'A — Installationsbanner',
        beschreibung: 'Öffne die App im Browser. Nach kurzer Zeit sollte ein Banner erscheinen: "App installieren" ' +
          'mit einer Auflistung der Vorteile (Offline, Geschwindigkeit). Das Banner sollte schließbar sein ' +
          'und nach dem Schließen nicht erneut in derselben Session erscheinen.',
        aufgaben: [
        'Banner erscheint ("App installieren")',
        'Vorteile angezeigt (Offline, Speed)',
        'Schließbar, erscheint nicht erneut in Session'
      ]},
      { titel: 'B — Installation & Standalone',
        beschreibung: 'Klicke auf "Installieren". Ein nativer Dialog erscheint (Android: Installieren/Abbrechen, iOS: Zum Home-Bildschirm). ' +
          'Bestätige die Installation. Die App sollte als Icon auf dem Homescreen erscheinen. ' +
          'Öffne sie — sie sollte im Standalone-Modus laufen (keine Browser-Leiste) mit einer blauen Status-Bar.',
        aufgaben: [
        '"Installieren" → nativer Dialog',
        'Bestätigen → auf Homescreen',
        'Icon korrekt',
        'Standalone-Modus (keine Browser-Leiste)',
        'Status-Bar korrekte Farbe (#0369a1)',
        'Navigation funktioniert',
        'Alle Seiten laden'
      ]},
      { titel: 'C — Shortcuts & Offline',
        beschreibung: 'Auf Android: Lang auf das App-Icon drücken → Shortcuts sollten erscheinen (Live, Konversation, Kamera, Phrasebook). ' +
          'Aktiviere den Flugmodus. Öffne die PWA — sie sollte aus dem Service Worker Cache laden und alle Seiten navigierbar sein. ' +
          'Der Übersetzer zeigt "Offline" und nutzt entweder Offline-Modelle oder eine sinnvolle Fehlermeldung. ' +
          'Schalte das Netzwerk wieder ein — die App sollte sich automatisch aktualisieren.',
        aufgaben: [
        'Android: Lang drücken → Shortcuts (Live, Konversation, Kamera, Phrasebook)',
        'Flugmodus → PWA lädt aus Service Worker Cache',
        'Alle Seiten navigierbar',
        'Übersetzer ohne Modell → sinnvolle Fehlermeldung',
        'Status "Offline"',
        'Netzwerk wieder → App aktualisiert',
        'Kein Fehler bei Online↔Offline Wechsel'
      ]}
    ],
    bewertungen: [
      'Installationserlebnis',
      'Standalone-Darstellung',
      'Offline-Verfügbarkeit',
      'Service Worker Zuverlässigkeit',
      'Gesamteindruck'
    ]
  };
}

// TP-19
function tp19_() {
  return {
    id: 'TP-19', titel: 'Dark Mode & Theming',
    dauer: '10 Min', vorbedingungen: 'App geöffnet',
    geraete: 'Smartphone oder Desktop',
    beschreibung: 'Die App hat einen DARK MODE (dunkles Design), der über ein Sonne/Mond-Icon im Header umgeschaltet wird. ' +
      'Prüfe, ob alle Seiten korrekt dargestellt werden, Texte lesbar sind und der Modus nach einem Neulade erhalten bleibt.',
    testerFelder: ['Gerät', 'Browser + Version', 'Betriebssystem'],
    sektionen: [
      { titel: 'A — Toggle & Sofortwechsel',
        beschreibung: 'Klicke auf das Sonne/Mond-Icon im Header. Der Wechsel zwischen Light und Dark sollte SOFORT passieren, ' +
          'ohne Flackern oder Nachladen der Seite.',
        aufgaben: [
        'Theme-Toggle im Header (Sonne/Mond)',
        'Light→Dark sofort, kein Flackern',
        'Dark→Light sofort, kein Flackern'
      ]},
      { titel: 'B — Dark Mode alle Seiten',
        beschreibung: 'Navigiere im Dark Mode durch ALLE Seiten der App: Übersetzer, Live, Phrasebook, Einstellungen, ' +
          'Info, Konversation, Impressum, Datenschutz. Achte darauf, dass überall der Hintergrund dunkel ist, ' +
          'Texte lesbar sind und keine weißen "Blitzer" auftreten.',
        aufgaben: [
        'Übersetzer: dunkel, Text lesbar, kontrastreich',
        'Live-Landing: Buttons, Cards sichtbar',
        'Phrasebook: Cards, Chips lesbar',
        'Einstellungen: Felder, Toggles sichtbar',
        'Info-Seite: Feature-Cards kontrastreich',
        'Konversation: Split-Screen lesbar',
        'Impressum/Datenschutz: Texte lesbar'
      ]},
      { titel: 'C — Persistenz & System',
        beschreibung: 'Lade die Seite neu (F5) — der Dark Mode sollte erhalten bleiben. Schließe den Browser und öffne ihn erneut — ' +
          'immer noch Dark Mode. Teste auch den "System"-Modus: Wenn dein Betriebssystem auf Dark Mode steht, ' +
          'sollte die App automatisch Dark Mode verwenden.',
        aufgaben: [
        'Seite neu laden → Dark Mode bleibt',
        'Browser neu öffnen → bleibt',
        'System Dark → App Dark (wenn "System" gewählt)',
        'System Light → App Light',
        'Manueller Override wird respektiert'
      ]}
    ],
    bewertungen: [
      'Dark Mode Konsistenz',
      'Light Mode Konsistenz',
      'Kontrast & Lesbarkeit',
      'Persistenz',
      'Gesamteindruck'
    ]
  };
}

// TP-20
function tp20_() {
  return {
    id: 'TP-20', titel: 'UI-Sprachen (9 Sprachen)',
    dauer: '12 Min', vorbedingungen: 'App geöffnet',
    geraete: 'Smartphone oder Desktop',
    beschreibung: 'Die App-Oberfläche (Buttons, Menüs, Texte) ist in 9 SPRACHEN verfügbar: ' +
      'Deutsch, Englisch, Arabisch, Türkisch, Farsi, Ukrainisch, Russisch, Französisch und Spanisch. ' +
      'Bei Arabisch und Farsi wechselt das gesamte Layout auf RTL (rechts-nach-links).\n\n' +
      'Die UI-Sprache wird über ein Globe-Icon/Dropdown im Header gewechselt. ' +
      'Die App erkennt auch automatisch die Browser-Sprache.',
    testerFelder: ['Gerät', 'Browser + Version', 'Muttersprache(n)'],
    sektionen: [
      { titel: 'A — Sprachwechsel',
        beschreibung: 'Suche das Globe-Icon oder den Sprach-Dropdown im Header. Es sollten 9 Sprachen mit Flaggen-Emojis angezeigt werden. ' +
          'Der Wechsel sollte sofort passieren (kein Seitenneulade). Nach F5 sollte die gewählte Sprache erhalten bleiben.',
        aufgaben: [
        'Globe-Icon/Dropdown im Header',
        '9 Sprachen mit Flaggen',
        'Wechsel sofort (kein Nachladen)',
        'Seite neu laden → gespeichert'
      ]},
      { titel: 'B — Alle 9 Sprachen prüfen',
        beschreibung: 'Wechsle nacheinander durch alle 9 Sprachen. Prüfe bei jeder, ob die Navigation, Labels und Buttons ' +
          'korrekt übersetzt sind. Bei Arabisch und Farsi sollte das gesamte Layout auf RTL (rechts-nach-links) umschalten. ' +
          'Achte auf Sonderzeichen: türkisch (ç,ş,ğ,ı), kyrillisch, arabische Schrift.',
        aufgaben: [
        'Deutsch: Nav korrekt, alle Labels DE',
        'English: alle Texte EN',
        'العربية (Arabisch): RTL-Layout',
        'Türkçe: Sonderzeichen ç,ş,ğ,ı korrekt',
        'فارسی (Farsi): RTL korrekt',
        'Українська (Ukrainisch): kyrillisch',
        'Русский (Russisch): kyrillisch',
        'Français: Akzente korrekt',
        'Español: ñ/ü korrekt'
      ]},
      { titel: 'C — Vollständigkeit & Auto-Detection',
        beschreibung: 'Achte darauf, dass KEINE fehlenden Übersetzungen auftreten (kein englischer Fallback-Text, keine ??? oder leere Labels). ' +
          'Teste Auto-Detection: Stelle deinen Browser auf Türkisch → die App sollte automatisch auf Türkisch starten. ' +
          'Stelle den Browser auf Finnisch (nicht verfügbar) → die App sollte auf Deutsch fallen.',
        aufgaben: [
        'Keine fehlenden Übersetzungen (kein Fallback-Text)',
        'Keine leeren Labels oder ???',
        'Browser Türkisch → App Türkisch',
        'Browser Finnisch → Fallback Deutsch'
      ]}
    ],
    bewertungen: [
      'Vollständigkeit der Übersetzungen',
      'RTL-Unterstützung (AR, FA)',
      'Sprachwechsel-Erlebnis',
      'Auto-Detection',
      'Gesamteindruck'
    ]
  };
}

// TP-21
function tp21_() {
  return {
    id: 'TP-21', titel: 'RTL-Sprachen (Arabisch, Farsi)',
    dauer: '12 Min', vorbedingungen: 'Idealerweise Arabisch/Farsi-Kenntnisse',
    geraete: 'Smartphone oder Desktop',
    beschreibung: 'RTL (Right-to-Left) ist die Textrichtung für Arabisch und Farsi. Wenn die UI-Sprache auf Arabisch oder Farsi steht, ' +
      'muss das gesamte Layout gespiegelt werden: Navigation rechts, Buttons rechts ausgerichtet, Text von rechts nach links.\n\n' +
      'Dieser Test prüft die RTL-Darstellung intensiv. Idealerweise hast du Arabisch- oder Farsi-Kenntnisse, ' +
      'um die Textqualität beurteilen zu können. Aber auch ohne Kenntnisse kannst du das Layout prüfen.',
    testerFelder: ['Gerät', 'Browser + Version', 'Arabisch/Farsi-Kenntnisse'],
    sektionen: [
      { titel: 'A — RTL-Layout Arabisch',
        beschreibung: 'Stelle die UI-Sprache auf Arabisch (العربية). Das gesamte Layout sollte sich spiegeln: ' +
          'Navigation von rechts nach links, Header gespiegelt, Buttons rechts ausgerichtet, ' +
          'Eingabefelder beginnen rechts, Cards und Abstände sind gespiegelt.',
        aufgaben: [
        'UI Arabisch: Navigation rechts-nach-links',
        'Header gespiegelt',
        'Buttons korrekt ausgerichtet',
        'Eingabefelder ab rechts',
        'Cards/Layout Padding gespiegelt'
      ]},
      { titel: 'B — RTL-Übersetzung',
        beschreibung: 'Übersetze DE→Arabisch: Die Übersetzung sollte RTL angezeigt werden. ' +
          'Übersetze Arabisch→DE: Der Quelltext sollte RTL sein, der Zieltext LTR (links-nach-rechts). ' +
          'Teste gemischten Text (Arabisch + Zahlen + lateinische Buchstaben) — die Richtung sollte korrekt sein (Bidirectional).',
        aufgaben: [
        'DE→AR: Übersetzung RTL',
        'AR→DE: Quelltext RTL, Zieltext LTR',
        'Gemischt (AR+Zahlen+Latein): Bidi korrekt',
        'Kopieren: arabischer Text korrekt'
      ]},
      { titel: 'C — Farsi & spezielle Bereiche',
        beschreibung: 'Wechsle die UI auf Farsi (فارسی) — ebenfalls RTL. Achte auf Farsi-spezifische Zeichen: ' +
          'ی statt ي und ک statt ك. Prüfe RTL auch in speziellen Bereichen: Phrasebook, Live Listener, Konversation. ' +
          'Wechsle dann zurück zu Deutsch — das Layout sollte sofort auf LTR umschalten, ohne Flackern.',
        aufgaben: [
        'UI Farsi → RTL-Layout',
        'ی statt ي, ک statt ك korrekt',
        'Phrasebook: arabische Phrasen RTL',
        'Live Listener: Übersetzung RTL',
        'Konversation: Nachrichten RTL',
        'AR→DE wechseln → sofort LTR, kein Flackern'
      ]}
    ],
    bewertungen: [
      'RTL-Layout Korrektheit',
      'Bidirektionaler Text',
      'Arabisch/Farsi Textqualität',
      'LTR↔RTL Wechsel',
      'Gesamteindruck'
    ]
  };
}

// TP-22
function tp22_() {
  return {
    id: 'TP-22', titel: 'Responsive Design — Mobile',
    dauer: '12 Min', vorbedingungen: 'App auf Smartphone',
    geraete: 'Smartphone (min. 375px Breite)',
    beschreibung: 'Dieser Test prüft, ob die App auf SMARTPHONES gut aussieht und bedienbar ist. ' +
      'Achte auf: Touch-Targets (sind Buttons groß genug?), Lesbarkeit, kein Abschneiden von Inhalten, ' +
      'flüssiges Scrollen und korrektes Verhalten bei Portrait/Landscape.',
    testerFelder: ['Gerät + Bildschirmgröße', 'Browser + Version', 'Betriebssystem'],
    sektionen: [
      { titel: 'A — Navigation & Übersetzer',
        beschreibung: 'Prüfe die Hauptseite (Übersetzer) auf deinem Smartphone: Ist der Header vollständig sichtbar? ' +
          'Sind die Nav-Elemente mit dem Finger bedienbar (groß genug)? Ist das Eingabefeld die volle Breite? ' +
          'Öffne die Tastatur — wird das Eingabefeld nicht verdeckt?',
        aufgaben: [
        'Header vollständig sichtbar',
        'Nav bedienbar, Touch-Targets groß genug',
        'Footer sichtbar, Links klickbar',
        'Eingabefeld volle Breite',
        'Dropdowns bedienbar',
        'Mikrofon-Button groß genug',
        'Tastatur öffnen: kein Verdecken',
        'Scrollen flüssig'
      ]},
      { titel: 'B — Weitere Seiten',
        beschreibung: 'Navigiere durch alle Seiten und prüfe die mobile Darstellung: ' +
          'Live (QR-Code groß genug?), Konversation (Split-Screen nutzbar?), Phrasebook (Cards lesbar?), ' +
          'Einstellungen (alles scrollbar, nichts abgeschnitten?), Info-Seite, Kamera.',
        aufgaben: [
        'Live: QR groß genug zum Scannen',
        'Konversation: Split nutzbar, 180° lesbar',
        'Phrasebook: Cards lesbar, Buttons erreichbar',
        'Einstellungen: scrollbar, nichts abgeschnitten',
        'Info: Grid 1 Spalte auf Mobile',
        'Kamera: Vollbild-Ansicht ok'
      ]},
      { titel: 'C — Orientierung',
        beschreibung: 'Teste Portrait (Hochformat) und Landscape (Querformat). Drehe das Gerät — ' +
          'das Layout sollte sich anpassen ohne kaputtzugehen.',
        aufgaben: [
        'Portrait: optimiert',
        'Landscape: nutzbar',
        'Portrait↔Landscape: kein Layout-Bruch'
      ]}
    ],
    bewertungen: [
      'Touch-Bedienbarkeit',
      'Lesbarkeit auf kleinem Bildschirm',
      'Layout-Konsistenz',
      'Scrolling-Erlebnis',
      'Gesamteindruck'
    ]
  };
}

// TP-23
function tp23_() {
  return {
    id: 'TP-23', titel: 'Responsive Design — Tablet & Desktop',
    dauer: '10 Min', vorbedingungen: 'Tablet und/oder Desktop',
    geraete: 'Tablet und/oder Desktop-PC',
    beschreibung: 'Dieser Test prüft die App auf TABLET und DESKTOP. Auf großen Bildschirmen sollte die App die Breite sinnvoll nutzen ' +
      '(mehrspaltige Layouts, nebeneinander angeordnete Cards). Teste auch das Skalieren des Browserfensters ' +
      'von voller Breite bis auf Handy-Breite (375px).',
    testerFelder: ['Gerät + Bildschirmgröße', 'Browser + Version', 'Betriebssystem'],
    sektionen: [
      { titel: 'A — Desktop 1200px+',
        beschreibung: 'Öffne die App im Vollbild-Browser (1200px+ Breite). Der Übersetzer sollte die Breite sinnvoll nutzen, ' +
          'die Navigation horizontal sein, Live-Cards nebeneinander liegen und die Info-Seite ein mehrspaltiges Grid zeigen.',
        aufgaben: [
        'Übersetzer nutzt Breite sinnvoll',
        'Navigation horizontal',
        'Live: Cards nebeneinander',
        'Info: Grid mehrspaltig',
        'Max-width begrenzt Container'
      ]},
      { titel: 'B — Tablet & Skalieren',
        beschreibung: 'Verkleinere das Browserfenster stufenweise: 1920px → 1024px → 768px → 375px. ' +
          'Beobachte, wie das Layout sich anpasst. Bei ~768px sollte ein Hybrid-Layout erscheinen, bei ~375px das Mobile-Layout. ' +
          'Es sollte nie horizontales Scrollen nötig sein und nichts abgeschnitten oder überlappend sein.',
        aufgaben: [
        'Tablet 768-1024px: Hybrid-Layout',
        'Touch+Größe bedienbar',
        'Konversation Split-Screen gut',
        '1920→768px: flüssige Anpassung',
        '768→375px: Mobile-Layout',
        'Kein horizontales Scrollen',
        'Nichts abgeschnitten/überlappend'
      ]},
      { titel: 'C — Desktop-Features',
        beschreibung: 'Teste Desktop-spezifische Features: Hover-Effekte auf Buttons (Maus darüber → Farbänderung), ' +
          'Tastenkombinationen (Ctrl+Enter zum Übersetzen, Esc zum Löschen), und ob sich der Cursor korrekt ändert ' +
          '(Zeigefinger auf Links, Text-Cursor im Eingabefeld).',
        aufgaben: [
        'Hover-Effekte auf Buttons',
        'Ctrl+Enter und Esc funktionieren',
        'Cursor ändert sich korrekt'
      ]}
    ],
    bewertungen: [
      'Desktop-Layout',
      'Tablet-Layout',
      'Fließende Übergänge',
      'Gesamteindruck'
    ]
  };
}

// TP-24
function tp24_() {
  return {
    id: 'TP-24', titel: 'Browser: Chrome (Desktop + Android)',
    dauer: '12 Min', vorbedingungen: 'Chrome Desktop + Chrome Android',
    geraete: 'Desktop mit Chrome + Android mit Chrome',
    beschreibung: 'Dieser Test prüft die App speziell in GOOGLE CHROME (dem Hauptbrowser). ' +
      'Chrome bietet die beste Unterstützung für alle Features (STT, TTS, PWA, Service Worker). ' +
      'Teste sowohl Chrome Desktop als auch Chrome auf Android.\n\n' +
      'TIPP: Öffne die Entwickler-Konsole (F12 → Console) und prüfe, ob Fehlermeldungen erscheinen.',
    testerFelder: ['Chrome-Version (Desktop)', 'Chrome-Version (Android)', 'Desktop-OS', 'Android-Version'],
    sektionen: [
      { titel: 'A — Chrome Desktop',
        beschreibung: 'Öffne die App in Chrome Desktop. Teste die Kernfunktionen: Übersetzen, Spracherkennung (STT), ' +
          'Sprachausgabe (TTS), Dark Mode, eine kurze Live Session. Öffne F12 → Console und prüfe auf Fehlermeldungen.',
        aufgaben: [
        'App lädt vollständig',
        'Übersetzen, STT, TTS funktioniert',
        'Dark Mode funktioniert',
        'Live Session funktioniert',
        'Alle Seiten laden ohne Fehler',
        'PWA-Installation angeboten',
        'Service Worker registriert',
        'Keine Konsolenfehler (F12)'
      ]},
      { titel: 'B — Chrome Android',
        beschreibung: 'Öffne die App in Chrome auf Android. Teste Touch-Bedienbarkeit, Spracherkennung, Sprachausgabe, Kamera. ' +
          'Prüfe ob das PWA-Banner erscheint und ob die Tastatur das Layout nicht kaputt macht.',
        aufgaben: [
        'App lädt, Touch ok',
        'STT, TTS, Kamera funktioniert',
        'PWA-Banner angezeigt',
        'Tastatur: Layout passt',
        'Texte scrollen flüssig',
        'IndexedDB + Cache API funktioniert'
      ]}
    ],
    bewertungen: [
      'Chrome Desktop Funktionalität',
      'Chrome Android Funktionalität',
      'Performance',
      'Gesamteindruck'
    ]
  };
}

// TP-25
function tp25_() {
  return {
    id: 'TP-25', titel: 'Browser: Safari (macOS + iOS)',
    dauer: '12 Min', vorbedingungen: 'Safari auf macOS und/oder iPhone',
    geraete: 'Mac mit Safari und/oder iPhone',
    beschreibung: 'Safari hat einige Einschränkungen gegenüber Chrome: Kein natives Web Speech API auf iOS, ' +
      'strengere Audio-Autoplay-Regeln und eigene IndexedDB-Limitierungen. Dieser Test prüft, ' +
      'ob die App diese Unterschiede korrekt behandelt und trotzdem gut funktioniert.\n\n' +
      'Falls du nur ein iPhone hast (kein Mac): Teste nur den Safari-iOS-Teil.',
    testerFelder: ['Safari-Version (Desktop)', 'Safari-Version (iOS)', 'macOS-Version', 'iOS-Version'],
    sektionen: [
      { titel: 'A — Safari Desktop',
        beschreibung: 'Öffne die App in Safari auf macOS. Teste die Kernfunktionen. ' +
          'Besonders beachten: Die Spracherkennung (STT) nutzt ggf. einen anderen Mechanismus als Chrome.',
        aufgaben: [
        'App lädt vollständig',
        'Übersetzen funktioniert',
        'STT: Web Speech oder sinnvoller Fallback',
        'TTS funktioniert',
        'Dark Mode funktioniert',
        'Alle Seiten laden'
      ]},
      { titel: 'B — Safari iOS',
        beschreibung: 'Öffne die App in Safari auf dem iPhone. Teste Touch, Kamera und Audio. ' +
          'WICHTIG: Safari iOS erlaubt kein Audio-Autoplay — die App muss Audio nach einer User-Interaktion starten. ' +
          'Teste "Zum Home-Bildschirm" (Share-Button → Zum Home-Bildschirm) für die PWA-Installation.',
        aufgaben: [
        'App lädt, Touch ok',
        'Google Cloud STT als Fallback',
        'Audio nach User-Interaktion',
        'Kamera funktioniert',
        '"Zum Home-Bildschirm" funktioniert',
        'Standalone-Modus funktioniert'
      ]},
      { titel: 'C — Safari-spezifisch',
        beschreibung: 'Prüfe Safari-spezifische Dinge: Audio Autoplay (sollte nicht einfach losspielen), ' +
          'Safe Area (Notch/Dynamic Island werden nicht vom App-Inhalt verdeckt), ' +
          'Scroll-Bounce (typisches iOS-Gummiband-Verhalten stört nicht), WebAssembly (für Offline-Modelle).',
        aufgaben: [
        'Audio Autoplay sauber gehandhabt',
        'IndexedDB Daten gespeichert',
        'Persistent Storage Hinweis',
        'Safe Area (Notch/Dynamic Island) ok',
        'Scroll-Bounce stört nicht',
        'Tastatur scrollt korrekt',
        'WebAssembly unterstützt'
      ]}
    ],
    bewertungen: [
      'Safari Desktop Funktionalität',
      'Safari iOS Funktionalität',
      'STT-Fallback-Handling',
      'Audio/TTS auf iOS',
      'Gesamteindruck'
    ]
  };
}

// TP-26
function tp26_() {
  return {
    id: 'TP-26', titel: 'Browser: Firefox & Edge',
    dauer: '12 Min', vorbedingungen: 'Firefox und Edge installiert',
    geraete: 'Desktop mit Firefox und Edge',
    beschreibung: 'Dieser Test prüft die Kompatibilität mit FIREFOX und MICROSOFT EDGE. ' +
      'Firefox hat eingeschränkte Web Speech API Unterstützung (STT funktioniert ggf. nicht nativ). ' +
      'Edge ist Chromium-basiert und sollte ähnlich wie Chrome funktionieren.\n\n' +
      'Öffne die App in beiden Browsern und vergleiche Funktionalität und Darstellung.',
    testerFelder: ['Firefox-Version', 'Edge-Version', 'Betriebssystem'],
    sektionen: [
      { titel: 'A — Firefox',
        beschreibung: 'Öffne die App in Firefox. Teste Übersetzen, TTS, Dark Mode und alle Seiten. ' +
          'HINWEIS: Die Spracherkennung (STT) ist in Firefox eingeschränkt — die App sollte einen sinnvollen Fallback ' +
          'oder Hinweis anzeigen. Öffne F12 → Console und prüfe auf Fehler.',
        aufgaben: [
        'App lädt vollständig',
        'Übersetzen funktioniert',
        'STT (eingeschränkt) → Fallback/Hinweis',
        'TTS funktioniert',
        'Dark Mode funktioniert',
        'Alle Seiten laden',
        'Service Worker registriert',
        'Keine Konsolenfehler'
      ]},
      { titel: 'B — Edge',
        beschreibung: 'Öffne die App in Microsoft Edge. Als Chromium-Browser sollten alle Funktionen wie in Chrome arbeiten. ' +
          'Teste die Kernfunktionen und prüfe ob PWA-Installation angeboten wird.',
        aufgaben: [
        'App lädt vollständig',
        'Übersetzen, STT, TTS funktioniert',
        'Dark Mode funktioniert',
        'Alle Seiten laden',
        'PWA-Installation angeboten',
        'Keine Konsolenfehler'
      ]},
      { titel: 'C — Cross-Browser Vergleich',
        beschreibung: 'Vergleiche das Ergebnis in beiden Browsern: Die gleiche Übersetzung sollte das gleiche Ergebnis liefern. ' +
          'Das Aussehen sollte konsistent sein, die Performance vergleichbar.',
        aufgaben: [
        'Gleiche Übersetzung → gleiches Ergebnis',
        'Visuell konsistent',
        'Performance vergleichbar'
      ]}
    ],
    bewertungen: [
      'Firefox Funktionalität',
      'Edge Funktionalität',
      'Cross-Browser Konsistenz',
      'Gesamteindruck'
    ]
  };
}

// TP-27
function tp27_() {
  return {
    id: 'TP-27', titel: 'Netzwerk-Szenarien & Fehlerbehandlung',
    dauer: '15 Min', vorbedingungen: 'WLAN/Mobilfunk steuerbar',
    geraete: 'Smartphone',
    beschreibung: 'Dieser Test prüft, wie die App mit NETZWERKPROBLEMEN umgeht: Offline, schlechte Verbindung, ' +
      'Verbindungsabbruch während einer Live Session. Die App sollte immer verständliche Fehlermeldungen zeigen ' +
      'und sich automatisch erholen, wenn die Verbindung wiederhergestellt ist.\n\n' +
      'Du musst WLAN und/oder Mobilfunk an- und ausschalten können. Am einfachsten: Flugmodus nutzen.',
    testerFelder: ['Gerät', 'Browser + Version', 'Betriebssystem'],
    sektionen: [
      { titel: 'A — Netzwerkstatus',
        beschreibung: 'Prüfe die Netzwerk-Statusanzeige der App. Mit Internet sollte "Online" (grün) stehen. ' +
          'Aktiviere den Flugmodus — innerhalb von 5 Sekunden sollte "Offline" (rot) erscheinen. ' +
          'Deaktiviere den Flugmodus — wieder "Online".',
        aufgaben: [
        'Online: "Online" grün',
        'Flugmodus: "Offline" rot',
        'Wieder an: "Online" zurück',
        'Wechsel < 5 Sekunden'
      ]},
      { titel: 'B — Übersetzung bei Netzwerkwechsel',
        beschreibung: 'Übersetze online (normal). Dann aktiviere den Flugmodus und versuche zu übersetzen — ' +
          'es sollte eine verständliche Fehlermeldung kommen (kein technischer Jargon) oder ein Offline-Modell genutzt werden. ' +
          'Deaktiviere den Flugmodus — die nächste Übersetzung sollte sofort wieder online funktionieren, ohne "hängen zu bleiben".',
        aufgaben: [
        'Online: normal (Google/MyMemory)',
        'Flugmodus: Fehlermeldung oder Offline-Modell',
        'Meldung verständlich (kein Jargon)',
        'Wieder online: funktioniert sofort',
        'Kein Dauerfehlerzustand'
      ]},
      { titel: 'C — Provider & Circuit Breaker',
        beschreibung: 'Achte auf das Provider-Badge unter der Übersetzung. Ohne API-Key sollte "MyMemory" als Fallback verwendet werden. ' +
          'Wenn du einen Text übersetzt, der bereits im Cache ist, sollte offline "Cache" als Provider angezeigt werden.',
        aufgaben: [
        'Ohne API-Key: MyMemory Fallback',
        'Badge zeigt aktuellen Provider',
        'Cache-Hit offline: Badge "Cache"'
      ]},
      { titel: 'D — Live Session & Degraded',
        beschreibung: 'Starte eine Live Session. Trenne kurz das WLAN (5 Sekunden) und verbinde wieder — die Session sollte sich automatisch ' +
          'wiederherstellen (Auto-Reconnect) mit einem Hinweis "Verbindung wird wiederhergestellt". ' +
          'Trenne länger (30+ Sekunden) — es sollte ein sinnvoller Endzustand kommen (Timeout/Fehlermeldung). ' +
          'Teste auch schlechte Verbindung: Die Übersetzung dauert länger, kommt aber an.',
        aufgaben: [
        'WLAN kurz trennen (5s) → Reconnect',
        'Hinweis "wird wiederhergestellt"',
        'Danach normal weiter',
        '30s+ trennen → Timeout/Fehlermeldung',
        'Langsame Verbindung: kommt an, Ladeindikator',
        'Kein Absturz bei schlechtem Netz'
      ]}
    ],
    bewertungen: [
      'Netzwerkstatus-Erkennung',
      'Fehlermeldungen (Verständlichkeit)',
      'Auto-Reconnect',
      'Offline-Fallback',
      'Gesamteindruck'
    ]
  };
}

// TP-28
function tp28_() {
  return {
    id: 'TP-28', titel: 'Barrierefreiheit (Accessibility)',
    dauer: '12 Min', vorbedingungen: 'Desktop, optional Screenreader',
    geraete: 'Desktop-PC/Laptop',
    beschreibung: 'Dieser Test prüft die BARRIEREFREIHEIT (Accessibility) der App: Kann man die App nur mit der Tastatur bedienen? ' +
      'Haben Buttons sinnvolle Beschriftungen für Screenreader? Sind Kontraste ausreichend?\n\n' +
      'Du brauchst einen Desktop-PC/Laptop. Ein Screenreader (z.B. NVDA für Windows, VoiceOver für Mac) ist optional aber hilfreich. ' +
      'Die meisten Tests kannst du auch ohne Screenreader durchführen.',
    testerFelder: ['Gerät', 'Screenreader (falls verwendet)', 'Browser + Version'],
    sektionen: [
      { titel: 'A — Tastaturnavigation',
        beschreibung: 'Verwende NUR die Tastatur (keine Maus!). Drücke Tab, um durch alle interaktiven Elemente zu springen. ' +
          'Ein blauer Focus-Ring sollte das aktuell fokussierte Element markieren. Enter sollte Buttons aktivieren, ' +
          'Esc sollte Dropdowns/Modals schließen, Pfeiltasten sollten in Dropdowns funktionieren. ' +
          'WICHTIG: Du solltest nirgends "steckenbleiben" (Tastaturfalle).',
        aufgaben: [
        'Tab: sinnvolle Reihenfolge',
        'Focus-Ring sichtbar',
        'Enter: Button aktiviert',
        'Esc: Dropdown/Modal schließt',
        'Pfeiltasten in Dropdown',
        'Keine Tastaturfalle'
      ]},
      { titel: 'B — ARIA & Screenreader',
        beschreibung: 'Prüfe, ob Buttons sinnvolle aria-labels haben (nicht nur generische Icons). ' +
          'Rechtsklick → Element untersuchen (F12) → auf die ARIA-Attribute achten. ' +
          'Optional: Aktiviere einen Screenreader (VoiceOver: Cmd+F5 auf Mac, NVDA: kostenlos für Windows) ' +
          'und teste, ob die App navigierbar ist und Buttons mit ihrem Zweck vorgelesen werden.',
        aufgaben: [
        'Mikrofon-Button hat aria-label',
        'Kopieren-Button hat aria-label',
        'Lautsprecher-Button hat aria-label',
        'Eingabefelder haben Label/Placeholder',
        'Screenreader: App navigierbar (optional)',
        'Buttons mit Zweck vorgelesen (optional)'
      ]},
      { titel: 'C — Kontrast & Zoom',
        beschreibung: 'Prüfe den Farbkontrast: Ist Text auf dem Hintergrund gut lesbar? Auch im Dark Mode? ' +
          'Fehlermeldungen sollten nicht NUR durch Farbe gekennzeichnet sein (auch durch Text/Icon). ' +
          'Teste Browser-Zoom: Strg + und Strg - bis 150% und 200% — das Layout sollte nutzbar bleiben.',
        aufgaben: [
        'Text/Hintergrund: ausreichend Kontrast',
        'Buttons: Text lesbar auf Farbe',
        'Dark Mode: Kontrast ok',
        'Fehlermeldungen: nicht nur Farbe',
        'Zoom 150%: Layout ok',
        'Zoom 200%: nutzbar',
        'Flaggen haben Textalternative'
      ]}
    ],
    bewertungen: [
      'Tastaturnavigation',
      'ARIA-Labels',
      'Farbkontrast',
      'Screenreader-Kompatibilität',
      'Gesamteindruck'
    ]
  };
}

// TP-29
function tp29_() {
  return {
    id: 'TP-29', titel: 'Datenschutz, Impressum & Rechtliches',
    dauer: '10 Min', vorbedingungen: 'App geöffnet',
    geraete: 'Desktop',
    beschreibung: 'Dieser Test prüft die RECHTLICHEN SEITEN der App: Impressum und Datenschutzerklärung. ' +
      'In Deutschland sind beide Pflicht und müssen von jeder Seite erreichbar sein (im Footer). ' +
      'Die Datenschutzerklärung muss alle verwendeten Dienste (Google APIs, etc.) und die Datenverarbeitung beschreiben.',
    testerFelder: ['Gerät', 'Browser + Version'],
    sektionen: [
      { titel: 'A — Impressum',
        beschreibung: 'Scrolle zum Footer der App und klicke auf "Impressum". Die Seite sollte laden und folgende Pflichtangaben enthalten: ' +
          'Firmenname (ai tour UG), vollständige Adresse, Kontaktdaten (E-Mail/Telefon), Handelsregistereintrag (Amtsgericht + Nummer), ' +
          'USt-IdNr. und ein Haftungsausschluss.',
        aufgaben: [
        'Link im Footer → Seite lädt',
        'Firmenname vorhanden',
        'Adresse vollständig',
        'Kontaktdaten (E-Mail/Telefon)',
        'Handelsregistereintrag',
        'USt-IdNr.',
        'Haftungsausschluss'
      ]},
      { titel: 'B — Datenschutzerklärung',
        beschreibung: 'Klicke auf "Datenschutz" im Footer. Die Datenschutzerklärung sollte beschreiben: ' +
          'Wer ist verantwortlich? Welche Daten werden erhoben? Welche externen Dienste werden genutzt ' +
          '(Google Translate, MyMemory, LibreTranslate, STT, TTS)? Wie werden Daten lokal gespeichert (IndexedDB)? ' +
          'Sind Live Sessions verschlüsselt? Welche Rechte haben Nutzer (Auskunft, Löschung)?',
        aufgaben: [
        'Link im Footer → Seite lädt',
        'Verantwortlicher genannt',
        'Erhobene Daten beschrieben',
        'APIs erwähnt (Google, MyMemory, LibreTranslate)',
        'STT + TTS erwähnt',
        'Lokale Speicherung erwähnt',
        'Verschlüsselung bei Live Sessions',
        'Betroffenenrechte (Auskunft, Löschung)',
        'Keine Tracking-Cookies Bestätigung'
      ]},
      { titel: 'C — Erreichbarkeit & 404',
        beschreibung: 'Prüfe, ob Impressum und Datenschutz von JEDER Seite der App erreichbar sind (Footer). ' +
          'Teste die Links auf Desktop und Mobile. Rufe eine ungültige URL auf (z.B. /xyz) — ' +
          'es sollte eine 404-Fehlerseite mit einem Zurück-/Home-Link erscheinen (kein technischer Stack-Trace).',
        aufgaben: [
        'Von jeder Seite erreichbar (Footer)',
        'Desktop + Mobile Links funktionieren',
        'Texte gut lesbar (Absätze, Überschriften)',
        'Ungültige URL → 404-Seite',
        '404 hat Zurück/Home-Link',
        'Kein Stack-Trace sichtbar'
      ]}
    ],
    bewertungen: [
      'Impressum Vollständigkeit',
      'Datenschutzerklärung Vollständigkeit',
      'DSGVO-Konformität',
      'Erreichbarkeit',
      'Gesamteindruck'
    ]
  };
}

// TP-30
function tp30_() {
  return {
    id: 'TP-30', titel: 'Langzeittest (Stabilität & Speicher)',
    dauer: '60 Min', vorbedingungen: 'Gerät aufgeladen >80%, stabiles Internet',
    geraete: 'Smartphone + 1 zweites Gerät für Live-Test',
    beschreibung: 'Der LANGZEITTEST prüft, ob die App über 60 Minuten stabil bleibt: Kein Speicherleck (App wird nicht langsamer), ' +
      'kein Akkufresser, keine verlorenen Verbindungen. Du nutzt die App intensiv über eine Stunde.\n\n' +
      'WICHTIG: Lade dein Gerät vorher auf >80%. Notiere den Akkustand am Anfang und am Ende. ' +
      'Dieser Test ist in 5 Phasen aufgeteilt, die du nacheinander durchgehst.',
    testerFelder: ['Gerät', 'Browser + Version', 'Betriebssystem', 'Akkustand Start (%)'],
    sektionen: [
      { titel: 'Phase 1 — Übersetzer (15 Min)',
        beschreibung: 'Führe 50 verschiedene Übersetzungen durch (verschiedene Sprachen, kurze/lange Texte). ' +
          'Achte darauf, ob die App mit jeder Übersetzung langsamer wird (Speicherleck). ' +
          'Lass bei jeder 5. Übersetzung die Sprachausgabe laufen — es sollte kein Audio-Durcheinander entstehen.',
        aufgaben: [
        '50 verschiedene Übersetzungen → reaktionsschnell',
        'Kein Speicherleck (App wird nicht langsamer)',
        'Verlauf max 50 Einträge',
        'TTS jede 5. Übersetzung → kein Audio-Stacking',
        'Sprache mehrfach wechseln → kein Fehler'
      ]},
      { titel: 'Phase 2 — Live Session (20 Min)',
        beschreibung: 'Erstelle eine Cloud-Session mit einem Listener (2. Gerät). Sprich 20 Minuten lang (mit kurzen Pausen). ' +
          'Prüfe stichprobenartig, ob alle Übersetzungen beim Listener ankommen. ' +
          'Achte auf die Latenzanzeige — sie sollte über die Zeit nicht ansteigen. ' +
          'Auto-TTS beim Listener sollte 20 Minuten lang ohne Probleme laufen.',
        aufgaben: [
        'Cloud Session, 1 Listener',
        '20 Min ununterbrochen (mit Pausen)',
        'Alle Übersetzungen kommen an (stichprobenartig)',
        'Keine verlorenen Übersetzungen',
        'Latenz bleibt stabil (kein Anstieg)',
        'Auto-TTS 20 Min problemlos',
        'WebSocket bleibt aktiv',
        'Kein Audio-Speicherleck'
      ]},
      { titel: 'Phase 3 — Konversation (10 Min)',
        beschreibung: 'Wechsle in den Konversationsmodus und tausche 30+ Nachrichten aus (abwechselnd sprechen). ' +
          'Es sollten maximal 6 Nachrichten pro Seite angezeigt werden und kein Audio-Stau entstehen.',
        aufgaben: [
        '30+ Nachrichten austauschen',
        'Max 6 pro Seite korrekt begrenzt',
        'Kein Audio-Stau'
      ]},
      { titel: 'Phase 4 — Hintergrund (10 Min)',
        beschreibung: 'Schiebe die App in den Hintergrund (Home-Button) und warte 2 Minuten. Öffne sie wieder — ' +
          'der Zustand (Text, Einstellungen) sollte erhalten sein. Teste auch: Live Session im Hintergrund → Vordergrund ' +
          '(Session noch verbunden?), andere App öffnen (kein Absturz?), Bildschirm sperren/entsperren.',
        aufgaben: [
        'Hintergrund 2 Min → Zustand bleibt',
        'Live Session: Hintergrund→Vordergrund → verbunden',
        'Andere App → kein Absturz',
        'Sperren/Entsperren → funktioniert weiter'
      ]},
      { titel: 'Phase 5 — Speicher (5 Min)',
        beschreibung: 'Gehe in die Einstellungen und prüfe die Speicheranzeige. Der Übersetzungs-Cache sollte max 10.000 Einträge haben, ' +
          'der TTS-Cache max 200 Clips. Prüfe im Task-Manager deines Geräts, ob die App weniger als 500 MB RAM verbraucht. ' +
          'Notiere den Akkustand am Ende.',
        aufgaben: [
        'Speicheranzeige sinnvoller Wert',
        'Cache max 10.000 / TTS max 200',
        'RAM < 500 MB (Task-Manager)',
        'Akkustand Ende notieren'
      ]}
    ],
    bewertungen: [
      'Langzeit-Stabilität',
      'Speicher-Management',
      'Akkueffizienz',
      'Hintergrund-Verhalten',
      'Live Session Ausdauer',
      'Gesamteindruck'
    ]
  };
}
