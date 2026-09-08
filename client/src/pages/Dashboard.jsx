import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { useProblems } from '@/hooks/useProblems'
import { useTopics } from '@/hooks/useTopics'
import { useApplications } from '@/hooks/useApplications'
import { useStreak } from '@/hooks/useStreak'
import { useAppStore } from '@/store/useAppStore'
import { Skeleton } from '@/components/ui/skeleton'
import StudentDashboard from '@/components/dashboard/StudentDashboard'
import TeacherDashboard from '@/components/dashboard/TeacherDashboard'
import PhdDashboard from '@/components/dashboard/PhdDashboard'
import { isSuperAdmin } from '@/config/adminConfig'
import { subscribeAnnouncements } from '@/services/adminService'
import { Shield, UserCheck, Bell, AlertTriangle, AlertCircle, Info, Flame, Clock, ArrowUpRight } from 'lucide-react'

export default function Dashboard() {
  const navigate = useNavigate()
  const { user, profile } = useAuth()
  const { problems, loading: loadingProbs, updateProblem } = useProblems(user?.uid)
  const { topics, loading: loadingTopics, updateTopic } = useTopics(user?.uid)
  const { applications, loading: loadingApps } = useApplications(user?.uid)
  const { streakData } = useStreak(user?.uid)

  const { toggleStickyNotes } = useAppStore()

  const cleanEmail = (user?.email || '').toLowerCase().trim()
  const isAdmin = isSuperAdmin(cleanEmail) || profile?.role === 'admin'

  const [activeRole, setActiveRole] = useState(() => {
    if (isAdmin) {
      return localStorage.getItem('placify_active_role') || 'admin'
    }
    return (profile?.role || 'student').toLowerCase().trim()
  })

  const [announcements, setAnnouncements] = useState([])

  useEffect(() => {
    const handleStorage = () => {
      if (isAdmin) {
        setActiveRole(localStorage.getItem('placify_active_role') || 'admin')
      } else {
        setActiveRole((profile?.role || 'student').toLowerCase().trim())
      }
    }
    window.addEventListener('storage', handleStorage)
    window.addEventListener('placify-role-change', handleStorage)
    return () => {
      window.removeEventListener('storage', handleStorage)
      window.removeEventListener('placify-role-change', handleStorage)
    }
  }, [isAdmin, profile?.role])

  // Subscribe to active announcements
  useEffect(() => {
    const unsub = subscribeAnnouncements((list) => {
      setAnnouncements(list.filter((a) => a.active !== false))
    })
    return () => {
      if (typeof unsub === 'function') unsub()
    }
  }, [])

  // Calculate effective role
  let rawRole = (profile?.role || 'student').toLowerCase().trim()
  if (isAdmin) {
    rawRole = (activeRole || 'admin').toLowerCase().trim()
  }
  const effectiveRole = rawRole === 'faculty' ? 'teacher' : (rawRole === 'research' ? 'phd' : rawRole)

  // If effective role is admin, redirect to /admin (Admin Command is the single console)
  useEffect(() => {
    if (effectiveRole === 'admin') {
      navigate('/admin', { replace: true })
    }
  }, [effectiveRole, navigate])

  const loading = effectiveRole !== 'admin' && (loadingProbs || loadingTopics || loadingApps)

  // Filter announcements for current audience & verify not expired
  const visibleAnnouncements = announcements.filter((a) => {
    if (a.active === false) return false

    // Auto-filter expired announcements
    if (a.expiresAt) {
      const expTime = a.expiresAt.toDate ? a.expiresAt.toDate().getTime() : new Date(a.expiresAt).getTime()
      if (!isNaN(expTime) && expTime < Date.now()) return false
    }

    const aud = (a.audience || 'all').toLowerCase()
    if (aud === 'all') return true
    if (effectiveRole === 'student' && aud === 'student') return true
    if (effectiveRole === 'teacher' && aud === 'teacher') return true
    return false
  })

  if (loading || effectiveRole === 'admin') {
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

  return (
    <div className="space-y-5 w-full max-w-full">
      {/* 1. Platform Announcements Banner (Broadcasted from Admin Panel) */}
      {visibleAnnouncements.length > 0 && (
        <div className="space-y-2">
          {visibleAnnouncements.slice(0, 2).map((item) => {
            const isUrgent = item.priority === 'urgent'
            const isWarning = item.priority === 'warning'
            const isNotice = item.priority === 'notice'

            let timeLeftLabel = null
            if (item.expiresAt) {
              const expTime = item.expiresAt.toDate ? item.expiresAt.toDate().getTime() : new Date(item.expiresAt).getTime()
              const diffHours = Math.floor((expTime - Date.now()) / (1000 * 60 * 60))
              if (diffHours >= 0 && diffHours < 24) {
                timeLeftLabel = diffHours === 0 ? 'Ends soon' : `Ends in ${diffHours}h`
              }
            }

            return (
              <div
                key={item.id}
                className={`px-4 py-3 rounded-2xl border backdrop-blur-xl flex items-start justify-between gap-3 text-xs shadow-md ${
                  isUrgent
                    ? 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                    : isWarning
                    ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                    : isNotice
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                    : 'bg-cyan-500/10 border-cyan-500/30 text-cyan-300'
                }`}
              >
                <div className="flex items-start gap-2.5 min-w-0">
                  {isUrgent ? (
                    <Flame className="h-4 w-4 shrink-0 mt-0.5 text-rose-400 animate-pulse" />
                  ) : isWarning ? (
                    <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-amber-400" />
                  ) : isNotice ? (
                    <Bell className="h-4 w-4 shrink-0 mt-0.5 text-emerald-400" />
                  ) : (
                    <Info className="h-4 w-4 shrink-0 mt-0.5 text-cyan-400" />
                  )}
                  <div className="space-y-0.5 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-text-primary">{item.title}</span>
                      {timeLeftLabel && (
                        <span className="px-1.5 py-0.2 rounded-full bg-white/10 text-[10px] font-mono flex items-center gap-1">
                          <Clock className="h-2.5 w-2.5" />
                          <span>{timeLeftLabel}</span>
                        </span>
                      )}
                    </div>
                    <p className="text-text-secondary text-[11px] leading-relaxed">{item.message}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* 3. Workspace Header Action Bar for non-admin roles */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-3 rounded-2xl bg-surface/60 border border-white/10 backdrop-blur-xl shadow-lg text-xs">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-accent/15 text-accent font-bold border border-accent/20">
            <UserCheck className="h-4 w-4" />
            <span className="capitalize">{effectiveRole} Workspace</span>
          </div>
          {!isAdmin && (
            <span className="text-[11px] text-text-muted font-mono hidden sm:inline">
              Role: <strong className="text-text-secondary capitalize">{effectiveRole}</strong> (Fixed Access)
            </span>
          )}
        </div>

        <div className="flex items-center gap-2.5 self-end sm:self-auto">
          {/* Quick Sticky Notes Trigger */}
          <button
            onClick={toggleStickyNotes}
            className="px-3.5 py-1.5 rounded-xl bg-yellow-500/15 text-yellow-600 dark:text-yellow-300 hover:bg-yellow-500/25 border border-yellow-500/30 transition-all font-bold flex items-center gap-1.5 shadow-sm"
          >
            <span>📝 Sticky Notes</span>
          </button>
        </div>
      </div>

      {/* Render Specific Role Dashboard */}
      {effectiveRole === 'teacher' && (
        <TeacherDashboard user={user} profile={profile} />
      )}

      {effectiveRole === 'phd' && (
        <PhdDashboard user={user} profile={profile} />
      )}

      {effectiveRole === 'student' && (
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

