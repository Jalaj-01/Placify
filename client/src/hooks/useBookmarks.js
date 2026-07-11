import { useState, useEffect } from 'react'
import { subscribeBookmarks, addBookmarkDoc, updateBookmarkDoc, deleteBookmarkDoc } from '@/services/firestoreService'

export function useBookmarks(uid) {
  const [bookmarks, setBookmarks] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!uid) {
      setBookmarks([])
      setLoading(false)
      return
    }
    return subscribeBookmarks(uid, (data) => {
      setBookmarks(data)
      setLoading(false)
    })
  }, [uid])

  return {
    bookmarks,
    loading,
    addBookmark: (title, url, category, description, tags) => 
      addBookmarkDoc(uid, title, url, category, description, tags),
    updateBookmark: (bookmarkId, data) => 
      updateBookmarkDoc(uid, bookmarkId, data),
    deleteBookmark: (bookmarkId) => 
      deleteBookmarkDoc(uid, bookmarkId),
  }
}
