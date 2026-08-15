import { useState } from 'react'
import { School, KeyRound, CheckCircle2, AlertCircle, X, ArrowRight } from 'lucide-react'
import { joinCourseByCode } from '@/services/teacherService'

export default function StudentCourseEnrollModal({ user, isOpen, onClose, onEnrolled }) {
  const [courseCode, setCourseCode] = useState('')
  const [rollNumber, setRollNumber] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [successCourse, setSuccessCourse] = useState(null)

  if (!isOpen) return null

  const handleJoin = async (e) => {
    e.preventDefault()
    if (!courseCode.trim()) return
    setLoading(true)
    setError('')

    try {
      const course = await joinCourseByCode(user, courseCode, rollNumber)
      setSuccessCourse(course)
      if (onEnrolled) onEnrolled(course)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="w-full max-w-md bg-card border border-border-subtle rounded-3xl p-6 shadow-2xl space-y-4 text-text-primary">
        <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
          <h3 className="font-bold text-base text-text-primary flex items-center gap-2">
            <School className="h-5 w-5 text-accent" />
            Join Academic Classroom
          </h3>
          <button onClick={onClose} className="text-text-muted hover:text-text-primary">
            <X className="h-4 w-4" />
          </button>
        </div>

        {successCourse ? (
          <div className="text-center space-y-4 py-4">
            <div className="h-14 w-14 rounded-full bg-semantic-green/20 text-semantic-green flex items-center justify-center mx-auto">
              <CheckCircle2 className="h-7 w-7" />
            </div>
            <div>
              <h4 className="font-bold text-base text-text-primary">Successfully Enrolled!</h4>
              <p className="text-xs text-text-muted mt-1">
                You are now enrolled in <span className="font-bold text-text-primary">{successCourse.title}</span> ({successCourse.section}).
              </p>
            </div>
            <button
              onClick={() => {
                setSuccessCourse(null)
                setCourseCode('')
                onClose()
              }}
              className="w-full py-2.5 rounded-xl bg-accent hover:bg-accent-light text-white font-bold text-xs shadow-lg shadow-accent/25"
            >
              Go to Classroom
            </button>
          </div>
        ) : (
          <form onSubmit={handleJoin} className="space-y-3.5 text-xs">
            {error && (
              <div className="p-3 rounded-xl bg-semantic-red/15 border border-semantic-red/30 text-semantic-red text-xs flex items-start gap-2">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-text-secondary font-bold block">6-Character Course Code *</label>
              <input
                type="text"
                required
                maxLength={6}
                placeholder="e.g. DS302A"
                value={courseCode}
                onChange={(e) => setCourseCode(e.target.value.toUpperCase())}
                className="w-full bg-base border border-border-subtle rounded-xl px-4 py-2.5 font-mono text-center text-lg font-black tracking-widest text-accent uppercase focus:outline-none focus:border-accent"
                autoFocus
              />
              <span className="text-[10px] text-text-muted">Ask your course instructor for the 6-character access code.</span>
            </div>

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

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-text-secondary hover:text-text-primary font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !courseCode.trim()}
                className="px-6 py-2.5 rounded-xl bg-accent hover:bg-accent-light text-white font-bold shadow-lg shadow-accent/25 transition-all flex items-center gap-1.5"
              >
                <span>{loading ? 'Verifying...' : 'Enroll in Course'}</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
