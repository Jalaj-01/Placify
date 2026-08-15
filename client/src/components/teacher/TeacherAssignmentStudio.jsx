import { useState, useEffect } from 'react'
import {
  Code2, Plus, Calendar, ShieldCheck, Clock, CheckCircle2,
  Trash2, Eye, EyeOff, Save, Sparkles, Terminal, FileCode,
  AlertTriangle, Copy, X, Lock, CheckSquare, Settings
} from 'lucide-react'
import {
  subscribeCourseAssignments, createAssignment,
  updateAssignment, deleteAssignment
} from '@/services/teacherService'
import { cn } from '@/lib/utils'

const SUPPORTED_LANGUAGES = [
  { id: 'python', name: 'Python 3', defaultCode: 'def solution():\n    # Write your code here\n    pass' },
  { id: 'java', name: 'Java 17', defaultCode: 'import java.util.*;\n\npublic class Solution {\n    public static void main(String[] args) {\n        // Your code here\n    }\n}' },
  { id: 'cpp', name: 'C++ (g++)', defaultCode: '#include <iostream>\nusing namespace std;\n\nint main() {\n    // Your code here\n    return 0;\n}' },
  { id: 'c', name: 'C (gcc)', defaultCode: '#include <stdio.h>\n\nint main() {\n    // Your code here\n    return 0;\n}' },
  { id: 'javascript', name: 'JavaScript (Node)', defaultCode: 'function run() {\n    // Your code here\n}\nrun();' }
]

export default function TeacherAssignmentStudio({ user, course, onViewSubmissions }) {
  const [assignments, setAssignments] = useState([])
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedLangTab, setSelectedLangTab] = useState('python')

  const [form, setForm] = useState({
    title: '',
    problemStatement: '',
    difficulty: 'MEDIUM',
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
    allowLateSubmissions: true,
    latePenaltyPercentage: 10,
    allowedLanguages: ['python', 'java', 'cpp'],
    boilerplates: {
      python: 'def shortestPath(n, edges, src, dst):\n    # Return minimum distance\n    pass',
      java: 'import java.util.*;\n\npublic class Solution {\n    public int shortestPath(int n, int[][] edges, int src, int dst) {\n        return 0;\n    }\n}',
      cpp: '#include <vector>\nusing namespace std;\n\nclass Solution {\npublic:\n    int shortestPath(int n, vector<vector<int>>& edges, int src, int dst) {\n        return 0;\n    }\n};'
    },
    testCases: [
      {
        id: 'tc_1',
        title: 'Sample Case 1',
        input: '4\n4\n0 1 1\n1 2 2\n2 3 1\n0 2 4\n0\n3',
        expectedOutput: '4',
        explanation: 'Path 0 -> 1 -> 2 -> 3 has total weight 4',
        isHidden: false,
        weightagePoints: 20
      },
      {
        id: 'tc_2_hidden',
        title: 'Hidden Test 1 (Edge Cases)',
        input: '5\n1\n0 1 10\n0\n4',
        expectedOutput: '-1',
        explanation: '',
        isHidden: true,
        weightagePoints: 40
      },
      {
        id: 'tc_3_hidden',
        title: 'Hidden Test 2 (Large Graph)',
        input: '1000\n5000\n...',
        expectedOutput: '42',
        explanation: '',
        isHidden: true,
        weightagePoints: 40
      }
    ],
    antiCheat: {
      blockClipboard: true,
      blockRightClick: true,
      trackFocusLoss: true,
      maxTabSwitches: 3,
      autoSubmitOnViolations: false
    }
  })

  useEffect(() => {
    if (!course?.id) return
    const unsub = subscribeCourseAssignments(course.id, (data) => {
      setAssignments(data)
    })
    return unsub
  }, [course?.id])

  const handleToggleLang = (langId) => {
    const current = form.allowedLanguages
    if (current.includes(langId)) {
      if (current.length === 1) return // Keep at least 1 language
      setForm({ ...form, allowedLanguages: current.filter(l => l !== langId) })
    } else {
      setForm({ ...form, allowedLanguages: [...current, langId] })
    }
  }

  const handleAddTestCase = (isHidden = false) => {
    const newTc = {
      id: `tc_${Date.now()}`,
      title: isHidden ? `Hidden Test ${form.testCases.filter(t => t.isHidden).length + 1}` : `Sample Case ${form.testCases.filter(t => !t.isHidden).length + 1}`,
      input: '',
      expectedOutput: '',
      explanation: '',
      isHidden,
      weightagePoints: isHidden ? 30 : 20
    }
    setForm({ ...form, testCases: [...form.testCases, newTc] })
  }

  const handleRemoveTestCase = (tcId) => {
    setForm({ ...form, testCases: form.testCases.filter(t => t.id !== tcId) })
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!form.title.trim() || !form.problemStatement.trim()) return

    const totalPts = form.testCases.reduce((sum, t) => sum + (Number(t.weightagePoints) || 0), 0)

    try {
      await createAssignment({
        ...form,
        courseId: course.id,
        courseCode: course.courseCode,
        instructorUid: user.uid,
        instructorName: user.displayName || 'Instructor',
        totalPoints: totalPts || 100
      })
      setShowCreateModal(false)
    } catch (err) {
      alert('Error creating assignment: ' + err.message)
    }
  }

  return (
    <div className="space-y-4">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-card border border-border-subtle shadow-sm">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-accent/20 text-accent flex items-center justify-center font-bold">
            <Code2 className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-text-primary">Automated Coding Assessments & IDE Sandbox</h2>
            <p className="text-xs text-text-muted">Configure starter boilerplate, hidden test cases, anti-cheat limits, and auto-grading.</p>
          </div>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-3.5 py-2 rounded-xl bg-accent hover:bg-accent-light text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-accent/20 transition-all shrink-0"
        >
          <Plus className="h-4 w-4" />
          <span>Create Coding Assignment</span>
        </button>
      </div>

      {/* Assignments Cards List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {assignments.map((assign) => (
          <div
            key={assign.id}
            className="p-5 rounded-2xl bg-card border border-border-subtle hover:border-accent/40 transition-all space-y-4 shadow-sm flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <span className={cn(
                  "px-2 py-0.5 rounded text-[10px] font-bold font-mono",
                  assign.difficulty === 'EASY' ? "bg-semantic-green/15 text-semantic-green" :
                  assign.difficulty === 'HARD' ? "bg-semantic-red/15 text-semantic-red" : "bg-amber-500/15 text-amber-500"
                )}>
                  {assign.difficulty} • {assign.totalPoints || 100} PTS
                </span>

                <button
                  onClick={async () => {
                    if (confirm('Delete this coding assignment?')) {
                      await deleteAssignment(assign.id)
                    }
                  }}
                  className="text-text-muted hover:text-semantic-red p-1"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>

              <h3 className="font-bold text-sm text-text-primary line-clamp-1">{assign.title}</h3>
              <p className="text-xs text-text-secondary line-clamp-2 mt-1">{assign.problemStatement}</p>
            </div>

            <div className="space-y-3 pt-3 border-t border-border-subtle text-xs">
              <div className="flex items-center justify-between text-text-muted text-[11px]">
                <span className="flex items-center gap-1 font-mono">
                  <Clock className="h-3 w-3 text-accent" />
                  Due: {new Date(assign.dueDate).toLocaleDateString()}
                </span>
                <span className="flex items-center gap-1">
                  <ShieldCheck className="h-3 w-3 text-semantic-green" />
                  Anti-Cheat Active
                </span>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] text-text-secondary font-bold">
                  {assign.submissionsCount || 0} Submissions (Avg: {assign.averageScore || 0}%)
                </span>
                <button
                  onClick={() => onViewSubmissions && onViewSubmissions(assign)}
                  className="px-3 py-1.5 rounded-xl bg-accent/15 text-accent hover:bg-accent/25 font-bold text-xs flex items-center gap-1 transition-colors"
                >
                  <Eye className="h-3.5 w-3.5" />
                  <span>Gradebook</span>
                </button>
              </div>
            </div>
          </div>
        ))}

        {assignments.length === 0 && (
          <div className="col-span-full p-8 text-center bg-card border border-dashed border-border-subtle rounded-2xl space-y-2">
            <Code2 className="h-8 w-8 text-text-muted mx-auto" />
            <h4 className="font-bold text-sm text-text-primary">No Coding Assignments Yet</h4>
            <p className="text-xs text-text-muted">Create your first automated assessment with hidden test cases and starter code.</p>
          </div>
        )}
      </div>

      {/* Create Assignment Modal Wizard */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-in fade-in">
          <div className="w-full max-w-3xl bg-card border border-border-subtle rounded-3xl p-6 shadow-2xl space-y-5 text-text-primary max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-border-subtle shrink-0">
              <h3 className="font-bold text-base text-text-primary flex items-center gap-2">
                <Code2 className="h-5 w-5 text-accent" />
                Create Automated Coding Assignment
              </h3>
              <button onClick={() => setShowCreateModal(false)} className="text-text-muted hover:text-text-primary">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4 text-xs overflow-y-auto flex-1 pr-1">
              {/* Problem Title & Difficulty */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2 space-y-1">
                  <label className="font-bold text-text-secondary block">Assignment Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Lab 4: Dijkstra Shortest Path"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    className="w-full bg-base border border-border-subtle rounded-xl px-3.5 py-2 text-text-primary focus:outline-none focus:border-accent"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-text-secondary block">Difficulty</label>
                  <select
                    value={form.difficulty}
                    onChange={(e) => setForm({ ...form, difficulty: e.target.value })}
                    className="w-full bg-base border border-border-subtle rounded-xl px-3 py-2 text-text-primary focus:outline-none focus:border-accent"
                  >
                    <option value="EASY">EASY</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HARD">HARD</option>
                  </select>
                </div>
              </div>

              {/* Problem Statement */}
              <div className="space-y-1">
                <label className="font-bold text-text-secondary block">Problem Description & Requirements *</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Describe problem statement, input/output formats, constraints, and time limits..."
                  value={form.problemStatement}
                  onChange={(e) => setForm({ ...form, problemStatement: e.target.value })}
                  className="w-full bg-base border border-border-subtle rounded-xl p-3 text-text-primary font-mono text-xs focus:outline-none focus:border-accent resize-none"
                />
              </div>

              {/* Language Locking & Boilerplate Starter Code */}
              <div className="space-y-2 p-3.5 rounded-2xl bg-surface border border-border-subtle">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-text-primary flex items-center gap-1.5">
                    <Lock className="h-3.5 w-3.5 text-accent" />
                    Language Locking & Boilerplate Code
                  </label>
                  <span className="text-[10px] text-text-muted">Select allowed submission languages</span>
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  {SUPPORTED_LANGUAGES.map((lang) => {
                    const isAllowed = form.allowedLanguages.includes(lang.id)
                    return (
                      <button
                        key={lang.id}
                        type="button"
                        onClick={() => handleToggleLang(lang.id)}
                        className={cn(
                          "px-3 py-1 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1.5",
                          isAllowed
                            ? "bg-accent text-white border-accent shadow-xs"
                            : "bg-base text-text-muted border-border-subtle hover:text-text-primary"
                        )}
                      >
                        {isAllowed && <CheckSquare className="h-3 w-3" />}
                        <span>{lang.name}</span>
                      </button>
                    )
                  })}
                </div>

                {/* Boilerplate Editor Tabs */}
                <div className="pt-2">
                  <div className="flex gap-1 border-b border-border-subtle pb-1">
                    {form.allowedLanguages.map(langId => (
                      <button
                        key={langId}
                        type="button"
                        onClick={() => setSelectedLangTab(langId)}
                        className={cn(
                          "px-2.5 py-1 text-[11px] font-mono font-bold rounded-lg transition-colors",
                          selectedLangTab === langId ? "bg-accent/20 text-accent" : "text-text-muted hover:text-text-primary"
                        )}
                      >
                        {langId}.starter
                      </button>
                    ))}
                  </div>

                  <textarea
                    rows={4}
                    value={form.boilerplates[selectedLangTab] || ''}
                    onChange={(e) => setForm({
                      ...form,
                      boilerplates: { ...form.boilerplates, [selectedLangTab]: e.target.value }
                    })}
                    placeholder={`Starter boilerplate code for ${selectedLangTab}...`}
                    className="w-full bg-base border border-border-subtle rounded-xl p-3 text-text-primary font-mono text-xs mt-2 focus:outline-none focus:border-accent"
                  />
                </div>
              </div>

              {/* Test Cases Builder */}
              <div className="space-y-3 p-3.5 rounded-2xl bg-surface border border-border-subtle">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="font-bold text-text-primary block">Test Cases & Automated Weightage</label>
                    <span className="text-[10px] text-text-muted">Sample cases are visible to students; Hidden cases evaluate final grades.</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleAddTestCase(false)}
                      className="px-2.5 py-1 rounded-lg bg-card hover:bg-hover border border-border-subtle text-accent text-[11px] font-bold"
                    >
                      + Sample Case
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddTestCase(true)}
                      className="px-2.5 py-1 rounded-lg bg-accent/20 hover:bg-accent/30 text-accent font-bold text-[11px]"
                    >
                      + Hidden Case
                    </button>
                  </div>
                </div>

                <div className="space-y-2.5">
                  {form.testCases.map((tc, idx) => (
                    <div key={tc.id || idx} className="p-3 rounded-xl bg-card border border-border-subtle space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className={cn(
                            "px-2 py-0.5 rounded text-[10px] font-mono font-bold",
                            tc.isHidden ? "bg-purple-500/20 text-purple-400 border border-purple-500/30" : "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                          )}>
                            {tc.isHidden ? '🔒 HIDDEN CASE' : '👁️ SAMPLE CASE'}
                          </span>
                          <span className="font-bold text-text-primary">{tc.title}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1">
                            <span className="text-text-muted text-[10px]">Points:</span>
                            <input
                              type="number"
                              min={1}
                              value={tc.weightagePoints}
                              onChange={(e) => {
                                const updated = [...form.testCases]
                                updated[idx].weightagePoints = Number(e.target.value)
                                setForm({ ...form, testCases: updated })
                              }}
                              className="w-14 bg-base border border-border-subtle rounded px-1.5 py-0.5 text-center font-mono font-bold text-accent text-xs"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveTestCase(tc.id)}
                            className="p-1 text-text-muted hover:text-semantic-red"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <span className="text-[10px] text-text-muted font-bold block mb-0.5">Input:</span>
                          <textarea
                            rows={2}
                            value={tc.input}
                            onChange={(e) => {
                              const updated = [...form.testCases]
                              updated[idx].input = e.target.value
                              setForm({ ...form, testCases: updated })
                            }}
                            className="w-full bg-base border border-border-subtle rounded-lg p-2 font-mono text-[11px] text-text-primary"
                          />
                        </div>
                        <div>
                          <span className="text-[10px] text-text-muted font-bold block mb-0.5">Expected Output:</span>
                          <textarea
                            rows={2}
                            value={tc.expectedOutput}
                            onChange={(e) => {
                              const updated = [...form.testCases]
                              updated[idx].expectedOutput = e.target.value
                              setForm({ ...form, testCases: updated })
                            }}
                            className="w-full bg-base border border-border-subtle rounded-lg p-2 font-mono text-[11px] text-text-primary"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Anti-Cheat & Deadlines */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-2xl bg-surface border border-border-subtle">
                <div className="space-y-2">
                  <label className="font-bold text-text-primary flex items-center gap-1.5">
                    <ShieldCheck className="h-4 w-4 text-accent" />
                    Anti-Cheat Protocol
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-[11px] text-text-secondary">
                    <input
                      type="checkbox"
                      checked={form.antiCheat.blockClipboard}
                      onChange={(e) => setForm({ ...form, antiCheat: { ...form.antiCheat, blockClipboard: e.target.checked } })}
                      className="rounded accent-accent"
                    />
                    <span>Block Clipboard (Ctrl+C / Ctrl+V / Paste)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-[11px] text-text-secondary">
                    <input
                      type="checkbox"
                      checked={form.antiCheat.trackFocusLoss}
                      onChange={(e) => setForm({ ...form, antiCheat: { ...form.antiCheat, trackFocusLoss: e.target.checked } })}
                      className="rounded accent-accent"
                    />
                    <span>Track Tab Switches (Flag after 3 Focus Losses)</span>
                  </label>
                </div>

                <div className="space-y-2">
                  <label className="font-bold text-text-primary block">Submission Deadline</label>
                  <input
                    type="datetime-local"
                    value={form.dueDate}
                    onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                    className="w-full bg-base border border-border-subtle rounded-xl px-3 py-2 text-text-primary focus:outline-none focus:border-accent"
                  />
                  <div className="flex items-center gap-2 text-[11px] text-text-muted">
                    <span>Late penalty: {form.latePenaltyPercentage}% / day</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl text-text-secondary hover:text-text-primary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-accent hover:bg-accent-light text-white font-bold shadow-lg shadow-accent/25"
                >
                  Publish Assessment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
