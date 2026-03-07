# FFplus Generative AI fuer KMU — Foerderantrag

**Programm:** Digital Europe Programme — FFplus: Generative AI for European SMEs/Startups
**Call:** FFplus 3. Open Call (EuroHPC Joint Undertaking)
**Antragsteller:** Fintutto UG (i.G.) / Alexander Deibel
**Beantragter Betrag:** 300.000 EUR (100% Foerderung, kein Eigenanteil)
**Laufzeit:** 10 Monate
**Voraussichtlicher Call-Start:** Fruehjahr/Sommer 2027 (3. und letzter Call)

> **HINWEIS (06.03.2026):** Der 2. FFplus Call (Feb. 2026) war innerhalb von
> 24 Stunden voll (250 Antraege Limit). Der 3. und letzte Call wird erst
> **Fruehjahr/Sommer 2027** erwartet -- nicht wie urspruenglich vermutet
> Sommer 2026.
>
> **Dieses Dokument dient als Vorbereitung**, damit der Antrag sofort
> eingereicht werden kann, wenn der 3. Call oeffnet. Schnelligkeit ist
> entscheidend (24h Fenster beim letzten Call!).
>
> **Wichtige Anforderungen aus dem 2. Call:**
> - Max. 3 Partner (1 KMU + bis zu 2 Supporting Participants)
> - Proposal: ~10 Seiten (3,5 + 3 + 2 + 1 Seite)
> - Bewertung: Excellence + Impact + Implementation (je 0-5, mind. 3 pro Kriterium)
> - HPC-Nutzung (EuroHPC Supercomputer) ist Pflicht
> - Min. 50% Budget beim Hauptteilnehmer (KMU)

---

## 1. PROJECT SUMMARY

### Title
**"FinTranslate AI: Developing a Multilingual Generative AI System for Real-Time Document and Speech Translation with Offline Capability"**

### Abstract

FinTranslate AI aims to develop and deploy a generative AI-powered translation system that operates across four transport tiers — including fully offline on-device inference. The project will leverage large language models (LLMs) and neural machine translation (NMT) to create a real-time, privacy-preserving translation platform for 45+ languages, with a focus on underserved migration languages (Dari, Tigrinya, Pashto, Kurdish, Somali).

Unlike existing cloud-dependent solutions, FinTranslate AI uses on-device ML models (Opus-MT via WebAssembly, Whisper for STT) combined with a novel 4-Tier transport architecture that ensures translation availability even without any network connectivity. The system broadcasts translations from one speaker to unlimited listeners via Cloud, WiFi-Hotspot, BLE, or local ML — automatically selecting the optimal transport.

**Key Innovation:** Applying generative AI (fine-tuned NMT + context-aware LLM-based translation) to create the first European offline-capable, privacy-preserving group translation platform.

### Keywords
Generative AI, Neural Machine Translation, NLP, On-Device ML, Offline AI, WebAssembly, BLE, Privacy-Preserving AI, Migration Languages

---

## 2. EXCELLENCE

### 2.1 Objectives

**Primary Objective:** Develop a generative AI translation engine that combines cloud-based LLMs with on-device ML models for real-time, multi-language translation — deployable offline on standard consumer hardware (smartphones, tablets).

**Specific Objectives:**

| # | Objective | Measurable Target |
|---|----------|------------------|
| O1 | Fine-tune multilingual NMT models for domain-specific translation (tourism, legal, medical) | BLEU score improvement of 15%+ over baseline Opus-MT |
| O2 | Develop LLM-based context-aware translation for ambiguous terms | 90%+ accuracy on domain-specific test sets |
| O3 | Optimize on-device ML inference for mobile deployment | <500ms inference time on mid-range Android devices |
| O4 | Extend language coverage to 60+ languages including 15 migration languages | 60 language pairs with >85% BLEU score |
| O5 | Achieve production deployment with 5.000+ active users | 5.000 MAU, 100 B2B customers |

### 2.2 Relation to the Call

This project directly addresses the FFplus call for **Generative AI applications by European SMEs/Startups**:

1. **Generative AI application:** The core technology uses neural machine translation (a form of generative AI) and integrates LLM-based contextual translation
2. **European SME:** Fintutto UG is a micro-enterprise based in Mecklenburg-Vorpommern, Germany
3. **HPC utilization:** Model fine-tuning requires GPU compute resources (planned use of EuroHPC access)
4. **European digital sovereignty:** On-device models reduce dependence on US cloud providers
5. **Social impact:** Addresses communication barriers for 110M+ refugees and 600M+ tourists

### 2.3 State of the Art and Beyond

**Current State of the Art:**

| Technology | Current Leaders | Limitation |
|-----------|----------------|-----------|
| Cloud NMT | Google, DeepL, Microsoft | Requires internet, no offline capability |
| On-Device Translation | Google (limited), Apple (limited) | Only 1:1 translation, no group broadcasting |
| Generative Translation (LLM) | GPT-4, Claude, Gemini | High latency, cloud-only, expensive |
| Speech Translation | Wordly, KUDO | Conference-only, no offline, very expensive |

**Our Advancement Beyond State of the Art:**

1. **First hybrid cloud/on-device generative translation system** that automatically selects the optimal execution environment
2. **First application of fine-tuned NMT models** for domain-specific offline translation on mobile devices via WebAssembly
3. **First BLE-based translation broadcasting system** using a custom GATT protocol
4. **First system supporting 15+ migration languages offline** (Dari, Tigrinya, Pashto, etc.)

### 2.4 Methodology

**Phase 1: Data Collection & Preparation (Month 1-2)**
- Curate domain-specific parallel corpora (tourism: 500K sentence pairs, legal: 200K, medical: 200K)
- Clean, deduplicate, and align migration language data from OPUS, CCAligned, WikiMatrix
- Create evaluation benchmarks for each domain

**Phase 2: Model Fine-Tuning (Month 2-5)**
- Fine-tune Opus-MT models on domain-specific data using HPC resources
- Train context-aware translation module using LLM distillation (smaller model that captures LLM quality)
- Optimize models for WebAssembly deployment (quantization, pruning, knowledge distillation)
- Target: <100MB model size per language pair for on-device deployment

**Phase 3: Integration & Optimization (Month 4-7)**
- Integrate fine-tuned models into existing 4-Tier architecture
- Implement dynamic model loading (download only needed language pairs)
- Optimize inference pipeline for <500ms latency on mobile
- A/B testing against baseline models

**Phase 4: Deployment & Validation (Month 6-10)**
- Deploy to production (Google Play, PWA)
- Conduct user studies with 3 target groups: tourists, refugees, conference attendees
- Measure BLEU scores, user satisfaction, and real-world performance
- Iterate based on feedback

---

## 3. IMPACT

### 3.1 Expected Impact

| Impact Dimension | Metric | Target |
|-----------------|--------|--------|
| **Users served** | Monthly Active Users | 5.000 by end of project |
| **Languages improved** | Offline language pairs | 60+ (from current 54) |
| **Migration languages** | New underserved languages | 15 (from current 10) |
| **Translation quality** | BLEU score improvement | +15% over baseline |
| **B2B customers** | Paying organizations | 100 |
| **Revenue** | Monthly Recurring Revenue | 23.000 EUR/month |
| **Jobs created** | New positions in MV | 5 |

### 3.2 European Added Value

1. **Digital Sovereignty:** European AI models for European citizens, reducing US-cloud dependency
2. **Inclusion:** Communication access for 6+ million refugees in Europe
3. **Tourism competitiveness:** Europe's 700M+ tourist arrivals benefit from multilingual access
4. **Privacy:** GDPR-compliant by design, on-device processing keeps data local
5. **Open Standards:** BLE GATT protocol potentially standardizable for IoT translation devices

### 3.3 Market Opportunity

- **TAM:** 8 Mrd. USD (machine translation market, 2025)
- **SAM:** 4.4 Mrd. USD (live translation + government/NGO + tourism)
- **SOM:** 180 Mio. USD (DACH region, 3 years)
- **CAGR:** 15% annual growth

### 3.4 Sustainability & Exploitation

The project results will be commercially exploited through:
1. **SaaS subscriptions** (B2C: 4.99-39.90 EUR/month, B2B: 99-19.990 EUR/month)
2. **Enterprise licensing** (annual contracts with organizations)
3. **API access** for third-party developers
4. **Open-source contributions** (selected components, BLE protocol specification)

Revenue projections ensure financial sustainability beyond the funding period:
- Month 10 (project end): 23K EUR MRR
- Month 24: 148K EUR MRR
- Year 3: 12M EUR ARR

---

## 4. IMPLEMENTATION

### 4.1 Work Packages

| WP | Title | Lead | Months | Effort |
|----|-------|------|--------|--------|
| WP1 | Data Curation & Benchmarking | AI/ML Engineer | M1-M2 | 2 PM |
| WP2 | Model Fine-Tuning & Optimization | AI/ML Engineer + CTO | M2-M5 | 6 PM |
| WP3 | Platform Integration | CTO | M4-M7 | 4 PM |
| WP4 | Mobile Deployment & Testing | Mobile Dev | M5-M8 | 4 PM |
| WP5 | User Validation & Iteration | Product/CEO | M6-M10 | 3 PM |
| WP6 | Project Management & Dissemination | CEO | M1-M10 | 2 PM |

### 4.2 Deliverables

| # | Deliverable | WP | Month | Type |
|---|------------|-----|-------|------|
| D1.1 | Domain-specific parallel corpora (3 domains) | WP1 | M2 | Dataset |
| D1.2 | Evaluation benchmarks | WP1 | M2 | Report |
| D2.1 | Fine-tuned NMT models (60+ language pairs) | WP2 | M5 | Software |
| D2.2 | Context-aware translation module | WP2 | M5 | Software |
| D3.1 | Integrated platform v4.0 | WP3 | M7 | Software |
| D4.1 | Production deployment (Google Play + PWA) | WP4 | M8 | Release |
| D5.1 | User study report (3 target groups) | WP5 | M10 | Report |
| D6.1 | Final project report | WP6 | M10 | Report |

### 4.3 Milestones

| # | Milestone | Month | Verification |
|---|----------|-------|-------------|
| MS1 | Data curation complete, benchmarks defined | M2 | D1.1, D1.2 |
| MS2 | Fine-tuned models achieve +15% BLEU | M5 | D2.1, Test results |
| MS3 | Platform v4.0 deployed to production | M8 | D4.1, Store listing |
| MS4 | 5.000 MAU, 100 B2B customers | M10 | Analytics dashboard |

---

## 5. BUDGET

### 5.1 Overview (Lump Sum, 100% EU Funding)

| Cost Category | Amount | Share |
|--------------|--------|-------|
| **Personnel** | 164.000 EUR | 55% |
| **Cloud & HPC** | 60.000 EUR | 20% |
| **Equipment** | 25.000 EUR | 8% |
| **Travel & Dissemination** | 18.000 EUR | 6% |
| **Subcontracting** | 18.000 EUR | 6% |
| **Other Direct Costs** | 15.000 EUR | 5% |
| **TOTAL** | **300.000 EUR** | **100%** |

### 5.2 Personnel (Detail)

| Role | Months | Monthly Cost | Total |
|------|--------|-------------|-------|
| CEO + CTO / Project Coordinator & Tech Lead (60%) | 10 | 5.166 | 51.660 EUR |
| AI/ML Engineer (100%) | 7 | 8.610 | 60.270 EUR |
| Senior Developer (80%) | 6 | 7.380 | 44.280 EUR |
| UX/UI Designer (30%) | 4 | 1.997 | 7.986 EUR |
| **TOTAL Personnel** | | | **~164.000 EUR** |

> All personnel costs include employer social security contributions (23%).
> The CEO simultaneously serves as CTO (technical leadership). The FuE share
> of 60% for this role reflects the split between technical work (model
> integration, architecture) and project coordination/management.
> No separate CTO hire is planned — the founder covers both roles.

### 5.3 Cloud & HPC

| Item | Amount |
|------|--------|
| EuroHPC/GPU access for model training | 25.000 EUR |
| Google Cloud APIs (Translation, TTS, STT) | 15.000 EUR |
| Supabase (Database, Realtime, Auth) | 5.000 EUR |
| Vercel (Hosting, CDN, Edge Functions) | 3.000 EUR |
| Additional cloud services (monitoring, CI/CD) | 7.000 EUR |
| **TOTAL Cloud & HPC** | **55.000 EUR** |

### 5.4 Equipment

| Item | Amount |
|------|--------|
| Test devices (smartphones, tablets — iOS + Android) | 8.000 EUR |
| BLE test hardware (GL.iNet routers, dongles) | 2.000 EUR |
| Development hardware (MacBook contribution) | 10.000 EUR |
| **TOTAL Equipment** | **20.000 EUR** |

### 5.5 Travel & Dissemination

| Item | Amount |
|------|--------|
| Conference participation (2 conferences) | 6.000 EUR |
| User study travel (3 cities) | 4.000 EUR |
| Project meetings / partner visits | 3.000 EUR |
| Dissemination materials (videos, publications) | 5.000 EUR |
| **TOTAL Travel** | **18.000 EUR** |

### 5.6 Subcontracting

| Item | Amount |
|------|--------|
| Professional translation services (benchmark validation) | 8.000 EUR |
| External usability testing | 7.000 EUR |
| **TOTAL Subcontracting** | **15.000 EUR** |

---

## 6. TEAM & CAPABILITIES

### 6.1 Applicant Profile

**Fintutto UG (i.G.)**
- Founded: 2026 (in formation)
- Location: Mecklenburg-Vorpommern, Germany
- Type: Micro-enterprise (SME)
- Sector: AI / Translation Technology / SaaS

### 6.2 Key Personnel

**Alexander Deibel — CEO + CTO / Project Coordinator & Technical Lead**
- Solo-built production-ready translation platform (13.296 lines, 87 tests)
- Co-founder AI Tour Guide UG (tourism tech, since 2024)
- Deep domain knowledge in translation technology, AI/ML, and tourism
- Technical expertise: React/TypeScript, ML/AI (NMT, Whisper), BLE protocols, WASM
- Responsible for: Project coordination, platform architecture, model integration

**Senior Developer (to be hired, Month 6)**
- Required profile: Senior Full-Stack (React/TypeScript/Node.js)
- Responsible for: Platform development, mobile deployment, testing

**AI/ML Engineer (to be hired, Month 6)**
- Required profile: NLP specialization, experience with NMT fine-tuning, WASM deployment
- Responsible for: Model training, optimization, evaluation

### 6.3 Technical Readiness

| Component | TRL | Evidence |
|----------|-----|---------|
| Translation Platform (PWA) | **TRL 7** | Production-deployed, 87 passing tests |
| Offline ML Pipeline | **TRL 6** | Functional prototype, needs optimization |
| BLE Transport | **TRL 6** | Working on Android, iOS in progress |
| Fine-tuned NMT Models | **TRL 3-4** | Baseline models working, fine-tuning planned |

---

## 7. ETHICS & GDPR

### 7.1 Data Protection

- All translations processed on-device in offline mode (no data leaves the device)
- Cloud translations: encrypted in transit (TLS 1.3) and at rest (AES-256)
- No personal data stored beyond session duration (unless user explicitly saves)
- GDPR-compliant by design: data minimization, purpose limitation, storage limitation
- EU-hosted infrastructure (Supabase EU region, Vercel EU edge)

### 7.2 AI Ethics

- No biometric data processing
- No automated decision-making affecting individuals
- Transparent about AI limitations (translation quality indicators)
- Bias mitigation through diverse training data and evaluation across language pairs
- Human-in-the-loop option for critical translations (legal, medical contexts)

### 7.3 Responsible AI

- Model cards for all deployed models (documenting training data, limitations, biases)
- Regular evaluation against fairness benchmarks across language pairs
- Compliance with EU AI Act (translation classified as limited/minimal risk)

---

## 8. DISSEMINATION & COMMUNICATION

| Activity | Channel | Timeline |
|---------|---------|----------|
| Project website | translator.fintutto.cloud/research | M1 |
| Technical blog posts (monthly) | Blog, Medium, LinkedIn | M1-M10 |
| Conference presentation | ACL/EMNLP/WMT or similar | M8-M10 |
| Open-source model release (selected pairs) | HuggingFace | M10 |
| Press release (project results) | Regional + tech media | M10 |
| User community engagement | Discord/GitHub | M1-M10 |

---

*Stand: 06.03.2026 | Fintutto UG (i.G.) | Vertraulich*
*Dieses Dokument dient als Vorlage fuer die offizielle Einreichung im EU Funding & Tenders Portal*
