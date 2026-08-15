import { useState, useEffect } from 'react'
import {
  School, BookOpen, Clock, Users, AlertTriangle, CheckCircle2,
  Calendar, Send, Plus, BellRing, Sparkles, FileSpreadsheet, ShieldCheck,
  Edit3, Trash2, X, Check, Eye, Code2, GraduationCap, MessageSquare,
  Layers, Trophy, Award, Flame, TrendingUp
} from 'lucide-react'
import StatsCard from '@/components/dashboard/StatsCard'
import StickyNotesCard from '@/components/notes/StickyNotesCard'
import TeacherCourseManager from '@/components/teacher/TeacherCourseManager'
import TeacherSyllabusTracker from '@/components/teacher/TeacherSyllabusTracker'
import TeacherTimetableGrid from '@/components/teacher/TeacherTimetableGrid'
import TeacherAssignmentStudio from '@/components/teacher/TeacherAssignmentStudio'
import TeacherGradebook from '@/components/teacher/TeacherGradebook'
import TeacherResearchManager from '@/components/teacher/TeacherResearchManager'
import TeacherCommunicationHub from '@/components/teacher/TeacherCommunicationHub'
import { subscribeTeacherCourses } from '@/services/teacherService'
import { useAppStore } from '@/store/useAppStore'
import { cn } from '@/lib/utils'

export default function TeacherDashboard({ user, profile }) {
  const { openAICoach } = useAppStore()
  const [activeTab, setActiveTab] = useState('courses') // 'courses' | 'syllabus' | 'timetable' | 'assignments' | 'research' | 'communication'
  const [courses, setCourses] = useState([])
  const [selectedCourse, setSelectedCourse] = useState(null)
  const [selectedAssignmentForGradebook, setSelectedAssignmentForGradebook] = useState(null)

  useEffect(() => {
    if (!user?.uid) return
    const unsub = subscribeTeacherCourses(user.uid, (data) => {
      setCourses(data)
      if (data.length > 0 && !selectedCourse) {
        setSelectedCourse(data[0])
      }
    })
    return unsub
  }, [user?.uid])

  const totalStudents = courses.reduce((sum, c) => sum + (c.studentsCount || 0), 0)

  return (
    <div className="space-y-6 w-full max-w-full">
      {/* Teacher Stats Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <StatsCard
          title="Active Classes"
          value={courses.length}
          subtitle="Assigned academic sections"
          icon={School}
          color="accent"
        />
        <StatsCard
          title="Enrolled Students"
          value={totalStudents}
          subtitle="Across all courses"
          icon={Users}
          color="purple"
        />
        <StatsCard
          title="Live Routine"
          value="Weekly Active"
          subtitle="Clash detector enabled"
          icon={Calendar}
          color="blue"
        />
        <StatsCard
          title="Anti-Cheat System"
          value="100% Armed"
          subtitle="Monaco IDE sandboxes"
          icon={ShieldCheck}
          color="green"
        />
      </div>

      {/* Selected Course Quick Bar */}
      {courses.length > 0 && (
        <div className="p-3.5 rounded-2xl bg-card border border-border-subtle flex items-center justify-between gap-3 flex-wrap text-xs shadow-sm">
          <div className="flex items-center gap-2.5">
            <span className="text-text-muted font-bold">ACTIVE CLASSROOM:</span>
            <select
              value={selectedCourse?.id || ''}
              onChange={(e) => {
                const c = courses.find(item => item.id === e.target.value)
                if (c) setSelectedCourse(c)
              }}
              className="bg-base border border-border-subtle rounded-xl px-3 py-1.5 font-bold text-accent text-xs focus:outline-none focus:border-accent"
            >
              {courses.map(c => (
                <option key={c.id} value={c.id}>
                  {c.title} ({c.courseCode}) • {c.section}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-text-muted">Student Join Code:</span>
            <span className="px-2.5 py-1 rounded-lg bg-base border border-border-subtle font-mono font-black text-accent text-xs tracking-wider">
              {selectedCourse?.courseCode || '------'}
            </span>
          </div>
        </div>
      )}

      {/* Teacher Navigation Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-surface/80 border border-border-subtle rounded-2xl overflow-x-auto scrollbar-none text-xs">
        <button
          onClick={() => {
            setActiveTab('courses')
            setSelectedAssignmentForGradebook(null)
          }}
          className={cn(
            "px-4 py-2 rounded-xl font-bold transition-all flex items-center gap-2 whitespace-nowrap",
            activeTab === 'courses' ? "bg-card text-accent border border-border-subtle shadow-sm" : "text-text-secondary hover:text-text-primary"
          )}
        >
          <School className="h-4 w-4" />
          <span>Courses & Rosters</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('syllabus')
            setSelectedAssignmentForGradebook(null)
          }}
          className={cn(
            "px-4 py-2 rounded-xl font-bold transition-all flex items-center gap-2 whitespace-nowrap",
            activeTab === 'syllabus' ? "bg-card text-accent border border-border-subtle shadow-sm" : "text-text-secondary hover:text-text-primary"
          )}
        >
          <Layers className="h-4 w-4" />
          <span>Syllabus Tracker & Pace</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('timetable')
            setSelectedAssignmentForGradebook(null)
          }}
          className={cn(
            "px-4 py-2 rounded-xl font-bold transition-all flex items-center gap-2 whitespace-nowrap",
            activeTab === 'timetable' ? "bg-card text-accent border border-border-subtle shadow-sm" : "text-text-secondary hover:text-text-primary"
          )}
        >
          <Calendar className="h-4 w-4" />
          <span>Class Routine & Proxy</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('assignments')
            setSelectedAssignmentForGradebook(null)
          }}
          className={cn(
            "px-4 py-2 rounded-xl font-bold transition-all flex items-center gap-2 whitespace-nowrap",
            activeTab === 'assignments' ? "bg-card text-accent border border-border-subtle shadow-sm" : "text-text-secondary hover:text-text-primary"
          )}
        >
          <Code2 className="h-4 w-4" />
          <span>Coding Assessments</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('research')
            setSelectedAssignmentForGradebook(null)
          }}
          className={cn(
            "px-4 py-2 rounded-xl font-bold transition-all flex items-center gap-2 whitespace-nowrap",
            activeTab === 'research' ? "bg-card text-accent border border-border-subtle shadow-sm" : "text-text-secondary hover:text-text-primary"
          )}
        >
          <GraduationCap className="h-4 w-4" />
          <span>Research Manager</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('communication')
            setSelectedAssignmentForGradebook(null)
          }}
          className={cn(
            "px-4 py-2 rounded-xl font-bold transition-all flex items-center gap-2 whitespace-nowrap",
            activeTab === 'communication' ? "bg-card text-accent border border-border-subtle shadow-sm" : "text-text-secondary hover:text-text-primary"
          )}
        >
          <MessageSquare className="h-4 w-4" />
          <span>Notices & Office Hours</span>
        </button>
      </div>

      {/* Tab Panels */}
      <div>
        {activeTab === 'courses' && (
          <TeacherCourseManager
            user={user}
            selectedCourseId={selectedCourse?.id}
            onSelectCourse={(c) => setSelectedCourse(c)}
          />
        )}

        {activeTab === 'syllabus' && (
          selectedCourse ? (
            <TeacherSyllabusTracker course={selectedCourse} />
          ) : (
            <div className="p-8 text-center bg-card rounded-2xl border border-dashed border-border-subtle text-text-muted text-xs">
              Please create or select a course from the Courses tab to manage syllabus.
            </div>
          )
        )}

        {activeTab === 'timetable' && (
          <TeacherTimetableGrid user={user} courses={courses} />
        )}

        {activeTab === 'assignments' && (
          selectedAssignmentForGradebook ? (
            <TeacherGradebook
              assignment={selectedAssignmentForGradebook}
              onBack={() => setSelectedAssignmentForGradebook(null)}
            />
          ) : selectedCourse ? (
            <TeacherAssignmentStudio
              user={user}
              course={selectedCourse}
              onViewSubmissions={(assign) => setSelectedAssignmentForGradebook(assign)}
            />
          ) : (
            <div className="p-8 text-center bg-card rounded-2xl border border-dashed border-border-subtle text-text-muted text-xs">
              Please select a course to view and create coding assignments.
            </div>
          )
        )}

        {activeTab === 'research' && (
          selectedCourse ? (
            <TeacherResearchManager user={user} course={selectedCourse} />
          ) : (
            <div className="p-8 text-center bg-card rounded-2xl border border-dashed border-border-subtle text-text-muted text-xs">
              Please select a course to manage research project groups.
            </div>
          )
        )}

        {activeTab === 'communication' && (
          selectedCourse ? (
            <TeacherCommunicationHub user={user} course={selectedCourse} />
          ) : (
            <div className="p-8 text-center bg-card rounded-2xl border border-dashed border-border-subtle text-text-muted text-xs">
              Please select a course to post notices or create office hour slots.
            </div>
          )
        )}
      </div>
    </div>
  )
}
