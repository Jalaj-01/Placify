import { useState, useRef, useEffect } from 'react'
import { Sparkles, X, Send, Trash2, Maximize2, Loader2, Gauge, Code, BookOpen } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
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
    <>
      {/* Floating Capsule Button - Visible on EVERY screen */}
      <div className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-50 flex flex-col items-end gap-3">
        {/* Chat Drawer Popup Window */}
        {isOpen && (
          <div className="w-[90vw] sm:w-[380px] md:w-[420px] h-[520px] max-h-[80vh] rounded-2xl border border-purple-500/30 bg-[#0d0e15]/95 backdrop-blur-xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200">
            {/* Drawer Header */}
            <div className="p-3.5 bg-gradient-to-r from-purple-900/40 via-indigo-900/40 to-slate-900/40 border-b border-border-subtle flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-tr from-purple-600 to-indigo-500 text-white shadow">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-text-primary">Ally</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-semibold border border-emerald-500/30">
                      Online
                    </span>
                  </div>
                  <p className="text-[10px] text-text-muted">AI Coding & Prep Coach</p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => {
                    setIsOpen(false)
                    navigate('/ai-coach')
                  }}
                  className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-white/10 transition-colors"
                  title="Expand to Full Screen AI Coach"
                >
                  <Maximize2 className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={clearChat}
                  className="p-1.5 rounded-lg text-text-muted hover:text-semantic-red hover:bg-white/10 transition-colors"
                  title="Clear Chat History"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-white/10 transition-colors"
                  title="Minimize"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Quick Action Bar inside Drawer */}
            <div className="px-3 py-2 bg-[#121420] border-b border-border-subtle flex gap-1.5 overflow-x-auto text-[11px]">
              <button
                onClick={handleRunAnalyze}
                disabled={loading}
                className="px-2.5 py-1 rounded-full bg-purple-600/20 border border-purple-500/30 hover:bg-purple-600/30 text-purple-300 font-medium whitespace-nowrap flex items-center gap-1 transition-all"
              >
                <Gauge className="h-3 w-3" /> Analyze Prep
              </button>
              <button
                onClick={() => setInput('Debug this code logic for me: ')}
                className="px-2.5 py-1 rounded-full bg-surface border border-border-subtle hover:bg-hover text-text-secondary whitespace-nowrap flex items-center gap-1 transition-all"
              >
                <Code className="h-3 w-3 text-accent-light" /> Debug Code
              </button>
              <button
                onClick={() => setInput('Explain LRU Cache algorithm with time complexity')}
                className="px-2.5 py-1 rounded-full bg-surface border border-border-subtle hover:bg-hover text-text-secondary whitespace-nowrap flex items-center gap-1 transition-all"
              >
                <BookOpen className="h-3 w-3 text-semantic-green" /> Explain Topic
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 p-3 overflow-y-auto space-y-3 bg-[#0a0b10]">
              {messages.map((msg) => (
                <ChatMessage key={msg.id} message={msg} />
              ))}

              {loading && (
                <div className="flex gap-2 items-center text-xs text-purple-400 p-2 font-mono animate-pulse">
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-purple-400" /> Ally is analyzing...
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Footer */}
            <form onSubmit={handleSend} className="p-3 bg-[#11121c] border-t border-border-subtle flex gap-2 items-center">
              <input
                type="text"
                placeholder="Ask any coding doubt or placement query..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={loading}
                className="flex-1 bg-surface border border-border-subtle rounded-xl px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-purple-500 transition-colors"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="h-8 w-8 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-500 text-white flex items-center justify-center disabled:opacity-50 shadow hover:opacity-90 transition-opacity shrink-0"
              >
                <Send className="h-3.5 w-3.5" />
              </button>
            </form>
          </div>
        )}

        {/* Capsule Pill Button (Matches User Image 1 Exactly!) */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="group relative flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-gradient-to-r from-purple-600 via-indigo-600 to-violet-600 text-white font-semibold shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer border border-purple-400/30"
          title="Open Ally AI Assistant"
        >
          {/* Inner Circle with Sparkle */}
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm shadow-inner group-hover:rotate-12 transition-transform">
            <Sparkles className="h-3.5 w-3.5 text-white" />
          </div>

          {/* Text */}
          <span className="text-sm font-bold tracking-wide text-white">Ally</span>

          {/* Online Green Indicator Badge (Top Right of Capsule) */}
          <span className="absolute -top-0.5 -right-0.5 flex h-3.5 w-3.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-400 border-2 border-[#090a0f]"></span>
          </span>
        </button>
      </div>
    </>
  )
}
