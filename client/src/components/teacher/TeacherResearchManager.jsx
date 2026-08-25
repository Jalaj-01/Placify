import { useState, useEffect } from 'react'
import {
  GraduationCap, Users, Plus, CheckCircle2, Clock, FileText,
  Check, X, Sparkles, ChevronRight, ChevronLeft, MessageSquare, ExternalLink,
  Kanban, Award, ShieldCheck, Edit3, Trash2, ArrowLeft, ArrowRight,
  RotateCcw, Info
} from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { useToast } from '@/components/ui/toast'
import {
  subscribeCourseResearchProjects, createResearchProject, updateResearchProject, deleteResearchProject
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
  const { success, error: toastError, confirm } = useToast()
  const [projects, setProjects] = useState([])
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingProject, setEditingProject] = useState(null)
  const [selectedProject, setSelectedProject] = useState(null)

  const [form, setForm] = useState({
    title: '',
    domain: 'Computer Vision & Deep Learning',
    abstract: '',
    teamLeadName: '',
    teamLeadRoll: '',
    memberNames: '',
    currentMilestone: 'LITERATURE_REVIEW'
  })

  useEffect(() => {
    if (!course?.id) return
    const unsub = subscribeCourseResearchProjects(course.id, (data) => {
      setProjects(data)
      // Keep selected project in sync
      if (selectedProject) {
        const updated = data.find(p => p.id === selectedProject.id)
        if (updated) setSelectedProject(updated)
      }
    })
    return unsub
  }, [course?.id, selectedProject?.id])

  const handleOpenCreate = () => {
    setEditingProject(null)
    setForm({
      title: '',
      domain: 'Computer Vision & Deep Learning',
      abstract: '',
      teamLeadName: '',
      teamLeadRoll: '',
      memberNames: '',
      currentMilestone: 'LITERATURE_REVIEW'
    })
    setShowCreateModal(true)
  }

  const handleOpenEdit = (proj, e) => {
    if (e) e.stopPropagation()
    setEditingProject(proj)
    setForm({
      title: proj.title || '',
      domain: proj.domain || 'Computer Vision & Deep Learning',
      abstract: proj.abstract || '',
      teamLeadName: proj.teamLead?.name || '',
      teamLeadRoll: proj.teamLead?.rollNumber || '',
      memberNames: (proj.members || []).map(m => m.name).join(', '),
      currentMilestone: proj.currentMilestone || 'LITERATURE_REVIEW'
    })
    setShowCreateModal(true)
  }

  const handleSaveProject = async (e) => {
    e.preventDefault()
    if (!form.title.trim()) return

    const members = form.memberNames
      ? form.memberNames.split(',').map(m => ({ name: m.trim(), role: 'Researcher' }))
      : []

    try {
      if (editingProject) {
        await updateResearchProject(course.id, editingProject.id, {
          title: form.title,
          domain: form.domain,
          abstract: form.abstract,
          teamLead: { name: form.teamLeadName || 'Lead Student', rollNumber: form.teamLeadRoll },
          members,
          currentMilestone: form.currentMilestone
        })
        success('Project Updated', `Changes to "${form.title}" saved.`)
      } else {
        await createResearchProject(course.id, {
          title: form.title,
          domain: form.domain,
          abstract: form.abstract,
          teamLead: { name: form.teamLeadName || 'Lead Student', rollNumber: form.teamLeadRoll },
          members,
          currentMilestone: form.currentMilestone || 'LITERATURE_REVIEW',
          milestones: MILESTONES.map(m => ({
            column: m,
            title: MILESTONE_LABELS[m],
            isApproved: false,
            approvedAt: null
          }))
        })
        success('Project Registered', `New research group created.`)
      }
      setShowCreateModal(false)
      setEditingProject(null)
    } catch (err) {
      toastError('Error saving project', err.message)
    }
  }

  const handleDeleteProject = async (proj, e) => {
    if (e) e.stopPropagation()
    const ok = await confirm(`Permanently delete research project "${proj.title}"?`, {
      title: 'Delete Research Project?',
      confirmLabel: 'Delete',
      destructive: true
    })
    if (!ok) return

    try {
      await deleteResearchProject(course.id, proj.id)
      if (selectedProject?.id === proj.id) setSelectedProject(null)
      success('Project Deleted', 'The research project has been removed.')
    } catch (err) {
      toastError('Error deleting project', err.message)
    }
  }

  // Change project to a specific milestone (forward or backward)
  const handleChangeMilestone = async (project, targetMilestone, e) => {
    if (e) e.stopPropagation()
    if (project.currentMilestone === targetMilestone) return

    const currentIndex = MILESTONES.indexOf(project.currentMilestone)
    const targetIndex = MILESTONES.indexOf(targetMilestone)
    const isMovingForward = targetIndex > currentIndex

    try {
      const updatedMilestones = (project.milestones || MILESTONES.map(m => ({ column: m, title: MILESTONE_LABELS[m], isApproved: false }))).map((m) => {
        const mIdx = MILESTONES.indexOf(m.column)
        if (mIdx < targetIndex) {
          return { ...m, isApproved: true, approvedAt: m.approvedAt || new Date().toISOString() }
        } else if (mIdx === targetIndex && targetMilestone === 'APPROVED') {
          return { ...m, isApproved: true, approvedAt: new Date().toISOString() }
        } else if (mIdx >= targetIndex) {
          return { ...m, isApproved: false, approvedAt: null }
        }
        return m
      })

      await updateResearchProject(course.id, project.id, {
        currentMilestone: targetMilestone,
        milestones: updatedMilestones
      })

      if (isMovingForward) {
        success('Phase Advanced', `Moved to ${MILESTONE_LABELS[targetMilestone]}`)
      } else {
        success('Phase Reverted', `Moved back to ${MILESTONE_LABELS[targetMilestone]}`)
      }
    } catch (err) {
      toastError('Error updating phase', err.message)
    }
  }

  return (
    <div className="space-y-4">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-card border border-border-subtle shadow-sm">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-accent/20 text-accent flex items-center justify-center font-bold shadow-inner">
            <GraduationCap className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-text-primary">Research Project Manager & Milestone Review</h2>
            <p className="text-xs text-text-muted">Kanban phase transitions (forward & backward), student team rosters, and phase review.</p>
          </div>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-3.5 py-2 rounded-xl bg-accent hover:bg-accent-light text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-accent/20 transition-all shrink-0 cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>New Research Group</span>
        </button>
      </div>

      {/* Kanban Board of Research Milestones */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
        {MILESTONES.map((col, colIdx) => {
          const colProjects = projects.filter(p => (p.currentMilestone || 'LITERATURE_REVIEW') === col)
          const isFirstCol = colIdx === 0
          const isLastCol = colIdx === MILESTONES.length - 1

          return (
            <div key={col} className="rounded-2xl border border-border-subtle bg-surface/70 flex flex-col overflow-hidden shadow-sm">
              <div className="p-3 bg-card border-b border-border-subtle flex items-center justify-between">
                <span className="font-bold text-xs text-text-primary truncate">{MILESTONE_LABELS[col]}</span>
                <span className="text-[10px] font-mono font-bold bg-base px-2 py-0.5 rounded-full border border-border-subtle text-text-muted">
                  {colProjects.length}
                </span>
              </div>

              <div className="p-2 space-y-2.5 flex-1 min-h-[220px]">
                {colProjects.length === 0 ? (
                  <div className="p-4 text-center text-[10px] text-text-muted border border-dashed border-border-subtle rounded-xl bg-card/40">
                    No groups in this phase
                  </div>
                ) : (
                  colProjects.map((proj) => {
                    const currentIdx = MILESTONES.indexOf(proj.currentMilestone || 'LITERATURE_REVIEW')

                    return (
                      <div
                        key={proj.id}
                        onClick={() => setSelectedProject(proj)}
                        className="p-3.5 rounded-xl bg-card border border-border-subtle hover:border-accent/40 transition-all space-y-2.5 shadow-xs cursor-pointer group relative"
                      >
                        {/* Top Tag & Actions */}
                        <div className="flex items-center justify-between gap-1">
                          <span className="px-1.5 py-0.2 rounded bg-accent/15 text-accent text-[9px] font-mono font-bold truncate max-w-[120px]">
                            {proj.domain}
                          </span>

                          <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={(e) => handleOpenEdit(proj, e)}
                              className="p-1 rounded-lg text-text-muted hover:text-accent hover:bg-surface transition-colors cursor-pointer"
                              title="Edit Project"
                            >
                              <Edit3 className="h-3 w-3" />
                            </button>
                            <button
                              onClick={(e) => handleDeleteProject(proj, e)}
                              className="p-1 rounded-lg text-text-muted hover:text-semantic-red hover:bg-surface transition-colors cursor-pointer"
                              title="Delete Project"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        </div>

                        {/* Title & Lead */}
                        <div>
                          <h4 className="font-bold text-xs text-text-primary group-hover:text-accent transition-colors line-clamp-2 leading-tight">
                            {proj.title}
                          </h4>
                          <p className="text-[11px] text-text-muted font-medium mt-1">
                            Lead: {proj.teamLead?.name || 'Lead Student'}
                            {proj.teamLead?.rollNumber && (
                              <span className="text-[10px] ml-1 font-mono">({proj.teamLead.rollNumber})</span>
                            )}
                          </p>
                        </div>

                        {/* Phase Navigation Controls (Forward & Backward) */}
                        <div className="pt-2 border-t border-border-subtle flex items-center justify-between gap-1">
                          {/* Backward Button */}
                          {!isFirstCol ? (
                            <button
                              onClick={(e) => handleChangeMilestone(proj, MILESTONES[currentIdx - 1], e)}
                              className="px-2 py-1 rounded-lg bg-surface hover:bg-card border border-border-subtle text-text-secondary hover:text-text-primary text-[10px] font-bold flex items-center gap-0.5 transition-colors cursor-pointer"
                              title={`Move back to ${MILESTONE_LABELS[MILESTONES[currentIdx - 1]]}`}
                            >
                              <ChevronLeft className="h-3 w-3" />
                              <span>Back</span>
                            </button>
                          ) : (
                            <span className="text-[9px] text-text-muted italic">Initial Phase</span>
                          )}

                          {/* Forward Button */}
                          {!isLastCol ? (
                            <button
                              onClick={(e) => handleChangeMilestone(proj, MILESTONES[currentIdx + 1], e)}
                              className="px-2 py-1 rounded-lg bg-accent/20 hover:bg-accent text-accent hover:text-white text-[10px] font-bold flex items-center gap-0.5 transition-colors cursor-pointer ml-auto"
                              title={`Advance to ${MILESTONE_LABELS[MILESTONES[currentIdx + 1]]}`}
                            >
                              <span>Advance</span>
                              <ChevronRight className="h-3 w-3" />
                            </button>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full bg-semantic-green/15 text-semantic-green text-[9px] font-bold border border-semantic-green/30 flex items-center gap-1 ml-auto">
                              <CheckCircle2 className="h-2.5 w-2.5" /> Published
                            </span>
                          )}
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Project Details Modal */}
      {selectedProject && (
        <Dialog open={!!selectedProject} onOpenChange={(open) => !open && setSelectedProject(null)}>
          <DialogContent className="max-w-2xl bg-card border border-border-subtle rounded-3xl p-6 text-text-primary">
            <DialogHeader className="pb-3 border-b border-border-subtle">
              <div className="flex items-center justify-between gap-2">
                <DialogTitle className="font-bold text-lg text-text-primary flex items-center gap-2">
                  <GraduationCap className="h-5 w-5 text-accent" />
                  {selectedProject.title}
                </DialogTitle>
                <span className="px-2.5 py-0.5 rounded-full bg-accent/15 text-accent text-xs font-mono font-bold border border-accent/20">
                  {selectedProject.domain}
                </span>
              </div>
            </DialogHeader>

            <div className="space-y-4 text-xs">
              {/* Abstract */}
              {selectedProject.abstract && (
                <div className="p-3.5 rounded-2xl bg-surface border border-border-subtle space-y-1">
                  <span className="font-bold text-text-muted text-[10px] uppercase tracking-wider block">Project Abstract & Goals</span>
                  <p className="text-text-secondary leading-relaxed whitespace-pre-wrap">{selectedProject.abstract}</p>
                </div>
              )}

              {/* Team Information */}
              <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-surface border border-border-subtle">
                <div>
                  <span className="font-bold text-text-muted text-[10px] uppercase tracking-wider block">Team Lead</span>
                  <span className="font-bold text-text-primary text-xs">
                    {selectedProject.teamLead?.name || 'Lead Student'}
                  </span>
                  {selectedProject.teamLead?.rollNumber && (
                    <span className="text-text-muted font-mono block text-[11px]">Roll: {selectedProject.teamLead.rollNumber}</span>
                  )}
                </div>

                <div>
                  <span className="font-bold text-text-muted text-[10px] uppercase tracking-wider block">Co-Researchers</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {(selectedProject.members || []).length > 0 ? (
                      selectedProject.members.map((m, idx) => (
                        <span key={idx} className="px-2 py-0.5 rounded bg-base border border-border-subtle text-text-secondary text-[10px] font-medium">
                          {m.name}
                        </span>
                      ))
                    ) : (
                      <span className="text-text-muted italic">No additional members</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Milestone Stepper Timeline */}
              <div className="p-4 rounded-2xl bg-surface border border-border-subtle space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-text-muted text-[10px] uppercase tracking-wider">Milestone Stepper (Click any phase to change directly)</span>
                  <span className="text-[11px] font-bold text-accent">
                    Current: {MILESTONE_LABELS[selectedProject.currentMilestone || 'LITERATURE_REVIEW']}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                  {MILESTONES.map((m, idx) => {
                    const isCurrent = (selectedProject.currentMilestone || 'LITERATURE_REVIEW') === m
                    const isPassed = MILESTONES.indexOf(selectedProject.currentMilestone || 'LITERATURE_REVIEW') > idx

                    return (
                      <button
                        key={m}
                        type="button"
                        onClick={() => handleChangeMilestone(selectedProject, m)}
                        className={cn(
                          "p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between min-h-[64px]",
                          isCurrent
                            ? "bg-accent/20 border-accent ring-2 ring-accent/30 text-accent font-bold"
                            : isPassed
                            ? "bg-semantic-green/10 border-semantic-green/30 text-semantic-green"
                            : "bg-card border-border-subtle text-text-muted hover:border-accent/40 hover:text-text-primary"
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono font-bold">Phase {idx + 1}</span>
                          {isPassed && <Check className="h-3 w-3 text-semantic-green" />}
                          {isCurrent && <span className="h-2 w-2 rounded-full bg-accent animate-pulse" />}
                        </div>
                        <span className="text-[10px] font-bold leading-tight mt-1">
                          {MILESTONE_LABELS[m]}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Modal Footer Actions */}
              <div className="flex items-center justify-between pt-2 border-t border-border-subtle">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={(e) => handleOpenEdit(selectedProject, e)}
                    className="px-3 py-2 rounded-xl bg-surface hover:bg-surface/80 border border-border-subtle font-bold text-xs flex items-center gap-1.5 cursor-pointer text-text-primary"
                  >
                    <Edit3 className="h-3.5 w-3.5 text-accent" />
                    <span>Edit Project Details</span>
                  </button>

                  <button
                    type="button"
                    onClick={(e) => handleDeleteProject(selectedProject, e)}
                    className="px-3 py-2 rounded-xl bg-semantic-red/10 hover:bg-semantic-red/20 border border-semantic-red/30 text-semantic-red font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Delete Project</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedProject(null)}
                  className="px-4 py-2 rounded-xl bg-accent hover:bg-accent-light text-white font-bold text-xs cursor-pointer shadow-md shadow-accent/20"
                >
                  Close
                </button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Create / Edit Research Group Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="max-w-lg bg-card border border-border-subtle rounded-3xl p-6 text-text-primary">
          <DialogHeader className="pb-3 border-b border-border-subtle">
            <DialogTitle className="font-bold text-base text-text-primary flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-accent" />
              {editingProject ? 'Edit Research Project Details' : 'Register Research Project Group'}
            </DialogTitle>
            <DialogDescription className="text-xs text-text-muted">
              {editingProject ? 'Update team members, domain, and current milestone phase.' : 'Create a new capstone or research group with student roster.'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveProject} className="space-y-3.5 text-xs">
            <div className="space-y-1">
              <label className="text-text-secondary font-bold block">Project Title *</label>
              <input
                type="text"
                required
                placeholder="e.g. Distributed Consensus in Edge Computing"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full bg-base border border-border-subtle rounded-xl px-3.5 py-2.5 text-text-primary focus:outline-none focus:border-accent"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-text-secondary font-bold block">Research Domain</label>
                <input
                  type="text"
                  value={form.domain}
                  onChange={(e) => setForm({ ...form, domain: e.target.value })}
                  className="w-full bg-base border border-border-subtle rounded-xl px-3.5 py-2.5 text-text-primary focus:outline-none focus:border-accent"
                />
              </div>

              <div className="space-y-1">
                <label className="text-text-secondary font-bold block">Current Phase / Milestone</label>
                <select
                  value={form.currentMilestone}
                  onChange={(e) => setForm({ ...form, currentMilestone: e.target.value })}
                  className="w-full bg-base border border-border-subtle rounded-xl px-3 py-2.5 text-text-primary font-bold focus:outline-none focus:border-accent"
                >
                  {MILESTONES.map((m) => (
                    <option key={m} value={m}>{MILESTONE_LABELS[m]}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-text-secondary font-bold block">Team Lead Name</label>
                <input
                  type="text"
                  placeholder="Aditi Sharma"
                  value={form.teamLeadName}
                  onChange={(e) => setForm({ ...form, teamLeadName: e.target.value })}
                  className="w-full bg-base border border-border-subtle rounded-xl px-3.5 py-2 text-text-primary focus:outline-none focus:border-accent"
                />
              </div>
              <div className="space-y-1">
                <label className="text-text-secondary font-bold block">Lead Roll Number</label>
                <input
                  type="text"
                  placeholder="22CS108"
                  value={form.teamLeadRoll}
                  onChange={(e) => setForm({ ...form, teamLeadRoll: e.target.value })}
                  className="w-full bg-base border border-border-subtle rounded-xl px-3.5 py-2 text-text-primary focus:outline-none focus:border-accent"
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
                className="w-full bg-base border border-border-subtle rounded-xl px-3.5 py-2 text-text-primary focus:outline-none focus:border-accent"
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
                onClick={() => {
                  setShowCreateModal(false)
                  setEditingProject(null)
                }}
                className="px-4 py-2 rounded-xl text-text-secondary hover:text-text-primary font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-accent hover:bg-accent-light text-white font-bold shadow-lg shadow-accent/25 cursor-pointer"
              >
                {editingProject ? 'Save Changes' : 'Register Project'}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
