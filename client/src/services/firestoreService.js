import {
  collection, doc, getDoc, getDocs, setDoc, addDoc, updateDoc, deleteDoc,
  query, orderBy, onSnapshot, serverTimestamp, Timestamp, writeBatch, where,
  collectionGroup, arrayUnion,
} from 'firebase/firestore'
import { db } from '@/config/firebase'
import { topicSeeds } from '@/utils/topicSeeds'
import { getTodayString, isYesterday, getNextReviewDate } from '@/utils/dateHelpers'

import { isSuperAdmin } from '@/config/adminConfig'
import { checkTeacherAuthorization } from '@/services/adminService'

const userPath = (uid, sub) => collection(db, 'users', uid, sub)

// ─── Profile ───────────────────────────────────────────────
export async function getOrCreateProfile(user) {
  const ref = doc(db, 'users', user.uid, 'profile', 'main')
  const snap = await getDoc(ref)
  const cleanEmail = (user.email || '').toLowerCase().trim()
  const isAdmin = isSuperAdmin(cleanEmail)

  // Check teacher whitelist if not an admin
  let teacherData = null
  if (!isAdmin && cleanEmail) {
    try {
      teacherData = await checkTeacherAuthorization(cleanEmail)
    } catch (e) {
      console.warn('Teacher whitelist lookup error:', e)
    }
  }

  // Calculate target role
  let targetRole = 'student'
  if (isAdmin) {
    targetRole = 'admin'
  } else if (teacherData) {
    targetRole = 'teacher'
  }

  if (snap.exists()) {
    const existing = snap.data()
    const updates = {}
    let needsUpdate = false

    // Sync role if admin or whitelisted teacher
    if (isAdmin && existing.role !== 'admin') {
      updates.role = 'admin'
      needsUpdate = true
    } else if (teacherData && existing.role !== 'teacher') {
      updates.role = 'teacher'
      updates.department = teacherData.department || existing.department || 'Computer Science & Engineering'
      updates.verifiedTeacher = true
      needsUpdate = true
    }

    if (!existing.onboardingComplete) {
      updates.onboardingComplete = true
      needsUpdate = true
    }

    if (needsUpdate) {
      await updateDoc(ref, { ...updates, updatedAt: serverTimestamp() })
    }

    // Ensure publicUsers directory has active user mapping for instant peer invitations
    if (cleanEmail) {
      setDoc(doc(db, 'publicUsers', cleanEmail), {
        uid: user.uid,
        email: cleanEmail,
        displayName: existing.displayName || user.displayName || cleanEmail.split('@')[0],
        photoURL: existing.photoURL || user.photoURL || null,
        updatedAt: serverTimestamp(),
      }, { merge: true }).catch(() => {})
    }

    return needsUpdate ? { ...existing, ...updates } : existing
  }

  // Brand new profile
  const profile = {
    displayName: user.displayName || '',
    email: user.email || '',
    photoURL: user.photoURL || '',
    role: targetRole,
    department: teacherData?.department || 'Computer Science & Engineering',
    verifiedTeacher: targetRole === 'teacher',
    isBlocked: false,
    streakData: { currentStreak: 0, longestStreak: 0, lastActiveDate: null, activityLog: [] },
    onboardingComplete: true,
    createdAt: serverTimestamp(),
  }
  await setDoc(ref, profile)

  // Mirror to publicUsers collection for instant, zero-index email lookups across accounts
  try {
    if (cleanEmail) {
      await setDoc(doc(db, 'publicUsers', cleanEmail), {
        uid: user.uid,
        email: cleanEmail,
        displayName: user.displayName || cleanEmail.split('@')[0],
        photoURL: user.photoURL || null,
        updatedAt: serverTimestamp(),
      }, { merge: true })
    }
  } catch (err) {
    console.warn('Failed to mirror to publicUsers:', err)
  }

  return profile
}

export async function updateProfile(uid, data) {
  await updateDoc(doc(db, 'users', uid, 'profile', 'main'), data)
}

// ─── Streak ────────────────────────────────────────────────
export async function recordActivity(uid) {
  const ref = doc(db, 'users', uid, 'profile', 'main')
  const snap = await getDoc(ref)
  if (!snap.exists()) return

  const { streakData } = snap.data()
  const today = getTodayString()

  if (streakData.lastActiveDate === today) return

  let currentStreak = 1
  if (streakData.lastActiveDate && isYesterday(streakData.lastActiveDate)) {
    currentStreak = (streakData.currentStreak || 0) + 1
  }

  const longestStreak = Math.max(currentStreak, streakData.longestStreak || 0)
  const activityLog = [...(streakData.activityLog || []), today].slice(-90)

  await updateDoc(ref, {
    streakData: { currentStreak, longestStreak, lastActiveDate: today, activityLog },
  })
}

// ─── Topics ────────────────────────────────────────────────
export async function seedTopics(uid) {
  const ref = userPath(uid, 'topics')
  const existing = await getDocs(ref)
  if (!existing.empty) return

  const batch = writeBatch(db)
  topicSeeds.forEach((seed) => {
    const d = doc(ref)
    batch.set(d, {
      ...seed,
      personalNote: '',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
  })
  await batch.commit()
  await updateProfile(uid, { onboardingComplete: true })
}

export function subscribeTopics(uid, callback) {
  const q = query(userPath(uid, 'topics'), orderBy('createdAt', 'asc'))
  return onSnapshot(
    q,
    (snap) => callback(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
    (err) => {
      console.warn('subscribeTopics Firestore error:', err)
      callback([])
    }
  )
}

export async function updateTopic(uid, topicId, data) {
  await updateDoc(doc(db, 'users', uid, 'topics', topicId), { ...data, updatedAt: serverTimestamp() })
  await recordActivity(uid)
}

export async function deleteTopic(uid, topicId) {
  await deleteDoc(doc(db, 'users', uid, 'topics', topicId))
}

export async function deleteCategory(uid, categoryName) {
  const q = query(userPath(uid, 'topics'), where('category', '==', categoryName))
  const snap = await getDocs(q)
  const batch = writeBatch(db)
  snap.docs.forEach((doc) => {
    batch.delete(doc.ref)
  })
  await batch.commit()
  await recordActivity(uid)
}

export async function renameCategory(uid, oldName, newName) {
  // 1. Batch rename all topics with this category
  const q = query(userPath(uid, 'topics'), where('category', '==', oldName))
  const snap = await getDocs(q)
  const batch = writeBatch(db)
  snap.docs.forEach((d) => {
    batch.update(d.ref, { category: newName, updatedAt: serverTimestamp() })
  })
  await batch.commit()

  // 2. Update categoryOrders in profile — rename the key in all subjects' order arrays
  const profileRef = doc(db, 'users', uid, 'profile', 'main')
  const profileSnap = await getDoc(profileRef)
  const profileData = profileSnap.data() || {}
  const currentOrders = profileData.categoryOrders || {}
  const updatedOrders = {}
  for (const [subject, order] of Object.entries(currentOrders)) {
    updatedOrders[subject] = order.map((name) => (name === oldName ? newName : name))
  }
  await updateDoc(profileRef, { categoryOrders: updatedOrders })
  await recordActivity(uid)
}

export async function renameCustomSubject(uid, oldName, newName) {
  // 1. Batch rename all topics with this subject
  const q = query(userPath(uid, 'topics'), where('subject', '==', oldName))
  const snap = await getDocs(q)
  const batch = writeBatch(db)
  snap.docs.forEach((d) => {
    batch.update(d.ref, { subject: newName, updatedAt: serverTimestamp() })
  })
  await batch.commit()

  // 2. Rename in customSubjects list and categoryOrders key
  const profileRef = doc(db, 'users', uid, 'profile', 'main')
  const profileSnap = await getDoc(profileRef)
  const profileData = profileSnap.data() || {}
  const customSubjects = (profileData.customSubjects || []).map((s) => (s === oldName ? newName : s))
  const currentOrders = profileData.categoryOrders || {}
  const updatedOrders = { ...currentOrders }
  if (updatedOrders[oldName]) {
    updatedOrders[newName] = updatedOrders[oldName]
    delete updatedOrders[oldName]
  }
  await updateDoc(profileRef, { customSubjects, categoryOrders: updatedOrders })
  await recordActivity(uid)
}

export async function deleteSubjectTopics(uid, subjects) {
  for (const subject of subjects) {
    const q = query(userPath(uid, 'topics'), where('subject', '==', subject))
    const snap = await getDocs(q)
    if (snap.docs.length > 0) {
      const batch = writeBatch(db)
      snap.docs.forEach((d) => batch.delete(d.ref))
      await batch.commit()
    }
  }
  await recordActivity(uid)
}

export async function updateCategoryOrder(uid, subject, order) {
  if (subject === 'customSubjects') {
    await updateDoc(doc(db, 'users', uid, 'profile', 'main'), {
      customSubjects: order
    })
  } else {
    const currentOrders = (await getDoc(doc(db, 'users', uid, 'profile', 'main'))).data()?.categoryOrders || {}
    await updateDoc(doc(db, 'users', uid, 'profile', 'main'), {
      categoryOrders: {
        ...currentOrders,
        [subject]: order
      }
    })
  }
}




export async function addTopic(uid, data) {
  const ref = await addDoc(userPath(uid, 'topics'), {
    ...data,
    isPreSeeded: false,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  await recordActivity(uid)
  return ref.id
}

// ─── Problems ──────────────────────────────────────────────
export function subscribeProblems(uid, callback) {
  const q = query(userPath(uid, 'problems'), orderBy('createdAt', 'desc'))
  return onSnapshot(
    q,
    (snap) => callback(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
    (err) => {
      console.warn('subscribeProblems Firestore error:', err)
      callback([])
    }
  )
}

export async function addProblem(uid, data) {
  const now = Timestamp.now()
  let easiness = 2.5
  let repetition = 0
  let interval = 1

  const quality = data.confidenceStatus === 'Green' ? 5 : data.confidenceStatus === 'Yellow' ? 3 : 1
  if (quality >= 3) {
    repetition = 1
    interval = quality === 5 ? 6 : 1
  } else {
    repetition = 0
    interval = 1
  }

  const nextReview = new Date()
  nextReview.setDate(nextReview.getDate() + interval)

  const ref = await addDoc(userPath(uid, 'problems'), {
    ...data,
    easiness,
    repetition,
    interval,
    statusHistory: [{ status: data.confidenceStatus, timestamp: now }],
    lastReviewedDate: now,
    nextReviewDate: Timestamp.fromDate(nextReview),
    createdAt: now,
  })
  await recordActivity(uid)
  return ref.id
}

export async function updateProblem(uid, problemId, data) {
  const updates = { ...data }
  if (data.confidenceStatus) {
    const now = Timestamp.now()
    const snap = await getDoc(doc(db, 'users', uid, 'problems', problemId))
    const currentData = snap.data() || {}
    const history = currentData.statusHistory || []

    let easiness = currentData.easiness !== undefined ? currentData.easiness : 2.5
    let repetition = currentData.repetition !== undefined ? currentData.repetition : 0
    let interval = currentData.interval !== undefined ? currentData.interval : 1

    const quality = data.confidenceStatus === 'Green' ? 5 : data.confidenceStatus === 'Yellow' ? 3 : 1

    if (quality < 3) {
      repetition = 0
      interval = 1
    } else {
      if (repetition === 0) {
        interval = 1
      } else if (repetition === 1) {
        interval = 6
      } else {
        interval = Math.round(interval * easiness)
      }
      repetition += 1
    }

    easiness = easiness + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
    if (easiness < 1.3) easiness = 1.3

    const nextReview = new Date()
    nextReview.setDate(nextReview.getDate() + interval)

    updates.easiness = easiness
    updates.repetition = repetition
    updates.interval = interval
    updates.statusHistory = [...history, { status: data.confidenceStatus, timestamp: now }]
    updates.lastReviewedDate = now
    updates.nextReviewDate = Timestamp.fromDate(nextReview)
  }
  await updateDoc(doc(db, 'users', uid, 'problems', problemId), updates)
  await recordActivity(uid)
}

export async function deleteProblem(uid, problemId) {
  await deleteDoc(doc(db, 'users', uid, 'problems', problemId))
}

const KITS = {
  Google: [
    { title: "Unique Paths", url: "https://leetcode.com/problems/unique-paths", platform: "LeetCode", tag: "DP", difficulty: "Medium", confidenceStatus: "Red" },
    { title: "Word Search", url: "https://leetcode.com/problems/word-search", platform: "LeetCode", tag: "Graphs", difficulty: "Medium", confidenceStatus: "Red" },
    { title: "K Closest Points to Origin", url: "https://leetcode.com/problems/k-closest-points-to-origin", platform: "LeetCode", tag: "Arrays", difficulty: "Medium", confidenceStatus: "Red" }
  ],
  Amazon: [
    { title: "Course Schedule", url: "https://leetcode.com/problems/course-schedule", platform: "LeetCode", tag: "Graphs", difficulty: "Medium", confidenceStatus: "Red" },
    { title: "LRU Cache", url: "https://leetcode.com/problems/lru-cache", platform: "LeetCode", tag: "Linked Lists", difficulty: "Hard", confidenceStatus: "Red" },
    { title: "Rotting Oranges", url: "https://leetcode.com/problems/rotting-oranges", platform: "LeetCode", tag: "Graphs", difficulty: "Medium", confidenceStatus: "Red" }
  ],
  TCS: [
    { title: "Valid Palindrome", url: "https://leetcode.com/problems/valid-palindrome", platform: "LeetCode", tag: "Strings", difficulty: "Easy", confidenceStatus: "Red" },
    { title: "Climbing Stairs", url: "https://leetcode.com/problems/climbing-stairs", platform: "LeetCode", tag: "DP", difficulty: "Easy", confidenceStatus: "Red" },
    { title: "Majority Element", url: "https://leetcode.com/problems/majority-element", platform: "LeetCode", tag: "Arrays", difficulty: "Easy", confidenceStatus: "Red" }
  ]
}

export async function importCompanyKit(uid, kitName) {
  const kitProbs = KITS[kitName]
  if (!kitProbs) return
  const batch = writeBatch(db)
  const ref = userPath(uid, 'problems')
  const now = Timestamp.now()

  kitProbs.forEach((prob) => {
    const d = doc(ref)
    const nextReview = new Date()
    nextReview.setDate(nextReview.getDate() + 1) // Initial SM-2 interval = 1

    batch.set(d, {
      ...prob,
      easiness: 2.5,
      repetition: 0,
      interval: 1,
      statusHistory: [{ status: prob.confidenceStatus, timestamp: now }],
      lastReviewedDate: now,
      nextReviewDate: Timestamp.fromDate(nextReview),
      createdAt: now,
    })
  })
  await batch.commit()
  await recordActivity(uid)
}

// ─── Applications ──────────────────────────────────────────
export function subscribeApplications(uid, callback) {
  const q = query(userPath(uid, 'applications'), orderBy('createdAt', 'desc'))
  return onSnapshot(
    q,
    (snap) => callback(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
    (err) => {
      console.warn('subscribeApplications Firestore error:', err)
      callback([])
    }
  )
}

export async function addApplication(uid, data) {
  const ref = await addDoc(userPath(uid, 'applications'), {
    ...data,
    statusHistory: [{ status: data.status, timestamp: Timestamp.now() }],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  await recordActivity(uid)
  return ref.id
}

export async function updateApplication(uid, appId, data) {
  const updates = { ...data, updatedAt: serverTimestamp() }
  if (data.status) {
    const snap = await getDoc(doc(db, 'users', uid, 'applications', appId))
    const history = snap.data()?.statusHistory || []
    updates.statusHistory = [...history, { status: data.status, timestamp: Timestamp.now() }]
  }
  await updateDoc(doc(db, 'users', uid, 'applications', appId), updates)
  await recordActivity(uid)
}

export async function deleteApplication(uid, appId) {
  await deleteDoc(doc(db, 'users', uid, 'applications', appId))
}

export function subscribeProfile(uid, callback) {
  return onSnapshot(
    doc(db, 'users', uid, 'profile', 'main'),
    (snap) => {
      if (snap.exists()) callback(snap.data())
    },
    (err) => {
      console.warn('subscribeProfile Firestore error:', err)
      callback({})
    }
  )
}

export function subscribePlaygroundFiles(uid, callback) {
  const q = query(collection(db, 'users', uid, 'playground'), orderBy('updatedAt', 'desc'))
  return onSnapshot(
    q,
    (snap) => callback(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
    (err) => {
      console.warn('subscribePlaygroundFiles Firestore error:', err)
      callback([])
    }
  )
}

export async function savePlaygroundFile(uid, fileId, name, code) {
  const ref = fileId
    ? doc(db, 'users', uid, 'playground', fileId)
    : doc(collection(db, 'users', uid, 'playground'))
  await setDoc(ref, {
    name,
    code,
    updatedAt: serverTimestamp(),
  }, { merge: true })
  await recordActivity(uid)
  return ref.id
}

export async function deletePlaygroundFile(uid, fileId) {
  await deleteDoc(doc(db, 'users', uid, 'playground', fileId))
}

// ─── Library ───────────────────────────────────────────────
export function subscribeLibrary(uid, callback) {
  const q = query(userPath(uid, 'library'), orderBy('createdAt', 'desc'))
  return onSnapshot(
    q,
    (snap) => callback(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }))),
    (err) => {
      console.warn('subscribeLibrary Firestore error:', err)
      callback([])
    }
  )
}

export async function addLibraryDoc(uid, name, url, type, size) {
  const ref = collection(db, 'users', uid, 'library')
  const newDoc = await addDoc(ref, {
    name,
    url,
    type,
    size,
    createdAt: serverTimestamp(),
  })
  await recordActivity(uid)
  return newDoc.id
}

export async function deleteLibraryDoc(uid, docId) {
  await deleteDoc(doc(db, 'users', uid, 'library', docId))
}

// ─── Courses ───────────────────────────────────────────────
export function subscribeCourses(uid, callback) {
  const q = query(userPath(uid, 'courses'), orderBy('createdAt', 'desc'))
  return onSnapshot(
    q,
    (snap) => callback(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }))),
    (err) => {
      console.warn('subscribeCourses Firestore error:', err)
      callback([])
    }
  )
}

export async function addCourseDoc(uid, name, url, embedId, isPlaylist) {
  const ref = collection(db, 'users', uid, 'courses')
  const newDoc = await addDoc(ref, {
    name,
    url,
    embedId,
    isPlaylist,
    notes: '',
    createdAt: serverTimestamp(),
  })
  await recordActivity(uid)
  return newDoc.id
}

export async function deleteCourseDoc(uid, courseId) {
  await deleteDoc(doc(db, 'users', uid, 'courses', courseId))
}

export async function updateCourseNotesDoc(uid, courseId, notes) {
  await updateDoc(doc(db, 'users', uid, 'courses', courseId), {
    notes,
    updatedAt: serverTimestamp(),
  })
  await recordActivity(uid)
}

export async function updateCourseProgressDoc(uid, courseId, progress) {
  await updateDoc(doc(db, 'users', uid, 'courses', courseId), {
    progress,
    updatedAt: serverTimestamp(),
  })
  await recordActivity(uid)
}

// ─── Bookmarks ─────────────────────────────────────────────
export function subscribeBookmarks(uid, callback) {
  const q = query(userPath(uid, 'bookmarks'), orderBy('createdAt', 'desc'))
  return onSnapshot(
    q,
    (snap) => callback(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
    (err) => {
      console.warn('subscribeBookmarks Firestore error:', err)
      callback([])
    }
  )
}

export async function addBookmarkDoc(uid, title, url, category, description, tags) {
  const ref = collection(db, 'users', uid, 'bookmarks')
  const newDoc = await addDoc(ref, {
    title,
    url,
    category,
    description,
    tags: tags || [],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  await recordActivity(uid)
  return newDoc.id
}

export async function updateBookmarkDoc(uid, bookmarkId, data) {
  await updateDoc(doc(db, 'users', uid, 'bookmarks', bookmarkId), {
    ...data,
    updatedAt: serverTimestamp(),
  })
  await recordActivity(uid)
}

export async function deleteBookmarkDoc(uid, bookmarkId) {
  await deleteDoc(doc(db, 'users', uid, 'bookmarks', bookmarkId))
}

// ─── Sharing ───────────────────────────────────────────────
export async function findUserByEmail(email, throwOnNotFound = true) {
  if (!email || !email.trim()) {
    if (throwOnNotFound) throw new Error('Email is required')
    return null
  }
  const cleanEmail = email.toLowerCase().trim()
  const rawEmail = email.trim()

  const withTimeout = (promise, ms = 2200) =>
    Promise.race([
      promise,
      new Promise((_, reject) => setTimeout(() => reject(new Error('Lookup timeout')), ms)),
    ])

  // 1. Direct doc lookup in publicUsers (fastest, zero-index required)
  try {
    const snap = await withTimeout(getDoc(doc(db, 'publicUsers', cleanEmail)), 1200)
    if (snap?.exists()) {
      const d = snap.data()
      return { uid: d.uid, email: d.email, displayName: d.displayName }
    }
  } catch (e) {
    // proceed to collectionGroup fallback
  }

  // 2. CollectionGroup lookup on profile (fallback)
  try {
    const lowerQ = query(
      collectionGroup(db, 'profile'),
      where('email', '==', cleanEmail)
    )
    const exactQ = rawEmail !== cleanEmail
      ? query(collectionGroup(db, 'profile'), where('email', '==', rawEmail))
      : null

    const snap = await withTimeout(
      (async () => {
        const res = await getDocs(lowerQ)
        if (!res.empty) return res
        if (exactQ) return await getDocs(exactQ)
        return res
      })(),
      1500
    )

    if (snap && !snap.empty) {
      const profileDoc = snap.docs[0]
      const uid = profileDoc.ref.parent.parent.id
      const data = profileDoc.data()
      // Auto-cache in publicUsers for future instant resolution
      setDoc(doc(db, 'publicUsers', cleanEmail), {
        uid,
        email: cleanEmail,
        displayName: data.displayName || cleanEmail.split('@')[0],
      }, { merge: true }).catch(() => {})
      return { uid, email: data.email, displayName: data.displayName }
    }
  } catch (e) {
    console.warn('profile collectionGroup lookup notice:', e.message)
  }

  if (throwOnNotFound) {
    throw new Error(`User with email "${email}" not found. Please ensure they have a Placify account.`)
  }
  return null
}

export async function shareItem(senderUid, senderEmail, receiverEmail, itemType, itemData) {
  const receiver = await findUserByEmail(receiverEmail)
  if (receiver.uid === senderUid) {
    throw new Error('You cannot share items with yourself')
  }

  const safeData = sanitizePayload(itemData)
  const ref = collection(db, 'users', receiver.uid, 'shares')
  const newShare = await addDoc(ref, {
    senderEmail,
    senderUid,
    itemType, // 'course' | 'bookmark' | 'problem' | 'library' | 'playground' | 'notebook'
    itemData: safeData,
    createdAt: serverTimestamp(),
  })

  // Mirror into user's universal invites collection so it surfaces in Invites drawer
  try {
    const invitesRef = collection(db, 'users', receiver.uid, 'invites')
    await addDoc(invitesRef, {
      senderUid,
      senderEmail,
      senderName: senderEmail.split('@')[0],
      type: itemType === 'notebook' ? 'notebook' : 'share',
      roomId: itemData?.collabRoomId || null,
      itemType,
      itemData: safeData,
      title: itemData?.name || itemData?.title || `Shared ${itemType}`,
      shareDocId: newShare.id,
      status: 'pending',
      createdAt: serverTimestamp(),
    })
  } catch (e) {
    console.warn('Failed to mirror share into invites:', e)
  }
}


export function subscribeShares(uid, callback) {
  const q = query(userPath(uid, 'shares'), orderBy('createdAt', 'desc'))
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
  })
}

export async function deleteShare(uid, shareId) {
  await deleteDoc(doc(db, 'users', uid, 'shares', shareId))
}

export async function shareEntirePreparation(senderUid, senderEmail, receiverEmail) {
  const receiver = await findUserByEmail(receiverEmail)
  if (receiver.uid === senderUid) {
    throw new Error('You cannot share items with yourself')
  }

  // Fetch all user data
  const [topicsSnap, coursesSnap, bookmarksSnap, librarySnap, problemsSnap, playgroundSnap] = await Promise.all([
    getDocs(userPath(senderUid, 'topics')),
    getDocs(userPath(senderUid, 'courses')),
    getDocs(userPath(senderUid, 'bookmarks')),
    getDocs(userPath(senderUid, 'library')),
    getDocs(userPath(senderUid, 'problems')),
    getDocs(userPath(senderUid, 'playground')),
  ])

  const preparationData = {
    topics: topicsSnap.docs.map(d => ({ id: d.id, ...d.data() })),
    courses: coursesSnap.docs.map(d => ({ id: d.id, ...d.data() })),
    bookmarks: bookmarksSnap.docs.map(d => ({ id: d.id, ...d.data() })),
    library: librarySnap.docs.map(d => ({ id: d.id, ...d.data() })),
    problems: problemsSnap.docs.map(d => ({ id: d.id, ...d.data() })),
    playground: playgroundSnap.docs.map(d => ({ id: d.id, ...d.data() })),
  }

  const ref = collection(db, 'users', receiver.uid, 'shares')
  await addDoc(ref, {
    senderEmail,
    senderUid,
    itemType: 'preparation',
    itemData: preparationData,
    createdAt: serverTimestamp(),
  })
}

export async function importEntirePreparation(uid, preparationData) {
  const batch = writeBatch(db)
  const now = serverTimestamp()

  // Import topics
  preparationData.topics.forEach(topic => {
    const ref = doc(userPath(uid, 'topics'))
    const { id, ...data } = topic
    batch.set(ref, {
      ...data,
      createdAt: now,
      updatedAt: now,
    })
  })

  // Import courses
  preparationData.courses.forEach(course => {
    const ref = doc(userPath(uid, 'courses'))
    const { id, ...data } = course
    batch.set(ref, {
      ...data,
      createdAt: now,
      updatedAt: now,
    })
  })

  // Import bookmarks
  preparationData.bookmarks.forEach(bookmark => {
    const ref = doc(userPath(uid, 'bookmarks'))
    const { id, ...data } = bookmark
    batch.set(ref, {
      ...data,
      createdAt: now,
      updatedAt: now,
    })
  })

  // Import library
  preparationData.library.forEach(doc => {
    const ref = doc(userPath(uid, 'library'))
    const { id, ...data } = doc
    batch.set(ref, {
      ...data,
      createdAt: now,
    })
  })

  // Import problems (reset SM-2 values for fresh start)
  preparationData.problems.forEach(problem => {
    const ref = doc(userPath(uid, 'problems'))
    const { id, easiness, repetition, interval, statusHistory, lastReviewedDate, nextReviewDate, ...data } = problem
    const nextReview = new Date()
    nextReview.setDate(nextReview.getDate() + 1)
    batch.set(ref, {
      ...data,
      easiness: 2.5,
      repetition: 0,
      interval: 1,
      statusHistory: [{ status: data.confidenceStatus || 'Red', timestamp: Timestamp.now() }],
      lastReviewedDate: Timestamp.now(),
      nextReviewDate: Timestamp.fromDate(nextReview),
      createdAt: now,
    })
  })

  // Import playground files
  preparationData.playground.forEach(file => {
    const ref = doc(userPath(uid, 'playground'))
    const { id, ...data } = file
    batch.set(ref, {
      ...data,
      updatedAt: now,
    })
  })

  await batch.commit()
  await recordActivity(uid)
}

// ─── Multi-Role & Automation Helpers ───────────────────────
export const VALID_TEACHER_CODES = ['JALAJ2026', 'TEACHER2026', 'JALAJ', 'TEACHER', 'PLACIFY_PROF', 'MENTOR101', 'FACULTY_CSE', 'FACULTY2026']

export function verifyTeacherId(code) {
  if (!code) return false
  const trimmed = code.trim().toUpperCase()
  return (
    VALID_TEACHER_CODES.includes(trimmed) ||
    trimmed.startsWith('JALAJ') ||
    trimmed.startsWith('TEACHER') ||
    /^TCH-\d{4,}$/.test(trimmed)
  )
}

export async function setUserRole(uid, role, teacherId = null, department = 'Computer Science & Engineering') {
  const profileRef = doc(db, 'users', uid, 'profile', 'main')
  const updates = {
    role,
    department,
    onboardingComplete: true,
    updatedAt: serverTimestamp(),
  }
  if (role === 'teacher') {
    updates.teacherId = teacherId
    updates.verifiedTeacher = true
  }
  await updateDoc(profileRef, updates)
  await recordActivity(uid)
}

export function computeAutomatedProgress(problems = [], topics = []) {
  const safeProblems = Array.isArray(problems) ? problems : []
  const safeTopics = Array.isArray(topics) ? topics : []

  // Automated subject mastery based on solved problems count + completed topics
  const hasTag = (p, tagList) => {
    if (!p || !p.tags) return false
    if (Array.isArray(p.tags)) return p.tags.some((t) => tagList.includes(t))
    if (typeof p.tags === 'string') return tagList.some((t) => p.tags.includes(t))
    return false
  }

  const dsaProbs = safeProblems.filter((p) => hasTag(p, ['DSA', 'LeetCode', 'Array', 'Tree', 'Graph', 'DP']))
  const csProbs = safeProblems.filter((p) => hasTag(p, ['OS', 'DBMS', 'CN', 'OOPS', 'SQL', 'Theory']))
  const aptProbs = safeProblems.filter((p) => hasTag(p, ['Aptitude', 'Math', 'Logic', 'Verbal']))

  // Topics completion
  const dsaTopics = safeTopics.filter((t) => t && t.subject === 'DSA')
  const csTopics = safeTopics.filter((t) => t && ['OS', 'DBMS', 'CN', 'OOPS'].includes(t.subject))
  const aptTopics = safeTopics.filter((t) => t && typeof t.subject === 'string' && t.subject.startsWith('Aptitude'))

  const calcPct = (probCount, topicList) => {
    if (!topicList || topicList.length === 0) {
      return Math.min(100, probCount * 10)
    }
    const topicDone = topicList.filter((t) => t && t.status === 'Done').length
    const rawPct = (topicDone / topicList.length) * 70 + Math.min(30, probCount * 5)
    return Math.min(100, Math.round(rawPct))
  }

  return {
    dsaPct: calcPct(dsaProbs.length, dsaTopics),
    csPct: calcPct(csProbs.length, csTopics),
    aptPct: calcPct(aptProbs.length, aptTopics),
    totalProblemsSolved: safeProblems.length,
    activeStreak: safeProblems.length > 0 ? Math.min(30, safeProblems.length * 2) : 0,
  }
}

// ─── Sticky Notes ──────────────────────────────────────────
export function subscribeStickyNotes(uid, callback) {
  if (!uid) return () => {}
  const q = query(userPath(uid, 'stickyNotes'), orderBy('createdAt', 'desc'))
  return onSnapshot(
    q,
    (snap) => callback(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
    (err) => {
      console.warn('subscribeStickyNotes Firestore error:', err)
      callback([])
    }
  )
}

export async function addStickyNote(uid, data) {
  if (!uid) return
  const ref = await addDoc(userPath(uid, 'stickyNotes'), {
    title: data.title || '',
    content: data.content || '',
    color: data.color || 'yellow', // 'yellow' | 'blue' | 'green' | 'pink' | 'purple'
    isPinned: !!data.isPinned,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  await recordActivity(uid)
  return ref.id
}

export async function updateStickyNote(uid, noteId, data) {
  if (!uid || !noteId) return
  await updateDoc(doc(db, 'users', uid, 'stickyNotes', noteId), {
    ...data,
    updatedAt: serverTimestamp(),
  })
  await recordActivity(uid)
}

export async function deleteStickyNote(uid, noteId) {
  if (!uid || !noteId) return
  await deleteDoc(doc(db, 'users', uid, 'stickyNotes', noteId))
}

// ─── Collaborative Notebooks ──────────────────────────────
export function subscribeNotebooks(uid, callback) {
  if (!uid) return () => {}
  const q = query(userPath(uid, 'notebooks'), orderBy('updatedAt', 'desc'))
  return onSnapshot(
    q,
    (snap) => callback(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
    (err) => {
      console.warn('subscribeNotebooks Firestore error:', err)
      callback([])
    }
  )
}

export async function saveNotebook(uid, notebook) {
  if (!uid || !notebook?.id) return
  const ref = doc(db, 'users', uid, 'notebooks', notebook.id)
  await setDoc(ref, {
    ...notebook,
    updatedAt: serverTimestamp(),
  }, { merge: true })
  await recordActivity(uid)
}

export async function deleteNotebook(uid, notebookId) {
  if (!uid || !notebookId) return
  await deleteDoc(doc(db, 'users', uid, 'notebooks', notebookId))
}

export async function batchDeleteNotebooks(uid, notebookIds) {
  if (!uid || !Array.isArray(notebookIds) || notebookIds.length === 0) return
  try {
    const batch = writeBatch(db)
    const slice = notebookIds.slice(0, 400)
    for (const id of slice) {
      batch.delete(doc(db, 'users', uid, 'notebooks', id))
    }
    await batch.commit()
  } catch (err) {
    console.warn('batchDeleteNotebooks error:', err)
  }
}

export function sanitizePayload(data) {
  if (data === null || data === undefined) return null
  return JSON.parse(
    JSON.stringify(data, (key, value) => {
      if (value === undefined) return null
      return value
    })
  )
}

const fetchWithTimeout = (promise, ms = 2500) =>
  Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error('Query timeout')), ms)),
  ])

export async function fetchSharedNotebook(roomId) {
  if (!roomId) return null
  const cleanId = roomId.trim().replace(/^#+/, '').toLowerCase()
  const altId = cleanId.startsWith('collab-')
    ? cleanId.replace(/^collab-/, '')
    : `collab-${cleanId}`

  // 1. Check local storage cache (instant 0ms resolution)
  try {
    const raw =
      localStorage.getItem(`placify_shared_nb_${cleanId}`) ||
      localStorage.getItem(`placify_shared_nb_${altId}`)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (parsed && (parsed.pages?.length > 1 || parsed.pages?.[0]?.htmlContent?.trim()?.length > 0)) {
        return parsed
      }
    }
  } catch {}

  // 1b. Check local notebooks list
  try {
    const localRaw = localStorage.getItem('placify_notebooks')
    if (localRaw) {
      const list = JSON.parse(localRaw)
      if (Array.isArray(list)) {
        const match = list.find((n) => {
          const r = n.collabRoomId?.toLowerCase()?.replace(/^#+/, '')
          const id = n.id?.toLowerCase()
          return r === cleanId || r === altId || id === cleanId || id === altId
        })
        if (match && (match.pages?.length > 1 || match.pages?.[0]?.htmlContent?.trim()?.length > 0)) {
          return match
        }
      }
    }
  } catch {}

  // 2. Query direct documents in parallel (sharedNotebooks and bookmarks)
  const docTargets = [
    { coll: 'sharedNotebooks', id: cleanId },
    { coll: 'sharedNotebooks', id: altId },
    { coll: 'bookmarks', id: `collab_nb_${cleanId}` },
    { coll: 'bookmarks', id: `collab_nb_${altId}` },
  ]

  const directLookups = docTargets.map(async ({ coll, id }) => {
    try {
      const snap = await fetchWithTimeout(getDoc(doc(db, coll, id)), 2000)
      if (snap && snap.exists()) {
        const data = snap.data()
        if (data && (data.pages?.length > 0 || data.title)) {
          return {
            ...data,
            id: data.id || `nb-${cleanId}`,
            collabRoomId: cleanId,
            isCollaborative: true,
          }
        }
      }
    } catch {}
    return null
  })

  try {
    const directResults = await Promise.all(directLookups)
    const foundDirect = directResults.find((r) => r && (r.pages?.length > 0 || r.title))
    if (foundDirect) {
      // Cache locally for instant access next time
      try {
        localStorage.setItem(`placify_shared_nb_${cleanId}`, JSON.stringify(foundDirect))
        if (altId) localStorage.setItem(`placify_shared_nb_${altId}`, JSON.stringify(foundDirect))
      } catch {}
      return foundDirect
    }
  } catch (err) {
    console.warn('direct shared notebook lookups error:', err)
  }

  // 3. Fallback: Query community posts and collectionGroup in parallel with strict 2.5s race
  try {
    const communityQuery = async () => {
      try {
        const q1 = query(
          collection(db, 'communityPosts'),
          where('itemData.collabRoomId', 'in', [cleanId, altId, `#${cleanId}`, `#${altId}`])
        )
        const snap = await fetchWithTimeout(getDocs(q1), 2000)
        if (snap && !snap.empty) {
          const post = snap.docs[0].data()
          if (post?.itemData) return post.itemData
        }
      } catch {}
      return null
    }

    const groupQueryClean = async () => {
      try {
        const qg = query(collectionGroup(db, 'notebooks'), where('collabRoomId', '==', cleanId))
        const snap = await fetchWithTimeout(getDocs(qg), 2000)
        if (snap && !snap.empty) {
          const docData = snap.docs[0].data()
          const found = { id: snap.docs[0].id, ...docData }
          saveSharedNotebook(cleanId, found).catch(() => {})
          return found
        }
      } catch {}
      return null
    }

    const groupQueryAlt = async () => {
      try {
        const qg = query(collectionGroup(db, 'notebooks'), where('collabRoomId', '==', altId))
        const snap = await fetchWithTimeout(getDocs(qg), 2000)
        if (snap && !snap.empty) {
          const docData = snap.docs[0].data()
          const found = { id: snap.docs[0].id, ...docData }
          saveSharedNotebook(cleanId, found).catch(() => {})
          return found
        }
      } catch {}
      return null
    }

    const secondaryResults = await Promise.all([communityQuery(), groupQueryClean(), groupQueryAlt()])
    const foundSecondary = secondaryResults.find((r) => r && (r.pages?.length > 0 || r.title))
    if (foundSecondary) {
      try {
        localStorage.setItem(`placify_shared_nb_${cleanId}`, JSON.stringify(foundSecondary))
        if (altId) localStorage.setItem(`placify_shared_nb_${altId}`, JSON.stringify(foundSecondary))
      } catch {}
      return foundSecondary
    }
  } catch (err) {
    console.warn('fallback shared notebook queries error:', err)
  }

  return null
}

export function subscribeSharedNotebook(roomId, callback) {
  if (!roomId) return () => {}
  const cleanId = roomId.trim().replace(/^#+/, '').toLowerCase()
  const altId = cleanId.startsWith('collab-')
    ? cleanId.replace(/^collab-/, '')
    : `collab-${cleanId}`

  let active = true

  const handleFound = (data) => {
    if (!active || !data) return
    const stableId = data.id || `nb-${cleanId}`
    const normalized = {
      ...data,
      id: stableId,
      collabRoomId: cleanId,
      isCollaborative: true,
    }
    callback(normalized)
    try {
      localStorage.setItem(`placify_shared_nb_${cleanId}`, JSON.stringify(normalized))
      if (altId) localStorage.setItem(`placify_shared_nb_${altId}`, JSON.stringify(normalized))
    } catch {}
  }

  // 1. Immediate active fetch
  fetchSharedNotebook(roomId).then((nb) => {
    if (nb && active) handleFound(nb)
  }).catch(() => {})

  // 2. Real-time snapshot on bookmarks
  let unsub1 = () => {}
  try {
    const bookmarkRef1 = doc(db, 'bookmarks', `collab_nb_${cleanId}`)
    unsub1 = onSnapshot(
      bookmarkRef1,
      (snap) => {
        if (snap.exists() && active) {
          handleFound({ id: snap.data()?.id || snap.id, ...snap.data() })
        }
      },
      (err) => console.warn('bookmarks snapshot error:', err)
    )
  } catch {}

  // 3. Real-time snapshot on sharedNotebooks
  let unsub2 = () => {}
  try {
    const sharedRef = doc(db, 'sharedNotebooks', cleanId)
    unsub2 = onSnapshot(
      sharedRef,
      (snap) => {
        if (snap.exists() && active) {
          handleFound({ id: snap.data()?.id || snap.id, ...snap.data() })
        }
      },
      (err) => console.warn('sharedNotebooks snapshot error:', err)
    )
  } catch {}

  return () => {
    active = false
    try { if (typeof unsub1 === 'function') unsub1() } catch {}
    try { if (typeof unsub2 === 'function') unsub2() } catch {}
  }
}

export async function saveSharedNotebook(roomId, notebookData) {
  if (!roomId || !notebookData) return
  const cleanId = roomId.trim().replace(/^#+/, '').toLowerCase()
  const altId = cleanId.startsWith('collab-')
    ? cleanId.replace(/^collab-/, '')
    : `collab-${cleanId}`

  const safeData = sanitizePayload(notebookData) || {}
  const nowIso = new Date().toISOString()

  // Clean payload for Firestore (uses serverTimestamp)
  const firestorePayload = {
    ...safeData,
    collabRoomId: cleanId,
    isCollaborative: true,
    updatedAt: serverTimestamp(),
  }

  // Clean payload for LocalStorage (pure JSON)
  const localPayload = {
    ...safeData,
    collabRoomId: cleanId,
    isCollaborative: true,
    updatedAt: nowIso,
  }

  // 1. Universal cloud store in bookmarks
  try {
    await setDoc(doc(db, 'bookmarks', `collab_nb_${cleanId}`), firestorePayload, { merge: true })
    if (altId && altId !== cleanId) {
      await setDoc(doc(db, 'bookmarks', `collab_nb_${altId}`), firestorePayload, { merge: true })
    }
  } catch (err) {
    console.warn('saveSharedNotebook to bookmarks failed:', err)
  }

  // 2. Also save into sharedNotebooks collection
  try {
    await setDoc(doc(db, 'sharedNotebooks', cleanId), firestorePayload, { merge: true })
    if (altId && altId !== cleanId) {
      await setDoc(doc(db, 'sharedNotebooks', altId), firestorePayload, { merge: true })
    }
  } catch (err) {
    console.warn('saveSharedNotebook to sharedNotebooks failed:', err)
  }

  // 3. Mirror into local storage
  try {
    localStorage.setItem(`placify_shared_nb_${cleanId}`, JSON.stringify(localPayload))
    if (altId) localStorage.setItem(`placify_shared_nb_${altId}`, JSON.stringify(localPayload))
  } catch {}
}

// ─── Invites (All Collaboration, Rooms & Shared Materials) ─────────
export async function sendUserInvite(senderUser, receiverEmail, inviteData) {
  if (!receiverEmail?.trim()) {
    throw new Error('Receiver email is required')
  }
  const cleanEmail = receiverEmail.trim().toLowerCase()
  let receiver = null
  try {
    receiver = await findUserByEmail(cleanEmail, false)
  } catch (e) {
    console.warn('findUserByEmail note in sendUserInvite:', e.message)
  }

  if (receiver?.uid && receiver.uid === senderUser?.uid) {
    throw new Error('You cannot invite yourself')
  }

  const safeItemData = sanitizePayload(inviteData.itemData)
  const invitePayload = sanitizePayload({
    senderUid: senderUser?.uid || 'guest',
    senderName: senderUser?.displayName || senderUser?.email?.split('@')[0] || 'Peer',
    senderEmail: senderUser?.email || '',
    senderPhoto: senderUser?.photoURL || null,
    type: inviteData.type || 'room', // 'notebook' | 'room' | 'share'
    roomId: inviteData.roomId || null,
    title: inviteData.title || (inviteData.type === 'notebook' ? 'Collaborative Notebook' : 'Live Study Room'),
    itemType: inviteData.itemType || null,
    itemData: safeItemData || null,
    status: 'pending',
  })

  const withFastTimeout = (promise, ms = 2500) =>
    Promise.race([
      promise,
      new Promise((resolve) => setTimeout(resolve, ms)),
    ])

  // Guaranteed non-blocking sync to sharedNotebooks if roomId is present (open rules, never hangs)
  if (inviteData.roomId) {
    try {
      const cleanRoom = String(inviteData.roomId).trim().replace(/^#+/, '').toLowerCase()
      withFastTimeout(
        setDoc(
          doc(db, 'sharedNotebooks', cleanRoom),
          {
            invitedEmails: arrayUnion(cleanEmail),
            updatedAt: serverTimestamp(),
          },
          { merge: true }
        ).catch(() => {})
      )
    } catch (e) {
      console.warn('sharedNotebooks sync note:', e)
    }
  }

  if (receiver && receiver.uid) {
    // 1. Direct delivery to recipient's invites collection using pure addDoc / setDoc fallback
    let docId = `invite_${Date.now()}`
    try {
      const cleanRoomKey = inviteData.roomId
        ? `room_${String(inviteData.roomId).trim().replace(/^#+/, '').toLowerCase()}`
        : null

      if (cleanRoomKey) {
        await withFastTimeout(
          setDoc(
            doc(db, 'users', receiver.uid, 'invites', cleanRoomKey),
            {
              ...invitePayload,
              createdAt: serverTimestamp(),
            },
            { merge: true }
          ).catch(async () => {
            const ref = collection(db, 'users', receiver.uid, 'invites')
            const newDoc = await addDoc(ref, { ...invitePayload, createdAt: serverTimestamp() })
            docId = newDoc.id
          })
        )
      } else {
        const ref = collection(db, 'users', receiver.uid, 'invites')
        const newDoc = await withFastTimeout(addDoc(ref, { ...invitePayload, createdAt: serverTimestamp() }))
        if (newDoc?.id) docId = newDoc.id
      }
    } catch (e) {
      console.warn('Direct invite delivery note:', e)
    }

    // 2. Secondary delivery to recipient's shares collection (non-blocking)
    try {
      const sharesRef = collection(db, 'users', receiver.uid, 'shares')
      withFastTimeout(
        addDoc(sharesRef, {
          senderEmail: senderUser?.email || '',
          senderUid: senderUser?.uid || '',
          itemType: inviteData.type === 'notebook' ? 'notebook' : (inviteData.itemType || 'share'),
          itemData: safeItemData,
          createdAt: serverTimestamp(),
        }).catch(() => {})
      )
    } catch (e) {
      console.warn('Secondary share delivery:', e)
    }

    return {
      success: true,
      docId,
      targetUser: receiver,
      message: `Invite sent to ${receiver.displayName || cleanEmail}!`,
    }
  } else {
    // 3. User not registered yet: save to pendingInvites collection (bounded timeout)
    try {
      const cleanDocKey = `${cleanEmail.replace(/[^a-z0-9]/g, '_')}_${inviteData.roomId || 'room'}`
      await withFastTimeout(
        setDoc(
          doc(db, 'pendingInvites', cleanDocKey),
          {
            ...invitePayload,
            recipientEmail: cleanEmail,
            createdAt: serverTimestamp(),
          },
          { merge: true }
        ).catch(() => {})
      )
    } catch (e) {
      console.warn('pendingInvites storage note:', e)
    }

    return {
      success: true,
      pending: true,
      message: `Invite reserved for ${cleanEmail}! They can also join anytime with room code #${inviteData.roomId || ''}.`,
    }
  }
}

export function subscribeInvites(uid, callback) {
  if (!uid) return () => {}
  const q = query(collection(db, 'users', uid, 'invites'), orderBy('createdAt', 'desc'))
  return onSnapshot(
    q,
    (snap) => {
      const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
      callback(items)
      try {
        localStorage.setItem(`placify_invites_${uid}`, JSON.stringify(items))
      } catch {}
    },
    (err) => {
      console.warn('subscribeInvites Firestore error, using fallback:', err)
      try {
        const cached = JSON.parse(localStorage.getItem(`placify_invites_${uid}`) || '[]')
        callback(cached)
      } catch {
        callback([])
      }
    }
  )
}

export async function deleteInviteDoc(uid, inviteId) {
  if (!uid || !inviteId) return
  try {
    await deleteDoc(doc(db, 'users', uid, 'invites', inviteId))
  } catch (err) {
    console.warn('Failed to delete invite from Firestore:', err)
  }
  try {
    const key = `placify_invites_${uid}`
    const cached = JSON.parse(localStorage.getItem(key) || '[]')
    localStorage.setItem(key, JSON.stringify(cached.filter((i) => i.id !== inviteId && i.roomId !== inviteId)))
  } catch {}
}

// ─── Community Posts & Hub ──────────────────────────────────
export const SEED_COMMUNITY_POSTS = [
  {
    id: 'comm-seed-1',
    authorUid: 'placify-lead',
    authorName: 'Aryan Verma (Placement Lead)',
    authorEmail: 'aryan@campus.edu',
    authorRole: 'Student Lead',
    authorPhoto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    title: 'Complete Striver A2Z DSA Lecture Series & Video Roadmap',
    description: 'Comprehensive 450+ question DSA course covering Arrays, Dynamic Programming, Graphs, and Trees with step-by-step video solutions and patterns.',
    category: 'course',
    tags: ['DSA', 'LeetCode', 'Striver', 'Interviews'],
    itemData: {
      name: "Striver's A2Z DSA Sheet - Masterclass Video",
      url: 'https://www.youtube.com/watch?v=0bHoB35fCmg',
      embedId: '0bHoB35fCmg',
      isPlaylist: false,
    },
    likes: ['user-1', 'user-2', 'user-3', 'user-4', 'user-5'],
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
  },
  {
    id: 'comm-seed-2',
    authorUid: 'placify-mentor',
    authorName: 'Prof. Rajesh K. (System Architect)',
    authorEmail: 'rajesh@cs.ac.in',
    authorRole: 'Faculty',
    authorPhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    title: 'High-Level System Design: Microservices, Caching & CAP Theorem',
    description: 'Collaborative revision notebook for scalable distributed systems. Includes Redis cache-aside patterns, Kafka event streaming, and horizontal database sharding diagrams.',
    category: 'notebook',
    tags: ['System Design', 'HLD', 'Redis', 'Kafka'],
    itemData: {
      id: 'nb-sys-design-comm',
      title: 'High-Level System Design & Architecture',
      subject: 'System Design',
      collabRoomId: 'collab-sysdesign',
      pages: [
        {
          id: 'p-1',
          title: 'Distributed Caching Strategies',
          htmlContent: '<h1>Distributed Caching (Redis &amp; Memcached)</h1><p>Cache-aside vs Write-through vs Write-back caching strategies with latency and consistency trade-offs.</p>',
        }
      ]
    },
    likes: ['user-1', 'user-3', 'user-6'],
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
  },
  {
    id: 'comm-seed-3',
    authorUid: 'placify-scholar',
    authorName: 'Sneha Patel (PhD Scholar)',
    authorEmail: 'sneha@research.edu',
    authorRole: 'PhD Scholar',
    authorPhoto: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    title: 'Top 100 SDE Interview Cheat Sheet & Behavioral Guide (PDF)',
    description: 'Handcrafted concise revision cheat sheet summarizing behavioral STAR questions, OS concurrency primitives, DBMS indexing, and computer networking key metrics.',
    category: 'resource',
    tags: ['Cheat Sheet', 'SDE-1', 'STAR Method', 'OS/DBMS'],
    itemData: {
      name: 'Ultimate_SDE_Interview_CheatSheet.pdf',
      url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      type: 'pdf',
      size: '2.4 MB',
    },
    likes: ['user-2', 'user-5', 'user-7', 'user-8'],
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
  },
  {
    id: 'comm-seed-4',
    authorUid: 'placify-coder',
    authorName: 'Vikram Joshi (Full-Stack Dev)',
    authorEmail: 'vikram@campus.edu',
    authorRole: 'Student',
    authorPhoto: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    title: 'LRU Cache (Least Recently Used) in O(1) Time - JS Implementation',
    description: 'Clean and production-ready implementation of LRU Cache with a Doubly Linked List and Hash Map. Includes unit test execution harness for Code Playground.',
    category: 'code',
    tags: ['JavaScript', 'Algorithms', 'Data Structures', 'Playground'],
    itemData: {
      name: 'lru-cache-optimal.js',
      language: 'javascript',
      code: `class Node {
  constructor(key, val) {
    this.key = key;
    this.val = val;
    this.prev = null;
    this.next = null;
  }
}

class LRUCache {
  constructor(capacity) {
    this.capacity = capacity;
    this.map = new Map();
    this.head = new Node(0, 0);
    this.tail = new Node(0, 0);
    this.head.next = this.tail;
    this.tail.prev = this.head;
  }

  _remove(node) {
    node.prev.next = node.next;
    node.next.prev = node.prev;
  }

  _insert(node) {
    node.next = this.head.next;
    node.next.prev = node;
    this.head.next = node;
    node.prev = this.head;
  }

  get(key) {
    if (!this.map.has(key)) return -1;
    const node = this.map.get(key);
    this._remove(node);
    this._insert(node);
    return node.val;
  }

  put(key, val) {
    if (this.map.has(key)) {
      this._remove(this.map.get(key));
    }
    const newNode = new Node(key, val);
    this._insert(newNode);
    this.map.set(key, newNode);

    if (this.map.size > this.capacity) {
      const lru = this.tail.prev;
      this._remove(lru);
      this.map.delete(lru.key);
    }
  }
}

// Test Run
const cache = new LRUCache(2);
cache.put(1, 100);
cache.put(2, 200);
console.log("Get 1:", cache.get(1)); // 100
cache.put(3, 300); // evicts key 2
console.log("Get 2 (evicted):", cache.get(2)); // -1
console.log("Get 3:", cache.get(3)); // 300
`,
    },
    likes: ['user-1', 'user-4', 'user-6'],
    createdAt: new Date(Date.now() - 3600000 * 36).toISOString(),
  }
]

export function subscribeCommunityPosts(callback) {
  const q = query(collection(db, 'communityPosts'), orderBy('createdAt', 'desc'))
  return onSnapshot(
    q,
    (snap) => {
      if (!snap.empty) {
        const posts = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
        callback(posts)
        try {
          localStorage.setItem('placify_community_posts', JSON.stringify(posts))
        } catch {}
      } else {
        const cached = JSON.parse(localStorage.getItem('placify_community_posts') || 'null')
        if (cached && cached.length > 0) {
          callback(cached)
        } else {
          localStorage.setItem('placify_community_posts', JSON.stringify(SEED_COMMUNITY_POSTS))
          callback(SEED_COMMUNITY_POSTS)
        }
      }
    },
    (err) => {
      console.warn('subscribeCommunityPosts error, using fallback:', err)
      const cached = JSON.parse(localStorage.getItem('placify_community_posts') || 'null')
      callback(cached || SEED_COMMUNITY_POSTS)
    }
  )
}

export async function createCommunityPost(user, postData) {
  const newPost = {
    authorUid: user?.uid || 'anonymous',
    authorName: user?.displayName || user?.email?.split('@')[0] || 'Community Member',
    authorEmail: user?.email || '',
    authorRole: user?.role || 'Student',
    authorPhoto: user?.photoURL || null,
    title: postData.title?.trim() || 'Untitled Community Post',
    description: postData.description?.trim() || '',
    category: postData.category || 'resource',
    tags: Array.isArray(postData.tags) ? postData.tags : (postData.tags || '').split(',').map((t) => t.trim()).filter(Boolean),
    itemData: postData.itemData || {},
    likes: [],
    createdAt: serverTimestamp(),
  }

  let docId = `post-${Date.now()}`
  try {
    const docRef = await addDoc(collection(db, 'communityPosts'), newPost)
    docId = docRef.id
  } catch (err) {
    console.warn('Firestore createCommunityPost error, saving locally:', err)
  }

  try {
    const current = JSON.parse(localStorage.getItem('placify_community_posts') || '[]')
    const fullPost = {
      ...newPost,
      id: docId,
      createdAt: new Date().toISOString(),
    }
    localStorage.setItem('placify_community_posts', JSON.stringify([fullPost, ...current]))
  } catch {}

  return docId
}

export async function toggleCommunityPostLike(uid, postId) {
  if (!uid || !postId) return
  try {
    const ref = doc(db, 'communityPosts', postId)
    const snap = await getDoc(ref)
    if (snap.exists()) {
      const data = snap.data()
      const likes = data.likes || []
      const hasLiked = likes.includes(uid)
      const updatedLikes = hasLiked ? likes.filter((id) => id !== uid) : [...likes, uid]
      await updateDoc(ref, { likes: updatedLikes })
    }
  } catch (err) {
    console.warn('Firestore toggleCommunityPostLike error:', err)
  }

  try {
    const current = JSON.parse(localStorage.getItem('placify_community_posts') || '[]')
    const updated = current.map((p) => {
      if (p.id === postId) {
        const likes = p.likes || []
        const hasLiked = likes.includes(uid)
        return {
          ...p,
          likes: hasLiked ? likes.filter((id) => id !== uid) : [...likes, uid],
        }
      }
      return p
    })
    localStorage.setItem('placify_community_posts', JSON.stringify(updated))
  } catch {}
}

export async function deleteCommunityPost(postId) {
  if (!postId) return
  try {
    await deleteDoc(doc(db, 'communityPosts', postId))
  } catch (err) {
    console.warn('Firestore deleteCommunityPost error:', err)
  }
  try {
    const current = JSON.parse(localStorage.getItem('placify_community_posts') || '[]')
    localStorage.setItem(
      'placify_community_posts',
      JSON.stringify(current.filter((p) => p.id !== postId))
    )
  } catch {}
}





