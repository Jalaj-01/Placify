import { useState, useRef, useEffect } from 'react'
import {
  ArrowLeft, Users, Play, Plus, Trash2, ArrowUp, ArrowDown,
  Maximize2, Minimize2, Download, Copy, Check, Hash, Send,
  FileText, Code2, CheckSquare, Sparkles, BookOpen, AlertCircle,
  Lightbulb, ShieldAlert, Cpu, Eye, Edit3, Terminal
} from 'lucide-react'
import NotesMarkdownViewer from '@/components/notes/NotesMarkdownViewer'

const PAPER_THEMES = [
  { id: 'ruled', label: 'Ruled Lines', class: 'paper-ruled' },
  { id: 'grid', label: 'Graph Grid', class: 'paper-grid' },
  { id: 'clean', label: 'Clean Paper', class: 'paper-clean' },
  { id: 'sepia', label: 'Warm Parchment', class: 'paper-sepia' },
  { id: 'dark', label: 'Terminal Dark', class: 'paper-dark' },
]

export default function NotebookWorkspace({
  notebook,
  activePage,
  activeCollaborators = [],
  typingStatus = null,
  onBack,
  onUpdateNotebook,
  onAddPage,
  onDeletePage,
  onRenamePage,
  onSelectPage,
  onAddCell,
  onUpdateCell,
  onDeleteCell,
  onMoveCell,
  onExecuteCode,
  onSendInvite,
  onEmitTyping,
  isExpanded = false,
  onToggleExpanded,
}) {
  const [editingTitle, setEditingTitle] = useState(notebook?.title || '')
  const [showCollabModal, setShowCollabModal] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteMessage, setInviteMessage] = useState('')
  const [isSendingInvite, setIsSendingInvite] = useState(false)
  const [copiedCode, setCopiedCode] = useState(false)

  // Page rename popover state
  const [renamingPageId, setRenamingPageId] = useState(null)
  const [newPageTitle, setNewPageTitle] = useState('')

  // Cell editing state
  const [previewMarkdownCellId, setPreviewMarkdownCellId] = useState(null)

  useEffect(() => {
    setEditingTitle(notebook?.title || '')
  }, [notebook?.title])

  const handleTitleBlur = () => {
    if (editingTitle.trim() && editingTitle !== notebook?.title) {
      onUpdateNotebook(notebook.id, { title: editingTitle.trim() })
    }
  }

  const handleThemeChange = (themeId) => {
    onUpdateNotebook(notebook.id, { paperStyle: themeId })
  }

  const handleStartRenamePage = (page) => {
    setRenamingPageId(page.id)
    setNewPageTitle(page.title)
  }

  const handleSaveRenamePage = (pageId) => {
    if (newPageTitle.trim()) {
      onRenamePage(notebook.id, pageId, newPageTitle.trim())
    }
    setRenamingPageId(null)
  }

  const handleSendInviteSubmit = async (e) => {
    e.preventDefault()
    if (!inviteEmail.trim()) return
    setIsSendingInvite(true)
    setInviteMessage('')

    const res = await onSendInvite(inviteEmail.trim(), notebook.title, notebook.collabRoomId)
    setIsSendingInvite(false)

    if (res?.success) {
      setInviteMessage(`Invite sent to ${res.targetUser?.displayName || inviteEmail}!`)
      setInviteEmail('')
      setTimeout(() => setInviteMessage(''), 3000)
    } else {
      setInviteMessage(res?.error || 'Failed to send invite.')
    }
  }

  const handleExportMarkdown = () => {
    let md = `# ${notebook.title}\n**Subject:** ${notebook.subject}\n**Exported:** ${new Date().toLocaleString()}\n\n---\n\n`
    notebook.pages?.forEach((page) => {
      md += `## ${page.title}\n\n`
      page.cells?.forEach((cell) => {
        if (cell.type === 'markdown') {
          md += `${cell.content}\n\n`
        } else if (cell.type === 'code') {
          md += `\`\`\`${cell.language || 'javascript'}\n${cell.content}\n\`\`\`\n`
          if (cell.output) {
            md += `> **Output:**\n> ${cell.output.replace(/\n/g, '\n> ')}\n\n`
          }
        } else if (cell.type === 'checklist') {
          md += `### ${cell.title || 'Checklist'}\n`
          cell.items?.forEach((item) => {
            md += `- [${item.done ? 'x' : ' '}] ${item.text}\n`
          })
          md += '\n'
        } else if (cell.type === 'callout') {
          md += `> **${cell.title || 'Note'}:** ${cell.content}\n\n`
        }
      })
      md += '---\n\n'
    })

    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${notebook.title.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'notebook'}.md`
    a.click()
    URL.revokeObjectURL(a)
  }

  const currentTheme = PAPER_THEMES.find((t) => t.id === (notebook.paperStyle || 'ruled')) || PAPER_THEMES[0]

  return (
    <div className="flex-1 flex flex-col h-full bg-surface overflow-hidden text-text-primary">
      {/* ── TOP NAV BAR ── */}
      <div className="p-3.5 sm:p-4 border-b border-border-subtle bg-surface/80 backdrop-blur-md flex items-center justify-between gap-3 shrink-0 flex-wrap">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <button
            onClick={onBack}
            className="p-1.5 rounded-xl hover:bg-hover text-text-muted hover:text-text-primary transition-colors shrink-0"
            title="Back to Notebooks Shelf"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>

          <input
            type="text"
            value={editingTitle}
            onChange={(e) => setEditingTitle(e.target.value)}
            onBlur={handleTitleBlur}
            onKeyDown={(e) => e.key === 'Enter' && e.target.blur()}
            className="text-sm sm:text-base font-bold text-text-primary bg-transparent border-b border-transparent hover:border-border-subtle focus:border-accent focus:outline-none transition-colors truncate max-w-xs sm:max-w-md px-1"
            title="Click to rename notebook"
          />

          <span className="hidden sm:inline-block px-2 py-0.5 rounded-full bg-accent/15 text-accent text-[10px] font-bold uppercase tracking-wider shrink-0">
            {notebook.subject || 'DSA'}
          </span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Paper Theme Selector */}
          <select
            value={notebook.paperStyle || 'ruled'}
            onChange={(e) => handleThemeChange(e.target.value)}
            className="text-[11px] py-1 pl-2 pr-6"
            title="Paper Style Theme"
          >
            {PAPER_THEMES.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label}
              </option>
            ))}
          </select>

          {/* Collaborate Live Button & Peer Stack */}
          <button
            onClick={() => setShowCollabModal(true)}
            className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs ${
              notebook.isCollaborative
                ? 'bg-semantic-green/15 text-semantic-green border-semantic-green/30 hover:bg-semantic-green/25'
                : 'bg-card border-border-subtle hover:bg-hover text-text-secondary'
            }`}
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-semantic-green opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-semantic-green" />
            </span>
            <Users className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Collaborate</span>
            {activeCollaborators.length > 0 && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full bg-semantic-green/20 text-semantic-green text-[10px] font-mono">
                {activeCollaborators.length + 1}
              </span>
            )}
          </button>

          {/* Export Markdown */}
          <button
            onClick={handleExportMarkdown}
            className="p-1.5 rounded-xl hover:bg-hover text-text-muted hover:text-text-primary transition-colors"
            title="Export as Markdown (.md)"
          >
            <Download className="h-4 w-4" />
          </button>

          {/* Canvas Expand / Maximize toggle */}
          {onToggleExpanded && (
            <button
              onClick={onToggleExpanded}
              className="p-1.5 rounded-xl hover:bg-hover text-text-muted hover:text-text-primary transition-colors"
              title={isExpanded ? 'Collapse to Side Drawer' : 'Expand to Full Workspace'}
            >
              {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </button>
          )}
        </div>
      </div>

      {/* ── COLLABORATION STATUS BANNER ── */}
      {typingStatus && (
        <div className="px-4 py-1.5 bg-accent/10 border-b border-accent/20 text-xs text-accent flex items-center gap-2 animate-in fade-in shrink-0">
          <span className="h-2 w-2 rounded-full bg-accent animate-pulse" />
          <span className="font-semibold">{typingStatus.name}</span> is editing a section...
        </div>
      )}

      {/* ── PAGES / CHAPTERS TABS BAR ── */}
      <div className="px-4 py-2 border-b border-border-subtle bg-surface/50 flex items-center gap-1.5 overflow-x-auto scrollbar-none shrink-0">
        {notebook.pages?.map((page, idx) => {
          const isActive = page.id === activePage?.id
          const isRenaming = renamingPageId === page.id

          if (isRenaming) {
            return (
              <div key={page.id} className="flex items-center gap-1 bg-card border border-accent rounded-xl p-1 shrink-0">
                <input
                  type="text"
                  value={newPageTitle}
                  onChange={(e) => setNewPageTitle(e.target.value)}
                  onBlur={() => handleSaveRenamePage(page.id)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSaveRenamePage(page.id)}
                  autoFocus
                  className="text-xs bg-transparent px-2 py-0.5 text-text-primary focus:outline-none w-32 font-bold"
                />
                <button
                  onClick={() => handleSaveRenamePage(page.id)}
                  className="text-xs text-accent hover:text-accent-light px-1"
                >
                  ✓
                </button>
              </div>
            )
          }

          return (
            <div
              key={page.id}
              onClick={() => onSelectPage(page.id)}
              onDoubleClick={() => handleStartRenamePage(page)}
              className={`group flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-all shrink-0 border ${
                isActive
                  ? 'bg-accent/15 text-accent border-accent/30 font-bold shadow-xs'
                  : 'bg-card/40 text-text-muted hover:text-text-primary hover:bg-hover border-border-subtle'
              }`}
            >
              <FileText className="h-3.5 w-3.5" />
              <span className="whitespace-nowrap max-w-[130px] truncate">{page.title || `Page ${idx + 1}`}</span>

              {/* Page Controls */}
              <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleStartRenamePage(page)
                  }}
                  className="p-0.5 text-text-muted hover:text-text-primary"
                  title="Rename page"
                >
                  <Edit3 className="h-2.5 w-2.5" />
                </button>
                {notebook.pages.length > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onDeletePage(notebook.id, page.id)
                    }}
                    className="p-0.5 text-text-muted hover:text-semantic-red"
                    title="Delete page"
                  >
                    <Trash2 className="h-2.5 w-2.5" />
                  </button>
                )}
              </div>
            </div>
          )
        })}

        <button
          onClick={() => onAddPage(notebook.id)}
          className="px-2.5 py-1.5 rounded-xl border border-dashed border-border-subtle hover:border-accent text-text-muted hover:text-accent text-xs font-semibold flex items-center gap-1 transition-all shrink-0 ml-1"
          title="Add a new page/chapter to notebook"
        >
          <Plus className="h-3 w-3" />
          <span>New Page</span>
        </button>
      </div>

      {/* ── NOTEBOOK PAGE CANVAS ── */}
      <div className={`flex-1 overflow-y-auto p-4 sm:p-6 scrollbar-thin ${currentTheme.class}`}>
        <div className="max-w-4xl mx-auto space-y-4">
          {/* Page Title Header */}
          <div className="pb-2 border-b border-border-subtle/60 flex items-center justify-between">
            <h1 className="text-xl sm:text-2xl font-black text-text-primary tracking-tight">
              {activePage?.title || 'Untitled Page'}
            </h1>
            <span className="text-[11px] text-text-muted font-mono">
              {activePage?.cells?.length || 0} interactive cells
            </span>
          </div>

          {/* Interactive Cells List */}
          {activePage?.cells?.map((cell, idx) => {
            const isTypingHere = typingStatus?.cellId === cell.id

            return (
              <div
                key={cell.id}
                className="group relative rounded-2xl border border-border-subtle bg-card/90 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden"
              >
                {/* Cell Header & Toolbar */}
                <div className="px-3.5 py-2 border-b border-border-subtle/60 bg-surface/40 flex items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md bg-accent/10 text-accent font-mono text-[10px] font-bold uppercase">
                      {cell.type}
                    </span>
                    {cell.type === 'code' && (
                      <select
                        value={cell.language || 'javascript'}
                        onChange={(e) => onUpdateCell(activePage.id, cell.id, { language: e.target.value })}
                        className="text-[11px] py-0.5 px-2 bg-base border border-border-subtle rounded-md"
                      >
                        <option value="javascript">JavaScript (Live Sandbox)</option>
                        <option value="python">Python</option>
                        <option value="cpp">C++</option>
                        <option value="java">Java</option>
                      </select>
                    )}
                    {isTypingHere && (
                      <span className="text-[11px] text-accent font-semibold animate-pulse">
                        Collaborator is editing...
                      </span>
                    )}
                  </div>

                  {/* Cell Actions */}
                  <div className="flex items-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
                    {cell.type === 'markdown' && (
                      <button
                        onClick={() =>
                          setPreviewMarkdownCellId(previewMarkdownCellId === cell.id ? null : cell.id)
                        }
                        className="px-2 py-0.5 rounded text-[11px] font-bold text-text-secondary hover:bg-hover flex items-center gap-1"
                        title="Toggle Markdown Rendered Preview"
                      >
                        {previewMarkdownCellId === cell.id ? (
                          <>
                            <Edit3 className="h-3 w-3" /> Edit
                          </>
                        ) : (
                          <>
                            <Eye className="h-3 w-3" /> Preview
                          </>
                        )}
                      </button>
                    )}

                    <button
                      onClick={() => onMoveCell(activePage.id, cell.id, 'up')}
                      disabled={idx === 0}
                      className="p-1 rounded hover:bg-hover text-text-muted hover:text-text-primary disabled:opacity-30"
                      title="Move Up"
                    >
                      <ArrowUp className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => onMoveCell(activePage.id, cell.id, 'down')}
                      disabled={idx === activePage.cells.length - 1}
                      className="p-1 rounded hover:bg-hover text-text-muted hover:text-text-primary disabled:opacity-30"
                      title="Move Down"
                    >
                      <ArrowDown className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => onDeleteCell(activePage.id, cell.id)}
                      className="p-1 rounded hover:bg-hover text-text-muted hover:text-semantic-red"
                      title="Delete Cell"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {/* ── CELL TYPE 1: MARKDOWN NOTE ── */}
                {cell.type === 'markdown' && (
                  <div className="p-4">
                    {previewMarkdownCellId === cell.id ? (
                      <div className="min-h-[90px] prose dark:prose-invert max-w-none">
                        <NotesMarkdownViewer content={cell.content} />
                      </div>
                    ) : (
                      <textarea
                        rows={Math.max(3, (cell.content?.split('\n').length || 3))}
                        value={cell.content || ''}
                        onChange={(e) => onUpdateCell(activePage.id, cell.id, { content: e.target.value })}
                        onFocus={() => onEmitTyping(cell.id, true)}
                        onBlur={() => onEmitTyping(cell.id, false)}
                        placeholder="Type notes or markdown formulas (# Heading, **bold**, `code`, lists)..."
                        className="w-full bg-transparent text-xs sm:text-sm text-text-primary focus:outline-none resize-y leading-relaxed font-mono font-normal"
                      />
                    )}
                  </div>
                )}

                {/* ── CELL TYPE 2: RUNNABLE CODE CELL ── */}
                {cell.type === 'code' && (
                  <div className="bg-[#0b0f19] text-slate-100 flex flex-col font-mono text-xs">
                    <div className="p-3">
                      <textarea
                        rows={Math.max(4, (cell.content?.split('\n').length || 4))}
                        value={cell.content || ''}
                        onChange={(e) => onUpdateCell(activePage.id, cell.id, { content: e.target.value })}
                        onFocus={() => onEmitTyping(cell.id, true)}
                        onBlur={() => onEmitTyping(cell.id, false)}
                        onKeyDown={(e) => {
                          if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                            e.preventDefault()
                            onExecuteCode(activePage.id, cell.id, cell.content, cell.language)
                          }
                        }}
                        placeholder="// Write runnable code here... Press Ctrl+Enter to execute"
                        className="w-full bg-transparent text-emerald-300 focus:outline-none resize-y font-mono leading-relaxed text-xs"
                        spellCheck={false}
                      />
                    </div>

                    {/* Run Bar */}
                    <div className="px-3.5 py-2 bg-slate-900/90 border-t border-slate-800 flex items-center justify-between">
                      <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                        <Terminal className="h-3 w-3" />
                        <span>Ctrl+Enter to Run</span>
                        {cell.lastRunBy && (
                          <span className="text-slate-500">• Last run by {cell.lastRunBy}</span>
                        )}
                      </div>

                      <button
                        onClick={() => onExecuteCode(activePage.id, cell.id, cell.content, cell.language)}
                        disabled={cell.isRunning}
                        className="px-3 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all disabled:opacity-50"
                      >
                        <Play className="h-3 w-3 fill-current" />
                        <span>{cell.isRunning ? 'Executing...' : 'Run Code'}</span>
                      </button>
                    </div>

                    {/* Output Console Box */}
                    {cell.output && (
                      <div className="p-3 bg-black/95 border-t border-slate-800 text-[11px] leading-relaxed text-slate-300 whitespace-pre-wrap font-mono">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                          Output Terminal:
                        </div>
                        {cell.output}
                      </div>
                    )}
                  </div>
                )}

                {/* ── CELL TYPE 3: CHECKLIST CELL ── */}
                {cell.type === 'checklist' && (
                  <div className="p-4 space-y-3">
                    <input
                      type="text"
                      value={cell.title || 'Mastery Checklist'}
                      onChange={(e) => onUpdateCell(activePage.id, cell.id, { title: e.target.value })}
                      className="w-full bg-transparent font-bold text-sm text-text-primary focus:outline-none"
                    />

                    {/* Progress Bar */}
                    {cell.items && cell.items.length > 0 && (
                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] font-bold text-text-muted">
                          <span>Progress</span>
                          <span>
                            {Math.round(
                              ((cell.items.filter((i) => i.done).length || 0) / cell.items.length) * 100
                            )}
                            %
                          </span>
                        </div>
                        <div className="h-1.5 w-full bg-hover rounded-full overflow-hidden">
                          <div
                            className="h-full bg-accent transition-all duration-300"
                            style={{
                              width: `${((cell.items.filter((i) => i.done).length || 0) / cell.items.length) * 100}%`,
                            }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Items */}
                    <div className="space-y-2">
                      {cell.items?.map((item) => (
                        <div key={item.id} className="flex items-center gap-2 group/item">
                          <input
                            type="checkbox"
                            checked={!!item.done}
                            onChange={(e) => {
                              const updatedItems = cell.items.map((i) =>
                                i.id === item.id ? { ...i, done: e.target.checked } : i
                              )
                              onUpdateCell(activePage.id, cell.id, { items: updatedItems })
                            }}
                            className="h-4 w-4 rounded accent-indigo-600 cursor-pointer"
                          />
                          <input
                            type="text"
                            value={item.text}
                            onChange={(e) => {
                              const updatedItems = cell.items.map((i) =>
                                i.id === item.id ? { ...i, text: e.target.value } : i
                              )
                              onUpdateCell(activePage.id, cell.id, { items: updatedItems })
                            }}
                            className={`flex-1 bg-transparent text-xs text-text-primary focus:outline-none ${
                              item.done ? 'line-through text-text-muted opacity-70' : ''
                            }`}
                          />
                          <button
                            onClick={() => {
                              const updatedItems = cell.items.filter((i) => i.id !== item.id)
                              onUpdateCell(activePage.id, cell.id, { items: updatedItems })
                            }}
                            className="p-1 text-text-muted hover:text-semantic-red opacity-0 group-hover/item:opacity-100 transition-opacity"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={() => {
                        const newItem = { id: `item-${Date.now()}`, text: 'New action item...', done: false }
                        onUpdateCell(activePage.id, cell.id, { items: [...(cell.items || []), newItem] })
                      }}
                      className="text-xs text-accent hover:text-accent-light font-bold flex items-center gap-1"
                    >
                      <Plus className="h-3 w-3" /> Add Item
                    </button>
                  </div>
                )}

                {/* ── CELL TYPE 4: CALLOUT CELL ── */}
                {cell.type === 'callout' && (
                  <div
                    className={`p-4 border-l-4 flex gap-3 ${
                      cell.calloutType === 'warning'
                        ? 'border-amber-500 bg-amber-500/10 text-amber-900 dark:text-amber-200'
                        : cell.calloutType === 'formula'
                        ? 'border-indigo-500 bg-indigo-500/10 text-indigo-900 dark:text-indigo-200'
                        : 'border-emerald-500 bg-emerald-500/10 text-emerald-900 dark:text-emerald-200'
                    }`}
                  >
                    <div className="shrink-0 mt-0.5">
                      {cell.calloutType === 'warning' ? (
                        <AlertCircle className="h-5 w-5 text-amber-500" />
                      ) : cell.calloutType === 'formula' ? (
                        <Cpu className="h-5 w-5 text-indigo-500" />
                      ) : (
                        <Lightbulb className="h-5 w-5 text-emerald-500" />
                      )}
                    </div>
                    <div className="flex-1 space-y-1">
                      <input
                        type="text"
                        value={cell.title || 'Important Note'}
                        onChange={(e) => onUpdateCell(activePage.id, cell.id, { title: e.target.value })}
                        className="w-full bg-transparent font-bold text-xs uppercase tracking-wider focus:outline-none"
                      />
                      <textarea
                        rows={2}
                        value={cell.content || ''}
                        onChange={(e) => onUpdateCell(activePage.id, cell.id, { content: e.target.value })}
                        className="w-full bg-transparent text-xs focus:outline-none resize-none leading-relaxed"
                        placeholder="Write tip, formula or concept explanation..."
                      />
                    </div>
                  </div>
                )}
              </div>
            )
          })}

          {/* ── INSERT NEW CELL TOOLBAR ── */}
          <div className="pt-2 pb-8 flex items-center justify-center gap-2 flex-wrap">
            <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted mr-1">
              Insert Cell:
            </span>
            <button
              onClick={() => onAddCell(activePage?.id, 'markdown')}
              className="px-3 py-1.5 rounded-xl bg-card border border-border-subtle hover:border-accent hover:text-accent text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs"
            >
              <FileText className="h-3.5 w-3.5" />
              <span>+ Note / Text</span>
            </button>
            <button
              onClick={() => onAddCell(activePage?.id, 'code')}
              className="px-3 py-1.5 rounded-xl bg-card border border-border-subtle hover:border-accent hover:text-accent text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs"
            >
              <Code2 className="h-3.5 w-3.5" />
              <span>+ Runnable Code</span>
            </button>
            <button
              onClick={() => onAddCell(activePage?.id, 'checklist')}
              className="px-3 py-1.5 rounded-xl bg-card border border-border-subtle hover:border-accent hover:text-accent text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs"
            >
              <CheckSquare className="h-3.5 w-3.5" />
              <span>+ Checklist</span>
            </button>
            <button
              onClick={() => onAddCell(activePage?.id, 'callout')}
              className="px-3 py-1.5 rounded-xl bg-card border border-border-subtle hover:border-accent hover:text-accent text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>+ Tip / Concept</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── LIVE COLLABORATION MODAL ── */}
      {showCollabModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-surface border border-border-subtle rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-4 text-text-primary">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-2xl bg-semantic-green/20 text-semantic-green flex items-center justify-center">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm">Real-time Collaboration</h3>
                  <p className="text-[11px] text-text-muted">Study together, type notes & pair-code live</p>
                </div>
              </div>
              <button
                onClick={() => setShowCollabModal(false)}
                className="text-text-muted hover:text-text-primary p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            {/* Room Code Card */}
            <div className="p-3.5 rounded-2xl bg-card border border-border-subtle space-y-1.5">
              <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">
                Shareable Room Code
              </label>
              <div className="flex items-center justify-between gap-2 bg-base px-3 py-2 rounded-xl border border-border-subtle">
                <div className="flex items-center gap-2 font-mono text-xs font-bold text-accent">
                  <Hash className="h-4 w-4" />
                  <span>{notebook.collabRoomId}</span>
                </div>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(notebook.collabRoomId)
                    setCopiedCode(true)
                    setTimeout(() => setCopiedCode(false), 2000)
                  }}
                  className="px-2 py-1 rounded-lg bg-accent/15 text-accent hover:bg-accent hover:text-white text-xs font-bold flex items-center gap-1 transition-colors"
                >
                  {copiedCode ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                  <span>{copiedCode ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>

            {/* Active Peers Presence */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">
                Active in this Room ({activeCollaborators.length + 1})
              </label>
              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-semantic-green/15 text-semantic-green text-xs font-semibold border border-semantic-green/30">
                  <span className="h-2 w-2 rounded-full bg-semantic-green animate-pulse" />
                  <span>You (Host)</span>
                </div>
                {activeCollaborators.map((c, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-accent/15 text-accent text-xs font-semibold border border-accent/30"
                  >
                    <span className="h-2 w-2 rounded-full bg-accent" />
                    <span>{c.name || 'Peer'}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Invite Teammate by Email */}
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
              {inviteMessage && (
                <p className="text-xs font-semibold text-semantic-green">{inviteMessage}</p>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
