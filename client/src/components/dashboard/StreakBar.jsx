import { Flame, Trophy } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

export default function StreakBar({ streakData }) {
  const { currentStreak = 0, longestStreak = 0, activityLog = [] } = streakData || {}

  // Generate the last 14 dates (including today)
  const last14Days = Array.from({ length: 14 }).map((_, idx) => {
    const d = new Date()
    d.setDate(d.getDate() - (13 - idx)) // 13 days ago to today
    return d.toISOString().split('T')[0]
  })

  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-semantic-red-bg flex items-center justify-center shrink-0 animate-pulse">
              <Flame className="h-6 w-6 text-semantic-red" />
            </div>
            <div>
              <p className="text-secondary text-text-secondary font-medium">Daily Streak</p>
              <h3 className="text-stat font-bold text-text-primary">
                {currentStreak} <span className="text-body font-medium text-text-muted">days</span>
              </h3>
            </div>
          </div>

          {/* Heatmap Grid */}
          <div className="flex-1 flex flex-col gap-2">
            <div className="flex items-center gap-1 justify-between sm:justify-start">
              {last14Days.map((dateStr) => {
                const isActive = activityLog.includes(dateStr)
                const d = new Date(dateStr)
                const dayName = d.toLocaleDateString('en-US', { weekday: 'narrow' })
                return (
                  <div key={dateStr} className="flex flex-col items-center gap-1">
                    <div
                      title={dateStr + (isActive ? ' (Active)' : ' (No activity)')}
                      className={`h-7 w-7 sm:h-8 sm:w-8 rounded-md transition-all duration-300 ${
                        isActive
                          ? 'bg-semantic-green accent-glow scale-105'
                          : 'bg-hover border border-border-subtle hover:border-border-hover'
                      }`}
                    />
                    <span className="text-[10px] text-text-muted font-medium uppercase">{dayName}</span>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="flex items-center gap-3 border-t md:border-t-0 md:border-l border-border-subtle pt-4 md:pt-0 md:pl-6 shrink-0">
            <Trophy className="h-5 w-5 text-semantic-yellow shrink-0" />
            <div>
              <p className="text-micro text-text-muted uppercase tracking-wider">Longest Streak</p>
              <p className="text-body font-bold text-text-primary">{longestStreak} days</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
