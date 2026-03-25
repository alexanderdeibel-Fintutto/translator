'use client'

import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase-client'

const navSections = [
  {
    title: 'Konferenz-Management',
    items: [
      { icon: '📊', label: 'Dashboard', href: '/dashboard' },
      { icon: '🎤', label: 'Sessions & Programm', href: '/dashboard/sessions' },
      { icon: '🎙', label: 'Speaker', href: '/dashboard/speakers' },
      { icon: '🏛', label: 'Säle & Räume', href: '/dashboard/venue' },
      { icon: '🔊', label: 'Live-Übersetzung', href: '/dashboard/live-translation' },
    ],
  },
  {
    title: 'Teilnehmer & CRM',
    items: [
      { icon: '👥', label: 'Teilnehmer', href: '/dashboard/attendees' },
      { icon: '📅', label: 'Anmeldungen', href: '/dashboard/bookings' },
      { icon: '📇', label: 'Aussteller-CRM', href: '/dashboard/partner-crm' },
      { icon: '📨', label: 'Einladungen', href: '/dashboard/invite-campaigns' },
    ],
  },
  {
    title: 'Content & Import',
    items: [
      { icon: '🧠', label: 'Content Hub', href: '/dashboard/content-hub' },
      { icon: '📥', label: 'Import-Zentrale', href: '/dashboard/import' },
      { icon: '🎤', label: 'Programm importieren', href: '/dashboard/import/conference' },
      { icon: '🎪', label: 'Aussteller importieren', href: '/dashboard/import/fair' },
    ],
  },
  {
    title: 'Analytics & Berichte',
    items: [
      { icon: '📈', label: 'Analytics', href: '/dashboard/analytics' },
      { icon: '📋', label: 'Workflow', href: '/dashboard/workflow' },
    ],
  },
  {
    title: 'System',
    items: [
      { icon: '👥', label: 'Team', href: '/dashboard/team' },
      { icon: '💳', label: 'Abrechnung', href: '/dashboard/billing' },
      { icon: '⚙', label: 'Einstellungen', href: '/dashboard/settings' },
    ],
  },
]

export default function DashboardSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [loggingOut, setLoggingOut] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      setUserEmail(data.user?.email ?? null)
    })
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserEmail(session?.user?.email ?? null)
      if (!session) {
        router.push('/login')
      }
    })
    return () => subscription.unsubscribe()
  }, [router])

  async function handleLogout() {
    setLoggingOut(true)
    try {
      const supabase = createClient()
      await supabase.auth.signOut()
      router.push('/login')
      router.refresh()
    } catch {
      setLoggingOut(false)
    }
  }

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-64 bg-slate-900 text-white p-6 flex flex-col overflow-y-auto z-50">
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl">🎤</span>
        <div>
          <div className="font-bold text-sm">Fintutto Conference</div>
          <div className="text-xs text-white/50">Congress Portal</div>
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

      {/* User info + Logout */}
      <div className="mt-4 pt-4 border-t border-white/10">
        {userEmail ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2 px-3">
              <div className="w-7 h-7 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold flex-shrink-0">
                {userEmail[0].toUpperCase()}
              </div>
              <div className="min-w-0">
                <div className="text-xs text-white/70 truncate">{userEmail}</div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-white/50 hover:bg-white/10 hover:text-white transition disabled:opacity-50"
            >
              <span>🚪</span>
              {loggingOut ? 'Wird ausgeloggt...' : 'Ausloggen'}
            </button>
          </div>
        ) : (
          <Link
            href="/login"
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-white/50 hover:bg-white/10 hover:text-white transition"
          >
            <span>🔑</span>
            Einloggen
          </Link>
        )}
        <div className="text-xs text-white/20 mt-3 px-3">
          powered by Fintutto
        </div>
      </div>
    </aside>
  )
}
