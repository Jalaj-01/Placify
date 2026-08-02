import { Sun, Moon, ArrowRight } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '@/store/useAppStore'
import { Button } from '@/components/ui/button'

export default function Navbar() {
  const { user, signInWithGoogle, loading } = useAuth()
  const navigate = useNavigate()
  const { theme, toggleTheme } = useAppStore()

  const handleStart = () => {
    if (user) {
      navigate('/dashboard')
    } else {
      signInWithGoogle()
    }
  }

  const scrollToSection = (id) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/40 backdrop-blur-2xl bg-base/90 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <div 
          onClick={() => navigate('/')} 
          className="flex items-center gap-3 cursor-pointer group shrink-0"
        >
          <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-accent via-indigo-600 to-cyan-500 p-0.5 shadow-lg shadow-accent/25 group-hover:scale-105 transition-transform">
            <div className="h-full w-full rounded-[14px] bg-base flex items-center justify-center">
              <span className="font-black text-sm tracking-tighter bg-gradient-to-tr from-accent via-cyan-400 to-white bg-clip-text text-transparent">
                CG
              </span>
            </div>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-black text-xl tracking-tight text-text-primary uppercase font-sans">
                CampusGrid
              </span>
              <span className="px-2 py-0.5 rounded-full bg-accent/15 text-accent-light text-[10px] font-mono font-bold border border-accent/30 shadow-sm">
                v2.5
              </span>
            </div>
            <span className="text-[10px] text-text-muted font-medium tracking-wider uppercase hidden sm:inline">
              Academic Operating System
            </span>
          </div>
        </div>

        {/* Clean, Spacious Navigation Links (No comparison link) */}
        <div className="hidden lg:flex items-center gap-8 text-xs font-bold text-text-secondary">
          <button 
            onClick={() => scrollToSection('features')} 
            className="hover:text-accent transition-colors py-2"
          >
            Features
          </button>
          <button 
            onClick={() => scrollToSection('role-sandbox')} 
            className="hover:text-accent transition-colors py-2"
          >
            For Students
          </button>
          <button 
            onClick={() => scrollToSection('role-sandbox')} 
            className="hover:text-accent transition-colors py-2"
          >
            For Faculty
          </button>
          <button 
            onClick={() => scrollToSection('role-sandbox')} 
            className="hover:text-accent transition-colors py-2"
          >
            For PhD Scholars
          </button>
          <button 
            onClick={() => scrollToSection('pricing')} 
            className="hover:text-accent transition-colors py-2"
          >
            Pricing
          </button>
        </div>

        {/* Action Button Group */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Light / Dark Mode Toggle Button */}
          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-xl border border-border-subtle bg-surface/80 hover:bg-hover text-text-primary transition-all shadow-sm flex items-center justify-center"
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          >
            {theme === 'dark' ? (
              <Sun className="h-4.5 w-4.5 text-yellow-400 fill-current" />
            ) : (
              <Moon className="h-4.5 w-4.5 text-accent fill-current" />
            )}
          </button>

          {/* Sign In Button */}
          <button
            onClick={handleStart}
            disabled={loading}
            className="hidden sm:inline-flex text-xs px-4 py-2.5 rounded-xl text-text-secondary hover:text-text-primary hover:bg-hover font-bold transition-all"
          >
            {user ? 'Console' : 'Sign In'}
          </button>

          {/* Get Started Button */}
          <Button
            size="sm"
            onClick={handleStart}
            disabled={loading}
            className="text-xs px-5 py-2.5 rounded-xl bg-gradient-to-r from-accent via-indigo-600 to-cyan-500 hover:opacity-95 text-white font-black transition-all shadow-xl shadow-accent/25 border border-white/20 flex items-center gap-2 group"
          >
            <span>{user ? 'Enter Console' : 'Get Started Free'}</span>
            <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
          </Button>
        </div>
      </div>
    </nav>
  )
}
