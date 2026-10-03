import { useState } from 'react'
import {
  BookOpen, Plus, Users, Search, Trash2, ArrowRight,
  Sparkles, Hash, Copy, Check, Clock, FileText, Code2, CheckSquare, Share2, Link2
} from 'lucide-react'
import { saveSharedNotebook } from '@/services/firestoreService'

const COLOR_THEMES = [
  { id: 'indigo', name: 'Indigo', spine: 'bg-indigo-500', border: 'border-indigo-500/30', bg: 'bg-indigo-500/10 text-indigo-400' },
  { id: 'emerald', name: 'Emerald', spine: 'bg-emerald-500', border: 'border-emerald-500/30', bg: 'bg-emerald-500/10 text-emerald-400' },
  { id: 'amber', name: 'Amber', spine: 'bg-amber-500', border: 'border-amber-500/30', bg: 'bg-amber-500/10 text-amber-400' },
  { id: 'rose', name: 'Rose', spine: 'bg-rose-500', border: 'border-rose-500/30', bg: 'bg-rose-500/10 text-rose-400' },
  { id: 'violet', name: 'Violet', spine: 'bg-violet-500', border: 'border-violet-500/30', bg: 'bg-violet-500/10 text-violet-400' },
  { id: 'sky', name: 'Sky Blue', spine: 'bg-sky-500', border: 'border-sky-500/30', bg: 'bg-sky-500/10 text-sky-400' },
]

const PAPER_STYLES = [
  { id: 'ruled', name: 'Ruled Lines', desc: 'Classic horizontal notebook lines' },
  { id: 'grid', name: 'Graph Grid', desc: 'Engineering graph grid paper' },
  { id: 'clean', name: 'Clean Minimal', desc: 'Distraction-free modern page' },
  { id: 'sepia', name: 'Warm Parchment', desc: 'Comfortable reading tone' },
  { id: 'dark', name: 'Terminal Dark', desc: 'High-contrast coder theme' },
]

export default function NotebookShelf({
  notebooks,
  onSelectNotebook,
  onCreateNotebook,
  onDeleteNotebook,
  onJoinSharedNotebook,
}) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSubject, setSelectedSubject] = useState('ALL')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showJoinModal, setShowJoinModal] = useState(false)
  const [shareModalTarget, setShareModalTarget] = useState(null)
  const [shareCopied, setShareCopied] = useState(false)

  // Dynamically compute subjects strictly from notebooks that exist
  const availableSubjects = [
    'ALL',
    ...Array.from(new Set(notebooks.map((nb) => nb.subject?.trim()).filter(Boolean)))
  ]

  // Form states for New Notebook
  const [title, setTitle] = useState('')
  const [subject, setSubject] = useState('DSA')
  const [customSubject, setCustomSubject] = useState('')
  const [paperStyle, setPaperStyle] = useState('ruled')
  const [colorTheme, setColorTheme] = useState('indigo')
  const [isCollaborative, setIsCollaborative] = useState(true)

  // Form states for Join
  const [joinCode, setJoinCode] = useState('')
  const [joinError, setJoinError] = useState('')
  const [isJoining, setIsJoining] = useState(false)

  const [copiedId, setCopiedId] = useState(null)

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!title.trim()) return

    const finalSubject = subject === 'Other' ? (customSubject.trim() || 'General') : subject

    const newNb = await onCreateNotebook({
      title: title.trim(),
      subject: finalSubject,
      paperStyle,
      colorTheme,
      isCollaborative,
    })

    setShowCreateModal(false)
    setTitle('')
    setCustomSubject('')
    setSubject('DSA')
    if (newNb?.id) {
      onSelectNotebook(newNb.id)
    }
  }

  const handleJoin = async (e) => {
    e.preventDefault()
    if (!joinCode.trim()) return
    setIsJoining(true)
    setJoinError('')

    try {
      const res = await onJoinSharedNotebook(joinCode.trim())
      if (res?.success) {
        setShowJoinModal(false)
        setJoinCode('')
        if (res.notebook?.id) {
          onSelectNotebook(res.notebook.id)
        }
      } else {
        setJoinError(res?.error || 'Could not join notebook room.')
      }
    } catch (err) {
      setJoinError(err?.message || 'Error joining notebook room.')
    } finally {
      setIsJoining(false)
    }
  }

  const handleShareClick = async (e, nb) => {
    e.stopPropagation()
    const roomId = (nb.collabRoomId || `collab-${Math.random().toString(36).substring(2, 8)}`).trim().replace(/^#+/, '')
    const fullNb = { ...nb, collabRoomId: roomId, isCollaborative: true }
    await saveSharedNotebook(roomId, fullNb).catch(() => {})
    const shareUrl = `${window.location.origin}/notes?room=${roomId}`
    navigator.clipboard.writeText(shareUrl)
    setCopiedId(nb.id)
    setShareModalTarget(fullNb)
    setShareCopied(true)
    setTimeout(() => {
      setCopiedId(null)
      setShareCopied(false)
    }, 2500)
  }

  const filteredNotebooks = notebooks.filter((nb) => {
    const q = searchQuery.toLowerCase()
    const matchesSearch =
      (nb.title && nb.title.toLowerCase().includes(q)) ||
      (nb.subject && nb.subject.toLowerCase().includes(q))
    if (!matchesSearch) return false

    if (selectedSubject === 'ALL' || !availableSubjects.includes(selectedSubject)) return true
    return nb.subject === selectedSubject
  })

  return (
    <div className="flex-1 flex flex-col h-full bg-surface/50 overflow-hidden text-text-primary">
      {/* Top Shelf Toolbar */}
      <div className="p-4 sm:p-5 border-b border-border-subtle bg-surface/40 shrink-0 space-y-3.5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-accent/20 text-accent border border-accent/30 flex items-center justify-center shadow-sm">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-text-primary tracking-tight">Notebooks</h2>
                <span className="px-2 py-0.5 rounded-full bg-accent/15 text-accent text-[10px] font-bold uppercase tracking-wider border border-accent/20">
                  Collaborative
                </span>
              </div>
              <p className="text-xs text-text-muted">Interactive notes, runnable code & live study</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowJoinModal(true)}
              className="px-3 py-1.5 rounded-xl border border-border-subtle hover:bg-hover text-text-secondary hover:text-text-primary text-xs font-bold transition-all flex items-center gap-1.5"
              title="Join a friend's collaborative notebook"
            >
              <Hash className="h-3.5 w-3.5 text-accent" />
              <span>Join</span>
            </button>

            <button
              onClick={() => setShowCreateModal(true)}
              className="px-3.5 py-1.5 rounded-xl bg-accent hover:bg-accent-light text-white font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-md"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>New</span>
            </button>
          </div>
        </div>

        {/* Search bar & filter pills */}
        <div className="space-y-2.5">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-text-muted" />
            <input
              type="text"
              placeholder="Search notebooks, subjects, or concepts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-card/80 border border-border-subtle rounded-2xl pl-9 pr-3 py-2 text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-0.5">
            {availableSubjects.map((sub) => (
              <button
                key={sub}
                onClick={() => setSelectedSubject(sub)}
                className={`px-2.5 py-1 rounded-full text-[11px] font-semibold whitespace-nowrap transition-all ${
                  selectedSubject === sub
                    ? 'bg-accent text-white font-bold shadow-xs'
                    : 'bg-card/60 text-text-muted hover:text-text-primary border border-border-subtle'
                }`}
              >
                {sub}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Notebook Cards List */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5 scrollbar-thin">
        {filteredNotebooks.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-border-subtle rounded-3xl p-6 space-y-3 bg-card/40">
            <BookOpen className="h-10 w-10 text-accent/50 mx-auto animate-pulse" />
            <p className="text-xs font-bold text-text-secondary">No notebooks found</p>
            <p className="text-[11px] text-text-muted max-w-xs mx-auto">
              Create an interactive notebook to take rich notes, run code, and collaborate in real-time.
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="mt-2 px-4 py-2 rounded-xl bg-accent text-white font-bold text-xs hover:bg-accent-light shadow-md"
            >
              + Create First Notebook
            </button>
          </div>
        ) : (
          filteredNotebooks.map((nb) => {
            const theme = COLOR_THEMES.find((t) => t.id === nb.colorTheme) || COLOR_THEMES[0]
            const pageCount = nb.pages?.length || 1
            const cellCount = nb.pages?.reduce((acc, p) => acc + (p.cells?.length || 0), 0) || 0
            const hasCodeCell = nb.pages?.some((p) => p.cells?.some((c) => c.type === 'code'))

            return (
              <div
                key={nb.id}
                onClick={() => onSelectNotebook(nb.id)}
                className={`group relative rounded-2xl border ${theme.border} bg-card/75 hover:bg-card hover:shadow-lg transition-all duration-200 cursor-pointer overflow-hidden p-4 flex flex-col gap-2.5 backdrop-blur-md hover:scale-[1.01]`}
              >
                {/* Left Spine Bookmark Accent */}
                <div className={`absolute left-0 top-0 bottom-0 w-2 ${theme.spine}`} />

                {/* Card Header */}
                <div className="flex items-start justify-between gap-2 pl-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${theme.bg}`}>
                        {nb.subject || 'General'}
                      </span>
                      {nb.isCollaborative && (
                        <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-semantic-green/15 text-semantic-green text-[10px] font-bold border border-semantic-green/30">
                          <Users className="h-3 w-3" /> Live Collab
                        </span>
                      )}
                    </div>
                    <h3 className="font-bold text-sm text-text-primary mt-1.5 truncate group-hover:text-accent transition-colors">
                      {nb.title || 'Untitled Notebook'}
                    </h3>
                  </div>

                  <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                    {nb.collabRoomId && (
                      <button
                        onClick={(e) => handleShareClick(e, nb)}
                        className="p-1.5 rounded-lg text-accent hover:bg-accent/15 transition-colors flex items-center gap-1"
                        title="Share Collaborative Notebook Link"
                      >
                        {copiedId === nb.id ? (
                          <Check className="h-3.5 w-3.5 text-emerald-400" />
                        ) : (
                          <Share2 className="h-3.5 w-3.5" />
                        )}
                      </button>
                    )}
                    <button
                      onClick={() => onDeleteNotebook(nb.id)}
                      className="p-1.5 rounded-lg text-text-muted hover:text-semantic-red transition-colors opacity-60 group-hover:opacity-100"
                      title="Delete Notebook"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {/* Stats & Features Bar */}
                <div className="flex items-center gap-3 pl-2 pt-1 border-t border-border-subtle/50 text-[11px] text-text-muted">
                  <span className="flex items-center gap-1 font-medium">
                    <FileText className="h-3 w-3 text-text-muted" /> {pageCount} {pageCount === 1 ? 'Page' : 'Pages'}
                  </span>
                  <span className="flex items-center gap-1 font-medium">
                    <CheckSquare className="h-3 w-3 text-text-muted" /> {cellCount} {cellCount === 1 ? 'Cell' : 'Cells'}
                  </span>
                  {hasCodeCell && (
                    <span className="flex items-center gap-1 text-accent font-semibold">
                      <Code2 className="h-3 w-3" /> Runnable Code
                    </span>
                  )}

                  <span className="ml-auto text-accent text-xs font-bold flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    Open <ArrowRight className="h-3 w-3" />
                  </span>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Footer Info */}
      <div className="p-3.5 border-t border-border-subtle bg-surface/40 text-xs text-text-muted flex items-center justify-between font-medium">
        <span>{notebooks.length} total notebooks</span>
        <span>{notebooks.filter((n) => n.isCollaborative).length} collaborative</span>
      </div>

      {/* ── CREATE NOTEBOOK MODAL ── */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-surface border border-border-subtle rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-xl bg-accent/20 text-accent flex items-center justify-center">
                  <BookOpen className="h-4 w-4" />
                </div>
                <h3 className="font-bold text-sm text-text-primary">Create New Notebook</h3>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-text-muted hover:text-text-primary p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3.5">
              <div>
                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block mb-1">
                  Notebook Title
                </label>
                <input
                  type="text"
                  placeholder="e.g., Dynamic Programming & Trees"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-card border border-border-subtle rounded-xl px-3.5 py-2.5 text-xs text-text-primary focus:outline-none focus:border-accent"
                  autoFocus
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block mb-1">
                    Subject / Domain
                  </label>
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full"
                  >
                    <option value="DSA">DSA</option>
                    <option value="System Design">System Design</option>
                    <option value="Core CS">Core CS (OS/DBMS/CN)</option>
                    <option value="Web Dev">Web Development</option>
                    <option value="Interview Prep">Interview Prep</option>
                    <option value="Research">Research & Papers</option>
                    <option value="Other">Other (Custom Subject)</option>
                  </select>

                  {subject === 'Other' && (
                    <div className="mt-2 animate-in fade-in">
                      <input
                        type="text"
                        placeholder="Type custom subject name..."
                        value={customSubject}
                        onChange={(e) => setCustomSubject(e.target.value)}
                        className="w-full bg-card border border-border-subtle rounded-xl px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-accent font-semibold"
                        required
                        autoFocus
                      />
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block mb-1">
                    Paper Style
                  </label>
                  <select
                    value={paperStyle}
                    onChange={(e) => setPaperStyle(e.target.value)}
                    className="w-full"
                  >
                    {PAPER_STYLES.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block mb-1.5">
                  Notebook Cover Color
                </label>
                <div className="flex items-center gap-2">
                  {COLOR_THEMES.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setColorTheme(c.id)}
                      className={`h-7 w-7 rounded-full ${c.spine} transition-transform flex items-center justify-center ${
                        colorTheme === c.id ? 'scale-125 ring-2 ring-accent shadow-md' : 'opacity-70 hover:opacity-100'
                      }`}
                    >
                      {colorTheme === c.id && <Check className="h-3.5 w-3.5 text-white" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Collaborative Checkbox */}
              <div className="p-3 rounded-2xl bg-card border border-border-subtle flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-text-primary">Enable Live Collaboration</p>
                  <p className="text-[10px] text-text-muted">Allows teammates to join, type, and run code together</p>
                </div>
                <input
                  type="checkbox"
                  checked={isCollaborative}
                  onChange={(e) => setIsCollaborative(e.target.checked)}
                  className="h-4 w-4 rounded accent-indigo-600 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-3 py-1.5 rounded-xl border border-border-subtle text-xs font-bold text-text-muted hover:text-text-primary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-accent hover:bg-accent-light text-white font-bold text-xs shadow-md"
                >
                  Create Notebook
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── JOIN SHARED NOTEBOOK MODAL ── */}
      {showJoinModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-surface border border-border-subtle rounded-3xl p-6 w-full max-w-sm shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-xl bg-accent/20 text-accent flex items-center justify-center">
                  <Hash className="h-4 w-4" />
                </div>
                <h3 className="font-bold text-sm text-text-primary">Join Shared Notebook</h3>
              </div>
              <button
                onClick={() => setShowJoinModal(false)}
                className="text-text-muted hover:text-text-primary p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-text-muted">
              Enter the unique Room Code shared by your peer to join their notebook in real time.
            </p>

            <form onSubmit={handleJoin} className="space-y-3">
              <input
                type="text"
                placeholder="e.g., collab-dsa-room-1"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value)}
                className="w-full bg-card border border-border-subtle rounded-xl px-3.5 py-2.5 text-xs text-text-primary font-mono focus:outline-none focus:border-accent"
                autoFocus
                required
              />

              {joinError && <p className="text-xs text-semantic-red font-semibold">{joinError}</p>}

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowJoinModal(false)}
                  className="px-3 py-1.5 rounded-xl border border-border-subtle text-xs font-bold text-text-muted hover:text-text-primary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isJoining}
                  className="px-4 py-2 rounded-xl bg-accent hover:bg-accent-light text-white font-bold text-xs shadow-md disabled:opacity-60"
                >
                  {isJoining ? 'Joining...' : 'Connect to Notebook'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── SHARE COLLABORATIVE NOTEBOOK MODAL ── */}
      {shareModalTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-surface border border-border-subtle rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-2xl bg-accent/20 text-accent flex items-center justify-center">
                  <Share2 className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-text-primary">Share Collaborative Notebook</h3>
                  <p className="text-[11px] text-text-muted">{shareModalTarget.title}</p>
                </div>
              </div>
              <button
                onClick={() => setShareModalTarget(null)}
                className="text-text-muted hover:text-text-primary p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <div className="p-3.5 rounded-2xl bg-card border border-border-subtle space-y-2">
              <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">
                Direct Collaborative Link
              </label>
              <div className="flex items-center justify-between gap-2 bg-base px-3 py-2 rounded-xl border border-border-subtle">
                <span className="text-xs font-mono text-accent truncate flex-1">
                  {`${window.location.origin}/notes?room=${shareModalTarget.collabRoomId}`}
                </span>
                <button
                  onClick={() => {
                    const link = `${window.location.origin}/notes?room=${shareModalTarget.collabRoomId}`
                    navigator.clipboard.writeText(link)
                    setShareCopied(true)
                    setTimeout(() => setShareCopied(false), 2500)
                  }}
                  className="px-3 py-1 rounded-lg bg-accent text-white text-xs font-bold flex items-center gap-1 shrink-0 shadow-xs"
                >
                  {shareCopied ? <Check className="h-3 w-3 text-emerald-300" /> : <Copy className="h-3 w-3" />}
                  <span>{shareCopied ? 'Copied!' : 'Copy Link'}</span>
                </button>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-accent/10 border border-accent/20 space-y-1.5 text-xs text-text-secondary">
              <div className="flex items-center gap-2 font-bold text-accent">
                <Users className="h-4 w-4" />
                <span>How collaboration works:</span>
              </div>
              <ul className="space-y-1 pl-5 list-disc text-[11px] text-text-muted leading-relaxed">
                <li><strong className="text-text-primary">Registered users:</strong> Opening this link immediately opens the notebook and adds it to their collaborative notes list.</li>
                <li><strong className="text-text-primary">New visitors:</strong> They will land on Placify and be prompted to sign up/login to automatically open this notebook.</li>
              </ul>
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] font-mono text-text-muted">
                Room ID: #{shareModalTarget.collabRoomId}
              </span>
              <button
                type="button"
                onClick={() => setShareModalTarget(null)}
                className="px-4 py-2 rounded-xl bg-card border border-border-subtle hover:bg-hover text-xs font-bold text-text-primary transition-all"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
