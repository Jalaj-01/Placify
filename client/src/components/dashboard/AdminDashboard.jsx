import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Shield, Users, School, Bell, FileText, StickyNote,
  UserCheck, ShieldAlert, ArrowUpRight, Plus, CheckCircle2,
  Clock, Download, RefreshCw, AlertCircle, Upload
} from 'lucide-react'
import {
  fetchAllUsers,
  subscribeAuthorizedTeachers,
  subscribeAnnouncements,
  subscribeAuditLogs,
  addAuthorizedTeacher,
} from '@/services/adminService'
import { useAppStore } from '@/store/useAppStore'
import { isSuperAdmin } from '@/config/adminConfig'
import BulkTeacherUploadModal from '@/components/admin/BulkTeacherUploadModal'

export default function AdminDashboard({ user, profile }) {
  const navigate = useNavigate()
  const { toggleStickyNotes, stickyNotesOpen } = useAppStore()

  const [users, setUsers] = useState([])
  const [loadingUsers, setLoadingUsers] = useState(true)
  const [teachers, setTeachers] = useState([])
  const [announcements, setAnnouncements] = useState([])
  const [auditLogs, setAuditLogs] = useState([])
  const [showBulkModal, setShowBulkModal] = useState(false)

  // Quick Whitelist Teacher State
  const [quickTeacherEmail, setQuickTeacherEmail] = useState('')
  const [quickTeacherName, setQuickTeacherName] = useState('')
  const [quickTeacherDept, setQuickTeacherDept] = useState('')
  const [quickAdding, setQuickAdding] = useState(false)
  const [quickSuccess, setQuickSuccess] = useState('')
  const [quickError, setQuickError] = useState('')

  const loadUsers = async () => {
    setLoadingUsers(true)
    try {
      const list = await fetchAllUsers()
      setUsers(list)
    } catch (err) {
      console.error('Failed to load users:', err)
    } finally {
      setLoadingUsers(false)
    }
  }

  useEffect(() => {
    loadUsers()
  }, [])

  useEffect(() => {
    const unsubTeachers = subscribeAuthorizedTeachers(setTeachers)
    const unsubAnnouncements = subscribeAnnouncements(setAnnouncements)
    const unsubAudit = subscribeAuditLogs(setAuditLogs)

    return () => {
      if (typeof unsubTeachers === 'function') unsubTeachers()
      if (typeof unsubAnnouncements === 'function') unsubAnnouncements()
      if (typeof unsubAudit === 'function') unsubAudit()
    }
  }, [])

  const handleQuickAddTeacher = async (e) => {
    e.preventDefault()
    if (!quickTeacherEmail.trim()) return
    setQuickAdding(true)
    setQuickSuccess('')
    setQuickError('')
    try {
      await addAuthorizedTeacher(
        user,
        {
          email: quickTeacherEmail.trim(),
          displayName: quickTeacherName.trim() || quickTeacherEmail.split('@')[0],
          department: quickTeacherDept.trim() || 'Faculty',
          designation: 'Faculty Member',
        }
      )
      setQuickSuccess(`Teacher "${quickTeacherEmail}" successfully pre-authorized!`)
      setQuickTeacherEmail('')
      setQuickTeacherName('')
      setQuickTeacherDept('')
      setTimeout(() => setQuickSuccess(''), 4000)
    } catch (err) {
      setQuickError(err.message || 'Failed to add teacher to whitelist')
    } finally {
      setQuickAdding(false)
    }
  }

  // Export CSV
  const handleExportCSV = () => {
    if (!users.length) return
    const headers = ['UID', 'Name', 'Email', 'Role', 'Department', 'IsBlocked', 'CreatedAt']
    const rows = users.map((u) => [
      u.uid || '',
      `"${(u.displayName || '').replace(/"/g, '""')}"`,
      u.email || '',
      u.role || 'student',
      `"${(u.department || '').replace(/"/g, '""')}"`,
      u.isBlocked ? 'YES' : 'NO',
      u.createdAt || '',
    ])
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `placify_users_export_${Date.now()}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const totalStudents = users.filter((u) => (u.role || 'student').toLowerCase() === 'student').length
  const totalTeachers = users.filter((u) => ['teacher', 'faculty'].includes((u.role || '').toLowerCase())).length
  const totalPhd = users.filter((u) => ['phd', 'research'].includes((u.role || '').toLowerCase())).length
  const activeAnnouncements = announcements.filter((a) => {
    if (a.active === false) return false
    if (a.expiresAt) {
      const exp = a.expiresAt.toDate ? a.expiresAt.toDate().getTime() : new Date(a.expiresAt).getTime()
      if (!isNaN(exp) && exp < Date.now()) return false
    }
    return true
  }).length

  return (
    <div className="space-y-6 w-full max-w-full pb-16">
      {/* Executive KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          onClick={() => navigate('/admin?tab=users')}
          className="p-5 rounded-3xl bg-surface/70 border border-white/10 hover:border-blue-500/40 backdrop-blur-xl transition-all hover:-translate-y-0.5 cursor-pointer group shadow-lg"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-text-muted">Total Accounts</span>
            <div className="h-9 w-9 rounded-2xl bg-blue-500/15 text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-text-primary">{loadingUsers ? '...' : users.length}</span>
            <span className="text-[11px] text-text-muted font-mono">registered</span>
          </div>
          <div className="mt-3 pt-3 border-t border-border-subtle flex items-center justify-between text-[11px] text-text-secondary">
            <span>{totalStudents} students • {totalTeachers} teachers</span>
            <ArrowUpRight className="h-3.5 w-3.5 text-text-muted group-hover:text-blue-400 transition-colors" />
          </div>
        </div>

        <div
          onClick={() => navigate('/admin?tab=teachers')}
          className="p-5 rounded-3xl bg-surface/70 border border-white/10 hover:border-purple-500/40 backdrop-blur-xl transition-all hover:-translate-y-0.5 cursor-pointer group shadow-lg"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-text-muted">Teacher Whitelist</span>
            <div className="h-9 w-9 rounded-2xl bg-purple-500/15 text-purple-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <School className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-purple-400">{teachers.length}</span>
            <span className="text-[11px] text-text-muted font-mono">authorized emails</span>
          </div>
          <div className="mt-3 pt-3 border-t border-border-subtle flex items-center justify-between text-[11px] text-text-secondary">
            <span>Instant faculty login access</span>
            <ArrowUpRight className="h-3.5 w-3.5 text-text-muted group-hover:text-purple-400 transition-colors" />
          </div>
        </div>

        <div
          onClick={() => navigate('/admin?tab=announcements')}
          className="p-5 rounded-3xl bg-surface/70 border border-white/10 hover:border-amber-500/40 backdrop-blur-xl transition-all hover:-translate-y-0.5 cursor-pointer group shadow-lg"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-text-muted">Broadcasts & Alerts</span>
            <div className="h-9 w-9 rounded-2xl bg-amber-500/15 text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Bell className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-amber-400">{activeAnnouncements}</span>
            <span className="text-[11px] text-text-muted font-mono">active broadcasts</span>
          </div>
          <div className="mt-3 pt-3 border-t border-border-subtle flex items-center justify-between text-[11px] text-text-secondary">
            <span>Site-wide announcements</span>
            <ArrowUpRight className="h-3.5 w-3.5 text-text-muted group-hover:text-amber-400 transition-colors" />
          </div>
        </div>

        <div
          onClick={() => navigate('/admin?tab=audit')}
          className="p-5 rounded-3xl bg-surface/70 border border-white/10 hover:border-emerald-500/40 backdrop-blur-xl transition-all hover:-translate-y-0.5 cursor-pointer group shadow-lg"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-text-muted">Security Audit Trail</span>
            <div className="h-9 w-9 rounded-2xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <FileText className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-emerald-400">{auditLogs.length}</span>
            <span className="text-[11px] text-text-muted font-mono">logged events</span>
          </div>
          <div className="mt-3 pt-3 border-t border-border-subtle flex items-center justify-between text-[11px] text-text-secondary">
            <span>Real-time audit stream</span>
            <ArrowUpRight className="h-3.5 w-3.5 text-text-muted group-hover:text-emerald-400 transition-colors" />
          </div>
        </div>
      </div>

      {/* 3. Core Admin Controls Cards (The essential controls requested) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-text-primary flex items-center gap-2">
            <Shield className="h-4 w-4 text-amber-400" />
            <span>Dedicated Administrative Controls</span>
          </h2>
          <button
            onClick={handleExportCSV}
            className="px-3 py-1.5 rounded-xl bg-surface hover:bg-white/10 text-text-secondary hover:text-text-primary text-xs font-bold transition-all border border-border-subtle flex items-center gap-1.5"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export User Directory CSV</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: User Directory */}
          <div
            onClick={() => navigate('/admin?tab=users')}
            className="p-5 rounded-3xl bg-surface/60 border border-white/10 hover:border-blue-500/40 backdrop-blur-xl transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="h-10 w-10 rounded-2xl bg-blue-500/15 text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-text-primary group-hover:text-blue-400 transition-colors">
                  User Directory & Moderation
                </h3>
                <p className="mt-1 text-xs text-text-secondary leading-relaxed">
                  Search accounts, change roles (Student/Teacher/PhD), block or suspend disruptive users, and delete accounts.
                </p>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-border-subtle flex items-center justify-between text-xs font-bold text-blue-400">
              <span>Open User Directory</span>
              <ArrowUpRight className="h-4 w-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </div>
          </div>

          {/* Card 2: Teacher Whitelist */}
          <div
            onClick={() => navigate('/admin?tab=teachers')}
            className="p-5 rounded-3xl bg-surface/60 border border-white/10 hover:border-purple-500/40 backdrop-blur-xl transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="h-10 w-10 rounded-2xl bg-purple-500/15 text-purple-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <School className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-text-primary group-hover:text-purple-400 transition-colors">
                  Teacher Whitelist
                </h3>
                <p className="mt-1 text-xs text-text-secondary leading-relaxed">
                  Add teacher email addresses. When faculty log in with these emails, they automatically get teacher-only access.
                </p>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-border-subtle flex items-center justify-between text-xs font-bold text-purple-400">
              <span>Manage Whitelist</span>
              <ArrowUpRight className="h-4 w-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </div>
          </div>

          {/* Card 3: Broadcasts & Announcements */}
          <div
            onClick={() => navigate('/admin?tab=announcements')}
            className="p-5 rounded-3xl bg-surface/60 border border-white/10 hover:border-amber-500/40 backdrop-blur-xl transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="h-10 w-10 rounded-2xl bg-amber-500/15 text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Bell className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-text-primary group-hover:text-amber-400 transition-colors">
                  Campus Broadcasts
                </h3>
                <p className="mt-1 text-xs text-text-secondary leading-relaxed">
                  Post high-priority notices, alerts, and placement drive updates directly onto student and teacher dashboards.
                </p>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-border-subtle flex items-center justify-between text-xs font-bold text-amber-400">
              <span>Post Announcements</span>
              <ArrowUpRight className="h-4 w-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </div>
          </div>

          {/* Card 4: Audit Trail */}
          <div
            onClick={() => navigate('/admin?tab=audit')}
            className="p-5 rounded-3xl bg-surface/60 border border-white/10 hover:border-emerald-500/40 backdrop-blur-xl transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="h-10 w-10 rounded-2xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-text-primary group-hover:text-emerald-400 transition-colors">
                  Security Audit Trail
                </h3>
                <p className="mt-1 text-xs text-text-secondary leading-relaxed">
                  Tamper-proof chronological log tracking every administrative action, teacher addition, role change, and sanction.
                </p>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-border-subtle flex items-center justify-between text-xs font-bold text-emerald-400">
              <span>View Audit Logs</span>
              <ArrowUpRight className="h-4 w-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </div>
          </div>
        </div>
      </div>

      {/* 4. Quick Action Form: Add Teacher to Whitelist directly & Recent Audit Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Quick Add Teacher to Whitelist */}
        <div className="p-6 rounded-3xl bg-surface/70 border border-white/10 backdrop-blur-xl shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-xl bg-purple-500/15 text-purple-400 flex items-center justify-center">
                  <School className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-text-primary">Authorize Teacher</h3>
                  <p className="text-[11px] text-text-muted">Pre-authorize faculty login access</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowBulkModal(true)}
                className="px-2.5 py-1.5 rounded-xl bg-purple-500/15 hover:bg-purple-500/25 text-purple-300 border border-purple-500/30 text-[11px] font-bold flex items-center gap-1.5 transition-all shadow-sm shrink-0"
              >
                <Upload className="h-3 w-3" />
                <span>Bulk CSV</span>
              </button>
            </div>

            <form onSubmit={handleQuickAddTeacher} className="mt-5 space-y-3">
              <div>
                <label className="text-[11px] font-bold text-text-secondary block mb-1">
                  Teacher Official Email *
                </label>
                <input
                  type="email"
                  required
                  placeholder="professor@iiitg.ac.in"
                  value={quickTeacherEmail}
                  onChange={(e) => setQuickTeacherEmail(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-surface border border-border-subtle text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-purple-500 transition-colors"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-text-secondary block mb-1">
                  Faculty Name (Optional)
                </label>
                <input
                  type="text"
                  placeholder="Dr. Rajesh Sharma"
                  value={quickTeacherName}
                  onChange={(e) => setQuickTeacherName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-surface border border-border-subtle text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-purple-500 transition-colors"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-text-secondary block mb-1">
                  Department
                </label>
                <input
                  type="text"
                  placeholder="Computer Science & Engineering"
                  value={quickTeacherDept}
                  onChange={(e) => setQuickTeacherDept(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-surface border border-border-subtle text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-purple-500 transition-colors"
                />
              </div>

              {quickSuccess && (
                <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  <span>{quickSuccess}</span>
                </div>
              )}

              {quickError && (
                <div className="p-2.5 rounded-xl bg-semantic-red/10 border border-semantic-red/30 text-semantic-red text-xs flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{quickError}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={quickAdding || !quickTeacherEmail.trim()}
                className="w-full mt-2 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-xs font-bold transition-all shadow-lg shadow-purple-600/20 flex items-center justify-center gap-2"
              >
                {quickAdding ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                <span>Authorize Faculty Email</span>
              </button>
            </form>
          </div>

          <div className="mt-4 pt-3 border-t border-border-subtle text-[11px] text-text-muted flex items-center justify-between">
            <span>{teachers.length} currently authorized</span>
            <button
              onClick={() => navigate('/admin?tab=teachers')}
              className="text-purple-400 hover:underline font-bold"
            >
              View Full List →
            </button>
          </div>
        </div>

        {/* Right Column: Live Security & Administrative Audit Trail */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-surface/70 border border-white/10 backdrop-blur-xl shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
                  <FileText className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-text-primary">Recent Audit Trail</h3>
                  <p className="text-[11px] text-text-muted">Live security & administrative action events</p>
                </div>
              </div>
              <button
                onClick={() => navigate('/admin?tab=audit')}
                className="text-xs text-emerald-400 hover:underline font-bold flex items-center gap-1"
              >
                <span>Full Trail ({auditLogs.length})</span>
                <ArrowUpRight className="h-3 w-3" />
              </button>
            </div>

            <div className="mt-4 space-y-2.5">
              {auditLogs.length === 0 ? (
                <div className="py-8 text-center text-text-muted text-xs">
                  No security events recorded yet. Actions will appear here in real-time.
                </div>
              ) : (
                auditLogs.slice(0, 5).map((log) => {
                  const isAdd = log.action?.includes('ADD') || log.action?.includes('CREATE')
                  const isDelete = log.action?.includes('DELETE') || log.action?.includes('BLOCK')
                  return (
                    <div
                      key={log.id}
                      className="px-3.5 py-2.5 rounded-2xl bg-surface/60 border border-border-subtle flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span
                          className={`px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold shrink-0 ${
                            isDelete
                              ? 'bg-semantic-red/15 text-semantic-red border border-semantic-red/30'
                              : isAdd
                              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                              : 'bg-blue-500/15 text-blue-400 border border-blue-500/30'
                          }`}
                        >
                          {log.action}
                        </span>
                        <div className="truncate">
                          <span className="text-text-primary font-semibold block truncate">
                            {log.details?.email || log.details?.targetEmail || log.details?.targetUid || 'System Event'}
                          </span>
                          <span className="text-[10px] text-text-muted">
                            by {log.adminEmail || 'Admin'}
                          </span>
                        </div>
                      </div>

                      <div className="text-[10px] text-text-muted font-mono shrink-0 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>
                          {log.createdAt?.seconds
                            ? new Date(log.createdAt.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                            : 'recent'}
                        </span>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-border-subtle flex items-center justify-between text-[11px] text-text-secondary">
            <span>Admin Sticky Notes available via shortcut or header</span>
            <button
              onClick={toggleStickyNotes}
              className="text-amber-400 font-bold hover:underline flex items-center gap-1"
            >
              <StickyNote className="h-3.5 w-3.5" />
              <span>Toggle Sticky Notes</span>
            </button>
          </div>
        </div>
      </div>

      {/* Bulk Upload Modal */}
      <BulkTeacherUploadModal
        isOpen={showBulkModal}
        onClose={() => setShowBulkModal(false)}
        adminUser={user}
        existingTeachers={teachers}
        onSuccess={() => {
          loadUsers()
        }}
      />
    </div>
  )
}
