import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CalendarRange, Code2, CheckSquare, RefreshCw, Milestone } from 'lucide-react'
import { startOfWeek } from '@/utils/dateHelpers'

export default function WeeklySnapshot({ problems, topics, applications }) {
  const weekStart = startOfWeek()

  // 1. Problems logged this week
  const problemsThisWeek = problems.filter((p) => {
    const d = p.createdAt?.toDate ? p.createdAt.toDate() : new Date(p.createdAt)
    return d >= weekStart
  }).length

  // 2. Topics completed this week
  const topicsCompletedThisWeek = topics.filter((t) => {
    if (t.status !== 'Done') return false
    const d = t.updatedAt?.toDate ? t.updatedAt.toDate() : new Date(t.updatedAt)
    return d >= weekStart
  }).length

  // 3. Red -> Green conversions this week
  const redToGreenConversions = problems.filter((p) => {
    if (p.confidenceStatus !== 'Green') return false
    const history = p.statusHistory || []
    const hasRed = history.some((h) => h.status === 'Red')
    if (!hasRed) return false

    // Check if the most recent transition to Green occurred this week
    const lastGreen = [...history].reverse().find((h) => h.status === 'Green')
    if (!lastGreen) return false

    const greenTime = lastGreen.timestamp?.toDate ? lastGreen.timestamp.toDate() : new Date(lastGreen.timestamp)
    return greenTime >= weekStart
  }).length

  // 4. Applications moved forward this week
  const appsMovedThisWeek = applications.filter((app) => {
    const history = app.statusHistory || []
    if (history.length <= 1) return false // No state change after creation

    // Check if any status change (excluding the initial creation) occurred this week
    const changesThisWeek = history.slice(1).some((h) => {
      const time = h.timestamp?.toDate ? h.timestamp.toDate() : new Date(h.timestamp)
      return time >= weekStart
    })
    return changesThisWeek
  }).length

  return (
    <Card>
      <CardHeader className="pb-3 border-b border-border-subtle flex flex-row items-center gap-2">
        <CalendarRange className="h-5 w-5 text-accent-light shrink-0" />
        <CardTitle className="text-card-title font-semibold">Weekly Snapshot</CardTitle>
      </CardHeader>
      <CardContent className="p-5">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-surface p-4 rounded-lg border border-border-subtle flex gap-3 items-center">
            <div className="h-9 w-9 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
              <Code2 className="h-5 w-5 text-accent-light" />
            </div>
            <div>
              <p className="text-[20px] font-bold text-text-primary">{problemsThisWeek}</p>
              <p className="text-micro text-text-muted">Problems Logged</p>
            </div>
          </div>

          <div className="bg-surface p-4 rounded-lg border border-border-subtle flex gap-3 items-center">
            <div className="h-9 w-9 rounded-lg bg-semantic-green-bg flex items-center justify-center shrink-0">
              <CheckSquare className="h-5 w-5 text-semantic-green" />
            </div>
            <div>
              <p className="text-[20px] font-bold text-text-primary">{topicsCompletedThisWeek}</p>
              <p className="text-micro text-text-muted">Topics Completed</p>
            </div>
          </div>

          <div className="bg-surface p-4 rounded-lg border border-border-subtle flex gap-3 items-center">
            <div className="h-9 w-9 rounded-lg bg-semantic-red-bg flex items-center justify-center shrink-0">
              <RefreshCw className="h-5 w-5 text-semantic-red" />
            </div>
            <div>
              <p className="text-[20px] font-bold text-text-primary">{redToGreenConversions}</p>
              <p className="text-micro text-text-muted">Red → Green</p>
            </div>
          </div>

          <div className="bg-surface p-4 rounded-lg border border-border-subtle flex gap-3 items-center">
            <div className="h-9 w-9 rounded-lg bg-semantic-purple-bg flex items-center justify-center shrink-0">
              <Milestone className="h-5 w-5 text-semantic-purple" />
            </div>
            <div>
              <p className="text-[20px] font-bold text-text-primary">{appsMovedThisWeek}</p>
              <p className="text-micro text-text-muted">Apps Advanced</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
