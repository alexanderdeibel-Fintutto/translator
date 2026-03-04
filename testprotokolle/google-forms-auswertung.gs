// ============================================================
// GuideTranslator — Testprotokolle AUSWERTUNG
// ============================================================
// Sammelt automatisch alle Antworten aus den 30 Google Forms
// und erstellt ein Master-Sheet mit Dashboards und Übersichten.
//
// ANLEITUNG:
// 1. Öffne https://script.google.com
// 2. Neues Projekt erstellen (NICHT im gleichen wie der Generator!)
// 3. Gesamten Inhalt dieser Datei einfügen
// 4. Speichern (Ctrl+S)
// 5. Funktion "auswertungStarten" auswählen und ▶ Run klicken
// 6. Google-Berechtigung erteilen
// 7. Ein neues Google Sheet "GuideTranslator Testergebnisse"
//    erscheint in deinem Google Drive
//
// DANACH:
// - Jederzeit "auswertungAktualisieren" ausführen für neue Daten
// - Oder automatischen Trigger einrichten (siehe unten)
// ============================================================

// ===================== KONFIGURATION ========================

var CONFIG = {
  ordnerName: 'GuideTranslator Testprotokolle',
  sheetName: 'GuideTranslator Testergebnisse',
  formPraefix: 'TP-'
};

// ===================== HAUPTFUNKTIONEN ======================

/**
 * Erstmalige Auswertung: Erstellt das Master-Sheet und sammelt alle Daten.
 * DIESE FUNKTION BEIM ERSTEN MAL AUSFÜHREN.
 */
function auswertungStarten() {
  var ss = erstelleMasterSheet_();
  sammleAlleDaten_(ss);
  erstelleDashboard_(ss);
  erstelleFehlerListe_(ss);
  erstelleTesterUebersicht_(ss);
  Logger.log('=== AUSWERTUNG ERSTELLT ===');
  Logger.log('Sheet: ' + ss.getUrl());
}

/**
 * Aktualisierung: Holt neue Antworten und aktualisiert alle Tabs.
 * DIESE FUNKTION FÜR UPDATES AUSFÜHREN.
 */
function auswertungAktualisieren() {
  var files = DriveApp.getFilesByName(CONFIG.sheetName);
  if (!files.hasNext()) {
    Logger.log('Master-Sheet nicht gefunden. Bitte erst "auswertungStarten" ausführen.');
    return;
  }
  var ss = SpreadsheetApp.open(files.next());
  sammleAlleDaten_(ss);
  erstelleDashboard_(ss);
  erstelleFehlerListe_(ss);
  erstelleTesterUebersicht_(ss);
  Logger.log('=== AUSWERTUNG AKTUALISIERT ===');
  Logger.log('Sheet: ' + ss.getUrl());
}

/**
 * Richtet einen automatischen Trigger ein:
 * Aktualisiert die Auswertung täglich um 8:00 Uhr morgens.
 */
function automTriggerEinrichten() {
  // Alte Trigger entfernen
  var triggers = ScriptApp.getProjectTriggers();
  for (var i = 0; i < triggers.length; i++) {
    if (triggers[i].getHandlerFunction() === 'auswertungAktualisieren') {
      ScriptApp.deleteTrigger(triggers[i]);
    }
  }
  // Neuen täglichen Trigger erstellen
  ScriptApp.newTrigger('auswertungAktualisieren')
    .timeBased()
    .everyDays(1)
    .atHour(8)
    .create();
  Logger.log('Automatischer Trigger eingerichtet: Tägliche Aktualisierung um 8:00 Uhr.');
}

/**
 * Entfernt den automatischen Trigger.
 */
function automTriggerEntfernen() {
  var triggers = ScriptApp.getProjectTriggers();
  var entfernt = 0;
  for (var i = 0; i < triggers.length; i++) {
    if (triggers[i].getHandlerFunction() === 'auswertungAktualisieren') {
      ScriptApp.deleteTrigger(triggers[i]);
      entfernt++;
    }
  }
  Logger.log(entfernt + ' Trigger entfernt.');
}

// ===================== MASTER-SHEET ========================

function erstelleMasterSheet_() {
  // Prüfe ob Sheet schon existiert
  var files = DriveApp.getFilesByName(CONFIG.sheetName);
  if (files.hasNext()) {
    Logger.log('Master-Sheet existiert bereits, wird aktualisiert.');
    return SpreadsheetApp.open(files.next());
  }

  var ss = SpreadsheetApp.create(CONFIG.sheetName);
  Logger.log('Master-Sheet erstellt: ' + ss.getUrl());
  return ss;
}

// ===================== DATEN SAMMELN =======================

function sammleAlleDaten_(ss) {
  var formulare = findeAlleFormulare_();
  Logger.log(formulare.length + ' Formulare gefunden.');

  // Tab "Rohdaten" erstellen/leeren
  var rohdaten = getOderErstelleTab_(ss, 'Rohdaten');
  rohdaten.clear();

  // Header
  var header = [
    'Protokoll-ID', 'Protokoll-Titel', 'Tester-Name', 'Testdatum',
    'Gerät', 'Browser', 'Betriebssystem',
    'Aufgabe', 'Sektion', 'Bewertung',
    'Bemerkungen', 'Gesamtbewertung-Kategorie', 'Gesamtbewertung-Note',
    'Freitextkommentar', 'Tatsächliche Dauer', 'Zeitstempel'
  ];
  rohdaten.getRange(1, 1, 1, header.length).setValues([header]);
  rohdaten.getRange(1, 1, 1, header.length)
    .setFontWeight('bold')
    .setBackground('#4285f4')
    .setFontColor('white');
  rohdaten.setFrozenRows(1);

  var alleZeilen = [];

  for (var f = 0; f < formulare.length; f++) {
    var formInfo = formulare[f];
    try {
      var form = FormApp.openById(formInfo.id);
      var antworten = form.getResponses();
      Logger.log(formInfo.name + ': ' + antworten.length + ' Antworten');

      for (var a = 0; a < antworten.length; a++) {
        var zeilen = verarbeiteAntwort_(formInfo, form, antworten[a]);
        for (var z = 0; z < zeilen.length; z++) {
          alleZeilen.push(zeilen[z]);
        }
      }
    } catch (e) {
      Logger.log('Fehler bei ' + formInfo.name + ': ' + e.message);
    }
  }

  if (alleZeilen.length > 0) {
    rohdaten.getRange(2, 1, alleZeilen.length, header.length).setValues(alleZeilen);
  }

  // Auto-Breite
  for (var c = 1; c <= header.length; c++) {
    rohdaten.autoResizeColumn(c);
  }

  Logger.log(alleZeilen.length + ' Datensätze geschrieben.');
}

function findeAlleFormulare_() {
  var ordner = DriveApp.getFoldersByName(CONFIG.ordnerName);
  if (!ordner.hasNext()) {
    Logger.log('FEHLER: Ordner "' + CONFIG.ordnerName + '" nicht gefunden!');
    return [];
  }
  var folder = ordner.next();
  var dateien = folder.getFilesByType(MimeType.GOOGLE_FORMS);
  var formulare = [];

  while (dateien.hasNext()) {
    var datei = dateien.next();
    var name = datei.getName();
    if (name.indexOf(CONFIG.formPraefix) === 0) {
      formulare.push({ id: datei.getId(), name: name });
    }
  }

  // Sortieren nach TP-Nummer
  formulare.sort(function(a, b) {
    var numA = parseInt(a.name.replace(/\D/g, ''), 10);
    var numB = parseInt(b.name.replace(/\D/g, ''), 10);
    return numA - numB;
  });

  return formulare;
}

function verarbeiteAntwort_(formInfo, form, antwort) {
  var zeilen = [];
  var items = antwort.getItemResponses();
  var zeitstempel = antwort.getTimestamp();

  // Extrahiere Protokoll-ID und Titel aus dem Formularnamen
  var teile = formInfo.name.split(': ');
  var protokollId = teile[0] || formInfo.name;
  var protokollTitel = teile.length > 1 ? teile[1] : '';

  // Tester-Info extrahieren
  var testerName = '', testdatum = '', geraet = '', browser = '', os = '';
  var bemerkungen = {};
  var bewertungen = {};
  var freitext = '';
  var dauer = '';
  var gridAntworten = [];

  for (var i = 0; i < items.length; i++) {
    var item = items[i];
    var titel = item.getItem().getTitle();
    var antwortText = item.getResponse();

    // Tester-Info
    if (titel === 'Tester-Name') { testerName = antwortText; continue; }
    if (titel === 'Testdatum') { testdatum = antwortText; continue; }
    if (titel === 'Gerät') { geraet = antwortText; continue; }
    if (titel === 'Browser + Version') { browser = antwortText; continue; }
    if (titel === 'Betriebssystem') { os = antwortText; continue; }

    // Freitext
    if (titel === 'Freitextkommentar') { freitext = antwortText; continue; }
    if (titel.indexOf('tatsächlich gedauert') > -1) { dauer = antwortText; continue; }

    // Bemerkungen (pro Sektion)
    if (titel.indexOf('Bemerkungen') > -1) {
      var sekName = titel.replace(' — Bemerkungen', '');
      bemerkungen[sekName] = antwortText;
      continue;
    }

    // Grid-Bewertungen (Array von Antworten)
    if (titel.indexOf('Bewertung') > -1 && Array.isArray(antwortText)) {
      var sekName2 = titel.replace(' — Bewertung', '').replace(' (Teil 1)', '').replace(' (Teil 2)', '');
      var gridItem = item.getItem().asGridItem();
      var rows = gridItem.getRows();
      for (var r = 0; r < antwortText.length; r++) {
        if (antwortText[r]) {
          gridAntworten.push({
            sektion: sekName2,
            aufgabe: rows[r],
            bewertung: antwortText[r]
          });
        }
      }
      continue;
    }

    // Skalenbewertungen (1-5)
    if (item.getItem().getType() === FormApp.ItemType.SCALE) {
      bewertungen[titel] = antwortText;
      continue;
    }
  }

  // Zeilen für Grid-Aufgaben erstellen
  for (var g = 0; g < gridAntworten.length; g++) {
    var ga = gridAntworten[g];
    var sektionBemerkung = bemerkungen[ga.sektion] || '';
    zeilen.push([
      protokollId, protokollTitel, testerName, testdatum,
      geraet, browser, os,
      ga.aufgabe, ga.sektion, ga.bewertung,
      sektionBemerkung, '', '',
      '', '', zeitstempel
    ]);
  }

  // Zeilen für Gesamtbewertungen erstellen
  var bewertungKeys = Object.keys(bewertungen);
  for (var b = 0; b < bewertungKeys.length; b++) {
    zeilen.push([
      protokollId, protokollTitel, testerName, testdatum,
      geraet, browser, os,
      '', '', '',
      '', bewertungKeys[b], bewertungen[bewertungKeys[b]],
      freitext, dauer, zeitstempel
    ]);
    freitext = ''; // Nur einmal den Freitext eintragen
    dauer = '';
  }

  // Falls keine Grid-Antworten und keine Bewertungen: mindestens eine Zeile
  if (zeilen.length === 0) {
    zeilen.push([
      protokollId, protokollTitel, testerName, testdatum,
      geraet, browser, os,
      '', '', '',
      '', '', '',
      freitext, dauer, zeitstempel
    ]);
  }

  return zeilen;
}

// ===================== DASHBOARD ===========================

function erstelleDashboard_(ss) {
  var dash = getOderErstelleTab_(ss, 'Dashboard');
  dash.clear();

  var rohdaten = ss.getSheetByName('Rohdaten');
  if (!rohdaten || rohdaten.getLastRow() <= 1) {
    dash.getRange('A1').setValue('Noch keine Daten vorhanden. Warte auf Tester-Antworten.');
    return;
  }

  var daten = rohdaten.getDataRange().getValues();
  var header = daten[0];
  var rows = daten.slice(1);

  // ---- Kennzahlen berechnen ----

  // Einzigartige Tester
  var testerSet = {};
  var protokollSet = {};
  var bewertungCount = { 'OK': 0, 'TEILWEISE': 0, 'FEHLER': 0, 'Nicht getestet': 0 };
  var gesamtNoten = [];
  var protokollTester = {}; // { 'TP-01': { 'Max': true, 'Lisa': true } }

  for (var i = 0; i < rows.length; i++) {
    var row = rows[i];
    var pId = row[0];
    var tester = row[2];
    var bewertung = row[9];
    var note = row[12];

    if (tester) testerSet[tester] = true;
    if (pId) protokollSet[pId] = true;

    if (tester && pId) {
      if (!protokollTester[pId]) protokollTester[pId] = {};
      protokollTester[pId][tester] = true;
    }

    if (bewertung && bewertungCount.hasOwnProperty(bewertung)) {
      bewertungCount[bewertung]++;
    }

    if (note && !isNaN(note)) {
      gesamtNoten.push(Number(note));
    }
  }

  var anzTester = Object.keys(testerSet).length;
  var anzProtokolle = Object.keys(protokollSet).length;
  var durchschnittNote = gesamtNoten.length > 0
    ? (gesamtNoten.reduce(function(a, b) { return a + b; }, 0) / gesamtNoten.length).toFixed(1)
    : '-';

  var totalBewertungen = bewertungCount['OK'] + bewertungCount['TEILWEISE'] +
    bewertungCount['FEHLER'] + bewertungCount['Nicht getestet'];
  var fehlerQuote = totalBewertungen > 0
    ? (bewertungCount['FEHLER'] / totalBewertungen * 100).toFixed(1)
    : '0';

  // ---- Dashboard schreiben ----

  var z = 1; // aktuelle Zeile

  // Titel
  dash.getRange(z, 1).setValue('GUIDETRANSLATOR — TESTERGEBNIS-DASHBOARD');
  dash.getRange(z, 1).setFontSize(16).setFontWeight('bold');
  z += 1;
  dash.getRange(z, 1).setValue('Letzte Aktualisierung: ' + new Date().toLocaleString('de-DE'));
  dash.getRange(z, 1).setFontColor('#666666');
  z += 2;

  // Kennzahlen-Karten
  dash.getRange(z, 1).setValue('KENNZAHLEN');
  dash.getRange(z, 1).setFontSize(13).setFontWeight('bold');
  z += 1;

  var kennzahlen = [
    ['Aktive Tester', anzTester],
    ['Protokolle mit Antworten', anzProtokolle + ' / 30'],
    ['Durchschnittsnote (1-5)', durchschnittNote],
    ['Fehlerquote', fehlerQuote + ' %'],
    ['Aufgaben getestet', totalBewertungen],
    ['davon OK', bewertungCount['OK']],
    ['davon TEILWEISE', bewertungCount['TEILWEISE']],
    ['davon FEHLER', bewertungCount['FEHLER']],
    ['davon Nicht getestet', bewertungCount['Nicht getestet']]
  ];

  for (var k = 0; k < kennzahlen.length; k++) {
    dash.getRange(z, 1).setValue(kennzahlen[k][0]).setFontWeight('bold');
    dash.getRange(z, 2).setValue(kennzahlen[k][1]).setFontSize(12);
    // Farbcodierung
    if (kennzahlen[k][0] === 'davon OK') dash.getRange(z, 2).setFontColor('#0d904f');
    if (kennzahlen[k][0] === 'davon TEILWEISE') dash.getRange(z, 2).setFontColor('#f4b400');
    if (kennzahlen[k][0] === 'davon FEHLER') dash.getRange(z, 2).setFontColor('#db4437');
    z++;
  }
  z += 2;

  // Fortschritt pro Protokoll
  dash.getRange(z, 1).setValue('FORTSCHRITT PRO PROTOKOLL');
  dash.getRange(z, 1).setFontSize(13).setFontWeight('bold');
  z += 1;

  dash.getRange(z, 1).setValue('Protokoll');
  dash.getRange(z, 2).setValue('Anzahl Tester');
  dash.getRange(z, 3).setValue('Status');
  dash.getRange(z, 1, 1, 3).setFontWeight('bold').setBackground('#e8eaf6');
  z++;

  for (var p = 1; p <= 30; p++) {
    var pKey = 'TP-' + (p < 10 ? '0' + p : p);
    var anzahl = protokollTester[pKey] ? Object.keys(protokollTester[pKey]).length : 0;
    var status = anzahl === 0 ? 'Offen' : (anzahl >= 3 ? 'Ausreichend' : 'Braucht mehr Tester');
    var farbe = anzahl === 0 ? '#ffcdd2' : (anzahl >= 3 ? '#c8e6c9' : '#fff9c4');

    dash.getRange(z, 1).setValue(pKey);
    dash.getRange(z, 2).setValue(anzahl);
    dash.getRange(z, 3).setValue(status);
    dash.getRange(z, 1, 1, 3).setBackground(farbe);
    z++;
  }
  z += 2;

  // Bewertungsverteilung als Balken
  dash.getRange(z, 1).setValue('BEWERTUNGSVERTEILUNG');
  dash.getRange(z, 1).setFontSize(13).setFontWeight('bold');
  z += 1;

  var balkenDaten = [
    ['OK', bewertungCount['OK'], '#0d904f'],
    ['TEILWEISE', bewertungCount['TEILWEISE'], '#f4b400'],
    ['FEHLER', bewertungCount['FEHLER'], '#db4437'],
    ['Nicht getestet', bewertungCount['Nicht getestet'], '#9e9e9e']
  ];

  for (var bd = 0; bd < balkenDaten.length; bd++) {
    dash.getRange(z, 1).setValue(balkenDaten[bd][0]).setFontWeight('bold');
    dash.getRange(z, 2).setValue(balkenDaten[bd][1]);
    var prozent = totalBewertungen > 0
      ? (balkenDaten[bd][1] / totalBewertungen * 100).toFixed(0) + ' %'
      : '0 %';
    dash.getRange(z, 3).setValue(prozent);
    dash.getRange(z, 1, 1, 3).setBackground(balkenDaten[bd][2] + '22');
    z++;
  }

  // Auto-Breite
  dash.autoResizeColumn(1);
  dash.autoResizeColumn(2);
  dash.autoResizeColumn(3);

  // Dashboard als ersten Tab
  ss.setActiveSheet(dash);
  ss.moveActiveSheet(1);
}

// ===================== FEHLER-LISTE ========================

function erstelleFehlerListe_(ss) {
  var fehler = getOderErstelleTab_(ss, 'Fehler + Probleme');
  fehler.clear();

  var rohdaten = ss.getSheetByName('Rohdaten');
  if (!rohdaten || rohdaten.getLastRow() <= 1) {
    fehler.getRange('A1').setValue('Noch keine Daten vorhanden.');
    return;
  }

  var daten = rohdaten.getDataRange().getValues();
  var rows = daten.slice(1);

  // Header
  var header = ['Protokoll', 'Sektion', 'Aufgabe', 'Bewertung', 'Tester', 'Gerät', 'Browser', 'Bemerkungen'];
  fehler.getRange(1, 1, 1, header.length).setValues([header]);
  fehler.getRange(1, 1, 1, header.length)
    .setFontWeight('bold')
    .setBackground('#db4437')
    .setFontColor('white');
  fehler.setFrozenRows(1);

  var fehlerZeilen = [];

  for (var i = 0; i < rows.length; i++) {
    var row = rows[i];
    var bewertung = row[9];
    if (bewertung === 'FEHLER' || bewertung === 'TEILWEISE') {
      fehlerZeilen.push([
        row[0],           // Protokoll-ID
        row[8],           // Sektion
        row[7],           // Aufgabe
        bewertung,        // Bewertung
        row[2],           // Tester
        row[4],           // Gerät
        row[5],           // Browser
        row[10]           // Bemerkungen
      ]);
    }
  }

  // Sortieren: FEHLER zuerst, dann TEILWEISE
  fehlerZeilen.sort(function(a, b) {
    if (a[3] === 'FEHLER' && b[3] !== 'FEHLER') return -1;
    if (a[3] !== 'FEHLER' && b[3] === 'FEHLER') return 1;
    return a[0].localeCompare(b[0]);
  });

  if (fehlerZeilen.length > 0) {
    fehler.getRange(2, 1, fehlerZeilen.length, header.length).setValues(fehlerZeilen);

    // Bedingte Formatierung
    for (var fz = 0; fz < fehlerZeilen.length; fz++) {
      var bg = fehlerZeilen[fz][3] === 'FEHLER' ? '#ffcdd2' : '#fff9c4';
      fehler.getRange(fz + 2, 1, 1, header.length).setBackground(bg);
    }
  } else {
    fehler.getRange(2, 1).setValue('Keine Fehler gemeldet.');
  }

  // Auto-Breite
  for (var c = 1; c <= header.length; c++) {
    fehler.autoResizeColumn(c);
  }

  Logger.log(fehlerZeilen.length + ' Fehler/Teilweise gefunden.');
}

// ===================== TESTER-ÜBERSICHT ====================

function erstelleTesterUebersicht_(ss) {
  var tab = getOderErstelleTab_(ss, 'Tester-Übersicht');
  tab.clear();

  var rohdaten = ss.getSheetByName('Rohdaten');
  if (!rohdaten || rohdaten.getLastRow() <= 1) {
    tab.getRange('A1').setValue('Noch keine Daten vorhanden.');
    return;
  }

  var daten = rohdaten.getDataRange().getValues();
  var rows = daten.slice(1);

  // Tester-Daten sammeln
  var tester = {}; // { 'Max': { protokolle: { 'TP-01': true }, geraet: 'iPhone', noten: [4,5,3] } }

  for (var i = 0; i < rows.length; i++) {
    var row = rows[i];
    var name = row[2];
    var pId = row[0];
    var note = row[12];

    if (!name) continue;

    if (!tester[name]) {
      tester[name] = {
        protokolle: {},
        geraet: row[4],
        browser: row[5],
        os: row[6],
        noten: []
      };
    }

    if (pId) tester[name].protokolle[pId] = true;
    if (note && !isNaN(note)) tester[name].noten.push(Number(note));
  }

  // Header
  var header = ['Tester', 'Protokolle erledigt', 'von 30', 'Fortschritt', 'Ø Note', 'Gerät', 'Browser', 'OS'];
  tab.getRange(1, 1, 1, header.length).setValues([header]);
  tab.getRange(1, 1, 1, header.length)
    .setFontWeight('bold')
    .setBackground('#4285f4')
    .setFontColor('white');
  tab.setFrozenRows(1);

  var testerNamen = Object.keys(tester).sort();
  var z = 2;

  for (var t = 0; t < testerNamen.length; t++) {
    var n = testerNamen[t];
    var info = tester[n];
    var anzProtokolle = Object.keys(info.protokolle).length;
    var fortschritt = (anzProtokolle / 30 * 100).toFixed(0) + ' %';
    var avgNote = info.noten.length > 0
      ? (info.noten.reduce(function(a, b) { return a + b; }, 0) / info.noten.length).toFixed(1)
      : '-';

    tab.getRange(z, 1).setValue(n);
    tab.getRange(z, 2).setValue(anzProtokolle);
    tab.getRange(z, 3).setValue(30);
    tab.getRange(z, 4).setValue(fortschritt);
    tab.getRange(z, 5).setValue(avgNote);
    tab.getRange(z, 6).setValue(info.geraet);
    tab.getRange(z, 7).setValue(info.browser);
    tab.getRange(z, 8).setValue(info.os);

    // Farbe je nach Fortschritt
    var bg = anzProtokolle >= 25 ? '#c8e6c9' : (anzProtokolle >= 10 ? '#fff9c4' : '#ffcdd2');
    tab.getRange(z, 1, 1, header.length).setBackground(bg);
    z++;
  }

  if (testerNamen.length === 0) {
    tab.getRange(2, 1).setValue('Noch keine Tester-Antworten.');
  }

  // Auto-Breite
  for (var c = 1; c <= header.length; c++) {
    tab.autoResizeColumn(c);
  }
}

// ===================== HILFSFUNKTIONEN =====================

function getOderErstelleTab_(ss, name) {
  var tab = ss.getSheetByName(name);
  if (tab) return tab;
  tab = ss.insertSheet(name);
  return tab;
}
