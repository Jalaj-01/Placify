import { useState, useEffect, createContext, useContext } from 'react'
import { onAuthStateChanged, signInWithPopup, signOut as firebaseSignOut } from 'firebase/auth'
import { auth, googleProvider } from '@/config/firebase'
import { getOrCreateProfile, seedTopics } from '@/services/firestoreService'

const AuthContext = createContext({
  user: null,
  profile: null,
  loading: true,
  signInWithGoogle: async () => {},
  signOut: async () => {},
})

export function AuthProvider({ children }) {
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
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Failsafe timer to never leave user stuck on black loading screen
    const safetyTimer = setTimeout(() => {
      setLoading(false)
    }, 2500)

    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      clearTimeout(safetyTimer)
      if (firebaseUser) {
        const sessionObj = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName || 'User',
          photoURL: firebaseUser.photoURL || '',
        }
        setUser(sessionObj)
        try {
          localStorage.setItem('placement_tracker_session', JSON.stringify(sessionObj))
        } catch {}

        try {
          const p = await getOrCreateProfile(firebaseUser)
          setProfile(p)
          try {
            localStorage.setItem('placement_tracker_profile', JSON.stringify(p))
          } catch {}

          if (!p?.onboardingComplete) {
            seedTopics(firebaseUser.uid).catch(console.warn)
          }
        } catch (profileErr) {
          console.warn('Profile fetch fallback:', profileErr)
          const fallbackProfile = {
            displayName: firebaseUser.displayName || 'User',
            email: firebaseUser.email || '',
            role: localStorage.getItem('placify_active_role') || 'student',
            onboardingComplete: true
          }
          setProfile(fallbackProfile)
        }
      } else {
        setUser(null)
        setProfile(null)
        try {
          localStorage.removeItem('placement_tracker_session')
          localStorage.removeItem('placement_tracker_profile')
        } catch {}
      }
      setLoading(false)
    })

    return () => {
      clearTimeout(safetyTimer)
      unsub()
    }
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

  const loginAsDemo = (role = 'teacher') => {
    let sessionObj = {
      uid: 'demo_teacher_arvind',
      email: 'arvind.sharma@placify.edu',
      displayName: 'Dr. Arvind Sharma (Faculty)',
      photoURL: '',
    }
    let profileObj = {
      displayName: 'Dr. Arvind Sharma',
      email: 'arvind.sharma@placify.edu',
      role: 'teacher',
      department: 'Computer Science & Engineering',
      teacherId: 'TEACHER2026',
      verifiedTeacher: true,
      onboardingComplete: true
    }

    if (role === 'student') {
      sessionObj = {
        uid: 'demo_student_rahul',
        email: 'rahul.verma@student.placify.edu',
        displayName: 'Rahul Verma (Student)',
        photoURL: '',
      }
      profileObj = {
        displayName: 'Rahul Verma',
        email: 'rahul.verma@student.placify.edu',
        role: 'student',
        rollNumber: '22CS104',
        onboardingComplete: true
      }
    } else if (role === 'phd') {
      sessionObj = {
        uid: 'demo_phd_maya',
        email: 'maya.sen@phd.placify.edu',
        displayName: 'Dr. Maya Sen (PhD Scholar)',
        photoURL: '',
      }
      profileObj = {
        displayName: 'Dr. Maya Sen',
        email: 'maya.sen@phd.placify.edu',
        role: 'phd',
        department: 'AI & Neural Systems Lab',
        onboardingComplete: true
      }
    }

    setUser(sessionObj)
    setProfile(profileObj)
    setLoading(false)
    try {
      localStorage.setItem('placement_tracker_session', JSON.stringify(sessionObj))
      localStorage.setItem('placement_tracker_profile', JSON.stringify(profileObj))
      localStorage.setItem('placify_active_role', role)
    } catch {}
    window.dispatchEvent(new Event('placify-role-change'))
  }

  const signOut = async () => {
    try {
      await firebaseSignOut(auth)
    } catch {}
    setUser(null)
    setProfile(null)
    localStorage.removeItem('placement_tracker_session')
    localStorage.removeItem('placement_tracker_profile')
    localStorage.removeItem('placify_active_role')
  }

  return (
    <AuthContext.Provider value={{ user, profile, loading, signInWithGoogle, loginAsDemo, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
