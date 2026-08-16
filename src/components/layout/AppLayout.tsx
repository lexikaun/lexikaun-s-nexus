import React from 'react';
import { Outlet, useLocation, NavLink } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { useAuth } from '../../context/AuthContext';
import { LogOut } from 'lucide-react';

export const AppLayout: React.FC = () => {
  const location = useLocation();
  const { user, logout } = useAuth();

  const getSubNav = () => {
    if (location.pathname.startsWith('/music')) {
      return [
        { label: 'Beats Catalog', path: '/music' },
        { label: 'Key & BPM Finder', path: '/music/finder' },
        { label: 'Tap Tempo', path: '/music/tap-tempo' },
        { label: 'Playlists', path: '/music/playlists' },
      ];
    }
    return null;
  };

  const subNav = getSubNav();
  const isMusic = location.pathname.startsWith('/music');
  const isHome = location.pathname.startsWith('/home') || location.pathname === '/';

  const getSectionTitle = () => {
    if (isHome) return 'Home';
    if (isMusic) return 'Music Studio';
    if (location.pathname.startsWith('/search')) return 'Search';
    if (location.pathname.startsWith('/settings')) return 'Settings';
    return 'Lexikaun';
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-bg-main text-text-main">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="h-14 border-b border-border-main/50 px-6 flex items-center justify-between shrink-0 select-none bg-bg-main">
          <div className="flex items-center gap-6">
            <span className="text-xs uppercase tracking-wider text-text-secondary font-medium">
              {getSectionTitle()}
            </span>

            {/* Music Subnav Tabs (Untouched) */}
            {subNav && (
              <div className="flex items-center gap-1">
                {subNav.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    end={item.path === '/music'}
                    className={({ isActive }) =>
                      `px-3 py-1 text-xs rounded-md transition-colors ${
                        isActive
                          ? 'text-music-accent bg-surface font-medium'
                          : 'text-text-secondary hover:text-main'
                      }`
                    }
                  >
                    {item.label}
                  </NavLink>
                ))}
              </div>
            )}
          </div>

          {/* User profile */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-xs text-text-secondary">
              <div className="w-6 h-6 rounded-full bg-surface hairline-border flex items-center justify-center text-text-main text-[11px]">
                {user?.displayName ? user.displayName.charAt(0).toUpperCase() : 'P'}
              </div>
              <span className="max-w-[120px] truncate">{user?.displayName || 'Producer'}</span>
            </div>
            <button
              onClick={() => logout()}
              title="Sign Out"
              className="p-1.5 rounded-md hover:bg-surface text-text-secondary hover:text-red-main transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Content Area: Unconstrained full-width for Home workspace, max-w-4xl for settings/utility */}
        <main className="flex-1 overflow-hidden flex flex-col min-h-0">
          {isHome ? (
            <div className="w-full h-full flex flex-col min-h-0 overflow-hidden">
              <Outlet />
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto">
              <div className="w-full max-w-4xl mx-auto px-8 py-6">
                <Outlet />
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

