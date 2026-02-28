# Anleitung: Testprotokolle als Google Forms erstellen

## Was macht das Script?

Das Script `google-forms-generator.gs` erstellt automatisch **alle 30 Testprotokolle** als separate Google Forms in deinem Google Drive. Jedes Formular enthält:

- Tester-Informationsfelder (Name, Datum, Gerät, Browser, OS)
- Alle Testaufgaben als Bewertungsraster (OK / Teilweise / Fehler / Nicht getestet)
- Bemerkungsfelder pro Abschnitt
- Bewertungsskalen (1–5) am Ende
- Freitextkommentar

---

## Schritt-für-Schritt Anleitung

### 1. Google Apps Script öffnen

1. Gehe zu **[script.google.com](https://script.google.com)**
2. Melde dich mit deinem Google-Konto an
3. Klicke auf **„Neues Projekt"** (oben links)

### 2. Script einfügen

1. Lösche den bestehenden Inhalt im Editor (die leere `function myFunction()`)
2. Öffne die Datei `testprotokolle/google-forms-generator.gs` aus diesem Repository
3. **Kopiere den gesamten Inhalt** und füge ihn in den Script-Editor ein
4. Benenne das Projekt oben um in: `GuideTranslator Testprotokolle Generator`
5. Klicke auf **💾 Speichern** (oder Strg+S)

### 3. Alle 30 Formulare auf einmal erstellen

1. Wähle im Dropdown oben die Funktion **`erstelleAlleFormulare`**
2. Klicke auf **▶ Ausführen**
3. Beim **ersten Mal** fragt Google nach Berechtigungen:
   - Klicke auf **„Berechtigungen überprüfen"**
   - Wähle dein Google-Konto
   - Es kommt eine Warnung „App nicht überprüft" → Klicke auf **„Erweitert"** → **„Zu [Projektname] wechseln (unsicher)"**
   - Erlaube den Zugriff auf Google Drive und Google Forms
4. Das Script läuft jetzt durch und erstellt alle Formulare
5. Im **Ausführungsprotokoll** (unten) siehst du die URLs aller erstellten Formulare

> **Hinweis:** Die Erstellung aller 30 Formulare dauert ca. 2–5 Minuten.

### 4. Falls Timeout auftritt (Alternative: Batch-Modus)

Google Apps Script hat ein Zeitlimit von ~6 Minuten. Falls das Script abbricht:

1. Wähle stattdessen **`erstelleBatch1`** → Ausführen (erstellt TP-01 bis TP-05)
2. Dann **`erstelleBatch2`** → Ausführen (erstellt TP-06 bis TP-10)
3. Weiter mit **`erstelleBatch3`** bis **`erstelleBatch6`**

So werden je 5 Formulare pro Durchlauf erstellt, was innerhalb des Zeitlimits liegt.

### 5. Formulare finden

Alle erstellten Formulare befinden sich in deinem Google Drive im Ordner:

📁 **GuideTranslator Testprotokolle**

Du findest sie auch über:
- **[drive.google.com](https://drive.google.com)** → Ordner „GuideTranslator Testprotokolle"
- Oder direkt über die URLs im Ausführungsprotokoll

### 6. Formulare an Tester verteilen

Für jedes Formular:

1. Öffne das Formular in Google Forms
2. Klicke auf **„Senden"** (oben rechts)
3. Wähle das **Link-Symbol** (🔗)
4. Optional: **„URL kürzen"** aktivieren
5. Link kopieren und an die Tester senden

**Oder als E-Mail:**
1. Klicke auf **„Senden"** → **E-Mail-Tab**
2. Trage die E-Mail-Adressen der Tester ein
3. Klicke auf **„Senden"**

### 7. Antworten auswerten

- Öffne ein Formular → Tab **„Antworten"**
- Klicke auf das **Google-Sheets-Symbol** (grün) um alle Antworten als Tabelle zu sehen
- Jeder Tester, der das Formular ausfüllt, erscheint als neue Zeile

---

## Tipps

- **Formulare bearbeiten**: Öffne jedes Formular in Google Forms und passe es nach Bedarf an (Reihenfolge, zusätzliche Fragen, Design)
- **Formular-Design**: Unter „Design anpassen" (🎨) kannst du Farben und Header-Bild ändern
- **Antworten begrenzen**: Unter Einstellungen (⚙️) → „Auf eine Antwort pro Person begrenzen"
- **Erneut ausführen**: Wenn du das Script nochmal ausführst, werden neue Formulare erstellt (keine Duplikatsprüfung). Lösche ggf. vorher die alten.

---

## Fehlerbehebung

| Problem | Lösung |
|---------|--------|
| „Berechtigung erforderlich" | Berechtigungen erteilen (siehe Schritt 3) |
| „Zeitlimit überschritten" | Batch-Funktionen verwenden (siehe Schritt 4) |
| Formulare nicht sichtbar | In Google Drive nach „GuideTranslator Testprotokolle" suchen |
| Script-Fehler | Ausführungsprotokoll prüfen (Ansicht → Protokolle) |
