import { useState, useEffect } from 'react'
import { subscribeTopics, updateTopic, addTopic } from '@/services/firestoreService'

export function useTopics(uid) {
  const [topics, setTopics] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!uid) { setLoading(false); return }
    return subscribeTopics(uid, (data) => {
      setTopics(data)
      setLoading(false)
    })
  }, [uid])

  return {
    topics,
    loading,
    updateTopic: (id, data) => updateTopic(uid, id, data),
    addTopic: (data) => addTopic(uid, data),
  }
}
