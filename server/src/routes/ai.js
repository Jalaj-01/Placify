import { Router } from 'express'
import { analyzePreparation, generateInterviewBrief, explainTopic, chatWithGemini } from '../services/geminiService.js'

const router = Router()

router.post('/analyze', async (req, res) => {
  try {
    const result = await analyzePreparation(req.body)
    res.json(result)
  } catch (err) {
    res.status(500).json({ error: err.message || 'Analysis failed' })
  }
})

router.post('/interview-brief', async (req, res) => {
  try {
    const result = await generateInterviewBrief(req.body)
    res.json(result)
  } catch (err) {
    res.status(500).json({ error: err.message || 'Brief generation failed' })
  }
})

router.post('/explain-topic', async (req, res) => {
  try {
    const { topicName } = req.body
    if (!topicName) return res.status(400).json({ error: 'topicName is required' })
    const result = await explainTopic(topicName)
    res.json(result)
  } catch (err) {
    res.status(500).json({ error: err.message || 'Explanation failed' })
  }
})

router.post('/chat', async (req, res) => {
  try {
    const { messages, userContext } = req.body
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'messages array is required' })
    }
    const result = await chatWithGemini({ messages, userContext })
    res.json(result)
  } catch (err) {
    res.status(500).json({ error: err.message || 'Chat generation failed' })
  }
})

export default router
