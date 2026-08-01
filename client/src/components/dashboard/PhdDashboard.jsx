import { useState } from 'react'
import {
  BookOpenCheck, FileText, Award, Bookmark, Plus, ExternalLink,
  CheckCircle, Clock, Sparkles, FolderGit2, AlertCircle
} from 'lucide-react'
import StatsCard from '@/components/dashboard/StatsCard'

export default function PhdDashboard({ user, profile }) {
  const [papers, setPapers] = useState([
    {
      id: 1,
      title: 'Scalable Distributed Graph Partitioning using Reinforcement Learning',
      journal: 'IEEE Transactions on Parallel and Distributed Systems (TPDS)',
      status: 'Under Peer Review',
      impactFactor: '4.8',
      submittedDate: 'May 12, 2026',
      coAuthors: 'Dr. V. K. Sharma, Prof. A. Roy'
    },
    {
      id: 2,
      title: 'Automated Fault Tolerance in Cloud Microservices via eBPF Telemetry',
      journal: 'ACM SIGCOMM 2026 Conference',
      status: 'Drafting',
      impactFactor: 'Core A*',
      submittedDate: 'Target: Sept 2026',
      coAuthors: 'Dr. V. K. Sharma'
    },
    {
      id: 3,
      title: 'A Survey on Deep Learning Methods for High-Throughput Genomic Sequencing',
      journal: 'Bioinformatics (Oxford Academic)',
      status: 'Published',
      impactFactor: '5.8',
      submittedDate: 'Jan 2026',
      coAuthors: 'Dr. V. K. Sharma, Dr. S. Rao'
    }
  ])

  // Thesis Milestones
  const thesisMilestones = [
    { title: 'Literature Review & Problem Formulation', status: 'Completed', pct: 100 },
    { title: 'Comprehensive Viva & Proposal Defense', status: 'Completed', pct: 100 },
    { title: 'Core Methodology & System Architecture', status: 'Completed', pct: 100 },
    { title: 'Experimental Evaluation & Benchmark Runs', status: 'In Progress', pct: 65 },
    { title: 'Final Thesis Writing & Defense', status: 'Upcoming', pct: 20 }
  ]

  // Grant Applications
  const grants = [
    { title: 'SERB Core Research Grant (CRG-2026)', amount: '₹35,00,000', status: 'Submitted', deadline: 'Aug 30, 2026' },
    { title: 'DST-FIST Research Scholar Travel Fellowship', amount: '₹1,50,000', status: 'Approved', deadline: 'Completed' }
  ]

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* PhD Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-semantic-green/15 via-surface/60 to-surface/40 border border-white/10 shadow-lg">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-semantic-green/20 text-semantic-green border border-semantic-green/30 shadow-inner">
            <BookOpenCheck className="h-6 w-6 text-semantic-green-light" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-text-primary">
                {profile?.displayName || user?.displayName || 'Research Scholar'}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-semantic-green/20 text-semantic-green text-xs font-semibold border border-semantic-green/30">
                🔬 PhD Scholar
              </span>
            </div>
            <p className="text-xs text-text-muted mt-0.5">
              Department of Computer Science • Advisor: Prof. V. K. Sharma
            </p>
          </div>
        </div>

        <button className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-semantic-green to-emerald-600 text-white text-xs font-semibold hover:opacity-95 transition-all shadow-lg shadow-semantic-green/25 flex items-center justify-center gap-2 shrink-0 border border-semantic-green/40">
          <Plus className="h-4 w-4" />
          <span>Add Research Paper</span>
        </button>
      </div>

      {/* PhD Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Papers Published"
          value="3 Papers"
          icon={FileText}
          description="IEEE & ACM journals"
        />
        <StatsCard
          title="Under Peer Review"
          value="1 Paper"
          icon={Clock}
          description="IEEE TPDS Journal"
        />
        <StatsCard
          title="Thesis Completion"
          value="77%"
          icon={Award}
          description="Milestones 3/5 completed"
        />
        <StatsCard
          title="Active Grants"
          value="₹36.5 Lakhs"
          icon={FolderGit2}
          description="Approved & pending grants"
        />
      </div>

      {/* Section 1: Research & Publication Pipeline */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-section font-semibold text-text-primary flex items-center gap-2">
            <FileText className="h-4 w-4 text-semantic-green" />
            Publication & Manuscript Pipeline
          </h2>
          <span className="text-xs text-text-muted">Journal & Conference Tracker</span>
        </div>

        <div className="space-y-3">
          {papers.map((p) => (
            <div
              key={p.id}
              className="p-5 rounded-2xl bg-surface/40 border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all hover:bg-surface/70"
            >
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                      p.status === 'Published'
                        ? 'bg-semantic-green/15 text-semantic-green border-semantic-green/30'
                        : p.status === 'Under Peer Review'
                        ? 'bg-accent/15 text-accent border-accent/30'
                        : 'bg-yellow-500/15 text-yellow-300 border-yellow-500/30'
                    }`}
                  >
                    {p.status}
                  </span>
                  <span className="text-xs text-text-muted">IF: {p.impactFactor}</span>
                </div>
                <h3 className="font-semibold text-text-primary text-sm">{p.title}</h3>
                <p className="text-xs text-text-muted">
                  Target: <span className="text-text-secondary font-medium">{p.journal}</span> • Authors: {p.coAuthors}
                </p>
              </div>

              <div className="text-right shrink-0 space-y-1">
                <span className="text-xs text-text-muted block">{p.submittedDate}</span>
                <button className="text-xs text-semantic-green hover:underline flex items-center gap-1 font-medium ml-auto">
                  View Manuscript <ExternalLink className="h-3 w-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Section 2: Thesis Milestones & Grant Applications */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Thesis Progress */}
        <div className="lg:col-span-7 space-y-4">
          <h2 className="text-section font-semibold text-text-primary flex items-center gap-2">
            <Award className="h-4 w-4 text-accent" />
            Thesis / Dissertation Milestones
          </h2>

          <div className="p-5 rounded-2xl bg-surface/40 border border-white/10 space-y-4">
            {thesisMilestones.map((m, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-text-primary">{m.title}</span>
                  <span
                    className={`font-mono text-[11px] ${
                      m.pct === 100 ? 'text-semantic-green' : 'text-accent'
                    }`}
                  >
                    {m.pct}% ({m.status})
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-base overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      m.pct === 100 ? 'bg-semantic-green' : 'bg-accent'
                    }`}
                    style={{ width: `${m.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Research Grants */}
        <div className="lg:col-span-5 space-y-4">
          <h2 className="text-section font-semibold text-text-primary flex items-center gap-2">
            <FolderGit2 className="h-4 w-4 text-semantic-green" />
            Grants & Research Funding
          </h2>

          <div className="space-y-3">
            {grants.map((g, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-surface/40 border border-white/10 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-text-primary text-xs truncate max-w-[220px]">{g.title}</h4>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      g.status === 'Approved'
                        ? 'bg-semantic-green/15 text-semantic-green'
                        : 'bg-accent/15 text-accent'
                    }`}
                  >
                    {g.status}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-semantic-green font-bold">{g.amount}</span>
                  <span className="text-text-muted text-[11px]">Deadline: {g.deadline}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
