import { Router } from 'express'
import { parseProblemUrl } from '../services/urlParser.js'

const router = Router()

router.post('/', async (req, res) => {
  try {
    const { url } = req.body
    const result = await parseProblemUrl(url)
    res.json(result)
  } catch (err) {
    res.status(400).json({ error: err.message || 'Failed to parse URL' })
  }
})

export default router
