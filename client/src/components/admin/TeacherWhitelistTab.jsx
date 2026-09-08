import { useState } from 'react'
import { Plus, Trash2, Mail, School, ShieldCheck, CheckCircle2, Clock, Search, AlertCircle, Upload } from 'lucide-react'
import { addAuthorizedTeacher, removeAuthorizedTeacher } from '@/services/adminService'
import BulkTeacherUploadModal from './BulkTeacherUploadModal'

const DEPARTMENTS = [
  'Computer Science & Engineering',
  'Electronics & Communication Engineering',
  'Data Science & Artificial Intelligence',
  'Mechanical Engineering',
  'Electrical Engineering',
  'Information Technology',
  'Mathematics & Computing',
  'Career Development & Placements',
]

const DESIGNATIONS = [
  'Assistant Professor',
  'Associate Professor',
  'Professor',
  'Head of Department (HOD)',
  'Training & Placement Officer (TPO)',
  'Faculty Advisor',
  'Visiting Lecturer',
]

export default function TeacherWhitelistTab({ adminUser, teachers = [], allUsers = [], onRefresh }) {
  const [showAddModal, setShowAddModal] = useState(false)
  const [showBulkModal, setShowBulkModal] = useState(false)
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [department, setDepartment] = useState(DEPARTMENTS[0])
  const [designation, setDesignation] = useState(DESIGNATIONS[0])
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  const handleAddTeacher = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!email.trim()) {
      setError('Please enter a valid teacher email.')
      return
    }

    setLoading(true)
    try {
      await addAuthorizedTeacher(adminUser, {
        email: email.trim(),
        name: name.trim() || 'Faculty Member',
        department,
        designation,
        notes,
      })
      setSuccess(`Successfully authorized ${email}. They will automatically get Teacher role on login.`)
      setEmail('')
      setName('')
      setNotes('')
      setShowAddModal(false)
      if (onRefresh) onRefresh()
    } catch (err) {
      console.error('Error authorizing teacher:', err)
      setError(err.message || 'Failed to authorize teacher.')
    } finally {
      setLoading(false)
    }
  }

  const handleRevoke = async (teacher) => {
    if (!window.confirm(`Revoke teacher authorization for ${teacher.email}? Their role will revert to student.`)) {
      return
    }
    try {
      await removeAuthorizedTeacher(adminUser, teacher.id, teacher.email)
      if (onRefresh) onRefresh()
    } catch (err) {
      alert('Failed to revoke teacher: ' + err.message)
    }
  }

  // Filter teachers by search query
  const filteredTeachers = teachers.filter((t) => {
    const q = searchQuery.toLowerCase().trim()
    if (!q) return true
    return (
      (t.email || '').toLowerCase().includes(q) ||
      (t.name || '').toLowerCase().includes(q) ||
      (t.department || '').toLowerCase().includes(q) ||
      (t.designation || '').toLowerCase().includes(q)
    )
  })

  // Check if a whitelisted email is currently registered/logged in
  const isEmailRegistered = (teacherEmail) => {
    const clean = (teacherEmail || '').toLowerCase().trim()
    return allUsers.some((u) => (u.email || '').toLowerCase().trim() === clean)
  }

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="p-6 rounded-3xl bg-surface/70 border border-border-subtle backdrop-blur-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-purple-400 font-bold text-xs uppercase tracking-wider">
            <School className="h-4 w-4" />
            <span>Faculty Whitelist & Pre-Authorization</span>
          </div>
          <h2 className="text-xl font-black text-text-primary">Authorized Teachers Hub</h2>
          <p className="text-xs text-text-secondary max-w-xl">
            Add faculty emails here. When these instructors log in with Google using their email, Placify automatically gives them the <strong>Teacher</strong> role. Normal users cannot select or switch to this role.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => setShowBulkModal(true)}
            className="px-4 py-2.5 rounded-2xl bg-surface hover:bg-white/10 text-text-primary text-xs font-bold flex items-center justify-center gap-2 border border-border-subtle transition-all shrink-0"
          >
            <Upload className="h-4 w-4 text-purple-400" />
            <span>Bulk Upload (CSV / Paste)</span>
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-purple-600/20 transition-all shrink-0"
          >
            <Plus className="h-4 w-4" />
            <span>Authorize New Teacher</span>
          </button>
        </div>
      </div>

      {/* Success / Error notification */}
      {success && (
        <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Search Bar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
          <input
            type="text"
            placeholder="Search by teacher email, name, or department..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-surface/60 border border-border-subtle rounded-2xl pl-10 pr-4 py-2.5 text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-purple-500 transition-colors"
          />
        </div>
        <div className="text-xs text-text-muted font-mono whitespace-nowrap">
          Total: <span className="font-bold text-text-primary">{filteredTeachers.length}</span>
        </div>
      </div>

      {/* Teachers Table */}
      <div className="rounded-3xl border border-border-subtle bg-surface/40 backdrop-blur-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-border-subtle/80 bg-surface/60 text-text-muted font-bold uppercase tracking-wider text-[10px]">
                <th className="p-4">Faculty Member</th>
                <th className="p-4">Department & Designation</th>
                <th className="p-4">Login Status</th>
                <th className="p-4">Authorized Date</th>
                <th className="p-4">Added By</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle/40">
              {filteredTeachers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-text-muted">
                    <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-500/10 text-purple-400 mb-2">
                      <School className="h-6 w-6" />
                    </div>
                    <p className="font-semibold text-text-primary text-sm">No authorized teachers found</p>
                    <p className="text-xs text-text-secondary mt-0.5">Click "Authorize New Teacher" to give faculty access.</p>
                  </td>
                </tr>
              ) : (
                filteredTeachers.map((teacher) => {
                  const claimed = isEmailRegistered(teacher.email)
                  return (
                    <tr key={teacher.id} className="hover:bg-white/[0.02] transition-colors">
                      {/* Name & Email */}
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-xl bg-purple-500/15 border border-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-xs shrink-0">
                            {teacher.name?.[0]?.toUpperCase() || 'T'}
                          </div>
                          <div>
                            <p className="font-bold text-text-primary text-xs">{teacher.name}</p>
                            <p className="text-[11px] text-text-muted font-mono flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {teacher.email}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Department & Designation */}
                      <td className="p-4">
                        <p className="text-text-primary font-semibold">{teacher.department}</p>
                        <p className="text-[11px] text-purple-400/90 font-medium">{teacher.designation}</p>
                      </td>

                      {/* Claimed / Active Status */}
                      <td className="p-4">
                        {claimed ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                            <CheckCircle2 className="h-3 w-3" />
                            Active (Logged In)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30 text-[10px] font-bold">
                            <Clock className="h-3 w-3" />
                            Pending First Login
                          </span>
                        )}
                      </td>

                      {/* Date */}
                      <td className="p-4 text-text-muted text-[11px]">
                        {teacher.addedAt?.toDate
                          ? teacher.addedAt.toDate().toLocaleDateString()
                          : 'Recent'}
                      </td>

                      {/* Added By */}
                      <td className="p-4 text-text-muted text-[11px] font-mono truncate max-w-[120px]">
                        {teacher.addedBy}
                      </td>

                      {/* Actions */}
                      <td className="p-4 text-right">
                        <button
                          onClick={() => handleRevoke(teacher)}
                          className="px-2.5 py-1.5 rounded-xl bg-surface hover:bg-semantic-red/20 text-text-muted hover:text-semantic-red border border-border-subtle hover:border-semantic-red/30 text-xs font-semibold transition-all inline-flex items-center gap-1"
                          title="Revoke Teacher Access"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          <span className="hidden sm:inline">Revoke</span>
                        </button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Teacher Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-lg rounded-3xl bg-card border border-border-subtle p-6 sm:p-7 shadow-2xl space-y-5 text-text-primary animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-border-subtle">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-xl bg-purple-500/15 text-purple-400 flex items-center justify-center font-bold">
                  <Plus className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-black text-base text-text-primary">Authorize Faculty Email</h3>
                  <p className="text-xs text-text-muted">Grant permanent Teacher role on login</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-text-muted hover:text-text-primary text-sm font-bold p-1"
              >
                ✕
              </button>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-semantic-red/10 border border-semantic-red/30 text-semantic-red text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleAddTeacher} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-text-secondary">Teacher's Google Email *</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. professor.sharma@college.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-base border border-border-subtle rounded-xl px-3.5 py-2.5 text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all font-mono"
                />
                <span className="text-[10px] text-text-muted block">
                  Must be the exact email address the teacher uses to sign in with Google.
                </span>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-text-secondary">Faculty Name / Title</label>
                <input
                  type="text"
                  placeholder="e.g. Dr. Arvind Sharma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-base border border-border-subtle rounded-xl px-3.5 py-2.5 text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-purple-500 transition-all"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-text-secondary">Department</label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full bg-base border border-border-subtle rounded-xl px-3 py-2.5 text-xs text-text-primary focus:outline-none focus:border-purple-500 transition-all"
                  >
                    {DEPARTMENTS.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-text-secondary">Designation</label>
                  <select
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                    className="w-full bg-base border border-border-subtle rounded-xl px-3 py-2.5 text-xs text-text-primary focus:outline-none focus:border-purple-500 transition-all"
                  >
                    {DESIGNATIONS.map((des) => (
                      <option key={des} value={des}>{des}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-text-secondary">Admin Notes (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Approved for CSE-301 Algorithms & Lab"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-base border border-border-subtle rounded-xl px-3.5 py-2.5 text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-purple-500 transition-all"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-surface hover:bg-white/10 text-text-secondary hover:text-text-primary text-xs font-bold transition-all border border-border-subtle"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-lg shadow-purple-600/20 transition-all disabled:opacity-50 flex items-center gap-2"
                >
                  <ShieldCheck className="h-4 w-4" />
                  <span>{loading ? 'Authorizing...' : 'Save & Authorize'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk Upload Modal */}
      <BulkTeacherUploadModal
        isOpen={showBulkModal}
        onClose={() => setShowBulkModal(false)}
        adminUser={adminUser}
        existingTeachers={teachers}
        onSuccess={() => {
          if (onRefresh) onRefresh()
        }}
      />
    </div>
  )
}
