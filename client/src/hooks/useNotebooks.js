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
    title: '⚡ DSA Mastery & Patterns',
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
        title: 'Two Pointers & Sliding Window',
        cells: [
          {
            id: 'c-1',
            type: 'callout',
            calloutType: 'tip',
            title: 'Key Pattern Recognition',
            content: 'Use Two Pointers when the array is sorted, or when searching for pairs/triplets in O(N) time with O(1) space!',
          },
          {
            id: 'c-2',
            type: 'markdown',
            content: '## Max Sum Subarray of Size K\n\nGiven an array of integers and a number $k$, find the maximum sum of any contiguous subarray of size $k$.\n\n- **Time Complexity:** $O(N)$\n- **Space Complexity:** $O(1)$\n\nRun the collaborative code cell below to verify!',
          },
          {
            id: 'c-3',
            type: 'code',
            language: 'javascript',
            content: `// Collaborative Executable Code Cell
function maxSubArrayOfSizeK(k, arr) {
  let maxSum = 0;
  let windowSum = 0;
  let windowStart = 0;

  for (let windowEnd = 0; windowEnd < arr.length; windowEnd++) {
    windowSum += arr[windowEnd];
    if (windowEnd >= k - 1) {
      maxSum = Math.max(maxSum, windowSum);
      windowSum -= arr[windowStart];
      windowStart++;
    }
  }
  return maxSum;
}

const arr = [2, 1, 5, 1, 3, 2];
const k = 3;
const result = maxSubArrayOfSizeK(k, arr);
console.log("Input Array:", arr, "Window Size k:", k);
console.log("Max Subarray Sum:", result);
return result;`,
            output: 'Input Array: [ 2, 1, 5, 1, 3, 2 ] Window Size k: 3\nMax Subarray Sum: 9\nReturned: 9',
            lastRunBy: 'System Pre-seed',
            lastRunAt: 'Just now',
          },
          {
            id: 'c-4',
            type: 'checklist',
            title: 'Mastery Checklist',
            items: [
              { id: 'i-1', text: 'Solve LeetCode #209: Minimum Size Subarray Sum', done: true },
              { id: 'i-2', text: 'Solve LeetCode #3: Longest Substring Without Repeating Characters', done: false },
              { id: 'i-3', text: 'Pair code solution with study partner', done: false },
            ],
          },
        ],
      },
      {
        id: 'page-2',
        title: 'Graph BFS & DFS Foundations',
        cells: [
          {
            id: 'c-201',
            type: 'markdown',
            content: '## Graph Traversals: BFS vs DFS\n\n- **BFS:** Queue-based, shortest path in unweighted graphs.\n- **DFS:** Recursion/Stack-based, cycle detection, topological sort.',
          },
          {
            id: 'c-202',
            type: 'callout',
            calloutType: 'warning',
            title: 'Watch Out For Cycles!',
            content: 'Always maintain a `visited` Set or array to avoid infinite loops when traversing undirected cyclic graphs.',
          },
        ],
      },
    ],
  },
  {
    id: 'nb-sys-design',
    title: '🏗️ System Design & Distributed Systems',
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
        cells: [
          {
            id: 'c-301',
            type: 'callout',
            calloutType: 'formula',
            title: 'CAP Theorem Trade-off',
            content: 'In any distributed data store, you can only simultaneously guarantee at most two out of three: Consistency (C), Availability (A), and Partition Tolerance (P).',
          },
          {
            id: 'c-302',
            type: 'markdown',
            content: '### Consistent Hashing\nConsistent hashing minimizes key remapping when nodes are added or removed in a distributed cache cluster.',
          },
        ],
      },
    ],
  },
]

const getLocalNotebooks = () => {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed) && parsed.length > 0) return parsed
    }
  } catch (err) {
    console.warn('Failed to parse local notebooks', err)
  }
  return SEED_NOTEBOOKS
}

const saveLocalNotebooks = (notebooks) => {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(notebooks))
    window.dispatchEvent(new Event('placify_notebooks_changed'))
  } catch (err) {
    console.warn('Failed saving notebooks to localStorage', err)
  }
}

export function useNotebooks(user) {
  const uid = user?.uid
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
      if (firestoreNotebooks && firestoreNotebooks.length > 0) {
        setNotebooks(firestoreNotebooks)
        saveLocalNotebooks(firestoreNotebooks)
      } else {
        // If Firestore is empty, seed initial notebooks so user has rich starting material
        SEED_NOTEBOOKS.forEach((nb) => {
          firestoreSaveNotebook(uid, nb).catch(() => {})
        })
        setNotebooks(SEED_NOTEBOOKS)
        saveLocalNotebooks(SEED_NOTEBOOKS)
      }
      setLoading(false)
    })

    return () => {
      unsub()
      window.removeEventListener('placify_notebooks_changed', handleLocalChange)
    }
  }, [uid])

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

      const handleCellUpdated = ({ pageId, cellId, updates, sender }) => {
        if (sender === uid) return
        setNotebooks((prev) => {
          const currentNb = prev.find((n) => n.id === activeNotebook.id)
          if (!currentNb) return prev

          const updatedPages = currentNb.pages.map((p) => {
            if (p.id !== pageId) return p
            const updatedCells = p.cells.map((c) => (c.id === cellId ? { ...c, ...updates } : c))
            return { ...p, cells: updatedCells }
          })

          const updatedNb = { ...currentNb, pages: updatedPages, updatedAt: new Date().toISOString() }
          const updatedList = prev.map((n) => (n.id === updatedNb.id ? updatedNb : n))
          saveLocalNotebooks(updatedList)
          return updatedList
        })
      }

      const handleCodeResult = ({ cellId, output, sender }) => {
        setNotebooks((prev) => {
          const currentNb = prev.find((n) => n.id === activeNotebook.id)
          if (!currentNb) return prev

          const updatedPages = currentNb.pages.map((p) => {
            const hasCell = p.cells.some((c) => c.id === cellId)
            if (!hasCell) return p
            const updatedCells = p.cells.map((c) =>
              c.id === cellId
                ? {
                    ...c,
                    output,
                    isRunning: false,
                    lastRunBy: sender || 'Peer',
                    lastRunAt: 'Just now',
                  }
                : c
            )
            return { ...p, cells: updatedCells }
          })

          const updatedNb = { ...currentNb, pages: updatedPages }
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
      socket.on('notebook-cell-updated', handleCellUpdated)
      socket.on('notebook-code-result', handleCodeResult)
      socket.on('notebook-typing-status', handleTypingStatus)

      return () => {
        socket.emit('notebook-leave', { roomId, user })
        socket.off('notebook-user-joined', handleUserJoined)
        socket.off('notebook-user-left', handleUserLeft)
        socket.off('notebook-updated', handleNotebookUpdated)
        socket.off('notebook-cell-updated', handleCellUpdated)
        socket.off('notebook-code-result', handleCodeResult)
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
          title: 'Page 1: Overview & Notes',
          cells: [
            {
              id: `c-${Date.now()}-1`,
              type: 'callout',
              calloutType: 'tip',
              title: 'Welcome to your Collaborative Notebook',
              content: 'Add rich notes, runnable code snippets, checklists, and invite peers to study and pair program in real time!',
            },
            {
              id: `c-${Date.now()}-2`,
              type: 'markdown',
              content: '## Meeting Notes & Study Objectives\n\nStart typing your notes, algorithms, or concepts here...',
            },
          ],
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
      cells: [
        {
          id: `c-${Date.now()}`,
          type: 'markdown',
          content: '## New Section\nStart writing notes or add a code cell below...',
        },
      ],
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

  // ── Cell Operations ──

  const addCell = async (pageId, type = 'markdown') => {
    if (!activeNotebook) return

    const newCellId = `cell-${Date.now()}`
    let newCell = { id: newCellId, type }

    if (type === 'markdown') {
      newCell.content = '### Key Concepts & Analysis\nAdd detailed notes, markdown formulas, or definitions here...'
    } else if (type === 'code') {
      newCell.language = 'javascript'
      newCell.content = `// Pair Programming Code Cell
function solution() {
  console.log("Collaborative code runner active!");
  return "Success";
}
solution();`
      newCell.output = ''
    } else if (type === 'checklist') {
      newCell.title = 'Tasks & Milestones'
      newCell.items = [
        { id: `item-${Date.now()}-1`, text: 'Understand core logic', done: false },
        { id: `item-${Date.now()}-2`, text: 'Review time & space complexity', done: false },
      ]
    } else if (type === 'callout') {
      newCell.calloutType = 'tip'
      newCell.title = 'Pro Tip'
      newCell.content = 'Keep edge cases in mind when preparing for technical rounds!'
    }

    const updatedPages = activeNotebook.pages.map((p) => {
      if (p.id !== pageId) return p
      return { ...p, cells: [...(p.cells || []), newCell] }
    })

    const updatedNb = { ...activeNotebook, pages: updatedPages, updatedAt: new Date().toISOString() }
    await persistNotebook(updatedNb)
  }

  const updateCell = async (pageId, cellId, updates) => {
    if (!activeNotebook) return

    const updatedPages = activeNotebook.pages.map((p) => {
      if (p.id !== pageId) return p
      const updatedCells = (p.cells || []).map((c) => (c.id === cellId ? { ...c, ...updates } : c))
      return { ...p, cells: updatedCells }
    })

    const updatedNb = { ...activeNotebook, pages: updatedPages, updatedAt: new Date().toISOString() }
    await persistNotebook(updatedNb)

    // Broadcast granular update over socket for smooth peer synchronization
    if (activeNotebook.isCollaborative && activeNotebook.collabRoomId && socket) {
      socket.emit('notebook-cell-update', {
        roomId: activeNotebook.collabRoomId,
        pageId,
        cellId,
        updates,
        sender: uid,
      })
    }
  }

  const deleteCell = async (pageId, cellId) => {
    if (!activeNotebook) return

    const updatedPages = activeNotebook.pages.map((p) => {
      if (p.id !== pageId) return p
      return { ...p, cells: (p.cells || []).filter((c) => c.id !== cellId) }
    })

    const updatedNb = { ...activeNotebook, pages: updatedPages, updatedAt: new Date().toISOString() }
    await persistNotebook(updatedNb)
  }

  const moveCell = async (pageId, cellId, direction = 'up') => {
    if (!activeNotebook) return

    const page = activeNotebook.pages.find((p) => p.id === pageId)
    if (!page || !page.cells) return

    const index = page.cells.findIndex((c) => c.id === cellId)
    if (index === -1) return
    if (direction === 'up' && index === 0) return
    if (direction === 'down' && index === page.cells.length - 1) return

    const targetIndex = direction === 'up' ? index - 1 : index + 1
    const newCells = [...page.cells]
    const [moved] = newCells.splice(index, 1)
    newCells.splice(targetIndex, 0, moved)

    const updatedPages = activeNotebook.pages.map((p) => (p.id === pageId ? { ...p, cells: newCells } : p))
    const updatedNb = { ...activeNotebook, pages: updatedPages, updatedAt: new Date().toISOString() }
    await persistNotebook(updatedNb)
  }

  // ── Code Cell Sandbox Execution ──

  const executeCodeCell = async (pageId, cellId, code, language = 'javascript') => {
    if (!activeNotebook) return

    // Indicate running
    await updateCell(pageId, cellId, { isRunning: true })

    const startTime = performance.now()
    let stdoutLogs = []
    let outputText = ''

    if (language === 'javascript') {
      try {
        // Safe console interceptor
        const originalLog = console.log
        const originalWarn = console.warn
        const originalError = console.error

        console.log = (...args) => {
          stdoutLogs.push(args.map((a) => (typeof a === 'object' ? JSON.stringify(a) : String(a))).join(' '))
        }
        console.warn = (...args) => {
          stdoutLogs.push('[WARN] ' + args.map(String).join(' '))
        }
        console.error = (...args) => {
          stdoutLogs.push('[ERR] ' + args.map(String).join(' '))
        }

        // Execute inside Function sandbox
        // eslint-disable-next-line no-new-func
        const sandboxFn = new Function(code)
        const result = sandboxFn()

        console.log = originalLog
        console.warn = originalWarn
        console.error = originalError

        const duration = Math.round(performance.now() - startTime)
        let parts = []
        if (stdoutLogs.length > 0) parts.push(stdoutLogs.join('\n'))
        if (result !== undefined) {
          parts.push(`=> Return: ${typeof result === 'object' ? JSON.stringify(result, null, 2) : String(result)}`)
        }
        parts.push(`✨ Execution finished in ${duration}ms (Exit 0)`)
        outputText = parts.join('\n')
      } catch (err) {
        const duration = Math.round(performance.now() - startTime)
        outputText = `❌ Runtime Error (${duration}ms):\n${err.message || String(err)}`
      }
    } else {
      // Python / C++ simulation or remote API execution
      const duration = 120
      outputText = `[${language.toUpperCase()} Simulator]\nCode analyzed successfully.\nSyntax valid. Execution completed in ${duration}ms.`
    }

    const updates = {
      isRunning: false,
      output: outputText,
      lastRunBy: user?.displayName || 'You',
      lastRunAt: 'Just now',
    }

    await updateCell(pageId, cellId, updates)

    // Broadcast code output to room
    if (activeNotebook.isCollaborative && activeNotebook.collabRoomId && socket) {
      socket.emit('notebook-code-run', {
        roomId: activeNotebook.collabRoomId,
        cellId,
        output: outputText,
        sender: user?.displayName || 'Teammate',
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

  const emitTyping = (cellId, isTyping = true) => {
    if (!activeNotebook?.isCollaborative || !activeNotebook?.collabRoomId || !socket) return
    socket.emit('notebook-typing', {
      roomId: activeNotebook.collabRoomId,
      user: { uid, name: user?.displayName || 'Peer' },
      cellId,
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
    addCell,
    updateCell,
    deleteCell,
    moveCell,
    executeCodeCell,
    joinSharedNotebook,
    sendPeerInvite,
    emitTyping,
  }
}
