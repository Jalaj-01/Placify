import { useState, useEffect } from 'react'
import { subscribeTopics, updateTopic, addTopic, deleteTopic, deleteCategory, renameCategory, renameCustomSubject, deleteSubjectTopics, subscribeProfile, updateProfile } from '@/services/firestoreService'

export function useTopics(uid) {
  const [topics, setTopics] = useState([])
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!uid) { setLoading(false); return }
    
    const unsubTopics = subscribeTopics(uid, (data) => {
      setTopics(data)
      setLoading(false)
    })

    const unsubProfile = subscribeProfile(uid, (pData) => {
      setProfile(pData)
    })

    return () => {
      unsubTopics()
      unsubProfile()
    }
  }, [uid])

  return {
    topics,
    profile,
    loading,
    updateTopic: (id, data) => updateTopic(uid, id, data),
    addTopic: (data) => addTopic(uid, data),
    deleteTopic: (id) => deleteTopic(uid, id),
    deleteCategory: (categoryName) => deleteCategory(uid, categoryName),
    renameCategory: (oldName, newName) => renameCategory(uid, oldName, newName),
    renameCustomSubject: (oldName, newName) => renameCustomSubject(uid, oldName, newName),
    deleteSubjectTopics: (subjects) => deleteSubjectTopics(uid, subjects),
    updateTabLabel: (tabId, label) => {
      const currentLabels = profile?.tabLabels || {}
      return updateProfile(uid, { tabLabels: { ...currentLabels, [tabId]: label } })
    },
    hideTab: (tabId) => {
      const currentHidden = profile?.hiddenTabs || []
      if (!currentHidden.includes(tabId)) {
        return updateProfile(uid, { hiddenTabs: [...currentHidden, tabId] })
      }
    },
    restoreTab: (tabId) => {
      const currentHidden = profile?.hiddenTabs || []
      return updateProfile(uid, { hiddenTabs: currentHidden.filter(t => t !== tabId) })
    },
    updateCategoryOrder: (subject, newOrder) => {
      const currentOrders = profile?.categoryOrders || {}
      return updateProfile(uid, {
        categoryOrders: {
          ...currentOrders,
          [subject]: newOrder
        }
      })
    }
  }
}
