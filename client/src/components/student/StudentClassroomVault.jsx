import { useState, useEffect } from 'react'
import {
  School, Bell, Calendar, Clock, Code2, Layers, Users, Plus,
  Sparkles, Pin, CheckCircle2, UserCheck, ExternalLink, ArrowRight,
  BookOpen, Trash2, Undo2, MapPin, Video, Award, AlertCircle, Play
} from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { useToast } from '@/components/ui/toast'
import CustomDropdown from '@/components/ui/CustomDropdown'
import StudentCourseEnrollModal from '@/components/teacher/StudentCourseEnrollModal'
import StudentCodingAssessmentModal from '@/components/teacher/StudentCodingAssessmentModal'
import {
  subscribeStudentEnrolledCourses,
  subscribeCourseNotices,
  subscribeCourseAssignments,
  subscribeTeacherTimetable,
  subscribeSyllabus,
  subscribeCourseOfficeHours,
  subscribeStudentBookedOfficeHours,
  bookOfficeHourSlot,
  cancelOfficeHourBooking
} from '@/services/teacherService'
import { cn } from '@/lib/utils'

export default function StudentClassroomVault({ user, profile }) {
  const { success, error: toastError, confirm } = useToast()

  const [enrolledCourses, setEnrolledCourses] = useState([])
  const [selectedCourse, setSelectedCourse] = useState(null)
  const [activeTab, setActiveTab] = useState('notices') // 'notices' | 'assessments' | 'timetable' | 'syllabus' | 'officeHours'
  const [showEnrollModal, setShowEnrollModal] = useState(false)

  // Subscribed course data
  const [notices, setNotices] = useState([])
  const [assignments, setAssignments] = useState([])
  const [timetableSlots, setTimetableSlots] = useState([])
  const [syllabus, setSyllabus] = useState(null)
  const [officeHours, setOfficeHours] = useState([])
  const [myBookings, setMyBookings] = useState([])

  // Assessment taking modal state
  const [activeAssessmentForTest, setActiveAssessmentForTest] = useState(null)

  // Booking modal state
  const [slotToBook, setSlotToBook] = useState(null)
  const [doubtText, setDoubtText] = useState('')
  const [rollNumber, setRollNumber] = useState(profile?.rollNumber || '')
  const [bookingLoading, setBookingLoading] = useState(false)

  // 1. Subscribe to student's enrolled courses
  useEffect(() => {
    if (!user?.uid) return
    const unsub = subscribeStudentEnrolledCourses(user.uid, (data) => {
      setEnrolledCourses(data)
      if (data.length > 0 && !selectedCourse) {
        setSelectedCourse(data[0])
      }
    })
    return unsub
  }, [user?.uid])

  // 2. Subscribe to selected course notices
  useEffect(() => {
    if (!selectedCourse?.courseId && !selectedCourse?.id) {
      setNotices([])
      return
    }
    const cId = selectedCourse.courseId || selectedCourse.id
    const unsub = subscribeCourseNotices(cId, (data) => {
      setNotices(data)
    })
    return unsub
  }, [selectedCourse?.courseId, selectedCourse?.id])

  // 3. Subscribe to assignments for selected course
  useEffect(() => {
    if (!selectedCourse?.courseId && !selectedCourse?.id) {
      setAssignments([])
      return
    }
    const cId = selectedCourse.courseId || selectedCourse.id
    const unsub = subscribeCourseAssignments(cId, (data) => {
      setAssignments(data)
    })
    return unsub
  }, [selectedCourse?.courseId, selectedCourse?.id])

  // 4. Subscribe to timetable of instructor
  useEffect(() => {
    if (!selectedCourse?.instructorUid) {
      setTimetableSlots([])
      return
    }
    const unsub = subscribeTeacherTimetable(selectedCourse.instructorUid, (data) => {
      const cId = selectedCourse.courseId || selectedCourse.id
      const relevant = data.filter(t => t.courseId === cId || !t.courseId)
      setTimetableSlots(relevant)
    })
    return unsub
  }, [selectedCourse?.instructorUid, selectedCourse?.courseId, selectedCourse?.id])

  // 5. Subscribe to syllabus
  useEffect(() => {
    if (!selectedCourse?.courseId && !selectedCourse?.id) {
      setSyllabus(null)
      return
    }
    const cId = selectedCourse.courseId || selectedCourse.id
    const unsub = subscribeSyllabus(cId, (data) => {
      setSyllabus(data)
    })
    return unsub
  }, [selectedCourse?.courseId, selectedCourse?.id])

  // 6. Subscribe to office hours & student bookings
  useEffect(() => {
    if (!selectedCourse?.instructorUid && !selectedCourse?.courseId) {
      setOfficeHours([])
      return
    }
    const cId = selectedCourse.courseId || selectedCourse.id
    const unsub = subscribeCourseOfficeHours(selectedCourse.instructorUid, cId, (data) => {
      setOfficeHours(data)
    })
    return unsub
  }, [selectedCourse?.instructorUid, selectedCourse?.courseId])

  useEffect(() => {
    if (!user?.uid) return
    const unsub = subscribeStudentBookedOfficeHours(user.uid, (data) => {
      setMyBookings(data)
    })
    return unsub
  }, [user?.uid])

  // Handle slot reservation
  const handleConfirmBooking = async (e) => {
    e.preventDefault()
    if (!slotToBook) return
    if (!doubtText.trim()) {
      toastError('Doubt Description Required', 'Please enter a brief description of what you need help with.')
      return
    }

    setBookingLoading(true)
    try {
      await bookOfficeHourSlot(slotToBook.id, user, doubtText, rollNumber)
      setSlotToBook(null)
      setDoubtText('')
      success('Doubt Slot Reserved!', `Your 1-on-1 session with ${slotToBook.instructorName || 'your teacher'} is confirmed.`)
    } catch (err) {
      toastError('Booking Failed', err.message)
    } finally {
      setBookingLoading(false)
    }
  }

  // Handle cancel booking
  const handleCancelBooking = async (slotId) => {
    const ok = await confirm('Cancel this office hour reservation?', {
      title: 'Cancel Doubt Slot?',
      confirmLabel: 'Yes, Cancel',
      destructive: true
    })
    if (!ok) return
    try {
      await cancelOfficeHourBooking(slotId)
      success('Booking Cancelled', 'The slot has been released back to open availability.')
    } catch (err) {
      toastError('Error cancelling', err.message)
    }
  }

  const openSlots = officeHours.filter(s => !s.isBooked)

  return (
    <div className="space-y-6 w-full max-w-full animate-in fade-in duration-300">
      {/* Classroom Vault Top Selector & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl bg-card border border-border-subtle shadow-lg">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="h-12 w-12 rounded-2xl bg-accent/20 text-accent flex items-center justify-center font-bold shadow-inner">
            <School className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg font-black text-text-primary">Academic Classroom Vault</h2>
              <span className="px-2.5 py-0.5 rounded-full bg-accent/15 text-accent text-xs font-bold border border-accent/20">
                {enrolledCourses.length} Enrolled Class{enrolledCourses.length === 1 ? '' : 'es'}
              </span>
            </div>
            <p className="text-xs text-text-muted mt-0.5">
              Access live notices, take proctored coding assessments, check weekly timetable & book 1-on-1 doubt slots.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {enrolledCourses.length > 0 && (
            <CustomDropdown
              options={enrolledCourses.map(c => ({
                value: c.courseId || c.id,
                label: c.title,
                sublabel: `${c.department || 'CSE'} • Prof. ${c.instructorName || 'Faculty'}`,
                badge: `${c.courseCode} • ${c.section}`,
                icon: School
              }))}
              value={selectedCourse?.courseId || selectedCourse?.id || ''}
              onChange={(val) => {
                const c = enrolledCourses.find(item => (item.courseId || item.id) === val)
                if (c) setSelectedCourse(c)
              }}
              placeholder="Select Course..."
              buttonClassName="rounded-2xl font-bold text-accent border-border-subtle"
            />
          )}

          <button
            onClick={() => setShowEnrollModal(true)}
            className="px-4 py-2.5 rounded-2xl bg-accent hover:bg-accent-light text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-accent/25 transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Join Class by Code</span>
          </button>
        </div>
      </div>

      {enrolledCourses.length === 0 ? (
        /* Empty State: Prompt to Join Course */
        <div className="p-12 text-center rounded-3xl bg-card border border-dashed border-border-subtle shadow-md space-y-4 max-w-xl mx-auto">
          <div className="h-16 w-16 rounded-3xl bg-accent/15 text-accent flex items-center justify-center mx-auto shadow-inner">
            <School className="h-8 w-8" />
          </div>
          <div>
            <h3 className="text-lg font-black text-text-primary">No Academic Classrooms Joined Yet</h3>
            <p className="text-xs text-text-muted mt-1 leading-relaxed max-w-md mx-auto">
              Ask your professor or mentor for their 6-character course code (e.g. <span className="font-mono font-bold text-accent">VD9222</span>) to access class notices, syllabus pacing, assignments, and book doubt clearing slots.
            </p>
          </div>
          <button
            onClick={() => setShowEnrollModal(true)}
            className="px-6 py-3 rounded-2xl bg-accent hover:bg-accent-light text-white font-bold text-xs shadow-lg shadow-accent/25 transition-all flex items-center gap-2 mx-auto cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Enter 6-Character Course Code</span>
          </button>
        </div>
      ) : (
        /* Enrolled Course Workspace */
        <div className="space-y-5">
          {/* Course Metadata Banner */}
          {selectedCourse && (
            <div className="p-4 rounded-2xl bg-surface/70 border border-border-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3">
                <span className="px-2.5 py-1 rounded-xl bg-accent text-white font-mono font-black text-xs tracking-wider shadow-sm">
                  {selectedCourse.courseCode}
                </span>
                <div>
                  <h3 className="font-bold text-sm text-text-primary">{selectedCourse.title}</h3>
                  <span className="text-text-muted">
                    {selectedCourse.section} • {selectedCourse.department} • Instructor: <span className="text-text-primary font-semibold">{selectedCourse.instructorName || 'Faculty'}</span>
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-xl bg-card border border-border-subtle font-mono text-[11px] font-bold text-accent">
                  {notices.length} Notices
                </span>
                <span className="px-3 py-1 rounded-xl bg-card border border-border-subtle font-mono text-[11px] font-bold text-semantic-purple">
                  {assignments.length} Assessments
                </span>
                <span className="px-3 py-1 rounded-xl bg-card border border-border-subtle font-mono text-[11px] font-bold text-semantic-green">
                  {openSlots.length} Open Slots
                </span>
              </div>
            </div>
          )}

          {/* Classroom Navigation Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-surface/80 border border-border-subtle rounded-2xl overflow-x-auto scrollbar-none text-xs">
            <button
              onClick={() => setActiveTab('notices')}
              className={cn(
                "px-4 py-2.5 rounded-xl font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer",
                activeTab === 'notices' ? "bg-card text-accent border border-border-subtle shadow-sm" : "text-text-secondary hover:text-text-primary"
              )}
            >
              <Bell className="h-4 w-4" />
              <span>Broadcast Notices ({notices.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('assessments')}
              className={cn(
                "px-4 py-2.5 rounded-xl font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer",
                activeTab === 'assessments' ? "bg-card text-accent border border-border-subtle shadow-sm" : "text-text-secondary hover:text-text-primary"
              )}
            >
              <Code2 className="h-4 w-4 text-semantic-purple" />
              <span>Coding Assessments ({assignments.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('timetable')}
              className={cn(
                "px-4 py-2.5 rounded-xl font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer",
                activeTab === 'timetable' ? "bg-card text-accent border border-border-subtle shadow-sm" : "text-text-secondary hover:text-text-primary"
              )}
            >
              <Calendar className="h-4 w-4 text-blue-500" />
              <span>Class Routine & Timetable</span>
            </button>

            <button
              onClick={() => setActiveTab('syllabus')}
              className={cn(
                "px-4 py-2.5 rounded-xl font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer",
                activeTab === 'syllabus' ? "bg-card text-accent border border-border-subtle shadow-sm" : "text-text-secondary hover:text-text-primary"
              )}
            >
              <Layers className="h-4 w-4 text-amber-500" />
              <span>Syllabus & Pace</span>
            </button>

            <button
              onClick={() => setActiveTab('officeHours')}
              className={cn(
                "px-4 py-2.5 rounded-xl font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer",
                activeTab === 'officeHours' ? "bg-card text-accent border border-border-subtle shadow-sm" : "text-text-secondary hover:text-text-primary"
              )}
            >
              <Clock className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              <span>Office Hours & Doubt Sessions ({openSlots.length})</span>
            </button>
          </div>

          {/* Tab 1: Notices */}
          {activeTab === 'notices' && (
            <div className="space-y-3">
              {notices.map((n) => (
                <div
                  key={n.id}
                  className={cn(
                    "p-5 rounded-2xl border transition-all space-y-2 shadow-sm",
                    n.isPinned ? "bg-accent/10 border-accent/30 ring-1 ring-accent/20" : "bg-card border-border-subtle"
                  )}
                >
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 flex-wrap">
                      {n.isPinned && (
                        <span className="px-2 py-0.5 rounded-md bg-accent text-white text-[10px] font-bold flex items-center gap-1">
                          <Pin className="h-3 w-3" /> Pinned
                        </span>
                      )}
                      <span className={cn(
                        "px-2 py-0.5 rounded text-[10px] font-bold",
                        n.priority === 'URGENT' ? "bg-semantic-red/15 text-semantic-red" : "bg-surface text-text-muted border border-border-subtle"
                      )}>
                        {n.priority}
                      </span>
                      <h4 className="font-bold text-sm text-text-primary">{n.title}</h4>
                    </div>

                    <span className="text-[11px] text-text-muted font-mono">
                      {new Date(n.createdAt?.toDate?.() || Date.now()).toLocaleDateString()}
                    </span>
                  </div>

                  <p className="text-xs text-text-secondary leading-relaxed whitespace-pre-wrap">
                    {n.content}
                  </p>

                  <div className="text-[10px] text-text-muted font-mono pt-1">
                    Published by {n.instructorName || 'Course Instructor'}
                  </div>
                </div>
              ))}

              {notices.length === 0 && (
                <div className="p-8 text-center text-xs text-text-muted border border-dashed border-border-subtle rounded-2xl bg-card">
                  No announcements published by the teacher for this course yet.
                </div>
              )}
            </div>
          )}

          {/* Tab 2: Assessments */}
          {activeTab === 'assessments' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {assignments.map((assign) => (
                <div key={assign.id} className="p-5 rounded-2xl bg-card border border-border-subtle flex flex-col justify-between space-y-4 shadow-sm hover:border-accent/40 transition-all">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="px-2.5 py-0.5 rounded-md bg-purple-500/15 text-purple-600 dark:text-purple-300 text-[10px] font-bold uppercase border border-purple-500/30">
                        {assign.difficulty || 'Medium'} • {assign.totalPoints || 100} PTS
                      </span>
                      <span className="text-[11px] text-text-muted font-mono">
                        Due: {new Date(assign.dueDate).toLocaleDateString()}
                      </span>
                    </div>

                    <h4 className="font-bold text-base text-text-primary">{assign.title}</h4>
                    <p className="text-xs text-text-secondary line-clamp-3 mt-1 leading-relaxed">
                      {assign.problemStatement}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-border-subtle flex items-center justify-between gap-2">
                    <span className="text-[11px] text-text-muted">
                      Sandboxed Anti-Cheat Active
                    </span>

                    <button
                      onClick={() => setActiveAssessmentForTest(assign)}
                      className="px-4 py-2 rounded-xl bg-accent hover:bg-accent-light text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-accent/20 transition-all cursor-pointer"
                    >
                      <Play className="h-3.5 w-3.5 fill-current" />
                      <span>Take Assessment</span>
                    </button>
                  </div>
                </div>
              ))}

              {assignments.length === 0 && (
                <div className="col-span-full p-8 text-center text-xs text-text-muted border border-dashed border-border-subtle rounded-2xl bg-card">
                  No coding assessments published yet for this classroom.
                </div>
              )}
            </div>
          )}

          {/* Tab 3: Timetable */}
          {activeTab === 'timetable' && (
            <div className="p-5 rounded-2xl bg-card border border-border-subtle space-y-4 shadow-sm">
              <h4 className="font-bold text-sm text-text-primary flex items-center gap-2">
                <Calendar className="h-4 w-4 text-accent" /> Weekly Lecture & Lab Schedule
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {timetableSlots.map((slot) => (
                  <div key={slot.id} className="p-4 rounded-xl bg-surface border border-border-subtle space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="px-2 py-0.5 rounded bg-accent/15 text-accent font-bold text-[10px]">
                        {slot.day || 'Monday'}
                      </span>
                      <span className="font-mono text-text-muted text-[11px]">
                        {slot.startTime} - {slot.endTime}
                      </span>
                    </div>

                    <div className="font-bold text-text-primary text-xs">
                      {slot.subject || selectedCourse.title}
                    </div>

                    <div className="text-[11px] text-text-muted flex items-center gap-1.5">
                      <MapPin className="h-3 w-3 text-text-muted" />
                      <span>{slot.roomNumber || 'Assigned Lecture Hall'} • {slot.sessionType || 'Lecture'}</span>
                    </div>
                  </div>
                ))}

                {timetableSlots.length === 0 && (
                  <div className="col-span-full p-6 text-center text-xs text-text-muted border border-dashed border-border-subtle rounded-xl">
                    No weekly timetable routine added for this course yet.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tab 4: Syllabus */}
          {activeTab === 'syllabus' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-card border border-border-subtle flex items-center justify-between gap-3 text-xs shadow-sm">
                <div>
                  <span className="text-text-muted font-bold block uppercase text-[10px]">Syllabus Delivery Progress</span>
                  <span className="text-base font-black text-text-primary">
                    {syllabus?.pacingMetrics?.overallCompletionPercentage || 0}% Completed
                  </span>
                </div>

                <span className={cn(
                  "px-3 py-1 rounded-xl text-xs font-bold",
                  syllabus?.pacingMetrics?.pacingStatus === 'AHEAD'
                    ? "bg-semantic-green/15 text-semantic-green"
                    : syllabus?.pacingMetrics?.pacingStatus === 'BEHIND_SCHEDULE'
                    ? "bg-semantic-red/15 text-semantic-red"
                    : "bg-accent/15 text-accent"
                )}>
                  {syllabus?.pacingMetrics?.pacingStatus?.replace('_', ' ') || 'ON TRACK'}
                </span>
              </div>

              <div className="space-y-3">
                {(syllabus?.units || []).map((u, uIdx) => (
                  <div key={uIdx} className="p-4 rounded-2xl bg-card border border-border-subtle space-y-3 shadow-sm">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-sm text-text-primary">{u.title}</h4>
                      <span className="text-xs text-text-muted font-mono font-bold">
                        Weightage: {u.marksWeightage || 20} Marks
                      </span>
                    </div>

                    <div className="space-y-2">
                      {(u.chapters || []).map((ch, chIdx) => (
                        <div key={chIdx} className="p-3 rounded-xl bg-surface border border-border-subtle space-y-1.5 text-xs">
                          <span className="font-bold text-text-primary block">{ch.title}</span>
                          <div className="space-y-1">
                            {(ch.subTopics || []).map((st, sIdx) => (
                              <div key={sIdx} className="flex items-center justify-between text-[11px] text-text-secondary">
                                <span className="flex items-center gap-1.5">
                                  {st.isCompleted ? (
                                    <CheckCircle2 className="h-3.5 w-3.5 text-semantic-green shrink-0" />
                                  ) : (
                                    <span className="h-2 w-2 rounded-full bg-border shrink-0" />
                                  )}
                                  <span className={st.isCompleted ? "line-through text-text-muted" : ""}>{st.title}</span>
                                </span>
                                <span className="font-mono text-text-muted">{st.plannedHours} hrs</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}

                {(!syllabus?.units || syllabus.units.length === 0) && (
                  <div className="p-8 text-center text-xs text-text-muted border border-dashed border-border-subtle rounded-2xl bg-card">
                    The instructor has not published unit breakdowns for this syllabus yet.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tab 5: Office Hours & 1-on-1 Doubt Sessions */}
          {activeTab === 'officeHours' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              {/* Left Side: Open Available Slots */}
              <div className="lg:col-span-7 space-y-3">
                <div className="p-4 rounded-2xl bg-card border border-border-subtle flex items-center justify-between shadow-sm">
                  <div>
                    <h4 className="font-bold text-sm text-text-primary flex items-center gap-2">
                      <Clock className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                      Available 1-on-1 Doubt Slots
                    </h4>
                    <p className="text-xs text-text-muted">Book a reservation to discuss project doubts or exam concepts.</p>
                  </div>
                  <span className="px-2.5 py-1 rounded-xl bg-purple-500/15 text-purple-600 dark:text-purple-300 font-bold text-xs">
                    {openSlots.length} Open
                  </span>
                </div>

                <div className="space-y-2.5">
                  {openSlots.map((slot) => (
                    <div key={slot.id} className="p-4 rounded-2xl bg-card border border-border-subtle flex items-center justify-between gap-3 text-xs shadow-sm hover:border-purple-500/40 transition-all">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-text-primary flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5 text-accent" />
                            {slot.date} • {slot.startTime} - {slot.endTime}
                          </span>
                          <span className="px-2 py-0.2 rounded bg-semantic-green/15 text-semantic-green text-[10px] font-bold">
                            Open
                          </span>
                        </div>
                        <p className="text-[11px] text-text-muted truncate max-w-xs font-mono">
                          {slot.meetingLocationOrLink}
                        </p>
                      </div>

                      <button
                        onClick={() => {
                          setSlotToBook(slot)
                          setDoubtText('')
                        }}
                        className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md shadow-purple-500/20 transition-all cursor-pointer shrink-0"
                      >
                        Book Slot
                      </button>
                    </div>
                  ))}

                  {openSlots.length === 0 && (
                    <div className="p-8 text-center text-xs text-text-muted border border-dashed border-border-subtle rounded-2xl bg-card">
                      No open office hour slots at this moment. The teacher will open slots soon.
                    </div>
                  )}
                </div>
              </div>

              {/* Right Side: Student's Booked Sessions */}
              <div className="lg:col-span-5 space-y-3">
                <div className="p-4 rounded-2xl bg-card border border-border-subtle shadow-sm">
                  <h4 className="font-bold text-sm text-text-primary flex items-center gap-2">
                    <UserCheck className="h-4 w-4 text-semantic-green" />
                    My Confirmed Doubt Sessions ({myBookings.length})
                  </h4>
                </div>

                <div className="space-y-2.5">
                  {myBookings.map((b) => (
                    <div key={b.id} className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/30 space-y-2.5 text-xs shadow-sm">
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-text-primary">
                          {b.date} • {b.startTime} - {b.endTime}
                        </span>
                        <button
                          onClick={() => handleCancelBooking(b.id)}
                          className="text-[10px] text-text-muted hover:text-semantic-red font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <Trash2 className="h-3 w-3" /> Cancel
                        </button>
                      </div>

                      {b.doubtDescription && (
                        <p className="p-2 rounded-xl bg-card/80 border border-border-subtle text-text-secondary italic text-xs leading-relaxed">
                          "{b.doubtDescription}"
                        </p>
                      )}

                      <div className="flex items-center justify-between text-[11px] pt-1">
                        <span className="text-text-muted truncate max-w-[150px] font-mono">
                          {b.meetingLocationOrLink}
                        </span>

                        {b.meetingLocationOrLink?.startsWith('http') && (
                          <a
                            href={b.meetingLocationOrLink}
                            target="_blank"
                            rel="noreferrer"
                            className="px-3 py-1 rounded-xl bg-accent text-white font-bold flex items-center gap-1.5 shadow-sm"
                          >
                            <span>Join Video Room</span>
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                      </div>
                    </div>
                  ))}

                  {myBookings.length === 0 && (
                    <div className="p-8 text-center text-xs text-text-muted border border-dashed border-border-subtle rounded-2xl bg-card">
                      You have no active doubt clearing bookings. Click "Book Slot" on any available time on the left.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Join Course Modal */}
      <StudentCourseEnrollModal
        user={user}
        isOpen={showEnrollModal}
        onClose={() => setShowEnrollModal(false)}
        onEnrolled={(newCourse) => {
          setSelectedCourse(newCourse)
          setShowEnrollModal(false)
        }}
      />

      {/* Take Assessment Modal */}
      {activeAssessmentForTest && (
        <StudentCodingAssessmentModal
          user={user}
          assignment={activeAssessmentForTest}
          onClose={() => setActiveAssessmentForTest(null)}
          onSubmitted={() => {
            setActiveAssessmentForTest(null)
            success('Assessment Submitted', 'Your test cases were evaluated and graded.')
          }}
        />
      )}

      {/* Book Slot Dialog */}
      <Dialog open={!!slotToBook} onOpenChange={(open) => !open && setSlotToBook(null)}>
        <DialogContent className="max-w-md bg-card border border-border-subtle rounded-3xl p-6 text-text-primary">
          <DialogHeader className="pb-3 border-b border-border-subtle">
            <DialogTitle className="font-bold text-base text-text-primary flex items-center gap-2">
              <Clock className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              Book 1-on-1 Office Hour Slot
            </DialogTitle>
            <DialogDescription className="text-xs text-text-muted">
              {slotToBook?.date} • {slotToBook?.startTime} to {slotToBook?.endTime} with {slotToBook?.instructorName || 'Professor'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleConfirmBooking} className="space-y-3.5 text-xs">
            <div className="space-y-1">
              <label className="text-text-secondary font-bold block">Your University Roll / ID Number</label>
              <input
                type="text"
                placeholder="e.g. 22CS104"
                value={rollNumber}
                onChange={(e) => setRollNumber(e.target.value)}
                className="w-full bg-base border border-border-subtle rounded-xl px-3.5 py-2 text-text-primary focus:outline-none focus:border-accent"
              />
            </div>

            <div className="space-y-1">
              <label className="text-text-secondary font-bold block">What doubt or topic would you like to discuss? *</label>
              <textarea
                rows={3}
                required
                placeholder="e.g. Doubts in Dynamic Programming memoization table or code review for Assignment #2..."
                value={doubtText}
                onChange={(e) => setDoubtText(e.target.value)}
                className="w-full bg-base border border-border-subtle rounded-xl p-3 text-text-primary focus:outline-none focus:border-accent resize-none leading-relaxed"
              />
            </div>

            <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-[11px] text-purple-600 dark:text-purple-300">
              Meeting Location: <span className="font-mono font-bold">{slotToBook?.meetingLocationOrLink}</span>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setSlotToBook(null)}
                className="px-4 py-2 rounded-xl text-text-secondary hover:text-text-primary font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={bookingLoading || !doubtText.trim()}
                className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-bold shadow-lg shadow-purple-500/25 transition-all cursor-pointer"
              >
                {bookingLoading ? 'Reserving...' : 'Confirm Reservation'}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
