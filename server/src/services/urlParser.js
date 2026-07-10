import axios from 'axios'

const LEETCODE_GRAPHQL = 'https://leetcode.com/graphql'

function detectPlatform(url) {
  const lower = url.toLowerCase()
  if (lower.includes('leetcode.com')) return 'LeetCode'
  if (lower.includes('geeksforgeeks.org')) return 'GeeksforGeeks'
  if (lower.includes('hackerrank.com')) return 'HackerRank'
  return 'Other'
}

function extractSlug(url, platform) {
  try {
    const parsed = new URL(url)
    const parts = parsed.pathname.split('/').filter(Boolean)
    if (platform === 'LeetCode') {
      const idx = parts.findIndex((p) => p === 'problems')
      return idx >= 0 ? parts[idx + 1]?.replace(/\/$/, '') : parts[parts.length - 1]
    }
    if (platform === 'GeeksforGeeks') {
      return parts[parts.length - 1] || ''
    }
    if (platform === 'HackerRank') {
      const idx = parts.findIndex((p) => p === 'challenges')
      return idx >= 0 ? parts[idx + 1] : parts[parts.length - 1]
    }
    return parts[parts.length - 1] || ''
  } catch {
    return ''
  }
}

function slugToTitle(slug) {
  return slug
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim()
}

function assignTag(title) {
  const lower = title.toLowerCase()
  if (/tree|binary|bst/.test(lower)) return 'Trees'
  if (/graph|bfs|dfs/.test(lower)) return 'Graphs'
  if (/dp|dynamic|knapsack/.test(lower)) return 'DP'
  if (/array|subarray|sum/.test(lower)) return 'Arrays'
  if (/string|palindrome|anagram/.test(lower)) return 'Strings'
  if (/link|node|list/.test(lower)) return 'Linked Lists'
  if (/stack|queue|deque/.test(lower)) return 'Stacks & Queues'
  return 'General'
}

async function fetchLeetCodeDetails(slug) {
  const query = `
    query getQuestionDetail($titleSlug: String!) {
      question(titleSlug: $titleSlug) {
        title
        difficulty
      }
    }
  `
  const { data } = await axios.post(
    LEETCODE_GRAPHQL,
    { query, variables: { titleSlug: slug } },
    { headers: { 'Content-Type': 'application/json' }, timeout: 10000 }
  )
  const q = data?.data?.question
  if (!q) return null
  return { title: q.title, difficulty: q.difficulty || 'Medium' }
}

export async function parseProblemUrl(url) {
  if (!url || typeof url !== 'string') {
    throw new Error('URL is required')
  }

  const platform = detectPlatform(url)
  const slug = extractSlug(url, platform)
  let title = slugToTitle(slug)
  let difficulty = 'Medium'

  if (platform === 'LeetCode' && slug) {
    try {
      const details = await fetchLeetCodeDetails(slug)
      if (details) {
        title = details.title
        difficulty = details.difficulty
      }
    } catch {
      // Fall back to slug-based title
    }
  }

  const tag = assignTag(title)

  return { title, platform, difficulty, tag, slug, url }
}
