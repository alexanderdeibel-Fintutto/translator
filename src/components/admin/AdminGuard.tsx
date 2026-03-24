import { Navigate, useLocation } from 'react-router-dom'
import { useUser } from '@/context/UserContext'
import { Loader2, ShieldAlert } from 'lucide-react'

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const { isLoading, isAuthenticated, isSalesAgent, user, tierId } = useUser()
  const { pathname } = useLocation()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to={`/auth?redirect=${encodeURIComponent(pathname)}`} replace />
  }

  // Allow admin, sales_agent, session_manager, and tester roles
  const hasAccess =
    user?.role === 'admin' ||
    isSalesAgent ||
    user?.role === 'session_manager' ||
    user?.role === 'tester'

  if (!hasAccess) {
    // Show debug info instead of silently redirecting
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <ShieldAlert className="h-12 w-12 text-destructive mx-auto" />
        <h2 className="text-lg font-semibold">Kein Admin-Zugang</h2>
        <div className="text-sm text-muted-foreground space-y-1">
          <p>Deine aktuelle Rolle hat keinen Zugriff auf diese Seite.</p>
          <div className="mt-4 p-3 rounded-lg bg-muted text-left font-mono text-xs space-y-1">
            <div>E-Mail: {user?.email ?? 'null'}</div>
            <div>Rolle: {user?.role ?? 'null'}</div>
            <div>Tier: {tierId}</div>
            <div>isSalesAgent: {String(isSalesAgent)}</div>
            <div>User-ID: {user?.id ?? 'null'}</div>
          </div>
          <p className="mt-3 text-xs">
            Falls du Admin sein solltest, pruefe ob deine Rolle in der Datenbank korrekt auf &quot;admin&quot; gesetzt ist
            und lade die Seite neu (abmelden und wieder anmelden).
          </p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
