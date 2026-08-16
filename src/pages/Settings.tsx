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
        <h1 className="text-xl font-medium tracking-tight text-text-main">Settings</h1>
        <p className="text-xs text-text-secondary mt-1">
          Personal preferences and system environment configuration.
        </p>
      </div>

      {/* Account Info */}
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-3 text-xs font-medium text-text-secondary uppercase tracking-wider">
          <Shield className="w-3.5 h-3.5" /> Account & Identity
        </div>
        <div className="space-y-2 text-xs">
          <div className="flex justify-between py-2 border-b border-border-main/50">
            <span className="text-text-secondary">Display Name</span>
            <span className="text-text-main font-normal">{user?.displayName || 'Producer / Lexikaun'}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-border-main/50">
            <span className="text-text-secondary">Email</span>
            <span className="text-text-main">{user?.email || 'guest@lexikaun.local'}</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-text-secondary">Account Scope</span>
            <span className="text-text-main font-mono text-xs">Single-user isolated</span>
          </div>
        </div>
      </Card>

      {/* Design System Locked Spec */}
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-3 text-xs font-medium text-text-secondary uppercase tracking-wider">
          <Palette className="w-3.5 h-3.5" /> Design System (Locked)
        </div>
        <div className="space-y-2 text-xs text-text-secondary leading-relaxed">
          <div className="flex items-center justify-between">
            <span className="text-text-main font-normal">Theme: Option E ("Creative Producer")</span>
            <span className="px-2 py-0.5 rounded bg-bg-main hairline-border text-red-main">Locked</span>
          </div>
          <p>
            Standard palette: `#0B0B0A` background with `#E4423A` red accent. Music section exclusively utilizes `#FF5A46` warmer accent. No bold weights app-wide.
          </p>
        </div>
      </Card>

      {/* Storage & DB Status */}
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-3 text-xs font-medium text-text-secondary uppercase tracking-wider">
          <Database className="w-3.5 h-3.5" /> Architecture
        </div>
        <div className="space-y-2 text-xs text-text-secondary">
          <div className="flex justify-between">
            <span>Database</span>
            <span className="text-text-main font-mono">Firebase Firestore (Additive schema)</span>
          </div>
          <div className="flex justify-between">
            <span>Audio Storage</span>
            <span className="text-text-main font-mono">Firebase Storage (users/{'{uid}'}/beats/...)</span>
          </div>
          <div className="flex justify-between">
            <span>Audio Analysis Engine</span>
            <span className="text-text-main font-mono">essentia.js WebAssembly (Client-side)</span>
          </div>
        </div>
      </Card>

      {/* Logout Action */}
      <div className="pt-2">
        <Button variant="danger" onClick={() => logout()} className="w-full gap-2 text-xs">
          <LogOut className="w-4 h-4" />
          <span>Sign Out of Lexikaun</span>
        </Button>
      </div>
    </div>
  );
};
