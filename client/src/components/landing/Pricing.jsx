import { useState } from 'react'
import { motion } from 'framer-motion'
import { Check, ArrowRight, Sparkles, Building2, User } from 'lucide-react'
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
      name: 'Starter Student',
      badge: 'Free Forever',
      price: '$0',
      description: 'Everything an individual candidate needs to prepare for campus recruitment and DSA OA rounds.',
      features: [
        'Placement Application Kanban Board',
        'Coding Problem Log & Radar Competency',
        'Masterclass DSA Lab & Step Visualizer',
        '1v1 Peer Mock Practice & Study Rooms',
        'Resource Library & Classroom Vault',
      ],
      cta: 'Get Started Free',
      highlighted: false,
    },
    {
      name: 'Pro Candidate & Mentor',
      badge: 'Most Popular',
      price: billingCycle === 'individual' ? '$9' : '$49',
      period: '/ month',
      description: 'Advanced AI mock coaching, automated grading, and priority multi-user collaboration.',
      features: [
        'Everything in Starter Student',
        'Universal Gemini AI Placement Coach',
        'Automated Mock OA Interview Evaluations',
        'Faculty Course Syllabus Pace Barometer',
        'Digital Gradebook Vault with 1-Click CSV Export',
        'PhD Supervisor Logbook & Milestones',
      ],
      cta: 'Launch Pro Console',
      highlighted: true,
    },
    {
      name: 'University Campus License',
      badge: 'Institutional',
      price: 'Custom',
      description: 'End-to-end institutional deployment for placement cells, departments, and entire campuses.',
      features: [
        'Unlimited Students, Faculty & Research Scholars',
        'University Single Sign-On (Google Workspace & SAML)',
        'Placement Cell Central Analytics Command',
        'Verified Faculty Code Generation & Admin Audits',
        '24/7 Dedicated Campus Support & Custom SLA',
      ],
      cta: 'Contact Campus Desk',
      highlighted: false,
    },
  ]

  return (
    <section id="pricing" className="py-16 px-4 sm:px-8 max-w-7xl mx-auto relative z-20 space-y-10">
      {/* Section Header */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <span className="px-3.5 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold uppercase tracking-wider">
          Transparent Access
        </span>
        <h2 className="text-3xl sm:text-5xl font-extrabold text-[#20242b] tracking-tight">
          Simple Pricing for Students & Institutions
        </h2>
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
          Start free with Google authentication. Scale smoothly as your placement prep or campus needs grow.
        </p>
      </div>

      {/* Pill Toggle */}
      <div className="flex justify-center">
        <div className="inline-flex items-center gap-1 p-1 rounded-2xl bg-white/90 border border-slate-200/90 shadow-sm backdrop-blur-xl">
          <button
            onClick={() => setBillingCycle('individual')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              billingCycle === 'individual'
                ? 'bg-[#20242b] text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <User className="h-3.5 w-3.5" />
            <span>Individual Student</span>
          </button>
          <button
            onClick={() => setBillingCycle('campus')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              billingCycle === 'campus'
                ? 'bg-[#20242b] text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Building2 className="h-3.5 w-3.5" />
            <span>University Campus</span>
          </button>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {tiers.map((tier, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: idx * 0.1 }}
            className={`relative p-7 sm:p-8 rounded-[28px] bg-white/90 border transition-all duration-300 shadow-[0_12px_36px_rgba(31,41,55,0.06)] backdrop-blur-xl flex flex-col justify-between space-y-6 ${
              tier.highlighted
                ? 'border-indigo-400 ring-2 ring-indigo-500/20 shadow-[0_16px_48px_rgba(99,102,241,0.12)]'
                : 'border-white/95 hover:border-slate-200'
            }`}
          >
            {tier.highlighted && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3.5 py-1 rounded-full bg-[#20242b] text-white text-[10px] font-extrabold uppercase tracking-wider shadow-md flex items-center gap-1">
                <Sparkles className="h-3 w-3 text-purple-400" /> Most Popular
              </div>
            )}

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-extrabold text-[#20242b] text-xl m-0">{tier.name}</h3>
                <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold border border-slate-200">
                  {tier.badge}
                </span>
              </div>

              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-black text-[#20242b] tracking-tight">{tier.price}</span>
                {tier.period && <span className="text-slate-500 text-xs font-bold">{tier.period}</span>}
              </div>

              <p className="text-xs text-slate-600 leading-relaxed font-normal">
                {tier.description}
              </p>

              <div className="pt-4 border-t border-slate-100 space-y-2.5">
                {tier.features.map((feat, fIdx) => (
                  <div key={fIdx} className="flex items-start gap-2.5 text-xs text-slate-700">
                    <Check className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            <Button
              onClick={handleStart}
              className={`w-full py-5 rounded-2xl font-extrabold text-xs transition-all flex items-center justify-center gap-2 ${
                tier.highlighted
                  ? 'bg-[#20242b] hover:bg-black text-white shadow-md'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
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
