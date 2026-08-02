import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, X, Send, Trash2, Gauge, Code, Building, BookOpen, Loader2, Maximize2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { useProblems } from '@/hooks/useProblems'
import { useTopics } from '@/hooks/useTopics'
import { useApplications } from '@/hooks/useApplications'
import { useStreak } from '@/hooks/useStreak'
import { useAIChat } from '@/hooks/useAIChat'
import { useAppStore } from '@/store/useAppStore'
import ChatMessage from './ChatMessage'
import { Button } from '@/components/ui/button'

export default function AICoachDrawer() {
  const { aiCoachOpen, closeAICoach } = useAppStore()
  const { user, profile } = useAuth()
  const navigate = useNavigate()

  const { problems } = useProblems(user?.uid)
  const { topics } = useTopics(user?.uid)
  const { applications } = useApplications(user?.uid)
  const { streakData } = useStreak(user?.uid)

  const { messages, loading, sendMessage, runAnalyzePrep, runInterviewBrief, clearChat } = useAIChat()
  const [input, setInput] = useState('')
  const [showBriefInput, setShowBriefInput] = useState(false)
  const [companyName, setCompanyName] = useState('')
  const [role, setRole] = useState('')

  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    if (aiCoachOpen) {
      scrollToBottom()
    }
  }, [messages, aiCoachOpen])

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && aiCoachOpen) {
        closeAICoach()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [aiCoachOpen, closeAICoach])

  const handleSend = async (e) => {
    e?.preventDefault()
    if (!input.trim() || loading) return

    const text = input.trim()
    setInput('')
    await sendMessage(text, {
      problemsCount: problems.length,
      topicsCount: topics.length,
      applicationsCount: applications.length,
    })
  }

  const handleAnalyzePrepClick = () => {
    runAnalyzePrep({
      problems,
      topics,
      applications,
      streakData,
    })
  }

  const handleGenerateBriefSubmit = (e) => {
    e.preventDefault()
    if (!companyName.trim()) return
    runInterviewBrief({
      companyName: companyName.trim(),
      role: role.trim() || 'Software Engineer',
      weakTopics: topics.filter((t) => t.status === 'weak' || t.status === 'learning').map((t) => t.name),
      strongTopics: topics.filter((t) => t.status === 'mastered').map((t) => t.name),
    })
    setCompanyName('')
    setRole('')
    setShowBriefInput(false)
  }

  return (
    <AnimatePresence>
      {aiCoachOpen && (
        /* Side-by-side compact AI Coach Panel (Width: 400px, No backdrop blur so main screen is 100% interactive) */
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 220 }}
          className="fixed right-0 top-0 h-screen w-full sm:w-[380px] lg:w-[400px] z-40 bg-surface border-l border-border-subtle shadow-2xl flex flex-col overflow-hidden transition-colors duration-300"
        >
          {/* Header */}
          <div className="px-4 py-3 bg-card border-b border-border-subtle flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-accent text-white shadow">
                <Sparkles className="h-4 w-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-card-title font-bold text-text-primary text-sm">AI Coach</h2>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-semantic-green-bg text-semantic-green font-semibold border border-semantic-green/20 flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-semantic-green animate-pulse" /> Active
                  </span>
                </div>
                <p className="text-micro text-text-muted">Ask doubts, debug code, or analyze prep</p>
              </div>
            </div>

            {/* Header Action Buttons */}
            <div className="flex items-center gap-1">
              <Button
                onClick={handleAnalyzePrepClick}
                disabled={loading}
                size="sm"
                className="bg-accent hover:bg-accent/90 text-white font-semibold text-[11px] h-7 px-2.5 rounded-lg shadow flex items-center gap-1"
              >
                {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Gauge className="h-3 w-3" />}
                Analyze Prep
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={clearChat}
                className="h-7 w-7 text-text-muted hover:text-semantic-red"
                title="Clear Chat History"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  closeAICoach()
                  navigate('/ai-coach')
                }}
                className="h-7 w-7 text-text-muted hover:text-text-primary"
                title="Open Full Page View"
              >
                <Maximize2 className="h-3.5 w-3.5" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={closeAICoach}
                className="h-7 w-7 text-text-muted hover:text-text-primary"
                title="Close AI Panel"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Chat Stream Container */}
          <div className="flex-1 p-3 overflow-y-auto space-y-3 bg-base/50 scrollbar-none">
            {messages.map((msg) => (
              <ChatMessage key={msg.id} message={msg} />
            ))}

            {loading && (
              <div className="flex items-center gap-2.5 my-3 p-3 rounded-xl bg-surface border border-border-subtle text-accent-light text-xs font-mono animate-pulse w-fit">
                <Loader2 className="h-3.5 w-3.5 animate-spin text-accent" />
                <span>AI Coach is analyzing...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Popover for Interview Brief Inputs */}
          {showBriefInput && (
            <div className="p-3 bg-surface border-t border-border-subtle animate-in fade-in shrink-0">
              <form onSubmit={handleGenerateBriefSubmit} className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-semibold text-text-primary flex items-center gap-1.5">
                    <Building className="h-3.5 w-3.5 text-accent-light" /> Company Interview Brief
                  </h4>
                  <button
                    type="button"
                    onClick={() => setShowBriefInput(false)}
                    className="text-micro text-text-muted hover:text-text-primary"
                  >
                    Cancel
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Company (e.g. Google)"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="bg-card border border-border-subtle rounded-lg px-2.5 py-1.5 text-xs text-text-primary outline-none focus:border-accent"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Role (e.g. SDE-1)"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="bg-card border border-border-subtle rounded-lg px-2.5 py-1.5 text-xs text-text-primary outline-none focus:border-accent"
                  />
                </div>
                <Button type="submit" size="sm" className="w-full bg-accent hover:bg-accent/90 text-white text-xs h-7">
                  Generate Brief
                </Button>
              </form>
            </div>
          )}

          {/* Quick Actions & Prompt Chips */}
          <div className="p-3 bg-card border-t border-border-subtle space-y-2">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {(profile?.role === 'teacher' ? [
                { label: 'Generate Quiz Questions', text: 'Generate a 5-question MCQ quiz on Graph Algorithms with answer keys.' },
                { label: 'Draft Lesson Plan', text: 'Draft a 1-hour lecture outline for Database Concurrency Control.' },
                { label: 'Lecture Pacing', text: 'Suggest pacing strategy for completing OS syllabus in 4 weeks.' }
              ] : profile?.role === 'phd' ? [
                { label: 'Summarize IEEE Abstract', text: 'Summarize the core methodology and contributions of this IEEE paper.' },
                { label: 'LaTeX Citation', text: 'Format a BibTeX LaTeX citation for an ACM SIGCOMM paper.' },
                { label: 'Supervisor Update', text: 'Help me draft a concise email update for my PhD advisor meeting.' }
              ] : [
                { label: 'Code Debug Hints', text: 'I have a bug in my Graph BFS code. How can I trace infinite loops?' },
                { label: 'Mock Interview Prep', text: 'Give me 3 top technical interview questions asked at Google for SDE-1.' },
                { label: 'Analyze Prep Velocity', text: 'How can I balance DSA problem solving with CS Theory revision?' }
              ]).map((chip, idx) => (
                <button
                  key={idx}
                  onClick={() => sendMessage(chip.text)}
                  className="px-2.5 py-1 rounded-lg bg-surface hover:bg-surface/80 border border-border-subtle text-text-muted hover:text-text-primary text-[11px] whitespace-nowrap transition-colors"
                >
                  {chip.label}
                </button>
              ))}
            </div>
          </div>

          {/* Bottom Action Chips & Compact Input Box */}
          <div className="p-3 bg-surface border-t border-border-subtle space-y-2 shrink-0">
            {/* Action Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 text-[11px] scrollbar-none">
              <button
                onClick={handleAnalyzePrepClick}
                disabled={loading}
                className="px-2.5 py-1 rounded-full bg-accent/15 border border-accent/30 hover:bg-accent/25 text-accent-light font-medium whitespace-nowrap flex items-center gap-1 transition-all shrink-0"
              >
                <Gauge className="h-3 w-3" /> Analyze Prep
              </button>
              <button
                onClick={() => setInput('Explain Dijkstra algorithm with a step-by-step code example in Python')}
                className="px-2.5 py-1 rounded-full bg-card border border-border-subtle hover:bg-hover text-text-secondary whitespace-nowrap flex items-center gap-1 transition-all shrink-0"
              >
                <Code className="h-3 w-3 text-text-muted" /> Explain Algorithm
              </button>
              <button
                onClick={() => setShowBriefInput(true)}
                className="px-2.5 py-1 rounded-full bg-card border border-border-subtle hover:bg-hover text-text-secondary whitespace-nowrap flex items-center gap-1 transition-all shrink-0"
              >
                <Building className="h-3 w-3 text-semantic-green" /> Interview Brief
              </button>
              <button
                onClick={() => setInput('What are the top OS concepts asked in tech interviews?')}
                className="px-2.5 py-1 rounded-full bg-card border border-border-subtle hover:bg-hover text-text-secondary whitespace-nowrap flex items-center gap-1 transition-all shrink-0"
              >
                <BookOpen className="h-3 w-3 text-semantic-yellow" /> Core CS Topics
              </button>
            </div>

            {/* Form Input */}
            <form onSubmit={handleSend} className="relative flex items-center bg-card border border-border-subtle hover:border-border focus-within:border-accent rounded-xl px-3 py-1.5 shadow-inner transition-all">
              <input
                type="text"
                placeholder="Ask AI Coach any doubt, code question, or prep query..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={loading}
                className="w-full bg-transparent text-xs text-text-primary outline-none py-1 pr-8 border-none focus:ring-0 placeholder:text-text-muted"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="absolute right-2 h-7 w-7 rounded-lg bg-accent hover:bg-accent/90 text-white flex items-center justify-center disabled:opacity-40 shadow transition-all shrink-0"
                title="Send Message"
              >
                <Send className="h-3.5 w-3.5" />
              </button>
            </form>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
