import { useState } from 'react'
import { motion } from 'framer-motion'
import { ExternalLink, Trash2, Paperclip } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import ConfidenceBadge, { ConfidenceToggle } from './ConfidenceBadge'
import { daysAgo, formatDate } from '@/utils/dateHelpers'
import { Timestamp } from 'firebase/firestore'

function isDue(nextReviewDate) {
  if (!nextReviewDate) return false
  const d = nextReviewDate?.toDate ? nextReviewDate.toDate() : new Date(nextReviewDate)
  return d <= new Date()
}

export default function ProblemCard({ problem, onUpdate, onDelete }) {
  const [confirmDelete, setConfirmDelete] = useState(false)
  const due = isDue(problem.nextReviewDate)
  const lastReviewed = daysAgo(problem.lastReviewedDate)

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
      <Card className="hover:scale-[1.01] transition-transform">
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <h3 className="text-card-title font-medium truncate">{problem.title}</h3>
                {due && <Badge variant="destructive">Due for review</Badge>}
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="secondary">{problem.platform}</Badge>
                <Badge variant="outline">{problem.difficulty}</Badge>
                <Badge variant="default">{problem.tag}</Badge>
                <ConfidenceBadge status={problem.confidenceStatus} />
              </div>
              <p className="text-micro text-text-muted mt-2">
                {lastReviewed !== null ? `Last reviewed ${lastReviewed}d ago` : `Added ${formatDate(problem.createdAt)}`}
                {problem.nextReviewDate && ` · Review by ${formatDate(problem.nextReviewDate)}`}
              </p>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <a href={problem.url} target="_blank" rel="noopener noreferrer">
                <Button variant="ghost" size="icon"><ExternalLink className="h-4 w-4" /></Button>
              </a>
              {!confirmDelete ? (
                <Button variant="ghost" size="icon" onClick={() => setConfirmDelete(true)}>
                  <Trash2 className="h-4 w-4 text-text-muted" />
                </Button>
              ) : (
                <Button variant="destructive" size="sm" onClick={() => onDelete(problem.id)}>Delete</Button>
              )}
            </div>
          </div>
          {problem.notes && <p className="text-secondary text-text-secondary mb-3">{problem.notes}</p>}
          {problem.attachments && problem.attachments.length > 0 && (
            <div className="flex gap-2 flex-wrap mb-3">
              {problem.attachments.map((att, idx) => (
                <a
                  key={idx}
                  href={att.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-micro bg-hover border border-border-subtle hover:border-border-hover px-2 py-0.5 rounded text-accent-light transition-colors"
                >
                  <Paperclip className="h-3 w-3" />
                  {att.name}
                </a>
              ))}
            </div>
          )}
          <ConfidenceToggle
            value={problem.confidenceStatus}
            onChange={(s) => onUpdate(problem.id, { confidenceStatus: s })}
          />
        </CardContent>
      </Card>
    </motion.div>
  )
}
