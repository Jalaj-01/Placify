import { useState, useEffect } from 'react'
import {
  BookOpenCheck, FileText, Award, Bookmark, Plus, ExternalLink,
  CheckCircle, Clock, Sparkles, FolderGit2, AlertCircle, Trash2, Edit3, X, Check
} from 'lucide-react'
import StatsCard from '@/components/dashboard/StatsCard'
import { useAppStore } from '@/store/useAppStore'

export default function PhdDashboard({ user, profile }) {
  const { openAICoach } = useAppStore()

  // Persistent papers state
  const [papers, setPapers] = useState(() => {
    const saved = localStorage.getItem(`placify_phd_papers_${user?.uid || 'guest'}`)
    return saved ? JSON.parse(saved) : [
      {
        id: '1',
        title: 'Scalable Distributed Graph Partitioning using Reinforcement Learning',
        journal: 'IEEE Transactions on Parallel and Distributed Systems (TPDS)',
        status: 'Under Peer Review',
        impactFactor: '4.8',
        submittedDate: 'May 12, 2026',
        coAuthors: 'Dr. V. K. Sharma, Prof. A. Roy'
      },
      {
        id: '2',
        title: 'Automated Fault Tolerance in Cloud Microservices via eBPF Telemetry',
        journal: 'ACM SIGCOMM 2026 Conference',
        status: 'Drafting',
        impactFactor: 'Core A*',
        submittedDate: 'Target: Sept 2026',
        coAuthors: 'Dr. V. K. Sharma'
      },
      {
        id: '3',
        title: 'A Survey on Deep Learning Methods for High-Throughput Genomic Sequencing',
        journal: 'Bioinformatics (Oxford Academic)',
        status: 'Published',
        impactFactor: '5.8',
        submittedDate: 'Jan 2026',
        coAuthors: 'Dr. V. K. Sharma, Dr. S. Rao'
      }
    ]
  })

  // Add Paper Modal State
  const [showAddPaperModal, setShowAddPaperModal] = useState(false)
  const [editingPaperId, setEditingPaperId] = useState(null)
  const [paperForm, setPaperForm] = useState({
    title: '',
    journal: '',
    status: 'Drafting',
    impactFactor: '3.5',
    submittedDate: '',
    coAuthors: ''
  })

  // Save papers to localStorage on update
  useEffect(() => {
    if (user?.uid) {
      localStorage.setItem(`placify_phd_papers_${user.uid}`, JSON.stringify(papers))
    }
  }, [papers, user?.uid])

  const handleOpenAddModal = (paperToEdit = null) => {
    if (paperToEdit) {
      setEditingPaperId(paperToEdit.id)
      setPaperForm({ ...paperToEdit })
    } else {
      setEditingPaperId(null)
      setPaperForm({
        title: '',
        journal: '',
        status: 'Drafting',
        impactFactor: '3.5',
        submittedDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        coAuthors: profile?.displayName || user?.displayName || 'Self'
      })
    }
    setShowAddPaperModal(true)
  }

  const handleSavePaper = (e) => {
    e.preventDefault()
    if (!paperForm.title.trim()) return

    if (editingPaperId) {
      setPapers((prev) => prev.map((p) => (p.id === editingPaperId ? { ...paperForm, id: editingPaperId } : p)))
    } else {
      const newPaper = {
        ...paperForm,
        id: String(Date.now())
      }
      setPapers((prev) => [newPaper, ...prev])
    }

    setShowAddPaperModal(false)
  }

  const handleDeletePaper = (id) => {
    setPapers((prev) => prev.filter((p) => p.id !== id))
  }

  // Thesis Milestones State
  const [thesisMilestones, setThesisMilestones] = useState([
    { title: 'Literature Review & Problem Formulation', status: 'Completed', pct: 100 },
    { title: 'Comprehensive Viva & Proposal Defense', status: 'Completed', pct: 100 },
    { title: 'Core Methodology & System Architecture', status: 'Completed', pct: 100 },
    { title: 'Experimental Evaluation & Benchmark Runs', status: 'In Progress', pct: 65 },
    { title: 'Final Thesis Writing & Defense', status: 'Upcoming', pct: 20 }
  ])

  // Grant Applications
  const [grants, setGrants] = useState([
    { title: 'SERB Core Research Grant (CRG-2026)', amount: '₹35,00,000', status: 'Submitted', deadline: 'Aug 30, 2026' },
    { title: 'DST-FIST Research Scholar Travel Fellowship', amount: '₹1,50,000', status: 'Approved', deadline: 'Completed' }
  ])

  const publishedCount = papers.filter((p) => p.status === 'Published').length
  const reviewCount = papers.filter((p) => p.status === 'Under Peer Review').length

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

        <button
          onClick={() => handleOpenAddModal()}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-semantic-green to-emerald-600 text-white text-xs font-semibold hover:opacity-95 transition-all shadow-lg shadow-semantic-green/25 flex items-center justify-center gap-2 shrink-0 border border-semantic-green/40"
        >
          <Plus className="h-4 w-4" />
          <span>Add Research Paper</span>
        </button>
      </div>

      {/* Prominent AI Research Assistant Widget */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-accent/20 via-surface/60 to-semantic-purple/20 border border-accent/30 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/20 text-accent">
            <Sparkles className="h-5 w-5 text-accent-light animate-pulse" />
          </div>
          <div>
            <h3 className="font-bold text-text-primary text-sm">AI Research & Literature Assistant</h3>
            <p className="text-xs text-text-muted">Ask AI to summarize IEEE/ACM paper abstracts, generate latex citations, or outline literature reviews.</p>
          </div>
        </div>
        <button
          onClick={openAICoach}
          className="px-4 py-2 rounded-xl bg-accent text-white font-semibold text-xs hover:bg-accent-light transition-colors flex items-center justify-center gap-2 shrink-0 shadow-md shadow-accent/20"
        >
          <Sparkles className="h-3.5 w-3.5" />
          <span>Ask AI Assistant</span>
        </button>
      </div>

      {/* PhD Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Papers Published"
          value={`${publishedCount} Papers`}
          icon={FileText}
          description="IEEE & ACM journals"
        />
        <StatsCard
          title="Under Peer Review"
          value={`${reviewCount} Papers`}
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
          <button
            onClick={() => handleOpenAddModal()}
            className="text-xs text-semantic-green hover:underline font-semibold flex items-center gap-1"
          >
            <Plus className="h-3.5 w-3.5" /> Add New Entry
          </button>
        </div>

        <div className="space-y-3">
          {papers.length === 0 ? (
            <div className="p-8 text-center rounded-2xl bg-surface/30 border border-white/5 space-y-2">
              <p className="text-sm text-text-muted">No research papers added yet.</p>
              <button
                onClick={() => handleOpenAddModal()}
                className="text-xs text-semantic-green font-semibold hover:underline"
              >
                + Add your first publication or manuscript draft
              </button>
            </div>
          ) : (
            papers.map((p) => (
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

                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-xs text-text-muted">{p.submittedDate}</span>
                  <button
                    onClick={() => handleOpenAddModal(p)}
                    className="p-1.5 rounded-lg border border-white/10 text-text-muted hover:text-white hover:bg-white/10"
                    title="Edit Paper"
                  >
                    <Edit3 className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeletePaper(p.id)}
                    className="p-1.5 rounded-lg border border-white/10 text-text-muted hover:text-semantic-red hover:bg-semantic-red/10"
                    title="Delete Paper"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
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

      {/* Add / Edit Research Paper Modal */}
      {showAddPaperModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200 overflow-y-auto">
          <div className="w-full max-w-lg rounded-2xl bg-[#0c0d14] border border-white/10 p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="font-bold text-text-primary text-base">
                {editingPaperId ? 'Edit Research Paper' : 'Add Research Paper / Manuscript'}
              </h3>
              <button onClick={() => setShowAddPaperModal(false)} className="text-text-muted hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSavePaper} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs text-text-secondary block">Paper Title *</label>
                <input
                  type="text"
                  required
                  placeholder="Enter full title of research paper..."
                  value={paperForm.title}
                  onChange={(e) => setPaperForm({ ...paperForm, title: e.target.value })}
                  className="w-full bg-base border border-white/15 rounded-lg px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-semantic-green"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs text-text-secondary block">Target Journal / Conference</label>
                  <input
                    type="text"
                    placeholder="e.g. IEEE TPDS"
                    value={paperForm.journal}
                    onChange={(e) => setPaperForm({ ...paperForm, journal: e.target.value })}
                    className="w-full bg-base border border-white/15 rounded-lg px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-semantic-green"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-text-secondary block">Status</label>
                  <select
                    value={paperForm.status}
                    onChange={(e) => setPaperForm({ ...paperForm, status: e.target.value })}
                    className="w-full bg-base border border-white/15 rounded-lg px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-semantic-green"
                  >
                    <option value="Drafting">Drafting</option>
                    <option value="Under Peer Review">Under Peer Review</option>
                    <option value="Revision Requested">Revision Requested</option>
                    <option value="Accepted">Accepted</option>
                    <option value="Published">Published</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs text-text-secondary block">Impact Factor / Rank</label>
                  <input
                    type="text"
                    placeholder="e.g. 4.8 or Core A*"
                    value={paperForm.impactFactor}
                    onChange={(e) => setPaperForm({ ...paperForm, impactFactor: e.target.value })}
                    className="w-full bg-base border border-white/15 rounded-lg px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-semantic-green"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-text-secondary block">Submission / Target Date</label>
                  <input
                    type="text"
                    placeholder="e.g. Aug 2026"
                    value={paperForm.submittedDate}
                    onChange={(e) => setPaperForm({ ...paperForm, submittedDate: e.target.value })}
                    className="w-full bg-base border border-white/15 rounded-lg px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-semantic-green"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-text-secondary block">Co-Authors</label>
                <input
                  type="text"
                  placeholder="e.g. Prof. V. K. Sharma, Dr. A. Roy"
                  value={paperForm.coAuthors}
                  onChange={(e) => setPaperForm({ ...paperForm, coAuthors: e.target.value })}
                  className="w-full bg-base border border-white/15 rounded-lg px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-semantic-green"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-semantic-green text-white font-semibold text-xs hover:bg-emerald-600 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-semantic-green/20"
              >
                <Check className="h-4 w-4" />
                <span>Save Research Paper</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
