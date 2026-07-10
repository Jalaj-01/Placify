import { useState, useMemo } from 'react'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import ProblemCard from './ProblemCard'
import { Code2 } from 'lucide-react'

export default function ProblemList({ problems, loading, onUpdate, onDelete }) {
  const [tagFilter, setTagFilter] = useState('all')
  const [platformFilter, setPlatformFilter] = useState('all')
  const [confidenceFilter, setConfidenceFilter] = useState('all')
  const [sortBy, setSortBy] = useState('date')

  const tags = useMemo(() => [...new Set(problems.map((p) => p.tag))], [problems])
  const platforms = useMemo(() => [...new Set(problems.map((p) => p.platform))], [problems])

  const filtered = useMemo(() => {
    let list = [...problems]
    if (tagFilter !== 'all') list = list.filter((p) => p.tag === tagFilter)
    if (platformFilter !== 'all') list = list.filter((p) => p.platform === platformFilter)
    if (confidenceFilter !== 'all') list = list.filter((p) => p.confidenceStatus === confidenceFilter)
    if (sortBy === 'review') {
      list.sort((a, b) => {
        const da = a.nextReviewDate?.toDate?.() || new Date(0)
        const db = b.nextReviewDate?.toDate?.() || new Date(0)
        return da - db
      })
    }
    return list
  }, [problems, tagFilter, platformFilter, confidenceFilter, sortBy])

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => <Skeleton key={i} className="h-32 w-full rounded-card" />)}
      </div>
    )
  }

  if (!problems.length) {
    return (
      <div className="text-center py-16">
        <Code2 className="h-12 w-12 text-text-muted mx-auto mb-4" />
        <h3 className="text-card-title font-medium mb-2">No problems logged yet</h3>
        <p className="text-secondary text-text-secondary">Paste a LeetCode URL above to add your first problem</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <Select value={tagFilter} onValueChange={setTagFilter}>
          <SelectTrigger className="w-[140px]"><SelectValue placeholder="Tag" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Tags</SelectItem>
            {tags.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={platformFilter} onValueChange={setPlatformFilter}>
          <SelectTrigger className="w-[140px]"><SelectValue placeholder="Platform" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Platforms</SelectItem>
            {platforms.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={confidenceFilter} onValueChange={setConfidenceFilter}>
          <SelectTrigger className="w-[140px]"><SelectValue placeholder="Confidence" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="Red">Red</SelectItem>
            <SelectItem value="Yellow">Yellow</SelectItem>
            <SelectItem value="Green">Green</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-[160px]"><SelectValue placeholder="Sort" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="date">Date Added</SelectItem>
            <SelectItem value="review">Next Review</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-3">
        {filtered.map((p) => (
          <ProblemCard key={p.id} problem={p} onUpdate={onUpdate} onDelete={onDelete} />
        ))}
      </div>
    </div>
  )
}
