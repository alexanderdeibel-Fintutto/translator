import { Outlet, Link, useLocation } from 'react-router-dom'
import { Menu, X, Shield } from 'lucide-react'
import { useState } from 'react'

const CRM_URL = 'https://consumer.guidetranslator.com/crm'

const NAV_ITEMS = [
  { label: 'Produkte', path: '/' },
  { label: 'Translator', path: '/apps/translator' },
  { label: 'Live', path: '/apps/live' },
  { label: 'Enterprise', path: '/apps/enterprise' },
  { label: 'Features', path: '/features' },
  { label: 'Investoren', path: '/investors' },
  { label: 'News', path: '/news' },
]

export default function LandingLayout() {
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex items-center justify-between h-14 px-4">
          <Link to="/" className="flex items-center gap-2 font-bold text-lg">
            <img src="/app-logo.svg" alt="Fintutto Logo" className="w-8 h-8 rounded-lg" />
            <span><span className="text-primary">fintutto</span>translator</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                  location.pathname === item.path
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* CRM Login + Mobile toggle */}
          <div className="flex items-center gap-2">
            <a
              href={CRM_URL}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md border border-primary/30 hover:bg-primary/10 transition-colors"
            >
              <Shield className="h-3.5 w-3.5" />
              CRM
            </a>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2 rounded-md hover:bg-muted"
              aria-label="Menu"
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        {menuOpen && (
          <nav className="md:hidden border-t px-4 py-2 space-y-1">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMenuOpen(false)}
                className={`block px-3 py-2 text-sm rounded-md ${
                  location.pathname === item.path
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'text-muted-foreground hover:bg-muted'
                }`}
              >
                {item.label}
              </Link>
            ))}
            <a
              href={CRM_URL}
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-2 px-3 py-2 text-sm rounded-md text-primary hover:bg-primary/10 font-medium"
            >
              <Shield className="h-4 w-4" />
              CRM Login
            </a>
          </nav>
        )}
      </header>

      {/* Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t py-8 px-4">
        <div className="container max-w-5xl mx-auto">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-sm">
            <div className="space-y-2">
              <h4 className="font-semibold">Apps</h4>
              <div className="space-y-1 text-muted-foreground">
                <Link to="/apps/translator" className="block hover:text-foreground">Translator</Link>
                <Link to="/apps/live" className="block hover:text-foreground">Live</Link>
                <Link to="/apps/enterprise" className="block hover:text-foreground">Enterprise</Link>
              </div>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold">Produkt</h4>
              <div className="space-y-1 text-muted-foreground">
                <Link to="/features" className="block hover:text-foreground">Features</Link>
                <Link to="/technology" className="block hover:text-foreground">Technologie</Link>
                <Link to="/news" className="block hover:text-foreground">News</Link>
              </div>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold">Unternehmen</h4>
              <div className="space-y-1 text-muted-foreground">
                <Link to="/investors" className="block hover:text-foreground">Investoren</Link>
                <a href="mailto:info@guidetranslator.com" className="block hover:text-foreground">Kontakt</a>
              </div>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold">Rechtliches</h4>
              <div className="space-y-1 text-muted-foreground">
                <Link to="/impressum" className="block hover:text-foreground">Impressum</Link>
                <Link to="/datenschutz" className="block hover:text-foreground">Datenschutz</Link>
              </div>
            </div>
          </div>
          <div className="mt-8 pt-4 border-t text-center text-xs text-muted-foreground">
            <p>fintutto ug (haftungsbeschränkt) · GF: Alexander Deibel · Kolonie 2, 18317 Saal · info@guidetranslator.com</p>
            <p className="mt-1">Fintutto Translator v4.1 · Stand: März 2026</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
