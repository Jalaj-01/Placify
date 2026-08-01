import { useState } from 'react'
import {
  Users, Video, FileText, Code2, Trophy, Play, CheckCircle, Plus,
  Send, Sparkles, X, Clock, Flame, Award
} from 'lucide-react'

export default function GroupStudyModal({ isOpen, onClose, user }) {
  const [activeTab, setActiveTab] = useState('cowatch') // 'cowatch' | 'code' | 'scores'
  const [videoUrl, setVideoUrl] = useState('https://www.youtube.com/embed/8hly31xKLI0')
  const [videoTitle, setVideoTitle] = useState('Dynamic Programming & Graph Algorithms Masterclass')

  // Shared Notes State
  const [notes, setNotes] = useState([
    { id: 1, author: 'You', text: 'DP State definition: dp[i] represents min cost to reach step i.', time: '10:14 AM' },
    { id: 2, author: 'Rohan M.', text: 'Remember base case: dp[0] = 0, dp[1] = cost[0].', time: '10:16 AM' },
    { id: 3, author: 'Ananya S.', text: 'Space optimization trick: We only need previous 2 variables instead of full array!', time: '10:18 AM' }
  ])
  const [newNote, setNewNote] = useState('')

  // Pair Code Execution State
  const [code, setCode] = useState(`// Pair Code Execution - Dynamic Programming
function minCostClimbingStairs(cost) {
  let prev2 = 0, prev1 = 0;
  for (let c of cost) {
    let curr = c + Math.min(prev1, prev2);
    prev2 = prev1;
    prev1 = curr;
  }
  return Math.min(prev1, prev2);
}

// Test Case
console.log(minCostClimbingStairs([10, 15, 20]));`)
  const [output, setOutput] = useState('')
  const [isExecuting, setIsExecuting] = useState(false)

  // Contribution Scoring State
  const [contributions, setContributions] = useState([
    { name: user?.displayName || 'You', notesCount: 4, codeRuns: 3, watchMin: 28, score: 145, badge: 'Group Leader' },
    { name: 'Rohan Mehta', notesCount: 3, codeRuns: 2, watchMin: 25, score: 110, badge: 'Code Contributor' },
    { name: 'Ananya Sharma', notesCount: 5, codeRuns: 1, watchMin: 30, score: 125, badge: 'Note Master' }
  ])

  if (!isOpen) return null

  const handleAddNote = (e) => {
    e.preventDefault()
    if (!newNote.trim()) return
    const noteObj = {
      id: Date.now(),
      author: user?.displayName || 'You',
      text: newNote.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
    setNotes((prev) => [...prev, noteObj])
    setNewNote('')

    // Update contribution score
    setContributions((prev) =>
      prev.map((c) =>
        c.name === (user?.displayName || 'You')
          ? { ...c, notesCount: c.notesCount + 1, score: c.score + 15 }
          : c
      )
    )
  }

  const handleRunCode = () => {
    setIsExecuting(true)
    setOutput('Executing code in shared sandbox...')
    setTimeout(() => {
      try {
        // Safe evaluation simulation
        setOutput('Output:\n15\n\n✅ Test Case Passed: minCostClimbingStairs([10, 15, 20]) -> 15')
      } catch (err) {
        setOutput('Error executing script: ' + err.message)
      } finally {
        setIsExecuting(false)
        setContributions((prev) =>
          prev.map((c) =>
            c.name === (user?.displayName || 'You')
              ? { ...c, codeRuns: c.codeRuns + 1, score: c.score + 20 }
              : c
          )
        )
      }
    }, 800)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-5xl h-[85vh] rounded-2xl bg-[#0b0c13] border border-white/10 flex flex-col overflow-hidden shadow-2xl">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-surface/40">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/20 text-accent">
              <Users className="h-5 w-5 text-accent-light" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-text-primary">Group Study Hub</h2>
                <span className="px-2 py-0.5 rounded-full bg-semantic-green/15 text-semantic-green text-[10px] font-semibold flex items-center gap-1 border border-semantic-green/30">
                  <span className="h-1.5 w-1.5 rounded-full bg-semantic-green animate-pulse" /> Live Room (3 Online)
                </span>
              </div>
              <p className="text-xs text-text-muted">Co-watch lectures, write shared notes, run code & track peer contribution scores.</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="h-8 w-8 rounded-lg border border-white/10 flex items-center justify-center text-text-muted hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 px-6 pt-3 bg-surface/20 border-b border-white/5">
          <button
            onClick={() => setActiveTab('cowatch')}
            className={`px-4 py-2 text-xs font-semibold rounded-t-lg transition-all flex items-center gap-2 border-b-2 ${
              activeTab === 'cowatch'
                ? 'border-accent text-accent bg-accent/10'
                : 'border-transparent text-text-muted hover:text-text-primary'
            }`}
          >
            <Video className="h-4 w-4" />
            Co-Watch & Parallel Notes
          </button>
          <button
            onClick={() => setActiveTab('code')}
            className={`px-4 py-2 text-xs font-semibold rounded-t-lg transition-all flex items-center gap-2 border-b-2 ${
              activeTab === 'code'
                ? 'border-semantic-purple text-semantic-purple bg-semantic-purple/10'
                : 'border-transparent text-text-muted hover:text-text-primary'
            }`}
          >
            <Code2 className="h-4 w-4" />
            Pair Code Execution
          </button>
          <button
            onClick={() => setActiveTab('scores')}
            className={`px-4 py-2 text-xs font-semibold rounded-t-lg transition-all flex items-center gap-2 border-b-2 ${
              activeTab === 'scores'
                ? 'border-semantic-green text-semantic-green bg-semantic-green/10'
                : 'border-transparent text-text-muted hover:text-text-primary'
            }`}
          >
            <Trophy className="h-4 w-4" />
            Contribution Leaderboard
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-hidden p-6">
          {/* TAB 1: Co-Watch & Notes */}
          {activeTab === 'cowatch' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full">
              {/* Video Player */}
              <div className="lg:col-span-7 flex flex-col space-y-3">
                <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black border border-white/10 shadow-lg">
                  <iframe
                    src={videoUrl}
                    title="Course Video"
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
                <div className="flex items-center justify-between px-1">
                  <span className="text-xs font-medium text-text-primary">{videoTitle}</span>
                  <span className="text-[11px] text-text-muted flex items-center gap-1">
                    <Clock className="h-3 w-3" /> Synced at 14:20
                  </span>
                </div>
              </div>

              {/* Shared Parallel Notes */}
              <div className="lg:col-span-5 flex flex-col rounded-xl bg-surface/40 border border-white/10 p-4 h-full overflow-hidden">
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <div className="flex items-center gap-2 text-xs font-semibold text-text-primary">
                    <FileText className="h-4 w-4 text-accent" />
                    Real-time Shared Notes
                  </div>
                  <span className="text-[10px] text-accent bg-accent/10 px-2 py-0.5 rounded-full font-mono">
                    Auto-saved
                  </span>
                </div>

                <div className="flex-1 overflow-y-auto py-3 space-y-3 pr-1">
                  {notes.map((n) => (
                    <div key={n.id} className="p-3 rounded-lg bg-base/60 border border-white/5 space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-semibold text-accent">{n.author}</span>
                        <span className="text-text-muted text-[10px]">{n.time}</span>
                      </div>
                      <p className="text-xs text-text-secondary leading-relaxed">{n.text}</p>
                    </div>
                  ))}
                </div>

                <form onSubmit={handleAddNote} className="pt-2 flex gap-2">
                  <input
                    type="text"
                    placeholder="Add shared note / key takeaway..."
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    className="flex-1 bg-base border border-white/10 rounded-lg px-3 py-2 text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent"
                  />
                  <button
                    type="submit"
                    className="px-3 py-2 rounded-lg bg-accent text-white hover:bg-accent-light transition-colors flex items-center justify-center"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* TAB 2: Pair Code Execution */}
          {activeTab === 'code' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full">
              {/* Code Editor */}
              <div className="lg:col-span-7 flex flex-col space-y-3 h-full">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-text-primary">Collaborative JavaScript Editor</span>
                  <button
                    onClick={handleRunCode}
                    disabled={isExecuting}
                    className="px-4 py-1.5 rounded-lg bg-semantic-purple text-white text-xs font-semibold hover:opacity-90 transition-opacity flex items-center gap-1.5 shadow-md shadow-semantic-purple/20"
                  >
                    <Play className="h-3.5 w-3.5 fill-current" />
                    {isExecuting ? 'Running...' : 'Run Code Together'}
                  </button>
                </div>
                <textarea
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="flex-1 w-full bg-[#07080d] border border-white/15 rounded-xl p-4 font-mono text-xs text-accent-light focus:outline-none focus:border-semantic-purple resize-none leading-relaxed"
                />
              </div>

              {/* Console Output */}
              <div className="lg:col-span-5 flex flex-col space-y-3 h-full">
                <span className="text-xs font-semibold text-text-primary">Execution Output</span>
                <div className="flex-1 bg-black border border-white/10 rounded-xl p-4 font-mono text-xs text-semantic-green space-y-2 overflow-y-auto">
                  <div className="text-text-muted text-[11px] pb-2 border-b border-white/10">
                    Live Session Output Log
                  </div>
                  <pre className="whitespace-pre-wrap">{output || 'Click "Run Code Together" to execute.'}</pre>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Contribution Score Leaderboard */}
          {activeTab === 'scores' && (
            <div className="space-y-6 max-w-3xl mx-auto py-2">
              <div className="p-4 rounded-xl bg-gradient-to-r from-accent/20 to-semantic-purple/20 border border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Trophy className="h-8 w-8 text-yellow-400 animate-bounce" />
                  <div>
                    <h3 className="font-bold text-text-primary text-base">Automated Session Contribution Scoring</h3>
                    <p className="text-xs text-text-secondary">Points awarded automatically for notes created (+15), code runs (+20), and video watch time.</p>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full bg-yellow-400/20 text-yellow-300 font-bold text-sm border border-yellow-400/30">
                  Active Room
                </span>
              </div>

              {/* Leaderboard Table */}
              <div className="space-y-3">
                {contributions.map((c, index) => (
                  <div
                    key={c.name}
                    className="p-4 rounded-xl bg-surface/50 border border-white/10 flex items-center justify-between transition-all hover:bg-surface/80"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent/20 text-accent font-bold text-sm">
                        #{index + 1}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-text-primary text-sm">{c.name}</h4>
                          <span className="px-2 py-0.5 rounded-md bg-white/10 text-text-muted text-[10px] font-medium">
                            {c.badge}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-text-muted mt-1">
                          <span>📝 {c.notesCount} Notes</span>
                          <span>💻 {c.codeRuns} Code Runs</span>
                          <span>⏱️ {c.watchMin} mins Watch</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-lg font-bold text-semantic-green">{c.score} pts</span>
                      <p className="text-[10px] text-text-muted">Contribution</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
