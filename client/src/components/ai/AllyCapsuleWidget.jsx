import { useState, useRef, useEffect } from 'react'
import { Sparkles, X, Send, Trash2, Maximize2, Loader2, Gauge, Code, BookOpen } from 'lucide-react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { useProblems } from '@/hooks/useProblems'
import { useTopics } from '@/hooks/useTopics'
import { useApplications } from '@/hooks/useApplications'
import { useStreak } from '@/hooks/useStreak'
import { useAIChat } from '@/hooks/useAIChat'
import ChatMessage from './ChatMessage'

export default function AllyCapsuleWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [input, setInput] = useState('')
  const messagesEndRef = useRef(null)
  const navigate = useNavigate()
  const location = useLocation()

  const { user } = useAuth()
  const { problems } = useProblems(user?.uid)
  const { topics } = useTopics(user?.uid)
  const { applications } = useApplications(user?.uid)
  const { streakData } = useStreak(user?.uid)

  const { messages, loading, sendMessage, runAnalyzePrep, clearChat } = useAIChat()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    if (isOpen) {
      scrollToBottom()
    }
  }, [messages, isOpen])

  // Hide floating capsule widget when on /ai-coach page to avoid duplicate UI
  if (location.pathname === '/ai-coach') {
    return null
  }

  const handleSend = async (e) => {
    e?.preventDefault()
    if (!input.trim() || loading) return

    const txt = input.trim()
    setInput('')
    await sendMessage(txt, {
      problemsCount: problems.length,
      topicsCount: topics.length,
      applicationsCount: applications.length,
    })
  }

  const handleRunAnalyze = () => {
    runAnalyzePrep({
      problems,
      topics,
      applications,
      streakData,
    })
  }

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center">
      {/* Hanging Glassmorphic Chat Popup Window - Center Aligned */}
      {isOpen && (
        <div className="mb-3 w-[92vw] sm:w-[440px] md:w-[480px] h-[540px] max-h-[80vh] rounded-3xl border border-white/10 bg-[#0d0e16]/95 backdrop-blur-2xl shadow-[0_20px_60px_rgba(0,0,0,0.7)] flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200">
          {/* Drawer Header */}
          <div className="px-4 py-3.5 bg-card/80 border-b border-border-subtle flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-accent text-white shadow-md">
                <Sparkles className="h-4.5 w-4.5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-text-primary">Placify Copilot</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-semantic-green-bg text-semantic-green font-semibold border border-semantic-green/20 flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-semantic-green animate-pulse" /> Online
                  </span>
                </div>
                <p className="text-[11px] text-text-muted">AI Placement & Coding Assistant</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => {
                  setIsOpen(false)
                  navigate('/ai-coach')
                }}
                className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-hover transition-colors"
                title="Expand to Full Screen AI Coach"
              >
                <Maximize2 className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={clearChat}
                className="p-1.5 rounded-lg text-text-muted hover:text-semantic-red hover:bg-hover transition-colors"
                title="Clear Chat History"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-hover transition-colors"
                title="Close Window"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Quick Action Bar */}
          <div className="px-3 py-2 bg-base/80 border-b border-border-subtle flex gap-1.5 overflow-x-auto text-[11px] scrollbar-none">
            <button
              onClick={handleRunAnalyze}
              disabled={loading}
              className="px-3 py-1 rounded-full bg-accent/15 border border-accent/30 hover:bg-accent/25 text-accent-light font-semibold whitespace-nowrap flex items-center gap-1.5 transition-all"
            >
              <Gauge className="h-3 w-3 text-accent-light" /> Analyze Prep
            </button>
            <button
              onClick={() => setInput('Debug this code logic for me: ')}
              className="px-3 py-1 rounded-full bg-card/80 border border-border-subtle hover:bg-hover text-text-secondary whitespace-nowrap flex items-center gap-1.5 transition-all"
            >
              <Code className="h-3 w-3 text-text-muted" /> Debug Code
            </button>
            <button
              onClick={() => setInput('Explain LRU Cache algorithm with time complexity')}
              className="px-3 py-1 rounded-full bg-card/80 border border-border-subtle hover:bg-hover text-text-secondary whitespace-nowrap flex items-center gap-1.5 transition-all"
            >
              <BookOpen className="h-3 w-3 text-semantic-green" /> Explain Topic
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-base/40">
            {messages.map((msg) => (
              <ChatMessage key={msg.id} message={msg} />
            ))}

            {loading && (
              <div className="flex gap-2 items-center text-xs text-accent-light p-2 font-mono animate-pulse">
                <Loader2 className="h-3.5 w-3.5 animate-spin text-accent" /> Placify Copilot is thinking...
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Footer */}
          <form onSubmit={handleSend} className="p-3 bg-card/90 border-t border-border-subtle flex gap-2 items-center">
            <input
              type="text"
              placeholder="Ask any coding doubt or placement query..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
              className="flex-1 bg-surface border border-border-subtle rounded-xl px-3.5 py-2 text-xs text-text-primary focus:outline-none focus:border-accent transition-colors"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="h-8.5 w-8.5 rounded-xl bg-accent hover:bg-accent/90 text-white flex items-center justify-center disabled:opacity-40 shadow transition-opacity shrink-0"
            >
              <Send className="h-3.5 w-3.5" />
            </button>
          </form>
        </div>
      )}

      {/* Center Aligned Hanging Capsule Button (Floating Dock / Dynamic Island Style) */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="group relative flex items-center gap-3 px-5 py-2.5 rounded-full bg-[#12131e]/90 backdrop-blur-xl border border-accent/40 shadow-[0_10px_35px_rgba(0,0,0,0.5)] ring-1 ring-accent/20 hover:ring-accent/40 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
        title="Open Placify Copilot"
      >
        {/* Inner Circle with Sparkle */}
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-accent text-white shadow-sm group-hover:rotate-12 transition-transform">
          <Sparkles className="h-3.5 w-3.5" />
        </div>

        {/* Text */}
        <span className="text-xs sm:text-sm font-semibold tracking-wide text-text-primary">Placify Copilot</span>

        {/* Online Green Pulsing Indicator Badge */}
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-semantic-green opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-semantic-green"></span>
        </span>
      </button>
    </div>
  )
}
