import { Badge } from '@/components/ui/badge'

export default function StatusBadge({ status }) {
  const variants = {
    Wishlist: 'secondary',
    Applied: 'default',
    'OA Scheduled': 'warning',
    'Interview Round': 'default',
    Offered: 'success',
    Rejected: 'destructive',
    Archived: 'outline',
  }

  const colors = {
    Wishlist: 'text-text-muted',
    Applied: 'text-semantic-blue',
    'OA Scheduled': 'text-semantic-yellow',
    'Interview Round': 'text-semantic-purple',
    Offered: 'text-semantic-green',
    Rejected: 'text-semantic-red',
    Archived: 'text-text-muted',
  }

  return (
    <Badge variant={variants[status] || 'secondary'} className={colors[status]}>
      {status}
    </Badge>
  )
}
