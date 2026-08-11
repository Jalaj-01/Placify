import {
  collection, doc, getDoc, getDocs, setDoc, addDoc, updateDoc, deleteDoc,
  query, orderBy, onSnapshot, serverTimestamp, Timestamp, writeBatch, where,
  collectionGroup,
} from 'firebase/firestore'
import { db } from '@/config/firebase'
import { topicSeeds } from '@/utils/topicSeeds'
import { getTodayString, isYesterday, getNextReviewDate } from '@/utils/dateHelpers'

const userPath = (uid, sub) => collection(db, 'users', uid, sub)

// ─── Profile ───────────────────────────────────────────────
export async function getOrCreateProfile(user) {
  const ref = doc(db, 'users', user.uid, 'profile', 'main')
  const snap = await getDoc(ref)
  if (snap.exists()) return snap.data()

  const profile = {
    displayName: user.displayName || '',
    email: user.email || '',
    photoURL: user.photoURL || '',
    streakData: { currentStreak: 0, longestStreak: 0, lastActiveDate: null, activityLog: [] },
    onboardingComplete: false,
    createdAt: serverTimestamp(),
  }
  await setDoc(ref, profile)
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
export async function findUserByEmail(email) {
  const exactQ = query(
    collectionGroup(db, 'profile'),
    where('email', '==', email.trim())
  )
  let snap = await getDocs(exactQ)
  
  if (snap.empty) {
    const lowerQ = query(
      collectionGroup(db, 'profile'),
      where('email', '==', email.toLowerCase().trim())
    )
    snap = await getDocs(lowerQ)
  }

  if (snap.empty) {
    throw new Error('User not found with this email')
  }
  const profileDoc = snap.docs[0]
  // profileDoc is at users/{uid}/profile/main, so its parent of parent is users/{uid}
  const uid = profileDoc.ref.parent.parent.id
  return { uid, email: profileDoc.data().email, displayName: profileDoc.data().displayName }
}

export async function shareItem(senderUid, senderEmail, receiverEmail, itemType, itemData) {
  const receiver = await findUserByEmail(receiverEmail)
  if (receiver.uid === senderUid) {
    throw new Error('You cannot share items with yourself')
  }

  const ref = collection(db, 'users', receiver.uid, 'shares')
  await addDoc(ref, {
    senderEmail,
    senderUid,
    itemType, // 'course' | 'bookmark' | 'problem' | 'library'
    itemData,
    createdAt: serverTimestamp(),
  })
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



