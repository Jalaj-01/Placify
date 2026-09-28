import { useState, useRef, useEffect } from 'react'
import {
  BookOpen, Plus, Users, Search, Trash2, ArrowLeft, Save,
  Bold, Italic, Underline, Strikethrough, List, ListOrdered, Link2,
  Undo, Redo, Check, Copy, Hash, Send, FileText, CheckSquare,
  Quote, Minus, Eraser, AlignLeft, AlignCenter, AlignRight, AlignJustify,
  Highlighter, Palette, Download, Printer, StickyNote, Pin, Eye, Sparkles
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useNotebooks } from '@/hooks/useNotebooks'
import { useStickyNotes } from '@/hooks/useStickyNotes'
import { cn } from '@/lib/utils'

const PAPER_THEMES = [
  { id: 'ruled', name: 'Ruled Lines', class: 'paper-ruled' },
  { id: 'clean', name: 'Clean Paper', class: 'paper-clean' },
  { id: 'grid', name: 'Graph Grid', class: 'paper-grid' },
  { id: 'sepia', name: 'Warm Parchment', class: 'paper-sepia' },
  { id: 'dark', name: 'Dark Theme', class: 'paper-dark' },
]

const TEXT_COLORS = [
  { label: 'Default', value: 'inherit' },
  { label: 'Indigo', value: '#6366f1' },
  { label: 'Emerald', value: '#10b981' },
  { label: 'Rose', value: '#f43f5e' },
  { label: 'Amber', value: '#f59e0b' },
  { label: 'Sky Blue', value: '#0ea5e9' },
  { label: 'Purple', value: '#a855f7' },
]

const HIGHLIGHT_COLORS = [
  { label: 'None', value: 'transparent' },
  { label: 'Yellow Marker', value: '#fef08a' },
  { label: 'Mint Marker', value: '#bbf7d0' },
  { label: 'Pink Marker', value: '#fbcfe8' },
  { label: 'Sky Marker', value: '#bae6fd' },
]

const COLOR_OPTIONS = [
  { id: 'yellow', name: 'Yellow', borderClass: 'border-amber-500/40 bg-amber-500/10 text-amber-900 dark:text-amber-200', dotClass: 'bg-amber-400' },
  { id: 'pink', name: 'Pink', borderClass: 'border-rose-500/40 bg-rose-500/10 text-rose-900 dark:text-rose-200', dotClass: 'bg-rose-400' },
  { id: 'blue', name: 'Sky Blue', borderClass: 'border-sky-500/40 bg-sky-500/10 text-sky-900 dark:text-sky-200', dotClass: 'bg-sky-400' },
  { id: 'green', name: 'Mint Green', borderClass: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-900 dark:text-emerald-200', dotClass: 'bg-emerald-400' },
  { id: 'purple', name: 'Purple', borderClass: 'border-purple-500/40 bg-purple-500/10 text-purple-900 dark:text-purple-200', dotClass: 'bg-purple-400' },
  { id: 'orange', name: 'Orange', borderClass: 'border-orange-500/40 bg-orange-500/10 text-orange-900 dark:text-orange-200', dotClass: 'bg-orange-400' },
]

export default function Notes() {
  const { user } = useAuth()
  const [activeMainTab, setActiveMainTab] = useState('notebooks') // 'notebooks' | 'stickies'

  // Collaborative Notebook Hook
  const {
    notebooks,
    activeNotebook,
    activeNotebookId,
    setActiveNotebookId,
    activePage,
    activePageId,
    setActivePageId,
    activeCollaborators,
    typingStatus,
    createNotebook,
    updateNotebook,
    deleteNotebook,
    addPage,
    deletePage,
    renamePage,
    updatePageContent,
    joinSharedNotebook,
    sendPeerInvite,
    emitTyping,
  } = useNotebooks(user)

  // Sticky Notes Hook
  const { notes, addNote, updateNote, deleteNote } = useStickyNotes(user?.uid)

  // Document Editor State
  const editorRef = useRef(null)
  const [editingTitle, setEditingTitle] = useState('')
  const [editingPageTitle, setEditingPageTitle] = useState('')
  const [showCollabModal, setShowCollabModal] = useState(false)
  const [showCreateNbModal, setShowCreateNbModal] = useState(false)
  const [showJoinNbModal, setShowJoinNbModal] = useState(false)

  // Create Notebook Form
  const [newNbTitle, setNewNbTitle] = useState('')
  const [newNbSubject, setNewNbSubject] = useState('DSA')
  const [newNbStyle, setNewNbStyle] = useState('ruled')
  const [newNbCollab, setNewNbCollab] = useState(true)

  // Join Room Form
  const [joinCodeInput, setJoinCodeInput] = useState('')
  const [joinError, setJoinError] = useState('')
  const [isJoining, setIsJoining] = useState(false)

  // Invite Form
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteMsg, setInviteMsg] = useState('')
  const [isSendingInvite, setIsSendingInvite] = useState(false)
  const [copiedCode, setCopiedCode] = useState(false)

  // Sticky Notes Search & Filter
  const [stickySearch, setStickySearch] = useState('')
  const [stickyFilter, setStickyFilter] = useState('ALL')
  const [newStickyTitle, setNewStickyTitle] = useState('')
  const [newStickyBody, setNewStickyBody] = useState('')
  const [newStickyColor, setNewStickyColor] = useState('yellow')
  const [isCreatingSticky, setIsCreatingSticky] = useState(false)

  // Statistics
  const [stats, setStats] = useState({ words: 0, chars: 0, readingTime: '1 min' })

  // Synchronize document editor when activePage changes
  useEffect(() => {
    if (editorRef.current && activePage) {
      const pageHtml = activePage.htmlContent || ''
      if (editorRef.current.innerHTML !== pageHtml) {
        editorRef.current.innerHTML = pageHtml
      }
      updateStats(editorRef.current.innerText || '')
    }
  }, [activePage?.id])

  useEffect(() => {
    setEditingTitle(activeNotebook?.title || '')
  }, [activeNotebook?.title])

  useEffect(() => {
    setEditingPageTitle(activePage?.title || '')
  }, [activePage?.title])

  const updateStats = (text) => {
    const cleanText = text.trim()
    const words = cleanText ? cleanText.split(/\s+/).length : 0
    const chars = cleanText.length
    const readingTime = `${Math.max(1, Math.ceil(words / 200))} min read`
    setStats({ words, chars, readingTime })
  }

  // Execute Rich Text Formatting via document.execCommand
  const execCmd = (command, value = null) => {
    if (!editorRef.current) return
    editorRef.current.focus()
    document.execCommand(command, false, value)
    handleEditorInput()
  }

  // Handle typing inside editor
  const handleEditorInput = () => {
    if (!editorRef.current || !activeNotebook || !activePage) return
    const html = editorRef.current.innerHTML
    updateStats(editorRef.current.innerText || '')
    updatePageContent(activeNotebook.id, activePage.id, html)
    emitTyping(activePage.id, true)
  }

  // Insert an interactive task checklist item directly into document
  const insertTaskItem = () => {
    if (!editorRef.current) return
    editorRef.current.focus()
    const taskHtml = `<div style="display: flex; align-items: center; gap: 8px; margin: 6px 0;"><input type="checkbox" style="width: 16px; height: 16px; cursor: pointer; accent-color: #6366f1;" /> <span>Checklist task item...</span></div><p></p>`
    document.execCommand('insertHTML', false, taskHtml)
    handleEditorInput()
  }

  const handleCreateNotebook = async (e) => {
    e.preventDefault()
    if (!newNbTitle.trim()) return

    const nb = await createNotebook({
      title: newNbTitle.trim(),
      subject: newNbSubject,
      paperStyle: newNbStyle,
      isCollaborative: newNbCollab,
    })

    setShowCreateNbModal(false)
    setNewNbTitle('')
    if (nb?.id) setActiveNotebookId(nb.id)
  }

  const handleJoinNotebook = async (e) => {
    e.preventDefault()
    if (!joinCodeInput.trim()) return
    setIsJoining(true)
    setJoinError('')

    const res = await joinSharedNotebook(joinCodeInput.trim())
    setIsJoining(false)

    if (res?.success) {
      setShowJoinNbModal(false)
      setJoinCodeInput('')
      if (res.notebook?.id) setActiveNotebookId(res.notebook.id)
    } else {
      setJoinError(res?.error || 'Failed to join notebook room.')
    }
  }

  const handleSendInviteSubmit = async (e) => {
    e.preventDefault()
    if (!inviteEmail.trim() || !activeNotebook) return
    setIsSendingInvite(true)
    setInviteMsg('')

    const res = await sendPeerInvite(inviteEmail.trim(), activeNotebook.title, activeNotebook.collabRoomId)
    setIsSendingInvite(false)

    if (res?.success) {
      setInviteMsg(`Invite sent to ${res.targetUser?.displayName || inviteEmail}!`)
      setInviteEmail('')
      setTimeout(() => setInviteMsg(''), 3000)
    } else {
      setInviteMsg(res?.error || 'Failed to send invite.')
    }
  }

  const handleCreateSticky = async (e) => {
    e.preventDefault()
    if (!newStickyTitle.trim() && !newStickyBody.trim()) {
      setIsCreatingSticky(false)
      return
    }

    await addNote({
      title: newStickyTitle.trim() || 'Untitled Note',
      content: newStickyBody.trim(),
      color: newStickyColor,
      isPinned: false,
    })

    setNewStickyTitle('')
    setNewStickyBody('')
    setIsCreatingSticky(false)
  }

  const currentTheme = PAPER_THEMES.find((t) => t.id === (activeNotebook?.paperStyle || 'ruled')) || PAPER_THEMES[0]

  return (
    <div className="flex flex-col h-[calc(100vh-100px)] min-h-[640px] rounded-3xl border border-border-subtle bg-surface/80 backdrop-blur-xl shadow-2xl overflow-hidden text-text-primary">
      {/* ── TOP LEVEL NAVIGATION HEADER ── */}
      <div className="px-5 py-3 border-b border-border-subtle bg-surface/90 flex items-center justify-between gap-3 shrink-0 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-accent/20 text-accent flex items-center justify-center shadow-sm">
            <BookOpen className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-text-primary tracking-tight">Notes &amp; Notebook Hub</h1>
              <span className="px-2 py-0.5 rounded-full bg-semantic-green/15 text-semantic-green text-[10px] font-bold border border-semantic-green/30 flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-semantic-green animate-pulse" /> Live Collab
              </span>
            </div>
            <p className="text-xs text-text-muted">Full-screen rich document editor, study notes &amp; live peer sharing</p>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-card rounded-2xl border border-border-subtle">
          <button
            onClick={() => setActiveMainTab('notebooks')}
            className={cn(
              'flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all',
              activeMainTab === 'notebooks'
                ? 'bg-accent text-white shadow-sm'
                : 'text-text-muted hover:text-text-primary'
            )}
          >
            <BookOpen className="h-3.5 w-3.5" />
            <span>Notebook Documents</span>
          </button>

          <button
            onClick={() => setActiveMainTab('stickies')}
            className={cn(
              'flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all',
              activeMainTab === 'stickies'
                ? 'bg-amber-400 text-slate-900 shadow-sm'
                : 'text-text-muted hover:text-text-primary'
            )}
          >
            <StickyNote className="h-3.5 w-3.5" />
            <span>Sticky Notes Wall</span>
          </button>
        </div>
      </div>

      {/* ── MAIN WORKSPACE CONTENT ── */}
      {activeMainTab === 'notebooks' ? (
        <div className="flex-1 flex overflow-hidden">
          {/* ── LEFT NOTEBOOK SHELF & CHAPTER SELECTOR (320px) ── */}
          <div className="w-72 lg:w-80 border-r border-border-subtle bg-surface/50 flex flex-col shrink-0 overflow-hidden">
            {/* Shelf Header */}
            <div className="p-3.5 border-b border-border-subtle bg-surface/40 flex items-center justify-between shrink-0">
              <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">
                My Notebooks ({notebooks.length})
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setShowJoinNbModal(true)}
                  className="p-1.5 rounded-xl border border-border-subtle hover:bg-hover text-text-muted hover:text-text-primary text-xs font-bold flex items-center gap-1"
                  title="Join Notebook with Code"
                >
                  <Hash className="h-3.5 w-3.5 text-accent" />
                </button>
                <button
                  onClick={() => setShowCreateNbModal(true)}
                  className="px-2.5 py-1 rounded-xl bg-accent hover:bg-accent-light text-white text-xs font-bold flex items-center gap-1 shadow-sm"
                  title="Create New Notebook"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>New</span>
                </button>
              </div>
            </div>

            {/* Notebooks List */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2 scrollbar-thin">
              {notebooks.map((nb) => {
                const isSelected = nb.id === activeNotebook?.id
                return (
                  <div
                    key={nb.id}
                    onClick={() => setActiveNotebookId(nb.id)}
                    className={cn(
                      'group p-3 rounded-2xl border transition-all cursor-pointer relative overflow-hidden',
                      isSelected
                        ? 'border-accent bg-accent/10 shadow-sm'
                        : 'border-border-subtle bg-card/60 hover:bg-card hover:border-border-subtle'
                    )}
                  >
                    <div className="flex items-start justify-between gap-1.5">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="px-1.5 py-0.2 rounded-md bg-accent/15 text-accent text-[9px] font-bold uppercase">
                            {nb.subject || 'DSA'}
                          </span>
                          {nb.isCollaborative && (
                            <span className="text-[9px] text-semantic-green font-bold flex items-center gap-0.5">
                              <span className="h-1.5 w-1.5 rounded-full bg-semantic-green animate-pulse" /> Live
                            </span>
                          )}
                        </div>
                        <h4 className={cn('text-xs font-bold truncate mt-1', isSelected ? 'text-accent' : 'text-text-primary')}>
                          {nb.title}
                        </h4>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          deleteNotebook(nb.id)
                        }}
                        className="p-1 rounded-lg text-text-muted hover:text-semantic-red opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Delete Notebook"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-text-muted mt-2 pt-1 border-t border-border-subtle/50">
                      <span>{nb.pages?.length || 1} {nb.pages?.length === 1 ? 'Page' : 'Pages'}</span>
                      {nb.collabRoomId && <span className="font-mono opacity-70">#{nb.collabRoomId}</span>}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Pages & Chapters of Active Notebook */}
            {activeNotebook && (
              <div className="p-3 border-t border-border-subtle bg-surface/70 space-y-2 shrink-0 max-h-56 overflow-y-auto scrollbar-thin">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted">
                    Chapters / Pages
                  </span>
                  <button
                    onClick={() => addPage(activeNotebook.id)}
                    className="text-xs text-accent hover:text-accent-light font-bold flex items-center gap-1"
                  >
                    <Plus className="h-3 w-3" /> Add Page
                  </button>
                </div>

                <div className="space-y-1">
                  {activeNotebook.pages?.map((page, idx) => {
                    const isPageActive = page.id === activePage?.id
                    return (
                      <div
                        key={page.id}
                        onClick={() => setActivePageId(page.id)}
                        className={cn(
                          'flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-medium cursor-pointer transition-colors',
                          isPageActive
                            ? 'bg-accent text-white font-bold shadow-xs'
                            : 'text-text-secondary hover:bg-hover hover:text-text-primary'
                        )}
                      >
                        <span className="truncate flex-1">{page.title || `Page ${idx + 1}`}</span>
                        {activeNotebook.pages.length > 1 && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              deletePage(activeNotebook.id, page.id)
                            }}
                            className={cn(
                              'p-0.5 rounded ml-1',
                              isPageActive ? 'text-white/80 hover:text-white' : 'text-text-muted hover:text-semantic-red'
                            )}
                            title="Delete Page"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          {/* ── RIGHT MAIN DOCUMENT CANVAS ── */}
          <div className="flex-1 flex flex-col h-full bg-base overflow-hidden">
            {/* Document Header Controls */}
            <div className="p-3.5 border-b border-border-subtle bg-surface/90 backdrop-blur-md flex items-center justify-between gap-3 shrink-0 flex-wrap">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <input
                  type="text"
                  value={editingPageTitle}
                  onChange={(e) => setEditingPageTitle(e.target.value)}
                  onBlur={() => {
                    if (editingPageTitle.trim() && activeNotebook && activePage) {
                      renamePage(activeNotebook.id, activePage.id, editingPageTitle.trim())
                    }
                  }}
                  className="text-base sm:text-lg font-black text-text-primary bg-transparent border-b border-transparent hover:border-border-subtle focus:border-accent focus:outline-none transition-colors truncate max-w-sm sm:max-w-md px-1"
                  placeholder="Page Title"
                  title="Click to rename this page"
                />
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {/* Paper Style Selector */}
                <select
                  value={activeNotebook?.paperStyle || 'ruled'}
                  onChange={(e) => updateNotebook(activeNotebook.id, { paperStyle: e.target.value })}
                  className="text-xs py-1 pl-2.5 pr-6"
                  title="Paper Theme Style"
                >
                  {PAPER_THEMES.map((t) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>

                {/* Collaborate Live Button */}
                <button
                  onClick={() => setShowCollabModal(true)}
                  className={cn(
                    'px-3 py-1.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs',
                    activeNotebook?.isCollaborative
                      ? 'bg-semantic-green/15 text-semantic-green border-semantic-green/30 hover:bg-semantic-green/25'
                      : 'bg-card border-border-subtle hover:bg-hover text-text-secondary'
                  )}
                >
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-semantic-green opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-semantic-green" />
                  </span>
                  <Users className="h-3.5 w-3.5" />
                  <span>Share &amp; Collab</span>
                  {activeCollaborators.length > 0 && (
                    <span className="ml-1 px-1.5 py-0.2 rounded-full bg-semantic-green/20 text-semantic-green text-[10px] font-mono">
                      {activeCollaborators.length + 1}
                    </span>
                  )}
                </button>

                {/* Print / Save PDF */}
                <button
                  onClick={() => window.print()}
                  className="p-1.5 rounded-xl border border-border-subtle hover:bg-hover text-text-muted hover:text-text-primary transition-colors"
                  title="Print / Save as PDF"
                >
                  <Printer className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* ── RICH TEXT FORMATTING TOOLBAR (Google Docs / Word Style) ── */}
            <div className="px-4 py-2 border-b border-border-subtle bg-surface/95 flex items-center gap-1 flex-wrap shrink-0 text-text-secondary shadow-xs">
              {/* Undo / Redo */}
              <button
                type="button"
                onClick={() => execCmd('undo')}
                className="p-1.5 rounded-lg hover:bg-hover hover:text-text-primary transition-colors"
                title="Undo (Ctrl+Z)"
              >
                <Undo className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => execCmd('redo')}
                className="p-1.5 rounded-lg hover:bg-hover hover:text-text-primary transition-colors"
                title="Redo (Ctrl+Y)"
              >
                <Redo className="h-3.5 w-3.5" />
              </button>

              <div className="h-4 w-px bg-border-subtle mx-1" />

              {/* Heading Selector */}
              <select
                onChange={(e) => {
                  if (e.target.value === 'p') execCmd('formatBlock', '<p>')
                  else execCmd('formatBlock', `<${e.target.value}>`)
                }}
                className="text-xs py-1 px-2.5 bg-card border border-border-subtle rounded-lg font-bold"
                defaultValue="p"
                title="Heading Style"
              >
                <option value="p">Normal Text</option>
                <option value="h1">Heading 1 (Title)</option>
                <option value="h2">Heading 2 (Section)</option>
                <option value="h3">Heading 3 (Subhead)</option>
              </select>

              <div className="h-4 w-px bg-border-subtle mx-1" />

              {/* Bold, Italic, Underline, Strikethrough */}
              <button
                type="button"
                onClick={() => execCmd('bold')}
                className="p-1.5 rounded-lg hover:bg-hover hover:text-text-primary font-bold text-xs"
                title="Bold (Ctrl+B)"
              >
                <Bold className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => execCmd('italic')}
                className="p-1.5 rounded-lg hover:bg-hover hover:text-text-primary text-xs"
                title="Italic (Ctrl+I)"
              >
                <Italic className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => execCmd('underline')}
                className="p-1.5 rounded-lg hover:bg-hover hover:text-text-primary text-xs"
                title="Underline (Ctrl+U)"
              >
                <Underline className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => execCmd('strikeThrough')}
                className="p-1.5 rounded-lg hover:bg-hover hover:text-text-primary text-xs"
                title="Strikethrough"
              >
                <Strikethrough className="h-3.5 w-3.5" />
              </button>

              <div className="h-4 w-px bg-border-subtle mx-1" />

              {/* Font Color */}
              <select
                onChange={(e) => execCmd('foreColor', e.target.value)}
                className="text-xs py-1 px-2 bg-card border border-border-subtle rounded-lg font-bold"
                title="Text Color"
              >
                {TEXT_COLORS.map((c) => (
                  <option key={c.label} value={c.value}>{c.label}</option>
                ))}
              </select>

              {/* Highlighter Marker */}
              <select
                onChange={(e) => execCmd('hiliteColor', e.target.value)}
                className="text-xs py-1 px-2 bg-card border border-border-subtle rounded-lg font-bold"
                title="Highlight Marker"
              >
                {HIGHLIGHT_COLORS.map((c) => (
                  <option key={c.label} value={c.value}>{c.label}</option>
                ))}
              </select>

              <div className="h-4 w-px bg-border-subtle mx-1" />

              {/* Text Alignments */}
              <button
                type="button"
                onClick={() => execCmd('justifyLeft')}
                className="p-1.5 rounded-lg hover:bg-hover hover:text-text-primary"
                title="Align Left"
              >
                <AlignLeft className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => execCmd('justifyCenter')}
                className="p-1.5 rounded-lg hover:bg-hover hover:text-text-primary"
                title="Align Center"
              >
                <AlignCenter className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => execCmd('justifyRight')}
                className="p-1.5 rounded-lg hover:bg-hover hover:text-text-primary"
                title="Align Right"
              >
                <AlignRight className="h-3.5 w-3.5" />
              </button>

              <div className="h-4 w-px bg-border-subtle mx-1" />

              {/* Lists & Task Checklists */}
              <button
                type="button"
                onClick={() => execCmd('insertUnorderedList')}
                className="p-1.5 rounded-lg hover:bg-hover hover:text-text-primary"
                title="Bullet List"
              >
                <List className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => execCmd('insertOrderedList')}
                className="p-1.5 rounded-lg hover:bg-hover hover:text-text-primary"
                title="Numbered List"
              >
                <ListOrdered className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={insertTaskItem}
                className="p-1.5 rounded-lg hover:bg-hover hover:text-accent font-bold text-xs flex items-center gap-1"
                title="Insert Interactive Checklist Item"
              >
                <CheckSquare className="h-3.5 w-3.5 text-accent" />
                <span className="hidden xl:inline">Task Item</span>
              </button>

              <div className="h-4 w-px bg-border-subtle mx-1" />

              {/* Blockquote & Divider */}
              <button
                type="button"
                onClick={() => execCmd('formatBlock', '<blockquote>')}
                className="p-1.5 rounded-lg hover:bg-hover hover:text-text-primary"
                title="Blockquote"
              >
                <Quote className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => execCmd('insertHorizontalRule')}
                className="p-1.5 rounded-lg hover:bg-hover hover:text-text-primary"
                title="Insert Horizontal Divider Line"
              >
                <Minus className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => {
                  const url = prompt('Enter URL to insert hyperlink:', 'https://')
                  if (url) execCmd('createLink', url)
                }}
                className="p-1.5 rounded-lg hover:bg-hover hover:text-text-primary"
                title="Insert Hyperlink"
              >
                <Link2 className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => execCmd('removeFormat')}
                className="p-1.5 rounded-lg hover:bg-hover hover:text-semantic-red"
                title="Clear Formatting"
              >
                <Eraser className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Peer Typing Status Banner */}
            {typingStatus && (
              <div className="px-5 py-1.5 bg-accent/10 border-b border-accent/20 text-xs text-accent font-semibold flex items-center gap-2 shrink-0 animate-in fade-in">
                <span className="h-2 w-2 rounded-full bg-accent animate-pulse" />
                <span>{typingStatus.name} is currently typing in this notebook...</span>
              </div>
            )}

            {/* ── THE NOTEBOOK PAPER DOCUMENT (Full-Width Clean Workspace) ── */}
            <div className={cn('flex-1 overflow-y-auto p-4 sm:p-8 scrollbar-thin', currentTheme.class)}>
              <div className="max-w-4xl mx-auto bg-surface/90 dark:bg-surface/95 border border-border-subtle rounded-3xl p-6 sm:p-12 shadow-xl min-h-[600px] flex flex-col">
                <div
                  ref={editorRef}
                  contentEditable
                  suppressContentEditableWarning
                  onInput={handleEditorInput}
                  onKeyDown={(e) => {
                    if (e.ctrlKey || e.metaKey) {
                      const k = e.key.toLowerCase()
                      if (k === 'b') {
                        e.preventDefault()
                        execCmd('bold')
                      } else if (k === 'i') {
                        e.preventDefault()
                        execCmd('italic')
                      } else if (k === 'u') {
                        e.preventDefault()
                        execCmd('underline')
                      }
                    }
                  }}
                  className="notebook-document flex-1"
                />
              </div>
            </div>

            {/* ── BOTTOM STATS FOOTER ── */}
            <div className="px-6 py-2.5 border-t border-border-subtle bg-surface/90 text-xs text-text-muted flex items-center justify-between shrink-0 font-medium">
              <div className="flex items-center gap-4">
                <span>{stats.words} words</span>
                <span>{stats.chars} characters</span>
                <span>{stats.readingTime}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1.5 text-semantic-green">
                  <Check className="h-3.5 w-3.5" /> All edits saved live
                </span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* ── TAB 2: STICKY NOTES WALL ── */
        <div className="flex-1 flex flex-col overflow-hidden bg-base/50 p-4 sm:p-6 space-y-4">
          <div className="flex items-center justify-between gap-3 shrink-0 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-2xl bg-amber-500/20 text-amber-500 flex items-center justify-center">
                <StickyNote className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-text-primary">Quick Sticky Notes Wall</h2>
                <p className="text-xs text-text-muted">Jot down rapid thoughts, memos, and placement reminders</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-text-muted" />
                <input
                  type="text"
                  placeholder="Search sticky notes..."
                  value={stickySearch}
                  onChange={(e) => setStickySearch(e.target.value)}
                  className="bg-card border border-border-subtle rounded-xl pl-8 pr-3 py-1.5 text-xs text-text-primary focus:outline-none focus:border-accent w-48"
                />
              </div>

              <button
                onClick={() => setIsCreatingSticky(true)}
                className="px-3.5 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-900 font-bold text-xs flex items-center gap-1 shadow-md"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>New Sticky</span>
              </button>
            </div>
          </div>

          {/* Quick Create Sticky Form */}
          {isCreatingSticky && (
            <form onSubmit={handleCreateSticky} className="p-4 rounded-2xl bg-card border border-amber-400/50 shadow-lg space-y-3 max-w-lg animate-in fade-in">
              <input
                type="text"
                placeholder="Sticky note title..."
                value={newStickyTitle}
                onChange={(e) => setNewStickyTitle(e.target.value)}
                className="w-full bg-base border border-border-subtle rounded-xl px-3 py-2 text-xs font-bold text-text-primary focus:outline-none focus:border-amber-400"
                autoFocus
              />
              <textarea
                rows={3}
                placeholder="Write your note body content..."
                value={newStickyBody}
                onChange={(e) => setNewStickyBody(e.target.value)}
                className="w-full bg-base border border-border-subtle rounded-xl px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-amber-400 resize-none"
              />

              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-1.5">
                  {COLOR_OPTIONS.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setNewStickyColor(c.id)}
                      className={cn(
                        'h-6 w-6 rounded-full transition-transform',
                        c.dotClass,
                        newStickyColor === c.id ? 'scale-125 ring-2 ring-accent' : 'opacity-70 hover:opacity-100'
                      )}
                    />
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsCreatingSticky(false)}
                    className="px-2.5 py-1 rounded-lg text-xs text-text-muted hover:text-text-primary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-3.5 py-1 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-900 font-bold text-xs"
                  >
                    Save Note
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* Sticky Notes Cards Grid */}
          <div className="flex-1 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-1 scrollbar-thin">
            {notes
              .filter((n) => {
                const q = stickySearch.toLowerCase()
                return (
                  (n.title && n.title.toLowerCase().includes(q)) ||
                  (n.content && n.content.toLowerCase().includes(q))
                )
              })
              .map((note) => {
                const theme = COLOR_OPTIONS.find((c) => c.id === note.color) || COLOR_OPTIONS[0]
                return (
                  <div
                    key={note.id}
                    className={cn(
                      'p-4 rounded-3xl border transition-all duration-200 relative group flex flex-col justify-between shadow-sm hover:shadow-lg',
                      theme.borderClass
                    )}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-1 pb-1">
                        <h4 className="font-bold text-xs tracking-tight text-text-primary truncate flex-1">
                          {note.title || 'Untitled'}
                        </h4>
                        <div className="flex items-center gap-1 opacity-70 group-hover:opacity-100">
                          <button
                            onClick={() => updateNote(note.id, { isPinned: !note.isPinned })}
                            className={cn('p-1 rounded', note.isPinned ? 'text-amber-500' : 'text-text-muted')}
                            title={note.isPinned ? 'Unpin' : 'Pin'}
                          >
                            <Pin className="h-3 w-3" />
                          </button>
                          <button
                            onClick={() => deleteNote(note.id)}
                            className="p-1 rounded text-text-muted hover:text-semantic-red"
                            title="Delete"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      </div>

                      <div
                        className="text-xs text-text-secondary line-clamp-5 leading-relaxed mt-1.5"
                        dangerouslySetInnerHTML={{ __html: note.content || '' }}
                      />
                    </div>

                    <div className="pt-3 mt-3 border-t border-border-subtle/40 text-[10px] text-text-muted flex items-center justify-between">
                      <span>{note.createdAt ? new Date(note.createdAt).toLocaleDateString() : 'Just now'}</span>
                      {note.isPinned && <span className="font-bold text-amber-500">Pinned</span>}
                    </div>
                  </div>
                )
              })}
          </div>
        </div>
      )}

      {/* ── MODAL 1: CREATE NOTEBOOK ── */}
      {showCreateNbModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-surface border border-border-subtle rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-accent" />
                <h3 className="font-bold text-sm text-text-primary">Create New Notebook</h3>
              </div>
              <button onClick={() => setShowCreateNbModal(false)} className="text-text-muted hover:text-text-primary">✕</button>
            </div>

            <form onSubmit={handleCreateNotebook} className="space-y-3.5">
              <div>
                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block mb-1">
                  Notebook Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Operating Systems &amp; Concurrency"
                  value={newNbTitle}
                  onChange={(e) => setNewNbTitle(e.target.value)}
                  className="w-full bg-card border border-border-subtle rounded-xl px-3.5 py-2.5 text-xs text-text-primary focus:outline-none focus:border-accent"
                  autoFocus
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block mb-1">
                    Subject
                  </label>
                  <select
                    value={newNbSubject}
                    onChange={(e) => setNewNbSubject(e.target.value)}
                    className="w-full"
                  >
                    <option value="DSA">DSA</option>
                    <option value="System Design">System Design</option>
                    <option value="Core CS">Core CS (OS/DBMS/CN)</option>
                    <option value="Web Dev">Web Development</option>
                    <option value="Interview Prep">Interview Prep</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block mb-1">
                    Paper Style
                  </label>
                  <select
                    value={newNbStyle}
                    onChange={(e) => setNewNbStyle(e.target.value)}
                    className="w-full"
                  >
                    {PAPER_THEMES.map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-card border border-border-subtle flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-text-primary">Enable Live Collaboration</p>
                  <p className="text-[10px] text-text-muted">Allows peers to co-edit notes in real time</p>
                </div>
                <input
                  type="checkbox"
                  checked={newNbCollab}
                  onChange={(e) => setNewNbCollab(e.target.checked)}
                  className="h-4 w-4 rounded accent-indigo-600 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateNbModal(false)}
                  className="px-3 py-1.5 rounded-xl border border-border-subtle text-xs font-bold text-text-muted"
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

      {/* ── MODAL 2: JOIN SHARED NOTEBOOK ── */}
      {showJoinNbModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-surface border border-border-subtle rounded-3xl p-6 w-full max-w-sm shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Hash className="h-5 w-5 text-accent" />
                <h3 className="font-bold text-sm text-text-primary">Join Shared Notebook</h3>
              </div>
              <button onClick={() => setShowJoinNbModal(false)} className="text-text-muted hover:text-text-primary">✕</button>
            </div>

            <form onSubmit={handleJoinNotebook} className="space-y-3">
              <input
                type="text"
                placeholder="Enter Room Code (e.g., nb-dsa-room-1)"
                value={joinCodeInput}
                onChange={(e) => setJoinCodeInput(e.target.value)}
                className="w-full bg-card border border-border-subtle rounded-xl px-3.5 py-2.5 text-xs text-text-primary font-mono focus:outline-none focus:border-accent"
                autoFocus
                required
              />

              {joinError && <p className="text-xs text-semantic-red font-semibold">{joinError}</p>}

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowJoinNbModal(false)}
                  className="px-3 py-1.5 rounded-xl border border-border-subtle text-xs font-bold text-text-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isJoining}
                  className="px-4 py-2 rounded-xl bg-accent hover:bg-accent-light text-white font-bold text-xs shadow-md disabled:opacity-50"
                >
                  {isJoining ? 'Connecting...' : 'Join Notebook'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL 3: SHARE & COLLABORATE POPUP ── */}
      {showCollabModal && activeNotebook && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-surface border border-border-subtle rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-2xl bg-semantic-green/20 text-semantic-green flex items-center justify-center">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-text-primary">Live Peer Collaboration</h3>
                  <p className="text-[11px] text-text-muted">Type and format notes together in real-time</p>
                </div>
              </div>
              <button onClick={() => setShowCollabModal(false)} className="text-text-muted hover:text-text-primary">✕</button>
            </div>

            {/* Room Code Box */}
            <div className="p-3.5 rounded-2xl bg-card border border-border-subtle space-y-1.5">
              <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">
                Shareable Room Code
              </label>
              <div className="flex items-center justify-between gap-2 bg-base px-3 py-2 rounded-xl border border-border-subtle">
                <div className="flex items-center gap-2 font-mono text-xs font-bold text-accent">
                  <Hash className="h-4 w-4" />
                  <span>{activeNotebook.collabRoomId}</span>
                </div>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(activeNotebook.collabRoomId)
                    setCopiedCode(true)
                    setTimeout(() => setCopiedCode(false), 2000)
                  }}
                  className="px-2 py-1 rounded-lg bg-accent/15 text-accent hover:bg-accent hover:text-white text-xs font-bold flex items-center gap-1"
                >
                  {copiedCode ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                  <span>{copiedCode ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>

            {/* Active Members */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">
                Active in this Session ({activeCollaborators.length + 1})
              </label>
              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-semantic-green/15 text-semantic-green text-xs font-semibold border border-semantic-green/30">
                  <span className="h-2 w-2 rounded-full bg-semantic-green animate-pulse" />
                  <span>You (Host)</span>
                </div>
                {activeCollaborators.map((c, i) => (
                  <div key={i} className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-accent/15 text-accent text-xs font-semibold border border-accent/30">
                    <span className="h-2 w-2 rounded-full bg-accent" />
                    <span>{c.name || 'Peer'}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Invite Direct by Email */}
            <form onSubmit={handleSendInviteSubmit} className="space-y-2 pt-2 border-t border-border-subtle">
              <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">
                Invite Peer Directly by Email
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="email"
                  placeholder="student@campus.edu"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="flex-1 bg-card border border-border-subtle rounded-xl px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-accent"
                />
                <button
                  type="submit"
                  disabled={isSendingInvite}
                  className="px-3.5 py-2 rounded-xl bg-accent hover:bg-accent-light text-white font-bold text-xs flex items-center gap-1 shadow-md disabled:opacity-50"
                >
                  <Send className="h-3 w-3" />
                  <span>{isSendingInvite ? 'Sending...' : 'Invite'}</span>
                </button>
              </div>
              {inviteMsg && <p className="text-xs font-semibold text-semantic-green">{inviteMsg}</p>}
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
