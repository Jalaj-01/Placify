import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import admin from 'firebase-admin'
import { verifyAuth } from './middleware/auth.js'
import parseUrlRouter from './routes/parseUrl.js'
import aiRouter from './routes/ai.js'

const app = express()
const PORT = process.env.PORT || 3001

// Initialize Firebase Admin for token verification
if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
  admin.initializeApp({ credential: admin.credential.cert(serviceAccount) })
} else {
  admin.initializeApp({ projectId: process.env.FIREBASE_PROJECT_ID || 'placement-tracker-5acc4' })
}

const allowedOrigins = [
  process.env.CLIENT_URL || 'http://localhost:5173',
  'http://localhost:5173',
  'http://localhost:4173',
]

app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin)) cb(null, true)
    else cb(null, true) // allow Vercel preview URLs
  },
  credentials: true,
}))
app.use(express.json({ limit: '2mb' }))

app.get('/health', (_req, res) => res.json({ status: 'ok' }))

app.use('/api/parse-url', verifyAuth, parseUrlRouter)
app.use('/api/ai', verifyAuth, aiRouter)

app.use((err, _req, res, _next) => {
  console.error(err)
  res.status(500).json({ error: 'Internal server error' })
})

app.listen(PORT, () => {
  console.log(`PlacementTracker API running on port ${PORT}`)
})
