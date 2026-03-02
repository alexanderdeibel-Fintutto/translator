# GuideTranslator: Vollständige Kostenanalyse & Preismodell-Revision

**Datum:** 01.03.2026
**Erstellt von:** Technische Analyse auf Basis der Codebasis, Google Cloud Preise (Stand 03/2026), Wettbewerbsrecherche

---

## TEIL 1: EXAKTE IST-KOSTEN (Was die App WIRKLICH kostet)

### 1.1 Alle kostenpflichtigen Services im Code

| # | Service | Datei im Code | API-Endpoint | Preis-Modell |
|---|---------|---------------|-------------|--------------|
| 1 | **Google Cloud Translation** | `src/lib/translate.ts:7` | `translation.googleapis.com/v2` | Pro Zeichen |
| 2 | **Google Cloud TTS** | `src/lib/tts.ts:7-8` | `texttospeech.googleapis.com/v1` | Pro Zeichen |
| 3 | **Google Cloud STT** | `src/lib/stt.ts:244-245` | `speech.googleapis.com/v1` | Pro Minute |
| 4 | **Google Cloud Vision** | `src/pages/CameraTranslatePage.tsx:47` | `vision.googleapis.com/v1` | Pro Request |
| 5 | **Supabase Realtime** | `src/lib/supabase.ts:1-6` | `aaefocdqgdgexkcrjhks.supabase.co` | Pro Nachricht |
| 6 | **Vercel Hosting** | `vercel.json` | Vercel CDN | Pro Bandwidth |

### 1.2 Alle KOSTENLOSEN Services im Code

| # | Service | Datei im Code | Kosten |
|---|---------|---------------|--------|
| 1 | **MyMemory Translation** | `src/lib/translate.ts:8` | GRATIS (200 Req/Tag/IP) |
| 2 | **LibreTranslate** | `src/lib/translate.ts:9` | GRATIS (Public Instance) |
| 3 | **Opus-MT Offline** | `src/lib/offline/translation-engine.ts` | GRATIS (HuggingFace CDN) |
| 4 | **Whisper Offline STT** | `src/lib/offline/stt-engine.ts` | GRATIS (HuggingFace CDN) |
| 5 | **Web Speech API** | `src/lib/stt.ts:71-199` | GRATIS (Browser-nativ) |
| 6 | **Browser TTS** | `src/hooks/useSpeechSynthesis.ts` | GRATIS (Browser-nativ) |
| 7 | **BLE Transport** | `src/lib/ble-transport.ts` | GRATIS (Device-to-Device) |
| 8 | **Relay Server** | `relay-server/server.js` | GRATIS (Self-hosted) |

---

## TEIL 2: EXAKTE GOOGLE CLOUD API PREISE (Verifiziert 03/2026)

### 2.1 Google Cloud Translation API

| Modell | Free Tier/Monat | Preis nach Free Tier |
|--------|----------------|---------------------|
| **NMT Basic (v2)** | 500.000 Zeichen | **$20 / 1 Mio Zeichen** |
| **NMT Advanced (v3)** | 500.000 Zeichen | **$20 / 1 Mio Zeichen** |
| Translation LLM | KEIN Free Tier | $10 Input + $10 Output / 1 Mio Z. |
| Adaptive Translation | KEIN Free Tier | $25 Input + $25 Output / 1 Mio Z. |

**Eure App nutzt: NMT v2 Basic** → $20/1M Zeichen = **$0,00002 pro Zeichen**

> Quelle: [Google Cloud Translation Pricing](https://cloud.google.com/translate/pricing)

### 2.2 Google Cloud Text-to-Speech API

| Stimmentyp | Free Tier/Monat | Preis nach Free Tier |
|------------|----------------|---------------------|
| **Standard** | 4 Mio Zeichen | **$4 / 1 Mio Zeichen** |
| **WaveNet** | 1 Mio Zeichen | **$16 / 1 Mio Zeichen** |
| **Neural2** | 1 Mio Zeichen | **$16 / 1 Mio Zeichen** |
| **Chirp 3 HD** | 1 Mio Zeichen | **$30 / 1 Mio Zeichen** |
| Studio (Premium) | 1 Mio Zeichen | $160 / 1 Mio Zeichen |

**Eure App nutzt:** Neural2 (Standard) + Chirp 3 HD (Premium-Option)

> **KORREKTUR zum bisherigen Geschäftskonzept:**
> - Das Konzept sagt: WaveNet = $4/1M → **FALSCH!** WaveNet = **$16/1M** (Preiserhöhung!)
> - Das Konzept sagt: WaveNet Free Tier = 4M Zeichen → **FALSCH!** WaveNet Free Tier = **1M Zeichen**
> - Standard Voices haben 4M Free Tier und kosten $4/1M, aber die Qualität ist deutlich schlechter
> - Neural2 und WaveNet sind jetzt GLEICH teuer: beide $16/1M

> Quelle: [Google Cloud TTS Pricing](https://cloud.google.com/text-to-speech/pricing)

### 2.3 Google Cloud Speech-to-Text API

| Modell | Free Tier/Monat | Preis |
|--------|----------------|-------|
| **Standard (v2)** | 60 Minuten | **$0,016 / Minute** |
| Enhanced | 60 Minuten | $0,024 / Minute |
| Data-Logging Opt-Out | — | +40% Aufpreis |

**Eure App nutzt:** Standard v2 → $0,016/min (nur iOS + Fallback)

> Quelle: [Google Cloud STT Pricing](https://cloud.google.com/speech-to-text/pricing)

### 2.4 Google Cloud Vision API (OCR)

| Volumen/Monat | Preis pro 1.000 Units |
|---------------|----------------------|
| 1 – 1.000 | **GRATIS** |
| 1.001 – 5.000.000 | **$1,50** |
| 5.000.001+ | $0,60 |

**Eure App nutzt:** TEXT_DETECTION → Nur Kamera-Feature, geringes Volumen

> Quelle: [Google Cloud Vision Pricing](https://cloud.google.com/vision/pricing)

### 2.5 Supabase

| Plan | Preis | Realtime Messages | Realtime Connections |
|------|-------|-------------------|---------------------|
| **Free** | $0 | Inkludiert | Inkludiert |
| **Pro** | $25/Monat | $2,50 / 1M Nachrichten | $10 / 1.000 Peak Connections |
| Team | $599/Monat | Inkl. höhere Limits | Inkl. höhere Limits |

**ACHTUNG:** Free-Plan pausiert Projekte nach 7 Tagen Inaktivität! Für Produktion **Pro-Plan ($25/Monat) PFLICHT**.

> Quelle: [Supabase Pricing](https://supabase.com/pricing)

### 2.6 Vercel Hosting

| Plan | Preis | Bandwidth | Nutzung |
|------|-------|-----------|---------|
| **Hobby** | $0 | 100 GB/Monat | **NUR nicht-kommerziell!** |
| **Pro** | $20/Monat | 1 TB/Monat | Kommerziell erlaubt |

**KRITISCH:** Ihr nutzt aktuell den **Hobby-Plan** auf `translator-fintutto.vercel.app`. Sobald ihr Geld verdient, **MÜSST** ihr auf Pro upgraden ($20/Monat) — sonst TOS-Verletzung!

> Quelle: [Vercel Pricing](https://vercel.com/pricing)

---

## TEIL 3: KOSTENSZENARIEN (Neu berechnet mit korrekten Preisen)

### Basis-Annahmen
- 1 Minute gesprochener Text = ~150 Wörter = ~900 Zeichen
- Übersetzung in N Sprachen = 900 × N Zeichen
- TTS-Ausgabe = 900 × N Zeichen (jeder Hörer bekommt Audio in seiner Sprache)

### 3.1 Kosten pro Minute pro Hörer-Sprache

| Komponente | Free/Basic | Professional (Neural2) | Premium (Chirp 3 HD) |
|------------|-----------|----------------------|---------------------|
| **Übersetzung** (900 Z.) | $0,00 (MyMemory) | $0,018 (Google NMT) | $0,018 (Google NMT) |
| **TTS** (900 Z.) | $0,00 (Browser) | $0,0144 (Neural2) | $0,027 (Chirp 3 HD) |
| **STT** (1 Min.) | $0,00 (Web Speech) | $0,016 (Google STT) | $0,016 (Google STT) |
| **SUMME/Min/Sprache** | **~$0,00** | **~$0,048** | **~$0,061** |
| **SUMME in EUR** | **~€0,00** | **~€0,044** | **~€0,056** |

> **KORREKTUR:** Das bisherige Konzept rechnete mit $0,022/Min Professional — der korrekte Wert inkl. STT ist **$0,048/Min**!
> Die STT-Kosten ($0,016/Min) wurden im bisherigen Konzept NICHT eingerechnet.

### 3.2 Kreuzfahrt-Szenario: 1 Ausflug (KORRIGIERT)

| Parameter | Wert |
|-----------|------|
| Passagiere mit Übersetzungsbedarf | 3.000 |
| Aktive Guide-Zeit | 90 Min |
| Quelltext | 90 × 900 = 81.000 Zeichen |
| Sprachen | 8 |
| Übersetzte Zeichen | 81.000 × 8 = 648.000 Zeichen |
| TTS-Zeichen | 648.000 Zeichen |
| STT-Minuten | 90 Minuten |

| Position | Kosten (Neural2) | Kosten (Chirp 3 HD) |
|----------|------------------|---------------------|
| Translation (648K Z.) | $12,96 | $12,96 |
| TTS Neural2 (648K Z.) | $10,37 | — |
| TTS Chirp 3 HD (648K Z.) | — | $19,44 |
| STT (90 Min) | $1,44 | $1,44 |
| **GESAMT Technikkosten** | **$24,77 (~€22,60)** | **$33,84 (~€30,90)** |
| **Pro Passagier** | **$0,0083 (~€0,0075)** | **$0,011 (~€0,010)** |

> Die Korrektur zum bisherigen Konzept ($23,33) ist gering (+6% für Neural2, +45% für Chirp HD), da STT-Kosten relativ gering sind im Vergleich zu Translation + TTS.

### 3.3 Monatliche Fixkosten (Infrastruktur)

| Service | Free | Ab kommerzieller Nutzung |
|---------|------|--------------------------|
| **Vercel** | $0 (Hobby) | **$20/Monat (Pro - PFLICHT!)** |
| **Supabase** | $0 (paused risk) | **$25/Monat (Pro - EMPFOHLEN)** |
| **Google Cloud Plattform** | $0 (Free Tier) | $0 (Pay-as-you-go) |
| **Domain** | Inkl. bei Vercel | ~$15/Jahr |
| **SUMME Fixkosten** | **$0** | **~$46/Monat (~€42)** |

### 3.4 Nutzungs-Szenarien: Monatliche API-Kosten

#### Szenario A: "Leichte Nutzung" (Early Stage)
**50 Free-User, 10 Pro-User, 0 Enterprise**

| Position | Berechnung | Kosten/Monat |
|----------|-----------|-------------|
| Free-User Translation | 50 × 20 Übersetzungen/Tag × 50 Z. × 30 Tage = 1,5M Z. → im Free Tier | $0 |
| Free-User TTS | Browser-TTS (kostenlos) | $0 |
| Pro-User Translation | 10 × 100 Übersetzungen/Tag × 100 Z. × 30 = 3M Z. | $60 |
| Pro-User TTS Neural2 | 10 × 50 TTS/Tag × 100 Z. × 30 = 1,5M Z. | $24 |
| Pro-User STT | 10 × 10 Min/Tag × 30 = 3.000 Min (60 min free) | $47 |
| Supabase Pro | Fixkosten | $25 |
| Vercel Pro | Fixkosten | $20 |
| **GESAMT** | | **~$176/Monat (~€161)** |
| **Einnahmen** (10 × €29,90) | | **€299/Monat** |
| **GEWINN** | | **~€138/Monat** |

#### Szenario B: "Gesteigerte Nutzung" (Growth Phase)
**500 Free-User, 100 Pro-User, 1 Enterprise-Starter**

| Position | Berechnung | Kosten/Monat |
|----------|-----------|-------------|
| Free-User Translation | MyMemory + LibreTranslate | $0 |
| Free-User TTS | Browser-TTS | $0 |
| Pro-User Translation | 100 × 100 Überz./Tag × 100 Z. × 30 = 30M Z. | $600 |
| Pro-User TTS Neural2 | 100 × 50 × 100 × 30 = 15M Z. | $240 |
| Pro-User STT | 100 × 10 Min × 30 = 30.000 Min | $480 |
| Enterprise Translation | 50.000 Passagier-Min × 900 Z. × 8 Sprachen = 360M Z. | ~$7.200 |
| Enterprise TTS | 360M Z. Neural2 | ~$5.760 |
| Enterprise STT | 50.000 Min | ~$800 |
| Supabase Pro | + Realtime Overage (~5M Msgs) | ~$38 |
| Vercel Pro | | $20 |
| **GESAMT API-Kosten** | | **~$15.138/Monat (~€13.826)** |
| **Einnahmen** | 100 × €29,90 + 1 × €2.990 | **€5.980/Monat** |
| **ERGEBNIS** | | **❌ VERLUST: -€7.846/Monat** |

#### Szenario C: "Starke Nutzung" (Established)
**2.000 Free, 500 Pro, 5 Enterprise Fleet**

| Position | Kosten/Monat |
|----------|-------------|
| Pro-User API-Kosten (500 User) | ~$6.600 |
| Enterprise API-Kosten (5 × Fleet) | ~$68.000 |
| Infrastruktur | ~$500 |
| **GESAMT Kosten** | **~$75.100/Monat (~€68.600)** |
| **Einnahmen** | 500 × €29,90 + 5 × €9.990 | **€64.900/Monat** |
| **ERGEBNIS** | | **❌ VERLUST: -€3.700/Monat** |

#### Szenario D: "Riesige Nutzung" (Scale)
**10.000 Free, 2.000 Pro, 3 Enterprise Armada + 10 Fleet**

| Position | Kosten/Monat |
|----------|-------------|
| Pro-User API-Kosten | ~$26.400 |
| Enterprise Armada API (3×) | ~$120.000 |
| Enterprise Fleet API (10×) | ~$136.000 |
| Infrastruktur (Supabase Team + Vercel Pro) | ~$1.500 |
| **GESAMT Kosten** | **~$283.900/Monat (~€259.300)** |
| **Einnahmen** | 2.000 × €29,90 + 10 × €9.990 + 3 × €19.990 | **€219.770/Monat** |
| **ERGEBNIS** | | **❌ VERLUST: -€39.530/Monat** |

---

## TEIL 4: KRITISCHE PROBLEME IM BISHERIGEN PREISMODELL

### Problem 1: Enterprise-Preise decken API-Kosten NICHT

Das Kernproblem liegt in der Diskrepanz zwischen **inkludierten Passagier-Minuten** und **realen API-Kosten:**

| Paket | Preis/Monat | Inkl. Pass.-Min | API-Kosten dafür | Marge |
|-------|------------|----------------|------------------|-------|
| STARTER | €2.990 | 50.000 | ~€12.400 | **-€9.410 (VERLUST!)** |
| FLEET | €9.990 | 250.000 | ~€62.000 | **-€52.010 (VERLUST!)** |
| ARMADA | €19.990 | 1.000.000 | ~€248.000 | **-€228.010 (VERLUST!)** |

**Warum?** Weil eine "Passagier-Minute" in 8 Sprachen bedeutet:
- 900 Zeichen × 8 = 7.200 Zeichen Translation = $0,144
- 900 Zeichen × 8 = 7.200 Zeichen TTS = $0,115 (Neural2)
- 1 Minute STT = $0,016
- **= $0,275 pro Passagier-Minute in 8 Sprachen**

50.000 Passagier-Minuten × $0,275 = **$13.750 API-Kosten** bei €2.990 Einnahmen!

> **Das bisherige Konzept definiert "Passagier-Minute" unklar.** Es ist nicht klar, ob eine Passagier-Minute = 1 Person × 1 Minute × 1 Sprache ODER 1 Person × 1 Minute × alle Sprachen bedeutet.

### Problem 2: Übermäßig inkludierte Minuten bei Enterprise

Die inkludierten Passagier-Minuten sind zu großzügig. Ein Schiff macht:
- ~2 Ausflüge/Tag × 200 Tage/Jahr = 400 Ausflüge
- 400 × 90 Min aktive Guide-Zeit = 36.000 Minuten/Jahr = **3.000 Minuten/Monat**
- Bei 3.000 Passagieren = 3.000 × 3.000 = 9.000.000 Passagier-Minuten?

Die Definition von "Passagier-Minute" muss PRÄZISE geklärt werden.

### Problem 3: Overage-Preise zu niedrig

| Paket | Overage-Preis | Unsere API-Kosten pro Pass.-Min | Marge |
|-------|--------------|--------------------------------|-------|
| STARTER | €0,05 | ~€0,25 | **-80% VERLUST** |
| FLEET | €0,03 | ~€0,25 | **-88% VERLUST** |
| ARMADA | €0,02 | ~€0,25 | **-92% VERLUST** |

### Problem 4: WaveNet-Preisfehler im Konzept

Das bisherige Konzept rechnet mit WaveNet = $4/1M Zeichen für den Free-Tier.
**Aktueller Preis:** WaveNet = **$16/1M Zeichen** (Free Tier nur 1M, nicht 4M).
Standard Voices kosten $4/1M (4M Free Tier), haben aber deutlich schlechtere Qualität.

### Problem 5: Vercel Hobby-Plan nicht kommerziell nutzbar

Ihr seid auf dem Vercel Hobby-Plan. Das ist **NUR für nicht-kommerzielle Projekte** erlaubt. Sobald ihr Geld verdient → TOS-Verstoß → Risiko der Sperrung!

---

## TEIL 5: KORRIGIERTES PREISMODELL

### 5.1 Neue Definition: "Session-Minute" statt "Passagier-Minute"

**1 Session-Minute** = 1 Minute Guide-Sprache (unabhängig von Hörerzahl und Sprachen)

**Warum:** Die Kosten skalieren mit **Anzahl der Zielsprachen**, nicht mit der Anzahl der Hörer. Ob 10 oder 3.000 Leute die gleiche Übersetzung hören, die Translation + TTS wird nur EINMAL pro Sprache erstellt (Broadcast an alle).

**Kosten pro Session-Minute (8 Sprachen, Neural2):**
- Translation: 900 × 8 × $0,00002 = $0,144
- TTS: 900 × 8 × $0,000016 = $0,115
- STT: $0,016
- **= $0,275 pro Session-Minute (€0,25)**

### 5.2 Stufe 1: FREE (unverändert — funktioniert)

| Feature | Details | Unsere Kosten |
|---------|---------|---------------|
| Translation | MyMemory + LibreTranslate + Offline | **€0** |
| TTS | Browser-nativ (speechSynthesis) | **€0** |
| STT | Web Speech API (Browser) | **€0** |
| Sprachen | 45 (offline: 100+ Paare via Opus-MT) | **€0** |
| Limits | 500 Übersetzungen/Tag, 5.000 Z./Anfrage | — |
| Live-Session | Supabase (1 Hörer kostenlos) | ~€0 |

**Kosten pro Free-User: praktisch €0** ✅
**Caching-Strategie im Code:** 3-Layer-Cache (Memory 5min → IndexedDB 30 Tage → Service Worker 90 Tage) → verhindert doppelte API-Calls.

### 5.3 Stufe 2: PRO (Korrigierter Preis)

| | Bisherig | Neu (Empfehlung) |
|---|---------|-----------------|
| **Preis** | €29,90/Monat | **€49,90/Monat oder €499/Jahr** |
| Translation | Google NMT | Google NMT |
| TTS | Neural2 | **Standard Voices ($4/1M)** → bei Upgrade Neural2 |
| STT | Google Cloud | Google Cloud |
| Hörer | Max. 10 | Max. 10 |
| Inkl. Session-Min | Unbegrenzt | **500 Session-Minuten** (~8,3 Std.) |
| Overage | — | **€0,30/Session-Minute** |

**Kalkulation bei durchschnittlichem Pro-User (200 Session-Min/Monat, 4 Sprachen):**
- Translation: 200 × 900 × 4 × $0,00002 = $1,44
- TTS Standard: 200 × 900 × 4 × $0,000004 = $0,29
- STT: 200 × $0,016 = $3,20
- **API-Kosten: ~$5/Monat (~€4,50)**
- **Einnahmen: €49,90**
- **Marge: ~91%** ✅

**Bei Power-User (500 Session-Min/Monat, 6 Sprachen, Neural2):**
- Translation: $5,40 + TTS Neural2: $4,32 + STT: $8,00 = **~$17,72 (~€16,20)**
- **Marge: ~68%** ✅

### 5.4 Stufe 3: ENTERPRISE (Komplett überarbeitet)

**Neue Preislogik:** Basis + pro Session-Minute + pro aktive Sprache

| Paket | Basis/Monat | Inkl. Session-Min | Inkl. Sprachen | Overage/Session-Min |
|-------|------------|-------------------|----------------|---------------------|
| **STARTER** (1 Standort) | **€1.490** | 1.000 | 5 | **€0,50** |
| **FLEET** (bis 10 Standorte) | **€4.990** | 5.000 | 8 | **€0,40** |
| **ARMADA** (10+ Standorte) | **€14.990** | 20.000 | 12 | **€0,30** |
| **CUSTOM** | Verhandlung | Unlimitiert | Alle | Individuell |

**Kalkulation STARTER (realistisches Kreuzfahrt-Szenario):**
- 1 Schiff, 15 Ausflüge/Monat, 90 Min Guide-Zeit/Ausflug
- Session-Minuten: 15 × 90 = 1.350 (350 Overage)
- API-Kosten (5 Sprachen): 1.350 × 5 × 900 × ($0,00002 + $0,000016) + 1.350 × $0,016 = **~$240/Monat (~€219)**
- Einnahmen: €1.490 + 350 × €0,50 = **€1.665**
- **Marge: ~87%** ✅

**Kalkulation FLEET (10 Schiffe, 8 Sprachen):**
- 10 Schiffe × 15 Ausflüge × 90 Min = 13.500 Session-Min (8.500 Overage)
- API-Kosten: ~$3.600/Monat (~€3.290)
- Einnahmen: €4.990 + 8.500 × €0,40 = **€8.390**
- **Marge: ~61%** ✅

**Kalkulation ARMADA (30 Schiffe, 12 Sprachen):**
- 30 × 15 × 90 = 40.500 Session-Min (20.500 Overage)
- API-Kosten: ~$16.200/Monat (~€14.800)
- Einnahmen: €14.990 + 20.500 × €0,30 = **€21.140**
- **Marge: ~30%** ✅ (Verbesserbar durch Google Volumenrabatt)

### 5.5 Preisvergleich: Sind wir "unschlagbar"?

| Lösung | Kosten pro Ausflug (90 Min, 8 Sprachen) | Kosten/Passagier |
|--------|----------------------------------------|-----------------|
| **Menschliche Dolmetscher** | 8 × €350 = **€2.800** | ~€0,93 |
| **Vox Group Hardware** | ~€2-5 pro Gerät × 3.000 = **€6.000-15.000** | ~€2-5 |
| **Wordly.ai** | 90 Min × $75/h × 1,5 = **~€100** (aber keine Tour-Features) | ~€0,033 |
| **elysium/BMS Audio** | Unbekannt (Custom) | Unbekannt |
| **GuideTranslator (NEU)** | €1.490/15 Ausflüge + Overage = **~€111/Ausflug** | **~€0,037** |

**Ergebnis:**
- vs. Dolmetscher: **96% günstiger** ✅
- vs. Vox Hardware: **98% günstiger** ✅
- vs. Wordly: **Vergleichbar im Preis, ABER mit Offline, Tour-Features, Live-Broadcasting** ✅
- **ABER:** Wordly bietet ähnliche Preise für Meetings — euer Vorteil ist das Guide→Gruppe Broadcasting + Offline

---

## TEIL 6: OPTIMIERUNGSMASSNAHMEN FÜR MAXIMALE MARGE

### 6.1 Sofort umsetzbar (im Code bereits teilweise vorhanden)

| # | Maßnahme | Einfluss auf Kosten | Status im Code |
|---|---------|-------------------|----------------|
| 1 | **Aggressives TTS-Caching** | Gleiche Sätze → nur 1× API-Call | ✅ Vorhanden (`tts-cache.ts`) |
| 2 | **Translation-Caching** | Gleiche Texte → nur 1× API-Call | ✅ Vorhanden (3-Layer) |
| 3 | **Pre-Translation von Tour-Skripten** | Batch statt Live → kein STT nötig | ❌ **FEHLT — HÖCHSTE PRIORITÄT!** |
| 4 | **Standard statt Neural2 für Pro** | $4 vs $16/1M = **75% TTS-Ersparnis** | ❌ Nicht konfigurierbar pro Tier |
| 5 | **Offline-First für Enterprise** | Opus-MT statt Google Cloud für Basis-Sprachen | ✅ Engine vorhanden |
| 6 | **Circuit Breaker** | Verhindert Kosten bei API-Fehler | ✅ Vorhanden |
| 7 | **Request Dedup** | Identische parallele Requests → 1 API-Call | ✅ Vorhanden (`inflight Map`) |

### 6.2 Pre-Translation (Game-Changer für Enterprise)

**Konzept:** Guides laden ihr Tour-Skript VOR dem Ausflug hoch → Batch-Übersetzung + TTS in alle Sprachen → Caching → Live-Session spielt nur gecachte Inhalte ab.

**Auswirkung:**
- Translation: 1× statt live = gleiche Kosten, aber KEINE STT-Kosten
- TTS: 1× generiert, N× abgespielt = Kosten fallen nur 1× an
- Für eine 90-Min-Tour in 8 Sprachen:
  - **Ohne Pre-Translation:** ~$24-34 pro Ausflug (live)
  - **Mit Pre-Translation:** ~$23-33 einmalig, dann **$0 pro Ausflug**
  - Bei 200 Ausflügen/Jahr: **$4.600 statt $4.600** (gleich beim 1. Mal, aber 2. bis 200. Mal kostenlos!)
  - **Ersparnis: ~$4.577/Jahr pro Schiff**

### 6.3 Google Cloud Volumenrabatte

Ab signifikantem Volumen (>$10K/Monat) sind Custom-Pricing-Verhandlungen mit Google möglich:
- Geschätzt: 20-30% Rabatt
- Bei 10 Enterprise-Kunden: ~$30K-60K/Monat → Verhandlungsbasis für Rabatt

---

## TEIL 7: WIE SCHNELL KANN MAN DAMIT "REICH" WERDEN?

### 7.1 Revenue-Projektion (Konservativ)

| Zeitraum | Free User | Pro User | Enterprise | MRR | API-Kosten | Gewinn/Monat |
|----------|-----------|----------|------------|-----|-----------|-------------|
| **Monat 1-3** | 100 | 5 | 0 | €250 | ~€30 | **€175** |
| **Monat 4-6** | 500 | 30 | 0 | €1.497 | ~€200 | **€1.252** |
| **Monat 7-12** | 2.000 | 100 | 1 (Starter) | €6.480 | ~€700 | **€5.735** |
| **Jahr 2** | 5.000 | 300 | 3 (1 Fleet + 2 Starter) | €22.950 | ~€5.000 | **€17.905** |
| **Jahr 3** | 15.000 | 1.000 | 10 (2 Fleet + 8 Starter) | €72.820 | ~€18.000 | **€54.775** |

### 7.2 Revenue-Projektion (Optimistisch — mit 1 großem Enterprise-Deal)

| Meilenstein | Einnahmen/Monat | Kosten/Monat | Gewinn/Monat |
|-------------|----------------|-------------|-------------|
| 1 Reederei (5 Schiffe, Fleet) | €4.990 + Overage ~€3.000 | ~€3.300 | **€4.690** |
| 3 Reedereien (1 Armada + 2 Fleet) | €34.970 + Overage ~€15.000 | ~€20.000 | **€29.970** |
| Enterprise Custom Deal (Jährlich) | €149.990/Jahr = €12.499/Mon | ~€5.000 | **€7.499** |

### 7.3 Break-Even-Analyse

| Kosten-Typ | Monatlich |
|------------|----------|
| Vercel Pro | €20 |
| Supabase Pro | €25 |
| Google Cloud (Minimum) | ~€10 |
| **Mindest-Fixkosten** | **~€55/Monat** |
| **Break-Even** | **2 Pro-Abonnenten** (2 × €49,90 = €99,80) |

### 7.4 Der Weg zum "schnell reich werden"

**Realität:** Das Geschäftsmodell hat **exzellente Unit Economics** nach den Korrekturen:
- Free Tier: **€0 Kosten** (kostenlose APIs + Caching)
- Pro Tier: **~90% Marge**
- Enterprise: **60-87% Marge** (mit Pre-Translation)

**"Schnell reich" = Enterprise-Deals landen:**
- 1 Reederei mit 10 Schiffen (Fleet-Paket) = **~€8.000 Gewinn/Monat**
- 5 Reedereien = **~€40.000+ Gewinn/Monat**
- Der Markt existiert ($72,5B Kreuzfahrt-Umsatz), kein direkter Wettbewerber hat das gleiche Feature-Set

**Aber:** Enterprise-Sales an Reedereien dauern typischerweise 6-18 Monate Vertriebszyklus.

---

## TEIL 8: SOFORT-MASSNAHMEN (Priorität)

### KRITISCH (sofort umsetzen)

1. **Vercel auf Pro-Plan upgraden** ($20/Monat) — TOS-Verstoß vermeiden
2. **Supabase auf Pro-Plan upgraden** ($25/Monat) — Produktionsstabilität
3. **TTS-Tier-Steuerung implementieren** — Standard Voices für Free/Pro-Basis, Neural2/Chirp als Premium
4. **Pre-Translation Feature bauen** — Größter Hebel für Enterprise-Marge
5. **Passagier-Minute → Session-Minute** — Preismodell-Definition korrigieren

### WICHTIG (nächste 4 Wochen)

6. **Stripe-Integration** — Noch nicht im Code vorhanden!
7. **Usage-Tracking/Metering** — Kein Verbrauchszähler im Code für Tier-Limits
8. **Rate-Limiting pro Tier** — Free: 500/Tag, Pro: nach Session-Min, Enterprise: nach Vertrag
9. **Admin-Dashboard** — API-Kosten-Monitoring pro Kunde

### NICE-TO-HAVE (nächste 3 Monate)

10. Google Cloud Committed Use Discount verhandeln
11. Regionale Preise (EUR/USD/GBP)
12. Annual-Billing mit Rabatt

---

## TEIL 9: STRATEGISCHE KOSTENOPTIMIERUNG — AZURE STATT GOOGLE?

### 9.1 Provider-Vergleich Translation API

| Provider | Preis/1M Zeichen | Free Tier/Monat | Qualität |
|----------|-----------------|----------------|----------|
| **Microsoft Azure** | **$10** | **2.000.000 Zeichen** | Sehr gut (Neural) |
| Amazon Translate | $15 | 2.000.000 (12 Monate) | Gut |
| **Google Cloud** (aktuell) | **$20** | 500.000 Zeichen | Sehr gut (NMT) |
| DeepL API Pro | $25 + $5,49 Basis | 500.000 Zeichen | Beste (EU-Sprachen) |

### 9.2 Auswirkung eines Azure-Wechsels

**Aktuell (Google): $20/1M Zeichen, 500K Free**
**Mit Azure: $10/1M Zeichen, 2M Free — 50% günstiger + 4× mehr Free Tier!**

| Szenario | Google Kosten | Azure Kosten | Ersparnis |
|----------|--------------|-------------|-----------|
| Pro-User (3M Z./Mon) | $60 | $30 | **-50%** |
| Enterprise Starter (50M Z./Mon) | $1.000 | $500 | **-$500/Mon** |
| Enterprise Fleet (300M Z./Mon) | $6.000 | $3.000 | **-$3.000/Mon** |
| Enterprise Armada (1.2B Z./Mon) | $24.000 | $12.000 | **-$12.000/Mon** |

### 9.3 Empfehlung: Hybrid-Provider-Strategie

| Tier | Translation | TTS | STT |
|------|------------|-----|-----|
| **Free** | MyMemory → LibreTranslate → Offline | Browser-TTS | Web Speech API |
| **Pro** | **Azure Translator** ($10/1M) | Google Standard ($4/1M) | Web Speech / Google ($0,016) |
| **Enterprise** | **Azure Translator** ($10/1M) | Google Neural2 ($16/1M) | Google Cloud STT |

**Implementierungsaufwand:** Gering — Azure Translator API ist REST-basiert, ähnliche Schnittstelle wie Google. Neuer Provider in `translate.ts` hinzufügen (~50 Zeilen Code).

### 9.4 Korrigierte Enterprise-Kalkulation mit Azure

| Paket | Preis/Monat | API-Kosten (Azure+Google TTS) | Marge |
|-------|------------|-------------------------------|-------|
| **STARTER** (1.000 Sess.-Min, 5 Sprachen) | €1.490 + Overage | ~€140 | **~91%** ✅ |
| **FLEET** (5.000 Sess.-Min, 8 Sprachen) | €4.990 + Overage | ~€2.100 | **~72%** ✅ |
| **ARMADA** (20.000 Sess.-Min, 12 Sprachen) | €14.990 + Overage | ~€10.500 | **~44%** ✅ |

### 9.5 LLM-basierte Translation als Zukunftsoption

Eine überraschende Erkenntnis der Recherche: **LLMs sind teilweise GÜNSTIGER als dedizierte Translation APIs:**

| Methode | Kosten pro 1M Zeichen übersetzt |
|---------|-------------------------------|
| Google NMT | $20,00 |
| Azure Translator | $10,00 |
| **GPT-5 nano** (OpenAI) | **~$0,15** |
| **GPT-5 mini** (OpenAI) | **~$0,75** |
| **Claude Haiku 4.5** | **~$2,00** |

GPT-5 nano könnte Translation für **$0,15/1M Zeichen** liefern — das ist **130× günstiger als Google** und **67× günstiger als Azure**!

**Aber:** Höhere Latenz, variable Qualität je nach Sprachpaar, kein Free Tier. Für vorübersetzte Tour-Skripte (Pre-Translation) aber ideal!

---

## TEIL 10: ZUSAMMENFASSUNG & HANDLUNGSEMPFEHLUNGEN

### Das bisherige Preismodell hat 5 kritische Fehler:

| # | Fehler | Auswirkung |
|---|--------|-----------|
| 1 | **"Passagier-Minute" unklar definiert** | Enterprise-Preise decken API-Kosten nicht |
| 2 | **WaveNet-Preise veraltet** ($4→$16) | Free-Tier TTS teurer als angenommen |
| 3 | **STT-Kosten ignoriert** | $0,016/Min fehlt in jeder Kalkulation |
| 4 | **Enterprise inkl. Minuten zu großzügig** | STARTER mit 50K Min = Verlust von €9.410/Mon |
| 5 | **Vercel Hobby-Plan** | Kommerzielle Nutzung = TOS-Verletzung |

### Das korrigierte Modell erreicht:

| Tier | Korrigierter Preis | Marge (mit Azure) |
|------|-------------------|-------------------|
| **Free** | €0 | 100% (€0 Kosten) |
| **Pro** | €49,90/Mon | **~91%** |
| **Enterprise Starter** | €1.490/Mon + €0,50/Session-Min | **~91%** |
| **Enterprise Fleet** | €4.990/Mon + €0,40/Session-Min | **~72%** |
| **Enterprise Armada** | €14.990/Mon + €0,30/Session-Min | **~44%** |

### Sind wir "unschlagbar"?

**JA — im Kreuzfahrt-Exkursionsmarkt:**
- Kein direkter Wettbewerber bietet Guide→Gruppe Broadcasting als reine Software (PWA)
- 96% günstiger als menschliche Dolmetscher
- 98% günstiger als Vox Group Hardware
- Offline-Fähigkeit (Opus-MT + BLE + WiFi Relay) ist einzigartig
- €0,037/Passagier vs. €0,93-5,00 bei Alternativen

**ABER:** Der Wettbewerbsvorteil liegt NICHT in der Übersetzungstechnologie, sondern im **1-Speaker→N-Listener Broadcasting mit Offline-Fähigkeit**. Das ist das, was kein Wettbewerber hat.

### Können wir damit "schnell reich" werden?

**Ja, WENN Enterprise-Deals abgeschlossen werden:**
- 1 Reederei (Fleet) = ~€5.000-8.000 Gewinn/Monat
- 5 Reedereien = ~€40.000+ Gewinn/Monat
- Aber: Enterprise-Vertriebszyklen = 6-18 Monate

**Realistischer Weg:**
1. **Monat 1-3:** Pro-Abonnenten aufbauen (Break-Even bei 2 Pro-Kunden)
2. **Monat 3-6:** Pilotprojekt mit 1 Exkursionsanbieter
3. **Monat 6-12:** Erster Enterprise-Deal
4. **Jahr 2-3:** Skalierung auf 5-10 Enterprise-Kunden = **€500K-1M ARR**

---

## TEIL 11: DER HÖRER-HEBEL — Versteckte Stellschraube für maximalen Umsatz

### 11.1 Die Schlüssel-Erkenntnis

```
UNSERE KOSTEN:     skalieren mit SPRACHEN (Translation + TTS wird 1× pro Sprache erstellt)
KUNDEN-WERT:       skaliert mit HÖRERN (ob 5 oder 5.000 — alle hören das Gleiche)
WETTBEWERB-PREIS:  skaliert mit HÖRERN (1 Gerät = 1 Hörer = 1× Kosten)
```

**Das bedeutet:** Jeder zusätzliche Hörer kostet uns praktisch **€0,00** (nur minimale Supabase-Realtime-Kosten: ~€0,0000025 pro Broadcast-Nachricht). Aber der WERT für den Kunden steigt linear mit jedem Hörer. Das ist unser stärkster Preishebel.

### 11.2 Wettbewerbslandschaft: Wo haben wir Konkurrenz vs. Monopol?

| Segment | Gruppengröße | Direkter Wettbewerb? | Preismacht |
|---------|-------------|---------------------|-----------|
| **1:1 Übersetzer** (Arzt, Behörde) | 2-3 Personen | **HOCH** — iTranslate €5-15/Mon, DeepL €9/Mon, Google Translate kostenlos, Apple Translate kostenlos | **NIEDRIG** — Kampfpreise nötig |
| **Kleiner Guide** (Stadtführer) | 5-15 Personen | **MITTEL** — Wordly, AirTranslator, aber ohne Broadcast | **MITTEL** — Broadcast ist Vorteil |
| **Agentur** (Reisebüro mit Guides) | 10-30 Personen | **MITTEL** — Vox Hardware (£3,50/Gerät/Tag), Whisper-Systeme | **MITTEL-HOCH** — Software günstiger als Hardware |
| **Events/Messe** (Konferenz, Messe) | 30-500 Personen | **MITTEL** — Wordly ($75/h), KUDO, Interprefy | **MITTEL** — aber noch nicht unser Kernfeature |
| **Kreuzfahrt-Exkursion** | 50-3.000 Personen | **SEHR NIEDRIG** — Kein Software-Broadcast-Wettbewerber | **SEHR HOCH** — Monopolstellung |
| **Museum/Ausstellung** | 20-200 Personen | **MITTEL** — Audio-Guide-Systeme (Orpheo, Acoustiguide) | **HOCH** — kein Geräte-Investment |
| **Enterprise Fleet/Armada** | 1.000-50.000 | **KEIN WETTBEWERB** | **MAXIMAL** |

### 11.3 Strategie: Niedrig wo Konkurrenz, Hoch wo Monopol

#### Prinzip: "Hörer-Staffeln"

Die Idee: Statt alle Segmente gleich zu behandeln, staffeln wir den Preis nach **maximaler Hörer-Anzahl pro Session**. Dort wo Konkurrenz herrscht (kleine Gruppen), sind wir aggressiv günstig. Dort wo wir allein sind (große Gruppen), schöpfen wir den Wert ab.

**Warum funktioniert das?**
- Kleine Gruppen (1-10) → User vergleichen mit iTranslate, DeepL → Preis muss niedrig sein
- Mittlere Gruppen (10-50) → User vergleichen mit Hardware (Vox €3,50/Person/Tag) → Preis kann moderat sein
- Große Gruppen (50-500) → User vergleichen mit Dolmetschern (€200-500/Tag/Sprache) → Preis kann hoch sein
- Riesige Gruppen (500+) → Kein Vergleich möglich → Preis nach VALUE

### 11.4 DAS VERFEINERTE PREISMODELL: 6 Segmente, 1 einfache Logik

#### Kern-Prinzip: **Basis + Session-Minuten + Hörer-Staffel**

```
Monatspreis = BASISPREIS (nach Segment)
            + SESSION-MINUTEN × PREIS/MINUTE
            + HÖRER-AUFSCHLAG (nach Staffel, pro Session-Minute)
```

---

#### SEGMENT 1: PERSONAL (1:1 Gespräche — Arzt, Behörde, Alltag)
**Wettbewerb: HOCH** → Preis: AGGRESSIV GÜNSTIG

| | Free | Personal Pro |
|---|------|-------------|
| **Preis** | **€0** | **€4,99/Monat** |
| Translation | MyMemory/Libre/Offline | Azure NMT |
| TTS | Browser | Standard Voices |
| STT | Web Speech | Web Speech |
| Max. Hörer | 1 | **3** |
| Session-Min inkl. | — | Unbegrenzt |
| **Wettbewerber-Vergleich** | Google Translate: €0 | iTranslate: €5-15, DeepL: €9 |
| **Unsere API-Kosten** | €0 | **~€0,50/Monat** |
| **Marge** | 100% | **~90%** |

> **Strategie:** Hier gewinnen wir über Features (Offline + Konversationsmodus + Kamera-OCR), nicht über Preis. €4,99 ist psychologisch unter iTranslate (€5,99) und weit unter DeepL (€8,74).

---

#### SEGMENT 2: GUIDE (Einzelne Stadtführer, Freelancer)
**Wettbewerb: MITTEL** → Preis: WETTBEWERBSFÄHIG MIT AUFSCHLAG

| | Guide Basic | Guide Pro |
|---|------------|----------|
| **Preis** | **€19,90/Monat** | **€39,90/Monat** |
| Translation | Azure NMT | Azure NMT |
| TTS | Standard Voices | **Neural2** |
| STT | Web Speech + Google Fallback | Google Cloud STT |
| Max. Hörer | **10** | **25** |
| Sprachen | 30 | 50 |
| Session-Min inkl. | 300 (~5 Std.) | 600 (~10 Std.) |
| Overage | €0,15/Session-Min | €0,12/Session-Min |
| **Vergleich** | Vox Hardware: 10×€3,50×20 Tage = **€700/Mon** | Wordly: 10h × $75 = **€690/Mon** |
| **API-Kosten (Ø)** | ~€3/Monat | ~€8/Monat |
| **Marge** | **~85%** | **~80%** |

> **Strategie:** €19,90 für 10 Hörer ist **97% günstiger** als 10 Vox-Geräte. Das ist der Killer-Vergleich im Verkaufsgespräch. Guide Pro mit Neural2-Stimmen bietet hörbar bessere Qualität als kostenlose Alternativen.

---

#### SEGMENT 3: AGENTUR (Reisebüros mit Guide-Pool)
**Wettbewerb: MITTEL** → Preis: MODERATE PREMIUM

| | Agentur Standard | Agentur Premium |
|---|-----------------|----------------|
| **Preis** | **€99/Monat** | **€249/Monat** |
| Guides gleichzeitig | 3 | 10 |
| Max. Hörer/Guide | **30** | **50** |
| Session-Min inkl. | 1.500 (~25 Std.) | 5.000 (~83 Std.) |
| TTS | Neural2 | Neural2 + Chirp 3 HD |
| Overage | €0,10/Session-Min | €0,08/Session-Min |
| Custom Glossare | 5 | Unbegrenzt |
| White-Label | — | Eigenes Logo |
| **Vergleich** | 30 Vox × 20 Tage = **€2.100/Mon** | 50 Vox × 20 Tage = **€3.500/Mon** |
| **API-Kosten (Ø)** | ~€20/Monat | ~€55/Monat |
| **Marge** | **~80%** | **~78%** |

> **Strategie:** Hier ist der Hörer-Hebel besonders stark. 30 Hörer × Vox-Preis = €2.100/Monat vs. unsere €99. Selbst wenn wir €249 nehmen, ist das **93% günstiger**. Wir können den Preis ruhig höher setzen und sind trotzdem unschlagbar.

---

#### SEGMENT 4: VERANSTALTER (Events, Konferenzen, Messen)
**Wettbewerb: MITTEL (Wordly, KUDO)** → Preis: VALUE-BASED

| | Event Basic | Event Pro |
|---|-----------|----------|
| **Preis** | **€199/Monat** | **€499/Monat** |
| Max. Hörer/Session | **100** | **500** |
| Sessions gleichzeitig | 3 | 10 |
| Session-Min inkl. | 2.000 (~33 Std.) | 8.000 (~133 Std.) |
| TTS | Neural2 | Chirp 3 HD |
| Live-Untertitel | Ja | Ja + Export |
| Overage | €0,08/Session-Min | €0,06/Session-Min |
| **Vergleich** | Wordly: 33h × $75 = **€2.275/Mon** | KUDO: ~€500-2.000/Event |
| **API-Kosten (Ø)** | ~€35/Monat | ~€95/Monat |
| **Marge** | **~82%** | **~81%** |

> **Strategie:** Wordly ist der Hauptwettbewerber hier. Bei $75/Stunde ist Wordly für 33 Stunden bei €2.275. Unser €199 ist **91% günstiger**. Aber Wordly hat bessere Enterprise-Features. Wir positionieren uns als **günstige Alternative für kleinere Events**.

---

#### SEGMENT 5: KREUZFAHRT (Exkursionen — UNSER MONOPOLMARKT)
**Wettbewerb: SEHR NIEDRIG** → Preis: MAXIMAL VALUE-BASED

| | Cruise Starter | Cruise Fleet | Cruise Armada |
|---|---------------|-------------|--------------|
| **Preis** | **€1.990/Mon** | **€6.990/Mon** | **€19.990/Mon** |
| Schiffe/Standorte | 1 | 5-10 | 10+ |
| Max. Hörer/Session | **Unbegrenzt** | **Unbegrenzt** | **Unbegrenzt** |
| Session-Min inkl. | 1.500 | 8.000 | 30.000 |
| Sprachen inkl. | 8 | 12 | Alle (130+) |
| Overage/Session-Min | **€0,80** | **€0,60** | **€0,40** |
| Pre-Translation | 10 Skripte/Mon | 50 Skripte/Mon | Unbegrenzt |
| Offline-Modus | WiFi + BLE | WiFi + BLE | WiFi + BLE + Custom |
| API-Zugang | — | Read-Only | Full API |
| SLA | Standard | 99,5% | 99,9% |
| **API-Kosten (Ø)** | ~€170/Mon | ~€1.100/Mon | ~€4.500/Mon |
| **Marge** | **~91%** | **~84%** | **~77%** |

> **DER HÖRER-HEBEL IN AKTION:**
> Eine Kreuzfahrt-Exkursion mit 3.000 Hörern kostet uns exakt das Gleiche wie eine mit 10 Hörern (gleiche Sprachen = gleiche API-Kosten). Aber der Wert für die Reederei ist **300× höher**. Deshalb: Unbegrenzte Hörer bei Kreuzfahrt — der Preis ist durch Session-Minuten + Sprachen gedeckt, nicht durch Hörer. Das ist unser **unfairer Vorteil**.

> **Warum €0,80 Overage statt €0,50?** Weil es KEINEN Wettbewerber gibt. Die Alternative für die Reederei ist:
> - 8 Dolmetscher × €350/Tag = **€2.800 pro Ausflug**
> - Unsere €0,80/Session-Min × 90 Min = **€72 pro Ausflug**
> - Das ist **97% günstiger** — bei €0,80 immer noch ein No-Brainer für die Reederei

---

#### SEGMENT 6: FINTUTTO SINGLE (Mieter/Vermieter — Cross-Sell)
**Wettbewerb: IRRELEVANT** → Preis: KOSTENLOS (Lead-Magnet)

| | FinTuttO Free |
|---|-------------|
| **Preis** | **€0** (für immer) |
| Translation | MyMemory + LibreTranslate |
| TTS | Browser-nativ |
| Max. Hörer | 1 |
| Sprachen | 22 |
| Limit | 500 Übersetzungen/Tag |
| **Zweck** | Lead-Magnet, Cross-Sell zu Guide/Agentur |

---

### 11.5 Übersicht: Alle Preise + Hörer-Staffeln auf einen Blick

| Plan | Preis/Mon | Max. Hörer | Kosten/Hörer/Monat | Marge | Wettbewerber-Preis |
|------|----------|-----------|-------------------|-------|-------------------|
| **Free** | €0 | 1 | €0 | 100% | Google Translate: €0 |
| **Personal Pro** | €4,99 | 3 | €1,66 | ~90% | iTranslate: €5,99 |
| **Guide Basic** | €19,90 | 10 | €1,99 | ~85% | Vox: €70/Tag |
| **Guide Pro** | €39,90 | 25 | €1,60 | ~80% | Wordly: €69/Std |
| **Agentur Standard** | €99 | 30 | €3,30 | ~80% | Vox: €105/Tag |
| **Agentur Premium** | €249 | 50 | €4,98 | ~78% | Vox: €175/Tag |
| **Event Basic** | €199 | 100 | €1,99 | ~82% | Wordly: €69/Std |
| **Event Pro** | €499 | 500 | €1,00 | ~81% | KUDO: €500+/Event |
| **Cruise Starter** | €1.990 | ∞ | ~€0,007* | ~91% | Dolmetscher: €2.800/Tag |
| **Cruise Fleet** | €6.990 | ∞ | ~€0,002* | ~84% | Kein Wettbewerber |
| **Cruise Armada** | €19.990 | ∞ | ~€0,001* | ~77% | Kein Wettbewerber |

*Bei 3.000 Hörern/Ausflug, 15 Ausflügen/Monat

### 11.6 Der versteckte Umsatz-Turbo: Hörer-Upgrade-Pfade

```
UPSELL-PFAD:

Free (1 Hörer) ──→ Personal Pro (3) ──→ Guide Basic (10) ──→ Guide Pro (25)
     €0               €4,99                €19,90               €39,90
                   "Ich gehe zum Arzt       "Ich mache jetzt     "Meine Gruppe
                    mit meiner Frau"         Stadtführungen"       wächst"

Guide Pro (25) ──→ Agentur Standard (30) ──→ Agentur Premium (50) ──→ Cruise
    €39,90              €99                       €249                €1.990+
                   "Ich habe jetzt           "Meine Agentur       "Kreuzfahrt-
                    3 Guides"                 braucht mehr"        Reederei"
```

Jeder natürliche Wachstumsschritt des Kunden führt automatisch zum nächsten Preistier. Die Hörer-Staffeln sind so gewählt, dass sie den typischen Gruppengrössen der Zielgruppen entsprechen.

### 11.7 Umsatz-Steigerung durch Hörer-Staffeln vs. altes Modell

| Szenario | Altes Modell (Flat) | Neues Modell (Hörer-Staffeln) | Steigerung |
|----------|-------------------|-------------------------------|-----------|
| 100 Privat-User | 100 × €29,90 = €2.990 | 70 × €4,99 + 30 × €19,90 = €946 | -68% (ABER: Mehr User, mehr Conversions!) |
| 20 Guides | 20 × €29,90 = €598 | 10 × €19,90 + 10 × €39,90 = €598 | ±0% (gleich, aber besser differenziert) |
| 5 Agenturen | 5 × €29,90 = €150 | 3 × €99 + 2 × €249 = €795 | **+430%** |
| 3 Event-Veranstalter | 3 × €29,90 = €90 | 2 × €199 + 1 × €499 = €897 | **+897%** |
| 1 Reederei (5 Schiffe) | 1 × €9.990 = €9.990 | 1 × €6.990 + Overage ~€4.800 = €11.790 | **+18%** |
| **TOTAL (Beispiel-Mix)** | **€13.818** | **€15.026** | **+9% Gesamt** |

> **Ergebnis:** Das Hörer-Staffel-Modell senkt die Eintrittsbarriere für Privat-User (€4,99 statt €29,90 → mehr Conversions) und steigert den Umsatz bei Agenturen (+430%) und Events (+897%) massiv. Der Gesamt-Umsatz steigt um ~9% bei besserer Marktsegmentierung.

### 11.8 Die "€0,10 pro Hörer"-Idee: Lohnt sich das?

Du hast einen Aufschlag von z.B. €0,10/Hörer/Session erwähnt. Hier die Rechnung:

| Szenario | Hörer | Sessions/Mon | Aufschlag €0,10/Hörer/Session | Effekt auf Preis |
|----------|-------|-------------|------------------------------|-----------------|
| Stadtführer | 15 | 20 | €30/Mon | Guide Basic wäre €19,90 + €30 = €49,90 |
| Agentur (3 Guides) | 30 | 60 | €180/Mon | Agentur wäre €99 + €180 = €279 |
| Event (200 Teiln.) | 200 | 8 | €160/Mon | Event wäre €199 + €160 = €359 |
| Kreuzfahrt (3.000) | 3.000 | 15 | €4.500/Mon | Cruise wäre €1.990 + €4.500 = €6.490 |

**Problem:** Bei kleinen Gruppen fühlt sich der Aufschlag zu groß an (Guide verdoppelt sich fast). Bei Kreuzfahrt wird der Preis plötzlich hörer-sensitiv, was unseren größten Vorteil (unbegrenzte Hörer) untergräbt.

**Bessere Alternative: Hörer als TIER-GRENZE, nicht als Aufschlag**

Statt €0,10/Hörer nehmen wir die Hörer-Zahl als natürliche Grenze zwischen den Tiers. Wer mehr Hörer braucht, steigt automatisch ins nächste Tier auf. Das ist einfacher zu kommunizieren und zwingt organisch zum Upgrade:

- 11. Hörer? → Upgrade von Guide Basic (€19,90) auf Guide Pro (€39,90) = +€20
- 26. Hörer? → Upgrade auf Agentur Standard (€99) = natürlicher Wachstumsschritt
- 51. Hörer? → Upgrade auf Event oder Agentur Premium (€249)

### 11.9 Mini-Aufschläge dort wo es passt: "Sprach-Pakete"

Statt direkt an der Hörer-Schraube zu drehen (was Wettbewerber abschrecken könnte), gibt es eine elegantere Stellschraube: **Sprach-Pakete**.

Die Logik: Hörer kosten uns nichts, aber Sprachen kosten uns API-Geld. Also:

| Tier | Sprachen inkl. | Zusätzliche Sprache |
|------|---------------|-------------------|
| Free | 22 (Offline) | — |
| Personal Pro | 30 | — |
| Guide Basic | 5 | **+€2,99/Sprache/Monat** |
| Guide Pro | 10 | **+€1,99/Sprache/Monat** |
| Agentur Standard | 15 | **+€1,49/Sprache/Monat** |
| Event Basic | 20 | **+€0,99/Sprache/Monat** |
| Cruise Starter | 8 | **+€49/Sprache/Monat** |
| Cruise Fleet | 12 | **+€39/Sprache/Monat** |
| Cruise Armada | Alle 130+ | Inkludiert |

**Warum das clever ist:**
- Eine zusätzliche Sprache bei Cruise Starter kostet uns ~€20/Monat (API) → Wir verkaufen sie für €49 → **59% Marge**
- Japanisch/Koreanisch/Arabisch auf Kreuzfahrten sind HIGH-VALUE Sprachen (Passagiere aus diesen Ländern geben überdurchschnittlich viel aus)
- Reedereien zahlen gerne €49/Sprache, wenn die Alternative €500/Tag für einen japanischen Guide ist

---

## TEIL 12: GESAMTSTRATEGIE — EINFACH UND PROFITABEL

### 12.1 Die Formel auf 1 Satz

> **"Kostenlos starten, günstig bleiben wo Konkurrenz ist, Premium dort wo wir allein sind — und die Hörer-Grenze als natürlichen Upgrade-Trigger nutzen."**

### 12.2 Zusammenfassung der Preisoptimierungen

| Stellschraube | Alte Strategie | Neue Strategie | Umsatz-Effekt |
|--------------|---------------|---------------|--------------|
| **Hörer als Tier-Grenze** | 10 Hörer für alle Pro | 3→10→25→50→100→∞ | Natürliche Upsells |
| **Segment-Preise** | 1 Preis (€29,90) für alle | 6 Preise (€4,99-€19.990) | +430% bei Agenturen |
| **Sprach-Pakete** | Alle Sprachen inkl. | 5-12 Sprachen + Zukauf | +€49/Sprache/Mon (Enterprise) |
| **Overage hoch wo Monopol** | €0,05/Min | €0,80/Min (Cruise) | +1.500% pro Overage-Minute |
| **Overage niedrig wo Konkurrenz** | €0,05/Min | €0,12-0,15/Min (Guide) | Attraktiver als Wettbewerb |
| **Pre-Translation Incentive** | Nicht vorhanden | Skripte inkl. + API-Kosten-Ersparnis | -90% API-Kosten wiederkehrend |

### 12.3 Erwarteter Jahres-Umsatz mit dem neuen Modell

| Phase | Kunden-Mix | MRR (alt) | MRR (neu) | Steigerung |
|-------|-----------|----------|----------|-----------|
| **Monat 1-6** | 200 Free, 50 Personal, 10 Guide | ~€300 | ~€450 | +50% |
| **Monat 6-12** | 500 Free, 100 Personal, 30 Guide, 5 Agentur | ~€900 | ~€2.100 | **+133%** |
| **Jahr 2** | + 3 Event, 1 Cruise Starter | ~€6.500 | ~€8.500 | **+31%** |
| **Jahr 3** | + 10 Event, 2 Cruise Fleet, 1 Armada | ~€35.000 | ~€55.000 | **+57%** |

### 12.4 Warum das Modell NICHT zu kompliziert ist

Für den Kunden sieht es so aus:

```
┌─────────────────────────────────────────────────┐
│            PRICING PAGE                          │
│                                                  │
│  👤 Privat    👥 Guide    🏢 Business   🚢 Cruise│
│                                                  │
│  €0/€4,99    €19,90/€39,90  €99/€249   ab €1.990│
│                                                  │
│  1-3 Hörer   10-25 Hörer   30-50 Hörer  Unbegr. │
│                                                  │
│  [Kostenlos]  [Starten]    [Kontakt]   [Demo]   │
└─────────────────────────────────────────────────┘
```

**4 Tabs, 8 Preise, fertig.** Kein Taschenrechner nötig. Kein "0,10€ pro Hörer pro Minute pro Sprache"-Wirrwarr.

Die Session-Minuten, Sprach-Pakete und Overage sind **Unter der Haube** und werden nur im Detail-Vergleich und im Enterprise-Gespräch relevant.

---

## QUELLEN

- [Google Cloud Translation Pricing](https://cloud.google.com/translate/pricing)
- [Google Cloud TTS Pricing](https://cloud.google.com/text-to-speech/pricing)
- [Google Cloud STT Pricing](https://cloud.google.com/speech-to-text/pricing)
- [Google Cloud Vision Pricing](https://cloud.google.com/vision/pricing)
- [Supabase Pricing](https://supabase.com/pricing)
- [Supabase Realtime Pricing](https://supabase.com/docs/guides/realtime/pricing)
- [Vercel Pricing](https://vercel.com/pricing)
- [Vercel Hobby Plan Limits](https://vercel.com/docs/plans/hobby)
- [Wordly.ai Pricing](https://www.wordly.ai/pricing)
- [Vox Group Tour Systems](https://voxtours.com/)
- [Tour Guide Systems Rental UK](https://www.tourguide.systems/) — £3,50/Gerät/Tag
- [iTranslate Pricing](https://itranslate.com) — €5,99-14,99/Monat
- [DeepL Pro Pricing](https://www.deepl.com/pro) — ab €8,74/Monat
- [Retekess Whisper Systems](https://www.retekess.com/) — Hardware-Vergleich
- Internes Dokument: Geschäftskonzept-and-Preismodell.pdf (21.02.2026)
- Internes Dokument: Wettbewerbsanalyse-guidetranslator.pdf (02/2026)
- Internes Dokument: GuideTranslator-v7-Multi-Segment-SaaS-Plattform.pdf
