import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Home,
  Music,
  Search,
  Settings,
  PanelLeftClose,
  PanelLeft,
  Sunrise,
  Sunset,
  Inbox,
  CalendarCheck,
  Award,
  Sparkles,
  Sliders,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    const saved = localStorage.getItem('lexikaun_sidebar_collapsed');
    return saved !== null ? JSON.parse(saved) : false;
  });

  useEffect(() => {
    localStorage.setItem('lexikaun_sidebar_collapsed', JSON.stringify(collapsed));
  }, [collapsed]);

  const handleTriggerRitual = (ritualName: string) => {
    window.dispatchEvent(new CustomEvent('lexikaun-trigger-ritual', { detail: { ritual: ritualName } }));
  };

  const primaryViews = [
    { to: '/home', label: 'Home Planner', icon: Home },
    {
      to: '#backlog',
      label: 'Backlog',
      icon: Inbox,
      onClick: () => handleTriggerRitual('backlog'),
    },
  ];

  const dailyRituals = [
    {
      label: 'Daily Planning',
      icon: Sunrise,
      onClick: () => handleTriggerRitual('daily-planning'),
      color: 'text-red-main',
    },
    {
      label: 'Daily Shutdown',
      icon: Sunset,
      onClick: () => handleTriggerRitual('daily-shutdown'),
      color: 'text-amber-500',
    },
    {
      label: 'Highlights',
      icon: Award,
      onClick: () => handleTriggerRitual('highlights'),
      color: 'text-yellow-400',
    },
  ];

  const weeklyRituals = [
    {
      label: 'Weekly Planning',
      icon: CalendarCheck,
      onClick: () => handleTriggerRitual('weekly-planning'),
      color: 'text-blue-400',
    },
    {
      label: 'Weekly Review',
      icon: Sparkles,
      onClick: () => handleTriggerRitual('weekly-review'),
      color: 'text-purple-400',
    },
  ];

  const musicNavItems = [
    { to: '/music', label: 'Beats & Projects', icon: Music },
    { to: '/music/finder', label: 'Key & BPM Finder', icon: Sliders },
  ];

  return (
    <aside
      className={`h-screen flex flex-col bg-bg-main border-r border-border-main/50 transition-all duration-200 ease-in-out shrink-0 select-none ${
        collapsed ? 'w-16' : 'w-60'
      }`}
    >
      {/* Sidebar Header */}
      <div
        className={`h-12 flex items-center border-b border-border-main/50 px-3.5 ${
          collapsed ? 'justify-center' : 'justify-between'
        }`}
      >
        {!collapsed && (
          <div className="flex items-center gap-2.5 pl-1.5 overflow-hidden">
            <div className="w-5 h-5 rounded bg-surface hairline-border flex items-center justify-center text-[10px] font-mono font-medium text-text-main shrink-0">
              LX
            </div>
            <span className="text-xs font-medium tracking-wider uppercase text-text-main truncate">
              Lexikaun
            </span>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className="p-1.5 rounded-md hover:bg-surface text-text-secondary hover:text-text-main transition-colors cursor-pointer"
        >
          {collapsed ? <PanelLeft className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation Sections */}
      <nav className="flex-1 py-3 px-2 space-y-4 overflow-y-auto">
        {/* 1. Primary Views */}
        <div className="space-y-0.5">
          <div
            className={`px-2.5 pb-1 text-[10px] uppercase font-mono tracking-wider text-text-secondary ${
              collapsed ? 'text-center' : ''
            }`}
          >
            {!collapsed ? 'Views' : '•'}
          </div>
          {primaryViews.map((item) => {
            const Icon = item.icon;
            if (item.onClick) {
              return (
                <button
                  key={item.label}
                  type="button"
                  onClick={item.onClick}
                  title={collapsed ? item.label : undefined}
                  className={`w-full flex items-center rounded-md text-xs font-normal text-text-secondary hover:text-text-main hover:bg-surface/50 transition-colors cursor-pointer ${
                    collapsed ? 'justify-center h-8' : 'gap-2.5 px-2.5 py-1.5 text-left'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </button>
              );
            }
            return (
              <NavLink
                key={item.to}
                to={item.to}
                title={collapsed ? item.label : undefined}
                className={({ isActive }) =>
                  `flex items-center rounded-md text-xs font-normal transition-colors cursor-pointer ${
                    collapsed ? 'justify-center h-8' : 'gap-2.5 px-2.5 py-1.5'
                  } ${
                    isActive
                      ? 'text-text-main bg-surface font-medium'
                      : 'text-text-secondary hover:text-text-main hover:bg-surface/50'
                  }`
                }
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                {!collapsed && <span className="truncate">{item.label}</span>}
              </NavLink>
            );
          })}
        </div>

        {/* 2. Daily Rituals */}
        <div className="space-y-0.5">
          <div
            className={`px-2.5 pb-1 text-[10px] uppercase font-mono tracking-wider text-text-secondary ${
              collapsed ? 'text-center' : ''
            }`}
          >
            {!collapsed ? 'Daily Rituals' : '•'}
          </div>
          {dailyRituals.map((r) => {
            const Icon = r.icon;
            return (
              <button
                key={r.label}
                type="button"
                onClick={r.onClick}
                title={collapsed ? r.label : undefined}
                className={`w-full flex items-center rounded-md text-xs font-normal text-text-secondary hover:text-text-main hover:bg-surface/50 transition-colors cursor-pointer group ${
                  collapsed ? 'justify-center h-8' : 'gap-2.5 px-2.5 py-1.5 text-left'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 shrink-0 ${r.color}`} />
                {!collapsed && <span className="truncate">{r.label}</span>}
              </button>
            );
          })}
        </div>

        {/* 3. Weekly Rituals */}
        <div className="space-y-0.5">
          <div
            className={`px-2.5 pb-1 text-[10px] uppercase font-mono tracking-wider text-text-secondary ${
              collapsed ? 'text-center' : ''
            }`}
          >
            {!collapsed ? 'Weekly Rituals' : '•'}
          </div>
          {weeklyRituals.map((r) => {
            const Icon = r.icon;
            return (
              <button
                key={r.label}
                type="button"
                onClick={r.onClick}
                title={collapsed ? r.label : undefined}
                className={`w-full flex items-center rounded-md text-xs font-normal text-text-secondary hover:text-text-main hover:bg-surface/50 transition-colors cursor-pointer group ${
                  collapsed ? 'justify-center h-8' : 'gap-2.5 px-2.5 py-1.5 text-left'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 shrink-0 ${r.color}`} />
                {!collapsed && <span className="truncate">{r.label}</span>}
              </button>
            );
          })}
        </div>

        {/* 4. Music Studio */}
        <div className="space-y-0.5">
          <div
            className={`px-2.5 pb-1 text-[10px] uppercase font-mono tracking-wider text-music-accent/80 ${
              collapsed ? 'text-center' : ''
            }`}
          >
            {!collapsed ? 'Music Studio' : '•'}
          </div>
          {musicNavItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              title={collapsed ? item.label : undefined}
              className={({ isActive }) =>
                `flex items-center rounded-md text-xs font-normal transition-colors cursor-pointer ${
                  collapsed ? 'justify-center h-8' : 'gap-2.5 px-2.5 py-1.5'
                } ${
                  isActive || (item.to === '/music' && location.pathname === '/music')
                    ? 'text-music-accent bg-surface font-medium'
                    : 'text-text-secondary hover:text-music-accent hover:bg-surface/50'
                }`
              }
            >
              <item.icon className="w-3.5 h-3.5 shrink-0" />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </NavLink>
          ))}
        </div>
      </nav>

      {/* Bottom Utility Navigation */}
      <div className="p-2 border-t border-border-main/50 space-y-0.5">
        <NavLink
          to="/search"
          title={collapsed ? 'Search' : undefined}
          className={({ isActive }) =>
            `flex items-center rounded-md text-xs font-normal transition-colors cursor-pointer ${
              collapsed ? 'justify-center h-8 w-full' : 'gap-2.5 px-2.5 py-1.5'
            } ${
              isActive
                ? 'text-text-main bg-surface font-medium'
                : 'text-text-secondary hover:text-text-main hover:bg-surface/50'
            }`
          }
        >
          <Search className="w-3.5 h-3.5 shrink-0" />
          {!collapsed && <span className="truncate">Search</span>}
        </NavLink>
        <NavLink
          to="/settings"
          title={collapsed ? 'Settings' : undefined}
          className={({ isActive }) =>
            `flex items-center rounded-md text-xs font-normal transition-colors cursor-pointer ${
              collapsed ? 'justify-center h-8 w-full' : 'gap-2.5 px-2.5 py-1.5'
            } ${
              isActive
                ? 'text-text-main bg-surface font-medium'
                : 'text-text-secondary hover:text-text-main hover:bg-surface/50'
            }`
          }
        >
          <Settings className="w-3.5 h-3.5 shrink-0" />
          {!collapsed && <span className="truncate">Settings</span>}
        </NavLink>
      </div>
    </aside>
  );
};
