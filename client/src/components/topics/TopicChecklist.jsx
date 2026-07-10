import { useState } from 'react'
import { ChevronDown, Plus } from 'lucide-react'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import TopicCard from './TopicCard'

export default function TopicChecklist({ title, topics, onUpdate, onAdd, onDelete }) {
  const [open, setOpen] = useState(true)
  const [adding, setAdding] = useState(false)
  const [newName, setNewName] = useState('')

  const done = topics.filter((t) => t.status === 'Done').length
  const pct = topics.length ? Math.round((done / topics.length) * 100) : 0

  const handleAdd = async () => {
    if (!newName.trim()) return
    await onAdd(newName.trim())
    setNewName('')
    setAdding(false)
  }

  return (
    <div className="rounded-card border border-border-subtle bg-card overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-4 hover:bg-hover/30 transition-colors"
      >
        <div className="flex items-center gap-3">
          <ChevronDown className={cn('h-4 w-4 text-text-muted transition-transform', !open && '-rotate-90')} />
          <span className="text-card-title font-medium">{title}</span>
          <span className="text-micro text-text-muted">{done}/{topics.length} done</span>
        </div>
        <div className="w-24 hidden sm:block">
          <Progress value={pct} />
        </div>
      </button>

      {open && (
        <div className="border-t border-border-subtle px-1 pb-2">
          {topics.map((t) => (
            <TopicCard key={t.id} topic={t} onUpdate={onUpdate} onDelete={onDelete} />
          ))}
          {adding ? (
            <div className="flex gap-2 px-3 py-2">
              <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Topic name" className="flex-1" onKeyDown={(e) => e.key === 'Enter' && handleAdd()} />
              <Button size="sm" onClick={handleAdd}>Add</Button>
              <Button size="sm" variant="ghost" onClick={() => setAdding(false)}>Cancel</Button>
            </div>
          ) : (
            <button onClick={() => setAdding(true)} className="flex items-center gap-2 px-3 py-2 text-secondary text-text-muted hover:text-accent-light transition-colors">
              <Plus className="h-4 w-4" /> Add custom topic
            </button>
          )}
        </div>
      )}
    </div>
  )
}
