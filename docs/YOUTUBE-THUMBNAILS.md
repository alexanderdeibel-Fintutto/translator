# Fintutto -- YouTube Thumbnail Specs & KI-Prompts fuer alle 9 Videos

## ALLGEMEINE REGELN

| Parameter | Wert |
|-----------|------|
| **Groesse** | 1280 x 720 px (16:9) |
| **Dateityp** | PNG oder JPG, max. 2 MB |
| **Schrift** | Inter Black / Montserrat Black (fett, sans-serif) |
| **Textfarbe** | Weiss mit schwarzem Schatten/Outline ODER Gelb (#FFD700) |
| **Max. Woerter im Bild** | 3-5 (nie mehr!) |
| **Text-Position** | Rechte Haelfte oder oberes Drittel |
| **Gesicht** | Links oder mittig, mit Emotion (Staunen, Freude, Schock) |
| **Hintergrund** | Dunkel oder stark geblurrt = Text lesbar |
| **Brand-Blau** | #1A8CFF (fuer Akzente, Unterstrich, Badges) |
| **Warnung-Rot** | #FF3B3B (fuer durchgestrichene Preise) |
| **Erfolg-Gruen** | #00C853 (fuer Ersparnisse, Haekchen) |

### Workflow pro Thumbnail

1. **Hintergrund generieren** → Midjourney / DALL-E / Ideogram (Prompt unten)
2. **In Canva importieren** → Als Hintergrund-Bild einfuegen
3. **Text-Overlay** → Layout unten folgen (Schrift, Groesse, Position)
4. **Export** → 1280x720 PNG

---

## THUMBNAIL 1: GUIDED TOURS & MUSEUMS

### Bildgenerator-Prompt (Midjourney/DALL-E)
```
A female tour guide in her 30s with a navy polo shirt stands in a sunlit Italian piazza, holding up a smartphone showing a glowing QR code. Behind her, a diverse group of 12 tourists hold up their phones, screens glowing with different languages. Golden hour sunlight, warm Mediterranean colors, shallow depth of field. The guide has an expression of confident pride. Photorealistic, cinematic, 16:9 aspect ratio, no text in image.
```

### Canva-Layout
```
┌──────────────────────────────────────────┐
│                                          │
│  [Guide mit Phone        ]  ┌──────────┐│
│  [links, 40% Breite      ]  │ 1 VOICE  ││
│                              │    →     ││
│                              │   45     ││
│                              │LANGUAGES ││
│                              └──────────┘│
│  ┌─────────────────────────────────────┐ │
│  │ 🔴 NO INTERNET NEEDED              │ │
│  └─────────────────────────────────────┘ │
└──────────────────────────────────────────┘
```

| Element | Spec |
|---------|------|
| **Haupttext** | "1 VOICE → 45 LANGUAGES" (Inter Black, 72px, Weiss, schwarzer Drop-Shadow) |
| **Badge unten** | "NO INTERNET NEEDED" (Inter Bold, 28px, Weiss auf Rot #FF3B3B, abgerundet) |
| **Position Haupttext** | Rechte Haelfte, vertikal zentriert |
| **Hintergrund-Behandlung** | Rechte 50% leicht abgedunkelt (schwarzer Gradient 40% Opazitaet) |

---

## THUMBNAIL 2: BEHOERDEN & AEMTER

### Bildgenerator-Prompt
```
A bright modern German government office. Two women sit across a desk: a German civil servant in her 40s with reading glasses and a professional blouse on the left, and a young Eritrean woman wearing a colorful headscarf on the right. Between them on the desk, a tablet glows with a split-screen translation interface. Both women look at each other with understanding and relief. Soft diffused daylight from a window. Institutional but warm. Photorealistic, 16:9, no text.
```

### Canva-Layout
```
┌──────────────────────────────────────────┐
│                                          │
│  [Sachbearbeiterin + Klientin           ]│
│  [mit Tablet in der Mitte               ]│
│                                          │
│  ┌────────────────────────────────────┐  │
│  │  NO INTERPRETER                   │  │
│  │  NEEDED                           │  │
│  └────────────────────────────────────┘  │
│                                          │
│  ┌──────────┐  ┌───────────────────────┐ │
│  │ GDPR ✓   │  │ €49/mo • OFFLINE     │ │
│  └──────────┘  └───────────────────────┘ │
└──────────────────────────────────────────┘
```

| Element | Spec |
|---------|------|
| **Haupttext** | "NO INTERPRETER NEEDED" (Inter Black, 80px, Weiss, schwarzer Outline 3px) |
| **Badge links** | "GDPR ✓" (Inter Bold, 24px, Weiss auf Gruen #00C853) |
| **Badge rechts** | "€49/mo • OFFLINE" (Inter Bold, 24px, Weiss auf Blau #1A8CFF) |
| **Position** | Text unteres Drittel, ueber die ganze Breite |
| **Hintergrund** | Untere 40% abgedunkelt (Gradient schwarz 50%) |

---

## THUMBNAIL 3: KONFERENZEN & EVENTS

### Bildgenerator-Prompt
```
Wide shot of a large modern conference hall from the back. 500 people seated in rows, many holding up smartphones with glowing screens showing different languages. On the massive LED stage screen, a large QR code is displayed. Blue stage lighting creates dramatic atmosphere. The audience is a sea of glowing phone screens in the dark hall, like stars. Professional corporate event setting. Photorealistic, cinematic, 16:9, no text.
```

### Canva-Layout
```
┌──────────────────────────────────────────┐
│                                          │
│  [Konferenzhalle mit leuchtenden Phones ]│
│                                          │
│     ┌──────────────────────────────┐     │
│     │  €11,400  →  €299           │     │
│     │  ~~struck~~    /DAY          │     │
│     └──────────────────────────────┘     │
│                                          │
│  ┌────────────────────────────────────┐  │
│  │ 45 LANGUAGES • 30 SEC SETUP      │  │
│  └────────────────────────────────────┘  │
└──────────────────────────────────────────┘
```

| Element | Spec |
|---------|------|
| **"€11,400"** | Inter Black, 90px, Rot #FF3B3B, durchgestrichen (diagonale Linie) |
| **Pfeil "→"** | 60px, Weiss |
| **"€299"** | Inter Black, 90px, Gruen #00C853 |
| **"/DAY"** | Inter Bold, 40px, Weiss, neben €299 |
| **Badge unten** | "45 LANGUAGES • 30 SEC SETUP" (Inter Bold, 28px, Weiss auf Blau #1A8CFF) |
| **Position** | Alles zentriert |
| **Hintergrund** | Mittlerer Bereich abgedunkelt (runder Gradient schwarz 60%) |

---

## THUMBNAIL 4: NGOs & GEFLUECHTETEN-HILFE

### Bildgenerator-Prompt
```
Outdoor scene at a refugee aid station. A female humanitarian worker wearing an orange safety vest sits at a folding table under a canvas canopy. Across from her, a young Eritrean mother holds an infant. Between them on the table, a tablet glows with translations. Golden sunlight breaks through clouds after rain. The mood is hopeful and warm despite the modest setting — containers and tents visible in the background. Both women share a genuine smile of connection. Photorealistic, documentary-style, 16:9, no text.
```

### Canva-Layout
```
┌──────────────────────────────────────────┐
│                                          │
│  [Sozialarbeiterin + Mutter mit Kind    ]│
│                                          │
│            ┌──────────────┐              │
│            │    FREE      │              │
│            │  FOREVER     │              │
│            └──────────────┘              │
│                                          │
│  ┌────────────────────────────────────┐  │
│  │ FOR NGOs • 10 LANGUAGES • OFFLINE │  │
│  └────────────────────────────────────┘  │
└──────────────────────────────────────────┘
```

| Element | Spec |
|---------|------|
| **"FREE"** | Inter Black, 120px, Gruen #00C853, leichter Glow-Effekt |
| **"FOREVER"** | Inter Black, 80px, Weiss |
| **Badge unten** | "FOR NGOs • 10 LANGUAGES • OFFLINE" (Inter Bold, 24px, Weiss auf Blau #1A8CFF) |
| **Position** | "FREE FOREVER" zentriert, obere Haelfte |
| **Hintergrund** | Zentrierter dunkler Vignette-Effekt, Gesichter bleiben hell |

---

## THUMBNAIL 5: BILDUNGSEINRICHTUNGEN

### Bildgenerator-Prompt
```
A bright, cheerful classroom. A female teacher in her 30s stands at a whiteboard smiling proudly. At desks in front of her, 15 diverse children aged 10-14 from different ethnicities — African, Middle Eastern, Asian, European — raise their hands eagerly. Some have tablets on their desks showing translations. The room is colorful with student artwork on walls. Warm natural light from large windows. The atmosphere is joyful, engaged, alive with learning. Photorealistic, warm, 16:9, no text.
```

### Canva-Layout
```
┌──────────────────────────────────────────┐
│                                          │
│  [Lehrerin + diverse Kinder, Haende hoch]│
│                                          │
│  ┌────────────────────────────────────┐  │
│  │   EVERY CHILD                     │  │
│  │   UNDERSTANDS ✓                   │  │
│  └────────────────────────────────────┘  │
│                                          │
│  ┌──────────────┐ ┌────────────────────┐ │
│  │ 9 LANGUAGES  │ │ FREE FOR TEACHERS │ │
│  └──────────────┘ └────────────────────┘ │
└──────────────────────────────────────────┘
```

| Element | Spec |
|---------|------|
| **"EVERY CHILD"** | Inter Black, 70px, Weiss |
| **"UNDERSTANDS ✓"** | Inter Black, 70px, Gelb #FFD700, Haekchen in Gruen |
| **Badge links** | "9 LANGUAGES" (Inter Bold, 24px, Weiss auf Blau #1A8CFF) |
| **Badge rechts** | "FREE FOR TEACHERS" (Inter Bold, 24px, Weiss auf Gruen #00C853) |
| **Position** | Text unteres Drittel |
| **Hintergrund** | Untere 35% sanfter schwarzer Gradient |

---

## THUMBNAIL 6: TOURISMUS & REISEINDUSTRIE

### Bildgenerator-Prompt
```
A touring coach bus parked at a stunning Mediterranean coastal overlook at sunset. Orange-gold sky, turquoise sea below. In front of the bus, a diverse group of happy tourists takes a group selfie — Chinese, Korean, Japanese, European, Brazilian, Indian tourists all smiling. Some hold phones showing translations. The tour guide stands proudly in the center. The mood is joy, connection, adventure. Cinematic sunset lighting, vibrant colors. Photorealistic, 16:9, no text.
```

### Canva-Layout
```
┌──────────────────────────────────────────┐
│                                          │
│  [Bus + Touristen bei Sunset            ]│
│                                          │
│  ★★★★★                                  │
│  ┌────────────────────────────────────┐  │
│  │  5 STARS IN                       │  │
│  │  EVERY LANGUAGE                   │  │
│  └────────────────────────────────────┘  │
│                                          │
│  ┌──────────┐  ┌───────────────────────┐ │
│  │ €49/MO   │  │ NO HARDWARE NEEDED   │ │
│  └──────────┘  └───────────────────────┘ │
└──────────────────────────────────────────┘
```

| Element | Spec |
|---------|------|
| **5 Sterne** | ★★★★★ (Gelb #FFD700, 50px, oben links) |
| **"5 STARS IN"** | Inter Black, 60px, Weiss |
| **"EVERY LANGUAGE"** | Inter Black, 70px, Gelb #FFD700 |
| **Badge links** | "€49/MO" (Inter Bold, 28px, Weiss auf Gruen #00C853) |
| **Badge rechts** | "NO HARDWARE NEEDED" (Inter Bold, 24px, Weiss auf Blau #1A8CFF) |
| **Hintergrund** | Sunset-Farben natuerlich, untere 40% dunkler Gradient |

---

## THUMBNAIL 7: INVESTOREN

### Bildgenerator-Prompt
```
Abstract dark technology background with a glowing blue world map made of connected dots and lines. Data visualization overlay: growth charts trending upward, node connections between continents. The color palette is deep navy blue (#0D1B2A) with bright blue (#1A8CFF) glowing elements and subtle warm orange accents. Premium, futuristic, data-driven aesthetic. Clean, minimal, professional. 16:9, no text.
```

### Canva-Layout
```
┌──────────────────────────────────────────┐
│                                          │
│  [Dunkle Tech-Weltkarte                 ]│
│                                          │
│  ┌────────────────────────────────────┐  │
│  │   $65B MARKET                     │  │
│  │   0 COMPETITORS                   │  │
│  │   OFFLINE                         │  │
│  └────────────────────────────────────┘  │
│                                          │
│  ┌──────────────────────────────────┐    │
│  │ €250K SEED • 85% MARGIN • 12M ARR│   │
│  └──────────────────────────────────┘    │
│  [fintutto logo klein rechts unten]      │
└──────────────────────────────────────────┘
```

| Element | Spec |
|---------|------|
| **"$65B MARKET"** | Inter Black, 90px, Weiss |
| **"0 COMPETITORS"** | Inter Black, 70px, Gruen #00C853 |
| **"OFFLINE"** | Inter Black, 70px, Blau #1A8CFF |
| **Badge unten** | "€250K SEED • 85% MARGIN • 12M ARR" (Inter Bold, 22px, Weiss auf halbtransparent schwarz) |
| **Fintutto-Logo** | Klein, rechts unten, Weiss |
| **Hintergrund** | Dunkel mit leuchtenden Blau-Akzenten, kein Gradient noetig |

---

## THUMBNAIL 8: BETA-TESTER

### Bildgenerator-Prompt
```
A diverse group of young tech-savvy people in their 20s-30s sitting in a modern coworking space, all holding smartphones and looking at the camera with excited, curious expressions. One person in the center holds their phone toward the camera showing a glowing screen. Colorful, energetic lighting — neon blue and warm orange accents. The mood is fun, modern, startup-culture. Slightly wide-angle lens for dynamic feel. Photorealistic, vibrant, 16:9, no text.
```

### Canva-Layout
```
┌──────────────────────────────────────────┐
│                                          │
│  [Junge Leute mit Phones                ]│
│                                          │
│  ┌────────────┐                          │
│  │   BETA     │  ┌─────────────────────┐ │
│  │            │  │  BREAK              │ │
│  └────────────┘  │  THIS APP           │ │
│                   └─────────────────────┘ │
│                                          │
│  ┌────────────────────────────────────┐  │
│  │ FREE PRO • 45 LANG • NO DOWNLOAD │  │
│  └────────────────────────────────────┘  │
└──────────────────────────────────────────┘
```

| Element | Spec |
|---------|------|
| **"BETA"** | Roter Stempel-Stil, 60px, Rot #FF3B3B, leicht schraeg (-5 Grad), Stempel-Textur |
| **"BREAK"** | Inter Black, 80px, Weiss |
| **"THIS APP"** | Inter Black, 80px, Gelb #FFD700 |
| **Badge unten** | "FREE PRO • 45 LANG • NO DOWNLOAD" (Inter Bold, 24px, Weiss auf Blau #1A8CFF) |
| **Position** | "BETA" oben links als Stempel, "BREAK THIS APP" rechte Haelfte |
| **Hintergrund** | Leicht abgedunkelt, Gesichter bleiben hell |

---

## THUMBNAIL 9a: KREUZFAHRT PART 1 (Emotional)

### Bildgenerator-Prompt
```
A massive luxury cruise ship photographed from sea level at golden sunset. The ship is enormous, filling most of the frame, with warm golden light reflecting off its white hull. Multiple decks visible with tiny figures of passengers. The Mediterranean Sea is crystal blue with golden reflections. Dramatic clouds in orange and gold. The ship looks majestic, premium, impressive. Shot from a low angle to emphasize scale. Cinematic, epic, luxurious. Photorealistic, 16:9, no text.
```

### Canva-Layout
```
┌──────────────────────────────────────────┐
│                                          │
│  [Kreuzfahrtschiff bei Sunset           ]│
│                                          │
│  ┌────────────────────────────────────┐  │
│  │  3,000 PASSENGERS                 │  │
│  │  22 LANGUAGES                     │  │
│  │  0 INTERPRETERS                   │  │
│  └────────────────────────────────────┘  │
│                                          │
│  ┌──────────────────────────────────┐    │
│  │ SAVES €6.6M / YEAR              │    │
│  └──────────────────────────────────┘    │
└──────────────────────────────────────────┘
```

| Element | Spec |
|---------|------|
| **"3,000 PASSENGERS"** | Inter Black, 60px, Weiss |
| **"22 LANGUAGES"** | Inter Black, 60px, Blau #1A8CFF |
| **"0 INTERPRETERS"** | Inter Black, 70px, Gruen #00C853 |
| **Badge unten** | "SAVES €6.6M / YEAR" (Inter Black, 32px, Gelb #FFD700 auf Schwarz halbtransparent) |
| **Position** | Text rechte Haelfte, vertikal zentriert |
| **Hintergrund** | Rechte 50% dunkler Gradient fuer Lesbarkeit |

---

## THUMBNAIL 9b: KREUZFAHRT PART 2 (Business Case)

### Bildgenerator-Prompt
```
Split image: left side shows a dark conference room with expensive interpretation equipment, cables, and stressed technicians — tinted red/orange, moody, overwhelming. Right side shows a single clean smartphone displaying a QR code against a bright blue background with a cruise ship silhouette — tinted blue, clean, modern, simple. The contrast between complexity and simplicity is stark. Photorealistic, 16:9, no text.
```

### Canva-Layout
```
┌──────────────────────────────────────────┐
│                                          │
│  [Links: Rot/Chaos] │ [Rechts: Blau/QR] │
│                      │                   │
│  ┌────────────┐      │  ┌──────────────┐ │
│  │ €560,000   │      │  │   €6,990     │ │
│  │  /MONTH    │      │  │   /MONTH     │ │
│  └────────────┘      │  └──────────────┘ │
│                      │                   │
│          ┌───────────────────┐           │
│          │   8,000% ROI      │           │
│          └───────────────────┘           │
└──────────────────────────────────────────┘
```

| Element | Spec |
|---------|------|
| **"€560,000"** | Inter Black, 70px, Rot #FF3B3B, durchgestrichen |
| **"/MONTH"** | Inter Bold, 30px, Rot, unter der Zahl |
| **"€6,990"** | Inter Black, 70px, Gruen #00C853 |
| **"/MONTH"** | Inter Bold, 30px, Weiss |
| **"8,000% ROI"** | Inter Black, 50px, Gelb #FFD700, zentriert unten ueber beide Seiten |
| **Trennlinie** | Vertikale weisse Linie in der Mitte, 2px |
| **Links** | Roetlicher Overlay (Rot 20% Opazitaet) |
| **Rechts** | Blaeulicher Overlay (Blau 15% Opazitaet) |

---

## SCHNELL-REFERENZ: ALLE 9 THUMBNAILS

| # | Video | Haupttext | Highlight-Farbe | Emotion |
|---|-------|-----------|----------------|---------|
| 1 | Tours | "1 VOICE → 45 LANGUAGES" | Gelb auf Golden-Hour | Staunen |
| 2 | Behoerden | "NO INTERPRETER NEEDED" | Weiss auf Institutionell | Erleichterung |
| 3 | Events | "€11,400 → €299" | Rot durchgestrichen → Gruen | Schock |
| 4 | NGOs | "FREE FOREVER" | Gruen auf Hoffnungsvoll | Verbindung |
| 5 | Bildung | "EVERY CHILD UNDERSTANDS" | Gelb auf Klassenzimmer | Freude |
| 6 | Tourismus | "★★★★★ EVERY LANGUAGE" | Gelb Sterne auf Sunset | Glueck |
| 7 | Investoren | "$65B MARKET / 0 COMPETITORS" | Gruen auf Dark-Tech | Beeindruckt |
| 8 | Beta | "BREAK THIS APP" | Rot-Stempel + Gelb | Neugier |
| 9a | Cruise Emotional | "3,000 / 22 / 0" | Blau-Gruen auf Schiff | Episch |
| 9b | Cruise Business | "€560K → €6,990" | Rot→Gruen Split | Schock |

---

## CANVA QUICK-SETUP (fuer alle Thumbnails)

### Schritt-fuer-Schritt

1. **Neues Design**: 1280 x 720 px
2. **Hintergrund hochladen**: KI-generiertes Bild
3. **Dunkel-Gradient hinzufuegen**: Rechteck, Schwarz, 40-60% Opazitaet, untere/rechte Haelfte
4. **Haupttext**: Inter Black (oder Montserrat Black), 60-90px, Weiss
5. **Highlight-Text**: Gleiche Schrift, Farbe je nach Video (Gelb/Gruen/Rot)
6. **Badge**: Abgerundetes Rechteck, Vollfarbe, weisser Text, 24-28px
7. **Optional**: Fintutto-Logo klein rechts unten (10% Groesse)
8. **Export**: PNG, hoechste Qualitaet

### Schrift-Hierarchie (immer gleich)

| Level | Schrift | Groesse | Farbe |
|-------|---------|---------|-------|
| **Headline** | Inter Black | 70-90px | Weiss oder Gelb |
| **Sub-Headline** | Inter Black | 50-70px | Gruen oder Blau |
| **Badge** | Inter Bold | 24-28px | Weiss auf Farbhintergrund |
| **Klein** | Inter Medium | 18-22px | Weiss 80% Opazitaet |

### Drop-Shadow fuer alle Texte
- Farbe: Schwarz
- Opazitaet: 60%
- X/Y-Offset: 2px / 2px
- Blur: 4px
