import { useState, useEffect } from 'react'
import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Code2, BookOpen, Briefcase, Sparkles, Terminal, FolderOpen, Share2, School, Shield } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/useAuth'
import { isSuperAdmin } from '@/config/adminConfig'

const allItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Home', roles: ['student', 'teacher', 'phd', 'admin'] },
  { to: '/admin', icon: Shield, label: 'Admin', roles: ['admin'] },
  { to: '/classroom', icon: School, label: 'Classroom', roles: ['student', 'admin'] },
  { to: '/problems', icon: Code2, label: 'Problems', roles: ['student', 'admin'] },
  { to: '/topics', icon: BookOpen, label: 'Topics', roles: ['student', 'admin'] },
  { to: '/applications', icon: Briefcase, label: 'Apps', roles: ['student', 'admin'] },
  { to: '/library', icon: FolderOpen, label: 'Library', roles: ['teacher', 'phd'] },
  { to: '/shares', icon: Share2, label: 'Shares', roles: ['teacher', 'phd'] },
  { to: '/ai-coach', icon: Sparkles, label: 'AI Coach', roles: ['student', 'teacher', 'phd'] },
  { to: '/playground', icon: Terminal, label: 'Code', roles: ['student', 'teacher', 'phd'] },
]

export default function BottomNav() {
  const { user, profile } = useAuth()
  const [activeRoleOverride, setActiveRoleOverride] = useState(() => localStorage.getItem('placify_active_role'))

  useEffect(() => {
    const handleStorage = () => {
      setActiveRoleOverride(localStorage.getItem('placify_active_role'))
    }
    window.addEventListener('storage', handleStorage)
    window.addEventListener('placify-role-change', handleStorage)
    return () => {
      window.removeEventListener('storage', handleStorage)
      window.removeEventListener('placify-role-change', handleStorage)
    }
  }, [])

  const cleanEmail = (user?.email || '').toLowerCase().trim()
  const isAdmin = isSuperAdmin(cleanEmail) || profile?.role === 'admin'

  let roleRaw = (profile?.role || 'student').toLowerCase()
  if (isAdmin) {
    roleRaw = (activeRoleOverride || 'admin').toLowerCase()
  }

  const isTeacher = roleRaw === 'teacher' || roleRaw === 'faculty'
  const isPhd = roleRaw === 'phd' || roleRaw === 'research'
  const isStudent = !isTeacher && !isPhd && roleRaw !== 'admin'

  const items = allItems.filter((item) => {
    if (isAdmin && item.to === '/admin') return true
    if (isAdmin) {
      if (roleRaw === 'admin') return ['/dashboard', '/admin'].includes(item.to)
      if (isTeacher && item.roles.includes('teacher')) return true
      if (isPhd && item.roles.includes('phd')) return true
      if (isStudent && item.roles.includes('student')) return true
      return false
    }
    if (isStudent && item.roles.includes('student')) return true
    if (isTeacher && item.roles.includes('teacher')) return true
    if (isPhd && item.roles.includes('phd')) return true
    return false
  })

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-border-subtle bg-surface/95 backdrop-blur-md">
      <div className="flex items-center justify-around py-2 px-1">
        {items.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/dashboard'}
            className={({ isActive }) => cn(
              'flex flex-col items-center gap-0.5 px-1 py-1 rounded-lg transition-colors flex-1 min-w-0',
              isActive ? 'text-accent-light font-bold' : 'text-text-muted'
            )}
          >
            <Icon className="h-5 w-5" />
            <span className="text-micro">{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
