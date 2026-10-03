import { useState, useEffect, useRef, useCallback } from 'react'
import { useSocket } from '@/hooks/useSocket'
import {
  subscribeNotebooks,
  saveNotebook as firestoreSaveNotebook,
  deleteNotebook as firestoreDeleteNotebook,
  subscribeSharedNotebook,
  fetchSharedNotebook,
  saveSharedNotebook as firestoreSaveSharedNotebook,
  findUserByEmail,
  sendUserInvite,
  shareItem,
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

export const normalizeRoomId = (roomId) => {
  if (!roomId) return ''
  const clean = String(roomId).trim().replace(/^#+/, '').toLowerCase()
  return clean.startsWith('collab-') ? clean : `collab-${clean}`
}

export const deduplicateNotebooks = (list) => {
  if (!Array.isArray(list)) return []
  const seenRooms = new Set()
  const seenIds = new Set()
  const seenTitles = new Set()
  const result = []

  for (const nb of list) {
    if (!nb) continue
    const canonicalRoom = nb.collabRoomId ? normalizeRoomId(nb.collabRoomId) : null
    const idKey = (nb.id || '').toLowerCase()
    const cleanTitle = (nb.title || '').trim().toLowerCase()
    const isSeed =
      idKey === 'nb-dsa-mastery' ||
      idKey === 'nb-sys-design' ||
      cleanTitle.includes('dsa mastery') ||
      cleanTitle.includes('system design')

    // 1. Collab room deduplication
    if (canonicalRoom) {
      if (seenRooms.has(canonicalRoom)) continue
      seenRooms.add(canonicalRoom)
      if (idKey) seenIds.add(idKey)
      if (cleanTitle) seenTitles.add(`${cleanTitle}_${nb.subject || ''}`)
      result.push({
        ...nb,
        collabRoomId: canonicalRoom,
      })
      continue
    }

    // 2. ID deduplication
    if (idKey) {
      if (seenIds.has(idKey)) continue
      seenIds.add(idKey)
    }

    // 3. Seed / Duplicate title deduplication (eliminates the cloned 102 notebooks)
    if (isSeed || nb.isCollaborative) {
      const titleKey = `${cleanTitle}_${nb.subject || ''}`
      if (cleanTitle && seenTitles.has(titleKey)) continue
      if (cleanTitle) seenTitles.add(titleKey)
    }

    result.push(nb)
  }
  return result
}

const getLocalNotebooks = () => {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY)
    if (raw !== null) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) return deduplicateNotebooks(parsed)
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
    const deduped = deduplicateNotebooks(notebooks)
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(deduped))
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
    try {
      const storedActiveId = localStorage.getItem('placify_active_notebook_id')
      const list = getLocalNotebooks()
      if (storedActiveId && list.some((n) => n.id === storedActiveId)) {
        return storedActiveId
      }
      return list[0]?.id || null
    } catch {
      return null
    }
  })
  const [activePageId, setActivePageId] = useState(null)

  useEffect(() => {
    if (activeNotebookId) {
      try {
        localStorage.setItem('placify_active_notebook_id', activeNotebookId)
      } catch {}
    }
  }, [activeNotebookId])

  // Real-time collaboration states
  const [activeCollaborators, setActiveCollaborators] = useState([])
  const [typingStatus, setTypingStatus] = useState(null)
  const typingTimeoutRef = useRef(null)

  const activeNotebook = notebooks.find((n) => n.id === activeNotebookId) || notebooks[0] || null

  // Maintain activePageId when switching notebooks or on initial load
  const prevNotebookIdRef = useRef(activeNotebook?.id)
  useEffect(() => {
    if (!activeNotebook) {
      setActivePageId(null)
      return
    }

    // When notebook changes to another notebook, select its first page
    if (prevNotebookIdRef.current !== activeNotebook.id) {
      prevNotebookIdRef.current = activeNotebook.id
      setActivePageId(activeNotebook.pages?.[0]?.id || null)
      return
    }

    // On initial load or if activePageId is unset, default to the first page
    if (!activePageId && activeNotebook.pages?.length > 0) {
      setActivePageId(activeNotebook.pages[0].id)
    }
  }, [activeNotebook?.id, activeNotebook?.pages, activePageId])

  const activePage = activeNotebook?.pages?.find((p) => p.id === activePageId) || activeNotebook?.pages?.[0] || null

  // Subscribe to external storage changes across tabs
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (!e || e.key === LOCAL_STORAGE_KEY) {
        setNotebooks(getLocalNotebooks())
      }
    }
    window.addEventListener('storage', handleStorageChange)
    return () => {
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [])

  // Instant in-window notification when an invite is accepted from InvitesDrawer
  useEffect(() => {
    const handleAccepted = (e) => {
      const acceptedNb = e.detail
      if (!acceptedNb) return
      setNotebooks((prev) => {
        const merged = deduplicateNotebooks([acceptedNb, ...prev])
        saveLocalNotebooks(merged)
        return merged
      })
      if (acceptedNb.id) {
        setActiveNotebookId(acceptedNb.id)
        if (acceptedNb.pages?.[0]?.id) {
          setActivePageId(acceptedNb.pages[0].id)
        }
      }
    }
    window.addEventListener('placify_notebook_accepted', handleAccepted)
    return () => {
      window.removeEventListener('placify_notebook_accepted', handleAccepted)
    }
  }, [])

  // Subscribe to user's notebooks in Firestore
  useEffect(() => {
    if (!uid) {
      setNotebooks(getLocalNotebooks())
      setLoading(false)
      return
    }

    const unsub = subscribeNotebooks(uid, (firestoreNotebooks) => {
      const isSeeded =
        localStorage.getItem(LOCAL_SEEDED_KEY) === 'true' ||
        localStorage.getItem(userSeededKey) === 'true'

      if (firestoreNotebooks && firestoreNotebooks.length > 0) {
        localStorage.setItem(LOCAL_SEEDED_KEY, 'true')
        if (uid) localStorage.setItem(userSeededKey, 'true')
        setNotebooks((current) => {
          // Merge firestoreNotebooks intelligently with local current
          const mergedFirestore = firestoreNotebooks.map((fn) => {
            const local = current.find((c) => c.id === fn.id)
            if (!local) return fn
            const localTime = new Date(local.updatedAt || 0).getTime()
            const firestoreTime = new Date(fn.updatedAt || 0).getTime()
            if (localTime > firestoreTime || (local.pages?.length || 0) > (fn.pages?.length || 0)) {
              return local
            }
            return fn
          })
          const collabNotebooks = current.filter(
            (n) =>
              n.isCollaborative &&
              !mergedFirestore.some((fn) => {
                const r1 = normalizeRoomId(fn.collabRoomId)
                const r2 = normalizeRoomId(n.collabRoomId)
                return fn.id === n.id || (r1 && r2 && r1 === r2)
              })
          )
          const merged = deduplicateNotebooks([...collabNotebooks, ...mergedFirestore])

          // AUTOMATIC FIRESTORE CLEANUP:
          // If Firestore contains orphaned duplicate notebook documents from previous loops,
          // permanently delete them so the user never gets 102 notebooks again!
          const keptIds = new Set(merged.map((n) => n.id))
          const duplicateDocs = firestoreNotebooks.filter((fn) => !keptIds.has(fn.id))
          if (duplicateDocs.length > 0) {
            duplicateDocs.forEach((d) => {
              firestoreDeleteNotebook(uid, d.id).catch(() => {})
            })
          }

          try {
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(merged))
          } catch {}
          return merged
        })
      } else {
        if (isSeeded) {
          setNotebooks((current) => {
            const collabNotebooks = deduplicateNotebooks(current.filter((n) => n.isCollaborative))
            try {
              localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(collabNotebooks))
            } catch {}
            return collabNotebooks
          })
        } else {
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
    }
  }, [uid, userSeededKey])

  // Real-time Firestore subscription for active collaborative notebook (guarantees live sync across all devices)
  useEffect(() => {
    if (!activeNotebook?.collabRoomId) return

    const roomId = normalizeRoomId(activeNotebook.collabRoomId)

    const unsubFirestore = subscribeSharedNotebook(roomId, (remoteNb) => {
      if (!remoteNb || (!remoteNb.pages?.length && !remoteNb.title)) return

      setNotebooks((prev) => {
        const canonicalRoom = normalizeRoomId(roomId)
        const existingIndex = prev.findIndex(
          (n) =>
            (n.collabRoomId && normalizeRoomId(n.collabRoomId) === canonicalRoom) ||
            n.id === remoteNb.id
        )

        let updatedList
        if (existingIndex >= 0) {
          const currentNb = prev[existingIndex]
          // AVOID NO-OP RE-RENDER LOOPS
          const currentUpdated = currentNb.updatedAt || ''
          const remoteUpdated = remoteNb.updatedAt || ''
          const currentPagesCount = currentNb.pages?.length || 0
          const remotePagesCount = remoteNb.pages?.length || 0
          const currentFirstHtml = currentNb.pages?.[0]?.htmlContent || ''
          const remoteFirstHtml = remoteNb.pages?.[0]?.htmlContent || ''

          if (
            currentUpdated && remoteUpdated &&
            currentUpdated === remoteUpdated &&
            currentPagesCount === remotePagesCount &&
            currentFirstHtml === remoteFirstHtml &&
            currentNb.title === remoteNb.title
          ) {
            return prev
          }

          const updatedNb = {
            ...currentNb,
            ...remoteNb,
            id: currentNb.id,
            collabRoomId: canonicalRoom,
            pages: (remoteNb.pages && remoteNb.pages.length > 0) ? remoteNb.pages : currentNb.pages,
          }
          updatedList = prev.map((n, idx) => (idx === existingIndex ? updatedNb : n))
        } else {
          // Add remote notebook so collaborator sees it immediately with stable canonical ID
          const newNb = {
            ...remoteNb,
            id: remoteNb.id || `nb-${canonicalRoom}`,
            collabRoomId: canonicalRoom,
            isCollaborative: true,
          }
          updatedList = [newNb, ...prev]
        }

        const deduped = deduplicateNotebooks(updatedList)
        try {
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(deduped))
        } catch {}
        return deduped
      })
    })

    return () => {
      if (typeof unsubFirestore === 'function') unsubFirestore()
    }
  }, [activeNotebook?.collabRoomId])

  // Real-time socket & shared room subscription for active collaborative notebook
  useEffect(() => {
    if (!activeNotebook?.collabRoomId) {
      setActiveCollaborators([])
      return
    }

    const rawRoom = activeNotebook.collabRoomId.trim().replace(/^#+/, '').toLowerCase()
    const roomId = rawRoom.startsWith('collab-') ? rawRoom : `collab-${rawRoom}`

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
        // Host immediately syncs full notebook state to newly joined peer
        if (activeNotebook) {
          socket.emit('notebook-sync', {
            roomId,
            notebook: activeNotebook,
            sender: uid,
          })
        }
      }

      const handleRequestState = () => {
        if (activeNotebook) {
          socket.emit('notebook-sync', {
            roomId,
            notebook: activeNotebook,
            sender: uid,
          })
        }
      }

      const handleUserLeft = ({ uid: peerUid }) => {
        setActiveCollaborators((prev) => prev.filter((p) => p.uid !== peerUid))
      }

      const handleNotebookUpdated = ({ notebook: remoteNb, sender }) => {
        if (sender === uid || !remoteNb) return
        setNotebooks((prev) => {
          const currentNb = prev.find(
            (n) =>
              n.id === activeNotebook.id ||
              n.id === remoteNb.id ||
              n.collabRoomId?.trim().replace(/^#+/, '').toLowerCase() === roomId
          )
          if (!currentNb) return prev

          const updatedNb = {
            ...currentNb,
            ...remoteNb,
            id: currentNb.id,
            collabRoomId: roomId,
          }
          const updated = prev.map((n) => (n.id === currentNb.id ? updatedNb : n))
          saveLocalNotebooks(updated)
          return updated
        })
      }

      const handlePageUpdated = ({ pageId, htmlContent, sender }) => {
        if (sender === uid) return
        setNotebooks((prev) => {
          const currentNb = prev.find(
            (n) =>
              n.id === activeNotebook.id ||
              n.collabRoomId?.trim().replace(/^#+/, '').toLowerCase() === roomId
          )
          if (!currentNb) return prev

          const updatedPages = currentNb.pages.map((p) => {
            if (p.id !== pageId) return p
            return { ...p, htmlContent, updatedAt: new Date().toISOString() }
          })

          const updatedNb = { ...currentNb, pages: updatedPages, updatedAt: new Date().toISOString() }
          const updatedList = prev.map((n) => (n.id === currentNb.id ? updatedNb : n))
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
      socket.on('notebook-request-state', handleRequestState)
      socket.on('notebook-user-left', handleUserLeft)
      socket.on('notebook-updated', handleNotebookUpdated)
      socket.on('notebook-page-updated', handlePageUpdated)
      socket.on('notebook-typing-status', handleTypingStatus)

      return () => {
        socket.emit('notebook-leave', { roomId, user })
        socket.off('notebook-user-joined', handleUserJoined)
        socket.off('notebook-request-state', handleRequestState)
        socket.off('notebook-user-left', handleUserLeft)
        socket.off('notebook-updated', handleNotebookUpdated)
        socket.off('notebook-page-updated', handlePageUpdated)
        socket.off('notebook-typing-status', handleTypingStatus)
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
      }
    }
  }, [socket, activeNotebook?.id, activeNotebook?.collabRoomId, uid, user])

  const firestoreSaveDebounceRef = useRef({})

  const debouncedFirestoreSave = useCallback((notebook) => {
    if (!notebook?.id) return
    const key = notebook.id
    if (firestoreSaveDebounceRef.current[key]) {
      clearTimeout(firestoreSaveDebounceRef.current[key])
    }
    firestoreSaveDebounceRef.current[key] = setTimeout(() => {
      delete firestoreSaveDebounceRef.current[key]
      if (uid) {
        firestoreSaveNotebook(uid, notebook).catch(() => {})
      }
      if (notebook.collabRoomId) {
        const cleanRoom = normalizeRoomId(notebook.collabRoomId)
        firestoreSaveSharedNotebook(cleanRoom, notebook).catch(() => {})
      }
    }, 800)
  }, [uid])

  // Save notebook helper
  const persistNotebook = useCallback(
    async (updatedNb) => {
      setNotebooks((current) => {
        const updatedList = current.map((n) => (n.id === updatedNb.id ? updatedNb : n))
        saveLocalNotebooks(updatedList)
        return updatedList
      })

      // Debounce heavy cloud storage writes so rapid keystrokes don't flood Firestore or cause OOM
      debouncedFirestoreSave(updatedNb)

      // Broadcast lightweight live socket update immediately
      if (updatedNb.collabRoomId && socket) {
        const roomId = normalizeRoomId(updatedNb.collabRoomId)
        socket.emit('notebook-sync', {
          roomId,
          notebook: updatedNb,
          sender: uid,
        })
      }
    },
    [uid, socket, debouncedFirestoreSave]
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
      collabRoomId: data.collabRoomId || roomId,
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
    if (newNotebook.isCollaborative && newNotebook.collabRoomId) {
      await firestoreSaveSharedNotebook(newNotebook.collabRoomId, newNotebook).catch(() => {})
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

  const addPage = (notebookId, title = '') => {
    const targetId = notebookId || activeNotebookId || activeNotebook?.id
    const nb = notebooks.find((n) => n.id === targetId)
    if (!nb) return null

    const nextNumber = (nb.pages?.length || 0) + 1
    const pageTitle = (!title || title === 'New Page') ? `Page ${nextNumber}` : title.trim()

    const newPage = {
      id: `page-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      title: pageTitle,
      htmlContent: '',
      cells: [],
    }

    const updatedNb = {
      ...nb,
      pages: [...(nb.pages || []), newPage],
      updatedAt: new Date().toISOString(),
    }

    // 1. Immediately switch activePageId to the new page (0ms instant navigation)
    setActivePageId(newPage.id)

    // 2. Immediately update in-memory notebooks and localStorage
    const updatedList = notebooks.map((n) => (n.id === updatedNb.id ? updatedNb : n))
    setNotebooks(updatedList)
    saveLocalNotebooks(updatedList)

    // 3. Asynchronously sync to cloud in background without blocking UI
    persistNotebook(updatedNb).catch((err) => {
      console.warn('Failed saving new page to cloud', err)
    })

    return newPage
  }

  const deletePage = async (notebookId, pageId) => {
    const targetId = notebookId || activeNotebookId || activeNotebook?.id
    const nb = notebooks.find((n) => n.id === targetId)
    if (!nb || nb.pages.length <= 1) return // Keep at least one page

    const updatedPages = nb.pages.filter((p) => p.id !== pageId)
    const updatedNb = {
      ...nb,
      pages: updatedPages,
      updatedAt: new Date().toISOString(),
    }

    if (activePageId === pageId) {
      setActivePageId(updatedPages[0]?.id || null)
    }

    const updatedList = notebooks.map((n) => (n.id === updatedNb.id ? updatedNb : n))
    setNotebooks(updatedList)
    saveLocalNotebooks(updatedList)

    persistNotebook(updatedNb).catch(() => {})
  }

  const renamePage = async (notebookId, pageId, newTitle) => {
    const nb = notebooks.find((n) => n.id === notebookId)
    if (!nb) return

    const updatedPages = nb.pages.map((p) => (p.id === pageId ? { ...p, title: newTitle } : p))
    const updatedNb = { ...nb, pages: updatedPages, updatedAt: new Date().toISOString() }
    await persistNotebook(updatedNb)
  }

  const reorderPages = async (notebookId, reorderedPages) => {
    const nb = notebooks.find((n) => n.id === notebookId)
    if (!nb) return

    const updatedNb = {
      ...nb,
      pages: reorderedPages,
      updatedAt: new Date().toISOString(),
    }
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
      const cleanRoom = nb.collabRoomId.trim().replace(/^#+/, '').toLowerCase()
      const roomId = cleanRoom.startsWith('collab-') ? cleanRoom : `collab-${cleanRoom}`
      socket.emit('notebook-page-update', {
        roomId,
        pageId,
        htmlContent,
        sender: uid,
      })
    }
  }

  // ── Join Shared Notebook with Room Code ──

  const joinSharedNotebook = async (roomCode) => {
    if (!roomCode?.trim()) return { success: false, error: 'Please enter a valid Room Code' }
    const cleanCode = roomCode.trim().replace(/^#+/, '')
    const cleanCodeLower = cleanCode.toLowerCase()
    const canonicalRoomId = cleanCodeLower.startsWith('collab-') ? cleanCodeLower : `collab-${cleanCodeLower}`

    // 1. Check existing state or localStorage directly
    const currentList = getLocalNotebooks()
    let existing =
      notebooks.find((n) => {
        const rId = n.collabRoomId ? normalizeRoomId(n.collabRoomId) : ''
        return rId === canonicalRoomId || n.id === canonicalRoomId || n.id === `nb-${canonicalRoomId}`
      }) ||
      currentList.find((n) => {
        const rId = n.collabRoomId ? normalizeRoomId(n.collabRoomId) : ''
        return rId === canonicalRoomId || n.id === canonicalRoomId || n.id === `nb-${canonicalRoomId}`
      })

    const hasMeaningfulContent = existing && (
      (existing.pages?.length > 1) ||
      (existing.pages?.[0]?.htmlContent && existing.pages[0].htmlContent.trim().length > 0)
    )

    // If existing copy is missing content or not found, eagerly fetch from cloud
    if (!hasMeaningfulContent) {
      try {
        const fetched = await fetchSharedNotebook(canonicalRoomId)
        if (fetched && (fetched.pages?.length > 0 || fetched.title)) {
          existing = {
            ...(existing || {}),
            ...fetched,
            id: existing?.id || fetched.id || `nb-${canonicalRoomId}`,
            collabRoomId: canonicalRoomId,
            isCollaborative: true,
          }
        }
      } catch (e) {
        console.warn('fetchSharedNotebook in joinSharedNotebook:', e)
      }
    }

    if (existing) {
      const finalNb = {
        ...existing,
        id: existing.id || `nb-${canonicalRoomId}`,
        collabRoomId: canonicalRoomId,
        isCollaborative: true,
      }
      setNotebooks((prev) => {
        const updatedList = deduplicateNotebooks([finalNb, ...prev])
        saveLocalNotebooks(updatedList)
        return updatedList
      })
      setActiveNotebookId(finalNb.id)
      if (finalNb.pages?.[0]?.id) {
        setActivePageId(finalNb.pages[0].id)
      }
      if (uid) {
        firestoreSaveNotebook(uid, finalNb).catch(() => {})
      }
      return { success: true, notebook: finalNb }
    }

    // 2. Connect to Socket room and request active peer notebook state
    if (socket) {
      socket.emit('notebook-join', {
        roomId: canonicalRoomId,
        user: {
          uid: user?.uid || 'guest',
          name: user?.displayName || 'Teammate',
        },
      })
      socket.emit('notebook-request-state', { roomId: canonicalRoomId })
    }

    // 3. Fetch shared notebook with strict non-hanging promise structure
    return new Promise((resolve) => {
      let resolved = false
      let timeoutId = null
      let unsubFirestore = null

      const cleanup = () => {
        if (timeoutId) {
          clearTimeout(timeoutId)
          timeoutId = null
        }
        if (typeof unsubFirestore === 'function') {
          try { unsubFirestore() } catch {}
          unsubFirestore = null
        }
        if (socket) {
          try { socket.off('notebook-updated', handleSocketUpdate) } catch {}
        }
      }

      const finalizeJoin = (realNb) => {
        if (resolved || !realNb) return
        resolved = true
        cleanup()

        const finalNb = {
          ...realNb,
          id: realNb.id || `nb-${canonicalRoomId}`,
          isCollaborative: true,
          collabRoomId: canonicalRoomId,
        }

        setNotebooks((prev) => {
          const updatedList = deduplicateNotebooks([
            finalNb,
            ...prev.filter((n) => {
              const r = n.collabRoomId ? normalizeRoomId(n.collabRoomId) : ''
              return n.id !== finalNb.id && r !== canonicalRoomId
            }),
          ])
          saveLocalNotebooks(updatedList)
          return updatedList
        })

        setActiveNotebookId(finalNb.id)
        if (finalNb.pages?.[0]?.id) {
          setActivePageId(finalNb.pages[0].id)
        }

        if (uid) {
          firestoreSaveNotebook(uid, finalNb).catch(() => {})
        }

        resolve({ success: true, notebook: finalNb })
      }

      const handleSocketUpdate = ({ notebook: socketNb }) => {
        if (!socketNb) return
        const sRoom = socketNb.collabRoomId ? normalizeRoomId(socketNb.collabRoomId) : ''
        if (sRoom === canonicalRoomId || socketNb.id === canonicalRoomId) {
          finalizeJoin(socketNb)
        }
      }

      if (socket) {
        socket.on('notebook-updated', handleSocketUpdate)
      }

      // Safety timeout: 3.5 seconds maximum to prevent any hang
      timeoutId = setTimeout(() => {
        if (!resolved) {
          resolved = true
          cleanup()
          const currentList = getLocalNotebooks()
          const fallbackNb = currentList.find((n) => {
            const r = n.collabRoomId ? normalizeRoomId(n.collabRoomId) : ''
            const id = n.id?.toLowerCase()
            return r === canonicalRoomId || id === canonicalRoomId
          })
          if (fallbackNb) {
            setActiveNotebookId(fallbackNb.id)
            if (fallbackNb.pages?.[0]?.id) setActivePageId(fallbackNb.pages[0].id)
            resolve({ success: true, notebook: fallbackNb })
          } else {
            resolve({
              success: false,
              error: `Could not find notebook for room code "${roomCode}". Make sure the notebook host has shared it or verify the code.`,
            })
          }
        }
      }, 3500)

      // Subscribe to real-time updates from Firestore
      try {
        unsubFirestore = subscribeSharedNotebook(canonicalRoomId, (sharedData) => {
          if (sharedData && (sharedData.pages?.length > 0 || sharedData.title)) {
            finalizeJoin(sharedData)
          }
        })
      } catch (err) {
        console.warn('subscribeSharedNotebook error:', err)
      }

      // Instant active fetch
      fetchSharedNotebook(canonicalRoomId)
        .then((instantNb) => {
          if (instantNb && (instantNb.pages?.length > 0 || instantNb.title)) {
            finalizeJoin(instantNb)
          }
        })
        .catch((err) => {
          console.warn('instant fetchSharedNotebook error:', err)
        })
    })
  }

  // ── Send Peer Invite ──

  const sendPeerInvite = async (email, notebookTitle, roomId) => {
    if (!email?.trim()) return { success: false, error: 'Email is required' }
    const currentNb = activeNotebook || notebooks.find(n => n.collabRoomId === roomId)
    const rawRoom = (roomId || currentNb?.collabRoomId || '').trim().replace(/^#+/, '').toLowerCase()
    const cleanRoom = rawRoom.startsWith('collab-') ? rawRoom : `collab-${rawRoom}`
    const cleanEmail = email.trim().toLowerCase()

    try {
      const fullNotebookPayload = {
        ...(currentNb || {}),
        collabRoomId: cleanRoom,
        isCollaborative: true,
      }

      // 1. Ensure the full notebook is saved in universal shared cloud storage
      await firestoreSaveSharedNotebook(cleanRoom, fullNotebookPayload).catch(() => {})

      // 2. Deliver invite directly via sendUserInvite (handles both existing users and pending email reservations)
      const res = await sendUserInvite(user, cleanEmail, {
        type: 'notebook',
        roomId: cleanRoom,
        title: notebookTitle || currentNb?.title || 'Collaborative Notebook',
        itemType: 'notebook',
        itemData: fullNotebookPayload,
      })

      // 3. Realtime socket notification if peer is connected
      if (res?.targetUser?.uid && socket) {
        socket.emit('send-invite', {
          toUid: res.targetUser.uid,
          fromName: user?.displayName || user?.email?.split('@')[0] || 'Teammate',
          roomId: cleanRoom,
          type: 'notebook',
          title: notebookTitle || currentNb?.title || 'Collaborative Notebook',
        })
      }

      return res || { success: true }
    } catch (err) {
      return { success: false, error: err.message || 'Failed to send invite' }
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

  // ── Explicit Share & Collab sync helper ──
  const shareNotebook = async (notebookId) => {
    const target = notebooks.find((n) => n.id === notebookId) || activeNotebook
    if (!target) return null
    const rawRoom = (target.collabRoomId || `collab-${Math.random().toString(36).substring(2, 8)}`).trim().replace(/^#+/, '').toLowerCase()
    const roomId = rawRoom.startsWith('collab-') ? rawRoom : `collab-${rawRoom}`
    const updated = {
      ...target,
      collabRoomId: roomId,
      isCollaborative: true,
      updatedAt: new Date().toISOString(),
    }
    await persistNotebook(updated)
    await firestoreSaveSharedNotebook(roomId, updated).catch(() => {})
    if (socket) {
      socket.emit('notebook-sync', {
        roomId,
        notebook: updated,
        sender: uid,
      })
    }
    return updated
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
    reorderPages,
    updatePageContent,
    joinSharedNotebook,
    sendPeerInvite,
    emitTyping,
    shareNotebook,
    socket,
  }
}
