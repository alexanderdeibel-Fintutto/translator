import { Link } from 'react-router-dom'
import { Home, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useI18n } from '@/context/I18nContext'

export default function NotFoundPage() {
  const { t } = useI18n()
  return (
    <div className="relative flex flex-col items-center justify-center py-20 px-4 text-center">
<div className="relative z-10 space-y-6">
        <div className="text-8xl font-bold text-white/20 drop-shadow-2xl">404</div>

        <div className="rounded-2xl bg-black/25 backdrop-blur-md border border-white/20 shadow-xl p-8 space-y-3 max-w-sm mx-auto">
          <h1 className="text-2xl font-bold text-white drop-shadow">{t('notFound.title')}</h1>
          <p className="text-white/75 text-sm">
            {t('notFound.description')}
          </p>
        </div>

        <div className="flex gap-3 justify-center">
          <Button
            variant="outline"
            onClick={() => window.history.back()}
            className="gap-2 border-white/30 text-white hover:bg-white/10 backdrop-blur-sm"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            {t('notFound.back')}
          </Button>
          <Button asChild className="gap-2 gradient-translator text-white shadow-lg">
            <Link to="/">
              <Home className="h-4 w-4" aria-hidden="true" />
              {t('notFound.home')}
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
