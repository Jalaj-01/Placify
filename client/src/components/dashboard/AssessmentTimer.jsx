import { useState, useEffect, useRef } from 'react'
import { Timer, Play, Pause, RotateCcw, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { showNotification } from '@/utils/notifications'

export default function AssessmentTimer() {
  const [duration, setDuration] = useState(45 * 60) // Default 45 mins in seconds
  const [timeLeft, setTimeLeft] = useState(45 * 60)
  const [isRunning, setIsRunning] = useState(false)
  const timerRef = useRef(null)

  // Load active timer state from local storage on mount (for persistent refresh support)
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

  // Handle timer tick intervals
  useEffect(() => {
    if (!isRunning) {
      if (timerRef.current) clearInterval(timerRef.current)
      return
    }

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        const savedEndTime = localStorage.getItem('oa_timer_end_time')
        let currentRemaining = prev - 1
        if (savedEndTime) {
          const parsed = parseInt(savedEndTime, 10)
          if (!isNaN(parsed) && parsed > 0) {
            currentRemaining = Math.max(0, Math.round((parsed - Date.now()) / 1000))
          }
        }

        if (currentRemaining <= 0) {
          if (timerRef.current) clearInterval(timerRef.current)
          setIsRunning(false)
          localStorage.removeItem('oa_timer_end_time')
          localStorage.removeItem('oa_timer_running')
          
          // Fire premium alarm sound and browser alert with clean AudioContext closure
          try {
            const AudioContextClass = window.AudioContext || window.webkitAudioContext
            if (AudioContextClass) {
              const audioCtx = new AudioContextClass()
              const osc = audioCtx.createOscillator()
              osc.type = 'sine'
              osc.frequency.setValueAtTime(440, audioCtx.currentTime)
              osc.connect(audioCtx.destination)
              osc.start()
              osc.stop(audioCtx.currentTime + 1.2)
              setTimeout(() => {
                try { audioCtx.close() } catch {}
              }, 1500)
            }
          } catch (e) {
            console.log('Audio Context blocked or unsupported', e)
          }

          showNotification(
            'Assessment Timer Concluded! ⏰',
            'Your mock Online Assessment (OA) session has ended. Log your solved questions now!'
          )
          return 0
        }
        return currentRemaining
      })
    }, 1000)

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [isRunning])

  // Sync state to local storage to support page reloads
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
    // Reset target end time relative to time remaining
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

  // Formatting helper
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const pctElapsed = duration ? Math.round(((duration - timeLeft) / duration) * 100) : 0

  return (
    <Card className="border border-border-subtle bg-card h-full">
      <CardHeader className="pb-3 border-b border-border-subtle">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/15">
            <Timer className="h-5 w-5 text-accent-light" />
          </div>
          <div>
            <CardTitle className="text-card-title font-semibold">OA Simulator Timer</CardTitle>
            <p className="text-secondary text-text-secondary text-xs">Simulate timed exams and Pomodoro focus blocks</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        {/* Preset selectors */}
        <div className="flex justify-between gap-1.5 bg-surface p-1 rounded-lg border border-border-subtle shrink-0">
          {[25, 45, 60, 90].map((mins) => (
            <button
              key={mins}
              disabled={isRunning}
              onClick={() => handleSelectDuration(mins)}
              className={`flex-1 text-micro py-1.5 rounded transition-all font-medium ${
                duration === mins * 60
                  ? 'bg-accent text-white shadow-sm'
                  : 'text-text-muted hover:text-text-primary disabled:opacity-50'
              }`}
            >
              {mins}m
            </button>
          ))}
        </div>

        {/* Digital Clock Display */}
        <div className="text-center py-4 space-y-2">
          <div className="text-4xl sm:text-5xl font-mono font-bold text-text-primary tracking-widest animate-pulse-slow">
            {formatTime(timeLeft)}
          </div>
          <div className="w-full max-w-[240px] mx-auto">
            <Progress value={pctElapsed} className="h-1.5" />
          </div>
        </div>

        {/* Controls */}
        <div className="flex justify-center gap-3">
          {isRunning ? (
            <Button size="sm" variant="outline" onClick={pauseTimer} className="flex items-center gap-1.5 text-xs bg-elevated border border-border">
              <Pause className="h-4 w-4" /> Pause
            </Button>
          ) : (
            <Button size="sm" onClick={startTimer} disabled={timeLeft <= 0} className="flex items-center gap-1.5 text-xs">
              <Play className="h-4 w-4" /> Start Mock
            </Button>
          )}

          <Button size="sm" variant="ghost" onClick={() => resetTimer()} className="flex items-center gap-1.5 text-xs text-text-muted hover:text-text-primary">
            <RotateCcw className="h-4 w-4" /> Reset
          </Button>
        </div>

        {timeLeft <= 5 * 60 && timeLeft > 0 && (
          <div className="flex items-center gap-1.5 justify-center text-semantic-yellow animate-bounce text-xs font-semibold">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            Under 5 minutes left! Speed up!
          </div>
        )}
      </CardContent>
    </Card>
  )
}
