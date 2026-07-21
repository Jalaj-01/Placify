import { useState, useRef, useEffect } from 'react'
import { Sparkles, Send, Trash2, Gauge, Code, Building, BookOpen, Loader2, Bot, Info } from 'lucide-react'
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
    <div className="flex flex-col h-[calc(100vh-6rem)] max-w-6xl mx-auto rounded-2xl border border-border-subtle bg-card overflow-hidden shadow-xl">
      {/* ChatGPT Style Top Header Bar */}
      <div className="p-4 border-b border-border-subtle bg-surface flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-violet-600 text-white shadow-md">
            <Bot className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-card-title font-bold text-text-primary">AI Coach & Placement Assistant</h1>
              <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <p className="text-micro text-text-muted">Powered by Gemini AI • Ask doubts, debug code, or run preparation diagnostics</p>
          </div>
        </div>

        {/* Top Header Actions */}
        <div className="flex items-center gap-2.5">
          {/* Prominent Analyze Prep Button */}
          <Button
            onClick={handleAnalyzePrepClick}
            disabled={loading}
            className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-xs h-9 px-4 rounded-xl shadow flex items-center gap-2 transition-all"
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
      <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 bg-base/50">
        {messages.map((msg) => (
          <ChatMessage key={msg.id} message={msg} />
        ))}

        {loading && (
          <div className="flex items-center gap-3 my-4 p-4 rounded-xl bg-card border border-border-subtle text-purple-400 text-xs font-mono animate-pulse w-fit">
            <Loader2 className="h-4 w-4 animate-spin text-purple-400" />
            <span>Ally is thinking & generating insights...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Modal / Popover for Interview Brief Inputs if triggered */}
      {showBriefInput && (
        <div className="p-4 bg-surface border-t border-border-subtle animate-in fade-in">
          <form onSubmit={handleGenerateBriefSubmit} className="max-w-xl mx-auto space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold text-text-primary flex items-center gap-1.5">
                <Building className="h-4 w-4 text-purple-400" /> Company Interview Brief Generator
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
                className="bg-card border border-border-subtle rounded-lg px-3 py-2 text-xs text-text-primary outline-none focus:border-purple-500"
                required
              />
              <input
                type="text"
                placeholder="Role (e.g. SDE-1, Frontend Developer)"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="bg-card border border-border-subtle rounded-lg px-3 py-2 text-xs text-text-primary outline-none focus:border-purple-500"
              />
            </div>
            <Button type="submit" size="sm" className="w-full bg-purple-600 hover:bg-purple-500 text-xs">
              Generate Brief
            </Button>
          </form>
        </div>
      )}

      {/* Bottom Action Chips & Chat Input Box */}
      <div className="p-4 bg-surface border-t border-border-subtle space-y-3 shrink-0">
        {/* Quick Action Chips Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <button
            onClick={handleAnalyzePrepClick}
            disabled={loading}
            className="px-3 py-1.5 rounded-xl bg-purple-600/15 border border-purple-500/30 hover:bg-purple-600/30 text-purple-300 font-semibold whitespace-nowrap flex items-center gap-1.5 transition-all shrink-0"
          >
            <Gauge className="h-3.5 w-3.5" /> Analyze Prep
          </button>
          <button
            onClick={() => setInput('Explain Dijkstra algorithm with a step-by-step code example in Python')}
            className="px-3 py-1.5 rounded-xl bg-card border border-border-subtle hover:bg-hover text-text-secondary whitespace-nowrap flex items-center gap-1.5 transition-all shrink-0"
          >
            <Code className="h-3.5 w-3.5 text-accent-light" /> Explain Algorithm
          </button>
          <button
            onClick={() => setShowBriefInput(true)}
            className="px-3 py-1.5 rounded-xl bg-card border border-border-subtle hover:bg-hover text-text-secondary whitespace-nowrap flex items-center gap-1.5 transition-all shrink-0"
          >
            <Building className="h-3.5 w-3.5 text-semantic-green" /> Interview Brief
          </button>
          <button
            onClick={() => setInput('What are the top OS concepts asked in tech interviews?')}
            className="px-3 py-1.5 rounded-xl bg-card border border-border-subtle hover:bg-hover text-text-secondary whitespace-nowrap flex items-center gap-1.5 transition-all shrink-0"
          >
            <BookOpen className="h-3.5 w-3.5 text-amber-400" /> Core CS Topics
          </button>
        </div>

        {/* Input Form */}
        <form onSubmit={handleSend} className="relative flex items-center">
          <textarea
            placeholder="Message Ally... Ask any doubt, code question, or placement query (Press Enter to send)"
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
            className="w-full bg-card border border-border-subtle rounded-2xl py-3 pl-4 pr-12 text-xs sm:text-sm text-text-primary outline-none focus:border-purple-500 transition-all resize-none min-h-[46px] max-h-32"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="absolute right-2.5 h-8 w-8 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-500 text-white flex items-center justify-center disabled:opacity-40 hover:opacity-95 shadow transition-all"
            title="Send Message"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  )
}
