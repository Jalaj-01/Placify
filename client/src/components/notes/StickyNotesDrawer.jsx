import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  StickyNote, X, Plus, Pin, Trash2, Search, Check, Sparkles, AlertCircle
} from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
import { useAuth } from '@/hooks/useAuth'
import { useStickyNotes } from '@/hooks/useStickyNotes'

const COLOR_THEMES = [
  { id: 'yellow', name: 'Yellow', bg: 'bg-yellow-500/15 border-yellow-500/40 text-yellow-200', dot: 'bg-yellow-400' },
  { id: 'blue', name: 'Sky Blue', bg: 'bg-sky-500/15 border-sky-500/40 text-sky-200', dot: 'bg-sky-400' },
  { id: 'green', name: 'Mint Green', bg: 'bg-emerald-500/15 border-emerald-500/40 text-emerald-200', dot: 'bg-emerald-400' },
  { id: 'pink', name: 'Pink', bg: 'bg-rose-500/15 border-rose-500/40 text-rose-200', dot: 'bg-rose-400' },
  { id: 'purple', name: 'Purple', bg: 'bg-purple-500/15 border-purple-500/40 text-purple-200', dot: 'bg-purple-400' },
]

export default function StickyNotesDrawer() {
  const { user } = useAuth()
  const { stickyNotesOpen, closeStickyNotes } = useAppStore()
  const { notes, addNote, updateNote, deleteNote } = useStickyNotes(user?.uid)

  const [searchQuery, setSearchQuery] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newContent, setNewContent] = useState('')
  const [selectedColor, setSelectedColor] = useState('yellow')
  const [isPinned, setIsPinned] = useState(false)

  const handleCreateNote = async (e) => {
    e.preventDefault()
    if (!newTitle.trim() && !newContent.trim()) return

    await addNote({
      title: newTitle.trim() || 'Untitled Note',
      content: newContent.trim(),
      color: selectedColor,
      isPinned,
    })

    setNewTitle('')
    setNewContent('')
    setIsPinned(false)
    setShowAddForm(false)
  }

  const filteredNotes = notes
    .filter((n) => {
      const q = searchQuery.toLowerCase()
      return (
        (n.title && n.title.toLowerCase().includes(q)) ||
        (n.content && n.content.toLowerCase().includes(q))
      )
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
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Right Slide-Over Panel */}
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className="fixed inset-y-0 right-0 w-full sm:w-[420px] bg-surface/95 dark:bg-[#0d0e17] border-l border-white/10 shadow-2xl z-50 flex flex-col backdrop-blur-2xl"
          >
            {/* Header */}
            <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between shrink-0 bg-base/40">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 shadow-md">
                  <StickyNote className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-text-primary flex items-center gap-2">
                    Sticky Notes
                  </h2>
                  <p className="text-[11px] text-text-muted">
                    Quick thoughts, revision reminders & study notes
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowAddForm(!showAddForm)}
                  className="px-3 py-1.5 rounded-xl bg-accent text-white font-semibold text-xs hover:bg-accent-light transition-all flex items-center gap-1.5 shadow-md shadow-accent/20"
                >
                  <Plus className="h-4 w-4" />
                  <span>New Note</span>
                </button>

                <button
                  onClick={closeStickyNotes}
                  className="p-1.5 rounded-xl text-text-muted hover:text-text-primary hover:bg-white/10 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 scrollbar-thin">
              {/* Add Note Form */}
              {showAddForm && (
                <form onSubmit={handleCreateNote} className="p-4 rounded-2xl bg-base border border-accent/40 shadow-xl space-y-3 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-accent flex items-center gap-1">
                      <Sparkles className="h-3.5 w-3.5" /> Create Sticky Note
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsPinned(!isPinned)}
                      className={`p-1 rounded-lg text-xs font-medium transition-colors flex items-center gap-1 ${
                        isPinned ? 'bg-accent/20 text-accent font-bold' : 'text-text-muted hover:text-text-primary'
                      }`}
                    >
                      <Pin className="h-3.5 w-3.5" /> {isPinned ? 'Pinned' : 'Pin Note'}
                    </button>
                  </div>

                  <input
                    type="text"
                    placeholder="Note Title..."
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full bg-surface border border-white/10 rounded-xl px-3 py-2 text-xs font-semibold text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent"
                  />

                  <textarea
                    rows={3}
                    placeholder="Write your note content here..."
                    value={newContent}
                    onChange={(e) => setNewContent(e.target.value)}
                    className="w-full bg-surface border border-white/10 rounded-xl px-3 py-2 text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent resize-none"
                  />

                  {/* Color Palette Selector */}
                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-1.5">
                      {COLOR_THEMES.map((theme) => (
                        <button
                          key={theme.id}
                          type="button"
                          onClick={() => setSelectedColor(theme.id)}
                          className={`h-6 w-6 rounded-full ${theme.dot} flex items-center justify-center transition-transform ${
                            selectedColor === theme.id ? 'scale-125 ring-2 ring-white' : 'opacity-70 hover:opacity-100'
                          }`}
                        >
                          {selectedColor === theme.id && <Check className="h-3 w-3 text-black font-extrabold" />}
                        </button>
                      ))}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setShowAddForm(false)}
                        className="px-3 py-1.5 text-xs text-text-muted hover:text-text-primary"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-1.5 rounded-xl bg-accent text-white font-bold text-xs shadow-md hover:bg-accent-light"
                      >
                        Save Note
                      </button>
                    </div>
                  </div>
                </form>
              )}

              {/* Search input */}
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-text-muted" />
                <input
                  type="text"
                  placeholder="Search notes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-base/60 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-white/30"
                />
              </div>

              {/* Sticky Notes Grid */}
              {filteredNotes.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-white/10 rounded-2xl p-6 space-y-3 bg-base/20">
                  <StickyNote className="h-10 w-10 text-yellow-400/60 mx-auto animate-bounce" />
                  <p className="text-xs font-semibold text-text-secondary">No sticky notes found</p>
                  <p className="text-[11px] text-text-muted">
                    Click <span className="text-accent font-bold">+ New Note</span> to add quick reminders, formula notes, or key concepts!
                  </p>
                  <button
                    onClick={() => setShowAddForm(true)}
                    className="mt-2 px-4 py-2 rounded-xl bg-accent/20 text-accent font-bold text-xs hover:bg-accent/30 border border-accent/30"
                  >
                    + Create Your First Note
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredNotes.map((note) => {
                    const theme = COLOR_THEMES.find((t) => t.id === note.color) || COLOR_THEMES[0]

                    return (
                      <div
                        key={note.id}
                        className={`p-4 rounded-2xl border transition-all duration-200 relative group shadow-md ${theme.bg}`}
                      >
                        <div className="flex items-start justify-between gap-2 pb-1.5">
                          <h3 className="font-bold text-xs tracking-tight text-text-primary flex-1 truncate">
                            {note.title || 'Untitled Note'}
                          </h3>

                          <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => updateNote(note.id, { isPinned: !note.isPinned })}
                              className={`p-1 rounded-lg text-xs transition-colors ${
                                note.isPinned ? 'text-yellow-400 fill-current' : 'text-text-muted hover:text-text-primary'
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
                          <p className="text-xs text-text-secondary whitespace-pre-wrap leading-relaxed">
                            {note.content}
                          </p>
                        )}

                        <div className="flex items-center justify-between pt-3 mt-2 border-t border-white/10 text-[10px] text-text-muted">
                          <span>
                            {note.createdAt ? new Date(note.createdAt).toLocaleDateString() : 'Just now'}
                          </span>
                          {note.isPinned && (
                            <span className="font-bold text-yellow-400 flex items-center gap-1">
                              <Pin className="h-3 w-3" /> Pinned
                            </span>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Footer Summary */}
            <div className="p-4 border-t border-white/10 bg-base/60 text-xs text-text-muted flex items-center justify-between">
              <span>{notes.length} total notes</span>
              <span className="font-semibold">{notes.filter((n) => n.isPinned).length} pinned</span>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
