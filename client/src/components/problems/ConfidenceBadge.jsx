import { cn } from '@/lib/utils'

const config = {
  Red: { color: 'bg-semantic-red', label: 'Red', bg: 'bg-semantic-red-bg', text: 'text-semantic-red' },
  Yellow: { color: 'bg-semantic-yellow', label: 'Yellow', bg: 'bg-semantic-yellow-bg', text: 'text-semantic-yellow' },
  Green: { color: 'bg-semantic-green', label: 'Green', bg: 'bg-semantic-green-bg', text: 'text-semantic-green' },
}

export default function ConfidenceBadge({ status, size = 'sm' }) {
  const c = config[status] || config.Red
  if (size === 'dot') {
    return <span className={cn('inline-block h-2.5 w-2.5 rounded-full', c.color)} title={c.label} />
  }
  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-micro font-medium', c.bg, c.text)}>
      <span className={cn('h-1.5 w-1.5 rounded-full', c.color)} />
      {c.label}
    </span>
  )
}

export function ConfidenceToggle({ value, onChange, disabled }) {
  return (
    <div className="flex gap-2">
      {['Red', 'Yellow', 'Green'].map((s) => {
        const c = config[s]
        return (
          <button
            key={s}
            type="button"
            disabled={disabled}
            onClick={() => onChange(s)}
            className={cn(
              'flex-1 py-3 rounded-lg border text-secondary font-medium transition-all active:scale-[0.97]',
              value === s ? `${c.bg} ${c.text} border-current` : 'border-border bg-surface text-text-secondary hover:border-border-hover'
            )}
          >
            {s}
          </button>
        )
      })}
    </div>
  )
}
