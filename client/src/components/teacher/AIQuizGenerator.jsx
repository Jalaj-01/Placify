import { useState } from 'react'
import {
  Sparkles, BookOpen, CheckCircle2, HelpCircle, Copy, Check, RefreshCw
} from 'lucide-react'

export default function AIQuizGenerator() {
  const [topic, setTopic] = useState('Data Structures - Graph Traversal & BFS')
  const [difficulty, setDifficulty] = useState('Medium')
  const [questionType, setQuestionType] = useState('MCQ')
  const [numQuestions, setNumQuestions] = useState(3)
  const [isGenerating, setIsGenerating] = useState(false)
  const [copied, setCopied] = useState(false)

  const [generatedQuiz, setGeneratedQuiz] = useState([
    {
      id: 1,
      question: 'Which data structure is typically used to implement Breadth-First Search (BFS) on a Graph?',
      type: 'MCQ',
      options: ['Stack', 'Queue', 'Priority Queue', 'LinkedList'],
      correctAnswer: 'Queue',
      explanation: 'BFS explores vertices level-by-level using a FIFO Queue to ensure order.'
    },
    {
      id: 2,
      question: 'What is the time complexity of BFS on a Graph with V vertices and E edges using an Adjacency List?',
      type: 'MCQ',
      options: ['O(V)', 'O(E)', 'O(V + E)', 'O(V * E)'],
      correctAnswer: 'O(V + E)',
      explanation: 'Each vertex is visited once and each edge is inspected once in an adjacency list.'
    },
    {
      id: 3,
      question: 'Write a JavaScript code snippet to detect a cycle in an undirected graph using BFS.',
      type: 'Code Snippet',
      correctAnswer: 'Function using parent tracking array in BFS queue loop.',
      explanation: 'If an adjacent node is visited and not parent of current node, a cycle exists.'
    }
  ])

  const handleGenerateQuiz = (e) => {
    e.preventDefault()
    setIsGenerating(true)
    setTimeout(() => {
      setIsGenerating(false)
      setGeneratedQuiz([
        {
          id: Date.now() + 1,
          question: `[AI Generated] What is the primary advantage of ${topic} compared to depth-first approaches?`,
          type: questionType,
          options: ['Finds shortest path in unweighted graphs', 'Requires less memory', 'Faster recursion', 'Works only on DAGs'],
          correctAnswer: 'Finds shortest path in unweighted graphs',
          explanation: 'BFS guarantees finding the shortest path distance in terms of edge count.'
        },
        {
          id: Date.now() + 2,
          question: `[AI Generated] Explain how to prevent infinite loops during ${topic} on cyclic graphs.`,
          type: 'Short Answer',
          correctAnswer: 'Maintain a visited Set or boolean array.',
          explanation: 'Mark nodes as visited before pushing to the queue.'
        }
      ])
    }, 1000)
  }

  const handleCopyQuiz = () => {
    const text = generatedQuiz.map((q, idx) => `Q${idx+1}: ${q.question}\nAns: ${q.correctAnswer}\nExp: ${q.explanation}`).join('\n\n')
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="p-5 rounded-2xl bg-surface/40 border border-white/10 space-y-5 shadow-lg">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-text-primary text-base flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-semantic-purple animate-pulse" />
            AI Automated Quiz & Assignment Generator
          </h3>
          <p className="text-xs text-text-muted">Auto-generate course quizzes with answer keys & auto-grading guidelines.</p>
        </div>
        {generatedQuiz.length > 0 && (
          <button
            onClick={handleCopyQuiz}
            className="px-3.5 py-1.5 rounded-xl bg-white/10 text-white text-xs font-semibold hover:bg-white/15 transition-all flex items-center gap-1.5 border border-white/10"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-semantic-green" /> : <Copy className="h-3.5 w-3.5" />}
            <span>{copied ? 'Copied Quiz' : 'Copy Quiz Text'}</span>
          </button>
        )}
      </div>

      {/* Generator Form */}
      <form onSubmit={handleGenerateQuiz} className="grid grid-cols-1 md:grid-cols-4 gap-3 p-4 rounded-xl bg-base/60 border border-white/10">
        <div className="space-y-1 md:col-span-2">
          <label className="text-xs text-text-secondary block">Topic / Syllabus Module</label>
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="w-full bg-surface border border-white/15 rounded-lg px-3 py-1.5 text-xs text-text-primary focus:outline-none focus:border-semantic-purple"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs text-text-secondary block">Difficulty</label>
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            className="w-full bg-surface border border-white/15 rounded-lg px-3 py-1.5 text-xs text-text-primary focus:outline-none focus:border-semantic-purple"
          >
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-xs text-text-secondary block">Question Format</label>
          <select
            value={questionType}
            onChange={(e) => setQuestionType(e.target.value)}
            className="w-full bg-surface border border-white/15 rounded-lg px-3 py-1.5 text-xs text-text-primary focus:outline-none focus:border-semantic-purple"
          >
            <option value="MCQ">Multiple Choice (MCQ)</option>
            <option value="Short Answer">Short Answer</option>
            <option value="Code Snippet">Code Snippet</option>
          </select>
        </div>

        <div className="md:col-span-4 pt-1">
          <button
            type="submit"
            disabled={isGenerating}
            className="w-full py-2.5 rounded-xl bg-semantic-purple text-white font-semibold text-xs hover:bg-purple-600 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-semantic-purple/20"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span>Generating Quiz with AI...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                <span>Generate AI Quiz & Answer Key</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Generated Quiz Output */}
      <div className="space-y-3">
        <h4 className="text-xs font-semibold text-text-primary flex items-center gap-1.5">
          <HelpCircle className="h-4 w-4 text-accent" /> Generated Quiz Preview ({generatedQuiz.length} Questions)
        </h4>

        <div className="space-y-3">
          {generatedQuiz.map((q, idx) => (
            <div key={q.id} className="p-4 rounded-xl bg-surface/50 border border-white/5 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-text-primary">
                <span>Q{idx + 1}: {q.question}</span>
                <span className="px-2 py-0.5 rounded bg-semantic-purple/15 text-semantic-purple text-[10px] font-mono">
                  {q.type}
                </span>
              </div>

              {q.options && (
                <div className="grid grid-cols-2 gap-2 pt-1 text-xs text-text-secondary">
                  {q.options.map((opt, oIdx) => (
                    <div
                      key={oIdx}
                      className={`p-2 rounded-lg border text-xs ${
                        opt === q.correctAnswer
                          ? 'border-semantic-green bg-semantic-green/10 text-semantic-green font-semibold'
                          : 'border-white/5 bg-base/50'
                      }`}
                    >
                      {String.fromCharCode(65 + oIdx)}. {opt}
                    </div>
                  ))}
                </div>
              )}

              <div className="pt-2 border-t border-white/5 text-[11px] text-text-muted flex items-center justify-between">
                <span>Correct Key: <code className="text-semantic-green font-bold">{q.correctAnswer}</code></span>
                <span className="italic">{q.explanation}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
