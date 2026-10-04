import { useEffect, useRef } from 'react'
import { io } from 'socket.io-client'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001'

let socketInstance = null

export function useSocket(uidOrUser, maybeEmail) {
  const socketRef = useRef(null)

  const uid = typeof uidOrUser === 'object' && uidOrUser !== null ? uidOrUser.uid : uidOrUser
  const email = typeof uidOrUser === 'object' && uidOrUser !== null ? uidOrUser.email : maybeEmail

  useEffect(() => {
    if (!socketInstance) {
      socketInstance = io(API_BASE, {
        withCredentials: true,
      })
    }
    
    socketRef.current = socketInstance

    if (uid || email) {
      socketInstance.emit('register', {
        uid: uid || null,
        email: email ? email.trim().toLowerCase() : null,
      })
    }

    return () => {
      // Don't disconnect here if we want global invites to work when they leave a component
    }
  }, [uid, email])

  return socketRef.current
}

export const getSocket = () => socketInstance
