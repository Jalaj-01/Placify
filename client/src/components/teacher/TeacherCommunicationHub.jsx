import { useState, useEffect } from 'react'
import {
  Bell, Plus, Calendar, Clock, Pin, UserCheck, MessageSquare,
  Sparkles, Trash2, Send, X, AlertCircle, CheckCircle2, ShieldCheck,
  Video, MapPin, ExternalLink, RefreshCw, Undo2
} from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { useToast } from '@/components/ui/toast'
import {
  subscribeCourseNotices, createCourseNotice, deleteCourseNotice,
  subscribeOfficeHours, addOfficeHourSlot, batchCreateOfficeHourSlots,
  deleteOfficeHourSlot, cancelOfficeHourBooking
} from '@/services/teacherService'
import { cn } from '@/lib/utils'

export default function TeacherCommunicationHub({ user, course }) {
  const { success, error: toastError, confirm } = useToast()
  const [notices, setNotices] = useState([])
  const [officeHours, setOfficeHours] = useState([])
  const [showNoticeModal, setShowNoticeModal] = useState(false)
  const [showSlotModal, setShowSlotModal] = useState(false)

  const [noticeForm, setNoticeForm] = useState({
    title: '',
    content: '',
    priority: 'NORMAL',
    isPinned: false
  })

  const [slotForm, setSlotForm] = useState({
    date: new Date().toISOString().split('T')[0],
    startTime: '14:00',
    endTime: '16:00',
    slotDurationMinutes: '30', // '15' | '30' | '45' | '60' | 'entire'
    meetingLocationOrLink: 'https://meet.google.com/xyz-abcd-efg'
  })

  useEffect(() => {
    if (!course?.id) return
    const unsub = subscribeCourseNotices(course.id, (data) => {
      setNotices(data)
    })
    return unsub
  }, [course?.id])

  useEffect(() => {
    if (!user?.uid) return
    const unsub = subscribeOfficeHours(user.uid, (data) => {
      setOfficeHours(data)
    })
    return unsub
  }, [user?.uid])

  const handleCreateNotice = async (e) => {
    e.preventDefault()
    if (!noticeForm.title.trim() || !noticeForm.content.trim()) return

    try {
      await createCourseNotice(course.id, {
        ...noticeForm,
        instructorUid: user.uid,
        instructorName: user.displayName || 'Instructor'
      })
      setShowNoticeModal(false)
      setNoticeForm({ title: '', content: '', priority: 'NORMAL', isPinned: false })
      success('Notice Published', 'Classroom announcement broadcasted to all students.')
    } catch (err) {
      toastError('Failed to post notice', err.message)
    }
  }

  // Calculate generated slots preview
  const generateSlotsPreview = () => {
    const { startTime, endTime, slotDurationMinutes, date } = slotForm
    if (!startTime || !endTime) return []

    const [startH, startM] = startTime.split(':').map(Number)
    const [endH, endM] = endTime.split(':').map(Number)
    const startMinutes = startH * 60 + startM
    const endMinutes = endH * 60 + endM

    if (endMinutes <= startMinutes) return []

    if (slotDurationMinutes === 'entire') {
      return [{
        date,
        startTime,
        endTime,
        courseId: course?.id || '',
        courseCode: course?.courseCode || '',
        courseTitle: course?.title || '',
        meetingLocationOrLink: slotForm.meetingLocationOrLink
      }]
    }

    const duration = parseInt(slotDurationMinutes, 10) || 15
    const slots = []
    let current = startMinutes

    while (current + duration <= endMinutes) {
      const sH = String(Math.floor(current / 60)).padStart(2, '0')
      const sM = String(current % 60).padStart(2, '0')
      const next = current + duration
      const eH = String(Math.floor(next / 60)).padStart(2, '0')
      const eM = String(next % 60).padStart(2, '0')

      slots.push({
        date,
        startTime: `${sH}:${sM}`,
        endTime: `${eH}:${eM}`,
        courseId: course?.id || '',
        courseCode: course?.courseCode || '',
        courseTitle: course?.title || '',
        meetingLocationOrLink: slotForm.meetingLocationOrLink
      })
      current = next
    }

    return slots
  }

  const generatedSlots = generateSlotsPreview()

  const handleAddOfficeSlot = async (e) => {
    e.preventDefault()
    if (generatedSlots.length === 0) {
      toastError('Invalid Time Window', 'End time must be after start time.')
      return
    }

    try {
      const slotsPayload = generatedSlots.map(s => ({
        ...s,
        instructorUid: user.uid,
        instructorName: user.displayName || 'Instructor',
        instructorEmail: user.email || ''
      }))

      await batchCreateOfficeHourSlots(slotsPayload)
      setShowSlotModal(false)
      success('Slots Published', `${slotsPayload.length} reservation slot(s) added for students.`)
    } catch (err) {
      toastError('Failed to add office slots', err.message)
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
      {/* Left Column: Course Broadcast Notice Board (7 cols) */}
      <div className="lg:col-span-7 space-y-4">
        <div className="flex items-center justify-between p-4 rounded-2xl bg-card border border-border-subtle shadow-sm">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-accent/20 text-accent flex items-center justify-center font-bold">
              <Bell className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-text-primary">Classroom Notice Board</h3>
              <p className="text-xs text-text-muted">Broadcast announcements and deadlines to enrolled students.</p>
            </div>
          </div>

          <button
            onClick={() => setShowNoticeModal(true)}
            className="px-3.5 py-2 rounded-xl bg-accent hover:bg-accent-light text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-accent/20 transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4" /> Post Notice
          </button>
        </div>

        <div className="space-y-3">
          {notices.map((notice) => (
            <div
              key={notice.id}
              className={cn(
                "p-4 rounded-2xl border transition-all space-y-2 relative shadow-sm",
                notice.isPinned ? "bg-accent/10 border-accent/30" : "bg-card border-border-subtle"
              )}
            >
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  {notice.isPinned && (
                    <span className="px-2 py-0.5 rounded bg-accent text-white text-[10px] font-bold flex items-center gap-1">
                      <Pin className="h-3 w-3" /> Pinned
                    </span>
                  )}
                  <span className={cn(
                    "px-2 py-0.5 rounded text-[10px] font-bold",
                    notice.priority === 'URGENT' ? "bg-semantic-red/15 text-semantic-red" : "bg-surface text-text-muted"
                  )}>
                    {notice.priority}
                  </span>
                  <span className="font-bold text-text-primary text-xs">{notice.title}</span>
                </div>

                <button
                  onClick={async () => {
                    const ok = await confirm('This notice will be permanently removed.', {
                      title: 'Delete Notice?',
                      confirmLabel: 'Delete',
                      destructive: true
                    })
                    if (ok) {
                      await deleteCourseNotice(course.id, notice.id)
                    }
                  }}
                  className="text-text-muted hover:text-semantic-red p-1 cursor-pointer"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>

              <p className="text-xs text-text-secondary leading-relaxed whitespace-pre-wrap">
                {notice.content}
              </p>

              <div className="text-[10px] text-text-muted font-mono pt-1">
                Posted by {notice.instructorName} • {new Date(notice.createdAt?.toDate?.() || Date.now()).toLocaleDateString()}
              </div>
            </div>
          ))}

          {notices.length === 0 && (
            <div className="p-8 text-center text-xs text-text-muted border border-dashed border-border-subtle rounded-2xl bg-card">
              No notices published for this class yet. Click "Post Notice" above.
            </div>
          )}
        </div>
      </div>

      {/* Right Column: Office Hours 15-Minute Slot Booking (5 cols) */}
      <div className="lg:col-span-5 space-y-4">
        <div className="flex items-center justify-between p-4 rounded-2xl bg-card border border-border-subtle shadow-sm">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
              <Calendar className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-text-primary">Office Hours Doubt Slots</h3>
              <p className="text-xs text-text-muted">1-on-1 reservation windows for students.</p>
            </div>
          </div>

          <button
            onClick={() => setShowSlotModal(true)}
            className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-1 shadow-md shadow-purple-500/20 transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4" /> Add Slot
          </button>
        </div>

        <div className="space-y-2.5">
          {officeHours.map((slot) => (
            <div
              key={slot.id}
              className={cn(
                "p-3.5 rounded-2xl border transition-all space-y-2 shadow-sm",
                slot.isBooked ? "bg-purple-500/10 border-purple-500/30" : "bg-card border-border-subtle"
              )}
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono font-bold text-text-primary flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-accent" />
                  {slot.date} • {slot.startTime} - {slot.endTime}
                </span>

                <div className="flex items-center gap-1.5">
                  <span className={cn(
                    "px-2.5 py-0.5 rounded-full text-[10px] font-bold border",
                    slot.isBooked
                      ? "bg-semantic-green/15 text-semantic-green border-semantic-green/30"
                      : "bg-surface text-text-muted border-border-subtle"
                  )}>
                    {slot.isBooked ? '● Reserved' : '○ Open'}
                  </span>

                  <button
                    onClick={async () => {
                      const ok = await confirm('This office hour slot will be removed.', {
                        title: 'Delete Slot?',
                        confirmLabel: 'Delete',
                        destructive: true
                      })
                      if (ok) {
                        await deleteOfficeHourSlot(slot.id)
                      }
                    }}
                    className="p-1 text-text-muted hover:text-semantic-red cursor-pointer"
                    title="Delete Slot"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {slot.isBooked ? (
                <div className="p-3 rounded-xl bg-card border border-purple-500/20 text-xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="font-bold text-text-primary flex items-center gap-1.5">
                      <UserCheck className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                      <span>{slot.studentName || 'Student'}</span>
                      {slot.studentRollNumber && (
                        <span className="px-1.5 py-0.2 rounded bg-base text-text-muted text-[10px] font-mono border border-border-subtle">
                          {slot.studentRollNumber}
                        </span>
                      )}
                    </div>

                    <button
                      onClick={async () => {
                        const ok = await confirm(`Cancel booking with ${slot.studentName} and reopen slot?`, {
                          title: 'Reopen Slot?',
                          confirmLabel: 'Reopen',
                          destructive: false
                        })
                        if (ok) {
                          await cancelOfficeHourBooking(slot.id)
                        }
                      }}
                      className="text-[10px] text-text-muted hover:text-accent font-bold flex items-center gap-1"
                    >
                      <Undo2 className="h-3 w-3" /> Reopen
                    </button>
                  </div>

                  {slot.doubtDescription && (
                    <p className="text-xs text-text-secondary italic bg-surface/70 p-2 rounded-lg border border-border-subtle">
                      "{slot.doubtDescription}"
                    </p>
                  )}

                  {slot.meetingLocationOrLink && (
                    <div className="pt-1 flex items-center justify-between text-[11px]">
                      <span className="text-text-muted truncate max-w-[200px]">
                        {slot.meetingLocationOrLink}
                      </span>
                      {slot.meetingLocationOrLink.startsWith('http') && (
                        <a
                          href={slot.meetingLocationOrLink}
                          target="_blank"
                          rel="noreferrer"
                          className="px-2 py-0.5 rounded bg-accent text-white font-bold flex items-center gap-1 text-[10px]"
                        >
                          Join Meet <ExternalLink className="h-2.5 w-2.5" />
                        </a>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-between text-[11px] text-text-muted pt-1">
                  <span className="truncate max-w-[240px] font-mono">
                    {slot.meetingLocationOrLink}
                  </span>
                  <span className="text-[10px] font-bold text-accent">Ready for Booking</span>
                </div>
              )}
            </div>
          ))}

          {officeHours.length === 0 && (
            <div className="p-8 text-center text-xs text-text-muted border border-dashed border-border-subtle rounded-2xl bg-card">
              No office hour slots created yet. Click "+ Add Slot" to open 1–2 hour doubt clearing windows.
            </div>
          )}
        </div>
      </div>

      {/* Post Notice Modal */}
      <Dialog open={showNoticeModal} onOpenChange={setShowNoticeModal}>
        <DialogContent className="max-w-md bg-card border border-border-subtle rounded-3xl p-6 text-text-primary">
          <DialogHeader className="pb-3 border-b border-border-subtle">
            <DialogTitle className="font-bold text-base text-text-primary flex items-center gap-2">
              <Bell className="h-5 w-5 text-accent" />
              Post Classroom Announcement
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleCreateNotice} className="space-y-3.5 text-xs">
            <div className="space-y-1">
              <label className="text-text-secondary font-bold block">Notice Title *</label>
              <input
                type="text"
                required
                placeholder="e.g. Mid-term Quiz Schedule & Syllabus"
                value={noticeForm.title}
                onChange={(e) => setNoticeForm({ ...noticeForm, title: e.target.value })}
                className="w-full bg-base border border-border-subtle rounded-xl px-3.5 py-2.5 text-text-primary focus:outline-none focus:border-accent"
              />
            </div>

            <div className="space-y-1">
              <label className="text-text-secondary font-bold block">Announcement Message *</label>
              <textarea
                rows={4}
                required
                placeholder="Full instructions, room change details, or links..."
                value={noticeForm.content}
                onChange={(e) => setNoticeForm({ ...noticeForm, content: e.target.value })}
                className="w-full bg-base border border-border-subtle rounded-xl p-3 text-text-primary focus:outline-none focus:border-accent resize-none"
              />
            </div>

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer font-bold">
                <input
                  type="checkbox"
                  checked={noticeForm.isPinned}
                  onChange={(e) => setNoticeForm({ ...noticeForm, isPinned: e.target.checked })}
                  className="rounded accent-accent"
                />
                <span>Pin to top of notice board</span>
              </label>

              <select
                value={noticeForm.priority}
                onChange={(e) => setNoticeForm({ ...noticeForm, priority: e.target.value })}
                className="bg-base border border-border-subtle rounded-xl px-3 py-1.5 text-text-primary font-bold text-xs"
              >
                <option value="NORMAL">Normal Priority</option>
                <option value="IMPORTANT">Important</option>
                <option value="URGENT">Urgent Priority</option>
              </select>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3">
              <button
                type="button"
                onClick={() => setShowNoticeModal(false)}
                className="px-4 py-2 rounded-xl text-text-secondary hover:text-text-primary font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-accent hover:bg-accent-light text-white font-bold shadow-lg shadow-accent/25 cursor-pointer"
              >
                Broadcast Notice
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add Office Hour Slot Generator Modal */}
      <Dialog open={showSlotModal} onOpenChange={setShowSlotModal}>
        <DialogContent className="max-w-lg bg-card border border-border-subtle rounded-3xl p-6 text-text-primary">
          <DialogHeader className="pb-3 border-b border-border-subtle">
            <DialogTitle className="font-bold text-base text-text-primary flex items-center gap-2">
              <Calendar className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              Open Office Hours / Doubt Clearing Window
            </DialogTitle>
            <DialogDescription className="text-xs text-text-muted">
              Select your availability window (e.g. 1 hr or 2 hrs). The system will automatically split it into individual student reservation slots.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAddOfficeSlot} className="space-y-4 text-xs">
            <div className="space-y-1">
              <label className="text-text-secondary font-bold block">Availability Date *</label>
              <input
                type="date"
                required
                value={slotForm.date}
                onChange={(e) => setSlotForm({ ...slotForm, date: e.target.value })}
                className="w-full bg-base border border-border-subtle rounded-xl px-3.5 py-2.5 text-text-primary focus:outline-none focus:border-accent"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-text-secondary font-bold block">Window Start Time *</label>
                <input
                  type="time"
                  required
                  value={slotForm.startTime}
                  onChange={(e) => setSlotForm({ ...slotForm, startTime: e.target.value })}
                  className="w-full bg-base border border-border-subtle rounded-xl px-3.5 py-2 text-text-primary focus:outline-none focus:border-accent"
                />
              </div>
              <div className="space-y-1">
                <label className="text-text-secondary font-bold block">Window End Time *</label>
                <input
                  type="time"
                  required
                  value={slotForm.endTime}
                  onChange={(e) => setSlotForm({ ...slotForm, endTime: e.target.value })}
                  className="w-full bg-base border border-border-subtle rounded-xl px-3.5 py-2 text-text-primary focus:outline-none focus:border-accent"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-text-secondary font-bold block">Slot Breakdown Interval</label>
              <select
                value={slotForm.slotDurationMinutes}
                onChange={(e) => setSlotForm({ ...slotForm, slotDurationMinutes: e.target.value })}
                className="w-full bg-base border border-border-subtle rounded-xl px-3.5 py-2.5 text-text-primary font-bold focus:outline-none focus:border-accent"
              >
                <option value="15">15-Minute 1-on-1 Slots (Fast Doubt Clearing)</option>
                <option value="30">30-Minute 1-on-1 Slots (Standard In-depth Doubts)</option>
                <option value="45">45-Minute Slots</option>
                <option value="60">60-Minute (1 Hour) Slots</option>
                <option value="entire">Single Continuous Window (No sub-division)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-text-secondary font-bold block">Meeting Link or Cabin Room *</label>
              <input
                type="text"
                required
                placeholder="e.g. Cabin 402 or https://meet.google.com/..."
                value={slotForm.meetingLocationOrLink}
                onChange={(e) => setSlotForm({ ...slotForm, meetingLocationOrLink: e.target.value })}
                className="w-full bg-base border border-border-subtle rounded-xl px-3.5 py-2.5 text-text-primary focus:outline-none focus:border-accent"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3">
              <button
                type="button"
                onClick={() => setShowSlotModal(false)}
                className="px-4 py-2 rounded-xl text-text-secondary hover:text-text-primary font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={generatedSlots.length === 0}
                className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-bold shadow-lg shadow-purple-500/25 cursor-pointer"
              >
                Publish {generatedSlots.length} Slots Live
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

