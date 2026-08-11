import { useEffect, useRef } from 'react'
import { io } from 'socket.io-client'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001'

let socketInstance = null

export function useSocket(uid) {
  const socketRef = useRef(null)

  useEffect(() => {
    if (!socketInstance) {
      socketInstance = io(API_BASE, {
        withCredentials: true,
      })
    }
    
    socketRef.current = socketInstance

    if (uid) {
      socketInstance.emit('register', uid)
    }

    return () => {
      // Don't disconnect here if we want global invites to work when they leave a component
    }
  }, [uid])

  return socketRef.current
}

export const getSocket = () => socketInstance
