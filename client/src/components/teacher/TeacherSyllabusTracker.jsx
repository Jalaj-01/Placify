import { useState, useEffect, useMemo, useCallback } from 'react'
import {
  BookOpen, CheckCircle2, Clock, Plus, Save, AlertTriangle,
  FileText, Sparkles, ChevronDown, ChevronRight, Trash2,
  TrendingUp, Award, Layers, CheckSquare, Square, Calendar,
  Wand2, Upload, RefreshCw, Edit3, Check, X, ArrowUpRight, Zap
} from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { useToast } from '@/components/ui/toast'
import CustomDropdown from '@/components/ui/CustomDropdown'
import { subscribeSyllabus, saveSyllabusUnits } from '@/services/teacherService'
import { cn } from '@/lib/utils'

// ═══════════════════════════════════════════════════════════════
// 1. CURATED ACADEMIC SYLLABUS PRESETS (Ready in 1-Click)
// ═══════════════════════════════════════════════════════════════
const SYLLABUS_PRESETS = [
  {
    id: 'dsa',
    name: 'Data Structures & Algorithms',
    totalPlannedClasses: 42,
    units: [
      {
        unitNumber: 1,
        title: 'Unit 1: Linear Data Structures & Complexity Analysis',
        marksWeightage: 18,
        plannedTotalLectures: 7,
        chapters: [
          {
            title: 'Asymptotic Analysis & Growth of Functions',
            subTopics: [
              { id: 'dsa_1_1', title: 'Big-O, Big-Theta, Big-Omega Mathematical Notations', plannedHours: 1.5, isCompleted: false },
              { id: 'dsa_1_2', title: 'Recurrence Relations & Master Theorem', plannedHours: 1.5, isCompleted: false },
              { id: 'dsa_1_3', title: 'Space vs. Time Complexity Trade-offs', plannedHours: 1.0, isCompleted: false }
            ]
          },
          {
            title: 'Arrays, Dynamic Arrays & Linked Lists',
            subTopics: [
              { id: 'dsa_1_4', title: 'Singly, Doubly & Circular Linked Lists', plannedHours: 1.5, isCompleted: false },
              { id: 'dsa_1_5', title: 'Two Pointer & Sliding Window Techniques', plannedHours: 1.5, isCompleted: false }
            ]
          }
        ]
      },
      {
        unitNumber: 2,
        title: 'Unit 2: Stacks, Queues & Hashing',
        marksWeightage: 16,
        plannedTotalLectures: 6,
        chapters: [
          {
            title: 'Abstract Data Types: Stacks & Queues',
            subTopics: [
              { id: 'dsa_2_1', title: 'Stack Infix, Postfix, Prefix Conversions', plannedHours: 1.5, isCompleted: false },
              { id: 'dsa_2_2', title: 'Circular Queues, Deques & Monotonic Stacks', plannedHours: 1.5, isCompleted: false }
            ]
          },
          {
            title: 'Hashing Techniques & Collision Resolution',
            subTopics: [
              { id: 'dsa_2_3', title: 'Hash Functions, Chaining & Open Addressing', plannedHours: 1.5, isCompleted: false },
              { id: 'dsa_2_4', title: 'Rolling Hash & Hash Maps in Practice', plannedHours: 1.5, isCompleted: false }
            ]
          }
        ]
      },
      {
        unitNumber: 3,
        title: 'Unit 3: Hierarchical Structures: Trees & Binary Search Trees',
        marksWeightage: 20,
        plannedTotalLectures: 9,
        chapters: [
          {
            title: 'Binary Trees & Traversals',
            subTopics: [
              { id: 'dsa_3_1', title: 'Tree Representations & DFS/BFS Traversals', plannedHours: 2.0, isCompleted: false },
              { id: 'dsa_3_2', title: 'Lowest Common Ancestor & Diameter of Tree', plannedHours: 1.5, isCompleted: false }
            ]
          },
          {
            title: 'Balanced Search Trees & Heaps',
            subTopics: [
              { id: 'dsa_3_3', title: 'Binary Search Tree (BST) Operations', plannedHours: 1.5, isCompleted: false },
              { id: 'dsa_3_4', title: 'AVL Trees & Self-Balancing Rotations', plannedHours: 2.0, isCompleted: false },
              { id: 'dsa_3_5', title: 'Binary Min/Max Heaps & HeapSort', plannedHours: 2.0, isCompleted: false }
            ]
          }
        ]
      },
      {
        unitNumber: 4,
        title: 'Unit 4: Graph Algorithms & Network Traversal',
        marksWeightage: 22,
        plannedTotalLectures: 10,
        chapters: [
          {
            title: 'Graph Representations & Traversals',
            subTopics: [
              { id: 'dsa_4_1', title: 'Adjacency Matrix, List & BFS/DFS Exploration', plannedHours: 2.0, isCompleted: false },
              { id: 'dsa_4_2', title: 'Topological Sort & Kahn’s Algorithm', plannedHours: 1.5, isCompleted: false },
              { id: 'dsa_4_3', title: 'Cycle Detection in Directed & Undirected Graphs', plannedHours: 1.5, isCompleted: false }
            ]
          },
          {
            title: 'Shortest Paths & Minimum Spanning Trees',
            subTopics: [
              { id: 'dsa_4_4', title: 'Dijkstra’s Algorithm with Priority Queues', plannedHours: 2.0, isCompleted: false },
              { id: 'dsa_4_5', title: 'Bellman-Ford & Floyd-Warshall Algorithms', plannedHours: 1.5, isCompleted: false },
              { id: 'dsa_4_6', title: 'Kruskal’s (Disjoint Set Union) & Prim’s MST', plannedHours: 1.5, isCompleted: false }
            ]
          }
        ]
      },
      {
        unitNumber: 5,
        title: 'Unit 5: Dynamic Programming & Greedy Strategies',
        marksWeightage: 24,
        plannedTotalLectures: 10,
        chapters: [
          {
            title: 'Dynamic Programming Paradigms',
            subTopics: [
              { id: 'dsa_5_1', title: 'Memoization (Top-Down) vs Tabulation (Bottom-Up)', plannedHours: 2.0, isCompleted: false },
              { id: 'dsa_5_2', title: '0/1 Knapsack & Unbounded Knapsack Variants', plannedHours: 2.0, isCompleted: false },
              { id: 'dsa_5_3', title: 'Longest Common Subsequence (LCS) & LIS', plannedHours: 2.0, isCompleted: false },
              { id: 'dsa_5_4', title: 'Matrix Chain Multiplication & DP on Trees', plannedHours: 2.0, isCompleted: false }
            ]
          },
          {
            title: 'Greedy Algorithms & Backtracking',
            subTopics: [
              { id: 'dsa_5_5', title: 'Activity Selection & Huffman Coding', plannedHours: 1.0, isCompleted: false },
              { id: 'dsa_5_6', title: 'N-Queens, Sudoku & Subset Generation', plannedHours: 1.0, isCompleted: false }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'os',
    name: 'Operating Systems & System Architecture',
    totalPlannedClasses: 40,
    units: [
      {
        unitNumber: 1,
        title: 'Unit 1: OS Fundamentals & System Calls',
        marksWeightage: 18,
        plannedTotalLectures: 7,
        chapters: [
          {
            title: 'Kernel Architecture & Hardware Interface',
            subTopics: [
              { id: 'os_1_1', title: 'Monolithic vs Microkernel Architectures', plannedHours: 1.5, isCompleted: false },
              { id: 'os_1_2', title: 'System Calls, Trap Handlers & Dual-Mode Operation', plannedHours: 2.0, isCompleted: false },
              { id: 'os_1_3', title: 'Bootstrapping & BIOS/UEFI Loading Sequence', plannedHours: 1.5, isCompleted: false }
            ]
          }
        ]
      },
      {
        unitNumber: 2,
        title: 'Unit 2: Processes, Threads & CPU Scheduling',
        marksWeightage: 22,
        plannedTotalLectures: 9,
        chapters: [
          {
            title: 'Process Management & Context Switching',
            subTopics: [
              { id: 'os_2_1', title: 'PCB Structure, States & Context Switching', plannedHours: 2.0, isCompleted: false },
              { id: 'os_2_2', title: 'Multithreading Models & Thread Lifecycle', plannedHours: 2.0, isCompleted: false }
            ]
          },
          {
            title: 'CPU Scheduling Algorithms',
            subTopics: [
              { id: 'os_2_3', title: 'FCFS, SJF, Round Robin & Priority Scheduling', plannedHours: 2.5, isCompleted: false },
              { id: 'os_2_4', title: 'Multilevel Feedback Queues (MLFQ) & Real-time Scheduling', plannedHours: 2.5, isCompleted: false }
            ]
          }
        ]
      },
      {
        unitNumber: 3,
        title: 'Unit 3: Synchronization & Deadlocks',
        marksWeightage: 22,
        plannedTotalLectures: 9,
        chapters: [
          {
            title: 'Concurrency & Race Conditions',
            subTopics: [
              { id: 'os_3_1', title: 'Critical Section Problem & Peterson’s Algorithm', plannedHours: 2.0, isCompleted: false },
              { id: 'os_3_2', title: 'Mutex Locks, Semaphores & Monitors', plannedHours: 2.5, isCompleted: false },
              { id: 'os_3_3', title: 'Classic IPC Problems (Dining Philosophers, Readers-Writers)', plannedHours: 2.0, isCompleted: false }
            ]
          },
          {
            title: 'Deadlock Handling Strategies',
            subTopics: [
              { id: 'os_3_4', title: 'Coffman Conditions & Resource Allocation Graphs', plannedHours: 1.5, isCompleted: false },
              { id: 'os_3_5', title: 'Banker’s Algorithm & Deadlock Recovery', plannedHours: 1.0, isCompleted: false }
            ]
          }
        ]
      },
      {
        unitNumber: 4,
        title: 'Unit 4: Memory Management & Virtual Memory',
        marksWeightage: 20,
        plannedTotalLectures: 8,
        chapters: [
          {
            title: 'Physical & Virtual Memory',
            subTopics: [
              { id: 'os_4_1', title: 'Contiguous Allocation & Paging Architecture', plannedHours: 2.0, isCompleted: false },
              { id: 'os_4_2', title: 'Multi-level Paging, Inverted Tables & TLB Cache', plannedHours: 2.0, isCompleted: false },
              { id: 'os_4_3', title: 'Page Replacement Algorithms (LRU, FIFO, Optimal, Clock)', plannedHours: 2.0, isCompleted: false },
              { id: 'os_4_4', title: 'Thrashing & Working Set Model', plannedHours: 2.0, isCompleted: false }
            ]
          }
        ]
      },
      {
        unitNumber: 5,
        title: 'Unit 5: Storage, File Systems & Security',
        marksWeightage: 18,
        plannedTotalLectures: 7,
        chapters: [
          {
            title: 'File Systems & I/O Subsystem',
            subTopics: [
              { id: 'os_5_1', title: 'Inodes, FAT, ext4 & Directory Structures', plannedHours: 2.0, isCompleted: false },
              { id: 'os_5_2', title: 'Disk Scheduling (SCAN, C-SCAN, LOOK) & RAID Levels', plannedHours: 2.5, isCompleted: false },
              { id: 'os_5_3', title: 'Access Control Lists, Capabilities & Kernel Security', plannedHours: 2.5, isCompleted: false }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'dbms',
    name: 'Database Management Systems (DBMS)',
    totalPlannedClasses: 38,
    units: [
      {
        unitNumber: 1,
        title: 'Unit 1: Relational Model & ER Modeling',
        marksWeightage: 20,
        plannedTotalLectures: 7,
        chapters: [
          {
            title: 'Conceptual Schema & Relational Algebra',
            subTopics: [
              { id: 'db_1_1', title: 'Three-Schema Architecture & Data Independence', plannedHours: 1.5, isCompleted: false },
              { id: 'db_1_2', title: 'Enhanced ER Modeling & Mapping to Relational Schema', plannedHours: 2.5, isCompleted: false },
              { id: 'db_1_3', title: 'Relational Algebra Operators & Tuple Calculus', plannedHours: 3.0, isCompleted: false }
            ]
          }
        ]
      },
      {
        unitNumber: 2,
        title: 'Unit 2: Advanced SQL & Normalization Theory',
        marksWeightage: 25,
        plannedTotalLectures: 9,
        chapters: [
          {
            title: 'Complex Queries & Functional Dependencies',
            subTopics: [
              { id: 'db_2_1', title: 'Subqueries, Window Functions & CTEs in SQL', plannedHours: 2.5, isCompleted: false },
              { id: 'db_2_2', title: 'Closure of Attributes & Canonical Cover', plannedHours: 2.0, isCompleted: false },
              { id: 'db_2_3', title: '1NF, 2NF, 3NF, BCNF & 4NF Decomposition', plannedHours: 2.5, isCompleted: false },
              { id: 'db_2_4', title: 'Lossless Join & Dependency Preserving Decompositions', plannedHours: 2.0, isCompleted: false }
            ]
          }
        ]
      },
      {
        unitNumber: 3,
        title: 'Unit 3: Transactions, Concurrency & ACID Properties',
        marksWeightage: 25,
        plannedTotalLectures: 9,
        chapters: [
          {
            title: 'Transaction Engine & Isolation',
            subTopics: [
              { id: 'db_3_1', title: 'ACID Guarantees & Conflict/View Serializability', plannedHours: 2.5, isCompleted: false },
              { id: 'db_3_2', title: 'Two-Phase Locking (2PL) & Strict 2PL Protocol', plannedHours: 2.5, isCompleted: false },
              { id: 'db_3_3', title: 'Timestamp Ordering & Multi-Version Concurrency (MVCC)', plannedHours: 2.0, isCompleted: false },
              { id: 'db_3_4', title: 'WAL Logging, ARIES Algorithm & Checkpoints', plannedHours: 2.0, isCompleted: false }
            ]
          }
        ]
      },
      {
        unitNumber: 4,
        title: 'Unit 4: Indexing, B+ Trees & Query Optimization',
        marksWeightage: 18,
        plannedTotalLectures: 7,
        chapters: [
          {
            title: 'Storage Layout & Cost-Based Optimizer',
            subTopics: [
              { id: 'db_4_1', title: 'Primary, Clustered & Secondary Index Structures', plannedHours: 2.0, isCompleted: false },
              { id: 'db_4_2', title: 'B-Tree & B+ Tree Insertion, Search & Split Mechanics', plannedHours: 3.0, isCompleted: false },
              { id: 'db_4_3', title: 'Query Execution Plans & Cost Estimators', plannedHours: 2.0, isCompleted: false }
            ]
          }
        ]
      },
      {
        unitNumber: 5,
        title: 'Unit 5: NoSQL & Distributed Databases',
        marksWeightage: 12,
        plannedTotalLectures: 6,
        chapters: [
          {
            title: 'Distributed Systems & Document Stores',
            subTopics: [
              { id: 'db_5_1', title: 'CAP Theorem & PACELC Trade-offs', plannedHours: 2.0, isCompleted: false },
              { id: 'db_5_2', title: 'Document & Key-Value Stores (MongoDB / Redis)', plannedHours: 2.0, isCompleted: false },
              { id: 'db_5_3', title: 'Consistent Hashing & Data Sharding', plannedHours: 2.0, isCompleted: false }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'cn',
    name: 'Computer Networks & Internet Protocols',
    totalPlannedClasses: 40,
    units: [
      {
        unitNumber: 1,
        title: 'Unit 1: Network Layering & Physical Transmission',
        marksWeightage: 18,
        plannedTotalLectures: 7,
        chapters: [
          {
            title: 'OSI vs TCP/IP Models & Media',
            subTopics: [
              { id: 'cn_1_1', title: 'Layered Architectures & Encapsulation', plannedHours: 2.0, isCompleted: false },
              { id: 'cn_1_2', title: 'Bandwidth-Delay Product, Nyquist & Shannon Limits', plannedHours: 2.5, isCompleted: false },
              { id: 'cn_1_3', title: 'Packet Switching vs Circuit Switching', plannedHours: 2.5, isCompleted: false }
            ]
          }
        ]
      },
      {
        unitNumber: 2,
        title: 'Unit 2: Data Link Layer & MAC Protocols',
        marksWeightage: 20,
        plannedTotalLectures: 8,
        chapters: [
          {
            title: 'Framing, Error Control & Ethernet',
            subTopics: [
              { id: 'cn_2_1', title: 'CRC Error Detection & Hamming Codes', plannedHours: 2.5, isCompleted: false },
              { id: 'cn_2_2', title: 'Sliding Window (Go-Back-N, Selective Repeat)', plannedHours: 3.0, isCompleted: false },
              { id: 'cn_2_3', title: 'CSMA/CD & CSMA/CA for WiFi 802.11', plannedHours: 2.5, isCompleted: false }
            ]
          }
        ]
      },
      {
        unitNumber: 3,
        title: 'Unit 3: IP Addressing & Routing Protocols',
        marksWeightage: 24,
        plannedTotalLectures: 10,
        chapters: [
          {
            title: 'IPv4/IPv6 & Subnetting',
            subTopics: [
              { id: 'cn_3_1', title: 'CIDR Notation, VLSM & Subnet Masking', plannedHours: 3.0, isCompleted: false },
              { id: 'cn_3_2', title: 'NAT, DHCP, ARP & ICMP Operations', plannedHours: 2.0, isCompleted: false },
              { id: 'cn_3_3', title: 'Link State (OSPF) & Distance Vector (RIP)', plannedHours: 2.5, isCompleted: false },
              { id: 'cn_3_4', title: 'BGP Path Vector Routing & Autonomous Systems', plannedHours: 2.5, isCompleted: false }
            ]
          }
        ]
      },
      {
        unitNumber: 4,
        title: 'Unit 4: Transport Layer: TCP & UDP',
        marksWeightage: 22,
        plannedTotalLectures: 9,
        chapters: [
          {
            title: 'Reliable Data Transfer & Congestion',
            subTopics: [
              { id: 'cn_4_1', title: 'TCP 3-Way Handshake & Teardown Protocol', plannedHours: 2.0, isCompleted: false },
              { id: 'cn_4_2', title: 'TCP Congestion Control (Slow Start, AIMD, Fast Retransmit)', plannedHours: 3.5, isCompleted: false },
              { id: 'cn_4_3', title: 'UDP Socket Programming & Real-Time Streaming', plannedHours: 2.0, isCompleted: false },
              { id: 'cn_4_4', title: 'QUIC / HTTP3 UDP-based Transport', plannedHours: 1.5, isCompleted: false }
            ]
          }
        ]
      },
      {
        unitNumber: 5,
        title: 'Unit 5: Application Protocols & Network Security',
        marksWeightage: 16,
        plannedTotalLectures: 6,
        chapters: [
          {
            title: 'DNS, HTTP/HTTPS & Cryptography',
            subTopics: [
              { id: 'cn_5_1', title: 'DNS Resolution Hierarchy & Caching', plannedHours: 1.5, isCompleted: false },
              { id: 'cn_5_2', title: 'HTTP/1.1 vs HTTP/2 Multiplexing & TLS Handshake', plannedHours: 2.5, isCompleted: false },
              { id: 'cn_5_3', title: 'Firewalls, IPSec, VPNs & DDoS Defenses', plannedHours: 2.0, isCompleted: false }
            ]
          }
        ]
      }
    ]
  }
]

// ═══════════════════════════════════════════════════════════════
// 2. SMART SYLLABUS TEXT / DOCUMENT PARSER
// ═══════════════════════════════════════════════════════════════
function parseRawSyllabusText(rawText) {
  if (!rawText || !rawText.trim()) return []

  const lines = rawText.split('\n').map(l => l.trim()).filter(Boolean)
  const units = []
  let currentUnit = null
  let currentChapter = null

  const unitRegex = /^(?:unit|module|section|part)\s*(\d+)[:\s.-]*(.*)$/i
  const chapterRegex = /^(?:chapter|topic|block)\s*(\d+)[:\s.-]*(.*)$/i

  for (let line of lines) {
    const unitMatch = line.match(unitRegex)
    if (unitMatch) {
      const uNum = parseInt(unitMatch[1], 10) || (units.length + 1)
      const uTitle = unitMatch[2] ? unitMatch[2].trim() : `Unit ${uNum}`
      currentUnit = {
        unitNumber: uNum,
        title: `Unit ${uNum}: ${uTitle}`,
        marksWeightage: 20,
        plannedTotalLectures: 8,
        chapters: []
      }
      units.push(currentUnit)
      currentChapter = null
      continue
    }

    // If we have a unit, check for chapter or subtopic
    if (!currentUnit) {
      currentUnit = {
        unitNumber: 1,
        title: 'Unit 1: Overview & Core Principles',
        marksWeightage: 20,
        plannedTotalLectures: 8,
        chapters: []
      }
      units.push(currentUnit)
    }

    const chapMatch = line.match(chapterRegex)
    if (chapMatch) {
      const cTitle = chapMatch[2] ? chapMatch[2].trim() : line
      currentChapter = {
        title: cTitle,
        subTopics: []
      }
      currentUnit.chapters.push(currentChapter)
      continue
    }

    // Clean bullet points
    let cleanLine = line.replace(/^[\*\-\•\d+\.\)\-\s]+/, '').trim()
    if (!cleanLine) continue

    // Split compound lines (e.g. comma or semicolon separated subtopics)
    const items = cleanLine.includes(';')
      ? cleanLine.split(';').map(s => s.trim()).filter(Boolean)
      : cleanLine.length > 80 && cleanLine.includes(',')
      ? cleanLine.split(',').map(s => s.trim()).filter(Boolean)
      : [cleanLine]

    if (!currentChapter) {
      currentChapter = {
        title: items[0].length > 40 ? 'Core Topics' : items[0],
        subTopics: []
      }
      currentUnit.chapters.push(currentChapter)
    }

    for (let item of items) {
      // Predict planned hours based on length & topic keywords
      let hours = 1.0
      const lower = item.toLowerCase()
      if (lower.includes('algorithm') || lower.includes('architecture') || lower.includes('protocol') || lower.includes('tree') || lower.includes('graph')) {
        hours = 1.5
      } else if (lower.includes('design') || lower.includes('dynamic programming') || lower.includes('concurrency')) {
        hours = 2.0
      }

      currentChapter.subTopics.push({
        id: `st_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        title: item,
        plannedHours: hours,
        isCompleted: false
      })
    }
  }

  // Equalize marks weightage evenly across extracted units
  if (units.length > 0) {
    const weightPerUnit = Math.round(100 / units.length)
    units.forEach((u, i) => {
      u.marksWeightage = (i === units.length - 1)
        ? (100 - (weightPerUnit * (units.length - 1)))
        : weightPerUnit

      // Sum subtopics hours to establish planned classes
      let totalHours = 0
      u.chapters.forEach(ch => {
        ch.subTopics.forEach(st => {
          totalHours += Number(st.plannedHours || 1)
        })
      })
      u.plannedTotalLectures = Math.max(4, Math.ceil(totalHours))
    })
  }

  return units
}

export default function TeacherSyllabusTracker({ course }) {
  const { success, error: toastError, confirm } = useToast()

  const [syllabus, setSyllabus] = useState(null)
  const [units, setUnits] = useState([])
  const [deliveredCount, setDeliveredCount] = useState(0)
  const [saving, setSaving] = useState(false)
  const [expandedUnits, setExpandedUnits] = useState({ 0: true })

  // Smart AI Generator Modal State
  const [showAiModal, setShowAiModal] = useState(false)
  const [selectedPresetId, setSelectedPresetId] = useState('dsa')
  const [rawPastedText, setRawPastedText] = useState('')
  const [activeAiTab, setActiveAiTab] = useState('preset') // 'preset' | 'text'

  // Subscribe to syllabus in real-time
  useEffect(() => {
    if (!course?.id) return
    const unsub = subscribeSyllabus(course.id, (data) => {
      if (data) {
        setSyllabus(data)
        setUnits(data.units || [])
        setDeliveredCount(data.pacingMetrics?.totalDeliveredLectures || 0)
      } else {
        // Auto-load DSA preset as high quality default if completely blank
        const defaultPreset = SYLLABUS_PRESETS[0]
        setUnits(defaultPreset.units)
        setDeliveredCount(0)
      }
    })
    return unsub
  }, [course?.id])

  // ═══════════════════════════════════════════════════════════════
  // 3. REACTIVE REAL-TIME STATS (Computed In-Memory Immediately)
  // ═══════════════════════════════════════════════════════════════
  const metrics = useMemo(() => {
    let totalSubTopics = 0
    let completedSubTopics = 0
    let totalPlannedLectures = 0
    let totalMarks = 0

    units.forEach(u => {
      totalPlannedLectures += Number(u.plannedTotalLectures || 0)
      totalMarks += Number(u.marksWeightage || 0)

      ;(u.chapters || []).forEach(ch => {
        ;(ch.subTopics || []).forEach(st => {
          totalSubTopics++
          if (st.isCompleted) completedSubTopics++
        })
      })
    })

    if (totalPlannedLectures === 0 && units.length > 0) {
      totalPlannedLectures = units.length * 8
    }

    const completionPercentage = totalSubTopics > 0
      ? Math.round((completedSubTopics / totalSubTopics) * 100)
      : 0

    // Pacing deviation
    const expectedDelivered = Math.round((completionPercentage / 100) * totalPlannedLectures)
    const deviation = deliveredCount - expectedDelivered

    let status = 'ON_TRACK'
    let statusLabel = 'On Pace (Optimal)'
    let statusColor = 'text-accent'

    if (deliveredCount > 0 && completionPercentage === 0) {
      status = 'BEHIND_SCHEDULE'
      statusLabel = 'Behind Pace (Log Progress)'
      statusColor = 'text-semantic-red'
    } else if (deviation <= -2) {
      status = 'AHEAD'
      statusLabel = `🚀 ${Math.abs(deviation)} Classes Ahead of Pace`
      statusColor = 'text-semantic-green'
    } else if (deviation >= 3) {
      status = 'BEHIND_SCHEDULE'
      statusLabel = `⚠️ ${deviation} Classes Behind Expected Pace`
      statusColor = 'text-semantic-red'
    }

    return {
      totalSubTopics,
      completedSubTopics,
      completionPercentage,
      totalPlannedLectures,
      totalMarks,
      deviation,
      status,
      statusLabel,
      statusColor
    }
  }, [units, deliveredCount])

  // Debounced / Direct Save to Cloud
  const persistSyllabus = useCallback(async (updatedUnits, updatedDelivered) => {
    if (!course?.id) return
    try {
      await saveSyllabusUnits(course.id, updatedUnits, {
        totalDeliveredLectures: updatedDelivered,
        totalPlannedLectures: updatedUnits.reduce((acc, u) => acc + Number(u.plannedTotalLectures || 8), 0)
      })
    } catch (err) {
      console.warn('Auto-save syllabus error:', err)
    }
  }, [course?.id])

  // Toggle Sub-topic Completion
  const handleToggleSubTopic = (unitIdx, chapIdx, subTopicIdx) => {
    const updated = JSON.parse(JSON.stringify(units))
    const st = updated[unitIdx].chapters[chapIdx].subTopics[subTopicIdx]
    st.isCompleted = !st.isCompleted
    st.completedAt = st.isCompleted ? new Date().toISOString() : null
    setUnits(updated)
    persistSyllabus(updated, deliveredCount)
  }

  // Edit Sub-topic Title
  const handleUpdateSubTopicTitle = (unitIdx, chapIdx, subTopicIdx, newTitle) => {
    const updated = [...units]
    updated[unitIdx].chapters[chapIdx].subTopics[subTopicIdx].title = newTitle
    setUnits(updated)
  }

  // Edit Sub-topic Hours
  const handleUpdateSubTopicHours = (unitIdx, chapIdx, subTopicIdx, hours) => {
    const updated = [...units]
    updated[unitIdx].chapters[chapIdx].subTopics[subTopicIdx].plannedHours = Number(hours) || 1
    setUnits(updated)
  }

  // Delete Sub-topic
  const handleDeleteSubTopic = (unitIdx, chapIdx, subTopicIdx) => {
    const updated = [...units]
    updated[unitIdx].chapters[chapIdx].subTopics.splice(subTopicIdx, 1)
    setUnits(updated)
    persistSyllabus(updated, deliveredCount)
  }

  // Add Sub-topic
  const handleAddSubTopic = (unitIdx, chapIdx) => {
    const updated = [...units]
    updated[unitIdx].chapters[chapIdx].subTopics.push({
      id: `st_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      title: 'New Topic / Practical Concept',
      plannedHours: 1.5,
      isCompleted: false
    })
    setUnits(updated)
    persistSyllabus(updated, deliveredCount)
  }

  // Add Chapter to Unit
  const handleAddChapter = (unitIdx) => {
    const updated = [...units]
    const chapCount = (updated[unitIdx].chapters || []).length + 1
    updated[unitIdx].chapters.push({
      title: `Chapter ${chapCount}: Advanced Modules`,
      subTopics: [
        { id: `st_${Date.now()}`, title: 'Core Concept Overview', plannedHours: 1.5, isCompleted: false }
      ]
    })
    setUnits(updated)
    persistSyllabus(updated, deliveredCount)
  }

  // Delete Chapter
  const handleDeleteChapter = (unitIdx, chapIdx) => {
    const updated = [...units]
    updated[unitIdx].chapters.splice(chapIdx, 1)
    setUnits(updated)
    persistSyllabus(updated, deliveredCount)
  }

  // Add Unit
  const handleAddUnit = () => {
    const newUnitNumber = units.length + 1
    const newUnit = {
      unitNumber: newUnitNumber,
      title: `Unit ${newUnitNumber}: Specialized Topics`,
      marksWeightage: Math.max(15, Math.round(100 / (newUnitNumber || 1))),
      plannedTotalLectures: 8,
      chapters: [
        {
          title: 'Foundational Principles',
          subTopics: [
            { id: `st_${Date.now()}`, title: 'Introductory Concept & Architecture', plannedHours: 1.5, isCompleted: false }
          ]
        }
      ]
    }
    const updated = [...units, newUnit]
    setUnits(updated)
    setExpandedUnits({ ...expandedUnits, [units.length]: true })
    persistSyllabus(updated, deliveredCount)
  }

  // Delete Unit
  const handleDeleteUnit = async (uIdx) => {
    const ok = await confirm(`Remove Unit ${units[uIdx].unitNumber} and all its chapters?`, {
      title: 'Delete Unit?',
      confirmLabel: 'Delete',
      destructive: true
    })
    if (!ok) return
    const updated = units.filter((_, idx) => idx !== uIdx).map((u, i) => ({ ...u, unitNumber: i + 1 }))
    setUnits(updated)
    persistSyllabus(updated, deliveredCount)
  }

  // Change Delivered Classes (+ / -)
  const handleDeliveredChange = (delta) => {
    const newVal = Math.max(0, deliveredCount + delta)
    setDeliveredCount(newVal)
    persistSyllabus(units, newVal)
  }

  // Manual Sync Live
  const handleManualSync = async () => {
    setSaving(true)
    try {
      await saveSyllabusUnits(course.id, units, {
        totalDeliveredLectures: deliveredCount,
        totalPlannedLectures: metrics.totalPlannedLectures
      })
      success('Syllabus Synchronized', 'All curriculum milestones and pacing progress saved.')
    } catch (err) {
      toastError('Save Error', err.message)
    } finally {
      setSaving(false)
    }
  }

  // Apply AI Preset
  const handleApplyPreset = () => {
    const preset = SYLLABUS_PRESETS.find(p => p.id === selectedPresetId)
    if (!preset) return
    setUnits(preset.units)
    setDeliveredCount(0)
    persistSyllabus(preset.units, 0)
    setShowAiModal(false)
    success('AI Syllabus Imported', `Loaded curriculum for "${preset.name}".`)
  }

  // Apply Parsed Text
  const handleApplyParsedText = () => {
    if (!rawPastedText.trim()) return
    const parsed = parseRawSyllabusText(rawPastedText)
    if (parsed.length === 0) {
      toastError('Parsing Failed', 'Could not detect units or chapters in the pasted text.')
      return
    }
    setUnits(parsed)
    setDeliveredCount(0)
    persistSyllabus(parsed, 0)
    setShowAiModal(false)
    setRawPastedText('')
    success('Smart Parser Complete', `Extracted ${parsed.length} units and allocated realistic lecture pacing.`)
  }

  const toggleExpandUnit = (idx) => {
    setExpandedUnits(prev => ({ ...prev, [idx]: !prev[idx] }))
  }

  return (
    <div className="space-y-5">
      {/* ════════ Top Pacing & Live Analytics KPI Cards ════════ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Card 1: Pacing Status */}
        <div className={cn(
          "p-4 rounded-2xl border flex items-center gap-3.5 shadow-sm transition-all",
          metrics.status === 'BEHIND_SCHEDULE'
            ? "bg-semantic-red/10 border-semantic-red/30 text-semantic-red"
            : metrics.status === 'AHEAD'
            ? "bg-semantic-green/10 border-semantic-green/30 text-semantic-green"
            : "bg-card border-border-subtle text-text-primary"
        )}>
          <div className="h-11 w-11 rounded-2xl bg-surface/90 border border-border-subtle flex items-center justify-center font-bold shrink-0 shadow-inner">
            {metrics.status === 'BEHIND_SCHEDULE' ? (
              <AlertTriangle className="h-5 w-5 text-semantic-red animate-pulse" />
            ) : metrics.status === 'AHEAD' ? (
              <Zap className="h-5 w-5 text-semantic-green" />
            ) : (
              <TrendingUp className="h-5 w-5 text-accent" />
            )}
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider block text-text-muted">Live Course Pacing</span>
            <span className="font-extrabold text-sm block leading-tight">{metrics.statusLabel}</span>
            <span className="text-[10px] text-text-muted block mt-0.5">
              {metrics.deviation < 0
                ? `${Math.abs(metrics.deviation)} classes ahead of schedule`
                : metrics.deviation > 0
                ? `${metrics.deviation} makeup classes needed`
                : 'Balanced class velocity'}
            </span>
          </div>
        </div>

        {/* Card 2: Delivered Classes vs Planned Lectures */}
        <div className="p-4 rounded-2xl bg-card border border-border-subtle flex items-center justify-between shadow-sm">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider block text-text-muted">Delivered Classes</span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="font-black text-xl text-text-primary">{deliveredCount}</span>
              <span className="text-xs text-text-muted font-bold">/ {metrics.totalPlannedLectures} Lectures</span>
            </div>
            <span className="text-[10px] text-text-muted block mt-0.5">
              {deliveredCount > metrics.totalPlannedLectures
                ? `+${deliveredCount - metrics.totalPlannedLectures} overtime sessions`
                : `${metrics.totalPlannedLectures - deliveredCount} lectures remaining`}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => handleDeliveredChange(-1)}
              disabled={deliveredCount <= 0}
              className="h-8 w-8 rounded-xl bg-surface hover:bg-surface/80 disabled:opacity-40 text-xs font-bold border border-border-subtle cursor-pointer flex items-center justify-center transition-colors"
              title="Decrease delivered class"
            >
              -
            </button>
            <button
              onClick={() => handleDeliveredChange(1)}
              className="px-3 h-8 rounded-xl bg-accent hover:bg-accent-light text-white text-xs font-bold shadow-md shadow-accent/20 cursor-pointer flex items-center gap-1 transition-colors"
              title="Log 1 delivered class"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Log</span>
            </button>
          </div>
        </div>

        {/* Card 3: Syllabus Completion Percentage */}
        <div className="p-4 rounded-2xl bg-card border border-border-subtle space-y-2 shadow-sm">
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-text-muted text-[10px] uppercase">Syllabus Completion</span>
            <span className="font-mono font-black text-sm text-accent">{metrics.completionPercentage}%</span>
          </div>

          <div className="w-full h-2 bg-surface rounded-full overflow-hidden border border-border-subtle">
            <div
              className="h-full bg-gradient-to-r from-accent to-accent-light rounded-full transition-all duration-300"
              style={{ width: `${metrics.completionPercentage}%` }}
            />
          </div>

          <span className="text-[10px] text-text-muted block font-medium">
            <span className="font-bold text-text-primary">{metrics.completedSubTopics}</span> of <span className="font-bold text-text-primary">{metrics.totalSubTopics}</span> sub-topics checked off
          </span>
        </div>

        {/* Card 4: Action & Auto-Sync Live */}
        <div className="p-4 rounded-2xl bg-card border border-border-subtle flex flex-col justify-between shadow-sm space-y-2">
          <div className="flex items-center justify-between text-[10px]">
            <span className="text-text-muted font-bold uppercase">Weightage Total</span>
            <span className={cn(
              "font-mono font-bold px-2 py-0.5 rounded-full border",
              metrics.totalMarks === 100
                ? "bg-semantic-green/10 text-semantic-green border-semantic-green/30"
                : "bg-amber-500/10 text-amber-600 border-amber-500/30"
            )}>
              {metrics.totalMarks} / 100 Marks
            </span>
          </div>

          <button
            onClick={handleManualSync}
            disabled={saving}
            className="w-full py-2.5 rounded-xl bg-accent hover:bg-accent-light text-white font-bold text-xs shadow-md shadow-accent/25 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Save className="h-3.5 w-3.5" />
            <span>{saving ? 'Syncing...' : 'Sync Live Changes'}</span>
          </button>
        </div>
      </div>

      {/* ════════ Action Bar & Smart Importer ════════ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-card border border-border-subtle shadow-sm">
        <div>
          <h3 className="font-bold text-sm text-text-primary flex items-center gap-2">
            <Layers className="h-4 w-4 text-accent" />
            Curriculum Structure & Sub-Topic Breakdown ({units.length} Units)
          </h3>
          <p className="text-xs text-text-muted mt-0.5">
            Click checkboxes to log taught topics. You can inline-edit any unit, chapter, or topic title directly.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setShowAiModal(true)}
            className="px-3.5 py-2 rounded-xl bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/30 text-purple-600 dark:text-purple-300 font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
          >
            <Wand2 className="h-3.5 w-3.5 text-purple-500" />
            <span>Smart AI Syllabus Importer</span>
          </button>

          <button
            onClick={handleAddUnit}
            className="px-3.5 py-2 rounded-xl bg-accent hover:bg-accent-light text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-accent/20 transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Add Unit</span>
          </button>
        </div>
      </div>

      {/* ════════ Units & Chapters Accordion Builder ════════ */}
      <div className="space-y-3.5">
        {units.map((unit, uIdx) => {
          const isExp = !!expandedUnits[uIdx]

          // Calculate unit-specific completion
          let unitSubTopics = 0
          let unitCompleted = 0
          ;(unit.chapters || []).forEach(ch => {
            ;(ch.subTopics || []).forEach(st => {
              unitSubTopics++
              if (st.isCompleted) unitCompleted++
            })
          })
          const unitPercent = unitSubTopics > 0 ? Math.round((unitCompleted / unitSubTopics) * 100) : 0

          return (
            <div key={uIdx} className="rounded-3xl border border-border-subtle bg-card overflow-hidden shadow-sm transition-all">
              {/* Unit Header */}
              <div
                onClick={() => toggleExpandUnit(uIdx)}
                className="p-4 bg-surface/50 hover:bg-surface flex items-center justify-between cursor-pointer transition-colors border-b border-border-subtle"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <span className="h-8 w-8 rounded-xl bg-accent/20 text-accent font-mono font-black text-xs flex items-center justify-center shrink-0 shadow-inner">
                    U{unit.unitNumber || uIdx + 1}
                  </span>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-bold text-sm text-text-primary truncate">{unit.title}</h4>
                      <span className="px-2 py-0.5 rounded-md bg-accent/10 text-accent text-[10px] font-bold font-mono">
                        {unitPercent}% Completed
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-text-muted mt-0.5">
                      <span>Weightage: <span className="font-bold text-text-primary">{unit.marksWeightage || 20} Marks</span></span>
                      <span>•</span>
                      <span>Planned: <span className="font-bold text-text-primary">{unit.plannedTotalLectures || 8} Classes</span></span>
                      <span>•</span>
                      <span>{unitCompleted}/{unitSubTopics} Topics</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 ml-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDeleteUnit(uIdx)
                    }}
                    className="p-1.5 rounded-lg text-text-muted hover:text-semantic-red hover:bg-surface cursor-pointer transition-colors"
                    title="Delete Unit"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>

                  <div className="p-1 text-text-muted">
                    {isExp ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  </div>
                </div>
              </div>

              {/* Unit Details & Editable Structure */}
              {isExp && (
                <div className="p-5 space-y-4 text-xs bg-base/30">
                  {/* Unit Metadata Editor */}
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 p-3.5 rounded-2xl bg-surface/70 border border-border-subtle">
                    <div className="sm:col-span-6 space-y-1">
                      <label className="font-bold text-text-secondary block text-[11px]">Unit Title</label>
                      <input
                        type="text"
                        value={unit.title}
                        onChange={(e) => {
                          const updated = [...units]
                          updated[uIdx].title = e.target.value
                          setUnits(updated)
                        }}
                        placeholder="e.g. Unit 1: Graph Theory & Shortest Paths"
                        className="w-full bg-card border border-border-subtle rounded-xl px-3 py-2 text-text-primary font-bold focus:outline-none focus:border-accent"
                      />
                    </div>

                    <div className="sm:col-span-3 space-y-1">
                      <label className="font-bold text-text-secondary block text-[11px]">Marks Weightage</label>
                      <div className="flex items-center gap-1.5">
                        <input
                          type="number"
                          min="1"
                          max="100"
                          value={unit.marksWeightage}
                          onChange={(e) => {
                            const updated = [...units]
                            updated[uIdx].marksWeightage = Number(e.target.value) || 0
                            setUnits(updated)
                          }}
                          className="w-full bg-card border border-border-subtle rounded-xl px-3 py-2 text-text-primary font-mono font-bold focus:outline-none focus:border-accent"
                        />
                        <span className="text-text-muted font-bold">Marks</span>
                      </div>
                    </div>

                    <div className="sm:col-span-3 space-y-1">
                      <label className="font-bold text-text-secondary block text-[11px]">Planned Lectures</label>
                      <div className="flex items-center gap-1.5">
                        <input
                          type="number"
                          min="1"
                          max="50"
                          value={unit.plannedTotalLectures}
                          onChange={(e) => {
                            const updated = [...units]
                            updated[uIdx].plannedTotalLectures = Number(e.target.value) || 1
                            setUnits(updated)
                          }}
                          className="w-full bg-card border border-border-subtle rounded-xl px-3 py-2 text-text-primary font-mono font-bold focus:outline-none focus:border-accent"
                        />
                        <span className="text-text-muted font-bold">Classes</span>
                      </div>
                    </div>
                  </div>

                  {/* Chapters List */}
                  <div className="space-y-3">
                    {(unit.chapters || []).map((chap, cIdx) => (
                      <div key={cIdx} className="p-4 rounded-2xl bg-card border border-border-subtle space-y-3 shadow-xs">
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <input
                            type="text"
                            value={chap.title}
                            onChange={(e) => {
                              const updated = [...units]
                              updated[uIdx].chapters[cIdx].title = e.target.value
                              setUnits(updated)
                            }}
                            placeholder="Chapter / Module Name"
                            className="bg-surface/80 border border-border-subtle rounded-xl px-3 py-1.5 text-text-primary font-bold text-xs focus:outline-none focus:border-accent flex-1 max-w-md"
                          />

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleAddSubTopic(uIdx, cIdx)}
                              className="px-2.5 py-1.5 rounded-xl bg-accent/15 hover:bg-accent text-accent hover:text-white text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer"
                            >
                              <Plus className="h-3 w-3" />
                              <span>Sub-Topic</span>
                            </button>

                            <button
                              onClick={() => handleDeleteChapter(uIdx, cIdx)}
                              className="p-1.5 rounded-xl text-text-muted hover:text-semantic-red hover:bg-surface cursor-pointer transition-colors"
                              title="Delete Chapter"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        </div>

                        {/* Interactive Sub-Topics Check-off list */}
                        <div className="space-y-1.5">
                          {(chap.subTopics || []).map((st, sIdx) => (
                            <div
                              key={st.id || sIdx}
                              className={cn(
                                "p-2.5 rounded-xl border transition-all flex items-center justify-between gap-2.5",
                                st.isCompleted
                                  ? "bg-semantic-green/10 border-semantic-green/30 text-text-primary"
                                  : "bg-surface/70 border-border-subtle text-text-secondary hover:border-accent/30"
                              )}
                            >
                              <div className="flex items-center gap-3 flex-1 min-w-0">
                                <button
                                  type="button"
                                  onClick={() => handleToggleSubTopic(uIdx, cIdx, sIdx)}
                                  className="text-text-muted hover:text-accent cursor-pointer transition-transform active:scale-90"
                                >
                                  {st.isCompleted ? (
                                    <CheckSquare className="h-4 w-4 text-semantic-green" />
                                  ) : (
                                    <Square className="h-4 w-4 text-text-muted hover:text-text-primary" />
                                  )}
                                </button>

                                <input
                                  type="text"
                                  value={st.title}
                                  onChange={(e) => handleUpdateSubTopicTitle(uIdx, cIdx, sIdx, e.target.value)}
                                  placeholder="Sub-topic description..."
                                  className={cn(
                                    "bg-transparent border-none p-0 text-xs font-medium focus:outline-none focus:ring-0 flex-1 min-w-0",
                                    st.isCompleted && "line-through text-text-muted"
                                  )}
                                />
                              </div>

                              <div className="flex items-center gap-2 shrink-0">
                                <div className="flex items-center gap-1 bg-base px-2 py-0.5 rounded-lg border border-border-subtle font-mono text-[10px]">
                                  <input
                                    type="number"
                                    step="0.5"
                                    min="0.5"
                                    max="10"
                                    value={st.plannedHours || 1}
                                    onChange={(e) => handleUpdateSubTopicHours(uIdx, cIdx, sIdx, e.target.value)}
                                    className="w-8 bg-transparent text-center font-bold text-text-primary focus:outline-none"
                                  />
                                  <span className="text-text-muted">hrs</span>
                                </div>

                                {st.isCompleted && (
                                  <span className="px-1.5 py-0.5 rounded bg-semantic-green/20 text-semantic-green text-[9px] font-bold">
                                    Done
                                  </span>
                                )}

                                <button
                                  onClick={() => handleDeleteSubTopic(uIdx, cIdx, sIdx)}
                                  className="p-1 text-text-muted hover:text-semantic-red transition-colors cursor-pointer"
                                  title="Delete Sub-Topic"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </button>
                              </div>
                            </div>
                          ))}

                          {(chap.subTopics || []).length === 0 && (
                            <div className="p-3 text-center text-text-muted text-[11px] border border-dashed border-border-subtle rounded-xl">
                              No sub-topics in this chapter. Click "+ Sub-Topic" above.
                            </div>
                          )}
                        </div>
                      </div>
                    ))}

                    <button
                      onClick={() => handleAddChapter(uIdx)}
                      className="w-full py-2.5 rounded-xl border border-dashed border-border-subtle hover:border-accent/40 bg-surface/40 hover:bg-surface text-text-secondary hover:text-accent font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>Add Chapter to Unit {unit.unitNumber || uIdx + 1}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )
        })}

        {units.length === 0 && (
          <div className="p-12 text-center rounded-3xl bg-card border border-dashed border-border-subtle space-y-3">
            <BookOpen className="h-10 w-10 text-accent mx-auto" />
            <h4 className="font-bold text-base text-text-primary">No Curriculum Units Added Yet</h4>
            <p className="text-xs text-text-muted max-w-sm mx-auto">
              Use the Smart AI Syllabus Importer to load a standard curriculum in 1-click or paste your custom syllabus copy.
            </p>
            <button
              onClick={() => setShowAiModal(true)}
              className="px-5 py-2.5 rounded-2xl bg-accent text-white font-bold text-xs shadow-lg shadow-accent/25 cursor-pointer inline-flex items-center gap-2"
            >
              <Wand2 className="h-4 w-4" />
              <span>Import AI Syllabus Preset</span>
            </button>
          </div>
        )}
      </div>

      {/* ════════ Smart AI Syllabus Importer Modal ════════ */}
      <Dialog open={showAiModal} onOpenChange={setShowAiModal}>
        <DialogContent className="max-w-2xl bg-card border border-border-subtle rounded-3xl p-6 text-text-primary">
          <DialogHeader className="pb-3 border-b border-border-subtle">
            <DialogTitle className="font-bold text-lg text-text-primary flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-accent" />
              Smart AI Syllabus Generator & Importer
            </DialogTitle>
            <DialogDescription className="text-xs text-text-muted">
              Instantly populate units, chapters, estimated lecture hours, and 100-mark weightages without manual typing.
            </DialogDescription>
          </DialogHeader>

          {/* Import Modes Tab */}
          <div className="flex items-center gap-2 p-1 rounded-xl bg-surface border border-border-subtle text-xs">
            <button
              type="button"
              onClick={() => setActiveAiTab('preset')}
              className={cn(
                "flex-1 py-2 rounded-lg font-bold transition-all cursor-pointer text-center",
                activeAiTab === 'preset' ? "bg-card text-accent shadow-sm border border-border-subtle" : "text-text-muted hover:text-text-primary"
              )}
            >
              Curated Subject Presets (1-Click)
            </button>
            <button
              type="button"
              onClick={() => setActiveAiTab('text')}
              className={cn(
                "flex-1 py-2 rounded-lg font-bold transition-all cursor-pointer text-center",
                activeAiTab === 'text' ? "bg-card text-accent shadow-sm border border-border-subtle" : "text-text-muted hover:text-text-primary"
              )}
            >
              Paste Raw Syllabus Text / Outline
            </button>
          </div>

          {activeAiTab === 'preset' ? (
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-72 overflow-y-auto pr-1">
                {SYLLABUS_PRESETS.map((preset) => {
                  const isSel = selectedPresetId === preset.id
                  return (
                    <div
                      key={preset.id}
                      onClick={() => setSelectedPresetId(preset.id)}
                      className={cn(
                        "p-3.5 rounded-2xl border cursor-pointer transition-all space-y-1.5",
                        isSel
                          ? "bg-accent/15 border-accent ring-2 ring-accent/30 text-accent font-bold"
                          : "bg-surface/70 border-border-subtle text-text-secondary hover:border-accent/40"
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-text-primary">{preset.name}</span>
                        {isSel && <Check className="h-4 w-4 text-accent" />}
                      </div>
                      <div className="text-[10px] text-text-muted flex items-center gap-2">
                        <span>{preset.units.length} Units</span>
                        <span>•</span>
                        <span>{preset.totalPlannedClasses} Planned Lectures</span>
                        <span>•</span>
                        <span>100 Marks</span>
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className="p-3.5 rounded-2xl bg-purple-500/10 border border-purple-500/25 flex items-start gap-2.5">
                <Sparkles className="h-4 w-4 text-purple-500 shrink-0 mt-0.5" />
                <p className="text-[11px] text-purple-600 dark:text-purple-300 leading-relaxed">
                  Applying this preset will configure balanced university modules, assign realistic lecture hour durations per chapter, and distribute marks proportionally.
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAiModal(false)}
                  className="px-4 py-2 rounded-xl text-text-secondary hover:text-text-primary font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleApplyPreset}
                  className="px-6 py-2.5 rounded-xl bg-accent hover:bg-accent-light text-white font-bold shadow-lg shadow-accent/25 cursor-pointer"
                >
                  Apply Curriculum Preset
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold text-text-primary block">
                  Paste your Syllabus Text (from PDF, University Portal, or Notes)
                </label>
                <textarea
                  rows={8}
                  value={rawPastedText}
                  onChange={(e) => setRawPastedText(e.target.value)}
                  placeholder={`Unit 1: Introduction to Web Architectures
- Client Server Model, DNS, HTTP/HTTPS
- HTML5 Semantics, CSS3 Flexbox & Grid, Responsive Design

Unit 2: Modern JavaScript & Frontend Frameworks
- ES6+ Syntax, Promises, Async/Await
- React Component Lifecycle, State Management, Hooks

Unit 3: Backend REST APIs & Databases
- Node.js Runtime, Express Routing, Middleware
- MongoDB & PostgreSQL Data Modeling`}
                  className="w-full bg-base border border-border-subtle rounded-2xl p-3.5 text-text-primary font-mono text-xs focus:outline-none focus:border-accent resize-none leading-relaxed"
                />
              </div>

              <div className="p-3.5 rounded-2xl bg-purple-500/10 border border-purple-500/25 flex items-start gap-2.5">
                <Sparkles className="h-4 w-4 text-purple-500 shrink-0 mt-0.5" />
                <p className="text-[11px] text-purple-600 dark:text-purple-300 leading-relaxed">
                  Our Smart Parser automatically extracts Units, splits topics, allocates realistic lecture hours, and balances marks weightage to 100 marks automatically.
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAiModal(false)}
                  className="px-4 py-2 rounded-xl text-text-secondary hover:text-text-primary font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleApplyParsedText}
                  disabled={!rawPastedText.trim()}
                  className="px-6 py-2.5 rounded-xl bg-accent hover:bg-accent-light disabled:opacity-50 text-white font-bold shadow-lg shadow-accent/25 cursor-pointer flex items-center gap-1.5"
                >
                  <Wand2 className="h-4 w-4" />
                  <span>Parse & Generate Structure</span>
                </button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
