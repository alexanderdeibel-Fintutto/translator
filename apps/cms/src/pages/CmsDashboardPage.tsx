/**
 * CmsDashboardPage — Übersicht nach Login
 *
 * Zeigt alle Institutionen die der eingeloggte Nutzer verwalten kann.
 * Super-Admin: alle Institutionen
 * City/Region-Admin: alle Institutionen in ihrer Stadt/Region
 * Institution-Admin/Redakteur: nur eigene Institution(en)
 */
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  BookOpen, Building2, MapPin, Globe, Landmark,
  ChevronRight, LogOut, Plus, Users, FileText,
  BarChart2, Settings, CheckCircle, Clock, AlertCircle
} from 'lucide-react'

interface Institution {
  id: string
  slug: string
  name: string
  type: 'museum' | 'poi' | 'city' | 'region' | 'restaurant' | 'other'
  city?: string
  contentCount: number
  pendingCount: number
  lastUpdated: string
  status: 'active' | 'pending' | 'inactive'
}

const TYPE_ICONS: Record<Institution['type'], React.ElementType> = {
  museum:     Landmark,
  poi:        MapPin,
  city:       Globe,
  region:     Globe,
  restaurant: Building2,
  other:      Building2,
}

const STATUS_COLORS: Record<Institution['status'], string> = {
  active:   'text-emerald-400',
  pending:  'text-amber-400',
  inactive: 'text-white/30',
}

const STATUS_ICONS: Record<Institution['status'], React.ElementType> = {
  active:   CheckCircle,
  pending:  Clock,
  inactive: AlertCircle,
}

export default function CmsDashboardPage() {
  const navigate = useNavigate()
  const [institutions, setInstitutions] = useState<Institution[]>([])
  const [loading, setLoading] = useState(true)
  const [userEmail, setUserEmail] = useState('')

  useEffect(() => {
    async function load() {
      try {
        const { createClient } = await import('@supabase/supabase-js')
        const supabase = createClient(
          import.meta.env.VITE_SUPABASE_URL,
          import.meta.env.VITE_SUPABASE_ANON_KEY
        )
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) { navigate('/login'); return }
        setUserEmail(user.email ?? '')

        // Institutionen laden (ag_museums Tabelle)
        const { data } = await supabase
          .from('ag_museums')
          .select('id, slug, name, type, city, status, updated_at')
          .order('name')

        if (data) {
          setInstitutions(data.map((m: Record<string, unknown>) => ({
            id: m.id as string,
            slug: m.slug as string,
            name: m.name as string,
            type: (m.type as Institution['type']) || 'museum',
            city: m.city as string | undefined,
            contentCount: 0,
            pendingCount: 0,
            lastUpdated: m.updated_at as string,
            status: (m.status as Institution['status']) || 'active',
          })))
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [navigate])

  async function handleLogout() {
    const { createClient } = await import('@supabase/supabase-js')
    const supabase = createClient(
      import.meta.env.VITE_SUPABASE_URL,
      import.meta.env.VITE_SUPABASE_ANON_KEY
    )
    await supabase.auth.signOut()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <header className="border-b border-white/10 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-emerald-500/20">
            <BookOpen className="h-5 w-5 text-emerald-400" />
          </div>
          <span className="font-semibold text-sm">Fintutto CMS</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-white/40 hidden sm:block">{userEmail}</span>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-xs text-white/50 hover:text-white/80 transition-colors"
          >
            <LogOut className="h-3.5 w-3.5" />
            Abmelden
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Titel + Neue Institution */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold">Meine Institutionen</h1>
            <p className="text-sm text-white/50 mt-0.5">Wähle eine Institution um Inhalte zu verwalten</p>
          </div>
          <button
            onClick={() => navigate('/institutions/new')}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-sm font-medium transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:block">Neue Institution</span>
          </button>
        </div>

        {/* Institutionen-Liste */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-6 w-6 border-2 border-emerald-400/30 border-t-emerald-400 rounded-full animate-spin" />
          </div>
        ) : institutions.length === 0 ? (
          <div className="text-center py-20 text-white/40">
            <BookOpen className="h-10 w-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">Noch keine Institutionen vorhanden</p>
            <button
              onClick={() => navigate('/institutions/new')}
              className="mt-4 text-emerald-400 text-sm hover:text-emerald-300 transition-colors"
            >
              Erste Institution anlegen →
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {institutions.map(inst => {
              const Icon = TYPE_ICONS[inst.type]
              const StatusIcon = STATUS_ICONS[inst.status]
              return (
                <button
                  key={inst.id}
                  onClick={() => navigate(`/${inst.slug}`)}
                  className="w-full flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-emerald-500/30 transition-all text-left group"
                >
                  <div className="p-2 rounded-lg bg-emerald-500/10 shrink-0">
                    <Icon className="h-5 w-5 text-emerald-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm truncate">{inst.name}</span>
                      <StatusIcon className={`h-3.5 w-3.5 shrink-0 ${STATUS_COLORS[inst.status]}`} />
                    </div>
                    {inst.city && (
                      <span className="text-xs text-white/40">{inst.city}</span>
                    )}
                  </div>
                  <div className="hidden sm:flex items-center gap-4 text-xs text-white/40 shrink-0">
                    <span className="flex items-center gap-1">
                      <FileText className="h-3.5 w-3.5" />
                      {inst.contentCount} Inhalte
                    </span>
                    {inst.pendingCount > 0 && (
                      <span className="flex items-center gap-1 text-amber-400">
                        <Clock className="h-3.5 w-3.5" />
                        {inst.pendingCount} ausstehend
                      </span>
                    )}
                  </div>
                  <ChevronRight className="h-4 w-4 text-white/30 group-hover:text-emerald-400 transition-colors shrink-0" />
                </button>
              )
            })}
          </div>
        )}

        {/* Schnellzugriff */}
        <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { icon: FileText,  label: 'Alle Inhalte',    path: '/institutions' },
            { icon: Users,     label: 'Team',            path: '/team' },
            { icon: BarChart2, label: 'Analytics',       path: '/analytics' },
            { icon: Settings,  label: 'Einstellungen',   path: '/settings' },
          ].map(item => (
            <button
              key={item.label}
              onClick={() => navigate(item.path)}
              className="flex flex-col items-center gap-2 p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-center"
            >
              <item.icon className="h-5 w-5 text-emerald-400" />
              <span className="text-xs text-white/60">{item.label}</span>
            </button>
          ))}
        </div>
      </main>
    </div>
  )
}
