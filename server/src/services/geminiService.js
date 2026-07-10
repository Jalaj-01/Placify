import { GoogleGenerativeAI } from '@google/generative-ai'

// Initializing Google Generative AI (using keys created from Janus account)
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

function getModel() {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY not configured on server')
  }
  return genAI.getGenerativeModel({
    model: 'gemini-1.5-flash',
    generationConfig: { temperature: 0.3, responseMimeType: 'application/json' },
  })
}

async function callGemini(prompt) {
  const model = getModel()
  const result = await model.generateContent(prompt)
  const text = result.response.text()
  try {
    return JSON.parse(text)
  } catch {
    const match = text.match(/\{[\s\S]*\}/)
    if (match) return JSON.parse(match[0])
    throw new Error('Failed to parse Gemini response')
  }
}

export async function analyzePreparation(data) {
  const prompt = `You are a placement preparation coach. Analyze this student's data and return ONLY valid JSON with this exact schema:
{
  "weakAreas": ["string"],
  "strengths": ["string"],
  "priorityActions": ["string"],
  "overallReadiness": number,
  "studyPlanSuggestion": "string"
}

Student data:
Problems: ${JSON.stringify(data.problems?.slice(0, 50) || [])}
Topics: ${JSON.stringify(data.topics?.slice(0, 80) || [])}
Applications: ${JSON.stringify(data.applications?.slice(0, 20) || [])}
Streak: ${JSON.stringify(data.streakData || {})}

Be specific and actionable. overallReadiness is 0-100.`

  return callGemini(prompt)
}

export async function generateInterviewBrief(data) {
  const prompt = `You are an interview coach. Return ONLY valid JSON:
{
  "companyOverview": "2-3 sentences",
  "typicalInterviewProcess": "string",
  "topicsToReview": ["string"],
  "topicsToAvoid": ["string"],
  "quickTips": ["string"],
  "timeEstimate": "string"
}

Company: ${data.companyName}
Role: ${data.role}
Weak topics: ${JSON.stringify(data.weakTopics || [])}
Strong topics: ${JSON.stringify(data.strongTopics || [])}`

  return callGemini(prompt)
}

export async function explainTopic(topicName) {
  const prompt = `Explain the topic "${topicName}" for a quick interview refresher. Return ONLY valid JSON:
{ "bullets": ["3-4 concise bullet points"] }`

  return callGemini(prompt)
}
