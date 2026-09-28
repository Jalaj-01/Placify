import { useState } from 'react'
import {
  Code2, ExternalLink, Sparkles, Plus, CheckCircle2,
  Building2, HelpCircle, ChevronDown, ChevronUp, MessageSquare
} from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
import { useAuth } from '@/hooks/useAuth'
import { useNavigate } from 'react-router-dom'
import confetti from 'canvas-confetti'

export default function PracticeProblemsPanel({ activeTopic }) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const openAICoach = useAppStore((s) => s.openAICoach)
  const problems = activeTopic.problems || []

  const [expandedSimId, setExpandedSimId] = useState(null)
  const [loggedProblemIds, setLoggedProblemIds] = useState(new Set())

  const handleLogToProblems = (problem) => {
    // Trigger celebratory confetti effect
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 },
      })
    } catch {}

    setLoggedProblemIds((prev) => new Set([...prev, problem.id]))

    // Navigate to problem log with query params so user can save or review
    setTimeout(() => {
      navigate(`/problems?title=${encodeURIComponent(problem.title)}&difficulty=${problem.difficulty}&type=DSA`)
    }, 400)
  }

  const handleAskAICoach = (problemTitle) => {
    openAICoach()
  }

  return (
    <div className="space-y-6 p-4 text-text-primary">
      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <Code2 className="w-5 h-5 text-accent" />
          <h2 className="text-xl font-bold tracking-tight">Curated Practice Problems</h2>
        </div>
        <p className="text-secondary text-text-secondary">
          Targeted interview questions frequently asked by top tech employers for this topic.
        </p>
      </div>

      {/* Problems List */}
      <div className="space-y-3">
        {problems.map((problem) => {
          const isLogged = loggedProblemIds.has(problem.id)
          const isSimExpanded = expandedSimId === problem.id

          return (
            <div
              key={problem.id}
              className="bg-surface rounded-2xl border border-border-subtle p-4 shadow-sm space-y-3 transition-all hover:border-accent/30"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                        problem.difficulty === 'Easy'
                          ? 'bg-semantic-green/15 text-semantic-green'
                          : problem.difficulty === 'Medium'
                          ? 'bg-amber-500/15 text-amber-400'
                          : 'bg-semantic-red/15 text-semantic-red'
                      }`}
                    >
                      {problem.difficulty}
                    </span>
                    <h3 className="font-bold text-sm text-text-primary hover:text-accent-light transition-colors">
                      {problem.title}
                    </h3>
                  </div>

                  {/* Company Badges */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                    <Building2 className="w-3.5 h-3.5 text-text-muted shrink-0" />
                    {problem.companies?.map((company, cIdx) => (
                      <span
                        key={cIdx}
                        className="px-2 py-0.2 rounded-md bg-hover text-text-secondary text-[11px] font-medium"
                      >
                        {company}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0 pt-2 sm:pt-0">
                  <button
                    onClick={() => handleAskAICoach(problem.title)}
                    className="p-2 rounded-xl bg-accent/10 border border-accent/20 text-accent-light hover:bg-accent/20 transition-all text-xs font-semibold flex items-center gap-1.5"
                    title="Ask AI Coach for hints and edge-case simulation"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Ask Coach</span>
                  </button>

                  <button
                    onClick={() => handleLogToProblems(problem)}
                    disabled={isLogged}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                      isLogged
                        ? 'bg-semantic-green/20 text-semantic-green border border-semantic-green/30'
                        : 'bg-accent text-white hover:bg-accent-light shadow-md shadow-accent/20'
                    }`}
                  >
                    {isLogged ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Logged</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-3.5 h-3.5" />
                        <span>Log to Tracker</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Collapsible Interview Simulation Walkthrough */}
              <div className="pt-2 border-t border-border-subtle">
                <button
                  onClick={() => setExpandedSimId(isSimExpanded ? null : problem.id)}
                  className="flex items-center justify-between w-full text-xs font-semibold text-text-muted hover:text-text-primary transition-colors py-1"
                >
                  <span className="flex items-center gap-1.5">
                    <HelpCircle className="w-3.5 h-3.5 text-accent" />
                    Interview Simulation Strategy
                  </span>
                  {isSimExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>

                {isSimExpanded && (
                  <div className="mt-2 space-y-2 text-xs bg-card p-3 rounded-xl border border-border-subtle">
                    <div className="space-y-1">
                      <p className="font-bold text-text-primary">1. Think & Clarify:</p>
                      <p className="text-text-secondary">
                        Ask the interviewer: Are there duplicates? Can the array be empty? Does it fit in memory?
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="font-bold text-text-primary">2. Brute Force vs Optimal:</p>
                      <p className="text-text-secondary">
                        State the naive approach (e.g. O(N^2) double loop) first to establish correctness, then explain how our 3D mental model reduces operations to {activeTopic.theory?.complexity?.time || 'O(N)'}.
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="font-bold text-text-primary">3. Follow-up Traps:</p>
                      <p className="text-text-secondary">
                        "What if the input is a continuous data stream?" or "Can we solve this in O(1) auxiliary space without modifying the original array?"
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
