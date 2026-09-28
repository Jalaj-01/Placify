import { useState, useEffect } from 'react'
import {
  Play, RotateCcw, AlertCircle, CheckCircle2, Sparkles,
  Terminal, Bug, Code2, Lightbulb, ChevronRight, Copy, Check,
  Layers, Grid
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { executeAndSimulateUserCode } from '@/components/dsa/engine/CodeExecutionEngine'

const SUPPORTED_LANGUAGES = [
  { id: 'javascript', label: 'JavaScript', short: 'JS' },
  { id: 'python', label: 'Python', short: 'PY' },
  { id: 'cpp', label: 'C++', short: 'C++' },
  { id: 'java', label: 'Java', short: 'Java' },
]

export default function LiveInteractiveCodeStudio({ activeTopic, onExecuteCode }) {
  const [lang, setLang] = useState('javascript')
  const [code, setCode] = useState(() => getDefaultCodeForTopic(activeTopic, 'javascript'))
  const [errorInfo, setErrorInfo] = useState(null)
  const [successInfo, setSuccessInfo] = useState(null)
  const [outputLog, setOutputLog] = useState([])
  const [isExecuting, setIsExecuting] = useState(false)
  const [copied, setCopied] = useState(false)
  const [activeSimulationMode, setActiveSimulationMode] = useState(null) // '1d' | '2d' | 'pattern'

  // Reset code when topic or language changes
  useEffect(() => {
    setCode(getDefaultCodeForTopic(activeTopic, lang))
    setErrorInfo(null)
    setSuccessInfo(null)
    setOutputLog([])
    setActiveSimulationMode(null)
  }, [activeTopic, lang])

  function getDefaultCodeForTopic(topic, language) {
    if (language === 'python') {
      return `# Python 3D Interactive Sandbox
# Option A: 1D Array manipulation
nums = [12, 25, 38, 44, 59, 71, 86]
nums.append(95)
nums[2] = 99

print("1D Array:", nums)
# return nums

# Option B: Or try a 2D Matrix (uncomment to render 3D Grid):
# matrix = [
#     [10, 20, 30],
#     [40, 50, 60],
#     [70, 80, 90]
# ]
# return matrix`
    }

    if (language === 'cpp') {
      return `// C++ 3D Interactive Sandbox
#include <iostream>
#include <vector>
using namespace std;

int main() {
    // 1D Vector (Modify to see 3D towers update):
    vector<int> arr = {12, 25, 38, 44, 59, 71, 86};
    arr.push_back(95);

    // 2D Matrix Grid:
    // vector<vector<int>> matrix = {{10, 20, 30}, {40, 50, 60}, {70, 80, 90}};

    for (int x : arr) cout << x << " ";
    return 0;
}`
    }

    if (language === 'java') {
      return `// Java 3D Interactive Sandbox
import java.util.*;

public class Main {
    public static void main(String[] args) {
        // 1D Array:
        int[] arr = {12, 25, 38, 44, 59, 71, 86};
        
        // 2D Matrix:
        // int[][] matrix = {{10, 20, 30}, {40, 50, 60}, {70, 80, 90}};
        
        System.out.println(Arrays.toString(arr));
    }
}`
    }

    // Default: JavaScript
    if (topic.id === '2-arrays' || topic.visualizerType === 'array_1d' || topic.visualizerType === 'array_2d') {
      return `// Interactive 1D & 2D Sandbox (JavaScript)
// 1. Try a 1D Array:
let arr = [12, 25, 38, 44, 59, 71, 86];
arr.push(95);
arr[2] = 99;

console.log("Updated Array:", arr);
return arr;

// 2. Or try a 2D Matrix Grid (uncomment below):
// let matrix = [
//   [10, 20, 30],
//   [40, 50, 60],
//   [70, 80, 90]
// ];
// return matrix;

// 3. Or try nested loops (e.g. pattern pyramid):
// let n = 5;
// for (let i = 1; i <= n; i++) {
//   for (let j = 1; j <= i; j++) console.log("*");
// }`
    } else if (topic.id === '4-linked-lists') {
      return `// Interactive Linked List Sandbox
let nodes = [10, 20, 30, 40, 50];
nodes.reverse();
nodes.push(60);

console.log("Linked List nodes:", nodes);
return nodes;`
    } else if (topic.id === '5-stack') {
      return `// Interactive Stack Sandbox (LIFO)
let stack = [10, 20, 30];
stack.push(40);
stack.push(50);
let popped = stack.pop();

console.log("Stack:", stack, "Popped:", popped);
return stack;`
    } else if (topic.id === '6-queue-deque') {
      return `// Interactive Queue Sandbox (FIFO)
let queue = [10, 20, 30, 40];
queue.push(50);
let front = queue.shift();

console.log("Queue:", queue, "Front:", front);
return queue;`
    } else {
      return `// Interactive 3D Coding Sandbox
let data = [2, 5, 8, 12, 16, 23, 38, 56, 72];
let target = 23;
let foundAt = data.indexOf(target);

console.log("Target", target, "found at index:", foundAt);
return data;`
    }
  }

  // Live Safe Execution Engine & 3D Synchronization
  const handleRunCode = () => {
    setIsExecuting(true)
    setErrorInfo(null)
    setSuccessInfo(null)
    setOutputLog([])

    try {
      // Execute through intelligent 3D simulation engine
      const simulation = executeAndSimulateUserCode(code, lang)

      // Set simulation mode indicator
      setActiveSimulationMode(simulation.type === 'array_2d' ? '2D Matrix Grid' : '1D Array Bars')

      setSuccessInfo(
        simulation.explanation ||
          `Code executed successfully! 3D WebGL scene updated in real time (${simulation.type === 'array_2d' ? '2D Matrix' : '1D Array'}).`
      )

      // Send generated 3D simulation steps to parent visualizer
      if (onExecuteCode) {
        onExecuteCode(simulation)
      }
    } catch (err) {
      let errorLine = 'Unknown'
      if (err.stack) {
        const match = err.stack.match(/<anonymous>:(\d+):(\d+)/)
        if (match) errorLine = match[1]
      }

      let tip = 'Review syntax, variable declarations, and check array boundary bounds.'
      if (err.message.includes('not defined')) {
        tip = 'You are referencing a variable before declaring it.'
      } else if (err.message.includes('is not a function')) {
        tip = 'You are calling a method that does not exist on this object.'
      } else if (err.message.includes('Infinite Loop')) {
        tip = 'Ensure loop termination conditions increment properly.'
      }

      setErrorInfo({
        message: err.message,
        line: errorLine,
        tip,
      })
    } finally {
      setIsExecuting(false)
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const handleReset = () => {
    setCode(getDefaultCodeForTopic(activeTopic, lang))
    setErrorInfo(null)
    setSuccessInfo(null)
    setOutputLog([])
    setActiveSimulationMode(null)
  }

  const codeLines = code.split('\n')

  return (
    <div className="flex flex-col h-full bg-surface rounded-2xl border border-border-subtle overflow-hidden shadow-xl">
      {/* Header with Language Selector & Action Controls */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 bg-hover/40 border-b border-border-subtle shrink-0">
        <div className="flex items-center gap-2">
          <Code2 className="w-4 h-4 text-accent" />
          <span className="text-xs font-bold text-text-primary uppercase tracking-wider hidden sm:inline">
            Live Code Studio
          </span>

          {/* Language Selector Tabs */}
          <div className="flex items-center bg-card p-0.5 rounded-lg border border-border-subtle ml-1">
            {SUPPORTED_LANGUAGES.map((l) => {
              const isSel = lang === l.id
              return (
                <button
                  key={l.id}
                  onClick={() => setLang(l.id)}
                  className={`px-2 py-0.5 text-[11px] font-bold rounded-md uppercase transition-all ${
                    isSel
                      ? 'bg-accent text-white shadow-sm'
                      : 'text-text-muted hover:text-text-primary'
                  }`}
                  title={`Switch to ${l.label}`}
                >
                  {l.short}
                </button>
              )
            })}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-card transition-colors text-xs"
            title="Reset code template"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={handleCopy}
            className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-card transition-colors text-xs"
            title="Copy code"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-semantic-green" /> : <Copy className="w-3.5 h-3.5" />}
          </button>

          <Button
            onClick={handleRunCode}
            disabled={isExecuting}
            size="sm"
            className="bg-accent text-white hover:bg-accent-light text-xs font-bold px-3 py-1 h-8 rounded-xl shadow-md shadow-accent/25 flex items-center gap-1.5"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Run & Simulate 3D</span>
          </Button>
        </div>
      </div>

      {/* 3D Detection Status Pill Bar */}
      {activeSimulationMode && (
        <div className="px-3 py-1.5 bg-accent/10 border-b border-accent/20 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-accent-light font-medium">
            <Sparkles className="w-3.5 h-3.5 text-accent animate-pulse" />
            <span>Active 3D Visualizer Mode:</span>
            <span className="font-bold bg-accent/20 px-2 py-0.5 rounded-md border border-accent/30 text-white font-mono text-[11px]">
              {activeSimulationMode}
            </span>
          </div>
          <span className="text-[10px] text-text-muted">Auto-detected from code</span>
        </div>
      )}

      {/* Code Textarea with line numbers */}
      <div className="relative flex-1 bg-base/95 font-mono text-xs flex overflow-hidden">
        {/* Line numbers gutter */}
        <div className="py-3 px-2 bg-base select-none text-right border-r border-border-subtle/50 text-text-muted/60 min-w-[36px]">
          {codeLines.map((_, i) => (
            <div key={i} className="leading-5 text-[11px]">
              {i + 1}
            </div>
          ))}
        </div>

        {/* Editable code textarea */}
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          spellCheck={false}
          className="flex-1 p-3 bg-transparent text-text-primary font-mono text-xs leading-5 resize-none focus:outline-none focus:ring-0 border-none overflow-y-auto"
          placeholder="Write your custom algorithm or data structure code here..."
        />
      </div>

      {/* Error Diagnostic Panel */}
      {errorInfo && (
        <div className="p-3 bg-semantic-red/10 border-t border-semantic-red/30 space-y-1.5 text-xs shrink-0">
          <div className="flex items-center gap-2 text-semantic-red font-bold">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>Error Caught at Line {errorInfo.line}: {errorInfo.message}</span>
          </div>
          <div className="flex items-start gap-2 text-text-secondary pl-6 text-[11px]">
            <Lightbulb className="w-3.5 h-3.5 text-accent-amber shrink-0 mt-0.5" />
            <span><strong className="text-text-primary">Diagnostic Tip:</strong> {errorInfo.tip}</span>
          </div>
        </div>
      )}

      {/* Success Notification Banner */}
      {successInfo && !errorInfo && (
        <div className="p-2.5 bg-semantic-green/10 border-t border-semantic-green/25 flex items-center gap-2 text-xs text-semantic-green font-medium shrink-0">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successInfo}</span>
        </div>
      )}

      {/* Output Console Log Drawer */}
      {outputLog.length > 0 && (
        <div className="border-t border-border-subtle bg-base p-3 max-h-36 overflow-y-auto font-mono text-xs shrink-0">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-text-muted uppercase tracking-wider mb-1.5">
            <Terminal className="w-3.5 h-3.5 text-accent" />
            <span>Console Output:</span>
          </div>
          {outputLog.map((log, i) => (
            <div key={i} className="text-text-secondary leading-relaxed pl-2 border-l border-accent/40 font-mono">
              &gt; {log}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
