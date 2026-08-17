import React, { useState, useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  Home,
  Calendar,
  Zap,
  Music,
  Search,
  Settings,
  PanelLeftClose,
  PanelLeft,
  Sliders,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    const saved = localStorage.getItem('lexikaun_sidebar_collapsed');
    return saved !== null ? JSON.parse(saved) : false;
  });

  useEffect(() => {
    localStorage.setItem('lexikaun_sidebar_collapsed', JSON.stringify(collapsed));
  }, [collapsed]);

  const handleGoToToday = () => {
    if (location.pathname !== '/home') {
      navigate('/home?view=today');
    } else {
      window.dispatchEvent(new CustomEvent('lexikaun-jump-today'));
    }
  };

  const handleGoToFocus = () => {
    window.dispatchEvent(new CustomEvent('lexikaun-toggle-focus'));
  };

  // Primary destinations
  const primaryDestinations = [
    { to: '/home', label: 'Home', icon: Home },
    {
      to: '#today',
      label: 'Today',
      icon: Calendar,
      onClick: handleGoToToday,
    },
    {
      to: '#focus',
      label: 'Focus',
      icon: Zap,
      onClick: handleGoToFocus,
    },
  ];

  // Music Studio navigation (untouched)
  const musicNavItems = [
    { to: '/music', label: 'Beats & Projects', icon: Music },
    { to: '/music/finder', label: 'Key & BPM Finder', icon: Sliders },
  ];

  return (
    <aside
      className={`h-screen flex flex-col bg-canvas border-r border-hairline/60 transition-all duration-200 ease-in-out shrink-0 select-none ${
        collapsed ? 'w-14' : 'w-56'
      }`}
    >
      {/* 1. Sidebar Header */}
      <div
        className={`h-12 flex items-center border-b border-hairline/60 px-3 ${
          collapsed ? 'justify-center' : 'justify-between'
        }`}
      >
        {!collapsed && (
          <div className="flex items-center gap-2 pl-1 overflow-hidden">
            <div className="w-5 h-5 rounded-[6px] bg-surface border border-hairline flex items-center justify-center text-[10px] font-mono font-medium text-accent shrink-0 shadow-sm">
              LX
            </div>
            <span className="font-display text-[13px] font-normal tracking-wide text-ink truncate">
              Lexikaun
            </span>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className="p-1.5 rounded-lg hover:bg-surface text-ink-muted hover:text-ink transition-colors cursor-pointer"
        >
          {collapsed ? <PanelLeft className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
        </button>
      </div>

      {/* 2. Navigation Sections */}
      <nav className="flex-1 py-3 px-2 space-y-4 overflow-y-auto">
        {/* Core Destinations: Home, Today, Focus */}
        <div className="space-y-0.5">
          <div
            className={`px-2.5 pb-1 text-[9px] uppercase font-mono tracking-widest text-ink-muted/60 ${
              collapsed ? 'text-center' : ''
            }`}
          >
            {!collapsed ? 'Workspace' : '•'}
          </div>
          {primaryDestinations.map((item) => {
            const Icon = item.icon;
            if (item.onClick) {
              return (
                <button
                  key={item.label}
                  type="button"
                  onClick={item.onClick}
                  title={collapsed ? item.label : undefined}
                  className={`w-full flex items-center rounded-xl text-xs font-sans text-ink-muted hover:text-ink hover:bg-surface/50 transition-all duration-150 cursor-pointer ${
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
                  `flex items-center rounded-xl text-xs font-sans transition-all duration-150 cursor-pointer ${
                    collapsed ? 'justify-center h-8' : 'gap-2.5 px-2.5 py-1.5'
                  } ${
                    isActive
                      ? 'text-ink bg-surface border border-hairline/80 font-medium shadow-sm'
                      : 'text-ink-muted hover:text-ink hover:bg-surface/50'
                  }`
                }
              >
                <Icon className="w-3.5 h-3.5 shrink-0 text-accent" />
                {!collapsed && <span className="truncate">{item.label}</span>}
              </NavLink>
            );
          })}
        </div>

        {/* Music Studio (Untouched) */}
        <div className="space-y-0.5">
          <div
            className={`px-2.5 pb-1 text-[9px] uppercase font-mono tracking-widest text-accent/80 ${
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
                `flex items-center rounded-xl text-xs font-sans transition-all duration-150 cursor-pointer ${
                  collapsed ? 'justify-center h-8' : 'gap-2.5 px-2.5 py-1.5'
                } ${
                  isActive || (item.to === '/music' && location.pathname === '/music')
                    ? 'text-accent bg-surface border border-hairline/80 font-medium shadow-sm'
                    : 'text-ink-muted hover:text-accent hover:bg-surface/50'
                }`
              }
            >
              <item.icon className="w-3.5 h-3.5 shrink-0 text-accent" />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </NavLink>
          ))}
        </div>
      </nav>

      {/* 3. Bottom Utility Navigation */}
      <div className="p-2 border-t border-hairline/60 space-y-0.5">
        <NavLink
          to="/search"
          title={collapsed ? 'Search' : undefined}
          className={({ isActive }) =>
            `flex items-center rounded-xl text-xs font-sans transition-all duration-150 cursor-pointer ${
              collapsed ? 'justify-center h-8 w-full' : 'gap-2.5 px-2.5 py-1.5'
            } ${
              isActive
                ? 'text-ink bg-surface border border-hairline/80 font-medium shadow-sm'
                : 'text-ink-muted hover:text-ink hover:bg-surface/50'
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
            `flex items-center rounded-xl text-xs font-sans transition-all duration-150 cursor-pointer ${
              collapsed ? 'justify-center h-8 w-full' : 'gap-2.5 px-2.5 py-1.5'
            } ${
              isActive
                ? 'text-ink bg-surface border border-hairline/80 font-medium shadow-sm'
                : 'text-ink-muted hover:text-ink hover:bg-surface/50'
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
