// Master Syllabus for 3D Data Structures & Algorithm Platform
// Structured Hierarchically: Core Category -> Data Structure / Topic -> Subtopics & Operations
// No duplicate topics. All ₹1Cr+ labels replaced with clean interview priority labels.

export const PRIORITY_LEVELS = {
  CRITICAL: 'Core Interview',
  VERY_IMPORTANT: 'Important',
  ADVANCED: 'Advanced',
  SPECIALIZED: 'Specialized',
}

export const VISUALIZER_TYPES = {
  ARRAY_1D: 'array_1d',
  ARRAY_2D: 'array_2d',
  LINKED_LIST: 'linked_list',
  STACK: 'stack',
  QUEUE: 'queue',
  TREE_BINARY: 'tree_binary',
  TREE_AVL: 'tree_avl',
  TREE_HEAP: 'tree_heap',
  TRIE: 'trie',
  GRAPH_SPATIAL: 'graph_spatial',
  DP_GRID: 'dp_grid',
  RECURSION_TREE: 'recursion_tree',
  GENERIC_CONCEPT: 'generic_concept',
}

export const DSA_CATEGORIES = [
  'All Categories',
  'Data Structures',
  'Linear Structures',
  'Trees & Hierarchical',
  'Graphs & Networks',
  'Hash & Cache Systems',
  'Advanced & Range Queries',
  'Core Algorithms',
]

export const DSA_SYLLABUS = [
  // 1. Fundamentals
  {
    id: '1-fundamentals',
    topicNumber: 1,
    title: 'Data Structure Fundamentals & Memory Layout',
    category: 'Linear Structures',
    isDataStructure: true,
    priority: PRIORITY_LEVELS.CRITICAL,
    difficulty: 'Easy',
    visualizerType: VISUALIZER_TYPES.RECURSION_TREE,
    summary: 'Abstract Data Types (ADTs), memory layout, cache locality, contiguous vs linked storage, and operation complexities.',
    subtopics: [
      'ADT (Abstract Data Types)',
      'Linear vs Non-Linear Structures',
      'Static vs Dynamic Structures',
      'Contiguous vs Linked Storage',
      'Mutable vs Immutable Structures',
      'Memory Layout & Alignment',
      'CPU Cache Locality & Spatial Prefetching',
      'Asymptotic Operation Complexity',
    ],
    operations: ['Memory Allocation', 'Pointer Dereference', 'Boundary Checking', 'Cache Access'],
    theory: {
      overview: 'Data structures organize memory for efficient algorithmic access. Contiguous arrays offer spatial locality; linked nodes offer dynamic allocation.',
      complexity: { time: 'O(1) to O(N)', space: 'Stack vs Heap' },
      keyPatterns: ['Spatial Locality', 'Temporal Locality', 'Pointer Dereference Overhead'],
      whyBruteForceFails: 'Poor cache locality can slow down identical O(N) operations by up to 10x due to CPU cache misses.',
    },
    codeSnippets: {
      python: `# Contiguous memory vs Linked pointer simulation
contiguous_array = [10, 20, 30, 40]  # O(1) indexed
print("Element at index 2:", contiguous_array[2])`,
      javascript: `const contiguousArray = [10, 20, 30, 40];
console.log("Element at index 2:", contiguousArray[2]);`,
    },
    defaultInput: { array: [10, 20, 30, 40, 50, 60] },
    problems: [
      { id: 'p-1-1', title: 'Memory Layout & Array Allocation Analysis', difficulty: 'Easy', companies: ['Google', 'Apple'] },
    ],
  },

  // 2. Arrays
  {
    id: '2-arrays',
    topicNumber: 2,
    title: 'Arrays & Dynamic Matrices',
    category: 'Linear Structures',
    isDataStructure: true,
    priority: PRIORITY_LEVELS.CRITICAL,
    difficulty: 'Easy',
    visualizerType: VISUALIZER_TYPES.ARRAY_1D,
    summary: 'Static arrays, dynamic resizable arrays, 1D/2D matrices, circular arrays, sparse arrays, and amortized capacity resizing.',
    subtopics: [
      'Static Array',
      'Dynamic / Resizable Array',
      '1D Array',
      '2D Array / Matrix',
      'Multidimensional Array',
      'Jagged Array',
      'Circular Array',
      'Sparse Array',
      'Array Views & Slices',
      'Capacity & Doubling Resize Strategy',
    ],
    operations: ['Access (O(1))', 'Search (O(N) / O(log N))', 'Insert (O(N))', 'Delete (O(N))', 'Update (O(1))', 'Traverse', 'Resize'],
    theory: {
      overview: 'Elements are stored in contiguous memory addresses: address(i) = base + (i * element_size). Doubling capacity gives amortized O(1) append.',
      complexity: { time: 'Access: O(1) | Search: O(N) | Insert/Delete: O(N)', space: 'O(N)' },
      keyPatterns: ['Two Pointers', 'Sliding Window', 'Prefix Sums', 'Kadane Maximum Subarray'],
      whyBruteForceFails: 'Inserting in middle requires shifting remaining elements in O(N) time.',
    },
    codeSnippets: {
      python: `def dynamic_array_ops():
    arr = [1, 2, 3, 4, 5]
    # O(1) Access
    val = arr[2]
    # O(N) Insert at index 1
    arr.insert(1, 99)
    # O(N) Delete
    arr.pop(1)
    return arr`,
      javascript: `function arrayOps() {
  const arr = [1, 2, 3, 4, 5];
  const val = arr[2]; // O(1)
  arr.splice(1, 0, 99); // O(N) insert
  arr.splice(1, 1);    // O(N) delete
  return arr;
}`,
    },
    defaultInput: { array: [2, 5, 8, 12, 16, 23, 38, 56, 72] },
    problems: [
      { id: 'p-2-1', title: 'Maximum Subarray (Kadane)', difficulty: 'Medium', companies: ['Google', 'Amazon'], lc: 53 },
      { id: 'p-2-2', title: 'Container With Most Water', difficulty: 'Medium', companies: ['Meta', 'Adobe'], lc: 11 },
      { id: 'p-2-3', title: 'Rotate Array', difficulty: 'Medium', companies: ['Microsoft'], lc: 189 },
    ],
  },

  // 3. Strings
  {
    id: '3-strings',
    topicNumber: 3,
    title: 'Strings & Character Buffers',
    category: 'Linear Structures',
    isDataStructure: true,
    priority: PRIORITY_LEVELS.CRITICAL,
    difficulty: 'Easy',
    visualizerType: VISUALIZER_TYPES.ARRAY_1D,
    summary: 'Character arrays, immutable strings, string buffers, string interning, string views, and Rope data structure for fast edits.',
    subtopics: [
      'Character Array',
      'Immutable String',
      'Mutable String Buffer',
      'String Builder / Buffer',
      'String Interning & Memory Representation',
      'String Views & Slices',
      'Rope Data Structure',
    ],
    operations: ['Concat', 'Substring', 'Search (KMP / Rabin-Karp)', 'Character Frequency', 'Palindrome Validation'],
    theory: {
      overview: 'Sequential character buffer. Immutable strings create new copies on concatenation; String Builders amortize concats in O(1).',
      complexity: { time: 'Scan: O(N) | Substring search: O(N + M) KMP', space: 'O(N)' },
      keyPatterns: ['Frequency Count Map', 'Sliding Window', 'Two Pointers Palindrome'],
      whyBruteForceFails: 'Repeated string concatenation using += in loops causes quadratic O(N^2) memory reallocations.',
    },
    codeSnippets: {
      python: `def string_builder_demo(words):
    # O(N) using join instead of +=
    return "".join(words)`,
      javascript: `function stringJoinDemo(words) {
  return words.join("");
}`,
    },
    defaultInput: { array: [97, 98, 99, 97, 98, 99, 98], string: 'abcabcbb' },
    problems: [
      { id: 'p-3-1', title: 'Longest Substring Without Repeating Characters', difficulty: 'Medium', companies: ['Amazon', 'Meta'], lc: 3 },
      { id: 'p-3-2', title: 'Valid Anagram', difficulty: 'Easy', companies: ['Google'], lc: 242 },
    ],
  },

  // 4. Linked Lists
  {
    id: '4-linked-lists',
    topicNumber: 4,
    title: 'Linked Lists (Singly, Doubly & Circular)',
    category: 'Linear Structures',
    isDataStructure: true,
    priority: PRIORITY_LEVELS.CRITICAL,
    difficulty: 'Medium',
    visualizerType: VISUALIZER_TYPES.LINKED_LIST,
    summary: 'Singly linked lists, doubly linked lists, circular lists, sentinel/dummy nodes, in-place reversal, and Floyd cycle detection.',
    subtopics: [
      'Singly Linked List',
      'Doubly Linked List',
      'Circular Singly Linked List',
      'Circular Doubly Linked List',
      'Sentinel / Dummy Node Pattern',
      'Sorted Linked List',
      'Node Structure & Pointers',
    ],
    operations: ['Insert at Head/Tail/Pos (O(1))', 'Delete Node (O(1) with pointer)', 'Search (O(N))', 'Reverse In-Place', 'Cycle Detection', 'Merge'],
    theory: {
      overview: 'Non-contiguous heap nodes linked via memory pointers. Insertions and deletions do not require shifting elements.',
      complexity: { time: 'Insert/Delete at pointer: O(1) | Traversal: O(N)', space: 'O(1) auxiliary' },
      keyPatterns: ['Prev/Curr/Next 3-Pointer Inversion', 'Fast & Slow Floyd Tortoise-Hare', 'Dummy Head Sentinel'],
      whyBruteForceFails: 'Using index-based traversal in a linked list inside a loop yields quadratic O(N^2) runtime.',
    },
    codeSnippets: {
      python: `class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val; self.next = next

def reverse_list(head):
    prev, curr = None, head
    while curr:
        nxt = curr.next
        curr.next = prev
        prev = curr
        curr = nxt
    return prev`,
      javascript: `function reverseList(head) {
  let prev = null, curr = head;
  while (curr) {
    const nxt = curr.next;
    curr.next = prev;
    prev = curr;
    curr = nxt;
  }
  return prev;
}`,
    },
    defaultInput: { nodes: [10, 20, 30, 40, 50, 60] },
    problems: [
      { id: 'p-4-1', title: 'Reverse Linked List', difficulty: 'Easy', companies: ['Microsoft', 'Amazon'], lc: 206 },
      { id: 'p-4-2', title: 'Linked List Cycle', difficulty: 'Easy', companies: ['Apple', 'Google'], lc: 141 },
      { id: 'p-4-3', title: 'Merge Two Sorted Lists', difficulty: 'Easy', companies: ['Meta'], lc: 21 },
    ],
  },

  // 5. Stack
  {
    id: '5-stack',
    topicNumber: 5,
    title: 'Stack & Monotonic Stack',
    category: 'Linear Structures',
    isDataStructure: true,
    priority: PRIORITY_LEVELS.CRITICAL,
    difficulty: 'Medium',
    visualizerType: VISUALIZER_TYPES.STACK,
    summary: 'Stack ADT, array & linked-list implementations, push/pop/peek, Min/Max Stack, and Monotonic Stacks for Next Greater Element.',
    subtopics: [
      'Stack ADT (LIFO Principle)',
      'Array-based Stack',
      'Linked-List-based Stack',
      'Dynamic Stack Resizing',
      'Two Stacks in One Array',
      'Min Stack (O(1) getMin)',
      'Max Stack',
      'Monotonic Stack (Increasing / Decreasing)',
    ],
    operations: ['Push (O(1))', 'Pop (O(1))', 'Peek / Top (O(1))', 'IsEmpty (O(1))', 'Next Greater Query'],
    theory: {
      overview: 'Last-In-First-Out access model. Monotonic stacks maintain sorted elements, resolving queries in single-pass O(N).',
      complexity: { time: 'All operations: O(1)', space: 'O(N)' },
      keyPatterns: ['Next Greater / Smaller Element', 'Largest Rectangle in Histogram', 'Parentheses Validation'],
      whyBruteForceFails: 'Nested search for next greater element takes O(N^2); Monotonic Stack pushes and pops each item at most once in O(N).',
    },
    codeSnippets: {
      python: `def next_greater_elements(nums):
    res = [-1] * len(nums)
    stack = []
    for i, x in enumerate(nums):
        while stack and nums[stack[-1]] < x:
            res[stack.pop()] = x
        stack.append(i)
    return res`,
      javascript: `function nextGreater(nums) {
  const res = Array(nums.length).fill(-1);
  const stack = [];
  for (let i = 0; i < nums.length; i++) {
    while (stack.length && nums[stack[stack.length - 1]] < nums[i]) {
      res[stack.pop()] = nums[i];
    }
    stack.push(i);
  }
  return res;
}`,
    },
    defaultInput: { array: [2, 1, 5, 6, 2, 3] },
    problems: [
      { id: 'p-5-1', title: 'Valid Parentheses', difficulty: 'Easy', companies: ['Meta', 'Google'], lc: 20 },
      { id: 'p-5-2', title: 'Min Stack', difficulty: 'Medium', companies: ['Amazon', 'Bloomberg'], lc: 155 },
      { id: 'p-5-3', title: 'Largest Rectangle in Histogram', difficulty: 'Hard', companies: ['Google'], lc: 84 },
    ],
  },

  // 6. Queue & Deque
  {
    id: '6-queue-deque',
    topicNumber: 6,
    title: 'Queue & Double-Ended Queue (Deque)',
    category: 'Linear Structures',
    isDataStructure: true,
    priority: PRIORITY_LEVELS.CRITICAL,
    difficulty: 'Medium',
    visualizerType: VISUALIZER_TYPES.QUEUE,
    summary: 'Queue ADT, circular queue modulo arithmetic, dynamic queues, double-ended queues (Deque), and monotonic deques.',
    subtopics: [
      'Queue ADT (FIFO Principle)',
      'Array Queue Implementation',
      'Linked-List Queue Implementation',
      'Circular Queue (Modulo Indexing)',
      'Dynamic Resizable Queue',
      'Double-Ended Queue (Deque)',
      'Input-Restricted & Output-Restricted Deque',
      'Monotonic Deque',
    ],
    operations: ['Enqueue (O(1))', 'Dequeue (O(1))', 'Front / Rear (O(1))', 'PushFront / PushBack', 'PopFront / PopBack'],
    theory: {
      overview: 'First-In-First-Out access model. Circular buffers prevent memory drift. Monotonic deques track sliding window maximums in O(1) amortized.',
      complexity: { time: 'O(1) per operation', space: 'O(N)' },
      keyPatterns: ['Circular Buffer Indexing (i + 1) % N', 'BFS Traversal Frontier', 'Sliding Window Monotonic Deque'],
      whyBruteForceFails: 'Re-evaluating maximums across shifting windows takes O(N * K). Deque solves it in linear O(N).',
    },
    codeSnippets: {
      python: `from collections import deque
def queue_demo():
    q = deque()
    q.append(10)  # enqueue
    q.append(20)
    front = q.popleft() # dequeue
    return front`,
      javascript: `function queueDemo() {
  const q = [];
  q.push(10); // enqueue
  q.push(20);
  const front = q.shift(); // dequeue
  return front;
}`,
    },
    defaultInput: { array: [10, 20, 30, 40, 50] },
    problems: [
      { id: 'p-6-1', title: 'Implement Queue using Stacks', difficulty: 'Easy', companies: ['Microsoft', 'Amazon'], lc: 232 },
      { id: 'p-6-2', title: 'Design Circular Queue', difficulty: 'Medium', companies: ['Apple'], lc: 622 },
      { id: 'p-6-3', title: 'Sliding Window Maximum', difficulty: 'Hard', companies: ['Google', 'Meta'], lc: 239 },
    ],
  },

  // 7. Priority Queue & Heaps
  {
    id: '7-heaps',
    topicNumber: 7,
    title: 'Priority Queue & Binary Heaps',
    category: 'Trees & Hierarchical',
    isDataStructure: true,
    priority: PRIORITY_LEVELS.CRITICAL,
    difficulty: 'Medium',
    visualizerType: VISUALIZER_TYPES.TREE_HEAP,
    summary: 'Min/Max Priority Queues, complete binary heap representation (parent=(i-1)//2), sift-up, sift-down, O(N) build heap, and D-ary heaps.',
    subtopics: [
      'Priority Queue ADT',
      'Min-Priority Queue vs Max-Priority Queue',
      'Complete Binary Heap Property',
      'Array-backed Tree Indexing',
      'Sift-Up (Bubble-Up) & Sift-Down',
      'O(N) Linear Build-Heap Algorithm',
      'HeapSort Algorithm',
      'D-ary Heap, Binomial & Fibonacci Heap',
    ],
    operations: ['Insert (O(log N))', 'Extract Min/Max (O(log N))', 'Peek Min/Max (O(1))', 'Heapify', 'Build Heap (O(N))'],
    theory: {
      overview: 'Array-represented complete binary tree where parent is always smaller (or greater) than children.',
      complexity: { time: 'Push/Pop: O(log N) | Peek: O(1) | Build: O(N)', space: 'O(1) auxiliary in-place' },
      keyPatterns: ['Two Heaps Running Median', 'Top K Elements', 'Merge K Sorted Lists', 'Dijkstra Frontier'],
      whyBruteForceFails: 'Full array sorting is O(N log N). A size-K heap processes streams in O(N log K).',
    },
    codeSnippets: {
      python: `import heapq
def top_k_elements(nums, k):
    return heapq.nlargest(k, nums)`,
      javascript: `// Binary Min-Heap parent-child indexing:
// parent = Math.floor((i - 1) / 2)
// left = 2 * i + 1, right = 2 * i + 2`,
    },
    defaultInput: { array: [4, 10, 3, 5, 1, 8, 7] },
    problems: [
      { id: 'p-7-1', title: 'Kth Largest Element in an Array', difficulty: 'Medium', companies: ['Meta', 'Amazon'], lc: 215 },
      { id: 'p-7-2', title: 'Find Median from Data Stream', difficulty: 'Hard', companies: ['Google'], lc: 295 },
    ],
  },

  // 8. Hash-Based Structures
  {
    id: '8-hash-structures',
    topicNumber: 8,
    title: 'Hash-Based Structures & Collision Resolution',
    category: 'Hash & Cache Systems',
    isDataStructure: true,
    priority: PRIORITY_LEVELS.CRITICAL,
    difficulty: 'Medium',
    visualizerType: VISUALIZER_TYPES.ARRAY_1D,
    summary: 'Hash tables, HashMaps, HashSets, collision resolution (Separate Chaining, Linear Probing, Quadratic Probing, Double Hashing), and Cuckoo hashing.',
    subtopics: [
      'Hash Table & Bucket Array',
      'HashMap / Dictionary & HashSet',
      'Hash Function Design & Modulo',
      'Collision Resolution: Separate Chaining',
      'Collision Resolution: Open Addressing',
      'Linear Probing & Quadratic Probing',
      'Double Hashing & Rehashing',
      'Load Factor & Capacity Resizing',
      'Cuckoo Hashing & Consistent Hashing',
    ],
    operations: ['Put / Insert (Avg O(1))', 'Get / Search (Avg O(1))', 'Remove (Avg O(1))', 'Rehash'],
    theory: {
      overview: 'Direct address table mapping arbitrary keys via index = hash(key) % capacity. Capacity doubles when load factor exceeds 0.75.',
      complexity: { time: 'Average: O(1) | Worst: O(N)', space: 'O(N)' },
      keyPatterns: ['Complementary Key Lookup (Two Sum)', 'Frequency Map Counting', 'Subarray Sum Hashing'],
      whyBruteForceFails: 'Unindexed array lookups take O(N). Hash tables trade space for constant-time access.',
    },
    codeSnippets: {
      python: `def two_sum(nums, target):
    seen = {}
    for i, x in enumerate(nums):
        if target - x in seen: return [seen[target - x], i]
        seen[x] = i
    return []`,
      javascript: `function twoSum(nums, target) {
  const seen = new Map();
  for (let i = 0; i < nums.length; i++) {
    const diff = target - nums[i];
    if (seen.has(diff)) return [seen.get(diff), i];
    seen.set(nums[i], i);
  }
  return [];
}`,
    },
    defaultInput: { array: [2, 7, 11, 15], target: 9 },
    problems: [
      { id: 'p-8-1', title: 'Two Sum', difficulty: 'Easy', companies: ['Google', 'Meta'], lc: 1 },
      { id: 'p-8-2', title: 'Subarray Sum Equals K', difficulty: 'Medium', companies: ['Microsoft'], lc: 560 },
    ],
  },

  // 9. Trees — Basics & Operations
  {
    id: '9-trees-basics',
    topicNumber: 9,
    title: 'Trees: Hierarchical Structures & 3D Traversals',
    category: 'Trees & Hierarchical',
    isDataStructure: true,
    priority: PRIORITY_LEVELS.CRITICAL,
    difficulty: 'Medium',
    visualizerType: VISUALIZER_TYPES.TREE_BINARY,
    summary: 'Root, parent, child, leaf, depth, height, traversals (Preorder, Inorder, Postorder, Level Order, Zigzag), Morris traversal, and LCA.',
    subtopics: [
      'Tree Terminology (Root, Parent, Child, Degree, Height)',
      'Binary Tree, Full, Complete, Perfect Tree',
      'Traversals: Preorder, Inorder, Postorder',
      'Level Order BFS Traversal & Zigzag',
      'Morris Inorder Traversal (O(1) Space)',
      'Tree Height, Diameter & Width',
      'Lowest Common Ancestor (LCA)',
      'Tree Views: Top View, Bottom View, Left/Right View',
    ],
    operations: ['Preorder', 'Inorder', 'Postorder', 'Level Order', 'Calculate Height', 'Find LCA', 'Serialize / Deserialize'],
    theory: {
      overview: 'Connected acyclic graph where every node has at most two children. Recursive DFS and queue-based BFS visit nodes systematically.',
      complexity: { time: 'O(N) traversal', space: 'O(H) recursion stack where H is tree height' },
      keyPatterns: ['Divide & Conquer Subtree Recursion', 'Bottom-up Height Aggregation', 'Level-Order Queue Processing'],
      whyBruteForceFails: 'Recomputing heights repeatedly yields O(N^2); bottom-up DFS solves it in O(N).',
    },
    codeSnippets: {
      python: `def inorder_traversal(root):
    res = []
    def dfs(node):
        if not node: return
        dfs(node.left)
        res.append(node.val)
        dfs(node.right)
    dfs(root)
    return res`,
      javascript: `function inorder(root) {
  const res = [];
  function dfs(node) {
    if (!node) return;
    dfs(node.left);
    res.push(node.val);
    dfs(node.right);
  }
  dfs(root);
  return res;
}`,
    },
    defaultInput: {
      tree: [
        { id: 1, val: 1, left: 2, right: 3, x: 0, y: 5, z: 0 },
        { id: 2, val: 2, left: 4, right: 5, x: -3, y: 3, z: 0 },
        { id: 3, val: 3, left: 6, right: 7, x: 3, y: 3, z: 0 },
        { id: 4, val: 4, x: -4.5, y: 1, z: 0 },
        { id: 5, val: 5, x: -1.5, y: 1, z: 0 },
        { id: 6, val: 6, x: 1.5, y: 1, z: 0 },
        { id: 7, val: 7, x: 4.5, y: 1, z: 0 },
      ],
    },
    problems: [
      { id: 'p-9-1', title: 'Binary Tree Level Order Traversal', difficulty: 'Medium', companies: ['Amazon', 'Meta'], lc: 102 },
      { id: 'p-9-2', title: 'Lowest Common Ancestor of a Binary Tree', difficulty: 'Medium', companies: ['Google'], lc: 236 },
    ],
  },

  // 10. Binary Search Tree
  {
    id: '10-bst',
    topicNumber: 10,
    title: 'Binary Search Tree (BST)',
    category: 'Trees & Hierarchical',
    isDataStructure: true,
    priority: PRIORITY_LEVELS.CRITICAL,
    difficulty: 'Medium',
    visualizerType: VISUALIZER_TYPES.TREE_AVL,
    summary: 'BST ordering invariant (Left < Root < Right), search, insert, delete, predecessor, successor, floor, ceiling, and validation.',
    subtopics: [
      'BST Invariant (Left < Root < Right)',
      'Search, Insert, Delete Algorithms',
      'Inorder Successor & Predecessor',
      'Floor and Ceiling Queries',
      'Validate BST Property',
      'Kth Smallest / Largest Element',
      'BST Iterator',
      'Sorted Array to Balanced BST',
    ],
    operations: ['Search (O(log N))', 'Insert (O(log N))', 'Delete (O(log N))', 'Validate', 'Find Min/Max', 'Successor'],
    theory: {
      overview: 'Maintains sorted elements dynamically. Inorder traversal yields elements in strictly increasing order.',
      complexity: { time: 'Balanced: O(log N) | Skewed: O(N)', space: 'O(log N)' },
      keyPatterns: ['Left/Right Branch Pruning', 'Two-child deletion via Inorder Successor', 'Range Validation (min_val < val < max_val)'],
      whyBruteForceFails: 'Unbalanced BST degenerates into an O(N) linked list on sorted inputs.',
    },
    codeSnippets: {
      python: `def search_bst(root, val):
    if not root or root.val == val: return root
    return search_bst(root.left, val) if val < root.val else search_bst(root.right, val)`,
      javascript: `function searchBST(root, val) {
  if (!root || root.val === val) return root;
  return val < root.val ? searchBST(root.left, val) : searchBST(root.right, val);
}`,
    },
    defaultInput: { keys: [50, 30, 70, 20, 40, 60, 80] },
    problems: [
      { id: 'p-10-1', title: 'Validate Binary Search Tree', difficulty: 'Medium', companies: ['Amazon', 'Microsoft'], lc: 98 },
      { id: 'p-10-2', title: 'Delete Node in a BST', difficulty: 'Medium', companies: ['Google', 'Meta'], lc: 450 },
    ],
  },

  // 11. AVL Tree
  {
    id: '11-avl-tree',
    topicNumber: 11,
    title: 'AVL Tree & 3D Rotations',
    category: 'Trees & Hierarchical',
    isDataStructure: true,
    priority: PRIORITY_LEVELS.CRITICAL,
    difficulty: 'Hard',
    visualizerType: VISUALIZER_TYPES.TREE_AVL,
    summary: 'Self-balancing BST, balance factor calculation (|h_left - h_right| <= 1), and 3D rotations: Left (LL), Right (RR), Left-Right (LR), Right-Left (RL).',
    subtopics: [
      'AVL Concept & Balance Factor',
      'Height Maintenance in Nodes',
      'Single Left Rotation (RR Imbalance)',
      'Single Right Rotation (LL Imbalance)',
      'Double Left-Right Rotation (LR Imbalance)',
      'Double Right-Left Rotation (RL Imbalance)',
      'Insertion & Deletion with Rebalancing',
      'AVL vs BST Trade-offs',
    ],
    operations: ['Insert with Rotation', 'Delete with Rotation', 'Compute Balance Factor', 'Rotate Left', 'Rotate Right'],
    theory: {
      overview: 'Self-balancing binary tree guaranteeing strict O(log N) height. Any insertion skewing balance factor to +2 or -2 triggers constant-time rotation.',
      complexity: { time: 'Guaranteed O(log N) for Search, Insert, Delete', space: 'O(log N)' },
      keyPatterns: ['Single Rotations', 'Double Rotations', 'Height recalculation on return'],
      whyBruteForceFails: 'Unbalanced trees take O(N) operations; AVL rotations guarantee strict O(log N) worst-case.',
    },
    codeSnippets: {
      python: `def right_rotate(y):
    x = y.left
    y.left = x.right
    x.right = y
    return x`,
      javascript: `function rightRotate(y) {
  const x = y.left;
  y.left = x.right;
  x.right = y;
  return x;
}`,
    },
    defaultInput: { keys: [30, 20, 10, 25, 40, 50] },
    problems: [
      { id: 'p-11-1', title: 'Balanced Binary Tree', difficulty: 'Easy', companies: ['Google'], lc: 110 },
    ],
  },

  // 12. Red-Black Tree & B-Trees
  {
    id: '12-red-black-btree',
    topicNumber: 12,
    title: 'Red-Black Tree & B-Trees',
    category: 'Trees & Hierarchical',
    isDataStructure: true,
    priority: PRIORITY_LEVELS.CRITICAL,
    difficulty: 'Hard',
    visualizerType: VISUALIZER_TYPES.TREE_AVL,
    summary: 'Red-Black color invariants, rotations, recoloring, B-Trees / B+ Trees, multiway search trees, page splits, and database indexes.',
    subtopics: [
      'Red-Black Properties & NIL Nodes',
      'Rotations & Recoloring',
      'AVL vs Red-Black Tree Comparison',
      'Ordered Set & Map Implementations',
      'B-Tree Properties & Order/Degree',
      'B-Tree Search, Insert & Page Split',
      'B+ Tree Leaf Linked Structure',
      'Database Indexing & File Systems',
    ],
    operations: ['Search', 'Insert with Recoloring', 'Page Split (B-Tree)', 'Range Scan (B+ Tree)'],
    theory: {
      overview: 'Red-Black trees require fewer rotations on insert than AVL. B+ Trees minimize disk I/O by storing keys in wide multiway nodes.',
      complexity: { time: 'O(log N) search/insert', space: 'O(N)' },
      keyPatterns: ['Color Flip Invariance', 'Multiway Node Splitting', 'B+ Tree Leaf Sequence Pointer'],
      whyBruteForceFails: 'Binary trees cause random disk head seeks; B+ Trees load full disk blocks in a single seek.',
    },
    codeSnippets: {
      python: `# Red-Black Tree Node Representation
class RBNode:
    def __init__(self, val, color="RED"):
        self.val = val; self.color = color
        self.left = self.right = self.parent = None`,
      javascript: `class RBNode {
  constructor(val, color = 'RED') {
    this.val = val; this.color = color;
  }
}`,
    },
    defaultInput: { keys: [10, 20, 30, 15, 25, 35, 45] },
    problems: [
      { id: 'p-12-1', title: 'Design Self-Balancing Structure', difficulty: 'Hard', companies: ['Oracle', 'Uber'] },
    ],
  },

  // 13. Trie / Prefix Trees
  {
    id: '13-trie',
    topicNumber: 13,
    title: 'Trie (Prefix Trees) & Compressed Tries',
    category: 'Trees & Hierarchical',
    isDataStructure: true,
    priority: PRIORITY_LEVELS.CRITICAL,
    difficulty: 'Medium',
    visualizerType: VISUALIZER_TYPES.TRIE,
    summary: 'Trie nodes, prefix queries, startsWith, autocomplete search rays, Compressed Tries (Radix Tree, Patricia Trie), and Word Search II.',
    subtopics: [
      'Trie Concept & Node Children Map',
      'Insert, Search, Prefix Search (startsWith)',
      'Word Dictionary & Autocomplete',
      'Prefix Counting',
      'Compressed Trie (Radix Tree / Patricia Trie)',
      'Ternary Search Tree (TST)',
      'Suffix Tree & Suffix Array Basics',
    ],
    operations: ['Insert (O(L))', 'Search (O(L))', 'StartsWith (O(L))', 'Autocomplete Ray', 'Delete'],
    theory: {
      overview: 'Tree storing character prefixes along paths. Shared prefixes share nodes, yielding lookup time proportional to word length L.',
      complexity: { time: 'O(L) per search/insert where L is word length', space: 'O(Total chars * Alphabet Size)' },
      keyPatterns: ['Shared Prefix Compression', 'DFS Grid Word Search with Trie', 'Bitwise Max XOR Trie'],
      whyBruteForceFails: 'Comparing prefixes across N strings takes O(N * L). Tries search in O(L) regardless of total stored strings.',
    },
    codeSnippets: {
      python: `class Trie:
    def __init__(self): self.root = {}
    def insert(self, word):
        node = self.root
        for ch in word: node = node.setdefault(ch, {})
        node['$'] = True
    def starts_with(self, prefix):
        node = self.root
        for ch in prefix:
            if ch not in node: return False
            node = node[ch]
        return True`,
      javascript: `class Trie {
  constructor() { this.root = {}; }
  insert(word) {
    let node = this.root;
    for (const ch of word) node = node[ch] = node[ch] || {};
    node.isEnd = true;
  }
  startsWith(prefix) {
    let node = this.root;
    for (const ch of prefix) {
      if (!node[ch]) return false;
      node = node[ch];
    }
    return true;
  }
}`,
    },
    defaultInput: { words: ['apple', 'app', 'apt', 'bat', 'ball'], search: 'app' },
    problems: [
      { id: 'p-13-1', title: 'Implement Trie (Prefix Tree)', difficulty: 'Medium', companies: ['Microsoft', 'Google'], lc: 208 },
      { id: 'p-13-2', title: 'Word Search II', difficulty: 'Hard', companies: ['Amazon', 'Meta'], lc: 212 },
    ],
  },

  // 14. Graph Data Structures & Representations
  {
    id: '14-graphs',
    topicNumber: 14,
    title: 'Graph Data Structures & 3D Spatial Traversal',
    category: 'Graphs & Networks',
    isDataStructure: true,
    priority: PRIORITY_LEVELS.CRITICAL,
    difficulty: 'Medium',
    visualizerType: VISUALIZER_TYPES.GRAPH_SPATIAL,
    summary: 'Vertices, edges, directed/undirected, weighted, DAGs, Adjacency Matrix vs Adjacency List, 3D BFS wavefronts, and DFS traversal.',
    subtopics: [
      'Graph Terminology (Vertex, Edge, Degree, Path, Cycle)',
      'Directed vs Undirected, Weighted vs Unweighted',
      'Adjacency Matrix Representation',
      'Adjacency List Representation',
      'Edge List & Incidence Matrix',
      'Breadth-First Search (BFS Concentric Waves)',
      'Depth-First Search (DFS Recursive Plunge)',
      'Connected Components & Island Counting',
    ],
    operations: ['Add Vertex/Edge', 'Lookup Edge', 'BFS Traversal', 'DFS Traversal', 'Connected Components'],
    theory: {
      overview: 'Models non-linear networks. Adjacency lists save memory for sparse graphs: O(V + E) vs O(V^2).',
      complexity: { time: 'BFS/DFS: O(V + E)', space: 'O(V + E) adjacency list' },
      keyPatterns: ['Queue BFS for unweighted shortest paths', 'Recursion DFS for paths & cycles', 'Visited Set Pruning'],
      whyBruteForceFails: 'Unmarked graph traversals get trapped in infinite cyclic loops.',
    },
    codeSnippets: {
      python: `from collections import deque
def bfs(adj, start):
    visited = {start}; q = deque([start]); res = []
    while q:
        u = q.popleft(); res.append(u)
        for v in adj.get(u, []):
            if v not in visited:
                visited.add(v); q.append(v)
    return res`,
      javascript: `function bfs(adj, start) {
  const visited = new Set([start]), q = [start], res = [];
  while (q.length) {
    const u = q.shift(); res.push(u);
    for (const v of adj[u] || []) {
      if (!visited.has(v)) { visited.add(v); q.push(v); }
    }
  }
  return res;
}`,
    },
    defaultInput: { nodes: [0, 1, 2, 3, 4, 5], edges: [[0, 1], [0, 2], [1, 3], [1, 4], [2, 4], [3, 5], [4, 5]], startNode: 0 },
    problems: [
      { id: 'p-14-1', title: 'Number of Islands', difficulty: 'Medium', companies: ['Amazon', 'Google'], lc: 200 },
      { id: 'p-14-2', title: 'Rotting Oranges', difficulty: 'Medium', companies: ['Microsoft'], lc: 994 },
    ],
  },

  // 15. Disjoint Set Union
  {
    id: '15-dsu',
    topicNumber: 15,
    title: 'Disjoint Set Union (DSU / Union-Find)',
    category: 'Advanced & Range Queries',
    isDataStructure: true,
    priority: PRIORITY_LEVELS.CRITICAL,
    difficulty: 'Medium',
    visualizerType: VISUALIZER_TYPES.GRAPH_SPATIAL,
    summary: 'Disjoint set partition, parent arrays, find with path compression, union by rank/size, and dynamic connectivity.',
    subtopics: [
      'DSU / Union-Find Concept',
      'Parent Array Structure',
      'Find Operation with Path Compression',
      'Union by Rank & Union by Size',
      'Connected Components Tracking',
      'Dynamic Connectivity',
      'Cycle Detection in Undirected Graph',
      'Kruskal MST Integration',
    ],
    operations: ['Find (Amortized O(1))', 'Union (Amortized O(1))', 'Connected Query', 'Count Sets'],
    theory: {
      overview: 'Partitions elements into disjoint trees. Path compression and union by rank achieve nearly O(1) Ackermann alpha(N) operations.',
      complexity: { time: 'Amortized O(alpha(N)) ≈ O(1)', space: 'O(N)' },
      keyPatterns: ['Path Compression parent[x] = find(parent[x])', 'Union by Rank depth optimization'],
      whyBruteForceFails: 'Simple parent pointers degrade to linear O(N) chains without path compression.',
    },
    codeSnippets: {
      python: `class DSU:
    def __init__(self, n):
        self.p = list(range(n)); self.r = [0] * n
    def find(self, x):
        if self.p[x] != x: self.p[x] = self.find(self.p[x])
        return self.p[x]
    def union(self, x, y):
        rx, ry = self.find(x), self.find(y)
        if rx == ry: return False
        if self.r[rx] < self.r[ry]: rx, ry = ry, rx
        self.p[ry] = rx
        if self.r[rx] == self.r[ry]: self.r[rx] += 1
        return True`,
      javascript: `class DSU {
  constructor(n) {
    this.p = Array.from({length: n}, (_, i) => i);
  }
  find(x) {
    return this.p[x] === x ? x : (this.p[x] = this.find(this.p[x]));
  }
  union(x, y) {
    let rx = this.find(x), ry = this.find(y);
    if (rx === ry) return false;
    this.p[rx] = ry;
    return true;
  }
}`,
    },
    defaultInput: { numNodes: 5, edges: [[0, 1], [1, 2], [3, 4]] },
    problems: [
      { id: 'p-15-1', title: 'Redundant Connection', difficulty: 'Medium', companies: ['Google'], lc: 684 },
      { id: 'p-15-2', title: 'Number of Provinces', difficulty: 'Medium', companies: ['Amazon'], lc: 547 },
    ],
  },

  // 16. Range Query Structures
  {
    id: '16-range-queries',
    topicNumber: 16,
    title: 'Range Query Structures: Segment Tree & Fenwick (BIT)',
    category: 'Advanced & Range Queries',
    isDataStructure: true,
    priority: PRIORITY_LEVELS.CRITICAL,
    difficulty: 'Hard',
    visualizerType: VISUALIZER_TYPES.TREE_BINARY,
    summary: 'Segment Tree, range sum/min/max queries, point update, lazy propagation, Fenwick Tree (Binary Indexed Tree), and Sparse Tables.',
    subtopics: [
      'Segment Tree (Interval Partitioning)',
      'Recursive & Iterative Segment Tree',
      'Range Sum, Range Min/Max Queries',
      'Point Updates (O(log N))',
      'Range Updates with Lazy Propagation',
      'Fenwick Tree (Binary Indexed Tree / BIT)',
      'Lowbit Isolation (x & (-x))',
      'Sparse Table (O(1) Static RMQ)',
    ],
    operations: ['Build Tree (O(N))', 'Range Query (O(log N))', 'Point Update (O(log N))', 'Lazy Range Update (O(log N))'],
    theory: {
      overview: 'Each segment tree node stores aggregate for interval [L, R]. Range updates defer modifications via lazy tags until queried.',
      complexity: { time: 'Build: O(N) | Query: O(log N) | Update: O(log N)', space: 'O(4N)' },
      keyPatterns: ['Interval Decomposition', 'Lazy Tag Propagation', 'Associative Monoid Merging'],
      whyBruteForceFails: 'Prefix sums offer O(1) query but O(N) updates. Segment trees achieve O(log N) for both.',
    },
    codeSnippets: {
      python: `class SegmentTree:
    def __init__(self, arr):
        self.n = len(arr); self.tree = [0] * (4 * self.n)
        self.build(arr, 0, 0, self.n - 1)
    def build(self, arr, node, l, r):
        if l == r: self.tree[node] = arr[l]; return
        mid = (l + r) // 2
        self.build(arr, 2*node+1, l, mid); self.build(arr, 2*node+2, mid+1, r)
        self.tree[node] = self.tree[2*node+1] + self.tree[2*node+2]`,
      javascript: `class SegmentTree {
  constructor(arr) {
    this.n = arr.length;
    this.tree = Array(4 * this.n).fill(0);
  }
}`,
    },
    defaultInput: { array: [1, 3, 5, 7, 9, 11] },
    problems: [
      { id: 'p-16-1', title: 'Range Sum Query - Mutable', difficulty: 'Medium', companies: ['Google', 'Meta'], lc: 307 },
    ],
  },

  // 17. Cache & Systems Data Structures
  {
    id: '17-cache-systems',
    topicNumber: 17,
    title: 'Cache & Systems Structures: LRU & LFU Cache',
    category: 'Hash & Cache Systems',
    isDataStructure: true,
    priority: PRIORITY_LEVELS.CRITICAL,
    difficulty: 'Medium',
    visualizerType: VISUALIZER_TYPES.LINKED_LIST,
    summary: 'Least Recently Used (LRU) cache eviction, LFU cache, MRU cache, combining HashMaps with Doubly Linked Lists, and circular ring buffers.',
    subtopics: [
      'LRU Cache (HashMap + Doubly Linked List)',
      'LFU Cache (Frequency Buckets)',
      'MRU Cache',
      'Ring Buffer / Circular Buffer',
      'Memory Pool & Object Pool Allocators',
      'Skip List vs Balanced Trees',
    ],
    operations: ['Get (O(1))', 'Put / Evict (O(1))', 'Splice to Head', 'Evict Tail'],
    theory: {
      overview: 'Maintains items in access recency order. HashMap maps keys to Doubly Linked List nodes for instant O(1) detachment and re-insertion.',
      complexity: { time: 'O(1) get and put guaranteed', space: 'O(Capacity)' },
      keyPatterns: ['Doubly Linked List node splicing', 'HashMap node pointer mapping', 'Pseudo Head & Tail dummy nodes'],
      whyBruteForceFails: 'Array unshifting/shifting takes O(N); pointers allow true O(1) removals.',
    },
    codeSnippets: {
      python: `class LRUCache:
    def __init__(self, capacity):
        self.cap = capacity; self.cache = {}
    # Doubly LL + HashMap implementation`,
      javascript: `class LRUCache {
  constructor(capacity) {
    this.capacity = capacity; this.map = new Map();
  }
  get(key) {
    if (!this.map.has(key)) return -1;
    const val = this.map.get(key);
    this.map.delete(key); this.map.set(key, val);
    return val;
  }
  put(key, val) {
    if (this.map.has(key)) this.map.delete(key);
    this.map.set(key, val);
    if (this.map.size > this.capacity) {
      this.map.delete(this.map.keys().next().value);
    }
  }
}`,
    },
    defaultInput: { capacity: 3, operations: ['put(1,10)', 'put(2,20)', 'get(1)', 'put(3,30)', 'put(4,40)'] },
    problems: [
      { id: 'p-17-1', title: 'LRU Cache', difficulty: 'Medium', companies: ['Amazon', 'Google', 'Meta'], lc: 146 },
      { id: 'p-17-2', title: 'LFU Cache', difficulty: 'Hard', companies: ['Amazon', 'Microsoft'], lc: 460 },
    ],
  },

  // 18. Dynamic Programming
  {
    id: '18-dynamic-programming',
    topicNumber: 18,
    title: 'Dynamic Programming: 3D Grid & 0/1 Knapsack',
    category: 'Core Algorithms',
    isDataStructure: false,
    priority: PRIORITY_LEVELS.CRITICAL,
    difficulty: 'Hard',
    visualizerType: VISUALIZER_TYPES.DP_GRID,
    summary: 'Overlapping subproblems, optimal substructure, 1D/2D grid elevations, 0/1 Knapsack, Coin Change, and Longest Common Subsequence.',
    subtopics: [
      'Overlapping Subproblems & Optimal Substructure',
      'Memoization (Top-Down) vs Tabulation (Bottom-Up)',
      '1D DP (Fibonacci, Climbing Stairs, House Robber)',
      '2D Grid DP (Unique Paths, Min Path Sum)',
      'Knapsack (0/1, Unbounded, Target Sum)',
      'Sequence DP (LIS, LCS, Edit Distance)',
      'State Compression & 1D Rolling Array',
    ],
    operations: ['State Transition', 'Table Lookup', 'Space Optimization'],
    theory: {
      overview: 'Stores subproblem results in a grid. In 0/1 Knapsack: dp[i][w] = max(dp[i-1][w], val[i] + dp[i-1][w - wt[i]]). Visualized as a 3D relief grid.',
      complexity: { time: 'O(N * W)', space: 'O(N * W) -> O(W) with rolling array' },
      keyPatterns: ['State Definition', 'Optimal Substructure Transitions', '1D Rolling Space Optimization'],
      whyBruteForceFails: 'Recursion without memoization recomputes identical subtrees exponentially in O(2^N). DP collapses this to polynomial O(N * W).',
    },
    codeSnippets: {
      python: `def knapsack(values, weights, W):
    n = len(values)
    dp = [[0] * (W + 1) for _ in range(n + 1)]
    for i in range(1, n + 1):
        for w in range(1, W + 1):
            if weights[i-1] <= w:
                dp[i][w] = max(dp[i-1][w], values[i-1] + dp[i-1][w - weights[i-1]])
            else: dp[i][w] = dp[i-1][w]
    return dp[n][W]`,
      javascript: `function knapsack(val, wt, W) {
  const dp = Array.from({length: val.length + 1}, () => Array(W + 1).fill(0));
  for (let i = 1; i <= val.length; i++) {
    for (let w = 1; w <= W; w++) {
      if (wt[i-1] <= w) dp[i][w] = Math.max(dp[i-1][w], val[i-1] + dp[i-1][w - wt[i-1]]);
      else dp[i][w] = dp[i-1][w];
    }
  }
  return dp[val.length][W];
}`,
    },
    defaultInput: { values: [60, 100, 120], weights: [10, 20, 30], capacity: 50 },
    problems: [
      { id: 'p-18-1', title: 'Coin Change', difficulty: 'Medium', companies: ['Amazon', 'Bloomberg'], lc: 322 },
      { id: 'p-18-2', title: 'Partition Equal Subset Sum', difficulty: 'Medium', companies: ['Meta'], lc: 416 },
    ],
  },
]
