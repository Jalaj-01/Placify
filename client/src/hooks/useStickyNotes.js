import { useState, useEffect } from 'react'
import {
  subscribeStickyNotes,
  addStickyNote as firestoreAddNote,
  updateStickyNote as firestoreUpdateNote,
  deleteStickyNote as firestoreDeleteNote,
} from '@/services/firestoreService'

const LOCAL_STORAGE_KEY = 'placify_sticky_notes'

const getLocalNotes = () => {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

const saveLocalNotes = (notes) => {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(notes))
  } catch (err) {
    console.warn('Failed saving sticky notes to local storage', err)
  }
}

export function useStickyNotes(uid) {
  const [notes, setNotes] = useState(() => getLocalNotes())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!uid) {
      setNotes(getLocalNotes())
      setLoading(false)
      return
    }

    const unsub = subscribeStickyNotes(uid, (firestoreNotes) => {
      if (firestoreNotes && firestoreNotes.length >= 0) {
        setNotes(firestoreNotes)
        saveLocalNotes(firestoreNotes)
      }
      setLoading(false)
    })

    return () => unsub()
  }, [uid])

  const addNote = async (data) => {
    const newNote = {
      id: Date.now().toString(),
      title: data.title || 'Untitled Note',
      content: data.content || '',
      color: data.color || 'yellow',
      isPinned: !!data.isPinned,
      createdAt: new Date().toISOString(),
    }

    // Optimistic local update
    const updated = [newNote, ...notes]
    setNotes(updated)
    saveLocalNotes(updated)

    if (uid) {
      try {
        await firestoreAddNote(uid, data)
      } catch (e) {
        console.warn('Firestore add note error fallback', e)
      }
    }
  }

  const updateNote = async (noteId, updates) => {
    const updated = notes.map((n) => (n.id === noteId ? { ...n, ...updates } : n))
    setNotes(updated)
    saveLocalNotes(updated)

    if (uid) {
      try {
        await firestoreUpdateNote(uid, noteId, updates)
      } catch (e) {
        console.warn('Firestore update note error fallback', e)
      }
    }
  }

  const deleteNote = async (noteId) => {
    const updated = notes.filter((n) => n.id !== noteId)
    setNotes(updated)
    saveLocalNotes(updated)

    if (uid) {
      try {
        await firestoreDeleteNote(uid, noteId)
      } catch (e) {
        console.warn('Firestore delete note error fallback', e)
      }
    }
  }

  return {
    notes,
    loading,
    addNote,
    updateNote,
    deleteNote,
  }
}
