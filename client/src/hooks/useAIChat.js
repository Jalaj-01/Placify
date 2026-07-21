import { useState, useEffect, useCallback } from 'react'
import { chatWithAI, analyzePreparation, generateInterviewBrief, explainTopic } from '@/services/aiService'

const STORAGE_KEY = 'ally_chat_messages_v1'

const INITIAL_MESSAGES = [
  {
    id: 'welcome',
    role: 'assistant',
    content: "Hi! I'm **Ally**, your AI Placement & Coding Coach. 🚀\n\nI can help you with:\n- 🎯 **Preparation Diagnostics**: Click **Analyze Prep** to assess your strengths & weak areas.\n- 💡 **Coding Doubts & DSA**: Ask me any question, code snippet, or debugging task.\n- 🏢 **Company Interview Briefs**: Get custom interview guides.\n- 📚 **Topic Refresher**: Quick definitions & cheat sheets.\n\nHow can I help you today?",
    timestamp: new Date().toISOString(),
  },
]

function getInitialMessages() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      const parsed = JSON.parse(saved)
      if (Array.isArray(parsed) && parsed.length > 0) return parsed
    }
  } catch (e) {
    console.error('Failed to load chat history', e)
  }
  return INITIAL_MESSAGES
}

export function useAIChat() {
  const [messages, setMessages] = useState(getInitialMessages)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages))
    } catch (e) {
      console.error('Failed to save chat history', e)
    }
  }, [messages])

  const clearChat = useCallback(() => {
    setMessages(INITIAL_MESSAGES)
    localStorage.removeItem(STORAGE_KEY)
  }, [])

  const sendMessage = useCallback(async (text, userContext = null) => {
    if (!text || !text.trim() || loading) return

    const userMsg = {
      id: 'msg_' + Date.now(),
      role: 'user',
      content: text.trim(),
      timestamp: new Date().toISOString(),
    }

    setMessages((prev) => [...prev, userMsg])
    setLoading(true)
    setError(null)

    try {
      const currentMsgs = [...messages, userMsg].map((m) => ({
        role: m.role,
        content: m.content,
      }))

      const res = await chatWithAI(currentMsgs, userContext)
      
      const assistantMsg = {
        id: 'msg_' + (Date.now() + 1),
        role: 'assistant',
        content: res.text || 'Sorry, I could not generate a response.',
        timestamp: new Date().toISOString(),
      }

      setMessages((prev) => [...prev, assistantMsg])
      return assistantMsg
    } catch (err) {
      const errText = err.message || 'Something went wrong while connecting to AI.'
      setError(errText)

      const errMsg = {
        id: 'msg_err_' + Date.now(),
        role: 'assistant',
        content: `⚠️ **Error**: ${errText}\n\nPlease check your server configuration (GEMINI_API_KEY) and try again.`,
        timestamp: new Date().toISOString(),
        isError: true,
      }
      setMessages((prev) => [...prev, errMsg])
    } finally {
      setLoading(false)
    }
  }, [messages, loading])

  const runAnalyzePrep = useCallback(async (payload) => {
    if (loading) return

    const userMsg = {
      id: 'msg_' + Date.now(),
      role: 'user',
      content: '⚡ Run Preparation Diagnostic & Analyze My Placement Progress',
      timestamp: new Date().toISOString(),
    }

    setMessages((prev) => [...prev, userMsg])
    setLoading(true)
    setError(null)

    try {
      const result = await analyzePreparation(payload)
      
      const assistantMsg = {
        id: 'msg_analysis_' + (Date.now() + 1),
        role: 'assistant',
        type: 'analysis',
        content: `### 📊 AI Preparation Diagnostic Completed!\n\n**Overall Readiness Level:** ${result.overallReadiness}%\n\n${result.studyPlanSuggestion || ''}`,
        data: result,
        timestamp: new Date().toISOString(),
      }

      setMessages((prev) => [...prev, assistantMsg])
      return result
    } catch (err) {
      const errText = err.message || 'Failed to run preparation diagnostic.'
      setError(errText)

      const errMsg = {
        id: 'msg_err_' + Date.now(),
        role: 'assistant',
        content: `⚠️ **Diagnostic Failed**: ${errText}`,
        timestamp: new Date().toISOString(),
        isError: true,
      }
      setMessages((prev) => [...prev, errMsg])
    } finally {
      setLoading(false)
    }
  }, [loading])

  const runInterviewBrief = useCallback(async (payload) => {
    if (loading) return

    const userMsg = {
      id: 'msg_' + Date.now(),
      role: 'user',
      content: `🏢 Generate Interview Brief for ${payload.companyName} (${payload.role})`,
      timestamp: new Date().toISOString(),
    }

    setMessages((prev) => [...prev, userMsg])
    setLoading(true)
    setError(null)

    try {
      const result = await generateInterviewBrief(payload)

      const assistantMsg = {
        id: 'msg_brief_' + (Date.now() + 1),
        role: 'assistant',
        type: 'brief',
        content: `### 🎯 Interview Brief for ${payload.companyName}\n**Role:** ${payload.role}\n\n${result.companyOverview || ''}`,
        data: result,
        timestamp: new Date().toISOString(),
      }

      setMessages((prev) => [...prev, assistantMsg])
      return result
    } catch (err) {
      const errText = err.message || 'Failed to generate interview brief.'
      setError(errText)
    } finally {
      setLoading(false)
    }
  }, [loading])

  return {
    messages,
    loading,
    error,
    sendMessage,
    runAnalyzePrep,
    runInterviewBrief,
    clearChat,
  }
}
