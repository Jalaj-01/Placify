import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  ArrowRight, Play, Sparkles, ShieldCheck, CheckCircle2, Users,
  School, GraduationCap, BookOpen, Briefcase, Code2, Award, Zap,
  X, ExternalLink, Download, FileSpreadsheet, Clock
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'

export default function Hero() {
  const { user, signInWithGoogle, loading } = useAuth()
  const navigate = useNavigate()
  const [heroTab, setHeroTab] = useState('student') // 'student' | 'teacher' | 'phd'
  const [showVideoModal, setShowVideoModal] = useState(false)

  const handleStart = () => {
    if (user) {
      navigate('/dashboard')
    } else {
      signInWithGoogle()
    }
  }

  return (
    <section className="relative pt-12 pb-20 px-6 max-w-7xl mx-auto z-20">
      <div className="text-center space-y-8 max-w-5xl mx-auto">
        {/* Top Radar Ping Badge */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-accent/10 border border-accent/30 text-xs font-bold text-accent-light backdrop-blur-xl shadow-xl shadow-accent/10"
        >
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-accent" />
          </span>
          <span>✨ The Academic & Placement OS for Modern Universities</span>
        </motion.div>

        {/* Headline */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="space-y-6"
        >
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-text-primary leading-[1.05]">
            One Platform. <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-accent via-cyan-400 to-emerald-400 bg-clip-text text-transparent drop-shadow-md">
              Three Academic Superpowers.
            </span>
          </h1>

          <p className="max-w-3xl mx-auto text-text-secondary text-base sm:text-xl leading-relaxed font-medium">
            Streamline placement drives, manage dynamic course pace with AI, and track PhD research pipelines — all in one unified, friction-free workspace.
          </p>
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2"
        >
          <Button
            size="lg"
            onClick={handleStart}
            disabled={loading}
            className="flex items-center gap-3 text-base px-9 py-6 rounded-2xl font-black bg-gradient-to-r from-accent via-indigo-600 to-cyan-500 text-white hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-accent/40 border border-white/20"
          >
            <span>{user ? 'Launch Placify Console' : 'Launch Placify Free'}</span>
            <ArrowRight className="h-5 w-5" />
          </Button>

          <Button
            size="lg"
            variant="outline"
            onClick={() => setShowVideoModal(true)}
            className="flex items-center gap-3 text-base px-8 py-6 rounded-2xl font-bold bg-surface/80 border border-border-subtle hover:border-accent/50 text-text-primary transition-all shadow-lg"
          >
            <div className="h-7 w-7 rounded-full bg-accent/20 flex items-center justify-center text-accent">
              <Play className="h-3.5 w-3.5 fill-current ml-0.5" />
            </div>
            <span>Watch 2-Min Interactive Tour</span>
          </Button>
        </motion.div>
      </div>

      {/* 🌟 UNIQUE HERO COMPONENT — Interactive Live Role Sandbox */}
      <motion.div
        id="role-sandbox"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.3 }}
        className="mt-16 max-w-6xl mx-auto"
      >
        <div className="rounded-3xl bg-surface/90 border border-border-subtle/80 p-4 sm:p-7 shadow-2xl backdrop-blur-2xl space-y-6 overflow-hidden">
          {/* Top Window Header with Tab Switcher */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-4 border-b border-border-subtle/60">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-red-500/80 inline-block" />
              <span className="h-3 w-3 rounded-full bg-yellow-500/80 inline-block" />
              <span className="h-3 w-3 rounded-full bg-green-500/80 inline-block" />
              <span className="text-xs text-text-muted font-mono ml-2 font-bold">placify-interactive-sandbox.v2.5</span>
            </div>

            {/* Sandbox Role Tabs */}
            <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-base border border-border-subtle">
              <button
                onClick={() => setHeroTab('student')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                  heroTab === 'student'
                    ? 'bg-accent text-white shadow-lg shadow-accent/25'
                    : 'text-text-muted hover:text-text-primary'
                }`}
              >
                <GraduationCap className="h-4 w-4" /> 🎓 Student Candidate
              </button>
              <button
                onClick={() => setHeroTab('teacher')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                  heroTab === 'teacher'
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/25'
                    : 'text-text-muted hover:text-text-primary'
                }`}
              >
                <School className="h-4 w-4" /> 👨‍🏫 Faculty / Mentor
              </button>
              <button
                onClick={() => setHeroTab('phd')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                  heroTab === 'phd'
                    ? 'bg-semantic-green text-white shadow-lg shadow-semantic-green/25'
                    : 'text-text-muted hover:text-text-primary'
                }`}
              >
                <BookOpen className="h-4 w-4" /> 🔬 PhD Scholar
              </button>
            </div>
          </div>

          {/* Dynamic Sandbox UI View */}
          <div className="min-h-[320px] transition-all">
            {/* 🎓 Student Sandbox View */}
            {heroTab === 'student' && (
              <div className="space-y-4 animate-in fade-in duration-300">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-4.5 w-4.5 text-accent" />
                    <span className="font-bold text-text-primary text-sm">Placement Drives Kanban</span>
                  </div>
                  <span className="text-xs text-accent font-mono font-bold bg-accent/15 px-3 py-1 rounded-full border border-accent/30">
                    Live Drive Applications (6)
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Column 1: Wishlist */}
                  <div className="p-4 rounded-2xl bg-base/80 border border-border-subtle space-y-3">
                    <div className="flex items-center justify-between text-xs font-bold text-text-secondary">
                      <span>Wishlist Stage</span>
                      <span className="h-2 w-2 rounded-full bg-semantic-yellow" />
                    </div>
                    <div className="p-3 rounded-xl bg-surface border border-border-subtle space-y-1 text-xs">
                      <p className="font-bold text-text-primary">Google (SDE-1)</p>
                      <p className="text-[11px] text-text-muted">CTC: ₹45 LPA • Campus OA</p>
                    </div>
                    <div className="p-3 rounded-xl bg-surface border border-border-subtle space-y-1 text-xs">
                      <p className="font-bold text-text-primary">Microsoft (SE)</p>
                      <p className="text-[11px] text-text-muted">CTC: ₹51 LPA • Referrals</p>
                    </div>
                  </div>

                  {/* Column 2: Interview */}
                  <div className="p-4 rounded-2xl bg-base/80 border border-border-subtle space-y-3">
                    <div className="flex items-center justify-between text-xs font-bold text-text-secondary">
                      <span>Interview Round</span>
                      <span className="h-2 w-2 rounded-full bg-accent" />
                    </div>
                    <div className="p-3 rounded-xl bg-accent/10 border border-accent/30 space-y-1 text-xs">
                      <div className="flex items-center justify-between">
                        <p className="font-bold text-accent-light">Amazon (SDE)</p>
                        <span className="text-[10px] bg-accent/20 px-1.5 py-0.5 rounded font-mono font-bold text-accent">Tech R2</span>
                      </div>
                      <p className="text-[11px] text-text-muted">Round 2 Scheduled: Tomorrow 4:00 PM</p>
                    </div>
                  </div>

                  {/* Column 3: Offer Received */}
                  <div className="p-4 rounded-2xl bg-base/80 border border-border-subtle space-y-3">
                    <div className="flex items-center justify-between text-xs font-bold text-text-secondary">
                      <span>Offer Logged 🎉</span>
                      <span className="h-2 w-2 rounded-full bg-semantic-green" />
                    </div>
                    <div className="p-3.5 rounded-xl bg-semantic-green/10 border border-semantic-green/40 space-y-1 text-xs">
                      <p className="font-extrabold text-semantic-green text-sm">Atlassian (Product Dev)</p>
                      <p className="text-[11px] text-text-primary font-bold">Offer Confirmed • CTC ₹56 LPA</p>
                    </div>
                  </div>
                </div>

                {/* Peer Matcher Bar */}
                <div className="p-4 rounded-2xl bg-surface border border-accent/30 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-xl bg-accent/20 text-accent flex items-center justify-center font-bold">
                      ⚡
                    </div>
                    <div>
                      <p className="font-bold text-text-primary">1v1 Peer Mock Interview Room Active</p>
                      <p className="text-text-muted text-[11px]">Matched with Rohan Mehta (45 Mins) • Shared Code Sandbox</p>
                    </div>
                  </div>
                  <Button size="sm" onClick={handleStart} className="text-xs bg-accent text-white font-bold h-8">
                    Launch Peer Matcher →
                  </Button>
                </div>
              </div>
            )}

            {/* 👨‍🏫 Faculty Sandbox View */}
            {heroTab === 'teacher' && (
              <div className="space-y-4 animate-in fade-in duration-300">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <School className="h-4.5 w-4.5 text-purple-400" />
                    <span className="font-bold text-text-primary text-sm">Course Syllabus Pace & Digital Gradebook</span>
                  </div>
                  <span className="text-xs text-purple-300 font-mono font-bold bg-purple-500/15 px-3 py-1 rounded-full border border-purple-500/30">
                    Faculty Workspace
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Course Pace Progress */}
                  <div className="p-5 rounded-2xl bg-base/80 border border-border-subtle space-y-3">
                    <h4 className="font-bold text-text-primary text-xs flex items-center justify-between">
                      <span>CS301 Data Structures (Sec 3A)</span>
                      <span className="text-semantic-green font-mono">82% Completed</span>
                    </h4>
                    <div className="w-full bg-hover h-3 rounded-full overflow-hidden p-0.5 border border-border-subtle">
                      <div className="bg-gradient-to-r from-purple-600 to-accent h-full rounded-full w-[82%]" />
                    </div>
                    <p className="text-text-muted text-xs">Pace Target: Ahead of Planned Module Schedule (+2 Days)</p>
                  </div>

                  {/* AI Quiz Generator Box */}
                  <div className="p-5 rounded-2xl bg-purple-950/20 border border-purple-500/30 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-text-primary text-xs flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-purple-400" /> AI Assignment & MCQ Generator
                      </span>
                      <span className="text-[10px] text-purple-400 font-bold bg-purple-500/20 px-2 py-0.5 rounded">
                        1-Click
                      </span>
                    </div>
                    <p className="text-xs text-text-secondary leading-relaxed">
                      "Generated 5 MCQs on Graph Shortest Path (Dijkstra vs Bellman-Ford) with complete answer key."
                    </p>
                  </div>
                </div>

                {/* Digital Grade Vault Exporter Bar */}
                <div className="p-4 rounded-2xl bg-surface border border-purple-500/30 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3">
                    <FileSpreadsheet className="h-5 w-5 text-purple-400" />
                    <div>
                      <p className="font-bold text-text-primary">Digital Gradebook & CSV Exporter</p>
                      <p className="text-text-muted text-[11px]">Lab Mid-Term & End-Term Grades Vault • Single Click CSV</p>
                    </div>
                  </div>
                  <Button size="sm" onClick={handleStart} className="text-xs bg-purple-600 text-white font-bold h-8">
                    Open Gradebook →
                  </Button>
                </div>
              </div>
            )}

            {/* 🔬 PhD Scholar Sandbox View */}
            {heroTab === 'phd' && (
              <div className="space-y-4 animate-in fade-in duration-300">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4.5 w-4.5 text-semantic-green" />
                    <span className="font-bold text-text-primary text-sm">Supervisor Sync & Grant Pipeline</span>
                  </div>
                  <span className="text-xs text-semantic-green font-mono font-bold bg-semantic-green/15 px-3 py-1 rounded-full border border-semantic-green/30">
                    PhD Research Scholar
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Supervisor Log */}
                  <div className="p-4 rounded-2xl bg-base/80 border border-border-subtle space-y-2 text-xs">
                    <p className="font-bold text-text-primary">Supervisor Meeting Logbook</p>
                    <p className="text-text-muted text-[11px]">Advisor: Dr. A. Sharma • Meeting Notes Logged</p>
                    <span className="inline-block px-2 py-0.5 rounded bg-semantic-green/20 text-semantic-green font-mono font-bold text-[10px]">
                      Action Items Verified
                    </span>
                  </div>

                  {/* TA Duty Tracker */}
                  <div className="p-4 rounded-2xl bg-base/80 border border-border-subtle space-y-2 text-xs">
                    <p className="font-bold text-text-primary">TA Lab Invigilation Slot</p>
                    <p className="text-text-muted text-[11px]">Assigned UG Lab B1 • 3 Hours Logged</p>
                    <span className="inline-block px-2 py-0.5 rounded bg-accent/20 text-accent-light font-mono font-bold text-[10px]">
                      Slot Confirmed
                    </span>
                  </div>

                  {/* SERB Grant Expense */}
                  <div className="p-4 rounded-2xl bg-base/80 border border-border-subtle space-y-2 text-xs">
                    <p className="font-bold text-text-primary">SERB Grant Budget</p>
                    <p className="text-text-muted text-[11px]">Total Balance: ₹20.8 Lakhs Remaining</p>
                    <span className="inline-block px-2 py-0.5 rounded bg-purple-500/20 text-purple-400 font-mono font-bold text-[10px]">
                      Conference Claim Approved
                    </span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-surface border border-semantic-green/30 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-semantic-green" />
                    <div>
                      <p className="font-bold text-text-primary">Research Manuscript Publication Pipeline</p>
                      <p className="text-text-muted text-[11px]">IEEE TPDS Journal (Impact Factor 4.8) • Under Peer Review</p>
                    </div>
                  </div>
                  <Button size="sm" onClick={handleStart} className="text-xs bg-semantic-green text-white font-bold h-8">
                    Open Research Vault →
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Interactive Tour Video Modal */}
      {showVideoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-4xl rounded-3xl bg-[#0c0e1a] border border-white/20 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <Play className="h-4 w-4 text-accent fill-current" /> Placify 2-Minute Platform Walkthrough
              </h3>
              <button
                onClick={() => setShowVideoModal(false)}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="aspect-video w-full rounded-2xl overflow-hidden bg-black flex items-center justify-center border border-white/10">
              <iframe
                className="w-full h-full"
                src="https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?autoplay=1"
                title="Placify Tour"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
