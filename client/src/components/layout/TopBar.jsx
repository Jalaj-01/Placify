import { WifiOff } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'

export default function TopBar({ title }) {
  const { isOffline } = useAppStore()

  return (
    <header className="lg:hidden sticky top-0 z-30 border-b border-border-subtle bg-base/95 backdrop-blur-md px-4 py-3">
      <div className="flex items-center justify-between">
        <h1 className="text-section font-semibold">{title}</h1>
        {isOffline && (
          <div className="flex items-center gap-1.5 text-micro text-semantic-yellow">
            <WifiOff className="h-3.5 w-3.5" />
            Offline
          </div>
        )}
      </div>
    </header>
  )
}
