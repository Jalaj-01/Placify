import { useState, useEffect } from 'react'
import { Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'

const statusColors = {
  'Not Started': 'text-text-muted',
  'In Progress': 'text-semantic-yellow',
  'Done': 'text-semantic-green',
}

const confidenceColors = {
  Low: 'bg-semantic-red-bg text-semantic-red',
  Medium: 'bg-semantic-yellow-bg text-semantic-yellow',
  High: 'bg-semantic-green-bg text-semantic-green',
}

const STATUS_CYCLE = ['Not Started', 'In Progress', 'Done']
const CONFIDENCE_CYCLE = ['Low', 'Medium', 'High']

export default function TopicCard({ topic, onUpdate, onDelete }) {
  const [name, setName] = useState(topic.name)

  useEffect(() => {
    setName(topic.name)
  }, [topic.name])

  const cycleStatus = () => {
    const idx = STATUS_CYCLE.indexOf(topic.status)
    onUpdate(topic.id, { status: STATUS_CYCLE[(idx + 1) % 3] })
  }

  const cycleConfidence = () => {
    const idx = CONFIDENCE_CYCLE.indexOf(topic.confidence)
    onUpdate(topic.id, { confidence: CONFIDENCE_CYCLE[(idx + 1) % 3] })
  }

  return (
    <div className="flex items-center gap-3 py-2.5 px-3 rounded-lg hover:bg-hover/50 group transition-colors">
      <button
        onClick={cycleStatus}
        className={cn(
          'h-5 w-5 rounded border-2 shrink-0 transition-colors flex items-center justify-center',
          topic.status === 'Done' ? 'bg-semantic-green border-semantic-green' :
          topic.status === 'In Progress' ? 'border-semantic-yellow bg-semantic-yellow/20' :
          'border-border'
        )}
      >
        {topic.status === 'Done' && (
          <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        )}
      </button>

      {/* Editable Name Input */}
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        onBlur={() => {
          if (name.trim() && name.trim() !== topic.name) {
            onUpdate(topic.id, { name: name.trim() })
          }
        }}
        className={cn(
          'flex-1 bg-transparent border-none outline-none focus:border-b focus:border-border-default text-body p-0',
          statusColors[topic.status]
        )}
      />

      <button
        onClick={cycleConfidence}
        className={cn('text-micro px-2 py-0.5 rounded-md font-medium shrink-0', confidenceColors[topic.confidence])}
      >
        {topic.confidence}
      </button>

      <input
        type="text"
        placeholder="Note"
        defaultValue={topic.personalNote || ''}
        onBlur={(e) => {
          if (e.target.value !== (topic.personalNote || '')) {
            onUpdate(topic.id, { personalNote: e.target.value })
          }
        }}
        className="w-0 group-hover:w-32 focus:w-32 transition-all bg-transparent border-b border-transparent focus:border-border text-micro text-text-secondary outline-none shrink-0"
      />

      {/* Delete Topic Button */}
      <button
        onClick={() => onDelete(topic.id)}
        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-text-muted hover:text-semantic-red shrink-0"
        title="Delete topic"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  )
}
