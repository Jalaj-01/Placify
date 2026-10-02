import { motion } from 'framer-motion'
import { useLocation } from 'react-router-dom'
import { useAppStore } from '@/store/useAppStore'
import { cn } from '@/lib/utils'

export default function PageWrapper({ children, fullBleed = false }) {
  const location = useLocation()
  const { sidebarCollapsed, aiCoachOpen } = useAppStore()

  const isFullBleed =
    fullBleed || location.pathname.startsWith('/notes') || location.pathname.startsWith('/notebooks')

  return (
    <motion.main
      key={location.pathname}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={cn(
        'transition-all duration-300 print:!min-h-0 print:!p-0 print:!m-0 print:!pl-0 print:!pr-0 print:!pb-0 print:!pt-0 print:!h-auto print:!overflow-visible',
        sidebarCollapsed ? 'lg:pl-16' : 'lg:pl-60',
        aiCoachOpen && 'lg:pr-[400px]',
        isFullBleed
          ? 'h-screen min-h-screen max-h-screen overflow-hidden flex flex-col pb-0'
          : 'min-h-screen pb-20 lg:pb-0 overflow-x-hidden'
      )}
    >
      <div
        className={cn(
          'w-full print:!p-0 print:!m-0 print:!max-w-none print:!w-full',
          isFullBleed
            ? 'h-full flex-1 flex flex-col p-0 m-0 max-w-none overflow-hidden'
            : 'mx-auto max-w-[1400px] p-3 sm:p-5 md:p-6'
        )}
      >
        {children}
      </div>
    </motion.main>
  )
}
