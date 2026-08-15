import { useState, useEffect } from 'react'
import {
  BookOpen, Users, Plus, Copy, Check, UserMinus, ShieldAlert,
  Mail, Sparkles, School, GraduationCap, X, Edit3, Trash2,
  ExternalLink, Search, CheckCircle2, AlertCircle, RefreshCw
} from 'lucide-react'
import {
  createCourse, updateCourse, deleteCourse,
  subscribeTeacherCourses, subscribeCourseRoster,
  updateStudentRosterStatus, removeStudentFromRoster, generateCourseCode
} from '@/services/teacherService'
import { cn } from '@/lib/utils'

export default function TeacherCourseManager({ user, onSelectCourse, selectedCourseId }) {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [activeRosterCourse, setActiveRosterCourse] = useState(null)
  const [roster, setRoster] = useState([])
  const [copiedCode, setCopiedCode] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')

  const [formData, setFormData] = useState({
    title: '',
    department: 'Computer Science & Engineering',
    semester: '5th Semester',
    academicYear: '2026-2027',
    section: 'Sec A',
    description: '',
    courseCode: ''
  })

  useEffect(() => {
    if (!user?.uid) return
    const unsub = subscribeTeacherCourses(user.uid, (data) => {
      setCourses(data)
      setLoading(false)
      if (data.length > 0 && !selectedCourseId && onSelectCourse) {
        onSelectCourse(data[0])
      }
    })
    return unsub
  }, [user?.uid])

  useEffect(() => {
    if (!activeRosterCourse) return
    const unsub = subscribeCourseRoster(activeRosterCourse.id, (data) => {
      setRoster(data)
    })
    return unsub
  }, [activeRosterCourse?.id])

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(code)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  const handleCreateCourse = async (e) => {
    e.preventDefault()
    if (!formData.title.trim()) return
    try {
      const created = await createCourse(user, formData)
      setShowCreateModal(false)
      setFormData({
        title: '',
        department: 'Computer Science & Engineering',
        semester: '5th Semester',
        academicYear: '2026-2027',
        section: 'Sec A',
        description: '',
        courseCode: ''
      })
      if (onSelectCourse) onSelectCourse(created)
    } catch (err) {
      alert('Error creating course: ' + err.message)
    }
  }

  const handleDelete = async (courseId, e) => {
    e.stopPropagation()
    if (!confirm('Are you sure you want to archive and delete this course?')) return
    try {
      await deleteCourse(courseId)
    } catch (err) {
      alert('Error deleting course: ' + err.message)
    }
  }

  const filteredCourses = courses.filter(c =>
    c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.courseCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.section.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-4">
      {/* Header action bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-card border border-border-subtle shadow-sm">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-accent/20 text-accent flex items-center justify-center font-bold">
            <School className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-text-primary">Classroom Rosters & Course Vaults</h2>
            <p className="text-xs text-text-muted">Manage academic sections, 6-character access codes, and enrolled student lists.</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setFormData(f => ({ ...f, courseCode: generateCourseCode() }))
              setShowCreateModal(true)
            }}
            className="px-3.5 py-2 rounded-xl bg-accent hover:bg-accent-light text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-accent/20 transition-all shrink-0"
          >
            <Plus className="h-4 w-4" />
            <span>Create New Course</span>
          </button>
        </div>
      </div>

      {/* Course Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCourses.map((c) => {
          const isSelected = selectedCourseId === c.id
          return (
            <div
              key={c.id}
              onClick={() => onSelectCourse && onSelectCourse(c)}
              className={cn(
                "p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-4 relative group shadow-sm",
                isSelected
                  ? "bg-card border-accent shadow-accent/15 ring-2 ring-accent"
                  : "bg-surface/70 hover:bg-card border-border-subtle hover:border-accent/40"
              )}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="px-2 py-0.5 rounded-md bg-accent/15 text-accent text-[10px] font-mono font-bold border border-accent/25">
                    {c.section} • {c.semester}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => handleDelete(c.id, e)}
                      className="p-1 rounded-lg text-text-muted hover:text-semantic-red opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Delete Course"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                <h3 className="font-bold text-sm text-text-primary group-hover:text-accent transition-colors leading-snug line-clamp-1">
                  {c.title}
                </h3>
                <p className="text-xs text-text-secondary line-clamp-2 mt-1">
                  {c.description || `${c.department} • Academic Year ${c.academicYear}`}
                </p>
              </div>

              {/* Course Join Code & Roster Button */}
              <div className="pt-3 border-t border-border-subtle flex items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-1.5 bg-base px-2.5 py-1 rounded-lg border border-border-subtle">
                  <span className="text-[10px] text-text-muted font-bold">CODE:</span>
                  <span className="font-mono font-black text-accent text-xs tracking-wider">{c.courseCode}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleCopyCode(c.courseCode)
                    }}
                    className="p-0.5 hover:text-text-primary text-text-muted"
                    title="Copy 6-character Code"
                  >
                    {copiedCode === c.courseCode ? (
                      <Check className="h-3 w-3 text-semantic-green" />
                    ) : (
                      <Copy className="h-3 w-3" />
                    )}
                  </button>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setActiveRosterCourse(c)
                  }}
                  className="px-2.5 py-1 rounded-lg bg-surface hover:bg-hover border border-border-subtle text-text-secondary hover:text-text-primary text-[11px] font-semibold flex items-center gap-1 transition-colors"
                >
                  <Users className="h-3 w-3 text-accent" />
                  <span>{c.studentsCount || 0} Students</span>
                </button>
              </div>
            </div>
          )
        })}

        {filteredCourses.length === 0 && !loading && (
          <div className="col-span-full p-8 text-center bg-card border border-dashed border-border-subtle rounded-2xl space-y-2">
            <BookOpen className="h-8 w-8 text-text-muted mx-auto" />
            <h4 className="font-bold text-sm text-text-primary">No Courses Created Yet</h4>
            <p className="text-xs text-text-muted">Create your first class to generate a 6-character code for student enrollments.</p>
          </div>
        )}
      </div>

      {/* Roster Management Drawer / Modal */}
      {activeRosterCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-2xl bg-card border border-border-subtle rounded-3xl p-6 shadow-2xl space-y-5 text-text-primary max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-border-subtle shrink-0">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-accent/20 text-accent flex items-center justify-center font-bold">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-text-primary">{activeRosterCourse.title} — Class Roster</h3>
                  <p className="text-xs text-text-muted">
                    Course Code: <span className="font-mono font-bold text-accent">{activeRosterCourse.courseCode}</span> • {roster.length} Enrolled Students
                  </p>
                </div>
              </div>
              <button onClick={() => setActiveRosterCourse(null)} className="p-1 rounded-lg text-text-muted hover:text-text-primary">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Student Table */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {roster.length === 0 ? (
                <div className="p-8 text-center text-xs text-text-muted border border-dashed border-border-subtle rounded-2xl">
                  No students have enrolled in this course yet. Share code <span className="font-mono font-bold text-accent">{activeRosterCourse.courseCode}</span> with your class.
                </div>
              ) : (
                roster.map((st) => (
                  <div key={st.studentUid || st.id} className="p-3 rounded-xl bg-surface border border-border-subtle flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-accent/20 text-accent flex items-center justify-center font-bold text-xs">
                        {st.name?.charAt(0) || 'S'}
                      </div>
                      <div>
                        <div className="font-bold text-text-primary flex items-center gap-2">
                          <span>{st.name}</span>
                          {st.rollNumber && (
                            <span className="px-1.5 py-0.2 rounded bg-base text-text-muted text-[10px] font-mono border border-border-subtle">
                              {st.rollNumber}
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-text-muted">{st.email}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={cn(
                        "px-2 py-0.5 rounded text-[10px] font-bold",
                        st.status === 'ACTIVE' ? "bg-semantic-green/15 text-semantic-green" : "bg-semantic-red/15 text-semantic-red"
                      )}>
                        {st.status || 'ACTIVE'}
                      </span>
                      <button
                        onClick={async () => {
                          if (confirm(`Remove student ${st.name} from the roster?`)) {
                            await removeStudentFromRoster(activeRosterCourse.id, st.studentUid)
                          }
                        }}
                        className="p-1.5 rounded-lg text-text-muted hover:text-semantic-red hover:bg-hover transition-colors"
                        title="Remove from roster"
                      >
                        <UserMinus className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="pt-3 border-t border-border-subtle flex items-center justify-between text-xs text-text-muted shrink-0">
              <span>Students can enroll from their dashboard by entering course code.</span>
              <button
                onClick={() => setActiveRosterCourse(null)}
                className="px-4 py-2 rounded-xl bg-surface hover:bg-hover border border-border-subtle text-text-primary font-bold transition-colors"
              >
                Close Roster
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Course Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-lg bg-card border border-border-subtle rounded-3xl p-6 shadow-2xl space-y-5 text-text-primary">
            <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
              <h3 className="font-bold text-base text-text-primary flex items-center gap-2">
                <School className="h-5 w-5 text-accent" />
                Create New Academic Course
              </h3>
              <button onClick={() => setShowCreateModal(false)} className="text-text-muted hover:text-text-primary">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateCourse} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-text-secondary font-bold block">Course Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Design & Analysis of Algorithms"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-base border border-border-subtle rounded-xl px-3.5 py-2.5 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-text-secondary font-bold block">Department</label>
                  <input
                    type="text"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full bg-base border border-border-subtle rounded-xl px-3 py-2 text-text-primary focus:outline-none focus:border-accent"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-text-secondary font-bold block">Semester</label>
                  <input
                    type="text"
                    value={formData.semester}
                    onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                    className="w-full bg-base border border-border-subtle rounded-xl px-3 py-2 text-text-primary focus:outline-none focus:border-accent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-text-secondary font-bold block">Section / Batch</label>
                  <input
                    type="text"
                    value={formData.section}
                    onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                    className="w-full bg-base border border-border-subtle rounded-xl px-3 py-2 text-text-primary focus:outline-none focus:border-accent"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-text-secondary font-bold block">Course Code (6-char)</label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      maxLength={6}
                      value={formData.courseCode}
                      onChange={(e) => setFormData({ ...formData, courseCode: e.target.value.toUpperCase() })}
                      className="w-full bg-base border border-border-subtle rounded-xl px-3 py-2 font-mono font-bold text-accent uppercase focus:outline-none focus:border-accent"
                    />
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, courseCode: generateCourseCode() })}
                      className="p-2 rounded-xl bg-surface hover:bg-hover border border-border-subtle"
                      title="Generate new code"
                    >
                      <RefreshCw className="h-3.5 w-3.5 text-text-muted" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-text-secondary font-bold block">Course Description</label>
                <textarea
                  rows={2}
                  placeholder="Key objectives, prerequisites, and learning roadmap..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-base border border-border-subtle rounded-xl p-3 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl text-text-secondary hover:text-text-primary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-accent hover:bg-accent-light text-white font-bold shadow-lg shadow-accent/25 transition-all"
                >
                  Create Course
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
