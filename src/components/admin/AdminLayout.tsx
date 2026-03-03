import { NavLink } from 'react-router-dom'
import { BarChart3, Users, Kanban, MessageSquare } from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { to: '/admin', label: 'Pipeline', icon: Kanban, end: true },
  { to: '/admin/leads', label: 'Kontakte', icon: Users, end: false },
  { to: '/admin/stats', label: 'Statistik', icon: BarChart3, end: false },
  { to: '/admin/requests', label: 'Anfragen', icon: MessageSquare, end: false },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-4 py-4">
      <div className="flex items-center gap-2 px-4">
        <h1 className="text-xl font-bold">Admin CRM</h1>
      </div>

      <nav className="flex gap-1 px-4 overflow-x-auto">
        {NAV_ITEMS.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
              )
            }
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
