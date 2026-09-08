import { useState } from 'react'
import {
  Bell, Send, Trash2, Edit3, CheckCircle2, AlertTriangle, AlertCircle, Info,
  Flame, Clock, Calendar, Users, Eye, X, RefreshCw, AlertOctagon, Filter,
  Sparkles, Check, ChevronDown, ShieldAlert, Timer, Hourglass
} from 'lucide-react'
import { createAnnouncement, updateAnnouncement, deleteAnnouncement } from '@/services/adminService'

// ─── Priority System ─────────────────────────────────────────────
const PRIORITIES = [
  {
    id: 'info',
    label: 'Info',
    title: 'Platform Info',
    desc: 'Tips, feature updates, and general campus info',
    color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30',
    activeRing: 'ring-cyan-500/40 bg-cyan-500/20 text-cyan-300',
    icon: Info,
    badgeClass: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
  },
  {
    id: 'notice',
    label: 'Notice',
    title: 'Campus Notice',
    desc: 'Routine circulars, timetable updates, and academic notices',
    color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
    activeRing: 'ring-emerald-500/40 bg-emerald-500/20 text-emerald-300',
    icon: Bell,
    badgeClass: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  },
  {
    id: 'warning',
    label: 'Warning',
    title: 'High Priority',
    desc: 'Approaching deadlines, exam dates, and registration windows',
    color: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
    activeRing: 'ring-amber-500/40 bg-amber-500/20 text-amber-300',
    icon: AlertTriangle,
    badgeClass: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  },
  {
    id: 'urgent',
    label: 'Critical',
    title: 'Urgent / Action Required',
    desc: 'Immediate action required, test starting, or system maintenance',
    color: 'text-rose-400 bg-rose-500/15 border-rose-500/40',
    activeRing: 'ring-rose-500/40 bg-rose-500/25 text-rose-300',
    icon: Flame,
    badgeClass: 'bg-rose-500/15 text-rose-400 border-rose-500/40 shadow-sm shadow-rose-500/20 animate-pulse',
  },
]

// ─── Expiry Presets ──────────────────────────────────────────────
const EXPIRY_PRESETS = [
  { id: 'none', label: 'Permanent', desc: 'Never expires' },
  { id: '1h', label: '1 Hour', desc: 'Expires in 60 mins' },
  { id: '6h', label: '6 Hours', desc: 'Expires in 6 hours' },
  { id: '24h', label: '24 Hours', desc: '1 Day' },
  { id: '3d', label: '3 Days', desc: '3 Days' },
  { id: '7d', label: '7 Days', desc: '1 Week' },
  { id: 'custom', label: 'Custom Date', desc: 'Pick exact date & time' },
]

function computeExpiryDate(preset, customDateTime) {
  if (preset === 'none') return null
  const now = Date.now()
  if (preset === '1h') return new Date(now + 1 * 60 * 60 * 1000)
  if (preset === '6h') return new Date(now + 6 * 60 * 60 * 1000)
  if (preset === '24h') return new Date(now + 24 * 60 * 60 * 1000)
  if (preset === '3d') return new Date(now + 3 * 24 * 60 * 60 * 1000)
  if (preset === '7d') return new Date(now + 7 * 24 * 60 * 60 * 1000)
  if (preset === 'custom' && customDateTime) {
    const d = new Date(customDateTime)
    return isNaN(d.getTime()) ? null : d
  }
  return null
}

function getExpiryStatus(expiresAt) {
  if (!expiresAt) {
    return { isExpired: false, isPermanent: true, label: 'Permanent', shortLabel: 'Permanent' }
  }
  const expMs = expiresAt.toDate ? expiresAt.toDate().getTime() : new Date(expiresAt).getTime()
  if (isNaN(expMs)) {
    return { isExpired: false, isPermanent: true, label: 'Permanent', shortLabel: 'Permanent' }
  }
  const diff = expMs - Date.now()
  if (diff <= 0) {
    return { isExpired: true, isPermanent: false, label: 'Expired', shortLabel: 'Expired' }
  }
  const minutes = Math.floor(diff / (1000 * 60))
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  if (days > 0) {
    return {
      isExpired: false,
      isPermanent: false,
      label: `Expires in ${days}d ${hours % 24}h`,
      shortLabel: `${days}d left`,
      exactDate: new Date(expMs).toLocaleString(),
    }
  }
  if (hours > 0) {
    return {
      isExpired: false,
      isPermanent: false,
      label: `Expires in ${hours}h ${minutes % 60}m`,
      shortLabel: `${hours}h left`,
      exactDate: new Date(expMs).toLocaleString(),
    }
  }
  return {
    isExpired: false,
    isPermanent: false,
    label: `Expires in ${minutes}m`,
    shortLabel: `${minutes}m left`,
    isImminent: true,
    exactDate: new Date(expMs).toLocaleString(),
  }
}

export default function AnnouncementsTab({ adminUser, announcements = [], onRefresh }) {
  // Form State (Creation)
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')
  const [priority, setPriority] = useState('info')
  const [audience, setAudience] = useState('all') // 'all' | 'student' | 'teacher'
  const [expiryPreset, setExpiryPreset] = useState('24h')
  const [customExpiry, setCustomExpiry] = useState('')
  const [loading, setLoading] = useState(false)
  const [feedback, setFeedback] = useState(null)

  // Filters State
  const [searchQuery, setSearchQuery] = useState('')
  const [filterPriority, setFilterPriority] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all') // 'all' | 'active' | 'expired'
  const [filterAudience, setFilterAudience] = useState('all')

  // Edit Modal State
  const [editingAnnouncement, setEditingAnnouncement] = useState(null)
  const [editTitle, setEditTitle] = useState('')
  const [editMessage, setEditMessage] = useState('')
  const [editPriority, setEditPriority] = useState('info')
  const [editAudience, setEditAudience] = useState('all')
  const [editExpiryPreset, setEditExpiryPreset] = useState('none')
  const [editCustomExpiry, setEditCustomExpiry] = useState('')
  const [editActive, setEditActive] = useState(true)
  const [editLoading, setEditLoading] = useState(false)
  const [editFeedback, setEditFeedback] = useState(null)

  // Custom Delete Modal State (Replaces ugly browser window.confirm!)
  const [announcementToDelete, setAnnouncementToDelete] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  // Handle Create Announcement
  const handleCreate = async (e) => {
    e.preventDefault()
    if (!title.trim() || !message.trim()) return

    const expiryDate = computeExpiryDate(expiryPreset, customExpiry)
    if (expiryPreset === 'custom' && !expiryDate) {
      setFeedback({ type: 'error', text: 'Please choose a valid future expiration date and time.' })
      return
    }

    setLoading(true)
    setFeedback(null)
    try {
      await createAnnouncement(adminUser, {
        title: title.trim(),
        message: message.trim(),
        priority,
        audience,
        expiresAt: expiryDate,
      })
      setTitle('')
      setMessage('')
      setExpiryPreset('24h')
      setCustomExpiry('')
      setFeedback({ type: 'success', text: 'Broadcast published to dashboards successfully!' })
      if (onRefresh) onRefresh()
    } catch (err) {
      console.error('createAnnouncement error:', err)
      setFeedback({ type: 'error', text: err.message || 'Failed to post announcement.' })
    } finally {
      setLoading(false)
    }
  }

  // Open Edit Modal
  const openEditModal = (item) => {
    setEditingAnnouncement(item)
    setEditTitle(item.title || '')
    setEditMessage(item.message || '')
    setEditPriority(item.priority || 'info')
    setEditAudience(item.audience || 'all')
    setEditActive(item.active !== false)
    setEditFeedback(null)

    if (item.expiresAt) {
      const expDate = item.expiresAt.toDate ? item.expiresAt.toDate() : new Date(item.expiresAt)
      setEditExpiryPreset('custom')
      // Format as YYYY-MM-DDTHH:MM for datetime-local
      const iso = new Date(expDate.getTime() - expDate.getTimezoneOffset() * 60000).toISOString().slice(0, 16)
      setEditCustomExpiry(iso)
    } else {
      setEditExpiryPreset('none')
      setEditCustomExpiry('')
    }
  }

  // Handle Save Edit
  const handleSaveEdit = async (e) => {
    e.preventDefault()
    if (!editingAnnouncement || !editTitle.trim() || !editMessage.trim()) return

    const expiryDate = computeExpiryDate(editExpiryPreset, editCustomExpiry)
    if (editExpiryPreset === 'custom' && !expiryDate) {
      setEditFeedback({ type: 'error', text: 'Please choose a valid expiration date and time.' })
      return
    }

    setEditLoading(true)
    setEditFeedback(null)
    try {
      await updateAnnouncement(adminUser, editingAnnouncement.id, {
        title: editTitle.trim(),
        message: editMessage.trim(),
        priority: editPriority,
        audience: editAudience,
        expiresAt: expiryDate,
        active: editActive,
      })
      setEditingAnnouncement(null)
      setFeedback({ type: 'success', text: 'Announcement updated successfully!' })
      if (onRefresh) onRefresh()
    } catch (err) {
      console.error('updateAnnouncement error:', err)
      setEditFeedback({ type: 'error', text: err.message || 'Failed to update announcement.' })
    } finally {
      setEditLoading(false)
    }
  }

  // Handle Confirm Delete (Smooth Custom Modal)
  const handleConfirmDelete = async () => {
    if (!announcementToDelete) return
    setDeleteLoading(true)
    try {
      await deleteAnnouncement(adminUser, announcementToDelete.id)
      setAnnouncementToDelete(null)
      setFeedback({ type: 'success', text: `Broadcast "${announcementToDelete.title}" deleted.` })
      if (onRefresh) onRefresh()
    } catch (err) {
      console.error('deleteAnnouncement error:', err)
      setFeedback({ type: 'error', text: err.message || 'Failed to delete announcement.' })
    } finally {
      setDeleteLoading(false)
    }
  }

  // Quick Extend Expired Announcement
  const handleQuickExtend = async (item, hoursToAdd = 24) => {
    try {
      const newExpiry = new Date(Date.now() + hoursToAdd * 60 * 60 * 1000)
      await updateAnnouncement(adminUser, item.id, {
        title: item.title,
        message: item.message,
        priority: item.priority,
        audience: item.audience,
        expiresAt: newExpiry,
        active: true,
      })
      setFeedback({ type: 'success', text: `Broadcast extended for +${hoursToAdd} hours!` })
      if (onRefresh) onRefresh()
    } catch (err) {
      setFeedback({ type: 'error', text: err.message || 'Failed to extend announcement.' })
    }
  }

  // Filter Announcements
  const filteredAnnouncements = announcements.filter((a) => {
    const q = searchQuery.toLowerCase().trim()
    const matchesQuery =
      !q ||
      (a.title || '').toLowerCase().includes(q) ||
      (a.message || '').toLowerCase().includes(q) ||
      (a.createdBy || '').toLowerCase().includes(q)

    const matchesPriority = filterPriority === 'all' || a.priority === filterPriority
    const matchesAudience = filterAudience === 'all' || (a.audience || 'all') === filterAudience

    const expiryInfo = getExpiryStatus(a.expiresAt)
    let matchesStatus = true
    if (filterStatus === 'active') {
      matchesStatus = a.active !== false && !expiryInfo.isExpired
    } else if (filterStatus === 'expired') {
      matchesStatus = expiryInfo.isExpired
    }

    return matchesQuery && matchesPriority && matchesAudience && matchesStatus
  })

  // Selected Priority Config Helper
  const currentPriorityConfig = PRIORITIES.find((p) => p.id === priority) || PRIORITIES[0]

  return (
    <div className="space-y-6 w-full max-w-full">
      {/* 1. Top Broadcast Composer Card */}
      <div className="p-6 rounded-3xl bg-surface/70 border border-border-subtle backdrop-blur-2xl shadow-xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-border-subtle/60">
          <div className="flex items-center gap-2 text-accent font-bold text-xs uppercase tracking-wider">
            <div className="h-7 w-7 rounded-xl bg-accent/15 text-accent flex items-center justify-center">
              <Bell className="h-4 w-4" />
            </div>
            <span>Platform Broadcast Transmitter</span>
          </div>

          <div className="flex items-center gap-2 text-xs text-text-muted font-mono">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Ready to Dispatch</span>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-black text-text-primary">Create System Announcement</h2>
          <p className="text-xs text-text-secondary mt-0.5">
            Post campus announcements, placement drive reminders, or maintenance notices directly to student and teacher dashboards.
          </p>
        </div>

        {/* Global Feedback Banner */}
        {feedback && (
          <div
            className={`p-3.5 rounded-2xl border text-xs font-semibold flex items-center justify-between gap-2 transition-all ${
              feedback.type === 'success'
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                : 'bg-semantic-red/10 border-semantic-red/30 text-semantic-red'
            }`}
          >
            <div className="flex items-center gap-2">
              {feedback.type === 'success' ? <CheckCircle2 className="h-4 w-4 shrink-0" /> : <AlertCircle className="h-4 w-4 shrink-0" />}
              <span>{feedback.text}</span>
            </div>
            <button onClick={() => setFeedback(null)} className="text-xs opacity-70 hover:opacity-100 font-bold p-1">✕</button>
          </div>
        )}

        <form onSubmit={handleCreate} className="space-y-5 pt-1">
          {/* Row 1: Title & Target Audience */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-text-secondary">Announcement Title *</label>
                <span className="text-[10px] text-text-muted font-mono">{title.length}/100</span>
              </div>
              <input
                type="text"
                required
                maxLength={100}
                placeholder="e.g. Google Online Assessment Round Scheduled for Oct 15"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-base/80 border border-border-subtle rounded-2xl px-4 py-3 text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent transition-all shadow-inner"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-text-secondary">Target Audience</label>
              <select
                value={audience}
                onChange={(e) => setAudience(e.target.value)}
                className="w-full bg-base/80 border border-border-subtle rounded-2xl px-4 py-3 text-xs text-text-primary focus:outline-none focus:border-accent transition-all cursor-pointer"
              >
                <option value="all">Everyone (Students & Faculty)</option>
                <option value="student">Students Only</option>
                <option value="teacher">Teachers Only</option>
              </select>
            </div>
          </div>

          {/* Row 2: Priority Level Selector (4 Rich Levels) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-text-secondary flex items-center gap-1.5">
                <Flame className="h-3.5 w-3.5 text-amber-400" />
                <span>Select Priority Level *</span>
              </label>
              <span className="text-[11px] text-text-muted hidden sm:inline">
                {currentPriorityConfig.desc}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {PRIORITIES.map((p) => {
                const Icon = p.icon
                const isSelected = priority === p.id
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setPriority(p.id)}
                    className={`p-3 rounded-2xl border text-left transition-all relative overflow-hidden flex flex-col justify-between ${
                      isSelected
                        ? `${p.color} ${p.activeRing} ring-2 shadow-lg`
                        : 'bg-base/60 border-border-subtle hover:bg-surface text-text-secondary hover:text-text-primary'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Icon className="h-4 w-4 shrink-0" />
                        <span className="text-xs font-bold">{p.label}</span>
                      </div>
                      {isSelected && <Check className="h-3.5 w-3.5 shrink-0" />}
                    </div>
                    <span className="text-[10px] opacity-75 mt-1.5 line-clamp-1 block">
                      {p.desc}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Row 3: Message Content */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-text-secondary">Message Content *</label>
              <span className="text-[10px] text-text-muted font-mono">{message.length}/500</span>
            </div>
            <textarea
              required
              rows={3}
              maxLength={500}
              placeholder="Provide key details, dates, zoom links, criteria, or next steps for candidates..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full bg-base/80 border border-border-subtle rounded-2xl p-4 text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent transition-all shadow-inner leading-relaxed"
            />
          </div>

          {/* Row 4: Expiration Settings ("When to expire thing") */}
          <div className="p-4 rounded-2xl bg-base/60 border border-border-subtle space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Timer className="h-4 w-4 text-purple-400" />
                <span className="text-xs font-bold text-text-primary">Auto-Expiration Timer</span>
                <span className="text-[10px] text-text-muted">(Expired broadcasts automatically hide from user dashboards)</span>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {EXPIRY_PRESETS.map((ep) => (
                <button
                  key={ep.id}
                  type="button"
                  onClick={() => setExpiryPreset(ep.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    expiryPreset === ep.id
                      ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30 ring-1 ring-white/20'
                      : 'bg-surface hover:bg-white/10 text-text-secondary border border-border-subtle'
                  }`}
                >
                  {ep.label}
                </button>
              ))}
            </div>

            {/* Custom Expiry Date/Time Picker */}
            {expiryPreset === 'custom' && (
              <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <label className="text-xs font-bold text-text-secondary whitespace-nowrap">
                  Choose Expiration Date & Time:
                </label>
                <input
                  type="datetime-local"
                  required={expiryPreset === 'custom'}
                  min={new Date().toISOString().slice(0, 16)}
                  value={customExpiry}
                  onChange={(e) => setCustomExpiry(e.target.value)}
                  className="bg-surface border border-border-subtle rounded-xl px-3 py-1.5 text-xs text-text-primary focus:outline-none focus:border-purple-500"
                />
              </div>
            )}
          </div>

          {/* Submit Action */}
          <div className="flex items-center justify-between pt-1">
            <span className="text-[11px] text-text-muted">
              Broadcast will be delivered immediately to online users.
            </span>

            <button
              type="submit"
              disabled={loading || !title.trim() || !message.trim()}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-accent to-indigo-600 hover:from-accent/90 hover:to-indigo-500 disabled:opacity-50 text-white text-xs font-bold shadow-xl shadow-accent/25 transition-all flex items-center justify-center gap-2 active:scale-95"
            >
              {loading ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>Transmitting Broadcast...</span>
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  <span>Broadcast to Placify</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* 2. Broadcasts Management & Active List */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 px-1">
          <div>
            <h3 className="text-base font-black text-text-primary flex items-center gap-2">
              <span>Platform Announcements Directory</span>
              <span className="px-2 py-0.5 rounded-full text-xs font-mono bg-surface border border-border-subtle text-accent">
                {filteredAnnouncements.length}
              </span>
            </h3>
            <p className="text-xs text-text-muted mt-0.5">
              Manage active transmissions, edit existing announcements, or review expired notices.
            </p>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {/* Search */}
          <input
            type="text"
            placeholder="Search broadcasts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-surface/60 border border-border-subtle rounded-2xl px-3.5 py-2 text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent"
          />

          {/* Priority Filter */}
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="bg-surface/60 border border-border-subtle rounded-2xl px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-accent cursor-pointer"
          >
            <option value="all">All Priorities</option>
            <option value="urgent">Critical Only</option>
            <option value="warning">Warning Only</option>
            <option value="notice">Notice Only</option>
            <option value="info">Info Only</option>
          </select>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-surface/60 border border-border-subtle rounded-2xl px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-accent cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active Only</option>
            <option value="expired">Expired Only</option>
          </select>

          {/* Audience Filter */}
          <select
            value={filterAudience}
            onChange={(e) => setFilterAudience(e.target.value)}
            className="bg-surface/60 border border-border-subtle rounded-2xl px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-accent cursor-pointer"
          >
            <option value="all">All Audiences</option>
            <option value="student">Students Only</option>
            <option value="teacher">Teachers Only</option>
          </select>
        </div>

        {/* Announcements Cards */}
        {filteredAnnouncements.length === 0 ? (
          <div className="p-10 rounded-3xl bg-surface/40 border border-border-subtle text-center text-text-muted space-y-2">
            <div className="h-12 w-12 rounded-2xl bg-surface border border-border-subtle flex items-center justify-center mx-auto text-text-muted">
              <Bell className="h-6 w-6" />
            </div>
            <p className="font-bold text-text-primary text-sm">No announcements match your search or filter</p>
            <p className="text-xs text-text-secondary">Try adjusting filters or compose a new announcement above.</p>
          </div>
        ) : (
          <div className="space-y-3.5">
            {filteredAnnouncements.map((a) => {
              const priorityCfg = PRIORITIES.find((p) => p.id === a.priority) || PRIORITIES[0]
              const Icon = priorityCfg.icon
              const expiryInfo = getExpiryStatus(a.expiresAt)
              const isInactive = a.active === false

              return (
                <div
                  key={a.id}
                  className={`p-5 rounded-3xl border backdrop-blur-xl transition-all relative overflow-hidden shadow-lg ${
                    expiryInfo.isExpired || isInactive
                      ? 'bg-surface/30 border-border-subtle opacity-75'
                      : a.priority === 'urgent'
                      ? 'bg-rose-500/[0.04] border-rose-500/30 hover:border-rose-500/50'
                      : a.priority === 'warning'
                      ? 'bg-amber-500/[0.04] border-amber-500/30 hover:border-amber-500/50'
                      : 'bg-surface/60 border-border-subtle hover:border-white/20'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="space-y-2.5 flex-1 min-w-0">
                      {/* Chips Header */}
                      <div className="flex items-center gap-2 flex-wrap">
                        {/* Priority Badge */}
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${priorityCfg.badgeClass}`}>
                          <Icon className="h-3 w-3" />
                          <span>{priorityCfg.label}</span>
                        </span>

                        {/* Target Audience Badge */}
                        <span className="px-2.5 py-0.5 rounded-full bg-white/5 border border-border-subtle text-text-secondary text-[10px] font-mono capitalize">
                          👥 {a.audience === 'all' ? 'All Users' : `${a.audience}s Only`}
                        </span>

                        {/* Expiry Badge */}
                        {expiryInfo.isExpired ? (
                          <span className="px-2.5 py-0.5 rounded-full bg-semantic-red/15 border border-semantic-red/30 text-semantic-red text-[10px] font-bold flex items-center gap-1">
                            <Hourglass className="h-3 w-3" />
                            <span>Expired</span>
                          </span>
                        ) : expiryInfo.isPermanent ? (
                          <span className="px-2.5 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-[10px] font-medium flex items-center gap-1">
                            <span>♾️ Permanent</span>
                          </span>
                        ) : (
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-medium border flex items-center gap-1 ${
                              expiryInfo.isImminent
                                ? 'bg-rose-500/15 border-rose-500/30 text-rose-300 animate-pulse'
                                : 'bg-surface border-border-subtle text-text-secondary'
                            }`}
                            title={expiryInfo.exactDate}
                          >
                            <Clock className="h-3 w-3 text-purple-400" />
                            <span>{expiryInfo.label}</span>
                          </span>
                        )}

                        {/* Status (Active / Inactive) */}
                        {isInactive && (
                          <span className="px-2 py-0.5 rounded-full bg-zinc-700/50 text-text-muted text-[10px] font-bold uppercase">
                            Paused
                          </span>
                        )}

                        {/* Posted Timestamp */}
                        <span className="text-[10px] text-text-muted font-mono ml-auto">
                          {a.createdAt?.toDate ? a.createdAt.toDate().toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Just now'}
                        </span>
                      </div>

                      {/* Title */}
                      <h4 className="font-bold text-text-primary text-base leading-snug">
                        {a.title}
                      </h4>

                      {/* Message Body */}
                      <p className="text-xs text-text-secondary leading-relaxed whitespace-pre-line">
                        {a.message}
                      </p>

                      {/* Author Info */}
                      <div className="pt-1 flex items-center gap-2 text-[11px] text-text-muted font-mono">
                        <span>Dispatched by: <strong className="text-text-secondary">{a.createdBy || 'Admin'}</strong></span>
                        {a.updatedAt && (
                          <span>• Edited</span>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex sm:flex-col items-center gap-2 shrink-0 pt-2 sm:pt-0 self-end sm:self-auto border-t sm:border-t-0 border-border-subtle/50 w-full sm:w-auto justify-end">
                      {/* Edit Button */}
                      <button
                        onClick={() => openEditModal(a)}
                        className="px-3 py-2 rounded-xl bg-surface hover:bg-white/10 text-text-secondary hover:text-text-primary border border-border-subtle text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
                        title="Edit Broadcast"
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                        <span>Edit</span>
                      </button>

                      {/* If expired: Quick +24h Extend button */}
                      {expiryInfo.isExpired && (
                        <button
                          onClick={() => handleQuickExtend(a, 24)}
                          className="px-2.5 py-1.5 rounded-xl bg-purple-500/15 hover:bg-purple-500/25 text-purple-300 border border-purple-500/30 text-[11px] font-bold transition-all flex items-center gap-1"
                          title="Reactivate for 24 hours"
                        >
                          <Timer className="h-3 w-3" />
                          <span>+24h</span>
                        </button>
                      )}

                      {/* Delete Button (Triggers Custom Modal, NO browser confirm!) */}
                      <button
                        onClick={() => setAnnouncementToDelete(a)}
                        className="p-2 rounded-xl bg-surface hover:bg-semantic-red/15 text-text-muted hover:text-semantic-red border border-border-subtle hover:border-semantic-red/30 transition-all"
                        title="Delete Broadcast"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* 3. Edit Announcement Modal */}
      {editingAnnouncement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-in fade-in">
          <div className="w-full max-w-2xl rounded-3xl bg-card border border-border-subtle p-6 sm:p-7 space-y-5 text-text-primary shadow-2xl max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-accent/15 text-accent flex items-center justify-center">
                  <Edit3 className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-black text-base text-text-primary">Edit Platform Announcement</h3>
                  <p className="text-xs text-text-muted font-mono">Modifying active broadcast</p>
                </div>
              </div>
              <button
                onClick={() => setEditingAnnouncement(null)}
                className="text-text-muted hover:text-text-primary text-sm font-bold p-1 rounded-lg hover:bg-white/10 transition-colors"
              >
                ✕
              </button>
            </div>

            {editFeedback && (
              <div
                className={`p-3 rounded-2xl border text-xs font-semibold flex items-center gap-2 ${
                  editFeedback.type === 'success'
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                    : 'bg-semantic-red/10 border-semantic-red/30 text-semantic-red'
                }`}
              >
                <AlertOctagon className="h-4 w-4 shrink-0" />
                <span>{editFeedback.text}</span>
              </div>
            )}

            <form onSubmit={handleSaveEdit} className="space-y-4">
              {/* Title & Audience */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="md:col-span-2 space-y-1">
                  <label className="text-xs font-bold text-text-secondary">Announcement Title *</label>
                  <input
                    type="text"
                    required
                    maxLength={100}
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full bg-base border border-border-subtle rounded-xl px-3.5 py-2.5 text-xs text-text-primary focus:outline-none focus:border-accent"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-text-secondary">Target Audience</label>
                  <select
                    value={editAudience}
                    onChange={(e) => setEditAudience(e.target.value)}
                    className="w-full bg-base border border-border-subtle rounded-xl px-3 py-2.5 text-xs text-text-primary focus:outline-none focus:border-accent cursor-pointer"
                  >
                    <option value="all">Everyone</option>
                    <option value="student">Students Only</option>
                    <option value="teacher">Teachers Only</option>
                  </select>
                </div>
              </div>

              {/* Priority Selector */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-text-secondary">Priority Level *</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {PRIORITIES.map((p) => {
                    const Icon = p.icon
                    const isSelected = editPriority === p.id
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setEditPriority(p.id)}
                        className={`p-2.5 rounded-xl border text-left transition-all flex items-center justify-between text-xs font-bold ${
                          isSelected
                            ? `${p.color} ${p.activeRing} ring-1`
                            : 'bg-surface/60 border-border-subtle text-text-secondary hover:text-text-primary'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 truncate">
                          <Icon className="h-3.5 w-3.5 shrink-0" />
                          <span>{p.label}</span>
                        </div>
                        {isSelected && <Check className="h-3 w-3 shrink-0" />}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Message */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-text-secondary">Message Content *</label>
                <textarea
                  required
                  rows={4}
                  maxLength={500}
                  value={editMessage}
                  onChange={(e) => setEditMessage(e.target.value)}
                  className="w-full bg-base border border-border-subtle rounded-xl p-3.5 text-xs text-text-primary focus:outline-none focus:border-accent leading-relaxed"
                />
              </div>

              {/* Expiry Settings */}
              <div className="p-3.5 rounded-2xl bg-base/60 border border-border-subtle space-y-2.5">
                <div className="flex items-center gap-2 text-xs font-bold text-text-primary">
                  <Timer className="h-4 w-4 text-purple-400" />
                  <span>Expiration Setting</span>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {EXPIRY_PRESETS.map((ep) => (
                    <button
                      key={ep.id}
                      type="button"
                      onClick={() => setEditExpiryPreset(ep.id)}
                      className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all ${
                        editExpiryPreset === ep.id
                          ? 'bg-purple-600 text-white'
                          : 'bg-surface hover:bg-white/10 text-text-secondary border border-border-subtle'
                      }`}
                    >
                      {ep.label}
                    </button>
                  ))}
                </div>

                {editExpiryPreset === 'custom' && (
                  <div className="pt-1 flex items-center gap-2">
                    <label className="text-xs text-text-secondary">Expires On:</label>
                    <input
                      type="datetime-local"
                      required={editExpiryPreset === 'custom'}
                      value={editCustomExpiry}
                      onChange={(e) => setEditCustomExpiry(e.target.value)}
                      className="bg-surface border border-border-subtle rounded-xl px-3 py-1.5 text-xs text-text-primary focus:outline-none focus:border-purple-500"
                    />
                  </div>
                )}
              </div>

              {/* Active Toggle */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-surface/50 border border-border-subtle">
                <div>
                  <span className="text-xs font-bold text-text-primary block">Broadcast Status</span>
                  <span className="text-[11px] text-text-muted">
                    {editActive ? 'Currently active and visible to targeted users' : 'Paused (hidden from user dashboards)'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setEditActive(!editActive)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    editActive
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-surface text-text-muted border border-border-subtle'
                  }`}
                >
                  {editActive ? 'Active' : 'Paused'}
                </button>
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-border-subtle">
                <button
                  type="button"
                  onClick={() => setEditingAnnouncement(null)}
                  disabled={editLoading}
                  className="px-4 py-2.5 rounded-xl bg-surface hover:bg-white/10 text-text-secondary text-xs font-bold border border-border-subtle"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editLoading || !editTitle.trim() || !editMessage.trim()}
                  className="px-5 py-2.5 rounded-xl bg-accent hover:bg-accent/90 text-white text-xs font-bold shadow-lg shadow-accent/20 transition-all flex items-center gap-2"
                >
                  {editLoading ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      <span>Saving Changes...</span>
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4" />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. Sleek Custom Delete Confirmation Modal (NO MORE UGLY WINDOW.CONFIRM!) */}
      {announcementToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl bg-card border border-border-subtle p-6 space-y-4 text-text-primary shadow-2xl">
            <div className="flex items-start gap-3.5">
              <div className="h-11 w-11 rounded-2xl bg-semantic-red/15 text-semantic-red border border-semantic-red/30 flex items-center justify-center shrink-0">
                <Trash2 className="h-5 w-5" />
              </div>
              <div className="space-y-1 min-w-0">
                <h3 className="font-black text-base text-text-primary">Delete Platform Broadcast?</h3>
                <p className="text-xs text-text-secondary leading-relaxed">
                  This action cannot be undone. The broadcast will be immediately removed from all student and teacher dashboards.
                </p>
              </div>
            </div>

            {/* Broadcast Details Card */}
            <div className="p-3.5 rounded-2xl bg-base/80 border border-border-subtle space-y-1.5 text-xs">
              <span className="text-[10px] uppercase font-bold text-text-muted tracking-wider">Broadcast to be deleted</span>
              <p className="font-bold text-text-primary line-clamp-1">"{announcementToDelete.title}"</p>
              <p className="text-[11px] text-text-secondary line-clamp-2">{announcementToDelete.message}</p>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setAnnouncementToDelete(null)}
                disabled={deleteLoading}
                className="px-4 py-2.5 rounded-xl bg-surface hover:bg-white/10 text-text-secondary text-xs font-bold border border-border-subtle transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={deleteLoading}
                className="px-5 py-2.5 rounded-xl bg-semantic-red hover:bg-semantic-red/90 text-white text-xs font-bold shadow-lg shadow-semantic-red/25 transition-all flex items-center gap-2"
              >
                {deleteLoading ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4" />
                    <span>Delete Broadcast</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
