import { ArrowRight, Sparkles, User, School, GraduationCap } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'

export default function Navbar() {
  const { user, signInWithGoogle, loginAsDemo, loading } = useAuth()
  const navigate = useNavigate()

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
    <header className="sticky top-0 z-50 w-full px-4 sm:px-8 pt-3 pb-1 transition-all">
      <div className="max-w-7xl mx-auto h-16 sm:h-18 rounded-2xl bg-white/85 backdrop-blur-xl border border-white/95 shadow-[0_8px_30px_rgba(31,41,55,0.06)] px-4 sm:px-6 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <div
          onClick={() => navigate('/')}
          className="flex items-center gap-3 cursor-pointer group shrink-0"
        >
          {/* Black Placify Squircle Brand Mark */}
          <div className="w-10 h-10 rounded-2xl bg-[#20242b] text-white flex items-center justify-center font-black text-base shadow-md group-hover:scale-105 transition-transform">
            P
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-xl tracking-tight text-[#20242b]">
                Placify
              </span>
              <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold border border-slate-200">
                v2.5
              </span>
            </div>
            <span className="text-[10px] text-slate-500 font-semibold tracking-wide hidden sm:inline">
              Placement & Academic OS
            </span>
          </div>
        </div>

        {/* Center Floating Navigation Pill Links */}
        <nav className="hidden md:flex items-center gap-1 p-1 rounded-2xl bg-slate-100/80 border border-slate-200/80 text-xs font-bold text-slate-600">
          <button
            onClick={() => scrollToSection('dashboard-preview')}
            className="px-3.5 py-1.5 rounded-xl hover:text-slate-900 hover:bg-white transition-all"
          >
            Overview
          </button>
          <button
            onClick={() => scrollToSection('features')}
            className="px-3.5 py-1.5 rounded-xl hover:text-slate-900 hover:bg-white transition-all"
          >
            Features
          </button>
          <button
            onClick={() => scrollToSection('role-sandbox')}
            className="px-3.5 py-1.5 rounded-xl hover:text-slate-900 hover:bg-white transition-all"
          >
            Roles
          </button>
          <button
            onClick={() => scrollToSection('metrics')}
            className="px-3.5 py-1.5 rounded-xl hover:text-slate-900 hover:bg-white transition-all"
          >
            Results
          </button>
          <button
            onClick={() => scrollToSection('pricing')}
            className="px-3.5 py-1.5 rounded-xl hover:text-slate-900 hover:bg-white transition-all"
          >
            Pricing
          </button>
        </nav>

        {/* Right Action Button Group */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Quick Demo Test Buttons */}
          <div className="hidden lg:flex items-center gap-1.5">
            <button
              onClick={() => {
                loginAsDemo('student')
                navigate('/dashboard')
              }}
              className="text-xs px-3 py-1.5 rounded-xl bg-[#dfe0fb]/80 text-[#5046e5] hover:bg-[#dfe0fb] font-bold transition-all border border-[#c5c8e8] shadow-sm flex items-center gap-1"
            >
              <GraduationCap className="h-3.5 w-3.5" />
              <span>Demo Student</span>
            </button>
            <button
              onClick={() => {
                loginAsDemo('teacher')
                navigate('/dashboard')
              }}
              className="text-xs px-3 py-1.5 rounded-xl bg-[#e4f5d7]/80 text-[#3f7230] hover:bg-[#e4f5d7] font-bold transition-all border border-[#d4eac5] shadow-sm flex items-center gap-1"
            >
              <School className="h-3.5 w-3.5" />
              <span>Demo Faculty</span>
            </button>
          </div>

          {/* Sign In Button */}
          <button
            onClick={handleStart}
            disabled={loading}
            className="text-xs px-3.5 py-2 rounded-xl text-slate-700 hover:text-slate-900 hover:bg-slate-100 font-bold transition-all"
          >
            {user ? 'Console' : 'Sign In'}
          </button>

          {/* Primary CTA Button */}
          <Button
            size="sm"
            onClick={handleStart}
            disabled={loading}
            className="text-xs px-4 sm:px-5 py-2 rounded-xl bg-[#20242b] hover:bg-black text-white font-extrabold transition-all shadow-md flex items-center gap-1.5"
          >
            <span>{user ? 'Enter Console' : 'Get Started Free'}</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </header>
  )
}
