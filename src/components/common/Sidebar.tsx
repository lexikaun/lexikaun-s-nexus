import React from 'react';
import {
  Calendar,
  Music2,
  Clock,
  Search,
  Sparkles,
  User,
  Sliders,
  CheckCircle2,
  Radio,
  Flame,
  LayoutDashboard,
  Target,
  Repeat,
  ListMusic
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useMusic } from '../../context/MusicContext';
import { usePlanner } from '../../context/PlannerContext';

export type TabValue = 'dashboard' | 'planner' | 'goals' | 'habits' | 'music' | 'playlists' | 'studio' | 'review' | 'ai';

interface SidebarProps {
  currentTab: TabValue;
  setCurrentTab: (tab: TabValue) => void;
  onOpenSearch: () => void;
  onOpenAuth: () => void;
  onOpenSettings: () => void;
  onOpenAi: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  setCurrentTab,
  onOpenSearch,
  onOpenAuth,
  onOpenSettings,
  onOpenAi,
}) => {
  const { user } = useAuth();
  const { activeSession, startSession } = useMusic();
  const { rescheduleSuggestions } = usePlanner();

  const primaryNav = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'planner', label: 'Planner', icon: Calendar, badge: rescheduleSuggestions.length },
    { id: 'goals', label: 'Goals', icon: Target },
    { id: 'habits', label: 'Habits', icon: Repeat },
  ];

  const musicNav = [
    { id: 'music', label: 'Music', icon: Music2 },
    { id: 'playlists', label: 'Playlists', icon: ListMusic },
  ];

  return (
    <aside className="fixed left-0 top-0 z-40 hidden h-screen w-64 flex-col justify-between border-r border-[#27272a] bg-[#09090b] px-4 py-6 md:flex">
      
      {/* Top Section */}
      <div className="space-y-8">
        {/* Branding */}
        <div 
          className="flex cursor-pointer items-center space-x-3 px-2 group"
          onClick={() => setCurrentTab('dashboard')}
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500 text-black shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
            <Radio className="h-4 w-4 stroke-[2.5]" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold tracking-wider text-slate-100 text-sm leading-tight">
              LEXIKAUN
            </span>
          </div>
        </div>

        {/* Primary Nav */}
        <nav className="space-y-1">
          <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-widest text-slate-500">
            Workspace
          </div>
          {primaryNav.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentTab(item.id as TabValue)}
                className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-[#18181b] text-emerald-400'
                    : 'text-slate-400 hover:bg-[#121214] hover:text-slate-200'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </div>
                {item.badge && item.badge > 0 ? (
                  <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-amber-500/20 px-1 text-[10px] font-bold text-amber-400">
                    {item.badge}
                  </span>
                ) : null}
              </button>
            );
          })}
        </nav>

        {/* Music Nav */}
        <nav className="space-y-1">
          <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-widest text-slate-500">
            Studio
          </div>
          {musicNav.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentTab(item.id as TabValue)}
                className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-[#18181b] text-emerald-400'
                    : 'text-slate-400 hover:bg-[#121214] hover:text-slate-200'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </div>
              </button>
            );
          })}
          
          <button
            onClick={() => {
              if (!activeSession) startSession();
              setCurrentTab('studio');
            }}
            className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              currentTab === 'studio'
                ? 'bg-emerald-500/10 text-emerald-400'
                : 'text-slate-400 hover:bg-[#121214] hover:text-slate-200'
            }`}
          >
            <div className="flex items-center space-x-3">
              <Flame className={`h-4 w-4 ${activeSession?.isRunning ? 'text-emerald-400 animate-pulse' : ''}`} />
              <span>Studio Session</span>
            </div>
          </button>
        </nav>
      </div>

      {/* Bottom Section */}
      <div className="space-y-4">
        {/* Ask Lexikaun CTA */}
        <button
          onClick={onOpenAi}
          className="group relative flex w-full items-center justify-center space-x-2 overflow-hidden rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm font-semibold text-emerald-400 transition-all hover:bg-emerald-500/20"
        >
          <Sparkles className="h-4 w-4" />
          <span>Ask Lexikaun</span>
        </button>

        {/* Secondary Nav */}
        <div className="space-y-1">
          <button
            onClick={onOpenSearch}
            className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium text-slate-400 transition-colors hover:bg-[#121214] hover:text-slate-200"
          >
            <div className="flex items-center space-x-3">
              <Search className="h-4 w-4" />
              <span>Search</span>
            </div>
            <kbd className="rounded border border-[#27272a] bg-[#09090b] px-1.5 py-0.5 font-mono text-[9px]">
              ⌘K
            </kbd>
          </button>
          
          <button
            onClick={onOpenSettings}
            className="flex w-full items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-400 transition-colors hover:bg-[#121214] hover:text-slate-200"
          >
            <Sliders className="h-4 w-4" />
            <span>Settings</span>
          </button>
        </div>

        {/* User Profile */}
        <div className="pt-2">
          <button
            onClick={onOpenAuth}
            className="flex w-full items-center space-x-3 rounded-xl border border-[#27272a] bg-[#121214] p-2 text-left transition-colors hover:border-[#3f3f46]"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500 text-xs font-bold text-black">
              {user?.displayName ? user.displayName.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="truncate text-sm font-semibold text-slate-200">
                {user?.displayName || 'Sign In'}
              </span>
              <span className="truncate text-xs text-slate-500">
                {user?.email || 'Offline Workspace'}
              </span>
            </div>
          </button>
        </div>
      </div>
    </aside>
  );
};
