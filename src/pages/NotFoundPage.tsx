import { Link } from 'react-router-dom'
import { Home, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useI18n } from '@/context/I18nContext'

export default function NotFoundPage() {
  const { t } = useI18n()
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center space-y-6">
      <div className="text-8xl font-bold text-muted-foreground/20">404</div>
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">{t('notFound.title')}</h1>
        <p className="text-muted-foreground max-w-md">
          {t('notFound.description')}
        </p>
      </div>
      <div className="flex gap-3">
        <Button variant="outline" onClick={() => window.history.back()} className="gap-2">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          {t('notFound.back')}
        </Button>
        <Button asChild className="gap-2">
          <Link to="/">
            <Home className="h-4 w-4" aria-hidden="true" />
            {t('notFound.home')}
          </Link>
        </Button>
      </div>
    </div>
  )
}
