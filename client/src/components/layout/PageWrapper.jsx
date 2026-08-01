import { motion } from 'framer-motion'
import { useLocation } from 'react-router-dom'
import { useAppStore } from '@/store/useAppStore'
import { cn } from '@/lib/utils'

export default function PageWrapper({ children }) {
  const location = useLocation()
  const { sidebarCollapsed, aiCoachOpen } = useAppStore()

  return (
    <motion.main
      key={location.pathname}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={cn(
        'min-h-screen pb-20 lg:pb-0 transition-all duration-300 overflow-x-hidden',
        sidebarCollapsed ? 'lg:pl-16' : 'lg:pl-60',
        aiCoachOpen && 'lg:pr-[400px]'
      )}
    >
      <div className="mx-auto max-w-[1400px] w-full p-3 sm:p-5 md:p-6">
        {children}
      </div>
    </motion.main>
  )
}
