import { useState, useEffect } from 'react'
import {
  Calendar, Clock, Plus, AlertCircle, ShieldAlert, UserCheck,
  UserX, ArrowRight, Check, X, RefreshCw, MapPin, Building,
  AlertTriangle, CheckCircle2, ChevronRight, UserPlus
} from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { useToast } from '@/components/ui/toast'
import {
  subscribeTeacherTimetable, addTimetableSlot,
  updateTimetableSlot, deleteTimetableSlot
} from '@/services/teacherService'
import { cn } from '@/lib/utils'

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

export default function TeacherTimetableGrid({ user, courses = [] }) {
  const { success, error: toastError, confirm } = useToast()
  const [slots, setSlots] = useState([])
  const [showAddModal, setShowAddModal] = useState(false)
  const [showProxyModal, setShowProxyModal] = useState(null)
  const [clashError, setClashError] = useState('')

  const [form, setForm] = useState({
    courseId: '',
    dayOfWeek: 'Monday',
    startTime: '09:00',
    endTime: '10:00',
    slotType: 'LECTURE',
    roomNumber: 'LH-204',
    building: 'Engineering Block',
    section: 'Sec 3A'
  })

  const [proxyForm, setProxyForm] = useState({
    substituteName: '',
    substituteEmail: '',
    reason: 'Academic Conference Leave',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  })

  useEffect(() => {
    if (!user?.uid) return
    const unsub = subscribeTeacherTimetable(user.uid, (data) => {
      setSlots(data)
    })
    return unsub
  }, [user?.uid])

  // Clash detection logic
  const checkClash = (newSlot, excludeId = null) => {
    for (const existing of slots) {
      if (excludeId && existing.id === excludeId) continue
      if (existing.dayOfWeek !== newSlot.dayOfWeek) continue
      if (existing.status === 'CANCELLED') continue

      // Time overlap check: start1 < end2 && start2 < end1
      const overlaps = (existing.startTime < newSlot.endTime) && (newSlot.startTime < existing.endTime)
      if (overlaps) {
        if (existing.roomNumber === newSlot.roomNumber) {
          return `Room Clash: ${newSlot.roomNumber} is already booked by ${existing.courseCode || 'another class'} from ${existing.startTime} to ${existing.endTime}.`
        }
        return `Instructor Schedule Clash: You already have ${existing.courseTitle || 'a class'} scheduled from ${existing.startTime} to ${existing.endTime}.`
      }
    }
    return null
  }

  const handleAddSlot = async (e) => {
    e.preventDefault()
    setClashError('')

    const clash = checkClash(form)
    if (clash) {
      setClashError(clash)
      return
    }

    const selectedCourse = courses.find(c => c.id === form.courseId) || {}

    try {
      await addTimetableSlot({
        ...form,
        instructorUid: user.uid,
        instructorName: user.displayName || 'Instructor',
        courseCode: selectedCourse.courseCode || 'GEN-101',
        courseTitle: selectedCourse.title || 'Lecture Slot'
      })
      setShowAddModal(false)
    } catch (err) {
      toastError('Error saving slot', err.message)
    }
  }

  const handleAssignProxy = async (slotId) => {
    try {
      await updateTimetableSlot(slotId, {
        proxyAssignment: {
          isProxyActive: true,
          ...proxyForm
        }
      })
      setShowProxyModal(null)
    } catch (err) {
      toastError('Error assigning proxy', err.message)
    }
  }

  const handleRemoveProxy = async (slotId) => {
    try {
      await updateTimetableSlot(slotId, {
        proxyAssignment: { isProxyActive: false }
      })
    } catch (err) {
      toastError('Error removing proxy', err.message)
    }
  }

  const handleToggleCancel = async (slot) => {
    const newStatus = slot.status === 'CANCELLED' ? 'SCHEDULED' : 'CANCELLED'
    try {
      await updateTimetableSlot(slot.id, { status: newStatus })
    } catch (err) {
      toastError('Error updating class status', err.message)
    }
  }

  return (
    <div className="space-y-4">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-card border border-border-subtle shadow-sm">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-accent/20 text-accent flex items-center justify-center font-bold">
            <Calendar className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-text-primary">Weekly Routine & Timetable Matrix</h2>
            <p className="text-xs text-text-muted">Automated clash detection, lecture room mapping, and substitute teacher proxy assignments.</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setClashError('')
              setShowAddModal(true)
            }}
            className="px-3.5 py-2 rounded-xl bg-accent hover:bg-accent-light text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-accent/20 transition-all shrink-0"
          >
            <Plus className="h-4 w-4" />
            <span>Add Class Slot</span>
          </button>
        </div>
      </div>

      {/* Weekly Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
        {DAYS.map((day) => {
          const daySlots = slots.filter(s => s.dayOfWeek.toLowerCase() === day.toLowerCase())
          return (
            <div key={day} className="rounded-2xl border border-border-subtle bg-surface/70 flex flex-col overflow-hidden shadow-sm">
              <div className="p-3 bg-card border-b border-border-subtle flex items-center justify-between">
                <span className="font-bold text-xs text-text-primary">{day}</span>
                <span className="text-[10px] font-mono font-bold bg-base px-2 py-0.5 rounded-full border border-border-subtle text-text-muted">
                  {daySlots.length}
                </span>
              </div>

              <div className="p-2 space-y-2 flex-1 min-h-[160px]">
                {daySlots.length === 0 ? (
                  <div className="p-4 text-center text-[10px] text-text-muted border border-dashed border-border-subtle rounded-xl bg-card/40">
                    No classes
                  </div>
                ) : (
                  daySlots.map((slot) => {
                    const isCancelled = slot.status === 'CANCELLED'
                    const hasProxy = slot.proxyAssignment?.isProxyActive
                    return (
                      <div
                        key={slot.id}
                        className={cn(
                          "p-2.5 rounded-xl border transition-all space-y-1.5 shadow-xs relative group",
                          isCancelled
                            ? "bg-semantic-red/10 border-semantic-red/30 opacity-60"
                            : hasProxy
                              ? "bg-amber-500/10 border-amber-500/30"
                              : "bg-card border-border-subtle hover:border-accent/40"
                        )}
                      >
                        <div className="flex items-center justify-between text-[10px] font-mono text-text-muted">
                          <span className="font-bold flex items-center gap-1">
                            <Clock className="h-2.5 w-2.5 text-accent" /> {slot.startTime} - {slot.endTime}
                          </span>
                          <span className="px-1.5 py-0.2 rounded bg-base text-accent font-bold border border-border-subtle">
                            {slot.slotType || 'LEC'}
                          </span>
                        </div>

                        <div>
                          <h4 className={cn("font-bold text-xs text-text-primary line-clamp-1", isCancelled && "line-through")}>
                            {slot.courseTitle || slot.courseCode}
                          </h4>
                          <span className="text-[10px] text-text-muted flex items-center gap-1 mt-0.5">
                            <MapPin className="h-2.5 w-2.5 text-text-muted" /> {slot.roomNumber} ({slot.section})
                          </span>
                        </div>

                        {/* Proxy Notice */}
                        {hasProxy && (
                          <div className="p-1.5 rounded-lg bg-amber-500/15 border border-amber-500/20 text-[10px] text-amber-600 dark:text-amber-300 font-medium">
                            <div className="font-bold flex items-center gap-1">
                              <UserCheck className="h-3 w-3" /> Proxy: {slot.proxyAssignment.substituteName}
                            </div>
                            <span className="text-[9px] opacity-80">{slot.proxyAssignment.reason}</span>
                          </div>
                        )}

                        {/* Quick Slot Actions */}
                        <div className="pt-1.5 border-t border-border-subtle flex items-center justify-between gap-1 text-[10px]">
                          <button
                            onClick={() => setShowProxyModal(slot)}
                            className="text-accent hover:underline font-semibold flex items-center gap-0.5"
                          >
                            <UserPlus className="h-2.5 w-2.5" />
                            <span>{hasProxy ? 'Edit Proxy' : 'Assign Proxy'}</span>
                          </button>

                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleToggleCancel(slot)}
                              className={cn(
                                "px-1.5 py-0.5 rounded font-bold transition-colors",
                                isCancelled ? "bg-semantic-green/20 text-semantic-green" : "text-text-muted hover:text-semantic-red"
                              )}
                              title={isCancelled ? "Restore class" : "Cancel class"}
                            >
                              {isCancelled ? 'Restore' : 'Cancel'}
                            </button>
                            <button
                              onClick={async () => {
                                const ok = await confirm('Remove this class slot from the timetable?', {
                                  title: 'Delete Slot?',
                                  confirmLabel: 'Delete',
                                  destructive: true
                                })
                                if (ok) {
                                  await deleteTimetableSlot(slot.id)
                                }
                              }}
                              className="p-1 text-text-muted hover:text-semantic-red"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Add Slot Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="max-w-md bg-card border border-border-subtle rounded-3xl p-6 text-text-primary">
          <DialogHeader className="pb-3 border-b border-border-subtle">
            <DialogTitle className="font-bold text-base text-text-primary flex items-center gap-2">
              <Calendar className="h-5 w-5 text-accent" />
              Schedule Class Routine Slot
            </DialogTitle>
          </DialogHeader>

            {clashError && (
              <div className="p-3 rounded-xl bg-semantic-red/15 border border-semantic-red/30 text-semantic-red text-xs flex items-start gap-2">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{clashError}</span>
              </div>
            )}

            <form onSubmit={handleAddSlot} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="text-text-secondary font-bold block">Course</label>
                <select
                  value={form.courseId}
                  onChange={(e) => setForm({ ...form, courseId: e.target.value })}
                  className="w-full bg-base border border-border-subtle rounded-xl px-3 py-2 text-text-primary focus:outline-none focus:border-accent"
                >
                  <option value="">Select an active course...</option>
                  {courses.map(c => (
                    <option key={c.id} value={c.id}>{c.title} ({c.courseCode})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-text-secondary font-bold block">Day of Week</label>
                  <select
                    value={form.dayOfWeek}
                    onChange={(e) => setForm({ ...form, dayOfWeek: e.target.value })}
                    className="w-full bg-base border border-border-subtle rounded-xl px-3 py-2 text-text-primary focus:outline-none focus:border-accent"
                  >
                    {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-text-secondary font-bold block">Slot Type</label>
                  <select
                    value={form.slotType}
                    onChange={(e) => setForm({ ...form, slotType: e.target.value })}
                    className="w-full bg-base border border-border-subtle rounded-xl px-3 py-2 text-text-primary focus:outline-none focus:border-accent"
                  >
                    <option value="LECTURE">Theory Lecture</option>
                    <option value="LAB">Practical Lab</option>
                    <option value="TUTORIAL">Tutorial</option>
                    <option value="SEMINAR">Seminar</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-text-secondary font-bold block">Start Time</label>
                  <input
                    type="time"
                    required
                    value={form.startTime}
                    onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                    className="w-full bg-base border border-border-subtle rounded-xl px-3 py-2 text-text-primary focus:outline-none focus:border-accent"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-text-secondary font-bold block">End Time</label>
                  <input
                    type="time"
                    required
                    value={form.endTime}
                    onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                    className="w-full bg-base border border-border-subtle rounded-xl px-3 py-2 text-text-primary focus:outline-none focus:border-accent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-text-secondary font-bold block">Room / Lab No.</label>
                  <input
                    type="text"
                    placeholder="LH-204"
                    value={form.roomNumber}
                    onChange={(e) => setForm({ ...form, roomNumber: e.target.value })}
                    className="w-full bg-base border border-border-subtle rounded-xl px-3 py-2 text-text-primary focus:outline-none focus:border-accent"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-text-secondary font-bold block">Section</label>
                  <input
                    type="text"
                    placeholder="Sec 3A"
                    value={form.section}
                    onChange={(e) => setForm({ ...form, section: e.target.value })}
                    className="w-full bg-base border border-border-subtle rounded-xl px-3 py-2 text-text-primary focus:outline-none focus:border-accent"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-text-secondary hover:text-text-primary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-accent hover:bg-accent-light text-white font-bold shadow-lg shadow-accent/25"
                >
                  Save Slot
                </button>
              </div>
            </form>
        </DialogContent>
      </Dialog>

      {/* Proxy / Substitute Assignment Modal */}
      <Dialog open={!!showProxyModal} onOpenChange={(open) => !open && setShowProxyModal(null)}>
        <DialogContent className="max-w-md bg-card border border-border-subtle rounded-3xl p-6 text-text-primary">
          <DialogHeader className="pb-3 border-b border-border-subtle">
            <DialogTitle className="font-bold text-base text-text-primary flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-accent" />
              Assign Proxy / Substitute Teacher
            </DialogTitle>
          </DialogHeader>

            <div className="p-3 rounded-xl bg-surface border border-border-subtle text-xs text-text-muted space-y-1">
              <div><strong className="text-text-primary">Slot:</strong> {showProxyModal?.dayOfWeek} {showProxyModal?.startTime}-{showProxyModal?.endTime}</div>
              <div><strong className="text-text-primary">Class:</strong> {showProxyModal?.courseTitle} ({showProxyModal?.roomNumber})</div>
            </div>

            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="text-text-secondary font-bold block">Substitute Colleague Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Prof. Priya Nair"
                  value={proxyForm.substituteName}
                  onChange={(e) => setProxyForm({ ...proxyForm, substituteName: e.target.value })}
                  className="w-full bg-base border border-border-subtle rounded-xl px-3 py-2 text-text-primary focus:outline-none focus:border-accent"
                />
              </div>

              <div className="space-y-1">
                <label className="text-text-secondary font-bold block">Colleague Email</label>
                <input
                  type="email"
                  placeholder="priya@placify.edu"
                  value={proxyForm.substituteEmail}
                  onChange={(e) => setProxyForm({ ...proxyForm, substituteEmail: e.target.value })}
                  className="w-full bg-base border border-border-subtle rounded-xl px-3 py-2 text-text-primary focus:outline-none focus:border-accent"
                />
              </div>

              <div className="space-y-1">
                <label className="text-text-secondary font-bold block">Reason / Purpose</label>
                <input
                  type="text"
                  placeholder="e.g. Attending IEEE Conference"
                  value={proxyForm.reason}
                  onChange={(e) => setProxyForm({ ...proxyForm, reason: e.target.value })}
                  className="w-full bg-base border border-border-subtle rounded-xl px-3 py-2 text-text-primary focus:outline-none focus:border-accent"
                />
              </div>

              <div className="flex items-center justify-between gap-3 pt-3">
                {showProxyModal?.proxyAssignment?.isProxyActive && (
                  <button
                    type="button"
                    onClick={() => handleRemoveProxy(showProxyModal.id)}
                    className="px-3 py-2 rounded-xl text-semantic-red hover:bg-semantic-red/10 border border-semantic-red/20 font-bold"
                  >
                    Remove Proxy
                  </button>
                )}
                <div className="flex items-center gap-2 ml-auto">
                  <button
                    type="button"
                    onClick={() => setShowProxyModal(null)}
                    className="px-4 py-2 rounded-xl text-text-secondary hover:text-text-primary"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => showProxyModal?.id && handleAssignProxy(showProxyModal.id)}
                    className="px-6 py-2 rounded-xl bg-accent hover:bg-accent-light text-white font-bold shadow-lg shadow-accent/25"
                  >
                    Confirm Proxy
                  </button>
                </div>
              </div>
            </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
