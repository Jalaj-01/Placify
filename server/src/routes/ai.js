import { Router } from 'express'
import { analyzePreparation, generateInterviewBrief, explainTopic } from '../services/geminiService.js'

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

export default router
