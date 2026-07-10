import { LayoutDashboard, Code2, CheckSquare, Briefcase, Flame } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useProblems } from '@/hooks/useProblems'
import { useTopics } from '@/hooks/useTopics'
import { useApplications } from '@/hooks/useApplications'
import { useStreak } from '@/hooks/useStreak'
import { Skeleton } from '@/components/ui/skeleton'
import StatsCard from '@/components/dashboard/StatsCard'
import ProgressRing from '@/components/dashboard/ProgressRing'
import StreakBar from '@/components/dashboard/StreakBar'
import WeeklySnapshot from '@/components/dashboard/WeeklySnapshot'
import DailyFocusQueue from '@/components/dashboard/DailyFocusQueue'
import RadarCompetency from '@/components/dashboard/RadarCompetency'

export default function Dashboard() {
  const { user, profile } = useAuth()
  const { problems, loading: loadingProbs, updateProblem } = useProblems(user?.uid)
  const { topics, loading: loadingTopics, updateTopic } = useTopics(user?.uid)
  const { applications, loading: loadingApps } = useApplications(user?.uid)
  const { streakData } = useStreak(user?.uid)

  const loading = loadingProbs || loadingTopics || loadingApps

  // Calculations for Stats Overview
  const totalProblems = problems.length
  const completedTopics = topics.filter((t) => t.status === 'Done').length
  const totalTopics = topics.length
  const activeApps = applications.filter(
    (app) => !['Offered', 'Rejected', 'Archived'].includes(app.status)
  ).length
  const currentStreak = streakData?.currentStreak || 0

  // Calculations for Progress Rings
  const dsaList = topics.filter((t) => t.subject === 'DSA')
  const dsaPct = dsaList.length
    ? Math.round((dsaList.filter((t) => t.status === 'Done').length / dsaList.length) * 100)
    : 0

  const csList = topics.filter((t) => ['OS', 'DBMS', 'CN', 'OOPS'].includes(t.subject))
  const csPct = csList.length
    ? Math.round((csList.filter((t) => t.status === 'Done').length / csList.length) * 100)
    : 0

  const aptList = topics.filter((t) => t.subject.startsWith('Aptitude-'))
  const aptPct = aptList.length
    ? Math.round((aptList.filter((t) => t.status === 'Done').length / aptList.length) * 100)
    : 0

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex gap-4">
          <Skeleton className="h-10 w-40" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24 w-full rounded-card" />
          ))}
        </div>
        <Skeleton className="h-32 w-full rounded-card" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-28 w-full rounded-card" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Dashboard Welcome Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/15">
          <LayoutDashboard className="h-5 w-5 text-accent-light" />
        </div>
        <div>
          <h1 className="text-page font-bold text-text-primary">
            Welcome, {profile?.displayName || user?.displayName || 'User'}
          </h1>
          <p className="text-secondary text-text-secondary">Your daily command center for placement prep.</p>
        </div>
      </div>

      {/* Stats Overview Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Problems Logged"
          value={totalProblems}
          icon={Code2}
          description="Solved externally, tracked here"
        />
        <StatsCard
          title="Topics Completed"
          value={`${completedTopics}/${totalTopics}`}
          icon={CheckSquare}
          description="Across all core subjects"
        />
        <StatsCard
          title="Active Applications"
          value={activeApps}
          icon={Briefcase}
          description="In wishlist, interview or OA stages"
        />
        <StatsCard
          title="Current Streak"
          value={`${currentStreak} days`}
          icon={Flame}
          description="Keep logging to stay active"
        />
      </div>

      {/* Daily Focus Queue */}
      <div className="space-y-3">
        <h2 className="text-section font-semibold text-text-primary">Daily Focus Queue</h2>
        <DailyFocusQueue
          problems={problems}
          topics={topics}
          applications={applications}
          onUpdateProblem={updateProblem}
          onUpdateTopic={updateTopic}
        />
      </div>

      {/* Streak Heatmap Bar */}
      <div className="space-y-3">
        <h2 className="text-section font-semibold text-text-primary">Activity Log</h2>
        <StreakBar streakData={streakData} />
      </div>

      {/* Progress & Competency Coverage Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-3">
          <h2 className="text-section font-semibold text-text-primary">Subject Coverage</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <ProgressRing percentage={dsaPct} label="DSA Prep" strokeColor="stroke-accent" />
            <ProgressRing percentage={csPct} label="CS Theory" strokeColor="stroke-semantic-purple" />
            <ProgressRing percentage={aptPct} label="Aptitude" strokeColor="stroke-semantic-green" />
          </div>
        </div>
        <div className="space-y-3">
          <h2 className="text-section font-semibold text-text-primary">Competency Map</h2>
          <RadarCompetency topics={topics} />
        </div>
      </div>

      {/* Weekly snapshot statistics */}
      <WeeklySnapshot problems={problems} topics={topics} applications={applications} />
    </div>
  )
}
