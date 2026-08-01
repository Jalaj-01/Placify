import { WifiOff, FolderOpen, Youtube, Bookmark, LogOut, Share2, Sun, Moon } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAppStore } from '@/store/useAppStore'
import { useAuth } from '@/hooks/useAuth'

export default function TopBar({ title }) {
  const { isOffline, theme, toggleTheme } = useAppStore()
  const { signOut } = useAuth()

  return (
    <header className="lg:hidden sticky top-0 z-30 border-b border-border-subtle bg-base/95 backdrop-blur-md px-4 py-3">
      <div className="flex items-center justify-between">
        <h1 className="text-section font-semibold">{title}</h1>
        <div className="flex items-center gap-2">
          {isOffline && (
            <div className="flex items-center gap-1.5 text-micro text-semantic-yellow animate-pulse mr-2">
              <WifiOff className="h-3.5 w-3.5" />
              Offline
            </div>
          )}
          <button
            onClick={toggleTheme}
            className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-hover transition-colors"
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          >
            {theme === 'dark' ? <Sun className="h-4.5 w-4.5 text-yellow-400" /> : <Moon className="h-4.5 w-4.5 text-accent" />}
          </button>
          <Link to="/library" className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-hover transition-colors" title="Library">
            <FolderOpen className="h-4.5 w-4.5" />
          </Link>
          <Link to="/courses" className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-hover transition-colors" title="Course Vault">
            <Youtube className="h-4.5 w-4.5" />
          </Link>
          <Link to="/bookmarks" className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-hover transition-colors" title="Bookmarks">
            <Bookmark className="h-4.5 w-4.5" />
          </Link>
          <Link to="/shares" className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-hover transition-colors" title="Shared Inbox">
            <Share2 className="h-4.5 w-4.5" />
          </Link>
          <button
            onClick={signOut}
            className="p-1.5 rounded-lg text-text-muted hover:text-semantic-red hover:bg-hover transition-colors"
            title="Sign out"
          >
            <LogOut className="h-4.5 w-4.5" />
          </button>
        </div>
      </div>
    </header>
  )
}
