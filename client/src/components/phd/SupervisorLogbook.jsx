import { useState } from 'react'
import {
  FileText, Calendar, Plus, CheckCircle2, Clock, MessageSquare, Send, Award, Sparkles
} from 'lucide-react'

export default function SupervisorLogbook() {
  const [meetingLogs, setMeetingLogs] = useState([
    {
      id: '1',
      date: 'Jul 24, 2026',
      advisor: 'Prof. V. K. Sharma',
      topic: 'Reinforcement Learning Graph Partitioning Benchmark',
      actionItems: ['Run 100-node cluster experiment', 'Compare execution time against METIS baseline', 'Draft IEEE TPDS Section 4'],
      advisorFeedback: 'Good progress on graph heuristics. Focus on proving convergence bound for section 4.'
    },
    {
      id: '2',
      date: 'Jul 10, 2026',
      advisor: 'Prof. V. K. Sharma',
      topic: 'Literature Review on eBPF Kernel Tracing',
      actionItems: ['Survey SIGCOMM 2024-2025 papers', 'Formulate formal fault injection threat model'],
      advisorFeedback: 'Literature review is thorough. Ready to begin prototype implementation.'
    }
  ])

  const [showLogModal, setShowLogModal] = useState(false)
  const [newLog, setNewLog] = useState({
    date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    advisor: 'Prof. V. K. Sharma',
    topic: '',
    actionItemsText: '',
    advisorFeedback: ''
  })

  const handleAddLog = (e) => {
    e.preventDefault()
    if (!newLog.topic.trim()) return
    const logToAdd = {
      id: String(Date.now()),
      date: newLog.date,
      advisor: newLog.advisor,
      topic: newLog.topic.trim(),
      actionItems: newLog.actionItemsText.split('\n').filter((item) => item.trim().length > 0),
      advisorFeedback: newLog.advisorFeedback.trim() || 'Action items reviewed and approved.'
    }
    setMeetingLogs((prev) => [logToAdd, ...prev])
    setShowLogModal(false)
  }

  return (
    <div className="p-5 rounded-2xl bg-surface/40 border border-white/10 space-y-5 shadow-lg">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-bold text-text-primary text-base flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-accent" />
            Supervisor-Scholar Logbook & Advisor Syncs
          </h3>
          <p className="text-xs text-text-muted">Timestamped record of advisor meetings, action items, and progress reviews.</p>
        </div>

        <button
          onClick={() => setShowLogModal(true)}
          className="px-4 py-2 rounded-xl bg-accent text-white font-semibold text-xs hover:bg-accent-light transition-colors flex items-center gap-2 shadow-md shadow-accent/20 shrink-0"
        >
          <Plus className="h-4 w-4" />
          <span>Log Advisor Meeting</span>
        </button>
      </div>

      {/* Meeting Logs List */}
      <div className="space-y-4">
        {meetingLogs.map((log) => (
          <div key={log.id} className="p-5 rounded-xl bg-base/60 border border-white/10 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-accent/20 text-accent font-bold text-[10px]">
                  {log.advisor}
                </span>
                <h4 className="font-bold text-text-primary text-sm">{log.topic}</h4>
              </div>
              <span className="text-xs text-text-muted font-mono">{log.date}</span>
            </div>

            <div className="space-y-1.5">
              <span className="text-xs font-semibold text-text-primary block">Action Items Assigned:</span>
              <div className="space-y-1 pl-2">
                {log.actionItems.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs text-text-secondary">
                    <CheckCircle2 className="h-3.5 w-3.5 text-semantic-green shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-3 rounded-lg bg-surface/50 border border-white/5 space-y-1 text-xs">
              <span className="font-semibold text-accent block">Advisor Feedback & Remarks:</span>
              <p className="text-text-secondary leading-relaxed">{log.advisorFeedback}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Add Log Modal */}
      {showLogModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-2xl bg-[#0c0d14] border border-white/10 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h4 className="font-bold text-text-primary text-base">Log Advisor Sync Meeting</h4>
              <button onClick={() => setShowLogModal(false)} className="text-text-muted hover:text-white">✕</button>
            </div>

            <form onSubmit={handleAddLog} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs text-text-secondary block">Meeting Topic / Research Agenda *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Graph Partitioning Benchmark Results"
                  value={newLog.topic}
                  onChange={(e) => setNewLog({ ...newLog, topic: e.target.value })}
                  className="w-full bg-base border border-white/15 rounded-lg px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-accent"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-text-secondary block">Action Items (One per line)</label>
                <textarea
                  rows={3}
                  placeholder="Run 100-node cluster experiment&#10;Draft IEEE TPDS Section 4"
                  value={newLog.actionItemsText}
                  onChange={(e) => setNewLog({ ...newLog, actionItemsText: e.target.value })}
                  className="w-full bg-base border border-white/15 rounded-lg p-3 text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent resize-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-text-secondary block">Advisor Feedback / Guidance</label>
                <textarea
                  rows={2}
                  placeholder="Enter remarks or directions given by advisor..."
                  value={newLog.advisorFeedback}
                  onChange={(e) => setNewLog({ ...newLog, advisorFeedback: e.target.value })}
                  className="w-full bg-base border border-white/15 rounded-lg p-3 text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-accent text-white font-semibold text-xs hover:bg-accent-light transition-colors flex items-center justify-center gap-2"
              >
                <Send className="h-4 w-4" />
                <span>Save Logbook Entry</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
