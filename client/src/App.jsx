import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { TooltipProvider } from '@/components/ui/tooltip'
import AuthGuard from '@/components/auth/AuthGuard'
import Sidebar from '@/components/layout/Sidebar'
import BottomNav from '@/components/layout/BottomNav'
import TopBar from '@/components/layout/TopBar'
import PageWrapper from '@/components/layout/PageWrapper'
import Dashboard from '@/pages/Dashboard'
import Problems from '@/pages/Problems'
import Topics from '@/pages/Topics'
import Applications from '@/pages/Applications'
import AICoach from '@/pages/AICoach'
import { useAuth } from '@/hooks/useAuth'
import { useEffect } from 'react'
import { useAppStore } from '@/store/useAppStore'

function AppContent() {
  const { user, signOut } = useAuth()
  const setOffline = useAppStore((s) => s.setOffline)

  useEffect(() => {
    const handleOnline = () => setOffline(false)
    const handleOffline = () => setOffline(true)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [setOffline])

  return (
    <AuthGuard>
      <div className="min-h-screen bg-base text-text-primary">
        <Sidebar user={user} onSignOut={signOut} />
        <BottomNav />
        <Routes>
          <Route
            path="/"
            element={
              <PageWrapper>
                <TopBar title="Dashboard" />
                <Dashboard />
              </PageWrapper>
            }
          />
          <Route
            path="/problems"
            element={
              <PageWrapper>
                <TopBar title="Problem Log" />
                <Problems />
              </PageWrapper>
            }
          />
          <Route
            path="/topics"
            element={
              <PageWrapper>
                <TopBar title="Topics" />
                <Topics />
              </PageWrapper>
            }
          />
          <Route
            path="/applications"
            element={
              <PageWrapper>
                <TopBar title="Applications" />
                <Applications />
              </PageWrapper>
            }
          />
          <Route
            path="/ai-coach"
            element={
              <PageWrapper>
                <TopBar title="AI Coach" />
                <AICoach />
              </PageWrapper>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </AuthGuard>
  )
}

export default function App() {
  return (
    <TooltipProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </TooltipProvider>
  )
}
