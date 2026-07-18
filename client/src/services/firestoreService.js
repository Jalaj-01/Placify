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

// ─── Sharing ───────────────────────────────────────────────
export async function findUserByEmail(email) {
  const q = query(
    collectionGroup(db, 'profile'),
    where('email', '==', email.toLowerCase().trim())
  )
  const snap = await getDocs(q)
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

