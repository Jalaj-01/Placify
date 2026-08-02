import { motion } from 'framer-motion'
import { Check, X, ShieldCheck, Zap } from 'lucide-react'

export default function Comparison() {
  const points = [
    {
      feature: 'Placement Drive Workflow',
      legacy: 'Fragmented WhatsApp links & messy Google Sheets',
      placify: 'Visual Kanban pipeline with past company prep kits',
    },
    {
      feature: '1v1 Peer Mock Practice',
      legacy: 'Manual Zoom links & external code copy-pasting',
      placify: 'Automated matching with live shared code sandbox',
    },
    {
      feature: 'Faculty Course Pace Tracking',
      legacy: 'Static PDF syllabus with zero live progress feedback',
      placify: 'Dynamic Recharts vs Target charts + AI Quiz Creator',
    },
    {
      feature: 'Gradebook & CSV Export',
      legacy: 'Clunky legacy portals with manual entry risk',
      placify: 'Digital Grade Vault with 1-click CSV campus export',
    },
    {
      feature: 'PhD Advisor Sync & Grants',
      legacy: 'Untracked verbal notes & lost email receipts',
      placify: 'Timestamped logbooks & SERB grant claim tracker',
    },
    {
      feature: 'AI Assistance Engine',
      legacy: 'Generic public LLM with zero academic context',
      placify: 'Role-Aware Gemini AI tuned for coding & citations',
    },
  ]

  return (
    <section id="comparison" className="py-20 px-6 max-w-7xl mx-auto border-t border-border/40 relative z-20 space-y-12">
      <div className="text-center space-y-3">
        <span className="px-4 py-1.5 rounded-full bg-accent/15 text-accent-light text-xs font-mono font-bold border border-accent/30 shadow-sm uppercase tracking-wider">
          THE PLACIFY ADVANTAGE
        </span>
        <h2 className="text-3xl sm:text-5xl font-black text-text-primary">
          Legacy Clunky LMS vs. Placify Academic OS
        </h2>
        <p className="text-xs sm:text-base text-text-secondary max-w-xl mx-auto font-medium">
          See why top engineering universities choose Placify for friction-free academic execution.
        </p>
      </div>

      <div className="max-w-5xl mx-auto rounded-3xl bg-surface/90 border border-border-subtle overflow-hidden shadow-2xl backdrop-blur-2xl">
        <div className="grid grid-cols-12 bg-base/80 p-5 border-b border-border-subtle text-xs font-black uppercase tracking-wider text-text-muted">
          <div className="col-span-4">Capability</div>
          <div className="col-span-4 text-semantic-red">Legacy LMS / Spreadsheets</div>
          <div className="col-span-4 text-accent-light">Placify Academic OS ⚡</div>
        </div>

        <div className="divide-y divide-border-subtle/60">
          {points.map((row, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: idx * 0.05 }}
              className="grid grid-cols-12 p-5 text-xs sm:text-sm items-center hover:bg-hover/40 transition-colors"
            >
              <div className="col-span-4 font-bold text-text-primary">
                {row.feature}
              </div>

              <div className="col-span-4 text-text-muted flex items-start gap-2 pr-3">
                <X className="h-4 w-4 text-semantic-red shrink-0 mt-0.5" />
                <span>{row.legacy}</span>
              </div>

              <div className="col-span-4 text-text-primary font-semibold flex items-start gap-2 pl-2">
                <Check className="h-4 w-4 text-semantic-green shrink-0 mt-0.5" />
                <span className="bg-gradient-to-r from-accent-light via-cyan-400 to-white bg-clip-text text-transparent font-bold">
                  {row.placify}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
