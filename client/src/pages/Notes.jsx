import { useState, useRef, useEffect } from 'react'
import {
  BookOpen, Plus, Users, Search, Trash2, ArrowLeft, Save,
  Bold, Italic, Underline, Strikethrough, List, ListOrdered, Link2,
  Undo, Redo, Check, Copy, Hash, Send, FileText, CheckSquare,
  Quote, Minus, Eraser, AlignLeft, AlignCenter, AlignRight, AlignJustify,
  Highlighter, Palette, Download, Printer, StickyNote, Pin, Eye, Sparkles, Share2
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

  // Dynamically compute subjects strictly from notebooks that exist
  const availableSubjects = [
    'ALL',
    ...Array.from(new Set(notebooks.map((nb) => nb.subject?.trim()).filter(Boolean)))
  ]
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState('ALL')

  // Sticky Notes Hook
  const { notes, addNote, updateNote, deleteNote } = useStickyNotes(user?.uid)

  // Document Editor State
  const editorRef = useRef(null)
  const [editingTitle, setEditingTitle] = useState('')
  const [editingPageTitle, setEditingPageTitle] = useState('')
  const [showCollabModal, setShowCollabModal] = useState(false)
  const [showCreateNbModal, setShowCreateNbModal] = useState(false)
  const [showJoinNbModal, setShowJoinNbModal] = useState(false)
  const [shareModalTarget, setShareModalTarget] = useState(null)
  const [shareCopied, setShareCopied] = useState(false)
  const [showLinkModal, setShowLinkModal] = useState(false)
  const [linkModalUrl, setLinkModalUrl] = useState('https://')
  const [linkModalText, setLinkModalText] = useState('')
  const savedRangeRef = useRef(null)

  // Create Notebook Form
  const [newNbTitle, setNewNbTitle] = useState('')
  const [newNbSubject, setNewNbSubject] = useState('DSA')
  const [customSubject, setCustomSubject] = useState('')
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
  const [copiedCardId, setCopiedCardId] = useState(null)

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

  // Synchronize print HTML content
  const [printHtmlContent, setPrintHtmlContent] = useState('')

  useEffect(() => {
    if (activePage?.htmlContent) {
      setPrintHtmlContent(activePage.htmlContent)
    }
  }, [activePage?.id, activePage?.htmlContent])

  const handlePrint = () => {
    const currentHtml = editorRef.current?.innerHTML || activePage?.htmlContent || ''
    setPrintHtmlContent(currentHtml)
    if (activeNotebook && activePage) {
      updatePageContent(activeNotebook.id, activePage.id, currentHtml)
    }
    setTimeout(() => {
      window.print()
    }, 100)
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

  // Open custom styled link insertion dialog
  const handleOpenLinkModal = () => {
    let selectedText = ''
    let range = null
    const sel = window.getSelection()
    if (sel && sel.rangeCount > 0) {
      range = sel.getRangeAt(0)
      selectedText = sel.toString().trim()
    }
    savedRangeRef.current = range
    setLinkModalText(selectedText || '')
    if (selectedText.startsWith('http://') || selectedText.startsWith('https://')) {
      setLinkModalUrl(selectedText)
    } else {
      setLinkModalUrl('https://')
    }
    setShowLinkModal(true)
  }

  // Apply hyperlink to selection or insert link tag
  const handleApplyLink = (e) => {
    if (e) e.preventDefault()
    let url = linkModalUrl.trim()
    if (!url || url === 'https://' || url === 'http://') {
      setShowLinkModal(false)
      return
    }

    if (!/^https?:\/\//i.test(url) && !/^mailto:/i.test(url) && !url.startsWith('/')) {
      url = `https://${url}`
    }

    if (editorRef.current) {
      editorRef.current.focus()
      const sel = window.getSelection()
      if (savedRangeRef.current) {
        sel.removeAllRanges()
        sel.addRange(savedRangeRef.current)
      }

      const currentSelText = sel.toString()
      const displayText = linkModalText.trim() || currentSelText || url

      if (currentSelText && (!linkModalText.trim() || linkModalText.trim() === currentSelText)) {
        document.execCommand('createLink', false, url)
      } else {
        const safeUrl = url.replace(/"/g, '&quot;')
        const safeText = displayText.replace(/</g, '&lt;').replace(/>/g, '&gt;')
        const linkHtml = `<a href="${safeUrl}" target="_blank" rel="noopener noreferrer" style="color: #6366f1; text-decoration: underline; font-weight: 500;">${safeText}</a>`
        document.execCommand('insertHTML', false, linkHtml)
      }

      handleEditorInput()
    }

    setShowLinkModal(false)
    setLinkModalUrl('https://')
    setLinkModalText('')
    savedRangeRef.current = null
  }

  const handleCreateNotebook = async (e) => {
    e.preventDefault()
    if (!newNbTitle.trim()) return

    const finalSubject = newNbSubject === 'Other' ? (customSubject.trim() || 'General') : newNbSubject

    const nb = await createNotebook({
      title: newNbTitle.trim(),
      subject: finalSubject,
      paperStyle: newNbStyle,
      isCollaborative: newNbCollab,
    })

    setShowCreateNbModal(false)
    setNewNbTitle('')
    setCustomSubject('')
    setNewNbSubject('DSA')
    if (nb?.id) setActiveNotebookId(nb.id)
  }

  const handleShareClick = (e, nb) => {
    e.stopPropagation()
    const shareUrl = `${window.location.origin}/notes?room=${nb.collabRoomId}`
    navigator.clipboard.writeText(shareUrl)
    setCopiedCardId(nb.id)
    setShareModalTarget(nb)
    setShareCopied(true)
    setTimeout(() => {
      setCopiedCardId(null)
      setShareCopied(false)
    }, 2500)
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
    <>
      <div className="notes-screen-workspace flex flex-col h-[calc(100vh-100px)] min-h-[640px] rounded-3xl border border-border-subtle bg-surface/80 backdrop-blur-xl shadow-2xl overflow-hidden text-text-primary print:hidden">
      {/* ── TOP LEVEL NAVIGATION HEADER ── */}
      <div className="px-5 py-3 border-b border-border-subtle bg-surface/90 flex items-center justify-between gap-3 shrink-0 flex-wrap print:hidden">
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
        <div className="flex-1 flex overflow-hidden print:overflow-visible">
          {/* ── LEFT NOTEBOOK SHELF & CHAPTER SELECTOR (320px) ── */}
          <div className="w-72 lg:w-80 border-r border-border-subtle bg-surface/50 flex flex-col shrink-0 overflow-hidden print:hidden">
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

            {/* Dynamic Subject Filter Pills (Only displays subjects of notebooks that actually exist) */}
            <div className="px-3 pt-2.5 pb-1 flex items-center gap-1 overflow-x-auto scrollbar-none shrink-0">
              {availableSubjects.map((sub) => (
                <button
                  key={sub}
                  onClick={() => setSelectedSubjectFilter(sub)}
                  className={cn(
                    'px-2 py-0.5 rounded-full text-[10px] font-semibold whitespace-nowrap transition-all',
                    selectedSubjectFilter === sub
                      ? 'bg-accent text-white font-bold shadow-xs'
                      : 'bg-card/70 text-text-muted hover:text-text-primary border border-border-subtle'
                  )}
                >
                  {sub}
                </button>
              ))}
            </div>

            {/* Notebooks List */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2 scrollbar-thin">
              {notebooks
                .filter((nb) => {
                  if (selectedSubjectFilter === 'ALL' || !availableSubjects.includes(selectedSubjectFilter)) return true
                  return nb.subject === selectedSubjectFilter
                })
                .length === 0 ? (
                <div className="h-48 flex flex-col items-center justify-center p-4 text-center text-text-muted">
                  <BookOpen className="h-8 w-8 opacity-30 mb-2" />
                  <p className="text-xs font-semibold">No notebooks available</p>
                  <button
                    onClick={() => setShowCreateNbModal(true)}
                    className="mt-3 px-3 py-1.5 rounded-xl bg-accent/15 hover:bg-accent/25 text-accent text-xs font-bold flex items-center gap-1 transition-all"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Create One</span>
                  </button>
                </div>
              ) : (
                notebooks
                  .filter((nb) => {
                    if (selectedSubjectFilter === 'ALL' || !availableSubjects.includes(selectedSubjectFilter)) return true
                    return nb.subject === selectedSubjectFilter
                  })
                  .map((nb) => {
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

                          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                            {nb.collabRoomId && (
                              <button
                                onClick={(e) => handleShareClick(e, nb)}
                                className="p-1 rounded-lg text-accent hover:bg-accent/15 transition-colors"
                                title="Share Collaborative Notebook Link"
                              >
                                {copiedCardId === nb.id ? (
                                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                                ) : (
                                  <Share2 className="h-3.5 w-3.5" />
                                )}
                              </button>
                            )}
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
                        </div>

                        <div className="flex items-center justify-between text-[10px] text-text-muted mt-2 pt-1 border-t border-border-subtle/50">
                          <span>{nb.pages?.length || 1} {nb.pages?.length === 1 ? 'Page' : 'Pages'}</span>
                          {nb.collabRoomId && <span className="font-mono opacity-70">#{nb.collabRoomId}</span>}
                        </div>
                      </div>
                    )
                  })
              )}
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
          {activeNotebook ? (
            <div className="flex-1 flex flex-col h-full bg-base overflow-hidden print:overflow-visible print:bg-white">
            {/* Document Header Controls */}
            <div className="p-3.5 border-b border-border-subtle bg-surface/90 backdrop-blur-md flex items-center justify-between gap-3 shrink-0 flex-wrap print:hidden">
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
                  className="text-base sm:text-lg font-black text-slate-900 dark:text-white bg-transparent border-b border-transparent hover:border-border-subtle focus:border-accent focus:outline-none transition-colors truncate max-w-sm sm:max-w-md px-1"
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
                  onClick={handlePrint}
                  className="px-2.5 py-1.5 rounded-xl border border-border-subtle hover:bg-hover text-text-muted hover:text-text-primary transition-colors flex items-center gap-1.5 text-xs font-bold shadow-xs active:scale-95"
                  title="Print / Export as A4 PDF"
                >
                  <Printer className="h-4 w-4 text-accent" />
                  <span className="hidden sm:inline">Export PDF (A4)</span>
                </button>
              </div>
            </div>

            {/* ── RICH TEXT FORMATTING TOOLBAR (Google Docs / Word Style) ── */}
            <div className="px-4 py-2 border-b border-border-subtle bg-surface/95 flex items-center gap-1 flex-wrap shrink-0 text-text-secondary shadow-xs print:hidden">
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
                onClick={handleOpenLinkModal}
                className="p-1.5 rounded-lg hover:bg-hover hover:text-text-primary transition-colors"
                title="Insert Hyperlink (Ctrl+K)"
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
              <div className="px-5 py-1.5 bg-accent/10 border-b border-accent/20 text-xs text-accent font-semibold flex items-center gap-2 shrink-0 animate-in fade-in print:hidden">
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
                      } else if (k === 'k') {
                        e.preventDefault()
                        handleOpenLinkModal()
                      }
                    }
                  }}
                  className="notebook-document flex-1"
                />
              </div>
            </div>

            {/* ── BOTTOM STATS FOOTER ── */}
            <div className="px-6 py-2.5 border-t border-border-subtle bg-surface/90 text-xs text-text-muted flex items-center justify-between shrink-0 font-medium print:hidden">
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
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-base">
              <div className="h-16 w-16 rounded-3xl bg-accent/10 border border-accent/20 flex items-center justify-center mb-4 text-accent shadow-lg shadow-accent/5">
                <BookOpen className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-black text-text-primary mb-2">No Notebooks Found</h3>
              <p className="text-sm text-text-muted max-w-md mb-6 leading-relaxed">
                All notebooks have been deleted. Create a new notebook or join a collaborative workspace to start taking notes.
              </p>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowCreateNbModal(true)}
                  className="px-5 py-2.5 rounded-xl bg-accent hover:bg-accent-light text-white font-bold text-sm flex items-center gap-2 shadow-md transition-all active:scale-95"
                >
                  <Plus className="h-4 w-4" />
                  <span>Create Notebook</span>
                </button>
                <button
                  onClick={() => setShowJoinNbModal(true)}
                  className="px-5 py-2.5 rounded-xl border border-border-subtle hover:bg-hover text-text-primary font-bold text-sm flex items-center gap-2 transition-all active:scale-95"
                >
                  <Hash className="h-4 w-4 text-accent" />
                  <span>Join with Code</span>
                </button>
              </div>
            </div>
          )}
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
                    <option value="Other">Other (Custom Subject)</option>
                  </select>

                  {newNbSubject === 'Other' && (
                    <div className="mt-2 animate-in fade-in">
                      <input
                        type="text"
                        placeholder="Type custom subject/domain..."
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

      {/* ── MODAL 3: SHARE & COLLABORATE POPUP (HOST / ACTIVE NOTEBOOK) ── */}
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

            {/* Direct Share Link Box */}
            <div className="p-3.5 rounded-2xl bg-card border border-border-subtle space-y-1.5">
              <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">
                Direct Collaborative Link
              </label>
              <div className="flex items-center justify-between gap-2 bg-base px-3 py-2 rounded-xl border border-border-subtle">
                <span className="text-xs font-mono text-accent truncate flex-1">
                  {`${window.location.origin}/notes?room=${activeNotebook.collabRoomId}`}
                </span>
                <button
                  onClick={() => {
                    const link = `${window.location.origin}/notes?room=${activeNotebook.collabRoomId}`
                    navigator.clipboard.writeText(link)
                    setCopiedCode(true)
                    setTimeout(() => setCopiedCode(false), 2000)
                  }}
                  className="px-2.5 py-1 rounded-lg bg-accent text-white hover:bg-accent-light text-xs font-bold flex items-center gap-1 shrink-0 shadow-xs"
                >
                  {copiedCode ? <Check className="h-3 w-3 text-emerald-300" /> : <Copy className="h-3 w-3" />}
                  <span>{copiedCode ? 'Copied Link!' : 'Copy Link'}</span>
                </button>
              </div>
            </div>

            {/* How collaboration works */}
            <div className="p-3 rounded-2xl bg-accent/10 border border-accent/20 space-y-1 text-xs text-text-secondary">
              <div className="flex items-center gap-2 font-bold text-accent">
                <Users className="h-3.5 w-3.5" />
                <span>Peer Access:</span>
              </div>
              <p className="text-[11px] text-text-muted leading-relaxed">
                Registered users who open this link immediately enter and add this notebook to their collaborative shelf. New visitors will be prompted to sign up or log in.
              </p>
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

      {/* ── MODAL 4: SHARE SPECIFIC NOTEBOOK CARD POPUP ── */}
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
              <button onClick={() => setShareModalTarget(null)} className="text-text-muted hover:text-text-primary p-1 rounded-lg">✕</button>
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
                <span>Instant Collaboration:</span>
              </div>
              <ul className="space-y-1 pl-5 list-disc text-[11px] text-text-muted leading-relaxed">
                <li><strong className="text-text-primary">Registered users:</strong> Directly open and automatically add this notebook into their collaborative notes.</li>
                <li><strong className="text-text-primary">New visitors:</strong> They land on Placify and are invited to sign in/register to automatically open this notebook.</li>
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

      {/* ── MODAL 5: CUSTOM STYLED INSERT HYPERLINK DIALOG ── */}
      {showLinkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-surface border border-border-subtle rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-2xl bg-accent/20 text-accent flex items-center justify-center">
                  <Link2 className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-text-primary">Insert Hyperlink</h3>
                  <p className="text-[11px] text-text-muted">Attach a web link or reference to your notes</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowLinkModal(false)}
                className="text-text-muted hover:text-text-primary p-1 rounded-lg transition-colors"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleApplyLink} className="space-y-3.5">
              <div>
                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block mb-1.5">
                  Display Text <span className="text-text-muted font-normal lowercase">(optional)</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. System Design CheatSheet"
                  value={linkModalText}
                  onChange={(e) => setLinkModalText(e.target.value)}
                  className="w-full bg-card border border-border-subtle rounded-xl px-3.5 py-2.5 text-xs text-text-primary placeholder:text-text-muted/60 focus:outline-none focus:border-accent shadow-xs"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block mb-1.5">
                  Target URL <span className="text-accent">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="https://example.com"
                    value={linkModalUrl}
                    onChange={(e) => setLinkModalUrl(e.target.value)}
                    className="w-full bg-card border border-border-subtle rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-text-primary font-mono placeholder:text-text-muted/60 focus:outline-none focus:border-accent shadow-xs"
                    autoFocus
                    required
                  />
                  <Link2 className="h-4 w-4 text-text-muted absolute left-3 top-3 pointer-events-none" />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-border-subtle">
                <button
                  type="button"
                  onClick={() => setShowLinkModal(false)}
                  className="px-4 py-2 rounded-xl border border-border-subtle hover:bg-hover text-xs font-bold text-text-secondary transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-accent hover:bg-accent-light text-white font-bold text-xs shadow-md shadow-accent/20 flex items-center gap-1.5 transition-all active:scale-95"
                >
                  <Check className="h-3.5 w-3.5" />
                  <span>Insert Link</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>

      {/* ── DEDICATED REDESIGNED A4 PRINT DOCUMENT (ONLY VISIBLE DURING PRINT) ── */}
      <div id="placify-print-document" className="hidden print:block w-full bg-white text-slate-900 font-sans print:p-0">
        {/* 1. Executive Platform Branding Header */}
        <div className="pdf-header pb-4 mb-6 border-b-2 border-indigo-600 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black text-sm shadow-sm">
              P
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-xl tracking-tight text-slate-900 uppercase">CampusGrid Notes</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 uppercase">
                  {activeNotebook?.subject || 'STUDY NOTES'}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">Placify • Placement &amp; Academic Intelligence Platform</p>
            </div>
          </div>
          <div className="text-right flex flex-col items-end">
            <span className="text-sm font-bold text-indigo-600 font-mono tracking-tight">placify.app/notes</span>
            <span className="text-xs text-slate-400 font-mono mt-0.5">
              {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
            </span>
          </div>
        </div>

        {/* 2. Title & Document Meta Block */}
        <div className="pdf-title-block mb-6 pb-4 border-b border-slate-200">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded bg-indigo-100/80 text-indigo-900 text-[11px] font-black uppercase tracking-wider">
              {activeNotebook?.subject || 'DSA'}
            </span>
            {activeNotebook?.isCollaborative && (
              <span className="px-2.5 py-0.5 rounded bg-emerald-100/80 text-emerald-900 text-[11px] font-black uppercase tracking-wider">
                Live Collab Room #{activeNotebook.collabRoomId}
              </span>
            )}
          </div>

          <h1 className="text-2xl font-black text-slate-900 tracking-tight leading-tight mt-1">
            {activeNotebook?.title || 'Untitled Notebook'}
          </h1>

          <div className="text-base font-bold text-slate-700 mt-1">
            <span className="text-slate-500 font-semibold mr-1.5">Chapter / Topic:</span>
            <span className="text-indigo-950 font-black">{activePage?.title || 'Page 1'}</span>
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-500 mt-3 pt-2.5 border-t border-slate-100">
            <span>Author: {user?.displayName || 'CampusGrid Scholar'}</span>
            <span>•</span>
            <span>{stats.words} Words</span>
            <span>•</span>
            <span>{stats.readingTime}</span>
            <span>•</span>
            <span>A4 Document Edition</span>
          </div>
        </div>

        {/* 3. Document Content Body */}
        <div
          className="pdf-body-content text-slate-800 leading-relaxed min-h-[400px]"
          dangerouslySetInnerHTML={{
            __html: printHtmlContent || editorRef.current?.innerHTML || activePage?.htmlContent || '<p>No content written in this page.</p>'
          }}
        />

        {/* 4. Document Footer */}
        <div className="pdf-footer mt-12 pt-4 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-600">Placify</span>
            <span>— The All-in-One Placement &amp; Academic Ecosystem</span>
          </div>
          <div className="font-mono text-[11px] text-slate-400">
            placify.app • Verified Study Material
          </div>
        </div>
      </div>
    </>
  )
}
