import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, Code2, BookOpen, Briefcase, Sparkles,
  ChevronLeft, ChevronRight, LogOut, Terminal, FolderOpen, Youtube,
  Bookmark, Share2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAppStore } from '@/store/useAppStore'

import { useAuth } from '@/hooks/useAuth'

const allNavItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', roles: ['student', 'teacher', 'phd'] },
  { to: '/problems', icon: Code2, label: 'Problems', roles: ['student'] },
  { to: '/topics', icon: BookOpen, label: 'Topics', roles: ['student', 'teacher'] },
  { to: '/applications', icon: Briefcase, label: 'Applications', roles: ['student'] },
  { to: '/ai-coach', icon: Sparkles, label: 'AI Coach', isAICoach: true, roles: ['student', 'teacher', 'phd'] },
  { to: '/playground', icon: Terminal, label: 'Playground', roles: ['student', 'phd'] },
  { to: '/library', icon: FolderOpen, label: 'Library', roles: ['student', 'teacher', 'phd'] },
  { to: '/courses', icon: Youtube, label: 'Course Vault', roles: ['student', 'teacher', 'phd'] },
  { to: '/bookmarks', icon: Bookmark, label: 'Bookmarks', roles: ['student', 'teacher', 'phd'] },
  { to: '/shares', icon: Share2, label: 'Shares', roles: ['student', 'teacher', 'phd'] },
]

export default function Sidebar({ user, onSignOut }) {
  const { profile } = useAuth()
  const currentRole = profile?.role || 'student'

  const navItems = allNavItems.filter((item) => item.roles.includes(currentRole))
  const { sidebarCollapsed, toggleSidebar, setSidebarCollapsed, openAICoach, aiCoachOpen } = useAppStore()
  const [isHovered, setIsHovered] = useState(false)

  // Sidebar is visually expanded if manually uncollapsed OR hovered over
  const isExpanded = !sidebarCollapsed || isHovered

  const handleNavClick = (item, e) => {
    if (item.isAICoach) {
      e.preventDefault()
      openAICoach()
      setIsHovered(false)
      setSidebarCollapsed(true)
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
          <div className="h-8 w-8 rounded-xl bg-accent text-white flex items-center justify-center font-bold shrink-0 shadow">
            P
          </div>
          <AnimatePresence>
            {isExpanded && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="text-card-title font-bold text-text-primary whitespace-nowrap"
              >
                Placify
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
          const { to, icon: Icon, label, isAICoach } = item
          const isActiveCoach = isAICoach && aiCoachOpen

          return (
            <NavLink
              key={to}
              to={to}
              onClick={(e) => handleNavClick(item, e)}
              end={to === '/'}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3.5 px-3 py-2.5 rounded-xl text-secondary transition-all relative group',
                  (isActive || isActiveCoach)
                    ? 'bg-accent/15 text-accent-light font-semibold border border-accent/20'
                    : 'text-text-secondary hover:bg-hover hover:text-text-primary'
                )
              }
            >
              <Icon className={cn('h-5 w-5 shrink-0 transition-colors', (isActiveCoach) && 'text-accent-light')} />
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
