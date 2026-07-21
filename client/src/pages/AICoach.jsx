import { useState, useRef, useEffect } from 'react'
import { Sparkles, Send, Trash2, Gauge, Code, Building, BookOpen, Loader2 } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useProblems } from '@/hooks/useProblems'
import { useTopics } from '@/hooks/useTopics'
import { useApplications } from '@/hooks/useApplications'
import { useStreak } from '@/hooks/useStreak'
import { useAIChat } from '@/hooks/useAIChat'
import ChatMessage from '@/components/ai/ChatMessage'
import { Button } from '@/components/ui/button'

export default function AICoach() {
  const { user } = useAuth()
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
    scrollToBottom()
  }, [messages])

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
    <div className="flex flex-col h-[calc(100vh-5.5rem)] max-w-5xl mx-auto px-2 sm:px-4">
      {/* Top Header Bar - Borderless & Seamless */}
      <div className="py-3 px-2 flex flex-wrap items-center justify-between gap-3 border-b border-border-subtle shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent/15 border border-accent/30 text-accent-light">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-section font-bold text-text-primary">Placify Copilot</h1>
              <span className="flex h-2 w-2 rounded-full bg-semantic-green animate-pulse" />
            </div>
            <p className="text-secondary text-text-secondary">Ask doubts, debug code, or run preparation diagnostics</p>
          </div>
        </div>

        {/* Top Header Actions */}
        <div className="flex items-center gap-2">
          {/* Prominent Analyze Prep Button */}
          <Button
            onClick={handleAnalyzePrepClick}
            disabled={loading}
            className="bg-accent hover:bg-accent/90 text-white font-semibold text-xs h-9 px-4 rounded-xl shadow flex items-center gap-2 transition-all"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Gauge className="h-4 w-4" />}
            Analyze Prep
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={clearChat}
            className="h-9 text-xs text-text-secondary border-border-subtle hover:bg-hover flex items-center gap-1.5 rounded-xl"
            title="Clear Chat History"
          >
            <Trash2 className="h-4 w-4 text-text-muted" /> Clear Chat
          </Button>
        </div>
      </div>

      {/* Main Chat Stream Container */}
      <div className="flex-1 py-4 overflow-y-auto space-y-4 pr-1 scrollbar-none">
        {messages.map((msg) => (
          <ChatMessage key={msg.id} message={msg} />
        ))}

        {loading && (
          <div className="flex items-center gap-3 my-4 p-3.5 rounded-2xl bg-surface border border-border-subtle text-accent-light text-xs font-mono animate-pulse w-fit">
            <Loader2 className="h-4 w-4 animate-spin text-accent" />
            <span>Placify Copilot is thinking & analyzing...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Modal / Popover for Interview Brief Inputs */}
      {showBriefInput && (
        <div className="mb-3 p-4 bg-surface rounded-2xl border border-border-subtle animate-in fade-in">
          <form onSubmit={handleGenerateBriefSubmit} className="max-w-xl mx-auto space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold text-text-primary flex items-center gap-1.5">
                <Building className="h-4 w-4 text-accent-light" /> Company Interview Brief Generator
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
                placeholder="Company Name (e.g. Google, Amazon)"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="bg-card border border-border-subtle rounded-xl px-3 py-2 text-xs text-text-primary outline-none focus:border-accent"
                required
              />
              <input
                type="text"
                placeholder="Role (e.g. SDE-1, Frontend Developer)"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="bg-card border border-border-subtle rounded-lg px-3 py-2 text-xs text-text-primary outline-none focus:border-accent"
              />
            </div>
            <Button type="submit" size="sm" className="w-full bg-accent hover:bg-accent/90 text-white text-xs">
              Generate Brief
            </Button>
          </form>
        </div>
      )}

      {/* Bottom Action Chips & Modern Chat Input Box */}
      <div className="pt-2 pb-4 space-y-2.5 shrink-0">
        {/* Quick Action Chips Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs scrollbar-none">
          <button
            onClick={handleAnalyzePrepClick}
            disabled={loading}
            className="px-3 py-1.5 rounded-full bg-accent/15 border border-accent/30 hover:bg-accent/25 text-accent-light font-semibold whitespace-nowrap flex items-center gap-1.5 transition-all shrink-0"
          >
            <Gauge className="h-3.5 w-3.5" /> Analyze Prep
          </button>
          <button
            onClick={() => setInput('Explain Dijkstra algorithm with a step-by-step code example in Python')}
            className="px-3 py-1.5 rounded-full bg-surface border border-border-subtle hover:bg-hover text-text-secondary whitespace-nowrap flex items-center gap-1.5 transition-all shrink-0"
          >
            <Code className="h-3.5 w-3.5 text-text-muted" /> Explain Algorithm
          </button>
          <button
            onClick={() => setShowBriefInput(true)}
            className="px-3 py-1.5 rounded-full bg-surface border border-border-subtle hover:bg-hover text-text-secondary whitespace-nowrap flex items-center gap-1.5 transition-all shrink-0"
          >
            <Building className="h-3.5 w-3.5 text-semantic-green" /> Interview Brief
          </button>
          <button
            onClick={() => setInput('What are the top OS concepts asked in tech interviews?')}
            className="px-3 py-1.5 rounded-full bg-surface border border-border-subtle hover:bg-hover text-text-secondary whitespace-nowrap flex items-center gap-1.5 transition-all shrink-0"
          >
            <BookOpen className="h-3.5 w-3.5 text-semantic-yellow" /> Core CS Topics
          </button>
        </div>

        {/* Input Form Container */}
        <form onSubmit={handleSend} className="relative flex items-center">
          <textarea
            placeholder="Message Placify Copilot... Ask any doubt, code question, or placement query (Press Enter to send)"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSend()
              }
            }}
            rows={1}
            disabled={loading}
            className="w-full bg-surface border border-border-subtle hover:border-border focus:border-accent rounded-2xl py-3.5 pl-4 pr-12 text-xs sm:text-sm text-text-primary outline-none transition-all resize-none min-h-[50px] max-h-32 shadow-lg"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="absolute right-3 h-8 w-8 rounded-xl bg-accent hover:bg-accent/90 text-white flex items-center justify-center disabled:opacity-40 shadow transition-all"
            title="Send Message"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  )
}
