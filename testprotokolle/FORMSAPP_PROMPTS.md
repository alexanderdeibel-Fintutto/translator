# Forms.app KI-Prompts — GuideTranslator Testprotokolle
# Jeder Prompt ist unter 3000 Zeichen. Kopiere den Text zwischen den --- Markern.

---
## TP-01: Basis-Übersetzung

Erstelle ein Testformular für eine Übersetzer-App. Titel: "TP-01: Basis-Übersetzung (Texteingabe)". Dauer: 12 Min.

Seite 1 - Tester-Info: Name (Text), Datum (Datum), Gerät (Text), Browser+Version (Text), Betriebssystem (Text)

Seite 2 - Grundlegende Übersetzung (Bewertung: OK/FEHLER/TEILWEISE + Bemerkung je Aufgabe):
- Übersetzer-Seite wird standardmäßig angezeigt
- Quellsprache voreingestellt auf Deutsch
- Zielsprache voreingestellt auf Englisch
- "Guten Morgen, wie geht es Ihnen?" eingeben → Übersetzung erscheint automatisch
- Übersetzung < 3 Sekunden
- Zeichenanzahl wird angezeigt
- Provider-Badge sichtbar (Google/MyMemory)

Seite 3 - Sprachauswahl:
- Quellsprache klicken → Dropdown öffnet
- Suchfeld: "Tür" → Türkisch gefiltert
- Sprache auf Französisch wechseln → Übersetzung aktualisiert
- Tausch-Button (↔) tauscht Sprachen
- Zielsprache Arabisch → arabische Schrift
- Zielsprache Japanisch → japanische Zeichen
- Mindestens 40 Sprachen vorhanden

Seite 4 - Kopieren & Löschen:
- Kopieren-Button → Text in Zwischenablage
- Häkchen-Feedback nach Kopieren
- Löschen-Button → Eingabe geleert
- Übersetzung verschwindet nach Löschen

Seite 5 - Verschiedene Texte:
- Kurzer Text "Hallo" → sinnvoll
- Langer Text (5+ Sätze) → vollständig
- Sonderzeichen "19,99€ — inkl. MwSt." → korrekt
- Leeres Feld → kein Fehler
- Schnelles Tippen → kein Springen

Seite 6 - Migrationssprachen:
- Farsi → persische Schrift
- Ukrainisch → kyrillisch
- Tigrinya → äthiopische Schrift
- Kurdisch → Übersetzung erscheint

Seite 7 - Gesamtbewertung: Skala 1-5 für: Geschwindigkeit, Qualität, Benutzerfreundlichkeit, Sprachauswahl, Gesamteindruck. Plus Freitextfeld.

---
## TP-02: Spracheingabe (STT)

Erstelle ein Testformular für Spracheingabe einer Übersetzer-App. Titel: "TP-02: Spracheingabe (Speech-to-Text)". Dauer: 12 Min.

Seite 1 - Tester-Info: Name, Datum, Gerät, Browser+Version, OS

Seite 2 - Mikrofon-Aktivierung (je OK/FEHLER/TEILWEISE + Bemerkung):
- Mikrofon-Button sichtbar
- Klick → Browser fragt Berechtigung
- Berechtigung erteilen → Aufnahme startet (roter Indikator)
- Erneut klicken → Aufnahme stoppt

Seite 3 - Erkennung Deutsch:
- Quellsprache DE, sagen: "Ich möchte einen Kaffee bestellen"
- Interim-Text erscheint live
- Text wird als final übernommen
- Übersetzung erscheint automatisch
- Erkannter Text stimmt inhaltlich

Seite 4 - Andere Sprachen:
- Englisch: "Where is the nearest hospital?" → korrekt
- Französisch: "Bonjour, comment allez-vous?" → korrekt
- Spanisch: "Buenos días, necesito ayuda" → korrekt
- Türkisch: "Merhaba, yardıma ihtiyacım var" → korrekt

Seite 5 - Streaming:
- Mehrere Sätze → einzeln erkannt
- Pause mitten im Satz → wartet weiter
- 20+ Sek. sprechen → vollständig erfasst
- Leise Umgebung: zuverlässig
- Hintergrundgeräusche: akzeptabel

Seite 6 - Fehlerfälle:
- Berechtigung verweigern → Fehlermeldung
- 10 Sek. nichts sagen → kein Absturz
- Seite wechseln → Aufnahme stoppt sauber
- Schnell ein/aus → kein Absturz

Seite 7 - Bewertung 1-5: Genauigkeit DE, Genauigkeit Fremdsprachen, Reaktionszeit, Fehlerbehandlung, Gesamt. Freitext.

---
## TP-03: Sprachausgabe (TTS)

Testformular: "TP-03: Sprachausgabe (Text-to-Speech)". 12 Min.

Tester-Info: Name, Datum, Gerät, Browser, OS

Manuelle Sprachausgabe (OK/FEHLER/TEILWEISE + Bemerkung):
- DE→EN übersetzen, Lautsprecher-Button → Audio spielt
- Aussprache verständlich und natürlich
- TTS-Engine-Badge sichtbar (Cloud/Browser)
- Stop-Button → Audio stoppt sofort
- Quelltext-Lautsprecher → Quelltext wird vorgelesen

Auto-Speak:
- Standardmäßig aktiviert
- Text → Übersetzung wird automatisch vorgelesen
- Deaktivieren → NICHT vorgelesen
- Wieder aktivieren → wieder vorgelesen

HD Voice:
- HD-Voice-Toggle aktivieren
- Stimme klingt hochwertiger
- Deaktivieren → Standard-Stimme

Verschiedene Sprachen TTS:
- Englisch, Französisch, Arabisch, Japanisch, Türkisch, Hindi → je korrekte Aussprache

Edge Cases:
- 100+ Wörter → spielt vollständig
- 3x schnell klicken → kein Chaos
- Neue Übersetzung → alte stoppt
- Gerät stumm → kein App-Fehler

Bewertung 1-5: Qualität Standard, Qualität HD, Auto-Speak, Sprachvielfalt, Gesamt. Freitext.

---
## TP-04: Formality & History

Testformular: "TP-04: Sie/Du, Quick Phrases & Verlauf". 12 Min.

Tester-Info: Name, Datum, Gerät, Browser, OS

Sie/Du (OK/FEHLER/TEILWEISE + Bemerkung):
- Toggle finden
- Ziel DE, Toggle Sie: "How are you?" → enthält Sie/Ihnen
- Toggle Du → enthält du/dir
- Ziel FR, Du → tu/toi statt vous
- Ziel Japanisch → Toggle ausgeblendet
- Zurück DE → Toggle erscheint

Quick Phrases:
- Sektion unter Übersetzer finden
- Verschiedene Kategorien vorhanden
- Phrase klicken → ins Eingabefeld
- Übersetzung startet automatisch
- Kategorien durchklicken → verschiedene Phrasen

Verlauf:
- 3+ Übersetzungen durchführen
- Verlauf zeigt letzte Übersetzungen
- Sprachpaar bei jedem Eintrag
- Eintrag klicken → wiederhergestellt
- Einzeln löschen → nur dieser weg
- Alles löschen → komplett leer
- Seite neu laden → Verlauf bleibt

Bewertung 1-5: Sie/Du, Quick Phrases, Verlauf, Gesamt. Freitext.

---
## TP-05: Satz- vs. Absatzmodus

Testformular: "TP-05: Satz- vs. Absatzmodus". 10 Min.

Tester-Info: Name, Datum, Gerät, Browser, OS

Satzmodus (OK/FEHLER/TEILWEISE + Bemerkung):
- Satzmodus auswählen (Zap-Icon)
- Tooltip: "Jeder Satz wird sofort übersetzt"
- "Hallo. Wie geht es?" → jeder Satz sofort einzeln übersetzt
- Mikrofon: Satz wird sofort nach Satzende übersetzt

Absatzmodus:
- Absatzmodus auswählen (AlignLeft-Icon)
- Tooltip: "Text sammeln, dann Senden"
- Mehrere Sätze → NICHT automatisch übersetzt
- Senden-Button sichtbar
- Senden → Block wird übersetzt
- Mikrofon: Text sammelt sich bis Senden

Moduswechsel:
- Satz→Absatz: Text bleibt erhalten
- Absatz→Satz: kein Fehler
- Seite neu laden → Modus gespeichert

Tastenkombination:
- Hinweis "Ctrl+Enter / Esc" sichtbar
- Ctrl+Enter → sofortige Übersetzung
- Esc → Text gelöscht

Bewertung 1-5: Satzmodus, Absatzmodus, Wechsel, Gesamt. Freitext.

---
## TP-06: Live Session — Speaker (Cloud)

Testformular: "TP-06: Live Session — Speaker (Cloud)". 15 Min. Benötigt 2 Geräte.

Tester-Info: Name, Datum, Speaker-Gerät, Listener-Gerät, Browser Speaker, Browser Listener

Session erstellen (OK/FEHLER/TEILWEISE + Bemerkung):
- Navigation → Live
- Speaker/Listener Auswahl sichtbar
- Speaker wählen, Quellsprache Deutsch
- Cloud-Modus wählen
- Session-Code angezeigt (z.B. "TR-A3K9")
- QR-Code angezeigt
- Status zeigt "Cloud"

Listener beitreten:
- 2. Gerät: Live → Listener
- Code eingeben oder QR scannen
- Zielsprache EN, beitreten
- Speaker sieht Listener-Anzahl = 1
- Aufschlüsselung nach Sprache

Sprechen & Übersetzen:
- Aufnahme starten (Mikrofon)
- Roter Indikator sichtbar
- Sagen: "Willkommen an Bord. Heute besuchen wir die Altstadt."
- Speaker: Transkript in Echtzeit
- Listener: Übersetzung in Zielsprache
- Latenzanzeige beim Speaker
- Gesamtlatenz < 5 Sekunden

Pause/Fortsetzen:
- Pause → Aufnahme stoppt
- Sprechen → wird NICHT erfasst
- Fortsetzen → geht weiter

Session beenden:
- Beenden klicken
- Listener erhält "Session beendet"
- Speaker zurück zur Landing
- Listener zum Verlassen aufgefordert

Bewertung 1-5: Erstellung, QR/Beitritt, Echtzeit, Latenz, Beendigung, Gesamt. Freitext.

---
## TP-07: Live Session — Listener (Cloud)

Testformular: "TP-07: Live Session — Listener". 12 Min. Benötigt laufende Speaker-Session.

Tester-Info: Name, Datum, Gerät, Browser, OS

Beitreten (OK/FEHLER/TEILWEISE + Bemerkung):
- Live → Listener
- Session-Code manuell eingeben → Beitritt
- Alternativ: QR-Code scannen → auto Beitritt
- Zielsprache wählen
- Status "Verbunden"

Übersetzungen empfangen:
- Speaker spricht → Übersetzung erscheint
- Groß und gut lesbar
- Neue ersetzen vorherige
- Verlauf scrollbar
- "Warte auf Übersetzung..." wenn Speaker still

Auto-TTS:
- Toggle prüfen
- Speaker spricht → Listener hört Übersetzung
- Deaktivieren → nicht vorgelesen
- Aktivieren → wieder vorgelesen

Sprache wechseln:
- Sprach-Chips sichtbar
- EN→FR wechseln → nächste auf Französisch
- Speaker-Sprache nicht wählbar

Fullscreen-Untertitel:
- Toggle aktivieren
- Schwarzer Bildschirm, großer Text
- 3-5 Untertitel mit Fade
- Neue prominent
- Verlassen → normale Ansicht

Bewertung 1-5: Beitritt, Empfang, Auto-TTS, Fullscreen, Gesamt. Freitext.

---
## TP-08: Live Session — Multi-Listener

Testformular: "TP-08: Multi-Listener & Multi-Sprache". 15 Min. 3+ Geräte.

Tester-Info: Name, Datum, Gerät 1-4

Setup (OK/FEHLER/TEILWEISE + Bemerkung):
- Speaker: Session Cloud, Deutsch
- Listener 1: Englisch beitreten
- Listener 2: Französisch beitreten
- Listener 3 (opt): Türkisch
- Speaker sieht korrekte Anzahl
- Aufschlüsselung nach Sprache

Parallele Übersetzung:
- Speaker: "Wir fahren jetzt in den Hafen."
- Listener 1 EN: englisch
- Listener 2 FR: französisch
- Listener 3 TR: türkisch
- Jeder NUR seine Sprache
- Ungefähr gleichzeitig

Dynamisch:
- Listener 2 verlässt → Anzahl aktualisiert
- Speaker spricht → L1 empfängt weiter
- L2 erneut (Spanisch) → aktualisiert
- L2 erhält jetzt spanisch

Sprachwechsel:
- L1: EN→Arabisch
- Nächste auf Arabisch
- Speaker-Anzeige aktualisiert

Stresstest:
- 5 Sätze schnell → alle bei allen
- Keine verloren (Queue)
- Reihenfolge stimmt

Bewertung 1-5: Stabilität, Parallelität, Dynamik, Sprachwechsel, Gesamt. Freitext.

---
## TP-09: Live Session — Lokales WiFi

Testformular: "TP-09: Lokales WiFi (Router-Modus)". 15 Min. Router + 2 Geräte.

Tester-Info: Name, Datum, Router-Modell, Router-IP, Speaker-Gerät, Listener-Gerät

Vorbereitung (OK/FEHLER/TEILWEISE + Bemerkung):
- Relay-Server Port 8765 läuft
- Beide Geräte im Router-WLAN
- Health-Check: http://<ip>:8765/health antwortet

Session lokal:
- Speaker → "Lokales WiFi"
- Auto-Discovery findet Server
- Session erstellt, Code angezeigt
- QR enthält ?ws=ws://<ip>:8765
- Anzeige "Lokal"

Listener lokal:
- QR scannen oder Link öffnen
- Lokaler WebSocket (nicht Cloud)
- Verbunden, Speaker sieht Listener

Übersetzung lokal:
- Speaker spricht → Übersetzung kommt
- Latenz < 3 Sek
- Mehrere Sätze korrekt

Ohne Internet:
- Router-Internet trennen
- WebSocket bleibt bestehen
- Offline-Modelle oder Fehlermeldung

Bewertung 1-5: Discovery, Stabilität, Latenz, Ohne-Internet, Gesamt. Freitext.

---
## TP-10: Live Session — Hotspot

Testformular: "TP-10: Hotspot-Modus". 15 Min. 2 Smartphones.

Tester-Info: Name, Datum, Speaker-Gerät, Listener-Gerät, OS je

Hotspot (OK/FEHLER/TEILWEISE + Bemerkung):
- Speaker → "Hotspot" Modus
- Android: Auto-Hotspot mit SSID+Passwort
- iOS: Hinweis manueller Hotspot
- WiFi-QR-Code angezeigt
- SSID+Passwort als Text

Listener verbindet:
- WiFi-QR scannen → auto verbindet
- Oder manuell SSID+Passwort
- Im Hotspot-Netzwerk

Session beitreten:
- Session-QR (Schritt 2)
- Listener scannt/gibt Code ein
- Lokaler WebSocket
- Speaker sieht Listener

Übersetzung:
- Speaker spricht → Übersetzung kommt
- Auch ohne Internet (Offline-Modelle)
- Mehrere Sätze korrekt

Stabilität:
- 5 Min ununterbrochen stabil
- Gerät sperren/entsperren → hält
- Session sauber beenden

Bewertung 1-5: Erstellung, WiFi-QR, Qualität, Stabilität, Gesamt. Freitext.

---
## TP-11: Live Session — BLE

Testformular: "TP-11: Bluetooth (BLE Direct)". 15 Min. 2 Smartphones nativ.

Tester-Info: Name, Datum, Speaker-Gerät, Listener-Gerät, OS+Version je

BLE-Vorbereitung (OK/FEHLER/TEILWEISE + Bemerkung):
- Bluetooth auf beiden Geräten an
- Bluetooth-Berechtigung erteilt
- "BLE" Modus verfügbar

Speaker BLE:
- BLE wählen → Session erstellt
- GATT-Server startet
- Advertising beginnt
- Session-Code/Name angezeigt

Listener Discovery:
- Listener → BLE wählen
- BLE-Scan startet
- Speaker in Liste mit RSSI
- Signalstärke 3-stufig
- Antippen → Verbindung

Übersetzung BLE:
- Speaker spricht → via BLE beim Listener
- Text korrekt (keine Zeichenfehler)
- 100+ Zeichen: fragmentiert+reassembliert
- Ohne Internet möglich

Reichweite:
- 1m: stabil
- 5m: stabil
- 10+m: möglich?
- Reconnect bei Abbruch

Bewertung 1-5: Discovery, Verbindung, Qualität, Reichweite, Gesamt. Freitext.

---
## TP-12: Session-Protokoll Export

Testformular: "TP-12: Protokoll-Export". 10 Min.

Tester-Info: Name, Datum, Gerät, Browser

Erstellung (OK/FEHLER/TEILWEISE + Bemerkung):
- Session mit 5+ Sätzen durchführen
- "Protokoll herunterladen" Button sichtbar

TXT-Export:
- TXT herunterladen → Datei kommt
- Enthält: Session-Code
- Enthält: Datum+Uhrzeit
- Enthält: Dauer
- Enthält: Quellsprache
- Enthält: Listener-Anzahl
- Enthält: Chronologische Liste mit Zeitstempeln
- Enthält: Quelltext + Übersetzung
- Reihenfolge stimmt

Markdown-Export:
- MD herunterladen → Datei kommt
- Formatierung korrekt (Tabellen, Überschriften)
- In Viewer professionell

Edge Cases:
- Während laufender Session → bisherige Einträge
- Nach Session-Ende → vollständig
- Leere Session → Hinweis

Bewertung 1-5: Funktionalität, Vollständigkeit, Formatierung, Gesamt. Freitext.

---
## TP-13: Konversationsmodus

Testformular: "TP-13: Konversation (Face-to-Face)". 12 Min.

Tester-Info: Name, Datum, Gerät, Browser, OS

Seite öffnen (OK/FEHLER/TEILWEISE + Bemerkung):
- Navigation → Konversation
- Obere Hälfte 180° gedreht (für Gegenüber)
- Untere Hälfte normal
- Trennlinie mit Neustart-Button

Sprachen:
- Person 1 oben: Deutsch
- Person 2 unten: Englisch
- Unabhängig wählbar
- Tausch-Button funktioniert

Bidirektional:
- P1 DE: "Wo ist das Restaurant?" → P2 sieht EN
- P2 EN: "Around the corner" → P1 sieht DE
- Nur eine Person gleichzeitig

Auto-Speak, Nachrichtenverlauf:
- Auto-Speak für beide Seiten
- 3+ Nachrichten → Verlauf sichtbar
- Eigene: blau, Empfangene: grau
- Zeitstempel, Max 6 pro Seite

Edge Cases: Neustart, Landscape, gleiche Sprache

Bewertung 1-5: Layout, Bidirektional, Bedienbarkeit, Gesamt. Freitext.

---
## TP-14: Kamera-Übersetzer (OCR)

Testformular: "TP-14: Kamera-Übersetzer". 12 Min. Smartphone + gedruckte Texte.

Tester-Info: Name, Datum, Gerät, Browser, OS

Seite (OK/FEHLER/TEILWEISE + Bemerkung):
- Navigation → Kamera
- Kamera-Interface sichtbar
- Sprachpaar-Auswahl
- Ohne API-Key: Warnhinweis

Foto:
- Kamera-Berechtigung angefragt
- Foto von deutschem Text
- Bildvorschau
- "Text wird extrahiert..."
- Extrahierter Text angezeigt
- Stimmt mit Original überein

Übersetzung:
- Auto nach OCR
- Übersetzte Version angezeigt
- Kopieren-Button
- Sprechen-Button

Galerie: Upload → OCR+Übersetzung funktioniert

Verschiedene Texte:
- Englisch → DE korrekt
- Gedruckt: hohe Genauigkeit
- Handschrift: versucht
- Schlechte Beleuchtung: Hinweis
- Bild ohne Text: "Kein Text"

Bewertung 1-5: OCR, Übersetzung, Bedienbarkeit, Geschwindigkeit, Gesamt. Freitext.

---
## TP-15: Phrasebook

Testformular: "TP-15: Phrasebook". 12 Min.

Tester-Info: Name, Datum, Gerät, Browser, OS

Seite (OK/FEHLER/TEILWEISE + Bemerkung):
- Navigation → Phrasebook
- Titel+Beschreibung
- Zielsprach-Auswahl
- Kategorie-Filter (Alle, Behörde, Arzt, etc.)

Sprache+Kategorie:
- Arabisch → arabische Phrasen
- Kategorie "Arzt" → nur medizinische
- Kategorie "Behörde" → nur rechtliche
- "Alle" → alle Phrasen
- Türkisch → aktualisiert
- Farsi → RTL

Einzelne Phrasen:
- Klick → Übersetzung
- Sprechen-Button
- Kategorie-Tag

Batch:
- "Alle übersetzen" → Fortschrittsbalken
- Alle übersetzt
- Sprache wechseln → erneuter Batch

Sprachen: Arabisch, Ukrainisch, Somali, Englisch, Paschto → je sinnvoll

Caching: Zurückwechseln → sofort aus Cache, Seite neu laden → Cache da

Bewertung 1-5: Auswahl, Qualität, Batch, Filter, Gesamt. Freitext.

---
## TP-16: Einstellungen & API-Key

Testformular: "TP-16: Einstellungen". 12 Min.

Tester-Info: Name, Datum, Gerät, Browser, OS

Seite (OK/FEHLER/TEILWEISE + Bemerkung):
- Navigation → Einstellungen
- Titel+Untertitel
- Netzwerk-Status (Online/Degraded/Offline)

Netzwerk+Speicher:
- Offline-Support Indikatoren (IndexedDB, Cache, SW, WASM, Persistent)
- Speicherbalken mit Prozent+Bytes
- "Dauerhaften Speicher anfordern"

API-Key:
- Passwort-Feld, Anzeigen/Verbergen
- Speichern → Erfolgsmeldung
- Status "Aktiv"
- Seite neu laden → gespeichert
- Übersetzer → Provider "Google"
- Key löschen → "Inaktiv"
- Ohne Key: Fallback MyMemory

Cache:
- Übersetzungs-Cache Anzahl
- Leeren → 0
- TTS-Cache Anzahl
- Leeren → 0
- Nach Leerung: erste Übersetzung langsamer

Bewertung 1-5: Übersicht, API-Key, Cache, Speicher, Gesamt. Freitext.

---
## TP-17: Offline-Sprachpakete & Whisper

Testformular: "TP-17: Offline-Pakete". 15 Min. Min. 200MB frei.

Tester-Info: Name, Datum, Gerät, Browser, OS

Übersicht (OK/FEHLER/TEILWEISE + Bemerkung):
- Offline-Sprachpakete Sektion
- Liste verfügbarer Paare
- Nach Quellsprache gruppiert
- ~35MB pro Paket

Download:
- DE→EN herunterladen, Fortschrittsbalken
- Geschwindigkeit akzeptabel
- Status "Heruntergeladen"
- Löschen-Button erscheint

Whisper:
- Whisper-Sektion finden
- Status: nicht heruntergeladen
- Download, Fortschritt
- Status "Bereit"

Offline testen:
- Flugmodus an
- DE→EN: "Guten Tag" → Offline-Übersetzung
- Provider "Offline"
- Sprachpaar ohne Modell → Fehlermeldung

Pivot: DE→EN + EN→FR → DE→FR via Pivot sinnvoll

Löschen: Status zurück, Speicher frei

Bewertung 1-5: Download, Offline-Qualität, Pivot, Speicher, Gesamt. Freitext.

---
## TP-18: PWA-Installation & Offline

Testformular: "TP-18: PWA & Offline". 15 Min. Smartphone.

Tester-Info: Name, Datum, Gerät, Browser, OS

Banner (OK/FEHLER/TEILWEISE + Bemerkung):
- Installationsbanner erscheint
- "App installieren" mit Vorteilen
- Schließbar
- Nach Schließen nicht erneut in Session

Installation:
- Installieren klicken → nativer Dialog
- Bestätigen → auf Homescreen
- Icon korrekt
- Standalone-Modus (keine Browser-Leiste)

Standalone:
- Ohne Browser-Chrome
- Status-Bar Farbe korrekt (#0369a1)
- Navigation funktioniert
- Alle Seiten laden

Shortcuts (Android): Lang drücken → Live, Konversation, Kamera, Phrasebook

Offline:
- Flugmodus → PWA lädt aus SW-Cache
- Alle Seiten navigierbar
- Übersetzer → Fehlermeldung (kein Modell)
- Status "Offline"

SW-Update: Netzwerk wieder → App aktualisiert, kein Fehler bei Wechsel

Bewertung 1-5: Installation, Standalone, Offline, SW, Gesamt. Freitext.

---
## TP-19: Dark Mode & Theming

Testformular: "TP-19: Dark Mode". 10 Min.

Tester-Info: Name, Datum, Gerät, Browser, OS

Toggle (OK/FEHLER/TEILWEISE + Bemerkung):
- Toggle im Header (Sonne/Mond)
- Light→Dark sofort
- Dark→Light sofort
- Kein Flackern

Dark Mode alle Seiten:
- Übersetzer: dunkel, lesbar, kontrastreich
- Live-Landing: Buttons, Cards sichtbar
- Phrasebook: Cards, Chips lesbar
- Einstellungen: Felder, Toggles sichtbar
- Info, Konversation, Impressum: lesbar

Persistenz:
- Seite neu laden → bleibt
- Browser neu → bleibt

System:
- System Dark → App Dark (wenn "System")
- System Light → App Light
- Manueller Override respektiert

Bewertung 1-5: Dark Konsistenz, Light Konsistenz, Kontrast, Persistenz, Gesamt. Freitext.

---
## TP-20: UI-Sprachen (9 Sprachen)

Testformular: "TP-20: UI-Sprachen". 12 Min.

Tester-Info: Name, Datum, Gerät, Browser, Muttersprache(n)

Sprachwechsel (OK/FEHLER/TEILWEISE + Bemerkung):
- Globe-Icon/Dropdown im Header
- 9 Sprachen mit Flaggen
- Wechsel sofort (kein Nachladen)
- Seite neu laden → gespeichert

Deutsch: Nav "Übersetzer, Live, Phrasebook, Info, Einstellungen", alle Labels DE, keine Lücken
Englisch: Alle Texte EN, Nav korrekt, keine Lücken
Arabisch: Texte AR, RTL-Layout, grammatisch korrekt
Türkisch: Texte TR, Sonderzeichen ç,ş,ğ,ı korrekt
Farsi: Texte FA, RTL korrekt
Ukrainisch: kyrillisch, keine Lücken
Russisch: kyrillisch, keine Lücken
Französisch: Akzente korrekt
Spanisch: ñ/ü korrekt

Auto-Detection:
- Browser Türkisch → App Türkisch
- Browser Finnisch → Fallback Deutsch

Bewertung 1-5: Vollständigkeit, RTL, Wechsel, Auto-Detection, Gesamt. Freitext.

---
## TP-21: RTL-Sprachen

Testformular: "TP-21: RTL (Arabisch, Farsi)". 12 Min.

Tester-Info: Name, Datum, Gerät, Browser, Arabisch/Farsi-Kenntnisse (Auswahl)

Arabisch RTL-Layout (OK/FEHLER/TEILWEISE + Bemerkung):
- UI Arabisch → Nav rechts-nach-links
- Header gespiegelt
- Buttons korrekt
- Eingabefelder ab rechts
- Cards/Layout gespiegelt

RTL-Übersetzung:
- DE→AR: Übersetzung RTL
- AR→DE: Quelltext RTL, Zieltext LTR
- Gemischt (AR+Zahlen+Latein): Bidi korrekt
- Kopieren: arabischer Text korrekt

Farsi:
- UI Farsi → RTL
- ی statt ي, ک statt ك
- Layout gespiegelt

Spezielle Bereiche: Phrasebook AR, Live Listener AR, Konversation AR, Sprachauswahl

Wechsel RTL→LTR:
- AR→DE: sofort LTR
- Kein Flackern
- Alle Elemente korrekt

Bewertung 1-5: Layout, Bidi-Text, Qualität, Wechsel, Gesamt. Freitext.

---
## TP-22: Responsive Mobile

Testformular: "TP-22: Responsive Mobile". 12 Min. Smartphone.

Tester-Info: Name, Datum, Gerät+Bildschirmgröße, Browser, OS

Navigation (OK/FEHLER/TEILWEISE + Bemerkung):
- Header vollständig sichtbar
- Nav bedienbar, Touch-Targets groß
- Schmale Geräte: Nav passt sich an
- Footer sichtbar, Links klickbar

Übersetzer:
- Volle Breite, Dropdowns bedienbar
- Tausch+Mikrofon erreichbar
- Schrift lesbar, Tastatur: kein Verdecken
- Scrollen flüssig

Live: Landing, QR groß, Speaker/Listener Buttons ok
Konversation: Split nutzbar, 180° lesbar, Mikrofon erreichbar
Weitere: Phrasebook, Settings, Info, Kamera ok

Orientierung:
- Portrait optimiert
- Landscape nutzbar
- Wechsel: kein Bruch

Bewertung 1-5: Touch, Lesbarkeit, Konsistenz, Scrolling, Gesamt. Freitext.

---
## TP-23: Responsive Tablet & Desktop

Testformular: "TP-23: Tablet & Desktop". 10 Min.

Tester-Info: Name, Datum, Gerät+Größe, Browser, OS

Desktop 1200px+ (OK/FEHLER/TEILWEISE + Bemerkung):
- Übersetzer nutzt Breite sinnvoll
- Nav horizontal
- Live: Cards nebeneinander
- Info: Grid mehrspaltig
- Settings: gut lesbar
- Max-width begrenzt

Tablet 768-1024px:
- Hybrid-Layout
- Touch+Größe ok
- QR groß genug
- Konversation: Split gut

Skalieren:
- 1920→768: flüssig
- 768→375: Mobile-Layout
- Kein horizontales Scrollen
- Nichts abgeschnitten/überlappend

Desktop-Features: Hover-Effekte, Tastenkombinationen, Cursor-Änderung

Bewertung 1-5: Desktop, Tablet, Übergänge, Gesamt. Freitext.

---
## TP-24: Browser Chrome

Testformular: "TP-24: Chrome Desktop & Android". 12 Min.

Tester-Info: Name, Datum, Chrome Desktop Version, Chrome Android Version, Desktop-OS, Android-Version

Chrome Desktop (OK/FEHLER/TEILWEISE + Bemerkung):
- App lädt vollständig
- Übersetzen, STT, TTS, Dark Mode, Live Session funktioniert
- Alle Seiten ohne Fehler
- PWA-Installation angeboten
- Service Worker registriert
- Keine Konsolenfehler

Chrome Android:
- App lädt, Touch ok
- STT, TTS, Kamera funktioniert
- PWA-Banner "Zum Startbildschirm"
- Tastatur: Layout passt, Texte scrollen flüssig

Chrome-spezifisch: Interim-Ergebnisse live, IndexedDB, Cache API

Bewertung 1-5: Desktop, Android, Performance, Gesamt. Freitext.

---
## TP-25: Browser Safari

Testformular: "TP-25: Safari macOS & iOS". 12 Min.

Tester-Info: Name, Datum, Safari Desktop+iOS Version, macOS+iOS Version

Safari Desktop (OK/FEHLER/TEILWEISE + Bemerkung):
- App lädt, Übersetzen funktioniert
- STT (evtl. eingeschränkt) → Fallback/Hinweis
- TTS, Dark Mode, alle Seiten ok

Safari iOS:
- App lädt, Touch ok
- Google Cloud STT als Fallback
- Audio nach User-Interaktion
- Kamera, Home-Screen, Standalone

Safari-spezifisch:
- Audio Autoplay sauber gehandhabt
- IndexedDB (7-Tage-Limit ohne PWA)
- Persistent Storage Hinweis
- Safe Area (Notch/Dynamic Island)
- Scroll-Bounce stört nicht
- Tastatur scrollt korrekt
- WebAssembly unterstützt

Bewertung 1-5: Desktop, iOS, STT-Fallback, Audio, Gesamt. Freitext.

---
## TP-26: Browser Firefox & Edge

Testformular: "TP-26: Firefox & Edge". 12 Min.

Tester-Info: Name, Datum, Firefox-Version, Edge-Version, OS

Firefox (OK/FEHLER/TEILWEISE + Bemerkung):
- App lädt, Übersetzen ok
- STT (eingeschränkt) → Whisper-Fallback/Hinweis
- TTS, Dark Mode, alle Seiten ok
- Service Worker, IndexedDB, keine Konsolenfehler

Edge:
- App lädt, Übersetzen, STT, TTS, Dark Mode ok
- Alle Seiten, PWA-Installation, keine Fehler

Vergleich:
- Gleiche Übersetzung in Chrome/FF/Edge → gleiches Ergebnis
- Visuell konsistent
- Performance vergleichbar

Bewertung 1-5: Firefox, Edge, Cross-Browser, Gesamt. Freitext.

---
## TP-27: Netzwerk & Fehlerbehandlung

Testformular: "TP-27: Netzwerk-Szenarien". 15 Min.

Tester-Info: Name, Datum, Gerät, Browser, OS

Status (OK/FEHLER/TEILWEISE + Bemerkung):
- Online: "Online" grün
- Flugmodus: "Offline" rot
- Wieder an: "Online" zurück
- Wechsel < 5 Sek

Übersetzung:
- Online: normal (Google/MyMemory)
- Flugmodus: Fehlermeldung oder Offline-Modell
- Meldung verständlich
- Wieder online: funktioniert
- Kein Dauerfehlerzustand

Provider-Kaskade:
- Ohne API-Key: MyMemory Fallback
- Badge zeigt Provider
- Circuit Breaker bei Fehlern

Live Session:
- WLAN kurz trennen (5s) → Reconnect
- Hinweis "wird wiederhergestellt"
- Danach normal
- 30s+ trennen → Timeout/Fehlermeldung

Cache:
- Gleicher Text offline → Cache-Hit
- Badge "Cache"
- Neuer Text offline → Offline-Modell oder Fehler

Degraded (2G): Übersetzung langsam aber kommt, Ladeindikator, kein Absturz

Bewertung 1-5: Erkennung, Meldungen, Reconnect, Fallback, Gesamt. Freitext.

---
## TP-28: Barrierefreiheit

Testformular: "TP-28: Accessibility". 12 Min.

Tester-Info: Name, Datum, Gerät, Screenreader, Browser

Tastatur (OK/FEHLER/TEILWEISE + Bemerkung):
- Tab: sinnvolle Reihenfolge
- Focus-Ring sichtbar
- Enter: Button aktiviert
- Esc: Dropdown/Modal schließt
- Pfeiltasten in Dropdown
- Keine Tastaturfalle

ARIA:
- Mikrofon: aria-label
- Kopieren: aria-label
- Lautsprecher: aria-label
- Eingabefelder: Label/Placeholder
- Status: Screenreader-lesbar

Screenreader (optional):
- VoiceOver/NVDA navigierbar
- Überschriften H1/H2 korrekt
- Buttons mit Zweck
- Textbereich erkannt
- Ergebnis erreichbar

Kontrast:
- Text/Hintergrund WCAG AA 4.5:1
- Buttons lesbar
- Placeholder Kontrast
- Dark Mode Kontrast
- Fehlermeldungen nicht nur Farbe

Sonstiges:
- Zoom 150%: Layout ok
- Zoom 200%: nutzbar
- Flaggen mit Textalternative
- Loading: Text + Animation

Bewertung 1-5: Tastatur, ARIA, Kontrast, Screenreader, Gesamt. Freitext.

---
## TP-29: Datenschutz & Impressum

Testformular: "TP-29: Rechtliches". 10 Min.

Tester-Info: Name, Datum, Gerät, Browser

Impressum (OK/FEHLER/TEILWEISE + Bemerkung):
- Link im Footer → Seite lädt
- Firmenname, Adresse, Kontakt, Handelsregister, USt-IdNr., Haftungsausschluss vorhanden

Datenschutz:
- Link im Footer → Seite lädt
- Verantwortlicher genannt
- Erhobene Daten beschrieben
- APIs erwähnt (Google, MyMemory, LibreTranslate)
- STT (Web Speech/Google Cloud) erwähnt
- TTS (Google Cloud) erwähnt
- Lokale Speicherung (IndexedDB, localStorage) erwähnt
- Live Sessions Verschlüsselung erwähnt
- Betroffenenrechte (Auskunft, Löschung)
- Keine Tracking-Cookies

Erreichbarkeit:
- Von jeder Seite (Footer)
- Desktop + Mobile
- Gut lesbar
- Auf Deutsch

404-Seite: Ungültige URL → 404-Seite mit Zurück/Home-Link, kein Stack-Trace

Bewertung 1-5: Impressum, Datenschutz, DSGVO, Erreichbarkeit, Gesamt. Freitext.

---
## TP-30: Langzeittest (60 Min)

Testformular: "TP-30: Langzeittest Stabilität". 60 Min.

Tester-Info: Name, Datum, Gerät, Browser, OS, Akkustand Start (%)

Phase 1 — Übersetzer 15 Min (OK/FEHLER/TEILWEISE + Bemerkung):
- 50 verschiedene Übersetzungen → reaktionsschnell
- Kein Speicherleck
- Verlauf max 50 Einträge
- TTS jede 5. → kein Stacking
- Sprache mehrfach wechseln → kein Fehler

Phase 2 — Live Session 20 Min:
- Cloud Session, 1 Listener
- 20 Min ununterbrochen
- Alle Übersetzungen kommen an
- Keine verloren (Queue)
- Latenz stabil
- Auto-TTS 20 Min ok
- WebSocket aktiv
- Kein Audio-Speicherleck

Phase 3 — Konversation 10 Min:
- 10 Min nutzen, 30+ Nachrichten
- Max 6 pro Seite
- Kein Audio-Stau

Phase 4 — Hintergrund 10 Min:
- Hintergrund 2 Min → Zustand bleibt
- Live Session: Hintergrund→Vordergrund → verbunden
- Andere App → kein Absturz
- Sperren/Entsperren → funktioniert

Phase 5 — Speicher 5 Min:
- Speicheranzeige sinnvoll
- Cache max 10.000 / TTS max 200
- RAM < 500 MB

Messwerte: Akku Start→Ende, RAM, Cache-Einträge, Speicher MB, Übersetzungen gesamt, Session-Dauer, Abstürze

Bewertung 1-5: Stabilität, Speicher, Akku, Hintergrund, Live-Ausdauer, Gesamt. Freitext.
