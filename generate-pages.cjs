const fs = require('fs');
const path = require('path');

const pages = [
  'Landing',
  'ProfessionalToday',
  'ProfessionalPlanner',
  'ProfessionalGoals',
  'MusicBeats',
  'KeyBpmFinder',
  'TapTempo',
  'Playlists',
  'PersonalToday',
  'PersonalPlanner',
  'PersonalGoals',
  'PersonalHabits',
  'Search',
  'Settings',
  'Login'
];

const dir = path.join(__dirname, 'src', 'pages');

pages.forEach(page => {
  const content = `import React from 'react';

export const ${page}: React.FC = () => {
  return (
    <div>
      <h1 className="text-xl font-medium mb-4">${page}</h1>
      <p className="text-text-secondary text-sm">This is a stub for the ${page} page.</p>
    </div>
  );
};
`;
  fs.writeFileSync(path.join(dir, `${page}.tsx`), content);
});

console.log('Pages created successfully.');
