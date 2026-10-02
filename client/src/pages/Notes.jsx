import { useState, useRef, useEffect } from 'react'
import {
  BookOpen, Plus, Users, Search, Trash2, ArrowLeft, Save,
  Bold, Italic, Underline, Strikethrough, List, ListOrdered, Link2,
  Undo, Redo, Check, Copy, Hash, Send, FileText, CheckSquare,
  Quote, Minus, Eraser, AlignLeft, AlignCenter, AlignRight, AlignJustify,
  Highlighter, Palette, Download, Printer, StickyNote, Pin, Eye, Sparkles, Share2,
  PanelLeftClose, PanelLeftOpen, GripVertical, ZoomIn, ZoomOut, Maximize2, Minimize2,
  ChevronUp, ChevronDown, PenTool, Pencil
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
  {
    id: 'yellow',
    name: 'Sunny Yellow',
    cardClass: 'bg-gradient-to-b from-[#fefce8] to-[#fef08a] dark:from-amber-950/70 dark:to-amber-900/50 border-amber-300 dark:border-amber-600/60 text-amber-950 dark:text-amber-100 shadow-[0_4px_16px_rgba(245,158,11,0.14)]',
    borderClass: 'border-amber-300 bg-amber-50 text-amber-950 dark:text-amber-100',
    dotClass: 'bg-amber-400',
    tapeClass: 'bg-amber-300/80 dark:bg-amber-700/50 border-amber-400/60',
    pinColor: 'text-amber-600 dark:text-amber-400',
  },
  {
    id: 'pink',
    name: 'Blush Pink',
    cardClass: 'bg-gradient-to-b from-[#fff1f2] to-[#fecdd3] dark:from-rose-950/70 dark:to-rose-900/50 border-rose-300 dark:border-rose-600/60 text-rose-950 dark:text-rose-100 shadow-[0_4px_16px_rgba(244,63,94,0.14)]',
    borderClass: 'border-rose-300 bg-rose-50 text-rose-950 dark:text-rose-100',
    dotClass: 'bg-rose-400',
    tapeClass: 'bg-rose-300/80 dark:bg-rose-700/50 border-rose-400/60',
    pinColor: 'text-rose-600 dark:text-rose-400',
  },
  {
    id: 'blue',
    name: 'Sky Blue',
    cardClass: 'bg-gradient-to-b from-[#f0f9ff] to-[#bae6fd] dark:from-sky-950/70 dark:to-sky-900/50 border-sky-300 dark:border-sky-600/60 text-sky-950 dark:text-sky-100 shadow-[0_4px_16px_rgba(14,165,233,0.14)]',
    borderClass: 'border-sky-300 bg-sky-50 text-sky-950 dark:text-sky-100',
    dotClass: 'bg-sky-400',
    tapeClass: 'bg-sky-300/80 dark:bg-sky-700/50 border-sky-400/60',
    pinColor: 'text-sky-600 dark:text-sky-400',
  },
  {
    id: 'green',
    name: 'Mint Green',
    cardClass: 'bg-gradient-to-b from-[#f0fdf4] to-[#bbf7d0] dark:from-emerald-950/70 dark:to-emerald-900/50 border-emerald-300 dark:border-emerald-600/60 text-emerald-950 dark:text-emerald-100 shadow-[0_4px_16px_rgba(16,185,129,0.14)]',
    borderClass: 'border-emerald-300 bg-emerald-50 text-emerald-950 dark:text-emerald-100',
    dotClass: 'bg-emerald-400',
    tapeClass: 'bg-emerald-300/80 dark:bg-emerald-700/50 border-emerald-400/60',
    pinColor: 'text-emerald-600 dark:text-emerald-400',
  },
  {
    id: 'purple',
    name: 'Lavender',
    cardClass: 'bg-gradient-to-b from-[#faf5ff] to-[#e9d5ff] dark:from-purple-950/70 dark:to-purple-900/50 border-purple-300 dark:border-purple-600/60 text-purple-950 dark:text-purple-100 shadow-[0_4px_16px_rgba(168,85,247,0.14)]',
    borderClass: 'border-purple-300 bg-purple-50 text-purple-950 dark:text-purple-100',
    dotClass: 'bg-purple-400',
    tapeClass: 'bg-purple-300/80 dark:bg-purple-700/50 border-purple-400/60',
    pinColor: 'text-purple-600 dark:text-purple-400',
  },
  {
    id: 'orange',
    name: 'Tangerine',
    cardClass: 'bg-gradient-to-b from-[#fff7ed] to-[#fed7aa] dark:from-orange-950/70 dark:to-orange-900/50 border-orange-300 dark:border-orange-600/60 text-orange-950 dark:text-orange-100 shadow-[0_4px_16px_rgba(249,115,22,0.14)]',
    borderClass: 'border-orange-300 bg-orange-50 text-orange-950 dark:text-orange-100',
    dotClass: 'bg-orange-400',
    tapeClass: 'bg-orange-300/80 dark:bg-orange-700/50 border-orange-400/60',
    pinColor: 'text-orange-600 dark:text-orange-400',
  },
]

const formatDateDisplay = (dateVal) => {
  if (!dateVal) return 'Just now'
  let d
  if (dateVal && typeof dateVal.toDate === 'function') {
    d = dateVal.toDate()
  } else if (dateVal && dateVal.seconds) {
    d = new Date(dateVal.seconds * 1000)
  } else {
    d = new Date(dateVal)
  }
  if (!d || isNaN(d.getTime())) return 'Recently'
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

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
    reorderPages,
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

  // Sticky Notes Edit Modal State
  const [editingSticky, setEditingSticky] = useState(null)
  const [editStickyTitle, setEditStickyTitle] = useState('')
  const [editStickyBody, setEditStickyBody] = useState('')
  const [editStickyColor, setEditStickyColor] = useState('yellow')
  const [editStickyPinned, setEditStickyPinned] = useState(false)

  const handleOpenEditSticky = (note) => {
    setEditingSticky(note)
    setEditStickyTitle(note.title || '')
    setEditStickyBody(note.content || '')
    setEditStickyColor(note.color || 'yellow')
    setEditStickyPinned(!!note.isPinned)
  }

  const handleSaveEditSticky = async (e) => {
    if (e) e.preventDefault()
    if (!editingSticky) return

    await updateNote(editingSticky.id, {
      title: editStickyTitle.trim() || 'Untitled Note',
      content: editStickyBody.trim(),
      color: editStickyColor,
      isPinned: editStickyPinned,
    })

    setEditingSticky(null)
  }

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

  // Sidebar, Header & Toolbar Collapse States
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [isTopHeaderOpen, setIsTopHeaderOpen] = useState(false)
  const [isToolbarOpen, setIsToolbarOpen] = useState(true)
  const [isFocusMode, setIsFocusMode] = useState(false)

  // Drag and Drop Page Reordering States
  const [draggedPageIndex, setDraggedPageIndex] = useState(null)
  const [dragOverPageIndex, setDragOverPageIndex] = useState(null)

  // Document Editor View Sizing & Zoom
  const [editorZoom, setEditorZoom] = useState(100)
  const [editorWidthMode, setEditorWidthMode] = useState('wide') // 'standard' | 'wide' | 'full'

  const toggleFocusMode = () => {
    setIsFocusMode((prev) => {
      const next = !prev
      if (next) {
        setIsSidebarOpen(false)
        setIsTopHeaderOpen(false)
        setIsToolbarOpen(false)
      } else {
        setIsSidebarOpen(true)
        setIsToolbarOpen(true)
      }
      return next
    })
  }

  // Exit Zen Focus Mode on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isFocusMode) {
        setIsFocusMode(false)
        setIsSidebarOpen(true)
        setIsToolbarOpen(true)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isFocusMode])

  // PDF Export States (Whole Notebook vs Specific Page)
  const [showExportModal, setShowExportModal] = useState(false)
  const [exportScope, setExportScope] = useState('notebook') // 'notebook' | 'single'
  const [exportSelectedPageNumber, setExportSelectedPageNumber] = useState(1)
  const [exportPagesToPrint, setExportPagesToPrint] = useState([])

  const handleOpenExportModal = () => {
    const currentIdx = activeNotebook?.pages?.findIndex((p) => p.id === activePage?.id)
    setExportSelectedPageNumber(currentIdx >= 0 ? currentIdx + 1 : 1)
    setExportScope('notebook')
    setShowExportModal(true)
  }

  const handleConfirmExport = () => {
    if (!activeNotebook || !activeNotebook.pages?.length) return

    // Synchronize latest content from editor
    const currentHtml = editorRef.current?.innerHTML || activePage?.htmlContent || ''
    if (activePage) {
      updatePageContent(activeNotebook.id, activePage.id, currentHtml)
    }

    let pagesData = []
    if (exportScope === 'single') {
      const pageIndex = Math.max(0, Math.min(activeNotebook.pages.length - 1, exportSelectedPageNumber - 1))
      const targetPage = activeNotebook.pages[pageIndex]
      if (targetPage) {
        pagesData = [
          {
            ...targetPage,
            pageNumber: pageIndex + 1,
            totalCount: 1,
            htmlToRender: targetPage.id === activePage?.id ? currentHtml : targetPage.htmlContent,
          },
        ]
      }
    } else {
      // Entire notebook
      pagesData = activeNotebook.pages.map((p, idx) => ({
        ...p,
        pageNumber: idx + 1,
        totalCount: activeNotebook.pages.length,
        htmlToRender: p.id === activePage?.id ? currentHtml : p.htmlContent,
      }))
    }

    setExportPagesToPrint(pagesData)
    setShowExportModal(false)

    setTimeout(() => {
      window.print()
    }, 150)
  }

  // Drag and Drop Handlers for Page Sequence Reordering
  const handleDragStart = (e, index) => {
    setDraggedPageIndex(index)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', index.toString())
  }

  const handleDragOver = (e, index) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    if (dragOverPageIndex !== index) {
      setDragOverPageIndex(index)
    }
  }

  const handleDrop = (e, targetIndex) => {
    e.preventDefault()
    if (draggedPageIndex === null || draggedPageIndex === targetIndex || !activeNotebook) {
      setDraggedPageIndex(null)
      setDragOverPageIndex(null)
      return
    }
    const updatedPages = [...activeNotebook.pages]
    const [moved] = updatedPages.splice(draggedPageIndex, 1)
    updatedPages.splice(targetIndex, 0, moved)
    reorderPages(activeNotebook.id, updatedPages)
    setDraggedPageIndex(null)
    setDragOverPageIndex(null)
  }

  const handleDragEnd = () => {
    setDraggedPageIndex(null)
    setDragOverPageIndex(null)
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
      <div className="notes-screen-workspace flex flex-col h-full w-full flex-1 bg-base overflow-hidden text-text-primary print:hidden">
      {/* ── TOP LEVEL NAVIGATION HEADER (Collapsible for maximum vertical writing room) ── */}
      {isTopHeaderOpen && !isFocusMode && (
        <div className="px-4 py-2 border-b border-border-subtle bg-surface/90 flex items-center justify-between gap-3 shrink-0 flex-wrap print:hidden transition-all duration-300 animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-xl bg-accent/20 text-accent flex items-center justify-center shadow-sm">
              <BookOpen className="h-4 w-4" />
            </div>
            <div className="flex items-center gap-2">
              <h1 className="text-xs sm:text-sm font-bold text-text-primary tracking-tight">Notes &amp; Notebook Hub</h1>
              <span className="px-1.5 py-0.2 rounded-full bg-semantic-green/15 text-semantic-green text-[9px] font-bold border border-semantic-green/30 flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-semantic-green animate-pulse" /> Live Collab
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* View Switcher Tabs */}
            <div className="flex items-center gap-1 p-0.5 bg-card rounded-xl border border-border-subtle">
              <button
                onClick={() => setActiveMainTab('notebooks')}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all',
                  activeMainTab === 'notebooks'
                    ? 'bg-accent text-white shadow-xs'
                    : 'text-text-muted hover:text-text-primary'
                )}
              >
                <BookOpen className="h-3 w-3" />
                <span>Notebooks</span>
              </button>

              <button
                onClick={() => setActiveMainTab('stickies')}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all',
                  activeMainTab === 'stickies'
                    ? 'bg-amber-400 text-slate-900 shadow-xs'
                    : 'text-text-muted hover:text-text-primary'
                )}
              >
                <StickyNote className="h-3 w-3" />
                <span>Sticky Notes</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => setIsTopHeaderOpen(false)}
              className="p-1.5 rounded-lg border border-border-subtle hover:bg-hover text-text-muted hover:text-text-primary text-xs transition-colors"
              title="Minimize Banner (More vertical space)"
            >
              <ChevronUp className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* ── MAIN WORKSPACE CONTENT ── */}
      {activeMainTab === 'notebooks' ? (
        <div className="flex-1 flex overflow-hidden print:overflow-visible">
          {/* ── LEFT NOTEBOOK SHELF & CHAPTER SELECTOR ── */}
          <div
            className={cn(
              'border-r border-border-subtle bg-surface/50 flex flex-col shrink-0 overflow-hidden print:hidden transition-all duration-300 ease-in-out',
              isSidebarOpen ? 'w-72 lg:w-80 opacity-100' : 'w-0 border-r-0 opacity-0 pointer-events-none'
            )}
          >
            {/* Shelf Header */}
            <div className="p-3.5 border-b border-border-subtle bg-surface/40 flex items-center justify-between shrink-0">
              <span className="text-xs font-bold text-text-secondary uppercase tracking-wider truncate">
                My Notebooks ({notebooks.length})
              </span>
              <div className="flex items-center gap-1.5 shrink-0">
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
              <div className="p-3 border-t border-border-subtle bg-surface/70 space-y-2 shrink-0 max-h-60 overflow-y-auto scrollbar-thin">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted">
                      Chapters / Pages
                    </span>
                    <span className="px-1.5 py-0.2 rounded-full bg-accent/15 text-accent text-[10px] font-bold">
                      {activeNotebook.pages?.length || 0}
                    </span>
                  </div>
                  <button
                    onClick={() => addPage(activeNotebook.id)}
                    className="text-xs text-accent hover:text-accent-light font-bold flex items-center gap-1 px-1.5 py-0.5 rounded-lg hover:bg-accent/10 transition-colors"
                  >
                    <Plus className="h-3 w-3" /> Add Page
                  </button>
                </div>

                <div className="space-y-1">
                  {activeNotebook.pages?.map((page, idx) => {
                    const isPageActive = page.id === activePage?.id
                    const isDragging = draggedPageIndex === idx
                    const isDragOver = dragOverPageIndex === idx

                    return (
                      <div
                        key={page.id}
                        draggable={activeNotebook.pages.length > 1}
                        onDragStart={(e) => handleDragStart(e, idx)}
                        onDragOver={(e) => handleDragOver(e, idx)}
                        onDragLeave={() => {
                          if (dragOverPageIndex === idx) setDragOverPageIndex(null)
                        }}
                        onDragEnd={handleDragEnd}
                        onDrop={(e) => handleDrop(e, idx)}
                        onClick={() => setActivePageId(page.id)}
                        className={cn(
                          'group flex items-center gap-1.5 px-2 py-1.5 rounded-xl text-xs font-medium cursor-pointer transition-all select-none border',
                          isPageActive
                            ? 'bg-accent text-white font-bold shadow-xs border-accent'
                            : 'text-text-secondary hover:bg-hover hover:text-text-primary border-transparent',
                          isDragging && 'opacity-40 border-dashed border-accent',
                          isDragOver && !isDragging && 'ring-2 ring-accent border-accent bg-accent/15 scale-[1.01]'
                        )}
                        title="Click to select. Drag grip to reorder sequence."
                      >
                        {/* Drag Handle */}
                        {activeNotebook.pages.length > 1 && (
                          <div
                            className={cn(
                              'cursor-grab active:cursor-grabbing p-0.5 rounded transition-opacity shrink-0',
                              isPageActive ? 'text-white/70 hover:text-white' : 'text-text-muted/60 group-hover:text-text-primary'
                            )}
                            title="Drag to change page sequence"
                          >
                            <GripVertical className="h-3.5 w-3.5" />
                          </div>
                        )}

                        {/* Sequential Page Number Badge (1, 2, 3...) */}
                        <span
                          className={cn(
                            'h-5 w-5 rounded-md flex items-center justify-center text-[10px] font-bold shrink-0 transition-colors',
                            isPageActive
                              ? 'bg-white/25 text-white border border-white/30'
                              : 'bg-card border border-border-subtle text-text-muted group-hover:text-text-primary'
                          )}
                          title={`Page ${idx + 1}`}
                        >
                          {idx + 1}
                        </span>

                        {/* Page Title */}
                        <span className="truncate flex-1 font-medium">
                          {page.title || `Page ${idx + 1}`}
                        </span>

                        {/* Delete Page Button */}
                        {activeNotebook.pages.length > 1 && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              deletePage(activeNotebook.id, page.id)
                            }}
                            className={cn(
                              'p-0.5 rounded ml-1 opacity-0 group-hover:opacity-100 transition-opacity',
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
            {!isFocusMode && (
              <div className="px-3 py-1.5 border-b border-border-subtle bg-surface/90 backdrop-blur-md flex items-center justify-between gap-2.5 shrink-0 flex-wrap print:hidden">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  {/* Inline Tab Switcher & Banner Reveal when top banner is closed */}
                  {!isTopHeaderOpen && (
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => setIsTopHeaderOpen(true)}
                        className="p-1 rounded-lg border border-border-subtle hover:bg-hover text-text-muted hover:text-accent transition-colors text-xs flex items-center gap-0.5"
                        title="Show Top Hub Banner"
                      >
                        <BookOpen className="h-3.5 w-3.5 text-accent" />
                        <ChevronDown className="h-3 w-3" />
                      </button>

                      <div className="flex items-center p-0.5 bg-card rounded-lg border border-border-subtle">
                        <button
                          type="button"
                          onClick={() => setActiveMainTab('notebooks')}
                          className={cn(
                            'flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold transition-all',
                            activeMainTab === 'notebooks'
                              ? 'bg-accent text-white shadow-xs'
                              : 'text-text-muted hover:text-text-primary'
                          )}
                          title="Notebooks Documents"
                        >
                          <BookOpen className="h-3 w-3" />
                          <span className="hidden md:inline">Notebooks</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setActiveMainTab('stickies')}
                          className={cn(
                            'flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold transition-all',
                            activeMainTab === 'stickies'
                              ? 'bg-amber-400 text-slate-900 shadow-xs'
                              : 'text-text-muted hover:text-text-primary'
                          )}
                          title="Sticky Notes Wall"
                        >
                          <StickyNote className="h-3 w-3" />
                          <span className="hidden md:inline">Stickies</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Sidebar Expand / Collapse Toggle Button */}
                  <button
                    type="button"
                    onClick={() => setIsSidebarOpen((prev) => !prev)}
                    className="p-1.5 rounded-xl border border-border-subtle hover:bg-hover text-text-muted hover:text-text-primary transition-all flex items-center gap-1.5 text-xs font-medium shrink-0"
                    title={isSidebarOpen ? 'Collapse Sidebar (More horizontal space)' : 'Expand Sidebar'}
                  >
                    {isSidebarOpen ? (
                      <PanelLeftClose className="h-4 w-4" />
                    ) : (
                      <>
                        <PanelLeftOpen className="h-4 w-4 text-accent" />
                        <span className="hidden sm:inline font-bold text-accent">Sidebar</span>
                      </>
                    )}
                  </button>

                  <input
                    type="text"
                    value={editingPageTitle}
                    onChange={(e) => setEditingPageTitle(e.target.value)}
                    onBlur={() => {
                      if (editingPageTitle.trim() && activeNotebook && activePage) {
                        renamePage(activeNotebook.id, activePage.id, editingPageTitle.trim())
                      }
                    }}
                    className="text-sm sm:text-base font-bold text-slate-900 dark:text-white bg-transparent border-b border-transparent hover:border-border-subtle focus:border-accent focus:outline-none transition-colors truncate max-w-[130px] sm:max-w-xs md:max-w-sm px-1"
                    placeholder="Page Title"
                    title="Click to rename this page"
                  />
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {/* Formatting Toolbar Toggle Button */}
                  <button
                    type="button"
                    onClick={() => setIsToolbarOpen((prev) => !prev)}
                    className={cn(
                      'px-2 py-1 rounded-xl border text-xs font-bold transition-all flex items-center gap-1 shadow-xs',
                      isToolbarOpen
                        ? 'bg-accent/10 border-accent/30 text-accent hover:bg-accent/20'
                        : 'bg-card border-border-subtle hover:bg-hover text-text-muted hover:text-text-primary'
                    )}
                    title={isToolbarOpen ? 'Collapse Toolbar (More vertical space)' : 'Show Formatting Toolbar'}
                  >
                    <PenTool className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Toolbar</span>
                    {isToolbarOpen ? <ChevronUp className="h-3 w-3 opacity-70" /> : <ChevronDown className="h-3 w-3 opacity-70" />}
                  </button>

                  {/* Zen Focus Mode Button */}
                  <button
                    type="button"
                    onClick={toggleFocusMode}
                    className="px-2 py-1 rounded-xl border border-border-subtle bg-card hover:bg-hover text-text-secondary hover:text-accent text-xs font-bold transition-colors flex items-center gap-1 shadow-xs"
                    title="Zen Focus Mode (Distraction-free edge-to-edge canvas)"
                  >
                    <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                    <span className="hidden sm:inline">Focus</span>
                  </button>

                  {/* Paper Style Selector */}
                  <select
                    value={activeNotebook?.paperStyle || 'ruled'}
                    onChange={(e) => updateNotebook(activeNotebook.id, { paperStyle: e.target.value })}
                    className="text-xs py-1 pl-2 pr-6 bg-card border border-border-subtle rounded-xl font-medium"
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
                      'px-2 sm:px-2.5 py-1 rounded-xl border text-xs font-bold transition-all flex items-center gap-1 shadow-xs',
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
                    <span className="hidden md:inline">Share &amp; Collab</span>
                    {activeCollaborators.length > 0 && (
                      <span className="ml-0.5 px-1 py-0.2 rounded-full bg-semantic-green/20 text-semantic-green text-[10px] font-mono">
                        {activeCollaborators.length + 1}
                      </span>
                    )}
                  </button>

                  {/* Print / Save PDF Export */}
                  <button
                    onClick={handleOpenExportModal}
                    className="px-2 py-1 rounded-xl border border-border-subtle hover:bg-hover text-text-muted hover:text-text-primary transition-colors flex items-center gap-1 text-xs font-bold shadow-xs active:scale-95"
                    title="Export PDF"
                  >
                    <Printer className="h-3.5 w-3.5 text-accent" />
                    <span className="hidden sm:inline">Export</span>
                  </button>
                </div>
              </div>
            )}

            {/* ── RICH TEXT FORMATTING TOOLBAR (Collapsible for maximum vertical writing space) ── */}
            {isToolbarOpen && !isFocusMode && (
              <div className="px-3 py-1.5 border-b border-border-subtle bg-surface/95 flex items-center gap-1 flex-wrap shrink-0 text-text-secondary shadow-xs print:hidden animate-in fade-in transition-all">
                {/* Undo / Redo */}
                <button
                  type="button"
                  onClick={() => execCmd('undo')}
                  className="p-1 rounded-lg hover:bg-hover hover:text-text-primary transition-colors"
                  title="Undo (Ctrl+Z)"
                >
                  <Undo className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => execCmd('redo')}
                  className="p-1 rounded-lg hover:bg-hover hover:text-text-primary transition-colors"
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
                  className="text-xs py-0.5 px-2 bg-card border border-border-subtle rounded-lg font-bold"
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
                  className="p-1 rounded-lg hover:bg-hover hover:text-text-primary font-bold text-xs"
                  title="Bold (Ctrl+B)"
                >
                  <Bold className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => execCmd('italic')}
                  className="p-1 rounded-lg hover:bg-hover hover:text-text-primary text-xs"
                  title="Italic (Ctrl+I)"
                >
                  <Italic className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => execCmd('underline')}
                  className="p-1 rounded-lg hover:bg-hover hover:text-text-primary text-xs"
                  title="Underline (Ctrl+U)"
                >
                  <Underline className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => execCmd('strikeThrough')}
                  className="p-1 rounded-lg hover:bg-hover hover:text-text-primary text-xs"
                  title="Strikethrough"
                >
                  <Strikethrough className="h-3.5 w-3.5" />
                </button>

                <div className="h-4 w-px bg-border-subtle mx-1" />

                {/* Font Color */}
                <select
                  onChange={(e) => execCmd('foreColor', e.target.value)}
                  className="text-xs py-0.5 px-1.5 bg-card border border-border-subtle rounded-lg font-bold"
                  title="Text Color"
                >
                  {TEXT_COLORS.map((c) => (
                    <option key={c.label} value={c.value}>{c.label}</option>
                  ))}
                </select>

                {/* Highlighter Marker */}
                <select
                  onChange={(e) => execCmd('hiliteColor', e.target.value)}
                  className="text-xs py-0.5 px-1.5 bg-card border border-border-subtle rounded-lg font-bold"
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
                  className="p-1 rounded-lg hover:bg-hover hover:text-text-primary"
                  title="Align Left"
                >
                  <AlignLeft className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => execCmd('justifyCenter')}
                  className="p-1 rounded-lg hover:bg-hover hover:text-text-primary"
                  title="Align Center"
                >
                  <AlignCenter className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => execCmd('justifyRight')}
                  className="p-1 rounded-lg hover:bg-hover hover:text-text-primary"
                  title="Align Right"
                >
                  <AlignRight className="h-3.5 w-3.5" />
                </button>

                <div className="h-4 w-px bg-border-subtle mx-1" />

                {/* Lists & Task Checklists */}
                <button
                  type="button"
                  onClick={() => execCmd('insertUnorderedList')}
                  className="p-1 rounded-lg hover:bg-hover hover:text-text-primary"
                  title="Bullet List"
                >
                  <List className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => execCmd('insertOrderedList')}
                  className="p-1 rounded-lg hover:bg-hover hover:text-text-primary"
                  title="Numbered List"
                >
                  <ListOrdered className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={insertTaskItem}
                  className="p-1 rounded-lg hover:bg-hover hover:text-accent font-bold text-xs flex items-center gap-1"
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
                  className="p-1 rounded-lg hover:bg-hover hover:text-text-primary"
                  title="Blockquote"
                >
                  <Quote className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => execCmd('insertHorizontalRule')}
                  className="p-1 rounded-lg hover:bg-hover hover:text-text-primary"
                  title="Insert Horizontal Divider Line"
                >
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={handleOpenLinkModal}
                  className="p-1 rounded-lg hover:bg-hover hover:text-text-primary transition-colors"
                  title="Insert Hyperlink (Ctrl+K)"
                >
                  <Link2 className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => execCmd('removeFormat')}
                  className="p-1 rounded-lg hover:bg-hover hover:text-semantic-red"
                  title="Clear Formatting"
                >
                  <Eraser className="h-3.5 w-3.5" />
                </button>

                {/* Document Zoom, Canvas Width & Collapse Controls */}
                <div className="flex items-center gap-1 ml-auto shrink-0 pl-1 border-l border-border-subtle">
                  <button
                    type="button"
                    onClick={() => setEditorZoom((z) => Math.max(70, z - 10))}
                    className="p-1 rounded-lg hover:bg-hover hover:text-text-primary text-text-muted transition-colors text-xs"
                    title="Zoom Out (Ctrl -)"
                  >
                    <ZoomOut className="h-3.5 w-3.5" />
                  </button>
                  <span className="text-[11px] font-mono font-bold text-text-muted w-8 text-center select-none">
                    {editorZoom}%
                  </span>
                  <button
                    type="button"
                    onClick={() => setEditorZoom((z) => Math.min(130, z + 10))}
                    className="p-1 rounded-lg hover:bg-hover hover:text-text-primary text-text-muted transition-colors text-xs"
                    title="Zoom In (Ctrl +)"
                  >
                    <ZoomIn className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditorWidthMode((m) => (m === 'wide' ? 'full' : m === 'full' ? 'standard' : 'wide'))}
                    className={cn(
                      'p-1 rounded-lg hover:bg-hover transition-colors text-xs flex items-center gap-1',
                      editorWidthMode !== 'standard' ? 'text-accent font-bold bg-accent/10' : 'text-text-muted hover:text-text-primary'
                    )}
                    title={`Canvas Width: ${editorWidthMode.toUpperCase()} (Click to toggle Wide / Full / Standard)`}
                  >
                    <Maximize2 className="h-3.5 w-3.5" />
                    <span className="hidden xl:inline text-[10px] uppercase font-semibold">{editorWidthMode}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsToolbarOpen(false)}
                    className="p-1 rounded-lg hover:bg-hover text-text-muted hover:text-text-primary transition-colors text-xs ml-0.5"
                    title="Collapse Formatting Toolbar (Alt+T)"
                  >
                    <ChevronUp className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* Zen Focus Mode Floating Exit Pill */}
            {isFocusMode && (
              <button
                type="button"
                onClick={toggleFocusMode}
                className="fixed top-4 right-6 z-50 px-3.5 py-1.5 rounded-full bg-slate-900/90 dark:bg-white/90 text-white dark:text-slate-900 text-xs font-bold shadow-2xl backdrop-blur-md border border-white/20 dark:border-black/20 flex items-center gap-2 hover:scale-105 transition-all animate-in fade-in cursor-pointer"
                title="Exit Focus Mode (Esc)"
              >
                <Minimize2 className="h-3.5 w-3.5 text-amber-400" />
                <span>Exit Zen Mode</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-white/20 dark:bg-black/10 font-mono">Esc</span>
              </button>
            )}

            {/* Peer Typing Status Banner */}
            {typingStatus && (
              <div className="px-5 py-1.5 bg-accent/10 border-b border-accent/20 text-xs text-accent font-semibold flex items-center gap-2 shrink-0 animate-in fade-in print:hidden">
                <span className="h-2 w-2 rounded-full bg-accent animate-pulse" />
                <span>{typingStatus.name} is currently typing in this notebook...</span>
              </div>
            )}

            {/* ── THE NOTEBOOK PAPER DOCUMENT (Edge-to-Edge Clean Workspace) ── */}
            <div className={cn('flex-1 overflow-y-auto scrollbar-thin', currentTheme.class)}>
              <div
                className={cn(
                  'mx-auto min-h-full flex flex-col transition-all',
                  editorWidthMode === 'wide'
                    ? 'max-w-6xl w-full px-4 sm:px-8 lg:px-12 py-5'
                    : editorWidthMode === 'full'
                    ? 'w-full max-w-none px-4 sm:px-8 lg:px-12 py-4'
                    : 'max-w-4xl w-full px-4 sm:px-6 py-5'
                )}
                style={{ zoom: `${editorZoom}%` }}
              >
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
                  className="notebook-document flex-1 w-full"
                />
              </div>
            </div>

            {/* ── BOTTOM STATS FOOTER ── */}
            {!isFocusMode && (
              <div className="px-5 py-1.5 border-t border-border-subtle bg-surface/90 text-[11px] text-text-muted flex items-center justify-between shrink-0 font-medium print:hidden">
                <div className="flex items-center gap-4">
                  <span>{stats.words} words</span>
                  <span>{stats.chars} characters</span>
                  <span>{stats.readingTime}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1.5 text-semantic-green font-medium">
                    <Check className="h-3 w-3" /> All edits saved live
                  </span>
                </div>
              </div>
            )}
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
              {!isTopHeaderOpen && (
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => setIsTopHeaderOpen(true)}
                    className="p-1 rounded-lg border border-border-subtle hover:bg-hover text-text-muted hover:text-accent transition-colors text-xs flex items-center gap-0.5"
                    title="Show Top Hub Banner"
                  >
                    <BookOpen className="h-3.5 w-3.5 text-accent" />
                    <ChevronDown className="h-3 w-3" />
                  </button>

                  <div className="flex items-center p-0.5 bg-card rounded-lg border border-border-subtle">
                    <button
                      type="button"
                      onClick={() => setActiveMainTab('notebooks')}
                      className={cn(
                        'flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold transition-all',
                        activeMainTab === 'notebooks'
                          ? 'bg-accent text-white shadow-xs'
                          : 'text-text-muted hover:text-text-primary'
                      )}
                      title="Notebooks Documents"
                    >
                      <BookOpen className="h-3 w-3" />
                      <span>Notebooks</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveMainTab('stickies')}
                      className={cn(
                        'flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold transition-all',
                        activeMainTab === 'stickies'
                          ? 'bg-amber-400 text-slate-900 shadow-xs'
                          : 'text-text-muted hover:text-text-primary'
                      )}
                      title="Sticky Notes Wall"
                    >
                      <StickyNote className="h-3 w-3" />
                      <span>Stickies</span>
                    </button>
                  </div>
                </div>
              )}
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
            <form
              onSubmit={handleCreateSticky}
              className={cn(
                'p-5 rounded-3xl border shadow-xl space-y-3.5 max-w-lg animate-in fade-in zoom-in-95 transition-all',
                COLOR_OPTIONS.find((c) => c.id === newStickyColor)?.cardClass || 'bg-card border-amber-400/50'
              )}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider opacity-75 flex items-center gap-1.5">
                  <StickyNote className="h-3.5 w-3.5" /> New Sticky Note
                </span>
                <button
                  type="button"
                  onClick={() => setIsCreatingSticky(false)}
                  className="p-1 rounded-lg opacity-70 hover:opacity-100"
                >
                  ✕
                </button>
              </div>

              <input
                type="text"
                placeholder="Sticky note title..."
                value={newStickyTitle}
                onChange={(e) => setNewStickyTitle(e.target.value)}
                className="w-full bg-white/70 dark:bg-black/30 border border-black/15 dark:border-white/15 rounded-xl px-3.5 py-2 text-xs font-bold text-inherit placeholder:opacity-50 focus:outline-none focus:ring-2 focus:ring-accent"
                autoFocus
              />
              <textarea
                rows={3}
                placeholder="Write your note body content..."
                value={newStickyBody}
                onChange={(e) => setNewStickyBody(e.target.value)}
                className="w-full bg-white/70 dark:bg-black/30 border border-black/15 dark:border-white/15 rounded-xl px-3.5 py-2 text-xs text-inherit placeholder:opacity-50 focus:outline-none focus:ring-2 focus:ring-accent resize-none font-medium leading-relaxed"
              />

              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-2">
                  {COLOR_OPTIONS.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setNewStickyColor(c.id)}
                      className={cn(
                        'h-6 w-6 rounded-full transition-transform border flex items-center justify-center',
                        c.dotClass,
                        newStickyColor === c.id
                          ? 'scale-125 border-slate-900 dark:border-white shadow-sm ring-2 ring-accent'
                          : 'border-transparent opacity-70 hover:opacity-100'
                      )}
                      title={c.name}
                    >
                      {newStickyColor === c.id && <Check className="h-3 w-3 text-slate-900" />}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsCreatingSticky(false)}
                    className="px-3 py-1.5 rounded-xl text-xs opacity-75 hover:opacity-100 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs shadow-md hover:scale-105 active:scale-95 transition-all"
                  >
                    Save Note
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* Sticky Notes Cards Grid */}
          <div className="flex-1 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 p-2 items-start auto-rows-max scrollbar-thin">
            {notes
              .filter((n) => {
                const q = stickySearch.toLowerCase()
                return (
                  (n.title && n.title.toLowerCase().includes(q)) ||
                  (n.content && n.content.toLowerCase().includes(q))
                )
              })
              .sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0))
              .map((note, idx) => {
                const theme = COLOR_OPTIONS.find((c) => c.id === note.color) || COLOR_OPTIONS[0]
                return (
                  <div
                    key={note.id}
                    onClick={() => handleOpenEditSticky(note)}
                    className={cn(
                      'p-4 sm:p-5 rounded-2xl border transition-all duration-200 relative group flex flex-col justify-between cursor-pointer select-none',
                      'min-h-[190px] max-h-[360px] hover:-translate-y-1.5 hover:shadow-xl',
                      idx % 3 === 0 ? 'hover:rotate-0 -rotate-0.5' : idx % 3 === 1 ? 'hover:rotate-0 rotate-0.5' : '',
                      theme.cardClass || theme.borderClass
                    )}
                    title="Click to edit sticky note"
                  >
                    {/* Top Washi Tape Sticker */}
                    <div
                      className={cn(
                        'mx-auto -mt-6 sm:-mt-7 mb-2 h-3.5 w-16 rounded-xs border shadow-2xs backdrop-blur-xs',
                        theme.tapeClass
                      )}
                    />

                    <div>
                      {/* Card Header: Title + Action Buttons */}
                      <div className="flex items-start justify-between gap-1.5 pb-1">
                        <h4 className="font-bold text-sm tracking-tight truncate flex-1 leading-snug">
                          {note.title || 'Untitled Note'}
                        </h4>
                        <div className="flex items-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity shrink-0">
                          {/* Edit Button */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleOpenEditSticky(note)
                            }}
                            className="p-1 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
                            title="Edit Sticky Note (or click note)"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>

                          {/* Pin Button */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              updateNote(note.id, { isPinned: !note.isPinned })
                            }}
                            className={cn(
                              'p-1 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 transition-colors',
                              note.isPinned ? 'text-amber-600 dark:text-amber-400 font-bold' : 'opacity-70'
                            )}
                            title={note.isPinned ? 'Unpin Note' : 'Pin Note'}
                          >
                            <Pin className={cn('h-3.5 w-3.5', note.isPinned && 'fill-current rotate-12')} />
                          </button>

                          {/* Delete Button */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              deleteNote(note.id)
                            }}
                            className="p-1 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 text-semantic-red transition-colors opacity-75 hover:opacity-100"
                            title="Delete Note"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Card Content Body */}
                      <div
                        className="text-xs leading-relaxed my-2.5 font-normal break-words whitespace-pre-wrap line-clamp-6 opacity-90"
                        dangerouslySetInnerHTML={{ __html: note.content || '' }}
                      />
                    </div>

                    {/* Card Bottom Meta Footer */}
                    <div className="pt-2.5 mt-2 border-t border-black/10 dark:border-white/10 text-[10px] opacity-75 flex items-center justify-between">
                      <span>{formatDateDisplay(note.createdAt)}</span>
                      <div className="flex items-center gap-1.5">
                        {note.isPinned && (
                          <span className="font-bold flex items-center gap-0.5 text-amber-700 dark:text-amber-300">
                            <Pin className="h-2.5 w-2.5 fill-current" /> Pinned
                          </span>
                        )}
                        <span className="opacity-0 group-hover:opacity-100 transition-opacity font-semibold flex items-center gap-0.5 text-accent">
                          <Pencil className="h-2.5 w-2.5" /> Edit
                        </span>
                      </div>
                    </div>

                    {/* Folded corner dog-ear decoration */}
                    <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-gradient-to-tl from-black/15 dark:from-white/10 to-transparent rounded-tl-xs pointer-events-none" />
                  </div>
                )
              })}

            {/* Empty State when no notes match search or exist */}
            {notes.length === 0 && (
              <div className="col-span-full flex flex-col items-center justify-center p-12 text-center">
                <div className="h-16 w-16 rounded-3xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center mb-3 shadow-md">
                  <StickyNote className="h-8 w-8" />
                </div>
                <h3 className="text-base font-bold text-text-primary mb-1">Your Sticky Wall is Empty</h3>
                <p className="text-xs text-text-muted max-w-sm mb-4">
                  Capture quick thoughts, interview questions, reminders, and study memos on colorful sticky notes.
                </p>
                <button
                  type="button"
                  onClick={() => setIsCreatingSticky(true)}
                  className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-900 font-bold text-xs flex items-center gap-1.5 shadow-md transition-all active:scale-95"
                >
                  <Plus className="h-4 w-4" />
                  <span>Create Your First Sticky Note</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── MODAL: EDIT STICKY NOTE ── */}
      {editingSticky && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in"
          onClick={() => setEditingSticky(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className={cn(
              'border rounded-3xl p-6 w-full max-w-lg shadow-2xl space-y-4 animate-in zoom-in-95 transition-all text-text-primary',
              COLOR_OPTIONS.find((c) => c.id === editStickyColor)?.cardClass || 'bg-card'
            )}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-xl bg-black/10 dark:bg-white/10 flex items-center justify-center">
                  <StickyNote className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm">Edit Sticky Note</h3>
                  <span className="text-[11px] opacity-70">
                    Created {formatDateDisplay(editingSticky.createdAt)}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setEditStickyPinned((p) => !p)}
                  className={cn(
                    'px-2.5 py-1 rounded-xl border transition-all text-xs flex items-center gap-1 font-bold',
                    editStickyPinned
                      ? 'bg-amber-500/20 border-amber-500/40 text-amber-700 dark:text-amber-300'
                      : 'border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 opacity-70'
                  )}
                  title={editStickyPinned ? 'Unpin note' : 'Pin note to top'}
                >
                  <Pin className={cn('h-3.5 w-3.5', editStickyPinned && 'fill-current rotate-12')} />
                  <span>{editStickyPinned ? 'Pinned' : 'Pin'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setEditingSticky(null)}
                  className="p-1.5 rounded-xl hover:bg-black/10 dark:hover:bg-white/10 opacity-70 hover:opacity-100 transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>

            <form onSubmit={handleSaveEditSticky} className="space-y-3.5">
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider block mb-1 opacity-75">
                  Note Title
                </label>
                <input
                  type="text"
                  placeholder="Title (optional)..."
                  value={editStickyTitle}
                  onChange={(e) => setEditStickyTitle(e.target.value)}
                  className="w-full bg-white/70 dark:bg-black/30 border border-black/15 dark:border-white/15 rounded-xl px-3.5 py-2.5 text-sm font-bold placeholder:opacity-50 focus:outline-none focus:ring-2 focus:ring-accent"
                  autoFocus
                />
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider block mb-1 opacity-75">
                  Content
                </label>
                <textarea
                  rows={6}
                  placeholder="Type your note content..."
                  value={editStickyBody}
                  onChange={(e) => setEditStickyBody(e.target.value)}
                  className="w-full bg-white/70 dark:bg-black/30 border border-black/15 dark:border-white/15 rounded-xl px-3.5 py-2.5 text-xs leading-relaxed placeholder:opacity-50 focus:outline-none focus:ring-2 focus:ring-accent resize-none font-medium"
                />
              </div>

              {/* Color Palette Selector */}
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider block mb-1.5 opacity-75">
                  Note Color
                </label>
                <div className="flex items-center gap-2">
                  {COLOR_OPTIONS.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setEditStickyColor(c.id)}
                      className={cn(
                        'h-7 w-7 rounded-full transition-all border-2 flex items-center justify-center',
                        c.dotClass,
                        editStickyColor === c.id
                          ? 'scale-125 border-slate-900 dark:border-white shadow-md'
                          : 'border-transparent opacity-75 hover:opacity-100 hover:scale-110'
                      )}
                      title={c.name}
                    >
                      {editStickyColor === c.id && <Check className="h-3.5 w-3.5 text-slate-900" />}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-black/10 dark:border-white/10">
                <button
                  type="button"
                  onClick={() => {
                    deleteNote(editingSticky.id)
                    setEditingSticky(null)
                  }}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold text-semantic-red hover:bg-semantic-red/10 transition-colors flex items-center gap-1.5"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Delete Note</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingSticky(null)}
                    className="px-3.5 py-1.5 rounded-xl text-xs font-semibold opacity-75 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs shadow-md hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5"
                  >
                    <Check className="h-3.5 w-3.5" />
                    <span>Save Changes</span>
                  </button>
                </div>
              </div>
            </form>
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
      {/* ── MODAL 6: EXPORT PDF SELECTION (WHOLE NOTEBOOK vs PARTICULAR PAGE) ── */}
      {showExportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-surface border border-border-subtle rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-border-subtle pb-3">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-2xl bg-accent/15 text-accent flex items-center justify-center">
                  <Printer className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-text-primary">Export Notes</h3>
                  <p className="text-[11px] text-text-muted truncate max-w-[260px]">
                    {activeNotebook?.title}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowExportModal(false)}
                className="text-text-muted hover:text-text-primary p-1 rounded-lg hover:bg-hover transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3.5">
              <label className="text-xs font-bold uppercase tracking-wider text-text-muted block">
                Choose Export Scope
              </label>

              {/* Option 1: Whole Notebook */}
              <div
                onClick={() => setExportScope('notebook')}
                className={cn(
                  'p-3.5 rounded-2xl border cursor-pointer transition-all flex items-start gap-3',
                  exportScope === 'notebook'
                    ? 'border-accent bg-accent/10 shadow-xs ring-1 ring-accent/30'
                    : 'border-border-subtle bg-card hover:bg-hover'
                )}
              >
                <input
                  type="radio"
                  name="exportScopeChoice"
                  checked={exportScope === 'notebook'}
                  onChange={() => setExportScope('notebook')}
                  className="mt-1 accent-accent"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-text-primary">Whole Notebook</span>
                    <span className="px-2 py-0.5 rounded-full bg-accent/15 text-accent text-[10px] font-bold">
                      {activeNotebook?.pages?.length || 1} {activeNotebook?.pages?.length === 1 ? 'Page' : 'Pages'}
                    </span>
                  </div>
                  <p className="text-[11px] text-text-muted mt-0.5">
                    Export the entire notebook including all chapters with sequential page numbers.
                  </p>
                </div>
              </div>

              {/* Option 2: Particular Page */}
              <div
                onClick={() => setExportScope('single')}
                className={cn(
                  'p-3.5 rounded-2xl border cursor-pointer transition-all flex items-start gap-3',
                  exportScope === 'single'
                    ? 'border-accent bg-accent/10 shadow-xs ring-1 ring-accent/30'
                    : 'border-border-subtle bg-card hover:bg-hover'
                )}
              >
                <input
                  type="radio"
                  name="exportScopeChoice"
                  checked={exportScope === 'single'}
                  onChange={() => setExportScope('single')}
                  className="mt-1 accent-accent"
                />
                <div className="flex-1">
                  <span className="text-xs font-bold text-text-primary">Particular Page</span>
                  <p className="text-[11px] text-text-muted mt-0.5">
                    Export a single specific page from this notebook.
                  </p>
                </div>
              </div>

              {/* Particular Page Selection Details */}
              {exportScope === 'single' && (
                <div className="p-3.5 rounded-2xl bg-card border border-border-subtle space-y-3 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-text-primary">
                      Select Page Number:
                    </label>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-text-muted">Page #</span>
                      <input
                        type="number"
                        min={1}
                        max={activeNotebook?.pages?.length || 1}
                        value={exportSelectedPageNumber}
                        onChange={(e) => {
                          const val = parseInt(e.target.value, 10)
                          if (!isNaN(val)) {
                            setExportSelectedPageNumber(
                              Math.max(1, Math.min(activeNotebook?.pages?.length || 1, val))
                            )
                          }
                        }}
                        className="w-14 px-2 py-1 rounded-lg border border-border-subtle bg-base text-xs font-bold text-center text-text-primary focus:outline-none focus:border-accent"
                      />
                      <span className="text-xs text-text-muted">of {activeNotebook?.pages?.length || 1}</span>
                    </div>
                  </div>

                  {/* Pick by Page Title */}
                  <div>
                    <label className="text-[10px] font-semibold text-text-muted block mb-1">
                      Choose by page name:
                    </label>
                    <select
                      value={exportSelectedPageNumber}
                      onChange={(e) => setExportSelectedPageNumber(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl border border-border-subtle bg-base text-xs text-text-primary focus:outline-none focus:border-accent font-medium"
                    >
                      {activeNotebook?.pages?.map((p, idx) => (
                        <option key={p.id} value={idx + 1}>
                          Page {idx + 1}: {p.title || `Page ${idx + 1}`}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border-subtle">
              <button
                type="button"
                onClick={() => setShowExportModal(false)}
                className="px-4 py-2 rounded-xl border border-border-subtle hover:bg-hover text-xs font-bold text-text-secondary transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmExport}
                className="px-5 py-2 rounded-xl bg-accent hover:bg-accent-light text-white font-bold text-xs shadow-md shadow-accent/20 flex items-center gap-1.5 transition-all active:scale-95"
              >
                <Printer className="h-4 w-4" />
                <span>
                  Export {exportScope === 'notebook' ? `All (${activeNotebook?.pages?.length || 1} Pages)` : `Page ${exportSelectedPageNumber}`}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>

      {/* ── DEDICATED REDESIGNED PRINT DOCUMENT (ONLY VISIBLE DURING PRINT) ── */}
      <div id="placify-print-document" className="hidden print:block w-full bg-white text-slate-900 font-sans print:p-0">
        {(exportPagesToPrint.length > 0
          ? exportPagesToPrint
          : [
              {
                id: activePage?.id,
                title: activePage?.title,
                pageNumber: 1,
                totalCount: 1,
                htmlToRender: editorRef.current?.innerHTML || activePage?.htmlContent || '',
              },
            ]
        ).map((pageItem, pIdx, arr) => (
          <div
            key={pageItem.id || pIdx}
            className={cn('pdf-page-container', pIdx < arr.length - 1 && 'pdf-page-break')}
          >
            {/* 1. Simple Minimalist Header (Platform name & URL in left corner, subject in right corner) */}
            <div className="pdf-header pb-2 mb-6 border-b border-slate-300 flex items-center justify-between">
              <div className="flex flex-col text-left">
                <span className="text-xs font-bold text-slate-800 tracking-tight leading-tight">CampusGrid</span>
                <span className="text-[10px] text-slate-500 font-mono">placify.app/notes</span>
              </div>
              {activeNotebook?.subject && (
                <div className="text-right">
                  <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    {activeNotebook.subject}
                  </span>
                </div>
              )}
            </div>

            {/* 2. Title & Topic Block */}
            <div className="pdf-title-block mb-6">
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight leading-snug">
                {activeNotebook?.title || 'Untitled Notebook'}
              </h1>

              <div className="text-sm text-slate-700 mt-2 font-medium">
                <span className="text-slate-500 font-normal mr-1.5">Chapter / Topic:</span>
                <span className="font-bold text-slate-900">{pageItem.title || `Page ${pageItem.pageNumber}`}</span>
              </div>
            </div>

            {/* 3. Document Content Body */}
            <div
              className="pdf-body-content text-slate-800 leading-relaxed min-h-[350px]"
              dangerouslySetInnerHTML={{
                __html: pageItem.htmlToRender || '<p>No content written in this page.</p>',
              }}
            />

            {/* 4. Document Footer (Page number ONLY at bottom) */}
            <div className="pdf-footer mt-auto pt-8 flex items-center justify-end text-xs font-mono text-slate-600 font-semibold">
              <span>{pageItem.pageNumber}</span>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}
