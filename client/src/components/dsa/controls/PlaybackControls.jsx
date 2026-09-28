import { useState, useEffect } from 'react'
import {
  Play, Pause, SkipBack, SkipForward, RotateCcw,
  Sliders, Shuffle, Settings2, Gauge, ChevronRight
} from 'lucide-react'
import { useDsaLabStore } from '@/store/useDsaLabStore'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function PlaybackControls({ activeTopic }) {
  const currentStepIndex = useDsaLabStore((s) => s.currentStepIndex)
  const totalSteps = useDsaLabStore((s) => s.totalSteps)
  const isPlaying = useDsaLabStore((s) => s.isPlaying)
  const playbackSpeed = useDsaLabStore((s) => s.playbackSpeed)
  const customInput = useDsaLabStore((s) => s.customInput)

  const togglePlay = useDsaLabStore((s) => s.togglePlay)
  const stepForward = useDsaLabStore((s) => s.stepForward)
  const stepBackward = useDsaLabStore((s) => s.stepBackward)
  const resetPlayback = useDsaLabStore((s) => s.resetPlayback)
  const setCurrentStepIndex = useDsaLabStore((s) => s.setCurrentStepIndex)
  const setPlaybackSpeed = useDsaLabStore((s) => s.setPlaybackSpeed)
  const setCustomInput = useDsaLabStore((s) => s.setCustomInput)

  const [inputModalOpen, setInputModalOpen] = useState(false)
  const [arrayInputStr, setArrayInputStr] = useState('')
  const [targetInputStr, setTargetInputStr] = useState('')

  // Automatic playback timer
  useEffect(() => {
    if (!isPlaying) return

    const intervalMs = Math.max(200, 1200 / playbackSpeed)
    const timer = setInterval(() => {
      stepForward()
    }, intervalMs)

    return () => clearInterval(timer)
  }, [isPlaying, playbackSpeed, stepForward])

  // Open input editor prefilled
  const handleOpenInputModal = () => {
    const currentArr = customInput?.array || activeTopic.defaultInput?.array || [2, 5, 8, 12, 16, 23, 38, 56, 72, 91]
    const currentTarget = customInput?.target ?? activeTopic.defaultInput?.target ?? 23
    setArrayInputStr(currentArr.join(', '))
    setTargetInputStr(String(currentTarget))
    setInputModalOpen(true)
  }

  // Save custom input
  const handleSaveCustomInput = () => {
    try {
      const parsed = arrayInputStr
        .split(',')
        .map((x) => parseInt(x.trim(), 10))
        .filter((n) => !isNaN(n))

      if (parsed.length > 0) {
        setCustomInput({
          array: parsed,
          target: parseInt(targetInputStr, 10) || parsed[Math.floor(parsed.length / 2)],
        })
      }
      setInputModalOpen(false)
    } catch {
      setInputModalOpen(false)
    }
  }

  // Generate random data
  const handleRandomize = () => {
    const size = Math.floor(Math.random() * 5) + 6 // 6 to 10 items
    const randomSorted = Array.from({ length: size }, () => Math.floor(Math.random() * 80) + 1).sort((a, b) => a - b)
    const randomTarget = randomSorted[Math.floor(Math.random() * randomSorted.length)]
    setCustomInput({
      array: randomSorted,
      target: randomTarget,
    })
  }

  const speedOptions = [0.5, 1, 2, 3]

  return (
    <div className="bg-surface rounded-2xl border border-border-subtle p-3 shadow-lg flex flex-col gap-3">
      {/* Timeline Slider Bar */}
      <div className="flex items-center gap-3">
        <span className="text-xs font-mono font-bold text-text-muted min-w-[55px]">
          Step {Math.min(currentStepIndex + 1, totalSteps)}/{totalSteps}
        </span>

        <div className="relative flex-1 flex items-center">
          <input
            type="range"
            min={0}
            max={Math.max(0, totalSteps - 1)}
            value={currentStepIndex}
            onChange={(e) => setCurrentStepIndex(parseInt(e.target.value, 10))}
            className="w-full h-2 bg-hover rounded-lg appearance-none cursor-pointer accent-accent transition-all"
          />
        </div>

        {/* Speed Selector */}
        <div className="flex items-center gap-1 bg-hover/60 p-1 rounded-xl border border-border-subtle">
          <Gauge className="w-3.5 h-3.5 text-text-muted ml-1" />
          {speedOptions.map((spd) => (
            <button
              key={spd}
              onClick={() => setPlaybackSpeed(spd)}
              className={`px-2 py-0.5 text-[11px] font-bold rounded-md transition-all ${
                playbackSpeed === spd ? 'bg-accent text-white shadow' : 'text-text-muted hover:text-text-primary'
              }`}
            >
              {spd}x
            </button>
          ))}
        </div>
      </div>

      {/* Control Buttons HUD */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* Restart */}
          <button
            onClick={resetPlayback}
            className="p-2 rounded-xl border border-border-subtle text-text-secondary hover:text-text-primary hover:bg-hover transition-colors"
            title="Restart from step 1"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Step Backward */}
          <button
            onClick={stepBackward}
            disabled={currentStepIndex === 0}
            className="p-2 rounded-xl border border-border-subtle text-text-secondary hover:text-text-primary hover:bg-hover disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            title="Step backward (Left Arrow)"
          >
            <SkipBack className="w-4 h-4" />
          </button>

          {/* Primary Play / Pause Button */}
          <button
            onClick={togglePlay}
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-accent text-white hover:bg-accent-light font-bold text-xs shadow-md shadow-accent/25 transition-all transform active:scale-95"
            title="Play / Pause (Spacebar)"
          >
            {isPlaying ? (
              <>
                <Pause className="w-4 h-4 fill-current" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current ml-0.5" />
                <span>Play</span>
              </>
            )}
          </button>

          {/* Step Forward */}
          <button
            onClick={stepForward}
            disabled={currentStepIndex >= totalSteps - 1}
            className="p-2 rounded-xl border border-border-subtle text-text-secondary hover:text-text-primary hover:bg-hover disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            title="Step forward (Right Arrow)"
          >
            <SkipForward className="w-4 h-4" />
          </button>
        </div>

        {/* Custom Data Input & Randomize */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleRandomize}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border-subtle text-xs font-semibold text-text-secondary hover:text-text-primary hover:bg-hover transition-colors"
            title="Generate random array testcase"
          >
            <Shuffle className="w-3.5 h-3.5 text-accent" />
            <span className="hidden sm:inline">Randomize</span>
          </button>

          <button
            onClick={handleOpenInputModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-accent/15 border border-accent/25 text-xs font-semibold text-accent-light hover:bg-accent/25 transition-colors"
            title="Customize input values and parameters"
          >
            <Settings2 className="w-3.5 h-3.5" />
            <span>Custom Input</span>
          </button>
        </div>
      </div>

      {/* Dialog for Custom Input Modal */}
      <Dialog open={inputModalOpen} onOpenChange={setInputModalOpen}>
        <DialogContent className="sm:max-w-[460px] bg-surface border-border-subtle">
          <DialogHeader>
            <DialogTitle className="text-text-primary">Customize 3D Algorithm Input</DialogTitle>
            <DialogDescription className="text-text-secondary">
              Input comma-separated integers to simulate custom edge-cases, single elements, or sorted arrays.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-3">
            <div>
              <label className="text-xs font-bold text-text-primary mb-1.5 block">Array Elements (Comma separated)</label>
              <Input
                value={arrayInputStr}
                onChange={(e) => setArrayInputStr(e.target.value)}
                placeholder="2, 5, 8, 12, 16, 23, 38, 56"
                className="bg-card border-border-subtle font-mono text-sm"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-text-primary mb-1.5 block">Target Search Value (Optional)</label>
              <Input
                value={targetInputStr}
                onChange={(e) => setTargetInputStr(e.target.value)}
                placeholder="23"
                className="bg-card border-border-subtle font-mono text-sm"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setInputModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveCustomInput} className="bg-accent text-white hover:bg-accent-light">
              Apply & Recompute 3D Scene
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
