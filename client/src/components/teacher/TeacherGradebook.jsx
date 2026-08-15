import { useState, useEffect } from 'react'
import {
  Award, CheckCircle2, XCircle, AlertTriangle, ShieldAlert,
  Clock, Eye, FileCode, Check, X, Sparkles, UserCheck, Search,
  ArrowLeft, Download, ShieldCheck
} from 'lucide-react'
import { subscribeAssignmentSubmissions } from '@/services/teacherService'
import { cn } from '@/lib/utils'

export default function TeacherGradebook({ assignment, onBack }) {
  const [submissions, setSubmissions] = useState([])
  const [selectedSub, setSelectedSub] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    if (!assignment?.id) return
    const unsub = subscribeAssignmentSubmissions(assignment.id, (data) => {
      setSubmissions(data)
    })
    return unsub
  }, [assignment?.id])

  const filtered = submissions.filter(s =>
    (s.studentName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.studentRollNumber || '').toLowerCase().includes(searchTerm.toLowerCase())
  )

  const avgScore = submissions.length > 0
    ? Math.round(submissions.reduce((acc, s) => acc + (s.finalScore || 0), 0) / submissions.length)
    : 0

  const flaggedCount = submissions.filter(s => s.antiCheatAudit?.isFlagged || (s.antiCheatAudit?.integrityScore || 100) < 70).length

  return (
    <div className="space-y-4">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-card border border-border-subtle shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-xl bg-surface hover:bg-hover border border-border-subtle text-text-muted hover:text-text-primary"
            title="Back to assignments"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-text-primary">{assignment?.title} — Live Gradebook</h2>
              <span className="px-2 py-0.5 rounded bg-accent/20 text-accent text-[10px] font-mono font-bold">
                {assignment?.difficulty}
              </span>
            </div>
            <p className="text-xs text-text-muted">
              Auto-graded test cases, execution timings, and real-time anti-cheat audit logs.
            </p>
          </div>
        </div>

        {/* Stats summary */}
        <div className="flex items-center gap-3 text-xs">
          <div className="px-3 py-1.5 rounded-xl bg-surface border border-border-subtle">
            <span className="text-text-muted text-[10px] block">Submissions:</span>
            <span className="font-bold text-text-primary">{submissions.length} Students</span>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-surface border border-border-subtle">
            <span className="text-text-muted text-[10px] block">Class Average:</span>
            <span className="font-bold text-accent">{avgScore}%</span>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-surface border border-border-subtle">
            <span className="text-text-muted text-[10px] block">Flagged Cheats:</span>
            <span className={cn("font-bold", flaggedCount > 0 ? "text-semantic-red" : "text-semantic-green")}>
              {flaggedCount} Flagged
            </span>
          </div>
        </div>
      </div>

      {/* Submissions Table / Cards */}
      <div className="rounded-2xl border border-border-subtle bg-card overflow-hidden shadow-sm">
        <div className="p-3 border-b border-border-subtle bg-surface/50 flex items-center justify-between gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="h-3.5 w-3.5 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search student or roll number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-base border border-border-subtle rounded-xl pl-9 pr-3 py-1.5 text-xs text-text-primary focus:outline-none focus:border-accent"
            />
          </div>
        </div>

        <div className="divide-y divide-border-subtle">
          {filtered.map((sub) => {
            const isFlagged = sub.antiCheatAudit?.isFlagged || (sub.antiCheatAudit?.integrityScore || 100) < 70
            return (
              <div
                key={sub.studentUid || sub.id}
                onClick={() => setSelectedSub(sub)}
                className="p-4 hover:bg-surface/60 transition-colors flex items-center justify-between gap-4 cursor-pointer text-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-accent/20 text-accent flex items-center justify-center font-bold text-xs">
                    {sub.studentName?.charAt(0) || 'S'}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-text-primary">{sub.studentName || 'Student'}</span>
                      {sub.studentRollNumber && (
                        <span className="px-1.5 py-0.2 rounded bg-base text-text-muted text-[10px] font-mono border border-border-subtle">
                          {sub.studentRollNumber}
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-text-muted font-mono">
                      Language: {sub.language} • {new Date(sub.submittedAt?.toDate?.() || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>

                {/* Score & Anti-Cheat Badges */}
                <div className="flex items-center gap-4">
                  {/* Test Cases Pass Fraction */}
                  <span className="text-[11px] font-mono text-text-secondary hidden sm:inline">
                    {sub.totalPassedTests || 0} / {sub.totalTestCases || 0} Cases Passed
                  </span>

                  {/* Anti-Cheat Status */}
                  <div className="flex items-center gap-1.5">
                    {isFlagged ? (
                      <span className="px-2 py-0.5 rounded bg-semantic-red/15 text-semantic-red text-[10px] font-bold border border-semantic-red/30 flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" /> Flagged ({sub.antiCheatAudit?.tabSwitchesCount || 0} Blurs)
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded bg-semantic-green/15 text-semantic-green text-[10px] font-bold border border-semantic-green/30 flex items-center gap-1">
                        <ShieldCheck className="h-3 w-3" /> Clean ({sub.antiCheatAudit?.integrityScore || 100}%)
                      </span>
                    )}
                  </div>

                  {/* Final Score */}
                  <div className="text-right min-w-[60px]">
                    <span className="font-mono font-black text-sm text-accent">
                      {sub.finalScore || sub.rawScore || 0} / {sub.maxScore || 100}
                    </span>
                    <span className="text-[10px] text-text-muted block">({sub.percentage || 0}%)</span>
                  </div>

                  <button className="p-1 text-text-muted hover:text-accent">
                    <Eye className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )
          })}

          {filtered.length === 0 && (
            <div className="p-8 text-center text-xs text-text-muted">
              No submissions recorded yet for this assignment.
            </div>
          )}
        </div>
      </div>

      {/* Detailed Submission Modal with Code & Anti-Cheat Audit */}
      {selectedSub && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-in fade-in">
          <div className="w-full max-w-3xl bg-card border border-border-subtle rounded-3xl p-6 shadow-2xl space-y-5 text-text-primary max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-border-subtle shrink-0">
              <div>
                <h3 className="font-bold text-base text-text-primary">
                  {selectedSub.studentName} — Evaluation Details
                </h3>
                <p className="text-xs text-text-muted font-mono">
                  Roll No: {selectedSub.studentRollNumber || 'N/A'} • Submitted in {selectedSub.language}
                </p>
              </div>
              <button onClick={() => setSelectedSub(null)} className="text-text-muted hover:text-text-primary">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 pr-1 text-xs">
              {/* Anti-Cheat Audit Summary Banner */}
              <div className={cn(
                "p-3.5 rounded-2xl border flex items-center justify-between gap-3",
                selectedSub.antiCheatAudit?.isFlagged || (selectedSub.antiCheatAudit?.integrityScore || 100) < 70
                  ? "bg-semantic-red/10 border-semantic-red/30 text-semantic-red"
                  : "bg-surface border-border-subtle text-text-primary"
              )}>
                <div className="flex items-center gap-3">
                  <ShieldAlert className="h-6 w-6 text-accent shrink-0" />
                  <div>
                    <span className="font-bold block">Anti-Cheat Audit Log</span>
                    <span className="text-[11px] opacity-80">
                      Tab switches: {selectedSub.antiCheatAudit?.tabSwitchesCount || 0} • Clipboard blocked attempts: {selectedSub.antiCheatAudit?.clipboardViolationsCount || 0}
                    </span>
                  </div>
                </div>
                <span className="font-mono font-black text-sm text-accent">
                  {selectedSub.antiCheatAudit?.integrityScore || 100}% Integrity
                </span>
              </div>

              {/* Source Code Container */}
              <div className="space-y-1.5">
                <span className="font-bold text-text-primary block flex items-center gap-1.5">
                  <FileCode className="h-4 w-4 text-accent" /> Submitted Code ({selectedSub.language})
                </span>
                <pre className="p-3.5 rounded-2xl bg-base border border-border-subtle font-mono text-xs text-cyan-400 overflow-x-auto whitespace-pre leading-relaxed shadow-inner">
                  {selectedSub.sourceCode}
                </pre>
              </div>

              {/* Test Case Execution Breakdown */}
              <div className="space-y-2">
                <span className="font-bold text-text-primary block">Test Case Verification Breakdown</span>
                <div className="space-y-2">
                  {(selectedSub.testCaseResults || []).map((tc, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-surface border border-border-subtle space-y-1 text-[11px]">
                      <div className="flex items-center justify-between font-bold">
                        <span className="flex items-center gap-2">
                          {tc.status === 'PASSED' ? (
                            <CheckCircle2 className="h-3.5 w-3.5 text-semantic-green" />
                          ) : (
                            <XCircle className="h-3.5 w-3.5 text-semantic-red" />
                          )}
                          <span>{tc.title || `Test Case ${idx + 1}`} {tc.isHidden && '(Hidden)'}</span>
                        </span>
                        <span className={cn(
                          "font-mono",
                          tc.status === 'PASSED' ? "text-semantic-green" : "text-semantic-red"
                        )}>
                          {tc.status} • {tc.pointsEarned || 0}/{tc.maxPoints || 0} pts
                        </span>
                      </div>
                      <div className="text-text-muted font-mono text-[10px]">
                        Execution Time: {tc.executionTimeMs || 0}ms
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-border-subtle flex items-center justify-between text-xs shrink-0">
              <span className="font-mono font-bold text-accent text-sm">
                Final Grade: {selectedSub.finalScore || 0} / {selectedSub.maxScore || 100} ({selectedSub.percentage || 0}%)
              </span>
              <button
                onClick={() => setSelectedSub(null)}
                className="px-5 py-2 rounded-xl bg-accent hover:bg-accent-light text-white font-bold transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
