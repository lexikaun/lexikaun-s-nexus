import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';

// Pages
import { Home } from './pages/Home';
import { MusicBeats } from './pages/MusicBeats';
import { KeyBpmFinder } from './pages/KeyBpmFinder';
import { TapTempo } from './pages/TapTempo';
import { Playlists } from './pages/Playlists';
import { Search } from './pages/Search';
import { Settings } from './pages/Settings';

const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<AppLayout />}>
        {/* Root and Home */}
        <Route index element={<Navigate to="/home" replace />} />
        <Route path="home" element={<Home />} />

        {/* Music Studio (Untouched) */}
        <Route path="music" element={<MusicBeats />} />
        <Route path="music/finder" element={<KeyBpmFinder />} />
        <Route path="music/tap-tempo" element={<TapTempo />} />
        <Route path="music/playlists" element={<Playlists />} />

        {/* Redirects for legacy Personal & Professional routes */}
        <Route path="personal" element={<Navigate to="/home" replace />} />
        <Route path="personal/*" element={<Navigate to="/home" replace />} />
        <Route path="professional" element={<Navigate to="/home" replace />} />
        <Route path="professional/*" element={<Navigate to="/home" replace />} />

        {/* Utility */}
        <Route path="search" element={<Search />} />
        <Route path="settings" element={<Settings />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/home" replace />} />
      </Route>
    </Routes>
  );
};

export default App;

