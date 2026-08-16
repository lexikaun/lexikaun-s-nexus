import React from 'react';
import { TimeBlockPlanner } from '../components/planner/TimeBlockPlanner';

export const ProfessionalPlanner: React.FC = () => {
  return (
    <TimeBlockPlanner
      space="professional"
      title="Professional Planner"
      subtitle="Day & week time-blocking canvas (Sunsama/Routine model)"
    />
  );
};

