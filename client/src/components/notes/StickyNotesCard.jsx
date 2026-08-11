import { useState } from 'react'
import { StickyNote, Plus, Pin, ArrowRight } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
import { useAuth } from '@/hooks/useAuth'
import { useStickyNotes } from '@/hooks/useStickyNotes'

export default function StickyNotesCard() {
  const { user } = useAuth()
  const { openStickyNotes } = useAppStore()
  const { notes, addNote } = useStickyNotes(user?.uid)

  const [isCreatingInline, setIsCreatingInline] = useState(false)
  const [inlineTitle, setInlineTitle] = useState('')
  const [inlineContent, setInlineContent] = useState('')

  const totalNotes = notes.length
  const pinnedNotes = notes.filter((n) => n.isPinned).length
  const previewNotes = notes.slice(0, 2)

  const handleSaveInline = async (e) => {
    e.preventDefault()
    if (!inlineTitle.trim() && !inlineContent.trim()) {
      setIsCreatingInline(false)
      return
    }
    await addNote({
      title: inlineTitle.trim() || 'Quick Note',
      content: inlineContent.trim(),
      color: 'yellow',
      isPinned: false,
    })
    setInlineTitle('')
    setInlineContent('')
    setIsCreatingInline(false)
  }

  return (
    <div className="rounded-3xl bg-surface/90 border border-white/10 p-5 shadow-xl backdrop-blur-xl space-y-4 hover:border-yellow-500/30 transition-all duration-300">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-xl bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 flex items-center justify-center shadow-sm">
            <StickyNote className="h-4.5 w-4.5" />
          </div>
          <h2 className="text-xs font-black uppercase tracking-wider text-text-primary">
            Sticky Notes
          </h2>
        </div>

        <button
          onClick={() => {
            setIsCreatingInline(true)
            openStickyNotes()
          }}
          className="p-1.5 rounded-xl hover:bg-white/10 text-text-muted hover:text-text-primary transition-colors"
          title="Create New Sticky Note"
        >
          <Plus className="h-4.5 w-4.5" />
        </button>
      </div>

      {/* Dashed Empty State Container (Matching User Screenshot 2) */}
      {totalNotes === 0 && !isCreatingInline ? (
        <button
          onClick={openStickyNotes}
          className="w-full py-7 px-4 rounded-2xl border-2 border-dashed border-accent/60 hover:border-accent bg-accent/5 hover:bg-accent/10 transition-all flex flex-col items-center justify-center gap-2 group cursor-pointer"
        >
          <div className="flex items-center gap-2 text-accent font-bold text-sm group-hover:scale-105 transition-transform">
            <Plus className="h-5 w-5" />
            <span>Create your first note</span>
          </div>
        </button>
      ) : isCreatingInline ? (
        <form onSubmit={handleSaveInline} className="p-3 rounded-2xl bg-base border border-yellow-500/40 space-y-2 animate-in fade-in">
          <input
            type="text"
            placeholder="Quick Note Title..."
            value={inlineTitle}
            onChange={(e) => setInlineTitle(e.target.value)}
            className="w-full bg-surface border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-text-primary focus:outline-none focus:border-yellow-400"
            autoFocus
          />
          <textarea
            rows={2}
            placeholder="Write quick note body..."
            value={inlineContent}
            onChange={(e) => setInlineContent(e.target.value)}
            className="w-full bg-surface border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-text-primary focus:outline-none focus:border-yellow-400 resize-none"
          />
          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setIsCreatingInline(false)}
              className="text-[11px] text-text-muted hover:text-text-primary px-2 py-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-3 py-1 rounded-lg bg-yellow-400 text-black font-bold text-xs hover:bg-yellow-300"
            >
              Save
            </button>
          </div>
        </form>
      ) : (
        /* Preview Notes Grid */
        <div className="space-y-2">
          {previewNotes.map((note) => (
            <div
              key={note.id}
              onClick={openStickyNotes}
              className="p-3 rounded-2xl bg-yellow-500/10 border border-yellow-500/30 hover:border-yellow-400/50 cursor-pointer transition-all space-y-1"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-text-primary truncate">
                  {note.title || 'Untitled Note'}
                </span>
                {note.isPinned && <Pin className="h-3 w-3 text-yellow-400 fill-current" />}
              </div>
              {note.content && (
                <p className="text-[11px] text-text-secondary line-clamp-1">
                  {note.content}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Footer Metrics & OPEN ALL Trigger (Matching User Screenshot 2) */}
      <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 text-text-muted font-medium text-[11px]">
          <span>{totalNotes} total</span>
          <span>·</span>
          <span>{pinnedNotes} pinned</span>
        </div>

        <button
          onClick={openStickyNotes}
          className="text-xs font-extrabold tracking-wider text-accent hover:text-accent-light flex items-center gap-1 transition-colors group"
        >
          <span>OPEN ALL</span>
          <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  )
}
