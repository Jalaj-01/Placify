import { useState, useEffect } from 'react'
import { onAuthStateChanged, signInWithPopup, signOut as firebaseSignOut } from 'firebase/auth'
import { auth, googleProvider } from '@/config/firebase'
import { getOrCreateProfile, seedTopics } from '@/services/firestoreService'

export function useAuth() {
  // Initialize state from localStorage cache for instant load persistence
  const [user, setUser] = useState(() => {
    try {
      const cached = localStorage.getItem('placement_tracker_session')
      return cached ? JSON.parse(cached) : null
    } catch {
      return null
    }
  })
  const [profile, setProfile] = useState(() => {
    try {
      const cached = localStorage.getItem('placement_tracker_profile')
      return cached ? JSON.parse(cached) : null
    } catch {
      return null
    }
  })
  const [loading, setLoading] = useState(!user) // If user is cached, render interface immediately

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const sessionObj = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
        }
        setUser(sessionObj)
        localStorage.setItem('placement_tracker_session', JSON.stringify(sessionObj))

        const p = await getOrCreateProfile(firebaseUser)
        setProfile(p)
        localStorage.setItem('placement_tracker_profile', JSON.stringify(p))

        if (!p.onboardingComplete) await seedTopics(firebaseUser.uid)
      } else {
        setUser(null)
        setProfile(null)
        localStorage.removeItem('placement_tracker_session')
        localStorage.removeItem('placement_tracker_profile')
      }
      setLoading(false)
    })
    return unsub
  }, [])

  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider)
      if (result?.user) {
        const sessionObj = {
          uid: result.user.uid,
          email: result.user.email,
          displayName: result.user.displayName,
          photoURL: result.user.photoURL,
        }
        setUser(sessionObj)
        localStorage.setItem('placement_tracker_session', JSON.stringify(sessionObj))
      }
    } catch (err) {
      console.error('Google Sign-In Error:', err)
      throw err
    }
  }

  const signOut = async () => {
    await firebaseSignOut(auth)
    setUser(null)
    setProfile(null)
    localStorage.removeItem('placement_tracker_session')
    localStorage.removeItem('placement_tracker_profile')
  }

  return { user, profile, loading, signInWithGoogle, signOut }
}
