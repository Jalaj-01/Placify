import { useState } from 'react'
import * as ai from '@/services/aiService'

const CACHE_KEY = 'ai_analysis_cache'
const CACHE_TTL = 24 * 60 * 60 * 1000

function getCached() {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    if (!raw) return null
    const { data, ts } = JSON.parse(raw)
    if (Date.now() - ts > CACHE_TTL) { localStorage.removeItem(CACHE_KEY); return null }
    return data
  } catch { return null }
}

function setCache(data) {
  localStorage.setItem(CACHE_KEY, JSON.stringify({ data, ts: Date.now() }))
}

const topicCache = new Map()

export function useAICoach() {
  const [loading, setLoading] = useState(false)
  const [analysis, setAnalysis] = useState(getCached())
  const [error, setError] = useState(null)

  const analyze = async (payload) => {
    setLoading(true)
    setError(null)
    try {
      const result = await ai.analyzePreparation(payload)
      setAnalysis(result)
      setCache(result)
      return result
    } catch (e) {
      setError(e.message)
      throw e
    } finally {
      setLoading(false)
    }
  }

  const generateBrief = async (payload) => {
    setLoading(true)
    setError(null)
    try {
      return await ai.generateInterviewBrief(payload)
    } catch (e) {
      setError(e.message)
      throw e
    } finally {
      setLoading(false)
    }
  }

  const explainTopicFn = async (topicName) => {
    if (topicCache.has(topicName)) return topicCache.get(topicName)
    setLoading(true)
    setError(null)
    try {
      const result = await ai.explainTopic(topicName)
      topicCache.set(topicName, result)
      return result
    } catch (e) {
      setError(e.message)
      throw e
    } finally {
      setLoading(false)
    }
  }

  return { analysis, loading, error, analyze, generateBrief, explainTopic: explainTopicFn }
}
