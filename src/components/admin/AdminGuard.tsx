import { Navigate } from 'react-router-dom'
import { useUser } from '@/context/UserContext'
import { Loader2 } from 'lucide-react'

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const { isLoading, isSalesAgent } = useUser()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!isSalesAgent) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}
