import { Card, CardContent } from '@/components/ui/card'

export default function StatsCard({ title, value, icon: Icon, description }) {
  return (
    <Card className="relative overflow-hidden hover:scale-[1.02] transition-transform">
      <CardContent className="p-5 flex items-center justify-between gap-4">
        <div className="space-y-1">
          <p className="text-secondary text-text-secondary font-medium">{title}</p>
          <h3 className="text-stat font-bold text-text-primary leading-none">{value}</h3>
          {description && <p className="text-micro text-text-muted mt-1">{description}</p>}
        </div>
        <div className="h-12 w-12 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
          <Icon className="h-6 w-6 text-accent-light" />
        </div>
      </CardContent>
    </Card>
  )
}
