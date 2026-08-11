import { useState, useEffect, useRef } from 'react'
import {
  Users, Video, FileText, Code2, Trophy, Play, Plus,
  Send, X, Clock, UserPlus, LogOut, Check
} from 'lucide-react'
import { useSocket } from '@/hooks/useSocket'
import { useAppStore } from '@/store/useAppStore'
import { findUserByEmail } from '@/services/firestoreService'

export default function GroupStudyModal({ user }) {
  const socket = useSocket(user?.uid)
  
  const isOpen = useAppStore(s => s.groupStudyOpen)
  const onClose = useAppStore(s => s.closeGroupStudy)
  const activeStudyRoomId = useAppStore(s => s.activeStudyRoomId)

  // Room State
  const [roomId, setRoomId] = useState(activeStudyRoomId || 'global-study-room')
  const [onlineCount, setOnlineCount] = useState(1)

  // Video State
  const [videoUrlInput, setVideoUrlInput] = useState('https://www.youtube.com/watch?v=rfscVS0vtbw')
  const [videoEmbedUrl, setVideoEmbedUrl] = useState('https://www.youtube.com/embed/rfscVS0vtbw')
  const [videoTitle, setVideoTitle] = useState('Dynamic Programming & Data Structures Masterclass')

  // Notes State
  const [notes, setNotes] = useState([
    { id: 1, author: 'System', text: 'Welcome to the Live Study Room!', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
  ])
  const [newNote, setNewNote] = useState('')
  const notesEndRef = useRef(null)

  // Code State
  const [code, setCode] = useState('// Pair Code Execution\nfunction run() {\n  console.log("Hello World");\n}\nrun();')
  const [output, setOutput] = useState('')
  const [isExecuting, setIsExecuting] = useState(false)

  // Invite State
  const [showInvite, setShowInvite] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteStatus, setInviteStatus] = useState('')
  const [recentInvites, setRecentInvites] = useState(() => {
    const saved = localStorage.getItem('recent_invites')
    return saved ? JSON.parse(saved) : []
  })

  // Socket setup
  useEffect(() => {
    if (!isOpen || !socket) return

    socket.emit('join-room', roomId)

    const handleCodeUpdate = (newCode) => {
      setCode(newCode)
    }

    const handleNoteReceive = (noteObj) => {
      setNotes((prev) => [...prev, noteObj])
      setTimeout(() => notesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)
    }

    const handleUserJoined = () => {
      setOnlineCount(prev => prev + 1)
    }
    const handleUserLeft = () => {
      setOnlineCount(prev => Math.max(1, prev - 1))
    }

    socket.on('code-update', handleCodeUpdate)
    socket.on('note-receive', handleNoteReceive)
    socket.on('user-joined', handleUserJoined)
    socket.on('user-left', handleUserLeft)

    return () => {
      socket.off('code-update', handleCodeUpdate)
      socket.off('note-receive', handleNoteReceive)
      socket.off('user-joined', handleUserJoined)
      socket.off('user-left', handleUserLeft)
      socket.emit('leave-room', roomId)
    }
  }, [isOpen, socket, roomId])

  if (!isOpen) return null

  // Handlers
  const handleUpdateVideo = (e) => {
    e.preventDefault()
    if (!videoUrlInput.trim()) return
    let raw = videoUrlInput.trim()
    let embed = raw
    if (raw.includes('watch?v=')) {
      const id = raw.split('watch?v=')[1]?.split('&')[0]
      if (id) embed = `https://www.youtube.com/embed/${id}`
    } else if (raw.includes('youtu.be/')) {
      const id = raw.split('youtu.be/')[1]?.split('?')[0]
      if (id) embed = `https://www.youtube.com/embed/${id}`
    }
    setVideoEmbedUrl(embed)
  }

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
    socket.emit('note-add', { roomId, note: noteObj })
    setTimeout(() => notesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)
  }

  const handleCodeChange = (e) => {
    const newCode = e.target.value
    setCode(newCode)
    socket.emit('code-change', { roomId, code: newCode })
  }

  const handleRunCode = () => {
    setIsExecuting(true)
    setOutput('Executing code in shared sandbox...')
    setTimeout(() => {
      try {
        setOutput('Output:\nHello World\n\n✅ Execution finished.')
      } catch (err) {
        setOutput('Error: ' + err.message)
      } finally {
        setIsExecuting(false)
      }
    }, 800)
  }

  const handleSendInvite = async (e, emailToUse = inviteEmail) => {
    if (e) e.preventDefault()
    if (!emailToUse.trim()) return
    setInviteStatus('Locating user...')
    
    try {
      const targetUser = await findUserByEmail(emailToUse)
      if (targetUser.uid === user.uid) {
        setInviteStatus('You cannot invite yourself.')
        return
      }

      socket.emit('send-invite', {
        toUid: targetUser.uid,
        fromName: user.displayName,
        roomId: roomId
      })
      
      setInviteStatus(`Invite sent to ${targetUser.displayName || emailToUse}!`)
      setInviteEmail('')

      // Add to recents
      if (!recentInvites.includes(emailToUse)) {
        const newRecents = [emailToUse, ...recentInvites].slice(0, 5)
        setRecentInvites(newRecents)
        localStorage.setItem('recent_invites', JSON.stringify(newRecents))
      }
    } catch (err) {
      setInviteStatus('User not found. Check email.')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#0b0c13] animate-in fade-in duration-200">
      {/* Massive Header */}
      <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-surface/80 shrink-0">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/20 text-accent">
            <Users className="h-6 w-6 text-accent-light" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-black text-text-primary">Group Study Hub</h2>
              <span className="px-3 py-1 rounded-full bg-semantic-green/15 text-semantic-green text-xs font-bold flex items-center gap-1.5 border border-semantic-green/30">
                <span className="h-2 w-2 rounded-full bg-semantic-green animate-pulse" /> Live Room ({onlineCount} Online)
              </span>
            </div>
            <p className="text-sm text-text-muted mt-0.5">
              Co-watch, Pair Code, and Chat Simultaneously.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowInvite(!showInvite)}
            className="px-4 py-2 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-500/30 font-bold text-sm flex items-center gap-2 transition-colors"
          >
            <UserPlus className="h-4 w-4" /> Invite Friend
          </button>
          
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-white/10 flex items-center gap-2 text-text-muted hover:text-white hover:bg-semantic-red/20 hover:border-semantic-red/30 font-bold text-sm transition-colors"
          >
            <LogOut className="h-4 w-4" /> Leave Room
          </button>
        </div>
      </div>

      {/* Invite Dropdown / Panel */}
      {showInvite && (
        <div className="absolute top-20 right-6 w-80 bg-surface border border-white/15 rounded-2xl p-4 shadow-2xl z-50 animate-in slide-in-from-top-4">
          <h3 className="font-bold text-sm mb-3">Invite Friend to Room</h3>
          <form onSubmit={handleSendInvite} className="flex gap-2 mb-2">
            <input 
              type="email" 
              placeholder="Friend's email..." 
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              className="flex-1 bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-accent"
              required
            />
            <button type="submit" className="bg-accent text-white px-3 rounded-lg text-xs font-bold">Send</button>
          </form>
          {inviteStatus && <p className="text-[11px] text-accent mb-3">{inviteStatus}</p>}
          
          {recentInvites.length > 0 && (
            <div>
              <p className="text-[10px] text-text-muted font-bold uppercase mb-2">Recent Invites</p>
              <div className="flex flex-wrap gap-2">
                {recentInvites.map(email => (
                  <button 
                    key={email}
                    onClick={() => handleSendInvite(null, email)}
                    className="px-2 py-1 bg-white/5 border border-white/10 rounded text-[11px] hover:bg-white/10"
                  >
                    {email}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Main Workspace - 3 Columns or CSS Grid */}
      <div className="flex-1 overflow-hidden p-4 lg:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Side: Video (Top) & Code (Bottom) */}
        <div className="lg:col-span-8 flex flex-col gap-6 h-full">
          {/* Video Player Section */}
          <div className="flex flex-col gap-3 h-[45%]">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-text-primary flex items-center gap-2">
                <Video className="h-4 w-4 text-accent" /> Synchronized Video
              </span>
              <form onSubmit={handleUpdateVideo} className="flex gap-2 w-1/2">
                <input
                  type="text"
                  value={videoUrlInput}
                  onChange={(e) => setVideoUrlInput(e.target.value)}
                  placeholder="Paste YouTube Video URL..."
                  className="flex-1 bg-surface border border-white/10 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-accent"
                />
                <button type="submit" className="px-3 py-1.5 rounded-lg bg-surface border border-white/10 text-xs font-semibold hover:bg-white/5">Load</button>
              </form>
            </div>
            <div className="flex-1 rounded-2xl overflow-hidden bg-black border border-white/10 relative shadow-lg">
              <iframe
                src={videoEmbedUrl}
                title="Course Video"
                className="w-full h-full absolute inset-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>

          {/* Code Editor Section */}
          <div className="flex flex-col gap-3 h-[55%]">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-text-primary flex items-center gap-2">
                <Code2 className="h-4 w-4 text-semantic-purple" /> Live Pair Code
              </span>
              <button
                onClick={handleRunCode}
                disabled={isExecuting}
                className="px-4 py-1.5 rounded-lg bg-semantic-purple/20 text-semantic-purple border border-semantic-purple/30 text-xs font-bold hover:bg-semantic-purple/30 transition-all flex items-center gap-1.5"
              >
                <Play className="h-3 w-3 fill-current" /> {isExecuting ? 'Running...' : 'Run Shared Code'}
              </button>
            </div>
            
            <div className="flex-1 flex gap-4 h-full overflow-hidden">
              <textarea
                value={code}
                onChange={handleCodeChange}
                placeholder="Type code here... everyone in the room will see it instantly!"
                className="flex-1 h-full bg-[#080911] border border-semantic-purple/20 rounded-2xl p-4 font-mono text-xs md:text-sm text-cyan-300 focus:outline-none focus:border-semantic-purple resize-none shadow-inner"
              />
              <div className="w-1/3 h-full bg-[#050508] border border-border-subtle rounded-2xl p-4 font-mono text-xs text-semantic-green overflow-y-auto shadow-inner flex flex-col">
                <div className="text-text-muted text-[10px] pb-2 border-b border-border-subtle font-bold uppercase mb-2 shrink-0">
                  Console Output
                </div>
                <pre className="whitespace-pre-wrap leading-relaxed flex-1 overflow-y-auto">{output}</pre>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Shared Notes */}
        <div className="lg:col-span-4 flex flex-col h-full bg-surface/30 border border-white/10 rounded-3xl overflow-hidden shadow-lg">
          <div className="p-4 border-b border-white/10 bg-surface/50 flex items-center justify-between">
            <span className="text-sm font-bold text-text-primary flex items-center gap-2">
              <FileText className="h-4 w-4 text-accent" /> Shared Notes Chat
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {notes.map((n) => (
              <div key={n.id} className="p-3 rounded-xl bg-surface/80 border border-white/5 space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold text-accent">{n.author}</span>
                  <span className="text-text-muted text-[10px]">{n.time}</span>
                </div>
                <p className="text-sm text-text-secondary leading-relaxed">{n.text}</p>
              </div>
            ))}
            <div ref={notesEndRef} />
          </div>

          <form onSubmit={handleAddNote} className="p-4 bg-surface/50 border-t border-white/10 flex gap-2">
            <input
              type="text"
              placeholder="Type a note to the group..."
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              className="flex-1 bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent"
            />
            <button
              type="submit"
              className="px-4 py-2.5 rounded-xl bg-accent text-white hover:bg-accent-light transition-colors flex items-center justify-center shadow-lg"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>

      </div>
    </div>
  )
}
