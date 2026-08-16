import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { MessageSquare, Briefcase, Music, User, Search, Settings, PanelLeftClose, PanelLeft } from 'lucide-react';

export const Sidebar: React.FC = () => {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    const saved = localStorage.getItem('lexikaun_sidebar_collapsed');
    return saved !== null ? JSON.parse(saved) : false;
  });

  useEffect(() => {
    localStorage.setItem('lexikaun_sidebar_collapsed', JSON.stringify(collapsed));
  }, [collapsed]);

  const navItems = [
    { to: '/', label: 'Assistant', icon: MessageSquare, end: true },
    { to: '/professional', label: 'Professional', icon: Briefcase },
    { to: '/music', label: 'Music Studio', icon: Music, isMusic: true },
    { to: '/personal', label: 'Personal', icon: User },
  ];

  const bottomItems = [
    { to: '/search', label: 'Search', icon: Search },
    { to: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside
      className={`h-screen flex flex-col bg-bg-main border-r border-border-main/50 transition-all duration-200 ease-in-out shrink-0 select-none ${
        collapsed ? 'w-16' : 'w-60'
      }`}
    >
      {/* Sidebar Header with Brand & Collapse Toggle */}
      <div className={`h-14 flex items-center border-b border-border-main/50 px-3.5 ${collapsed ? 'justify-center' : 'justify-between'}`}>
        {!collapsed && (
          <div className="flex items-center gap-2.5 pl-1.5 overflow-hidden">
            <div className="w-6 h-6 rounded bg-surface hairline-border flex items-center justify-center text-xs font-mono font-medium text-text-main shrink-0">
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
          className="p-2 rounded-md hover:bg-surface text-text-secondary hover:text-text-main transition-colors cursor-pointer"
        >
          {collapsed ? <PanelLeft className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
        </button>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 py-4 px-2 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            title={collapsed ? item.label : undefined}
            className={({ isActive }) => {
              const base = 'relative flex items-center rounded-md text-xs font-normal transition-colors cursor-pointer group ';
              if (item.isMusic) {
                return (
                  base +
                  (collapsed ? 'justify-center h-10 w-full ' : 'gap-3 px-3 py-2.5 ') +
                  (isActive
                    ? 'text-music-accent bg-surface font-medium'
                    : 'text-text-secondary hover:text-music-accent hover:bg-surface/50')
                );
              }
              return (
                base +
                (collapsed ? 'justify-center h-10 w-full ' : 'gap-3 px-3 py-2.5 ') +
                (isActive
                  ? 'text-text-main bg-surface font-medium'
                  : 'text-text-secondary hover:text-text-main hover:bg-surface/50')
              );
            }}
          >
            {({ isActive }) => {
              const Icon = item.icon;
              return (
                <>
                  <Icon className={`w-4 h-4 shrink-0 ${item.isMusic && isActive ? 'text-music-accent' : ''}`} />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                  {isActive && (
                    <div
                      className={`absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 rounded-r ${
                        item.isMusic ? 'bg-music-accent' : 'bg-text-main'
                      }`}
                    />
                  )}
                </>
              );
            }}
          </NavLink>
        ))}
      </nav>

      {/* Bottom Utility Navigation */}
      <div className="p-2 border-t border-border-main/50 space-y-1">
        {bottomItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            title={collapsed ? item.label : undefined}
            className={({ isActive }) =>
              `relative flex items-center rounded-md text-xs font-normal transition-colors cursor-pointer group ${
                collapsed ? 'justify-center h-10 w-full' : 'gap-3 px-3 py-2.5'
              } ${
                isActive
                  ? 'text-text-main bg-surface font-medium'
                  : 'text-text-secondary hover:text-text-main hover:bg-surface/50'
              }`
            }
          >
            {({ isActive }) => {
              const Icon = item.icon;
              return (
                <>
                  <Icon className="w-4 h-4 shrink-0" />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                  {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 rounded-r bg-text-main" />
                  )}
                </>
              );
            }}
          </NavLink>
        ))}
      </div>
    </aside>
  );
};
