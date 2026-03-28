import { Link } from 'react-router-dom'
import { Languages } from 'lucide-react'
import { useI18n } from '@/context/I18nContext'

export default function Footer() {
  const { t } = useI18n()
  return (
    <footer
      className="mt-auto py-8"
      style={{
        background: 'rgba(20, 10, 35, 0.70)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderTop: '1px solid rgba(255,255,255,0.12)',
      }}
    >
      <div className="container">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mb-6">
          {/* Produkte */}
          <div>
            <h4 className="text-xs font-semibold mb-2 text-white/90 uppercase tracking-wider">Produkte</h4>
            <ul className="space-y-1.5 text-xs text-white/60">
              <li><Link to="/features" className="hover:text-white transition-colors">Features</Link></li>
              <li><Link to="/preise" className="hover:text-white transition-colors">Preise</Link></li>
              <li><Link to="/technology" className="hover:text-white transition-colors">Technologie</Link></li>
              <li><Link to="/compare" className="hover:text-white transition-colors">Vergleich</Link></li>
            </ul>
          </div>
          {/* Lösungen */}
          <div>
            <h4 className="text-xs font-semibold mb-2 text-white/90 uppercase tracking-wider">Lösungen</h4>
            <ul className="space-y-1.5 text-xs text-white/60">
              <li><Link to="/solutions" className="hover:text-white transition-colors">Übersicht</Link></li>
              <li><Link to="/loesungen/stadtfuehrer" className="hover:text-white transition-colors">Stadtführer</Link></li>
              <li><Link to="/loesungen/agenturen" className="hover:text-white transition-colors">Agenturen</Link></li>
              <li><Link to="/loesungen/kreuzfahrt" className="hover:text-white transition-colors">Kreuzfahrt</Link></li>
              <li><Link to="/sales/conference" className="hover:text-white transition-colors">Kongresszentren</Link></li>
              <li><Link to="/loesungen/enterprise" className="hover:text-white transition-colors">Enterprise</Link></li>
            </ul>
          </div>
          {/* Unternehmen */}
          <div>
            <h4 className="text-xs font-semibold mb-2 text-white/90 uppercase tracking-wider">Unternehmen</h4>
            <ul className="space-y-1.5 text-xs text-white/60">
              <li><Link to="/ueber-uns" className="hover:text-white transition-colors">Über uns</Link></li>
              <li><Link to="/investors" className="hover:text-white transition-colors">Investoren</Link></li>
              <li><Link to="/kontakt" className="hover:text-white transition-colors">Kontakt</Link></li>
              <li><Link to="/kontakt?type=demo" className="hover:text-white transition-colors">Demo anfragen</Link></li>
            </ul>
          </div>
          {/* Rechtliches */}
          <div>
            <h4 className="text-xs font-semibold mb-2 text-white/90 uppercase tracking-wider">Rechtliches</h4>
            <ul className="space-y-1.5 text-xs text-white/60">
              <li><Link to="/impressum" className="hover:text-white transition-colors">{t('footer.imprint')}</Link></li>
              <li><Link to="/datenschutz" className="hover:text-white transition-colors">{t('footer.privacy')}</Link></li>
            </ul>
          </div>
        </div>
        {/* Bottom bar */}
        <div className="border-t border-white/10 pt-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs text-white/50">
            <Languages className="h-4 w-4" aria-hidden="true" />
            <span>fintutto</span>
            <span className="opacity-40">v3.1</span>
          </div>
          <div className="flex flex-wrap items-center gap-x-3 text-[11px] text-white/40">
            <span>&copy; {new Date().getFullYear()} ai tour ug (haftungsbeschränkt)</span>
            <span>·</span>
            {t('footer.projectBy')} <a href="https://fintutto.world" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors underline">fintutto.world</a>
            <span>·</span>
            <a href="https://www.iguide.ch/en/" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">iguide.ch</a>
            <span>·</span>
            <a href="https://itour.de/" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">itour.de</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
