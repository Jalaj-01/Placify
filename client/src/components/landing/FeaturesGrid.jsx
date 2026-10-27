import { motion } from 'framer-motion'
import {
  GraduationCap, School, BookOpen, Sparkles, Terminal,
  Timer, ChevronRight, CheckCircle2, ArrowRight, Zap,
  Briefcase, Code2, Users, FileText, Share2
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useNavigate } from 'react-router-dom'

export default function FeaturesGrid() {
  const { user, signInWithGoogle } = useAuth()
  const navigate = useNavigate()

  const handleExplore = (route) => {
    if (user) {
      navigate(route)
    } else {
      signInWithGoogle()
    }
  }

  return (
    <section id="features" className="py-16 px-4 sm:px-8 max-w-7xl mx-auto relative z-20 space-y-10">
      {/* Section Header */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <span className="px-3.5 py-1.5 rounded-full bg-[#EEF2FF] border border-blue-200 text-[#2563EB] text-xs font-bold uppercase tracking-wider">
          Unified Core Architecture
        </span>
        <h2 className="text-3xl sm:text-5xl font-extrabold text-[#1E1B4B] tracking-tight">
          Designed for High-Velocity Placement Success
        </h2>
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
          Say goodbye to lost PDFs, scattered WhatsApp groups, and chaotic spreadsheets. Placify brings everything under one clean roof.
        </p>
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
        {/* Card 1: Placement Kanban (Span 7) */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          onClick={() => handleExplore('/applications')}
          className="md:col-span-7 p-6 sm:p-7 rounded-[28px] bg-white/90 border border-white/95 shadow-[0_12px_36px_rgba(31,41,55,0.06)] backdrop-blur-xl hover:shadow-[0_16px_44px_rgba(31,41,55,0.09)] transition-all duration-300 cursor-pointer group flex flex-col justify-between space-y-6"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="p-3 rounded-2xl bg-[#EEF2FF] text-[#2563EB] border border-[#BFDBFE] shadow-sm">
                <Briefcase className="h-6 w-6" />
              </div>
              <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200">
                Placement Pipeline
              </span>
            </div>

            <div className="space-y-1.5">
              <h3 className="text-2xl font-extrabold text-[#1E1B4B] group-hover:text-[#2563EB] transition-colors">
                Visual Placement Kanban & Drive Tracker
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed font-normal">
                Organize all your campus recruitment applications across Wishlist, Online Assessment, Technical Interview, and Offer stages.
              </p>
            </div>

            {/* Mini Kanban Preview */}
            <div className="grid grid-cols-3 gap-2.5 pt-2">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Wishlist</span>
                <p className="text-xs font-bold text-slate-800 m-0">Google SDE</p>
                <span className="text-[9px] text-slate-500">₹45 LPA</span>
              </div>
              <div className="p-3 rounded-xl bg-[#EEF2FF] border border-blue-200 space-y-1">
                <span className="text-[10px] font-bold text-[#2563EB] uppercase">OA / Round 1</span>
                <p className="text-xs font-bold text-slate-800 m-0">Amazon</p>
                <span className="text-[9px] text-slate-500">Tomorrow 4 PM</span>
              </div>
              <div className="p-3 rounded-xl bg-[#EDEFF4] border border-[#FEF08A] space-y-1">
                <span className="text-[10px] font-bold text-[#854d0e] uppercase">Offer Logged</span>
                <p className="text-xs font-bold text-slate-800 m-0">Atlassian</p>
                <span className="text-[9px] text-emerald-700 font-bold">Confirmed 🎉</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-bold text-[#2563EB] group-hover:translate-x-1 transition-transform">
            <span>Explore Placement Kanban</span>
            <ChevronRight className="h-4 w-4" />
          </div>
        </motion.div>

        {/* Card 2: Competency Radar & Problem Log (Span 5) */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          onClick={() => handleExplore('/problems')}
          className="md:col-span-5 p-6 sm:p-7 rounded-[28px] bg-white/90 border border-white/95 shadow-[0_12px_36px_rgba(31,41,55,0.06)] backdrop-blur-xl hover:shadow-[0_16px_44px_rgba(31,41,55,0.09)] transition-all duration-300 cursor-pointer group flex flex-col justify-between space-y-6"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="p-3 rounded-2xl bg-[#EEF2FF] text-[#2563EB] border border-blue-200 shadow-sm">
                <Code2 className="h-6 w-6" />
              </div>
              <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200">
                DSA Mastery
              </span>
            </div>

            <div className="space-y-1.5">
              <h3 className="text-2xl font-extrabold text-[#1E1B4B] group-hover:text-[#2563EB] transition-colors">
                Radar Competency & Coding Log
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed font-normal">
                Log problems across DSA, System Design, OS, and DBMS. Watch your 5-axis competency polygon automatically expand.
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-[#EEF2FF] border border-[#BFDBFE] flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase">Mastery Index</span>
                <p className="text-lg font-black text-slate-900 m-0">88% Ready</p>
              </div>
              <span className="px-2.5 py-1 rounded-lg bg-white text-[#2563EB] font-bold text-xs shadow-sm">
                Top 5% Batch
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-bold text-[#2563EB] group-hover:translate-x-1 transition-transform">
            <span>View Coding Vault</span>
            <ChevronRight className="h-4 w-4" />
          </div>
        </motion.div>

        {/* Card 3: Real-time Notes & Collaboration (Span 5) */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          onClick={() => handleExplore('/notes')}
          className="md:col-span-5 p-6 sm:p-7 rounded-[28px] bg-white/90 border border-white/95 shadow-[0_12px_36px_rgba(31,41,55,0.06)] backdrop-blur-xl hover:shadow-[0_16px_44px_rgba(31,41,55,0.09)] transition-all duration-300 cursor-pointer group flex flex-col justify-between space-y-6"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="p-3 rounded-2xl bg-[#EDEFF4] text-[#CA8A04] border border-[#FEF08A] shadow-sm">
                <FileText className="h-6 w-6" />
              </div>
              <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200">
                Shared Vault
              </span>
            </div>

            <div className="space-y-1.5">
              <h3 className="text-2xl font-extrabold text-[#1E1B4B] group-hover:text-[#2563EB] transition-colors">
                Real-Time Collaborative Notes
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed font-normal">
                Multi-cursor live synced notebooks with rich text, code execution blocks, and instant campus peer invites.
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-[#EDEFF4] border border-[#FEF08A] flex items-center gap-3">
              <div className="flex -space-x-2">
                <div className="w-7 h-7 rounded-full bg-[#2563EB] text-white font-bold text-[10px] flex items-center justify-center border-2 border-white">RV</div>
                <div className="w-7 h-7 rounded-full bg-emerald-500 text-white font-bold text-[10px] flex items-center justify-center border-2 border-white">AG</div>
                <div className="w-7 h-7 rounded-full bg-[#FACC15] text-[#1E1B4B] font-bold text-[10px] flex items-center justify-center border-2 border-white">+3</div>
              </div>
              <span className="text-xs font-bold text-slate-800">5 peers currently in study room</span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-bold text-[#2563EB] group-hover:translate-x-1 transition-transform">
            <span>Open Placify Notes</span>
            <ChevronRight className="h-4 w-4" />
          </div>
        </motion.div>

        {/* Card 4: AI Coach & Timed OA Mock Room (Span 7) */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          onClick={() => handleExplore('/ai-coach')}
          className="md:col-span-7 p-6 sm:p-7 rounded-[28px] bg-white/90 border border-white/95 shadow-[0_12px_36px_rgba(31,41,55,0.06)] backdrop-blur-xl hover:shadow-[0_16px_44px_rgba(31,41,55,0.09)] transition-all duration-300 cursor-pointer group flex flex-col justify-between space-y-6"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="p-3 rounded-2xl bg-[#EDEFF4] text-[#854d0e] border border-[#FEF08A] shadow-sm">
                <Sparkles className="h-6 w-6 text-[#FACC15]" />
              </div>
              <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200">
                AI Intelligence
              </span>
            </div>

            <div className="space-y-1.5">
              <h3 className="text-2xl font-extrabold text-[#1E1B4B] group-hover:text-[#2563EB] transition-colors">
                AI Placement Coach & Mock Simulator
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed font-normal">
                Simulate high-pressure company online assessments. Receive real-time hints, time complexity audits, and behavioral interview coaching.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#1E1B4B] text-white flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-semibold text-slate-200">AI Coach Ready for Mock Round</span>
              </div>
              <span className="px-3 py-1 rounded-xl bg-white/10 text-white font-bold text-[10px] border border-white/20">
                Start Mock Interview
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-bold text-[#2563EB] group-hover:translate-x-1 transition-transform">
            <span>Launch AI Coach</span>
            <ChevronRight className="h-4 w-4" />
          </div>
        </motion.div>
      </div>
    </section>
  )
}
