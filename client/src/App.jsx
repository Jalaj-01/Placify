import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom'
import { TooltipProvider } from '@/components/ui/tooltip'
import { ToastProvider } from '@/components/ui/toast'
import ErrorBoundary from '@/components/ui/ErrorBoundary'
import AuthGuard from '@/components/auth/AuthGuard'
import AICoachDrawer from '@/components/ai/AICoachDrawer'
import StickyNotesDrawer from '@/components/notes/StickyNotesDrawer'
import TopFloatingTimerCapsule from '@/components/layout/TopFloatingTimerCapsule'
import MockTimerSetupModal from '@/components/layout/MockTimerSetupModal'
import GroupStudyModal from '@/components/study/GroupStudyModal'
import GlobalInviteListener from '@/components/study/GlobalInviteListener'
import InvitesDrawer from '@/components/study/InvitesDrawer'
import Dashboard from '@/pages/Dashboard'
import DashboardShell from '@/components/dashboard/DashboardShell'
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
import { isSuperAdmin } from '@/config/adminConfig'

import { useStreak } from '@/hooks/useStreak'
import { useApplications } from '@/hooks/useApplications'
import { requestNotificationPermission, runNotificationScheduler } from '@/utils/notifications'

function AppContent() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, profile, signOut, loading: authLoading } = useAuth()
  const setOffline = useAppStore((s) => s.setOffline)
  const theme = useAppStore((s) => s.theme)
  const { streakData } = useStreak(user?.uid)
  const { applications } = useApplications(user?.uid)
  const isAdminUser = isSuperAdmin((user?.email || '').toLowerCase().trim()) || profile?.role === 'admin'
  const activeDashboardRole = (isAdminUser ? localStorage.getItem('placify_active_role') || 'admin' : profile?.role || 'student').toLowerCase().trim()
  const isStudentDashboard = location.pathname === '/dashboard' && (activeDashboardRole === 'student' || activeDashboardRole === 'learner')

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
    const searchParams = new URLSearchParams(window.location.search)
    const urlRoom = searchParams.get('room') || searchParams.get('join')
    if (urlRoom) {
      localStorage.setItem('placify_pending_notebook_room', urlRoom)
    }

    const pendingRoom = localStorage.getItem('placify_pending_notebook_room')
    if (pendingRoom && user) {
      const currentRoom = searchParams.get('room') || searchParams.get('join')
      if (currentRoom !== pendingRoom) {
        localStorage.removeItem('placify_pending_notebook_room')
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

  // Private routing for logged-in users: Universal DashboardShell across all routes
  return (
    <DashboardShell user={user} profile={profile} onSignOut={signOut}>
      <div className="print:hidden">
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
              <Admin />
            </AdminGuard>
          }
        />

        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/problems" element={<Problems />} />
        <Route path="/topics" element={<Topics />} />
        <Route path="/applications" element={<Applications />} />
        <Route path="/ai-coach" element={<AICoach />} />
        <Route path="/dsa-lab" element={<DsaLab />} />
        <Route path="/dsa-lab/:topicId" element={<DsaLab />} />
        <Route path="/dsa-courses" element={<DsaMasterclassPage />} />
        <Route path="/playground" element={<Playground />} />
        <Route path="/library" element={<Library />} />
        <Route path="/classroom" element={<ClassroomVault />} />
        <Route path="/courses" element={<Courses />} />
        <Route path="/bookmarks" element={<Bookmarks />} />
        <Route path="/shares" element={<Shares />} />
        <Route path="/invites" element={<Navigate to="/shares?tab=invites" replace />} />
        <Route path="/notes" element={<Notes />} />
        <Route path="/notebooks" element={<Notes />} />
        <Route path="/community" element={<Community />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </DashboardShell>
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
