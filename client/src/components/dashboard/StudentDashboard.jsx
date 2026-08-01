import { useState } from 'react'
import { LayoutDashboard, Code2, CheckSquare, Briefcase, Flame, Users, Sparkles, Target, Award } from 'lucide-react'
import StatsCard from '@/components/dashboard/StatsCard'
import ProgressRing from '@/components/dashboard/ProgressRing'
import StreakBar from '@/components/dashboard/StreakBar'
import WeeklySnapshot from '@/components/dashboard/WeeklySnapshot'
import DailyFocusQueue from '@/components/dashboard/DailyFocusQueue'
import RadarCompetency from '@/components/dashboard/RadarCompetency'
import AssessmentTimer from '@/components/dashboard/AssessmentTimer'
import GroupStudyModal from '@/components/study/GroupStudyModal'
import { computeAutomatedProgress } from '@/services/firestoreService'

import ApplicationsKanban from '@/components/applications/ApplicationsKanban'
import PeerInterviewMatcher from '@/components/study/PeerInterviewMatcher'

export default function StudentDashboard({ user, profile, problems, topics, applications, streakData, updateProblem, updateTopic }) {
  const [isGroupStudyOpen, setIsGroupStudyOpen] = useState(false)
  const [activeStudentTab, setActiveStudentTab] = useState('overview') // 'overview' | 'kanban' | 'peer'

  // Compute automated progress without manual checkbox dependency
  const autoProgress = computeAutomatedProgress(problems, topics)

  const totalProblems = problems.length
  const completedTopics = topics.filter((t) => t.status === 'Done').length
  const totalTopics = topics.length
  const activeApps = applications.filter(
    (app) => !['Offered', 'Rejected', 'Archived'].includes(app.status)
  ).length
  const currentStreak = streakData?.currentStreak || 0

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Banner Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-accent/15 via-surface/60 to-surface/40 border border-white/10 shadow-lg">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/20 text-accent border border-accent/30 shadow-inner">
            <LayoutDashboard className="h-6 w-6 text-accent-light" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-text-primary">
                Welcome back, {profile?.displayName || user?.displayName || 'Student'}!
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-accent/20 text-accent text-xs font-semibold border border-accent/30">
                🎓 Student
              </span>
            </div>
            <p className="text-xs text-text-muted mt-0.5">
              Your automated command center for placement prep & group study sessions.
            </p>
          </div>
        </div>

        {/* Group Study Launcher */}
        <button
          onClick={() => setIsGroupStudyOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-accent to-accent-light text-white text-xs font-semibold hover:opacity-95 transition-all shadow-lg shadow-accent/25 flex items-center justify-center gap-2 shrink-0 border border-accent/40"
        >
          <Users className="h-4 w-4" />
          <span>Launch Group Study Room</span>
        </button>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-2">
        <button
          onClick={() => setActiveStudentTab('overview')}
          className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all ${
            activeStudentTab === 'overview'
              ? 'bg-accent text-white shadow-md shadow-accent/20'
              : 'text-text-muted hover:text-text-primary hover:bg-surface/50'
          }`}
        >
          Dashboard Overview
        </button>
        <button
          onClick={() => setActiveStudentTab('kanban')}
          className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all ${
            activeStudentTab === 'kanban'
              ? 'bg-accent text-white shadow-md shadow-accent/20'
              : 'text-text-muted hover:text-text-primary hover:bg-surface/50'
          }`}
        >
          Application Kanban Pipeline
        </button>
        <button
          onClick={() => setActiveStudentTab('peer')}
          className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all ${
            activeStudentTab === 'peer'
              ? 'bg-accent text-white shadow-md shadow-accent/20'
              : 'text-text-muted hover:text-text-primary hover:bg-surface/50'
          }`}
        >
          1v1 Peer Mock Matcher
        </button>
      </div>

      {activeStudentTab === 'kanban' && (
        <ApplicationsKanban applications={applications} />
      )}

      {activeStudentTab === 'peer' && (
        <PeerInterviewMatcher user={user} />
      )}

      {activeStudentTab === 'overview' && (
        <>
          {/* Stats Overview Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatsCard
              title="Problems Logged"
              value={totalProblems}
              icon={Code2}
              description="Auto-synced with topics & skills"
            />
            <StatsCard
              title="Topics Completed"
              value={`${completedTopics}/${totalTopics}`}
              icon={CheckSquare}
              description="Auto-computed subject mastery"
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
              description="Keep solving to maintain streak"
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
              problems={problems}
              topics={topics}
              applications={applications}
              onUpdateProblem={updateProblem}
              onUpdateTopic={updateTopic}
            />
          </div>

          {/* Peer Matcher Quick Teaser */}
          <PeerInterviewMatcher user={user} />

          {/* Activity Heatmap Bar */}
          <div className="space-y-3">
            <h2 className="text-section font-semibold text-text-primary">Activity Log & Streak</h2>
            <StreakBar streakData={streakData} />
          </div>

          {/* Progress & Competency Coverage Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-section font-semibold text-text-primary">Automated Subject Coverage</h2>
                  <span className="text-[11px] text-accent font-medium bg-accent/10 px-2 py-0.5 rounded-md">
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
              <RadarCompetency topics={topics} />
            </div>
          </div>

          {/* Weekly snapshot statistics */}
          <WeeklySnapshot problems={problems} topics={topics} applications={applications} />
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
