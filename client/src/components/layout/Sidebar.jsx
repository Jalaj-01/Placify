import { useState, useEffect } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, Code2, BookOpen, Briefcase, Sparkles,
  ChevronLeft, ChevronRight, LogOut, Terminal, FolderOpen, Youtube,
  Bookmark, Share2, Sun, Moon, Timer, StickyNote, MailOpen, School,
  Shield, Users, Bell, FileText, GraduationCap, BookOpenCheck, Eye, Boxes, Film
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAppStore } from '@/store/useAppStore'
import { useAuth } from '@/hooks/useAuth'
import { isSuperAdmin } from '@/config/adminConfig'
import { subscribeInvites } from '@/services/firestoreService'

const SIMULATION_ROLES = [
  { id: 'admin', label: 'Admin', icon: Shield },
  { id: 'teacher', label: 'Faculty', icon: School },
  { id: 'student', label: 'Student', icon: GraduationCap },
  { id: 'phd', label: 'PhD Scholar', icon: BookOpenCheck },
]

const allNavItems = [
  // Dashboard (Student, Teacher, PhD only - Admin uses Admin Command)
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', roles: ['student', 'teacher', 'phd'] },

  // Dedicated Admin-Only Controls (Visible ONLY in Admin role)
  { to: '/admin', icon: Shield, label: 'Admin Command', roles: ['admin'] },
  { to: '/admin?tab=users', icon: Users, label: 'User Directory', roles: ['admin'] },
  { to: '/admin?tab=teachers', icon: School, label: 'Teacher Whitelist', roles: ['admin'] },
  { to: '/admin?tab=announcements', icon: Bell, label: 'Broadcasts', roles: ['admin'] },
  { to: '/admin?tab=audit', icon: FileText, label: 'Audit Trail', roles: ['admin'] },
  { to: '/notes', icon: BookOpen, label: 'Notes & Notebook', roles: ['admin'] },

  // Student-Only Tools
  { to: '/classroom', icon: School, label: 'Classroom Vault', roles: ['student'] },
  { to: '/problems', icon: Code2, label: 'Problem Log', roles: ['student'] },
  { to: '/topics', icon: BookOpen, label: 'Topic Mastery', roles: ['student'] },
  { to: '/applications', icon: Briefcase, label: 'Applications', roles: ['student'] },
  { to: '/timer', icon: Timer, label: 'Mock Timer', isTimer: true, roles: ['student'] },
  { to: '/courses', icon: Youtube, label: 'Course Vault', roles: ['student'] },
  { to: '/invites', icon: MailOpen, label: 'Invites', isInvites: true, roles: ['student', 'teacher', 'phd'] },
  { to: '/community', icon: Users, label: 'Community', roles: ['student', 'teacher', 'phd'] },
  { to: '/bookmarks', icon: Bookmark, label: 'Bookmarks', roles: ['student'] },
  { to: '/notes', icon: BookOpen, label: 'Notes & Notebook', roles: ['student'] },

  // Academic & Coding Tools (Student, Teacher, PhD)
  { to: '/dsa-lab', icon: Boxes, label: '3D DSA Lab', roles: ['student', 'teacher', 'phd'] },
  { to: '/dsa-courses', icon: Film, label: '3D Video Masterclass', roles: ['student', 'teacher', 'phd'] },
  { to: '/library', icon: FolderOpen, label: 'Resource Library', roles: ['student', 'teacher', 'phd'] },
  { to: '/playground', icon: Terminal, label: 'Code Playground', roles: ['student', 'teacher', 'phd'] },
  { to: '/ai-coach', icon: Sparkles, label: 'AI Placement Coach', isAICoach: true, roles: ['student'] },
  { to: '/shares', icon: Share2, label: 'Shared Inbox', roles: ['student', 'teacher', 'phd'] },

  // Teacher-Only Tools
  { to: '/bookmarks', icon: Bookmark, label: 'Faculty Bookmarks', roles: ['teacher'] },
  { to: '/ai-coach', icon: Sparkles, label: 'AI Teaching Coach', isAICoach: true, roles: ['teacher'] },
  { to: '/notes', icon: BookOpen, label: 'Faculty Notes & Notebook', roles: ['teacher'] },

  // PhD Scholar-Only Tools
  { to: '/bookmarks', icon: Bookmark, label: 'Research Bookmarks', roles: ['phd'] },
  { to: '/ai-coach', icon: Sparkles, label: 'AI Research Coach', isAICoach: true, roles: ['phd'] },
  { to: '/notes', icon: BookOpen, label: 'Research Notes & Notebook', roles: ['phd'] },
]

export default function Sidebar({ user, onSignOut }) {
  const { profile } = useAuth()
  const location = useLocation()
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

  const handleRoleSelect = (roleId) => {
    localStorage.setItem('placify_active_role', roleId)
    setActiveRoleOverride(roleId)
    window.dispatchEvent(new Event('placify-role-change'))
  }

  const handleCycleRole = () => {
    const current = (activeRoleOverride || 'admin').toLowerCase()
    const ids = ['admin', 'teacher', 'student', 'phd']
    const nextIdx = (ids.indexOf(current) + 1) % ids.length
    handleRoleSelect(ids[nextIdx])
  }

  let roleRaw = (profile?.role || 'student').toLowerCase()
  if (isAdmin) {
    roleRaw = (activeRoleOverride || 'admin').toLowerCase()
  }

  const isTeacher = roleRaw === 'teacher' || roleRaw === 'faculty'
  const isPhd = roleRaw === 'phd' || roleRaw === 'research'
  const isStudent = !isTeacher && !isPhd && roleRaw !== 'admin'

  const navItems = allNavItems.filter((item) => {
    // When in Admin mode, show ONLY admin items and sticky notes
    if (roleRaw === 'admin') {
      return item.roles.includes('admin')
    }

    if (isTeacher) {
      return item.roles.includes('teacher')
    }
    if (isPhd) {
      return item.roles.includes('phd')
    }
    if (isStudent) {
      return item.roles.includes('student')
    }
    return false
  })
  const {
    sidebarCollapsed, toggleSidebar, setSidebarCollapsed,
    openAICoach, aiCoachOpen, openTimerSetup, assessmentTimerOpen,
    toggleStickyNotes, stickyNotesOpen, openNotebooks, openStickyNotes,
    notesDrawerTab,
    theme, toggleTheme,
    invitesDrawerOpen, toggleInvitesDrawer, pendingInvites
  } = useAppStore()
  const [isHovered, setIsHovered] = useState(false)
  const [firestoreInvitesCount, setFirestoreInvitesCount] = useState(0)

  useEffect(() => {
    if (!user?.uid) return
    const unsub = subscribeInvites(user.uid, (invs) => {
      setFirestoreInvitesCount(invs?.length || 0)
    })
    return () => {
      if (typeof unsub === 'function') unsub()
    }
  }, [user?.uid])

  const totalPendingInvitesCount = Math.max(pendingInvites.length, firestoreInvitesCount)

  // Sidebar is visually expanded if manually uncollapsed OR hovered over
  const isExpanded = !sidebarCollapsed || isHovered

  const handleNavClick = (item, e) => {
    if (item.isNotebook) {
      e.preventDefault()
      openNotebooks()
      setIsHovered(false)
    } else if (item.isStickyNotes) {
      e.preventDefault()
      openStickyNotes()
      setIsHovered(false)
    } else if (item.isTimer) {
      e.preventDefault()
      openTimerSetup()
      setIsHovered(false)
    } else if (item.isAICoach) {
      e.preventDefault()
      openAICoach()
      setIsHovered(false)
      setSidebarCollapsed(true)
    } else if (item.isInvites) {
      e.preventDefault()
      toggleInvitesDrawer()
      setIsHovered(false)
    } else {
      setIsHovered(false)
    }
  }

  return (
    <motion.aside
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      animate={{ width: isExpanded ? 240 : 64 }}
      transition={{ duration: 0.2, ease: 'easeInOut' }}
      className="hidden lg:flex flex-col fixed left-0 top-0 h-screen border-r border-border-subtle bg-surface/95 backdrop-blur-xl z-40 shadow-xl overflow-hidden print:hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border-subtle shrink-0">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="h-8 w-8 rounded-xl bg-accent text-white flex items-center justify-center font-black text-xs shrink-0 shadow">
            CG
          </div>
          <AnimatePresence>
            {isExpanded && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="text-card-title font-black text-text-primary whitespace-nowrap tracking-tight"
              >
                CampusGrid
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        <button
          onClick={toggleSidebar}
          className="p-1.5 rounded-lg hover:bg-hover text-text-secondary shrink-0"
          title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {sidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto scrollbar-none">
        {navItems.map((item) => {
          const { to, icon: Icon, label, isAICoach, isTimer, isStickyNotes, isNotebook, isInvites } = item
          const isActiveCoach = isAICoach && aiCoachOpen
          const isActiveTimer = isTimer && assessmentTimerOpen
          const isActiveNotebook = isNotebook && stickyNotesOpen && notesDrawerTab === 'notebooks'
          const isActiveStickyNotes = isStickyNotes && stickyNotesOpen && notesDrawerTab === 'stickies'
          const isActiveInvites = isInvites && invitesDrawerOpen
          const currentFullUrl = location.pathname + location.search
          const isQueryActive = item.to.includes('?')
            ? currentFullUrl === item.to
            : (item.to === '/admin' ? location.pathname === '/admin' && !location.search : false)

          return (
            <NavLink
              key={to}
              to={to}
              onClick={(e) => handleNavClick(item, e)}
              end={to === '/' || to === '/dashboard' || to === '/admin'}
              className={({ isActive }) => {
                const active = (isActive && !item.to.includes('?') && !isNotebook && !isStickyNotes) || isQueryActive || isActiveCoach || isActiveTimer || isActiveNotebook || isActiveStickyNotes || isActiveInvites
                return cn(
                  'flex items-center gap-3.5 px-3 py-2.5 rounded-xl text-secondary transition-all relative group',
                  active
                    ? 'bg-accent/15 text-accent-light font-semibold border border-accent/20'
                    : 'text-text-secondary hover:bg-hover hover:text-text-primary'
                )
              }}
            >
              <Icon className={cn('h-5 w-5 shrink-0 transition-colors', (isActiveCoach || isActiveTimer || isActiveNotebook || isActiveStickyNotes || isActiveInvites) && 'text-accent-light')} />
              <AnimatePresence>
                {isExpanded && (
                  <motion.span
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="whitespace-nowrap flex-1"
                  >
                    {label}
                  </motion.span>
                )}
              </AnimatePresence>

              {isAICoach && (
                <span className="h-2 w-2 rounded-full bg-semantic-green animate-pulse shrink-0" />
              )}
              {isTimer && assessmentTimerOpen && (
                <span className="h-2 w-2 rounded-full bg-accent animate-ping shrink-0" />
              )}
              {isNotebook && isActiveNotebook && (
                <span className="h-2 w-2 rounded-full bg-accent animate-pulse shrink-0" />
              )}
              {isStickyNotes && isActiveStickyNotes && (
                <span className="h-2 w-2 rounded-full bg-yellow-400 animate-pulse shrink-0" />
              )}
              {isInvites && totalPendingInvitesCount > 0 && (
                <span className="ml-auto bg-semantic-red text-white text-[10px] font-black px-2 py-0.5 rounded-full shrink-0">
                  {totalPendingInvitesCount}
                </span>
              )}
            </NavLink>
          )
        })}
      </nav>

      {/* Simple Super Admin Role Switcher in Sidebar */}
      {isAdmin && (
        <div className="p-3 border-t border-border-subtle shrink-0">
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="px-3 pb-1.5 text-[11px] font-bold text-text-muted uppercase tracking-wider"
              >
                Simulated Role
              </motion.div>
            )}
          </AnimatePresence>

          <div className="space-y-1">
            {SIMULATION_ROLES.map(({ id, label, icon: Icon }) => {
              const isCurrent = (activeRoleOverride || 'admin') === id
              return (
                <button
                  key={id}
                  onClick={() => handleRoleSelect(id)}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all relative group',
                    isCurrent
                      ? 'bg-accent/15 text-accent-light font-bold border border-accent/20'
                      : 'text-text-secondary hover:bg-hover hover:text-text-primary',
                    !isExpanded && 'justify-center px-0'
                  )}
                  title={`Simulate ${label}`}
                >
                  <Icon className={cn('h-4 w-4 shrink-0 transition-colors', isCurrent && 'text-accent-light')} />
                  {isExpanded && (
                    <span className="truncate">{label}</span>
                  )}
                  {isCurrent && isExpanded && (
                    <span className="ml-auto h-1.5 w-1.5 rounded-full bg-accent-light shrink-0" />
                  )}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Footer User Info */}
      <div className="p-3 border-t border-border-subtle shrink-0">
        <div className={cn('flex items-center gap-3 px-2 py-2', !isExpanded && 'justify-center')}>
          {user?.photoURL ? (
            <img src={user.photoURL} alt="" className="h-8 w-8 rounded-xl shrink-0 border border-border-subtle" />
          ) : (
            <div className="h-8 w-8 rounded-xl bg-hover flex items-center justify-center font-semibold text-xs text-text-primary shrink-0">
              {user?.displayName?.[0] || 'U'}
            </div>
          )}
          {isExpanded && (
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <p className="text-secondary font-semibold text-text-primary truncate">{user?.displayName}</p>
                {isAdmin && (
                  <span className="px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300 font-mono text-[9px] font-black uppercase">
                    Admin
                  </span>
                )}
              </div>
              <p className="text-micro text-text-muted truncate">{user?.email}</p>
            </div>
          )}
        </div>

        <button
          onClick={toggleTheme}
          className={cn(
            'flex items-center gap-3 w-full px-3 py-2 rounded-xl text-text-secondary hover:bg-hover hover:text-text-primary transition-colors mt-1',
            !isExpanded && 'justify-center'
          )}
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
        >
          {theme === 'dark' ? (
            <Sun className="h-4 w-4 text-yellow-400 fill-current shrink-0" />
          ) : (
            <Moon className="h-4 w-4 text-accent fill-current shrink-0" />
          )}
          {isExpanded && (
            <span className="text-secondary font-medium">
              {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
            </span>
          )}
        </button>

        <button
          onClick={onSignOut}
          className={cn(
            'flex items-center gap-3 w-full px-3 py-2 rounded-xl text-text-secondary hover:bg-hover hover:text-semantic-red transition-colors mt-1',
            !isExpanded && 'justify-center'
          )}
          title="Sign out"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {isExpanded && <span className="text-secondary font-medium">Sign out</span>}
        </button>

        {isExpanded && (
          <div className="px-3 pt-3 text-[10px] text-text-muted text-center border-t border-border-subtle/50 mt-3">
            <p>© {new Date().getFullYear()} Placify</p>
            <p className="opacity-75">Prepare with confidence</p>
          </div>
        )}
      </div>
    </motion.aside>
  )
}
