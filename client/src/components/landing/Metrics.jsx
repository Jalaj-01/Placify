import { motion } from 'framer-motion'
import { Award, CheckCircle2, TrendingUp, Star, Users, Zap } from 'lucide-react'

export default function Metrics() {
  const metrics = [
    {
      label: 'Placement Application Response Rate',
      value: '98.4%',
      subtext: 'Automated Kanban tracking vs legacy spreadsheets',
      icon: TrendingUp,
      color: 'text-accent-light bg-accent/15 border-accent/30',
    },
    {
      label: 'Solved Mock Interview Scenarios',
      value: '10,000+',
      subtext: 'Timed OA simulation & 1v1 peer matcher sessions',
      icon: CheckCircle2,
      color: 'text-semantic-green bg-semantic-green/15 border-semantic-green/30',
    },
    {
      label: 'Faculty Course Pace Overhead Reduced',
      value: '50%',
      subtext: 'Automated syllabus charts & digital CSV gradebook',
      icon: Zap,
      color: 'text-purple-400 bg-purple-500/15 border-purple-500/30',
    },
    {
      label: 'Institution Rating Across Campuses',
      value: '4.9/5',
      subtext: 'Rated by engineering students, faculty & PhD scholars',
      icon: Star,
      color: 'text-amber-400 bg-amber-500/15 border-amber-500/30',
    },
  ]

  return (
    <section className="py-16 px-6 max-w-7xl mx-auto border-y border-border/40 relative z-20">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((item, idx) => {
          const IconComp = item.icon
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="p-6 rounded-3xl bg-surface/80 border border-border-subtle hover:border-accent/40 transition-all duration-300 shadow-xl backdrop-blur-xl group flex flex-col justify-between space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className={`p-3.5 rounded-2xl border ${item.color} shadow-sm`}>
                  <IconComp className="h-5 w-5" />
                </div>
                <span className="text-[10px] font-mono text-text-muted uppercase font-bold tracking-wider">
                  Verified Metric
                </span>
              </div>

              <div className="space-y-1">
                <h3 className="text-3xl sm:text-4xl font-black text-text-primary group-hover:text-accent-light transition-colors tracking-tight">
                  {item.value}
                </h3>
                <p className="text-xs font-bold text-text-primary">
                  {item.label}
                </p>
                <p className="text-[11px] text-text-muted leading-relaxed">
                  {item.subtext}
                </p>
              </div>
            </motion.div>
          )
        })}
      </div>
    </section>
  )
}
