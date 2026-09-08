import {
  collection, doc, getDoc, getDocs, setDoc, addDoc, updateDoc, deleteDoc,
  query, orderBy, onSnapshot, serverTimestamp, Timestamp, where, collectionGroup, writeBatch
} from 'firebase/firestore'
import { db } from '@/config/firebase'
import { isSuperAdmin } from '@/config/adminConfig'

// ─── Teacher Whitelist Management ──────────────────────────────

/**
 * Check if an email has been pre-authorized as a Teacher
 */
export async function checkTeacherAuthorization(email) {
  if (!email) return null
  const cleanEmail = email.toLowerCase().trim()
  try {
    const q = query(
      collection(db, 'authorized_teachers'),
      where('email', '==', cleanEmail)
    )
    const snap = await getDocs(q)
    if (!snap.empty) {
      const docData = snap.docs[0].data()
      return { id: snap.docs[0].id, ...docData }
    }
    return null
  } catch (err) {
    console.warn('checkTeacherAuthorization error:', err)
    return null
  }
}

/**
 * Pre-authorize a new teacher by email
 */
export async function addAuthorizedTeacher(adminUser, { email, name = '', department = 'Computer Science & Engineering', designation = 'Faculty Member', notes = '' }) {
  if (!email) throw new Error('Email is required')
  const cleanEmail = email.toLowerCase().trim()

  // 1. Check if already exists in whitelist
  const existing = await checkTeacherAuthorization(cleanEmail)
  if (existing) {
    throw new Error('This email is already on the authorized teacher list.')
  }

  // 2. Add to authorized_teachers collection
  const teacherRef = await addDoc(collection(db, 'authorized_teachers'), {
    email: cleanEmail,
    name: name.trim() || 'Faculty Member',
    department: department.trim(),
    designation: designation.trim(),
    notes: notes.trim(),
    addedBy: adminUser?.email || 'admin',
    addedAt: serverTimestamp(),
    status: 'active',
  })

  // 3. Check if user already has an account registered; if so, upgrade role immediately
  try {
    const userQ = query(
      collectionGroup(db, 'profile'),
      where('email', '==', cleanEmail)
    )
    const userSnap = await getDocs(userQ)
    if (!userSnap.empty) {
      const profileDoc = userSnap.docs[0]
      await updateDoc(profileDoc.ref, {
        role: 'teacher',
        department: department.trim(),
        verifiedTeacher: true,
        updatedAt: serverTimestamp(),
      })
    }
  } catch (profileErr) {
    console.warn('Auto-upgrade existing user profile notice:', profileErr)
  }

  // 4. Log to audit trail
  await recordAuditLog(adminUser, 'TEACHER_WHITELIST_ADD', {
    teacherEmail: cleanEmail,
    department,
    designation,
  })

  return teacherRef.id
}

/**
 * Bulk pre-authorize multiple teachers by email (supports 100s of teachers in batches)
 * @param {Object} adminUser - currently logged-in admin
 * @param {Array<{ email: string, name?: string, department?: string, designation?: string, notes?: string }>} teacherList
 * @returns {Promise<{ addedCount: number, skippedCount: number, added: Array<string>, skipped: Array<{ email: string, reason: string }> }>}
 */
export async function bulkAddAuthorizedTeachers(adminUser, teacherList = []) {
  if (!teacherList || teacherList.length === 0) {
    return { addedCount: 0, skippedCount: 0, added: [], skipped: [] }
  }

  // 1. Fetch all currently authorized teachers to avoid duplicate writes
  const existingSnap = await getDocs(collection(db, 'authorized_teachers'))
  const existingEmails = new Set(
    existingSnap.docs.map((d) => (d.data().email || '').toLowerCase().trim()).filter(Boolean)
  )

  const added = []
  const skipped = []
  const toInsert = []
  const seenInBatch = new Set()

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  for (const item of teacherList) {
    const rawEmail = (item.email || '').trim().toLowerCase()
    if (!rawEmail || !emailRegex.test(rawEmail)) {
      skipped.push({ email: item.email || 'empty', reason: 'Invalid email format' })
      continue
    }

    if (existingEmails.has(rawEmail)) {
      skipped.push({ email: rawEmail, reason: 'Already in whitelist' })
      continue
    }

    if (seenInBatch.has(rawEmail)) {
      skipped.push({ email: rawEmail, reason: 'Duplicate entry in batch' })
      continue
    }

    seenInBatch.add(rawEmail)
    toInsert.push({
      email: rawEmail,
      name: (item.name || '').trim() || rawEmail.split('@')[0],
      department: (item.department || '').trim() || 'Computer Science & Engineering',
      designation: (item.designation || '').trim() || 'Faculty Member',
      notes: (item.notes || '').trim() || 'Bulk authorized',
    })
  }

  if (toInsert.length === 0) {
    return { addedCount: 0, skippedCount: skipped.length, added: [], skipped }
  }

  // 2. Commit in Firestore batches (max 450 per batch)
  const CHUNK_SIZE = 450
  for (let i = 0; i < toInsert.length; i += CHUNK_SIZE) {
    const chunk = toInsert.slice(i, i + CHUNK_SIZE)
    const batch = writeBatch(db)

    for (const t of chunk) {
      const docRef = doc(collection(db, 'authorized_teachers'))
      batch.set(docRef, {
        email: t.email,
        name: t.name,
        department: t.department,
        designation: t.designation,
        notes: t.notes,
        addedBy: adminUser?.email || 'admin',
        addedAt: serverTimestamp(),
        status: 'active',
      })
      added.push(t.email)
    }

    await batch.commit()
  }

  // 3. Auto-upgrade any existing profiles for these emails
  try {
    for (const email of added) {
      const userQ = query(
        collectionGroup(db, 'profile'),
        where('email', '==', email)
      )
      const userSnap = await getDocs(userQ)
      if (!userSnap.empty) {
        const profileDoc = userSnap.docs[0]
        await updateDoc(profileDoc.ref, {
          role: 'teacher',
          verifiedTeacher: true,
          updatedAt: serverTimestamp(),
        })
      }
    }
  } catch (err) {
    console.warn('Auto-upgrade existing profiles during bulk authorization notice:', err)
  }

  // 4. Log bulk operation to audit trail
  await recordAuditLog(adminUser, 'TEACHER_WHITELIST_BULK_ADD', {
    count: added.length,
    sampleEmails: added.slice(0, 10),
    skippedCount: skipped.length,
  })

  return {
    addedCount: added.length,
    skippedCount: skipped.length,
    added,
    skipped,
  }
}

/**
 * Revoke teacher authorization and optionally downgrade role to student
 */
export async function removeAuthorizedTeacher(adminUser, teacherDocId, teacherEmail) {
  if (!teacherDocId) return
  const cleanEmail = (teacherEmail || '').toLowerCase().trim()

  // 1. Delete whitelist document
  await deleteDoc(doc(db, 'authorized_teachers', teacherDocId))

  // 2. If user exists, downgrade back to student (unless they are super-admin)
  if (cleanEmail && !isSuperAdmin(cleanEmail)) {
    try {
      const userQ = query(
        collectionGroup(db, 'profile'),
        where('email', '==', cleanEmail)
      )
      const userSnap = await getDocs(userQ)
      if (!userSnap.empty) {
        const profileDoc = userSnap.docs[0]
        await updateDoc(profileDoc.ref, {
          role: 'student',
          verifiedTeacher: false,
          updatedAt: serverTimestamp(),
        })
      }
    } catch (err) {
      console.warn('Failed to downgrade revoked teacher profile:', err)
    }
  }

  // 3. Log to audit trail
  await recordAuditLog(adminUser, 'TEACHER_WHITELIST_REMOVE', {
    teacherEmail: cleanEmail,
    teacherDocId,
  })
}

/**
 * Real-time listener for authorized teachers
 */
export function subscribeAuthorizedTeachers(callback) {
  try {
    const q = query(collection(db, 'authorized_teachers'), orderBy('addedAt', 'desc'))
    return onSnapshot(
      q,
      (snap) => {
        callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
      },
      (err) => {
        console.warn('subscribeAuthorizedTeachers orderBy fallback:', err)
        // Fallback without ordering
        return onSnapshot(collection(db, 'authorized_teachers'), (snap) => {
          const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
          list.sort((a, b) => (b.addedAt?.seconds || 0) - (a.addedAt?.seconds || 0))
          callback(list)
        })
      }
    )
  } catch {
    return onSnapshot(collection(db, 'authorized_teachers'), (snap) => {
      callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    })
  }
}

// ─── User Management & Moderation ──────────────────────────────

/**
 * Fetch all user profiles from Firestore
 */
export async function fetchAllUsers() {
  try {
    const snap = await getDocs(collectionGroup(db, 'profile'))
    const users = []

    snap.docs.forEach((d) => {
      const data = d.data()
      // doc is at users/{uid}/profile/main or similar subcollection
      const uid = d.ref.parent?.parent?.id || d.id
      users.push({
        uid,
        docId: d.id,
        docPath: d.ref.path,
        displayName: data.displayName || 'Anonymous User',
        email: data.email || '',
        photoURL: data.photoURL || '',
        role: data.role || (isSuperAdmin(data.email) ? 'admin' : 'student'),
        department: data.department || 'N/A',
        isBlocked: !!data.isBlocked,
        blockReason: data.blockReason || '',
        blockedAt: data.blockedAt?.toDate ? data.blockedAt.toDate().toISOString() : null,
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : null,
        streakData: data.streakData || {},
        totalSolved: (data.streakData?.activityLog || []).length,
        currentStreak: data.streakData?.currentStreak || 0,
      })
    })

    return users
  } catch (err) {
    console.error('fetchAllUsers error:', err)
    throw err
  }
}

/**
 * Update a user's role manually (Student, Teacher, PhD, Admin)
 */
export async function updateUserRole(adminUser, targetUid, newRole, targetEmail = '', docPath = null) {
  if (!targetUid && !docPath) return
  const profileRef = docPath ? doc(db, docPath) : doc(db, 'users', targetUid, 'profile', 'main')

  await setDoc(
    profileRef,
    {
      role: newRole,
      verifiedTeacher: newRole === 'teacher',
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  )

  await recordAuditLog(adminUser, 'USER_ROLE_CHANGE', {
    targetUid,
    targetEmail,
    newRole,
  })
}

/**
 * Block or Unblock a user
 */
export async function toggleUserBlock(adminUser, targetUid, isBlocked, reason = '', targetEmail = '', docPath = null) {
  if (!targetUid && !docPath) return
  const profileRef = docPath ? doc(db, docPath) : doc(db, 'users', targetUid, 'profile', 'main')

  await setDoc(
    profileRef,
    {
      isBlocked: !!isBlocked,
      blockReason: isBlocked ? (reason.trim() || 'Suspended by platform administrator') : '',
      blockedAt: isBlocked ? serverTimestamp() : null,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  )

  await recordAuditLog(adminUser, isBlocked ? 'USER_BLOCKED' : 'USER_UNBLOCKED', {
    targetUid,
    targetEmail,
    reason: reason.trim(),
  })
}

/**
 * Delete a user profile and all associated profile documents
 */
export async function deleteUserProfile(adminUser, targetUid, targetEmail = '', docId = null, docPath = null) {
  if (!targetUid && !targetEmail && !docPath) return

  let deletedCount = 0
  let lastError = null

  // 1. Delete direct document path if provided
  if (docPath) {
    try {
      await deleteDoc(doc(db, docPath))
      deletedCount++
    } catch (e) {
      console.warn('deleteDoc docPath notice:', e)
      lastError = e
    }
  }

  // 2. Delete /users/{targetUid}/profile/{docId || 'main'}
  if (targetUid) {
    try {
      await deleteDoc(doc(db, 'users', targetUid, 'profile', docId || 'main'))
      deletedCount++
    } catch (e) {
      console.warn('deleteDoc docId notice:', e)
      if (!lastError) lastError = e
    }
  }

  // 3. Delete all documents in /users/{targetUid}/profile subcollection
  if (targetUid) {
    try {
      const snap = await getDocs(collection(db, 'users', targetUid, 'profile'))
      if (!snap.empty) {
        const batch = writeBatch(db)
        snap.docs.forEach((d) => batch.delete(d.ref))
        await batch.commit()
        deletedCount += snap.size
      }
    } catch (e) {
      console.warn('delete profile subcollection notice:', e)
      if (!lastError) lastError = e
    }
  }

  // 4. Delete any profile doc matching targetEmail across collectionGroup
  if (targetEmail) {
    try {
      const cleanEmail = targetEmail.toLowerCase().trim()
      const emailQ = query(collectionGroup(db, 'profile'), where('email', '==', cleanEmail))
      const emailSnap = await getDocs(emailQ)
      if (!emailSnap.empty) {
        const batch = writeBatch(db)
        emailSnap.docs.forEach((d) => batch.delete(d.ref))
        await batch.commit()
        deletedCount += emailSnap.size
      }
    } catch (e) {
      console.warn('delete by email collectionGroup notice:', e)
      if (!lastError) lastError = e
    }
  }

  // 5. Delete top-level /users/{targetUid} doc if present
  if (targetUid) {
    try {
      await deleteDoc(doc(db, 'users', targetUid))
    } catch (e) {
      // ignore
    }
  }

  // 6. If user was on authorized_teachers whitelist, remove from whitelist too
  if (targetEmail) {
    try {
      const teacherQ = query(collection(db, 'authorized_teachers'), where('email', '==', targetEmail.toLowerCase().trim()))
      const teacherSnap = await getDocs(teacherQ)
      teacherSnap.docs.forEach(async (td) => {
        try {
          await deleteDoc(td.ref)
        } catch (_) {}
      })
    } catch (e) {
      // ignore
    }
  }

  // 7. Log audit trail
  await recordAuditLog(adminUser, 'USER_DELETED', {
    targetUid,
    targetEmail,
  })

  // If literally no documents could be deleted and an error occurred, throw it
  if (deletedCount === 0 && lastError) {
    throw lastError
  }
}

// ─── System Announcements ──────────────────────────────────────

/**
 * Post a platform-wide announcement
 */
export async function createAnnouncement(adminUser, { title, message, priority = 'info', audience = 'all', expiresAt = null }) {
  if (!title || !message) throw new Error('Title and message are required')

  let expireTimestamp = null
  if (expiresAt) {
    if (expiresAt instanceof Date) {
      expireTimestamp = Timestamp.fromDate(expiresAt)
    } else if (expiresAt.toDate && typeof expiresAt.toDate === 'function') {
      expireTimestamp = expiresAt
    } else {
      const parsed = new Date(expiresAt)
      if (!isNaN(parsed.getTime())) {
        expireTimestamp = Timestamp.fromDate(parsed)
      }
    }
  }

  const ref = await addDoc(collection(db, 'announcements'), {
    title: title.trim(),
    message: message.trim(),
    priority, // 'info' | 'notice' | 'warning' | 'urgent'
    audience, // 'all' | 'student' | 'teacher'
    expiresAt: expireTimestamp,
    createdBy: adminUser?.email || 'admin',
    createdAt: serverTimestamp(),
    active: true,
  })

  await recordAuditLog(adminUser, 'ANNOUNCEMENT_CREATED', {
    announcementId: ref.id,
    title,
    audience,
    priority,
    hasExpiry: !!expireTimestamp,
  })

  return ref.id
}

/**
 * Update an existing platform-wide announcement
 */
export async function updateAnnouncement(adminUser, announcementId, { title, message, priority = 'info', audience = 'all', expiresAt = null, active = true }) {
  if (!announcementId) throw new Error('Announcement ID is required')
  if (!title || !message) throw new Error('Title and message are required')

  let expireTimestamp = null
  if (expiresAt) {
    if (expiresAt instanceof Date) {
      expireTimestamp = Timestamp.fromDate(expiresAt)
    } else if (expiresAt.toDate && typeof expiresAt.toDate === 'function') {
      expireTimestamp = expiresAt
    } else {
      const parsed = new Date(expiresAt)
      if (!isNaN(parsed.getTime())) {
        expireTimestamp = Timestamp.fromDate(parsed)
      }
    }
  }

  const ref = doc(db, 'announcements', announcementId)
  await updateDoc(ref, {
    title: title.trim(),
    message: message.trim(),
    priority,
    audience,
    expiresAt: expireTimestamp,
    active: active !== false,
    updatedBy: adminUser?.email || 'admin',
    updatedAt: serverTimestamp(),
  })

  await recordAuditLog(adminUser, 'ANNOUNCEMENT_UPDATED', {
    announcementId,
    title,
    audience,
    priority,
    active: active !== false,
    hasExpiry: !!expireTimestamp,
  })
}

/**
 * Delete an announcement
 */
export async function deleteAnnouncement(adminUser, announcementId) {
  if (!announcementId) return
  await deleteDoc(doc(db, 'announcements', announcementId))

  await recordAuditLog(adminUser, 'ANNOUNCEMENT_DELETED', {
    announcementId,
  })
}

/**
 * Subscribe to announcements
 */
export function subscribeAnnouncements(callback) {
  try {
    const q = query(collection(db, 'announcements'), orderBy('createdAt', 'desc'))
    return onSnapshot(
      q,
      (snap) => callback(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
      (err) => {
        console.warn('subscribeAnnouncements fallback:', err)
        return onSnapshot(collection(db, 'announcements'), (snap) => {
          callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
        })
      }
    )
  } catch {
    return onSnapshot(collection(db, 'announcements'), (snap) => {
      callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    })
  }
}

// ─── Audit Trail ───────────────────────────────────────────────

/**
 * Record an audit log entry
 */
export async function recordAuditLog(adminUser, action, details = {}) {
  try {
    await addDoc(collection(db, 'audit_logs'), {
      adminEmail: adminUser?.email || 'system',
      adminUid: adminUser?.uid || 'system',
      action,
      details,
      timestamp: serverTimestamp(),
    })
  } catch (err) {
    console.warn('Failed to record audit log:', err)
  }
}

/**
 * Subscribe to recent audit logs
 */
export function subscribeAuditLogs(callback) {
  try {
    const q = query(collection(db, 'audit_logs'), orderBy('timestamp', 'desc'))
    return onSnapshot(
      q,
      (snap) => callback(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
      (err) => {
        console.warn('subscribeAuditLogs fallback:', err)
        return onSnapshot(collection(db, 'audit_logs'), (snap) => {
          const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
          list.sort((a, b) => (b.timestamp?.seconds || 0) - (a.timestamp?.seconds || 0))
          callback(list)
        })
      }
    )
  } catch {
    return onSnapshot(collection(db, 'audit_logs'), (snap) => {
      callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    })
  }
}
