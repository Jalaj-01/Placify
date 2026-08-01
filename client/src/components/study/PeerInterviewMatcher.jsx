import { useState, useEffect } from 'react'
import {
  Users, Sparkles, Clock, Play, CheckCircle2, Code2, AlertCircle,
  Shuffle, UserCheck, RefreshCw, X, ChevronRight
} from 'lucide-react'

export default function PeerInterviewMatcher({ user }) {
  const [topic, setTopic] = useState('dsa') // 'dsa' | 'system-design' | 'cs-theory'
  const [isMatching, setIsMatching] = useState(false)
  const [activeSession, setActiveSession] = useState(null)
  const [timerSeconds, setTimerSeconds] = useState(2700) // 45 mins
  const [code, setCode] = useState(`// Peer 1v1 Mock Interview Solution
function solve(nums, target) {
  const map = new Map();
  for (let i = 0; i < nums.length; i++) {
    let diff = target - nums[i];
    if (map.has(diff)) return [map.get(diff), i];
    map.set(nums[i], i);
  }
  return [];
}`)
  const [output, setOutput] = useState('')

  const sampleQuestions = {
    dsa: {
      title: 'Course Schedule II (Topological Sort)',
      difficulty: 'Medium',
      timeLimit: '45 Mins',
      description: 'There are a total of numCourses courses you have to take, labeled from 0 to numCourses - 1. You are given an array prerequisites where prerequisites[i] = [a, b] indicates that you must take course b first if you want to take course a. Return the ordering of courses you should take to finish all courses.',
      exampleInput: 'numCourses = 4, prerequisites = [[1,0],[2,0],[3,1],[3,2]]',
      exampleOutput: '[0,1,2,3] or [0,2,1,3]'
    },
    'system-design': {
      title: 'Design a Distributed Rate Limiter',
      difficulty: 'Hard',
      timeLimit: '45 Mins',
      description: 'Design an API Rate Limiter that restricts the number of requests a user can make within a specified window of time. Address concurrency, sliding window algorithm, and multi-region Redis sync.',
      exampleInput: '100 requests per minute per IP address',
      exampleOutput: '200 OK / 429 Too Many Requests response'
    },
    'cs-theory': {
      title: 'OS Process Deadlock & Banker\'s Algorithm',
      difficulty: 'Medium',
      timeLimit: '30 Mins',
      description: 'Explain the 4 necessary conditions for Deadlock occurrence. Walk through Banker\'s Algorithm for deadlock avoidance with resource allocation matrix.',
      exampleInput: 'Allocation Matrix, Max Need Matrix, Available Vector',
      exampleOutput: 'Safe Sequence: <P1, P3, P0, P2, P4>'
    }
  }

  const handleStartMatch = () => {
    setIsMatching(true)
    setTimeout(() => {
      setIsMatching(false)
      setActiveSession({
        peerName: 'Rohan Mehta (IIT Delhi)',
        peerRole: 'Candidate',
        matchedTopic: topic,
        question: sampleQuestions[topic]
      })
    }, 1200)
  }

  const handleRunCode = () => {
    setOutput('Executing test cases in peer sandbox...')
    setTimeout(() => {
      setOutput('✅ Test Cases Passed!\nInput: numCourses = 4, prerequisites = [[1,0],[2,0],[3,1],[3,2]]\nOutput: [0, 1, 2, 3]\nExecution Time: 4ms (Beats 94% JS submissions)')
    }, 600)
  }

  return (
    <div className="p-5 rounded-2xl bg-surface/40 border border-white/10 space-y-5 shadow-lg">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-text-primary text-base flex items-center gap-2">
              <Users className="h-5 w-5 text-accent" />
              1v1 Peer Mock Interview Matcher
            </h3>
            <span className="px-2 py-0.5 rounded-full bg-semantic-green/15 text-semantic-green text-[10px] font-semibold border border-semantic-green/30">
              Live Matcher
            </span>
          </div>
          <p className="text-xs text-text-muted mt-0.5">
            Pair with another student instantly for timed technical interview practice with real question handouts.
          </p>
        </div>

        {!activeSession && (
          <div className="flex items-center gap-2">
            <select
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="bg-base border border-white/15 rounded-xl px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-accent"
            >
              <option value="dsa">DSA & Algorithms</option>
              <option value="system-design">System Design</option>
              <option value="cs-theory">Core CS Theory</option>
            </select>

            <button
              onClick={handleStartMatch}
              disabled={isMatching}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-accent to-accent-light text-white text-xs font-semibold hover:opacity-95 transition-all shadow-md shadow-accent/20 flex items-center gap-2"
            >
              {isMatching ? (
                <>
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  <span>Matching Peer...</span>
                </>
              ) : (
                <>
                  <Shuffle className="h-3.5 w-3.5" />
                  <span>Find 1v1 Peer Match</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Active Session View */}
      {activeSession ? (
        <div className="space-y-4 p-5 rounded-xl bg-base/80 border border-white/10 animate-in fade-in duration-200">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-semantic-green/20 text-semantic-green font-bold text-xs">
                1v1
              </div>
              <div>
                <span className="font-semibold text-text-primary text-xs flex items-center gap-1.5">
                  <UserCheck className="h-3.5 w-3.5 text-semantic-green" /> Matched with {activeSession.peerName}
                </span>
                <p className="text-[11px] text-text-muted">Role Swap: 45 Mins (22m Interviewer / 22m Candidate)</p>
              </div>
            </div>

            <button
              onClick={() => setActiveSession(null)}
              className="text-xs text-semantic-red hover:underline font-medium"
            >
              End Peer Session
            </button>
          </div>

          {/* Question Handout */}
          <div className="space-y-2 p-4 rounded-xl bg-surface/50 border border-white/5">
            <div className="flex items-center justify-between">
              <span className="px-2 py-0.5 rounded bg-accent/20 text-accent font-bold text-[10px]">
                Question Handout ({activeSession.question.difficulty})
              </span>
              <span className="text-xs text-text-muted font-mono flex items-center gap-1">
                <Clock className="h-3 w-3 text-accent" /> 41:20 Remaining
              </span>
            </div>
            <h4 className="font-bold text-text-primary text-sm">{activeSession.question.title}</h4>
            <p className="text-xs text-text-secondary leading-relaxed">{activeSession.question.description}</p>
            <div className="text-[11px] text-text-muted space-y-1 pt-1">
              <p>Sample Input: <code className="text-accent font-mono">{activeSession.question.exampleInput}</code></p>
              <p>Sample Output: <code className="text-semantic-green font-mono">{activeSession.question.exampleOutput}</code></p>
            </div>
          </div>

          {/* Shared Code Runner */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 pt-2">
            <div className="lg:col-span-7 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-text-primary">Shared Code Editor</span>
                <button
                  onClick={handleRunCode}
                  className="px-3 py-1 rounded-lg bg-semantic-purple text-white text-xs font-semibold hover:opacity-90 transition-opacity flex items-center gap-1.5"
                >
                  <Play className="h-3 w-3 fill-current" /> Run Tests
                </button>
              </div>
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full h-36 bg-[#07080d] border border-white/15 rounded-xl p-3 font-mono text-xs text-accent-light focus:outline-none focus:border-accent resize-none leading-relaxed"
              />
            </div>

            <div className="lg:col-span-5 space-y-2">
              <span className="text-xs font-semibold text-text-primary">Sandbox Output</span>
              <div className="h-36 bg-black border border-white/10 rounded-xl p-3 font-mono text-xs text-semantic-green overflow-y-auto">
                <pre className="whitespace-pre-wrap">{output || 'Click "Run Tests" to execute submission.'}</pre>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-6 text-center rounded-xl bg-base/40 border border-dashed border-white/10 space-y-2">
          <Sparkles className="h-8 w-8 text-accent mx-auto animate-pulse" />
          <h4 className="font-bold text-text-primary text-sm">Ready for a Peer Practice Session?</h4>
          <p className="text-xs text-text-muted max-w-md mx-auto">
            Select your preferred subject above and click <strong>"Find 1v1 Peer Match"</strong> to get paired with an online peer for live interview practice.
          </p>
        </div>
      )}
    </div>
  )
}
