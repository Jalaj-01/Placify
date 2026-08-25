import { useState, useEffect, useRef } from 'react'
import { PlaySquare, Youtube, Plus, Trash2, Save, Loader2, BookOpen, Clock, AlertCircle, Play, ChevronRight, Activity, Minimize2, Maximize2, Share2, Terminal, CheckCircle2, Download, Pencil, FileCode, School, Bold, Italic, Underline, List, ListOrdered, Link2, Sparkles } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useCourses } from '@/hooks/useCourses'
import { usePlayground } from '@/hooks/usePlayground'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { apiCall } from '@/services/apiClient'
import ShareDialog from '@/components/share/ShareDialog'
import { Badge } from '@/components/ui/badge'
import StudentCourseEnrollModal from '@/components/teacher/StudentCourseEnrollModal'

const VERILOG_DEFAULT_CODE = `module test;
    reg [3:0] a, b;
    wire [4:0] sum;
    
    adder adder_inst(
        .a(a),
        .b(b),
        .sum(sum)
    );
    
    initial begin
        $monitor("Time=%0d a=%b b=%b sum=%b", $time, a, b, sum);
        a = 4'b0011; b = 4'b0101;
        #10 a = 4'b1010; b = 4'b0110;
        #10 $finish;
    end
endmodule

module adder(
    input [3:0] a,
    input [3:0] b,
    output [4:0] sum
);
    assign sum = a + b;
endmodule`

// Normalize any legacy markdown text or unformatted note to rich styled HTML
export function normalizeNoteContentToHtml(content) {
  if (!content) return ''
  const text = String(content).trim()
  if (!text) return ''

  // If already clean HTML without raw markdown markers, return as is
  if (/<(p|div|h[1-6]|ul|ol|li|strong|b|em|i|u|span|blockquote|code|pre)\b[^>]*>/i.test(text) && 
      !text.includes('##') && !text.includes('****') && !text.includes('#<u>')) {
    return text
  }

  // Convert legacy markdown syntax to clean HTML tags
  const lines = text.split('\n')
  const htmlLines = []
  let inUl = false
  let inOl = false

  const parseInlineStyles = (str) => {
    return str
      .replace(/\*{3,4}(.*?)\*{3,4}/g, '<strong>$1</strong>')
      .replace(/(\*\*|__)(.*?)\1/g, '<strong>$2</strong>')
      .replace(/\*\s*([^0-9\*\.\n][^\*]*?)\s*\*/g, '<em>$1</em>')
      .replace(new RegExp('`([^`]+)`', 'g'), '<code>$1</code>')
      .replace(/\[([^\]]+)\]\((https?:\/\/[^\s\)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
  }

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i].trim()
    if (!line) {
      if (inUl) { htmlLines.push('</ul>'); inUl = false }
      if (inOl) { htmlLines.push('</ol>'); inOl = false }
      htmlLines.push('<p><br></p>')
      continue
    }

    line = parseInlineStyles(line)

    // Heading: ## or # or #<u>...</u>
    if (/^#{1,4}\s*/.test(line)) {
      if (inUl) { htmlLines.push('</ul>'); inUl = false }
      if (inOl) { htmlLines.push('</ol>'); inOl = false }
      const cleanHeading = line.replace(/^#{1,4}\s*/, '')
      htmlLines.push(`<h2>${cleanHeading}</h2>`)
      continue
    }

    // Numbered list: 1. or 2.
    const numMatch = line.match(/^(\*|\*{4})?\s*(\d+)\.\s*(.*?)\s*(\*|\*{4})?$/)
    if (numMatch) {
      if (inUl) { htmlLines.push('</ul>'); inUl = false }
      if (!inOl) { htmlLines.push('<ol>'); inOl = true }
      const itemText = numMatch[3]
      htmlLines.push(`<li>${itemText}</li>`)
      continue
    }

    // Bullet list: - or *
    if (/^[-*]\s+/.test(line)) {
      if (inOl) { htmlLines.push('</ol>'); inOl = false }
      if (!inUl) { htmlLines.push('<ul>'); inUl = true }
      const itemText = line.replace(/^[-*]\s+/, '')
      htmlLines.push(`<li>${itemText}</li>`)
      continue
    }

    if (inUl) { htmlLines.push('</ul>'); inUl = false }
    if (inOl) { htmlLines.push('</ol>'); inOl = false }

    htmlLines.push(`<p>${line}</p>`)
  }

  if (inUl) htmlLines.push('</ul>')
  if (inOl) htmlLines.push('</ol>')

  return htmlLines.join('')
}

export default function Courses() {
  const { user } = useAuth()
  const { courses, loading, addCourse, deleteCourse, updateNotes, updateProgress } = useCourses(user?.uid)

  const [activeCourse, setActiveCourse] = useState(null)
  
  // Layout states
  const [listCollapsed, setListCollapsed] = useState(false)
  const [showPlayground, setShowPlayground] = useState(false)

  // Add course states
  const [showAdd, setShowAdd] = useState(false)
  const [showEnrollModal, setShowEnrollModal] = useState(false)
  const [courseName, setCourseName] = useState('')
  const [courseUrl, setCourseUrl] = useState('')
  const [adding, setAdding] = useState(false)
  const [error, setError] = useState('')

  // Notes states & WYSIWYG ref
  const [localNotes, setLocalNotes] = useState('')
  const [notesSaving, setNotesSaving] = useState(false)
  const [isNotesDirty, setIsNotesDirty] = useState(false)
  const notesEditorRef = useRef(null)

  // Progress states & YouTube Player ref
  const playerRef = useRef(null)
  const [progressPercent, setProgressPercent] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [activeVideoTitle, setActiveVideoTitle] = useState('')
  const [activeVideoId, setActiveVideoId] = useState('')
  const [overrideVideoId, setOverrideVideoId] = useState('')
  const [videoEmbedUrl, setVideoEmbedUrl] = useState('')

  // Sharing & Coding states
  const { files = [], saveFile, deleteFile } = usePlayground(user?.uid)
  const [shareItemData, setShareItemData] = useState(null)
  const [pgLanguage, setPgLanguage] = useState('python')
  const [pgFileId, setPgFileId] = useState('')
  const [pgFileName, setPgFileName] = useState('solution.py')
  const [pgCode, setPgCode] = useState("print('Hello from side-by-side Playground!')")
  const [pgOutput, setPgOutput] = useState('')
  const [pgRunning, setPgRunning] = useState(false)
  const [pgSaving, setPgSaving] = useState(false)
  const [pgPyodide, setPgPyodide] = useState(null)
  const [pgLoadingRunner, setPgLoadingRunner] = useState(true)

  // Dialog state
  const [deleteConfirmId, setDeleteConfirmId] = useState(null)

  // Load YouTube Player API on mount
  useEffect(() => {
    if (!window.YT) {
      const tag = document.createElement('script')
      tag.src = 'https://www.youtube.com/iframe_api'
      const firstScriptTag = document.getElementsByTagName('script')[0]
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag)
    }
  }, [])

  // Dynamically load Pyodide for Courses Playground on-demand
  useEffect(() => {
    if (!showPlayground || pgLanguage !== 'python' || pgPyodide) return
    setPgLoadingRunner(true)

    const script = document.createElement('script')
    script.src = 'https://cdn.jsdelivr.net/pyodide/v0.26.1/full/pyodide.js'
    script.async = true
    script.onload = async () => {
      try {
        const loaded = await window.loadPyodide({
          indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.26.1/full/',
        })
        setPgPyodide(loaded)
        setPgLoadingRunner(false)
      } catch (err) {
        setPgOutput('Failed to load Python Wasm engine: ' + err.message)
        setPgLoadingRunner(false)
      }
    }
    document.body.appendChild(script)

    return () => {
      document.body.removeChild(script)
    }
  }, [showPlayground, pgLanguage, pgPyodide])

  const handlePgRun = async () => {
    setPgRunning(true)
    setPgOutput('Executing...\n')

    if (pgLanguage === 'python') {
      if (!pgPyodide) {
        setPgOutput('Python WebAssembly engine is not loaded yet.')
        setPgRunning(false)
        return
      }
      const outputBuffer = []
      pgPyodide.setStdout({
        batched: (str) => {
          outputBuffer.push(str)
          setPgOutput(outputBuffer.join('\n'))
        },
      })
      pgPyodide.setStderr({
        batched: (str) => {
          outputBuffer.push('[Error] ' + str)
          setPgOutput(outputBuffer.join('\n'))
        },
      })

      try {
        await pgPyodide.runPythonAsync(pgCode)
        if (outputBuffer.length === 0) {
          setPgOutput('Execution finished successfully (No output).')
        }
      } catch (err) {
        setPgOutput((prev) => prev + '\nTraceback Error:\n' + err.message)
      } finally {
        setPgRunning(false)
      }
    } else if (pgLanguage === 'verilog') {
      setPgOutput('Compiling and running Verilog code...\n')
      try {
        const details = await apiCall('/api/execute/verilog', {
          method: 'POST',
          body: { code: pgCode },
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
          setPgOutput(runOutput)
        } else {
          setPgOutput('Failed to retrieve execution details.')
        }
      } catch (err) {
        setPgOutput('Error executing Verilog code: ' + err.message)
      } finally {
        setPgRunning(false)
      }
    } else {
      setPgOutput('Compiling and running Java code...\n')
      try {
        const details = await apiCall('/api/execute/java', {
          method: 'POST',
          body: { code: pgCode },
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
          setPgOutput(runOutput)
        } else {
          setPgOutput('Failed to retrieve execution details.')
        }
      } catch (err) {
        setPgOutput('Error executing Java code: ' + err.message)
      } finally {
        setPgRunning(false)
      }
    }
  }

  const handlePgSave = async () => {
    if (!pgFileName.trim()) return
    setPgSaving(true)
    try {
      const id = await saveFile(pgFileId || null, pgFileName, pgCode)
      setPgFileId(id)
    } catch (err) {
      setPgOutput('Failed to save file: ' + err.message)
    } finally {
      setPgSaving(false)
    }
  }

  const handlePgDelete = async () => {
    if (!pgFileId) return
    try {
      await deleteFile(pgFileId)
      setPgFileId('')
      if (pgLanguage === 'python') {
        setPgFileName('solution.py')
        setPgCode("print('File deleted. Write some code...')")
      } else if (pgLanguage === 'verilog') {
        setPgFileName('module.v')
        setPgCode(VERILOG_DEFAULT_CODE)
      } else {
        setPgFileName('Main.java')
        setPgCode("public class Main {\n    public static void main(String[] args) {\n        System.out.println(\"File deleted. Write some code...\");\n    }\n}")
      }
    } catch (err) {
      setPgOutput('Failed to delete file: ' + err.message)
    }
  }

  const handlePgSelectFile = (fileId) => {
    if (fileId === 'new') {
      setPgFileId('')
      if (pgLanguage === 'python') {
        setPgFileName('new_script.py')
        setPgCode("# New script\nprint('Hello world!')")
      } else if (pgLanguage === 'verilog') {
        setPgFileName('module.v')
        setPgCode(VERILOG_DEFAULT_CODE)
      } else {
        setPgFileName('Main.java')
        setPgCode("public class Main {\n    public static void main(String[] args) {\n        System.out.println(\"Hello world!\");\n    }\n}")
      }
      return
    }

    const selected = files.find((f) => f.id === fileId)
    if (selected) {
      setPgFileId(selected.id)
      setPgFileName(selected.name)
      setPgCode(selected.code)
    }
  }

  const handlePgLanguageChange = (newLang) => {
    setPgLanguage(newLang)
    setPgFileId('')
    setPgOutput('')

    const filtered = files.filter((f) => {
      if (newLang === 'python') {
        return f.name.endsWith('.py') || !f.name.includes('.')
      } else if (newLang === 'verilog') {
        return f.name.endsWith('.v') || f.name.endsWith('.sv') || f.name.endsWith('.verilog')
      } else {
        return f.name.endsWith('.java')
      }
    })

    if (filtered.length > 0) {
      const selected = filtered[0]
      setPgFileId(selected.id)
      setPgFileName(selected.name)
      setPgCode(selected.code)
    } else {
      if (newLang === 'python') {
        setPgFileName('solution.py')
        setPgCode("print('Hello from scratchpad!')")
      } else if (newLang === 'verilog') {
        setPgFileName('module.v')
        setPgCode(VERILOG_DEFAULT_CODE)
      } else {
        setPgFileName('Main.java')
        setPgCode("public class Main {\n    public static void main(String[] args) {\n        System.out.println(\"Hello from scratchpad!\");\n    }\n}")
      }
    }
  }

  // Auto-sync files when opening playground or changing language
  useEffect(() => {
    if (files.length > 0 && !pgFileId && showPlayground) {
      const filtered = files.filter((f) => {
        if (pgLanguage === 'python') {
          return f.name.endsWith('.py') || !f.name.includes('.')
        } else if (pgLanguage === 'verilog') {
          return f.name.endsWith('.v') || f.name.endsWith('.sv') || f.name.endsWith('.verilog')
        } else {
          return f.name.endsWith('.java')
        }
      })
      if (filtered.length > 0) {
        setPgFileId(filtered[0].id)
        setPgFileName(filtered[0].name)
        setPgCode(filtered[0].code)
      }
    }
  }, [files, showPlayground, pgLanguage, pgFileId])

  // Get saved resume time from localStorage or Firestore progress
  const getSavedResumeTime = (course, videoId) => {
    if (!course) return 0

    // 1. Ultra-fast local storage cache
    try {
      const localKey = `placify_course_resume_${user?.uid || 'guest'}_${course.id}`
      const localData = JSON.parse(localStorage.getItem(localKey) || 'null')
      if (localData) {
        if (videoId && localData.progressMap?.[videoId]?.currentTime) {
          return Math.floor(localData.progressMap[videoId].currentTime)
        }
        if (localData.lastVideoId === videoId && localData.currentTime) {
          return Math.floor(localData.currentTime)
        }
        if (!videoId && localData.currentTime) {
          return Math.floor(localData.currentTime)
        }
      }
    } catch (e) {}

    // 2. Firestore course object
    if (course.progress) {
      if (videoId && course.progress.progressMap?.[videoId]?.currentTime) {
        return Math.floor(course.progress.progressMap[videoId].currentTime)
      }
      if (course.progress.lastVideoId === videoId && course.progress.currentTime) {
        return Math.floor(course.progress.currentTime)
      }
      if (!videoId && course.progress.currentTime) {
        return Math.floor(course.progress.currentTime)
      }
    }

    return 0
  }

  // Build embed URL with initial resume timestamp (Stable during playback)
  const buildInitialEmbedUrl = (course, specificVidId = null) => {
    if (!course) return ''
    if (specificVidId) {
      const resumeSec = getSavedResumeTime(course, specificVidId)
      const startParam = resumeSec > 1 ? `&start=${resumeSec}` : ''
      return `https://www.youtube.com/embed/${specificVidId}?enablejsapi=1${startParam}`
    }
    if (course.isPlaylist) {
      const targetVid = course.progress?.lastVideoId
      if (targetVid) {
        const resumeSec = getSavedResumeTime(course, targetVid)
        const startParam = resumeSec > 1 ? `&start=${resumeSec}` : ''
        return `https://www.youtube.com/embed/${targetVid}?list=${course.embedId}&enablejsapi=1${startParam}`
      }
      return `https://www.youtube.com/embed/videoseries?list=${course.embedId}&enablejsapi=1`
    }
    const resumeSec = getSavedResumeTime(course, course.embedId)
    const startParam = resumeSec > 1 ? `&start=${resumeSec}` : ''
    return `https://www.youtube.com/embed/${course.embedId}?enablejsapi=1${startParam}`
  }

  // Sync active course on load
  useEffect(() => {
    if (courses.length > 0 && !activeCourse) {
      const initialCourse = courses[0]
      setActiveCourse(initialCourse)
      const normalized = normalizeNoteContentToHtml(initialCourse.notes || '')
      setLocalNotes(normalized)
      if (notesEditorRef.current) {
        notesEditorRef.current.innerHTML = normalized
      }
      setOverrideVideoId('')
      
      const resumeTime = getSavedResumeTime(initialCourse, initialCourse.progress?.lastVideoId || initialCourse.embedId)
      const savedPercent = initialCourse.progress?.percent || (initialCourse.progress?.duration ? Math.round((resumeTime / initialCourse.progress.duration) * 100) : 0)
      setProgressPercent(savedPercent)
      setCurrentTime(resumeTime)
      setDuration(initialCourse.progress?.duration || 0)
      setActiveVideoTitle(initialCourse.progress?.lastVideoTitle || initialCourse.name || '')
      setActiveVideoId(initialCourse.progress?.lastVideoId || initialCourse.embedId || '')
      setVideoEmbedUrl(buildInitialEmbedUrl(initialCourse))
    }
  }, [courses, activeCourse])

  // Synchronize editor innerHTML when active course changes
  useEffect(() => {
    if (notesEditorRef.current && activeCourse) {
      const normalized = normalizeNoteContentToHtml(activeCourse.notes || '')
      if (notesEditorRef.current.innerHTML !== normalized) {
        notesEditorRef.current.innerHTML = normalized
      }
    }
  }, [activeCourse?.id])

  // Save current playback progress to both localStorage & Firestore
  const saveCurrentProgress = (ytPlayer, targetCourse = activeCourse) => {
    if (!targetCourse || !ytPlayer || typeof ytPlayer.getCurrentTime !== 'function') return

    try {
      const time = ytPlayer.getCurrentTime()
      const dur = ytPlayer.getDuration()
      
      let videoId = targetCourse.embedId
      let videoTitle = targetCourse.name
      
      if (typeof ytPlayer.getVideoData === 'function') {
        const data = ytPlayer.getVideoData()
        if (data && data.video_id) {
          videoId = data.video_id
          videoTitle = data.title || targetCourse.name
        }
      }

      if (dur > 0 && !isNaN(time)) {
        const percent = Math.min(100, Math.round((time / dur) * 100))
        const currentTimeSec = Math.round(time)
        const durationSec = Math.round(dur)
        const progressMap = targetCourse.progress?.progressMap || {}
        
        progressMap[videoId] = {
          percent,
          currentTime: currentTimeSec,
          duration: durationSec,
          title: videoTitle,
          updatedAt: Date.now()
        }

        const progressPayload = {
          percent,
          currentTime: currentTimeSec,
          duration: durationSec,
          lastVideoId: videoId,
          lastVideoTitle: videoTitle,
          progressMap
        }

        // 1. Instant local storage cache
        try {
          const localKey = `placify_course_resume_${user?.uid || 'guest'}_${targetCourse.id}`
          localStorage.setItem(localKey, JSON.stringify(progressPayload))
        } catch (e) {}

        // 2. Persist to Firestore
        updateProgress(targetCourse.id, progressPayload)
      }
    } catch (err) {
      console.warn("Could not save playback progress:", err)
    }
  }

  // Sync state values when switching active course
  const handleSelectCourse = (course) => {
    if (isNotesDirty && activeCourse) {
      const contentToSave = notesEditorRef.current ? notesEditorRef.current.innerHTML : localNotes
      updateNotes(activeCourse.id, contentToSave)
    }
    if (playerRef.current && activeCourse) {
      saveCurrentProgress(playerRef.current, activeCourse)
    }
    setActiveCourse(course)
    const normalized = normalizeNoteContentToHtml(course.notes || '')
    setLocalNotes(normalized)
    if (notesEditorRef.current) {
      notesEditorRef.current.innerHTML = normalized
    }
    setOverrideVideoId('')
    setIsNotesDirty(false)
    
    // Set playback states from course.progress or localStorage
    const resumeTime = getSavedResumeTime(course, course.progress?.lastVideoId || course.embedId)
    const savedPercent = course.progress?.percent || (course.progress?.duration ? Math.round((resumeTime / course.progress.duration) * 100) : 0)
    setProgressPercent(savedPercent)
    setCurrentTime(resumeTime)
    setDuration(course.progress?.duration || 0)
    setActiveVideoTitle(course.progress?.lastVideoTitle || course.name || '')
    setActiveVideoId(course.progress?.lastVideoId || course.embedId || '')
    setVideoEmbedUrl(buildInitialEmbedUrl(course))
  }

  // Handle manual tracking override via slider
  const handleSliderChange = async (e) => {
    const newPercent = parseInt(e.target.value, 10)
    setProgressPercent(newPercent)
    
    if (activeCourse) {
      const targetId = activeVideoId || activeCourse.embedId
      const targetTitle = activeVideoTitle || activeCourse.name
      const progressMap = activeCourse.progress?.progressMap || {}
      
      const newTime = Math.round((newPercent / 100) * (duration || 300))
      
      progressMap[targetId] = {
        percent: newPercent,
        currentTime: newTime,
        duration: duration || 300,
        title: targetTitle,
        updatedAt: Date.now()
      }

      const payload = {
        percent: newPercent,
        currentTime: newTime,
        duration: duration || 300,
        lastVideoId: targetId,
        lastVideoTitle: targetTitle,
        progressMap
      }

      try {
        const localKey = `placify_course_resume_${user?.uid || 'guest'}_${activeCourse.id}`
        localStorage.setItem(localKey, JSON.stringify(payload))
      } catch (err) {}

      await updateProgress(activeCourse.id, payload)
    }
  }

  // Bind YouTube Player API with automatic resume & lifecycle save
  useEffect(() => {
    let intervalId
    if (!activeCourse) return

    const startTracking = (ytPlayer) => {
      if (intervalId) clearInterval(intervalId)
      intervalId = setInterval(() => {
        if (ytPlayer && typeof ytPlayer.getCurrentTime === 'function') {
          const time = ytPlayer.getCurrentTime()
          const dur = ytPlayer.getDuration()
          
          let videoId = activeCourse.embedId
          let videoTitle = activeCourse.name
          
          if (typeof ytPlayer.getVideoData === 'function') {
            const data = ytPlayer.getVideoData()
            if (data && data.video_id) {
              videoId = data.video_id
              videoTitle = data.title || activeCourse.name
            }
          }

          setActiveVideoId(videoId)
          setActiveVideoTitle(videoTitle)

          if (dur > 0 && !isNaN(time)) {
            const percent = Math.min(100, Math.round((time / dur) * 100))
            setProgressPercent(percent)
            setCurrentTime(Math.round(time))
            setDuration(Math.round(dur))

            // Save to localStorage continuously
            try {
              const localKey = `placify_course_resume_${user?.uid || 'guest'}_${activeCourse.id}`
              const prev = JSON.parse(localStorage.getItem(localKey) || '{}')
              const progressMap = prev.progressMap || activeCourse.progress?.progressMap || {}
              progressMap[videoId] = {
                percent,
                currentTime: Math.round(time),
                duration: Math.round(dur),
                title: videoTitle,
                updatedAt: Date.now()
              }
              localStorage.setItem(localKey, JSON.stringify({
                percent,
                currentTime: Math.round(time),
                duration: Math.round(dur),
                lastVideoId: videoId,
                lastVideoTitle: videoTitle,
                progressMap
              }))
            } catch (e) {}
          }
        }
      }, 2500)
    }

    const initPlayer = () => {
      try {
        if (playerRef.current && typeof playerRef.current.destroy === 'function') {
          try { playerRef.current.destroy() } catch (e) {}
        }

        const player = new window.YT.Player('yt-iframe-player', {
          events: {
            onReady: (event) => {
              playerRef.current = event.target
              const currentVidId = overrideVideoId || activeCourse.progress?.lastVideoId || activeCourse.embedId
              const resumeTime = getSavedResumeTime(activeCourse, currentVidId)
              if (resumeTime > 2) {
                try {
                  event.target.seekTo(resumeTime, true)
                } catch (e) {
                  console.warn("Could not seek to resumeTime:", e)
                }
              }
            },
            onStateChange: (event) => {
              if (event.data === 1) { // PLAYING
                startTracking(event.target)
              } else if (event.data === 2 || event.data === 0) { // PAUSED or ENDED
                if (intervalId) clearInterval(intervalId)
                saveCurrentProgress(event.target, activeCourse)
              }
            }
          }
        })
        playerRef.current = player
      } catch (e) {
        console.warn("Could not bind YouTube Player API:", e)
      }
    }

    const handleUnloadOrHide = () => {
      if (playerRef.current) {
        saveCurrentProgress(playerRef.current, activeCourse)
      }
    }

    window.addEventListener('beforeunload', handleUnloadOrHide)
    document.addEventListener('visibilitychange', handleUnloadOrHide)

    const timer = setTimeout(() => {
      if (window.YT && window.YT.Player) {
        initPlayer()
      } else {
        window.onYouTubeIframeAPIReady = initPlayer
      }
    }, 1000)

    return () => {
      clearTimeout(timer)
      if (intervalId) clearInterval(intervalId)
      window.removeEventListener('beforeunload', handleUnloadOrHide)
      document.removeEventListener('visibilitychange', handleUnloadOrHide)
      if (playerRef.current) {
        saveCurrentProgress(playerRef.current, activeCourse)
        if (typeof playerRef.current.destroy === 'function') {
          try {
            playerRef.current.destroy()
          } catch (e) {}
        }
        playerRef.current = null
      }
    }
  }, [activeCourse?.id, videoEmbedUrl])

  const parseYoutubeUrl = (url) => {
    let embedId = ''
    let isPlaylist = false
    
    if (url.includes('list=')) {
      const match = url.match(/[?&]list=([^#\&\?]+)/)
      if (match) {
        embedId = match[1]
        isPlaylist = true
      }
    }
    
    if (!isPlaylist) {
      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/
      const match = url.match(regExp)
      if (match && match[2].length === 11) {
        embedId = match[2]
      }
    }
    
    return { embedId, isPlaylist }
  }

  const handleAddCourse = async (e) => {
    e.preventDefault()
    if (!courseName.trim() || !courseUrl.trim()) return
    setAdding(true)
    setError('')

    const { embedId, isPlaylist } = parseYoutubeUrl(courseUrl.trim())
    if (!embedId) {
      setError('Invalid YouTube link. Please paste a valid video URL or playlist link.')
      setAdding(false)
      return
    }

    try {
      const newId = await addCourse(courseName.trim(), courseUrl.trim(), embedId, isPlaylist)
      setCourseName('')
      setCourseUrl('')
      setShowAdd(false)
      
      const newCourseObj = { id: newId, name: courseName.trim(), url: courseUrl.trim(), embedId, isPlaylist, notes: '' }
      setActiveCourse(newCourseObj)
      setLocalNotes('')
      setIsNotesDirty(false)
    } catch (err) {
      setError('Failed to add course: ' + err.message)
    } finally {
      setAdding(false)
    }
  }

  const handleSaveNotes = async () => {
    if (!activeCourse) return
    const finalContent = notesEditorRef.current ? notesEditorRef.current.innerHTML : localNotes
    setNotesSaving(true)
    try {
      await updateNotes(activeCourse.id, finalContent)
      setLocalNotes(finalContent)
      setIsNotesDirty(false)
    } catch (err) {
      console.error('Failed to save notes', err)
    } finally {
      setNotesSaving(false)
    }
  }

  // WYSIWYG Execution command for Bold, Italic, Underline, Lists, etc.
  const execCmd = (command, value = null) => {
    if (!notesEditorRef.current) return
    notesEditorRef.current.focus()
    document.execCommand(command, false, value)
    const newHtml = notesEditorRef.current.innerHTML
    setLocalNotes(newHtml)
    setIsNotesDirty(true)
  }

  const handleToggleHeading = () => {
    if (!notesEditorRef.current) return
    notesEditorRef.current.focus()
    const selection = window.getSelection()
    if (selection && selection.anchorNode) {
      const parent = selection.anchorNode.parentElement
      if (parent && (parent.tagName === 'H2' || parent.closest('h2'))) {
        document.execCommand('formatBlock', false, '<p>')
      } else {
        document.execCommand('formatBlock', false, '<h2>')
      }
    } else {
      document.execCommand('formatBlock', false, '<h2>')
    }
    const newHtml = notesEditorRef.current.innerHTML
    setLocalNotes(newHtml)
    setIsNotesDirty(true)
  }

  const handleEditorKeyDown = (e) => {
    if (e.ctrlKey || e.metaKey) {
      const key = e.key.toLowerCase()
      if (key === 'b') {
        e.preventDefault()
        execCmd('bold')
      } else if (key === 'i') {
        e.preventDefault()
        execCmd('italic')
      } else if (key === 'u') {
        e.preventDefault()
        execCmd('underline')
      } else if (key === 'h') {
        e.preventDefault()
        handleToggleHeading()
      } else if (key === 's') {
        e.preventDefault()
        handleSaveNotes()
      } else if (key === 'k') {
        e.preventDefault()
        const url = prompt('Enter URL:', 'https://')
        if (url) execCmd('createLink', url)
      }
    } else if (e.key === 'Tab') {
      e.preventDefault()
      if (e.shiftKey) {
        execCmd('outdent')
      } else {
        execCmd('indent')
      }
    }
  }

  const formatTime = (secs) => {
    if (isNaN(secs) || secs === 0) return '0m'
    const m = Math.floor(secs / 60)
    return `${m}m`
  }

  const getHistoryList = (course) => {
    if (!course?.progress?.progressMap) return []
    return Object.entries(course.progress.progressMap).map(([id, val]) => ({
      id,
      ...val
    })).sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0))
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Premium Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 border-b border-border-subtle/50 pb-4 sm:pb-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-semantic-red/10 border border-semantic-red/20 shadow-inner shrink-0">
            <Youtube className="h-5 w-5 sm:h-6 sm:w-6 text-semantic-red animate-pulse-slow" />
          </div>
          <div className="min-w-0">
            <h1 className="text-lg sm:text-page font-bold text-text-primary tracking-tight">Course Vault</h1>
            <p className="text-secondary text-text-secondary text-[10px] sm:text-xs mt-0.5 truncate">Study YouTube lecture courses in an ad-free, distraction-free environment</p>
          </div>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button
            onClick={() => setShowEnrollModal(true)}
            variant="outline"
            className="flex items-center gap-2 text-xs font-semibold px-4 py-2 border-accent/40 text-accent hover:bg-accent/15 transition-all flex-1 sm:flex-initial justify-center"
          >
            <School className="h-4 w-4" /> Join Class Code
          </Button>
          <Button onClick={() => setShowAdd(true)} className="flex items-center gap-2 text-xs font-semibold px-4 py-2 hover:scale-[1.02] active:scale-[0.98] transition-all flex-1 sm:flex-initial justify-center">
            <Plus className="h-4 w-4" /> Add Course
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-10 w-10 text-accent animate-spin" />
        </div>
      ) : courses.length === 0 ? (
        <div className="text-center py-20 bg-card rounded-2xl border border-border-subtle max-w-xl mx-auto space-y-5 shadow-sm">
          <PlaySquare className="h-16 w-16 text-text-muted/65 mx-auto stroke-[1.25]" />
          <div className="space-y-2">
            <h3 className="text-body font-bold text-text-primary">No courses added yet</h3>
            <p className="text-secondary text-text-secondary text-xs max-w-sm mx-auto leading-relaxed">
              Consolidate your coding playlists, system design bootcamps, or aptitude preparation videos here.
            </p>
          </div>
          <Button onClick={() => setShowAdd(true)} size="sm" className="px-5">
            Add Your First Course
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6 items-start">
          {/* Left Column: Course Selector Playlist Cards */}
          {!listCollapsed && (
            <div className="lg:col-span-1 space-y-3 sm:space-y-3.5 animate-fade-in">
              <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest pl-1 block">Your Playlists</span>
              <div className="flex lg:flex-col gap-2.5 overflow-x-auto lg:overflow-x-visible lg:overflow-y-auto lg:max-h-[600px] pb-2 lg:pb-0 pr-0 lg:pr-1.5 scrollbar-thin snap-x lg:snap-none">
                {courses.map((course) => {
                  const isActive = activeCourse?.id === course.id
                  const overallPercent = course.progress?.percent || 0
                  return (
                    <div
                      key={course.id}
                      onClick={() => handleSelectCourse(course)}
                      className={cn(
                        "group flex flex-col justify-between p-3 sm:p-3.5 rounded-xl border cursor-pointer relative transition-all duration-300 overflow-hidden",
                        "min-w-[200px] lg:min-w-0 snap-start",
                        isActive
                          ? "bg-accent/8 border-accent text-accent-light shadow-md shadow-accent/5"
                          : "bg-card border-border-subtle hover:border-border-hover text-text-secondary hover:text-text-primary hover:bg-hover/30"
                      )}
                    >
                      {isActive && (
                        <div className="absolute left-0 top-3 bottom-3 w-1 bg-accent rounded-r-md" />
                      )}
                      <div className="flex items-center justify-between min-w-0 pr-1">
                        <div className="flex items-center gap-3 min-w-0 pr-2">
                          <PlaySquare className={cn(
                            "h-5 w-5 shrink-0 transition-transform group-hover:scale-105",
                            isActive ? "text-accent-light" : "text-text-muted"
                          )} />
                          <div className="min-w-0">
                            <span className="text-xs font-bold truncate block leading-snug">{course.name}</span>
                            <span className="text-[9px] text-text-muted/80 block mt-0.5 font-medium uppercase tracking-wider">
                              {course.isPlaylist ? 'Playlist' : 'Single Video'}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 lg:focus-within:opacity-100">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              setShareItemData({ type: 'course', data: course })
                            }}
                            className="p-1.5 rounded-lg text-text-muted hover:text-accent-light hover:bg-hover/60 transition-colors"
                            title="Share course"
                          >
                            <Share2 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              setDeleteConfirmId(course.id)
                            }}
                            className="p-1.5 rounded-lg text-text-muted hover:text-semantic-red hover:bg-hover/60 transition-colors"
                            title="Delete course"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Mini playlist progress bar */}
                      {overallPercent > 0 && (
                        <div className="w-full bg-border-subtle/50 h-1 rounded-full mt-3 overflow-hidden">
                          <div
                            className="bg-accent h-full rounded-full transition-all"
                            style={{ width: `${overallPercent}%` }}
                          />
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Right Column: Premium Split-Pane Learning console */}
          {activeCourse && (
            <div className={cn("space-y-3 sm:space-y-4", listCollapsed ? "lg:col-span-4" : "lg:col-span-3")}>
              
              {/* Workspace Header Toolbar */}
              <div className="flex items-center justify-between flex-wrap gap-2 sm:gap-3 bg-surface p-1.5 sm:p-2 rounded-xl border border-border-subtle/70">
                <div className="flex items-center gap-1.5 sm:gap-3 flex-wrap">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setListCollapsed(!listCollapsed)}
                    className="h-7 sm:h-8 text-[10px] sm:text-xs flex items-center gap-1 sm:gap-1.5 bg-elevated border border-border hover:bg-hover text-text-primary transition-all font-semibold px-2 sm:px-3"
                  >
                    {listCollapsed ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
                    <span className="hidden sm:inline">{listCollapsed ? 'Show List' : 'Theater Mode'}</span>
                  </Button>
                  
                  <Button
                    variant={showPlayground ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => {
                      setShowPlayground(!showPlayground)
                      if (!showPlayground) {
                        setListCollapsed(true)
                      }
                    }}
                    className="h-7 sm:h-8 text-[10px] sm:text-xs flex items-center gap-1 sm:gap-1.5 transition-all font-semibold px-2 sm:px-3"
                  >
                    <Terminal className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">{showPlayground ? 'Hide Playground' : 'Practice Code'}</span>
                  </Button>

                  <div className="h-4 w-[1px] bg-border-subtle hidden sm:block" />
                  <span className="text-[10px] sm:text-xs font-bold text-text-primary max-w-[120px] sm:max-w-[200px] md:max-w-xs truncate hidden sm:inline" title={activeCourse.name}>
                    {activeCourse.name}
                  </span>
                </div>
                
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShareItemData({ type: 'course', data: activeCourse })}
                    className="h-7 text-[10px] sm:text-[11px] flex items-center gap-1 sm:gap-1.5 bg-elevated border border-border hover:bg-hover font-semibold text-text-secondary hover:text-text-primary px-1.5 sm:px-2.5"
                  >
                    <Share2 className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Share</span>
                  </Button>
                  
                  <span className={cn(
                    "text-[9px] sm:text-[10px] px-1.5 sm:px-2 py-0.5 rounded font-bold uppercase tracking-wider whitespace-nowrap",
                    activeCourse.isPlaylist ? "bg-accent/10 text-accent-light border border-accent/20" : "bg-semantic-purple-bg/30 text-semantic-purple border border-semantic-purple-bg"
                  )}>
                    {activeCourse.isPlaylist ? 'Playlist' : 'Lecture Video'}
                  </span>
                </div>
              </div>

              {/* Side-by-Side split pane grid */}
              <div className={cn(
                "grid gap-4 sm:gap-6 items-stretch",
                showPlayground ? "grid-cols-1 lg:grid-cols-2" : "grid-cols-1 xl:grid-cols-3"
              )}>
                
                {/* Video + Tracker block */}
                <div className={cn("space-y-3 sm:space-y-4 flex flex-col", showPlayground ? "" : "xl:col-span-2")}>
                  {/* Aspect-video Frame */}
                  <div className="w-full aspect-video rounded-xl sm:rounded-2xl border border-border-subtle bg-black overflow-hidden shadow-lg sm:shadow-2xl relative">
                    <iframe
                      id="yt-iframe-player"
                      key={videoEmbedUrl || activeCourse?.id}
                      src={videoEmbedUrl || buildInitialEmbedUrl(activeCourse)}
                      title={activeCourse.name}
                      className="w-full h-full absolute inset-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                  {/* Progress Bar (Auto-updates from YouTube Player, read-only) */}
                  <div className="w-full bg-surface border border-border-subtle h-4 sm:h-5 rounded-full overflow-hidden relative flex items-center shadow-inner select-none mt-1">
                    <div
                      className="bg-accent h-full rounded-full transition-all duration-300 absolute left-0 top-0 bottom-0"
                      style={{ width: `${progressPercent}%` }}
                    />
                    <span className="w-full text-center relative z-10 text-[9px] sm:text-[10px] font-extrabold tracking-wider text-text-primary drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]">
                      {progressPercent}%
                    </span>
                  </div>

                  {/* Playlist Lecture History Logs */}
                  {activeCourse.isPlaylist && getHistoryList(activeCourse).length > 0 && (
                    <div className="bg-surface rounded-xl sm:rounded-2xl border border-border-subtle/70 p-3 sm:p-4 space-y-3 sm:space-y-3.5 shadow-md">
                      <div className="flex items-center gap-2">
                        <Activity className="h-4 w-4 text-accent-light" />
                        <span className="text-[10px] font-bold text-text-primary uppercase tracking-wider">Lecture History Log</span>
                      </div>
                      <div className="space-y-2 sm:space-y-2.5 max-h-[150px] sm:max-h-[180px] overflow-y-auto pr-1">
                        {getHistoryList(activeCourse).map((vid) => (
                          <div
                            key={vid.id}
                            className={cn(
                              "flex items-center justify-between p-2 sm:p-2.5 rounded-xl border border-border-subtle/50 text-xs transition-colors hover:bg-hover/20 gap-2",
                              (overrideVideoId || activeVideoId) === vid.id ? "bg-accent/5 border-accent/25" : "bg-card"
                            )}
                          >
                            <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => {
                                  if (playerRef.current && activeCourse) {
                                    saveCurrentProgress(playerRef.current, activeCourse)
                                  }
                                  setOverrideVideoId(vid.id)
                                  setCurrentTime(vid.currentTime || 0)
                                  setProgressPercent(vid.percent || 0)
                                  setDuration(vid.duration || 0)
                                  setActiveVideoId(vid.id)
                                  setActiveVideoTitle(vid.title || '')
                                  setVideoEmbedUrl(buildInitialEmbedUrl(activeCourse, vid.id))
                                }}
                                className="h-6 w-6 sm:h-7 sm:w-7 rounded-full bg-accent/15 text-accent-light hover:bg-accent hover:text-white shrink-0"
                              >
                                <Play className="h-3 w-3 fill-current ml-0.5" />
                              </Button>
                              <span className="font-semibold text-text-primary truncate text-[11px] sm:text-xs" title={vid.title}>
                                {vid.title}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                              <span className="text-[9px] sm:text-[10px] text-text-muted font-bold whitespace-nowrap">
                                {vid.percent}% • {formatTime(vid.duration - vid.currentTime)} left
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Right block: Either Playground or Notepad */}
                {showPlayground ? (
                  <div className="flex flex-col space-y-4">
                    <Card className="border border-border-subtle bg-card flex flex-col flex-1 overflow-hidden shadow-md">
                      <CardHeader className="pb-3 border-b border-border-subtle/60 flex flex-row items-center justify-between shrink-0">
                        <div className="flex items-center gap-2">
                          <Terminal className="h-4 w-4 text-accent-light" />
                          <CardTitle className="text-xs font-bold text-text-primary uppercase tracking-widest">
                            Side Playground
                          </CardTitle>
                        </div>
                        
                        <div className="flex items-center gap-1.5">
                          {/* Lang toggle */}
                          <div className="flex bg-surface p-0.5 rounded-md border border-border-subtle shrink-0">
                            <button
                              onClick={() => handlePgLanguageChange('python')}
                              className={cn(
                                "px-2 py-0.5 rounded text-[10px] font-semibold transition-all",
                                pgLanguage === 'python' ? "bg-accent text-white" : "text-text-secondary"
                              )}
                            >
                              Python
                            </button>
                            <button
                              onClick={() => handlePgLanguageChange('java')}
                              className={cn(
                                "px-2 py-0.5 rounded text-[10px] font-semibold transition-all",
                                pgLanguage === 'java' ? "bg-accent text-white" : "text-text-secondary"
                              )}
                            >
                              Java
                            </button>
                            <button
                              onClick={() => handlePgLanguageChange('verilog')}
                              className={cn(
                                "px-2 py-0.5 rounded text-[10px] font-semibold transition-all",
                                pgLanguage === 'verilog' ? "bg-accent text-white" : "text-text-secondary"
                              )}
                            >
                              Verilog
                            </button>
                          </div>

                          <Badge
                            variant={pgLanguage === 'python' && pgLoadingRunner ? 'secondary' : 'success'}
                            className="h-5 text-[8px] flex gap-1 items-center px-1"
                          >
                            {pgLanguage === 'python' ? (
                              pgLoadingRunner ? (
                                <>
                                  <Loader2 className="h-2.5 w-2.5 animate-spin" /> Wasm Loading
                                </>
                              ) : (
                                <>
                                  <CheckCircle2 className="h-2.5 w-2.5 text-semantic-green" /> Wasm Active
                                </>
                              )
                            ) : (
                              <>
                                <CheckCircle2 className="h-2.5 w-2.5 text-semantic-green" /> Cloud Compiler
                              </>
                            )}
                          </Badge>
                        </div>
                      </CardHeader>

                      {/* Sub-header File operations bar */}
                      <div className="flex items-center justify-between p-2 sm:p-2.5 border-b border-border-subtle bg-surface/50 text-xs shrink-0 flex-wrap gap-1.5 sm:gap-2">
                        {/* Selector for files */}
                        <div className="flex items-center gap-2">
                          <Select value={pgFileId || 'new'} onValueChange={handlePgSelectFile}>
                            <SelectTrigger className="w-[120px] h-7 bg-card border border-border-subtle text-[10px]">
                              <SelectValue placeholder="Files..." />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="new" className="text-accent-light font-medium flex items-center gap-1.5 text-[10px]">
                                <Plus className="h-3 w-3 inline mr-1 text-[10px]" /> New Script
                              </SelectItem>
                              {files.filter(f => {
                                if (pgLanguage === 'python') return f.name.endsWith('.py') || !f.name.includes('.')
                                if (pgLanguage === 'verilog') return f.name.endsWith('.v') || f.name.endsWith('.sv') || f.name.endsWith('.verilog')
                                return f.name.endsWith('.java')
                              }).map((f) => (
                                <SelectItem key={f.id} value={f.id} className="text-[10px]">
                                  {f.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* File Name input and operations buttons */}
                        <div className="flex items-center gap-1.5 flex-1 max-w-[120px] sm:max-w-[150px]">
                          <FileCode className="h-3.5 w-3.5 text-text-muted shrink-0" />
                          <div className="relative flex items-center flex-1 group">
                            <Input
                              value={pgFileName}
                              onChange={(e) => setPgFileName(e.target.value)}
                              className="h-7 bg-card border border-border-subtle text-[10px] text-text-primary font-medium px-1.5 rounded transition-all pr-6 focus-visible:ring-1 focus-visible:ring-accent focus-visible:ring-offset-0"
                              placeholder={pgLanguage === 'python' ? 'filename.py' : pgLanguage === 'verilog' ? 'module.v' : 'Main.java'}
                            />
                            <Pencil className="h-3 w-3 text-text-muted absolute right-2 opacity-50 group-hover:opacity-100 pointer-events-none" />
                          </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handlePgSelectFile('new')} title="New file">
                            <Plus className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handlePgSave} disabled={pgSaving} title="Save script">
                            {pgSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                          </Button>
                          {pgFileId && (
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-text-muted hover:text-semantic-red" onClick={handlePgDelete} title="Delete script">
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          )}
                        </div>
                      </div>
                      <CardContent className="p-2 sm:p-3 flex-1 flex flex-col min-h-[280px] sm:min-h-[350px] space-y-2 sm:space-y-3">
                        <textarea
                          value={pgCode}
                          onChange={(e) => setPgCode(e.target.value)}
                          className="w-full flex-1 bg-base text-text-primary text-[11px] sm:text-xs font-mono p-2.5 sm:p-3 outline-none resize-none rounded-xl border border-border-subtle focus:border-accent/40 leading-relaxed transition-all shadow-inner min-h-[140px] sm:min-h-[180px]"
                          style={{ tabSize: 4 }}
                          onKeyDown={(e) => {
                            if (e.key === 'Tab') {
                              e.preventDefault()
                              const start = e.target.selectionStart
                              const end = e.target.selectionEnd
                              const val = e.target.value
                              setPgCode(val.substring(0, start) + '    ' + val.substring(end))
                              setTimeout(() => {
                                e.target.selectionStart = e.target.selectionEnd = start + 4
                              }, 0)
                            }
                          }}
                        />

                        {/* Console Output */}
                        <div className="border border-border-subtle bg-base rounded-xl overflow-hidden flex flex-col h-[100px] sm:h-[130px]">
                          <div className="flex items-center justify-between p-2 bg-surface border-b border-border-subtle/50 text-[10px] font-bold text-text-secondary shrink-0">
                            <span>CONSOLE OUTPUT</span>
                            <button onClick={() => setPgOutput('')} className="text-text-muted hover:text-text-primary">Clear</button>
                          </div>
                          <pre className="p-2.5 overflow-auto flex-1 font-mono text-[10px] text-semantic-green whitespace-pre-wrap">
                            {pgOutput || `Output console is clear. Write and run ${pgLanguage} code.`}
                          </pre>
                        </div>
                      </CardContent>

                      <div className="p-2 bg-surface flex justify-between items-center border-t border-border-subtle shrink-0">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const element = document.createElement('a')
                            const file = new Blob([pgCode], { type: 'text/plain' })
                            element.href = URL.createObjectURL(file)
                            element.download = pgFileName || (pgLanguage === 'python' ? 'solution.py' : pgLanguage === 'verilog' ? 'module.v' : 'Main.java')
                            document.body.appendChild(element)
                            element.click()
                            document.body.removeChild(element)
                          }}
                          className="h-7 text-xs flex items-center gap-1 bg-elevated border border-border hover:bg-hover"
                        >
                          <Download className="h-3.5 w-3.5 text-text-muted" /> Download
                        </Button>
                        
                        <Button
                          size="sm"
                          onClick={handlePgRun}
                          disabled={(pgLanguage === 'python' && pgLoadingRunner) || pgRunning}
                          className="h-7 text-xs flex items-center gap-1 font-semibold"
                        >
                          {pgRunning ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Play className="h-3.5 w-3.5" />}
                          Run Code
                        </Button>
                      </div>
                    </Card>
                  </div>
                ) : (
                  /* Notepad block */
                  <div className="xl:col-span-1">
                    <Card className="border border-border-subtle bg-card h-full flex flex-col overflow-hidden shadow-md">
                      {/* Card Header with Save button */}
                      <CardHeader className="p-3 border-b border-border-subtle/60 flex flex-row items-center justify-between shrink-0 bg-surface/30">
                        <div className="flex items-center gap-2">
                          <BookOpen className="h-4 w-4 text-accent-light" />
                          <CardTitle className="text-xs font-bold text-text-primary uppercase tracking-widest">
                            Lecture Notes
                          </CardTitle>
                        </div>

                        {/* Save Button */}
                        <Button
                          size="sm"
                          onClick={handleSaveNotes}
                          disabled={notesSaving || !isNotesDirty}
                          className={cn(
                            "h-7 text-xs flex items-center gap-1.5 px-3 transition-all rounded-lg font-bold shadow-sm",
                            isNotesDirty ? "bg-accent hover:bg-accent-light text-white animate-pulse" : "bg-elevated border border-border text-text-secondary"
                          )}
                        >
                          {notesSaving ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Save className="h-3.5 w-3.5" />
                          )}
                          {isNotesDirty ? 'Save Notes *' : 'Saved'}
                        </Button>
                      </CardHeader>

                      {/* Formatting Toolbar */}
                      <div className="px-3 py-1.5 border-b border-border-subtle bg-surface/50 flex items-center gap-1 flex-wrap text-text-muted shrink-0 text-xs">
                        <button
                          type="button"
                          onMouseDown={(e) => {
                            e.preventDefault()
                            execCmd('bold')
                          }}
                          className="p-1.5 rounded-lg hover:bg-hover hover:text-text-primary transition-colors font-bold"
                          title="Bold (Ctrl+B)"
                        >
                          <Bold className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onMouseDown={(e) => {
                            e.preventDefault()
                            execCmd('italic')
                          }}
                          className="p-1.5 rounded-lg hover:bg-hover hover:text-text-primary transition-colors"
                          title="Italic (Ctrl+I)"
                        >
                          <Italic className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onMouseDown={(e) => {
                            e.preventDefault()
                            execCmd('underline')
                          }}
                          className="p-1.5 rounded-lg hover:bg-hover hover:text-text-primary transition-colors"
                          title="Underline (Ctrl+U)"
                        >
                          <Underline className="h-3.5 w-3.5" />
                        </button>
                        <div className="h-3.5 w-px bg-border-subtle mx-0.5" />
                        <button
                          type="button"
                          onMouseDown={(e) => {
                            e.preventDefault()
                            handleToggleHeading()
                          }}
                          className="px-2 py-0.5 rounded-lg hover:bg-hover hover:text-text-primary transition-colors font-extrabold text-xs text-accent"
                          title="Heading (Ctrl+H)"
                        >
                          H
                        </button>
                        <button
                          type="button"
                          onMouseDown={(e) => {
                            e.preventDefault()
                            execCmd('insertUnorderedList')
                          }}
                          className="p-1.5 rounded-lg hover:bg-hover hover:text-text-primary transition-colors"
                          title="Bullet List"
                        >
                          <List className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onMouseDown={(e) => {
                            e.preventDefault()
                            execCmd('insertOrderedList')
                          }}
                          className="p-1.5 rounded-lg hover:bg-hover hover:text-text-primary transition-colors"
                          title="Numbered List"
                        >
                          <ListOrdered className="h-3.5 w-3.5" />
                        </button>
                        <div className="h-3.5 w-px bg-border-subtle mx-0.5" />
                        <button
                          type="button"
                          onMouseDown={(e) => {
                            e.preventDefault()
                            const url = prompt('Enter URL:', 'https://')
                            if (url) execCmd('createLink', url)
                          }}
                          className="p-1.5 rounded-lg hover:bg-hover hover:text-text-primary transition-colors"
                          title="Insert Link (Ctrl+K)"
                        >
                          <Link2 className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      {/* ContentEditable WYSIWYG Notes Area */}
                      <CardContent className="p-3 flex-1 flex flex-col min-h-[320px] overflow-hidden">
                        <div className="flex-1 flex flex-col min-h-0">
                          <div
                            ref={notesEditorRef}
                            contentEditable
                            suppressContentEditableWarning
                            onInput={(e) => {
                              setLocalNotes(e.currentTarget.innerHTML)
                              setIsNotesDirty(true)
                            }}
                            onKeyDown={handleEditorKeyDown}
                            onBlur={handleSaveNotes}
                            data-placeholder="📝 Type lecture notes, algorithms, complexity...&#10;&#10;Use Ctrl+B (Bold), Ctrl+U (Underline), Ctrl+I (Italic), Ctrl+H (Heading), Ctrl+S (Save)."
                            className="w-full flex-1 p-3.5 bg-base text-text-primary text-xs font-normal focus:outline-none overflow-y-auto leading-relaxed rounded-xl border border-border-subtle focus:border-accent/40 transition-all shadow-inner [&_h1]:text-base [&_h1]:font-extrabold [&_h1]:text-text-primary [&_h1]:my-2 [&_h1]:border-b [&_h1]:border-border-subtle/50 [&_h1]:pb-1 [&_h2]:text-sm [&_h2]:font-bold [&_h2]:text-text-primary [&_h2]:my-1.5 [&_h2]:text-accent-light [&_h3]:text-xs [&_h3]:font-semibold [&_h3]:text-text-primary [&_h3]:my-1 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:my-1.5 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:my-1.5 [&_a]:text-accent [&_a]:underline [&_u]:underline [&_u]:decoration-accent/80 [&_u]:underline-offset-2 [&_b]:font-bold [&_strong]:font-bold [&_i]:italic [&_em]:italic [&_code]:bg-surface [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:font-mono [&_code]:text-accent [&_blockquote]:border-l-2 [&_blockquote]:border-accent [&_blockquote]:pl-3 [&_blockquote]:italic [&_blockquote]:text-text-secondary empty:before:content-[attr(data-placeholder)] empty:before:text-text-muted/60 empty:before:pointer-events-none empty:before:whitespace-pre-wrap"
                          />
                          <div className="pt-2 flex items-center justify-between text-[10px] text-text-muted select-none">
                            <span className="hidden sm:inline">Shortcuts: <kbd className="font-mono text-[9px] bg-surface px-1 py-0.5 rounded border border-border-subtle">Ctrl+B</kbd> Bold • <kbd className="font-mono text-[9px] bg-surface px-1 py-0.5 rounded border border-border-subtle">Ctrl+U</kbd> Underline • <kbd className="font-mono text-[9px] bg-surface px-1 py-0.5 rounded border border-border-subtle">Ctrl+H</kbd> Heading</span>
                            <span className="sm:hidden">Ctrl+B/U/I/H/S</span>
                            <span className="text-[9px]">{isNotesDirty ? 'Unsaved changes' : 'All changes saved'}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Add Course Dialog */}
      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="sm:max-w-[480px] bg-card border border-border-subtle">
          <DialogHeader>
            <DialogTitle className="text-body font-bold text-text-primary">Add New Course</DialogTitle>
            <DialogDescription className="text-xs text-text-secondary">
              Link any YouTube lecture or playlist to play it in a distraction-free window.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddCourse} className="space-y-4 pt-3">
            <div className="space-y-1.5">
              <label className="text-micro text-text-secondary font-semibold uppercase">Course Name</label>
              <Input
                placeholder="e.g. Striver's A-Z DSA Playlist"
                value={courseName}
                onChange={(e) => setCourseName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-micro text-text-secondary font-semibold uppercase">YouTube Video or Playlist URL</label>
              <Input
                placeholder="https://www.youtube.com/playlist?list=..."
                value={courseUrl}
                onChange={(e) => setCourseUrl(e.target.value)}
                required
              />
            </div>
            
            {error && (
              <div className="flex items-center gap-1.5 text-xs text-semantic-red font-medium">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {error}
              </div>
            )}

            <DialogFooter className="flex justify-end gap-2 text-xs pt-2">
              <Button type="button" variant="ghost" size="sm" onClick={() => setShowAdd(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" disabled={adding}>
                {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Import Course'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Course Dialog */}
      <Dialog open={!!deleteConfirmId} onOpenChange={() => setDeleteConfirmId(null)}>
        <DialogContent className="sm:max-w-[425px] bg-card border border-border-subtle">
          <DialogHeader>
            <DialogTitle className="text-body font-bold text-text-primary">Delete Course</DialogTitle>
            <DialogDescription className="text-xs text-text-secondary">
              Are you sure you want to delete this course from your vault? Your saved notes for this course will be deleted as well.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex justify-end gap-2 mt-4 text-xs">
            <Button variant="ghost" size="sm" onClick={() => setDeleteConfirmId(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={async () => {
                if (deleteConfirmId) {
                  await deleteCourse(deleteConfirmId)
                  if (activeCourse?.id === deleteConfirmId) {
                    setActiveCourse(null)
                    setLocalNotes('')
                  }
                }
                setDeleteConfirmId(null)
              }}
            >
              Delete Course
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Share Dialog */}
      {shareItemData && (
        <ShareDialog
          open={!!shareItemData}
          onOpenChange={(val) => !val && setShareItemData(null)}
          itemType={shareItemData.type}
          itemData={shareItemData.data}
          senderUid={user?.uid}
          senderEmail={user?.email}
        />
      )}

      {/* Student Academic Course Enrollment Modal */}
      <StudentCourseEnrollModal
        user={user}
        isOpen={showEnrollModal}
        onClose={() => setShowEnrollModal(false)}
      />
    </div>
  )
}
