import { useState } from 'react'
import { motion } from 'framer-motion'
import { ExternalLink, Trash2, Paperclip, Play, Save, Loader2, Share2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import ConfidenceBadge, { ConfidenceToggle } from './ConfidenceBadge'
import { daysAgo, formatDate } from '@/utils/dateHelpers'
import { Timestamp } from 'firebase/firestore'
import { cn } from '@/lib/utils'
import { openFileInNewTab } from '@/utils/fileHelpers'
import DocumentPreviewModal from '@/components/ui/DocumentPreviewModal'


function isDue(nextReviewDate) {
  if (!nextReviewDate) return false
  const d = nextReviewDate?.toDate ? nextReviewDate.toDate() : new Date(nextReviewDate)
  return d <= new Date()
}

function getFaviconUrl(url) {
  try {
    const hostname = new URL(url).hostname
    return `https://icons.duckduckgo.com/ip3/${hostname}.ico`
  } catch {
    return null
  }
}

export default function ProblemCard({ problem, onUpdate, onDelete, onShare }) {
  const [confirmDelete, setConfirmDelete] = useState(false)
  const due = isDue(problem.nextReviewDate)
  const lastReviewed = daysAgo(problem.lastReviewedDate)

  const favicon = getFaviconUrl(problem.url)

  // Editor states
  const [showEditor, setShowEditor] = useState(false)
  const [code, setCode] = useState(problem.code || "# Write your Python solution here\nprint('Executing solution...')")
  const [output, setOutput] = useState('')
  const [running, setRunning] = useState(false)
  const [savingCode, setSavingCode] = useState(false)
  const [previewAtt, setPreviewAtt] = useState(null)

  const runCode = async () => {
    setRunning(true)
    setOutput('Running in Wasm sandbox...\n')
    try {
      let py = window.pyodideInstance
      if (!py) {
        if (!window.loadPyodide) {
          await new Promise((resolve, reject) => {
            const script = document.createElement('script')
            script.src = 'https://cdn.jsdelivr.net/pyodide/v0.26.1/full/pyodide.js'
            script.async = true
            script.onload = resolve
            script.onerror = reject
            document.body.appendChild(script)
          })
        }
        py = await window.loadPyodide({
          indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.26.1/full/',
        })
        window.pyodideInstance = py
      }

      const outputBuffer = []
      py.setStdout({
        batched: (str) => {
          outputBuffer.push(str)
          setOutput(outputBuffer.join('\n'))
        },
      })
      py.setStderr({
        batched: (str) => {
          outputBuffer.push('[Error] ' + str)
          setOutput(outputBuffer.join('\n'))
        },
      })

      await py.runPythonAsync(code)
      if (outputBuffer.length === 0) {
        setOutput('Code executed successfully with no output.')
      }
    } catch (err) {
      setOutput((prev) => prev + '\nExecution Error:\n' + err.message)
    } finally {
      setRunning(false)
    }
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
    >
      <Card className={cn('bg-card border-border-subtle hover:border-border-hover transition-all', due && 'border-semantic-red/35 bg-semantic-red/5')}>
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-4 mb-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <h3 className="text-body font-bold text-text-primary truncate">{problem.title}</h3>
                <Badge variant="secondary">{problem.platform}</Badge>
                <Badge variant="outline">{problem.difficulty}</Badge>
                {problem.tag && <Badge variant="default" className="text-micro">{problem.tag}</Badge>}
                {due && <Badge variant="destructive" className="animate-pulse">Review Due</Badge>}
              </div>
              <p className="text-micro text-text-muted">
                {lastReviewed}
                {problem.nextReviewDate && ` · Review by ${formatDate(problem.nextReviewDate)}`}
              </p>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <a href={problem.url} target="_blank" rel="noopener noreferrer">
                <Button variant="ghost" size="icon" className="h-8 w-8 p-1 flex items-center justify-center">
                  {favicon ? (
                    <img
                      src={favicon}
                      alt=""
                      className="h-4.5 w-4.5 object-contain rounded"
                      onError={(e) => {
                        e.target.style.display = 'none'
                      }}
                    />
                  ) : (
                    <ExternalLink className="h-4 w-4" />
                  )}
                </Button>
              </a>
              <Button variant="ghost" size="icon" onClick={() => onShare && onShare(problem)} title="Share problem">
                <Share2 className="h-4 w-4 text-text-muted hover:text-accent-light" />
              </Button>
              {!confirmDelete ? (
                <Button variant="ghost" size="icon" onClick={() => setConfirmDelete(true)}>
                  <Trash2 className="h-4 w-4 text-text-muted" />
                </Button>
              ) : (
                <Button variant="destructive" size="sm" onClick={() => onDelete(problem.id)}>Delete</Button>
              )}
            </div>
          </div>
          {problem.notes && <p className="text-secondary text-text-secondary mb-3">{problem.notes}</p>}
          {problem.attachments && problem.attachments.length > 0 && (
            <div className="flex gap-2 flex-wrap mb-3">
              {problem.attachments.map((att, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setPreviewAtt(att)}
                  className="inline-flex items-center gap-1.5 text-micro bg-hover border border-border-subtle hover:border-accent hover:text-accent px-2 py-0.5 rounded text-accent-light transition-colors"
                  title={`Click to view ${att.name} in platform`}
                >
                  <Paperclip className="h-3 w-3" />
                  {att.name}
                </button>
              ))}
            </div>
          )}
          
          <div className="flex justify-between items-center mt-3 pt-3 border-t border-border-subtle flex-wrap gap-2">
            <ConfidenceToggle
              value={problem.confidenceStatus}
              onChange={(s) => onUpdate(problem.id, { confidenceStatus: s })}
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowEditor(!showEditor)}
              className="text-xs bg-elevated border border-border hover:bg-hover text-text-primary h-8"
            >
              {showEditor ? 'Hide Editor' : 'Code Solution'}
            </Button>
          </div>

          {showEditor && (
            <div className="mt-4 space-y-3 border-t border-border-subtle pt-4 animate-fade-in">
              <div className="flex items-center justify-between">
                <span className="text-micro font-semibold text-text-secondary uppercase">Python compiler</span>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={async () => {
                      setSavingCode(true)
                      try {
                        await onUpdate(problem.id, { code })
                      } finally {
                        setSavingCode(false)
                      }
                    }}
                    disabled={savingCode}
                    className="text-xs py-1 h-7 flex items-center justify-center gap-1 bg-elevated border border-border hover:bg-hover text-text-primary"
                  >
                    {savingCode ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3 text-text-muted" />}
                    Save Code
                  </Button>
                  <Button
                    size="sm"
                    onClick={runCode}
                    disabled={running}
                    className="text-xs py-1 h-7 flex items-center justify-center gap-1"
                  >
                    {running ? <Loader2 className="h-3 w-3 animate-spin" /> : <Play className="h-3 w-3" />}
                    Run Code
                  </Button>
                </div>
              </div>
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full h-36 bg-base text-text-primary text-xs font-mono p-3 outline-none resize-y rounded-md border border-border-subtle focus:border-border-hover leading-relaxed"
                placeholder="# Write your Python solution code here..."
                style={{ tabSize: 4 }}
                onKeyDown={(e) => {
                  if (e.key === 'Tab') {
                    e.preventDefault()
                    const start = e.target.selectionStart
                    const end = e.target.selectionEnd
                    const val = e.target.value
                    setCode(val.substring(0, start) + '    ' + val.substring(end))
                    setTimeout(() => {
                      e.target.selectionStart = e.target.selectionEnd = start + 4
                    }, 0)
                  }
                }}
              />
              {output && (
                <div className="bg-base p-3 rounded-md border border-border-subtle max-h-32 overflow-y-auto">
                  <pre className="text-[10px] font-mono text-semantic-green whitespace-pre-wrap">{output}</pre>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <DocumentPreviewModal
        open={!!previewAtt}
        onOpenChange={(open) => !open && setPreviewAtt(null)}
        file={previewAtt}
      />
    </motion.div>
  )
}
