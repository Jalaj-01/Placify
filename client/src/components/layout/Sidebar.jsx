import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, Code2, BookOpen, Briefcase, Sparkles,
  ChevronLeft, ChevronRight, LogOut, Terminal, FolderOpen, Youtube,
  Bookmark, Share2, Sun, Moon, Timer, StickyNote, MailOpen
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAppStore } from '@/store/useAppStore'

import { useAuth } from '@/hooks/useAuth'

const allNavItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', roles: ['student', 'teacher', 'phd'] },
  { to: '/problems', icon: Code2, label: 'Problems', roles: ['student'] },
  { to: '/topics', icon: BookOpen, label: 'Topics', roles: ['student', 'teacher'] },
  {to: '/applications', icon: Briefcase, label: 'Applications', roles: ['student'] },
  { to: '/timer', icon: Timer, label: 'Mock Timer', isTimer: true, roles: ['student'] },
  { to: '/ai-coach', icon: Sparkles, label: 'AI Coach', isAICoach: true, roles: ['student', 'teacher', 'phd'] },
  { to: '/playground', icon: Terminal, label: 'Playground', roles: ['student', 'phd'] },
  { to: '/library', icon: FolderOpen, label: 'Library', roles: ['student', 'teacher', 'phd'] },
  { to: '/courses', icon: Youtube, label: 'Course Vault', roles: ['student', 'teacher', 'phd'] },
  { to: '/bookmarks', icon: Bookmark, label: 'Bookmarks', roles: ['student', 'teacher', 'phd'] },
  { to: '/shares', icon: Share2, label: 'Shares', roles: ['student', 'teacher', 'phd'] },
  { to: '/notes', icon: StickyNote, label: 'My Notes', isStickyNotes: true, roles: ['student', 'teacher', 'phd'] },
  { to: '/invites', icon: MailOpen, label: 'Room Invites', isInvites: true, roles: ['student', 'teacher', 'phd'] },
]

export default function Sidebar({ user, onSignOut }) {
  const { profile } = useAuth()
  const roleRaw = (profile?.role || 'student').toLowerCase()
  const isTeacher = roleRaw === 'teacher' || roleRaw === 'faculty'
  const isPhd = roleRaw === 'phd' || roleRaw === 'research'
  const isStudent = !isTeacher && !isPhd

  const navItems = allNavItems.filter((item) => {
    if (isStudent && item.roles.includes('student')) return true
    if (isTeacher && item.roles.includes('teacher')) return true
    if (isPhd && item.roles.includes('phd')) return true
    return false
  })
  const {
    sidebarCollapsed, toggleSidebar, setSidebarCollapsed,
    openAICoach, aiCoachOpen, openTimerSetup, assessmentTimerOpen,
    toggleStickyNotes, stickyNotesOpen,
    theme, toggleTheme,
    invitesDrawerOpen, toggleInvitesDrawer, pendingInvites
  } = useAppStore()
  const [isHovered, setIsHovered] = useState(false)

  // Sidebar is visually expanded if manually uncollapsed OR hovered over
  const isExpanded = !sidebarCollapsed || isHovered

  const handleNavClick = (item, e) => {
    if (item.isStickyNotes) {
      e.preventDefault()
      toggleStickyNotes()
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
      className="hidden lg:flex flex-col fixed left-0 top-0 h-screen border-r border-border-subtle bg-surface/95 backdrop-blur-xl z-40 shadow-xl overflow-hidden"
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
          const { to, icon: Icon, label, isAICoach, isTimer, isStickyNotes, isInvites } = item
          const isActiveCoach = isAICoach && aiCoachOpen
          const isActiveTimer = isTimer && assessmentTimerOpen
          const isActiveStickyNotes = isStickyNotes && stickyNotesOpen
          const isActiveInvites = isInvites && invitesDrawerOpen

          return (
            <NavLink
              key={to}
              to={to}
              onClick={(e) => handleNavClick(item, e)}
              end={to === '/'}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3.5 px-3 py-2.5 rounded-xl text-secondary transition-all relative group',
                  (isActive || isActiveCoach || isActiveTimer || isActiveStickyNotes || isActiveInvites)
                    ? 'bg-accent/15 text-accent-light font-semibold border border-accent/20'
                    : 'text-text-secondary hover:bg-hover hover:text-text-primary'
                )
              }
            >
              <Icon className={cn('h-5 w-5 shrink-0 transition-colors', (isActiveCoach || isActiveTimer || isActiveStickyNotes || isActiveInvites) && 'text-accent-light')} />
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
              {isStickyNotes && stickyNotesOpen && (
                <span className="h-2 w-2 rounded-full bg-yellow-400 animate-pulse shrink-0" />
              )}
              {isInvites && pendingInvites.length > 0 && (
                <span className="ml-auto bg-semantic-red text-white text-[10px] font-black px-2 py-0.5 rounded-full shrink-0">
                  {pendingInvites.length}
                </span>
              )}
            </NavLink>
          )
        })}
      </nav>

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
              <p className="text-secondary font-semibold text-text-primary truncate">{user?.displayName}</p>
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
