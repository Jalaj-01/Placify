import { useState, useEffect } from 'react'
import { Terminal as TerminalIcon, Play, Save, Trash2, Plus, Loader2, FileCode, CheckCircle2 } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { usePlayground } from '@/hooks/usePlayground'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'

export default function Playground() {
  const { user } = useAuth()
  const { files, loading: loadingFiles, saveFile, deleteFile } = usePlayground(user?.uid)

  const [currentFileId, setCurrentFileId] = useState('')
  const [fileName, setFileName] = useState('solution.py')
  const [code, setCode] = useState("print('Hello from Python Playground!')\n\n# Try writing a function:\ndef add(a, b):\n    return a + b\n\nprint('Result:', add(5, 7))")
  
  const [output, setOutput] = useState('')
  const [pyodide, setPyodide] = useState(null)
  const [loadingRunner, setLoadingRunner] = useState(true)
  const [running, setRunning] = useState(false)
  const [saving, setSaving] = useState(false)

  // Dynamically load Pyodide WebAssembly script from CDN
  useEffect(() => {
    const script = document.createElement('script')
    script.src = 'https://cdn.jsdelivr.net/pyodide/v0.26.1/full/pyodide.js'
    script.async = true
    script.onload = async () => {
      try {
        const loaded = await window.loadPyodide({
          indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.26.1/full/',
        })
        setPyodide(loaded)
        setLoadingRunner(false)
      } catch (err) {
        setOutput('Failed to load Python Wasm engine: ' + err.message)
        setLoadingRunner(false)
      }
    }
    document.body.appendChild(script)

    return () => {
      document.body.removeChild(script)
    }
  }, [])

  // Auto-load code when user switches selected file
  const handleSelectFile = (fileId) => {
    if (fileId === 'new') {
      setCurrentFileId('')
      setFileName('new_script.py')
      setCode("# New script\nprint('Hello world!')")
      return
    }

    const selected = files.find((f) => f.id === fileId)
    if (selected) {
      setCurrentFileId(selected.id)
      setFileName(selected.name)
      setCode(selected.code)
    }
  }

  const handleSave = async () => {
    if (!fileName.trim()) return
    setSaving(true)
    try {
      const id = await saveFile(currentFileId || null, fileName, code)
      setCurrentFileId(id)
    } catch (err) {
      setOutput('Failed to save file: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!currentFileId) return
    try {
      await deleteFile(currentFileId)
      setCurrentFileId('')
      setFileName('solution.py')
      setCode("print('File deleted. Write some code...')")
    } catch (err) {
      setOutput('Failed to delete file: ' + err.message)
    }
  }

  const handleRun = async () => {
    if (!pyodide) return
    setRunning(true)
    setOutput('Executing in WebAssembly sandbox...\n')
    const outputBuffer = []

    pyodide.setStdout({
      batched: (str) => {
        outputBuffer.push(str)
        setOutput(outputBuffer.join('\n'))
      },
    })
    pyodide.setStderr({
      batched: (str) => {
        outputBuffer.push('[Error] ' + str)
        setOutput(outputBuffer.join('\n'))
      },
    })

    try {
      await pyodide.runPythonAsync(code)
      if (outputBuffer.length === 0) {
        setOutput('Execution finished successfully (No output).')
      }
    } catch (err) {
      setOutput((prev) => prev + '\nTraceback Error:\n' + err.message)
    } finally {
      setRunning(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/15">
            <TerminalIcon className="h-5 w-5 text-accent-light" />
          </div>
          <div>
            <h1 className="text-page font-bold text-text-primary">Python Playground</h1>
            <p className="text-secondary text-text-secondary">Code, compile, and store solutions directly in the browser</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* File selector */}
          <Select value={currentFileId || 'new'} onValueChange={handleSelectFile}>
            <SelectTrigger className="w-[180px] bg-surface border border-border-subtle text-xs">
              <SelectValue placeholder="Files..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="new" className="text-accent-light font-medium flex items-center gap-1.5">
                <Plus className="h-3 w-3 inline mr-1" /> New Script
              </SelectItem>
              {files.map((f) => (
                <SelectItem key={f.id} value={f.id}>
                  {f.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Engine Load indicator */}
          <Badge variant={loadingRunner ? 'secondary' : 'success'} className="h-7 flex gap-1.5 text-micro items-center">
            {loadingRunner ? (
              <>
                <Loader2 className="h-3 w-3 animate-spin" /> Load Wasm Engine
              </>
            ) : (
              <>
                <CheckCircle2 className="h-3.5 w-3.5 text-semantic-green shrink-0" /> Wasm Active
              </>
            )}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Code Editor block */}
        <div className="lg:col-span-3 space-y-4">
          <Card className="border border-border-subtle bg-card">
            <div className="flex items-center justify-between p-3 border-b border-border-subtle bg-surface">
              <div className="flex items-center gap-2 flex-1 max-w-xs">
                <FileCode className="h-4 w-4 text-text-muted shrink-0" />
                <Input
                  value={fileName}
                  onChange={(e) => setFileName(e.target.value)}
                  className="h-8 bg-transparent border-none text-xs text-text-primary font-medium focus-visible:ring-0 focus-visible:ring-offset-0 px-1"
                />
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Button variant="ghost" size="icon" onClick={() => handleSelectFile('new')} title="New file">
                  <Plus className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={handleSave} disabled={saving} title="Save script">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                </Button>
                {currentFileId && (
                  <Button variant="ghost" size="icon" className="text-text-muted hover:text-semantic-red" onClick={handleDelete} title="Delete script">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>

            <CardContent className="p-0">
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full min-h-[350px] md:min-h-[450px] bg-card text-text-primary text-xs font-mono p-4 outline-none resize-y leading-relaxed border-none border-b border-border-subtle"
                style={{ tabSize: 4 }}
                onKeyDown={(e) => {
                  if (e.key === 'Tab') {
                    e.preventDefault()
                    const start = e.target.selectionStart
                    const end = e.target.selectionEnd
                    const val = e.target.value
                    setCode(val.substring(0, start) + '    ' + val.substring(end))
                    // set cursor
                    setTimeout(() => {
                      e.target.selectionStart = e.target.selectionEnd = start + 4
                    }, 0)
                  }
                }}
              />
            </CardContent>

            <div className="p-3 bg-surface flex justify-end">
              <Button onClick={handleRun} disabled={loadingRunner || running} className="flex items-center gap-2">
                {running ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />} Run Code
              </Button>
            </div>
          </Card>
        </div>

        {/* Execution Output Console block */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="border border-border-subtle bg-card h-full flex flex-col min-h-[250px]">
            <div className="flex items-center justify-between p-3 border-b border-border-subtle bg-surface shrink-0">
              <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider flex items-center gap-1.5">
                <TerminalIcon className="h-4 w-4 text-text-muted" /> Console Output
              </span>
              <Button variant="ghost" size="sm" onClick={() => setOutput('')} className="text-text-muted text-xs">
                Clear
              </Button>
            </div>

            <CardContent className="p-4 flex-1 bg-base overflow-y-auto min-h-[300px]">
              <pre className="text-xs font-mono whitespace-pre-wrap leading-relaxed text-semantic-green">
                {output || 'Output console is clear. Write and run python scripts.'}
              </pre>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
