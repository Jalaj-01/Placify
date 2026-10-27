import { motion } from 'framer-motion'
import { TrendingUp, CheckCircle2, Zap, Star } from 'lucide-react'

export default function Metrics() {
  const metrics = [
    {
      label: 'Placement Application Success Rate',
      value: '98.4%',
      subtext: 'Automated Kanban tracking vs manual spreadsheets',
      icon: TrendingUp,
      badgeColor: 'bg-[#EEF2FF] text-[#2563EB] border-blue-200',
    },
    {
      label: 'Mock Interviews Simulated',
      value: '10,000+',
      subtext: 'Timed OA problem sessions & 1v1 peer rounds',
      icon: CheckCircle2,
      badgeColor: 'bg-[#FFFDF7] text-[#854d0e] border-[#FEF08A]',
    },
    {
      label: 'Faculty Syllabus Overhead Cut',
      value: '50%',
      subtext: 'Automated course pacing & 1-click gradebook CSV',
      icon: Zap,
      badgeColor: 'bg-[#EEF2FF] text-[#2563EB] border-[#BFDBFE]',
    },
    {
      label: 'Campus Satisfaction Rating',
      value: '4.9 / 5',
      subtext: 'Trusted by engineering students, faculty & scholars',
      icon: Star,
      badgeColor: 'bg-[#FFFDF7] text-[#CA8A04] border-[#FEF08A]',
    },
  ]

  return (
    <section id="metrics" className="py-16 px-4 sm:px-8 max-w-7xl mx-auto relative z-20">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {metrics.map((item, idx) => {
          const IconComp = item.icon
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.1 }}
              className="p-6 rounded-[24px] bg-white/85 border border-white/95 shadow-[0_8px_30px_rgba(31,41,55,0.05)] backdrop-blur-xl hover:shadow-[0_12px_36px_rgba(31,41,55,0.08)] hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className={`p-3 rounded-2xl border ${item.badgeColor} shadow-sm`}>
                  <IconComp className="h-5 w-5" />
                </div>
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                  Verified Result
                </span>
              </div>

              <div className="space-y-1">
                <h3 className="text-3xl sm:text-4xl font-extrabold text-[#1E1B4B] tracking-tight">
                  {item.value}
                </h3>
                <h4 className="text-xs font-bold text-slate-800 leading-tight">
                  {item.label}
                </h4>
                <p className="text-[11px] text-slate-500 leading-relaxed font-normal">
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
