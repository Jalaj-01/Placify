import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { TooltipProvider } from '@/components/ui/tooltip'
import AuthGuard from '@/components/auth/AuthGuard'
import Sidebar from '@/components/layout/Sidebar'
import BottomNav from '@/components/layout/BottomNav'
import TopBar from '@/components/layout/TopBar'
import PageWrapper from '@/components/layout/PageWrapper'
import AllyCapsuleWidget from '@/components/ai/AllyCapsuleWidget'
import Dashboard from '@/pages/Dashboard'
import Problems from '@/pages/Problems'
import Topics from '@/pages/Topics'
import Applications from '@/pages/Applications'
import AICoach from '@/pages/AICoach'
import Playground from '@/pages/Playground'
import Library from '@/pages/Library'
import Courses from '@/pages/Courses'
import Bookmarks from '@/pages/Bookmarks'
import Shares from '@/pages/Shares'
import Landing from '@/pages/Landing'
import { Loader2 } from 'lucide-react'

import { useAuth } from '@/hooks/useAuth'
import { useEffect } from 'react'
import { useAppStore } from '@/store/useAppStore'

import { useStreak } from '@/hooks/useStreak'
import { useApplications } from '@/hooks/useApplications'
import { requestNotificationPermission, runNotificationScheduler } from '@/utils/notifications'

function AppContent() {
  const { user, signOut, loading: authLoading } = useAuth()
  const setOffline = useAppStore((s) => s.setOffline)
  const { streakData } = useStreak(user?.uid)
  const { applications } = useApplications(user?.uid)

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

  useEffect(() => {
    if (user) {
      requestNotificationPermission()
    }
  }, [user])

  useEffect(() => {
    if (user && streakData && applications.length > 0) {
      runNotificationScheduler(streakData, applications)
    }
  }, [user, streakData, applications])

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#060609] flex items-center justify-center">
        <div className="space-y-4 w-64 text-center">
          <Loader2 className="h-8 w-8 text-accent animate-spin mx-auto" />
          <p className="text-xs text-text-muted">Loading your command center...</p>
        </div>
      </div>
    )
  }

  // Public routing for unauthenticated users
  if (!user) {
    return (
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    )
  }

  // Private routing for logged-in users
  return (
    <div className="min-h-screen bg-base text-text-primary">
      <Sidebar user={user} onSignOut={signOut} />
      <BottomNav />
      <AllyCapsuleWidget />
      <Routes>
        {/* Redirect root to dashboard when authenticated */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        
        <Route
          path="/dashboard"
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
        <Route
          path="/playground"
          element={
            <PageWrapper>
              <TopBar title="Code Playground" />
              <Playground />
            </PageWrapper>
          }
        />
        <Route
          path="/library"
          element={
            <PageWrapper>
              <TopBar title="Resource Library" />
              <Library />
            </PageWrapper>
          }
        />
        <Route
          path="/courses"
          element={
            <PageWrapper>
              <TopBar title="Course Vault" />
              <Courses />
            </PageWrapper>
          }
        />
        <Route
          path="/bookmarks"
          element={
            <PageWrapper>
              <TopBar title="QA Bookmarks" />
              <Bookmarks />
            </PageWrapper>
          }
        />
        <Route
          path="/shares"
          element={
            <PageWrapper>
              <TopBar title="Shared Inbox" />
              <Shares />
            </PageWrapper>
          }
        />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </div>
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
