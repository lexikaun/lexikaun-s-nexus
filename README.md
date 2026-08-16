# Lexikaun's Nexus (LifeBeatOS)

> **The High-Performance Operating System for Music Producers & Modern Creatives.**  
> A unified dual-space productivity and creative hub blending day/week time-blocking, goal & habit tracking, recurrence engine, and smart partial rescheduling with an audio production suite.

---

## ⚡ Overview & Core Philosophy

Lexikaun's Nexus is engineered under **Option E — Warm Editorial Dark** aesthetics:
- **Background**: `#0B0B0A` (Deep Carbon)
- **Surface**: `#151412` (Warm Graphite)
- **Borders & Dividers**: `#242220` (Subtle Hairline)
- **Text**: `#F2F0E9` (Warm Bone) / `#95928A` (Muted Secondary)
- **Accent**: `#E4423A` (Warm Crimson)

The workspace separates creative work into two distinct environments via a persistent space-switcher:
1. **Personal Space**: Life-side rituals, habit streak tracking, self-care routines, and personal day planning.
2. **Professional Space**: EP/album production, master stem bounces, client deadlines, sound design sessions, and linked goal milestones.

---

## 🚀 Live Features

### 1. Today View (`/today` & `/professional/today`)
- **Today's Focus**: Top active high-priority goals with deadlines and linked completion stats.
- **Current Task (Active Focus)**: Displays the active task with a live pulsing indicator and one-click completion.
- **Timeline & Upcoming**: Chronological scheduled tasks for today formatted as clean single-row divider lists (no nested box clutter).
- **Daily Habits (Personal)**: Interactive daily streak counter with one-click completion toggles.

### 2. Time-Blocking Planner (`/planner` & `/professional/planner`)
- **Day View Canvas**: Hourly time slots (`07:00` to `22:00`). Click any empty slot to instantly schedule a task prefilled with that time.
- **Week View Canvas**: 7-column calendar overview showing all scheduled time blocks per day with quick-add buttons.
- **Date Navigator**: Seamless `<` `Today / Selected Date` `>` jumping.
- **Real-time Sync**: Direct Firestore + LocalStorage real-time sync with offline fallback.

### 3. Recurrence Engine
- Built-in recurrence expansion (`daily`, `weekdays`, `weekly`, `monthly`, `until`).
- Automatically calculates and populates future occurrences across day and week views.

### 4. Smart Partial Rescheduling
- When a planned session is only partially completed (e.g. worked 1 hour of a 2-hour planned slot):
  - Click the **Smart Reschedule (`✨`)** action.
  - Input actual minutes completed.
  - Automatically calculates the remaining duration and proposes a follow-up slot on tomorrow's schedule.
  - One-click creates the follow-up task and marks the original session completed with actual duration recorded.

### 5. Habit Streak Algorithm
- Consecutive day traversal with **active grace period logic** (yesterday completed + today pending maintains active streak).

### 6. Creative & Audio Tools
- **Tap Tempo (`/tools/tap-tempo`)**: Interactive real-time BPM detection with tap-averaging algorithm.
- **Key & BPM Finder (`/tools/key-bpm`)**: Audio file analyzer interface.
- **Persistent Audio Engine**: Web Audio API waveform decoding and persistent bottom player bar.

---

## 🛠 Tech Stack

- **Frontend**: React 19, TypeScript, Vite
- **Styling**: Tailored Design Tokens (Option E Warm Dark Palette)
- **Database & Auth**: Firebase Firestore 12, Firebase Authentication
- **Offline Cache**: LocalStorage + IndexedDB multi-tier persistence
- **Icons**: Lucide React
- **Testing**: Mocha, `@firebase/rules-unit-testing`, TSX

---

## 🔒 Security & Data Architecture

- **Firestore Security Rules**: User isolation strictly enforced:
  ```javascript
  match /users/{userId}/tasks/{taskId} {
    allow read, write: if request.auth != null && request.auth.uid == userId;
  }
  ```
- **Automated Rules & Integration Test Suite**: 18/18 tests passing against local Firebase Emulator.

---

## 💻 Getting Started Locally

### Prerequisites
- Node.js (v18+)
- npm

### Installation
```bash
# Clone the repository
git clone https://github.com/lexikaun/lexikaun-s-nexus.git

# Navigate to the workspace
cd lexikaun-s-nexus

# Install dependencies
npm install

# Start the Vite development server
npm run dev
```

### Running Tests
```bash
# Run unit & emulator integration tests
npm test
```

### Production Build
```bash
# Build optimized production bundle
npm run build
```

---

## 🗺 Project Structure

```
lexikaun-s-nexus/
├── src/
│   ├── components/
│   │   ├── layout/            # AppLayout, Sidebar with space switcher
│   │   ├── planner/           # TimeBlockPlanner day/week canvas
│   │   ├── ui/                # Button, Input, Modal, Card, ListItem
│   │   ├── common/            # PersistentAudioPlayer, GlobalSearchModal
│   │   └── music/             # BeatCard, BeatLibrary, Stem modals
│   ├── config/                # Firebase configuration
│   ├── context/               # AuthContext, ThemeContext
│   ├── pages/                 # Today, Planner, Goals, Habits, Audio Tools
│   ├── services/              # db.ts (CRUD & Realtime sync), audioEngine.ts
│   ├── utils/                 # recurrence.ts, smartReschedule.ts, streak.ts
│   └── types.ts               # Strict TypeScript schemas
├── test/                      # Mocha test suites (Rules, CRUD, Recurrence, Reschedule)
├── firestore.rules            # Granular Firestore security rules
└── vite.config.ts             # Vite build configuration
```

---

## 📄 License
Private Creative Workspace © 2026 Lexikaun. All rights reserved.
