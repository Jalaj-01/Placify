import { GoogleGenerativeAI } from '@google/generative-ai'

// Initializing Google Generative AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

async function callGeminiJSON(prompt) {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not configured on the server.')
  }

  const modelsToTry = ['gemini-1.5-flash', 'gemini-2.0-flash', 'gemini-1.5-pro', 'gemini-3.1-flash-lite']
  let lastErr = null

  for (const modelName of modelsToTry) {
    try {
      const model = genAI.getGenerativeModel({
        model: modelName,
        generationConfig: { temperature: 0.3, responseMimeType: 'application/json' },
      })
      const result = await model.generateContent(prompt)
      const text = result.response.text()
      try {
        return JSON.parse(text)
      } catch {
        const match = text.match(/\{[\s\S]*\}/)
        if (match) return JSON.parse(match[0])
      }
    } catch (err) {
      console.warn(`[Gemini] Model ${modelName} JSON call error:`, err.message)
      lastErr = err
    }
  }

  throw new Error(lastErr?.message || 'Failed to generate JSON response from Gemini.')
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

  return callGeminiJSON(prompt)
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

  return callGeminiJSON(prompt)
}

export async function explainTopic(topicName) {
  const prompt = `Explain the topic "${topicName}" for a quick interview refresher. Return ONLY valid JSON:
{ "bullets": ["3-4 concise bullet points"] }`

  return callGeminiJSON(prompt)
}

export async function chatWithGemini({ messages = [], userContext = null }) {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not configured on the server.')
  }

  const modelsToTry = ['gemini-1.5-flash', 'gemini-2.0-flash', 'gemini-1.5-pro']
  let lastErr = null

  const systemInstruction = `You are Placify Copilot, an expert AI Placement & Coding Coach.
You help students with coding doubts, DSA algorithms, debugging, technical interview preparation, system design concepts, and study strategies.
Be helpful, clear, precise, and encouraging. Format all code snippets in markdown code blocks with the language tag. Keep explanations well-structured.`

  for (const modelName of modelsToTry) {
    try {
      const model = genAI.getGenerativeModel({
        model: modelName,
        systemInstruction,
      })

      const formattedHistory = messages.map((m) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content || '' }],
      }))

      if (formattedHistory.length === 0) {
        formattedHistory.push({ role: 'user', parts: [{ text: 'Hello!' }] })
      }

      const history = formattedHistory.slice(0, -1)
      const lastMsg = formattedHistory[formattedHistory.length - 1].parts[0].text

      let promptText = lastMsg
      if (userContext && history.length === 0) {
        promptText = `[Student Preparation Data: ${JSON.stringify(userContext)}]\n\nUser Question: ${lastMsg}`
      }

      const chat = model.startChat({ history })
      const result = await chat.sendMessage(promptText)
      return { text: result.response.text() }
    } catch (err) {
      console.warn(`[Gemini Chat] Model ${modelName} error:`, err.message)
      lastErr = err
    }
  }

  throw new Error(lastErr?.message || 'Gemini Chat service unavailable.')
}
