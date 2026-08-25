import { useState, useEffect, useCallback } from 'react'
import { chatWithAI, analyzePreparation, generateInterviewBrief, explainTopic } from '@/services/aiService'

const STORAGE_KEY = 'ally_chat_messages_v1'

function getWelcomeMessage() {
  const rawRole = (localStorage.getItem('placify_active_role') || '').toLowerCase().trim()
  const role = rawRole === 'faculty' ? 'teacher' : (rawRole === 'research' ? 'phd' : rawRole)

  if (role === 'teacher') {
    return {
      id: 'welcome',
      role: 'assistant',
      content: "Hi! I'm **Kai**, your AI Teaching & Pedagogy Coach. 🎓\n\nI can assist you with:\n- 📋 **Lesson Planning**: Draft structured lecture outlines and pacing plans.\n- ❓ **Quiz & Assessment Generation**: Auto-generate MCQs, coding problems, and rubrics.\n- 📊 **Student Performance Analysis**: Interpret assessment data and identify weak areas.\n- 🧑‍🏫 **Teaching Strategies**: Get pedagogy tips, active learning methods, and engagement techniques.\n\nWhat can I help you plan today?",
      timestamp: new Date().toISOString(),
    }
  }

  if (role === 'phd') {
    return {
      id: 'welcome',
      role: 'assistant',
      content: "Hi! I'm **Kai**, your AI Research Coach. 🔬\n\nI can assist you with:\n- 📄 **Paper Summarization**: Get concise abstracts and methodology breakdowns.\n- 📝 **LaTeX & Citation Help**: Format BibTeX, IEEE, and APA citations correctly.\n- ✉️ **Advisor Communication**: Draft milestone update emails and research proposals.\n- 🧠 **Research Gap Analysis**: Identify gaps in literature and suggest directions.\n\nWhat research challenge can I help you solve today?",
      timestamp: new Date().toISOString(),
    }
  }

  // default: student
  return {
    id: 'welcome',
    role: 'assistant',
    content: "Hi! I'm **Kai**, your AI Placement & Coding Coach. ⚡\n\nI can assist you with:\n- 🎯 **Preparation Diagnostics**: Click **Analyze Prep** to diagnose your readiness level.\n- 💡 **Coding Doubts & DSA**: Ask me any question, code snippet, or debugging task.\n- 🏢 **Company Interview Guides**: Get custom company interview briefs.\n- 📚 **Topic Cheat Sheets**: Quick concept refreshers and definitions.\n\nWhat would you like to solve today?",
    timestamp: new Date().toISOString(),
  }
}

function getInitialMessages() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      const parsed = JSON.parse(saved)
      // Validate: if the welcome message ID doesn't match the current role, reset
      if (Array.isArray(parsed) && parsed.length > 0) {
        const currentWelcome = getWelcomeMessage()
        // Only use cached if welcome content matches current role
        if (parsed[0]?.content === currentWelcome.content) return parsed
      }
    }
  } catch (e) {
    console.error('Failed to load chat history', e)
  }
  return [getWelcomeMessage()]
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
    const welcome = getWelcomeMessage()
    setMessages([welcome])
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
