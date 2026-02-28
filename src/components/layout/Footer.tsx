import { Languages } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useI18n } from '@/context/I18nContext'

export default function Footer() {
  const { t } = useI18n()
  return (
    <footer className="border-t border-border py-6 mt-auto">
      <div className="container">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Languages className="h-4 w-4" aria-hidden="true" />
            <span>guidetranslator</span>
          </div>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <Link to="/impressum" className="hover:text-foreground transition-colors">{t('footer.imprint')}</Link>
            <Link to="/datenschutz" className="hover:text-foreground transition-colors">{t('footer.privacy')}</Link>
            <span>&copy; {new Date().getFullYear()} ai tour ug</span>
          </div>
        </div>
        <div className="mt-3 text-center text-[11px] text-muted-foreground/60">
          {t('footer.projectBy')} <a href="https://fintutto.cloud" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors underline">fintutto.cloud</a>
        </div>
      </div>
    </footer>
  )
}
