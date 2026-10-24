import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { BookOpen, Briefcase, Film, FolderOpen, LayoutDashboard, MailOpen, Share2, Sparkles, Terminal, Users, Bookmark, CircleUserRound, LogOut } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
import './DashboardShell.css'

const dashboardTopItems = [
  { to: '/classroom', label: 'Classroom Vault' },
  { to: '/timer', label: 'Mock Timer', action: 'timer' },
  { to: '/courses', label: 'Course Vault' },
  { to: '/problems', label: 'Problem Log' },
]
const dashboardSideItems = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/topics', label: 'Topic Mastery' },
  { to: '/applications', label: 'Applications' },
  { to: '/invites', label: 'Invites', action: 'invites' },
  { to: '/community', label: 'Community' },
  { to: '/bookmarks', label: 'Bookmarks' },
  { to: '/notes', label: 'Notes & Notebook' },
  { to: '/dsa-courses', label: '3D Video Masterclass' },
  { to: '/library', label: 'Resource Library' },
  { to: '/playground', label: 'Code Playground' },
  { to: '/ai-coach', label: 'AI Placement Coach', action: 'ai-coach' },
  { to: '/shares', label: 'Shared Inbox' },
]

const icons = {
  '/dashboard': LayoutDashboard,
  '/topics': BookOpen,
  '/applications': Briefcase,
  '/invites': MailOpen,
  '/community': Users,
  '/bookmarks': Bookmark,
  '/notes': BookOpen,
  '/dsa-courses': Film,
  '/library': FolderOpen,
  '/playground': Terminal,
  '/ai-coach': Sparkles,
  '/shares': Share2,
}

export default function DashboardShell({ children, user, profile, onSignOut }) {
  const location = useLocation()
  const openAICoach = useAppStore((state) => state.openAICoach)
  const openTimerSetup = useAppStore((state) => state.openTimerSetup)
  const toggleInvitesDrawer = useAppStore((state) => state.toggleInvitesDrawer)
  const pendingInvites = useAppStore((state) => state.pendingInvites)
  const [profileOpen, setProfileOpen] = useState(false)

  useEffect(() => {
    const root = document.documentElement
    root.classList.add('pnew-dashboard-active')
    return () => root.classList.remove('pnew-dashboard-active')
  }, [])

  const onSideItem = (event, item) => {
    if (item.action === 'ai-coach') { event.preventDefault(); openAICoach() }
    if (item.action === 'invites') { event.preventDefault(); toggleInvitesDrawer() }
  }

  return <div className="pnew-dashboard-shell">
    <aside className="pnew-dashboard-rail">
      <Link to="/dashboard" aria-label="Placify home" className="pnew-dashboard-brand"><span>P</span></Link>
      <nav className="pnew-dashboard-rail__items" aria-label="Dashboard sections">
        {dashboardSideItems.map((item) => {
          const Icon = icons[item.to] || LayoutDashboard
          return <NavLink key={item.to} to={item.to} end={item.to === '/dashboard'} onClick={(event) => onSideItem(event, item)} title={item.label} aria-label={item.label} className={({ isActive }) => `pnew-dashboard-rail__button${isActive ? ' is-active' : ''}`}>
            <Icon size={19} strokeWidth={1.8} />
            {item.action === 'invites' && pendingInvites?.length > 0 && <span className="pnew-dashboard-rail__badge">{pendingInvites.length}</span>}
          </NavLink>
        })}
      </nav>
    </aside>

    <header className="pnew-dashboard-topbar">
      <nav className="pnew-dashboard-topbar__tabs" aria-label="Primary navigation">
        {dashboardTopItems.map((item) => item.action === 'timer'
          ? <button key={item.to} type="button" onClick={openTimerSetup} className="pnew-dashboard-topbar__tab">{item.label}</button>
          : <NavLink key={item.to} to={item.to} className={({ isActive }) => `pnew-dashboard-topbar__tab${isActive || location.pathname === item.to ? ' is-active' : ''}`}>{item.label}</NavLink>)}
      </nav>
      <div className="pnew-dashboard-profile-wrap">
        <button type="button" className="pnew-dashboard-profile" aria-label="Open profile menu" aria-expanded={profileOpen} onClick={() => setProfileOpen((value) => !value)}>
          {user?.photoURL ? <img src={user.photoURL} alt="" /> : <CircleUserRound size={21} strokeWidth={1.7} />}
        </button>
        {profileOpen && <div className="pnew-dashboard-profile-menu"><strong>{profile?.displayName || user?.displayName || 'Your profile'}</strong><span>{user?.email}</span><button type="button" onClick={onSignOut}><LogOut size={15} /> Sign out</button></div>}
      </div>
    </header>

    <main className="pnew-dashboard-main">{children}</main>
  </div>
}
