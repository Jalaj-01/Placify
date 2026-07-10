import { useState, useEffect } from 'react'
import { subscribeProblems, addProblem, updateProblem, deleteProblem, importCompanyKit } from '@/services/firestoreService'

export function useProblems(uid) {
  const [problems, setProblems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!uid) { setLoading(false); return }
    return subscribeProblems(uid, (data) => {
      setProblems(data)
      setLoading(false)
    })
  }, [uid])

  return {
    problems,
    loading,
    addProblem: (data) => addProblem(uid, data),
    updateProblem: (id, data) => updateProblem(uid, id, data),
    deleteProblem: (id) => deleteProblem(uid, id),
    importCompanyKit: (kitName) => importCompanyKit(uid, kitName),
  }
}
