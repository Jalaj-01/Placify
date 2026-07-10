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

function getFaviconUrl(url) {
  try {
    const hostname = new URL(url).hostname
    return `https://www.google.com/s2/favicons?domain=${hostname}&sz=32`
  } catch {
    return null
  }
}

export default function ProblemCard({ problem, onUpdate, onDelete }) {
  const [confirmDelete, setConfirmDelete] = useState(false)
  const due = isDue(problem.nextReviewDate)
  const lastReviewed = daysAgo(problem.lastReviewedDate)

  const favicon = getFaviconUrl(problem.url)

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
    >
      <Card className={cn('bg-card border-border-subtle hover:border-border-hover transition-all', due && 'border-semantic-red/35 bg-semantic-red/5')}>
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-4 mb-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <h3 className="text-body font-bold text-text-primary truncate">{problem.title}</h3>
                <Badge variant="secondary">{problem.platform}</Badge>
                <Badge variant="outline">{problem.difficulty}</Badge>
                {problem.tag && <Badge variant="default" className="text-micro">{problem.tag}</Badge>}
                {due && <Badge variant="destructive" className="animate-pulse">Review Due</Badge>}
              </div>
              <p className="text-micro text-text-muted">
                {lastReviewed}
                {problem.nextReviewDate && ` · Review by ${formatDate(problem.nextReviewDate)}`}
              </p>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <a href={problem.url} target="_blank" rel="noopener noreferrer">
                <Button variant="ghost" size="icon" className="h-8 w-8 p-1 flex items-center justify-center">
                  {favicon ? (
                    <img
                      src={favicon}
                      alt=""
                      className="h-4.5 w-4.5 object-contain rounded"
                      onError={(e) => {
                        e.target.style.display = 'none'
                      }}
                    />
                  ) : (
                    <ExternalLink className="h-4 w-4" />
                  )}
                </Button>
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
