import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';

// Pages
import { Landing } from './pages/Landing';
import { ProfessionalToday } from './pages/ProfessionalToday';
import { ProfessionalPlanner } from './pages/ProfessionalPlanner';
import { ProfessionalGoals } from './pages/ProfessionalGoals';
import { MusicBeats } from './pages/MusicBeats';
import { KeyBpmFinder } from './pages/KeyBpmFinder';
import { TapTempo } from './pages/TapTempo';
import { Playlists } from './pages/Playlists';
import { PersonalToday } from './pages/PersonalToday';
import { PersonalPlanner } from './pages/PersonalPlanner';
import { PersonalGoals } from './pages/PersonalGoals';
import { PersonalHabits } from './pages/PersonalHabits';
import { Search } from './pages/Search';
import { Settings } from './pages/Settings';

const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<AppLayout />}>
        <Route index element={<Landing />} />
        
        {/* Professional */}
        <Route path="professional" element={<ProfessionalToday />} />
        <Route path="professional/planner" element={<ProfessionalPlanner />} />
        <Route path="professional/goals" element={<ProfessionalGoals />} />
        
        {/* Music */}
        <Route path="music" element={<MusicBeats />} />
        <Route path="music/finder" element={<KeyBpmFinder />} />
        <Route path="music/tap-tempo" element={<TapTempo />} />
        <Route path="music/playlists" element={<Playlists />} />
        
        {/* Personal */}
        <Route path="personal" element={<PersonalToday />} />
        <Route path="personal/planner" element={<PersonalPlanner />} />
        <Route path="personal/goals" element={<PersonalGoals />} />
        <Route path="personal/habits" element={<PersonalHabits />} />
        
        {/* Other */}
        <Route path="search" element={<Search />} />
        <Route path="settings" element={<Settings />} />
      </Route>
    </Routes>
  );
};

export default App;
