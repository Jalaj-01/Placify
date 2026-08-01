import { useState } from 'react'
import {
  School, BookOpen, Clock, Users, AlertTriangle, CheckCircle2,
  Calendar, Send, Plus, BellRing, Sparkles, FileSpreadsheet, ShieldCheck
} from 'lucide-react'
import StatsCard from '@/components/dashboard/StatsCard'
import { useAppStore } from '@/store/useAppStore'

export default function TeacherDashboard({ user, profile }) {
  const { openAICoach } = useAppStore()
  const [activeCourse, setActiveCourse] = useState('dsa')
  const [showBroadcastModal, setShowBroadcastModal] = useState(false)
  const [broadcastText, setBroadcastText] = useState('')
  const [broadcastClass, setBroadcastClass] = useState('CSE-3A')
  const [broadcastSuccess, setBroadcastSuccess] = useState(false)

  // Course Pace Data
  const courses = [
    {
      id: 'dsa',
      code: 'CS301',
      name: 'Data Structures & Algorithms',
      section: 'Sec 3A & 3B',
      completedPct: 68,
      modulesDone: 7,
      totalModules: 10,
      paceStatus: 'On Schedule',
      nextTopic: 'Graph Shortest Path Algorithms (Dijkstra)',
      studentsCount: 64
    },
    {
      id: 'dbms',
      code: 'CS304',
      name: 'Database Management Systems',
      section: 'Sec 3B',
      completedPct: 82,
      modulesDone: 9,
      totalModules: 11,
      paceStatus: 'Ahead of Pace',
      nextTopic: 'Transaction Concurrency Control & B+ Trees',
      studentsCount: 58
    },
    {
      id: 'os-lab',
      code: 'CS308L',
      name: 'Operating Systems Practical Lab',
      section: 'Lab B1 & B2',
      completedPct: 54,
      modulesDone: 5,
      totalModules: 9,
      paceStatus: 'Review Needed',
      nextTopic: 'Page Replacement Algorithms (LRU & FIFO)',
      studentsCount: 32
    }
  ]

  // Class & Lab Timetable Schedule
  const timetable = [
    { time: '09:00 - 10:00 AM', subject: 'Data Structures (CS301)', room: 'LH-204', type: 'Lecture', status: 'Completed' },
    { time: '11:15 - 01:15 PM', subject: 'OS Practical Lab (CS308L)', room: 'Lab 3 (Linux Shell)', type: 'Practical Lab', status: 'Live Now' },
    { time: '02:30 - 03:30 PM', subject: 'DBMS Theory (CS304)', room: 'LH-101', type: 'Lecture', status: 'Upcoming' },
    { time: '04:00 - 05:00 PM', subject: 'Placement Doubt Clearing', room: 'Seminar Hall B', type: 'Mentorship', status: 'Upcoming' }
  ]

  // Cohort Risk Alerts (Auto-Generated)
  const atRiskStudents = [
    { name: 'Aarav Sharma', roll: '21CSE042', issue: 'Inactive for 5 days & 0 lab check-ins this week', risk: 'High' },
    { name: 'Priya Verma', roll: '21CSE089', issue: 'Problem solving velocity dropped below class avg', risk: 'Medium' },
    { name: 'Karan Patel', roll: '21CSE112', issue: 'Missed DBMS Lab Assignment #4 deadline', risk: 'High' }
  ]

  const handleSendBroadcast = (e) => {
    e.preventDefault()
    if (!broadcastText.trim()) return
    setBroadcastSuccess(true)
    setTimeout(() => {
      setBroadcastSuccess(false)
      setShowBroadcastModal(false)
      setBroadcastText('')
    }, 1200)
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Faculty Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-semantic-purple/15 via-surface/60 to-surface/40 border border-white/10 shadow-lg">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-semantic-purple/20 text-semantic-purple border border-semantic-purple/30 shadow-inner">
            <School className="h-6 w-6 text-semantic-purple-light" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-text-primary">
                Prof. {profile?.displayName || user?.displayName || 'Faculty'}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-semantic-purple/20 text-semantic-purple text-xs font-semibold border border-semantic-purple/30 flex items-center gap-1">
                <ShieldCheck className="h-3.5 w-3.5" /> Verified Faculty
              </span>
            </div>
            <p className="text-xs text-text-muted mt-0.5">
              {profile?.department || 'Computer Science & Engineering'} • Teacher ID: {profile?.teacherId || 'TEACHER2026'}
            </p>
          </div>
        </div>

        {/* Quick Broadcast Button */}
        <button
          onClick={() => setShowBroadcastModal(true)}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-semantic-purple to-purple-600 text-white text-xs font-semibold hover:opacity-95 transition-all shadow-lg shadow-semantic-purple/25 flex items-center justify-center gap-2 shrink-0 border border-semantic-purple/40"
        >
          <BellRing className="h-4 w-4" />
          <span>Broadcast Class Notice</span>
        </button>
      </div>

      {/* Prominent AI Lesson & Syllabus Assistant Widget */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-semantic-purple/20 via-surface/60 to-accent/20 border border-semantic-purple/30 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-semantic-purple/20 text-semantic-purple">
            <Sparkles className="h-5 w-5 text-semantic-purple-light animate-pulse" />
          </div>
          <div>
            <h3 className="font-bold text-text-primary text-sm">AI Lesson Planner & Curriculum Assistant</h3>
            <p className="text-xs text-text-muted">Generate lab assignments, auto-create quiz questions, or draft lecture notes in seconds.</p>
          </div>
        </div>
        <button
          onClick={openAICoach}
          className="px-4 py-2 rounded-xl bg-semantic-purple text-white font-semibold text-xs hover:bg-purple-600 transition-colors flex items-center justify-center gap-2 shrink-0 shadow-md shadow-semantic-purple/20"
        >
          <Sparkles className="h-3.5 w-3.5" />
          <span>Ask AI Assistant</span>
        </button>
      </div>

      {/* Faculty Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Active Students Mentored"
          value="154"
          icon={Users}
          description="Across 3 subjects & labs"
        />
        <StatsCard
          title="Course Completion Rate"
          value="68%"
          icon={BookOpen}
          description="Auto-computed syllabus pace"
        />
        <StatsCard
          title="Today's Sessions"
          value="4 Classes"
          icon={Clock}
          description="Lectures & Practical Labs"
        />
        <StatsCard
          title="At-Risk Student Flag"
          value={`${atRiskStudents.length} Students`}
          icon={AlertTriangle}
          description="Auto-flagged for low activity"
        />
      </div>

      {/* Section 1: Course & Syllabus Pace Tracker */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-section font-semibold text-text-primary flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-semantic-purple" />
              Automated Course & Syllabus Pace Tracker
            </h2>
            <p className="text-xs text-text-muted">Monitors syllabus progress against term calendar automatically.</p>
          </div>
          <span className="text-xs text-semantic-purple font-medium bg-semantic-purple/10 px-2.5 py-1 rounded-lg">
            Spring 2026 Term
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {courses.map((c) => (
            <div
              key={c.id}
              onClick={() => setActiveCourse(c.id)}
              className={`p-5 rounded-2xl border transition-all cursor-pointer space-y-4 ${
                activeCourse === c.id
                  ? 'border-semantic-purple bg-semantic-purple/10 shadow-lg shadow-semantic-purple/10'
                  : 'border-white/10 bg-surface/40 hover:bg-surface/70'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="px-2 py-0.5 rounded bg-white/10 text-[10px] font-mono text-text-muted">
                    {c.code} • {c.section}
                  </span>
                  <h3 className="font-semibold text-text-primary text-sm mt-1">{c.name}</h3>
                </div>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                    c.paceStatus === 'Ahead of Pace'
                      ? 'bg-semantic-green/15 text-semantic-green border-semantic-green/30'
                      : c.paceStatus === 'On Schedule'
                      ? 'bg-accent/15 text-accent border-accent/30'
                      : 'bg-semantic-red/15 text-semantic-red border-semantic-red/30'
                  }`}
                >
                  {c.paceStatus}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-text-muted">Syllabus Completed</span>
                  <span className="font-bold text-text-primary">{c.completedPct}%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-base overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-semantic-purple to-accent transition-all duration-500"
                    style={{ width: `${c.completedPct}%` }}
                  />
                </div>
                <p className="text-[11px] text-text-muted">
                  Modules: {c.modulesDone}/{c.totalModules} completed
                </p>
              </div>

              <div className="pt-2 border-t border-white/5 text-[11px] text-text-secondary flex items-center justify-between">
                <span className="truncate max-w-[200px]">Next: {c.nextTopic}</span>
                <span className="text-text-muted font-medium">{c.studentsCount} Students</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Section 2: Class & Lab Timetable + Automated Cohort Risk Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Timetable Schedule Grid */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-section font-semibold text-text-primary flex items-center gap-2">
              <Calendar className="h-4 w-4 text-accent" />
              Class & Lab Timetable (Today)
            </h2>
            <span className="text-[11px] text-text-muted">Auto-notifies 15m before session</span>
          </div>

          <div className="space-y-3">
            {timetable.map((t, idx) => (
              <div
                key={idx}
                className={`p-4 rounded-xl border flex items-center justify-between transition-all ${
                  t.status === 'Live Now'
                    ? 'border-semantic-green bg-semantic-green/10 shadow-md shadow-semantic-green/10'
                    : 'border-white/10 bg-surface/40'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`h-3 w-3 rounded-full ${
                      t.status === 'Completed'
                        ? 'bg-text-muted'
                        : t.status === 'Live Now'
                        ? 'bg-semantic-green animate-ping'
                        : 'bg-accent'
                    }`}
                  />
                  <div>
                    <h4 className="font-semibold text-text-primary text-sm">{t.subject}</h4>
                    <p className="text-xs text-text-muted mt-0.5">
                      {t.time} • Room: <span className="text-text-secondary font-medium">{t.room}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-white/10 text-[10px] text-text-muted font-medium">
                    {t.type}
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                      t.status === 'Completed'
                        ? 'text-text-muted'
                        : t.status === 'Live Now'
                        ? 'text-semantic-green bg-semantic-green/20'
                        : 'text-accent bg-accent/15'
                    }`}
                  >
                    {t.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Automated Cohort Risk Detection */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-section font-semibold text-text-primary flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-semantic-red" />
              Automated Cohort Risk Flags
            </h2>
            <span className="text-[10px] text-semantic-red bg-semantic-red/10 px-2 py-0.5 rounded font-mono">
              Auto-Detected
            </span>
          </div>

          <div className="space-y-3">
            {atRiskStudents.map((s, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-surface/50 border border-semantic-red/20 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-text-primary text-sm">{s.name}</span>
                    <span className="text-[10px] text-text-muted font-mono">({s.roll})</span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-semantic-red/15 text-semantic-red text-[10px] font-bold border border-semantic-red/30">
                    {s.risk} Risk
                  </span>
                </div>
                <p className="text-xs text-text-secondary leading-relaxed">{s.issue}</p>
                <button className="text-[11px] text-accent hover:underline font-medium">
                  Send Nudge / Academic Warning →
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Broadcast Modal */}
      {showBroadcastModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-2xl bg-[#0c0d14] border border-white/10 p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <BellRing className="h-5 w-5 text-semantic-purple" />
                <h3 className="font-bold text-text-primary text-base">Broadcast Class Announcement</h3>
              </div>
              <button
                onClick={() => setShowBroadcastModal(false)}
                className="text-text-muted hover:text-white"
              >
                ✕
              </button>
            </div>

            {broadcastSuccess ? (
              <div className="p-6 text-center space-y-3">
                <CheckCircle2 className="h-12 w-12 text-semantic-green mx-auto animate-bounce" />
                <h4 className="font-bold text-text-primary text-base">Announcement Sent!</h4>
                <p className="text-xs text-text-muted">Notified all students in class {broadcastClass}.</p>
              </div>
            ) : (
              <form onSubmit={handleSendBroadcast} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs text-text-secondary block">Select Target Class</label>
                  <select
                    value={broadcastClass}
                    onChange={(e) => setBroadcastClass(e.target.value)}
                    className="w-full bg-base border border-white/15 rounded-lg px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-semantic-purple"
                  >
                    <option value="CSE-3A">CSE Sec 3A (64 Students)</option>
                    <option value="CSE-3B">CSE Sec 3B (58 Students)</option>
                    <option value="LAB-B1">OS Practical Lab B1 (32 Students)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-text-secondary block">Announcement Message</label>
                  <textarea
                    rows={4}
                    placeholder="Enter notice regarding lab submission deadlines, class schedule updates, or placement drive prep..."
                    value={broadcastText}
                    onChange={(e) => setBroadcastText(e.target.value)}
                    className="w-full bg-base border border-white/15 rounded-lg p-3 text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-semantic-purple resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-semantic-purple text-white font-semibold text-xs hover:bg-purple-600 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-semantic-purple/20"
                >
                  <Send className="h-4 w-4" />
                  <span>Send Announcement Now</span>
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
