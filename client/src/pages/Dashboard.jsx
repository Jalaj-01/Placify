import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useProblems } from '@/hooks/useProblems'
import { useTopics } from '@/hooks/useTopics'
import { useApplications } from '@/hooks/useApplications'
import { useStreak } from '@/hooks/useStreak'
import { useAppStore } from '@/store/useAppStore'
import { Skeleton } from '@/components/ui/skeleton'
import RoleOnboardingModal from '@/components/auth/RoleOnboardingModal'
import StudentDashboard from '@/components/dashboard/StudentDashboard'
import TeacherDashboard from '@/components/dashboard/TeacherDashboard'
import PhdDashboard from '@/components/dashboard/PhdDashboard'
import { ShieldCheck, UserCheck, Sun, Moon, RotateCcw } from 'lucide-react'

export default function Dashboard() {
  const { user, profile } = useAuth()
  const { problems, loading: loadingProbs, updateProblem } = useProblems(user?.uid)
  const { topics, loading: loadingTopics, updateTopic } = useTopics(user?.uid)
  const { applications, loading: loadingApps } = useApplications(user?.uid)
  const { streakData } = useStreak(user?.uid)

  const { theme, toggleTheme } = useAppStore()

  const [activeRole, setActiveRole] = useState(null)
  const [showRoleOnboarding, setShowRoleOnboarding] = useState(false)

  const loading = loadingProbs || loadingTopics || loadingApps

  // Effective role priority: activeRole state -> profile.role -> null
  const currentRole = activeRole || profile?.role || null

  const handleRoleSaved = (newRole) => {
    setActiveRole(newRole)
    setShowRoleOnboarding(false)
  }

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse p-2">
        <div className="flex gap-4">
          <Skeleton className="h-12 w-64 bg-surface/60 rounded-xl" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-28 w-full rounded-2xl bg-surface/60" />
          ))}
        </div>
        <Skeleton className="h-40 w-full rounded-2xl bg-surface/60" />
      </div>
    )
  }

  // Show onboarding modal if user has not set a role yet or clicked to re-select
  if (!currentRole || showRoleOnboarding) {
    return (
      <RoleOnboardingModal
        user={user}
        onRoleSaved={handleRoleSaved}
      />
    )
  }

  return (
    <div className="space-y-5 w-full max-w-full">
      {/* Sleek Master Header Action Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 rounded-2xl bg-surface/40 border border-white/10 backdrop-blur-md shadow-sm text-xs text-text-muted">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-accent/15 text-accent font-semibold">
            <UserCheck className="h-3.5 w-3.5" />
            <span className="capitalize">{currentRole} Workspace</span>
          </div>
          <button
            onClick={() => setShowRoleOnboarding(true)}
            className="text-[11px] text-text-secondary hover:text-accent hover:underline transition-colors flex items-center gap-1 font-medium"
          >
            <RotateCcw className="h-3 w-3" /> Switch Role
          </button>
        </div>
      </div>

      {/* Render Specific Role Dashboard */}
      {currentRole === 'teacher' && (
        <TeacherDashboard user={user} profile={profile} />
      )}

      {currentRole === 'phd' && (
        <PhdDashboard user={user} profile={profile} />
      )}

      {currentRole === 'student' && (
        <StudentDashboard
          user={user}
          profile={profile}
          problems={problems || []}
          topics={topics || []}
          applications={applications || []}
          streakData={streakData || {}}
          updateProblem={updateProblem}
          updateTopic={updateTopic}
        />
      )}
    </div>
  )
}
