import { Link } from 'react-router-dom'
import { Languages } from 'lucide-react'
import { useI18n } from '@/context/I18nContext'

export default function Footer() {
  const { t } = useI18n()
  return (
    <footer className="border-t border-border py-8 mt-auto">
      <div className="container">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mb-6">
          {/* Produkte */}
          <div>
            <h4 className="text-xs font-semibold mb-2">Produkte</h4>
            <ul className="space-y-1 text-xs text-muted-foreground">
              <li><Link to="/features" className="hover:text-foreground transition-colors">Features</Link></li>
              <li><Link to="/preise" className="hover:text-foreground transition-colors">Preise</Link></li>
              <li><Link to="/technology" className="hover:text-foreground transition-colors">Technologie</Link></li>
              <li><Link to="/compare" className="hover:text-foreground transition-colors">Vergleich</Link></li>
            </ul>
          </div>
          {/* Loesungen */}
          <div>
            <h4 className="text-xs font-semibold mb-2">Loesungen</h4>
            <ul className="space-y-1 text-xs text-muted-foreground">
              <li><Link to="/solutions" className="hover:text-foreground transition-colors">Uebersicht</Link></li>
              <li><Link to="/loesungen/stadtfuehrer" className="hover:text-foreground transition-colors">Stadtfuehrer</Link></li>
              <li><Link to="/loesungen/agenturen" className="hover:text-foreground transition-colors">Agenturen</Link></li>
              <li><Link to="/loesungen/kreuzfahrt" className="hover:text-foreground transition-colors">Kreuzfahrt</Link></li>
              <li><Link to="/sales/conference" className="hover:text-foreground transition-colors">Kongresszentren</Link></li>
              <li><Link to="/loesungen/enterprise" className="hover:text-foreground transition-colors">Enterprise</Link></li>
            </ul>
          </div>
          {/* Unternehmen */}
          <div>
            <h4 className="text-xs font-semibold mb-2">Unternehmen</h4>
            <ul className="space-y-1 text-xs text-muted-foreground">
              <li><Link to="/ueber-uns" className="hover:text-foreground transition-colors">Ueber uns</Link></li>
              <li><Link to="/investors" className="hover:text-foreground transition-colors">Investoren</Link></li>
              <li><Link to="/kontakt" className="hover:text-foreground transition-colors">Kontakt</Link></li>
              <li><Link to="/kontakt?type=demo" className="hover:text-foreground transition-colors">Demo anfragen</Link></li>
            </ul>
          </div>
          {/* Rechtliches */}
          <div>
            <h4 className="text-xs font-semibold mb-2">Rechtliches</h4>
            <ul className="space-y-1 text-xs text-muted-foreground">
              <li><Link to="/impressum" className="hover:text-foreground transition-colors">{t('footer.imprint')}</Link></li>
              <li><Link to="/datenschutz" className="hover:text-foreground transition-colors">{t('footer.privacy')}</Link></li>
            </ul>
          </div>
        </div>
        {/* Bottom bar */}
        <div className="border-t border-border pt-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Languages className="h-4 w-4" aria-hidden="true" />
            <span>guidetranslator</span>
            <span className="opacity-40">v3.1</span>
          </div>
          <div className="flex flex-wrap items-center gap-x-3 text-[11px] text-muted-foreground/60">
            <span>&copy; {new Date().getFullYear()} ai tour ug (haftungsbeschraenkt)</span>
            <span>·</span>
            {t('footer.projectBy')} <a href="https://fintutto.world" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors underline">fintutto.world</a>
            <span>·</span>
            <a href="https://www.iguide.ch/en/" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">iguide.ch</a>
            <span>·</span>
            <a href="https://itour.de/" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">itour.de</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
