import { useEffect, useState } from 'react'
import { useSocket } from '@/hooks/useSocket'
import { useAuth } from '@/hooks/useAuth'
import { useAppStore } from '@/store/useAppStore'
import { X, UserPlus, Check } from 'lucide-react'

export default function GlobalInviteListener() {
  const { user } = useAuth()
  const socket = useSocket(user?.uid)
  const openGroupStudy = useAppStore(s => s.openGroupStudy)
  const groupStudyOpen = useAppStore(s => s.groupStudyOpen)

  const [invites, setInvites] = useState([])

  useEffect(() => {
    if (!socket) return

    const handleReceiveInvite = (inviteData) => {
      // inviteData = { fromName, roomId }
      setInvites(prev => [...prev, inviteData])
    }

    socket.on('receive-invite', handleReceiveInvite)

    return () => {
      socket.off('receive-invite', handleReceiveInvite)
    }
  }, [socket])

  const handleJoin = (invite) => {
    setInvites(prev => prev.filter(i => i.roomId !== invite.roomId))
    openGroupStudy(invite.roomId)
  }

  const handleDeny = (invite) => {
    setInvites(prev => prev.filter(i => i.roomId !== invite.roomId))
  }

  // Don't show toast if they are already in the study modal, or maybe we still want to so they can switch?
  // Let's just show it.
  
  if (invites.length === 0) return null

  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2">
      {invites.map((invite, idx) => (
        <div key={idx} className="bg-surface border border-accent/40 shadow-2xl shadow-accent/20 rounded-xl p-4 w-80 animate-in slide-in-from-right-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-accent/20 rounded-full flex items-center justify-center">
                <UserPlus className="h-5 w-5 text-accent" />
              </div>
              <div>
                <h4 className="font-bold text-sm">Study Room Invite</h4>
                <p className="text-xs text-text-muted mt-0.5"><span className="text-white font-semibold">{invite.fromName}</span> invited you to collaborate.</p>
              </div>
            </div>
            <button onClick={() => handleDeny(invite)} className="text-text-muted hover:text-white transition-colors">
              <X className="h-4 w-4" />
            </button>
          </div>
          
          <div className="flex gap-2">
            <button 
              onClick={() => handleJoin(invite)}
              className="flex-1 bg-accent hover:bg-accent-light text-white text-xs font-bold py-2 rounded-lg flex items-center justify-center gap-1.5 transition-colors"
            >
              <Check className="h-3 w-3" /> Join Room
            </button>
            <button 
              onClick={() => handleDeny(invite)}
              className="flex-1 bg-white/5 hover:bg-white/10 text-white border border-white/10 text-xs font-bold py-2 rounded-lg transition-colors"
            >
              Decline
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
