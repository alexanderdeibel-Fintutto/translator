import { NavLink, useLocation } from 'react-router-dom'
import { BarChart3, Users, Kanban, MessageSquare, Calendar, UserCog, Activity } from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV_ITEMS = {
  crm: [
    { path: '', label: 'Pipeline', icon: Kanban, end: true },
    { path: '/leads', label: 'Kontakte', icon: Users, end: false },
    { path: '/stats', label: 'CRM Stats', icon: BarChart3, end: false },
    { path: '/requests', label: 'Anfragen', icon: MessageSquare, end: false },
  ],
  sessions: [
    { path: '/sessions', label: 'Sessions', icon: Calendar, end: false },
    { path: '/session-stats', label: 'Session Stats', icon: BarChart3, end: false },
    { path: '/users', label: 'Benutzer', icon: UserCog, end: false },
    { path: '/user-activity', label: 'Aktivitaet', icon: Activity, end: false },
  ],
}

function useAdminBase() {
  const { pathname } = useLocation()
  // Detect if we're under /account/admin or /admin
  return pathname.startsWith('/account/admin') ? '/account/admin' : '/admin'
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const base = useAdminBase()

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap',
      isActive
        ? 'bg-primary text-primary-foreground'
        : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
    )

  return (
    <div className="flex flex-col gap-4 py-4">
      <div className="flex items-center gap-2 px-4">
        <h1 className="text-xl font-bold">Admin Dashboard</h1>
      </div>

      <nav className="flex gap-1 px-4 overflow-x-auto items-center">
        {NAV_ITEMS.crm.map(item => (
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

        <div className="w-px h-6 bg-border mx-1 flex-shrink-0" />

        {NAV_ITEMS.sessions.map(item => (
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

      <div className="px-4">{children}</div>
    </div>
  )
}
