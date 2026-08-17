import React, { useState, useEffect } from 'react';
import { Outlet, useLocation, NavLink } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { useAuth } from '../../context/AuthContext';
import { LexikaunAssistant } from '../ai/LexikaunAssistant';
import { LogOut, Sparkles } from 'lucide-react';

export const AppLayout: React.FC = () => {
  const location = useLocation();
  const { user, logout } = useAuth();

  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [assistantPrompt, setAssistantPrompt] = useState('');

  useEffect(() => {
    const handleAiRitualEvent = (e: Event) => {
      const customEvent = e as CustomEvent<{ prompt: string }>;
      if (customEvent.detail?.prompt) {
        setAssistantPrompt(customEvent.detail.prompt);
        setIsAssistantOpen(true);
      }
    };

    window.addEventListener('lexikaun-trigger-ai-ritual', handleAiRitualEvent);
    return () => {
      window.removeEventListener('lexikaun-trigger-ai-ritual', handleAiRitualEvent);
    };
  }, []);

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
    if (isHome) return 'Planner';
    if (isMusic) return 'Music Studio';
    if (location.pathname.startsWith('/search')) return 'Search';
    if (location.pathname.startsWith('/settings')) return 'Settings';
    return 'Lexikaun';
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-canvas text-ink">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="h-12 border-b border-hairline/60 px-5 flex items-center justify-between shrink-0 select-none bg-canvas">
          <div className="flex items-center gap-5">
            <span className="font-display text-[13px] tracking-wide text-ink/90 font-normal">
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
                      `px-2.5 py-1 text-xs rounded-lg font-sans transition-all ${
                        isActive
                          ? 'text-accent bg-surface border border-hairline/80 font-medium shadow-sm'
                          : 'text-ink-muted hover:text-ink hover:bg-surface/40'
                      }`
                    }
                  >
                    {item.label}
                  </NavLink>
                ))}
              </div>
            )}
          </div>

          {/* Right Header Actions: Ask Lexikaun trigger & User profile */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => {
                setAssistantPrompt('');
                setIsAssistantOpen(true);
              }}
              title="Open AI Assistant"
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-surface/80 hover:bg-surface border border-hairline/80 text-ink-muted hover:text-ink text-xs font-sans transition-all cursor-pointer shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5 text-accent" />
              <span>Ask Lexikaun</span>
            </button>

            <div className="flex items-center gap-2 text-xs font-sans text-ink-muted pl-1">
              <div className="w-5 h-5 rounded-full bg-surface border border-hairline flex items-center justify-center text-ink text-[10px] font-mono">
                {user?.displayName ? user.displayName.charAt(0).toUpperCase() : 'P'}
              </div>
              <span className="max-w-[110px] truncate text-ink text-[11.5px]">{user?.displayName || 'Producer'}</span>
            </div>

            <button
              onClick={() => logout()}
              title="Sign Out"
              className="p-1 rounded-lg hover:bg-surface text-ink-muted/70 hover:text-red-400 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
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

      {/* Global AI Assistant Drawer */}
      <LexikaunAssistant
        isOpen={isAssistantOpen}
        onClose={() => {
          setIsAssistantOpen(false);
          setAssistantPrompt('');
        }}
        initialPrompt={assistantPrompt}
      />
    </div>
  );
};
