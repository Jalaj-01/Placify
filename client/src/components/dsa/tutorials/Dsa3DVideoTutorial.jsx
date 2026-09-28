import { useState, useEffect, useRef } from 'react'
import {
  Play, Pause, RotateCcw, Volume2, VolumeX, Maximize2, Minimize2,
  Film, Sparkles, Clock, CheckCircle2, ChevronRight, Video,
  BookOpen, Compass, ExternalLink, Bookmark, Share2, Layers,
  GraduationCap, Award, Check, ListChecks, FileText, UserCheck,
  ChevronDown, ChevronUp, Mic, Headphones, MonitorPlay
} from 'lucide-react'
import DsaCanvas3D from '@/components/dsa/visualizer/DsaCanvas3D'
import PlacifyMasterclassVideoPlayer from './PlacifyMasterclassVideoPlayer'
import { Button } from '@/components/ui/button'

// 100% Proprietary Placify 3D Masterclass Video Curriculum (Zero YouTube Embeds)
const COURSE_CURRICULUM = [
  {
    moduleNumber: 1,
    title: 'Module 1: Foundations & Memory Architecture',
    lessons: [
      {
        id: '1-fundamentals',
        title: 'Data Structures, Hardware RAM & Big-O Asymptotic Complexity',
        creator: 'Dr. Alisha Sharma (Placify AI Algorithms Faculty)',
        badge: 'PLACIFY ORIGINALS',
        duration: '14:20',
        completed: true,
        chapters: [
          { time: '00:00', title: 'Abstract Data Types & RAM Hardware Architecture' },
          { time: '03:15', title: 'Contiguous Physical Memory & L1 Cache Locality' },
          { time: '07:30', title: 'Pointer Dereferencing & Indirection Overhead' },
          { time: '11:00', title: 'Asymptotic Bounds: O(1) to O(2^N) Mathematical Proof' },
        ],
        takeaways: [
          'Memory address calculation: base + (index * sizeof(type)) provides true O(1) random access.',
          'CPU cache line size (64 bytes) prefetches contiguous blocks into fast L1 cache, avoiding DRAM bottlenecks.',
          'Heap dynamic allocations carry pointer dereference overhead and cache miss risk.',
        ],
        videoScenes: [
          {
            timestamp: '00:00',
            durationSeconds: 14,
            title: 'Abstract Data Types & RAM Hardware Architecture',
            subtitle: 'Contiguous Physical Memory & Pointer Indirection',
            narration:
              'Welcome to the Placify Original Data Structures Masterclass. I am Dr. Alisha Sharma. In this lecture, we explore how data structures map onto physical hardware memory. Notice how values reside in contiguous memory cells.',
            codeSnippet: `// 1. Contiguous Memory Allocation\nconst memoryGrid = [10, 25, 40, 65, 80];\n// Physical Hardware Offset: base + (index * 4 bytes)\nconst accessVal = memoryGrid[0]; // Instantaneous O(1)`,
            activeLine: 2,
            sceneState: {
              type: 'array_1d',
              array: [10, 25, 40, 65, 80],
              data: [10, 25, 40, 65, 80],
              pointers: [{ name: 'BASE (0x7ffe10)', index: 0, color: '#38bdf8' }],
              highlightIndices: [0]
            },
            telemetry: { time: 'O(1)', space: 'O(1)', address: '0x7ffe10', cacheState: 'L1 Cache Hit' }
          },
          {
            timestamp: '03:15',
            durationSeconds: 14,
            title: 'Contiguous Physical Memory & L1 Cache Locality',
            subtitle: 'CPU Cache Lines and Spatial Locality Prefetching',
            narration:
              'Because array elements are stored contiguously in memory, the CPU hardware pre-fetches an entire 64-byte cache line into high-speed L1 cache. This gives contiguous structures massive performance advantages over fragmented pointer links.',
            codeSnippet: `// 2. Sequential Access Pattern\nfor (let i = 0; i < memoryGrid.length; i++) {\n  // Sequential cache line prefetching\n  console.log(memoryGrid[i]);\n}`,
            activeLine: 3,
            sceneState: {
              type: 'array_1d',
              array: [10, 25, 40, 65, 80],
              data: [10, 25, 40, 65, 80],
              pointers: [
                { name: 'CACHE_PTR', index: 2, color: '#22c55e' },
                { name: 'NEXT_FETCH', index: 3, color: '#f59e0b' }
              ],
              highlightIndices: [2, 3]
            },
            telemetry: { time: 'O(N)', space: 'O(1)', address: '0x7ffe18', cacheState: 'L1 Pre-Fetched' }
          },
          {
            timestamp: '07:30',
            durationSeconds: 14,
            title: 'Pointer Dereferencing & Indirection Overhead',
            subtitle: 'Heap Fragmentation vs Contiguous Storage',
            narration:
              'When nodes are allocated dynamically on the heap, each element requires pointer indirection. While this grants dynamic reconfigurability, it trades off hardware cache locality.',
            codeSnippet: `// 3. Pointer Dereferencing\nclass Node {\n  constructor(val) { this.val = val; this.next = null; }\n}\n// Node lookup requires pointer chasing: ptr = ptr.next;`,
            activeLine: 5,
            sceneState: {
              type: 'linked_list',
              nodes: [
                { id: 0, val: 10, nextId: 1 },
                { id: 1, val: 25, nextId: 2 },
                { id: 2, val: 40, nextId: 3 },
                { id: 3, val: 65, nextId: null }
              ],
              data: [10, 25, 40, 65],
              pointers: [{ name: 'HEAD_PTR (0x8a92f0)', nodeId: 0, color: '#ec4899' }],
              highlightIndices: [0, 1]
            },
            telemetry: { time: 'O(N)', space: 'O(N)', address: '0x8a92f0', cacheState: 'Cache Miss' }
          },
          {
            timestamp: '11:00',
            durationSeconds: 14,
            title: 'Asymptotic Bounds: O(1) to O(N)',
            subtitle: 'Evaluating Worst-Case Growth Invariants',
            narration:
              'Understanding asymptotic bounds allows us to evaluate memory and runtime growth invariants before committing code to production. Let us proceed to linear arrays in our next phase.',
            codeSnippet: `// 4. Asymptotic Invariant Summary\n// Access: O(1) | Search: O(N) or O(log N)\n// Insertion: O(N) | Space: O(N)\nconsole.log("Memory Foundations Mastered.");`,
            activeLine: 3,
            sceneState: {
              type: 'array_1d',
              array: [10, 25, 40, 65, 80],
              data: [10, 25, 40, 65, 80],
              pointers: [{ name: 'VERIFIED', index: 4, color: '#22c55e' }],
              highlightIndices: [0, 1, 2, 3, 4]
            },
            telemetry: { time: 'O(1)', space: 'O(1)', address: '0x7ffe20', cacheState: 'Optimal Invariant' }
          }
        ]
      },
    ],
  },
  {
    moduleNumber: 2,
    title: 'Module 2: Linear Data Structures & Dynamic Matrices',
    lessons: [
      {
        id: '2-arrays',
        title: 'Arrays, Two Pointers & Kadane Subarray Masterclass',
        creator: 'Dr. Alisha Sharma (Placify AI Algorithms Faculty)',
        badge: 'PLACIFY ORIGINALS',
        duration: '16:30',
        completed: false,
        chapters: [
          { time: '00:00', title: 'Contiguous Array Memory & Instant Access' },
          { time: '04:10', title: 'Two Pointers Monotonic Inward Scan' },
          { time: '08:45', title: "Kadane's Dynamic Maximum Subarray Invariant" },
          { time: '12:30', title: 'Dynamic Array Capacity Doubling & Geometric Growth' },
        ],
        takeaways: [
          'Doubling strategy (capacity * 2) guarantees amortized O(1) append time.',
          'Kadane algorithm discards negative accumulated prefix sums to find global max in O(N).',
          '2D matrices are flattened linearly in row-major order: index = r * cols + c.',
        ],
        videoScenes: [
          {
            timestamp: '00:00',
            durationSeconds: 14,
            title: 'Contiguous Array Memory & Instant Access',
            subtitle: 'Base Memory Address & Hardware Index Offsets',
            narration:
              'In this masterclass, we explore how 1D arrays and 2D matrices map into hardware memory. With a base address, accessing index 2 requires zero iteration: the hardware computes the offset directly.',
            codeSnippet: `// 1. Contiguous Array Indexing\nconst arr = [12, 35, 48, 62, 79];\n// Memory offset = 0x7ffe40 + (2 * 4) = 0x7ffe48\nconst element = arr[2]; // 48`,
            activeLine: 3,
            sceneState: {
              type: 'array_1d',
              data: [12, 35, 48, 62, 79],
              pointers: [{ name: 'ACCESS [2]', index: 2, color: 'accent' }],
              highlightedIndices: [2]
            },
            telemetry: { time: 'O(1)', space: 'O(1)', address: '0x7ffe48', cacheState: 'L1 Hit' }
          },
          {
            timestamp: '04:10',
            durationSeconds: 15,
            title: 'Two Pointers Monotonic Inward Scan',
            subtitle: 'Pointers Moving Simultaneously from Left and Right',
            narration:
              'Observe the two pointers visualizer. Left starts at index 0, and right starts at the end. By comparing the elements and moving inward based on a monotonicity condition, we eliminate quadratic complexity and achieve linear O(N) runtime.',
            codeSnippet: `// 2. Two Pointers Algorithm\nlet left = 0, right = arr.length - 1;\nwhile (left < right) {\n  if (arr[left] + arr[right] === target) break;\n  else if (arr[left] + arr[right] < target) left++;\n  else right--;\n}`,
            activeLine: 4,
            sceneState: {
              type: 'array_1d',
              data: [12, 35, 48, 62, 79],
              pointers: [
                { name: 'LEFT', index: 1, color: 'accent' },
                { name: 'RIGHT', index: 3, color: 'warning' }
              ],
              highlightedIndices: [1, 3]
            },
            telemetry: { time: 'O(N)', space: 'O(1)', address: '0x7ffe4c', cacheState: 'Monotonic Scan' }
          },
          {
            timestamp: '08:45',
            durationSeconds: 15,
            title: "Kadane's Dynamic Maximum Subarray Invariant",
            subtitle: 'Discarding Negative Accumulated Prefixes',
            narration:
              'Kadane algorithm maintains a local accumulated sum. If the local sum dips below zero, carrying it forward only hurts subsequent sums, so we reset local sum to zero at the current element.',
            codeSnippet: `// 3. Kadane Maximum Subarray\nlet maxSoFar = -Infinity, currMax = 0;\nfor (let num of arr) {\n  currMax = Math.max(num, currMax + num);\n  maxSoFar = Math.max(maxSoFar, currMax);\n}`,
            activeLine: 3,
            sceneState: {
              type: 'array_1d',
              data: [12, -25, 48, 62, -10],
              pointers: [{ name: 'MAX_SUB', index: 3, color: 'success' }],
              highlightedIndices: [2, 3]
            },
            telemetry: { time: 'O(N)', space: 'O(1)', address: '0x7ffe50', cacheState: 'Optimal Kadane' }
          },
          {
            timestamp: '12:30',
            durationSeconds: 15,
            title: 'Dynamic Array Capacity Doubling & 2D Matrix Grid',
            subtitle: 'Geometric Resizing and Row-Major Memory Mapping',
            narration:
              'When a dynamic array runs out of capacity, it doubles its size and copies elements over. In 2D matrices, elements are mapped row-by-row into a linear buffer using row times columns plus column.',
            codeSnippet: `// 4. 2D Matrix Row-Major Indexing\n// Index = (row * cols) + col\nconst matrix = [\n  [1, 2, 3],\n  [4, 5, 6],\n  [7, 8, 9]\n];`,
            activeLine: 3,
            sceneState: {
              type: 'array_2d',
              matrix: [
                [1, 2, 3],
                [4, 5, 6],
                [7, 8, 9]
              ],
              activeCell: { r: 1, c: 1 },
              highlightedRow: 1
            },
            telemetry: { time: 'O(1)', space: 'O(N*M)', address: '0x7ffe58', cacheState: 'Row-Major Grid' }
          }
        ]
      },
      {
        id: '4-linked-lists',
        title: 'Linked Lists, Doubly Pointers & Floyd Cycle Detection',
        creator: 'Dr. Alisha Sharma (Placify AI Algorithms Faculty)',
        badge: 'PLACIFY ORIGINALS',
        duration: '15:45',
        completed: false,
        chapters: [
          { time: '00:00', title: 'Dynamic Heap Nodes & Next Pointer Topologies' },
          { time: '04:20', title: '3-Pointer In-Place Reversal (prev, curr, next)' },
          { time: '08:50', title: 'Doubly Linked List Bidirectional Cylinders' },
          { time: '12:15', title: 'Floyd Tortoise & Hare Cycle Collision Proof' },
        ],
        takeaways: [
          'Inverting pointers in-place uses O(1) auxiliary memory without allocating new nodes.',
          'Floyd Cycle Detection mathematically proves collision inside loop when fast moves 2x slow.',
          'Dummy heads eliminate boundary checks when inserting or deleting the first node.',
        ],
        videoScenes: [
          {
            timestamp: '00:00',
            durationSeconds: 14,
            title: 'Dynamic Heap Nodes & Next Pointer Topologies',
            subtitle: 'Non-Contiguous Memory Chaining with Next Addresses',
            narration:
              'Welcome to the Linked List Masterclass. Unlike arrays, linked list nodes reside in non-contiguous heap memory, chained together by explicit next pointers. This makes insertions and deletions O(1) when the pointer is known.',
            codeSnippet: `// 1. Linked List Node Topology\nclass ListNode {\n  constructor(val) { this.val = val; this.next = null; }\n}\nconst head = new ListNode(10);`,
            activeLine: 4,
            sceneState: {
              type: 'linked_list',
              data: [10, 20, 30, 40],
              pointers: [{ name: 'HEAD', index: 0, color: 'accent' }],
              highlightedIndices: [0]
            },
            telemetry: { time: 'O(1)', space: 'O(N)', address: '0x9b1010', cacheState: 'Heap Allocated' }
          },
          {
            timestamp: '04:20',
            durationSeconds: 15,
            title: '3-Pointer In-Place Reversal (prev, curr, next)',
            subtitle: 'Reversing Pointer Direction Without Allocating Memory',
            narration:
              'Watch the 3D scene carefully. To reverse a linked list in-place, we maintain three pointers: prev, curr, and next. We stash curr.next, redirect curr.next to prev, then advance prev and curr forward.',
            codeSnippet: `// 2. In-Place List Inversion\nlet prev = null, curr = head;\nwhile (curr) {\n  let nxt = curr.next; // save next node\n  curr.next = prev;     // reverse arrow\n  prev = curr; curr = nxt;\n}`,
            activeLine: 4,
            sceneState: {
              type: 'linked_list',
              data: [10, 20, 30, 40],
              pointers: [
                { name: 'PREV', index: 0, color: 'warning' },
                { name: 'CURR', index: 1, color: 'accent' },
                { name: 'NEXT', index: 2, color: 'success' }
              ],
              highlightedIndices: [0, 1]
            },
            telemetry: { time: 'O(N)', space: 'O(1)', address: '0x9b1020', cacheState: 'In-Place Reversal' }
          },
          {
            timestamp: '08:50',
            durationSeconds: 15,
            title: 'Doubly Linked List Bidirectional Cylinders',
            subtitle: 'Next and Prev Pointers for Bi-directional Traversal',
            narration:
              'In a doubly linked list, each node stores both next and previous pointers. Notice the dual cyan and magenta arrows in our 3D visualization, enabling bidirectional navigation and O(1) removal of any given node.',
            codeSnippet: `// 3. Doubly Linked List\nnode.next = nxt;\nif (nxt) nxt.prev = node;\nnode.prev = prv;\nif (prv) prv.next = node;`,
            activeLine: 2,
            sceneState: {
              type: 'linked_list',
              data: [10, 20, 30, 40],
              isDoubly: true,
              pointers: [{ name: 'ACTIVE', index: 1, color: 'accent' }],
              highlightedIndices: [1]
            },
            telemetry: { time: 'O(1)', space: 'O(N)', address: '0x9b1030', cacheState: 'Doubly Linked' }
          },
          {
            timestamp: '12:15',
            durationSeconds: 15,
            title: 'Floyd Tortoise & Hare Cycle Collision Proof',
            subtitle: 'Relative Speed of 1 Node per Step Guarantees Collision',
            narration:
              'Floyd Cycle-Finding algorithm sends two pointers through the list: slow moves one step, and fast moves two steps. Because fast gains one step per iteration on slow, they are mathematically guaranteed to collide if a loop exists.',
            codeSnippet: `// 4. Floyd Cycle Detection\nlet slow = head, fast = head;\nwhile (fast && fast.next) {\n  slow = slow.next;\n  fast = fast.next.next;\n  if (slow === fast) return true; // Cycle Found!\n}`,
            activeLine: 4,
            sceneState: {
              type: 'linked_list',
              data: [10, 20, 30, 40, 50],
              isCircular: true,
              pointers: [
                { name: 'SLOW (1x)', index: 2, color: 'accent' },
                { name: 'FAST (2x)', index: 4, color: 'warning' }
              ],
              highlightedIndices: [2, 4]
            },
            telemetry: { time: 'O(N)', space: 'O(1)', address: '0x9b1040', cacheState: 'Loop Detected' }
          }
        ]
      },
    ],
  },
  {
    moduleNumber: 3,
    title: 'Module 3: Stacks, Queues & Monotonic Models',
    lessons: [
      {
        id: '5-stack',
        title: 'Stack ADT, LIFO Mechanics & Monotonic Next Greater Element',
        creator: 'Dr. Alisha Sharma (Placify AI Algorithms Faculty)',
        badge: 'PLACIFY ORIGINALS',
        duration: '14:50',
        completed: false,
        chapters: [
          { time: '00:00', title: 'Stack LIFO Call Stack Mechanism' },
          { time: '04:15', title: 'Parentheses Validation & Expression Parsing' },
          { time: '08:30', title: 'Monotonic Decreasing Stack for Next Greater' },
          { time: '11:45', title: 'Largest Rectangle in Histogram O(N)' },
        ],
        takeaways: [
          'LIFO stack enforces push and pop strictly at the TOP in O(1) time.',
          'Monotonic stack stores unresolved indices in monotonic order, resolving answers in linear time.',
        ],
        videoScenes: [
          {
            timestamp: '00:00',
            durationSeconds: 14,
            title: 'Stack LIFO Call Stack Mechanism',
            subtitle: 'Last-In First-Out Vertical Container Mechanics',
            narration:
              'In this masterclass, we examine the Stack data structure. A stack operates strictly on the Last-In First-Out principle. Pushing adds to the top, and popping extracts from the top, both executing in O(1) time.',
            codeSnippet: `// 1. Stack Push & Pop\nconst stack = [];\nstack.push(10); // O(1) push top\nstack.push(20);\nconst topElem = stack.pop(); // O(1) pop 20`,
            activeLine: 3,
            sceneState: {
              type: 'stack',
              data: [10, 20, 30],
              pointers: [{ name: 'TOP', index: 2, color: 'accent' }],
              highlightedIndices: [2]
            },
            telemetry: { time: 'O(1)', space: 'O(N)', address: '0x882010', cacheState: 'Top of Stack' }
          },
          {
            timestamp: '04:15',
            durationSeconds: 15,
            title: 'Parentheses Validation & Expression Parsing',
            subtitle: 'Matching Opening & Closing Brackets',
            narration:
              'When parsing nested expressions, each opening bracket is pushed onto the stack. When a closing bracket is encountered, we pop the top: if the brackets do not match, the expression is invalid.',
            codeSnippet: `// 2. Valid Parentheses\nconst map = { ')': '(', '}': '{', ']': '[' };\nfor (let ch of s) {\n  if (['(', '{', '['].includes(ch)) stack.push(ch);\n  else if (stack.pop() !== map[ch]) return false;\n}`,
            activeLine: 3,
            sceneState: {
              type: 'stack',
              data: ['(', '[', '{'],
              pointers: [{ name: 'MATCH_TOP', index: 2, color: 'success' }],
              highlightedIndices: [2]
            },
            telemetry: { time: 'O(N)', space: 'O(N)', address: '0x882020', cacheState: 'Valid Match' }
          },
          {
            timestamp: '08:30',
            durationSeconds: 15,
            title: 'Monotonic Decreasing Stack for Next Greater',
            subtitle: 'Storing Unresolved Indices in Strictly Decreasing Order',
            narration:
              'A monotonic stack maintains elements in sorted order. When a new element arrives that is larger than the stack top, it pops the top and resolves that element as the next greater value in linear O(N) time.',
            codeSnippet: `// 3. Monotonic Next Greater Element\nwhile (stack.length && arr[stack[stack.length - 1]] < current) {\n  const idx = stack.pop();\n  result[idx] = current; // Resolved!\n}\nstack.push(i);`,
            activeLine: 2,
            sceneState: {
              type: 'stack',
              data: [80, 50, 25],
              pointers: [{ name: 'NEXT_GREATER', index: 2, color: 'warning' }],
              highlightedIndices: [2]
            },
            telemetry: { time: 'O(N)', space: 'O(N)', address: '0x882030', cacheState: 'Monotonic Invariant' }
          }
        ]
      },
      {
        id: '6-queue-deque',
        title: 'Circular Queue, Ring Buffers & Monotonic Deque',
        creator: 'Dr. Alisha Sharma (Placify AI Algorithms Faculty)',
        badge: 'PLACIFY ORIGINALS',
        duration: '15:10',
        completed: false,
        chapters: [
          { time: '00:00', title: 'Queue FIFO & Modulo Ring Buffer Arithmetic' },
          { time: '04:30', title: 'Double-Ended Queue (Deque) Implementation' },
          { time: '09:15', title: 'Sliding Window Maximum using Deque in O(N)' },
        ],
        takeaways: [
          'Ring buffer modulo (rear + 1) % size eliminates shifting elements during dequeue.',
          'Monotonic Deque keeps candidate maximums at front, solving sliding windows in O(N).',
        ],
        videoScenes: [
          {
            timestamp: '00:00',
            durationSeconds: 14,
            title: 'Queue FIFO & Modulo Ring Buffer Arithmetic',
            subtitle: 'First-In First-Out with Front and Rear Indices',
            narration:
              'Queues operate on First-In First-Out semantics. By implementing a circular ring buffer with modulo arithmetic, we prevent linear array shifting when elements are dequeued.',
            codeSnippet: `// 1. Circular Queue Enqueue\nrear = (rear + 1) % capacity;\nbuffer[rear] = val;\ncount++;`,
            activeLine: 1,
            sceneState: {
              type: 'queue',
              data: [10, 20, 30, 40],
              pointers: [
                { name: 'FRONT', index: 0, color: 'accent' },
                { name: 'REAR', index: 3, color: 'warning' }
              ],
              highlightedIndices: [0, 3]
            },
            telemetry: { time: 'O(1)', space: 'O(N)', address: '0x773010', cacheState: 'Ring Buffer' }
          },
          {
            timestamp: '04:30',
            durationSeconds: 15,
            title: 'Sliding Window Maximum with Monotonic Deque',
            subtitle: 'Eliminating Redundant Candidates in O(N)',
            narration:
              'A Monotonic Deque allows insertions and deletions at both ends. For sliding window maximum, we remove older, smaller candidates from the back so the current window maximum is always directly accessible at the front.',
            codeSnippet: `// 2. Sliding Window Maximum\nwhile (deque.length && nums[deque[deque.length - 1]] <= nums[i]) {\n  deque.pop(); // discard smaller candidates\n}\ndeque.push(i);\nif (deque[0] <= i - k) deque.shift(); // evict expired`,
            activeLine: 2,
            sceneState: {
              type: 'queue',
              data: [70, 45, 12],
              pointers: [{ name: 'WIN_MAX', index: 0, color: 'success' }],
              highlightedIndices: [0]
            },
            telemetry: { time: 'O(N)', space: 'O(K)', address: '0x773020', cacheState: 'Optimal Window' }
          }
        ]
      },
    ],
  },
  {
    moduleNumber: 4,
    title: 'Module 4: Hierarchical Trees & Rotations',
    lessons: [
      {
        id: '9-trees-basics',
        title: 'Binary Tree Traversals (Inorder, Preorder, Postorder & BFS)',
        creator: 'Dr. Alisha Sharma (Placify AI Algorithms Faculty)',
        badge: 'PLACIFY ORIGINALS',
        duration: '17:20',
        completed: false,
        chapters: [
          { time: '00:00', title: 'Hierarchical Node Tree Fundamentals' },
          { time: '04:40', title: 'Depth-First Traversals: Preorder, Inorder, Postorder' },
          { time: '09:20', title: 'Breadth-First Search Level Order with Queue' },
          { time: '13:30', title: 'Binary Search Tree (BST) Lookup Invariant' },
        ],
        takeaways: [
          'Inorder traversal of a BST produces strictly sorted ascending keys.',
          'Level-order BFS processes nodes tier-by-tier using an auxiliary queue.',
        ],
        videoScenes: [
          {
            timestamp: '00:00',
            durationSeconds: 14,
            title: 'Hierarchical Node Tree Fundamentals',
            subtitle: 'Root, Left Subtree and Right Subtree Branches',
            narration:
              'Welcome to the Hierarchical Trees Masterclass. Trees organize data non-linearly. A binary tree consists of a root node pointing to at most two child subtrees, forming recursive branching structures.',
            codeSnippet: `// 1. Binary Tree Node\nclass TreeNode {\n  constructor(val) {\n    this.val = val;\n    this.left = null; this.right = null;\n  }\n}`,
            activeLine: 3,
            sceneState: {
              type: 'tree',
              nodes: [
                { id: 1, val: 50, x: 0, y: 4, z: 0 },
                { id: 2, val: 30, x: -3, y: 2, z: 0 },
                { id: 3, val: 70, x: 3, y: 2, z: 0 },
                { id: 4, val: 20, x: -4.5, y: 0, z: 0 },
                { id: 5, val: 40, x: -1.5, y: 0, z: 0 }
              ],
              edges: [
                { from: 1, to: 2 },
                { from: 1, to: 3 },
                { from: 2, to: 4 },
                { from: 2, to: 5 }
              ],
              activeNodeId: 1
            },
            telemetry: { time: 'O(log N)', space: 'O(H)', address: '0x664010', cacheState: 'Root Node' }
          },
          {
            timestamp: '04:40',
            durationSeconds: 15,
            title: 'Inorder Traversal & BST Ascending Order',
            subtitle: 'Left Subtree -> Root -> Right Subtree',
            narration:
              'In an Inorder traversal, we recursively visit the left subtree, process the current node, then visit the right subtree. On a Binary Search Tree, Inorder traversal yields elements in strictly ascending sorted order.',
            codeSnippet: `// 2. Inorder Traversal\nfunction inorder(node) {\n  if (!node) return;\n  inorder(node.left);\n  console.log(node.val); // Process Node\n  inorder(node.right);\n}`,
            activeLine: 4,
            sceneState: {
              type: 'tree',
              nodes: [
                { id: 1, val: 50, x: 0, y: 4, z: 0 },
                { id: 2, val: 30, x: -3, y: 2, z: 0 },
                { id: 3, val: 70, x: 3, y: 2, z: 0 },
                { id: 4, val: 20, x: -4.5, y: 0, z: 0 },
                { id: 5, val: 40, x: -1.5, y: 0, z: 0 }
              ],
              edges: [
                { from: 1, to: 2 },
                { from: 1, to: 3 },
                { from: 2, to: 4 },
                { from: 2, to: 5 }
              ],
              activeNodeId: 2
            },
            telemetry: { time: 'O(N)', space: 'O(H)', address: '0x664020', cacheState: 'Inorder Traversal' }
          }
        ]
      },
      {
        id: '11-avl-tree',
        title: 'AVL Tree: Balance Factors & 3D LL/RR/LR/RL Rotations',
        creator: 'Dr. Alisha Sharma (Placify AI Algorithms Faculty)',
        badge: 'PLACIFY ORIGINALS',
        duration: '18:15',
        completed: false,
        chapters: [
          { time: '00:00', title: 'Why Unbalanced BST Skews to O(N)' },
          { time: '05:20', title: 'Balance Factor Calculation: Height(L) - Height(R)' },
          { time: '10:15', title: 'Single Left & Right Rotations' },
          { time: '14:30', title: 'Double Rotations (LR & RL Zigzag Fixes)' },
        ],
        takeaways: [
          'AVL trees maintain balance factor in {-1, 0, 1}, guaranteeing O(log N) worst-case lookups.',
          'Single rotations fix outer imbalances; double rotations fix inner zigzag imbalances.',
        ],
        videoScenes: [
          {
            timestamp: '00:00',
            durationSeconds: 15,
            title: 'Why Unbalanced BST Skews to O(N)',
            subtitle: 'Worst-Case Degeneration into a Linked List',
            narration:
              'When items are inserted in sorted order into a standard BST, the tree becomes a skewed line, degrading search operations from O(log N) down to linear O(N). AVL self-balancing trees prevent this through rotations.',
            codeSnippet: `// 1. Balance Factor Invariant\nconst balanceFactor = getHeight(node.left) - getHeight(node.right);\n// Invariant: -1 <= balanceFactor <= 1`,
            activeLine: 2,
            sceneState: {
              type: 'tree',
              nodes: [
                { id: 1, val: 10, x: 0, y: 4, z: 0 },
                { id: 2, val: 20, x: 2, y: 2, z: 0 },
                { id: 3, val: 30, x: 4, y: 0, z: 0 }
              ],
              edges: [
                { from: 1, to: 2 },
                { from: 2, to: 3 }
              ],
              activeNodeId: 3
            },
            telemetry: { time: 'O(N)', space: 'O(1)', address: '0x551010', cacheState: 'Degenerate BST' }
          },
          {
            timestamp: '10:15',
            durationSeconds: 15,
            title: 'Left & Right Rotations Restoring O(log N)',
            subtitle: 'Re-parenting Nodes While Preserving BST Properties',
            narration:
              'By performing a single left rotation, the middle node is promoted to root, pulling the unbalanced subtree upward. Notice how the tree height is instantly restored to perfect balance.',
            codeSnippet: `// 2. Left Rotation\nfunction rotateLeft(x) {\n  let y = x.right;\n  x.right = y.left;\n  y.left = x;\n  return y; // New Subtree Root\n}`,
            activeLine: 4,
            sceneState: {
              type: 'tree',
              nodes: [
                { id: 2, val: 20, x: 0, y: 4, z: 0 },
                { id: 1, val: 10, x: -2.5, y: 2, z: 0 },
                { id: 3, val: 30, x: 2.5, y: 2, z: 0 }
              ],
              edges: [
                { from: 2, to: 1 },
                { from: 2, to: 3 }
              ],
              activeNodeId: 2
            },
            telemetry: { time: 'O(1)', space: 'O(1)', address: '0x551020', cacheState: 'Balanced AVL' }
          }
        ]
      }
    ],
  },
  {
    moduleNumber: 5,
    title: 'Module 5: Graph Theory, Networks & Shortest Paths',
    lessons: [
      {
        id: '14-graphs',
        title: 'Graph Traversal 3D Spatial BFS, DFS & Shortest Paths',
        creator: 'Dr. Alisha Sharma (Placify AI Algorithms Faculty)',
        badge: 'PLACIFY ORIGINALS',
        duration: '18:40',
        completed: false,
        chapters: [
          { time: '00:00', title: 'Adjacency Lists vs Matrix Tradeoffs' },
          { time: '05:15', title: 'BFS Concentric Exploration Waves & Shortest Path' },
          { time: '11:00', title: 'DFS Recursion & Cycle Detection' },
          { time: '15:20', title: 'Connected Components & Island Traversal' },
        ],
        takeaways: [
          'BFS finds the unweighted shortest path because it expands edge-by-edge in concentric rings.',
          'DFS uses a recursion call stack and explores deepest branches first.',
        ],
        videoScenes: [
          {
            timestamp: '00:00',
            durationSeconds: 15,
            title: 'BFS Concentric Waves & Shortest Paths',
            subtitle: 'Level-by-Level Graph Traversal with a FIFO Queue',
            narration:
              'In this lecture, we examine Breadth-First Search on a 3D graph network. BFS explores nodes in concentric ripples away from the source, guaranteeing the shortest unweighted path.',
            codeSnippet: `// 1. BFS Graph Traversal\nconst queue = [startNode];\nvisited.add(startNode);\nwhile (queue.length) {\n  const curr = queue.shift();\n  for (let neighbor of graph[curr]) {\n    if (!visited.has(neighbor)) {\n      visited.add(neighbor);\n      queue.push(neighbor);\n    }\n  }\n}`,
            activeLine: 5,
            sceneState: {
              type: 'graph',
              nodes: [
                { id: 'A', x: -4, y: 2, z: 0 },
                { id: 'B', x: 0, y: 3, z: -2 },
                { id: 'C', x: 4, y: 1, z: 0 },
                { id: 'D', x: -2, y: -2, z: 2 },
                { id: 'E', x: 3, y: -2, z: 1 }
              ],
              edges: [
                { from: 'A', to: 'B' },
                { from: 'B', to: 'C' },
                { from: 'A', to: 'D' },
                { from: 'D', to: 'E' },
                { from: 'C', to: 'E' }
              ],
              activeNodeId: 'B'
            },
            telemetry: { time: 'O(V + E)', space: 'O(V)', address: '0x442010', cacheState: 'BFS Concentric Wave' }
          }
        ]
      }
    ],
  },
  {
    moduleNumber: 6,
    title: 'Module 6: Dynamic Programming & Grid Optimization',
    lessons: [
      {
        id: '18-dynamic-programming',
        title: 'Dynamic Programming: 3D Grid Elevation & 0/1 Knapsack',
        creator: 'Dr. Alisha Sharma (Placify AI Algorithms Faculty)',
        badge: 'PLACIFY ORIGINALS',
        duration: '19:30',
        completed: false,
        chapters: [
          { time: '00:00', title: 'Overlapping Subproblems & Optimal Substructure' },
          { time: '05:30', title: 'Memoization (Top-Down) vs Tabulation (Bottom-Up)' },
          { time: '11:20', title: '0/1 Knapsack State Formulation' },
          { time: '15:40', title: '2D Grid Elevation & Space Compression' },
        ],
        takeaways: [
          'Memoization stores solved subproblems to eliminate exponential recomputation.',
          '2D Grid DP table cells depend strictly on previously filled sub-problems.',
        ],
        videoScenes: [
          {
            timestamp: '00:00',
            durationSeconds: 15,
            title: 'Dynamic Programming: 3D Grid Elevation & Subproblems',
            subtitle: 'Bottom-Up Tabulation with Overlapping State Matrices',
            narration:
              'Dynamic Programming solves complex problems by breaking them into smaller overlapping subproblems. Notice the 3D DP grid where each cell height represents the accumulated optimal state value.',
            codeSnippet: `// 1. 2D DP State Matrix\nfor (let i = 1; i <= n; i++) {\n  for (let w = 1; w <= capacity; w++) {\n    if (weights[i-1] <= w)\n      dp[i][w] = Math.max(dp[i-1][w], values[i-1] + dp[i-1][w - weights[i-1]]);\n    else dp[i][w] = dp[i-1][w];\n  }\n}`,
            activeLine: 4,
            sceneState: {
              type: 'array_2d',
              matrix: [
                [0, 0, 0, 0],
                [0, 10, 10, 10],
                [0, 10, 25, 35],
                [0, 10, 25, 45]
              ],
              activeCell: { r: 2, c: 3 },
              highlightedRow: 2
            },
            telemetry: { time: 'O(N * W)', space: 'O(N * W)', address: '0x331010', cacheState: 'DP Matrix State' }
          }
        ]
      }
    ],
  },
]

export default function Dsa3DVideoTutorial({ activeTopic, steps, currentStep, currentStepIndex, onStepChange }) {
  const [tutorialMode, setTutorialMode] = useState('course_academy') // 'course_academy' | 'interactive_3d'
  const [isPlaying3D, setIsPlaying3D] = useState(false)
  const [playbackSpeed, setPlaybackSpeed] = useState(1)
  const [voiceNarratorEnabled, setVoiceNarratorEnabled] = useState(true)
  const [activeChapterIndex, setActiveChapterIndex] = useState(0)
  const [voiceSpeaking, setVoiceSpeaking] = useState(false)
  const [selectedLesson, setSelectedLesson] = useState(() => {
    for (const mod of COURSE_CURRICULUM) {
      const match = mod.lessons.find((l) => l.id === activeTopic.id)
      if (match) return match
    }
    return COURSE_CURRICULUM[1].lessons[0]
  })
  const [completedLessons, setCompletedLessons] = useState(['1-fundamentals'])

  // Update selected lesson if activeTopic changes
  useEffect(() => {
    for (const mod of COURSE_CURRICULUM) {
      const match = mod.lessons.find((l) => l.id === activeTopic.id)
      if (match) {
        setSelectedLesson(match)
        break
      }
    }
  }, [activeTopic])

  // Toggle lesson completion
  const handleToggleLessonComplete = (lessonId) => {
    if (completedLessons.includes(lessonId)) {
      setCompletedLessons(completedLessons.filter((id) => id !== lessonId))
    } else {
      setCompletedLessons([...completedLessons, lessonId])
    }
  }

  const totalLessons = COURSE_CURRICULUM.reduce((acc, mod) => acc + mod.lessons.length, 0)
  const progressPercent = Math.round((completedLessons.length / totalLessons) * 100)

  // Chapters for 3D walkthrough
  const interactiveChapters = [
    { name: '1. Problem & Memory Setup', stepIdx: 0, time: '00:00' },
    { name: '2. Pointer Initialization', stepIdx: Math.min(1, steps.length - 1), time: '00:45' },
    { name: '3. State Transitions & Invariant', stepIdx: Math.floor(steps.length / 2), time: '01:30' },
    { name: '4. Optimal Termination', stepIdx: steps.length - 1, time: '02:30' },
  ]

  const handleSeekChapter = (stepIdx, chapterIdx) => {
    onStepChange(stepIdx)
    setActiveChapterIndex(chapterIdx)
  }

  const togglePlay3D = () => {
    if (!isPlaying3D && currentStepIndex >= steps.length - 1) {
      onStepChange(0)
      setIsPlaying3D(true)
    } else {
      setIsPlaying3D(!isPlaying3D)
    }
  }

  return (
    <div className="space-y-4">
      {/* Academy Course Header & Navigation Mode Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-surface rounded-2xl border border-border-subtle p-3.5 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent/20 border border-accent/30 flex items-center justify-center text-accent shrink-0 shadow-sm">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-sm font-bold text-text-primary">
                DSA 3D Masterclass Video Academy
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-400 text-[10px] font-bold border border-rose-500/25 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                Placify Originals
              </span>
              <span className="px-2 py-0.5 rounded-full bg-semantic-green/15 text-semantic-green text-[10px] font-bold border border-semantic-green/25">
                4.9 ★★★★★ Native 3D Lectures
              </span>
            </div>
            <p className="text-xs text-text-secondary mt-0.5">
              Course Progress: <strong className="text-accent-light">{progressPercent}%</strong> ({completedLessons.length}/{totalLessons} Masterclasses Completed)
            </p>
          </div>
        </div>

        {/* Dual Mode Switcher: Native Video Masterclass vs Interactive 3D Lab Stepper */}
        <div className="flex items-center gap-1.5 bg-hover/60 p-1 rounded-xl border border-border-subtle text-xs">
          <button
            onClick={() => setTutorialMode('course_academy')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all ${
              tutorialMode === 'course_academy'
                ? 'bg-accent text-white shadow-md shadow-accent/25'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            <MonitorPlay className="w-3.5 h-3.5" />
            <span>3D Video Lecture (Placify)</span>
          </button>
          <button
            onClick={() => setTutorialMode('interactive_3d')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all ${
              tutorialMode === 'interactive_3d'
                ? 'bg-accent text-white shadow-md shadow-accent/25'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Interactive 3D Walkthrough</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODE 1: PLACIFY NATIVE 3D VIDEO MASTERCLASS (100% Zero YouTube)           */}
      {/* ========================================================================= */}
      {tutorialMode === 'course_academy' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Main Video Player & Lesson Details (8 cols) */}
          <div className="lg:col-span-8 space-y-3">
            {/* Placify Proprietary 3D Video Player */}
            <PlacifyMasterclassVideoPlayer
              lesson={selectedLesson}
              onToggleComplete={handleToggleLessonComplete}
              isCompleted={completedLessons.includes(selectedLesson.id)}
            />

            {/* Lesson Takeaways & Syllabus Details Card */}
            <div className="bg-surface p-4 rounded-2xl border border-border-subtle space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md bg-accent/15 text-accent-light font-mono font-bold text-[10px]">
                      {selectedLesson.duration}
                    </span>
                    <span className="text-xs text-text-muted font-medium">
                      Instructor: <strong className="text-text-primary">{selectedLesson.creator}</strong>
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-text-primary mt-1">
                    {selectedLesson.title}
                  </h3>
                </div>

                <Button
                  onClick={() => handleToggleLessonComplete(selectedLesson.id)}
                  variant="outline"
                  size="sm"
                  className={`text-xs font-bold rounded-xl transition-all ${
                    completedLessons.includes(selectedLesson.id)
                      ? 'bg-semantic-green/15 text-semantic-green border-semantic-green/30'
                      : 'hover:bg-hover border-border-subtle'
                  }`}
                >
                  {completedLessons.includes(selectedLesson.id) ? (
                    <>
                      <Check className="w-3.5 h-3.5 mr-1" /> Completed
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Mark Complete
                    </>
                  )}
                </Button>
              </div>

              {/* Key Concept Takeaways */}
              {selectedLesson.takeaways && selectedLesson.takeaways.length > 0 && (
                <div className="pt-2 border-t border-border-subtle/60 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-text-muted uppercase tracking-wider">
                    <FileText className="w-3.5 h-3.5 text-accent" />
                    <span>Masterclass Key Takeaways:</span>
                  </div>
                  <ul className="space-y-1 pl-1">
                    {selectedLesson.takeaways.map((note, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-text-secondary leading-relaxed">
                        <span className="w-1.5 h-1.5 rounded-full bg-accent shrink-0 mt-1.5" />
                        <span>{note}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Module Playlist & Syllabus Sidebar (4 cols) */}
          <div className="lg:col-span-4 bg-surface rounded-2xl border border-border-subtle p-3.5 flex flex-col max-h-[760px] overflow-hidden shadow-lg">
            <div className="flex items-center justify-between pb-3 border-b border-border-subtle shrink-0">
              <div className="flex items-center gap-2">
                <ListChecks className="w-4 h-4 text-accent" />
                <span className="text-xs font-bold text-text-primary uppercase tracking-wider">
                  Course Modules
                </span>
              </div>
              <span className="text-[11px] font-bold text-text-muted">
                {COURSE_CURRICULUM.length} Modules
              </span>
            </div>

            {/* Scrollable Course Syllabus */}
            <div className="flex-1 overflow-y-auto space-y-3 pt-3 pr-1">
              {COURSE_CURRICULUM.map((mod) => (
                <div key={mod.moduleNumber} className="space-y-1.5">
                  <div className="text-[11px] font-bold text-text-muted uppercase tracking-wider px-1">
                    {mod.title}
                  </div>

                  <div className="space-y-1">
                    {mod.lessons.map((lesson) => {
                      const isSelected = selectedLesson.id === lesson.id
                      const isCompleted = completedLessons.includes(lesson.id)
                      return (
                        <button
                          key={lesson.id}
                          onClick={() => setSelectedLesson(lesson)}
                          className={`w-full text-left p-2.5 rounded-xl border transition-all flex items-start gap-2.5 ${
                            isSelected
                              ? 'bg-accent/20 border-accent text-text-primary shadow-sm font-bold'
                              : 'bg-card border-border-subtle text-text-secondary hover:text-text-primary hover:bg-hover'
                          }`}
                        >
                          <div className="mt-0.5 shrink-0">
                            {isCompleted ? (
                              <CheckCircle2 className="w-4 h-4 text-semantic-green" />
                            ) : (
                              <Video className={`w-4 h-4 ${isSelected ? 'text-accent' : 'text-text-muted'}`} />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-medium truncate leading-tight">
                              {lesson.title}
                            </div>
                            <div className="flex items-center gap-2 text-[10px] text-text-muted mt-1">
                              <span>{lesson.duration}</span>
                              <span>•</span>
                              <span className="truncate">{lesson.creator}</span>
                            </div>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODE 2: INTERACTIVE 3D GUIDED WALKTHROUGH WITH SOFT FEMALE VOICE          */}
      {/* ========================================================================= */}
      {tutorialMode === 'interactive_3d' && (
        <div className="space-y-3">
          {/* Subtitle & Narration Banner */}
          <div className="p-3.5 bg-accent/10 border border-accent/25 rounded-2xl flex items-start gap-3 shadow-sm">
            <Sparkles className="w-4 h-4 text-accent-light shrink-0 mt-0.5 animate-pulse" />
            <div className="space-y-1 flex-1">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-bold text-accent-light uppercase tracking-wider">
                  Step {currentStepIndex + 1} of {steps.length} • Interactive 3D Lab Stepper
                </span>
                <span className="font-mono text-[10px] bg-card px-2 py-0.5 rounded border border-border-subtle text-text-muted">
                  Line {currentStep?.lineNumber || 1}
                </span>
              </div>
              <p className="text-xs text-text-primary font-medium leading-relaxed">
                {currentStep?.explanation || 'Loading algorithmic execution sequence...'}
              </p>
            </div>
          </div>

          {/* Full 3D WebGL Canvas */}
          <div className="w-full h-[460px] rounded-2xl overflow-hidden border border-border-subtle shadow-2xl relative">
            <DsaCanvas3D sceneState={currentStep?.sceneState} />
          </div>

          {/* Interactive Player HUD Controls */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-surface rounded-2xl border border-border-subtle shadow-md">
            {/* Play/Pause & Reset */}
            <div className="flex items-center gap-2">
              <Button
                onClick={togglePlay3D}
                size="sm"
                className="bg-accent text-white hover:bg-accent-light text-xs font-bold px-3 py-1.5 h-8 rounded-xl shadow-md shadow-accent/20 flex items-center gap-1.5"
              >
                {isPlaying3D ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                <span>{isPlaying3D ? 'Pause Tour' : 'Play 3D Tour'}</span>
              </Button>

              <button
                onClick={() => onStepChange(0)}
                className="p-1.5 rounded-lg border border-border-subtle text-text-muted hover:text-text-primary hover:bg-hover transition-colors text-xs"
                title="Restart from step 1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Scrubbable Step Progress Slider */}
            <div className="flex items-center gap-3 flex-1 max-w-md mx-2">
              <span className="text-[11px] font-mono font-bold text-text-muted">0</span>
              <input
                type="range"
                min={0}
                max={Math.max(1, steps.length - 1)}
                value={currentStepIndex}
                onChange={(e) => onStepChange(Number(e.target.value))}
                className="flex-1 accent-accent cursor-pointer h-1.5 bg-hover rounded-lg"
              />
              <span className="text-[11px] font-mono font-bold text-text-muted">{steps.length}</span>
            </div>

            {/* Speed Presets */}
            <div className="flex items-center gap-1 bg-card p-1 rounded-xl border border-border-subtle text-xs">
              {[0.75, 1, 1.25, 1.5].map((speed) => (
                <button
                  key={speed}
                  onClick={() => setPlaybackSpeed(speed)}
                  className={`px-2 py-0.5 text-[11px] font-bold rounded-md transition-all ${
                    playbackSpeed === speed
                      ? 'bg-accent text-white shadow-sm'
                      : 'text-text-muted hover:text-text-primary'
                  }`}
                >
                  {speed}x
                </button>
              ))}
            </div>
          </div>

          {/* Interactive Chapter Markers */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {interactiveChapters.map((ch, idx) => {
              const isActive = activeChapterIndex === idx
              return (
                <button
                  key={idx}
                  onClick={() => handleSeekChapter(ch.stepIdx, idx)}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    isActive
                      ? 'bg-accent/20 border-accent/40 text-accent-light font-bold shadow-sm'
                      : 'bg-surface border-border-subtle text-text-secondary hover:text-text-primary hover:bg-hover'
                  }`}
                >
                  <div className="text-[10px] font-mono text-text-muted">{ch.time}</div>
                  <div className="text-xs font-semibold mt-0.5 truncate">{ch.name}</div>
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
