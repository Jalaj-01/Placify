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
    // Broadcast event across all components in current window
    window.dispatchEvent(new Event('placify_sticky_notes_changed'))
  } catch (err) {
    console.warn('Failed saving sticky notes to local storage', err)
  }
}

export function useStickyNotes(uid) {
  const [notes, setNotes] = useState(() => getLocalNotes())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Listen for local changes broadcasted from any component instance
    const handleLocalChange = () => {
      setNotes(getLocalNotes())
    }
    window.addEventListener('placify_sticky_notes_changed', handleLocalChange)

    if (!uid) {
      setNotes(getLocalNotes())
      setLoading(false)
      return () => {
        window.removeEventListener('placify_sticky_notes_changed', handleLocalChange)
      }
    }

    const unsub = subscribeStickyNotes(uid, (firestoreNotes) => {
      if (firestoreNotes && firestoreNotes.length > 0) {
        setNotes(firestoreNotes)
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(firestoreNotes))
      }
      setLoading(false)
    })

    return () => {
      unsub()
      window.removeEventListener('placify_sticky_notes_changed', handleLocalChange)
    }
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

    // Optimistic reactive local update across all components
    const current = getLocalNotes()
    const updated = [newNote, ...current.filter((n) => n.id !== newNote.id)]
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
    const current = getLocalNotes()
    const updated = current.map((n) => (n.id === noteId ? { ...n, ...updates } : n))
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
    const current = getLocalNotes()
    const updated = current.filter((n) => n.id !== noteId)
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
