import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'

export default function MinimalistAmbientCanvas({ activeStep = 0 }) {
  const containerRef = useRef(null)

  // Floating ambient light blobs and geometric minimalist symbols matching Knowly theme
  return (
    <div
      ref={containerRef}
      className="fixed inset-0 pointer-events-none overflow-hidden z-0"
      aria-hidden="true"
    >
      {/* ── 1. Soft Dynamic Gradient Mesh Blooms ───────────────────────── */}
      {/* Fuchsia Blue (#8450CB) Primary Glow */}
      <motion.div
        animate={{
          x: [0, 40, -30, 0],
          y: [0, -50, 30, 0],
          scale: [1, 1.15, 0.95, 1],
        }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -top-32 -left-32 w-[620px] h-[620px] rounded-full blur-[120px] opacity-[0.28] dark:opacity-[0.32]"
        style={{
          background: 'radial-gradient(circle, #8450CB 0%, rgba(132, 80, 203, 0) 70%)',
        }}
      />

      {/* Philippine Golden Yellow (#EAB901) Warm Glow */}
      <motion.div
        animate={{
          x: [0, -50, 40, 0],
          y: [0, 40, -40, 0],
          scale: [1, 1.2, 0.9, 1],
        }}
        transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-1/4 -right-36 w-[560px] h-[560px] rounded-full blur-[130px] opacity-[0.20] dark:opacity-[0.24]"
        style={{
          background: 'radial-gradient(circle, #EAB901 0%, rgba(234, 185, 1, 0) 70%)',
        }}
      />

      {/* Natural Harmony (#90A994) Sage Mint Glow */}
      <motion.div
        animate={{
          x: [0, 30, -40, 0],
          y: [0, -30, 50, 0],
          scale: [1, 1.1, 0.92, 1],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -bottom-40 left-1/3 w-[600px] h-[600px] rounded-full blur-[140px] opacity-[0.22] dark:opacity-[0.26]"
        style={{
          background: 'radial-gradient(circle, #90A994 0%, rgba(144, 169, 148, 0) 70%)',
        }}
      />

      {/* ── 2. Subtle Geometric Grid Pattern (Minimalist Precision) ───── */}
      <div
        className="absolute inset-0 opacity-[0.035] dark:opacity-[0.05]"
        style={{
          backgroundImage: `
            linear-gradient(to right, #30292F 1px, transparent 1px),
            linear-gradient(to bottom, #30292F 1px, transparent 1px)
          `,
          backgroundSize: '48px 48px',
          maskImage: 'radial-gradient(ellipse 75% 75% at 50% 50%, #000 60%, transparent 100%)',
          WebkitMaskImage: 'radial-gradient(ellipse 75% 75% at 50% 50%, #000 60%, transparent 100%)',
        }}
      />

      {/* ── 3. Floating Knowly-Style Minimalist Icons (Subtle Floating) ── */}
      {/* 4-Point Sparkle Star in Natural Harmony (#90A994) - Top Right */}
      <motion.div
        animate={{
          y: [0, -14, 0],
          rotate: [0, 8, -8, 0],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-28 right-[14%] hidden md:block opacity-60"
      >
        <svg width="42" height="42" viewBox="0 0 48 48" fill="none">
          <path
            d="M24 0C24 13.255 13.255 24 0 24C13.255 24 24 34.745 24 48C24 34.745 34.745 24 48 24C34.745 24 24 13.255 24 0Z"
            fill="#90A994"
          />
        </svg>
      </motion.div>

      {/* Floating Golden Yellow Pill with Hole (#EAB901) - Left Mid */}
      <motion.div
        animate={{
          y: [0, 18, 0],
          rotate: [0, -6, 6, 0],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        className="absolute top-[45%] left-[8%] hidden lg:flex items-center justify-center w-14 h-9 rounded-full bg-[#EAB901] opacity-75 shadow-[0_8px_20px_rgba(234,185,1,0.25)]"
      >
        <div className="w-4 h-4 rounded-full bg-[#FAF5ED] dark:bg-[#010101]" />
      </motion.div>

      {/* 4-Petal Flower Symbol in Fuchsia Blue (#8450CB) - Bottom Left */}
      <motion.div
        animate={{
          y: [0, -16, 0],
          rotate: [0, 360],
        }}
        transition={{
          y: { duration: 9, repeat: Infinity, ease: 'easeInOut', delay: 2 },
          rotate: { duration: 40, repeat: Infinity, ease: 'linear' },
        }}
        className="absolute bottom-36 left-[12%] hidden md:block opacity-55"
      >
        <svg width="38" height="38" viewBox="0 0 38 38" fill="none">
          <circle cx="13" cy="13" r="8" fill="#8450CB" />
          <circle cx="25" cy="13" r="8" fill="#8450CB" />
          <circle cx="13" cy="25" r="8" fill="#8450CB" />
          <circle cx="25" cy="25" r="8" fill="#8450CB" />
        </svg>
      </motion.div>

      {/* Asterisk / Sunburst in Sawdust (#F7E8CF) - Right Bottom */}
      <motion.div
        animate={{
          y: [0, 14, 0],
          scale: [1, 1.08, 1],
        }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
        className="absolute bottom-48 right-[10%] hidden lg:block opacity-70"
      >
        <svg width="34" height="34" viewBox="0 0 32 32" fill="none">
          <path
            d="M16 2V30M2 16H30M6.1 6.1L25.9 25.9M6.1 25.9L25.9 6.1"
            stroke="#F7E8CF"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
        </svg>
      </motion.div>

      {/* Crescent Moon in Fuchsia (#8450CB) - Top Left */}
      <motion.div
        animate={{
          y: [0, -10, 0],
          rotate: [0, 10, 0],
        }}
        transition={{ duration: 8.5, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
        className="absolute top-36 left-[15%] hidden md:block opacity-45"
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
          <path
            d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z"
            fill="#8450CB"
          />
        </svg>
      </motion.div>

      {/* Tiny Sage Sparkle - Mid Right */}
      <motion.div
        animate={{
          scale: [0.8, 1.25, 0.8],
          opacity: [0.3, 0.7, 0.3],
        }}
        transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-[65%] right-[22%] hidden md:block"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path
            d="M12 0L14.5 9.5L24 12L14.5 14.5L12 24L9.5 14.5L0 12L9.5 9.5L12 0Z"
            fill="#90A994"
          />
        </svg>
      </motion.div>
    </div>
  )
}
