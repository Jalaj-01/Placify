import { useState } from 'react'
import {
  Briefcase, Calendar, Plus, FileText, CheckCircle, Clock,
  ExternalLink, ChevronRight, AlertCircle, Building2, MapPin, DollarSign, X,
  Bell, Mail, ShieldAlert
} from 'lucide-react'
import { triggerTestNotification, generateCalendarEmailUrl } from '@/utils/notifications'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { cn } from '@/lib/utils'

export default function ApplicationsKanban({ applications = [], onUpdateApplication, userEmail }) {
  const [apps, setApps] = useState(() => {
    if (applications && applications.length > 0) return applications
    return [
      {
        id: '1',
        company: 'Google',
        role: 'Software Engineering Intern',
        location: 'Bengaluru / Remote',
        ctc: '₹1.2L/mo',
        status: 'Interview',
        oaDate: 'Jul 24, 2026',
        interviewDate: 'Aug 05, 2026',
        prepNotes: 'Focus on Graph Algorithms, DP State Compression, and System Design basics.',
        pastQuestions: ['Binary Tree Maximum Path Sum', 'Design a Rate Limiter', 'LRU Cache']
      },
      {
        id: '2',
        company: 'Microsoft',
        role: 'SDE-1',
        location: 'Hyderabad',
        ctc: '₹45 LPA',
        status: 'OA Scheduled',
        oaDate: 'Aug 03, 2026',
        interviewDate: 'TBD',
        prepNotes: 'Review Trie data structures and OS Concurrency Semaphores.',
        pastQuestions: ['Find Median from Data Stream', 'Producer-Consumer Problem']
      },
      {
        id: '3',
        company: 'Amazon',
        role: 'SDE-1 (AWS)',
        location: 'Bengaluru',
        ctc: '₹44 LPA',
        status: 'Applied',
        oaDate: 'Pending',
        interviewDate: 'TBD',
        prepNotes: 'Leadership Principles: Customer Obsession, Ownership, Deep Dive.',
        pastQuestions: ['Top K Frequent Elements', 'Course Schedule II']
      },
      {
        id: '4',
        company: 'Atlassian',
        role: 'Software Engineer',
        location: 'Bengaluru',
        ctc: '₹55 LPA',
        status: 'Wishlist',
        oaDate: 'TBD',
        interviewDate: 'TBD',
        prepNotes: 'Review OOP design patterns and code quality clean architecture.',
        pastQuestions: ['Snake and Ladder Game', 'Design Key-Value Store']
      },
      {
        id: '5',
        company: 'Uber',
        role: 'Software Engineer',
        location: 'Bengaluru',
        ctc: '₹50 LPA',
        status: 'Offer',
        oaDate: 'Jun 15, 2026',
        interviewDate: 'Jul 10, 2026',
        prepNotes: 'Offer received! Review joining date and relocation benefits.',
        pastQuestions: ['Bus Routes (BFS)', 'Design Ride Matching Service']
      }
    ]
  })

  const columns = [
    { key: 'Wishlist', title: 'Wishlist', dotColor: 'bg-slate-400', badgeBg: 'bg-slate-500/15 text-slate-500 dark:text-slate-400 border-slate-500/30' },
    { key: 'Applied', title: 'Applied', dotColor: 'bg-blue-500', badgeBg: 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30' },
    { key: 'OA Scheduled', title: 'OA Scheduled', dotColor: 'bg-amber-500', badgeBg: 'bg-amber-500/15 text-amber-600 dark:text-amber-300 border-amber-500/30' },
    { key: 'Interview', title: 'Interview', dotColor: 'bg-purple-500', badgeBg: 'bg-purple-500/15 text-purple-600 dark:text-purple-300 border-purple-500/30' },
    { key: 'Offer', title: 'Offer Received', dotColor: 'bg-emerald-500', badgeBg: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30' },
    { key: 'Rejected', title: 'Rejected', dotColor: 'bg-rose-500', badgeBg: 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30' }
  ]

  const [selectedApp, setSelectedApp] = useState(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [newApp, setNewApp] = useState({
    company: '',
    role: 'SDE-1',
    location: 'Bengaluru',
    ctc: '₹30 LPA',
    status: 'Applied',
    oaDate: 'TBD',
    interviewDate: 'TBD',
    prepNotes: '',
    pastQuestions: []
  })

  const handleMoveStatus = (appId, newStatus) => {
    setApps((prev) =>
      prev.map((a) => (a.id === appId ? { ...a, status: newStatus } : a))
    )
  }

  const handleAddApp = (e) => {
    e.preventDefault()
    if (!newApp.company.trim()) return
    const appToAdd = {
      ...newApp,
      id: String(Date.now()),
      pastQuestions: ['Sample Technical Interview Question']
    }
    setApps((prev) => [appToAdd, ...prev])
    setShowAddModal(false)
    setNewApp({
      company: '',
      role: 'SDE-1',
      location: 'Bengaluru',
      ctc: '₹30 LPA',
      status: 'Applied',
      oaDate: 'TBD',
      interviewDate: 'TBD',
      prepNotes: '',
      pastQuestions: []
    })
  }

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-surface/40 border border-border-subtle">
        <div>
          <h2 className="text-section font-semibold text-text-primary flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-accent" />
            Placement Application Kanban Pipeline
          </h2>
          <p className="text-xs text-text-muted">Track company drives, OA deadlines, interview rounds, and prep notes.</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 rounded-xl bg-accent text-white font-semibold text-xs hover:bg-accent-light transition-all flex items-center gap-2 shadow-md shadow-accent/20 shrink-0"
        >
          <Plus className="h-4 w-4" />
          <span>Add Application</span>
        </button>
      </div>

      {/* Deadline & PWA Push Notifications Alert Bar */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-accent/15 via-surface to-surface border border-accent/30 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/20 text-accent-light shrink-0">
            <Bell className="h-5 w-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-text-primary">Deadline Protection & Notifications</span>
              <span className="px-2 py-0.5 rounded-full bg-semantic-green/20 text-semantic-green text-[10px] font-bold border border-semantic-green/30">
                PWA / Browser Active
              </span>
            </div>
            <p className="text-xs text-text-secondary">
              Automated reminders fire 24h & 48h before Online Assessments (OA) and interview rounds.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => triggerTestNotification()}
            className="px-3.5 py-1.5 rounded-xl bg-surface hover:bg-hover border border-accent/40 text-accent dark:text-accent-light text-xs font-semibold transition-all flex items-center gap-1.5 shadow-sm"
          >
            <Bell className="h-3.5 w-3.5" />
            <span>Test Push Alert</span>
          </button>
          {selectedApp && (
            <a
              href={generateCalendarEmailUrl(selectedApp, userEmail)}
              className="px-3.5 py-1.5 rounded-xl bg-accent/20 hover:bg-accent/30 border border-accent/40 text-accent dark:text-accent-light text-xs font-semibold transition-all flex items-center gap-1.5"
            >
              <Mail className="h-3.5 w-3.5" />
              <span>Send Mail Reminder</span>
            </a>
          )}
        </div>
      </div>

      {/* Kanban Board Responsive 6-Column Container */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 w-full pb-4 pt-2">
        {columns.map((col) => {
          const colApps = apps.filter((a) => a.status === col.key)
          return (
            <div key={col.key} className="w-full flex flex-col rounded-2xl bg-surface/90 border border-border-subtle p-3 shadow-lg backdrop-blur-xl min-w-0">
              <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-border-subtle gap-1">
                <span className={`px-2 py-0.5 rounded-full text-[11px] font-mono font-bold border truncate ${col.badgeBg}`}>
                  {col.title}
                </span>
                <span className="text-[10px] font-mono text-text-muted bg-base px-2 py-0.5 rounded-full border border-border-subtle font-bold shrink-0">
                  {colApps.length}
                </span>
              </div>

              <div className="space-y-2.5 flex-1 overflow-y-auto max-h-[580px] pr-0.5">
                {colApps.length === 0 ? (
                  <div className="p-4 text-center text-text-muted text-[11px] border border-dashed border-border-subtle rounded-xl bg-base/50">
                    No applications
                  </div>
                ) : (
                  colApps.map((app) => (
                    <div
                      key={app.id}
                      onClick={() => setSelectedApp(app)}
                      className="p-3 rounded-xl bg-base/80 border border-border-subtle hover:border-accent/50 transition-all cursor-pointer space-y-2 group shadow-sm backdrop-blur-md"
                    >
                      <div className="flex items-start justify-between gap-1.5">
                        <div className="space-y-0.5 flex-1 min-w-0">
                          <h4 className="font-bold text-text-primary text-xs group-hover:text-accent transition-colors truncate">
                            {app.company}
                          </h4>
                          <p className="text-[11px] text-text-secondary truncate font-medium">{app.role}</p>
                        </div>
                        <span className="text-[10px] font-mono text-semantic-green font-bold bg-semantic-green/10 px-1.5 py-0.5 rounded border border-semantic-green/20 shrink-0">
                          {app.ctc}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-text-muted pt-1.5 border-t border-border-subtle font-medium">
                        <span className="flex items-center gap-1 truncate">
                          <Calendar className="h-3 w-3 text-accent shrink-0" /> {app.oaDate}
                        </span>
                        <span className="text-accent hover:underline flex items-center gap-0.5 font-bold shrink-0">
                          Notes <ChevronRight className="h-3 w-3" />
                        </span>
                      </div>

                      {/* Quick Move Status Custom Select Dropdown */}
                      <div className="pt-1.5 border-t border-border-subtle" onClick={(e) => e.stopPropagation()}>
                        <Select value={app.status} onValueChange={(val) => handleMoveStatus(app.id, val)}>
                          <SelectTrigger className="w-full h-7 bg-surface/90 hover:bg-hover border border-border-subtle text-[10px] font-semibold rounded-lg px-2 text-text-primary focus:ring-1 focus:ring-accent focus:ring-offset-0 transition-all shadow-xs [&>span]:line-clamp-1">
                            <div className="flex items-center gap-1.5 truncate">
                              <span className={cn("h-1.5 w-1.5 rounded-full shrink-0", columns.find(c => c.key === app.status)?.dotColor || 'bg-accent')} />
                              <span className="truncate">Move to {columns.find(c => c.key === app.status)?.title || app.status}</span>
                            </div>
                          </SelectTrigger>
                          <SelectContent className="bg-card/95 backdrop-blur-xl border border-border-subtle shadow-2xl rounded-xl p-1 z-50 min-w-[160px]">
                            {columns.map((c) => (
                              <SelectItem
                                key={c.key}
                                value={c.key}
                                className="text-[11px] py-1.5 pl-7 pr-2 font-medium cursor-pointer rounded-lg hover:bg-hover focus:bg-accent/15 focus:text-accent transition-colors"
                              >
                                <div className="flex items-center gap-2">
                                  <span className={cn("h-2 w-2 rounded-full shrink-0", c.dotColor)} />
                                  <span className="font-semibold text-text-primary">{c.title}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Application Prep Details Modal */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200 overflow-y-auto">
          <div className="w-full max-w-lg rounded-2xl bg-card border border-border-subtle p-6 shadow-2xl space-y-5 text-text-primary">
            <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/20 text-accent font-bold text-base">
                  {selectedApp.company[0]}
                </div>
                <div>
                  <h3 className="font-bold text-text-primary text-base">{selectedApp.company}</h3>
                  <p className="text-xs text-text-muted">{selectedApp.role} • {selectedApp.ctc}</p>
                </div>
              </div>
              <button onClick={() => setSelectedApp(null)} className="text-text-muted hover:text-text-primary">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-surface border border-border-subtle">
                <div>
                  <span className="text-text-muted block text-[11px]">OA Date</span>
                  <span className="font-semibold text-text-primary">{selectedApp.oaDate}</span>
                </div>
                <div>
                  <span className="text-text-muted block text-[11px]">Interview Date</span>
                  <span className="font-semibold text-text-primary">{selectedApp.interviewDate}</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <span className="font-semibold text-text-primary block">Company Prep Notes</span>
                <p className="p-3 rounded-xl bg-surface/50 border border-border-subtle text-text-secondary leading-relaxed">
                  {selectedApp.prepNotes || 'No specific prep notes added.'}
                </p>
              </div>

              <div className="space-y-2">
                <span className="font-semibold text-text-primary block">Past Interview Questions</span>
                <div className="space-y-1.5">
                  {selectedApp.pastQuestions?.map((q, idx) => (
                    <div key={idx} className="p-2.5 rounded-lg bg-surface/60 border border-border-subtle text-text-secondary flex items-center justify-between">
                      <span>• {q}</span>
                      <span className="text-[10px] text-accent font-mono font-semibold">Solved</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Application Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200 overflow-y-auto">
          <div className="w-full max-w-lg rounded-2xl bg-card border border-border-subtle p-6 shadow-2xl space-y-5 text-text-primary">
            <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
              <h3 className="font-bold text-text-primary text-base">Add Placement Application</h3>
              <button onClick={() => setShowAddModal(false)} className="text-text-muted hover:text-text-primary">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleAddApp} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs text-text-secondary block">Company Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Google, Microsoft, Atlassian"
                  value={newApp.company}
                  onChange={(e) => setNewApp({ ...newApp, company: e.target.value })}
                  className="w-full bg-base border border-border-subtle rounded-lg px-3 py-2 text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs text-text-secondary block">Role Title</label>
                  <input
                    type="text"
                    value={newApp.role}
                    onChange={(e) => setNewApp({ ...newApp, role: e.target.value })}
                    className="w-full bg-base border border-border-subtle rounded-lg px-3 py-2 text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-text-secondary block">CTC / Stipend</label>
                  <input
                    type="text"
                    value={newApp.ctc}
                    onChange={(e) => setNewApp({ ...newApp, ctc: e.target.value })}
                    className="w-full bg-base border border-border-subtle rounded-lg px-3 py-2 text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs text-text-secondary block">Status</label>
                  <Select
                    value={newApp.status}
                    onValueChange={(val) => setNewApp({ ...newApp, status: val })}
                  >
                    <SelectTrigger className="w-full bg-base border border-border-subtle text-xs text-text-primary rounded-lg h-9 px-3">
                      <div className="flex items-center gap-2">
                        <span className={cn("h-2 w-2 rounded-full shrink-0", columns.find(c => c.key === newApp.status)?.dotColor || 'bg-accent')} />
                        <span>{columns.find(c => c.key === newApp.status)?.title || newApp.status}</span>
                      </div>
                    </SelectTrigger>
                    <SelectContent className="bg-card border border-border-subtle shadow-xl rounded-xl p-1 z-50">
                      {columns.map((c) => (
                        <SelectItem key={c.key} value={c.key} className="text-xs py-1.5 font-medium cursor-pointer rounded-lg">
                          <div className="flex items-center gap-2">
                            <span className={cn("h-2 w-2 rounded-full shrink-0", c.dotColor)} />
                            <span className="font-medium text-text-primary">{c.title}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-text-secondary block">OA Date</label>
                  <input
                    type="text"
                    placeholder="e.g. Aug 10, 2026"
                    value={newApp.oaDate}
                    onChange={(e) => setNewApp({ ...newApp, oaDate: e.target.value })}
                    className="w-full bg-base border border-border-subtle rounded-lg px-3 py-2 text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-text-secondary block">Company Prep Notes</label>
                <textarea
                  rows={3}
                  placeholder="Key topics to focus on, company values, past interview rounds..."
                  value={newApp.prepNotes}
                  onChange={(e) => setNewApp({ ...newApp, prepNotes: e.target.value })}
                  className="w-full bg-base border border-border-subtle rounded-lg p-3 text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-accent text-white font-semibold text-xs hover:bg-accent-light transition-colors flex items-center justify-center gap-2 shadow-lg shadow-accent/20"
              >
                <span>Save Application</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
