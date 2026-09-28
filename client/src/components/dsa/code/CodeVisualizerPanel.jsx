import { useState } from 'react'
import {
  Code2, Eye, Terminal, Layers, Info, CheckCircle2,
  Copy, Check, Sparkles, ChevronRight, Hash
} from 'lucide-react'

export default function CodeVisualizerPanel({ activeTopic, currentStep }) {
  const [activeLang, setActiveLang] = useState('python')
  const [copied, setCopied] = useState(false)

  const rawCode =
    currentStep?.codeSnippet?.[activeLang] ||
    currentStep?.codeSnippet?.python ||
    (typeof currentStep?.codeSnippet === 'string' ? currentStep.codeSnippet : null) ||
    activeTopic.codeSnippets?.[activeLang] ||
    activeTopic.codeSnippets?.python ||
    ''
  const codeLines = rawCode.split('\n')

  const handleCopy = () => {
    navigator.clipboard.writeText(rawCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const variables = currentStep?.variables || {}
  const callStack = currentStep?.callStack || []
  const explanation = currentStep?.explanation || 'Executing algorithmic step...'
  const activeLineNumber = currentStep?.lineNumber

  return (
    <div className="flex flex-col h-full bg-surface rounded-2xl border border-border-subtle overflow-hidden shadow-xl">
      {/* Header with Language Tabs & Copy */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-hover/40 border-b border-border-subtle shrink-0">
        <div className="flex items-center gap-2">
          <Code2 className="w-4 h-4 text-accent" />
          <span className="text-xs font-bold text-text-primary uppercase tracking-wider">
            Synchronized Code Engine
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Language Switcher */}
          <div className="flex items-center bg-card p-0.5 rounded-lg border border-border-subtle">
            {['python', 'javascript'].map((lang) => (
              <button
                key={lang}
                onClick={() => setActiveLang(lang)}
                className={`px-2 py-0.5 text-[11px] font-bold rounded-md uppercase transition-all ${
                  activeLang === lang
                    ? 'bg-accent text-white shadow-sm'
                    : 'text-text-muted hover:text-text-primary'
                }`}
              >
                {lang === 'python' ? 'Python' : 'JS'}
              </button>
            ))}
          </div>

          <button
            onClick={handleCopy}
            className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-card transition-colors"
            title="Copy code snippet"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-semantic-green" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Narrative Explanation Banner */}
      <div className="p-3 bg-accent/10 border-b border-accent/20 flex items-start gap-2.5 shrink-0">
        <Sparkles className="w-4 h-4 text-accent-light shrink-0 mt-0.5 animate-pulse" />
        <p className="text-xs font-medium text-text-primary leading-relaxed">
          {explanation}
        </p>
      </div>

      {/* Code Editor Pane with Current Line Glow */}
      <div className="flex-1 overflow-y-auto font-mono text-xs p-3 bg-base/90 scrollbar-none select-text">
        {codeLines.map((line, idx) => {
          const lineNum = idx + 1
          const isCurrentLine = lineNum === activeLineNumber

          return (
            <div
              key={idx}
              className={`flex items-center py-0.5 px-2 rounded-md transition-all ${
                isCurrentLine
                  ? 'bg-accent/20 border-l-4 border-accent text-white font-semibold shadow-sm'
                  : 'text-text-secondary hover:bg-hover/30'
              }`}
            >
              <span className="w-6 text-right pr-3 text-text-muted select-none text-[11px] opacity-60">
                {lineNum}
              </span>
              <span className="flex-1 whitespace-pre">{line}</span>
              {isCurrentLine && (
                <span className="text-[10px] uppercase font-bold text-accent-light bg-accent/15 px-1.5 py-0.2 rounded border border-accent/25 ml-2">
                  Active
                </span>
              )}
            </div>
          )
        })}
      </div>

      {/* Variable & Pointer Inspector Table */}
      <div className="border-t border-border-subtle bg-surface/95 p-3 shrink-0">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5 text-accent" />
            <span className="text-[11px] font-bold text-text-primary uppercase tracking-wider">
              Variable & Pointer Inspector
            </span>
          </div>
          <span className="text-[10px] text-text-muted">Live memory state</span>
        </div>

        {Object.keys(variables).length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 max-h-28 overflow-y-auto">
            {Object.entries(variables).map(([key, val]) => (
              <div
                key={key}
                className="flex items-center justify-between px-2.5 py-1 rounded-lg bg-card border border-border-subtle text-xs"
              >
                <span className="font-mono text-text-muted text-[11px] truncate">{key}:</span>
                <span className="font-mono font-bold text-accent-light truncate ml-1.5">
                  {typeof val === 'object' ? JSON.stringify(val) : String(val)}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-text-muted italic">No active variables in current scope.</p>
        )}
      </div>

      {/* Recursive Call Stack (if applicable) */}
      {callStack.length > 0 && (
        <div className="border-t border-border-subtle bg-base/50 px-3 py-2 shrink-0 flex items-center gap-2 overflow-x-auto">
          <Layers className="w-3.5 h-3.5 text-text-muted shrink-0" />
          <span className="text-[10px] font-bold text-text-muted uppercase shrink-0">Call Stack:</span>
          {callStack.map((frame, fIdx) => (
            <span
              key={fIdx}
              className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md bg-accent/15 text-accent-light border border-accent/20 whitespace-nowrap"
            >
              {frame}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
