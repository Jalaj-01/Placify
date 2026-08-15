# 🎓 Placify — Student Module Technical & Architectural Documentation

Welcome to the comprehensive technical documentation for the **Student Module** of **Placify**. 

Placify's Student Module is an end-to-end placement preparation, skill mastery, and academic collaboration ecosystem designed specifically for engineering undergraduates and job seekers.

---

## 📑 Table of Contents
1. [Module Architecture & Tech Stack](#1-module-architecture--tech-stack)
2. [Student Command Center (Dashboard)](#2-student-command-center-dashboard)
3. [Automated Subject Mastery & Focus Queue](#3-automated-subject-mastery--focus-queue)
4. [Placement Application Pipeline (Kanban)](#4-placement-application-pipeline-kanban)
5. [Real-Time Collaborative Group Study Hub](#5-real-time-collaborative-group-study-hub)
6. [Multi-Language Code Playground & Verilog Sandbox](#6-multi-language-code-playground--verilog-sandbox)
7. [Distraction-Free Course Vault](#7-distraction-free-course-vault)
8. [Automated Coding Assessments & Anti-Cheat Student IDE](#8-automated-coding-assessments--anti-cheat-student-ide)
9. [Academic Classroom Enrollment (6-Character Code)](#9-academic-classroom-enrollment-6-character-code)
10. [AI Coach & OA Mock Assessment Timer](#10-ai-coach--oa-mock-assessment-timer)

---

## 1. Module Architecture & Tech Stack

```
Student Client (React.js + Tailwind CSS)
   │
   ├── Firebase Authentication (Google Auth & Session Persistence)
   ├── Cloud Firestore (Profiles, Streaks, Topics, Applications, Enrolled Courses)
   ├── Socket.io Client (Real-time group study rooms, shared notes & code sync)
   ├── Monaco Editor / Sandboxes (Python, Java, C++, JS, Verilog execution)
   └── REST API Service Layer (Judge0 / Isolated Docker Subprocesses)
```

* **Frontend Framework**: React 18, Vite, Tailwind CSS with dynamic design tokens.
* **Database & Sync**: Cloud Firestore real-time listeners (`onSnapshot`) for instant state synchronization.
* **Real-time WebSockets**: Socket.io on port `5000` for live multi-user collaboration.
* **Code Execution**: Node.js sandbox subprocesses with timeout and resource constraint enforcement.

---

## 2. Student Command Center (Dashboard)
File: [`client/src/components/dashboard/StudentDashboard.jsx`](file:///g:/Placify/placify/client/src/components/dashboard/StudentDashboard.jsx)

The student dashboard serves as the central command console, presenting unified metrics:
* **Current Streak & Activity Heatmap**: Tracks daily problem-solving consistency over a rolling 90-day window.
* **Placement Applications Velocity**: Displays quick counts of Wishlist, Applied, Online Assessment, and Interview stages.
* **Quick Action Launchers**: Direct triggers for the **OA Mock Timer**, **AI Coach Drawer**, and **Group Study Hub**.

---

## 3. Automated Subject Mastery & Focus Queue
Files: [`client/src/hooks/useTopics.js`](file:///g:/Placify/placify/client/src/hooks/useTopics.js), [`client/src/pages/Topics.jsx`](file:///g:/Placify/placify/client/src/pages/Topics.jsx)

* **Automated Subject Mastery Engine**:
  * Tracks progress percentages across 3 primary placement domains:
    1. **DSA** (Arrays, Trees, Graphs, Dynamic Programming, Greedy).
    2. **Core CS Theory** (Operating Systems, DBMS, Computer Networks, System Design).
    3. **Aptitude & Logical Reasoning** (Quantitative, Verbal, Logical).
  * Automatically calculates mastery scores based on logged problem difficulty and review intervals.
* **Automated Daily Focus Queue**:
  * Analyzes historical accuracy and revision dates to formulate a prioritized daily focus list of questions needing spaced repetition.

---

## 4. Placement Application Pipeline (Kanban)
Files: [`client/src/components/applications/ApplicationsKanban.jsx`](file:///g:/Placify/placify/client/src/components/applications/ApplicationsKanban.jsx), [`client/src/pages/Applications.jsx`](file:///g:/Placify/placify/client/src/pages/Applications.jsx)

* **Responsive 6-Stage Pipeline**:
  1. *Wishlist* → 2. *Applied* → 3. *Online Assessment (OA)* → 4. *Technical Interview* → 5. *HR Interview* → 6. *Offer Received*
* **Glassmorphic Status Dropdown**:
  * Utilizes Radix UI Custom `Select` with color-coded dot indicators (`bg-semantic-green`, `bg-purple-500`, `bg-accent`).
* **Automated URL Job Parser**:
  * Extracts job title, company name, and location automatically from job posting URLs via `/api/parse-url`.

---

## 5. Real-Time Collaborative Group Study Hub
Files: [`client/src/components/study/GroupStudyModal.jsx`](file:///g:/Placify/placify/client/src/components/study/GroupStudyModal.jsx), [`client/src/components/study/InvitesDrawer.jsx`](file:///g:/Placify/placify/client/src/components/study/InvitesDrawer.jsx)

* **Co-Watching Lecture Player**:
  * Real-time YouTube synchronization allowing student study groups to watch technical lectures simultaneously.
* **Live Markdown Shared Notes**:
  * Bi-directional real-time text sync powered by WebSockets so peers can take lecture notes together.
* **Pair Programming Console**:
  * Collaborative code editor with multi-language execution.
* **Live Contribution Points Engine**:
  * Real-time formula measuring peer engagement:
    * `+10 pts` per collaborative note edit
    * `+15 pts` per sandbox code run
    * `+10 pts` per shared video load
  * Features a **Live Contributors Badge Bar** and interactive calculation formula popover.

---

## 6. Multi-Language Code Playground & Verilog Sandbox
Files: [`client/src/pages/Playground.jsx`](file:///g:/Placify/placify/client/src/pages/Playground.jsx), [`server/src/routes/execute.js`](file:///g:/Placify/placify/server/src/routes/execute.js)

* **Supported Languages**:
  * **Python 3**, **JavaScript (Node.js)**, **Java 17**, **C++ (g++)**, **C (gcc)**.
  * **Verilog HDL Hardware Simulator**: Compiles testbenches and modules with Icarus Verilog (`iverilog`) and displays waveform/monitor outputs.
* **Execution Capabilities**:
  * Custom `stdin` input support.
  * Execution time metrics in milliseconds (`ms`).
  * Instant stdout/stderr terminal formatting.

---

## 7. Distraction-Free Course Vault
File: [`client/src/pages/Courses.jsx`](file:///g:/Placify/placify/client/src/pages/Courses.jsx)

* **Ad-Free Learning Workspace**:
  * Consolidates YouTube course playlists and single lectures into a distraction-free player.
* **Resume Playback & Progress Sync**:
  * Automatically records elapsed watch time and completion percentage into Firestore.
* **Side-Playground Integration**:
  * Slide-out interactive coding workspace with split-pane layout to practice code while watching video lectures.

---

## 8. Automated Coding Assessments & Anti-Cheat Student IDE
File: [`client/src/components/teacher/StudentCodingAssessmentModal.jsx`](file:///g:/Placify/placify/client/src/components/teacher/StudentCodingAssessmentModal.jsx)

* **Split-Pane Assessment Workspace**:
  * **Left Pane**: Rich problem description, input/output requirements, constraints, and visible sample test cases.
  * **Right Pane**: Monaco/Code IDE locked to teacher-allowed languages with pre-populated starter boilerplates.
* **Sandbox Sample Runner**:
  * "Run Sample Cases" button compiles code in an isolated sandbox against visible cases without submitting.
* **Anti-Cheat Enforcement Engine**:
  * **Clipboard Interception**: Blocks `copy`, `paste`, and `cut` hotkeys and context menus.
  * **Focus Loss Tracking**: Listens to `window.onblur` events to track tab switching.
  * **Integrity Scoring**: Automatically penalizes integrity score on unauthorized actions and warns student before auto-submission.
* **Final Submission Pipeline**:
  * Executes code against all teacher hidden test cases via backend `/api/assessments/evaluate` and saves grade breakdown.

---

## 9. Academic Classroom Enrollment (6-Character Code)
File: [`client/src/components/teacher/StudentCourseEnrollModal.jsx`](file:///g:/Placify/placify/client/src/components/teacher/StudentCourseEnrollModal.jsx)

* **One-Click Enrollment**:
  * Students enter a 6-character alphanumeric code (e.g. `DS302A`) provided by their university teacher.
  * Enrolls student into the teacher's official course roster, linking them to syllabus progress, class notices, and assignments.

---

## 10. AI Coach & OA Mock Assessment Timer
Files: [`client/src/components/ai/AICoachDrawer.jsx`](file:///g:/Placify/placify/client/src/components/ai/AICoachDrawer.jsx), [`client/src/components/layout/TopFloatingTimerCapsule.jsx`](file:///g:/Placify/placify/client/src/components/layout/TopFloatingTimerCapsule.jsx)

* **24/7 AI Placement Coach**:
  * Powered by Gemini AI via `/api/ai/chat` for instant code debugging, concept breakdowns, and resume guidance.
* **Floating OA Assessment Timer**:
  * Persistent global countdown capsule that tracks mock test duration across page transitions.
