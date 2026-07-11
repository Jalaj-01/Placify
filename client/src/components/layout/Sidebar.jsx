import { NavLink } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  LayoutDashboard, Code2, BookOpen, Briefcase, Sparkles,
  ChevronLeft, ChevronRight, LogOut, Terminal, FolderOpen, Youtube,
  Bookmark,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAppStore } from '@/store/useAppStore'

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/problems', icon: Code2, label: 'Problems' },
  { to: '/topics', icon: BookOpen, label: 'Topics' },
  { to: '/applications', icon: Briefcase, label: 'Applications' },
  { to: '/ai-coach', icon: Sparkles, label: 'AI Coach' },
  { to: '/playground', icon: Terminal, label: 'Playground' },
  { to: '/library', icon: FolderOpen, label: 'Library' },
  { to: '/courses', icon: Youtube, label: 'Course Vault' },
  { to: '/bookmarks', icon: Bookmark, label: 'Bookmarks' },
]

export default function Sidebar({ user, onSignOut }) {
  const { sidebarCollapsed, toggleSidebar } = useAppStore()

  return (
    <motion.aside
      layout
      className={cn(
        'hidden lg:flex flex-col fixed left-0 top-0 h-screen border-r border-border-subtle bg-surface z-40',
        sidebarCollapsed ? 'w-16' : 'w-60'
      )}
    >
      <div className="flex items-center justify-between p-4 border-b border-border-subtle">
        {!sidebarCollapsed && (
          <motion.span layout className="text-card-title font-bold text-accent-light">
            Placify
          </motion.span>
        )}
        <button onClick={toggleSidebar} className="p-1.5 rounded-lg hover:bg-hover text-text-secondary">
          {sidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) => cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg text-secondary transition-all',
              isActive ? 'bg-accent/15 text-accent-light' : 'text-text-secondary hover:bg-hover hover:text-text-primary'
            )}
          >
            <Icon className="h-5 w-5 shrink-0" />
            {!sidebarCollapsed && <span>{label}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="p-3 border-t border-border-subtle">
        <div className={cn('flex items-center gap-3 px-2 py-2', sidebarCollapsed && 'justify-center')}>
          {user?.photoURL && (
            <img src={user.photoURL} alt="" className="h-8 w-8 rounded-full shrink-0" />
          )}
          {!sidebarCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-secondary font-medium truncate">{user?.displayName}</p>
              <p className="text-micro text-text-muted truncate">{user?.email}</p>
            </div>
          )}
        </div>
        <button
          onClick={onSignOut}
          className={cn(
            'flex items-center gap-3 w-full px-3 py-2 rounded-lg text-text-secondary hover:bg-hover hover:text-semantic-red transition-colors mt-1',
            sidebarCollapsed && 'justify-center'
          )}
        >
          <LogOut className="h-4 w-4" />
          {!sidebarCollapsed && <span className="text-secondary">Sign out</span>}
        </button>
        
        {!sidebarCollapsed && (
          <div className="px-3 pt-3 text-[10px] text-text-muted text-center border-t border-border-subtle/50 mt-3">
            <p>© {new Date().getFullYear()} PlacementTracker</p>
            <p className="opacity-75">Prepare with confidence</p>
          </div>
        )}
      </div>
    </motion.aside>
  )
}
