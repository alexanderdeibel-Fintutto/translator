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
- Internes Dokument: Geschäftskonzept-and-Preismodell.pdf (21.02.2026)
- Internes Dokument: Wettbewerbsanalyse-guidetranslator.pdf (02/2026)
