import { useState, useEffect, useRef } from 'react'
import { Timer, Play, Pause, RotateCcw, X, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
import { showNotification } from '@/utils/notifications'

export default function TopFloatingTimerCapsule() {
  const { assessmentTimerOpen, closeAssessmentTimer } = useAppStore()
  const [duration, setDuration] = useState(45 * 60) // Default 45 mins in seconds
  const [timeLeft, setTimeLeft] = useState(45 * 60)
  const [isRunning, setIsRunning] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const timerRef = useRef(null)

  // Load saved active state from local storage on mount
  useEffect(() => {
    const savedEndTime = localStorage.getItem('oa_timer_end_time')
    const savedRunning = localStorage.getItem('oa_timer_running') === 'true'

    if (savedEndTime) {
      const remaining = Math.max(0, Math.round((parseInt(savedEndTime, 10) - Date.now()) / 1000))
      setTimeLeft(remaining)
      if (remaining > 0 && savedRunning) {
        setIsRunning(true)
      } else {
        localStorage.removeItem('oa_timer_end_time')
        localStorage.removeItem('oa_timer_running')
      }
    }
  }, [])

  // Handle countdown intervals
  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current)
            setIsRunning(false)
            localStorage.removeItem('oa_timer_end_time')
            localStorage.removeItem('oa_timer_running')

            // Sound alert
            try {
              const audioCtx = new (window.AudioContext || window.webkitAudioContext)()
              const osc = audioCtx.createOscillator()
              osc.type = 'sine'
              osc.frequency.setValueAtTime(440, audioCtx.currentTime)
              osc.connect(audioCtx.destination)
              osc.start()
              osc.stop(audioCtx.currentTime + 1.2)
            } catch (e) {
              console.log('Audio blocked', e)
            }

            showNotification(
              'Assessment Timer Concluded! ⏰',
              'Your timed assessment session has finished. Great job!'
            )
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } else {
      clearInterval(timerRef.current)
    }

    return () => clearInterval(timerRef.current)
  }, [isRunning, timeLeft])

  const startTimer = () => {
    if (timeLeft <= 0) return
    setIsRunning(true)
    const targetEnd = Date.now() + timeLeft * 1000
    localStorage.setItem('oa_timer_end_time', targetEnd.toString())
    localStorage.setItem('oa_timer_running', 'true')
  }

  const pauseTimer = () => {
    setIsRunning(false)
    localStorage.setItem('oa_timer_running', 'false')
    const targetEnd = Date.now() + timeLeft * 1000
    localStorage.setItem('oa_timer_end_time', targetEnd.toString())
  }

  const resetTimer = (secs) => {
    setIsRunning(false)
    const selectedDuration = secs || duration
    setTimeLeft(selectedDuration)
    localStorage.removeItem('oa_timer_end_time')
    localStorage.removeItem('oa_timer_running')
  }

  const handleSelectDuration = (mins) => {
    const secs = mins * 60
    setDuration(secs)
    resetTimer(secs)
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  if (!assessmentTimerOpen) return null

  const isUrgent = timeLeft <= 5 * 60 && timeLeft > 0

  return (
    <div className="fixed top-3 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 animate-in slide-in-from-top-4">
      <div className="bg-surface/95 backdrop-blur-xl border border-accent/40 shadow-2xl rounded-full px-4 py-2 flex items-center gap-3 text-text-primary">
        {/* Pulsing Timer Icon */}
        <div className={`p-1.5 rounded-full ${isRunning ? 'bg-accent text-white animate-pulse' : 'bg-accent/15 text-accent-light'}`}>
          <Timer className="h-4 w-4" />
        </div>

        {/* Digital Time Counter */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-text-muted hidden sm:inline">Mock Timer:</span>
          <span className={`font-mono font-bold text-sm tracking-wider ${isUrgent ? 'text-semantic-yellow animate-pulse' : 'text-text-primary'}`}>
            {formatTime(timeLeft)}
          </span>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-1">
          {isRunning ? (
            <button
              onClick={pauseTimer}
              className="p-1 rounded-full bg-accent/20 text-accent hover:bg-accent hover:text-white transition-colors"
              title="Pause Timer"
            >
              <Pause className="h-3.5 w-3.5" />
            </button>
          ) : (
            <button
              onClick={startTimer}
              disabled={timeLeft <= 0}
              className="p-1 rounded-full bg-accent text-white hover:opacity-90 transition-opacity disabled:opacity-50"
              title="Start Timer"
            >
              <Play className="h-3.5 w-3.5 fill-current" />
            </button>
          )}

          <button
            onClick={() => resetTimer()}
            className="p-1 rounded-full hover:bg-hover text-text-muted hover:text-text-primary transition-colors"
            title="Reset Timer"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Expand Duration Presets Dropdown */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-1 rounded-full hover:bg-hover text-text-muted hover:text-text-primary transition-colors"
          title="Change Duration"
        >
          {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        </button>

        {/* Close Button */}
        <button
          onClick={closeAssessmentTimer}
          className="p-1 rounded-full hover:bg-hover text-text-muted hover:text-semantic-red transition-colors ml-1 border-l border-border-subtle pl-2"
          title="Close Timer Capsule"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Expanded Duration Pills Panel */}
      {isExpanded && (
        <div className="mt-2 bg-surface/95 backdrop-blur-xl border border-accent/30 shadow-xl rounded-2xl p-2.5 flex items-center justify-center gap-2 animate-in fade-in zoom-in-95">
          {[15, 25, 45, 60, 90].map((mins) => (
            <button
              key={mins}
              disabled={isRunning}
              onClick={() => handleSelectDuration(mins)}
              className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all ${
                duration === mins * 60
                  ? 'bg-accent text-white shadow-md'
                  : 'bg-white/5 text-text-muted hover:text-text-primary hover:bg-white/10'
              }`}
            >
              {mins}m
            </button>
          ))}
        </div>
      )}

      {isUrgent && (
        <div className="mt-1 text-[10px] text-semantic-yellow font-bold text-center flex items-center justify-center gap-1 bg-surface/90 rounded-full px-2 py-0.5 border border-semantic-yellow/30 shadow">
          <AlertTriangle className="h-3 w-3 animate-bounce" /> Under 5 minutes remaining!
        </div>
      )}
    </div>
  )
}
