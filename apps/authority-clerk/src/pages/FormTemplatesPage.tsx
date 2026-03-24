/**
 * Form Templates Page — Authority Clerk
 *
 * Dedicated page for browsing and translating government form templates.
 */

import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import FormTemplates from '@/components/market/FormTemplates'

export default function FormTemplatesPage() {
  const navigate = useNavigate()

  return (
    <div className="max-w-lg mx-auto py-8 px-4 space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-xl font-bold">Formular-Vorlagen</h1>
          <p className="text-sm text-muted-foreground">
            Standardtexte in die Sprache Ihres Besuchers uebersetzen
          </p>
        </div>
      </div>

      <FormTemplates
        onUseTranslation={(text) => {
          navigate('/translator', { state: { prefill: text } })
        }}
      />
    </div>
  )
}
