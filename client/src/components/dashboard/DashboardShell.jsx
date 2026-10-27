import { useEffect, useState, useRef } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import {
  BookOpen, Briefcase, FolderOpen, LayoutDashboard,
  Share2, Sparkles, Terminal, Users, Bookmark, CircleUserRound,
  LogOut
} from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
import { subscribeSharesAndInvites } from '@/services/firestoreService'
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
  { to: '/community', label: 'Community' },
  { to: '/bookmarks', label: 'Bookmarks' },
  { to: '/notes', label: 'Notes & Notebook' },
  { to: '/library', label: 'Resource Library' },
  { to: '/playground', label: 'Code Playground' },
  { to: '/ai-coach', label: 'AI Placement Coach', action: 'ai-coach' },
  { to: '/shares', label: 'Shares & Invites', id: 'shares-invites' },
]

const icons = {
  '/dashboard': LayoutDashboard,
  '/topics': BookOpen,
  '/applications': Briefcase,
  '/community': Users,
  '/bookmarks': Bookmark,
  '/notes': BookOpen,
  '/library': FolderOpen,
  '/playground': Terminal,
  '/ai-coach': Sparkles,
  '/shares': Share2,
}

export default function DashboardShell({ children, user, profile, onSignOut }) {
  const location = useLocation()
  const openAICoach = useAppStore((state) => state.openAICoach)
  const openTimerSetup = useAppStore((state) => state.openTimerSetup)
  const pendingInvites = useAppStore((state) => state.pendingInvites)
  const [profileOpen, setProfileOpen] = useState(false)
  const profileWrapRef = useRef(null)
  const [hoveredIdx, setHoveredIdx] = useState(null)
  const [tooltipState, setTooltipState] = useState(null)
  const [combinedSharesCount, setCombinedSharesCount] = useState(0)

  // Scroll-driven navbar state
  const [navHidden, setNavHidden] = useState(false)
  const lastScrollY = useRef(0)

  // Click outside to close profile dropdown & Escape key support
  useEffect(() => {
    if (!profileOpen) return

    const handleClickOutside = (event) => {
      if (profileWrapRef.current && !profileWrapRef.current.contains(event.target)) {
        setProfileOpen(false)
      }
    }

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setProfileOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('touchstart', handleClickOutside)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('touchstart', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [profileOpen])

  useEffect(() => {
    const root = document.documentElement
    root.classList.add('pnew-dashboard-active')
    return () => root.classList.remove('pnew-dashboard-active')
  }, [])

  // Real-time listener for combined shares & invites count
  useEffect(() => {
    if (!user?.uid) return
    const unsub = subscribeSharesAndInvites(user.uid, ({ totalCount }) => {
      setCombinedSharesCount(totalCount || 0)
    })
    return () => {
      if (typeof unsub === 'function') unsub()
    }
  }, [user?.uid])

  // Scroll-driven navbar auto-hide / auto-show
  useEffect(() => {
    let ticking = false
    const onScroll = () => {
      const scrollY = window.scrollY || document.documentElement.scrollTop
      if (!ticking) {
        window.requestAnimationFrame(() => {
          if (scrollY > 60 && scrollY > lastScrollY.current + 12) {
            // Scrolling down -> hide navbar smoothly
            setNavHidden((prev) => (prev ? prev : true))
          } else if (scrollY < lastScrollY.current - 12 || scrollY <= 20) {
            // Scrolling up or near top -> show navbar smoothly
            setNavHidden((prev) => (!prev ? prev : false))
          }
          lastScrollY.current = scrollY
          ticking = false
        })
        ticking = true
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const totalBadgeCount = Math.max(combinedSharesCount, pendingInvites?.length || 0)

  const onSideItem = (event, item) => {
    if (item.action === 'ai-coach') {
      event.preventDefault()
      openAICoach()
    }
  }

  // Calculate Authentic Mac Dock Magnification & "Came Out" Pop Physics
  const getDockItemStyle = (index) => {
    if (hoveredIdx === null) {
      return {
        transform: 'scale(1) translateX(0px)',
        transformOrigin: 'left center',
        zIndex: 1,
      }
    }
    const dist = Math.abs(index - hoveredIdx)
    if (dist === 0) {
      return {
        transform: 'scale(1.42) translateX(12px)',
        transformOrigin: 'left center',
        zIndex: 40,
      }
    }
    if (dist === 1) {
      return {
        transform: 'scale(1.22) translateX(6px)',
        transformOrigin: 'left center',
        zIndex: 30,
      }
    }
    if (dist === 2) {
      return {
        transform: 'scale(1.08) translateX(2px)',
        transformOrigin: 'left center',
        zIndex: 20,
      }
    }
    return {
      transform: 'scale(0.96) translateX(0px)',
      transformOrigin: 'left center',
      zIndex: 1,
    }
  }

  const handleItemMouseEnter = (e, index, item) => {
    setHoveredIdx(index)
    const rect = e.currentTarget.getBoundingClientRect()
    setTooltipState({
      top: rect.top + rect.height / 2,
      left: rect.right + 20,
      label: item.label,
      count: item.to === '/shares' ? totalBadgeCount : 0,
    })
  }

  const handleRailMouseLeave = () => {
    setHoveredIdx(null)
    setTooltipState(null)
  }

  const handleRailScroll = () => {
    setHoveredIdx(null)
    setTooltipState(null)
  }

  const isFullBleedPage =
    location.pathname.startsWith('/notes') ||
    location.pathname.startsWith('/notebooks')

  return (
    <div className="pnew-dashboard-shell">
      {/* ─── Compact Mac-Style Floating Dock Sidebar Rail ──────── */}
      <aside className="pnew-dashboard-rail" aria-label="Quick Dock Navigation">
        <nav
          className="pnew-dashboard-rail__items"
          aria-label="Dashboard sections"
          onMouseLeave={handleRailMouseLeave}
          onScroll={handleRailScroll}
        >
          {dashboardSideItems.map((item, index) => {
            const Icon = icons[item.to] || LayoutDashboard
            const isSharesItem = item.to === '/shares'

            return (
              <div
                key={item.to}
                className="pnew-dock-item-wrapper"
                style={getDockItemStyle(index)}
                onMouseEnter={(e) => handleItemMouseEnter(e, index, item)}
              >
                <NavLink
                  to={item.to}
                  end={item.to === '/dashboard'}
                  onClick={(event) => onSideItem(event, item)}
                  aria-label={item.label}
                  className={({ isActive }) =>
                    `pnew-dashboard-rail__button${isActive ? ' is-active' : ''}`
                  }
                >
                  <Icon size={16} strokeWidth={1.8} />

                  {isSharesItem && totalBadgeCount > 0 && (
                    <span className="pnew-dashboard-rail__badge" title={`${totalBadgeCount} shares & invites`}>
                      {totalBadgeCount}
                    </span>
                  )}
                </NavLink>
              </div>
            )
          })}
        </nav>
      </aside>

      {/* ─── Floating macOS Dock Tooltip (Fixed Coordinates) ───── */}
      {tooltipState && (
        <div
          className="pnew-dock-tooltip is-floating"
          style={{ top: `${tooltipState.top}px`, left: `${tooltipState.left}px` }}
          role="tooltip"
        >
          {tooltipState.label}
          {tooltipState.count > 0 && ` (${tooltipState.count})`}
        </div>
      )}

      {/* ─── Scroll-Driven Floating Top Navbar ─────────────────── */}
      <header className={`pnew-dashboard-topbar${navHidden ? ' is-hidden' : ''}`} aria-label="Top Command Navigation">
        <nav className="pnew-dashboard-topbar__tabs" aria-label="Primary navigation">
          {dashboardTopItems.map((item) =>
            item.action === 'timer' ? (
              <button
                key={item.to}
                type="button"
                onClick={openTimerSetup}
                className="pnew-dashboard-topbar__tab"
              >
                {item.label}
              </button>
            ) : (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `pnew-dashboard-topbar__tab${isActive || location.pathname === item.to ? ' is-active' : ''}`
                }
              >
                {item.label}
              </NavLink>
            )
          )}
        </nav>

        <div className="pnew-dashboard-profile-wrap" ref={profileWrapRef}>
          <button
            type="button"
            className="pnew-dashboard-profile"
            aria-label="Open profile menu"
            aria-expanded={profileOpen}
            onClick={() => setProfileOpen((value) => !value)}
          >
            {user?.photoURL ? (
              <img src={user.photoURL} alt="" />
            ) : (
              <CircleUserRound size={20} strokeWidth={1.7} />
            )}
          </button>
          {profileOpen && (
            <div className="pnew-dashboard-profile-menu">
              <strong>{profile?.displayName || user?.displayName || 'Your profile'}</strong>
              <span>{user?.email}</span>
              <button type="button" onClick={onSignOut}>
                <LogOut size={15} /> Sign out
              </button>
            </div>
          )}
        </div>
      </header>

      {/* ─── Universal Page Main Canvas ────────────────────────── */}
      <main
        className={`pnew-dashboard-main${isFullBleedPage ? ' is-fullbleed' : ''}`}
        id="main-content"
      >
        <div className="pnew-main-inner p3d-perspective-stage">
          {children}
        </div>
      </main>
    </div>
  )
}
