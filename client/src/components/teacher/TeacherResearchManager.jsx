import { useState, useEffect } from 'react'
import {
  GraduationCap, Users, Plus, CheckCircle2, Clock, FileText,
  Check, X, Sparkles, ChevronRight, MessageSquare, ExternalLink,
  Kanban, Award, ShieldCheck
} from 'lucide-react'
import {
  subscribeCourseResearchProjects, createResearchProject, updateResearchProject
} from '@/services/teacherService'
import { cn } from '@/lib/utils'

const MILESTONES = [
  'LITERATURE_REVIEW',
  'METHODOLOGY',
  'DATA_COLLECTION',
  'IMPLEMENTATION',
  'REPORT_DRAFTING',
  'APPROVED'
]

const MILESTONE_LABELS = {
  LITERATURE_REVIEW: 'Literature Review',
  METHODOLOGY: 'Methodology & Design',
  DATA_COLLECTION: 'Data Collection & Prep',
  IMPLEMENTATION: 'Model / Code Build',
  REPORT_DRAFTING: 'Paper / Report Draft',
  APPROVED: 'Approved & Published'
}

export default function TeacherResearchManager({ user, course }) {
  const [projects, setProjects] = useState([])
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedProject, setSelectedProject] = useState(null)

  const [form, setForm] = useState({
    title: '',
    domain: 'Computer Vision & Deep Learning',
    abstract: '',
    teamLeadName: '',
    teamLeadRoll: '',
    memberNames: ''
  })

  useEffect(() => {
    if (!course?.id) return
    const unsub = subscribeCourseResearchProjects(course.id, (data) => {
      setProjects(data)
    })
    return unsub
  }, [course?.id])

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!form.title.trim()) return

    const members = form.memberNames
      ? form.memberNames.split(',').map(m => ({ name: m.trim(), role: 'Researcher' }))
      : []

    try {
      await createResearchProject(course.id, {
        title: form.title,
        domain: form.domain,
        abstract: form.abstract,
        teamLead: { name: form.teamLeadName || 'Lead Student', rollNumber: form.teamLeadRoll },
        members,
        currentMilestone: 'LITERATURE_REVIEW',
        milestones: MILESTONES.map(m => ({
          column: m,
          title: MILESTONE_LABELS[m],
          isApproved: false,
          approvedAt: null
        }))
      })
      setShowCreateModal(false)
      setForm({
        title: '',
        domain: 'Computer Vision & Deep Learning',
        abstract: '',
        teamLeadName: '',
        teamLeadRoll: '',
        memberNames: ''
      })
    } catch (err) {
      alert('Error creating research project: ' + err.message)
    }
  }

  const handleAdvanceMilestone = async (project, nextCol) => {
    try {
      const updatedMilestones = (project.milestones || []).map(m => {
        if (m.column === project.currentMilestone) {
          return { ...m, isApproved: true, approvedAt: new Date().toISOString() }
        }
        return m
      })

      await updateResearchProject(course.id, project.id, {
        currentMilestone: nextCol,
        milestones: updatedMilestones
      })
    } catch (err) {
      alert('Error advancing milestone: ' + err.message)
    }
  }

  return (
    <div className="space-y-4">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-card border border-border-subtle shadow-sm">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-accent/20 text-accent flex items-center justify-center font-bold">
            <GraduationCap className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-text-primary">Research Project Manager & Milestone Review</h2>
            <p className="text-xs text-text-muted">Kanban phase approval, student team rosters, and document sign-offs.</p>
          </div>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-3.5 py-2 rounded-xl bg-accent hover:bg-accent-light text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-accent/20 transition-all shrink-0"
        >
          <Plus className="h-4 w-4" />
          <span>New Research Group</span>
        </button>
      </div>

      {/* Kanban Board of Research Milestones */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
        {MILESTONES.map((col) => {
          const colProjects = projects.filter(p => (p.currentMilestone || 'LITERATURE_REVIEW') === col)
          return (
            <div key={col} className="rounded-2xl border border-border-subtle bg-surface/70 flex flex-col overflow-hidden shadow-sm">
              <div className="p-3 bg-card border-b border-border-subtle flex items-center justify-between">
                <span className="font-bold text-xs text-text-primary truncate">{MILESTONE_LABELS[col]}</span>
                <span className="text-[10px] font-mono font-bold bg-base px-2 py-0.5 rounded-full border border-border-subtle text-text-muted">
                  {colProjects.length}
                </span>
              </div>

              <div className="p-2 space-y-2 flex-1 min-h-[220px]">
                {colProjects.length === 0 ? (
                  <div className="p-4 text-center text-[10px] text-text-muted border border-dashed border-border-subtle rounded-xl bg-card/40">
                    No groups in this phase
                  </div>
                ) : (
                  colProjects.map((proj) => (
                    <div
                      key={proj.id}
                      onClick={() => setSelectedProject(proj)}
                      className="p-3 rounded-xl bg-card border border-border-subtle hover:border-accent/40 transition-all space-y-2 shadow-xs cursor-pointer group"
                    >
                      <span className="px-1.5 py-0.2 rounded bg-accent/15 text-accent text-[9px] font-mono font-bold">
                        {proj.domain}
                      </span>
                      <h4 className="font-bold text-xs text-text-primary group-hover:text-accent transition-colors line-clamp-2">
                        {proj.title}
                      </h4>
                      <p className="text-[11px] text-text-muted font-medium">
                        Lead: {proj.teamLead?.name || 'Lead Student'}
                      </p>

                      {/* Advance Stage Button for Teacher */}
                      {col !== 'APPROVED' && (
                        <div className="pt-2 border-t border-border-subtle flex justify-end">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              const nextIdx = MILESTONES.indexOf(col) + 1
                              if (nextIdx < MILESTONES.length) {
                                handleAdvanceMilestone(proj, MILESTONES[nextIdx])
                              }
                            }}
                            className="px-2 py-1 rounded-lg bg-accent/20 hover:bg-accent text-accent hover:text-white text-[10px] font-bold flex items-center gap-1 transition-colors"
                          >
                            <span>Approve & Advance</span>
                            <ChevronRight className="h-3 w-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Create Research Group Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-lg bg-card border border-border-subtle rounded-3xl p-6 shadow-2xl space-y-4 text-text-primary">
            <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
              <h3 className="font-bold text-base text-text-primary flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-accent" />
                Register Research Project Group
              </h3>
              <button onClick={() => setShowCreateModal(false)} className="text-text-muted hover:text-text-primary">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="text-text-secondary font-bold block">Project Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Distributed Consensus in Edge Computing"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full bg-base border border-border-subtle rounded-xl px-3.5 py-2 text-text-primary focus:outline-none focus:border-accent"
                />
              </div>

              <div className="space-y-1">
                <label className="text-text-secondary font-bold block">Research Domain</label>
                <input
                  type="text"
                  value={form.domain}
                  onChange={(e) => setForm({ ...form, domain: e.target.value })}
                  className="w-full bg-base border border-border-subtle rounded-xl px-3 py-2 text-text-primary focus:outline-none focus:border-accent"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-text-secondary font-bold block">Team Lead Name</label>
                  <input
                    type="text"
                    placeholder="Aditi Sharma"
                    value={form.teamLeadName}
                    onChange={(e) => setForm({ ...form, teamLeadName: e.target.value })}
                    className="w-full bg-base border border-border-subtle rounded-xl px-3 py-2 text-text-primary focus:outline-none focus:border-accent"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-text-secondary font-bold block">Lead Roll Number</label>
                  <input
                    type="text"
                    placeholder="22CS108"
                    value={form.teamLeadRoll}
                    onChange={(e) => setForm({ ...form, teamLeadRoll: e.target.value })}
                    className="w-full bg-base border border-border-subtle rounded-xl px-3 py-2 text-text-primary focus:outline-none focus:border-accent"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-text-secondary font-bold block">Co-Researchers (Comma separated)</label>
                <input
                  type="text"
                  placeholder="Rohan Gupta, Sneha Patel, Kunal Ray"
                  value={form.memberNames}
                  onChange={(e) => setForm({ ...form, memberNames: e.target.value })}
                  className="w-full bg-base border border-border-subtle rounded-xl px-3 py-2 text-text-primary focus:outline-none focus:border-accent"
                />
              </div>

              <div className="space-y-1">
                <label className="text-text-secondary font-bold block">Project Abstract</label>
                <textarea
                  rows={3}
                  placeholder="Brief synopsis of methodology and goals..."
                  value={form.abstract}
                  onChange={(e) => setForm({ ...form, abstract: e.target.value })}
                  className="w-full bg-base border border-border-subtle rounded-xl p-3 text-text-primary focus:outline-none focus:border-accent resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl text-text-secondary hover:text-text-primary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-accent hover:bg-accent-light text-white font-bold shadow-lg shadow-accent/25"
                >
                  Register Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
