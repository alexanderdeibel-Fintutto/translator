/**
 * Guest Feedback Page
 *
 * Simple 1-5 star rating after a translation session.
 * Anonymous, shown in the guest's language.
 */

import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Star, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { supabase } from '@/lib/supabase'
import { getListenerStrings, detectListenerLocale, isListenerRTL } from '@/lib/listener-i18n'

const FEEDBACK_STRINGS: Record<string, { title: string; subtitle: string; placeholder: string; submit: string; thanks: string; skip: string }> = {
  de: { title: 'Wie war die Übersetzung?', subtitle: 'Ihr Feedback hilft uns, besser zu werden.', placeholder: 'Optionaler Kommentar...', submit: 'Bewertung senden', thanks: 'Vielen Dank!', skip: 'Überspringen' },
  en: { title: 'How was the translation?', subtitle: 'Your feedback helps us improve.', placeholder: 'Optional comment...', submit: 'Send rating', thanks: 'Thank you!', skip: 'Skip' },
  fr: { title: 'Comment était la traduction?', subtitle: 'Vos retours nous aident à nous améliorer.', placeholder: 'Commentaire optionnel...', submit: 'Envoyer', thanks: 'Merci!', skip: 'Passer' },
  es: { title: '¿Cómo fue la traducción?', subtitle: 'Tu opinión nos ayuda a mejorar.', placeholder: 'Comentario opcional...', submit: 'Enviar valoración', thanks: '¡Gracias!', skip: 'Omitir' },
  it: { title: 'Com\'era la traduzione?', subtitle: 'Il tuo feedback ci aiuta a migliorare.', placeholder: 'Commento opzionale...', submit: 'Invia valutazione', thanks: 'Grazie!', skip: 'Salta' },
  ar: { title: 'كيف كانت الترجمة؟', subtitle: 'تعليقاتك تساعدنا على التحسين.', placeholder: 'تعليق اختياري...', submit: 'إرسال التقييم', thanks: 'شكراً!', skip: 'تخطي' },
  zh: { title: '翻译效果如何？', subtitle: '您的反馈帮助我们改进。', placeholder: '可选评论...', submit: '发送评分', thanks: '谢谢！', skip: '跳过' },
  ja: { title: '翻訳はいかがでしたか？', subtitle: 'フィードバックをお聞かせください。', placeholder: '任意のコメント...', submit: '評価を送信', thanks: 'ありがとうございます！', skip: 'スキップ' },
  ru: { title: 'Как вам перевод?', subtitle: 'Ваш отзыв помогает нам улучшаться.', placeholder: 'Необязательный комментарий...', submit: 'Отправить оценку', thanks: 'Спасибо!', skip: 'Пропустить' },
  tr: { title: 'Çeviri nasıldı?', subtitle: 'Geri bildiriminiz gelişmemize yardımcı olur.', placeholder: 'İsteğe bağlı yorum...', submit: 'Değerlendirme gönder', thanks: 'Teşekkürler!', skip: 'Atla' },
}

export default function GuestFeedbackPage() {
  const { sessionId } = useParams<{ sessionId: string }>()
  const navigate = useNavigate()
  const locale = detectListenerLocale()
  const rtl = isListenerRTL(locale)
  const strings = FEEDBACK_STRINGS[locale] || FEEDBACK_STRINGS.en

  const [rating, setRating] = useState(0)
  const [hovered, setHovered] = useState(0)
  const [comment, setComment] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (rating === 0) return
    setLoading(true)
    try {
      await supabase.from('sc_guest_feedback').insert({
        session_id: sessionId || null,
        rating,
        comment: comment.trim() || null,
        guest_language: locale,
      })
      setSubmitted(true)
    } catch (err) {
      console.error('Feedback-Fehler:', err)
      setSubmitted(true) // Trotzdem als abgeschlossen markieren
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center px-4" dir={rtl ? 'rtl' : 'ltr'}>
        <div className="text-center space-y-4">
          <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto" />
          <h2 className="text-2xl font-bold">{strings.thanks}</h2>
          <p className="text-muted-foreground">{'⭐'.repeat(rating)}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[100dvh] flex items-center justify-center px-4 py-8" dir={rtl ? 'rtl' : 'ltr'}>
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold">{strings.title}</h1>
          <p className="text-sm text-muted-foreground">{strings.subtitle}</p>
        </div>

        <Card className="p-8 space-y-6">
          {/* Stars */}
          <div className="flex justify-center gap-3">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => setRating(star)}
                onMouseEnter={() => setHovered(star)}
                onMouseLeave={() => setHovered(0)}
                className="transition-transform hover:scale-110 active:scale-95"
              >
                <Star
                  className={`h-10 w-10 transition-colors ${
                    star <= (hovered || rating)
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-muted-foreground'
                  }`}
                />
              </button>
            ))}
          </div>

          {/* Optional comment */}
          {rating > 0 && (
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={strings.placeholder}
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm resize-none h-20 focus:outline-none focus:ring-2 focus:ring-violet-500"
              dir={rtl ? 'rtl' : 'ltr'}
            />
          )}

          <div className="flex gap-3">
            <Button
              variant="ghost"
              className="flex-1 text-muted-foreground"
              onClick={() => navigate('/')}
            >
              {strings.skip}
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={rating === 0 || loading}
              className="flex-1 bg-violet-700 hover:bg-violet-800"
            >
              {strings.submit}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}
