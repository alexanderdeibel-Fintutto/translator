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
  form.setDescription(
    '🕐 Geschätzte Dauer: ' + proto.dauer + '\n' +
    '📋 Vorbedingungen: ' + proto.vorbedingungen + '\n' +
    '📱 Benötigte Geräte: ' + proto.geraete + '\n\n' +
    'Bitte alle Aufgaben der Reihe nach durchführen und bewerten.'
  );
  form.setIsQuiz(false);
  form.setAllowResponseEdits(true);

  // Seite 1: Tester-Info
  form.addSectionHeaderItem().setTitle('Tester-Information');
  form.addTextItem().setTitle('Tester-Name').setRequired(true);
  form.addDateItem().setTitle('Testdatum').setRequired(true);

  for (var t = 0; t < proto.testerFelder.length; t++) {
    form.addTextItem().setTitle(proto.testerFelder[t]).setRequired(true);
  }

  // Seiten mit Aufgaben
  for (var s = 0; s < proto.sektionen.length; s++) {
    var sek = proto.sektionen[s];
    form.addPageBreakItem().setTitle(sek.titel);

    if (sek.aufgaben.length > 0 && sek.aufgaben.length <= 10) {
      // Grid-Bewertung: Zeilen = Aufgaben, Spalten = OK/FEHLER/TEILWEISE
      var grid = form.addGridItem();
      grid.setTitle(sek.titel + ' — Bewertung');
      grid.setRows(sek.aufgaben);
      grid.setColumns(['OK', 'TEILWEISE', 'FEHLER', 'Nicht getestet']);

      // Bemerkungsfeld pro Sektion
      form.addParagraphTextItem()
        .setTitle(sek.titel + ' — Bemerkungen')
        .setHelpText('Hier Auffälligkeiten, Fehlerdetails oder Screenshots-Links notieren');
    } else if (sek.aufgaben.length > 10) {
      // Bei >10 Aufgaben: in 2 Grids aufteilen (Google Forms Limit)
      var mitte = Math.ceil(sek.aufgaben.length / 2);
      var grid1 = form.addGridItem();
      grid1.setTitle(sek.titel + ' — Bewertung (Teil 1)');
      grid1.setRows(sek.aufgaben.slice(0, mitte));
      grid1.setColumns(['OK', 'TEILWEISE', 'FEHLER', 'Nicht getestet']);

      var grid2 = form.addGridItem();
      grid2.setTitle(sek.titel + ' — Bewertung (Teil 2)');
      grid2.setRows(sek.aufgaben.slice(mitte));
      grid2.setColumns(['OK', 'TEILWEISE', 'FEHLER', 'Nicht getestet']);

      form.addParagraphTextItem()
        .setTitle(sek.titel + ' — Bemerkungen');
    }
  }

  // Letzte Seite: Gesamtbewertung
  form.addPageBreakItem().setTitle('Gesamtbewertung');

  for (var b = 0; b < proto.bewertungen.length; b++) {
    form.addScaleItem()
      .setTitle(proto.bewertungen[b])
      .setBounds(1, 5)
      .setLabels('Nicht nutzbar', 'Einwandfrei')
      .setRequired(true);
  }

  form.addParagraphTextItem()
    .setTitle('Freitextkommentar')
    .setHelpText('Allgemeine Eindrücke, Verbesserungsvorschläge, Lob oder Kritik');

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
    testerFelder: ['Gerät', 'Browser + Version', 'Betriebssystem'],
    sektionen: [
      { titel: 'A — Grundlegende Übersetzung', aufgaben: [
        'Übersetzer-Seite wird standardmäßig angezeigt',
        'Quellsprache voreingestellt auf Deutsch',
        'Zielsprache voreingestellt auf Englisch',
        '"Guten Morgen, wie geht es Ihnen?" → Übersetzung erscheint automatisch',
        'Übersetzung erscheint in < 3 Sekunden',
        'Zeichenanzahl wird unterhalb angezeigt',
        'Provider-Badge sichtbar (z.B. Google, MyMemory)'
      ]},
      { titel: 'B — Sprachauswahl', aufgaben: [
        'Klick auf Quellsprache → Dropdown öffnet sich',
        'Suchfeld: "Tür" eingeben → Türkisch wird gefiltert',
        'Sprache auf Französisch → Übersetzung aktualisiert',
        'Tausch-Button (↔) tauscht Quell- und Zielsprache',
        'Zielsprache Arabisch → arabische Schrift',
        'Zielsprache Japanisch → japanische Zeichen',
        'Mindestens 40 Sprachen in der Liste'
      ]},
      { titel: 'C — Kopieren & Löschen', aufgaben: [
        'Kopieren-Button → Text in Zwischenablage',
        'Häkchen-Feedback erscheint nach Kopieren',
        'Löschen-Button → Eingabefeld wird geleert',
        'Übersetzung verschwindet nach dem Löschen'
      ]},
      { titel: 'D — Verschiedene Texte', aufgaben: [
        '"Hallo" → sinnvolle Übersetzung',
        'Langer Text (5+ Sätze) → vollständig übersetzt',
        'Sonderzeichen "19,99€ — inkl. MwSt." → korrekt',
        'Leeres Feld → kein Fehler, Übersetzung verschwindet',
        'Schnelles Tippen → Übersetzung springt nicht wild'
      ]},
      { titel: 'E — Migrations-Sprachen', aufgaben: [
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
    testerFelder: ['Gerät', 'Browser + Version', 'Betriebssystem'],
    sektionen: [
      { titel: 'A — Mikrofon-Aktivierung', aufgaben: [
        'Mikrofon-Button ist sichtbar',
        'Klick → Browser fragt nach Berechtigung',
        'Berechtigung erteilen → Aufnahme startet (roter Indikator)',
        'Erneut klicken → Aufnahme stoppt'
      ]},
      { titel: 'B — Erkennung Deutsch', aufgaben: [
        'Sagen: "Ich möchte einen Kaffee bestellen" → Text erkannt',
        'Interim-Text erscheint während des Sprechens (live)',
        'Text wird als final übernommen',
        'Übersetzung erscheint automatisch',
        'Erkannter Text stimmt inhaltlich'
      ]},
      { titel: 'C — Andere Sprachen', aufgaben: [
        'Englisch: "Where is the nearest hospital?" → korrekt',
        'Französisch: "Bonjour, comment allez-vous?" → korrekt',
        'Spanisch: "Buenos días, necesito ayuda" → korrekt',
        'Türkisch: "Merhaba, yardıma ihtiyacım var" → korrekt'
      ]},
      { titel: 'D — Streaming & Satzgrenzen', aufgaben: [
        'Mehrere Sätze hintereinander → einzeln erkannt',
        'Pause mitten im Satz → System wartet geduldig',
        '20+ Sek. durchsprechen → vollständig erfasst',
        'Leise Umgebung: zuverlässig',
        'Mäßige Hintergrundgeräusche: noch akzeptabel'
      ]},
      { titel: 'E — Fehlerfälle', aufgaben: [
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
    testerFelder: ['Gerät', 'Browser + Version', 'Betriebssystem'],
    sektionen: [
      { titel: 'A — Manuelle Sprachausgabe', aufgaben: [
        'DE→EN übersetzen, Lautsprecher-Button → Audio spielt',
        'Aussprache ist verständlich und natürlich',
        'TTS-Engine-Badge sichtbar (Cloud oder Browser)',
        'Stop-Button → Audio stoppt sofort',
        'Quelltext-Lautsprecher → Quelltext wird vorgelesen'
      ]},
      { titel: 'B — Auto-Speak', aufgaben: [
        'Auto-Speak ist standardmäßig aktiviert',
        'Text eingeben → Übersetzung wird automatisch vorgelesen',
        'Deaktivieren → NICHT vorgelesen',
        'Wieder aktivieren → wieder vorgelesen'
      ]},
      { titel: 'C — HD Voice (Chirp 3 HD)', aufgaben: [
        'HD-Voice-Toggle aktivieren',
        'Stimme klingt hochwertiger als Standard',
        'Deaktivieren → Standard-Stimme (Neural2)'
      ]},
      { titel: 'D — Verschiedene Sprachen', aufgaben: [
        'Englisch → korrekte Aussprache',
        'Französisch → korrekte Aussprache',
        'Arabisch → korrekte Aussprache',
        'Japanisch → korrekte Aussprache',
        'Türkisch → korrekte Aussprache',
        'Hindi → korrekte Aussprache'
      ]},
      { titel: 'E — Edge Cases', aufgaben: [
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
    testerFelder: ['Gerät', 'Browser + Version', 'Betriebssystem'],
    sektionen: [
      { titel: 'A — Formalität (Sie/Du)', aufgaben: [
        'Formalitäts-Toggle finden',
        'Ziel DE, "Sie": "How are you?" → enthält Sie/Ihnen',
        'Toggle "Du" → enthält du/dir',
        'Ziel Französisch, Du → tu/toi statt vous',
        'Ziel Japanisch → Toggle ausgeblendet',
        'Zurück Deutsch → Toggle erscheint wieder'
      ]},
      { titel: 'B — Quick Phrases', aufgaben: [
        'Quick Phrases Sektion finden',
        'Verschiedene Kategorien vorhanden',
        'Phrase klicken → ins Eingabefeld übernommen',
        'Übersetzung startet automatisch',
        'Verschiedene Kategorien → verschiedene Phrasen'
      ]},
      { titel: 'C — Übersetzungsverlauf', aufgaben: [
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
    testerFelder: ['Gerät', 'Browser + Version', 'Betriebssystem'],
    sektionen: [
      { titel: 'A — Satzmodus', aufgaben: [
        'Satzmodus auswählen (Zap-Icon)',
        'Tooltip: "Jeder Satz wird sofort übersetzt"',
        '"Hallo. Wie geht es?" → jeder Satz sofort einzeln übersetzt',
        'Mikrofon: Satz wird nach Satzende übersetzt'
      ]},
      { titel: 'B — Absatzmodus', aufgaben: [
        'Absatzmodus auswählen (AlignLeft-Icon)',
        'Tooltip: "Text sammeln, dann Senden"',
        'Mehrere Sätze → NICHT automatisch übersetzt',
        'Senden-Button sichtbar',
        'Senden klicken → Block wird übersetzt',
        'Mikrofon: Text sammelt sich bis Senden'
      ]},
      { titel: 'C — Moduswechsel & Tastenkombination', aufgaben: [
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
    testerFelder: ['Speaker-Gerät', 'Listener-Gerät', 'Browser (Speaker)', 'Browser (Listener)'],
    sektionen: [
      { titel: 'A — Session erstellen', aufgaben: [
        'Navigation → Live',
        'Speaker/Listener Auswahl sichtbar',
        'Speaker wählen, Quellsprache Deutsch',
        'Cloud-Modus wählen',
        'Session-Code angezeigt (z.B. TR-A3K9)',
        'QR-Code angezeigt',
        'Status zeigt "Cloud"'
      ]},
      { titel: 'B — Listener beitreten', aufgaben: [
        '2. Gerät: Live → Listener',
        'Code eingeben oder QR scannen',
        'Zielsprache EN wählen und beitreten',
        'Speaker sieht Listener-Anzahl = 1',
        'Aufschlüsselung nach Sprache (EN:1)'
      ]},
      { titel: 'C — Sprechen & Übersetzen', aufgaben: [
        'Aufnahme starten (Mikrofon-Button)',
        'Roter Indikator sichtbar',
        'Sagen: "Willkommen an Bord. Heute besuchen wir die Altstadt."',
        'Speaker: Transkript erscheint in Echtzeit',
        'Listener: Übersetzung in der Zielsprache',
        'Latenzanzeige beim Speaker (STT ms, Translate ms)',
        'Gesamtlatenz < 5 Sekunden'
      ]},
      { titel: 'D — Pause & Session beenden', aufgaben: [
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
    testerFelder: ['Gerät (Listener)', 'Browser + Version', 'Betriebssystem'],
    sektionen: [
      { titel: 'A — Beitreten', aufgaben: [
        'Live → Listener wählen',
        'Session-Code manuell eingeben → Beitritt',
        'Alternativ: QR-Code scannen → auto Beitritt',
        'Zielsprache wählen',
        'Status "Verbunden"'
      ]},
      { titel: 'B — Übersetzungen empfangen', aufgaben: [
        'Speaker spricht → Übersetzung erscheint',
        'Groß und gut lesbar',
        'Neue ersetzen vorherige (aktuelle oben)',
        'Verlauf scrollbar',
        '"Warte auf Übersetzung..." wenn still'
      ]},
      { titel: 'C — Auto-TTS', aufgaben: [
        'Auto-TTS Toggle prüfen',
        'Speaker spricht → Listener hört Übersetzung automatisch',
        'Deaktivieren → nicht vorgelesen',
        'Aktivieren → wieder vorgelesen'
      ]},
      { titel: 'D — Sprache wechseln & Fullscreen', aufgaben: [
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
    testerFelder: ['Gerät 1 (Speaker)', 'Gerät 2 (Listener 1)', 'Gerät 3 (Listener 2)', 'Gerät 4 (Listener 3, optional)'],
    sektionen: [
      { titel: 'A — Multi-Listener Setup', aufgaben: [
        'Speaker: Session Cloud, Deutsch',
        'Listener 1: Englisch beitreten',
        'Listener 2: Französisch beitreten',
        'Listener 3 (opt): Türkisch beitreten',
        'Speaker sieht korrekte Listener-Anzahl',
        'Aufschlüsselung nach Sprache (EN:1, FR:1, TR:1)'
      ]},
      { titel: 'B — Parallele Übersetzung', aufgaben: [
        'Speaker: "Wir fahren jetzt in den Hafen."',
        'Listener 1 (EN): englische Übersetzung',
        'Listener 2 (FR): französische Übersetzung',
        'Listener 3 (TR): türkische Übersetzung',
        'Jeder NUR seine Zielsprache',
        'Alle ungefähr gleichzeitig'
      ]},
      { titel: 'C — Dynamik & Stresstest', aufgaben: [
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
    testerFelder: ['Router-Modell', 'Router-IP', 'Speaker-Gerät', 'Listener-Gerät'],
    sektionen: [
      { titel: 'A — Vorbereitung', aufgaben: [
        'Relay-Server auf Port 8765 läuft',
        'Beide Geräte im Router-WLAN',
        'Health-Check http://<ip>:8765/health antwortet'
      ]},
      { titel: 'B — Lokale Session', aufgaben: [
        'Speaker → "Lokales WiFi" Modus',
        'Auto-Discovery findet Server',
        'Session erstellt, Code angezeigt',
        'QR enthält ?ws=ws://<ip>:8765',
        'Anzeige "Lokal"'
      ]},
      { titel: 'C — Übersetzung & Offline', aufgaben: [
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
    testerFelder: ['Speaker-Gerät (Hotspot)', 'Listener-Gerät', 'Speaker-OS', 'Listener-OS'],
    sektionen: [
      { titel: 'A — Hotspot erstellen', aufgaben: [
        'Speaker → "Hotspot" Modus',
        'Android: Auto-Hotspot mit SSID+Passwort',
        'iOS: Hinweis manueller Hotspot',
        'WiFi-QR-Code angezeigt',
        'SSID+Passwort als Text'
      ]},
      { titel: 'B — Listener verbindet', aufgaben: [
        'WiFi-QR scannen → auto Verbindung',
        'Oder manuell SSID+Passwort eingeben',
        'Im Hotspot-Netzwerk',
        'Session-QR scannen (Schritt 2)',
        'Verbindung über lokalen WebSocket',
        'Speaker sieht Listener'
      ]},
      { titel: 'C — Übersetzung & Stabilität', aufgaben: [
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
    testerFelder: ['Speaker-Gerät', 'Listener-Gerät', 'Speaker-OS + Version', 'Listener-OS + Version'],
    sektionen: [
      { titel: 'A — BLE-Setup', aufgaben: [
        'Bluetooth auf beiden Geräten an',
        'Bluetooth-Berechtigung erteilt',
        '"BLE" Modus verfügbar',
        'BLE wählen → Session erstellt',
        'GATT-Server startet',
        'Advertising beginnt'
      ]},
      { titel: 'B — Discovery & Verbindung', aufgaben: [
        'Listener → BLE wählen',
        'BLE-Scan startet automatisch',
        'Speaker in Liste mit RSSI-Signalstärke',
        'Signalstärke 3-stufig sinnvoll',
        'Antippen → Verbindung hergestellt'
      ]},
      { titel: 'C — Übersetzung & Reichweite', aufgaben: [
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
    testerFelder: ['Gerät (Speaker)', 'Browser + Version'],
    sektionen: [
      { titel: 'A — TXT-Export', aufgaben: [
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
      { titel: 'B — Markdown-Export & Edge Cases', aufgaben: [
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
    testerFelder: ['Gerät', 'Browser + Version', 'Betriebssystem'],
    sektionen: [
      { titel: 'A — Layout & Sprache', aufgaben: [
        'Navigation → Konversation',
        'Obere Hälfte 180° gedreht (für Gegenüber)',
        'Untere Hälfte normal',
        'Trennlinie mit Neustart-Button',
        'Person 1 oben: Deutsch, Person 2 unten: Englisch',
        'Beide unabhängig wählbar',
        'Tausch-Button funktioniert'
      ]},
      { titel: 'B — Bidirektionale Übersetzung', aufgaben: [
        'P1 DE: "Wo ist das Restaurant?" → P2 sieht EN',
        'P2 EN: "Around the corner" → P1 sieht DE',
        'Nur eine Person gleichzeitig aufnehmen',
        'Auto-Speak für beide Seiten verfügbar',
        'Übersetzung wird vorgelesen wenn aktiviert'
      ]},
      { titel: 'C — Verlauf & Edge Cases', aufgaben: [
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
    testerFelder: ['Gerät', 'Browser + Version', 'Betriebssystem'],
    sektionen: [
      { titel: 'A — Foto & OCR', aufgaben: [
        'Navigation → Kamera',
        'Kamera-Interface sichtbar',
        'Sprachpaar-Auswahl vorhanden',
        'Kamera-Berechtigung angefragt',
        'Foto von deutschem Text aufnehmen',
        'Bildvorschau angezeigt',
        '"Text wird extrahiert..."',
        'Extrahierter Text stimmt mit Original überein'
      ]},
      { titel: 'B — Übersetzung & Galerie', aufgaben: [
        'Übersetzung startet automatisch nach OCR',
        'Übersetzte Version angezeigt',
        'Kopieren-Button funktioniert',
        'Sprechen-Button funktioniert',
        'Galerie-Upload → OCR+Übersetzung funktioniert'
      ]},
      { titel: 'C — Verschiedene Texte', aufgaben: [
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
    testerFelder: ['Gerät', 'Browser + Version', 'Betriebssystem'],
    sektionen: [
      { titel: 'A — Navigation & Filter', aufgaben: [
        'Navigation → Phrasebook',
        'Titel+Beschreibung sichtbar',
        'Zielsprach-Auswahl vorhanden',
        'Kategorie-Filter (Alle, Behörde, Arzt, etc.)',
        'Arabisch → arabische Phrasen',
        'Kategorie "Arzt" → nur medizinische',
        '"Alle" → alle Phrasen',
        'Farsi → RTL-Anzeige'
      ]},
      { titel: 'B — Phrasen & Batch', aufgaben: [
        'Phrase klicken → Übersetzung angezeigt',
        'Sprechen-Button funktioniert',
        'Kategorie-Tag sichtbar',
        '"Alle übersetzen" → Fortschrittsbalken',
        'Alle übersetzt nach Abschluss',
        'Sprache wechseln → erneuter Batch möglich'
      ]},
      { titel: 'C — Sprachen & Caching', aufgaben: [
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
    testerFelder: ['Gerät', 'Browser + Version', 'Betriebssystem'],
    sektionen: [
      { titel: 'A — Netzwerk & Speicher', aufgaben: [
        'Navigation → Einstellungen',
        'Netzwerk-Status sichtbar (Online/Degraded/Offline)',
        'Offline-Support Indikatoren (IndexedDB, Cache, SW, WASM)',
        'Speicherbalken mit Prozent+Bytes',
        '"Dauerhaften Speicher anfordern" Button'
      ]},
      { titel: 'B — API-Key', aufgaben: [
        'Passwort-Feld für API-Key',
        'Anzeigen/Verbergen-Toggle',
        'Speichern → Erfolgsmeldung',
        'Status "Aktiv"',
        'Seite neu laden → gespeichert',
        'Übersetzer → Provider "Google"',
        'Key löschen → Status "Inaktiv"',
        'Ohne Key: Fallback MyMemory funktioniert'
      ]},
      { titel: 'C — Cache-Verwaltung', aufgaben: [
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
    testerFelder: ['Gerät', 'Browser + Version', 'Betriebssystem'],
    sektionen: [
      { titel: 'A — Sprachpakete', aufgaben: [
        'Offline-Sprachpakete Sektion in Einstellungen',
        'Liste verfügbarer Sprachpaare',
        'Nach Quellsprache gruppiert',
        '~35MB pro Paket angezeigt',
        'DE→EN herunterladen, Fortschrittsbalken',
        'Geschwindigkeit akzeptabel',
        'Status "Heruntergeladen"',
        'Löschen-Button erscheint'
      ]},
      { titel: 'B — Whisper & Offline-Test', aufgaben: [
        'Whisper-Modell Sektion finden',
        'Download starten, Fortschritt sichtbar',
        'Status "Bereit"',
        'Flugmodus an',
        'DE→EN: "Guten Tag" → Offline-Übersetzung',
        'Provider "Offline"',
        'Sprachpaar ohne Modell → Fehlermeldung',
        'Pivot DE→FR (via EN): sinnvolles Ergebnis'
      ]},
      { titel: 'C — Löschen', aufgaben: [
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
    testerFelder: ['Gerät', 'Browser + Version', 'Betriebssystem'],
    sektionen: [
      { titel: 'A — Installationsbanner', aufgaben: [
        'Banner erscheint ("App installieren")',
        'Vorteile angezeigt (Offline, Speed)',
        'Schließbar, erscheint nicht erneut in Session'
      ]},
      { titel: 'B — Installation & Standalone', aufgaben: [
        '"Installieren" → nativer Dialog',
        'Bestätigen → auf Homescreen',
        'Icon korrekt',
        'Standalone-Modus (keine Browser-Leiste)',
        'Status-Bar korrekte Farbe (#0369a1)',
        'Navigation funktioniert',
        'Alle Seiten laden'
      ]},
      { titel: 'C — Shortcuts & Offline', aufgaben: [
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
    testerFelder: ['Gerät', 'Browser + Version', 'Betriebssystem'],
    sektionen: [
      { titel: 'A — Toggle & Sofortwechsel', aufgaben: [
        'Theme-Toggle im Header (Sonne/Mond)',
        'Light→Dark sofort, kein Flackern',
        'Dark→Light sofort, kein Flackern'
      ]},
      { titel: 'B — Dark Mode alle Seiten', aufgaben: [
        'Übersetzer: dunkel, Text lesbar, kontrastreich',
        'Live-Landing: Buttons, Cards sichtbar',
        'Phrasebook: Cards, Chips lesbar',
        'Einstellungen: Felder, Toggles sichtbar',
        'Info-Seite: Feature-Cards kontrastreich',
        'Konversation: Split-Screen lesbar',
        'Impressum/Datenschutz: Texte lesbar'
      ]},
      { titel: 'C — Persistenz & System', aufgaben: [
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
    testerFelder: ['Gerät', 'Browser + Version', 'Muttersprache(n)'],
    sektionen: [
      { titel: 'A — Sprachwechsel', aufgaben: [
        'Globe-Icon/Dropdown im Header',
        '9 Sprachen mit Flaggen',
        'Wechsel sofort (kein Nachladen)',
        'Seite neu laden → gespeichert'
      ]},
      { titel: 'B — Alle 9 Sprachen prüfen', aufgaben: [
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
      { titel: 'C — Vollständigkeit & Auto-Detection', aufgaben: [
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
    testerFelder: ['Gerät', 'Browser + Version', 'Arabisch/Farsi-Kenntnisse'],
    sektionen: [
      { titel: 'A — RTL-Layout Arabisch', aufgaben: [
        'UI Arabisch: Navigation rechts-nach-links',
        'Header gespiegelt',
        'Buttons korrekt ausgerichtet',
        'Eingabefelder ab rechts',
        'Cards/Layout Padding gespiegelt'
      ]},
      { titel: 'B — RTL-Übersetzung', aufgaben: [
        'DE→AR: Übersetzung RTL',
        'AR→DE: Quelltext RTL, Zieltext LTR',
        'Gemischt (AR+Zahlen+Latein): Bidi korrekt',
        'Kopieren: arabischer Text korrekt'
      ]},
      { titel: 'C — Farsi & spezielle Bereiche', aufgaben: [
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
    testerFelder: ['Gerät + Bildschirmgröße', 'Browser + Version', 'Betriebssystem'],
    sektionen: [
      { titel: 'A — Navigation & Übersetzer', aufgaben: [
        'Header vollständig sichtbar',
        'Nav bedienbar, Touch-Targets groß genug',
        'Footer sichtbar, Links klickbar',
        'Eingabefeld volle Breite',
        'Dropdowns bedienbar',
        'Mikrofon-Button groß genug',
        'Tastatur öffnen: kein Verdecken',
        'Scrollen flüssig'
      ]},
      { titel: 'B — Weitere Seiten', aufgaben: [
        'Live: QR groß genug zum Scannen',
        'Konversation: Split nutzbar, 180° lesbar',
        'Phrasebook: Cards lesbar, Buttons erreichbar',
        'Einstellungen: scrollbar, nichts abgeschnitten',
        'Info: Grid 1 Spalte auf Mobile',
        'Kamera: Vollbild-Ansicht ok'
      ]},
      { titel: 'C — Orientierung', aufgaben: [
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
    testerFelder: ['Gerät + Bildschirmgröße', 'Browser + Version', 'Betriebssystem'],
    sektionen: [
      { titel: 'A — Desktop 1200px+', aufgaben: [
        'Übersetzer nutzt Breite sinnvoll',
        'Navigation horizontal',
        'Live: Cards nebeneinander',
        'Info: Grid mehrspaltig',
        'Max-width begrenzt Container'
      ]},
      { titel: 'B — Tablet & Skalieren', aufgaben: [
        'Tablet 768-1024px: Hybrid-Layout',
        'Touch+Größe bedienbar',
        'Konversation Split-Screen gut',
        '1920→768px: flüssige Anpassung',
        '768→375px: Mobile-Layout',
        'Kein horizontales Scrollen',
        'Nichts abgeschnitten/überlappend'
      ]},
      { titel: 'C — Desktop-Features', aufgaben: [
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
    testerFelder: ['Chrome-Version (Desktop)', 'Chrome-Version (Android)', 'Desktop-OS', 'Android-Version'],
    sektionen: [
      { titel: 'A — Chrome Desktop', aufgaben: [
        'App lädt vollständig',
        'Übersetzen, STT, TTS funktioniert',
        'Dark Mode funktioniert',
        'Live Session funktioniert',
        'Alle Seiten laden ohne Fehler',
        'PWA-Installation angeboten',
        'Service Worker registriert',
        'Keine Konsolenfehler (F12)'
      ]},
      { titel: 'B — Chrome Android', aufgaben: [
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
    testerFelder: ['Safari-Version (Desktop)', 'Safari-Version (iOS)', 'macOS-Version', 'iOS-Version'],
    sektionen: [
      { titel: 'A — Safari Desktop', aufgaben: [
        'App lädt vollständig',
        'Übersetzen funktioniert',
        'STT: Web Speech oder sinnvoller Fallback',
        'TTS funktioniert',
        'Dark Mode funktioniert',
        'Alle Seiten laden'
      ]},
      { titel: 'B — Safari iOS', aufgaben: [
        'App lädt, Touch ok',
        'Google Cloud STT als Fallback',
        'Audio nach User-Interaktion',
        'Kamera funktioniert',
        '"Zum Home-Bildschirm" funktioniert',
        'Standalone-Modus funktioniert'
      ]},
      { titel: 'C — Safari-spezifisch', aufgaben: [
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
    testerFelder: ['Firefox-Version', 'Edge-Version', 'Betriebssystem'],
    sektionen: [
      { titel: 'A — Firefox', aufgaben: [
        'App lädt vollständig',
        'Übersetzen funktioniert',
        'STT (eingeschränkt) → Fallback/Hinweis',
        'TTS funktioniert',
        'Dark Mode funktioniert',
        'Alle Seiten laden',
        'Service Worker registriert',
        'Keine Konsolenfehler'
      ]},
      { titel: 'B — Edge', aufgaben: [
        'App lädt vollständig',
        'Übersetzen, STT, TTS funktioniert',
        'Dark Mode funktioniert',
        'Alle Seiten laden',
        'PWA-Installation angeboten',
        'Keine Konsolenfehler'
      ]},
      { titel: 'C — Cross-Browser Vergleich', aufgaben: [
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
    testerFelder: ['Gerät', 'Browser + Version', 'Betriebssystem'],
    sektionen: [
      { titel: 'A — Netzwerkstatus', aufgaben: [
        'Online: "Online" grün',
        'Flugmodus: "Offline" rot',
        'Wieder an: "Online" zurück',
        'Wechsel < 5 Sekunden'
      ]},
      { titel: 'B — Übersetzung bei Netzwerkwechsel', aufgaben: [
        'Online: normal (Google/MyMemory)',
        'Flugmodus: Fehlermeldung oder Offline-Modell',
        'Meldung verständlich (kein Jargon)',
        'Wieder online: funktioniert sofort',
        'Kein Dauerfehlerzustand'
      ]},
      { titel: 'C — Provider & Circuit Breaker', aufgaben: [
        'Ohne API-Key: MyMemory Fallback',
        'Badge zeigt aktuellen Provider',
        'Cache-Hit offline: Badge "Cache"'
      ]},
      { titel: 'D — Live Session & Degraded', aufgaben: [
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
    testerFelder: ['Gerät', 'Screenreader (falls verwendet)', 'Browser + Version'],
    sektionen: [
      { titel: 'A — Tastaturnavigation', aufgaben: [
        'Tab: sinnvolle Reihenfolge',
        'Focus-Ring sichtbar',
        'Enter: Button aktiviert',
        'Esc: Dropdown/Modal schließt',
        'Pfeiltasten in Dropdown',
        'Keine Tastaturfalle'
      ]},
      { titel: 'B — ARIA & Screenreader', aufgaben: [
        'Mikrofon-Button hat aria-label',
        'Kopieren-Button hat aria-label',
        'Lautsprecher-Button hat aria-label',
        'Eingabefelder haben Label/Placeholder',
        'Screenreader: App navigierbar (optional)',
        'Buttons mit Zweck vorgelesen (optional)'
      ]},
      { titel: 'C — Kontrast & Zoom', aufgaben: [
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
    testerFelder: ['Gerät', 'Browser + Version'],
    sektionen: [
      { titel: 'A — Impressum', aufgaben: [
        'Link im Footer → Seite lädt',
        'Firmenname vorhanden',
        'Adresse vollständig',
        'Kontaktdaten (E-Mail/Telefon)',
        'Handelsregistereintrag',
        'USt-IdNr.',
        'Haftungsausschluss'
      ]},
      { titel: 'B — Datenschutzerklärung', aufgaben: [
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
      { titel: 'C — Erreichbarkeit & 404', aufgaben: [
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
    testerFelder: ['Gerät', 'Browser + Version', 'Betriebssystem', 'Akkustand Start (%)'],
    sektionen: [
      { titel: 'Phase 1 — Übersetzer (15 Min)', aufgaben: [
        '50 verschiedene Übersetzungen → reaktionsschnell',
        'Kein Speicherleck (App wird nicht langsamer)',
        'Verlauf max 50 Einträge',
        'TTS jede 5. Übersetzung → kein Audio-Stacking',
        'Sprache mehrfach wechseln → kein Fehler'
      ]},
      { titel: 'Phase 2 — Live Session (20 Min)', aufgaben: [
        'Cloud Session, 1 Listener',
        '20 Min ununterbrochen (mit Pausen)',
        'Alle Übersetzungen kommen an (stichprobenartig)',
        'Keine verlorenen Übersetzungen',
        'Latenz bleibt stabil (kein Anstieg)',
        'Auto-TTS 20 Min problemlos',
        'WebSocket bleibt aktiv',
        'Kein Audio-Speicherleck'
      ]},
      { titel: 'Phase 3 — Konversation (10 Min)', aufgaben: [
        '30+ Nachrichten austauschen',
        'Max 6 pro Seite korrekt begrenzt',
        'Kein Audio-Stau'
      ]},
      { titel: 'Phase 4 — Hintergrund (10 Min)', aufgaben: [
        'Hintergrund 2 Min → Zustand bleibt',
        'Live Session: Hintergrund→Vordergrund → verbunden',
        'Andere App → kein Absturz',
        'Sperren/Entsperren → funktioniert weiter'
      ]},
      { titel: 'Phase 5 — Speicher (5 Min)', aufgaben: [
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
