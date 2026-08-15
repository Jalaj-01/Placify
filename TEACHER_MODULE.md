# 👨‍🏫 Placify — Teacher & Classroom Management Module Technical Documentation

Welcome to the comprehensive technical and architectural documentation for the **Teacher & Classroom Management Module** of **Placify**.

This module empowers university professors, course instructors, and mentors with tools for academic syllabus tracking, routine clash detection, student research group governance, and automated coding assessments with anti-cheat audit tracking.

---

## 📑 Table of Contents
1. [Module Architecture & Tech Stack](#1-module-architecture--tech-stack)
2. [Course Vault & Classroom Roster Manager](#2-course-vault--classroom-roster-manager)
3. [Structured Syllabus Builder & Live Pace Maintainer](#3-structured-syllabus-builder--live-pace-maintainer)
4. [Weekly Routine Matrix & Clash Detection Engine](#4-weekly-routine-matrix--clash-detection-engine)
5. [Colleague Proxy & Substitute Teacher Mapping](#5-colleague-proxy--substitute-teacher-mapping)
6. [Automated Coding Assessment Studio](#6-automated-coding-assessment-studio)
7. [Student IDE & Anti-Cheat Protection Pipeline](#7-student-ide--anti-cheat-protection-pipeline)
8. [Live Assessment Gradebook & Anti-Cheat Inspector](#8-live-assessment-gradebook--anti-cheat-inspector)
9. [Student Research Project Manager (Kanban)](#9-student-research-project-manager-kanban)
10. [Classroom Notice Board & Office Hours Booking](#10-classroom-notice-board--office-hours-booking)
11. [Backend Subprocess Auto-Grading Engine](#11-backend-subprocess-auto-grading-engine)

---

## 1. Module Architecture & Tech Stack

```
Teacher Dashboard (React.js + Tailwind CSS)
   │
   ├── Firebase Firestore (Courses, Rosters, Syllabus, Timetables, Assignments, Submissions)
   ├── Real-time Sync (onSnapshot listeners for live grading & pacing updates)
   ├── Node.js / Express Backend (REST API Endpoints)
   └── Subprocess Sandbox (Python, Java, C, C++, JavaScript isolated runners)
```

* **Frontend**: React 18, Tailwind CSS, Radix UI, Lucide Icons.
* **Database**: Cloud Firestore real-time subcollections.
* **Backend**: Express.js server on port `3001` with Firebase Admin SDK.
* **Code Execution**: Isolated child processes with strict timeout enforcement (`SIGKILL`), standard stream piping, and memory safety.

---

## 2. Course Vault & Classroom Roster Manager
File: [`client/src/components/teacher/TeacherCourseManager.jsx`](file:///g:/Placify/placify/client/src/components/teacher/TeacherCourseManager.jsx)

* **6-Character Alphanumeric Course Code Generator**:
  * Automatically generates unique 6-character access codes (e.g. `DS302A`) upon course creation.
  * Allows one-click code copying to share with academic cohorts.
* **Real-Time Student Roster Subcollection**:
  * Tracks student names, official university roll numbers, email addresses, and enrollment timestamps.
* **Roster Governance**:
  * Allows instructors to toggle student status (`ACTIVE` vs `SUSPENDED`) or remove/kick unauthorized students.

---

## 3. Structured Syllabus Builder & Live Pace Maintainer
File: [`client/src/components/teacher/TeacherSyllabusTracker.jsx`](file:///g:/Placify/placify/client/src/components/teacher/TeacherSyllabusTracker.jsx)

* **Multi-Tiered Syllabus Hierarchy**:
  * **Units** (with title, marks weightage, learning outcomes, and prerequisites).
  * **Chapters** (with sub-topic sequences).
  * **Sub-Topics** (with planned lecture hours vs actual delivered hours).
* **Live Check-Off Progress Tracker**:
  * Instructors check off sub-topics in real time as lectures conclude.
  * Completion timestamp is recorded and instantly reflected in student view.
* **Analytical Pacing Engine**:
  * Computes course progress based on target semester dates and logged lectures:
    * `ON_TRACK`: Delivered lectures match expected progression timeline.
    * `AHEAD`: Delivered classes exceed planned schedule.
    * `BEHIND_SCHEDULE`: Class delivery lags by 2 or more lectures.
  * Displays real-time deviation indicators (e.g., `-3 classes behind expected`).

---

## 4. Weekly Routine Matrix & Clash Detection Engine
File: [`client/src/components/teacher/TeacherTimetableGrid.jsx`](file:///g:/Placify/placify/client/src/components/teacher/TeacherTimetableGrid.jsx)

* **Weekly Timetable Grid**:
  * Manages weekly recurring slots across Monday through Saturday for Lectures, Practical Labs, Tutorials, and Seminars.
* **Automated Clash Detection Engine**:
  * Validates every slot candidate before saving:
    * **Room Collision Check**: Prevents double-booking classroom/lab numbers at overlapping time intervals.
    * **Instructor Conflict Check**: Blocks scheduling when the instructor has an overlapping class commitment.
* **Instant Cancellation & Reschedule Flags**:
  * Teachers can cancel or reschedule classes, pushing instant alerts to enrolled students.

---

## 5. Colleague Proxy & Substitute Teacher Mapping
File: [`client/src/components/teacher/TeacherTimetableGrid.jsx`](file:///g:/Placify/placify/client/src/components/teacher/TeacherTimetableGrid.jsx)

* **Temporary Proxy Delegation**:
  * Allows instructors going on academic leave or conferences to map a substitute colleague to specific routine slots.
* **Metadata Tracked**:
  * Substitute teacher name & official email.
  * Substitution validity date range.
  * Formal reason for leave/delegation.

---

## 6. Automated Coding Assessment Studio
File: [`client/src/components/teacher/TeacherAssignmentStudio.jsx`](file:///g:/Placify/placify/client/src/components/teacher/TeacherAssignmentStudio.jsx)

* **Assessment Wizard**:
  * Problem statement formatting, difficulty rating (`EASY`, `MEDIUM`, `HARD`), and due date configuration.
  * Late submission allowances and automatic percentage penalty per day.
* **Language Locking**:
  * Selectively enables permitted languages (**Python 3**, **Java 17**, **C++**, **C**, **JavaScript**).
* **Boilerplate Code Injector**:
  * Provides customizable starter templates for each allowed language.
* **Test Case Matrix**:
  * **Sample Test Cases**: Visible to students with input, expected output, and explanation.
  * **Hidden Test Cases**: Locked from student view; evaluated securely on the backend for final scoring.

---

## 7. Student IDE & Anti-Cheat Protection Pipeline
File: [`client/src/components/teacher/StudentCodingAssessmentModal.jsx`](file:///g:/Placify/placify/client/src/components/teacher/StudentCodingAssessmentModal.jsx)

* **Split-Pane Assessment UI**:
  * Left pane displays problem specs and sample test cases.
  * Right pane provides an interactive code editor.
* **Anti-Cheat Monitoring Protocol**:
  * **Clipboard Interception**: Cancels `copy`, `paste`, and `cut` events.
  * **Context Menu Lock**: Disables right-click actions during test sessions.
  * **Focus Loss & Tab Switch Tracking**: Detects `window.onblur` events, logs violation timestamps, and displays real-time warning banners.
  * **Auto-Submission Trigger**: Optionally submits test immediately if tab switch violations exceed instructor limits.

---

## 8. Live Assessment Gradebook & Anti-Cheat Inspector
File: [`client/src/components/teacher/TeacherGradebook.jsx`](file:///g:/Placify/placify/client/src/components/teacher/TeacherGradebook.jsx)

* **Cohort Performance Overview**:
  * Real-time metrics on submission count, class average scores, and flagged cheat counts.
* **Submission Inspection Modal**:
  * **Source Code Viewer**: Full student submitted code with syntax highlighting.
  * **Test Case Breakdown**: Pass/fail status, runtime execution in milliseconds (`ms`), and stdout comparison.
  * **Anti-Cheat Audit Trail**: Detailed chronological log of tab switch focus losses and clipboard violation attempts with an **Integrity Score (0–100%)**.

---

## 9. Student Research Project Manager (Kanban)
File: [`client/src/components/teacher/TeacherResearchManager.jsx`](file:///g:/Placify/placify/client/src/components/teacher/TeacherResearchManager.jsx)

* **Research Team Registry**:
  * Tracks research project title, domain (e.g., *Computer Vision*, *Distributed Systems*), team lead, and co-researchers.
* **6-Stage Milestone Kanban Board**:
  1. *Literature Review*
  2. *Methodology & Design*
  3. *Data Collection & Prep*
  4. *Model / Code Build*
  5. *Paper / Report Draft*
  6. *Approved & Published*
* **Faculty Sign-Off Workflow**:
  * One-click "Approve & Advance" button to review deliverables and move groups to the next research milestone.

---

## 10. Classroom Notice Board & Office Hours Booking
File: [`client/src/components/teacher/TeacherCommunicationHub.jsx`](file:///g:/Placify/placify/client/src/components/teacher/TeacherCommunicationHub.jsx)

* **Priority Notice Board**:
  * Broadcasts announcements to enrolled students with priority levels (`NORMAL`, `IMPORTANT`, `URGENT`) and pinned message badges.
* **15-Minute Office Hours Slot Manager**:
  * Instructors publish 15-minute doubt-clearing appointment slots (in-person cabin or Google Meet).
  * Students book open slots and provide their specific doubt descriptions.

---

## 11. Backend Subprocess Auto-Grading Engine
Files: [`server/src/routes/assessments.js`](file:///g:/Placify/placify/server/src/routes/assessments.js), [`server/src/index.js`](file:///g:/Placify/placify/server/src/index.js)

* **Endpoint**: `POST /api/assessments/evaluate`
* **Sandbox Execution Lifecycle**:
  1. Receives source code, language, timeout, and test cases array.
  2. Creates an isolated temporary directory in OS temp storage.
  3. Spawns child execution processes (`python`, `node`, `java`, `gcc/g++`).
  4. Enforces strict timeouts via `setTimeout` and `child.kill('SIGKILL')` to prevent infinite loops (`TIME_LIMIT_EXCEEDED`).
  5. Normalizes stdout against expected output, calculates points per test case, cleans up temporary files, and returns scoring breakdown.
