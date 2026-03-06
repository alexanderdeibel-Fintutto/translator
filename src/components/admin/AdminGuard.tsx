import { Navigate, useLocation } from 'react-router-dom'
import { useUser } from '@/context/UserContext'
import { Loader2 } from 'lucide-react'

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const { isLoading, isAuthenticated, isSalesAgent, user } = useUser()
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
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}
