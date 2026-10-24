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
import assessmentsRouter from './routes/assessments.js'

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
app.use('/api/assessments', verifyAuth, assessmentsRouter)

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

// Store user socket mapping for invites (key -> Set of socket IDs)
const userSockets = new Map()

const addSocketMapping = (key, socketId) => {
  if (!key) return
  const cleanKey = String(key).trim().toLowerCase()
  if (!userSockets.has(cleanKey)) userSockets.set(cleanKey, new Set())
  userSockets.get(cleanKey).add(socketId)
}

const removeSocketMapping = (key, socketId) => {
  if (!key) return
  const cleanKey = String(key).trim().toLowerCase()
  if (userSockets.has(cleanKey)) {
    const set = userSockets.get(cleanKey)
    set.delete(socketId)
    if (set.size === 0) userSockets.delete(cleanKey)
  }
}

// Store active collaborative notebook states in memory
const notebookCache = new Map()

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id)

  // User Authentication / Registration for Invites
  socket.on('register', (payload) => {
    if (typeof payload === 'string' && payload) {
      addSocketMapping(payload, socket.id)
      socket.uid = payload
      console.log(`User ${payload} registered with socket ${socket.id}`)
    } else if (payload && typeof payload === 'object') {
      const { uid, email } = payload
      if (uid) {
        addSocketMapping(uid, socket.id)
        socket.uid = uid
      }
      if (email) {
        addSocketMapping(email, socket.id)
        socket.email = email
      }
      console.log(`User ${uid || ''} (${email || ''}) registered with socket ${socket.id}`)
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

  // ─── Unified Share & Invite System ────────────────────────
  const routeShareOrInvite = (event, payload) => {
    const { toUid, toEmail, fromName, roomId, type = 'study', itemType = null, itemData = null, title = '' } = payload || {}
    const cleanEmail = toEmail ? String(toEmail).trim().toLowerCase() : null
    const cleanUid = toUid ? String(toUid).trim().toLowerCase() : null
    const targetSocketIds = new Set()

    if (cleanUid && userSockets.has(cleanUid)) {
      userSockets.get(cleanUid).forEach((id) => targetSocketIds.add(id))
    }
    if (cleanEmail && userSockets.has(cleanEmail)) {
      userSockets.get(cleanEmail).forEach((id) => targetSocketIds.add(id))
    }

    console.log(`[${event}] routing to ${cleanEmail || cleanUid}: found ${targetSocketIds.size} socket(s)`)

    const outboundPayload = {
      fromName: fromName || 'Peer',
      roomId: roomId || null,
      type: itemType || type,
      itemType: itemType || type,
      itemData: itemData || null,
      title: title || '',
      timestamp: Date.now(),
    }

    targetSocketIds.forEach((targetSocket) => {
      io.to(targetSocket).emit('receive-invite', outboundPayload)
      io.to(targetSocket).emit('receive-share', outboundPayload)
    })
  }

  socket.on('send-invite', (payload) => routeShareOrInvite('send-invite', payload))
  socket.on('send-share', (payload) => routeShareOrInvite('send-share', payload))

  // ─── Collaborative Notebook Real-time Events ───────────────
  socket.on('notebook-join', ({ roomId, user }) => {
    const cleanRoom = (roomId || '').trim().replace(/^#+/, '').toLowerCase()
    const roomName = `notebook-${cleanRoom}`
    socket.join(roomName)
    console.log(`Socket ${socket.id} joined notebook room ${roomName}`)

    // If server has cached notebook, emit immediately to the new joiner
    const cached = notebookCache.get(cleanRoom) ||
      notebookCache.get(`collab-${cleanRoom}`) ||
      notebookCache.get(cleanRoom.replace(/^collab-/, ''))
    if (cached) {
      socket.emit('notebook-updated', { notebook: cached, sender: 'server-cache' })
    }

    // Request fresh state from peers in room
    socket.to(roomName).emit('notebook-request-state', { requesterId: socket.id })

    socket.to(roomName).emit('notebook-user-joined', {
      user: user || { uid: socket.uid || socket.id, name: 'Collaborator' },
      socketId: socket.id,
    })
  })

  socket.on('notebook-request-state', ({ roomId }) => {
    const cleanRoom = (roomId || '').trim().replace(/^#+/, '').toLowerCase()
    const roomName = `notebook-${cleanRoom}`
    const cached = notebookCache.get(cleanRoom) ||
      notebookCache.get(`collab-${cleanRoom}`) ||
      notebookCache.get(cleanRoom.replace(/^collab-/, ''))
    if (cached) {
      socket.emit('notebook-updated', { notebook: cached, sender: 'server-cache' })
    }
    socket.to(roomName).emit('notebook-request-state', { requesterId: socket.id })
  })

  socket.on('notebook-leave', ({ roomId, user }) => {
    const cleanRoom = (roomId || '').trim().replace(/^#+/, '').toLowerCase()
    const roomName = `notebook-${cleanRoom}`
    socket.leave(roomName)
    socket.to(roomName).emit('notebook-user-left', {
      uid: user?.uid || socket.uid || socket.id,
    })
  })

  socket.on('notebook-sync', ({ roomId, notebook, sender }) => {
    const cleanRoom = (roomId || '').trim().replace(/^#+/, '').toLowerCase()
    if (cleanRoom && notebook) {
      notebookCache.set(cleanRoom, notebook)
      if (cleanRoom.startsWith('collab-')) {
        notebookCache.set(cleanRoom.replace(/^collab-/, ''), notebook)
      } else {
        notebookCache.set(`collab-${cleanRoom}`, notebook)
      }
    }
    const roomName = `notebook-${cleanRoom}`
    socket.to(roomName).emit('notebook-updated', { notebook, sender })
  })

  socket.on('notebook-cell-update', ({ roomId, pageId, cellId, updates, sender }) => {
    const cleanRoom = (roomId || '').trim().replace(/^#+/, '').toLowerCase()
    const roomName = `notebook-${cleanRoom}`
    socket.to(roomName).emit('notebook-cell-updated', { pageId, cellId, updates, sender })
  })

  socket.on('notebook-page-update', ({ roomId, pageId, htmlContent, sender }) => {
    const cleanRoom = (roomId || '').trim().replace(/^#+/, '').toLowerCase()
    const roomName = `notebook-${cleanRoom}`
    socket.to(roomName).emit('notebook-page-updated', { pageId, htmlContent, sender })
  })

  socket.on('notebook-code-run', ({ roomId, cellId, output, sender }) => {
    const cleanRoom = (roomId || '').trim().replace(/^#+/, '').toLowerCase()
    const roomName = `notebook-${cleanRoom}`
    socket.to(roomName).emit('notebook-code-result', { cellId, output, sender })
  })

  socket.on('notebook-typing', ({ roomId, user, cellId, isTyping }) => {
    const cleanRoom = (roomId || '').trim().replace(/^#+/, '').toLowerCase()
    const roomName = `notebook-${cleanRoom}`
    socket.to(roomName).emit('notebook-typing-status', { user, cellId, isTyping })
  })

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id)
    if (socket.uid) {
      removeSocketMapping(socket.uid, socket.id)
    }
    if (socket.email) {
      removeSocketMapping(socket.email, socket.id)
    }
  })
})

httpServer.listen(PORT, () => {
  console.log(`PlacementTracker API running on port ${PORT}`)
})
