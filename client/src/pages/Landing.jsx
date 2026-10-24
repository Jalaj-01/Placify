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
import GlassStairs3D from '@/components/landing/GlassStairs3D'

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

        if (progress < 0.18) setActivePillar(0)
        else if (progress < 0.44) setActivePillar(1)
        else if (progress < 0.70) setActivePillar(2)
        else if (progress < 0.88) setActivePillar(3)
        else setActivePillar(4)
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
    <div
      className="min-h-screen text-[#20242b] relative overflow-x-hidden font-sans selection:bg-[#bae6fd] selection:text-[#0369a1]"
      style={{
        background:
          'radial-gradient(ellipse 60% 85% at 5% 40%, rgba(255, 228, 230, .75), transparent 100%), radial-gradient(ellipse 65% 85% at 95% 35%, rgba(186, 230, 253, .85), transparent 100%), linear-gradient(115deg, #f8fafc 0%, #ffffff 50%, #f0f9ff 100%)',
        backgroundAttachment: 'fixed',
      }}
    >
      {/* ── 1. Full-Screen 3D Glass Stairs World ── */}
      <GlassStairs3D scrollProgressRef={scrollProgressRef} activeStep={activePillar} />

      {/* ── 2. Minimal Floating Top Corner Action Bar (No full navbar) ── */}
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 sm:px-12 py-5 pointer-events-none">
        {/* Brand Mark on Left */}
        <div
          onClick={() => navigate('/')}
          className="flex items-center gap-3 pointer-events-auto cursor-pointer group"
        >
          <div className="w-9 h-9 rounded-2xl bg-[#20242b] text-white flex items-center justify-center font-black text-sm shadow-md group-hover:scale-105 transition-transform">
            P
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-xl tracking-tight text-[#20242b] leading-tight">
              Placify
            </span>
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
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
            className="hidden md:inline-flex text-xs px-3 py-1.5 rounded-xl bg-cyan-50/90 hover:bg-cyan-100 text-cyan-800 font-bold border border-cyan-200/80 shadow-sm backdrop-blur-md transition-all"
          >
            Demo Student
          </button>
          <button
            onClick={() => {
              loginAsDemo('teacher')
              navigate('/dashboard')
            }}
            className="hidden md:inline-flex text-xs px-3 py-1.5 rounded-xl bg-purple-50/90 hover:bg-purple-100 text-purple-800 font-bold border border-purple-200/80 shadow-sm backdrop-blur-md transition-all"
          >
            Demo Faculty
          </button>
          <button
            onClick={() => {
              loginAsDemo('phd')
              navigate('/dashboard')
            }}
            className="hidden lg:inline-flex text-xs px-3 py-1.5 rounded-xl bg-emerald-50/90 hover:bg-emerald-100 text-emerald-800 font-bold border border-emerald-200/80 shadow-sm backdrop-blur-md transition-all"
          >
            Demo PhD
          </button>

          <Button
            size="sm"
            onClick={handleStart}
            disabled={loading}
            className="text-xs px-4 py-2 rounded-xl bg-[#20242b] hover:bg-black text-white font-extrabold shadow-md flex items-center gap-1.5 transition-all"
          >
            <span>{user ? 'Enter Console' : 'Sign In'}</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </header>

      {/* ── 3. Floating Vertical Stair Step Navigation ── */}
      <nav aria-label="Pillar navigation" className="fixed right-6 sm:right-10 top-1/2 -translate-y-1/2 z-40 hidden md:flex flex-col gap-3.5 pointer-events-auto">
        {[
          { label: 'Start', idx: 0 },
          { label: '01: Student Placement', idx: 1 },
          { label: '02: Faculty Syllabus', idx: 2 },
          { label: '03: PhD Research', idx: 3 },
          { label: 'Summit: Launch', idx: 4 },
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
                  ? 'opacity-100 text-[#0284c7] font-black'
                  : 'opacity-0 group-hover:opacity-100 text-slate-400'
              }`}
            >
              {item.label}
            </span>
            <span
              className={`h-2.5 rounded-full transition-all duration-300 ${
                activePillar === item.idx
                  ? 'w-7 bg-[#0284c7] shadow-[0_0_12px_rgba(2,132,199,0.5)]'
                  : 'w-2.5 bg-slate-300/80 hover:bg-slate-400'
              }`}
            />
          </button>
        ))}
      </nav>

      {/* ─── 4. SCROLLABLE STAIRCASE STORY: THE 3 CORE PILLARS ─── */}

      {/* ── BASE HERO: ONE PLATFORM, THREE ACADEMIC SUPERPOWERS ── */}
      <section className="relative z-10 min-h-screen flex flex-col items-center justify-center text-center px-6 max-w-4xl mx-auto pt-16 pb-12">
        <motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/85 border border-white/95 shadow-sm backdrop-blur-md text-xs font-bold text-slate-700 mb-6"
        >
          <span className="flex h-2 w-2 rounded-full bg-[#0284c7] animate-pulse" />
          <span>One Platform • Three Academic Superpowers</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="text-5xl sm:text-7xl lg:text-8xl font-black tracking-tight text-[#20242b] leading-[1.04]"
        >
          One Platform.{' '}
          <span className="block mt-2 text-transparent bg-clip-text bg-gradient-to-r from-[#0284c7] via-[#6366f1] to-[#8b5cf6]">
            Three Superpowers.
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="max-w-2xl mx-auto mt-6 text-slate-600 text-base sm:text-xl leading-relaxed font-normal"
        >
          Placify is built from the ground up for university ecosystems. Step onto the glass stairs to explore our three specialized suites for <strong>Students</strong>, <strong>Faculty</strong>, and <strong>PhD Scholars</strong>.
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
            className="px-3.5 py-1.5 rounded-xl bg-cyan-50 border border-cyan-200/80 text-cyan-800 font-extrabold flex items-center gap-1.5 hover:bg-cyan-100 transition-all shadow-sm"
          >
            <GraduationCap className="h-3.5 w-3.5" /> 1. Student Placement Suite
          </button>
          <button
            onClick={() => scrollToPillar(2)}
            className="px-3.5 py-1.5 rounded-xl bg-purple-50 border border-purple-200/80 text-purple-800 font-extrabold flex items-center gap-1.5 hover:bg-purple-100 transition-all shadow-sm"
          >
            <School className="h-3.5 w-3.5" /> 2. Faculty Syllabus & Grades
          </button>
          <button
            onClick={() => scrollToPillar(3)}
            className="px-3.5 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200/80 text-emerald-800 font-extrabold flex items-center gap-1.5 hover:bg-emerald-100 transition-all shadow-sm"
          >
            <BookOpenCheck className="h-3.5 w-3.5" /> 3. PhD Research Pipeline
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
            className="w-full sm:w-auto text-sm px-8 py-6 rounded-2xl font-extrabold bg-[#20242b] hover:bg-black text-white shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2.5"
          >
            <span>{user ? 'Enter Console' : 'Start Ascending Free'}</span>
            <ArrowRight className="h-4 w-4" />
          </Button>

          <button
            onClick={() => scrollToPillar(1)}
            className="w-full sm:w-auto text-sm px-7 py-3.5 rounded-2xl font-bold bg-white/85 hover:bg-white text-slate-800 border border-white/95 shadow-sm backdrop-blur-md transition-all flex items-center justify-center gap-2"
          >
            <span>Explore 3 Superpowers</span>
            <ChevronDown className="h-4 w-4 text-[#0284c7]" />
          </button>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
          className="mt-14 flex flex-col items-center gap-1 text-xs text-slate-400 font-bold uppercase tracking-wider"
        >
          <span>Step up on the stairs</span>
          <ChevronDown className="h-4 w-4 text-[#0284c7]" />
        </motion.div>
      </section>

      {/* ── PILLAR 1: STUDENT PLACEMENT & CODING COMMAND ── */}
      <section className="relative z-10 min-h-[125vh] flex items-center px-6 sm:px-16 max-w-7xl mx-auto py-24">
        <div className="max-w-lg space-y-6 text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-50 border border-cyan-200 text-cyan-800 text-xs font-black uppercase tracking-wider">
            <GraduationCap className="h-3.5 w-3.5 text-cyan-600" />
            <span>SUPERPOWER 01 • FOR STUDENTS & CANDIDATES</span>
          </div>

          <h2 className="text-4xl sm:text-6xl font-black tracking-tight text-[#20242b] leading-[1.08]">
            Placement Drives &{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-indigo-600">
              Coding Mastery.
            </span>
          </h2>

          <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-normal">
            Ascend from your first wishlist company to confirmed high-CTC offers. Track live Kanban rounds, log daily coding problems across DSA topics, analyze 5-axis competency radar, and simulate company OA rounds with your Gemini AI Coach.
          </p>

          {/* Catchy Visual Feature Capsule for Pillar 1 */}
          <div className="p-4 rounded-2xl bg-white/90 border border-white/95 shadow-[0_12px_32px_rgba(31,41,55,0.06)] backdrop-blur-xl space-y-3.5">
            {/* Kanban Drive Highlights */}
            <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-100">
              <span className="font-extrabold text-slate-800 flex items-center gap-1.5">
                <Briefcase className="h-4 w-4 text-cyan-600" /> Live Placement Pipeline
              </span>
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                Offer Confirmed 🎉
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-2 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className="text-[9px] text-slate-400 font-bold block uppercase">Wishlist</span>
                <strong className="text-slate-800 text-[11px] block mt-0.5">Google</strong>
                <span className="text-[9px] text-slate-500">₹45 LPA</span>
              </div>
              <div className="p-2 rounded-xl bg-cyan-50/70 border border-cyan-200">
                <span className="text-[9px] text-cyan-700 font-bold block uppercase">OA Round</span>
                <strong className="text-cyan-950 text-[11px] block mt-0.5">Amazon</strong>
                <span className="text-[9px] text-cyan-700 font-semibold">Tomorrow</span>
              </div>
              <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-300">
                <span className="text-[9px] text-emerald-700 font-bold block uppercase">Confirmed</span>
                <strong className="text-emerald-950 text-[11px] block mt-0.5">Atlassian</strong>
                <span className="text-[9px] text-emerald-700 font-bold">₹56 LPA</span>
              </div>
            </div>

            {/* Coding & AI Coach Stats */}
            <div className="flex items-center justify-between pt-1 text-xs text-slate-600 font-medium">
              <span className="flex items-center gap-1 text-slate-800 font-bold">
                <Code2 className="h-3.5 w-3.5 text-cyan-600" /> 24 Problems Logged (88% Competency)
              </span>
              <span className="flex items-center gap-1 text-indigo-700 font-bold text-[11px]">
                <Bot className="h-3.5 w-3.5" /> AI Coach Ready
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── PILLAR 2: FACULTY SYLLABUS PACE & DIGITAL GRADEBOOK ── */}
      <section className="relative z-10 min-h-[125vh] flex items-center justify-end px-6 sm:px-16 max-w-7xl mx-auto py-24">
        <div className="max-w-lg space-y-6 text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 border border-purple-200 text-purple-800 text-xs font-black uppercase tracking-wider">
            <School className="h-3.5 w-3.5 text-purple-600" />
            <span>SUPERPOWER 02 • FOR PROFESSORS & MENTORS</span>
          </div>

          <h2 className="text-4xl sm:text-6xl font-black tracking-tight text-[#20242b] leading-[1.08]">
            Course Pace Tracker &{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600">
              Digital Gradebook.
            </span>
          </h2>

          <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-normal">
            Step higher into frictionless academic management. Dynamic course syllabus pace charts compare completed lectures against university term timelines, while the digital gradebook computes class distributions with 1-click CSV export.
          </p>

          {/* Catchy Visual Feature Capsule for Pillar 2 */}
          <div className="p-4 rounded-2xl bg-white/90 border border-white/95 shadow-[0_12px_32px_rgba(31,41,55,0.06)] backdrop-blur-xl space-y-3.5">
            <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-100">
              <span className="font-extrabold text-slate-800 flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-purple-600" /> Syllabus Pace Barometer
              </span>
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-purple-100 text-purple-800">
                82% Completed
              </span>
            </div>

            {/* Pacing Progress Bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold text-slate-700">
                <span>CS-301: Distributed Database Systems</span>
                <span className="text-purple-600">Ahead of Schedule</span>
              </div>
              <div className="h-2.5 rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full rounded-full bg-gradient-to-r from-purple-500 to-indigo-600 w-[82%]" />
              </div>
            </div>

            {/* Digital Gradebook & Classroom Vault */}
            <div className="flex items-center justify-between pt-1 text-xs text-slate-600 font-medium">
              <span className="flex items-center gap-1.5 text-slate-800 font-bold">
                <FileSpreadsheet className="h-3.5 w-3.5 text-purple-600" /> 1-Click CSV Grade Export
              </span>
              <span className="flex items-center gap-1 text-emerald-700 font-bold text-[11px]">
                <CheckCircle2 className="h-3.5 w-3.5" /> 120 Submissions Verified
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── PILLAR 3: PHD SCHOLAR & ADVANCED RESEARCH PIPELINE ── */}
      <section className="relative z-10 min-h-[125vh] flex items-center px-6 sm:px-16 max-w-7xl mx-auto py-24">
        <div className="max-w-lg space-y-6 text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-black uppercase tracking-wider">
            <BookOpenCheck className="h-3.5 w-3.5 text-emerald-600" />
            <span>SUPERPOWER 03 • FOR PHD RESEARCHERS</span>
          </div>

          <h2 className="text-4xl sm:text-6xl font-black tracking-tight text-[#20242b] leading-[1.08]">
            Publication Pipeline &{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600">
              Supervisor Sync.
            </span>
          </h2>

          <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-normal">
            Near the summit, doctoral researchers accelerate publications. Track IEEE, ACM, and Springer manuscript submissions through peer review, record supervisor advisory logbooks, and manage SERB research grant claims with live notebooks.
          </p>

          {/* Catchy Visual Feature Capsule for Pillar 3 */}
          <div className="p-4 rounded-2xl bg-white/90 border border-white/95 shadow-[0_12px_32px_rgba(31,41,55,0.06)] backdrop-blur-xl space-y-3.5">
            <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-100">
              <span className="font-extrabold text-slate-800 flex items-center gap-1.5">
                <Award className="h-4 w-4 text-emerald-600" /> Manuscript Publications
              </span>
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                Core A* Journal
              </span>
            </div>

            {/* Research Paper Milestone */}
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
              <strong className="text-xs font-bold text-slate-900 block leading-tight">
                Scalable Distributed Graph Partitioning using Reinforcement Learning
              </strong>
              <div className="flex items-center justify-between text-[10px] text-slate-500 font-medium">
                <span>IEEE TPDS • Impact Factor 4.8</span>
                <span className="font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                  Under Peer Review
                </span>
              </div>
            </div>

            {/* Supervisor Logbook & Collaborative Research Notebooks */}
            <div className="flex items-center justify-between pt-1 text-xs text-slate-600 font-medium">
              <span className="flex items-center gap-1.5 text-slate-800 font-bold">
                <FileText className="h-3.5 w-3.5 text-emerald-600" /> Supervisor Logbook Synced
              </span>
              <span className="flex items-center gap-1 text-indigo-700 font-bold text-[11px]">
                <Laptop className="h-3.5 w-3.5" /> Collaborative Notebooks
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── THE SUMMIT • 3-IN-1 UNIFIED PLATFORM & DIRECT LAUNCH ── */}
      <section className="relative z-10 min-h-[95vh] flex flex-col items-center justify-center text-center px-6 max-w-3xl mx-auto py-24">
        <div className="w-14 h-14 rounded-3xl bg-[#20242b] text-white flex items-center justify-center shadow-2xl mb-6">
          <Trophy className="h-7 w-7 text-amber-300" />
        </div>

        <span className="text-xs font-black tracking-widest text-[#0284c7] uppercase mb-3">
          YOU'VE REACHED THE SUMMIT
        </span>

        <h2 className="text-5xl sm:text-7xl font-black tracking-tight text-[#20242b] leading-[1.04]">
          The Complete{' '}
          <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#0284c7] via-[#6366f1] to-[#8b5cf6]">
            Academic OS.
          </span>
        </h2>

        <p className="mt-5 text-base sm:text-xl text-slate-600 max-w-xl mx-auto font-normal">
          Whether you are a student landing dream placements, a professor pacing course syllabi, or a scholar publishing groundbreaking research — ascend with Placify.
        </p>

        {/* 3 Dedicated Demo Buttons for Each Superpower */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-2.5 w-full max-w-xl">
          <button
            onClick={() => {
              loginAsDemo('student')
              navigate('/dashboard')
            }}
            className="p-3.5 rounded-2xl bg-cyan-50 hover:bg-cyan-100 border border-cyan-200 text-cyan-900 font-extrabold text-xs transition-all shadow-sm flex flex-col items-center gap-1"
          >
            <GraduationCap className="h-5 w-5 text-cyan-600" />
            <span>Launch as Student</span>
          </button>

          <button
            onClick={() => {
              loginAsDemo('teacher')
              navigate('/dashboard')
            }}
            className="p-3.5 rounded-2xl bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-900 font-extrabold text-xs transition-all shadow-sm flex flex-col items-center gap-1"
          >
            <School className="h-5 w-5 text-purple-600" />
            <span>Launch as Faculty</span>
          </button>

          <button
            onClick={() => {
              loginAsDemo('phd')
              navigate('/dashboard')
            }}
            className="p-3.5 rounded-2xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-900 font-extrabold text-xs transition-all shadow-sm flex flex-col items-center gap-1"
          >
            <BookOpenCheck className="h-5 w-5 text-emerald-600" />
            <span>Launch as PhD</span>
          </button>
        </div>

        {/* Main CTA */}
        <div className="mt-6 flex items-center justify-center gap-3">
          <Button
            size="lg"
            onClick={handleStart}
            disabled={loading}
            className="text-sm px-9 py-6 rounded-2xl font-extrabold bg-[#20242b] hover:bg-black text-white shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2.5"
          >
            <span>{user ? 'Enter Console' : 'Launch Placify Free'}</span>
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Minimal Copyright Line (No heavy footer!) */}
        <div className="mt-24 pt-6 border-t border-slate-200/60 w-full text-center text-xs text-slate-400 font-medium">
          <p>© {new Date().getFullYear()} Placify Platform • Built for Students, Faculty & Research Scholars. All rights reserved.</p>
        </div>
      </section>
    </div>
  )
}
