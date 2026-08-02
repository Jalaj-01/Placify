import { useState, useEffect, useRef } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import {
  Code2, BookOpen, Sparkles, Youtube, FolderOpen, Timer, Terminal,
  ArrowRight, ShieldCheck, CheckCircle2, Users, School,
  GraduationCap, Zap, ChevronRight, Sparkle, Flame, Award, Layers
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'

// 3D Canvas Particle Network with WebGL 3D Perspective Projection
function Canvas3DBackground() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let animationFrameId
    let width = (canvas.width = window.innerWidth)
    let height = (canvas.height = window.innerHeight)

    const handleResize = () => {
      width = canvas.width = window.innerWidth
      height = canvas.height = window.innerHeight
    }
    window.addEventListener('resize', handleResize)

    // Create 3D Particles in a rotating sphere/mesh
    const particleCount = 70
    const particles = []
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: (Math.random() - 0.5) * width * 1.5,
        y: (Math.random() - 0.5) * height * 1.5,
        z: Math.random() * 800 - 400,
        radius: Math.random() * 2.5 + 1.5,
        color: ['#06b6d4', '#8b5cf6', '#d946ef', '#10b981'][Math.floor(Math.random() * 4)],
        vx: (Math.random() - 0.5) * 0.6,
        vy: (Math.random() - 0.5) * 0.6,
        vz: (Math.random() - 0.5) * 0.6,
      })
    }

    let angleX = 0.001
    let angleY = 0.0015

    const render = () => {
      ctx.clearRect(0, 0, width, height)
      const cx = width / 2
      const cy = height / 2
      const focalLength = 400

      // Rotate and update particles
      particles.forEach((p) => {
        p.x += p.vx
        p.y += p.vy
        p.z += p.vz

        if (p.x < -width) p.x = width
        if (p.x > width) p.x = -width
        if (p.y < -height) p.y = height
        if (p.y > height) p.y = -height
        if (p.z < -400) p.z = 400
        if (p.z > 400) p.z = -400

        // 3D rotation math
        const cosX = Math.cos(angleX)
        const sinX = Math.sin(angleX)
        const cosY = Math.cos(angleY)
        const sinY = Math.sin(angleY)

        let y1 = p.y * cosX - p.z * sinX
        let z1 = p.z * cosX + p.y * sinX

        let x2 = p.x * cosY + z1 * sinY
        let z2 = z1 * cosY - p.x * sinY

        p.x = x2
        p.y = y1
        p.z = z2

        // Perspective scale projection
        const scale = focalLength / (focalLength + p.z + 500)
        const projectedX = p.x * scale + cx
        const projectedY = p.y * scale + cy

        if (scale > 0) {
          ctx.beginPath()
          ctx.arc(projectedX, projectedY, Math.max(1, p.radius * scale * 1.5), 0, Math.PI * 2)
          ctx.fillStyle = p.color
          ctx.shadowBlur = 15
          ctx.shadowColor = p.color
          ctx.globalAlpha = Math.min(1, Math.max(0.2, scale * 0.8))
          ctx.fill()
        }
      })

      // Draw connecting 3D laser lines between nearby particles
      for (let i = 0; i < particleCount; i++) {
        for (let j = i + 1; j < particleCount; j++) {
          const p1 = particles[i]
          const p2 = particles[j]
          const dx = p1.x - p2.x
          const dy = p1.y - p2.y
          const dz = p1.z - p2.z
          const dist = Math.sqrt(dx * dx + dy * dy + dz * dz)

          if (dist < 180) {
            const scale1 = focalLength / (focalLength + p1.z + 500)
            const scale2 = focalLength / (focalLength + p2.z + 500)

            const x1 = p1.x * scale1 + cx
            const y1 = p1.y * scale1 + cy
            const x2 = p2.x * scale2 + cx
            const y2 = p2.y * scale2 + cy

            ctx.beginPath()
            ctx.moveTo(x1, y1)
            ctx.lineTo(x2, y2)
            ctx.strokeStyle = '#8b5cf6'
            ctx.globalAlpha = (1 - dist / 180) * 0.25
            ctx.lineWidth = 1
            ctx.stroke()
          }
        }
      }

      animationFrameId = requestAnimationFrame(render)
    }

    render()

    return () => {
      window.removeEventListener('resize', handleResize)
      cancelAnimationFrame(animationFrameId)
    }
  }, [])

  return <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-0" />
}

// 3D Card with interactive tilt physics
function InteractiveCard3D({ children, className = '', onClick }) {
  const x = useMotionValue(0)
  const y = useMotionValue(0)

  const mouseXSpring = useSpring(x, { stiffness: 400, damping: 25 })
  const mouseYSpring = useSpring(y, { stiffness: 400, damping: 25 })

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ['12deg', '-12deg'])
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ['-12deg', '12deg'])

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const xPct = (e.clientX - rect.left) / rect.width - 0.5
    const yPct = (e.clientY - rect.top) / rect.height - 0.5
    x.set(xPct)
    y.set(yPct)
  }

  const handleMouseLeave = () => {
    x.set(0)
    y.set(0)
  }

  return (
    <motion.div
      onClick={onClick}
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

  const handleExploreFeature = (targetRoute) => {
    if (user) {
      navigate(targetRoute)
    } else {
      signInWithGoogle()
    }
  }

  const features = [
    {
      title: 'Distraction-Free Course Theater',
      description: 'Import YouTube course playlists and write linked notes in a custom theater viewport with zero sidebar recommendations.',
      icon: Youtube,
      color: 'text-red-400 bg-red-500/20 border-red-500/40 shadow-red-500/20',
      badge: 'Ad-Free Theater',
      route: '/courses'
    },
    {
      title: 'Interactive Code Playground',
      description: 'Write, debug, and save coding files locally in a sandbox compiler using client-side WebAssembly execution.',
      icon: Terminal,
      color: 'text-cyan-400 bg-cyan-500/20 border-cyan-500/40 shadow-cyan-500/20',
      badge: 'Wasm Compiler',
      route: '/playground'
    },
    {
      title: 'Timed Assessment Simulator',
      description: 'Simulate high-pressure online assessment (OA) environments and Pomodoro focus rounds with browser reminders.',
      icon: Timer,
      color: 'text-amber-400 bg-amber-500/20 border-amber-500/40 shadow-amber-500/20',
      badge: 'OA Timer',
      route: '/dashboard'
    },
    {
      title: 'Role-Aware AI Coach',
      description: 'Scrape problem statements automatically, generate debug hints, draft lesson plans, and format LaTeX research citations.',
      icon: Sparkles,
      color: 'text-purple-400 bg-purple-500/20 border-purple-500/40 shadow-purple-500/20',
      badge: 'Gemini AI',
      route: '/ai-coach'
    },
    {
      title: 'Automated Subject Mastery',
      description: 'Track DSA topics, computer science theory, and aptitude checklists with visual progress charts and radar indices.',
      icon: BookOpen,
      color: 'text-emerald-400 bg-emerald-500/20 border-emerald-500/40 shadow-emerald-500/20',
      badge: 'Auto Mastery',
      route: '/topics'
    },
    {
      title: 'Resource Library Vault',
      description: 'Upload note screenshots and syllabus PDFs with offline Base64 compression and secure browser blob views.',
      icon: FolderOpen,
      color: 'text-sky-400 bg-sky-500/20 border-sky-500/40 shadow-sky-500/20',
      badge: 'Offline Blob',
      route: '/library'
    },
  ]

  return (
    <div className="min-h-screen bg-[#060212] text-[#f8fafc] relative overflow-hidden font-sans selection:bg-cyan-500/30 selection:text-white">
      {/* 3D WebGL Canvas Particle Background */}
      <Canvas3DBackground />

      {/* Radiant Glowing Neon Orbs */}
      <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[1200px] h-[700px] bg-gradient-to-tr from-cyan-500/25 via-fuchsia-600/25 to-indigo-600/25 rounded-full blur-[170px] pointer-events-none z-0" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[800px] h-[800px] bg-emerald-500/20 rounded-full blur-[180px] pointer-events-none z-0" />
      <div className="absolute top-[40%] left-[-10%] w-[700px] h-[700px] bg-purple-600/20 rounded-full blur-[160px] pointer-events-none z-0" />

      {/* Cyber Grid Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_75%_65%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none z-0" />

      {/* Navigation Bar */}
      <nav className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between border-b border-white/15 relative z-30 backdrop-blur-xl bg-[#060212]/80">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-cyan-400 via-fuchsia-500 to-indigo-600 border border-white/30 flex items-center justify-center shadow-lg shadow-cyan-500/40 animate-pulse">
            <Code2 className="h-5 w-5 text-white" />
          </div>
          <div className="flex items-center gap-2">
            <span className="font-black text-xl tracking-tight text-white uppercase drop-shadow-md">Placify</span>
            <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-mono font-bold border border-cyan-500/40 shadow-sm">
              v2.5 PRO
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            size="sm"
            onClick={handleStart}
            disabled={loading}
            className="text-xs px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 via-fuchsia-600 to-indigo-600 hover:opacity-95 text-white font-black transition-all shadow-xl shadow-cyan-500/30 border border-white/20 hover:scale-105"
          >
            {user ? 'Enter Console' : 'Sign In with Google'}
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto text-center px-6 pt-20 pb-16 relative z-20 space-y-8">
        {/* Animated Badge */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-slate-900/90 border border-cyan-400/50 text-xs text-cyan-300 font-black backdrop-blur-xl shadow-2xl shadow-cyan-500/30"
        >
          <Sparkle className="h-4 w-4 text-cyan-400 animate-spin" />
          <span>The Multi-Role Academic & Career Intelligence Cockpit</span>
        </motion.div>

        {/* Hero Title */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="space-y-6"
        >
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white leading-[1.05]">
            Empowering Academic & Career Excellence <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-cyan-400 via-fuchsia-300 to-emerald-300 bg-clip-text text-transparent drop-shadow-lg">
              For Students, Faculty & Research Scholars.
            </span>
          </h1>

          <p className="max-w-3xl mx-auto text-slate-200 text-base sm:text-xl leading-relaxed font-bold">
            The unified command platform: 1v1 peer interview matcher & DSA heatmaps for students, syllabus pace charts & AI quiz generation for faculty, and TA invigilation & grant logbooks for PhD scholars.
          </p>
        </motion.div>

        {/* Hero Actions */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
        >
          <Button
            size="lg"
            onClick={handleStart}
            disabled={loading}
            className="flex items-center gap-3 text-base px-10 py-7 rounded-2xl font-black bg-gradient-to-r from-cyan-500 via-fuchsia-600 to-indigo-600 text-white hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-cyan-500/50 border border-white/30"
          >
            {user ? 'Launch Command Cockpit' : 'Get Started Free with Google'}
            <ArrowRight className="h-6 w-6" />
          </Button>
        </motion.div>
      </section>

      {/* 3D Holographic Role Architecture Cards */}
      <section className="max-w-6xl mx-auto px-6 pb-20 relative z-20 space-y-8">
        <div className="text-center space-y-2">
          <span className="px-4 py-1.5 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-black border border-cyan-500/40 shadow-sm uppercase tracking-wider">
            3D TAILORED ROLES ARCHITECTURE
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-white drop-shadow-md">Built for Every Academic & Career Identity</h2>
        </div>

        {/* Role Switcher Buttons */}
        <div className="flex justify-center gap-2 p-2 rounded-2xl bg-slate-900/90 border border-white/25 max-w-xl mx-auto backdrop-blur-2xl shadow-2xl">
          <button
            type="button"
            onClick={() => setActiveRoleTab('student')}
            className={`px-5 py-3.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${
              activeRoleTab === 'student'
                ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-white shadow-xl shadow-cyan-500/40'
                : 'text-slate-200 hover:text-white hover:bg-white/10'
            }`}
          >
            <GraduationCap className="h-4 w-4" /> Student Candidate
          </button>
          <button
            type="button"
            onClick={() => setActiveRoleTab('teacher')}
            className={`px-5 py-3.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${
              activeRoleTab === 'teacher'
                ? 'bg-gradient-to-r from-fuchsia-600 to-indigo-600 text-white shadow-xl shadow-fuchsia-600/40'
                : 'text-slate-200 hover:text-white hover:bg-white/10'
            }`}
          >
            <School className="h-4 w-4" /> Faculty / Mentor
          </button>
          <button
            type="button"
            onClick={() => setActiveRoleTab('phd')}
            className={`px-5 py-3.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${
              activeRoleTab === 'phd'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-xl shadow-emerald-500/40'
                : 'text-slate-200 hover:text-white hover:bg-white/10'
            }`}
          >
            <BookOpen className="h-4 w-4" /> PhD Scholar
          </button>
        </div>

        {/* 3D Hologram Role Box */}
        <InteractiveCard3D className="w-full">
          <div className="p-8 sm:p-12 rounded-3xl bg-[#0f172a]/95 border border-white/30 backdrop-blur-2xl shadow-2xl space-y-4">
            {activeRoleTab === 'student' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="space-y-3 p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-cyan-400/50 transition-all">
                  <div className="h-12 w-12 rounded-2xl bg-cyan-500/25 text-cyan-300 border border-cyan-500/40 flex items-center justify-center font-black text-xl shadow-lg">1</div>
                  <h3 className="font-black text-white text-xl">Placement Kanban & Calendar</h3>
                  <p className="text-sm text-slate-200 leading-relaxed font-bold">Visual drive pipeline from Wishlist to Offer with past company interview question handouts.</p>
                </div>
                <div className="space-y-3 p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-cyan-400/50 transition-all">
                  <div className="h-12 w-12 rounded-2xl bg-cyan-500/25 text-cyan-300 border border-cyan-500/40 flex items-center justify-center font-black text-xl shadow-lg">2</div>
                  <h3 className="font-black text-white text-xl">1v1 Peer Mock Matcher</h3>
                  <p className="text-sm text-slate-200 leading-relaxed font-bold">Pair with peers online for timed DSA and System Design interviews with shared scratchpad execution.</p>
                </div>
                <div className="space-y-3 p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-cyan-400/50 transition-all">
                  <div className="h-12 w-12 rounded-2xl bg-cyan-500/25 text-cyan-300 border border-cyan-500/40 flex items-center justify-center font-black text-xl shadow-lg">3</div>
                  <h3 className="font-black text-white text-xl">Group Study & Co-Watching</h3>
                  <p className="text-sm text-slate-200 leading-relaxed font-bold">Co-watch YouTube lectures, write parallel notes, and track automated peer contribution scores.</p>
                </div>
              </div>
            )}

            {activeRoleTab === 'teacher' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="space-y-3 p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-fuchsia-400/50 transition-all">
                  <div className="h-12 w-12 rounded-2xl bg-fuchsia-500/25 text-fuchsia-300 border border-fuchsia-500/40 flex items-center justify-center font-black text-xl shadow-lg">1</div>
                  <h3 className="font-black text-white text-xl">Recharts Syllabus Pace Tracker</h3>
                  <p className="text-sm text-slate-200 leading-relaxed font-bold">Visual bar charts comparing planned vs actual module targets per course and section.</p>
                </div>
                <div className="space-y-3 p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-fuchsia-400/50 transition-all">
                  <div className="h-12 w-12 rounded-2xl bg-fuchsia-500/25 text-fuchsia-300 border border-fuchsia-500/40 flex items-center justify-center font-black text-xl shadow-lg">2</div>
                  <h3 className="font-black text-white text-xl">Digital Gradebook & 1-Click CSV</h3>
                  <p className="text-sm text-slate-200 leading-relaxed font-bold">Batch entry for Lab Marks, Mid-Terms, and End-Terms with instant downloadable CSV export.</p>
                </div>
                <div className="space-y-3 p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-fuchsia-400/50 transition-all">
                  <div className="h-12 w-12 rounded-2xl bg-fuchsia-500/25 text-fuchsia-300 border border-fuchsia-500/40 flex items-center justify-center font-black text-xl shadow-lg">3</div>
                  <h3 className="font-black text-white text-xl">AI Quiz & Assignment Generator</h3>
                  <p className="text-sm text-slate-200 leading-relaxed font-bold">Auto-create MCQs, short answers, and code snippets with complete answer keys & grading rules.</p>
                </div>
              </div>
            )}

            {activeRoleTab === 'phd' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="space-y-3 p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-emerald-400/50 transition-all">
                  <div className="h-12 w-12 rounded-2xl bg-emerald-500/25 text-emerald-400 border border-emerald-500/40 flex items-center justify-center font-black text-xl shadow-lg">1</div>
                  <h3 className="font-black text-white text-xl">TA Duty & Invigilation Log</h3>
                  <p className="text-sm text-slate-200 leading-relaxed font-bold">Track assigned UG lab batches, invigilation exam slots, and submit TA work hours log.</p>
                </div>
                <div className="space-y-3 p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-emerald-400/50 transition-all">
                  <div className="h-12 w-12 rounded-2xl bg-emerald-500/25 text-emerald-400 border border-emerald-500/40 flex items-center justify-center font-black text-xl shadow-lg">2</div>
                  <h3 className="font-black text-white text-xl">Supervisor Sync Logbook</h3>
                  <p className="text-sm text-slate-200 leading-relaxed font-bold">Timestamped advisor meeting notes, action item checklists, and dissertation progress milestones.</p>
                </div>
                <div className="space-y-3 p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-emerald-400/50 transition-all">
                  <div className="h-12 w-12 rounded-2xl bg-emerald-500/25 text-emerald-400 border border-emerald-500/40 flex items-center justify-center font-black text-xl shadow-lg">3</div>
                  <h3 className="font-black text-white text-xl">Research Grant Expense Disbursal</h3>
                  <p className="text-sm text-slate-200 leading-relaxed font-bold">Track SERB & DST grant budgets, remaining balances, and log conference reimbursement claims.</p>
                </div>
              </div>
            )}
          </div>
        </InteractiveCard3D>
      </section>

      {/* Feature Deck Cards */}
      <section className="max-w-6xl mx-auto px-6 pb-24 relative z-20 space-y-10">
        <div className="text-center space-y-2">
          <h2 className="text-3xl sm:text-5xl font-black text-white drop-shadow-md">Full Suite Feature Deck</h2>
          <p className="text-xs sm:text-base text-slate-200 max-w-md mx-auto font-bold">Everything you need to accelerate your technical and academic preparation</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feat, idx) => {
            const IconComponent = feat.icon
            return (
              <InteractiveCard3D key={idx} className="w-full h-full cursor-pointer" onClick={() => handleExploreFeature(feat.route)}>
                <div className="h-full p-8 rounded-3xl bg-[#0f172a] border border-white/25 hover:border-cyan-400/80 transition-all space-y-6 shadow-2xl backdrop-blur-2xl group flex flex-col justify-between hover:bg-[#1e293b]">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className={`p-4 rounded-2xl border ${feat.color} shadow-lg`}>
                        <IconComponent className="h-7 w-7" />
                      </div>
                      <span className="px-3.5 py-1 rounded-full bg-white/10 border border-white/20 text-xs font-mono text-slate-100 font-bold group-hover:text-cyan-300 transition-colors">
                        {feat.badge}
                      </span>
                    </div>
                    <h3 className="font-black text-white text-2xl group-hover:text-cyan-300 transition-colors">
                      {feat.title}
                    </h3>
                    <p className="text-sm text-slate-200 leading-relaxed font-semibold">
                      {feat.description}
                    </p>
                  </div>

                  {/* Clickable Explore Feature Button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleExploreFeature(feat.route)
                    }}
                    className="pt-5 border-t border-white/15 flex items-center justify-between text-xs text-cyan-300 font-black group-hover:text-white transition-colors"
                  >
                    <span className="flex items-center gap-2 text-sm">
                      Explore Feature <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </span>
                    <span className="text-xs text-slate-100 font-mono font-bold bg-white/15 px-3 py-1 rounded-xl border border-white/20 shadow-sm">
                      Open →
                    </span>
                  </button>
                </div>
              </InteractiveCard3D>
            )
          })}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/15 py-10 bg-[#04010a] relative z-20 text-center text-xs sm:text-sm text-slate-300 font-bold">
        <p>© {new Date().getFullYear()} Placify Platform • Empowering Students, Faculty & Research Scholars</p>
      </footer>
    </div>
  )
}
