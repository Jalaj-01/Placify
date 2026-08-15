import 'dotenv/config'
import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import cors from 'cors'
import admin from 'firebase-admin'
import { verifyAuth } from './middleware/auth.js'
import parseUrlRouter from './routes/parseUrl.js'
import aiRouter from './routes/ai.js'
import executeRouter from './routes/execute.js'
import libraryRouter from './routes/library.js'

const app = express()
const httpServer = createServer(app)
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
app.use(express.json({ limit: '20mb' }))
app.use('/uploads', express.static('uploads'))

app.get('/health', (_req, res) => res.json({ status: 'ok' }))

app.use('/api/parse-url', verifyAuth, parseUrlRouter)
app.use('/api/ai', verifyAuth, aiRouter)
app.use('/api/execute', verifyAuth, executeRouter)
app.use('/api/library', verifyAuth, libraryRouter)

app.use((err, _req, res, _next) => {
  console.error(err)
  res.status(500).json({ error: 'Internal server error' })
})

const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true,
  },
})

// Store user socket mapping for invites
const userSockets = new Map()

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id)

  // User Authentication / Registration for Invites
  socket.on('register', (uid) => {
    if (uid) {
      userSockets.set(uid, socket.id)
      socket.uid = uid
      console.log(`User ${uid} registered with socket ${socket.id}`)
    }
  })

  // Room Management
  socket.on('join-room', (payload) => {
    let roomId = payload
    let userInfo = { uid: socket.uid || socket.id, name: 'Peer' }
    if (typeof payload === 'object' && payload !== null) {
      roomId = payload.roomId
      if (payload.user) userInfo = payload.user
    }
    socket.join(roomId)
    console.log(`Socket ${socket.id} joined room ${roomId}`)
    // Notify others in room
    socket.to(roomId).emit('user-joined', userInfo)
  })

  socket.on('user-announce', ({ roomId, user }) => {
    socket.to(roomId).emit('user-announce-receive', user)
  })

  socket.on('contrib-sync', ({ roomId, user, points, action }) => {
    socket.to(roomId).emit('contrib-receive', { user, points, action })
  })

  socket.on('leave-room', (roomId) => {
    socket.leave(roomId)
    socket.to(roomId).emit('user-left', socket.uid || socket.id)
  })

  // Code Sync
  socket.on('code-change', ({ roomId, code }) => {
    socket.to(roomId).emit('code-update', code)
  })

  // Note Sync
  socket.on('note-add', ({ roomId, note, user }) => {
    socket.to(roomId).emit('note-receive', note)
    if (user) {
      socket.to(roomId).emit('contrib-receive', { user, points: 10, action: 'note' })
    }
  })

  // Video Sync
  socket.on('video-sync', ({ roomId, state }) => {
    socket.to(roomId).emit('video-update', state)
  })

  // Invite System
  socket.on('send-invite', ({ toUid, fromName, roomId }) => {
    const targetSocket = userSockets.get(toUid)
    if (targetSocket) {
      io.to(targetSocket).emit('receive-invite', { fromName, roomId })
    }
  })

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id)
    if (socket.uid) {
      userSockets.delete(socket.uid)
    }
  })
})

httpServer.listen(PORT, () => {
  console.log(`PlacementTracker API running on port ${PORT}`)
})
