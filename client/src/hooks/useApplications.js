import { useState, useEffect } from 'react'
import { subscribeApplications, addApplication, updateApplication, deleteApplication } from '@/services/firestoreService'

export function useApplications(uid) {
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!uid) { setLoading(false); return }
    return subscribeApplications(uid, (data) => {
      setApplications(data)
      setLoading(false)
    })
  }, [uid])

  return {
    applications,
    loading,
    addApplication: (data) => addApplication(uid, data),
    updateApplication: (id, data) => updateApplication(uid, id, data),
    deleteApplication: (id) => deleteApplication(uid, id),
  }
}
