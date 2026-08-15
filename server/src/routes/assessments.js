import express from 'express'
import { spawn } from 'child_process'
import fs from 'fs'
import path from 'path'
import os from 'os'

const router = express.Router()

// Helper to execute single code snippet with timeout and input
function runSingleTestCase({ language, code, input, timeLimitSeconds = 2.0 }) {
  return new Promise((resolve) => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'placify_eval_'))
    const startTime = Date.now()
    const timeoutMs = Math.max(1000, timeLimitSeconds * 1000)

    let child
    let sourceFile = ''

    try {
      if (language === 'python') {
        sourceFile = path.join(tmpDir, 'solution.py')
        fs.writeFileSync(sourceFile, code)
        child = spawn('python', [sourceFile])
      } else if (language === 'javascript' || language === 'node') {
        sourceFile = path.join(tmpDir, 'solution.js')
        fs.writeFileSync(sourceFile, code)
        child = spawn('node', [sourceFile])
      } else if (language === 'java') {
        sourceFile = path.join(tmpDir, 'Solution.java')
        fs.writeFileSync(sourceFile, code)
        child = spawn('java', [sourceFile])
      } else if (language === 'c' || language === 'cpp') {
        sourceFile = path.join(tmpDir, language === 'c' ? 'solution.c' : 'solution.cpp')
        const execFile = path.join(tmpDir, os.platform() === 'win32' ? 'solution.exe' : 'solution.out')
        fs.writeFileSync(sourceFile, code)

        const compiler = language === 'c' ? 'gcc' : 'g++'
        try {
          const compileProc = spawn(compiler, [sourceFile, '-o', execFile])
          compileProc.on('close', (codeStatus) => {
            if (codeStatus !== 0) {
              return resolve({
                status: 'COMPILATION_ERROR',
                stdout: '',
                stderr: 'Compilation failed',
                executionTimeMs: Date.now() - startTime
              })
            }
            const runProc = spawn(execFile)
            attachStreams(runProc, resolve, tmpDir, startTime, timeoutMs, input)
          })
          return
        } catch {
          child = spawn('python', ['-c', `print("Executed in sandbox")`])
        }
      } else {
        return resolve({
          status: 'UNSUPPORTED_LANGUAGE',
          stdout: '',
          stderr: `Language ${language} not supported for automated execution`,
          executionTimeMs: 0
        })
      }

      attachStreams(child, resolve, tmpDir, startTime, timeoutMs, input)
    } catch (err) {
      cleanup(tmpDir)
      resolve({
        status: 'RUNTIME_ERROR',
        stdout: '',
        stderr: err.message,
        executionTimeMs: Date.now() - startTime
      })
    }
  })
}

function attachStreams(child, resolve, tmpDir, startTime, timeoutMs, input) {
  let stdout = ''
  let stderr = ''
  let isResolved = false

  const timer = setTimeout(() => {
    if (!isResolved) {
      isResolved = true
      try { child.kill('SIGKILL') } catch {}
      cleanup(tmpDir)
      resolve({
        status: 'TIME_LIMIT_EXCEEDED',
        stdout,
        stderr: 'Execution timed out',
        executionTimeMs: timeoutMs
      })
    }
  }, timeoutMs)

  if (input) {
    try {
      child.stdin.write(input)
      child.stdin.end()
    } catch {}
  } else {
    try { child.stdin.end() } catch {}
  }

  child.stdout?.on('data', (d) => { stdout += d.toString() })
  child.stderr?.on('data', (d) => { stderr += d.toString() })

  child.on('error', (err) => {
    if (!isResolved) {
      isResolved = true
      clearTimeout(timer)
      cleanup(tmpDir)
      resolve({
        status: 'RUNTIME_ERROR',
        stdout,
        stderr: err.message,
        executionTimeMs: Date.now() - startTime
      })
    }
  })

  child.on('close', (code) => {
    if (!isResolved) {
      isResolved = true
      clearTimeout(timer)
      cleanup(tmpDir)
      const executionTimeMs = Date.now() - startTime
      const status = code === 0 ? 'SUCCESS' : 'RUNTIME_ERROR'
      resolve({
        status,
        stdout: stdout.trim(),
        stderr: stderr.trim(),
        executionTimeMs
      })
    }
  })
}

function cleanup(dir) {
  try {
    fs.rmSync(dir, { recursive: true, force: true })
  } catch {}
}

function normalize(str) {
  if (!str) return ''
  return str.trim().replace(/\r\n/g, '\n').replace(/[ \t]+$/gm, '')
}

/**
 * POST /api/assessments/evaluate
 */
router.post('/evaluate', async (req, res) => {
  try {
    const { language, sourceCode, testCases = [], timeLimitSeconds = 2.0 } = req.body

    if (!sourceCode || !language) {
      return res.status(400).json({ error: 'sourceCode and language are required' })
    }

    const results = []
    let totalScore = 0
    let maxScore = 0
    let passedCount = 0

    for (const tc of testCases) {
      const weight = Number(tc.weightagePoints) || 10
      maxScore += weight

      const exec = await runSingleTestCase({
        language: language.toLowerCase(),
        code: sourceCode,
        input: tc.input || '',
        timeLimitSeconds
      })

      const normActual = normalize(exec.stdout)
      const normExpected = normalize(tc.expectedOutput)
      const isCorrect = exec.status === 'SUCCESS' && normActual === normExpected

      let finalStatus = exec.status
      let pointsEarned = 0

      if (exec.status === 'SUCCESS') {
        if (isCorrect) {
          finalStatus = 'PASSED'
          pointsEarned = weight
          passedCount++
          totalScore += weight
        } else {
          finalStatus = 'WRONG_ANSWER'
        }
      }

      results.push({
        testCaseId: tc.id || tc._id,
        title: tc.title || (tc.isHidden ? 'Hidden Test Case' : 'Sample Test Case'),
        isHidden: !!tc.isHidden,
        status: finalStatus,
        executionTimeMs: exec.executionTimeMs,
        stdout: tc.isHidden ? (isCorrect ? 'Output matched' : 'Output mismatched') : exec.stdout,
        expectedOutput: tc.isHidden ? 'Hidden' : tc.expectedOutput,
        stderr: exec.stderr,
        pointsEarned,
        maxPoints: weight
      })
    }

    const percentage = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0

    return res.json({
      success: true,
      totalPassedTests: passedCount,
      totalTestCases: testCases.length,
      rawScore: totalScore,
      maxScore,
      percentage,
      testCaseResults: results
    })
  } catch (err) {
    console.error('Assessment evaluation error:', err)
    return res.status(500).json({ error: 'Evaluation pipeline failed: ' + err.message })
  }
})

export default router
