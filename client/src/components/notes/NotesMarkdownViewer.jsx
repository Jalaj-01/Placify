import React from 'react'

/**
 * Lightweight, safe Markdown & formatted note renderer for Placify Lecture Notes.
 */
export default function NotesMarkdownViewer({ content, className = '' }) {
  if (!content || !content.trim()) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center text-text-muted">
        <p className="text-xs italic">No notes written yet. Switch to "Write" tab or press Ctrl+B, Ctrl+H to start typing!</p>
      </div>
    )
  }

  // Parse inline text formatting (bold, italic, underline, inline code, links, strikethrough)
  const parseInline = (text) => {
    if (!text) return text

    // Helper to safely replace inline patterns
    let tokens = [text]

    // 1. Underline <u>text</u> or <ins>text</ins>
    tokens = tokens.flatMap((token) => {
      if (typeof token !== 'string') return [token]
      const parts = []
      let lastIndex = 0
      const regex = /<(?:u|ins)>(.*?)<\/(?:u|ins)>/gi
      let match
      while ((match = regex.exec(token)) !== null) {
        if (match.index > lastIndex) {
          parts.push(token.substring(lastIndex, match.index))
        }
        parts.push(
          <u key={`u-${match.index}`} className="underline decoration-accent/60 underline-offset-2">
            {match[1]}
          </u>
        )
        lastIndex = regex.lastIndex
      }
      if (lastIndex < token.length) {
        parts.push(token.substring(lastIndex))
      }
      return parts.length > 0 ? parts : [token]
    })

    // 2. Bold: **text** or __text__
    tokens = tokens.flatMap((token) => {
      if (typeof token !== 'string') return [token]
      const parts = []
      let lastIndex = 0
      const regex = /(\*\*|__)(.*?)\1/g
      let match
      while ((match = regex.exec(token)) !== null) {
        if (match.index > lastIndex) {
          parts.push(token.substring(lastIndex, match.index))
        }
        parts.push(
          <strong key={`b-${match.index}`} className="font-bold text-text-primary">
            {match[2]}
          </strong>
        )
        lastIndex = regex.lastIndex
      }
      if (lastIndex < token.length) {
        parts.push(token.substring(lastIndex))
      }
      return parts.length > 0 ? parts : [token]
    })

    // 3. Strikethrough: ~~text~~
    tokens = tokens.flatMap((token) => {
      if (typeof token !== 'string') return [token]
      const parts = []
      let lastIndex = 0
      const regex = /~~(.*?)~~/g
      let match
      while ((match = regex.exec(token)) !== null) {
        if (match.index > lastIndex) {
          parts.push(token.substring(lastIndex, match.index))
        }
        parts.push(
          <del key={`del-${match.index}`} className="line-through text-text-muted">
            {match[1]}
          </del>
        )
        lastIndex = regex.lastIndex
      }
      if (lastIndex < token.length) {
        parts.push(token.substring(lastIndex))
      }
      return parts.length > 0 ? parts : [token]
    })

    // 4. Italic: *text* or _text_
    tokens = tokens.flatMap((token) => {
      if (typeof token !== 'string') return [token]
      const parts = []
      let lastIndex = 0
      const regex = /(?<!\*)\*(?!\*)(.*?)\*(?!\*)|(?<!_)_(?!_)(.*?)_(?!_)/g
      let match
      while ((match = regex.exec(token)) !== null) {
        if (match.index > lastIndex) {
          parts.push(token.substring(lastIndex, match.index))
        }
        const textVal = match[1] || match[2]
        parts.push(
          <em key={`i-${match.index}`} className="italic text-text-secondary">
            {textVal}
          </em>
        )
        lastIndex = regex.lastIndex
      }
      if (lastIndex < token.length) {
        parts.push(token.substring(lastIndex))
      }
      return parts.length > 0 ? parts : [token]
    })

    // 5. Inline Code: `code`
    tokens = tokens.flatMap((token) => {
      if (typeof token !== 'string') return [token]
      const parts = []
      let lastIndex = 0
      const regex = /`([^`]+)`/g
      let match
      while ((match = regex.exec(token)) !== null) {
        if (match.index > lastIndex) {
          parts.push(token.substring(lastIndex, match.index))
        }
        parts.push(
          <code
            key={`code-${match.index}`}
            className="px-1.5 py-0.5 rounded bg-surface border border-border-subtle/80 text-accent font-mono text-[11px]"
          >
            {match[1]}
          </code>
        )
        lastIndex = regex.lastIndex
      }
      if (lastIndex < token.length) {
        parts.push(token.substring(lastIndex))
      }
      return parts.length > 0 ? parts : [token]
    })

    // 6. Links: [label](url)
    tokens = tokens.flatMap((token) => {
      if (typeof token !== 'string') return [token]
      const parts = []
      let lastIndex = 0
      const regex = /\[([^\]]+)\]\((https?:\/\/[^\s\)]+)\)/g
      let match
      while ((match = regex.exec(token)) !== null) {
        if (match.index > lastIndex) {
          parts.push(token.substring(lastIndex, match.index))
        }
        parts.push(
          <a
            key={`a-${match.index}`}
            href={match[2]}
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent hover:underline hover:text-accent-light font-medium"
          >
            {match[1]}
          </a>
        )
        lastIndex = regex.lastIndex
      }
      if (lastIndex < token.length) {
        parts.push(token.substring(lastIndex))
      }
      return parts.length > 0 ? parts : [token]
    })

    return tokens
  }

  // Parse lines and group into blocks
  const lines = content.split('\n')
  const elements = []
  let index = 0

  while (index < lines.length) {
    const line = lines[index]
    const trimmed = line.trim()

    // 1. Code block ```
    if (trimmed.startsWith('```')) {
      const lang = trimmed.slice(3).trim()
      const codeLines = []
      index++
      while (index < lines.length && !lines[index].trim().startsWith('```')) {
        codeLines.push(lines[index])
        index++
      }
      index++ // Skip closing ```
      elements.push(
        <div key={`code-block-${index}`} className="my-2 rounded-xl bg-base border border-border-subtle overflow-hidden">
          {lang && (
            <div className="px-3 py-1 bg-surface text-[10px] font-mono uppercase text-text-muted border-b border-border-subtle">
              {lang}
            </div>
          )}
          <pre className="p-3 text-[11px] font-mono text-text-primary overflow-x-auto whitespace-pre leading-relaxed">
            {codeLines.join('\n')}
          </pre>
        </div>
      )
      continue
    }

    // 2. Headings (# H1, ## H2, ### H3, #### H4)
    if (trimmed.startsWith('#')) {
      const match = trimmed.match(/^(#{1,4})\s+(.*)$/)
      if (match) {
        const level = match[1].length
        const headingText = match[2]
        if (level === 1) {
          elements.push(
            <h1 key={`h1-${index}`} className="text-sm sm:text-base font-extrabold text-text-primary mt-3 mb-1.5 flex items-center gap-1.5 border-b border-border-subtle/50 pb-1">
              <span className="text-accent text-xs">#</span>
              <span>{parseInline(headingText)}</span>
            </h1>
          )
        } else if (level === 2) {
          elements.push(
            <h2 key={`h2-${index}`} className="text-xs sm:text-sm font-bold text-text-primary mt-2.5 mb-1 flex items-center gap-1.5">
              <span className="text-accent/80 text-[10px]">##</span>
              <span>{parseInline(headingText)}</span>
            </h2>
          )
        } else {
          elements.push(
            <h3 key={`h3-${index}`} className="text-xs font-semibold text-text-primary mt-2 mb-1 flex items-center gap-1.5">
              <span className="text-text-muted text-[10px]">###</span>
              <span>{parseInline(headingText)}</span>
            </h3>
          )
        }
        index++
        continue
      }
    }

    // 3. Blockquote >
    if (trimmed.startsWith('>')) {
      const quoteText = trimmed.replace(/^>\s?/, '')
      elements.push(
        <blockquote
          key={`quote-${index}`}
          className="my-2 pl-3 border-l-2 border-accent text-text-secondary text-xs italic bg-accent/5 py-1 rounded-r"
        >
          {parseInline(quoteText)}
        </blockquote>
      )
      index++
      continue
    }

    // 4. Horizontal Rule --- or ***
    if (/^(---|---|\*\*\*)$/.test(trimmed)) {
      elements.push(<hr key={`hr-${index}`} className="my-3 border-border-subtle" />)
      index++
      continue
    }

    // 5. Task list item - [ ] or - [x]
    if (/^-\s+\[([ xX])\]\s+(.*)$/.test(trimmed)) {
      const match = trimmed.match(/^-\s+\[([ xX])\]\s+(.*)$/)
      const isChecked = match[1].toLowerCase() === 'x'
      const itemText = match[2]
      elements.push(
        <div key={`task-${index}`} className="flex items-start gap-2 my-1 text-xs">
          <input
            type="checkbox"
            checked={isChecked}
            readOnly
            className="mt-0.5 rounded border-border-subtle text-accent focus:ring-0 cursor-default"
          />
          <span className={isChecked ? 'line-through text-text-muted' : 'text-text-primary'}>
            {parseInline(itemText)}
          </span>
        </div>
      )
      index++
      continue
    }

    // 6. Bullet lists (- or *)
    if (/^[-*]\s+(.*)$/.test(trimmed)) {
      const listItems = []
      while (index < lines.length && /^[-*]\s+(.*)$/.test(lines[index].trim())) {
        const itemMatch = lines[index].trim().match(/^[-*]\s+(.*)$/)
        listItems.push(itemMatch[1])
        index++
      }
      elements.push(
        <ul key={`ul-${index}`} className="my-1.5 space-y-1 pl-4 list-disc marker:text-accent text-xs text-text-primary">
          {listItems.map((li, i) => (
            <li key={i} className="leading-relaxed">
              {parseInline(li)}
            </li>
          ))}
        </ul>
      )
      continue
    }

    // 7. Numbered lists (1., 2., etc.)
    if (/^\d+\.\s+(.*)$/.test(trimmed)) {
      const listItems = []
      while (index < lines.length && /^\d+\.\s+(.*)$/.test(lines[index].trim())) {
        const itemMatch = lines[index].trim().match(/^\d+\.\s+(.*)$/)
        listItems.push(itemMatch[1])
        index++
      }
      elements.push(
        <ol key={`ol-${index}`} className="my-1.5 space-y-1 pl-4 list-decimal marker:text-accent-light marker:font-bold text-xs text-text-primary">
          {listItems.map((li, i) => (
            <li key={i} className="leading-relaxed">
              {parseInline(li)}
            </li>
          ))}
        </ol>
      )
      continue
    }

    // 8. Empty line
    if (trimmed === '') {
      elements.push(<div key={`empty-${index}`} className="h-2" />)
      index++
      continue
    }

    // 9. Standard Paragraph
    elements.push(
      <p key={`p-${index}`} className="text-xs text-text-primary leading-relaxed my-0.5">
        {parseInline(line)}
      </p>
    )
    index++
  }

  return <div className={`space-y-0.5 leading-relaxed break-words ${className}`}>{elements}</div>
}
