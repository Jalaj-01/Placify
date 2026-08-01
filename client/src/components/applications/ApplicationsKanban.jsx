import { useState } from 'react'
import {
  Briefcase, Calendar, Plus, FileText, CheckCircle, Clock,
  ExternalLink, ChevronRight, AlertCircle, Building2, MapPin, DollarSign, X
} from 'lucide-react'

export default function ApplicationsKanban({ applications = [], onUpdateApplication }) {
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
    { key: 'Wishlist', title: 'Wishlist', badgeBg: 'bg-white/10 text-text-muted border-white/10' },
    { key: 'Applied', title: 'Applied', badgeBg: 'bg-blue-500/15 text-blue-400 border-blue-500/30' },
    { key: 'OA Scheduled', title: 'OA Scheduled', badgeBg: 'bg-yellow-500/15 text-yellow-300 border-yellow-500/30' },
    { key: 'Interview', title: 'Interview', badgeBg: 'bg-purple-500/15 text-purple-300 border-purple-500/30' },
    { key: 'Offer', title: 'Offer Received', badgeBg: 'bg-green-500/15 text-green-400 border-green-500/30' },
    { key: 'Rejected', title: 'Rejected', badgeBg: 'bg-red-500/15 text-red-400 border-red-500/30' }
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-surface/40 border border-white/10">
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

      {/* Kanban Board Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3 overflow-x-auto pb-4">
        {columns.map((col) => {
          const colApps = apps.filter((a) => a.status === col.key)
          return (
            <div key={col.key} className="flex flex-col rounded-2xl bg-surface/30 border border-white/5 p-3 min-w-[220px]">
              <div className="flex items-center justify-between pb-3 mb-2 border-b border-white/5">
                <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${col.badgeBg}`}>
                  {col.title}
                </span>
                <span className="text-xs text-text-muted font-bold">{colApps.length}</span>
              </div>

              <div className="space-y-2.5 flex-1 overflow-y-auto max-h-[500px] pr-1">
                {colApps.length === 0 ? (
                  <div className="p-4 text-center text-text-muted text-[11px] border border-dashed border-white/10 rounded-xl">
                    No applications
                  </div>
                ) : (
                  colApps.map((app) => (
                    <div
                      key={app.id}
                      onClick={() => setSelectedApp(app)}
                      className="p-3.5 rounded-xl bg-card border border-white/10 hover:border-accent/40 transition-all cursor-pointer space-y-2 group shadow-sm"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-bold text-text-primary text-xs group-hover:text-accent transition-colors">
                            {app.company}
                          </h4>
                          <p className="text-[11px] text-text-secondary truncate">{app.role}</p>
                        </div>
                        <span className="text-[10px] font-mono text-semantic-green font-semibold">
                          {app.ctc}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-text-muted pt-1 border-t border-white/5">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" /> {app.oaDate}
                        </span>
                        <span className="text-accent hover:underline flex items-center gap-0.5 font-medium">
                          Notes <ChevronRight className="h-3 w-3" />
                        </span>
                      </div>

                      {/* Quick Move Buttons */}
                      <div className="pt-2 flex items-center justify-between border-t border-white/5 text-[10px] opacity-80 group-hover:opacity-100 transition-opacity">
                        <select
                          value={app.status}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) => handleMoveStatus(app.id, e.target.value)}
                          className="bg-base border border-white/10 rounded px-1.5 py-0.5 text-[10px] text-text-muted focus:outline-none focus:border-accent"
                        >
                          {columns.map((c) => (
                            <option key={c.key} value={c.key}>
                              Move to {c.title}
                            </option>
                          ))}
                        </select>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200 overflow-y-auto">
          <div className="w-full max-w-lg rounded-2xl bg-[#0c0d14] border border-white/10 p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/20 text-accent font-bold text-base">
                  {selectedApp.company[0]}
                </div>
                <div>
                  <h3 className="font-bold text-text-primary text-base">{selectedApp.company}</h3>
                  <p className="text-xs text-text-muted">{selectedApp.role} • {selectedApp.ctc}</p>
                </div>
              </div>
              <button onClick={() => setSelectedApp(null)} className="text-text-muted hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-surface/50 border border-white/5">
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
                <p className="p-3 rounded-xl bg-base border border-white/10 text-text-secondary leading-relaxed">
                  {selectedApp.prepNotes || 'No specific prep notes added.'}
                </p>
              </div>

              <div className="space-y-2">
                <span className="font-semibold text-text-primary block">Past Interview Questions</span>
                <div className="space-y-1.5">
                  {selectedApp.pastQuestions?.map((q, idx) => (
                    <div key={idx} className="p-2.5 rounded-lg bg-surface/60 border border-white/5 text-text-secondary flex items-center justify-between">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200 overflow-y-auto">
          <div className="w-full max-w-lg rounded-2xl bg-[#0c0d14] border border-white/10 p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="font-bold text-text-primary text-base">Add Placement Application</h3>
              <button onClick={() => setShowAddModal(false)} className="text-text-muted hover:text-white">
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
                  className="w-full bg-base border border-white/15 rounded-lg px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-accent"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs text-text-secondary block">Role Title</label>
                  <input
                    type="text"
                    value={newApp.role}
                    onChange={(e) => setNewApp({ ...newApp, role: e.target.value })}
                    className="w-full bg-base border border-white/15 rounded-lg px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-accent"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-text-secondary block">CTC / Stipend</label>
                  <input
                    type="text"
                    value={newApp.ctc}
                    onChange={(e) => setNewApp({ ...newApp, ctc: e.target.value })}
                    className="w-full bg-base border border-white/15 rounded-lg px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-accent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs text-text-secondary block">Status</label>
                  <select
                    value={newApp.status}
                    onChange={(e) => setNewApp({ ...newApp, status: e.target.value })}
                    className="w-full bg-base border border-white/15 rounded-lg px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-accent"
                  >
                    {columns.map((c) => (
                      <option key={c.key} value={c.key}>
                        {c.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-text-secondary block">OA Date</label>
                  <input
                    type="text"
                    placeholder="e.g. Aug 10, 2026"
                    value={newApp.oaDate}
                    onChange={(e) => setNewApp({ ...newApp, oaDate: e.target.value })}
                    className="w-full bg-base border border-white/15 rounded-lg px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-accent"
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
                  className="w-full bg-base border border-white/15 rounded-lg p-3 text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent resize-none"
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
