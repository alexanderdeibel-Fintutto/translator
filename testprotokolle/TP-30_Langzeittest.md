# TP-30: Langzeittest (Stabilität & Speicher)

| Feld | Wert |
|------|------|
| **Protokoll-ID** | TP-30 |
| **Testbereich** | Stabilität — Langzeitnutzung, Memory Leaks, Akkuverbrauch |
| **Geschätzte Dauer** | **~60 Minuten** |
| **Vorbedingungen** | App geöffnet, Gerät aufgeladen (>80%), stabile Internetverbindung |
| **Benötigte Geräte** | Smartphone (Hauptgerät) + 1 zweites Gerät für Live-Test |

---

## Tester-Information

| Feld | Eintrag |
|------|---------|
| **Tester-Name** | |
| **Datum** | |
| **Gerät** | |
| **Browser + Version** | |
| **Betriebssystem** | |
| **Akkustand Start** | % |
| **Akkustand Ende** | % |

---

## Testaufgaben

### Phase 1: Übersetzer-Dauertest (15 Min)

| Nr. | Aufgabe | Status | Bemerkung |
|-----|---------|--------|-----------|
| 1.1 | **50 verschiedene Übersetzungen** durchführen (verschiedene Sprachen, Texte) | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| 1.2 | App bleibt **reaktionsschnell** (keine zunehmende Verzögerung) | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| 1.3 | **Kein Speicherleck**: App wird nicht merklich langsamer | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| 1.4 | Verlauf zeigt maximal 50 Einträge (kein unkontrolliertes Wachstum) | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| 1.5 | TTS bei jeder 5. Übersetzung abspielen → kein Audio-Stacking | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| 1.6 | Sprache mehrfach wechseln → kein Fehler | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |

### Phase 2: Live Session Dauertest (20 Min)

| Nr. | Aufgabe | Status | Bemerkung |
|-----|---------|--------|-----------|
| 2.1 | Live Session (Cloud) erstellen mit 1 Listener | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| 2.2 | **20 Minuten kontinuierlich** sprechen (mit Pausen) | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| 2.3 | Alle Übersetzungen kommen beim Listener an (stichprobenartig prüfen) | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| 2.4 | **Keine verlorenen Übersetzungen** (Queue-basiert) | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| 2.5 | Latenzanzeige bleibt **stabil** (kein Anstieg über Zeit) | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| 2.6 | Listener Auto-TTS spielt **20 Min lang** ohne Probleme | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| 2.7 | **WebSocket-Verbindung** bleibt aktiv (kein stiller Disconnect) | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| 2.8 | Mikrofon-Aufnahme: Kein Speicherleck bei Audio-Buffern | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |

### Phase 3: Konversation Dauertest (10 Min)

| Nr. | Aufgabe | Status | Bemerkung |
|-----|---------|--------|-----------|
| 3.1 | Konversation 10 Min lang nutzen (abwechselnd sprechen) | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| 3.2 | **30+ Nachrichten** austauschen → App bleibt stabil | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| 3.3 | Alte Nachrichten werden korrekt begrenzt (max 6 pro Seite) | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| 3.4 | Audio-Queue läuft nicht über (kein Audio-Stau) | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |

### Phase 4: Hintergrund & Multitasking (10 Min)

| Nr. | Aufgabe | Status | Bemerkung |
|-----|---------|--------|-----------|
| 4.1 | App in den **Hintergrund** schieben (Home-Button) → 2 Min warten | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| 4.2 | App wieder öffnen → **Zustand bleibt erhalten** (Text, Einstellungen) | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| 4.3 | Während Live Session: Hintergrund → Vordergrund → Session noch verbunden | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| 4.4 | Andere App öffnen und zurückkehren → kein Absturz | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| 4.5 | Bildschirm **sperren und entsperren** → App funktioniert weiter | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |

### Phase 5: Speicher & Cache nach Langzeitnutzung (5 Min)

| Nr. | Aufgabe | Status | Bemerkung |
|-----|---------|--------|-----------|
| 5.1 | Einstellungen → **Speicheranzeige** prüfen: Sinnvoller Wert nach 60 Min Nutzung | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| 5.2 | **Übersetzungs-Cache**: Eintragsanzahl prüfen (sollte max 10.000 sein) | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| 5.3 | **TTS-Cache**: Clip-Anzahl prüfen (sollte max 200 sein) | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| 5.4 | App-Speicherverbrauch im Task-Manager prüfen (nicht >500 MB RAM) | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |

---

## Messwerte

| Messung | Wert |
|---------|------|
| **Akkuverbrauch** (Start → Ende) | ___ % → ___ % = ___ % verbraucht |
| **RAM-Nutzung** (am Ende) | ___ MB |
| **Übersetzungs-Cache Einträge** | ___ |
| **TTS-Cache Clips** | ___ |
| **Speicherplatz belegt** | ___ MB |
| **Anzahl Übersetzungen gesamt** | ___ |
| **Live Session Dauer** | ___ Min |
| **App-Abstürze** | ___ |

---

## Gesamtbewertung

| Kriterium | Bewertung (1-5) |
|-----------|----------------|
| Langzeit-Stabilität | |
| Speicher-Management | |
| Akkueffizienz | |
| Hintergrund-Verhalten | |
| Live Session Ausdauer | |
| Gesamteindruck | |

**Freitextkommentar:**

---

_TP-30 Ende — Geschätzte Dauer: 60 Minuten_
