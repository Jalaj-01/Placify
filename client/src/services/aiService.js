import { apiCall } from './apiClient'

export async function parseUrl(url) {
  return apiCall('/api/parse-url', { method: 'POST', body: { url } })
}

export async function analyzePreparation(data) {
  return apiCall('/api/ai/analyze', { method: 'POST', body: data })
}

export async function generateInterviewBrief(data) {
  return apiCall('/api/ai/interview-brief', { method: 'POST', body: data })
}

export async function explainTopic(topicName) {
  return apiCall('/api/ai/explain-topic', { method: 'POST', body: { topicName } })
}

export async function chatWithAI(messages, userContext = null) {
  return apiCall('/api/ai/chat', { method: 'POST', body: { messages, userContext } })
}
