import { Outlet, Link, useLocation } from 'react-router-dom'
import { Menu, X, ChevronDown } from 'lucide-react'
import { useState } from 'react'

const NAV_ITEMS = [
  { label: 'Home', path: '/' },
  {
    label: 'Apps',
    children: [
      { label: 'Translator', path: '/apps/translator' },
      { label: 'Live', path: '/apps/live' },
      { label: 'Enterprise', path: '/apps/enterprise' },
    ],
  },
  {
    label: 'Produkte',
    children: [
      { label: 'Art Guide', path: '/products/artguide' },
      { label: 'City Guide', path: '/products/cityguide' },
      { label: 'Region Guide', path: '/products/regionguide' },
    ],
  },
  {
    label: 'Loesungen',
    children: [
      { label: 'Stadtfuehrer', path: '/solutions/tourguides' },
      { label: 'Agenturen', path: '/solutions/agencies' },
      { label: 'Schulen', path: '/solutions/schools' },
      { label: 'Behoerden', path: '/solutions/authorities' },
      { label: 'NGO', path: '/solutions/ngo' },
      { label: 'Hospitality', path: '/solutions/hospitality' },
      { label: 'Medizin', path: '/solutions/medical' },
      { label: 'Events', path: '/solutions/events' },
    ],
  },
  { label: 'Preise', path: '/pricing' },
  { label: 'Investoren', path: '/investors' },
]

const MORE_ITEMS = [
  { label: 'Features', path: '/features' },
  { label: 'Technologie', path: '/technology' },
  { label: 'Wettbewerb', path: '/competition' },
  { label: 'Markt', path: '/market' },
  { label: 'Roadmap', path: '/roadmap' },
  { label: 'Team', path: '/team' },
  { label: 'News', path: '/news' },
  { label: 'Kontakt', path: '/contact' },
]

type NavItem = { label: string; path?: string; children?: { label: string; path: string }[] }

function DesktopDropdown({ item }: { item: NavItem }) {
  const location = useLocation()
  const isActive = item.children?.some(c => location.pathname === c.path)

  return (
    <div className="relative group">
      <button className={`px-3 py-1.5 text-sm rounded-md transition-colors flex items-center gap-1 ${
        isActive ? 'bg-primary/10 text-primary font-medium' : 'text-muted-foreground hover:text-foreground hover:bg-muted'
      }`}>
        {item.label}
        <ChevronDown className="w-3 h-3" />
      </button>
      <div className="absolute top-full left-0 pt-1 hidden group-hover:block z-50">
        <div className="bg-background/95 backdrop-blur border rounded-lg shadow-lg py-1 min-w-[160px]">
          {item.children!.map((child) => (
            <Link
              key={child.path}
              to={child.path}
              className={`block px-4 py-2 text-sm transition-colors ${
                location.pathname === child.path
                  ? 'bg-primary/10 text-primary font-medium'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              {child.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

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
            <span><span className="text-primary">fintutto</span>world</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {NAV_ITEMS.map((item) =>
              item.children ? (
                <DesktopDropdown key={item.label} item={item} />
              ) : (
                <Link
                  key={item.path}
                  to={item.path!}
                  className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                    location.pathname === item.path
                      ? 'bg-primary/10 text-primary font-medium'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                >
                  {item.label}
                </Link>
              )
            )}
            {/* More dropdown */}
            <div className="relative group">
              <button className="px-3 py-1.5 text-sm rounded-md text-muted-foreground hover:text-foreground hover:bg-muted flex items-center gap-1">
                Mehr <ChevronDown className="w-3 h-3" />
              </button>
              <div className="absolute top-full right-0 pt-1 hidden group-hover:block z-50">
                <div className="bg-background/95 backdrop-blur border rounded-lg shadow-lg py-1 min-w-[160px]">
                  {MORE_ITEMS.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`block px-4 py-2 text-sm transition-colors ${
                        location.pathname === item.path
                          ? 'bg-primary/10 text-primary font-medium'
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                      }`}
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </nav>

          {/* Mobile toggle */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="lg:hidden p-2 rounded-md hover:bg-muted"
            aria-label="Menu"
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Nav */}
        {menuOpen && (
          <nav className="lg:hidden border-t px-4 py-2 space-y-0.5 max-h-[80vh] overflow-y-auto">
            {NAV_ITEMS.map((item) =>
              item.children ? (
                <div key={item.label}>
                  <p className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{item.label}</p>
                  {item.children.map((child) => (
                    <Link
                      key={child.path}
                      to={child.path}
                      onClick={() => setMenuOpen(false)}
                      className={`block px-6 py-2 text-sm rounded-md ${
                        location.pathname === child.path
                          ? 'bg-primary/10 text-primary font-medium'
                          : 'text-muted-foreground hover:bg-muted'
                      }`}
                    >
                      {child.label}
                    </Link>
                  ))}
                </div>
              ) : (
                <Link
                  key={item.path}
                  to={item.path!}
                  onClick={() => setMenuOpen(false)}
                  className={`block px-3 py-2 text-sm rounded-md ${
                    location.pathname === item.path
                      ? 'bg-primary/10 text-primary font-medium'
                      : 'text-muted-foreground hover:bg-muted'
                  }`}
                >
                  {item.label}
                </Link>
              )
            )}
            <div className="border-t my-1" />
            {MORE_ITEMS.map((item) => (
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
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-6 text-sm">
            <div className="space-y-2">
              <h4 className="font-semibold">Apps</h4>
              <div className="space-y-1 text-muted-foreground">
                <Link to="/apps/translator" className="block hover:text-foreground">Translator</Link>
                <Link to="/apps/live" className="block hover:text-foreground">Live</Link>
                <Link to="/apps/enterprise" className="block hover:text-foreground">Enterprise</Link>
              </div>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold">Produkte</h4>
              <div className="space-y-1 text-muted-foreground">
                <Link to="/products/artguide" className="block hover:text-foreground">Art Guide</Link>
                <Link to="/products/cityguide" className="block hover:text-foreground">City Guide</Link>
                <Link to="/products/regionguide" className="block hover:text-foreground">Region Guide</Link>
                <Link to="/pricing" className="block hover:text-foreground">Preise</Link>
              </div>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold">Loesungen</h4>
              <div className="space-y-1 text-muted-foreground">
                <Link to="/solutions/tourguides" className="block hover:text-foreground">Stadtfuehrer</Link>
                <Link to="/solutions/agencies" className="block hover:text-foreground">Agenturen</Link>
                <Link to="/solutions/schools" className="block hover:text-foreground">Schulen</Link>
                <Link to="/solutions/authorities" className="block hover:text-foreground">Behoerden</Link>
                <Link to="/solutions/ngo" className="block hover:text-foreground">NGO</Link>
                <Link to="/solutions/hospitality" className="block hover:text-foreground">Hospitality</Link>
                <Link to="/solutions/medical" className="block hover:text-foreground">Medizin</Link>
                <Link to="/solutions/events" className="block hover:text-foreground">Events</Link>
              </div>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold">Unternehmen</h4>
              <div className="space-y-1 text-muted-foreground">
                <Link to="/team" className="block hover:text-foreground">Team</Link>
                <Link to="/roadmap" className="block hover:text-foreground">Roadmap</Link>
                <Link to="/investors" className="block hover:text-foreground">Investoren</Link>
                <Link to="/news" className="block hover:text-foreground">News</Link>
                <Link to="/contact" className="block hover:text-foreground">Kontakt</Link>
              </div>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold">Mehr</h4>
              <div className="space-y-1 text-muted-foreground">
                <Link to="/features" className="block hover:text-foreground">Features</Link>
                <Link to="/technology" className="block hover:text-foreground">Technologie</Link>
                <Link to="/competition" className="block hover:text-foreground">Wettbewerb</Link>
                <Link to="/market" className="block hover:text-foreground">Marktgroesse</Link>
                <Link to="/impressum" className="block hover:text-foreground">Impressum</Link>
                <Link to="/datenschutz" className="block hover:text-foreground">Datenschutz</Link>
              </div>
            </div>
          </div>
          <div className="mt-8 pt-4 border-t text-center text-xs text-muted-foreground">
            <p>fintutto ug (haftungsbeschraenkt) · GF: Alexander Deibel · Kolonie 2, 18317 Saal · info@fintutto.world</p>
            <p className="mt-1">Fintutto World · Stand: Maerz 2026</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
