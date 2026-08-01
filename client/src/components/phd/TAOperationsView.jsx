import { useState } from 'react'
import {
  Users, Calendar, Clock, CheckCircle2, AlertCircle, Plus, Send, ShieldCheck
} from 'lucide-react'

export default function TAOperationsView() {
  const [taLogs, setTaLogs] = useState([
    { id: '1', date: 'Jul 28, 2026', batch: 'UG CSE Sec 2A', activity: 'Data Structures Lab Proctoring', hours: 3, status: 'Approved' },
    { id: '2', date: 'Jul 30, 2026', batch: 'UG CSE Sec 2B', activity: 'Mid-Term Exam Invigilation', hours: 4, status: 'Approved' },
    { id: '3', date: 'Aug 01, 2026', batch: 'UG CSE Sec 2A', activity: 'Grading Assignment #3 Scripts', hours: 2.5, status: 'Pending Review' }
  ])

  const [invigilationDuties] = useState([
    { code: 'EXAM-301', course: 'UG CS301 End-Term Exam', date: 'Aug 12, 2026', time: '09:30 - 12:30 PM', room: 'Hall B-201', role: 'Chief Invigilator' },
    { code: 'LAB-EVAL', course: 'UG OS Practical Evaluation', date: 'Aug 15, 2026', time: '02:00 - 05:00 PM', room: 'Linux Lab 4', role: 'Lab Examiner' }
  ])

  const [showLogModal, setShowLogModal] = useState(false)
  const [logForm, setLogForm] = useState({
    batch: 'UG CSE Sec 2A',
    activity: 'Lab Proctoring & Code Evaluation',
    hours: 3,
    date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  })

  const handleAddTALog = (e) => {
    e.preventDefault()
    if (!logForm.activity.trim()) return
    const newLog = {
      ...logForm,
      id: String(Date.now()),
      status: 'Pending Review'
    }
    setTaLogs((prev) => [newLog, ...prev])
    setShowLogModal(false)
  }

  const totalHours = taLogs.reduce((acc, l) => acc + (Number(l.hours) || 0), 0)

  return (
    <div className="p-5 rounded-2xl bg-surface/40 border border-white/10 space-y-5 shadow-lg">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-bold text-text-primary text-base flex items-center gap-2">
            <Users className="h-5 w-5 text-semantic-green" />
            Teaching Assistant (TA) Operations & Duty Hub
          </h3>
          <p className="text-xs text-text-muted">Track undergraduate lab batches, invigilation duties, and submit TA hours logs.</p>
        </div>

        <button
          onClick={() => setShowLogModal(true)}
          className="px-4 py-2 rounded-xl bg-semantic-green text-white font-semibold text-xs hover:bg-emerald-600 transition-colors flex items-center gap-2 shadow-md shadow-semantic-green/20 shrink-0"
        >
          <Plus className="h-4 w-4" />
          <span>Submit TA Hours Log</span>
        </button>
      </div>

      {/* TA Duty Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-base/60 border border-white/10 space-y-1">
          <span className="text-text-muted text-[11px]">Logged TA Hours This Term</span>
          <p className="text-xl font-bold text-semantic-green">{totalHours} Hours</p>
        </div>
        <div className="p-4 rounded-xl bg-base/60 border border-white/10 space-y-1">
          <span className="text-text-muted text-[11px]">Assigned UG Lab Batches</span>
          <p className="text-xl font-bold text-text-primary">2 Batches (Sec 2A & 2B)</p>
        </div>
        <div className="p-4 rounded-xl bg-base/60 border border-white/10 space-y-1">
          <span className="text-text-muted text-[11px]">Upcoming Invigilation Duties</span>
          <p className="text-xl font-bold text-accent">{invigilationDuties.length} Exams</p>
        </div>
      </div>

      {/* Invigilation Schedule Grid */}
      <div className="space-y-3">
        <h4 className="text-xs font-semibold text-text-primary flex items-center gap-2">
          <Calendar className="h-4 w-4 text-accent" /> Assigned Invigilation & Proctoring Schedule
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {invigilationDuties.map((d, idx) => (
            <div key={idx} className="p-4 rounded-xl bg-surface/50 border border-white/10 flex items-center justify-between">
              <div>
                <span className="px-2 py-0.5 rounded bg-white/10 text-[10px] font-mono text-text-muted">{d.code}</span>
                <h5 className="font-semibold text-text-primary text-xs mt-1">{d.course}</h5>
                <p className="text-[11px] text-text-muted mt-0.5">{d.date} • {d.time} ({d.room})</p>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-accent/15 text-accent text-[10px] font-bold border border-accent/30">
                {d.role}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* TA Hours Submission Log Table */}
      <div className="space-y-3">
        <h4 className="text-xs font-semibold text-text-primary flex items-center gap-2">
          <Clock className="h-4 w-4 text-semantic-green" /> Submitted TA Work Logs
        </h4>
        <div className="overflow-x-auto rounded-xl border border-white/10">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-surface/80 text-text-muted border-b border-white/10 font-semibold">
                <th className="p-3">Date</th>
                <th className="p-3">Batch / Course</th>
                <th className="p-3">Duty Activity Description</th>
                <th className="p-3 text-center">Hours</th>
                <th className="p-3 text-center">Faculty Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {taLogs.map((l) => (
                <tr key={l.id} className="hover:bg-surface/50 transition-colors">
                  <td className="p-3 font-mono text-text-muted">{l.date}</td>
                  <td className="p-3 font-semibold text-text-primary">{l.batch}</td>
                  <td className="p-3 text-text-secondary">{l.activity}</td>
                  <td className="p-3 text-center font-bold text-semantic-green">{l.hours}h</td>
                  <td className="p-3 text-center">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                        l.status === 'Approved'
                          ? 'bg-semantic-green/15 text-semantic-green border-semantic-green/30'
                          : 'bg-yellow-500/15 text-yellow-300 border-yellow-500/30'
                      }`}
                    >
                      {l.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Submit TA Log Modal */}
      {showLogModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-2xl bg-[#0c0d14] border border-white/10 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h4 className="font-bold text-text-primary text-base">Submit TA Duty Hours Log</h4>
              <button onClick={() => setShowLogModal(false)} className="text-text-muted hover:text-white">✕</button>
            </div>

            <form onSubmit={handleAddTALog} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs text-text-secondary block">Assigned Batch</label>
                <input
                  type="text"
                  value={logForm.batch}
                  onChange={(e) => setLogForm({ ...logForm, batch: e.target.value })}
                  className="w-full bg-base border border-white/15 rounded-lg px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-semantic-green"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-text-secondary block">Duty Activity Description *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Lab proctoring, assignment grading, tutorial class..."
                  value={logForm.activity}
                  onChange={(e) => setLogForm({ ...logForm, activity: e.target.value })}
                  className="w-full bg-base border border-white/15 rounded-lg px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-semantic-green"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs text-text-secondary block">Hours Completed</label>
                  <input
                    type="number"
                    step="0.5"
                    value={logForm.hours}
                    onChange={(e) => setLogForm({ ...logForm, hours: Number(e.target.value) })}
                    className="w-full bg-base border border-white/15 rounded-lg px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-semantic-green"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-text-secondary block">Date</label>
                  <input
                    type="text"
                    value={logForm.date}
                    onChange={(e) => setLogForm({ ...logForm, date: e.target.value })}
                    className="w-full bg-base border border-white/15 rounded-lg px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-semantic-green"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-semantic-green text-white font-semibold text-xs hover:bg-emerald-600 transition-colors flex items-center justify-center gap-2"
              >
                <Send className="h-4 w-4" />
                <span>Submit Work Log for Verification</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
