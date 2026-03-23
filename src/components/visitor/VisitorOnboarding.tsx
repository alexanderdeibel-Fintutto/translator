// Visitor Onboarding — Multi-step profile creation for new visitors
// Collects: language, age, interests, knowledge level, accessibility, AI preferences
// Uses visitor-profile.ts for persistence

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Globe, ChevronRight, ChevronLeft, Check, User, Sparkles,
  Brain, Accessibility, Volume2, Heart, Compass,
} from 'lucide-react'
import { updateProfile, completeOnboarding } from '@/lib/fintutto-world/visitor-profile'
import type { AgeGroup, KnowledgeLevel, BudgetLevel, MobilityLevel } from '@/lib/fintutto-world/types'

interface OnboardingProps {
  profileId: string
  onComplete: () => void
  contextType?: 'museum' | 'city' | 'region'
  contextName?: string
}

const LANGUAGES = [
  { code: 'de', label: 'Deutsch', flag: 'DE' },
  { code: 'en', label: 'English', flag: 'GB' },
  { code: 'fr', label: 'Francais', flag: 'FR' },
  { code: 'it', label: 'Italiano', flag: 'IT' },
  { code: 'es', label: 'Espanol', flag: 'ES' },
  { code: 'nl', label: 'Nederlands', flag: 'NL' },
  { code: 'pl', label: 'Polski', flag: 'PL' },
  { code: 'cs', label: 'Cestina', flag: 'CZ' },
  { code: 'zh', label: '中文', flag: 'CN' },
  { code: 'ja', label: '日本語', flag: 'JP' },
  { code: 'ko', label: '한국어', flag: 'KR' },
  { code: 'ar', label: 'العربية', flag: 'SA' },
]

const AGE_GROUPS: { id: AgeGroup; label: string; emoji: string }[] = [
  { id: 'child', label: 'Kind (6-12)', emoji: '🧒' },
  { id: 'youth', label: 'Jugendlich (13-17)', emoji: '🧑' },
  { id: 'young_adult', label: 'Jung (18-30)', emoji: '👩' },
  { id: 'adult', label: 'Erwachsen (30-65)', emoji: '🧑‍💼' },
  { id: 'senior', label: 'Senior (65+)', emoji: '👴' },
]

const KNOWLEDGE_LEVELS: { id: KnowledgeLevel; label: string; desc: string }[] = [
  { id: 'beginner', label: 'Einsteiger', desc: 'Erste Beruehrungspunkte' },
  { id: 'casual', label: 'Gelegentlich', desc: 'Ab und zu interessiert' },
  { id: 'enthusiast', label: 'Enthusiast', desc: 'Regelmassig und begeistert' },
  { id: 'expert', label: 'Experte', desc: 'Tiefes Fachwissen' },
  { id: 'professional', label: 'Profi', desc: 'Beruflich damit befasst' },
]

const INTEREST_OPTIONS = [
  'Kunst', 'Geschichte', 'Architektur', 'Natur', 'Kulinarik',
  'Musik', 'Wissenschaft', 'Technologie', 'Sport', 'Fotografie',
  'Shopping', 'Wellness', 'Abenteuer', 'Kultur', 'Religion',
]

const ACCESSIBILITY_OPTIONS = [
  { id: 'wheelchair', label: 'Rollstuhl' },
  { id: 'visual', label: 'Sehbeeintraechtigung' },
  { id: 'hearing', label: 'Hoerbeeintraechtigung' },
  { id: 'stroller', label: 'Kinderwagen' },
  { id: 'limited_mobility', label: 'Eingeschraenkte Mobilitaet' },
  { id: 'easy_language', label: 'Leichte Sprache' },
]

const TOTAL_STEPS = 5

export default function VisitorOnboarding({ profileId, onComplete, contextType, contextName }: OnboardingProps) {
  const [step, setStep] = useState(0)
  const [saving, setSaving] = useState(false)

  // Collected data
  const [language, setLanguage] = useState('de')
  const [secondaryLanguages, setSecondaryLanguages] = useState<string[]>([])
  const [ageGroup, setAgeGroup] = useState<AgeGroup>('adult')
  const [knowledgeLevel, setKnowledgeLevel] = useState<KnowledgeLevel>('casual')
  const [interests, setInterests] = useState<string[]>([])
  const [accessibilityNeeds, setAccessibilityNeeds] = useState<string[]>([])
  const [mobilityLevel, setMobilityLevel] = useState<MobilityLevel>('full')
  const [aiTone, setAiTone] = useState<'formal' | 'warm' | 'casual' | 'enthusiastic'>('warm')
  const [aiDetail, setAiDetail] = useState<'minimal' | 'standard' | 'detailed'>('standard')
  const [tourDepth, setTourDepth] = useState<'quick' | 'standard' | 'deep_dive'>('standard')

  function toggleArray<T>(arr: T[], item: T): T[] {
    return arr.includes(item) ? arr.filter(i => i !== item) : [...arr, item]
  }

  async function handleFinish() {
    setSaving(true)
    await updateProfile(profileId, {
      primaryLanguage: language,
      secondaryLanguages,
      ageGroup,
      knowledgeLevel,
      interests,
      accessibilityNeeds,
      mobilityLevel,
      aiPersonalityTone: aiTone,
      aiDetailLevel: aiDetail,
      preferredTourDepth: tourDepth,
    })
    await completeOnboarding(profileId)
    setSaving(false)
    onComplete()
  }

  const canAdvance = () => {
    if (step === 0) return !!language
    return true
  }

  return (
    <div className="max-w-lg mx-auto">
      {/* Progress bar */}
      <div className="flex items-center gap-2 mb-6">
        {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
          <div key={i} className={`flex-1 h-1.5 rounded-full transition-colors ${
            i <= step ? 'bg-primary' : 'bg-muted'
          }`} />
        ))}
      </div>

      {/* Step 0: Language */}
      {step === 0 && (
        <Card className="p-6 space-y-4">
          <div className="text-center mb-2">
            <Globe className="h-8 w-8 mx-auto mb-2 text-primary" />
            <h2 className="text-xl font-bold">Willkommen{contextName ? ` bei ${contextName}` : ''}!</h2>
            <p className="text-sm text-muted-foreground mt-1">Waehle deine Sprache</p>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {LANGUAGES.map(l => (
              <Button
                key={l.code}
                variant={language === l.code ? 'default' : 'outline'}
                className="h-auto py-2.5 flex-col gap-0.5"
                onClick={() => setLanguage(l.code)}
              >
                <span className="text-xs font-medium">{l.label}</span>
              </Button>
            ))}
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-2">Weitere Sprachen (optional):</p>
            <div className="flex flex-wrap gap-1.5">
              {LANGUAGES.filter(l => l.code !== language).map(l => (
                <Badge
                  key={l.code}
                  variant={secondaryLanguages.includes(l.code) ? 'default' : 'outline'}
                  className="cursor-pointer text-xs"
                  onClick={() => setSecondaryLanguages(toggleArray(secondaryLanguages, l.code))}
                >
                  {l.label}
                </Badge>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* Step 1: Age & Knowledge */}
      {step === 1 && (
        <Card className="p-6 space-y-5">
          <div className="text-center mb-2">
            <User className="h-8 w-8 mx-auto mb-2 text-primary" />
            <h2 className="text-xl font-bold">Ueber dich</h2>
            <p className="text-sm text-muted-foreground mt-1">Damit wir Inhalte anpassen koennen</p>
          </div>

          <div>
            <p className="text-sm font-medium mb-2">Altersgruppe</p>
            <div className="grid grid-cols-2 gap-2">
              {AGE_GROUPS.map(ag => (
                <Button
                  key={ag.id}
                  variant={ageGroup === ag.id ? 'default' : 'outline'}
                  className="justify-start h-auto py-2"
                  onClick={() => setAgeGroup(ag.id)}
                >
                  <span className="mr-2">{ag.emoji}</span> {ag.label}
                </Button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-medium mb-2">
              {contextType === 'museum' ? 'Kunstwissen' : 'Reiseerfahrung'}
            </p>
            <div className="space-y-1.5">
              {KNOWLEDGE_LEVELS.map(kl => (
                <Button
                  key={kl.id}
                  variant={knowledgeLevel === kl.id ? 'default' : 'outline'}
                  className="w-full justify-start h-auto py-2"
                  onClick={() => setKnowledgeLevel(kl.id)}
                >
                  <div className="text-left">
                    <div className="font-medium text-sm">{kl.label}</div>
                    <div className="text-xs opacity-70">{kl.desc}</div>
                  </div>
                </Button>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* Step 2: Interests */}
      {step === 2 && (
        <Card className="p-6 space-y-4">
          <div className="text-center mb-2">
            <Heart className="h-8 w-8 mx-auto mb-2 text-primary" />
            <h2 className="text-xl font-bold">Deine Interessen</h2>
            <p className="text-sm text-muted-foreground mt-1">Waehle was dich begeistert (mehrere moeglich)</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {INTEREST_OPTIONS.map(interest => (
              <Badge
                key={interest}
                variant={interests.includes(interest) ? 'default' : 'outline'}
                className="cursor-pointer text-sm py-1.5 px-3"
                onClick={() => setInterests(toggleArray(interests, interest))}
              >
                {interest}
              </Badge>
            ))}
          </div>
          <p className="text-xs text-muted-foreground text-center">{interests.length} ausgewaehlt</p>
        </Card>
      )}

      {/* Step 3: Accessibility */}
      {step === 3 && (
        <Card className="p-6 space-y-4">
          <div className="text-center mb-2">
            <Accessibility className="h-8 w-8 mx-auto mb-2 text-primary" />
            <h2 className="text-xl font-bold">Barrierefreiheit</h2>
            <p className="text-sm text-muted-foreground mt-1">Hast du besondere Anforderungen? (optional)</p>
          </div>
          <div className="space-y-2">
            {ACCESSIBILITY_OPTIONS.map(opt => (
              <Button
                key={opt.id}
                variant={accessibilityNeeds.includes(opt.id) ? 'default' : 'outline'}
                className="w-full justify-start"
                onClick={() => setAccessibilityNeeds(toggleArray(accessibilityNeeds, opt.id))}
              >
                {accessibilityNeeds.includes(opt.id) && <Check className="h-4 w-4 mr-2" />}
                {opt.label}
              </Button>
            ))}
          </div>
          <Button variant="ghost" className="w-full text-muted-foreground" onClick={() => setStep(step + 1)}>
            Keine besonderen Anforderungen
          </Button>
        </Card>
      )}

      {/* Step 4: AI & Tour preferences */}
      {step === 4 && (
        <Card className="p-6 space-y-5">
          <div className="text-center mb-2">
            <Sparkles className="h-8 w-8 mx-auto mb-2 text-primary" />
            <h2 className="text-xl font-bold">Dein Erlebnis</h2>
            <p className="text-sm text-muted-foreground mt-1">Wie soll dein Guide sprechen?</p>
          </div>

          <div>
            <p className="text-sm font-medium mb-2">Tonalitaet</p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'formal', label: 'Formell', desc: 'Sachlich & professionell' },
                { id: 'warm', label: 'Freundlich', desc: 'Persoenlich & einladend' },
                { id: 'casual', label: 'Locker', desc: 'Entspannt & unkompliziert' },
                { id: 'enthusiastic', label: 'Begeistert', desc: 'Lebhaft & mitreissend' },
              ].map(t => (
                <Button
                  key={t.id}
                  variant={aiTone === t.id ? 'default' : 'outline'}
                  className="h-auto py-2 flex-col"
                  onClick={() => setAiTone(t.id as typeof aiTone)}
                >
                  <span className="font-medium text-sm">{t.label}</span>
                  <span className="text-[10px] opacity-70">{t.desc}</span>
                </Button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-medium mb-2">Detailtiefe</p>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'minimal', label: 'Kurz', desc: '1-2 Saetze' },
                { id: 'standard', label: 'Normal', desc: '4-6 Saetze' },
                { id: 'detailed', label: 'Ausfuehrlich', desc: '8+ Saetze' },
              ].map(d => (
                <Button
                  key={d.id}
                  variant={aiDetail === d.id ? 'default' : 'outline'}
                  className="h-auto py-2 flex-col"
                  onClick={() => setAiDetail(d.id as typeof aiDetail)}
                >
                  <span className="font-medium text-sm">{d.label}</span>
                  <span className="text-[10px] opacity-70">{d.desc}</span>
                </Button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-medium mb-2">Fuehrungsart</p>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'quick', label: 'Schnell', desc: '~30 Min' },
                { id: 'standard', label: 'Normal', desc: '~60 Min' },
                { id: 'deep_dive', label: 'Intensiv', desc: '90+ Min' },
              ].map(td => (
                <Button
                  key={td.id}
                  variant={tourDepth === td.id ? 'default' : 'outline'}
                  className="h-auto py-2 flex-col"
                  onClick={() => setTourDepth(td.id as typeof tourDepth)}
                >
                  <span className="font-medium text-sm">{td.label}</span>
                  <span className="text-[10px] opacity-70">{td.desc}</span>
                </Button>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* Navigation buttons */}
      <div className="flex justify-between mt-4">
        <Button
          variant="outline"
          onClick={() => setStep(s => s - 1)}
          disabled={step === 0}
        >
          <ChevronLeft className="h-4 w-4 mr-1" /> Zurueck
        </Button>

        {step < TOTAL_STEPS - 1 ? (
          <Button onClick={() => setStep(s => s + 1)} disabled={!canAdvance()}>
            Weiter <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        ) : (
          <Button onClick={handleFinish} disabled={saving}>
            {saving ? 'Speichere...' : 'Fertig!'} <Check className="h-4 w-4 ml-1" />
          </Button>
        )}
      </div>

      {/* Skip option */}
      <div className="text-center mt-3">
        <Button variant="link" className="text-xs text-muted-foreground" onClick={handleFinish}>
          Ueberspringen und sofort starten
        </Button>
      </div>
    </div>
  )
}
