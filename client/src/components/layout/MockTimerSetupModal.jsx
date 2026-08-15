import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Timer, X, Play, Clock, Sparkles, AlertCircle } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'

const PRESET_OPTIONS = [
  { mins: 15, label: '15 Mins', desc: 'Quick Quiz' },
  { mins: 25, label: '25 Mins', desc: 'Pomodoro Sprint' },
  { mins: 45, label: '45 Mins', desc: 'Coding OA (Recommended)' },
  { mins: 60, label: '60 Mins', desc: 'Technical Contest' },
  { mins: 90, label: '90 Mins', desc: 'Full Length Mock' },
]

export default function MockTimerSetupModal() {
  const { timerSetupModalOpen, closeTimerSetup, startTimerWithDuration } = useAppStore()
  const [selectedMins, setSelectedMins] = useState(45)
  const [customMins, setCustomMins] = useState('')
  const [isCustom, setIsCustom] = useState(false)

  if (!timerSetupModalOpen) return null

  const handleStart = (e) => {
    e.preventDefault()
    let minsToUse = selectedMins
    if (isCustom && customMins) {
      const parsed = parseInt(customMins, 10)
      if (!isNaN(parsed) && parsed > 0 && parsed <= 300) {
        minsToUse = parsed
      }
    }
    const seconds = minsToUse * 60
    startTimerWithDuration(seconds)
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-200">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full max-w-lg rounded-3xl bg-card border border-border-subtle p-6 sm:p-7 shadow-2xl space-y-5 text-text-primary backdrop-blur-2xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border-subtle pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-accent/20 text-accent border border-accent/30 shadow-md">
                <Timer className="h-6 w-6 animate-pulse" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-text-primary tracking-tight">
                  OA Simulator & Mock Timer
                </h2>
                <p className="text-xs text-text-muted">
                  Set target timer duration before launching floating top capsule
                </p>
              </div>
            </div>

            <button
              onClick={closeTimerSetup}
              className="p-2 rounded-xl text-text-muted hover:text-text-primary hover:bg-hover transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Main Selection Area */}
          <form onSubmit={handleStart} className="space-y-4">
            <label className="text-xs font-bold uppercase tracking-wider text-accent flex items-center gap-1.5">
              <Clock className="h-4 w-4" /> Select Assessment Duration
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {PRESET_OPTIONS.map((opt) => {
                const isSelected = !isCustom && selectedMins === opt.mins
                return (
                  <button
                    key={opt.mins}
                    type="button"
                    onClick={() => {
                      setIsCustom(false)
                      setSelectedMins(opt.mins)
                    }}
                    className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between space-y-1.5 ${
                      isSelected
                        ? 'border-accent bg-accent/15 dark:bg-accent/20 shadow-md shadow-accent/15 ring-1 ring-accent'
                        : 'border-border-subtle bg-surface/60 hover:bg-hover hover:border-accent/40 text-text-muted'
                    }`}
                  >
                    <span className="font-bold text-sm text-text-primary">{opt.label}</span>
                    <span className="text-[11px] text-text-secondary">{opt.desc}</span>
                  </button>
                )
              })}

              {/* Custom Minutes Card */}
              <button
                type="button"
                onClick={() => setIsCustom(true)}
                className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between space-y-1.5 ${
                  isCustom
                    ? 'border-accent bg-accent/15 dark:bg-accent/20 shadow-md shadow-accent/15 ring-1 ring-accent'
                    : 'border-border-subtle bg-surface/60 hover:bg-hover hover:border-accent/40 text-text-muted'
                }`}
              >
                <span className="font-bold text-sm text-text-primary">Custom Duration</span>
                <span className="text-[11px] text-text-secondary">Enter any custom minutes</span>
              </button>
            </div>

            {/* Custom Minutes Input */}
            {isCustom && (
              <div className="p-3.5 rounded-2xl bg-surface border border-border-subtle space-y-2 animate-in fade-in">
                <label className="text-xs font-bold text-text-secondary block">Minutes (1 - 300 mins):</label>
                <input
                  type="number"
                  min={1}
                  max={300}
                  placeholder="e.g. 35"
                  value={customMins}
                  onChange={(e) => setCustomMins(e.target.value)}
                  className="w-full bg-card border border-border-subtle rounded-xl px-3.5 py-2 text-sm font-mono font-bold text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent"
                  autoFocus
                />
              </div>
            )}

            {/* Start Button */}
            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={closeTimerSetup}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-text-secondary hover:text-text-primary hover:bg-hover transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-accent hover:bg-accent-light text-white font-bold text-xs shadow-lg shadow-accent/25 hover:opacity-95 transition-all flex items-center gap-2"
              >
                <Play className="h-4 w-4 fill-current" />
                <span>Start Mock Assessment</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
