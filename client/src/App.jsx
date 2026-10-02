import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { TooltipProvider } from '@/components/ui/tooltip'
import { ToastProvider } from '@/components/ui/toast'
import ErrorBoundary from '@/components/ui/ErrorBoundary'
import AuthGuard from '@/components/auth/AuthGuard'
import Sidebar from '@/components/layout/Sidebar'
import BottomNav from '@/components/layout/BottomNav'
import TopBar from '@/components/layout/TopBar'
import PageWrapper from '@/components/layout/PageWrapper'
import AICoachDrawer from '@/components/ai/AICoachDrawer'
import StickyNotesDrawer from '@/components/notes/StickyNotesDrawer'
import TopFloatingTimerCapsule from '@/components/layout/TopFloatingTimerCapsule'
import MockTimerSetupModal from '@/components/layout/MockTimerSetupModal'
import GroupStudyModal from '@/components/study/GroupStudyModal'
import GlobalInviteListener from '@/components/study/GlobalInviteListener'
import InvitesDrawer from '@/components/study/InvitesDrawer'
import Dashboard from '@/pages/Dashboard'
import Problems from '@/pages/Problems'
import Topics from '@/pages/Topics'
import Applications from '@/pages/Applications'
import AICoach from '@/pages/AICoach'
import Playground from '@/pages/Playground'
import DsaLab from '@/pages/DsaLab'
import DsaMasterclassPage from '@/pages/DsaMasterclassPage'
import Library from '@/pages/Library'
import Courses from '@/pages/Courses'
import ClassroomVault from '@/pages/ClassroomVault'
import Bookmarks from '@/pages/Bookmarks'
import Shares from '@/pages/Shares'
import Notes from '@/pages/Notes'
import Community from '@/pages/Community'
import Landing from '@/pages/Landing'
import Admin from '@/pages/Admin'
import AdminGuard from '@/components/auth/AdminGuard'
import BlockedAccountScreen from '@/components/auth/BlockedAccountScreen'
import { Loader2 } from 'lucide-react'

import { AuthProvider, useAuth } from '@/hooks/useAuth'
import { useEffect } from 'react'
import { useAppStore } from '@/store/useAppStore'

import { useStreak } from '@/hooks/useStreak'
import { useApplications } from '@/hooks/useApplications'
import { requestNotificationPermission, runNotificationScheduler } from '@/utils/notifications'

function AppContent() {
  const navigate = useNavigate()
  const { user, profile, signOut, loading: authLoading } = useAuth()
  const setOffline = useAppStore((s) => s.setOffline)
  const theme = useAppStore((s) => s.theme)
  const { streakData } = useStreak(user?.uid)
  const { applications } = useApplications(user?.uid)

  useEffect(() => {
    const saved = localStorage.getItem('placify_theme') || 'dark'
    if (saved === 'dark') {
      document.documentElement.classList.add('dark')
      document.documentElement.classList.remove('light')
    } else {
      document.documentElement.classList.add('light')
      document.documentElement.classList.remove('dark')
    }
  }, [theme])

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

  // Safely redirect to pending notebook room when authenticated (without full-page reloads)
  useEffect(() => {
    const pendingRoom = localStorage.getItem('placify_pending_notebook_room')
    if (pendingRoom && user) {
      localStorage.removeItem('placify_pending_notebook_room')
      if (!window.location.pathname.startsWith('/notes')) {
        navigate(`/notes?room=${encodeURIComponent(pendingRoom)}`, { replace: true })
      }
    }
  }, [user, navigate])

  if (authLoading) {
    return (
      <div className="min-h-screen bg-base flex items-center justify-center">
        <div className="space-y-4 w-64 text-center">
          <Loader2 className="h-8 w-8 text-accent animate-spin mx-auto" />
          <p className="text-xs text-text-muted">Loading your command center...</p>
        </div>
      </div>
    )
  }

  // Public routing for unauthenticated users (preserves query params for invite banners)
  if (!user) {
    return (
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/notes" element={<Landing />} />
        <Route path="*" element={<Landing />} />
      </Routes>
    )
  }

  // Intercept suspended accounts immediately
  if (profile?.isBlocked) {
    return (
      <BlockedAccountScreen
        user={user}
        profile={profile}
        onSignOut={signOut}
      />
    )
  }

  // Private routing for logged-in users
  return (
    <div className="min-h-screen bg-base text-text-primary print:bg-white print:text-slate-900 print:min-h-0">
      <div className="print:hidden">
        <Sidebar user={user} onSignOut={signOut} />
        <BottomNav />
        <AICoachDrawer />
        <StickyNotesDrawer />
        <MockTimerSetupModal />
        <TopFloatingTimerCapsule />
        <GroupStudyModal user={user} />
        <GlobalInviteListener />
        <InvitesDrawer />
      </div>
      <Routes>
        {/* Redirect root to dashboard when authenticated */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        
        {/* Super-Admin Command Console */}
        <Route
          path="/admin"
          element={
            <AdminGuard>
              <PageWrapper>
                <TopBar title="Admin Command Center" />
                <Admin />
              </PageWrapper>
            </AdminGuard>
          }
        />

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
          path="/dsa-lab"
          element={
            <PageWrapper>
              <TopBar title="3D DSA Lab" />
              <DsaLab />
            </PageWrapper>
          }
        />
        <Route
          path="/dsa-lab/:topicId"
          element={
            <PageWrapper>
              <TopBar title="3D DSA Lab" />
              <DsaLab />
            </PageWrapper>
          }
        />
        <Route
          path="/dsa-courses"
          element={
            <PageWrapper>
              <TopBar title="DSA 3D Masterclass Academy" />
              <DsaMasterclassPage />
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
          path="/classroom"
          element={
            <PageWrapper>
              <TopBar title="Classroom Vault" />
              <ClassroomVault />
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
        <Route
          path="/notes"
          element={
            <PageWrapper>
              <TopBar title="Notes & Collaborative Notebook" />
              <Notes />
            </PageWrapper>
          }
        />
        <Route
          path="/notebooks"
          element={
            <PageWrapper>
              <TopBar title="Notes & Collaborative Notebook" />
              <Notes />
            </PageWrapper>
          }
        />
        <Route
          path="/community"
          element={
            <PageWrapper>
              <TopBar title="Community" />
              <Community />
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
    <ErrorBoundary>
      <TooltipProvider>
        <ToastProvider>
          <BrowserRouter>
            <AuthProvider>
              <AppContent />
            </AuthProvider>
          </BrowserRouter>
        </ToastProvider>
      </TooltipProvider>
    </ErrorBoundary>
  )
}
