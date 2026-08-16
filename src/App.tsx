import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { PlannerProvider, usePlanner } from './context/PlannerContext';
import { MusicProvider, useMusic } from './context/MusicContext';
import { HabitProvider } from './context/HabitContext';

import { Sidebar, TabValue } from './components/common/Sidebar';
import { Dashboard } from './components/dashboard/Dashboard';
import { Planner } from './components/planner/Planner';
import { GoalsPage } from './components/goals/GoalsPage';
import { HabitsPage } from './components/habits/HabitsPage';
import { QuickAddTaskModal } from './components/dashboard/QuickAddTaskModal';
import { QuickAddGoalModal } from './components/dashboard/QuickAddGoalModal';
import { SmartRescheduleModal } from './components/dashboard/SmartRescheduleModal';
import { DailyReviewModal } from './components/dashboard/DailyReviewModal';

import { BeatLibrary } from './components/music/BeatLibrary';
import { BeatDetailModal } from './components/music/BeatDetailModal';
import { UploadBeatModal } from './components/music/UploadBeatModal';
import { CreatePlaylistModal } from './components/music/CreatePlaylistModal';
import { AddToPlaylistModal } from './components/music/AddToPlaylistModal';
import { StudioSessionView } from './components/music/StudioSessionView';

import { LexikaunAssistant } from './components/ai/LexikaunAssistant';

import { PersistentAudioPlayer } from './components/common/PersistentAudioPlayer';
import { GlobalCommandBar } from './components/common/GlobalCommandBar';
import { AuthModal } from './components/common/AuthModal';
import { SettingsModal } from './components/common/SettingsModal';

import { Task, Goal, Beat } from './types';

function MainAppContent() {
  const [activeTab, setActiveTab] = useState<TabValue>('dashboard');
  const [isAiOpen, setIsAiOpen] = useState(false);

  // Modals state
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isAddGoalOpen, setIsAddGoalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [isRescheduleOpen, setIsRescheduleOpen] = useState(false);
  const [isDailyReviewOpen, setIsDailyReviewOpen] = useState(false);

  const [selectedBeatForDetail, setSelectedBeatForDetail] = useState<Beat | null>(null);
  const [isUploadBeatOpen, setIsUploadBeatOpen] = useState(false);
  const [isCreatePlaylistOpen, setIsCreatePlaylistOpen] = useState(false);
  const [playlistBeatTarget, setPlaylistBeatTarget] = useState<Beat | null>(null);

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const { beats, currentBeat } = useMusic();

  const handleOpenBeatDetailById = (beatId: string) => {
    const found = beats.find((b) => b.id === beatId);
    if (found) {
      setSelectedBeatForDetail(found);
    }
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsAddTaskOpen(true);
  };

  const handleEditGoal = (goal: Goal) => {
    setEditingGoal(goal);
    setIsAddGoalOpen(true);
  };

  return (
    <div className="flex min-h-screen bg-main text-primary selection:bg-emerald-500 selection:text-black font-sans">
      {/* Sidebar for Desktop */}
      <Sidebar
        currentTab={activeTab}
        setCurrentTab={setActiveTab}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenAi={() => setIsAiOpen(true)}
      />

      {/* Main App Body */}
      <div className="flex-1 md:ml-64">
        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-8 lg:px-12 pb-32">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'dashboard' && (
                <Dashboard
                  onOpenAddTask={() => {
                    setEditingTask(null);
                    setIsAddTaskOpen(true);
                  }}
                  onOpenReschedule={() => setIsRescheduleOpen(true)}
                />
              )}

              {activeTab === 'planner' && (
                <Planner
                  onOpenAddTask={() => {
                    setEditingTask(null);
                    setIsAddTaskOpen(true);
                  }}
                  onEditTask={handleEditTask}
                  onOpenBeatDetail={handleOpenBeatDetailById}
                />
              )}

              {activeTab === 'goals' && (
                <GoalsPage
                  onOpenAddGoal={() => {
                    setEditingGoal(null);
                    setIsAddGoalOpen(true);
                  }}
                  onEditGoal={handleEditGoal}
                />
              )}

              {activeTab === 'habits' && (
                <HabitsPage />
              )}

              {activeTab === 'music' && (
                <BeatLibrary
                  onSelectBeat={(beat) => setSelectedBeatForDetail(beat)}
                  onOpenUpload={() => setIsUploadBeatOpen(true)}
                  onOpenCreatePlaylist={() => setIsCreatePlaylistOpen(true)}
                  onOpenAddToPlaylist={(beat) => setPlaylistBeatTarget(beat)}
                  onOpenStudioSession={() => setActiveTab('studio')}
                />
              )}

              {activeTab === 'studio' && (
                <StudioSessionView onOpenBeatDetail={handleOpenBeatDetailById} />
              )}
            </motion.div>
          </AnimatePresence>
        </main>

      {/* Persistent Audio Player Bar */}
      {currentBeat && (
        <PersistentAudioPlayer
          onOpenBeatDetail={handleOpenBeatDetailById}
          onOpenSession={() => setActiveTab('studio')}
        />
      )}

      {/* Planner Modals */}
      <QuickAddTaskModal
        isOpen={isAddTaskOpen}
        editingTask={editingTask}
        onClose={() => {
          setIsAddTaskOpen(false);
          setEditingTask(null);
        }}
      />

      <QuickAddGoalModal
        isOpen={isAddGoalOpen}
        editingGoal={editingGoal}
        onClose={() => {
          setIsAddGoalOpen(false);
          setEditingGoal(null);
        }}
      />

      <SmartRescheduleModal
        isOpen={isRescheduleOpen}
        onClose={() => setIsRescheduleOpen(false)}
      />

      <DailyReviewModal
        isOpen={isDailyReviewOpen}
        onClose={() => setIsDailyReviewOpen(false)}
      />

      {/* Music Modals */}
      <BeatDetailModal
        beat={selectedBeatForDetail}
        isOpen={!!selectedBeatForDetail}
        onClose={() => setSelectedBeatForDetail(null)}
        onOpenPlaylistModal={(b) => setPlaylistBeatTarget(b)}
      />

      <UploadBeatModal
        isOpen={isUploadBeatOpen}
        onClose={() => setIsUploadBeatOpen(false)}
      />

      <CreatePlaylistModal
        isOpen={isCreatePlaylistOpen}
        onClose={() => setIsCreatePlaylistOpen(false)}
      />

      <AddToPlaylistModal
        beat={playlistBeatTarget}
        isOpen={!!playlistBeatTarget}
        onClose={() => setPlaylistBeatTarget(null)}
        onOpenCreatePlaylist={() => setIsCreatePlaylistOpen(true)}
      />

      {/* Common Modals */}
      <GlobalCommandBar
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectTask={(task) => {
          setActiveTab('planner');
          handleEditTask(task);
        }}
        onSelectGoal={(goal) => {
          setActiveTab('goals');
          handleEditGoal(goal);
        }}
        onSelectBeat={(beat) => {
          setActiveTab('music');
          setSelectedBeatForDetail(beat);
        }}
        onActionAskLexikaun={() => setIsAiOpen(true)}
        onActionCreateTask={() => {
          setEditingTask(null);
          setIsAddTaskOpen(true);
        }}
        onActionCreateGoal={() => {
          setEditingGoal(null);
          setIsAddGoalOpen(true);
        }}
      />

      <LexikaunAssistant isOpen={isAiOpen} onClose={() => setIsAiOpen(false)} />

      {/* Auth & Settings */}
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <PlannerProvider>
          <MusicProvider>
            <HabitProvider>
              <MainAppContent />
            </HabitProvider>
          </MusicProvider>
        </PlannerProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}
