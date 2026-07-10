function buildSeeds(entries) {
  return entries.flatMap(({ subject, category, topics }) =>
    topics.map((name) => ({ name, subject, category, status: 'Not Started', confidence: 'Low', isPreSeeded: true }))
  )
}

const dsa = buildSeeds([
  { subject: 'DSA', category: 'Arrays & Strings', topics: ['Arrays Basics', 'Two Pointers', 'Sliding Window', 'Prefix Sum', "Kadane's Algorithm", 'String Manipulation', 'Anagrams & Hashing'] },
  { subject: 'DSA', category: 'Linked Lists', topics: ['Singly Linked List', 'Doubly Linked List', 'Fast & Slow Pointers', 'Reverse a Linked List', 'Merge Linked Lists', 'Detect Cycle'] },
  { subject: 'DSA', category: 'Stacks & Queues', topics: ['Stack Implementation', 'Queue Implementation', 'Monotonic Stack', 'Next Greater Element', 'LRU Cache Design'] },
  { subject: 'DSA', category: 'Trees', topics: ['Binary Tree Traversals', 'Binary Search Tree', 'Height & Depth Problems', 'Lowest Common Ancestor', 'Diameter of Tree', 'Level Order Traversal', 'Segment Tree Basics'] },
  { subject: 'DSA', category: 'Graphs', topics: ['BFS', 'DFS', 'Topological Sort', "Dijkstra's Algorithm", 'Union Find (DSU)', 'Minimum Spanning Tree', 'Detect Cycle in Graph', 'Flood Fill'] },
  { subject: 'DSA', category: 'Dynamic Programming', topics: ['Recursion & Memoization', '1D DP', '2D DP', 'Knapsack Problem', 'Longest Common Subsequence', 'Longest Increasing Subsequence', 'Matrix DP', 'Partition DP'] },
  { subject: 'DSA', category: 'Searching & Sorting', topics: ['Binary Search', 'Binary Search on Answer', 'Merge Sort', 'Quick Sort', 'Counting Sort'] },
  { subject: 'DSA', category: 'Greedy & Backtracking', topics: ['Greedy Algorithms', 'N-Queens', 'Sudoku Solver', 'Subset Generation', 'Permutations'] },
])

const os = buildSeeds([
  { subject: 'OS', category: 'Process Management', topics: ['Process vs Thread', 'CPU Scheduling Algorithms', 'Deadlock (Detection, Prevention, Avoidance)', 'Process Synchronization', 'Semaphores & Mutex', 'Inter-Process Communication'] },
  { subject: 'OS', category: 'Memory Management', topics: ['Virtual Memory', 'Paging & Segmentation', 'Page Replacement Algorithms', 'Memory Allocation', 'Thrashing'] },
  { subject: 'OS', category: 'Storage & Files', topics: ['File Systems', 'Disk Scheduling Algorithms', 'RAID Levels', 'I/O Management'] },
])

const dbms = buildSeeds([
  { subject: 'DBMS', category: 'Fundamentals', topics: ['ER Diagrams', 'Relational Model', 'Keys (Primary, Foreign, Candidate)', 'Normalization (1NF to BCNF)', 'Functional Dependencies'] },
  { subject: 'DBMS', category: 'SQL', topics: ['Basic SQL Queries', 'Joins (all types)', 'Subqueries', 'Aggregate Functions', 'Indexing', 'Views', 'Stored Procedures'] },
  { subject: 'DBMS', category: 'Transactions', topics: ['ACID Properties', 'Transaction Isolation Levels', 'Concurrency Control', 'Two Phase Locking', 'Deadlock in DBMS'] },
  { subject: 'DBMS', category: 'NoSQL & Advanced', topics: ['NoSQL vs SQL', 'CAP Theorem', 'MongoDB Basics', 'Query Optimization'] },
])

const cn = buildSeeds([
  { subject: 'CN', category: 'Fundamentals', topics: ['OSI Model (all 7 layers)', 'TCP/IP Model', 'Transmission Media', 'Network Topologies'] },
  { subject: 'CN', category: 'Protocols', topics: ['TCP vs UDP', 'HTTP vs HTTPS', 'DNS', 'DHCP', 'ARP', 'ICMP', 'FTP', 'SMTP'] },
  { subject: 'CN', category: 'Network Layer', topics: ['IP Addressing', 'Subnetting', 'CIDR', 'Routing Algorithms', 'NAT'] },
  { subject: 'CN', category: 'Advanced', topics: ['Socket Programming Basics', 'Congestion Control', 'Flow Control', 'SSL/TLS', 'Firewalls & Proxies'] },
])

const oops = buildSeeds([
  { subject: 'OOPS', category: 'Core Concepts', topics: ['Classes & Objects', 'Encapsulation', 'Abstraction', 'Inheritance (all types)', 'Polymorphism', 'Method Overloading vs Overriding'] },
  { subject: 'OOPS', category: 'Advanced', topics: ['Abstract Classes vs Interfaces', 'Design Patterns (Singleton, Factory, Observer, Strategy)', 'SOLID Principles', 'Composition vs Inheritance'] },
])

const quant = buildSeeds([
  { subject: 'Aptitude-Quant', category: 'Arithmetic', topics: ['Percentages', 'Profit & Loss', 'Simple & Compound Interest', 'Ratio & Proportion', 'Averages', 'Mixtures & Alligation'] },
  { subject: 'Aptitude-Quant', category: 'Time Based', topics: ['Time & Work', 'Pipes & Cisterns', 'Time Speed Distance', 'Trains Problems', 'Boats & Streams'] },
  { subject: 'Aptitude-Quant', category: 'Number Systems', topics: ['Number System Basics', 'LCM & HCF', 'Divisibility Rules', 'Remainders', 'Factors & Multiples', 'Surds & Indices'] },
  { subject: 'Aptitude-Quant', category: 'Algebra & Geometry', topics: ['Linear Equations', 'Quadratic Equations', 'Progressions (AP, GP)', 'Permutations & Combinations', 'Probability', 'Mensuration (2D & 3D)'] },
])

const logical = buildSeeds([
  { subject: 'Aptitude-Logical', category: 'Verbal Reasoning', topics: ['Syllogisms', 'Blood Relations', 'Direction Sense', 'Coding-Decoding', 'Analogies', 'Classification'] },
  { subject: 'Aptitude-Logical', category: 'Non-Verbal Reasoning', topics: ['Series Completion (Number & Figure)', 'Pattern Recognition', 'Mirror Images', 'Venn Diagrams', 'Cubes & Dice'] },
  { subject: 'Aptitude-Logical', category: 'Analytical', topics: ['Seating Arrangement (Linear & Circular)', 'Puzzles', 'Scheduling Problems', 'Data Sufficiency', 'Input-Output Machines'] },
])

const verbal = buildSeeds([
  { subject: 'Aptitude-Verbal', category: 'Grammar & Vocabulary', topics: ['Sentence Correction', 'Fill in the Blanks', 'Synonyms & Antonyms', 'Idioms & Phrases', 'One Word Substitution', 'Spelling Check'] },
  { subject: 'Aptitude-Verbal', category: 'Comprehension & Reasoning', topics: ['Reading Comprehension', 'Para Jumbles', 'Sentence Completion', 'Critical Reasoning', 'Inference Based Questions'] },
])

export const topicSeeds = [...dsa, ...os, ...dbms, ...cn, ...oops, ...quant, ...logical, ...verbal]

export const DSA_CATEGORIES = [...new Set(dsa.map((t) => t.category))]
export const CS_SUBJECTS = ['OS', 'DBMS', 'CN', 'OOPS']
export const APTITUDE_SUBJECTS = ['Aptitude-Quant', 'Aptitude-Logical', 'Aptitude-Verbal']

export const SUBJECT_LABELS = {
  'Aptitude-Quant': 'Quantitative',
  'Aptitude-Logical': 'Logical Reasoning',
  'Aptitude-Verbal': 'Verbal',
}
