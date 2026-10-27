import { useRef } from 'react'
import { motion } from 'framer-motion'

export default function MinimalistAmbientCanvas({ activeStep = 0 }) {
  const containerRef = useRef(null)

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 pointer-events-none overflow-hidden z-0"
      aria-hidden="true"
    >
      {/* ── 1. Soft Dynamic Gradient Mesh Blooms (GPU Accelerated) ─── */}
      {/* Primary Royal Blue (#2563EB) Glow */}
      <motion.div
        animate={{
          x: [0, 30, -25, 0],
          y: [0, -35, 25, 0],
          scale: [1, 1.12, 0.96, 1],
        }}
        transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -top-32 -left-32 w-[580px] h-[580px] rounded-full blur-[100px] opacity-[0.22] dark:opacity-[0.28]"
        style={{
          background: 'radial-gradient(circle, #2563EB 0%, rgba(37, 99, 235, 0) 70%)',
          willChange: 'transform',
          transform: 'translateZ(0)',
        }}
      />

      {/* Accent Golden Yellow (#FACC15) Warm Glow */}
      <motion.div
        animate={{
          x: [0, -40, 30, 0],
          y: [0, 30, -30, 0],
          scale: [1, 1.15, 0.92, 1],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-1/4 -right-36 w-[520px] h-[520px] rounded-full blur-[110px] opacity-[0.18] dark:opacity-[0.22]"
        style={{
          background: 'radial-gradient(circle, #FACC15 0%, rgba(250, 204, 21, 0) 70%)',
          willChange: 'transform',
          transform: 'translateZ(0)',
        }}
      />

      {/* Soft Muted Lavender (#EEF2FF) Glow */}
      <motion.div
        animate={{
          x: [0, 25, -30, 0],
          y: [0, -25, 35, 0],
          scale: [1, 1.08, 0.95, 1],
        }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -bottom-40 left-1/3 w-[560px] h-[560px] rounded-full blur-[120px] opacity-[0.25] dark:opacity-[0.20]"
        style={{
          background: 'radial-gradient(circle, #6366F1 0%, rgba(99, 102, 241, 0) 70%)',
          willChange: 'transform',
          transform: 'translateZ(0)',
        }}
      />

      {/* ── 2. Subtle Geometric Grid Pattern (Minimalist Precision) ───── */}
      <div
        className="absolute inset-0 opacity-[0.035] dark:opacity-[0.06]"
        style={{
          backgroundImage: `
            linear-gradient(to right, #1E1B4B 1px, transparent 1px),
            linear-gradient(to bottom, #1E1B4B 1px, transparent 1px)
          `,
          backgroundSize: '48px 48px',
          maskImage: 'radial-gradient(ellipse 75% 75% at 50% 50%, #000 60%, transparent 100%)',
          WebkitMaskImage: 'radial-gradient(ellipse 75% 75% at 50% 50%, #000 60%, transparent 100%)',
        }}
      />

      {/* ── 3. Floating Minimalist Icons (Palette-matched & GPU smooth) ── */}
      {/* 4-Point Sparkle Star in Primary (#2563EB) - Top Right */}
      <motion.div
        animate={{
          y: [0, -12, 0],
          rotate: [0, 6, -6, 0],
        }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-28 right-[14%] hidden md:block opacity-70"
        style={{ willChange: 'transform', transform: 'translateZ(0)' }}
      >
        <svg width="40" height="40" viewBox="0 0 48 48" fill="none">
          <path
            d="M24 0C24 13.255 13.255 24 0 24C13.255 24 24 34.745 24 48C24 34.745 34.745 24 48 24C34.745 24 24 13.255 24 0Z"
            fill="#2563EB"
          />
        </svg>
      </motion.div>

      {/* Floating Accent Yellow Pill (#FACC15) - Left Mid */}
      <motion.div
        animate={{
          y: [0, 14, 0],
          rotate: [0, -5, 5, 0],
        }}
        transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut', delay: 0.8 }}
        className="absolute top-[45%] left-[8%] hidden lg:flex items-center justify-center w-14 h-9 rounded-full bg-[#FACC15] opacity-85 shadow-[0_8px_20px_rgba(250,204,21,0.25)]"
        style={{ willChange: 'transform', transform: 'translateZ(0)' }}
      >
        <div className="w-4 h-4 rounded-full bg-[#EDEFF4] dark:bg-[#0B0C1A]" />
      </motion.div>

      {/* 4-Petal Flower Symbol in Primary (#2563EB) - Bottom Left */}
      <motion.div
        animate={{
          y: [0, -14, 0],
          rotate: [0, 360],
        }}
        transition={{
          y: { duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 1.5 },
          rotate: { duration: 40, repeat: Infinity, ease: 'linear' },
        }}
        className="absolute bottom-36 left-[12%] hidden md:block opacity-60"
        style={{ willChange: 'transform', transform: 'translateZ(0)' }}
      >
        <svg width="36" height="36" viewBox="0 0 38 38" fill="none">
          <circle cx="13" cy="13" r="8" fill="#2563EB" />
          <circle cx="25" cy="13" r="8" fill="#2563EB" />
          <circle cx="13" cy="25" r="8" fill="#2563EB" />
          <circle cx="25" cy="25" r="8" fill="#2563EB" />
        </svg>
      </motion.div>

      {/* Asterisk / Sunburst in Accent (#FACC15) - Right Bottom */}
      <motion.div
        animate={{
          y: [0, 12, 0],
          scale: [1, 1.06, 1],
        }}
        transition={{ duration: 6.5, repeat: Infinity, ease: 'easeInOut', delay: 0.4 }}
        className="absolute bottom-48 right-[10%] hidden lg:block opacity-75"
        style={{ willChange: 'transform', transform: 'translateZ(0)' }}
      >
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
          <path
            d="M16 2V30M2 16H30M6.1 6.1L25.9 25.9M6.1 25.9L25.9 6.1"
            stroke="#FACC15"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
        </svg>
      </motion.div>

      {/* Crescent Moon in Deep Navy (#1E1B4B / #3B82F6 in dark) - Top Left */}
      <motion.div
        animate={{
          y: [0, -8, 0],
          rotate: [0, 8, 0],
        }}
        transition={{ duration: 7.5, repeat: Infinity, ease: 'easeInOut', delay: 1.2 }}
        className="absolute top-36 left-[15%] hidden md:block opacity-50"
        style={{ willChange: 'transform', transform: 'translateZ(0)' }}
      >
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
          <path
            d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z"
            fill="#2563EB"
          />
        </svg>
      </motion.div>
    </div>
  )
}
