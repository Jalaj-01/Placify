import { Navigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { isSuperAdmin } from '@/config/adminConfig'
import { Loader2 } from 'lucide-react'

export default function AdminGuard({ children }) {
  const { user, profile, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-base flex items-center justify-center">
        <div className="space-y-4 text-center">
          <Loader2 className="h-8 w-8 text-accent animate-spin mx-auto" />
          <p className="text-xs text-text-muted">Verifying administrator privileges...</p>
        </div>
      </div>
    )
  }

  const isAdmin = isSuperAdmin(user?.email) || profile?.role === 'admin'

  if (!user || !isAdmin) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}
