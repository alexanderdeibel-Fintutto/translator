import { Navigate } from 'react-router-dom'
import { useUser } from '@/context/UserContext'
import { Loader2 } from 'lucide-react'

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const { isLoading, isAuthenticated, isSalesAgent, user } = useUser()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth?redirect=/admin" replace />
  }

  // Allow admin, sales_agent, and session_manager roles
  const hasAccess = isSalesAgent || user?.role === 'session_manager'
  if (!hasAccess) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}
