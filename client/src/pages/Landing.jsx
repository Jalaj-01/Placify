import { useState, useRef } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import {
  LayoutDashboard, Code2, BookOpen, Sparkles, Youtube, FolderOpen,
  Timer, Terminal, ArrowRight, ShieldCheck, CheckCircle2, Users,
  Briefcase, School, GraduationCap, Flame, Play, Award, Zap, ChevronRight
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'

// 3D Card Component with interactive tilt physics
function Interactive3DCard({ children, className = '' }) {
  const x = useMotionValue(0)
  const y = useMotionValue(0)

  const mouseXSpring = useSpring(x)
  const mouseYSpring = useSpring(y)

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ['7.5deg', '-7.5deg'])
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ['-7.5deg', '7.5deg'])

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const width = rect.width
    const height = rect.height

    const mouseX = e.clientX - rect.left
    const mouseY = e.clientY - rect.top

    const xPct = mouseX / width - 0.5
    const yPct = mouseY / height - 0.5

    x.set(xPct)
    y.set(yPct)
  }

  const handleMouseLeave = () => {
    x.set(0)
    y.set(0)
  }

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateY,
        rotateX,
        transformStyle: 'preserve-3d',
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

export default function Landing() {
  const { user, signInWithGoogle, loading } = useAuth()
  const navigate = useNavigate()
  const [activeRoleTab, setActiveRoleTab] = useState('student')

  const handleStart = () => {
    if (user) {
      navigate('/dashboard')
    } else {
      signInWithGoogle()
    }
  }

  const features = [
    {
      title: 'Distraction-Free Course Theater',
      description: 'Import YouTube course playlists and write linked notes in a custom theater viewport with zero sidebar recommendations.',
      icon: Youtube,
      color: 'text-red-400 bg-red-500/10 border-red-500/20',
      badge: 'Ad-Free Focus'
    },
    {
      title: 'Interactive Code Playground',
      description: 'Write, debug, and save coding files locally in a sandbox compiler using client-side WebAssembly execution.',
      icon: Terminal,
      color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/25',
      badge: 'Live Runner'
    },
    {
      title: 'Timed Assessment Simulator',
      description: 'Simulate high-pressure online assessment (OA) environments and Pomodoro focus rounds with browser reminders.',
      icon: Timer,
      color: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
      badge: 'OA Timer'
    },
    {
      title: 'Role-Aware AI Coach',
      description: 'Scrape problem statements automatically, generate debug hints, draft lesson plans, and format LaTeX research citations.',
      icon: Sparkles,
      color: 'text-purple-400 bg-purple-500/10 border-purple-500/25',
      badge: 'Gemini Powered'
    },
    {
      title: 'Automated Subject Mastery',
      description: 'Track DSA topics, computer science theory, and aptitude checklists with visual progress charts and radar indices.',
      icon: BookOpen,
      color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
      badge: 'Auto Sync'
    },
    {
      title: 'Resource Library Vault',
      description: 'Upload note screenshots and syllabus PDFs with offline Base64 compression and secure browser blob views.',
      icon: FolderOpen,
      color: 'text-sky-400 bg-sky-500/10 border-sky-500/20',
      badge: 'Offline Storage'
    },
  ]

  return (
    <div className="min-h-screen bg-[#07080e] text-[#f1f1f5] relative overflow-hidden font-sans selection:bg-accent/30 selection:text-white">
      {/* 3D Background Glow Orbs & Grid Overlay */}
      <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-gradient-to-tr from-accent/20 via-purple-600/15 to-transparent rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-[40%] left-[-10%] w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />
      
      {/* Decorative Grid Lines */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

      {/* Header Navigation */}
      <nav className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between border-b border-white/10 relative z-20 backdrop-blur-md bg-[#07080e]/60">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-accent to-purple-600 border border-white/20 flex items-center justify-center shadow-lg shadow-accent/20">
            <Code2 className="h-5 w-5 text-white" />
          </div>
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-base tracking-tight text-white uppercase">Placify</span>
            <span className="px-2 py-0.5 rounded-full bg-accent/20 text-accent-light text-[10px] font-mono font-bold border border-accent/30">
              v2.5
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            size="sm"
            onClick={handleStart}
            disabled={loading}
            className="text-xs px-5 py-2 rounded-xl bg-gradient-to-r from-accent to-purple-600 hover:opacity-95 text-white font-bold transition-all shadow-lg shadow-accent/20 border border-white/20"
          >
            {user ? 'Enter Console' : 'Sign In with Google'}
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto text-center px-6 pt-16 pb-12 relative z-10 space-y-8">
        {/* Animated Badge */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-surface/80 border border-white/15 text-xs text-text-secondary font-semibold backdrop-blur-md shadow-xl"
        >
          <ShieldCheck className="h-4 w-4 text-accent" />
          <span>The Ultimate All-in-One Academic & Placement Command Platform</span>
        </motion.div>

        {/* Hero Title */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="space-y-5"
        >
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.08]">
            Crack your dream placements <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-accent-light via-purple-400 to-emerald-400 bg-clip-text text-transparent">
              without the distraction.
            </span>
          </h1>
          <p className="max-w-3xl mx-auto text-text-secondary text-sm sm:text-lg leading-relaxed font-normal">
            Consolidate your DSA logs, 1v1 peer interviews, course vault, syllabus pace tracker, research grants, and AI coach in one unified cockpit.
          </p>
        </motion.div>

        {/* Hero CTA Button */}
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
            className="flex items-center gap-3 text-sm px-8 py-6 rounded-2xl font-extrabold bg-gradient-to-r from-accent via-purple-600 to-indigo-600 text-white hover:scale-[1.03] active:scale-[0.98] transition-all shadow-2xl shadow-accent/40 border border-white/20"
          >
            {user ? 'Launch Placement Dashboard' : 'Get Started Free with Google'}
            <ArrowRight className="h-5 w-5" />
          </Button>
        </motion.div>
      </section>

      {/* Interactive 3D Mockup Cockpit Window */}
      <section className="max-w-6xl mx-auto px-6 pb-20 relative z-20">
        <Interactive3DCard className="w-full">
          <div className="relative rounded-3xl bg-[#0c0e1a]/90 border border-white/15 p-4 sm:p-6 shadow-2xl backdrop-blur-2xl space-y-6 overflow-hidden">
            {/* Top Bar Window Controls */}
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-red-500/80 inline-block" />
                <span className="h-3 w-3 rounded-full bg-yellow-500/80 inline-block" />
                <span className="h-3 w-3 rounded-full bg-green-500/80 inline-block" />
                <span className="text-xs text-text-muted font-mono ml-2">placify-command-cockpit.v2.5</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-semantic-green/15 text-semantic-green text-[11px] font-mono font-bold border border-semantic-green/30 flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-semantic-green animate-ping" /> Realtime Sync Active
                </span>
              </div>
            </div>

            {/* Mock Dashboard Floating UI Layers */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              {/* Card 1: 1v1 Peer Matcher */}
              <div className="md:col-span-7 p-5 rounded-2xl bg-surface/80 border border-white/10 space-y-3 shadow-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="h-4.5 w-4.5 text-accent" />
                    <span className="font-bold text-text-primary text-xs">1v1 Peer Mock Interview Room</span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-accent/20 text-accent font-mono text-[10px] font-bold">
                    Matched Peer
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-base/80 border border-white/5 space-y-1 text-xs">
                  <p className="font-semibold text-text-primary">Course Schedule II (Graph Topological Sort)</p>
                  <p className="text-[11px] text-text-muted">Role Swap: 45 Mins • Live Scratchpad & JS Compiler</p>
                </div>
                <div className="flex items-center justify-between text-[11px] text-text-muted">
                  <span className="flex items-center gap-1 text-semantic-green font-mono">
                    <CheckCircle2 className="h-3.5 w-3.5" /> 3 Test Cases Passed
                  </span>
                  <span className="text-accent font-mono font-bold">+20 Contribution Pts</span>
                </div>
              </div>

              {/* Card 2: AI Coach Assistant */}
              <div className="md:col-span-5 p-5 rounded-2xl bg-gradient-to-br from-purple-900/20 via-surface/80 to-surface border border-purple-500/30 space-y-3 shadow-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4.5 w-4.5 text-purple-400 animate-pulse" />
                    <span className="font-bold text-text-primary text-xs">Role-Aware AI Coach</span>
                  </div>
                  <span className="text-[10px] text-purple-400 font-bold bg-purple-500/10 px-2 py-0.5 rounded">
                    Active
                  </span>
                </div>
                <p className="text-xs text-text-secondary leading-relaxed">
                  "Found potential infinite loop in Dijkstra priority queue. Consider tracking visited set."
                </p>
                <div className="pt-2 flex items-center justify-between border-t border-white/5 text-[11px]">
                  <span className="text-text-muted">Auto Debug Prompt</span>
                  <span className="text-purple-400 font-semibold">Generate Hints →</span>
                </div>
              </div>

              {/* Card 3: Placement Kanban Pipeline */}
              <div className="md:col-span-12 p-4 rounded-2xl bg-surface/60 border border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-semantic-green/20 text-semantic-green flex items-center justify-center font-bold text-sm">
                    ✓
                  </div>
                  <div>
                    <h4 className="font-bold text-text-primary text-xs">Placed at Google (SDE-1)</h4>
                    <p className="text-[11px] text-text-muted">Application Kanban Stage: Offer Received • ₹45 LPA CTC</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs font-mono">
                  <span className="px-3 py-1 rounded-xl bg-white/5 border border-white/10 text-text-secondary">
                    Wishlist (4)
                  </span>
                  <span className="px-3 py-1 rounded-xl bg-white/5 border border-white/10 text-text-secondary">
                    Interview (2)
                  </span>
                  <span className="px-3 py-1 rounded-xl bg-semantic-green/20 text-semantic-green font-bold border border-semantic-green/30">
                    Offer (1)
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Interactive3DCard>
      </section>

      {/* Role Showcase Tabs */}
      <section className="max-w-6xl mx-auto px-6 pb-20 relative z-10 space-y-8">
        <div className="text-center space-y-2">
          <span className="px-3 py-1 rounded-full bg-accent/15 text-accent text-xs font-bold border border-accent/30">
            Tailored Roles Architecture
          </span>
          <h2 className="text-3xl font-extrabold text-white">Built for Every Academic & Placement Identity</h2>
        </div>

        {/* Tab Buttons */}
        <div className="flex justify-center gap-2 p-1.5 rounded-2xl bg-surface/60 border border-white/10 max-w-xl mx-auto backdrop-blur-md">
          <button
            onClick={() => setActiveRoleTab('student')}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeRoleTab === 'student'
                ? 'bg-accent text-white shadow-lg shadow-accent/25'
                : 'text-text-muted hover:text-text-primary'
            }`}
          >
            <GraduationCap className="h-4 w-4" /> Student Candidate
          </button>
          <button
            onClick={() => setActiveRoleTab('teacher')}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeRoleTab === 'teacher'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/25'
                : 'text-text-muted hover:text-text-primary'
            }`}
          >
            <School className="h-4 w-4" /> Faculty / Mentor
          </button>
          <button
            onClick={() => setActiveRoleTab('phd')}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeRoleTab === 'phd'
                ? 'bg-semantic-green text-white shadow-lg shadow-semantic-green/25'
                : 'text-text-muted hover:text-text-primary'
            }`}
          >
            <BookOpen className="h-4 w-4" /> PhD Scholar
          </button>
        </div>

        {/* Tab Details Content */}
        <div className="p-6 sm:p-8 rounded-3xl bg-surface/70 border border-white/10 backdrop-blur-xl shadow-2xl">
          {activeRoleTab === 'student' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <div className="h-8 w-8 rounded-xl bg-accent/20 text-accent flex items-center justify-center font-bold">1</div>
                <h3 className="font-bold text-text-primary text-sm">Placement Kanban & Calendar</h3>
                <p className="text-xs text-text-secondary leading-relaxed">Visual drive pipeline from Wishlist to Offer with past company interview question handouts.</p>
              </div>
              <div className="space-y-2">
                <div className="h-8 w-8 rounded-xl bg-accent/20 text-accent flex items-center justify-center font-bold">2</div>
                <h3 className="font-bold text-text-primary text-sm">1v1 Peer Mock Matcher</h3>
                <p className="text-xs text-text-secondary leading-relaxed">Pair with peers online for timed DSA and System Design interviews with shared scratchpad execution.</p>
              </div>
              <div className="space-y-2">
                <div className="h-8 w-8 rounded-xl bg-accent/20 text-accent flex items-center justify-center font-bold">3</div>
                <h3 className="font-bold text-text-primary text-sm">Group Study & Co-Watching</h3>
                <p className="text-xs text-text-secondary leading-relaxed">Co-watch YouTube lectures, write parallel notes, and track automated peer contribution scores.</p>
              </div>
            </div>
          )}

          {activeRoleTab === 'teacher' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <div className="h-8 w-8 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold">1</div>
                <h3 className="font-bold text-text-primary text-sm">Recharts Syllabus Pace Tracker</h3>
                <p className="text-xs text-text-secondary leading-relaxed">Visual bar charts comparing planned vs actual module targets per course and section.</p>
              </div>
              <div className="space-y-2">
                <div className="h-8 w-8 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold">2</div>
                <h3 className="font-bold text-text-primary text-sm">Digital Gradebook & 1-Click CSV</h3>
                <p className="text-xs text-text-secondary leading-relaxed">Batch entry for Lab Marks, Mid-Terms, and End-Terms with instant downloadable CSV export.</p>
              </div>
              <div className="space-y-2">
                <div className="h-8 w-8 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold">3</div>
                <h3 className="font-bold text-text-primary text-sm">AI Quiz & Assignment Generator</h3>
                <p className="text-xs text-text-secondary leading-relaxed">Auto-create MCQs, short answers, and code snippets with complete answer keys & grading rules.</p>
              </div>
            </div>
          )}

          {activeRoleTab === 'phd' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <div className="h-8 w-8 rounded-xl bg-semantic-green/20 text-semantic-green flex items-center justify-center font-bold">1</div>
                <h3 className="font-bold text-text-primary text-sm">TA Duty & Invigilation Log</h3>
                <p className="text-xs text-text-secondary leading-relaxed">Track assigned UG lab batches, invigilation exam slots, and submit TA work hours log.</p>
              </div>
              <div className="space-y-2">
                <div className="h-8 w-8 rounded-xl bg-semantic-green/20 text-semantic-green flex items-center justify-center font-bold">2</div>
                <h3 className="font-bold text-text-primary text-sm">Supervisor Sync Logbook</h3>
                <p className="text-xs text-text-secondary leading-relaxed">Timestamped advisor meeting notes, action item checklists, and dissertation progress milestones.</p>
              </div>
              <div className="space-y-2">
                <div className="h-8 w-8 rounded-xl bg-semantic-green/20 text-semantic-green flex items-center justify-center font-bold">3</div>
                <h3 className="font-bold text-text-primary text-sm">Research Grant Expense Disbursal</h3>
                <p className="text-xs text-text-secondary leading-relaxed">Track SERB & DST grant budgets, remaining balances, and log conference reimbursement claims.</p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Refined Feature Deck Cards */}
      <section className="max-w-6xl mx-auto px-6 pb-24 relative z-10 space-y-10">
        <div className="text-center space-y-1.5">
          <h2 className="text-3xl font-extrabold text-white">Full Suite Feature Deck</h2>
          <p className="text-xs text-text-secondary max-w-md mx-auto">Everything you need to accelerate your technical and academic preparation</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feat, idx) => {
            const IconComponent = feat.icon
            return (
              <Interactive3DCard key={idx} className="w-full h-full">
                <div className="h-full p-6 rounded-3xl bg-[#0e111d]/90 border border-white/10 hover:border-accent/50 transition-all space-y-4 shadow-xl backdrop-blur-xl group flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className={`p-3 rounded-2xl border ${feat.color}`}>
                        <IconComponent className="h-5 w-5" />
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-mono text-text-muted group-hover:text-accent-light transition-colors">
                        {feat.badge}
                      </span>
                    </div>
                    <h3 className="font-bold text-text-primary text-base group-hover:text-accent transition-colors">
                      {feat.title}
                    </h3>
                    <p className="text-xs text-text-secondary leading-relaxed">
                      {feat.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs text-accent font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                    <span>Explore Feature</span>
                    <ChevronRight className="h-4 w-4" />
                  </div>
                </div>
              </Interactive3DCard>
            )
          })}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8 bg-[#040508] relative z-20 text-center text-xs text-text-muted">
        <p>© {new Date().getFullYear()} Placify Platform • Prepared with Confidence</p>
      </footer>
    </div>
  )
}
