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
import { ShieldCheck, UserCheck, RotateCcw } from 'lucide-react'

export default function Dashboard() {
  const { user, profile } = useAuth()
  const { problems, loading: loadingProbs, updateProblem } = useProblems(user?.uid)
  const { topics, loading: loadingTopics, updateTopic } = useTopics(user?.uid)
  const { applications, loading: loadingApps } = useApplications(user?.uid)
  const { streakData } = useStreak(user?.uid)

  const { toggleStickyNotes } = useAppStore()

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
      {/* Sleek Master Workspace Header Action Bar (Matching User Screenshot 1) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-3 rounded-2xl bg-surface/60 border border-white/10 backdrop-blur-xl shadow-lg text-xs">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-accent/15 text-accent font-bold border border-accent/20">
            <UserCheck className="h-4 w-4" />
            <span className="capitalize">{currentRole} Workspace</span>
          </div>
          <button
            onClick={() => setShowRoleOnboarding(true)}
            className="px-3 py-1.5 rounded-xl bg-surface hover:bg-white/10 text-text-secondary hover:text-text-primary transition-all flex items-center gap-1.5 font-semibold border border-white/10"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Switch Role</span>
          </button>
        </div>

        <div className="flex items-center gap-2.5 self-end sm:self-auto">
          {/* Quick Sticky Notes Trigger */}
          <button
            onClick={toggleStickyNotes}
            className="px-3.5 py-1.5 rounded-xl bg-yellow-500/15 text-yellow-300 hover:bg-yellow-500/25 border border-yellow-500/30 transition-all font-bold flex items-center gap-1.5 shadow-sm"
          >
            <span>📝 Sticky Notes</span>
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
