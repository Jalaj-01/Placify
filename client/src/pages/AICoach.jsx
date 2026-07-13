import { useState } from 'react'
import { Sparkles, Brain, Search, Loader2, ArrowRight, AlertTriangle } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useProblems } from '@/hooks/useProblems'
import { useTopics } from '@/hooks/useTopics'
import { useApplications } from '@/hooks/useApplications'
import { useStreak } from '@/hooks/useStreak'
import { useAICoach } from '@/hooks/useAICoach'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import AICoachPanel from '@/components/ai/AICoachPanel'
import InterviewBrief from '@/components/ai/InterviewBrief'

export default function AICoach() {
  const { user } = useAuth()
  const { problems } = useProblems(user?.uid)
  const { topics } = useTopics(user?.uid)
  const { applications } = useApplications(user?.uid)
  const { streakData } = useStreak(user?.uid)

  const { analysis, loading, error: analysisError, analyze, generateBrief, explainTopic } = useAICoach()

  // Topic Explainer states
  const [explainQuery, setExplainQuery] = useState('')
  const [explaining, setExplaining] = useState(false)
  const [explanation, setExplanation] = useState(null)
  const [explainError, setExplainError] = useState('')

  const handleAnalyze = async () => {
    const payload = {
      problems,
      topics,
      applications,
      streakData,
    }
    await analyze(payload)
  }

  const handleExplain = async () => {
    if (!explainQuery.trim()) return
    setExplaining(true)
    setExplainError('')
    setExplanation(null)
    try {
      const res = await explainTopic(explainQuery.trim())
      setExplanation(res.bullets || [])
    } catch (e) {
      setExplainError(e.message || 'Failed to explain topic')
    } finally {
      setExplaining(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/15">
          <Sparkles className="h-5 w-5 text-accent-light" />
        </div>
        <div>
          <h1 className="text-page font-bold text-text-primary">AI Coach</h1>
          <p className="text-secondary text-text-secondary">Get real-time insights, custom study paths, and mock prep guides</p>
        </div>
      </div>

      {/* Section A: Pattern Analyzer */}
      <AICoachPanel
        analysis={analysis}
        onAnalyze={handleAnalyze}
        loading={loading}
        error={analysisError}
      />

      {/* Section B & C: Side-by-Side Tools Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Section B: Interview Brief Generator */}
        <InterviewBrief
          applications={applications}
          topics={topics}
          onGenerate={generateBrief}
          loading={loading}
        />

        {/* Section C: Topic Explainer */}
        <Card className="border border-border-subtle bg-card">
          <CardHeader className="pb-4 border-b border-border-subtle">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-semantic-green-bg/30">
                <Search className="h-5 w-5 text-semantic-green" />
              </div>
              <div>
                <CardTitle className="text-card-title font-semibold">AI Topic Refresher</CardTitle>
                <p className="text-secondary text-text-secondary">Quickly look up core definitions and cheat-sheets for any concept</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="flex flex-col sm:flex-row gap-3">
              <Input
                placeholder="e.g. LRU Cache, Virtual Memory, ACID Properties..."
                value={explainQuery}
                onChange={(e) => setExplainQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleExplain()}
                className="flex-1"
              />
              <Button
                onClick={handleExplain}
                disabled={explaining || !explainQuery.trim()}
                className="shrink-0 flex items-center gap-1.5"
              >
                {explaining ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                Explain Topic
              </Button>
            </div>

            {explainError && (
              <div className="flex gap-2.5 items-start bg-semantic-red-bg/25 border border-semantic-red/30 p-4 rounded-lg text-semantic-red animate-fade-in text-xs sm:text-sm">
                <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-semibold">AI Assistant Error</p>
                  <p className="opacity-90 leading-relaxed font-mono text-[11px] break-all">{explainError}</p>
                </div>
              </div>
            )}

            {explanation && (
              <div className="bg-surface rounded-lg p-5 border border-border-subtle animate-fade-in space-y-3">
                <h4 className="text-body font-semibold text-text-primary">
                  Review Notes: {explainQuery}
                </h4>
                <ul className="space-y-2">
                  {explanation.map((bullet, idx) => (
                    <li key={idx} className="text-body text-text-secondary flex gap-2.5 items-start">
                      <ArrowRight className="h-4 w-4 text-accent-light shrink-0 mt-1" />
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
