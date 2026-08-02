import { useState } from 'react'
import {
  LayoutDashboard, Code2, CheckSquare, Briefcase, Flame, Users, Sparkles,
  Target, Award, ChevronRight, Zap, ShieldCheck, Play
} from 'lucide-react'
import StatsCard from '@/components/dashboard/StatsCard'
import ProgressRing from '@/components/dashboard/ProgressRing'
import StreakBar from '@/components/dashboard/StreakBar'
import WeeklySnapshot from '@/components/dashboard/WeeklySnapshot'
import DailyFocusQueue from '@/components/dashboard/DailyFocusQueue'
import RadarCompetency from '@/components/dashboard/RadarCompetency'
import AssessmentTimer from '@/components/dashboard/AssessmentTimer'
import GroupStudyModal from '@/components/study/GroupStudyModal'
import ApplicationsKanban from '@/components/applications/ApplicationsKanban'
import PeerInterviewMatcher from '@/components/study/PeerInterviewMatcher'
import { computeAutomatedProgress } from '@/services/firestoreService'
import { useAppStore } from '@/store/useAppStore'

export default function StudentDashboard({
  user,
  profile,
  problems = [],
  topics = [],
  applications = [],
  streakData = {},
  updateProblem,
  updateTopic
}) {
  const { openAICoach } = useAppStore()
  const [isGroupStudyOpen, setIsGroupStudyOpen] = useState(false)
  const [activeStudentTab, setActiveStudentTab] = useState('overview') // 'overview' | 'kanban' | 'peer'

  // Safe defaults
  const safeProblems = Array.isArray(problems) ? problems : []
  const safeTopics = Array.isArray(topics) ? topics : []
  const safeApps = Array.isArray(applications) ? applications : []

  // Compute automated progress without manual checkbox dependency
  const autoProgress = computeAutomatedProgress(safeProblems, safeTopics)

  const totalProblems = safeProblems.length
  const completedTopics = safeTopics.filter((t) => t && t.status === 'Done').length
  const totalTopics = safeTopics.length
  const activeApps = safeApps.filter(
    (app) => app && !['Offered', 'Rejected', 'Archived'].includes(app.status)
  ).length
  const currentStreak = streakData?.currentStreak || 0

  return (
    <div className="space-y-6 animate-in fade-in duration-300 max-w-full overflow-x-hidden">
      {/* Refined Modern Hero Banner */}
      <div className="relative overflow-hidden p-6 rounded-3xl bg-gradient-to-r from-accent/20 via-surface to-surface border border-accent/30 shadow-xl">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 rounded-full bg-accent/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-accent to-accent-light text-white shadow-lg shadow-accent/25 border border-white/20 shrink-0">
              <LayoutDashboard className="h-7 w-7" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-2xl font-extrabold tracking-tight text-text-primary">
                  Welcome back, {profile?.displayName || user?.displayName || 'Candidate'}!
                </h1>
                <span className="px-3 py-0.5 rounded-full bg-accent/20 text-accent text-xs font-bold border border-accent/40 flex items-center gap-1.5 shadow-sm">
                  <Zap className="h-3.5 w-3.5 fill-current" /> Placement Candidate
                </span>
              </div>
              <p className="text-xs text-text-secondary leading-relaxed">
                Automated placement command center • {safeProblems.length} problems solved • {completedTopics}/{totalTopics} topics mastered
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={openAICoach}
              className="px-4 py-2.5 rounded-xl bg-surface/80 hover:bg-surface border border-accent/40 text-accent-light text-xs font-semibold transition-all flex items-center gap-2 shadow-sm"
            >
              <Sparkles className="h-4 w-4 text-accent animate-pulse" />
              <span>Ask AI Coach</span>
            </button>
            <button
              onClick={() => setIsGroupStudyOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-accent to-accent-light text-white text-xs font-semibold hover:opacity-95 transition-all shadow-lg shadow-accent/25 flex items-center gap-2 border border-accent/40"
            >
              <Users className="h-4 w-4" />
              <span>Launch Group Study Room</span>
            </button>
          </div>
        </div>
      </div>

      {/* Sub-Navigation Tabs Bar */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-surface/60 border border-white/10 backdrop-blur-md overflow-x-auto">
        <button
          onClick={() => setActiveStudentTab('overview')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap flex items-center gap-2 ${
            activeStudentTab === 'overview'
              ? 'bg-accent text-white shadow-md shadow-accent/25'
              : 'text-text-muted hover:text-text-primary hover:bg-white/5'
          }`}
        >
          <LayoutDashboard className="h-3.5 w-3.5" />
          <span>Dashboard Overview</span>
        </button>

        <button
          onClick={() => setActiveStudentTab('kanban')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap flex items-center gap-2 ${
            activeStudentTab === 'kanban'
              ? 'bg-accent text-white shadow-md shadow-accent/25'
              : 'text-text-muted hover:text-text-primary hover:bg-white/5'
          }`}
        >
          <Briefcase className="h-3.5 w-3.5" />
          <span>Application Kanban ({activeApps})</span>
        </button>

        <button
          onClick={() => setActiveStudentTab('peer')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap flex items-center gap-2 ${
            activeStudentTab === 'peer'
              ? 'bg-accent text-white shadow-md shadow-accent/25'
              : 'text-text-muted hover:text-text-primary hover:bg-white/5'
          }`}
        >
          <Users className="h-3.5 w-3.5" />
          <span>1v1 Peer Mock Matcher</span>
        </button>
      </div>

      {/* Render Active View */}
      {activeStudentTab === 'kanban' && (
        <ApplicationsKanban applications={safeApps} />
      )}

      {activeStudentTab === 'peer' && (
        <PeerInterviewMatcher user={user} />
      )}

      {activeStudentTab === 'overview' && (
        <>
          {/* Key Metric Stats Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatsCard
              title="Problems Logged"
              value={totalProblems}
              icon={Code2}
              description="Auto-synced with practice velocity"
            />
            <StatsCard
              title="Topics Mastered"
              value={`${completedTopics}/${totalTopics}`}
              icon={CheckSquare}
              description="Auto-computed subject mastery"
            />
            <StatsCard
              title="Active Job Drives"
              value={activeApps}
              icon={Briefcase}
              description="In wishlist, interview or OA stages"
            />
            <StatsCard
              title="Daily Active Streak"
              value={`${currentStreak} Days`}
              icon={Flame}
              description="Maintain streak to boost rank"
            />
          </div>

          {/* Daily Focus Queue */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-section font-semibold text-text-primary flex items-center gap-2">
                <Target className="h-4 w-4 text-accent" />
                Automated Daily Focus Queue
              </h2>
              <span className="text-[11px] text-text-muted">Auto-suggested based on practice velocity</span>
            </div>
            <DailyFocusQueue
              problems={safeProblems}
              topics={safeTopics}
              applications={safeApps}
              onUpdateProblem={updateProblem}
              onUpdateTopic={updateTopic}
            />
          </div>

          {/* Peer Matcher Quick Teaser */}
          <PeerInterviewMatcher user={user} />

          {/* Activity Heatmap Bar */}
          <div className="space-y-3">
            <h2 className="text-section font-semibold text-text-primary">Activity Log & Streak Heatmap</h2>
            <StreakBar streakData={streakData} />
          </div>

          {/* Progress & Competency Coverage Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-section font-semibold text-text-primary">Automated Subject Coverage</h2>
                  <span className="text-[11px] text-accent font-medium bg-accent/10 px-2.5 py-0.5 rounded-lg border border-accent/20">
                    Auto-calculated
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <ProgressRing percentage={autoProgress.dsaPct} label="DSA Mastery" strokeColor="stroke-accent" />
                  <ProgressRing percentage={autoProgress.csPct} label="CS Theory" strokeColor="stroke-semantic-purple" />
                  <ProgressRing percentage={autoProgress.aptPct} label="Aptitude" strokeColor="stroke-semantic-green" />
                </div>
              </div>

              <div className="space-y-3">
                <h2 className="text-section font-semibold text-text-primary">Timed Assessment Mock</h2>
                <AssessmentTimer />
              </div>
            </div>

            <div className="space-y-3">
              <h2 className="text-section font-semibold text-text-primary">Competency Map</h2>
              <RadarCompetency topics={safeTopics} />
            </div>
          </div>

          {/* Weekly snapshot statistics */}
          <WeeklySnapshot problems={safeProblems} topics={safeTopics} applications={safeApps} />
        </>
      )}

      {/* Group Study Modal */}
      <GroupStudyModal
        isOpen={isGroupStudyOpen}
        onClose={() => setIsGroupStudyOpen(false)}
        user={user}
      />
    </div>
  )
}
