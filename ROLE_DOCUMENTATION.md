# Placify Multi-Role Architecture & Features Guide

Welcome to **Placify** — a comprehensive academic & placement prep platform built for **Students**, **Teachers / Mentors**, and **PhD / Research Scholars**.

This document provides a detailed breakdown of the multi-role system, security onboarding, dynamic features, automated tracking engines, and collaborative tools implemented so far.

---

## 📑 Table of Contents
1. [Overview & Role Onboarding Security](#1-overview--role-onboarding-security)
2. [🎓 Role 1: Student / Candidate](#-role-1-student--candidate)
   - [Automated Subject Mastery Engine](#automated-subject-mastery-engine)
   - [Automated Daily Focus Queue](#automated-daily-focus-queue)
   - [Placement Application Board & Streak](#placement-application-board--streak)
   - [Collaborative Group Study Hub](#collaborative-group-study-hub)
3. [👨‍🏫 Role 2: Teacher / Mentor](#-role-2-teacher--mentor)
   - [Editable Course & Syllabus Pace Tracker](#editable-course--syllabus-pace-tracker)
   - [Editable Timetable & Full Weekly Schedule](#editable-timetable--full-weekly-schedule)
   - [Automated Cohort Risk Detection](#automated-cohort-risk-detection)
   - [Real-Time Class Announcement Broadcast System](#real-time-class-announcement-broadcast-system)
4. [🔬 Role 3: PhD / Research Scholar](#-role-3-phd--research-scholar)
   - [Manuscript Publication Pipeline](#manuscript-publication-pipeline)
   - [Thesis / Dissertation Milestones](#thesis--dissertation-milestones)
   - [Research Grants & Funding Tracker](#research-grants--funding-tracker)
5. [🤖 AI Assistant / Coach Integration](#-ai-assistant--coach-integration)
6. [☀️ Light / Dark Mode Theme Support](#%EF%B8%8F-light--dark-mode-theme-support)

---

## 1. Overview & Role Onboarding Security

When a user logs into Placify for the first time, they are presented with the **Role Onboarding Modal** (`RoleOnboardingModal.jsx`).

### Key Onboarding Features:
- **Role Selection**: Users select their primary academic identity: **Student**, **Teacher / Mentor**, or **PhD Scholar**.
- **Mandatory Faculty Verification**:
  - Selecting **Teacher / Mentor** requires entering an official Teacher ID / Verification Key (e.g. `JALAJ2026` or `TEACHER2026`).
  - Unauthorized entry attempts are blocked, ensuring students cannot access teacher monitoring tools.
- **Role-Filtered Sidebar Navigation**:
  - The navigation sidebar (`Sidebar.jsx`) dynamically filters menu links based on the active role, displaying only relevant tools and hiding unnecessary features.

---

## 🎓 Role 1: Student / Candidate

The **Student Dashboard** (`StudentDashboard.jsx`) serves as an automated placement command center designed for skill mastery, interview preparation, and peer study collaboration.

### Key Features:

#### Automated Subject Mastery Engine
- Automatically computes progress percentages in core subjects (**DSA**, **CS Theory - OS/DBMS/CN**, and **Aptitude**) based on logged solved problems and code executions.
- Eliminates manual checkbox ticking by automatically mapping problem tags to subject mastery metrics.

#### Automated Daily Focus Queue
- Generates daily practice recommendations based on student problem-solving velocity and weakest competency areas.

#### Placement Application Board & Streak
- Visual pipeline tracking job applications across stages (*Wishlist, Applied, Online Assessment, Interview, Offer*).
- Integrated activity log and streak heatmap bar to maintain daily problem-solving momentum.

#### Collaborative Group Study Hub (`GroupStudyModal.jsx`)
- **Co-Watch Video & Shared Parallel Notes**:
  - Students can enter a shared study room, paste any YouTube video link, and watch course lectures together while co-editing real-time shared notes.
- **Pair Code Execution**:
  - Collaborative JavaScript code runner in Playground for pair programming and test case execution.
- **Automated Contribution Score Leaderboard**:
  - Automatically calculates peer contribution scores (+15 pts for notes created, +20 pts for code executions) to track *"who contributed what and how much"* during study sessions.

---

## 👨‍🏫 Role 2: Teacher / Mentor

The **Teacher Dashboard** (`TeacherDashboard.jsx`) is designed for course management, practical lab tracking, cohort analytics, and student announcements.

### Key Features:

#### Editable Course & Syllabus Pace Tracker
- **Custom Courses & Sections**: Teachers can add, edit, or delete their assigned subjects (e.g., *CS301 Data Structures - Sec 3A*).
- **Syllabus Completion %**: Visual progress bars showing syllabus completion status (*On Schedule*, *Ahead of Pace*, *Review Needed*).
- **Module Tracking**: Tracks completed vs total modules, enrolled student count, and next upcoming topic.

#### Editable Timetable & Full Weekly Schedule
- **Today's Slots**: Add/edit class and lab slots with time, room number, type (*Lecture*, *Practical Lab*, *Mentorship*), and status (*Upcoming*, *Live Now*, *Completed*).
- **Full Weekly Schedule Modal**: View a complete Monday-through-Saturday grid of all scheduled classes.

#### Automated Cohort Risk Detection
- Automatically identifies struggling or inactive students (e.g., inactive for 5+ days or 0 lab check-ins) and allows sending one-click academic nudges.

#### Real-Time Class Announcement Broadcast System
- Teachers can broadcast class notices by selecting target classes dynamically generated from their active course section list.
- Published notices instantly sync to enrolled students' **Shares / Inbox** tab.

---

## 🔬 Role 3: PhD / Research Scholar

The **PhD Scholar Dashboard** (`PhdDashboard.jsx`) provides dedicated tools for academic research, journal publications, thesis progress, and research funding.

### Key Features:

#### Manuscript Publication Pipeline
- **Add / Edit Research Papers**: Add custom research paper entries, journal names (IEEE, ACM, Oxford Academic), submission status (*Drafting, Under Peer Review, Revision, Accepted, Published*), Impact Factor, and co-authors.
- **Full Edit Controls**: Edit or delete paper records anytime with instant local & cloud persistence.

#### Thesis / Dissertation Milestones
- Visual milestone progress bars tracking major thesis chapters (*Literature Review, Proposal Defense, System Architecture, Benchmark Evaluation, Final Defense*).

#### Research Grants & Funding Tracker
- Manage core research grants (e.g., SERB, DST-FIST) with target funding amounts, deadlines, and approval statuses.

---

## 🤖 AI Assistant / Coach Integration

Placify features an integrated **AI Assistant / AI Coach** tailored to each role's specific needs:

- **For Students**: *AI Interview & Skill Coach* — Generates coding hints, mock technical interview questions, and solution breakdowns.
- **For Teachers**: *AI Lesson Planner & Curriculum Assistant* — Generates lab assignments, quiz questions, and lecture outlines.
- **For PhD Scholars**: *AI Research & Literature Assistant* — Summarizes IEEE/ACM abstracts, generates LaTeX citations, and outlines literature reviews.

Clicking **"Ask AI Assistant"** on any dashboard opens the instant slide-over AI panel (`AICoachDrawer.jsx`).

---

## ☀️ Light / Dark Mode Theme Support

- **Theme Toggle**: Switch between **Dark Mode** and **Light Mode** anytime with one click using the Sun ☀️ / Moon 🌙 button in the top navigation bar and dashboard action bar.
- **Persistence**: Theme selection automatically persists in `localStorage` across page reloads.

---

*Documentation updated as of August 2026.*
