import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import {
  Sparkles, Code2, Briefcase, Calendar, FileText, CheckCircle2,
  TrendingUp, ArrowRight, ShieldCheck, Zap, Bot, Star
} from 'lucide-react'

export default function Dashboard3DPreview() {
  const cardRef = useRef(null)
  const [rotX, setRotX] = useState(0)
  const [rotY, setRotY] = useState(0)
  const [isHovered, setIsHovered] = useState(false)
  const [activeTab, setActiveTab] = useState('student') // 'student' | 'placement' | 'ai'

  const handleMouseMove = (e) => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const centerX = rect.width / 2
    const centerY = rect.height / 2
    const rX = -((y - centerY) / centerY) * 7
    const rY = ((x - centerX) / centerX) * 7
    setRotX(rX)
    setRotY(rY)
  }

  const handleMouseLeave = () => {
    setIsHovered(false)
    setRotX(0)
    setRotY(0)
  }

  return (
    <div className="relative w-full max-w-5xl mx-auto py-6 [perspective:1400px]">
      {/* Floating 3D Depth Badges (Top & Bottom Float) */}
      <motion.div
        animate={{ y: [-4, 6, -4], rotate: [-1, 1, -1] }}
        transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
        className="hidden md:flex absolute -top-4 -left-6 z-30 items-center gap-2 px-3.5 py-2 rounded-2xl bg-white/95 border border-white/90 shadow-[0_12px_32px_rgba(31,41,55,0.12)] backdrop-blur-xl text-xs font-bold text-slate-800"
      >
        <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
        <span>12-Day Active Streak 🔥</span>
      </motion.div>

      <motion.div
        animate={{ y: [6, -5, 6], rotate: [1, -1, 1] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
        className="hidden md:flex absolute -bottom-5 -right-6 z-30 items-center gap-2 px-3.5 py-2 rounded-2xl bg-[#20242b] text-white shadow-[0_16px_36px_rgba(0,0,0,0.2)] backdrop-blur-xl text-xs font-bold"
      >
        <Sparkles className="h-4 w-4 text-purple-400" />
        <span>AI Placement Coach Ready ✨</span>
      </motion.div>

      {/* 3D Tilted Glass Card Shell */}
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={handleMouseLeave}
        style={{
          transform: `rotateX(${rotX}deg) rotateY(${rotY}deg) scale3d(${isHovered ? 1.015 : 1}, ${isHovered ? 1.015 : 1}, 1)`,
          transition: isHovered ? 'transform 0.1s ease-out' : 'transform 0.5s cubic-bezier(0.2, 0.8, 0.2, 1)',
        }}
        className="relative rounded-[28px] p-2.5 sm:p-5 bg-white/80 border border-white/95 shadow-[0_20px_60px_rgba(31,41,55,0.08),0_2px_8px_rgba(31,41,55,0.04)] backdrop-blur-2xl transition-shadow duration-300"
      >
        {/* Subtle Glare Sheen Overlay */}
        <div
          className="pointer-events-none absolute inset-0 rounded-[28px] opacity-40 mix-blend-overlay transition-opacity duration-300"
          style={{
            background: `radial-gradient(circle 350px at ${50 + rotY * 3}% ${50 - rotX * 3}%, rgba(255,255,255,0.9), transparent 70%)`,
          }}
        />

        {/* Mock Window Top Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 mb-3 border-b border-slate-200/70 px-2">
          {/* Brand mark & title */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#20242b] text-white flex items-center justify-center font-black text-xs shadow-md">
              P
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm text-slate-900 tracking-tight">Placify Student Suite</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                  Live View
                </span>
              </div>
            </div>
          </div>

          {/* Quick tab preview selector */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100/80 border border-slate-200 text-xs">
            <button
              onClick={() => setActiveTab('student')}
              className={`px-3 py-1 rounded-lg font-bold transition-all ${
                activeTab === 'student'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('placement')}
              className={`px-3 py-1 rounded-lg font-bold transition-all ${
                activeTab === 'placement'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Placement Kanban
            </button>
            <button
              onClick={() => setActiveTab('ai')}
              className={`px-3 py-1 rounded-lg font-bold transition-all ${
                activeTab === 'ai'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              AI Coach
            </button>
          </div>
        </div>

        {/* Tab 1: Student Overview (Screenshot faithful match) */}
        {activeTab === 'student' && (
          <div className="space-y-4 text-left p-1">
            {/* Header: Welcome & Top Navigation Pills */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <p className="text-[11px] font-bold text-slate-400 tracking-wide uppercase m-0">Welcome Back</p>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight m-0">
                  Rahul Verma
                </h3>
              </div>

              {/* Floating Pill Nav Bar */}
              <div className="hidden sm:flex items-center gap-1.5 p-1 rounded-2xl bg-white/90 border border-slate-200/90 shadow-sm text-xs font-semibold text-slate-600">
                <span className="px-3 py-1.5 rounded-xl bg-slate-100/90 text-slate-900 font-bold">Classroom Vault</span>
                <span className="px-3 py-1.5 rounded-xl hover:text-slate-900">Mock Timer</span>
                <span className="px-3 py-1.5 rounded-xl hover:text-slate-900">Course Vault</span>
                <span className="px-3 py-1.5 rounded-xl hover:text-slate-900">Problem Log</span>
              </div>
            </div>

            {/* Top Grid: Problems Logged + Metric Tiles + Active Streak Calendar */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5">
              {/* Left Column: Problems & Tiles (7 cols) */}
              <div className="lg:col-span-7 space-y-3.5">
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                  {/* Gauge Card (7 cols) */}
                  <div className="sm:col-span-7 rounded-2xl p-4 bg-white/90 border border-slate-200/90 shadow-sm flex flex-col justify-between">
                    <div>
                      <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block">
                        Your Activity at a Glance
                      </span>
                      <h4 className="text-sm font-black text-slate-800 m-0">Problems Logged</h4>
                    </div>

                    <div className="relative my-3 h-28 rounded-xl bg-[#dfe0fb] flex items-center justify-center overflow-hidden">
                      <div className="w-24 h-24 rounded-full border-4 border-[#c5c8e8] border-t-[#8b7cf6] flex flex-col items-center justify-center">
                        <span className="text-[10px] text-slate-500 font-medium">Logged</span>
                        <strong className="text-2xl font-black text-slate-900 leading-none">24</strong>
                        <span className="text-[9px] text-slate-500">Problems</span>
                      </div>
                    </div>
                  </div>

                  {/* 2 Pastel Metric Tiles (5 cols) */}
                  <div className="sm:col-span-5 flex flex-col gap-3">
                    {/* Topics Mastered (Soft Sky Blue) */}
                    <div className="rounded-2xl p-3.5 bg-[#d9eff7] border border-[#c8e5ee] flex flex-col justify-between flex-1">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-white/70 flex items-center justify-center text-[#8174e8]">
                          <Code2 className="h-4 w-4" />
                        </div>
                        <span className="text-[10px] font-bold text-slate-800 uppercase tracking-wide">
                          Topics Mastered
                        </span>
                      </div>
                      <div className="mt-2">
                        <span className="text-2xl font-black text-slate-900 leading-none">8</span>
                        <span className="text-xs text-slate-500 font-bold ml-1">/ 14</span>
                        <p className="text-[10px] text-slate-600 m-0 mt-0.5">Graphs, Trees, Dynamic Prog</p>
                      </div>
                    </div>

                    {/* Active Job Drives (Soft Mint Green) */}
                    <div className="rounded-2xl p-3.5 bg-[#e4f5d7] border border-[#d4eac5] flex flex-col justify-between flex-1">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-white/70 flex items-center justify-center text-[#5a8c4b]">
                          <Briefcase className="h-4 w-4" />
                        </div>
                        <span className="text-[10px] font-bold text-slate-800 uppercase tracking-wide">
                          Active Job Drives
                        </span>
                      </div>
                      <div className="mt-2">
                        <span className="text-2xl font-black text-slate-900 leading-none">5</span>
                        <p className="text-[10px] text-slate-600 m-0 mt-0.5">In wishlist, interview & OA stages</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Daily Active Streak Calendar (5 cols) */}
              <div className="lg:col-span-5 rounded-2xl p-4 bg-white/90 border border-slate-200/90 shadow-sm flex flex-col justify-between">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                  <div>
                    <h4 className="text-sm font-black text-slate-900 m-0">Daily Active Streak</h4>
                    <span className="text-[11px] text-slate-500">October 2026</span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                    This month
                  </span>
                </div>

                {/* Calendar Days grid */}
                <div className="grid grid-cols-7 gap-1 text-center text-[10px] my-1">
                  {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                    <span key={i} className="text-slate-400 font-bold">{d}</span>
                  ))}
                  {[...Array(31)].map((_, idx) => {
                    const day = idx + 1
                    const isToday = day === 24
                    const isStreak = [14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24].includes(day)
                    return (
                      <div
                        key={idx}
                        className={`h-6 w-6 mx-auto rounded-full flex items-center justify-center font-bold text-[10px] transition-all ${
                          isToday
                            ? 'bg-[#37b878] text-white shadow-sm'
                            : isStreak
                            ? 'text-slate-800 bg-purple-50 font-extrabold'
                            : 'text-slate-400'
                        }`}
                      >
                        {day}
                      </div>
                    )
                  })}
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-slate-100 text-[10px] text-slate-500">
                  <span className="h-2 w-2 rounded-full bg-[#37b878]" />
                  <span>Active streak day</span>
                </div>
              </div>
            </div>

            {/* Bottom Row: Sticky Note + Competency Radar */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3.5">
              {/* Sticky Notes (4 cols) */}
              <div className="sm:col-span-4 rounded-2xl p-3.5 bg-white/90 border border-slate-200/90 shadow-sm flex flex-col justify-between">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                  <div className="w-6 h-6 rounded-lg bg-[#fff8df] border border-[#f0df9d] flex items-center justify-center text-[#c79d09]">
                    <FileText className="h-3.5 w-3.5" />
                  </div>
                  <span className="text-[10px] font-black text-slate-800 uppercase tracking-wide">Sticky Notes</span>
                </div>
                <div className="p-2.5 my-2 rounded-xl bg-[#fff8df] border border-[#f0df9d] text-left">
                  <strong className="text-[11px] font-bold text-slate-900 block">Amazon System Design</strong>
                  <span className="text-[10px] text-slate-600 line-clamp-2">Review LRU Cache and consistent hashing before 4 PM interview.</span>
                </div>
                <span className="text-[9px] text-slate-400 font-semibold">1 pinned note</span>
              </div>

              {/* Competency Map Radar (8 cols) */}
              <div className="sm:col-span-8 rounded-2xl p-3.5 bg-white/90 border border-slate-200/90 shadow-sm flex flex-col justify-between">
                <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="text-[#8174e8] font-black">🎖️</span>
                    <h4 className="text-xs font-black text-slate-800 m-0">Competency Map</h4>
                  </div>
                  <span className="text-[10px] font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full">
                    88% Placement Ready
                  </span>
                </div>

                <div className="flex items-center justify-center py-1">
                  <svg viewBox="0 0 300 120" className="w-full max-w-[280px] h-24 overflow-visible">
                    {/* Pentagon webs */}
                    <polygon points="150,15 220,40 195,100 105,100 80,40" fill="none" stroke="#e2e8f0" strokeWidth="1" />
                    <polygon points="150,35 195,50 180,85 120,85 105,50" fill="none" stroke="#e2e8f0" strokeWidth="1" />
                    {/* Filled Radar Area */}
                    <polygon points="150,22 210,44 190,92 110,88 88,48" fill="#8b7cf6" fillOpacity="0.22" stroke="#8174e8" strokeWidth="2" />
                    {/* Axis Labels */}
                    <text x="150" y="8" textAnchor="middle" fill="#64748b" fontSize="9" fontWeight="bold">DSA</text>
                    <text x="230" y="42" textAnchor="start" fill="#64748b" fontSize="9" fontWeight="bold">OS</text>
                    <text x="202" y="112" textAnchor="start" fill="#64748b" fontSize="9" fontWeight="bold">DBMS</text>
                    <text x="98" y="112" textAnchor="end" fill="#64748b" fontSize="9" fontWeight="bold">OOPS</text>
                    <text x="70" y="42" textAnchor="end" fill="#64748b" fontSize="9" fontWeight="bold">Aptitude</text>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Placement Kanban Preview */}
        {activeTab === 'placement' && (
          <div className="space-y-3 p-2 text-left animate-in fade-in duration-200">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <span className="text-xs font-bold text-slate-800">Live Campus Placement Pipeline (12 Applications)</span>
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700">Auto-synced</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Wishlist (4)</span>
                <div className="p-2.5 rounded-xl bg-white border border-slate-200 shadow-sm text-xs space-y-1">
                  <strong className="text-slate-900 block font-bold">Google</strong>
                  <p className="text-[11px] text-slate-500 m-0">Software Engineer 1 • ₹45 LPA</p>
                </div>
              </div>
              <div className="p-3 rounded-2xl bg-indigo-50/50 border border-indigo-200/60 space-y-2">
                <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider block">OA / Interviews (3)</span>
                <div className="p-2.5 rounded-xl bg-white border border-indigo-200 shadow-sm text-xs space-y-1">
                  <strong className="text-indigo-950 block font-bold">Microsoft</strong>
                  <p className="text-[11px] text-indigo-600 m-0">Technical Interview Rd 2 • Tomorrow</p>
                </div>
              </div>
              <div className="p-3 rounded-2xl bg-emerald-50/50 border border-emerald-200/60 space-y-2">
                <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">Offers Confirmed 🎉</span>
                <div className="p-2.5 rounded-xl bg-white border border-emerald-300 shadow-sm text-xs space-y-1">
                  <strong className="text-emerald-950 block font-bold">Atlassian</strong>
                  <p className="text-[11px] text-emerald-700 font-semibold m-0">SDE Offer Confirmed • ₹56 LPA</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: AI Placement Coach Preview */}
        {activeTab === 'ai' && (
          <div className="space-y-3 p-3 text-left animate-in fade-in duration-200">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
              <div className="w-6 h-6 rounded-lg bg-slate-900 text-purple-300 flex items-center justify-center">
                <Bot className="h-3.5 w-3.5" />
              </div>
              <span className="text-xs font-extrabold text-slate-900">AI Placement Coach & Mock Evaluator</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
              <p className="text-slate-700 leading-relaxed m-0 font-medium">
                "Based on your recent Amazon OA simulation, your algorithmic complexity is optimal (O(N log N)), but check edge cases where array input size is 0. Would you like a 10-minute targeted mock round?"
              </p>
              <div className="flex items-center gap-2 pt-1">
                <span className="px-2.5 py-1 rounded-lg bg-slate-900 text-white font-bold text-[10px]">Start 10m Mock</span>
                <span className="px-2.5 py-1 rounded-lg bg-white border border-slate-300 text-slate-700 font-bold text-[10px]">Review Solution Code</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
