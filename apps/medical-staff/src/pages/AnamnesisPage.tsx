/**
 * AnamnesisPage — Strukturierter Anamnese-Workflow
 *
 * Geführter Fragebogen für die Erstanamnese mit automatischer Übersetzung.
 * Alle Fragen werden übersetzt und vorgelesen, Antworten werden protokolliert.
 * Export als PDF für die Patientenakte.
 */
import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft, ArrowRight, CheckCircle, Volume2,
  FileText, ChevronDown, Stethoscope, AlertTriangle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { translateText } from '@/lib/translate'
import { speakText } from '@/lib/tts'

const LANGUAGES = [
  { code: 'ar', label: 'العربية', flag: '🇸🇦' },
  { code: 'tr', label: 'Türkçe', flag: '🇹🇷' },
  { code: 'uk', label: 'Українська', flag: '🇺🇦' },
  { code: 'ru', label: 'Русский', flag: '🇷🇺' },
  { code: 'fa', label: 'فارسی', flag: '🇮🇷' },
  { code: 'ro', label: 'Română', flag: '🇷🇴' },
  { code: 'pl', label: 'Polski', flag: '🇵🇱' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'es', label: 'Español', flag: '🇪🇸' },
  { code: 'zh', label: '中文', flag: '🇨🇳' },
  { code: 'vi', label: 'Tiếng Việt', flag: '🇻🇳' },
]

interface AnamnesisQuestion {
  id: string
  category: string
  question: string
  type: 'yesno' | 'scale' | 'text' | 'multiple'
  options?: string[]
}

const ANAMNESIS_QUESTIONS: AnamnesisQuestion[] = [
  // Beschwerden
  { id: 'q1', category: 'Aktuelle Beschwerden', question: 'Was führt Sie heute zu uns?', type: 'text' },
  { id: 'q2', category: 'Aktuelle Beschwerden', question: 'Seit wann haben Sie diese Beschwerden?', type: 'text' },
  { id: 'q3', category: 'Aktuelle Beschwerden', question: 'Wie stark sind Ihre Schmerzen? (0 = kein Schmerz, 10 = unerträglicher Schmerz)', type: 'scale' },
  // Vorerkrankungen
  { id: 'q4', category: 'Vorerkrankungen', question: 'Haben Sie bekannte Vorerkrankungen?', type: 'yesno' },
  { id: 'q5', category: 'Vorerkrankungen', question: 'Wurden Sie schon einmal operiert?', type: 'yesno' },
  { id: 'q6', category: 'Vorerkrankungen', question: 'Haben Sie Diabetes?', type: 'yesno' },
  { id: 'q7', category: 'Vorerkrankungen', question: 'Haben Sie Bluthochdruck?', type: 'yesno' },
  { id: 'q8', category: 'Vorerkrankungen', question: 'Haben Sie Herzprobleme?', type: 'yesno' },
  // Medikamente & Allergien
  { id: 'q9', category: 'Medikamente & Allergien', question: 'Nehmen Sie regelmäßig Medikamente ein?', type: 'yesno' },
  { id: 'q10', category: 'Medikamente & Allergien', question: 'Sind Sie allergisch gegen Medikamente oder andere Stoffe?', type: 'yesno' },
  { id: 'q11', category: 'Medikamente & Allergien', question: 'Haben Sie eine Penicillin-Allergie?', type: 'yesno' },
  // Soziale Anamnese
  { id: 'q12', category: 'Soziale Anamnese', question: 'Rauchen Sie?', type: 'yesno' },
  { id: 'q13', category: 'Soziale Anamnese', question: 'Trinken Sie regelmäßig Alkohol?', type: 'yesno' },
  // Gynäkologisch (optional)
  { id: 'q14', category: 'Gynäkologisch', question: 'Sind Sie schwanger oder könnte eine Schwangerschaft bestehen?', type: 'yesno' },
]

interface Answer {
  questionId: string
  answer: string
  translatedQuestion: string
}

export default function AnamnesisPage() {
  const navigate = useNavigate()
  const [selectedLang, setSelectedLang] = useState(LANGUAGES[0])
  const [showLangPicker, setShowLangPicker] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<Answer[]>([])
  const [translatedQuestion, setTranslatedQuestion] = useState('')
  const [isTranslating, setIsTranslating] = useState(false)
  const [isComplete, setIsComplete] = useState(false)

  const currentQuestion = ANAMNESIS_QUESTIONS[currentIndex]

  const translateQuestion = useCallback(async (question: string) => {
    setIsTranslating(true)
    try {
      const translated = await translateText(question, 'de', selectedLang.code)
      setTranslatedQuestion(translated)
      await speakText(translated, selectedLang.code)
    } catch {
      setTranslatedQuestion(question)
    } finally {
      setIsTranslating(false)
    }
  }, [selectedLang])

  const handleAnswer = useCallback(async (answer: string) => {
    const newAnswer: Answer = {
      questionId: currentQuestion.id,
      answer,
      translatedQuestion: translatedQuestion || currentQuestion.question,
    }
    setAnswers(prev => [...prev, newAnswer])

    if (currentIndex < ANAMNESIS_QUESTIONS.length - 1) {
      setCurrentIndex(i => i + 1)
      setTranslatedQuestion('')
    } else {
      setIsComplete(true)
    }
  }, [currentQuestion, currentIndex, translatedQuestion])

  const handleExport = () => {
    const lines = answers.map(a => {
      const q = ANAMNESIS_QUESTIONS.find(q => q.id === a.questionId)
      return `${q?.category} | ${q?.question}: ${a.answer}`
    })
    const content = `ANAMNESE-PROTOKOLL\nDatum: ${new Date().toLocaleDateString('de-DE')}\nSprache: ${selectedLang.label}\n\n${lines.join('\n')}`
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `Anamnese_${new Date().toISOString().split('T')[0]}.txt`
    a.click()
  }

  const progress = ((currentIndex) / ANAMNESIS_QUESTIONS.length) * 100

  if (isComplete) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-md space-y-6 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800">Anamnese abgeschlossen</h2>
          <p className="text-gray-600">{answers.length} Fragen beantwortet</p>

          <Card className="p-4 text-left space-y-2">
            {answers.map((a, i) => {
              const q = ANAMNESIS_QUESTIONS.find(q => q.id === a.questionId)
              return (
                <div key={i} className="flex justify-between items-start gap-3 py-1 border-b border-gray-100 last:border-0">
                  <span className="text-sm text-gray-600 flex-1">{q?.question}</span>
                  <Badge variant={a.answer === 'Ja' ? 'destructive' : 'secondary'} className="shrink-0">
                    {a.answer}
                  </Badge>
                </div>
              )
            })}
          </Card>

          <div className="flex gap-3">
            <Button onClick={handleExport} variant="outline" className="flex-1">
              <FileText className="h-4 w-4 mr-2" />
              Exportieren
            </Button>
            <Button onClick={() => navigate('/')} className="flex-1 bg-red-600 hover:bg-red-700">
              Fertig
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-white border-b shadow-sm">
        <button onClick={() => navigate('/')} className="flex items-center gap-1 text-gray-500 text-sm">
          <ArrowLeft className="h-4 w-4" />
          Zurück
        </button>
        <div className="flex items-center gap-2">
          <Stethoscope className="h-4 w-4 text-red-600" />
          <span className="font-semibold text-gray-800">Anamnese</span>
        </div>
        <button
          onClick={() => setShowLangPicker(p => !p)}
          className="flex items-center gap-1 px-2 py-1 bg-blue-50 border border-blue-200 rounded-full text-sm text-blue-700"
        >
          {selectedLang.flag} {selectedLang.label} <ChevronDown className="h-3 w-3" />
        </button>
      </div>

      {/* Language Picker */}
      {showLangPicker && (
        <div className="bg-white border-b shadow-md grid grid-cols-4 gap-1 p-3">
          {LANGUAGES.map(lang => (
            <button
              key={lang.code}
              onClick={() => { setSelectedLang(lang); setShowLangPicker(false); setTranslatedQuestion('') }}
              className={cn("flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs",
                selectedLang.code === lang.code ? "bg-blue-100 text-blue-700 font-medium" : "hover:bg-gray-100")}
            >
              {lang.flag} {lang.label}
            </button>
          ))}
        </div>
      )}

      {/* Progress */}
      <div className="h-1.5 bg-gray-200">
        <div className="h-full bg-red-500 transition-all duration-500" style={{ width: `${progress}%` }} />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-6 gap-6">
        {/* Category */}
        <Badge variant="outline" className="text-xs text-gray-500">
          {currentQuestion.category} · Frage {currentIndex + 1} von {ANAMNESIS_QUESTIONS.length}
        </Badge>

        {/* Question Card */}
        <Card className="w-full max-w-lg p-6 space-y-4">
          {/* German */}
          <div className="space-y-1">
            <p className="text-xs text-gray-400 uppercase tracking-wide">Deutsch</p>
            <p className="text-lg font-medium text-gray-800">{currentQuestion.question}</p>
          </div>

          {/* Translated */}
          <div className="space-y-1 border-t pt-4">
            <div className="flex items-center justify-between">
              <p className="text-xs text-gray-400 uppercase tracking-wide">{selectedLang.label}</p>
              <button
                onClick={() => translateQuestion(currentQuestion.question)}
                className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800"
              >
                <Volume2 className="h-3 w-3" />
                Übersetzen & Vorlesen
              </button>
            </div>
            {isTranslating ? (
              <p className="text-sm text-gray-400 animate-pulse">Übersetze...</p>
            ) : translatedQuestion ? (
              <p className="text-lg text-blue-800 font-medium">{translatedQuestion}</p>
            ) : (
              <p className="text-sm text-gray-400 italic">Klicken Sie auf "Übersetzen & Vorlesen"</p>
            )}
          </div>
        </Card>

        {/* Answer Buttons */}
        {currentQuestion.type === 'yesno' && (
          <div className="flex gap-4 w-full max-w-lg">
            <button
              onClick={() => handleAnswer('Ja')}
              className="flex-1 py-5 bg-red-500 hover:bg-red-600 text-white text-xl font-bold rounded-2xl shadow-md active:scale-95 transition-all"
            >
              ✓ Ja
            </button>
            <button
              onClick={() => handleAnswer('Nein')}
              className="flex-1 py-5 bg-green-500 hover:bg-green-600 text-white text-xl font-bold rounded-2xl shadow-md active:scale-95 transition-all"
            >
              ✗ Nein
            </button>
          </div>
        )}

        {currentQuestion.type === 'scale' && (
          <div className="w-full max-w-lg grid grid-cols-6 gap-2">
            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
              <button
                key={n}
                onClick={() => handleAnswer(n.toString())}
                className={cn(
                  "py-4 rounded-xl text-lg font-bold shadow-sm active:scale-95 transition-all",
                  n <= 3 ? "bg-green-100 hover:bg-green-200 text-green-800" :
                  n <= 6 ? "bg-yellow-100 hover:bg-yellow-200 text-yellow-800" :
                  "bg-red-100 hover:bg-red-200 text-red-800"
                )}
              >
                {n}
              </button>
            ))}
          </div>
        )}

        {currentQuestion.type === 'text' && (
          <div className="flex gap-3 w-full max-w-lg">
            <Button
              onClick={() => navigate('/standalone', { state: { prefill: currentQuestion.question } })}
              className="flex-1 bg-red-600 hover:bg-red-700 py-5 text-base"
            >
              <Volume2 className="h-5 w-5 mr-2" />
              Antwort aufnehmen
            </Button>
            <Button
              onClick={() => handleAnswer('(beantwortet)')}
              variant="outline"
              className="py-5"
            >
              <ArrowRight className="h-5 w-5" />
            </Button>
          </div>
        )}

        {/* Skip */}
        <button
          onClick={() => handleAnswer('(übersprungen)')}
          className="text-xs text-gray-400 hover:text-gray-600"
        >
          Überspringen →
        </button>
      </div>

      {/* Disclaimer */}
      <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 border-t border-amber-200">
        <AlertTriangle className="h-3 w-3 text-amber-600 shrink-0" />
        <p className="text-xs text-amber-800">
          Maschinelle Übersetzung — kein Ersatz für zertifizierten Dolmetscher bei kritischen Diagnosen.
        </p>
      </div>
    </div>
  )
}
