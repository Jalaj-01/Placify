import { useState, useEffect, useRef, useCallback } from 'react'
import { useSocket } from '@/hooks/useSocket'
import {
  subscribeNotebooks,
  saveNotebook as firestoreSaveNotebook,
  deleteNotebook as firestoreDeleteNotebook,
  subscribeSharedNotebook,
  saveSharedNotebook as firestoreSaveSharedNotebook,
  findUserByEmail,
} from '@/services/firestoreService'

const LOCAL_STORAGE_KEY = 'placify_notebooks'

const SEED_NOTEBOOKS = [
  {
    id: 'nb-dsa-mastery',
    title: '⚡ DSA Mastery & Algorithm Notes',
    subject: 'DSA',
    paperStyle: 'ruled',
    colorTheme: 'indigo',
    isCollaborative: true,
    collabRoomId: 'nb-dsa-room-1',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    updatedAt: new Date().toISOString(),
    pages: [
      {
        id: 'page-1',
        title: 'Two Pointers & Sliding Window Patterns',
        htmlContent: `<h1>Two Pointers &amp; Sliding Window Analysis</h1>
<p>The <strong>Two Pointers</strong> technique is an efficient algorithmic approach commonly used in arrays, strings, and linked lists to reduce brute-force time complexity from <u>O(N&sup2;) down to linear O(N)</u>.</p>

<h2>1. Key Pattern Recognition</h2>
<p>You should consider using this strategy when encountering:</p>
<ul>
  <li><strong>Sorted Arrays:</strong> Searching for pairs, triplets, or target sums (e.g. 2-Sum II, 3-Sum).</li>
  <li><strong>Contiguous Subarrays:</strong> Tracking running windows of varying or fixed sizes.</li>
  <li><strong>In-place Array Partitioning:</strong> Removing duplicates, moving zeroes, or Dutch National Flag.</li>
</ul>

<blockquote>
  <strong>Golden Rule:</strong> Always determine whether your window is <em>fixed-size</em> (use a simple sliding sum) or <em>dynamically expanding/shrinking</em> (use a while condition on the left pointer)!
</blockquote>

<h2>2. Core Implementation Strategy</h2>
<p>When implementing dynamic sliding window algorithms:</p>
<ol>
  <li>Initialize two pointers: <code>left = 0</code> and <code>right = 0</code>.</li>
  <li>Expand the window by advancing <code>right</code> and incorporating the element.</li>
  <li>While the window condition is violated, shrink from the left by incrementing <code>left</code>.</li>
  <li>Update your global optimal answer (max length, min length, or total count).</li>
</ol>

<h2>3. Collaborative Preparation Checklist</h2>
<ul>
  <li> Solve LeetCode #209: Minimum Size Subarray Sum</li>
  <li> Solve LeetCode #3: Longest Substring Without Repeating Characters</li>
  <li> Review edge cases (empty array, all negative numbers, single element)</li>
  <li> Practice explaining the invariant out loud with your study partner</li>
</ul>`,
      },
      {
        id: 'page-2',
        title: 'Graph Traversals: BFS vs DFS',
        htmlContent: `<h1>Graph Traversals: Breadth-First vs Depth-First Search</h1>
<p>Graph theory represents one of the most fundamental pillars of technical interview rounds at top companies. Understanding traversal patterns ensures confidence across trees, grids, and general graphs.</p>

<h2>1. Breadth-First Search (BFS)</h2>
<p>BFS traverses level-by-level using an auxiliary <strong>Queue (FIFO)</strong>. It is optimal for finding the <u>shortest path in unweighted graphs</u>.</p>
<ul>
  <li><strong>Time Complexity:</strong> O(V + E)</li>
  <li><strong>Space Complexity:</strong> O(V) for the queue and visited set.</li>
  <li><strong>Common Applications:</strong> Shortest distance in matrices (e.g., Rotten Oranges, Word Ladder).</li>
</ul>

<blockquote>
  <strong>Caution:</strong> Always mark a node as <em>visited immediately when pushing to the queue</em>, not when popping, to avoid duplicate additions and exponential memory overhead!
</blockquote>

<h2>2. Depth-First Search (DFS)</h2>
<p>DFS explores as deep as possible along each branch before backtracking using a <strong>Recursion Stack (LIFO)</strong>.</p>
<ul>
  <li><strong>Best for:</strong> Cycle detection in directed graphs, topological sorting, connected components, and pathfinding.</li>
  <li><strong>Key Data Structure:</strong> Visited array / recursion call stack.</li>
</ul>`,
      },
    ],
  },
  {
    id: 'nb-sys-design',
    title: '🏗️ System Design & Distributed Architecture',
    subject: 'System Design',
    paperStyle: 'grid',
    colorTheme: 'emerald',
    isCollaborative: false,
    collabRoomId: 'nb-sys-room-2',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
    pages: [
      {
        id: 'page-sys-1',
        title: 'CAP Theorem & Database Sharding',
        htmlContent: `<h1>CAP Theorem &amp; Modern Distributed Storage</h1>
<p>In distributed computer systems, the <strong>CAP theorem</strong> (Brewer's theorem) states that it is impossible for a distributed data store to simultaneously provide more than two out of the following three guarantees:</p>

<h2>The Three Pillars</h2>
<ul>
  <li><strong>Consistency (C):</strong> Every read receives the most recent write or an error.</li>
  <li><strong>Availability (A):</strong> Every non-failing node returns a reasonable response for any request.</li>
  <li><strong>Partition Tolerance (P):</strong> The system continues to operate despite arbitrary network partitions or dropped packets.</li>
</ul>

<blockquote>
  <strong>Architectural Trade-Off:</strong> Since network partitions are an inevitable physical reality in large distributed systems, one must architect either for <em>Consistency + Partition Tolerance (CP)</em> or <em>Availability + Partition Tolerance (AP)</em>.
</blockquote>

<h2>Database Partitioning &amp; Horizontal Sharding</h2>
<p>When single-node database instances reach memory or I/O limits, horizontal sharding distributes rows across multiple autonomous database instances.</p>
<ul>
  <li><strong>Consistent Hashing:</strong> Minimizes database key reorganizations when nodes are added or removed.</li>
  <li><strong>Replication Factor:</strong> Maintain at least 3 replicas across disparate availability zones.</li>
</ul>`,
      },
    ],
  },
]

const LOCAL_SEEDED_KEY = 'placify_notebooks_seeded'

const getLocalNotebooks = () => {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY)
    if (raw !== null) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) return parsed
    }
    const isSeeded = localStorage.getItem(LOCAL_SEEDED_KEY)
    if (isSeeded === 'true') {
      return []
    }
  } catch (err) {
    console.warn('Failed to parse local notebooks', err)
  }

  // Initial first-time visit: seed sample notebooks
  try {
    localStorage.setItem(LOCAL_SEEDED_KEY, 'true')
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(SEED_NOTEBOOKS))
  } catch {}
  return SEED_NOTEBOOKS
}

const saveLocalNotebooks = (notebooks) => {
  try {
    localStorage.setItem(LOCAL_SEEDED_KEY, 'true')
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(notebooks))
    window.dispatchEvent(new Event('placify_notebooks_changed'))
  } catch (err) {
    console.warn('Failed saving notebooks to localStorage', err)
  }
}

export function useNotebooks(user) {
  const uid = user?.uid
  const userSeededKey = uid ? `placify_notebooks_seeded_${uid}` : LOCAL_SEEDED_KEY
  const socket = useSocket(uid)

  const [notebooks, setNotebooks] = useState(() => getLocalNotebooks())
  const [loading, setLoading] = useState(true)
  const [activeNotebookId, setActiveNotebookId] = useState(() => {
    const list = getLocalNotebooks()
    return list[0]?.id || null
  })
  const [activePageId, setActivePageId] = useState(null)

  // Real-time collaboration states
  const [activeCollaborators, setActiveCollaborators] = useState([])
  const [typingStatus, setTypingStatus] = useState(null)
  const typingTimeoutRef = useRef(null)

  const activeNotebook = notebooks.find((n) => n.id === activeNotebookId) || notebooks[0] || null

  // Ensure activePageId defaults to the first page of active notebook
  useEffect(() => {
    if (activeNotebook && activeNotebook.pages?.length > 0) {
      const pageExists = activeNotebook.pages.some((p) => p.id === activePageId)
      if (!pageExists) {
        setActivePageId(activeNotebook.pages[0].id)
      }
    } else {
      setActivePageId(null)
    }
  }, [activeNotebook, activePageId])

  const activePage = activeNotebook?.pages?.find((p) => p.id === activePageId) || activeNotebook?.pages?.[0] || null

  // Subscribe to user's notebooks in Firestore
  useEffect(() => {
    const handleLocalChange = () => {
      setNotebooks(getLocalNotebooks())
    }
    window.addEventListener('placify_notebooks_changed', handleLocalChange)

    if (!uid) {
      setNotebooks(getLocalNotebooks())
      setLoading(false)
      return () => {
        window.removeEventListener('placify_notebooks_changed', handleLocalChange)
      }
    }

    const unsub = subscribeNotebooks(uid, (firestoreNotebooks) => {
      const isSeeded =
        localStorage.getItem(LOCAL_SEEDED_KEY) === 'true' ||
        localStorage.getItem(userSeededKey) === 'true'

      if (firestoreNotebooks && firestoreNotebooks.length > 0) {
        localStorage.setItem(LOCAL_SEEDED_KEY, 'true')
        if (uid) localStorage.setItem(userSeededKey, 'true')
        setNotebooks(firestoreNotebooks)
        try {
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(firestoreNotebooks))
        } catch {}
      } else {
        if (isSeeded) {
          // User already seeded and deliberately deleted all notebooks. DO NOT re-seed!
          setNotebooks([])
          try {
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify([]))
          } catch {}
        } else {
          // Brand new user visiting Firestore for the first time
          localStorage.setItem(LOCAL_SEEDED_KEY, 'true')
          if (uid) localStorage.setItem(userSeededKey, 'true')
          SEED_NOTEBOOKS.forEach((nb) => {
            firestoreSaveNotebook(uid, nb).catch(() => {})
          })
          setNotebooks(SEED_NOTEBOOKS)
          try {
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(SEED_NOTEBOOKS))
          } catch {}
        }
      }
      setLoading(false)
    })

    return () => {
      unsub()
      window.removeEventListener('placify_notebooks_changed', handleLocalChange)
    }
  }, [uid, userSeededKey])

  // Check URL query parameters for ?room= or ?join= to auto-join collaborative notebook
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const roomParam = params.get('room') || params.get('join')
    if (roomParam) {
      joinSharedNotebook(roomParam).then((res) => {
        if (res?.success) {
          const cleanUrl = window.location.pathname
          window.history.replaceState({}, document.title, cleanUrl)
        }
      })
    }
  }, [])

  // Real-time socket & shared room subscription for active collaborative notebook
  useEffect(() => {
    if (!activeNotebook?.isCollaborative || !activeNotebook?.collabRoomId) {
      setActiveCollaborators([])
      return
    }

    const roomId = activeNotebook.collabRoomId

    // 1. Join Socket.io room for instant sub-millisecond collaboration
    if (socket) {
      socket.emit('notebook-join', {
        roomId,
        user: {
          uid: user?.uid || 'guest',
          name: user?.displayName || 'Teammate',
          photoURL: user?.photoURL || null,
          email: user?.email || '',
        },
      })

      const handleUserJoined = ({ user: peerUser }) => {
        setActiveCollaborators((prev) => {
          const exists = prev.some((p) => p.uid === peerUser.uid)
          if (!exists) return [...prev, peerUser]
          return prev
        })
      }

      const handleUserLeft = ({ uid: peerUid }) => {
        setActiveCollaborators((prev) => prev.filter((p) => p.uid !== peerUid))
      }

      const handleNotebookUpdated = ({ notebook: remoteNb, sender }) => {
        if (sender === uid) return
        setNotebooks((prev) => {
          const updated = prev.map((n) => (n.id === remoteNb.id ? remoteNb : n))
          saveLocalNotebooks(updated)
          return updated
        })
      }

      const handlePageUpdated = ({ pageId, htmlContent, sender }) => {
        if (sender === uid) return
        setNotebooks((prev) => {
          const currentNb = prev.find((n) => n.id === activeNotebook.id)
          if (!currentNb) return prev

          const updatedPages = currentNb.pages.map((p) => {
            if (p.id !== pageId) return p
            return { ...p, htmlContent, updatedAt: new Date().toISOString() }
          })

          const updatedNb = { ...currentNb, pages: updatedPages, updatedAt: new Date().toISOString() }
          const updatedList = prev.map((n) => (n.id === updatedNb.id ? updatedNb : n))
          saveLocalNotebooks(updatedList)
          return updatedList
        })
      }

      const handleTypingStatus = ({ user: peerUser, cellId, isTyping }) => {
        if (isTyping) {
          setTypingStatus({ name: peerUser?.name || 'Peer', cellId })
          if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
          typingTimeoutRef.current = setTimeout(() => setTypingStatus(null), 3000)
        } else {
          setTypingStatus(null)
        }
      }

      socket.on('notebook-user-joined', handleUserJoined)
      socket.on('notebook-user-left', handleUserLeft)
      socket.on('notebook-updated', handleNotebookUpdated)
      socket.on('notebook-page-updated', handlePageUpdated)
      socket.on('notebook-typing-status', handleTypingStatus)

      return () => {
        socket.emit('notebook-leave', { roomId, user })
        socket.off('notebook-user-joined', handleUserJoined)
        socket.off('notebook-user-left', handleUserLeft)
        socket.off('notebook-updated', handleNotebookUpdated)
        socket.off('notebook-page-updated', handlePageUpdated)
        socket.off('notebook-typing-status', handleTypingStatus)
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
      }
    }
  }, [socket, activeNotebook?.id, activeNotebook?.isCollaborative, activeNotebook?.collabRoomId, uid, user])

  // Save notebook helper
  const persistNotebook = useCallback(
    async (updatedNb) => {
      const updatedList = notebooks.map((n) => (n.id === updatedNb.id ? updatedNb : n))
      setNotebooks(updatedList)
      saveLocalNotebooks(updatedList)

      // Sync Firestore personal copy
      if (uid) {
        try {
          await firestoreSaveNotebook(uid, updatedNb)
        } catch (err) {
          console.warn('Failed saving notebook to Firestore', err)
        }
      }

      // Sync shared document & socket broadcast if collaborative
      if (updatedNb.isCollaborative && updatedNb.collabRoomId) {
        try {
          await firestoreSaveSharedNotebook(updatedNb.collabRoomId, updatedNb)
        } catch (err) {
          console.warn('Failed saving shared notebook document', err)
        }

        if (socket) {
          socket.emit('notebook-sync', {
            roomId: updatedNb.collabRoomId,
            notebook: updatedNb,
            sender: uid,
          })
        }
      }
    },
    [notebooks, uid, socket]
  )

  // ── Notebook Operations ──

  const createNotebook = async (data = {}) => {
    const newId = `nb-${Date.now()}`
    const roomId = `collab-${Math.random().toString(36).substring(2, 8)}`

    const newNotebook = {
      id: newId,
      title: data.title?.trim() || 'Untitled Notebook',
      subject: data.subject || 'DSA',
      paperStyle: data.paperStyle || 'ruled',
      colorTheme: data.colorTheme || 'indigo',
      isCollaborative: !!data.isCollaborative,
      collabRoomId: roomId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      pages: [
        {
          id: `page-${Date.now()}`,
          title: 'Page 1',
          htmlContent: '',
          cells: [],
        },
      ],
    }

    const updatedList = [newNotebook, ...notebooks]
    setNotebooks(updatedList)
    saveLocalNotebooks(updatedList)
    setActiveNotebookId(newId)
    setActivePageId(newNotebook.pages[0].id)

    if (uid) {
      await firestoreSaveNotebook(uid, newNotebook).catch(() => {})
    }
    if (newNotebook.isCollaborative) {
      await firestoreSaveSharedNotebook(roomId, newNotebook).catch(() => {})
    }

    return newNotebook
  }

  const updateNotebook = async (notebookId, updates) => {
    const current = notebooks.find((n) => n.id === notebookId)
    if (!current) return
    const updatedNb = {
      ...current,
      ...updates,
      updatedAt: new Date().toISOString(),
    }
    await persistNotebook(updatedNb)
  }

  const deleteNotebook = async (notebookId) => {
    localStorage.setItem(LOCAL_SEEDED_KEY, 'true')
    if (uid) localStorage.setItem(userSeededKey, 'true')

    const updatedList = notebooks.filter((n) => n.id !== notebookId)
    setNotebooks(updatedList)
    saveLocalNotebooks(updatedList)

    if (activeNotebookId === notebookId) {
      setActiveNotebookId(updatedList[0]?.id || null)
    }

    if (uid) {
      await firestoreDeleteNotebook(uid, notebookId).catch(() => {})
    }
  }

  // ── Page Operations ──

  const addPage = async (notebookId, title = 'New Page') => {
    const nb = notebooks.find((n) => n.id === notebookId)
    if (!nb) return

    const newPage = {
      id: `page-${Date.now()}`,
      title: title.trim() || `Page ${nb.pages.length + 1}`,
      htmlContent: '',
      cells: [],
    }

    const updatedNb = {
      ...nb,
      pages: [...nb.pages, newPage],
      updatedAt: new Date().toISOString(),
    }

    await persistNotebook(updatedNb)
    setActivePageId(newPage.id)
  }

  const deletePage = async (notebookId, pageId) => {
    const nb = notebooks.find((n) => n.id === notebookId)
    if (!nb || nb.pages.length <= 1) return // Keep at least one page

    const updatedPages = nb.pages.filter((p) => p.id !== pageId)
    const updatedNb = {
      ...nb,
      pages: updatedPages,
      updatedAt: new Date().toISOString(),
    }

    await persistNotebook(updatedNb)
    if (activePageId === pageId) {
      setActivePageId(updatedPages[0]?.id || null)
    }
  }

  const renamePage = async (notebookId, pageId, newTitle) => {
    const nb = notebooks.find((n) => n.id === notebookId)
    if (!nb) return

    const updatedPages = nb.pages.map((p) => (p.id === pageId ? { ...p, title: newTitle } : p))
    const updatedNb = { ...nb, pages: updatedPages, updatedAt: new Date().toISOString() }
    await persistNotebook(updatedNb)
  }

  // ── Rich Text HTML Content Update ──

  const updatePageContent = async (notebookId, pageId, htmlContent) => {
    const nb = notebooks.find((n) => n.id === notebookId)
    if (!nb) return

    const updatedPages = nb.pages.map((p) =>
      p.id === pageId ? { ...p, htmlContent, updatedAt: new Date().toISOString() } : p
    )
    const updatedNb = { ...nb, pages: updatedPages, updatedAt: new Date().toISOString() }

    await persistNotebook(updatedNb)

    // Broadcast live over socket to room
    if (nb.isCollaborative && nb.collabRoomId && socket) {
      socket.emit('notebook-page-update', {
        roomId: nb.collabRoomId,
        pageId,
        htmlContent,
        sender: uid,
      })
    }
  }

  // ── Join Shared Notebook with Room Code ──

  const joinSharedNotebook = async (roomCode) => {
    if (!roomCode?.trim()) return { success: false, error: 'Please enter a valid Room Code' }
    const cleanCode = roomCode.trim()

    // 1. Check if notebook already in local state
    const existing = notebooks.find((n) => n.collabRoomId === cleanCode)
    if (existing) {
      setActiveNotebookId(existing.id)
      return { success: true, notebook: existing }
    }

    // 2. Fetch shared notebook from Firestore
    return new Promise((resolve) => {
      const unsub = subscribeSharedNotebook(cleanCode, async (sharedData) => {
        unsub()
        if (sharedData) {
          const joinedNotebook = {
            ...sharedData,
            id: sharedData.id || `nb-joined-${Date.now()}`,
            isCollaborative: true,
            collabRoomId: cleanCode,
          }

          const updatedList = [joinedNotebook, ...notebooks.filter((n) => n.id !== joinedNotebook.id)]
          setNotebooks(updatedList)
          saveLocalNotebooks(updatedList)
          setActiveNotebookId(joinedNotebook.id)

          if (uid) {
            await firestoreSaveNotebook(uid, joinedNotebook).catch(() => {})
          }

          resolve({ success: true, notebook: joinedNotebook })
        } else {
          // If no shared document yet, create a fresh collaborative room with this ID
          const freshNotebook = await createNotebook({
            title: `Shared Collab #${cleanCode}`,
            subject: 'DSA',
            isCollaborative: true,
            collabRoomId: cleanCode,
          })
          resolve({ success: true, notebook: freshNotebook })
        }
      })
    })
  }

  // ── Send Peer Invite ──

  const sendPeerInvite = async (email, notebookTitle, roomId) => {
    if (!email?.trim() || !socket) return { success: false, error: 'Email and socket required' }

    try {
      const targetUser = await findUserByEmail(email.trim())
      if (!targetUser || !targetUser.uid) {
        return { success: false, error: 'User not found. Please ensure they have a Placify account.' }
      }

      if (targetUser.uid === uid) {
        return { success: false, error: 'You cannot invite yourself.' }
      }

      socket.emit('send-invite', {
        toUid: targetUser.uid,
        fromName: user?.displayName || 'Teammate',
        roomId,
        type: 'notebook',
        title: notebookTitle || 'Collaborative Notebook',
      })

      return { success: true, targetUser }
    } catch (err) {
      return { success: false, error: err.message || 'Failed to locate user' }
    }
  }

  // ── Emit typing status ──

  const emitTyping = (pageId, isTyping = true) => {
    if (!activeNotebook?.isCollaborative || !activeNotebook?.collabRoomId || !socket) return
    socket.emit('notebook-typing', {
      roomId: activeNotebook.collabRoomId,
      user: { uid, name: user?.displayName || 'Peer' },
      cellId: pageId,
      isTyping,
    })
  }

  return {
    notebooks,
    loading,
    activeNotebook,
    activeNotebookId,
    setActiveNotebookId,
    activePage,
    activePageId,
    setActivePageId,
    activeCollaborators,
    typingStatus,
    createNotebook,
    updateNotebook,
    deleteNotebook,
    addPage,
    deletePage,
    renamePage,
    updatePageContent,
    joinSharedNotebook,
    sendPeerInvite,
    emitTyping,
  }
}
