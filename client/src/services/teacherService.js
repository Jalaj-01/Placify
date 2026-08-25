import {
  collection, doc, getDoc, getDocs, setDoc, addDoc, updateDoc, deleteDoc,
  query, orderBy, onSnapshot, serverTimestamp, where, arrayUnion, arrayRemove, limit
} from 'firebase/firestore'
import { db } from '@/config/firebase'

// ─── Utility: Generate 6-character Alphanumeric Course Code ─────
export function generateCourseCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

// ═══════════════════════════════════════════════════════════════
// 1. COURSES & CLASS ROSTER
// ═══════════════════════════════════════════════════════════════

export async function createCourse(teacherUser, courseData) {
  const courseCode = courseData.courseCode?.trim().toUpperCase() || generateCourseCode()
  const courseRef = doc(collection(db, 'courses'))

  const newCourse = {
    id: courseRef.id,
    title: courseData.title || 'Untitled Course',
    courseCode,
    department: courseData.department || 'Computer Science',
    semester: courseData.semester || '5th Sem',
    academicYear: courseData.academicYear || '2026-2027',
    section: courseData.section || 'Sec A',
    description: courseData.description || '',
    instructorUid: teacherUser.uid,
    instructorName: teacherUser.displayName || 'Instructor',
    instructorEmail: teacherUser.email || '',
    isEnrollmentOpen: true,
    studentsCount: 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  }

  await setDoc(courseRef, newCourse)

  // Initialize empty syllabus document for course
  const syllabusRef = doc(db, 'courses', courseRef.id, 'syllabus', 'main')
  await setDoc(syllabusRef, {
    courseId: courseRef.id,
    instructorUid: teacherUser.uid,
    units: [],
    pacingMetrics: {
      targetStartDate: new Date(),
      targetEndDate: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000),
      totalPlannedLectures: 40,
      totalDeliveredLectures: 0,
      completedSubTopicsCount: 0,
      totalSubTopicsCount: 0,
      overallCompletionPercentage: 0,
      pacingStatus: 'ON_TRACK',
      deviationLectures: 0
    }
  })

  return { id: courseRef.id, ...newCourse }
}

export function subscribeTeacherCourses(teacherUid, callback) {
  if (!teacherUid) return () => {}
  // Query without orderBy to avoid needing a composite index while index builds
  // Client-side sort instead
  const q = query(
    collection(db, 'courses'),
    where('instructorUid', '==', teacherUid)
  )
  return onSnapshot(q, (snap) => {
    const data = snap.docs
      .map((d) => ({ id: d.id, ...d.data() }))
      .sort((a, b) => {
        const aTime = a.createdAt?.toMillis?.() || a.createdAt?.seconds * 1000 || 0
        const bTime = b.createdAt?.toMillis?.() || b.createdAt?.seconds * 1000 || 0
        return bTime - aTime
      })
    callback(data)
  }, (err) => {
    console.error('subscribeTeacherCourses error:', err)
    callback([])
  })
}

export async function updateCourse(courseId, data) {
  await updateDoc(doc(db, 'courses', courseId), {
    ...data,
    updatedAt: serverTimestamp()
  })
}

export async function deleteCourse(courseId) {
  await deleteDoc(doc(db, 'courses', courseId))
}

// Student Joins Course via 6-character Course Code
export async function joinCourseByCode(studentUser, code, rollNumber = '') {
  const cleanCode = code.trim().toUpperCase()
  const q = query(collection(db, 'courses'), where('courseCode', '==', cleanCode), limit(1))
  const snap = await getDocs(q)
  if (snap.empty) {
    throw new Error(`Invalid course code "${cleanCode}". No active course found.`)
  }

  const courseDoc = snap.docs[0]
  const courseId = courseDoc.id
  const courseData = courseDoc.data()

  if (!courseData.isEnrollmentOpen) {
    throw new Error('Enrollment for this course is currently closed by the instructor.')
  }

  // Add to roster subcollection
  const rosterRef = doc(db, 'courses', courseId, 'roster', studentUser.uid)
  await setDoc(rosterRef, {
    studentUid: studentUser.uid,
    name: studentUser.displayName || 'Student',
    email: studentUser.email || '',
    rollNumber: rollNumber || '',
    enrolledAt: serverTimestamp(),
    status: 'ACTIVE'
  })

  // Increment student count and update enrolledStudentUids on course doc
  const allRoster = await getDocs(collection(db, 'courses', courseId, 'roster'))
  await updateDoc(doc(db, 'courses', courseId), {
    studentsCount: allRoster.size,
    enrolledStudentUids: arrayUnion(studentUser.uid)
  })

  // Also write to student's user enrolledCourses collection
  const studentCourseRef = doc(db, 'users', studentUser.uid, 'enrolledCourses', courseId)
  await setDoc(studentCourseRef, {
    courseId,
    title: courseData.title,
    courseCode: courseData.courseCode,
    section: courseData.section || 'Sec A',
    semester: courseData.semester || '5th Sem',
    department: courseData.department || 'CSE',
    instructorName: courseData.instructorName || 'Instructor',
    instructorUid: courseData.instructorUid || '',
    description: courseData.description || '',
    enrolledAt: serverTimestamp()
  })

  return { courseId, ...courseData }
}

export function subscribeStudentEnrolledCourses(studentUid, callback) {
  if (!studentUid) return () => {}
  const q = query(collection(db, 'users', studentUid, 'enrolledCourses'))
  return onSnapshot(q, (snap) => {
    const courses = snap.docs.map(d => ({ id: d.id, ...d.data() }))
    callback(courses)
  }, (err) => {
    console.warn('subscribeStudentEnrolledCourses error:', err)
    callback([])
  })
}

export function subscribeCourseRoster(courseId, callback) {
  if (!courseId) return () => {}
  const q = query(collection(db, 'courses', courseId, 'roster'), orderBy('enrolledAt', 'desc'))
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() })))
  }, (err) => {
    console.warn('subscribeCourseRoster error:', err)
    callback([])
  })
}

export async function updateStudentRosterStatus(courseId, studentUid, status) {
  await updateDoc(doc(db, 'courses', courseId, 'roster', studentUid), { status })
}

export async function removeStudentFromRoster(courseId, studentUid) {
  await deleteDoc(doc(db, 'courses', courseId, 'roster', studentUid))
  const allRoster = await getDocs(collection(db, 'courses', courseId, 'roster'))
  await updateDoc(doc(db, 'courses', courseId), {
    studentsCount: allRoster.size
  })
}

// ═══════════════════════════════════════════════════════════════
// 2. SYLLABUS & LIVE PACING TRACKER
// ═══════════════════════════════════════════════════════════════

export function subscribeSyllabus(courseId, callback) {
  if (!courseId) return () => {}
  const ref = doc(db, 'courses', courseId, 'syllabus', 'main')
  return onSnapshot(ref, (snap) => {
    if (snap.exists()) {
      callback({ id: snap.id, ...snap.data() })
    } else {
      callback(null)
    }
  }, (err) => {
    console.warn('subscribeSyllabus error:', err)
    callback(null)
  })
}

export async function saveSyllabusUnits(courseId, units, pacingConfig = {}) {
  const ref = doc(db, 'courses', courseId, 'syllabus', 'main')

  // Calculate Sub-Topics completion metrics
  let totalSubTopics = 0
  let completedSubTopics = 0
  units.forEach(u => {
    (u.chapters || []).forEach(ch => {
      (ch.subTopics || []).forEach(st => {
        totalSubTopics++
        if (st.isCompleted) completedSubTopics++
      })
    })
  })

  const overallCompletionPercentage = totalSubTopics > 0
    ? Math.round((completedSubTopics / totalSubTopics) * 100)
    : 0

  const delivered = pacingConfig.totalDeliveredLectures || 0
  const planned = pacingConfig.totalPlannedLectures || 40
  const targetStart = pacingConfig.targetStartDate ? new Date(pacingConfig.targetStartDate) : new Date()
  const targetEnd = pacingConfig.targetEndDate ? new Date(pacingConfig.targetEndDate) : new Date(Date.now() + 120 * 24 * 60 * 60 * 1000)

  const totalCourseDays = Math.max(1, (targetEnd - targetStart) / (1000 * 60 * 60 * 24))
  const elapsedDays = Math.max(0, Math.min(totalCourseDays, (new Date() - targetStart) / (1000 * 60 * 60 * 24)))
  const expectedProgress = Math.round((elapsedDays / totalCourseDays) * planned)
  const deviation = delivered - expectedProgress

  let pacingStatus = 'ON_TRACK'
  if (deviation <= -2) pacingStatus = 'BEHIND_SCHEDULE'
  else if (deviation >= 2) pacingStatus = 'AHEAD'

  await setDoc(ref, {
    courseId,
    units,
    pacingMetrics: {
      targetStartDate: targetStart,
      targetEndDate: targetEnd,
      totalPlannedLectures: planned,
      totalDeliveredLectures: delivered,
      completedSubTopicsCount: completedSubTopics,
      totalSubTopicsCount: totalSubTopics,
      overallCompletionPercentage,
      pacingStatus,
      deviationLectures: deviation
    },
    updatedAt: serverTimestamp()
  }, { merge: true })
}

// ═══════════════════════════════════════════════════════════════
// 3. WEEKLY TIMETABLE & PROXY SUBSTITUTION
// ═══════════════════════════════════════════════════════════════

export function subscribeTeacherTimetable(instructorUid, callback) {
  if (!instructorUid) return () => {}
  const q = query(
    collection(db, 'timetables'),
    where('instructorUid', '==', instructorUid)
  )
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() })))
  }, (err) => {
    console.warn('subscribeTeacherTimetable error:', err)
    callback([])
  })
}

export async function addTimetableSlot(slotData) {
  const ref = doc(collection(db, 'timetables'))
  const slot = {
    id: ref.id,
    ...slotData,
    status: slotData.status || 'SCHEDULED',
    proxyAssignment: slotData.proxyAssignment || { isProxyActive: false },
    createdAt: serverTimestamp()
  }
  await setDoc(ref, slot)
  return slot
}

export async function updateTimetableSlot(slotId, data) {
  await updateDoc(doc(db, 'timetables', slotId), data)
}

export async function deleteTimetableSlot(slotId) {
  await deleteDoc(doc(db, 'timetables', slotId))
}

// ═══════════════════════════════════════════════════════════════
// 4. CODING ASSIGNMENTS & AUTO-GRADING
// ═══════════════════════════════════════════════════════════════

export function subscribeCourseAssignments(courseId, callback) {
  if (!courseId) return () => {}
  const q = query(
    collection(db, 'assignments'),
    where('courseId', '==', courseId)
  )
  return onSnapshot(q, (snap) => {
    const data = snap.docs
      .map(d => ({ id: d.id, ...d.data() }))
      .sort((a, b) => {
        const aTime = a.createdAt?.toMillis?.() || a.createdAt?.seconds * 1000 || 0
        const bTime = b.createdAt?.toMillis?.() || b.createdAt?.seconds * 1000 || 0
        return bTime - aTime
      })
    callback(data)
  }, (err) => {
    console.warn('subscribeCourseAssignments error:', err)
    callback([])
  })
}

export async function createAssignment(assignmentData) {
  const ref = doc(collection(db, 'assignments'))
  const newAssign = {
    id: ref.id,
    ...assignmentData,
    submissionsCount: 0,
    averageScore: 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  }
  await setDoc(ref, newAssign)
  return newAssign
}

export async function updateAssignment(assignmentId, data) {
  await updateDoc(doc(db, 'assignments', assignmentId), {
    ...data,
    updatedAt: serverTimestamp()
  })
}

export async function deleteAssignment(assignmentId) {
  await deleteDoc(doc(db, 'assignments', assignmentId))
}

// Submissions for an Assignment
export function subscribeAssignmentSubmissions(assignmentId, callback) {
  if (!assignmentId) return () => {}
  const q = query(
    collection(db, 'assignments', assignmentId, 'submissions'),
    orderBy('submittedAt', 'desc')
  )
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() })))
  }, (err) => {
    console.warn('subscribeAssignmentSubmissions error:', err)
    callback([])
  })
}

export async function saveAssignmentSubmission(assignmentId, studentUid, submissionData) {
  const subRef = doc(db, 'assignments', assignmentId, 'submissions', studentUid)
  await setDoc(subRef, {
    assignmentId,
    studentUid,
    ...submissionData,
    submittedAt: serverTimestamp()
  })

  // Update submission metrics on assignment doc
  const allSubs = await getDocs(collection(db, 'assignments', assignmentId, 'submissions'))
  const totalScore = allSubs.docs.reduce((acc, d) => acc + (d.data().finalScore || 0), 0)
  const avg = allSubs.size > 0 ? Math.round(totalScore / allSubs.size) : 0

  await updateDoc(doc(db, 'assignments', assignmentId), {
    submissionsCount: allSubs.size,
    averageScore: avg
  })
}

// ═══════════════════════════════════════════════════════════════
// 5. RESEARCH MANAGER & MILESTONES
// ═══════════════════════════════════════════════════════════════

export function subscribeCourseResearchProjects(courseId, callback) {
  if (!courseId) return () => {}
  const q = query(
    collection(db, 'courses', courseId, 'research'),
    orderBy('createdAt', 'desc')
  )
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() })))
  }, (err) => {
    console.warn('subscribeCourseResearchProjects error:', err)
    callback([])
  })
}

export async function createResearchProject(courseId, projectData) {
  const ref = doc(collection(db, 'courses', courseId, 'research'))
  const newProject = {
    id: ref.id,
    courseId,
    ...projectData,
    status: projectData.status || 'ACTIVE',
    createdAt: serverTimestamp()
  }
  await setDoc(ref, newProject)
  return newProject
}

export async function updateResearchProject(courseId, projectId, data) {
  await updateDoc(doc(db, 'courses', courseId, 'research', projectId), data)
}

// ═══════════════════════════════════════════════════════════════
// 6. BROADCAST NOTICES & OFFICE HOURS
// ═══════════════════════════════════════════════════════════════

export function subscribeCourseNotices(courseId, callback) {
  if (!courseId) return () => {}
  const q = query(
    collection(db, 'courses', courseId, 'notices'),
    orderBy('createdAt', 'desc')
  )
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() })))
  }, (err) => {
    console.warn('subscribeCourseNotices error:', err)
    callback([])
  })
}

export async function createCourseNotice(courseId, noticeData) {
  const ref = doc(collection(db, 'courses', courseId, 'notices'))
  const newNotice = {
    id: ref.id,
    ...noticeData,
    createdAt: serverTimestamp()
  }
  await setDoc(ref, newNotice)
  return newNotice
}

export async function deleteCourseNotice(courseId, noticeId) {
  await deleteDoc(doc(db, 'courses', courseId, 'notices', noticeId))
}

export function subscribeOfficeHours(instructorUid, callback) {
  if (!instructorUid) return () => {}
  const q = query(
    collection(db, 'officeHours'),
    where('instructorUid', '==', instructorUid)
  )
  return onSnapshot(q, (snap) => {
    const data = snap.docs
      .map(d => ({ id: d.id, ...d.data() }))
      .sort((a, b) => {
        const dateCompare = (a.date || '').localeCompare(b.date || '')
        if (dateCompare !== 0) return dateCompare
        return (a.startTime || '').localeCompare(b.startTime || '')
      })
    callback(data)
  }, (err) => {
    console.warn('subscribeOfficeHours error:', err)
    callback([])
  })
}

export function subscribeCourseOfficeHours(instructorUid, courseId, callback) {
  if (!instructorUid && !courseId) return () => {}
  let q
  if (instructorUid) {
    q = query(collection(db, 'officeHours'), where('instructorUid', '==', instructorUid))
  } else {
    q = query(collection(db, 'officeHours'), where('courseId', '==', courseId))
  }
  return onSnapshot(q, (snap) => {
    const data = snap.docs
      .map(d => ({ id: d.id, ...d.data() }))
      .sort((a, b) => {
        const dateCompare = (a.date || '').localeCompare(b.date || '')
        if (dateCompare !== 0) return dateCompare
        return (a.startTime || '').localeCompare(b.startTime || '')
      })
    callback(data)
  }, (err) => {
    console.warn('subscribeCourseOfficeHours error:', err)
    callback([])
  })
}

export function subscribeStudentBookedOfficeHours(studentUid, callback) {
  if (!studentUid) return () => {}
  const q = query(
    collection(db, 'officeHours'),
    where('studentUid', '==', studentUid)
  )
  return onSnapshot(q, (snap) => {
    const data = snap.docs
      .map(d => ({ id: d.id, ...d.data() }))
      .sort((a, b) => (a.date || '').localeCompare(b.date || ''))
    callback(data)
  }, (err) => {
    console.warn('subscribeStudentBookedOfficeHours error:', err)
    callback([])
  })
}

export async function addOfficeHourSlot(slotData) {
  const ref = doc(collection(db, 'officeHours'))
  const newSlot = {
    id: ref.id,
    ...slotData,
    isBooked: false,
    createdAt: serverTimestamp()
  }
  await setDoc(ref, newSlot)
  return newSlot
}

export async function batchCreateOfficeHourSlots(slotsArray) {
  const created = []
  for (const slotData of slotsArray) {
    const ref = doc(collection(db, 'officeHours'))
    const newSlot = {
      id: ref.id,
      ...slotData,
      isBooked: false,
      createdAt: serverTimestamp()
    }
    await setDoc(ref, newSlot)
    created.push(newSlot)
  }
  return created
}

export async function bookOfficeHourSlot(slotId, studentUser, doubtDescription = '', rollNumber = '') {
  const ref = doc(db, 'officeHours', slotId)
  await updateDoc(ref, {
    isBooked: true,
    studentUid: studentUser.uid,
    studentName: studentUser.displayName || 'Student',
    studentEmail: studentUser.email || '',
    studentRollNumber: rollNumber || '',
    doubtDescription: doubtDescription.trim(),
    bookedAt: serverTimestamp()
  })
}

export async function cancelOfficeHourBooking(slotId) {
  const ref = doc(db, 'officeHours', slotId)
  await updateDoc(ref, {
    isBooked: false,
    studentUid: null,
    studentName: null,
    studentEmail: null,
    studentRollNumber: null,
    doubtDescription: null,
    bookedAt: null
  })
}

export async function updateOfficeHourSlot(slotId, data) {
  await updateDoc(doc(db, 'officeHours', slotId), data)
}

export async function deleteOfficeHourSlot(slotId) {
  await deleteDoc(doc(db, 'officeHours', slotId))
}
