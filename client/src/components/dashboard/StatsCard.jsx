export default function StatsCard({ title, value, icon: Icon, description }) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-surface/90 border border-white/10 p-5 shadow-xl backdrop-blur-xl hover:border-accent/40 hover:shadow-2xl hover:-translate-y-0.5 transition-all duration-300 group">
      {/* Background Subtle Gradient Glow */}
      <div className="absolute top-0 right-0 -mt-6 -mr-6 w-24 h-24 rounded-full bg-accent/10 blur-xl pointer-events-none group-hover:bg-accent/20 transition-all" />
      
      <div className="relative z-10 flex items-center justify-between gap-4">
        <div className="space-y-1">
          <p className="text-xs font-bold uppercase tracking-wider text-text-muted">{title}</p>
          <h3 className="text-2xl sm:text-3xl font-black text-text-primary tracking-tight leading-none">
            {value}
          </h3>
          {description && (
            <p className="text-[11px] text-text-secondary leading-snug pt-1">
              {description}
            </p>
          )}
        </div>
        <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-accent/20 to-accent/10 border border-accent/30 flex items-center justify-center shrink-0 text-accent-light shadow-md shadow-accent/10 group-hover:scale-110 transition-transform">
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  )
}
