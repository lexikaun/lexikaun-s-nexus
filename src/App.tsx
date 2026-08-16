import React, { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { PlannerProvider, usePlanner } from './context/PlannerContext';
import { MusicProvider, useMusic } from './context/MusicContext';

import { Header } from './components/common/Header';
import { TodayOverview } from './components/dashboard/TodayOverview';
import { TimeBlockingTimeline } from './components/dashboard/TimeBlockingTimeline';
import { TasksList } from './components/dashboard/TasksList';
import { GoalsList } from './components/dashboard/GoalsList';
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

import { PersistentAudioPlayer } from './components/common/PersistentAudioPlayer';
import { GlobalSearchModal } from './components/common/GlobalSearchModal';
import { AuthModal } from './components/common/AuthModal';
import { SettingsModal } from './components/common/SettingsModal';

import { Task, Goal, Beat } from './types';

function MainAppContent() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'music' | 'studio'>('dashboard');

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
    <div className="min-h-screen bg-[#0A0C10] text-slate-100 selection:bg-emerald-500 selection:text-black">
      {/* Top Main Navigation Header */}
      <Header
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab as any)}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Main App Body */}
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 pb-32">
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Top Overview Bar */}
            <TodayOverview
              onOpenAddTask={() => {
                setEditingTask(null);
                setIsAddTaskOpen(true);
              }}
              onOpenAddGoal={() => {
                setEditingGoal(null);
                setIsAddGoalOpen(true);
              }}
              onOpenDailyReview={() => setIsDailyReviewOpen(true)}
              onOpenReschedule={() => setIsRescheduleOpen(true)}
            />

            {/* Visual Time-Blocking Timeline */}
            <TimeBlockingTimeline
              onOpenAddTask={() => {
                setEditingTask(null);
                setIsAddTaskOpen(true);
              }}
              onSelectTask={handleEditTask}
            />

            {/* Split Grid: Today's Tasks vs Daily Goals */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
              <div className="lg:col-span-7">
                <TasksList
                  onOpenAddTask={() => {
                    setEditingTask(null);
                    setIsAddTaskOpen(true);
                  }}
                  onEditTask={handleEditTask}
                  onOpenBeatDetail={handleOpenBeatDetailById}
                />
              </div>

              <div className="lg:col-span-5">
                <GoalsList
                  onOpenAddGoal={() => {
                    setEditingGoal(null);
                    setIsAddGoalOpen(true);
                  }}
                  onEditGoal={handleEditGoal}
                />
              </div>
            </div>
          </div>
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
      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectTask={(task) => {
          setActiveTab('dashboard');
          handleEditTask(task);
        }}
        onSelectGoal={(goal) => {
          setActiveTab('dashboard');
          handleEditGoal(goal);
        }}
        onSelectBeat={(beat) => {
          setSelectedBeatForDetail(beat);
        }}
      />

      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <PlannerProvider>
          <MusicProvider>
            <MainAppContent />
          </MusicProvider>
        </PlannerProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}
