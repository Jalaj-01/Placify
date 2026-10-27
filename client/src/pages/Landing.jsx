import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import {
  ArrowRight, Sparkles, GraduationCap, School, BookOpenCheck,
  Code2, Bot, Users, Briefcase, ChevronDown, CheckCircle2,
  FileSpreadsheet, Clock, Award, FileText, Trophy, Laptop
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import MinimalistAmbientCanvas from '@/components/landing/MinimalistAmbientCanvas'

export default function Landing() {
  const { user, signInWithGoogle, loginAsDemo, loading } = useAuth()
  const navigate = useNavigate()
  const scrollProgressRef = useRef(0)
  const [activePillar, setActivePillar] = useState(0) // 0: Hero, 1: Student, 2: Faculty, 3: PhD, 4: Summit

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })

    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight
      if (totalScroll > 0) {
        const progress = Math.min(1, Math.max(0, window.scrollY / totalScroll))
        scrollProgressRef.current = progress

        let nextPillar = 0
        if (progress < 0.18) nextPillar = 0
        else if (progress < 0.44) nextPillar = 1
        else if (progress < 0.70) nextPillar = 2
        else if (progress < 0.88) nextPillar = 3
        else nextPillar = 4

        setActivePillar((prev) => (prev !== nextPillar ? nextPillar : prev))
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleStart = () => {
    if (user) {
      navigate('/dashboard')
    } else {
      signInWithGoogle()
    }
  }

  const scrollToPillar = (index) => {
    const totalHeight = document.documentElement.scrollHeight - window.innerHeight
    const targets = [0, 0.28, 0.56, 0.78, 1.0]
    window.scrollTo({
      top: targets[index] * totalHeight,
      behavior: 'smooth',
    })
  }

  return (
    <div className="min-h-screen text-[#1E1B4B] dark:text-[#EEF2FF] relative overflow-x-hidden font-sans selection:bg-[#FACC15] selection:text-[#1E1B4B] bg-[#EDEFF4] dark:bg-[#0b0c16]">
      {/* GPU-composited static ambient gradient layer to eliminate repaint lag */}
      <div
        className="pointer-events-none fixed inset-0 -z-10"
        style={{
          backgroundImage:
            'radial-gradient(ellipse 70% 80% at 10% 20%, rgba(37, 99, 235, 0.08), transparent 70%), radial-gradient(ellipse 65% 75% at 90% 30%, rgba(250, 204, 21, 0.07), transparent 70%), radial-gradient(ellipse 60% 70% at 50% 90%, rgba(238, 242, 255, 0.06), transparent 70%)',
          transform: 'translateZ(0)',
          willChange: 'transform',
        }}
      />
      {/* ── 1. Minimalist In-Theme Ambient Animation (Replacing 3D Stairs) ── */}
      <MinimalistAmbientCanvas activeStep={activePillar} />

      {/* ── 2. Minimal Floating Top Corner Action Bar ── */}
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 sm:px-12 py-5 pointer-events-none">
        {/* Brand Mark on Left */}
        <div
          onClick={() => navigate('/')}
          className="flex items-center gap-3 pointer-events-auto cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-2xl bg-[#1E1B4B] dark:bg-[#EEF2FF] text-[#EEF2FF] dark:text-[#1E1B4B] flex items-center justify-center font-black text-base shadow-md group-hover:scale-105 transition-transform">
            P
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-xl tracking-tight text-[#1E1B4B] dark:text-[#EEF2FF] leading-tight">
              Placify
            </span>
            <span className="text-[10px] text-[#2563EB] dark:text-[#60a5fa] font-bold uppercase tracking-wider">
              3-in-1 Academic OS
            </span>
          </div>
        </div>

        {/* Quick Role Jump Pills on Right */}
        <div className="flex items-center gap-1.5 sm:gap-2 pointer-events-auto">
          <button
            onClick={() => {
              loginAsDemo('student')
              navigate('/dashboard')
            }}
            className="hidden md:inline-flex text-xs px-3.5 py-1.5 rounded-xl bg-[#2563EB]/12 hover:bg-[#2563EB]/20 text-[#2563EB] dark:text-[#93c5fd] font-bold border border-[#2563EB]/25 shadow-sm backdrop-blur-md transition-all"
          >
            Demo Student
          </button>
          <button
            onClick={() => {
              loginAsDemo('teacher')
              navigate('/dashboard')
            }}
            className="hidden md:inline-flex text-xs px-3.5 py-1.5 rounded-xl bg-[#FACC15]/20 hover:bg-[#FACC15]/30 text-[#854d0e] dark:text-[#FACC15] font-bold border border-[#FACC15]/40 shadow-sm backdrop-blur-md transition-all"
          >
            Demo Faculty
          </button>
          <button
            onClick={() => {
              loginAsDemo('phd')
              navigate('/dashboard')
            }}
            className="hidden lg:inline-flex text-xs px-3.5 py-1.5 rounded-xl bg-[#EEF2FF] hover:bg-[#e0e7ff] text-[#1E1B4B] dark:bg-[#1E1B4B] dark:text-[#EEF2FF] font-bold border border-black/10 dark:border-white/10 shadow-sm backdrop-blur-md transition-all"
          >
            Demo PhD
          </button>

          <Button
            size="sm"
            onClick={handleStart}
            disabled={loading}
            className="text-xs px-4 py-2 rounded-xl bg-[#2563EB] hover:bg-[#1d4ed8] text-white font-extrabold shadow-md flex items-center gap-1.5 transition-all"
          >
            <span>{user ? 'Enter Console' : 'Sign In'}</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </header>

      {/* ── 3. Floating Vertical Pillar Navigation ── */}
      <nav aria-label="Pillar navigation" className="fixed right-6 sm:right-10 top-1/2 -translate-y-1/2 z-40 hidden md:flex flex-col gap-3.5 pointer-events-auto">
        {[
          { label: 'Overview', idx: 0 },
          { label: '01: Student Placement', idx: 1 },
          { label: '02: Faculty Syllabus', idx: 2 },
          { label: '03: PhD Research', idx: 3 },
          { label: 'Platform Console', idx: 4 },
        ].map((item) => (
          <button
            key={item.idx}
            onClick={() => scrollToPillar(item.idx)}
            className="group flex items-center gap-2.5 justify-end"
            title={item.label}
          >
            <span
              className={`text-[10px] font-bold uppercase tracking-wider transition-all duration-300 ${
                activePillar === item.idx
                  ? 'opacity-100 text-[#2563EB] dark:text-[#FACC15] font-black'
                  : 'opacity-0 group-hover:opacity-100 text-slate-400 dark:text-slate-500'
              }`}
            >
              {item.label}
            </span>
            <span
              className={`h-2.5 rounded-full transition-all duration-300 ${
                activePillar === item.idx
                  ? 'w-7 bg-[#2563EB] dark:bg-[#FACC15] shadow-[0_0_12px_rgba(37,99,235,0.6)]'
                  : 'w-2.5 bg-slate-300 dark:bg-neutral-800 hover:bg-slate-400'
              }`}
            />
          </button>
        ))}
      </nav>

      {/* ─── 4. SCROLLABLE STORY: THE 3 CORE PILLARS ─── */}

      {/* ── BASE HERO: ONE PLATFORM, THREE ACADEMIC SUPERPOWERS ── */}
      <section className="relative z-10 min-h-screen flex flex-col items-center justify-center text-center px-6 max-w-4xl mx-auto pt-16 pb-12">
        <motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/90 dark:bg-[#1E1B4B]/90 border border-black/5 dark:border-white/10 shadow-sm backdrop-blur-md text-xs font-bold text-[#1E1B4B] dark:text-[#EEF2FF] mb-6"
        >
          <span className="flex h-2 w-2 rounded-full bg-[#FACC15] animate-pulse" />
          <span>One Platform • Three Academic Superpowers</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="text-5xl sm:text-7xl lg:text-8xl font-black tracking-tight text-[#1E1B4B] dark:text-[#EEF2FF] leading-[1.04]"
        >
          One Platform.{' '}
          <span className="block mt-2 text-transparent bg-clip-text bg-gradient-to-r from-[#2563EB] via-[#FACC15] to-[#2563EB]">
            Three Superpowers.
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="max-w-2xl mx-auto mt-6 text-slate-600 dark:text-[#EEF2FF]/80 text-base sm:text-xl leading-relaxed font-normal"
        >
          Placify is built from the ground up for university ecosystems. Explore our three specialized suites for <strong>Students</strong>, <strong>Faculty</strong>, and <strong>PhD Scholars</strong>.
        </motion.p>

        {/* 3 Quick Pillar Jump Pills */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.25 }}
          className="mt-6 flex flex-wrap items-center justify-center gap-2 text-xs"
        >
          <button
            onClick={() => scrollToPillar(1)}
            className="px-3.5 py-1.5 rounded-xl bg-[#2563EB]/10 border border-[#2563EB]/25 text-[#2563EB] dark:text-[#93c5fd] font-extrabold flex items-center gap-1.5 hover:bg-[#2563EB]/20 transition-all shadow-sm"
          >
            <GraduationCap className="h-3.5 w-3.5" /> 1. Student Placement Suite
          </button>
          <button
            onClick={() => scrollToPillar(2)}
            className="px-3.5 py-1.5 rounded-xl bg-[#FACC15]/20 border border-[#FACC15]/35 text-[#854d0e] dark:text-[#FACC15] font-extrabold flex items-center gap-1.5 hover:bg-[#FACC15]/30 transition-all shadow-sm"
          >
            <School className="h-3.5 w-3.5" /> 2. Faculty Syllabus & Grades
          </button>
          <button
            onClick={() => scrollToPillar(3)}
            className="px-3.5 py-1.5 rounded-xl bg-[#EEF2FF] dark:bg-[#1E1B4B] border border-blue-200 dark:border-white/10 text-[#1E1B4B] dark:text-[#EEF2FF] font-extrabold flex items-center gap-1.5 hover:bg-blue-100 transition-all shadow-sm"
          >
            <BookOpenCheck className="h-3.5 w-3.5 text-[#2563EB]" /> 3. PhD Research Pipeline
          </button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5 w-full sm:w-auto"
        >
          <Button
            size="lg"
            onClick={handleStart}
            disabled={loading}
            className="w-full sm:w-auto text-sm px-8 py-6 rounded-2xl font-extrabold bg-[#2563EB] hover:bg-[#1d4ed8] text-white shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2.5"
          >
            <span>{user ? 'Enter Console' : 'Start Free Today'}</span>
            <ArrowRight className="h-4 w-4" />
          </Button>

          <button
            onClick={() => scrollToPillar(1)}
            className="w-full sm:w-auto text-sm px-7 py-3.5 rounded-2xl font-bold bg-white/90 dark:bg-[#1E1B4B] hover:bg-white text-[#1E1B4B] dark:text-[#EEF2FF] border border-black/5 dark:border-white/10 shadow-sm backdrop-blur-md transition-all flex items-center justify-center gap-2"
          >
            <span>Explore 3 Superpowers</span>
            <ChevronDown className="h-4 w-4 text-[#2563EB] dark:text-[#FACC15]" />
          </button>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
          className="mt-14 flex flex-col items-center gap-1 text-xs text-slate-400 dark:text-neutral-500 font-bold uppercase tracking-wider"
        >
          <span>Scroll to explore</span>
          <ChevronDown className="h-4 w-4 text-[#2563EB] dark:text-[#FACC15]" />
        </motion.div>
      </section>

      {/* ── PILLAR 1: STUDENT PLACEMENT & CODING COMMAND ── */}
      <section className="relative z-10 min-h-[125vh] flex items-center px-6 sm:px-16 max-w-7xl mx-auto py-24">
        <div className="max-w-lg space-y-6 text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#2563EB]/12 border border-[#2563EB]/25 text-[#2563EB] dark:text-[#93c5fd] text-xs font-black uppercase tracking-wider">
            <GraduationCap className="h-3.5 w-3.5 text-[#2563EB]" />
            <span>SUPERPOWER 01 • FOR STUDENTS & CANDIDATES</span>
          </div>

          <h2 className="text-4xl sm:text-6xl font-black tracking-tight text-[#1E1B4B] dark:text-[#EEF2FF] leading-[1.08]">
            Placement Drives &{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2563EB] to-[#FACC15]">
              Coding Mastery.
            </span>
          </h2>

          <p className="text-base sm:text-lg text-slate-600 dark:text-[#EEF2FF]/80 leading-relaxed font-normal">
            Navigate from your first wishlist company to confirmed high-CTC offers. Track live Kanban rounds, log daily coding problems across DSA topics, analyze 5-axis competency radar, and simulate company OA rounds with your Gemini AI Coach.
          </p>

          {/* Catchy Visual Feature Capsule for Pillar 1 */}
          <div className="p-4 rounded-2xl bg-white/95 dark:bg-[#1E1B4B] border border-black/5 dark:border-white/10 shadow-[0_12px_32px_rgba(30,27,75,0.08)] backdrop-blur-xl space-y-3.5">
            {/* Kanban Drive Highlights */}
            <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-100 dark:border-white/5">
              <span className="font-extrabold text-[#1E1B4B] dark:text-[#EEF2FF] flex items-center gap-1.5">
                <Briefcase className="h-4 w-4 text-[#2563EB]" /> Live Placement Pipeline
              </span>
              <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-800 dark:text-emerald-300">
                Offer Confirmed 🎉
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-2 rounded-xl bg-[#EDEFF4] dark:bg-[#13112a] border border-black/5 dark:border-white/5">
                <span className="text-[9px] text-slate-400 font-bold block uppercase">Wishlist</span>
                <strong className="text-[#1E1B4B] dark:text-[#EEF2FF] text-[11px] block mt-0.5">Google</strong>
                <span className="text-[9px] text-[#2563EB] font-bold">₹45 LPA</span>
              </div>
              <div className="p-2 rounded-xl bg-[#FACC15]/20 border border-[#FACC15]/35">
                <span className="text-[9px] text-[#854d0e] dark:text-[#FACC15] font-bold block uppercase">OA Round</span>
                <strong className="text-[#1E1B4B] dark:text-[#EEF2FF] text-[11px] block mt-0.5">Amazon</strong>
                <span className="text-[9px] text-slate-500 dark:text-neutral-400 font-semibold">Tomorrow</span>
              </div>
              <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/25">
                <span className="text-[9px] text-[#2563EB] dark:text-[#93c5fd] font-bold block uppercase">Confirmed</span>
                <strong className="text-[#1E1B4B] dark:text-[#EEF2FF] text-[11px] block mt-0.5">Atlassian</strong>
                <span className="text-[9px] text-[#2563EB] dark:text-[#93c5fd] font-bold">₹56 LPA</span>
              </div>
            </div>

            {/* Coding & AI Coach Stats */}
            <div className="flex items-center justify-between pt-1 text-xs text-slate-600 dark:text-[#EEF2FF]/80 font-medium">
              <span className="flex items-center gap-1 text-[#1E1B4B] dark:text-[#EEF2FF] font-bold">
                <Code2 className="h-3.5 w-3.5 text-[#2563EB]" /> 24 Problems Logged (88% Competency)
              </span>
              <span className="flex items-center gap-1 text-[#2563EB] dark:text-[#93c5fd] font-bold text-[11px]">
                <Bot className="h-3.5 w-3.5" /> AI Coach Ready
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── PILLAR 2: FACULTY SYLLABUS PACE & DIGITAL GRADEBOOK ── */}
      <section className="relative z-10 min-h-[125vh] flex items-center justify-end px-6 sm:px-16 max-w-7xl mx-auto py-24">
        <div className="max-w-lg space-y-6 text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FACC15]/20 border border-[#FACC15]/35 text-[#854d0e] dark:text-[#FACC15] text-xs font-black uppercase tracking-wider">
            <School className="h-3.5 w-3.5 text-[#854d0e] dark:text-[#FACC15]" />
            <span>SUPERPOWER 02 • FOR PROFESSORS & MENTORS</span>
          </div>

          <h2 className="text-4xl sm:text-6xl font-black tracking-tight text-[#1E1B4B] dark:text-[#EEF2FF] leading-[1.08]">
            Course Pace Tracker &{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2563EB] to-[#FACC15]">
              Digital Gradebook.
            </span>
          </h2>

          <p className="text-base sm:text-lg text-slate-600 dark:text-[#EEF2FF]/80 leading-relaxed font-normal">
            Elevate into frictionless academic management. Dynamic course syllabus pace charts compare completed lectures against university term timelines, while the digital gradebook computes class distributions with 1-click CSV export.
          </p>

          {/* Catchy Visual Feature Capsule for Pillar 2 */}
          <div className="p-4 rounded-2xl bg-white/95 dark:bg-[#1E1B4B] border border-black/5 dark:border-white/10 shadow-[0_12px_32px_rgba(30,27,75,0.08)] backdrop-blur-xl space-y-3.5">
            <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-100 dark:border-white/5">
              <span className="font-extrabold text-[#1E1B4B] dark:text-[#EEF2FF] flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-[#FACC15]" /> Syllabus Pace Barometer
              </span>
              <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-[#FACC15]/25 text-[#854d0e] dark:text-[#FACC15]">
                82% Completed
              </span>
            </div>

            {/* Pacing Progress Bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold text-[#1E1B4B] dark:text-[#EEF2FF]">
                <span>CS-301: Distributed Database Systems</span>
                <span className="text-[#2563EB] dark:text-[#FACC15]">Ahead of Schedule</span>
              </div>
              <div className="h-2.5 rounded-full bg-[#EEF2FF] dark:bg-[#13112a] overflow-hidden">
                <div className="h-full rounded-full bg-gradient-to-r from-[#2563EB] to-[#FACC15] w-[82%]" />
              </div>
            </div>

            {/* Digital Gradebook & Classroom Vault */}
            <div className="flex items-center justify-between pt-1 text-xs text-slate-600 dark:text-[#EEF2FF]/80 font-medium">
              <span className="flex items-center gap-1.5 text-[#1E1B4B] dark:text-[#EEF2FF] font-bold">
                <FileSpreadsheet className="h-3.5 w-3.5 text-[#FACC15]" /> 1-Click CSV Grade Export
              </span>
              <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold text-[11px]">
                <CheckCircle2 className="h-3.5 w-3.5" /> 120 Submissions Verified
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── PILLAR 3: PHD SCHOLAR & ADVANCED RESEARCH PIPELINE ── */}
      <section className="relative z-10 min-h-[125vh] flex items-center px-6 sm:px-16 max-w-7xl mx-auto py-24">
        <div className="max-w-lg space-y-6 text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#2563EB]/12 border border-[#2563EB]/25 text-[#2563EB] dark:text-[#93c5fd] text-xs font-black uppercase tracking-wider">
            <BookOpenCheck className="h-3.5 w-3.5 text-[#2563EB]" />
            <span>SUPERPOWER 03 • FOR PHD RESEARCHERS</span>
          </div>

          <h2 className="text-4xl sm:text-6xl font-black tracking-tight text-[#1E1B4B] dark:text-[#EEF2FF] leading-[1.08]">
            Publication Pipeline &{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2563EB] to-[#FACC15]">
              Supervisor Sync.
            </span>
          </h2>

          <p className="text-base sm:text-lg text-slate-600 dark:text-[#EEF2FF]/80 leading-relaxed font-normal">
            Doctoral researchers accelerate publications and research impact. Track IEEE, ACM, and Springer manuscript submissions through peer review, record supervisor advisory logbooks, and manage SERB research grant claims with live collaborative notebooks.
          </p>

          {/* Catchy Visual Feature Capsule for Pillar 3 */}
          <div className="p-4 rounded-2xl bg-white/95 dark:bg-[#1E1B4B] border border-black/5 dark:border-white/10 shadow-[0_12px_32px_rgba(30,27,75,0.08)] backdrop-blur-xl space-y-3.5">
            <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-100 dark:border-white/5">
              <span className="font-extrabold text-[#1E1B4B] dark:text-[#EEF2FF] flex items-center gap-1.5">
                <Award className="h-4 w-4 text-[#2563EB]" /> Manuscript Publications
              </span>
              <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-blue-500/20 text-[#2563EB] dark:text-[#93c5fd]">
                Core A* Journal
              </span>
            </div>

            {/* Research Paper Milestone */}
            <div className="p-2.5 rounded-xl bg-[#EDEFF4] dark:bg-[#13112a] border border-black/5 dark:border-white/5 space-y-1">
              <strong className="text-xs font-bold text-[#1E1B4B] dark:text-[#EEF2FF] block leading-tight">
                Scalable Distributed Graph Partitioning using Reinforcement Learning
              </strong>
              <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-neutral-400 font-medium">
                <span>IEEE TPDS • Impact Factor 4.8</span>
                <span className="font-bold text-[#854d0e] dark:text-[#FACC15] bg-[#FACC15]/20 px-2 py-0.5 rounded-md border border-[#FACC15]/30">
                  Under Peer Review
                </span>
              </div>
            </div>

            {/* Supervisor Logbook & Collaborative Research Notebooks */}
            <div className="flex items-center justify-between pt-1 text-xs text-slate-600 dark:text-[#EEF2FF]/80 font-medium">
              <span className="flex items-center gap-1.5 text-[#1E1B4B] dark:text-[#EEF2FF] font-bold">
                <FileText className="h-3.5 w-3.5 text-[#2563EB]" /> Supervisor Logbook Synced
              </span>
              <span className="flex items-center gap-1 text-[#2563EB] dark:text-[#93c5fd] font-bold text-[11px]">
                <Laptop className="h-3.5 w-3.5" /> Collaborative Notebooks
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── THE SUMMIT • 3-IN-1 UNIFIED PLATFORM & DIRECT LAUNCH ── */}
      <section className="relative z-10 min-h-[95vh] flex flex-col items-center justify-center text-center px-6 max-w-3xl mx-auto py-24">
        <div className="w-14 h-14 rounded-3xl bg-[#1E1B4B] dark:bg-[#EEF2FF] text-[#EEF2FF] dark:text-[#1E1B4B] flex items-center justify-center shadow-2xl mb-6">
          <Trophy className="h-7 w-7 text-[#FACC15]" />
        </div>

        <span className="text-xs font-black tracking-widest text-[#2563EB] dark:text-[#FACC15] uppercase mb-3">
          ACCELERATE YOUR ACADEMIC ODYSSEY
        </span>

        <h2 className="text-5xl sm:text-7xl font-black tracking-tight text-[#1E1B4B] dark:text-[#EEF2FF] leading-[1.04]">
          The Complete{' '}
          <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#2563EB] via-[#FACC15] to-[#2563EB]">
            Academic OS.
          </span>
        </h2>

        <p className="mt-5 text-base sm:text-xl text-slate-600 dark:text-[#EEF2FF]/80 max-w-xl mx-auto font-normal">
          Whether you are a student landing dream placements, a professor pacing course syllabi, or a scholar publishing groundbreaking research — thrive with Placify.
        </p>

        {/* 3 Dedicated Demo Buttons for Each Superpower */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-2.5 w-full max-w-xl">
          <button
            onClick={() => {
              loginAsDemo('student')
              navigate('/dashboard')
            }}
            className="p-3.5 rounded-2xl bg-[#2563EB]/10 hover:bg-[#2563EB]/20 border border-[#2563EB]/25 text-[#2563EB] dark:text-[#93c5fd] font-extrabold text-xs transition-all shadow-sm flex flex-col items-center gap-1"
          >
            <GraduationCap className="h-5 w-5 text-[#2563EB]" />
            <span>Launch as Student</span>
          </button>

          <button
            onClick={() => {
              loginAsDemo('teacher')
              navigate('/dashboard')
            }}
            className="p-3.5 rounded-2xl bg-[#FACC15]/20 hover:bg-[#FACC15]/30 border border-[#FACC15]/35 text-[#854d0e] dark:text-[#FACC15] font-extrabold text-xs transition-all shadow-sm flex flex-col items-center gap-1"
          >
            <School className="h-5 w-5 text-[#854d0e] dark:text-[#FACC15]" />
            <span>Launch as Faculty</span>
          </button>

          <button
            onClick={() => {
              loginAsDemo('phd')
              navigate('/dashboard')
            }}
            className="p-3.5 rounded-2xl bg-[#EEF2FF] dark:bg-[#1E1B4B] hover:bg-[#e0e7ff] border border-blue-200 dark:border-white/10 text-[#1E1B4B] dark:text-[#EEF2FF] font-extrabold text-xs transition-all shadow-sm flex flex-col items-center gap-1"
          >
            <BookOpenCheck className="h-5 w-5 text-[#2563EB]" />
            <span>Launch as PhD</span>
          </button>
        </div>

        {/* Main CTA */}
        <div className="mt-6 flex items-center justify-center gap-3">
          <Button
            size="lg"
            onClick={handleStart}
            disabled={loading}
            className="text-sm px-9 py-6 rounded-2xl font-extrabold bg-[#2563EB] hover:bg-[#1d4ed8] text-white shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2.5"
          >
            <span>{user ? 'Enter Console' : 'Launch Placify Free'}</span>
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Minimal Copyright Line */}
        <div className="mt-24 pt-6 border-t border-slate-200/60 dark:border-white/10 w-full text-center text-xs text-slate-400 dark:text-neutral-500 font-medium">
          <p>© {new Date().getFullYear()} Placify Platform • Built for Students, Faculty & Research Scholars. All rights reserved.</p>
        </div>
      </section>
    </div>
  )
}
