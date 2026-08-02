import { useState } from 'react'
import { motion } from 'framer-motion'
import { Check, ArrowRight, Zap, ShieldCheck, Sparkles } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'

export default function Pricing() {
  const { user, signInWithGoogle } = useAuth()
  const navigate = useNavigate()
  const [billingCycle, setBillingCycle] = useState('individual') // 'individual' | 'campus'

  const handleStart = () => {
    if (user) {
      navigate('/dashboard')
    } else {
      signInWithGoogle()
    }
  }

  const tiers = [
    {
      name: 'Starter Candidate',
      badge: 'Free Forever',
      price: '$0',
      description: 'Ideal for individual students preparing for campus placement drives and DSA rounds.',
      features: [
        'Placement Application Kanban Board',
        '1v1 Peer Mock Interview Matcher',
        'Distraction-Free Course Theater',
        'WebAssembly Python & JS Code Playground',
        'Resource Library (Offline Base64 Storage)',
      ],
      cta: 'Get Started Free',
      highlighted: false,
    },
    {
      name: 'Pro Candidate & Mentor',
      badge: 'Most Popular',
      price: billingCycle === 'individual' ? '$9' : '$49',
      period: '/ month',
      description: 'Full superpower suite for serious job candidates, course faculty, and PhD research scholars.',
      features: [
        'Everything in Starter Tier',
        'Universal Gemini 2.5 AI Coach & Drawer',
        'Faculty Course Pace Charts & AI Quiz Generator',
        'Digital Gradebook Vault with 1-Click CSV Export',
        'PhD Supervisor Logbook & Grant Expense Claims',
        'Automated Subject Radar & Competency Index',
      ],
      cta: 'Launch Pro Console',
      highlighted: true,
    },
    {
      name: 'University Campus License',
      badge: 'Enterprise',
      price: 'Custom',
      description: 'Complete institutional deployment for engineering colleges and university departments.',
      features: [
        'Unlimited Students, Faculty & PhD Scholars',
        'Google Workspace & SSO Integration',
        'Custom Faculty Verification Codes (TEACHER2026)',
        'Institution Placement Cell Analytics Dashboard',
        '24/7 Priority SLA & Dedicated Account Manager',
      ],
      cta: 'Contact Campus Desk',
      highlighted: false,
    },
  ]

  return (
    <section id="pricing" className="py-20 px-6 max-w-7xl mx-auto border-t border-border/40 relative z-20 space-y-12">
      {/* Section Header */}
      <div className="text-center space-y-3">
        <span className="px-4 py-1.5 rounded-full bg-accent/15 text-accent-light text-xs font-mono font-bold border border-accent/30 shadow-sm uppercase tracking-wider">
          TRANSPARENT ACCESS TIERS
        </span>
        <h2 className="text-3xl sm:text-5xl font-black text-text-primary">
          Simple Pricing for Students & Institutions
        </h2>
        <p className="text-xs sm:text-base text-text-secondary max-w-xl mx-auto font-medium">
          Start 100% free with Google authentication. Upgrade anytime for advanced AI workflows.
        </p>
      </div>

      {/* Toggle */}
      <div className="flex justify-center gap-2 p-1.5 rounded-2xl bg-surface/80 border border-border-subtle max-w-xs mx-auto backdrop-blur-xl shadow-xl">
        <button
          onClick={() => setBillingCycle('individual')}
          className={`px-5 py-2 rounded-xl text-xs font-extrabold transition-all ${
            billingCycle === 'individual'
              ? 'bg-accent text-white shadow-md shadow-accent/25'
              : 'text-text-muted hover:text-text-primary'
          }`}
        >
          Individual License
        </button>
        <button
          onClick={() => setBillingCycle('campus')}
          className={`px-5 py-2 rounded-xl text-xs font-extrabold transition-all ${
            billingCycle === 'campus'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-600/25'
              : 'text-text-muted hover:text-text-primary'
          }`}
        >
          Campus License
        </button>
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {tiers.map((tier, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: idx * 0.1 }}
            className={`relative p-8 rounded-3xl bg-surface/90 border transition-all duration-300 shadow-2xl backdrop-blur-2xl flex flex-col justify-between space-y-6 ${
              tier.highlighted
                ? 'border-accent ring-2 ring-accent/50 shadow-accent/20 bg-gradient-to-b from-accent/10 via-surface to-surface'
                : 'border-border-subtle hover:border-accent/40'
            }`}
          >
            {tier.highlighted && (
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-accent to-cyan-500 text-white text-[10px] font-black uppercase tracking-wider shadow-lg flex items-center gap-1">
                <Sparkles className="h-3 w-3" /> Most Popular
              </div>
            )}

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-black text-text-primary text-xl">{tier.name}</h3>
                <span className="px-2.5 py-0.5 rounded-full bg-hover text-text-secondary text-[11px] font-mono font-bold border border-border-subtle">
                  {tier.badge}
                </span>
              </div>

              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-black text-text-primary tracking-tight">{tier.price}</span>
                {tier.period && <span className="text-text-muted text-xs font-bold">{tier.period}</span>}
              </div>

              <p className="text-xs text-text-secondary leading-relaxed font-medium">
                {tier.description}
              </p>

              <div className="pt-4 border-t border-border-subtle space-y-3">
                {tier.features.map((feat, fIdx) => (
                  <div key={fIdx} className="flex items-start gap-2 text-xs font-medium text-text-primary">
                    <Check className="h-4 w-4 text-semantic-green shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            <Button
              onClick={handleStart}
              className={`w-full py-6 rounded-2xl font-black text-xs transition-all flex items-center justify-center gap-2 ${
                tier.highlighted
                  ? 'bg-gradient-to-r from-accent via-indigo-600 to-cyan-500 hover:opacity-95 text-white shadow-xl shadow-accent/25 border border-white/20'
                  : 'bg-hover hover:bg-surface text-text-primary border border-border-subtle'
              }`}
            >
              <span>{tier.cta}</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
