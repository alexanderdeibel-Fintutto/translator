import { AlertTriangle } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { SlideToConfirm } from '@/components/ui/slide-to-confirm'
import { useI18n } from '@/context/I18nContext'

interface EndSessionConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  listenerCount: number
  onConfirm: () => void
}

export default function EndSessionConfirmDialog({
  open,
  onOpenChange,
  listenerCount,
  onConfirm,
}: EndSessionConfirmDialogProps) {
  const { t } = useI18n()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
            <AlertTriangle className="h-6 w-6 text-destructive" />
          </div>
          <DialogTitle className="text-center">
            {t('live.endSessionConfirmTitle')}
          </DialogTitle>
          <DialogDescription className="text-center">
            {t('live.endSessionConfirmDesc').replace('{count}', String(listenerCount))}
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 space-y-3">
          <SlideToConfirm
            label={t('live.slideToEnd')}
            onConfirm={() => {
              onOpenChange(false)
              onConfirm()
            }}
          />

          <Button
            variant="ghost"
            className="w-full"
            onClick={() => onOpenChange(false)}
          >
            {t('live.cancel')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
