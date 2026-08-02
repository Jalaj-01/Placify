import { useState, useEffect } from 'react'
import {
  School, BookOpen, Clock, Users, AlertTriangle, CheckCircle2,
  Calendar, Send, Plus, BellRing, Sparkles, FileSpreadsheet, ShieldCheck,
  Edit3, Trash2, X, Check, Eye
} from 'lucide-react'
import StatsCard from '@/components/dashboard/StatsCard'
import { useAppStore } from '@/store/useAppStore'

export default function TeacherDashboard({ user, profile }) {
  const { openAICoach } = useAppStore()
  const [activeTeacherTab, setActiveTeacherTab] = useState('overview') // 'overview' | 'chart' | 'gradebook' | 'quiz'

  // 1. Persistent Courses State
  const [courses, setCourses] = useState(() => {
    const saved = localStorage.getItem(`placify_teacher_courses_${user?.uid || 'guest'}`)
    return saved ? JSON.parse(saved) : [
      {
        id: '1',
        code: 'CS301',
        name: 'Data Structures & Algorithms',
        section: 'Sec 3A',
        completedPct: 68,
        modulesDone: 7,
        totalModules: 10,
        paceStatus: 'On Schedule',
        nextTopic: 'Graph Shortest Path (Dijkstra)',
        studentsCount: 64
      },
      {
        id: '2',
        code: 'CS304',
        name: 'Database Management Systems',
        section: 'Sec 3B',
        completedPct: 82,
        modulesDone: 9,
        totalModules: 11,
        paceStatus: 'Ahead of Pace',
        nextTopic: 'B+ Trees & Concurrency',
        studentsCount: 58
      },
      {
        id: '3',
        code: 'CS308L',
        name: 'OS Practical Lab',
        section: 'Lab B1',
        completedPct: 54,
        modulesDone: 5,
        totalModules: 9,
        paceStatus: 'Review Needed',
        nextTopic: 'LRU Page Replacement',
        studentsCount: 32
      }
    ]
  })

  // 2. Persistent Timetable State
  const [timetable, setTimetable] = useState(() => {
    const saved = localStorage.getItem(`placify_teacher_timetable_${user?.uid || 'guest'}`)
    return saved ? JSON.parse(saved) : [
      { id: '1', day: 'Today', time: '09:00 - 10:00 AM', subject: 'Data Structures (CS301)', room: 'LH-204', type: 'Lecture', status: 'Completed' },
      { id: '2', day: 'Today', time: '11:15 - 01:15 PM', subject: 'OS Practical Lab (CS308L)', room: 'Lab 3 (Linux Shell)', type: 'Practical Lab', status: 'Live Now' },
      { id: '3', day: 'Today', time: '02:30 - 03:30 PM', subject: 'DBMS Theory (CS304)', room: 'LH-101', type: 'Lecture', status: 'Upcoming' },
      { id: '4', day: 'Today', time: '04:00 - 05:00 PM', subject: 'Placement Doubt Clearing', room: 'Seminar Hall B', type: 'Mentorship', status: 'Upcoming' }
    ]
  })

  // Full Weekly Schedule
  const [weeklySchedule] = useState([
    { day: 'Monday', slots: ['09:00 AM - CS301 (Sec 3A)', '11:15 AM - OS Lab B1', '02:30 PM - DBMS (Sec 3B)'] },
    { day: 'Tuesday', slots: ['10:00 AM - Mentorship Hour', '01:30 PM - CS301 (Sec 3A)', '03:30 PM - Lab B2'] },
    { day: 'Wednesday', slots: ['09:00 AM - DBMS (Sec 3B)', '11:15 AM - Data Structures Lab', '04:00 PM - Research Sync'] },
    { day: 'Thursday', slots: ['09:00 AM - CS301 (Sec 3A)', '02:30 PM - DBMS (Sec 3B)', '04:00 PM - Placement Prep'] },
    { day: 'Friday', slots: ['10:00 AM - OS Lab B1', '01:30 PM - Departmental Meeting', '03:30 PM - Student Mentorship'] },
    { day: 'Saturday', slots: ['10:00 AM - Timed Assessment Mock', '12:00 PM - Doubt Clearing Session'] }
  ])

  // LocalStorage Persistence Sync
  useEffect(() => {
    if (user?.uid) {
      localStorage.setItem(`placify_teacher_courses_${user.uid}`, JSON.stringify(courses))
    }
  }, [courses, user?.uid])

  useEffect(() => {
    if (user?.uid) {
      localStorage.setItem(`placify_teacher_timetable_${user.uid}`, JSON.stringify(timetable))
    }
  }, [timetable, user?.uid])

  // Modals state
  const [showCourseModal, setShowCourseModal] = useState(false)
  const [editingCourseId, setEditingCourseId] = useState(null)
  const [courseForm, setCourseForm] = useState({
    code: '',
    name: '',
    section: '',
    completedPct: 50,
    modulesDone: 5,
    totalModules: 10,
    paceStatus: 'On Schedule',
    nextTopic: '',
    studentsCount: 40
  })

  const [showSlotModal, setShowSlotModal] = useState(false)
  const [slotForm, setSlotForm] = useState({
    time: '10:00 - 11:00 AM',
    subject: '',
    room: 'LH-101',
    type: 'Lecture',
    status: 'Upcoming'
  })

  const [showFullScheduleModal, setShowFullScheduleModal] = useState(false)
  const [showBroadcastModal, setShowBroadcastModal] = useState(false)
  const [broadcastText, setBroadcastText] = useState('')
  const [broadcastClass, setBroadcastClass] = useState(courses[0]?.section || 'Sec 3A')
  const [broadcastSuccess, setBroadcastSuccess] = useState(false)
  // Helper to handle manual teacher progress updates
  const handleUpdateModulesDone = (courseId, delta) => {
    setCourses((prev) =>
      prev.map((c) => {
        if (c.id === courseId) {
          const total = c.totalModules || 10
          const newDone = Math.min(total, Math.max(0, (c.modulesDone || 0) + delta))
          const newPct = Math.round((newDone / total) * 100)
          let newStatus = c.paceStatus
          if (newPct >= 80) newStatus = 'Ahead of Pace'
          else if (newPct >= 50) newStatus = 'On Schedule'
          else newStatus = 'Review Needed'

          return {
            ...c,
            modulesDone: newDone,
            completedPct: newPct,
            paceStatus: newStatus,
          }
        }
        return c
      })
    )
  }

  // Course Handlers
  const handleOpenCourseModal = (courseToEdit = null) => {
    if (courseToEdit) {
      setEditingCourseId(courseToEdit.id)
      setCourseForm({ ...courseToEdit })
    } else {
      setEditingCourseId(null)
      setCourseForm({
        code: 'CS' + Math.floor(100 + Math.random() * 900),
        name: '',
        section: 'Sec 3A',
        completedPct: 50,
        modulesDone: 5,
        totalModules: 10,
        paceStatus: 'On Schedule',
        nextTopic: '',
        studentsCount: 45
      })
    }
    setShowCourseModal(true)
  }

  const handleSaveCourse = (e) => {
    e.preventDefault()
    if (!courseForm.name.trim()) return

    if (editingCourseId) {
      setCourses((prev) => prev.map((c) => (c.id === editingCourseId ? { ...courseForm, id: editingCourseId } : c)))
    } else {
      const newCourse = { ...courseForm, id: String(Date.now()) }
      setCourses((prev) => [...prev, newCourse])
    }
    setShowCourseModal(false)
  }

  const handleDeleteCourse = (id) => {
    setCourses((prev) => prev.filter((c) => c.id !== id))
  }

  // Timetable Handlers
  const handleSaveSlot = (e) => {
    e.preventDefault()
    if (!slotForm.subject.trim()) return
    const newSlot = { ...slotForm, id: String(Date.now()), day: 'Today' }
    setTimetable((prev) => [...prev, newSlot])
    setShowSlotModal(false)
  }

  const handleDeleteSlot = (id) => {
    setTimetable((prev) => prev.filter((t) => t.id !== id))
  }

  // Broadcast Handler
  const handleSendBroadcast = (e) => {
    e.preventDefault()
    if (!broadcastText.trim()) return

    // Save broadcast announcement to localStorage / Firestore for students to read
    const savedAnnouncements = JSON.parse(localStorage.getItem('placify_global_announcements') || '[]')
    const newNotice = {
      id: String(Date.now()),
      teacherName: profile?.displayName || user?.displayName || 'Prof. Faculty',
      targetClass: broadcastClass,
      message: broadcastText.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      date: new Date().toLocaleDateString()
    }
    localStorage.setItem('placify_global_announcements', JSON.stringify([newNotice, ...savedAnnouncements]))

    setBroadcastSuccess(true)
    setTimeout(() => {
      setBroadcastSuccess(false)
      setShowBroadcastModal(false)
      setBroadcastText('')
    }, 1200)
  }

  // Cohort Risk Alerts (Auto-Generated)
  const atRiskStudents = [
    { name: 'Aarav Sharma', roll: '21CSE042', issue: 'Inactive for 5 days & 0 lab check-ins this week', risk: 'High' },
    { name: 'Priya Verma', roll: '21CSE089', issue: 'Problem solving velocity dropped below class avg', risk: 'Medium' },
    { name: 'Karan Patel', roll: '21CSE112', issue: 'Missed DBMS Lab Assignment #4 deadline', risk: 'High' }
  ]

  const totalStudents = courses.reduce((acc, c) => acc + (Number(c.studentsCount) || 0), 0)
  const avgCompletion = courses.length ? Math.round(courses.reduce((acc, c) => acc + (Number(c.completedPct) || 0), 0) / courses.length) : 0

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

        {/* Quick Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleOpenCourseModal()}
            className="px-3.5 py-2 rounded-xl bg-white/10 text-white text-xs font-semibold hover:bg-white/15 transition-all border border-white/15 flex items-center gap-1.5"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Course</span>
          </button>
          <button
            onClick={() => setShowBroadcastModal(true)}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-semantic-purple to-purple-600 text-white text-xs font-semibold hover:opacity-95 transition-all shadow-lg shadow-semantic-purple/25 flex items-center justify-center gap-2 shrink-0 border border-semantic-purple/40"
          >
            <BellRing className="h-4 w-4" />
            <span>Broadcast Notice</span>
          </button>
        </div>
      </div>

      {/* Prominent AI Lesson Assistant Widget */}
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

      {/* Sub-Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTeacherTab('overview')}
          className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all whitespace-nowrap ${
            activeTeacherTab === 'overview'
              ? 'bg-semantic-purple text-white shadow-md shadow-semantic-purple/20'
              : 'text-text-muted hover:text-text-primary hover:bg-surface/50'
          }`}
        >
          Dashboard Overview
        </button>
        <button
          onClick={() => setActiveTeacherTab('chart')}
          className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all whitespace-nowrap ${
            activeTeacherTab === 'chart'
              ? 'bg-semantic-purple text-white shadow-md shadow-semantic-purple/20'
              : 'text-text-muted hover:text-text-primary hover:bg-surface/50'
          }`}
        >
          Recharts Syllabus Pace
        </button>
        <button
          onClick={() => setActiveTeacherTab('gradebook')}
          className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all whitespace-nowrap ${
            activeTeacherTab === 'gradebook'
              ? 'bg-semantic-purple text-white shadow-md shadow-semantic-purple/20'
              : 'text-text-muted hover:text-text-primary hover:bg-surface/50'
          }`}
        >
          Digital Gradebook & CSV Export
        </button>
        <button
          onClick={() => setActiveTeacherTab('quiz')}
          className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all whitespace-nowrap ${
            activeTeacherTab === 'quiz'
              ? 'bg-semantic-purple text-white shadow-md shadow-semantic-purple/20'
              : 'text-text-muted hover:text-text-primary hover:bg-surface/50'
          }`}
        >
          AI Quiz Generator
        </button>
      </div>

      {activeTeacherTab === 'chart' && <PaceChart courses={courses} />}
      {activeTeacherTab === 'gradebook' && <GradebookVault />}
      {activeTeacherTab === 'quiz' && <AIQuizGenerator />}

      {activeTeacherTab === 'overview' && (
        <>

      {/* Faculty Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Active Students Mentored"
          value={`${totalStudents} Students`}
          icon={Users}
          description={`Across ${courses.length} courses & labs`}
        />
        <StatsCard
          title="Avg Course Completion"
          value={`${avgCompletion}%`}
          icon={BookOpen}
          description="Syllabus pace calculation"
        />
        <StatsCard
          title="Today's Scheduled Slots"
          value={`${timetable.length} Sessions`}
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
              Editable Course & Syllabus Pace Tracker
            </h2>
            <p className="text-xs text-text-muted">Add, edit, or track your custom subjects, sections, and syllabus progress.</p>
          </div>
          <button
            onClick={() => handleOpenCourseModal()}
            className="text-xs text-semantic-purple hover:underline font-semibold flex items-center gap-1"
          >
            <Plus className="h-3.5 w-3.5" /> Add Course
          </button>
        </div>

        {courses.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-surface/30 border border-white/5 space-y-2">
            <p className="text-sm text-text-muted">No courses added yet.</p>
            <button
              onClick={() => handleOpenCourseModal()}
              className="text-xs text-semantic-purple font-semibold hover:underline"
            >
              + Click to add your first course & section
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {courses.map((c) => (
              <div
                key={c.id}
                className="p-6 rounded-3xl border border-border-subtle bg-surface/90 hover:border-purple-500/50 transition-all shadow-xl space-y-4 relative group backdrop-blur-xl flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20 text-[10px] font-mono font-bold">
                        {c.code} • {c.section}
                      </span>
                      <h3 className="font-extrabold text-text-primary text-base mt-2 leading-tight">{c.name}</h3>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border ${
                          c.paceStatus === 'Ahead of Pace'
                            ? 'bg-semantic-green/15 text-semantic-green border-semantic-green/30'
                            : c.paceStatus === 'On Schedule'
                            ? 'bg-accent/15 text-accent-light border-accent/30'
                            : 'bg-semantic-red/15 text-semantic-red border-semantic-red/30'
                        }`}
                      >
                        {c.paceStatus}
                      </span>
                      <button
                        onClick={() => handleOpenCourseModal(c)}
                        className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-hover transition-colors"
                        title="Edit Course Details"
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteCourse(c.id)}
                        className="p-1.5 rounded-lg text-text-muted hover:text-semantic-red hover:bg-semantic-red/10 transition-colors"
                        title="Delete Course"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Syllabus Completion & Direct User-Input Progress Controls */}
                  <div className="space-y-2 pt-2 border-t border-border-subtle">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-text-muted">Syllabus Completed</span>
                      <span className="text-purple-400 font-mono text-sm">{c.completedPct}%</span>
                    </div>

                    <div className="h-2.5 w-full rounded-full bg-base overflow-hidden border border-border-subtle p-0.5">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-purple-600 via-accent to-cyan-400 transition-all duration-300"
                        style={{ width: `${c.completedPct}%` }}
                      />
                    </div>

                    {/* Interactive User Module Counter Buttons */}
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-xs text-text-muted font-medium">Completed Modules:</span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleUpdateModulesDone(c.id, -1)}
                          className="h-7 w-7 rounded-lg bg-hover hover:bg-surface text-text-primary font-black text-sm flex items-center justify-center border border-border-subtle shadow-sm active:scale-95 transition-all"
                          title="Decrease completed module count"
                        >
                          -
                        </button>
                        <span className="text-xs font-mono font-bold text-text-primary bg-base px-2.5 py-1 rounded-lg border border-border-subtle">
                          {c.modulesDone} / {c.totalModules}
                        </span>
                        <button
                          onClick={() => handleUpdateModulesDone(c.id, 1)}
                          className="h-7 w-7 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-black text-sm flex items-center justify-center shadow-sm active:scale-95 transition-all"
                          title="Increase completed module count"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-border-subtle text-xs text-text-secondary flex items-center justify-between gap-2 font-medium">
                  <span className="truncate max-w-[160px]" title={c.nextTopic}>
                    Next: <strong className="text-text-primary">{c.nextTopic || 'Next Topic'}</strong>
                  </span>
                  <span className="text-text-muted font-mono font-bold text-[11px] shrink-0">
                    {c.studentsCount} Students
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Section 2: Class & Lab Timetable + Cohort Risk Flags */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Timetable Schedule Grid */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-section font-semibold text-text-primary flex items-center gap-2">
              <Calendar className="h-4 w-4 text-accent" />
              Class & Lab Timetable
            </h2>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowFullScheduleModal(true)}
                className="text-xs text-accent hover:underline font-semibold flex items-center gap-1"
              >
                <Eye className="h-3.5 w-3.5" /> View Full Week
              </button>
              <button
                onClick={() => setShowSlotModal(true)}
                className="text-xs text-semantic-purple hover:underline font-semibold flex items-center gap-1"
              >
                <Plus className="h-3.5 w-3.5" /> Add Slot
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {timetable.map((t) => (
              <div
                key={t.id}
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
                  <button
                    onClick={() => handleDeleteSlot(t.id)}
                    className="p-1 rounded text-text-muted hover:text-semantic-red hover:bg-semantic-red/10"
                    title="Delete Slot"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
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
      </>
      )}

      {/* MODAL 1: Add / Edit Course Modal */}
      {showCourseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200 overflow-y-auto">
          <div className="w-full max-w-lg rounded-2xl bg-[#0c0d14] border border-white/10 p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="font-bold text-text-primary text-base">
                {editingCourseId ? 'Edit Course & Syllabus Pace' : 'Add New Course / Section'}
              </h3>
              <button onClick={() => setShowCourseModal(false)} className="text-text-muted hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveCourse} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs text-text-secondary block">Course Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. CS301"
                    value={courseForm.code}
                    onChange={(e) => setCourseForm({ ...courseForm, code: e.target.value })}
                    className="w-full bg-base border border-white/15 rounded-lg px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-semantic-purple"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-text-secondary block">Section / Batch *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sec 3A or Lab B1"
                    value={courseForm.section}
                    onChange={(e) => setCourseForm({ ...courseForm, section: e.target.value })}
                    className="w-full bg-base border border-white/15 rounded-lg px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-semantic-purple"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-text-secondary block">Course Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Data Structures & Algorithms"
                  value={courseForm.name}
                  onChange={(e) => setCourseForm({ ...courseForm, name: e.target.value })}
                  className="w-full bg-base border border-white/15 rounded-lg px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-semantic-purple"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs text-text-secondary block">Syllabus Completion %</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={courseForm.completedPct}
                    onChange={(e) => setCourseForm({ ...courseForm, completedPct: Number(e.target.value) })}
                    className="w-full bg-base border border-white/15 rounded-lg px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-semantic-purple"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-text-secondary block">Pace Status</label>
                  <select
                    value={courseForm.paceStatus}
                    onChange={(e) => setCourseForm({ ...courseForm, paceStatus: e.target.value })}
                    className="w-full bg-base border border-white/15 rounded-lg px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-semantic-purple"
                  >
                    <option value="On Schedule">On Schedule</option>
                    <option value="Ahead of Pace">Ahead of Pace</option>
                    <option value="Review Needed">Review Needed</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs text-text-secondary block">Modules Done / Total</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={courseForm.modulesDone}
                      onChange={(e) => setCourseForm({ ...courseForm, modulesDone: Number(e.target.value) })}
                      className="w-1/2 bg-base border border-white/15 rounded-lg px-2 py-2 text-xs text-text-primary"
                    />
                    <input
                      type="number"
                      value={courseForm.totalModules}
                      onChange={(e) => setCourseForm({ ...courseForm, totalModules: Number(e.target.value) })}
                      className="w-1/2 bg-base border border-white/15 rounded-lg px-2 py-2 text-xs text-text-primary"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-text-secondary block">Enrolled Students</label>
                  <input
                    type="number"
                    value={courseForm.studentsCount}
                    onChange={(e) => setCourseForm({ ...courseForm, studentsCount: Number(e.target.value) })}
                    className="w-full bg-base border border-white/15 rounded-lg px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-semantic-purple"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-text-secondary block">Next Upcoming Topic</label>
                <input
                  type="text"
                  placeholder="e.g. Graph Algorithms or B+ Trees"
                  value={courseForm.nextTopic}
                  onChange={(e) => setCourseForm({ ...courseForm, nextTopic: e.target.value })}
                  className="w-full bg-base border border-white/15 rounded-lg px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-semantic-purple"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-semantic-purple text-white font-semibold text-xs hover:bg-purple-600 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-semantic-purple/20"
              >
                <Check className="h-4 w-4" />
                <span>Save Course Settings</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Add Timetable Slot Modal */}
      {showSlotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200 overflow-y-auto">
          <div className="w-full max-w-lg rounded-2xl bg-[#0c0d14] border border-white/10 p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="font-bold text-text-primary text-base">Add Timetable Class / Lab Slot</h3>
              <button onClick={() => setShowSlotModal(false)} className="text-text-muted hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveSlot} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs text-text-secondary block">Subject / Session Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Operating Systems Practical Lab (CS308L)"
                  value={slotForm.subject}
                  onChange={(e) => setSlotForm({ ...slotForm, subject: e.target.value })}
                  className="w-full bg-base border border-white/15 rounded-lg px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-semantic-purple"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs text-text-secondary block">Time Slot</label>
                  <input
                    type="text"
                    placeholder="e.g. 10:00 - 11:00 AM"
                    value={slotForm.time}
                    onChange={(e) => setSlotForm({ ...slotForm, time: e.target.value })}
                    className="w-full bg-base border border-white/15 rounded-lg px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-semantic-purple"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-text-secondary block">Room / Hall</label>
                  <input
                    type="text"
                    placeholder="e.g. LH-204 or Lab 3"
                    value={slotForm.room}
                    onChange={(e) => setSlotForm({ ...slotForm, room: e.target.value })}
                    className="w-full bg-base border border-white/15 rounded-lg px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-semantic-purple"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs text-text-secondary block">Session Type</label>
                  <select
                    value={slotForm.type}
                    onChange={(e) => setSlotForm({ ...slotForm, type: e.target.value })}
                    className="w-full bg-base border border-white/15 rounded-lg px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-semantic-purple"
                  >
                    <option value="Lecture">Lecture</option>
                    <option value="Practical Lab">Practical Lab</option>
                    <option value="Mentorship">Mentorship</option>
                    <option value="Assessment">Assessment</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-text-secondary block">Status</label>
                  <select
                    value={slotForm.status}
                    onChange={(e) => setSlotForm({ ...slotForm, status: e.target.value })}
                    className="w-full bg-base border border-white/15 rounded-lg px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-semantic-purple"
                  >
                    <option value="Upcoming">Upcoming</option>
                    <option value="Live Now">Live Now</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-semantic-purple text-white font-semibold text-xs hover:bg-purple-600 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-semantic-purple/20"
              >
                <Check className="h-4 w-4" />
                <span>Add Slot to Timetable</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Full Weekly Timetable Schedule Modal */}
      {showFullScheduleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200 overflow-y-auto">
          <div className="w-full max-w-3xl max-h-[85vh] rounded-2xl bg-[#0c0d14] border border-white/10 p-6 shadow-2xl space-y-5 overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-accent" />
                <h3 className="font-bold text-text-primary text-base">Complete Weekly Teaching Schedule</h3>
              </div>
              <button onClick={() => setShowFullScheduleModal(false)} className="text-text-muted hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {weeklySchedule.map((dayObj, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-surface/50 border border-white/10 space-y-2">
                  <h4 className="font-bold text-accent text-xs uppercase tracking-wider">{dayObj.day}</h4>
                  <div className="space-y-1.5 pt-1">
                    {dayObj.slots.map((s, sIdx) => (
                      <div key={sIdx} className="p-2 rounded-lg bg-base/60 text-xs text-text-primary flex items-center gap-2 border border-white/5">
                        <Clock className="h-3 w-3 text-text-muted shrink-0" />
                        <span>{s}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: Broadcast Announcement Modal */}
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
                <X className="h-4 w-4" />
              </button>
            </div>

            {broadcastSuccess ? (
              <div className="p-6 text-center space-y-3">
                <CheckCircle2 className="h-12 w-12 text-semantic-green mx-auto animate-bounce" />
                <h4 className="font-bold text-text-primary text-base">Notice Sent & Published!</h4>
                <p className="text-xs text-text-muted">Broadcasted to enrolled students in {broadcastClass}.</p>
              </div>
            ) : (
              <form onSubmit={handleSendBroadcast} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs text-text-secondary block">Select Target Class / Section</label>
                  <select
                    value={broadcastClass}
                    onChange={(e) => setBroadcastClass(e.target.value)}
                    className="w-full bg-base border border-white/15 rounded-lg px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-semantic-purple"
                  >
                    {courses.map((c) => (
                      <option key={c.id} value={`${c.name} (${c.section})`}>
                        {c.name} ({c.section}) - {c.studentsCount} Students
                      </option>
                    ))}
                    <option value="All Mentored Classes">All Mentored Classes ({totalStudents} Students)</option>
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
