import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type {
  AgeGroup,
  KnowledgeLevel,
  VoiceGender,
  VoiceAge,
  AiTone,
  ContentStyle,
} from '@/lib/artguide/types'
import { VOICE_PRESETS } from '@/lib/artguide/voice-profiles'

/**
 * Onboarding flow for new visitors.
 * Collects personalization preferences to deliver the perfect experience.
 *
 * Steps:
 * 1. Welcome + Language
 * 2. Age group + How to be addressed
 * 3. Knowledge level + Interests
 * 4. Time budget + Tour depth
 * 5. Voice preference (preset or custom gender/age)
 * 6. AI personality tone
 */

interface OnboardingData {
  language: string
  age_group: AgeGroup
  preferred_salutation: string
  knowledge_level: KnowledgeLevel
  interests: string[]
  typical_visit_duration_minutes: number
  preferred_tour_depth: 'quick' | 'standard' | 'deep_dive'
  preferred_content_style: ContentStyle
  preferred_voice_preset: string | null
  preferred_voice_gender: VoiceGender
  preferred_voice_age: VoiceAge
  ai_personality_tone: AiTone
}

const STEPS = [
  'welcome',
  'about_you',
  'knowledge',
  'visit_style',
  'voice',
  'done',
] as const

export default function OnboardingPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [data, setData] = useState<OnboardingData>({
    language: 'de',
    age_group: 'adult',
    preferred_salutation: 'Sie',
    knowledge_level: 'casual',
    interests: [],
    typical_visit_duration_minutes: 90,
    preferred_tour_depth: 'standard',
    preferred_content_style: 'narrative',
    preferred_voice_preset: 'museumsfuehrerin',
    preferred_voice_gender: 'female',
    preferred_voice_age: 'middle',
    ai_personality_tone: 'warm',
  })

  const currentStep = STEPS[step]

  function next() {
    if (step < STEPS.length - 1) {
      setStep(step + 1)
    } else {
      // Save profile and navigate to main app
      localStorage.setItem('ag_visitor_profile', JSON.stringify(data))
      localStorage.setItem('ag_onboarding_complete', 'true')
      navigate('/')
    }
  }

  function back() {
    if (step > 0) setStep(step - 1)
  }

  function update<K extends keyof OnboardingData>(key: K, value: OnboardingData[K]) {
    setData(prev => ({ ...prev, [key]: value }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-950 to-indigo-900 text-white">
      {/* Progress bar */}
      <div className="h-1 bg-white/10">
        <div
          className="h-full bg-amber-400 transition-all duration-500"
          style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
        />
      </div>

      <div className="max-w-md mx-auto px-6 py-8">
        {currentStep === 'welcome' && (
          <div className="text-center space-y-6">
            <div className="text-6xl">🎨</div>
            <h1 className="text-3xl font-bold">Fintutto Art Guide</h1>
            <p className="text-white/70 text-lg">
              Dein persoenlicher KI-Museumsfuehrer.
              Lass uns kurz kennenlernen, damit ich die perfekte Fuehrung fuer dich zusammenstellen kann.
            </p>
            <p className="text-white/50 text-sm">
              Dauert nur 1 Minute — du kannst alles spaeter aendern.
            </p>
          </div>
        )}

        {currentStep === 'about_you' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Ueber dich</h2>

            <div>
              <label className="block text-sm text-white/60 mb-2">Altersgruppe</label>
              <div className="grid grid-cols-2 gap-2">
                {([
                  ['child', '👧 Kind (6-12)'],
                  ['youth', '🧑 Jugendlich (13-17)'],
                  ['young_adult', '👤 Jung (18-25)'],
                  ['adult', '👤 Erwachsen (26-59)'],
                  ['senior', '👤 Senior (60+)'],
                ] as const).map(([value, label]) => (
                  <button
                    key={value}
                    onClick={() => update('age_group', value)}
                    className={`p-3 rounded-lg text-left text-sm transition ${
                      data.age_group === value
                        ? 'bg-amber-400 text-indigo-950 font-medium'
                        : 'bg-white/10 hover:bg-white/20'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm text-white/60 mb-2">Wie soll ich dich ansprechen?</label>
              <div className="flex gap-2">
                {['Du', 'Sie', 'Hey'].map(s => (
                  <button
                    key={s}
                    onClick={() => update('preferred_salutation', s)}
                    className={`px-4 py-2 rounded-lg transition ${
                      data.preferred_salutation === s
                        ? 'bg-amber-400 text-indigo-950 font-medium'
                        : 'bg-white/10 hover:bg-white/20'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {currentStep === 'knowledge' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Dein Kunst-Level</h2>

            <div className="space-y-2">
              {([
                ['beginner', '🌱', 'Einsteiger', 'Ich bin neugierig, aber kenne mich noch nicht aus'],
                ['casual', '🎨', 'Interessiert', 'Ich gehe gerne ins Museum und kenne die Grundlagen'],
                ['enthusiast', '🖼', 'Enthusiast', 'Ich lese ueber Kunst und besuche regelmaessig Museen'],
                ['expert', '🎓', 'Kenner', 'Ich habe tiefes Wissen ueber Kunstepochen und -stile'],
                ['professional', '🏛', 'Profi', 'Kunsthistoriker, Kuenstler oder Kurator'],
              ] as const).map(([value, icon, title, desc]) => (
                <button
                  key={value}
                  onClick={() => update('knowledge_level', value)}
                  className={`w-full p-4 rounded-lg text-left transition ${
                    data.knowledge_level === value
                      ? 'bg-amber-400 text-indigo-950'
                      : 'bg-white/10 hover:bg-white/20'
                  }`}
                >
                  <div className="font-medium">{icon} {title}</div>
                  <div className={`text-sm mt-1 ${data.knowledge_level === value ? 'text-indigo-800' : 'text-white/50'}`}>
                    {desc}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {currentStep === 'visit_style' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Wie besuchst du Museen?</h2>

            <div>
              <label className="block text-sm text-white/60 mb-2">Typische Besuchsdauer</label>
              <div className="flex gap-2">
                {[
                  [30, '30 Min'],
                  [60, '1 Std'],
                  [90, '1.5 Std'],
                  [120, '2 Std'],
                  [180, '3+ Std'],
                ].map(([mins, label]) => (
                  <button
                    key={mins}
                    onClick={() => update('typical_visit_duration_minutes', mins as number)}
                    className={`flex-1 py-2 rounded-lg text-sm transition ${
                      data.typical_visit_duration_minutes === mins
                        ? 'bg-amber-400 text-indigo-950 font-medium'
                        : 'bg-white/10 hover:bg-white/20'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm text-white/60 mb-2">Fuehrungsstil</label>
              <div className="space-y-2">
                {([
                  ['quick', '⚡', 'Highlights', 'Nur die besten Werke, schnell und knapp'],
                  ['standard', '🎯', 'Ausgewogen', 'Guter Mix aus Breite und Tiefe'],
                  ['deep_dive', '🔬', 'Tieftaucher', 'Weniger Werke, dafuer ausfuehrlich'],
                ] as const).map(([value, icon, title, desc]) => (
                  <button
                    key={value}
                    onClick={() => update('preferred_tour_depth', value)}
                    className={`w-full p-4 rounded-lg text-left transition ${
                      data.preferred_tour_depth === value
                        ? 'bg-amber-400 text-indigo-950'
                        : 'bg-white/10 hover:bg-white/20'
                    }`}
                  >
                    <div className="font-medium">{icon} {title}</div>
                    <div className={`text-sm mt-1 ${data.preferred_tour_depth === value ? 'text-indigo-800' : 'text-white/50'}`}>
                      {desc}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {currentStep === 'voice' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Deine Stimme</h2>
            <p className="text-white/60">Waehle eine Stimme fuer deinen Audio-Guide</p>

            <div className="space-y-2">
              {VOICE_PRESETS.map(preset => (
                <button
                  key={preset.id}
                  onClick={() => {
                    update('preferred_voice_preset', preset.id)
                    update('preferred_voice_gender', preset.gender)
                    update('preferred_voice_age', preset.age)
                  }}
                  className={`w-full p-4 rounded-lg text-left transition ${
                    data.preferred_voice_preset === preset.id
                      ? 'bg-amber-400 text-indigo-950'
                      : 'bg-white/10 hover:bg-white/20'
                  }`}
                >
                  <div className="font-medium">
                    {preset.icon} {preset.name.de}
                  </div>
                  <div className={`text-sm mt-1 ${
                    data.preferred_voice_preset === preset.id ? 'text-indigo-800' : 'text-white/50'
                  }`}>
                    {preset.description.de}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {currentStep === 'done' && (
          <div className="text-center space-y-6">
            <div className="text-6xl">✨</div>
            <h2 className="text-2xl font-bold">Perfekt!</h2>
            <p className="text-white/70 text-lg">
              Dein persoenlicher Art Guide ist bereit.
              Jedes Museum wird jetzt auf dich zugeschnitten.
            </p>
          </div>
        )}

        {/* Navigation */}
        <div className="flex gap-3 mt-8">
          {step > 0 && (
            <button
              onClick={back}
              className="px-6 py-3 rounded-lg bg-white/10 hover:bg-white/20 transition"
            >
              Zurueck
            </button>
          )}
          <button
            onClick={next}
            className="flex-1 px-6 py-3 rounded-lg bg-amber-400 text-indigo-950 font-semibold hover:bg-amber-300 transition"
          >
            {step === STEPS.length - 1 ? 'Los geht\'s!' : 'Weiter'}
          </button>
        </div>
      </div>
    </div>
  )
}
