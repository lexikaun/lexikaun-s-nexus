import React from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import { Shield, Palette, Database, LogOut } from 'lucide-react';

export const Settings: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-normal tracking-tight text-ink">
          Settings
        </h1>
        <p className="text-xs text-ink-muted mt-1 font-sans">
          Personal preferences and system environment configuration.
        </p>
      </div>

      {/* Account Info */}
      <Card className="p-5 bg-surface border border-hairline rounded-2xl shadow-[0_12px_32px_rgba(0,0,0,0.35)]">
        <div className="flex items-center gap-2 mb-3 text-[10px] font-mono font-medium text-ink-muted uppercase tracking-wider">
          <Shield className="w-3.5 h-3.5 text-accent" /> Account & Identity
        </div>
        <div className="space-y-2.5 text-xs font-sans">
          <div className="flex justify-between py-2 border-b border-hairline/60">
            <span className="text-ink-muted">Display Name</span>
            <span className="text-ink font-medium">{user?.displayName || 'Producer / Lexikaun'}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-hairline/60">
            <span className="text-ink-muted">Email</span>
            <span className="text-ink font-mono text-[11px]">{user?.email || 'guest@lexikaun.local'}</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-ink-muted">Account Scope</span>
            <span className="text-accent font-mono text-[11px]">Single-user isolated</span>
          </div>
        </div>
      </Card>

      {/* Design System Spec */}
      <Card className="p-5 bg-surface border border-hairline rounded-2xl shadow-[0_12px_32px_rgba(0,0,0,0.35)]">
        <div className="flex items-center gap-2 mb-3 text-[10px] font-mono font-medium text-ink-muted uppercase tracking-wider">
          <Palette className="w-3.5 h-3.5 text-accent" /> Design System (Floating Notecards)
        </div>
        <div className="space-y-2 text-xs text-ink-muted leading-relaxed font-sans">
          <div className="flex items-center justify-between">
            <span className="text-ink font-medium">Tactile Notecard Grammar</span>
            <span className="px-2 py-0.5 rounded-[6px] bg-canvas border border-accent/30 text-accent font-mono text-[10px]">
              Active v2
            </span>
          </div>
          <p>
            Palette tokens: Canvas (<span className="font-mono text-ink">#1E1C22</span>), Surface (<span className="font-mono text-ink">#27242C</span>), and Accent (<span className="font-mono text-accent">#D98E4A</span>). Editorial Fraunces titles with hardware IBM Plex Mono readouts.
          </p>
        </div>
      </Card>

      {/* Storage & DB Status */}
      <Card className="p-5 bg-surface border border-hairline rounded-2xl shadow-[0_12px_32px_rgba(0,0,0,0.35)]">
        <div className="flex items-center gap-2 mb-3 text-[10px] font-mono font-medium text-ink-muted uppercase tracking-wider">
          <Database className="w-3.5 h-3.5 text-accent" /> Architecture
        </div>
        <div className="space-y-2.5 text-xs text-ink-muted font-sans">
          <div className="flex justify-between py-1.5 border-b border-hairline/60">
            <span>Database</span>
            <span className="text-ink font-mono text-[11px]">Firebase Firestore (Realtime sync)</span>
          </div>
          <div className="flex justify-between py-1.5 border-b border-hairline/60">
            <span>Audio Storage</span>
            <span className="text-ink font-mono text-[11px]">Firebase Storage / IndexedDB</span>
          </div>
          <div className="flex justify-between py-1.5">
            <span>Audio Analysis Engine</span>
            <span className="text-accent font-mono text-[11px]">essentia.js WebAssembly (Isolated Worker)</span>
          </div>
        </div>
      </Card>

      {/* Logout Action */}
      <div className="pt-2">
        <button
          type="button"
          onClick={() => logout()}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-surface hover:bg-surface-hover border border-hairline text-red-400 hover:text-red-300 text-xs font-sans font-medium transition-all cursor-pointer shadow-sm"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out of Lexikaun</span>
        </button>
      </div>
    </div>
  );
};
