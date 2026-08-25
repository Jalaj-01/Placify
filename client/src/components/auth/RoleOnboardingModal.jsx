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
      localStorage.setItem('placify_active_role', selectedRole)
      window.dispatchEvent(new Event('placify-role-change'))
      onRoleSaved(selectedRole)
    } catch (err) {
      console.error('Failed to set role:', err)
      setError('Failed to save role. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 dark:bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200 overflow-y-auto">
      <div className="w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl bg-card border border-border-subtle p-6 sm:p-8 shadow-2xl space-y-6 scrollbar-thin text-text-primary">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/15 text-accent mb-1 shadow-inner">
            <GraduationCap className="h-6 w-6 text-accent" />
          </div>
          <h2 className="text-2xl font-black text-text-primary tracking-tight">Welcome to Placify!</h2>
          <p className="text-xs sm:text-sm text-text-secondary leading-relaxed max-w-md mx-auto">
            Select your academic role to unlock tailored dashboard features and automated tracking tools.
          </p>
        </div>

        {/* Role Options */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          {/* Student */}
          <button
            type="button"
            onClick={() => setSelectedRole('student')}
            className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between space-y-3 cursor-pointer ${
              selectedRole === 'student'
                ? 'border-accent bg-accent/10 shadow-lg shadow-accent/10 ring-2 ring-accent'
                : 'border-border-subtle bg-surface/70 text-text-secondary hover:border-accent/40 hover:bg-card shadow-sm'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="h-9 w-9 rounded-xl bg-accent/15 flex items-center justify-center text-accent">
                <GraduationCap className="h-5 w-5" />
              </div>
              {selectedRole === 'student' && <CheckCircle2 className="h-4 w-4 text-accent" />}
            </div>
            <div>
              <h3 className="font-bold text-text-primary text-sm">Student</h3>
              <p className="text-xs text-text-muted mt-1 leading-relaxed">
                Placement prep, auto problem tracking, group study rooms & AI coach.
              </p>
            </div>
          </button>

          {/* Teacher */}
          <button
            type="button"
            onClick={() => setSelectedRole('teacher')}
            className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between space-y-3 cursor-pointer ${
              selectedRole === 'teacher'
                ? 'border-semantic-purple bg-semantic-purple/10 shadow-lg shadow-semantic-purple/10 ring-2 ring-semantic-purple'
                : 'border-border-subtle bg-surface/70 text-text-secondary hover:border-semantic-purple/40 hover:bg-card shadow-sm'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="h-9 w-9 rounded-xl bg-purple-500/15 flex items-center justify-center text-purple-600 dark:text-purple-400">
                <School className="h-5 w-5" />
              </div>
              {selectedRole === 'teacher' && <CheckCircle2 className="h-4 w-4 text-purple-600 dark:text-purple-400" />}
            </div>
            <div>
              <h3 className="font-bold text-text-primary text-sm">Teacher / Mentor</h3>
              <p className="text-xs text-text-muted mt-1 leading-relaxed">
                Course pace, timetable & labs, cohort analytics & announcements.
              </p>
            </div>
          </button>

          {/* PhD Scholar */}
          <button
            type="button"
            onClick={() => setSelectedRole('phd')}
            className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between space-y-3 cursor-pointer ${
              selectedRole === 'phd'
                ? 'border-semantic-green bg-semantic-green/10 shadow-lg shadow-semantic-green/10 ring-2 ring-semantic-green'
                : 'border-border-subtle bg-surface/70 text-text-secondary hover:border-semantic-green/40 hover:bg-card shadow-sm'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="h-9 w-9 rounded-xl bg-emerald-500/15 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <BookOpenCheck className="h-5 w-5" />
              </div>
              {selectedRole === 'phd' && <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />}
            </div>
            <div>
              <h3 className="font-bold text-text-primary text-sm">PhD Scholar</h3>
              <p className="text-xs text-text-muted mt-1 leading-relaxed">
                Research publications, thesis progress, grants & literature notes.
              </p>
            </div>
          </button>
        </div>

        {/* Teacher Verification Section */}
        {selectedRole === 'teacher' && (
          <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/30 space-y-3 animate-in fade-in duration-150">
            <div className="flex items-center gap-2 text-xs font-bold text-purple-600 dark:text-purple-400">
              <ShieldCheck className="h-4 w-4" />
              Mandatory Faculty Verification
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-text-secondary block">Teacher ID / Verification Passcode *</label>
                <span className="text-[10px] text-accent font-mono font-bold">e.g. TEACHER2026 or JALAJ2026</span>
              </div>
              <input
                type="text"
                placeholder="Enter TEACHER2026 or JALAJ2026"
                value={teacherId}
                onChange={(e) => setTeacherId(e.target.value)}
                className="w-full bg-base border border-border-subtle rounded-xl px-3.5 py-2.5 text-xs text-text-primary placeholder:text-text-muted font-mono font-bold focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-text-secondary block">Department</label>
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full bg-base border border-border-subtle rounded-xl px-3.5 py-2.5 text-xs text-text-primary font-medium focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all"
              />
            </div>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="p-3 rounded-xl bg-semantic-red/15 border border-semantic-red/30 flex items-center gap-2 text-xs text-semantic-red">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Action Button */}
        <button
          type="button"
          onClick={handleSaveRole}
          disabled={loading}
          className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-accent to-accent-light text-white font-bold text-sm hover:opacity-95 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-accent/25 cursor-pointer"
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
