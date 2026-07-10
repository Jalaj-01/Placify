import { Navigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import LoginPage from './LoginPage'
import { Skeleton } from '@/components/ui/skeleton'

export default function AuthGuard({ children }) {
  const { user, loading, signInWithGoogle } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-base flex items-center justify-center">
        <div className="space-y-4 w-64">
          <Skeleton className="h-12 w-12 rounded-xl mx-auto" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
    )
  }

  if (!user) {
    return <LoginPage onSignIn={signInWithGoogle} loading={loading} />
  }

  return children
}
