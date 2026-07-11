import {
  collection, doc, getDoc, getDocs, setDoc, addDoc, updateDoc, deleteDoc,
  query, orderBy, onSnapshot, serverTimestamp, Timestamp, writeBatch, where,
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
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
  })
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
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
  })
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
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
  })
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
  return onSnapshot(doc(db, 'users', uid, 'profile', 'main'), (snap) => {
    if (snap.exists()) callback(snap.data())
  })
}

export function subscribePlaygroundFiles(uid, callback) {
  const q = query(collection(db, 'users', uid, 'playground'), orderBy('updatedAt', 'desc'))
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
  })
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
  return onSnapshot(q, (snap) => {
    const data = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
    callback(data)
  })
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
  return onSnapshot(q, (snap) => {
    const data = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
    callback(data)
  })
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
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
  })
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
