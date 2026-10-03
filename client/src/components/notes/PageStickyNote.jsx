import { useState, useEffect, useRef } from 'react'
import { Pin, X, Palette, Trash2, GripHorizontal } from 'lucide-react'
import { cn } from '@/lib/utils'
import { htmlToCleanText } from '@/utils/textHelpers'

const PAGE_STICKY_COLORS = [
  {
    id: 'yellow',
    name: 'Sunny Yellow',
    cardClass: 'bg-[#fffde7] dark:bg-amber-950/80 border-amber-300/80 dark:border-amber-700/60 text-amber-950 dark:text-amber-100 shadow-[0_8px_24px_rgba(245,158,11,0.2)]',
    tapeClass: 'bg-amber-300/80 dark:bg-amber-700/60 border-amber-400/60',
    dotClass: 'bg-amber-400',
  },
  {
    id: 'pink',
    name: 'Blush Pink',
    cardClass: 'bg-[#fff0f3] dark:bg-rose-950/80 border-rose-300/80 dark:border-rose-700/60 text-rose-950 dark:text-rose-100 shadow-[0_8px_24px_rgba(244,63,94,0.2)]',
    tapeClass: 'bg-rose-300/80 dark:bg-rose-700/60 border-rose-400/60',
    dotClass: 'bg-rose-400',
  },
  {
    id: 'blue',
    name: 'Sky Blue',
    cardClass: 'bg-[#f0f9ff] dark:bg-sky-950/80 border-sky-300/80 dark:border-sky-700/60 text-sky-950 dark:text-sky-100 shadow-[0_8px_24px_rgba(14,165,233,0.2)]',
    tapeClass: 'bg-sky-300/80 dark:bg-sky-700/60 border-sky-400/60',
    dotClass: 'bg-sky-400',
  },
  {
    id: 'green',
    name: 'Mint Green',
    cardClass: 'bg-[#f0fdf4] dark:bg-emerald-950/80 border-emerald-300/80 dark:border-emerald-700/60 text-emerald-950 dark:text-emerald-100 shadow-[0_8px_24px_rgba(16,185,129,0.2)]',
    tapeClass: 'bg-emerald-300/80 dark:bg-emerald-700/60 border-emerald-400/60',
    dotClass: 'bg-emerald-400',
  },
  {
    id: 'purple',
    name: 'Lavender',
    cardClass: 'bg-[#faf5ff] dark:bg-purple-950/80 border-purple-300/80 dark:border-purple-700/60 text-purple-950 dark:text-purple-100 shadow-[0_8px_24px_rgba(168,85,247,0.2)]',
    tapeClass: 'bg-purple-300/80 dark:bg-purple-700/60 border-purple-400/60',
    dotClass: 'bg-purple-400',
  },
  {
    id: 'orange',
    name: 'Tangerine',
    cardClass: 'bg-[#fff7ed] dark:bg-orange-950/80 border-orange-300/80 dark:border-orange-700/60 text-orange-950 dark:text-orange-100 shadow-[0_8px_24px_rgba(249,115,22,0.2)]',
    tapeClass: 'bg-orange-300/80 dark:bg-orange-700/60 border-orange-400/60',
    dotClass: 'bg-orange-400',
  },
]

export default function PageStickyNote({ note, zoom = 100, onUpdate, onDelete }) {
  const [pos, setPos] = useState({ x: note.x || 30, y: note.y || 60 })
  const [text, setText] = useState(note.text || '')
  const [isDragging, setIsDragging] = useState(false)
  const [showColorPicker, setShowColorPicker] = useState(false)
  const noteRef = useRef(null)
  const textareaRef = useRef(null)

  // Sync external prop changes
  useEffect(() => {
    if (!isDragging) {
      setPos({ x: note.x || 30, y: note.y || 60 })
    }
  }, [note.x, note.y, isDragging])

  useEffect(() => {
    setText(note.text || '')
  }, [note.text])

  const currentColor =
    PAGE_STICKY_COLORS.find((c) => c.id === note.color) || PAGE_STICKY_COLORS[0]

  // Smooth dragging handler
  const handlePointerDown = (e) => {
    // Only drag from the header/tape/handle area
    if (
      e.target.closest('button') ||
      e.target.closest('textarea') ||
      e.target.closest('.no-drag')
    ) {
      return
    }

    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)

    const startX = e.clientX
    const startY = e.clientY
    const startNoteX = pos.x
    const startNoteY = pos.y
    const zoomScale = Math.max(0.2, (zoom || 100) / 100)

    let latestX = startNoteX
    let latestY = startNoteY

    const onPointerMove = (moveEvt) => {
      const dx = (moveEvt.clientX - startX) / zoomScale
      const dy = (moveEvt.clientY - startY) / zoomScale
      latestX = Math.max(10, Math.round(startNoteX + dx))
      latestY = Math.max(10, Math.round(startNoteY + dy))
      setPos({ x: latestX, y: latestY })
    }

    const onPointerUp = () => {
      setIsDragging(false)
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerup', onPointerUp)
      onUpdate?.({ x: latestX, y: latestY })
    }

    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('pointerup', onPointerUp)
  }

  // Handle Paste: cleanly strip any rich HTML or tags
  const handlePaste = (e) => {
    e.preventDefault()
    const raw = e.clipboardData.getData('text/html') || e.clipboardData.getData('text/plain') || ''
    const clean = htmlToCleanText(raw)
    const textarea = textareaRef.current
    if (textarea) {
      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      const newText = text.substring(0, start) + clean + text.substring(end)
      setText(newText)
      onUpdate?.({ text: newText })
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + clean.length
      }, 0)
    } else {
      const newText = (text ? text + '\n' : '') + clean
      setText(newText)
      onUpdate?.({ text: newText })
    }
  }

  const handleTextChange = (e) => {
    setText(e.target.value)
  }

  const handleBlur = () => {
    if (text !== note.text) {
      onUpdate?.({ text: htmlToCleanText(text) })
    }
  }

  return (
    <div
      ref={noteRef}
      style={{
        position: 'absolute',
        left: `${pos.x}px`,
        top: `${pos.y}px`,
        width: `${note.width || 220}px`,
        zIndex: isDragging ? 50 : 25,
      }}
      className={cn(
        'group rounded-2xl border transition-shadow duration-150 flex flex-col',
        'backdrop-blur-xs select-none',
        currentColor.cardClass,
        isDragging ? 'shadow-2xl scale-[1.02] cursor-grabbing ring-2 ring-accent/30' : 'cursor-default'
      )}
      onPointerDown={handlePointerDown}
    >
      {/* Top Washi Tape Sticker & Drag Header */}
      <div
        className="w-full pt-2 px-2.5 pb-1 flex items-center justify-between cursor-grab active:cursor-grabbing border-b border-black/5 dark:border-white/5"
        title="Drag to move sticky note on this page"
      >
        <div className="flex items-center gap-1.5 opacity-60 group-hover:opacity-100 transition-opacity">
          <GripHorizontal className="h-3.5 w-3.5" />
          <span className="text-[10px] font-bold uppercase tracking-wider">Note</span>
        </div>

        {/* Decorative Tape Center Piece */}
        <div
          className={cn(
            'h-2.5 w-12 rounded-xs border shadow-2xs backdrop-blur-xs pointer-events-none',
            currentColor.tapeClass
          )}
        />

        {/* Action Buttons: Color picker & Delete */}
        <div className="flex items-center gap-1">
          <div className="relative">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                setShowColorPicker((p) => !p)
              }}
              className="p-1 rounded-md hover:bg-black/10 dark:hover:bg-white/10 opacity-60 hover:opacity-100 transition-opacity"
              title="Change note color"
            >
              <Palette className="h-3 w-3" />
            </button>

            {/* Quick Color Picker Dropdown */}
            {showColorPicker && (
              <div
                className="absolute top-6 right-0 z-50 p-1.5 bg-surface/95 rounded-xl shadow-xl border border-border-subtle flex items-center gap-1 animate-in zoom-in-95 no-drag"
                onClick={(e) => e.stopPropagation()}
              >
                {PAGE_STICKY_COLORS.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => {
                      onUpdate?.({ color: c.id })
                      setShowColorPicker(false)
                    }}
                    className={cn(
                      'h-4 w-4 rounded-full transition-transform',
                      c.dotClass,
                      note.color === c.id ? 'ring-2 ring-accent scale-110' : 'hover:scale-110 opacity-70 hover:opacity-100'
                    )}
                    title={c.name}
                  />
                ))}
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onDelete?.()
            }}
            className="p-1 rounded-md hover:bg-black/10 dark:hover:bg-white/10 text-semantic-red opacity-60 hover:opacity-100 transition-opacity"
            title="Remove sticky note from this page"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      </div>

      {/* Writing Space: Clean, expansive textarea with zero heavy borders */}
      <div className="p-2.5 flex-1 flex flex-col no-drag">
        <textarea
          ref={textareaRef}
          rows={4}
          value={text}
          onChange={handleTextChange}
          onBlur={handleBlur}
          onPaste={handlePaste}
          placeholder="Write a quick thought..."
          className="w-full bg-transparent border-none p-0 text-xs leading-relaxed resize-y font-normal placeholder:opacity-40 focus:outline-none focus:ring-0 text-inherit select-text min-h-[70px]"
        />
      </div>

      {/* Folded Dog-Ear Corner */}
      <div className="absolute bottom-0 right-0 w-3 h-3 bg-gradient-to-tl from-black/15 dark:from-white/10 to-transparent rounded-tl-xs pointer-events-none" />
    </div>
  )
}
