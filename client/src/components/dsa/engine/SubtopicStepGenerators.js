// Subtopic-specific Step Generators for 3D DSA Lab
// Provides deterministic execution traces, synchronized code snippets (Python & JS),
// variable state tracking, and specialized 3D WebGL scene states for subtopics.

// 1. DYNAMIC ARRAY: CAPACITY DOUBLING
export function generateDynamicArrayDoublingSteps() {
  const pyCode = `def dynamic_array_doubling():
    capacity = 4
    size = 4
    # Array is full -> geometric doubling
    new_capacity = capacity * 2  # 8
    new_arr = [None] * new_capacity
    for i in range(size):
        new_arr[i] = old_arr[i]
    new_arr[size] = 99  # Append
    size += 1
    return new_arr`

  const jsCode = `function dynamicArrayDoubling() {
  let capacity = 4;
  let size = 4;
  // Array is full -> geometric doubling
  const newCapacity = capacity * 2; // 8
  const newArr = new Array(newCapacity).fill(null);
  for (let i = 0; i < size; i++) {
    newArr[i] = oldArr[i];
  }
  newArr[size] = 99; // Append
  size++;
  return newArr;
}`

  const codeSnippet = { python: pyCode, javascript: jsCode }
  const steps = []

  steps.push({
    lineNumber: 2,
    lineCode: 'capacity = 4; size = 4  # Capacity is full',
    codeSnippet,
    variables: { size: 4, capacity: 4, appendVal: 99, status: 'BUFFER_FULL' },
    sceneState: {
      type: 'array_1d',
      array: [10, 20, 30, 40],
      pointers: [{ name: 'size', index: 3, color: '#3b82f6' }],
      activeRange: [0, 3],
      highlightIndices: [3],
    },
    callStack: ['dynamic_array_doubling()'],
    explanation: 'Array has reached maximum capacity (size 4 / cap 4). Appending 99 triggers dynamic reallocation.',
  })

  steps.push({
    lineNumber: 5,
    lineCode: 'new_capacity = capacity * 2  # 8 (Geometric Doubling)',
    codeSnippet,
    variables: { oldCapacity: 4, newCapacity: 8, appendVal: 99 },
    sceneState: {
      type: 'array_1d',
      array: [10, 20, 30, 40, null, null, null, null],
      pointers: [
        { name: 'old_end', index: 3, color: '#3b82f6' },
        { name: 'new_cap', index: 7, color: '#ec4899' },
      ],
      activeRange: [0, 7],
      highlightIndices: [4, 5, 6, 7],
    },
    callStack: ['dynamic_array_doubling()'],
    explanation: 'Allocated new continuous memory buffer with doubled capacity (8 slots). Doubling strategy amortizes future appends.',
  })

  steps.push({
    lineNumber: 7,
    lineCode: 'for i in range(size): new_arr[i] = old_arr[i]',
    codeSnippet,
    variables: { size: 4, capacity: 8, copiedCount: 4 },
    sceneState: {
      type: 'array_1d',
      array: [10, 20, 30, 40, null, null, null, null],
      pointers: [{ name: 'copied', index: 3, color: '#10b981' }],
      activeRange: [0, 3],
      highlightIndices: [0, 1, 2, 3],
    },
    callStack: ['dynamic_array_doubling()'],
    explanation: 'Migrated all 4 existing elements into the first 4 slots of the new buffer. Cost is O(N) only on resize.',
  })

  steps.push({
    lineNumber: 9,
    lineCode: 'new_arr[size] = 99  # Write 99 into vacant slot 4',
    codeSnippet,
    variables: { size: 4, capacity: 8, 'new_arr[4]': 99 },
    sceneState: {
      type: 'array_1d',
      array: [10, 20, 30, 40, 99, null, null, null],
      pointers: [{ name: 'inserted', index: 4, color: '#22c55e' }],
      activeRange: [0, 4],
      highlightIndices: [4],
    },
    callStack: ['dynamic_array_doubling()'],
    explanation: 'Wrote new element 99 directly into slot [4]. Array still has 3 vacant slots available.',
  })

  steps.push({
    lineNumber: 10,
    lineCode: 'size += 1  # size updated to 5',
    codeSnippet,
    variables: { size: 5, capacity: 8, unusedSlots: 3, amortizedCost: 'O(1)' },
    sceneState: {
      type: 'array_1d',
      array: [10, 20, 30, 40, 99, null, null, null],
      pointers: [
        { name: 'size', index: 4, color: '#3b82f6' },
        { name: 'cap', index: 7, color: '#ec4899' },
      ],
      activeRange: [0, 4],
      highlightIndices: [4],
    },
    callStack: ['dynamic_array_doubling()'],
    explanation: 'Resize complete! Size updated to 5. Future appends run in pure O(1) time until capacity 8 is exceeded.',
  })

  return steps
}

// 2. 2D ARRAY / MATRIX: ROW-MAJOR TRAVERSAL
export function generate2DMatrixSteps() {
  const pyCode = `def traverse_2d_matrix(matrix):
    rows = len(matrix)
    cols = len(matrix[0])
    for r in range(rows):
        for c in range(cols):
            val = matrix[r][c]
            # O(1) address: base + (r * cols + c) * size
            process(val)`

  const jsCode = `function traverse2DMatrix(matrix) {
  const rows = matrix.length;
  const cols = matrix[0].length;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const val = matrix[r][c];
      // addr = base + (r * cols + c) * size
      process(val);
    }
  }
}`

  const codeSnippet = { python: pyCode, javascript: jsCode }
  const table = [
    [12, 25, 33],
    [41, 58, 64],
    [73, 89, 95],
  ]
  const steps = []

  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      const val = table[r][c]
      const linearOffset = r * 3 + c
      const memAddr = `0x${(4096 + linearOffset * 4).toString(16)}`

      steps.push({
        lineNumber: 6,
        lineCode: 'val = matrix[r][c]  # Linear offset: (r * cols + c)',
        codeSnippet,
        variables: {
          r,
          c,
          'matrix[r][c]': val,
          linearIndex: linearOffset,
          memoryAddress: memAddr,
        },
        sceneState: {
          type: 'array_2d',
          table,
          activeCell: [r, c],
          highlightDepCells: c > 0 ? [[r, c - 1]] : r > 0 ? [[r - 1, 2]] : [],
        },
        callStack: ['traverse_2d_matrix(matrix)'],
        explanation: `Row-Major scanning cell [${r}][${c}] (val = ${val}). Linear memory offset = ${linearOffset} (Physical Address: ${memAddr}).`,
      })
    }
  }

  return steps
}

// 3. CIRCULAR ARRAY (RING BUFFER)
export function generateCircularArraySteps() {
  const pyCode = `def circular_array_access(arr, front, capacity):
    # Traversal using ring buffer modulo arithmetic
    for offset in range(capacity):
        actual_index = (front + offset) % capacity
        val = arr[actual_index]
        process(val)`

  const jsCode = `function circularArrayAccess(arr, front, capacity) {
  for (let offset = 0; offset < capacity; offset++) {
    const actualIndex = (front + offset) % capacity;
    const val = arr[actualIndex];
    process(val);
  }
}`

  const codeSnippet = { python: pyCode, javascript: jsCode }
  const arr = [15, 25, 35, 45, 55, 65]
  const capacity = arr.length
  const front = 4
  const steps = []

  for (let offset = 0; offset < capacity; offset++) {
    const actualIndex = (front + offset) % capacity
    const isWrap = front + offset >= capacity

    steps.push({
      lineNumber: 4,
      lineCode: 'actual_index = (front + offset) % capacity',
      codeSnippet,
      variables: {
        front,
        offset,
        actualIndex,
        'arr[actualIndex]': arr[actualIndex],
        wrappedAround: isWrap,
      },
      sceneState: {
        type: 'array_1d',
        array: [...arr],
        pointers: [
          { name: 'FRONT', index: front, color: '#3b82f6' },
          { name: `i=${actualIndex}`, index: actualIndex, color: isWrap ? '#f59e0b' : '#10b981' },
        ],
        activeRange: [Math.min(front, actualIndex), Math.max(front, actualIndex)],
        highlightIndices: [actualIndex],
      },
      callStack: ['circular_array_access(arr, front, cap)'],
      explanation: isWrap
        ? `Index wrapping! (${front} + ${offset}) % ${capacity} = ${actualIndex}. Pointer wraps cleanly back to front of buffer.`
        : `Accessing logical offset ${offset}: index (${front} + ${offset}) % ${capacity} = ${actualIndex} (val = ${arr[actualIndex]}).`,
    })
  }

  return steps
}

// 4. STATIC ARRAY O(1) RANDOM ACCESS
export function generateStaticArraySteps() {
  const pyCode = `def static_array_access(arr):
    # Direct O(1) address calculation: base + (i * sizeof(int))
    first = arr[0]
    mid = arr[len(arr) // 2]
    last = arr[-1]
    return first, mid, last`

  const jsCode = `function staticArrayAccess(arr) {
  // Direct O(1) address calculation: base + (i * 4)
  const first = arr[0];
  const mid = arr[Math.floor(arr.length / 2)];
  const last = arr[arr.length - 1];
  return { first, mid, last };
}`

  const codeSnippet = { python: pyCode, javascript: jsCode }
  const arr = [10, 20, 30, 40, 50, 60, 70]
  const steps = []

  const targets = [
    { idx: 0, line: 3, name: 'first' },
    { idx: 3, line: 4, name: 'mid' },
    { idx: 6, line: 5, name: 'last' },
  ]

  targets.forEach(({ idx, line, name }) => {
    const memAddr = `0x${(4096 + idx * 4).toString(16)}`
    steps.push({
      lineNumber: line,
      lineCode: `${name} = arr[${idx}]  # Direct O(1) memory address: base + ${idx} * 4`,
      codeSnippet,
      variables: { index: idx, value: arr[idx], memoryAddress: memAddr, timeComplexity: 'O(1)' },
      sceneState: {
        type: 'array_1d',
        array: [...arr],
        pointers: [{ name, index: idx, color: '#38bdf8' }],
        highlightIndices: [idx],
        activeRange: [idx, idx],
      },
      callStack: ['static_array_access(arr)'],
      explanation: `O(1) Direct Access to ${name} at index ${idx} (value ${arr[idx]}). Memory Address: ${memAddr}. No sequential scan required!`,
    })
  })

  return steps
}

// 5. ARRAY INSERT: O(N) ELEMENT SHIFTING
export function generateArrayShiftSteps() {
  const pyCode = `def insert_at_index(arr, target_idx, val):
    # Shift elements right to create gap
    for i in range(len(arr) - 1, target_idx, -1):
        arr[i] = arr[i - 1]
    arr[target_idx] = val
    return arr`

  const jsCode = `function insertAtIndex(arr, targetIdx, val) {
  for (let i = arr.length - 1; i > targetIdx; i--) {
    arr[i] = arr[i - 1];
  }
  arr[targetIdx] = val;
  return arr;
}`

  const codeSnippet = { python: pyCode, javascript: jsCode }
  const arr = [10, 20, 30, 40, 0]
  const targetIdx = 1
  const newVal = 99
  const steps = []

  steps.push({
    lineNumber: 2,
    lineCode: '# Prepare to insert 99 at index 1',
    codeSnippet,
    variables: { targetIdx, newVal, currentArray: [...arr] },
    sceneState: {
      type: 'array_1d',
      array: [...arr],
      pointers: [{ name: 'target', index: targetIdx, color: '#ec4899' }],
      highlightIndices: [targetIdx],
    },
    callStack: ['insert_at_index(arr, 1, 99)'],
    explanation: 'To insert 99 at index 1, all subsequent elements must shift right by 1 position.',
  })

  for (let i = arr.length - 1; i > targetIdx; i--) {
    arr[i] = arr[i - 1]
    steps.push({
      lineNumber: 4,
      lineCode: 'arr[i] = arr[i - 1]  # Shifting element right',
      codeSnippet,
      variables: { i, shiftedVal: arr[i], currentArray: [...arr] },
      sceneState: {
        type: 'array_1d',
        array: [...arr],
        pointers: [
          { name: `shift_to`, index: i, color: '#f59e0b' },
          { name: `from`, index: i - 1, color: '#3b82f6' },
        ],
        highlightIndices: [i, i - 1],
      },
      callStack: ['insert_at_index(arr, 1, 99)'],
      explanation: `Shifted element ${arr[i]} from index ${i - 1} into index ${i}. Cost is O(1) per shift, total O(N).`,
    })
  }

  arr[targetIdx] = newVal
  steps.push({
    lineNumber: 5,
    lineCode: 'arr[target_idx] = val  # Insert 99 into gap',
    codeSnippet,
    variables: { targetIdx, val: newVal, currentArray: [...arr] },
    sceneState: {
      type: 'array_1d',
      array: [...arr],
      pointers: [{ name: 'INSERTED', index: targetIdx, color: '#22c55e' }],
      highlightIndices: [targetIdx],
    },
    callStack: ['insert_at_index(arr, 1, 99)'],
    explanation: 'Gap created! Value 99 successfully inserted at index 1. Total array insertion cost: O(N).',
  })

  return steps
}

// 6. SPARSE ARRAY
export function generateSparseArraySteps() {
  const pyCode = `def sparse_array_lookup(sparse_map, idx):
    # Space-efficient: stores only non-zero entries
    val = sparse_map.get(idx, 0)
    return val`

  const jsCode = `function sparseArrayLookup(sparseMap, idx) {
  return sparseMap[idx] || 0;
}`

  const codeSnippet = { python: pyCode, javascript: jsCode }
  const arr = [0, 0, 85, 0, 0, 92, 0, 0, 0, 47]
  const steps = []

  const lookups = [2, 5, 9]
  lookups.forEach((idx) => {
    steps.push({
      lineNumber: 3,
      lineCode: 'val = sparse_map.get(idx, 0)',
      codeSnippet,
      variables: { index: idx, nonZeroVal: arr[idx], storedKeys: 3, totalSize: 10 },
      sceneState: {
        type: 'array_1d',
        array: [...arr],
        pointers: [{ name: `non_zero`, index: idx, color: '#10b981' }],
        highlightIndices: [idx],
      },
      callStack: ['sparse_array_lookup(sparse_map, idx)'],
      explanation: `Sparse array lookup at index ${idx} yields non-zero value ${arr[idx]}. Memory usage is O(K) where K is non-zero elements, saving 70% space!`,
    })
  })

  return steps
}

// 7. DOUBLY LINKED LIST
export function generateDoublyLinkedListSteps() {
  const pyCode = `def doubly_linked_list_traverse(head):
    curr = head
    # 1. Forward traversal using .next
    while curr.next:
        curr = curr.next
    tail = curr
    # 2. Backward traversal using .prev
    while curr:
        curr = curr.prev`

  const jsCode = `function doublyLinkedListTraverse(head) {
  let curr = head;
  // Forward traversal
  while (curr.next) curr = curr.next;
  // Backward traversal
  while (curr) curr = curr.prev;
}`

  const codeSnippet = { python: pyCode, javascript: jsCode }
  const nodes = [
    { id: 0, val: 10, nextId: 1, prevId: null },
    { id: 1, val: 20, nextId: 2, prevId: 0 },
    { id: 2, val: 30, nextId: 3, prevId: 1 },
    { id: 3, val: 40, nextId: null, prevId: 2 },
  ]
  const steps = []

  // Forward traversal
  nodes.forEach((node, idx) => {
    steps.push({
      lineNumber: 4,
      lineCode: 'curr = curr.next  # Forward scan via .next',
      codeSnippet,
      variables: {
        direction: 'FORWARD',
        currentNode: `Node(${node.val})`,
        hasPrev: node.prevId !== null,
        hasNext: node.nextId !== null,
      },
      sceneState: {
        type: 'linked_list',
        nodes,
        pointers: [{ name: 'curr', nodeId: idx, color: '#06b6d4' }],
        isDoubly: true,
      },
      callStack: ['doubly_linked_list_traverse(head)'],
      explanation: `Forward scan at Node(${node.val}). In a Doubly Linked List, each node maintains both next (cyan) and prev (magenta) pointers.`,
    })
  })

  // Backward traversal
  for (let idx = nodes.length - 1; idx >= 0; idx--) {
    const node = nodes[idx]
    steps.push({
      lineNumber: 9,
      lineCode: 'curr = curr.prev  # Backward scan via .prev',
      codeSnippet,
      variables: {
        direction: 'BACKWARD',
        currentNode: `Node(${node.val})`,
        prevTarget: idx > 0 ? `Node(${nodes[idx - 1].val})` : 'None',
      },
      sceneState: {
        type: 'linked_list',
        nodes,
        pointers: [{ name: 'curr', nodeId: idx, color: '#ec4899' }],
        isDoubly: true,
      },
      callStack: ['doubly_linked_list_traverse(head)'],
      explanation: `Backward scan at Node(${node.val}) via curr.prev. Doubly linked lists enable O(1) deletions with known node pointer!`,
    })
  }

  return steps
}

// 8. CIRCULAR LINKED LIST
export function generateCircularLinkedListSteps() {
  const pyCode = `def circular_linked_list_traverse(head):
    curr = head
    while True:
        process(curr.val)
        curr = curr.next
        if curr == head:
            break  # Completed full circular loop`

  const jsCode = `function circularLinkedListTraverse(head) {
  let curr = head;
  while (true) {
    process(curr.val);
    curr = curr.next;
    if (curr === head) break;
  }
}`

  const codeSnippet = { python: pyCode, javascript: jsCode }
  const nodes = [
    { id: 0, val: 10, nextId: 1 },
    { id: 1, val: 20, nextId: 2 },
    { id: 2, val: 30, nextId: 3 },
    { id: 3, val: 40, nextId: 0 },
  ]
  const steps = []

  nodes.forEach((node, idx) => {
    steps.push({
      lineNumber: 4,
      lineCode: 'process(curr.val); curr = curr.next',
      codeSnippet,
      variables: { currentNode: `Node(${node.val})`, nextNode: `Node(${nodes[(idx + 1) % 4].val})` },
      sceneState: {
        type: 'linked_list',
        nodes,
        pointers: [{ name: 'curr', nodeId: idx, color: '#06b6d4' }],
        isCircular: true,
      },
      callStack: ['circular_linked_list_traverse(head)'],
      explanation: `Traversing node ${node.val}. Notice the tail node (40) points directly back to head (10), forming a closed circular ring.`,
    })
  })

  steps.push({
    lineNumber: 6,
    lineCode: 'if curr == head: break  # Reached start again',
    codeSnippet,
    variables: { curr: 'Node(10)', head: 'Node(10)', loopStatus: 'CYCLE_COMPLETED' },
    sceneState: {
      type: 'linked_list',
      nodes,
      pointers: [{ name: 'HEAD_AGAIN', nodeId: 0, color: '#22c55e' }],
      isCircular: true,
    },
    callStack: ['circular_linked_list_traverse(head)'],
    explanation: 'curr == head! Traversal successfully completed exactly one full cycle through the ring buffer.',
  })

  return steps
}

// 9. SENTINEL DUMMY NODE PATTERN
export function generateSentinelDummySteps() {
  const pyCode = `def delete_head_with_dummy(head):
    dummy = ListNode(0, head)  # Sentinel Node
    # Safely delete first real node (10)
    dummy.next = dummy.next.next
    return dummy.next`

  const jsCode = `function deleteHeadWithDummy(head) {
  const dummy = { val: 0, next: head };
  dummy.next = dummy.next.next;
  return dummy.next;
}`

  const codeSnippet = { python: pyCode, javascript: jsCode }
  const nodes = [
    { id: 0, val: 'DUMMY(0)', nextId: 1 },
    { id: 1, val: 10, nextId: 2 },
    { id: 2, val: 20, nextId: 3 },
    { id: 3, val: 30, nextId: null },
  ]
  const steps = []

  steps.push({
    lineNumber: 2,
    lineCode: 'dummy = ListNode(0, head)  # Sentinel Node preceding head',
    codeSnippet,
    variables: { dummy: 'Node(0)', 'dummy.next': 'Node(10)' },
    sceneState: {
      type: 'linked_list',
      nodes,
      pointers: [{ name: 'dummy', nodeId: 0, color: '#ec4899' }, { name: 'head', nodeId: 1, color: '#3b82f6' }],
    },
    callStack: ['delete_head_with_dummy(head)'],
    explanation: 'Created Dummy Sentinel node pointing to real head (10). Dummy nodes eliminate edge cases for empty lists and head deletions.',
  })

  steps.push({
    lineNumber: 4,
    lineCode: 'dummy.next = dummy.next.next  # Bypass node 10',
    codeSnippet,
    variables: { dummy: 'Node(0)', 'new.head': 'Node(20)', bypassed: 'Node(10)' },
    sceneState: {
      type: 'linked_list',
      nodes: [
        { id: 0, val: 'DUMMY(0)', nextId: 2 },
        { id: 1, val: 10, nextId: null },
        { id: 2, val: 20, nextId: 3 },
        { id: 3, val: 30, nextId: null },
      ],
      pointers: [{ name: 'dummy', nodeId: 0, color: '#ec4899' }, { name: 'newHead', nodeId: 2, color: '#22c55e' }],
    },
    callStack: ['delete_head_with_dummy(head)'],
    explanation: 'Bypassed node 10 by pointing dummy.next directly to Node(20). Node 10 is unlinked without needing an if (head == null) check!',
  })

  return steps
}

// 10. FLOYD CYCLE DETECTION (TORTOISE AND HARE)
export function generateFloydCycleSteps() {
  const pyCode = `def has_cycle(head):
    slow = head
    fast = head
    while fast and fast.next:
        slow = slow.next          # 1 step
        fast = fast.next.next     # 2 steps
        if slow == fast:
            return True           # Cycle detected!
    return False`

  const jsCode = `function hasCycle(head) {
  let slow = head, fast = head;
  while (fast && fast.next) {
    slow = slow.next;
    fast = fast.next.next;
    if (slow === fast) return true;
  }
  return false;
}`

  const codeSnippet = { python: pyCode, javascript: jsCode }
  const nodes = [
    { id: 0, val: 1, nextId: 1 },
    { id: 1, val: 2, nextId: 2 },
    { id: 2, val: 3, nextId: 3 },
    { id: 3, val: 4, nextId: 1 },
  ]
  const steps = []

  const pairs = [
    { slow: 0, fast: 0, exp: 'Both slow and fast pointers begin at head Node(1).' },
    { slow: 1, fast: 2, exp: 'Slow moves 1 step to Node(2). Fast moves 2 steps to Node(3).' },
    { slow: 2, fast: 1, exp: 'Slow moves 1 step to Node(3). Fast jumps around cycle back to Node(2).' },
    { slow: 3, fast: 3, exp: 'COLLISION! Slow and Fast meet at Node(4). Cycle mathematically confirmed in O(N) time and O(1) space!' },
  ]

  pairs.forEach(({ slow, fast, exp }, idx) => {
    const isMeet = slow === fast && idx > 0
    steps.push({
      lineNumber: isMeet ? 8 : 5,
      lineCode: isMeet ? 'return True  # Cycle detected!' : 'slow = slow.next; fast = fast.next.next',
      codeSnippet,
      variables: { slow: `Node(${nodes[slow].val})`, fast: `Node(${nodes[fast].val})`, collided: isMeet },
      sceneState: {
        type: 'linked_list',
        nodes,
        pointers: isMeet
          ? [{ name: 'COLLISION!', nodeId: slow, color: '#22c55e' }]
          : [
              { name: 'SLOW (1x)', nodeId: slow, color: '#3b82f6' },
              { name: 'FAST (2x)', nodeId: fast, color: '#ec4899' },
            ],
        isCircular: true,
      },
      callStack: ['has_cycle(head)'],
      explanation: exp,
    })
  })

  return steps
}

// 11. STACK ADT (LIFO PRINCIPLE)
export function generateStackAdtSteps() {
  const pyCode = `def stack_operations():
    stack = []
    stack.append(15)   # Push 15
    stack.append(28)   # Push 28
    stack.append(42)   # Push 42
    top_val = stack[-1]# Peek (42)
    popped = stack.pop()# Pop (42)
    return stack`

  const jsCode = `function stackOperations() {
  const stack = [];
  stack.push(15);
  stack.push(28);
  stack.push(42);
  const topVal = stack[stack.length - 1];
  const popped = stack.pop();
  return stack;
}`

  const codeSnippet = { python: pyCode, javascript: jsCode }
  const steps = []

  steps.push({
    lineNumber: 3,
    lineCode: 'stack.append(15)  # Push 15',
    codeSnippet,
    variables: { operation: 'PUSH', item: 15, stackSize: 1 },
    sceneState: { type: 'stack', stack: [{ val: 15 }], array: [15, 28, 42], highlightIndex: 0 },
    callStack: ['stack_operations()'],
    explanation: 'Pushed 15 onto the stack. Disc drops to the bottom of the LIFO hopper.',
  })

  steps.push({
    lineNumber: 4,
    lineCode: 'stack.append(28)  # Push 28',
    codeSnippet,
    variables: { operation: 'PUSH', item: 28, stackSize: 2 },
    sceneState: { type: 'stack', stack: [{ val: 15 }, { val: 28 }], array: [15, 28, 42], highlightIndex: 1 },
    callStack: ['stack_operations()'],
    explanation: 'Pushed 28 onto the stack. Sits directly on top of 15.',
  })

  steps.push({
    lineNumber: 5,
    lineCode: 'stack.append(42)  # Push 42',
    codeSnippet,
    variables: { operation: 'PUSH', item: 42, stackSize: 3 },
    sceneState: { type: 'stack', stack: [{ val: 15 }, { val: 28 }, { val: 42 }], array: [15, 28, 42], highlightIndex: 2 },
    callStack: ['stack_operations()'],
    explanation: 'Pushed 42 onto the stack. 42 is now the TOP element.',
  })

  steps.push({
    lineNumber: 6,
    lineCode: 'top_val = stack[-1]  # Peek at top element (42)',
    codeSnippet,
    variables: { operation: 'PEEK', topVal: 42, stackSize: 3 },
    sceneState: { type: 'stack', stack: [{ val: 15 }, { val: 28 }, { val: 42 }], array: [15, 28, 42], highlightIndex: 2 },
    callStack: ['stack_operations()'],
    explanation: 'Peek operation retrieves 42 in O(1) time without removing it.',
  })

  steps.push({
    lineNumber: 7,
    lineCode: 'popped = stack.pop()  # Pop removes 42',
    codeSnippet,
    variables: { operation: 'POP', poppedItem: 42, stackSize: 2, newTop: 28 },
    sceneState: { type: 'stack', stack: [{ val: 15 }, { val: 28 }], array: [15, 28], highlightIndex: 1 },
    callStack: ['stack_operations()'],
    explanation: 'Popped 42 from stack in O(1) time. 28 becomes the new TOP element.',
  })

  return steps
}

// 12. MIN STACK (O(1) GETMIN)
export function generateMinStackSteps() {
  const pyCode = `class MinStack:
    def __init__(self):
        self.stack = []
        self.min_stack = []

    def push(self, val):
        self.stack.append(val)
        min_val = min(val, self.min_stack[-1] if self.min_stack else val)
        self.min_stack.append(min_val)`

  const jsCode = `class MinStack {
  constructor() {
    this.stack = [];
    this.minStack = [];
  }
  push(val) {
    this.stack.push(val);
    const minVal = Math.min(val, this.minStack.length ? this.minStack[this.minStack.length - 1] : val);
    this.minStack.push(minVal);
  }
}`

  const codeSnippet = { python: pyCode, javascript: jsCode }
  const steps = []

  steps.push({
    lineNumber: 7,
    lineCode: 'min_stack.push(30) # val=30, current min=30',
    codeSnippet,
    variables: { val: 30, currentMin: 30 },
    sceneState: { type: 'stack', stack: [{ val: 30 }], array: [30, 50, 12], highlightIndex: 0 },
    callStack: ['MinStack.push(30)'],
    explanation: 'Pushed 30. First element, so minimum is 30.',
  })

  steps.push({
    lineNumber: 8,
    lineCode: 'min_stack.push(50) # val=50, current min=30',
    codeSnippet,
    variables: { val: 50, currentMin: 30 },
    sceneState: { type: 'stack', stack: [{ val: 30 }, { val: 50 }], array: [30, 50, 12], highlightIndex: 1 },
    callStack: ['MinStack.push(50)'],
    explanation: 'Pushed 50. 50 > 30, so auxiliary min stack retains 30 as minimum in O(1).',
  })

  steps.push({
    lineNumber: 8,
    lineCode: 'min_stack.push(12) # val=12, current min=12',
    codeSnippet,
    variables: { val: 12, currentMin: 12 },
    sceneState: { type: 'stack', stack: [{ val: 30 }, { val: 50 }, { val: 12 }], array: [30, 50, 12], highlightIndex: 2 },
    callStack: ['MinStack.push(12)'],
    explanation: 'Pushed 12. 12 < 30, so auxiliary min stack records 12. getMin() is always O(1)!',
  })

  return steps
}

// 13. CIRCULAR QUEUE
export function generateCircularQueueSteps() {
  const pyCode = `def circular_queue_ops():
    # Ring buffer with modulo arithmetic
    front = 0
    rear = 0
    # Enqueue elements
    rear = (rear + 1) % capacity
    # Dequeue from front
    front = (front + 1) % capacity`

  const jsCode = `function circularQueueOps() {
  let front = 0, rear = 0;
  rear = (rear + 1) % capacity;
  front = (front + 1) % capacity;
}`

  const codeSnippet = { python: pyCode, javascript: jsCode }
  const steps = []

  steps.push({
    lineNumber: 6,
    lineCode: 'rear = (rear + 1) % capacity  # Enqueue 10, 20, 30',
    codeSnippet,
    variables: { front: 0, rear: 3, capacity: 5, items: [10, 20, 30] },
    sceneState: { type: 'queue', queue: [10, 20, 30] },
    callStack: ['circular_queue_ops()'],
    explanation: 'Enqueued [10, 20, 30] into circular pipe. FRONT is at 10, REAR is at 30.',
  })

  steps.push({
    lineNumber: 8,
    lineCode: 'front = (front + 1) % capacity  # Dequeue 10',
    codeSnippet,
    variables: { front: 1, rear: 3, dequeuedVal: 10, remaining: [20, 30] },
    sceneState: { type: 'queue', queue: [20, 30] },
    callStack: ['circular_queue_ops()'],
    explanation: 'Dequeued 10 from FRONT. Pointer increments via (front + 1) % capacity without shifting elements!',
  })

  steps.push({
    lineNumber: 6,
    lineCode: 'rear = (rear + 1) % capacity  # Enqueue 40 at rear',
    codeSnippet,
    variables: { front: 1, rear: 4, enqueuedVal: 40, queue: [20, 30, 40] },
    sceneState: { type: 'queue', queue: [20, 30, 40] },
    callStack: ['circular_queue_ops()'],
    explanation: 'Enqueued 40 into rear of ring buffer. Both Enqueue and Dequeue operate in pure O(1) time.',
  })

  return steps
}

// 14. DEQUE (DOUBLE-ENDED QUEUE)
export function generateDequeSteps() {
  const pyCode = `from collections import deque
d = deque([20, 30])
d.appendleft(10)  # Push Front -> [10, 20, 30]
d.append(40)      # Push Back  -> [10, 20, 30, 40]
d.popleft()       # Pop Front  -> [20, 30, 40]
d.pop()           # Pop Back   -> [20, 30]`

  const jsCode = `// Double-Ended Queue
const deque = [20, 30];
deque.unshift(10); // Push Front
deque.push(40);    // Push Back
deque.shift();     // Pop Front
deque.pop();       // Pop Back`

  const codeSnippet = { python: pyCode, javascript: jsCode }
  const steps = []

  steps.push({
    lineNumber: 3,
    lineCode: 'd.appendleft(10)  # Push Front',
    codeSnippet,
    variables: { operation: 'PUSH_FRONT', item: 10, deque: [10, 20, 30] },
    sceneState: { type: 'queue', queue: [10, 20, 30] },
    callStack: ['deque.appendleft(10)'],
    explanation: 'Push Front: Added 10 to the FRONT conduit of the deque in O(1) time.',
  })

  steps.push({
    lineNumber: 4,
    lineCode: 'd.append(40)  # Push Back',
    codeSnippet,
    variables: { operation: 'PUSH_BACK', item: 40, deque: [10, 20, 30, 40] },
    sceneState: { type: 'queue', queue: [10, 20, 30, 40] },
    callStack: ['deque.append(40)'],
    explanation: 'Push Back: Added 40 to the REAR conduit of the deque in O(1) time.',
  })

  steps.push({
    lineNumber: 5,
    lineCode: 'd.popleft()  # Pop Front (removes 10)',
    codeSnippet,
    variables: { operation: 'POP_FRONT', popped: 10, deque: [20, 30, 40] },
    sceneState: { type: 'queue', queue: [20, 30, 40] },
    callStack: ['deque.popleft()'],
    explanation: 'Pop Front: Removed 10 from FRONT in O(1) time.',
  })

  steps.push({
    lineNumber: 6,
    lineCode: 'd.pop()  # Pop Back (removes 40)',
    codeSnippet,
    variables: { operation: 'POP_BACK', popped: 40, deque: [20, 30] },
    sceneState: { type: 'queue', queue: [20, 30] },
    callStack: ['deque.pop()'],
    explanation: 'Pop Back: Removed 40 from REAR in O(1) time. Deque supports O(1) on both ends!',
  })

  return steps
}

// 15. FUNDAMENTALS: CONTIGUOUS VS LINKED MEMORY
export function generateFundamentalsSteps() {
  const pyCode = `def memory_layout_comparison():
    # Contiguous Array: O(1) indexed, spatial CPU cache hits
    array = [10, 20, 30, 40]
    val = array[2] # 0x1000 + 2 * 4 = 0x1008
    # Linked Nodes: Non-contiguous heap pointers
    # Requires pointer dereference, potential cache miss`

  const jsCode = `function memoryLayoutComparison() {
  const array = [10, 20, 30, 40];
  const val = array[2];
}`

  const codeSnippet = { python: pyCode, javascript: jsCode }
  const steps = []

  steps.push({
    lineNumber: 3,
    lineCode: 'array = [10, 20, 30, 40]  # Contiguous block',
    codeSnippet,
    variables: { baseAddress: '0x1000', elementSize: '4 bytes', cacheStatus: 'L1_CACHE_HIT' },
    sceneState: {
      type: 'array_1d',
      array: [10, 20, 30, 40],
      pointers: [{ name: 'L1_HIT', index: 0, color: '#22c55e' }],
      highlightIndices: [0, 1, 2, 3],
      activeRange: [0, 3],
    },
    callStack: ['memory_layout_comparison()'],
    explanation: 'Contiguous Array: Stored sequentially in memory. When element 0 is fetched, hardware prefetcher loads neighboring elements into 64-byte L1 CPU cache lines!',
  })

  steps.push({
    lineNumber: 4,
    lineCode: 'val = array[2]  # Direct calculation: 0x1000 + 2 * 4',
    codeSnippet,
    variables: { index: 2, val: 30, targetAddress: '0x1008' },
    sceneState: {
      type: 'array_1d',
      array: [10, 20, 30, 40],
      pointers: [{ name: 'val', index: 2, color: '#38bdf8' }],
      highlightIndices: [2],
    },
    callStack: ['memory_layout_comparison()'],
    explanation: 'Direct O(1) Memory Address: base + (index * 4) = 0x1008. Instantaneous access with maximum CPU cache locality.',
  })

  return steps
}

// 16. STRINGS: CHARACTER BUFFER
export function generateStringOpsSteps() {
  const pyCode = `def string_builder_buffer():
    chars = ['a', 'b', 'c', 'd', 'e']
    # Joining character array in O(N) instead of O(N^2) loop +=
    result = "".join(chars)
    return result`

  const jsCode = `function stringBuffer() {
  const chars = ['a', 'b', 'c', 'd', 'e'];
  return chars.join('');
}`

  const codeSnippet = { python: pyCode, javascript: jsCode }
  const chars = [97, 98, 99, 100, 101]
  const steps = []

  steps.push({
    lineNumber: 2,
    lineCode: "chars = ['a', 'b', 'c', 'd', 'e']  # Character buffer",
    codeSnippet,
    variables: { bufferLength: 5, string: 'abcde' },
    sceneState: {
      type: 'array_1d',
      array: chars,
      pointers: [{ name: 'HEAD', index: 0, color: '#3b82f6' }, { name: 'TAIL', index: 4, color: '#ec4899' }],
      highlightIndices: [0, 1, 2, 3, 4],
    },
    callStack: ['string_builder_buffer()'],
    explanation: "Character Buffer in Memory: Characters 'a'..'e' stored contiguously. Mutable string builders prevent allocating new immutable string objects on each append.",
  })

  return steps
}

// 17. DFS GRAPH TRAVERSAL
export function generateDfsGraphSteps() {
  const nodes = [
    { id: 1, val: 'A', x: -4, y: 2, z: 0 },
    { id: 2, val: 'B', x: -1, y: 4, z: 0 },
    { id: 3, val: 'C', x: 2, y: 4, z: 0 },
    { id: 4, val: 'D', x: -1, y: 0, z: 0 },
    { id: 5, val: 'E', x: 2, y: 0, z: 0 },
    { id: 6, val: 'F', x: 5, y: 2, z: 0 },
  ]
  const edges = [[1, 2], [1, 4], [2, 3], [4, 5], [3, 6], [5, 6]]

  const pyCode = `def dfs(graph, node, visited):
    visited.add(node)
    for neighbor in graph[node]:
        if neighbor not in visited:
            dfs(graph, neighbor, visited)`

  const jsCode = `function dfs(graph, node, visited) {
  visited.add(node);
  for (const neighbor of graph[node]) {
    if (!visited.has(neighbor)) dfs(graph, neighbor, visited);
  }
}`

  const codeSnippet = { python: pyCode, javascript: jsCode }
  const steps = []
  const dfsOrder = [1, 2, 3, 6, 5, 4]
  const visited = []

  dfsOrder.forEach((nodeId) => {
    visited.push(nodeId)
    const nodeObj = nodes.find((n) => n.id === nodeId)
    steps.push({
      lineNumber: 2,
      lineCode: `visited.add(${nodeObj.val})  # Recursive DFS descent`,
      codeSnippet,
      variables: { currentNode: nodeObj.val, callStackDepth: visited.length, visited: visited.map((id) => nodes.find((n) => n.id === id).val) },
      sceneState: {
        type: 'graph_spatial',
        nodes,
        edges,
        activeNodeId: nodeId,
        visitedNodeIds: [...visited],
      },
      callStack: visited.map((id) => `dfs(${nodes.find((n) => n.id === id).val})`),
      explanation: `DFS recursively exploring Node ${nodeObj.val}. Follows deepest path first before backtracking.`,
    })
  })

  return steps
}

// 18. HASH STRUCTURES: TWO SUM HASH MAP
export function generateHashSteps() {
  const pyCode = `def two_sum_hash_map(nums, target):
    seen = {}
    for i, num in enumerate(nums):
        diff = target - num
        if diff in seen:
            return [seen[diff], i]
        seen[num] = i`

  const jsCode = `function twoSumHashMap(nums, target) {
  const seen = new Map();
  for (let i = 0; i < nums.length; i++) {
    const diff = target - nums[i];
    if (seen.has(diff)) return [seen.get(diff), i];
    seen.set(nums[i], i);
  }
}`

  const codeSnippet = { python: pyCode, javascript: jsCode }
  const nums = [2, 7, 11, 15]
  const steps = []

  steps.push({
    lineNumber: 2,
    lineCode: 'seen = {}  # Direct O(1) hash bucket lookup',
    codeSnippet,
    variables: { target: 9, seen: '{}', currentIdx: 0 },
    sceneState: {
      type: 'array_1d',
      array: nums,
      pointers: [{ name: 'i=0', index: 0, color: '#3b82f6' }],
      highlightIndices: [0],
    },
    callStack: ['two_sum_hash_map(nums, 9)'],
    explanation: 'Initialize hash table. Hash tables calculate bucket = hash(key) % capacity in O(1) time.',
  })

  steps.push({
    lineNumber: 4,
    lineCode: 'diff = target - num  # 9 - 2 = 7',
    codeSnippet,
    variables: { num: 2, diff: 7, inMap: false },
    sceneState: {
      type: 'array_1d',
      array: nums,
      pointers: [{ name: 'val=2', index: 0, color: '#3b82f6' }],
      highlightIndices: [0],
    },
    callStack: ['two_sum_hash_map(nums, 9)'],
    explanation: 'Evaluated complement diff = 9 - 2 = 7. 7 is not in hash map yet. Recorded seen[2] = 0 in O(1).',
  })

  steps.push({
    lineNumber: 5,
    lineCode: 'if diff in seen: return [seen[diff], i]  # Found at index 1!',
    codeSnippet,
    variables: { num: 7, diff: 2, inMap: true, result: [0, 1] },
    sceneState: {
      type: 'array_1d',
      array: nums,
      pointers: [
        { name: 'val=2', index: 0, color: '#22c55e' },
        { name: 'val=7', index: 1, color: '#22c55e' },
      ],
      highlightIndices: [0, 1],
      activeRange: [0, 1],
    },
    callStack: ['two_sum_hash_map(nums, 9)'],
    explanation: 'Match found! Complement 2 exists in hash map at index 0. Returned indices [0, 1] in O(N) overall time.',
  })

  return steps
}
