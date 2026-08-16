import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Music2,
  Clock,
  Plus,
  Search,
  Moon,
  Sun,
  Sparkles,
  User,
  Sliders,
  CheckCircle2,
  Radio,
  FolderPlus,
  Flame,
} from 'lucide-react';
import { usePlanner } from '../../context/PlannerContext';
import { useMusic } from '../../context/MusicContext';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

interface HeaderProps {
  currentTab: 'dashboard' | 'music' | 'session' | 'review';
  setCurrentTab: (tab: 'dashboard' | 'music' | 'session' | 'review') => void;
  onOpenSearch: () => void;
  onOpenAddTask: () => void;
  onOpenAddGoal: () => void;
  onOpenUploadBeat: () => void;
  onOpenAuth: () => void;
  onOpenSettings: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  setCurrentTab,
  onOpenSearch,
  onOpenAddTask,
  onOpenAddGoal,
  onOpenUploadBeat,
  onOpenAuth,
  onOpenSettings,
}) => {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { activeSession, startSession } = useMusic();
  const { rescheduleSuggestions } = usePlanner();

  const [timeString, setTimeString] = useState<string>('');
  const [dateString, setDateString] = useState<string>('');
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeString(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })
      );
      setDateString(
        now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header
      id="app-header"
      className="sticky top-0 z-40 flex items-center justify-between border-b border-[#1E2430] bg-[#0A0C10]/95 px-4 py-2.5 backdrop-blur-xl transition-colors sm:px-6"
    >
      {/* Brand & Main Tabs */}
      <div className="flex items-center space-x-6">
        <div
          id="brand-logo"
          className="flex cursor-pointer items-center space-x-3 group"
          onClick={() => setCurrentTab('dashboard')}
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 text-black shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
            <Radio className="h-4 w-4 stroke-[2.5]" />
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="font-bold tracking-tight text-slate-100 text-sm">
              LEXIKAUN'S
            </span>
            <span className="rounded-md border border-emerald-500/30 bg-emerald-500/10 px-1.5 py-0.5 text-[9px] font-mono font-semibold tracking-wider text-emerald-400">
              NEXUS
            </span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="hidden items-center space-x-1 sm:flex">
          <button
            id="nav-tab-dashboard"
            onClick={() => setCurrentTab('dashboard')}
            className={`flex items-center space-x-2 rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all ${
              currentTab === 'dashboard'
                ? 'border border-slate-750 bg-[#141820] text-emerald-400 shadow-sm'
                : 'text-slate-400 hover:bg-[#0F1218] hover:text-slate-200'
            }`}
          >
            <Calendar className="h-3.5 w-3.5" />
            <span>Dashboard</span>
            {rescheduleSuggestions.length > 0 && (
              <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-amber-500/20 border border-amber-500/40 px-1 text-[10px] font-bold text-amber-400">
                {rescheduleSuggestions.length}
              </span>
            )}
          </button>

          <button
            id="nav-tab-music"
            onClick={() => setCurrentTab('music')}
            className={`flex items-center space-x-2 rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all ${
              currentTab === 'music'
                ? 'border border-slate-750 bg-[#141820] text-emerald-400 shadow-sm'
                : 'text-slate-400 hover:bg-[#0F1218] hover:text-slate-200'
            }`}
          >
            <Music2 className="h-3.5 w-3.5" />
            <span>My Music</span>
          </button>

          <button
            id="nav-tab-session"
            onClick={() => {
              if (!activeSession) {
                startSession();
              }
              setCurrentTab('session');
            }}
            className={`flex items-center space-x-2 rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all ${
              currentTab === 'session'
                ? 'border border-emerald-500/40 bg-emerald-500/15 text-emerald-300 shadow-sm'
                : 'text-slate-400 hover:bg-[#0F1218] hover:text-slate-200'
            }`}
          >
            <Flame className={`h-3.5 w-3.5 ${activeSession?.isRunning ? 'text-emerald-400 animate-pulse' : ''}`} />
            <span>Studio Session</span>
            {activeSession?.isRunning && (
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
            )}
          </button>

          <button
            id="nav-tab-review"
            onClick={() => setCurrentTab('review')}
            className={`flex items-center space-x-2 rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all ${
              currentTab === 'review'
                ? 'border border-slate-750 bg-[#141820] text-emerald-400 shadow-sm'
                : 'text-slate-400 hover:bg-[#0F1218] hover:text-slate-200'
            }`}
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>Daily Review</span>
          </button>
        </nav>
      </div>

      {/* Center Live Clock Badge */}
      <div className="hidden items-center space-x-2 rounded-full border border-[#1E2430] bg-[#0F1218] px-3.5 py-1 text-xs text-slate-400 md:flex">
        <Clock className="h-3.5 w-3.5 text-emerald-400" />
        <span className="font-medium text-slate-300">{dateString}</span>
        <span className="text-slate-600">·</span>
        <span className="font-mono font-bold text-emerald-400 tracking-wider">{timeString}</span>
      </div>

      {/* Right Action Controls */}
      <div className="flex items-center space-x-2.5">
        {/* Global Search Button */}
        <button
          id="btn-global-search"
          onClick={onOpenSearch}
          className="flex items-center space-x-2 rounded-xl border border-[#1E2430] bg-[#0F1218] px-3 py-1.5 text-xs text-slate-400 transition hover:border-slate-700 hover:bg-[#141820] hover:text-slate-200"
          title="Search anything (Cmd+K)"
        >
          <Search className="h-3.5 w-3.5 text-slate-400" />
          <span className="hidden sm:inline">Search...</span>
          <kbd className="hidden rounded border border-slate-800 bg-[#0A0C10] px-1.5 py-0.5 font-mono text-[9px] text-slate-500 sm:inline">
            ⌘K
          </kbd>
        </button>

        {/* Sleek Quick Add Button & Dropdown */}
        <div className="relative">
          <button
            id="btn-quick-add"
            onClick={() => setIsQuickAddOpen(!isQuickAddOpen)}
            className="flex items-center space-x-1.5 rounded-xl bg-emerald-500 px-3 py-1.5 text-xs font-bold text-black shadow-lg shadow-emerald-500/20 transition hover:bg-emerald-400 active:scale-95"
          >
            <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
            <span className="hidden sm:inline">Quick Add</span>
          </button>

          {isQuickAddOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setIsQuickAddOpen(false)}
              />
              <div className="absolute right-0 top-full z-50 mt-2 w-52 rounded-2xl border border-[#1E2430] bg-[#0F1218] p-1.5 shadow-2xl backdrop-blur-xl">
                <button
                  id="action-add-task"
                  onClick={() => {
                    setIsQuickAddOpen(false);
                    onOpenAddTask();
                  }}
                  className="flex w-full items-center space-x-2.5 rounded-xl px-3 py-2 text-left text-xs font-semibold text-slate-300 transition hover:bg-[#141820] hover:text-emerald-400"
                >
                  <Clock className="h-3.5 w-3.5 text-emerald-400" />
                  <span>New Scheduled Task</span>
                </button>

                <button
                  id="action-add-goal"
                  onClick={() => {
                    setIsQuickAddOpen(false);
                    onOpenAddGoal();
                  }}
                  className="flex w-full items-center space-x-2.5 rounded-xl px-3 py-2 text-left text-xs font-semibold text-slate-300 transition hover:bg-[#141820] hover:text-emerald-400"
                >
                  <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
                  <span>New Day Goal</span>
                </button>

                <div className="my-1 border-t border-[#1E2430]" />

                <button
                  id="action-upload-beat"
                  onClick={() => {
                    setIsQuickAddOpen(false);
                    onOpenUploadBeat();
                  }}
                  className="flex w-full items-center space-x-2.5 rounded-xl px-3 py-2 text-left text-xs font-semibold text-slate-300 transition hover:bg-[#141820] hover:text-emerald-400"
                >
                  <Music2 className="h-3.5 w-3.5 text-pink-400" />
                  <span>Upload Beat Audio</span>
                </button>

                <button
                  id="action-start-session"
                  onClick={() => {
                    setIsQuickAddOpen(false);
                    startSession();
                    setCurrentTab('session');
                  }}
                  className="flex w-full items-center space-x-2.5 rounded-xl px-3 py-2 text-left text-xs font-semibold text-slate-300 transition hover:bg-[#141820] hover:text-emerald-400"
                >
                  <Flame className="h-3.5 w-3.5 text-amber-400" />
                  <span>Launch Studio Session</span>
                </button>
              </div>
            </>
          )}
        </div>

        {/* Settings Toggle */}
        <button
          id="btn-settings-toggle"
          onClick={onOpenSettings}
          className="rounded-xl border border-[#1E2430] bg-[#0F1218] p-1.5 text-slate-400 transition hover:border-slate-700 hover:text-slate-200"
          title="Settings & Preferences"
        >
          <Sliders className="h-4 w-4" />
        </button>

        {/* User Profile Pill */}
        <button
          id="btn-profile-toggle"
          onClick={onOpenAuth}
          className="flex items-center space-x-2 rounded-xl border border-[#1E2430] bg-[#0F1218] py-1 pl-1.5 pr-3 text-xs font-medium text-slate-300 transition hover:border-slate-750 hover:bg-[#141820]"
          title="Account / Authentication"
        >
          <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-gradient-to-tr from-emerald-500 to-indigo-600 text-[11px] font-bold text-black">
            {user?.displayName ? user.displayName.charAt(0).toUpperCase() : 'U'}
          </div>
          <span className="max-w-[70px] truncate sm:max-w-[90px] text-slate-300 font-semibold">
            {user?.displayName || 'Sign In'}
          </span>
        </button>
      </div>
    </header>
  );
};
