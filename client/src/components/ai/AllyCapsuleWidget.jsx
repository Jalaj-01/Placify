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
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {/* Floating Glassmorphic Chat Popup Window - Right Side */}
      {isOpen && (
        <div className="w-[90vw] sm:w-[400px] md:w-[440px] h-[530px] max-h-[82vh] rounded-[32px] border border-gray-200/90 dark:border-white/10 bg-[#EDEFF4]/95 dark:bg-[#12102E]/95 backdrop-blur-2xl shadow-[0_20px_60px_rgba(30,27,75,0.18)] flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
          {/* Header */}
          <div className="px-5 py-3.5 bg-white/80 dark:bg-[#1E1B4B]/80 border-b border-[#1E1B4B]/10 dark:border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-8.5 w-8.5 items-center justify-center rounded-2xl bg-[#2563EB] text-white shadow-md border border-[#2563EB]/40">
                <Sparkles className="h-4.5 w-4.5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-sm text-[#1E1B4B] dark:text-[#EEF2FF] tracking-wide">Kai</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#2563EB]/15 text-[#2563EB] font-bold border border-[#2563EB]/30 flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#2563EB] animate-pulse" /> Active v2.0
                  </span>
                </div>
                <p className="text-[11px] text-text-muted">AI Placement & Coding Coach</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => {
                  setIsOpen(false)
                  navigate('/ai-coach')
                }}
                className="p-1.5 rounded-xl text-text-muted hover:text-[#2563EB] hover:bg-[#EEF2FF] dark:hover:bg-white/10 transition-colors"
                title="Expand to Full Screen Kai AI Coach"
              >
                <Maximize2 className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={clearChat}
                className="p-1.5 rounded-xl text-text-muted hover:text-semantic-red hover:bg-[#EEF2FF] dark:hover:bg-white/10 transition-colors"
                title="Clear Chat History"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-xl text-text-muted hover:text-[#2563EB] hover:bg-[#EEF2FF] dark:hover:bg-white/10 transition-colors"
                title="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Quick Action Chips */}
          <div className="px-4 py-2.5 bg-white/50 dark:bg-[#1E1B4B]/50 border-b border-[#1E1B4B]/8 dark:border-white/10 flex gap-2 overflow-x-auto text-[11px] scrollbar-none">
            <button
              onClick={handleRunAnalyze}
              disabled={loading}
              className="px-3 py-1.5 rounded-full bg-[#2563EB]/15 border border-[#2563EB]/40 hover:bg-[#2563EB]/25 text-[#2563EB] font-bold whitespace-nowrap flex items-center gap-1.5 transition-all shadow-xs"
            >
              <Gauge className="h-3 w-3 text-[#2563EB]" /> Analyze Prep
            </button>
            <button
              onClick={() => setInput('Debug this code logic for me: ')}
              className="px-3 py-1.5 rounded-full bg-white dark:bg-[#25225E] border border-gray-200 dark:border-white/10 hover:border-[#2563EB]/40 text-[#1E1B4B] dark:text-[#EEF2FF] font-semibold whitespace-nowrap flex items-center gap-1.5 transition-all"
            >
              <Code className="h-3 w-3 text-[#2563EB]" /> Debug Code
            </button>
            <button
              onClick={() => setInput('Explain LRU Cache algorithm with time complexity')}
              className="px-3 py-1.5 rounded-full bg-white dark:bg-[#25225E] border border-gray-200 dark:border-white/10 hover:border-[#2563EB]/40 text-[#1E1B4B] dark:text-[#EEF2FF] font-semibold whitespace-nowrap flex items-center gap-1.5 transition-all"
            >
              <BookOpen className="h-3 w-3 text-emerald-600" /> Explain Topic
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#EDEFF4]/50 dark:bg-[#0E0D24]/60">
            {messages.map((msg) => (
              <ChatMessage key={msg.id} message={msg} />
            ))}

            {loading && (
              <div className="flex gap-2 items-center text-xs text-[#2563EB] p-2 font-mono animate-pulse">
                <Loader2 className="h-3.5 w-3.5 animate-spin text-[#2563EB]" /> Kai is analyzing...
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Footer */}
          <form onSubmit={handleSend} className="p-3.5 bg-white/80 dark:bg-[#1E1B4B]/80 border-t border-[#1E1B4B]/8 dark:border-white/10 flex gap-2 items-center">
            <input
              type="text"
              placeholder="Ask Kai any doubt or placement question..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
              className="flex-1 bg-white dark:bg-[#25225E] border border-gray-300/80 dark:border-white/10 rounded-2xl px-4 py-2.5 text-xs text-[#1E1B4B] dark:text-[#EEF2FF] focus:outline-none focus:border-[#2563EB] transition-all placeholder:text-[#1E1B4B]/40 dark:placeholder:text-[#EEF2FF]/40 font-medium"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="h-9 w-9 rounded-2xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white flex items-center justify-center disabled:opacity-40 shadow-md transition-all shrink-0"
            >
              <Send className="h-3.5 w-3.5" />
            </button>
          </form>
        </div>
      )}

      {/* Modern AI Capsule Pill Button for Kai */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="group relative p-[2px] rounded-full bg-gradient-to-r from-[#2563EB] to-[#FACC15] shadow-[0_8px_25px_rgba(37,99,235,0.35)] hover:shadow-[0_12px_32px_rgba(37,99,235,0.5)] hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer"
        title="Open Kai AI Assistant"
      >
        <div className="px-4.5 py-2.5 rounded-full bg-[#1E1B4B] flex items-center gap-2.5">
          {/* Glowing Orb Sparkle Circle */}
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#2563EB] text-white shadow-inner group-hover:rotate-12 transition-transform">
            <Sparkles className="h-3.5 w-3.5 text-white" />
          </div>

          {/* Kai AI Name */}
          <span className="text-xs sm:text-sm font-bold tracking-wider text-white">Kai</span>

          {/* Live Pulse Dot */}
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FACC15] opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#FACC15]" />
          </span>
        </div>
      </button>
    </div>
  )
}
