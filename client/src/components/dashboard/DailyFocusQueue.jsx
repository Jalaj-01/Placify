import { useNavigate } from 'react-router-dom'
import { Check, ArrowRight, AlertTriangle, BookOpen, Code2, Milestone } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatDate } from '@/utils/dateHelpers'

export default function DailyFocusQueue({
  problems = [],
  topics = [],
  applications = [],
  onUpdateProblem,
  onUpdateTopic,
}) {
  const navigate = useNavigate()
  const today = new Date()

  const safeProblems = Array.isArray(problems) ? problems : []
  const safeTopics = Array.isArray(topics) ? topics : []
  const safeApps = Array.isArray(applications) ? applications : []

  // 1. Due Problem for review
  const dueProblems = safeProblems
    .filter((p) => {
      if (!p || p.confidenceStatus === 'Green' || !p.nextReviewDate) return false
      const revDate = p.nextReviewDate?.toDate ? p.nextReviewDate.toDate() : new Date(p.nextReviewDate)
      return !isNaN(revDate.getTime()) && revDate <= today
    })
    .sort((a, b) => {
      const da = a.nextReviewDate?.toDate ? a.nextReviewDate.toDate() : new Date(a.nextReviewDate)
      const db = b.nextReviewDate?.toDate ? b.nextReviewDate.toDate() : new Date(b.nextReviewDate)
      return da - db
    })
  const focusProblem = dueProblems[0]

  // 2. Stale DSA Topic (In Progress for >= 3 days)
  const threeDaysAgo = new Date()
  threeDaysAgo.setDate(threeDaysAgo.getDate() - 3)
  const staleDsaTopics = safeTopics
    .filter((t) => {
      if (!t || t.subject !== 'DSA' || t.status !== 'In Progress' || !t.updatedAt) return false
      const updDate = t.updatedAt?.toDate ? t.updatedAt.toDate() : new Date(t.updatedAt)
      return !isNaN(updDate.getTime()) && updDate <= threeDaysAgo
    })
    .sort((a, b) => {
      const da = a.updatedAt?.toDate ? a.updatedAt.toDate() : new Date(a.updatedAt)
      const db = b.updatedAt?.toDate ? b.updatedAt.toDate() : new Date(b.updatedAt)
      return da - db
    })
  const focusDsaTopic = staleDsaTopics[0]

  // 3. Next CS Theory Topic (Not Started)
  const focusCsTopic = safeTopics.find(
    (t) => t && ['OS', 'DBMS', 'CN', 'OOPS'].includes(t.subject) && t.status === 'Not Started'
  )

  // 4. Next Aptitude Topic (Not Started or In Progress)
  const focusAptTopic = safeTopics.find(
    (t) => t && typeof t.subject === 'string' && t.subject.startsWith('Aptitude') && (t.status === 'In Progress' || t.status === 'Not Started')
  )

  // 5. Urgent Applications (roundDate <= 48 hours in future)
  const urgentApps = safeApps.filter((app) => {
    if (!app || !app.roundDate) return false
    const d = app.roundDate.toDate ? app.roundDate.toDate() : new Date(app.roundDate)
    if (isNaN(d.getTime())) return false
    const diff = d.getTime() - Date.now()
    return diff > 0 && diff <= 48 * 60 * 60 * 1000
  })

  // Compile items queue
  const queueItems = []

  // Add urgent apps first as warning cards
  urgentApps.forEach((app) => {
    queueItems.push({
      id: `app-${app.id}`,
      type: 'warning',
      icon: AlertTriangle,
      colorClass: 'border-semantic-red/40 bg-semantic-red-bg text-semantic-red',
      title: 'Urgent Application Alert',
      desc: `${app.companyName} (${app.role}) interview/OA scheduled for ${formatDate(app.roundDate)}.`,
      actionLabel: 'Go to Apps',
      action: () => navigate('/applications'),
    })
  })

  // Add Focus Problem
  if (focusProblem) {
    queueItems.push({
      id: `prob-${focusProblem.id}`,
      type: 'problem',
      icon: Code2,
      colorClass: 'border-accent/40 bg-accent/5 text-accent-light',
      title: 'Review Coded Problem',
      desc: `Revise "${focusProblem.title}" (${focusProblem.platform}) to lock in the pattern. Tag: ${focusProblem.tag}`,
      url: focusProblem.url,
      actionLabel: 'Mark Review Done (Green)',
      action: () => onUpdateProblem(focusProblem.id, { confidenceStatus: 'Green' }),
    })
  }

  // Add Stale DSA Topic
  if (focusDsaTopic) {
    queueItems.push({
      id: `dsa-${focusDsaTopic.id}`,
      type: 'topic-dsa',
      icon: BookOpen,
      colorClass: 'border-semantic-yellow/40 bg-semantic-yellow-bg text-semantic-yellow',
      title: 'Stale DSA Topic',
      desc: `You started "${focusDsaTopic.name}" but haven't updated it in 3+ days. Keep moving!`,
      actionLabel: 'Mark Completed',
      action: () => onUpdateTopic(focusDsaTopic.id, { status: 'Done' }),
    })
  }

  // Add Next CS Theory Topic
  if (focusCsTopic) {
    queueItems.push({
      id: `cs-${focusCsTopic.id}`,
      type: 'topic-cs',
      icon: BookOpen,
      colorClass: 'border-semantic-purple/40 bg-semantic-purple-bg text-semantic-purple',
      title: 'Next CS Theory Step',
      desc: `Learn the fundamentals of "${focusCsTopic.name}" under ${focusCsTopic.subject}.`,
      actionLabel: 'Start Topic',
      action: () => onUpdateTopic(focusCsTopic.id, { status: 'In Progress' }),
    })
  }

  // Add Next Aptitude Topic
  if (focusAptTopic) {
    queueItems.push({
      id: `apt-${focusAptTopic.id}`,
      type: 'topic-apt',
      icon: Milestone,
      colorClass: 'border-semantic-green/40 bg-semantic-green-bg text-semantic-green',
      title: 'Practice Aptitude',
      desc: `Practice questions on "${focusAptTopic.name}" to speed up your OA performance.`,
      actionLabel: focusAptTopic.status === 'In Progress' ? 'Mark Completed' : 'Start Topic',
      action: () =>
        onUpdateTopic(
          focusAptTopic.id,
          { status: focusAptTopic.status === 'In Progress' ? 'Done' : 'In Progress' }
        ),
    })
  }

  if (queueItems.length === 0) {
    return (
      <div className="text-center py-10 bg-card rounded-card border border-border-subtle">
        <Check className="h-10 w-10 text-semantic-green mx-auto mb-3" />
        <h3 className="text-card-title font-medium text-text-primary mb-1">Queue Completed!</h3>
        <p className="text-secondary text-text-secondary">You are all caught up for today. Log more problems or topics to keep going.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {queueItems.map((item) => {
        const Icon = item.icon
        return (
          <Card key={item.id} className={`border-l-4 ${item.colorClass} transition-transform hover:scale-[1.01]`}>
            <CardContent className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex gap-3">
                <div className="h-9 w-9 rounded-lg bg-surface flex items-center justify-center shrink-0 border border-border-subtle">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-body font-semibold text-text-primary">{item.title}</h4>
                  <p className="text-secondary text-text-secondary mt-0.5">{item.desc}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                {item.url && (
                  <a href={item.url} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" size="sm">Open Link</Button>
                  </a>
                )}
                <button
                  onClick={item.action}
                  className="px-4 py-2 rounded-xl bg-accent text-white font-extrabold text-xs hover:bg-accent-light transition-all flex items-center gap-1.5 shadow-md shadow-accent/20 shrink-0"
                >
                  <span>{item.actionLabel}</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
