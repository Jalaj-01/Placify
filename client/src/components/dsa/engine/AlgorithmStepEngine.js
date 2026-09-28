// Algorithm Step Engine
// Generates deterministic execution traces with synchronized code lines,
// variable states, 3D visualizer instructions, and plain-English narratives.

import {
  generateDynamicArrayDoublingSteps,
  generate2DMatrixSteps,
  generateCircularArraySteps,
  generateStaticArraySteps,
  generateArrayShiftSteps,
  generateSparseArraySteps,
  generateDoublyLinkedListSteps,
  generateCircularLinkedListSteps,
  generateSentinelDummySteps,
  generateFloydCycleSteps,
  generateStackAdtSteps,
  generateMinStackSteps,
  generateCircularQueueSteps,
  generateDequeSteps,
  generateFundamentalsSteps,
  generateStringOpsSteps,
  generateDfsGraphSteps,
  generateHashSteps,
} from './SubtopicStepGenerators'

export function generateAlgorithmSteps(topicId, customInput = null, subtopic = null) {
  const idStr = String(topicId || '').toLowerCase()
  const subStr = String(subtopic || '').toLowerCase()

  // 1. FUNDAMENTALS
  if (idStr.includes('fundamentals') || idStr === '1-fundamentals') {
    return generateFundamentalsSteps(customInput, subStr)
  }

  // 2. ARRAYS
  if (idStr.includes('array') || idStr === '2-arrays') {
    if (subStr.includes('2d') || subStr.includes('matrix') || subStr.includes('multi') || subStr.includes('jagged')) {
      return generate2DMatrixSteps()
    }
    if (subStr.includes('dynamic') || subStr.includes('resizable') || subStr.includes('doubling') || subStr.includes('capacity')) {
      return generateDynamicArrayDoublingSteps()
    }
    if (subStr.includes('circular')) {
      return generateCircularArraySteps()
    }
    if (subStr.includes('sparse')) {
      return generateSparseArraySteps()
    }
    if (subStr.includes('insert') || subStr.includes('delete') || subStr.includes('shift')) {
      return generateArrayShiftSteps()
    }
    if (subStr.includes('static') || subStr.includes('view') || subStr.includes('slice') || subStr.includes('1d')) {
      return generateStaticArraySteps()
    }
    // Default or maximum subarray / Kadane
    return generateKadaneSteps(customInput)
  }

  // 3. STRINGS
  if (idStr.includes('string') || idStr === '3-strings') {
    return generateStringOpsSteps()
  }

  // 4. LINKED LISTS
  if (idStr.includes('linked-list') || idStr === '4-linked-lists' || idStr === '5-linked-lists') {
    if (subStr.includes('doubly')) {
      return generateDoublyLinkedListSteps()
    }
    if (subStr.includes('circular')) {
      return generateCircularLinkedListSteps()
    }
    if (subStr.includes('sentinel') || subStr.includes('dummy')) {
      return generateSentinelDummySteps()
    }
    if (subStr.includes('cycle') || subStr.includes('floyd') || subStr.includes('tortoise')) {
      return generateFloydCycleSteps()
    }
    return generateLinkedListReversalSteps(customInput)
  }

  // 5. STACK
  if (idStr.includes('stack') || idStr === '5-stack' || idStr === '6-stack') {
    if (subStr.includes('min') || subStr.includes('max')) {
      return generateMinStackSteps()
    }
    if (subStr.includes('monotonic') || subStr.includes('greater') || subStr.includes('smaller')) {
      return generateMonotonicStackSteps(customInput)
    }
    return generateStackAdtSteps()
  }

  // 6. QUEUE & DEQUE
  if (idStr.includes('queue') || idStr === '6-queue-deque' || idStr === '7-queue-deque') {
    if (subStr.includes('circular')) {
      return generateCircularQueueSteps()
    }
    if (subStr.includes('deque') || subStr.includes('double')) {
      return generateDequeSteps()
    }
    return generateQueueSteps(customInput)
  }

  // 7. HEAPS
  if (idStr.includes('heap') || idStr === '7-heaps' || idStr === '16-heap') {
    return generateHeapSteps(customInput)
  }

  // 8. HASH STRUCTURES
  if (idStr.includes('hash') || idStr === '8-hash-structures') {
    return generateHashSteps()
  }

  // 9. TREES BASICS
  if (idStr.includes('tree-basics') || idStr === '9-trees-basics' || idStr === '12-trees') {
    if (subStr.includes('preorder')) return generateTreeTraversalSteps('preorder')
    if (subStr.includes('postorder')) return generateTreeTraversalSteps('postorder')
    if (subStr.includes('level') || subStr.includes('bfs')) return generateTreeTraversalSteps('levelorder')
    return generateTreeTraversalSteps('inorder')
  }

  // 10. BST & 11. AVL TREE
  if (idStr.includes('bst') || idStr === '10-bst' || idStr === '13-bst' || idStr.includes('avl') || idStr === '11-avl-tree' || idStr.includes('red-black')) {
    return generateBstSteps(customInput)
  }

  // 14. GRAPHS
  if (idStr.includes('graph') || idStr === '14-graphs' || idStr.includes('18-graph')) {
    if (subStr.includes('dfs') || subStr.includes('depth')) {
      return generateDfsGraphSteps()
    }
    return generateBfsGraphSteps(customInput)
  }

  // DYNAMIC PROGRAMMING / 2D GRID
  if (idStr.includes('dynamic-programming') || idStr.includes('dp') || idStr === '32-dynamic-programming') {
    return generateKnapsackSteps(customInput)
  }

  // SEARCHING & SORTING
  if (idStr.includes('search') || idStr === '8-searching') {
    return generateBinarySearchSteps(customInput)
  }
  if (idStr.includes('sort') || idStr === '9-sorting') {
    return generateQuickSortSteps(customInput)
  }

  // Fallback default
  return generateBinarySearchSteps(customInput)
}

// 1. Binary Search Stepper
function generateBinarySearchSteps(input) {
  const arr = input?.array || [2, 5, 8, 12, 16, 23, 38, 56, 72, 91]
  const target = input?.target !== undefined ? Number(input.target) : 23
  const steps = []

  // Initial step
  steps.push({
    lineNumber: 2,
    lineCode: 'low = 0; high = len(nums) - 1',
    variables: { low: 0, high: arr.length - 1, mid: null, target },
    sceneState: {
      type: 'array_1d',
      array: [...arr],
      pointers: [{ name: 'low', index: 0, color: '#3b82f6' }, { name: 'high', index: arr.length - 1, color: '#ec4899' }],
      activeRange: [0, arr.length - 1],
      highlightIndices: [],
      targetVal: target,
    },
    callStack: ['binary_search(nums, target)'],
    explanation: `Initialize low pointer at index 0 and high pointer at index ${arr.length - 1}. Target value is ${target}.`,
  })

  let low = 0
  let high = arr.length - 1
  let foundIndex = -1

  while (low <= high) {
    const mid = Math.floor(low + (high - low) / 2)
    const midVal = arr[mid]

    // Step: calculate mid
    steps.push({
      lineNumber: 4,
      lineCode: 'mid = low + (high - low) // 2',
      variables: { low, high, mid, 'nums[mid]': midVal, target },
      sceneState: {
        type: 'array_1d',
        array: [...arr],
        pointers: [
          { name: 'low', index: low, color: '#3b82f6' },
          { name: 'mid', index: mid, color: '#10b981' },
          { name: 'high', index: high, color: '#ec4899' },
        ],
        activeRange: [low, high],
        highlightIndices: [mid],
        targetVal: target,
      },
      callStack: ['binary_search(nums, target)'],
      explanation: `Calculated midpoint: index ${mid} (value = ${midVal}). Evaluating predicate nums[mid] == target.`,
    })

    if (midVal === target) {
      foundIndex = mid
      steps.push({
        lineNumber: 6,
        lineCode: 'return mid  # Target Found!',
        variables: { low, high, mid, 'nums[mid]': midVal, status: 'FOUND' },
        sceneState: {
          type: 'array_1d',
          array: [...arr],
          pointers: [{ name: 'TARGET', index: mid, color: '#22c55e' }],
          activeRange: [mid, mid],
          highlightIndices: [mid],
          found: true,
          targetVal: target,
        },
        callStack: ['binary_search(nums, target)'],
        explanation: `Target ${target} located precisely at index ${mid}! Algorithm terminates with success.`,
      })
      break
    } else if (midVal < target) {
      steps.push({
        lineNumber: 8,
        lineCode: 'low = mid + 1  # Target is larger',
        variables: { low: mid + 1, high, mid, target },
        sceneState: {
          type: 'array_1d',
          array: [...arr],
          pointers: [
            { name: 'low', index: mid + 1, color: '#3b82f6' },
            { name: 'high', index: high, color: '#ec4899' },
          ],
          activeRange: [mid + 1, high],
          highlightIndices: [mid],
          targetVal: target,
        },
        callStack: ['binary_search(nums, target)'],
        explanation: `${midVal} < ${target}. Since array is sorted, target must be in right half. Narrowing low to index ${mid + 1}.`,
      })
      low = mid + 1
    } else {
      steps.push({
        lineNumber: 10,
        lineCode: 'high = mid - 1  # Target is smaller',
        variables: { low, high: mid - 1, mid, target },
        sceneState: {
          type: 'array_1d',
          array: [...arr],
          pointers: [
            { name: 'low', index: low, color: '#3b82f6' },
            { name: 'high', index: Math.max(0, mid - 1), color: '#ec4899' },
          ],
          activeRange: [low, Math.max(0, mid - 1)],
          highlightIndices: [mid],
          targetVal: target,
        },
        callStack: ['binary_search(nums, target)'],
        explanation: `${midVal} > ${target}. Target must lie in left half. Adjusting high pointer to index ${mid - 1}.`,
      })
      high = mid - 1
    }
  }

  if (foundIndex === -1) {
    steps.push({
      lineNumber: 11,
      lineCode: 'return -1  # Not found',
      variables: { low, high, target, status: 'NOT_FOUND' },
      sceneState: {
        type: 'array_1d',
        array: [...arr],
        pointers: [],
        activeRange: [],
        highlightIndices: [],
        targetVal: target,
      },
      callStack: ['binary_search(nums, target)'],
      explanation: `Search space exhausted (low > high). Target ${target} does not exist in array.`,
    })
  }

  return steps
}

// 2. Kadane's Algorithm Stepper
function generateKadaneSteps(input) {
  const arr = input?.array || [-2, 1, -3, 4, -1, 2, 1, -5, 4]
  const steps = []

  const kadanePyCode = `def max_sub_array_kadane(nums):
    current_sum = nums[0]
    max_sum = nums[0]
    for right in range(1, len(nums)):
        val = nums[right]
        if val > current_sum + val:
            current_sum = val  # Reset subarray
        else:
            current_sum += val # Extend subarray
        if current_sum > max_sum:
            max_sum = current_sum
    return max_sum`

  const kadaneJsCode = `function maxSubArrayKadane(nums) {
  let currentSum = nums[0];
  let maxSum = nums[0];
  for (let right = 1; right < nums.length; right++) {
    const val = nums[right];
    if (val > currentSum + val) {
      currentSum = val;
    } else {
      currentSum += val;
    }
    if (currentSum > maxSum) {
      maxSum = currentSum;
    }
  }
  return maxSum;
}`
  const kadaneCodeSnippet = { python: kadanePyCode, javascript: kadaneJsCode }

  let currentSum = arr[0]
  let maxSum = arr[0]
  let left = 0
  let bestRange = [0, 0]

  steps.push({
    lineNumber: 2,
    lineCode: 'current_sum = nums[0]; max_sum = nums[0]',
    codeSnippet: kadaneCodeSnippet,
    variables: { currentSum, maxSum, left: 0, right: 0 },
    sceneState: {
      type: 'array_1d',
      array: [...arr],
      pointers: [{ name: 'L', index: 0, color: '#3b82f6' }, { name: 'R', index: 0, color: '#10b981' }],
      activeRange: [0, 0],
      highlightIndices: [0],
    },
    callStack: ['max_sub_array_kadane(nums)'],
    explanation: `Initialize Kadane scan. Current sum and maximum sum start with first element (${arr[0]}).`,
  })

  for (let right = 1; right < arr.length; right++) {
    const val = arr[right]
    const reset = val > currentSum + val

    if (reset) {
      currentSum = val
      left = right
    } else {
      currentSum += val
    }

    const updatedMax = currentSum > maxSum
    if (updatedMax) {
      maxSum = currentSum
      bestRange = [left, right]
    }

    steps.push({
      lineNumber: reset ? 7 : 9,
      lineCode: reset ? 'current_sum = nums[right] # Reset subarray' : 'current_sum += nums[right] # Extend subarray',
      codeSnippet: kadaneCodeSnippet,
      variables: {
        right,
        'nums[right]': val,
        currentSum,
        maxSum,
        action: reset ? 'RESET' : 'EXTEND',
      },
      sceneState: {
        type: 'array_1d',
        array: [...arr],
        pointers: [
          { name: 'L', index: left, color: '#3b82f6' },
          { name: 'R', index: right, color: '#10b981' },
        ],
        activeRange: [left, right],
        bestRange: [...bestRange],
        highlightIndices: [right],
      },
      callStack: ['max_sub_array_kadane(nums)'],
      explanation: reset
        ? `Previous sum was negative (${currentSum - val}). Better to restart fresh subarray from index ${right} (${val}).`
        : `Added ${val} to ongoing subarray. Current sum is now ${currentSum}. ${updatedMax ? `New overall peak maximum ${maxSum} achieved!` : ''}`,
    })
  }

  steps.push({
    lineNumber: 12,
    lineCode: 'return max_sum',
    codeSnippet: kadaneCodeSnippet,
    variables: { maxSum, bestLeft: bestRange[0], bestRight: bestRange[1] },
    sceneState: {
      type: 'array_1d',
      array: [...arr],
      pointers: [
        { name: 'BEST_START', index: bestRange[0], color: '#22c55e' },
        { name: 'BEST_END', index: bestRange[1], color: '#22c55e' },
      ],
      activeRange: bestRange,
      bestRange: bestRange,
      highlightIndices: [],
      found: true,
    },
    callStack: ['max_sub_array_kadane(nums)'],
    explanation: `Kadane scan complete! Maximum contiguous subarray found in range [${bestRange[0]}..${bestRange[1]}] with optimal sum = ${maxSum}.`,
  })

  return steps
}

// 3. QuickSort Stepper
function generateQuickSortSteps(input) {
  const arr = input?.array ? [...input.array] : [29, 10, 14, 37, 13, 89, 52, 2, 45, 18]
  const steps = []

  steps.push({
    lineNumber: 1,
    lineCode: 'def quicksort(arr, low, high):',
    variables: { size: arr.length, low: 0, high: arr.length - 1 },
    sceneState: {
      type: 'array_1d',
      array: [...arr],
      pointers: [],
      activeRange: [0, arr.length - 1],
      highlightIndices: [],
    },
    callStack: ['quicksort(arr, 0, 9)'],
    explanation: `Beginning QuickSort on array of size ${arr.length}. Pivot strategy: Lomuto partition using last element.`,
  })

  function partition(low, high) {
    const pivot = arr[high]
    let i = low - 1

    steps.push({
      lineNumber: 8,
      lineCode: 'pivot = arr[high]',
      variables: { low, high, pivot, i },
      sceneState: {
        type: 'array_1d',
        array: [...arr],
        pointers: [
          { name: 'pivot', index: high, color: '#f59e0b' },
          { name: 'i', index: Math.max(0, i), color: '#3b82f6' },
        ],
        activeRange: [low, high],
        highlightIndices: [high],
      },
      callStack: [`partition(arr, ${low}, ${high})`],
      explanation: `Chosen pivot value: ${pivot} at index ${high}. Partitioning subarray elements <= ${pivot} to left.`,
    })

    for (let j = low; j < high; j++) {
      steps.push({
        lineNumber: 10,
        lineCode: 'if arr[j] <= pivot:',
        variables: { j, 'arr[j]': arr[j], pivot, i },
        sceneState: {
          type: 'array_1d',
          array: [...arr],
          pointers: [
            { name: 'j', index: j, color: '#06b6d4' },
            { name: 'i', index: Math.max(0, i), color: '#3b82f6' },
            { name: 'pivot', index: high, color: '#f59e0b' },
          ],
          activeRange: [low, high],
          highlightIndices: [j, high],
        },
        callStack: [`partition(arr, ${low}, ${high})`],
        explanation: `Comparing arr[j]=${arr[j]} with pivot=${pivot}. ${arr[j] <= pivot ? 'Element is <= pivot, will swap into left partition.' : 'Element is > pivot, remains in right partition.'}`,
      })

      if (arr[j] <= pivot) {
        i++
        if (i !== j) {
          const temp = arr[i]
          arr[i] = arr[j]
          arr[j] = temp

          steps.push({
            lineNumber: 12,
            lineCode: 'arr[i], arr[j] = arr[j], arr[i]  # Swap',
            variables: { i, j, swapped: [arr[i], arr[j]] },
            sceneState: {
              type: 'array_1d',
              array: [...arr],
              pointers: [
                { name: 'i', index: i, color: '#3b82f6' },
                { name: 'j', index: j, color: '#06b6d4' },
                { name: 'pivot', index: high, color: '#f59e0b' },
              ],
              activeRange: [low, high],
              highlightIndices: [i, j],
            },
            callStack: [`partition(arr, ${low}, ${high})`],
            explanation: `Swapped arr[${i}] and arr[${j}] so smaller value ${arr[i]} moves to left region.`,
          })
        }
      }
    }

    // Place pivot in sorted place
    const pIdx = i + 1
    const temp = arr[pIdx]
    arr[pIdx] = arr[high]
    arr[high] = temp

    steps.push({
      lineNumber: 13,
      lineCode: 'arr[i + 1], arr[high] = arr[high], arr[i + 1]  # Place pivot',
      variables: { pivotIndex: pIdx, pivotValue: arr[pIdx] },
      sceneState: {
        type: 'array_1d',
        array: [...arr],
        pointers: [{ name: 'PIVOT_FIXED', index: pIdx, color: '#22c55e' }],
        activeRange: [low, high],
        highlightIndices: [pIdx],
      },
      callStack: [`partition(arr, ${low}, ${high})`],
      explanation: `Pivot element ${arr[pIdx]} placed into its definitive sorted index ${pIdx}!`,
    })

    return pIdx
  }

  // Run a couple partitions for crisp visualizer demonstration
  const p1 = partition(0, arr.length - 1)
  if (p1 > 1) partition(0, p1 - 1)

  steps.push({
    lineNumber: 5,
    lineCode: '# Partitioning cycle complete',
    variables: { sortedSegments: 'Subarrays partitioned' },
    sceneState: {
      type: 'array_1d',
      array: [...arr],
      pointers: [],
      activeRange: [0, arr.length - 1],
      highlightIndices: [],
    },
    callStack: ['quicksort completed'],
    explanation: `QuickSort partitioning demonstrator complete. Elements around pivots are strictly partitioned.`,
  })

  return steps
}

// 4. Linked List Reversal Stepper
function generateLinkedListReversalSteps(input) {
  const values = input?.nodes || [10, 20, 30, 40, 50, 60]
  const steps = []

  steps.push({
    lineNumber: 2,
    lineCode: 'prev = None; curr = head',
    variables: { prev: 'None', curr: `Node(${values[0]})`, next: 'None' },
    sceneState: {
      type: 'linked_list',
      nodes: values.map((val, idx) => ({
        id: idx,
        val,
        nextId: idx < values.length - 1 ? idx + 1 : null,
      })),
      pointers: [{ name: 'curr', nodeId: 0, color: '#10b981' }, { name: 'prev', nodeId: null, color: '#ec4899' }],
      reversedEdges: [],
    },
    callStack: ['reverse_linked_list(head)'],
    explanation: `Initialize reversal with prev=None and curr pointing to head Node(${values[0]}).`,
  })

  const reversedEdges = []
  for (let i = 0; i < values.length; i++) {
    const nextVal = i < values.length - 1 ? values[i + 1] : null

    // Step: save next
    steps.push({
      lineNumber: 5,
      lineCode: 'next_temp = curr.next',
      variables: {
        prev: i > 0 ? `Node(${values[i - 1]})` : 'None',
        curr: `Node(${values[i]})`,
        next_temp: nextVal !== null ? `Node(${nextVal})` : 'None',
      },
      sceneState: {
        type: 'linked_list',
        nodes: values.map((val, idx) => ({
          id: idx,
          val,
          nextId: reversedEdges.includes(idx) ? idx - 1 : (idx < values.length - 1 ? idx + 1 : null),
        })),
        pointers: [
          { name: 'prev', nodeId: i > 0 ? i - 1 : null, color: '#ec4899' },
          { name: 'curr', nodeId: i, color: '#10b981' },
          { name: 'next', nodeId: i < values.length - 1 ? i + 1 : null, color: '#3b82f6' },
        ],
        reversedEdges: [...reversedEdges],
      },
      callStack: ['reverse_linked_list(head)'],
      explanation: `Preserved pointer to next_temp Node(${nextVal ?? 'None'}) so the rest of the list is not lost during disconnection.`,
    })

    // Step: reverse pointer
    reversedEdges.push(i)
    steps.push({
      lineNumber: 6,
      lineCode: 'curr.next = prev  # Invert arrow',
      variables: {
        'curr.val': values[i],
        'curr.next': i > 0 ? `Node(${values[i - 1]})` : 'None',
      },
      sceneState: {
        type: 'linked_list',
        nodes: values.map((val, idx) => ({
          id: idx,
          val,
          nextId: reversedEdges.includes(idx) ? (idx > 0 ? idx - 1 : null) : (idx < values.length - 1 ? idx + 1 : null),
        })),
        pointers: [
          { name: 'prev', nodeId: i > 0 ? i - 1 : null, color: '#ec4899' },
          { name: 'curr', nodeId: i, color: '#10b981' },
        ],
        reversedEdges: [...reversedEdges],
        activeReverseNode: i,
      },
      callStack: ['reverse_linked_list(head)'],
      explanation: `Inverted pointer: Node(${values[i]}) now points backwards to ${i > 0 ? `Node(${values[i - 1]})` : 'None'}.`,
    })

    // Step: advance pointers
    steps.push({
      lineNumber: 7,
      lineCode: 'prev = curr; curr = next_temp',
      variables: {
        prev: `Node(${values[i]})`,
        curr: nextVal !== null ? `Node(${nextVal})` : 'None',
      },
      sceneState: {
        type: 'linked_list',
        nodes: values.map((val, idx) => ({
          id: idx,
          val,
          nextId: reversedEdges.includes(idx) ? (idx > 0 ? idx - 1 : null) : (idx < values.length - 1 ? idx + 1 : null),
        })),
        pointers: [
          { name: 'prev', nodeId: i, color: '#ec4899' },
          { name: 'curr', nodeId: i < values.length - 1 ? i + 1 : null, color: '#10b981' },
        ],
        reversedEdges: [...reversedEdges],
      },
      callStack: ['reverse_linked_list(head)'],
      explanation: `Advanced prev to Node(${values[i]}) and curr forward.`,
    })
  }

  steps.push({
    lineNumber: 9,
    lineCode: 'return prev  # New head',
    variables: { newHead: `Node(${values[values.length - 1]})` },
    sceneState: {
      type: 'linked_list',
      nodes: values.map((val, idx) => ({
        id: idx,
        val,
        nextId: idx > 0 ? idx - 1 : null,
      })),
      pointers: [{ name: 'NEW_HEAD', nodeId: values.length - 1, color: '#22c55e' }],
      reversedEdges: values.map((_, i) => i),
    },
    callStack: ['reverse_linked_list(head)'],
    explanation: `List fully inverted in O(N) time and O(1) auxiliary space! Node(${values[values.length - 1]}) is the new head.`,
  })

  return steps
}

// 5. Monotonic Stack Stepper
function generateMonotonicStackSteps(input) {
  const arr = input?.array || [2, 1, 5, 6, 2, 3]
  const steps = []
  const n = arr.length
  const res = Array(n).fill(-1)
  const stack = []

  steps.push({
    lineNumber: 2,
    lineCode: 'result = [-1] * n; stack = []',
    variables: { stack: '[]', result: JSON.stringify(res) },
    sceneState: {
      type: 'stack',
      stack: [],
      array: [...arr],
      results: [...res],
      highlightIndex: null,
    },
    callStack: ['next_greater_elements(nums)'],
    explanation: 'Initialized empty stack and result array with -1 sentinel values.',
  })

  for (let i = 0; i < n; i++) {
    steps.push({
      lineNumber: 5,
      lineCode: 'while stack and nums[stack[-1]] < nums[i]:',
      variables: { i, 'nums[i]': arr[i], stackIndices: [...stack] },
      sceneState: {
        type: 'stack',
        stack: stack.map((idx) => ({ index: idx, val: arr[idx] })),
        array: [...arr],
        results: [...res],
        highlightIndex: i,
      },
      callStack: ['next_greater_elements(nums)'],
      explanation: `Examining nums[${i}] = ${arr[i]}. Checking if it exceeds top of stack elements.`,
    })

    while (stack.length > 0 && arr[stack[stack.length - 1]] < arr[i]) {
      const poppedIdx = stack.pop()
      res[poppedIdx] = arr[i]

      steps.push({
        lineNumber: 7,
        lineCode: 'idx = stack.pop(); result[idx] = nums[i]',
        variables: { poppedIdx, resolvedFor: arr[poppedIdx], nextGreater: arr[i] },
        sceneState: {
          type: 'stack',
          stack: stack.map((idx) => ({ index: idx, val: arr[idx] })),
          array: [...arr],
          results: [...res],
          highlightIndex: i,
          poppedItem: { index: poppedIdx, val: arr[poppedIdx] },
        },
        callStack: ['next_greater_elements(nums)'],
        explanation: `Popped index ${poppedIdx} (val = ${arr[poppedIdx]}). Its next greater element is ${arr[i]}!`,
      })
    }

    stack.push(i)
    steps.push({
      lineNumber: 8,
      lineCode: 'stack.append(i)',
      variables: { pushedIndex: i, pushedVal: arr[i], currentStack: [...stack] },
      sceneState: {
        type: 'stack',
        stack: stack.map((idx) => ({ index: idx, val: arr[idx] })),
        array: [...arr],
        results: [...res],
        highlightIndex: i,
      },
      callStack: ['next_greater_elements(nums)'],
      explanation: `Pushed index ${i} (value = ${arr[i]}) onto monotonic decreasing stack.`,
    })
  }

  steps.push({
    lineNumber: 9,
    lineCode: 'return result',
    variables: { finalResult: JSON.stringify(res) },
    sceneState: {
      type: 'stack',
      stack: stack.map((idx) => ({ index: idx, val: arr[idx] })),
      array: [...arr],
      results: [...res],
      highlightIndex: null,
    },
    callStack: ['next_greater_elements(nums)'],
    explanation: `Monotonic stack pass complete! Found all next greater elements in single O(N) pass.`,
  })

  return steps
}

// 6. Queue FIFO Stepper
function generateQueueSteps(input) {
  const items = input?.array || [10, 20, 30, 40, 50]
  const steps = []
  const queue = []

  steps.push({
    lineNumber: 1,
    lineCode: 'q = deque()',
    variables: { queue: '[]', length: 0 },
    sceneState: { type: 'queue', queue: [], activeAction: 'init' },
    callStack: ['queue_simulation()'],
    explanation: 'Initialized empty FIFO Queue buffer.',
  })

  for (const item of items) {
    queue.push(item)
    steps.push({
      lineNumber: 2,
      lineCode: `q.append(${item})  # Enqueue`,
      variables: { enqueued: item, queueState: [...queue] },
      sceneState: { type: 'queue', queue: [...queue], activeAction: 'enqueue', targetItem: item },
      callStack: ['queue_simulation()'],
      explanation: `Enqueued ${item} at rear of queue (O(1)).`,
    })
  }

  while (queue.length > 2) {
    const dequeued = queue.shift()
    steps.push({
      lineNumber: 3,
      lineCode: 'q.popleft()  # Dequeue front',
      variables: { dequeued, queueState: [...queue] },
      sceneState: { type: 'queue', queue: [...queue], activeAction: 'dequeue', targetItem: dequeued },
      callStack: ['queue_simulation()'],
      explanation: `Dequeued ${dequeued} from front of queue according to First-In-First-Out rule.`,
    })
  }

  return steps
}

// 7. Binary Tree Traversal Stepper
function generateTreeTraversalSteps(orderType = 'inorder') {
  const tree = [
    { id: 1, val: 1, left: 2, right: 3, x: 0, y: 5, z: 0 },
    { id: 2, val: 2, left: 4, right: 5, x: -3.5, y: 3, z: 0 },
    { id: 3, val: 3, left: 6, right: 7, x: 3.5, y: 3, z: 0 },
    { id: 4, val: 4, left: null, right: null, x: -5, y: 1, z: 0 },
    { id: 5, val: 5, left: null, right: null, x: -2, y: 1, z: 0 },
    { id: 6, val: 6, left: null, right: null, x: 2, y: 1, z: 0 },
    { id: 7, val: 7, left: null, right: null, x: 5, y: 1, z: 0 },
  ]
  const steps = []
  const visited = []

  let sequence = [4, 2, 5, 1, 6, 3, 7]
  let title = 'Inorder Traversal (Left -> Root -> Right)'
  let pyCode = `def inorder(root):
    if not root: return
    inorder(root.left)
    visit(root.val)
    inorder(root.right)`
  let jsCode = `function inorder(root) {
  if (!root) return;
  inorder(root.left);
  visit(root.val);
  inorder(root.right);
}`

  if (orderType === 'preorder') {
    sequence = [1, 2, 4, 5, 3, 6, 7]
    title = 'Preorder Traversal (Root -> Left -> Right)'
    pyCode = `def preorder(root):
    if not root: return
    visit(root.val)
    preorder(root.left)
    preorder(root.right)`
    jsCode = `function preorder(root) {
  if (!root) return;
  visit(root.val);
  preorder(root.left);
  preorder(root.right);
}`
  } else if (orderType === 'postorder') {
    sequence = [4, 5, 2, 6, 7, 3, 1]
    title = 'Postorder Traversal (Left -> Right -> Root)'
    pyCode = `def postorder(root):
    if not root: return
    postorder(root.left)
    postorder(root.right)
    visit(root.val)`
    jsCode = `function postorder(root) {
  if (!root) return;
  postorder(root.left);
  postorder(root.right);
  visit(root.val);
}`
  } else if (orderType === 'levelorder') {
    sequence = [1, 2, 3, 4, 5, 6, 7]
    title = 'Level Order Traversal (BFS)'
    pyCode = `def level_order(root):
    queue = deque([root])
    while queue:
        node = queue.popleft()
        visit(node.val)
        if node.left: queue.append(node.left)
        if node.right: queue.append(node.right)`
    jsCode = `function levelOrder(root) {
  const queue = [root];
  while (queue.length) {
    const node = queue.shift();
    visit(node.val);
    if (node.left) queue.push(node.left);
    if (node.right) queue.push(node.right);
  }
}`
  }

  const codeSnippet = { python: pyCode, javascript: jsCode }

  steps.push({
    lineNumber: 1,
    lineCode: `def ${orderType}_traversal(root):`,
    codeSnippet,
    variables: { root: 'Node(1)', traversalType: title, visited: '[]' },
    sceneState: { type: 'tree_binary', tree, activeNodeId: 1, visitedNodeIds: [] },
    callStack: [`${orderType}_traversal(Node(1))`],
    explanation: `Starting ${title} from root Node(1).`,
  })

  sequence.forEach((nodeId) => {
    visited.push(nodeId)
    steps.push({
      lineNumber: orderType === 'preorder' ? 3 : orderType === 'postorder' ? 5 : 4,
      lineCode: `visit(node_${nodeId})`,
      codeSnippet,
      variables: { currentNode: `Node(${nodeId})`, visitedSequence: [...visited] },
      sceneState: {
        type: 'tree_binary',
        tree,
        activeNodeId: nodeId,
        visitedNodeIds: [...visited],
      },
      callStack: [`${orderType}(Node(${nodeId}))`],
      explanation: `Visited Node(${nodeId}) in ${title} order. Sequence: [${visited.join(', ')}].`,
    })
  })

  return steps
}

// 8. BST Insert & Search Stepper
function generateBstSteps() {
  const keys = [50, 30, 70, 20, 40, 60, 80]
  const steps = []

  steps.push({
    lineNumber: 1,
    lineCode: 'bst = BST()',
    variables: { root: 'None' },
    sceneState: { type: 'tree_avl', nodes: [{ id: 50, val: 50, left: 30, right: 70, bf: 0 }], activeNode: 50 },
    callStack: ['insert(50)'],
    explanation: 'Root node 50 inserted into Binary Search Tree.',
  })

  steps.push({
    lineNumber: 4,
    lineCode: 'insert(key=30)  # 30 < 50 -> goes left',
    variables: { key: 30, root: 50, branch: 'LEFT' },
    sceneState: {
      type: 'tree_avl',
      nodes: [
        { id: 50, val: 50, left: 30, right: 70, bf: 0 },
        { id: 30, val: 30, left: 20, right: 40, bf: 0 },
      ],
      activeNode: 30,
    },
    callStack: ['insert(30)'],
    explanation: 'Comparing 30 with 50. Since 30 < 50, branches into Left Subtree.',
  })

  steps.push({
    lineNumber: 6,
    lineCode: 'insert(key=70)  # 70 > 50 -> goes right',
    variables: { key: 70, root: 50, branch: 'RIGHT' },
    sceneState: {
      type: 'tree_avl',
      nodes: [
        { id: 50, val: 50, left: 30, right: 70, bf: 0 },
        { id: 30, val: 30, left: 20, right: 40, bf: 0 },
        { id: 70, val: 70, left: 60, right: 80, bf: 0 },
      ],
      activeNode: 70,
    },
    callStack: ['insert(70)'],
    explanation: 'Comparing 70 with 50. Since 70 > 50, branches into Right Subtree.',
  })

  return steps
}

// 9. Heap Stepper
function generateHeapSteps(input) {
  const arr = input?.array || [4, 10, 3, 5, 1]
  const steps = []

  steps.push({
    lineNumber: 1,
    lineCode: 'build_max_heap(arr)',
    variables: { array: [...arr] },
    sceneState: {
      type: 'tree_heap',
      heapArray: [...arr],
      activeIndices: [1],
    },
    callStack: ['heapify(arr, 5, 1)'],
    explanation: 'Initial complete binary tree state before max-heapify pass.',
  })

  const heapified = [10, 5, 3, 4, 1]
  steps.push({
    lineNumber: 8,
    lineCode: 'swap(arr[0], arr[1]) # Max heap property',
    variables: { heapArray: [...heapified] },
    sceneState: {
      type: 'tree_heap',
      heapArray: [...heapified],
      activeIndices: [0, 1],
    },
    callStack: ['heapify completed'],
    explanation: 'Max element 10 bubbled to root! Heap satisfies parent >= children condition.',
  })

  return steps
}

// 10. BFS Graph Stepper
function generateBfsGraphSteps() {
  const nodes = [0, 1, 2, 3, 4, 5]
  const edges = [[0, 1], [0, 2], [1, 3], [1, 4], [2, 4], [3, 5], [4, 5]]
  const steps = []

  steps.push({
    lineNumber: 2,
    lineCode: 'visited = {start}; queue = deque([start])',
    variables: { start: 0, queue: '[0]', visited: '[0]' },
    sceneState: {
      type: 'graph_spatial',
      nodes,
      edges,
      visitedNodes: [0],
      activeNode: 0,
      activeEdges: [],
    },
    callStack: ['bfs(graph, 0)'],
    explanation: 'Starting Breadth-First Search from source node 0. Added to queue and marked visited.',
  })

  steps.push({
    lineNumber: 7,
    lineCode: 'u = queue.popleft() # Explore neighbors 1 and 2',
    variables: { u: 0, queue: '[1, 2]', visited: '[0, 1, 2]' },
    sceneState: {
      type: 'graph_spatial',
      nodes,
      edges,
      visitedNodes: [0, 1, 2],
      activeNode: 0,
      activeEdges: [[0, 1], [0, 2]],
    },
    callStack: ['bfs(graph, 0)'],
    explanation: 'Explored level-1 frontier: nodes 1 and 2 queued in concentric BFS ring.',
  })

  steps.push({
    lineNumber: 8,
    lineCode: 'u = 1; explore neighbors 3 and 4',
    variables: { u: 1, queue: '[2, 3, 4]', visited: '[0, 1, 2, 3, 4]' },
    sceneState: {
      type: 'graph_spatial',
      nodes,
      edges,
      visitedNodes: [0, 1, 2, 3, 4],
      activeNode: 1,
      activeEdges: [[1, 3], [1, 4]],
    },
    callStack: ['bfs(graph, 0)'],
    explanation: 'Popped 1 from queue, radiating outward to level-2 nodes 3 and 4.',
  })

  steps.push({
    lineNumber: 12,
    lineCode: 'All nodes visited in BFS shortest paths',
    variables: { visited: '[0, 1, 2, 3, 4, 5]' },
    sceneState: {
      type: 'graph_spatial',
      nodes,
      edges,
      visitedNodes: [0, 1, 2, 3, 4, 5],
      activeNode: 5,
      activeEdges: [[3, 5], [4, 5]],
    },
    callStack: ['bfs completed'],
    explanation: 'Graph traversal finished! BFS computes minimum edge-distance in O(V + E) time.',
  })

  return steps
}

// 11. Knapsack DP Stepper
function generateKnapsackSteps() {
  const values = [60, 100, 120]
  const weights = [10, 20, 30]
  const capacity = 50
  const steps = []

  steps.push({
    lineNumber: 3,
    lineCode: 'dp = [[0] * (W + 1) for _ in range(N + 1)]',
    variables: { items: 3, capacity: 50 },
    sceneState: {
      type: 'dp_grid',
      rows: 4,
      cols: 6, // scaled representation for cap 0, 10, 20, 30, 40, 50
      table: [
        [0, 0, 0, 0, 0, 0],
        [0, 60, 60, 60, 60, 60],
        [0, 60, 100, 160, 160, 160],
        [0, 60, 100, 160, 180, 220],
      ],
      activeCell: [1, 1],
      highlightDepCells: [[0, 1], [0, 0]],
    },
    callStack: ['knapsack_01(values, weights, 50)'],
    explanation: 'DP Table initialized. 3D grid elevation represents optimal subproblem values.',
  })

  steps.push({
    lineNumber: 7,
    lineCode: 'dp[i][w] = max(dp[i-1][w], val[i] + dp[i-1][w - wt[i]])',
    variables: { i: 2, w: 30, val: 100, wt: 20, maxVal: 160 },
    sceneState: {
      type: 'dp_grid',
      rows: 4,
      cols: 6,
      table: [
        [0, 0, 0, 0, 0, 0],
        [0, 60, 60, 60, 60, 60],
        [0, 60, 100, 160, 160, 160],
        [0, 60, 100, 160, 180, 220],
      ],
      activeCell: [2, 3],
      highlightDepCells: [[1, 3], [1, 1]],
    },
    callStack: ['knapsack_01(values, weights, 50)'],
    explanation: 'Evaluating Item 2 ($100, 20kg): max(without item=60, with item=100+60=160) -> 160.',
  })

  steps.push({
    lineNumber: 10,
    lineCode: 'return dp[n][capacity]  # Optimal 220',
    variables: { maxKnapsackValue: 220 },
    sceneState: {
      type: 'dp_grid',
      rows: 4,
      cols: 6,
      table: [
        [0, 0, 0, 0, 0, 0],
        [0, 60, 60, 60, 60, 60],
        [0, 60, 100, 160, 160, 160],
        [0, 60, 100, 160, 180, 220],
      ],
      activeCell: [3, 5],
      highlightDepCells: [],
    },
    callStack: ['knapsack_01 completed'],
    explanation: 'Optimal solution computed! Max profit with capacity 50 is $220.',
  })

  return steps
}
