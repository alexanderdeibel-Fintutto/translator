'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'

const navSections = [
  {
    title: 'Art Guide',
    items: [
      { icon: '📊', label: 'Dashboard', href: '/dashboard' },
      { icon: '🖼', label: 'Kunstwerke', href: '/dashboard/artworks' },
      { icon: '🗺', label: 'Fuehrungen', href: '/dashboard/tours' },
      { icon: '🏗', label: 'Standort & Raeume', href: '/dashboard/venue' },
      { icon: '🎙', label: 'Audio & Stimmen', href: '/dashboard/audio' },
    ],
  },
  {
    title: 'City & Region Guide',
    items: [
      { icon: '🏙', label: 'POIs verwalten', href: '/dashboard/pois' },
      { icon: '🗺', label: 'Stadt-Touren', href: '/dashboard/city-tours' },
      { icon: '🌄', label: 'Region', href: '/dashboard/region' },
    ],
  },
  {
    title: 'Partner & CRM',
    items: [
      { icon: '🤝', label: 'Partner', href: '/dashboard/partners' },
      { icon: '🎁', label: 'Angebote', href: '/dashboard/offers' },
      { icon: '📅', label: 'Buchungen', href: '/dashboard/bookings' },
      { icon: '📇', label: 'Partner-CRM', href: '/dashboard/partner-crm' },
      { icon: '📨', label: 'Einladungen', href: '/dashboard/invite-campaigns' },
    ],
  },
  {
    title: 'Content Pipeline',
    items: [
      { icon: '🧠', label: 'Content Hub', href: '/dashboard/content-hub' },
      { icon: '📥', label: 'Import-Zentrale', href: '/dashboard/import' },
      { icon: '🏛', label: 'Museum Import', href: '/dashboard/import/museum' },
      { icon: '🏙', label: 'Stadt Import', href: '/dashboard/import/city' },
      { icon: '🎤', label: 'Kongress Import', href: '/dashboard/import/conference' },
      { icon: '🎪', label: 'Messe Import', href: '/dashboard/import/fair' },
    ],
  },
  {
    title: 'System',
    items: [
      { icon: '👥', label: 'Team', href: '/dashboard/team' },
      { icon: '📈', label: 'Analytics', href: '/dashboard/analytics' },
      { icon: '📋', label: 'Workflow', href: '/dashboard/workflow' },
      { icon: '💳', label: 'Abrechnung', href: '/dashboard/billing' },
      { icon: '⚙', label: 'Einstellungen', href: '/dashboard/settings' },
    ],
  },
]

export default function DashboardSidebar() {
  const pathname = usePathname()

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-64 bg-indigo-950 text-white p-6 flex flex-col overflow-y-auto z-50">
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl">🏛</span>
        <div>
          <div className="font-bold text-sm">Fintutto Guide</div>
          <div className="text-xs text-white/50">CMS Portal</div>
        </div>
      </div>

      <nav className="flex-1 space-y-5">
        {navSections.map((section) => (
          <div key={section.title}>
            <div className="text-xs font-semibold text-white/30 uppercase tracking-wider mb-2 px-3">
              {section.title}
            </div>
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition ${
                      isActive
                        ? 'bg-white/15 text-white font-medium'
                        : 'text-white/60 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <span>{item.icon}</span>
                    {item.label}
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="text-xs text-white/30 mt-4">
        powered by Fintutto
      </div>
    </aside>
  )
}
