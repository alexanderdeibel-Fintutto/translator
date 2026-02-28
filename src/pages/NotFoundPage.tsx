import { Link } from 'react-router-dom'
import { Home, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center space-y-6">
      <div className="text-8xl font-bold text-muted-foreground/20">404</div>
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">Seite nicht gefunden</h1>
        <p className="text-muted-foreground max-w-md">
          Die angeforderte Seite existiert nicht oder wurde verschoben.
        </p>
      </div>
      <div className="flex gap-3">
        <Button variant="outline" onClick={() => window.history.back()} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Zurück
        </Button>
        <Button asChild className="gap-2">
          <Link to="/">
            <Home className="h-4 w-4" />
            Startseite
          </Link>
        </Button>
      </div>
    </div>
  )
}
