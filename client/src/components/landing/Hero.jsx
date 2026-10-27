import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  ArrowRight, Sparkles, CheckCircle2, Users, School, GraduationCap,
  BookOpen, Briefcase, FileSpreadsheet, Clock, Play, Code2, ShieldCheck,
  ChevronRight, Laptop, Award
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import Landing3DScene from './Landing3DScene'
import Dashboard3DPreview from './Dashboard3DPreview'

export default function Hero() {
  const { user, signInWithGoogle, loginAsDemo, loading } = useAuth()
  const navigate = useNavigate()
  const [roleTab, setRoleTab] = useState('student') // 'student' | 'teacher' | 'phd'

  const handleStart = () => {
    if (user) {
      navigate('/dashboard')
    } else {
      signInWithGoogle()
    }
  }

  return (
    <section className="relative pt-6 sm:pt-12 pb-16 px-4 sm:px-8 max-w-7xl mx-auto z-20">
      {/* Top Hero Pitch */}
      <div className="text-center space-y-6 max-w-4xl mx-auto">
        {/* Top Floating Pill Badge */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/90 border border-slate-200/90 shadow-[0_4px_16px_rgba(31,41,55,0.06)] text-xs font-bold text-[#1E1B4B] backdrop-blur-xl"
        >
          <span className="flex h-2 w-2 rounded-full bg-[#FACC15] animate-pulse" />
          <span>✨ The Unified Placement & Academic OS for Modern Universities</span>
        </motion.div>

        {/* Main Headline */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="space-y-4"
        >
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-[#1E1B4B] leading-[1.08]">
            Your Placement Journey.{' '}
            <span className="block mt-1 text-transparent bg-clip-text bg-gradient-to-r from-[#2563EB] via-[#FACC15] to-[#2563EB]">
              Simplified. Elevated. Mastered.
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-slate-600 text-base sm:text-lg leading-relaxed font-normal">
            Placify unifies placement drives, AI mock interviews, coding problem logs, and collaborative research notebooks into one seamless, distraction-free command center.
          </p>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="space-y-4 pt-2"
        >
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button
              size="lg"
              onClick={handleStart}
              disabled={loading}
              className="w-full sm:w-auto text-sm px-8 py-6 rounded-2xl font-extrabold bg-[#2563EB] hover:bg-[#1d4ed8] text-white hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_12px_28px_rgba(37,99,235,0.25)] flex items-center justify-center gap-2.5"
            >
              <span>{user ? 'Launch Placify Console' : 'Launch Placify Free'}</span>
              <ArrowRight className="h-4 w-4" />
            </Button>

            <button
              onClick={() => {
                loginAsDemo('student')
                navigate('/dashboard')
              }}
              className="w-full sm:w-auto text-sm px-7 py-3.5 rounded-2xl font-bold bg-white/90 hover:bg-white border border-slate-200/90 text-[#1E1B4B] hover:scale-[1.02] active:scale-[0.98] transition-all shadow-sm flex items-center justify-center gap-2"
            >
              <GraduationCap className="h-4 w-4 text-[#2563EB]" />
              <span>Instant Student Preview</span>
            </button>
          </div>

          {/* Quick Demo Test Pills */}
          <div className="flex items-center justify-center gap-2 flex-wrap text-xs pt-1">
            <span className="text-slate-400 font-bold text-[11px]">Instant 1-Click Access:</span>
            <button
              onClick={() => {
                loginAsDemo('student')
                navigate('/dashboard')
              }}
              className="px-3 py-1 rounded-xl bg-[#2563EB]/10 hover:bg-[#2563EB]/20 border border-[#2563EB]/25 text-[#2563EB] font-bold transition-all shadow-sm"
            >
              🎓 Student Demo
            </button>
            <button
              onClick={() => {
                loginAsDemo('teacher')
                navigate('/dashboard')
              }}
              className="px-3 py-1 rounded-xl bg-[#FACC15]/20 hover:bg-[#FACC15]/30 border border-[#FACC15]/35 text-[#854d0e] font-bold transition-all shadow-sm"
            >
              👨‍🏫 Faculty Demo
            </button>
            <button
              onClick={() => {
                loginAsDemo('phd')
                navigate('/dashboard')
              }}
              className="px-3 py-1 rounded-xl bg-[#EEF2FF] hover:bg-[#e0e7ff] border border-blue-200 text-[#1E1B4B] font-bold transition-all shadow-sm"
            >
              🔬 PhD Scholar Demo
            </button>
          </div>
        </motion.div>
      </div>

      {/* 3D Visual Centerpiece: Interactive WebGL Sculpture + 3D Dashboard Preview */}
      <div id="dashboard-preview" className="mt-12 relative">
        {/* Subtle Ambient 3D Glass Sculpture in background behind card */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-80 h-80 pointer-events-none opacity-40 z-0 hidden lg:block">
          <Landing3DScene />
        </div>

        {/* Interactive 3D Perspective Tilt Dashboard Card */}
        <div className="relative z-10">
          <Dashboard3DPreview />
        </div>
      </div>

      {/* Live Role Sandbox Preview Section */}
      <div id="role-sandbox" className="mt-20 max-w-5xl mx-auto">
        <div className="rounded-[28px] p-6 sm:p-8 bg-white/90 border border-white/95 shadow-[0_16px_40px_rgba(31,41,55,0.06)] backdrop-blur-xl space-y-6">
          {/* Header & Role Switcher */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                Tailored Workspaces
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 m-0">
                Engineered for Every University Stakeholder
              </h3>
            </div>

            <div className="flex items-center gap-1 p-1 rounded-2xl bg-slate-100/90 border border-slate-200">
              <button
                onClick={() => setRoleTab('student')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  roleTab === 'student'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <GraduationCap className="h-3.5 w-3.5" />
                <span>Student</span>
              </button>
              <button
                onClick={() => setRoleTab('teacher')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  roleTab === 'teacher'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <School className="h-3.5 w-3.5" />
                <span>Faculty</span>
              </button>
              <button
                onClick={() => setRoleTab('phd')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  roleTab === 'phd'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <BookOpen className="h-3.5 w-3.5" />
                <span>PhD Scholar</span>
              </button>
            </div>
          </div>

          {/* Tab Content 1: Student */}
          {roleTab === 'student' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-in fade-in duration-300">
              <div className="p-4 rounded-2xl bg-[#EEF2FF] border border-[#BFDBFE] space-y-2">
                <div className="flex items-center gap-2 text-[#2563EB]">
                  <Briefcase className="h-4 w-4" />
                  <strong className="text-xs font-bold uppercase tracking-wider">Placement Kanban</strong>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Track company applications, online assessments, technical rounds, and offer letters with zero friction.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#EEF2FF] border border-blue-200 space-y-2">
                <div className="flex items-center gap-2 text-[#2563EB]">
                  <Code2 className="h-4 w-4" />
                  <strong className="text-xs font-bold uppercase tracking-wider">DSA & Coding Vault</strong>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Log solved problems, analyze radar competency, and practice with step-by-step masterclass engines.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#FFFDF7] border border-[#FEF08A] space-y-2">
                <div className="flex items-center gap-2 text-[#854d0e]">
                  <Sparkles className="h-4 w-4 text-[#FACC15]" />
                  <strong className="text-xs font-bold uppercase tracking-wider">AI Coach & Mock Room</strong>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Simulate timed campus OA rounds, review solution algorithms, and get instant personalized feedback.
                </p>
              </div>
            </div>
          )}

          {/* Tab Content 2: Faculty */}
          {roleTab === 'teacher' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-in fade-in duration-300">
              <div className="p-4 rounded-2xl bg-[#FFFDF7] border border-[#FEF08A] space-y-2">
                <div className="flex items-center gap-2 text-[#854d0e]">
                  <FileSpreadsheet className="h-4 w-4" />
                  <strong className="text-xs font-bold uppercase tracking-wider">Digital Gradebook</strong>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Automate marks logging, compute statistical bell curves, and export 1-click verified CSV grade sheets.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#EEF2FF] border border-[#BFDBFE] space-y-2">
                <div className="flex items-center gap-2 text-[#2563EB]">
                  <Clock className="h-4 w-4" />
                  <strong className="text-xs font-bold uppercase tracking-wider">Syllabus Pace Tracker</strong>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Dynamic visual pacing bars comparing completed lectures vs university semester timelines.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#EEF2FF] border border-blue-200 space-y-2">
                <div className="flex items-center gap-2 text-[#2563EB]">
                  <Users className="h-4 w-4" />
                  <strong className="text-xs font-bold uppercase tracking-wider">Classroom Vault & Invites</strong>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Distribute verified reference notes, host group study rooms, and send real-time peer invites.
                </p>
              </div>
            </div>
          )}

          {/* Tab Content 3: PhD Scholar */}
          {roleTab === 'phd' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-in fade-in duration-300">
              <div className="p-4 rounded-2xl bg-[#EEF2FF] border border-blue-200 space-y-2">
                <div className="flex items-center gap-2 text-[#2563EB]">
                  <Award className="h-4 w-4" />
                  <strong className="text-xs font-bold uppercase tracking-wider">Publication Tracker</strong>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Manage IEEE, ACM, and Springer manuscript submissions, peer reviews, and camera-ready milestones.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#FFFDF7] border border-[#FEF08A] space-y-2">
                <div className="flex items-center gap-2 text-[#854d0e]">
                  <Laptop className="h-4 w-4" />
                  <strong className="text-xs font-bold uppercase tracking-wider">Collaborative Notebooks</strong>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Real-time multi-cursor shared research notes with code playgrounds, LaTeX, and live socket sync.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#EEF2FF] border border-[#BFDBFE] space-y-2">
                <div className="flex items-center gap-2 text-[#2563EB]">
                  <ShieldCheck className="h-4 w-4" />
                  <strong className="text-xs font-bold uppercase tracking-wider">Thesis Defense Milestones</strong>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Comprehensive roadmap tracking from synopsis approval to final doctoral defense viva.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
