import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="border-t border-border py-6 mt-auto">
      <div className="container">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <img src="/logo-transparent.svg" alt="guidetranslator" className="h-5 w-5" />
            <span>guidetranslator <span className="text-muted-foreground/60">(by fintutto)</span></span>
          </div>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <Link to="/impressum" className="hover:text-foreground transition-colors">Impressum</Link>
            <Link to="/datenschutz" className="hover:text-foreground transition-colors">Datenschutz</Link>
            <span>&copy; {new Date().getFullYear()} AI Tour Guide UG (haftungsbeschränkt)</span>
          </div>
        </div>
        <div className="mt-3 text-center text-[11px] text-muted-foreground/60">
          Ein Produkt der <a href="https://fintutto.cloud" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors underline">Fintutto</a> Gruppe
        </div>
      </div>
    </footer>
  )
}
