import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

export default function InsightCard({ title, icon: Icon, children, variant = 'default' }) {
  const borderColors = {
    default: 'border-border-subtle bg-card',
    accent: 'border-accent/30 bg-accent/5 text-accent-light',
    purple: 'border-semantic-purple/30 bg-semantic-purple-bg/10 text-semantic-purple',
    green: 'border-semantic-green/30 bg-semantic-green-bg/10 text-semantic-green',
    yellow: 'border-semantic-yellow/30 bg-semantic-yellow-bg/10 text-semantic-yellow',
    red: 'border-semantic-red/30 bg-semantic-red-bg/10 text-semantic-red',
  }

  return (
    <Card className={cn('border transition-all hover:scale-[1.01]', borderColors[variant])}>
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center gap-2.5">
          {Icon && (
            <div className="h-8 w-8 rounded-lg bg-surface flex items-center justify-center shrink-0 border border-border-subtle">
              <Icon className="h-4.5 w-4.5 text-text-primary" />
            </div>
          )}
          <h4 className="text-body font-semibold text-text-primary">{title}</h4>
        </div>
        <div className="text-secondary text-text-secondary leading-relaxed">{children}</div>
      </CardContent>
    </Card>
  )
}
