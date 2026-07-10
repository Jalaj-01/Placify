import { useState } from 'react'
import { Sparkles, Loader2, Landmark, ListChecks, HeartCrack, Lightbulb, Compass, Award } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import InsightCard from './InsightCard'

export default function InterviewBrief({ applications, topics, onGenerate, loading }) {
  const [selectedAppId, setSelectedAppId] = useState('')
  const [brief, setBrief] = useState(null)
  const [error, setError] = useState('')

  // Filter applications that are in the "Interview Round" stage
  const interviewApps = applications.filter((app) => app.status === 'Interview Round')

  const handleGenerate = async () => {
    if (!selectedAppId) return
    setError('')
    setBrief(null)
    const app = interviewApps.find((a) => a.id === selectedAppId)
    if (!app) return

    // Derive strengths and weaknesses from topics list
    const weakTopics = topics
      .filter((t) => t.confidence === 'Low' || t.status === 'Not Started')
      .map((t) => `${t.subject} - ${t.name}`)
      .slice(0, 15) // limit size

    const strongTopics = topics
      .filter((t) => t.status === 'Done' && t.confidence === 'High')
      .map((t) => `${t.subject} - ${t.name}`)
      .slice(0, 15) // limit size

    try {
      const result = await onGenerate({
        companyName: app.companyName,
        role: app.role,
        weakTopics,
        strongTopics,
      })
      setBrief(result)
    } catch (e) {
      setError(e.message || 'Failed to generate interview brief')
    }
  }

  return (
    <Card className="border border-border-subtle bg-card">
      <CardHeader className="pb-4 border-b border-border-subtle">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-semantic-purple-bg/30">
            <Sparkles className="h-5 w-5 text-semantic-purple" />
          </div>
          <div>
            <CardTitle className="text-card-title font-semibold">Interview Brief Generator</CardTitle>
            <p className="text-secondary text-text-secondary">Get a tailored guide for upcoming company interviews</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6 space-y-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <Select value={selectedAppId} onValueChange={setSelectedAppId}>
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Select an active interview application..." />
            </SelectTrigger>
            <SelectContent>
              {interviewApps.map((app) => (
                <SelectItem key={app.id} value={app.id}>
                  {app.companyName} — {app.role}
                </SelectItem>
              ))}
              {interviewApps.length === 0 && (
                <SelectItem value="none" disabled>
                  No applications in "Interview Round" status
                </SelectItem>
              )}
            </SelectContent>
          </Select>

          <Button
            onClick={handleGenerate}
            disabled={loading || !selectedAppId || selectedAppId === 'none'}
            className="shrink-0 flex items-center gap-1.5"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            Generate Brief
          </Button>
        </div>

        {error && <p className="text-secondary text-semantic-red">{error}</p>}

        {brief && (
          <div className="space-y-6 animate-fade-in border-t border-border-subtle pt-6">
            {/* Overview & Timeline */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InsightCard title="Company Overview" icon={Landmark} variant="default">
                <p>{brief.companyOverview}</p>
              </InsightCard>
              <InsightCard title="Interview Process" icon={Compass} variant="purple">
                <p>{brief.typicalInterviewProcess}</p>
              </InsightCard>
            </div>

            {/* Topics suggestion */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InsightCard title="Review Urgently (Based on your weak areas)" icon={HeartCrack} variant="red">
                <ul className="list-disc list-inside space-y-1.5">
                  {brief.topicsToReview?.map((t, i) => (
                    <li key={i}>{t}</li>
                  ))}
                  {(!brief.topicsToReview || brief.topicsToReview.length === 0) && (
                    <li>No specific review suggestions needed. Nice!</li>
                  )}
                </ul>
              </InsightCard>

              <InsightCard title="Skip (Already strong / Low priority)" icon={Award} variant="green">
                <ul className="list-disc list-inside space-y-1.5">
                  {brief.topicsToAvoid?.map((t, i) => (
                    <li key={i}>{t}</li>
                  ))}
                  {(!brief.topicsToAvoid || brief.topicsToAvoid.length === 0) && (
                    <li>Focus heavily on the review column instead.</li>
                  )}
                </ul>
              </InsightCard>
            </div>

            {/* Quick Tips & Time Estimate */}
            <div className="space-y-4">
              <div className="bg-surface rounded-lg p-5 border border-border-subtle">
                <h5 className="text-body font-semibold text-text-primary mb-2">Preparation Timeline Plan</h5>
                <p className="text-secondary text-text-secondary leading-relaxed">{brief.timeEstimate}</p>
              </div>

              <div className="bg-semantic-yellow-bg/10 rounded-lg p-5 border border-semantic-yellow/30">
                <h5 className="text-body font-semibold text-semantic-yellow flex items-center gap-1.5 mb-3">
                  <Lightbulb className="h-5 w-5" /> Quick Interview Success Tips
                </h5>
                <ul className="space-y-2">
                  {brief.quickTips?.map((tip, i) => (
                    <li key={i} className="text-secondary text-text-secondary flex gap-2 items-start">
                      <ListChecks className="h-4.5 w-4.5 text-semantic-yellow shrink-0 mt-0.5" />
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
