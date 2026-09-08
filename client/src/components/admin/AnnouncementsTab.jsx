import { useState } from 'react'
import { Bell, Send, Trash2, CheckCircle2, AlertTriangle, AlertCircle, Info } from 'lucide-react'
import { createAnnouncement, deleteAnnouncement } from '@/services/adminService'

export default function AnnouncementsTab({ adminUser, announcements = [], onRefresh }) {
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')
  const [priority, setPriority] = useState('info') // 'info' | 'warning' | 'urgent'
  const [audience, setAudience] = useState('all') // 'all' | 'student' | 'teacher'
  const [loading, setLoading] = useState(false)
  const [feedback, setFeedback] = useState(null)

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!title.trim() || !message.trim()) return

    setLoading(true)
    setFeedback(null)
    try {
      await createAnnouncement(adminUser, {
        title: title.trim(),
        message: message.trim(),
        priority,
        audience,
      })
      setTitle('')
      setMessage('')
      setFeedback({ type: 'success', text: 'Announcement broadcasted successfully!' })
      if (onRefresh) onRefresh()
    } catch (err) {
      setFeedback({ type: 'error', text: err.message || 'Failed to post announcement.' })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this broadcast? It will be removed from all user dashboards.')) return
    try {
      await deleteAnnouncement(adminUser, id)
      if (onRefresh) onRefresh()
    } catch (err) {
      alert('Failed to delete announcement: ' + err.message)
    }
  }

  const getPriorityBadge = (p) => {
    switch (p) {
      case 'urgent':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-semantic-red/15 text-semantic-red border border-semantic-red/30 text-[10px] font-bold uppercase">
            <AlertCircle className="h-3 w-3" />
            Urgent
          </span>
        )
      case 'warning':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30 text-[10px] font-bold uppercase">
            <AlertTriangle className="h-3 w-3" />
            Warning
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-500/15 text-blue-400 border border-blue-500/30 text-[10px] font-bold uppercase">
            <Info className="h-3 w-3" />
            General Info
          </span>
        )
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Creation Card */}
      <div className="p-6 rounded-3xl bg-surface/70 border border-border-subtle backdrop-blur-xl space-y-4">
        <div className="flex items-center gap-2 text-accent font-bold text-xs uppercase tracking-wider">
          <Bell className="h-4 w-4" />
          <span>Platform Broadcast Transmitter</span>
        </div>
        <div>
          <h2 className="text-xl font-black text-text-primary">Create System Announcement</h2>
          <p className="text-xs text-text-secondary mt-0.5">
            Post campus announcements, placement drive reminders, or maintenance notices directly to student and teacher dashboards.
          </p>
        </div>

        {feedback && (
          <div
            className={`p-3.5 rounded-2xl border text-xs font-semibold flex items-center gap-2 ${
              feedback.type === 'success'
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                : 'bg-semantic-red/10 border-semantic-red/30 text-semantic-red'
            }`}
          >
            {feedback.type === 'success' ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
            <span>{feedback.text}</span>
          </div>
        )}

        <form onSubmit={handleCreate} className="space-y-4 pt-1">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="md:col-span-2 space-y-1.5">
              <label className="text-xs font-bold text-text-secondary">Announcement Title *</label>
              <input
                type="text"
                required
                placeholder="e.g. Google Online Assessment Round Scheduled for Oct 15"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-base border border-border-subtle rounded-xl px-3.5 py-2.5 text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-text-secondary">Target Audience</label>
              <select
                value={audience}
                onChange={(e) => setAudience(e.target.value)}
                className="w-full bg-base border border-border-subtle rounded-xl px-3 py-2.5 text-xs text-text-primary focus:outline-none focus:border-accent transition-all"
              >
                <option value="all">Everyone (Students & Faculty)</option>
                <option value="student">Students Only</option>
                <option value="teacher">Teachers Only</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-text-secondary">Message Content *</label>
            <textarea
              required
              rows={3}
              placeholder="Provide key details, dates, action items, or links..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full bg-base border border-border-subtle rounded-xl p-3.5 text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent transition-all"
            />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-text-secondary">Priority Level:</span>
              <div className="flex items-center gap-1.5">
                {[
                  { id: 'info', label: 'Info' },
                  { id: 'warning', label: 'Warning' },
                  { id: 'urgent', label: 'Urgent' },
                ].map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setPriority(p.id)}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                      priority === p.id
                        ? 'bg-accent text-white shadow-sm ring-1 ring-white/20'
                        : 'bg-surface hover:bg-white/10 text-text-secondary'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-accent to-indigo-600 hover:from-accent/90 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-accent/20 transition-all flex items-center justify-center gap-2"
            >
              <Send className="h-3.5 w-3.5" />
              <span>{loading ? 'Broadcasting...' : 'Broadcast to Placify'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Active Broadcasts List */}
      <div className="space-y-3">
        <h3 className="text-sm font-black text-text-primary px-1">
          Active Platform Announcements ({announcements.length})
        </h3>

        {announcements.length === 0 ? (
          <div className="p-8 rounded-3xl bg-surface/40 border border-border-subtle text-center text-text-muted">
            <p className="font-semibold text-text-primary text-sm">No active announcements</p>
            <p className="text-xs text-text-secondary mt-0.5">Use the form above to broadcast messages to all users.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {announcements.map((a) => (
              <div
                key={a.id}
                className="p-5 rounded-3xl bg-surface/50 border border-border-subtle backdrop-blur-xl flex items-start justify-between gap-4 shadow-lg hover:border-white/20 transition-all"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    {getPriorityBadge(a.priority)}
                    <span className="px-2 py-0.5 rounded-full bg-white/5 text-text-muted text-[10px] font-mono uppercase">
                      Target: {a.audience || 'all'}
                    </span>
                    <span className="text-[10px] text-text-muted font-mono">
                      {a.createdAt?.toDate ? a.createdAt.toDate().toLocaleString() : 'Just now'}
                    </span>
                  </div>
                  <h4 className="font-bold text-text-primary text-sm">{a.title}</h4>
                  <p className="text-xs text-text-secondary leading-relaxed whitespace-pre-line">{a.message}</p>
                </div>

                <button
                  onClick={() => handleDelete(a.id)}
                  className="p-2 rounded-xl bg-surface hover:bg-semantic-red/20 text-text-muted hover:text-semantic-red border border-border-subtle hover:border-semantic-red/30 transition-all shrink-0"
                  title="Delete announcement"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
