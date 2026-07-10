import ApplicationCard from './ApplicationCard'

const COLUMNS = [
  { id: 'Wishlist', title: 'Wishlist', statuses: ['Wishlist'] },
  { id: 'Applied', title: 'Applied', statuses: ['Applied'] },
  { id: 'OA Scheduled', title: 'OA Scheduled', statuses: ['OA Scheduled'] },
  { id: 'Interview Round', title: 'Interview Round', statuses: ['Interview Round'] },
  { id: 'Offered/Archived', title: 'Offered / Closed', statuses: ['Offered', 'Rejected', 'Archived'] },
]

export default function KanbanBoard({ applications, onUpdateStatus, onCardClick }) {
  const handleDragStart = (e, appId) => {
    e.dataTransfer.setData('text/plain', appId)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
  }

  const handleDrop = async (e, targetColumnId) => {
    e.preventDefault()
    const appId = e.dataTransfer.getData('text/plain')
    if (!appId) return

    // If target column is "Offered/Archived", default status to "Offered". Otherwise use column id.
    const newStatus = targetColumnId === 'Offered/Archived' ? 'Offered' : targetColumnId
    await onUpdateStatus(appId, newStatus)
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 overflow-x-auto pb-4">
      {COLUMNS.map((col) => {
        const colApps = applications.filter((app) => col.statuses.includes(app.status))

        return (
          <div
            key={col.id}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, col.id)}
            className="flex flex-col bg-surface rounded-card border border-border-subtle p-3 min-h-[300px] md:min-h-[500px]"
          >
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-secondary font-semibold text-text-primary">{col.title}</h3>
              <span className="text-micro text-text-muted bg-hover px-2 py-0.5 rounded-full">
                {colApps.length}
              </span>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto">
              {colApps.map((app) => (
                <ApplicationCard
                  key={app.id}
                  app={app}
                  onClick={() => onCardClick(app)}
                  draggable
                  onDragStart={(e) => handleDragStart(e, app.id)}
                />
              ))}
              {colApps.length === 0 && (
                <div className="h-full flex items-center justify-center border border-dashed border-border-subtle rounded-lg p-6">
                  <p className="text-micro text-text-muted text-center">Drag items here</p>
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
