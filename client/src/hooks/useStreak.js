import { useState, useEffect } from 'react'
import { subscribeProfile } from '@/services/firestoreService'

export function useStreak(uid) {
  const [streakData, setStreakData] = useState({
    currentStreak: 0, longestStreak: 0, lastActiveDate: null, activityLog: [],
  })

  useEffect(() => {
    if (!uid) return
    return subscribeProfile(uid, (profile) => {
      if (profile?.streakData) setStreakData(profile.streakData)
    })
  }, [uid])

  return { streakData }
}
