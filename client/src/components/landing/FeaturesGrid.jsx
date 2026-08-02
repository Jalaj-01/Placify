import { motion } from 'framer-motion'
import {
  GraduationCap, School, BookOpen, Sparkles, Youtube, Terminal,
  Timer, FolderOpen, ChevronRight, CheckCircle2, FileSpreadsheet,
  Clock, ShieldCheck, ArrowRight, Zap, Users, Code2
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
    <section id="features" className="py-20 px-6 max-w-7xl mx-auto relative z-20 space-y-12">
      {/* Header */}
      <div className="text-center space-y-3">
        <span className="px-4 py-1.5 rounded-full bg-accent/15 text-accent-light text-xs font-mono font-bold border border-accent/30 shadow-sm uppercase tracking-wider">
          BENTO BOX ARCHITECTURE
        </span>
        <h2 className="text-3xl sm:text-5xl font-black text-text-primary">
          Designed for High-Velocity Academic Performance
        </h2>
        <p className="text-xs sm:text-base text-text-secondary max-w-xl mx-auto font-medium">
          Integrated toolsets replacing scattered WhatsApp groups, lost PDFs, and manual Excel sheets.
        </p>
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Card 1: Student Placement Command (Span 7) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          onClick={() => handleExplore('/applications')}
          className="md:col-span-7 p-7 rounded-3xl bg-surface/90 border border-border-subtle hover:border-accent/50 transition-all duration-300 shadow-2xl backdrop-blur-2xl cursor-pointer group flex flex-col justify-between space-y-6"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="p-3.5 rounded-2xl bg-accent/15 text-accent border border-accent/30 shadow-sm">
                <GraduationCap className="h-6 w-6" />
              </div>
              <span className="px-3 py-1 rounded-full bg-accent/10 text-accent-light text-xs font-mono font-bold border border-accent/20">
                🎓 Candidate Command Hub
              </span>
            </div>

            <div className="space-y-1.5">
              <h3 className="text-2xl font-black text-text-primary group-hover:text-accent-light transition-colors">
                Unified Placement Kanban & 1v1 Peer Matcher
              </h3>
              <p className="text-xs sm:text-sm text-text-secondary leading-relaxed font-medium">
                Track drives from Wishlist to Offer stage with automated company prep kits, past interview handouts, and live 1v1 peer mock interview matching.
              </p>
            </div>

            {/* Visual Mini Mockup inside Bento Box */}
            <div className="p-4 rounded-2xl bg-base/80 border border-border-subtle space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-text-primary flex items-center gap-2">
                  <Users className="h-4 w-4 text-accent" /> Matched Peer: Rohan Mehta (45m)
                </span>
                <span className="text-semantic-green font-mono font-bold text-[11px]">✓ Passed 3 Tests</span>
              </div>
              <p className="text-text-muted text-[11px]">Course Schedule II (Graph Topological Sort) • Live JS Execution</p>
            </div>
          </div>

          <div className="pt-4 border-t border-border-subtle flex items-center justify-between text-xs text-accent font-bold group-hover:text-accent-light">
            <span>Explore Placement Kanban</span>
            <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </motion.div>

        {/* Card 2: Faculty Vault (Span 5) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          onClick={() => handleExplore('/dashboard')}
          className="md:col-span-5 p-7 rounded-3xl bg-surface/90 border border-border-subtle hover:border-purple-500/50 transition-all duration-300 shadow-2xl backdrop-blur-2xl cursor-pointer group flex flex-col justify-between space-y-6"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="p-3.5 rounded-2xl bg-purple-500/15 text-purple-400 border border-purple-500/30 shadow-sm">
                <School className="h-6 w-6" />
              </div>
              <span className="px-3 py-1 rounded-full bg-purple-500/10 text-purple-300 text-xs font-mono font-bold border border-purple-500/20">
                👨‍🏫 Faculty Vault
              </span>
            </div>

            <div className="space-y-1.5">
              <h3 className="text-2xl font-black text-text-primary group-hover:text-purple-300 transition-colors">
                Automated Course Pace & Gradebook
              </h3>
              <p className="text-xs sm:text-sm text-text-secondary leading-relaxed font-medium">
                Visual Recharts comparing planned vs actual module targets per course and section with 1-click CSV grade export.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-purple-950/20 border border-purple-500/30 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-text-primary">CS301 Data Structures (Sec 3A)</span>
                <span className="text-semantic-green font-mono font-bold">82% Pace</span>
              </div>
              <p className="text-text-muted text-[11px]">Lab Mid-Term & End-Term Grade Vault • Single Click CSV</p>
            </div>
          </div>

          <div className="pt-4 border-t border-border-subtle flex items-center justify-between text-xs text-purple-400 font-bold group-hover:text-purple-300">
            <span>Explore Faculty Console</span>
            <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </motion.div>

        {/* Card 3: PhD Research (Span 5) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          onClick={() => handleExplore('/dashboard')}
          className="md:col-span-5 p-7 rounded-3xl bg-surface/90 border border-border-subtle hover:border-semantic-green/50 transition-all duration-300 shadow-2xl backdrop-blur-2xl cursor-pointer group flex flex-col justify-between space-y-6"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="p-3.5 rounded-2xl bg-semantic-green/15 text-semantic-green border border-semantic-green/30 shadow-sm">
                <BookOpen className="h-6 w-6" />
              </div>
              <span className="px-3 py-1 rounded-full bg-semantic-green/10 text-semantic-green text-xs font-mono font-bold border border-semantic-green/20">
                🔬 PhD Research
              </span>
            </div>

            <div className="space-y-1.5">
              <h3 className="text-2xl font-black text-text-primary group-hover:text-semantic-green transition-colors">
                Supervisor Logbook & Grant Tracker
              </h3>
              <p className="text-xs sm:text-sm text-text-secondary leading-relaxed font-medium">
                Timestamped meeting logbooks, TA lab invigilation slots, manuscript submission pipeline, and SERB/DST grant expense claims.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-base/80 border border-border-subtle space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-text-primary">SERB Grant Budget</span>
                <span className="text-semantic-green font-mono font-bold">₹20.8L Remaining</span>
              </div>
              <p className="text-text-muted text-[11px]">IEEE TPDS Journal (Impact Factor 4.8) • Paper Under Review</p>
            </div>
          </div>

          <div className="pt-4 border-t border-border-subtle flex items-center justify-between text-xs text-semantic-green font-bold">
            <span>Explore PhD Logbook</span>
            <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </motion.div>

        {/* Card 4: Universal AI Coach (Span 7) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          onClick={() => handleExplore('/ai-coach')}
          className="md:col-span-7 p-7 rounded-3xl bg-surface/90 border border-border-subtle hover:border-amber-500/50 transition-all duration-300 shadow-2xl backdrop-blur-2xl cursor-pointer group flex flex-col justify-between space-y-6"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="p-3.5 rounded-2xl bg-amber-500/15 text-amber-400 border border-amber-500/30 shadow-sm">
                <Sparkles className="h-6 w-6 animate-pulse" />
              </div>
              <span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-300 text-xs font-mono font-bold border border-amber-500/20">
                🤖 Universal Gemini AI
              </span>
            </div>

            <div className="space-y-1.5">
              <h3 className="text-2xl font-black text-text-primary group-hover:text-amber-300 transition-colors">
                Role-Aware AI Drawer Assistant
              </h3>
              <p className="text-xs sm:text-sm text-text-secondary leading-relaxed font-medium">
                Scrapes LeetCode/GFG problem URLs for students, generates MCQ quizzes for faculty, and formats LaTeX research citations for PhD scholars.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/30 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-text-primary">Gemini 2.5 Flash Engine</span>
                <span className="text-amber-400 font-mono font-bold">Active Drawer</span>
              </div>
              <p className="text-text-muted text-[11px]">Auto Debug Prompts • Lesson Plan Generator • Citation Formatting</p>
            </div>
          </div>

          <div className="pt-4 border-t border-border-subtle flex items-center justify-between text-xs text-amber-400 font-bold group-hover:text-amber-300">
            <span>Open AI Drawer Assistant</span>
            <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </motion.div>
      </div>
    </section>
  )
}
