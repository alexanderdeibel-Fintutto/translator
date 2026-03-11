# GuideTranslator -- 59-Sekunden Video-Prompt (Produktionsreif)

## META-INFORMATIONEN

| Parameter | Wert |
|-----------|------|
| **Laenge** | 59 Sekunden (exakt) |
| **Seitenverhaeltnis** | 16:9 (1920x1080) -- zusaetzlich 9:16 Vertical Cut fuer Reels/TikTok |
| **Stil** | Fotorealistischer Realfilm-Look, KEIN erkennbarer KI-Look |
| **Tool-Empfehlung** | Google Veo 3 (beste Realismus-Qualitaet aktuell), alternativ Runway Gen-4, Kling 2.0, Pika 2.0 |
| **Voiceover** | Weiblich, Englisch, professionell-ruhig, KI-Stimme (ElevenLabs "Rachel" oder Google WaveNet "en-US-Neural2-F") |
| **Musik** | Ambient Corporate/Tech, ruhig-professionell, kein Beat-Drop, subtile Pads + leichte Percussion. Referenz: "Inspiring Corporate" auf Artlist/Epidemic Sound |
| **Farbpalette** | Primaer: #1A8CFF (Brand-Blau HSL 210/90/50), Akzent: Warmer Gradient (Orange-Pink wie Hero-Banner), Dunkel: #1A1A2E, Weiss: #FFFFFF |
| **Typografie** | Inter (Sans-Serif), Bold fuer Headlines, Regular fuer Body |
| **Zielgruppe** | Investoren, B2B-Entscheider (Tourismus, Events, Behoerden), Guides |
| **Ausspielkanaele** | Website Hero, YouTube Pre-Roll, Instagram Reels, LinkedIn, Pitch Deck |

---

## SZENE-FUER-SZENE STORYBOARD (59 Sekunden)

---

### SZENE 1: DAS PROBLEM (0:00 -- 0:03) | 3 Sekunden

**Prompt (Veo 3 / Runway):**
```
Cinematic montage, 3 rapid cuts at 1-second intervals. Shot 1: A tour guide speaking enthusiastically in front of the Colosseum in Rome, gesturing to a group of 15 diverse tourists. Half the group looks confused, some checking phones, one person shrugging at another. Shot 2: A conference room with simultaneous interpretation booths visible in the background, a frustrated organizer looking at cables and equipment. Shot 3: Close-up of a teacher in front of a whiteboard that says "Welcome Class" in a German school, with refugee children looking lost. Warm natural lighting, slightly desaturated color grade to convey frustration. Handheld camera feel, subtle movement. 24fps cinematic.
```

**Text-Overlay:**
- Weiss, zentriert, Inter Bold, 48px
- Text: **"Translation is broken for groups."**
- Einblendung: Fade-in bei 0:00, Fade-out bei 0:03
- Leichter Textschatten (rgba(0,0,0,0.6))

**Audio:**
- Kein Voiceover
- Gedaempftes Stimmengewirr (Babel-Effekt), endet abrupt bei 0:03

**Transition zu Szene 2:** Hard Cut auf Schwarz (0.2s)

---

### SZENE 2: LOGO-INTRO (0:03 -- 0:07) | 4 Sekunden

**Prompt:**
```
Black screen. A glowing, colorful circular logo (warm gradient: orange, pink, yellow tones) materializes from scattered light particles converging to the center. The particles are like tiny translation symbols (letters from different scripts: Arabic, Chinese, Cyrillic, Latin) that swirl and form the logo shape. The text "fintuttotranslator" appears below the logo in clean white sans-serif font, with "fintutto" in the brand blue color (#1A8CFF) and "translator" in white. Clean, minimal, dark background.
```

**Text-Overlay (nach Logo-Animation, ab 0:05):**
- Tagline darunter: **"One voice. 45 languages. No internet."**
- Inter Regular, 28px, Weiss, leichter Fade-in
- Positioniert: unteres Drittel

**Audio:**
- Subtiler "Whoosh"-Sound bei Logo-Erscheinen
- Sanfter Synth-Pad beginnt (Musik-Intro)

**Assets benoetigt:**
- `FINTUTTO_LOGO_ALL_ANIMATET.svg` (als Referenz fuer die Logo-Animation)
- `App-logo_FINTUTTO_animated_Hintergrund-farbige-_Kreis-leer_beschriftung_fintutto_.png` (farbiger Hintergrund-Referenz)

**Transition zu Szene 3:** Smooth Zoom-In auf Logo-Zentrum, das sich in den naechsten Screen "oeffnet"

---

### SZENE 3: LIVE-DEMO -- TOUR GUIDE WORKFLOW (0:07 -- 0:22) | 15 Sekunden

Dies ist die laengste und wichtigste Szene. Sie zeigt den kompletten Workflow in einer fluessigen Sequenz.

**Sub-Shot 3A (0:07 -- 0:10): Guide oeffnet die App | 3s**
```
Over-the-shoulder shot of a professional female tour guide (30s, confident, wearing a lanyard with "Guide" badge) in a sunny European old town square (cobblestones, historic buildings). She holds up her smartphone. The camera smoothly racks focus from her face to the phone screen. On the screen we see the Fintutto Enterprise app: the "Live-Modus" interface with "Gruppen-Session" header, the blue "Session starten" button prominently visible, connection options showing "Cloud" selected in blue. Warm golden-hour sunlight. Cinematic shallow depth of field.
```

**Voiceover (startet bei 0:07):**
> *"Start a session."*

**Sub-Shot 3B (0:10 -- 0:14): QR-Code wird gezeigt | 4s**
```
Medium shot: The guide holds her phone facing the camera, showing a large QR code on screen with session code "TR-TV4R" visible below it. She also holds up a small printed sign/card with the same QR code (professional looking, laminated, with the Fintutto logo at the top). A group of 6-8 diverse tourists (different ethnicities, ages) are gathered around, some already pulling out their smartphones. Bright daylight, the QR code is clearly legible. Camera slowly pulls back to show the full group.
```

**Voiceover (0:10):**
> *"Share the QR code."*

**Text-Overlay (0:10 -- 0:14):**
- Kleines animiertes Badge oben rechts: "No app download needed" mit Browser-Icon
- Inter Regular, 18px, halbtransparenter weisser Hintergrund

**Sub-Shot 3C (0:14 -- 0:22): Multi-Sprach-Empfang | 8s**
```
Split-screen composition showing 4 smartphones held by different hands (diverse skin tones). Each phone shows the Fintutto listener interface in dark mode with the session code "TR-TV4R" at top, but each displays a DIFFERENT language selected:
- Phone 1 (top-left): "English" highlighted in blue, showing translated text "Welcome to this beautiful city"
- Phone 2 (top-right): Japanese interface showing "この美しい街へようこそ" with 日本語 selected
- Phone 3 (bottom-left): Arabic interface showing "مرحباً بكم في هذه المدينة الجميلة" with العربية selected
- Phone 4 (bottom-right): Ukrainian interface showing "Ласкаво просимо до цього прекрасного міста" with Українська selected
Each phone has the language selection grid visible with 45+ language flags. Natural lighting, phones slightly angled. The screens are bright and clearly readable.
```

**Voiceover (0:14):**
> *"Everyone reads and hears the translation -- in their own language."*

**Motion Graphics Overlay (0:16 -- 0:22):**
- Animierte Linien/Pulswellen die von einem zentralen Punkt (Guide) zu den 4 Phones strahlen
- Subtile "connected"-Animation
- Kleine Zahl "45" mit Globe-Icon die kurz eingeblendet wird

**Assets benoetigt fuer Szene 3:**
- Screenshot S2: Live-Modus / Session-starten Screen
- Screenshot S3: QR-Code Screen mit Session-Code
- Screenshot S4: Listener-Ansicht in verschiedenen Sprachen (das hochgeladene Bild mit der Sprachauswahl)

---

### SZENE 4: OFFLINE-DEMO (0:22 -- 0:32) | 10 Sekunden

**Sub-Shot 4A (0:22 -- 0:26): WiFi faellt aus | 4s**
```
Close-up of a smartphone status bar. A WiFi symbol is prominently displayed, then visually gets crossed out with a red X animation. The camera pulls back slightly to show the Fintutto app interface. In the top-left corner, the connection indicator smoothly transitions: the word "Cloud" with a green dot changes to "Hotspot" -- the green dot stays green, indicating it still works. The transition is seamless, no loading spinner, no error message. Clean, minimal UI. The background suggests an underground location (museum basement, cave tour) with stone walls and dim ambient lighting.
```

**Voiceover (0:22):**
> *"No internet?"*

**Text-Overlay (0:24):**
- Animiertes WiFi-Symbol mit Durchstreich-Animation (rot), das sich dann in ein Hotspot-Symbol verwandelt (gruen)
- Zentriert, gross (80px Icon)

**Sub-Shot 4B (0:26 -- 0:30): BLE Fallback | 4s**
```
Medium shot of the same guide now in a dimly lit underground cave or ancient catacomb. She's still speaking naturally to her group. Her phone screen shows the connection switching: "Hotspot" changes to "BLE" (Bluetooth Low Energy) with a Bluetooth icon. The connection indicator remains green. The tourists' phones in the foreground (shallow DOF) show translations still updating in real-time. Atmospheric lighting with warm spotlights.
```

**Voiceover (0:26):**
> *"No problem. GuideTranslator automatically falls back to Hotspot or Bluetooth."*

**Sub-Shot 4C (0:30 -- 0:32): "Still Works" Beat | 2s**
```
Quick cut: Close-up of a tourist's phone showing a perfectly translated sentence in Japanese, with a subtle green checkmark animation appearing. The tourist smiles and nods.
```

**Text-Overlay (0:30 -- 0:32):**
- **"Still works."** -- Inter Bold, 56px, Weiss, zentriert
- Gruen umrandet oder mit gruenem Unterstrich
- Punch-in Animation (leicht vergroessert, dann auf Normalgroesse)

**Assets benoetigt:**
- Screenshot S5: App im Offline-/Hotspot-/BLE-Modus (Verbindungs-Indikator)

**Transition:** Smooth wipe nach rechts

---

### SZENE 5: CONVERSATION MODE (0:32 -- 0:40) | 8 Sekunden

**Prompt:**
```
A modern, bright government office or doctor's consultation room. A tablet (iPad) lies flat on a desk between two people sitting across from each other: Person A is a German-speaking official/doctor (professional attire), Person B is a young woman wearing a headscarf. The tablet screen shows the Fintutto Conversation interface in dark mode: split-screen with "Englisch" on top (rotated 180 degrees for the person across) and "Deutsch" on the bottom. Person A speaks, and German text appears in real-time in the bottom section. Simultaneously, the English translation appears in the top section (upside-down from camera view, right-side-up for Person B). Person B reads and smiles with understanding, then presses the blue "Sprechen" button to respond. The atmosphere is warm and empathetic. Natural office lighting, shallow depth of field on the tablet screen. Camera slowly orbits around the table at desk height.
```

**Voiceover (0:32):**
> *"Conversation mode puts a translator between two people. No human interpreter needed."*

**Motion Graphics (0:36 -- 0:40):**
- Animierte Sprechblasen-Icons die zwischen den zwei Seiten hin- und herfliegen
- Subtile Uebersetzungs-Animation (Buchstaben morphen von einer Sprache zur anderen)

**Text-Overlay (0:38 -- 0:40):**
- Klein, unten rechts: **"Works with 45 language pairs"**
- Inter Regular, 16px

**Assets benoetigt:**
- Screenshot S6: Conversation Mode (das hochgeladene Bild mit dem Split-Screen Englisch/Deutsch)

---

### SZENE 6: USE CASES MONTAGE (0:40 -- 0:46) | 6 Sekunden

6 schnelle Cuts, je 1 Sekunde. Jeder Cut zeigt eine reale Szene mit Text-Overlay und Icon.

**Cut 1 (0:40 -- 0:41): TOURS**
```
Wide shot of a tour guide leading a group through a sun-drenched Mediterranean harbor with colorful boats. Several tourists hold up phones showing translations. Vibrant colors.
```
- Icon: Kompass-Icon, weiss
- Text: **"Tours"**

**Cut 2 (0:41 -- 0:42): CONFERENCES**
```
Wide shot of a modern conference hall with 200+ attendees. Large screen on stage. People in the audience looking at their phones with translations. Professional lighting, blue-tinted.
```
- Icon: Podium-Icon
- Text: **"Conferences"**

**Cut 3 (0:42 -- 0:43): SCHOOLS**
```
Bright classroom with diverse children (refugee welcome class). A teacher uses a tablet, children see translations on a shared screen. Warm, friendly atmosphere.
```
- Icon: Buch-Icon
- Text: **"Schools"**

**Cut 4 (0:43 -- 0:44): GOVERNMENT**
```
Government service counter (Buergeramt-style). An official helps a family with paperwork, tablet between them showing translations. Institutional but warm lighting.
```
- Icon: Gebaeude-Icon
- Text: **"Government"**

**Cut 5 (0:44 -- 0:45): TOURISM**
```
Hotel reception desk with a receptionist helping international guests. Phone/tablet showing real-time translation. Modern boutique hotel lobby.
```
- Icon: Koffer-Icon
- Text: **"Tourism"**

**Cut 6 (0:45 -- 0:46): NGOs**
```
Field setting -- an NGO worker with a tablet talking to refugees at a registration point/camp. Humanitarian context, empathetic, natural light.
```
- Icon: Herz-Hand-Icon
- Text: **"NGOs"**

**Voiceover (0:40):**
> *"Tours. Conferences. Schools. Government. Tourism. NGOs."*
(Jedes Wort synchron zum jeweiligen Cut)

**Stil fuer alle 6 Cuts:**
- Jeder Schnitt hat einen subtilen Zoom-In (Ken-Burns-Effekt, 5%)
- Icon + Text erscheinen per Fade-in (0.3s) zentriert
- Leichter Farbfilter passend zum Use Case

---

### SZENE 7: PRICING (0:46 -- 0:51) | 5 Sekunden

**Prompt:**
```
Clean dark background (#1A1A2E). Minimal, elegant pricing display appearing with smooth animations. No live-action footage -- pure motion graphics.
```

**Motion Graphics / Text-Overlays (exakte Abfolge):**

**0:46 -- 0:48 (2s):**
- Grosse Zahl animiert sich hoch: **"Free"** in Weiss, darunter **"0 EUR forever"** in Grau
- Daneben: **"Guide Basic"** mit **"from 19.90 EUR/mo"** in Brand-Blau
- Smooth Slide-in von links

**0:48 -- 0:50 (2s):**
- Vergleichsgrafik (einfache Balken):
  - Linker Balken (rot, lang): **"Traditional interpreter: 800+ EUR/day"**
  - Rechter Balken (blau, kurz): **"GuideTranslator: from 19.90 EUR/mo"**
  - Prozentzahl animiert: **"97% cheaper"** in Gruen

**0:50 -- 0:51 (1s):**
- Text morpht zu: **"11 plans. From 0 to Enterprise."**

**Voiceover (0:46):**
> *"Free tier available. Pro plans from nineteen-ninety a month."*

**Assets benoetigt:**
- Screenshot S7: Pricing-Seite (fuer Referenz bei der Gestaltung)

---

### SZENE 8: CALL TO ACTION (0:51 -- 0:59) | 8 Sekunden

**Sub-Shot 8A (0:51 -- 0:55): URL + QR | 4s**
```
Clean dark background transitioning to the brand gradient (warm orange-pink-blue like the hero banner). Center of frame: a large, crisp QR code (white on dark) that links to translator.fintutto.cloud. Below the QR code, the URL is displayed in clean white text. The Fintutto logo appears small in the top-right corner. Subtle particle effects in the background (floating dots of light).
```

**Text-Overlays:**
- Oben: **"Try it now."** -- Inter Bold, 64px, Weiss
- Mitte: QR-Code (gross, 300x300px Aequivalent)
- Unter QR: **translator.fintutto.cloud** -- Inter Medium, 32px, Weiss
- Darunter: **"No signup needed."** -- Inter Regular, 24px, 70% Opazitaet

**Sub-Shot 8B (0:55 -- 0:59): Schluss-Feeling | 4s**
```
Pull-back shot revealing the same tour guide from Scene 3, now surrounded by her happy, engaged tourist group. Everyone is smiling, some taking photos, the guide looks satisfied. In the foreground, multiple phone screens show translations in different languages. Warm golden-hour light, lens flare. The shot slowly zooms out and slightly upward, giving a sense of openness and possibility. The Fintutto logo and URL remain as a subtle overlay in the lower third.
```

**Text-Overlay (persistent bis 0:59):**
- Unteres Drittel: Fintutto-Logo links, URL rechts
- **"One voice. Every language."** -- Final Tagline, zentriert, Fade-in

**Voiceover (0:51):**
> *"Try it now. Free. No signup needed."*

**Audio:**
- Musik erreicht sanften Hoehepunkt bei 0:55
- Fade-out der Musik bis 0:59
- Letzter Ton: subtiler "Chime" bei Logo-Einblendung

---

## TECHNISCHE SPEZIFIKATIONEN

### Voiceover-Script (komplett, 52 Sekunden Sprechzeit)

| Timecode | Text | Dauer |
|----------|------|-------|
| 0:07 | "Start a session." | 1.5s |
| 0:10 | "Share the QR code." | 1.5s |
| 0:14 | "Everyone reads and hears the translation -- in their own language." | 4s |
| 0:22 | "No internet?" | 1s |
| 0:26 | "No problem. GuideTranslator automatically falls back to Hotspot or Bluetooth." | 4s |
| 0:32 | "Conversation mode puts a translator between two people. No human interpreter needed." | 5s |
| 0:40 | "Tours. Conferences. Schools. Government. Tourism. NGOs." | 4s |
| 0:46 | "Free tier available. Pro plans from nineteen-ninety a month." | 3.5s |
| 0:51 | "Try it now. Free. No signup needed." | 3s |

**Gesamt-Sprechzeit:** ~27.5 Sekunden (Rest ist Musik/Ambiente -- perfekte Balance)

### Musik-Spezifikation

| Abschnitt | Stimmung | BPM |
|-----------|----------|-----|
| 0:00-0:03 | Gedaempft, angespannt (Problem) | -- |
| 0:03-0:07 | Aufloesend, oeffnend (Logo) | 80-90 |
| 0:07-0:40 | Ruhig-optimistisch, Vertrauen (Demo) | 90-100 |
| 0:40-0:46 | Leicht schneller, energischer (Use Cases) | 100-110 |
| 0:46-0:51 | Klar, reduziert (Pricing) | 90 |
| 0:51-0:59 | Warm, hoffnungsvoll, Resolution (CTA) | 80-90 |

### Farbkorrektur / Color Grade

- Szene 1 (Problem): Leicht entsaettigt, kuehlere Farbtemperatur
- Szene 2 (Logo): Schwarz mit leuchtenden Farben
- Szene 3-5 (Demo): Warm, golden-hour Toene, leicht erhoehter Kontrast
- Szene 6 (Use Cases): Jeder Cut leicht unterschiedlich getont
- Szene 7 (Pricing): Clean, dunkel, hoher Kontrast
- Szene 8 (CTA): Warm, optimistisch, leichter Lens Flare

---

## CHECKLISTE: BENOETIGTE UPLOADS/DATEIEN

### Muss-Uploads (vor Video-Generierung):

| # | Datei | Status | Verwendung |
|---|-------|--------|------------|
| S1 | Screenshot: Startscreen/Dashboard | Erstellen | Szene 3A Referenz |
| S2 | Screenshot: Live-Modus "Session starten" | Hochgeladen | Szene 3A |
| S3 | Screenshot: QR-Code Session Screen | Hochgeladen | Szene 3B |
| S4 | Screenshot: Listener-Sprachauswahl (45 Sprachen) | Hochgeladen | Szene 3C |
| S5 | Screenshot: Offline/Hotspot/BLE-Indikator | Erstellen | Szene 4 |
| S6 | Screenshot: Conversation Mode Split-Screen | Hochgeladen | Szene 5 |
| S7 | Screenshot: Pricing-Seite | Erstellen | Szene 7 |
| L1 | Logo: Farbig (PNG) | Im Repo | Szene 2, 8 |
| L2 | Logo: Transparent (SVG) | Im Repo | Overlays |
| L3 | Logo: Animiert (SVG) | Im Repo | Szene 2 |

### Empfohlene Zusatz-Uploads:

| # | Datei | Zweck |
|---|-------|-------|
| QR1 | Echter QR-Code der zu translator.fintutto.cloud fuehrt (PNG, hochaufloesend) | Szene 3B + Szene 8 |
| REF1 | 2-3 Referenz-Videos die den gewuenschten Stil zeigen | Fuer Veo 3 Style-Transfer |
| FONT1 | Inter Font (falls nicht im Tool verfuegbar) | Konsistente Typografie |

---

## PRODUKTIONS-WORKFLOW EMPFEHLUNG

### Schritt 1: Einzelne Szenen generieren
Generiere jede Szene einzeln mit Veo 3 (oder Alternative). Pro Szene 3-5 Varianten, beste auswaehlen.

### Schritt 2: UI-Screens als Post-Production Overlays
Die App-Screenshots NICHT von der KI generieren lassen (sieht falsch aus). Stattdessen:
- Echte Screenshots als Overlay in Post-Production auf die Phone-Screens legen
- Tools: After Effects, DaVinci Resolve, oder CapCut Pro

### Schritt 3: Text-Overlays in Post-Production
Alle Text-Overlays, Icons und Motion Graphics separat in After Effects/Motion oder CapCut hinzufuegen.

### Schritt 4: Voiceover separat generieren
ElevenLabs oder Google Cloud TTS. Dann in der Timeline platzieren.

### Schritt 5: Musik + Sound Design
Musik-Track von Artlist/Epidemic Sound. Sound-Effekte (Whoosh, Chime, UI-Sounds) separat hinzufuegen.

### Schritt 6: Final Cut + Color Grade
Alles zusammenfuegen, Color Grade anwenden, auf exakt 59 Sekunden trimmen.

---

## EINZEL-PROMPTS FUER SOCIAL MEDIA VARIANTEN (Bonus)

Falls du spaeter einzelne Kurzvideos brauchst:

1. **15s Instagram Reel:** Szene 3 (Tour Guide Demo) -- nur der QR-Code Moment
2. **30s LinkedIn Ad:** Szene 1 + 3 + 7 + 8 (Problem → Demo → Preis → CTA)
3. **6s YouTube Bumper:** Szene 2 (Logo) + Tagline + URL
4. **45s Facebook Ad:** Szene 1 + 3 + 5 + 6 + 8 (ohne Pricing)

Jeder dieser Schnitte kann aus dem 59s-Material erstellt werden.
