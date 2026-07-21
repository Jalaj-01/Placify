import { useState, useEffect, useRef } from 'react'
import { Terminal as TerminalIcon, Play, Save, Trash2, Plus, Loader2, FileCode, CheckCircle2, Download, Pencil, Share2, FolderOpen, Upload } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { usePlayground } from '@/hooks/usePlayground'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { apiCall } from '@/services/apiClient'
import ShareDialog from '@/components/share/ShareDialog'

export default function Playground() {
  const { user } = useAuth()
  const { files, loading: loadingFiles, saveFile, deleteFile } = usePlayground(user?.uid)

  const [language, setLanguage] = useState('python') // 'python' | 'java' | 'verilog'
  const [currentFileId, setCurrentFileId] = useState('')
  const [fileName, setFileName] = useState('solution.py')
  const [code, setCode] = useState("print('Hello from Python Playground!')\n\n# Try writing a function:\ndef add(a, b):\n    return a + b\n\nprint('Result:', add(5, 7))")
  
  const [output, setOutput] = useState('')
  const [pyodide, setPyodide] = useState(null)
  const [loadingRunner, setLoadingRunner] = useState(true)
  const [running, setRunning] = useState(false)
  const [saving, setSaving] = useState(false)
  const [showShareDialog, setShowShareDialog] = useState(false)

  const fileInputRef = useRef(null)

  const PYTHON_DEFAULT_FILE = 'solution.py'
  const PYTHON_DEFAULT_CODE = "print('Hello from Python Playground!')\n\n# Try writing a function:\ndef add(a, b):\n    return a + b\n\nprint('Result:', add(5, 7))"

  const JAVA_DEFAULT_FILE = 'Main.java'
  const JAVA_DEFAULT_CODE = "public class Main {\n    public static void main(String[] args) {\n        System.out.println(\"Hello from Java Playground!\");\n        \n        int result = add(5, 7);\n        System.out.println(\"Result: \" + result);\n    }\n    \n    public static int add(int a, int b) {\n        return a + b;\n    }\n}"

  const VERILOG_DEFAULT_FILE = 'module.v'
  const VERILOG_DEFAULT_CODE = "module test;\n    reg [3:0] a, b;\n    wire [4:0] sum;\n    \n    adder adder_inst(\n        .a(a),\n        .b(b),\n        .sum(sum)\n    );\n    \n    initial begin\n        $monitor(\"Time=%0d a=%b b=%b sum=%b\", $time, a, b, sum);\n        a = 4'b0011; b = 4'b0101;\n        #10 a = 4'b1010; b = 4'b0110;\n        #10 $finish;\n    end\nendmodule\n\nmodule adder(\n    input [3:0] a,\n    input [3:0] b,\n    output [4:0] sum\n);\n    assign sum = a + b;\nendmodule"

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

  // Filter files by language extension
  const filteredFiles = files.filter((f) => {
    if (language === 'python') {
      return f.name.endsWith('.py') || !f.name.includes('.')
    } else if (language === 'java') {
      return f.name.endsWith('.java')
    } else if (language === 'verilog') {
      return f.name.endsWith('.v')
    }
    return false
  })

  // Handle switching language
  const handleLanguageChange = (newLang) => {
    setLanguage(newLang)
    setCurrentFileId('')
    setOutput('')

    const filtered = files.filter((f) => {
      if (newLang === 'python') {
        return f.name.endsWith('.py') || !f.name.includes('.')
      } else if (newLang === 'java') {
        return f.name.endsWith('.java')
      } else if (newLang === 'verilog') {
        return f.name.endsWith('.v')
      }
      return false
    })

    if (filtered.length > 0) {
      const selected = filtered[0]
      setCurrentFileId(selected.id)
      setFileName(selected.name)
      setCode(selected.code)
    } else {
      if (newLang === 'python') {
        setFileName(PYTHON_DEFAULT_FILE)
        setCode(PYTHON_DEFAULT_CODE)
      } else if (newLang === 'java') {
        setFileName(JAVA_DEFAULT_FILE)
        setCode(JAVA_DEFAULT_CODE)
      } else if (newLang === 'verilog') {
        setFileName(VERILOG_DEFAULT_FILE)
        setCode(VERILOG_DEFAULT_CODE)
      }
    }
  }

  // Auto-load code when user switches selected file
  const handleSelectFile = (fileId) => {
    if (fileId === 'new') {
      setCurrentFileId('')
      if (language === 'python') {
        setFileName('new_script.py')
        setCode("# New script\nprint('Hello world!')")
      } else if (language === 'java') {
        setFileName('Main.java')
        setCode("public class Main {\n    public static void main(String[] args) {\n        System.out.println(\"Hello world!\");\n    }\n}")
      } else if (language === 'verilog') {
        setFileName('module.v')
        setCode("module test;\n    initial begin\n        $display(\"Hello world!\");\n        $finish;\n    end\nendmodule")
      }
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
      if (language === 'python') {
        setFileName(PYTHON_DEFAULT_FILE)
        setCode("print('File deleted. Write some code...')")
      } else if (language === 'java') {
        setFileName(JAVA_DEFAULT_FILE)
        setCode("public class Main {\n    public static void main(String[] args) {\n        System.out.println(\"File deleted. Write some code...\");\n    }\n}")
      } else if (language === 'verilog') {
        setFileName(VERILOG_DEFAULT_FILE)
        setCode("module test;\n    initial begin\n        $display(\"File deleted. Write some code...\");\n        $finish;\n    end\nendmodule")
      }
    } catch (err) {
      setOutput('Failed to delete file: ' + err.message)
    }
  }

  const handleDownload = () => {
    const element = document.createElement('a')
    const file = new Blob([code], { type: 'text/plain' })
    element.href = URL.createObjectURL(file)
    element.download = fileName || (language === 'python' ? 'solution.py' : language === 'java' ? 'Main.java' : 'module.v')
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const content = event.target?.result || ''
      const ext = file.name.split('.').pop()?.toLowerCase()

      if (ext === 'py') {
        setLanguage('python')
      } else if (ext === 'java') {
        setLanguage('java')
      } else if (ext === 'v' || ext === 'sv' || ext === 'vhdl' || ext === 'verilog') {
        setLanguage('verilog')
      }

      setFileName(file.name)
      setCode(content)
      setCurrentFileId('')
      setOutput(`Loaded file from local device: "${file.name}"\n`)
    }
    reader.onerror = () => {
      setOutput(`Failed to read file: ${file.name}`)
    }
    reader.readAsText(file)

    e.target.value = ''
  }

  const handleRun = async () => {
    setRunning(true)
    setOutput('Executing...\n')

    if (language === 'python') {
      if (!pyodide) {
        setOutput('Python WebAssembly engine is not loaded yet.')
        setRunning(false)
        return
      }
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
    } else if (language === 'java') {
      setOutput('Compiling and running Java code...\n')
      try {
        const details = await apiCall('/api/execute/java', {
          method: 'POST',
          body: { code },
        })

        if (details) {
          let runOutput = ''
          if (details.build_stderr) {
            runOutput += `[Compilation Error]\n${details.build_stderr}\n`
          }
          if (details.build_stdout) {
            runOutput += `[Compilation Output]\n${details.build_stdout}\n`
          }
          if (details.stderr) {
            runOutput += `[Runtime Error]\n${details.stderr}\n`
          }
          if (details.stdout) {
            runOutput += details.stdout
          }

          if (!runOutput) {
            if (details.result === 'success') {
              runOutput = 'Execution finished successfully (No output).'
            } else {
              runOutput = `Execution finished with result: ${details.result}`
            }
          }
          setOutput(runOutput)
        } else {
          setOutput('Failed to retrieve execution details.')
        }
      } catch (err) {
        setOutput('Error executing Java code: ' + err.message)
      } finally {
        setRunning(false)
      }
    } else if (language === 'verilog') {
      setOutput('Compiling and running Verilog code...\n')
      try {
        const details = await apiCall('/api/execute/verilog', {
          method: 'POST',
          body: { code },
        })

        if (details) {
          let runOutput = ''
          if (details.build_stderr) {
            runOutput += `[Compilation Error]\n${details.build_stderr}\n`
          }
          if (details.build_stdout) {
            runOutput += `[Compilation Output]\n${details.build_stdout}\n`
          }
          if (details.stderr) {
            runOutput += `[Runtime Error]\n${details.stderr}\n`
          }
          if (details.stdout) {
            runOutput += details.stdout
          }

          if (!runOutput) {
            if (details.result === 'success') {
              runOutput = 'Execution finished successfully (No output).'
            } else {
              runOutput = `Execution finished with result: ${details.result}`
            }
          }
          setOutput(runOutput)
        } else {
          setOutput('Failed to retrieve execution details.')
        }
      } catch (err) {
        setOutput('Error executing Verilog code: ' + err.message)
      } finally {
        setRunning(false)
      }
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
            <h1 className="text-page font-bold text-text-primary">
              {language === 'python' ? 'Python Playground' : language === 'java' ? 'Java Playground' : 'Verilog Playground'}
            </h1>
            <p className="text-secondary text-text-secondary">
              {language === 'python'
                ? 'Code, compile, and store solutions directly in the browser via WebAssembly'
                : language === 'java'
                ? 'Code, compile, and store solutions in the cloud via remote compiler'
                : 'Code, compile, and store Verilog HDL solutions in the cloud via remote compiler'}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Language Toggle + Wasm Badge + File Selector — all inline */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex bg-surface p-1 rounded-lg border border-border-subtle shrink-0">
              <button
                onClick={() => handleLanguageChange('python')}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                  language === 'python'
                    ? 'bg-accent text-white shadow-sm'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                Python
              </button>
              <button
                onClick={() => handleLanguageChange('java')}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                  language === 'java'
                    ? 'bg-accent text-white shadow-sm'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                Java
              </button>
              <button
                onClick={() => handleLanguageChange('verilog')}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                  language === 'verilog'
                    ? 'bg-accent text-white shadow-sm'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                Verilog
              </button>
            </div>

            {/* Engine status badge */}
            <Badge
              variant={language === 'python' && loadingRunner ? 'secondary' : 'success'}
              className="h-7 flex gap-1.5 text-micro items-center whitespace-nowrap shrink-0"
            >
              {language === 'python' ? (
                loadingRunner ? (
                  <>
                    <Loader2 className="h-3 w-3 animate-spin" /> Load Wasm Engine
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-3.5 w-3.5 text-semantic-green shrink-0" /> Wasm Active
                  </>
                )
              ) : (
                <>
                  <CheckCircle2 className="h-3.5 w-3.5 text-semantic-green shrink-0" /> Cloud Compiler Active
                </>
              )}
            </Badge>

            {/* Hidden File Input for Opening Local Files */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".py,.java,.v,.sv,.verilog,.vhdl,.txt,.c,.cpp,.js,.ts,.html,.css,.json"
              className="hidden"
            />

            {/* File selector — inline on same row */}
            <Select value={currentFileId || 'new'} onValueChange={handleSelectFile}>
              <SelectTrigger className="w-[160px] bg-surface border border-border-subtle text-xs shrink-0">
                <SelectValue placeholder="Files..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="new" className="text-accent-light font-medium flex items-center gap-1.5">
                  <Plus className="h-3 w-3 inline mr-1" /> New Script
                </SelectItem>
                {filteredFiles.map((f) => (
                  <SelectItem key={f.id} value={f.id}>
                    {f.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Code Editor block */}
        <div className="lg:col-span-3 space-y-4">
          <Card className="border border-border-subtle bg-card">
            <div className="flex items-center justify-between p-3 border-b border-border-subtle bg-surface">
              <div className="flex items-center gap-2 flex-1 max-w-xs">
                <FileCode className="h-4 w-4 text-text-muted shrink-0" />
                <div className="relative flex items-center flex-1 group">
                  <Input
                    value={fileName}
                    onChange={(e) => setFileName(e.target.value)}
                    className="h-8 bg-card border border-border-subtle hover:border-border focus:border-accent text-xs text-text-primary font-medium px-2 rounded-md transition-all pr-8 focus-visible:ring-1 focus-visible:ring-accent focus-visible:ring-offset-0"
                    placeholder={language === 'python' ? 'filename.py' : language === 'java' ? 'Main.java' : 'module.v'}
                  />
                  <Pencil className="h-3.5 w-3.5 text-text-muted absolute right-2.5 opacity-50 group-hover:opacity-100 transition-opacity pointer-events-none" />
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Button variant="ghost" size="icon" onClick={() => fileInputRef.current?.click()} title="Open local file">
                  <FolderOpen className="h-4 w-4 text-accent-light" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => handleSelectFile('new')} title="New file">
                  <Plus className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={handleSave} disabled={saving} title="Save script">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                </Button>
                <Button variant="ghost" size="icon" onClick={() => setShowShareDialog(true)} title="Share script">
                  <Share2 className="h-4 w-4" />
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

            <div className="p-3 bg-surface flex justify-between items-center border-t border-border-subtle shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownload}
                className="flex items-center gap-1.5 text-xs text-text-secondary bg-elevated border border-border hover:bg-hover"
              >
                <Download className="h-4 w-4 text-text-muted" /> Download {language === 'python' ? '.py' : language === 'java' ? '.java' : '.v'}
              </Button>
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-1.5 text-xs text-text-secondary bg-elevated border border-border hover:bg-hover"
                >
                  {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-4 w-4 text-text-muted" />}
                  Save Script
                </Button>
                
                <Button
                  size="sm"
                  onClick={handleRun}
                  disabled={(language === 'python' && loadingRunner) || running}
                  className="flex items-center gap-2"
                >
                  {running ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />} Run Code
                </Button>
              </div>
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
                {output ||
                  `Output console is clear. Write and run ${
                    language === 'python' ? 'python' : language === 'java' ? 'java' : 'verilog'
                  } scripts.`}
              </pre>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Share Dialog */}
      <ShareDialog
        open={showShareDialog}
        onOpenChange={setShowShareDialog}
        itemType="playground"
        itemData={{
          name: fileName,
          code: code,
          language: language
        }}
        senderUid={user?.uid}
        senderEmail={user?.email}
      />
    </div>
  )
}
