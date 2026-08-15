import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  StickyNote, X, Plus, Pin, Trash2, Search, ArrowLeft, Save,
  Bold, Italic, Underline, List, ListOrdered, Link2, Undo, Redo, Check
} from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
import { useAuth } from '@/hooks/useAuth'
import { useStickyNotes } from '@/hooks/useStickyNotes'

const COLOR_OPTIONS = [
  { id: 'yellow', name: 'Yellow', bgHex: '#fef08a', borderClass: 'border-amber-500/40 bg-amber-500/10 text-amber-900 dark:text-amber-200 hover:border-amber-500/70', dotClass: 'bg-amber-400' },
  { id: 'pink', name: 'Pink', bgHex: '#fbcfe8', borderClass: 'border-rose-500/40 bg-rose-500/10 text-rose-900 dark:text-rose-200 hover:border-rose-500/70', dotClass: 'bg-rose-400' },
  { id: 'blue', name: 'Sky Blue', bgHex: '#bae6fd', borderClass: 'border-sky-500/40 bg-sky-500/10 text-sky-900 dark:text-sky-200 hover:border-sky-500/70', dotClass: 'bg-sky-400' },
  { id: 'green', name: 'Mint Green', bgHex: '#bbf7d0', borderClass: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-900 dark:text-emerald-200 hover:border-emerald-500/70', dotClass: 'bg-emerald-400' },
  { id: 'purple', name: 'Purple', bgHex: '#e9d5ff', borderClass: 'border-purple-500/40 bg-purple-500/10 text-purple-900 dark:text-purple-200 hover:border-purple-500/70', dotClass: 'bg-purple-400' },
  { id: 'orange', name: 'Orange', bgHex: '#fed7aa', borderClass: 'border-orange-500/40 bg-orange-500/10 text-orange-900 dark:text-orange-200 hover:border-orange-500/70', dotClass: 'bg-orange-400' },
]

export const formatDateDisplay = (dateVal) => {
  if (!dateVal) return 'Just now'
  let d
  if (dateVal && typeof dateVal.toDate === 'function') {
    d = dateVal.toDate()
  } else if (dateVal && dateVal.seconds) {
    d = new Date(dateVal.seconds * 1000)
  } else {
    d = new Date(dateVal)
  }
  if (!d || isNaN(d.getTime())) return 'Just now'
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function StickyNotesDrawer() {
  const { user } = useAuth()
  const { stickyNotesOpen, closeStickyNotes } = useAppStore()
  const { notes, addNote, updateNote, deleteNote } = useStickyNotes(user?.uid)

  const [searchQuery, setSearchQuery] = useState('')
  const [filterTab, setFilterTab] = useState('ALL') // 'ALL' | 'PINNED' | color string
  const [editingNote, setEditingNote] = useState(null) // null = list view, object = editing view

  // Form fields for Editor View
  const [noteTitle, setNoteTitle] = useState('')
  const [noteContent, setNoteContent] = useState('')
  const [noteColor, setNoteColor] = useState('yellow')
  const [isPinned, setIsPinned] = useState(false)

  // WYSIWYG ContentEditable Ref
  const editorRef = useRef(null)

  // Synchronize editor innerHTML when noteContent changes externally
  useEffect(() => {
    if (editorRef.current && editingNote) {
      if (editorRef.current.innerHTML !== noteContent) {
        editorRef.current.innerHTML = noteContent || ''
      }
    }
  }, [editingNote])

  // Execute Rich Text Formatting Commands
  const execCmd = (command, value = null) => {
    if (!editorRef.current) return
    editorRef.current.focus()
    document.execCommand(command, false, value)
    setNoteContent(editorRef.current.innerHTML)
  }

  const handleOpenNewEditor = () => {
    setEditingNote({ isNew: true })
    setNoteTitle('')
    setNoteContent('')
    setNoteColor('yellow')
    setIsPinned(false)
  }

  const handleOpenExistingEditor = (note) => {
    setEditingNote(note)
    setNoteTitle(note.title || '')
    setNoteContent(note.content || '')
    setNoteColor(note.color || 'yellow')
    setIsPinned(!!note.isPinned)
  }

  const handleSaveNote = async (e) => {
    if (e) e.preventDefault()
    const finalContent = editorRef.current ? editorRef.current.innerHTML : noteContent

    if (!noteTitle.trim() && !finalContent.trim()) {
      setEditingNote(null)
      return
    }

    if (editingNote?.isNew) {
      await addNote({
        title: noteTitle.trim() || 'Untitled Note',
        content: finalContent,
        color: noteColor,
        isPinned,
      })
    } else if (editingNote?.id) {
      await updateNote(editingNote.id, {
        title: noteTitle.trim() || 'Untitled Note',
        content: finalContent,
        color: noteColor,
        isPinned,
      })
    }

    setEditingNote(null)
  }

  const filteredNotes = notes
    .filter((n) => {
      const q = searchQuery.toLowerCase()
      const matchesSearch =
        (n.title && n.title.toLowerCase().includes(q)) ||
        (n.content && n.content.toLowerCase().includes(q))

      if (!matchesSearch) return false

      if (filterTab === 'PINNED') return n.isPinned
      if (filterTab !== 'ALL') return n.color === filterTab
      return true
    })
    .sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0))

  return (
    <AnimatePresence>
      {stickyNotesOpen && (
        <>
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeStickyNotes}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
          />

          {/* Right Slide-Over Panel */}
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className="fixed inset-y-0 right-0 w-full sm:w-[440px] bg-surface/90 dark:bg-surface/90 border-l border-border-subtle shadow-2xl z-50 flex flex-col backdrop-blur-2xl text-text-primary"
          >
            {/* VIEW 1: FULL NOTE EDITOR (WYSIWYG) */}
            {editingNote ? (
              <div className="flex-1 flex flex-col h-full bg-surface/50">
                {/* Editor Header Bar */}
                <div className="p-4 border-b border-border-subtle flex items-center justify-between shrink-0 bg-surface/40">
                  <button
                    onClick={() => setEditingNote(null)}
                    className="flex items-center gap-1.5 text-xs font-bold tracking-wider text-text-muted hover:text-text-primary uppercase transition-colors"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    <span>BACK</span>
                  </button>

                  <button
                    onClick={handleSaveNote}
                    className="px-4 py-1.5 rounded-xl bg-accent text-white hover:bg-accent-light font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-md transition-all"
                  >
                    <Save className="h-3.5 w-3.5 fill-current" />
                    <span>SAVE</span>
                  </button>
                </div>

                {/* Editor Form Body */}
                <div className="flex-1 overflow-y-auto p-5 space-y-4 scrollbar-thin flex flex-col">
                  {/* Note Title Input */}
                  <input
                    type="text"
                    placeholder="Note title"
                    value={noteTitle}
                    onChange={(e) => setNoteTitle(e.target.value)}
                    className="w-full bg-card/80 border border-border-subtle rounded-2xl px-4 py-3 text-sm font-bold text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/40 shadow-sm"
                  />

                  {/* WYSIWYG Formatting Toolbar */}
                  <div className="rounded-2xl border border-border-subtle bg-card/80 overflow-hidden shadow-sm flex flex-col flex-1">
                    <div className="p-2 border-b border-border-subtle flex items-center gap-1 flex-wrap text-text-muted bg-surface/40">
                      <button
                        type="button"
                        onMouseDown={(e) => {
                          e.preventDefault()
                          execCmd('bold')
                        }}
                        className="p-1.5 rounded-lg hover:bg-hover hover:text-text-primary transition-colors"
                        title="Bold"
                      >
                        <Bold className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onMouseDown={(e) => {
                          e.preventDefault()
                          execCmd('italic')
                        }}
                        className="p-1.5 rounded-lg hover:bg-hover hover:text-text-primary transition-colors"
                        title="Italic"
                      >
                        <Italic className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onMouseDown={(e) => {
                          e.preventDefault()
                          execCmd('underline')
                        }}
                        className="p-1.5 rounded-lg hover:bg-hover hover:text-text-primary transition-colors"
                        title="Underline"
                      >
                        <Underline className="h-3.5 w-3.5" />
                      </button>
                      <div className="h-4 w-px bg-border-subtle mx-1" />
                      <button
                        type="button"
                        onMouseDown={(e) => {
                          e.preventDefault()
                          execCmd('formatBlock', '<h2>')
                        }}
                        className="p-1.5 rounded-lg hover:bg-hover hover:text-text-primary transition-colors font-bold text-xs"
                        title="Heading 2"
                      >
                        H2
                      </button>
                      <button
                        type="button"
                        onMouseDown={(e) => {
                          e.preventDefault()
                          execCmd('insertUnorderedList')
                        }}
                        className="p-1.5 rounded-lg hover:bg-hover hover:text-text-primary transition-colors"
                        title="Bullet List"
                      >
                        <List className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onMouseDown={(e) => {
                          e.preventDefault()
                          execCmd('insertOrderedList')
                        }}
                        className="p-1.5 rounded-lg hover:bg-hover hover:text-text-primary transition-colors"
                        title="Numbered List"
                      >
                        <ListOrdered className="h-3.5 w-3.5" />
                      </button>
                      <div className="h-4 w-px bg-border-subtle mx-1" />
                      <button
                        type="button"
                        onMouseDown={(e) => {
                          e.preventDefault()
                          const url = prompt('Enter URL:', 'https://')
                          if (url) execCmd('createLink', url)
                        }}
                        className="p-1.5 rounded-lg hover:bg-hover hover:text-text-primary transition-colors"
                        title="Insert Hyperlink"
                      >
                        <Link2 className="h-3.5 w-3.5" />
                      </button>
                      <div className="h-4 w-px bg-border-subtle mx-1" />
                      <button
                        type="button"
                        onMouseDown={(e) => {
                          e.preventDefault()
                          execCmd('undo')
                        }}
                        className="p-1.5 rounded-lg hover:bg-hover hover:text-text-primary transition-colors"
                        title="Undo"
                      >
                        <Undo className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onMouseDown={(e) => {
                          e.preventDefault()
                          execCmd('redo')
                        }}
                        className="p-1.5 rounded-lg hover:bg-hover hover:text-text-primary transition-colors"
                        title="Redo"
                      >
                        <Redo className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    {/* ContentEditable WYSIWYG Area */}
                    <div
                      ref={editorRef}
                      contentEditable
                      suppressContentEditableWarning
                      onInput={() => setNoteContent(editorRef.current?.innerHTML || '')}
                      placeholder="Write your note body content here..."
                      className="w-full flex-1 p-4 bg-transparent text-xs font-normal text-text-primary focus:outline-none overflow-y-auto leading-relaxed min-h-[220px] [&_h2]:text-sm [&_h2]:font-bold [&_h2]:text-text-primary [&_h2]:my-1.5 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:my-1 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:my-1 [&_a]:text-accent [&_a]:underline"
                    />
                  </div>

                  {/* Color Selector & Pin Row */}
                  <div className="p-3.5 rounded-2xl border border-border-subtle bg-card/70 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {COLOR_OPTIONS.map((c) => (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => setNoteColor(c.id)}
                          className={`h-7 w-7 rounded-full ${c.dotClass} flex items-center justify-center transition-transform ${
                            noteColor === c.id ? 'scale-125 ring-2 ring-accent shadow-md' : 'opacity-70 hover:opacity-100'
                          }`}
                        >
                          {noteColor === c.id && <Check className="h-3.5 w-3.5 text-slate-900 font-extrabold" />}
                        </button>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={() => setIsPinned(!isPinned)}
                      className={`px-3 py-1.5 rounded-xl border text-xs font-bold tracking-wider uppercase transition-all flex items-center gap-1.5 ${
                        isPinned
                          ? 'bg-amber-400 text-slate-900 border-amber-400 font-bold shadow-sm'
                          : 'bg-surface hover:bg-hover border-border-subtle text-text-muted'
                      }`}
                    >
                      <Pin className="h-3.5 w-3.5 fill-current" />
                      <span>{isPinned ? 'PINNED' : 'PIN'}</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* VIEW 2: NOTES LIST & FILTER */
              <>
                {/* Header */}
                <div className="p-4 sm:p-5 border-b border-border-subtle flex items-center justify-between shrink-0 bg-surface/30">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-500 dark:text-amber-400 border border-amber-500/30 shadow-md">
                      <StickyNote className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted">STICKY NOTES</p>
                      <h2 className="text-base font-bold tracking-tight text-text-primary">My Notes</h2>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleOpenNewEditor}
                      className="px-3.5 py-1.5 rounded-xl bg-accent text-white hover:bg-accent-light font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-1 shadow-md"
                    >
                      <Plus className="h-4 w-4" />
                      <span>NEW</span>
                    </button>

                    <button
                      onClick={closeStickyNotes}
                      className="p-1.5 rounded-xl text-text-muted hover:text-text-primary hover:bg-hover transition-colors"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                {/* Search & Category Filter Pills Row */}
                <div className="p-4 space-y-3 border-b border-border-subtle shrink-0 bg-surface/20">
                  <div className="relative">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-text-muted" />
                    <input
                      type="text"
                      placeholder="Search notes..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-card/80 border border-border-subtle rounded-2xl pl-9 pr-3 py-2 text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30"
                    />
                  </div>

                  {/* Filter Pills */}
                  <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1">
                    <button
                      onClick={() => setFilterTab('ALL')}
                      className={`px-3 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase transition-all ${
                        filterTab === 'ALL'
                          ? 'bg-accent text-white font-bold shadow-sm'
                          : 'bg-card/60 text-text-muted hover:text-text-primary border border-border-subtle'
                      }`}
                    >
                      ALL
                    </button>
                    <button
                      onClick={() => setFilterTab('PINNED')}
                      className={`px-3 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase transition-all flex items-center gap-1 ${
                        filterTab === 'PINNED'
                          ? 'bg-amber-400 text-slate-900 font-bold shadow-sm'
                          : 'bg-card/60 text-text-muted hover:text-text-primary border border-border-subtle'
                      }`}
                    >
                      <Pin className="h-3 w-3" /> PINNED
                    </button>

                    <div className="h-4 w-px bg-border-subtle mx-1 shrink-0" />

                    {COLOR_OPTIONS.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => setFilterTab(filterTab === c.id ? 'ALL' : c.id)}
                        className={`h-5 w-5 rounded-full ${c.dotClass} shrink-0 transition-transform ${
                          filterTab === c.id ? 'scale-125 ring-2 ring-accent' : 'opacity-70 hover:opacity-100'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* Notes List Cards */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5 scrollbar-thin">
                  {filteredNotes.length === 0 ? (
                    <div className="text-center py-12 border-2 border-dashed border-border-subtle rounded-3xl p-6 space-y-3 bg-card/40">
                      <StickyNote className="h-10 w-10 text-amber-500 dark:text-amber-400 mx-auto animate-bounce" />
                      <p className="text-xs font-bold text-text-secondary">No notes found</p>
                      <button
                        onClick={handleOpenNewEditor}
                        className="mt-2 px-4 py-2 rounded-xl bg-accent text-white font-bold text-xs hover:bg-accent-light shadow-md"
                      >
                        + Create First Note
                      </button>
                    </div>
                  ) : (
                    filteredNotes.map((note) => {
                      const colorTheme = COLOR_OPTIONS.find((c) => c.id === note.color) || COLOR_OPTIONS[0]

                      return (
                        <div
                          key={note.id}
                          onClick={() => handleOpenExistingEditor(note)}
                          className={`p-4 rounded-2xl border transition-all duration-200 relative group cursor-pointer shadow-sm hover:shadow-md hover:scale-[1.01] ${colorTheme.borderClass} backdrop-blur-md`}
                        >
                          <div className="flex items-start justify-between gap-2 pb-1">
                            <h3 className="font-bold text-xs tracking-tight text-text-primary flex-1 truncate">
                              {note.title || 'Untitled Note'}
                            </h3>

                            <div className="flex items-center gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                              <button
                                onClick={() => updateNote(note.id, { isPinned: !note.isPinned })}
                                className={`p-1 rounded-lg text-xs transition-colors ${
                                  note.isPinned ? 'text-amber-500 dark:text-amber-400 fill-current' : 'text-text-muted hover:text-text-primary'
                                }`}
                                title={note.isPinned ? 'Unpin Note' : 'Pin Note'}
                              >
                                <Pin className="h-3.5 w-3.5" />
                              </button>
                              <button
                                onClick={() => deleteNote(note.id)}
                                className="p-1 rounded-lg text-text-muted hover:text-semantic-red transition-colors"
                                title="Delete Note"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>

                          {note.content && (
                            <div
                              className="text-xs text-text-secondary line-clamp-3 leading-relaxed font-normal overflow-hidden mt-1"
                              dangerouslySetInnerHTML={{ __html: note.content }}
                            />
                          )}

                          <div className="flex items-center justify-between pt-2.5 mt-2 border-t border-border-subtle/40 text-[10px] text-text-muted">
                            <span>{formatDateDisplay(note.createdAt)}</span>
                            {note.isPinned && (
                              <span className="font-bold text-amber-500 dark:text-amber-400 flex items-center gap-1">
                                <Pin className="h-3 w-3 fill-current" /> Pinned
                              </span>
                            )}
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>

                {/* Footer Counter */}
                <div className="p-4 border-t border-border-subtle bg-surface/40 text-xs text-text-muted flex items-center justify-between font-medium">
                  <span>{notes.length} total notes</span>
                  <span>{notes.filter((n) => n.isPinned).length} pinned</span>
                </div>
              </>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
