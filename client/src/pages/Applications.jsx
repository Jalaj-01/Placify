import { useState } from 'react'
import { Briefcase, List, Kanban, Plus, Trash2, Calendar, Link2, DollarSign, Clock } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useApplications } from '@/hooks/useApplications'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import KanbanBoard from '@/components/applications/KanbanBoard'
import StatusBadge from '@/components/applications/StatusBadge'
import QuickAddModal from '@/components/applications/QuickAddModal'
import { formatDate, daysAgo } from '@/utils/dateHelpers'

const STATUSES = ['Wishlist', 'Applied', 'OA Scheduled', 'Interview Round', 'Offered', 'Rejected', 'Archived']

export default function Applications() {
  const { user } = useAuth()
  const { applications, loading, addApplication, updateApplication, deleteApplication } = useApplications(user?.uid)

  const [viewMode, setViewMode] = useState('kanban')
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [selectedApp, setSelectedApp] = useState(null)
  const [editForm, setEditForm] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const handleCardClick = (app) => {
    setSelectedApp(app)
    setEditForm({
      companyName: app.companyName,
      role: app.role,
      status: app.status,
      jobLink: app.jobLink || '',
      roundDate: app.roundDate ? (app.roundDate.toDate ? app.roundDate.toDate().toISOString().split('T')[0] : new Date(app.roundDate).toISOString().split('T')[0]) : '',
      roundNotes: app.roundNotes || '',
      package: app.package || '',
    })
    setConfirmDelete(false)
  }

  const handleSaveEdit = async () => {
    if (!selectedApp || !editForm) return
    const updates = {
      companyName: editForm.companyName,
      role: editForm.role,
      status: editForm.status,
      jobLink: editForm.jobLink,
      roundDate: editForm.roundDate ? new Date(editForm.roundDate) : null,
      roundNotes: editForm.roundNotes,
      package: editForm.package,
    }
    await updateApplication(selectedApp.id, updates)
    setSelectedApp(null)
    setEditForm(null)
  }

  const handleUpdateStatus = async (appId, newStatus) => {
    await updateApplication(appId, { status: newStatus })
  }

  const handleDelete = async () => {
    if (!selectedApp) return
    await deleteApplication(selectedApp.id)
    setSelectedApp(null)
    setEditForm(null)
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/15">
            <Briefcase className="h-5 w-5 text-accent-light" />
          </div>
          <div>
            <h1 className="text-page font-bold text-text-primary">Applications</h1>
            <p className="text-secondary text-text-secondary">Track job and internship applications</p>
          </div>
        </div>

        <div className="flex items-center gap-3 self-end sm:self-auto">
          {/* View Toggle */}
          <div className="flex rounded-lg border border-border-subtle bg-surface p-1">
            <button
              onClick={() => setViewMode('kanban')}
              className={`p-1.5 rounded-md transition-colors ${viewMode === 'kanban' ? 'bg-hover text-accent-light' : 'text-text-muted hover:text-text-primary'}`}
            >
              <Kanban className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-md transition-colors ${viewMode === 'list' ? 'bg-hover text-accent-light' : 'text-text-muted hover:text-text-primary'}`}
            >
              <List className="h-4 w-4" />
            </button>
          </div>

          <Button onClick={() => setIsAddOpen(true)} className="flex items-center gap-2">
            <Plus className="h-4 w-4" /> Add Application
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-48 w-full rounded-card" />
        </div>
      ) : applications.length === 0 ? (
        <div className="text-center py-20 bg-card rounded-card border border-border-subtle">
          <Briefcase className="h-12 w-12 text-text-muted mx-auto mb-4" />
          <h3 className="text-card-title font-medium mb-2">No applications tracked yet</h3>
          <p className="text-secondary text-text-secondary mb-6">Start tracking your job applications by clicking the button above.</p>
          <Button onClick={() => setIsAddOpen(true)}>Add Your First Job</Button>
        </div>
      ) : viewMode === 'kanban' ? (
        <KanbanBoard
          applications={applications}
          onUpdateStatus={handleUpdateStatus}
          onCardClick={handleCardClick}
        />
      ) : (
        /* List View */
        <div className="overflow-x-auto rounded-card border border-border-subtle bg-card">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-border-subtle text-text-muted text-micro font-medium uppercase tracking-wider bg-surface">
                <th className="p-4">Company</th>
                <th className="p-4">Role</th>
                <th className="p-4">Status</th>
                <th className="p-4">Next Round / Interview</th>
                <th className="p-4">Applied</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {applications.map((app) => (
                <tr
                  key={app.id}
                  onClick={() => handleCardClick(app)}
                  className="hover:bg-hover/20 cursor-pointer transition-colors"
                >
                  <td className="p-4 text-body font-medium text-text-primary">{app.companyName}</td>
                  <td className="p-4 text-secondary text-text-secondary">{app.role}</td>
                  <td className="p-4"><StatusBadge status={app.status} /></td>
                  <td className="p-4 text-secondary text-text-secondary flex items-center gap-1.5 mt-2.5">
                    {app.roundDate ? (
                      <>
                        <Calendar className="h-3.5 w-3.5 text-text-muted" />
                        {formatDate(app.roundDate)}
                      </>
                    ) : (
                      '--'
                    )}
                  </td>
                  <td className="p-4 text-secondary text-text-muted">
                    {app.createdAt ? `${daysAgo(app.createdAt)}d ago` : ''}
                  </td>
                  <td className="p-4 text-right" onClick={(e) => e.stopPropagation()}>
                    <Button variant="ghost" size="sm" onClick={() => handleCardClick(app)}>
                      Edit
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Quick Add Modal */}
      <QuickAddModal
        open={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onSave={addApplication}
      />

      {/* Detail Slide-Over / Dialog */}
      {selectedApp && editForm && (
        <Dialog open={true} onOpenChange={() => setSelectedApp(null)}>
          <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-section font-semibold">Application Details</DialogTitle>
            </DialogHeader>

            <div className="space-y-4 my-2">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-micro text-text-secondary block mb-1">Company Name</label>
                  <Input
                    value={editForm.companyName}
                    onChange={(e) => setEditForm({ ...editForm, companyName: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-micro text-text-secondary block mb-1">Role / Position</label>
                  <Input
                    value={editForm.role}
                    onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-micro text-text-secondary block mb-1">Status</label>
                  <Select
                    value={editForm.status}
                    onValueChange={(v) => setEditForm({ ...editForm, status: v })}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-micro text-text-secondary block mb-1">Round Date</label>
                  <Input
                    type="date"
                    value={editForm.roundDate}
                    onChange={(e) => setEditForm({ ...editForm, roundDate: e.target.value })}
                  />
                </div>
              </div>

              {editForm.status === 'Offered' && (
                <div>
                  <label className="text-micro text-text-secondary block mb-1">Package Offered (e.g. 12 LPA)</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
                    <Input
                      value={editForm.package}
                      placeholder="e.g. 12 LPA"
                      className="pl-10"
                      onChange={(e) => setEditForm({ ...editForm, package: e.target.value })}
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="text-micro text-text-secondary block mb-1">Job Posting Link</label>
                <div className="relative">
                  <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
                  <Input
                    value={editForm.jobLink}
                    placeholder="https://company.com/careers/job-123"
                    className="pl-10"
                    onChange={(e) => setEditForm({ ...editForm, jobLink: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="text-micro text-text-secondary block mb-1">Round Notes</label>
                <textarea
                  className="w-full bg-surface border border-border-subtle rounded-md p-3 text-body outline-none focus:border-border-hover min-h-[100px] resize-none"
                  placeholder="Round 1 - Technical - asked Binary Trees and System Design basics..."
                  value={editForm.roundNotes}
                  onChange={(e) => setEditForm({ ...editForm, roundNotes: e.target.value })}
                />
              </div>

              {/* Status Timeline */}
              {selectedApp.statusHistory && selectedApp.statusHistory.length > 0 && (
                <div className="border-t border-border-subtle pt-4">
                  <h4 className="text-secondary font-medium text-text-primary mb-3 flex items-center gap-1.5">
                    <Clock className="h-4 w-4 text-text-muted" /> Status Timeline
                  </h4>
                  <div className="space-y-3 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-border-subtle">
                    {selectedApp.statusHistory.map((hist, idx) => (
                      <div key={idx} className="flex gap-4 items-start pl-[22px] relative">
                        <span className="absolute left-1 top-[5px] h-4 w-4 rounded-full bg-accent/20 border border-accent-light shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-secondary font-medium text-text-primary leading-tight">
                            Moved to <span className="text-accent-light">{hist.status}</span>
                          </p>
                          <p className="text-micro text-text-muted">
                            {formatDate(hist.timestamp)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <DialogFooter className="flex-col sm:flex-row gap-2 mt-4">
              <div className="flex-1">
                {!confirmDelete ? (
                  <Button variant="ghost" className="text-semantic-red hover:bg-semantic-red-bg w-full sm:w-auto" onClick={() => setConfirmDelete(true)}>
                    Delete
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button variant="destructive" onClick={handleDelete}>Confirm Delete</Button>
                    <Button variant="ghost" onClick={() => setConfirmDelete(false)}>Cancel</Button>
                  </div>
                )}
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="ghost" onClick={() => setSelectedApp(null)}>Cancel</Button>
                <Button onClick={handleSaveEdit}>Save Changes</Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
