import { useState } from 'react'
import { GraduationCap, School, BookOpenCheck, ShieldCheck, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react'
import { verifyTeacherId, setUserRole } from '@/services/firestoreService'

export default function RoleOnboardingModal({ user, onRoleSaved }) {
  const [selectedRole, setSelectedRole] = useState('student') // 'student' | 'teacher' | 'phd'
  const [teacherId, setTeacherId] = useState('')
  const [department, setDepartment] = useState('Computer Science & Engineering')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSaveRole = async () => {
    setError('')
    if (selectedRole === 'teacher') {
      if (!teacherId.trim()) {
        setError('Teacher Verification ID is mandatory for Faculty access.')
        return
      }
      if (!verifyTeacherId(teacherId)) {
        setError('Invalid Teacher ID! Use code TEACHER2026 or a valid Faculty ID format.')
        return
      }
    }

    setLoading(true)
    try {
      await setUserRole(user.uid, selectedRole, teacherId.trim(), department.trim())
      onRoleSaved(selectedRole)
    } catch (err) {
      console.error('Failed to set role:', err)
      setError('Failed to save role. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-xl rounded-2xl bg-[#0c0d14] border border-white/10 p-6 md:p-8 shadow-2xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-accent/20 text-accent mb-2">
            <GraduationCap className="h-6 w-6 text-accent-light" />
          </div>
          <h2 className="text-2xl font-bold text-text-primary">Welcome to Placify!</h2>
          <p className="text-sm text-text-secondary">
            Select your academic role to unlock tailored dashboard features and automated tracking tools.
          </p>
        </div>

        {/* Role Options */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Student */}
          <button
            type="button"
            onClick={() => setSelectedRole('student')}
            className={`p-4 rounded-xl border text-left transition-all flex flex-col justify-between space-y-3 ${
              selectedRole === 'student'
                ? 'border-accent bg-accent/15 shadow-lg shadow-accent/10 text-white'
                : 'border-white/10 bg-surface/50 text-text-muted hover:border-white/20 hover:bg-surface/80'
            }`}
          >
            <div className="flex items-center justify-between">
              <GraduationCap className="h-6 w-6 text-accent" />
              {selectedRole === 'student' && <CheckCircle2 className="h-4 w-4 text-accent" />}
            </div>
            <div>
              <h3 className="font-semibold text-text-primary text-sm">Student</h3>
              <p className="text-xs text-text-muted mt-1 leading-relaxed">
                Placement prep, auto problem tracking, group study rooms & AI coach.
              </p>
            </div>
          </button>

          {/* Teacher */}
          <button
            type="button"
            onClick={() => setSelectedRole('teacher')}
            className={`p-4 rounded-xl border text-left transition-all flex flex-col justify-between space-y-3 ${
              selectedRole === 'teacher'
                ? 'border-semantic-purple bg-semantic-purple/15 shadow-lg shadow-semantic-purple/10 text-white'
                : 'border-white/10 bg-surface/50 text-text-muted hover:border-white/20 hover:bg-surface/80'
            }`}
          >
            <div className="flex items-center justify-between">
              <School className="h-6 w-6 text-semantic-purple" />
              {selectedRole === 'teacher' && <CheckCircle2 className="h-4 w-4 text-semantic-purple" />}
            </div>
            <div>
              <h3 className="font-semibold text-text-primary text-sm">Teacher / Mentor</h3>
              <p className="text-xs text-text-muted mt-1 leading-relaxed">
                Course pace, timetable & labs, cohort analytics & announcements.
              </p>
            </div>
          </button>

          {/* PhD Scholar */}
          <button
            type="button"
            onClick={() => setSelectedRole('phd')}
            className={`p-4 rounded-xl border text-left transition-all flex flex-col justify-between space-y-3 ${
              selectedRole === 'phd'
                ? 'border-semantic-green bg-semantic-green/15 shadow-lg shadow-semantic-green/10 text-white'
                : 'border-white/10 bg-surface/50 text-text-muted hover:border-white/20 hover:bg-surface/80'
            }`}
          >
            <div className="flex items-center justify-between">
              <BookOpenCheck className="h-6 w-6 text-semantic-green" />
              {selectedRole === 'phd' && <CheckCircle2 className="h-4 w-4 text-semantic-green" />}
            </div>
            <div>
              <h3 className="font-semibold text-text-primary text-sm">PhD Scholar</h3>
              <p className="text-xs text-text-muted mt-1 leading-relaxed">
                Research publications, thesis progress, grants & literature notes.
              </p>
            </div>
          </button>
        </div>

        {/* Teacher Verification Section */}
        {selectedRole === 'teacher' && (
          <div className="p-4 rounded-xl bg-semantic-purple/10 border border-semantic-purple/20 space-y-3 animate-in fade-in duration-150">
            <div className="flex items-center gap-2 text-xs font-semibold text-semantic-purple-light">
              <ShieldCheck className="h-4 w-4 text-semantic-purple" />
              Mandatory Faculty Verification
            </div>
            <div className="space-y-2">
              <label className="text-xs text-text-secondary block">Teacher ID / Verification Passcode *</label>
              <input
                type="text"
                placeholder="Enter Teacher ID (e.g. TEACHER2026)"
                value={teacherId}
                onChange={(e) => setTeacherId(e.target.value)}
                className="w-full bg-base/80 border border-white/15 rounded-lg px-3 py-2 text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-semantic-purple"
              />
              <p className="text-[11px] text-text-muted">
                Demo Faculty Key: <code className="text-semantic-purple font-mono">TEACHER2026</code>
              </p>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-text-secondary block">Department</label>
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full bg-base/80 border border-white/15 rounded-lg px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-semantic-purple"
              />
            </div>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="p-3 rounded-lg bg-semantic-red/15 border border-semantic-red/30 flex items-center gap-2 text-xs text-semantic-red">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Action Button */}
        <button
          type="button"
          onClick={handleSaveRole}
          disabled={loading}
          className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-accent to-accent-light text-white font-semibold text-sm hover:opacity-95 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-accent/20"
        >
          {loading ? (
            <span>Setting up workspace...</span>
          ) : (
            <>
              <span>Continue to Workspace</span>
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </div>
    </div>
  )
}
