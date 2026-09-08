import { useState } from 'react'
import {
  Search, ShieldAlert, ShieldCheck, UserX, Trash2, Edit3, Download,
  RefreshCw, CheckCircle2, AlertOctagon, User, Mail, Calendar, Flame, Code2
} from 'lucide-react'
import { updateUserRole, toggleUserBlock, deleteUserProfile } from '@/services/adminService'
import { PLATFORM_ROLES, isSuperAdmin } from '@/config/adminConfig'

export default function UserManagementTab({ adminUser, users = [], onRefresh, loadingUsers = false }) {
  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')

  // Modals state
  const [selectedUser, setSelectedUser] = useState(null)
  const [modalType, setModalType] = useState(null) // 'block' | 'role' | 'delete' | 'details'
  const [blockReason, setBlockReason] = useState('')
  const [newRole, setNewRole] = useState('student')
  const [actionLoading, setActionLoading] = useState(false)
  const [feedback, setFeedback] = useState(null)

  // Filter logic
  const filteredUsers = users.filter((u) => {
    const q = searchQuery.toLowerCase().trim()
    const matchesSearch =
      !q ||
      (u.displayName || '').toLowerCase().includes(q) ||
      (u.email || '').toLowerCase().includes(q) ||
      (u.department || '').toLowerCase().includes(q) ||
      (u.uid || '').toLowerCase().includes(q)

    const matchesRole = roleFilter === 'all' || (u.role || 'student').toLowerCase() === roleFilter
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'blocked' && u.isBlocked) ||
      (statusFilter === 'active' && !u.isBlocked)

    return matchesSearch && matchesRole && matchesStatus
  })

  // Open Actions
  const openBlockModal = (user) => {
    setSelectedUser(user)
    setBlockReason(user.blockReason || '')
    setModalType('block')
  }

  const openRoleModal = (user) => {
    setSelectedUser(user)
    setNewRole(user.role || 'student')
    setModalType('role')
  }

  const openDeleteModal = (user) => {
    setSelectedUser(user)
    setFeedback(null)
    setModalType('delete')
  }

  const openDetailsModal = (user) => {
    setSelectedUser(user)
    setModalType('details')
  }

  // Execute Block / Unblock
  const handleToggleBlock = async () => {
    if (!selectedUser) return
    setActionLoading(true)
    try {
      const willBlock = !selectedUser.isBlocked
      await toggleUserBlock(
        adminUser,
        selectedUser.uid,
        willBlock,
        blockReason,
        selectedUser.email,
        selectedUser.docPath
      )
      setFeedback({
        type: 'success',
        text: `User ${selectedUser.email} has been ${willBlock ? 'suspended' : 're-activated'}.`,
      })
      setModalType(null)
      if (onRefresh) onRefresh()
    } catch (err) {
      console.error('toggleBlock error:', err)
      setFeedback({ type: 'error', text: err.message || 'Failed to update user block status.' })
    } finally {
      setActionLoading(false)
    }
  }

  // Execute Role Change
  const handleUpdateRole = async () => {
    if (!selectedUser) return
    setActionLoading(true)
    try {
      await updateUserRole(
        adminUser,
        selectedUser.uid,
        newRole,
        selectedUser.email,
        selectedUser.docPath
      )
      setFeedback({
        type: 'success',
        text: `Updated role of ${selectedUser.email} to ${newRole.toUpperCase()}.`,
      })
      setModalType(null)
      if (onRefresh) onRefresh()
    } catch (err) {
      console.error('updateRole error:', err)
      setFeedback({ type: 'error', text: err.message || 'Failed to update user role.' })
    } finally {
      setActionLoading(false)
    }
  }

  // Execute Delete
  const handleDelete = async () => {
    if (!selectedUser) return
    setActionLoading(true)
    try {
      await deleteUserProfile(
        adminUser,
        selectedUser.uid,
        selectedUser.email,
        selectedUser.docId,
        selectedUser.docPath
      )
      setFeedback({
        type: 'success',
        text: `Deleted profile of ${selectedUser.email}.`,
      })
      setModalType(null)
      if (onRefresh) onRefresh()
    } catch (err) {
      console.error('deleteUserProfile error:', err)
      setFeedback({ type: 'error', text: err.message || 'Failed to delete user profile.' })
    } finally {
      setActionLoading(false)
    }
  }

  // Export to CSV
  const handleExportCSV = () => {
    const headers = ['UID', 'Name', 'Email', 'Role', 'Department', 'Status', 'Current Streak', 'Problems Solved', 'Created At']
    const rows = filteredUsers.map((u) => [
      `"${u.uid}"`,
      `"${(u.displayName || '').replace(/"/g, '""')}"`,
      `"${u.email}"`,
      `"${u.role || 'student'}"`,
      `"${u.department || 'N/A'}"`,
      `"${u.isBlocked ? 'Blocked' : 'Active'}"`,
      u.currentStreak || 0,
      u.totalSolved || 0,
      `"${u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}"`,
    ])

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `placify_users_${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const getRoleBadge = (role) => {
    const r = (role || 'student').toLowerCase()
    switch (r) {
      case 'admin':
        return <span className="px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30 text-[10px] font-black uppercase tracking-wider">Admin</span>
      case 'teacher':
      case 'faculty':
        return <span className="px-2.5 py-0.5 rounded-full bg-purple-500/15 text-purple-400 border border-purple-500/30 text-[10px] font-black uppercase tracking-wider">Teacher</span>
      case 'phd':
        return <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[10px] font-black uppercase tracking-wider">PhD</span>
      default:
        return <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 text-[10px] font-black uppercase tracking-wider">Student</span>
    }
  }

  return (
    <div className="space-y-6">
      {/* Action Header Card */}
      <div className="p-6 rounded-3xl bg-surface/70 border border-border-subtle backdrop-blur-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-text-primary">User Directory & Moderation</h2>
          <p className="text-xs text-text-secondary mt-0.5">
            Manage account access, manually assign roles, or suspend bad actors across Placify.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            onClick={onRefresh}
            disabled={loadingUsers}
            className="p-2.5 rounded-2xl bg-surface hover:bg-white/10 text-text-secondary hover:text-text-primary border border-border-subtle text-xs font-bold transition-all"
            title="Refresh Users"
          >
            <RefreshCw className={`h-4 w-4 ${loadingUsers ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={handleExportCSV}
            className="px-4 py-2.5 rounded-2xl bg-surface hover:bg-white/10 text-text-secondary hover:text-text-primary border border-border-subtle text-xs font-bold transition-all flex items-center gap-2 shadow-sm"
          >
            <Download className="h-4 w-4" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Feedback Banner */}
      {feedback && (
        <div
          className={`p-4 rounded-2xl border text-xs font-semibold flex items-center justify-between gap-2 ${
            feedback.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
              : 'bg-semantic-red/10 border-semantic-red/30 text-semantic-red'
          }`}
        >
          <span>{feedback.text}</span>
          <button onClick={() => setFeedback(null)} className="text-xs opacity-70 hover:opacity-100 font-bold">✕</button>
        </div>
      )}

      {/* Search & Filter Bar */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
          <input
            type="text"
            placeholder="Search by user name, email, department, or UID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-surface/60 border border-border-subtle rounded-2xl pl-10 pr-4 py-2.5 text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent transition-colors"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Role Filter */}
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="bg-surface/60 border border-border-subtle rounded-2xl px-3 py-2.5 text-xs text-text-primary focus:outline-none focus:border-accent transition-all"
          >
            <option value="all">All Roles</option>
            <option value="student">Students</option>
            <option value="teacher">Teachers</option>
            <option value="phd">PhD Scholars</option>
            <option value="admin">Admins</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-surface/60 border border-border-subtle rounded-2xl px-3 py-2.5 text-xs text-text-primary focus:outline-none focus:border-accent transition-all"
          >
            <option value="all">All Status</option>
            <option value="active">Active Only</option>
            <option value="blocked">Suspended Only</option>
          </select>
        </div>
      </div>

      {/* Users Count Info */}
      <div className="flex items-center justify-between text-xs text-text-muted px-1">
        <span>Showing <strong className="text-text-primary">{filteredUsers.length}</strong> of {users.length} users</span>
      </div>

      {/* Users Table */}
      <div className="rounded-3xl border border-border-subtle bg-surface/40 backdrop-blur-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-border-subtle/80 bg-surface/60 text-text-muted font-bold uppercase tracking-wider text-[10px]">
                <th className="p-4">User</th>
                <th className="p-4">Role</th>
                <th className="p-4">Department</th>
                <th className="p-4">Status</th>
                <th className="p-4">Engagement</th>
                <th className="p-4 text-right">Moderation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle/40">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-text-muted">
                    <User className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="font-semibold text-text-primary text-sm">No users match your filters</p>
                    <p className="text-xs text-text-secondary mt-0.5">Try searching with a different keyword or resetting filters.</p>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const isAdminUser = isSuperAdmin(u.email) || u.role === 'admin'
                  return (
                    <tr key={u.uid} className="hover:bg-white/[0.02] transition-colors">
                      {/* Name & Email */}
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          {u.photoURL ? (
                            <img src={u.photoURL} alt="" className="h-9 w-9 rounded-xl shrink-0 border border-border-subtle" />
                          ) : (
                            <div className="h-9 w-9 rounded-xl bg-hover border border-border-subtle flex items-center justify-center font-bold text-xs text-text-primary shrink-0">
                              {u.displayName?.[0]?.toUpperCase() || 'U'}
                            </div>
                          )}
                          <div className="min-w-0">
                            <button
                              onClick={() => openDetailsModal(u)}
                              className="font-bold text-text-primary hover:text-accent text-xs truncate text-left block"
                            >
                              {u.displayName}
                            </button>
                            <p className="text-[11px] text-text-muted font-mono truncate">{u.email}</p>
                          </div>
                        </div>
                      </td>

                      {/* Role */}
                      <td className="p-4">
                        {getRoleBadge(u.role)}
                      </td>

                      {/* Department */}
                      <td className="p-4 text-text-secondary truncate max-w-[160px]">
                        {u.department || 'N/A'}
                      </td>

                      {/* Status */}
                      <td className="p-4">
                        {u.isBlocked ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-semantic-red/15 text-semantic-red border border-semantic-red/30 text-[10px] font-bold">
                            <AlertOctagon className="h-3 w-3" />
                            Suspended
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                            <CheckCircle2 className="h-3 w-3" />
                            Active
                          </span>
                        )}
                      </td>

                      {/* Engagement: Solved & Streak */}
                      <td className="p-4">
                        <div className="flex items-center gap-3 text-[11px] text-text-muted">
                          <span className="flex items-center gap-1" title="Problems solved count">
                            <Code2 className="h-3.5 w-3.5 text-accent" />
                            {u.totalSolved || 0}
                          </span>
                          <span className="flex items-center gap-1" title="Current streak">
                            <Flame className="h-3.5 w-3.5 text-amber-500" />
                            {u.currentStreak || 0}d
                          </span>
                        </div>
                      </td>

                      {/* Moderation Controls */}
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Role Change */}
                          <button
                            onClick={() => openRoleModal(u)}
                            className="p-1.5 rounded-xl bg-surface hover:bg-white/10 text-text-secondary hover:text-text-primary border border-border-subtle transition-all"
                            title="Change Role"
                          >
                            <Edit3 className="h-3.5 w-3.5" />
                          </button>

                          {/* Block / Unblock (cannot block super admin) */}
                          {!isAdminUser && (
                            <button
                              onClick={() => openBlockModal(u)}
                              className={`p-1.5 rounded-xl border transition-all ${
                                u.isBlocked
                                  ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/25'
                                  : 'bg-surface text-text-secondary hover:text-semantic-red hover:bg-semantic-red/15 border-border-subtle hover:border-semantic-red/30'
                              }`}
                              title={u.isBlocked ? 'Unblock User' : 'Suspend / Block User'}
                            >
                              {u.isBlocked ? <ShieldCheck className="h-3.5 w-3.5" /> : <UserX className="h-3.5 w-3.5" />}
                            </button>
                          )}

                          {/* Delete (cannot delete super admin) */}
                          {!isAdminUser && (
                            <button
                              onClick={() => openDeleteModal(u)}
                              className="p-1.5 rounded-xl bg-surface hover:bg-semantic-red/15 text-text-secondary hover:text-semantic-red border border-border-subtle hover:border-semantic-red/30 transition-all"
                              title="Delete Profile"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── MODALS ── */}

      {/* 1. Block / Unblock Modal */}
      {modalType === 'block' && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl bg-card border border-border-subtle p-6 space-y-4 text-text-primary shadow-2xl">
            <div className="flex items-center gap-3 pb-3 border-b border-border-subtle">
              <div className={`h-9 w-9 rounded-xl flex items-center justify-center font-bold ${
                selectedUser.isBlocked ? 'bg-emerald-500/15 text-emerald-400' : 'bg-semantic-red/15 text-semantic-red'
              }`}>
                {selectedUser.isBlocked ? <ShieldCheck className="h-5 w-5" /> : <ShieldAlert className="h-5 w-5" />}
              </div>
              <div>
                <h3 className="font-black text-base">
                  {selectedUser.isBlocked ? 'Re-activate Account' : 'Suspend Account'}
                </h3>
                <p className="text-xs text-text-muted">{selectedUser.email}</p>
              </div>
            </div>

            {!selectedUser.isBlocked ? (
              <div className="space-y-3">
                <p className="text-xs text-text-secondary leading-relaxed">
                  Suspending this user will immediately log them out of their active sessions and display an <strong>Account Suspended</strong> banner prohibiting any app access.
                </p>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-text-secondary">Administrative Suspension Reason</label>
                  <textarea
                    rows={3}
                    placeholder="e.g. Inappropriate behavior in study room or academic dishonesty"
                    value={blockReason}
                    onChange={(e) => setBlockReason(e.target.value)}
                    className="w-full bg-base border border-border-subtle rounded-xl p-3 text-xs text-text-primary focus:outline-none focus:border-semantic-red transition-colors"
                  />
                </div>
              </div>
            ) : (
              <p className="text-xs text-text-secondary leading-relaxed">
                Are you sure you want to lift the suspension for <strong>{selectedUser.displayName}</strong> ({selectedUser.email})? They will regain full access to their dashboard.
              </p>
            )}

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                onClick={() => setModalType(null)}
                className="px-4 py-2.5 rounded-xl bg-surface hover:bg-white/10 text-text-secondary text-xs font-bold border border-border-subtle"
              >
                Cancel
              </button>
              <button
                onClick={handleToggleBlock}
                disabled={actionLoading}
                className={`px-5 py-2.5 rounded-xl text-white text-xs font-bold shadow-lg transition-all ${
                  selectedUser.isBlocked
                    ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/20'
                    : 'bg-semantic-red hover:bg-semantic-red/90 shadow-semantic-red/20'
                }`}
              >
                {actionLoading ? 'Processing...' : selectedUser.isBlocked ? 'Unblock User' : 'Confirm Suspension'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Change Role Modal */}
      {modalType === 'role' && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl bg-card border border-border-subtle p-6 space-y-4 text-text-primary shadow-2xl">
            <div className="flex items-center gap-3 pb-3 border-b border-border-subtle">
              <div className="h-9 w-9 rounded-xl bg-accent/15 text-accent flex items-center justify-center font-bold">
                <Edit3 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-black text-base">Change User Role</h3>
                <p className="text-xs text-text-muted">{selectedUser.email}</p>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-xs text-text-secondary">
                Current role: <span className="font-bold text-text-primary capitalize">{selectedUser.role || 'student'}</span>
              </p>
              <div className="space-y-2">
                <label className="text-xs font-bold text-text-secondary">Select New Role</label>
                <div className="grid grid-cols-2 gap-2">
                  {PLATFORM_ROLES.map(({ id, label, color }) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setNewRole(id)}
                      className={`p-3 rounded-xl border text-left text-xs font-bold transition-all ${
                        newRole === id
                          ? `${color} ring-2 ring-white/20`
                          : 'border-border-subtle bg-surface/60 text-text-secondary hover:border-white/20'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                onClick={() => setModalType(null)}
                className="px-4 py-2.5 rounded-xl bg-surface hover:bg-white/10 text-text-secondary text-xs font-bold border border-border-subtle"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateRole}
                disabled={actionLoading}
                className="px-5 py-2.5 rounded-xl bg-accent hover:bg-accent/90 text-white text-xs font-bold shadow-lg shadow-accent/20 transition-all"
              >
                {actionLoading ? 'Saving...' : 'Update Role'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Delete Profile Modal */}
      {modalType === 'delete' && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl bg-card border border-semantic-red/30 p-6 space-y-4 text-text-primary shadow-2xl">
            <div className="flex items-center gap-3 pb-3 border-b border-border-subtle">
              <div className="h-9 w-9 rounded-xl bg-semantic-red/15 text-semantic-red flex items-center justify-center font-bold">
                <Trash2 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-black text-base text-semantic-red">Delete User Profile</h3>
                <p className="text-xs text-text-muted">{selectedUser.email}</p>
              </div>
            </div>

            <p className="text-xs text-text-secondary leading-relaxed">
              Are you sure you want to delete the profile data for <strong>{selectedUser.displayName}</strong>? This action removes their stored profile document.
            </p>

            {/* Error feedback inside modal */}
            {feedback && feedback.type === 'error' && (
              <div className="p-3 rounded-2xl bg-semantic-red/15 border border-semantic-red/30 text-semantic-red text-xs flex items-center gap-2">
                <AlertOctagon className="h-4 w-4 shrink-0" />
                <span>{feedback.text}</span>
              </div>
            )}

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                onClick={() => {
                  setModalType(null)
                  setFeedback(null)
                }}
                disabled={actionLoading}
                className="px-4 py-2.5 rounded-xl bg-surface hover:bg-white/10 text-text-secondary text-xs font-bold border border-border-subtle"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={actionLoading}
                className="px-5 py-2.5 rounded-xl bg-semantic-red hover:bg-semantic-red/90 text-white text-xs font-bold shadow-lg shadow-semantic-red/20 transition-all flex items-center gap-2"
              >
                {actionLoading ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4" />
                    <span>Delete Profile</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. User Details Modal */}
      {modalType === 'details' && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-in fade-in">
          <div className="w-full max-w-lg rounded-3xl bg-card border border-border-subtle p-6 sm:p-7 space-y-5 text-text-primary shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
              <div className="flex items-center gap-3">
                {selectedUser.photoURL ? (
                  <img src={selectedUser.photoURL} alt="" className="h-11 w-11 rounded-2xl border border-border-subtle" />
                ) : (
                  <div className="h-11 w-11 rounded-2xl bg-hover border border-border-subtle flex items-center justify-center font-bold text-sm">
                    {selectedUser.displayName?.[0]?.toUpperCase() || 'U'}
                  </div>
                )}
                <div>
                  <h3 className="font-black text-base text-text-primary">{selectedUser.displayName}</h3>
                  <p className="text-xs text-text-muted font-mono">{selectedUser.email}</p>
                </div>
              </div>
              <button onClick={() => setModalType(null)} className="text-text-muted hover:text-text-primary text-sm font-bold p-1">
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-2xl bg-surface/60 border border-border-subtle">
                <span className="text-[10px] text-text-muted uppercase font-bold block">Assigned Role</span>
                <p className="font-bold text-text-primary capitalize mt-1">{selectedUser.role || 'student'}</p>
              </div>
              <div className="p-3 rounded-2xl bg-surface/60 border border-border-subtle">
                <span className="text-[10px] text-text-muted uppercase font-bold block">Status</span>
                <p className="font-bold mt-1">
                  {selectedUser.isBlocked ? (
                    <span className="text-semantic-red">Suspended</span>
                  ) : (
                    <span className="text-emerald-400">Active</span>
                  )}
                </p>
              </div>
              <div className="p-3 rounded-2xl bg-surface/60 border border-border-subtle">
                <span className="text-[10px] text-text-muted uppercase font-bold block">Problems Solved</span>
                <p className="font-bold text-text-primary mt-1">{selectedUser.totalSolved || 0}</p>
              </div>
              <div className="p-3 rounded-2xl bg-surface/60 border border-border-subtle">
                <span className="text-[10px] text-text-muted uppercase font-bold block">Current Streak</span>
                <p className="font-bold text-text-primary mt-1">{selectedUser.currentStreak || 0} days</p>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-base border border-border-subtle space-y-1 text-xs">
              <div className="flex justify-between py-1 border-b border-border-subtle/50 text-[11px]">
                <span className="text-text-muted">UID</span>
                <span className="font-mono text-text-secondary truncate max-w-[200px]">{selectedUser.uid}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border-subtle/50 text-[11px]">
                <span className="text-text-muted">Department</span>
                <span className="font-medium text-text-secondary">{selectedUser.department || 'N/A'}</span>
              </div>
              <div className="flex justify-between py-1 text-[11px]">
                <span className="text-text-muted">Registered On</span>
                <span className="text-text-secondary">
                  {selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleDateString() : 'N/A'}
                </span>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setModalType(null)}
                className="px-5 py-2.5 rounded-xl bg-accent text-white text-xs font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
