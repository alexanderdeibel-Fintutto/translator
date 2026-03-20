import { NavLink, useLocation } from 'react-router-dom'
import { useState } from 'react'
import {
  BarChart3, Users, Kanban, MessageSquare, Calendar, UserCog, Activity, DollarSign,
  Landmark, Map, Upload, Route, QrCode, Building2, ChevronDown, ChevronRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface NavSection {
  id: string
  label: string
  items: { path: string; label: string; icon: typeof Kanban; end?: boolean }[]
}

const NAV_SECTIONS: NavSection[] = [
  {
    id: 'crm',
    label: 'CRM & Vertrieb',
    items: [
      { path: '', label: 'Pipeline', icon: Kanban, end: true },
      { path: '/leads', label: 'Kontakte', icon: Users },
      { path: '/stats', label: 'CRM Stats', icon: BarChart3 },
      { path: '/requests', label: 'Anfragen', icon: MessageSquare },
      { path: '/sales', label: 'Vertrieb', icon: DollarSign },
    ],
  },
  {
    id: 'museum',
    label: 'Museum & Guide',
    items: [
      { path: '/museums', label: 'Museen', icon: Landmark },
      { path: '/museum-onboarding', label: 'Onboarding', icon: Building2 },
      { path: '/content-import', label: 'Content Import', icon: Upload },
      { path: '/tours', label: 'Fuehrungen', icon: Route },
      { path: '/qr-codes', label: 'QR-Codes', icon: QrCode },
      { path: '/museum-analytics', label: 'Analysen', icon: BarChart3 },
    ],
  },
  {
    id: 'sessions',
    label: 'Translator & System',
    items: [
      { path: '/sessions', label: 'Sessions', icon: Calendar },
      { path: '/session-stats', label: 'Session Stats', icon: BarChart3 },
      { path: '/users', label: 'Benutzer', icon: UserCog },
      { path: '/user-activity', label: 'Aktivitaet', icon: Activity },
    ],
  },
]

function useAdminBase() {
  const { pathname } = useLocation()
  // Detect if we're under /account/admin or /admin
  return pathname.startsWith('/account/admin') ? '/account/admin' : '/admin'
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const base = useAdminBase()
  const { pathname } = useLocation()
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({})

  const toggleSection = (id: string) =>
    setCollapsed(prev => ({ ...prev, [id]: !prev[id] }))

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap',
      isActive
        ? 'bg-primary text-primary-foreground'
        : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
    )

  // Detect which section is active to auto-expand it
  const activeSection = NAV_SECTIONS.find(s =>
    s.items.some(item => {
      const fullPath = `${base}${item.path}`
      return item.end ? pathname === fullPath : pathname.startsWith(fullPath) && item.path !== ''
    }),
  )?.id ?? 'crm'

  return (
    <div className="flex min-h-[calc(100vh-8rem)]">
      {/* Sidebar Navigation */}
      <aside className="w-56 flex-shrink-0 border-r bg-muted/30 py-4 hidden md:block">
        <div className="px-4 mb-4">
          <h1 className="text-lg font-bold">Fintutto World</h1>
          <p className="text-xs text-muted-foreground">Admin Dashboard</p>
        </div>

        <nav className="space-y-1 px-2">
          {NAV_SECTIONS.map(section => {
            const isOpen = !collapsed[section.id] || activeSection === section.id
            return (
              <div key={section.id}>
                <button
                  onClick={() => toggleSection(section.id)}
                  className="flex items-center justify-between w-full px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider hover:text-foreground"
                >
                  {section.label}
                  {isOpen ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                </button>
                {isOpen && (
                  <div className="space-y-0.5 mt-0.5">
                    {section.items.map(item => (
                      <NavLink
                        key={item.path}
                        to={`${base}${item.path}`}
                        end={item.end}
                        className={linkClass}
                      >
                        <item.icon className="h-4 w-4" />
                        {item.label}
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </nav>
      </aside>

      {/* Mobile top nav */}
      <div className="md:hidden fixed top-14 left-0 right-0 z-30 bg-background border-b overflow-x-auto">
        <nav className="flex gap-1 px-3 py-2 items-center">
          {NAV_SECTIONS.flatMap(s => s.items).map(item => (
            <NavLink
              key={item.path}
              to={`${base}${item.path}`}
              end={item.end}
              className={linkClass}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-6 overflow-auto">
        {children}
      </main>
    </div>
  )
}
