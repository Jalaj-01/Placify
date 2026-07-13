import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Code2, BookOpen, Briefcase, Sparkles, Terminal } from 'lucide-react'
import { cn } from '@/lib/utils'

const items = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Home' },
  { to: '/problems', icon: Code2, label: 'Problems' },
  { to: '/topics', icon: BookOpen, label: 'Topics' },
  { to: '/applications', icon: Briefcase, label: 'Apps' },
  { to: '/ai-coach', icon: Sparkles, label: 'AI' },
  { to: '/playground', icon: Terminal, label: 'Code' },
]

export default function BottomNav() {
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
              isActive ? 'text-accent-light' : 'text-text-muted'
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
