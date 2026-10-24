import { useEffect, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { Code2, School, Timer, Youtube } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAppStore } from '@/store/useAppStore'
import { useAuth } from '@/hooks/useAuth'
import { isSuperAdmin } from '@/config/adminConfig'

const studentTopItems = [
  { to: '/classroom', label: 'Classroom Vault', icon: School },
  { to: '/timer', label: 'Mock Timer', icon: Timer, isTimer: true },
  { to: '/courses', label: 'Course Vault', icon: Youtube },
  { to: '/problems', label: 'Problem Log', icon: Code2 },
]

export default function TopNav({ user }) {
  const location = useLocation()
  const { profile } = useAuth()
  const { openTimerSetup, assessmentTimerOpen } = useAppStore()
  const [activeRoleOverride, setActiveRoleOverride] = useState(() => localStorage.getItem('placify_active_role'))
  useEffect(() => {
    const syncRole = () => setActiveRoleOverride(localStorage.getItem('placify_active_role'))
    window.addEventListener('storage', syncRole)
    window.addEventListener('placify-role-change', syncRole)
    return () => {
      window.removeEventListener('storage', syncRole)
      window.removeEventListener('placify-role-change', syncRole)
    }
  }, [])
  const isAdmin = isSuperAdmin((user?.email || '').toLowerCase().trim()) || profile?.role === 'admin'
  const role = isAdmin
    ? (activeRoleOverride || 'admin').toLowerCase()
    : (profile?.role || 'student').toLowerCase()
  const isStudent = role === 'student' || (role !== 'teacher' && role !== 'faculty' && role !== 'phd' && role !== 'research' && role !== 'admin')

  if (!isStudent) return null

  return (
    <header className="fixed left-16 right-0 top-0 z-30 hidden h-[68px] items-center justify-center border-b border-slate-200/70 bg-gradient-to-r from-rose-50/90 via-white/95 to-sky-50/90 px-5 backdrop-blur-xl lg:flex dark:border-white/10 dark:bg-gradient-to-r dark:from-slate-950/95 dark:via-slate-900/95 dark:to-slate-950/95 print:hidden">
      <nav aria-label="Primary navigation" className="flex items-center gap-1 rounded-2xl border border-white/80 bg-white/65 p-1.5 shadow-[0_8px_24px_rgba(31,41,55,0.07)] dark:border-white/10 dark:bg-slate-800/70 dark:shadow-black/20">
        {studentTopItems.map(({ to, label, icon: Icon, isTimer }) => {
          const active = isTimer ? assessmentTimerOpen : location.pathname === to
          return (
            <NavLink
              key={to}
              to={to}
              onClick={(event) => {
                if (isTimer) {
                  event.preventDefault()
                  openTimerSetup()
                }
              }}
              className={cn(
                'inline-flex items-center gap-2 whitespace-nowrap rounded-xl px-4 py-2.5 text-[13px] font-semibold transition-all',
                active
                  ? 'bg-[#252525] text-white shadow-[0_4px_10px_rgba(0,0,0,0.18)]'
                  : 'border border-slate-200/80 bg-white text-slate-600 hover:border-slate-300 hover:bg-white hover:text-slate-950'
              )}
              aria-label={label}
            >
              <Icon className="h-4 w-4" />
              <span>{label}</span>
            </NavLink>
          )
        })}
      </nav>
    </header>
  )
}
