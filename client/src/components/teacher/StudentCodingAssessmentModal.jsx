import { useState, useEffect, useRef } from 'react'
import {
  Code2, Play, Send, ShieldAlert, AlertTriangle, CheckCircle2,
  XCircle, Clock, Lock, Terminal, X, Sparkles, Check, ChevronRight
} from 'lucide-react'
import { saveAssignmentSubmission } from '@/services/teacherService'
import { useToast } from '@/components/ui/toast'
import { cn } from '@/lib/utils'

export default function StudentCodingAssessmentModal({ user, assignment, onClose, onSubmitted }) {
  const { confirm } = useToast()
  const allowedLangs = assignment?.allowedLanguages || ['python', 'java', 'cpp']
  const [selectedLanguage, setSelectedLanguage] = useState(allowedLangs[0] || 'python')
  const [code, setCode] = useState(assignment?.boilerplates?.[selectedLanguage] || 'def solution():\n    pass')
  const [activeTab, setActiveTab] = useState('problem') // 'problem' | 'output'

  // Evaluation & Execution state
  const [isRunningSample, setIsRunningSample] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [sampleResults, setSampleResults] = useState(null)
  const [finalScoreResult, setFinalScoreResult] = useState(null)

  // Anti-Cheat tracking state
  const [tabSwitches, setTabSwitches] = useState(0)
  const [clipboardViolations, setClipboardViolations] = useState(0)
  const [antiCheatEvents, setAntiCheatEvents] = useState([])
  const [warningMessage, setWarningMessage] = useState('')
  const maxAllowedSwitches = assignment?.antiCheat?.maxTabSwitches || 3

  // Synchronize boilerplate on language change
  const handleLanguageChange = (newLang) => {
    setSelectedLanguage(newLang)
    if (assignment?.boilerplates?.[newLang]) {
      setCode(assignment.boilerplates[newLang])
    }
  }

  // Anti-Cheat Event Listeners Hook
  useEffect(() => {
    if (!assignment?.antiCheat) return

    const handleBlur = () => {
      if (!assignment.antiCheat.trackFocusLoss) return
      setTabSwitches((prev) => {
        const next = prev + 1
        const newEvent = {
          eventType: 'TAB_SWITCH',
          timestamp: new Date().toISOString(),
          details: `Window blurred (Tab switch #${next})`
        }
        setAntiCheatEvents((evts) => [...evts, newEvent])
        setWarningMessage(`⚠️ Anti-Cheat Warning: Focus loss detected (${next}/${maxAllowedSwitches} allowed).`)

        // Auto submit if threshold exceeded and policy is enabled
        if (assignment.antiCheat.autoSubmitOnViolations && next >= maxAllowedSwitches) {
          setTimeout(() => {
            handleFinalSubmit(true)
          }, 1000)
        }
        return next
      })
    }

    const handleCopy = (e) => {
      if (assignment.antiCheat.blockClipboard) {
        e.preventDefault()
        setClipboardViolations((prev) => prev + 1)
        setAntiCheatEvents((evts) => [...evts, {
          eventType: 'COPY_ATTEMPT',
          timestamp: new Date().toISOString(),
          details: 'Clipboard copy attempt blocked.'
        }])
        setWarningMessage('⚠️ Clipboard actions are strictly disabled for this assessment.')
      }
    }

    const handlePaste = (e) => {
      if (assignment.antiCheat.blockClipboard) {
        e.preventDefault()
        setClipboardViolations((prev) => prev + 1)
        setAntiCheatEvents((evts) => [...evts, {
          eventType: 'PASTE_ATTEMPT',
          timestamp: new Date().toISOString(),
          details: 'Clipboard paste attempt blocked.'
        }])
        setWarningMessage('⚠️ Clipboard paste is strictly blocked by the instructor.')
      }
    }

    const handleContextMenu = (e) => {
      if (assignment.antiCheat.blockRightClick) {
        e.preventDefault()
        setWarningMessage('⚠️ Context menu / inspect actions are disabled during test.')
      }
    }

    window.addEventListener('blur', handleBlur)
    document.addEventListener('copy', handleCopy)
    document.addEventListener('paste', handlePaste)
    document.addEventListener('contextmenu', handleContextMenu)

    return () => {
      window.removeEventListener('blur', handleBlur)
      document.removeEventListener('copy', handleCopy)
      document.removeEventListener('paste', handlePaste)
      document.removeEventListener('contextmenu', handleContextMenu)
    }
  }, [assignment?.antiCheat, maxAllowedSwitches])

  // Run Sample Test Cases Only
  const handleRunSample = async () => {
    setIsRunningSample(true)
    setActiveTab('output')
    const sampleCases = (assignment?.testCases || []).filter(t => !t.isHidden)

    try {
      const resp = await fetch('/api/assessments/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          language: selectedLanguage,
          sourceCode: code,
          testCases: sampleCases,
          timeLimitSeconds: assignment?.executionLimits?.timeLimitSeconds || 2.0
        })
      })
      const data = await resp.json()
      setSampleResults(data)
    } catch (err) {
      alert('Error running sample cases: ' + err.message)
    } finally {
      setIsRunningSample(false)
    }
  }

  // Final Submission against All Test Cases (Including Hidden)
  const handleFinalSubmit = async (forcedByViolation = false) => {
    if (!forcedByViolation) {
      const ok = await confirm('Your code will be evaluated against all test cases including hidden ones. This cannot be undone.', {
        title: 'Submit Final Code?',
        confirmLabel: 'Submit for Grading',
        destructive: false
      })
      if (!ok) return
    }

    setIsSubmitting(true)
    try {
      const allCases = assignment?.testCases || []
      const resp = await fetch('/api/assessments/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          language: selectedLanguage,
          sourceCode: code,
          testCases: allCases,
          timeLimitSeconds: assignment?.executionLimits?.timeLimitSeconds || 2.0
        })
      })
      const evalData = await resp.json()

      // Calculate Integrity Score (Deduct 10 pts per tab switch & 5 pts per blocked clipboard)
      const deductions = (tabSwitches * 10) + (clipboardViolations * 5)
      const integrityScore = Math.max(0, 100 - deductions)
      const isFlagged = tabSwitches >= maxAllowedSwitches || deductions >= 30

      const submissionPayload = {
        studentName: user?.displayName || 'Student',
        studentRollNumber: user?.rollNumber || '',
        language: selectedLanguage,
        sourceCode: code,
        testCaseResults: evalData.testCaseResults || [],
        totalPassedTests: evalData.totalPassedTests || 0,
        totalTestCases: evalData.totalTestCases || 0,
        rawScore: evalData.rawScore || 0,
        maxScore: evalData.maxScore || 100,
        finalScore: evalData.rawScore || 0,
        percentage: evalData.percentage || 0,
        antiCheatAudit: {
          tabSwitchesCount: tabSwitches,
          clipboardViolationsCount: clipboardViolations,
          integrityScore,
          isFlagged,
          events: antiCheatEvents
        },
        gradingStatus: 'GRADED'
      }

      await saveAssignmentSubmission(assignment.id, user.uid, submissionPayload)
      setFinalScoreResult(submissionPayload)
      if (onSubmitted) onSubmitted(submissionPayload)
    } catch (err) {
      alert('Error submitting assessment: ' + err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-base text-text-primary animate-in fade-in select-none">
      {/* Top Navigation Bar */}
      <div className="px-6 py-3 border-b border-border-subtle bg-surface/90 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-accent/20 text-accent flex items-center justify-center font-bold">
            <Code2 className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-sm text-text-primary">{assignment?.title}</h2>
              <span className="px-2 py-0.5 rounded bg-accent/15 text-accent text-[10px] font-mono font-bold">
                {assignment?.difficulty} • {assignment?.totalPoints || 100} PTS
              </span>
            </div>
            <span className="text-[11px] text-text-muted">
              Course: <span className="font-bold text-text-primary">{assignment?.courseCode}</span> • Due {new Date(assignment?.dueDate).toLocaleDateString()}
            </span>
          </div>
        </div>

        {/* Anti-Cheat Status & Actions */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-base px-3 py-1 rounded-xl border border-border-subtle text-xs">
            <ShieldAlert className={cn(
              "h-4 w-4",
              tabSwitches >= maxAllowedSwitches ? "text-semantic-red animate-pulse" : "text-semantic-green"
            )} />
            <span className="text-text-muted text-[11px]">Anti-Cheat Active:</span>
            <span className={cn(
              "font-mono font-bold text-[11px]",
              tabSwitches >= maxAllowedSwitches ? "text-semantic-red" : "text-text-primary"
            )}>
              {tabSwitches} / {maxAllowedSwitches} Blurs
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-hover text-text-muted hover:text-text-primary"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Anti-Cheat Warning Toast */}
      {warningMessage && (
        <div className="bg-semantic-red/15 border-b border-semantic-red/30 px-6 py-2 text-semantic-red text-xs font-bold flex items-center justify-between">
          <span className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            {warningMessage}
          </span>
          <button onClick={() => setWarningMessage('')} className="hover:underline text-[11px]">
            Dismiss
          </button>
        </div>
      )}

      {/* Main Split-Pane Workspace */}
      <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-12">
        {/* Left Side: Problem Statement & Sample Cases (5 cols) */}
        <div className="lg:col-span-5 border-r border-border-subtle flex flex-col h-full bg-surface/30 overflow-hidden">
          <div className="p-4 border-b border-border-subtle bg-surface/60 flex items-center justify-between">
            <span className="font-bold text-xs text-text-primary flex items-center gap-1.5">
              <Terminal className="h-4 w-4 text-accent" /> Problem Specification
            </span>
            <span className="text-[10px] text-text-muted font-mono">
              Time Limit: {assignment?.executionLimits?.timeLimitSeconds || 2}s
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
            <div className="prose dark:prose-invert max-w-none text-text-secondary leading-relaxed whitespace-pre-wrap font-sans text-xs">
              {assignment?.problemStatement}
            </div>

            {/* Visible Sample Test Cases */}
            <div className="space-y-3 pt-3 border-t border-border-subtle">
              <span className="font-bold text-text-primary block">Sample Test Cases</span>
              {(assignment?.testCases || []).filter(t => !t.isHidden).map((tc, idx) => (
                <div key={tc.id || idx} className="p-3.5 rounded-xl bg-card border border-border-subtle space-y-2">
                  <div className="flex justify-between items-center text-[11px] font-bold">
                    <span className="text-accent">{tc.title || `Sample Case ${idx + 1}`}</span>
                    <span className="text-text-muted font-mono">{tc.weightagePoints || 20} pts</span>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] text-text-muted font-bold block">Input:</span>
                    <pre className="p-2 rounded bg-base border border-border-subtle font-mono text-[11px] text-text-primary">{tc.input}</pre>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] text-text-muted font-bold block">Expected Output:</span>
                    <pre className="p-2 rounded bg-base border border-border-subtle font-mono text-[11px] text-semantic-green">{tc.expectedOutput}</pre>
                  </div>

                  {tc.explanation && (
                    <p className="text-[11px] text-text-muted italic">{tc.explanation}</p>
                  )}
                </div>
              ))}

              {assignment?.testCases?.some(t => t.isHidden) && (
                <div className="mt-4 p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-500 dark:text-purple-400 text-[11px] font-bold flex items-center gap-2 shadow-sm">
                  <Lock className="h-4 w-4 shrink-0" />
                  <span>This assessment includes {assignment.testCases.filter(t => t.isHidden).length} hidden test cases used for final grading.</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Monaco / Code Editor & Sandbox Console (7 cols) */}
        <div className="lg:col-span-7 flex flex-col h-full bg-base overflow-hidden">
          {/* Editor Header / Language Selector */}
          <div className="p-3 border-b border-border-subtle bg-surface/60 flex items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-text-muted">Language:</span>
              <select
                value={selectedLanguage}
                onChange={(e) => handleLanguageChange(e.target.value)}
                className="bg-card border border-border-subtle rounded-lg px-2.5 py-1 text-xs font-mono font-bold text-accent focus:outline-none focus:border-accent"
              >
                {allowedLangs.map(l => (
                  <option key={l} value={l}>{l.toUpperCase()}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleRunSample}
                disabled={isRunningSample}
                className="px-3 py-1.5 rounded-xl bg-surface hover:bg-hover border border-border-subtle text-text-primary text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
              >
                <Play className="h-3.5 w-3.5 text-semantic-green fill-current" />
                <span>{isRunningSample ? 'Testing...' : 'Run Sample Cases'}</span>
              </button>

              <button
                onClick={() => handleFinalSubmit(false)}
                disabled={isSubmitting}
                className="px-4 py-1.5 rounded-xl bg-accent hover:bg-accent-light text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-accent/20 transition-all"
              >
                <Send className="h-3.5 w-3.5" />
                <span>{isSubmitting ? 'Evaluating...' : 'Final Submit'}</span>
              </button>
            </div>
          </div>

          {/* Code Textarea / IDE Workspace */}
          <div className="flex-1 flex flex-col min-h-0 overflow-hidden p-3 gap-3">
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Write your solution here..."
              className="flex-1 bg-card dark:bg-[#07080f] border border-border-subtle rounded-2xl p-4 font-mono text-xs text-text-primary focus:outline-none focus:border-accent resize-none leading-relaxed shadow-inner"
              style={{ tabSize: 4 }}
              onKeyDown={(e) => {
                if (e.key === 'Tab') {
                  e.preventDefault()
                  const start = e.target.selectionStart
                  const end = e.target.selectionEnd
                  const val = e.target.value
                  setCode(val.substring(0, start) + '    ' + val.substring(end))
                  setTimeout(() => {
                    e.target.selectionStart = e.target.selectionEnd = start + 4
                  }, 0)
                }
              }}
            />

            {/* Sandbox Evaluation Output Drawer */}
            <div className="h-44 border border-border-subtle bg-surface/80 rounded-2xl overflow-hidden flex flex-col shrink-0 shadow-sm">
              <div className="p-2 border-b border-border-subtle bg-surface flex items-center justify-between text-[11px] font-bold text-text-secondary">
                <span>EXECUTION CONSOLE & TEST RESULTS</span>
                {sampleResults && (
                  <span className="font-mono text-accent">
                    {sampleResults.totalPassedTests} / {sampleResults.totalTestCases} Samples Passed
                  </span>
                )}
              </div>

              <div className="p-3 overflow-y-auto flex-1 font-mono text-xs space-y-2">
                {sampleResults ? (
                  sampleResults.testCaseResults.map((res, idx) => (
                    <div key={idx} className="flex items-center justify-between text-[11px] p-2 rounded-lg bg-base border border-border-subtle">
                      <span className="flex items-center gap-2">
                        {res.status === 'PASSED' ? (
                          <CheckCircle2 className="h-3.5 w-3.5 text-semantic-green" />
                        ) : (
                          <XCircle className="h-3.5 w-3.5 text-semantic-red" />
                        )}
                        <span>{res.title}</span>
                      </span>
                      <span className={cn(
                        "font-bold",
                        res.status === 'PASSED' ? "text-semantic-green" : "text-semantic-red"
                      )}>
                        {res.status} ({res.executionTimeMs}ms)
                      </span>
                    </div>
                  ))
                ) : (
                  <span className="text-text-muted text-[11px]">
                    Click "Run Sample Cases" to compile and test code in the sandbox without affecting final score.
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Submission Success Dialog */}
      {finalScoreResult && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in">
          <div className="w-full max-w-md bg-card border border-border-subtle rounded-3xl p-6 shadow-2xl space-y-5 text-center text-text-primary animate-in zoom-in-95">
            <div className="h-16 w-16 rounded-full bg-semantic-green/20 text-semantic-green flex items-center justify-center mx-auto">
              <CheckCircle2 className="h-8 w-8" />
            </div>

            <div>
              <h3 className="text-lg font-black text-text-primary">Assessment Evaluated & Submitted!</h3>
              <p className="text-xs text-text-muted mt-1">Your code was evaluated against all visible and hidden test cases.</p>
            </div>

            <div className="p-4 rounded-2xl bg-surface border border-border-subtle space-y-2">
              <div className="text-2xl font-black font-mono text-accent">
                {finalScoreResult.finalScore} / {finalScoreResult.maxScore} PTS
              </div>
              <div className="text-xs text-text-secondary">
                {finalScoreResult.totalPassedTests} of {finalScoreResult.totalTestCases} test cases passed ({finalScoreResult.percentage}%)
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full py-2.5 rounded-xl bg-accent hover:bg-accent-light text-white font-bold text-xs shadow-lg shadow-accent/25 transition-all"
            >
              Return to Classroom
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
