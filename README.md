# PlacementTracker

A premium PWA for tracking placement preparation — coding problems, DSA topics, CS theory, aptitude, and job applications.

## Tech Stack

- **Frontend:** React 18, Vite, Tailwind CSS, Shadcn/UI, Framer Motion, Zustand, React Router
- **Backend:** Node.js + Express (Render), Firebase Authentication, Cloud Firestore (Spark plan)
- **AI:** Google Gemini 1.5 Flash (via Express backend)
- **Deploy:** Vercel (frontend) + Render (backend) + Firebase (auth/database)

## Project Structure

```
placement-tracker/
├── client/          # React frontend (Vite)
├── server/          # Node.js + Express backend (Render)
├── firestore.rules  # Security rules
└── firebase.json    # Firebase config
```

## Setup

### 1. Firebase Console

1. Create a project at [Firebase Console](https://console.firebase.google.com)
2. Enable **Authentication** → Google provider
3. Create **Firestore** database (start in test mode for dev)
4. Copy your web app config from Project Settings

### 2. Environment Variables

**client/.env:**
```
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_firebase_app_id
VITE_API_URL=http://localhost:3001
```

**server/.env:**
```
PORT=3001
CLIENT_URL=http://localhost:5173
FIREBASE_PROJECT_ID=your_project_id
GEMINI_API_KEY=your_gemini_api_key
```

### 3. Install & Run

```bash
# Backend (Server)
cd server
npm install
npm run dev

# Frontend (Client)
cd client
npm install
npm run dev
```

### 4. Deploy

```bash
# Firestore rules & indexes
firebase deploy --only firestore

# Backend → Render (connect GitHub repo, set env vars, command: npm start)
# Frontend → Vercel (connect GitHub repo, set env vars, command: npm run build)
```

## Development Phases

| Phase | Status | Description |
|-------|--------|-------------|
| 1 | ✅ | Project scaffolding |
| 2 | ✅ | Authentication & Onboarding Seeding |
| 3 | ✅ | Collapsible Sidebar Layout & Navigation |
| 4 | ✅ | Expandable Topics checklists & Status Cycling |
| 5 | ✅ | Problem log with LeetCode/GFG parser |
| 6 | ✅ | Applications page with list view and Kanban Drag & Drop |
| 7 | ✅ | Personalized dashboard & Daily Focus Queue |
| 8 | ✅ | Gemini-powered AI coach & topic refresher |
| 9 | ✅ | PWA config, offline handling, and animations |
| 10 | ✅ | Ready for deployment |
