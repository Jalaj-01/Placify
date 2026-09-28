import { BookOpen, AlertTriangle, CheckCircle2, Zap, Clock, HardDrive, HelpCircle } from 'lucide-react'

export default function TheoryLearnPanel({ activeTopic }) {
  const { theory, title, summary, priority, difficulty } = activeTopic

  return (
    <div className="space-y-6 text-text-primary p-4">
      {/* Title & Badge */}
      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-full bg-accent/15 text-accent-light text-xs font-bold font-mono">
            Topic #{activeTopic.topicNumber}
          </span>
          <span className="px-2.5 py-0.5 rounded-full bg-surface border border-border-subtle text-text-secondary text-xs font-semibold">
            {activeTopic.category}
          </span>
          <span
            className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
              priority === 'Critical'
                ? 'bg-semantic-red/15 text-semantic-red border border-semantic-red/25'
                : 'bg-amber-500/15 text-amber-400 border border-amber-500/25'
            }`}
          >
            ★ {priority} Priority
          </span>
          <span
            className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
              difficulty === 'Easy'
                ? 'bg-semantic-green/15 text-semantic-green'
                : difficulty === 'Medium'
                ? 'bg-amber-500/15 text-amber-400'
                : 'bg-semantic-red/15 text-semantic-red'
            }`}
          >
            {difficulty}
          </span>
        </div>
        <h2 className="text-xl sm:text-2xl font-black tracking-tight">{title}</h2>
        <p className="text-secondary text-text-secondary leading-relaxed">{summary}</p>
      </div>

      {/* Asymptotic Complexity Matrix Card */}
      <div className="bg-surface rounded-2xl border border-border-subtle p-4 shadow-sm space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-text-primary">
          <Clock className="w-4 h-4 text-accent" />
          <span>Complexity & Performance Profile</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="p-3 rounded-xl bg-card border border-border-subtle">
            <div className="flex items-center justify-between">
              <span className="text-xs text-text-muted">Time Complexity</span>
              <Clock className="w-3.5 h-3.5 text-accent" />
            </div>
            <p className="text-sm font-mono font-bold text-accent-light mt-1">
              {theory?.complexity?.time || 'O(N)'}
            </p>
          </div>

          <div className="p-3 rounded-xl bg-card border border-border-subtle">
            <div className="flex items-center justify-between">
              <span className="text-xs text-text-muted">Space Complexity</span>
              <HardDrive className="w-3.5 h-3.5 text-accent" />
            </div>
            <p className="text-sm font-mono font-bold text-accent-light mt-1">
              {theory?.complexity?.space || 'O(1)'}
            </p>
          </div>

          {theory?.complexity?.auxiliary && (
            <div className="p-3 rounded-xl bg-card border border-border-subtle sm:col-span-2">
              <span className="text-xs text-text-muted">Auxiliary & In-place Note</span>
              <p className="text-xs font-medium text-text-secondary mt-1">
                {theory.complexity.auxiliary}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Why Brute Force Fails Card */}
      {theory?.whyBruteForceFails && (
        <div className="bg-semantic-red/10 border border-semantic-red/25 rounded-2xl p-4 space-y-2">
          <div className="flex items-center gap-2 text-semantic-red font-bold text-xs uppercase tracking-wider">
            <AlertTriangle className="w-4 h-4" />
            <span>Why Brute Force Fails (Interview Trap)</span>
          </div>
          <p className="text-xs text-text-primary leading-relaxed">
            {theory.whyBruteForceFails}
          </p>
        </div>
      )}

      {/* Algorithmic Overview & Intuition */}
      <div className="bg-surface rounded-2xl border border-border-subtle p-4 shadow-sm space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-text-primary">
          <Zap className="w-4 h-4 text-yellow-400" />
          <span>Core Intuition & Mental Model</span>
        </div>
        <p className="text-sm text-text-secondary leading-relaxed">
          {theory?.overview}
        </p>

        {/* Key Patterns & Signatures */}
        {theory?.keyPatterns && (
          <div className="pt-2 border-t border-border-subtle/60">
            <span className="text-xs font-bold text-text-primary mb-2 block">
              Interview Recognition Cues:
            </span>
            <div className="flex flex-wrap gap-2">
              {theory.keyPatterns.map((pattern, idx) => (
                <span
                  key={idx}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-hover border border-border-subtle text-xs font-medium text-text-secondary"
                >
                  <CheckCircle2 className="w-3 h-3 text-semantic-green" />
                  {pattern}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
