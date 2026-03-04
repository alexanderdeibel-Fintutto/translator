# Anleitung: Testergebnisse automatisch auswerten

## Was macht das Script?

Das Script `google-forms-auswertung.gs` sammelt **automatisch alle Antworten** aus den 30 Google Forms und erstellt ein übersichtliches Google Sheet mit 4 Tabs:

| Tab | Inhalt |
|-----|--------|
| **Dashboard** | Kennzahlen, Fortschritt pro Protokoll, Bewertungsverteilung |
| **Rohdaten** | Alle einzelnen Antworten aller Tester (die "Datenbank") |
| **Fehler + Probleme** | Nur FEHLER und TEILWEISE — sortiert, farbcodiert, mit Bemerkungen |
| **Tester-Übersicht** | Welcher Tester hat wie viele Protokolle erledigt? Ø Note? |

---

## Schritt-für-Schritt

### 1. Neues Google Apps Script Projekt

1. Gehe zu **[script.google.com](https://script.google.com)**
2. Klicke auf **"Neues Projekt"**
3. **WICHTIG:** Erstelle ein NEUES Projekt (nicht das gleiche wie der Generator!)

### 2. Script einfügen

1. Lösche den vorhandenen Code
2. Kopiere den gesamten Inhalt von `testprotokolle/google-forms-auswertung.gs`
3. Füge ihn ein
4. Benenne das Projekt um in: `GuideTranslator Auswertung`
5. Speichern (Strg+S)

### 3. Erstmalig ausführen

1. Wähle im Dropdown oben: **`auswertungStarten`**
2. Klicke auf **▶ Ausführen**
3. Berechtigung erteilen (wie beim Generator)
4. Im Log siehst du den Link zum erstellten Google Sheet

### 4. Später aktualisieren

Wenn neue Tester-Antworten reingekommen sind:

1. Wähle im Dropdown: **`auswertungAktualisieren`**
2. Klicke auf **▶ Ausführen**
3. Fertig — das Sheet wird mit den neuesten Daten aktualisiert

### 5. Optional: Automatische tägliche Aktualisierung

Wenn du nicht manuell aktualisieren willst:

1. Wähle im Dropdown: **`automTriggerEinrichten`**
2. Klicke auf **▶ Ausführen**
3. Ab jetzt wird das Sheet **jeden Tag um 8:00 Uhr** automatisch aktualisiert

Zum Deaktivieren: `automTriggerEntfernen` ausführen.

---

## Was du im Sheet siehst

### Tab "Dashboard"

```
GUIDETRANSLATOR — TESTERGEBNIS-DASHBOARD
Letzte Aktualisierung: 04.03.2026, 10:30

KENNZAHLEN
Aktive Tester            5
Protokolle mit Antworten 18 / 30
Durchschnittsnote (1-5)  3.8
Fehlerquote              12.3 %
Aufgaben getestet        342
davon OK                 267
davon TEILWEISE          33
davon FEHLER             42

FORTSCHRITT PRO PROTOKOLL
TP-01    3 Tester    ✅ Ausreichend
TP-02    2 Tester    ⚠️ Braucht mehr Tester
TP-03    0 Tester    ❌ Offen
...
```

### Tab "Fehler + Probleme"

Zeigt nur die Zeilen wo Tester "FEHLER" oder "TEILWEISE" gewählt haben:

| Protokoll | Sektion | Aufgabe | Bewertung | Tester | Gerät | Bemerkungen |
|-----------|---------|---------|-----------|--------|-------|-------------|
| TP-01 | B — Sprachauswahl | Tausch-Button tauscht Sprachen | FEHLER | Max | iPhone 14 | Button reagiert nicht beim ersten Klick |
| TP-03 | A — TTS Grundlagen | Abspielen-Button startet Sprache | TEILWEISE | Lisa | Pixel 8 | Funktioniert nur auf Englisch |

### Tab "Tester-Übersicht"

| Tester | Protokolle erledigt | von 30 | Fortschritt | Ø Note |
|--------|--------------------:|-------:|-------------|-------:|
| Max    | 12 | 30 | 40 % | 3.8 |
| Lisa   | 8 | 30 | 27 % | 4.2 |

---

## Tipps

- **Aktualisiere regelmäßig** — das Script holt immer die neuesten Antworten
- **Tab "Fehler + Probleme"** ist dein wichtigstes Werkzeug — dort siehst du sofort was kaputt ist
- **Filtern:** In Google Sheets kannst du auf jeder Spalte filtern (Daten → Filter erstellen), z.B. nur FEHLER von TP-06
- **Diagramme:** Markiere Daten im Dashboard und klicke Einfügen → Diagramm für visuelle Darstellungen
