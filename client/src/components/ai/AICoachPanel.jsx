import { Brain, Star, AlertCircle, RefreshCw, ClipboardList, CheckCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'

export default function AICoachPanel({ analysis, onAnalyze, loading }) {
  return (
    <Card className="border border-border-subtle bg-card">
      <CardHeader className="pb-4 border-b border-border-subtle flex flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/15">
            <Brain className="h-5 w-5 text-accent-light" />
          </div>
          <div>
            <CardTitle className="text-card-title font-semibold">AI Pattern Analyzer</CardTitle>
            <p className="text-secondary text-text-secondary">Analyze your logs to target weak areas and schedule study plans</p>
          </div>
        </div>
        <Button onClick={onAnalyze} disabled={loading} className="shrink-0 flex items-center gap-1.5">
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          {analysis ? 'Re-Analyze' : 'Analyze Prep'}
        </Button>
      </CardHeader>

      <CardContent className="p-6">
        {loading ? (
          <div className="space-y-4">
            <div className="h-4 w-3/4 bg-hover rounded animate-pulse" />
            <div className="h-8 w-1/3 bg-hover rounded animate-pulse" />
            <div className="h-20 w-full bg-hover rounded animate-pulse" />
          </div>
        ) : !analysis ? (
          <div className="text-center py-12">
            <Brain className="h-12 w-12 text-text-muted mx-auto mb-4" />
            <h3 className="text-card-title font-medium text-text-primary mb-2">No Analysis Generated Yet</h3>
            <p className="text-secondary text-text-secondary mb-6 max-w-md mx-auto">
              Our AI coach will analyze all your solved problems, topics progress, and active applications to diagnose your current readiness level.
            </p>
            <Button onClick={onAnalyze} className="mx-auto flex items-center gap-2">
              <Brain className="h-4 w-4" /> Run Preparation Diagnostic
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Readiness Meter */}
            <div className="bg-surface rounded-lg p-5 border border-border-subtle flex flex-col md:flex-row items-center gap-6">
              <div className="text-center shrink-0">
                <p className="text-micro text-text-muted uppercase tracking-wider">Overall Readiness</p>
                <h3 className="text-[40px] font-bold text-accent-light leading-none mt-1">
                  {analysis.overallReadiness}%
                </h3>
              </div>
              <div className="flex-1 w-full space-y-2">
                <Progress value={analysis.overallReadiness} />
                <p className="text-secondary text-text-secondary leading-relaxed">
                  <span className="font-semibold text-text-primary">Study Plan Suggestion:</span>{' '}
                  {analysis.studyPlanSuggestion}
                </p>
              </div>
            </div>

            {/* Strengths & Weaknesses */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-semantic-green-bg/20 rounded-lg p-4 border border-semantic-green/20">
                <h4 className="text-secondary font-semibold text-semantic-green flex items-center gap-1.5 mb-3">
                  <Star className="h-4 w-4" /> Strengths
                </h4>
                <ul className="space-y-2">
                  {analysis.strengths?.map((str, idx) => (
                    <li key={idx} className="text-body text-text-primary flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-semantic-green shrink-0 mt-0.5" />
                      {str}
                    </li>
                  ))}
                  {(!analysis.strengths || analysis.strengths.length === 0) && (
                    <li className="text-body text-text-muted italic">No specific strengths detected yet. Keep practicing!</li>
                  )}
                </ul>
              </div>

              <div className="bg-semantic-red-bg/20 rounded-lg p-4 border border-semantic-red/20">
                <h4 className="text-secondary font-semibold text-semantic-red flex items-center gap-1.5 mb-3">
                  <AlertCircle className="h-4 w-4" /> Weak Areas
                </h4>
                <ul className="space-y-2">
                  {analysis.weakAreas?.map((weak, idx) => (
                    <li key={idx} className="text-body text-text-primary flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 text-semantic-red shrink-0 mt-0.5" />
                      {weak}
                    </li>
                  ))}
                  {(!analysis.weakAreas || analysis.weakAreas.length === 0) && (
                    <li className="text-body text-text-muted italic">No critical weak areas detected. Outstanding!</li>
                  )}
                </ul>
              </div>
            </div>

            {/* Priority Actions */}
            <div className="border-t border-border-subtle pt-6">
              <h4 className="text-card-title font-semibold text-text-primary flex items-center gap-2 mb-4">
                <ClipboardList className="h-5 w-5 text-accent-light" /> Priority Actions
              </h4>
              <div className="space-y-3">
                {analysis.priorityActions?.map((action, idx) => (
                  <div key={idx} className="flex gap-3 bg-surface p-3.5 rounded-lg border border-border-subtle">
                    <span className="h-5 w-5 rounded-full bg-accent/15 text-accent-light font-bold text-micro flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <p className="text-body text-text-primary">{action}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
