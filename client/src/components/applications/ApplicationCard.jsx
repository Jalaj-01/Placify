import { daysAgo, formatDate, isWithinHours } from '@/utils/dateHelpers'
import { AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function ApplicationCard({ app, onClick, draggable, onDragStart }) {
  const urgent = isWithinHours(app.roundDate, 48)

  return (
    <div
      draggable={draggable}
      onDragStart={onDragStart}
      onClick={onClick}
      className={cn(
        'rounded-lg border border-border-subtle bg-card p-3 cursor-pointer hover:border-border-hover transition-all active:scale-[0.98]',
        urgent && 'border-semantic-red/40'
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <h4 className="text-body font-medium">{app.companyName}</h4>
          <p className="text-secondary text-text-secondary">{app.role}</p>
        </div>
        {urgent && <AlertCircle className="h-4 w-4 text-semantic-red shrink-0" />}
      </div>
      {app.roundDate && (
        <p className="text-micro text-text-muted mt-2">
          Round: {formatDate(app.roundDate)}
        </p>
      )}
      <p className="text-micro text-text-muted mt-1">
        {app.createdAt ? `${daysAgo(app.createdAt)}d ago` : ''}
      </p>
    </div>
  )
}
