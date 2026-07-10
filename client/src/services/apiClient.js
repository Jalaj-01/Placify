import { auth } from '@/config/firebase'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001'

export async function apiCall(endpoint, { method = 'GET', body, headers, ...rest } = {}) {
  const user = auth.currentUser
  if (!user) throw new Error('Not authenticated')

  const token = await user.getIdToken()
  const res = await fetch(`${API_BASE}${endpoint}`, {
    method,
    ...rest,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }))
    throw new Error(err.error || 'Request failed')
  }

  return res.json()
}
