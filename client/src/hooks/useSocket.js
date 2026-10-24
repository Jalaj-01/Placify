import { useState, useEffect } from 'react'
import { io } from 'socket.io-client'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001'

let socketInstance = null

export const getSocketInstance = () => {
  if (!socketInstance && typeof window !== 'undefined') {
    socketInstance = io(API_BASE, {
      withCredentials: true,
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    })
  }
  return socketInstance
}

export function useSocket(uidOrUser, maybeEmail) {
  const [socket, setSocket] = useState(() => getSocketInstance())

  const uid = typeof uidOrUser === 'object' && uidOrUser !== null ? uidOrUser.uid : uidOrUser
  const email = typeof uidOrUser === 'object' && uidOrUser !== null ? uidOrUser.email : maybeEmail

  useEffect(() => {
    const s = getSocketInstance()
    setSocket(s)

    const doRegister = () => {
      const cleanUid = uid || null
      const cleanEmail = email ? String(email).trim().toLowerCase() : null
      if (cleanUid || cleanEmail) {
        s.emit('register', { uid: cleanUid, email: cleanEmail })
      }
    }

    if (s.connected) {
      doRegister()
    }
    s.on('connect', doRegister)

    return () => {
      s.off('connect', doRegister)
    }
  }, [uid, email])

  return socket
}

export const getSocket = () => getSocketInstance()
